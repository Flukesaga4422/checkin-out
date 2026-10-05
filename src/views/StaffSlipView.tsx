import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Printer, CheckCircle2 } from 'lucide-react';
import { PaySlip, User } from '../types';
import {
  formatCurrency,
  formatThaiDate,
  THAI_MONTHS,
} from '../utils/dateUtils';

interface StaffSlipViewProps {
  currentUser: User;
  slips: PaySlip[];
  onOpenPrintSlip: (slip: PaySlip) => void;
}

export const StaffSlipView: React.FC<StaffSlipViewProps> = ({
  currentUser,
  slips,
  onOpenPrintSlip,
}) => {
  const [expandedMon, setExpandedMon] = useState<string | null>(null);

  const userSlips = slips
    .filter((s) => s.uid === currentUser.id)
    .sort((a, b) => (b.mon < a.mon ? -1 : 1));

  const toggleExpand = (mon: string) => {
    setExpandedMon((prev) => (prev === mon ? null : mon));
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-[#17332F] dark:text-[#E4F0ED] tracking-tight">
          สลิปเงินเดือนของฉัน
        </h2>
        <span className="text-xs text-slate-500 dark:text-[#8FAAA4]">
          {userSlips.length} ฉบับ
        </span>
      </div>

      {userSlips.length > 0 ? (
        <div className="space-y-3">
          {userSlips.map((slip) => {
            const [yStr, mStr] = slip.mon.split('-');
            const y = parseInt(yStr, 10);
            const m = parseInt(mStr, 10) - 1;
            const monthLabel = `${THAI_MONTHS[m]} ${y + 543}`;
            const isExpanded = expandedMon === slip.mon;

            return (
              <div
                key={slip.key}
                className="bg-white dark:bg-[#172A27] rounded-3xl p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs transition-all"
              >
                {/* Clickable Header Row */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(slip.mon)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#E1F0EC] dark:bg-[#1B3A34] text-[#2F7D6D] dark:text-[#4FB39F] flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#17332F] dark:text-[#E4F0ED]">
                        {monthLabel}
                      </h3>
                      <p className="text-xs text-slate-400">
                        ส่งเมื่อ {formatThaiDate(slip.at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-[#2F7D6D] dark:text-[#4FB39F]">
                      {formatCurrency(slip.net)} ฿
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-[#254039] space-y-2.5 text-xs text-slate-600 dark:text-slate-300 animate-fade-in">
                    <div className="flex justify-between py-1">
                      <span>เงินเดือนพื้นฐาน</span>
                      <span className="font-mono font-medium">{formatCurrency(slip.base)} ฿</span>
                    </div>

                    {slip.comm > 0 && (
                      <div className="flex justify-between py-1 text-emerald-600 dark:text-emerald-400">
                        <span>ค่าคอมมิชชั่น / ค่ามือ</span>
                        <span className="font-mono font-medium">+{formatCurrency(slip.comm)} ฿</span>
                      </div>
                    )}

                    {slip.tip > 0 && (
                      <div className="flex justify-between py-1 text-emerald-600 dark:text-emerald-400">
                        <span>ทิป / โบนัส</span>
                        <span className="font-mono font-medium">+{formatCurrency(slip.tip)} ฿</span>
                      </div>
                    )}

                    {slip.ud > 0 && (
                      <div className="flex justify-between py-1 text-rose-600 dark:text-rose-400">
                        <span>หักลาไม่รับเงินเดือน ({slip.ud} วัน)</span>
                        <span className="font-mono font-medium">-{formatCurrency(slip.un)} ฿</span>
                      </div>
                    )}

                    {slip.ded > 0 && (
                      <div className="flex justify-between py-1 text-rose-600 dark:text-rose-400">
                        <span>หักอื่นๆ (ประกันสังคม ฯลฯ)</span>
                        <span className="font-mono font-medium">-{formatCurrency(slip.ded)} ฿</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-[#254039] flex justify-between items-center text-sm font-bold text-[#17332F] dark:text-[#E4F0ED]">
                      <span>รับสุทธิ</span>
                      <span className="font-mono text-base text-[#2F7D6D] dark:text-[#4FB39F]">
                        {formatCurrency(slip.net)} ฿
                      </span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => onOpenPrintSlip(slip)}
                        className="w-full py-2.5 rounded-xl border border-[#2F7D6D] text-[#2F7D6D] dark:text-[#4FB39F] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#E1F0EC]/50 dark:hover:bg-[#1B3A34] transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>เปิดสลิปแบบเต็ม / พิมพ์เอกสาร</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#172A27] rounded-3xl p-8 border border-slate-200/80 dark:border-[#254039] text-center shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED]">
            ยังไม่มีรายการสลิปเงินเดือน
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            เมื่อผู้จัดการหรือแอดมินจัดทำและส่งสลิปประจำงวดให้แล้ว รายการจะแสดงขึ้นที่นี่โดยอัตโนมัติ
          </p>
        </div>
      )}
    </div>
  );
};
