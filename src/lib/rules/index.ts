// rules/index.ts — Regulation registry

import type { RuleSet } from '../engine/rule-set';
import type { RegulationId } from '../engine/types';
import { en378RuleSet } from './en378';
import { ashrae15RuleSet } from './ashrae15';
import { iso5149RuleSet } from './iso5149';

export function getRuleSetSync(id: RegulationId): RuleSet {
  switch (id) {
    case 'en378': return en378RuleSet;
    case 'ashrae15': return ashrae15RuleSet;
    case 'iso5149': return iso5149RuleSet;
    default: throw new Error(`Unknown regulation: ${id}`);
  }
}

export const AVAILABLE_REGULATIONS: { id: RegulationId; name: string; region: string; flag: string }[] = [
  { id: 'en378', name: 'EN 378-3:2016', region: 'EU', flag: '\u{1F1EA}\u{1F1FA}' },
  { id: 'ashrae15', name: 'ASHRAE 15-2022', region: 'US / International', flag: '\u{1F1FA}\u{1F1F8}' },
  { id: 'iso5149', name: 'ISO 5149-3:2014', region: 'International', flag: '\u{1F30D}' },
];
