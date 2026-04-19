// ─────────────────────────────────────────────────────────────────────────────
// SystemDesigner V2 — Test Suite
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll } from 'vitest';
import { SystemDesigner } from '../designer';
import type { ProductV2, DesignerInputs } from '../designer-types';

// ─── Test Helpers ─────────────────────────────────────────────────────────────

/** Create a minimal ProductV2 with sensible defaults */
function makeProduct(overrides: Partial<ProductV2>): ProductV2 {
  return {
    id: overrides.id ?? `test-${overrides.code ?? 'unknown'}`,
    type: 'detector',
    family: 'Test Family',
    name: 'Test Product',
    code: 'TEST-001',
    price: 100,
    image: null,
    specs: '{}',
    tier: 'standard',
    productGroup: 'A',
    gas: '[]',
    refs: '[]',
    apps: '[]',
    range: null,
    sensorTech: null,
    sensorLife: null,
    power: null,
    voltage: '24 VDC',
    ip: null,
    tempMin: null,
    tempMax: null,
    relay: 0,
    analog: null,
    modbus: false,
    standalone: false,
    atex: false,
    mount: '[]',
    remote: false,
    features: null,
    connectTo: null,
    discontinued: false,
    channels: null,
    maxPower: null,
    subCategory: null,
    compatibleFamilies: '[]',
    variant: null,
    subType: null,
    function: null,
    status: 'active',
    ports: '{"inputs": [], "outputs": [], "features": []}',
    connectionRules: '{}',
    compatibleWith: '[]',
    ...overrides,
  };
}

/** Default inputs for testing */
function makeInputs(overrides: Partial<DesignerInputs> = {}): DesignerInputs {
  return {
    gas: 'R744',
    atex: false,
    voltage: '',
    location: 'ambient',
    outputs: [],
    measType: '',
    points: 1,
    ...overrides,
  };
}

// ─── Test Catalog ─────────────────────────────────────────────────────────────
// Realistic mini-catalog matching the SAMON product structure

const MIDI_CO2_INTEGRATED = makeProduct({
  code: '31-210-32',
  name: 'GLACIAR MIDI IR CO2 10000ppm',
  family: 'GLACIAR MIDI',
  variant: 'CO2 Integrated',
  type: 'detector',
  subType: 'gas_detector',
  price: 673,
  tier: 'premium',
  gas: '["R744"]',
  voltage: '15..24 VDC; 24 VAC/DC V',
  range: '0-10000 ppm',
  relay: 2,
  modbus: true,
  analog: '4-20mA',
  standalone: true,
  atex: false,
  compatibleWith: '["GLACIAR Controller 10"]',
  connectionRules: '{"maxPerController": 10, "connectionToController": "4-20mA analog", "standaloneCapable": true, "relayOutputCount": 2, "alertsPerUnit": 2, "powerAdapterRequired": "When site voltage is 230V AC", "powerAdapterCapacity": 5}',
  ports: '{"inputs": ["24V AC/DC Power"], "outputs": ["Analogue Output", "Warning/Fault Relay", "Alarm Relay"], "features": ["RS-485 Modbus RTU"]}',
});

const MIDI_CO2_REMOTE = makeProduct({
  code: '31-510-32',
  name: 'GLACIAR MIDI Remote IR CO2 10000ppm',
  family: 'GLACIAR MIDI',
  variant: 'CO2 Remote',
  type: 'detector',
  subType: 'gas_detector',
  price: 739,
  tier: 'premium',
  gas: '["R744"]',
  voltage: '15..24 VDC; 24 VAC/DC V',
  range: '0-10000 ppm',
  relay: 2,
  modbus: true,
  analog: '4-20mA',
  standalone: true,
  atex: false,
  compatibleWith: '["GLACIAR Controller 10"]',
  connectionRules: '{"maxPerController": 10, "connectionToController": "4-20mA analog", "standaloneCapable": true, "relayOutputCount": 2, "alertsPerUnit": 2, "powerAdapterRequired": "When site voltage is 230V AC", "powerAdapterCapacity": 5}',
  ports: '{"inputs": ["24V AC/DC Power"], "outputs": ["Analogue Output", "Warning/Fault Relay", "Alarm Relay"], "features": ["RS-485 Modbus RTU"]}',
});

const MIDI_R717 = makeProduct({
  code: '31-200-EC',
  name: 'GLACIAR MIDI EC R717 (NH3) 0-1000ppm',
  family: 'GLACIAR MIDI',
  variant: 'R717 (NH3) Integrated',
  type: 'detector',
  subType: 'gas_detector',
  price: 673,
  tier: 'premium',
  gas: '["R717"]',
  voltage: '15..24 VDC; 24 VAC/DC V',
  range: '0-1000 ppm',
  relay: 2,
  modbus: true,
  analog: '4-20mA',
  standalone: true,
  atex: false,
  compatibleWith: '["GLACIAR Controller 10"]',
  connectionRules: '{"maxPerController": 10, "connectionToController": "4-20mA analog", "standaloneCapable": true, "relayOutputCount": 2, "powerAdapterCapacity": 5}',
});

