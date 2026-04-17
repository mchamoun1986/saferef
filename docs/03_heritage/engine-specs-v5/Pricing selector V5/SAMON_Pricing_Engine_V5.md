# SAMON DETECTBUILDER — PRICING ENGINE SPECIFICATION

**V5.0 — EUR-only, HT-only, no optional services (based on V3.0)**

Moteur 3: "How Much?"
Version 5.0 — April 2026
Based on SAMON Price List 2026 EUR Rev 2
Discount Matrix ENG 2022-11-28
CONFIDENTIAL

---

## 1. Executive Summary

The Pricing Engine (Moteur 3) is the final stage of the DetectBuilder pipeline. It receives flat Bills of Materials (BOMs) from Moteur 2 (Technical Selection) organized in three tiers (PREMIUM, STANDARD, CENTRALIZED), validates unit prices against the SAMON price database, applies the correct discount structure based on customer group, and produces a fully priced quote ready for client presentation.

**What it does NOT do:**

- Select products (Moteur 2 responsibility)
- Calculate detector quantities (Moteur 1 responsibility)
- Store prices inline — always looks up from database at runtime

---

## 2. Position in Pipeline

| Stage | Engine | Question | Output |
|-------|--------|----------|--------|
| 1 | Regulation Engine (Moteur 1) | How many detectors? | Zone requirements + thresholds |
| 2 | Technical Selection (Moteur 2) | Which products? | 3 tier BOMs (PREMIUM / STANDARD / CENTRALIZED) |
| 3 | Pricing Engine (Moteur 3) | How much? | Priced quote per tier + comparison |

---

## 3. Inputs

### 3.1 From Moteur 2 (per tier) **[UPDATED V5 — aligned with M2 F12 output]**

Three complete tier objects: PREMIUM, STANDARD, CENTRALIZED. Each tier is a flat BOM organized by category sections (not by zone):

| Section | Fields per item | Description |
|---------|----------------|-------------|
| `detectors[]` | code, name, qty, gas, range, price, sensorTech, sensorLife, ip, tempMin/Max | Selected detector(s) × total_detectors |
| `detector_specs` | power, voltage, relays, relaySpec, analog, analogType, modbus, modbusType, connectTo, features | Technical specs of the selected detector |
| `controller` \| null | code, name, qty, channels, maxPower, price, subtotal | Controller combo from F7 (null if standalone) |
| `controller_specs` \| null | voltage, powerToSensors, relayOutputs, ip, analogIn/Out, rs485, displayType, tempRange, mounting, cableMax, failsafe, features | Controller technical specs |
| `power_accessories[]` | code, name, qty, price, subtotal, reason | Power Adapter 4000-0002 (MIDI + 230V only) |
| `mounting_accessories[]` | code, name | KAP045/046, MSVK, Pipe Adapter, Pole Clamp |
| `alert_accessories[]` | code, name, qty, type, power, ip, price, subtotal | Alert devices + SOCK-H-R-230 if 230V |
| `service_tools[]` | code, name | Recommended tools (DT300, SA200, etc.) |
| `spare_sensors[]` | code, tech, sensorLife, stockingPlan | Recommended spares |
| `total_bom` | float (EUR) | Sum of all priced items — calculated by M2 with list prices |
| `solution_score` | int (0–21) | Quality/performance score from F12 (6 criteria) |
| `tier` | enum | `PREMIUM` \| `STANDARD` \| `CENTRALIZED` |

> **[V5 change]** M2 outputs a flat BOM per solution (category-based, not zone-based). M2 already includes list prices from the product database. M3 validates these prices against its own DB lookup (P1) as an audit safety net — if prices diverge, M3 flags a `PRICE_MISMATCH` warning but uses the DB price as authoritative.

> **Tier mapping:** M2 tier names → M3 quote labels:
> | M2 Tier | M3 Quote Label | Purpose |
> |---------|---------------|---------|
> | PREMIUM | Premium | Best technology |
> | STANDARD | Standard | Balanced — auto-recommended |
> | CENTRALIZED | Centralized | With controller (shown only if total_detectors > 1) |

