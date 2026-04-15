// rules/en378.ts — EN 378-3:2016 rule profile
// Implements the RuleSet interface with all EN 378-specific detection logic.

import type { RuleSet, PathResult, DetectionEvaluation, ThresholdResult } from '../engine/rule-set';
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
  calcM1M2M3,
  isFlammable,
} from '../engine/core';

// ── Table C.3 — QLMV / QLAV / RCL (EN 378-1:2016) ───────────────────
interface C3Entry {
  rcl: number;   // kg/m³
  qlmv: number;  // kg/m³
  qlav: number;  // kg/m³
}

const TABLE_C3: Record<string, C3Entry> = {
  // Legacy HCFCs
  'R-22':        { rcl: 0.21,  qlmv: 0.28,  qlav: 0.50 },
  // HFCs
  'R-134a':      { rcl: 0.21,  qlmv: 0.28,  qlav: 0.58 },
  'R-404A':      { rcl: 0.29,  qlmv: 0.32,  qlav: 0.48 },
  'R-407A':      { rcl: 0.28,  qlmv: 0.31,  qlav: 0.47 },
  'R-407C':      { rcl: 0.27,  qlmv: 0.44,  qlav: 0.49 },
  'R-407F':      { rcl: 0.29,  qlmv: 0.32,  qlav: 0.48 },
  'R-410A':      { rcl: 0.39,  qlmv: 0.44,  qlav: 0.42 },
  'R-448A':      { rcl: 0.29,  qlmv: 0.33,  qlav: 0.46 },
  'R-449A':      { rcl: 0.29,  qlmv: 0.33,  qlav: 0.46 },
  'R-450A':      { rcl: 0.42,  qlmv: 0.46,  qlav: 0.56 },
  'R-452A':      { rcl: 0.28,  qlmv: 0.31,  qlav: 0.47 },
  'R-452B':      { rcl: 0.33,  qlmv: 0.37,  qlav: 0.50 },
  'R-454A':      { rcl: 0.26,  qlmv: 0.29,  qlav: 0.44 },
  'R-454B':      { rcl: 0.31,  qlmv: 0.35,  qlav: 0.48 },
  'R-454C':      { rcl: 0.31,  qlmv: 0.35,  qlav: 0.48 },
  'R-455A':      { rcl: 0.32,  qlmv: 0.36,  qlav: 0.49 },
  'R-507A':      { rcl: 0.29,  qlmv: 0.32,  qlav: 0.48 },
  'R-513A':      { rcl: 0.42,  qlmv: 0.46,  qlav: 0.56 },
  // Natural refrigerants
  'R-717':       { rcl: 0.22, qlmv: 0.35, qlav: 0.50 },
  'R-744':       { rcl: 0.072, qlmv: 0.074, qlav: 0.18 },
  'R-290':       { rcl: 0.008, qlmv: 0.038, qlav: 0.058 },
  'R-600a':      { rcl: 0.011, qlmv: 0.046, qlav: 0.069 },
  'R-1270':      { rcl: 0.008, qlmv: 0.038, qlav: 0.058 },
  // A2L / HFOs
  'R-32':        { rcl: 0.061, qlmv: 0.063, qlav: 0.15 },
  'R-1234yf':    { rcl: 0.058, qlmv: 0.060, qlav: 0.14 },
  'R-1234ze(E)': { rcl: 0.061, qlmv: 0.063, qlav: 0.15 },
  'R-1233zd':    { rcl: 0.36,  qlmv: 0.40,  qlav: 0.52 },
  'R-464A':      { rcl: 0.27,  qlmv: 0.30,  qlav: 0.45 },
  'R-465A':      { rcl: 0.25,  qlmv: 0.28,  qlav: 0.42 },
  'R-466A':      { rcl: 0.32,  qlmv: 0.36,  qlav: 0.49 },
  'R-468A':      { rcl: 0.27,  qlmv: 0.30,  qlav: 0.45 },
};

// ── Path helpers ────────────────────────────────────────────────────────

