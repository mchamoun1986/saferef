# Admin Simulator (TestLab v2) — Design Spec

**Date**: 2026-04-15
**Status**: Approved

## Overview

Replace the current TestLab admin page with a full-featured **client simulator** — a single-page tool for internal validation of detection calculations. Split-screen layout with live updates, 3-regulation comparison, full calculation trace, simulation history, and export.

## Layout

Split screen: **Inputs (35% left) | Results (65% right)**

### Left Panel — Inputs

1. **Refrigerant Selector**
   - Searchable dropdown loaded from `/api/refrigerants-v5`
   - Display: safety class, GWP, ATEL/ODL, LFL, vapour density, molecular mass
   - On select: auto-populate properties card below

2. **Zone Configuration**
   - Space Type dropdown (from `/api/space-types`)
   - On space type select → auto-fill ALL regulatory flags:
     - accessCategory, locationClass, isMachineryRoom, isOccupiedSpace,
       belowGround, humanComfort, c3Applicable, mechanicalVentilation
   - Fields: surface (m²), height (m), volume (auto-calc, overridable), charge (kg)
   - Manual override: all flags remain editable after auto-fill

3. **Regulatory Flags** (auto-filled by space type, manually overridable)
   - Checkboxes: machinery room, occupied space, below ground, C3 applicable, mech. ventilation, human comfort
   - Radio: access category (a/b/c), location class (I/II/III/IV)
   - Coherence: machinery room checked → uncheck occupied, force cat c + class III

4. **Preset Scenarios** (quick-load buttons)
   - R-32 Office (3 kg, 25 m², A2L small charge)
   - R-32 Office Large (10 kg, 25 m², A2L above limits)
   - R-744 Supermarket (25 kg, 200 m², CO2 standard)
   - R-717 Machinery Room (100 kg, 100 m², NH3 two-level)
   - R-290 Underground (5 kg, 50 m², propane below ground)
   - R-1234yf Machinery Room (20 kg, 20 m², A2L MR)
   - Custom presets can be added later

### Right Panel — Results (live update)

Recalculates all 3 regulations on every input change using `evaluateRegulation()`.

#### Section 1: Three-Regulation Comparison Table

| Field | EN 378-3:2016 | ASHRAE 15-2022 | ISO 5149-3:2014 |
|-------|---------------|----------------|-----------------|
| Detection | YES/RECOMMENDED/NO | ... | ... |
| Governing Rule | DET-MR-001 | ASHRAE15-MR-002 | ISO5149-MR-001 |
| Min Detectors | 2 | 2 | 2 |
| Recommended | 4 | 4 | 4 |
| Threshold | 36,086 ppm | 36,086 ppm | 36,086 ppm |
| Threshold Basis | 25%_LFL | 25%_LFL | 25%_LFL |
| Placement | floor (0-0.3 m) | floor (0-0.3 m) | floor (0-0.3 m) |
| Quantity Mode | area | area | area |
| Ventilation | 0.626 m³/s | 0.313 m³/s | 0.626 m³/s |

Color-coded: YES=red, RECOMMENDED=amber, NO=green.
Highlight cells that DIFFER between regulations.

#### Section 2: Charge vs Limits

- Charge (kg) vs PL × V (kg) — OK/EXCEEDED badge
- EN 378 Table C.3: concentration vs RCL/QLMV/QLAV table with badges
- Flammable charge caps: m1/m2/m3 vs charge with badges

#### Section 3: Decision Paths (expandable per regulation)

For each regulation, show all paths with decision and basis:
```
[YES]  A_MachineryRoom     EN 378-3, Clause 9.1 — mandatory
[SKIP] B_C3OccupiedSpace   C.3 not applicable
[SKIP] C_BelowGround       Not below ground
[SKIP] D_Ammonia            Not NH3 (R32)
[SKIP] E_VentilatedEncl     Location class II (not IV)
[YES]  G_PracticalLimit     charge 20 kg > PL × V = 3.5 kg
```

#### Section 4: Threshold Calculation Detail

- 50% ATEL/ODL = X ppm
- 25% LFL = Y ppm
- Chosen: min(X, Y) = Z ppm (basis)
- NH3 special: 500 / 30,000 ppm two-level

#### Section 5: Alarm Thresholds

Per regulation:
- Alarm 1: X ppm (basis)
- Alarm 2: Y ppm (basis)
- Cutoff: Z ppm (basis)

#### Section 6: Placement Detail

- Vapour density: X (vs air 1.18)
- Ratio: heavier/lighter
- Result: floor/ceiling/breathing zone (height)

### Simulation History (bottom of page)

- Each calculation is automatically saved to an in-memory list
- Table: #, timestamp, refrigerant, charge, volume, space type, EN378 decision, ASHRAE decision, ISO decision, detectors
- Buttons:
  - **Clear History** — reset list
  - **Export CSV** — download all simulations as CSV
  - **Export PDF** — download formatted PDF report of all simulations

## Technical Implementation

### Page Route
`/admin/simulator` — new page in admin layout

### Data Flow
1. On mount: fetch refrigerants + space types from API
2. On any input change: run `evaluateRegulation()` for all 3 rule sets client-side
3. Build trace using the `RegulationTrace` object from evaluate.ts
4. Push result to simulation history array (React state)

### Reused Code
- `evaluateRegulation()` from `src/lib/engine/evaluate.ts`
- `en378RuleSet`, `ashrae15RuleSet`, `iso5149RuleSet` from `src/lib/rules/`
- `getC3Entry()` from `src/lib/rules/en378.ts`
- `calcM1M2M3()`, `concentrationKgM3()`, `kgM3ToPpm()` from `src/lib/engine/core.ts`
- Space type auto-fill logic from `StepZones.tsx`
- Regulatory flag coherence from `StepZones.tsx`

### New Code
- `src/app/admin/simulator/page.tsx` — single page component (~600-800 lines)
- No new API routes needed (all calculation client-side)
- CSV export: generate in-browser
- PDF export: reuse jsPDF pattern from StepCalcSheet

### What Happens to TestLab
- Keep `/admin/testlab` as-is for now (don't break existing functionality)
- Add "Simulator" link in admin nav alongside TestLab
- Once simulator is validated, testlab can be removed later

## Success Criteria

1. Change any input → results update within 100ms (no "Calculate" button)
2. Space type selection auto-fills all regulatory flags correctly
3. All 3 regulations shown side-by-side with differences highlighted
4. Full calculation trace visible: paths, comparisons, thresholds, placement
5. Simulation history accumulates and exports to CSV/PDF
6. All 6 audit scenarios from the verification produce correct results
