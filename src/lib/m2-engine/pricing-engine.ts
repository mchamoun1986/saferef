// pricing-engine.ts — M3 Pricing Engine
// EUR-only, HT-only. Takes M2 tier BOMs + discount data -> priced quote.

import type {
  PricingInput,
  PricingResult,
  PricedTier,
  PricedLine,
  TierSolution,
  TierSlot,
} from '../engine-types';

// ── Helpers ──────────────────────────────────────────────────────────

/** Round to 2 decimal places (EUR cents) */
const R = (n: number): number => Math.round(n * 100) / 100;

// ── P1: BOM Price Lookup ─────────────────────────────────────────────

function p1_priceLookup(
  code: string,
  priceDb: Map<string, { price: number; productGroup: string; discontinued: boolean }>
): { listPrice: number; productGroup: string; discontinued: boolean; found: boolean } {
  const entry = priceDb.get(code);
  if (!entry) {
    return { listPrice: 0, productGroup: '?', discontinued: false, found: false };
  }
  return { listPrice: entry.price, productGroup: entry.productGroup, discontinued: entry.discontinued, found: true };
}

// ── P2: Discount Resolution ──────────────────────────────────────────

function p2_resolveDiscount(
  customerGroup: string,
  productGroup: string,
  discountMatrix: { customerGroup: string; productGroup: string; discountPct: number }[],
  discountCode?: string,
  customerOverrides?: { discountCode: string; productGroup: string; ratePct: number }[]
): number {
  // Group F -> always 0%
  if (productGroup === 'F') return 0;

  // Customer override first
  if (discountCode && customerOverrides) {
    const override = customerOverrides.find(
      (o) => o.discountCode === discountCode && o.productGroup === productGroup
    );
    if (override) return override.ratePct;
  }

  // Standard matrix lookup
  const cell = discountMatrix.find(
    (m) => m.customerGroup === customerGroup && m.productGroup === productGroup
  );
  return cell ? cell.discountPct : 0;
}

// ── P3: Line Item Calculation ────────────────────────────────────────

function p3_calculateLine(
  code: string, name: string, category: string,
  qty: number, listPrice: number, discountPct: number, m2Price: number | null
): PricedLine {
  const lineTotal = R(listPrice * qty);
  const discountAmount = R(lineTotal * (discountPct / 100));
  const netTotal = R(lineTotal - discountAmount);

  return {
    code, name, productGroup: '', category, qty,
    listPrice, discountPct, discountAmount, netTotal,
    m2Price: m2Price ?? 0,
  };
}

// ── P5: Final Totals HT ─────────────────────────────────────────────

function p5_totals(lines: PricedLine[]): {
  totalBeforeDiscount: number; totalDiscount: number; totalHt: number;
} {
  const totalBeforeDiscount = R(lines.reduce((sum, l) => sum + R(l.listPrice * l.qty), 0));
  const totalDiscount = R(lines.reduce((sum, l) => sum + l.discountAmount, 0));
  const totalHt = R(totalBeforeDiscount - totalDiscount);
  return { totalBeforeDiscount, totalDiscount, totalHt };
}

// ── Price a single tier ──────────────────────────────────────────────

