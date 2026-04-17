// pricing-engine.ts — M3 Pricing Engine V5
// EUR-only, HT-only. Takes M2 tier BOMs + discount data → priced quote.

import type {
  PricingInput,
  PricingResult,
  PricedTier,
  PricedLine,
  TierSolution,
} from './engine-types';

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
  return {
    listPrice: entry.price,
    productGroup: entry.productGroup,
    discontinued: entry.discontinued,
    found: true,
  };
}

// ── P2: Discount Resolution ──────────────────────────────────────────

function p2_resolveDiscount(
  customerGroup: string,
  productGroup: string,
  discountMatrix: { customerGroup: string; productGroup: string; discountPct: number }[],
  discountCode?: string,
  customerOverrides?: { discountCode: string; productGroup: string; ratePct: number }[]
): number {
  // Group F → always 0%
  if (productGroup === 'F') return 0;

  // If discount code provided → check customer overrides first
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
  code: string,
  name: string,
  category: string,
  qty: number,
  listPrice: number,
  discountPct: number,
  m2Price: number | null
): PricedLine {
  const lineTotal = R(listPrice * qty);
  const discountAmount = R(lineTotal * (discountPct / 100));
  const netTotal = R(lineTotal - discountAmount);

  return {
    code,
    name,
    productGroup: '', // filled by caller after P1
    category,
    qty,
    listPrice,
    discountPct,
    discountAmount,
    netTotal,
    m2Price: m2Price ?? 0,
  };
}

// ── P5: Final Totals HT ─────────────────────────────────────────────

function p5_totals(lines: PricedLine[]): {
  totalBeforeDiscount: number;
  totalDiscount: number;
  totalHt: number;
} {
  const totalBeforeDiscount = R(
    lines.reduce((sum, l) => sum + R(l.listPrice * l.qty), 0)
  );
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

  // Collect all BOM items from every category
  const bomItems: { code: string; name: string; qty: number; price: number; category: string }[] = [];

  // Detectors
  if (tier.detector) {
    bomItems.push({
      code: tier.detector.code,
      name: tier.detector.name,
      qty: tier.detector.qty,
      price: tier.detector.price,
      category: 'Detectors',
    });
  }

  // Controller
  if (tier.controller) {
    bomItems.push({
      code: tier.controller.code,
      name: tier.controller.name,
      qty: tier.controller.qty,
      price: tier.controller.price,
      category: 'Controller',
    });
  }

  // Power accessories
  for (const item of tier.powerAccessories) {
    bomItems.push({ code: item.code, name: item.name, qty: item.qty, price: item.price, category: 'Power' });
  }

  // Alert accessories
  for (const item of tier.alertAccessories) {
    bomItems.push({ code: item.code, name: item.name, qty: item.qty, price: item.price, category: 'Alerts' });
  }

  // Mounting accessories
  for (const item of tier.mountingAccessories) {
    bomItems.push({ code: item.code, name: item.name, qty: item.qty, price: item.price, category: 'Mounting' });
  }

  // Service tools & spare sensors — excluded from proposal pricing (informational only)

  // Process each BOM item through P1 → P2 → P3
  let hasMismatch = false;

  for (const item of bomItems) {
    // P1: Price lookup
    const lookup = p1_priceLookup(item.code, priceDb);

    if (!lookup.found) {
      warnings.push(`PRICE_NOT_FOUND: ${item.code}`);
    }

    if (lookup.discontinued) {
      warnings.push(`DISCONTINUED: ${item.code}`);
    }

    // Cross-validate M2 price vs DB price
    if (lookup.found && item.price !== null && item.price !== undefined && item.price !== lookup.listPrice) {
      warnings.push(`PRICE_MISMATCH: ${item.code} — M2=${item.price}, DB=${lookup.listPrice}`);
      hasMismatch = true;
    }

    // DB price is authoritative
    const listPrice = lookup.found ? lookup.listPrice : 0;

    // P2: Discount resolution
    const discountPct = p2_resolveDiscount(
      customerGroup,
      lookup.productGroup,
      discountMatrix,
      discountCode,
      customerOverrides
    );

    // P3: Line calculation
    const line = p3_calculateLine(
      item.code,
      item.name,
      item.category,
      item.qty,
      listPrice,
      discountPct,
      item.price
    );
    // Fill productGroup from P1
    line.productGroup = lookup.productGroup;

    lines.push(line);
  }

  // P5: Final totals
  const totals = p5_totals(lines);

  const pricedTier: PricedTier = {
    tier: tier.tier,
    label: tier.label,
    solutionScore: tier.solutionScore,
    bomLines: lines,
    summary: {
      totalBeforeDiscount: totals.totalBeforeDiscount,
      totalDiscount: totals.totalDiscount,
      totalHt: totals.totalHt,
    },
    priceValidation: hasMismatch ? 'MISMATCH' : 'MATCH',
  };

  return { pricedTier, warnings };
}

