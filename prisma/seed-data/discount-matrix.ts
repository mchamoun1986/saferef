/**
 * Discount Matrix — 55 rows (11 customer groups x 5 product groups)
 * Maps to Prisma DiscountMatrix model.
 */

export interface SeedDiscountRow {
  customerGroup: string;
  productGroup: string;
  discountPct: number;
}

export const DISCOUNT_MATRIX: SeedDiscountRow[] = [
  { customerGroup: 'EDC', productGroup: 'A', discountPct: 67 },
  { customerGroup: 'EDC', productGroup: 'C', discountPct: 25 },
  { customerGroup: 'EDC', productGroup: 'D', discountPct: 30 },
  { customerGroup: 'EDC', productGroup: 'F', discountPct: 0 },
  { customerGroup: 'EDC', productGroup: 'G', discountPct: 50 },
  { customerGroup: 'OEM', productGroup: 'A', discountPct: 65 },
  { customerGroup: 'OEM', productGroup: 'C', discountPct: 25 },
  { customerGroup: 'OEM', productGroup: 'D', discountPct: 30 },
  { customerGroup: 'OEM', productGroup: 'F', discountPct: 0 },
  { customerGroup: 'OEM', productGroup: 'G', discountPct: 50 },
  { customerGroup: '1Fo', productGroup: 'A', discountPct: 60 },
  { customerGroup: '1Fo', productGroup: 'C', discountPct: 25 },
  { customerGroup: '1Fo', productGroup: 'D', discountPct: 30 },
  { customerGroup: '1Fo', productGroup: 'F', discountPct: 0 },
  { customerGroup: '1Fo', productGroup: 'G', discountPct: 50 },
  { customerGroup: '2Fo', productGroup: 'A', discountPct: 56 },
  { customerGroup: '2Fo', productGroup: 'C', discountPct: 25 },
  { customerGroup: '2Fo', productGroup: 'D', discountPct: 30 },
  { customerGroup: '2Fo', productGroup: 'F', discountPct: 0 },
  { customerGroup: '2Fo', productGroup: 'G', discountPct: 50 },
  { customerGroup: '3Fo', productGroup: 'A', discountPct: 50 },
  { customerGroup: '3Fo', productGroup: 'C', discountPct: 25 },
  { customerGroup: '3Fo', productGroup: 'D', discountPct: 25 },
  { customerGroup: '3Fo', productGroup: 'F', discountPct: 0 },
  { customerGroup: '3Fo', productGroup: 'G', discountPct: 30 },
  { customerGroup: '1Contractor', productGroup: 'A', discountPct: 47.5 },
  { customerGroup: '1Contractor', productGroup: 'C', discountPct: 25 },
  { customerGroup: '1Contractor', productGroup: 'D', discountPct: 25 },
  { customerGroup: '1Contractor', productGroup: 'F', discountPct: 0 },
  { customerGroup: '1Contractor', productGroup: 'G', discountPct: 30 },
  { customerGroup: '2Contractor', productGroup: 'A', discountPct: 45 },
  { customerGroup: '2Contractor', productGroup: 'C', discountPct: 25 },
  { customerGroup: '2Contractor', productGroup: 'D', discountPct: 25 },
  { customerGroup: '2Contractor', productGroup: 'F', discountPct: 0 },
  { customerGroup: '2Contractor', productGroup: 'G', discountPct: 30 },
  { customerGroup: '3Contractor', productGroup: 'A', discountPct: 40 },
  { customerGroup: '3Contractor', productGroup: 'C', discountPct: 25 },
  { customerGroup: '3Contractor', productGroup: 'D', discountPct: 25 },
  { customerGroup: '3Contractor', productGroup: 'F', discountPct: 0 },
  { customerGroup: '3Contractor', productGroup: 'G', discountPct: 12.5 },
  { customerGroup: 'AKund', productGroup: 'A', discountPct: 30 },
  { customerGroup: 'AKund', productGroup: 'C', discountPct: 10 },
  { customerGroup: 'AKund', productGroup: 'D', discountPct: 20 },
  { customerGroup: 'AKund', productGroup: 'F', discountPct: 0 },
  { customerGroup: 'AKund', productGroup: 'G', discountPct: 12.5 },
  { customerGroup: 'BKund', productGroup: 'A', discountPct: 20 },
  { customerGroup: 'BKund', productGroup: 'C', discountPct: 0 },
  { customerGroup: 'BKund', productGroup: 'D', discountPct: 10 },
  { customerGroup: 'BKund', productGroup: 'F', discountPct: 0 },
  { customerGroup: 'BKund', productGroup: 'G', discountPct: 12.5 },
  { customerGroup: 'NO', productGroup: 'A', discountPct: 0 },
  { customerGroup: 'NO', productGroup: 'C', discountPct: 0 },
  { customerGroup: 'NO', productGroup: 'D', discountPct: 0 },
  { customerGroup: 'NO', productGroup: 'F', discountPct: 0 },
  { customerGroup: 'NO', productGroup: 'G', discountPct: 0 },
];
