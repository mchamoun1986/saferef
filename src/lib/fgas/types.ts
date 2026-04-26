export type ThresholdBand = 'none' | 'standard' | 'medium' | 'high';

export interface FGasInput {
  refrigerantId: string;
  gwp: number;
  chargeKg: number;
  isHermetic: boolean;
  isHfo: boolean;
}

export interface LeakCheckFrequency {
  months: number | null;
  checksPerYear: number;
}

export interface ChargeThresholds {
  standard: number;
  medium: number;
  high: number;
}

export interface LeakCheckResult {
  co2eqTonnes: number;
  thresholdBand: ThresholdBand;
  autoDetectionMandatory: boolean;
  hermeticExempt: boolean;
  naturalExempt: boolean;
  isHfo: boolean;
  without: LeakCheckFrequency;
  with: LeakCheckFrequency;
  chargeThresholds: ChargeThresholds;
}

export interface EnvironmentalEquivalent {
  carsPerYear: number;
  flightsParisNY: number;
  treesToOffset: number;
}
