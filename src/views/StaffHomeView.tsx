import React, { useEffect, useState } from 'react';
import { Camera, CheckCircle2, LogOut, Clock, Calendar, Sparkles, Palmtree } from 'lucide-react';
import { AttendanceRecord, LeaveRequest, User } from '../types';
import {
  formatCurrency,
  formatThaiDate,
  getNowTimeStr,
  padZero,
  playSound,
  THAI_MONTHS,
} from '../utils/dateUtils';

interface StaffHomeViewProps {
  currentUser: User;
  todayKey: string;
  startTime: string;
  todayRecord?: AttendanceRecord;
  monthStats: { workDays: number; lateDays: number; leaveDays: number };
  recentRecords: Array<{ dateKey: string; record: AttendanceRecord }>;
  onOpenCheckInCamera: () => void;
  onCheckOut: () => void;
  onSelectDate?: (dateKey: string) => void;
}

export const StaffHomeView: React.FC<StaffHomeViewProps> = ({
  currentUser,
  todayKey,
  startTime,
  todayRecord,
  monthStats,
  recentRecords,
  onOpenCheckInCamera,
  onCheckOut,
  onSelectDate,
}) => {
  const [liveClock, setLiveClock] = useState<string>(getNowTimeStr());

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLiveClock(`${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const todayDisplay = `${now.getDate()} ${THAI_MONTHS[now.getMonth()]} ${now.getFullYear() + 543}`;

  const isCheckedIn = !!todayRecord;
  const isCheckedOut = !!todayRecord?.out;

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Big Hero Card */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-[#254039] text-center flex flex-col items-center">
        {/* Live Clock & Date */}
        <div className="text-4xl font-extrabold tracking-wider font-mono text-[#17332F] dark:text-[#E4F0ED]">
          {liveClock}
        </div>
        <div className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-1 flex items-center justify-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#2F7D6D] dark:text-[#4FB39F]" />
          <span>{todayDisplay}</span>
          <span>·</span>
          <span>เข้างาน {startTime} น.</span>
        </div>

        {/* Central Punch Ring */}
        <div className="my-6">
          {!isCheckedIn ? (
            /* Check-in Ring */
            <div className="relative group">
              <div className="w-48 h-48 rounded-full bg-[#E1F0EC] dark:bg-[#1B3A34] flex items-center justify-center p-3 animate-pulse duration-1000">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onOpenCheckInCamera();
                  }}
                  className="w-40 h-40 rounded-full bg-[#2F7D6D] hover:bg-[#27685b] text-white flex flex-col items-center justify-center gap-1.5 shadow-xl shadow-[#2F7D6D]/30 transition-all active:scale-95 group-hover:scale-102 cursor-pointer"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-lg font-bold leading-tight">เช็คอิน</span>
                  <span className="text-xs text-white/80 font-normal">ถ่ายรูปเข้างาน</span>
                </button>
              </div>
            </div>
          ) : !isCheckedOut ? (
            /* Check-out Ring */
            <div className="relative group">
              <div className="w-48 h-48 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center p-3">
                <button
                  type="button"
                  onClick={() => {
                    playSound('checkout');
                    onCheckOut();
                  }}
                  className="w-40 h-40 rounded-full bg-[#C99A3B] hover:bg-[#b0842e] text-white flex flex-col items-center justify-center gap-1.5 shadow-xl shadow-[#C99A3B]/30 transition-all active:scale-95 group-hover:scale-102 cursor-pointer"
                >
                  <LogOut className="w-8 h-8" />
                  <span className="text-lg font-bold leading-tight">เช็คเอาท์</span>
                  <span className="text-xs text-white/90 font-normal">ออกงาน</span>
                </button>
              </div>
            </div>
          ) : (
            /* Completed Ring */
            <div className="w-48 h-48 rounded-full bg-[#E1F0EC]/60 dark:bg-[#1B3A34]/60 border-2 border-dashed border-[#2F7D6D]/30 flex flex-col items-center justify-center p-4">
              <CheckCircle2 className="w-10 h-10 text-[#2F7D6D] dark:text-[#4FB39F] mb-1.5" />
              <div className="text-base font-bold text-[#2F7D6D] dark:text-[#4FB39F]">
                วันนี้เสร็จสิ้นแล้ว
              </div>
              <div className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-0.5">
                พักผ่อน เจอกันพรุ่งนี้ค่ะ
              </div>
            </div>
          )}
        </div>

        {/* Today's shift info pill */}
        {todayRecord && (
          <div className="w-full max-w-xs bg-slate-50 dark:bg-[#1B3A34]/50 rounded-2xl p-3 border border-slate-200/60 dark:border-[#254039] flex items-center justify-between text-xs">
            <div className="text-left">
              <span className="text-slate-400 block text-[10px]">เวลาเข้างาน</span>
              <span className="font-mono font-bold text-sm text-[#17332F] dark:text-[#E4F0ED]">
                {todayRecord.in} น.
              </span>
            </div>

            <div className="text-center">
              <span className="text-slate-400 block text-[10px]">เวลาออกงาน</span>
              <span className="font-mono font-bold text-sm text-[#17332F] dark:text-[#E4F0ED]">
                {todayRecord.out ? `${todayRecord.out} น.` : '-'}
              </span>
            </div>

            <div>
              {todayRecord.late > 0 ? (
                <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold">
                  สาย {todayRecord.late} น.
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                  ตรงเวลา
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Day Off / Leave Action */}
      {onSelectDate && (
        <button
          type="button"
          onClick={() => onSelectDate(todayKey)}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#E1F0EC] to-emerald-50 dark:from-[#1B3A34] dark:to-[#172A27] hover:border-[#0D9488] border border-[#2F7D6D]/30 rounded-2xl flex items-center justify-between text-xs font-semibold text-[#17332F] dark:text-[#E4F0ED] shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0D9488]/15 text-[#0D9488] dark:text-[#5EEAD4] flex items-center justify-center shrink-0">
              <Palmtree className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold block text-xs text-[#0D9488] dark:text-[#5EEAD4]">
                ลงวันหยุดปกติ / ยื่นขอลา
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#8FAAA4] font-normal block">
                วันหยุดสัปดาห์ละ 1 วัน หรือสะสมหยุดยาว / ลาป่วยแนบใบรับรองแพทย์
              </span>
            </div>
          </div>
          <span className="text-xs text-[#2F7D6D] dark:text-[#4FB39F] font-bold group-hover:translate-x-0.5 transition-transform shrink-0">
            ลงวันหยุด &rarr;
          </span>
        </button>
      )}

      {/* Month Stats Summary Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-base font-bold text-[#17332F] dark:text-[#E4F0ED]">
            เดือนนี้ของฉัน ({THAI_MONTHS[now.getMonth()]})
          </h2>
          <span className="text-xs text-slate-500 dark:text-[#8FAAA4]">
            {currentUser.name}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white dark:bg-[#172A27] rounded-2xl p-3.5 border border-slate-200/80 dark:border-[#254039] text-center shadow-xs">
            <div className="text-2xl font-bold font-mono text-[#2F7D6D] dark:text-[#4FB39F]">
              {monthStats.workDays}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-0.5">
              วันมาทำงาน
            </div>
          </div>

          <div className="bg-white dark:bg-[#172A27] rounded-2xl p-3.5 border border-slate-200/80 dark:border-[#254039] text-center shadow-xs">
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {monthStats.lateDays}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-0.5">
              วันมาสาย
            </div>
          </div>

          <div className="bg-white dark:bg-[#172A27] rounded-2xl p-3.5 border border-slate-200/80 dark:border-[#254039] text-center shadow-xs">
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {monthStats.leaveDays}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-0.5">
              วันลา (อนุมัติ)
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Mini List */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs">
        <h3 className="text-sm font-bold text-[#17332F] dark:text-[#E4F0ED] mb-3 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#2F7D6D] dark:text-[#4FB39F]" />
          <span>ประวัติเข้างานล่าสุด</span>
        </h3>

        {recentRecords.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-[#254039]">
            {recentRecords.slice(0, 5).map(({ dateKey, record }) => (
              <div key={dateKey} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {formatThaiDate(dateKey)}
                  </span>
                  <span className="text-slate-400">
                    เข้า {record.in} น. {record.out ? `· ออก ${record.out} น.` : ''}
                  </span>
                </div>

                <div>
                  {record.late > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 font-medium">
                      สาย {record.late} น.
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
                      ตรงเวลา
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            ยังไม่มีบันทึกเข้างาน
          </div>
        )}
      </div>
    </div>
  );
};
