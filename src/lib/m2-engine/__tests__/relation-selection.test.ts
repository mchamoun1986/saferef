import { describe, it, expect } from 'vitest';
import { selectControllerFromRelations } from '../select-controller';
import { conditionMatches, calculateQty } from '../relation-types';
import type { ProductEntry } from '../../engine-types';
import type { ProductRelation } from '../relation-types';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeDetector(overrides: Partial<ProductEntry> = {}): ProductEntry {
  return {
    id: 'det-1', code: '10-100', name: 'MIDI-IR-R744',
    family: 'MIDI', type: 'detector', description: null,
    category: 'detector', price: 500, tier: 'standard',
    productGroup: 'G', gas: ['CO2'], refs: ['R744'],
    apps: ['supermarket', 'cold_room'], range: '0-10000ppm',
    sensorTech: 'IR', sensorLife: '15 years', power: 2,
    voltage: '24V AC/DC', ip: 'IP54', tempMin: -40, tempMax: 50,
    relay: 2, analog: 'selectable', modbus: true,
    standalone: true, atex: false, mount: ['wall'],
    remote: false, features: null, connectTo: null,
    discontinued: false, channels: null, maxPower: null,
    subCategory: null, compatibleFamilies: [],
    ...overrides,
  };
}

function makeController(overrides: Partial<ProductEntry> = {}): ProductEntry {
  return {
    id: 'ctrl-1', code: '20-300', name: 'Controller',
    family: 'Controller', type: 'controller', description: null,
    category: 'controller', price: 1598, tier: 'standard',
    productGroup: 'D', gas: [], refs: [], apps: [],
    range: null, sensorTech: null, sensorLife: null,
    power: null, voltage: '230V AC', ip: 'IP20',
    tempMin: -10, tempMax: 55, relay: 4, analog: null,
    modbus: true, standalone: false, atex: false, mount: [],
    remote: false, features: null, connectTo: null,
    discontinued: false, channels: 10, maxPower: 10,
    subCategory: null, compatibleFamilies: [],
    ...overrides,
  };
}

function makeRelation(overrides: Partial<ProductRelation> = {}): ProductRelation {
  return {
    id: 'rel-1',
    fromCode: '10-100',
    toCode: '20-300',
    type: 'compatible_controller',
    mandatory: false,
    qtyRule: 'per_project',
    condition: null,
    reason: null,
    priority: 0,
    ...overrides,
  };
}

// ─── selectControllerFromRelations ────────────────────────────────────────────

describe('selectControllerFromRelations', () => {
  it('MIDI detector with compatible_controller relation to Controller 10 → returns controller', () => {
    const midi = makeDetector({ code: '31-210-32', name: 'MIDI-IR-R744' });
    const ctrl10 = makeController({
      id: 'ctrl-10', code: '6300-0001', name: 'Controller 10',
      channels: 10, voltage: '230V AC',
    });

    const relations: ProductRelation[] = [
      makeRelation({
        fromCode: '31-210-32',
        toCode: '6300-0001',
        type: 'compatible_controller',
      }),
    ];

    const result = selectControllerFromRelations(
      midi, 5, '230V', [ctrl10], relations,
    );

    expect(result.controller).not.toBeNull();
    expect(result.controller!.code).toBe('6300-0001');
    expect(result.controllerQty).toBe(1);
    expect(result.base).toBeNull();
    expect(result.baseQty).toBe(0);
  });

  it('X5 direct-mount with requires_base relation → returns base with qty ceil(n/2)', () => {
    // X5 transmitter has 2 channels; with 5 detectors → ceil(5/2) = 3 bases
    const x5Sensor = makeDetector({ code: '3500-0002', name: 'X5 Sensor', family: 'X5' });
    const x5Tx = makeController({
      id: 'x5-tx-1', code: '3500-0001', name: 'X5 Transmitter',
      family: 'X5', channels: 2, voltage: '24V AC/DC',
    });

    const relations: ProductRelation[] = [
      makeRelation({
        fromCode: '3500-0002',
        toCode: '3500-0001',
        type: 'requires_base',
      }),
    ];

    const result = selectControllerFromRelations(
      x5Sensor, 5, '24V', [x5Tx], relations,
    );

    expect(result.base).not.toBeNull();
    expect(result.base!.code).toBe('3500-0001');
    // ceil(5 / 2) = 3
    expect(result.baseQty).toBe(3);
    expect(result.controller).toBeNull();
    expect(result.controllerQty).toBe(0);
  });

  it('X5 remote with requires_base + compatible_controller → returns both base and controller', () => {
    const x5Sensor = makeDetector({ code: '3500-0002', name: 'X5 Sensor', family: 'X5' });
    const x5Tx = makeController({
      id: 'x5-tx-1', code: '3500-0001', name: 'X5 Transmitter',
      family: 'X5', channels: 2, voltage: '230V AC',
    });
    const ctrl10 = makeController({
      id: 'ctrl-10', code: '6300-0001', name: 'Controller 10',
      channels: 10, voltage: '230V AC',
    });

    const relations: ProductRelation[] = [
      makeRelation({
        fromCode: '3500-0002',
        toCode: '3500-0001',
        type: 'requires_base',
      }),
      makeRelation({
        id: 'rel-2',
        fromCode: '3500-0002',
        toCode: '6300-0001',
        type: 'compatible_controller',
      }),
    ];

    const result = selectControllerFromRelations(
      x5Sensor, 4, '230V', [x5Tx, ctrl10], relations,
    );

    expect(result.base).not.toBeNull();
    expect(result.base!.code).toBe('3500-0001');
    // ceil(4 / 2) = 2
    expect(result.baseQty).toBe(2);

    expect(result.controller).not.toBeNull();
    expect(result.controller!.code).toBe('6300-0001');
    expect(result.controllerQty).toBe(1);
  });

  it('detector with no matching relations → returns null for both base and controller', () => {
    const detector = makeDetector({ code: '31-210-32' });
    // Relations reference a completely different detector code
    const unrelated: ProductRelation[] = [
      makeRelation({
        fromCode: 'OTHER-CODE',
        toCode: '6300-0001',
        type: 'compatible_controller',
      }),
    ];

    const ctrl = makeController({ code: '6300-0001', channels: 10, voltage: '230V AC' });

    const result = selectControllerFromRelations(
      detector, 3, '230V', [ctrl], unrelated,
    );

    expect(result.base).toBeNull();
    expect(result.baseQty).toBe(0);
    expect(result.controller).toBeNull();
    expect(result.controllerQty).toBe(0);
  });

  it('detector count exceeding controller channels → multiple controllers', () => {
    const detector = makeDetector({ code: '31-210-32' });
    // Controller has 4 channels, we need 10 detectors → ceil(10/4) = 3 controllers
    const smallCtrl = makeController({
      code: '6300-0001', channels: 4, voltage: '230V AC',
    });

    const relations: ProductRelation[] = [
      makeRelation({
        fromCode: '31-210-32',
        toCode: '6300-0001',
        type: 'compatible_controller',
      }),
    ];

    const result = selectControllerFromRelations(
      detector, 10, '230V', [smallCtrl], relations,
    );

    // 10 detectors / 4 channels → 3 controllers needed
    expect(result.controller).not.toBeNull();
    expect(result.controller!.code).toBe('6300-0001');
    expect(result.controllerQty).toBe(3);
  });

  it('returns empty result when totalDetectors is 0', () => {
    const detector = makeDetector({ code: '31-210-32' });
    const ctrl = makeController({ code: '6300-0001', channels: 10, voltage: '230V AC' });
    const relations: ProductRelation[] = [
      makeRelation({ fromCode: '31-210-32', toCode: '6300-0001', type: 'compatible_controller' }),
    ];

    const result = selectControllerFromRelations(detector, 0, '230V', [ctrl], relations);

    expect(result.base).toBeNull();
    expect(result.baseQty).toBe(0);
    expect(result.controller).toBeNull();
    expect(result.controllerQty).toBe(0);
  });
});

