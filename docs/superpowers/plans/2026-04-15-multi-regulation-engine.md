# Multi-Regulation Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the RefCalc M1 engine to support EN 378-3:2016, ASHRAE 15-2022, and ISO 5149-3:2014 via a single engine with interchangeable rule profiles.

**Architecture:** Extract shared physics from `m1-engine.ts` into `engine/core.ts`, define a `RuleSet` interface in `engine/rule-set.ts`, move EN 378 logic into `rules/en378.ts`, then add ASHRAE 15 and ISO 5149 profiles. The orchestrator in `engine/evaluate.ts` accepts any RuleSet. The existing `m1-engine.ts` becomes a backward-compatible wrapper.

**Tech Stack:** TypeScript, Next.js 16, Prisma 7 (SQLite), Vitest for testing.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/lib/engine/core.ts` | Shared physics: concentration, unit conversion, placement, quantity |
| Create | `src/lib/engine/types.ts` | All engine types (moved + extended from `engine-types.ts`) |
| Create | `src/lib/engine/rule-set.ts` | `RuleSet` interface + `AlarmThresholds`, `VentilationResult`, `ExtraRequirement` types |
| Create | `src/lib/engine/evaluate.ts` | Orchestrator: `evaluateRegulation(ruleSet, input)` and `evaluateAllZones(ruleSet, inputs)` |
| Create | `src/lib/rules/en378.ts` | EN 378-3:2016 rule profile (paths A-F, Table C.3, category factors) |
| Create | `src/lib/rules/ashrae15.ts` | ASHRAE 15-2022 rule profile (Table 1 exemptions, 25% LFL thresholds) |
| Create | `src/lib/rules/ashrae15-exemptions.ts` | ASHRAE 15 Table 1 exemption quantities (constant data) |
| Create | `src/lib/rules/iso5149.ts` | ISO 5149-3:2014 rule profile (simplified EN 378 variant) |
| Create | `src/lib/rules/index.ts` | Registry: `getRuleSet(id)` → returns the right RuleSet |
| Modify | `src/lib/m1-engine.ts` | Thin wrapper: re-exports via `evaluate(en378, input)` |
| Modify | `src/lib/engine-types.ts` | Re-export from `engine/types.ts` for backward compatibility |
| Create | `src/lib/engine/__tests__/core.test.ts` | Tests for shared physics functions |
| Create | `src/lib/engine/__tests__/en378.test.ts` | Tests for EN 378 — must match current m1-engine output |
| Create | `src/lib/engine/__tests__/ashrae15.test.ts` | Tests for ASHRAE 15 divergences |
| Create | `src/lib/engine/__tests__/iso5149.test.ts` | Tests for ISO 5149 divergences |
| Modify | `src/components/configurator/types.ts` | Add `regulation` to `GasAppData` |
| Modify | `src/components/configurator/StepGasApp.tsx` | Add regulation selector UI |
| Modify | `src/components/configurator/i18n.ts` | Add regulation-related translations |
| Modify | `src/components/configurator/StepZones.tsx` | Adapt regulatory context labels per regulation |
| Modify | `src/components/configurator/StepCalcSheet.tsx` | Show regulation in header, adapt alarm display |
| Modify | `src/app/configurator/page.tsx` | Pass regulation through wizard state |
| Modify | `prisma/schema.prisma` | Add `regulation` field to CalcSheet |
| Modify | `src/app/api/calc-sheets/route.ts` | Include regulation in POST/GET |
| Modify | `src/app/admin/calc-sheets/page.tsx` | Show regulation column |

---

### Task 1: Set up Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Create vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

Add to `scripts` in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify vitest runs**

Run: `npx vitest run`
Expected: "No test files found" (no error)

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest for engine testing"
```

---

### Task 2: Create engine types

**Files:**
- Create: `src/lib/engine/types.ts`
- Modify: `src/lib/engine-types.ts`

- [ ] **Step 1: Create `engine/types.ts` with all types**

Copy all types from `src/lib/engine-types.ts` into `src/lib/engine/types.ts` and add new types:

```typescript
// src/lib/engine/types.ts

// ─── Regulation ID ──────────────────────────────────────────────────
export type RegulationId = 'en378' | 'ashrae15' | 'iso5149';

// ─── Refrigerant (matches Prisma RefrigerantV5 model) ──────────────
export interface RefrigerantV5 {
  id: string;
  name: string;
  safetyClass: string;       // A1, A2L, B2L, A3...
  toxicityClass: string;     // A or B
  flammabilityClass: string; // 1, 2L, 2, 3
  atelOdl: number | null;    // kg/m³
  lfl: number | null;        // kg/m³
  practicalLimit: number;    // kg/m³
  vapourDensity: number;     // relative to air
  molecularMass: number;     // g/mol
  boilingPoint: string | null;
  gwp: string | null;
  gasGroup: string;
}

// ─── Regulation Input ──────────────────────────────────────────────
export interface RegulationInput {
  refrigerant: RefrigerantV5;
  charge: number;                  // kg
  roomArea: number;                // m²
  roomHeight: number;              // m
  roomVolume?: number;             // m³
  accessCategory: 'a' | 'b' | 'c';
  locationClass: 'I' | 'II' | 'III' | 'IV';
  belowGround: boolean;
  isMachineryRoom: boolean;
  isOccupiedSpace: boolean;
  humanComfort: boolean;
  c3Applicable: boolean;
  mechanicalVentilation: boolean;
  leakSourceLocations?: { id: string; description: string; x?: number; y?: number }[];
  sourceTypes?: string[];
  roomLength?: number;
  roomWidth?: number;
  // ASHRAE 15 specific
  occupancyClass?: 'institutional' | 'public_assembly' | 'residential' | 'commercial' | 'large_mercantile' | 'industrial' | 'mixed';
}

// ─── Alarm Thresholds ──────────────────────────────────────────────
export interface AlarmThresholds {
  alarm1Ppm: number;        // Low alarm
  alarm1KgM3: number;
  alarm1Basis: string;      // "25% RCL" or "12.5% LFL"
  alarm2Ppm: number;        // High alarm
  alarm2KgM3: number;
  alarm2Basis: string;      // "50% RCL" or "25% LFL"
  cutoffPpm: number;        // System cutoff
  cutoffKgM3: number;
  cutoffBasis: string;      // "100% RCL" or "25% LFL"
  stage2Ppm: number | null; // NH3 two-level only
}

// ─── Ventilation Result ────────────────────────────────────────────
export interface VentilationResult {
  flowRateM3s: number;      // m³/s
  formula: string;          // Human-readable formula used
  clause: string;           // Normative reference
}

// ─── Extra Requirement ─────────────────────────────────────────────
export interface ExtraRequirement {
  id: string;               // "return_air_detector", "redundant_detection", "solenoid_interlock"
  description: string;
  clause: string;           // Normative reference
  mandatory: boolean;
}

// ─── Candidate Zone ────────────────────────────────────────────────
export interface CandidateZone {
  zoneId: string;
  description: string;
  leakSources: string[];
  detectorPosition: string;
  rationale: string;
}

// ─── Path Evaluation ───────────────────────────────────────────────
export interface PathEvaluation {
  path: string;
  decision: string;
  ruleId: string;
  basis: string;
  extraDetector: boolean;
}

// ─── Regulation Trace ──────────────────────────────────────────────
export interface RegulationTrace {
  pathEvaluations: PathEvaluation[];
  volumeCalculated: number;
  concentrationKgM3: number | null;
  thresholdCalc: {
    halfAtelPpm: number | null;
    lfl25PctPpm: number | null;
    chosen: string;
    finalPpm: number;
  };
  placementCalc: {
    vapourDensity: number;
    airDensity: number;
    ratio: string;
    result: string;
  };
  quantityCalc: {
    areaBased: number;
    leakSourceBased: number;
    extraDetector: boolean;
    min: number;
    recommended: number;
    mode: 'area' | 'cluster';
    clusters: number;
  };
}

// ─── Regulation Result ─────────────────────────────────────────────
export interface RegulationResult {
  regulationId: RegulationId;
  regulationName: string;
  detectionRequired: 'YES' | 'NO' | 'MANUAL_REVIEW' | 'RECOMMENDED';
  detectionBasis: string;
  governingHazard: 'TOXICITY' | 'FLAMMABILITY' | 'BOTH' | 'NONE';
  governingRuleId: string;
  minDetectors: number;
  recommendedDetectors: number;
  quantityMode: 'area' | 'cluster';
  clusterCount: number;
  placementHeight: 'floor' | 'ceiling' | 'breathing_zone';
  placementHeightM: string;
  candidateZones: CandidateZone[];
  thresholdPpm: number;
  thresholdKgM3: number;
  thresholdBasis: string;
  stage2ThresholdPpm: number | null;
  alarmThresholds: AlarmThresholds;
  ventilation: VentilationResult;
  extraRequirements: ExtraRequirement[];
  requiredActions: string[];
  assumptions: string[];
  missingInputs: string[];
  reviewFlags: string[];
  sourceClauses: string[];
  ruleClasses: string[];
  trace?: RegulationTrace;
}

// ─── Multi-Zone ────────────────────────────────────────────────────
export interface ZoneRegulationResult {
  zoneId: string;
  zoneName: string;
  result: RegulationResult;
}

export interface AllZonesResult {
  regulationId: RegulationId;
  regulationName: string;
  zoneResults: ZoneRegulationResult[];
  totalRecommendedDetectors: number;
  totalMinDetectors: number;
  anyDetectionRequired: boolean;
}
```

