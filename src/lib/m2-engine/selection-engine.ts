// selection-engine.ts — M2 Product Selection Engine V3
// Full filter pipeline F0-F9, 2x2 matrix output (4 solutions), scoring /21, controller combo
// Adapted from DetectBuilder for SafeRef
//
// ─── NEW API (V2) — use SystemDesigner for new consumers ───────────────────────
// The legacy selectProducts() function below is kept for backwards compatibility.
// New code should use SystemDesigner directly:
//
//   import { SystemDesigner } from '@/lib/m2-engine/selection-engine';
//   const designer = new SystemDesigner(products);
//   const solutions = designer.generate({ gas, atex, voltage, location, outputs, measType, points });
//
export { SystemDesigner } from './designer';
export type { DesignerInputs, Solution, ProductV2, BomComponent } from './designer-types';
// ──────────────────────────────────────────────────────────────────────────────

import type {
  SelectionInput,
  SelectionResult,
  SelectionTrace,
  FilterStep,
  ScoredCandidate,
  TierPickTrace,
  BomFunctionTrace,
  TierSolution,
  TierKey,
  ProductEntry,
  BomLine,
  AlertAccessory,
  ComparisonTable,
} from '../engine-types';

import type { ProductRelation } from './relation-types';
import {
  getRelationsFor,
  conditionMatches,
  calculateQty,
} from './relation-types';
import { selectControllerFromRelations } from './select-controller';

// ─── Reference Data ──────────────────────────────────────────────────────────

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

export const APP_DEFAULT_RANGE: Record<string, Record<string, string>> = {
  machinery_room: { R717: '0-1000ppm', R744: '0-10000ppm' },
  cold_storage:   { R717: '0-100ppm', R744: '0-10000ppm' },
  ice_rink:       { R717: '0-500ppm', R744: '0-10000ppm' },
  supermarket:    { R744: '0-10000ppm' },
  cold_room:      { R744: '0-10000ppm' },
  parking:        { CO: '0-100ppm', NO2: '0-5ppm' },
};

const TIER_SCORE: Record<string, number> = { premium: 5, standard: 3, economic: 1 };

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

// ─── Alert Catalog (LEGACY — used as fallback when no relations provided) ────

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

// LEGACY — used as fallback when no relations provided; prefer actual product price from relations
const POWER_ADAPTER_PRICE = 99;

// ─── Family Detection ────────────────────────────────────────────────────────