// ── Quote ref generator ──────────────────────────────────────────────

function generateQuoteRef(): string {
  const now = new Date();
  const year = now.getFullYear();
  const ts = String(now.getTime() % 100000000).padStart(8, '0');
  return `DET-${year}-${ts}`;
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

  // Price each tier
  let pricedPremium: PricedTier | null = null;
  let pricedStandard: PricedTier | null = null;
  let pricedCentralized: PricedTier | null = null;

  if (input.tiers.premium) {
    const result = priceTier(
      input.tiers.premium,
      input.customerGroup,
      input.discountCode,
      input.discountMatrix,
      input.customerOverrides,
      input.priceDb
    );
    pricedPremium = result.pricedTier;
    warnings.push(...result.warnings);
  }

  if (input.tiers.standard) {
    const result = priceTier(
      input.tiers.standard,
      input.customerGroup,
      input.discountCode,
      input.discountMatrix,
      input.customerOverrides,
      input.priceDb
    );
    pricedStandard = result.pricedTier;
    warnings.push(...result.warnings);
  }

  if (input.tiers.centralized) {
    const result = priceTier(
      input.tiers.centralized,
      input.customerGroup,
      input.discountCode,
      input.discountMatrix,
      input.customerOverrides,
      input.priceDb
    );
    pricedCentralized = result.pricedTier;
    warnings.push(...result.warnings);
  }

  // Build comparison table
  const premiumHt = pricedPremium?.summary.totalHt ?? 0;
  const standardHt = pricedStandard?.summary.totalHt ?? 0;
  const centralizedHt = pricedCentralized?.summary.totalHt ?? 0;

  const savingsStandard =
    pricedPremium && pricedStandard && premiumHt > 0
      ? R(((premiumHt - standardHt) / premiumHt) * 100)
      : null;
  const savingsCentralized =
    pricedPremium && pricedCentralized && premiumHt > 0
      ? R(((premiumHt - centralizedHt) / premiumHt) * 100)
      : null;

  const fmtEur = (n: number) => `${n.toFixed(2)} EUR`;

  const comparisonRows: { label: string; premium: string; standard: string; centralized: string }[] = [
    {
      label: 'Detector',
      premium: input.tiers.premium?.detector.name ?? '—',
      standard: input.tiers.standard?.detector.name ?? '—',
      centralized: input.tiers.centralized?.detector.name ?? '—',
    },
    {
      label: 'Controller',
      premium: input.tiers.premium?.controller?.name ?? 'Standalone',
      standard: input.tiers.standard?.controller?.name ?? 'Standalone',
      centralized: input.tiers.centralized?.controller?.name ?? 'Standalone',
    },
    {
      label: 'Technical Score',
      premium: pricedPremium ? `${pricedPremium.solutionScore}/21` : '—',
      standard: pricedStandard ? `${pricedStandard.solutionScore}/21` : '—',
      centralized: pricedCentralized ? `${pricedCentralized.solutionScore}/21` : '—',
    },
    {
      label: 'Total HT',
      premium: pricedPremium ? fmtEur(premiumHt) : '—',
      standard: pricedStandard ? fmtEur(standardHt) : '—',
      centralized: pricedCentralized ? fmtEur(centralizedHt) : '—',
    },
    {
      label: 'Savings vs Premium',
      premium: '—',
      standard: savingsStandard !== null ? `${savingsStandard.toFixed(1)}%` : '—',
      centralized: savingsCentralized !== null ? `${savingsCentralized.toFixed(1)}%` : '—',
    },
  ];

  // Recommendation: best score/price ratio (not blindly "standard")
  const candidates = [
    { key: 'premium' as const, tier: pricedPremium },
    { key: 'standard' as const, tier: pricedStandard },
    { key: 'centralized' as const, tier: pricedCentralized },
  ].filter(c => c.tier !== null);

  let recommended: 'premium' | 'standard' | 'centralized' = 'standard';
  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      // Higher score wins, then lower price
      const sa = a.tier!.solutionScore; const sb = b.tier!.solutionScore;
      if (sa !== sb) return sb - sa;
      return a.tier!.summary.totalHt - b.tier!.summary.totalHt;
    });
    recommended = candidates[0].key;
  }

  return {
    quoteRef,
    quoteDate,
    quoteValidUntil,
    priceListVersion: '2026-R2',
    tiers: {
      premium: pricedPremium,
      standard: pricedStandard,
      centralized: pricedCentralized,
    },
    comparison: {
      rows: comparisonRows,
      savingsVsPremium: {
        standard: savingsStandard,
        centralized: savingsCentralized,
      },
    },
    recommended,
    warnings,
  };
}
