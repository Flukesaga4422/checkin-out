// Shared by browser and Edge Function. Changes affect individual records, never a whole snapshot.
export type Change = { section: string; key: string; before: unknown; after: unknown };
export function diffDatabase(before: any, after: any): Change[] {
 const changes: Change[] = [];
 for (const section of ['att','holidays','pay','users','leaves','slips','settings']) {
  const map = (db: any): Record<string, any> => section === 'settings'
   ? { shop: db.shop, start: db.start }
   : ['users','leaves','slips'].includes(section)
    ? Object.fromEntries((db[section] || []).map((x: any) => [section === 'slips' ? x.key : String(x.id), x]))
    : db[section] || {};
  const a = map(before), b = map(after);
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
   if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) changes.push({section,key,before:a[key] ?? null,after:b[key] ?? null});
  }
 }
 return changes;
}