### 3.2 From Price Database (runtime lookup)

The engine never embeds prices. Every price is fetched from the `product_prices` table at quote generation time. This ensures:

- Prices always reflect the current price list version
- A single source of truth (database, not code)
- Price list updates require zero code changes

### 3.3 From User / Sales Context

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `customer_group` | enum | NO (end user) | Discount group from SAMON matrix |
| `discount_code` | string | null | Override code for customer-specific pricing |
| `project_net_override` | boolean | false | Use Project Net (Group F) pricing |

> **V5 Removed:** `currency` (EUR only), `include_installation`, `include_commissioning` — these fields are no longer part of the engine inputs.

---

## 4. Product Group Classification

Every product in the SAMON catalogue belongs to a Product Group that determines which discount column applies. This is the foundational concept of the pricing engine.

### 4.1 Product Groups (from Price List 2026)

| Group | Contains | Examples |
|-------|----------|----------|
| A-product | Controllers, legacy detectors, monitoring units, UPS, alerts, service tools | MPU4C, SPU24, GS-Series, GR-Series, TR-Series, MP-Series, GEX, RM, UPS, beacons, sirens, DT300, LAN units |
| C-product | Portable gas detectors | SGT/MGT portable detectors, IR Link |
| D-product | Spare parts: sensors, test gas, calibration kits, accessories | SEN-Series, SEX-Series, test gas cans, flow regulators, MIDI accessories |
| F (N/A) | Free items / no-charge items | SA200 service tool, sensor protection caps |
| G-product | GLACIAR product line (MIDI, X5, Controller 10, MIDI sensors) | MIDI detectors, MIDI remote, X5 transmitter, X5 sensor modules, X5 IRR, MIDI sensor modules, Controller 10 |

### 4.2 Why Groups Matter

Each customer group has a different discount percentage per product group. The discount matrix is a 2D lookup: Customer Group (row) vs Product Group (column).

---

## 5. Discount Matrix

Based on the official SAMON Discount Matrix (2022-11-28). This is the core business logic of the pricing engine.

### 5.1 Discount Structure

| Customer Group | SAMON Code | Group A (%) | Group C (%) | Group D / Spare (%) | Group F | Group G (%) |
|---------------|------------|-------------|-------------|---------------------|---------|-------------|
| Central warehouse / EDC | EDC | 67 | 25 | 30 | Net 0 | 50 |
| OEM manufacturer | OEM | 65 | 25 | 30 | Net 0 | 50 |
| Global Large Distributor | 1 Fö | 60 | 25 | 30 | Net 0 | 50 |
| Distributor | 2 Fö | 56 | 25 | 30 | Net 0 | 50 |
| Small Distributor | 3 Fö | 50 | 25 | 25 | Net 0 | 30 |
| Global Contractor | 1 Contractor | 47.5 | 25 | 25 | Net 0 | 30 |
| Large Contractor | 2 Contractor | 45 | 25 | 25 | Net 0 | 30 |
| Contractor | 3 Contractor | 40 | 25 | 25 | Net 0 | 12.5 |
| Mid-size Contractor (A-customer) | A Kund | 30 | 10 | 20 | Net 0 | 12.5 |
| Small Contractor (B-customer) | B Kund | 20 | 0 | 10 | Net 0 | 12.5 |
| End customer / Other | NO | 0 | 0 | 0 | Net 0 | 0 |

### 5.2 Discount Formula

```
Net price = List price x (1 - line_discount_pct / 100)
```

**Example:** MIDI SC HFC (31-220-12), List price 403 EUR, Distributor (2 Fö, Group G = 50%):
```
Net = 403 x (1 - 50/100) = 403 x 0.50 = 201.50 EUR
```

**Example:** MPU4C (20-300), List price 1,598 EUR, Contractor (3 Contractor, Group A = 40%):
```
Net = 1,598 x (1 - 40/100) = 1,598 x 0.60 = 958.80 EUR
```

