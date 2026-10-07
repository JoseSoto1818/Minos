-- Safe when applying Minos to a project that already has Auth users.
insert into public.profiles(id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

-- Clients cannot add objects to the exposed schema.
revoke create on schema public from public, anon, authenticated;
