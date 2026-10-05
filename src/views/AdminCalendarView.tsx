import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, UserCheck, Palmtree } from 'lucide-react';
import { AttendanceRecord, LeaveRequest, User } from '../types';
import {
  LEAVE_TYPE_MAP,
  makeDateKey,
  THAI_DAYS,
  THAI_MONTHS,
} from '../utils/dateUtils';

interface AdminCalendarViewProps {
  year: number;
  month: number;
  holidays: Record<string, string>;
  attendanceMap: Record<string, AttendanceRecord>;
  leaves: LeaveRequest[];
  todayKey: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
}

export const AdminCalendarView: React.FC<AdminCalendarViewProps> = ({
  year,
  month,
  holidays,
  attendanceMap,
  leaves,
  todayKey,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}) => {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="aspect-square invisible" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = makeDateKey(year, month, day);
    const isHoliday = !!holidays[dateKey];
    const isToday = dateKey === todayKey;

    // Filter leaves on this date
    const leavesOnDay = leaves.filter(
      (l) => l.date === dateKey && l.status !== 'rejected'
    );
    const dayOffCount = leavesOnDay.filter((l) => l.type === 'dayoff').length;
    const sickCount = leavesOnDay.filter((l) => l.type === 'sick').length;

    // Check if anyone was late on this day
    const anyLate = Object.keys(attendanceMap).some((k) => {
      const parts = k.split('|');
      return parts[1] === dateKey && attendanceMap[k].late > 0;
    });

    let cellBg = 'bg-white dark:bg-[#172A27] text-slate-800 dark:text-slate-100';
    let borderStyle = 'border border-slate-200/80 dark:border-[#254039]';

    if (dayOffCount > 0 && !anyLate) {
      cellBg = 'bg-[#CCFBF1]/40 dark:bg-[#143D36]/40 text-slate-800 dark:text-slate-100';
      borderStyle = 'border-[#0D9488]/30';
    }

    if (isHoliday) {
      borderStyle += ' ring-2 ring-[#C99A3B] ring-inset';
    }

    if (isToday) {
      borderStyle += ' outline-2 outline-[#2F7D6D] outline-offset-1';
    }

    cells.push(
      <button
        key={dateKey}
        type="button"
        onClick={() => onSelectDate(dateKey)}
        className={`aspect-square rounded-2xl ${cellBg} ${borderStyle} p-1 flex flex-col items-center justify-between text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer`}
      >
        <div className="w-full flex items-center justify-between px-1">
          <span className="text-[13px] leading-none mt-1 font-semibold">{day}</span>
          {anyLate && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="มีพนักงานมาสาย" />
          )}
        </div>

        {/* Day Off badge or leave dots */}
        {dayOffCount > 0 ? (
          <span className="text-[9px] font-bold px-1 py-0.2 rounded-md bg-[#0D9488]/15 text-[#0D9488] dark:text-[#5EEAD4] leading-tight mb-0.5 truncate max-w-full">
            หยุด {dayOffCount}
          </span>
        ) : (
          <div className="flex items-center gap-0.5 h-3 mb-0.5">
            {leavesOnDay.slice(0, 3).map((l) => (
              <span
                key={l.id}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: LEAVE_TYPE_MAP[l.type].color,
                  opacity: l.status === 'pending' ? 0.45 : 1,
                }}
                title={LEAVE_TYPE_MAP[l.type].label}
              />
            ))}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onPrevMonth}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-[#254039] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1B3A34] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold text-[#17332F] dark:text-[#E4F0ED] tracking-tight">
              {THAI_MONTHS[month]} {year + 543}
            </h2>
            <p className="text-[11px] text-slate-400">แตะวันที่เพื่อลงวันหยุดให้พนักงาน หรือตั้งวันหยุดร้าน</p>
          </div>

          <button
            type="button"
            onClick={onNextMonth}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-[#254039] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1B3A34] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Assign Action Bar */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => onSelectDate(todayKey)}
            className="w-full py-2.5 px-3 bg-[#E1F0EC] hover:bg-[#d0e9e3] dark:bg-[#1B3A34] dark:hover:bg-[#234b43] text-[#2F7D6D] dark:text-[#4FB39F] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#2F7D6D]/20 shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            <span>+ ลงวันหยุดปกติ / วันลาให้พนักงาน (แตะเลือกวันที่หรือแตะตรงนี้)</span>
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-semibold text-slate-400 dark:text-[#8FAAA4]">
          {THAI_DAYS.map((d, idx) => (
            <div
              key={d}
              className={`py-1 ${idx === 0 ? 'text-rose-500 font-bold' : ''}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 gap-1.5">{cells}</div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#254039] flex flex-wrap gap-x-3.5 gap-y-2 text-xs text-slate-500 dark:text-[#8FAAA4]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#CCFBF1] border border-[#0D9488]" />
            <span className="font-semibold text-[#0D9488]">วันหยุดปกติ (สัปดาห์ละ 1 วัน/ลากยาว)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md border-2 border-[#C99A3B]" />
            <span>วันหยุดร้าน</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>มีคนมาสาย</span>
          </span>
          {Object.entries(LEAVE_TYPE_MAP).map(([key, item]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
