// ─────────────────────────────────────────────────────────────────────────────
// SAMON System Designer Engine — Pure TypeScript, no browser dependencies
//
// Reusable module that generates system design solutions from a product catalog.
// Import into any Node.js/TypeScript project.
//
// Usage:
//   import { SystemDesigner } from './engine.js';
//   const designer = SystemDesigner.fromBundle('viewer/products.bundle.json');
//   const solutions = designer.generate({ gas: 'R744', atex: false, ... });
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { ResolvedProduct, Port, ConnectionRules, Specs, SpecCategory } from './types.js';

// ═══════════════════════════════════════════════════════════════════════════════
//  Public types
// ═══════════════════════════════════════════════════════════════════════════════

export interface DesignerInputs {
  gas: string;
  atex: boolean;
  voltage: string;        // '12V DC' | '24V DC/AC' | '230V AC' | ''
  location: string;       // 'ambient' | 'duct' | 'pipe'
  outputs: string[];      // ['4-20mA', 'Modbus RTU', 'Relay', '0-10V']
  measType: string;       // 'ppm' | '%LEL' | '%Vol' | '' (internally: 'ppm' | 'lel' | 'vol' | '')
  points: number;         // 1-20
}

export interface BomComponent {
  product: ResolvedProduct;
  qty: number;
  role: 'detector' | 'controller' | 'alert' | 'accessory';
  optional: boolean;
}

export interface AlertQty {
  beacons: number;
  sirens: number;
}

export interface Solution {
  name: string;
  subtitle: string;
  detector: ResolvedProduct;
  controller: ResolvedProduct | null;
  controllerQty: number;
  components: BomComponent[];
  total: number;           // required items only
  optionalTotal: number;   // optional items only
  hasNaPrice: boolean;
  alertQty: AlertQty;
  connectionLabel: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SystemDesigner class
// ═══════════════════════════════════════════════════════════════════════════════

export class SystemDesigner {
  private products: ResolvedProduct[];

  constructor(products: ResolvedProduct[]) {
    this.products = products;
  }

  /** Load from a bundle JSON file (Node.js) */
  static fromBundle(bundlePath: string): SystemDesigner {
    const resolved = resolve(bundlePath);
    const bundle = JSON.parse(readFileSync(resolved, 'utf-8'));
    return new SystemDesigner(bundle.products);
  }

