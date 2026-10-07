begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(22);

insert into auth.users(id, email) values
 ('10000000-0000-0000-0000-000000000001','owner-a@example.test'),
 ('10000000-0000-0000-0000-000000000002','owner-b@example.test'),
 ('10000000-0000-0000-0000-000000000003','viewer@example.test'),
 ('10000000-0000-0000-0000-000000000004','accountant@example.test'),
 ('10000000-0000-0000-0000-000000000005','admin@example.test');

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001',true);
select lives_ok($$select public.create_company('Empresa A','CO','COP','America/Bogota','Comercio','products',true,array['Norte'])$$,'owner can create company atomically');
select is((select count(*)::int from public.companies),1,'creator can see own company');
select is((select role::text from public.company_memberships),'owner','creator receives owner role');
select is((select count(*)::int from public.company_preferences),1,'preferences persisted');
select is((select count(*)::int from public.locations),1,'locations persisted');
select is((select count(*)::int from public.audit_events),4,'onboarding mutations audited');
select lives_ok($$update public.companies set name='Empresa A editada'$$,'owner may update settings');
select throws_ok($$update public.companies set created_by='10000000-0000-0000-0000-000000000002'$$,'42501',null,'owner cannot transfer creator through table API');
select throws_ok($$insert into public.company_memberships(company_id,user_id,role) select id,'10000000-0000-0000-0000-000000000002','admin' from public.companies$$,'42501',null,'membership mutation has no public grant');
select throws_ok($$select public.create_company('Invalid','CO','COP','Unknown/Zone','Comercio','products',false)$$,'22023',null,'invalid timezone rejected by database');
select throws_ok($$select public.create_company('Duplicate','CO','COP','America/Bogota','Comercio','products',true,array['Norte',' norte '])$$,'23505',null,'duplicate locations roll back company');
select is((select count(*)::int from public.companies),1,'failed onboarding leaves no orphan company');

select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000002',true);
select public.create_company('Empresa B','MX','MXN','America/Mexico_City','Comercio','services',false);
select is((select count(*)::int from public.companies),1,'second tenant sees only own company');
select is((select count(*)::int from public.locations),0,'cross-tenant locations hidden');
select is((select count(*)::int from public.audit_events),3,'cross-tenant audit hidden');
select is((select count(*)::int from public.profiles),1,'cross-tenant profiles hidden');
with changed as (update public.companies set name='Hacked' where name='Empresa A editada' returning id) select is((select count(*)::int from changed),0,'cross-tenant update denied');

reset role;
insert into public.company_memberships(company_id,user_id,role)
  select c.id, r.user_id::uuid, r.role::public.company_role from public.companies c,
  (values ('10000000-0000-0000-0000-000000000003','viewer'),('10000000-0000-0000-0000-000000000004','accountant'),('10000000-0000-0000-0000-000000000005','admin')) r(user_id,role)
  where c.name='Empresa A editada';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000003',true);
with changed as (update public.companies set name='Viewer hacked' returning id) select is((select count(*)::int from changed),0,'viewer cannot edit company');
select throws_ok($$insert into public.locations(company_id,name,created_by) select id,'Forbidden',auth.uid() from public.companies$$,'42501',null,'viewer cannot create locations');
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000004',true);
with changed as (update public.companies set name='Accountant hacked' returning id) select is((select count(*)::int from changed),0,'accountant cannot edit company settings');
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000005',true);
select lives_ok($$update public.companies set name='Admin edited'$$,'admin can edit settings');
set local role anon;
select throws_ok($$select * from public.companies$$,'42501',null,'anonymous access denied');
select * from finish();
rollback;
