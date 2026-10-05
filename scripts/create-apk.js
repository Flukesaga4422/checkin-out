import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal standard ZIP generator without third-party dependencies
class SimpleZip {
  constructor() {
    this.entries = [];
  }

  addFile(name, content) {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    // Deflate compression
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

      // Local file header (30 bytes + name)
      const local = Buffer.alloc(30 + nameBuf.length);
      local.writeUInt32LE(0x04034b50, 0); // Signature
      local.writeUInt16LE(20, 4); // Version needed (2.0)
      local.writeUInt16LE(0, 6); // Flags
      local.writeUInt16LE(8, 8); // Compression method (8 = deflate)
      local.writeUInt16LE(0x4000, 10); // Time (12:00:00)
      local.writeUInt16LE(0x56a5, 12); // Date (2025-05-05)
      local.writeUInt32LE(entry.crc, 14); // CRC-32
      local.writeUInt32LE(entry.compressedSize, 18); // Compressed size
      local.writeUInt32LE(entry.uncompressedSize, 22); // Uncompressed size
      local.writeUInt16LE(nameBuf.length, 26); // File name length
      local.writeUInt16LE(0, 28); // Extra field length
      nameBuf.copy(local, 30);

      const localOffset = offset;
      localHeaders.push(local, entry.data);
      offset += local.length + entry.data.length;

      // Central directory header (46 bytes + name)
      const central = Buffer.alloc(46 + nameBuf.length);
      central.writeUInt32LE(0x02014b50, 0); // Signature
      central.writeUInt16LE(20, 4); // Version made by
      central.writeUInt16LE(20, 6); // Version needed
      central.writeUInt16LE(0, 8); // Flags
      central.writeUInt16LE(8, 10); // Compression method (8)
      central.writeUInt16LE(0x4000, 12); // Time
      central.writeUInt16LE(0x56a5, 14); // Date
      central.writeUInt32LE(entry.crc, 16); // CRC-32
      central.writeUInt32LE(entry.compressedSize, 20); // Compressed size
      central.writeUInt32LE(entry.uncompressedSize, 24); // Uncompressed size
      central.writeUInt16LE(nameBuf.length, 28); // File name length
      central.writeUInt16LE(0, 30); // Extra field length
      central.writeUInt16LE(0, 32); // File comment length
      central.writeUInt16LE(0, 34); // Disk number start
      central.writeUInt16LE(0, 36); // Internal file attributes
      central.writeUInt32LE(0, 38); // External file attributes
      central.writeUInt32LE(localOffset, 42); // Relative offset of local header
      nameBuf.copy(central, 46);

      centralHeaders.push(central);
    }

    const centralDirStart = offset;
    let centralDirSize = 0;
    for (const ch of centralHeaders) {
      centralDirSize += ch.length;
    }

    // End of central directory record (22 bytes)
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // Signature
    eocd.writeUInt16LE(0, 4); // Number of this disk
    eocd.writeUInt16LE(0, 6); // Disk with central directory
    eocd.writeUInt16LE(this.entries.length, 8); // Total entries this disk
    eocd.writeUInt16LE(this.entries.length, 10); // Total entries
    eocd.writeUInt32LE(centralDirSize, 12); // Size of central directory
    eocd.writeUInt32LE(centralDirStart, 16); // Offset of central directory
    eocd.writeUInt16LE(0, 20); // Comment length

    return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
  }
}

// Generate CRC32 lookup table
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

// Create APK package
const zip = new SimpleZip();

// AndroidManifest.xml (Binary or standard Android manifest)
const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.spastaff.app"
    android:versionCode="2"
    android:versionName="2.0.0">
    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <application
        android:label="ระบบพนักงานร้านสปา"
        android:icon="@drawable/icon"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|keyboardHidden|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

zip.addFile('AndroidManifest.xml', manifestContent);

// Add Icon
const icon192Path = path.resolve('public/icon-192.png');
if (fs.existsSync(icon192Path)) {
  zip.addFile('res/drawable-xxhdpi/icon.png', fs.readFileSync(icon192Path));
  zip.addFile('res/drawable/icon.png', fs.readFileSync(icon192Path));
}

// Add META-INF
const metaManifest = `Manifest-Version: 1.0
Created-By: 2.0.0 (SpaStaff Android Packager)
Built-By: Spa Staff Management System
App-Name: Spa Staff App
`;
zip.addFile('META-INF/MANIFEST.MF', metaManifest);

// Add web app config
const webappConfig = JSON.stringify({
  name: "ระบบพนักงานร้านสปา (Spa Staff)",
  version: "2.0.0",
  package: "com.spastaff.app",
  start_url: "/",
  display: "standalone",
  theme_color: "#17332F",
  builtAt: new Date().toISOString()
}, null, 2);
zip.addFile('assets/app-config.json', webappConfig);

// Write to public/SpaStaff-Android.apk and public/spa-staff.apk
const apkBuffer = zip.toBuffer();
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'SpaStaff-Android.apk'), apkBuffer);
fs.writeFileSync(path.join(publicDir, 'spa-staff.apk'), apkBuffer);

console.log('Successfully created APK files at:');
console.log(' - /public/SpaStaff-Android.apk (' + apkBuffer.length + ' bytes)');
console.log(' - /public/spa-staff.apk (' + apkBuffer.length + ' bytes)');
