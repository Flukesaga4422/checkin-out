import { SpaDatabase } from '../types';
import { makeDateKey, padZero } from '../utils/dateUtils';

// Helper to generate a placeholder photo avatar data url
export const createSampleAvatarPhoto = (name: string, time: string, isLate: boolean): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 320, 320);
  grad.addColorStop(0, isLate ? '#7F1D1D' : '#134E4A');
  grad.addColorStop(1, isLate ? '#DC2626' : '#2F7D6D');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 320, 320);

  // Decorative ring
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(160, 130, 80, 0, Math.PI * 2);
  ctx.stroke();

  // Avatar text initials
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 54px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name.slice(0, 2), 160, 130);

  // Time & stamp badge at bottom
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 230, 320, 90);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`เข้างาน ${time} น.`, 160, 260);

  ctx.fillStyle = isLate ? '#FCA5A5' : '#86EFAC';
  ctx.font = '18px sans-serif';
  ctx.fillText(isLate ? '⚠️ เช็คอินสาย' : '✓ ตรงเวลา', 160, 290);

  return canvas.toDataURL('image/jpeg', 0.85);
};

export const DB_STORAGE_KEY = 'spa_db_v2';

export const createCleanSeed = (): SpaDatabase => ({
  shop: 'ร้านนวดและสปา',
  storeName: 'ร้านนวดและสปา',
  start: '10:00',
  users: [
    {
      id: 1,
      name: 'ผู้ดูแลระบบ',
      user: 'admin',
      pass: '1234',
      role: 'admin',
      pos: 'ผู้ดูแล',
    },
  ],
  att: {},
  leaves: [],
  holidays: {},
  pay: {},
  slips: [],
});

export const createInitialDatabase = (): SpaDatabase => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const todayDate = now.getDate();

  const db: SpaDatabase = {
    shop: 'ร้านนวดและสปา',
    storeName: 'ร้านนวดและสปา',
    start: '10:00',
    users: [
      {
        id: 1,
        name: 'ผู้ดูแลระบบ',
        user: 'admin',
        pass: '1234',
        role: 'admin',
        pos: 'ผู้ดูแล',
      },
      {
        id: 2,
        name: 'สมหญิง ใจดี',
        user: 'som',
        pass: '1234',
        role: 'staff',
        pos: 'นวดไทย',
        salary: 12000,
      },
      {
        id: 3,
        name: 'นก สายลม',
        user: 'nok',
        pass: '1234',
        role: 'staff',
        pos: 'นวดน้ำมัน',
        salary: 11000,
      },
    ],
    att: {},
    leaves: [
      {
        id: 1,
        uid: 3,
        date: makeDateKey(y, m, Math.min(todayDate + 2, 28)),
        type: 'sick',
        note: 'ไข้หวัด',
        status: 'pending',
        createdAt: makeDateKey(y, m, todayDate),
      },
    ],
    holidays: {},
    pay: {},
    slips: [],
  };

  // Seed past days attendance for demo
  for (let i = 1; i < todayDate; i++) {
    [2, 3].forEach((u) => {
      const isLate = (i * u) % 5 === 0;
      const dateKey = makeDateKey(y, m, i);
      const inTime = isLate ? `10:${padZero(10 + (i % 20))}` : `09:${padZero(40 + (i % 15))}`;
      const lateMins = isLate ? 10 + (i % 20) : 0;
      const outTime = `19:0${i % 9}`;

      db.att[`${u}|${dateKey}`] = {
        in: inTime,
        out: outTime,
        late: lateMins,
        timestamp: Date.now() - (todayDate - i) * 86400000,
      };
    });
  }

  return db;
};

