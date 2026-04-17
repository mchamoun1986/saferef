// configurator-engine.ts — V5 ORCHESTRATOR
// Chains M1 (regulation) → M2 (selection) → M3 (pricing) into a single pipeline
// This file is the public API — other files import from here

import { calculateRegulation } from './regulation-engine';
import { selectProducts } from './selection-engine';
import { calculatePricing } from './pricing-engine';
import type {
  RegulationInput,
  RegulationResult,
  SelectionInput,
  SelectionResult,
  PricingInput,
  PricingResult,
  ProductEntry,
  FullInput,
  FullResult,
  ZoneRegulation,
} from './engine-types';

export type {
  RegulationInput,
  RegulationResult,
  SelectionInput,
  SelectionResult,
  PricingInput,
  PricingResult,
  ProductEntry,
  FullResult,
  ZoneRegulation,
};

// Re-export helpers for UI
export { REF_TO_GAS, REF_RANGES, APP_DEFAULT_RANGE, ALERT_ACCESSORIES } from './selection-engine';

/**
 * Main entry point — runs M1 per zone → sum → M2 → M3 pipeline.
 * @param regulationInputs - One RegulationInput per zone (with zoneName)
 */
export function calculate(
  regulationInputs: (RegulationInput & { zoneName: string })[],
  selectionInput: Omit<SelectionInput, 'regulationResult' | 'totalDetectors'>,
  pricingInput: Omit<PricingInput, 'tiers'>,
  /** Override total detectors from zone plan (Mode B cluster-based) */
  planDetectorOverrides?: (number | null)[],
): FullResult {
  // M1: Regulation per zone
  const zoneRegulations = regulationInputs.map((input) => ({
    zoneName: input.zoneName,
    result: calculateRegulation(input),
  }));

  // Sum detectors: use plan override if available, else M1 recommendation
  const totalDetectors = zoneRegulations.reduce(
    (sum, zr, i) => {
      const planOverride = planDetectorOverrides?.[i];
      return sum + (planOverride ?? zr.result.recommendedDetectors);
    }, 0
  );

  // Use first zone regulation for header display (threshold, placement, etc.)
  const regulation = zoneRegulations[0]?.result ?? calculateRegulation(regulationInputs[0]);

  // M2: Selection — which products, 3 tiers (uses total detectors from all zones)
  const selection = selectProducts({
    ...selectionInput,
    regulationResult: regulation,
    totalDetectors: Math.max(1, totalDetectors),
  });

  // M3: Pricing — discounts, line pricing, totals HT
  const pricing = calculatePricing({
    tiers: selection.tiers,
    customerGroup: pricingInput.customerGroup,
    discountCode: pricingInput.discountCode,
    discountMatrix: pricingInput.discountMatrix,
    customerOverrides: pricingInput.customerOverrides,
    priceDb: pricingInput.priceDb,
  });

  return { regulation, zoneRegulations, totalDetectors, selection, pricing };
}

/**
 * Run M1 only — for live preview in Step 3 (Zones).
 */
export function calculateRegulationOnly(input: RegulationInput): RegulationResult {
  return calculateRegulation(input);
}
