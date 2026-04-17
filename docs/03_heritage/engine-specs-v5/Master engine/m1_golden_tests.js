// ============================================================
// SAMON DetectBuilder — M1 Golden Tests V5
// 5 reference scenarios validated against V4-D spec worked examples
// Run: node m1_golden_tests.js
// ============================================================

const { runM1 } = require('./m1_engine.js');

let passed = 0, failed = 0;

function assert(testName, actual, expected, field) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.log(`  FAIL [${testName}] ${field}: got "${actual}", expected "${expected}"`);
  }
}

function runTest(name, input, expected) {
  console.log(`\n--- ${name} ---`);
  const result = runM1(input);

  assert(name, result.detection_required, expected.detection_required, 'detection_required');
  if (expected.min_detectors !== undefined) assert(name, result.min_detectors, expected.min_detectors, 'min_detectors');
  if (expected.recommended_detectors !== undefined) assert(name, result.recommended_detectors, expected.recommended_detectors, 'recommended_detectors');
  if (expected.placement_height !== undefined) assert(name, result.placement_height, expected.placement_height, 'placement_height');
  if (expected.threshold_ppm !== undefined) assert(name, result.threshold_ppm, expected.threshold_ppm, 'threshold_ppm');
  if (expected.threshold_basis !== undefined) assert(name, result.threshold_basis, expected.threshold_basis, 'threshold_basis');
  if (expected.stage2_threshold_ppm !== undefined) assert(name, result.stage2_threshold_ppm, expected.stage2_threshold_ppm, 'stage2_threshold_ppm');
  if (expected.governing_hazard !== undefined) assert(name, result.governing_hazard, expected.governing_hazard, 'governing_hazard');

  // Show summary
  console.log(`  detection_required: ${result.detection_required}`);
  console.log(`  detectors: min=${result.min_detectors}, rec=${result.recommended_detectors}`);
  console.log(`  placement: ${result.placement_height} (${result.placement_height_m})`);
  console.log(`  threshold: ${result.threshold_ppm} ppm (${result.threshold_basis})`);
  if (result.stage2_threshold_ppm) console.log(`  stage2: ${result.stage2_threshold_ppm} ppm`);
  console.log(`  hazard: ${result.governing_hazard}`);
  console.log(`  concentration: ${result.calculation_summary.concentration_kg_m3.toFixed(4)} kg/m³ = ${result.calculation_summary.concentration_ppm} ppm`);
  if (result.review_flags.length) console.log(`  flags: ${result.review_flags.join(', ')}`);
  console.log(`  trace steps: ${result.trace.length}`);
}

// ============================================================
// TEST 1: R-32 Office — C.3 path, conc < QLMV → NO
// Spec example 11.1: 8kg / 150m³ = 0.0533 < QLMV 0.063
// ============================================================
runTest('TEST 1: R-32 Office (conc < QLMV → NO)', {
  refrigerant: 'R-32',
  refrigerant_charge: 8,
  room_area: 60,
  room_height: 2.5,
  room_volume: 150,
  access_category: 'b',
  location_class: 'II',
  below_ground: false,
  is_machinery_room: false,
  is_occupied_space: true,
  human_comfort: true,
  c3_applicable: true,
  mechanical_ventilation_present: false
}, {
  detection_required: 'NO',
  min_detectors: 0,
  recommended_detectors: 0,
  placement_height: 'floor',    // vd=2.13 > 1.77
  threshold_ppm: 36087,         // floor(25% LFL) = floor((24.45*0.307*0.25*1e6)/52) = 36087
  threshold_basis: '25%_LFL',
  governing_hazard: 'FLAMMABILITY'
});