function getFamily(p: ProductEntry): string {
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

function getSubFamily(p: ProductEntry): string {
  const name = p.name.toUpperCase();
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

function getProductTier(p: ProductEntry): string {
  if (p.tier === 'premium' || p.tier === 'economic') return p.tier;
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

function isMidiFamily(p: ProductEntry): boolean { return getFamily(p) === 'MIDI'; }
function isMpFamily(p: ProductEntry): boolean { return getFamily(p) === 'MP'; }
function isAquisFamily(p: ProductEntry): boolean { return getFamily(p) === 'AQUIS'; }

// ─── Filter Functions ────────────────────────────────────────────────────────

function f0_application(products: ProductEntry[], zoneType: string, appProductFamilies?: string[]): ProductEntry[] {
  if (appProductFamilies && appProductFamilies.length > 0) {
    const allowed = appProductFamilies.map(f => f.toUpperCase());
    return products.filter(p => {
      const family = getFamily(p).toUpperCase();
      const subFamily = getSubFamily(p).toUpperCase();
      return allowed.includes(family) || allowed.includes(subFamily);
    });
  }
  return products.filter(p => p.apps.includes(zoneType));
}

function f1_country(products: ProductEntry[], _country: string): ProductEntry[] {
  return products;
}

function f2_atex(products: ProductEntry[], atex: boolean): ProductEntry[] {
  if (!atex) return products;
  return products.filter(p => p.atex);
}

function f3_refrigerant(products: ProductEntry[], refrigerant: string): ProductEntry[] {
  return products.filter(p => p.refs.includes(refrigerant));
}

function f3b_range(products: ProductEntry[], range: string | undefined, refrigerant: string): ProductEntry[] {
  if (!range) return products;
  if (!REF_RANGES[refrigerant]) return products;
  const normalize = (s: string) => s.replace(/,/g, '').replace(/\s/g, '');
  const normalRange = normalize(range);
  const kept = products.filter(p => {
    const pRange = p.range ? normalize(p.range) : '';
    return pRange === normalRange;
  });
  return kept.length > 0 ? kept : products;
}

function f4_output(products: ProductEntry[], outputRequired: string): ProductEntry[] {
  if (outputRequired === 'any') return products;
  return products.filter(p => canDeliverOutput(p, outputRequired));
}

function canDeliverOutput(p: ProductEntry, req: string): boolean {
  const hasRelay = p.relay > 0;
  const hasAnalog = !!p.analog;

  switch (req) {
    case 'any': return true;
    case 'relay':
      return hasRelay && p.standalone;
    case '420mA':
      return (hasAnalog && p.analog !== 'to MPU') || getFamily(p) === 'TR';
    case '010V':
      return p.analog === 'selectable' || p.analog === '4-20mA/0-10V';
    case '210V':
      return p.analog === 'selectable';
    case 'modbus':
      return p.modbus;
    case 'relay_analog_modbus':
      return hasRelay && hasAnalog && p.modbus;
    case 'relay_dual_analog':
      return p.analog === '4-20mA x2';
    default:
      return true;
  }
}

function f5_mounting(products: ProductEntry[], mountingType: string): ProductEntry[] {
  if (!mountingType || mountingType === 'any') return products;

  // Detection Location logic:
  // 'ambient' → all detectors (integrated or remote, all mount on wall)
  // 'duct' → only detectors with remote sensor (remote=true) — needs duct sampling accessory
  // 'pipe_valve' → detectors with remote=true OR native pipe products (mount includes 'pipe')
  if (mountingType === 'ambient') {
    // All detectors can detect in ambient air
    return products;
  }

  if (mountingType === 'duct') {
    // Duct detection requires MIDI remote sensor + duct sampling accessory
    // X5 remote stays ambient-only — not suitable for duct
    const filtered = products.filter(p => p.remote === true && p.family === 'MIDI');
    return filtered.length > 0 ? filtered : products;
  }

  if (mountingType === 'pipe_valve' || mountingType === 'pipe') {
    // Pipe mounting requires remote sensor head (MIDI remote) + pipe adapter accessory
    // Native pipe products (e.g. Aquis) also qualify
    const filtered = products.filter(p => {
      if (p.remote === true && p.family === 'MIDI') return true;
      if (p.mount && p.mount.includes('pipe')) return true;
      return false;
    });
    return filtered.length > 0 ? filtered : products;
  }

  // Fallback for any legacy values
  const filtered = products.filter(p => {
    if (!p.mount || p.mount.length === 0) return true;
    return p.mount.includes(mountingType);
  });
  return filtered.length > 0 ? filtered : products;
}

function f8_temperature(products: ProductEntry[], tempMin?: number, tempMax?: number): ProductEntry[] {
  if (tempMin === undefined && tempMax === undefined) return products;
  return products.filter(p => {
    if (tempMin !== undefined && p.tempMin !== null && p.tempMin > tempMin) return false;
    if (tempMax !== undefined && p.tempMax !== null && p.tempMax < tempMax) return false;
    return true;
  });
}

function f9_power(products: ProductEntry[], voltage: '12V' | '24V' | '230V'): ProductEntry[] {
  if (voltage === '24V') {
    return products.filter(p => p.voltage !== '230V');
  }
  if (voltage === '230V') {
    return products.filter(p => {
      if (isMidiFamily(p)) return true;
      if (isMpFamily(p)) return true;
      if (isAquisFamily(p)) return true;
      if (p.voltage && p.voltage.includes('230')) return true;
      return false;
    });
  }
  if (voltage === '12V') {
    const MIN_VOLTAGE: Record<string, number> = {
      MIDI: 15, X5: 18, RM: 12, G: 12, TR: 12, MP: 24, AQUIS: 230,
    };
    return products.filter(p => {
      if (p.voltage === '230V') return false;
      if (p.voltage === 'MPU') return false;
      const family = getFamily(p);
      const minV = MIN_VOLTAGE[family] ?? 24;
      return minV <= 12;
    });
  }
  return products;
}

// ─── Controller Combo (F7) ───────────────────────────────────────────────────

interface ControllerComboEntry {
  id: string; name: string; code: string;
  channels: number; maxPower: number; price: number; qty: number; cap: number;
}

interface ControllerComboResult {
  controllers: { id: string; name: string; code: string; qty: number; price: number; channels: number; maxPower: number; cap: number }[];
  total: number;
}

function f7_cheapestControllerCombo(
  totalDets: number,
  detectorPower: number,
  controllers: ProductEntry[],
  voltage: string,
  connectTo?: string | null,
): ControllerComboResult | null {
  if (totalDets <= 0) return null;

  const is230 = voltage === '230V';

  const types: { id: string; name: string; code: string; channels: number; maxPower: number; price: number; cap: number }[] = [];

  for (const ctrl of controllers) {
    if (!ctrl.channels || ctrl.channels <= 0) continue;
    if (ctrl.price <= 0) continue;
    if (connectTo) {
      const compat = connectTo.toUpperCase();
      const ctrlId = ctrl.name.toUpperCase();
      const knownTypes = ['MPU', 'SPU', 'SPLS'];
      const ctrlType = knownTypes.find(t => ctrlId.includes(t));
      if (ctrlType && !compat.includes(ctrlType)) continue;
      if (!ctrlType) continue;
    }
    const ctrlName = ctrl.name.toUpperCase();
    if (is230 && ctrlName.includes('24') && !ctrlName.includes('230')) continue;
    if (!is230 && ctrlName.includes('230')) continue;

    types.push({
      id: ctrl.code, name: ctrl.name, code: ctrl.code,
      channels: ctrl.channels, maxPower: ctrl.maxPower ?? 10,
      price: ctrl.price, cap: 0,
    });
  }

  // Fallback defaults if DB is empty
  if (types.length === 0) {
    types.push(
      { id: is230 ? 'SPU230' : 'SPU24', name: is230 ? 'SPU230' : 'SPU24', code: is230 ? '20-355' : '20-350', channels: 1, maxPower: 10, price: is230 ? 455 : 424, cap: 0 },
      { id: 'MPU2C', name: 'MPU2C', code: '20-310', channels: 2, maxPower: 10, price: 1168, cap: 0 },
      { id: 'MPU4C', name: 'MPU4C', code: '20-300', channels: 4, maxPower: 10, price: 1598, cap: 0 },
      { id: 'MPU6C', name: 'MPU6C', code: '20-305', channels: 6, maxPower: 10, price: 2004, cap: 0 },
    );
  }

  const dpw = detectorPower || 2;
  const caps = types
    .map(m => ({ ...m, cap: Math.min(m.channels, Math.floor(m.maxPower / dpw)) }))
    .filter(m => m.cap > 0);

  if (!caps.length) return null;

  const spuOptions = caps.filter(c => c.channels === 1).sort((a, b) => a.price - b.price);
  const spu = spuOptions[0] ?? null;
  const mpus = caps.filter(c => c.channels > 1);

  let best: ControllerComboEntry[] | null = null;
  let bestCost = Infinity;

  const mxM = mpus.map(c => Math.ceil(totalDets / c.cap) + 1);

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

  // Try SPU-only
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
      id: m.id, name: m.name, code: m.code, qty: m.qty,
      price: m.price, channels: m.channels, maxPower: m.maxPower, cap: m.cap,
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

  const tier = getProductTier(product);
  const tierBonus = TIER_SCORE[tier] ?? 1;
  score += tierBonus;

  const appFamilies = input.appProductFamilies ?? APP_DEFAULTS[input.zoneType]?.products;
  const appFit = appFamilies?.includes(family) ? 3 : 1;
  score += appFit;

  let outMatch = 1;
  const req = input.outputRequired;
  const needsModbus = req === 'modbus' || req === 'relay_analog_modbus';
  const needsAnalog = req === '420mA' || req === '010V' || req === '210V' || req === 'relay_analog_modbus' || req === 'relay_dual_analog';
  const needsRelay = req === 'relay';
  if (needsModbus && product.modbus) outMatch = 3;
  else if (needsAnalog && product.analog) outMatch = 3;
  else if (needsRelay && product.relay > 0) outMatch = 3;
  else if (!needsModbus && !needsAnalog && !needsRelay) outMatch = 2;
  score += outMatch;

  const simp = product.standalone ? 2 : 1;
  score += simp;

  const techLife: Record<string, number> = { IR: 2, IONIC: 2, SC: 1, EC: 0, pH: 1 };
  const maint = techLife[product.sensorTech ?? ''] ?? 0;
  score += maint;

  let features = 0;
  if (product.modbus) features++;
  if (product.analog) features++;
  if (product.atex && input.zoneAtex) features++;
  if (product.atex && !input.zoneAtex) features--;
  if (family === 'MIDI') features += 2;
  if (family === 'X5') features += 2;
  if (product.remote) features++;
  score += features;

  return { tierPriority: tierBonus, applicationFit: appFit, outputMatch: outMatch, simplicity: simp, maintenanceCost: maint, featureRichness: features, total: score };
}

// ─── BOM Builder ─────────────────────────────────────────────────────────────

function buildTierBom(
  detector: ProductEntry,
  totalDets: number,
  input: SelectionInput,
  controllers: ProductEntry[],
  skipController = false,
): {
  controller: TierSolution['controller'];
  controllerSpecs: TierSolution['controllerSpecs'];
  baseUnit: BomLine | null;
  powerAccessories: BomLine[];
  alertAccessories: BomLine[];
  mountingAccessories: BomLine[];
  serviceTools: BomLine[];
  spareSensors: BomLine[];
  suggestedAccessories: BomLine[];
  mpuCount: number;
  controllerCost: number;
  bomTrace: BomFunctionTrace[];
} {
  const voltage = input.sitePowerVoltage;
  const family = getFamily(detector);
  const relations = input.relations;
  const hasRelations = relations && relations.length > 0;
  let controllerInfo: TierSolution['controller'] = null;
  let controllerSpecs: TierSolution['controllerSpecs'] = null;
  let baseUnit: BomLine | null = null;
  let mpuCount = 0;
  let controllerCost = 0;

  // ─── Controller selection ─────────────────────────────────────────────
  // Two separate concerns:
  //   1. requires_base (e.g. X5 sensor → X5 Transmitter) — ALWAYS included, even in standalone tier
  //   2. compatible_controller (e.g. MIDI → Controller 10) — only in centralized tier (skipController = false)
  const hasCtrlRelations = hasRelations && getRelationsFor(relations, detector.code, 'compatible_controller').length > 0;
  const hasBaseRelations = hasRelations && getRelationsFor(relations, detector.code, 'requires_base').length > 0;
  const needsController = !skipController && (!detector.standalone || hasCtrlRelations);

  if (hasBaseRelations || needsController) {
    if (hasRelations) {
      // ── Relation-based controller selection ──
      const relResult = selectControllerFromRelations(detector, totalDets, voltage, controllers, relations);

      // Add base unit (e.g. X5 transmitter) — ALWAYS, even for standalone tier
      if (relResult.base) {
        const baseSub = relResult.baseQty * relResult.base.price;
        baseUnit = {
          code: relResult.base.code, name: relResult.base.name,
          qty: relResult.baseQty, price: relResult.base.price,
          subtotal: baseSub,
          reason: `Required base unit for ${detector.code} (${relResult.baseQty} x ${relResult.base.channels ?? 1}ch)`,
        };
        controllerCost += baseSub;
        mpuCount += relResult.baseQty;
      }

      // Add centralized controller — only when NOT skipping controller
      if (!skipController && relResult.controller) {
        const ctrlSub = relResult.controllerQty * relResult.controller.price;
        controllerCost += ctrlSub;
        mpuCount += relResult.controllerQty;
        controllerInfo = {
          code: relResult.controller.code, name: relResult.controller.name,
          qty: relResult.controllerQty,
          channels: relResult.controller.channels, maxPower: relResult.controller.maxPower,
          price: relResult.controller.price, subtotal: ctrlSub,
        };
        controllerSpecs = {
          voltage: relResult.controller.voltage ?? (voltage === '230V' ? '230V AC' : '24V AC/DC'),
          powerToSensors: relResult.controller.maxPower,
          relayOutputs: relResult.controller.relay ?? null,
          ip: relResult.controller.ip ?? 'IP20',
          analogIn: relResult.controller.analog ?? null,
          analogOut: null, rs485: relResult.controller.modbus ?? false,
          displayType: null, tempRange: '-10 to +55C',
          mounting: 'DIN rail or wall', cableMax: '500m per channel',
          failsafe: true, features: relResult.controller.features ?? null,
        };
      } else if (relResult.base) {
        // Base acts as the "controller" for display purposes
        controllerInfo = {
          code: relResult.base.code, name: relResult.base.name,
          qty: relResult.baseQty,
          channels: relResult.base.channels, maxPower: relResult.base.maxPower,
          price: relResult.base.price, subtotal: relResult.baseQty * relResult.base.price,
        };
        controllerSpecs = {
          voltage: relResult.base.voltage ?? (voltage === '230V' ? '230V AC' : '24V AC/DC'),
          powerToSensors: relResult.base.maxPower,
          relayOutputs: relResult.base.relay ?? null,
          ip: relResult.base.ip ?? 'IP20',
          analogIn: relResult.base.analog ?? null,
          analogOut: null, rs485: relResult.base.modbus ?? false,
          displayType: null, tempRange: '-10 to +55C',
          mounting: 'DIN rail or wall', cableMax: '500m per channel',
          failsafe: true, features: relResult.base.features ?? null,
        };
      }
    } else {
      // ── Legacy controller selection (f7_cheapestControllerCombo) ──
      const detPower = detector.power ?? 2;
      const controllerResult = f7_cheapestControllerCombo(totalDets, detPower, controllers, voltage, detector.connectTo);
      if (controllerResult && controllerResult.controllers.length > 0) {
        mpuCount = controllerResult.controllers.reduce((s, c) => s + c.qty, 0);
        controllerCost = controllerResult.total;
        const main = controllerResult.controllers[controllerResult.controllers.length - 1];
        const matchedCtrl = controllers.find(c => c.code === main.code);

        controllerInfo = {
          code: main.code, name: main.name, qty: mpuCount,
          channels: main.channels, maxPower: main.maxPower,
          price: main.price, subtotal: controllerCost,
        };
        controllerSpecs = {
          voltage: matchedCtrl?.voltage ?? (voltage === '230V' ? '230V AC' : '24V AC/DC'),
          powerToSensors: main.maxPower,
          relayOutputs: matchedCtrl?.relay ?? null,
          ip: matchedCtrl?.ip ?? 'IP20',
          analogIn: matchedCtrl?.analog ?? null,
          analogOut: null, rs485: matchedCtrl?.modbus ?? false,
          displayType: null, tempRange: '-10 to +55C',
          mounting: 'DIN rail or wall', cableMax: '500m per channel',
          failsafe: true, features: matchedCtrl?.features ?? null,
        };
      }
    }
  }

  const allAccessories = input.accessories || [];
  function isCompatible(acc: ProductEntry): boolean {
    const cf = acc.compatibleFamilies || [];
    return cf.includes('ALL') || cf.includes(family);
  }

  const condCtx = { voltage, mount: input.mountingType, atex: input.zoneAtex };
  const qtyCounts = { detectors: totalDets, controllers: Math.max(1, mpuCount) };

  // ─── F10: Power accessories ───────────────────────────────────────────
  const powerAccessories: BomLine[] = [];
  if (hasRelations) {
    // Relation-based: query required_accessory with voltage condition
    const powerRels = getRelationsFor(relations, detector.code, 'required_accessory')
      .filter(r => conditionMatches(r.condition, condCtx));
    for (const rel of powerRels) {
      // Only include power-related accessories (condition contains voltage)
      if (rel.condition && rel.condition.startsWith('voltage:')) {
        const accProduct = allAccessories.find(a => a.code === rel.toCode);
        if (accProduct && accProduct.price > 0) {
          const qty = calculateQty(rel.qtyRule, qtyCounts);
          powerAccessories.push({
            code: accProduct.code, name: accProduct.name, qty, price: accProduct.price,
            subtotal: qty * accProduct.price,
            reason: rel.reason ?? `Required accessory for ${detector.code} (${rel.condition})`,
          });
        }
      }
    }
    // Also pick up unconditional required_accessory that are power subCategory
    const uncondPowerRels = getRelationsFor(relations, detector.code, 'required_accessory')
      .filter(r => !r.condition);
    for (const rel of uncondPowerRels) {
      const accProduct = allAccessories.find(a => a.code === rel.toCode && a.subCategory === 'power');
      if (accProduct && accProduct.price > 0 && !powerAccessories.some(p => p.code === accProduct.code)) {
        const qty = calculateQty(rel.qtyRule, qtyCounts);
        powerAccessories.push({
          code: accProduct.code, name: accProduct.name, qty, price: accProduct.price,
          subtotal: qty * accProduct.price,
          reason: rel.reason ?? `Required power accessory for ${detector.code}`,
        });
      }
    }
  } else {
    // Legacy power accessory logic
    if (voltage === '230V') {
      const powerAccs = allAccessories.filter(a => a.subCategory === 'power' && isCompatible(a) && a.code !== '40-420');
      if (powerAccs.length > 0) {
        for (const pa of powerAccs) {
          powerAccessories.push({
            code: pa.code, name: pa.name, qty: totalDets, price: pa.price,
            subtotal: totalDets * pa.price,
            reason: `1 per detector - ${pa.name} (230V site)`,
          });
        }
      } else if (isMidiFamily(detector)) {
        powerAccessories.push({
          code: '4000-0002', name: 'Power Adapter 230V-24V', qty: totalDets,
          price: POWER_ADAPTER_PRICE, subtotal: totalDets * POWER_ADAPTER_PRICE,
          reason: '1 per MIDI detector - Power Adapter (230V site, fallback)',
        });
      }
    }
  }

  // ─── F11: Alert accessories (EN 378) ──────────────────────────────────
  const alertAccessories: BomLine[] = [];
  if (hasRelations) {
    // Relation-based: query alert_device relations for this detector
    const alertRels = getRelationsFor(relations, detector.code, 'alert_device')
      .filter(r => conditionMatches(r.condition, condCtx));

    for (const rel of alertRels) {
      const alertProduct = allAccessories.find(a => a.code === rel.toCode);
      if (alertProduct && alertProduct.price > 0) {
        // Qty logic: if controller present → per_controller (alerts on controller); else per_detector (standalone)
        const effectiveQtyRule = mpuCount > 0 ? 'per_controller' : 'per_detector';
        const qty = calculateQty(effectiveQtyRule, qtyCounts);
        if (qty > 0) {
          alertAccessories.push({
            code: alertProduct.code, name: alertProduct.name, qty,
            price: alertProduct.price, subtotal: qty * alertProduct.price,
            reason: mpuCount > 0 ? '1 per controller — centralized alarm (EN 378)' : '1 per detector — standalone alarm (EN 378)',
          });
        }
      }
    }
    // 230V socket for alerts
    if (voltage === '230V' && alertAccessories.length > 0) {
      const sock230 = allAccessories.find(a => a.code === '40-420');
      if (sock230) {
        const alertQty = alertAccessories[0]?.qty ?? 1;
        alertAccessories.push({
          code: sock230.code, name: sock230.name, qty: alertQty,
          price: sock230.price, subtotal: alertQty * sock230.price,
          reason: '230V site - required per alert',
        });
      }
    }
  } else {
    // Legacy alert logic
    const alertAccs = allAccessories.filter(a => a.subCategory === 'alert' && isCompatible(a));
    const alertKey = (input.alertAccessory && input.alertAccessory !== 'none') ? input.alertAccessory : 'fl_rl_r';
    let selectedAlert = alertAccs.find(a => ALERT_ACCESSORIES.some(aa => aa.key === alertKey && aa.code === a.code));
    if (!selectedAlert) selectedAlert = alertAccs.find(a => a.code === '40-440');
    if (!selectedAlert && alertAccs.length > 0) selectedAlert = alertAccs[0];

    if (selectedAlert && selectedAlert.price > 0) {
      const alertQty = mpuCount > 0 ? mpuCount : (detector.standalone ? totalDets : 0);
      if (alertQty > 0) {
        alertAccessories.push({
          code: selectedAlert.code, name: selectedAlert.name, qty: alertQty,
          price: selectedAlert.price, subtotal: alertQty * selectedAlert.price,
          reason: mpuCount > 0 ? '1 per controller (EN 378)' : '1 per detector - standalone (EN 378)',
        });
        if (voltage === '230V') {
          const sock230 = allAccessories.find(a => a.code === '40-420');
          if (sock230) {
            alertAccessories.push({
              code: sock230.code, name: sock230.name, qty: alertQty,
              price: sock230.price, subtotal: alertQty * sock230.price,
              reason: '230V site - required per alert',
            });
          }
        }
      }
    }
  }

  // ─── F13: Mounting accessories ────────────────────────────────────────
  const mountingAccessories: BomLine[] = [];
  if (hasRelations) {
    // Relation-based: query required_accessory with mount condition
    const mountRels = getRelationsFor(relations, detector.code, 'required_accessory')
      .filter(r => {
        if (!r.condition) return false;
        if (r.condition.startsWith('mount:')) return conditionMatches(r.condition, condCtx);
        return false;
      });
    for (const rel of mountRels) {
      const accProduct = allAccessories.find(a => a.code === rel.toCode);
      if (accProduct && accProduct.price >= 0 && !powerAccessories.some(p => p.code === accProduct.code)) {
        const qty = calculateQty(rel.qtyRule, qtyCounts);
        mountingAccessories.push({
          code: accProduct.code, name: accProduct.name, qty, price: accProduct.price,
          subtotal: qty * accProduct.price,
          reason: rel.reason ?? `Mounting accessory for ${detector.code} (${rel.condition})`,
        });
      }
    }
    // Fallback: also include compatible mounting accessories from subCategory
    if (mountingAccessories.length === 0) {
      const mountAccs = allAccessories.filter(a => a.subCategory === 'mounting' && isCompatible(a) && a.code !== '40-415' && a.code !== '40-420' && a.code !== '40-420-ND');
      for (const ma of mountAccs) {
        mountingAccessories.push({
          code: ma.code, name: ma.name, qty: totalDets, price: ma.price,
          subtotal: totalDets * ma.price,
          reason: `1 per detector - ${ma.name} (recommended)`,
        });
      }
    }
  } else {
    // Legacy mounting logic
    const mountAccs = allAccessories.filter(a => a.subCategory === 'mounting' && isCompatible(a) && a.code !== '40-415' && a.code !== '40-420' && a.code !== '40-420-ND');
    for (const ma of mountAccs) {
      mountingAccessories.push({
        code: ma.code, name: ma.name, qty: totalDets, price: ma.price,
        subtotal: totalDets * ma.price,
        reason: `1 per detector - ${ma.name} (recommended)`,
      });
    }
  }

  // ─── F14: Service tools (1 per project) ───────────────────────────────
  const serviceTools: BomLine[] = [];
  {
    const serviceAccs = allAccessories.filter(a => a.subCategory === 'service' && isCompatible(a));
    for (const sa of serviceAccs) {
      serviceTools.push({
        code: sa.code, name: sa.name, qty: 1, price: sa.price,
        subtotal: sa.price,
        reason: `${sa.name} - 1 per project (recommended)`,
      });
    }
  }

  // ─── F15: Spare sensors ───────────────────────────────────────────────
  const spareSensors: BomLine[] = [];
  {
    const spareAccs = allAccessories.filter(a => a.subCategory === 'spare' && isCompatible(a));
    const gasGroup = detector.gas?.[0] ?? '';
    for (const sp of spareAccs) {
      const spName = sp.name.toUpperCase();
      const isGasMatch = (spName.includes('HFC') && (gasGroup === 'HFC1' || gasGroup === 'HFC2'))
        || (spName.includes('NH3') && gasGroup === 'NH3')
        || (spName.includes('HC') && !spName.includes('HFC') && gasGroup === 'R290')
        || !spName.includes('CALIBRATION GAS');
      if (isGasMatch) {
        spareSensors.push({
          code: sp.code, name: sp.name, qty: 1, price: sp.price,
          subtotal: sp.price,
          reason: `${sp.name} - 1 per project`,
        });
      }
    }
  }

  // ─── F16: Suggested accessories (relations only — new feature) ────────
  const suggestedAccessories: BomLine[] = [];
  if (hasRelations) {
    const suggestedRels = getRelationsFor(relations, detector.code, 'suggested_accessory')
      .filter(r => conditionMatches(r.condition, condCtx));
    for (const rel of suggestedRels) {
      const accProduct = allAccessories.find(a => a.code === rel.toCode);
      if (accProduct && accProduct.price >= 0) {
        const qty = calculateQty(rel.qtyRule, qtyCounts);
        suggestedAccessories.push({
          code: accProduct.code, name: accProduct.name, qty, price: accProduct.price,
          subtotal: qty * accProduct.price,
          reason: rel.reason ?? `Suggested for ${detector.code} (optional)`,
        });
      }
    }
  }

  // ─── Trace ────────────────────────────────────────────────────────────
  const tierLabel = detector.standalone ? 'standalone' : 'controller';
  const bomTrace: BomFunctionTrace[] = [
    { name: 'F7_controller', tier: tierLabel, applied: !detector.standalone && controllerInfo !== null,
      reason: detector.standalone ? 'Standalone - no controller needed' :
        hasRelations ? `${mpuCount} unit(s) selected via relations` :
        `${mpuCount} controller(s) selected via connectTo: ${detector.connectTo || 'any'}`,
      items: [
        ...(baseUnit ? [{ code: baseUnit.code, name: baseUnit.name, qty: baseUnit.qty, subtotal: baseUnit.subtotal }] : []),
        ...(controllerInfo ? [{ code: controllerInfo.code, name: controllerInfo.name, qty: controllerInfo.qty, subtotal: controllerInfo.subtotal }] : []),
      ] },
    { name: 'F10_power', tier: tierLabel, applied: powerAccessories.length > 0,
      reason: powerAccessories.length > 0 ? (hasRelations ? 'Power accessories from relations' : '230V MIDI needs Power Adapter') : `No power adapter needed (${voltage})`,
      items: powerAccessories.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })) },
    { name: 'F11_alert', tier: tierLabel, applied: alertAccessories.length > 0,
      reason: 'EN 378 - audible+visual alarm required',
      items: alertAccessories.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })) },
    { name: 'F13_mounting', tier: tierLabel, applied: mountingAccessories.length > 0,
      reason: mountingAccessories.length > 0 ? `${family} wall mount - back-box recommended` : 'No mounting accessories for this family',
      items: mountingAccessories.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })) },
    { name: 'F14_service', tier: tierLabel, applied: serviceTools.length > 0,
      reason: serviceTools.length > 0 ? `${family} - DT300 + calibration adapter recommended` : 'No service tools for this family',
      items: serviceTools.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })) },
    { name: 'F15_spares', tier: tierLabel, applied: spareSensors.length > 0,
      reason: spareSensors.length > 0 ? `Calibration gas for ${detector.gas?.[0] ?? 'unknown'}` : 'No spare sensors for this family/gas',
      items: spareSensors.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })) },
    ...(suggestedAccessories.length > 0 ? [{
      name: 'F16_suggested', tier: tierLabel, applied: true,
      reason: 'Optional accessories from relations',
      items: suggestedAccessories.map(a => ({ code: a.code, name: a.name, qty: a.qty, subtotal: a.subtotal })),
    }] : []),
  ];

  return { controller: controllerInfo, controllerSpecs, baseUnit, powerAccessories, alertAccessories, mountingAccessories, serviceTools, spareSensors, suggestedAccessories, mpuCount, controllerCost, bomTrace };
}

