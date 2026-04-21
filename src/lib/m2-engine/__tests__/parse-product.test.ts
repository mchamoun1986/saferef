import { describe, it, expect } from 'vitest';
import { toProductEntry, toProductEntries } from '../parse-product';
import type { ProductRecord } from '../types';

function makeRecord(overrides: Partial<ProductRecord> = {}): ProductRecord {
  return {
    id: 'p1', type: 'detector', family: 'MIDI', name: 'MIDI-IR-R744',
    code: '10-100', price: 500, gas: '["CO2"]', refs: '["R744"]',
    range: '0-10000ppm', sensorTech: 'IR',
    sensorLife: '15 years', power: 2, voltage: '24V AC/DC', ip: 'IP54',
    tempMin: -40, tempMax: 50, atex: false, mount: '["wall","ceiling"]',
    standalone: true, discontinued: false, channels: null, maxPower: null,
    relay: 2, analog: 'selectable', modbus: true, productGroup: 'G',
    tier: 'premium', subCategory: null, compatibleFamilies: '["ALL"]',
    remote: false, features: 'LED display', connectTo: null,
    ...overrides,
  };
}

describe('toProductEntry', () => {
  it('parses JSON array fields correctly', () => {
    const entry = toProductEntry(makeRecord());
    expect(entry.gas).toEqual(['CO2']);
    expect(entry.refs).toEqual(['R744']);
    expect(entry.mount).toEqual(['wall', 'ceiling']);
    expect(entry.compatibleFamilies).toEqual(['ALL']);
  });

  it('handles malformed JSON gracefully', () => {
    const entry = toProductEntry(makeRecord({ gas: 'not-json', refs: '', mount: '{bad}' }));
    expect(entry.gas).toEqual([]);
    expect(entry.refs).toEqual([]);
    expect(entry.mount).toEqual([]);
  });

  it('maps all scalar fields', () => {
    const entry = toProductEntry(makeRecord());
    expect(entry.id).toBe('p1');
    expect(entry.code).toBe('10-100');
    expect(entry.name).toBe('MIDI-IR-R744');
    expect(entry.family).toBe('MIDI');
    expect(entry.type).toBe('detector');
    expect(entry.price).toBe(500);
    expect(entry.tier).toBe('premium');
    expect(entry.productGroup).toBe('G');
    expect(entry.range).toBe('0-10000ppm');
    expect(entry.sensorTech).toBe('IR');
    expect(entry.sensorLife).toBe('15 years');
    expect(entry.power).toBe(2);
    expect(entry.voltage).toBe('24V AC/DC');
    expect(entry.ip).toBe('IP54');
    expect(entry.tempMin).toBe(-40);
    expect(entry.tempMax).toBe(50);
    expect(entry.relay).toBe(2);
    expect(entry.analog).toBe('selectable');
    expect(entry.modbus).toBe(true);
    expect(entry.standalone).toBe(true);
    expect(entry.atex).toBe(false);
    expect(entry.remote).toBe(false);
    expect(entry.features).toBe('LED display');
    expect(entry.connectTo).toBeNull();
    expect(entry.discontinued).toBe(false);
    expect(entry.channels).toBeNull();
    expect(entry.maxPower).toBeNull();
    expect(entry.subCategory).toBeNull();
  });

  it('handles null optional fields', () => {
    const entry = toProductEntry(makeRecord({
      sensorLife: null, power: null, ip: null,
      tempMin: null, tempMax: null, maxPower: null,
      features: null, connectTo: null,
    }));
    expect(entry.sensorLife).toBeNull();
    expect(entry.power).toBeNull();
    expect(entry.ip).toBeNull();
    expect(entry.tempMin).toBeNull();
    expect(entry.tempMax).toBeNull();
    expect(entry.maxPower).toBeNull();
    expect(entry.features).toBeNull();
    expect(entry.connectTo).toBeNull();
  });

  it('defaults tier to standard when empty', () => {
    const entry = toProductEntry(makeRecord({ tier: '' }));
    expect(entry.tier).toBe('standard');
  });

  it('defaults productGroup to G when empty', () => {
    const entry = toProductEntry(makeRecord({ productGroup: '' }));
    expect(entry.productGroup).toBe('G');
  });
});

describe('toProductEntries', () => {
  it('separates products by type', () => {
    const records: ProductRecord[] = [
      makeRecord({ id: 'd1', type: 'detector' }),
      makeRecord({ id: 'd2', type: 'detector' }),
      makeRecord({ id: 'c1', type: 'controller', family: 'Controller' }),
      makeRecord({ id: 'a1', type: 'accessory', family: 'Accessory' }),
      makeRecord({ id: 'a2', type: 'accessory', family: 'Accessory' }),
    ];
    const { products, controllers, accessories } = toProductEntries(records);
    expect(products).toHaveLength(2);
    expect(controllers).toHaveLength(1);
    expect(accessories).toHaveLength(2);
  });

  it('returns empty arrays for empty input', () => {
    const { products, controllers, accessories } = toProductEntries([]);
    expect(products).toHaveLength(0);
    expect(controllers).toHaveLength(0);
    expect(accessories).toHaveLength(0);
  });
});
