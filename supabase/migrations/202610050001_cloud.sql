-- Run in Supabase SQL Editor. No employee data is accessible to anon clients.
create table if not exists public.spa_profiles (
 id bigint primary key,
 auth_id uuid unique not null references auth.users(id) on delete cascade,
 username text unique not null check (username ~ '^[a-z0-9._-]{1,64}$'),
 name text not null,
 role text not null check (role in ('admin','staff')),
 pos text, salary numeric, phone text
);
create table if not exists public.spa_state (
 id int primary key check (id = 1),
 revision bigint not null default 0,
 document jsonb not null
);
insert into public.spa_state (id, document) values (1,
 '{"shop":"ร้านนวดและสปา","start":"10:00","att":{},"leaves":[],"holidays":{},"pay":{},"slips":[]}') on conflict do nothing;
alter table public.spa_profiles enable row level security;
alter table public.spa_state enable row level security;
revoke all on public.spa_profiles, public.spa_state from anon, authenticated;
grant all on public.spa_profiles, public.spa_state to service_role;
-- Used by Storage RLS only; callers cannot supply a different user ID.
create or replace function public.spa_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.spa_profiles where auth_id = auth.uid() and role = 'admin');
$$;
revoke all on function public.spa_is_admin() from public, anon;
grant execute on function public.spa_is_admin() to authenticated;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('spa-private','spa-private',false,2097152,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public=false,file_size_limit=2097152,
allowed_mime_types=array['image/jpeg','image/png','image/webp','application/pdf'];
drop policy if exists spa_file_read on storage.objects;
create policy spa_file_read on storage.objects for select to authenticated
using (bucket_id='spa-private' and
 (public.spa_is_admin() or (storage.foldername(name))[1]=auth.uid()::text));
create or replace function public.spa_is_member() returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.spa_profiles where auth_id=auth.uid());
$$;
revoke all on function public.spa_is_member() from public, anon;
grant execute on function public.spa_is_member() to authenticated;
drop policy if exists spa_file_upload on storage.objects;
create policy spa_file_upload on storage.objects for insert to authenticated
with check (bucket_id='spa-private' and (storage.foldername(name))[1]=auth.uid()::text
 and public.spa_is_member());
-- Compare-and-swap prevents concurrent saves from overwriting another employee.
create or replace function public.spa_commit(expected_revision bigint, new_document jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 update public.spa_state set document=new_document, revision=revision+1
 where id=1 and revision=expected_revision;
 return found;
end;
$$;
revoke all on function public.spa_commit(bigint,jsonb) from public, anon, authenticated;
grant execute on function public.spa_commit(bigint,jsonb) to service_role;