function priceTier(
  tier: TierSolution,
  customerGroup: string,
  discountCode: string | undefined,
  discountMatrix: PricingInput['discountMatrix'],
  customerOverrides: PricingInput['customerOverrides'],
  priceDb: PricingInput['priceDb']
): { pricedTier: PricedTier; warnings: string[] } {
  const warnings: string[] = [];
  const lines: PricedLine[] = [];

  const bomItems: { code: string; name: string; qty: number; price: number; category: string }[] = [];

  if (tier.detector) {
    bomItems.push({ code: tier.detector.code, name: tier.detector.name, qty: tier.detector.qty, price: tier.detector.price, category: 'Detectors' });
  }

  if (tier.controller) {
    bomItems.push({ code: tier.controller.code, name: tier.controller.name, qty: tier.controller.qty, price: tier.controller.price, category: 'Controller' });
  }

  for (const item of tier.powerAccessories) {
    bomItems.push({ code: item.code, name: item.name, qty: item.qty, price: item.price, category: 'Power' });
  }
  for (const item of tier.alertAccessories) {
    bomItems.push({ code: item.code, name: item.name, qty: item.qty, price: item.price, category: 'Alerts' });
  }
  for (const item of tier.mountingAccessories) {
    bomItems.push({ code: item.code, name: item.name, qty: item.qty, price: item.price, category: 'Mounting' });
  }

  let hasMismatch = false;

  for (const item of bomItems) {
    const lookup = p1_priceLookup(item.code, priceDb);
    if (!lookup.found) warnings.push(`PRICE_NOT_FOUND: ${item.code}`);
    if (lookup.discontinued) warnings.push(`DISCONTINUED: ${item.code}`);
    if (lookup.found && item.price !== null && item.price !== undefined && item.price !== lookup.listPrice) {
      warnings.push(`PRICE_MISMATCH: ${item.code} - M2=${item.price}, DB=${lookup.listPrice}`);
      hasMismatch = true;
    }

    const listPrice = lookup.found ? lookup.listPrice : 0;
    const discountPct = p2_resolveDiscount(customerGroup, lookup.productGroup, discountMatrix, discountCode, customerOverrides);
    const line = p3_calculateLine(item.code, item.name, item.category, item.qty, listPrice, discountPct, item.price);
    line.productGroup = lookup.productGroup;
    lines.push(line);
  }

  const totals = p5_totals(lines);

  const pricedTier: PricedTier = {
    tier: tier.tier, label: tier.label, solutionScore: tier.solutionScore,
    bomLines: lines,
    summary: { totalBeforeDiscount: totals.totalBeforeDiscount, totalDiscount: totals.totalDiscount, totalHt: totals.totalHt },
    priceValidation: hasMismatch ? 'MISMATCH' : 'MATCH',
  };

  return { pricedTier, warnings };
}

// ── Quote ref generator ──────────────────────────────────────────────

function generateQuoteRef(): string {
  const now = new Date();
  const year = now.getFullYear();
  const ts = String(now.getTime() % 100000000).padStart(8, '0');
  return `SR-${year}-${ts}`;
}

// ── Main Export ──────────────────────────────────────────────────────

