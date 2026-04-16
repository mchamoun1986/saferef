# Product Catalog Migration (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate SAMON product catalog (MIDI, X5, RM, AQUIS, controllers, accessories) from DetectBuilder into DetectCalc with admin CRUD.

**Architecture:** Add Product + DiscountMatrix models to existing Prisma schema, copy seed data from DetectBuilder (filtered by family), create API route + admin page. Zero impact on M1 engine.

**Tech Stack:** Prisma 7.7, Next.js 16, React 19, Tailwind CSS, SQLite (libsql)

**Source:** `C:\1- Marwan\Claude\01_SAMON\03_web\2- DetectBuilder\prisma\seed-data\products.ts` (1390 lines, all product data)

---

### Task 1: Add Product + DiscountMatrix to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add Product model to schema.prisma**

Add after the existing CalcSheet model:

```prisma
model Product {
  id           String   @id @default(cuid())
  type         String                        // "detector", "controller", "accessory"
  family       String                        // "MIDI", "X5", "RM", "AQUIS", "Controller", "Accessory"
  name         String
  code         String   @unique
  price        Float    @default(0)
  image        String?
  specs        String   @default("{}")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  tier         String   @default("standard")
  productGroup String   @default("A")
  gas          String   @default("[]")
  refs         String   @default("[]")
  apps         String   @default("[]")
  range        String?
  sensorTech   String?
  sensorLife   String?
  power        Float?
  voltage      String?
  ip           String?
  tempMin      Float?
  tempMax      Float?
  relay        Int      @default(0)
  analog       String?
  modbus       Boolean  @default(false)
  standalone   Boolean  @default(true)
  atex         Boolean  @default(false)
  mount        String   @default("[]")
  remote       Boolean  @default(false)
  features     String?
  connectTo    String?
  discontinued Boolean  @default(false)
  channels     Int?
  maxPower     Float?
  powerDesc    String?
  relaySpec    String?
  analogType   String?
  modbusType   String?
  subCategory        String?
  compatibleFamilies String  @default("[]")
}

model DiscountMatrix {
  id            String @id @default(cuid())
  customerGroup String
  productGroup  String
  discountPct   Float
}
```

- [ ] **Step 2: Run migration**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx prisma migrate dev --name add_product_catalog 2>&1 | tail -5`
Expected: Migration applied successfully

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Product and DiscountMatrix models to schema"
```

---

### Task 2: Create seed data files

**Files:**
- Create: `prisma/seed-data/products.ts`
- Create: `prisma/seed-data/discount-matrix.ts`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Copy products seed from DetectBuilder**

Copy the entire file `C:\1- Marwan\Claude\01_SAMON\03_web\2- DetectBuilder\prisma\seed-data\products.ts` to `C:\1- Marwan\Claude\18- DetectCalc\prisma\seed-data\products.ts`.

Then filter the PRODUCTS array: keep only entries where:
- `family` is one of: `'MIDI'`, `'X5'`, `'RM'`, `'Aquis'`, `'Controller'`, `'Accessory'`
- OR `type` is `'controller'` or `'accessory'`

Remove entries where `family` is `'G'`, `'GXR'`, `'TR'`, `'MP'`, `'MPS'`, `'GEX'`.

- [ ] **Step 2: Copy discount matrix seed**

Copy `C:\1- Marwan\Claude\01_SAMON\03_web\2- DetectBuilder\prisma\seed-data\discount-matrix.ts` to `C:\1- Marwan\Claude\18- DetectCalc\prisma\seed-data\discount-matrix.ts` (exact copy, 68 lines).

- [ ] **Step 3: Update seed.ts to include products and discounts**

Read the existing `prisma/seed.ts`, then add product and discount seeding. The pattern should follow existing seed logic — upsert each product by code, upsert each discount row.

Add to seed.ts:

```typescript
import { PRODUCTS } from './seed-data/products';
import { DISCOUNT_MATRIX } from './seed-data/discount-matrix';

// ... existing seed code ...

// Seed Products
for (const p of PRODUCTS) {
  await prisma.product.upsert({
    where: { code: p.code },
    update: { ...p },
    create: { ...p },
  });
}
console.log(`Seeded ${PRODUCTS.length} products`);

// Seed Discount Matrix
for (const d of DISCOUNT_MATRIX) {
  await prisma.discountMatrix.create({ data: d });
}
console.log(`Seeded ${DISCOUNT_MATRIX.length} discount rows`);
```

