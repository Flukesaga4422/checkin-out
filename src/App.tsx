import React, { useEffect, useState } from 'react';
import { SpaDatabase, User, PaySlip, LeaveType, LeaveRequest } from './types';
import {
  createInitialDatabase,
  createCleanSeed,
  DB_STORAGE_KEY,
} from './data/initialData';
import {
  getNowTimeStr,
  getTodayKey,
  makeDateKey,
  padZero,
  playSound,
  timeToMinutes,
} from './utils/dateUtils';
import { Header } from './components/Header';
import { BottomTabBar } from './components/BottomTabBar';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { PhotoViewModal } from './components/PhotoViewModal';
import { PaySlipPrintModal } from './components/PaySlipPrintModal';
import { DayDetailsSheet } from './components/DayDetailsSheet';
import { EditStaffSheet } from './components/EditStaffSheet';
import { MedicalCertModal } from './components/MedicalCertModal';
import { InstallAppModal } from './components/InstallAppModal';
import { LoginView } from './views/LoginView';
import { StaffHomeView } from './views/StaffHomeView';
import { StaffCalendarView } from './views/StaffCalendarView';
import { StaffSlipView } from './views/StaffSlipView';
import { StaffMeView } from './views/StaffMeView';
import { AdminTodayView } from './views/AdminTodayView';
import { AdminRequestsView } from './views/AdminRequestsView';
import { AdminCalendarView } from './views/AdminCalendarView';
import { AdminPayrollView } from './views/AdminPayrollView';
import { AdminStaffView } from './views/AdminStaffView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { AlertCircle } from 'lucide-react';