function skipPath(ruleId: string): PathResult {
  return {
    decision: 'SKIP',
    basis: '',
    ruleId,
    ruleClass: 'NORMATIVE',
    sourceClauses: [],
    extraDetector: false,
    reviewFlags: [],
    assumptions: [],
    actions: [],
  };
}

// ── Detection Paths ─────────────────────────────────────────────────────

/**
 * Path A — Machinery Room (EN 378-3:2016, Clause 9.1)
 * DET-MR-001: machinery room → YES
 * DET-MR-002: MR + underground + flammable + charge > m2 → +1 detector
 */
function pathA_MachineryRoom(input: RegulationInput): PathResult {
  if (!input.isMachineryRoom) {
    return skipPath('DET-MR-001');
  }

  const result: PathResult = {
    decision: 'YES',
    basis: 'EN 378-3:2016, Clause 9.1 — Detectors mandatory in machinery rooms',
    ruleId: 'DET-MR-001',
    ruleClass: 'NORMATIVE',
    sourceClauses: ['EN 378-3:2016 Clause 9.1'],
    extraDetector: false,
    reviewFlags: [],
    assumptions: [],
    actions: ['Activate alarm at threshold', 'Start emergency ventilation'],
  };

  // DET-MR-002: MR + below ground + flammable + charge > m2
  const ref = input.refrigerant;
  if (
    input.belowGround &&
    isFlammable(ref.flammabilityClass) &&
    ref.lfl !== null
  ) {
    const volume = input.roomVolume ?? input.roomArea * input.roomHeight;
    const { m2 } = calcM1M2M3(ref.lfl, volume);
    if (input.charge > m2) {
      result.extraDetector = true;
      result.ruleId = 'DET-MR-002';
      result.sourceClauses.push('EN 378-3:2016 Clause 4.3');
      result.basis +=
        ' | EN 378-3:2016, Clause 4.3 — MR + underground + flammable > m2 → extra detector';
    }
  }

  return result;
}

/**
 * Path B — C.3 Occupied Space (EN 378-1:2016, Annex C.3)
 * DET-C3-001 through DET-C3-009
 */
