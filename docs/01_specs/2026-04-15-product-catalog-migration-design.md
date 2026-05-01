# Product Catalog Migration (Phase 1) — Design Spec

> **⚠️ SUPERSEDED** — This spec was superseded by the V2 product model migration (`docs/superpowers/plans/2026-04-19-product-model-v2-migration.md`).
> Key changes: `Product.gas` and `Product.apps` fields removed, 227→135 products, 5 product types (added sensor+alert), family names updated.
> Kept for historical reference only.

**Date**: 2026-04-15
**Status**: Superseded
**Source**: DetectBuilder (`01_SAMON/03_web/2- DetectBuilder`)
**Target**: DetectCalc (`18- DetectCalc`)

## Overview

Migrate the SAMON product catalog from DetectBuilder into DetectCalc. This is Phase 1 of the M2+M3 integration — DB schema, seed data, and admin CRUD only. No selection engine, no pricing engine, no wizard changes.

**What changes**: new Product table, new DiscountMatrix table, admin product management page
**What does NOT change**: M1 regulation engine, configurator wizard, calc sheets, simulator

## Scope

### Included
- Product model (40+ fields, exact copy from DetectBuilder)
- DiscountMatrix model (for future M3)
- Seed data: families MIDI, X5, RM, AQUIS + all controllers + all accessories
- Admin CRUD page `/admin/products`
- Admin nav link
- API route `/api/products` (GET, POST, PUT, DELETE)

### Excluded (v1)
- Families G, GXR, TR, MP (not migrated)
- Selection engine M2 (Phase 2)
- Pricing engine M3 (Phase 3)
- Wizard Step 5 Results (Phase 4)
- Public product page
- Quote system

## Database Schema

### New: Product model

Copy exact schema from DetectBuilder. Add to `prisma/schema.prisma`:

```prisma
model Product {
  id           String   @id @default(cuid())
  type         String                        // "detector", "controller", "accessory"
  family       String                        // "MIDI", "X5", "RM", "AQUIS", "3500", "ACC"
  name         String
  code         String   @unique
  price        Float    @default(0)
  image        String?
  specs        String   @default("{}")       // JSON: arbitrary spec data
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Classification
  tier         String   @default("standard") // "premium", "standard", "centralized"
  productGroup String   @default("A")        // discount group: "A", "B", "C"
  gas          String   @default("[]")       // JSON: ["CO2","HFC1","HFC2","NH3","R290"]
  refs         String   @default("[]")       // JSON: ["R744","R32","R717"]
  apps         String   @default("[]")       // JSON: ["supermarket","cold_room"]
  range        String?                       // "0-10000ppm", "0-5000ppm"
  sensorTech   String?                       // "IR", "EC", "CAT", "TC"
  sensorLife   String?                       // "15y", "5y"

  // Electrical
  power        Float?                        // watts
  voltage      String?                       // "12V", "24V", "230V"
  relay        Int      @default(0)          // number of relays
  analog       String?                       // "4-20mA", "0-10V"
  modbus       Boolean  @default(false)
  modbusType   String?                       // "RS485", "TCP"
  analogType   String?                       // output type detail

  // Mechanical
  ip           String?                       // "IP65", "IP54"
  tempMin      Float?                        // operating temp min °C
  tempMax      Float?                        // operating temp max °C
  mount        String   @default("[]")       // JSON: ["wall","ceiling","floor"]
  standalone   Boolean  @default(true)       // can work without controller
  atex         Boolean  @default(false)      // ATEX certified
  remote       Boolean  @default(false)      // remote sensor capability

  // Controller-specific
  channels     Int?                          // number of detector channels
  maxPower     Float?                        // max power output (W)
  powerDesc    String?                       // power description
  relaySpec    String?                       // relay specification detail
  connectTo    String?                       // compatible controller families

  // Metadata
  features     String?                       // free-text feature description
  discontinued Boolean  @default(false)

  // Accessory classification
  subCategory        String?                 // "alert", "service", "mounting", "power", "spare", "signage"
  compatibleFamilies String  @default("[]")  // JSON: ["MIDI","X5"] or ["ALL"]
}
```

