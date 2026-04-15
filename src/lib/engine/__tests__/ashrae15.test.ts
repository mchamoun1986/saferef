import { describe, it, expect } from 'vitest';
import { ashrae15RuleSet } from '../../rules/ashrae15';
import { evaluateRegulation } from '../evaluate';
import type { RegulationInput, RefrigerantV5 } from '../types';

// ── Test Refrigerants ─────────────────────────────────────────────────────

const R32: RefrigerantV5 = {
  id: 'R32', name: 'R-32', safetyClass: 'A2L',
  toxicityClass: 'A', flammabilityClass: '2L',
  atelOdl: 0.30, lfl: 0.306, practicalLimit: 0.061,
  vapourDensity: 2.15, molecularMass: 52.02,
  boilingPoint: '-51.7', gwp: '675', gasGroup: 'HFC2',
};

const R744: RefrigerantV5 = {
  id: 'R744', name: 'R-744 (CO2)', safetyClass: 'A1',
  toxicityClass: 'A', flammabilityClass: '1',
  atelOdl: 0.072, lfl: null, practicalLimit: 0.1,
  vapourDensity: 1.52, molecularMass: 44.01,
  boilingPoint: '-78.5', gwp: '1', gasGroup: 'CO2',
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

describe('ASHRAE 15-2022 — Key Divergences from EN 378', () => {
  it('R-32 7kg > 6.8kg exemption → YES (fixed kg, not volume-dependent)', () => {
    // In a large room (200m², 3m = 600m³), EN 378 C.3 might say NO
    // but ASHRAE 15 uses fixed 6.8 kg exemption for R-32
    const result = evaluateRegulation(ashrae15RuleSet, makeInput(R32, {
      charge: 7,
      roomArea: 200,
      roomHeight: 3,
    }));
    expect(result.detectionRequired).toBe('YES');
    expect(result.regulationId).toBe('ashrae15');
  });

  it('R-32 5kg < 6.8kg exemption → RECOMMENDED', () => {
    const result = evaluateRegulation(ashrae15RuleSet, makeInput(R32, {
      charge: 5,
      roomArea: 200,
      roomHeight: 3,
    }));
    expect(result.detectionRequired).toBe('RECOMMENDED');
  });

  it('R-744 50kg > 45kg exemption → YES', () => {
    const result = evaluateRegulation(ashrae15RuleSet, makeInput(R744, {
      charge: 50,
      roomArea: 200,
      roomHeight: 3,
    }));
    expect(result.detectionRequired).toBe('YES');
  });

  it('R-32 alarm thresholds: alarm1=25% LFL, alarm2=50% LFL per ASHRAE 15 §7.4', () => {
    const alarms = ashrae15RuleSet.getAlarmThresholds(R32);
    // alarm1 = 25% LFL = 0.25 × 0.306 = 0.0765 kg/m³
    expect(alarms.alarm1.kgM3).toBeCloseTo(0.0765, 3);
    expect(alarms.alarm1.basis).toBe('25%_LFL');
    // alarm2 = 50% LFL = 0.50 × 0.306 = 0.153 kg/m³
    expect(alarms.alarm2.kgM3).toBeCloseTo(0.153, 3);
    expect(alarms.alarm2.basis).toBe('50%_LFL');
    // cutoff = 100% LFL
    expect(alarms.cutoff.kgM3).toBeCloseTo(0.306, 3);
    expect(alarms.cutoff.basis).toBe('100%_LFL');
  });

  it('Ventilation uses ASHRAE 15 §8.11.5: Q=100×√G (cfm, G in lbs)', () => {
    // 100 kg = 220.46 lbs → Q = 100 × √220.46 = 1484.9 cfm → 0.7009 m³/s
    const vent = ashrae15RuleSet.getEmergencyVentilation(100, 200, R32);
    expect(vent.flowRateM3s).toBeCloseTo(0.701, 2);
    expect(vent.clause).toContain('ASHRAE 15-2022');
  });

  it('Ventilation same formula for NH3 (ASHRAE 15 uses same Q=100×√G for all)', () => {
    // 100 kg = 220.46 lbs → Q = 100 × √220.46 = 1484.9 cfm → 0.7009 m³/s
    const vent = ashrae15RuleSet.getEmergencyVentilation(100, 200, R717);
    expect(vent.flowRateM3s).toBeCloseTo(0.701, 2);
  });

  it('Metadata is correct', () => {
    expect(ashrae15RuleSet.id).toBe('ashrae15');
    expect(ashrae15RuleSet.name).toBe('ASHRAE 15-2022');
    expect(ashrae15RuleSet.version).toBe('2022');
    expect(ashrae15RuleSet.region).toBe('US / International');
  });

  it('B-group gets return_air_detector extra requirement', () => {
    const extras = ashrae15RuleSet.getExtraRequirements(R717, makeInput(R717));
    expect(extras.some(e => e.id === 'return_air_detector')).toBe(true);
  });

  it('A2L in occupied space gets solenoid_interlock', () => {
    const extras = ashrae15RuleSet.getExtraRequirements(R32, makeInput(R32, {
      isOccupiedSpace: true,
    }));
    expect(extras.some(e => e.id === 'solenoid_interlock')).toBe(true);
  });
});
