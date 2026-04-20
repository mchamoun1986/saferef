# SafeRef V2 — Comprehensive Qualification & Test Plan

**Date:** 2026-04-20
**Scope:** Post V2 migration — full qualification of database, APIs, engines, admin, user flows, pricing, UI/UX
**Product:** SafeRef SaaS — Gas Detection Product Selection & Sizing
**Stack:** Next.js 16 + React 19 + Prisma/SQLite + Tailwind 4 + Vitest

---

## Table of Contents

1. [Database & Data Integrity](#1-database--data-integrity)
2. [API Endpoints](#2-api-endpoints)
3. [Admin Pages (Functional Testing)](#3-admin-pages-functional-testing)
4. [User-Facing Pages (End-to-End Flows)](#4-user-facing-pages-end-to-end-flows)
5. [M2 Engine Logic (SystemDesigner)](#5-m2-engine-logic-systemdesigner)
6. [M1 Engine (Regulatory)](#6-m1-engine-regulatory)
7. [UI/UX Testing](#7-uiux-testing)
8. [Pricing & Quotes](#8-pricing--quotes)
9. [Known Issues & Risks](#9-known-issues--risks)
10. [Regression Risks](#10-regression-risks)

---

## 1. DATABASE & DATA INTEGRITY

### 1.1 Product Counts by Type

| Type | Expected Count |
|------|---------------|
| sensor | 61 |
| detector | 28 |
| controller | 2 |
| alert | 9 |
| accessory | 35 |
| **TOTAL** | **135** |

- [ ] **DB-001** — Run `SELECT type, COUNT(*) FROM Product GROUP BY type`. Expected: sensor=61, detector=28, controller=2, alert=9, accessory=35
- [ ] **DB-002** — Run `SELECT COUNT(*) FROM Product`. Expected: 135 total products
- [ ] **DB-003** — Verify no duplicate `code` values: `SELECT code, COUNT(*) as c FROM Product GROUP BY code HAVING c > 1` should return 0 rows

### 1.2 Product Counts by Status

- [ ] **DB-010** — Run `SELECT status, COUNT(*) FROM Product GROUP BY status`. Expected: active=135, planned=0 (all current products are active)
- [ ] **DB-011** — Verify no products with status 'discontinued' unless intentional
- [ ] **DB-012** — Verify all products with `status='active'` have `discontinued=false`

### 1.3 Product Counts by Tier

| Tier | Expected Count |
|------|---------------|
| premium | 79 |
| standard | 52 |
| economic | 4 |

- [ ] **DB-020** — Run `SELECT tier, COUNT(*) FROM Product GROUP BY tier`. Expected: premium=79, standard=52, economic=4
- [ ] **DB-021** — Verify all GLACIAR MIDI IR sensors have tier='premium'
- [ ] **DB-022** — Verify all GLACIAR MIDI SC/EC sensors have tier='standard'
- [ ] **DB-023** — Verify all GLACIAR MICRO products have tier='economic'
- [ ] **DB-024** — Verify all GLACIAR RM products have tier='economic'
- [ ] **DB-025** — Verify X5 IR sensors have tier='premium'
- [ ] **DB-026** — Verify GLACIAR Controller 10 has tier='premium'
- [ ] **DB-027** — Verify X5 Transmitter has tier='premium'

### 1.4 Product Counts by Group

| Group | Expected Count | Used For |
|-------|---------------|----------|
| A | 30 | Standard detectors/sensors |
| C | 44 | Alerts + accessories |
| D | 59 | Premium IR detectors/sensors |
| G | 2 | Controllers |

- [ ] **DB-030** — Run `SELECT productGroup, COUNT(*) FROM Product GROUP BY productGroup`. Expected: A=30, C=44, D=59, G=2
- [ ] **DB-031** — Verify all controllers have productGroup='G'
- [ ] **DB-032** — Verify all alerts have productGroup='C'
- [ ] **DB-033** — Verify all accessories have productGroup='C'
- [ ] **DB-034** — Verify premium IR sensors/detectors have productGroup='D'
- [ ] **DB-035** — Verify standard SC/EC sensors/detectors have productGroup='A'

### 1.5 Gas IDs Match RefrigerantV5

- [ ] **DB-040** — For every product with non-empty `gas` JSON, parse the array and verify each gas ID exists in RefrigerantV5 table
- [ ] **DB-041** — Run `SELECT COUNT(*) FROM RefrigerantV5`. Expected: 36 refrigerants (per seed-data, actually 47 entries including extended set)
- [ ] **DB-042** — Verify gas naming convention: R744 (not CO2), R717 (not NH3), R290 (not Propane), R32, R134A (uppercase A), R600A (uppercase A)
- [ ] **DB-043** — Verify no old gas group references remain (no "co2", "hfc1", "hfc2", "nh3" in product gas fields)

### 1.6 Product Images

- [ ] **DB-050** — Count products with `image IS NOT NULL`. Expected: ~108 products have images (27 have null)
- [ ] **DB-051** — For every product with a non-null `image`, verify the file exists in `public/assets/{image}`
- [ ] **DB-052** — Total files in `public/assets/`: currently 173 files — verify no orphaned images that reference nothing
- [ ] **DB-053** — Check major product families have images: GLACIAR MIDI, X5, GLACIAR RM, GLACIAR MICRO, Controller 10, X5 Transmitter
- [ ] **DB-054** — List all products with image=null and confirm they are acceptable (accessories, spare parts)

### 1.7 Application Data

- [ ] **DB-060** — Run `SELECT COUNT(*) FROM Application`. Expected: 12 applications
- [ ] **DB-061** — Verify all 12 application IDs: supermarket, cold_room, machinery_room, hotel, hospital, public_venue, data_center, heat_pump, marine, pharma_lab, food_processing, transport
- [ ] **DB-062** — For each application, parse `productFamilies` JSON and verify each family name matches an actual product family in the database
- [ ] **DB-063** — For each application, parse `suggestedGases` JSON and verify each gas ID exists in RefrigerantV5
- [ ] **DB-064** — Verify suggestedGases use individual refrigerant IDs (R744, R32...) not old gas group names (co2, hfc1...)
- [ ] **DB-065** — Verify productFamilies use V2 family names:

| Application | Expected productFamilies |
|---|---|
| supermarket | ["GLACIAR MIDI"] |
| cold_room | ["GLACIAR MIDI", "X5 Direct Sensor Module", "X5 Remote Sensor"] |
| machinery_room | ["X5 Direct Sensor Module", "X5 Remote Sensor", "GLACIAR MIDI"] |
| hotel | ["GLACIAR RM"] |
| hospital | ["GLACIAR RM", "GLACIAR MIDI"] |
| public_venue | ["X5 Direct Sensor Module", "X5 Remote Sensor", "GLACIAR MIDI"] |
| data_center | ["GLACIAR MIDI", "X5 Direct Sensor Module", "X5 Remote Sensor"] |
| heat_pump | ["GLACIAR MIDI", "GLACIAR MICRO"] |
| marine | ["X5 Direct Sensor Module", "X5 Remote Sensor", "GLACIAR MIDI"] |
| pharma_lab | ["GLACIAR MIDI", "GLACIAR RM"] |
| food_processing | ["X5 Direct Sensor Module", "X5 Remote Sensor", "GLACIAR MIDI"] |
| transport | ["GLACIAR MIDI"] |

### 1.8 Discount Matrix

- [ ] **DB-070** — Run `SELECT COUNT(*) FROM DiscountMatrix`. Expected: 55 rows
- [ ] **DB-071** — Verify 11 customer groups: EDC, OEM, 1Fo, 2Fo, 3Fo, 1Contractor, 2Contractor, 3Contractor, AKund, BKund, NO
- [ ] **DB-072** — Verify 5 product groups: A, C, D, F, G
- [ ] **DB-073** — Verify completeness: each customer group has exactly 5 rows (one per product group)
- [ ] **DB-074** — Verify group F always has 0% discount for all customer groups
- [ ] **DB-075** — Verify group NO has 0% for all product groups

### 1.9 ConnectionRules Populated

- [ ] **DB-080** — Verify GLACIAR Controller 10 has connectionRules with maxDetectors=10, beaconsNeeded, sirensNeeded, powersDetectors
- [ ] **DB-081** — Verify X5 Transmitter has connectionRules with maxSensorModules=2, beaconsPerTransmitter, sirensPerTransmitter
- [ ] **DB-082** — Verify GLACIAR MIDI detectors have connectionRules with connectionToController and/or powerAdapterCapacity
- [ ] **DB-083** — Verify X5 Transmitter has configurations object (A, B, C) in connectionRules
- [ ] **DB-084** — Verify alert products have connectionRules with triggerInputs and triggerSource

### 1.10 CompatibleWith Populated

- [ ] **DB-090** — Verify GLACIAR MIDI detectors have compatibleWith including "GLACIAR Controller 10"
- [ ] **DB-091** — Verify X5 sensors have compatibleWith including "X5 Transmitter"
- [ ] **DB-092** — Verify alert products have compatibleWith listing the families they support (GLACIAR MIDI, GLACIAR Controller 10, X5 Transmitter, etc.)
- [ ] **DB-093** — Verify power adapter accessories have compatibleWith listing the detector families they support
- [ ] **DB-094** — Verify all family names in compatibleWith JSON actually exist as product families in the database

### 1.11 No Orphaned Data

- [ ] **DB-100** — Verify no products reference a family that has zero members: `SELECT DISTINCT family FROM Product`
- [ ] **DB-101** — Verify no CalcSheet references a non-existent refrigerant
- [ ] **DB-102** — Verify no Quote references product codes that no longer exist in the catalog
- [ ] **DB-103** — Verify ProductRelation table is either deleted or empty (V2 migration removed it)

---

## 2. API ENDPOINTS

### 2.1 Products API — `/api/products`

- [ ] **API-001** — `GET /api/products` returns 200 with JSON array of 135 products
- [ ] **API-002** — `GET /api/products?type=detector` returns exactly 28 products
- [ ] **API-003** — `GET /api/products?type=sensor` returns exactly 61 products
- [ ] **API-004** — `GET /api/products?type=controller` returns exactly 2 products
- [ ] **API-005** — `GET /api/products?type=alert` returns exactly 9 products
- [ ] **API-006** — `GET /api/products?type=accessory` returns exactly 35 products
- [ ] **API-007** — `GET /api/products?family=GLACIAR MIDI` returns only MIDI products
- [ ] **API-008** — `GET /api/products?gas=R744` returns products that detect CO2
- [ ] **API-009** — `GET /api/products?atex=true` returns only ATEX-certified products (X5 family)
- [ ] **API-010** — `GET /api/products?search=MIDI` returns products matching "MIDI" in name or code
- [ ] **API-011** — `GET /api/products?status=active` returns active products only
- [ ] **API-012** — `GET /api/products?subType=gas_detector` returns only gas detectors
- [ ] **API-013** — `GET /api/products?compatibleFamily=GLACIAR MIDI` returns accessories compatible with MIDI
- [ ] **API-014** — Each product in response includes V2 fields: variant, subType, function, status, ports, connectionRules, compatibleWith
- [ ] **API-015** — `POST /api/products` with valid body returns 201 (requires admin auth)
- [ ] **API-016** — `POST /api/products` without code/name/type/family returns 400
- [ ] **API-017** — `PUT /api/products` with valid body updates product and returns 200
- [ ] **API-018** — `DELETE /api/products?id=xxx` deletes product (requires admin auth)
- [ ] **API-019** — All write operations (POST/PUT/DELETE) require authentication (return 401/403 without session)

### 2.2 Refrigerants API — `/api/refrigerants-v5`

- [ ] **API-020** — `GET /api/refrigerants-v5` returns 200 with all refrigerants
- [ ] **API-021** — Each refrigerant has: id, name, safetyClass, practicalLimit, lfl, vapourDensity, molecularMass, gasGroup
- [ ] **API-022** — Key gases present: R744, R717, R290, R32, R134A, R404A, R410A, R454B, R1234yf, R1234ze

### 2.3 Applications API — `/api/applications`

- [ ] **API-030** — `GET /api/applications` returns 200 with 12 applications
- [ ] **API-031** — Each application has: id, labelFr, labelEn, icon, productFamilies, suggestedGases
- [ ] **API-032** — productFamilies are V2 family names (GLACIAR MIDI, X5 Direct Sensor Module, etc.)
- [ ] **API-033** — suggestedGases are individual refrigerant IDs (R744, R32, etc.)

### 2.4 Discount Matrix API — `/api/discount-matrix`

- [ ] **API-040** — `GET /api/discount-matrix` returns 200 with 55 rows
- [ ] **API-041** — Each row has: customerGroup, productGroup, discountPct

### 2.5 Product Relations API — `/api/product-relations`

- [ ] **API-050** — `GET /api/product-relations` returns 200 with empty array `[]`
- [ ] **API-051** — `POST /api/product-relations` returns 410 with error message about V2 migration
- [ ] **API-052** — `DELETE /api/product-relations` returns 410

### 2.6 Other APIs

- [ ] **API-060** — `GET /api/calc-sheets` returns 200 with list of saved calc sheets
- [ ] **API-061** — `GET /api/quotes` returns 200 with list of quotes
- [ ] **API-062** — `GET /api/quotes/[id]` returns 200 with quote details for valid ID, 404 for invalid
- [ ] **API-063** — `GET /api/quote-pdf/[id]` returns PDF binary for valid quote ID
- [ ] **API-064** — `GET /api/gas-categories` returns 200 with gas categories
- [ ] **API-065** — `GET /api/space-types` returns 200 with space types
- [ ] **API-066** — `GET /api/session` returns current session info (role, user)
- [ ] **API-067** — `POST /api/login` with valid credentials returns 200 with session
- [ ] **API-068** — `POST /api/login` with invalid credentials returns 401
- [ ] **API-069** — `POST /api/logout` clears session
- [ ] **API-070** — `GET /api/admin-settings` returns admin settings
- [ ] **API-071** — `GET /api/architecture` returns architecture data

---

## 3. ADMIN PAGES (Functional Testing)

### 3.1 Admin Dashboard — `/admin`

- [ ] **ADM-001** — Page loads without error
- [ ] **ADM-002** — Shows navigation with all admin links
- [ ] **ADM-003** — Role-based nav filtering works (admin sees all, sales sees limited)

### 3.2 Admin Products — `/admin/products`

- [ ] **ADM-010** — Page loads, fetches all 135 products
- [ ] **ADM-011** — 5 tabs visible: sensor, detector, controller, alert, accessory
- [ ] **ADM-012** — Clicking each tab filters the product list correctly
- [ ] **ADM-013** — Search bar filters by name or code
- [ ] **ADM-014** — Product table shows: code, name, family, price, status, variant, subType
- [ ] **ADM-015** — Clicking a product opens edit form
- [ ] **ADM-016** — Edit form shows V2 fields: variant, subType, function, status, ports, connectionRules, compatibleWith
- [ ] **ADM-017** — Status dropdown shows: active, discontinued, planned
- [ ] **ADM-018** — Saving changes persists to database
- [ ] **ADM-019** — Creating a new product works (POST to API)
- [ ] **ADM-020** — Deleting a product works (DELETE to API)
- [ ] **ADM-021** — FAMILIES constant includes all V2 family names: GLACIAR MIDI, GLACIAR MICRO, GLACIAR RM, X5 Direct Sensor Module, X5 Remote Sensor, X5 Transmitter, GLACIAR Controller 10, etc.

### 3.3 Admin Applications — `/admin/applications`

- [ ] **ADM-030** — Page loads, shows 12 applications
- [ ] **ADM-031** — Each application shows labelEn, labelFr, icon
- [ ] **ADM-032** — productFamilies displayed use V2 family names
- [ ] **ADM-033** — suggestedGases displayed as individual refrigerant IDs (R744, R32...)
- [ ] **ADM-034** — Editing an application saves correctly

### 3.4 Admin Simulator M2 — `/admin/simulator-m2`

- [ ] **ADM-040** — Page loads without error
- [ ] **ADM-041** — Gas selector shows individual refrigerant IDs (R744, R717, R32, R290, etc.)
- [ ] **ADM-042** — 6 presets available: R744 Supermarket 4pt, R717 Machinery 6pt, R32 ATEX 2pt, R744 Duct 4pt, R32 Hotel 1pt, R290 Cold Room 4pt 230V
- [ ] **ADM-043** — Clicking a preset fills all input fields correctly
- [ ] **ADM-044** — Running simulation produces solutions (not empty)
- [ ] **ADM-045** — Solutions displayed with tier badge (premium/standard/economic)
- [ ] **ADM-046** — Solutions displayed with mode badge (standalone/centralized)
- [ ] **ADM-047** — Each solution shows detector, controller (if centralized), alerts, accessories
- [ ] **ADM-048** — Each solution shows total price, optional total
- [ ] **ADM-049** — Collapsible sections work (expand/collapse solution details)
- [ ] **ADM-050** — Voltage selector: 12V DC, 24V DC/AC, 230V AC
- [ ] **ADM-051** — Location selector: ambient, duct, pipe
- [ ] **ADM-052** — Measurement type selector: any, ppm, lel, vol
- [ ] **ADM-053** — Application filter dropdown populated from API
- [ ] **ADM-054** — ATEX toggle works
- [ ] **ADM-055** — Points slider/input works (1-20)

### 3.5 Admin TestLab M2 — `/admin/testlab-m2`

- [ ] **ADM-060** — Page loads without error
- [ ] **ADM-061** — Test scenarios listed with expected outcomes
- [ ] **ADM-062** — Clicking "Run All" executes all test scenarios
- [ ] **ADM-063** — R744 Supermarket scenario: returns MIDI IR CO2 solutions (standalone + centralized with GC10)
- [ ] **ADM-064** — R717 Machinery scenario: returns MIDI EC NH3 + X5 NH3 options
- [ ] **ADM-065** — R32 ATEX scenario: returns only X5 products (ATEX-certified)
- [ ] **ADM-066** — R744 Duct scenario: returns only MIDI Remote CO2 variants
- [ ] **ADM-067** — R32 Hotel scenario: returns GLACIAR RM standalone
- [ ] **ADM-068** — Each passing scenario shows green checkmark, failing shows red X with diff

### 3.6 Admin Engine M2 — `/admin/engine-m2`

- [ ] **ADM-070** — Page loads, shows engine documentation
- [ ] **ADM-071** — Documentation describes the new designer flow (not old F0-F9 pipeline)
- [ ] **ADM-072** — Documents gas filter, ATEX filter, voltage filter, location filter, application filter
- [ ] **ADM-073** — Documents compatible controllers via compatibleWith
- [ ] **ADM-074** — Documents alert selection from connectionRules
- [ ] **ADM-075** — Documents 2x2 matrix: tier x standalone/centralized

### 3.7 Admin Catalogue — `/admin/catalogue`

- [ ] **ADM-080** — Page loads, shows product cards with images (dark theme)
- [ ] **ADM-081** — Filter by type works (detector, sensor, controller, alert, accessory)
- [ ] **ADM-082** — Filter by family works
- [ ] **ADM-083** — Search by name/code works
- [ ] **ADM-084** — Product card shows: image, name, code, family, price, tier
- [ ] **ADM-085** — Clicking a card opens detail modal with full specs
- [ ] **ADM-086** — Detail modal shows V2 fields: variant, subType, function, status, connectionRules, compatibleWith
- [ ] **ADM-087** — Products with image=null show a placeholder
- [ ] **ADM-088** — Filter by gas/refrigerant works
- [ ] **ADM-089** — Filter by application works

### 3.8 Admin Discount Matrix — `/admin/discount-matrix`

- [ ] **ADM-090** — Page loads, shows 11x5 matrix grid
- [ ] **ADM-091** — Matrix is editable (click cell to change discount percentage)
- [ ] **ADM-092** — Saving changes persists to database
- [ ] **ADM-093** — Group F row shows all zeros and may be non-editable

### 3.9 Admin Calc Sheets — `/admin/calc-sheets`

- [ ] **ADM-100** — Page loads, lists saved calc sheets
- [ ] **ADM-101** — Each entry shows: ref, client name, regulation, status, date
- [ ] **ADM-102** — Clicking an entry shows full details (zones, results)

### 3.10 Admin Quotes — `/admin/quotes` and `/admin/quotes/[id]`

- [ ] **ADM-110** — List page loads, shows saved quotes
- [ ] **ADM-111** — Each entry shows: ref, client, status, total, date
- [ ] **ADM-112** — Detail page loads with full BOM, pricing, client info
- [ ] **ADM-113** — PDF generation link works (calls `/api/quote-pdf/[id]`)
- [ ] **ADM-114** — Quote status is displayed (draft, sent, accepted, rejected)

### 3.11 Other Admin Pages

- [ ] **ADM-120** — `/admin/gas` — Gas categories page loads, shows categories
- [ ] **ADM-121** — `/admin/space-types` — Space types page loads, shows types
- [ ] **ADM-122** — `/admin/engine` — M1 engine documentation page loads
- [ ] **ADM-123** — `/admin/simulator` — M1 simulator page loads and works
- [ ] **ADM-124** — `/admin/testlab` — M1 testlab page loads and runs tests
- [ ] **ADM-125** — `/admin/traceability` — Traceability page loads
- [ ] **ADM-126** — `/admin/architecture` — Architecture overview page loads
- [ ] **ADM-127** — `/admin/settings` — Settings page loads and is accessible to admin role

---

## 4. USER-FACING PAGES (End-to-End Flows)

### 4.1 Homepage — `/`

- [ ] **USR-001** — Page loads with SafeRef branding
- [ ] **USR-002** — Two CTAs visible: "Start Calculator" and "Start Selector"
- [ ] **USR-003** — Feature cards show: Multi-Regulation, 36 Refrigerants, Products, PDF Quotes
- [ ] **USR-004** — Language switcher works (EN, FR, SV, DE, ES)
- [ ] **USR-005** — Login link accessible (navigates to /login)
- [ ] **USR-006** — Footer displays correctly
- [ ] **USR-007** — i18n: all text changes when language is switched (verify at least EN and FR)

### 4.2 Calculator Flow — `/calculator` (6 Steps)

**Step 1: Client**
- [ ] **CAL-010** — Step 1 loads, shows client form
- [ ] **CAL-011** — Fields: firstName, lastName, company, email, phone, projectName, country
- [ ] **CAL-012** — Country dropdown has 21 options (FR, SE, UK, DE, ES, IT, NL, BE, CH, AT, NO, DK, FI, PL, CZ, PT, IE, GR, RO, HU, OTHER)
- [ ] **CAL-013** — Validation: required fields must be filled to proceed

**Step 2: Gas & Application**
- [ ] **CAL-020** — Step 2 loads, shows gas/application selectors
- [ ] **CAL-021** — Application selector shows 12 applications with icons
- [ ] **CAL-022** — Gas/refrigerant selector shows individual refrigerants from API (R744, R32, R717, R290, etc.)
- [ ] **CAL-023** — Selecting an application auto-suggests compatible gases
- [ ] **CAL-024** — Regulation selector available: EN378, ASHRAE 15, ISO 5149

**Step 3: Zones**
- [ ] **CAL-030** — Step 3 loads, allows adding multiple zones
- [ ] **CAL-031** — Each zone has: name, dimensions (L x W x H), charge (kg), ventilation info
- [ ] **CAL-032** — Zone plan visualization renders correctly
- [ ] **CAL-033** — At least 1 zone required to proceed

**Step 4: CalcSheet (M1 Results)**
- [ ] **CAL-040** — Step 4 shows M1 regulatory calculation results per zone
- [ ] **CAL-041** — Each zone shows: maximum allowable charge, detection required (yes/no), detector count, threshold PPM
- [ ] **CAL-042** — Regulation badge shows which norm was used
- [ ] **CAL-043** — Save as CalcSheet works (persists to DB)

**Step 5: Technical**
- [ ] **CAL-050** — Step 5 loads, shows technical inputs for M2 engine
- [ ] **CAL-051** — Voltage selector: 12V DC, 24V DC/AC, 230V AC
- [ ] **CAL-052** — ATEX toggle available
- [ ] **CAL-053** — Location selector: ambient, duct, pipe
- [ ] **CAL-054** — Measurement type selector if applicable

**Step 6: Products (M2 Results)**
- [ ] **CAL-060** — Step 6 shows product recommendations from SystemDesigner
- [ ] **CAL-061** — Solutions grouped by tier (premium/standard/economic) and mode (standalone/centralized)
- [ ] **CAL-062** — Each solution shows: detector, controller (if any), alerts, accessories, total price
- [ ] **CAL-063** — "Save as Quote" button available
- [ ] **CAL-064** — Quote save captures: client data, BOM, pricing, config
- [ ] **CAL-065** — Products from SystemDesigner.generate() are correctly displayed with V2 data

### 4.3 Selector Flow — `/selector` (5 Steps)

**Step 1: Client**
- [ ] **SEL-010** — Step 1 loads, shows client form with RGPD consent checkbox
- [ ] **SEL-011** — Fields: firstName, lastName, company, email, phone, projectName, country, rgpdConsent
- [ ] **SEL-012** — Must check RGPD consent to proceed

**Step 2: Application & Gas**
- [ ] **SEL-020** — Step 2 loads, shows application cards (12 apps with icons)
- [ ] **SEL-021** — Selecting an application shows its suggested gases
- [ ] **SEL-022** — Gas/refrigerant selector uses individual IDs (R744, R32...) not gas groups
- [ ] **SEL-023** — Application and gas selection stored in state

**Step 3: Technical**
- [ ] **SEL-030** — Step 3 loads, shows technical configuration
- [ ] **SEL-031** — Voltage selector: 12V DC, 24V DC/AC, 230V AC
- [ ] **SEL-032** — ATEX toggle
- [ ] **SEL-033** — Location selector: ambient, duct, pipe
- [ ] **SEL-034** — Output type selector (if available)
- [ ] **SEL-035** — Customer group selector for pricing

**Step 4: Zones**
- [ ] **SEL-040** — Step 4 loads, shows zone quantity input
- [ ] **SEL-041** — User can set number of detection points per zone
- [ ] **SEL-042** — Multiple zones supported

**Step 5: Products (Results)**
- [ ] **SEL-050** — Step 5 loads, shows product recommendations
- [ ] **SEL-051** — Solutions displayed using StepTieredBOM component
- [ ] **SEL-052** — Solutions sorted by price
- [ ] **SEL-053** — Tier badges: premium (red), standard (blue), economic (green)
- [ ] **SEL-054** — Mode labels: standalone / centralized
- [ ] **SEL-055** — Each solution shows BOM components with qty and prices
- [ ] **SEL-056** — Optional items (calibration kit, magnetic wand) shown in collapsible section
- [ ] **SEL-057** — Customer group discount applied when selected
- [ ] **SEL-058** — "Save as Quote" button works
- [ ] **SEL-059** — PDF download works from saved quote

### 4.4 Full End-to-End Scenarios

- [ ] **E2E-001** — Supermarket R744 4pt 24V: Client -> App=Supermarket -> Gas=R744 -> 24V/Ambient/4pt -> Solutions include MIDI IR CO2 standalone + centralized (GC10)
- [ ] **E2E-002** — Hotel R32 1pt 24V: Client -> App=Hotel -> Gas=R32 -> 24V/Ambient/1pt -> Solutions include GLACIAR RM standalone
- [ ] **E2E-003** — Machinery NH3 ATEX 6pt: Client -> App=Machinery Room -> Gas=R717 -> ATEX=true -> 24V/Ambient/6pt -> Solutions include X5 sensors only
- [ ] **E2E-004** — Cold room R744 duct 3pt: Client -> App=Cold Room -> Gas=R744 -> 24V/Duct/3pt -> Solutions include MIDI Remote CO2 only
- [ ] **E2E-005** — Heat pump R290 2pt 230V: Client -> App=Heat Pump -> Gas=R290 -> 230V/Ambient/2pt -> Solutions include MIDI SC R290 + power adapter

---

## 5. M2 ENGINE LOGIC (SystemDesigner)

### 5.1 Gas Filtering

- [ ] **M2-001** — R744 (CO2): Returns MIDI IR CO2 products (10000ppm, 5000ppm, 5% vol ranges)
- [ ] **M2-002** — R717 (NH3): Returns MIDI EC NH3 products (100ppm, 500ppm, 1000ppm) + X5 NH3 products
- [ ] **M2-003** — R32: Returns MIDI SC R32 products (%LFL range) + X5 R32 products
- [ ] **M2-004** — R290 (Propane): Returns MIDI SC R290 products (%LFL range) + MICRO-IR-R290
- [ ] **M2-005** — R134A: Returns products with R134A in their gas array
- [ ] **M2-006** — R410A: Returns products with R410A in their gas array
- [ ] **M2-007** — Gas not detected by any product: Returns empty solutions array
- [ ] **M2-008** — Only active products returned (planned/discontinued excluded)

### 5.2 ATEX Filtering

- [ ] **M2-010** — ATEX=false: Returns all detectors (ATEX and non-ATEX)
- [ ] **M2-011** — ATEX=true: Returns ONLY products with atex=true (X5 Direct Sensor Module, X5 Remote Sensor)
- [ ] **M2-012** — Non-ATEX families (GLACIAR MIDI, GLACIAR RM, GLACIAR MICRO) excluded when ATEX=true
- [ ] **M2-013** — X5 Transmitter (controller) is ATEX-certified and included in ATEX solutions

### 5.3 Location Filtering

- [ ] **M2-020** — Location=ambient: All matching detectors pass
- [ ] **M2-021** — Location=duct + GLACIAR MIDI: Only "Remote" variants pass (variant contains "Remote")
- [ ] **M2-022** — Location=pipe + GLACIAR MIDI: Only "Remote" variants pass
- [ ] **M2-023** — Location=duct: X5 Direct Sensor Module excluded (only Remote Sensor passes)
- [ ] **M2-024** — Location=duct: Duct adapter accessory (62-9041) included in MIDI solutions
- [ ] **M2-025** — Location=pipe: Pipe adapter accessory (62-9031) included in MIDI solutions
- [ ] **M2-026** — Location=duct + X5: Duct adapter (3500-0104) included for X5 Remote solutions
- [ ] **M2-027** — Location=pipe + X5: Pipe adapter (3500-0105) included for X5 Remote solutions

### 5.4 Voltage Filtering

- [ ] **M2-030** — Voltage=12V DC: Only products with "12" in their voltage field pass
- [ ] **M2-031** — Voltage=24V DC/AC: Products with "24" or "12-24" in voltage pass
- [ ] **M2-032** — Voltage=230V AC: All detectors pass (can work with adapter) — includes those with 230V, 24V, 12V in voltage
- [ ] **M2-033** — X5 sensors with no voltage: Always pass voltage filter (powered by transmitter)
- [ ] **M2-034** — Products with empty voltage and non-X5 family: Excluded

### 5.5 Standalone vs Centralized Logic

- [ ] **M2-040** — Detector with relay > 0 and standalone=true: Generates a standalone solution
- [ ] **M2-041** — Detector with compatibleWith listing a controller: Generates centralized solution
- [ ] **M2-042** — 1 detection point: No centralized solutions generated UNLESS sensor requires base (X5 sensor)
- [ ] **M2-043** — X5 sensor (standalone=false): Always generates centralized solution even with 1 point
- [ ] **M2-044** — GLACIAR MICRO (standalone=true): Only standalone solutions, no centralized

### 5.6 Alert Logic

- [ ] **M2-050** — FLRL combo (beacon+siren combo) preferred over separate beacon + siren
- [ ] **M2-051** — Standalone mode: alerts qty = 1 beacon + 1 siren per detection point
- [ ] **M2-052** — Centralized mode with GC10: beaconsNeeded and sirensNeeded from connectionRules (typically 1 each)
- [ ] **M2-053** — X5 Transmitter: beacons = transmitterCount * beaconsPerTransmitter, sirens = transmitterCount * sirensPerTransmitter
- [ ] **M2-054** — Alert compatibleWith checked against detector/controller families

### 5.7 SOCK-H-R-230 on 230V Sites

- [ ] **M2-060** — When voltage=230V AC and alerts are present: SOCK-H-R-230 (code 40-420) added to BOM
- [ ] **M2-061** — SOCK-H-R-230 qty = number of alert devices (beacons)
- [ ] **M2-062** — SOCK-H-R-230 NOT added when voltage is not 230V AC

### 5.8 Controller Quantity Calculation

- [ ] **M2-070** — GC10 with maxDetectors=10: 10 points -> 1 controller, 11 points -> 2 controllers, 20 points -> 2 controllers
- [ ] **M2-071** — X5 Transmitter with maxSensorModules=2: 2 sensors -> 1 transmitter, 3 sensors -> 2 transmitters, 5 sensors -> 3 transmitters
- [ ] **M2-072** — Points = 1 and X5 sensor: Still 1 transmitter (sensor requires base)

### 5.9 Power Adapter Logic

- [ ] **M2-080** — Voltage=230V AC + detector needs 24V: Power adapter added
- [ ] **M2-081** — Power adapter capacity from connectionRules (default 5): 5 detectors -> 1 adapter, 6 detectors -> 2 adapters
- [ ] **M2-082** — Controller powers detectors (powersDetectors=true in GC10 rules): No adapter needed in centralized mode
- [ ] **M2-083** — Voltage != 230V AC: No adapter needed
- [ ] **M2-084** — Adapter found via compatibleWith match on detector family

### 5.10 X5 Config A/B/C Accessories

- [ ] **M2-090** — Config A (Direct mount only, X5 Direct Sensor Module): No extra accessories (or minimal)
- [ ] **M2-091** — Config B (mixed Direct + Remote): Config B required accessories from connectionRules.configurations.B
- [ ] **M2-092** — Config C (Remote only, X5 Remote Sensor): Config C required accessories from connectionRules.configurations.C
- [ ] **M2-093** — Required accessories found by code match in product catalog
- [ ] **M2-094** — Each config accessory has reason field explaining why it's needed

### 5.11 Optional Accessories

- [ ] **M2-100** — Calibration kit: Added as optional if found for detector family
- [ ] **M2-101** — Magnetic wand: Added as optional if found for detector family
- [ ] **M2-102** — Protection cap: Added as optional (but NOT "delivery protection cap")
- [ ] **M2-103** — Optional items marked with optional=true in BOM
- [ ] **M2-104** — Optional items NOT counted in main total (counted in optionalTotal)

### 5.12 Connection Labels

- [ ] **M2-110** — GC10 centralized: Connection label from detector's connectionRules.connectionToController (e.g., "4-20mA")
- [ ] **M2-111** — X5 centralized: Connection label from sensor's connectionRules.connectionType (e.g., "Direct mount (Port A/B)")
- [ ] **M2-112** — Standalone: connectionLabel = null

### 5.13 Measurement Type Filtering

- [ ] **M2-120** — measType='ppm': Only products with 'ppm' in range pass
- [ ] **M2-121** — measType='lel': Only products with 'LFL' or 'LEL' in range pass
- [ ] **M2-122** — measType='vol': Only products with 'vol' or '% vol' in range pass
- [ ] **M2-123** — measType='' (empty): All products pass (no filter)

### 5.14 Application Filtering

- [ ] **M2-130** — application='supermarket': Only products with 'supermarket' in their apps JSON pass (or products with empty apps = universal)
- [ ] **M2-131** — Products with empty apps array: Treated as universal, pass all application filters
- [ ] **M2-132** — application='' (empty): No application filter applied

### 5.15 Specific Scenario Tests

| # | Scenario | Inputs | Expected Results |
|---|----------|--------|-----------------|
| 1 | **M2-S01** | R744, 4pt, 24V, ambient, no ATEX | MIDI IR CO2 standalone + centralized (GC10), multiple ranges |
| 2 | **M2-S02** | R717, 6pt, 24V, ambient, no ATEX | MIDI EC NH3 standalone + centralized, X5 NH3 centralized |
| 3 | **M2-S03** | R32, 2pt, 24V, ambient, ATEX | Only X5 Direct/Remote R32 + Transmitter |
| 4 | **M2-S04** | R744, 3pt, 24V, duct, no ATEX | Only MIDI Remote CO2 variants, duct adapter included |
| 5 | **M2-S05** | R717, 2pt, 24V, pipe, no ATEX | Only MIDI Remote NH3 variants, pipe adapter included |
| 6 | **M2-S06** | R32, 1pt, 24V, ambient, no ATEX | GLACIAR RM standalone (hotel), MIDI SC R32 standalone |
| 7 | **M2-S07** | R290, 2pt, 230V, ambient, no ATEX | MIDI SC R290 + power adapter, MICRO-IR-R290 standalone |
| 8 | **M2-S08** | R744, 10pt, 24V, ambient, no ATEX | GC10 with 1 controller (maxDetectors=10) |
| 9 | **M2-S09** | R744, 15pt, 24V, ambient, no ATEX | GC10 with 2 controllers (ceil(15/10)=2) |
| 10 | **M2-S10** | R744, 5pt, 24V, ambient, ATEX | X5 CO2 + 3 transmitters (ceil(5/2)=3) |
| 11 | **M2-S11** | R717, 3pt, 230V, ambient, no ATEX | MIDI NH3 + power adapter + SOCK-H-R-230 on 230V alerts |
| 12 | **M2-S12** | R404A, 2pt, 24V, ambient, no ATEX | Products supporting R404A in gas array |

- [ ] **M2-S01** through **M2-S12** — All 12 scenarios produce correct results

---

## 6. M1 ENGINE (Regulatory)

### 6.1 EN378 Calculations

- [ ] **M1-001** — EN378 maximum allowable charge calculation works for A1 refrigerant (R134A)
- [ ] **M1-002** — EN378 maximum allowable charge calculation works for A2L refrigerant (R32)
- [ ] **M1-003** — EN378 maximum allowable charge calculation works for A3 refrigerant (R290)
- [ ] **M1-004** — EN378 maximum allowable charge calculation works for B1 refrigerant (R717)
- [ ] **M1-005** — EN378 practical limit applied correctly per safety class
- [ ] **M1-006** — EN378 detection requirement: correctly determines when detection is needed
- [ ] **M1-007** — EN378 detector count calculation based on volume and placement rules
- [ ] **M1-008** — EN378 threshold PPM calculation from practical limit

### 6.2 ASHRAE 15 Calculations

- [ ] **M1-010** — ASHRAE 15 calculations produce valid results
- [ ] **M1-011** — ASHRAE 15 exemptions applied correctly
- [ ] **M1-012** — ASHRAE 15 differs from EN378 for same input (regulation-specific logic)

### 6.3 ISO 5149 Calculations

- [ ] **M1-020** — ISO 5149 calculations produce valid results
- [ ] **M1-021** — ISO 5149 results comparable to EN378 (they share the same base)

### 6.4 Multi-Regulation

- [ ] **M1-030** — Calculator supports switching between EN378, ASHRAE 15, ISO 5149
- [ ] **M1-031** — Different regulations produce different (or equivalent) results for same zone
- [ ] **M1-032** — Regulation name displayed on CalcSheet output

### 6.5 Existing Unit Tests

- [ ] **M1-040** — `npx vitest run src/lib/engine/__tests__/core.test.ts` — all pass
- [ ] **M1-041** — `npx vitest run src/lib/engine/__tests__/en378.test.ts` — all pass
- [ ] **M1-042** — `npx vitest run src/lib/engine/__tests__/ashrae15.test.ts` — all pass
- [ ] **M1-043** — `npx vitest run src/lib/engine/__tests__/iso5149.test.ts` — all pass

---

## 7. UI/UX TESTING

### 7.1 Language Switching

- [ ] **UI-001** — LanguageSwitcher component renders on homepage, selector, calculator
- [ ] **UI-002** — 5 languages supported: EN, FR, SV, DE, ES
- [ ] **UI-003** — Switching language updates all text on homepage (title, descriptions, buttons, footer)
- [ ] **UI-004** — Switching language updates selector step labels and form labels
- [ ] **UI-005** — Switching language updates StepTieredBOM labels (Product, Qty, Unit EUR, Discount, Net Total...)
- [ ] **UI-006** — Language persists across navigation (stored in context)
- [ ] **UI-007** — Admin pages not affected by language switch (admin is English-only)

### 7.2 Responsive Design

- [ ] **UI-010** — Homepage: renders correctly on mobile (375px), tablet (768px), desktop (1440px)
- [ ] **UI-011** — Selector wizard: steps are navigable on mobile
- [ ] **UI-012** — Calculator wizard: steps are navigable on mobile
- [ ] **UI-013** — Admin nav: collapses or scrolls on smaller screens
- [ ] **UI-014** — Admin products table: horizontal scroll on mobile
- [ ] **UI-015** — Admin catalogue cards: grid adjusts columns for screen width

### 7.3 Theme Consistency

- [ ] **UI-020** — Admin pages: dark theme (bg-[#0f1117], text-white, borders [#2a2e3d])
- [ ] **UI-021** — Catalogue page: dark theme consistent with other admin pages
- [ ] **UI-022** — Selector/Calculator: light theme (bg-white, text-[#16354B])
- [ ] **UI-023** — Homepage: light theme with SafeRef branding colors (#16354B navy, #E63946 red)
- [ ] **UI-024** — No theme bleeding: admin dark elements don't appear in public pages and vice versa

### 7.4 Loading States

- [ ] **UI-030** — Selector: shows loading spinner while fetching products/refrigerants
- [ ] **UI-031** — Admin products: shows loading state while fetching product list
- [ ] **UI-032** — Admin simulator: shows loading/running state during engine execution
- [ ] **UI-033** — Quote PDF: shows loading state during PDF generation

### 7.5 Error States

- [ ] **UI-040** — API failure on product fetch: shows error message (not blank page)
- [ ] **UI-041** — Login with wrong credentials: shows error message
- [ ] **UI-042** — Accessing admin without auth: redirects to login or shows forbidden page
- [ ] **UI-043** — Invalid quote ID: shows 404 or error message

### 7.6 Empty States

- [ ] **UI-050** — No matching products for exotic gas: shows "No compatible products found" message
- [ ] **UI-051** — Empty calc sheets list: shows empty state message
- [ ] **UI-052** — Empty quotes list: shows empty state message
- [ ] **UI-053** — Engine returns 0 solutions: shows informative message (not blank)

### 7.7 Navigation

- [ ] **UI-060** — Homepage -> Calculator: navigates correctly
- [ ] **UI-061** — Homepage -> Selector: navigates correctly
- [ ] **UI-062** — Admin nav links: all links navigate to correct pages
- [ ] **UI-063** — Admin back to homepage: link available
- [ ] **UI-064** — Login -> Admin: successful login redirects to admin dashboard
- [ ] **UI-065** — Logout: clears session and redirects to login
- [ ] **UI-066** — Browser back button works correctly in wizard flows
- [ ] **UI-067** — `/forbidden` page renders for unauthorized access

---

## 8. PRICING & QUOTES

### 8.1 Discount Matrix Application

- [ ] **PRC-001** — No customer group selected: Gross prices shown (0% discount)
- [ ] **PRC-002** — EDC group: 67% on A, 25% on C, 30% on D, 0% on F, 50% on G
- [ ] **PRC-003** — 1Contractor group: 47.5% on A, 25% on C, 25% on D, 0% on F, 30% on G
- [ ] **PRC-004** — BKund group: 20% on A, 0% on C, 10% on D, 0% on F, 12.5% on G
- [ ] **PRC-005** — Discount correctly applied to each line item based on its productGroup
- [ ] **PRC-006** — Net total = sum of (qty * listPrice * (1 - discount%)) for all items
- [ ] **PRC-007** — Products with price=0: shown as N/A, not included in total

### 8.2 Quote Generation

- [ ] **PRC-010** — Save quote from Selector: captures clientData, BOM, configJson, pricing
- [ ] **PRC-011** — Save quote from Calculator: captures same + zonesJson, regulation, calcSheetRef
- [ ] **PRC-012** — Quote ref auto-generated (unique)
- [ ] **PRC-013** — Quote saved to database with status="draft"
- [ ] **PRC-014** — Quote appears in `/admin/quotes` list

### 8.3 PDF Report Generation

- [ ] **PRC-020** — `/api/quote-pdf/[id]` generates valid PDF for existing quote
- [ ] **PRC-021** — PDF contains: client info, project name, BOM table with line items
- [ ] **PRC-022** — PDF contains: list prices, discounts, net totals per line
- [ ] **PRC-023** — PDF contains: grand total, customer group, currency (EUR)
- [ ] **PRC-024** — PDF contains: quote reference, date, validity period
- [ ] **PRC-025** — PDF renders correctly (no overlapping text, proper table formatting)

### 8.4 Price Calculations

- [ ] **PRC-030** — Detector subtotal = detector qty * detector unit price
- [ ] **PRC-031** — Controller subtotal = controller qty * controller unit price
- [ ] **PRC-032** — Alert subtotal = alert qty * alert unit price
- [ ] **PRC-033** — Accessory subtotal = accessory qty * accessory unit price
- [ ] **PRC-034** — Total = sum of all required component subtotals (excludes optional)
- [ ] **PRC-035** — Optional total = sum of all optional component subtotals
- [ ] **PRC-036** — hasNaPrice flag = true if any required component has price=0

---

## 9. KNOWN ISSUES & RISKS

### 9.1 Products with No Image

27 products have `image=null`. These are typically:

- [ ] **KI-001** — Verify all 27 null-image products are accessories/spare parts where image is acceptable to be missing
- [ ] **KI-002** — UI renders a placeholder for null images (not broken img tag)
- [ ] **KI-003** — Catalogue page handles null images gracefully

### 9.2 Products with No Price

- [ ] **KI-010** — Identify any products with price=0 (currently ~1 product). Expected: only planned products should have price=0
- [ ] **KI-011** — price=0 products show as "N/A" or "On request" in the UI
- [ ] **KI-012** — hasNaPrice flag correctly set when price=0 products are in BOM

### 9.3 Legacy Code Still Present

- [ ] **KI-020** — `selection-engine.ts`: Still contains old F0-F9 pipeline code (legacy `selectProducts()` function). Verify it's not called by any active consumer.
- [ ] **KI-021** — `relation-types.ts`: Still exists with old ProductRelation types. Verify it's only imported by selection-engine.ts (legacy path) and not by new code.
- [ ] **KI-022** — `select-controller.ts`: Contains legacy `selectControllerFromRelations()`. Verify new SystemDesigner handles controller selection independently.
- [ ] **KI-023** — `select-accessories.ts`: Contains legacy accessory selection. Verify new SystemDesigner handles accessories independently.
- [ ] **KI-024** — `select-detector.ts`: Contains legacy detector selection. Verify not used by active code paths.
- [ ] **KI-025** — Old test files still present: `relation-selection.test.ts`, `selection-engine.test.ts`, `selection-engine-full.test.ts`. Verify they still pass or are marked as legacy.

### 9.4 TypeScript Compilation

- [ ] **KI-030** — Run `npx tsc --noEmit` and verify 0 errors (or document known errors)
- [ ] **KI-031** — Run `npm run build` and verify it completes successfully
- [ ] **KI-032** — No unused imports in new V2 files (designer.ts, designer-types.ts)

### 9.5 Homepage Product Count

- [ ] **KI-040** — Homepage i18n text says "227 Products" in all languages — should be updated to reflect actual count (135 products)

---

## 10. REGRESSION RISKS

### 10.1 Old Quotes Compatibility

- [ ] **REG-001** — Existing saved quotes (if any) with old product codes: verify they still render correctly in `/admin/quotes/[id]`
- [ ] **REG-002** — Old quote BOM JSON may reference products that no longer exist. Quote detail page should handle missing products gracefully (show code even if product not found)
- [ ] **REG-003** — PDF generation for old quotes should not crash even if product codes are no longer in catalog

### 10.2 CalcSheet Compatibility

- [ ] **REG-010** — Existing saved CalcSheets: verify they still render in `/admin/calc-sheets`
- [ ] **REG-011** — CalcSheet `gasAppJson` may use old gas group names. Parser should handle both old and new formats.
- [ ] **REG-012** — CalcSheet `resultJson` structure unchanged by V2 migration (M1 engine not modified)

### 10.3 PDF Generation with New Product Data

- [ ] **REG-020** — New quotes with V2 products: PDF generates correctly with new product names/codes
- [ ] **REG-021** — New family names (GLACIAR MIDI, X5 Direct Sensor Module, etc.) fit in PDF table columns
- [ ] **REG-022** — Long product names don't overflow PDF layout

### 10.4 Selector/Configurator Product Parsing

- [ ] **REG-030** — `toProductV2()` helper in StepProducts.tsx correctly maps API response (ProductRecord) to engine type (ProductV2)
- [ ] **REG-031** — All V2 fields present in API response are mapped: variant, subType, function, status, ports, connectionRules, compatibleWith
- [ ] **REG-032** — Products fetched from `/api/products` include V2 fields in response

### 10.5 Old M2 Engine Tests

- [ ] **REG-040** — Run `npx vitest run src/lib/m2-engine/__tests__/designer.test.ts` — all pass
- [ ] **REG-041** — Run `npx vitest run src/lib/m2-engine/__tests__/pricing-engine.test.ts` — all pass
- [ ] **REG-042** — Run `npx vitest run src/lib/m2-engine/__tests__/parse-product.test.ts` — all pass
- [ ] **REG-043** — Run `npx vitest run src/lib/m2-engine/__tests__/pricing.test.ts` — all pass
- [ ] **REG-044** — Run `npx vitest run src/lib/m2-engine/__tests__/build-bom.test.ts` — status documented (may need update for V2)
- [ ] **REG-045** — Run `npx vitest run src/lib/m2-engine/__tests__/integration.test.ts` — status documented (may need update for V2)
- [ ] **REG-046** — Run `npx vitest run src/lib/m2-engine/__tests__/selection-engine.test.ts` — status documented (uses legacy engine, may fail)
- [ ] **REG-047** — Run `npx vitest run src/lib/m2-engine/__tests__/selection-engine-full.test.ts` — status documented
- [ ] **REG-048** — Run `npx vitest run src/lib/m2-engine/__tests__/relation-selection.test.ts` — should be deleted or skipped (V1 logic)

### 10.6 Full Test Suite

- [ ] **REG-050** — Run `npm test` — capture total pass/fail/skip count
- [ ] **REG-051** — All M1 engine tests pass (core, en378, ashrae15, iso5149)
- [ ] **REG-052** — All M2 designer tests pass
- [ ] **REG-053** — Document any failing tests with reason (legacy vs intentional failure)

---

## Execution Order (Recommended)

1. **Phase 1 — Automated** (can run immediately):
   - DB-001 to DB-103 (SQL queries against saferef.db)
   - REG-050 to REG-053 (`npm test`)
   - KI-030, KI-031 (build check)

2. **Phase 2 — API Testing** (with dev server running):
   - API-001 to API-071 (curl or Postman against localhost:3000)

3. **Phase 3 — Admin Manual Testing** (browser):
   - ADM-001 to ADM-127

4. **Phase 4 — User Flow Testing** (browser):
   - USR-001 to USR-007
   - CAL-010 to CAL-065
   - SEL-010 to SEL-059
   - E2E-001 to E2E-005

5. **Phase 5 — Engine Deep Testing** (vitest + manual simulation):
   - M2-001 to M2-132 (via testlab and unit tests)
   - M1-001 to M1-043 (via testlab and unit tests)

6. **Phase 6 — Pricing & Quotes** (end-to-end):
   - PRC-001 to PRC-036

7. **Phase 7 — UI/UX Polish** (browser, multi-device):
   - UI-001 to UI-067

8. **Phase 8 — Risk Verification**:
   - KI-001 to KI-040
   - REG-001 to REG-048

---

## Summary

| Category | Test Count |
|----------|-----------|
| 1. Database & Data Integrity | 42 |
| 2. API Endpoints | 30 |
| 3. Admin Pages | 42 |
| 4. User-Facing Pages | 43 |
| 5. M2 Engine Logic | 56 |
| 6. M1 Engine | 14 |
| 7. UI/UX Testing | 30 |
| 8. Pricing & Quotes | 22 |
| 9. Known Issues | 14 |
| 10. Regression Risks | 22 |
| **TOTAL** | **315** |
