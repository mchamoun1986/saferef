// regulation-engine.ts — M1 Regulation Engine
// V5 implementation of DetectBuilder V4-D Spec
// EN 378-3:2016 Detection Requirement + Sizing + Placement + Thresholds
//
// Pure function engine — no DB calls, no side effects.
// Takes RegulationInput, returns RegulationResult.

import type {
  RegulationInput,
  RegulationResult,
  RegulationTrace,
  PathEvaluation,
  RefrigerantV5,
  CandidateZone,
} from './engine-types';

// ── Constants ──────────────────────────────────────────────────────────
const AIR_DENSITY_25C = 1.18; // kg/m³ at 25°C
const MOLAR_VOLUME = 24.45;  // L/mol at 25°C, 101.3 kPa

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

// ── Internal Types ────────────────────────────────────────────────────
type DetectionDecision = 'YES' | 'NO' | 'MANUAL_REVIEW' | 'RECOMMENDED' | 'SKIP';

interface PathResult {
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

// ── ID Normalization ──────────────────────────────────────────────────

/** Normalize refrigerant ID: R744 → R-744, R134a → R-134a, R1234yf → R-1234yf */
function normalizeRefId(id: string): string {
  // Already has dash after R
  if (id.startsWith('R-')) return id;
  // Non-refrigerant IDs (CO, NO2, O2)
  if (!id.startsWith('R') || id.length < 3) return id;
  // Insert dash after 'R': R744 → R-744, R134a → R-134a
  return 'R-' + id.slice(1);
}

// ── Calculation Library (§9) ──────────────────────────────────────────

/** CALC-003: concentration in kg/m³ from charge and volume */
function concentrationKgM3(charge: number, volume: number): number {
  if (volume <= 0) return 0;
  return charge / volume;
}

/** CALC-001: convert kg/m³ to ppm at standard conditions */
function kgM3ToPpm(cKg: number, M: number): number {
  return (MOLAR_VOLUME * cKg * 1e6) / M;
}

/** CALC-002: convert ppm to kg/m³ at standard conditions */
function ppmToKgM3(cPpm: number, M: number): number {
  return (M * cPpm) / (MOLAR_VOLUME * 1e6);
}

/** CALC-005/006/007: charge cap factors from LFL */
function calcM1M2M3(lfl: number): { m1: number; m2: number; m3: number } {
  return {
    m1: 4 * lfl,
    m2: 26 * lfl,
    m3: 130 * lfl,
  };
}

// ── Threshold Engine (§8) ─────────────────────────────────────────────

interface ThresholdResult {
  ppm: number;
  kgM3: number;
  basis: string;
}

/**
 * THR-GEN-001 through THR-GEN-004:
 * threshold = min(50% ATEL/ODL ppm, 25% LFL ppm)
 * Conservative rounding: floor (round DOWN).
 */
function calculateThreshold(
  ref: RefrigerantV5,
  charge: number,
  isNh3TwoLevel: boolean,
): { threshold: ThresholdResult; stage2Ppm: number | null; actions: string[] } {
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

  // CALC-008: atel_ppm = (24.45 * atel_odl_kg * 1e6) / M
  if (ref.atelOdl !== null && ref.atelOdl !== undefined) {
    const atelPpm = kgM3ToPpm(ref.atelOdl, ref.molecularMass);
    halfAtelPpm = atelPpm * 0.5;
  }

  // CALC-009: lfl_25pct_ppm = (24.45 * lfl_kg * 0.25 * 1e6) / M
  if (ref.lfl !== null && ref.lfl !== undefined) {
    const lflPpm = kgM3ToPpm(ref.lfl, ref.molecularMass);
    lfl25PctPpm = lflPpm * 0.25;
  }

  // CALC-010: threshold = min(50% atel, 25% lfl)
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
    // THR-GEN-003: only ATEL available (non-flammable)
    thresholdPpm = Math.floor(halfAtelPpm);
    basis = '50%_ATEL_ODL';
  } else if (lfl25PctPpm !== null) {
    // THR-GEN-002: only LFL available
    thresholdPpm = Math.floor(lfl25PctPpm);
    basis = '25%_LFL';
  }

