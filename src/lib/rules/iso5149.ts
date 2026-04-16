// rules/iso5149.ts — ISO 5149-3:2014 rule profile
// Simplified version of EN 378. Implements the RuleSet interface.

import type { RuleSet, DetectionEvaluation, ThresholdResult } from '../engine/rule-set';
import type {
  RegulationInput,
  RefrigerantV5,
  AlarmThresholds,
  VentilationResult,
  ExtraRequirement,
  CandidateZone,
  PathEvaluation,
} from '../engine/types';
import {
  normalizeRefId,
  concentrationKgM3,
  kgM3ToPpm,
  ppmToKgM3,
  isFlammable,
  isToxic,
} from '../engine/core';

// ── Detection Paths ─────────────────────────────────────────────────────

function evaluateDetectionISO5149(input: RegulationInput): DetectionEvaluation {
  const ref = input.refrigerant;
  const pathEvaluations: PathEvaluation[] = [];
  const requiredActions: string[] = [];
  const assumptions: string[] = [];
  const reviewFlags: string[] = [];
  const sourceClauses: string[] = [];

  let detectionRequired: DetectionEvaluation['detectionRequired'] = 'RECOMMENDED';
  let detectionBasis = '';
  let governingRuleId = 'ISO5149-NONE';
  let ruleClasses: string[] = ['RECOMMENDED'];
  const extraDetector = false;

  // Path A — Machinery Room (same as EN 378)
  if (input.isMachineryRoom) {
    pathEvaluations.push({
      path: 'A_MachineryRoom',
      decision: 'YES',
      ruleId: 'ISO5149-MR-001',
      basis: 'ISO 5149-3:2014 — Detector mandatory in machinery rooms',
      extraDetector: false,
    });
    detectionRequired = 'YES';
    detectionBasis = 'ISO 5149-3:2014 — Machinery room';
    governingRuleId = 'ISO5149-MR-001';
    ruleClasses = ['NORMATIVE'];
    sourceClauses.push('ISO 5149-3:2014');
    requiredActions.push('Activate alarm at threshold', 'Start emergency ventilation');
  } else {
    pathEvaluations.push({
      path: 'A_MachineryRoom',
      decision: 'SKIP',
      ruleId: 'ISO5149-MR-001',
      basis: 'Not a machinery room',
      extraDetector: false,
    });
  }

  // Path B — Occupied Space
  if (input.isOccupiedSpace && detectionRequired !== 'YES') {
    const flammable = isFlammable(ref.flammabilityClass);
    const toxic = isToxic(ref.toxicityClass);

    if (flammable || toxic) {
      // A2/A2L/A3/B-group: ALWAYS YES regardless of charge
      pathEvaluations.push({
        path: 'B_OccupiedSpace',
        decision: 'YES',
        ruleId: 'ISO5149-OCC-001',
        basis: `ISO 5149-3:2014 — Detection always required for ${ref.safetyClass} in occupied space`,
        extraDetector: false,
      });
      detectionRequired = 'YES';
      detectionBasis = `ISO 5149-3:2014 — ${ref.safetyClass} always requires detection in occupied space`;
      governingRuleId = 'ISO5149-OCC-001';
      ruleClasses = ['NORMATIVE'];
      sourceClauses.push('ISO 5149-3:2014');
      requiredActions.push('Activate alarm at threshold');
    } else {
      // A1 only: charge > RCL × volume (NO category-a factor /2)
      const volume = input.roomVolume ?? input.roomArea * input.roomHeight;
      const rclLimit = ref.practicalLimit * volume;

      if (input.charge > rclLimit) {
        pathEvaluations.push({
          path: 'B_OccupiedSpace',
          decision: 'YES',
          ruleId: 'ISO5149-OCC-002',
          basis: `ISO 5149-3:2014 — charge ${input.charge} kg > RCL × V = ${rclLimit.toFixed(2)} kg`,
          extraDetector: false,
        });
        detectionRequired = 'YES';
        detectionBasis = `ISO 5149-3:2014 — charge exceeds RCL × volume (${rclLimit.toFixed(2)} kg)`;
        governingRuleId = 'ISO5149-OCC-002';
        ruleClasses = ['NORMATIVE'];
        sourceClauses.push('ISO 5149-3:2014');
        requiredActions.push('Activate alarm at threshold');
      } else {
        pathEvaluations.push({
          path: 'B_OccupiedSpace',
          decision: 'RECOMMENDED',
          ruleId: 'ISO5149-OCC-003',
          basis: `ISO 5149-3:2014 — charge ${input.charge} kg <= RCL × V = ${rclLimit.toFixed(2)} kg (SAMON recommends detection)`,
          extraDetector: false,
        });
        detectionBasis = 'ISO 5149-3:2014 — charge below RCL limit. SAMON recommends detection as good engineering practice.';
        governingRuleId = 'ISO5149-OCC-003';
        assumptions.push('National and local regulations may mandate detection even when ISO 5149 does not');
      }
    }
  } else if (!input.isOccupiedSpace && !input.isMachineryRoom) {
    pathEvaluations.push({
      path: 'B_OccupiedSpace',
      decision: 'SKIP',
      ruleId: 'ISO5149-OCC-001',
      basis: 'Not an occupied space',
      extraDetector: false,
    });
  }

  // Path C — Safety Net: charge vs practical limit (automatic)
  const volCheck = input.roomVolume ?? input.roomArea * input.roomHeight;
  const maxChargeKg = ref.practicalLimit * volCheck;
  if (input.charge > maxChargeKg && detectionRequired !== 'YES') {
    detectionRequired = 'YES';
    detectionBasis = `ISO 5149-3 — charge ${input.charge} kg > RCL × V = ${maxChargeKg.toFixed(1)} kg`;
    governingRuleId = 'ISO5149-PL-001';
    ruleClasses = ['NORMATIVE'];
    requiredActions.push('Activate alarm at threshold');
    pathEvaluations.push({
      path: 'C_PracticalLimit',
      decision: 'YES',
      ruleId: 'ISO5149-PL-001',
      basis: `charge ${input.charge} kg > RCL × V = ${maxChargeKg.toFixed(1)} kg`,
      extraDetector: false,
    });
  } else {
    pathEvaluations.push({
      path: 'C_PracticalLimit',
      decision: 'SKIP',
      ruleId: 'ISO5149-PL-001',
      basis: `charge ${input.charge} kg <= RCL × V = ${maxChargeKg.toFixed(1)} kg — within safe limit`,
      extraDetector: false,
    });
  }

  return {
    detectionRequired,
    detectionBasis,
    governingRuleId,
    ruleClasses: Array.from(new Set(ruleClasses)),
    extraDetector,
    pathEvaluations,
    requiredActions: Array.from(new Set(requiredActions)),
    assumptions: Array.from(new Set(assumptions)),
    reviewFlags: Array.from(new Set(reviewFlags)),
    sourceClauses: Array.from(new Set(sourceClauses)),
  };
}

