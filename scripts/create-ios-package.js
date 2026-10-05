import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

class SimpleZip {
  constructor() {
    this.entries = [];
  }

  addFile(name, content) {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    const compressed = zlib.deflateRawSync(buffer);
    const crc = this.crc32(buffer);
    this.entries.push({
      name,
      uncompressedSize: buffer.length,
      compressedSize: compressed.length,
      crc,
      data: compressed,
    });
  }

  crc32(buf) {
    let crc = ~0;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ this.crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ ~0) >>> 0;
  }

  toBuffer() {
    let offset = 0;
    const localHeaders = [];
    const centralHeaders = [];

    for (const entry of this.entries) {
      const nameBuf = Buffer.from(entry.name, 'utf8');

      const local = Buffer.alloc(30 + nameBuf.length);
      local.writeUInt32LE(0x04034b50, 0);
      local.writeUInt16LE(20, 4);
      local.writeUInt16LE(0, 6);
      local.writeUInt16LE(8, 8);
      local.writeUInt16LE(0x4000, 10);
      local.writeUInt16LE(0x56a5, 12);
      local.writeUInt32LE(entry.crc, 14);
      local.writeUInt32LE(entry.compressedSize, 18);
      local.writeUInt32LE(entry.uncompressedSize, 22);
      local.writeUInt16LE(nameBuf.length, 26);
      local.writeUInt16LE(0, 28);
      nameBuf.copy(local, 30);

      localHeaders.push(local, entry.data);
      offset += local.length + entry.data.length;

      const central = Buffer.alloc(46 + nameBuf.length);
      central.writeUInt32LE(0x02014b50, 0);
      central.writeUInt16LE(20, 4);
      central.writeUInt16LE(20, 6);
      central.writeUInt16LE(0, 8);
      central.writeUInt16LE(8, 10);
      central.writeUInt16LE(0x4000, 12);
      central.writeUInt16LE(0x56a5, 14);
      central.writeUInt32LE(entry.crc, 16);
      central.writeUInt32LE(entry.compressedSize, 20);
      central.writeUInt32LE(entry.uncompressedSize, 24);
      central.writeUInt16LE(nameBuf.length, 28);
      central.writeUInt16LE(0, 30);
      central.writeUInt16LE(0, 32);
      central.writeUInt16LE(0, 34);
      central.writeUInt16LE(0, 36);
      central.writeUInt32LE(0, 38);
      central.writeUInt32LE(offset - (local.length + entry.data.length), 42);
      nameBuf.copy(central, 46);

      centralHeaders.push(central);
    }

    const centralDirStart = offset;
    let centralDirSize = 0;
    for (const ch of centralHeaders) {
      centralDirSize += ch.length;
    }

    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(0, 4);
    eocd.writeUInt16LE(0, 6);
    eocd.writeUInt16LE(this.entries.length, 8);
    eocd.writeUInt16LE(this.entries.length, 10);
    eocd.writeUInt32LE(centralDirSize, 12);
    eocd.writeUInt32LE(centralDirStart, 16);
    eocd.writeUInt16LE(0, 20);

    return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
  }
}

SimpleZip.prototype.crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const icon512Path = path.resolve('public/icon-512.png');
const appleIconPath = path.resolve('public/apple-touch-icon.png');
const iconBuffer = fs.existsSync(appleIconPath)
  ? fs.readFileSync(appleIconPath)
  : fs.existsSync(icon512Path)
  ? fs.readFileSync(icon512Path)
  : Buffer.from('');

const iconBase64 = iconBuffer.toString('base64');

