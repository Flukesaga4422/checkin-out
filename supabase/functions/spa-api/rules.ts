import type { Change } from './changes.ts';
export function applyChanges(document: any, changes: Change[], actor: any, now = new Date()): any {
 const next = structuredClone(document);
 const date = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const time = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
 const mins = (s: string) => Number(s.slice(0,2))*60+Number(s.slice(3,5));
 for (const c of changes) {
  if (!['att','leaves','holidays','pay','slips','settings'].includes(c.section)) throw new Error('Invalid section');
  const array = ['leaves','slips'].includes(c.section);
  const getKey = (x: any) => c.section === 'slips' ? x.key : String(x.id);
  const current = c.section === 'settings' ? next[c.key] : array ? next[c.section].find((x:any)=>getKey(x)===c.key) : next[c.section][c.key];
  if (JSON.stringify(current ?? null) !== JSON.stringify(c.before)) throw new Error('ข้อมูลเปลี่ยนจากอีกเครื่อง กรุณารีเฟรชแล้วลองใหม่');
  let value: any = c.after;
  if (actor.role !== 'admin') {
   if (c.section === 'att') {
    if (c.key !== `${actor.id}|${date}` || !value) throw new Error('ไม่มีสิทธิ์แก้เวลานี้');
    if (!current) {
     if (!value.photo?.startsWith(`storage:${actor.auth_id}/`)) throw new Error('กรุณาถ่ายรูปเช็คอิน');
     value = {in:time,out:'',late:Math.max(0,mins(time)-mins(next.start)),photo:value.photo,timestamp:now.getTime()};
    } else {
     if (current.out || !value.out || value.photo !== current.photo || value.in !== current.in || value.late !== current.late) throw new Error('ไม่สามารถแก้เวลาเช็คอินได้');
     value = {...current,out:time};
    }
   } else if (c.section === 'leaves') {
    if (current || !value || value.uid !== actor.id || value.status !== 'pending') throw new Error('ไม่มีสิทธิ์แก้คำขอลา');
    if (String(value.id)!==c.key || !/^\d{4}-\d{2}-\d{2}$/.test(value.date) || !['dayoff','sick','biz','vac','unpaid'].includes(value.type)) throw new Error('คำขอลาไม่ถูกต้อง');
    if (value.certFile && !value.certFile.startsWith(`storage:${actor.auth_id}/`)) throw new Error('ไฟล์ไม่ถูกต้อง');
    value = {...value,createdAt:date};
   } else throw new Error('เฉพาะผู้ดูแลเท่านั้น');
  }
  if (c.section === 'settings') {
   if (!['shop','start'].includes(c.key) || typeof value !== 'string' || (c.key==='start' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))) throw new Error('ตั้งค่าไม่ถูกต้อง');
   next[c.key] = value;
  } else if (array) {
   next[c.section]=next[c.section].filter((x:any)=>getKey(x)!==c.key);
   if (value !== null) next[c.section].push(value);
  } else if (value === null) delete next[c.section][c.key];
  else next[c.section][c.key]=value;
 }
 return next;
}
export function visibleDatabase(document: any, profiles: any[], actor: any): any {
 const safe = profiles.filter(p=>actor.role==='admin'||p.id===actor.id).map(({auth_id,username,...p})=>({...p,user:username,pass:''}));
 if (actor.role==='admin') return {...document,users:safe};
 return {...document,users:safe,
 att:Object.fromEntries(Object.entries(document.att).filter(([k])=>k.startsWith(`${actor.id}|`))),
 leaves:document.leaves.filter((l:any)=>l.uid===actor.id),pay:{},
 slips:document.slips.filter((s:any)=>s.uid===actor.id)};
}