const MICRO_R290 = makeProduct({
  code: 'MICRO-IR-R290',
  name: 'GLACIAR MICRO IR R290 0-50%LFL',
  family: 'GLACIAR MICRO',
  variant: 'R290 (Propane)',
  type: 'detector',
  subType: 'gas_detector',
  price: 160,
  tier: 'economic',
  gas: '["R290"]',
  voltage: '12 VDC +/-20% V',
  range: '0-50 %LFL',
  relay: 0,
  modbus: true,
  standalone: true,
  atex: false,
  compatibleWith: '[]',
  connectionRules: '{"standaloneCapable": false, "relayOutputCount": 0, "alertsPerUnit": 0}',
});

const RM_R32 = makeProduct({
  code: '32-320',
  name: 'GLACIAR RMV-HFC R32/R410A',
  family: 'GLACIAR RM',
  variant: 'HFC R32/R410A',
  type: 'detector',
  subType: 'gas_detector',
  price: 382,
  tier: 'economic',
  gas: '["R32", "R410A"]',
  voltage: '12-24 VDC/VAC V',
  range: '0-50% LFL',
  relay: 2,
  modbus: true,
  standalone: true,
  atex: false,
  compatibleWith: '["GLACIAR Controller 10"]',
  connectionRules: '{"maxPerController": 10, "connectionToController": "Modbus RTU", "standaloneCapable": true, "relayOutputCount": 2, "powerAdapterCapacity": 5}',
});

const X5_DIRECT_CO2 = makeProduct({
  code: '3500-0006',
  name: 'GLACIAR X5 CO2 0-5% vol sensor module',
  family: 'X5 Direct Sensor Module',
  variant: 'CO2 0-5% vol',
  type: 'sensor',
  subType: 'direct_mount_sensor',
  price: 1019,
  tier: 'premium',
  gas: '["R744"]',
  voltage: null,
  range: '0-5 % vol',
  relay: 0,
  standalone: false,
  atex: true,
  compatibleWith: '["X5 Transmitter"]',
  connectionRules: '{"requiresTransmitter": true, "connectionType": "Direct mount (Port A/B)", "maxPerTransmitter": 2, "standaloneCapable": false}',
});

const X5_REMOTE_CO2 = makeProduct({
  code: '3500-0026',
  name: 'GLACIAR X5 CO2 0-5% vol Remote sensor module',
  family: 'X5 Remote Sensor',
  variant: 'CO2 0-5% vol',
  type: 'sensor',
  subType: 'remote_sensor',
  price: 1287,
  tier: 'premium',
  gas: '["R744"]',
  voltage: null,
  range: '0-5 % vol',
  relay: 0,
  standalone: false,
  atex: true,
  compatibleWith: '["X5 Transmitter", "GLACIAR Controller 10"]',
  connectionRules: '{"requiresTransmitter": true, "connectionType": "Remote highway cable", "maxPerTransmitter": 2, "standaloneCapable": false}',
});

const X5_DIRECT_R717_ATEX = makeProduct({
  code: '3500-0008',
  name: 'GLACIAR X5 NH3 0-1000 ppm sensor module',
  family: 'X5 Direct Sensor Module',
  variant: 'NH3 0-1000 ppm',
  type: 'sensor',
  subType: 'direct_mount_sensor',
  price: 602,
  tier: 'standard',
  gas: '["R717"]',
  voltage: null,
  range: '0-1000 ppm',
  relay: 0,
  standalone: false,
  atex: true,
  compatibleWith: '["X5 Transmitter"]',
  connectionRules: '{"requiresTransmitter": true, "connectionType": "Direct mount (Port A/B)", "maxPerTransmitter": 2, "standaloneCapable": false}',
});

const GC10 = makeProduct({
  code: 'GC10',
  name: 'GLACIAR Controller 10',
  family: 'GLACIAR Controller 10',
  type: 'controller',
  subType: 'gas_detection_control_panel',
  price: 2996,
  tier: 'premium',
  voltage: null,
  relay: 5,
  modbus: true,
  compatibleWith: '["GLACIAR MIDI", "X5 Transmitter", "GLACIAR RM"]',
  connectionRules: '{"maxDetectors": 10, "beaconsNeeded": 1, "sirensNeeded": 1, "powersDetectors": true}',
});