// 1. Create Apple .mobileconfig (Web Clip Profile for iPhone / iPad)
const mobileConfigContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>${iconBase64}</data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>Spa Staff</string>
            <key>PayloadDescription</key>
            <string>Web Clip สำหรับระบบพนักงานร้านสปา</string>
            <key>PayloadDisplayName</key>
            <string>ระบบพนักงานร้านสปา</string>
            <key>PayloadIdentifier</key>
            <string>com.spastaff.app.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>B1A9908F-25CF-4A42-99EA-312948DF5811</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>https://ais-pre-kel3lisfnw3blhidyzntkk-968360040779.asia-east1.run.app</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>โปรไฟล์ติดตั้งแอป ระบบพนักงานร้านสปา ลงบนหน้าจอหลัก iPhone/iPad</string>
    <key>PayloadDisplayName</key>
    <string>ระบบพนักงานร้านสปา (Spa Staff App)</string>
    <key>PayloadIdentifier</key>
    <string>com.spastaff.app.profile</string>
    <key>PayloadOrganization</key>
    <string>Spa Staff Management</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>E7D2F1B0-6813-4B39-8139-44F074C14D92</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

fs.writeFileSync(path.join(publicDir, 'SpaStaff.mobileconfig'), mobileConfigContent);
console.log('Created SpaStaff.mobileconfig');

// 2. Create Apple App Store & Xcode Submission Package (.zip)
const zip = new SimpleZip();

// Info.plist
const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>th</string>
    <key>CFBundleDisplayName</key>
    <string>Spa Staff</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>com.spastaff.app</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>Spa Staff</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>NSCameraUsageDescription</key>
    <string>แอปต้องการเข้าถึงกล้องเพื่อถ่ายภาพยืนยันตัวตนตอนเช็คอินเข้างานของพนักงาน</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>แอปต้องการเข้าถึงรูปภาพเพื่อแนบเอกสารหรือรูปถ่ายใบรับรองแพทย์สำหรับการลาป่วย</string>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <true/>
</dict>
</plist>`;

zip.addFile('ios/App/App/Info.plist', infoPlist);

// Apple Privacy Manifest (Required by Apple for App Store review)
const privacyManifest = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeOtherUserContent</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <false/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
    </array>
    <key>NSPrivacyAccessedAPITypes</key>
    <array/>
</dict>
</plist>`;

zip.addFile('ios/App/App/PrivacyInfo.xcprivacy', privacyManifest);

// Capacitor Config
const capacitorConfig = JSON.stringify({
  appId: "com.spastaff.app",
  appName: "ระบบพนักงานร้านสปา",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "https"
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#17332F"
    }
  }
}, null, 2);

zip.addFile('capacitor.config.json', capacitorConfig);

// App Store Connect Metadata Guide
const appStoreMetadata = JSON.stringify({
  appName: "ระบบพนักงานร้านสปา (Spa Staff)",
  subtitle: "ลงเวลา เช็คอินถ่ายรูป และคำนวณเงินเดือน",
  primaryCategory: "Business",
  secondaryCategory: "Productivity",
  contentRating: "4+ (ไม่มีเนื้อหาจำกัดอายุ)",
  bundleId: "com.spastaff.app",
  version: "2.0.0",
  build: "1",
  keywords: [
    "สปา", "พนักงานสปา", "ลงเวลา", "เช็คอินสปา", "สลิปเงินเดือน", 
    "วันหยุดพนักงาน", "ตารางนวด", "ระบบร้านนวด"
  ],
  supportURL: "https://ais-pre-kel3lisfnw3blhidyzntkk-968360040779.asia-east1.run.app",
  marketingURL: "https://ais-pre-kel3lisfnw3blhidyzntkk-968360040779.asia-east1.run.app",
  privacyPolicyURL: "https://ais-pre-kel3lisfnw3blhidyzntkk-968360040779.asia-east1.run.app",
  descriptionThai: `ระบบจัดการพนักงานร้านนวดและสปาแบบครบวงจร
- ระบบบันทึกเวลาเข้างาน (Check-in) ถ่ายรูปยืนยันตัวตนด้วยกล้องหน้า/กล้องหลัง
- คำนวณการมาสายและการเข้างานแบบเรียลไทม์
- ระบบลงวันหยุดปกติประจำสัปดาห์ (สัปดาห์ละ 1 วัน หรือสะสมหยุดยาวได้)
- ระบบส่งคำขอลาป่วย ลากิจ ลาพักร้อน พร้อมฟังก์ชันแนบรูปถ่ายใบรับรองแพทย์
- ระบบคำนวณและพิมพ์สลิปเงินเดือนอัตโนมัติ (เงินเดือนพื้นฐาน, ค่าคอมมิชชัน, ทิปมือ, หักวันลา)
- รองรับการทำงานทั้งผู้ดูแลร้าน (Admin) และพนักงาน (Staff)`
}, null, 2);

