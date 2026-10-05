import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const staff='00000000-0000-0000-0000-000000000002';
const other='00000000-0000-0000-0000-000000000003';
const admin='00000000-0000-0000-0000-000000000001';
async function database() {
 const db=new PGlite();
 await db.exec(`
 create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create schema storage;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as
 $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth,storage to authenticated,service_role;
 grant execute on function auth.uid() to authenticated,service_role;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 grant select,insert on storage.objects to authenticated;
 create function storage.foldername(name text) returns text[] language sql immutable as
 $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
 `);
 await db.exec(await readFile(new URL('../supabase/migrations/202610050001_cloud.sql',import.meta.url),'utf8'));
 await db.exec(`insert into auth.users values ('${admin}'),('${staff}'),('${other}');
 insert into public.spa_profiles(id,auth_id,username,name,role) values
 (1,'${admin}','admin','Admin','admin'),(2,'${staff}','two','Two','staff'),(3,'${other}','three','Three','staff');
 insert into storage.objects(bucket_id,name) values ('spa-private','${staff}/self.jpg'),('spa-private','${other}/other.jpg');`);
 return db;
}
test('SQL migration denies anonymous data access and only service can commit',async()=>{
 const db=await database();
 try {
  await db.exec('set role anon');
  await assert.rejects(()=>db.query('select * from public.spa_state'));
  await assert.rejects(()=>db.query('select * from public.spa_profiles'));
  await assert.rejects(()=>db.query("select public.spa_commit(0,'{}'::jsonb)"));
  await db.exec('reset role; set role service_role');
  assert.equal((await db.query("select public.spa_commit(0,'{}'::jsonb) as ok")).rows[0].ok,true);
  assert.equal((await db.query("select public.spa_commit(0,'{}'::jsonb) as ok")).rows[0].ok,false);
 } finally {await db.close();}
});
test('private file policies allow own reads/uploads, admin reads, block impersonation',async()=>{
 const db=await database();
 try {
  await db.exec(`set role authenticated; set request.jwt.claim.sub='${staff}';`);
  assert.deepEqual((await db.query('select name from storage.objects')).rows.map(r=>r.name),[`${staff}/self.jpg`]);
  await assert.rejects(()=>db.query(`insert into storage.objects(bucket_id,name) values ('spa-private','${other}/forged.jpg')`));
  await db.query(`insert into storage.objects(bucket_id,name) values ('spa-private','${staff}/new.jpg')`);
  await assert.rejects(()=>db.query('select * from public.spa_profiles'));
  await db.exec(`set request.jwt.claim.sub='${admin}';`);
  assert.equal((await db.query('select * from storage.objects')).rows.length,3);
  await db.exec("set request.jwt.claim.sub='00000000-0000-0000-0000-000000000099';");
  await assert.rejects(()=>db.query("insert into storage.objects(bucket_id,name) values ('spa-private','00000000-0000-0000-0000-000000000099/no-profile.jpg')"));
 } finally {await db.close();}
});
