import type { BOMLine, DiscountRow } from './types';

export interface PricedLine extends BOMLine {
  discountPct: number;
  netUnitPrice: number;
  lineNetTotal: number;
}

export function getDiscount(customerGroup: string, productGroup: string, matrix: DiscountRow[]): number {
  if (!customerGroup) return 0;
  const row = matrix.find(
    (r) => r.customerGroup === customerGroup && r.productGroup === productGroup,
  );
  return row?.discountPct ?? 0;
}

export function applyPricing(lines: BOMLine[], customerGroup: string, matrix: DiscountRow[]): PricedLine[] {
  return lines.map((line) => {
    const discountPct = getDiscount(customerGroup, line.productGroup, matrix);
    const netUnitPrice = line.unitPrice * (1 - discountPct / 100);
    const lineNetTotal = netUnitPrice * line.qty;
    return { ...line, discountPct, netUnitPrice, lineNetTotal };
  });
}
