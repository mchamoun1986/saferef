import { describe, it, expect } from 'vitest';
import { iso5149RuleSet } from '../../rules/iso5149';
import { evaluateRegulation } from '../evaluate';
import type { RegulationInput, RefrigerantV5 } from '../types';

// ── Test Refrigerants ─────────────────────────────────────────────────────

const R290: RefrigerantV5 = {
  id: 'R290', name: 'R-290 (Propane)', safetyClass: 'A3',
  toxicityClass: 'A', flammabilityClass: '3',
  atelOdl: null, lfl: 0.038, practicalLimit: 0.008,
  vapourDensity: 1.83, molecularMass: 44.1,
  boilingPoint: '-42.1', gwp: '3', gasGroup: 'R290',
};

const R744: RefrigerantV5 = {
  id: 'R744', name: 'R-744 (CO2)', safetyClass: 'A1',
  toxicityClass: 'A', flammabilityClass: '1',
  atelOdl: 0.072, lfl: null, practicalLimit: 0.1,
  vapourDensity: 1.52, molecularMass: 44.01,
  boilingPoint: '-78.5', gwp: '1', gasGroup: 'CO2',
};

const R32: RefrigerantV5 = {
  id: 'R32', name: 'R-32', safetyClass: 'A2L',
  toxicityClass: 'A', flammabilityClass: '2L',
  atelOdl: 0.30, lfl: 0.306, practicalLimit: 0.061,
  vapourDensity: 2.15, molecularMass: 52.02,
  boilingPoint: '-51.7', gwp: '675', gasGroup: 'HFC2',
};

function makeInput(ref: RefrigerantV5, overrides: Partial<RegulationInput> = {}): RegulationInput {
  return {
    refrigerant: ref,
    charge: 10,
    roomArea: 50,
    roomHeight: 3,
    accessCategory: 'a',
    locationClass: 'II',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: false,
    c3Applicable: false,
    mechanicalVentilation: false,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('ISO 5149-3:2014 — Key Divergences', () => {
  it('R-290 (A3) 0.5kg → YES (always for flammable, regardless of charge)', () => {
    const result = evaluateRegulation(iso5149RuleSet, makeInput(R290, {
      charge: 0.5,
      roomArea: 200,
      roomHeight: 3,
    }));
    expect(result.detectionRequired).toBe('YES');
    expect(result.regulationId).toBe('iso5149');
  });

  it('R-744 (A1) small charge in large room → RECOMMENDED (no cat-a factor)', () => {
    // RCL × V = 0.1 × (200×3) = 60 kg. Charge 5 kg < 60 → RECOMMENDED
    const result = evaluateRegulation(iso5149RuleSet, makeInput(R744, {
      charge: 5,
      roomArea: 200,
      roomHeight: 3,
    }));
    expect(result.detectionRequired).toBe('RECOMMENDED');
  });

  it('R-744 (A1) charge exceeding RCL×V → YES', () => {
    // RCL × V = 0.1 × (10×3) = 3 kg. Charge 5 kg > 3 → YES
    const result = evaluateRegulation(iso5149RuleSet, makeInput(R744, {
      charge: 5,
      roomArea: 10,
      roomHeight: 3,
    }));
    expect(result.detectionRequired).toBe('YES');
  });

  it('Ventilation uses EN 378 formula (0.14 × √m)', () => {
    const vent = iso5149RuleSet.getEmergencyVentilation({ refrigerant: R290, charge: 100, roomVolume: 200 });
    // 0.14 × √100 = 0.14 × 10 = 1.4
    expect(vent.flowRateM3s).toBeCloseTo(1.4, 2);
    expect(vent.clause).toContain('ISO 5149');
  });

  it('Metadata is correct', () => {
    expect(iso5149RuleSet.id).toBe('iso5149');
    expect(iso5149RuleSet.name).toBe('ISO 5149-3:2014');
    expect(iso5149RuleSet.version).toBe('2014');
    expect(iso5149RuleSet.region).toBe('International');
  });

  it('A2L (R-32) always YES in occupied space', () => {
    const result = evaluateRegulation(iso5149RuleSet, makeInput(R32, {
      charge: 0.5,
      roomArea: 500,
      roomHeight: 4,
    }));
    expect(result.detectionRequired).toBe('YES');
  });

  // ── Alarm threshold invariants (C-3 regression guards) ─────────────────
  describe('getAlarmThresholds invariants', () => {
    it('cutoff >= alarm2 for flammable A3 (R-290)', () => {
      const t = iso5149RuleSet.getAlarmThresholds({ refrigerant: R290, charge: 2 });
      expect(t.cutoff.ppm).toBeGreaterThanOrEqual(t.alarm2.ppm);
      expect(t.cutoff.kgM3).toBeGreaterThanOrEqual(t.alarm2.kgM3);
    });

    it('cutoff >= alarm2 for flammable A2L (R-32)', () => {
      const t = iso5149RuleSet.getAlarmThresholds({ refrigerant: R32, charge: 5 });
      expect(t.cutoff.ppm).toBeGreaterThanOrEqual(t.alarm2.ppm);
    });

    it('cutoff >= alarm2 for non-flammable A1 (R-744)', () => {
      const t = iso5149RuleSet.getAlarmThresholds({ refrigerant: R744, charge: 15 });
      expect(t.cutoff.ppm).toBeGreaterThanOrEqual(t.alarm2.ppm);
    });

    it('alarm1 < alarm2 always (sanity)', () => {
      for (const ref of [R290, R32, R744]) {
        const t = iso5149RuleSet.getAlarmThresholds({ refrigerant: ref, charge: 5 });
        expect(t.alarm1.ppm).toBeLessThan(t.alarm2.ppm);
      }
    });
  });
});
