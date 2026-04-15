// engine/types.ts — RefCalc unified type definitions
// All types for multi-regulation engine (EN 378, ASHRAE 15, ISO 5149)

// ─── Regulation Identifier ───────────────────────────────────────────
export type RegulationId = 'en378' | 'ashrae15' | 'iso5149';

// ─── Refrigerant (matches Prisma RefrigerantV5 model) ────────────────
export interface RefrigerantV5 {
  id: string;              // R744, R32, R717...
  name: string;            // Full name
  safetyClass: string;     // A1, A2L, B2L, A3...
  toxicityClass: string;   // A or B
  flammabilityClass: string; // 1, 2L, 2, 3
  atelOdl: number | null;  // kg/m³ (null if ND)
  lfl: number | null;      // kg/m³ (null if class 1)
  practicalLimit: number;  // kg/m³
  vapourDensity: number;   // kg/m³
  molecularMass: number;   // g/mol
  boilingPoint: string | null;
  gwp: string | null;
  gasGroup: string;        // CO2, HFC1, HFC2, NH3, R290, CO, NO2, O2
}

// ─── Alarm Thresholds ────────────────────────────────────────────────
export interface AlarmThresholds {
  alarm1: {
    ppm: number;
    kgM3: number;
    basis: string;        // e.g. "50%_ATEL_ODL", "25%_LFL", "NH3_500"
  };
  alarm2: {
    ppm: number;
    kgM3: number;
    basis: string;        // e.g. "ATEL_ODL", "50%_LFL", "NH3_30000"
  };
  cutoff: {
    ppm: number;
    kgM3: number;
    basis: string;        // e.g. "ATEL_ODL", "LFL", "emergency_shutdown"
  };
  /** Stage 2 threshold for two-level systems (e.g. NH3 > 50 kg) */
  stage2Ppm: number | null;
}

// ─── Ventilation Result ──────────────────────────────────────────────
export interface VentilationResult {
  /** Emergency ventilation flow rate in m³/s */
  flowRateM3s: number;
  /** Formula used for calculation */
  formula: string;
  /** Regulation clause reference */
  clause: string;
}

// ─── Extra Requirements ──────────────────────────────────────────────
export interface ExtraRequirement {
  id: string;
  description: string;
  clause: string;
  mandatory: boolean;
}

// ─── M1 — Regulation Engine Input ────────────────────────────────────
export interface RegulationInput {
  refrigerant: RefrigerantV5;
  charge: number;                  // kg
  roomArea: number;                // m²
  roomHeight: number;              // m
  roomVolume?: number;             // m³, default area × height
  accessCategory: 'a' | 'b' | 'c';
  locationClass: 'I' | 'II' | 'III' | 'IV';
  belowGround: boolean;
  isMachineryRoom: boolean;
  isOccupiedSpace: boolean;
  humanComfort: boolean;
  c3Applicable: boolean;
  mechanicalVentilation: boolean;
  leakSourceLocations?: { id: string; description: string; x?: number; y?: number }[];
  /** Source type for clustering priority (compressor > evaporator > valve > joint > other) */
  sourceTypes?: string[];
  /** Room length in meters (for distance-based clustering) */
  roomLength?: number;
  /** Room width in meters */
  roomWidth?: number;
  /** ASHRAE 15 occupancy classification (optional, used by ASHRAE 15 rule set) */
  occupancyClass?: string;
}

// ─── Candidate Zone ──────────────────────────────────────────────────
export interface CandidateZone {
  zoneId: string;
  description: string;
  leakSources: string[];
  detectorPosition: string;
  rationale: string;
}

// ─── Path Evaluation (trace visibility) ──────────────────────────────
export interface PathEvaluation {
  path: string;         // "A_MachineryRoom", "B_C3OccupiedSpace", etc.
  decision: string;     // "YES", "NO", "SKIP", "MANUAL_REVIEW", "RECOMMENDED"
  ruleId: string;
  basis: string;
  extraDetector: boolean;
}