### 5.3 Group F — Project Net

Group F is always Net 0 (no discount). This column is reserved for project-specific net pricing that must be registered or quoted per customer in the ERP (Mamut). The pricing engine flags items eligible for project net but does not auto-calculate — it requires manual override via `project_net_override`.

### 5.4 Customer-Specific Pricing

The discount matrix is a guideline. Deviations may occur per SAMON policy. Customer-specific prices override the matrix when a `discount_code` is provided. These must be pre-registered in the database.

---

## 6. Pricing Functions

### 6.1 P1 — BOM Price Lookup

**Purpose:** Resolve list price for every line item in the BOM.

| Input | Output | Logic |
|-------|--------|-------|
| `product_code` | `list_price_eur` | `SELECT unit_price_eur FROM product_prices WHERE code = product_code` |
| `product_code` | `product_group` | A, C, D, F, or G — determines discount column |
| `product_code` | `is_discontinued` | If true → BLOCK line, return warning |

**Rules:**

- If `product_code` not found in DB → BLOCK + flag `PRICE_NOT_FOUND`
- If `is_discontinued` = true → BLOCK + suggest replacement if available
- Always return `price_list_version` with the lookup for audit trail
- **[V5]** Cross-validate: compare M2's embedded `price` vs DB `list_price_eur`. If they differ → flag `PRICE_MISMATCH` warning. DB price is authoritative for quote calculation.

### 6.2 P2 — Discount Resolution

**Purpose:** Determine the applicable discount percentage for each line item.

**Inputs:**

- `customer_group` (from user context)
- `product_group` (from P1 lookup)
- `discount_code` (optional override)

**Logic:**

- If `discount_code` is provided → look up customer-specific rate in DB
- Else → look up `discount_matrix[customer_group][product_group]`
- If `product_group` = F → discount = 0% (always net)
- Return `line_discount_pct`

**Pseudocode:**

```
function resolveDiscount(customer_group, product_group, discount_code):
  if discount_code:
    rate = db.customer_specific_rates.find(discount_code, product_group)
    if rate: return rate
  return DISCOUNT_MATRIX[customer_group][product_group]
```

### 6.3 P3 — Line Item Calculation

**Purpose:** Compute net price per BOM line.

**Formula:**

```
line_total_eur         = list_price_eur x line_quantity
line_discount_amount   = line_total_eur x (line_discount_pct / 100)
line_net_total_eur     = line_total_eur - line_discount_amount
```

**Output per line:**

| Field | Type | Description |
|-------|------|-------------|
| `line_number` | int | Sequential line number |
| `product_code` | string | SAMON order code |
| `line_product_name` | string | Product name from DB |
| `product_group` | enum | A, C, D, F, G |
| `line_quantity` | int | From Moteur 2 BOM |
| `list_price_eur` | float | Unit list price from DB |
| `line_total_eur` | float | list_price x line_quantity |
| `line_discount_pct` | float | From P2 |
| `line_discount_amount` | float | line_total_eur x line_discount_pct/100 |
| `line_net_total_eur` | float | line_total_eur - line_discount_amount |
| `line_category` | enum | `detector` \| `controller` \| `power` \| `alert` \| `mounting` \| `service` \| `spare` — from M2 BOM section |
| `line_m2_price` | float\|null | M2's embedded price — for cross-validation against DB |

### 6.4 P4 — Category Subtotals

**Purpose:** Group line items by category for the quote summary.

| Category | Includes | Typical Product Groups |
|----------|----------|----------------------|
| Detectors | MIDI, X5, RM, GS, GR, GXR, GK, GSR, TR, MP, GEX, SPLS kits | A + G |
| Controllers | MPU, SPU, LAN, Controller 10 | A + G |
| Alerts | Beacons, sirens, horn+siren combos | A |
| Accessories | Mounting kits, duct adapters, cable glands, brackets, UPS | A + D |
| Service Tools | DT300, SA200, calibration kits, flow regulators | A + D + F |
| Spare Sensors | SEN-Series, SEX-Series, MIDI sensor modules | D + G |
| Test Gas | Test gas cans (58L / 110L) | D |