// ── ISO 5149 RuleSet Implementation ──────────────────────────────────────

export const iso5149RuleSet: RuleSet = {
  id: 'iso5149',
  name: 'ISO 5149-3:2014',
  version: '2014',
  region: 'International',

  evaluateDetection: evaluateDetectionISO5149,

  /**
   * Threshold: same as EN 378 — min(50% ATEL, 25% LFL)
   * NH3 > 50 kg → two-level.
   */
  calculateThreshold(
    ref: RefrigerantV5,
    charge: number,
  ): { threshold: ThresholdResult; stage2Ppm: number | null; actions: string[] } {
    const isNh3TwoLevel = normalizeRefId(ref.id) === 'R-717' && charge > 50;

    if (isNh3TwoLevel) {
      return {
        threshold: {
          ppm: 500,
          kgM3: ppmToKgM3(500, ref.molecularMass),
          basis: 'NH3_500',
        },
        stage2Ppm: 30000,
        actions: [
          'Pre-alarm 500 ppm: warning signal + start ventilation',
          'Main alarm 30,000 ppm: emergency shutdown + evacuation',
        ],
      };
    }

    let halfAtelPpm: number | null = null;
    let lfl25PctPpm: number | null = null;

    if (ref.atelOdl !== null && ref.atelOdl !== undefined) {
      halfAtelPpm = kgM3ToPpm(ref.atelOdl, ref.molecularMass) * 0.5;
    }
    if (ref.lfl !== null && ref.lfl !== undefined) {
      lfl25PctPpm = kgM3ToPpm(ref.lfl, ref.molecularMass) * 0.25;
    }

    let thresholdPpm: number | null = null;
    let basis = '';

    if (halfAtelPpm !== null && lfl25PctPpm !== null) {
      if (halfAtelPpm <= lfl25PctPpm) {
        thresholdPpm = Math.floor(halfAtelPpm);
        basis = '50%_ATEL_ODL';
      } else {
        thresholdPpm = Math.floor(lfl25PctPpm);
        basis = '25%_LFL';
      }
    } else if (halfAtelPpm !== null) {
      thresholdPpm = Math.floor(halfAtelPpm);
      basis = '50%_ATEL_ODL';
    } else if (lfl25PctPpm !== null) {
      thresholdPpm = Math.floor(lfl25PctPpm);
      basis = '25%_LFL';
    }

    if (thresholdPpm === null) {
      return {
        threshold: { ppm: 0, kgM3: 0, basis: 'INSUFFICIENT_DATA' },
        stage2Ppm: null,
        actions: [],
      };
    }

    return {
      threshold: {
        ppm: thresholdPpm,
        kgM3: ppmToKgM3(thresholdPpm, ref.molecularMass),
        basis,
      },
      stage2Ppm: null,
      actions: [`Activate alarm at ${thresholdPpm} ppm`],
    };
  },

  /**
   * Alarm thresholds: same as EN 378 (25%/50%/100% RCL for all groups)
   */
  getAlarmThresholds(ref: RefrigerantV5, charge?: number): AlarmThresholds {
    // NH3 > 50 kg: special two-level alarm
    if (normalizeRefId(ref.id) === 'R-717' && (charge ?? 0) > 50) {
      return {
        alarm1: { ppm: 500, kgM3: ppmToKgM3(500, ref.molecularMass), basis: 'NH3_pre_alarm' },
        alarm2: { ppm: 30000, kgM3: ppmToKgM3(30000, ref.molecularMass), basis: 'NH3_main_alarm' },
        cutoff: { ppm: 30000, kgM3: ppmToKgM3(30000, ref.molecularMass), basis: 'NH3_emergency' },
        stage2Ppm: 30000,
      };
    }

    const { threshold } = iso5149RuleSet.calculateThreshold(ref, 0);

    const alarm1Ppm = threshold.ppm;
    const alarm1KgM3 = threshold.kgM3;
    const alarm2Ppm = alarm1Ppm * 2;
    const alarm2KgM3 = alarm1KgM3 * 2;
    // Cutoff = max(RCL, alarm2) — enforce alarm2 <= cutoff always.
    // For flammable A2L/A3, practicalLimit (RCL) can be << LFL-based alarm2,
    // so the raw RCL must be clamped upward to keep monitoring logic coherent.
    const rclKgM3 = ref.practicalLimit;
    const rclPpm = kgM3ToPpm(rclKgM3, ref.molecularMass);
    const cutoffPpm = Math.max(Math.floor(rclPpm), alarm2Ppm);
    const cutoffKgM3 = Math.max(rclKgM3, alarm2KgM3);
    const cutoffBasis = cutoffPpm > Math.floor(rclPpm) ? 'alarm2_floor' : 'RCL';

    let alarm2Basis: string;
    if (threshold.basis === '50%_ATEL_ODL') {
      alarm2Basis = 'RCL_ATEL_ODL';
    } else if (threshold.basis === '25%_LFL') {
      alarm2Basis = 'RCL_50%_LFL';
    } else {
      alarm2Basis = 'RCL_2x_threshold';
    }

    return {
      alarm1: { ppm: alarm1Ppm, kgM3: alarm1KgM3, basis: `RCL_${threshold.basis}` },
      alarm2: { ppm: alarm2Ppm, kgM3: alarm2KgM3, basis: alarm2Basis },
      cutoff: { ppm: cutoffPpm, kgM3: cutoffKgM3, basis: cutoffBasis },
      stage2Ppm: null,
    };
  },

  /**
   * Emergency ventilation: 0.14 × √m (same as EN 378)
   */
  getEmergencyVentilation(
    chargeKg: number,
    _roomVolumeM3: number,
    _ref: RefrigerantV5,
  ): VentilationResult {
    const flowRate = 0.14 * Math.sqrt(chargeKg);
    return {
      flowRateM3s: flowRate,
      formula: '0.14 × √m (m = charge in kg)',
      clause: 'ISO 5149-3:2014',
    };
  },

  /**
   * ISO 5149 has no extra requirements (same as EN 378).
   */
  getExtraRequirements(
    _ref: RefrigerantV5,
    _input: RegulationInput,
  ): ExtraRequirement[] {
    return [];
  },

  /**
   * Candidate zones: same logic as EN 378
   */
  buildCandidateZones(input: RegulationInput): CandidateZone[] {
    const zones: CandidateZone[] = [];
    let zoneIdx = 1;

    if (input.isMachineryRoom) {
      zones.push({
        zoneId: `Z${zoneIdx++}`,
        description: 'Near compressor/equipment group',
        leakSources: ['compressor', 'pressure vessels'],
        detectorPosition: 'Near most probable leak source',
        rationale: 'ISO 5149-3 — Detector near most probable leak source',
      });
      zones.push({
        zoneId: `Z${zoneIdx++}`,
        description: 'Near ventilation exhaust intake',
        leakSources: [],
        detectorPosition: 'Adjacent to ventilation exhaust',
        rationale: 'ISO 5149-3 — Detect gas near exhaust before dilution',
      });
    }

    if (input.belowGround) {
      zones.push({
        zoneId: `Z${zoneIdx++}`,
        description: 'Lowest accessible point',
        leakSources: ['gas accumulation zone'],
        detectorPosition: 'Lowest accessible point in the space',
        rationale: 'Below-ground space — gas accumulates at lowest point',
      });
    }

    if (input.leakSourceLocations && input.leakSourceLocations.length > 0) {
      for (const src of input.leakSourceLocations) {
        zones.push({
          zoneId: `Z${zoneIdx++}`,
          description: src.description,
          leakSources: [src.id],
          detectorPosition: `Near leak source: ${src.description}`,
          rationale: 'Position detector near probable leak source',
        });
      }
    }

    if (zones.length === 0) {
      zones.push({
        zoneId: `Z${zoneIdx++}`,
        description: 'Near probable leak source (joints, valves, connections)',
        leakSources: ['non-permanent joints', 'valve manifolds'],
        detectorPosition: 'Near most probable leak source',
        rationale: 'Position detector where refrigerant is most likely to concentrate',
      });
    }

    return zones;
  },
};
