import { describe, it, expect } from 'vitest';
import { selectProducts, REF_TO_GAS, REF_RANGES } from '../selection-engine';
import type { SelectionInput, ProductEntry } from '../../engine-types';

// ─── Test helpers ────────────────────────────────────────────────────

function makeDetector(overrides: Partial<ProductEntry> = {}): ProductEntry {
  return {
    id: 'det-1', code: '10-100', name: 'MIDI-IR-R744',
    family: 'MIDI', type: 'detector', description: null,
    category: 'detector', price: 500, tier: 'standard',
    productGroup: 'G', refs: ['R744'],
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

function makeController(overrides: Partial<ProductEntry> = {}): ProductEntry {
  return {
    id: 'ctrl-1', code: '20-300', name: 'MPU4C',
    family: 'Controller', type: 'controller', description: null,
    category: 'controller', price: 1598, tier: 'standard',
    productGroup: 'D', refs: [],
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

function makeInput(overrides: Partial<SelectionInput> = {}): SelectionInput {
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

// ─── Tests ───────────────────────────────────────────────────────────

describe('selectProducts', () => {
  it('returns 3-tier result with premium, standard, centralized', () => {
    const premium = makeDetector({ id: 'p1', code: '10-100', name: 'MIDI-IR-R744', family: 'MIDI', sensorTech: 'IR', price: 800, standalone: true });
    const standard = makeDetector({ id: 'p2', code: '10-200', name: 'MIDI-SC-R744', family: 'MIDI', sensorTech: 'SC', price: 300, standalone: true });
    const nonStandalone = makeDetector({ id: 'p3', code: '10-300', name: 'MP-D-R744', family: 'MP', sensorTech: 'SC', price: 150, standalone: false, connectTo: 'MPU' });
    const ctrl = makeController();

    const input = makeInput({
      products: [premium, standard, nonStandalone],
      controllers: [ctrl],
    });

    const result = selectProducts(input);

    expect(result.tiers.premiumStandalone).not.toBeNull();
    expect(result.tiers.premiumStandalone!.tier).toBe('PREMIUM_STANDALONE');
    expect(result.tiers.premiumStandalone!.detector.code).toBeTruthy();
    expect(result.tiers.premiumStandalone!.solutionScore).toBeGreaterThan(0);
    expect(result.comparison).toBeTruthy();
    expect(result.comparison.rows.length).toBeGreaterThan(0);
  });

  it('scores products out of 21 with 6 components', () => {
    const det = makeDetector({ id: 'p1', standalone: true, sensorTech: 'IR', modbus: true });
    const input = makeInput({ products: [det], controllers: [] });

    const result = selectProducts(input);
    expect(result.tiers.premiumStandalone).not.toBeNull();
    const score = result.tiers.premiumStandalone!.solutionScore;
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(21);

    // Check trace has scored candidates with breakdown
    expect(result.trace).toBeTruthy();
    expect(result.trace!.scored.length).toBeGreaterThan(0);
    const sc = result.trace!.scored[0];
    expect(sc.score.tierPriority).toBeDefined();
    expect(sc.score.applicationFit).toBeDefined();
    expect(sc.score.outputMatch).toBeDefined();
    expect(sc.score.simplicity).toBeDefined();
    expect(sc.score.maintenanceCost).toBeDefined();
    expect(sc.score.featureRichness).toBeDefined();
    expect(sc.score.total).toBe(sc.score.tierPriority + sc.score.applicationFit + sc.score.outputMatch + sc.score.simplicity + sc.score.maintenanceCost + sc.score.featureRichness);
  });

  it('applies filter pipeline F0-F9', () => {
    const match = makeDetector({ id: 'p1', refs: ['R744'] });
    const noRef = makeDetector({ id: 'p2', refs: ['R32'] });
    const noApp = makeDetector({ id: 'p3', refs: ['R744'], family: 'RM' }); // RM not in APP_DEFAULTS for supermarket
    const discontinued = makeDetector({ id: 'p4', refs: ['R744'], discontinued: true, price: 0 });

    const input = makeInput({ products: [match, noRef, noApp, discontinued], controllers: [] });
    const result = selectProducts(input);

    expect(result.trace).toBeTruthy();
    expect(result.trace!.filterPipeline.length).toBeGreaterThanOrEqual(5);
    // Only match should survive all filters
    expect(result.trace!.afterFilters).toBe(1);
  });

  it('filters by ATEX when required', () => {
    const atexDet = makeDetector({ id: 'p1', atex: true });
    const normalDet = makeDetector({ id: 'p2', atex: false });

    const input = makeInput({ products: [atexDet, normalDet], controllers: [], zoneAtex: true });
    const result = selectProducts(input);

    // Only ATEX product should remain
    expect(result.trace!.afterFilters).toBe(1);
    expect(result.tiers.premiumStandalone?.detector.code).toBe(atexDet.code);
  });

  it('standalone tiers skip controller even for non-standalone detectors', () => {
    const det = makeDetector({ id: 'p1', standalone: false, connectTo: 'MPU', price: 100 });
    const premium = makeDetector({ id: 'p2', standalone: true, price: 800 });
    const ctrl4 = makeController({ id: 'c1', channels: 4, price: 1598 });
    const ctrl6 = makeController({ id: 'c2', code: '20-305', name: 'MPU6C', channels: 6, price: 2004 });

    const input = makeInput({
      totalDetectors: 4,
      products: [det, premium],
      controllers: [ctrl4, ctrl6],
    });

    const result = selectProducts(input);

    // Standalone tiers use skipController=true, so no controller
    if (result.tiers.ecoStandalone) {
      expect(result.tiers.ecoStandalone.controller).toBeNull();
    }
  });

  it('uses fallback when no range match', () => {
    const det = makeDetector({ id: 'p1', range: '0-10000ppm' });
    const input = makeInput({
      products: [det], controllers: [],
      selectedRange: '0-99999ppm', // non-existent range
    });

    const result = selectProducts(input);
    // Fallback: range filter should be skipped, product still selected
    expect(result.tiers.premiumStandalone).not.toBeNull();
  });

  it('returns comparison table with recommendation', () => {
    const p1 = makeDetector({ id: 'p1', price: 800, sensorTech: 'IR', standalone: true });
    const p2 = makeDetector({ id: 'p2', code: '10-200', price: 300, sensorTech: 'SC', standalone: true });

    const input = makeInput({ products: [p1, p2], controllers: [] });
    const result = selectProducts(input);

    expect(result.comparison.rows.length).toBeGreaterThanOrEqual(5);
    expect(result.comparison.recommendation === null || ['premiumStandalone', 'premiumCentralized', 'ecoStandalone', 'ecoCentralized'].includes(result.comparison.recommendation!)).toBe(true);
    // No recommendation badge for now; reason may be empty
    expect(result.comparison.recommendationReason).toBeDefined();
  });

  it('handles empty product list gracefully', () => {
    const input = makeInput({ products: [], controllers: [] });
    const result = selectProducts(input);

    expect(result.tiers.premiumStandalone).toBeNull();
    expect(result.tiers.premiumCentralized).toBeNull();
    expect(result.tiers.ecoStandalone).toBeNull();
    expect(result.tiers.ecoCentralized).toBeNull();
  });

  it('applies voltage filter correctly for 230V', () => {
    const midi = makeDetector({ id: 'p1', family: 'MIDI', voltage: '24V AC/DC' }); // MIDI passes 230V (has adapter)
    const rm = makeDetector({ id: 'p2', family: 'RM', voltage: '12-24V DC', code: '10-200', name: 'RM-R744' }); // RM blocked on 230V

    const input = makeInput({ products: [midi, rm], controllers: [], sitePowerVoltage: '230V' });
    const result = selectProducts(input);

    // Only MIDI should survive F9
    if (result.tiers.premiumStandalone) {
      expect(result.tiers.premiumStandalone.detector.code).toBe(midi.code);
    }
  });
});

describe('REF_TO_GAS', () => {
  it('maps common refrigerants to gas groups', () => {
    expect(REF_TO_GAS['R744']).toEqual(['CO2']);
    expect(REF_TO_GAS['R32']).toEqual(['HFC1']);
    expect(REF_TO_GAS['R717']).toEqual(['NH3']);
    expect(REF_TO_GAS['R290']).toEqual(['R290']);
  });
});

describe('REF_RANGES', () => {
  it('has multiple ranges for R717 and R744', () => {
    expect(REF_RANGES['R717'].length).toBe(4);
    expect(REF_RANGES['R744'].length).toBe(4);
  });
});
