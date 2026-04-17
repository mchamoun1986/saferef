// selection-engine.ts — M2 Product Selection Engine
// V5 — Full filter pipeline F0-F12, 3-tier output, scoring, controller combo
// Pure function: takes SelectionInput, returns SelectionResult

import type {
  SelectionInput,
  SelectionResult,
  SelectionTrace,
  FilterStep,
  ScoredCandidate,
  TierPickTrace,
  BomFunctionTrace,
  TierSolution,
  ProductEntry,
  BomLine,
  AlertAccessory,
  ComparisonTable,
} from './engine-types';

// ─── Reference Data (static, from simulator) ────────────────────────────────

/** Refrigerant → gas group mapping */
export const REF_TO_GAS: Record<string, string[]> = {
  R744: ['CO2'],
  R32: ['HFC1'], R407A: ['HFC1'], R407C: ['HFC1'], R407F: ['HFC1'],
  R410A: ['HFC1'], R448A: ['HFC1'], R449A: ['HFC1'], R452A: ['HFC1'], R452B: ['HFC1'],
  R454A: ['HFC1'], R454B: ['HFC1'], R454C: ['HFC1'], R455A: ['HFC1'], R464A: ['HFC1'],
  R465A: ['HFC1'], R466A: ['HFC1'], R468A: ['HFC1'], R507A: ['HFC1'],
  R134a: ['HFC2'], R404A: ['HFC2'], R450A: ['HFC2'], R513A: ['HFC2'],
  R1234yf: ['HFC2'], R1234ze: ['HFC2'], R1233zd: ['HFC2'],
  R717: ['NH3'],
  R290: ['R290'], R50: ['R290'], R600a: ['R290'], R1150: ['R290'], R1270: ['R290'],
  CO: ['CO'], NO2: ['NO2'], O2: ['O2'], NH3W: ['NH3W'],
};

/** Refrigerants with multiple detection ranges */
export const REF_RANGES: Record<string, { value: string; label: string }[]> = {
  R717: [
    { value: '0-100ppm', label: '0-100 ppm (early warning / comfort)' },
    { value: '0-500ppm', label: '0-500 ppm (standard monitoring)' },
    { value: '0-1000ppm', label: '0-1000 ppm (industrial standard)' },
    { value: '0-5000ppm', label: '0-5000 ppm (high concentration)' },
  ],
  R744: [
    { value: '0-10000ppm', label: '0-10,000 ppm (standard)' },
    { value: '0-5000ppm', label: '0-5,000 ppm (X5)' },
    { value: '0-30000ppm', label: '0-30,000 ppm (high range)' },
    { value: '0-5%vol', label: '0-5% vol (very high)' },
  ],
  CO: [
    { value: '0-100ppm', label: '0-100 ppm (X5)' },
    { value: '0-300ppm', label: '0-300 ppm (TR)' },
  ],
  NO2: [
    { value: '0-5ppm', label: '0-5 ppm (X5)' },
    { value: '0-20ppm', label: '0-20 ppm (TR)' },
  ],
};

/** Default range per application + refrigerant */
export const APP_DEFAULT_RANGE: Record<string, Record<string, string>> = {
  machinery_room: { R717: '0-1000ppm', R744: '0-10000ppm' },
  cold_storage:   { R717: '0-100ppm', R744: '0-10000ppm' },
  ice_rink:       { R717: '0-500ppm', R744: '0-10000ppm' },
  supermarket:    { R744: '0-10000ppm' },
  cold_room:      { R744: '0-10000ppm' },
  parking:        { CO: '0-100ppm', NO2: '0-5ppm' },
};

/** Get tier from DB field (source of truth). Fallback to family+tech logic if DB tier is 'standard' (default). */
function getProductTier(p: ProductEntry): string {
  // Use DB tier field if explicitly set to premium or economic
  if (p.tier === 'premium' || p.tier === 'economic') return p.tier;
  // If DB says 'standard' (default), derive from family+tech for backward compatibility
  const family = getFamily(p);
  const tech = (p.sensorTech ?? '').toUpperCase();
  switch (family) {
    case 'MIDI':
      return tech === 'IR' || tech === 'EC' ? 'premium' : 'standard';
    case 'X5':
      return tech === 'IR' || tech === 'IONIC' ? 'premium' : 'standard';
    case 'G':
      if (p.name.toUpperCase().startsWith('GXR')) return 'standard';
      return tech === 'IR' ? 'standard' : 'economic';
    case 'RM': return 'economic';
    case 'TR': return 'economic';
    case 'MP': return 'economic';
    case 'AQUIS': return 'standard';
    default: return p.tier || 'standard';
  }
}

const TIER_SCORE: Record<string, number> = { premium: 5, standard: 3, economic: 1 };

/** Application defaults — which product families are primary for each zone */
const APP_DEFAULTS: Record<string, { products: string[] }> = {
  supermarket:     { products: ['MIDI', 'MP'] },
  cold_room:       { products: ['MIDI', 'MP'] },
  machinery_room:  { products: ['X5', 'GXR', 'GEX'] },
  cold_storage:    { products: ['X5', 'MIDI', 'TR'] },
  hotel:           { products: ['RM'] },
  office:          { products: ['RM'] },
  parking:         { products: ['X5'] },
  ice_rink:        { products: ['X5', 'TR'] },
  heat_pump:       { products: ['MIDI', 'G'] },
  pressure_relief: { products: ['GR', 'TR'] },
  duct:            { products: ['GK', 'TR'] },
  atex_zone:       { products: ['X5', 'GXR', 'GEX'] },
  water_brine:     { products: ['AQUIS'] },
};

// ─── Alert Catalog ───────────────────────────────────────────────────────────

