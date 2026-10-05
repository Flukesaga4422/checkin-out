import React, { useState } from 'react';
import { UserPlus, Edit3, Phone } from 'lucide-react';
import { User } from '../types';
import { formatCurrency, playSound } from '../utils/dateUtils';

interface AdminStaffViewProps {
  staffList: User[];
  onAddStaff: (newStaff: Omit<User, 'id'>) => boolean;
  onSelectEditStaff: (staff: User) => void;
}

export const AdminStaffView: React.FC<AdminStaffViewProps> = ({
  staffList,
  onAddStaff,
  onSelectEditStaff,
}) => {
  const [name, setName] = useState('');
  const [pos, setPos] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [salary, setSalary] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user.trim() || !pass.trim()) {
      setFormError('กรอกชื่อ ชื่อผู้ใช้ และรหัสผ่านก่อนนะ');
      return;
    }

    const success = onAddStaff({
      name: name.trim(),
      pos: pos.trim() || 'พนักงาน',
      user: user.trim().toLowerCase(),
      pass: pass.trim(),
      role: 'staff',
      salary: parseFloat(salary) || 0,
      phone: phone.trim(),
    });

    if (success) {
      setName('');
      setPos('');
      setUser('');
      setPass('');
      setSalary('');
      setPhone('');
      setFormError('');
      playSound('success');
    } else {
      setFormError('ชื่อผู้ใช้นี้มีคนใช้แล้ว');
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Staff List */}
      <div>
        <h2 className="text-lg font-bold text-[#17332F] dark:text-[#E4F0ED] tracking-tight px-1 mb-2">
          พนักงาน
        </h2>
        <div className="bg-white dark:bg-[#172A27] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs">
          {staffList.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-[#254039]">
              {staffList.map((u) => (
                <div
                  key={u.id}
                  onClick={() => onSelectEditStaff(u)}
                  className="py-3 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1B3A34]/50 rounded-2xl px-2 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#E1F0EC] dark:bg-[#1B3A34] text-[#2F7D6D] dark:text-[#4FB39F] font-bold text-base flex items-center justify-center shrink-0 border border-[#2F7D6D]/20">
                      {u.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED] truncate group-hover:text-[#2F7D6D] transition-colors">
                        {u.name}
                      </h4>
                      <p className="text-slate-500 dark:text-[#8FAAA4] truncate text-[11px]">
                        {u.pos || 'พนักงาน'} · user: <code className="font-mono">{u.user}</code>
                      </p>
                      {u.salary !== undefined && u.salary > 0 && (
                        <p className="text-slate-400 text-[10px]">
                          เงินเดือน: {formatCurrency(u.salary)} บาท
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#E1F0EC] dark:bg-[#1B3A34] text-[#2F7D6D] dark:text-[#4FB39F] font-semibold text-xs whitespace-nowrap shrink-0 group-hover:bg-[#2F7D6D] group-hover:text-white transition-colors">
                    แก้ไข
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              ยังไม่มีพนักงาน เพิ่มคนแรกได้ด้านล่าง
            </div>
          )}
        </div>
      </div>

      {/* Add New Staff Form */}
      <div>
        <h2 className="text-lg font-bold text-[#17332F] dark:text-[#E4F0ED] tracking-tight px-1 mb-2">
          เพิ่มพนักงานใหม่
        </h2>
        <div className="bg-white dark:bg-[#172A27] rounded-3xl p-5 border border-slate-200/80 dark:border-[#254039] shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1 font-medium">
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น สมหญิง ใจดี"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1 font-medium">
                ตำแหน่ง
              </label>
              <input
                type="text"
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                placeholder="เช่น นวดไทย / สปาหน้า"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1 font-medium">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="เช่น som"
                  autoCapitalize="none"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1 font-medium">
                  รหัสผ่าน
                </label>
                <input
                  type="text"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1 font-medium">
                เงินเดือน (บาท)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="เช่น 12000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold text-sm shadow-md shadow-[#2F7D6D]/20 transition-transform active:scale-[0.98] cursor-pointer"
            >
              เพิ่มพนักงาน
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
