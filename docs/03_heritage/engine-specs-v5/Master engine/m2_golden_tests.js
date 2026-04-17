// ============================================================
// SAMON DetectBuilder — M2 Golden Tests
// Run: node m2_golden_tests.js
// ============================================================

const { runM2, PRODUCTS } = require('./m2_engine.js');

let passed = 0;
let failed = 0;

function assert(condition, testName, detail) {
  if (condition) {
    console.log(`  PASS: ${testName}`);
    passed++;
  } else {
    console.log(`  FAIL: ${testName} — ${detail || ''}`);
    failed++;
  }
}

function printTierSummary(result) {
  result.tiers.forEach(t => {
    console.log(`    ${t.tier}: ${t.product.id} (family=${t.product.family}, score=${t.score}, bom=${t.total_bom})`);
    console.log(`      Breakdown:`, JSON.stringify(t.breakdown));
  });
}

// ============================================================
// TEST 1: R-744 Supermarket, 4 detectors, 24V, wall, any output
// ============================================================
console.log('\n=== TEST 1: R-744 Supermarket ===');
const t1 = runM2({
  zone_type: 'supermarket',
  project_country: 'france',
  zone_atex: false,
  selected_refrigerant: 'R744',
  selected_range: '',
  total_detectors: 4,
  output_required: 'any',
  site_power_voltage: '24V',
  mounting_type_required: 'wall',
  alert_accessory: 'fl_rl_r'
});

console.log(`  Solutions: ${t1.all_solutions.length}, Tiers: ${t1.tiers.length}, Warnings: ${t1.warnings.length}`);
printTierSummary(t1);

// Verify 3 tiers present
assert(t1.tiers.length === 3, 'T1: 3 tiers returned', `got ${t1.tiers.length}`);

// PREMIUM tier = MIDI family (CO2 IR)
const t1_prem = t1.tiers.find(t => t.tier === 'PREMIUM');
assert(t1_prem !== undefined, 'T1: PREMIUM tier exists');
assert(t1_prem && t1_prem.product.family === 'MIDI', 'T1: PREMIUM is MIDI family', `got ${t1_prem ? t1_prem.product.family : 'none'}`);
assert(t1_prem && t1_prem.product.id.includes('CO2'), 'T1: PREMIUM is CO2 product', `got ${t1_prem ? t1_prem.product.id : 'none'}`);
assert(t1_prem && t1_prem.score >= 15, 'T1: PREMIUM score >= 15', `got ${t1_prem ? t1_prem.score : 'N/A'}`);

// STANDARD tier = G family (GSH CO2)
const t1_std = t1.tiers.find(t => t.tier === 'STANDARD');
assert(t1_std !== undefined, 'T1: STANDARD tier exists');
assert(t1_std && t1_std.product.family === 'G', 'T1: STANDARD is G family', `got ${t1_std ? t1_std.product.family : 'none'}`);

// CENTRALIZED tier = MP or TR family with controller
const t1_cent = t1.tiers.find(t => t.tier === 'CENTRALIZED');
assert(t1_cent !== undefined, 'T1: CENTRALIZED tier exists');
assert(t1_cent && (t1_cent.product.family === 'MP' || t1_cent.product.family === 'TR'), 'T1: CENTRALIZED is MP or TR', `got ${t1_cent ? t1_cent.product.family : 'none'}`);
assert(t1_cent && t1_cent.controller && t1_cent.controller.combo.length > 0, 'T1: CENTRALIZED has controller combo', `combo length: ${t1_cent && t1_cent.controller ? t1_cent.controller.combo.length : 0}`);

// BOM calculated
assert(t1_prem && t1_prem.total_bom > 0, 'T1: PREMIUM total_bom > 0', `got ${t1_prem ? t1_prem.total_bom : 0}`);
assert(t1_cent && t1_cent.total_bom > 0, 'T1: CENTRALIZED total_bom > 0', `got ${t1_cent ? t1_cent.total_bom : 0}`);

// Verify BOM math: detector subtotal + controller + alert = total_bom
if (t1_prem) {
  const expectedBom = t1_prem.detectors.subtotal + (t1_prem.controller ? t1_prem.controller.totalPrice : 0) + (t1_prem.alert_accessories.length > 0 ? t1_prem.alert_accessories[0].price : 0);
  assert(t1_prem.total_bom === expectedBom, 'T1: PREMIUM BOM math correct', `expected ${expectedBom}, got ${t1_prem.total_bom}`);
}

// Stats
assert(t1.stats.total_products > 50, 'T1: Total products > 50', `got ${t1.stats.total_products}`);
assert(t1.stats.after_f3 > 0, 'T1: Products remain after gas filter', `got ${t1.stats.after_f3}`);

// Trace
assert(t1.trace.length > 5, 'T1: Trace has multiple steps', `got ${t1.trace.length}`);


// ============================================================
// TEST 2: R-717 Machinery Room, 2 detectors, 24V, wall, any output
// ============================================================
console.log('\n=== TEST 2: R-717 Machinery Room ===');
const t2 = runM2({
  zone_type: 'machinery_room',
  project_country: 'france',
  zone_atex: false,
  selected_refrigerant: 'R717',
  selected_range: '',
  total_detectors: 2,
  output_required: 'any',
  site_power_voltage: '24V',
  mounting_type_required: 'wall',
  alert_accessory: 'fl_rl_r'
});

