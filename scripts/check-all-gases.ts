import { createClient } from '@libsql/client';
const db = createClient({ url: 'file:saferef.db' });
async function main() {
  const refs = await db.execute('SELECT id FROM RefrigerantV5 ORDER BY id');
  const refIds = new Map<string, string>();
  for (const r of refs.rows) { const id = String(r.id); refIds.set(id.toLowerCase(), id); }
  
  const prods = await db.execute('SELECT gas FROM Product');
  const prodGases = new Set<string>();
  for (const r of prods.rows) { try { for (const g of JSON.parse(String(r.gas))) prodGases.add(g); } catch {} }
  
  console.log('ALL product gases vs RefrigerantV5:');
  for (const g of [...prodGases].sort()) {
    const refMatch = refIds.get(g.toLowerCase());
    if (!refMatch) {
      console.log('  MISSING:', g);
    } else if (refMatch !== g) {
      console.log('  CASE MISMATCH:', g, '→ should be', refMatch);
    }
  }
  
  console.log('\nRefrigerantV5 IDs (for reference):');
  for (const r of refs.rows) console.log(' ', String(r.id));
}
main();
