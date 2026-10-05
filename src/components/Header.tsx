import React from 'react';
import { LogOut, Moon, Sun, RotateCcw, Users, Smartphone } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  demoMode?: boolean;
  currentUser: User;
  storeName: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  onResetData: () => void;
  onQuickSwitchUser: (user: User) => void;
  onOpenInstallModal: () => void;
  allUsers: User[];
}

export const Header: React.FC<HeaderProps> = ({
  demoMode = false,
  currentUser,
  storeName,
  theme,
  onToggleTheme,
  onLogout,
  onResetData,
  onQuickSwitchUser,
  onOpenInstallModal,
  allUsers,
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#17332F] dark:bg-[#0B1413] text-white shadow-md">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* User Info / Role */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8FAAA4] font-medium truncate">
              {currentUser.role === 'admin' ? 'ผู้ดูแลร้าน' : currentUser.pos || 'พนักงาน'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#2F7D6D]/40 text-[#4FB39F] border border-[#4FB39F]/30">
              {storeName.slice(0, 10)}
            </span>
          </div>
          <h2 className="text-base font-bold tracking-tight truncate leading-tight text-white">
            {currentUser.name}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Install / Download App button */}
          <button
            type="button"
            onClick={onOpenInstallModal}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2F7D6D] to-[#205b50] hover:from-[#25685b] hover:to-[#17463d] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
            title="ดาวน์โหลด APK และติดตั้งแอพลง Android"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#5EEAD4]" />
            <span className="hidden sm:inline">โหลด APK / แอพ</span>
            <span className="sm:hidden text-[11px] font-bold text-[#5EEAD4]">APK</span>
          </button>

          {/* Quick Switch User Dropdown */}
          {demoMode && <div className="relative">
            <button
              type="button"
              onClick={() => setShowSwitchMenu((prev) => !prev)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
              title="สลับบัญชีทดสอบ"
            >
              <Users className="w-4 h-4" />
            </button>

            {showSwitchMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#172A27] rounded-2xl shadow-xl border border-slate-200 dark:border-[#254039] p-2 text-slate-800 dark:text-slate-200 z-50 animate-fade-in"
                onClick={() => setShowSwitchMenu(false)}
              >
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">
                  สลับผู้ใช้งาน:
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onQuickSwitchUser(u)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#1B3A34] transition-colors ${
                      u.id === currentUser.id ? 'bg-[#E1F0EC] dark:bg-[#1B3A34] text-[#2F7D6D] font-bold' : ''
                    }`}
                  >
                    <span className="truncate">{u.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400">
                      {u.role === 'admin' ? 'Admin' : u.user}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          }
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
            title={theme === 'dark' ? 'โหมดสว่าง' : 'โหมดมืด'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Reset Demo Data */}
          {demoMode && <button
            type="button"
            onClick={() => {
              if (window.confirm('ต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                onResetData();
              }
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            title="รีเซ็ตข้อมูลตัวอย่าง"
          >
            <RotateCcw className="w-4 h-4" />
          </button>}

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="px-2.5 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-medium transition-colors flex items-center gap-1 text-slate-200 hover:text-white"
            title="ออกจากระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ออก</span>
          </button>
        </div>
      </div>
    </header>
  );
};
