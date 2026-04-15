import { describe, it, expect } from 'vitest';
import { getDiscount, applyPricing } from '../pricing';
import type { BOMLine, DiscountRow } from '../types';

const matrix: DiscountRow[] = [
  { customerGroup: 'EDC', productGroup: 'A', discountPct: 67 },
  { customerGroup: 'EDC', productGroup: 'G', discountPct: 50 },
  { customerGroup: '3Fo', productGroup: 'A', discountPct: 50 },
  { customerGroup: '3Fo', productGroup: 'G', discountPct: 30 },
  { customerGroup: 'NO', productGroup: 'A', discountPct: 0 },
  { customerGroup: 'NO', productGroup: 'G', discountPct: 0 },
];

describe('getDiscount', () => {
  it('returns correct discount for EDC + group G', () => {
    expect(getDiscount('EDC', 'G', matrix)).toBe(50);
  });

  it('returns 0 for unknown customer group', () => {
    expect(getDiscount('UNKNOWN', 'G', matrix)).toBe(0);
  });

  it('returns 0 for NO group', () => {
    expect(getDiscount('NO', 'G', matrix)).toBe(0);
  });
});

describe('applyPricing', () => {
  it('calculates net price correctly', () => {
    const lines: BOMLine[] = [
      { productId: '1', code: 'X', name: 'Det', family: 'MIDI', type: 'detector',
        unitPrice: 1000, productGroup: 'G', qty: 2, lineTotal: 2000, essential: true },
      { productId: '2', code: 'Y', name: 'Bracket', family: 'Accessory', type: 'accessory',
        unitPrice: 100, productGroup: 'A', qty: 2, lineTotal: 200, essential: true },
    ];
    const result = applyPricing(lines, 'EDC', matrix);
    expect(result[0].netUnitPrice).toBeCloseTo(500);
    expect(result[0].lineNetTotal).toBeCloseTo(1000);
    expect(result[1].netUnitPrice).toBeCloseTo(33);
    expect(result[1].lineNetTotal).toBeCloseTo(66);
  });

  it('returns gross prices when no customer group', () => {
    const lines: BOMLine[] = [
      { productId: '1', code: 'X', name: 'Det', family: 'MIDI', type: 'detector',
        unitPrice: 1000, productGroup: 'G', qty: 1, lineTotal: 1000, essential: true },
    ];
    const result = applyPricing(lines, '', matrix);
    expect(result[0].netUnitPrice).toBe(1000);
    expect(result[0].lineNetTotal).toBe(1000);
  });
});
