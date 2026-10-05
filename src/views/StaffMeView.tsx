import React, { useState } from 'react';
import { User as UserIcon, Lock, CheckCircle, ShieldCheck, Smartphone, Download, QrCode } from 'lucide-react';
import { User } from '../types';
import { playSound } from '../utils/dateUtils';

interface StaffMeViewProps {
  currentUser: User;
  onUpdatePassword: (newPass: string) => void;
  onOpenInstallModal?: () => void;
}

export const StaffMeView: React.FC<StaffMeViewProps> = ({
  currentUser,
  onUpdatePassword,
  onOpenInstallModal,
}) => {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (p1.trim().length < 4) {
      setError('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (p1 !== p2) {
      setError('รหัสผ่านสองช่องไม่ตรงกัน');
      return;
    }

    onUpdatePassword(p1.trim());
    setP1('');
    setP2('');
    setError('');
    setSuccess(true);
    playSound('success');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <h2 className="text-lg font-bold text-[#17332F] dark:text-[#E4F0ED] tracking-tight px-1">
        ข้อมูลของฉัน
      </h2>

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#E1F0EC] dark:bg-[#1B3A34] text-[#2F7D6D] dark:text-[#4FB39F] font-bold text-xl flex items-center justify-center shrink-0 border border-[#2F7D6D]/20">
          {currentUser.name.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base text-[#17332F] dark:text-[#E4F0ED] truncate">
            {currentUser.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-0.5">
            {currentUser.pos || 'พนักงาน'} · user: <code className="font-mono">{currentUser.user}</code>
          </p>
        </div>
      </div>

      {/* Android APK & Install Card */}
      <div className="bg-gradient-to-br from-[#E1F0EC] to-emerald-50 dark:from-[#1B3A34] dark:to-[#0F1B19] rounded-3xl p-5 border border-[#2F7D6D]/40 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#2F7D6D] dark:text-[#4FB39F]" />
            <h3 className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED]">
              ติดตั้งแอพลงมือถือ (Android & iOS)
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2F7D6D] text-white font-bold">
            APK / PWA
          </span>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
          ติดตั้งแอพลงบนหน้าจอหลักมือถือ เพื่อเช็คอินถ่ายรูปเข้างาน ลงวันหยุด และดูสลิปเงินเดือนได้สะดวกรวดเร็ว
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <a
            href="/SpaStaff-Android.apk"
            download="SpaStaff-Android.apk"
            onClick={() => playSound('success')}
            className="py-2.5 px-3 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-[0.98] text-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลด APK Android (19 KB)</span>
          </a>

          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#172A27] border border-[#2F7D6D]/30 hover:border-[#2F7D6D] text-[#2F7D6D] dark:text-[#4FB39F] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>ดู QR Code & วิธีติดตั้ง</span>
            </button>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#2F7D6D] dark:text-[#4FB39F]" />
          <h3 className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED]">
            เปลี่ยนรหัสผ่านของฉัน
          </h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
              รหัสผ่านใหม่ (อย่างน้อย 4 ตัว)
            </label>
            <input
              type="password"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              placeholder="••••"
              autoComplete="new-password"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm text-slate-800 dark:text-slate-100 font-mono"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm text-slate-800 dark:text-slate-100 font-mono"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="p-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-1.5 font-medium animate-fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>เปลี่ยนรหัสผ่านเรียบร้อยแล้ว</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold text-xs shadow-md shadow-[#2F7D6D]/20 transition-transform active:scale-[0.98] cursor-pointer"
          >
            บันทึกรหัสผ่านใหม่
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D6D]" />
        <span>ข้อมูลพนักงานและประวัติการทำงานถูกเข้ารหัสในอุปกรณ์</span>
      </div>
    </div>
  );
};