- [ ] **Step 2: Update `engine-types.ts` as re-export**

Replace contents of `src/lib/engine-types.ts` with:

```typescript
// Backward compatibility — all types now live in engine/types.ts
export * from './engine/types';
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | head -20`
Expected: Build succeeds (types are compatible)

- [ ] **Step 4: Commit**

```bash
git add src/lib/engine/types.ts src/lib/engine-types.ts
git commit -m "feat(engine): create unified types with regulation support"
```

---

### Task 3: Create shared core functions

**Files:**
- Create: `src/lib/engine/core.ts`
- Create: `src/lib/engine/__tests__/core.test.ts`

- [ ] **Step 1: Write core tests**

```typescript
// src/lib/engine/__tests__/core.test.ts
import { describe, it, expect } from 'vitest';
import {
  concentrationKgM3,
  kgM3ToPpm,
  ppmToKgM3,
  placementByDensity,
  areaBasedQuantity,
  normalizeRefId,
  isFlammable,
} from '../core';

describe('concentrationKgM3', () => {
  it('calculates charge/volume ratio', () => {
    expect(concentrationKgM3(25, 700)).toBeCloseTo(0.03571, 4);
  });
  it('returns 0 for zero volume', () => {
    expect(concentrationKgM3(10, 0)).toBe(0);
  });
});

describe('kgM3ToPpm', () => {
  // R-744: M=44.01, 0.072 kg/m³ → ~40,000 ppm
  it('converts R-744 RCL to ppm', () => {
    const ppm = kgM3ToPpm(0.072, 44.01);
    expect(ppm).toBeCloseTo(40004, -1); // within ~10 ppm
  });
});

describe('ppmToKgM3', () => {
  it('is inverse of kgM3ToPpm', () => {
    const kgm3 = 0.072;
    const M = 44.01;
    const ppm = kgM3ToPpm(kgm3, M);
    const back = ppmToKgM3(ppm, M);
    expect(back).toBeCloseTo(kgm3, 5);
  });
});

describe('placementByDensity', () => {
  it('returns floor for heavy gases (VD > 1.5)', () => {
    expect(placementByDensity(1.52, 3)).toEqual({ height: 'floor', heightM: '0-0.5 m' });
  });
  it('returns ceiling for light gases (VD < 0.8)', () => {
    const result = placementByDensity(0.59, 4);
    expect(result.height).toBe('ceiling');
  });
  it('returns breathing_zone for neutral (0.8 <= VD <= 1.5)', () => {
    expect(placementByDensity(1.03, 3).height).toBe('breathing_zone');
  });
});

describe('areaBasedQuantity', () => {
  it('returns ceil(area/50)', () => {
    expect(areaBasedQuantity(200)).toBe(4);
    expect(areaBasedQuantity(51)).toBe(2);
    expect(areaBasedQuantity(50)).toBe(1);
    expect(areaBasedQuantity(10)).toBe(1);
  });
});

describe('normalizeRefId', () => {
  it('normalizes R744 → R-744', () => {
    expect(normalizeRefId('R744')).toBe('R-744');
  });
  it('keeps R-744 as is', () => {
    expect(normalizeRefId('R-744')).toBe('R-744');
  });
  it('normalizes R1234yf → R-1234yf', () => {
    expect(normalizeRefId('R1234yf')).toBe('R-1234yf');
  });
});

describe('isFlammable', () => {
  it('returns true for 2L, 2, 3', () => {
    expect(isFlammable('2L')).toBe(true);
    expect(isFlammable('3')).toBe(true);
  });
  it('returns false for 1', () => {
    expect(isFlammable('1')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/engine/__tests__/core.test.ts`
Expected: FAIL — module `../core` not found

- [ ] **Step 3: Create `core.ts`**

