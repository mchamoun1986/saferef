import type { ProductRecord } from './types';

function ctrlVoltageOk(ctrlVoltage: string | null, siteVoltage: string): boolean {
  if (!ctrlVoltage) return false;
  const cv = ctrlVoltage.toLowerCase();
  if (siteVoltage === '230V') return cv.includes('230') || cv.includes('240') || cv.includes('100-240');
  if (siteVoltage === '24V') return cv.includes('24');
  if (siteVoltage === '12V') return cv.includes('12') || cv.includes('24');
  return false;
}

export function selectController(
  totalDetectors: number,
  siteVoltage: string,
  products: ProductRecord[],
): ProductRecord | null {
  if (totalDetectors <= 0) return null;

  const candidates = products
    .filter((p) => {
      if (p.type !== 'controller') return false;
      if (p.discontinued) return false;
      if (p.channels === null || p.channels < totalDetectors) return false;
      if (!ctrlVoltageOk(p.voltage, siteVoltage)) return false;
      return true;
    })
    .sort((a, b) => {
      const chDiff = (a.channels ?? 0) - (b.channels ?? 0);
      if (chDiff !== 0) return chDiff;
      return a.price - b.price;
    });

  return candidates[0] ?? null;
}
