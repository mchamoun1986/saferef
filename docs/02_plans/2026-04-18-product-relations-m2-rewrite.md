# Product Relations & M2 Engine Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded M2 controller/accessory selection with a data-driven `ProductRelation` table, mark out-of-scope products as discontinued, and add an admin `/admin/compatibility` page to manage relations.

**Architecture:** New `ProductRelation` Prisma model stores typed relationships between products (detector→controller, detector→accessory). The M2 selection engine reads relations at runtime instead of parsing free-text `connectTo` fields or using hardcoded MPU/SPU combos. The 3-tier output format (Premium/Standard/Centralized) is preserved. A new admin page provides CRUD for managing relations.

**Tech Stack:** Next.js 16, Prisma/SQLite, React 19, Tailwind 4, Vitest

---

## Validated Compatibility Matrix (source of truth)

### Detectors → Controllers

| Detector | Standalone | X5 Transmitter (3500-0001, 2ch) | Controller 10 (6300-0001, 10ch) | LAN63/64 |
|---|---|---|---|---|
| MIDI (all) | Yes | — | Yes (optional) | — |
| X5 direct-mount | — | Yes (mandatory, 1:1 or 2:1) | — | — |
| X5 remote | — | Yes | Yes | — |
| RM | Yes | — | — | Yes (optional) |

### Accessories (Required, conditional)

| Accessory | For | Condition | Qty rule |
|---|---|---|---|
| Power Adapter 230V→24V (4000-0002) | MIDI | Site = 230V | ceil(n/5) — one adapter powers up to 5 |
| MIDI Pipe Adapter | MIDI | Mounting = pipe | 1 per detector |
| MIDI Duct Adapter | MIDI remote | Mounting = duct | 1 per detector |
| KAP045 or KAP046 | RM | Always (client chooses which) | 1 per detector |

### Alert accessories

| Rule | Qty |
|---|---|
| Standalone detector → siren/flash per detector | 1 per detector |
| With controller → siren/flash per controller | 1 per controller |
| ATEX zone + X5 → no external alert | 0 |

### Suggested accessories (nice-to-have)

| Accessory | Qty |
|---|---|
| LED Sign "Refrigerant Alarm" (6100-0002) | 1 per project |
| Calibration Kit X5 (3500-0094) | 1 per project |
| Calibration Gas (matching gas) | 1 per project |
| UPS | 1 per project |

### Out of scope (mark discontinued)

- MPU2C (20-310), MPU4C (20-300), MPU6C (20-305)
- SPU24 (20-350), SPU230 (20-355), SPLS24 (20-360), SPLS230 (20-365)
- UNIT kits (21-36xx series) — SPLS-based kits
- DT300 (60-300), SA200 (60-200)
- AQUIS 500 (35-210)

### Data fix

- Controller 10 (6300-0001): channels should be 10 (currently 64 in seed — incorrect)

---

## File Structure

```
prisma/
  schema.prisma                              — MODIFY: add ProductRelation model
  seed.ts                                    — MODIFY: import + seed relations
  seed-data/
    products.ts                              — MODIFY: mark discontinued, fix Controller 10 channels
    product-relations.ts                     — CREATE: all relation seed data

src/app/api/product-relations/
  route.ts                                   — CREATE: GET (list) + POST (create) + DELETE

src/app/admin/compatibility/
  page.tsx                                   — CREATE: admin UI for relations

src/lib/m2-engine/
  relation-types.ts                          — CREATE: ProductRelation types + query helpers
  selection-engine.ts                        — MODIFY: use relations for controller + BOM
  select-controller.ts                       — MODIFY: accept relations, filter by compatibility
  __tests__/
    selection-engine.test.ts                 — MODIFY: update test fixtures (remove MPU refs)
    select-controller.test.ts               — REWRITE: test against new controller set
```

---

### Task 1: Prisma Schema — Add ProductRelation Model

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add ProductRelation model to schema**

Add at the end of `prisma/schema.prisma`, before the closing:

