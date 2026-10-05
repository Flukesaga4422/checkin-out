import { createClient } from '@supabase/supabase-js';
import type { SpaDatabase } from '../types';
import { diffDatabase } from './changes';
const url=import.meta.env.VITE_SUPABASE_URL || '';
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
export const cloudConfigured=!!url && !!key;
export const demoMode=import.meta.env.VITE_DEMO_MODE==='true' && !cloudConfigured;
export const supabase=cloudConfigured?createClient(url,key):null;
const signedToPath=new Map<string,string>();
const signedCache=new Map<string,{url:string;expires:number}>();
export function clearCloudFiles() { signedToPath.clear(); signedCache.clear(); }
async function call(action:string, extra:object={}) {
 if(!supabase) throw new Error('ยังไม่ได้เชื่อม Supabase');
 const {data,error}=await supabase.functions.invoke('spa-api',{body:{action,...extra}});
 if(error) {
  let message='เชื่อมต่อไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตหรือเข้าสู่ระบบใหม่';
  try { message=(await error.context.json()).error||message; } catch {}
  throw new Error(message);
 }
 if(data.error) throw new Error(data.error);
 return data as {db:SpaDatabase;uid:number};
}
async function resolveFiles(db:SpaDatabase) {
 const resolve=async(value?:string)=>{
  if(!value?.startsWith('storage:')) return value;
  const path=value.slice(8);
  const cached=signedCache.get(path);
  if(cached && cached.expires>Date.now()) return cached.url;
  const {data,error}=await supabase!.storage.from('spa-private').createSignedUrl(path,3600);
  if(error) throw error;
  signedToPath.set(data.signedUrl,value);
  signedCache.set(path,{url:data.signedUrl,expires:Date.now()+50*60*1000});
  return data.signedUrl;
 };
 // Bound signing concurrency rather than issuing hundreds of simultaneous requests.
 const tasks=[...Object.values(db.att).map(record=>async()=>{record.photo=await resolve(record.photo);}),
 ...db.leaves.map(record=>async()=>{record.certFile=await resolve(record.certFile);})];
 for(let i=0;i<tasks.length;i+=10) await Promise.all(tasks.slice(i,i+10).map(f=>f()));
 return db;
}
export async function loadCloud() {const data=await call('load');data.db=await resolveFiles(data.db);return data;}
export async function cloudLogin(username:string,password:string) {
 const {error}=await supabase!.auth.signInWithPassword({email:`${username.trim().toLowerCase()}@spa.local`,password});
 if(error) throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
 try {return await loadCloud();} catch(e){await supabase!.auth.signOut();throw e;}
}
async function fileValue(value?:string) {
 if(!value) return value;
 if(signedToPath.has(value)) return signedToPath.get(value);
 if(!value.startsWith('data:')) return value;
 const {data:{session}}=await supabase!.auth.getSession();
 if(!session) throw new Error('กรุณาเข้าสู่ระบบใหม่');
 const blob=await (await fetch(value)).blob();
 if(blob.size>2*1024*1024) throw new Error('ไฟล์ต้องไม่เกิน 2 MB');
 const ext=blob.type==='application/pdf'?'pdf':blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':'jpg';
 const path=`${session.user.id}/${crypto.randomUUID()}.${ext}`;
 const {error}=await supabase!.storage.from('spa-private').upload(path,blob,{contentType:blob.type,upsert:false});
 if(error) throw error;
 return `storage:${path}`;
}
export async function saveCloud(before:SpaDatabase,after:SpaDatabase) {
 const uploads = new Map<string, Promise<string | undefined>>();
 const file = (value?: string) => {
  if (!value) return Promise.resolve(value);
  if (!uploads.has(value)) uploads.set(value, fileValue(value));
  return uploads.get(value)!;
 };
 const normalize=async(db:SpaDatabase)=>{
  const copy=structuredClone(db);
  for(const a of Object.values(copy.att)) a.photo=await file(a.photo);
  for(const l of copy.leaves) l.certFile=await file(l.certFile);
  return copy;
 };
 const a=await normalize(before),b=await normalize(after);
 const changes=diffDatabase(a,b);
 const data=await call('save',{changes});
 data.db=await resolveFiles(data.db);
 return data;
}
