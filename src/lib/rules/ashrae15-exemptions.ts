// rules/ashrae15-exemptions.ts — ASHRAE 15 Table 1 exemption quantities (kg)
// If charge <= exemption quantity, detection is not normatively required.

import { normalizeRefId } from '../engine/core';

const TABLE_1: Record<string, number> = {
  'R-22': 11.3, 'R-32': 6.8, 'R-123': 2.3, 'R-134a': 11.3,
  'R-152a': 1.0, 'R-290': 1.0, 'R-404A': 11.3, 'R-407A': 11.3,
  'R-407C': 11.3, 'R-407F': 11.3, 'R-410A': 11.3, 'R-448A': 11.3,
  'R-449A': 11.3, 'R-450A': 11.3, 'R-452A': 11.3, 'R-452B': 6.8,
  'R-454A': 6.8, 'R-454B': 6.8, 'R-454C': 6.8, 'R-455A': 6.8,
  'R-464A': 6.8, 'R-465A': 6.8, 'R-466A': 11.3, 'R-468A': 6.8,
  'R-507A': 11.3, 'R-513A': 11.3, 'R-600a': 0.5,
  'R-717': 0,  // NH3 — always required
  'R-744': 45, 'R-1150': 0.5, 'R-1234yf': 6.8, 'R-1234ze': 6.8,
  'R-1233zd': 6.8, 'R-1270': 0.5, 'R-50': 0.5,
};

export function getAshrae15Exemption(refrigerantId: string): number {
  return TABLE_1[normalizeRefId(refrigerantId)] ?? 0;
}
