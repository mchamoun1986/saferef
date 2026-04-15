# DetectCalc — Multi-Regulation Engine Design Spec

**Date**: 2026-04-15
**Scope**: Refactor the M1 calculation engine to support EN 378-3:2016, ASHRAE 15-2022, and ISO 5149-3:2014 via a single engine with interchangeable rule profiles.

---

## 1. Problem

DetectCalc currently hardcodes EN 378-3:2016 logic in `m1-engine.ts` (~700 lines). SAMON sells globally — EU (EN 378), US/Middle East (ASHRAE 15), and international markets (ISO 5149). The tool must produce compliant calculation sheets for all three standards from a single codebase.

## 2. Architecture

### 2.1 Directory Structure

```
src/lib/
  engine/
    core.ts              # Shared physics: concentration, ppm↔kg/m³, placement, quantity
    types.ts             # Common types (extended from current engine-types.ts)
    rule-set.ts          # RuleSet interface definition
    evaluate.ts          # Orchestrator: RuleSet + RegulationInput → RegulationResult
  rules/
    en378.ts             # EN 378-3:2016 rule profile
    ashrae15.ts          # ASHRAE 15-2022 rule profile
    iso5149.ts           # ISO 5149-3:2014 rule profile
    shared-tables.ts     # ASHRAE 34 refrigerant data (RCL, LFL, VD) — single source of truth
    ashrae15-exemptions.ts # ASHRAE 15 Table 1 exemption quantities
  m1-engine.ts           # Deprecated wrapper → re-exports evaluate(en378RuleSet, input)
```

### 2.2 RuleSet Interface

```typescript
interface RuleSet {
  id: "en378" | "ashrae15" | "iso5149";
  name: string;              // "EN 378-3:2016"
  version: string;           // "2016+A1:2020"
  region: string;            // "EU" | "US/International" | "International"

  // Core decision: is detection required?
  evaluateDetection(input: RegulationInput): DetectionDecision;

  // Alarm thresholds (differ for A2L between EN 378 and ASHRAE 15)
  getAlarmThresholds(ref: RefrigerantV5, context: RegulatoryContext): AlarmThresholds;

  // Emergency ventilation flow rate
  getEmergencyVentilation(chargeKg: number, roomVolumeM3: number, ref: RefrigerantV5): VentilationResult;

  // Extra requirements specific to this standard
  getExtraRequirements(ref: RefrigerantV5, context: RegulatoryContext): ExtraRequirement[];

  // Normative clause references for the report
  getSourceClauses(paths: string[]): string[];
}
```

### 2.3 Shared Core Functions (core.ts)

These are pure physics — identical across all three standards:

| Function | Purpose |
|----------|---------|
| `concentrationKgM3(charge, volume)` | Charge/volume ratio |
| `kgM3ToPpm(cKg, molecularMass)` | Unit conversion |
| `ppmToKgM3(cPpm, molecularMass)` | Unit conversion |
| `placementByDensity(vapourDensity)` | Floor if VD>1, ceiling if VD<1 |
| `areaBasedQuantity(area, m2PerDetector)` | ceil(area/50) default |
| `clusterBasedQuantity(sources, roomDimensions)` | Distance-based clustering |

### 2.4 Per-RuleSet Functions — What Differs

#### Detection Obligation

| Standard | Logic |
|----------|-------|
| **EN 378** | `charge > RCL × volume` with factor /2 for category a. Paths A/B/C3/D. |
| **ASHRAE 15** | `charge > exemption_table[refrigerant]` (fixed kg, volume-independent). Table 1. |
| **ISO 5149** | Always required for A2/A3/B-group. For A1: `charge > RCL × volume` (no category factor). |

#### Alarm Thresholds

| Standard | Non-flammable (A1/B1) | Flammable (A2L/A2/A3/B2L/B2/B3) |
|----------|----------------------|----------------------------------|
| **EN 378** | 25%/50%/100% RCL | 25%/50%/100% RCL |
| **ASHRAE 15** | 25%/50%/100% RCL | 12.5%/25%/25% LFL (more conservative) |
| **ISO 5149** | 25%/50%/100% RCL | 25%/50%/100% RCL |

Real-world impact: For R-32, ASHRAE 15 triggers cutoff at 0.078 kg/m³ vs EN 378 at 0.155 kg/m³.

#### Emergency Ventilation

| Standard | Formula |
|----------|---------|
| **EN 378** | `q = 0.14 × √m` (m³/s) |
| **ASHRAE 15** | `q = max(G×√m, 20×V/3600)` where G=0.07 (halocarbons) or 0.14 (NH3) |
| **ISO 5149** | Not prescribed — use EN 378 formula as default |

