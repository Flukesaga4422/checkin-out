import test from 'node:test';
import assert from 'node:assert/strict';
import { applyChanges, visibleDatabase } from '../supabase/functions/spa-api/rules.ts';
import { diffDatabase } from '../src/lib/changes.ts';
const actor={id:2,auth_id:'uuid-2',role:'staff'};
const seed=()=>({shop:'ร้าน',start:'10:00',att:{},leaves:[],holidays:{},pay:{},slips:[]});
const now=new Date('2026-10-05T03:12:00Z');
test('check-in uses Bangkok server time, requires own private file',()=>{
 const c={section:'att',key:'2|2026-10-05',before:null,after:{in:'09:00',late:0,out:'',photo:'storage:uuid-2/photo.jpg'}};
 const db=applyChanges(seed(),[c],actor,now);
 assert.equal(db.att[c.key].in,'10:12');assert.equal(db.att[c.key].late,12);
 assert.throws(()=>applyChanges(seed(),[{...c,key:'3|2026-10-05'}],actor,now));
 assert.throws(()=>applyChanges(seed(),[{...c,after:{...c.after,photo:'storage:uuid-3/photo.jpg'}}],actor,now));
});
test('staff cannot approve leave or edit payroll/settings',()=>{
 for(const section of ['pay','holidays','settings'])assert.throws(()=>applyChanges(seed(),[{section,key:'x',before:null,after:42}],actor,now));
 const leave={id:1,uid:2,date:'2026-10-06',type:'sick',status:'approved'};
 assert.throws(()=>applyChanges(seed(),[{section:'leaves',key:'1',before:null,after:leave}],actor,now));
 assert.throws(()=>applyChanges(seed(),[{section:'leaves',key:'1',before:null,after:{...leave,status:'pending',uid:3}}],actor,now));
});
test('staff visibility excludes other employees, salaries and slips',()=>{
 const db={...seed(),att:{'2|today':{},'3|today':{}},pay:{'3|mon':{base:9000}},leaves:[{uid:2},{uid:3}],slips:[{uid:2},{uid:3}]};
 const profiles=[{...actor,username:'two',name:'Two'},{id:3,auth_id:'uuid-3',username:'three',name:'Three',role:'staff',salary:9000}];
 const visible=visibleDatabase(db,profiles,actor);
 assert.equal(visible.users.length,1);assert.equal(visible.users[0].pass,'');
 assert.equal(visible.users[0].auth_id,undefined);
 assert.deepEqual(Object.keys(visible.att),['2|today']);assert.deepEqual(visible.pay,{});
 assert.equal(visible.slips.length,1);assert.equal(visible.leaves.length,1);
});
test('concurrent independent records merge; same-record conflicts fail',()=>{
 const db=seed();const one={...db,holidays:{a:'A'}},two={...db,holidays:{b:'B'}};
 const first=applyChanges(db,diffDatabase(db,one),{role:'admin'},now);
 const merged=applyChanges(first,diffDatabase(db,two),{role:'admin'},now);
 assert.deepEqual(merged.holidays,{a:'A',b:'B'});
 assert.throws(()=>applyChanges(merged,diffDatabase(db,one),{role:'admin'},now));
});
test('checkout cannot rewrite check-in, or occur twice',()=>{
 const record={in:'10:12',out:'',late:12,photo:'storage:uuid-2/a.jpg',timestamp:1};
 const db={...seed(),att:{'2|2026-10-05':record}};
 const c={section:'att',key:'2|2026-10-05',before:record,after:{...record,out:'19:00'}};
 assert.equal(applyChanges(db,[c],actor,now).att[c.key].out,'10:12');
 assert.throws(()=>applyChanges(db,[{...c,after:{...c.after,in:'09:00'}}],actor,now));
});
