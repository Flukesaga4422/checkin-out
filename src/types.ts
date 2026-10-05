export type Role = 'admin' | 'staff';

export type AdminTab = 'today' | 'req' | 'cal' | 'pay' | 'staff' | 'set';
export type StaffTab = 'home' | 'cal' | 'slip' | 'me';

export type LeaveType = 'dayoff' | 'sick' | 'biz' | 'vac' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  name: string;
  user: string;
  pass: string;
  role: Role;
  pos?: string; // e.g. นวดไทย, นวดอโรม่า, สปาหน้า
  salary?: number;
  phone?: string;
}

export interface AttendanceRecord {
  in: string; // "10:15"
  out: string; // "19:00" or ""
  late: number; // minutes late (0 if on time)
  photo?: string; // base64 thumbnail
  timestamp?: number;
}

export interface LeaveRequest {
  id: number;
  uid: number;
  date: string; // "YYYY-MM-DD"
  type: LeaveType;
  note?: string;
  certFile?: string; // optional medical certificate photo/document base64
  certName?: string;
  status: LeaveStatus;
  createdAt?: string;
}

export interface PaySlip {
  key: string; // "uid|YYYY-MM"
  uid: number;
  mon: string; // "YYYY-MM"
  base: number;
  comm: number;
  tip: number;
  ded: number;
  ud: number; // unpaid days count
  un: number; // unpaid deduction amount
  net: number;
  at: string; // Date sent "YYYY-MM-DD"
}

export interface SpaDatabase {
  shop: string; // e.g. "ร้านนวดและสปา"
  storeName?: string;
  start: string; // e.g. "10:00"
  users: User[];
  att: Record<string, AttendanceRecord>; // "uid|YYYY-MM-DD"
  leaves: LeaveRequest[];
  holidays: Record<string, string>; // "YYYY-MM-DD": "วันแรงงาน"
  pay: Record<string, { base?: number; comm?: number; tip?: number; ded?: number }>; // "uid|YYYY-MM"
  slips: PaySlip[];
}