#### Extra Requirements (ASHRAE 15 only)

- Return air detector required for B-group refrigerants
- Redundant detection (2 independent detectors) for B2/B3 in institutional occupancy
- Solenoid valve interlock mandatory for A2L VRF (EN 378 recommends, ASHRAE requires)

## 3. Data Model Changes

### 3.1 Prisma Schema

Add `regulation` field to CalcSheet:

```prisma
model CalcSheet {
  // ... existing fields unchanged ...
  regulation  String  @default("en378")  // "en378" | "ashrae15" | "iso5149"
}
```

### 3.2 Refrigerant Data

No new DB table needed. RefrigerantV5 already contains `lfl`, `vapourDensity`, `safetyClass`, `atelOdl`, `practicalLimit`. These values are identical across all 3 standards (source: ASHRAE 34).

ASHRAE 15 exemption quantities (Table 1) stored as TypeScript constant in `ashrae15-exemptions.ts` (~40 entries). This is normative reference data that doesn't change at runtime.

## 4. UI Changes

### 4.1 Step 2 — Regulation Selector

Add a regulation picker at the top of Step 2 (Gas & App), before application selection:

```
┌─────────────────────────────────────────────┐
│  Regulation Standard                        │
│  [EN 378-3 🇪🇺] [ASHRAE 15 🇺🇸] [ISO 5149 🌍]│
│  Default: EN 378 (EU)                       │
└─────────────────────────────────────────────┘
```

Selection influences:
- Terminology in Step 3 (e.g., "Access Category" → "Occupancy Classification" for ASHRAE 15)
- Calculation engine profile used
- Clause references in the calc sheet

### 4.2 Step 3 — Zones (Terminology Adaptation)

| Field | EN 378 | ASHRAE 15 | ISO 5149 |
|-------|--------|-----------|----------|
| Space classification | Access Category (a/b/c) | Occupancy Class (Institutional/Commercial/Industrial) | Occupied/Supervised/Machinery |
| System class | Class I/II/III/IV | N/A | N/A |
| Below ground | Yes | N/A (captured in occupancy) | N/A |

For ASHRAE 15, the regulatory context form adapts: replace access category dropdown with ASHRAE occupancy classification dropdown. The engine maps these to the correct evaluation logic.

### 4.3 Step 4 — Calc Sheet & PDF

- Header shows selected standard name and version
- Alarm thresholds section shows standard-specific values
- Emergency ventilation section with standard-specific formula
- Source clauses reference the correct standard sections
- ASHRAE-only features (return air detector, redundancy) shown when applicable

## 5. Backward Compatibility

- `m1-engine.ts` becomes a thin wrapper: `evaluate(en378RuleSet, input)` — existing imports continue to work
- CalcSheet records without `regulation` field default to `"en378"`
- Admin panel shows the regulation column in calc sheets list
- API responses include regulation field

## 6. Refactoring Strategy

### Phase 1 — Extract shared core
Extract physics functions from `m1-engine.ts` into `engine/core.ts`. No behavior change.

### Phase 2 — Create RuleSet interface and EN 378 profile
Move EN 378-specific logic (paths, Table C.3, category factors) into `rules/en378.ts`. Create `evaluate.ts` orchestrator. Wire `m1-engine.ts` as wrapper.

### Phase 3 — Add ASHRAE 15 profile
Implement `rules/ashrae15.ts` with Table 1 exemptions, 25% LFL thresholds, ventilation formula, extra requirements.

### Phase 4 — Add ISO 5149 profile
Implement `rules/iso5149.ts` — minimal delta from EN 378 (remove category factor, always-require for flammable/toxic groups).

### Phase 5 — UI integration
Add regulation selector to Step 2, adapt Step 3 terminology, update Step 4 calc sheet and PDF.

### Phase 6 — Admin & API
Add regulation column to admin calc sheets, update API responses, migration for new DB field.

## 7. Out of Scope

- Non-refrigerant regulations (parking CO/NO2, boiler rooms, H2) — future modules
- Product selection (M2) and pricing (M3) — not part of this spec
- CFD simulation — ASHRAE 15 mentions it but we use area-based calculation as default
- Multi-language support for regulation-specific terms — already handled by i18n system

## 8. Success Criteria

1. Running the EN 378 profile produces identical results to the current m1-engine for all existing test cases
2. ASHRAE 15 profile correctly applies Table 1 exemptions and 25% LFL thresholds for A2L refrigerants
3. ISO 5149 profile correctly requires detection for all A2/A3/B-group regardless of charge
4. Calc sheet and PDF clearly identify which standard was used
5. Admin panel displays regulation for each saved calc sheet