export default function App() {
  // Load Database from localStorage
  const [db, setDb] = useState<SpaDatabase>(() => {
    try {
      const saved = localStorage.getItem(DB_STORAGE_KEY) || localStorage.getItem('spa_db_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.users)) {
          return {
            ...createInitialDatabase(),
            ...parsed,
            shop: parsed.shop || parsed.storeName || 'ร้านนวดและสปา',
          };
        }
      }
    } catch (e) {
      console.error('Failed to load database:', e);
    }
    return createInitialDatabase();
  });

  // Save database helper
  const updateDb = (updater: (prev: SpaDatabase) => SpaDatabase) => {
    setDb((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist database:', e);
      }
      return next;
    });
  };

  // Auth & Active User State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return db.users.find((u) => u.user === 'admin') || db.users[0] || null;
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return currentUser?.role === 'admin' ? 'today' : 'home';
  });

  // Calendar year/month state
  const now = new Date();
  const [calYear, setCalYear] = useState<number>(now.getFullYear());
  const [calMonth, setCalMonth] = useState<number>(now.getMonth());

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Modal & Sheet States
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedDateForSheet, setSelectedDateForSheet] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{
    photo: string;
    name: string;
    pos?: string;
    timeIn: string;
    timeOut?: string;
    lateMins?: number;
    dateStr?: string;
  } | null>(null);
  const [viewingPrintSlip, setViewingPrintSlip] = useState<{
    slip: PaySlip;
    user: User;
  } | null>(null);
  const [viewingMedicalCert, setViewingMedicalCert] = useState<{
    certFile: string;
    certName?: string;
    staffName: string;
    dateStr: string;
    note?: string;
  } | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // Toast Notification state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 2600);
  };

  const todayKey = getTodayKey();

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab(user.role === 'admin' ? 'today' : 'home');
    playSound('success');
    showToast(`ยินดีต้อนรับ ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedDateForSheet(null);
    setViewingPhoto(null);
    setViewingPrintSlip(null);
    setEditingStaff(null);
    playSound('click');
    showToast('ออกจากระบบแล้ว');
  };

  const handleQuickSwitchUser = (user: User) => {
    setCurrentUser(user);
    setActiveTab(user.role === 'admin' ? 'today' : 'home');
    playSound('click');
    showToast(`สลับเป็น: ${user.name}`);
  };

  const handleResetData = () => {
    const fresh = createInitialDatabase();
    setDb(fresh);
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(fresh));
    if (currentUser) {
      const refreshedUser = fresh.users.find((u) => u.id === currentUser.id) || fresh.users[0];
      setCurrentUser(refreshedUser);
    }
    playSound('success');
    showToast('รีเซ็ตข้อมูลตัวอย่างแล้ว');
  };

  // Check-in with Selfie
  const handleConfirmCheckIn = (base64Photo: string) => {
    if (!currentUser) return;
    const nowTime = getNowTimeStr();
    const currentMins = timeToMinutes(nowTime);
    const startMins = timeToMinutes(db.start);
    const late = Math.max(0, currentMins - startMins);

    updateDb((prev) => ({
      ...prev,
      att: {
        ...prev.att,
        [`${currentUser.id}|${todayKey}`]: {
          in: nowTime,
          out: '',
          late,
          photo: base64Photo,
          timestamp: Date.now(),
        },
      },
    }));

    setCameraOpen(false);
    playSound('checkin');

    if (late > 0) {
      showToast(`เช็คอินแล้ว (สาย ${late} นาที)`);
    } else {
      showToast('เช็คอินแล้ว ตรงเวลา');
    }
  };

  // Check-out
  const handleCheckOut = () => {
    if (!currentUser) return;
    const key = `${currentUser.id}|${todayKey}`;
    const existing = db.att[key];
    if (!existing) return;

    const outTime = getNowTimeStr();

    updateDb((prev) => ({
      ...prev,
      att: {
        ...prev.att,
        [key]: {
          ...existing,
          out: outTime,
        },
      },
    }));

    playSound('checkout');
    showToast('เช็คเอาท์แล้ว ขอบคุณค่ะ');
  };

  // Leave Request
  const getDatesInRange = (startStr: string, endStr?: string): string[] => {
    if (!endStr || endStr <= startStr) return [startStr];
    const dates: string[] = [];
    const cur = new Date(startStr);
    const end = new Date(endStr);
    let count = 0;
    while (cur <= end && count < 31) {
      const y = cur.getFullYear();
      const m = padZero(cur.getMonth() + 1);
      const d = padZero(cur.getDate());
      dates.push(`${y}-${m}-${d}`);
      cur.setDate(cur.getDate() + 1);
      count++;
    }
    return dates.length > 0 ? dates : [startStr];
  };

  // Staff Leave & Day Off Request
  const handleRequestLeave = (
    dateStr: string,
    type: LeaveType,
    note: string,
    certFile?: string,
    certName?: string,
    endDateStr?: string
  ) => {
    if (!currentUser) return;

    const dates = getDatesInRange(dateStr, endDateStr);
    const newReqs: LeaveRequest[] = dates.map((d, index) => ({
      id: Date.now() + index,
      uid: currentUser.id,
      date: d,
      type,
      note,
      certFile,
      certName,
      status: type === 'dayoff' ? 'approved' : 'pending',
      createdAt: todayKey,
    }));

    updateDb((prev) => ({
      ...prev,
      leaves: [...prev.leaves, ...newReqs],
    }));

    setSelectedDateForSheet(null);
    showToast(
      type === 'dayoff'
        ? dates.length > 1
          ? `บันทึกวันหยุดปกติต่อเนื่อง ${dates.length} วันแล้ว`
          : 'บันทึกวันหยุดประจำสัปดาห์แล้ว'
        : dates.length > 1
        ? `ส่งคำขอลาต่อเนื่อง ${dates.length} วันแล้ว รออนุมัติ`
        : 'ส่งคำขอแล้ว รอผู้ดูแลอนุมัติ'
    );
  };

  // Admin Direct Assign Leave / Day Off
  const handleAdminAssignLeave = (
    uid: number,
    dateStr: string,
    type: LeaveType,
    note: string,
    endDateStr?: string
  ) => {
    const dates = getDatesInRange(dateStr, endDateStr);
    const newReqs: LeaveRequest[] = dates.map((d, index) => ({
      id: Date.now() + index,
      uid,
      date: d,
      type,
      note,
      status: 'approved',
      createdAt: todayKey,
    }));

    updateDb((prev) => ({
      ...prev,
      leaves: [...prev.leaves, ...newReqs],
    }));

    setSelectedDateForSheet(null);
    const target = db.users.find((u) => u.id === uid);
    showToast(
      dates.length > 1
        ? `ลงวันหยุด/ลา ${dates.length} วันให้ ${target?.name || 'พนักงาน'} เรียบร้อยแล้ว`
        : `ลงวันหยุด/ลาให้ ${target?.name || 'พนักงาน'} เรียบร้อยแล้ว`
    );
  };

  // Leave Approval
  const handleSetLeaveStatus = (leaveId: number, status: 'approved' | 'rejected') => {
    updateDb((prev) => ({
      ...prev,
      leaves: prev.leaves.map((l) => (l.id === leaveId ? { ...l, status } : l)),
    }));
    showToast(status === 'approved' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติแล้ว');
  };

  // Store Holidays
  const handleSaveHoliday = (dateStr: string, name: string) => {
    updateDb((prev) => ({
      ...prev,
      holidays: {
        ...prev.holidays,
        [dateStr]: name,
      },
    }));
    setSelectedDateForSheet(null);
    showToast('บันทึกวันหยุดแล้ว');
  };

  const handleDeleteHoliday = (dateStr: string) => {
    updateDb((prev) => {
      const nextHolidays = { ...prev.holidays };
      delete nextHolidays[dateStr];
      return {
        ...prev,
        holidays: nextHolidays,
      };
    });
    setSelectedDateForSheet(null);
    showToast('ยกเลิกวันหยุดแล้ว');
  };

  // Payroll
  const handleUpdatePayConfig = (uid: number, field: string, value: number) => {
    const monKey = `${calYear}-${padZero(calMonth + 1)}`;
    const k = `${uid}|${monKey}`;

    updateDb((prev) => ({
      ...prev,
      pay: {
        ...prev.pay,
        [k]: {
          ...(prev.pay[k] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleSendSlip = (slip: PaySlip) => {
    updateDb((prev) => ({
      ...prev,
      slips: [...prev.slips.filter((s) => s.key !== slip.key), slip],
    }));
    const recipient = db.users.find((u) => u.id === slip.uid);
    showToast(`ส่งสลิปให้ ${recipient?.name || 'พนักงาน'} แล้ว`);
  };

  // Add Staff
  const handleAddStaff = (newStaff: Omit<User, 'id'>): boolean => {
    if (db.users.some((u) => u.user.toLowerCase() === newStaff.user.toLowerCase())) {
      return false;
    }

    const created: User = {
      ...newStaff,
      id: Date.now(),
    };

    updateDb((prev) => ({
      ...prev,
      users: [...prev.users, created],
    }));

    showToast('เพิ่มพนักงานแล้ว');
    return true;
  };

  // Edit Staff Details
  const handleSaveEditedStaff = (updatedUser: User) => {
    updateDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    }));
    // Also update currentUser if editing self
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    showToast('บันทึกการแก้ไขแล้ว');
  };

  // Delete Staff Member
  const handleDeleteStaff = (staffId: number) => {
    updateDb((prev) => {
      const nextAtt = { ...prev.att };
      Object.keys(nextAtt)
        .filter((k) => k.startsWith(`${staffId}|`))
        .forEach((k) => delete nextAtt[k]);

      const nextPay = { ...prev.pay };
      Object.keys(nextPay)
        .filter((k) => k.startsWith(`${staffId}|`))
        .forEach((k) => delete nextPay[k]);

      return {
        ...prev,
        users: prev.users.filter((u) => u.id !== staffId),
        att: nextAtt,
        pay: nextPay,
        leaves: prev.leaves.filter((l) => l.uid !== staffId),
        slips: prev.slips.filter((s) => s.uid !== staffId),
      };
    });

    showToast('ลบพนักงานแล้ว');
  };

  // Password Update
  const handleUpdatePassword = (newPass: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, pass: newPass };
    setCurrentUser(updated);
    updateDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === currentUser.id ? updated : u)),
    }));
    showToast('เปลี่ยนรหัสผ่านแล้ว');
  };

  // Shop & Start Time Update
  const handleUpdateShopAndStart = (shop: string, start: string) => {
    updateDb((prev) => ({
      ...prev,
      shop,
      storeName: shop,
      start,
    }));
    showToast('บันทึกแล้ว');
  };

  // Backup Import
  const handleImportBackup = (importedDb: SpaDatabase) => {
    setDb(importedDb);
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(importedDb));
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    showToast('นำเข้าข้อมูลแล้ว กรุณาเข้าสู่ระบบใหม่');
  };

  // Factory Reset
  const handleFactoryReset = () => {
    try {
      localStorage.removeItem(DB_STORAGE_KEY);
      localStorage.removeItem('spa_db_v1');
    } catch (x) {}
    const clean = createCleanSeed();
    setDb(clean);
    setCurrentUser(null);
    showToast('ล้างข้อมูลทั้งหมดและเริ่มใหม่แล้ว');
  };

  // Month navigation
  const handlePrevMonth = () => {
    setCalMonth((prev) => {
      if (prev === 0) {
        setCalYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalMonth((prev) => {
      if (prev === 11) {
        setCalYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Staff month stats
  const getStaffMonthStats = (uid: number) => {
    const currentMonStr = `${calYear}-${padZero(calMonth + 1)}`;
    let workDays = 0;
    let lateDays = 0;

    Object.keys(db.att).forEach((k) => {
      const [u, d] = k.split('|');
      if (parseInt(u, 10) === uid && d.startsWith(currentMonStr)) {
        workDays++;
        if (db.att[k].late > 0) lateDays++;
      }
    });

    const leaveDays = db.leaves.filter(
      (l) => l.uid === uid && l.status === 'approved' && l.date.startsWith(currentMonStr)
    ).length;

    return { workDays, lateDays, leaveDays };
  };

  // Recent attendance for staff
  const getRecentAttendance = (uid: number) => {
    return Object.keys(db.att)
      .filter((k) => k.startsWith(`${uid}|`))
      .map((k) => ({
        dateKey: k.split('|')[1],
        record: db.att[k],
      }))
      .sort((a, b) => (b.dateKey < a.dateKey ? -1 : 1));
  };

  // Counts
  const pendingLeavesCount = db.leaves.filter((l) => l.status === 'pending').length;
  const staffList = db.users.filter((u) => u.role === 'staff');

  return (
    <div className="min-h-screen bg-[#EDF3F1] dark:bg-[#0F1B19] text-[#17332F] dark:text-[#E4F0ED] flex flex-col justify-between selection:bg-[#2F7D6D] selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#17332F] dark:bg-white text-white dark:text-[#17332F] rounded-full shadow-2xl text-xs font-semibold tracking-wide max-w-[90vw] text-center border border-white/20 animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Login Screen */}
      {!currentUser ? (
        <LoginView
          users={db.users}
          shopName={db.shop}
          onLogin={handleLogin}
          onOpenInstallModal={() => setInstallModalOpen(true)}
        />
      ) : (
        /* Main Application Frame */
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col min-h-screen relative shadow-2xl bg-[#EDF3F1] dark:bg-[#0F1B19]">
          {/* Header */}
          <Header
            currentUser={currentUser}
            storeName={db.shop}
            theme={theme}
            onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            onLogout={handleLogout}
            onResetData={handleResetData}
            onQuickSwitchUser={handleQuickSwitchUser}
            onOpenInstallModal={() => setInstallModalOpen(true)}
            allUsers={db.users}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-4 pt-3">
            {/* Warning banner for default admin password */}
            {currentUser.role === 'admin' && currentUser.pass === '1234' && (
              <div className="mb-4 bg-white dark:bg-[#172A27] rounded-3xl p-4 border-2 border-[#C99A3B] shadow-xs">
                <div className="font-bold text-sm text-[#17332F] dark:text-[#E4F0ED] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#C99A3B]" />
                  <span>ควรเปลี่ยนรหัสผ่านก่อนใช้งานจริง</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-[#8FAAA4] mt-1 mb-2.5">
                  ตอนนี้ยังเป็นรหัสผ่านเริ่มต้น (1234)
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('set')}
                  className="px-3 py-1.5 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white text-xs font-semibold shadow-xs"
                >
                  ไปเปลี่ยนรหัสผ่าน
                </button>
              </div>
            )}

            {currentUser.role === 'staff' ? (
              /* STAFF VIEWS */
              <>
                {activeTab === 'home' && (
                  <StaffHomeView
                    currentUser={currentUser}
                    todayKey={todayKey}
                    startTime={db.start}
                    todayRecord={db.att[`${currentUser.id}|${todayKey}`]}
                    monthStats={getStaffMonthStats(currentUser.id)}
                    recentRecords={getRecentAttendance(currentUser.id)}
                    onOpenCheckInCamera={() => setCameraOpen(true)}
                    onCheckOut={handleCheckOut}
                    onSelectDate={(dateKey) => setSelectedDateForSheet(dateKey)}
                  />
                )}

                {activeTab === 'cal' && (
                  <StaffCalendarView
                    currentUser={currentUser}
                    year={calYear}
                    month={calMonth}
                    holidays={db.holidays}
                    attendanceMap={db.att}
                    userLeaves={db.leaves.filter((l) => l.uid === currentUser.id)}
                    todayKey={todayKey}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onSelectDate={(dateKey) => setSelectedDateForSheet(dateKey)}
                  />
                )}

                {activeTab === 'slip' && (
                  <StaffSlipView
                    currentUser={currentUser}
                    slips={db.slips}
                    onOpenPrintSlip={(slip) => setViewingPrintSlip({ slip, user: currentUser })}
                  />
                )}

                {activeTab === 'me' && (
                  <StaffMeView
                    currentUser={currentUser}
                    onUpdatePassword={handleUpdatePassword}
                    onOpenInstallModal={() => setInstallModalOpen(true)}
                  />
                )}
              </>
            ) : (
              /* ADMIN VIEWS */
              <>
                {activeTab === 'today' && (
                  <AdminTodayView
                    staffList={staffList}
                    todayKey={todayKey}
                    attendanceMap={db.att}
                    todayLeaves={db.leaves.filter((l) => l.date === todayKey)}
                    pendingLeaveCount={pendingLeavesCount}
                    onSelectPhoto={(photo, staffName, timeIn, timeOut, lateMins) =>
                      setViewingPhoto({
                        photo,
                        name: staffName,
                        timeIn,
                        timeOut,
                        lateMins,
                        dateStr: todayKey,
                      })
                    }
                  />
                )}

                {activeTab === 'req' && (
                  <AdminRequestsView
                    users={db.users}
                    leaves={db.leaves}
                    onSetStatus={handleSetLeaveStatus}
                    onViewCert={(certFile, certName, staffName, dateStr, note) =>
                      setViewingMedicalCert({
                        certFile,
                        certName,
                        staffName,
                        dateStr,
                        note,
                      })
                    }
                  />
                )}

                {activeTab === 'cal' && (
                  <AdminCalendarView
                    year={calYear}
                    month={calMonth}
                    holidays={db.holidays}
                    attendanceMap={db.att}
                    leaves={db.leaves}
                    todayKey={todayKey}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onSelectDate={(dateKey) => setSelectedDateForSheet(dateKey)}
                  />
                )}

                {activeTab === 'pay' && (
                  <AdminPayrollView
                    staffList={staffList}
                    year={calYear}
                    month={calMonth}
                    payConfigMap={db.pay}
                    slips={db.slips}
                    leaves={db.leaves}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onUpdatePayConfig={handleUpdatePayConfig}
                    onSendSlip={handleSendSlip}
                    onPreviewSlip={(slip, user) => setViewingPrintSlip({ slip, user })}
                  />
                )}

                {activeTab === 'staff' && (
                  <AdminStaffView
                    staffList={staffList}
                    onAddStaff={handleAddStaff}
                    onSelectEditStaff={(u) => setEditingStaff(u)}
                  />
                )}

                {activeTab === 'set' && (
                  <AdminSettingsView
                    db={db}
                    currentUser={currentUser}
                    onUpdateShopAndStart={handleUpdateShopAndStart}
                    onUpdateAdminPassword={handleUpdatePassword}
                    onImportBackup={handleImportBackup}
                    onFactoryReset={handleFactoryReset}
                    onOpenInstallModal={() => setInstallModalOpen(true)}
                  />
                )}
              </>
            )}
          </main>

          {/* Bottom Tabs */}
          <BottomTabBar
            role={currentUser.role}
            currentTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              playSound('click');
            }}
            pendingLeaveCount={pendingLeavesCount}
          />
        </div>
      )}

      {/* Live / Fallback Camera Capture Modal */}
      {cameraOpen && currentUser && (
        <CameraCaptureModal
          userName={currentUser.name}
          onCapture={handleConfirmCheckIn}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Edit Staff Sheet */}
      {editingStaff && (
        <EditStaffSheet
          staff={editingStaff}
          allUsers={db.users}
          onSave={handleSaveEditedStaff}
          onDelete={handleDeleteStaff}
          onClose={() => setEditingStaff(null)}
        />
      )}

      {/* High-res Photo Viewer Modal */}
      {viewingPhoto && (
        <PhotoViewModal
          photo={viewingPhoto.photo}
          name={viewingPhoto.name}
          pos={viewingPhoto.pos}
          timeIn={viewingPhoto.timeIn}
          timeOut={viewingPhoto.timeOut}
          lateMins={viewingPhoto.lateMins}
          dateStr={viewingPhoto.dateStr}
          onClose={() => setViewingPhoto(null)}
        />
      )}

      {/* Printable Pay Slip Modal */}
      {viewingPrintSlip && (
        <PaySlipPrintModal
          slip={viewingPrintSlip.slip}
          user={viewingPrintSlip.user}
          storeName={db.shop}
          onClose={() => setViewingPrintSlip(null)}
        />
      )}

      {/* Day Details Bottom Sheet */}
      {selectedDateForSheet && currentUser && (
        <DayDetailsSheet
          dateStr={selectedDateForSheet}
          role={currentUser.role}
          currentUserId={currentUser.id}
          users={db.users}
          holidayName={db.holidays[selectedDateForSheet]}
          userAttendance={db.att[`${currentUser.id}|${selectedDateForSheet}`]}
          userLeaves={db.leaves.filter(
            (l) => l.uid === currentUser.id && l.date === selectedDateForSheet
          )}
          allLeavesOnDate={db.leaves.filter((l) => l.date === selectedDateForSheet)}
          allAttendanceOnDate={staffList
            .filter((u) => !!db.att[`${u.id}|${selectedDateForSheet}`])
            .map((u) => ({
              user: u,
              record: db.att[`${u.id}|${selectedDateForSheet}`],
            }))}
          onSaveHoliday={handleSaveHoliday}
          onDeleteHoliday={handleDeleteHoliday}
          onRequestLeave={handleRequestLeave}
          onAdminAssignLeave={handleAdminAssignLeave}
          onViewCert={(certFile, certName, staffName, dateStr, note) =>
            setViewingMedicalCert({
              certFile,
              certName,
              staffName,
              dateStr,
              note,
            })
          }
          onClose={() => setSelectedDateForSheet(null)}
        />
      )}

      {/* Medical Certificate Fullscreen / Zoom Modal */}
      {viewingMedicalCert && (
        <MedicalCertModal
          certFile={viewingMedicalCert.certFile}
          certName={viewingMedicalCert.certName}
          staffName={viewingMedicalCert.staffName}
          dateStr={viewingMedicalCert.dateStr}
          note={viewingMedicalCert.note}
          onClose={() => setViewingMedicalCert(null)}
        />
      )}

      {/* Android & PWA Install / APK Download Modal */}
      {installModalOpen && (
        <InstallAppModal onClose={() => setInstallModalOpen(false)} />
      )}
    </div>
  );
}
