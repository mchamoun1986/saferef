import { describe, it, expect } from 'vitest';
import { selectAccessories } from '../select-accessories';
import type { ProductRecord } from '../types';

const bracket: ProductRecord = {
  id: 'a1', type: 'accessory', family: 'Accessory', name: 'Wall Bracket MIDI',
  code: '40-901', price: 25, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: null, atex: false,
  mount: '[]', standalone: false, discontinued: false,
  channels: null, relay: 0, analog: null, modbus: false,
  productGroup: 'A', tier: 'standard', subCategory: 'mounting',
  compatibleFamilies: '["MIDI"]', remote: false,
};

const calGasCO2: ProductRecord = {
  id: 'a2', type: 'accessory', family: 'Accessory', name: 'Cal Gas CO2 Module',
  code: '62-010', price: 150, gas: '["CO2"]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: null, atex: false,
  mount: '[]', standalone: false, discontinued: false,
  channels: null, relay: 0, analog: null, modbus: false,
  productGroup: 'A', tier: 'standard', subCategory: 'service',
  compatibleFamilies: '["ALL"]', remote: false,
};

const siren: ProductRecord = {
  id: 'a3', type: 'accessory', family: 'Accessory', name: 'Siren Red 24V',
  code: '40-401', price: 85, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '24V', atex: false,
  mount: '[]', standalone: false, discontinued: false,
  channels: null, relay: 0, analog: null, modbus: false,
  productGroup: 'A', tier: 'standard', subCategory: 'alert',
  compatibleFamilies: '["ALL"]', remote: false,
};

const bracketX5: ProductRecord = {
  id: 'a4', type: 'accessory', family: 'Accessory', name: 'Pipe Bracket X5',
  code: '40-905', price: 45, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: null, atex: false,
  mount: '[]', standalone: false, discontinued: false,
  channels: null, relay: 0, analog: null, modbus: false,
  productGroup: 'A', tier: 'standard', subCategory: 'mounting',
  compatibleFamilies: '["X5"]', remote: false,
};

const psu: ProductRecord = {
  id: 'a5', type: 'accessory', family: 'Accessory', name: 'PSU 480W 24V',
  code: '4000-0001', price: 200, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '24V', atex: false,
  mount: '[]', standalone: false, discontinued: false,
  channels: null, relay: 0, analog: null, modbus: false,
  productGroup: 'A', tier: 'standard', subCategory: 'power',
  compatibleFamilies: '["ALL"]', remote: false,
};

const allAccessories = [bracket, calGasCO2, siren, bracketX5, psu];

describe('selectAccessories', () => {
  it('returns essential mounting bracket for MIDI detector', () => {
    const result = selectAccessories('MIDI', 'CO2', 'wall', allAccessories);
    expect(result.essential.find(a => a.code === '40-901')).toBeDefined();
  });

  it('returns essential cal gas matching gas group', () => {
    const result = selectAccessories('MIDI', 'CO2', 'wall', allAccessories);
    expect(result.essential.find(a => a.code === '62-010')).toBeDefined();
  });

  it('does not include X5 bracket for MIDI detector', () => {
    const result = selectAccessories('MIDI', 'CO2', 'wall', allAccessories);
    const allCodes = [...result.essential, ...result.optional].map(a => a.code);
    expect(allCodes).not.toContain('40-905');
  });

  it('returns siren and PSU as optional', () => {
    const result = selectAccessories('MIDI', 'CO2', 'wall', allAccessories);
    expect(result.optional.find(a => a.code === '40-401')).toBeDefined();
    expect(result.optional.find(a => a.code === '4000-0001')).toBeDefined();
  });

  it('returns X5 bracket as essential for X5 detector', () => {
    const result = selectAccessories('X5', 'NH3', 'pipe', allAccessories);
    expect(result.essential.find(a => a.code === '40-905')).toBeDefined();
  });
});