export const ALERT_ACCESSORIES: AlertAccessory[] = [
  { key: 'fl_rl_r', code: '40-440', name: 'FL-RL-R Combined light+siren Red', type: 'combined', price: 150, power: '18-28V DC', ip: 'IP65' },
  { key: 'fl_ol', code: '40-442', name: 'FL-OL-V-SEP Combined light+siren Orange', type: 'combined', price: 150, power: '18-28V DC', ip: 'IP65' },
  { key: 'fl_bl', code: '40-441', name: 'FL-BL-V-SEP Combined light+siren Blue', type: 'combined', price: 150, power: '18-28V DC', ip: 'IP65' },
  { key: 'siren', code: '40-410', name: '1992-R-LP Siren', type: 'siren', price: 120, power: '9-28V DC', ip: 'IP54' },
  { key: 'flash_red', code: '40-4022', name: 'BE-R-24VDC Flashing light Red', type: 'flash', price: 85, power: '9-60V DC', ip: 'IP54' },
  { key: 'flash_orange', code: '40-4021', name: 'BE-A-24VDC Flashing light Orange', type: 'flash', price: 85, power: '9-60V DC', ip: 'IP54' },
  { key: 'flash_blue', code: '40-4023', name: 'BE-BL-24VDC Flashing light Blue', type: 'flash', price: 85, power: '9-60V DC', ip: 'IP54' },
  { key: 'sock_h_r', code: '40-415', name: 'SOCK-H-R High socket IP65 Red', type: 'none', price: 100, power: '24V', ip: 'IP65' },
  { key: 'led_sign', code: '6100-0002', name: 'LED sign "Refrigerant Alarm"', type: 'none', price: 0, power: '230V/24V', ip: 'IP54' },
];

const SOCK_230: BomLine = { code: '40-420', name: 'SOCK-H-R-230 (230V socket)', qty: 1, price: 100, subtotal: 100, reason: '230V site — required per alert' };
const POWER_ADAPTER_PRICE = 99; // 4000-0002

// ─── Filter Functions ────────────────────────────────────────────────────────

/** Get sub-family prefix from product name (GXR, GEX, GK, GR, GSR, etc.) */
function getSubFamily(p: ProductEntry): string {
  const name = p.name.toUpperCase();
  // Order matters: check longer prefixes first
  if (name.startsWith('GXR')) return 'GXR';
  if (name.startsWith('GEX')) return 'GEX';
  if (name.startsWith('GSR')) return 'GSR';
  if (name.startsWith('GSMB')) return 'GSMB';
  if (name.startsWith('GSLS')) return 'GSLS';
  if (name.startsWith('GSH')) return 'GSH';
  if (name.startsWith('GK')) return 'GK';
  if (name.startsWith('GR')) return 'GR';
  if (name.startsWith('MPS')) return 'MPS';
  if (name.startsWith('MP-D')) return 'MP';
  if (name.startsWith('RMV')) return 'RMV';
  if (name.startsWith('RM')) return 'RM';
  if (name.startsWith('TR')) return 'TR';
  return getFamily(p);
}

/** F0: Application filter — uses Application DB families as primary source.
 *  Matches by family (G, MP, MIDI...) OR sub-family (GXR, GEX, GK...).
 *  If appProductFamilies is provided (from Applications admin page), filter by product family.
 *  Otherwise, fallback to product's own apps field. */
function f0_application(products: ProductEntry[], zoneType: string, appProductFamilies?: string[]): ProductEntry[] {
  if (appProductFamilies && appProductFamilies.length > 0) {
    // Normalize to uppercase for comparison
    const allowed = appProductFamilies.map(f => f.toUpperCase());
    return products.filter(p => {
      const family = getFamily(p).toUpperCase();
      const subFamily = getSubFamily(p).toUpperCase();
      return allowed.includes(family) || allowed.includes(subFamily);
    });
  }
  // Fallback: use product's own apps field
  return products.filter(p => p.apps.includes(zoneType));
}

/** F1: Country filter — currently no product exclusions, placeholder for future */
function f1_country(products: ProductEntry[], _country: string): ProductEntry[] {
  // No country-based product exclusions in current DB.
  // UPS1000 Sweden-only and calibration gas Europe-only are accessories, not in detector list.
  return products;
}

/** F2: ATEX filter — if atex required, keep only atex-certified products */
function f2_atex(products: ProductEntry[], atex: boolean): ProductEntry[] {
  if (!atex) return products;
  return products.filter(p => p.atex);
}

/** F3: Refrigerant filter — keep products whose refs array includes the selected refrigerant */
function f3_refrigerant(products: ProductEntry[], refrigerant: string): ProductEntry[] {
  return products.filter(p => p.refs.includes(refrigerant));
}

/** F3b: Range filter — if a range is selected and the refrigerant has multiple ranges, filter by exact match */
function f3b_range(products: ProductEntry[], range: string | undefined, refrigerant: string): ProductEntry[] {
  if (!range) return products;
  // Only apply if this refrigerant has multiple ranges
  if (!REF_RANGES[refrigerant]) return products;

  const normalize = (s: string) => s.replace(/,/g, '').replace(/\s/g, '');
  const normalRange = normalize(range);
  const kept = products.filter(p => {
    const pRange = p.range ? normalize(p.range) : '';
    return pRange === normalRange;
  });
  // Fallback: if range filtering leaves zero products, skip it
  return kept.length > 0 ? kept : products;
}

/** F4: Output filter — filter by required output type */
function f4_output(products: ProductEntry[], outputRequired: string): ProductEntry[] {
  if (outputRequired === 'any') return products;
  return products.filter(p => canDeliverOutput(p, outputRequired));
}

function canDeliverOutput(p: ProductEntry, req: string): boolean {
  const hasRelay = p.relay > 0;
  const hasAnalog = !!p.analog;
  const hasModbus = p.modbus;

  switch (req) {
    case 'any': return true;
    case 'relay':
      // Standalone products with own built-in relays only
      return hasRelay && p.standalone;
    case '420mA':
      // MIDI (selectable), X5 (fixed 4-20mA), TR (to PLC). Not MP (internal to MPU).
      return (hasAnalog && p.analog !== 'to MPU') || getFamily(p) === 'TR';
    case '010V':
      return p.analog === 'selectable' || p.analog === '4-20mA/0-10V';
    case '210V':
      return p.analog === 'selectable';
    case 'modbus':
      return hasModbus;
    case 'relay_analog_modbus':
      return hasRelay && hasAnalog && hasModbus;
    case 'relay_dual_analog':
      return p.analog === '4-20mA x2';
    default:
      return true;
  }
}

/** F5: Mounting filter — if a specific mounting type is requested, keep compatible products */
function f5_mounting(products: ProductEntry[], mountingType: string): ProductEntry[] {
  if (!mountingType || mountingType === 'any') return products;
  const filtered = products.filter(p => {
    if (!p.mount || p.mount.length === 0) return true; // no mount data → keep
    return p.mount.includes(mountingType);
  });
  // Fallback: if filtering leaves zero, return all (mount is a preference, not hard requirement)
  return filtered.length > 0 ? filtered : products;
}

