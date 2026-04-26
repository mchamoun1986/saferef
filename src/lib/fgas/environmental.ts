import type { EnvironmentalEquivalent } from './types';

const CO2_PER_CAR_YEAR = 4.6;
const CO2_PER_FLIGHT_PARIS_NY = 1.75;
const CO2_PER_TREE_YEAR = 0.022;

export function co2eqToEquivalents(co2eqTonnes: number): EnvironmentalEquivalent {
  return {
    carsPerYear: Math.round(co2eqTonnes / CO2_PER_CAR_YEAR * 10) / 10,
    flightsParisNY: Math.round(co2eqTonnes / CO2_PER_FLIGHT_PARIS_NY * 10) / 10,
    treesToOffset: Math.round(co2eqTonnes / CO2_PER_TREE_YEAR),
  };
}
