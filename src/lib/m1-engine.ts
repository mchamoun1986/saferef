// m1-engine.ts — BACKWARD COMPATIBILITY WRAPPER
// Delegates to the new multi-regulation engine with EN 378 as default.

import { evaluateRegulation, evaluateAllZones } from './engine/evaluate';
import { en378RuleSet } from './rules/en378';
import type { RegulationInput, RegulationResult, AllZonesResult, ZoneRegulationResult } from './engine/types';

export type { RegulationResult, AllZonesResult, ZoneRegulationResult };

export function calculateRegulation(input: RegulationInput): RegulationResult {
  return evaluateRegulation(en378RuleSet, input);
}

export function calculateRegulationOnly(input: RegulationInput): RegulationResult {
  return calculateRegulation(input);
}

export function calculateAllZones(
  inputs: (RegulationInput & { zoneId: string; zoneName: string })[],
): AllZonesResult {
  return evaluateAllZones(en378RuleSet, inputs);
}
