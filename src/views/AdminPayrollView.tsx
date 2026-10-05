import React from 'react';
import { ChevronLeft, ChevronRight, Send, CheckCircle, Calculator, Printer } from 'lucide-react';
import { LeaveRequest, PaySlip, User } from '../types';
import {
  formatCurrency,
  padZero,
  playSound,
  THAI_MONTHS,
} from '../utils/dateUtils';

interface AdminPayrollViewProps {
  staffList: User[];
  year: number;
  month: number;
  payConfigMap: Record<string, { base?: number; comm?: number; tip?: number; ded?: number }>;
  slips: PaySlip[];
  leaves: LeaveRequest[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onUpdatePayConfig: (uid: number, field: string, value: number) => void;
  onSendSlip: (slip: PaySlip) => void;
  onPreviewSlip: (slip: PaySlip, user: User) => void;
}

export const AdminPayrollView: React.FC<AdminPayrollViewProps> = ({
  staffList,
  year,
  month,
  payConfigMap,
  slips,
  leaves,
  onPrevMonth,
  onNextMonth,
  onUpdatePayConfig,
  onSendSlip,
  onPreviewSlip,
}) => {
  const monKey = `${year}-${padZero(month + 1)}`;

  const calculateStaffPay = (u: User) => {
    const k = `${u.id}|${monKey}`;
    const cfg = payConfigMap[k] || {};

    const base = cfg.base !== undefined ? cfg.base : (u.salary || 0);
    const comm = cfg.comm || 0;
    const tip = cfg.tip || 0;
    const ded = cfg.ded || 0;

    // Count approved unpaid leave days in this month
    const unpaidDays = leaves.filter(
      (l) =>
        l.uid === u.id &&
        l.type === 'unpaid' &&
        l.status === 'approved' &&
        l.date.startsWith(monKey)
    ).length;

    const unpaidDeduction = Math.round((base / 30) * unpaidDays);
    const net = base + comm + tip - ded - unpaidDeduction;

    return {
      base,
      comm,
      tip,
      ded,
      ud: unpaidDays,
      un: unpaidDeduction,
      net,
    };
  };

  const handleSend = (u: User) => {
    const c = calculateStaffPay(u);
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;

    const newSlip: PaySlip = {
      key: `${u.id}|${monKey}`,
      uid: u.id,
      mon: monKey,
      base: c.base,
      comm: c.comm,
      tip: c.tip,
      ded: c.ded,
      ud: c.ud,
      un: c.un,
      net: c.net,
      at: todayStr,
    };

    playSound('success');
    onSendSlip(newSlip);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Month Header */}
      <div className="flex items-center justify-between bg-white dark:bg-[#172A27] rounded-3xl p-4 border border-slate-200/80 dark:border-[#254039] shadow-xs">
        <button
          type="button"
          onClick={onPrevMonth}
          className="w-10 h-10 rounded-full border border-slate-200 dark:border-[#254039] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1B3A34] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="text-xs text-slate-400">คำนวณสลิปเงินเดือน</div>
          <h2 className="text-lg font-bold text-[#17332F] dark:text-[#E4F0ED] tracking-tight">
            {THAI_MONTHS[month]} {year + 543}
          </h2>
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          className="w-10 h-10 rounded-full border border-slate-200 dark:border-[#254039] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1B3A34] transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Staff Salary Cards */}
      <div className="space-y-4">
        {staffList.map((u) => {
          const calc = calculateStaffPay(u);
          const sentSlip = slips.find((s) => s.key === `${u.id}|${monKey}`);

          return (
            <div
              key={u.id}
              className="bg-white dark:bg-[#172A27] rounded-3xl p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs space-y-3.5"
            >
              {/* Header row */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#254039]">
                <div>
                  <h3 className="font-bold text-base text-[#17332F] dark:text-[#E4F0ED]">
                    {u.name}
                  </h3>
                  <p className="text-xs text-slate-400">{u.pos || 'พนักงาน'}</p>
                </div>

                <div>
                  {sentSlip ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>ส่งสลิปแล้ว</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1B3A34] text-slate-500 text-xs font-medium">
                      ยังไม่ส่ง
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Editable Inputs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
                    เงินเดือนพื้นฐาน (บาท)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={calc.base || ''}
                    onChange={(e) =>
                      onUpdatePayConfig(u.id, 'base', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
                    ค่าคอมมิชชั่น / ค่ามือ
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={calc.comm || ''}
                    placeholder="0"
                    onChange={(e) =>
                      onUpdatePayConfig(u.id, 'comm', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] font-mono text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
                    ทิป / โบนัสพิเศษ
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={calc.tip || ''}
                    placeholder="0"
                    onChange={(e) =>
                      onUpdatePayConfig(u.id, 'tip', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] font-mono text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
                    หักอื่นๆ (ประกันสังคม ฯลฯ)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={calc.ded || ''}
                    placeholder="0"
                    onChange={(e) =>
                      onUpdatePayConfig(u.id, 'ded', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] font-mono text-rose-600 dark:text-rose-400"
                  />
                </div>
              </div>

              {/* Automatic unpaid leave notice if any */}
              {calc.ud > 0 && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-xs text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40">
                  หักลาไม่รับเงินเดือน {calc.ud} วัน = -{formatCurrency(calc.un)} บาท (คำนวณให้อัตโนมัติ)
                </div>
              )}

              {/* Net total display */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-[#8FAAA4] block">
                    ยอดเงินได้สุทธิ
                  </span>
                  <span className="text-xs text-slate-400">
                    รวมคอม/ทิป - หัก
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-[#2F7D6D] dark:text-[#4FB39F]">
                  {formatCurrency(calc.net)} ฿
                </div>
              </div>

              {/* Send Slip button */}
              <div className="flex gap-2 pt-1">
                {sentSlip && (
                  <button
                    type="button"
                    onClick={() => onPreviewSlip(sentSlip, u)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1B3A34] flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>ดูสลิป</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSend(u)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-[#2F7D6D]/20 transition-transform active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sentSlip ? 'อัปเดตและส่งสลิปอีกครั้ง' : 'ส่งสลิปให้พนักงาน'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
