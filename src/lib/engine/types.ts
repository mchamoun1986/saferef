// engine/types.ts — SafeRef unified type definitions
// All types for multi-regulation engine (EN 378, ASHRAE 15, ISO 5149)

// ProductRelation removed in V2 — compatibleWith field replaces it

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

// ─── Engine Query (lightweight input for threshold/alarm/ventilation) ─
// Any RegulationInput satisfies EngineQuery, so callers can pass either.
export interface EngineQuery {
  refrigerant: RefrigerantV5;
  charge: number;
  roomVolume?: number;
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

// ─── M2 — Selection Engine ─────────────────────────────────────────

export interface ProductEntry {
  id: string;
  code: string;
  name: string;
  family: string;
  type: string;
  description: string | null;
  category: string;
  price: number;
  tier: string;
  productGroup: string;
  gas: string[];
  refs: string[];
  /** @deprecated — will be removed; use Application.productFamilies instead */
  apps?: string[];
  range: string | null;
  sensorTech: string | null;
  sensorLife: string | null;
  power: number | null;
  voltage: string | null;
  ip: string | null;
  tempMin: number | null;
  tempMax: number | null;
  relay: number;
  analog: string | null;
  modbus: boolean;
  standalone: boolean;
  atex: boolean;
  mount: string[];
  remote: boolean;
  features: string | null;
  connectTo: string | null;
  discontinued: boolean;
  channels: number | null;
  maxPower: number | null;
  subCategory: string | null;
  compatibleFamilies: string[];
  image?: string | null;
}

export interface AlertAccessory {
  key: string;
  code: string;
  name: string;
  type: string;
  price: number;
  power: string | null;
  ip: string | null;
}

export interface BomLine {
  code: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
  reason?: string;
}

export type TierKey = 'PREMIUM_STANDALONE' | 'PREMIUM_CENTRALIZED' | 'ECO_STANDALONE' | 'ECO_CENTRALIZED';

export interface TierSolution {
  tier: TierKey;
  label: string;
  solutionScore: number;
  detector: {
    code: string; name: string; qty: number; price: number;
    gas: string; range: string | null; sensorTech: string | null;
    sensorLife: string | null; ip: string | null;
    tempMin: number | null; tempMax: number | null;
    image: string | null;
  };
  detectorSpecs: {
    power: number | null; voltage: string | null;
    relays: number; relaySpec: string | null;
    analog: string | null; analogType: string | null;
    modbus: boolean; modbusType: string | null;
    connectTo: string | null; features: string | null;
  };
  controller: {
    code: string; name: string; qty: number;
    channels: number | null; maxPower: number | null;
    price: number; subtotal: number;
  } | null;
  controllerSpecs: {
    voltage: string | null; powerToSensors: number | null;
    relayOutputs: number | null; ip: string | null;
    analogIn: string | null; analogOut: string | null;
    rs485: boolean; displayType: string | null;
    tempRange: string | null; mounting: string | null;
    cableMax: string | null; failsafe: boolean;
    features: string | null;
  } | null;
  powerAccessories: BomLine[];
  mountingAccessories: BomLine[];
  alertAccessories: BomLine[];
  serviceTools: BomLine[];
  spareSensors: BomLine[];
  totalBom: number;
}

export type TierSlot = 'premiumStandalone' | 'premiumCentralized' | 'ecoStandalone' | 'ecoCentralized';

export interface ComparisonTable {
  rows: { label: string; premiumStandalone: string; premiumCentralized: string; ecoStandalone: string; ecoCentralized: string }[];
  recommendation: TierSlot | null;
  recommendationReason: string;
}

export interface SelectionInput {
  regulationResult: RegulationResult;
  totalDetectors: number;
  selectedRefrigerant: string;
  selectedRange?: string;
  zoneType: string;
  zoneAtex: boolean;
  outputRequired: string;
  sitePowerVoltage: '12V' | '24V' | '230V';
  mountingType: string;
  projectCountry: string;
  products: ProductEntry[];
  controllers: ProductEntry[];
  accessories: ProductEntry[];
  alertAccessory?: string;
  appProductFamilies?: string[];
  appDefaultRanges?: Record<string, string>;
  relations?: { fromCode: string; toCode: string; relationType: string; condition?: string | null; qtyRule?: string | null }[];
}

export interface FilterStep {
  name: string;
  inputCount: number;
  outputCount: number;
  eliminated: number;
  eliminatedProducts?: string[];
}

export interface ScoredCandidate {
  id: string;
  code: string;
  name: string;
  tier: string;
  family: string;
  score: {
    tierPriority: number;
    applicationFit: number;
    outputMatch: number;
    simplicity: number;
    maintenanceCost: number;
    featureRichness: number;
    total: number;
  };
  price: number;
  standalone: boolean;
}

export interface TierPickTrace {
  tier: string;
  candidateCount: number;
  candidates: { id: string; code: string; score: number; price: number }[];
  picked: string | null;
  reason: string;
}

export interface BomFunctionTrace {
  name: string;
  tier: string;
  applied: boolean;
  reason: string;
  items: { code: string; name: string; qty: number; subtotal: number }[];
}

export interface SelectionTrace {
  filterPipeline: FilterStep[];
  afterFilters: number;
  scored: ScoredCandidate[];
  tierPicks: TierPickTrace[];
  bomFunctions?: BomFunctionTrace[];
}

export interface SelectionResult {
  tiers: {
    premiumStandalone: TierSolution | null;
    premiumCentralized: TierSolution | null;
    ecoStandalone: TierSolution | null;
    ecoCentralized: TierSolution | null;
  };
  comparison: ComparisonTable;
  trace?: SelectionTrace;
}

// ─── M3 — Pricing Engine ───────────────────────────────────────────

export type CustomerGroup =
  | 'EDC' | 'OEM' | '1Fo' | '2Fo' | '3Fo'
  | '1Contractor' | '2Contractor' | '3Contractor'
  | 'AKund' | 'BKund' | 'NO';

export interface PricedLine {
  code: string;
  name: string;
  productGroup: string;
  category: string;
  qty: number;
  listPrice: number;
  discountPct: number;
  discountAmount: number;
  netTotal: number;
  m2Price: number;
}

export interface PricedTier {
  tier: string;
  label: string;
  solutionScore: number;
  bomLines: PricedLine[];
  summary: {
    totalBeforeDiscount: number;
    totalDiscount: number;
    totalHt: number;
  };
  priceValidation: 'MATCH' | 'MISMATCH';
}

export interface PricingInput {
  tiers: SelectionResult['tiers'];
  customerGroup: CustomerGroup;
  discountCode?: string;
  discountMatrix: { customerGroup: string; productGroup: string; discountPct: number }[];
  customerOverrides?: { discountCode: string; productGroup: string; ratePct: number }[];
  priceDb: Map<string, { price: number; productGroup: string; discontinued: boolean }>;
}

export interface PricingResult {
  quoteRef: string;
  quoteDate: string;
  quoteValidUntil: string;
  priceListVersion: string;
  tiers: {
    premiumStandalone: PricedTier | null;
    premiumCentralized: PricedTier | null;
    ecoStandalone: PricedTier | null;
    ecoCentralized: PricedTier | null;
  };
  comparison: {
    rows: { label: string; premiumStandalone: string; premiumCentralized: string; ecoStandalone: string; ecoCentralized: string }[];
    savingsVsPremium: { premiumCentralized: number | null; ecoStandalone: number | null; ecoCentralized: number | null };
  };
  recommended: TierSlot | null;
  warnings: string[];
}
