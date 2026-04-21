import { describe, it, expect } from 'vitest';
import { selectProducts } from '../selection-engine';
import { calculatePricing } from '../pricing-engine';
import type { SelectionInput, PricingInput, ProductEntry } from '../../engine-types';

// ─── Factories ───────────────────────────────────────────────────────

function det(overrides: Partial<ProductEntry> = {}): ProductEntry {
  return {
    id: 'det-1', code: '10-100', name: 'MIDI-IR-R744',
    family: 'MIDI', type: 'detector', description: null,
    category: 'detector', price: 500, tier: 'standard',
    productGroup: 'G', gas: ['CO2'], refs: ['R744'],
    range: '0-10000ppm',
    sensorTech: 'IR', sensorLife: '15 years', power: 2,
    voltage: '24V AC/DC', ip: 'IP54', tempMin: -40, tempMax: 50,
    relay: 2, analog: 'selectable', modbus: true,
    standalone: true, atex: false, mount: ['wall'],
    remote: false, features: null, connectTo: null,
    discontinued: false, channels: null, maxPower: null,
    subCategory: null, compatibleFamilies: [],
    ...overrides,
  };
}

function ctrl(overrides: Partial<ProductEntry> = {}): ProductEntry {
  return {
    id: 'ctrl-1', code: '20-300', name: 'MPU4C',
    family: 'Controller', type: 'controller', description: null,
    category: 'controller', price: 1598, tier: 'standard',
    productGroup: 'D', gas: [], refs: [],
    range: null, sensorTech: null, sensorLife: null,
    power: null, voltage: '24V AC/DC', ip: 'IP20',
    tempMin: -10, tempMax: 55, relay: 4, analog: null,
    modbus: true, standalone: false, atex: false, mount: [],
    remote: false, features: null, connectTo: null,
    discontinued: false, channels: 4, maxPower: 10,
    subCategory: null, compatibleFamilies: [],
    ...overrides,
  };
}

function makePriceDb(entries: { code: string; price: number; group?: string }[]): Map<string, { price: number; productGroup: string; discontinued: boolean }> {
  const db = new Map<string, { price: number; productGroup: string; discontinued: boolean }>();
  for (const e of entries) {
    db.set(e.code, { price: e.price, productGroup: e.group ?? 'G', discontinued: false });
  }
  return db;
}