/** F8: Temperature range filter — eliminate products that can't operate in specified environment */
function f8_temperature(products: ProductEntry[], tempMin?: number, tempMax?: number): ProductEntry[] {
  if (tempMin === undefined && tempMax === undefined) return products;
  return products.filter(p => {
    if (tempMin !== undefined && p.tempMin !== null && p.tempMin > tempMin) return false;
    if (tempMax !== undefined && p.tempMax !== null && p.tempMax < tempMax) return false;
    return true;
  });
}

/** F9: Power/voltage filter */
function f9_power(products: ProductEntry[], voltage: '12V' | '24V' | '230V'): ProductEntry[] {
  if (voltage === '24V') {
    // Eliminate 230V-only products
    return products.filter(p => p.voltage !== '230V');
  }
  if (voltage === '230V') {
    // Keep: MIDI (has Power Adapter), MP (powered by MPU which accepts 230V), AQUIS (native 230V), native 230V variants
    return products.filter(p => {
      if (isMidiFamily(p)) return true;       // has dedicated Power Adapter 4000-0002
      if (isMpFamily(p)) return true;          // powered by MPU which has 230V variant
      if (isAquisFamily(p)) return true;       // native 230V
      if (p.voltage && p.voltage.includes('230')) return true;   // native 230V variant (G-Series 230V, '230V AC', etc.)
      return false;                             // everything else eliminated
    });
  }
  if (voltage === '12V') {
    // 12V strict: only products that accept 12V minimum
    const MIN_VOLTAGE: Record<string, number> = {
      MIDI: 15, X5: 18, RM: 12, G: 12, TR: 12, MP: 24, AQUIS: 230,
    };
    return products.filter(p => {
      if (p.voltage === '230V') return false;
      if (p.voltage === 'MPU') return false;   // MPU needs 24V
      const family = getFamily(p);
      const minV = MIN_VOLTAGE[family] ?? 24;
      return minV <= 12;
    });
  }
  return products;
}

// ─── Family detection helpers ────────────────────────────────────────────────

function getFamily(p: ProductEntry): string {
  // Use DB family field (source of truth), fallback to name parsing
  if (p.family) return p.family;
  const name = p.name.toUpperCase();
  if (name.startsWith('MIDI')) return 'MIDI';
  if (name.startsWith('X5')) return 'X5';
  if (name.startsWith('RM') || name.startsWith('RMV')) return 'RM';
  if (name.startsWith('TR-') || name.startsWith('TR ')) return 'TR';
  if (name.startsWith('MPS') || name.startsWith('MP-D') || name.startsWith('GEX')) return 'MP';
  if (name.startsWith('AQUIS')) return 'AQUIS';
  if (name.startsWith('GSH') || name.startsWith('GSMB') || name.startsWith('GSLS') ||
      name.startsWith('GS ') || name.startsWith('GSR') || name.startsWith('GK') ||
      name.startsWith('GR ') || name.startsWith('GR-') || name.startsWith('GXR')) return 'G';
  return 'UNKNOWN';
}

function isMidiFamily(p: ProductEntry): boolean { return getFamily(p) === 'MIDI'; }
function isMpFamily(p: ProductEntry): boolean { return getFamily(p) === 'MP'; }
function isAquisFamily(p: ProductEntry): boolean { return getFamily(p) === 'AQUIS'; }
function isRmFamily(p: ProductEntry): boolean { return getFamily(p) === 'RM'; }

// ─── Controller Selection (F7) ───────────────────────────────────────────────

interface ControllerComboEntry {
  id: string;
  name: string;
  code: string;
  channels: number;
  maxPower: number;
  price: number;
  qty: number;
  cap: number;       // effective capacity per unit
}

interface ControllerComboResult {
  controllers: { id: string; name: string; code: string; qty: number; price: number; channels: number; maxPower: number; cap: number }[];
  total: number;
}

/**
 * F7: Find the cheapest controller combination for non-standalone detectors.
 * Brute-force all MPU combos (2C/4C/6C) then fill remainder with cheapest 1-channel (SPU/SPLS).
 * Respects: channel count, 10W power budget, AND detector-controller compatibility (connectTo).
 */
