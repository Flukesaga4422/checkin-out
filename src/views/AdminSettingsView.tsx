import React, { useRef, useState } from 'react';
import { Settings, Clock, Store, Lock, Download, Upload, Trash2, CheckCircle, AlertTriangle, Smartphone, ExternalLink, QrCode } from 'lucide-react';
import { SpaDatabase, User } from '../types';
import { getTodayKey, playSound } from '../utils/dateUtils';

interface AdminSettingsViewProps {
  db: SpaDatabase;
  currentUser: User;
  onUpdateShopAndStart: (shop: string, start: string) => Promise<boolean> | boolean | void;
  onUpdateAdminPassword: (newPass: string) => Promise<boolean> | boolean | void;
  onImportBackup: (importedDb: SpaDatabase) => void;
  onFactoryReset: () => void;
  onOpenInstallModal?: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  db,
  currentUser,
  onUpdateShopAndStart,
  onUpdateAdminPassword,
  onImportBackup,
  onFactoryReset,
  onOpenInstallModal,
}) => {
  const [shopName, setShopName] = useState(db.shop || 'ร้านนวดและสปา');
  const [startTime, setStartTime] = useState(db.start || '10:00');
  const [storeSaved, setStoreSaved] = useState(false);

  // Password state
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // Factory reset state
  const [resetConfirmStep, setResetConfirmStep] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await onUpdateShopAndStart(shopName.trim() || 'ร้านนวดและสปา', startTime);
    if (saved === false) return;
    playSound('success');
    setStoreSaved(true);
    setTimeout(() => setStoreSaved(false), 2500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (p1.trim().length < 8) {
      setPwError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (p1 !== p2) {
      setPwError('รหัสผ่านสองช่องไม่ตรงกัน');
      return;
    }

    const saved = await onUpdateAdminPassword(p1.trim());
    if (saved === false) return;
    setP1('');
    setP2('');
    setPwError('');
    setPwSuccess(true);
    playSound('success');
    setTimeout(() => setPwSuccess(false), 3000);
  };

  // Export JSON backup
  const handleDownloadBackup = () => {
    try {
      const dataStr = JSON.stringify(db, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spa-backup-${getTodayKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      playSound('success');
    } catch (err) {
      console.error('Backup download error:', err);
    }
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    file.text().then((text) => {
      try {
        const obj = JSON.parse(text);
        if (!Array.isArray(obj.users) || typeof obj.att !== 'object') {
          throw new Error('Invalid format');
        }
        onImportBackup(obj);
        playSound('success');
      } catch (err) {
        alert('ไฟล์สำรองไม่ถูกต้อง หรือรูปแบบไฟล์เสียหาย');
      }
    });
  };

  // Factory reset
  const handleResetClick = () => {
    if (!resetConfirmStep) {
      setResetConfirmStep(true);
      playSound('click');
      return;
    }

    onFactoryReset();
    playSound('checkout');
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in text-xs">
      <h2 className="text-lg font-bold text-[#17332F] dark:text-[#E4F0ED] tracking-tight px-1">
        ตั้งค่า
      </h2>

      {/* Android APK & iOS App Store Hub Card */}
      <div className="bg-gradient-to-br from-emerald-50 via-[#E1F0EC]/60 to-blue-50 dark:from-[#1B3A34] dark:to-[#152735] rounded-3xl p-5 border border-[#2F7D6D]/40 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#2F7D6D] dark:text-[#4FB39F]" />
            <h3 className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED]">
              ดาวน์โหลดแอพ & แพ็กเกจสโตร์ (Android & iOS)
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2F7D6D] text-white font-bold">
            v2.0 พร้อมส่งสโตร์
          </span>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
          ดาวน์โหลดไฟล์ APK สำหรับติดตั้งบน Android หรือดาวน์โหลดแพ็กเกจ Xcode / Capacitor พร้อมนำขึ้น Apple App Store และ TestFlight
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <a
            href="/SpaStaff-Android.apk"
            download="SpaStaff-Android.apk"
            onClick={() => playSound('success')}
            className="py-2.5 px-3 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-[0.98] text-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>โหลด APK (Android)</span>
          </a>

          <a
            href="/SpaStaff-iOS-AppStore.zip"
            download="SpaStaff-iOS-AppStore.zip"
            onClick={() => playSound('success')}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-[0.98] text-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>แพ็กเกจ App Store (.zip)</span>
          </a>

          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#172A27] border border-slate-300 dark:border-[#254039] hover:border-[#2F7D6D] text-[#17332F] dark:text-[#E4F0ED] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#2F7D6D]" />
              <span>QR Code & คู่มือสโตร์</span>
            </button>
          )}
        </div>
      </div>

      {/* Store Info & Shift Start */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-[#2F7D6D] dark:text-[#4FB39F]" />
          <h3 className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED]">
            ข้อมูลร้านและเวลาเข้างาน
          </h3>
        </div>

        <form onSubmit={handleSaveStore} className="space-y-3">
          <div>
            <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1 font-medium">
              ชื่อร้าน
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1 font-medium">
              เวลาเข้างาน (เกินเวลานี้ = มาสาย)
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm font-mono text-slate-800 dark:text-slate-100"
            />
          </div>

          {storeSaved && (
            <div className="p-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-1.5 font-medium animate-fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>บันทึกการตั้งค่าร้านแล้ว</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold shadow-sm transition-transform active:scale-[0.98]"
          >
            บันทึกข้อมูลร้าน
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#2F7D6D] dark:text-[#4FB39F]" />
          <h3 className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED]">
            เปลี่ยนรหัสผ่านของฉัน
          </h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
              รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)
            </label>
            <input
              type="password"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              placeholder="••••"
              autoComplete="new-password"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm font-mono text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
              พิมพ์ซ้ำอีกครั้ง
            </label>
            <input
              type="password"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              placeholder="••••"
              autoComplete="new-password"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm font-mono text-slate-800 dark:text-slate-100"
            />
          </div>

          {pwError && (
            <div className="p-2.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl">
              {pwError}
            </div>
          )}

          {pwSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl flex items-center gap-1.5 font-medium animate-fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>เปลี่ยนรหัสผ่านผู้ดูแลแล้ว</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-[#1B3A34] hover:bg-slate-900 text-white font-semibold transition-colors"
          >
            บันทึกรหัสผ่านใหม่
          </button>
        </form>
      </div>

      {/* Backup and Restore Card */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED] flex items-center gap-2">
          <Download className="w-4 h-4 text-[#2F7D6D]" />
          <span>สำรองข้อมูล</span>
        </h3>
        <p className="text-slate-500 dark:text-[#8FAAA4] leading-relaxed">
          ข้อมูลเก็บอยู่ในเครื่องนี้ ควรดาวน์โหลดไฟล์สำรองไว้เป็นประจำเพื่อความปลอดภัย
        </p>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="w-full py-2.5 px-4 rounded-xl border border-[#2F7D6D] text-[#2F7D6D] dark:text-[#4FB39F] font-semibold flex items-center justify-center gap-2 hover:bg-[#E1F0EC]/50 dark:hover:bg-[#1B3A34] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลดไฟล์สำรอง</span>
          </button>

          <label className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-[#254039] text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-[#1B3A34] transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>นำเข้าไฟล์สำรอง (.json)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {/* Factory Reset Card */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs space-y-2">
        <button
          type="button"
          onClick={handleResetClick}
          className={`w-full py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 ${
            resetConfirmStep
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>
            {resetConfirmStep
              ? 'กดอีกครั้งเพื่อยืนยัน ข้อมูลทั้งหมดจะหาย'
              : 'ล้างข้อมูลทั้งหมดและเริ่มใหม่'}
          </span>
        </button>
      </div>
    </div>
  );
};
