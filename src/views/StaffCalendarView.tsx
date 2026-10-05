import React from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, Palmtree, Calendar as CalendarIcon } from 'lucide-react';
import { AttendanceRecord, LeaveRequest, User } from '../types';
import {
  formatThaiDate,
  LEAVE_TYPE_MAP,
  makeDateKey,
  STATUS_MAP,
  THAI_DAYS,
  THAI_MONTHS,
} from '../utils/dateUtils';

interface StaffCalendarViewProps {
  currentUser: User;
  year: number;
  month: number;
  holidays: Record<string, string>;
  attendanceMap: Record<string, AttendanceRecord>;
  userLeaves: LeaveRequest[];
  todayKey: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
}

export const StaffCalendarView: React.FC<StaffCalendarViewProps> = ({
  currentUser,
  year,
  month,
  holidays,
  attendanceMap,
  userLeaves,
  todayKey,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}) => {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  // Empty leading cells
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="aspect-square invisible" />);
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = makeDateKey(year, month, day);
    const attKey = `${currentUser.id}|${dateKey}`;
    const record = attendanceMap[attKey];
    const isHoliday = !!holidays[dateKey];
    const isToday = dateKey === todayKey;
    const leavesOnDay = userLeaves.filter(
      (l) => l.date === dateKey && l.status !== 'rejected'
    );
    const hasDayOff = leavesOnDay.some((l) => l.type === 'dayoff');
    const hasSickLeave = leavesOnDay.some((l) => l.type === 'sick');
    const otherLeave = leavesOnDay.find((l) => l.type !== 'dayoff' && l.type !== 'sick');

    let cellBg = 'bg-white dark:bg-[#172A27] text-slate-800 dark:text-slate-100';
    let borderStyle = 'border border-slate-200/80 dark:border-[#254039]';
    let badgeText = '';
    let badgeClass = '';

    if (record) {
      if (record.late > 0) {
        cellBg = 'bg-rose-600 text-white font-bold shadow-xs';
        borderStyle = 'border-rose-600';
        badgeText = 'สาย';
        badgeClass = 'bg-white/20 text-white';
      } else {
        cellBg = 'bg-[#E1F0EC] dark:bg-[#1B3A34] text-[#17332F] dark:text-[#E4F0ED] font-semibold';
        borderStyle = 'border-[#2F7D6D]/50';
        badgeText = 'เข้างาน';
        badgeClass = 'text-[#2F7D6D] dark:text-[#4FB39F]';
      }
    } else if (hasDayOff) {
      // Highlight Weekly Day Off
      cellBg = 'bg-[#CCFBF1]/75 dark:bg-[#143D36] text-[#0D9488] dark:text-[#5EEAD4] font-semibold';
      borderStyle = 'border-[#0D9488]/40 ring-1 ring-[#0D9488]/30';
      badgeText = 'หยุดปกติ';
      badgeClass = 'bg-[#0D9488]/15 text-[#0D9488] dark:text-[#5EEAD4]';
    } else if (hasSickLeave) {
      cellBg = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold';
      borderStyle = 'border-blue-300 dark:border-blue-900';
      badgeText = 'ลาป่วย';
      badgeClass = 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300';
    } else if (otherLeave) {
      cellBg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold';
      borderStyle = 'border-amber-300 dark:border-amber-900';
      badgeText = LEAVE_TYPE_MAP[otherLeave.type].label;
      badgeClass = 'bg-amber-100 text-amber-800';
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
        <span className="text-[13px] leading-none mt-1 font-semibold">{day}</span>

        {/* Badge or indicator */}
        {badgeText ? (
          <span className={`text-[9px] font-bold px-1 py-0.2 rounded-md ${badgeClass} truncate max-w-full leading-tight mb-0.5`}>
            {badgeText}
          </span>
        ) : (
          <div className="flex items-center gap-0.5 h-3 mb-0.5">
            {leavesOnDay.slice(0, 3).map((l) => (
              <span
                key={l.id}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: record?.late ? '#FFFFFF' : LEAVE_TYPE_MAP[l.type].color,
                  opacity: l.status === 'pending' ? 0.5 : 1,
                }}
                title={LEAVE_TYPE_MAP[l.type].label}
              />
            ))}
          </div>
        )}
      </button>
    );
  }

  // Sorted leaves of current user
  const sortedLeaves = [...userLeaves].sort((a, b) => (b.date < a.date ? -1 : 1));

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Month Navigation & Title */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs">
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
            <p className="text-[11px] text-slate-400">แตะวันที่ในปฏิทินเพื่อลงวันหยุดหรือขอลา</p>
          </div>

          <button
            type="button"
            onClick={onNextMonth}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-[#254039] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1B3A34] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button for Today */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => onSelectDate(todayKey)}
            className="w-full py-2.5 px-3 bg-[#E1F0EC] hover:bg-[#d0e9e3] dark:bg-[#1B3A34] dark:hover:bg-[#234b43] text-[#2F7D6D] dark:text-[#4FB39F] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#2F7D6D]/20 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ ลงวันหยุดปกติ / ยื่นขอลา (แตะเลือกวันที่หรือแตะตรงนี้)</span>
          </button>
        </div>

        {/* Calendar Day Header */}
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

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1.5">{cells}</div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#254039] flex flex-wrap gap-x-3.5 gap-y-2 text-xs text-slate-500 dark:text-[#8FAAA4]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#CCFBF1] border border-[#0D9488]" />
            <span className="font-semibold text-[#0D9488]">วันหยุดปกติ</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#E1F0EC] border border-[#2F7D6D]" />
            <span>มาปกติ</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-600" />
            <span>มาสาย</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md border-2 border-[#C99A3B]" />
            <span>วันหยุดร้าน</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-400" />
            <span>ลาป่วย</span>
          </span>
        </div>
      </div>

      {/* Leave Requests of Current User */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-[#17332F] dark:text-[#E4F0ED] flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-[#0D9488]" />
            <span>ประวัติวันหยุดปกติและการลาของฉัน</span>
          </h3>
          <span className="text-xs text-slate-400">
            {sortedLeaves.length} รายการ
          </span>
        </div>

        {sortedLeaves.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-[#254039]">
            {sortedLeaves.map((l) => (
              <div key={l.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: LEAVE_TYPE_MAP[l.type].color }}
                    />
                    <strong className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {LEAVE_TYPE_MAP[l.type].label}
                    </strong>
                    {l.type === 'dayoff' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#CCFBF1] text-[#0D9488] font-bold">
                        สัปดาห์ละ 1 วัน
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 dark:text-[#8FAAA4] mt-0.5 pl-4">
                    {formatThaiDate(l.date)}
                    {l.note ? ` · ${l.note}` : ''}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    STATUS_MAP[l.status].tagClass
                  }`}
                >
                  {STATUS_MAP[l.status].label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            ยังไม่มีรายการวันหยุดหรือแจ้งลา กดวันที่ในปฏิทินเพื่อบันทึกวันหยุด
          </div>
        )}
      </div>
    </div>
  );
};