**Subtotals:**

```
subtotal_equipment = SUM(Detectors + Controllers + Alerts + Accessories)
subtotal_services  = SUM(Service Tools + Spare Sensors + Test Gas)
subtotal_raw       = subtotal_equipment + subtotal_services
```

### ~~6.5 P5 — Optional Services~~ **[REMOVED IN V5]**

> Installation and commissioning services are no longer part of the pricing engine. These costs are handled externally (ERP / manual quote adjustment).

### ~~6.6 P6 — Currency Conversion~~ **[REMOVED IN V5]**

> The engine operates in EUR only. Multi-currency support has been removed. All amounts are in EUR.

### 6.5 P5 — Final Totals (HT)

**Purpose:** Compute the final HT (Hors Taxes) quote amounts per tier.

```
total_before_discount = SUM(all line_total_eur)
total_discount        = SUM(all line_discount_amount)
total_after_discount  = total_before_discount - total_discount
total_ht              = total_after_discount
```

> **V5 change:** VAT calculation removed. The engine outputs HT amounts only. VAT is applied downstream (invoice/ERP stage), not at quote level.

---

## 7. Tier Comparison Output

The pricing engine produces a side-by-side comparison of all three tiers. Each tier is a complete, standalone solution priced independently.

### 7.1 Tier Definitions **[UPDATED V5 — aligned with M2 F12 tiers]**

| M2 Tier | Quote Label | Selection Rule (from M2 F12) | Score Bonus | Purpose |
|---------|-------------|------------------------------|-------------|---------|
| PREMIUM | Premium | Best sensor tech + features. IR for CO2/HFC, Ionic/EC for NH3. Sorted by score desc. | +5 | Best technology |
| STANDARD | Standard | Mid-tier products. Sorted by total price asc, then score. | +3 | Balanced — auto-recommended |
| CENTRALIZED | Centralized | Non-standalone (MP, TR, GEX) + controller. Only if `total_detectors > 1`. Sorted by price asc. | +1 | Economic with controller |

### 7.2 Comparison Table Structure

The output comparison table compares the three tiers across these dimensions:

| Row | Description |
|-----|-------------|
| Detectors | Product family + quantity per tier |
| Controller | Controller model or standalone |
| Alerts | Built-in vs. external alert system |
| Connectivity | Relay / Modbus / Bluetooth / BMS |
| Technical Score | 0–21 from Moteur 2 (F12 scoring: 6 criteria) |
| Total HT | Net total after discount (EUR) |
| Savings vs Premium | % savings compared to Premium tier |

### 7.3 Recommendation Logic

The engine auto-recommends the Standard tier by default. The recommendation flag can be overridden by the user. The recommendation reason is auto-generated from the `solution_score` delta and key feature differences between tiers.

---

## 8. Output Schema

The pricing engine produces one JSON object per quote, containing all three priced tiers, the comparison table, and audit metadata.

### 8.1 Top-Level Structure

| Field | Type | Description |
|-------|------|-------------|
| `quote_ref` | string | Auto-generated reference (DET-YYYY-NNNN) |
| `quote_date` | date | Quote generation date |
| `quote_valid_until` | date | quote_date + 30 days |
| `price_list_version` | string | Locked at generation time (e.g., 2026-R2) |
| `client` | object | Name, type, customer_group, contact, discount_code |
| `project` | object | Name, refrigerant, charge_kg, zone count, total detectors |
| `tiers.premium` | TierObject | Fully priced BOM for PREMIUM tier |
| `tiers.standard` | TierObject | Fully priced BOM for STANDARD tier |
| `tiers.centralized` | TierObject | Fully priced BOM for CENTRALIZED tier (null if total_detectors ≤ 1) |
| `comparison` | object | Side-by-side table + recommendation |
| `metadata` | object | Engine versions, audit trail, generation timestamp |

