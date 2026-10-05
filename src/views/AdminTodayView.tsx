import React from 'react';
import { Users, Clock, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import { AttendanceRecord, LeaveRequest, User } from '../types';
import { LEAVE_TYPE_MAP } from '../utils/dateUtils';

interface AdminTodayViewProps {
  staffList: User[];
  todayKey: string;
  attendanceMap: Record<string, AttendanceRecord>;
  todayLeaves: LeaveRequest[];
  pendingLeaveCount: number;
  onSelectPhoto: (photo: string, staffName: string, timeIn: string, timeOut?: string, lateMins?: number) => void;
}

export const AdminTodayView: React.FC<AdminTodayViewProps> = ({
  staffList,
  todayKey,
  attendanceMap,
  todayLeaves,
  pendingLeaveCount,
  onSelectPhoto,
}) => {
  let attendedCount = 0;
  let lateCount = 0;

  staffList.forEach((u) => {
    const rec = attendanceMap[`${u.id}|${todayKey}`];
    if (rec) {
      attendedCount++;
      if (rec.late > 0) lateCount++;
    }
  });

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-[#172A27] rounded-3xl p-3.5 border border-slate-200/80 dark:border-[#254039] text-center shadow-xs">
          <div className="text-2xl font-bold font-mono text-[#2F7D6D] dark:text-[#4FB39F]">
            {attendedCount}/{staffList.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-0.5">
            มาทำงานแล้ว
          </div>
        </div>

        <div className="bg-white dark:bg-[#172A27] rounded-3xl p-3.5 border border-slate-200/80 dark:border-[#254039] text-center shadow-xs">
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {lateCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-0.5">
            มาสาย
          </div>
        </div>

        <div className="bg-white dark:bg-[#172A27] rounded-3xl p-3.5 border border-slate-200/80 dark:border-[#254039] text-center shadow-xs">
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {pendingLeaveCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-0.5">
            รออนุมัติลา
          </div>
        </div>
      </div>

      {/* Staff Attendance List Today */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-[#17332F] dark:text-[#E4F0ED]">
            สถานะพนักงานวันนี้
          </h2>
          <span className="text-xs text-slate-400">
            {staffList.length} คน
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#254039]">
          {staffList.map((u) => {
            const rec = attendanceMap[`${u.id}|${todayKey}`];
            const approvedLeave = todayLeaves.find(
              (l) => l.uid === u.id && l.status === 'approved'
            );

            return (
              <div
                key={u.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                {/* Avatar with click to zoom if photo exists */}
                <div className="flex items-center gap-3 min-w-0">
                  {rec?.photo ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectPhoto(rec.photo!, u.name, rec.in, rec.out, rec.late)
                      }
                      className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#2F7D6D] shadow-xs group cursor-pointer"
                      title="กดเพื่อดูรูปถ่ายขยายใหญ่"
                    >
                      <img
                        src={rec.photo}
                        alt={u.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#E1F0EC] dark:bg-[#1B3A34] text-[#2F7D6D] dark:text-[#4FB39F] font-bold text-base flex items-center justify-center shrink-0 border border-[#2F7D6D]/20">
                      {u.name.slice(0, 1)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED] truncate">
                      {u.name}
                    </h4>
                    <p className="text-slate-500 dark:text-[#8FAAA4] truncate text-[11px]">
                      {u.pos || 'พนักงาน'}
                    </p>
                    <p className="text-slate-400 dark:text-[#66807A] text-[11px] mt-0.5">
                      {rec ? (
                        <span>
                          เข้า <strong>{rec.in} น.</strong>
                          {rec.out ? ` · ออก ${rec.out} น.` : ' · กำลังทำงาน'}
                        </span>
                      ) : approvedLeave ? (
                        <span className="text-[#2F7D6D] dark:text-[#4FB39F]">
                          {LEAVE_TYPE_MAP[approvedLeave.type].label}
                        </span>
                      ) : (
                        <span className="text-slate-400">ยังไม่เช็คอิน</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {rec ? (
                    rec.late > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold text-xs whitespace-nowrap">
                        สาย {rec.late} น.
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs whitespace-nowrap">
                        ตรงเวลา
                      </span>
                    )
                  ) : approvedLeave ? (
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium text-xs whitespace-nowrap">
                      ลาพัก
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1B3A34] text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                      รอเข้างาน
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-1">
        แตะที่รูปโปรไฟล์พนักงานเพื่อดูรูปถ่ายตอนเช็คอินแบบชัดเจน
      </p>
    </div>
  );
};
