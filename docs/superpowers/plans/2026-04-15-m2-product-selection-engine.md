# M2 — Product Selection Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a product selection engine that turns M1 regulatory results (or standalone inputs) into a commercial Bill of Materials with SAMON products and pricing.

**Architecture:** Pure library (`/lib/m2-engine/`) with typed functions (selectDetector, selectController, selectAccessories, pricing, buildBOM). Two UI entry points: standalone `/selector` wizard (4 steps) and Step 5 in the existing configurator (pre-filled from M1). All selection logic runs client-side against products fetched from `/api/products`.

**Tech Stack:** TypeScript, Next.js (App Router), React, Tailwind CSS, Vitest, jsPDF (existing)

**Spec:** `docs/superpowers/specs/2026-04-15-m2-product-selection-engine-design.md`

---

## File Structure

```
src/lib/m2-engine/
  types.ts              — M2 interfaces (SelectionInput, BOMLine, BOMResult, PricedBOM)
  select-detector.ts    — Filter and rank compatible detectors
  select-controller.ts  — Size controller to total detector count
  select-accessories.ts — Essential (pre-checked) + optional accessories
  pricing.ts            — Apply DiscountMatrix to BOM
  build-bom.ts          — Orchestrate per-zone BOM generation
  __tests__/
    select-detector.test.ts
    select-controller.test.ts
    select-accessories.test.ts
    pricing.test.ts
    build-bom.test.ts

src/components/selector/
  SelectorWizard.tsx    — Standalone 4-step wizard (client component)
  StepAppGas.tsx        — Step 1: Application + Gas + Family
  StepTechnical.tsx     — Step 2: Voltage + ATEX + Mount
  StepZoneQty.tsx       — Step 3: Zones with name + qty
  StepBOM.tsx           — Step 4: BOM result + pricing + PDF

src/app/selector/page.tsx               — Route for standalone selector
src/components/configurator/StepProducts.tsx — Step 5 post-M1 (reuses StepBOM)
```

Files to modify:
- `src/components/configurator/i18n.ts` — Add Step 5 label + M2 i18n keys
- `src/components/configurator/StepProgress.tsx` — Support 5 steps
- `src/app/configurator/page.tsx` — Add Step 5 with StepProducts
- `src/app/api/products/route.ts` — Add `atex`, `refs`, `voltage`, `subCategory`, `compatibleFamily` filters

---

### Task 1: M2 Types

**Files:**
- Create: `src/lib/m2-engine/types.ts`

- [ ] **Step 1: Create M2 type definitions**

```typescript
// src/lib/m2-engine/types.ts

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
  type: 'detector' | 'controller' | 'accessory';
  unitPrice: number;
  productGroup: string;
  qty: number;
  lineTotal: number;
  essential: boolean;     // true = pre-checked essential, false = optional
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
  sharedAccessories: BOMLine[];  // accessories shared across zones (e.g., power supply)
  totalGross: number;
}

/** Priced BOM with discounts applied */
export interface PricedBOM extends BOMResult {
  customerGroup: string;
  zones: (ZoneBOM & { subtotalNet: number })[];
  controller: (BOMLine & { netPrice: number; lineNetTotal: number }) | null;
  totalNet: number;
  totalDiscount: number;       // percentage saved overall
}

/** Raw product shape from API (matches Prisma Product model) */
export interface ProductRecord {
  id: string;
  type: string;
  family: string;
  name: string;
  code: string;
  price: number;
  gas: string;               // JSON string
  refs: string;              // JSON string
  apps: string;              // JSON string
  range: string | null;
  sensorTech: string | null;
  voltage: string | null;
  atex: boolean;
  mount: string;             // JSON string
  standalone: boolean;
  discontinued: boolean;
  channels: number | null;
  relay: number;
  analog: string | null;
  modbus: boolean;
  productGroup: string;
  tier: string;
  subCategory: string | null;
  compatibleFamilies: string; // JSON string
  remote: boolean;
}

/** Discount matrix row */
export interface DiscountRow {
  customerGroup: string;
  productGroup: string;
  discountPct: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/m2-engine/types.ts
git commit -m "feat(m2): add M2 engine type definitions"
```

---

### Task 2: selectDetector — Tests + Implementation

**Files:**
- Create: `src/lib/m2-engine/__tests__/select-detector.test.ts`
- Create: `src/lib/m2-engine/select-detector.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/m2-engine/__tests__/select-detector.test.ts
import { describe, it, expect } from 'vitest';
import { selectDetector } from '../select-detector';
import type { ProductRecord, SelectorInput } from '../types';

// Minimal product fixtures
const midiCO2: ProductRecord = {
  id: '1', type: 'detector', family: 'MIDI', name: 'MIDI IR CO2 0-10000ppm',
  code: '31-210-32', price: 450, gas: '["CO2"]', refs: '["R744"]',
  apps: '["supermarket","cold_room"]', range: '0-10000ppm', sensorTech: 'IR',
  voltage: '15-24V', atex: false, mount: '["wall","ceiling"]', standalone: true,
  discontinued: false, channels: null, relay: 2, analog: 'selectable',
  modbus: true, productGroup: 'G', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
};

const x5NH3: ProductRecord = {
  id: '2', type: 'detector', family: 'X5', name: 'X5 IONIC NH3 0-1000ppm',
  code: '3500-0001', price: 1200, gas: '["NH3"]', refs: '["R717"]',
  apps: '["machinery_room","cold_room"]', range: '0-1000ppm', sensorTech: 'IONIC',
  voltage: '18-32V', atex: true, mount: '["wall","pipe","pole"]', standalone: false,
  discontinued: false, channels: null, relay: 3, analog: '4-20mA x2',
  modbus: true, productGroup: 'G', tier: 'premium', subCategory: null,
  compatibleFamilies: '[]', remote: false,
};

const midiHFC: ProductRecord = {
  id: '3', type: 'detector', family: 'MIDI', name: 'MIDI SC HFC 0-1000ppm',
  code: '31-110-11', price: 400, gas: '["HFC1","HFC2"]', refs: '["R32","R410A","R134a","R404A"]',
  apps: '["supermarket","cold_room"]', range: '0-1000ppm', sensorTech: 'SC',
  voltage: '15-24V', atex: false, mount: '["wall","ceiling"]', standalone: true,
  discontinued: false, channels: null, relay: 2, analog: 'selectable',
  modbus: true, productGroup: 'G', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
};

const rmHFC: ProductRecord = {
  id: '4', type: 'detector', family: 'RM', name: 'RM HFC Compact',
  code: '32-100-01', price: 180, gas: '["HFC1","HFC2"]', refs: '["R32","R410A","R134a"]',
  apps: '["hotel","office"]', range: '0-5000ppm', sensorTech: 'SC',
  voltage: '12-24V', atex: false, mount: '["wall","ceiling"]', standalone: true,
  discontinued: false, channels: null, relay: 1, analog: null,
  modbus: false, productGroup: 'G', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/__tests__/select-detector.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement selectDetector**

```typescript
// src/lib/m2-engine/select-detector.ts
import type { SelectorInput, ProductRecord } from './types';

/** Parse a JSON string safely, returning empty array on failure */
function parseJson<T>(json: string): T[] {
  try { return JSON.parse(json); }
  catch { return []; }
}

