import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileCode,
  Layers,
  Info,
  Apple,
  Share2,
  Bookmark,
  CheckCircle2,
  Box,
  Terminal,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { playSound } from '../utils/dateUtils';

interface InstallAppModalProps {
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  // Default to iOS tab if on iPhone/iPad, otherwise APK
  const [activeTab, setActiveTab] = useState<'apk' | 'ios' | 'store' | 'qr'>(() => {
    return isIOS ? 'ios' : 'apk';
  });

  // App public URL
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-kel3lisfnw3blhidyzntkk-968360040779.asia-east1.run.app';

  // Live QR Code generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=FFFFFF&color=17332F&margin=1`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    playSound('success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      playSound('success');
    }
  };

  const handleDownloadClick = () => {
    playSound('success');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#172A27] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#254039] flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#254039] bg-[#E1F0EC]/60 dark:bg-[#1B3A34]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2F7D6D] text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17332F] dark:text-[#E4F0ED] leading-tight">
                ดาวน์โหลดและติดตั้งแอพ (Android & iOS)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8FAAA4]">
                ไฟล์ APK Android, ติดตั้งลง iPhone / iPad และแพ็กเกจเตรียมส่ง App Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19]/50 px-2 sm:px-3 pt-2 text-xs font-semibold gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-2.5 sm:px-3 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-[#172A27] text-[#2F7D6D] dark:text-[#4FB39F] border-t border-x border-slate-200 dark:border-[#254039] shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>🤖 Android APK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-2.5 sm:px-3 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-[#172A27] text-[#2F7D6D] dark:text-[#4FB39F] border-t border-x border-slate-200 dark:border-[#254039] shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>🍎 iOS / iPhone</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`py-2 px-2.5 sm:px-3 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'store'
                ? 'bg-white dark:bg-[#172A27] text-[#2F7D6D] dark:text-[#4FB39F] border-t border-x border-slate-200 dark:border-[#254039] shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>🚀 เตรียมลง App Store</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-2.5 sm:px-3 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-[#172A27] text-[#2F7D6D] dark:text-[#4FB39F] border-t border-x border-slate-200 dark:border-[#254039] shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR & ลิงก์</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {/* TAB 1: ANDROID APK */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              {/* Highlight Official APK Card */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 via-[#E1F0EC]/60 to-teal-50 dark:from-[#1B3A34] dark:to-[#0F1B19] rounded-2xl border border-[#2F7D6D]/40 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#2F7D6D] text-white font-bold text-[10px] tracking-wide mb-1">
                      OFFICIAL ANDROID APK
                    </span>
                    <h4 className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED]">
                      SpaStaff-Android.apk (v2.0 ตัวจริง)
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                      แพ็กเกจติดตั้งสำหรับสมาร์ทโฟน Android ทุกรุ่น (Samsung, OPPO, Vivo, Xiaomi, Realme ฯลฯ)
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#172A27] border border-[#2F7D6D]/30 flex items-center justify-center text-[#2F7D6D] dark:text-[#4FB39F] shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-[#172A27]/60 p-2.5 rounded-xl border border-[#2F7D6D]/20">
                  <span>📱 ขนาด: ~19 KB</span>
                  <span>·</span>
                  <span>⚙️ Android: 5.0 - 15+</span>
                  <span>·</span>
                  <span>⚡ โหลดเสร็จเปิดติดตั้งได้ทันที</span>
                </div>

                <a
                  href="/SpaStaff-Android.apk"
                  download="SpaStaff-Android.apk"
                  onClick={handleDownloadClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-bold text-sm shadow-md shadow-[#2F7D6D]/25 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดไฟล์ APK สำหรับ Android (กดตรงนี้)</span>
                </a>
              </div>

              {/* 1-Click WebAPK prompt */}
              {isInstallable && (
                <div className="p-3.5 bg-emerald-50/60 dark:bg-[#1B3A34]/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <strong className="text-xs text-emerald-900 dark:text-emerald-200 block">
                      ⚡ ติดตั้งลง Android 1-Click (WebAPK)
                    </strong>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      ระบบจะสร้างไอคอนแอพจริงบนหน้าจอหลักมือถือทันที
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDirectInstall}
                    className="py-2 px-3 bg-[#2F7D6D] hover:bg-[#27685b] text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
                  >
                    ติดตั้งทันที
                  </button>
                </div>
              )}

              {/* Android Install Steps */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#0F1B19]/50 rounded-2xl border border-slate-200/60 dark:border-[#254039] space-y-1.5">
                <strong className="text-slate-800 dark:text-slate-200 text-xs block">
                  วิธีติดตั้งไฟล์ APK บน Android:
                </strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  <li>กดปุ่มดาวน์โหลดด้านบน ไฟล์ <strong>SpaStaff-Android.apk</strong> จะบันทึกลงในเครื่อง</li>
                  <li>หากมีแจ้งเตือน <em>"ไฟล์อาจเป็นอันตราย"</em> ให้กด <strong>"ดาวน์โหลดต่อไป" (Download anyway)</strong></li>
                  <li>แตะที่ไฟล์ที่ดาวน์โหลดเสร็จ ➔ กด <strong>"ติดตั้ง" (Install)</strong></li>
                  <li>แอพจะปรากฏบนหน้าจอหลัก เปิดใช้งานได้ทันทีพร้อมระบบกล้องและออฟไลน์</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: IOS / IPHONE INSTALLATION */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              {/* iOS Direct Add to Home Screen (Standard Apple PWA) */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/60 dark:from-[#1B3A34] dark:to-[#0F1B19] rounded-2xl border border-blue-200/60 dark:border-blue-900/60 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-slate-900 dark:text-white" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        วิธีติดตั้งลง iPhone / iPad (ผ่าน Safari)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        ติดตั้งเป็น Web App เต็มหน้าจอ ไม่ต้องผ่าน App Store
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step by Step Visual Guide for iOS */}
                <div className="p-3 bg-white dark:bg-[#172A27] rounded-xl border border-slate-200 dark:border-[#254039] space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block">
                        เปิดลิงก์ในเบราว์เซอร์ Safari
                      </span>
                      <p className="text-[11px] text-slate-500">
                        แตะปุ่ม <strong>แชร์ (Share)</strong> ด้านล่างของจอ Safari (ไอคอนสี่เหลี่ยมที่มีลูกศรชี้ขึ้น <Share2 className="w-3.5 h-3.5 inline text-blue-600" />)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block">
                        เลือก "เพิ่มไปยังหน้าจอหลัก" (Add to Home Screen)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        เลื่อนลงมาแล้วแตะที่เมนู <strong>"เพิ่มไปยังหน้าจอหลัก"</strong> (มีไอคอนสี่เหลี่ยมเครื่องหมายบวก <Bookmark className="w-3.5 h-3.5 inline text-slate-600" />)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block">
                        แตะ "เพิ่ม" (Add) มุมขวาบน
                      </span>
                      <p className="text-[11px] text-slate-500">
                        ไอคอน <strong>Spa Staff</strong> จะปรากฏบนหน้าจอหลักของ iPhone/iPad เปิดใช้งานได้แบบเต็มจอเสมือนโหลดจาก App Store
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* iOS Configuration Profile (.mobileconfig) */}
              <div className="p-4 bg-slate-50 dark:bg-[#1B3A34]/30 rounded-2xl border border-slate-200/80 dark:border-[#254039] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#2F7D6D] dark:text-[#4FB39F]" />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                      หรือดาวน์โหลดโปรไฟล์ iOS (.mobileconfig)
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    WebClip
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ไฟล์โปรไฟล์สำหรับติดตั้งลงในเมนู "การตั้งค่า" (Settings) ของ iPhone/iPad เพื่อเพิ่มไอคอนแอปลงหน้าจอหลักอัตโนมัติ
                </p>

                <a
                  href="/SpaStaff.mobileconfig"
                  download="SpaStaff.mobileconfig"
                  onClick={handleDownloadClick}
                  className="w-full py-2.5 px-3 bg-white dark:bg-[#172A27] border border-slate-300 dark:border-[#254039] hover:border-[#2F7D6D] text-slate-800 dark:text-slate-100 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs text-center"
                >
                  <Download className="w-3.5 h-3.5 text-[#2F7D6D]" />
                  <span>ดาวน์โหลด SpaStaff.mobileconfig</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: APP STORE READY PACKAGE & CHECKLIST */}
          {activeTab === 'store' && (
            <div className="space-y-4">
              {/* App Store Bundle Card */}
              <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 dark:from-[#152735] dark:to-[#172A27] rounded-2xl border border-blue-200 dark:border-blue-800 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] tracking-wide mb-1">
                      APP STORE & TESTFLIGHT READY
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      SpaStaff-iOS-AppStore.zip (แพ็กเกจส่งสโตร์)
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                      ไฟล์โครงการครบชุดสำหรับเปิดใน Xcode หรือ Capacitor เพื่อคอมไพล์ขึ้น App Store Connect & TestFlight
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#172A27] border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Box className="w-5 h-5" />
                  </div>
                </div>

                {/* Items included in ZIP */}
                <div className="p-3 bg-white/80 dark:bg-[#172A27]/80 rounded-xl border border-blue-200/60 dark:border-blue-900/50 space-y-1.5 text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">
                    📦 สิ่งที่รวมอยู่ในแพ็กเกจนี้:
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Info.plist</strong> (ขอสิทธิ์กล้อง/รูปภาพเป็นภาษาไทย พร้อม Bundle ID)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>PrivacyInfo.xcprivacy</strong> (Apple Privacy Manifest กฎใหม่ปี 2024/2025)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>AppStore-Metadata.json</strong> (คีย์เวิร์ด, หมวดหมู่, คำอธิบายภาษาไทย)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>AppIcon (1024x1024 & 180x180)</strong> สำหรับขึ้น App Store</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>capacitor.config.json</strong> พร้อมคำสั่งเปิดใน Xcode</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="/SpaStaff-iOS-AppStore.zip"
                  download="SpaStaff-iOS-AppStore.zip"
                  onClick={handleDownloadClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดแพ็กเกจ App Store (.zip)</span>
                </a>
              </div>

              {/* 4 Steps to Submit to App Store */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#0F1B19]/50 rounded-2xl border border-slate-200/60 dark:border-[#254039] space-y-2">
                <strong className="text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  <span>4 ขั้นตอนนำขึ้น Apple App Store & TestFlight:</span>
                </strong>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  <li>
                    <strong>เตรียมบัญชี Apple Developer:</strong> สมัครที่ <a href="https://developer.apple.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">developer.apple.com</a> ($99/ปี)
                  </li>
                  <li>
                    <strong>เปิดโปรเจกต์ใน Mac ด้วย Xcode:</strong> รันคำสั่ง <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">npx cap open ios</code> เพื่อเปิด Xcode
                  </li>
                  <li>
                    <strong>เลือก Signing Team:</strong> ใน Xcode แท็บ <em>Signing & Capabilities</em> เลือกบัญชี Apple Developer Team ของคุณ
                  </li>
                  <li>
                    <strong>Archive & อัปโหลด:</strong> เลือกเมนู <em>Product ➔ Archive</em> แล้วกด <strong>Distribute App</strong> เพื่อส่งเข้า <strong>TestFlight</strong> และยื่นตรวจ <strong>App Store Review</strong> ได้ทันที!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: QR CODE & SHAREABLE LINK */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-[#0F1B19]/60 p-4 rounded-2xl border border-slate-200/60 dark:border-[#254039] text-center space-y-2.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                  สแกนด้วยกล้องมือถือ iPhone หรือ Android
                </span>

                <div className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code สำหรับเปิดแอพ"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                <div className="text-[11px] text-slate-400">
                  สแกนแล้วเปิดด้วย Safari (iOS) หรือ Chrome (Android) เพื่อติดตั้งลงหน้าจอหลักได้ทันที
                </div>
              </div>

              {/* Shareable Link Box */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-[#8FAAA4] block">
                  ลิงก์ส่งต่อให้พนักงาน:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-slate-800 dark:text-slate-200 font-mono text-[11px] select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#172A27] border-t border-slate-100 dark:border-[#254039] flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-1">
            <a
              href="/SpaStaff-Android.apk"
              download="SpaStaff-Android.apk"
              onClick={handleDownloadClick}
              className="py-2.5 px-3 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors flex-1 text-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>โหลด APK (Android)</span>
            </a>

            <a
              href="/SpaStaff-iOS-AppStore.zip"
              download="SpaStaff-iOS-AppStore.zip"
              onClick={handleDownloadClick}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors flex-1 text-center"
            >
              <Box className="w-3.5 h-3.5" />
              <span>แพ็กเกจ iOS (.zip)</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-[#254039] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1B3A34] transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
