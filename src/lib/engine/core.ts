// engine/core.ts — Shared physics and utility functions
// Extracted from m1-engine.ts for use across all regulation rule sets.

// ── Constants ──────────────────────────────────────────────────────────
export const AIR_DENSITY_25C = 1.18; // kg/m³ at 25°C
export const MOLAR_VOLUME = 24.45;   // L/mol at 25°C, 101.3 kPa

// ── ID Normalization ───────────────────────────────────────────────────

/** Normalize refrigerant ID: R744 → R-744, R134a → R-134a, R1234yf → R-1234yf */
export function normalizeRefId(id: string): string {
  if (id.startsWith('R-')) return id;
  if (!id.startsWith('R') || id.length < 3) return id;
  return 'R-' + id.slice(1);
}

// ── Unit Conversions ───────────────────────────────────────────────────

/** CALC-003: concentration in kg/m³ from charge and volume */
export function concentrationKgM3(charge: number, volume: number): number {
  if (volume <= 0) return 0;
  return charge / volume;
}

/** CALC-001: convert kg/m³ to ppm at standard conditions */
export function kgM3ToPpm(cKg: number, molecularMass: number): number {
  return (MOLAR_VOLUME * cKg * 1e6) / molecularMass;
}

/** CALC-002: convert ppm to kg/m³ at standard conditions */
export function ppmToKgM3(cPpm: number, molecularMass: number): number {
  return (molecularMass * cPpm) / (MOLAR_VOLUME * 1e6);
}

// ── Charge Cap Factors ─────────────────────────────────────────────────

/**
 * CALC-005/006/007: charge limits from LFL and room volume.
 * EN 378-1:2016 Annex C — qm_max = f × Vroom
 * m1 = 4 × LFL × volume (kg) — no additional measures
 * m2 = 26 × LFL × volume (kg) — one protective measure
 * m3 = 130 × LFL × volume (kg) — two protective measures
 */
export function calcM1M2M3(lfl: number, volume: number = 1): { m1: number; m2: number; m3: number } {
  return {
    m1: 4 * lfl * volume,
    m2: 26 * lfl * volume,
    m3: 130 * lfl * volume,
  };
}

// ── Safety Classification Helpers ──────────────────────────────────────

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

// ── Placement Engine ───────────────────────────────────────────────────

export interface PlacementResult {
  height: 'floor' | 'ceiling' | 'breathing_zone';
  heightM: string;
}

/**
 * PLC-HGT-001 through PLC-HGT-004:
 * Compare vapour density to air density thresholds.
 */
export function placementByDensity(
  vapourDensity: number,
  roomHeight: number,
): PlacementResult {
  // PLC-HGT-002: heavier than air → floor (EN 378-3:2016 §6.3: <= 300 mm from floor)
  if (vapourDensity >= 1.0) {
    return { height: 'floor', heightM: '0-0.3 m' };
  }

  // PLC-HGT-003: lighter than air → ceiling (EN 378-3:2016 §6.3: <= 300 mm from ceiling)
  if (vapourDensity < 1.0) {
    const ceilingHeight = roomHeight >= 0.5 ? Math.max(roomHeight - 0.3, 0.5) : roomHeight;
    return {
      height: 'ceiling',
      heightM: `${ceilingHeight.toFixed(1)} m (ceiling minus 0.3 m)`,
    };
  }

  // PLC-HGT-004: near-neutral buoyancy
  return { height: 'breathing_zone', heightM: '1.2-1.8 m' };
}

// ── Quantity Calculations ──────────────────────────────────────────────

/** QTY-REC-001: 1 detector per 50 m² (area-based fallback) */
export function areaBasedQuantity(area: number, m2PerDetector: number = 50): number {
  return Math.max(1, Math.ceil(area / m2PerDetector));
}

// ── Source Clustering ──────────────────────────────────────────────────

/**
 * Cluster sources by proximity: sources within maxDistanceM
 * of each other form one cluster. Uses union-find for efficiency.
 */
export function computeSourceClusters(
  sources: { id: string; x?: number; y?: number }[],
  roomLengthM: number,
  roomWidthM: number,
  maxDistanceM: number = 7,
): number {
  const positioned = sources.filter(s => s.x !== undefined && s.y !== undefined);
  if (positioned.length === 0) return 0;
  if (positioned.length === 1) return 1;

  // Union-Find
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id);
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    // Path compression
    let curr = id;
    while (curr !== root) { const next = parent.get(curr)!; parent.set(curr, root); curr = next; }
    return root;
  };
  const union = (a: string, b: string) => { parent.set(find(a), find(b)); };

  // Initialize
  for (const s of positioned) find(s.id);

  // Merge sources within maxDistanceM of each other
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

  // Count unique clusters
  const roots = new Set(positioned.map(s => find(s.id)));
  return roots.size;
}
