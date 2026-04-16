import { describe, it, expect } from 'vitest';
import { selectDetector } from '../select-detector';
import type { ProductRecord, SelectorInput } from '../types';

const midiCO2: ProductRecord = {
  id: '1', type: 'detector', family: 'MIDI', name: 'MIDI IR CO2 0-10000ppm',
  code: '31-210-32', price: 450, gas: '["CO2"]', refs: '["R744"]',
  apps: '["supermarket","cold_room"]', range: '0-10000ppm', sensorTech: 'IR',
  voltage: '15-24V', atex: false, mount: '["wall","ceiling"]', standalone: true,
  discontinued: false, channels: null, relay: 2, analog: 'selectable',
  modbus: true, productGroup: 'G', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
  sensorLife: null, power: null, ip: null, tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const x5NH3: ProductRecord = {
  id: '2', type: 'detector', family: 'X5', name: 'X5 IONIC NH3 0-1000ppm',
  code: '3500-0001', price: 1200, gas: '["NH3"]', refs: '["R717"]',
  apps: '["machinery_room","cold_room"]', range: '0-1000ppm', sensorTech: 'IONIC',
  voltage: '18-32V', atex: true, mount: '["wall","pipe","pole"]', standalone: false,
  discontinued: false, channels: null, relay: 3, analog: '4-20mA x2',
  modbus: true, productGroup: 'G', tier: 'premium', subCategory: null,
  compatibleFamilies: '[]', remote: false,
  sensorLife: null, power: null, ip: null, tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const midiHFC: ProductRecord = {
  id: '3', type: 'detector', family: 'MIDI', name: 'MIDI SC HFC 0-1000ppm',
  code: '31-110-11', price: 400, gas: '["HFC1","HFC2"]', refs: '["R32","R410A","R134a","R404A"]',
  apps: '["supermarket","cold_room"]', range: '0-1000ppm', sensorTech: 'SC',
  voltage: '15-24V', atex: false, mount: '["wall","ceiling"]', standalone: true,
  discontinued: false, channels: null, relay: 2, analog: 'selectable',
  modbus: true, productGroup: 'G', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
  sensorLife: null, power: null, ip: null, tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const rmHFC: ProductRecord = {
  id: '4', type: 'detector', family: 'RM', name: 'RM HFC Compact',
  code: '32-100-01', price: 180, gas: '["HFC1","HFC2"]', refs: '["R32","R410A","R134a"]',
  apps: '["hotel","office"]', range: '0-5000ppm', sensorTech: 'SC',
  voltage: '12-24V', atex: false, mount: '["wall","ceiling"]', standalone: true,
  discontinued: false, channels: null, relay: 1, analog: null,
  modbus: false, productGroup: 'G', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
  sensorLife: null, power: null, ip: null, tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const discontinuedDet: ProductRecord = {
  ...midiCO2, id: '5', code: '31-OLD-01', discontinued: true,
};

const allProducts = [midiCO2, x5NH3, midiHFC, rmHFC, discontinuedDet];

describe('selectDetector', () => {
  it('filters by gasGroup — CO2 returns only CO2 detectors', () => {
    const input: SelectorInput = {
      gasGroup: 'CO2', refrigerantRefs: ['R744'], voltage: '24V',
      atexRequired: false, mountType: 'wall', standalone: false,
    };
    const result = selectDetector(input, allProducts);
    expect(result.length).toBe(1);
    expect(result[0].code).toBe('31-210-32');
  });

  it('filters by gasGroup — HFC1 returns MIDI HFC + RM HFC', () => {
    const input: SelectorInput = {
      gasGroup: 'HFC1', refrigerantRefs: ['R32'], voltage: '24V',
      atexRequired: false, mountType: 'wall', standalone: false,
    };
    const result = selectDetector(input, allProducts);
    expect(result.length).toBe(2);
    expect(result.map(r => r.code)).toContain('31-110-11');
    expect(result.map(r => r.code)).toContain('32-100-01');
  });

  it('filters ATEX required — only X5 returned for NH3', () => {
    const input: SelectorInput = {
      gasGroup: 'NH3', refrigerantRefs: ['R717'], voltage: '24V',
      atexRequired: true, mountType: 'wall', standalone: false,
    };
    const result = selectDetector(input, allProducts);
    expect(result.length).toBe(1);
    expect(result[0].code).toBe('3500-0001');
  });

  it('excludes discontinued products', () => {
    const input: SelectorInput = {
      gasGroup: 'CO2', refrigerantRefs: ['R744'], voltage: '24V',
      atexRequired: false, mountType: 'wall', standalone: false,
    };
    const result = selectDetector(input, allProducts);
    expect(result.find(r => r.code === '31-OLD-01')).toBeUndefined();
  });

  it('prioritizes preferred family', () => {
    const input: SelectorInput = {
      gasGroup: 'HFC1', refrigerantRefs: ['R32'], voltage: '24V',
      atexRequired: false, mountType: 'wall', standalone: false,
      preferredFamily: 'RM',
    };
    const result = selectDetector(input, allProducts);
    expect(result[0].family).toBe('RM');
  });

  it('returns empty array when no match', () => {
    const input: SelectorInput = {
      gasGroup: 'O2', refrigerantRefs: ['O2'], voltage: '24V',
      atexRequired: false, mountType: 'wall', standalone: false,
    };
    const result = selectDetector(input, allProducts);
    expect(result).toEqual([]);
  });

  // M-1/M-5 regression: UI passes "Wall" (capitalized), DB stores "wall" (lowercase)
  it('mount type match is case-insensitive (UI capitalizes, DB stores lowercase)', () => {
    const input: SelectorInput = {
      gasGroup: 'CO2', refrigerantRefs: ['R744'], voltage: '24V',
      atexRequired: false, mountType: 'Wall', standalone: false,  // capital W from UI
    };
    const result = selectDetector(input, allProducts);
    expect(result.length).toBeGreaterThan(0);
  });
});
