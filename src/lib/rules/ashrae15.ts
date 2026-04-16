// rules/ashrae15.ts — ASHRAE 15-2022 rule profile
// Implements the RuleSet interface with ASHRAE 15-specific detection logic.

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
  kgM3ToPpm,
  ppmToKgM3,
  isFlammable,
  isToxic,
} from '../engine/core';
import { getAshrae15Exemption } from './ashrae15-exemptions';

// ── Detection Paths ─────────────────────────────────────────────────────

function evaluateDetectionAshrae15(input: RegulationInput): DetectionEvaluation {
  const ref = input.refrigerant;
  const pathEvaluations: PathEvaluation[] = [];
  const requiredActions: string[] = [];
  const assumptions: string[] = [];
  const reviewFlags: string[] = [];
  const sourceClauses: string[] = [];

  let detectionRequired: DetectionEvaluation['detectionRequired'] = 'RECOMMENDED';
  let detectionBasis = '';
  let governingRuleId = 'ASHRAE15-NONE';
  let ruleClasses: string[] = ['RECOMMENDED'];
  const extraDetector = false;

  // Path A — Machinery Room
  if (input.isMachineryRoom) {
    const isBGroup = isToxic(ref.toxicityClass);
    if (isBGroup) {
      pathEvaluations.push({
        path: 'A_MachineryRoom',
        decision: 'YES',
        ruleId: 'ASHRAE15-MR-001',
        basis: 'ASHRAE 15-2022 Section 7.4 — Detector mandatory in machinery room for B-group',
        extraDetector: false,
      });
      detectionRequired = 'YES';
      detectionBasis = 'ASHRAE 15-2022 Section 7.4 — B-group machinery room';
      governingRuleId = 'ASHRAE15-MR-001';
      ruleClasses = ['NORMATIVE'];
      sourceClauses.push('ASHRAE 15-2022 Section 7.4');
      requiredActions.push('Activate alarm at threshold', 'Start emergency ventilation');
    } else {
      // A-group machinery room: still yes if flammable or any hazard
      pathEvaluations.push({
        path: 'A_MachineryRoom',
        decision: 'YES',
        ruleId: 'ASHRAE15-MR-002',
        basis: 'ASHRAE 15-2022 Section 7.4 — Detector mandatory in machinery rooms',
        extraDetector: false,
      });
      detectionRequired = 'YES';
      detectionBasis = 'ASHRAE 15-2022 Section 7.4 — Machinery room';
      governingRuleId = 'ASHRAE15-MR-002';
      ruleClasses = ['NORMATIVE'];
      sourceClauses.push('ASHRAE 15-2022 Section 7.4');
      requiredActions.push('Activate alarm at threshold');
    }
  } else {
    pathEvaluations.push({
      path: 'A_MachineryRoom',
      decision: 'SKIP',
      ruleId: 'ASHRAE15-MR-001',
      basis: 'Not a machinery room',
      extraDetector: false,
    });
  }

  // Path B — Occupied Space (exemption-based, NOT volume-dependent)
  if (input.isOccupiedSpace && detectionRequired !== 'YES') {
    const exemption = getAshrae15Exemption(ref.id);
    if (input.charge > exemption) {
      pathEvaluations.push({
        path: 'B_OccupiedSpace',
        decision: 'YES',
        ruleId: 'ASHRAE15-OCC-001',
        basis: `ASHRAE 15-2022 Table 1 — charge ${input.charge} kg > exemption ${exemption} kg`,
        extraDetector: false,
      });
      detectionRequired = 'YES';
      detectionBasis = `ASHRAE 15-2022 Table 1 — charge ${input.charge} kg exceeds exemption ${exemption} kg`;
      governingRuleId = 'ASHRAE15-OCC-001';
      ruleClasses = ['NORMATIVE'];
      sourceClauses.push('ASHRAE 15-2022 Table 1');
      requiredActions.push('Activate alarm at threshold');
    } else {
      pathEvaluations.push({
        path: 'B_OccupiedSpace',
        decision: 'RECOMMENDED',
        ruleId: 'ASHRAE15-OCC-002',
        basis: `ASHRAE 15-2022 Table 1 — charge ${input.charge} kg <= exemption ${exemption} kg (SAMON recommends detection)`,
        extraDetector: false,
      });
      // Keep RECOMMENDED
      detectionBasis = `ASHRAE 15-2022 Table 1 — charge below exemption. SAMON recommends detection as good engineering practice.`;
      governingRuleId = 'ASHRAE15-OCC-002';
      assumptions.push('National and local regulations may mandate detection even when ASHRAE 15 does not');
    }
  } else if (!input.isOccupiedSpace && !input.isMachineryRoom) {
    pathEvaluations.push({
      path: 'B_OccupiedSpace',
      decision: 'SKIP',
      ruleId: 'ASHRAE15-OCC-001',
      basis: 'Not an occupied space',
      extraDetector: false,
    });
  }

  // Path C — NH3 specific
  if (normalizeRefId(ref.id) === 'R-717' && input.charge > 50) {
    if (detectionRequired !== 'YES') {
      detectionRequired = 'YES';
      governingRuleId = 'ASHRAE15-NH3-001';
      ruleClasses = ['NORMATIVE'];
    }
    pathEvaluations.push({
      path: 'C_Ammonia',
      decision: 'YES',
      ruleId: 'ASHRAE15-NH3-001',
      basis: 'ASHRAE 15-2022 — R-717 > 50 kg → two-level alarm',
      extraDetector: false,
    });
    sourceClauses.push('ASHRAE 15-2022 Section 7.4.3');
    requiredActions.push(
      'Pre-alarm 500 ppm: warning + start ventilation',
      'Main alarm 30,000 ppm: emergency shutdown + evacuation',
    );
  } else {
    const isNh3 = normalizeRefId(ref.id) === 'R-717';
    pathEvaluations.push({
      path: 'C_Ammonia',
      decision: 'SKIP',
      ruleId: 'ASHRAE15-NH3-001',
      basis: isNh3 ? `R-717 charge ${input.charge} kg <= 50 kg` : `Not NH3 (${ref.id})`,
      extraDetector: false,
    });
  }

  // Path D — Safety Net: charge vs practical limit (automatic)
  const volume = input.roomVolume ?? input.roomArea * input.roomHeight;
  const maxChargeKg = ref.practicalLimit * volume;
  if (input.charge > maxChargeKg && detectionRequired !== 'YES') {
    detectionRequired = 'YES';
    detectionBasis = `ASHRAE 15 — charge ${input.charge} kg > RCL × V = ${maxChargeKg.toFixed(1)} kg`;
    governingRuleId = 'ASHRAE15-PL-001';
    ruleClasses = ['NORMATIVE'];
    sourceClauses.push('ASHRAE 15-2022 Table 1');
    requiredActions.push('Activate alarm at threshold');
    pathEvaluations.push({
      path: 'D_PracticalLimit',
      decision: 'YES',
      ruleId: 'ASHRAE15-PL-001',
      basis: `charge ${input.charge} kg > RCL × V = ${maxChargeKg.toFixed(1)} kg (concentration ${(input.charge / volume).toPrecision(4)} kg/m³ > RCL ${ref.practicalLimit} kg/m³)`,
      extraDetector: false,
    });
  } else {
    pathEvaluations.push({
      path: 'D_PracticalLimit',
      decision: 'SKIP',
      ruleId: 'ASHRAE15-PL-001',
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

// ── ASHRAE 15 RuleSet Implementation ─────────────────────────────────────

export const ashrae15RuleSet: RuleSet = {
  id: 'ashrae15',
  name: 'ASHRAE 15-2022',
  version: '2022',
  region: 'US / International',

  evaluateDetection: evaluateDetectionAshrae15,

  /**
   * Threshold: same as EN 378 — min(50% ATEL, 25% LFL)
   * NH3 > 50 kg → two-level (500/30000 ppm).
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
   * ASHRAE 15-2022 §7.4 alarm thresholds:
   * Flammable (A2L/A2/A3/B2L/B2/B3 with LFL):
   *   alarm1 = 25% LFL (normative single trigger point)
   *   alarm2 = 50% LFL (SAMON recommended second level)
   *   cutoff = 100% LFL
   * Non-flammable (A1/B1):
   *   alarm1 = 25% RCL (threshold), alarm2 = 50% RCL, cutoff = 100% RCL
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

    const flammable = isFlammable(ref.flammabilityClass);

    if (flammable && ref.lfl !== null && ref.lfl !== undefined) {
      // Flammable: ASHRAE 15 §7.4 — alarm at 25% LFL
      const alarm1KgM3 = ref.lfl * 0.25;
      const alarm1Ppm = kgM3ToPpm(alarm1KgM3, ref.molecularMass);
      const alarm2KgM3 = ref.lfl * 0.50;
      const alarm2Ppm = kgM3ToPpm(alarm2KgM3, ref.molecularMass);
      const cutoffKgM3 = ref.lfl;
      const cutoffPpm = kgM3ToPpm(cutoffKgM3, ref.molecularMass);

      return {
        alarm1: { ppm: Math.floor(alarm1Ppm), kgM3: alarm1KgM3, basis: '25%_LFL' },
        alarm2: { ppm: Math.floor(alarm2Ppm), kgM3: alarm2KgM3, basis: '50%_LFL' },
        cutoff: { ppm: Math.floor(cutoffPpm), kgM3: cutoffKgM3, basis: '100%_LFL' },
        stage2Ppm: null,
      };
    }

    // Non-flammable: RCL-based (same approach as EN 378)
    const { threshold } = ashrae15RuleSet.calculateThreshold(ref, 0);
    const alarm1Ppm = threshold.ppm;
    const alarm1KgM3 = threshold.kgM3;
    const alarm2Ppm = alarm1Ppm * 2;
    const alarm2KgM3 = alarm1KgM3 * 2;
    const cutoffKgM3 = ref.practicalLimit;
    const cutoffPpm = kgM3ToPpm(cutoffKgM3, ref.molecularMass);

    return {
      alarm1: { ppm: alarm1Ppm, kgM3: alarm1KgM3, basis: '25%_RCL' },
      alarm2: { ppm: alarm2Ppm, kgM3: alarm2KgM3, basis: '50%_RCL' },
      cutoff: { ppm: Math.floor(cutoffPpm), kgM3: cutoffKgM3, basis: '100%_RCL' },
      stage2Ppm: null,
    };
  },

  /**
   * Emergency ventilation: ASHRAE 15-2022 Section 8.11.5
   * Q(cfm) = 100 × G^0.5 where G = charge in lbs
   * Converted to SI: Q(m³/s) = 100 × (chargeKg × 2.2046)^0.5 × 0.000472
   * Note: A2L refrigerants require EDVC method (Tables 8-3) — flagged for manual review
   */
  getEmergencyVentilation(
    chargeKg: number,
    _roomVolumeM3: number,
    ref: RefrigerantV5,
  ): VentilationResult {
    const chargeLbs = chargeKg * 2.2046;
    const cfm = 100 * Math.sqrt(chargeLbs);
    const flowRateM3s = cfm * 0.000472; // cfm to m³/s

    const isA2L = ref.flammabilityClass === '2L';
    const formula = isA2L
      ? `100 × √(${chargeLbs.toFixed(1)} lbs) = ${cfm.toFixed(0)} cfm → ${flowRateM3s.toFixed(3)} m³/s (A2L: EDVC method may require higher flow)`
      : `100 × √(${chargeLbs.toFixed(1)} lbs) = ${cfm.toFixed(0)} cfm → ${flowRateM3s.toFixed(3)} m³/s`;

    return {
      flowRateM3s,
      formula,
      clause: isA2L
        ? 'ASHRAE 15-2022 §8.11.5 (A1 formula — A2L requires EDVC per Tables 8-3)'
        : 'ASHRAE 15-2022 §8.11.5',
    };
  },

  /**
   * ASHRAE 15 extra requirements based on safety group and occupancy
   */
  getExtraRequirements(
    ref: RefrigerantV5,
    input: RegulationInput,
  ): ExtraRequirement[] {
    const extras: ExtraRequirement[] = [];

    // B-group: return air detector
    if (isToxic(ref.toxicityClass)) {
      extras.push({
        id: 'return_air_detector',
        description: 'Return air detector required for B-group',
        clause: 'ASHRAE 15 Section 7.4.3',
        mandatory: true,
      });
    }

    // B2/B3 + institutional occupancy
    if (
      isToxic(ref.toxicityClass) &&
      ['2', '3'].includes(ref.flammabilityClass) &&
      input.occupancyClass === 'institutional'
    ) {
      extras.push({
        id: 'redundant_detection',
        description: 'Redundant detection required for B2/B3 in institutional occupancy',
        clause: 'ASHRAE 15 Section 7.4.5',
        mandatory: true,
      });
    }

    // A2L + occupied space
    if (ref.flammabilityClass === '2L' && !isToxic(ref.toxicityClass) && input.isOccupiedSpace) {
      extras.push({
        id: 'solenoid_interlock',
        description: 'Solenoid valve interlock mandatory for A2L',
        clause: 'ASHRAE 15 Section 7.6.2',
        mandatory: true,
      });
    }

    return extras;
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
        rationale: 'ASHRAE 15 Section 7.4 — Detector near most probable leak source',
      });
      zones.push({
        zoneId: `Z${zoneIdx++}`,
        description: 'Near ventilation exhaust intake',
        leakSources: [],
        detectorPosition: 'Adjacent to ventilation exhaust',
        rationale: 'ASHRAE 15 — Detect gas near exhaust before dilution',
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
