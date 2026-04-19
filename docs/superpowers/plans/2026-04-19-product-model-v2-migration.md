# Product Model V2 Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all 174 products with 137 new ones from the Universal Product Model, add Sensor/Alert types, rewrite M2 engine to use connectionRules/compatibleWith instead of ProductRelation table, and update all admin UI/tests accordingly.

**Architecture:** The Product model gains structured fields (variant, subType, status, ports, connectionRules, compatibleWith) while keeping flat pricing fields (price, productGroup, tier). The M2 engine drops the filter pipeline + scoring approach in favor of the SystemDesigner pattern that generates all valid combinations with connectionRules-driven accessory/alert/controller selection. The 2×2 tier matrix (Premium/Eco × Standalone/Centralized) is preserved by assigning tiers to each product. ProductRelation table is deleted — replaced by `compatibleWith` on each product.

**Tech Stack:** Next.js 16, React 19, Prisma/SQLite (libsql), Tailwind 4, Vitest

**Source data:** `INPUTS/19-04-26/2026-04-19/` — products-flat.csv (137 products), engine.ts (selection logic), design-rules.json (connectionRules, wiring topologies), compatibility-matrix.json, gas-coverage.json, types.ts, photos/ (38 images)

---

## File Structure

### Files to Create
| File | Responsibility |
|------|---------------|
| `prisma/seed-data/products-v2.ts` | New 137-product seed (replaces products.ts) |
| `src/lib/m2-engine/designer.ts` | New SystemDesigner class (replaces selection-engine.ts core) |
| `src/lib/m2-engine/designer-types.ts` | New types for designer (DesignerInputs, Solution, BomComponent) |
| `src/lib/m2-engine/__tests__/designer.test.ts` | Tests for the new designer engine |

### Files to Modify
| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add variant, subType, function, status, ports, connectionRules, compatibleWith to Product. Remove ProductRelation model. |
| `prisma/seed.ts` | Remove product-relations seeding, update product count |
| `prisma/seed-data/products.ts` | Replace with import from products-v2.ts or delete |
| `prisma/seed-data/product-relations.ts` | Delete entirely |
| `prisma/seed-data/applications.ts` | Update all 12 apps: new family names, individual refrigerants, add MICRO to heat_pump |
| `src/lib/m2-engine/types.ts` | Add new interfaces (ProductEntry v2), keep pricing types |
| `src/lib/m2-engine/parse-product.ts` | Update parser for new schema fields |
| `src/lib/m2-engine/selection-engine.ts` | Refactor to use designer.ts, keep 2×2 matrix wrapper |
| `src/lib/m2-engine/select-controller.ts` | Rewrite using compatibleWith + connectionRules |
| `src/lib/m2-engine/select-accessories.ts` | Rewrite using compatibleWith + connectionRules |
| `src/lib/m2-engine/build-bom.ts` | Update for new product structure |
| `src/lib/m2-engine/pricing-engine.ts` | Minor: handle new type field values (sensor, alert) |
| `src/lib/m2-engine/relation-types.ts` | Delete or gut — no more ProductRelation |
| `src/app/admin/products/page.tsx` | Add new form fields (variant, subType, status, ports, connectionRules, compatibleWith) |
| `src/app/admin/applications/page.tsx` | Display individual refrigerants instead of gas groups |
| `src/app/admin/simulator-m2/page.tsx` | Update for new engine interface |
| `src/app/admin/testlab-m2/page.tsx` | Rewrite test scenarios for new products |
| `src/app/admin/engine-m2/page.tsx` | Update documentation to reflect new logic |
| `src/app/api/products/route.ts` | Handle new fields in GET/POST/PUT |
| `src/app/api/product-relations/route.ts` | Delete or return empty |
| `src/components/selector/SelectorWizard.tsx` | Update product parsing |
| `src/components/configurator/StepProducts.tsx` | Update product parsing |

### Files to Delete
| File | Reason |
|------|--------|
| `prisma/seed-data/product-relations.ts` | Replaced by compatibleWith field |
| `src/lib/m2-engine/relation-types.ts` | No more ProductRelation model |

---

## Task 1: Prisma Schema — Add New Fields, Remove ProductRelation

**Files:**
- Modify: `prisma/schema.prisma:99-141` (Product model) and `:189-202` (ProductRelation model)

- [ ] **Step 1: Update Product model with new fields**

Add these fields to the Product model in `prisma/schema.prisma` after the existing fields:

```prisma
model Product {
  // ... existing fields stay ...

  // ─── V2 fields ───
  variant        String?                       // "CO2 Integrated", "NH3 Remote", "Standard"
  subType        String?                       // "gas_detector", "direct_mount_sensor", "beacon", "power_adapter"
  function       String?                       // Human-readable function description
  status         String   @default("active")   // "active", "discontinued", "planned"
  ports          String   @default("[]")       // JSON: Port[] (inputs/outputs/features)
  connectionRules String  @default("{}")       // JSON: ConnectionRules (maxDetectors, alertsNeeded, etc.)
  compatibleWith  String  @default("[]")       // JSON: string[] of family names this product works with
}
```

- [ ] **Step 2: Remove ProductRelation model**

Delete the `ProductRelation` model (lines 189-202) and its `@@index` directives from `prisma/schema.prisma`.

- [ ] **Step 3: Push schema to DB**

Run: `npx prisma db push`
Expected: Schema synced, no data loss (new fields are optional with defaults)

- [ ] **Step 4: Regenerate Prisma client**

Run: `npx prisma generate`
Expected: Client regenerated successfully

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add V2 product fields, remove ProductRelation model"
```

---

## Task 2: Copy Product Photos to Public Assets

**Files:**
- Source: `INPUTS/19-04-26/photos/` (38 images)
- Target: `public/assets/`

- [ ] **Step 1: Copy all 38 photos**

```bash
cp INPUTS/19-04-26/photos/* public/assets/
```

- [ ] **Step 2: Verify file count**

```bash
ls public/assets/*.jpeg public/assets/*.jpg public/assets/*.png | wc -l
```
Expected: 38 new files added (some may overwrite existing with same name)

- [ ] **Step 3: Commit**

```bash
git add public/assets/
git commit -m "feat: add V2 product photos (38 images)"
```

---

## Task 3: New Product Seed Data (137 products)

**Files:**
- Create: `prisma/seed-data/products-v2.ts`
- Modify: `prisma/seed-data/products.ts` (replace content with re-export)
- Delete: `prisma/seed-data/product-relations.ts`

- [ ] **Step 1: Create products-v2.ts with all 137 products**

Parse `INPUTS/19-04-26/2026-04-19/products-flat.csv` and create the new seed file. Each product must have:

**Mapping from CSV to Prisma fields:**

| CSV Column | Prisma Field | Transform |
|---|---|---|
| Code | code | as-is |
| Name | name | as-is |
| Family | family | as-is (e.g. "GLACIAR MIDI") |
| Variant | variant | as-is (e.g. "CO2 Integrated") |
| Type | type | as-is: detector, sensor, controller, alert, accessory |
| SubType | subType | as-is: gas_detector, direct_mount_sensor, beacon, etc. |
| Function | function | as-is (human-readable description) |
| Gas | gas → JSON array | Split by "; " → individual refs. Also set `refs` to same. |
| Price EUR | price | number, 0 if empty |
| Status | status | "active", "planned" |
| Voltage | voltage | as-is string |
| IP Rating | ip | as-is |
| Range | range | as-is |
| Sensor Tech | sensorTech | as-is |
| Sensor Life | sensorLife | as-is |
| Relay Count | relay | number |
| Modbus | modbus | "Yes"→true |
| 4-20mA | analog | "Yes"→"4-20mA", else null |
| Standalone | standalone | "Yes"→true |
| ATEX | atex | "Yes"→true |
| Connection | connectTo | as-is string |
| Compatible With | compatibleWith → JSON | Split by "; " → JSON array |
| Image | image | as-is filename |

**Tier assignment rules:**
- GLACIAR MIDI IR sensors → "premium"
- GLACIAR MIDI SC/EC sensors → "standard"
- GLACIAR MICRO → "economic"
- GLACIAR RM → "economic"
- X5 IR sensors → "premium"
- X5 EC/Ionic sensors → "standard"
- GLACIAR Controller 10 → "premium"
- X5 Transmitter → "premium"
- Alerts → "standard"
- Accessories → "standard"

**Product group assignment:**
- Detectors: "A" (standard), "D" (premium IR)
- Sensors: "A" (standard), "D" (premium IR)
- Controllers: "G" (premium)
- Alerts: "C"
- Accessories: "C"

**Special: GLACIAR MICRO additions (not in CSV):**
- Add 2 MICRO products from CSV (MICRO-IR-R290, MICRO-IR-R32)
- Set price = 160 for both
- Set standalone = true (override from CSV which says false)
- Set status = "active"

**ConnectionRules:** Populate from `INPUTS/19-04-26/2026-04-19/design-rules.json` — each family's rules object goes into the `connectionRules` JSON field of corresponding products.

**Ports:** Populate from `design-rules.json` — each family's ports object goes into the `ports` JSON field.

- [ ] **Step 2: Delete product-relations.ts**

```bash
rm prisma/seed-data/product-relations.ts
```

- [ ] **Step 3: Update products.ts to re-export from products-v2**

Replace `prisma/seed-data/products.ts` content with:
```typescript
export { PRODUCTS, DISCONTINUED_CODES } from './products-v2';
```

- [ ] **Step 4: Update seed.ts — remove relations seeding**

In `prisma/seed.ts`:
- Remove `import { PRODUCT_RELATIONS }` line
- Remove `prisma.productRelation.deleteMany()` and the relations seeding loop
- Keep everything else (refrigerants, gas categories, applications, products, discounts, admin user)

- [ ] **Step 5: Run seed**

```bash
npx tsx prisma/seed.ts
```
Expected output:
- Products: 137 (0 discontinued skipped)
- No product relations seeded
- All other seeds unchanged

- [ ] **Step 6: Verify product counts in DB**

```bash
npx tsx -e "
import { createClient } from '@libsql/client';
const db = createClient({ url: 'file:saferef.db' });
async function main() {
  const total = await db.execute('SELECT COUNT(*) as c FROM Product');
  const byType = await db.execute('SELECT type, COUNT(*) as c FROM Product GROUP BY type ORDER BY type');
  console.log('Total:', total.rows[0].c);
  byType.rows.forEach(r => console.log(' ', r.type, r.c));
}
main();
"
```
Expected:
```
Total: 137
  accessory 38
  alert 9
  controller 2
  detector 28
  sensor 60
```

- [ ] **Step 7: Commit**

```bash
git add prisma/seed-data/ prisma/seed.ts
git commit -m "feat: replace product catalog with V2 (137 products, 5 types)"
```

---

## Task 4: Update Applications Seed

**Files:**
- Modify: `prisma/seed-data/applications.ts`

- [ ] **Step 1: Update all 12 applications**

Replace old family names and gas groups with new ones:

| Application | Old productFamilies | New productFamilies | Old suggestedGases | New suggestedGases |
|---|---|---|---|---|
| supermarket | MIDI, MP | GLACIAR MIDI | co2, hfc1, hfc2 | R744, R32, R134A, R404A, R449A, R410A, R407F |
| cold_room | MIDI, MP, X5, AQUIS | GLACIAR MIDI, X5 Direct Sensor Module, X5 Remote Sensor | co2, hfc1, hfc2, nh3 | R744, R717, R32, R134A, R404A, R449A |
| machinery_room | X5, GXR, GEX | X5 Direct Sensor Module, X5 Remote Sensor, GLACIAR MIDI | co2, hfc1, hfc2, nh3, r290 | R744, R717, R290, R32, R134A |
| hotel | RM | GLACIAR RM | hfc1, hfc2 | R32, R410A |
| hospital | RM, MIDI | GLACIAR RM, GLACIAR MIDI | hfc1, hfc2, co2 | R32, R410A, R744 |
| public_venue | X5, MIDI, TR | X5 Direct Sensor Module, X5 Remote Sensor, GLACIAR MIDI | nh3, co2, hfc1 | R717, R744, R32 |
| data_center | MIDI, X5 | GLACIAR MIDI, X5 Direct Sensor Module, X5 Remote Sensor | hfc1, hfc2, co2 | R32, R134A, R744, R410A |
| heat_pump | MIDI, G | GLACIAR MIDI, GLACIAR MICRO | hfc2, r290 | R32, R410A, R290, R454B, R454C |
| marine | X5, MIDI, GXR | X5 Direct Sensor Module, X5 Remote Sensor, GLACIAR MIDI | nh3, co2, hfc1, r290 | R717, R744, R32, R290 |
| pharma_lab | MIDI, RM | GLACIAR MIDI, GLACIAR RM | co2, hfc1, hfc2 | R744, R32, R134A |
| food_processing | X5, GXR, TR | X5 Direct Sensor Module, X5 Remote Sensor, GLACIAR MIDI | nh3, co2 | R717, R744 |
| transport | MIDI, G | GLACIAR MIDI | hfc1, co2 | R32, R134A, R744, R404A |

- [ ] **Step 2: Re-seed and verify**

```bash
npx tsx prisma/seed.ts
```

- [ ] **Step 3: Commit**

```bash
git add prisma/seed-data/applications.ts
git commit -m "feat: update applications with new family names and individual refrigerants"
```

---

## Task 5: M2 Engine — New Designer Types

**Files:**
- Create: `src/lib/m2-engine/designer-types.ts`

- [ ] **Step 1: Create designer-types.ts**

```typescript
// ─── Designer V2 Types ──────────────────────────────────────────────────────
// Adapted from INPUTS/19-04-26/2026-04-19/types.ts for SafeRef Prisma model

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
  type: string;             // "detector" | "sensor" | "controller" | "alert" | "accessory"
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
  tier: 'premium' | 'standard' | 'economic';
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

/** V2 Product — matches Prisma Product model with new fields */
export interface ProductV2 {
  id: string;
  type: string;
  family: string;
  name: string;
  code: string;
  price: number;
  image: string | null;
  variant: string | null;
  subType: string | null;
  function: string | null;
  status: string;
  tier: string;
  productGroup: string;
  // Detection
  gas: string;              // JSON array of individual refrigerants
  refs: string;             // JSON array (same as gas for V2)
  range: string | null;
  sensorTech: string | null;
  sensorLife: string | null;
  // Electrical
  voltage: string | null;
  ip: string | null;
  power: number | null;
  tempMin: number | null;
  tempMax: number | null;
  // Outputs
  relay: number;
  analog: string | null;
  modbus: boolean;
  standalone: boolean;
  atex: boolean;
  remote: boolean;
  // Mounting
  mount: string;            // JSON array
  // Connection
  connectTo: string | null;
  compatibleWith: string;   // JSON array of family names
  compatibleFamilies: string; // JSON array (for accessories)
  // V2 structured
  ports: string;            // JSON: Port[]
  connectionRules: string;  // JSON: ConnectionRules
  // Meta
  subCategory: string | null;
  channels: number | null;
  maxPower: number | null;
  features: string | null;
  discontinued: boolean;
  apps: string;             // JSON array of application IDs
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/m2-engine/designer-types.ts
git commit -m "feat: add V2 designer types for new product model"
```

---

## Task 6: M2 Engine — Designer Core (Selection Logic Rewrite)

**Files:**
- Create: `src/lib/m2-engine/designer.ts`
- Create: `src/lib/m2-engine/__tests__/designer.test.ts`

This is the core engine rewrite. The new designer:
1. Filters detectors/sensors by gas, ATEX, voltage, location, application, measurement type
2. For each detector, finds compatible controllers via `compatibleWith`
3. Generates standalone + centralized solutions
4. Calculates alert qty from `connectionRules`
5. Calculates adapter qty from `connectionRules`
6. Finds accessories by `compatibleWith` + `connectionRules`
7. Handles X5 Config A/B/C from `connectionRules.configurations`
8. Assigns tier from product's `tier` field
9. Groups into 2×2 matrix

- [ ] **Step 1: Write failing test — basic gas filter**

Create `src/lib/m2-engine/__tests__/designer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { SystemDesigner } from '../designer';
import type { ProductV2, DesignerInputs } from '../designer-types';

function makeProduct(overrides: Partial<ProductV2>): ProductV2 {
  return {
    id: 'test', type: 'detector', family: 'GLACIAR MIDI', name: 'Test',
    code: 'TEST-001', price: 500, image: null, variant: null, subType: 'gas_detector',
    function: null, status: 'active', tier: 'standard', productGroup: 'A',
    gas: '["R744"]', refs: '["R744"]', range: '0-10000 ppm', sensorTech: 'NDIR Infrared',
    sensorLife: '7 years', voltage: '15..24 VDC; 24 VAC/DC V', ip: 'IP67',
    power: null, tempMin: null, tempMax: null, relay: 2, analog: '4-20mA',
    modbus: true, standalone: true, atex: false, remote: false,
    mount: '["wall"]', connectTo: null, compatibleWith: '[]',
    compatibleFamilies: '[]', ports: '[]', connectionRules: '{}',
    subCategory: null, channels: null, maxPower: null, features: null,
    discontinued: false, apps: '[]',
    ...overrides,
  };
}

describe('SystemDesigner', () => {
  it('filters detectors by gas', () => {
    const products = [
      makeProduct({ code: 'MIDI-CO2', gas: '["R744"]', name: 'MIDI CO2' }),
      makeProduct({ code: 'MIDI-NH3', gas: '["R717"]', name: 'MIDI NH3' }),
    ];
    const designer = new SystemDesigner(products);
    const solutions = designer.generate({ gas: 'R744', atex: false, voltage: '', location: 'ambient', outputs: [], measType: '', points: 1 });
    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions.every(s => s.detector.code === 'MIDI-CO2')).toBe(true);
  });

  it('generates standalone solution for detector with relays', () => {
    const products = [
      makeProduct({ code: 'MIDI-CO2', gas: '["R744"]', standalone: true, relay: 2, tier: 'premium' }),
    ];
    const designer = new SystemDesigner(products);
    const solutions = designer.generate({ gas: 'R744', atex: false, voltage: '', location: 'ambient', outputs: [], measType: '', points: 1 });
    const standalone = solutions.filter(s => s.mode === 'standalone');
    expect(standalone.length).toBe(1);
    expect(standalone[0].controller).toBeNull();
  });

  it('generates centralized solution when compatibleWith has controller', () => {
    const products = [
      makeProduct({ code: 'MIDI-CO2', gas: '["R744"]', standalone: true, relay: 2, tier: 'premium',
        compatibleWith: '["GLACIAR Controller 10"]' }),
      makeProduct({ code: 'GC10', type: 'controller', family: 'GLACIAR Controller 10', name: 'GLACIAR Controller 10',
        price: 2996, tier: 'premium', productGroup: 'G', gas: '[]', refs: '[]',
        connectionRules: JSON.stringify({ maxDetectors: 10, beaconsNeeded: 1, sirensNeeded: 1, powersDetectors: true }) }),
    ];
    const designer = new SystemDesigner(products);
    const solutions = designer.generate({ gas: 'R744', atex: false, voltage: '', location: 'ambient', outputs: [], measType: '', points: 3 });
    const centralized = solutions.filter(s => s.mode === 'centralized');
    expect(centralized.length).toBe(1);
    expect(centralized[0].controller?.code).toBe('GC10');
    expect(centralized[0].controllerQty).toBe(1);
  });

  it('filters by ATEX', () => {
    const products = [
      makeProduct({ code: 'MIDI-CO2', gas: '["R744"]', atex: false }),
      makeProduct({ code: 'X5-CO2', type: 'sensor', family: 'X5 Direct Sensor Module', gas: '["R744"]', atex: true }),
    ];
    const designer = new SystemDesigner(products);
    const solutions = designer.generate({ gas: 'R744', atex: true, voltage: '', location: 'ambient', outputs: [], measType: '', points: 1 });
    expect(solutions.every(s => s.detector.atex === true)).toBe(true);
  });

  it('filters duct location — only MIDI remote', () => {
    const products = [
      makeProduct({ code: 'MIDI-INT', gas: '["R744"]', variant: 'CO2 Integrated' }),
      makeProduct({ code: 'MIDI-REM', gas: '["R744"]', variant: 'CO2 Remote' }),
    ];
    const designer = new SystemDesigner(products);
    const solutions = designer.generate({ gas: 'R744', atex: false, voltage: '', location: 'duct', outputs: [], measType: '', points: 1 });
    expect(solutions.every(s => s.detector.code === 'MIDI-REM')).toBe(true);
  });

  it('applies application filter on product families', () => {
    const products = [
      makeProduct({ code: 'MIDI-CO2', gas: '["R744"]', family: 'GLACIAR MIDI', apps: '["supermarket"]' }),
      makeProduct({ code: 'RM-HFC', gas: '["R32"]', family: 'GLACIAR RM', apps: '["hotel"]' }),
    ];
    const designer = new SystemDesigner(products);
    const solutions = designer.generate({ gas: 'R744', atex: false, voltage: '', location: 'ambient', outputs: [], measType: '', points: 1, application: 'supermarket' });
    expect(solutions.every(s => s.detector.family === 'GLACIAR MIDI')).toBe(true);
  });

  it('calculates X5 transmitter qty correctly', () => {
    const products = [
      makeProduct({ code: 'X5-CO2', type: 'sensor', family: 'X5 Direct Sensor Module', gas: '["R744"]', atex: true, standalone: false,
        compatibleWith: '["X5 Transmitter"]' }),
      makeProduct({ code: '3500-0001', type: 'controller', family: 'X5 Transmitter', name: 'GLACIAR X5 ATEX Transmitter',
        price: 822, tier: 'premium', productGroup: 'G', gas: '[]', refs: '[]', atex: true,
        connectionRules: JSON.stringify({ maxSensorModules: 2, beaconsPerTransmitter: 1, sirensPerTransmitter: 1 }),
        compatibleWith: '["X5 Direct Sensor Module", "X5 Remote Sensor"]' }),
    ];
    const designer = new SystemDesigner(products);
    const solutions = designer.generate({ gas: 'R744', atex: true, voltage: '', location: 'ambient', outputs: [], measType: '', points: 5 });
    const withCtrl = solutions.filter(s => s.controller);
    expect(withCtrl.length).toBeGreaterThan(0);
    // 5 sensors / 2 per transmitter = 3 transmitters
    expect(withCtrl[0].controllerQty).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/m2-engine/__tests__/designer.test.ts`
Expected: FAIL — `designer.ts` does not exist

- [ ] **Step 3: Implement SystemDesigner class**

Create `src/lib/m2-engine/designer.ts` — port the logic from `INPUTS/19-04-26/2026-04-19/engine.ts` but adapted to use Prisma's flat ProductV2 model instead of ResolvedProduct. Key adaptations:

1. Parse `gas`, `compatibleWith`, `connectionRules`, `ports` from JSON strings
2. Use `tier` field directly (not computed from sensor tech)
3. Filter by `application` if provided (check product's `apps` JSON array)
4. Generate 2×2 matrix by grouping solutions by tier + mode
5. Use `productGroup` for pricing compatibility
6. Handle GLACIAR MICRO as standalone-only detector

The class should expose:
- `generate(inputs: DesignerInputs): Solution[]`
- `getAvailableGases(): string[]`
- `getDetectorFamilies(): string[]`
- `filterDetectors(inputs: Partial<DesignerInputs>): ProductV2[]`

Core flow per the input engine.ts:
- Filter detectors/sensors by gas, ATEX, voltage, location, measType, application
- For each detector, find compatible controllers via parsed `compatibleWith`
- For each (detector, controller) pair, build BOM components
- Also generate standalone solution if detector has relay outputs
- Sort by total price

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/lib/m2-engine/__tests__/designer.test.ts`
Expected: All 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/m2-engine/designer.ts src/lib/m2-engine/__tests__/designer.test.ts
git commit -m "feat: implement SystemDesigner V2 engine with tests"
```

---

## Task 7: M2 Engine — Wire Designer into Selection Engine

**Files:**
- Modify: `src/lib/m2-engine/selection-engine.ts`
- Modify: `src/lib/m2-engine/types.ts`
- Modify: `src/lib/m2-engine/parse-product.ts`
- Delete: `src/lib/m2-engine/relation-types.ts`

- [ ] **Step 1: Update parse-product.ts for V2 fields**

Add parsing for new fields (variant, subType, status, ports, connectionRules, compatibleWith). Keep backward compat with existing flat fields.

- [ ] **Step 2: Update selection-engine.ts to delegate to SystemDesigner**

The public `selectProducts()` function should:
1. Build ProductV2 array from input products
2. Create SystemDesigner instance
3. Call `designer.generate()` with mapped inputs
4. Map Solutions back to the existing BOMResult format (for backward compat with pricing engine and UI)
5. Group into 2×2 matrix: premiumStandalone, premiumCentralized, ecoStandalone, ecoCentralized

Remove: `REF_TO_GAS` mapping, `APP_DEFAULTS` hardcoded families, `ALERT_ACCESSORIES` catalog, F0-F9 filter pipeline code, scoring code.

Keep: The public interface shape (SelectionInput → BOMResult) so downstream consumers don't break.

- [ ] **Step 3: Delete relation-types.ts**

```bash
rm src/lib/m2-engine/relation-types.ts
```

Update any imports in other files that referenced it.

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: Designer tests pass. Old tests may fail (expected — they'll be rewritten in Task 10).

- [ ] **Step 5: Commit**

```bash
git add src/lib/m2-engine/
git commit -m "refactor: wire SystemDesigner into selection-engine, remove legacy filters"
```

---

## Task 8: Update Pricing Engine & BOM Builder

**Files:**
- Modify: `src/lib/m2-engine/pricing-engine.ts`
- Modify: `src/lib/m2-engine/build-bom.ts`
- Modify: `src/lib/m2-engine/select-controller.ts`
- Modify: `src/lib/m2-engine/select-accessories.ts`

- [ ] **Step 1: Update pricing-engine.ts**

Add "sensor" and "alert" to any type checks. The pricing engine already works with code + price + productGroup, so minimal changes:
- In `p1_priceLookup`: no change needed (works by code)
- In type display labels: add sensor/alert cases

- [ ] **Step 2: Simplify select-controller.ts**

Remove legacy fallback (hardcoded SPU/MPU prices). The designer handles controller selection now. Keep only the public interface if still referenced by build-bom.

- [ ] **Step 3: Simplify select-accessories.ts**

Remove legacy hardcoded accessory catalogs. The designer handles accessory selection now.

- [ ] **Step 4: Update build-bom.ts**

Update to work with new Solution format from designer. Map BomComponent[] to BOMLine[] format expected by pricing engine.

- [ ] **Step 5: Run tests**

Run: `npx vitest run`

- [ ] **Step 6: Commit**

```bash
git add src/lib/m2-engine/
git commit -m "refactor: update pricing/bom/controller/accessories for V2 model"
```

---

## Task 9: API Routes — Handle New Fields

**Files:**
- Modify: `src/app/api/products/route.ts`
- Delete or gut: `src/app/api/product-relations/route.ts`

- [ ] **Step 1: Update GET /api/products**

Add new query params: `status`, `subType`, `compatibleWith`. Include new fields in response.

- [ ] **Step 2: Update POST/PUT /api/products**

Accept new fields (variant, subType, function, status, ports, connectionRules, compatibleWith) in request body.

- [ ] **Step 3: Gut product-relations API**

Replace with stub that returns empty array (backward compat) or delete entirely.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/
git commit -m "feat: update product API for V2 fields, remove product-relations API"
```

---

## Task 10: Rewrite M2 Engine Tests

**Files:**
- Modify: all files in `src/lib/m2-engine/__tests__/`

- [ ] **Step 1: Update test fixtures**

All test fixtures must use V2 product format with new fields (variant, subType, status, ports, connectionRules, compatibleWith, individual refrigerants in gas).

- [ ] **Step 2: Rewrite selection-engine tests**

Update `selection-engine.test.ts` and `selection-engine-full.test.ts` to:
- Use individual refrigerants (R744 instead of CO2 group)
- Use new family names (GLACIAR MIDI instead of MIDI)
- Test application filtering
- Test 2×2 matrix output
- Remove tests for REF_TO_GAS mapping, gas groups

- [ ] **Step 3: Rewrite integration tests**

Update `integration.test.ts` for end-to-end flow with new products.

- [ ] **Step 4: Delete relation-selection.test.ts**

```bash
rm src/lib/m2-engine/__tests__/relation-selection.test.ts
```

- [ ] **Step 5: Run full suite**

Run: `npx vitest run`
Expected: ALL tests pass

- [ ] **Step 6: Commit**

```bash
git add src/lib/m2-engine/__tests__/
git commit -m "test: rewrite M2 engine tests for V2 product model"
```

---

## Task 11: Admin Products Page — New Form Fields

**Files:**
- Modify: `src/app/admin/products/page.tsx`

- [ ] **Step 1: Add new fields to product interface and EMPTY_PRODUCT**

Add: variant, subType, function, status, ports, connectionRules, compatibleWith

- [ ] **Step 2: Add form sections**

Add to the edit form:
- **IDENTITY section**: variant (text), subType (dropdown), function (textarea)
- **STATUS**: status dropdown (active/discontinued/planned) — replaces discontinued checkbox
- **COMPATIBILITY**: compatibleWith (JSON tag editor or textarea)
- **ADVANCED**: ports (collapsible JSON editor), connectionRules (collapsible JSON editor)

- [ ] **Step 3: Update table columns**

Add variant and subType columns to the table for detectors/sensors. Show status badge (green=active, yellow=planned, red=discontinued).

- [ ] **Step 4: Update FAMILIES constant**

```typescript
const FAMILIES = ['GLACIAR MIDI', 'GLACIAR MICRO', 'GLACIAR RM', 'X5 Direct Sensor Module', 'X5 Remote Sensor', 'X5 Transmitter', 'GLACIAR Controller 10', 'MIDI Accessories', 'X5 Accessories', '1992-R-LP Siren', 'BE Flashing Light', 'FL Combined Flashing Light and Siren', 'SOCK-H-R High Socket Beacon', 'Power Adapter', 'Protection Bracket', 'RMV Backbox', 'UPS Battery Backup', 'Flow Regulator', 'Calibration Kit'] as const;
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/products/page.tsx
git commit -m "feat: add V2 fields to admin products form"
```

---

## Task 12: Admin Simulator M2 — Update for New Engine

**Files:**
- Modify: `src/app/admin/simulator-m2/page.tsx`

- [ ] **Step 1: Update input form**

- Replace gas group dropdown with individual refrigerant selector (fetch from /api/refrigerants-v5)
- Add application filter dropdown
- Keep: voltage, ATEX, location, points, output type selectors

- [ ] **Step 2: Update results display**

- Show solutions grouped by 2×2 matrix (Premium/Eco × Standalone/Centralized)
- Display connectionLabel for centralized solutions
- Show X5 Config A/B/C info
- Display alert quantities

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/simulator-m2/page.tsx
git commit -m "feat: update M2 simulator for V2 engine"
```

---

## Task 13: Admin Testlab M2 — Rewrite Test Scenarios

**Files:**
- Modify: `src/app/admin/testlab-m2/page.tsx`

- [ ] **Step 1: Rewrite test scenarios**

Replace all test scenarios with new ones using V2 products:

| # | Scenario | Gas | ATEX | Location | Points | Expected |
|---|---|---|---|---|---|---|
| 1 | Supermarket CO2 basic | R744 | No | ambient | 4 | MIDI IR CO2 standalone + centralized (GC10) |
| 2 | Machinery room NH3 | R717 | No | ambient | 6 | MIDI EC NH3 + X5 NH3 options |
| 3 | ATEX zone R32 | R32 | Yes | ambient | 2 | X5 Direct + X5 Remote only |
| 4 | Duct detection CO2 | R744 | No | duct | 3 | MIDI Remote CO2 only |
| 5 | Pipe detection NH3 | R717 | No | pipe | 2 | MIDI Remote NH3 only |
| 6 | Hotel comfort R32 | R32 | No | ambient | 1 | GLACIAR RM standalone |
| 7 | Heat pump R290 | R290 | No | ambient | 2 | MIDI SC R290 + MICRO R290 |
| 8 | 230V site adaptation | R744 | No | ambient | 5 | Includes power adapter |
| 9 | Large system 10 points | R744 | No | ambient | 10 | GC10 with 1 controller |
| 10 | Large system 15 points | R744 | No | ambient | 15 | GC10 with 2 controllers |
| 11 | X5 remote with GC10 | R717 | Yes | ambient | 8 | X5 Remote + Transmitter + GC10 |
| 12 | Planned product excluded | R134A | No | ambient | 1 | IR Group 7 (planned) excluded |

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/testlab-m2/page.tsx
git commit -m "feat: rewrite M2 testlab scenarios for V2 products"
```

---

## Task 14: Admin Engine M2 — Update Documentation

**Files:**
- Modify: `src/app/admin/engine-m2/page.tsx`

- [ ] **Step 1: Update engine documentation**

Replace the filter pipeline F0-F9 documentation with the new designer flow:
1. Gas filter → individual refrigerant matching
2. ATEX filter → product atex field
3. Voltage filter → from connectionRules
4. Location filter → ambient/duct/pipe logic
5. Application filter → product apps field
6. Compatible controllers → from compatibleWith field
7. Alert selection → from connectionRules (beaconsNeeded, sirensNeeded)
8. Adapter logic → from connectionRules (powerAdapterRequired, powerAdapterCapacity)
9. X5 Config A/B/C → from connectionRules.configurations
10. 2×2 matrix → tier × standalone/centralized

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/engine-m2/page.tsx
git commit -m "docs: update M2 engine documentation for V2 logic"
```

---

## Task 15: Selector & Configurator Components — Update Product Parsing

**Files:**
- Modify: `src/components/selector/SelectorWizard.tsx`
- Modify: `src/components/selector/StepAppGas.tsx`
- Modify: `src/components/selector/StepTieredBOM.tsx`
- Modify: `src/components/configurator/StepProducts.tsx`

- [ ] **Step 1: Update StepAppGas**

Replace gas group selector with individual refrigerant selector. Fetch refrigerants from API.

- [ ] **Step 2: Update SelectorWizard**

Update product fetching to pass new fields to the engine. Use `designer.generate()` instead of `selectProducts()`.

- [ ] **Step 3: Update StepTieredBOM**

Handle new Solution format. Display sensor type, connection label, X5 config info.

- [ ] **Step 4: Update StepProducts (configurator)**

Same product parsing updates as selector.

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: update selector and configurator for V2 product model"
```

---

## Task 16: Final Seed, Full Test, Verify

- [ ] **Step 1: Clean seed**

```bash
npx tsx prisma/seed.ts
```
Expected: 137 products, 12 applications, 55 discounts, 36 refrigerants

- [ ] **Step 2: Run full test suite**

```bash
npm test
```
Expected: ALL tests pass

- [ ] **Step 3: Start dev server and smoke test**

```bash
npm run dev
```
Verify in browser:
- `/admin/products` — 5 tabs, 137 products, correct photos
- `/admin/applications` — 12 apps with new family names and individual refrigerants
- `/admin/simulator-m2` — select R744, 4 points → get MIDI solutions
- `/admin/testlab-m2` — all scenarios pass
- `/admin/discount-matrix` — unchanged, still works

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: V2 product model migration complete — 137 products, 5 types, new M2 engine"
```

---

## Task 17: Update Project Memory

- [ ] **Step 1: Update project_saferef.md memory**

Record: V2 migration complete, 137 products (60 sensors, 28 detectors, 2 controllers, 9 alerts, 38 accessories), new SystemDesigner engine, compatibleWith replaces ProductRelation, individual refrigerants replace gas groups.