const X5_TRANSMITTER = makeProduct({
  code: '3500-0001',
  name: 'GLACIAR X5 ATEX Transmitter with display',
  family: 'X5 Transmitter',
  type: 'controller',
  subType: 'transmitter',
  price: 822,
  tier: 'premium',
  voltage: '18-30 VDC',
  relay: 3,
  modbus: true,
  atex: true,
  compatibleWith: '["X5 Direct Sensor Module", "X5 Remote Sensor"]',
  connectionRules: '{"maxSensorModules": 2, "relayOutputCount": 3, "beaconsPerTransmitter": 1, "sirensPerTransmitter": 1, "configurations": {"A": {"name": "Direct-connected sensors only", "requiredAccessories": []}, "B": {"name": "Mixed", "requiredAccessories": [{"code": "3500-0029", "name": "D44 Power Filter", "qty": 1, "reason": "Required for remote sensor"}, {"code": "3500-0030", "name": "Cable Gland EXd II C", "qty": 2, "reason": "For remote sensor cables"}]}, "C": {"name": "Remote sensors only", "requiredAccessories": [{"code": "3500-0029", "name": "D44 Power Filter", "qty": 1, "reason": "Required for remote sensors"}, {"code": "3500-0030", "name": "Cable Gland EXd II C", "qty": 4, "reason": "For remote sensor cables"}, {"code": "3500-0031", "name": "Stopping Plug M20", "qty": 1, "reason": "Blank unused entry"}]}}}',
});

const SIREN = makeProduct({
  code: '40-410',
  name: '1992-R-LP, 9-28VDC, Siren',
  family: '1992-R-LP Siren',
  type: 'alert',
  subType: 'siren',
  price: 90,
  voltage: '9-28 VDC',
  compatibleWith: '["GLACIAR MIDI", "GLACIAR Controller 10", "X5 Transmitter", "X5 Direct Sensor Module", "X5 Remote Sensor", "GLACIAR RM"]',
});

const BEACON = makeProduct({
  code: '40-4021',
  name: 'BE-A 24V Flashing lights, Orange',
  family: 'BE Flashing Light',
  type: 'alert',
  subType: 'beacon',
  price: 101,
  voltage: '24 V',
  compatibleWith: '["GLACIAR MIDI", "GLACIAR Controller 10", "X5 Transmitter", "X5 Direct Sensor Module", "X5 Remote Sensor", "GLACIAR RM"]',
});

const COMBO_ALERT = makeProduct({
  code: '40-440',
  name: 'FL-RL-R-SEP Red, combined flashing light & siren',
  family: 'FL Combined Flashing Light and Siren',
  type: 'alert',
  subType: 'beacon_siren_combo',
  price: 232,
  compatibleWith: '["GLACIAR MIDI", "GLACIAR Controller 10", "X5 Transmitter", "X5 Direct Sensor Module", "X5 Remote Sensor", "GLACIAR RM"]',
});

const POWER_ADAPTER = makeProduct({
  code: '4000-0002',
  name: 'GLACIAR Power adapter',
  family: 'Power Adapter',
  type: 'accessory',
  subType: 'power_adapter',
  price: 99,
  compatibleWith: '["GLACIAR MIDI"]',
  connectionRules: '{"converts": "230V AC to 24V DC", "maxLoad": 5}',
});

const MIDI_CAL_KIT = makeProduct({
  code: '61-9040',
  name: 'GLACIAR MIDI Calibration Kit',
  family: 'MIDI Accessories',
  type: 'accessory',
  subType: 'calibration_kit',
  price: 243,
  compatibleWith: '["GLACIAR MIDI"]',
});

const DUCT_ADAPTER_MIDI = makeProduct({
  code: '62-9041',
  name: 'GLACIAR MIDI Duct Adapter',
  family: 'MIDI Accessories',
  type: 'accessory',
  subType: 'midi_accessory',
  price: 147,
  compatibleWith: '["GLACIAR MIDI"]',
});

const PIPE_ADAPTER_MIDI = makeProduct({
  code: '62-9031',
  name: 'GLACIAR MIDI Pipe Adapter 1/2" R',
  family: 'MIDI Accessories',
  type: 'accessory',
  subType: 'midi_accessory',
  price: 32,
  compatibleWith: '["GLACIAR MIDI"]',
});

const DUCT_ADAPTER_X5 = makeProduct({
  code: '3500-0104',
  name: 'GLACIAR X5 Type 5 Duct Adaptor BSP',
  family: 'X5 Accessories',
  type: 'accessory',
  subType: 'x5_accessory',
  price: 602,
  compatibleWith: '["X5 Transmitter", "X5 Direct Sensor Module", "X5 Remote Sensor"]',
});

const PIPE_ADAPTER_X5 = makeProduct({
  code: '3500-0105',
  name: 'GLACIAR X5 Pipe Adapter & Silencer',
  family: 'X5 Accessories',
  type: 'accessory',
  subType: 'x5_accessory',
  price: 98,
  compatibleWith: '["X5 Transmitter", "X5 Direct Sensor Module", "X5 Remote Sensor"]',
});

const D44_POWER_FILTER = makeProduct({
  code: '3500-0029',
  name: 'D44 Power Filter',
  family: 'X5 Accessories',
  type: 'accessory',
  subType: 'x5_accessory',
  price: 50,
  compatibleWith: '["X5 Transmitter"]',
});

const CABLE_GLAND = makeProduct({
  code: '3500-0030',
  name: 'Cable Gland EXd II C',
  family: 'X5 Accessories',
  type: 'accessory',
  subType: 'x5_accessory',
  price: 25,
  compatibleWith: '["X5 Transmitter"]',
});

