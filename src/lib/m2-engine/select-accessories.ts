import type { ProductRecord } from './types';

function parseJson<T>(json: string): T[] {
  try { return JSON.parse(json); }
  catch { return []; }
}

function familyCompatible(accessory: ProductRecord, detectorFamily: string): boolean {
  const families = parseJson<string>(accessory.compatibleFamilies);
  return families.includes('ALL') || families.includes(detectorFamily);
}

function gasMatch(accessory: ProductRecord, gasGroup: string): boolean {
  const refs = parseJson<string>(accessory.refs);
  if (refs.length === 0) return false;
  return refs.includes(gasGroup);
}

export function selectAccessories(
  detectorFamily: string,
  gasGroup: string,
  mountType: string,
  products: ProductRecord[],
): { essential: ProductRecord[]; optional: ProductRecord[] } {
  const compatible = products.filter((p) => {
    if (p.type !== 'accessory') return false;
    if (p.discontinued) return false;
    if (!familyCompatible(p, detectorFamily)) return false;
    return true;
  });

  const essential: ProductRecord[] = [];
  const optional: ProductRecord[] = [];

  for (const acc of compatible) {
    const cat = acc.subCategory ?? '';
    if (cat === 'mounting') {
      essential.push(acc);
      continue;
    }
    if (cat === 'service' && gasMatch(acc, gasGroup)) {
      essential.push(acc);
      continue;
    }
    optional.push(acc);
  }

  return { essential, optional };
}