### New: DiscountMatrix model

```prisma
model DiscountMatrix {
  id            String @id @default(cuid())
  customerGroup String                       // "end_user", "contractor", "distributor", "oem", "edc"
  productGroup  String                       // "A", "B", "C"
  discountPct   Float                        // 0-100
}
```

## Seed Data

### Source
Product data from DetectBuilder: `01_SAMON/03_web/2- DetectBuilder/prices_2026.json` + DB seed data.

### Filter criteria
- **Include** families: MIDI, X5, RM, AQUIS
- **Include** all products where type = "controller"
- **Include** all products where type = "accessory"
- **Exclude** families: G, GXR, TR, MP
- **Exclude** discontinued products (optional — keep them flagged)

### Seed file
Create `prisma/seed-data/products.ts` with the filtered product array.
Create `prisma/seed-data/discount-matrix.ts` with standard discount tiers.

### Migration
- Run `prisma migrate` to add the two new tables
- Run seed to populate

## API Route

### `/api/products` (route.ts)

**GET** — List products with optional filters
- `?type=detector` — filter by type
- `?family=MIDI` — filter by family
- `?gas=CO2` — filter by gas group (JSON contains)
- `?discontinued=false` — exclude discontinued
- `?search=xxx` — search by name or code

**POST** — Create product (admin only)
**PUT** — Update product (admin only)
**DELETE** — Delete product by id (admin only)

All mutation endpoints protected by `requireAdmin()`.

## Admin Page

### `/admin/products`

**Header**: "Products" with count + "Add Product" button

**Filters**: type (detector/controller/accessory), family dropdown, gas dropdown, search text

**Table columns**: Code, Name, Family, Type, Tier, Gas (badges), Range, Voltage, Price, ATEX, Discontinued, Actions (Edit/Delete)

**Edit modal/form**: all fields organized by category:
- Identity: code, name, type, family, tier, productGroup, price
- Detection: gas (multi-select), refs (multi-select), range, sensorTech, sensorLife
- Electrical: voltage, power, relay, analog, modbus
- Mechanical: mount (multi-select), ip, tempMin/Max, standalone, atex, remote
- Controller: channels, maxPower, connectTo
- Accessory: subCategory, compatibleFamilies
- Metadata: features, image, discontinued

**Stats row** (top): total products, by type (detector/controller/accessory), by family, discontinued count

### Admin nav
Add: `{ href: '/admin/products', label: 'Products' }` after Space Types.

## File Structure

```
prisma/
  schema.prisma                    — ADD Product + DiscountMatrix models
  seed-data/
    products.ts                    — NEW: filtered product data
    discount-matrix.ts             — NEW: discount tiers

src/app/
  admin/
    products/
      page.tsx                     — NEW: admin CRUD page
    nav.tsx                        — MODIFY: add Products link

  api/
    products/
      route.ts                     — NEW: GET/POST/PUT/DELETE
```

## What Does NOT Change

- `src/lib/engine/` — zero changes
- `src/lib/rules/` — zero changes
- `src/app/configurator/` — zero changes
- `src/components/configurator/` — zero changes
- `src/app/admin/simulator/` — zero changes
- `src/app/admin/calc-sheets/` — zero changes
- All 39 existing tests remain passing

## Success Criteria

1. `prisma migrate` succeeds, new tables created
2. Seed populates products (MIDI, X5, RM, AQUIS, controllers, accessories)
3. `/api/products` returns filtered product list
4. `/admin/products` shows product table with search/filter
5. Admin can create/edit/delete products
6. All 39 existing engine tests still pass
7. Build succeeds with no errors

## Future Phases

- **Phase 2**: M2 Selection Engine (`src/lib/selection/`) — pipeline F0-F12, tier construction
- **Phase 3**: M3 Pricing Engine (`src/lib/pricing/`) — discounts, quote generation
- **Phase 4**: Wizard Step 5 Results — 3 tier display, quote PDF, save to DB
