-- Sprint 2A: canonical records, linked balances, atomic writes and audit.
create table public.financial_transactions (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id),
 kind text not null check(kind in ('income','expense','receivable','payable','asset','loan')),
 date date not null, amount numeric(18,2) not null check(amount > 0),
 paid numeric(18,2) not null default 0 check(paid >= 0 and paid <= amount),
 currency text not null, description text not null check(length(trim(description)) between 1 and 200),
 category text not null, counterparty text not null default '' check(length(counterparty)<=200),
 location_id uuid references public.locations(id), notes text not null default '' check(length(notes)<=2000),
 due_date date, reference text not null default '' check(length(reference)<=200),
 details jsonb not null default '{}', closed_at timestamptz, paid_before_close numeric(18,2),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id, company_id), check(due_date is null or due_date >= date)
);
create index financial_company_date on public.financial_transactions(company_id,date);
create table public.receivables (
 transaction_id uuid primary key, company_id uuid not null references public.companies(id),
 foreign key(transaction_id,company_id) references public.financial_transactions(id,company_id) on delete cascade
);
create table public.payables (like public.receivables including all);
alter table public.payables add foreign key(transaction_id,company_id) references public.financial_transactions(id,company_id) on delete cascade;
create table public.assets (like public.receivables including all);
alter table public.assets add foreign key(transaction_id,company_id) references public.financial_transactions(id,company_id) on delete cascade;
create table public.loans (like public.receivables including all);
alter table public.loans add foreign key(transaction_id,company_id) references public.financial_transactions(id,company_id) on delete cascade;
-- Child entities reference the canonical record; no duplicated amount/concept.
do $$ declare t text; begin
 foreach t in array array['financial_transactions','receivables','payables','assets','loans'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('create policy tenant_read on public.%I for select to authenticated using(private.company_role_for(company_id) is not null)',t);
 end loop;
end $$;
create trigger touch_updated_at before update on public.financial_transactions for each row execute function private.touch_updated_at();
create function private.audit_financial() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.audit_events(company_id,user_id,action,entity,entity_id,previous_values,new_values)
 values(coalesce(new.company_id,old.company_id),auth.uid(),lower(tg_op),tg_table_name,coalesce(new.id,old.id),case when tg_op <> 'INSERT' then to_jsonb(old) end,case when tg_op <> 'DELETE' then to_jsonb(new) end);
 return coalesce(new,old);
end $$;
create trigger audit_financial after insert or update or delete on public.financial_transactions for each row execute function private.audit_financial();
revoke all on function private.audit_financial() from public;
create function public.save_financial(target uuid, payload jsonb, record_id uuid default null, expected_version timestamptz default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare r public.financial_transactions; c public.companies; old_record public.financial_transactions; result uuid; link_table text;
begin
 if coalesce(private.company_role_for(target)::text,'') not in ('owner','admin','accountant') then raise exception 'Not authorized' using errcode='42501'; end if;
 select * into strict c from public.companies where id=target;
 if record_id is null and payload ? 'currency' and payload->>'currency' is distinct from c.base_currency then raise exception 'Currency changed; reload' using errcode='40001'; end if;
 if record_id is not null then
 select * into old_record from public.financial_transactions where id=record_id and company_id=target for update;
 if not found or old_record.updated_at is distinct from expected_version then raise exception 'Record changed; reload' using errcode='40001'; end if;
 if old_record.closed_at is not null then raise exception 'Restore before editing' using errcode='22023'; end if;
 end if;
 if coalesce(payload->>'amount','') !~ '^\d{1,16}(\.\d{1,2})?$' or coalesce(payload->>'paid','') !~ '^\d{1,16}(\.\d{1,2})?$' then raise exception 'Invalid decimal amount' using errcode='22023'; end if;
 r.kind:=payload->>'kind'; r.date:=(payload->>'date')::date; r.amount:=(payload->>'amount')::numeric;
 r.paid:=(payload->>'paid')::numeric; r.description:=trim(payload->>'description'); r.category:=payload->>'category';
 if r.kind is null or r.amount is null or r.paid is null or r.date is null or r.description is null or r.category is null then raise exception 'Missing fields' using errcode='22023'; end if;
 if r.amount <> round(r.amount,2) or r.paid <> round(r.paid,2) or r.amount::text in ('NaN','Infinity','-Infinity') or r.paid::text in ('NaN','Infinity','-Infinity') then raise exception 'Invalid amount' using errcode='22023'; end if;
 if r.date < '1900-01-01'::date or r.date > '2100-12-31'::date then raise exception 'Invalid date' using errcode='22023'; end if;
 if record_id is not null and r.kind<>old_record.kind then raise exception 'Cannot change record kind' using errcode='22023'; end if;
 if (r.kind='income' and r.category not in ('product','service','other')) or (r.kind='expense' and r.category not in ('direct','operating','marketing','payroll','other')) then raise exception 'Invalid category' using errcode='22023'; end if;
 r.location_id:=nullif(payload->>'location_id','')::uuid;
 if r.location_id is not null and not exists(select 1 from public.locations where id=r.location_id and company_id=target and (archived_at is null or id=old_record.location_id)) then raise exception 'Invalid location' using errcode='42501'; end if;
 if r.location_id is not null and not c.has_locations and r.location_id is distinct from old_record.location_id then raise exception 'Locations disabled' using errcode='22023'; end if;
 r.details:=coalesce(payload->'details','{}');
 if r.kind='asset' then
 if coalesce(r.details->>'acquisition','') not in ('cash','installments','loan') then raise exception 'Invalid acquisition' using errcode='22023'; end if;
 if nullif(r.details->>'installments','') is not null and (r.details->>'installments')::int not between 1 and 1200 then raise exception 'Invalid installments' using errcode='22023'; end if;
 end if;
 if r.kind='loan' then
 if nullif(r.details->>'payment','') is not null and ((r.details->>'payment')::numeric < 0 or (r.details->>'payment')::numeric > 9999999999999999.99) then raise exception 'Invalid payment' using errcode='22023'; end if;
 if nullif(r.details->>'rate','') is not null and (r.details->>'rate')::numeric not between 0 and 100 then raise exception 'Invalid rate' using errcode='22023'; end if;
 if nullif(r.details->>'payment_day','') is not null and (r.details->>'payment_day')::int not between 1 and 31 then raise exception 'Invalid payment day' using errcode='22023'; end if;
 end if;
 if r.kind in ('receivable','payable','loan') and length(trim(coalesce(payload->>'counterparty','')))=0 then raise exception 'Counterparty required' using errcode='22023'; end if;
 insert into public.financial_transactions(id,company_id,kind,date,amount,paid,currency,description,category,counterparty,location_id,notes,due_date,reference,details,created_by,closed_at)
 values(coalesce(record_id,gen_random_uuid()),target,r.kind,r.date,r.amount,r.paid,coalesce(old_record.currency,c.base_currency),r.description,r.category,coalesce(payload->>'counterparty',''),r.location_id,coalesce(payload->>'notes',''),nullif(payload->>'due_date','')::date,coalesce(payload->>'reference',''),r.details,auth.uid(),case when r.paid=r.amount and (r.kind in ('receivable','payable') or exists(select 1 from public.receivables where transaction_id=record_id) or exists(select 1 from public.payables where transaction_id=record_id)) then now() end)
 on conflict(id) do update set date=excluded.date, amount=excluded.amount, paid=excluded.paid,description=excluded.description,category=excluded.category,counterparty=excluded.counterparty,location_id=excluded.location_id,notes=excluded.notes,due_date=excluded.due_date,reference=excluded.reference,details=excluded.details,closed_at=excluded.closed_at,paid_before_close=case when excluded.closed_at is not null then public.financial_transactions.paid else public.financial_transactions.paid_before_close end
 returning id into result;
 link_table:=case when r.kind='receivable' or (r.kind='income' and r.paid<r.amount) then 'receivables' when r.kind='payable' or (r.kind='expense' and r.paid<r.amount) then 'payables' when r.kind='asset' then 'assets' when r.kind='loan' then 'loans' end;
 if link_table is not null then execute format('insert into public.%I(transaction_id,company_id) values($1,$2) on conflict do nothing',link_table) using result,target; end if;
 return result;
end $$;
create function public.change_financial(target uuid,record_id uuid,operation text,expected_version timestamptz,confirmation text default '') returns void
language plpgsql security definer set search_path='' as $$
declare r public.financial_transactions; role_name text:=private.company_role_for(target)::text;
begin
 if coalesce(role_name,'') not in ('owner','admin','accountant') then raise exception 'Not authorized' using errcode='42501'; end if;
 select * into r from public.financial_transactions where id=record_id and company_id=target for update;
 if not found or r.updated_at is distinct from expected_version then raise exception 'Record changed; reload' using errcode='40001'; end if;
 if operation='close' and r.kind in ('receivable','payable','income','expense','loan') and r.closed_at is null then
 update public.financial_transactions set paid_before_close=paid,paid=amount,closed_at=now() where id=r.id;
 elsif operation='restore' and r.closed_at is not null then
 update public.financial_transactions set closed_at=null,paid=coalesce(paid_before_close,paid),paid_before_close=null where id=r.id;
 elsif operation='delete' and role_name in ('owner','admin') and r.kind in ('receivable','payable') and r.closed_at is not null and confirmation='ELIMINAR' then
 delete from public.financial_transactions where id=r.id;
 else raise exception 'Operation not permitted' using errcode='22023'; end if;
end $$;
-- Strings preserve exact decimal values across the JSON transport.
create function public.list_financial(target uuid) returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(t)||jsonb_build_object('amount',t.amount::text,'paid',t.paid::text) order by date desc,created_at desc),'[]') from public.financial_transactions t where company_id=target;
$$;
revoke all on function public.save_financial(uuid,jsonb,uuid,timestamptz), public.change_financial(uuid,uuid,text,timestamptz,text), public.list_financial(uuid) from public,anon;
grant execute on function public.save_financial(uuid,jsonb,uuid,timestamptz), public.change_financial(uuid,uuid,text,timestamptz,text), public.list_financial(uuid) to authenticated;

alter table public.financial_transactions
 add constraint financial_category_valid check (
 (kind='income' and category in ('product','service','other')) or
 (kind='expense' and category in ('direct','operating','marketing','payroll','other')) or
 (kind='asset' and category in ('equipment','property','vehicle','other')) or
 (kind in ('receivable','payable','loan') and category='other')),
 add constraint financial_details_object check (jsonb_typeof(details)='object'),
 add constraint financial_due_range check (due_date is null or due_date between '1900-01-01' and '2100-12-31');
