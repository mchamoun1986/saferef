# F-Gas Leak Check Calculator — Design Spec

**Date**: 2026-04-15
**Status**: Approved

## Overview

Public-facing tool at `/fgas-checker` that calculates F-Gas EU 2024/573 leak check obligations and demonstrates ROI of installing SAMON automatic detection. Target users: installers and distributors.

Separate from the detection configurator — independent parcours, shared DB backend (RefrigerantV5).

## User Flow

### Landing Page (`/`)

Hub page with 2 cards linking to the two public tools:

1. **Detection Calculator** → `/configurator`
   - "How many detectors do you need?"
   - Existing tool, unchanged

2. **F-Gas Leak Check Calculator** → `/fgas-checker`
   - "Your F-Gas obligations & savings with automatic detection"
   - New tool

### F-Gas Checker Page (`/fgas-checker`)

Single page, 3 inputs, instant results.

#### Inputs (top)
- **Refrigerant** — searchable dropdown from `/api/refrigerants-v5`
- **Charge (kg)** — numeric input
- **Cost per leak check (EUR)** — pre-filled 400, editable

Display below inputs: GWP, safety class, calculated CO2eq.

#### Results — Obligations Table (middle)

Side-by-side comparison:

| | WITHOUT auto detection | WITH SAMON detection |
|---|---|---|
| Leak check frequency | Every X months | Every 2X months |
| Checks per year | N | N/2 |
| Annual cost (est.) | N × cost | N/2 × cost |
| **Annual saving** | — | **XXX EUR/year** |
| **Payback period** | — | **~Y years** |

Alert banner:
- co2eq >= 500 t → "MANDATORY: Automatic leak detection system required by EU 2024/573 Article 6"
- co2eq < 500 t → "RECOMMENDED: Halve your leak check frequency"
- co2eq < 5 t → "No F-Gas leak check obligation"

#### Results — Threshold Reference Table (bottom)

Full F-Gas threshold table with marker showing where the installation falls:

| Threshold | CO2eq range | Without detection | With SAMON |
|---|---|---|---|
| No obligation | < 5 t | — | — |
| Standard | 5 – 50 t | 12 months | 24 months |
| Medium | 50 – 500 t | 6 months | 12 months |
| High | >= 500 t | 3 months | 6 months |
| Mandatory auto | >= 500 t | REQUIRED | INSTALLED |

Arrow/highlight on the row matching the current installation.

#### PDF Download

Button to generate PDF report with:
- SAMON header
- Installation details (refrigerant, charge, CO2eq)
- Obligations comparison table (without vs with detection)
- Annual savings + payback
- Threshold reference table
- Legal reference: EU 2024/573 Article 5 & 6
- Disclaimer

## Special Cases

### HFO refrigerants (Annex II, Section 1)
For HFO/unsaturated HFC (R-1234yf, R-1234ze, etc.), thresholds are kg-based, not CO2eq:

| Charge | Without detection | With detection |
|---|---|---|
| < 1 kg | No obligation | — |
| 1 – 10 kg | 12 months | 24 months |
| 10 – 100 kg | 6 months | 12 months |
| >= 100 kg | 3 months + auto mandatory | 6 months |

Detection: check if refrigerant is HFO type (GWP < 10 AND in Annex II list) → use kg thresholds.

### Natural refrigerants (R-744, R-717, R-290)
GWP <= 3, CO2eq negligible → "No F-Gas leak check obligation for natural refrigerants."
But note: detection may still be required by EN 378 for safety reasons (link to configurator).

### Hermetically sealed systems
Optional checkbox: "Hermetically sealed system"
If checked AND charge < 10 t CO2eq (or < 2 kg HFO) → exempt from leak checks.

## Engine Architecture

### Files

```
src/lib/fgas/
  types.ts          — FGasInput, LeakCheckResult, ThresholdBand, FGasLogEntry
  leak-check.ts     — core calculation: co2eq, obligations, savings
```

### Core Logic (`leak-check.ts`)

```typescript
interface FGasInput {
  refrigerantId: string;
  gwp: number;
  chargeKg: number;
  costPerCheck: number;
  isHermetic: boolean;
  isHfo: boolean;  // Annex II refrigerant
}

interface LeakCheckResult {
  co2eq: number;                    // charge × GWP / 1000
  thresholdBand: 'none' | 'standard' | 'medium' | 'high';
  autoDetectionMandatory: boolean;  // co2eq >= 500 or HFO >= 100kg
  hermetic_exempt: boolean;
  frequency: {
    without: number | null;         // months between checks (null = no obligation)
    with: number | null;
  };
  checksPerYear: {
    without: number;
    with: number;
  };
  annualCost: {
    without: number;
    with: number;
  };
  annualSaving: number;
  paybackYears: number | null;      // null if saving = 0
}

function calculateLeakCheck(input: FGasInput): LeakCheckResult
```

### Calculation

```
co2eq = chargeKg × gwp / 1000

For HFC (Annex I):
  co2eq < 5      → no obligation
  5 ≤ co2eq < 50   → 12 months (with auto: 24 months)
  50 ≤ co2eq < 500  → 6 months (with auto: 12 months)
  co2eq ≥ 500     → 3 months (with auto: 6 months) + auto MANDATORY

For HFO (Annex II):
  charge < 1 kg    → no obligation
  1 ≤ charge < 10   → 12 months (with auto: 24 months)
  10 ≤ charge < 100  → 6 months (with auto: 12 months)
  charge ≥ 100      → 3 months (with auto: 6 months) + auto MANDATORY

Hermetic exempt: if isHermetic AND (co2eq < 10 OR charge < 2 kg for HFO)

checksPerYear = 12 / frequency_months (0 if no obligation)
annualCost = checksPerYear × costPerCheck
annualSaving = annualCost_without - annualCost_with
paybackYears = estimatedDetectorCost / annualSaving (use ~800 EUR default)
```

## Database

### New table: FGasLog (anonymous usage stats)

```prisma
model FGasLog {
  id            String   @id @default(cuid())
  refrigerantId String
  chargeKg      Float
  co2eq         Float
  band          String   // 'none' | 'standard' | 'medium' | 'high'
  mandatory     Boolean  // auto detection mandatory
  createdAt     DateTime @default(now())
}
```

### New API route: `/api/fgas-log`
- POST: save anonymous log entry (called on each calculation)
- GET: return stats (for admin page)

## Admin Page (`/admin/fgas`)

Simple stats dashboard:
- Total F-Gas calculations
- Top 10 refrigerants queried
- Distribution by threshold band (pie/bar chart)
- Percentage where auto detection is mandatory
- Recent calculations list (ref, charge, co2eq, band, date)

Add link in admin nav: `{ href: '/admin/fgas', label: 'F-Gas' }`

## Pages Summary

| Route | Type | Description |
|---|---|---|
| `/` | Public | Landing hub — 2 cards (Detection + F-Gas) |
| `/fgas-checker` | Public | F-Gas Leak Check Calculator |
| `/admin/fgas` | Admin | F-Gas usage stats |

## What We Don't Build (v1)

- No compliance check (Annex IV GWP limits by equipment)
- No alternative refrigerant recommendations
- No link to/from configurator
- No badge in configurator
- No multi-language (EN only, i18n ready for v2)
- No client data collection (anonymous only)

## Success Criteria

1. Installer enters refrigerant + charge → sees obligations in < 1 second
2. Comparison table clearly shows value of SAMON detection
3. PDF downloadable with professional SAMON branding
4. Admin sees anonymized usage stats
5. HFO special case handled correctly (kg-based thresholds)
6. Natural refrigerants correctly show "no F-Gas obligation"
