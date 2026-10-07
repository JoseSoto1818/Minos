-- Sprint 1 only. Financial entities are intentionally deferred.
create type public.company_role as enum ('owner', 'admin', 'accountant', 'viewer');
create type public.business_type as enum ('products', 'services', 'both');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text check (char_length(display_name) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  base_currency text not null check (base_currency in ('COP','USD','EUR','MXN','PEN','CLP','ARS','BRL','CRC','UYU','GTQ','BOB','DOP','HNL','PYG','NIO')),
  timezone text not null default 'America/Bogota',
  industry text not null check (char_length(industry) between 2 and 100),
  business_type public.business_type not null,
  has_locations boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.company_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, user_id)
);
create unique index one_owner_per_company on public.company_memberships(company_id) where role = 'owner';
create index membership_user on public.company_memberships(user_id, company_id);
create table public.company_preferences (
  company_id uuid primary key references public.companies(id) on delete cascade,
  analysis_interests text[] not null default array['sales','expenses','cash'],
  onboarding_completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (analysis_interests <@ array['sales','expenses','cash','receivables','payables','goals']::text[])
);
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  created_by uuid not null references auth.users(id),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index active_location_name on public.locations(company_id, lower(trim(name))) where archived_at is null;
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  user_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id uuid not null,
  previous_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);
create index audit_company_time on public.audit_events(company_id, created_at desc);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.company_role_for(target uuid) returns public.company_role
language sql stable security definer set search_path = '' as $$
  select role from public.company_memberships where company_id = target and user_id = (select auth.uid());
$$;
create function private.shares_company(target_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.company_memberships me
    join public.company_memberships them on me.company_id = them.company_id
    where me.user_id = (select auth.uid()) and them.user_id = target_user);
$$;
revoke all on function private.company_role_for(uuid), private.shares_company(uuid) from public;
grant execute on function private.company_role_for(uuid), private.shares_company(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;
alter table public.company_preferences enable row level security;
alter table public.locations enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.shares_company(id));
create policy profiles_edit on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy companies_read on public.companies for select to authenticated
  using (private.company_role_for(id) is not null);
create policy companies_edit on public.companies for update to authenticated
  using (private.company_role_for(id) in ('owner','admin'))
  with check (private.company_role_for(id) in ('owner','admin'));
create policy memberships_read on public.company_memberships for select to authenticated
  using (private.company_role_for(company_id) is not null);
create policy preferences_read on public.company_preferences for select to authenticated
  using (private.company_role_for(company_id) is not null);
create policy preferences_edit on public.company_preferences for update to authenticated
  using (private.company_role_for(company_id) in ('owner','admin'))
  with check (private.company_role_for(company_id) in ('owner','admin'));
create policy locations_read on public.locations for select to authenticated
  using (private.company_role_for(company_id) is not null);
create policy locations_add on public.locations for insert to authenticated
  with check (private.company_role_for(company_id) in ('owner','admin') and created_by = (select auth.uid()));
create policy locations_edit on public.locations for update to authenticated
  using (private.company_role_for(company_id) in ('owner','admin'))
  with check (private.company_role_for(company_id) in ('owner','admin'));
create policy audit_read on public.audit_events for select to authenticated
  using (private.company_role_for(company_id) in ('owner','admin'));

-- Column grants prohibit changing tenant keys, owner, timestamps and audit history.
revoke all on public.profiles, public.companies, public.company_memberships,
  public.company_preferences, public.locations, public.audit_events from anon, authenticated;
grant select on public.profiles, public.companies, public.company_memberships,
  public.company_preferences, public.locations, public.audit_events to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant update(name, country_code, base_currency, timezone, industry, business_type, has_locations) on public.companies to authenticated;
grant update(analysis_interests) on public.company_preferences to authenticated;
grant insert(company_id, name, created_by) on public.locations to authenticated;
grant update(name, archived_at) on public.locations to authenticated;

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;
create function private.validate_company_timezone() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists(select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'Invalid timezone' using errcode = '22023';
  end if;
  return new;
end;
$$;
create trigger company_timezone before insert or update on public.companies for each row execute function private.validate_company_timezone();
do $$ declare t text; begin
  foreach t in array array['profiles','companies','company_memberships','company_preferences','locations'] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()', t);
  end loop;
end $$;

create function private.sync_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id,email) values (new.id, coalesce(new.email,''))
    on conflict(id) do update set email = excluded.email;
  return new;
end;
$$;
create trigger auth_profile after insert or update of email on auth.users for each row execute function private.sync_profile();

create function private.audit_mutation() returns trigger
language plpgsql security definer set search_path = '' as $$
declare tenant uuid; record_id uuid;
begin
  tenant := case when tg_table_name = 'companies' then (to_jsonb(new)->>'id')::uuid else (to_jsonb(new)->>'company_id')::uuid end;
  record_id := coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(new)->>'company_id')::uuid);
  insert into public.audit_events(company_id,user_id,action,entity,entity_id,previous_values,new_values)
    values (tenant, auth.uid(), lower(tg_op), tg_table_name, record_id,
      case when tg_op = 'UPDATE' then to_jsonb(old) else null end, to_jsonb(new));
  return new;
end;
$$;
do $$ declare t text; begin
  foreach t in array array['companies','company_memberships','company_preferences','locations'] loop
    execute format('create trigger audit_mutation after insert or update on public.%I for each row execute function private.audit_mutation()', t);
  end loop;
end $$;

-- Atomic onboarding prevents ownerless companies and partial setups.
create function public.create_company(
  company_name text, country text, currency text, company_timezone text,
  company_industry text, kind public.business_type, multiple_locations boolean,
  location_names text[] default '{}', interests text[] default array['sales','expenses','cash']
) returns uuid language plpgsql security definer set search_path = '' as $$
declare company_uuid uuid; location_name text; actor uuid := auth.uid();
begin
  if actor is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if coalesce(cardinality(location_names),0) > 10 then raise exception 'At most 10 initial locations' using errcode = '22023'; end if;
  if not multiple_locations and coalesce(cardinality(location_names),0) > 0 then raise exception 'Locations disabled' using errcode = '22023'; end if;
  insert into public.companies(name,country_code,base_currency,timezone,industry,business_type,has_locations,created_by)
    values(trim(company_name),country,currency,company_timezone,company_industry,kind,multiple_locations,actor)
    returning id into company_uuid;
  insert into public.company_memberships(company_id,user_id,role) values(company_uuid,actor,'owner');
  insert into public.company_preferences(company_id,analysis_interests) values(company_uuid,interests);
  foreach location_name in array coalesce(location_names,'{}') loop
    insert into public.locations(company_id,name,created_by) values(company_uuid,trim(location_name),actor);
  end loop;
  return company_uuid;
end;
$$;
revoke all on function public.create_company(text,text,text,text,text,public.business_type,boolean,text[],text[]) from public, anon;
grant execute on function public.create_company(text,text,text,text,text,public.business_type,boolean,text[],text[]) to authenticated;
revoke all on all functions in schema private from public;
