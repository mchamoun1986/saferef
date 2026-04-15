/**
 * GasCategory seed data — maps to Prisma GasCategory model.
 * Covers all refrigerant groups and non-refrigerant gases used
 * across SAMON's detection product families.
 *
 * Gas groups align with refrigerants-v5.ts gasGroup values
 * and the product catalog detector compatibility.
 */

export interface SeedGasCategory {
  id: string;
  nameFr: string;
  nameEn: string;
  code: string;
  safetyClass: string;
  coverage: number;
  density: string;
  specs: string;
}

export const GAS_CATEGORIES: SeedGasCategory[] = [
  // ── HFC Group 1 — High-pressure HFC blends & singles ──
  {
    id: 'hfc1',
    nameFr: 'HFC Groupe 1 (haute pression)',
    nameEn: 'HFC Group 1 (high pressure)',
    code: 'HFC1',
    safetyClass: 'A1/A2L',
    coverage: 40,
    density: 'heavier',
    specs: JSON.stringify({
      refrigerants: ['R32', 'R407A', 'R407C', 'R407F', 'R410A', 'R448A', 'R449A', 'R452A', 'R452B', 'R454A', 'R454B', 'R454C', 'R455A', 'R464A', 'R465A', 'R466A', 'R468A', 'R507A'],
      detectionRange: '0-1000 ppm',
      typicalThresholds: { alarm1: '25% LFL or ATEL/ODL', alarm2: '50% LFL or 2x ATEL/ODL' },
      sensorTechnology: 'Infrared (NDIR)',
      sensorLifeYears: 10,
      applications: ['cold_rooms', 'supermarkets', 'machinery_rooms', 'HVAC', 'heat_pumps'],
      notes: 'Mix of A1 non-flammable and A2L mildly flammable. Trend toward low-GWP A2L replacements (R454B, R454C, R455A).'
    }),
  },

  // ── HFC Group 2 — Medium-pressure HFC & HFO blends ──
  {
    id: 'hfc2',
    nameFr: 'HFC Groupe 2 (moyenne pression)',
    nameEn: 'HFC Group 2 (medium pressure)',
    code: 'HFC2',
    safetyClass: 'A1/A2L',
    coverage: 35,
    density: 'heavier',
    specs: JSON.stringify({
      refrigerants: ['R134a', 'R404A', 'R450A', 'R513A', 'R1234yf', 'R1234ze', 'R1233zd'],
      detectionRange: '0-1000 ppm',
      typicalThresholds: { alarm1: 'ATEL/ODL', alarm2: '2x ATEL/ODL' },
      sensorTechnology: 'Infrared (NDIR)',
      sensorLifeYears: 10,
      applications: ['chillers', 'supermarkets', 'cold_rooms', 'automotive_AC', 'heat_pumps'],
      notes: 'Includes legacy R134a/R404A and next-gen HFO/HFC blends (R1234yf, R1234ze). R1233zd used in centrifugal chillers.'
    }),
  },

  // ── HC — Hydrocarbons (highly flammable) ──
  {
    id: 'hc',
    nameFr: 'Hydrocarbures (HC)',
    nameEn: 'Hydrocarbons (HC)',
    code: 'HC',
    safetyClass: 'A3',
    coverage: 25,
    density: 'heavier',
    specs: JSON.stringify({
      refrigerants: ['R290 (propane)', 'R600a (isobutane)', 'R1150 (ethylene)', 'R1270 (propylene)', 'R50 (methane)'],
      detectionRange: '0-100% LEL (0-50000 ppm typical)',
      typicalThresholds: { alarm1: '20% LEL', alarm2: '40% LEL' },
      sensorTechnology: 'Catalytic bead / Infrared (NDIR)',
      sensorLifeYears: 5,
      applications: ['small_commercial', 'domestic_refrigeration', 'heat_pumps', 'industrial_process'],
      notes: 'Highly flammable (A3). R50 (methane) is lighter than air — install detectors at ceiling. All others heavier than air — install at floor level. EN 378 charge limits apply.',
      exception: 'R50 (methane) density is lighter than air (vapour density 0.66)'
    }),
  },

  // ── NH3 — Ammonia ──
  {
    id: 'nh3',
    nameFr: 'Ammoniac (NH3)',
    nameEn: 'Ammonia (NH3)',
    code: 'NH3',
    safetyClass: 'B2L',
    coverage: 15,
    density: 'lighter',
    specs: JSON.stringify({
      refrigerants: ['R717 (NH3)'],
      detectionRange: '0-1000 ppm (toxic) / 0-30000 ppm (LEL)',
      typicalThresholds: { alarm1: '25 ppm (TWA)', alarm2: '300 ppm (IDLH)', alarm3: '15% LEL' },
      sensorTechnology: 'Electrochemical (toxic range) / Catalytic or NDIR (LEL range)',
      sensorLifeYears: 3,
      applications: ['industrial_refrigeration', 'cold_storage', 'machinery_rooms', 'food_processing', 'ice_rinks'],
      notes: 'Toxic (B class) and mildly flammable (2L). Lighter than air — detectors mounted at ceiling level. Strong odour at low ppm. SAMON GS product family with electrochemical sensors.'
    }),
  },

  // ── CO2 — Carbon Dioxide ──
  {
    id: 'co2',
    nameFr: 'Dioxyde de carbone (CO2)',
    nameEn: 'Carbon Dioxide (CO2)',
    code: 'CO2',
    safetyClass: 'A1',
    coverage: 20,
    density: 'heavier',
    specs: JSON.stringify({
      refrigerants: ['R744 (CO2)'],
      detectionRange: '0-5000 ppm (comfort) / 0-50000 ppm (safety)',
      typicalThresholds: { alarm1: '5000 ppm (0.5% TWA)', alarm2: '30000 ppm (3% STEL)', alarm3: '40000 ppm (4% IDLH)' },
      sensorTechnology: 'Infrared (NDIR) — dual wavelength',
      sensorLifeYears: 10,
      applications: ['supermarkets', 'cold_rooms', 'machinery_rooms', 'food_processing', 'transcritical_systems'],
      notes: 'Non-flammable, non-toxic but asphyxiant at high concentrations. Heavier than air — risk accumulation in pits and below-ground areas. Increasingly used in transcritical CO2 systems. SAMON MIDI/GS families.'
    }),
  },

  // ── CO — Carbon Monoxide ──
  {
    id: 'co',
    nameFr: 'Monoxyde de carbone (CO)',
    nameEn: 'Carbon Monoxide (CO)',
    code: 'CO',
    safetyClass: 'toxic',
    coverage: 10,
    density: 'lighter',
    specs: JSON.stringify({
      detectionRange: '0-300 ppm',
      typicalThresholds: { alarm1: '30 ppm (8h TWA)', alarm2: '60 ppm (15min STEL)', alarm3: '200 ppm (ceiling)' },
      sensorTechnology: 'Electrochemical',
      sensorLifeYears: 3,
      applications: ['parking_garages', 'tunnels', 'loading_docks', 'boiler_rooms'],
      norms: ['EN 50545-1', 'EN 50271'],
      notes: 'Toxic, colourless, odourless. Slightly lighter than air — mixes easily. Primary application is vehicle exhaust monitoring in enclosed parking. Often paired with NO2 detection.'
    }),
  },

  // ── NO2 — Nitrogen Dioxide ──
  {
    id: 'no2',
    nameFr: 'Dioxyde d\'azote (NO2)',
    nameEn: 'Nitrogen Dioxide (NO2)',
    code: 'NO2',
    safetyClass: 'toxic',
    coverage: 10,
    density: 'heavier',
    specs: JSON.stringify({
      detectionRange: '0-10 ppm',
      typicalThresholds: { alarm1: '1 ppm (TWA)', alarm2: '3 ppm (STEL)', alarm3: '5 ppm (ceiling)' },
      sensorTechnology: 'Electrochemical',
      sensorLifeYears: 3,
      applications: ['parking_garages', 'tunnels', 'loading_docks'],
      norms: ['EN 50545-1', 'EN 50271'],
      notes: 'Toxic, reddish-brown gas from diesel exhaust. Heavier than air — detectors at breathing zone height (1.5m). Mandatory in enclosed parking garages per EN 50545-1. Often paired with CO detection.'
    }),
  },

  // ── O2 — Oxygen depletion ──
  {
    id: 'o2',
    nameFr: 'Oxygène (O2) — appauvrissement',
    nameEn: 'Oxygen (O2) — depletion',
    code: 'O2',
    safetyClass: 'N/A',
    coverage: 10,
    density: 'heavier',
    specs: JSON.stringify({
      detectionRange: '0-25% vol',
      typicalThresholds: { alarm1: '19.5% vol (low O2)', alarm2: '23.5% vol (high O2)' },
      sensorTechnology: 'Electrochemical (galvanic cell)',
      sensorLifeYears: 2,
      applications: ['machinery_rooms', 'cold_rooms', 'confined_spaces', 'laboratories'],
      notes: 'Monitors oxygen depletion caused by refrigerant leaks displacing air. Normal atmospheric O2 is 20.9%. Below 19.5% is dangerous. Required in enclosed spaces where large refrigerant charges could displace breathable air. Often combined with refrigerant detection.'
    }),
  },

  // ── NH3W — Ammonia in water/brine (Aquis systems) ──
  {
    id: 'nh3w',
    nameFr: 'Ammoniac dans eau/saumure (Aquis)',
    nameEn: 'Ammonia in water/brine (Aquis)',
    code: 'NH3W',
    safetyClass: 'B2L',
    coverage: 5,
    density: 'lighter',
    specs: JSON.stringify({
      refrigerants: ['R717 (NH3) in secondary loop'],
      detectionRange: '0-100 ppm (dissolved) / 0-1000 ppm (air)',
      typicalThresholds: { alarm1: '5 ppm (water)', alarm2: '25 ppm (air breakout)' },
      sensorTechnology: 'Electrochemical / Conductivity (water-side)',
      sensorLifeYears: 3,
      applications: ['ice_rinks', 'food_processing', 'district_cooling', 'secondary_loop_systems'],
      notes: 'SAMON Aquis product family. Detects NH3 contamination in secondary coolant circuits (water, glycol, brine). Critical for ice rinks and food processing where ammonia leaking into secondary loop could reach occupied spaces. Dual monitoring: water-side conductivity + air-side electrochemical.'
    }),
  },
];
