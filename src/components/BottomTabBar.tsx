import React from 'react';
import { Home, Calendar, FileText, Users, CheckSquare, Settings, User as UserIcon } from 'lucide-react';
import { Role } from '../types';

export type AdminTab = 'today' | 'req' | 'cal' | 'pay' | 'staff' | 'set';
export type StaffTab = 'home' | 'cal' | 'slip' | 'me';

interface BottomTabBarProps {
  role: Role;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingLeaveCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  role,
  currentTab,
  onSelectTab,
  pendingLeaveCount,
}) => {
  const adminTabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'today', label: 'วันนี้', icon: <Home className="w-5 h-5" /> },
    { id: 'req', label: 'คำขอลา', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'cal', label: 'ปฏิทิน', icon: <Calendar className="w-5 h-5" /> },
    { id: 'pay', label: 'เงินเดือน', icon: <FileText className="w-5 h-5" /> },
    { id: 'staff', label: 'พนักงาน', icon: <Users className="w-5 h-5" /> },
    { id: 'set', label: 'ตั้งค่า', icon: <Settings className="w-5 h-5" /> },
  ];

  const staffTabs: Array<{ id: StaffTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'หน้าแรก', icon: <Home className="w-5 h-5" /> },
    { id: 'cal', label: 'ปฏิทิน', icon: <Calendar className="w-5 h-5" /> },
    { id: 'slip', label: 'สลิป', icon: <FileText className="w-5 h-5" /> },
    { id: 'me', label: 'ฉัน', icon: <UserIcon className="w-5 h-5" /> },
  ];

  const tabs = role === 'admin' ? adminTabs : staffTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#172A27]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#254039] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const showBadge = tab.id === 'req' && pendingLeaveCount > 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex-1 py-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[48px] ${
                isActive
                  ? 'text-[#2F7D6D] dark:text-[#4FB39F] font-semibold'
                  : 'text-slate-500 dark:text-[#8FAAA4] hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {pendingLeaveCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[56px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#2F7D6D] dark:bg-[#4FB39F] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
