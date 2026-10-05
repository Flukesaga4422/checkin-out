import { createClient } from 'npm:@supabase/supabase-js@2';
import { applyChanges, visibleDatabase } from './rules.ts';
import type { Change } from './changes.ts';
const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
const response = (body: unknown, status=200) => new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
Deno.serve(async req => {
 if (req.method==='OPTIONS') return new Response('ok',{headers:cors});
 if (req.method!=='POST') return response({error:'Method not allowed'},405);
 try {
  const server = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  const token = req.headers.get('authorization')?.replace(/^Bearer /i,'') || '';
  const {data:{user},error:authError} = await server.auth.getUser(token);
  if (authError || !user) return response({error:'กรุณาเข้าสู่ระบบใหม่'},401);
  const {data:actor,error:actorError} = await server.from('spa_profiles').select('*').eq('auth_id',user.id).single();
  if (actorError || !actor) return response({error:'ยังไม่ได้ลงทะเบียนพนักงาน กรุณาติดต่อผู้ดูแล'},403);
  const raw = await req.text();
  if (raw.length>2000000) return response({error:'ข้อมูลมีขนาดใหญ่เกินไป'},413);
  const body=JSON.parse(raw);
  if (body.action==='save') {
   const changes: Change[]=body.changes;
   if (!Array.isArray(changes)||changes.length>200) throw new Error('รายการไม่ถูกต้อง');
   const userChanges=changes.filter(c=>c.section==='users');
   // The UI sends one employee action at a time; reject mixed account and record updates.
   if (userChanges.length>1 || (userChanges.length && changes.some(c=>c.section!=='users'))) throw new Error('กรุณาแก้บัญชีทีละคน');
   for(const c of userChanges) {
    const {data:old}=await server.from('spa_profiles').select('*').eq('id',Number(c.key)).maybeSingle();
    const value:any=c.after;
    if (old && c.before) {
     const expected={...old,user:old.username,pass:''};
     for (const field of ['id','name','user','role','pos','salary','phone']) {
      if ((c.before as any)[field] !== (expected as any)[field]) throw new Error('บัญชีเปลี่ยนจากอีกเครื่อง กรุณารีเฟรช');
     }
    } else if (!!old !== !!c.before) throw new Error('บัญชีเปลี่ยนจากอีกเครื่อง กรุณารีเฟรช');
    if(actor.role!=='admin') {
     if(!old||old.id!==actor.id||!value||Object.keys(value).some(k=>!['id','name','user','pass','role','pos','salary','phone'].includes(k))||
      ['id','name','role','pos','salary','phone'].some(k=>value[k]!==old[k] && !(value[k]===undefined && old[k]===null))||value.user!==old.username) throw new Error('ไม่มีสิทธิ์แก้บัญชีนี้');
    }
    if(!value) {
     if(actor.role!=='admin'||old?.role==='admin') throw new Error('ไม่สามารถลบบัญชีผู้ดูแล');
     if(old) {
      // Delete profile first so existing JWTs immediately lose access.
      const {error}=await server.from('spa_profiles').delete().eq('id',old.id); if(error) throw error;
      const {error:de}=await server.auth.admin.deleteUser(old.auth_id); if(de) throw de;
     }
    } else {
     const username=String(value.user).trim().toLowerCase();
     if(!Number.isSafeInteger(Number(c.key)) || Number(c.key)<=0 || value.id!==Number(c.key)) throw new Error('บัญชีไม่ถูกต้อง');
     if(!/^[a-z0-9._-]{1,64}$/.test(username)||!['staff','admin'].includes(value.role)||!value.name?.trim()) throw new Error('ชื่อผู้ใช้ใช้ a-z ตัวเลข . _ - เท่านั้น');
     if(old?.role==='admin' && (value.role!=='admin'||username!==old.username)) throw new Error('ไม่สามารถเปลี่ยนสิทธิ์หรือชื่อบัญชีผู้ดูแล');
     if(value.pass && value.pass.length<8) throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
     const {data:duplicate,error:duplicateError}=await server.from('spa_profiles').select('id').eq('username',username).maybeSingle();
     if(duplicateError) throw duplicateError;
     if(duplicate && duplicate.id!==Number(c.key)) throw new Error('ชื่อผู้ใช้นี้มีคนใช้แล้ว');
     if(!Number.isFinite(value.salary||0)||typeof value.name!=='string') throw new Error('ข้อมูลพนักงานไม่ถูกต้อง');
     const attrs:any={email:`${username}@spa.local`,email_confirm:true};
     if(value.pass) attrs.password=value.pass;
     let authId=old?.auth_id;
     if(old) {
      const {error}=await server.auth.admin.updateUserById(authId,attrs); if(error) throw error;
     } else {
      if(actor.role!=='admin'||!value.pass) throw new Error('กรุณากำหนดรหัสผ่านอย่างน้อย 8 ตัวอักษร');
      const {data,error}=await server.auth.admin.createUser(attrs); if(error) throw error; authId=data.user.id;
     }
     const profile={id:Number(c.key),auth_id:authId,username,name:value.name,role:value.role,pos:value.pos||null,salary:value.salary||0,phone:value.phone||null};
     const {error}=await server.from('spa_profiles').upsert(profile);
     if(error) { if(!old) await server.auth.admin.deleteUser(authId); throw error; }
    }
   }
   const recordChanges=changes.filter(c=>c.section!=='users');
   if(recordChanges.length) {
    let saved=false;
    for(let attempt=0;attempt<4;attempt++) {
     const {data:state,error}=await server.from('spa_state').select('*').eq('id',1).single(); if(error) throw error;
     if(actor.role!=='admin') {
      for(const change of recordChanges) {
       const record:any=change.after;
       for(const pointer of [record?.photo,record?.certFile].filter(Boolean)) {
        const prefix=`storage:${actor.auth_id}/`;
        if(!pointer.startsWith(prefix)) throw new Error('ไฟล์ไม่ถูกต้อง');
        const name=pointer.slice(prefix.length);
        if(!/^[a-zA-Z0-9.-]+$/.test(name)) throw new Error('ไฟล์ไม่ถูกต้อง');
        const {data:files,error:fe}=await server.storage.from('spa-private').list(actor.auth_id,{search:name});
        if(fe || !files?.some(f=>f.name===name)) throw new Error('ไม่พบไฟล์ กรุณาถ่ายรูปหรือแนบเอกสารใหม่');
       }
      }
     }
     const next=applyChanges(state.document,recordChanges,actor);
     const {data:ok,error:ce}=await server.rpc('spa_commit',{expected_revision:state.revision,new_document:next}); if(ce) throw ce;
     if(ok){saved=true;break;}
    }
    if(!saved) throw new Error('มีการบันทึกพร้อมกัน กรุณาลองใหม่');
   }
  } else if(body.action!=='load') throw new Error('Unknown action');
  const [{data:state,error:se},{data:profiles,error:pe}]=await Promise.all([
   server.from('spa_state').select('*').eq('id',1).single(),server.from('spa_profiles').select('*')]);
  if(se||pe) throw se||pe;
  return response({db:visibleDatabase(state.document,profiles!,actor),uid:actor.id});
 } catch(error) { return response({error:error instanceof Error?error.message:'บันทึกไม่สำเร็จ'},400); }
});