function pathB_C3OccupiedSpace(input: RegulationInput): PathResult {
  if (!input.c3Applicable) {
    return skipPath('DET-C3-001');
  }

  const refId = normalizeRefId(input.refrigerant.id);
  const c3 = TABLE_C3[refId] ?? null;

  if (!c3) {
    return {
      decision: 'MANUAL_REVIEW',
      basis: `C.3 applicable but no QLMV/QLAV/RCL data for ${refId}`,
      ruleId: 'DET-C3-001',
      ruleClass: 'NORMATIVE',
      sourceClauses: ['EN 378-1:2016 Table C.3'],
      extraDetector: false,
      reviewFlags: [`MR-002: QLMV/QLAV/RCL not available for ${refId}`],
      assumptions: [],
      actions: [],
    };
  }

  const volume = input.roomVolume ?? input.roomArea * input.roomHeight;
  const conc = concentrationKgM3(input.charge, volume);
  const reviewFlags: string[] = [];

  // MR-003: concentration within 5% of QLMV boundary
  if (Math.abs(conc - c3.qlmv) / c3.qlmv < 0.05) {
    reviewFlags.push('MR-003: Concentration within 5% of QLMV boundary');
  }

  if (input.belowGround) {
    // Underground C.3.2.3
    if (conc <= c3.rcl) {
      return {
        decision: 'NO',
        basis: `C.3.2.3: concentration ${conc.toPrecision(4)} kg/m³ <= RCL ${c3.rcl} kg/m³`,
        ruleId: 'DET-C3-006',
        ruleClass: 'NORMATIVE',
        sourceClauses: ['EN 378-1:2016 C.3.2.3'],
        extraDetector: false,
        reviewFlags,
        assumptions: ['Simple rectangular room geometry'],
        actions: [],
      };
    } else if (conc <= c3.qlmv) {
      return {
        decision: 'YES',
        basis: `C.3.2.3: RCL < concentration ${conc.toPrecision(4)} <= QLMV ${c3.qlmv} → at least 1 measure required`,
        ruleId: 'DET-C3-007',
        ruleClass: 'NORMATIVE',
        sourceClauses: ['EN 378-1:2016 C.3.2.3'],
        extraDetector: false,
        reviewFlags,
        assumptions: ['Detection chosen as protective measure'],
        actions: ['Activate alarm at threshold'],
      };
    } else {
      return {
        decision: 'YES',
        basis: `C.3.2.3: concentration ${conc.toPrecision(4)} > QLMV ${c3.qlmv} → at least 2 measures required (must not exceed QLAV)`,
        ruleId: 'DET-C3-008',
        ruleClass: 'NORMATIVE',
        sourceClauses: ['EN 378-1:2016 C.3.2.3'],
        extraDetector: false,
        reviewFlags,
        assumptions: ['Detection chosen as one of two protective measures'],
        actions: ['Activate alarm at threshold'],
      };
    }
  } else {
    // Above-ground C.3.2.2
    if (conc <= c3.qlmv) {
      return {
        decision: 'NO',
        basis: `C.3.2.2: concentration ${conc.toPrecision(4)} kg/m³ <= QLMV ${c3.qlmv} kg/m³ → no measures required`,
        ruleId: 'DET-C3-003',
        ruleClass: 'NORMATIVE',
        sourceClauses: ['EN 378-1:2016 C.3.2.2'],
        extraDetector: false,
        reviewFlags,
        assumptions: ['Simple rectangular room geometry'],
        actions: [],
      };
    } else if (conc <= c3.qlav) {
      return {
        decision: 'YES',
        basis: `C.3.2.2: QLMV < concentration ${conc.toPrecision(4)} <= QLAV ${c3.qlav} → at least 1 protective measure`,
        ruleId: 'DET-C3-004',
        ruleClass: 'NORMATIVE',
        sourceClauses: ['EN 378-1:2016 C.3.2.2'],
        extraDetector: false,
        reviewFlags,
        assumptions: ['Detection chosen as protective measure'],
        actions: ['Activate alarm at threshold'],
      };
    } else {
      return {
        decision: 'YES',
        basis: `C.3.2.2: concentration ${conc.toPrecision(4)} > QLAV ${c3.qlav} → at least 2 protective measures required`,
        ruleId: 'DET-C3-005',
        ruleClass: 'NORMATIVE',
        sourceClauses: ['EN 378-1:2016 C.3.2.2'],
        extraDetector: false,
        reviewFlags,
        assumptions: ['Detection chosen as one of two protective measures'],
        actions: ['Activate alarm at threshold'],
      };
    }
  }
}

/**
 * Path C — Below-Ground Flammable Systems (EN 378-3:2016, Clause 4.3)
 * DET-BG-001: below_ground + flammable + charge > m2 → YES + extra detector
 */
function pathC_BelowGroundFlammable(input: RegulationInput): PathResult {
  const ref = input.refrigerant;

  if (
    input.belowGround &&
    isFlammable(ref.flammabilityClass) &&
    ref.lfl !== null
  ) {
    const volume = input.roomVolume ?? input.roomArea * input.roomHeight;
    const { m2 } = calcM1M2M3(ref.lfl, volume);
    if (input.charge > m2) {
      return {
        decision: 'YES',
        basis: `EN 378-3:2016, Clause 4.3 — Underground + flammable (${ref.flammabilityClass}) + charge ${input.charge} kg > m2 ${m2.toFixed(3)} kg`,
        ruleId: 'DET-BG-001',
        ruleClass: 'NORMATIVE',
        sourceClauses: ['EN 378-3:2016 Clause 4.3'],
        extraDetector: true,
        reviewFlags: [],
        assumptions: [],
        actions: ['Activate audible/visual alarm'],
      };
    }
  }

  return skipPath('DET-BG-001');
}

/**
 * Path D — Ammonia-Specific (EN 378-3:2016, Clause 9.3.3)
 * DET-NH3-001: R-717 + charge > 50 kg → YES with two-level alarm
 * DET-NH3-002: R-717 + charge <= 50 kg → general paths apply
 */
