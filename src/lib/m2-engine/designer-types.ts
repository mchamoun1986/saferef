// ─── Designer V2 Types ──────────────────────────────────────────────────────
// Types for the SystemDesigner engine (V2 product model)

export interface DesignerInputs {
  gas: string;              // Individual refrigerant: "R744", "R32", "R717"
  atex: boolean;
  voltage: string;          // "12V DC" | "24V DC/AC" | "230V AC" | ""
  location: string;         // "ambient" | "duct" | "pipe"
  outputs: string[];        // ["4-20mA", "Modbus RTU", "Relay", "0-10V"]
  measType: string;         // "ppm" | "lel" | "vol" | ""
  points: number;           // 1-20 detection points
  application?: string;     // Application ID for family filtering
}

export interface BomComponent {
  code: string;
  name: string;
  family: string;
  type: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  role: 'detector' | 'controller' | 'alert' | 'accessory';
  optional: boolean;
  reason?: string;
  image?: string | null;
}

export interface AlertQty {
  beacons: number;
  sirens: number;
}

export interface Solution {
  name: string;
  subtitle: string;
  tier: string;
  mode: 'standalone' | 'centralized';
  detector: ProductV2;
  controller: ProductV2 | null;
  controllerQty: number;
  components: BomComponent[];
  total: number;
  optionalTotal: number;
  hasNaPrice: boolean;
  alertQty: AlertQty;
  connectionLabel: string | null;
}

/** V2 Product — matches Prisma Product model with V2 fields */
export interface ProductV2 {
  id: string;
  type: string;
  family: string;
  name: string;
  code: string;
  price: number;
  image: string | null;
  specs: string;
  tier: string;
  productGroup: string;
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
  relay: number;
  analog: string | null;
  modbus: boolean;
  standalone: boolean;
  atex: boolean;
  mount: string;
  remote: boolean;
  features: string | null;
  connectTo: string | null;
  discontinued: boolean;
  channels: number | null;
  maxPower: number | null;
  subCategory: string | null;
  compatibleFamilies: string;
  // V2
  variant: string | null;
  subType: string | null;
  function: string | null;
  status: string;
  ports: string;
  connectionRules: string;
  compatibleWith: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function parseJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}