const STOPPING_PLUG = makeProduct({
  code: '3500-0031',
  name: 'Stopping Plug M20',
  family: 'X5 Accessories',
  type: 'accessory',
  subType: 'x5_accessory',
  price: 10,
  compatibleWith: '["X5 Transmitter"]',
});

// Planned product (should be excluded)
const PLANNED_DETECTOR = makeProduct({
  code: 'PLANNED-001',
  name: 'Future MIDI R1234yf',
  family: 'GLACIAR MIDI',
  type: 'detector',
  status: 'planned',
  price: 0,
  gas: '["R1234yf"]',
  voltage: '24 VDC',
  relay: 2,
  standalone: true,
  compatibleWith: '["GLACIAR Controller 10"]',
});

// Build a full test catalog
const FULL_CATALOG: ProductV2[] = [
  MIDI_CO2_INTEGRATED,
  MIDI_CO2_REMOTE,
  MIDI_R717,
  MICRO_R290,
  RM_R32,
  X5_DIRECT_CO2,
  X5_REMOTE_CO2,
  X5_DIRECT_R717_ATEX,
  GC10,
  X5_TRANSMITTER,
  SIREN,
  BEACON,
  COMBO_ALERT,
  POWER_ADAPTER,
  MIDI_CAL_KIT,
  DUCT_ADAPTER_MIDI,
  PIPE_ADAPTER_MIDI,
  DUCT_ADAPTER_X5,
  PIPE_ADAPTER_X5,
  D44_POWER_FILTER,
  CABLE_GLAND,
  STOPPING_PLUG,
  PLANNED_DETECTOR,
];

