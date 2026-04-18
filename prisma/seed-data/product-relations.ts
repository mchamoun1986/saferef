/**
 * Product Relation seed data — compatibility matrix
 * Maps detectors → controllers, required accessories, alert devices, suggested items
 */

export interface SeedProductRelation {
  fromCode: string;
  toCode: string;
  type: string;         // 'compatible_controller' | 'requires_base' | 'required_accessory' | 'alert_device' | 'suggested_accessory'
  mandatory: boolean;
  qtyRule: string;      // 'per_detector' | 'per_controller' | '1:1' | 'ceil_n_5' | 'per_project'
  condition?: string;   // e.g. "voltage:230V", "mount:pipe", "mount:duct", "atex:false"
  reason?: string;
  priority: number;
}

// ── Product code lists ──

const MIDI_ALL = [
  '31-210-32', '31-510-32',   // CO2
  '31-220-12', '31-520-12',   // HFC Grp1
  '31-220-17', '31-520-17',   // HFC Grp2
  '31-250-22', '31-250-23', '31-250-24', '31-550-23',  // NH3
  '31-290-13', '31-590-13',   // R290/HC
  '31-550-22', '31-550-24',   // NH3 remote variants
];

const MIDI_REMOTE = [
  '31-510-32',   // CO2 remote
  '31-520-12',   // HFC Grp1 remote
  '31-520-17',   // HFC Grp2 remote
  '31-550-23',   // NH3 remote
  '31-590-13',   // R290/HC remote
  '31-550-22',   // NH3 100ppm remote
  '31-550-24',   // NH3 5000ppm remote
];

const MIDI_INTEGRATED = [
  '31-210-32',   // CO2
  '31-220-12',   // HFC Grp1
  '31-220-17',   // HFC Grp2
  '31-250-22',   // NH3 100ppm
  '31-250-23',   // NH3 1000ppm
  '31-250-24',   // NH3 5000ppm
  '31-290-13',   // R290/HC
];

const X5_DIRECT = [
  '3500-0002', '3500-0003', '3500-0095', '3500-0004',   // NH3 sensors
  '3500-0005', '3500-0006',                               // CO2 sensors
  '3500-0096', '3500-0097', '3500-0098',                  // CO, O2, NO2
  '3500-0103',                                             // Ethanol
  '3500-0065', '3500-0066', '3500-0067', '3500-0068',    // Gas-specific IR: R22, R32, R123, R125
  '3500-0069', '3500-0070', '3500-0071', '3500-0072',    // R134A, R227, R404A, R407A
  '3500-0073', '3500-0074', '3500-0075', '3500-0076',    // R407F, R410A, R417A, R442D
  '3500-0077', '3500-0078', '3500-0079', '3500-0080',    // R448A, R449A, R452B, R507
  '3500-0081', '3500-0082', '3500-0083', '3500-0084',    // R513A, R1233zd, R1234yf, R1234ze
];

const X5_REMOTE = [
  '3500-0022', '3500-0023', '3500-0024', '3500-0025',    // NH3 remote
  '3500-0026',                                             // CO2 5% remote
  '3500-0099', '3500-0100', '3500-0101',                  // CO, O2, NO2 remote
  '3500-0109', '3500-0117',                                // CO2 5000ppm, R290 remote
  '3500-0032', '3500-0033', '3500-0034', '3500-0035',    // Gas-specific IR remote: R22, R32, R123, R125
  '3500-0036', '3500-0037', '3500-0038', '3500-0039',    // R134A, R227, R404A, R407A
  '3500-0040', '3500-0041', '3500-0042', '3500-0043',    // R407F, R410A, R417A, R422D
  '3500-0044', '3500-0045', '3500-0046', '3500-0047',    // R448A, R449A, R452B, R507
  '3500-0048', '3500-0049', '3500-0050', '3500-0051',    // R513A, R1233zd, R1234yf, R1234ze
  '3500-0115',                                             // Ethanol remote
];

const X5_ALL = [...X5_DIRECT, ...X5_REMOTE];

const RM_ALL = ['32-220', '32-320'];

const ALERT_RED    = '40-440';
const ALERT_ORANGE = '40-442';
const ALERT_BLUE   = '40-441';
const ALL_ALERTS   = [ALERT_RED, ALERT_ORANGE, ALERT_BLUE];

