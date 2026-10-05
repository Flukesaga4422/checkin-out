import React, { useRef } from 'react';
import { X, Printer, CheckCircle, Sparkles } from 'lucide-react';
import { PaySlip, User } from '../types';
import { formatCurrency, formatThaiDate, THAI_MONTHS } from '../utils/dateUtils';

interface PaySlipPrintModalProps {
  slip: PaySlip;
  user: User;
  storeName: string;
  onClose: () => void;
}

export const PaySlipPrintModal: React.FC<PaySlipPrintModalProps> = ({
  slip,
  user,
  storeName,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const [yStr, mStr] = slip.mon.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10) - 1;
  const monthName = THAI_MONTHS[m] || '';
  const thaiYear = y + 543;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#172A27] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-[#254039] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#254039] bg-slate-50/80 dark:bg-[#1B3A34]/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C99A3B]" />
            <h3 className="font-semibold text-base text-[#17332F] dark:text-[#E4F0ED]">
              ใบแจ้งยอดเงินเดือน (Pay Slip)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Slip Container */}
        <div ref={printRef} className="p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
          {/* Header of slip */}
          <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-[#254039]">
            <h2 className="text-xl font-bold text-[#2F7D6D] dark:text-[#4FB39F] tracking-tight">
              {storeName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-0.5">
              สลิปเงินเดือนประจำเดือน {monthName} {thaiYear}
            </p>
          </div>

          {/* Employee info box */}
          <div className="bg-[#EDF3F1]/70 dark:bg-[#0F1B19]/60 p-3.5 rounded-2xl text-xs space-y-1.5 border border-slate-200/50 dark:border-[#254039]">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-[#8FAAA4]">ชื่อพนักงาน:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</span>
            </div>
            {user.pos && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#8FAAA4]">ตำแหน่ง:</span>
                <span className="text-slate-700 dark:text-slate-300">{user.pos}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-[#8FAAA4]">วันที่ออกสลิป:</span>
              <span className="text-slate-700 dark:text-slate-300">{formatThaiDate(slip.at)}</span>
            </div>
          </div>

          {/* Earnings / Deductions breakdown table */}
          <div className="space-y-2.5 text-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#8FAAA4] uppercase tracking-wider">
              รายการได้ (Earnings)
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#254039]">
              <span className="text-slate-600 dark:text-slate-300">เงินเดือนพื้นฐาน (Base Salary)</span>
              <span className="font-mono">{formatCurrency(slip.base)} ฿</span>
            </div>

            {slip.comm > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#254039]">
                <span className="text-slate-600 dark:text-slate-300">ค่าคอมมิชชั่น / ค่ามือ</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">+{formatCurrency(slip.comm)} ฿</span>
              </div>
            )}

            {slip.tip > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#254039]">
                <span className="text-slate-600 dark:text-slate-300">ทิป / โบนัสพิเศษ</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">+{formatCurrency(slip.tip)} ฿</span>
              </div>
            )}

            {/* Deductions */}
            <div className="pt-2 text-xs font-semibold text-slate-500 dark:text-[#8FAAA4] uppercase tracking-wider">
              รายการหัก (Deductions)
            </div>

            {slip.ud > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#254039]">
                <span className="text-slate-600 dark:text-slate-300">
                  หักลาไม่รับเงินเดือน ({slip.ud} วัน)
                </span>
                <span className="font-mono text-rose-600 dark:text-rose-400">-{formatCurrency(slip.un)} ฿</span>
              </div>
            )}

            {slip.ded > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#254039]">
                <span className="text-slate-600 dark:text-slate-300">หักอื่นๆ (ประกันสังคม/สาย/กองทุน)</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">-{formatCurrency(slip.ded)} ฿</span>
              </div>
            )}

            {/* Grand Total Net */}
            <div className="mt-4 p-4 rounded-2xl bg-[#E1F0EC] dark:bg-[#1B3A34] border border-[#2F7D6D]/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#2F7D6D] dark:text-[#4FB39F] font-semibold block">
                  ยอดเงินรับสุทธิ (Net Total)
                </span>
                <span className="text-xs text-slate-500 dark:text-[#8FAAA4]">โอนเข้าบัญชีเรียบร้อย</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[#2F7D6D] dark:text-[#4FB39F]">
                {formatCurrency(slip.net)} ฿
              </div>
            </div>
          </div>

          {/* Footer stamp notice */}
          <div className="text-center pt-3 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>เอกสารนี้ออกโดยระบบอัตโนมัติของ {storeName}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 bg-slate-50 dark:bg-[#172A27] border-t border-slate-100 dark:border-[#254039] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-[#254039] text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1B3A34] transition-colors"
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#2F7D6D]/20 transition-transform active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            พิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>
    </div>
  );
};