```typescript
// src/lib/engine/core.ts
// Shared physics — identical across all refrigerant regulations.
// Pure functions, no side effects, no DB calls.

// ── Constants ──────────────────────────────────────────────────────
export const AIR_DENSITY_25C = 1.18; // kg/m³ at 25°C
export const MOLAR_VOLUME = 24.45;   // L/mol at 25°C, 101.3 kPa

// ── ID Normalization ───────────────────────────────────────────────

/** Normalize refrigerant ID: R744 → R-744, R134a → R-134a */
export function normalizeRefId(id: string): string {
  if (id.startsWith('R-')) return id;
  if (!id.startsWith('R') || id.length < 3) return id;
  return 'R-' + id.slice(1);
}

// ── Unit Conversions ───────────────────────────────────────────────

/** Concentration in kg/m³ from charge (kg) and volume (m³) */
export function concentrationKgM3(charge: number, volume: number): number {
  if (volume <= 0) return 0;
  return charge / volume;
}

/** Convert kg/m³ to ppm at standard conditions (25°C, 101.3 kPa) */
export function kgM3ToPpm(cKg: number, molecularMass: number): number {
  return (MOLAR_VOLUME * cKg * 1e6) / molecularMass;
}

/** Convert ppm to kg/m³ at standard conditions */
export function ppmToKgM3(cPpm: number, molecularMass: number): number {
  return (molecularMass * cPpm) / (MOLAR_VOLUME * 1e6);
}

// ── Charge Cap Factors (EN 378 m1/m2/m3 from LFL) ─────────────────

export function calcM1M2M3(lfl: number): { m1: number; m2: number; m3: number } {
  return { m1: 4 * lfl, m2: 26 * lfl, m3: 130 * lfl };
}

// ── Safety Classification ──────────────────────────────────────────

export function isFlammable(flammabilityClass: string): boolean {
  return ['2L', '2', '3'].includes(flammabilityClass);
}

export function isToxic(toxicityClass: string): boolean {
  return toxicityClass === 'B';
}

export function determineGoverningHazard(
  toxicityClass: string,
  flammabilityClass: string,
): 'TOXICITY' | 'FLAMMABILITY' | 'BOTH' | 'NONE' {
  const toxic = isToxic(toxicityClass);
  const flam = isFlammable(flammabilityClass);
  if (toxic && flam) return 'BOTH';
  if (toxic) return 'TOXICITY';
  if (flam) return 'FLAMMABILITY';
  return 'NONE';
}

// ── Placement ──────────────────────────────────────────────────────

export interface PlacementResult {
  height: 'floor' | 'ceiling' | 'breathing_zone';
  heightM: string;
}

/** Determine detector placement height based on vapour density relative to air */
export function placementByDensity(vapourDensity: number, roomHeight: number): PlacementResult {
  if (vapourDensity > 1.5) {
    return { height: 'floor', heightM: '0-0.5 m' };
  }
  if (vapourDensity < 0.8) {
    const ceilingHeight = roomHeight >= 0.5 ? Math.max(roomHeight - 0.3, 0.5) : roomHeight;
    return {
      height: 'ceiling',
      heightM: `${ceilingHeight.toFixed(1)} m (ceiling minus 0.3 m)`,
    };
  }
  return { height: 'breathing_zone', heightM: '1.2-1.8 m' };
}

// ── Quantity ────────────────────────────────────────────────────────

/** Area-based detector count: 1 per 50 m² (default for EN 378 + ISO 5149) */
export function areaBasedQuantity(area: number, m2PerDetector: number = 50): number {
  return Math.max(1, Math.ceil(area / m2PerDetector));
}

/** Cluster sources by proximity using union-find. Returns cluster count. */
export function computeSourceClusters(
  sources: { id: string; x?: number; y?: number }[],
  roomLengthM: number,
  roomWidthM: number,
  maxDistanceM: number = 7,
): number {
  const positioned = sources.filter(s => s.x !== undefined && s.y !== undefined);
  if (positioned.length === 0) return 0;
  if (positioned.length === 1) return 1;

  const parent = new Map<string, string>();
  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id);
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    let curr = id;
    while (curr !== root) { const next = parent.get(curr)!; parent.set(curr, root); curr = next; }
    return root;
  };
  const union = (a: string, b: string) => { parent.set(find(a), find(b)); };

  for (const s of positioned) find(s.id);

  for (let i = 0; i < positioned.length; i++) {
    for (let j = i + 1; j < positioned.length; j++) {
      const a = positioned[i], b = positioned[j];
      const dx = ((a.x! - b.x!) / 100) * roomLengthM;
      const dy = ((a.y! - b.y!) / 100) * roomWidthM;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= maxDistanceM) {
        union(a.id, b.id);
      }
    }
  }

  return new Set(positioned.map(s => find(s.id))).size;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/engine/__tests__/core.test.ts`
Expected: All 10+ tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/engine/core.ts src/lib/engine/__tests__/core.test.ts
git commit -m "feat(engine): extract shared physics into core.ts with tests"
```

---

### Task 4: Create RuleSet interface and registry

**Files:**
- Create: `src/lib/engine/rule-set.ts`
- Create: `src/lib/rules/index.ts`

- [ ] **Step 1: Create `rule-set.ts`**

```typescript
// src/lib/engine/rule-set.ts
import type {
  RegulationId,
  RegulationInput,
  RefrigerantV5,
  AlarmThresholds,
  VentilationResult,
  ExtraRequirement,
  CandidateZone,
  PathEvaluation,
} from './types';

export type DetectionDecision = 'YES' | 'NO' | 'MANUAL_REVIEW' | 'RECOMMENDED' | 'SKIP';

export interface PathResult {
  decision: DetectionDecision;
  basis: string;
  ruleId: string;
  ruleClass: string;
  sourceClauses: string[];
  extraDetector: boolean;
  reviewFlags: string[];
  assumptions: string[];
  actions: string[];
}

export interface DetectionEvaluation {
  detectionRequired: 'YES' | 'NO' | 'MANUAL_REVIEW' | 'RECOMMENDED';
  detectionBasis: string;
  governingRuleId: string;
  ruleClasses: string[];
  extraDetector: boolean;
  pathEvaluations: PathEvaluation[];
  requiredActions: string[];
  assumptions: string[];
  reviewFlags: string[];
  sourceClauses: string[];
}

export interface ThresholdResult {
  ppm: number;
  kgM3: number;
  basis: string;
}

export interface RuleSet {
  id: RegulationId;
  name: string;
  version: string;
  region: string;

  /** Core decision: evaluate all paths and return detection requirement */
  evaluateDetection(input: RegulationInput): DetectionEvaluation;

  /** Calculate alarm threshold (first-level trigger point) */
  calculateThreshold(ref: RefrigerantV5, charge: number): {
    threshold: ThresholdResult;
    stage2Ppm: number | null;
    actions: string[];
  };

  /** Get multi-level alarm thresholds */
  getAlarmThresholds(ref: RefrigerantV5): AlarmThresholds;

  /** Emergency ventilation flow rate */
  getEmergencyVentilation(chargeKg: number, roomVolumeM3: number, ref: RefrigerantV5): VentilationResult;

  /** Extra requirements specific to this standard */
  getExtraRequirements(ref: RefrigerantV5, input: RegulationInput): ExtraRequirement[];

  /** Build candidate zones for detector placement */
  buildCandidateZones(input: RegulationInput): CandidateZone[];
}
```

- [ ] **Step 2: Create `rules/index.ts` registry**

```typescript
// src/lib/rules/index.ts
import type { RuleSet } from '../engine/rule-set';
import type { RegulationId } from '../engine/types';

// Lazy imports to keep bundle small
let _en378: RuleSet | null = null;
let _ashrae15: RuleSet | null = null;
let _iso5149: RuleSet | null = null;

export async function getRuleSet(id: RegulationId): Promise<RuleSet> {
  switch (id) {
    case 'en378':
      if (!_en378) { const m = await import('./en378'); _en378 = m.en378RuleSet; }
      return _en378;
    case 'ashrae15':
      if (!_ashrae15) { const m = await import('./ashrae15'); _ashrae15 = m.ashrae15RuleSet; }
      return _ashrae15;
    case 'iso5149':
      if (!_iso5149) { const m = await import('./iso5149'); _iso5149 = m.iso5149RuleSet; }
      return _iso5149;
    default:
      throw new Error(`Unknown regulation: ${id}`);
  }
}

/** Synchronous version for server-side use where all modules are bundled */
export function getRuleSetSync(id: RegulationId): RuleSet {
  switch (id) {
    case 'en378': {
      if (!_en378) { const m = require('./en378'); _en378 = m.en378RuleSet; }
      return _en378!;
    }
    case 'ashrae15': {
      if (!_ashrae15) { const m = require('./ashrae15'); _ashrae15 = m.ashrae15RuleSet; }
      return _ashrae15!;
    }
    case 'iso5149': {
      if (!_iso5149) { const m = require('./iso5149'); _iso5149 = m.iso5149RuleSet; }
      return _iso5149!;
    }
    default:
      throw new Error(`Unknown regulation: ${id}`);
  }
}