// ═══════════════════════════════════════════════════════════════════════
// END-TO-END INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('M2 + M3 Integration', () => {
  it('full pipeline: selection -> pricing -> quote', () => {
    const premium = det({ id: 'p1', code: '10-100', price: 800, sensorTech: 'IR', standalone: true });
    const standard = det({ id: 'p2', code: '10-200', price: 300, sensorTech: 'SC', standalone: true });
    const centralized = det({ id: 'p3', code: '10-300', price: 100, standalone: false, connectTo: 'MPU', family: 'MP' });
    const controller = ctrl();

    // M2: Selection
    const selInput: SelectionInput = {
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors: 4,
      selectedRefrigerant: 'R744',
      zoneType: 'supermarket',
      zoneAtex: false,
      outputRequired: 'any',
      sitePowerVoltage: '24V',
      mountingType: 'wall',
      projectCountry: 'SE',
      products: [premium, standard, centralized],
      controllers: [controller],
      accessories: [],
    };
    const selResult = selectProducts(selInput);

    expect(selResult.tiers.premiumStandalone).not.toBeNull();
    expect(selResult.comparison).toBeTruthy();

    // M3: Pricing
    const priceDb = makePriceDb([
      { code: '10-100', price: 800, group: 'G' },
      { code: '10-200', price: 300, group: 'G' },
      { code: '10-300', price: 100, group: 'G' },
      { code: '20-300', price: 1598, group: 'D' },
    ]);

    const pricingInput: PricingInput = {
      tiers: selResult.tiers,
      customerGroup: 'EDC',
      discountMatrix: [
        { customerGroup: 'EDC', productGroup: 'G', discountPct: 40 },
        { customerGroup: 'EDC', productGroup: 'D', discountPct: 30 },
      ],
      priceDb,
    };
    const pricingResult = calculatePricing(pricingInput);

    // Verify quote structure
    expect(pricingResult.quoteRef).toMatch(/^SR-\d{4}-\d{8}$/);
    expect(pricingResult.quoteDate).toBeTruthy();
    expect(pricingResult.quoteValidUntil).toBeTruthy();
    expect(pricingResult.recommended === null || ['premiumStandalone', 'premiumCentralized', 'ecoStandalone', 'ecoCentralized'].includes(pricingResult.recommended!)).toBe(true);

    // Verify pricing was applied
    if (pricingResult.tiers.premiumStandalone) {
      const detLine = pricingResult.tiers.premiumStandalone.bomLines.find(l => l.code === selResult.tiers.premiumStandalone!.detector.code);
      expect(detLine).toBeDefined();
      expect(detLine!.discountPct).toBe(40);
      expect(detLine!.netTotal).toBeLessThan(detLine!.listPrice * detLine!.qty);
    }

    // Verify comparison has savings
    expect(pricingResult.comparison.rows.length).toBeGreaterThan(0);
  });

  it('handles single product scenario', () => {
    const only = det({ id: 'p1', code: '10-100', price: 500, standalone: true });
    const selResult = selectProducts({
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors: 1,
      selectedRefrigerant: 'R744',
      zoneType: 'supermarket',
      zoneAtex: false,
      outputRequired: 'any',
      sitePowerVoltage: '24V',
      mountingType: 'wall',
      projectCountry: 'SE',
      products: [only],
      controllers: [],
      accessories: [],
    });

    expect(selResult.tiers.premiumStandalone).not.toBeNull();
    expect(selResult.tiers.premiumCentralized).toBeNull(); // only 1 detector
    expect(selResult.tiers.ecoStandalone).toBeNull(); // only 1 product, no cheaper alternative

    const pricingResult = calculatePricing({
      tiers: selResult.tiers,
      customerGroup: 'NO',
      discountMatrix: [],
      priceDb: makePriceDb([{ code: '10-100', price: 500 }]),
    });

    expect(pricingResult.tiers.premiumStandalone).not.toBeNull();
    expect(pricingResult.tiers.premiumStandalone!.summary.totalHt).toBe(500); // no discount for NO group
  });

  it('handles empty product catalog gracefully', () => {
    const selResult = selectProducts({
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors: 4,
      selectedRefrigerant: 'R744',
      zoneType: 'supermarket',
      zoneAtex: false,
      outputRequired: 'any',
      sitePowerVoltage: '24V',
      mountingType: 'wall',
      projectCountry: 'SE',
      products: [],
      controllers: [],
      accessories: [],
    });

    expect(selResult.tiers.premiumStandalone).toBeNull();
    expect(selResult.tiers.premiumCentralized).toBeNull();
    expect(selResult.tiers.ecoStandalone).toBeNull();

    const pricingResult = calculatePricing({
      tiers: selResult.tiers,
      customerGroup: 'EDC',
      discountMatrix: [],
      priceDb: new Map(),
    });

    expect(pricingResult.tiers.premiumStandalone).toBeNull();
    expect(pricingResult.warnings).toHaveLength(0);
  });

  it('price mismatch between M2 and DB generates warning', () => {
    const p = det({ id: 'p1', code: '10-100', price: 500, standalone: true });
    const selResult = selectProducts({
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors: 2,
      selectedRefrigerant: 'R744',
      zoneType: 'supermarket',
      zoneAtex: false,
      outputRequired: 'any',
      sitePowerVoltage: '24V',
      mountingType: 'wall',
      projectCountry: 'SE',
      products: [p],
      controllers: [],
      accessories: [],
    });

    // DB says 550, M2 says 500
    const pricingResult = calculatePricing({
      tiers: selResult.tiers,
      customerGroup: 'NO',
      discountMatrix: [],
      priceDb: makePriceDb([{ code: '10-100', price: 550 }]),
    });

    expect(pricingResult.warnings.some(w => w.includes('PRICE_MISMATCH'))).toBe(true);
    expect(pricingResult.tiers.premiumStandalone!.priceValidation).toBe('MISMATCH');
  });

  it('Group F products get 0% discount always', () => {
    const p = det({ id: 'p1', code: '10-100', price: 500, standalone: true });
    const selResult = selectProducts({
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors: 1,
      selectedRefrigerant: 'R744',
      zoneType: 'supermarket',
      zoneAtex: false,
      outputRequired: 'any',
      sitePowerVoltage: '24V',
      mountingType: 'wall',
      projectCountry: 'SE',
      products: [p],
      controllers: [],
      accessories: [],
    });

    const priceDb = new Map<string, { price: number; productGroup: string; discontinued: boolean }>();
    priceDb.set('10-100', { price: 500, productGroup: 'F', discontinued: false });

    const pricingResult = calculatePricing({
      tiers: selResult.tiers,
      customerGroup: 'EDC',
      discountMatrix: [{ customerGroup: 'EDC', productGroup: 'F', discountPct: 40 }],
      priceDb,
    });

    const line = pricingResult.tiers.premiumStandalone!.bomLines.find(l => l.code === '10-100')!;
    expect(line.discountPct).toBe(0); // Group F always 0%
    expect(line.netTotal).toBe(500);
  });

  it('customer override takes precedence over matrix', () => {
    const p = det({ id: 'p1', code: '10-100', price: 500, standalone: true });
    const selResult = selectProducts({
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors: 1,
      selectedRefrigerant: 'R744',
      zoneType: 'supermarket',
      zoneAtex: false,
      outputRequired: 'any',
      sitePowerVoltage: '24V',
      mountingType: 'wall',
      projectCountry: 'SE',
      products: [p],
      controllers: [],
      accessories: [],
    });

    const pricingResult = calculatePricing({
      tiers: selResult.tiers,
      customerGroup: 'EDC',
      discountCode: 'VIP2026',
      discountMatrix: [{ customerGroup: 'EDC', productGroup: 'G', discountPct: 40 }],
      customerOverrides: [{ discountCode: 'VIP2026', productGroup: 'G', ratePct: 55 }],
      priceDb: makePriceDb([{ code: '10-100', price: 500, group: 'G' }]),
    });

    const line = pricingResult.tiers.premiumStandalone!.bomLines.find(l => l.code === '10-100')!;
    expect(line.discountPct).toBe(55); // Override, not 40% from matrix
  });

  it('savings calculation is correct', () => {
    const premium = det({ id: 'p1', code: '10-100', price: 1000, sensorTech: 'IR', standalone: true });
    const standard = det({ id: 'p2', code: '10-200', price: 500, sensorTech: 'SC', standalone: true });
    const selResult = selectProducts({
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors: 1,
      selectedRefrigerant: 'R744',
      zoneType: 'supermarket',
      zoneAtex: false,
      outputRequired: 'any',
      sitePowerVoltage: '24V',
      mountingType: 'wall',
      projectCountry: 'SE',
      products: [premium, standard],
      controllers: [],
      accessories: [],
    });

    const pricingResult = calculatePricing({
      tiers: selResult.tiers,
      customerGroup: 'NO',
      discountMatrix: [],
      priceDb: makePriceDb([
        { code: '10-100', price: 1000 },
        { code: '10-200', price: 500 },
      ]),
    });

    if (pricingResult.comparison.savingsVsPremium.ecoStandalone !== null) {
      expect(pricingResult.comparison.savingsVsPremium.ecoStandalone).toBe(50); // 50% savings
    }
  });

  it('230V site adds power adapter to MIDI and total includes it', () => {
    const midi = det({ id: 'p1', code: '10-100', family: 'MIDI', price: 500, standalone: true });
    const selResult = selectProducts({
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors: 3,
      selectedRefrigerant: 'R744',
      zoneType: 'supermarket',
      zoneAtex: false,
      outputRequired: 'any',
      sitePowerVoltage: '230V',
      mountingType: 'wall',
      projectCountry: 'SE',
      products: [midi],
      controllers: [],
      accessories: [],
    });

    expect(selResult.tiers.premiumStandalone).not.toBeNull();
    expect(selResult.tiers.premiumStandalone!.powerAccessories.length).toBeGreaterThan(0);
    // Total should include detector cost + power adapter cost
    const detCost = 500 * 3;
    const adapterCost = 99 * 3;
    expect(selResult.tiers.premiumStandalone!.totalBom).toBeGreaterThanOrEqual(detCost + adapterCost);
  });

  it('rounding is correct (EUR cents)', () => {
    const p = det({ id: 'p1', code: '10-100', price: 333, standalone: true });
    const selResult = selectProducts({
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors: 3,
      selectedRefrigerant: 'R744',
      zoneType: 'supermarket',
      zoneAtex: false,
      outputRequired: 'any',
      sitePowerVoltage: '24V',
      mountingType: 'wall',
      projectCountry: 'SE',
      products: [p],
      controllers: [],
      accessories: [],
    });

    const pricingResult = calculatePricing({
      tiers: selResult.tiers,
      customerGroup: 'EDC',
      discountMatrix: [{ customerGroup: 'EDC', productGroup: 'G', discountPct: 33 }],
      priceDb: makePriceDb([{ code: '10-100', price: 333 }]),
    });

    const line = pricingResult.tiers.premiumStandalone!.bomLines[0];
    // 333 * 3 = 999, 33% of 999 = 329.67, net = 669.33
    expect(line.netTotal).toBe(669.33);
    expect(pricingResult.tiers.premiumStandalone!.summary.totalHt).toBe(669.33);
  });
});