/** Check if product voltage is compatible with site voltage */
function voltageCompatible(productVoltage: string | null, siteVoltage: string): boolean {
  if (!productVoltage) return false;
  const pv = productVoltage.toLowerCase();
  // Exact matches
  if (siteVoltage === '230V' && (pv.includes('230') || pv.includes('240') || pv.includes('100-240'))) return true;
  if (siteVoltage === '24V' && (pv.includes('24') || pv.includes('15-24') || pv.includes('18-32') || pv.includes('12-24'))) return true;
  if (siteVoltage === '12V' && (pv.includes('12') || pv.includes('12-24'))) return true;
  return false;
}

/**
 * Select compatible detectors from the product catalog.
 * Returns ranked array: preferred family first, then by price ascending.
 */
export function selectDetector(input: SelectorInput, products: ProductRecord[]): ProductRecord[] {
  const matches = products.filter((p) => {
    // Must be a detector
    if (p.type !== 'detector') return false;
    // Exclude discontinued
    if (p.discontinued) return false;
    // Gas group match
    const gases = parseJson<string>(p.gas);
    if (!gases.includes(input.gasGroup)) return false;
    // Refrigerant ref match (at least one)
    if (input.refrigerantRefs.length > 0) {
      const refs = parseJson<string>(p.refs);
      if (!input.refrigerantRefs.some(r => refs.includes(r))) return false;
    }
    // ATEX filter
    if (input.atexRequired && !p.atex) return false;
    // Voltage compatibility
    if (!voltageCompatible(p.voltage, input.voltage)) return false;
    // Mount type compatibility
    const mounts = parseJson<string>(p.mount);
    if (mounts.length > 0 && !mounts.includes(input.mountType)) return false;

    return true;
  });

  // Sort: preferred family first, then price ascending
  matches.sort((a, b) => {
    if (input.preferredFamily) {
      const aMatch = a.family === input.preferredFamily ? 0 : 1;
      const bMatch = b.family === input.preferredFamily ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
    }
    return a.price - b.price;
  });

  return matches;
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/__tests__/select-detector.test.ts`
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/m2-engine/select-detector.ts src/lib/m2-engine/__tests__/select-detector.test.ts
git commit -m "feat(m2): add selectDetector with tests"
```

---

### Task 3: selectController — Tests + Implementation

**Files:**
- Create: `src/lib/m2-engine/__tests__/select-controller.test.ts`
- Create: `src/lib/m2-engine/select-controller.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/m2-engine/__tests__/select-controller.test.ts
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
};

const mpu4: ProductRecord = {
  id: 'c2', type: 'controller', family: 'Controller', name: 'MPU-4',
  code: '21-2002', price: 800, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '24V', atex: false,
  mount: '["wall","DIN"]', standalone: false, discontinued: false,
  channels: 4, relay: 8, analog: null, modbus: true,
  productGroup: 'A', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
};

const mpu6: ProductRecord = {
  id: 'c3', type: 'controller', family: 'Controller', name: 'MPU-6',
  code: '21-2003', price: 1000, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '24V', atex: false,
  mount: '["wall","DIN"]', standalone: false, discontinued: false,
  channels: 6, relay: 12, analog: null, modbus: true,
  productGroup: 'A', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
};

const scu64: ProductRecord = {
  id: 'c4', type: 'controller', family: 'Controller', name: 'SCU3600',
  code: '21-3600', price: 3000, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '230V', atex: false,
  mount: '["wall"]', standalone: false, discontinued: false,
  channels: 64, relay: 16, analog: null, modbus: true,
  productGroup: 'D', tier: 'premium', subCategory: null,
  compatibleFamilies: '[]', remote: false,
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/__tests__/select-controller.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement selectController**

```typescript
// src/lib/m2-engine/select-controller.ts
import type { ProductRecord } from './types';

/**
 * Check if controller voltage is compatible with site voltage.
 * Controllers use simpler voltage strings than detectors.
 */
function ctrlVoltageOk(ctrlVoltage: string | null, siteVoltage: string): boolean {
  if (!ctrlVoltage) return false;
  const cv = ctrlVoltage.toLowerCase();
  if (siteVoltage === '230V') return cv.includes('230') || cv.includes('240') || cv.includes('100-240');
  if (siteVoltage === '24V') return cv.includes('24');
  if (siteVoltage === '12V') return cv.includes('12') || cv.includes('24'); // 12V can use 24V with PSU
  return false;
}

/**
 * Select the smallest controller that can handle totalDetectors.
 * Returns null if totalDetectors is 0 or no controller fits.
 */
export function selectController(
  totalDetectors: number,
  siteVoltage: string,
  products: ProductRecord[],
): ProductRecord | null {
  if (totalDetectors <= 0) return null;

  const candidates = products
    .filter((p) => {
      if (p.type !== 'controller') return false;
      if (p.discontinued) return false;
      if (p.channels === null || p.channels < totalDetectors) return false;
      if (!ctrlVoltageOk(p.voltage, siteVoltage)) return false;
      return true;
    })
    // Sort by channels ascending (smallest sufficient), then price
    .sort((a, b) => {
      const chDiff = (a.channels ?? 0) - (b.channels ?? 0);
      if (chDiff !== 0) return chDiff;
      return a.price - b.price;
    });

  return candidates[0] ?? null;
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/__tests__/select-controller.test.ts`
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/m2-engine/select-controller.ts src/lib/m2-engine/__tests__/select-controller.test.ts
git commit -m "feat(m2): add selectController with tests"
```

---

### Task 4: selectAccessories — Tests + Implementation

**Files:**
- Create: `src/lib/m2-engine/__tests__/select-accessories.test.ts`
- Create: `src/lib/m2-engine/select-accessories.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/m2-engine/__tests__/select-accessories.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/__tests__/select-accessories.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement selectAccessories**

```typescript
// src/lib/m2-engine/select-accessories.ts
import type { ProductRecord } from './types';

function parseJson<T>(json: string): T[] {
  try { return JSON.parse(json); }
  catch { return []; }
}

/** Check if accessory is compatible with detector family */
function familyCompatible(accessory: ProductRecord, detectorFamily: string): boolean {
  const families = parseJson<string>(accessory.compatibleFamilies);
  return families.includes('ALL') || families.includes(detectorFamily);
}

/** Check if accessory matches the gas group */
function gasMatch(accessory: ProductRecord, gasGroup: string): boolean {
  const gases = parseJson<string>(accessory.gas);
  if (gases.length === 0) return false; // no gas field = not gas-specific
  return gases.includes(gasGroup);
}

/** Essential sub-categories that should be pre-checked */
const ESSENTIAL_CATEGORIES = ['mounting', 'service'];

/**
 * Select accessories for a detector.
 * Essential = mounting + cal gas (pre-checked in UI).
 * Optional = alerts, power, network, software, spares.
 */
export function selectAccessories(
  detectorFamily: string,
  gasGroup: string,
  mountType: string,
  products: ProductRecord[],
): { essential: ProductRecord[]; optional: ProductRecord[] } {
  const compatible = products.filter((p) => {
    if (p.type !== 'accessory') return false;
    if (p.discontinued) return false;
    if (!familyCompatible(p, detectorFamily)) return false;
    return true;
  });

  const essential: ProductRecord[] = [];
  const optional: ProductRecord[] = [];

  for (const acc of compatible) {
    const cat = acc.subCategory ?? '';

    // Mounting brackets are essential
    if (cat === 'mounting') {
      essential.push(acc);
      continue;
    }

    // Cal gas matching gas group is essential
    if (cat === 'service' && gasMatch(acc, gasGroup)) {
      essential.push(acc);
      continue;
    }

    // Everything else is optional
    optional.push(acc);
  }

  return { essential, optional };
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/__tests__/select-accessories.test.ts`
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/m2-engine/select-accessories.ts src/lib/m2-engine/__tests__/select-accessories.test.ts
git commit -m "feat(m2): add selectAccessories with tests"
```

---

### Task 5: pricing — Tests + Implementation

**Files:**
- Create: `src/lib/m2-engine/__tests__/pricing.test.ts`
- Create: `src/lib/m2-engine/pricing.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/m2-engine/__tests__/pricing.test.ts
import { describe, it, expect } from 'vitest';
import { getDiscount, applyPricing } from '../pricing';
import type { BOMLine, DiscountRow } from '../types';

const matrix: DiscountRow[] = [
  { customerGroup: 'EDC', productGroup: 'A', discountPct: 67 },
  { customerGroup: 'EDC', productGroup: 'G', discountPct: 50 },
  { customerGroup: '3Fo', productGroup: 'A', discountPct: 50 },
  { customerGroup: '3Fo', productGroup: 'G', discountPct: 30 },
  { customerGroup: 'NO', productGroup: 'A', discountPct: 0 },
  { customerGroup: 'NO', productGroup: 'G', discountPct: 0 },
];

describe('getDiscount', () => {
  it('returns correct discount for EDC + group G', () => {
    expect(getDiscount('EDC', 'G', matrix)).toBe(50);
  });

  it('returns 0 for unknown customer group', () => {
    expect(getDiscount('UNKNOWN', 'G', matrix)).toBe(0);
  });

  it('returns 0 for NO group', () => {
    expect(getDiscount('NO', 'G', matrix)).toBe(0);
  });
});

describe('applyPricing', () => {
  it('calculates net price correctly', () => {
    const lines: BOMLine[] = [
      { productId: '1', code: 'X', name: 'Det', family: 'MIDI', type: 'detector',
        unitPrice: 1000, productGroup: 'G', qty: 2, lineTotal: 2000, essential: true },
      { productId: '2', code: 'Y', name: 'Bracket', family: 'Accessory', type: 'accessory',
        unitPrice: 100, productGroup: 'A', qty: 2, lineTotal: 200, essential: true },
    ];
    const result = applyPricing(lines, 'EDC', matrix);
    // Detector: 1000 * (1 - 0.50) = 500 * 2 = 1000
    // Bracket: 100 * (1 - 0.67) = 33 * 2 = 66
    expect(result[0].netUnitPrice).toBeCloseTo(500);
    expect(result[0].lineNetTotal).toBeCloseTo(1000);
    expect(result[1].netUnitPrice).toBeCloseTo(33);
    expect(result[1].lineNetTotal).toBeCloseTo(66);
  });

  it('returns gross prices when no customer group', () => {
    const lines: BOMLine[] = [
      { productId: '1', code: 'X', name: 'Det', family: 'MIDI', type: 'detector',
        unitPrice: 1000, productGroup: 'G', qty: 1, lineTotal: 1000, essential: true },
    ];
    const result = applyPricing(lines, '', matrix);
    expect(result[0].netUnitPrice).toBe(1000);
    expect(result[0].lineNetTotal).toBe(1000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/__tests__/pricing.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement pricing**

```typescript
// src/lib/m2-engine/pricing.ts
import type { BOMLine, DiscountRow } from './types';

export interface PricedLine extends BOMLine {
  discountPct: number;
  netUnitPrice: number;
  lineNetTotal: number;
}

/**
 * Lookup discount percentage from matrix.
 * Returns 0 if no match found.
 */
export function getDiscount(customerGroup: string, productGroup: string, matrix: DiscountRow[]): number {
  if (!customerGroup) return 0;
  const row = matrix.find(
    (r) => r.customerGroup === customerGroup && r.productGroup === productGroup,
  );
  return row?.discountPct ?? 0;
}

/**
 * Apply pricing to BOM lines using the discount matrix.
 */
export function applyPricing(lines: BOMLine[], customerGroup: string, matrix: DiscountRow[]): PricedLine[] {
  return lines.map((line) => {
    const discountPct = getDiscount(customerGroup, line.productGroup, matrix);
    const netUnitPrice = line.unitPrice * (1 - discountPct / 100);
    const lineNetTotal = netUnitPrice * line.qty;
    return { ...line, discountPct, netUnitPrice, lineNetTotal };
  });
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/__tests__/pricing.test.ts`
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/m2-engine/pricing.ts src/lib/m2-engine/__tests__/pricing.test.ts
git commit -m "feat(m2): add pricing engine with discount matrix"
```

---

### Task 6: buildBOM — Tests + Implementation

**Files:**
- Create: `src/lib/m2-engine/__tests__/build-bom.test.ts`
- Create: `src/lib/m2-engine/build-bom.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/m2-engine/__tests__/build-bom.test.ts
import { describe, it, expect } from 'vitest';
import { buildBOM } from '../build-bom';
import type { ProductRecord, SelectorInput, BOMZone } from '../types';

// Re-use fixtures from previous tests (copy inline — engineer may read this task standalone)
const midiCO2: ProductRecord = {
  id: '1', type: 'detector', family: 'MIDI', name: 'MIDI IR CO2',
  code: '31-210-32', price: 450, gas: '["CO2"]', refs: '["R744"]',
  apps: '[]', range: '0-10000ppm', sensorTech: 'IR',
  voltage: '15-24V', atex: false, mount: '["wall","ceiling"]', standalone: true,
  discontinued: false, channels: null, relay: 2, analog: 'selectable',
  modbus: true, productGroup: 'G', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
};

const mpu4: ProductRecord = {
  id: 'c2', type: 'controller', family: 'Controller', name: 'MPU-4',
  code: '21-2002', price: 800, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '24V', atex: false,
  mount: '["wall","DIN"]', standalone: false, discontinued: false,
  channels: 4, relay: 8, analog: null, modbus: true,
  productGroup: 'A', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false,
};

const bracket: ProductRecord = {
  id: 'a1', type: 'accessory', family: 'Accessory', name: 'Wall Bracket MIDI',
  code: '40-901', price: 25, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: null, atex: false,
  mount: '[]', standalone: false, discontinued: false,
  channels: null, relay: 0, analog: null, modbus: false,
  productGroup: 'A', tier: 'standard', subCategory: 'mounting',
  compatibleFamilies: '["MIDI"]', remote: false,
};

const calGas: ProductRecord = {
  id: 'a2', type: 'accessory', family: 'Accessory', name: 'Cal Gas CO2',
  code: '62-010', price: 150, gas: '["CO2"]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: null, atex: false,
  mount: '[]', standalone: false, discontinued: false,
  channels: null, relay: 0, analog: null, modbus: false,
  productGroup: 'A', tier: 'standard', subCategory: 'service',
  compatibleFamilies: '["ALL"]', remote: false,
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

    // 2 zones
    expect(result.zones.length).toBe(2);

    // Zone 1: 2 detectors
    expect(result.zones[0].detector).not.toBeNull();
    expect(result.zones[0].detector!.qty).toBe(2);
    expect(result.zones[0].detector!.code).toBe('31-210-32');

    // Zone 2: 1 detector
    expect(result.zones[1].detector!.qty).toBe(1);

    // Controller: 3 total detectors → MPU-4
    expect(result.controller).not.toBeNull();
    expect(result.controller!.code).toBe('21-2002');

    // Total gross: (3 * 450) + 800 + accessories
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/__tests__/build-bom.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement buildBOM**

```typescript
// src/lib/m2-engine/build-bom.ts
import type { SelectorInput, BOMZone, BOMLine, BOMResult, ProductRecord } from './types';
import { selectDetector } from './select-detector';
import { selectController } from './select-controller';
import { selectAccessories } from './select-accessories';

function toBOMLine(product: ProductRecord, qty: number, essential: boolean): BOMLine {
  return {
    productId: product.id,
    code: product.code,
    name: product.name,
    family: product.family,
    type: product.type as 'detector' | 'controller' | 'accessory',
    unitPrice: product.price,
    productGroup: product.productGroup,
    qty,
    lineTotal: product.price * qty,
    essential,
  };
}

/**
 * Build a complete Bill of Materials for the given zones.
 * Selects best detector, sizes controller, picks accessories.
 */
export function buildBOM(
  input: SelectorInput,
  zones: BOMZone[],
  products: ProductRecord[],
): BOMResult {
  // 1. Find best detector
  const detectorCandidates = selectDetector(input, products);
  const bestDetector = detectorCandidates[0] ?? null;

  // 2. Build per-zone BOM
  let totalDetectors = 0;
  const zoneBOMs = zones.map((zone) => {
    if (!bestDetector) {
      return { zoneName: zone.name, detector: null, accessories: [], subtotal: 0 };
    }

    totalDetectors += zone.detectorQty;
    const detLine = toBOMLine(bestDetector, zone.detectorQty, true);

    // 3. Accessories per zone
    const { essential, optional: _optional } = selectAccessories(
      bestDetector.family,
      input.gasGroup,
      input.mountType,
      products,
    );
    // Essential accessories: qty = 1 per zone (mounting, cal gas are per-zone)
    const accLines = essential.map((acc) => toBOMLine(acc, 1, true));

    const subtotal = detLine.lineTotal + accLines.reduce((s, a) => s + a.lineTotal, 0);
    return { zoneName: zone.name, detector: detLine, accessories: accLines, subtotal };
  });

  // 4. Controller (shared across all zones)
  let controllerLine: BOMLine | null = null;
  if (!input.standalone && totalDetectors > 0) {
    const ctrl = selectController(totalDetectors, input.voltage, products);
    if (ctrl) {
      controllerLine = toBOMLine(ctrl, 1, true);
    }
  }

  // 5. Total
  const zonesTotal = zoneBOMs.reduce((s, z) => s + z.subtotal, 0);
  const ctrlTotal = controllerLine?.lineTotal ?? 0;
  const totalGross = zonesTotal + ctrlTotal;

  return {
    zones: zoneBOMs,
    controller: controllerLine,
    sharedAccessories: [],
    totalGross,
  };
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/__tests__/build-bom.test.ts`
Expected: 3 tests PASS

- [ ] **Step 5: Run ALL M2 tests together**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run src/lib/m2-engine/`
Expected: All 25 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/m2-engine/build-bom.ts src/lib/m2-engine/__tests__/build-bom.test.ts
git commit -m "feat(m2): add buildBOM orchestrator with tests"
```

---

### Task 7: Enhance /api/products with M2 filters

**Files:**
- Modify: `src/app/api/products/route.ts`

- [ ] **Step 1: Add atex, refs, voltage, subCategory, compatibleFamily filters**

In `src/app/api/products/route.ts`, replace the GET function body. Add after the existing `gas` in-memory filter block (after line 39):

```typescript
// After the existing gas filter, add these in-memory filters:

const atex = searchParams.get('atex');
const refs = searchParams.get('refs');
const subCategory = searchParams.get('subCategory');
const compatibleFamily = searchParams.get('compatibleFamily');

if (atex === 'true') {
  products = products.filter((p) => p.atex === true);
}

if (refs) {
  products = products.filter((p) => {
    try {
      const r: string[] = JSON.parse(p.refs);
      return r.includes(refs);
    } catch {
      return false;
    }
  });
}

if (subCategory) {
  products = products.filter((p) => p.subCategory === subCategory);
}

if (compatibleFamily) {
  products = products.filter((p) => {
    try {
      const families: string[] = JSON.parse(p.compatibleFamilies);
      return families.includes('ALL') || families.includes(compatibleFamily);
    } catch {
      return false;
    }
  });
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/api/products/route.ts
git commit -m "feat(api): add atex, refs, subCategory, compatibleFamily filters to /api/products"
```

---

### Task 8: Standalone Selector — Page + Step 1 (AppGas)

**Files:**
- Create: `src/app/selector/page.tsx`
- Create: `src/components/selector/SelectorWizard.tsx`
- Create: `src/components/selector/StepAppGas.tsx`

- [ ] **Step 1: Create the selector page route**

```typescript
// src/app/selector/page.tsx
import SelectorWizard from '@/components/selector/SelectorWizard';

export default function SelectorPage() {
  return <SelectorWizard />;
}
```

- [ ] **Step 2: Create the SelectorWizard shell**

```typescript
// src/components/selector/SelectorWizard.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ProductRecord, DiscountRow, SelectorInput, BOMZone, BOMResult } from '@/lib/m2-engine/types';
import { buildBOM } from '@/lib/m2-engine/build-bom';
import StepAppGas from './StepAppGas';
import StepTechnical from './StepTechnical';
import StepZoneQty from './StepZoneQty';
import StepBOM from './StepBOM';

const STEP_LABELS = ['Application & Gas', 'Technical', 'Zones', 'Quote'];

interface RefOption {
  id: string;
  name: string;
  safetyClass: string;
  gasGroup: string;
}

interface AppOption {
  id: string;
  labelEn: string;
  icon: string;
  suggestedGases?: string;
}

export default function SelectorWizard() {
  const [step, setStep] = useState(1);

  // Data
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [discountMatrix, setDiscountMatrix] = useState<DiscountRow[]>([]);
  const [refrigerants, setRefrigerants] = useState<RefOption[]>([]);
  const [applications, setApplications] = useState<AppOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Step 1 state
  const [application, setApplication] = useState('');
  const [gasGroup, setGasGroup] = useState('');
  const [refrigerantRefs, setRefrigerantRefs] = useState<string[]>([]);
  const [preferredFamily, setPreferredFamily] = useState('');

  // Step 2 state
  const [voltage, setVoltage] = useState<'12V' | '24V' | '230V'>('24V');
  const [atexRequired, setAtexRequired] = useState(false);
  const [mountType, setMountType] = useState('wall');
  const [standalone, setStandalone] = useState(false);

  // Step 3 state
  const [zones, setZones] = useState<BOMZone[]>([{ name: 'Zone 1', detectorQty: 1 }]);

  // Step 4 state
  const [customerGroup, setCustomerGroup] = useState('');
  const [bomResult, setBomResult] = useState<BOMResult | null>(null);

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/products?discontinued=false').then(r => r.json()),
      fetch('/api/refrigerants-v5').then(r => r.json()),
      fetch('/api/applications').then(r => r.json()),
    ]).then(([prods, refs, apps]) => {
      setProducts(prods);
      setRefrigerants(refs);
      setApplications(apps);
      setLoading(false);
    }).catch(() => setLoading(false));
    // Fetch discount matrix
    fetch('/api/products?type=__discount_matrix__').catch(() => {});
  }, []);

  const selectorInput = useMemo((): SelectorInput => ({
    gasGroup,
    refrigerantRefs,
    preferredFamily: preferredFamily || undefined,
    voltage,
    atexRequired,
    mountType,
    standalone,
  }), [gasGroup, refrigerantRefs, preferredFamily, voltage, atexRequired, mountType, standalone]);

  function generateBOM() {
    const result = buildBOM(selectorInput, zones, products);
    setBomResult(result);
    setStep(4);
  }

  function nextStep() {
    if (step === 3) {
      generateBOM();
      return;
    }
    setStep(s => Math.min(s + 1, 4));
  }

  function prevStep() {
    setStep(s => Math.max(s - 1, 1));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E63946]">
        <div className="flex items-center gap-1">
          <span className="text-[#E63946] font-extrabold text-xl">SAMON</span>
          <span className="text-white font-extrabold text-xl ml-2">Product Selector</span>
        </div>
      </nav>

      {/* Step progress */}
      <div className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] py-5">
        <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const isDone = step > num;
            const isActive = step === num;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone ? 'bg-[#A7C031] text-white' : isActive ? 'bg-[#E63946] text-white' : 'border-2 border-[#2a4a60] text-[#4a7a95]'
                  }`}>
                    {isDone ? '✓' : num}
                  </div>
                  <span className={`mt-2 text-[11px] font-semibold ${isDone ? 'text-[#A7C031]' : isActive ? 'text-white' : 'text-[#4a7a95]'}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-[3px] mx-4 mt-[-1rem] rounded-full ${step > num ? 'bg-[#A7C031]' : 'bg-[#2a4a60]'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {step === 1 && (
          <StepAppGas
            applications={applications}
            refrigerants={refrigerants}
            application={application}
            gasGroup={gasGroup}
            refrigerantRefs={refrigerantRefs}
            preferredFamily={preferredFamily}
            onApplicationChange={setApplication}
            onGasGroupChange={setGasGroup}
            onRefrigerantRefsChange={setRefrigerantRefs}
            onPreferredFamilyChange={setPreferredFamily}
          />
        )}
        {step === 2 && (
          <StepTechnical
            voltage={voltage}
            atexRequired={atexRequired}
            mountType={mountType}
            standalone={standalone}
            onVoltageChange={setVoltage}
            onAtexChange={setAtexRequired}
            onMountChange={setMountType}
            onStandaloneChange={setStandalone}
          />
        )}
        {step === 3 && (
          <StepZoneQty zones={zones} onChange={setZones} />
        )}
        {step === 4 && bomResult && (
          <StepBOM
            bom={bomResult}
            products={products}
            selectorInput={selectorInput}
            customerGroup={customerGroup}
            onCustomerGroupChange={setCustomerGroup}
          />
        )}

        {/* Nav buttons */}
        {step < 4 ? (
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={prevStep} className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg">Back</button>
            ) : <div />}
            <button onClick={nextStep} className="bg-gradient-to-r from-[#A7C031] to-[#8fb028] hover:from-[#8fb028] hover:to-[#7da024] text-white font-bold px-8 py-3 rounded-lg shadow-lg">
              {step === 3 ? 'Generate Quote' : 'Next'}
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <button onClick={prevStep} className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg">Back</button>
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create StepAppGas component**

```typescript
// src/components/selector/StepAppGas.tsx
'use client';

import { useMemo } from 'react';

interface AppOption {
  id: string;
  labelEn: string;
  icon: string;
  suggestedGases?: string;
}

interface RefOption {
  id: string;
  name: string;
  safetyClass: string;
  gasGroup: string;
}

interface Props {
  applications: AppOption[];
  refrigerants: RefOption[];
  application: string;
  gasGroup: string;
  refrigerantRefs: string[];
  preferredFamily: string;
  onApplicationChange: (v: string) => void;
  onGasGroupChange: (v: string) => void;
  onRefrigerantRefsChange: (v: string[]) => void;
  onPreferredFamilyChange: (v: string) => void;
}

const GAS_GROUPS = ['CO2', 'HFC1', 'HFC2', 'NH3', 'R290', 'CO', 'NO2', 'O2'];
const FAMILIES = ['MIDI', 'X5', 'RM', 'Aquis'];

const inputClass = 'w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors';
const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

export default function StepAppGas({
  applications, refrigerants, application, gasGroup, refrigerantRefs,
  preferredFamily, onApplicationChange, onGasGroupChange,
  onRefrigerantRefsChange, onPreferredFamilyChange,
}: Props) {
  // Filter refrigerants by selected gas group
  const filteredRefs = useMemo(() => {
    if (!gasGroup) return refrigerants;
    return refrigerants.filter(r => r.gasGroup === gasGroup);
  }, [gasGroup, refrigerants]);

  function handleRefToggle(refId: string) {
    if (refrigerantRefs.includes(refId)) {
      onRefrigerantRefsChange(refrigerantRefs.filter(r => r !== refId));
    } else {
      onRefrigerantRefsChange([...refrigerantRefs, refId]);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#16354B]">Application & Gas</h2>

      {/* Application */}
      <div>
        <label className={labelClass}>Application</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {applications.map(app => (
            <button
              key={app.id}
              onClick={() => onApplicationChange(app.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                application === app.id
                  ? 'border-[#16354B] bg-[#16354B]/5'
                  : 'border-[#e2e8f0] hover:border-[#16354B]/30'
              }`}
            >
              <span className="text-lg mr-2">{app.icon}</span>
              <span className="text-sm font-medium text-[#16354B]">{app.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gas Group */}
      <div>
        <label className={labelClass}>Gas Group</label>
        <div className="flex flex-wrap gap-2">
          {GAS_GROUPS.map(g => (
            <button
              key={g}
              onClick={() => { onGasGroupChange(g); onRefrigerantRefsChange([]); }}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                gasGroup === g
                  ? 'border-[#E63946] bg-[#E63946]/10 text-[#E63946]'
                  : 'border-[#e2e8f0] text-[#6b8da5] hover:border-[#E63946]/30'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Refrigerant refs */}
      {gasGroup && (
        <div>
          <label className={labelClass}>Refrigerant(s)</label>
          <div className="flex flex-wrap gap-2">
            {filteredRefs.map(ref => (
              <button
                key={ref.id}
                onClick={() => handleRefToggle(ref.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  refrigerantRefs.includes(ref.id)
                    ? 'border-[#A7C031] bg-[#A7C031]/10 text-[#16354B]'
                    : 'border-[#e2e8f0] text-[#6b8da5] hover:border-[#A7C031]/30'
                }`}
              >
                {ref.id} — {ref.name} ({ref.safetyClass})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preferred Family */}
      <div>
        <label className={labelClass}>Preferred Product Range (optional)</label>
        <select
          value={preferredFamily}
          onChange={e => onPreferredFamilyChange(e.target.value)}
          className={inputClass}
        >
          <option value="">No preference</option>
          {FAMILIES.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx next build 2>&1 | tail -5`
Expected: Build succeeds (StepTechnical, StepZoneQty, StepBOM will be stub files — create them as stubs first)

Note: Before building, create stub files for the 3 missing components:

```typescript
// src/components/selector/StepTechnical.tsx
'use client';
export default function StepTechnical(props: Record<string, unknown>) {
  return <div>Step 2: Technical (TODO)</div>;
}
```

```typescript
// src/components/selector/StepZoneQty.tsx
'use client';
export default function StepZoneQty(props: Record<string, unknown>) {
  return <div>Step 3: Zones (TODO)</div>;
}
```

```typescript
// src/components/selector/StepBOM.tsx
'use client';
export default function StepBOM(props: Record<string, unknown>) {
  return <div>Step 4: BOM (TODO)</div>;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/selector/page.tsx src/components/selector/
git commit -m "feat(selector): add standalone selector wizard with StepAppGas"
```

---

### Task 9: Selector Step 2 (Technical) + Step 3 (ZoneQty)

**Files:**
- Modify: `src/components/selector/StepTechnical.tsx`
- Modify: `src/components/selector/StepZoneQty.tsx`

- [ ] **Step 1: Implement StepTechnical**

```typescript
// src/components/selector/StepTechnical.tsx
'use client';

const inputClass = 'w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors';
const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

const VOLTAGES = ['12V', '24V', '230V'] as const;
const MOUNTS = [
  { value: 'wall', label: 'Wall' },
  { value: 'ceiling', label: 'Ceiling' },
  { value: 'duct', label: 'Duct' },
  { value: 'floor', label: 'Floor' },
  { value: 'pipe', label: 'Pipe' },
  { value: 'pole', label: 'Pole' },
];

interface Props {
  voltage: '12V' | '24V' | '230V';
  atexRequired: boolean;
  mountType: string;
  standalone: boolean;
  onVoltageChange: (v: '12V' | '24V' | '230V') => void;
  onAtexChange: (v: boolean) => void;
  onMountChange: (v: string) => void;
  onStandaloneChange: (v: boolean) => void;
}

export default function StepTechnical({
  voltage, atexRequired, mountType, standalone,
  onVoltageChange, onAtexChange, onMountChange, onStandaloneChange,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#16354B]">Technical Requirements</h2>

      {/* Voltage */}
      <div>
        <label className={labelClass}>Site Voltage</label>
        <div className="flex gap-3">
          {VOLTAGES.map(v => (
            <button
              key={v}
              onClick={() => onVoltageChange(v)}
              className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
                voltage === v
                  ? 'border-[#16354B] bg-[#16354B] text-white'
                  : 'border-[#e2e8f0] text-[#6b8da5] hover:border-[#16354B]/30'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ATEX */}
      <div>
        <label className={labelClass}>ATEX Zone</label>
        <div className="flex gap-3">
          <button
            onClick={() => onAtexChange(false)}
            className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
              !atexRequired ? 'border-[#A7C031] bg-[#A7C031]/10 text-[#16354B]' : 'border-[#e2e8f0] text-[#6b8da5]'
            }`}
          >
            Non-ATEX
          </button>
          <button
            onClick={() => onAtexChange(true)}
            className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
              atexRequired ? 'border-[#E63946] bg-[#E63946]/10 text-[#E63946]' : 'border-[#e2e8f0] text-[#6b8da5]'
            }`}
          >
            ATEX Required
          </button>
        </div>
      </div>

      {/* Mount */}
      <div>
        <label className={labelClass}>Mounting Type</label>
        <select value={mountType} onChange={e => onMountChange(e.target.value)} className={inputClass}>
          {MOUNTS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Standalone */}
      <div>
        <label className={labelClass}>Operation Mode</label>
        <div className="flex gap-3">
          <button
            onClick={() => onStandaloneChange(false)}
            className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
              !standalone ? 'border-[#16354B] bg-[#16354B]/10 text-[#16354B]' : 'border-[#e2e8f0] text-[#6b8da5]'
            }`}
          >
            With Controller
          </button>
          <button
            onClick={() => onStandaloneChange(true)}
            className={`flex-1 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
              standalone ? 'border-[#16354B] bg-[#16354B]/10 text-[#16354B]' : 'border-[#e2e8f0] text-[#6b8da5]'
            }`}
          >
            Standalone
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement StepZoneQty**

```typescript
// src/components/selector/StepZoneQty.tsx
'use client';

import type { BOMZone } from '@/lib/m2-engine/types';

const inputClass = 'w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors';
const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

interface Props {
  zones: BOMZone[];
  onChange: (zones: BOMZone[]) => void;
}

export default function StepZoneQty({ zones, onChange }: Props) {
  function addZone() {
    onChange([...zones, { name: `Zone ${zones.length + 1}`, detectorQty: 1 }]);
  }

  function removeZone(index: number) {
    if (zones.length <= 1) return;
    onChange(zones.filter((_, i) => i !== index));
  }

  function updateZone(index: number, field: keyof BOMZone, value: string | number) {
    const updated = zones.map((z, i) => {
      if (i !== index) return z;
      if (field === 'detectorQty') return { ...z, detectorQty: Math.max(1, Number(value)) };
      return { ...z, [field]: value };
    });
    onChange(updated);
  }

  const totalDetectors = zones.reduce((s, z) => s + z.detectorQty, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#16354B]">Zones & Quantities</h2>
        <span className="text-sm font-semibold text-[#6b8da5]">
          Total: {totalDetectors} detector{totalDetectors !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {zones.map((zone, i) => (
          <div key={i} className="flex items-end gap-3 p-4 bg-white border-2 border-[#e2e8f0] rounded-lg">
            <div className="flex-1">
              <label className={labelClass}>Zone Name</label>
              <input
                type="text"
                value={zone.name}
                onChange={e => updateZone(i, 'name', e.target.value)}
                className={inputClass}
                placeholder="e.g. Cold Room 1"
              />
            </div>
            <div className="w-32">
              <label className={labelClass}>Detectors</label>
              <input
                type="number"
                min={1}
                value={zone.detectorQty}
                onChange={e => updateZone(i, 'detectorQty', e.target.value)}
                className={inputClass}
              />
            </div>
            {zones.length > 1 && (
              <button
                onClick={() => removeZone(i)}
                className="text-red-400 hover:text-red-600 p-2 transition-colors"
                title="Remove zone"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addZone}
        className="w-full py-3 border-2 border-dashed border-[#A7C031] text-[#A7C031] font-semibold rounded-lg hover:bg-[#A7C031]/5 transition-colors"
      >
        + Add Zone
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/selector/StepTechnical.tsx src/components/selector/StepZoneQty.tsx
git commit -m "feat(selector): implement StepTechnical and StepZoneQty"
```

---

### Task 10: Selector Step 4 (BOM / Quote)

**Files:**
- Modify: `src/components/selector/StepBOM.tsx`

- [ ] **Step 1: Implement StepBOM with pricing and PDF**

```typescript
// src/components/selector/StepBOM.tsx
'use client';

import { useMemo, useState, useCallback } from 'react';
import type { BOMResult, ProductRecord, SelectorInput, DiscountRow, BOMLine } from '@/lib/m2-engine/types';
import { applyPricing, type PricedLine } from '@/lib/m2-engine/pricing';
import { selectAccessories } from '@/lib/m2-engine/select-accessories';

const CUSTOMER_GROUPS = [
  '', 'EDC', 'OEM', '1Fo', '2Fo', '3Fo',
  '1Contractor', '2Contractor', '3Contractor',
  'AKund', 'BKund', 'NO',
];

interface Props {
  bom: BOMResult;
  products: ProductRecord[];
  selectorInput: SelectorInput;
  customerGroup: string;
  onCustomerGroupChange: (v: string) => void;
  discountMatrix?: DiscountRow[];
}

const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

export default function StepBOM({
  bom, products, selectorInput, customerGroup,
  onCustomerGroupChange, discountMatrix = [],
}: Props) {
  // Collect optional accessories for the selected detector family
  const detectorFamily = bom.zones[0]?.detector?.family ?? '';
  const optionalAccessories = useMemo(() => {
    if (!detectorFamily) return [];
    const { optional } = selectAccessories(detectorFamily, selectorInput.gasGroup, selectorInput.mountType, products);
    return optional;
  }, [detectorFamily, selectorInput.gasGroup, selectorInput.mountType, products]);

  const [selectedOptional, setSelectedOptional] = useState<Record<string, number>>({});

  function toggleOptional(code: string, price: number) {
    setSelectedOptional(prev => {
      const copy = { ...prev };
      if (copy[code]) { delete copy[code]; } else { copy[code] = 1; }
      return copy;
    });
  }

  // Collect all BOM lines for pricing
  const allLines = useMemo((): BOMLine[] => {
    const lines: BOMLine[] = [];
    for (const zone of bom.zones) {
      if (zone.detector) lines.push(zone.detector);
      lines.push(...zone.accessories);
    }
    if (bom.controller) lines.push(bom.controller);

    // Add selected optional accessories
    for (const [code, qty] of Object.entries(selectedOptional)) {
      const prod = optionalAccessories.find(a => a.code === code);
      if (prod) {
        lines.push({
          productId: prod.id, code: prod.code, name: prod.name,
          family: prod.family, type: 'accessory', unitPrice: prod.price,
          productGroup: prod.productGroup, qty, lineTotal: prod.price * qty,
          essential: false,
        });
      }
    }
    return lines;
  }, [bom, selectedOptional, optionalAccessories]);

  const pricedLines = useMemo(
    () => applyPricing(allLines, customerGroup, discountMatrix),
    [allLines, customerGroup, discountMatrix],
  );

  const totalGross = pricedLines.reduce((s, l) => s + l.lineTotal, 0);
  const totalNet = pricedLines.reduce((s, l) => s + l.lineNetTotal, 0);
  const showNet = customerGroup !== '' && discountMatrix.length > 0;

  const handleDownloadPdf = useCallback(async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('SAMON Product Quote', 14, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    let y = 45;
    doc.setFontSize(12);
    doc.text('Bill of Materials', 14, y);
    y += 10;

    doc.setFontSize(9);
    // Header
    doc.text('Code', 14, y);
    doc.text('Description', 50, y);
    doc.text('Qty', 130, y);
    doc.text('Unit Price', 145, y);
    doc.text('Total', 175, y);
    y += 6;

    for (const line of pricedLines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line.code, 14, y);
      doc.text(line.name.substring(0, 40), 50, y);
      doc.text(String(line.qty), 132, y);
      doc.text(`${line.unitPrice.toFixed(0)}`, 145, y);
      doc.text(`${line.lineTotal.toFixed(0)}`, 175, y);
      y += 5;
    }

    y += 10;
    doc.setFontSize(11);
    doc.text(`Total: EUR ${totalGross.toFixed(2)}`, 145, y);

    doc.save('samon-quote.pdf');
  }, [pricedLines, totalGross]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#16354B]">Product Quote</h2>
        <button
          onClick={handleDownloadPdf}
          className="bg-[#16354B] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1e4a6a] transition-colors"
        >
          Download PDF
        </button>
      </div>

      {/* Customer group selector */}
      <div>
        <label className={labelClass}>Customer Group (optional — for net pricing)</label>
        <select
          value={customerGroup}
          onChange={e => onCustomerGroupChange(e.target.value)}
          className="w-64 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm"
        >
          <option value="">No group (gross prices only)</option>
          {CUSTOMER_GROUPS.filter(Boolean).map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Per-zone tables */}
      {bom.zones.map((zone, zi) => (
        <div key={zi} className="border-2 border-[#e2e8f0] rounded-lg overflow-hidden">
          <div className="bg-[#16354B] text-white px-4 py-2 font-semibold text-sm">{zone.zoneName}</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-[10px] uppercase text-[#6b8da5]">Code</th>
                <th className="text-left px-4 py-2 text-[10px] uppercase text-[#6b8da5]">Product</th>
                <th className="text-center px-4 py-2 text-[10px] uppercase text-[#6b8da5]">Qty</th>
                <th className="text-right px-4 py-2 text-[10px] uppercase text-[#6b8da5]">Unit</th>
                <th className="text-right px-4 py-2 text-[10px] uppercase text-[#6b8da5]">Total</th>
              </tr>
            </thead>
            <tbody>
              {zone.detector && (
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{zone.detector.code}</td>
                  <td className="px-4 py-2">{zone.detector.name}</td>
                  <td className="px-4 py-2 text-center">{zone.detector.qty}</td>
                  <td className="px-4 py-2 text-right">{zone.detector.unitPrice.toFixed(0)}</td>
                  <td className="px-4 py-2 text-right font-semibold">{zone.detector.lineTotal.toFixed(0)}</td>
                </tr>
              )}
              {zone.accessories.map((acc, ai) => (
                <tr key={ai} className="border-t text-[#6b8da5]">
                  <td className="px-4 py-2 font-mono text-xs">{acc.code}</td>
                  <td className="px-4 py-2">{acc.name}</td>
                  <td className="px-4 py-2 text-center">{acc.qty}</td>
                  <td className="px-4 py-2 text-right">{acc.unitPrice.toFixed(0)}</td>
                  <td className="px-4 py-2 text-right">{acc.lineTotal.toFixed(0)}</td>
                </tr>
              ))}
              {!zone.detector && (
                <tr><td colSpan={5} className="px-4 py-3 text-center text-red-500">No compatible detector found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ))}

      {/* Controller */}
      {bom.controller && (
        <div className="border-2 border-[#A7C031] rounded-lg overflow-hidden">
          <div className="bg-[#A7C031] text-white px-4 py-2 font-semibold text-sm">Controller</div>
          <div className="px-4 py-3 flex justify-between items-center">
            <div>
              <span className="font-mono text-xs mr-3">{bom.controller.code}</span>
              <span className="text-sm">{bom.controller.name}</span>
            </div>
            <span className="font-semibold">{bom.controller.unitPrice.toFixed(0)} EUR</span>
          </div>
        </div>
      )}

      {/* Optional accessories */}
      {optionalAccessories.length > 0 && (
        <div className="border-2 border-[#e2e8f0] rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-semibold text-sm text-[#16354B]">Additional Accessories</div>
          <div className="divide-y">
            {optionalAccessories.map(acc => (
              <label key={acc.code} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!selectedOptional[acc.code]}
                  onChange={() => toggleOptional(acc.code, acc.price)}
                  className="mr-3"
                />
                <span className="font-mono text-xs mr-3 text-[#6b8da5]">{acc.code}</span>
                <span className="flex-1 text-sm">{acc.name}</span>
                <span className="text-sm font-semibold">{acc.price.toFixed(0)} EUR</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="bg-[#16354B] text-white rounded-lg p-6">
        <div className="flex justify-between text-lg">
          <span>Total (Gross)</span>
          <span className="font-bold">{totalGross.toFixed(2)} EUR</span>
        </div>
        {showNet && (
          <div className="flex justify-between text-lg mt-2 text-[#A7C031]">
            <span>Total (Net — {customerGroup})</span>
            <span className="font-bold">{totalNet.toFixed(2)} EUR</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/selector/StepBOM.tsx
git commit -m "feat(selector): implement StepBOM with pricing, optional accessories, and PDF"
```

---

### Task 11: Integrate Step 5 into Existing Wizard

**Files:**
- Create: `src/components/configurator/StepProducts.tsx`
- Modify: `src/components/configurator/i18n.ts` — Add Step 5 labels
- Modify: `src/components/configurator/types.ts` — Add 'products' to WizardStep
- Modify: `src/app/configurator/page.tsx` — Add Step 5 routing + "Generate Quote" button on Step 4

- [ ] **Step 1: Add i18n labels for Step 5**

In `src/components/configurator/i18n.ts`, update the STEPS constant to add a 5th step:

```typescript
// Change STEPS from 4 to 5 entries
export const STEPS = {
  en: ['Client', 'Gas & App', 'Zones', 'Calc Sheet', 'Products'],
  fr: ['Client', 'Gaz & App', 'Zones', 'Fiche Calcul', 'Produits'],
  sv: ['Kund', 'Gas & App', 'Zoner', 'Beräkningsblad', 'Produkter'],
  de: ['Kunde', 'Gas & App', 'Zonen', 'Berechnungsblatt', 'Produkte'],
  es: ['Cliente', 'Gas & App', 'Zonas', 'Hoja de Cálculo', 'Productos'],
} as const;
```

Also add NAV keys for the quote button:

In the NAV object, add `quote` key to each language:

```typescript
// en: add → quote: 'Generate Quote'
// fr: add → quote: 'Générer le devis'
// sv: add → quote: 'Generera offert'
// de: add → quote: 'Angebot erstellen'
// es: add → quote: 'Generar presupuesto'
```

- [ ] **Step 2: Create StepProducts wrapper**

```typescript
// src/components/configurator/StepProducts.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ClientData, GasAppData, ZoneData } from './types';
import type { RefrigerantV5, ZoneRegulationResult } from '@/lib/engine-types';
import type { ProductRecord, SelectorInput, BOMZone, DiscountRow } from '@/lib/m2-engine/types';
import { buildBOM } from '@/lib/m2-engine/build-bom';
import StepBOM from '@/components/selector/StepBOM';
import { type Lang } from './i18n';

interface Props {
  clientData: ClientData;
  gasAppData: GasAppData;
  zones: ZoneData[];
  refrigerant: RefrigerantV5;
  zoneRegulations: ZoneRegulationResult[];
  lang?: Lang;
}

export default function StepProducts({
  clientData, gasAppData, zones, refrigerant, zoneRegulations, lang = 'en',
}: Props) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [discountMatrix, setDiscountMatrix] = useState<DiscountRow[]>([]);
  const [customerGroup, setCustomerGroup] = useState(clientData.customerGroup || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?discontinued=false')
      .then(r => r.json())
      .then(prods => { setProducts(prods); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Build M2 input from M1 results
  const selectorInput = useMemo((): SelectorInput => {
    // Check if ATEX is required from M1 extra requirements
    const atexRequired = zoneRegulations.some(zr =>
      zr.result.extraRequirements.some(er => er.id === 'ATEX' && er.mandatory)
    );

    return {
      gasGroup: refrigerant.gasGroup,
      refrigerantRefs: [refrigerant.id],
      preferredFamily: gasAppData.selectedRange || undefined,
      voltage: gasAppData.sitePowerVoltage,
      atexRequired: gasAppData.zoneAtex || atexRequired,
      mountType: gasAppData.mountingType || 'wall',
      standalone: false,
    };
  }, [refrigerant, gasAppData, zoneRegulations]);

  // Build zones from M1 results
  const bomZones = useMemo((): BOMZone[] => {
    return zoneRegulations.map((zr) => ({
      name: zr.zoneName,
      detectorQty: zr.result.recommendedDetectors,
    }));
  }, [zoneRegulations]);

  const bomResult = useMemo(() => {
    if (products.length === 0) return null;
    return buildBOM(selectorInput, bomZones, products);
  }, [selectorInput, bomZones, products]);

  if (loading || !bomResult) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <StepBOM
      bom={bomResult}
      products={products}
      selectorInput={selectorInput}
      customerGroup={customerGroup}
      onCustomerGroupChange={setCustomerGroup}
      discountMatrix={discountMatrix}
    />
  );
}
```

- [ ] **Step 3: Wire Step 5 into configurator page**

In `src/app/configurator/page.tsx`:

1. Add import: `import StepProducts from '@/components/configurator/StepProducts';`
2. Change step max from 4 to 5 throughout
3. After the Step 4 render block (around line 470), add Step 5 block:

```typescript
{/* Step 5 — Products */}
{step === 5 && calcResult && selectedRefrigerant && (
  <StepProducts
    clientData={clientData}
    gasAppData={gasAppData}
    zones={zones}
    refrigerant={selectedRefrigerant}
    zoneRegulations={calcResult.zoneResults}
    lang={lang}
  />
)}
```

4. On Step 4, add a "Generate Quote" button. After the back button on step 4 (around line 516), add:

```typescript
{step === 4 && (
  <div className="mt-6 print:hidden flex gap-3">
    <button
      onClick={prevStep}
      className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg transition-colors"
    >
      {NAV[lang].back}
    </button>
    <button
      onClick={() => setStep(5)}
      className="bg-gradient-to-r from-[#A7C031] to-[#8fb028] hover:from-[#8fb028] hover:to-[#7da024] text-white font-bold px-8 py-3 rounded-lg transition-all shadow-lg shadow-[#A7C031]/30"
    >
      {NAV[lang].quote}
    </button>
  </div>
)}
```

5. On Step 5, add back button:

```typescript
{step === 5 && (
  <div className="mt-6 print:hidden">
    <button
      onClick={() => setStep(4)}
      className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg transition-colors"
    >
      {NAV[lang].back}
    </button>
  </div>
)}
```

- [ ] **Step 4: Verify build + all tests**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx next build 2>&1 | tail -5`
Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run 2>&1 | tail -5`
Expected: Build succeeds, all tests pass (39 existing + 25 new M2 = 64)

- [ ] **Step 5: Commit**

```bash
git add src/components/configurator/StepProducts.tsx src/components/configurator/i18n.ts src/components/configurator/types.ts src/app/configurator/page.tsx
git commit -m "feat: integrate M2 product selection as Step 5 in wizard"
```

---

### Task 12: Discount Matrix API + Integration

**Files:**
- Create: `src/app/api/discount-matrix/route.ts`
- Modify: `src/components/selector/SelectorWizard.tsx` — Fetch discount matrix
- Modify: `src/components/configurator/StepProducts.tsx` — Fetch discount matrix

- [ ] **Step 1: Create discount matrix API**

```typescript
// src/app/api/discount-matrix/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const rows = await prisma.discountMatrix.findMany({
      orderBy: [{ customerGroup: 'asc' }, { productGroup: 'asc' }],
    });
    return NextResponse.json(rows);
  } catch (error) {
    console.error('[API] GET /discount-matrix error:', error);
    return NextResponse.json({ error: 'Failed to fetch discount matrix' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Wire discount matrix fetch into SelectorWizard**

In `src/components/selector/SelectorWizard.tsx`, in the useEffect that fetches data, add the discount matrix fetch:

```typescript
// Add to the Promise.all array:
fetch('/api/discount-matrix').then(r => r.json()),
```

Then in the `.then()` callback, add: `setDiscountMatrix(dm);` (where `dm` is the 4th item).

Pass `discountMatrix` to `StepBOM`:
```typescript
<StepBOM ... discountMatrix={discountMatrix} />
```

- [ ] **Step 3: Wire discount matrix fetch into StepProducts**

In `src/components/configurator/StepProducts.tsx`, add to the useEffect:

```typescript
fetch('/api/discount-matrix').then(r => r.json()).then(setDiscountMatrix).catch(() => {});
```

- [ ] **Step 4: Verify build**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/api/discount-matrix/route.ts src/components/selector/SelectorWizard.tsx src/components/configurator/StepProducts.tsx
git commit -m "feat: add discount matrix API and wire into selector + wizard"
```

---

### Task 13: Final Verification + Push

- [ ] **Step 1: Run full test suite**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx vitest run`
Expected: All tests pass (64+)

- [ ] **Step 2: Build production**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx next build 2>&1 | tail -10`
Expected: Build succeeds with no errors

- [ ] **Step 3: Push**

```bash
cd "C:/1- Marwan/Claude/18- DetectCalc" && git push origin master
```
