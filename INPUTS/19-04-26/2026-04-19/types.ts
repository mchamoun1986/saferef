// ─────────────────────────────────────────────────────────────────────────────
// SAMON Universal Product Model — TypeScript Types
// Mirrors schema/product.schema.json ($defs)
// ─────────────────────────────────────────────────────────────────────────────

export type DataType = 'number' | 'string' | 'boolean' | 'range' | 'list';

export interface SpecValue {
  value: unknown;
  unit?: string;
  dataType?: DataType;
}

export type SpecCategory = Record<string, SpecValue>;

export interface Specs {
  physical?: SpecCategory;
  electrical?: SpecCategory;
  performance?: SpecCategory;
  regulatory?: SpecCategory;
  commercial?: SpecCategory;
}

// ─── Port ────────────────────────────────────────────────────────────────────

export type PortDirection = 'input' | 'output' | 'bidirectional';
export type SignalType = 'power' | 'analog' | 'digital' | 'relay' | 'bus' | 'visual' | 'service';

export interface Port {
  name: string;
  direction: PortDirection;
  signalType: SignalType;
  protocol?: string;
  terminalId?: string;
  connectorType?: string;
  wireGauge?: string;
  maxCableLength?: { value: number; unit: string };
  specs?: Record<string, unknown>;
  sortOrder: number;
}

// ─── Included Items ──────────────────────────────────────────────────────────

export interface IncludedItem {
  description: string;
  qty: number;
  code?: string;
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ProductType = 'detector' | 'controller' | 'sensor' | 'alert' | 'fan' | 'accessory';
export type ProductStatus = 'active' | 'discontinued' | 'planned';

// ─── Data model layers ───────────────────────────────────────────────────────

export interface ConnectionRules {
  [key: string]: unknown;
}

export interface Family {
  family: string;
  manufacturer: string;
  type: ProductType;
  subType?: string;
  function?: string;
  image?: string;
  docs?: Record<string, string>;
  status: ProductStatus;
  specs?: Specs;
  ports: Port[];
  compatibleWith?: string[];  // Families this product is compatible with (e.g., ["GLACIAR MIDI", "GLACIAR X5"])
  connectionRules?: ConnectionRules;
  includedItems?: IncludedItem[];
}

export interface Variant {
  variant: string;
  specs?: Specs;
  addPorts?: Port[];
  removePorts?: string[];
  image?: string;
  docs?: Record<string, string>;
}

export interface SKU {
  code: string;
  name: string;
  gases?: string[];
  price?: number;
  status?: ProductStatus;
  subType?: string;
  specs?: Specs;
  image?: string;
}

// ─── Resolved output ─────────────────────────────────────────────────────────

export interface ResolvedProduct {
  code: string;
  name: string;
  family: string;
  variant: string;
  manufacturer: string;
  type: ProductType;
  subType?: string;
  function?: string;
  image?: string;
  docs?: Record<string, string>;
  status: ProductStatus;
  gases?: string[];
  specs: Specs;
  ports: Port[];
  compatibleWith?: string[];
  connectionRules?: ConnectionRules;
  includedItems?: IncludedItem[];
}