### 8.2 TierObject Structure **[UPDATED V5 — aligned with M2]**

| Field | Type | Description |
|-------|------|-------------|
| `tier` | string | `PREMIUM` \| `STANDARD` \| `CENTRALIZED` — from M2 |
| `label` | string | Display name for quote (Premium / Standard / Centralized) |
| `solution_score` | int (0–21) | From M2 F12 scoring (6 criteria) |
| `m2_total_bom` | float | M2's calculated total (list prices) — for cross-validation |
| `bom_lines` | Array\<LineItem\> | All priced line items (from P3), organized by category |
| `bom_lines[].category` | enum | `detector` \| `controller` \| `power` \| `alert` \| `mounting` \| `service` \| `spare` |
| `summary.total_before_discount` | float | Sum of all DB list prices × qty (from P1 lookup) |
| `summary.total_discount` | float | Sum of all discount amounts |
| `summary.total_after_discount` | float | Net total after discount |
| `summary.total_ht` | float | **[V5]** Final total HT (= total_after_discount) |
| `summary.price_validation` | enum | `MATCH` \| `MISMATCH` — M2 total vs M3 DB lookup total |

> **V5 Removed:** `total_services`, `total_excl_vat`, `vat_rate_pct`, `vat_amount`, `total_incl_vat` — no longer in output.

---

## 9. Execution Pipeline

The pricing engine runs functions sequentially. Each function depends on the previous.

| Step | Function | Input | Output |
|------|----------|-------|--------|
| 1 | P1: BOM Price Lookup | Moteur 2 BOM (3 tiers) | List prices + product groups |
| 2 | P2: Discount Resolution | Customer group + product groups | Discount % per line |
| 3 | P3: Line Item Calculation | List prices + discounts + quantities | Net price per line |
| 4 | P4: Category Subtotals | All line items | Grouped subtotals |
| 5 | P5: Final Totals (HT) | All subtotals | Total HT per tier |
| 6 | Output: Quote Package | All P1–P5 results | Complete priced quote JSON |

> **V5 change:** P5 (Optional Services) and P6 (Currency Conversion) removed. P7 renamed to P5 and simplified (HT only, no VAT).

---

## 10. Business Rules & Constraints

| Rule | Detail |
|------|--------|
| Quote validity | 30 days from generation date |
| Price list lock | Quote locks the price list version at generation time — price changes after do not affect issued quotes |
| Group F handling | Always Net 0. Project-specific prices require manual ERP entry |
| Discontinued products | Blocked in P1. Moteur 2 should not select them, but P1 is the safety net |
| Minimum order | No minimum — single detector quotes are valid |
| Shipping | NOT included in engine — handled by ERP at order stage |
| Customer-specific pricing | Overrides matrix when `discount_code` is provided |
| Currency | **[V5]** EUR only — no multi-currency support |
| VAT | **[V5]** Not calculated — engine outputs HT only |
| Services | **[V5]** Not calculated — installation/commissioning handled externally |
| Rounding | All amounts rounded to 2 decimal places (EUR cents) |
| Auto-recommended items | Service tools + spares shown in separate section, included in total |

---

## 11. Edge Cases & Error Handling

| Scenario | Engine Behavior |
|----------|----------------|
| Product code not in price DB | BLOCK line → flag `PRICE_NOT_FOUND` → quote marked INCOMPLETE |
| Customer group not recognized | Default to NO (end user, 0% discount) |
| Discount code invalid/expired | Ignore code → fall back to matrix → add warning |
| All items in tier blocked | Tier marked UNAVAILABLE → show remaining tiers only |
| ~~Currency rate missing~~ | **[REMOVED V5]** EUR only |
| ~~VAT rate not configured~~ | **[REMOVED V5]** No VAT calculation |
| Moteur 2 sends empty tier | Skip tier → do not show in comparison |
| Price = 0 in DB (Group F items) | Include at 0 EUR → show as FREE in quote |
| M2 price ≠ DB price | Flag `PRICE_MISMATCH` warning → use DB price → log both values in trace |
| M2 sends CENTRALIZED tier but total_detectors ≤ 1 | Skip CENTRALIZED tier → show only PREMIUM + STANDARD |

