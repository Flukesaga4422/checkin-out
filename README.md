# ระบบพนักงานร้านสปา

หน้าตาและเมนูใช้ต้นแบบใน ZIP: เช็คอินถ่ายรูป เช็คเอาท์ ปฏิทิน วันหยุด คำขอลา การอนุมัติ พนักงาน เงินเดือนและค่าคอม

## สถานะ

เพิ่มโค้ดเชื่อม Supabase แล้ว แต่ **ยังต้องสร้างโปรเจกต์ ตั้งค่าฐานข้อมูล และ deploy Edge Function** ก่อนใช้ร่วมกันจริง โค้ดไม่เปิดบัญชี admin/1234 ให้อัตโนมัติในโหมดออนไลน์ ไม่มีข้อมูลตัวอย่างถูกย้ายขึ้นคลาวด์โดยอัตโนมัติ

- Supabase Auth ตรวจรหัสผ่าน; ไม่เก็บรหัสผ่านในตารางพนักงานหรือส่งรหัสของผู้อื่นลงมือถือ
- ฐานข้อมูลกลางเก็บเวลา คำขอลา วันหยุด และสลิป; รูป/ใบรับรองอยู่ใน bucket `spa-private` แบบ private
- พนักงานเห็นเฉพาะข้อมูลตัวเอง; แอดมินเห็นทั้งร้าน ตรวจสิทธิ์ที่เซิร์ฟเวอร์ทุกครั้ง
- เวลาเช็คอิน/เช็คเอาท์พนักงานยึดเวลาเซิร์ฟเวอร์ Asia/Bangkok
- รีเฟรชข้อมูลทุก 30 วินาทีเมื่อแอพเปิดอยู่ และเมื่อกลับมาเปิดหน้าต่าง
- ต้องมีอินเทอร์เน็ตเพื่อบันทึก ไม่มีคิวออฟไลน์ที่แสดงว่าสำเร็จลวง
- ไม่เก็บข้อมูลธุรกิจ/รูปใน localStorage หรือ Service Worker cache ในโหมดออนไลน์ (Auth ยังจัดการ token ตามปกติ)

## ตั้งค่าแบบฟรี

เลือก Supabase **Free** ไม่ต้องอัปเกรดเป็น Pro เพื่อเริ่มต้น มีโควตาฐานข้อมูล/รูป/การรับส่งข้อมูล: https://supabase.com/pricing
พื้นที่รูปฟรีมีจำกัด ควรตรวจ Usage เป็นระยะ โค้ดย่อรูปเช็คอินจากกล้องอยู่แล้ว แต่ใบรับรองต้องไม่เกิน 2 MB ต่อไฟล์ โค้ดไม่ได้ลบหลักฐานเก่าอัตโนมัติ และการลบพนักงานจะเก็บประวัติเก่าไว้สำหรับแอดมิน ต้องมีแผนสำรองและจัดการรูปเก่าเมื่อพื้นที่ใกล้เต็ม แผน Free ไม่มีการรับประกันความพร้อมใช้งานหรือสำรองข้อมูลแบบแผนเสียเงิน

### 1. สร้างโปรเจกต์

สมัคร https://supabase.com แล้ว New project → Free → Singapore (หากมี) ตั้งรหัสฐานข้อมูลไว้เอง ไม่ต้องส่งให้ใคร

### 2. สร้างตารางและสิทธิ์

SQL Editor → New query → วางไฟล์ `supabase/migrations/202610050001_cloud.sql` ทั้งหมด → Run

### 3. สร้างผู้ดูแลคนแรก

Authentication → Users → Add user → Create new user:

- Email: `admin@spa.local` (อีเมลภายในระบบสำหรับชื่อผู้ใช้ `admin`; ไม่ใช้ส่งเมล)
- Password: ตั้งเองอย่างน้อย 8 ตัวอักษร
- Auto Confirm User: เปิด

คัดลอก UUID ของผู้ใช้ที่เพิ่งสร้าง แล้วรันใน SQL Editor (แทน `YOUR_AUTH_USER_UUID` ด้วย UUID จริง):

```sql
insert into public.spa_profiles (id,auth_id,username,name,role,pos)
values (1,'YOUR_AUTH_USER_UUID'::uuid,'admin','ผู้ดูแลร้าน','admin','ผู้ดูแล');
```

ใน Authentication settings ปิด **Allow new users to sign up** เพื่อให้แอดมินสร้างพนักงานผ่านแอพเท่านั้น ห้ามให้พนักงานตั้ง role เองผ่าน user metadata

### 4. เปิด API ของแอพ

