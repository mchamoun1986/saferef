import type { SelectorInput, ProductRecord } from './types';

function parseJson<T>(json: string): T[] {
  try { return JSON.parse(json); }
  catch { return []; }
}

function voltageCompatible(productVoltage: string | null, siteVoltage: string): boolean {
  if (!productVoltage) return false;
  const pv = productVoltage.toLowerCase();
  if (siteVoltage === '230V' && (pv.includes('230') || pv.includes('240') || pv.includes('100-240'))) return true;
  if (siteVoltage === '24V' && (pv.includes('24') || pv.includes('15-24') || pv.includes('18-32') || pv.includes('12-24'))) return true;
  if (siteVoltage === '12V' && (pv.includes('12') || pv.includes('12-24'))) return true;
  return false;
}

export function selectDetector(input: SelectorInput, products: ProductRecord[]): ProductRecord[] {
  const matches = products.filter((p) => {
    if (p.type !== 'detector') return false;
    if (p.discontinued) return false;
    const refs = parseJson<string>(p.refs);
    if (!input.refrigerantRefs.some(r => refs.includes(r))) return false;
    if (input.atexRequired && !p.atex) return false;
    if (!voltageCompatible(p.voltage, input.voltage)) return false;
    const mounts = parseJson<string>(p.mount).map(m => m.toLowerCase());
    const wantMount = input.mountType.toLowerCase();
    if (mounts.length > 0 && !mounts.includes(wantMount)) return false;
    return true;
  });

  matches.sort((a, b) => {
    if (input.preferredFamily) {
      const aMatch = a.family === input.preferredFamily ? 0 : 1;
      const bMatch = b.family === input.preferredFamily ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
    }
    return a.price - b.price;
  });

  return matches;
}
