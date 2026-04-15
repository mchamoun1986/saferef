// engine/evaluate.ts — Orchestrator: runs any RuleSet and assembles RegulationResult
// This is the single entry point for all regulation evaluations.

import type { RuleSet } from './rule-set';
import type {
  RegulationInput,
  RegulationResult,
  AllZonesResult,
  ZoneRegulationResult,
} from './types';
import {
  placementByDensity,
  areaBasedQuantity,
  computeSourceClusters,
  determineGoverningHazard,
  concentrationKgM3,
  kgM3ToPpm,
  AIR_DENSITY_25C,
  calcM1M2M3,
  isFlammable,
  normalizeRefId,
} from './core';
import type { RegulationTrace } from './types';
import { getC3Entry } from '../rules/en378';

// ── Validation Error Helper ──────────────────────────────────────────────

function validationError(
  ruleSet: RuleSet,
  message: string,
): RegulationResult {
  return {
    regulationId: ruleSet.id,
    regulationName: ruleSet.name,
    detectionRequired: 'NO',
    detectionBasis: `Validation error: ${message}`,
    governingHazard: 'NONE',
    governingRuleId: 'VALIDATION',
    minDetectors: 0,
    recommendedDetectors: 0,
    quantityMode: 'area',
    clusterCount: 0,
    placementHeight: 'floor',
    placementHeightM: 'N/A',
    candidateZones: [],
    thresholdPpm: 0,
    thresholdKgM3: 0,
    thresholdBasis: 'N/A',
    stage2ThresholdPpm: null,
    alarmThresholds: {
      alarm1: { ppm: 0, kgM3: 0, basis: 'N/A' },
      alarm2: { ppm: 0, kgM3: 0, basis: 'N/A' },
      cutoff: { ppm: 0, kgM3: 0, basis: 'N/A' },
      stage2Ppm: null,
    },
    ventilation: null,
    extraRequirements: [],
    requiredActions: [],
    assumptions: [],
    missingInputs: [message],
    reviewFlags: [],
    sourceClauses: [],
    ruleClasses: [],
  };
}

// ── Main Orchestrator ────────────────────────────────────────────────────