export function calculatePricing(input: PricingInput): PricingResult {
  const warnings: string[] = [];
  const quoteRef = generateQuoteRef();
  const today = new Date();
  const quoteDate = today.toISOString().slice(0, 10);
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 30);
  const quoteValidUntil = validUntil.toISOString().slice(0, 10);

  let pricedPremiumStandalone: PricedTier | null = null;
  let pricedPremiumCentralized: PricedTier | null = null;
  let pricedEcoStandalone: PricedTier | null = null;
  let pricedEcoCentralized: PricedTier | null = null;

  if (input.tiers.premiumStandalone) {
    const result = priceTier(input.tiers.premiumStandalone, input.customerGroup, input.discountCode, input.discountMatrix, input.customerOverrides, input.priceDb);
    pricedPremiumStandalone = result.pricedTier;
    warnings.push(...result.warnings);
  }
  if (input.tiers.premiumCentralized) {
    const result = priceTier(input.tiers.premiumCentralized, input.customerGroup, input.discountCode, input.discountMatrix, input.customerOverrides, input.priceDb);
    pricedPremiumCentralized = result.pricedTier;
    warnings.push(...result.warnings);
  }
  if (input.tiers.ecoStandalone) {
    const result = priceTier(input.tiers.ecoStandalone, input.customerGroup, input.discountCode, input.discountMatrix, input.customerOverrides, input.priceDb);
    pricedEcoStandalone = result.pricedTier;
    warnings.push(...result.warnings);
  }
  if (input.tiers.ecoCentralized) {
    const result = priceTier(input.tiers.ecoCentralized, input.customerGroup, input.discountCode, input.discountMatrix, input.customerOverrides, input.priceDb);
    pricedEcoCentralized = result.pricedTier;
    warnings.push(...result.warnings);
  }

  const psHt = pricedPremiumStandalone?.summary.totalHt ?? 0;
  const pcHt = pricedPremiumCentralized?.summary.totalHt ?? 0;
  const esHt = pricedEcoStandalone?.summary.totalHt ?? 0;
  const ecHt = pricedEcoCentralized?.summary.totalHt ?? 0;

  const savingsPC = pricedPremiumStandalone && pricedPremiumCentralized && psHt > 0
    ? R(((psHt - pcHt) / psHt) * 100)
    : null;
  const savingsES = pricedPremiumStandalone && pricedEcoStandalone && psHt > 0
    ? R(((psHt - esHt) / psHt) * 100)
    : null;
  const savingsEC = pricedPremiumStandalone && pricedEcoCentralized && psHt > 0
    ? R(((psHt - ecHt) / psHt) * 100)
    : null;

  const fmtEur = (n: number) => `${n.toFixed(2)} EUR`;

  const comparisonRows = [
    { label: 'Detector', premiumStandalone: input.tiers.premiumStandalone?.detector.name ?? '-', premiumCentralized: input.tiers.premiumCentralized?.detector.name ?? '-', ecoStandalone: input.tiers.ecoStandalone?.detector.name ?? '-', ecoCentralized: input.tiers.ecoCentralized?.detector.name ?? '-' },
    { label: 'Controller', premiumStandalone: input.tiers.premiumStandalone?.controller?.name ?? 'Standalone', premiumCentralized: input.tiers.premiumCentralized?.controller?.name ?? 'Standalone', ecoStandalone: input.tiers.ecoStandalone?.controller?.name ?? 'Standalone', ecoCentralized: input.tiers.ecoCentralized?.controller?.name ?? 'Standalone' },
    { label: 'Technical Score', premiumStandalone: pricedPremiumStandalone ? `${pricedPremiumStandalone.solutionScore}/21` : '-', premiumCentralized: pricedPremiumCentralized ? `${pricedPremiumCentralized.solutionScore}/21` : '-', ecoStandalone: pricedEcoStandalone ? `${pricedEcoStandalone.solutionScore}/21` : '-', ecoCentralized: pricedEcoCentralized ? `${pricedEcoCentralized.solutionScore}/21` : '-' },
    { label: 'Total HT', premiumStandalone: pricedPremiumStandalone ? fmtEur(psHt) : '-', premiumCentralized: pricedPremiumCentralized ? fmtEur(pcHt) : '-', ecoStandalone: pricedEcoStandalone ? fmtEur(esHt) : '-', ecoCentralized: pricedEcoCentralized ? fmtEur(ecHt) : '-' },
    { label: 'Savings vs Premium SA', premiumStandalone: '-', premiumCentralized: savingsPC !== null ? `${savingsPC.toFixed(1)}%` : '-', ecoStandalone: savingsES !== null ? `${savingsES.toFixed(1)}%` : '-', ecoCentralized: savingsEC !== null ? `${savingsEC.toFixed(1)}%` : '-' },
  ];

  // No recommendation badge for now
  const recommended: PricingResult['recommended'] = null;

  return {
    quoteRef, quoteDate, quoteValidUntil,
    priceListVersion: '2026-R2',
    tiers: {
      premiumStandalone: pricedPremiumStandalone,
      premiumCentralized: pricedPremiumCentralized,
      ecoStandalone: pricedEcoStandalone,
      ecoCentralized: pricedEcoCentralized,
    },
    comparison: {
      rows: comparisonRows,
      savingsVsPremium: {
        premiumCentralized: savingsPC,
        ecoStandalone: savingsES,
        ecoCentralized: savingsEC,
      },
    },
    recommended, warnings,
  };
}