function f7_cheapestControllerCombo(
  totalDets: number,
  detectorPower: number,
  controllers: ProductEntry[],
  voltage: string,
  connectTo?: string | null,
): ControllerComboResult | null {
  if (totalDets <= 0) return null;

  const is230 = voltage === '230V';

  // Build available controller types from DB products
  const types: { id: string; name: string; code: string; channels: number; maxPower: number; price: number; cap: number }[] = [];

  for (const ctrl of controllers) {
    if (!ctrl.channels || ctrl.channels <= 0) continue;
    // Skip controllers with no price (LAN/BMS systems — not for standalone combos)
    if (ctrl.price <= 0) continue;
    // Check detector-controller compatibility via connectTo field
    if (connectTo) {
      const compat = connectTo.toUpperCase();
      const ctrlId = ctrl.name.toUpperCase();
      // Check if any keyword from controller name appears in connectTo
      const knownTypes = ['MPU', 'SPU', 'SPLS'];
      const ctrlType = knownTypes.find(t => ctrlId.includes(t));
      if (ctrlType && !compat.includes(ctrlType)) continue; // incompatible type
      if (!ctrlType) continue; // controller not in known types (e.g. LAN panel) — skip when connectTo is specified
    }
    // For voltage-specific controllers (SPU/SPLS), match the site voltage
    const ctrlName = ctrl.name.toUpperCase();
    if (is230 && ctrlName.includes('24') && !ctrlName.includes('230')) continue;
    if (!is230 && ctrlName.includes('230')) continue;

    types.push({
      id: ctrl.code,
      name: ctrl.name,
      code: ctrl.code,
      channels: ctrl.channels,
      maxPower: ctrl.maxPower ?? 10,
      price: ctrl.price,
      cap: 0,
    });
  }

  // Fallback: if no controllers found in DB, use hardcoded defaults
  if (types.length === 0) {
    types.push(
      { id: is230 ? 'SPU230' : 'SPU24', name: is230 ? 'SPU230' : 'SPU24', code: is230 ? '20-355' : '20-350', channels: 1, maxPower: 10, price: is230 ? 455 : 424, cap: 0 },
      { id: 'MPU2C', name: 'MPU2C', code: '20-310', channels: 2, maxPower: 10, price: 1168, cap: 0 },
      { id: 'MPU4C', name: 'MPU4C', code: '20-300', channels: 4, maxPower: 10, price: 1598, cap: 0 },
      { id: 'MPU6C', name: 'MPU6C', code: '20-305', channels: 6, maxPower: 10, price: 2004, cap: 0 },
    );
  }

  // Calculate effective capacity: min(channels, floor(maxPower / detectorPower))
  const dpw = detectorPower || 2;
  const caps = types
    .map(m => ({ ...m, cap: Math.min(m.channels, Math.floor(m.maxPower / dpw)) }))
    .filter(m => m.cap > 0);

  if (!caps.length) return null;

  // Find cheapest 1-channel option
  const spuOptions = caps.filter(c => c.channels === 1).sort((a, b) => a.price - b.price);
  const spu = spuOptions[0] ?? null;

  // MPU options (multi-channel)
  const mpus = caps.filter(c => c.channels > 1);

  let best: ControllerComboEntry[] | null = null;
  let bestCost = Infinity;

  // Max units per MPU type to try
  const mxM = mpus.map(c => Math.ceil(totalDets / c.cap) + 1);

  // Brute-force all MPU combinations
  for (let a = 0; a <= (mpus[0] ? mxM[0] : 0); a++) {
    for (let b = 0; b <= (mpus[1] ? mxM[1] : 0); b++) {
      for (let c = 0; c <= (mpus[2] ? mxM[2] : 0); c++) {
        const mpuCap = (mpus[0] ? a * mpus[0].cap : 0) + (mpus[1] ? b * mpus[1].cap : 0) + (mpus[2] ? c * mpus[2].cap : 0);
        const mpuCost = (mpus[0] ? a * mpus[0].price : 0) + (mpus[1] ? b * mpus[1].price : 0) + (mpus[2] ? c * mpus[2].price : 0);

        const remain = Math.max(0, totalDets - mpuCap);
        const spuQty = spu ? (remain > 0 ? Math.ceil(remain / spu.cap) : 0) : 0;
        const spuCost = spu ? spuQty * spu.price : (remain > 0 ? Infinity : 0);
        const totalCost = mpuCost + spuCost;
        const totalCap = mpuCap + (spu ? spuQty * spu.cap : 0);

        if (totalCap >= totalDets && totalCost < bestCost) {
          bestCost = totalCost;
          best = [];
          if (spu && spuQty > 0) best.push({ ...spu, qty: spuQty });
          if (mpus[0] && a > 0) best.push({ ...mpus[0], qty: a });
          if (mpus[1] && b > 0) best.push({ ...mpus[1], qty: b });
          if (mpus[2] && c > 0) best.push({ ...mpus[2], qty: c });
        }
      }
    }
  }

  // Also try SPU-only
  if (spu) {
    const allSpuCost = totalDets * spu.price;
    if (allSpuCost < bestCost) {
      bestCost = allSpuCost;
      best = [{ ...spu, qty: totalDets }];
    }
  }

  if (!best || bestCost === Infinity) return null;

  return {
    controllers: best.map(m => ({
      id: m.id,
      name: m.name,
      code: m.code,
      qty: m.qty,
      price: m.price,
      channels: m.channels,
      maxPower: m.maxPower,
      cap: m.cap,
    })),
    total: bestCost,
  };
}

// ─── Scoring (F12) ───────────────────────────────────────────────────────────

interface ScoreBreakdown {
  tierPriority: number;
  applicationFit: number;
  outputMatch: number;
  simplicity: number;
  maintenanceCost: number;
  featureRichness: number;
  total: number;
}

function scoreProduct(product: ProductEntry, input: SelectionInput): ScoreBreakdown {
  const family = getFamily(product);
  let score = 0;

  // 1. Tier priority
  const tier = getProductTier(product);
  const tierBonus = TIER_SCORE[tier] ?? 1;
  score += tierBonus;

  // 2. Application fit — use DB config if available, fallback to hardcoded
  const appFamilies = input.appProductFamilies ?? APP_DEFAULTS[input.zoneType]?.products;
  const appFit = appFamilies?.includes(family) ? 3 : 1;
  score += appFit;

  // 3. Output match
  let outMatch = 1;
  const req = input.outputRequired;
  const needsModbus = req === 'modbus' || req === 'relay_analog_modbus';
  const needsAnalog = req === '420mA' || req === '010V' || req === '210V' || req === 'relay_analog_modbus' || req === 'relay_dual_analog';
  const needsRelay = req === 'relay';

  if (needsModbus && product.modbus) outMatch = 3;
  else if (needsAnalog && product.analog) outMatch = 3;
  else if (needsRelay && product.relay > 0) outMatch = 3;
  else if (!needsModbus && !needsAnalog && !needsRelay) outMatch = 2; // "any"

  score += outMatch;

  // 4. Simplicity
  const simp = product.standalone ? 2 : 1;
  score += simp;

  // 5. Maintenance cost (sensor life)
  const techLife: Record<string, number> = { IR: 2, IONIC: 2, SC: 1, EC: 0, pH: 1 };
  const maint = techLife[product.sensorTech ?? ''] ?? 0;
  score += maint;

  // 6. Feature richness
  let features = 0;
  if (product.modbus) features++;
  if (product.analog) features++;
  if (product.atex && input.zoneAtex) features++;     // ATEX bonus only when ATEX required
  if (product.atex && !input.zoneAtex) features--;    // Penalize ATEX when not needed (costlier)
  if (family === 'MIDI') features += 2;
  if (family === 'X5') features += 2;
  if (product.remote) features++;
  score += features;

  return {
    tierPriority: tierBonus,
    applicationFit: appFit,
    outputMatch: outMatch,
    simplicity: simp,
    maintenanceCost: maint,
    featureRichness: features,
    total: score,
  };
}

// ─── BOM Builder ─────────────────────────────────────────────────────────────

