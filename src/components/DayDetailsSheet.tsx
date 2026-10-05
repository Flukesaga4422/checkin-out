import React, { useState, useRef } from 'react';
import {
  X,
  Calendar,
  Clock,
  PlusCircle,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  FileText,
  UserCheck,
  CheckCircle,
  Palmtree,
  Sparkles,
  Layers,
} from 'lucide-react';
import { AttendanceRecord, LeaveRequest, LeaveType, Role, User } from '../types';
import {
  formatThaiDate,
  LEAVE_TYPE_MAP,
  STATUS_MAP,
  playSound,
} from '../utils/dateUtils';

interface DayDetailsSheetProps {
  dateStr: string;
  role: Role;
  currentUserId: number;
  users: User[];
  holidayName?: string;
  userAttendance?: AttendanceRecord;
  userLeaves: LeaveRequest[];
  allLeavesOnDate: LeaveRequest[];
  allAttendanceOnDate: Array<{ user: User; record: AttendanceRecord }>;
  onSaveHoliday: (dateStr: string, name: string) => void;
  onDeleteHoliday: (dateStr: string) => void;
  onRequestLeave: (
    dateStr: string,
    type: LeaveType,
    note: string,
    certFile?: string,
    certName?: string,
    endDateStr?: string
  ) => void;
  onAdminAssignLeave?: (
    uid: number,
    dateStr: string,
    type: LeaveType,
    note: string,
    endDateStr?: string
  ) => void;
  onViewCert?: (
    certFile: string,
    certName: string | undefined,
    staffName: string,
    dateStr: string,
    note?: string
  ) => void;
  onClose: () => void;
}