  /** Load from product array */
  static fromProducts(products: ResolvedProduct[]): SystemDesigner {
    return new SystemDesigner(products);
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Generate all valid solutions for given inputs */
  generate(inputs: DesignerInputs): Solution[] {
    const products = this.products;
    const location = inputs.location || 'ambient';
    const points = inputs.points;

    // Step 1: Filter detectors/sensors
    const detectors = products.filter((p) => {
      if (p.type !== 'detector' && p.type !== 'sensor') return false;
      if (!p.gases || !p.gases.includes(inputs.gas)) return false;
      if (inputs.measType && !this.measTypeMatches(p, inputs.measType)) return false;
      if (inputs.atex) {
        const atexVal = p.specs?.regulatory?.atex?.value;
        if (!atexVal) return false;
      }
      if (inputs.voltage && !this.voltageMatches(p, inputs.voltage)) return false;
      // Location filter
      if (location === 'duct' || location === 'pipe') {
        if (p.family === 'GLACIAR MIDI') {
          const variantLower = (p.variant || '').toLowerCase();
          if (!variantLower.includes('remote')) return false;
        }
        if (p.family === 'X5 Direct Sensor Module') return false;
      }
      return true;
    });

    const solutions: Solution[] = [];

    detectors.forEach((det) => {
      const controllers = this.findCompatibleControllers(det);

      // For each controller combo
      controllers.forEach((ctrl) => {
        const comboPorts = [...det.ports, ...ctrl.ports];
        const comboProduct = { ports: comboPorts } as ResolvedProduct;
        if (!this.hasRequiredOutputs(comboProduct, inputs.outputs)) return;

        const compatFamilies = [det.family, ctrl.family].filter(Boolean);
        const { beacon, siren } = this.findAlertProducts(compatFamilies);

        const ctrlQty = this.calculateControllerQty(ctrl, points);
        const alertQty = this.calculateAlertQty(det, ctrl, points);
        const adapterQty = this.calculateAdapterQty(det, ctrl, points, inputs.voltage);
        const accessories = this.findAccessories(det.family, adapterQty > 0, adapterQty);
        const x5ConfigAccs = this.findX5ConfigAccessories(det, ctrl, points);

        const components: BomComponent[] = [];
        components.push({ product: det, qty: points, role: 'detector', optional: false });
        components.push({ product: ctrl, qty: ctrlQty, role: 'controller', optional: false });

        if (beacon) components.push({ product: beacon, qty: alertQty.beacons, role: 'alert', optional: false });
        if (siren && (!beacon || siren.code !== beacon.code)) {
          components.push({ product: siren, qty: alertQty.sirens, role: 'alert', optional: false });
        }

        // Required accessories first (power adapter)
        accessories.filter((a) => !a.optional).forEach((a) => components.push({ product: a.product, qty: a.qty, role: 'accessory', optional: false }));
        x5ConfigAccs.forEach((a) => components.push({ product: a.product, qty: a.qty, role: 'accessory', optional: false }));

        // Location accessories (duct/pipe adapters) — required
        const locationAccs = this.findLocationAccessories(det, location, points, ctrlQty);
        locationAccs.forEach((a) => components.push({ product: a.product, qty: a.qty, role: 'accessory', optional: false }));

        // Optional accessories (calibration kits, suggestions)
        accessories.filter((a) => a.optional).forEach((a) => components.push({ product: a.product, qty: a.qty, role: 'accessory', optional: true }));
        const optAccs = this.findOptionalAccessories(det.family);
        optAccs.forEach((a) => {
          if (!components.some((c) => c.product.code === a.product.code)) {
            components.push({ product: a.product, qty: a.qty, role: 'accessory', optional: true });
          }
        });

        let total = 0;
        let optionalTotal = 0;
        let hasNaPrice = false;
        components.forEach((c) => {
          const price = this.getPrice(c.product);
          if (price != null) {
            if (c.optional) {
              optionalTotal += price * c.qty;
            } else {
              total += price * c.qty;
            }
          } else {
            if (!c.optional) hasNaPrice = true;
          }
        });

        const connLabel = this.getConnectionLabel(det, ctrl);

        solutions.push({
          name: det.family + ' + ' + ctrl.name,
          subtitle: det.name,
          detector: det,
          controller: ctrl,
          controllerQty: ctrlQty,
          components,
          total,
          optionalTotal,
          hasNaPrice,
          alertQty,
          connectionLabel: connLabel,
        });
      });

      // Standalone option
      if (this.hasRelayOutput(det) && this.hasRequiredOutputs(det, inputs.outputs)) {
        const compatFamilies = [det.family];
        const { beacon, siren } = this.findAlertProducts(compatFamilies);

        const alertQty = this.calculateAlertQty(det, null, points);
        const adapterQty = this.calculateAdapterQty(det, null, points, inputs.voltage);
        const accessories = this.findAccessories(det.family, adapterQty > 0, adapterQty);

        const saComponents: BomComponent[] = [];
        saComponents.push({ product: det, qty: points, role: 'detector', optional: false });

        if (beacon) saComponents.push({ product: beacon, qty: alertQty.beacons, role: 'alert', optional: false });
        if (siren && (!beacon || siren.code !== beacon.code)) {
          saComponents.push({ product: siren, qty: alertQty.sirens, role: 'alert', optional: false });
        }

        // Required accessories first (power adapter)
        accessories.filter((a) => !a.optional).forEach((a) => saComponents.push({ product: a.product, qty: a.qty, role: 'accessory', optional: false }));

        // Location accessories (duct/pipe adapters) — required
        const saLocationAccs = this.findLocationAccessories(det, location, points, 0);
        saLocationAccs.forEach((a) => saComponents.push({ product: a.product, qty: a.qty, role: 'accessory', optional: false }));

        // Optional accessories
        accessories.filter((a) => a.optional).forEach((a) => saComponents.push({ product: a.product, qty: a.qty, role: 'accessory', optional: true }));
        const saOptAccs = this.findOptionalAccessories(det.family);
        saOptAccs.forEach((a) => {
          if (!saComponents.some((c) => c.product.code === a.product.code)) {
            saComponents.push({ product: a.product, qty: a.qty, role: 'accessory', optional: true });
          }
        });

        let saTotal = 0;
        let saOptionalTotal = 0;
        let saHasNaPrice = false;
        saComponents.forEach((c) => {
          const price = this.getPrice(c.product);
          if (price != null) {
            if (c.optional) {
              saOptionalTotal += price * c.qty;
            } else {
              saTotal += price * c.qty;
            }
          } else {
            if (!c.optional) saHasNaPrice = true;
          }
        });

        solutions.push({
          name: det.family + ' -- Standalone',
          subtitle: det.name,
          detector: det,
          controller: null,
          controllerQty: 0,
          components: saComponents,
          total: saTotal,
          optionalTotal: saOptionalTotal,
          hasNaPrice: saHasNaPrice,
          alertQty,
          connectionLabel: null,
        });
      }
    });

    solutions.sort((a, b) => a.total - b.total);
    return solutions;
  }

  /** Get all unique gases in the product database */
  getAvailableGases(): string[] {
    const gases = new Set<string>();
    for (const p of this.products) {
      if ((p.type === 'detector' || p.type === 'sensor') && p.gases) {
        for (const g of p.gases) gases.add(g);
      }
    }
    return [...gases].sort();
  }

  /** Get all detector families */
  getDetectorFamilies(): string[] {
    const families = new Set<string>();
    for (const p of this.products) {
      if (p.type === 'detector' || p.type === 'sensor') {
        families.add(p.family);
      }
    }
    return [...families].sort();
  }

  /** Filter detectors by criteria (without generating full solutions) */
  filterDetectors(inputs: Partial<DesignerInputs>): ResolvedProduct[] {
    return this.products.filter((p) => {
      if (p.type !== 'detector' && p.type !== 'sensor') return false;
      if (inputs.gas && (!p.gases || !p.gases.includes(inputs.gas))) return false;
      if (inputs.measType && !this.measTypeMatches(p, inputs.measType)) return false;
      if (inputs.atex) {
        const atexVal = p.specs?.regulatory?.atex?.value;
        if (!atexVal) return false;
      }
      if (inputs.voltage && !this.voltageMatches(p, inputs.voltage)) return false;
      const loc = inputs.location || 'ambient';
      if (loc === 'duct' || loc === 'pipe') {
        if (p.family === 'GLACIAR MIDI') {
          const variantLower = (p.variant || '').toLowerCase();
          if (!variantLower.includes('remote')) return false;
        }
        if (p.family === 'X5 Direct Sensor Module') return false;
      }
      return true;
    });
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private voltageMatches(product: ResolvedProduct, selectedVoltage: string): boolean {
    const spec = (product.specs?.electrical as SpecCategory | undefined)?.supplyVoltage;
    if (!spec || !spec.value) {
      const fam = (product.family || '').toLowerCase();
      if (fam.includes('x5')) return true;
      return false;
    }
    const pv = String(spec.value).toLowerCase() + ' ' + (spec.unit || '').toLowerCase();

    if (selectedVoltage === '12V DC') {
      return pv.includes('12');
    }
    if (selectedVoltage === '24V DC/AC') {
      return pv.includes('24') || pv.includes('12-24');
    }
    if (selectedVoltage === '230V AC') {
      return pv.includes('230') || pv.includes('24') || pv.includes('12-24');
    }
    return true;
  }

  private hasRequiredOutputs(product: ResolvedProduct, requiredOutputs: string[]): boolean {
    if (requiredOutputs.length === 0) return true;

    const outPorts = (product.ports || []).filter((pt: Port) =>
      pt.direction === 'output' || pt.direction === 'bidirectional'
    );

    return requiredOutputs.every((reqOut: string) => {
      return outPorts.some((pt: Port) => {
        const proto = (pt.protocol || '').toLowerCase();
        const sig = (pt.signalType || '').toLowerCase();
        const name = (pt.name || '').toLowerCase();

        if (reqOut === '4-20mA') return proto.includes('4-20ma') || name.includes('4-20ma');
        if (reqOut === 'Modbus RTU') return proto.includes('modbus');
        if (reqOut === 'Relay') return sig === 'relay' || proto.includes('relay') || proto.includes('dry contact');
        if (reqOut === '0-10V') return proto.includes('0-10v') || name.includes('0-10v');
        return false;
      });
    });
  }

  private hasRelayOutput(product: ResolvedProduct): boolean {
    return (product.ports || []).some((pt: Port) =>
      (pt.direction === 'output' || pt.direction === 'bidirectional') &&
      ((pt.signalType || '').toLowerCase() === 'relay' ||
       (pt.protocol || '').toLowerCase().includes('dry contact'))
    );
  }

  private detectorNeedsPowerAdapter(product: ResolvedProduct, selectedVoltage: string): boolean {
    if (selectedVoltage !== '230V AC') return false;
    const spec = (product.specs?.electrical as SpecCategory | undefined)?.supplyVoltage;
    if (!spec || !spec.value) return false;
    const pv = String(spec.value).toLowerCase();
    return !pv.includes('230');
  }

  private getMeasurementType(product: ResolvedProduct): string {
    const perf = product.specs?.performance as SpecCategory | undefined;
    if (!perf || !perf.range) return '';
    const rangeVal = String(perf.range.value || '').toLowerCase();
    const rangeUnit = String(perf.range.unit || '').toLowerCase();
    const combined = rangeVal + ' ' + rangeUnit;

    if (combined.includes('lel') || combined.includes('lfl')) return 'lel';
    if (combined.includes('vol') || combined.includes('% vol')) return 'vol';
    if (combined.includes('ppm')) return 'ppm';
    return '';
  }

  private measTypeMatches(product: ResolvedProduct, selectedMeasType: string): boolean {
    if (!selectedMeasType) return true;
    const prodType = this.getMeasurementType(product);
    if (!prodType) return true;
    return prodType === selectedMeasType;
  }

  private getPrice(product: ResolvedProduct): number | null {
    const com = product.specs?.commercial as SpecCategory | undefined;
    if (!com?.price) return null;
    const v = com.price.value;
    return typeof v === 'number' ? v : null;
  }

  private getConnRules(product: ResolvedProduct): Record<string, any> {
    return (product.connectionRules as Record<string, any>) || {};
  }

  private getConnectionLabel(detector: ResolvedProduct, controller: ResolvedProduct | null): string | null {
    if (!controller) return null;
    const detRules = this.getConnRules(detector);
    const ctrlRules = this.getConnRules(controller);

    if (ctrlRules.maxSensorModules) {
      // X5 system
      const connType = (detector.connectionRules as any)?.connectionType
        || detRules.connectionType || 'Direct/Remote';
      return connType;
    }

    // GC10 or similar — MIDI connects via 4-20mA only
    return detRules.connectionToController || '4-20mA';
  }

  private findCompatibleControllers(detector: ResolvedProduct): ResolvedProduct[] {
    const controllers: ResolvedProduct[] = [];
    if (detector.compatibleWith && detector.compatibleWith.length > 0) {
      detector.compatibleWith.forEach((familyName: string) => {
        const ctrl = this.products.find((p) =>
          p.type === 'controller' && (p.family === familyName || p.name.includes(familyName))
        );
        if (ctrl) controllers.push(ctrl);
      });
    }
    return controllers;
  }

  private findAlertProducts(compatFamilies: string[]): { beacon: ResolvedProduct | null; siren: ResolvedProduct | null } {
    const alerts = this.products.filter((p) => p.type === 'alert');
    let beacon: ResolvedProduct | null = null;
    let siren: ResolvedProduct | null = null;

    for (const a of alerts) {
      if (!a.compatibleWith) continue;
      const isCompat = a.compatibleWith.some((f: string) => compatFamilies.includes(f));
      if (!isCompat) continue;

      if (!beacon && (a.subType === 'beacon' || a.subType === 'socket_beacon')) {
        beacon = a;
      }
      if (!siren && a.subType === 'siren') {
        siren = a;
      }
      if (a.subType === 'beacon_siren_combo') {
        if (!beacon) beacon = a;
        if (!siren) siren = a;
      }
      if (beacon && siren) break;
    }

    return { beacon, siren };
  }

  private findAccessories(detectorFamily: string, needsAdapter: boolean, adapterQty: number): { product: ResolvedProduct; qty: number; optional: boolean }[] {
    const accs: { product: ResolvedProduct; qty: number; optional: boolean }[] = [];
    const accessories = this.products.filter((p) => p.type === 'accessory');

    // Calibration kit — OPTIONAL
    const calKit = accessories.find((a) =>
      a.compatibleWith && a.compatibleWith.includes(detectorFamily) &&
      (a.name.toLowerCase().includes('calibration kit') || a.name.toLowerCase().includes('calibration kit'))
    ) || accessories.find((a) =>
      a.subType === 'calibration_kit' &&
      a.compatibleWith && a.compatibleWith.includes(detectorFamily)
    );
    if (calKit) accs.push({ product: calKit, qty: 1, optional: true });

    // Power adapter — REQUIRED (230V site)
    if (needsAdapter && adapterQty > 0) {
      const adapter = accessories.find((a) =>
        a.subType === 'power_adapter' &&
        a.compatibleWith && a.compatibleWith.includes(detectorFamily)
      );
      if (adapter) accs.push({ product: adapter, qty: adapterQty, optional: false });
    }

    return accs;
  }

  private findOptionalAccessories(detectorFamily: string): { product: ResolvedProduct; qty: number; optional: boolean }[] {
    const opts: { product: ResolvedProduct; qty: number; optional: boolean }[] = [];
    const accessories = this.products.filter((p) => p.type === 'accessory');

    const wand = accessories.find((a) =>
      a.compatibleWith && a.compatibleWith.includes(detectorFamily) &&
      (a.subType === 'magnetic_wand' || a.name.toLowerCase().includes('magnetic wand'))
    );
    if (wand) opts.push({ product: wand, qty: 1, optional: true });

    const cap = accessories.find((a) =>
      a.compatibleWith && a.compatibleWith.includes(detectorFamily) &&
      (a.subType === 'protection_cap' || (a.name.toLowerCase().includes('protection cap') && !a.name.toLowerCase().includes('delivery')))
    );
    if (cap) opts.push({ product: cap, qty: 1, optional: true });

    return opts;
  }

  private findX5ConfigAccessories(sensor: ResolvedProduct, controller: ResolvedProduct, sensorQty: number): { product: ResolvedProduct; qty: number; reason?: string }[] {
    const accs: { product: ResolvedProduct; qty: number; reason?: string }[] = [];
    if (!controller || controller.family !== 'X5 Transmitter') return accs;
    const configs = (controller.connectionRules as any)?.configurations;
    if (!configs) return accs;

    const isRemote = sensor.family === 'X5 Remote Sensor' ||
      ((sensor.connectionRules as any)?.connectionType === 'Remote highway cable');
    const isDirect = sensor.family === 'X5 Direct Sensor Module' ||
      ((sensor.connectionRules as any)?.connectionType === 'Direct mount (Port A/B)');

    let config: any = null;
    if (isDirect && !isRemote) {
      config = configs['A'];
    } else if (isRemote && !isDirect) {
      config = configs['C'];
    } else {
      config = configs['B'];
    }

    if (!config || !config.requiredAccessories || config.requiredAccessories.length === 0) return accs;

    const includedMap: Record<string, number> = {};
    if (controller.includedItems) {
      controller.includedItems.forEach((item) => {
        if (item.code) {
          includedMap[item.code] = (includedMap[item.code] || 0) + item.qty;
        }
      });
    }

    const allAccessories = this.products.filter((p) => p.type === 'accessory');
    config.requiredAccessories.forEach((req: any) => {
      let neededQty = req.qty;
      if (includedMap[req.code]) {
        neededQty = Math.max(0, neededQty - includedMap[req.code]);
      }
      if (neededQty <= 0) return;

      const product = allAccessories.find((a) => a.code === req.code);
      if (product) {
        accs.push({ product, qty: neededQty, reason: req.reason });
      }
    });

    return accs;
  }

  private findLocationAccessories(detector: ResolvedProduct, location: string, detectorQty: number, transmitterQty: number): { product: ResolvedProduct; qty: number; role: 'accessory'; optional: boolean }[] {
    const accs: { product: ResolvedProduct; qty: number; role: 'accessory'; optional: boolean }[] = [];
    if (!location || location === 'ambient') return accs;

    const allAcc = this.products.filter((p) => p.type === 'accessory');

    if (location === 'duct') {
      if (detector.family === 'GLACIAR MIDI') {
        const ductAdapter = allAcc.find((p) => p.code === '62-9041');
        if (ductAdapter) accs.push({ product: ductAdapter, qty: detectorQty, role: 'accessory', optional: false });
      } else if (detector.family.includes('X5')) {
        const ductAdapter = allAcc.find((p) => p.code === '3500-0104');
        if (ductAdapter) accs.push({ product: ductAdapter, qty: transmitterQty || 1, role: 'accessory', optional: false });
      }
    }

    if (location === 'pipe') {
      if (detector.family === 'GLACIAR MIDI') {
        const pipeAdapter = allAcc.find((p) => p.code === '62-9031');
        if (pipeAdapter) accs.push({ product: pipeAdapter, qty: detectorQty, role: 'accessory', optional: false });
      } else if (detector.family.includes('X5')) {
        const pipeAdapter = allAcc.find((p) => p.code === '3500-0105');
        if (pipeAdapter) accs.push({ product: pipeAdapter, qty: transmitterQty || 1, role: 'accessory', optional: false });
      }
    }

    return accs;
  }

  private calculateAlertQty(detector: ResolvedProduct, controller: ResolvedProduct | null, points: number): AlertQty {
    if (!controller) {
      return { beacons: points, sirens: points };
    }

    const ctrlRules = this.getConnRules(controller);

    if (controller.family === 'X5 Transmitter' || ctrlRules.maxSensorModules) {
      const maxPerTransmitter = ctrlRules.maxSensorModules || 2;
      const transmitterCount = Math.ceil(points / maxPerTransmitter);
      const beaconsPerT = ctrlRules.beaconsPerTransmitter || 1;
      const sirensPerT = ctrlRules.sirensPerTransmitter || 1;
      return {
        beacons: transmitterCount * beaconsPerT,
        sirens: transmitterCount * sirensPerT,
      };
    }

    const beaconsNeeded = ctrlRules.beaconsNeeded || 1;
    const sirensNeeded = ctrlRules.sirensNeeded || 1;
    return { beacons: beaconsNeeded, sirens: sirensNeeded };
  }

  private calculateControllerQty(controller: ResolvedProduct, points: number): number {
    const ctrlRules = this.getConnRules(controller);

    if (ctrlRules.maxSensorModules) {
      return Math.ceil(points / ctrlRules.maxSensorModules);
    }

    const maxDet = ctrlRules.maxDetectors || 10;
    return Math.ceil(points / maxDet);
  }

  private calculateAdapterQty(detector: ResolvedProduct, controller: ResolvedProduct | null, points: number, selectedVoltage: string): number {
    if (selectedVoltage !== '230V AC') return 0;
    if (!this.detectorNeedsPowerAdapter(detector, selectedVoltage)) return 0;

    const ctrlRules = controller ? this.getConnRules(controller) : {};
    if (ctrlRules.powersDetectors) return 0;

    const detRules = this.getConnRules(detector);
    const capacity = detRules.powerAdapterCapacity || 5;
    return Math.ceil(points / capacity);
  }
}