export function evaluateRegulation(
  ruleSet: RuleSet,
  input: RegulationInput,
): RegulationResult {
  // 1. Input validation
  if (input.charge <= 0) {
    return validationError(ruleSet, 'Charge must be > 0 kg');
  }
  if (input.roomArea <= 0) {
    return validationError(ruleSet, 'Room area must be > 0 m²');
  }
  if (input.roomHeight < 0.5) {
    return validationError(ruleSet, 'Room height must be >= 0.5 m');
  }

  const ref = input.refrigerant;
  const volume = input.roomVolume ?? input.roomArea * input.roomHeight;
  const effectiveInput: RegulationInput = { ...input, roomVolume: volume };

  // 2. Detection decision
  const detection = ruleSet.evaluateDetection(effectiveInput);

  // 3. Threshold
  const { threshold, stage2Ppm, actions: thresholdActions } =
    ruleSet.calculateThreshold(ref, input.charge);

  // 4. Alarm thresholds
  const alarmThresholds = ruleSet.getAlarmThresholds(ref);
  alarmThresholds.stage2Ppm = stage2Ppm;

  // 5. Placement
  const placement = placementByDensity(ref.vapourDensity, input.roomHeight);

  // 6. Detector quantity
  const areaBased = areaBasedQuantity(input.roomArea);
  const clusters = computeSourceClusters(
    input.leakSourceLocations ?? [],
    input.roomLength ?? 0,
    input.roomWidth ?? 0,
  );
  const useCluster = clusters > 0;
  const baseCount = useCluster ? clusters : areaBased;
  const extraDetector = detection.extraDetector ? 1 : 0;

  // 7. Ventilation — only applicable to machinery rooms (EN 378-3 Cl.6.4.4, ASHRAE 15 §8.11.5)
  const ventilation = input.isMachineryRoom
    ? ruleSet.getEmergencyVentilation(input.charge, volume, ref)
    : null;

  // 8. Extra requirements
  const extraRequirements = ruleSet.getExtraRequirements(ref, effectiveInput);

  // 9. Candidate zones
  const candidateZones = ruleSet.buildCandidateZones(effectiveInput);

  // 10. Governing hazard
  const governingHazard = determineGoverningHazard(
    ref.toxicityClass,
    ref.flammabilityClass,
  );

  // Build full calculation trace for audit
  const concKgM3 = concentrationKgM3(input.charge, volume);
  const halfAtelPpm = (ref.atelOdl != null) ? kgM3ToPpm(ref.atelOdl, ref.molecularMass) * 0.5 : null;
  const lfl25PctPpm = (ref.lfl != null) ? kgM3ToPpm(ref.lfl, ref.molecularMass) * 0.25 : null;

  // Charge comparison — the key decision values
  const plKgM3 = ref.practicalLimit;
  const plChargeKg = plKgM3 * volume;
  const c3Data = getC3Entry(ref.id);
  const flam = isFlammable(ref.flammabilityClass);
  const mFactors = (flam && ref.lfl != null) ? calcM1M2M3(ref.lfl, volume) : null;

  const chargeComparison: RegulationTrace['chargeComparison'] = {
    chargeKg: input.charge,
    volumeM3: volume,
    concentrationKgM3: concKgM3,
    practicalLimitKgM3: plKgM3,
    practicalLimitChargeKg: plChargeKg,
    ...(c3Data ? {
      c3: {
        rclKgM3: c3Data.rcl,
        qlmvKgM3: c3Data.qlmv,
        qlavKgM3: c3Data.qlav,
        rclChargeKg: c3Data.rcl * volume,
        qlmvChargeKg: c3Data.qlmv * volume,
        qlavChargeKg: c3Data.qlav * volume,
        concVsRcl: concKgM3 <= c3Data.rcl ? 'below' : 'above',
        concVsQlmv: concKgM3 <= c3Data.qlmv ? 'below' : 'above',
        concVsQlav: concKgM3 <= c3Data.qlav ? 'below' : 'above',
      },
    } : {}),
    ...(mFactors ? {
      m1Kg: mFactors.m1,
      m2Kg: mFactors.m2,
      m3Kg: mFactors.m3,
    } : {}),
  };

  const trace: RegulationTrace = {
    pathEvaluations: detection.pathEvaluations,
    volumeCalculated: volume,
    concentrationKgM3: concKgM3,
    chargeComparison,
    thresholdCalc: {
      halfAtelPpm,
      lfl25PctPpm,
      chosen: threshold.basis,
      finalPpm: threshold.ppm,
    },
    placementCalc: {
      vapourDensity: ref.vapourDensity,
      airDensity: AIR_DENSITY_25C,
      ratio: ref.vapourDensity >= 1.0 ? 'heavier' : 'lighter',
      result: placement.heightM,
    },
    quantityCalc: {
      areaBased,
      leakSourceBased: clusters,
      extraDetector: detection.extraDetector,
      min: detection.detectionRequired === 'YES' ? Math.max(1, (useCluster ? clusters : areaBased) + extraDetector) : 0,
      recommended: detection.detectionRequired === 'YES' ? Math.max(1, areaBased + extraDetector) : Math.max(1, Math.ceil(input.roomArea / 50)),
      mode: useCluster ? 'cluster' : 'area',
      clusters,
    },
  };

  // Assemble result based on detection decision
  if (detection.detectionRequired === 'RECOMMENDED') {
    // SAMON policy recommendation — no normative requirement
    const recommendedDetectors = Math.max(1, Math.ceil(input.roomArea / 50));
    return {
      regulationId: ruleSet.id,
      regulationName: ruleSet.name,
      detectionRequired: 'RECOMMENDED',
      detectionBasis: detection.detectionBasis,
      governingHazard,
      governingRuleId: detection.governingRuleId,
      minDetectors: 0,
      recommendedDetectors,
      quantityMode: useCluster ? 'cluster' : 'area',
      clusterCount: clusters,
      placementHeight: placement.height,
      placementHeightM: placement.heightM,
      candidateZones,
      thresholdPpm: threshold.ppm,
      thresholdKgM3: threshold.kgM3,
      thresholdBasis: threshold.basis,
      stage2ThresholdPpm: stage2Ppm,
      alarmThresholds,
      ventilation: null,
      extraRequirements: [],
      requiredActions: [...detection.requiredActions, ...thresholdActions],
      assumptions: detection.assumptions,
      missingInputs: [],
      reviewFlags: detection.reviewFlags,
      sourceClauses: detection.sourceClauses,
      ruleClasses: detection.ruleClasses,
      trace,
    };
  }

  // YES, NO, or MANUAL_REVIEW
  const minDetectors =
    detection.detectionRequired === 'YES' ? Math.max(1, baseCount + extraDetector) : 0;
  const recommendedDetectors =
    detection.detectionRequired === 'YES'
      ? Math.max(minDetectors, areaBased + extraDetector)
      : 0;

  return {
    regulationId: ruleSet.id,
    regulationName: ruleSet.name,
    detectionRequired: detection.detectionRequired,
    detectionBasis: detection.detectionBasis,
    governingHazard,
    governingRuleId: detection.governingRuleId,
    minDetectors,
    recommendedDetectors,
    quantityMode: useCluster ? 'cluster' : 'area',
    clusterCount: clusters,
    placementHeight: placement.height,
    placementHeightM: placement.heightM,
    candidateZones,
    thresholdPpm: threshold.ppm,
    thresholdKgM3: threshold.kgM3,
    thresholdBasis: threshold.basis,
    stage2ThresholdPpm: stage2Ppm,
    alarmThresholds,
    ventilation: detection.detectionRequired === 'YES' ? ventilation : null,
    extraRequirements: detection.detectionRequired === 'YES' ? extraRequirements : [],
    requiredActions: Array.from(
      new Set([...detection.requiredActions, ...thresholdActions]),
    ),
    assumptions: detection.assumptions,
    missingInputs: [],
    reviewFlags: detection.reviewFlags,
    sourceClauses: detection.sourceClauses,
    ruleClasses: detection.ruleClasses,
    trace,
  };
}

// ── Multi-Zone Orchestrator ──────────────────────────────────────────────

export function evaluateAllZones(
  ruleSet: RuleSet,
  inputs: (RegulationInput & { zoneId: string; zoneName: string })[],
): AllZonesResult {
  const zoneResults: ZoneRegulationResult[] = inputs.map((input) => ({
    zoneId: input.zoneId,
    zoneName: input.zoneName,
    result: evaluateRegulation(ruleSet, input),
  }));

  const totalRecommendedDetectors = zoneResults.reduce(
    (sum, z) => sum + z.result.recommendedDetectors,
    0,
  );
  const totalMinDetectors = zoneResults.reduce(
    (sum, z) => sum + z.result.minDetectors,
    0,
  );
  const anyDetectionRequired = zoneResults.some(
    (z) => z.result.detectionRequired === 'YES',
  );

  return {
    regulationId: ruleSet.id,
    regulationName: ruleSet.name,
    zoneResults,
    totalRecommendedDetectors,
    totalMinDetectors,
    anyDetectionRequired,
  };
}