---

## 12. Database Tables Required

The pricing engine reads from (never writes to) these tables:

| Table | Key Fields | Updated By | Frequency |
|-------|-----------|------------|-----------|
| `product_prices` | code, name, product_group, unit_price_eur, is_discontinued | Product Manager | Annually (Jan) |
| `discount_matrix` | customer_group, product_group, line_discount_pct | Sales Director | On policy change |
| `customer_overrides` | discount_code, customer_id, product_group, rate | Sales / ERP | Per customer |
| ~~`service_rates`~~ | ~~service_type, unit, rate_eur~~ | **[REMOVED V5]** | ~~Annually~~ |
| ~~`exchange_rates`~~ | ~~currency, rate_vs_eur, updated_at~~ | **[REMOVED V5]** | ~~Monthly~~ |
| ~~`vat_rates`~~ | ~~country_code, rate_pct~~ | **[REMOVED V5]** | ~~On legislative change~~ |

The engine writes to:

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `quotes` | ref, quote_date, client, project, selections, results, grand_total | Persist generated quotes |

---

## 13. Integration Points

| System | Direction | Data |
|--------|-----------|------|
| Moteur 2 output | IN | 3 tier BOMs with product codes + quantities |
| Price database (Prisma) | READ | Prices, groups, discount matrix |
| Quote table (Prisma) | WRITE | Generated quote record |
| PDF generator | OUT | Formatted quote document for client |
| UI (Next.js) | OUT | Tier comparison display in configurator |
| ERP (future) | EXPORT | Order data, BOM, pricing for fulfillment |

---

## 14. Release Checklist

Before the pricing engine can go live:

- [ ] Import full SAMON Price List 2026 EUR Rev 2 into `product_prices` table
- [ ] Import discount matrix into `discount_matrix` table
- [x] ~~Configure service rates~~ **[REMOVED V5]**
- [x] ~~Configure VAT rates~~ **[REMOVED V5]**
- [x] ~~Set initial exchange rates~~ **[REMOVED V5]**
- [ ] Validate: run 3 test quotes against manual Excel calculations
- [ ] Validate: edge cases (discontinued product, unknown code, empty tier)
- [ ] Connect to Moteur 2 output format and verify end-to-end pipeline

---

## 15. Variable Changes from V1

All variable renames applied in V2 to align with the unified `DATA_DICTIONARY_V5.md` canonical names:

| V1 Name | V2 Canonical Name | Context |
|---------|-------------------|---------|
| `date` | `quote_date` | Top-level quote field (§8.1) |
| `valid_until` | `quote_valid_until` | Top-level quote field (§8.1) |
| `tier` | `solution_tier` | TierObject identifier (§8.2) |
| `technical_score` | `solution_score` | TierObject quality score (§3.1, §8.2) |
| `bom[]` | `bom_lines` | TierObject line item array (§8.2) |
| `description` (line item) | `line_product_name` | P3 output per line (§6.3) |
| `quantity` (line item) | `line_quantity` | P3 output per line (§6.3) |
| `discount_pct` (line item) | `line_discount_pct` | P3 output per line (§6.3) |
| `discount_amt` / `discount_amount_eur` | `line_discount_amount` | P3 output per line (§6.3) |
| `net_line_total_eur` / `net_line_total` | `line_net_total_eur` | P3 output per line (§6.3) |
| `zone_id` (line item) | `line_zone_id` | P3 output per line (§6.3) |
| `discontinued` | `is_discontinued` | P1 lookup field (§6.1, §12) |

**No business logic, formulas, prices, percentages, or discount values were changed.**


---

## 16. Trace Integration **[NEW IN V3]**

