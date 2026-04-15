/**
 * RefrigerantV5 seed data — extracted from DetectBuilder_V4D_Spec_V5.md Appendix A
 * Plus additional refrigerants from the simulator dropdown.
 *
 * Fields map to Prisma RefrigerantV5 model:
 *   id, name, safetyClass, toxicityClass, flammabilityClass,
 *   atelOdl, lfl, practicalLimit, vapourDensity, molecularMass,
 *   boilingPoint, gwp, gasGroup
 */

export interface SeedRefrigerantV5 {
  id: string;
  name: string;
  safetyClass: string;
  toxicityClass: string;
  flammabilityClass: string;
  atelOdl: number | null;
  lfl: number | null;
  practicalLimit: number;
  vapourDensity: number;
  molecularMass: number;
  boilingPoint: string | null;
  gwp: string | null;
  gasGroup: string;
}

export const REFRIGERANTS_V5: SeedRefrigerantV5[] = [
  // ── From Appendix A (EN 378-1 Annex E) ──
  { id: 'R22',      name: 'R-22 (HCFC-22)',       safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.21,    lfl: null,  practicalLimit: 0.21,  vapourDensity: 3.54, molecularMass: 86.5,  boilingPoint: '-40.8',  gwp: '1810',  gasGroup: 'HFC2' },
  { id: 'R32',      name: 'R-32',                  safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.30,    lfl: 0.307, practicalLimit: 0.061, vapourDensity: 2.13, molecularMass: 52,    boilingPoint: '-51.7',  gwp: '675',   gasGroup: 'HFC1' },
  { id: 'R134a',    name: 'R-134a',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.21,    lfl: null,  practicalLimit: 0.25,  vapourDensity: 4.17, molecularMass: 102,   boilingPoint: '-26.1',  gwp: '1430',  gasGroup: 'HFC2' },
  { id: 'R290',     name: 'R-290 (Propane)',       safetyClass: 'A3',  toxicityClass: 'A', flammabilityClass: '3',  atelOdl: 0.09,    lfl: 0.038, practicalLimit: 0.008, vapourDensity: 1.80, molecularMass: 44,    boilingPoint: '-42.1',  gwp: '3',     gasGroup: 'HC' },
  { id: 'R404A',    name: 'R-404A',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.52,    lfl: null,  practicalLimit: 0.52,  vapourDensity: 4.03, molecularMass: 97.6,  boilingPoint: '-46.2',  gwp: '3922',  gasGroup: 'HFC2' },
  { id: 'R407A',    name: 'R-407A',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.31,    lfl: null,  practicalLimit: 0.31,  vapourDensity: 3.65, molecularMass: 90.1,  boilingPoint: '-45.2',  gwp: '2107',  gasGroup: 'HFC1' },
  { id: 'R407C',    name: 'R-407C',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.27,    lfl: null,  practicalLimit: 0.27,  vapourDensity: 3.54, molecularMass: 86.2,  boilingPoint: '-43.6',  gwp: '1774',  gasGroup: 'HFC1' },
  { id: 'R407F',    name: 'R-407F',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.32,    lfl: null,  practicalLimit: 0.32,  vapourDensity: 3.75, molecularMass: 82.1,  boilingPoint: '-46.1',  gwp: '1825',  gasGroup: 'HFC1' },
  { id: 'R410A',    name: 'R-410A',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.42,    lfl: null,  practicalLimit: 0.42,  vapourDensity: 2.97, molecularMass: 72.6,  boilingPoint: '-51.6',  gwp: '2088',  gasGroup: 'HFC1' },
  { id: 'R448A',    name: 'R-448A',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.30,    lfl: null,  practicalLimit: 0.30,  vapourDensity: 3.98, molecularMass: 97.1,  boilingPoint: '-45.9',  gwp: '1387',  gasGroup: 'HFC1' },
  { id: 'R449A',    name: 'R-449A',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.43,    lfl: null,  practicalLimit: 0.43,  vapourDensity: 3.98, molecularMass: 97.3,  boilingPoint: '-46.0',  gwp: '1397',  gasGroup: 'HFC1' },
  { id: 'R450A',    name: 'R-450A',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.23,    lfl: null,  practicalLimit: 0.23,  vapourDensity: 4.45, molecularMass: 108.7, boilingPoint: '-23.4',  gwp: '605',   gasGroup: 'HFC2' },
  { id: 'R452A',    name: 'R-452A',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.33,    lfl: null,  practicalLimit: 0.33,  vapourDensity: 4.18, molecularMass: 103.5, boilingPoint: '-47.0',  gwp: '2141',  gasGroup: 'HFC1' },
  { id: 'R452B',    name: 'R-452B',                safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.31,    lfl: 0.286, practicalLimit: 0.063, vapourDensity: 2.69, molecularMass: 65.8,  boilingPoint: '-51.0',  gwp: '698',   gasGroup: 'HFC1' },
  { id: 'R454A',    name: 'R-454A',                safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.21,    lfl: 0.283, practicalLimit: 0.057, vapourDensity: 2.50, molecularMass: 61.3,  boilingPoint: '-49.0',  gwp: '239',   gasGroup: 'HFC1' },
  { id: 'R454B',    name: 'R-454B',                safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.32,    lfl: 0.298, practicalLimit: 0.059, vapourDensity: 2.39, molecularMass: 58.5,  boilingPoint: '-50.9',  gwp: '466',   gasGroup: 'HFC1' },
  { id: 'R454C',    name: 'R-454C',                safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.24,    lfl: 0.288, practicalLimit: 0.058, vapourDensity: 2.16, molecularMass: 53.0,  boilingPoint: '-51.4',  gwp: '148',   gasGroup: 'HFC1' },
  { id: 'R455A',    name: 'R-455A',                safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.26,    lfl: 0.314, practicalLimit: 0.063, vapourDensity: 3.04, molecularMass: 74.4,  boilingPoint: '-39.2',  gwp: '148',   gasGroup: 'HFC1' },
  { id: 'R464A',    name: 'R-464A',                safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.27,    lfl: 0.289, practicalLimit: 0.058, vapourDensity: 2.40, molecularMass: 58.7,  boilingPoint: '-50.0',  gwp: '286',   gasGroup: 'HFC1' },
  { id: 'R465A',    name: 'R-465A',                safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.28,    lfl: 0.294, practicalLimit: 0.059, vapourDensity: 2.54, molecularMass: 62.1,  boilingPoint: '-49.0',  gwp: '247',   gasGroup: 'HFC1' },
  { id: 'R466A',    name: 'R-466A',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.34,    lfl: null,  practicalLimit: 0.34,  vapourDensity: 3.07, molecularMass: 75.0,  boilingPoint: '-51.0',  gwp: '733',   gasGroup: 'HFC1' },
  { id: 'R468A',    name: 'R-468A',                safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.27,    lfl: 0.296, practicalLimit: 0.059, vapourDensity: 2.50, molecularMass: 61.0,  boilingPoint: '-50.0',  gwp: '296',   gasGroup: 'HFC1' },
  { id: 'R507A',    name: 'R-507A',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.53,    lfl: null,  practicalLimit: 0.53,  vapourDensity: 4.08, molecularMass: 98.9,  boilingPoint: '-46.7',  gwp: '3985',  gasGroup: 'HFC1' },
  { id: 'R513A',    name: 'R-513A',                safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.28,    lfl: null,  practicalLimit: 0.28,  vapourDensity: 4.64, molecularMass: 108.4, boilingPoint: '-29.2',  gwp: '631',   gasGroup: 'HFC2' },
  { id: 'R600a',    name: 'R-600a (Isobutane)',    safetyClass: 'A3',  toxicityClass: 'A', flammabilityClass: '3',  atelOdl: 0.0059,  lfl: 0.043, practicalLimit: 0.008, vapourDensity: 2.38, molecularMass: 58.1,  boilingPoint: '-11.7',  gwp: '3',     gasGroup: 'HC' },
  { id: 'R717',     name: 'R-717 (NH3)',           safetyClass: 'B2L', toxicityClass: 'B', flammabilityClass: '2L', atelOdl: 0.00022, lfl: 0.116, practicalLimit: 0.00035, vapourDensity: 0.70, molecularMass: 17,  boilingPoint: '-33.3',  gwp: '0',     gasGroup: 'NH3' },
  { id: 'R744',     name: 'R-744 (CO2)',           safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.072,   lfl: null,  practicalLimit: 0.072, vapourDensity: 1.80, molecularMass: 44,    boilingPoint: '-78.4',  gwp: '1',     gasGroup: 'CO2' },
  { id: 'R1234yf',  name: 'R-1234yf',             safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.47,    lfl: 0.289, practicalLimit: 0.058, vapourDensity: 4.66, molecularMass: 114,   boilingPoint: '-29.5',  gwp: '4',     gasGroup: 'HFC2' },
  { id: 'R1234ze',  name: 'R-1234ze(E)',          safetyClass: 'A2L', toxicityClass: 'A', flammabilityClass: '2L', atelOdl: 0.28,    lfl: 0.303, practicalLimit: 0.061, vapourDensity: 4.66, molecularMass: 114,   boilingPoint: '-19.0',  gwp: '7',     gasGroup: 'HFC2' },
  { id: 'R1233zd',  name: 'R-1233zd(E)',          safetyClass: 'A1',  toxicityClass: 'A', flammabilityClass: '1',  atelOdl: 0.10,    lfl: null,  practicalLimit: 0.10,  vapourDensity: 5.28, molecularMass: 130.5, boilingPoint: '18.3',   gwp: '7',     gasGroup: 'HFC2' },

  // ── Additional from simulator (HC group) ──
  { id: 'R50',      name: 'R-50 (Methane)',        safetyClass: 'A3',  toxicityClass: 'A', flammabilityClass: '3',  atelOdl: null,    lfl: 0.033, practicalLimit: 0.007, vapourDensity: 0.66, molecularMass: 16,    boilingPoint: '-161.5', gwp: '25',    gasGroup: 'HC' },
  { id: 'R1150',    name: 'R-1150 (Ethylene)',     safetyClass: 'A3',  toxicityClass: 'A', flammabilityClass: '3',  atelOdl: null,    lfl: 0.036, practicalLimit: 0.007, vapourDensity: 1.15, molecularMass: 28,    boilingPoint: '-103.7', gwp: '4',     gasGroup: 'HC' },
  { id: 'R1270',    name: 'R-1270 (Propylene)',    safetyClass: 'A3',  toxicityClass: 'A', flammabilityClass: '3',  atelOdl: null,    lfl: 0.047, practicalLimit: 0.008, vapourDensity: 1.72, molecularMass: 42,    boilingPoint: '-47.7',  gwp: '2',     gasGroup: 'HC' },

  // ── Non-refrigerant gases from simulator ──
  { id: 'CO',       name: 'CO (Carbon Monoxide)',  safetyClass: 'toxic', toxicityClass: 'toxic', flammabilityClass: 'flammable', atelOdl: null, lfl: null, practicalLimit: 0.03, vapourDensity: 1.15, molecularMass: 28, boilingPoint: '-191.5', gwp: null, gasGroup: 'CO' },
  { id: 'NO2',      name: 'NO2 (Nitrogen Dioxide)',safetyClass: 'toxic', toxicityClass: 'toxic', flammabilityClass: '0',        atelOdl: null, lfl: null, practicalLimit: 0.003, vapourDensity: 1.88, molecularMass: 46, boilingPoint: '21.2',   gwp: null, gasGroup: 'NO2' },
  { id: 'O2',       name: 'O2 (Oxygen)',           safetyClass: 'N/A',   toxicityClass: 'N/A',   flammabilityClass: 'N/A',      atelOdl: null, lfl: null, practicalLimit: 0,     vapourDensity: 1.31, molecularMass: 32, boilingPoint: '-183.0', gwp: null, gasGroup: 'O2' },
];
