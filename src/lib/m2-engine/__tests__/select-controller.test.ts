import { describe, it, expect } from 'vitest';
import { selectController } from '../select-controller';
import type { ProductRecord } from '../types';

const mpu2: ProductRecord = {
  id: 'c1', type: 'controller', family: 'Controller', name: 'MPU-2',
  code: '21-2001', price: 600, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '24V', atex: false,
  mount: '["wall"]', standalone: false, discontinued: false,
  channels: 2, relay: 4, analog: null, modbus: true,
  productGroup: 'A', tier: 'standard', subCategory: null,
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

const mpu6: ProductRecord = {
  id: 'c3', type: 'controller', family: 'Controller', name: 'MPU-6',
  code: '21-2003', price: 1000, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '24V', atex: false,
  mount: '["wall","DIN"]', standalone: false, discontinued: false,
  channels: 6, relay: 12, analog: null, modbus: true,
  productGroup: 'A', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
  sensorLife: null, power: null, ip: null, tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const scu64: ProductRecord = {
  id: 'c4', type: 'controller', family: 'Controller', name: 'SCU3600',
  code: '21-3600', price: 3000, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '230V', atex: false,
  mount: '["wall"]', standalone: false, discontinued: false,
  channels: 64, relay: 16, analog: null, modbus: true,
  productGroup: 'D', tier: 'premium', subCategory: null,
  compatibleFamilies: '[]', remote: false,
  sensorLife: null, power: null, ip: null, tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const allControllers = [mpu2, mpu4, mpu6, scu64];

describe('selectController', () => {
  it('selects smallest controller with enough channels — 3 detectors → MPU-4', () => {
    const result = selectController(3, '24V', allControllers);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('21-2002');
  });

  it('selects MPU-2 for 2 detectors', () => {
    const result = selectController(2, '24V', allControllers);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('21-2001');
  });

  it('selects MPU-6 for 5 detectors', () => {
    const result = selectController(5, '24V', allControllers);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('21-2003');
  });

  it('returns null when 0 detectors', () => {
    const result = selectController(0, '24V', allControllers);
    expect(result).toBeNull();
  });

  it('falls back to larger controller if voltage limits options', () => {
    const result = selectController(3, '230V', allControllers);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('21-3600');
  });

  it('returns null when no controller has enough channels', () => {
    const result = selectController(100, '24V', allControllers);
    expect(result).toBeNull();
  });
});
