import { z } from 'zod';

// ── Product ──
export const productCreateSchema = z.object({
  type: z.enum(['detector', 'controller', 'alarm', 'accessory']),
  family: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  price: z.number().min(0).max(999999).default(0),
  image: z.string().nullable().optional(),
  specs: z.record(z.string(), z.unknown()).optional(),
  // V5 columns
  tier: z.string().optional(),
  productGroup: z.string().optional(),
  gas: z.string().optional(),
  refs: z.string().optional(),
  apps: z.string().optional(),
  range: z.string().nullable().optional(),
  sensorTech: z.string().nullable().optional(),
  sensorLife: z.string().nullable().optional(),
  power: z.number().nullable().optional(),
  voltage: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  tempMin: z.number().nullable().optional(),
  tempMax: z.number().nullable().optional(),
  relay: z.number().optional(),
  analog: z.string().nullable().optional(),
  modbus: z.boolean().optional(),
  standalone: z.boolean().optional(),
  atex: z.boolean().optional(),
  mount: z.string().optional(),
  remote: z.boolean().optional(),
  features: z.string().nullable().optional(),
  connectTo: z.string().nullable().optional(),
  discontinued: z.boolean().optional(),
  channels: z.number().nullable().optional(),
  maxPower: z.number().nullable().optional(),
  powerDesc: z.string().nullable().optional(),
  relaySpec: z.string().nullable().optional(),
  analogType: z.string().nullable().optional(),
  modbusType: z.string().nullable().optional(),
  subCategory: z.string().nullable().optional(),
  compatibleFamilies: z.string().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

// ── Quote ──
export const quoteCreateSchema = z.object({
  status: z.enum(['new', 'sent', 'accepted', 'rejected', 'expired']).default('new'),
  client: z.record(z.string(), z.unknown()).default({}),
  project: z.record(z.string(), z.unknown()).default({}),
  selections: z.record(z.string(), z.unknown()).default({}),
  results: z.record(z.string(), z.unknown()).default({}),
  grandTotal: z.number().min(0).optional(),
});

export const quoteUpdateSchema = z.object({
  status: z.enum(['new', 'sent', 'accepted', 'rejected', 'expired']).optional(),
  client: z.record(z.string(), z.unknown()).optional(),
  project: z.record(z.string(), z.unknown()).optional(),
  selections: z.record(z.string(), z.unknown()).optional(),
  results: z.record(z.string(), z.unknown()).optional(),
  grandTotal: z.number().min(0).optional(),
});

// ── Gas Category ──
export const gasCategoryCreateSchema = z.object({
  id: z.string().min(1),
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  code: z.string().min(1),
  safetyClass: z.string().min(1),
  coverage: z.number().int().min(0).max(100).optional().default(50),
  density: z.string().min(1),
  specs: z.record(z.string(), z.unknown()).optional().default({}),
});

// ── Application ──
export const applicationCreateSchema = z.object({
  id: z.string().min(1),
  labelFr: z.string().min(1),
  labelEn: z.string().min(1),
  icon: z.string().optional().default('🏢'),
  descFr: z.string().optional().default(''),
  descEn: z.string().optional().default(''),
  accessCategory: z.enum(['a', 'b', 'c']).optional().default('b'),
  locationClass: z.enum(['I', 'II', 'III', 'IV']).optional().default('II'),
  belowGround: z.boolean().optional().default(false),
  isMachineryRoom: z.boolean().optional().default(false),
  isOccupiedSpace: z.boolean().optional().default(false),
  humanComfort: z.boolean().optional().default(false),
  c3Applicable: z.boolean().optional().default(false),
  mechVentilation: z.boolean().optional().default(false),
  productFamilies: z.array(z.string()).optional().default([]),
  defaultRanges: z.record(z.string(), z.string()).optional().default({}),
  suggestedGases: z.array(z.string()).optional().default([]),
  sortOrder: z.number().int().optional().default(0),
});

// ── Refrigerant V5 ──
export const refrigerantV5CreateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  safetyClass: z.string().min(1),
  toxicityClass: z.string().min(1),
  flammabilityClass: z.string().min(1),
  atelOdl: z.number().nullable().optional(),
  lfl: z.number().nullable().optional(),
  practicalLimit: z.number().min(0),
  vapourDensity: z.number().min(0),
  molecularMass: z.number().min(0),
  boilingPoint: z.string().nullable().optional(),
  gwp: z.string().nullable().optional(),
  gasGroup: z.string().min(1),
});