// ============================================================
// TEST 2: R-290 Shop — C.3 NOT applicable (A3), all paths NO
// Spec example 11.2: A3 not eligible for C.3
// ============================================================
runTest('TEST 2: R-290 Shop (A3, no C.3 → NO)', {
  refrigerant: 'R-290',
  refrigerant_charge: 2,
  room_area: 40,
  room_height: 2.8,
  room_volume: 112,
  access_category: 'a',
  location_class: 'I',
  below_ground: false,
  is_machinery_room: false,
  is_occupied_space: true,
  human_comfort: false,
  c3_applicable: false,
  mechanical_ventilation_present: false
}, {
  detection_required: 'NO',
  min_detectors: 0,
  recommended_detectors: 0,
  placement_height: 'floor',    // vd=1.80 > 1.77
  threshold_ppm: 5278,          // floor(25% LFL) = floor((24.45*0.038*0.25*1e6)/44) = 5278 (IEEE 754)
  threshold_basis: '25%_LFL',
  governing_hazard: 'FLAMMABILITY'
});

// ============================================================
// TEST 3: R-717 Machinery Room — YES + two-level alarm
// Spec example 11.3: MR + R-717 200kg > 50kg
// ============================================================
runTest('TEST 3: R-717 MR 200kg (YES + two-level)', {
  refrigerant: 'R-717',
  refrigerant_charge: 200,
  room_area: 80,
  room_height: 3.5,
  room_volume: 280,
  access_category: 'c',
  location_class: 'III',
  below_ground: false,
  is_machinery_room: true,
  is_occupied_space: false,
  human_comfort: false,
  c3_applicable: false,
  mechanical_ventilation_present: false
}, {
  detection_required: 'YES',
  min_detectors: 1,
  recommended_detectors: 1,    // 80m² < 100 → rec=1
  placement_height: 'ceiling',  // vd=0.70 < 0.944
  threshold_ppm: 500,           // NH3 two-level
  threshold_basis: 'NH3_500',
  stage2_threshold_ppm: 30000,
  governing_hazard: 'BOTH'      // B2L = tox B + flam 2L
});

// ============================================================
// TEST 4: R-744 Machinery Room — YES (MR mandatory)
// Spec example 11.4: MR 120kg, threshold = 50% ATEL
// ============================================================
runTest('TEST 4: R-744 MR 120kg (YES, 50% ATEL)', {
  refrigerant: 'R-744',
  refrigerant_charge: 120,
  room_area: 50,
  room_height: 3.0,
  room_volume: 150,
  access_category: 'c',
  location_class: 'III',
  below_ground: false,
  is_machinery_room: true,
  is_occupied_space: false,
  human_comfort: false,
  c3_applicable: false,
  mechanical_ventilation_present: false
}, {
  detection_required: 'YES',
  min_detectors: 1,
  recommended_detectors: 1,
  placement_height: 'floor',     // vd=1.80 > 1.77 (marginal)
  threshold_ppm: 20004,          // floor((24.45*0.072*1e6)/44 * 0.5) = floor(40009.09*0.5) = 20004 (IEEE 754)
  threshold_basis: '50%_ATEL_ODL',
  governing_hazard: 'NONE'       // A1 = tox A + flam 1
});

// ============================================================
// TEST 5: R-1234yf Retail — C.3, conc < QLMV → NO
// Spec example 11.5: 25kg / 600m³ = 0.0417 < QLMV 0.060
// ============================================================
runTest('TEST 5: R-1234yf Retail (conc < QLMV → NO)', {
  refrigerant: 'R-1234yf',
  refrigerant_charge: 25,
  room_area: 200,
  room_height: 3.0,
  room_volume: 600,
  access_category: 'a',
  location_class: 'II',
  below_ground: false,
  is_machinery_room: false,
  is_occupied_space: true,
  human_comfort: true,
  c3_applicable: true,
  mechanical_ventilation_present: false
}, {
  detection_required: 'NO',
  min_detectors: 0,
  recommended_detectors: 0,
  placement_height: 'floor',    // vd=4.66 >> 1.77
  threshold_ppm: 15495,         // floor(25% LFL) = floor((24.45*0.289*0.25*1e6)/114) = 15495 (IEEE 754)
  threshold_basis: '25%_LFL',
  governing_hazard: 'FLAMMABILITY'
});

// ============================================================
// SUMMARY
// ============================================================
console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} assertions`);
console.log('========================================');

if (failed > 0) process.exit(1);
