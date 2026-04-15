// engine/rule-set.ts — RuleSet interface for multi-regulation support
// Each regulation (EN 378, ASHRAE 15, ISO 5149) implements this interface.

import type { RegulationId, RegulationInput, RefrigerantV5, AlarmThresholds, VentilationResult, ExtraRequirement, CandidateZone, PathEvaluation } from './types';

export type DetectionDecision = 'YES' | 'NO' | 'MANUAL_REVIEW' | 'RECOMMENDED' | 'SKIP';

export interface PathResult {
  decision: DetectionDecision;
  basis: string;
  ruleId: string;
  ruleClass: string;
  sourceClauses: string[];
  extraDetector: boolean;
  reviewFlags: string[];
  assumptions: string[];
  actions: string[];
}

export interface DetectionEvaluation {
  detectionRequired: 'YES' | 'NO' | 'MANUAL_REVIEW' | 'RECOMMENDED';
  detectionBasis: string;
  governingRuleId: string;
  ruleClasses: string[];
  extraDetector: boolean;
  pathEvaluations: PathEvaluation[];
  requiredActions: string[];
  assumptions: string[];
  reviewFlags: string[];
  sourceClauses: string[];
}

export interface ThresholdResult {
  ppm: number;
  kgM3: number;
  basis: string;
}

export interface RuleSet {
  id: RegulationId;
  name: string;
  version: string;
  region: string;
  evaluateDetection(input: RegulationInput): DetectionEvaluation;
  calculateThreshold(ref: RefrigerantV5, charge: number): { threshold: ThresholdResult; stage2Ppm: number | null; actions: string[] };
  getAlarmThresholds(ref: RefrigerantV5): AlarmThresholds;
  getEmergencyVentilation(chargeKg: number, roomVolumeM3: number, ref: RefrigerantV5): VentilationResult;
  getExtraRequirements(ref: RefrigerantV5, input: RegulationInput): ExtraRequirement[];
  buildCandidateZones(input: RegulationInput): CandidateZone[];
}