export const DayDetailsSheet: React.FC<DayDetailsSheetProps> = ({
  dateStr,
  role,
  users,
  holidayName,
  userAttendance,
  userLeaves,
  allLeavesOnDate,
  allAttendanceOnDate,
  onSaveHoliday,
  onDeleteHoliday,
  onRequestLeave,
  onAdminAssignLeave,
  onViewCert,
  onClose,
}) => {
  // Staff form state
  const [selectedType, setSelectedType] = useState<LeaveType>('dayoff');
  const [note, setNote] = useState<string>('');
  const [certFile, setCertFile] = useState<string | undefined>(undefined);
  const [certName, setCertName] = useState<string | undefined>(undefined);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [endDateStr, setEndDateStr] = useState<string>(dateStr);

  // Admin holiday setting state
  const [holidayInput, setHolidayInput] = useState<string>(holidayName || '');

  // Admin assign leave state
  const staffList = users.filter((u) => u.role === 'staff');
  const [adminTargetUid, setAdminTargetUid] = useState<number>(staffList[0]?.id || 0);
  const [adminLeaveType, setAdminLeaveType] = useState<LeaveType>('dayoff');
  const [adminNote, setAdminNote] = useState<string>('');
  const [adminIsMultiDay, setAdminIsMultiDay] = useState(false);
  const [adminEndDateStr, setAdminEndDateStr] = useState<string>(dateStr);
  const [showAdminAssignForm, setShowAdminAssignForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStaff = role === 'staff';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCertName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const maxDim = 900;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setCertFile(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            setCertFile(reader.result as string);
          }
        };
        img.src = reader.result as string;
      } else {
        setCertFile(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestLeave(
      dateStr,
      selectedType,
      note.trim(),
      certFile,
      certName,
      isMultiDay ? endDateStr : undefined
    );
    playSound('success');
  };

  const handleHolidaySave = () => {
    if (!holidayInput.trim()) return;
    onSaveHoliday(dateStr, holidayInput.trim());
    playSound('success');
  };

  const handleHolidayDelete = () => {
    onDeleteHoliday(dateStr);
    playSound('click');
  };

  const handleAdminAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTargetUid || !onAdminAssignLeave) return;
    onAdminAssignLeave(
      adminTargetUid,
      dateStr,
      adminLeaveType,
      adminNote.trim(),
      adminIsMultiDay ? adminEndDateStr : undefined
    );
    setAdminNote('');
    setShowAdminAssignForm(false);
    playSound('success');
  };

  const getUser = (uid: number) => users.find((u) => u.id === uid) || { name: 'พนักงาน' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#172A27] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#254039] max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for mobile bottom sheet */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#254039]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2F7D6D] dark:text-[#4FB39F]" />
            <h3 className="text-lg font-bold text-[#17332F] dark:text-[#E4F0ED]">
              {formatThaiDate(dateStr)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content based on Role */}
        <div className="py-4 space-y-4">
          {/* Shop Holiday Indicator */}
          {holidayName && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center gap-2 text-sm text-amber-900 dark:text-amber-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C99A3B]" />
              <div>
                <span className="font-semibold">วันหยุดร้าน:</span> {holidayName}
              </div>
            </div>
          )}

          {/* STAFF VIEW */}
          {isStaff && (
            <>
              {/* Attendance Record */}
              {userAttendance && (
                <div className="p-3.5 bg-slate-50 dark:bg-[#1B3A34]/50 rounded-2xl border border-slate-200/60 dark:border-[#254039] space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                      <Clock className="w-4 h-4 text-[#2F7D6D] dark:text-[#4FB39F]" />
                      <span>เข้า: <strong>{userAttendance.in} น.</strong></span>
                      <span className="text-slate-400">·</span>
                      <span>ออก: <strong>{userAttendance.out || '-'}</strong></span>
                    </div>

                    {userAttendance.late > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-medium">
                        สาย {userAttendance.late} นาที
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-medium">
                        ตรงเวลา
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Existing Leave Requests for this user on this day */}
              {userLeaves.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-[#8FAAA4] uppercase tracking-wider block">
                    รายการวันหยุด / วันลาในวันนี้
                  </span>
                  {userLeaves.map((l) => (
                    <div
                      key={l.id}
                      className="p-3.5 bg-slate-50 dark:bg-[#1B3A34]/40 rounded-2xl border border-slate-200 dark:border-[#254039] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: LEAVE_TYPE_MAP[l.type].color }}
                          />
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 block truncate">
                            {LEAVE_TYPE_MAP[l.type].label}
                          </span>
                        </div>
                        {l.note && (
                          <span className="text-xs text-slate-500 dark:text-[#8FAAA4] block mt-0.5 pl-4">
                            {l.note}
                          </span>
                        )}
                        {l.certFile && (
                          <button
                            type="button"
                            onClick={() =>
                              onViewCert?.(
                                l.certFile!,
                                l.certName,
                                getUser(l.uid).name,
                                l.date,
                                l.note
                              )
                            }
                            className="mt-1 pl-4 text-xs text-[#2F7D6D] dark:text-[#4FB39F] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>ดูรูปถ่ายใบรับรองแพทย์</span>
                          </button>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                          STATUS_MAP[l.status].tagClass
                        }`}
                      >
                        {STATUS_MAP[l.status].label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Form to request leave or weekly day-off on this day */
                <form onSubmit={handleLeaveSubmit} className="space-y-3 pt-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[#17332F] dark:text-[#E4F0ED]">
                      <PlusCircle className="w-4 h-4 text-[#2F7D6D] dark:text-[#4FB39F]" />
                      <span>ลงวันหยุดปกติ / ยื่นขอลา</span>
                    </div>

                    {/* Toggle consecutive multi-day off ("ลากยาว") */}
                    <button
                      type="button"
                      onClick={() => setIsMultiDay(!isMultiDay)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        isMultiDay
                          ? 'bg-[#2F7D6D] text-white border-[#2F7D6D]'
                          : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1B3A34]'
                      }`}
                    >
                      {isMultiDay ? '✓ กำลังเลือกหยุดหลายวัน' : '+ หยุดต่อเนื่องหลายวัน (ลากยาว)'}
                    </button>
                  </div>

                  {/* Multi-day date range selector */}
                  {isMultiDay && (
                    <div className="p-3 bg-emerald-50/70 dark:bg-[#1B3A34]/50 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 animate-fade-in">
                      <div className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        <span>ช่วงวันที่ต้องการหยุดต่อเนื่อง (ลากยาว):</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-200">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">เริ่มตั้งแต่วันที่</label>
                          <input
                            type="date"
                            value={dateStr}
                            disabled
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#254039] bg-white/70 dark:bg-[#0F1B19] text-xs opacity-80"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">ถึงวันที่ (รวมวันสิ้นสุด)</label>
                          <input
                            type="date"
                            min={dateStr}
                            value={endDateStr}
                            onChange={(e) => setEndDateStr(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-[#0F1B19] text-xs font-semibold"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                        * ระบบจะบันทึกวันหยุด/วันลาติดต่อกันทุกวันให้โดยอัตโนมัติ
                      </p>
                    </div>
                  )}

                  {/* Chips for leave types: Day Off, Sick, Biz, Vacation, Unpaid */}
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(LEAVE_TYPE_MAP) as LeaveType[]).map((typeKey) => {
                      const active = selectedType === typeKey;
                      const isDayOff = typeKey === 'dayoff';
                      return (
                        <button
                          key={typeKey}
                          type="button"
                          onClick={() => setSelectedType(typeKey)}
                          className={`py-2.5 px-3 rounded-xl font-semibold border transition-all text-left flex items-center gap-2 ${
                            active
                              ? isDayOff
                                ? 'border-[#0D9488] bg-[#CCFBF1] dark:bg-[#143D36] text-[#0D9488] dark:text-[#5EEAD4] shadow-xs ring-1 ring-[#0D9488]'
                                : 'border-[#2F7D6D] bg-[#E1F0EC] dark:bg-[#1B3A34] text-[#2F7D6D] dark:text-[#4FB39F] shadow-xs'
                              : 'border-slate-200 dark:border-[#254039] bg-white dark:bg-[#172A27] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: LEAVE_TYPE_MAP[typeKey].color }}
                          />
                          <div className="truncate">
                            <span className="truncate block">{LEAVE_TYPE_MAP[typeKey].label}</span>
                            {isDayOff && (
                              <span className="text-[10px] text-[#0D9488] dark:text-[#5EEAD4] font-normal block">
                                ประจำสัปดาห์
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Day off explanation notice */}
                  {selectedType === 'dayoff' && (
                    <div className="p-3 bg-[#CCFBF1]/60 dark:bg-[#143D36]/60 rounded-xl text-xs text-[#0D9488] dark:text-[#5EEAD4] border border-[#0D9488]/30 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Palmtree className="w-4 h-4 text-[#0D9488]" />
                        <span>วันหยุดปกติ (วันหยุดประจำสัปดาห์):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        พนักงานมีสิทธิ์หยุดสัปดาห์ละ 1 วัน หรือสะสมหยุดยาวได้ตามตกลง เมื่อส่งคำขอแล้ว ผู้ดูแลร้านจะตรวจสอบและอนุมัติให้ตามระบบ (ไม่ถูกหักเงินเดือน)
                      </p>
                    </div>
                  )}

                  {/* Optional Medical Certificate Upload (for Sick Leave) */}
                  {selectedType === 'sick' && (
                    <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 text-xs">
                          <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                          <span>แนบรูปถ่ายใบรับรองแพทย์</span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900 px-1.5 py-0.2 rounded-full">
                            ไม่บังคับ
                          </span>
                        </label>
                        {certFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setCertFile(undefined);
                              setCertName(undefined);
                            }}
                            className="text-[11px] text-rose-600 hover:underline font-semibold"
                          >
                            ลบรูป
                          </button>
                        )}
                      </div>

                      {certFile ? (
                        <div className="flex items-center gap-3 bg-white dark:bg-[#172A27] p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 shadow-xs">
                          {certFile.startsWith('data:image/') ? (
                            <img
                              src={certFile}
                              alt="ใบรับรองแพทย์"
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                            />
                          ) : (
                            <FileText className="w-8 h-8 text-blue-600" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {certName || 'ใบรับรองแพทย์'}
                            </p>
                            <span className="text-[10px] text-emerald-600 font-semibold block">
                              ✓ แนบไฟล์เรียบร้อยแล้ว
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-2.5 px-3 border border-dashed border-blue-400 dark:border-blue-700 rounded-xl bg-white/90 dark:bg-[#172A27] text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2 hover:bg-blue-50/70 transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-xs">แตะเพื่อถ่ายรูปหรือเลือกไฟล์ใบรับรองแพทย์</span>
                          </button>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1.5">
                            * หากไม่มีใบรับรองแพทย์ สามารถกดยืนยันส่งคำขอลาได้ตามปกติทันที
                          </p>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
                      หมายเหตุ (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={
                        selectedType === 'dayoff'
                          ? 'เช่น วันหยุดประจำสัปดาห์ / ลากลับบ้าน'
                          : 'เช่น มีไข้ ไอเจ็บคอ, ไปทำธุระ'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2F7D6D]"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-transform active:scale-[0.98] text-white cursor-pointer ${
                      selectedType === 'dayoff'
                        ? 'bg-[#0D9488] hover:bg-[#0f766e] shadow-[#0D9488]/25'
                        : 'bg-[#2F7D6D] hover:bg-[#27685b] shadow-[#2F7D6D]/20'
                    }`}
                  >
                    {selectedType === 'dayoff'
                      ? isMultiDay
                        ? `ส่งคำขอวันหยุดปกติต่อเนื่อง (${formatThaiDate(dateStr)} - ${formatThaiDate(endDateStr)})`
                        : 'ส่งคำขอวันหยุดปกติ (รออนุมัติ)'
                      : isMultiDay
                      ? `ส่งคำขอลา (${formatThaiDate(dateStr)} - ${formatThaiDate(endDateStr)})`
                      : 'ส่งคำขอลา'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ADMIN VIEW */}
          {!isStaff && (
            <div className="space-y-4 text-xs">
              {/* Store Holiday Setting */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#1B3A34]/40 rounded-2xl border border-slate-200 dark:border-[#254039] space-y-2.5">
                <label className="font-semibold text-slate-600 dark:text-slate-300 block">
                  กำหนดเป็นวันหยุดร้าน
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={holidayInput}
                    onChange={(e) => setHolidayInput(e.target.value)}
                    placeholder="เช่น วันหยุดประจำเดือน / วันสงกรานต์"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-[#254039] bg-white dark:bg-[#0F1B19] text-xs text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleHolidaySave}
                    className="px-3.5 py-2 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold cursor-pointer"
                  >
                    บันทึก
                  </button>
                  {holidayName && (
                    <button
                      type="button"
                      onClick={handleHolidayDelete}
                      className="px-3 py-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                      title="ยกเลิกวันหยุด"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Admin Direct Assign Off-day / Leave */}
              <div className="p-3.5 bg-emerald-50/70 dark:bg-[#1B3A34]/50 rounded-2xl border border-emerald-200/70 dark:border-[#254039] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                    <UserCheck className="w-4 h-4 text-[#2F7D6D]" />
                    <span>ลงวันหยุดปกติ / วันลาให้พนักงาน</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAdminAssignForm(!showAdminAssignForm)}
                    className="text-[#2F7D6D] dark:text-[#4FB39F] font-semibold underline cursor-pointer"
                  >
                    {showAdminAssignForm ? 'ซ่อนแบบฟอร์ม' : '+ ลงวันหยุดให้พนักงาน'}
                  </button>
                </div>

                {showAdminAssignForm && (
                  <form onSubmit={handleAdminAssignSubmit} className="space-y-2.5 pt-1">
                    <div>
                      <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
                        เลือกพนักงาน
                      </label>
                      <select
                        value={adminTargetUid}
                        onChange={(e) => setAdminTargetUid(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#254039] bg-white dark:bg-[#0F1B19] text-slate-800 dark:text-slate-100 text-xs"
                      >
                        {staffList.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.pos || 'พนักงาน'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
                        ประเภทวันหยุด / วันลา
                      </label>
                      <select
                        value={adminLeaveType}
                        onChange={(e) => setAdminLeaveType(e.target.value as LeaveType)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#254039] bg-white dark:bg-[#0F1B19] text-slate-800 dark:text-slate-100 text-xs font-semibold"
                      >
                        <option value="dayoff">🌴 วันหยุดปกติ (ประจำสัปดาห์ / ลากยาว - ไม่หักเงิน)</option>
                        <option value="sick">ลาป่วย</option>
                        <option value="biz">ลากิจ</option>
                        <option value="vac">ลาพักร้อน</option>
                        <option value="unpaid">ลาไม่รับเงินเดือน</option>
                      </select>
                    </div>

                    {/* Admin Multi-day toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        หยุดต่อเนื่องหลายวัน (ลากยาว)
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdminIsMultiDay(!adminIsMultiDay)}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border font-semibold ${
                          adminIsMultiDay
                            ? 'bg-[#2F7D6D] text-white border-[#2F7D6D]'
                            : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {adminIsMultiDay ? 'เปิดอยู่' : 'ปิด'}
                      </button>
                    </div>

                    {adminIsMultiDay && (
                      <div className="p-2.5 bg-white/70 dark:bg-[#0F1B19]/70 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-1">
                        <label className="text-[10px] text-slate-500 block">ถึงวันที่ (รวมวันสิ้นสุด)</label>
                        <input
                          type="date"
                          min={dateStr}
                          value={adminEndDateStr}
                          onChange={(e) => setAdminEndDateStr(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-400 bg-white dark:bg-[#0F1B19] text-xs font-semibold"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1">
                        หมายเหตุ (ถ้ามี)
                      </label>
                      <input
                        type="text"
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="เช่น วันหยุดปกติสะสม / ลากลับบ้าน"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#254039] bg-white dark:bg-[#0F1B19] text-slate-800 dark:text-slate-100 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold shadow-xs cursor-pointer"
                    >
                      {adminLeaveType === 'dayoff' ? 'บันทึกวันหยุดปกติให้พนักงานทันที' : 'บันทึกวันลาให้พนักงานทันที'}
                    </button>
                  </form>
                )}
              </div>

              {/* Staff on Leave Today */}
              <div>
                <span className="font-semibold text-slate-500 dark:text-[#8FAAA4] uppercase tracking-wider block mb-2">
                  พนักงานที่หยุด / ลาวันนี้ ({allLeavesOnDate.length})
                </span>
                {allLeavesOnDate.length > 0 ? (
                  <div className="space-y-2">
                    {allLeavesOnDate.map((l) => (
                      <div
                        key={l.id}
                        className="p-3 bg-slate-50 dark:bg-[#1B3A34]/30 rounded-xl border border-slate-200/60 dark:border-[#254039] flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0">
                          <strong className="text-slate-800 dark:text-slate-100 truncate block">
                            {getUser(l.uid).name}
                          </strong>
                          <span
                            className="inline-block mt-0.5 px-2 py-0.2 rounded-full font-medium text-[11px]"
                            style={{
                              backgroundColor: LEAVE_TYPE_MAP[l.type].bg,
                              color: LEAVE_TYPE_MAP[l.type].color,
                            }}
                          >
                            {LEAVE_TYPE_MAP[l.type].label}
                          </span>
                          {l.note && (
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {l.note}
                            </div>
                          )}
                          {l.certFile && (
                            <button
                              type="button"
                              onClick={() =>
                                onViewCert?.(
                                  l.certFile!,
                                  l.certName,
                                  getUser(l.uid).name,
                                  l.date,
                                  l.note
                              )}
                              className="mt-1 text-[11px] text-[#2F7D6D] dark:text-[#4FB39F] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>ดูรูปถ่ายใบรับรองแพทย์</span>
                            </button>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-medium shrink-0 ${
                            STATUS_MAP[l.status].tagClass
                          }`}
                        >
                          {STATUS_MAP[l.status].label}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 dark:text-[#66807A] py-2 text-center bg-slate-50/50 dark:bg-[#1B3A34]/20 rounded-xl">
                    ไม่มีพนักงานหยุดหรือลาในวันนี้
                  </div>
                )}
              </div>

              {/* Staff Attendance Records on this date */}
              <div>
                <span className="font-semibold text-slate-500 dark:text-[#8FAAA4] uppercase tracking-wider block mb-2">
                  การเข้างาน ({allAttendanceOnDate.length})
                </span>
                {allAttendanceOnDate.length > 0 ? (
                  <div className="space-y-2">
                    {allAttendanceOnDate.map(({ user, record }) => (
                      <div
                        key={user.id}
                        className="p-3 bg-slate-50 dark:bg-[#1B3A34]/30 rounded-xl border border-slate-200/60 dark:border-[#254039] flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-800 dark:text-slate-100">
                            {user.name}
                          </strong>
                          <div className="text-slate-500 dark:text-[#8FAAA4] mt-0.5">
                            เข้า {record.in} น. {record.out ? `· ออก ${record.out} น.` : ''}
                          </div>
                        </div>
                        {record.late > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-medium">
                            สาย {record.late} น.
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium">
                            ตรงเวลา
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 dark:text-[#66807A] py-2 text-center bg-slate-50/50 dark:bg-[#1B3A34]/20 rounded-xl">
                    ไม่มีบันทึกเข้างานในวันนี้
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
