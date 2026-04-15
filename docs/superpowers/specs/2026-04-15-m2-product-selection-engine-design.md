# M2 — Product Selection Engine & Selector

**Date:** 2026-04-15
**Status:** Approved

## Overview

M2 transforms regulatory calculation results (M1) into a commercial Bill of Materials (BOM) by selecting SAMON products from the 227-product catalog. It also serves as a standalone product selector for quick quoting without going through the full regulatory wizard.

## Architecture

A pure selection engine library (`/lib/m2-engine/`) with two UI entry points:

```
/lib/m2-engine/
  ├── select-detector.ts    — filters compatible detectors
  ├── select-controller.ts  — sizes controller to detector count
  ├── select-accessories.ts — essential + optional accessories
  ├── build-bom.ts          — orchestrates per-zone BOM
  ├── pricing.ts            — applies DiscountMatrix
  └── types.ts              — M2 interfaces

/app/selector/page.tsx                        — Standalone 4-step wizard
/components/configurator/StepProducts.tsx     — Step 5 post-M1 (pre-filled)
```

## Two Entry Points

### 1. Standalone Selector (`/selector`)

Public tool for installers, distributors, end-users. 4-step wizard:

| Step | Content | Data Collected |
|------|---------|----------------|
| **1. Application & Gas** | Application dropdown, refrigerant (filtered by app), preferred range/family | gasGroup, refs, family |
| **2. Technical** | Site voltage (12V/24V/230V), ATEX yes/no, mounting type, standalone vs controlled | voltage, atex, mount, standalone |
| **3. Zones & Quantities** | Add zones with name + detector count per zone | zones[{name, qty}] |
| **4. BOM / Quote** | Per-zone recap with detector + controller + accessories. Pricing. PDF download + send request. | — |

### 2. Post-M1 Step 5 (in existing wizard)

Same `StepProducts` component but **pre-filled** from M1 results:
- Gas, voltage, ATEX, mounting → from `gasAppData`
- Zones + detector count → from `calcResult.zoneResults[].recommendedDetectors`
- Client can adjust before validating

Button "Generate product quote →" appears at end of Step 4 (calc sheet).

## Selection Logic

### selectDetector(input) → Product[]

1. Filter `type === "detector"` + `discontinued === false`
2. Match `gas` field contains the refrigerant's gasGroup
3. Match `refs` field contains the exact refrigerant reference (R-290, R-744, etc.)
4. If ATEX required → `atex === true` only
5. If voltage constrained → match compatible voltage range
6. If preferred family set → prioritize (MIDI, X5, RM...)
7. Sort by: family match > price > standalone capability
8. Return ranked list (top = recommended, rest = alternatives)

### selectController(input) → Product | null

1. Filter `type === "controller"` + `channels >= totalDetectorCount`
2. Match voltage compatibility
3. Pick smallest sufficient controller (no oversizing)
4. If all detectors are standalone → controller is optional (return null but offer as option)

### selectAccessories(detector, mount, gasGroup) → { essential: Product[], optional: Product[] }

**Essential (pre-checked):**
- Mounting bracket matching mount type (wall/ceiling/pipe)
- Calibration gas matching gas group
- Cable (if controller-connected)

**Optional (filtered catalog):**
- Alert devices (sirens, flash lights)
- Power supplies
- Network gateways (Modbus/BACnet/Ethernet)
- Software (GasView)
- Spare sensors

Filter: `type === "accessory"` + `compatibleFamilies` includes detector family or "ALL"

### pricing(products, customerGroup) → PricedBOM

1. Lookup DiscountMatrix by `customerGroup × product.productGroup`
2. `netPrice = price × (1 - discount / 100)`
3. If no customerGroup → show gross price only, net column hidden
4. Customer groups: EDC, OEM, 1Fo-3Fo, 1Contractor-3Contractor, AKund, BKund, NO

## BOM Output Structure

Per zone:
- Detector: product ref, name, qty, unit price, line total
- Controller: product ref, name, qty (shared across zones), unit price
- Accessories: list with qty, unit price, line total

Totals:
- Subtotal per zone
- Grand total (gross)
- Grand total (net, if customerGroup provided)
- Discount percentage applied

## Pricing Visibility

| User State | Gross Price | Net Price | Discount % |
|------------|-------------|-----------|------------|
| Anonymous | Visible | Hidden | Hidden |
| With customerGroup (from Step 1 client data or manual input) | Visible | Visible | Visible |
| With discountCode | Visible | Visible | Visible |

## PDF Quote

SAMON-branded PDF with:
- Header: logo, date, quote reference, client info (if provided)
- Per zone: table with detector + controller + accessories + quantities + prices
- Footer: totals HT, validity period, SAMON contact info
- Generated client-side (same approach as existing calc sheet PDF)

## Data Flow

### Standalone Mode
```
User Input → selectDetector() → selectController() → selectAccessories()
                                                          ↓
                                              pricing() → BOM → PDF
```

### Post-M1 Mode
```
M1 calcResult → pre-fill gasGroup, voltage, ATEX, zones, qty
                    ↓
User adjusts → selectDetector() → selectController() → selectAccessories()
                                                            ↓
                                                pricing() → BOM → PDF
```

## Relationship to Existing Steps

| Step | Purpose | Type |
|------|---------|------|
| Step 1 — Client | Who | Administrative |
| Step 2 — Gas & Application | What environment | Regulatory input |
| Step 3 — Zones | Where & how much | Regulatory input |
| Step 4 — Calc Sheet | Why & how many (M1 output) | Regulatory document |
| **Step 5 — Products** | **What to buy & price (M2 output)** | **Commercial document** |

## API Requirements

Existing `/api/products` route already supports:
- `?type=detector&gas=CO2&family=MIDI&discontinued=false`

Additional query params needed:
- `?atex=true` — filter ATEX-certified only
- `?voltage=24V` — filter by voltage compatibility
- `?refs=R744` — filter by exact refrigerant reference
- `?subCategory=mounting` — filter accessories by sub-category
- `?compatibleFamily=MIDI` — filter accessories by compatible family

## Testing

Unit tests for each selection function:
- selectDetector: given R-744 + 24V + no ATEX → returns MIDI IR CO2 variants
- selectDetector: given R-717 + ATEX → returns X5 IONIC NH3 only
- selectController: given 4 detectors + 24V → returns MPU-4
- selectController: given 2 standalone detectors → returns null
- selectAccessories: given MIDI + wall → returns bracket + cal gas
- pricing: given EDC + group G product → applies 50% discount
- buildBOM: full integration test with multi-zone scenario
