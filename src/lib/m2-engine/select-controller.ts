import type { ProductRecord } from './types';
import type { ProductEntry } from '../engine-types';
import type { ProductRelation } from './relation-types';
import { getRelationsFor } from './relation-types';

// ─── Voltage helpers ────────────────────────────────────────────────────────

function ctrlVoltageOk(ctrlVoltage: string | null, siteVoltage: string): boolean {
  if (!ctrlVoltage) return false;
  const cv = ctrlVoltage.toLowerCase();
  if (siteVoltage === '230V') return cv.includes('230') || cv.includes('240') || cv.includes('100-240');
  if (siteVoltage === '24V') return cv.includes('24');
  if (siteVoltage === '12V') return cv.includes('12') || cv.includes('24');
  return false;
}

// ctrlVoltageOk is reused for both ProductRecord and ProductEntry types

// ─── Legacy export (backwards compat — used by standalone selector + tests) ─

export function selectController(
  totalDetectors: number,
  siteVoltage: string,
  products: ProductRecord[],
): ProductRecord | null {
  if (totalDetectors <= 0) return null;

  const candidates = products
    .filter((p) => {
      if (p.type !== 'controller') return false;
      if (p.discontinued) return false;
      if (p.channels === null || p.channels < totalDetectors) return false;
      if (!ctrlVoltageOk(p.voltage, siteVoltage)) return false;
      return true;
    })
    .sort((a, b) => {
      const chDiff = (a.channels ?? 0) - (b.channels ?? 0);
      if (chDiff !== 0) return chDiff;
      return a.price - b.price;
    });

  return candidates[0] ?? null;
}

// ─── Relation-based controller selection ────────────────────────────────────

export interface ControllerFromRelationsResult {
  base: ProductEntry | null;
  baseQty: number;
  controller: ProductEntry | null;
  controllerQty: number;
}

/**
 * Select base unit + optional centralized controller using ProductRelation data.
 *
 * - `requires_base`: e.g. X5 sensor → X5 transmitter. Qty = ceil(totalDetectors / base.channels).
 * - `compatible_controller`: optional centralized controller. Picks smallest sufficient by channels,
 *   voltage-compatible, cheapest if tied.
 */
export function selectControllerFromRelations(
  detector: ProductEntry,
  totalDetectors: number,
  siteVoltage: string,
  allControllers: ProductEntry[],
  relations: ProductRelation[],
): ControllerFromRelationsResult {
  const result: ControllerFromRelationsResult = {
    base: null, baseQty: 0,
    controller: null, controllerQty: 0,
  };

  if (totalDetectors <= 0) return result;

  // 1. Find required base units (requires_base)
  const baseRelations = getRelationsFor(relations, detector.code, 'requires_base');
  if (baseRelations.length > 0) {
    // Pick the first matching base (sorted by priority already)
    for (const rel of baseRelations) {
      const baseProduct = allControllers.find(c => c.code === rel.toCode && !c.discontinued);
      if (baseProduct) {
        // Qty: ceil(detectors / channels) — channels = how many sensors one base supports
        const channels = baseProduct.channels ?? 1;
        const qty = Math.ceil(totalDetectors / channels);
        result.base = baseProduct;
        result.baseQty = qty;
        break;
      }
    }
  }

  // 2. Find optional centralized controller (compatible_controller)
  const ctrlRelations = getRelationsFor(relations, detector.code, 'compatible_controller');
  if (ctrlRelations.length > 0) {
    const compatCodes = new Set(ctrlRelations.map(r => r.toCode));

    // Filter controllers: must be in relations, voltage-compatible, has channels
    const candidates = allControllers
      .filter(c => {
        if (!compatCodes.has(c.code)) return false;
        if (c.discontinued) return false;
        if (c.channels === null || c.channels <= 0) return false;
        if (!ctrlVoltageOk(c.voltage, siteVoltage)) return false;
        return true;
      })
      .sort((a, b) => {
        // Fewest controllers needed (most channels), then cheapest
        const aQty = Math.ceil(totalDetectors / (a.channels ?? 1));
        const bQty = Math.ceil(totalDetectors / (b.channels ?? 1));
        if (aQty !== bQty) return aQty - bQty;
        return a.price - b.price;
      });

    if (candidates.length > 0) {
      const ctrl = candidates[0];
      const qty = Math.ceil(totalDetectors / (ctrl.channels ?? 1));
      result.controller = ctrl;
      result.controllerQty = qty;
    }
  }

  return result;
}