// ─── conditionMatches ─────────────────────────────────────────────────────────

describe('conditionMatches', () => {
  it('null condition → true (always applies)', () => {
    expect(conditionMatches(null, {})).toBe(true);
    expect(conditionMatches(null, { voltage: '24V', mount: 'wall', atex: false })).toBe(true);
  });

  it('"voltage:230V" with voltage "230V" → true', () => {
    expect(conditionMatches('voltage:230V', { voltage: '230V' })).toBe(true);
  });

  it('"voltage:230V" with voltage "24V" → false', () => {
    expect(conditionMatches('voltage:230V', { voltage: '24V' })).toBe(false);
  });

  it('"mount:duct" with mount "duct" → true', () => {
    expect(conditionMatches('mount:duct', { mount: 'duct' })).toBe(true);
  });

  it('"mount:duct" with mount "wall" → false', () => {
    expect(conditionMatches('mount:duct', { mount: 'wall' })).toBe(false);
  });

  it('"atex:false" with atex false → true', () => {
    expect(conditionMatches('atex:false', { atex: false })).toBe(true);
  });

  it('"atex:false" with atex true → false', () => {
    expect(conditionMatches('atex:false', { atex: true })).toBe(false);
  });

  it('"atex:true" with atex true → true', () => {
    expect(conditionMatches('atex:true', { atex: true })).toBe(true);
  });

  it('unknown key → true (default pass-through)', () => {
    expect(conditionMatches('unknown:value', { voltage: '24V' })).toBe(true);
  });
});

// ─── calculateQty ─────────────────────────────────────────────────────────────

describe('calculateQty', () => {
  it('"per_detector" with 5 detectors → 5', () => {
    expect(calculateQty('per_detector', { detectors: 5, controllers: 1 })).toBe(5);
  });

  it('"per_controller" with 2 controllers → 2', () => {
    expect(calculateQty('per_controller', { detectors: 5, controllers: 2 })).toBe(2);
  });

  it('"per_controller" with 0 controllers → 1 (min 1)', () => {
    expect(calculateQty('per_controller', { detectors: 5, controllers: 0 })).toBe(1);
  });

  it('"per_project" → 1 regardless of counts', () => {
    expect(calculateQty('per_project', { detectors: 10, controllers: 3 })).toBe(1);
  });

  it('"ceil_n_5" with 7 detectors → 2 (ceil(7/5))', () => {
    expect(calculateQty('ceil_n_5', { detectors: 7, controllers: 1 })).toBe(2);
  });

  it('"ceil_n_5" with 5 detectors → 1', () => {
    expect(calculateQty('ceil_n_5', { detectors: 5, controllers: 1 })).toBe(1);
  });

  it('"ceil_n_5" with 6 detectors → 2', () => {
    expect(calculateQty('ceil_n_5', { detectors: 6, controllers: 1 })).toBe(2);
  });

  it('"1:1" with 3 detectors → 3', () => {
    expect(calculateQty('1:1', { detectors: 3, controllers: 1 })).toBe(3);
  });

  it('unknown rule → 1 (default)', () => {
    expect(calculateQty('nonexistent_rule', { detectors: 5, controllers: 2 })).toBe(1);
  });
});
