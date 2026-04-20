import { createClient } from '@libsql/client';
const db = createClient({ url: 'file:saferef.db' });
async function main() {
  const rows = await db.execute("SELECT code, name, image FROM Product WHERE code IN ('MICRO-IR-R290','MICRO-IR-R32','6300-0001','3500-0001')");
  rows.rows.forEach(r => console.log(r.code, '|', r.image));
}
main();
