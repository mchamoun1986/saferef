import { describe, it, expect } from 'vitest';
import { buildBOM } from '../build-bom';
import type { ProductRecord, SelectorInput, BOMZone } from '../types';

const midiCO2: ProductRecord = {
  id: '1', type: 'detector', family: 'MIDI', name: 'MIDI IR CO2',
  code: '31-210-32', price: 450, gas: '["CO2"]', refs: '["R744"]',
  apps: '[]', range: '0-10000ppm', sensorTech: 'IR',
  voltage: '15-24V', atex: false, mount: '["wall","ceiling"]', standalone: true,
  discontinued: false, channels: null, relay: 2, analog: 'selectable',
  modbus: true, productGroup: 'G', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
  sensorLife: null, power: null, ip: null, tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const mpu4: ProductRecord = {
  id: 'c2', type: 'controller', family: 'Controller', name: 'MPU-4',
  code: '21-2002', price: 800, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '24V', atex: false,
  mount: '["wall","DIN"]', standalone: false, discontinued: false,
  channels: 4, relay: 8, analog: null, modbus: true,
  productGroup: 'A', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
  sensorLife: null, power: null, ip: null, tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const bracket: ProductRecord = {
  id: 'a1', type: 'accessory', family: 'Accessory', name: 'Wall Bracket MIDI',
  code: '40-901', price: 25, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: null, atex: false,
  mount: '[]', standalone: false, discontinued: false,
  channels: null, relay: 0, analog: null, modbus: false,
  productGroup: 'A', tier: 'standard', subCategory: 'mounting',
  compatibleFamilies: '["MIDI"]', remote: false,
  sensorLife: null, power: null, ip: null, tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const calGas: ProductRecord = {
  id: 'a2', type: 'accessory', family: 'Accessory', name: 'Cal Gas CO2',
  code: '62-010', price: 150, gas: '["CO2"]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: null, atex: false,
  mount: '[]', standalone: false, discontinued: false,
  channels: null, relay: 0, analog: null, modbus: false,
  productGroup: 'A', tier: 'standard', subCategory: 'service',
  compatibleFamilies: '["ALL"]', remote: false,
  sensorLife: null, power: null, ip: null, tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const allProducts = [midiCO2, mpu4, bracket, calGas];

describe('buildBOM', () => {
  it('builds complete BOM for 2 zones', () => {
    const input: SelectorInput = {
      gasGroup: 'CO2', refrigerantRefs: ['R744'], voltage: '24V',
      atexRequired: false, mountType: 'wall', standalone: false,
    };
    const zones: BOMZone[] = [
      { name: 'Cold Room 1', detectorQty: 2 },
      { name: 'Cold Room 2', detectorQty: 1 },
    ];
    const result = buildBOM(input, zones, allProducts);

    expect(result.zones.length).toBe(2);
    expect(result.zones[0].detector).not.toBeNull();
    expect(result.zones[0].detector!.qty).toBe(2);
    expect(result.zones[0].detector!.code).toBe('31-210-32');
    expect(result.zones[1].detector!.qty).toBe(1);
    expect(result.controller).not.toBeNull();
    expect(result.controller!.code).toBe('21-2002');
    expect(result.totalGross).toBeGreaterThan(0);
  });

  it('returns null controller when all detectors are standalone and input.standalone is true', () => {
    const input: SelectorInput = {
      gasGroup: 'CO2', refrigerantRefs: ['R744'], voltage: '24V',
      atexRequired: false, mountType: 'wall', standalone: true,
    };
    const zones: BOMZone[] = [{ name: 'Zone A', detectorQty: 2 }];
    const result = buildBOM(input, zones, allProducts);
    expect(result.controller).toBeNull();
  });

  it('returns empty BOM when no detector matches', () => {
    const input: SelectorInput = {
      gasGroup: 'O2', refrigerantRefs: ['O2'], voltage: '24V',
      atexRequired: false, mountType: 'wall', standalone: false,
    };
    const zones: BOMZone[] = [{ name: 'Zone A', detectorQty: 2 }];
    const result = buildBOM(input, zones, allProducts);
    expect(result.zones[0].detector).toBeNull();
    expect(result.totalGross).toBe(0);
  });
});