- [ ] **Step 4: Run seed**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx prisma db seed 2>&1 | tail -10`
Expected: "Seeded X products" and "Seeded 55 discount rows"

- [ ] **Step 5: Commit**

```bash
git add prisma/seed-data/products.ts prisma/seed-data/discount-matrix.ts prisma/seed.ts
git commit -m "feat: add product and discount seed data (MIDI, X5, RM, AQUIS, controllers, accessories)"
```

---

### Task 3: Create API route `/api/products`

**Files:**
- Create: `src/app/api/products/route.ts`

- [ ] **Step 1: Create the API route**

Create `src/app/api/products/route.ts` following the pattern from `src/app/api/refrigerants-v5/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const family = url.searchParams.get('family');
  const gas = url.searchParams.get('gas');
  const search = url.searchParams.get('search');
  const discontinued = url.searchParams.get('discontinued');

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (family) where.family = family;
  if (discontinued === 'false') where.discontinued = false;

  let products = await db.product.findMany({
    where,
    orderBy: [{ family: 'asc' }, { code: 'asc' }],
  });

  // Filter by gas (JSON contains)
  if (gas) {
    products = products.filter(p => p.gas.includes(gas));
  }

  // Search by name or code
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const body = await req.json();
  const product = await db.product.create({ data: body });
  return NextResponse.json(product, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const product = await db.product.update({ where: { id }, data });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: successful build

- [ ] **Step 3: Commit**

```bash
git add src/app/api/products/route.ts
git commit -m "feat: add /api/products CRUD route"
```

---

### Task 4: Add Products link to admin nav

**Files:**
- Modify: `src/app/admin/nav.tsx`

- [ ] **Step 1: Add Products link after Space Types**

In the links array, add after the Space Types entry:

```typescript
{ href: '/admin/products', label: 'Products' },
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/nav.tsx
git commit -m "feat(admin): add Products link to nav"
```

---

### Task 5: Create admin products page

**Files:**
- Create: `src/app/admin/products/page.tsx`

- [ ] **Step 1: Create the admin products page**

Create `src/app/admin/products/page.tsx` — a full CRUD admin page following the pattern of `src/app/admin/gas/page.tsx` (list + edit modal). Key sections:

**Header:** "Products" with count + "Add Product" button

**Stats row:** Total products, detectors count, controllers count, accessories count, discontinued count

**Filters:**
- Type: all / detector / controller / accessory (buttons)
- Family: dropdown (MIDI, X5, RM, AQUIS, Controller, Accessory)
- Search: text input (by name or code)

**Table columns:** Code, Name, Family, Type, Tier, Gas (colored badges), Range, Voltage, Price (EUR), ATEX (badge), Actions

**Edit form** (modal or inline): organized by category tabs:
- Identity: code, name, type, family, tier, productGroup, price
- Detection: gas (checkboxes: CO2, HFC1, HFC2, NH3, R290, CO, NO2, O2), range, sensorTech, sensorLife
- Electrical: voltage, power, relay, analog, modbus
- Mechanical: mount (checkboxes: wall, ceiling, floor), ip, tempMin, tempMax, standalone, atex, remote
- Controller: channels, maxPower, connectTo
- Accessory: subCategory, compatibleFamilies
- Meta: features, image, discontinued

Use the same styling as existing admin pages: bg-[#16354B] headers, text-[#E63946] accents, white cards.

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: successful build, `/admin/products` listed

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/products/page.tsx
git commit -m "feat(admin): add products CRUD page with filters, edit modal"
```

---

### Task 6: Final verification + push

**Files:** None (testing only)

- [ ] **Step 1: Build and test**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx next build 2>&1 | tail -5 && npx vitest run 2>&1 | tail -5`
Expected: build OK, 39 tests pass (all existing tests unaffected)

- [ ] **Step 2: Verify products in browser**

1. Start dev server: `npx next dev -p 3000`
2. Navigate to `/admin/products`
3. Verify: products listed with correct data
4. Filter by type "detector" → only detectors shown
5. Filter by family "MIDI" → only MIDI shown
6. Search "4120" → matching products shown
7. Click Edit on a product → form opens with correct data
8. Verify API: `curl http://localhost:3000/api/products?type=detector&family=MIDI | jq length`

- [ ] **Step 3: Push**

```bash
git push origin master
```
