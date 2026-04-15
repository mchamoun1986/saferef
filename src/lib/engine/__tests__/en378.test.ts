import { describe, it, expect } from 'vitest';
import { en378RuleSet } from '../../rules/en378';
import type { RegulationInput, RefrigerantV5 } from '../types';

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

const R717: RefrigerantV5 = {
  id: 'R717', name: 'R-717 (NH3)', safetyClass: 'B2L',
  toxicityClass: 'B', flammabilityClass: '2L',
  atelOdl: 0.00022, lfl: 0.116, practicalLimit: 0.00035,
  vapourDensity: 0.59, molecularMass: 17.03,
  boilingPoint: '-33.3', gwp: '0', gasGroup: 'NH3',
};

function makeInput(ref: RefrigerantV5, overrides: Partial<RegulationInput> = {}): RegulationInput {
  return {
    refrigerant: ref, charge: 25, roomArea: 200, roomHeight: 3.5,
    accessCategory: 'b', locationClass: 'II', belowGround: false,
    isMachineryRoom: false, isOccupiedSpace: true, humanComfort: true,
    c3Applicable: true, mechanicalVentilation: false, ...overrides,
  };
}

describe('EN 378 — evaluateDetection', () => {
  it('machinery room → YES for B-group', () => {
    const r = en378RuleSet.evaluateDetection(makeInput(R717, { isMachineryRoom: true, c3Applicable: false }));
    expect(r.detectionRequired).toBe('YES');
  });
  it('R744 25kg 700m³ → RECOMMENDED', () => {
    expect(en378RuleSet.evaluateDetection(makeInput(R744)).detectionRequired).toBe('RECOMMENDED');
  });
  it('R717 > 50kg machinery → YES', () => {
    const r = en378RuleSet.evaluateDetection(makeInput(R717, { charge: 60, isMachineryRoom: true, c3Applicable: false }));
    expect(r.detectionRequired).toBe('YES');
  });
});

describe('EN 378 — getAlarmThresholds', () => {
  it('R744 alarm1 basis = 50%_ATEL_ODL', () => {
    const t = en378RuleSet.getAlarmThresholds(R744);
    expect(t.alarm1.basis).toBe('50%_ATEL_ODL');
  });
  it('R32 alarm1 basis = 25%_LFL', () => {
    const t = en378RuleSet.getAlarmThresholds(R32);
    expect(t.alarm1.basis).toBe('25%_LFL');
  });
  it('alarm1 < alarm2 <= cutoff (escalation guaranteed)', () => {
    const t = en378RuleSet.getAlarmThresholds(R32);
    expect(t.alarm1.ppm).toBeLessThan(t.alarm2.ppm);
    expect(t.alarm2.ppm).toBeLessThanOrEqual(t.cutoff.ppm);
  });
  it('NH3 > 50 kg uses two-level 500/30000', () => {
    const t = en378RuleSet.getAlarmThresholds(R717, 100);
    expect(t.alarm1.ppm).toBe(500);
    expect(t.alarm2.ppm).toBe(30000);
  });
});

describe('EN 378 — ventilation', () => {
  it('0.14 × √m', () => {
    expect(en378RuleSet.getEmergencyVentilation(100, 200, R744).flowRateM3s).toBeCloseTo(1.4, 1);
  });
});

describe('EN 378 — metadata', () => {
  it('correct id', () => { expect(en378RuleSet.id).toBe('en378'); });
});
