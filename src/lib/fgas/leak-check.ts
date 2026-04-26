import type { FGasInput, LeakCheckResult, LeakCheckFrequency, ThresholdBand, ChargeThresholds } from './types';

const EMPTY_FREQ: LeakCheckFrequency = { months: null, checksPerYear: 0 };

function freq(months: number): LeakCheckFrequency {
  return { months, checksPerYear: 12 / months };
}

function hfcResult(
  co2eqTonnes: number,
  band: ThresholdBand,
  withoutMonths: number | null,
  withMonths: number | null,
  mandatory: boolean,
  gwp: number,
): LeakCheckResult {
  return {
    co2eqTonnes,
    thresholdBand: band,
    autoDetectionMandatory: mandatory,
    hermeticExempt: false,
    naturalExempt: false,
    isHfo: false,
    without: withoutMonths ? freq(withoutMonths) : EMPTY_FREQ,
    with: withMonths ? freq(withMonths) : EMPTY_FREQ,
    chargeThresholds: {
      standard: 5000 / gwp,
      medium: 50000 / gwp,
      high: 500000 / gwp,
    },
  };
}

const HFO_THRESHOLDS: ChargeThresholds = { standard: 1, medium: 10, high: 100 };

function hfoResult(
  co2eqTonnes: number,
  chargeKg: number,
  band: ThresholdBand,
  withoutMonths: number | null,
  withMonths: number | null,
  mandatory: boolean,
): LeakCheckResult {
  return {
    co2eqTonnes,
    thresholdBand: band,
    autoDetectionMandatory: mandatory,
    hermeticExempt: false,
    naturalExempt: false,
    isHfo: true,
    without: withoutMonths ? freq(withoutMonths) : EMPTY_FREQ,
    with: withMonths ? freq(withMonths) : EMPTY_FREQ,
    chargeThresholds: HFO_THRESHOLDS,
  };
}

export function calculateLeakCheck(input: FGasInput): LeakCheckResult {
  const co2eqTonnes = input.chargeKg * input.gwp / 1000;

  // Natural refrigerant (GWP <= 3): no F-Gas obligation
  if (input.gwp <= 3) {
    return {
      co2eqTonnes,
      thresholdBand: 'none',
      autoDetectionMandatory: false,
      hermeticExempt: false,
      naturalExempt: true,
      isHfo: false,
      without: EMPTY_FREQ,
      with: EMPTY_FREQ,
      chargeThresholds: input.gwp > 0
        ? { standard: 5000 / input.gwp, medium: 50000 / input.gwp, high: 500000 / input.gwp }
        : { standard: Infinity, medium: Infinity, high: Infinity },
    };
  }

  // HFO refrigerants (GWP < 10): kg-based thresholds
  if (input.isHfo) {
    if (input.isHermetic && input.chargeKg < 2) {
      return { ...hfoResult(co2eqTonnes, input.chargeKg, 'none', null, null, false), hermeticExempt: true };
    }
    if (input.chargeKg < 1) return hfoResult(co2eqTonnes, input.chargeKg, 'none', null, null, false);
    if (input.chargeKg < 10) return hfoResult(co2eqTonnes, input.chargeKg, 'standard', 12, 24, false);
    if (input.chargeKg < 100) return hfoResult(co2eqTonnes, input.chargeKg, 'medium', 6, 12, false);
    return hfoResult(co2eqTonnes, input.chargeKg, 'high', 3, 6, true);
  }

  // HFC: CO2eq-based thresholds
  if (input.isHermetic && co2eqTonnes < 10) {
    return { ...hfcResult(co2eqTonnes, 'none', null, null, false, input.gwp), hermeticExempt: true };
  }

  if (co2eqTonnes < 5) return hfcResult(co2eqTonnes, 'none', null, null, false, input.gwp);
  if (co2eqTonnes < 50) return hfcResult(co2eqTonnes, 'standard', 12, 24, false, input.gwp);
  if (co2eqTonnes < 500) return hfcResult(co2eqTonnes, 'medium', 6, 12, false, input.gwp);
  return hfcResult(co2eqTonnes, 'high', 3, 6, true, input.gwp);
}