// ─── Tier Assignment ─────────────────────────────────────────────────────────

const TIER_LABELS: Record<TierKey, string> = {
  PREMIUM_STANDALONE: 'Premium — Standalone',
  PREMIUM_CENTRALIZED: 'Premium — Centralized',
  ECO_STANDALONE: 'Economical — Standalone',
  ECO_CENTRALIZED: 'Economical — Centralized',
};

function buildSolution(
  tierLabel: TierKey,
  detector: ProductEntry,
  totalDets: number,
  input: SelectionInput,
  controllers: ProductEntry[],
  scoring: ScoreBreakdown,
  skipController = false,
): { solution: TierSolution; bomTrace: BomFunctionTrace[] } {
  const bom = buildTierBom(detector, totalDets, input, controllers, skipController);

  const detSubtotal = detector.price * totalDets;
  const powerCost = bom.powerAccessories.reduce((s, a) => s + a.subtotal, 0);
  const alertCost = bom.alertAccessories.reduce((s, a) => s + a.subtotal, 0);
  const mountCost = bom.mountingAccessories.reduce((s, a) => s + a.subtotal, 0);
  const totalBom = detSubtotal + bom.controllerCost + powerCost + alertCost + mountCost;

  const taggedBomTrace = bom.bomTrace.map(bt => ({ ...bt, tier: tierLabel }));

  return { bomTrace: taggedBomTrace, solution: {
    tier: tierLabel,
    label: TIER_LABELS[tierLabel],
    solutionScore: scoring.total,
    detector: {
      code: detector.code, name: detector.name, qty: totalDets,
      price: detector.price, gas: (detector.gas ?? []).join(', '),
      range: detector.range, sensorTech: detector.sensorTech,
      sensorLife: detector.sensorLife, ip: detector.ip,
      tempMin: detector.tempMin, tempMax: detector.tempMax,
      image: detector.image ?? null,
    },
    detectorSpecs: {
      power: detector.power, voltage: detector.voltage,
      relays: detector.relay, relaySpec: null,
      analog: detector.analog, analogType: null,
      modbus: detector.modbus, modbusType: null,
      connectTo: detector.connectTo, features: detector.features,
    },
    controller: bom.controller, controllerSpecs: bom.controllerSpecs,
    powerAccessories: bom.powerAccessories, mountingAccessories: bom.mountingAccessories,
    alertAccessories: bom.alertAccessories, serviceTools: bom.serviceTools,
    spareSensors: bom.spareSensors, totalBom,
  }};
}