export const AVAILABLE_REGULATIONS: { id: RegulationId; name: string; region: string; flag: string }[] = [
  { id: 'en378', name: 'EN 378-3:2016', region: 'EU', flag: '🇪🇺' },
  { id: 'ashrae15', name: 'ASHRAE 15-2022', region: 'US / International', flag: '🇺🇸' },
  { id: 'iso5149', name: 'ISO 5149-3:2014', region: 'International', flag: '🌍' },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/engine/rule-set.ts src/lib/rules/index.ts
git commit -m "feat(engine): add RuleSet interface and regulation registry"
```

---

### Task 5: Create EN 378 rule profile

This is the largest task — move all EN 378-specific logic from `m1-engine.ts` into `rules/en378.ts`.

**Files:**
- Create: `src/lib/rules/en378.ts`
- Create: `src/lib/engine/__tests__/en378.test.ts`

- [ ] **Step 1: Write EN 378 regression tests**

These tests capture the current m1-engine behavior to ensure the refactored version produces identical results.

```typescript
// src/lib/engine/__tests__/en378.test.ts
import { describe, it, expect } from 'vitest';
import { en378RuleSet } from '../../rules/en378';
import type { RegulationInput, RefrigerantV5 } from '../types';

const R744: RefrigerantV5 = {
  id: 'R744', name: 'R-744 (CO2)', safetyClass: 'A1',
  toxicityClass: 'A', flammabilityClass: '1',
  atelOdl: 0.072, lfl: null, practicalLimit: 0.1,
  vapourDensity: 1.52, molecularMass: 44.01,
  boilingPoint: '-78.5', gwp: '1', gasGroup: 'CO2',
};

const R32: RefrigerantV5 = {
  id: 'R32', name: 'R-32', safetyClass: 'A2L',
  toxicityClass: 'A', flammabilityClass: '2L',
  atelOdl: 0.30, lfl: 0.306, practicalLimit: 0.061,
  vapourDensity: 2.15, molecularMass: 52.02,
  boilingPoint: '-51.7', gwp: '675', gasGroup: 'HFC2',
};

const R717: RefrigerantV5 = {
  id: 'R717', name: 'R-717 (NH3)', safetyClass: 'B2L',
  toxicityClass: 'B', flammabilityClass: '2L',
  atelOdl: 0.00022, lfl: 0.116, practicalLimit: 0.00035,
  vapourDensity: 0.59, molecularMass: 17.03,
  boilingPoint: '-33.3', gwp: '0', gasGroup: 'NH3',
};

function makeInput(ref: RefrigerantV5, overrides: Partial<RegulationInput> = {}): RegulationInput {
  return {
    refrigerant: ref,
    charge: 25,
    roomArea: 200,
    roomHeight: 3.5,
    accessCategory: 'b',
    locationClass: 'II',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: false,
    ...overrides,
  };
}

describe('EN 378 — evaluateDetection', () => {
  it('machinery room → always YES for B-group', () => {
    const input = makeInput(R717, { isMachineryRoom: true, c3Applicable: false });
    const result = en378RuleSet.evaluateDetection(input);
    expect(result.detectionRequired).toBe('YES');
  });

  it('R744 supermarket 25kg in 700m³ → RECOMMENDED (below QLMV)', () => {
    const input = makeInput(R744);
    const result = en378RuleSet.evaluateDetection(input);
    expect(result.detectionRequired).toBe('RECOMMENDED');
  });

  it('R717 > 50kg → YES with two-level alarm', () => {
    const input = makeInput(R717, { charge: 60, isMachineryRoom: true, c3Applicable: false });
    const result = en378RuleSet.evaluateDetection(input);
    expect(result.detectionRequired).toBe('YES');
  });
});

describe('EN 378 — getAlarmThresholds', () => {
  it('R744: alarm thresholds based on 25%/50%/100% RCL', () => {
    const thresholds = en378RuleSet.getAlarmThresholds(R744);
    expect(thresholds.alarm1Basis).toContain('RCL');
    expect(thresholds.alarm2Basis).toContain('RCL');
  });

  it('R32 (A2L): alarm thresholds based on RCL (not LFL for EN 378)', () => {
    const thresholds = en378RuleSet.getAlarmThresholds(R32);
    // EN 378 uses RCL-based thresholds even for A2L (unlike ASHRAE 15)
    expect(thresholds.alarm1Basis).toContain('RCL');
  });
});

describe('EN 378 — getEmergencyVentilation', () => {
  it('uses 0.14 × √m formula', () => {
    const result = en378RuleSet.getEmergencyVentilation(100, 200, R744);
    expect(result.flowRateM3s).toBeCloseTo(1.4, 1); // 0.14 × √100
  });
});

describe('EN 378 — metadata', () => {
  it('has correct id and name', () => {
    expect(en378RuleSet.id).toBe('en378');
    expect(en378RuleSet.name).toBe('EN 378-3:2016');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/engine/__tests__/en378.test.ts`
Expected: FAIL — module `../../rules/en378` not found

- [ ] **Step 3: Create `rules/en378.ts`**

Move all EN 378-specific logic from `m1-engine.ts`. This file contains:
- Table C.3 data
- Paths A-F (machinery room, C3 occupied, below ground flammable, ammonia, ventilated enclosure, not required)
- EN 378-specific threshold calculation (25%/50%/100% RCL)
- Ventilation formula: `0.14 × √m`
- Candidate zone builder

The file should implement the `RuleSet` interface. Copy the path functions (`pathA_MachineryRoom`, `pathB_C3OccupiedSpace`, `pathC_BelowGroundFlammable`, `pathD_Ammonia`, `pathE_VentilatedEnclosure`, `pathF_NotRequired`) directly from `m1-engine.ts` lines 270-530, updating imports to use `core.ts` functions.

The `evaluateDetection` method should replicate the logic from `calculateRegulation` lines 786-821 (path aggregation).

The `calculateThreshold` method should replicate lines 146-222 from `m1-engine.ts`.

The `getAlarmThresholds` method returns: alarm1 = 25% RCL, alarm2 = 50% RCL, cutoff = 100% RCL (derived from `calculateThreshold` output).

The `getEmergencyVentilation` method returns: `{ flowRateM3s: 0.14 * Math.sqrt(chargeKg), formula: '0.14 × √m', clause: 'EN 378-3:2016 Clause 6.4.4' }`.

The `getExtraRequirements` method returns an empty array (EN 378 has no ASHRAE-style extra requirements).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/engine/__tests__/en378.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/rules/en378.ts src/lib/engine/__tests__/en378.test.ts
git commit -m "feat(engine): implement EN 378 rule profile with tests"
```

---

### Task 6: Create orchestrator and backward-compatible wrapper

**Files:**
- Create: `src/lib/engine/evaluate.ts`
- Modify: `src/lib/m1-engine.ts`

- [ ] **Step 1: Create `evaluate.ts`**

```typescript
// src/lib/engine/evaluate.ts
import type { RuleSet } from './rule-set';
import type {
  RegulationInput,
  RegulationResult,
  AllZonesResult,
  ZoneRegulationResult,
} from './types';
import {
  concentrationKgM3,
  placementByDensity,
  areaBasedQuantity,
  computeSourceClusters,
  determineGoverningHazard,
  AIR_DENSITY_25C,
  kgM3ToPpm,
} from './core';

export function evaluateRegulation(ruleSet: RuleSet, input: RegulationInput): RegulationResult {
  // Input validation
  if (input.charge <= 0) return validationError(ruleSet, 'Charge must be > 0 kg');
  if (input.roomArea <= 0) return validationError(ruleSet, 'Room area must be > 0 m²');
  if (input.roomHeight <= 0) return validationError(ruleSet, 'Room height must be > 0 m');

  const ref = input.refrigerant;
  if (!ref.vapourDensity || ref.vapourDensity <= 0) return validationError(ruleSet, `Missing vapourDensity for ${ref.id}`);
  if (!ref.molecularMass || ref.molecularMass <= 0) return validationError(ruleSet, `Missing molecularMass for ${ref.id}`);
  if (ref.atelOdl === null && ref.lfl === null) return validationError(ruleSet, `Both ATEL/ODL and LFL missing for ${ref.id}`);
  if (input.roomHeight < 0.5) return validationError(ruleSet, 'Room height must be >= 0.5 m');

  const volume = input.roomVolume ?? input.roomArea * input.roomHeight;
  const effectiveInput: RegulationInput = { ...input, roomVolume: volume };

  // ── Detection evaluation (rule-set specific paths) ──
  const detection = ruleSet.evaluateDetection(effectiveInput);

  // ── Threshold (rule-set specific) ──
  const isNh3TwoLevel = ref.id === 'R717' || ref.id === 'R-717';
  const { threshold, stage2Ppm, actions: thresholdActions } = ruleSet.calculateThreshold(ref, input.charge);

  // ── Alarm thresholds (rule-set specific) ──
  const alarmThresholds = ruleSet.getAlarmThresholds(ref);

  // ── Placement (shared physics) ──
  const placement = placementByDensity(ref.vapourDensity, input.roomHeight);

  // ── Quantity (shared physics) ──
  const detectionIsRequired = detection.detectionRequired === 'YES' || detection.detectionRequired === 'MANUAL_REVIEW';
  let minDet = detectionIsRequired ? 1 : 0;
  if (detection.extraDetector) minDet += 1;

  const sources = input.leakSourceLocations ?? [];
  const hasPositionedSources = sources.length > 0 && sources.some(s => s.x !== undefined && s.y !== undefined);

  let recommendedDet: number;
  let quantityMode: 'area' | 'cluster';
  let clusterCount: number;

  if (hasPositionedSources) {
    const roomL = input.roomLength ?? Math.sqrt(input.roomArea);
    const roomW = input.roomWidth ?? (input.roomArea / roomL);
    clusterCount = computeSourceClusters(sources, roomL, roomW);
    recommendedDet = Math.max(minDet, clusterCount);
    quantityMode = 'cluster';
  } else {
    clusterCount = 0;
    recommendedDet = Math.max(minDet, areaBasedQuantity(input.roomArea));
    quantityMode = 'area';
  }

  // RECOMMENDED = at least 1 (SAMON policy)
  if (detection.detectionRequired === 'RECOMMENDED' && recommendedDet === 0) {
    recommendedDet = Math.max(1, areaBasedQuantity(input.roomArea));
    minDet = 0;
  }

  // ── Ventilation (rule-set specific) ──
  const ventilation = ruleSet.getEmergencyVentilation(input.charge, volume, ref);

  // ── Extra requirements (rule-set specific) ──
  const extraRequirements = ruleSet.getExtraRequirements(ref, effectiveInput);

  // ── Candidate zones ──
  const candidateZones = ruleSet.buildCandidateZones(effectiveInput);

  // ── Governing hazard ──
  const governingHazard = determineGoverningHazard(ref.toxicityClass, ref.flammabilityClass);

  // ── Missing inputs ──
  const missingInputs: string[] = [];
  if (!input.leakSourceLocations || input.leakSourceLocations.length === 0) {
    missingInputs.push('No leak source locations provided — using default placement');
  }

  // ── Trace ──
  const concKgM3 = concentrationKgM3(input.charge, volume);
  let halfAtelPpm: number | null = null;
  let lfl25PctPpm: number | null = null;
  if (ref.atelOdl !== null) halfAtelPpm = Math.floor(kgM3ToPpm(ref.atelOdl, ref.molecularMass) * 0.5);
  if (ref.lfl !== null) lfl25PctPpm = Math.floor(kgM3ToPpm(ref.lfl, ref.molecularMass) * 0.25);

  const vd = ref.vapourDensity;

  return {
    regulationId: ruleSet.id,
    regulationName: ruleSet.name,
    detectionRequired: detection.detectionRequired,
    detectionBasis: detection.detectionBasis,
    governingHazard,
    governingRuleId: detection.governingRuleId,
    minDetectors: minDet,
    recommendedDetectors: recommendedDet,
    quantityMode,
    clusterCount,
    placementHeight: placement.height,
    placementHeightM: placement.heightM,
    candidateZones,
    thresholdPpm: threshold.ppm,
    thresholdKgM3: threshold.kgM3,
    thresholdBasis: threshold.basis,
    stage2ThresholdPpm: stage2Ppm,
    alarmThresholds,
    ventilation,
    extraRequirements,
    requiredActions: [...new Set([...detection.requiredActions, ...thresholdActions])],
    assumptions: [...new Set(detection.assumptions)],
    missingInputs,
    reviewFlags: [...new Set(detection.reviewFlags)],
    sourceClauses: [...new Set(detection.sourceClauses)],
    ruleClasses: detection.ruleClasses,
    trace: {
      pathEvaluations: detection.pathEvaluations,
      volumeCalculated: volume,
      concentrationKgM3: concKgM3,
      thresholdCalc: { halfAtelPpm, lfl25PctPpm, chosen: threshold.basis, finalPpm: threshold.ppm },
      placementCalc: {
        vapourDensity: vd,
        airDensity: AIR_DENSITY_25C,
        ratio: vd > 1.5 ? 'heavier' : vd < 0.8 ? 'lighter' : 'neutral',
        result: `${placement.height} — ${placement.heightM}`,
      },
      quantityCalc: {
        areaBased: areaBasedQuantity(input.roomArea),
        leakSourceBased: sources.length,
        extraDetector: detection.extraDetector,
        min: minDet,
        recommended: recommendedDet,
        mode: quantityMode,
        clusters: clusterCount,
      },
    },
  };
}

export function evaluateAllZones(
  ruleSet: RuleSet,
  inputs: (RegulationInput & { zoneId: string; zoneName: string })[],
): AllZonesResult {
  const zoneResults: ZoneRegulationResult[] = inputs.map(input => ({
    zoneId: input.zoneId,
    zoneName: input.zoneName,
    result: evaluateRegulation(ruleSet, input),
  }));

  return {
    regulationId: ruleSet.id,
    regulationName: ruleSet.name,
    zoneResults,
    totalRecommendedDetectors: zoneResults.reduce((s, zr) => s + zr.result.recommendedDetectors, 0),
    totalMinDetectors: zoneResults.reduce((s, zr) => s + zr.result.minDetectors, 0),
    anyDetectionRequired: zoneResults.some(zr =>
      zr.result.detectionRequired === 'YES' || zr.result.detectionRequired === 'MANUAL_REVIEW'
    ),
  };
}

function validationError(ruleSet: RuleSet, message: string): RegulationResult {
  const empty: RegulationResult = {
    regulationId: ruleSet.id,
    regulationName: ruleSet.name,
    detectionRequired: 'NO',
    detectionBasis: `INPUT_ERROR: ${message}`,
    governingHazard: 'NONE',
    governingRuleId: 'VALIDATION',
    minDetectors: 0,
    recommendedDetectors: 0,
    quantityMode: 'area',
    clusterCount: 0,
    placementHeight: 'floor',
    placementHeightM: 'N/A',
    candidateZones: [],
    thresholdPpm: 0,
    thresholdKgM3: 0,
    thresholdBasis: 'VALIDATION_ERROR',
    stage2ThresholdPpm: null,
    alarmThresholds: {
      alarm1Ppm: 0, alarm1KgM3: 0, alarm1Basis: '',
      alarm2Ppm: 0, alarm2KgM3: 0, alarm2Basis: '',
      cutoffPpm: 0, cutoffKgM3: 0, cutoffBasis: '',
      stage2Ppm: null,
    },
    ventilation: { flowRateM3s: 0, formula: '', clause: '' },
    extraRequirements: [],
    requiredActions: [],
    assumptions: [],
    missingInputs: [message],
    reviewFlags: [`VALIDATION: ${message}`],
    sourceClauses: [],
    ruleClasses: [],
  };
  return empty;
}
```

- [ ] **Step 2: Update `m1-engine.ts` as backward-compatible wrapper**

Replace the entire content of `src/lib/m1-engine.ts` with:

```typescript
// m1-engine.ts — BACKWARD COMPATIBILITY WRAPPER
// All logic now lives in engine/ and rules/.
// This file preserves the old API for existing consumers.

import { evaluateRegulation, evaluateAllZones } from './engine/evaluate';
import { getRuleSetSync } from './rules';
import type { RegulationInput } from './engine/types';
import type { RegulationResult, AllZonesResult, ZoneRegulationResult } from './engine/types';

// Re-export types for backward compatibility
export type { RegulationResult, AllZonesResult, ZoneRegulationResult };

const en378 = () => getRuleSetSync('en378');

export function calculateRegulation(input: RegulationInput): RegulationResult {
  return evaluateRegulation(en378(), input);
}

export function calculateRegulationOnly(input: RegulationInput): RegulationResult {
  return calculateRegulation(input);
}

export function calculateAllZones(
  inputs: (RegulationInput & { zoneId: string; zoneName: string })[],
): AllZonesResult {
  return evaluateAllZones(en378(), inputs);
}
```

- [ ] **Step 3: Verify existing configurator still works**

Run: `npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/lib/engine/evaluate.ts src/lib/m1-engine.ts
git commit -m "feat(engine): add orchestrator and backward-compatible m1-engine wrapper"
```

---

### Task 7: Create ASHRAE 15 rule profile

**Files:**
- Create: `src/lib/rules/ashrae15-exemptions.ts`
- Create: `src/lib/rules/ashrae15.ts`
- Create: `src/lib/engine/__tests__/ashrae15.test.ts`

- [ ] **Step 1: Write ASHRAE 15 divergence tests**

```typescript
// src/lib/engine/__tests__/ashrae15.test.ts
import { describe, it, expect } from 'vitest';
import { ashrae15RuleSet } from '../../rules/ashrae15';
import type { RegulationInput, RefrigerantV5 } from '../types';

const R32: RefrigerantV5 = {
  id: 'R32', name: 'R-32', safetyClass: 'A2L',
  toxicityClass: 'A', flammabilityClass: '2L',
  atelOdl: 0.30, lfl: 0.306, practicalLimit: 0.061,
  vapourDensity: 2.15, molecularMass: 52.02,
  boilingPoint: '-51.7', gwp: '675', gasGroup: 'HFC2',
};

const R744: RefrigerantV5 = {
  id: 'R744', name: 'R-744 (CO2)', safetyClass: 'A1',
  toxicityClass: 'A', flammabilityClass: '1',
  atelOdl: 0.072, lfl: null, practicalLimit: 0.1,
  vapourDensity: 1.52, molecularMass: 44.01,
  boilingPoint: '-78.5', gwp: '1', gasGroup: 'CO2',
};

function makeInput(ref: RefrigerantV5, overrides: Partial<RegulationInput> = {}): RegulationInput {
  return {
    refrigerant: ref,
    charge: 7,
    roomArea: 50,
    roomHeight: 3,
    accessCategory: 'b',
    locationClass: 'II',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: false,
    occupancyClass: 'commercial',
    ...overrides,
  };
}

describe('ASHRAE 15 — detection obligation uses Table 1 exemptions', () => {
  it('R-32 7kg > 6.8kg exemption → YES regardless of volume', () => {
    // Large room (50m³) — EN 378 would say NO (QLMV = 0.31 × 50 = 15.5 > 7)
    // ASHRAE 15 says YES (7 > 6.8 exemption)
    const input = makeInput(R32, { charge: 7, roomArea: 50, roomHeight: 3 });
    const result = ashrae15RuleSet.evaluateDetection(input);
    expect(result.detectionRequired).toBe('YES');
  });

  it('R-32 5kg < 6.8kg exemption → RECOMMENDED', () => {
    const input = makeInput(R32, { charge: 5 });
    const result = ashrae15RuleSet.evaluateDetection(input);
    expect(['NO', 'RECOMMENDED']).toContain(result.detectionRequired);
  });

  it('R-744 40kg < 45kg exemption → RECOMMENDED', () => {
    const input = makeInput(R744, { charge: 40 });
    const result = ashrae15RuleSet.evaluateDetection(input);
    expect(['NO', 'RECOMMENDED']).toContain(result.detectionRequired);
  });

  it('R-744 50kg > 45kg exemption → YES', () => {
    const input = makeInput(R744, { charge: 50 });
    const result = ashrae15RuleSet.evaluateDetection(input);
    expect(result.detectionRequired).toBe('YES');
  });
});

describe('ASHRAE 15 — alarm thresholds use 25% LFL for flammables', () => {
  it('R-32 alarm2 = 25% LFL (not 50% RCL)', () => {
    const thresholds = ashrae15RuleSet.getAlarmThresholds(R32);
    expect(thresholds.alarm2Basis).toContain('LFL');
    // 25% LFL for R-32: 0.25 × 0.306 = 0.0765 kg/m³
    expect(thresholds.alarm2KgM3).toBeCloseTo(0.0765, 3);
  });

  it('R-744 (A1) still uses RCL-based thresholds', () => {
    const thresholds = ashrae15RuleSet.getAlarmThresholds(R744);
    expect(thresholds.alarm1Basis).toContain('RCL');
  });
});

describe('ASHRAE 15 — ventilation uses max(G×√m, 20 ACH)', () => {
  it('for halocarbons uses G=0.07', () => {
    const result = ashrae15RuleSet.getEmergencyVentilation(100, 200, R32);
    // G×√m = 0.07 × 10 = 0.7 m³/s
    // 20 ACH = 20 × 200 / 3600 = 1.11 m³/s
    // max = 1.11
    expect(result.flowRateM3s).toBeCloseTo(1.11, 1);
  });
});

describe('ASHRAE 15 — extra requirements', () => {
  it('no return air detector for A1 refrigerant', () => {
    const input = makeInput(R744);
    const extras = ashrae15RuleSet.getExtraRequirements(R744, input);
    expect(extras.find(e => e.id === 'return_air_detector')).toBeUndefined();
  });
});

describe('ASHRAE 15 — metadata', () => {
  it('has correct id', () => {
    expect(ashrae15RuleSet.id).toBe('ashrae15');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/engine/__tests__/ashrae15.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create `ashrae15-exemptions.ts`**

```typescript
// src/lib/rules/ashrae15-exemptions.ts
// ASHRAE 15-2022 Table 1 — Exemption quantities (kg)
// If system charge ≤ this value in occupied space, no detection required.

import { normalizeRefId } from '../engine/core';

const TABLE_1_RAW: Record<string, number> = {
  'R-22':       11.3,
  'R-32':       6.8,
  'R-123':      2.3,
  'R-134a':     11.3,
  'R-152a':     1.0,
  'R-290':      1.0,
  'R-404A':     11.3,
  'R-407A':     11.3,
  'R-407C':     11.3,
  'R-407F':     11.3,
  'R-410A':     11.3,
  'R-448A':     11.3,
  'R-449A':     11.3,
  'R-450A':     11.3,
  'R-452A':     11.3,
  'R-452B':     6.8,
  'R-454A':     6.8,
  'R-454B':     6.8,
  'R-454C':     6.8,
  'R-455A':     6.8,
  'R-464A':     6.8,
  'R-465A':     6.8,
  'R-466A':     11.3,
  'R-468A':     6.8,
  'R-507A':     11.3,
  'R-513A':     11.3,
  'R-600a':     0.5,
  'R-717':      0,       // NH3 — always required
  'R-744':      45,
  'R-1150':     0.5,
  'R-1234yf':   6.8,
  'R-1234ze':   6.8,
  'R-1233zd':   6.8,
  'R-1270':     0.5,
  'R-50':       0.5,
};

/** Get ASHRAE 15 exemption quantity in kg. Returns 0 if not found (conservative). */
export function getAshrae15Exemption(refrigerantId: string): number {
  const normalized = normalizeRefId(refrigerantId);
  return TABLE_1_RAW[normalized] ?? 0;
}
```

- [ ] **Step 4: Create `ashrae15.ts`**

Implement the `RuleSet` interface for ASHRAE 15-2022. Key differences from EN 378:

- `evaluateDetection`: uses `getAshrae15Exemption(ref.id)` instead of QLMV × volume. Machinery room logic same as EN 378.
- `getAlarmThresholds`: for flammable groups (A2L/A2/A3/B2L/B2/B3), uses 12.5%/25%/25% LFL. For non-flammable, uses 25%/50%/100% RCL.
- `getEmergencyVentilation`: `max(G × √m, 20 × V / 3600)` where G=0.07 for halocarbons, 0.14 for NH3.
- `getExtraRequirements`: return air detector for B-group, redundant detection for B2/B3 in institutional, solenoid interlock for A2L.
- `calculateThreshold`: same as EN 378 (min of 50% ATEL, 25% LFL).

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/engine/__tests__/ashrae15.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/rules/ashrae15-exemptions.ts src/lib/rules/ashrae15.ts src/lib/engine/__tests__/ashrae15.test.ts
git commit -m "feat(engine): implement ASHRAE 15-2022 rule profile with tests"
```

---

### Task 8: Create ISO 5149 rule profile

**Files:**
- Create: `src/lib/rules/iso5149.ts`
- Create: `src/lib/engine/__tests__/iso5149.test.ts`

- [ ] **Step 1: Write ISO 5149 divergence tests**

```typescript
// src/lib/engine/__tests__/iso5149.test.ts
import { describe, it, expect } from 'vitest';
import { iso5149RuleSet } from '../../rules/iso5149';
import type { RegulationInput, RefrigerantV5 } from '../types';

const R290: RefrigerantV5 = {
  id: 'R290', name: 'R-290 (Propane)', safetyClass: 'A3',
  toxicityClass: 'A', flammabilityClass: '3',
  atelOdl: null, lfl: 0.038, practicalLimit: 0.008,
  vapourDensity: 1.56, molecularMass: 44.10,
  boilingPoint: '-42.1', gwp: '3', gasGroup: 'R290',
};

const R744: RefrigerantV5 = {
  id: 'R744', name: 'R-744 (CO2)', safetyClass: 'A1',
  toxicityClass: 'A', flammabilityClass: '1',
  atelOdl: 0.072, lfl: null, practicalLimit: 0.1,
  vapourDensity: 1.52, molecularMass: 44.01,
  boilingPoint: '-78.5', gwp: '1', gasGroup: 'CO2',
};

function makeInput(ref: RefrigerantV5, overrides: Partial<RegulationInput> = {}): RegulationInput {
  return {
    refrigerant: ref,
    charge: 2,
    roomArea: 100,
    roomHeight: 3,
    accessCategory: 'b',
    locationClass: 'II',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: false,
    ...overrides,
  };
}

describe('ISO 5149 — always requires detection for A2/A3/B-group', () => {
  it('R-290 (A3) always YES in occupied space regardless of charge', () => {
    // Even tiny charge — ISO 5149 mandates detection for flammable/toxic
    const input = makeInput(R290, { charge: 0.5 });
    const result = iso5149RuleSet.evaluateDetection(input);
    expect(result.detectionRequired).toBe('YES');
  });
});

describe('ISO 5149 — A1 uses QLMV without category factor', () => {
  it('R-744 small charge in large room → RECOMMENDED (no cat a factor)', () => {
    const input = makeInput(R744, { charge: 5, roomArea: 200, roomHeight: 3, accessCategory: 'a' });
    const result = iso5149RuleSet.evaluateDetection(input);
    // RCL × V = 0.072 × 600 = 43.2 kg > 5 kg → no detection required
    // EN 378 with cat a would use RCL/2 = 0.036 × 600 = 21.6 → still no
    expect(['NO', 'RECOMMENDED']).toContain(result.detectionRequired);
  });
});

describe('ISO 5149 — ventilation uses EN 378 formula as default', () => {
  it('uses 0.14 × √m', () => {
    const result = iso5149RuleSet.getEmergencyVentilation(100, 200, R744);
    expect(result.flowRateM3s).toBeCloseTo(1.4, 1);
    expect(result.clause).toContain('ISO 5149');
  });
});

describe('ISO 5149 — metadata', () => {
  it('has correct id', () => {
    expect(iso5149RuleSet.id).toBe('iso5149');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/engine/__tests__/iso5149.test.ts`
Expected: FAIL

- [ ] **Step 3: Create `iso5149.ts`**

ISO 5149-3 is a simplified variant of EN 378. Key differences:
- `evaluateDetection`: always YES for A2/A2L/A3/B-group in occupied space (no charge threshold). For A1: uses `charge > RCL × volume` without the category a factor (/2).
- `getAlarmThresholds`: same as EN 378 (25%/50%/100% RCL for all groups).
- `getEmergencyVentilation`: uses EN 378 formula `0.14 × √m` (ISO doesn't prescribe its own).
- `getExtraRequirements`: empty (same as EN 378).
- `calculateThreshold`: same as EN 378.

Reuse the EN 378 path functions where possible (Table C.3, threshold calc, candidate zones). Override only `evaluateDetection`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/engine/__tests__/iso5149.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Run all engine tests**

Run: `npx vitest run src/lib/engine/__tests__/`
Expected: All tests PASS across all 4 test files

- [ ] **Step 6: Commit**

```bash
git add src/lib/rules/iso5149.ts src/lib/engine/__tests__/iso5149.test.ts
git commit -m "feat(engine): implement ISO 5149-3:2014 rule profile with tests"
```

---

### Task 9: UI — Add regulation selector to Step 2

**Files:**
- Modify: `src/components/configurator/types.ts`
- Modify: `src/components/configurator/StepGasApp.tsx`
- Modify: `src/components/configurator/i18n.ts`
- Modify: `src/app/configurator/page.tsx`

- [ ] **Step 1: Add `regulation` to `GasAppData`**

In `src/components/configurator/types.ts`, add to `GasAppData`:

```typescript
export interface GasAppData {
  regulation: 'en378' | 'ashrae15' | 'iso5149';  // NEW
  zoneType: string;
  selectedRefrigerant: string;
  selectedRange: string;
  sitePowerVoltage: '12V' | '24V' | '230V';
  zoneAtex: boolean;
  mountingType: string;
}
```

- [ ] **Step 2: Update default in `page.tsx`**

In `src/app/configurator/page.tsx`, update `defaultGasAppData`:

```typescript
const defaultGasAppData: GasAppData = {
  regulation: 'en378',  // NEW — default to EU standard
  zoneType: '',
  selectedRefrigerant: '',
  selectedRange: '',
  sitePowerVoltage: '24V',
  zoneAtex: false,
  mountingType: 'wall',
};
```

- [ ] **Step 3: Add regulation selector to StepGasApp**

At the top of the Gas Detection section in `StepGasApp.tsx`, add a regulation picker with 3 buttons (similar to the application buttons):

```tsx
{/* Regulation Standard */}
<div className="mb-6">
  <div className="text-sm font-semibold text-[#16354B] mb-2">
    {lang === 'fr' ? 'Norme réglementaire' : 'Regulation Standard'}
  </div>
  <div className="grid grid-cols-3 gap-3">
    {AVAILABLE_REGULATIONS.map(reg => (
      <button
        key={reg.id}
        type="button"
        onClick={() => onChange({ ...data, regulation: reg.id })}
        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
          data.regulation === reg.id
            ? 'border-[#E63946] bg-[#E63946]/5 shadow-md'
            : 'border-gray-200 hover:border-gray-400'
        }`}
      >
        <span className="text-xl">{reg.flag}</span>
        <span className="text-xs font-bold text-[#16354B]">{reg.name}</span>
        <span className="text-[10px] text-[#6b8da5]">{reg.region}</span>
      </button>
    ))}
  </div>
</div>
```

Import `AVAILABLE_REGULATIONS` from `@/lib/rules`.

- [ ] **Step 4: Update engine call in `page.tsx`**

In the `runCalculation` callback, use the selected regulation:

```typescript
import { getRuleSetSync } from '@/lib/rules';
import { evaluateAllZones } from '@/lib/engine/evaluate';

const runCalculation = useCallback(() => {
  if (!selectedRefrigerant || zones.length === 0) return null;
  const ruleSet = getRuleSetSync(gasAppData.regulation);
  // ... build inputs same as before ...
  try {
    return evaluateAllZones(ruleSet, inputs);
  } catch (err) {
    console.error('Engine error:', err);
    return null;
  }
}, [selectedRefrigerant, zones, gasAppData.regulation]);
```

- [ ] **Step 5: Verify it works in browser**

Run: `npm run dev`
Navigate to `http://localhost:3000/configurator` → Step 2 should show the 3 regulation buttons.

- [ ] **Step 6: Commit**

```bash
git add src/components/configurator/types.ts src/components/configurator/StepGasApp.tsx src/app/configurator/page.tsx
git commit -m "feat(ui): add regulation selector to configurator Step 2"
```

---

### Task 10: DB migration + Admin + API

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/app/api/calc-sheets/route.ts`
- Modify: `src/app/admin/calc-sheets/page.tsx`
- Modify: `src/components/configurator/StepCalcSheet.tsx`

- [ ] **Step 1: Add regulation to Prisma schema**

In `prisma/schema.prisma`, add to `CalcSheet`:

```prisma
model CalcSheet {
  id          String   @id @default(cuid())
  ref         String   @unique
  clientJson  String   @default("{}")
  gasAppJson  String   @default("{}")
  zonesJson   String   @default("[]")
  resultJson  String   @default("{}")
  createdAt   DateTime @default(now())
  status      String   @default("draft")
  regulation  String   @default("en378")
}
```

- [ ] **Step 2: Run migration**

```bash
cd "C:/1- Marwan/Claude/18- DetectCalc"
npx prisma db push
```

- [ ] **Step 3: Update StepCalcSheet save payload**

In `handleSave`, add regulation to `gasAppJson`:

```typescript
gasAppJson: {
  regulation: gasAppData.regulation,  // NEW
  applicationId: gasAppData.zoneType,
  // ... rest unchanged
},
```

And add `regulation: gasAppData.regulation` at top level of payload.

- [ ] **Step 4: Update API POST to save regulation**

In `src/app/api/calc-sheets/route.ts` POST handler, add:

```typescript
const sheet = await prisma.calcSheet.create({
  data: {
    ref,
    clientJson: normalize(clientJson, '{}'),
    gasAppJson: normalize(gasAppJson, '{}'),
    zonesJson: normalize(zonesJson, '[]'),
    resultJson: normalize(resultJson, '{}'),
    status: typeof status === 'string' ? status : 'draft',
    regulation: typeof regulation === 'string' ? regulation : 'en378',  // NEW
  },
});
```

Update GET to include regulation in summary.

- [ ] **Step 5: Update admin calc-sheets to show regulation**

Add a "Standard" column in the table after "Refrigerant":

```tsx
<th className="px-4 py-3">Standard</th>
// ...
<td className="px-4 py-3 text-xs font-mono">{s.regulation?.toUpperCase() || 'EN378'}</td>
```

- [ ] **Step 6: Update StepCalcSheet header to show regulation**

In the calc sheet header, show the selected regulation name instead of hardcoded "EN 378-3:2016".

- [ ] **Step 7: Verify full flow**

1. Open configurator → select ASHRAE 15 → fill form → generate sheet
2. Verify calc sheet shows "ASHRAE 15-2022" in header
3. Save → check admin shows regulation column
4. Download PDF → verify PDF header shows correct regulation

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma src/app/api/calc-sheets/route.ts src/app/admin/calc-sheets/page.tsx src/components/configurator/StepCalcSheet.tsx
git commit -m "feat: add regulation to DB, API, admin, and calc sheet display"
```

---

### Task 11: Final verification

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All engine tests pass (core, en378, ashrae15, iso5149)

- [ ] **Step 2: Test EN 378 regression**

Navigate to configurator → select EN 378 → Supermarket → R744 → 25kg → 200m² → Generate.
Verify: 4 detectors, RECOMMENDED, floor placement, ~20,000 ppm threshold.
This must match pre-refactoring behavior.

- [ ] **Step 3: Test ASHRAE 15 divergence**

Select ASHRAE 15 → R-32 → 7kg → 50m² office → Generate.
Verify: Detection = YES (exemption = 6.8kg < 7kg).
Compare: EN 378 would say RECOMMENDED for same inputs.

- [ ] **Step 4: Test ISO 5149 divergence**

Select ISO 5149 → R-290 (propane) → 0.5kg → small room → Generate.
Verify: Detection = YES (ISO 5149 always requires for A3).

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete multi-regulation engine — EN 378 + ASHRAE 15 + ISO 5149"
```
