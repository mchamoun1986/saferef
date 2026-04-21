// parse-product.ts — Convert raw API ProductRecord to engine ProductEntry
import type { ProductEntry } from '../engine-types';
import type { ProductRecord } from './types';

function parseJsonArray(json: string | null | undefined): string[] {
  if (!json) return [];
  try { return JSON.parse(json); }
  catch { return []; }
}

export function toProductEntry(p: ProductRecord): ProductEntry {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    family: p.family,
    type: p.type,
    description: null,
    category: p.type,
    price: p.price,
    tier: p.tier || 'standard',
    productGroup: p.productGroup || 'G',
    gas: parseJsonArray(p.gas),
    refs: parseJsonArray(p.refs),
    range: p.range,
    sensorTech: p.sensorTech,
    sensorLife: p.sensorLife ?? null,
    power: p.power ?? null,
    voltage: p.voltage,
    ip: p.ip ?? null,
    tempMin: p.tempMin ?? null,
    tempMax: p.tempMax ?? null,
    relay: p.relay ?? 0,
    analog: p.analog,
    modbus: p.modbus ?? false,
    standalone: p.standalone ?? false,
    atex: p.atex ?? false,
    mount: parseJsonArray(p.mount),
    remote: p.remote ?? false,
    features: p.features ?? null,
    connectTo: p.connectTo ?? null,
    discontinued: p.discontinued ?? false,
    channels: p.channels,
    maxPower: p.maxPower ?? null,
    subCategory: p.subCategory,
    compatibleFamilies: parseJsonArray(p.compatibleFamilies),
    image: p.image ?? null,
  };
}

export function toProductEntries(records: ProductRecord[]): {
  products: ProductEntry[];
  controllers: ProductEntry[];
  accessories: ProductEntry[];
} {
  const all = records.map(toProductEntry);
  return {
    products: all.filter(p => p.type === 'detector'),
    controllers: all.filter(p => p.type === 'controller'),
    accessories: all.filter(p => p.type === 'accessory'),
  };
}