// ── Helpers ──

function rel(
  fromCode: string,
  toCode: string,
  type: string,
  mandatory: boolean,
  qtyRule: string,
  priority: number = 0,
  condition?: string,
  reason?: string,
): SeedProductRelation {
  return { fromCode, toCode, type, mandatory, qtyRule, priority, condition, reason };
}

/** Generate relations from many → one target */
function manyToOne(
  froms: string[],
  toCode: string,
  type: string,
  mandatory: boolean,
  qtyRule: string,
  priority: number = 0,
  condition?: string,
  reason?: string,
): SeedProductRelation[] {
  return froms.map(from => rel(from, toCode, type, mandatory, qtyRule, priority, condition, reason));
}

/** Generate relations from one → many targets */
function oneToMany(
  fromCode: string,
  tos: string[],
  type: string,
  mandatory: boolean,
  qtyRule: string,
  priority: number = 0,
  condition?: string,
  reason?: string,
): SeedProductRelation[] {
  return tos.map(to => rel(fromCode, to, type, mandatory, qtyRule, priority, condition, reason));
}

// ── Build all relations ──

export const PRODUCT_RELATIONS: SeedProductRelation[] = [

  // ═══════════════════════════════════════════════
  // DETECTOR → CONTROLLER relations
  // ═══════════════════════════════════════════════

  // All MIDI → Controller 10 (compatible, optional)
  ...manyToOne(MIDI_ALL, '6300-0001', 'compatible_controller', false, 'per_detector', 0,
    undefined, 'MIDI standalone detectors can connect to Controller 10 via Modbus'),

  // All X5 direct-mount → X5 Transmitter (requires base, mandatory, 1:1)
  ...manyToOne(X5_DIRECT, '3500-0001', 'requires_base', true, '1:1', 0,
    undefined, 'X5 sensor modules require X5 ATEX Transmitter'),

  // All X5 remote → X5 Transmitter (requires base, mandatory, 1:1)
  ...manyToOne(X5_REMOTE, '3500-0001', 'requires_base', true, '1:1', 0,
    undefined, 'X5 remote sensor modules require X5 ATEX Transmitter'),

  // All X5 remote → Controller 10 (compatible, optional)
  ...manyToOne(X5_REMOTE, '6300-0001', 'compatible_controller', false, 'per_detector', 0,
    undefined, 'X5 remote modules can also connect to Controller 10'),

  // All RM → LAN63-PKT (compatible, optional)
  ...manyToOne(RM_ALL, '81-100', 'compatible_controller', false, 'per_detector', 0,
    undefined, 'RM detectors connect to LAN63-PKT via relay'),

  // All RM → LAN63/64-PKT (compatible, optional)
  ...manyToOne(RM_ALL, '81-200', 'compatible_controller', false, 'per_detector', 0,
    undefined, 'RM detectors connect to LAN63/64-PKT via relay'),

  // All RM → LAN63 Master (compatible, optional)
  ...manyToOne(RM_ALL, '81-110', 'compatible_controller', false, 'per_detector', 0,
    undefined, 'RM detectors connect to LAN63 Master via relay'),

  // All RM → LAN64 Slave (compatible, optional)
  ...manyToOne(RM_ALL, '81-120', 'compatible_controller', false, 'per_detector', 0,
    undefined, 'RM detectors connect to LAN64 Slave via relay'),

  // ═══════════════════════════════════════════════
  // REQUIRED ACCESSORIES (conditional)
  // ═══════════════════════════════════════════════

  // All MIDI → Power Adapter 230V-24V (mandatory when mains is 230V)
  ...manyToOne(MIDI_ALL, '4000-0002', 'required_accessory', true, 'ceil_n_5', 0,
    'voltage:230V', 'MIDI runs on 15-24V; needs 230V→24V adapter if site is 230V mains'),

  // All MIDI → Pipe Adapter 1/2" R (mandatory for pipe mount)
  ...manyToOne(MIDI_ALL, '62-9031', 'required_accessory', true, 'per_detector', 0,
    'mount:pipe', 'Pipe mounting requires GLACIAR MIDI Pipe adapter'),

  // MIDI remote only → Duct Adapter (mandatory for duct mount)
  ...manyToOne(MIDI_REMOTE, '62-9041', 'required_accessory', true, 'per_detector', 0,
    'mount:duct', 'Duct mounting requires GLACIAR MIDI Duct adapter'),

  // All RM → KAP045 flush mount back-box (optional)
  ...manyToOne(RM_ALL, 'KAP045', 'required_accessory', false, 'per_detector', 0,
    undefined, 'Flush mount back-box for RM/RMV detectors'),

  // All RM → KAP046 surface mount back-box (optional)
  ...manyToOne(RM_ALL, 'KAP046', 'required_accessory', false, 'per_detector', 0,
    undefined, 'Surface mount back-box for RM/RMV detectors'),

  // ═══════════════════════════════════════════════
  // ALERT DEVICES
  // ═══════════════════════════════════════════════

  // All MIDI → alert device: only 40-440 Red (same function as orange/blue, just color)
  ...manyToOne(MIDI_ALL, ALERT_RED, 'alert_device', false, 'per_detector', 3,
    undefined, 'Red combined light+siren for alarm indication'),

  // Controller 10 → all 3 alerts (mandatory, per_controller)
  ...oneToMany('6300-0001', ALL_ALERTS, 'alert_device', true, 'per_controller', 0,
    undefined, 'Controller 10 requires alert devices for alarm outputs'),

  // X5 Transmitter → all 3 alerts (optional, per_controller, condition: non-ATEX zone)
  ...oneToMany('3500-0001', ALL_ALERTS, 'alert_device', false, 'per_controller', 0,
    'atex:false', 'X5 Transmitter can drive alerts in non-ATEX zones'),

  // LAN63-PKT → all 3 alerts (mandatory, per_controller)
  ...oneToMany('81-100', ALL_ALERTS, 'alert_device', true, 'per_controller', 0,
    undefined, 'LAN63-PKT requires alert devices for alarm relay outputs'),

  // LAN63/64-PKT → all 3 alerts (mandatory, per_controller)
  ...oneToMany('81-200', ALL_ALERTS, 'alert_device', true, 'per_controller', 0,
    undefined, 'LAN63/64-PKT requires alert devices for alarm relay outputs'),

  // ═══════════════════════════════════════════════
  // MOUNTING BRACKETS
  // ═══════════════════════════════════════════════

  // MIDI Integrated → Mounting bracket 40-901 (wall bracket for integrated MIDI)
  ...manyToOne(MIDI_INTEGRATED, '40-901', 'required_accessory', true, 'per_detector', 0,
    'mount:wall', 'Wall mounting bracket for MIDI integrated detectors'),

  // MIDI Remote → Mounting bracket 40-902 (smaller bracket for remote head)
  ...manyToOne(MIDI_REMOTE, '40-902', 'required_accessory', true, 'per_detector', 0,
    'mount:wall', 'Wall mounting bracket for MIDI remote detectors (small size)'),

  // ═══════════════════════════════════════════════
  // X5 REQUIRED ACCESSORIES
  // ═══════════════════════════════════════════════

  // X5 Remote only → Stopping Plug M20 (always needed with remote sensors)
  ...manyToOne(X5_REMOTE, '3500-0031', 'required_accessory', true, 'per_detector', 0,
    undefined, 'M20 stopping plug required for X5 remote sensor installations'),

  // ═══════════════════════════════════════════════
  // SUGGESTED ACCESSORIES (nice-to-have)
  // ═══════════════════════════════════════════════

  // One representative per family → LED Sign
  rel('31-210-32', '6100-0002', 'suggested_accessory', false, 'per_project', 0,
    undefined, 'LED "Refrigerant Alarm" sign for visibility'),
  rel('32-220', '6100-0002', 'suggested_accessory', false, 'per_project', 0,
    undefined, 'LED "Refrigerant Alarm" sign for visibility'),
  rel('3500-0002', '6100-0002', 'suggested_accessory', false, 'per_project', 0,
    undefined, 'LED "Refrigerant Alarm" sign for visibility'),

  // X5 representative → Calibration Kit
  rel('3500-0002', '3500-0094', 'suggested_accessory', false, 'per_project', 0,
    undefined, 'GLACIAR X5 Calibration Kit for field calibration'),
];
