// engine/rule-set.ts — RuleSet interface for multi-regulation support
// Each regulation (EN 378, ASHRAE 15, ISO 5149) implements this interface.

import type { RegulationId, RegulationInput, EngineQuery, AlarmThresholds, VentilationResult, ExtraRequirement, CandidateZone, PathEvaluation } from './types';

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
  calculateThreshold(query: EngineQuery): { threshold: ThresholdResult; stage2Ppm: number | null; actions: string[] };
  getAlarmThresholds(query: EngineQuery): AlarmThresholds;
  getEmergencyVentilation(query: EngineQuery): VentilationResult;
  getExtraRequirements(input: RegulationInput): ExtraRequirement[];
  buildCandidateZones(input: RegulationInput): CandidateZone[];
}
