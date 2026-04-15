// rules/index.ts — Regulation registry
// Lazy-loads rule sets to avoid circular imports and bundle bloat.

import type { RuleSet } from '../engine/rule-set';
import type { RegulationId } from '../engine/types';

export function getRuleSetSync(id: RegulationId): RuleSet {
  switch (id) {
    case 'en378': return require('./en378').en378RuleSet;
    case 'ashrae15': return require('./ashrae15').ashrae15RuleSet;
    case 'iso5149': return require('./iso5149').iso5149RuleSet;
    default: throw new Error(`Unknown regulation: ${id}`);
  }
}

export const AVAILABLE_REGULATIONS: { id: RegulationId; name: string; region: string; flag: string }[] = [
  { id: 'en378', name: 'EN 378-3:2016', region: 'EU', flag: '\u{1F1EA}\u{1F1FA}' },
  { id: 'ashrae15', name: 'ASHRAE 15-2022', region: 'US / International', flag: '\u{1F1FA}\u{1F1F8}' },
  { id: 'iso5149', name: 'ISO 5149-3:2014', region: 'International', flag: '\u{1F30D}' },
];