function buildTierBom(
  detector: ProductEntry,
  totalDets: number,
  input: SelectionInput,
  controllers: ProductEntry[],
): {
  controller: TierSolution['controller'];
  controllerSpecs: TierSolution['controllerSpecs'];
  powerAccessories: BomLine[];
  alertAccessories: BomLine[];
  mountingAccessories: BomLine[];
  serviceTools: BomLine[];
  spareSensors: BomLine[];
  mpuCount: number;
  controllerCost: number;
  bomTrace: BomFunctionTrace[];
} {
  const voltage = input.sitePowerVoltage;
  const family = getFamily(detector);
  let controllerResult: ControllerComboResult | null = null;
  let controllerInfo: TierSolution['controller'] = null;
  let controllerSpecs: TierSolution['controllerSpecs'] = null;
  let mpuCount = 0;
  let controllerCost = 0;

  // Controller: only needed for non-standalone products
  if (!detector.standalone) {
    const detPower = detector.power ?? 2;
    controllerResult = f7_cheapestControllerCombo(totalDets, detPower, controllers, voltage, detector.connectTo);
    if (controllerResult && controllerResult.controllers.length > 0) {
      mpuCount = controllerResult.controllers.reduce((s, c) => s + c.qty, 0);
      controllerCost = controllerResult.total;

      // Pick the largest (last) controller for specs display
      const main = controllerResult.controllers[controllerResult.controllers.length - 1];
      // Find matching controller in input.controllers for full specs
      const matchedCtrl = controllers.find(c => c.code === main.code);

      controllerInfo = {
        code: main.code,
        name: main.name,
        qty: mpuCount,
        channels: main.channels,
        maxPower: main.maxPower,
        price: main.price,
        subtotal: controllerCost,
      };

      controllerSpecs = {
        voltage: matchedCtrl?.voltage ?? (voltage === '230V' ? '230V AC' : '24V AC/DC'),
        powerToSensors: main.maxPower,
        relayOutputs: matchedCtrl?.relay ?? null,
        ip: matchedCtrl?.ip ?? 'IP20',
        analogIn: matchedCtrl?.analog ?? null,
        analogOut: null,
        rs485: matchedCtrl?.modbus ?? false,
        displayType: null,
        tempRange: '-10 to +55C',
        mounting: 'DIN rail or wall',
        cableMax: '500m per channel',
        failsafe: true,
        features: matchedCtrl?.features ?? null,
      };
    }
  }

  // ── DB-driven accessory selection ──────────────────────────────────────
  // Filter accessories by subCategory + compatibleFamilies matching detector family
  const allAccessories = input.accessories || [];

  function isCompatible(acc: ProductEntry): boolean {
    const cf = acc.compatibleFamilies || [];
    return cf.includes('ALL') || cf.includes(family);
  }

  // F10: Power accessories (subCategory=power, compatible with detector family)
  const powerAccessories: BomLine[] = [];
  if (voltage === '230V') {
    // Exclude socket 230V (40-420) — it's added per alert in F11, not per detector
    const powerAccs = allAccessories.filter(a => a.subCategory === 'power' && isCompatible(a) && a.code !== '40-420');
    if (powerAccs.length > 0) {
      for (const pa of powerAccs) {
        powerAccessories.push({
          code: pa.code, name: pa.name, qty: totalDets, price: pa.price,
          subtotal: totalDets * pa.price,
          reason: `1 per detector — ${pa.name} (230V site)`,
        });
      }
    } else if (isMidiFamily(detector)) {
      // Fallback: hardcoded MIDI Power Adapter if not found in DB
      powerAccessories.push({
        code: '4000-0002', name: 'Power Adapter 230V-24V', qty: totalDets,
        price: POWER_ADAPTER_PRICE, subtotal: totalDets * POWER_ADAPTER_PRICE,
        reason: `1 per MIDI detector — Power Adapter (230V site, fallback)`,
      });
    }
  }

  // F11: Alert accessories — auto-included per EN 378
  const alertAccessories: BomLine[] = [];
  {
    const alertAccs = allAccessories.filter(a => a.subCategory === 'alert' && isCompatible(a));
    // Pick the selected one or default to first combined (FL-RL-R)
    const alertKey = (input.alertAccessory && input.alertAccessory !== 'none') ? input.alertAccessory : 'fl_rl_r';
    let selectedAlert = alertAccs.find(a => ALERT_ACCESSORIES.some(aa => aa.key === alertKey && aa.code === a.code));
    if (!selectedAlert) selectedAlert = alertAccs.find(a => a.code === '40-440'); // FL-RL-R default
    if (!selectedAlert && alertAccs.length > 0) selectedAlert = alertAccs[0];

    if (selectedAlert && selectedAlert.price > 0) {
      const alertQty = mpuCount > 0 ? mpuCount : (detector.standalone ? totalDets : 0);
      if (alertQty > 0) {
        alertAccessories.push({
          code: selectedAlert.code, name: selectedAlert.name, qty: alertQty,
          price: selectedAlert.price, subtotal: alertQty * selectedAlert.price,
          reason: mpuCount > 0 ? '1 per controller (EN 378)' : '1 per detector — standalone (EN 378)',
        });
        // 230V socket for alert
        if (voltage === '230V') {
          const sock230 = allAccessories.find(a => a.code === '40-420');
          if (sock230) {
            alertAccessories.push({
              code: sock230.code, name: sock230.name, qty: alertQty,
              price: sock230.price, subtotal: alertQty * sock230.price,
              reason: '230V site — required per alert',
            });
          }
        }
      }
    }
  }

  // F13: Mounting accessories (subCategory=mounting, compatible with detector family)
  const mountingAccessories: BomLine[] = [];
  {
    const mountAccs = allAccessories.filter(a => a.subCategory === 'mounting' && isCompatible(a) && a.code !== '40-415' && a.code !== '40-420' && a.code !== '40-420-ND');
    for (const ma of mountAccs) {
      mountingAccessories.push({
        code: ma.code, name: ma.name, qty: totalDets, price: ma.price,
        subtotal: totalDets * ma.price,
        reason: `1 per detector — ${ma.name} (recommended)`,
      });
    }
  }

  // F14: Service tools (subCategory=service, compatible with detector family) — 1 per project
  const serviceTools: BomLine[] = [];
  {
    const serviceAccs = allAccessories.filter(a => a.subCategory === 'service' && isCompatible(a));
    for (const sa of serviceAccs) {
      serviceTools.push({
        code: sa.code, name: sa.name, qty: 1, price: sa.price,
        subtotal: sa.price,
        reason: `${sa.name} — 1 per project (recommended)`,
      });
    }
  }

  // F15: Spare sensors (subCategory=spare, compatible with detector family + gas match)
  const spareSensors: BomLine[] = [];
  {
    const spareAccs = allAccessories.filter(a => a.subCategory === 'spare' && isCompatible(a));
    // Filter calibration gas by detector gas group
    const gasGroup = detector.gas?.[0] ?? '';
    for (const sp of spareAccs) {
      // Gas-specific calibration gas: check name contains the gas type
      const spName = sp.name.toUpperCase();
      const isGasMatch = spName.includes('HFC') && (gasGroup === 'HFC1' || gasGroup === 'HFC2')
        || spName.includes('NH3') && gasGroup === 'NH3'
        || spName.includes('HC') && !spName.includes('HFC') && gasGroup === 'R290'
        || !spName.includes('CALIBRATION GAS'); // non-gas items always included (e.g. X5 Kit)
      if (isGasMatch) {
        spareSensors.push({
          code: sp.code, name: sp.name, qty: 1, price: sp.price,
          subtotal: sp.price,
          reason: `${sp.name} — 1 per project`,
        });
      }
    }
  }

  // Build BOM trace
  const tierLabel = detector.standalone ? 'standalone' : 'controller';
  const bomTrace: BomFunctionTrace[] = [
    {
      name: 'F7_controller', tier: tierLabel, applied: !detector.standalone && controllerInfo !== null,
      reason: detector.standalone ? 'Standalone — no controller needed' : `${mpuCount} controller(s) selected via connectTo: ${detector.connectTo || 'any'}`,
      items: controllerInfo ? [{ code: controllerInfo.code, name: controllerInfo.name, qty: controllerInfo.qty, subtotal: controllerCost }] : [],
    },
    {
      name: 'F10_power', tier: tierLabel, applied: powerAccessories.length > 0,
      reason: powerAccessories.length > 0 ? '230V MIDI needs Power Adapter' : `No power adapter needed (${input.sitePowerVoltage})`,
      items: powerAccessories.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })),
    },
    {
      name: 'F11_alert', tier: tierLabel, applied: alertAccessories.length > 0,
      reason: 'EN 378 — audible+visual alarm required',
      items: alertAccessories.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })),
    },
    {
      name: 'F13_mounting', tier: tierLabel, applied: mountingAccessories.length > 0,
      reason: mountingAccessories.length > 0 ? `${family} wall mount — back-box recommended` : 'No mounting accessories for this family',
      items: mountingAccessories.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })),
    },
    {
      name: 'F14_service', tier: tierLabel, applied: serviceTools.length > 0,
      reason: serviceTools.length > 0 ? `${family} — DT300 + calibration adapter recommended` : 'No service tools for this family',
      items: serviceTools.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })),
    },
    {
      name: 'F15_spares', tier: tierLabel, applied: spareSensors.length > 0,
      reason: spareSensors.length > 0 ? `Calibration gas for ${detector.gas?.[0] ?? 'unknown'}` : 'No spare sensors for this family/gas',
      items: spareSensors.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })),
    },
  ];

  return {
    controller: controllerInfo, controllerSpecs,
    powerAccessories, alertAccessories, mountingAccessories,
    serviceTools, spareSensors,
    mpuCount, controllerCost, bomTrace,
  };
}