  // THR-GEN-004: both null → insufficient data
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
}

// ── Placement Engine (§7) ─────────────────────────────────────────────

interface PlacementResult {
  height: 'floor' | 'ceiling' | 'breathing_zone';
  heightM: string;
}

/**
 * PLC-HGT-001 through PLC-HGT-004:
 * Compare vapour density to air density thresholds.
 */
function determinePlacement(
  ref: RefrigerantV5,
  roomHeight: number,
): PlacementResult {
  const vd = ref.vapourDensity;

  // PLC-HGT-002: clearly heavier than air (absolute threshold per EN 378-3)
  if (vd > 1.5) {
    return { height: 'floor', heightM: '0-0.5 m' };
  }

  // PLC-HGT-003: clearly lighter than air (absolute threshold per EN 378-3)
  if (vd < 0.8) {
    const ceilingHeight = roomHeight >= 0.5 ? Math.max(roomHeight - 0.3, 0.5) : roomHeight;
    return {
      height: 'ceiling',
      heightM: `${ceilingHeight.toFixed(1)} m (ceiling minus 0.3 m)`,
    };
  }

  // PLC-HGT-004: near-neutral buoyancy
  return { height: 'breathing_zone', heightM: '1.2-1.8 m' };
}

// ── Detection Paths (§5) ─────────────────────────────────────────────

function isFlammable(flammabilityClass: string): boolean {
  return ['2L', '2', '3'].includes(flammabilityClass);
}

/**
 * Path A — Machinery Room (§5.2)
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
    const { m2 } = calcM1M2M3(ref.lfl);
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
 * Path B — C.3 Occupied Space (§5.3)
 * DET-C3-001 through DET-C3-009
 */
