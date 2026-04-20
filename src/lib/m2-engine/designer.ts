// ─────────────────────────────────────────────────────────────────────────────
// SystemDesigner V2 — Pure TypeScript engine for SAMON system design
//
// Generates standalone + centralized solutions from a flat ProductV2 catalog.
// Replaces the old F0-F9 filter pipeline with a simpler approach.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProductV2, DesignerInputs, Solution, BomComponent, AlertQty } from './designer-types';
import { parseJson } from './designer-types';

// ═══════════════════════════════════════════════════════════════════════════════
//  SystemDesigner class
// ═══════════════════════════════════════════════════════════════════════════════

export class SystemDesigner {
  private products: ProductV2[];

  constructor(products: ProductV2[]) {
    this.products = products;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Generate all valid solutions for given inputs */
  generate(inputs: DesignerInputs): Solution[] {
    const location = inputs.location || 'ambient';
    const points = inputs.points;

    // Step 1: Filter detectors/sensors
    const detectors = this.filterDetectorsInternal(inputs);

    const solutions: Solution[] = [];

    for (const det of detectors) {
      // Step 2: Find compatible controllers
      const controllers = this.findCompatibleControllers(det);

      // Step 3: Generate centralized solutions (detector + controller)
      // Skip centralized when only 1 point UNLESS sensor requires a base (X5 → Transmitter)
      const sensorNeedsBase = !det.standalone && det.type === 'sensor';
      if (points <= 1 && !sensorNeedsBase) { /* skip centralized — 1 point, standalone is enough */ }
      else for (const ctrl of controllers) {
        const compatFamilies = [det.family, ctrl.family].filter(Boolean);
        const { beacon, siren } = this.findAlertProducts(compatFamilies);

        const ctrlQty = this.calculateControllerQty(ctrl, points);
        const alertQty = this.calculateAlertQty(det, ctrl, points);
        const adapterQty = this.calculateAdapterQty(det, ctrl, points, inputs.voltage);

        const components: BomComponent[] = [];

        // Detector
        components.push(this.toBom(det, points, 'detector', false));

        // Controller
        components.push(this.toBom(ctrl, ctrlQty, 'controller', false));

        // Alerts
        const alertCount = beacon ? alertQty.beacons : 0;
        if (beacon) {
          components.push(this.toBom(beacon, alertQty.beacons, 'alert', false));
        }
        if (siren && (!beacon || siren.code !== beacon.code)) {
          components.push(this.toBom(siren, alertQty.sirens, 'alert', false));
        }

        // SOCK-H-R-230: required for each FLRL alert on 230V sites
        if (inputs.voltage === '230V AC' && alertCount > 0) {
          const sock = this.products.find(p => p.code === '40-420' && p.status === 'active');
          if (sock) {
            components.push(this.toBom(sock, alertCount, 'accessory', false));
          }
        }

        // Power adapter (required)
        if (adapterQty > 0) {
          const adapter = this.findPowerAdapter(det.family);
          if (adapter) {
            components.push(this.toBom(adapter, adapterQty, 'accessory', false));
          }
        }

        // X5 config accessories (required)
        const x5Accs = this.findX5ConfigAccessories(det, ctrl);
        for (const acc of x5Accs) {
          components.push(this.toBom(acc.product, acc.qty, 'accessory', false, acc.reason));
        }

        // Location accessories (required)
        const locAccs = this.findLocationAccessories(det, location, points, ctrlQty);
        for (const acc of locAccs) {
          components.push(this.toBom(acc.product, acc.qty, 'accessory', false));
        }

        // Optional accessories (calibration kit, magnetic wand, protection cap)
        const optAccs = this.findOptionalAccessories(det.family);
        for (const acc of optAccs) {
          if (!components.some(c => c.code === acc.product.code)) {
            components.push(this.toBom(acc.product, acc.qty, 'accessory', true));
          }
        }

        // Calculate totals
        const { total, optionalTotal, hasNaPrice } = this.calculateTotals(components);
        const connLabel = this.getConnectionLabel(det, ctrl);

        solutions.push({
          name: `${det.family} + ${ctrl.name}`,
          subtitle: det.name,
          tier: det.tier,
          mode: 'centralized',
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
      }

      // Step 4: Generate standalone solutions
      if (det.relay > 0 && det.standalone) {
        const compatFamilies = [det.family];
        const { beacon, siren } = this.findAlertProducts(compatFamilies);

        const alertQty = this.calculateAlertQty(det, null, points);
        const adapterQty = this.calculateAdapterQty(det, null, points, inputs.voltage);

        const components: BomComponent[] = [];

        // Detector
        components.push(this.toBom(det, points, 'detector', false));

        // Alerts
        const saAlertCount = beacon ? alertQty.beacons : 0;
        if (beacon) {
          components.push(this.toBom(beacon, alertQty.beacons, 'alert', false));
        }
        if (siren && (!beacon || siren.code !== beacon.code)) {
          components.push(this.toBom(siren, alertQty.sirens, 'alert', false));
        }

        // SOCK-H-R-230: required for each FLRL alert on 230V sites
        if (inputs.voltage === '230V AC' && saAlertCount > 0) {
          const sock = this.products.find(p => p.code === '40-420' && p.status === 'active');
          if (sock) {
            components.push(this.toBom(sock, saAlertCount, 'accessory', false));
          }
        }

        // Power adapter (required)
        if (adapterQty > 0) {
          const adapter = this.findPowerAdapter(det.family);
          if (adapter) {
            components.push(this.toBom(adapter, adapterQty, 'accessory', false));
          }
        }

        // Location accessories (required)
        const locAccs = this.findLocationAccessories(det, location, points, 0);
        for (const acc of locAccs) {
          components.push(this.toBom(acc.product, acc.qty, 'accessory', false));
        }

        // Optional accessories
        const optAccs = this.findOptionalAccessories(det.family);
        for (const acc of optAccs) {
          if (!components.some(c => c.code === acc.product.code)) {
            components.push(this.toBom(acc.product, acc.qty, 'accessory', true));
          }
        }

        // Calculate totals
        const { total, optionalTotal, hasNaPrice } = this.calculateTotals(components);

        solutions.push({
          name: `${det.family} -- Standalone`,
          subtitle: det.name,
          tier: det.tier,
          mode: 'standalone',
          detector: det,
          controller: null,
          controllerQty: 0,
          components,
          total,
          optionalTotal,
          hasNaPrice,
          alertQty,
          connectionLabel: null,
        });
      }
    }

    // Step 5: Sort by total price ascending
    solutions.sort((a, b) => a.total - b.total);
    return solutions;
  }

  /** Get all unique gases in the product database */
  getAvailableGases(): string[] {
    const gases = new Set<string>();
    for (const p of this.products) {
      if (p.type === 'detector' || p.type === 'sensor') {
        const gasArr = parseJson<string[]>(p.gas, []);
        for (const g of gasArr) gases.add(g);
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
  filterDetectors(inputs: Partial<DesignerInputs>): ProductV2[] {
    return this.filterDetectorsInternal(inputs as DesignerInputs);
  }

  // ─── Private: Filtering ─────────────────────────────────────────────────────

  private filterDetectorsInternal(inputs: Partial<DesignerInputs>): ProductV2[] {
    const location = inputs.location || 'ambient';

    return this.products.filter(p => {
      // Must be detector or sensor
      if (p.type !== 'detector' && p.type !== 'sensor') return false;

      // Must be active (exclude planned and discontinued)
      if (p.status !== 'active') return false;

      // Gas filter
      if (inputs.gas) {
        const gases = parseJson<string[]>(p.gas, []);
        if (!gases.includes(inputs.gas)) return false;
      }

      // Measurement type filter
      if (inputs.measType) {
        if (!this.measTypeMatches(p, inputs.measType)) return false;
      }

      // ATEX filter
      if (inputs.atex) {
        if (!p.atex) return false;
      }

      // Voltage filter
      if (inputs.voltage) {
        if (!this.voltageMatches(p, inputs.voltage)) return false;
      }

      // Location filter
      if (location === 'duct' || location === 'pipe') {
        if (p.family === 'GLACIAR MIDI') {
          const variantLower = (p.variant || '').toLowerCase();
          if (!variantLower.includes('remote')) return false;
        }
        if (p.family === 'X5 Direct Sensor Module') return false;
      }

      // Application filter
      if (inputs.application) {
        const apps = parseJson<string[]>(p.apps, []);
        // If apps is empty, product is universal — passes filter
        if (apps.length > 0 && !apps.includes(inputs.application)) {
          return false;
        }
      }

      return true;
    });
  }

  // ─── Private: Voltage matching ──────────────────────────────────────────────

  private voltageMatches(product: ProductV2, selectedVoltage: string): boolean {
    const pv = (product.voltage || '').toLowerCase();

    // X5 sensors/modules have no voltage spec — they're powered by the transmitter
    if (!pv) {
      const fam = product.family.toLowerCase();
      if (fam.includes('x5')) return true;
      return false;
    }

    if (selectedVoltage === '12V DC') {
      return pv.includes('12');
    }
    if (selectedVoltage === '24V DC/AC') {
      return pv.includes('24') || pv.includes('12-24');
    }
    if (selectedVoltage === '230V AC') {
      // All detectors can work with 230V via adapter
      return pv.includes('230') || pv.includes('24') || pv.includes('12-24') || pv.includes('12');
    }
    return true;
  }

  // ─── Private: Measurement type matching ─────────────────────────────────────

  private getMeasurementType(product: ProductV2): string {
    const range = (product.range || '').toLowerCase();
    if (range.includes('lel') || range.includes('lfl')) return 'lel';
    if (range.includes('vol') || range.includes('% vol')) return 'vol';
    if (range.includes('ppm')) return 'ppm';
    return '';
  }

  private measTypeMatches(product: ProductV2, selectedMeasType: string): boolean {
    if (!selectedMeasType) return true;
    const prodType = this.getMeasurementType(product);
    if (!prodType) return true; // If we can't determine, let it pass
    return prodType === selectedMeasType;
  }

  // ─── Private: Compatible controllers ────────────────────────────────────────

  private findCompatibleControllers(detector: ProductV2): ProductV2[] {
    const controllers: ProductV2[] = [];
    const compatWith = parseJson<string[]>(detector.compatibleWith, []);

    for (const familyName of compatWith) {
      const ctrl = this.products.find(p =>
        p.type === 'controller' &&
        p.status === 'active' &&
        (p.family === familyName || p.name.includes(familyName))
      );
      if (ctrl) controllers.push(ctrl);
    }
    return controllers;
  }

  // ─── Private: Alert products ────────────────────────────────────────────────

  private findAlertProducts(compatFamilies: string[]): { beacon: ProductV2 | null; siren: ProductV2 | null } {
    const alerts = this.products.filter(p => p.type === 'alert' && p.status === 'active');

    // Priority 1: Find a combo (FLRL) — simpler installation, 1 device does both
    for (const a of alerts) {
      if (a.subType !== 'beacon_siren_combo') continue;
      const aCompat = parseJson<string[]>(a.compatibleWith, []);
      if (aCompat.length === 0) continue;
      if (aCompat.some(f => compatFamilies.includes(f))) {
        return { beacon: a, siren: a }; // Same product serves both roles
      }
    }

    // Priority 2: Separate beacon + siren (fallback if no combo)
    let beacon: ProductV2 | null = null;
    let siren: ProductV2 | null = null;

    for (const a of alerts) {
      const aCompat = parseJson<string[]>(a.compatibleWith, []);
      if (aCompat.length === 0) continue;
      const isCompat = aCompat.some(f => compatFamilies.includes(f));
      if (!isCompat) continue;

      if (!beacon && (a.subType === 'beacon' || a.subType === 'socket_beacon')) {
        beacon = a;
      }
      if (!siren && a.subType === 'siren') {
        siren = a;
      }
      if (beacon && siren) break;
    }

    return { beacon, siren };
  }

  // ─── Private: Alert quantity ────────────────────────────────────────────────

  private calculateAlertQty(detector: ProductV2, controller: ProductV2 | null, points: number): AlertQty {
    if (!controller) {
      // Standalone: 1 beacon + 1 siren per detection point
      return { beacons: points, sirens: points };
    }

    const ctrlRules = parseJson<Record<string, any>>(controller.connectionRules, {});

    // X5 Transmitter (maxSensorModules)
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

    // GC10 or similar (maxDetectors, centralized alerts)
    const beaconsNeeded = ctrlRules.beaconsNeeded || 1;
    const sirensNeeded = ctrlRules.sirensNeeded || 1;
    return { beacons: beaconsNeeded, sirens: sirensNeeded };
  }

  // ─── Private: Controller quantity ───────────────────────────────────────────

  private calculateControllerQty(controller: ProductV2, points: number): number {
    const ctrlRules = parseJson<Record<string, any>>(controller.connectionRules, {});

    if (ctrlRules.maxSensorModules) {
      return Math.ceil(points / ctrlRules.maxSensorModules);
    }

    const maxDet = ctrlRules.maxDetectors || 10;
    return Math.ceil(points / maxDet);
  }

  // ─── Private: Power adapter ─────────────────────────────────────────────────

  private detectorNeedsPowerAdapter(product: ProductV2, selectedVoltage: string): boolean {
    if (selectedVoltage !== '230V AC') return false;
    const pv = (product.voltage || '').toLowerCase();
    if (!pv) return false;
    return !pv.includes('230');
  }

  private calculateAdapterQty(detector: ProductV2, controller: ProductV2 | null, points: number, selectedVoltage: string): number {
    if (selectedVoltage !== '230V AC') return 0;
    if (!this.detectorNeedsPowerAdapter(detector, selectedVoltage)) return 0;

    // If controller powers detectors, no adapter needed
    if (controller) {
      const ctrlRules = parseJson<Record<string, any>>(controller.connectionRules, {});
      if (ctrlRules.powersDetectors) return 0;
    }

    const detRules = parseJson<Record<string, any>>(detector.connectionRules, {});
    const capacity = detRules.powerAdapterCapacity || 5;
    return Math.ceil(points / capacity);
  }

  private findPowerAdapter(detectorFamily: string): ProductV2 | null {
    return this.products.find(p =>
      p.type === 'accessory' &&
      p.subType === 'power_adapter' &&
      p.status === 'active' &&
      parseJson<string[]>(p.compatibleWith, []).includes(detectorFamily)
    ) || null;
  }

  // ─── Private: X5 Config accessories ─────────────────────────────────────────

  private findX5ConfigAccessories(sensor: ProductV2, controller: ProductV2): { product: ProductV2; qty: number; reason?: string }[] {
    const accs: { product: ProductV2; qty: number; reason?: string }[] = [];
    if (controller.family !== 'X5 Transmitter') return accs;

    const ctrlRules = parseJson<Record<string, any>>(controller.connectionRules, {});
    const configs = ctrlRules.configurations;
    if (!configs) return accs;

    const sensorRules = parseJson<Record<string, any>>(sensor.connectionRules, {});
    const isRemote = sensor.family === 'X5 Remote Sensor' ||
      sensorRules.connectionType === 'Remote highway cable';
    const isDirect = sensor.family === 'X5 Direct Sensor Module' ||
      sensorRules.connectionType === 'Direct mount (Port A/B)';

    let config: any = null;
    if (isDirect && !isRemote) {
      config = configs['A']; // Config A: no extra accessories
    } else if (isRemote && !isDirect) {
      config = configs['C']; // Config C: remote accessories
    } else {
      config = configs['B']; // Config B: mixed
    }

    if (!config || !config.requiredAccessories || config.requiredAccessories.length === 0) {
      return accs;
    }

    const allAccessories = this.products.filter(p => p.type === 'accessory' && p.status === 'active');
    for (const req of config.requiredAccessories) {
      const product = allAccessories.find(a => a.code === req.code);
      if (product) {
        accs.push({ product, qty: req.qty, reason: req.reason });
      }
    }

    return accs;
  }

  // ─── Private: Location accessories ──────────────────────────────────────────

  private findLocationAccessories(
    detector: ProductV2,
    location: string,
    detectorQty: number,
    transmitterQty: number,
  ): { product: ProductV2; qty: number }[] {
    const accs: { product: ProductV2; qty: number }[] = [];
    if (!location || location === 'ambient') return accs;

    const allAcc = this.products.filter(p => p.type === 'accessory' && p.status === 'active');

    if (location === 'duct') {
      if (detector.family === 'GLACIAR MIDI') {
        const ductAdapter = allAcc.find(p => p.code === '62-9041');
        if (ductAdapter) accs.push({ product: ductAdapter, qty: detectorQty });
      } else if (detector.family.includes('X5')) {
        const ductAdapter = allAcc.find(p => p.code === '3500-0104');
        if (ductAdapter) accs.push({ product: ductAdapter, qty: transmitterQty || 1 });
      }
    }

    if (location === 'pipe') {
      if (detector.family === 'GLACIAR MIDI') {
        const pipeAdapter = allAcc.find(p => p.code === '62-9031');
        if (pipeAdapter) accs.push({ product: pipeAdapter, qty: detectorQty });
      } else if (detector.family.includes('X5')) {
        const pipeAdapter = allAcc.find(p => p.code === '3500-0105');
        if (pipeAdapter) accs.push({ product: pipeAdapter, qty: transmitterQty || 1 });
      }
    }

    return accs;
  }

  // ─── Private: Optional accessories ──────────────────────────────────────────

  private findOptionalAccessories(detectorFamily: string): { product: ProductV2; qty: number }[] {
    const opts: { product: ProductV2; qty: number }[] = [];
    const accessories = this.products.filter(p => p.type === 'accessory' && p.status === 'active');

    // Calibration kit
    const calKit = accessories.find(a =>
      parseJson<string[]>(a.compatibleWith, []).includes(detectorFamily) &&
      (a.subType === 'calibration_kit' || a.name.toLowerCase().includes('calibration kit'))
    );
    if (calKit) opts.push({ product: calKit, qty: 1 });

    // Magnetic wand
    const wand = accessories.find(a =>
      parseJson<string[]>(a.compatibleWith, []).includes(detectorFamily) &&
      (a.subType === 'magnetic_wand' || a.name.toLowerCase().includes('magnetic wand'))
    );
    if (wand) opts.push({ product: wand, qty: 1 });

    // Protection cap (but not delivery protection cap)
    const cap = accessories.find(a =>
      parseJson<string[]>(a.compatibleWith, []).includes(detectorFamily) &&
      (a.subType === 'protection_cap' ||
        (a.name.toLowerCase().includes('protection cap') && !a.name.toLowerCase().includes('delivery')))
    );
    if (cap) opts.push({ product: cap, qty: 1 });

    return opts;
  }

  // ─── Private: Connection label ──────────────────────────────────────────────

  private getConnectionLabel(detector: ProductV2, controller: ProductV2 | null): string | null {
    if (!controller) return null;

    const ctrlRules = parseJson<Record<string, any>>(controller.connectionRules, {});
    const detRules = parseJson<Record<string, any>>(detector.connectionRules, {});

    if (ctrlRules.maxSensorModules) {
      // X5 system
      return detRules.connectionType || 'Direct/Remote';
    }

    // GC10 or similar
    return detRules.connectionToController || '4-20mA';
  }

  // ─── Private: BOM helpers ───────────────────────────────────────────────────

  private toBom(
    product: ProductV2,
    qty: number,
    role: BomComponent['role'],
    optional: boolean,
    reason?: string,
  ): BomComponent {
    const unitPrice = product.price || 0;
    return {
      code: product.code,
      name: product.name,
      family: product.family,
      type: product.type,
      qty,
      unitPrice,
      subtotal: unitPrice * qty,
      role,
      optional,
      reason,
      image: product.image,
    };
  }

  private calculateTotals(components: BomComponent[]): { total: number; optionalTotal: number; hasNaPrice: boolean } {
    let total = 0;
    let optionalTotal = 0;
    let hasNaPrice = false;

    for (const c of components) {
      if (c.optional) {
        optionalTotal += c.subtotal;
      } else {
        if (c.unitPrice > 0) {
          total += c.subtotal;
        } else {
          hasNaPrice = true;
        }
      }
    }

    return { total, optionalTotal, hasNaPrice };
  }
}
