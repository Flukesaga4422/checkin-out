import { LeaveType, LeaveStatus } from '../types';

export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export const LEAVE_TYPE_MAP: Record<LeaveType, { label: string; color: string; bg: string }> = {
  dayoff: { label: 'วันหยุดปกติ', color: '#0D9488', bg: '#CCFBF1' },
  sick: { label: 'ลาป่วย', color: '#2563EB', bg: '#DBEAFE' },
  biz: { label: 'ลากิจ', color: '#7C3AED', bg: '#EDE9FE' },
  vac: { label: 'ลาพักร้อน', color: '#D97706', bg: '#FEF3C7' },
  unpaid: { label: 'ลาไม่รับเงินเดือน', color: '#4B5563', bg: '#E5E7EB' },
};

export const STATUS_MAP: Record<LeaveStatus, { label: string; tagClass: string }> = {
  pending: { label: 'รออนุมัติ', tagClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  approved: { label: 'อนุมัติแล้ว', tagClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  rejected: { label: 'ไม่อนุมัติ', tagClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
};

export const padZero = (n: number): string => String(n).padStart(2, '0');

export const makeDateKey = (year: number, monthIndex: number, day: number): string => {
  return `${year}-${padZero(monthIndex + 1)}-${padZero(day)}`;
};

export const getTodayKey = (): string => {
  const d = new Date();
  return makeDateKey(d.getFullYear(), d.getMonth(), d.getDate());
};

export const getNowTimeStr = (): string => {
  const d = new Date();
  return `${padZero(d.getHours())}:${padZero(d.getMinutes())}`;
};

export const formatThaiDate = (dateKey: string): string => {
  if (!dateKey) return '';
  const parts = dateKey.split('-');
  if (parts.length < 3) return dateKey;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${d} ${THAI_MONTHS[m]} ${y + 543}`;
};

export const formatThaiDateShort = (dateKey: string): string => {
  if (!dateKey) return '';
  const parts = dateKey.split('-');
  if (parts.length < 3) return dateKey;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${d} ${THAI_MONTHS_SHORT[m]} ${(y + 543) % 100}`;
};

export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
};

export const formatCurrency = (amount: number): string => {
  return (Math.round(amount) || 0).toLocaleString('th-TH');
};

/** Play a pleasant chime or click via Web Audio */
export const playSound = (type: 'checkin' | 'checkout' | 'click' | 'success') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'checkin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'checkout') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.2); // C5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // audio failure silent ignore
  }
};
