// relation-types.ts — ProductRelation types and query utilities for M2 engine

export type RelationType =
  | 'requires_base'
  | 'compatible_controller'
  | 'required_accessory'
  | 'alert_device'
  | 'suggested_accessory';

export interface ProductRelation {
  id: string;
  fromCode: string;
  toCode: string;
  type: RelationType;
  mandatory: boolean;
  qtyRule: string;
  condition: string | null;
  reason: string | null;
  priority: number;
}

/**
 * Check if a condition string matches the current context.
 * Condition format: "key:value" e.g. "voltage:230V", "mount:duct", "atex:false"
 * null condition = always applies.
 */
export function conditionMatches(
  condition: string | null,
  context: { voltage?: string; mount?: string; atex?: boolean },
): boolean {
  if (!condition) return true;
  const [key, value] = condition.split(':');
  switch (key) {
    case 'voltage': return context.voltage === value;
    case 'mount': return context.mount === value;
    case 'atex': return String(context.atex ?? false) === value;
    default: return true;
  }
}

/**
 * Calculate quantity based on qtyRule.
 */
export function calculateQty(
  qtyRule: string,
  counts: { detectors: number; controllers: number },
): number {
  switch (qtyRule) {
    case '1:1': return counts.detectors;
    case 'per_detector': return counts.detectors;
    case 'per_controller': return Math.max(1, counts.controllers);
    case 'per_project': return 1;
    case 'ceil_n_5': return Math.ceil(counts.detectors / 5);
    default: return 1;
  }
}

/**
 * Filter relations by type and fromCode.
 */
export function getRelationsFor(
  relations: ProductRelation[],
  fromCode: string,
  type: RelationType,
): ProductRelation[] {
  return relations
    .filter(r => r.fromCode === fromCode && r.type === type)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Get all compatible controller codes for a detector.
 * Includes both requires_base and compatible_controller.
 */
export function getCompatibleControllerCodes(
  relations: ProductRelation[],
  detectorCode: string,
): { baseCodes: string[]; controllerCodes: string[] } {
  const bases = relations
    .filter(r => r.fromCode === detectorCode && r.type === 'requires_base')
    .map(r => r.toCode);
  const controllers = relations
    .filter(r => r.fromCode === detectorCode && r.type === 'compatible_controller')
    .map(r => r.toCode);
  return { baseCodes: bases, controllerCodes: controllers };
}