```prisma
model ProductRelation {
  id          String   @id @default(cuid())
  fromCode    String                        // source product code (usually detector)
  toCode      String                        // target product code (controller/accessory)
  type        String                        // "requires_base", "compatible_controller", "required_accessory", "alert_device", "suggested_accessory"
  mandatory   Boolean  @default(false)      // must be included in BOM
  qtyRule     String   @default("per_detector") // "1:1", "per_detector", "per_controller", "per_project", "ceil_n_5"
  condition   String?                       // optional: "voltage:230V", "mount:duct", "mount:pipe", "atex:false"
  reason      String?                       // human-readable explanation
  priority    Int      @default(0)          // higher = suggest first
  createdAt   DateTime @default(now())

  @@unique([fromCode, toCode, type])
}
```

- [ ] **Step 2: Run migration**

```bash
cd 20_SAFEREF && npx prisma db push
```

Expected: Schema synced, no errors.

- [ ] **Step 3: Verify with prisma validate**

```bash
npx prisma validate
```

Expected: "The schema is valid."

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add ProductRelation model for M2 compatibility"
```

---

### Task 2: Mark Out-of-Scope Products Discontinued + Fix Controller 10

**Files:**
- Modify: `prisma/seed-data/products.ts`

- [ ] **Step 1: Fix Controller 10 channels from 64 to 10**

In `prisma/seed-data/products.ts`, find the GLACIAR Controller 10 line (~line 588):

```typescript
// BEFORE:
ctrl('SCU3600','GLACIAR Controller 10','6300-0001',64,999,'24V','IP20',2996,'premium','G',

// AFTER:
ctrl('SCU3600','GLACIAR Controller 10','6300-0001',10,999,'24V','IP20',2996,'premium','G',
```

- [ ] **Step 2: Mark MPU/SPU/SPLS as discontinued**

For each of these controllers, add `discontinued: true` by changing the call site. Find each `ctrl(...)` call for these codes and add a final override object. Since the `ctrl()` helper doesn't take `discontinued` directly, we need to set it in the seed loop after creation.

Add a `DISCONTINUED_CODES` constant at the top of the file:

```typescript
export const DISCONTINUED_CODES: string[] = [
  '20-310',   // MPU2C
  '20-300',   // MPU4C
  '20-305',   // MPU6C
  '20-350',   // SPU24
  '20-355',   // SPU230
  '20-360',   // SPLS24
  '20-365',   // SPLS230
  '21-3612',  // UNIT SPLS24-CO2-10000-KIT
  '21-3617',  // UNIT SPLS230-CO2-10000-KIT
  '21-3620',  // UNIT SPLS24-HFC-4000-KIT
  '21-3620-SE', // UNIT SPLS24-HFC-4000-KIT SELF SENSE
  '21-3625',  // UNIT SPLS230-HFC-4000-KIT
  '21-3625-SE', // UNIT SPLS230-HFC-4000-KIT SELF SENSE
  '21-3652',  // UNIT SPLS24-NH3-4000-KIT
  '21-3657',  // UNIT SPLS230-NH3-4000-KIT
  '60-300',   // DT300 Service Tool
  '60-200',   // SA200 Service Adapter
  '35-210',   // AQUIS 500 NH3 in water
];
```

- [ ] **Step 3: Update seed.ts to mark discontinued after upsert**

In `prisma/seed.ts`, after the product upsert loop, add:

```typescript
import { DISCONTINUED_CODES } from './seed-data/products';

// Mark out-of-scope products as discontinued
for (const code of DISCONTINUED_CODES) {
  await prisma.product.updateMany({
    where: { code },
    data: { discontinued: true },
  });
}
console.log(`Marked ${DISCONTINUED_CODES.length} products as discontinued`);
```

- [ ] **Step 4: Run seed and verify**

```bash
npx tsx prisma/seed.ts
```

Expected: "Marked 18 products as discontinued"

- [ ] **Step 5: Commit**

```bash
git add prisma/seed-data/products.ts prisma/seed.ts
git commit -m "feat: mark MPU/SPU/SPLS/UNIT/AQUIS/DT300/SA200 as discontinued, fix Controller 10 channels"
```

---

### Task 3: Create ProductRelation Seed Data

**Files:**
- Create: `prisma/seed-data/product-relations.ts`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Create the relations seed file**

Create `prisma/seed-data/product-relations.ts`:

```typescript
// product-relations.ts — All product compatibility relations
// Source: validated matrix 2026-04-18

export interface RelationSeed {
  fromCode: string;
  toCode: string;
  type: 'requires_base' | 'compatible_controller' | 'required_accessory' | 'alert_device' | 'suggested_accessory';
  mandatory: boolean;
  qtyRule: string;
  condition: string | null;
  reason: string;
  priority: number;
}

// Helper: generate relations for ALL MIDI detector codes
const MIDI_CODES = [
  '10-110', '10-111',   // MIDI CO2 IR integrated + remote
  '10-120', '10-121',   // MIDI CO2 IR Group 1 integrated + remote
  '10-130', '10-131',   // MIDI CO2 IR Group 2 integrated + remote
  '10-150',             // MIDI NH3 EC 500ppm
  '10-160',             // MIDI NH3 1000ppm
  '10-170',             // MIDI NH3 5000ppm
  '10-171',             // MIDI NH3 remote
  '10-180',             // MIDI R290 EC
  '10-181',             // MIDI R290 remote
  '10-190',             // MIDI NH3 100ppm
  '10-191',             // MIDI NH3 100ppm remote
  '10-195',             // MIDI NH3 5000ppm remote
];

// X5 direct-mount sensor codes
const X5_DIRECT_CODES = [
  '3500-0002', '3500-0003', '3500-0004', '3500-0005', '3500-0006',
  '3500-0007', '3500-0008', '3500-0009', '3500-0010', '3500-0011',
  '3500-0012', '3500-0013', '3500-0014', '3500-0015', '3500-0016',
  '3500-0017', '3500-0018', '3500-0019', '3500-0020', '3500-0021',
  '3500-0022', '3500-0023', '3500-0024', '3500-0025', '3500-0026',
  '3500-0027', '3500-0028', '3500-0029',
];

// X5 remote sensor codes
const X5_REMOTE_CODES = [
  '3500-0040', '3500-0041', '3500-0042', '3500-0043', '3500-0044',
  '3500-0045', '3500-0046', '3500-0047', '3500-0048', '3500-0049',
  '3500-0050', '3500-0051', '3500-0052', '3500-0053', '3500-0054',
  '3500-0055', '3500-0056', '3500-0057', '3500-0058', '3500-0059',
  '3500-0060', '3500-0061', '3500-0062', '3500-0063', '3500-0064',
  '3500-0065', '3500-0066',
];

// RM detector codes
const RM_CODES = ['32-220', '32-320'];

// Alert device codes
const ALERT_CODES = ['40-440', '40-442', '40-441']; // FL-RL-R, FL-OL, FL-BL

function rel(
  fromCode: string, toCode: string,
  type: RelationSeed['type'],
  mandatory: boolean, qtyRule: string,
  condition: string | null, reason: string, priority = 0,
): RelationSeed {
  return { fromCode, toCode, type, mandatory, qtyRule, condition, reason, priority };
}

export const PRODUCT_RELATIONS: RelationSeed[] = [
  // ══════════════════════════════════════════════════════════
  // MIDI → Controller 10 (optional)
  // ══════════════════════════════════════════════════════════
  ...MIDI_CODES.map(code =>
    rel(code, '6300-0001', 'compatible_controller', false, 'per_detector',
      null, 'MIDI can optionally connect to Controller 10 for centralized monitoring', 1)
  ),

  // ══════════════════════════════════════════════════════════
  // X5 direct-mount → X5 Transmitter (mandatory)
  // ══════════════════════════════════════════════════════════
  ...X5_DIRECT_CODES.map(code =>
    rel(code, '3500-0001', 'requires_base', true, '1:1',
      null, 'X5 direct-mount sensor must plug into X5 ATEX Transmitter', 10)
  ),

  // ══════════════════════════════════════════════════════════
  // X5 remote → X5 Transmitter OR Controller 10
  // ══════════════════════════════════════════════════════════
  ...X5_REMOTE_CODES.map(code =>
    rel(code, '3500-0001', 'requires_base', true, '1:1',
      null, 'X5 remote sensor can connect to X5 ATEX Transmitter', 10)
  ),
  ...X5_REMOTE_CODES.map(code =>
    rel(code, '6300-0001', 'compatible_controller', false, 'per_detector',
      null, 'X5 remote sensor can connect directly to Controller 10', 5)
  ),

  // ══════════════════════════════════════════════════════════
  // RM → LAN63/64 (optional)
  // ══════════════════════════════════════════════════════════
  ...RM_CODES.map(code =>
    rel(code, '81-100', 'compatible_controller', false, 'per_detector',
      null, 'RM can connect to LAN63-PKT for centralized monitoring', 1)
  ),
  ...RM_CODES.map(code =>
    rel(code, '81-200', 'compatible_controller', false, 'per_detector',
      null, 'RM can connect to LAN63/64-PKT for larger installations', 2)
  ),
  ...RM_CODES.map(code =>
    rel(code, '81-110', 'compatible_controller', false, 'per_detector',
      null, 'RM can connect to LAN63 Master (DIN rail)', 1)
  ),
  ...RM_CODES.map(code =>
    rel(code, '81-120', 'compatible_controller', false, 'per_detector',
      null, 'RM can connect to LAN64 Slave (DIN rail, with LAN63 master)', 0)
  ),

  // ══════════════════════════════════════════════════════════
  // REQUIRED ACCESSORIES (conditional)
  // ══════════════════════════════════════════════════════════

  // MIDI → Power Adapter 230V (condition: site=230V)
  ...MIDI_CODES.map(code =>
    rel(code, '4000-0002', 'required_accessory', true, 'ceil_n_5',
      'voltage:230V', 'Power Adapter 230V→24V — 1 per 5 MIDI detectors', 5)
  ),

  // MIDI → Pipe Adapter (condition: mount=pipe)
  ...MIDI_CODES.map(code =>
    rel(code, '10-050', 'required_accessory', true, 'per_detector',
      'mount:pipe', 'MIDI Pipe Adapter 1/2" for pipe-mounted installations', 3)
  ),

  // MIDI remote → Duct Adapter (condition: mount=duct)
  ...MIDI_CODES.filter(c => c.endsWith('1')).map(code =>
    rel(code, '10-060', 'required_accessory', true, 'per_detector',
      'mount:duct', 'MIDI Duct Adapter for duct-mounted installations', 3)
  ),

  // RM → KAP045 (always, client chooses)
  ...RM_CODES.map(code =>
    rel(code, '32-045', 'required_accessory', false, 'per_detector',
      null, 'KAP045 back-box for RM (option A)', 2)
  ),
  ...RM_CODES.map(code =>
    rel(code, '32-046', 'required_accessory', false, 'per_detector',
      null, 'KAP046 back-box for RM (option B)', 1)
  ),

  // ══════════════════════════════════════════════════════════
  // ALERT DEVICES
  // ══════════════════════════════════════════════════════════

  // All MIDI detectors → alert (standalone=per_detector, controller=per_controller)
  ...MIDI_CODES.flatMap(code =>
    ALERT_CODES.map((alertCode, i) =>
      rel(code, alertCode, 'alert_device', false, 'per_detector',
        null, 'EN378 requires audible+visual alarm', 3 - i)
    )
  ),

  // Controller 10 → alert (always needs external)
  ...ALERT_CODES.map((alertCode, i) =>
    rel('6300-0001', alertCode, 'alert_device', true, 'per_controller',
      null, 'Controller 10 has no built-in alert — external siren/flash required', 3 - i)
  ),

  // X5 transmitter → alert (optional, only if NOT ATEX zone)
  ...ALERT_CODES.map((alertCode, i) =>
    rel('3500-0001', alertCode, 'alert_device', false, 'per_controller',
      'atex:false', 'X5 Transmitter: optional external alert (NOT available in ATEX zones)', 3 - i)
  ),

  // LAN63/64 → alert
  ...ALERT_CODES.map((alertCode, i) =>
    rel('81-100', alertCode, 'alert_device', true, 'per_controller',
      null, 'LAN63 needs external alert', 3 - i)
  ),
  ...ALERT_CODES.map((alertCode, i) =>
    rel('81-200', alertCode, 'alert_device', true, 'per_controller',
      null, 'LAN63/64 needs external alert', 3 - i)
  ),

  // ══════════════════════════════════════════════════════════
  // SUGGESTED ACCESSORIES (nice-to-have)
  // ══════════════════════════════════════════════════════════

  // LED Sign — 1 per project, for all detector families
  ...[...MIDI_CODES, ...X5_DIRECT_CODES.slice(0, 1), ...X5_REMOTE_CODES.slice(0, 1), ...RM_CODES].map(code =>
    rel(code, '6100-0002', 'suggested_accessory', false, 'per_project',
      null, 'LED Sign "Refrigerant Alarm" — nice to have', 1)
  ),

  // Calibration Kit X5 — 1 per project
  ...[...X5_DIRECT_CODES.slice(0, 1), ...X5_REMOTE_CODES.slice(0, 1)].map(code =>
    rel(code, '3500-0094', 'suggested_accessory', false, 'per_project',
      null, 'X5 Calibration Kit — nice to have', 1)
  ),
];
```

**Note:** The exact product codes for MIDI Pipe Adapter (`10-050`), MIDI Duct Adapter (`10-060`), KAP045 (`32-045`), KAP046 (`32-046`) must be verified against the actual seed data. The implementing agent should grep for the real codes before seeding.

- [ ] **Step 2: Import and seed relations in seed.ts**

Add to `prisma/seed.ts` after the product seeding block:

```typescript
import { PRODUCT_RELATIONS } from './seed-data/product-relations';

// Seed product relations
for (const rel of PRODUCT_RELATIONS) {
  await prisma.productRelation.upsert({
    where: {
      fromCode_toCode_type: {
        fromCode: rel.fromCode,
        toCode: rel.toCode,
        type: rel.type,
      },
    },
    update: {
      mandatory: rel.mandatory,
      qtyRule: rel.qtyRule,
      condition: rel.condition,
      reason: rel.reason,
      priority: rel.priority,
    },
    create: rel,
  });
}
console.log(`Seeded ${PRODUCT_RELATIONS.length} product relations`);
```

- [ ] **Step 3: Run seed**

```bash
npx tsx prisma/seed.ts
```

Expected: "Seeded N product relations" with no errors.

- [ ] **Step 4: Verify relations in DB**

```bash
npx tsx -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.productRelation.count().then(c => { console.log('Relations:', c); p.\$disconnect(); })"
```

Expected: Relations count > 0.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed-data/product-relations.ts prisma/seed.ts
git commit -m "feat: seed ProductRelation compatibility data from validated matrix"
```

---

### Task 4: Create Relation Types + Query Helpers

**Files:**
- Create: `src/lib/m2-engine/relation-types.ts`

- [ ] **Step 1: Create the types and helpers file**

```typescript
// relation-types.ts — ProductRelation types and query utilities for M2 engine

export type RelationType =
  | 'requires_base'
  | 'compatible_controller'
  | 'required_accessory'
  | 'alert_device'
  | 'suggested_accessory';

export interface ProductRelation {
  id: string;
  fromCode: string;
  toCode: string;
  type: RelationType;
  mandatory: boolean;
  qtyRule: string;      // "1:1", "per_detector", "per_controller", "per_project", "ceil_n_5"
  condition: string | null;
  reason: string | null;
  priority: number;
}

/**
 * Check if a condition string matches the current context.
 * Condition format: "key:value" e.g. "voltage:230V", "mount:duct", "atex:false"
 * null condition = always applies.
 */
export function conditionMatches(
  condition: string | null,
  context: { voltage?: string; mount?: string; atex?: boolean },
): boolean {
  if (!condition) return true;
  const [key, value] = condition.split(':');
  switch (key) {
    case 'voltage': return context.voltage === value;
    case 'mount': return context.mount === value;
    case 'atex': return String(context.atex ?? false) === value;
    default: return true;
  }
}

/**
 * Calculate quantity based on qtyRule.
 */
export function calculateQty(
  qtyRule: string,
  counts: { detectors: number; controllers: number },
): number {
  switch (qtyRule) {
    case '1:1': return counts.detectors;
    case 'per_detector': return counts.detectors;
    case 'per_controller': return Math.max(1, counts.controllers);
    case 'per_project': return 1;
    case 'ceil_n_5': return Math.ceil(counts.detectors / 5);
    default: return 1;
  }
}

/**
 * Filter relations by type and fromCode.
 */
export function getRelationsFor(
  relations: ProductRelation[],
  fromCode: string,
  type: RelationType,
): ProductRelation[] {
  return relations
    .filter(r => r.fromCode === fromCode && r.type === type)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Get all compatible controller codes for a detector.
 * Includes both requires_base and compatible_controller.
 */
export function getCompatibleControllerCodes(
  relations: ProductRelation[],
  detectorCode: string,
): { baseCodes: string[]; controllerCodes: string[] } {
  const bases = relations
    .filter(r => r.fromCode === detectorCode && r.type === 'requires_base')
    .map(r => r.toCode);
  const controllers = relations
    .filter(r => r.fromCode === detectorCode && r.type === 'compatible_controller')
    .map(r => r.toCode);
  return { baseCodes: bases, controllerCodes: controllers };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/m2-engine/relation-types.ts
git commit -m "feat: add ProductRelation types and query helpers"
```

---

### Task 5: API Route for Product Relations

**Files:**
- Create: `src/app/api/product-relations/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// /api/product-relations — GET (list) + POST (create) + DELETE (remove)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromCode = searchParams.get('fromCode');
    const toCode = searchParams.get('toCode');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (fromCode) where.fromCode = fromCode;
    if (toCode) where.toCode = toCode;
    if (type) where.type = type;

    const relations = await prisma.productRelation.findMany({
      where,
      orderBy: [{ type: 'asc' }, { priority: 'desc' }, { fromCode: 'asc' }],
    });

    return NextResponse.json(relations);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireRole(request, 'admin');
  if (auth) return auth;

  try {
    const body = await request.json();
    const { fromCode, toCode, type, mandatory, qtyRule, condition, reason, priority } = body;

    if (!fromCode || !toCode || !type) {
      return NextResponse.json({ error: 'fromCode, toCode, type required' }, { status: 400 });
    }

    const relation = await prisma.productRelation.upsert({
      where: { fromCode_toCode_type: { fromCode, toCode, type } },
      update: { mandatory, qtyRule, condition, reason, priority },
      create: { fromCode, toCode, type, mandatory: mandatory ?? false, qtyRule: qtyRule ?? 'per_detector', condition, reason, priority: priority ?? 0 },
    });

    return NextResponse.json(relation, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireRole(request, 'admin');
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await prisma.productRelation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/product-relations/route.ts
git commit -m "feat: add /api/product-relations CRUD endpoint"
```

---

### Task 6: Rewrite M2 Engine — Controller Selection with Relations

**Files:**
- Modify: `src/lib/m2-engine/select-controller.ts`
- Modify: `src/lib/m2-engine/selection-engine.ts`

This is the core engine rewrite. The implementing agent must:

- [ ] **Step 1: Rewrite `select-controller.ts`**

Replace the current implementation with relation-aware logic:

```typescript
import type { ProductRecord } from './types';
import type { ProductRelation } from './relation-types';
import { getCompatibleControllerCodes } from './relation-types';

function ctrlVoltageOk(ctrlVoltage: string | null, siteVoltage: string): boolean {
  if (!ctrlVoltage) return false;
  const cv = ctrlVoltage.toLowerCase();
  if (siteVoltage === '230V') return cv.includes('230') || cv.includes('240') || cv.includes('100-240');
  if (siteVoltage === '24V') return cv.includes('24');
  if (siteVoltage === '12V') return cv.includes('12') || cv.includes('24');
  return false;
}

export interface ControllerSelection {
  base: ProductRecord | null;       // required base unit (e.g. X5 transmitter)
  baseQty: number;                  // how many base units needed
  controller: ProductRecord | null; // optional centralized controller
  controllerQty: number;
}

/**
 * Select controller(s) for a detector using ProductRelation data.
 * Returns base unit (if required) + optional centralized controller.
 */
export function selectControllerFromRelations(
  detector: ProductRecord,
  totalDetectors: number,
  siteVoltage: string,
  allControllers: ProductRecord[],
  relations: ProductRelation[],
): ControllerSelection {
  const { baseCodes, controllerCodes } = getCompatibleControllerCodes(relations, detector.code);

  let base: ProductRecord | null = null;
  let baseQty = 0;

  // Step 1: Find required base (e.g. X5 transmitter for X5 sensors)
  if (baseCodes.length > 0) {
    const baseProduct = allControllers.find(c => baseCodes.includes(c.code) && !c.discontinued);
    if (baseProduct) {
      base = baseProduct;
      // X5 transmitter has 2 channels — ceil(detectors / 2)
      const channels = baseProduct.channels ?? 1;
      baseQty = Math.ceil(totalDetectors / channels);
    }
  }

  // Step 2: Find compatible centralized controller (optional)
  let controller: ProductRecord | null = null;
  let controllerQty = 0;

  if (controllerCodes.length > 0) {
    const candidates = allControllers
      .filter(c => controllerCodes.includes(c.code) && !c.discontinued)
      .filter(c => ctrlVoltageOk(c.voltage, siteVoltage))
      .filter(c => c.channels !== null && c.channels >= totalDetectors)
      .sort((a, b) => {
        const chDiff = (a.channels ?? 0) - (b.channels ?? 0);
        if (chDiff !== 0) return chDiff;
        return a.price - b.price;
      });

    if (candidates.length > 0) {
      controller = candidates[0];
      controllerQty = 1;
    }
  }

  return { base, baseQty, controller, controllerQty };
}
```

- [ ] **Step 2: Update `selection-engine.ts`**

The implementing agent must modify `selection-engine.ts` to:

1. Accept `relations: ProductRelation[]` in `SelectionInput` (add to the type in `engine-types.ts`)
2. Replace `f7_cheapestControllerCombo()` calls with `selectControllerFromRelations()`
3. Update `buildTierBom()` to:
   - Add base unit (X5 transmitter) as a BOM line when required
   - Use `conditionMatches()` + `calculateQty()` for accessories
   - Apply alert rules: standalone → per_detector, controller → per_controller, ATEX+X5 → skip
   - Power adapter: use `ceil_n_5` rule instead of 1:1
4. Remove all hardcoded MPU/SPU/SPLS references
5. Remove `ALERT_ACCESSORIES` hardcoded catalog — use relations to find alert products
6. Remove `POWER_ADAPTER_PRICE` constant — use actual product price from DB

Key changes in `buildTierBom`:
- Query relations for `required_accessory` where condition matches context
- Query relations for `alert_device` — check if standalone or controller mode
- Query relations for `suggested_accessory` — add as optional BOM lines

The 3-tier output (Premium/Standard/Centralized) remains. The tier assignment logic stays the same.

- [ ] **Step 3: Run tests**

```bash
npm test
```

Fix any failures caused by the new function signatures.

- [ ] **Step 4: Commit**

```bash
git add src/lib/m2-engine/select-controller.ts src/lib/m2-engine/selection-engine.ts src/lib/engine-types.ts
git commit -m "feat: rewrite M2 controller selection + BOM to use ProductRelation"
```

---

### Task 7: Update Tests

**Files:**
- Modify: `src/lib/m2-engine/__tests__/select-controller.test.ts`
- Modify: `src/lib/m2-engine/__tests__/selection-engine.test.ts`

- [ ] **Step 1: Rewrite `select-controller.test.ts`**

Replace MPU-based test fixtures with the new controller set:

```typescript
import { describe, it, expect } from 'vitest';
import { selectControllerFromRelations } from '../select-controller';
import type { ProductRecord } from '../types';
import type { ProductRelation } from '../relation-types';

const midiDetector: ProductRecord = {
  id: 'det-1', type: 'detector', family: 'MIDI', name: 'MIDI-IR-CO2',
  code: '10-110', price: 500, gas: '["CO2"]', refs: '["R744"]', apps: '[]',
  range: '0-10000ppm', sensorTech: 'IR', voltage: '24V', atex: false,
  mount: '["wall"]', standalone: true, discontinued: false,
  channels: null, relay: 2, analog: 'selectable', modbus: true,
  productGroup: 'G', tier: 'standard', subCategory: null,
  compatibleFamilies: '[]', remote: false, sensorLife: '15y',
  power: 2, ip: 'IP54', tempMin: -40, tempMax: 50,
  maxPower: null, features: null, connectTo: null,
};

const controller10: ProductRecord = {
  id: 'ctrl-10', type: 'controller', family: 'Controller', name: 'GLACIAR Controller 10',
  code: '6300-0001', price: 2996, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '24V', atex: false,
  mount: '[]', standalone: false, discontinued: false,
  channels: 10, relay: 16, analog: null, modbus: true,
  productGroup: 'G', tier: 'premium', subCategory: null,
  compatibleFamilies: '[]', remote: false, sensorLife: null,
  power: null, ip: 'IP20', tempMin: null, tempMax: null,
  maxPower: null, features: null, connectTo: null,
};

const x5Transmitter: ProductRecord = {
  id: 'ctrl-x5', type: 'controller', family: 'X5', name: 'GLACIAR X5 ATEX Transmitter',
  code: '3500-0001', price: 822, gas: '[]', refs: '[]', apps: '[]',
  range: null, sensorTech: null, voltage: '18-32V', atex: true,
  mount: '[]', standalone: false, discontinued: false,
  channels: 2, relay: 3, analog: '4-20mA', modbus: false,
  productGroup: 'G', tier: 'premium', subCategory: null,
  compatibleFamilies: '[]', remote: false, sensorLife: null,
  power: null, ip: 'IP66', tempMin: -20, tempMax: 55,
  maxPower: null, features: null, connectTo: null,
};

const allControllers = [controller10, x5Transmitter];

const relations: ProductRelation[] = [
  { id: '1', fromCode: '10-110', toCode: '6300-0001', type: 'compatible_controller', mandatory: false, qtyRule: 'per_detector', condition: null, reason: '', priority: 1 },
];

describe('selectControllerFromRelations', () => {
  it('MIDI standalone → base=null, controller=Controller 10 (optional)', () => {
    const result = selectControllerFromRelations(midiDetector, 4, '24V', allControllers, relations);
    expect(result.base).toBeNull();
    expect(result.controller?.code).toBe('6300-0001');
  });

  it('MIDI with no relations → no controller', () => {
    const result = selectControllerFromRelations(midiDetector, 4, '24V', allControllers, []);
    expect(result.base).toBeNull();
    expect(result.controller).toBeNull();
  });

  it('returns null controller when detector count exceeds channels', () => {
    const result = selectControllerFromRelations(midiDetector, 15, '24V', allControllers, relations);
    expect(result.controller).toBeNull(); // Controller 10 has 10 channels, 15 > 10
  });
});
```

- [ ] **Step 2: Update `selection-engine.test.ts`**

Update test fixtures to remove MPU/SPU references. Replace controller test data with Controller 10, X5 Transmitter, and LAN63/64. Ensure all existing test scenarios still pass with the new controller set.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/m2-engine/__tests__/
git commit -m "test: update M2 tests for relation-based controller selection"
```

---

### Task 8: Admin Compatibility Page

**Files:**
- Create: `src/app/admin/compatibility/page.tsx`
- Modify: admin nav component (add link)

- [ ] **Step 1: Create the admin page**

Create `src/app/admin/compatibility/page.tsx` — a table-based CRUD page following the same pattern as `admin/products/page.tsx`:

- Fetch all relations from `/api/product-relations`
- Fetch all products from `/api/products` for code→name lookup
- Display table with columns: From (code+name), To (code+name), Type, Mandatory, Qty Rule, Condition, Reason
- Filter by type (dropdown), by fromCode family
- Add form: select fromCode (product picker), toCode (product picker), type, mandatory, qtyRule, condition, reason
- Delete button per row

The implementing agent should follow the exact UI patterns from `admin/products/page.tsx` (dark theme, table layout, modals).

- [ ] **Step 2: Add nav link**

Find the admin nav component and add a "Compatibility" link pointing to `/admin/compatibility`, placed after "Products" in the navigation.

- [ ] **Step 3: Test manually**

Open `http://localhost:3000/admin/compatibility` and verify:
- Relations are listed
- Can filter by type
- Can add a new relation
- Can delete a relation

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/compatibility/
git commit -m "feat: add /admin/compatibility page for managing product relations"
```

---

### Task 9: Final Integration Test + Cleanup

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Verify no new errors introduced.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: All routes compile.

- [ ] **Step 4: Manual smoke test**

1. Start dev server: `npm run dev`
2. Go to `/selector` — run through a MIDI CO2 selection → verify controller options
3. Go to `/selector` — run through an X5 selection → verify transmitter is auto-added
4. Go to `/admin/compatibility` — verify all relations visible
5. Go to `/admin/products` → verify MPU/SPU/SPLS show as discontinued

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete ProductRelation system — M2 engine uses data-driven compatibility"
```
