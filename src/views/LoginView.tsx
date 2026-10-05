import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Smartphone, Download } from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  users: User[];
  shopName: string;
  onLogin: (user: User) => void;
  onOpenInstallModal?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  shopName,
  onLogin,
  onOpenInstallModal,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const isStandaloneMode =
      (window.navigator as unknown as { standalone?: boolean }).standalone ||
      window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(!!isStandaloneMode);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(
      (u) => u.user.trim().toLowerCase() === username.trim().toLowerCase() && u.pass === password
    );

    if (!found) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return;
    }

    setError('');
    onLogin(found);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-[#172A27] rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-[#254039]">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E1F0EC] dark:bg-[#1B3A34] text-[#2F7D6D] dark:text-[#4FB39F] mx-auto flex items-center justify-center mb-3 shadow-xs">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#17332F] dark:text-[#E4F0ED] tracking-tight">
            ยินดีต้อนรับ
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-[#8FAAA4] mt-0.5">
            {shopName || 'ร้านนวดและสปา'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#8FAAA4] mb-1">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              id="u"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ชื่อผู้ใช้งาน"
              autoCapitalize="none"
              autoComplete="username"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-[#17332F] dark:text-[#E4F0ED] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7D6D]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#8FAAA4] mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              id="pw"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-[#17332F] dark:text-[#E4F0ED] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F7D6D]"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold text-sm shadow-md shadow-[#2F7D6D]/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer"
          >
            <span>เข้าสู่ระบบ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Install / Download App Card */}
        {onOpenInstallModal && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-[#E1F0EC]/80 to-emerald-50 dark:from-[#1B3A34]/50 dark:to-[#0F1B19] border border-[#2F7D6D]/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                <Smartphone className="w-4 h-4 text-[#2F7D6D] dark:text-[#4FB39F]" />
                <span>ติดตั้งแอพบนมือถือ (Android & iOS)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2F7D6D] text-white font-semibold">
                APK / PWA
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              สแกน QR Code หรือกดติดตั้งเพื่อใช้งานเป็นแอพจริงบนหน้าจอหลัก ไม่ต้องโหลดจาก Store
            </p>
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="w-full py-2.5 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>เปิดลิงก์ดาวน์โหลดและวิธีติดตั้ง</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
