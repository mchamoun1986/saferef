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
  it('floor for heavy (VD>1.5)', () => { expect(placementByDensity(1.52, 3).height).toBe('floor'); });
  it('ceiling for light (VD<0.8)', () => { expect(placementByDensity(0.59, 4).height).toBe('ceiling'); });
  it('breathing_zone for neutral', () => { expect(placementByDensity(1.03, 3).height).toBe('breathing_zone'); });
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