function pathD_Ammonia(input: RegulationInput): PathResult {
  if (normalizeRefId(input.refrigerant.id) !== 'R-717') {
    return skipPath('DET-NH3-001');
  }

  if (input.charge > 50) {
    return {
      decision: 'YES',
      basis: 'EN 378-3:2016, Clause 9.3.3 — R-717 > 50 kg → two-level alarm',
      ruleId: 'DET-NH3-001',
      ruleClass: 'NORMATIVE',
      sourceClauses: ['EN 378-3:2016 Clause 9.3.3'],
      extraDetector: false,
      reviewFlags: [],
      assumptions: [],
      actions: [
        'Pre-alarm 500 ppm: warning + start ventilation',
        'Main alarm 30,000 ppm: emergency shutdown + evacuation',
      ],
    };
  }

  return skipPath('DET-NH3-002');
}

/**
 * Path E — Ventilated Enclosure / Location IV
 * DET-ENC-001: Location IV → MANUAL_REVIEW
 */
function pathE_VentilatedEnclosure(input: RegulationInput): PathResult {
  if (input.locationClass !== 'IV') {
    return skipPath('DET-ENC-001');
  }

  return {
    decision: 'MANUAL_REVIEW',
    basis: 'Location IV ventilated enclosure — assess enclosure integrity and ventilation monitoring',
    ruleId: 'DET-ENC-001',
    ruleClass: 'NORMATIVE',
    sourceClauses: ['EN 378-2', 'EN 378-3'],
    extraDetector: false,
    reviewFlags: ['MR-008: Ventilated enclosure — assess integrity'],
    assumptions: [],
    actions: [],
  };
}

/**
 * Path F — Not Required / Recommended
 * DET-NONE-001: all paths negative → RECOMMENDED (SAMON policy)
 */
function pathF_NotRequired(): PathResult {
  return {
    decision: 'RECOMMENDED',
    basis: 'DET-NONE-001: All paths negative — detection not normatively required by EN 378. SAMON recommends detection as good engineering practice.',
    ruleId: 'DET-NONE-001',
    ruleClass: 'RECOMMENDED',
    sourceClauses: [],
    extraDetector: false,
    reviewFlags: [],
    assumptions: ['National and local regulations may mandate detection even when EN 378 does not'],
    actions: [],
  };
}

// ── EN 378 RuleSet Implementation ───────────────────────────────────────

