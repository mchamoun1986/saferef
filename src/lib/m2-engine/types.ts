/** Input for the standalone selector (user fills manually) */
export interface SelectorInput {
  gasGroup: string;            // "CO2", "HFC1", "HFC2", "NH3", "R290", "CO", "NO2", "O2"
  refrigerantRefs: string[];   // ["R744"] or ["R32","R410A"]
  preferredFamily?: string;    // "MIDI", "X5", "RM" — optional preference
  voltage: '12V' | '24V' | '230V';
  atexRequired: boolean;
  mountType: string;           // "wall", "ceiling", "duct", "floor"
  standalone: boolean;         // can operate without controller
}

/** Input for post-M1 mode (pre-filled from wizard) */
export interface M1SelectionInput extends SelectorInput {
  detectionRequired: 'YES' | 'NO' | 'MANUAL_REVIEW' | 'RECOMMENDED';
  placementHeight: 'floor' | 'ceiling' | 'breathing_zone';
  thresholdPpm: number;
  extraRequirements: { id: string; mandatory: boolean }[];
}

/** A zone with its detector quantity */
export interface BOMZone {
  name: string;
  detectorQty: number;
}

/** A product selected for the BOM */
export interface BOMLine {
  productId: string;
  code: string;
  name: string;
  family: string;
  type: 'detector' | 'sensor' | 'controller' | 'alert' | 'accessory';
  unitPrice: number;
  productGroup: string;
  qty: number;
  lineTotal: number;
  essential: boolean;
}

/** BOM for a single zone */
export interface ZoneBOM {
  zoneName: string;
  detector: BOMLine | null;
  accessories: BOMLine[];
  subtotal: number;
}

/** Complete BOM across all zones */
export interface BOMResult {
  zones: ZoneBOM[];
  controller: BOMLine | null;
  sharedAccessories: BOMLine[];
  totalGross: number;
}

/** Priced BOM with discounts applied */
export interface PricedBOM extends BOMResult {
  customerGroup: string;
  zones: (ZoneBOM & { subtotalNet: number })[];
  controller: (BOMLine & { netPrice: number; lineNetTotal: number }) | null;
  totalNet: number;
  totalDiscount: number;
}

/** Raw product shape from API (matches Prisma Product model) */
export interface ProductRecord {
  id: string;
  type: string;
  family: string;
  name: string;
  code: string;
  price: number;
  image?: string | null;
  gas: string;
  refs: string;
  apps: string;
  range: string | null;
  sensorTech: string | null;
  sensorLife: string | null;
  power: number | null;
  voltage: string | null;
  ip: string | null;
  tempMin: number | null;
  tempMax: number | null;
  atex: boolean;
  mount: string;
  standalone: boolean;
  discontinued: boolean;
  channels: number | null;
  maxPower: number | null;
  relay: number;
  analog: string | null;
  modbus: boolean;
  productGroup: string;
  tier: string;
  subCategory: string | null;
  compatibleFamilies: string;
  remote: boolean;
  features: string | null;
  connectTo: string | null;
}

/** Discount matrix row */
export interface DiscountRow {
  customerGroup: string;
  productGroup: string;
  discountPct: number;
}