// ─── Cost Estimator ──────────────────────────────────────────────────────────

function estimateTotalCost(
  detector: ProductEntry, totalDets: number,
  input: SelectionInput, controllers: ProductEntry[],
): number {
  let cost = detector.price * totalDets;
  const relations = input.relations;
  const hasRelations = relations && relations.length > 0;

  const hasCtrlRels = hasRelations && getRelationsFor(relations, detector.code, 'compatible_controller').length > 0;
  if (!detector.standalone || hasCtrlRels) {
    if (hasRelations) {
      const relResult = selectControllerFromRelations(detector, totalDets, input.sitePowerVoltage, controllers, relations);
      if (relResult.base) cost += relResult.baseQty * relResult.base.price;
      if (relResult.controller) cost += relResult.controllerQty * relResult.controller.price;
    } else {
      const combo = f7_cheapestControllerCombo(totalDets, detector.power ?? 2, controllers, input.sitePowerVoltage, detector.connectTo);
      if (combo) cost += combo.total;
    }
  }

  if (!hasRelations && input.sitePowerVoltage === '230V' && isMidiFamily(detector)) {
    cost += totalDets * POWER_ADAPTER_PRICE;
  }
  // When relations exist, power cost is handled in buildTierBom via relation lookups
  // For estimateTotalCost (used for tier ranking), we approximate with relation data
  if (hasRelations && input.sitePowerVoltage === '230V') {
    const powerRels = getRelationsFor(relations, detector.code, 'required_accessory')
      .filter(r => r.condition === `voltage:${input.sitePowerVoltage}`);
    for (const rel of powerRels) {
      const acc = (input.accessories || []).find(a => a.code === rel.toCode);
      if (acc) {
        const qty = calculateQty(rel.qtyRule, { detectors: totalDets, controllers: 1 });
        cost += qty * acc.price;
      }
    }
  }

  return cost;
}