export const en378RuleSet: RuleSet = {
  id: 'en378',
  name: 'EN 378-3:2016',
  version: '2016+A1:2020',
  region: 'EU',

  /**
   * Evaluate all detection paths (A-E), aggregate:
   * first YES wins, else MANUAL_REVIEW, else RECOMMENDED (path F).
   */
  evaluateDetection(input: RegulationInput): DetectionEvaluation {
    const volume = input.roomVolume ?? input.roomArea * input.roomHeight;
    const effectiveInput: RegulationInput = { ...input, roomVolume: volume };

    const pA = pathA_MachineryRoom(effectiveInput);
    const pB = pathB_C3OccupiedSpace(effectiveInput);
    const pC = pathC_BelowGroundFlammable(effectiveInput);
    const pD = pathD_Ammonia(effectiveInput);
    const pE = pathE_VentilatedEnclosure(effectiveInput);

    const allPaths = [pA, pB, pC, pD, pE];

    // Build path evaluations for trace
    const pathEvaluations: PathEvaluation[] = [
      { path: 'A_MachineryRoom', decision: pA.decision, ruleId: pA.ruleId, basis: pA.basis, extraDetector: pA.extraDetector },
      { path: 'B_C3OccupiedSpace', decision: pB.decision, ruleId: pB.ruleId, basis: pB.basis, extraDetector: pB.extraDetector },
      { path: 'C_BelowGroundFlammable', decision: pC.decision, ruleId: pC.ruleId, basis: pC.basis, extraDetector: pC.extraDetector },
      { path: 'D_Ammonia', decision: pD.decision, ruleId: pD.ruleId, basis: pD.basis, extraDetector: pD.extraDetector },
      { path: 'E_VentilatedEnclosure', decision: pE.decision, ruleId: pE.ruleId, basis: pE.basis, extraDetector: pE.extraDetector },
    ];

    // Aggregate: first YES wins, else MANUAL_REVIEW, else RECOMMENDED
    const yesPaths = allPaths.filter(p => p.decision === 'YES');
    const mrPaths = allPaths.filter(p => p.decision === 'MANUAL_REVIEW');

    let detectionRequired: DetectionEvaluation['detectionRequired'];
    let detectionBasis: string;
    let governingRuleId: string;
    let ruleClasses: string[];

    if (yesPaths.length > 0) {
      detectionRequired = 'YES';
      detectionBasis = yesPaths.map(p => p.basis).join(' | ');
      governingRuleId = yesPaths[0].ruleId;
      ruleClasses = Array.from(new Set(yesPaths.map(p => p.ruleClass)));
    } else if (mrPaths.length > 0) {
      detectionRequired = 'MANUAL_REVIEW';
      detectionBasis = 'One or more paths require manual review: ' +
        mrPaths.map(p => p.basis).join(' | ');
      governingRuleId = mrPaths[0].ruleId;
      ruleClasses = Array.from(new Set(mrPaths.map(p => p.ruleClass)));
    } else {
      const pF = pathF_NotRequired();
      detectionRequired = 'RECOMMENDED';
      detectionBasis = pF.basis;
      governingRuleId = pF.ruleId;
      ruleClasses = [pF.ruleClass];
    }

    // Collect all actions, assumptions, review flags, source clauses
    const requiredActions: string[] = [];
    const assumptions: string[] = [];
    const reviewFlags: string[] = [];
    const sourceClauses: string[] = [];

    for (const p of allPaths) {
      requiredActions.push(...p.actions);
      assumptions.push(...p.assumptions);
      reviewFlags.push(...p.reviewFlags);
      sourceClauses.push(...p.sourceClauses);
    }

    const extraDetector = allPaths.some(p => p.extraDetector);

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
  },

  /**
   * THR-GEN-001 through THR-GEN-004:
   * threshold = min(50% ATEL/ODL ppm, 25% LFL ppm)
   * NH3 > 50kg → two-level (500/30000 ppm).
   */
  calculateThreshold(
    ref: RefrigerantV5,
    charge: number,
  ): { threshold: ThresholdResult; stage2Ppm: number | null; actions: string[] } {
    const isNh3TwoLevel = normalizeRefId(ref.id) === 'R-717' && charge > 50;

    // THR-NH3-001: R-717 > 50 kg special two-level
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

    // General threshold logic
    let halfAtelPpm: number | null = null;
    let lfl25PctPpm: number | null = null;

    if (ref.atelOdl !== null && ref.atelOdl !== undefined) {
      const atelPpm = kgM3ToPpm(ref.atelOdl, ref.molecularMass);
      halfAtelPpm = atelPpm * 0.5;
    }

    if (ref.lfl !== null && ref.lfl !== undefined) {
      const lflPpm = kgM3ToPpm(ref.lfl, ref.molecularMass);
      lfl25PctPpm = lflPpm * 0.25;
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

    const thresholdKgM3 = ppmToKgM3(thresholdPpm, ref.molecularMass);
    const actions = [`Activate alarm at ${thresholdPpm} ppm`];

    return {
      threshold: { ppm: thresholdPpm, kgM3: thresholdKgM3, basis },
      stage2Ppm: null,
      actions,
    };
  },

  /**
   * EN 378 alarm thresholds: RCL-based for ALL safety groups.
   * alarm1 = threshold (min of 50% ATEL, 25% LFL)
   * alarm2 = 2 x alarm1
   * cutoff = RCL (practicalLimit)
   */
  getAlarmThresholds(ref: RefrigerantV5): AlarmThresholds {
    // Calculate alarm1 using the same threshold logic
    const { threshold } = en378RuleSet.calculateThreshold(ref, 0);

    const alarm1Ppm = threshold.ppm;
    const alarm1KgM3 = threshold.kgM3;
    const alarm2Ppm = alarm1Ppm * 2;
    const alarm2KgM3 = alarm1KgM3 * 2;

    // Cutoff = RCL (practicalLimit)
    const cutoffKgM3 = ref.practicalLimit;
    const cutoffPpm = kgM3ToPpm(cutoffKgM3, ref.molecularMass);

    // Determine alarm2 basis based on what governed alarm1
    let alarm2Basis: string;
    if (threshold.basis === '50%_ATEL_ODL') {
      alarm2Basis = 'RCL_ATEL_ODL';
    } else if (threshold.basis === '25%_LFL') {
      alarm2Basis = 'RCL_50%_LFL';
    } else {
      alarm2Basis = 'RCL_2x_threshold';
    }

    return {
      alarm1: {
        ppm: alarm1Ppm,
        kgM3: alarm1KgM3,
        basis: `RCL_${threshold.basis}`,
      },
      alarm2: {
        ppm: alarm2Ppm,
        kgM3: alarm2KgM3,
        basis: alarm2Basis,
      },
      cutoff: {
        ppm: Math.floor(cutoffPpm),
        kgM3: cutoffKgM3,
        basis: 'RCL',
      },
      stage2Ppm: null,
    };
  },

  /**
   * Emergency ventilation: 0.14 x sqrt(chargeKg) m³/s
   * EN 378-3:2016 Clause 6.4.4
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
      clause: 'EN 378-3:2016 Clause 6.4.4',
    };
  },

  /**
   * EN 378 has no ASHRAE-style extra requirements.
   */
  getExtraRequirements(
    _ref: RefrigerantV5,
    _input: RegulationInput,
  ): ExtraRequirement[] {
    return [];
  },

  /**
   * Build candidate detection zones based on room configuration
   * and leak source locations.
   */
  buildCandidateZones(input: RegulationInput): CandidateZone[] {
    const zones: CandidateZone[] = [];
    let zoneIdx = 1;

    // PLC-MR-001: machinery room → near compressor
    if (input.isMachineryRoom) {
      zones.push({
        zoneId: `Z${zoneIdx++}`,
        description: 'Near compressor/equipment group',
        leakSources: ['compressor', 'pressure vessels'],
        detectorPosition: 'Near most probable leak source',
        rationale: 'PLC-MR-001: Machinery room — detector near most probable leak source',
      });
      zones.push({
        zoneId: `Z${zoneIdx++}`,
        description: 'Near ventilation exhaust intake',
        leakSources: [],
        detectorPosition: 'Adjacent to ventilation exhaust',
        rationale: 'PLC-POS-001: Detect gas near exhaust before dilution',
      });
    }

    // PLC-BG-001: below-ground → lowest accessible point
    if (input.belowGround) {
      zones.push({
        zoneId: `Z${zoneIdx++}`,
        description: 'Lowest accessible point',
        leakSources: ['gas accumulation zone'],
        detectorPosition: 'Lowest accessible point in the space',
        rationale: 'PLC-BG-001: Below-ground space — gas accumulates at lowest point',
      });
    }

    // User-provided leak source locations
    if (input.leakSourceLocations && input.leakSourceLocations.length > 0) {
      for (const src of input.leakSourceLocations) {
        zones.push({
          zoneId: `Z${zoneIdx++}`,
          description: src.description,
          leakSources: [src.id],
          detectorPosition: `Near leak source: ${src.description}`,
          rationale: 'PLC-POS-001: Position detector near probable leak source',
        });
      }
    }

    // Default zone if none defined
    if (zones.length === 0) {
      zones.push({
        zoneId: `Z${zoneIdx++}`,
        description: 'Near probable leak source (joints, valves, connections)',
        leakSources: ['non-permanent joints', 'valve manifolds'],
        detectorPosition: 'Near most probable leak source',
        rationale: 'PLC-POS-001: Position detector where refrigerant is most likely to concentrate',
      });
    }

    return zones;
  },
};