function pathB_C3OccupiedSpace(input: RegulationInput): PathResult {
  if (!input.c3Applicable) {
    return skipPath('DET-C3-001');
  }

  const refId = normalizeRefId(input.refrigerant.id);
  const c3 = TABLE_C3[refId] ?? null;

  if (!c3) {
    // C.3 applicable but no table data → manual review (MR-002)
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
      // DET-C3-006
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
      // DET-C3-007
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
      // DET-C3-008: conc > QLMV
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
      // DET-C3-003
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
      // DET-C3-004
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
      // DET-C3-005: conc > QLAV
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
 * Path C — Below-Ground Flammable Systems (§5.4)
 * DET-BG-001: below_ground + flammable + charge > m2 → YES + extra detector
 */
function pathC_BelowGroundFlammable(input: RegulationInput): PathResult {
  const ref = input.refrigerant;

  if (
    input.belowGround &&
    isFlammable(ref.flammabilityClass) &&
    ref.lfl !== null
  ) {
    const { m2 } = calcM1M2M3(ref.lfl);
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
 * Path D — Ammonia-Specific (§5.5)
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

  // DET-NH3-002: charge <= 50 kg, evaluate under general paths
  return skipPath('DET-NH3-002');
}

/**
 * Path E — Ventilated Enclosure / Location IV (§5.6)
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
 * Path F — Not Required / Recommended (§5.7)
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

// ── Quantity Engine (§6) ──────────────────────────────────────────────

/**
 * QTY-MIN-001 through QTY-REC-005:
 * normative minimum + engineering recommendation
 *
 * TWO MODES:
 * - Mode A (no positioned sources): conservative 50m²/detector rule
 * - Mode B (positioned sources on plan): cluster-based, 7m max distance
 *
 * Clustering logic: sources within 7m of each other form one cluster.
 * One detector per cluster, placed on nearest wall.
 * Priority: compressor > evaporator > valve > joint > other
 */
function calculateQuantity(
  input: RegulationInput,
  detectionRequired: boolean,
  extraDetectorFromPaths: boolean,
): { min: number; recommended: number; mode: 'area' | 'cluster'; clusters: number } {
  if (!detectionRequired) {
    return { min: 0, recommended: 0, mode: 'area', clusters: 0 };
  }

  // QTY-MIN-001: detection required → min 1
  let minDet = 1;

  // QTY-MIN-002: below ground + flammable + charge > m2 → +1
  if (extraDetectorFromPaths) {
    minDet += 1;
  }

  const sources = input.leakSourceLocations ?? [];
  const hasPositionedSources = sources.length > 0 && sources.some(s => s.x !== undefined && s.y !== undefined);

  if (hasPositionedSources) {
    // ── MODE B: Cluster-based (sources positioned on plan) ──────────
    const roomL = input.roomLength ?? Math.sqrt(input.roomArea);
    const roomW = input.roomWidth ?? (input.roomArea / roomL);
    const clusterCount = computeSourceClusters(sources, roomL, roomW);

    const recommended = Math.max(minDet, clusterCount);
    return { min: minDet, recommended, mode: 'cluster', clusters: clusterCount };
  }

  // ── MODE A: Area-based fallback (no positioned sources) ───────────
  // QTY-REC-001: 1 detector per 50 m² (pure surface coverage)
  // Leak source count does NOT affect Mode A — that's handled by Mode B clusters
  const areaBased = Math.max(1, Math.ceil(input.roomArea / 50));

  const recommended = Math.max(minDet, areaBased);

  return { min: minDet, recommended, mode: 'area', clusters: 0 };
}

/**
 * Cluster sources by proximity: sources within MAX_DETECTION_DISTANCE_M
 * of each other form one cluster. Uses union-find for efficiency.
 */
const MAX_DETECTION_DISTANCE_M = 7; // √50 ≈ 7m

function computeSourceClusters(
  sources: { id: string; x?: number; y?: number }[],
  roomLengthM: number,
  roomWidthM: number,
): number {
  const positioned = sources.filter(s => s.x !== undefined && s.y !== undefined);
  if (positioned.length === 0) return 0;
  if (positioned.length === 1) return 1;

  // Union-Find
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id);
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    // Path compression
    let curr = id;
    while (curr !== root) { const next = parent.get(curr)!; parent.set(curr, root); curr = next; }
    return root;
  };
  const union = (a: string, b: string) => { parent.set(find(a), find(b)); };

  // Initialize
  for (const s of positioned) find(s.id);

  // Merge sources within 7m of each other
  for (let i = 0; i < positioned.length; i++) {
    for (let j = i + 1; j < positioned.length; j++) {
      const a = positioned[i], b = positioned[j];
      const dx = ((a.x! - b.x!) / 100) * roomLengthM;
      const dy = ((a.y! - b.y!) / 100) * roomWidthM;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= MAX_DETECTION_DISTANCE_M) {
        union(a.id, b.id);
      }
    }
  }

  // Count unique clusters
  const roots = new Set(positioned.map(s => find(s.id)));
  return roots.size;
}

// ── Candidate Zones Builder ───────────────────────────────────────────

function buildCandidateZones(input: RegulationInput): CandidateZone[] {
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
}

// ── Governing Hazard ──────────────────────────────────────────────────

function determineGoverningHazard(
  ref: RefrigerantV5,
): 'TOXICITY' | 'FLAMMABILITY' | 'BOTH' | 'NONE' {
  const isToxic = ref.toxicityClass === 'B';
  const isFlam = isFlammable(ref.flammabilityClass);

  if (isToxic && isFlam) return 'BOTH';
  if (isToxic) return 'TOXICITY';
  if (isFlam) return 'FLAMMABILITY';
  return 'NONE';
}

