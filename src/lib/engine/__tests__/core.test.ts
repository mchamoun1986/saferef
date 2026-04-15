import { describe, it, expect } from 'vitest';
import { concentrationKgM3, kgM3ToPpm, ppmToKgM3, placementByDensity, areaBasedQuantity, normalizeRefId, isFlammable } from '../core';

describe('concentrationKgM3', () => {
  it('calculates charge/volume ratio', () => { expect(concentrationKgM3(25, 700)).toBeCloseTo(0.03571, 4); });
  it('returns 0 for zero volume', () => { expect(concentrationKgM3(10, 0)).toBe(0); });
});

describe('kgM3ToPpm', () => {
  it('converts R-744 RCL to ppm', () => { expect(kgM3ToPpm(0.072, 44.01)).toBeCloseTo(40004, -1); });
});

describe('ppmToKgM3', () => {
  it('is inverse of kgM3ToPpm', () => {
    const ppm = kgM3ToPpm(0.072, 44.01);
    expect(ppmToKgM3(ppm, 44.01)).toBeCloseTo(0.072, 5);
  });
});

describe('placementByDensity', () => {
  it('floor for heavier than air (VD>=1.0)', () => { expect(placementByDensity(1.52, 3).height).toBe('floor'); });
  it('floor for R-32 (VD=1.06, heavier than air)', () => { expect(placementByDensity(1.06, 3).height).toBe('floor'); });
  it('floor for VD exactly 1.0', () => { expect(placementByDensity(1.0, 3).height).toBe('floor'); });
  it('ceiling for light (VD<1.0)', () => { expect(placementByDensity(0.59, 4).height).toBe('ceiling'); });
  it('ceiling for VD=0.99', () => { expect(placementByDensity(0.99, 3).height).toBe('ceiling'); });
  it('floor height is 0-0.3 m per EN 378-3 §6.3', () => { expect(placementByDensity(1.52, 3).heightM).toBe('0-0.3 m'); });
});

describe('areaBasedQuantity', () => {
  it('returns ceil(area/50)', () => {
    expect(areaBasedQuantity(200)).toBe(4);
    expect(areaBasedQuantity(50)).toBe(1);
    expect(areaBasedQuantity(10)).toBe(1);
  });
});

describe('normalizeRefId', () => {
  it('R744 → R-744', () => { expect(normalizeRefId('R744')).toBe('R-744'); });
  it('keeps R-744', () => { expect(normalizeRefId('R-744')).toBe('R-744'); });
});

describe('isFlammable', () => {
  it('true for 2L, 3', () => { expect(isFlammable('2L')).toBe(true); expect(isFlammable('3')).toBe(true); });
  it('false for 1', () => { expect(isFlammable('1')).toBe(false); });
});
