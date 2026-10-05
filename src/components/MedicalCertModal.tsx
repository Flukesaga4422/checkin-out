import React from 'react';
import { X, FileText, Download, User as UserIcon } from 'lucide-react';
import { formatThaiDate } from '../utils/dateUtils';

interface MedicalCertModalProps {
  certFile: string;
  certName?: string;
  staffName: string;
  dateStr: string;
  note?: string;
  onClose: () => void;
}

export const MedicalCertModal: React.FC<MedicalCertModalProps> = ({
  certFile,
  certName,
  staffName,
  dateStr,
  note,
  onClose,
}) => {
  const isImage = certFile.startsWith('data:image/') || certFile.match(/\.(jpeg|jpg|gif|png|webp)/i);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = certFile;
    a.download = certName || `medical-cert-${staffName}-${dateStr}.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#172A27] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#254039] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#254039]">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-base text-[#17332F] dark:text-[#E4F0ED]">
              <FileText className="w-5 h-5 text-[#2F7D6D] dark:text-[#4FB39F]" />
              <span>ใบรับรองแพทย์</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-0.5">
              {staffName} · วันที่ {formatThaiDate(dateStr)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer */}
        <div className="p-4 bg-slate-100 dark:bg-[#0F1B19] overflow-auto flex items-center justify-center min-h-[300px] max-h-[60vh]">
          {isImage ? (
            <img
              src={certFile}
              alt="ใบรับรองแพทย์"
              className="max-w-full max-h-full object-contain rounded-xl shadow-md border border-slate-200 dark:border-[#254039]"
            />
          ) : (
            <div className="text-center p-6 space-y-3">
              <FileText className="w-16 h-16 text-[#2F7D6D] mx-auto opacity-70" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {certName || 'เอกสารใบรับรองแพทย์'}
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-[#2F7D6D] text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดเอกสาร</span>
              </button>
            </div>
          )}
        </div>

        {/* Details & Actions */}
        <div className="p-4 bg-white dark:bg-[#172A27] border-t border-slate-100 dark:border-[#254039] flex items-center justify-between gap-3 text-xs">
          <div className="truncate">
            {note && (
              <p className="text-slate-600 dark:text-slate-300 truncate">
                หมายเหตุ: <span className="font-semibold">{note}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#254039] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1B3A34] font-medium flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2F7D6D] text-white font-semibold"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