// ─── Comparison Table ────────────────────────────────────────────────────────

function buildComparisonTable(
  premiumStandalone: TierSolution | null,
  premiumCentralized: TierSolution | null,
  ecoStandalone: TierSolution | null,
  ecoCentralized: TierSolution | null,
): ComparisonTable {
  const val = (t: TierSolution | null, fn: (t: TierSolution) => string): string =>
    t ? fn(t) : '-';

  const rows = [
    { label: 'Detector', premiumStandalone: val(premiumStandalone, t => t.detector.name), premiumCentralized: val(premiumCentralized, t => t.detector.name), ecoStandalone: val(ecoStandalone, t => t.detector.name), ecoCentralized: val(ecoCentralized, t => t.detector.name) },
    { label: 'Qty', premiumStandalone: val(premiumStandalone, t => `${t.detector.qty}`), premiumCentralized: val(premiumCentralized, t => `${t.detector.qty}`), ecoStandalone: val(ecoStandalone, t => `${t.detector.qty}`), ecoCentralized: val(ecoCentralized, t => `${t.detector.qty}`) },
    { label: 'Sensor Tech', premiumStandalone: val(premiumStandalone, t => t.detector.sensorTech ?? '-'), premiumCentralized: val(premiumCentralized, t => t.detector.sensorTech ?? '-'), ecoStandalone: val(ecoStandalone, t => t.detector.sensorTech ?? '-'), ecoCentralized: val(ecoCentralized, t => t.detector.sensorTech ?? '-') },
    { label: 'Sensor Life', premiumStandalone: val(premiumStandalone, t => t.detector.sensorLife ?? '-'), premiumCentralized: val(premiumCentralized, t => t.detector.sensorLife ?? '-'), ecoStandalone: val(ecoStandalone, t => t.detector.sensorLife ?? '-'), ecoCentralized: val(ecoCentralized, t => t.detector.sensorLife ?? '-') },
    { label: 'Controller', premiumStandalone: val(premiumStandalone, t => t.controller ? `${t.controller.qty}x ${t.controller.name}` : 'None (standalone)'), premiumCentralized: val(premiumCentralized, t => t.controller ? `${t.controller.qty}x ${t.controller.name}` : 'None (standalone)'), ecoStandalone: val(ecoStandalone, t => t.controller ? `${t.controller.qty}x ${t.controller.name}` : 'None (standalone)'), ecoCentralized: val(ecoCentralized, t => t.controller ? `${t.controller.qty}x ${t.controller.name}` : 'None (standalone)') },
    { label: 'Score', premiumStandalone: val(premiumStandalone, t => `${t.solutionScore}/21`), premiumCentralized: val(premiumCentralized, t => `${t.solutionScore}/21`), ecoStandalone: val(ecoStandalone, t => `${t.solutionScore}/21`), ecoCentralized: val(ecoCentralized, t => `${t.solutionScore}/21`) },
    { label: 'Total BOM', premiumStandalone: val(premiumStandalone, t => `${t.totalBom.toLocaleString()} EUR`), premiumCentralized: val(premiumCentralized, t => `${t.totalBom.toLocaleString()} EUR`), ecoStandalone: val(ecoStandalone, t => `${t.totalBom.toLocaleString()} EUR`), ecoCentralized: val(ecoCentralized, t => `${t.totalBom.toLocaleString()} EUR`) },
  ];

  // No recommendation badge for now
  return { rows, recommendation: null, recommendationReason: '' };
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function selectProducts(input: SelectionInput): SelectionResult {
  const {
    totalDetectors, selectedRefrigerant, selectedRange,
    zoneType, zoneAtex, outputRequired,
    sitePowerVoltage, projectCountry,
    products, controllers,
  } = input;

  // Filter pipeline
  const filterPipeline: FilterStep[] = [];
  function traceFilter(name: string, before: ProductEntry[], after: ProductEntry[]): ProductEntry[] {
    const eliminated = before.filter(p => !after.includes(p));
    filterPipeline.push({ name, inputCount: before.length, outputCount: after.length, eliminated: eliminated.length, eliminatedProducts: eliminated.slice(0, 10).map(p => p.code) });
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

  const beforePrice = pool;
  pool = pool.filter(p => p.price > 0);
  traceFilter('F_price>0', beforePrice, pool);

  // Score all products
  const scored = pool.map(p => ({
    product: p,
    score: scoreProduct(p, input),
    tier: getProductTier(p),
  }));

  // ═══════════════════════════════════════════════════════════════════════
  // TIER SELECTION — 2×2 matrix (4 solutions):
  //   premiumStandalone   → best detector by score, no controller
  //   premiumCentralized  → same detector + controller (if totalDets > 1 + has relations)
  //   ecoStandalone       → cheapest detector (different from premium), no controller
  //   ecoCentralized      → same eco detector + controller (if totalDets > 1 + has relations)
  // ═══════════════════════════════════════════════════════════════════════

  const tierPicks: TierPickTrace[] = [];
  let premiumStandaloneSol: TierSolution | null = null;
  let premiumCentralizedSol: TierSolution | null = null;
  let ecoStandaloneSol: TierSolution | null = null;
  let ecoCentralizedSol: TierSolution | null = null;
  const allBomTraces: BomFunctionTrace[] = [];

  // ── 1. PREMIUM STANDALONE — Best detector by score, skipController=true ──
  const allCandidatesByScore = [...scored].sort((a, b) => b.score.total - a.score.total);
  const premiumPick = allCandidatesByScore[0];
  if (premiumPick) {
    const r = buildSolution('PREMIUM_STANDALONE', premiumPick.product, totalDetectors, input, controllers, premiumPick.score, true);
    premiumStandaloneSol = r.solution; allBomTraces.push(...r.bomTrace);
  }
  tierPicks.push({
    tier: 'PREMIUM_STANDALONE', candidateCount: allCandidatesByScore.length,
    candidates: allCandidatesByScore.slice(0, 5).map(s => ({ id: s.product.id, code: s.product.code, score: s.score.total, price: s.product.price })),
    picked: premiumPick?.product.id ?? null,
    reason: premiumPick ? `Best by score (${premiumPick.score.total}/21)` : 'No products after filters',
  });

  // ── 2. PREMIUM CENTRALIZED — Same detector + controller ──
  // Only when: totalDetectors > 1 AND detector has compatible_controller relations
  if (premiumPick && totalDetectors > 1) {
    const ctrlRels = input.relations ? getRelationsFor(input.relations, premiumPick.product.code, 'compatible_controller') : [];
    if (ctrlRels.length > 0) {
      const r = buildSolution('PREMIUM_CENTRALIZED', premiumPick.product, totalDetectors, input, controllers, premiumPick.score, false);
      premiumCentralizedSol = r.solution; allBomTraces.push(...r.bomTrace);
    }
    tierPicks.push({
      tier: 'PREMIUM_CENTRALIZED', candidateCount: ctrlRels.length > 0 ? 1 : 0,
      candidates: premiumPick ? [{ id: premiumPick.product.id, code: premiumPick.product.code, score: premiumPick.score.total, price: premiumPick.product.price }] : [],
      picked: premiumCentralizedSol ? premiumPick.product.id : null,
      reason: premiumCentralizedSol ? `Same detector + Controller (${premiumPick.product.code})` : (totalDetectors <= 1 ? 'Only 1 detector — centralized not applicable' : 'No compatible controller relation found'),
    });
  } else {
    tierPicks.push({
      tier: 'PREMIUM_CENTRALIZED', candidateCount: 0, candidates: [], picked: null,
      reason: totalDetectors <= 1 ? 'Only 1 detector — centralized not applicable' : 'No premium detector selected',
    });
  }

  // ── 3. ECO STANDALONE — Cheapest total cost, different from premium pick ──
  const cheapestCandidates = [...scored].sort((a, b) => {
    const aCost = estimateTotalCost(a.product, totalDetectors, input, controllers);
    const bCost = estimateTotalCost(b.product, totalDetectors, input, controllers);
    return aCost - bCost || b.score.total - a.score.total;
  });

  const premiumCostEstimate = premiumPick ? estimateTotalCost(premiumPick.product, totalDetectors, input, controllers) : Infinity;
  const ecoPick = cheapestCandidates.find(s => {
    if (premiumPick && s.product.id === premiumPick.product.id) return false;
    const cost = estimateTotalCost(s.product, totalDetectors, input, controllers);
    return cost < premiumCostEstimate;
  });

  if (ecoPick) {
    const r = buildSolution('ECO_STANDALONE', ecoPick.product, totalDetectors, input, controllers, ecoPick.score, true);
    ecoStandaloneSol = r.solution; allBomTraces.push(...r.bomTrace);
  }
  tierPicks.push({
    tier: 'ECO_STANDALONE', candidateCount: cheapestCandidates.length,
    candidates: cheapestCandidates.slice(0, 5).map(s => ({ id: s.product.id, code: s.product.code, score: s.score.total, price: s.product.price })),
    picked: ecoPick?.product.id ?? null,
    reason: ecoPick ? `Cheapest total cost (${ecoPick.product.code}, score ${ecoPick.score.total}/21)` : 'No cheaper alternative available',
  });

  // ── 4. ECO CENTRALIZED — Same eco detector + controller ──
  // Only when: totalDetectors > 1 AND eco detector has compatible_controller relations
  if (ecoPick && totalDetectors > 1) {
    const ctrlRels = input.relations ? getRelationsFor(input.relations, ecoPick.product.code, 'compatible_controller') : [];
    if (ctrlRels.length > 0) {
      const r = buildSolution('ECO_CENTRALIZED', ecoPick.product, totalDetectors, input, controllers, ecoPick.score, false);
      ecoCentralizedSol = r.solution; allBomTraces.push(...r.bomTrace);
    }
    tierPicks.push({
      tier: 'ECO_CENTRALIZED', candidateCount: ctrlRels.length > 0 ? 1 : 0,
      candidates: ecoPick ? [{ id: ecoPick.product.id, code: ecoPick.product.code, score: ecoPick.score.total, price: ecoPick.product.price }] : [],
      picked: ecoCentralizedSol ? ecoPick.product.id : null,
      reason: ecoCentralizedSol ? `Same detector + Controller (${ecoPick.product.code})` : (totalDetectors <= 1 ? 'Only 1 detector — centralized not applicable' : 'No compatible controller relation found'),
    });
  } else {
    tierPicks.push({
      tier: 'ECO_CENTRALIZED', candidateCount: 0, candidates: [], picked: null,
      reason: !ecoPick ? 'No eco detector selected' : 'Only 1 detector — centralized not applicable',
    });
  }

  // ── Fallback: if no premium found, pick best overall ──
  if (!premiumStandaloneSol) {
    const fallback = scored.sort((a, b) => b.score.total - a.score.total)[0];
    if (fallback) {
      const rf1 = buildSolution('PREMIUM_STANDALONE', fallback.product, totalDetectors, input, controllers, fallback.score, true);
      premiumStandaloneSol = rf1.solution; allBomTraces.push(...rf1.bomTrace);
      tierPicks[0].picked = fallback.product.id;
      tierPicks[0].reason = `Fallback: best remaining by score (${fallback.score.total}/21)`;
    }
  }

  const scoredTrace: ScoredCandidate[] = scored.map(s => ({
    id: s.product.id, code: s.product.code, name: s.product.name,
    tier: s.tier, family: getFamily(s.product), score: s.score,
    price: s.product.price, standalone: s.product.standalone,
  }));

  const trace: SelectionTrace = {
    filterPipeline, afterFilters: pool.length, scored: scoredTrace,
    tierPicks, bomFunctions: allBomTraces,
  };

  const comparison = buildComparisonTable(premiumStandaloneSol, premiumCentralizedSol, ecoStandaloneSol, ecoCentralizedSol);

  return {
    tiers: {
      premiumStandalone: premiumStandaloneSol,
      premiumCentralized: premiumCentralizedSol,
      ecoStandalone: ecoStandaloneSol,
      ecoCentralized: ecoCentralizedSol,
    },
    comparison,
    trace,
  };
}