// ─── Regulation Trace ────────────────────────────────────────────────
export interface RegulationTrace {
  pathEvaluations: PathEvaluation[];
  volumeCalculated: number;        // m³
  concentrationKgM3: number | null; // if C.3 path was evaluated
  /** Key charge/concentration comparisons that drive the decision */
  chargeComparison: {
    chargeKg: number;
    volumeM3: number;
    concentrationKgM3: number;     // charge / volume
    practicalLimitKgM3: number;    // RCL from DB
    practicalLimitChargeKg: number; // RCL × volume = max charge without measures
    c3?: {                         // only if C.3 data available
      rclKgM3: number;
      qlmvKgM3: number;
      qlavKgM3: number;
      rclChargeKg: number;         // RCL × volume
      qlmvChargeKg: number;        // QLMV × volume
      qlavChargeKg: number;        // QLAV × volume
      concVsRcl: string;           // "below" | "above"
      concVsQlmv: string;
      concVsQlav: string;
    };
    m1Kg?: number;                 // 4 × LFL × volume (if flammable)
    m2Kg?: number;                 // 26 × LFL × volume
    m3Kg?: number;                 // 130 × LFL × volume
  };
  thresholdCalc: {
    halfAtelPpm: number | null;
    lfl25PctPpm: number | null;
    chosen: string;               // "50%_ATEL_ODL" or "25%_LFL"
    finalPpm: number;
  };
  placementCalc: {
    vapourDensity: number;
    airDensity: number;
    ratio: string;                // "heavier", "lighter", "neutral"
    result: string;
  };
  quantityCalc: {
    areaBased: number;
    leakSourceBased: number;
    extraDetector: boolean;
    min: number;
    recommended: number;
    mode: 'area' | 'cluster';    // area = 50m²/det, cluster = distance-based
    clusters: number;             // number of source clusters (0 if area mode)
  };
}

// ─── M1 — Regulation Result ─────────────────────────────────────────
export interface RegulationResult {
  /** Which regulation produced this result */
  regulationId: RegulationId;
  /** Human-readable regulation name */
  regulationName: string;
  detectionRequired: 'YES' | 'NO' | 'MANUAL_REVIEW' | 'RECOMMENDED';
  detectionBasis: string;
  governingHazard: 'TOXICITY' | 'FLAMMABILITY' | 'BOTH' | 'NONE';
  governingRuleId: string;
  minDetectors: number;            // normative minimum
  recommendedDetectors: number;    // engineering recommendation
  quantityMode: 'area' | 'cluster'; // area = 50m² rule, cluster = distance-based
  clusterCount: number;            // number of source clusters (0 if area mode)
  placementHeight: 'floor' | 'ceiling' | 'breathing_zone';
  placementHeightM: string;        // e.g. "0-0.5 m"
  candidateZones: CandidateZone[];
  thresholdPpm: number;
  thresholdKgM3: number;
  thresholdBasis: string;          // "25%_LFL", "50%_ATEL_ODL", "NH3_500", "NH3_30000"
  stage2ThresholdPpm: number | null;
  /** Structured alarm thresholds */
  alarmThresholds: AlarmThresholds;
  /** Emergency ventilation calculation */
  ventilation: VentilationResult | null;
  /** Additional regulation-specific requirements */
  extraRequirements: ExtraRequirement[];
  requiredActions: string[];
  assumptions: string[];
  missingInputs: string[];
  reviewFlags: string[];
  sourceClauses: string[];
  ruleClasses: string[];           // "NORMATIVE", "DERIVED", "RECOMMENDED"
  trace?: RegulationTrace;
}

// ─── Multi-Zone Result ───────────────────────────────────────────────
export interface ZoneRegulationResult {
  zoneId: string;
  zoneName: string;
  result: RegulationResult;
}

export interface AllZonesResult {
  /** Which regulation was used */
  regulationId: RegulationId;
  /** Human-readable regulation name */
  regulationName: string;
  /** Per-zone regulation results */
  zoneResults: ZoneRegulationResult[];
  /** Sum of recommended detectors across all zones */
  totalRecommendedDetectors: number;
  /** Sum of minimum detectors across all zones */
  totalMinDetectors: number;
  /** Detection required in at least one zone */
  anyDetectionRequired: boolean;
}