console.log(`  Solutions: ${t2.all_solutions.length}, Tiers: ${t2.tiers.length}, Warnings: ${t2.warnings.length}`);
printTierSummary(t2);

// PREMIUM = X5 NH3 (Ionic, ATEX-ready) or MIDI NH3
const t2_prem = t2.tiers.find(t => t.tier === 'PREMIUM');
assert(t2_prem !== undefined, 'T2: PREMIUM tier exists');
assert(t2_prem && (t2_prem.product.family === 'X5' || t2_prem.product.family === 'MIDI'), 'T2: PREMIUM is X5 or MIDI', `got ${t2_prem ? t2_prem.product.family : 'none'}`);
assert(t2_prem && t2_prem.product.id.includes('NH3'), 'T2: PREMIUM is NH3 product', `got ${t2_prem ? t2_prem.product.id : 'none'}`);

// Should have MIDI NH3 solutions (either as PREMIUM or we have multiple NH3 options)
const t2_nh3_solutions = t2.all_solutions.filter(s => s.product.id.includes('NH3'));
assert(t2_nh3_solutions.length >= 2, 'T2: At least 2 NH3 solutions', `got ${t2_nh3_solutions.length}`);

// No ATEX filter applied (zone_atex=false), so both ATEX and non-ATEX products should be available
const t2_atex = t2.all_solutions.filter(s => s.product.atex);
const t2_nonatex = t2.all_solutions.filter(s => !s.product.atex);
assert(t2_atex.length > 0 || t2_nonatex.length > 0, 'T2: Products available (ATEX not required)', `atex=${t2_atex.length}, non-atex=${t2_nonatex.length}`);

// Scores make sense
assert(t2_prem && t2_prem.score > 10, 'T2: PREMIUM score > 10', `got ${t2_prem ? t2_prem.score : 'N/A'}`);

// CENTRALIZED tier should exist (2 detectors)
const t2_cent = t2.tiers.find(t => t.tier === 'CENTRALIZED');
assert(t2_cent !== undefined, 'T2: CENTRALIZED tier exists (2 detectors)', `tiers: ${t2.tiers.map(t => t.tier).join(',')}`);

// BOM calculation
if (t2_prem) {
  assert(t2_prem.detectors.qty === 2, 'T2: Detector qty = 2', `got ${t2_prem.detectors.qty}`);
  assert(t2_prem.detectors.subtotal === t2_prem.detectors.qty * t2_prem.detectors.unitPrice, 'T2: Detector subtotal math correct');
}


// ============================================================
// TEST 3: R-410A Hotel, 1 detector, 24V, wall, relay output
// ============================================================
console.log('\n=== TEST 3: R-410A Hotel ===');
const t3 = runM2({
  zone_type: 'hotel',
  project_country: 'france',
  zone_atex: false,
  selected_refrigerant: 'R410A',
  selected_range: '',
  total_detectors: 1,
  output_required: 'relay',
  site_power_voltage: '24V',
  mounting_type_required: 'wall',
  alert_accessory: 'fl_rl_r'
});

console.log(`  Solutions: ${t3.all_solutions.length}, Tiers: ${t3.tiers.length}, Warnings: ${t3.warnings.length}`);
printTierSummary(t3);

// Should find RM_HFC as a solution (hotel + R410A + relay + wall)
const t3_rm = t3.all_solutions.find(s => s.product.id === 'RM_HFC');
assert(t3_rm !== undefined, 'T3: RM_HFC is a solution', `solutions: ${t3.all_solutions.map(s => s.product.id).join(',')}`);

// RM_HFC should be STANDARD tier
if (t3_rm) {
  assert(t3_rm.tier === 'STANDARD', 'T3: RM_HFC is STANDARD tier', `got ${t3_rm.tier}`);
}

// No CENTRALIZED tier for 1 detector
const t3_cent = t3.tiers.find(t => t.tier === 'CENTRALIZED');
assert(t3_cent === undefined, 'T3: No CENTRALIZED tier (1 detector)', `got ${t3_cent ? t3_cent.tier : 'none'}`);

// Should have at least PREMIUM or STANDARD tier
assert(t3.tiers.length >= 1, 'T3: At least 1 tier', `got ${t3.tiers.length}`);

// All solutions should have relay > 0 (since output_required='relay' and standalone)
const t3_standalone = t3.all_solutions.filter(s => s.product.standalone);
t3_standalone.forEach(s => {
  assert(s.product.relay > 0, `T3: ${s.product.id} has relay > 0 (standalone + relay filter)`, `relay=${s.product.relay}`);
});

// BOM for single detector
if (t3_rm) {
  const expectedBom = t3_rm.detectors.subtotal + 145; // 382 + 145 alert
  assert(t3_rm.total_bom === expectedBom, 'T3: RM_HFC BOM = detector + alert', `expected ${expectedBom}, got ${t3_rm.total_bom}`);
}

// Verify trace exists
assert(t3.trace.length > 5, 'T3: Trace populated', `got ${t3.trace.length}`);

// Stats
assert(t3.stats.after_f0 < t3.stats.total_products, 'T3: F0 filtered products (hotel is restrictive)', `after_f0=${t3.stats.after_f0}, total=${t3.stats.total_products}`);


// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(50));
console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed === 0) {
  console.log('ALL GOLDEN TESTS PASSED');
} else {
  console.log('SOME TESTS FAILED — review output above');
  process.exit(1);
}
