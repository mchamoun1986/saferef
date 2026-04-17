// engine-types.ts — V5 shared types for M1, M2, M3 engines
// Single source of truth for all engine interfaces

// ─── Customer Groups ───────────────────────────────────────────────

export type CustomerGroup =
  | 'EDC'
  | 'OEM'
  | '1Fo'
  | '2Fo'
  | '3Fo'
  | '1Contractor'
  | '2Contractor'
  | '3Contractor'
  | 'AKund'
  | 'BKund'
  | 'NO';

// ─── Refrigerant (matches Prisma RefrigerantV5 model) ──────────────

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

// ─── Product (enriched from DB with parsed JSON arrays) ─────────────

export interface ProductEntry {
  id: string;
  code: string;
  name: string;
  family: string;            // MIDI, X5, G, TR, MP, RM, AQUIS, Controller, Accessory
  type: string;              // detector, controller, accessory
  description: string | null;
  category: string;
  price: number;
  tier: string;            // premium / standard / economic
  productGroup: string;    // A, C, D, F, G
  gas: string[];           // parsed from JSON
  refs: string[];          // parsed from JSON — compatible refrigerants
  apps: string[];          // parsed from JSON — compatible applications
  range: string | null;    // detection range
  sensorTech: string | null; // IR, SC, EC, IONIC, pH
  sensorLife: string | null;
  power: number | null;    // watts
  voltage: string | null;  // input voltage range
  ip: string | null;       // IP rating
  tempMin: number | null;  // min operating temp
  tempMax: number | null;  // max operating temp
  relay: number;           // relay output count
  analog: string | null;   // analog output type
  modbus: boolean;
  standalone: boolean;
  atex: boolean;
  mount: string[];         // parsed from JSON — mounting types
  remote: boolean;
  features: string | null;
  connectTo: string | null;
  discontinued: boolean;
  channels: number | null;   // controller channels
  maxPower: number | null;   // controller max power to sensors
  subCategory: string | null;       // alert, service, mounting, power, spare, signage
  compatibleFamilies: string[];     // parsed from JSON — ["MIDI","X5"] or ["ALL"]
}

// ─── Alert Accessory ────────────────────────────────────────────────

export interface AlertAccessory {
  key: string;             // e.g. "FL-RL-R"
  code: string;            // product code
  name: string;            // display name
  type: string;            // combined, siren, flash, none
  price: number;           // list price EUR
  power: string | null;
  ip: string | null;
}

// ─── M1 — Regulation Engine ────────────────────────────────────────

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
}

export interface CandidateZone {
  zoneId: string;
  description: string;
  leakSources: string[];
  detectorPosition: string;
  rationale: string;
}

export interface RegulationResult {
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
  requiredActions: string[];
  assumptions: string[];
  missingInputs: string[];
  reviewFlags: string[];
  sourceClauses: string[];
  ruleClasses: string[];           // "NORMATIVE", "DERIVED", "RECOMMENDED"
  trace?: RegulationTrace;
}

// ─── M1 Trace (path evaluation visibility) ────────────────────────

export interface PathEvaluation {
  path: string;         // "A_MachineryRoom", "B_C3OccupiedSpace", etc.
  decision: string;     // "YES", "NO", "SKIP", "MANUAL_REVIEW", "RECOMMENDED"
  ruleId: string;
  basis: string;
  extraDetector: boolean;
}