// ── Validation Helper ─────────────────────────────────────────────

function validationError(message: string): RegulationResult {
  return {
    detectionRequired: 'NO',
    detectionBasis: `INPUT_ERROR: ${message}`,
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
    thresholdBasis: 'VALIDATION_ERROR',
    stage2ThresholdPpm: null,
    requiredActions: [],
    assumptions: [],
    missingInputs: [message],
    reviewFlags: [`VALIDATION: ${message}`],
    sourceClauses: [],
    ruleClasses: [],
    trace: {
      pathEvaluations: [],
      volumeCalculated: 0,
      concentrationKgM3: null,
      thresholdCalc: { halfAtelPpm: null, lfl25PctPpm: null, chosen: 'VALIDATION_ERROR', finalPpm: 0 },
      placementCalc: { vapourDensity: 0, airDensity: AIR_DENSITY_25C, ratio: 'neutral', result: 'N/A' },
      quantityCalc: { areaBased: 0, leakSourceBased: 0, extraDetector: false, min: 0, recommended: 0, mode: 'area' as const, clusters: 0 },
    },
  };
}

// ── Main Export ───────────────────────────────────────────────────────

export function calculateRegulation(input: RegulationInput): RegulationResult {
  // ── Input Validation ──
  if (input.charge <= 0) {
    return validationError('Charge must be > 0 kg');
  }
  if (input.roomArea <= 0) {
    return validationError('Room area must be > 0 m²');
  }
  if (input.roomHeight <= 0) {
    return validationError('Room height must be > 0 m');
  }

  const ref = input.refrigerant;

  if (ref.practicalLimit === null || ref.practicalLimit === undefined) {
    return validationError(`Refrigerant ${ref.id} is missing practicalLimit`);
  }
  if (ref.vapourDensity === null || ref.vapourDensity === undefined || ref.vapourDensity <= 0) {
    return validationError(`Refrigerant ${ref.id} is missing or invalid vapourDensity`);
  }
  if (ref.molecularMass === null || ref.molecularMass === undefined || ref.molecularMass <= 0) {
    return validationError(`Refrigerant ${ref.id} is missing or invalid molecularMass`);
  }
  if (ref.atelOdl === null && ref.lfl === null) {
    return validationError(`Refrigerant ${ref.id}: both ATEL/ODL and LFL are missing — cannot calculate threshold`);
  }
  if (input.roomHeight < 0.5) {
    return validationError('Room height must be >= 0.5 m (insufficient for detector placement)');
  }

  const volume = input.roomVolume ?? input.roomArea * input.roomHeight;

  // Override input volume for downstream consistency
  const effectiveInput: RegulationInput = {
    ...input,
    roomVolume: volume,
  };

  // ── Evaluate all paths ──
  const pA = pathA_MachineryRoom(effectiveInput);
  const pB = pathB_C3OccupiedSpace(effectiveInput);
  const pC = pathC_BelowGroundFlammable(effectiveInput);
  const pD = pathD_Ammonia(effectiveInput);
  const pE = pathE_VentilatedEnclosure(effectiveInput);

  const allPaths = [pA, pB, pC, pD, pE];

  // ── Aggregate decision (§5.1: evaluate all, first YES sufficient) ──
  const yesPaths = allPaths.filter((p) => p.decision === 'YES');
  const mrPaths = allPaths.filter((p) => p.decision === 'MANUAL_REVIEW');

  let detectionRequired: RegulationResult['detectionRequired'];
  let detectionBasis: string;
  let governingRuleId: string;
  let ruleClasses: string[];

  if (yesPaths.length > 0) {
    detectionRequired = 'YES';
    detectionBasis = yesPaths.map((p) => p.basis).join(' | ');
    governingRuleId = yesPaths[0].ruleId;
    ruleClasses = Array.from(new Set(yesPaths.map((p) => p.ruleClass)));
  } else if (mrPaths.length > 0) {
    detectionRequired = 'MANUAL_REVIEW';
    detectionBasis = 'One or more paths require manual review: ' +
      mrPaths.map((p) => p.basis).join(' | ');
    governingRuleId = mrPaths[0].ruleId;
    ruleClasses = Array.from(new Set(mrPaths.map((p) => p.ruleClass)));
  } else {
    // Path F — all negative
    const pF = pathF_NotRequired();
    detectionRequired = 'RECOMMENDED';
    detectionBasis = pF.basis;
    governingRuleId = pF.ruleId;
    ruleClasses = [pF.ruleClass];
  }

  // ── Governing hazard ──
  const governingHazard = determineGoverningHazard(ref);

  // ── Check for extra detector from Path C or Path A+MR-002 ──
  const hasExtraDetector = allPaths.some((p) => p.extraDetector);

  // ── NH3 two-level check ──
  const isNh3TwoLevel = normalizeRefId(ref.id) === 'R-717' && input.charge > 50;

  // ── Threshold Engine ──
  const {
    threshold,
    stage2Ppm,
    actions: thresholdActions,
  } = calculateThreshold(ref, input.charge, isNh3TwoLevel);

  // ── Placement Engine ──
  const placement = determinePlacement(ref, input.roomHeight);

  // ── Quantity Engine ──
  const detectionIsRequired =
    detectionRequired === 'YES' || detectionRequired === 'MANUAL_REVIEW';
  const quantity = calculateQuantity(effectiveInput, detectionIsRequired, hasExtraDetector);

  // RECOMMENDED = not normatively required but SAMON recommends at least 1
  if (detectionRequired === 'RECOMMENDED' && quantity.recommended === 0) {
    if (quantity.mode === 'cluster' && quantity.clusters > 0) {
      quantity.recommended = quantity.clusters;
    } else {
      quantity.recommended = Math.max(1, Math.ceil(effectiveInput.roomArea / 50));
    }
    quantity.min = 0; // not mandatory, but recommended
  }

  // ── Candidate Zones ──
  const candidateZones = buildCandidateZones(effectiveInput);

  // ── Collect all required actions ──
  const requiredActions: string[] = [];
  for (const p of yesPaths) {
    requiredActions.push(...p.actions);
  }
  requiredActions.push(...thresholdActions);
  if (input.isMachineryRoom && !isNh3TwoLevel) {
    // Add ventilation action if not already present (from machinery room)
    if (!requiredActions.some((a) => a.includes('ventilation'))) {
      requiredActions.push('Start emergency ventilation (EN 378-3 9.1 + 5.13)');
    }
  }

  // ── Collect assumptions ──
  const assumptions: string[] = [
    'Simple rectangular room geometry assumed',
    'Single refrigerant system in the space',
    'Based on EN 378:2016 (FprEN final draft)',
    'Standard conditions: 25°C, 101.3 kPa',
  ];
  for (const p of allPaths) {
    assumptions.push(...p.assumptions);
  }
  // Deduplicate
  const uniqueAssumptions = Array.from(new Set(assumptions));

  // ── Missing inputs ──
  const missingInputs: string[] = [];
  if (ref.atelOdl === null && ref.lfl === null) {
    missingInputs.push('Both ATEL/ODL and LFL are null — cannot calculate threshold');
  }
  if (!input.leakSourceLocations || input.leakSourceLocations.length === 0) {
    missingInputs.push('No leak source locations provided — using default placement');
  }

  // ── Review flags ──
  const reviewFlags: string[] = [];
  for (const p of allPaths) {
    reviewFlags.push(...p.reviewFlags);
  }
  // MR-009: below ground + class B
  if (input.belowGround && ref.toxicityClass === 'B') {
    reviewFlags.push('MR-009: Below ground + class B refrigerant');
  }

  // ── Source clauses ──
  const sourceClauses: string[] = [];
  for (const p of allPaths) {
    sourceClauses.push(...p.sourceClauses);
  }
  // Deduplicate
  const uniqueSourceClauses = Array.from(new Set(sourceClauses));

  // ── Build trace ──
  const pathEvaluations: PathEvaluation[] = [
    { path: 'A_MachineryRoom', decision: pA.decision, ruleId: pA.ruleId, basis: pA.basis, extraDetector: pA.extraDetector },
    { path: 'B_C3OccupiedSpace', decision: pB.decision, ruleId: pB.ruleId, basis: pB.basis, extraDetector: pB.extraDetector },
    { path: 'C_BelowGroundFlammable', decision: pC.decision, ruleId: pC.ruleId, basis: pC.basis, extraDetector: pC.extraDetector },
    { path: 'D_Ammonia', decision: pD.decision, ruleId: pD.ruleId, basis: pD.basis, extraDetector: pD.extraDetector },
    { path: 'E_VentilatedEnclosure', decision: pE.decision, ruleId: pE.ruleId, basis: pE.basis, extraDetector: pE.extraDetector },
  ];

  // Concentration for C.3 path
  const concKgM3 = input.c3Applicable ? concentrationKgM3(input.charge, volume) : null;

  // Threshold intermediate values
  let halfAtelPpm: number | null = null;
  let lfl25PctPpm: number | null = null;
  if (ref.atelOdl !== null && ref.atelOdl !== undefined) {
    halfAtelPpm = kgM3ToPpm(ref.atelOdl, ref.molecularMass) * 0.5;
  }
  if (ref.lfl !== null && ref.lfl !== undefined) {
    lfl25PctPpm = kgM3ToPpm(ref.lfl, ref.molecularMass) * 0.25;
  }

  const vd = ref.vapourDensity;
  const placementRatio = vd > 1.5 ? 'heavier' : vd < 0.8 ? 'lighter' : 'neutral';

  const areaBased = Math.max(1, Math.ceil(effectiveInput.roomArea / 100));
  const leakSourceBased = effectiveInput.leakSourceLocations?.length ?? 0;

  const trace: RegulationTrace = {
    pathEvaluations,
    volumeCalculated: volume,
    concentrationKgM3: concKgM3,
    thresholdCalc: {
      halfAtelPpm: halfAtelPpm !== null ? Math.floor(halfAtelPpm) : null,
      lfl25PctPpm: lfl25PctPpm !== null ? Math.floor(lfl25PctPpm) : null,
      chosen: threshold.basis,
      finalPpm: threshold.ppm,
    },
    placementCalc: {
      vapourDensity: vd,
      airDensity: AIR_DENSITY_25C,
      ratio: placementRatio,
      result: `${placement.height} — ${placement.heightM}`,
    },
    quantityCalc: {
      areaBased,
      leakSourceBased,
      extraDetector: hasExtraDetector,
      min: quantity.min,
      recommended: quantity.recommended,
      mode: quantity.mode,
      clusters: quantity.clusters,
    },
  };

  // ── Build result ──
  return {
    detectionRequired,
    detectionBasis,
    governingHazard,
    governingRuleId,
    minDetectors: quantity.min,
    recommendedDetectors: quantity.recommended,
    quantityMode: quantity.mode,
    clusterCount: quantity.clusters,
    placementHeight: placement.height,
    placementHeightM: placement.heightM,
    candidateZones,
    thresholdPpm: threshold.ppm,
    thresholdKgM3: threshold.kgM3,
    thresholdBasis: threshold.basis,
    stage2ThresholdPpm: stage2Ppm,
    requiredActions: Array.from(new Set(requiredActions)),
    assumptions: uniqueAssumptions,
    missingInputs,
    reviewFlags: Array.from(new Set(reviewFlags)),
    sourceClauses: uniqueSourceClauses,
    ruleClasses: Array.from(new Set(ruleClasses)),
    trace,
  };
}