All Pricing Engine execution steps produce TraceSteps as defined in `Trace_Engine_V5.md`. This section defines the mandatory trace points specific to Moteur 3.

### 16.1 Trace Points

Every pricing function (P1–P7), discount resolution, and total calculation emits a TraceStep. See `Trace_Engine_V5.md`, Section 6.3 for the complete list of M3 trace points (TR-M3-001 through TR-M3-010).

### 16.2 M3-Specific Trace Requirements

| Requirement | Detail |
|-------------|--------|
| Price lookup tracing | P1 emits a TraceStep per line item per tier showing product_code, list_price_eur, product_group, and is_discontinued status |
| Discount resolution tracing | P2 emits a TraceStep per line item showing customer_group, product_group, discount_source (MATRIX/OVERRIDE/PROJECT_NET), matrix cell, and resulting line_discount_pct |
| Line calculation tracing | P3 emits a TraceStep per line item showing the full calculation: list_price × quantity → line_total → discount → net |
| Category subtotals | P4 emits a TraceStep per tier showing items grouped by category and subtotals |
| ~~Service cost tracing~~ | **[REMOVED V5]** |
| ~~Currency conversion tracing~~ | **[REMOVED V5]** |
| Final totals tracing | P5 emits a TraceStep per tier showing: before_discount → discount → after_discount → total_ht |
| Blocked items | Any PRICE_NOT_FOUND or discontinued product emits a TraceStep with `decision: "BLOCK"` and warning/error |
| Price list version | The price_list_version used is recorded in the first P1 TraceStep |

### 16.3 Output Contract Extension

The M3 output (Section 8) is extended with the following field:

| Field | Type | Description |
|-------|------|-------------|
| `trace` | TraceResult\|null | **[NEW IN V3]** Full execution trace for M3. See Trace_Engine_V5.md |

### 16.4 Admin Simulator Support

The Admin Simulator (`Admin_Simulator_V5.md`) displays M3 results in Panel 3 (Pricing). All M3 output fields are displayed including:

- Side-by-side tier comparison table (Eco / Standard / Premium)
- Recommended tier with recommendation reason
- Per-tier expandable detail: full priced BOM, line-by-line discounts, subtotals, total HT
- Discount information: customer group, matrix cell, override if applicable
- Price list version locked at generation time

The comparison mode highlights price deltas when customer group or other pricing parameters change.

---

## Variable Changes from V2

**[NEW IN V3]** — All V3 additions. No V2 variables were renamed, removed, or modified.

| V3 Variable | Type | Section | Description |
|-------------|------|---------|-------------|
| `trace` (in quote output) | TraceResult\|null | §16.3 | Full M3 execution trace |

**No business logic, formulas, prices, percentages, or discount values were changed.**

---

## 17. Variable Changes from V3 → V5 **[NEW IN V5]**

Simplification: EUR-only, HT-only, no optional services.

| Change | V3 | V5 |
|--------|----|----|
| Currency | EUR, SEK, NOK, GBP | EUR only |
| VAT | Calculated per country | Removed — HT only |
| Installation/Commissioning | Optional toggles | Removed |
| P5 (Optional Services) | Active | Removed |
| P6 (Currency Conversion) | Active | Removed |
| P7 (Final Totals) | 7-step chain incl. VAT | Renamed P5: before_discount → discount → total_ht |
| `total_services` | float | Removed |
| `total_excl_vat` | float | Replaced by `total_ht` |
| `vat_rate_pct` | float | Removed |
| `vat_amount` | float | Removed |
| `total_incl_vat` | float | Removed |
| `currency` input | enum | Removed (EUR fixed) |
| `include_installation` input | boolean | Removed |
| `include_commissioning` input | boolean | Removed |
| DB `service_rates` | Required | Not needed |
| DB `exchange_rates` | Required | Not needed |
| DB `vat_rates` | Required | Not needed |

**Core pricing logic (P1–P4), discount matrix, and product groups are unchanged.**