// ═══════════════════════════════════════════════════════════════════════════════
//  Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('SystemDesigner V2', () => {
  let designer: SystemDesigner;

  beforeAll(() => {
    designer = new SystemDesigner(FULL_CATALOG);
  });

  // ─── 1. Gas filter ────────────────────────────────────────────────────────

  describe('Gas filter', () => {
    it('only returns products matching the requested gas', () => {
      const detectors = designer.filterDetectors({ gas: 'R744' });
      expect(detectors.length).toBeGreaterThan(0);
      for (const d of detectors) {
        const gases = JSON.parse(d.gas);
        expect(gases).toContain('R744');
      }
    });

    it('returns no detectors for a gas not in catalog', () => {
      const detectors = designer.filterDetectors({ gas: 'R999_NONEXISTENT' });
      expect(detectors).toHaveLength(0);
    });

    it('R717 returns MIDI R717 and X5 NH3 sensor', () => {
      const detectors = designer.filterDetectors({ gas: 'R717' });
      const families = detectors.map(d => d.family);
      expect(families).toContain('GLACIAR MIDI');
      expect(families).toContain('X5 Direct Sensor Module');
    });

    it('R32 returns RM detector', () => {
      const detectors = designer.filterDetectors({ gas: 'R32' });
      expect(detectors.some(d => d.family === 'GLACIAR RM')).toBe(true);
    });
  });

  // ─── 2. Standalone solution ───────────────────────────────────────────────

  describe('Standalone solution', () => {
    it('detector with relays + standalone=true gets standalone solution', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const standalone = solutions.filter(s => s.mode === 'standalone');
      expect(standalone.length).toBeGreaterThan(0);

      const midiSA = standalone.find(s => s.detector.family === 'GLACIAR MIDI');
      expect(midiSA).toBeDefined();
      expect(midiSA!.controller).toBeNull();
      expect(midiSA!.controllerQty).toBe(0);
      expect(midiSA!.connectionLabel).toBeNull();
    });

    it('standalone name contains "Standalone"', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const standalone = solutions.filter(s => s.mode === 'standalone');
      for (const s of standalone) {
        expect(s.name).toContain('Standalone');
      }
    });
  });

  // ─── 3. Centralized solution ──────────────────────────────────────────────

  describe('Centralized solution', () => {
    it('MIDI + GC10 centralized solution is generated', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const centralized = solutions.filter(s => s.mode === 'centralized');
      expect(centralized.length).toBeGreaterThan(0);

      const midiGC10 = centralized.find(s =>
        s.detector.family === 'GLACIAR MIDI' && s.controller?.family === 'GLACIAR Controller 10'
      );
      expect(midiGC10).toBeDefined();
      expect(midiGC10!.controllerQty).toBe(1);
      expect(midiGC10!.controller!.code).toBe('GC10');
    });

    it('X5 sensor + X5 Transmitter centralized solution is generated', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const x5Sol = solutions.find(s =>
        s.detector.family === 'X5 Direct Sensor Module' && s.controller?.family === 'X5 Transmitter'
      );
      expect(x5Sol).toBeDefined();
      expect(x5Sol!.mode).toBe('centralized');
    });
  });

  // ─── 4. ATEX filter ───────────────────────────────────────────────────────

  describe('ATEX filter', () => {
    it('only ATEX products when atex=true', () => {
      const detectors = designer.filterDetectors({ gas: 'R744', atex: true });
      for (const d of detectors) {
        expect(d.atex).toBe(true);
      }
      // MIDI is not ATEX, should be excluded
      expect(detectors.every(d => d.family !== 'GLACIAR MIDI')).toBe(true);
      // X5 sensors are ATEX
      expect(detectors.some(d => d.family.includes('X5'))).toBe(true);
    });

    it('non-ATEX detectors included when atex=false', () => {
      const detectors = designer.filterDetectors({ gas: 'R744', atex: false });
      expect(detectors.some(d => d.family === 'GLACIAR MIDI')).toBe(true);
    });
  });

  // ─── 5. Duct location ────────────────────────────────────────────────────

  describe('Duct location', () => {
    it('only MIDI remote variants pass duct filter', () => {
      const detectors = designer.filterDetectors({ gas: 'R744', location: 'duct' });
      for (const d of detectors) {
        if (d.family === 'GLACIAR MIDI') {
          expect(d.variant!.toLowerCase()).toContain('remote');
        }
      }
      // MIDI integrated should NOT be included
      expect(detectors.find(d => d.code === '31-210-32')).toBeUndefined();
      // MIDI remote SHOULD be included
      expect(detectors.find(d => d.code === '31-510-32')).toBeDefined();
    });

    it('X5 Direct Sensor Module excluded for duct', () => {
      const detectors = designer.filterDetectors({ gas: 'R744', location: 'duct' });
      expect(detectors.every(d => d.family !== 'X5 Direct Sensor Module')).toBe(true);
    });

    it('X5 Remote Sensor passes duct filter', () => {
      const detectors = designer.filterDetectors({ gas: 'R744', location: 'duct' });
      expect(detectors.some(d => d.family === 'X5 Remote Sensor')).toBe(true);
    });

    it('duct solutions include duct adapter for MIDI', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', location: 'duct', points: 2 }));
      const midiSol = solutions.find(s =>
        s.detector.family === 'GLACIAR MIDI' && s.mode === 'standalone'
      );
      if (midiSol) {
        const ductAcc = midiSol.components.find(c => c.code === '62-9041');
        expect(ductAcc).toBeDefined();
        expect(ductAcc!.qty).toBe(2); // qty = points
      }
    });
  });

  // ─── 6. Application filter ────────────────────────────────────────────────

  describe('Application filter', () => {
    it('products with empty apps pass application filter (universal)', () => {
      const detectors = designer.filterDetectors({ gas: 'R744', application: 'machine_room' });
      // All our test products have apps: '[]', so they should all pass
      expect(detectors.length).toBeGreaterThan(0);
    });

    it('products with specific apps are filtered', () => {
      const specificProduct = makeProduct({
        code: 'APP-TEST',
        type: 'detector',
        gas: '["R744"]',
        status: 'active',
        relay: 2,
        standalone: true,
        apps: '["cold_room"]',
      });
      const testDesigner = new SystemDesigner([...FULL_CATALOG, specificProduct]);

      // Should include when matching
      const matching = testDesigner.filterDetectors({ gas: 'R744', application: 'cold_room' });
      expect(matching.some(d => d.code === 'APP-TEST')).toBe(true);

      // Should exclude when not matching
      const nonMatching = testDesigner.filterDetectors({ gas: 'R744', application: 'machine_room' });
      expect(nonMatching.some(d => d.code === 'APP-TEST')).toBe(false);
    });
  });

  // ─── 7. X5 transmitter qty ────────────────────────────────────────────────

  describe('X5 transmitter qty', () => {
    it('calculates ceil(points / 2) transmitters', () => {
      // 1 point = 1 transmitter (ceil(1/2) = 1)
      let solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      let x5Sol = solutions.find(s =>
        s.detector.family === 'X5 Direct Sensor Module' && s.controller?.family === 'X5 Transmitter'
      );
      expect(x5Sol).toBeDefined();
      expect(x5Sol!.controllerQty).toBe(1);

      // 2 points = 1 transmitter (ceil(2/2) = 1)
      solutions = designer.generate(makeInputs({ gas: 'R744', points: 2 }));
      x5Sol = solutions.find(s =>
        s.detector.family === 'X5 Direct Sensor Module' && s.controller?.family === 'X5 Transmitter'
      );
      expect(x5Sol!.controllerQty).toBe(1);

      // 3 points = 2 transmitters (ceil(3/2) = 2)
      solutions = designer.generate(makeInputs({ gas: 'R744', points: 3 }));
      x5Sol = solutions.find(s =>
        s.detector.family === 'X5 Direct Sensor Module' && s.controller?.family === 'X5 Transmitter'
      );
      expect(x5Sol!.controllerQty).toBe(2);

      // 5 points = 3 transmitters (ceil(5/2) = 3)
      solutions = designer.generate(makeInputs({ gas: 'R744', points: 5 }));
      x5Sol = solutions.find(s =>
        s.detector.family === 'X5 Direct Sensor Module' && s.controller?.family === 'X5 Transmitter'
      );
      expect(x5Sol!.controllerQty).toBe(3);
    });
  });

  // ─── 8. Alert qty standalone ──────────────────────────────────────────────

  describe('Alert qty standalone', () => {
    it('beacons = sirens = points for standalone', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 3 }));
      const standalone = solutions.find(s =>
        s.mode === 'standalone' && s.detector.family === 'GLACIAR MIDI'
      );
      expect(standalone).toBeDefined();
      expect(standalone!.alertQty.beacons).toBe(3);
      expect(standalone!.alertQty.sirens).toBe(3);
    });

    it('standalone with 1 point has 1 beacon + 1 siren', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const standalone = solutions.find(s =>
        s.mode === 'standalone' && s.detector.family === 'GLACIAR MIDI'
      );
      expect(standalone!.alertQty.beacons).toBe(1);
      expect(standalone!.alertQty.sirens).toBe(1);
    });
  });

  // ─── 9. Alert qty centralized GC10 ───────────────────────────────────────

  describe('Alert qty centralized GC10', () => {
    it('beacons = 1, sirens = 1 for GC10 centralized', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 5 }));
      const gc10Sol = solutions.find(s =>
        s.mode === 'centralized' && s.controller?.family === 'GLACIAR Controller 10' &&
        s.detector.family === 'GLACIAR MIDI'
      );
      expect(gc10Sol).toBeDefined();
      expect(gc10Sol!.alertQty.beacons).toBe(1);
      expect(gc10Sol!.alertQty.sirens).toBe(1);
    });

    it('X5 Transmitter: alerts scale with transmitter count', () => {
      // 5 points = 3 transmitters => 3 beacons, 3 sirens
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 5 }));
      const x5Sol = solutions.find(s =>
        s.controller?.family === 'X5 Transmitter' && s.detector.family === 'X5 Direct Sensor Module'
      );
      expect(x5Sol).toBeDefined();
      expect(x5Sol!.alertQty.beacons).toBe(3); // ceil(5/2)=3 transmitters * 1
      expect(x5Sol!.alertQty.sirens).toBe(3);
    });
  });

  // ─── 10. Power adapter ────────────────────────────────────────────────────

  describe('Power adapter', () => {
    it('included when 230V site and detector needs 24V', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', voltage: '230V AC', points: 1 }));
      const midiSA = solutions.find(s =>
        s.mode === 'standalone' && s.detector.family === 'GLACIAR MIDI'
      );
      expect(midiSA).toBeDefined();
      const adapter = midiSA!.components.find(c => c.code === '4000-0002');
      expect(adapter).toBeDefined();
      expect(adapter!.qty).toBe(1);
    });

    it('adapter qty scales: ceil(points / 5)', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', voltage: '230V AC', points: 7 }));
      const midiSA = solutions.find(s =>
        s.mode === 'standalone' && s.detector.family === 'GLACIAR MIDI'
      );
      expect(midiSA).toBeDefined();
      const adapter = midiSA!.components.find(c => c.code === '4000-0002');
      expect(adapter!.qty).toBe(2); // ceil(7/5) = 2
    });

    it('NOT included when controller powers detectors (GC10)', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', voltage: '230V AC', points: 1 }));
      const gc10Sol = solutions.find(s =>
        s.mode === 'centralized' && s.controller?.family === 'GLACIAR Controller 10' &&
        s.detector.family === 'GLACIAR MIDI'
      );
      expect(gc10Sol).toBeDefined();
      const adapter = gc10Sol!.components.find(c => c.code === '4000-0002');
      expect(adapter).toBeUndefined(); // GC10 has powersDetectors=true
    });

    it('NOT included when voltage is not 230V', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', voltage: '24V DC/AC', points: 1 }));
      const midiSA = solutions.find(s =>
        s.mode === 'standalone' && s.detector.family === 'GLACIAR MIDI'
      );
      expect(midiSA).toBeDefined();
      const adapter = midiSA!.components.find(c => c.code === '4000-0002');
      expect(adapter).toBeUndefined();
    });
  });

  // ─── 11. Planned products excluded ────────────────────────────────────────

  describe('Planned products excluded', () => {
    it('planned detectors are filtered out', () => {
      const detectors = designer.filterDetectors({ gas: 'R1234yf' });
      expect(detectors).toHaveLength(0);
    });

    it('planned products do not appear in solutions', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R1234yf', points: 1 }));
      expect(solutions).toHaveLength(0);
    });
  });

  // ─── 12. MICRO standalone only ────────────────────────────────────────────

  describe('MICRO standalone only', () => {
    it('MICRO has no compatible controllers', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R290', points: 1 }));
      const microCentralized = solutions.find(s =>
        s.detector.family === 'GLACIAR MICRO' && s.mode === 'centralized'
      );
      expect(microCentralized).toBeUndefined();
    });

    it('MICRO has no relay outputs, so no standalone solution either', () => {
      // MICRO: relay=0, standalone=true but relay check prevents standalone
      const solutions = designer.generate(makeInputs({ gas: 'R290', points: 1 }));
      const microSA = solutions.find(s =>
        s.detector.family === 'GLACIAR MICRO' && s.mode === 'standalone'
      );
      expect(microSA).toBeUndefined();
    });
  });

  // ─── Additional tests ─────────────────────────────────────────────────────

  describe('getAvailableGases', () => {
    it('returns sorted unique gases from active products', () => {
      const gases = designer.getAvailableGases();
      expect(gases).toContain('R744');
      expect(gases).toContain('R717');
      expect(gases).toContain('R290');
      expect(gases).toContain('R32');
      // Planned product gas should still be listed (getAvailableGases doesn't filter by status)
      expect(gases).toContain('R1234yf');
      // Should be sorted
      for (let i = 1; i < gases.length; i++) {
        expect(gases[i].localeCompare(gases[i - 1])).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('getDetectorFamilies', () => {
    it('returns sorted unique families', () => {
      const families = designer.getDetectorFamilies();
      expect(families).toContain('GLACIAR MIDI');
      expect(families).toContain('GLACIAR MICRO');
      expect(families).toContain('X5 Direct Sensor Module');
      expect(families).toContain('X5 Remote Sensor');
    });
  });

  describe('Solution pricing', () => {
    it('total is sum of required component subtotals', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const midiSA = solutions.find(s =>
        s.mode === 'standalone' && s.detector.family === 'GLACIAR MIDI'
      );
      expect(midiSA).toBeDefined();

      const requiredSum = midiSA!.components
        .filter(c => !c.optional && c.unitPrice > 0)
        .reduce((sum, c) => sum + c.subtotal, 0);
      expect(midiSA!.total).toBe(requiredSum);
    });

    it('optionalTotal includes only optional components', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const midiSA = solutions.find(s =>
        s.mode === 'standalone' && s.detector.family === 'GLACIAR MIDI'
      );
      const optSum = midiSA!.components
        .filter(c => c.optional)
        .reduce((sum, c) => sum + c.subtotal, 0);
      expect(midiSA!.optionalTotal).toBe(optSum);
    });

    it('solutions sorted by total price ascending', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 2 }));
      for (let i = 1; i < solutions.length; i++) {
        expect(solutions[i].total).toBeGreaterThanOrEqual(solutions[i - 1].total);
      }
    });
  });

  describe('Solution tier and mode', () => {
    it('tier matches detector tier', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      for (const s of solutions) {
        expect(s.tier).toBe(s.detector.tier);
      }
    });

    it('standalone solutions have mode=standalone', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const standalone = solutions.filter(s => s.mode === 'standalone');
      for (const s of standalone) {
        expect(s.controller).toBeNull();
      }
    });

    it('centralized solutions have mode=centralized', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const centralized = solutions.filter(s => s.mode === 'centralized');
      for (const s of centralized) {
        expect(s.controller).not.toBeNull();
      }
    });
  });

  describe('BOM components', () => {
    it('detector component has correct qty = points', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 4 }));
      const midiSA = solutions.find(s =>
        s.mode === 'standalone' && s.detector.family === 'GLACIAR MIDI'
      );
      const detComp = midiSA!.components.find(c => c.role === 'detector');
      expect(detComp!.qty).toBe(4);
    });

    it('subtotal = unitPrice * qty', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 3 }));
      for (const s of solutions) {
        for (const c of s.components) {
          expect(c.subtotal).toBe(c.unitPrice * c.qty);
        }
      }
    });
  });

  describe('X5 Config accessories', () => {
    it('Config A (direct sensor) has no extra accessories', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const x5Direct = solutions.find(s =>
        s.detector.family === 'X5 Direct Sensor Module' && s.controller?.family === 'X5 Transmitter'
      );
      expect(x5Direct).toBeDefined();
      // Config A should NOT have D44, Cable Gland, Stopping Plug
      const d44 = x5Direct!.components.find(c => c.code === '3500-0029');
      expect(d44).toBeUndefined();
    });

    it('Config C (remote sensor) has D44, Cable Gland, Stopping Plug', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const x5Remote = solutions.find(s =>
        s.detector.family === 'X5 Remote Sensor' && s.controller?.family === 'X5 Transmitter'
      );
      expect(x5Remote).toBeDefined();
      // Config C should have all three
      const d44 = x5Remote!.components.find(c => c.code === '3500-0029');
      expect(d44).toBeDefined();
      expect(d44!.qty).toBe(1);

      const gland = x5Remote!.components.find(c => c.code === '3500-0030');
      expect(gland).toBeDefined();
      expect(gland!.qty).toBe(4);

      const plug = x5Remote!.components.find(c => c.code === '3500-0031');
      expect(plug).toBeDefined();
      expect(plug!.qty).toBe(1);
    });
  });

  describe('Voltage filter', () => {
    it('12V DC only shows 12V-compatible products', () => {
      const detectors = designer.filterDetectors({ gas: 'R290', voltage: '12V DC' });
      // MICRO has 12 VDC voltage
      expect(detectors.some(d => d.family === 'GLACIAR MICRO')).toBe(true);
    });

    it('24V DC/AC shows 24V products', () => {
      const detectors = designer.filterDetectors({ gas: 'R744', voltage: '24V DC/AC' });
      expect(detectors.some(d => d.family === 'GLACIAR MIDI')).toBe(true);
    });

    it('X5 sensors with no voltage pass all voltage filters', () => {
      const det12 = designer.filterDetectors({ gas: 'R744', voltage: '12V DC' });
      const det24 = designer.filterDetectors({ gas: 'R744', voltage: '24V DC/AC' });
      const det230 = designer.filterDetectors({ gas: 'R744', voltage: '230V AC' });

      for (const dets of [det12, det24, det230]) {
        expect(dets.some(d => d.family.includes('X5'))).toBe(true);
      }
    });
  });

  describe('Measurement type filter', () => {
    it('ppm filter returns ppm-range products', () => {
      const detectors = designer.filterDetectors({ gas: 'R744', measType: 'ppm' });
      for (const d of detectors) {
        if (d.range) {
          expect(d.range.toLowerCase()).toContain('ppm');
        }
      }
    });

    it('vol filter returns vol-range products', () => {
      const detectors = designer.filterDetectors({ gas: 'R744', measType: 'vol' });
      for (const d of detectors) {
        if (d.range) {
          expect(d.range.toLowerCase()).toContain('vol');
        }
      }
    });
  });

  describe('Pipe location', () => {
    it('MIDI integrated excluded, MIDI remote included', () => {
      const detectors = designer.filterDetectors({ gas: 'R744', location: 'pipe' });
      expect(detectors.find(d => d.code === '31-210-32')).toBeUndefined();
      expect(detectors.find(d => d.code === '31-510-32')).toBeDefined();
    });

    it('pipe solutions include pipe adapter', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', location: 'pipe', points: 3 }));
      const midiSol = solutions.find(s =>
        s.detector.family === 'GLACIAR MIDI' && s.mode === 'standalone'
      );
      if (midiSol) {
        const pipeAcc = midiSol.components.find(c => c.code === '62-9031');
        expect(pipeAcc).toBeDefined();
        expect(pipeAcc!.qty).toBe(3);
      }
    });
  });

  describe('Connection label', () => {
    it('MIDI + GC10 shows 4-20mA connection label', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const midiGC10 = solutions.find(s =>
        s.mode === 'centralized' &&
        s.detector.family === 'GLACIAR MIDI' &&
        s.controller?.family === 'GLACIAR Controller 10'
      );
      expect(midiGC10).toBeDefined();
      expect(midiGC10!.connectionLabel).toContain('4-20mA');
    });

    it('X5 Direct + Transmitter shows Direct mount connection type', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      const x5Sol = solutions.find(s =>
        s.detector.family === 'X5 Direct Sensor Module' && s.controller?.family === 'X5 Transmitter'
      );
      expect(x5Sol).toBeDefined();
      expect(x5Sol!.connectionLabel).toContain('Direct');
    });
  });

  describe('GC10 controller qty', () => {
    it('1 GC10 for up to 10 detectors', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 10 }));
      const gc10Sol = solutions.find(s =>
        s.controller?.family === 'GLACIAR Controller 10' &&
        s.detector.family === 'GLACIAR MIDI'
      );
      expect(gc10Sol!.controllerQty).toBe(1);
    });

    it('2 GC10 for 11 detectors', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 11 }));
      const gc10Sol = solutions.find(s =>
        s.controller?.family === 'GLACIAR Controller 10' &&
        s.detector.family === 'GLACIAR MIDI'
      );
      expect(gc10Sol!.controllerQty).toBe(2);
    });
  });

  describe('hasNaPrice flag', () => {
    it('false when all required components have price > 0', () => {
      const solutions = designer.generate(makeInputs({ gas: 'R744', points: 1 }));
      for (const s of solutions) {
        const allHavePrice = s.components
          .filter(c => !c.optional)
          .every(c => c.unitPrice > 0);
        if (allHavePrice) {
          expect(s.hasNaPrice).toBe(false);
        }
      }
    });

    it('true when a required component has price = 0', () => {
      const zeroPriceProduct = makeProduct({
        code: 'ZERO-PRICE',
        type: 'detector',
        family: 'GLACIAR MIDI',
        gas: '["R999"]',
        status: 'active',
        price: 0,
        relay: 2,
        standalone: true,
        voltage: '24 VDC',
        compatibleWith: '[]',
      });
      const testDesigner = new SystemDesigner([...FULL_CATALOG, zeroPriceProduct]);
      const solutions = testDesigner.generate(makeInputs({ gas: 'R999', points: 1 }));
      const sol = solutions.find(s => s.detector.code === 'ZERO-PRICE');
      expect(sol).toBeDefined();
      expect(sol!.hasNaPrice).toBe(true);
    });
  });
});
