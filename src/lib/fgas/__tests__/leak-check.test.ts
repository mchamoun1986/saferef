import { describe, it, expect } from 'vitest';
import { calculateLeakCheck } from '../leak-check';
import { co2eqToEquivalents } from '../environmental';
import type { FGasInput } from '../types';

function input(overrides: Partial<FGasInput> & Pick<FGasInput, 'gwp' | 'chargeKg'>): FGasInput {
  return { refrigerantId: 'test', isHermetic: false, isHfo: false, ...overrides };
}

describe('calculateLeakCheck', () => {
  it('R-404A 15kg → medium band, 6/12 months', () => {
    const r = calculateLeakCheck(input({ gwp: 3922, chargeKg: 15 }));
    expect(r.co2eqTonnes).toBeCloseTo(58.83, 1);
    expect(r.thresholdBand).toBe('medium');
    expect(r.without.months).toBe(6);
    expect(r.with.months).toBe(12);
    expect(r.without.checksPerYear).toBe(2);
    expect(r.with.checksPerYear).toBe(1);
    expect(r.autoDetectionMandatory).toBe(false);
  });

  it('R-404A 200kg → high band, mandatory', () => {
    const r = calculateLeakCheck(input({ gwp: 3922, chargeKg: 200 }));
    expect(r.co2eqTonnes).toBeCloseTo(784.4, 1);
    expect(r.thresholdBand).toBe('high');
    expect(r.without.months).toBe(3);
    expect(r.with.months).toBe(6);
    expect(r.autoDetectionMandatory).toBe(true);
  });

  it('R-134a 2kg → no obligation', () => {
    const r = calculateLeakCheck(input({ gwp: 1430, chargeKg: 2 }));
    expect(r.co2eqTonnes).toBeCloseTo(2.86, 1);
    expect(r.thresholdBand).toBe('none');
    expect(r.without.months).toBeNull();
  });

  it('R-134a 5kg → standard band', () => {
    const r = calculateLeakCheck(input({ gwp: 1430, chargeKg: 5 }));
    expect(r.thresholdBand).toBe('standard');
    expect(r.without.months).toBe(12);
    expect(r.with.months).toBe(24);
  });

  it('R-134a thresholds match Carel: 3.5/35/350 kg', () => {
    const r = calculateLeakCheck(input({ gwp: 1430, chargeKg: 1 }));
    expect(r.chargeThresholds.standard).toBeCloseTo(3.5, 0);
    expect(r.chargeThresholds.medium).toBeCloseTo(35, 0);
    expect(r.chargeThresholds.high).toBeCloseTo(350, 0);
  });

  it('R-404A thresholds match Carel: 1.3/13/128 kg', () => {
    const r = calculateLeakCheck(input({ gwp: 3922, chargeKg: 1 }));
    expect(r.chargeThresholds.standard).toBeCloseTo(1.3, 0);
    expect(r.chargeThresholds.medium).toBeCloseTo(12.7, 0);
    expect(r.chargeThresholds.high).toBeCloseTo(127.5, 0);
  });

  it('R-410A thresholds match Carel: 2.4/24/240 kg', () => {
    const r = calculateLeakCheck(input({ gwp: 2088, chargeKg: 1 }));
    expect(r.chargeThresholds.standard).toBeCloseTo(2.4, 0);
    expect(r.chargeThresholds.medium).toBeCloseTo(23.9, 0);
    expect(r.chargeThresholds.high).toBeCloseTo(239.5, 0);
  });

  it('R-32 thresholds match Carel: 7.4/74/741 kg', () => {
    const r = calculateLeakCheck(input({ gwp: 675, chargeKg: 1 }));
    expect(r.chargeThresholds.standard).toBeCloseTo(7.4, 0);
    expect(r.chargeThresholds.medium).toBeCloseTo(74.1, 0);
    expect(r.chargeThresholds.high).toBeCloseTo(740.7, 0);
  });

  it('R-717 (GWP 0) → naturalExempt', () => {
    const r = calculateLeakCheck(input({ gwp: 0, chargeKg: 500 }));
    expect(r.naturalExempt).toBe(true);
    expect(r.thresholdBand).toBe('none');
  });

  it('R-744 (GWP 1) → naturalExempt', () => {
    const r = calculateLeakCheck(input({ gwp: 1, chargeKg: 100 }));
    expect(r.naturalExempt).toBe(true);
  });

  it('R-290 (GWP 3) → naturalExempt', () => {
    const r = calculateLeakCheck(input({ gwp: 3, chargeKg: 1000 }));
    expect(r.naturalExempt).toBe(true);
  });

  it('R-1234yf 0.5kg → HFO no obligation', () => {
    const r = calculateLeakCheck(input({ gwp: 4, chargeKg: 0.5, isHfo: true }));
    expect(r.isHfo).toBe(true);
    expect(r.thresholdBand).toBe('none');
  });

  it('R-1234yf 5kg → HFO standard', () => {
    const r = calculateLeakCheck(input({ gwp: 4, chargeKg: 5, isHfo: true }));
    expect(r.thresholdBand).toBe('standard');
    expect(r.without.months).toBe(12);
    expect(r.with.months).toBe(24);
  });

  it('R-1234yf 50kg → HFO medium', () => {
    const r = calculateLeakCheck(input({ gwp: 4, chargeKg: 50, isHfo: true }));
    expect(r.thresholdBand).toBe('medium');
  });

  it('R-1234yf 150kg → HFO high, mandatory', () => {
    const r = calculateLeakCheck(input({ gwp: 4, chargeKg: 150, isHfo: true }));
    expect(r.thresholdBand).toBe('high');
    expect(r.autoDetectionMandatory).toBe(true);
  });

  it('Hermetic R-134a 5kg → exempt', () => {
    const r = calculateLeakCheck(input({ gwp: 1430, chargeKg: 5, isHermetic: true }));
    expect(r.hermeticExempt).toBe(true);
    expect(r.thresholdBand).toBe('none');
  });

  it('Hermetic R-404A 50kg → NOT exempt', () => {
    const r = calculateLeakCheck(input({ gwp: 3922, chargeKg: 50, isHermetic: true }));
    expect(r.hermeticExempt).toBe(false);
    expect(r.thresholdBand).toBe('medium');
  });

  it('Hermetic HFO 1kg → exempt', () => {
    const r = calculateLeakCheck(input({ gwp: 4, chargeKg: 1, isHfo: true, isHermetic: true }));
    expect(r.hermeticExempt).toBe(true);
  });

  it('Hermetic HFO 5kg → NOT exempt', () => {
    const r = calculateLeakCheck(input({ gwp: 4, chargeKg: 5, isHfo: true, isHermetic: true }));
    expect(r.hermeticExempt).toBe(false);
    expect(r.thresholdBand).toBe('standard');
  });
});

describe('co2eqToEquivalents', () => {
  it('100 tonnes → ~21.7 cars, ~57.1 flights, ~4545 trees', () => {
    const eq = co2eqToEquivalents(100);
    expect(eq.carsPerYear).toBeCloseTo(21.7, 0);
    expect(eq.flightsParisNY).toBeCloseTo(57.1, 0);
    expect(eq.treesToOffset).toBe(4545);
  });

  it('0 tonnes → all zeros', () => {
    const eq = co2eqToEquivalents(0);
    expect(eq.carsPerYear).toBe(0);
    expect(eq.flightsParisNY).toBe(0);
    expect(eq.treesToOffset).toBe(0);
  });
});
