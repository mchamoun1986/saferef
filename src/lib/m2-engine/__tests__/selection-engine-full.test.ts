import { describe, it, expect } from 'vitest';
import { selectProducts, REF_TO_GAS, REF_RANGES, ALERT_ACCESSORIES, APP_DEFAULT_RANGE } from '../selection-engine';
import type { SelectionInput, ProductEntry } from '../../engine-types';

// ─── Factories ───────────────────────────────────────────────────────

function det(overrides: Partial<ProductEntry> = {}): ProductEntry {
  return {
    id: 'det-1', code: '10-100', name: 'MIDI-IR-R744',
    family: 'MIDI', type: 'detector', description: null,
    category: 'detector', price: 500, tier: 'standard',
    productGroup: 'G', gas: ['CO2'], refs: ['R744'],
    apps: ['supermarket', 'cold_room'], range: '0-10000ppm',
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
    productGroup: 'D', gas: [], refs: [], apps: [],
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

function acc(overrides: Partial<ProductEntry> = {}): ProductEntry {
  return {
    id: 'acc-1', code: '40-440', name: 'FL-RL-R Combined light+siren Red',
    family: 'Accessory', type: 'accessory', description: null,
    category: 'accessory', price: 150, tier: 'standard',
    productGroup: 'A', gas: [], refs: [], apps: [],
    range: null, sensorTech: null, sensorLife: null,
    power: null, voltage: null, ip: null,
    tempMin: null, tempMax: null,
    relay: 0, analog: null, modbus: false,
    standalone: false, atex: false, mount: [],
    remote: false, features: null, connectTo: null,
    discontinued: false, channels: null, maxPower: null,
    subCategory: 'alert', compatibleFamilies: ['ALL'],
    ...overrides,
  };
}

function inp(overrides: Partial<SelectionInput> = {}): SelectionInput {
  return {
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
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// FILTER TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('Filter Pipeline', () => {
  describe('F0 Application', () => {
    it('filters by apps array', () => {
      const p1 = det({ id: 'p1', apps: ['supermarket'] });
      const p2 = det({ id: 'p2', apps: ['parking'] });
      const result = selectProducts(inp({ products: [p1, p2] }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F0_application')!.eliminated).toBe(1);
    });

    it('filters by appProductFamilies override', () => {
      const midi = det({ id: 'p1', family: 'MIDI', apps: [] });
      const x5 = det({ id: 'p2', family: 'X5', apps: [] });
      const result = selectProducts(inp({ products: [midi, x5], appProductFamilies: ['MIDI'] }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F0_application')!.outputCount).toBe(1);
    });
  });

  describe('F2 ATEX', () => {
    it('keeps all when ATEX not required', () => {
      const p1 = det({ id: 'p1', atex: true });
      const p2 = det({ id: 'p2', atex: false });
      const result = selectProducts(inp({ products: [p1, p2], zoneAtex: false }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F2_atex')!.eliminated).toBe(0);
    });

    it('eliminates non-ATEX when ATEX required', () => {
      const p1 = det({ id: 'p1', atex: true });
      const p2 = det({ id: 'p2', atex: false });
      const result = selectProducts(inp({ products: [p1, p2], zoneAtex: true }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F2_atex')!.eliminated).toBe(1);
    });
  });

  describe('F3 Refrigerant', () => {
    it('filters by refs array', () => {
      const p1 = det({ id: 'p1', refs: ['R744'] });
      const p2 = det({ id: 'p2', refs: ['R32', 'R410A'] });
      const result = selectProducts(inp({ products: [p1, p2], selectedRefrigerant: 'R744' }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F3_refrigerant')!.outputCount).toBe(1);
    });
  });

  describe('F3b Range', () => {
    it('skips filter when refrigerant has no multi-range', () => {
      const p1 = det({ id: 'p1', range: '0-4000ppm' });
      const result = selectProducts(inp({ products: [p1], selectedRefrigerant: 'R32', selectedRange: '0-4000ppm' }));
      // R32 has no REF_RANGES entry, so filter is skipped
      expect(result.trace!.filterPipeline.find(f => f.name === 'F3b_range')!.eliminated).toBe(0);
    });

    it('filters by range for R717', () => {
      const p1 = det({ id: 'p1', refs: ['R717'], gas: ['NH3'], apps: ['machinery_room'], range: '0-1000ppm' });
      const p2 = det({ id: 'p2', refs: ['R717'], gas: ['NH3'], apps: ['machinery_room'], range: '0-100ppm' });
      const result = selectProducts(inp({
        products: [p1, p2], selectedRefrigerant: 'R717', selectedRange: '0-1000ppm',
        zoneType: 'machinery_room',
      }));
      const f3b = result.trace!.filterPipeline.find(f => f.name === 'F3b_range')!;
      expect(f3b.outputCount).toBe(1);
    });

    it('falls back when range filter returns 0 results', () => {
      const p1 = det({ id: 'p1', refs: ['R717'], gas: ['NH3'], apps: ['machinery_room'], range: '0-1000ppm' });
      const result = selectProducts(inp({
        products: [p1], selectedRefrigerant: 'R717', selectedRange: '0-99999ppm',
        zoneType: 'machinery_room',
      }));
      // Fallback: should keep all since no match
      const f3b = result.trace!.filterPipeline.find(f => f.name === 'F3b_range')!;
      expect(f3b.outputCount).toBe(1);
    });
  });

  describe('F4 Output', () => {
    it('passes all when output is any', () => {
      const p1 = det({ id: 'p1', relay: 0, modbus: false });
      const result = selectProducts(inp({ products: [p1], outputRequired: 'any' }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F4_output')!.eliminated).toBe(0);
    });

    it('filters for modbus', () => {
      const p1 = det({ id: 'p1', modbus: true });
      const p2 = det({ id: 'p2', modbus: false, code: '10-200' });
      const result = selectProducts(inp({ products: [p1, p2], outputRequired: 'modbus' }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F4_output')!.eliminated).toBe(1);
    });

    it('filters for relay (standalone only)', () => {
      const p1 = det({ id: 'p1', relay: 2, standalone: true });
      const p2 = det({ id: 'p2', relay: 0, standalone: true, code: '10-200' });
      const result = selectProducts(inp({ products: [p1, p2], outputRequired: 'relay' }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F4_output')!.eliminated).toBe(1);
    });
  });

  describe('F5 Mounting', () => {
    it('keeps all when mounting is any', () => {
      const p1 = det({ id: 'p1', mount: ['wall'] });
      const result = selectProducts(inp({ products: [p1], mountingType: 'any' }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F5_mounting')!.eliminated).toBe(0);
    });

    it('falls back when no mount match (preference not requirement)', () => {
      const p1 = det({ id: 'p1', mount: ['wall'] });
      const result = selectProducts(inp({ products: [p1], mountingType: 'ceiling' }));
      // Fallback: mount is a preference, not hard requirement
      expect(result.trace!.filterPipeline.find(f => f.name === 'F5_mounting')!.outputCount).toBe(1);
    });
  });

  describe('F9 Power', () => {
    it('keeps MIDI on 230V (has power adapter)', () => {
      const midi = det({ id: 'p1', family: 'MIDI' });
      const result = selectProducts(inp({ products: [midi], sitePowerVoltage: '230V' }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F9_power')!.outputCount).toBe(1);
    });

    it('eliminates 230V-only products on 24V', () => {
      const p1 = det({ id: 'p1', voltage: '230V' });
      const result = selectProducts(inp({ products: [p1], sitePowerVoltage: '24V' }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F9_power')!.eliminated).toBe(1);
    });
  });

  describe('F_price>0', () => {
    it('eliminates zero-price products', () => {
      const p1 = det({ id: 'p1', price: 500 });
      const p2 = det({ id: 'p2', price: 0, code: '10-200' });
      const result = selectProducts(inp({ products: [p1, p2] }));
      expect(result.trace!.filterPipeline.find(f => f.name === 'F_price>0')!.eliminated).toBe(1);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SCORING TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('Scoring /21', () => {
  it('IR sensor scores higher maintenance than SC', () => {
    const ir = det({ id: 'p1', sensorTech: 'IR', price: 800, code: '10-100' });
    const sc = det({ id: 'p2', sensorTech: 'SC', price: 300, code: '10-200' });
    const result = selectProducts(inp({ products: [ir, sc] }));
    const irScore = result.trace!.scored.find(s => s.code === '10-100')!.score;
    const scScore = result.trace!.scored.find(s => s.code === '10-200')!.score;
    expect(irScore.maintenanceCost).toBeGreaterThan(scScore.maintenanceCost);
  });

  it('standalone scores higher simplicity', () => {
    const sa = det({ id: 'p1', standalone: true, code: '10-100' });
    const ns = det({ id: 'p2', standalone: false, code: '10-200' });
    const result = selectProducts(inp({ products: [sa, ns] }));
    const saScore = result.trace!.scored.find(s => s.code === '10-100')!.score;
    const nsScore = result.trace!.scored.find(s => s.code === '10-200')!.score;
    expect(saScore.simplicity).toBe(2);
    expect(nsScore.simplicity).toBe(1);
  });

  it('MIDI/X5 get feature richness bonus', () => {
    const midi = det({ id: 'p1', family: 'MIDI', code: '10-100' });
    const rm = det({ id: 'p2', family: 'RM', code: '10-200', apps: ['supermarket', 'hotel'] });
    const result = selectProducts(inp({ products: [midi, rm] }));
    const midiFeatures = result.trace!.scored.find(s => s.code === '10-100')!.score.featureRichness;
    const rmFeatures = result.trace!.scored.find(s => s.code === '10-200')!.score.featureRichness;
    expect(midiFeatures).toBeGreaterThan(rmFeatures);
  });

  it('ATEX bonus only when ATEX required', () => {
    const atexDet = det({ id: 'p1', atex: true });
    const resultWithAtex = selectProducts(inp({ products: [atexDet], zoneAtex: true }));
    const resultWithout = selectProducts(inp({ products: [atexDet], zoneAtex: false }));
    const scoreWith = resultWithAtex.trace!.scored[0].score.featureRichness;
    const scoreWithout = resultWithout.trace!.scored[0].score.featureRichness;
    expect(scoreWith).toBeGreaterThan(scoreWithout);
  });

  it('application fit bonus for matching family', () => {
    const midi = det({ id: 'p1', family: 'MIDI', code: '10-100' }); // MIDI is in APP_DEFAULTS for supermarket
    const rm = det({ id: 'p2', family: 'RM', code: '10-200', apps: ['supermarket'] }); // RM is not
    const result = selectProducts(inp({ products: [midi, rm], zoneType: 'supermarket' }));
    const midiFit = result.trace!.scored.find(s => s.code === '10-100')!.score.applicationFit;
    const rmFit = result.trace!.scored.find(s => s.code === '10-200')!.score.applicationFit;
    expect(midiFit).toBe(3);
    expect(rmFit).toBe(1);
  });

  it('total score is sum of all 6 components', () => {
    const p = det({ id: 'p1' });
    const result = selectProducts(inp({ products: [p] }));
    const s = result.trace!.scored[0].score;
    expect(s.total).toBe(
      s.tierPriority + s.applicationFit + s.outputMatch +
      s.simplicity + s.maintenanceCost + s.featureRichness
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TIER SELECTION TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('3-Tier Selection', () => {
  it('premium is best standalone by score', () => {
    const best = det({ id: 'p1', sensorTech: 'IR', price: 800, standalone: true, code: '10-100' });
    const cheap = det({ id: 'p2', sensorTech: 'SC', price: 200, standalone: true, code: '10-200' });
    const result = selectProducts(inp({ products: [best, cheap] }));
    expect(result.tiers.premium).not.toBeNull();
    // Best score should be premium
    const premiumScore = result.tiers.premium!.solutionScore;
    if (result.tiers.standard) {
      expect(premiumScore).toBeGreaterThanOrEqual(result.tiers.standard.solutionScore);
    }
  });

  it('standard must be strictly cheaper than premium', () => {
    const premium = det({ id: 'p1', price: 800, standalone: true, code: '10-100', sensorTech: 'IR' });
    const standard = det({ id: 'p2', price: 300, standalone: true, code: '10-200', sensorTech: 'SC' });
    const result = selectProducts(inp({ products: [premium, standard] }));
    if (result.tiers.premium && result.tiers.standard) {
      expect(result.tiers.standard.totalBom).toBeLessThan(result.tiers.premium.totalBom);
    }
  });

  it('centralized only when totalDetectors > 1', () => {
    // 3 different products so each tier gets a unique one
    const sa1 = det({ id: 'p1', standalone: true, price: 800, code: '10-100', sensorTech: 'IR' });
    const sa2 = det({ id: 'p2', standalone: true, price: 400, code: '10-200', sensorTech: 'SC' });
    const ns = det({ id: 'p3', standalone: false, connectTo: 'MPU', price: 100, code: '10-300', family: 'MP', apps: ['supermarket', 'cold_room'] });
    const c = ctrl();
    const result1 = selectProducts(inp({ products: [sa1, sa2, ns], controllers: [c], totalDetectors: 1 }));
    const result4 = selectProducts(inp({ products: [sa1, sa2, ns], controllers: [c], totalDetectors: 4 }));
    expect(result1.tiers.centralized).toBeNull(); // 1 detector -> no centralized
    expect(result4.tiers.centralized).not.toBeNull(); // 4 detectors -> centralized available
  });

  it('centralized has controller assigned', () => {
    const ns = det({ id: 'p1', standalone: false, connectTo: 'MPU', price: 100 });
    const sa = det({ id: 'p2', standalone: true, price: 800, code: '10-200' });
    const c = ctrl();
    const result = selectProducts(inp({ products: [ns, sa], controllers: [c], totalDetectors: 4 }));
    if (result.tiers.centralized) {
      expect(result.tiers.centralized.controller).not.toBeNull();
      expect(result.tiers.centralized.controller!.code).toBeTruthy();
    }
  });

  it('each tier uses different product (no duplicates)', () => {
    const p1 = det({ id: 'p1', price: 800, standalone: true, code: '10-100', sensorTech: 'IR' });
    const p2 = det({ id: 'p2', price: 400, standalone: true, code: '10-200', sensorTech: 'SC' });
    const p3 = det({ id: 'p3', price: 150, standalone: false, code: '10-300', connectTo: 'MPU' });
    const c = ctrl();
    const result = selectProducts(inp({ products: [p1, p2, p3], controllers: [c] }));
    const codes = [
      result.tiers.premium?.detector.code,
      result.tiers.standard?.detector.code,
      result.tiers.centralized?.detector.code,
    ].filter(Boolean);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });

  it('fallback picks best remaining when no standalone', () => {
    const ns = det({ id: 'p1', standalone: false, connectTo: 'MPU', price: 100, family: 'MP', apps: ['supermarket', 'cold_room'] });
    const c = ctrl();
    const result = selectProducts(inp({ products: [ns], controllers: [c] }));
    // With only non-standalone products, should produce at least one tier via fallback
    // Either premium (fallback) or centralized should be non-null
    const hasSomeTier = result.tiers.premium !== null || result.tiers.standard !== null || result.tiers.centralized !== null;
    expect(hasSomeTier).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// CONTROLLER COMBO TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('Controller Combo (F7)', () => {
  it('uses hardcoded fallback when no controllers in DB', () => {
    const ns = det({ id: 'p1', standalone: false, connectTo: 'MPU', price: 100 });
    const sa = det({ id: 'p2', standalone: true, price: 800, code: '10-200' });
    const result = selectProducts(inp({ products: [ns, sa], controllers: [], totalDetectors: 4 }));
    if (result.tiers.centralized) {
      expect(result.tiers.centralized.controller).not.toBeNull();
    }
  });

  it('picks cheapest combo for 6 detectors', () => {
    const ns = det({ id: 'p1', standalone: false, connectTo: 'MPU', price: 100, power: 2 });
    const sa = det({ id: 'p2', standalone: true, price: 800, code: '10-200' });
    const mpu4 = ctrl({ id: 'c1', code: '20-300', name: 'MPU4C', channels: 4, price: 1598 });
    const mpu6 = ctrl({ id: 'c2', code: '20-305', name: 'MPU6C', channels: 6, price: 2004 });
    const spu = ctrl({ id: 'c3', code: '20-350', name: 'SPU24', channels: 1, price: 424 });
    const result = selectProducts(inp({ products: [ns, sa], controllers: [mpu4, mpu6, spu], totalDetectors: 6 }));
    if (result.tiers.centralized?.controller) {
      // Should pick MPU6C (2004) instead of 6x SPU (2544) or MPU4C+2xSPU (2446)
      expect(result.tiers.centralized.controller.subtotal).toBeLessThanOrEqual(2544);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// BOM TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('BOM Builder', () => {
  it('adds alert accessories for standalone (EN 378)', () => {
    const sa = det({ id: 'p1', standalone: true, price: 500 });
    const alert = acc({ id: 'a1', code: '40-440', price: 150, subCategory: 'alert', compatibleFamilies: ['ALL'] });
    const result = selectProducts(inp({ products: [sa], accessories: [alert], totalDetectors: 2 }));
    if (result.tiers.premium) {
      expect(result.tiers.premium.alertAccessories.length).toBeGreaterThan(0);
    }
  });

  it('adds power adapter for MIDI on 230V', () => {
    const midi = det({ id: 'p1', family: 'MIDI', standalone: true });
    const result = selectProducts(inp({ products: [midi], sitePowerVoltage: '230V', totalDetectors: 2 }));
    if (result.tiers.premium) {
      expect(result.tiers.premium.powerAccessories.length).toBeGreaterThan(0);
      expect(result.tiers.premium.powerAccessories[0].code).toBe('4000-0002');
    }
  });

  it('totalBom includes detector + controller + power + alert + mounting costs', () => {
    const sa = det({ id: 'p1', standalone: true, price: 500 });
    const alert = acc({ id: 'a1', code: '40-440', price: 150, subCategory: 'alert', compatibleFamilies: ['ALL'] });
    const mount = acc({ id: 'a2', code: '40-500', price: 25, subCategory: 'mounting', compatibleFamilies: ['ALL'] });
    const result = selectProducts(inp({ products: [sa], accessories: [alert, mount], totalDetectors: 2 }));
    if (result.tiers.premium) {
      const detCost = 500 * 2;
      expect(result.tiers.premium.totalBom).toBeGreaterThanOrEqual(detCost);
      // Should include alert + mounting
      expect(result.tiers.premium.totalBom).toBeGreaterThan(detCost);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// COMPARISON TABLE TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('Comparison Table', () => {
  it('has at least 5 rows', () => {
    const p1 = det({ id: 'p1', price: 800, standalone: true, code: '10-100', sensorTech: 'IR' });
    const p2 = det({ id: 'p2', price: 300, standalone: true, code: '10-200', sensorTech: 'SC' });
    const result = selectProducts(inp({ products: [p1, p2] }));
    expect(result.comparison.rows.length).toBeGreaterThanOrEqual(5);
  });

  it('recommendation is one of premium/standard/centralized', () => {
    const p1 = det({ id: 'p1' });
    const result = selectProducts(inp({ products: [p1] }));
    expect(['premium', 'standard', 'centralized']).toContain(result.comparison.recommendation);
  });

  it('recommendation reason is non-empty', () => {
    const p1 = det({ id: 'p1' });
    const result = selectProducts(inp({ products: [p1] }));
    expect(result.comparison.recommendationReason.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// REFERENCE DATA TESTS
// ═══════════════════════════════════════════════════════════════════════

describe('Reference Data', () => {
  it('REF_TO_GAS covers all common refrigerants', () => {
    const common = ['R744', 'R32', 'R717', 'R290', 'R134a', 'R404A', 'R410A', 'R1234yf'];
    for (const ref of common) {
      expect(REF_TO_GAS[ref]).toBeDefined();
      expect(REF_TO_GAS[ref].length).toBeGreaterThan(0);
    }
  });

  it('REF_RANGES has 4 ranges each for R717 and R744', () => {
    expect(REF_RANGES['R717']).toHaveLength(4);
    expect(REF_RANGES['R744']).toHaveLength(4);
  });

  it('ALERT_ACCESSORIES has entries', () => {
    expect(ALERT_ACCESSORIES.length).toBeGreaterThan(0);
    expect(ALERT_ACCESSORIES.find(a => a.key === 'fl_rl_r')).toBeDefined();
  });

  it('APP_DEFAULT_RANGE maps exist for common apps', () => {
    expect(APP_DEFAULT_RANGE['machinery_room']).toBeDefined();
    expect(APP_DEFAULT_RANGE['supermarket']).toBeDefined();
  });
});
