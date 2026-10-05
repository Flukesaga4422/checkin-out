import React from 'react';
import { Check, X, Clock, Calendar, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { LeaveRequest, User } from '../types';
import {
  formatThaiDate,
  LEAVE_TYPE_MAP,
  playSound,
  STATUS_MAP,
} from '../utils/dateUtils';

interface AdminRequestsViewProps {
  users: User[];
  leaves: LeaveRequest[];
  onSetStatus: (leaveId: number, status: 'approved' | 'rejected') => void;
  onViewCert?: (
    certFile: string,
    certName: string | undefined,
    staffName: string,
    dateStr: string,
    note?: string
  ) => void;
}

export const AdminRequestsView: React.FC<AdminRequestsViewProps> = ({
  users,
  leaves,
  onSetStatus,
  onViewCert,
}) => {
  const pending = leaves.filter((l) => l.status === 'pending');
  const history = leaves
    .filter((l) => l.status !== 'pending')
    .sort((a, b) => (b.date < a.date ? -1 : 1));

  const getUser = (uid: number) =>
    users.find((u) => u.id === uid) || { name: 'พนักงาน', pos: '' };

  const handleAction = (id: number, status: 'approved' | 'rejected') => {
    playSound(status === 'approved' ? 'success' : 'click');
    onSetStatus(id, status);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Pending Queue */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#17332F] dark:text-[#E4F0ED]">
              คำขอรอการอนุมัติ
            </h2>
            {pending.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold">
                {pending.length} รายการ
              </span>
            )}
          </div>
        </div>

        {pending.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-[#254039]">
            {pending.map((req) => {
              const u = getUser(req.uid);
              const typeInfo = LEAVE_TYPE_MAP[req.type];

              return (
                <div key={req.id} className="py-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-[#17332F] dark:text-[#E4F0ED]">
                          {u.name}
                        </strong>
                        <span className="text-xs text-slate-400 truncate">
                          ({u.pos || 'พนักงาน'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span
                          className="px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: typeInfo.bg,
                            color: typeInfo.color,
                          }}
                        >
                          {typeInfo.label}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {formatThaiDate(req.date)}
                        </span>
                      </div>

                      {req.note && (
                        <p className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-1.5 bg-slate-50 dark:bg-[#0F1B19]/50 p-2.5 rounded-xl border border-slate-100 dark:border-[#254039]">
                          "{req.note}"
                        </p>
                      )}

                      {/* Attached Medical Certificate Badge Button */}
                      {req.certFile && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() =>
                              onViewCert?.(
                                req.certFile!,
                                req.certName,
                                u.name,
                                req.date,
                                req.note
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-semibold hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>ดูรูปถ่ายใบรับรองแพทย์</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approve / Reject buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>ไม่อนุมัติ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction(req.id, 'approved')}
                      className="flex-1 py-2 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-[#2F7D6D]/20 transition-transform active:scale-[0.98]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>อนุมัติคำขอ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
            <span>ไม่มีคำขอค้างอยู่ ทุกรายการได้รับการจัดการแล้ว</span>
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white dark:bg-[#172A27] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs">
        <h3 className="text-sm font-bold text-[#17332F] dark:text-[#E4F0ED] mb-3 px-1">
          ประวัติคำขอที่ผ่านมา
        </h3>

        {history.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-[#254039]">
            {history.slice(0, 15).map((req) => {
              const u = getUser(req.uid);
              const typeInfo = LEAVE_TYPE_MAP[req.type];
              const statusInfo = STATUS_MAP[req.status];

              return (
                <div key={req.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {u.name} · <span className="font-normal text-slate-500">{typeInfo.label}</span>
                    </div>
                    <div className="text-slate-400 mt-0.5 truncate">
                      {formatThaiDate(req.date)}
                      {req.note ? ` · ${req.note}` : ''}
                    </div>
                    {req.certFile && (
                      <button
                        type="button"
                        onClick={() =>
                          onViewCert?.(
                            req.certFile!,
                            req.certName,
                            u.name,
                            req.date,
                            req.note
                          )
                        }
                        className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>ใบรับรองแพทย์</span>
                      </button>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full font-medium shrink-0 ${statusInfo.tagClass}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            ยังไม่มีประวัติคำขอลา
          </div>
        )}
      </div>
    </div>
  );
};
