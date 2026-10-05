import React from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { formatThaiDate } from '../utils/dateUtils';

interface PhotoViewModalProps {
  photo: string;
  name: string;
  pos?: string;
  timeIn: string;
  timeOut?: string;
  lateMins?: number;
  dateStr?: string;
  onClose: () => void;
}

export const PhotoViewModal: React.FC<PhotoViewModalProps> = ({
  photo,
  name,
  pos,
  timeIn,
  timeOut,
  lateMins = 0,
  dateStr,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-[#172A27] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#254039]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#254039]">
          <div>
            <h3 className="font-semibold text-base text-[#17332F] dark:text-[#E4F0ED]">
              {name}
            </h3>
            {pos && (
              <span className="text-xs text-slate-500 dark:text-[#8FAAA4]">
                {pos}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Photo */}
        <div className="p-4 bg-slate-50 dark:bg-[#0F1B19]/50 flex justify-center">
          <div className="relative w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-[#254039]">
            <img
              src={photo}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details & Timestamps */}
        <div className="p-5 space-y-3">
          {dateStr && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#8FAAA4]">
              <Calendar className="w-4 h-4 text-[#2F7D6D] dark:text-[#4FB39F]" />
              <span>{formatThaiDate(dateStr)}</span>
            </div>
          )}

          <div className="flex items-center justify-between bg-slate-100 dark:bg-[#1B3A34] p-3 rounded-xl text-sm">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <Clock className="w-4 h-4 text-[#2F7D6D] dark:text-[#4FB39F]" />
              <span>เข้า: <strong className="font-mono">{timeIn} น.</strong></span>
            </div>
            <div className="text-slate-700 dark:text-slate-200">
              <span>ออก: <strong className="font-mono">{timeOut || '-'}</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-[#8FAAA4]">สถานะการเข้างาน:</span>
            {lateMins > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
                สาย {lateMins} นาที
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                ตรงเวลา
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-2.5 rounded-xl border border-slate-300 dark:border-[#254039] text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1B3A34] transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