export interface RegulationTrace {
  pathEvaluations: PathEvaluation[];
  volumeCalculated: number;        // m³
  concentrationKgM3: number | null; // if C.3 path was evaluated
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

// ─── M2 — Selection Engine ─────────────────────────────────────────

export interface BomLine {
  code: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
  reason?: string;
}

export interface TierSolution {
  tier: 'PREMIUM' | 'STANDARD' | 'CENTRALIZED';
  label: string;
  solutionScore: number;          // 0-21, from F12 scoring
  detector: {
    code: string;
    name: string;
    qty: number;
    price: number;
    gas: string;
    range: string | null;
    sensorTech: string | null;
    sensorLife: string | null;
    ip: string | null;
    tempMin: number | null;
    tempMax: number | null;
  };
  detectorSpecs: {
    power: number | null;
    voltage: string | null;
    relays: number;
    relaySpec: string | null;
    analog: string | null;
    analogType: string | null;
    modbus: boolean;
    modbusType: string | null;
    connectTo: string | null;
    features: string | null;
  };
  controller: {
    code: string;
    name: string;
    qty: number;
    channels: number | null;
    maxPower: number | null;
    price: number;
    subtotal: number;
  } | null;
  controllerSpecs: {
    voltage: string | null;
    powerToSensors: number | null;
    relayOutputs: number | null;
    ip: string | null;
    analogIn: string | null;
    analogOut: string | null;
    rs485: boolean;
    displayType: string | null;
    tempRange: string | null;
    mounting: string | null;
    cableMax: string | null;
    failsafe: boolean;
    features: string | null;
  } | null;
  powerAccessories: BomLine[];
  mountingAccessories: BomLine[];
  alertAccessories: BomLine[];
  serviceTools: BomLine[];
  spareSensors: BomLine[];
  totalBom: number;                // sum list prices
}

export interface ComparisonTable {
  rows: { label: string; premium: string; standard: string; centralized: string }[];
  recommendation: 'premium' | 'standard' | 'centralized';
  recommendationReason: string;
}

export interface SelectionInput {
  regulationResult: RegulationResult;
  totalDetectors: number;          // from M1 recommendedDetectors
  selectedRefrigerant: string;     // "R744"
  selectedRange?: string;          // "0-10000ppm"
  zoneType: string;                // "supermarket"
  zoneAtex: boolean;
  outputRequired: string;          // "any", "relay", "4-20mA", "modbus"...
  sitePowerVoltage: '12V' | '24V' | '230V';
  mountingType: string;            // "wall", "duct"...
  projectCountry: string;          // "FR"
  products: ProductEntry[];        // full DB
  controllers: ProductEntry[];     // controller subset
  accessories: ProductEntry[];     // accessory subset (alert, service, mounting, spare)
  alertAccessory?: string;         // selected alert key
  // Application config from DB (overrides hardcoded APP_DEFAULTS/APP_DEFAULT_RANGE)
  appProductFamilies?: string[];   // e.g. ["MIDI","MP"]
  appDefaultRanges?: Record<string, string>; // e.g. {"R744":"0-10000ppm"}
}

// ─── M2 Trace (filter pipeline + scoring visibility) ─────────────

export interface FilterStep {
  name: string;          // "F0_application", "F3_refrigerant", etc.
  inputCount: number;
  outputCount: number;
  eliminated: number;
  eliminatedProducts?: string[];  // codes of eliminated products (max 10)
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
  name: string;        // "F7_controller", "F10_power", "F11_alert", etc.
  tier: string;        // "PREMIUM", "STANDARD", "CENTRALIZED"
  applied: boolean;    // was this function triggered?
  reason: string;      // why it was applied or skipped
  items: { code: string; name: string; qty: number; subtotal: number }[];
}

export interface SelectionTrace {
  filterPipeline: FilterStep[];
  afterFilters: number;          // products remaining after all filters
  scored: ScoredCandidate[];     // all scored candidates
  tierPicks: TierPickTrace[];    // how each tier was picked
  bomFunctions?: BomFunctionTrace[]; // BOM composition functions trace
}

export interface SelectionResult {
  tiers: {
    premium: TierSolution | null;
    standard: TierSolution | null;
    centralized: TierSolution | null;
  };
  comparison: ComparisonTable;
  trace?: SelectionTrace;
}

// ─── M3 — Pricing Engine ───────────────────────────────────────────

export interface PricedLine {
  code: string;
  name: string;
  productGroup: string;            // A, C, D, F, G
  category: string;                // Detectors, Controller, Power, Alerts, Mounting, Service Tools, Spares
  qty: number;
  listPrice: number;
  discountPct: number;
  discountAmount: number;
  netTotal: number;
  m2Price: number;                 // price from M2 for cross-validation
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
  quoteRef: string;                // "DET-2026-0001"
  quoteDate: string;
  quoteValidUntil: string;         // +30 days
  priceListVersion: string;
  tiers: {
    premium: PricedTier | null;
    standard: PricedTier | null;
    centralized: PricedTier | null;
  };
  comparison: {
    rows: { label: string; premium: string; standard: string; centralized: string }[];
    savingsVsPremium: { standard: number | null; centralized: number | null };
  };
  recommended: 'premium' | 'standard' | 'centralized';
  warnings: string[];              // PRICE_MISMATCH, PRICE_NOT_FOUND, discontinued
}

// ─── Orchestrator ──────────────────────────────────────────────────

export interface ClientData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone?: string;
  projectName: string;
  country: string;
  customerGroup: CustomerGroup;
  discountCode?: string;
  rgpdConsent: boolean;
}

export interface ZoneData {
  id: string;
  name: string;
  area: number;                    // m²
  height: number;                  // m
  volume?: number;                 // m³, default area × height
  charge: number;                  // kg
  evaporatorCount: number;
  leakSources: { id: string; description: string }[];
}

export interface RegulatoryContext {
  accessCategory: 'a' | 'b' | 'c';
  locationClass: 'I' | 'II' | 'III' | 'IV';
  belowGround: boolean;
  isMachineryRoom: boolean;
  isOccupiedSpace: boolean;
  humanComfort: boolean;
  c3Applicable: boolean;
  mechanicalVentilation: boolean;
}

export interface FullInput {
  client: ClientData;
  zones: ZoneData[];
  regulatory: RegulatoryContext;
  refrigerant: RefrigerantV5;
  zoneType: string;
  selectedRange?: string;
  outputRequired: string;
  sitePowerVoltage: '12V' | '24V' | '230V';
  mountingType: string;
  zoneAtex: boolean;
  alertAccessory?: string;
}

export interface ZoneRegulation {
  zoneName: string;
  result: RegulationResult;
}

export interface FullResult {
  /** Combined regulation (from first zone — used for header display) */
  regulation: RegulationResult;
  /** Per-zone regulation results */
  zoneRegulations: ZoneRegulation[];
  /** Sum of recommended detectors across all zones */
  totalDetectors: number;
  selection: SelectionResult;
  pricing: PricingResult;
}