zip.addFile('AppStore-Metadata.json', appStoreMetadata);

// Step by Step App Store Submission Guide
const submissionGuide = `# คู่มือการนำแอพขึ้น Apple App Store และ TestFlight

## สิ่งที่ต้องเตรียม
1. บัญชี **Apple Developer Account** (สมัครที่ https://developer.apple.com ค่าบริการ $99/ปี)
2. เครื่อง **Mac** พร้อมโปรแกรม **Xcode** (ดาวน์โหลดฟรีจาก Mac App Store)

---

## ขั้นตอนที่ 1: ติดตั้ง Capacitor iOS ในโปรเจกต์
รันคำสั่งเหล่านี้ใน Terminal ของโปรเจกต์:
\`\`\`bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "ระบบพนักงานร้านสปา" "com.spastaff.app"
npm run build
npx cap add ios
\`\`\`

---

## ขั้นตอนที่ 2: เปิดโปรเจกต์ใน Xcode
\`\`\`bash
npx cap open ios
\`\`\`
1. ใน Xcode คลิกที่โปรเจกต์ **App** ด้านซ้าย
2. ไปที่แท็บ **Signing & Capabilities**
3. เลือก **Team** เป็นบัญชี Apple Developer ของคุณ
4. Bundle Identifier จะเป็น \`com.spastaff.app\`

---

## ขั้นตอนที่ 3: ตั้งค่าไอคอนและข้อความขออนุญาต
ไฟล์ \`Info.plist\` และ \`PrivacyInfo.xcprivacy\` ในโฟลเดอร์นี้ได้รับการตั้งค่าขอสิทธิ์กล้อง (Camera) และคลังรูปภาพ (Photo Library) เป็นภาษาไทยไว้เรียบร้อยแล้ว:
- \`NSCameraUsageDescription\`: "แอปต้องการเข้าถึงกล้องเพื่อถ่ายภาพยืนยันตัวตนตอนเช็คอินเข้างานของพนักงาน"
- \`NSPhotoLibraryUsageDescription\`: "แอปต้องการเข้าถึงรูปภาพเพื่อแนบเอกสารหรือรูปถ่ายใบรับรองแพทย์สำหรับการลาป่วย"

---

## ขั้นตอนที่ 4: ทดสอบผ่าน TestFlight และส่งตรวจ App Store
1. ในแถบเมนู Xcode ด้านบน เลือกปลายทางเป็น **Any iOS Device (arm64)**
2. เมนู **Product** ➔ **Archive**
3. เมื่อคอมไพล์เสร็จ หน้าต่าง Organizer จะเปิดขึ้นมา ให้กด **Distribute App**
4. เลือก **App Store Connect** ➔ กด **Upload**
5. เข้าเว็บ **App Store Connect** (https://appstoreconnect.apple.com)
6. ไปที่เมนู **TestFlight** เพื่อส่งให้พนักงานในร้านทดสอบผ่านแอป TestFlight ได้ทันที
7. เมื่อพร้อม ให้กด **Submit for Review** เพื่อให้ทีมงาน Apple ตรวจสอบและเปิดให้ดาวน์โหลดบน App Store ทั่วโลก!
`;

zip.addFile('AppStore-Submission-Guide.md', submissionGuide);

// Add icons to package
if (fs.existsSync(icon512Path)) {
  zip.addFile('AppIcon-1024x1024.png', fs.readFileSync(icon512Path));
}
if (fs.existsSync(appleIconPath)) {
  zip.addFile('AppIcon-180x180.png', fs.readFileSync(appleIconPath));
}

const zipBuffer = zip.toBuffer();
fs.writeFileSync(path.join(publicDir, 'SpaStaff-iOS-AppStore.zip'), zipBuffer);
console.log('Created SpaStaff-iOS-AppStore.zip (' + zipBuffer.length + ' bytes)');