// ─── Tier Assignment ─────────────────────────────────────────────────────────

function buildSolution(
  tierLabel: 'PREMIUM' | 'STANDARD' | 'CENTRALIZED',
  detector: ProductEntry,
  totalDets: number,
  input: SelectionInput,
  controllers: ProductEntry[],
  scoring: ScoreBreakdown,
): { solution: TierSolution; bomTrace: BomFunctionTrace[] } {
  const bom = buildTierBom(detector, totalDets, input, controllers);

  const detSubtotal = detector.price * totalDets;
  const powerCost = bom.powerAccessories.reduce((s, a) => s + a.subtotal, 0);
  const alertCost = bom.alertAccessories.reduce((s, a) => s + a.subtotal, 0);
  const mountCost = bom.mountingAccessories.reduce((s, a) => s + a.subtotal, 0);
  // Service tools & spare sensors are informational only — excluded from proposal total
  const totalBom = detSubtotal + bom.controllerCost + powerCost + alertCost + mountCost;

  // Tag each bomTrace entry with the actual tier label
  const taggedBomTrace = bom.bomTrace.map(bt => ({ ...bt, tier: tierLabel }));

  return { bomTrace: taggedBomTrace, solution: {
    tier: tierLabel,
    label: tierLabel === 'PREMIUM' ? 'Best technology' : tierLabel === 'STANDARD' ? 'Balanced' : 'With controller',
    solutionScore: scoring.total,
    detector: {
      code: detector.code,
      name: detector.name,
      qty: totalDets,
      price: detector.price,
      gas: (detector.gas ?? []).join(', '),
      range: detector.range,
      sensorTech: detector.sensorTech,
      sensorLife: detector.sensorLife,
      ip: detector.ip,
      tempMin: detector.tempMin,
      tempMax: detector.tempMax,
    },
    detectorSpecs: {
      power: detector.power,
      voltage: detector.voltage,
      relays: detector.relay,
      relaySpec: null,
      analog: detector.analog,
      analogType: null,
      modbus: detector.modbus,
      modbusType: null,
      connectTo: detector.connectTo,
      features: detector.features,
    },
    controller: bom.controller,
    controllerSpecs: bom.controllerSpecs,
    powerAccessories: bom.powerAccessories,
    mountingAccessories: bom.mountingAccessories,
    alertAccessories: bom.alertAccessories,
    serviceTools: bom.serviceTools,
    spareSensors: bom.spareSensors,
    totalBom,
  }};
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function selectProducts(input: SelectionInput): SelectionResult {
  const {
    totalDetectors,
    selectedRefrigerant,
    selectedRange,
    zoneType,
    zoneAtex,
    outputRequired,
    sitePowerVoltage,
    projectCountry,
    products,
    controllers,
  } = input;

  // ── Filter pipeline: F0 → F1 → F2 → F3 → F3b → F4 → F9 ──
  const filterPipeline: FilterStep[] = [];

  function traceFilter(name: string, before: ProductEntry[], after: ProductEntry[]): ProductEntry[] {
    const eliminated = before.filter(p => !after.includes(p));
    filterPipeline.push({
      name,
      inputCount: before.length,
      outputCount: after.length,
      eliminated: eliminated.length,
      eliminatedProducts: eliminated.slice(0, 10).map(p => p.code),
    });
    return after;
  }

  let pool = [...products];
  pool = traceFilter('F0_application', pool, f0_application(pool, zoneType, input.appProductFamilies));
  pool = traceFilter('F1_country', pool, f1_country(pool, projectCountry));
  pool = traceFilter('F2_atex', pool, f2_atex(pool, zoneAtex));
  pool = traceFilter('F3_refrigerant', pool, f3_refrigerant(pool, selectedRefrigerant));
  pool = traceFilter('F3b_range', pool, f3b_range(pool, selectedRange, selectedRefrigerant));
  pool = traceFilter('F4_output', pool, f4_output(pool, outputRequired));
  pool = traceFilter('F5_mounting', pool, f5_mounting(pool, input.mountingType));
  pool = traceFilter('F8_temperature', pool, f8_temperature(pool));
  pool = traceFilter('F9_power', pool, f9_power(pool, sitePowerVoltage));

  // Price filter
  const beforePrice = pool;
  pool = pool.filter(p => p.price > 0);
  traceFilter('F_price>0', beforePrice, pool);

  // ── Score all remaining products ──
  const scored = pool
    .map(p => ({
      product: p,
      score: scoreProduct(p, input),
      tier: getProductTier(p),
    }));

  // ── Pick 3 solutions: Autonome, Économique, Centralisée ──

  // AUTONOME: standalone products, best score
  const autonomeCandidates = scored
    .filter(s => s.product.standalone)
    .sort((a, b) => b.score.total - a.score.total);

  // ÉCONOMIQUE: ALL products (standalone or not), cheapest total cost
  const economiqueCandidates = [...scored]
    .sort((a, b) => {
      const aCost = estimateTotalCost(a.product, totalDetectors, input, controllers);
      const bCost = estimateTotalCost(b.product, totalDetectors, input, controllers);
      return aCost - bCost || b.score.total - a.score.total;
    });

  // CENTRALISÉE: non-standalone + MPU (multi-channel controller), only if totalDetectors > 1
  const centralizedCandidates = totalDetectors > 1
    ? scored
        .filter(s => !s.product.standalone)
        .sort((a, b) => {
          const aCost = estimateTotalCost(a.product, totalDetectors, input, controllers);
          const bCost = estimateTotalCost(b.product, totalDetectors, input, controllers);
          return aCost - bCost || b.score.total - a.score.total;
        })
    : [];

  const usedIds = new Set<string>();
  const tierPicks: TierPickTrace[] = [];

  let premiumSolution: TierSolution | null = null;
  let standardSolution: TierSolution | null = null;
  let centralizedSolution: TierSolution | null = null;
  const allBomTraces: BomFunctionTrace[] = [];

  // Pick AUTONOME (best standalone by score)
  const autoPick = autonomeCandidates[0];
  if (autoPick) {
    usedIds.add(autoPick.product.id);
    const r = buildSolution('PREMIUM', autoPick.product, totalDetectors, input, controllers, autoPick.score);
    premiumSolution = r.solution; allBomTraces.push(...r.bomTrace);
  }
  tierPicks.push({
    tier: 'PREMIUM',
    candidateCount: autonomeCandidates.length,
    candidates: autonomeCandidates.slice(0, 5).map(s => ({ id: s.product.id, code: s.product.code, score: s.score.total, price: s.product.price })),
    picked: autoPick?.product.id ?? null,
    reason: autoPick ? `Best standalone by score (${autoPick.score.total}/21)` : 'No standalone products after filters',
  });

  // Pick ÉCONOMIQUE (cheapest total cost, must be STRICTLY cheaper than autonome)
  const autoCostRef = autoPick ? estimateTotalCost(autoPick.product, totalDetectors, input, controllers) : Infinity;
  // Find the cheapest product that is strictly cheaper than autonome
  let ecoPick: typeof economiqueCandidates[0] | undefined;
  if (autoCostRef < Infinity) {
    for (const s of economiqueCandidates) {
      if (s.product.id === autoPick?.product.id) continue;
      const ecoCost = estimateTotalCost(s.product, totalDetectors, input, controllers);
      if (ecoCost >= autoCostRef) continue; // skip if not cheaper
      ecoPick = s;
      break;
    }
    // If no cheaper alternative found, ecoPick stays undefined → no éco solution shown
  } else {
    // No autonome → pick cheapest overall
    ecoPick = economiqueCandidates[0];
  }
  if (ecoPick) {
    usedIds.add(ecoPick.product.id);
    const r = buildSolution('STANDARD', ecoPick.product, totalDetectors, input, controllers, ecoPick.score);
    standardSolution = r.solution; allBomTraces.push(...r.bomTrace);
  }
  tierPicks.push({
    tier: 'STANDARD',
    candidateCount: economiqueCandidates.length,
    candidates: economiqueCandidates.slice(0, 5).map(s => ({ id: s.product.id, code: s.product.code, score: s.score.total, price: s.product.price })),
    picked: ecoPick?.product.id ?? null,
    reason: ecoPick ? `Cheapest total cost (score ${ecoPick.score.total}/21)` : 'No products after filters',
  });

  // Pick CENTRALISÉE (non-standalone + MPU, different from above)
  const ctrlPick = centralizedCandidates.find(s => !usedIds.has(s.product.id));
  if (ctrlPick) {
    usedIds.add(ctrlPick.product.id);
    const r3 = buildSolution('CENTRALIZED', ctrlPick.product, totalDetectors, input, controllers, ctrlPick.score);
    centralizedSolution = r3.solution; allBomTraces.push(...r3.bomTrace);
  }
  tierPicks.push({
    tier: 'CENTRALIZED',
    candidateCount: centralizedCandidates.length,
    candidates: centralizedCandidates.slice(0, 5).map(s => ({ id: s.product.id, code: s.product.code, score: s.score.total, price: s.product.price })),
    picked: ctrlPick?.product.id ?? null,
    reason: ctrlPick ? `Cheapest centralized with MPU (score ${ctrlPick.score.total}/21)` : (totalDetectors <= 1 ? 'Only 1 detector — centralized not applicable' : 'No non-standalone products after filters'),
  });

  // Fallback: if autonome is empty, pick best remaining
  if (!premiumSolution) {
    const fallback = scored.sort((a, b) => b.score.total - a.score.total).find(s => !usedIds.has(s.product.id));
    if (fallback) {
      usedIds.add(fallback.product.id);
      const rf1 = buildSolution('PREMIUM', fallback.product, totalDetectors, input, controllers, fallback.score);
      premiumSolution = rf1.solution; allBomTraces.push(...rf1.bomTrace);
      tierPicks[0].picked = fallback.product.id;
      tierPicks[0].reason = `Fallback: best remaining by score (${fallback.score.total}/21)`;
    }
  }
  if (!standardSolution) {
    // Only fallback if there's no autonome to compare against, or if fallback is strictly cheaper
    const fallback = scored.sort((a, b) => a.product.price - b.product.price).find(s => {
      if (usedIds.has(s.product.id)) return false;
      if (autoCostRef < Infinity) {
        const fbCost = estimateTotalCost(s.product, totalDetectors, input, controllers);
        if (fbCost >= autoCostRef) return false;
      }
      return true;
    });
    if (fallback) {
      usedIds.add(fallback.product.id);
      const rf2 = buildSolution('STANDARD', fallback.product, totalDetectors, input, controllers, fallback.score);
      standardSolution = rf2.solution; allBomTraces.push(...rf2.bomTrace);
      tierPicks[1].picked = fallback.product.id;
      tierPicks[1].reason = `Fallback: cheapest remaining (${fallback.product.price} EUR)`;
    }
  }

  // ── Build trace ──
  const scoredTrace: ScoredCandidate[] = scored.map(s => ({
    id: s.product.id,
    code: s.product.code,
    name: s.product.name,
    tier: s.tier,
    family: getFamily(s.product),
    score: s.score,
    price: s.product.price,
    standalone: s.product.standalone,
  }));

  const trace: SelectionTrace = {
    filterPipeline,
    afterFilters: pool.length,
    scored: scoredTrace,
    tierPicks,
    bomFunctions: allBomTraces,
  };

  // ── Build comparison table ──
  const comparison = buildComparisonTable(premiumSolution, standardSolution, centralizedSolution);

  return {
    tiers: {
      premium: premiumSolution,
      standard: standardSolution,
      centralized: centralizedSolution,
    },
    comparison,
    trace,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function estimateTotalCost(
  detector: ProductEntry,
  totalDets: number,
  input: SelectionInput,
  controllers: ProductEntry[],
): number {
  let cost = detector.price * totalDets;

  // Controller cost for non-standalone
  if (!detector.standalone) {
    const combo = f7_cheapestControllerCombo(totalDets, detector.power ?? 2, controllers, input.sitePowerVoltage, detector.connectTo);
    if (combo) cost += combo.total;
  }

  // Power adapter for MIDI on 230V
  if (input.sitePowerVoltage === '230V' && isMidiFamily(detector)) {
    cost += totalDets * POWER_ADAPTER_PRICE;
  }

  return cost;
}

function buildComparisonTable(
  premium: TierSolution | null,
  standard: TierSolution | null,
  centralized: TierSolution | null,
): ComparisonTable {
  const val = (t: TierSolution | null, fn: (t: TierSolution) => string): string =>
    t ? fn(t) : '—';

  const rows = [
    {
      label: 'Detector',
      premium: val(premium, t => t.detector.name),
      standard: val(standard, t => t.detector.name),
      centralized: val(centralized, t => t.detector.name),
    },
    {
      label: 'Qty',
      premium: val(premium, t => `${t.detector.qty}`),
      standard: val(standard, t => `${t.detector.qty}`),
      centralized: val(centralized, t => `${t.detector.qty}`),
    },
    {
      label: 'Sensor Tech',
      premium: val(premium, t => t.detector.sensorTech ?? '—'),
      standard: val(standard, t => t.detector.sensorTech ?? '—'),
      centralized: val(centralized, t => t.detector.sensorTech ?? '—'),
    },
    {
      label: 'Sensor Life',
      premium: val(premium, t => t.detector.sensorLife ?? '—'),
      standard: val(standard, t => t.detector.sensorLife ?? '—'),
      centralized: val(centralized, t => t.detector.sensorLife ?? '—'),
    },
    {
      label: 'Controller',
      premium: val(premium, t => t.controller ? `${t.controller.qty}x ${t.controller.name}` : 'None (standalone)'),
      standard: val(standard, t => t.controller ? `${t.controller.qty}x ${t.controller.name}` : 'None (standalone)'),
      centralized: val(centralized, t => t.controller ? `${t.controller.qty}x ${t.controller.name}` : 'None (standalone)'),
    },
    {
      label: 'Score',
      premium: val(premium, t => `${t.solutionScore}/21`),
      standard: val(standard, t => `${t.solutionScore}/21`),
      centralized: val(centralized, t => `${t.solutionScore}/21`),
    },
    {
      label: 'Total BOM',
      premium: val(premium, t => `${t.totalBom.toLocaleString()} EUR`),
      standard: val(standard, t => `${t.totalBom.toLocaleString()} EUR`),
      centralized: val(centralized, t => `${t.totalBom.toLocaleString()} EUR`),
    },
  ];

  // Recommendation: highest score, or cheapest if tied
  const tiers = [
    { key: 'premium' as const, sol: premium },
    { key: 'standard' as const, sol: standard },
    { key: 'centralized' as const, sol: centralized },
  ].filter(t => t.sol !== null);

  let rec: 'premium' | 'standard' | 'centralized' = 'premium';
  let recReason = 'Best technology and features';

  if (tiers.length > 0) {
    tiers.sort((a, b) => {
      const as = a.sol!.solutionScore;
      const bs = b.sol!.solutionScore;
      if (as !== bs) return bs - as;
      return a.sol!.totalBom - b.sol!.totalBom;
    });
    rec = tiers[0].key;
    const best = tiers[0].sol!;
    if (best.solutionScore >= 15) {
      recReason = `Highest score (${best.solutionScore}/21) with best technology`;
    } else {
      recReason = `Best balance of score (${best.solutionScore}/21) and price`;
    }
  }

  return { rows, recommendation: rec, recommendationReason: recReason };
}
