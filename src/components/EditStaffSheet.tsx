import React, { useState } from 'react';
import { X, Trash2, Check, AlertTriangle, UserCheck } from 'lucide-react';
import { User } from '../types';
import { playSound } from '../utils/dateUtils';

interface EditStaffSheetProps {
  staff: User;
  allUsers: User[];
  onSave: (updated: User) => void;
  onDelete: (staffId: number) => void;
  onClose: () => void;
}

export const EditStaffSheet: React.FC<EditStaffSheetProps> = ({
  staff,
  allUsers,
  onSave,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState(staff.name);
  const [pos, setPos] = useState(staff.pos || '');
  const [user, setUser] = useState(staff.user);
  const [pass, setPass] = useState(staff.pass);
  const [salary, setSalary] = useState(String(staff.salary || 0));
  const [delConfirmStep, setDelConfirmStep] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = user.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = pass.trim();

    if (!cleanName || !cleanUser || (!cleanPass && staff.pass)) {
      setError('กรอกชื่อ ชื่อผู้ใช้ และรหัสผ่านให้ครบ');
      return;
    }

    // Check unique username excluding this staff
    const usernameTaken = allUsers.some(
      (u) => u.id !== staff.id && u.user.toLowerCase() === cleanUser
    );
    if (usernameTaken) {
      setError('ชื่อผู้ใช้นี้มีคนใช้แล้ว กรุณาเลือกชื่อผู้ใช้อื่น');
      return;
    }

    onSave({
      ...staff,
      name: cleanName,
      pos: pos.trim() || 'พนักงาน',
      user: cleanUser,
      pass: cleanPass,
      salary: parseFloat(salary) || 0,
    });
    playSound('success');
    onClose();
  };

  const handleDelete = () => {
    if (!delConfirmStep) {
      setDelConfirmStep(true);
      playSound('click');
      return;
    }

    // Second click: confirmed delete
    onDelete(staff.id);
    playSound('checkout');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#172A27] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#254039] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#254039]">
          <h3 className="text-lg font-bold text-[#17332F] dark:text-[#E4F0ED]">
            แก้ไขข้อมูลพนักงาน
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="py-4 space-y-3.5 text-xs">
          <div>
            <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1 font-medium">
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="เช่น นวดไทย / นวดน้ำมัน / สปาหน้า"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1 font-medium">
                ชื่อผู้ใช้ (Username)
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoCapitalize="none"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm font-mono text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-500 dark:text-[#8FAAA4] block mb-1 font-medium">
                รหัสผ่าน
              </label>
              <input
                type="password"
                placeholder={staff.pass ? '' : 'เว้นว่างเพื่อใช้รหัสเดิม'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required={!!staff.pass}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm font-mono text-slate-800 dark:text-slate-100"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#254039] bg-slate-50 dark:bg-[#0F1B19] text-sm font-mono text-slate-800 dark:text-slate-100"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold text-sm shadow-md shadow-[#2F7D6D]/20 transition-transform active:scale-[0.98]"
            >
              บันทึกการแก้ไข
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                delConfirmStep
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {delConfirmStep
                  ? 'กดอีกครั้งเพื่อยืนยันลบพนักงานคนนี้'
                  : 'ลบพนักงานคนนี้'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
