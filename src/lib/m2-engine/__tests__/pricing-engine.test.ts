import { describe, it, expect } from 'vitest';
import { calculatePricing } from '../pricing-engine';
import type { PricingInput, TierSolution } from '../../engine-types';

// ─── Test helpers ────────────────────────────────────────────────────

function makeTier(overrides: Partial<TierSolution> = {}): TierSolution {
  return {
    tier: 'PREMIUM_STANDALONE',
    label: 'Premium — Standalone',
    solutionScore: 16,
    detector: {
      code: '10-100', name: 'MIDI-IR-R744', qty: 4, price: 500,
      gas: 'CO2', range: '0-10000ppm', sensorTech: 'IR',
      sensorLife: '15 years', ip: 'IP54', tempMin: -40, tempMax: 50,
      image: null,
    },
    detectorSpecs: {
      power: 2, voltage: '24V AC/DC', relays: 2, relaySpec: null,
      analog: 'selectable', analogType: null, modbus: true, modbusType: null,
      connectTo: null, features: null,
    },
    controller: null,
    controllerSpecs: null,
    powerAccessories: [],
    mountingAccessories: [],
    alertAccessories: [
      { code: '40-440', name: 'FL-RL-R', qty: 4, price: 150, subtotal: 600 },
    ],
    serviceTools: [],
    spareSensors: [],
    totalBom: 2600,
    ...overrides,
  };
}

function makePriceDb(): Map<string, { price: number; productGroup: string; discontinued: boolean }> {
  const db = new Map<string, { price: number; productGroup: string; discontinued: boolean }>();
  db.set('10-100', { price: 500, productGroup: 'G', discontinued: false });
  db.set('40-440', { price: 150, productGroup: 'A', discontinued: false });
  db.set('20-300', { price: 1598, productGroup: 'D', discontinued: false });
  db.set('10-200', { price: 300, productGroup: 'G', discontinued: false });
  return db;
}

function makeInput(overrides: Partial<PricingInput> = {}): PricingInput {
  return {
    tiers: {
      premiumStandalone: makeTier(),
      premiumCentralized: null,
      ecoStandalone: makeTier({
        tier: 'ECO_STANDALONE', label: 'Economical — Standalone', solutionScore: 12,
        detector: { code: '10-200', name: 'MIDI-SC-R744', qty: 4, price: 300, gas: 'CO2', range: '0-10000ppm', sensorTech: 'SC', sensorLife: '5 years', ip: 'IP54', tempMin: -40, tempMax: 50, image: null },
        totalBom: 1800,
      }),
      ecoCentralized: null,
    },
    customerGroup: 'EDC',
    discountMatrix: [
      { customerGroup: 'EDC', productGroup: 'G', discountPct: 40 },
      { customerGroup: 'EDC', productGroup: 'A', discountPct: 20 },
      { customerGroup: 'EDC', productGroup: 'D', discountPct: 30 },
    ],
    priceDb: makePriceDb(),
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────

describe('calculatePricing', () => {
  it('returns quote ref, date, and validity', () => {
    const result = calculatePricing(makeInput());
    expect(result.quoteRef).toMatch(/^SR-\d{4}-\d{8}$/);
    expect(result.quoteDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.quoteValidUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('applies discount matrix to BOM lines', () => {
    const result = calculatePricing(makeInput());
    const premium = result.tiers.premiumStandalone!;

    // Detector: 500 * 4 = 2000, 40% discount = 800 off
    const detLine = premium.bomLines.find(l => l.code === '10-100')!;
    expect(detLine.discountPct).toBe(40);
    expect(detLine.discountAmount).toBe(800);
    expect(detLine.netTotal).toBe(1200);

    // Alert: 150 * 4 = 600, 20% discount = 120 off
    const alertLine = premium.bomLines.find(l => l.code === '40-440')!;
    expect(alertLine.discountPct).toBe(20);
    expect(alertLine.discountAmount).toBe(120);
    expect(alertLine.netTotal).toBe(480);
  });

  it('calculates tier totals correctly', () => {
    const result = calculatePricing(makeInput());
    const premium = result.tiers.premiumStandalone!;

    expect(premium.summary.totalBeforeDiscount).toBe(2600); // 2000 + 600
    expect(premium.summary.totalDiscount).toBe(920);         // 800 + 120
    expect(premium.summary.totalHt).toBe(1680);              // 2600 - 920
  });

  it('enforces Group F = 0% discount', () => {
    const tierWithGroupF = makeTier({
      powerAccessories: [
        { code: '4000-0002', name: 'Power Adapter', qty: 4, price: 99, subtotal: 396 },
      ],
    });
    const priceDb = makePriceDb();
    priceDb.set('4000-0002', { price: 99, productGroup: 'F', discontinued: false });

    const input = makeInput({
      tiers: { premiumStandalone: tierWithGroupF, premiumCentralized: null, ecoStandalone: null, ecoCentralized: null },
      priceDb: priceDb,
    });
    const result = calculatePricing(input);

    const powerLine = result.tiers.premiumStandalone!.bomLines.find(l => l.code === '4000-0002')!;
    expect(powerLine.discountPct).toBe(0);
    expect(powerLine.netTotal).toBe(396); // 99 * 4, no discount on Group F
  });

  it('generates comparison table with savings', () => {
    const result = calculatePricing(makeInput());

    expect(result.comparison.rows.length).toBeGreaterThanOrEqual(4);
    expect(result.comparison.savingsVsPremium.ecoStandalone).not.toBeNull();
    // Eco should be cheaper => positive savings
    if (result.comparison.savingsVsPremium.ecoStandalone !== null) {
      expect(result.comparison.savingsVsPremium.ecoStandalone).toBeGreaterThan(0);
    }
  });

  it('recommendation is null (no recommendation badge)', () => {
    const result = calculatePricing(makeInput());
    expect(result.recommended).toBeNull();
  });

  it('warns on price mismatch between M2 and DB', () => {
    const priceDb = makePriceDb();
    priceDb.set('10-100', { price: 550, productGroup: 'G', discontinued: false }); // DB says 550, M2 says 500

    const input = makeInput({ priceDb });
    const result = calculatePricing(input);

    expect(result.warnings.some(w => w.includes('PRICE_MISMATCH'))).toBe(true);
    expect(result.tiers.premiumStandalone!.priceValidation).toBe('MISMATCH');
  });

  it('warns on discontinued products', () => {
    const priceDb = makePriceDb();
    priceDb.set('10-100', { price: 500, productGroup: 'G', discontinued: true });

    const input = makeInput({ priceDb });
    const result = calculatePricing(input);

    expect(result.warnings.some(w => w.includes('DISCONTINUED'))).toBe(true);
  });

  it('warns on missing price', () => {
    const priceDb = new Map<string, { price: number; productGroup: string; discontinued: boolean }>();
    // Empty DB — no prices
    const input = makeInput({ priceDb });
    const result = calculatePricing(input);

    expect(result.warnings.some(w => w.includes('PRICE_NOT_FOUND'))).toBe(true);
  });

  it('supports customer override discount codes', () => {
    const input = makeInput({
      discountCode: 'VIP2026',
      customerOverrides: [
        { discountCode: 'VIP2026', productGroup: 'G', ratePct: 50 },
      ],
    });
    const result = calculatePricing(input);

    const detLine = result.tiers.premiumStandalone!.bomLines.find(l => l.code === '10-100')!;
    expect(detLine.discountPct).toBe(50); // Override takes precedence
  });
});