ติดตั้ง Supabase CLI แล้วรันจากโฟลเดอร์โปรเจกต์:

```sh
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy spa-api
```

`SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` เป็นค่าฝั่ง Edge Function ที่ Supabase จัดให้ **ห้ามใส่ service_role/secret key ใน VITE_* หรือ GitHub**

ฟังก์ชันตั้ง `verify_jwt = false` เพื่อรองรับคีย์รุ่นใหม่ แต่ไม่ได้เป็น API สาธารณะ: handler ตรวจ token ด้วย `auth.getUser()` และตรวจ `spa_profiles` ทุกคำขอก่อนอ่าน/เขียน การส่ง Publishable key อย่างเดียวไม่ให้สิทธิ์อ่านข้อมูล

### 5. เชื่อมหน้าแอพ

Project Settings → API / API Keys → คัดลอก Project URL และ Publishable key จากนั้น:

```sh
cp .env.example .env.local
```

แก้ `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_WITH_YOUR_PUBLIC_KEY
VITE_DEMO_MODE=false
```

แล้วติดตั้ง/รัน (Node 24):

```sh
npm ci
npm run dev
```

ถ้าโฮสต์บน Vercel: Framework Preset **Vite**, Build Command `npm run build`, Output Directory `dist` และเพิ่ม environment variables สองตัวข้างบน จากนั้น Redeploy ค่าพวกนี้ต้องถูกใส่ตอน build ไม่ใช่แค่หลัง build

ถ้าใช้ Sites ต้องตั้งค่าสองตัวตอน build และเผยแพร่เวอร์ชันใหม่ด้วย; การ push GitHub อย่างเดียวไม่ได้อัปเดต Sites เดิมโดยอัตโนมัติ

### 6. ทดสอบก่อนแจก

1. ล็อกอิน `admin` ด้วยรหัสที่ตั้งเอง แล้วเพิ่มพนักงาน (ชื่อผู้ใช้ a-z, ตัวเลข, `.`, `_`, `-`; รหัสอย่างน้อย 8 ตัว)
2. พนักงานล็อกอินบนอีกเครื่อง ถ่ายรูปเช็คอิน ตรวจว่าแอดมินเห็นรายการและเปิดรูปได้ภายใน 30 วินาที
3. ส่งคำขอลาพร้อมใบรับรอง แล้วให้แอดมินอนุมัติ; ตรวจผลจากมือถือพนักงาน
4. ส่งสลิป และตรวจว่าบัญชีพนักงานอีกคนไม่เห็นรูป/สลิปของคนอื่น
5. ปิดเน็ตแล้วลองบันทึก ต้องแจ้งว่าไม่สำเร็จและไม่สร้างรายการหลอก
6. เปิดพร้อมกันสองเครื่องและบันทึกคนละรายการ ต้องไม่ทับกัน

`npm test` ตรวจสิทธิ์และการรวมข้อมูลด้วยโค้ดจำลอง; ไม่แทนการทดสอบ Supabase จริงขั้นตอนนี้

## โหมดทดลองเดิม

ตั้ง `VITE_DEMO_MODE=true` และเว้นค่าสองตัวของ Supabase ว่าง เพื่อทดลองหน้าตาโดยไม่ใช้ฐานข้อมูล ตัวทดลองมีแถบแจ้งว่าข้อมูลอยู่ในเครื่องนั้นเท่านั้น และล็อกอิน `admin` / `1234` ต้องไม่แจกตัวทดลองไปลงเวลาจริง

## Android / iOS

PWA จากเว็บ HTTPS ใช้รุ่นเว็บที่อัปเดตได้ Android ใช้ Add to Home Screen; iOS ใช้ Safari → Share → Add to Home Screen

APK / แพ็กเกจ iOS ใน `public/` เป็นไฟล์เก่าจาก ZIP ต้นแบบ **ยังไม่ได้สร้างใหม่หรือรับรองว่าเชื่อมฐานข้อมูลรุ่นนี้** ใช้เว็บ/PWA ที่ตั้งค่าแล้วสำหรับการทดสอบข้ามเครื่องก่อน ส่วน APK ต้องสร้างใหม่กับ URL ที่โฮสต์ระบบกลางสำเร็จแล้ว

## ตรวจโค้ด

```sh
npm run lint
npm test
npm run build
```

ไฟล์ SQL และ Edge Function ต้อง deploy บน Supabase จริงเพื่อทดสอบ Auth, RLS, Storage และ API ครบวงจร ไม่ต้องใช้ Gemini API key สำหรับแอพนี้
