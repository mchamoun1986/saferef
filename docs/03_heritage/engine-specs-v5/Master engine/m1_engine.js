// ============================================================
// SAMON DetectBuilder — M1 Regulation Engine V5
// EN 378-3 Detection Decision + Sizing + Placement + Thresholds
// Standalone module — no dependencies
// ============================================================

// --- REFRIGERANT DATABASE (EN 378-1 Annex E) ---
const REFS = {
  "R-22":       {sc:"A1",  tox:"A", flam:"1",  atel:0.21,    lfl:null,  vd:3.54, mm:86.5,  plc:"floor"},
  "R-32":       {sc:"A2L", tox:"A", flam:"2L", atel:0.30,    lfl:0.307, vd:2.13, mm:52,    plc:"floor"},
  "R-134a":     {sc:"A1",  tox:"A", flam:"1",  atel:0.21,    lfl:null,  vd:4.17, mm:102,   plc:"floor"},
  "R-290":      {sc:"A3",  tox:"A", flam:"3",  atel:0.09,    lfl:0.038, vd:1.80, mm:44,    plc:"floor"},
  "R-404A":     {sc:"A1",  tox:"A", flam:"1",  atel:0.52,    lfl:null,  vd:4.03, mm:97.6,  plc:"floor"},
  "R-407C":     {sc:"A1",  tox:"A", flam:"1",  atel:0.27,    lfl:null,  vd:3.54, mm:86.2,  plc:"floor"},
  "R-410A":     {sc:"A1",  tox:"A", flam:"1",  atel:0.42,    lfl:null,  vd:2.97, mm:72.6,  plc:"floor"},
  "R-448A":     {sc:"A1",  tox:"A", flam:"1",  atel:0.30,    lfl:null,  vd:3.98, mm:97.1,  plc:"floor"},
  "R-449A":     {sc:"A1",  tox:"A", flam:"1",  atel:0.43,    lfl:null,  vd:3.98, mm:97.3,  plc:"floor"},
  "R-513A":     {sc:"A1",  tox:"A", flam:"1",  atel:0.28,    lfl:null,  vd:4.64, mm:108.4, plc:"floor"},
  "R-600a":     {sc:"A3",  tox:"A", flam:"3",  atel:0.0059,  lfl:0.043, vd:2.38, mm:58.1,  plc:"floor"},
  "R-717":      {sc:"B2L", tox:"B", flam:"2L", atel:0.00022, lfl:0.116, vd:0.70, mm:17,    plc:"ceiling"},
  "R-744":      {sc:"A1",  tox:"A", flam:"1",  atel:0.072,   lfl:null,  vd:1.80, mm:44,    plc:"floor"},
  "R-1234yf":   {sc:"A2L", tox:"A", flam:"2L", atel:0.47,    lfl:0.289, vd:4.66, mm:114,   plc:"floor"},
  "R-1234ze(E)":{sc:"A2L", tox:"A", flam:"2L", atel:0.28,    lfl:0.303, vd:4.66, mm:114,   plc:"floor"}
};

// --- C.3 TABLE (EN 378-1, Table C.3) ---
const C3TABLE = {
  "R-22":        {rcl:0.21,  qlmv:0.28,  qlav:0.50},
  "R-134a":      {rcl:0.21,  qlmv:0.28,  qlav:0.58},
  "R-407C":      {rcl:0.27,  qlmv:0.44,  qlav:0.49},
  "R-410A":      {rcl:0.39,  qlmv:0.42,  qlav:0.42},
  "R-744":       {rcl:0.072, qlmv:0.074, qlav:0.18},
  "R-32":        {rcl:0.061, qlmv:0.063, qlav:0.15},
  "R-1234yf":    {rcl:0.058, qlmv:0.060, qlav:0.14},
  "R-1234ze(E)": {rcl:0.061, qlmv:0.063, qlav:0.15}
};

// --- CONSTANTS ---
const AIR_DENSITY = 1.18; // kg/m³ at 25°C, 101.3 kPa
const VM = 24.45;         // molar volume L/mol at 25°C, 101.3 kPa

// --- UNIT CONVERSION ---
function calcPpm(c_kg, mm) { return (VM * c_kg * 1e6) / mm; }
function calcKgm3(ppm, mm) { return (mm * ppm) / (VM * 1e6); }

// --- ASSUMPTIONS (V5 mandatory A1-A10) ---
const ASSUMPTIONS = [
  "A1: Based on EN 378:2016 (FprEN final draft). National adoptions may impose different requirements.",
  "A2: Preliminary engineering assessment only. Does not replace qualified engineer or formal risk assessment.",
  "A3: Simple rectangular room assumed. Irregular spaces require manual review.",
  "A4: Single refrigerant per space assumed. Mixed systems not covered.",
  "A5: Data from EN 378-1 Annex E. Verify against latest published edition.",
  "A6: Conservative: when uncertain, defaults to requiring detection.",
  "A7: National/local regulations (ATEX, F-Gas, insurance) may mandate detection even when EN 378 does not.",
  "A8: Placement is indicative. Final positioning must account for actual airflow/obstructions on site.",
  "A9: Values at standard conditions (25°C, 101.3 kPa). Altitude/temperature may affect real concentrations.",
  "A10: SAMON accepts no liability for decisions based solely on this tool."
];

// ============================================================
// MAIN ENGINE
// ============================================================
function runM1(input) {
  const trace = [];
  function tr(stepId, ruleId, descEn, descFr, decision, inputs, outputs) {
    trace.push({ step_id: stepId, rule_applied: ruleId, explanation_en: descEn, explanation_fr: descFr, decision, inputs: inputs || {}, output: outputs || {} });
  }

  // --- Validate & resolve refrigerant ---
  const r = REFS[input.refrigerant];
  if (!r) {
    return { error: 'REFRIGERANT_NOT_FOUND', refrigerant: input.refrigerant, trace };
  }

  // --- Derived values ---
  const volume = input.room_volume || (input.room_area * input.room_height);
  const concentration = volume > 0 ? input.refrigerant_charge / volume : 0;
  const m2 = r.lfl !== null ? 26 * r.lfl : null;
  const c3 = C3TABLE[input.refrigerant] || null;

  // ========== PATH A — Machinery Room ==========
  let pathA = 'SKIP';
  let pathABasis = '';
  let extraDetectorBG = false;

  if (input.is_machinery_room) {
    pathA = 'YES';
    pathABasis = 'EN 378-3:2016, Clause 9.1 — Detectors mandatory in machinery rooms';
    tr('A1', 'DET-MR-001', 'Machinery room → detection required', 'Salle des machines → détection obligatoire', 'YES', { is_machinery_room: true }, { detection: 'YES' });

    if (input.below_ground && ['2L', '2', '3'].includes(r.flam) && m2 !== null && input.refrigerant_charge > m2) {
      extraDetectorBG = true;
      tr('A2', 'DET-MR-002', 'MR + underground + flammable > m2 → extra detector', 'SM + souterrain + inflammable > m2 → détecteur supplémentaire', 'YES', { below_ground: true, flam: r.flam, charge: input.refrigerant_charge, m2 }, { extra_detector: true });
    }
  } else {
    tr('A0', 'DET-MR-001', 'Not a machinery room — skip Path A', 'Pas une salle des machines — Path A ignoré', 'SKIP', { is_machinery_room: false });
  }

  // ========== PATH B — C.3 Occupied Space ==========
  let pathB = 'SKIP';
  let pathBBasis = '';
  let c3Zone = '';

  if (input.c3_applicable && c3) {
    if (input.below_ground) {
      // Underground C.3.2.3
      if (concentration <= c3.rcl) {
        pathB = 'NO';
        pathBBasis = 'C.3.2.3: concentration <= RCL';
        c3Zone = 'conc ≤ RCL';
        tr('B1', 'DET-C3-006', 'Underground: conc <= RCL → no detection', 'Souterrain: conc <= RCL → pas de détection', 'NO', { concentration, rcl: c3.rcl });
      } else if (concentration <= c3.qlmv) {
        pathB = 'YES';
        pathBBasis = 'C.3.2.3: RCL < concentration <= QLMV → 1 measure required';
        c3Zone = 'RCL < conc ≤ QLMV';
        tr('B2', 'DET-C3-007', 'Underground: RCL < conc <= QLMV → detection required', 'Souterrain: RCL < conc <= QLMV → détection requise', 'YES', { concentration, rcl: c3.rcl, qlmv: c3.qlmv });
      } else {
        pathB = 'YES';
        pathBBasis = 'C.3.2.3: conc > QLMV → 2 measures required';
        c3Zone = 'conc > QLMV';
        tr('B3', 'DET-C3-008', 'Underground: conc > QLMV → 2 measures required', 'Souterrain: conc > QLMV → 2 mesures requises', 'YES', { concentration, qlmv: c3.qlmv });
      }
    } else {
      // Above-ground C.3.2.2
      if (concentration <= c3.qlmv) {
        pathB = 'NO';
        pathBBasis = 'C.3.2.2: concentration <= QLMV → no measures required';
        c3Zone = 'conc ≤ QLMV';
        tr('B4', 'DET-C3-003', 'Above ground: conc <= QLMV → no detection', 'Hors-sol: conc <= QLMV → pas de détection', 'NO', { concentration, qlmv: c3.qlmv });
      } else if (concentration <= c3.qlav) {
        pathB = 'YES';
        pathBBasis = 'C.3.2.2: QLMV < concentration <= QLAV → 1 measure required';
        c3Zone = 'QLMV < conc ≤ QLAV';
        tr('B5', 'DET-C3-004', 'Above ground: QLMV < conc <= QLAV → 1 measure', 'Hors-sol: QLMV < conc <= QLAV → 1 mesure', 'YES', { concentration, qlmv: c3.qlmv, qlav: c3.qlav });
      } else {
        pathB = 'YES';
        pathBBasis = 'C.3.2.2: conc > QLAV → 2 measures required';
        c3Zone = 'conc > QLAV';
        tr('B6', 'DET-C3-005', 'Above ground: conc > QLAV → 2 measures required', 'Hors-sol: conc > QLAV → 2 mesures requises', 'YES', { concentration, qlmv: c3.qlmv, qlav: c3.qlav });
      }
    }
  } else if (input.c3_applicable && !c3) {
    pathB = 'MANUAL_REVIEW';
    pathBBasis = 'C.3 applicable but no QLMV/QLAV/RCL data for ' + input.refrigerant;
    tr('B7', 'DET-C3-001', 'C.3 applicable but no table data → manual review', 'C.3 applicable mais données manquantes → revue manuelle', 'MANUAL_REVIEW', { refrigerant: input.refrigerant });
  } else {
    tr('B0', 'DET-C3-001', 'C.3 not applicable — skip Path B', 'C.3 non applicable — Path B ignoré', 'SKIP', { c3_applicable: false });
  }

  // ========== PATH C — Below-Ground Flammable ==========
  let pathC = 'SKIP';
  let pathCBasis = '';

  if (input.below_ground && ['2L', '2', '3'].includes(r.flam) && m2 !== null && input.refrigerant_charge > m2) {
    pathC = 'YES';
    pathCBasis = 'EN 378-3:2016, Clause 4.3 — Underground + flammable + charge > m2';
    tr('C1', 'DET-BG-001', 'Below ground + flammable + charge > m2 → detection + extra detector', 'Souterrain + inflammable + charge > m2 → détection + détecteur supplémentaire', 'YES', { below_ground: true, flam: r.flam, charge: input.refrigerant_charge, m2 });
    extraDetectorBG = true;
  } else {
    tr('C0', 'DET-BG-001', 'Below-ground flammable path not triggered', 'Chemin souterrain inflammable non déclenché', 'SKIP', { below_ground: input.below_ground, flam: r.flam, charge: input.refrigerant_charge, m2 });
  }

  // ========== PATH D — Ammonia-Specific ==========
  let pathD = 'SKIP';
  let pathDBasis = '';
  let nh3TwoLevel = false;

  if (input.refrigerant === 'R-717' && input.refrigerant_charge > 50) {
    pathD = 'YES';
    pathDBasis = 'EN 378-3:2016, Clause 9.3.3 — R-717 > 50 kg → two-level alarm';
    nh3TwoLevel = true;
    tr('D1', 'DET-NH3-001', 'R-717 > 50 kg → two-level alarm required', 'R-717 > 50 kg → alarme deux niveaux obligatoire', 'YES', { refrigerant: 'R-717', charge: input.refrigerant_charge }, { two_level: true });
  } else if (input.refrigerant === 'R-717') {
    tr('D2', 'DET-NH3-002', 'R-717 <= 50 kg → general paths apply', 'R-717 <= 50 kg → chemins généraux applicables', 'SKIP', { charge: input.refrigerant_charge });
  } else {
    tr('D0', 'DET-NH3-001', 'Not R-717 — skip Path D', 'Pas R-717 — Path D ignoré', 'SKIP', { refrigerant: input.refrigerant });
  }

  // ========== PATH E — Location IV Enclosure ==========
  let pathE = 'SKIP';

  if (input.location_class === 'IV') {
    pathE = 'MANUAL_REVIEW';
    tr('E1', 'DET-ENC-001', 'Location IV ventilated enclosure → manual review', 'Emplacement IV enceinte ventilée → revue manuelle', 'MANUAL_REVIEW', { location: 'IV' });
  } else {
    tr('E0', 'DET-ENC-001', 'Not Location IV — skip Path E', 'Pas emplacement IV — Path E ignoré', 'SKIP', { location: input.location_class });
  }

  // ========== AGGREGATE DECISION ==========
  const paths = [
    { id: 'A', label: 'Machinery Room',        result: pathA, basis: pathABasis, rule: pathA === 'YES' ? 'DET-MR-001' : '—' },
    { id: 'B', label: 'C.3 Occupied Space',     result: pathB, basis: pathBBasis, rule: pathB === 'YES' ? 'DET-C3' : '—' },
    { id: 'C', label: 'Below-Ground Flammable', result: pathC, basis: pathCBasis, rule: pathC === 'YES' ? 'DET-BG-001' : '—' },
    { id: 'D', label: 'Ammonia-Specific',       result: pathD, basis: pathDBasis, rule: pathD === 'YES' ? 'DET-NH3-001' : '—' },
    { id: 'E', label: 'Location IV Enclosure',  result: pathE, basis: '',         rule: pathE === 'MANUAL_REVIEW' ? 'DET-ENC-001' : '—' }
  ];

  let detection_required = 'NO';
  let detection_basis = 'DET-NONE-001: All paths negative — detection not normatively required but RECOMMENDED';
  let governing_rule_id = 'DET-NONE-001';

  const yesPaths = paths.filter(p => p.result === 'YES');
  const mrPaths = paths.filter(p => p.result === 'MANUAL_REVIEW');

  if (yesPaths.length > 0) {
    detection_required = 'YES';
    detection_basis = yesPaths.map(p => p.basis).join(' | ');
    governing_rule_id = yesPaths[0].rule;
  } else if (mrPaths.length > 0) {
    detection_required = 'MANUAL_REVIEW';
    detection_basis = 'One or more paths require manual review';
    governing_rule_id = mrPaths[0].rule;
  }

  // ========== GOVERNING HAZARD ==========
  let governing_hazard = 'NONE';
  if (r.tox === 'B' && ['2L', '2', '3'].includes(r.flam)) governing_hazard = 'BOTH';
  else if (r.tox === 'B') governing_hazard = 'TOXICITY';
  else if (['2L', '2', '3'].includes(r.flam)) governing_hazard = 'FLAMMABILITY';

  // ========== THRESHOLD ENGINE ==========
  let threshold_ppm = null, threshold_kg_m3 = null, threshold_basis = '';
  let atel_ppm = null, half_atel_ppm = null;
  let lfl_ppm = null, lfl_25pct_ppm = null;
  let stage2_threshold_ppm = null;
  const required_actions = [];

  if (nh3TwoLevel) {
    threshold_ppm = 500;
    threshold_kg_m3 = calcKgm3(500, r.mm);
    threshold_basis = 'NH3_500';
    stage2_threshold_ppm = 30000;
    required_actions.push('Pre-alarm 500 ppm: warning + start ventilation');
    required_actions.push('Main alarm 30,000 ppm: emergency shutdown + evacuation');
    tr('TH1', 'THR-NH3-001', 'R-717 > 50 kg → two-level: 500 ppm / 30,000 ppm', 'R-717 > 50 kg → deux niveaux: 500 ppm / 30 000 ppm', null, { refrigerant: 'R-717', charge: input.refrigerant_charge }, { threshold_ppm: 500, stage2: 30000 });
  } else {
    if (r.atel !== null) {
      atel_ppm = calcPpm(r.atel, r.mm);
      half_atel_ppm = atel_ppm * 0.5;
    }
    if (r.lfl !== null) {
      lfl_ppm = calcPpm(r.lfl, r.mm);
      lfl_25pct_ppm = lfl_ppm * 0.25;
    }

    if (half_atel_ppm !== null && lfl_25pct_ppm !== null) {
      if (half_atel_ppm <= lfl_25pct_ppm) {
        threshold_ppm = Math.floor(half_atel_ppm);
        threshold_basis = '50%_ATEL_ODL';
      } else {
        threshold_ppm = Math.floor(lfl_25pct_ppm);
        threshold_basis = '25%_LFL';
      }
    } else if (half_atel_ppm !== null) {
      threshold_ppm = Math.floor(half_atel_ppm);
      threshold_basis = '50%_ATEL_ODL';
    } else if (lfl_25pct_ppm !== null) {
      threshold_ppm = Math.floor(lfl_25pct_ppm);
      threshold_basis = '25%_LFL';
    }

    if (threshold_ppm !== null) {
      threshold_kg_m3 = calcKgm3(threshold_ppm, r.mm);
    }

    required_actions.push('Activate alarm at ' + (threshold_ppm || '—') + ' ppm');
    if (input.is_machinery_room) required_actions.push('Start emergency ventilation (EN 378-3 9.1 + 5.13)');
    tr('TH2', 'THR-GEN-001', 'General threshold: min(50% ATEL, 25% LFL)', 'Seuil général: min(50% ATEL, 25% LFL)', null, { atel_ppm, half_atel_ppm, lfl_ppm, lfl_25pct_ppm }, { threshold_ppm, threshold_basis });
  }

  // ========== DETECTOR QUANTITY ==========
  let min_detectors = 0, recommended_detectors = 0;

  if (detection_required === 'YES' || detection_required === 'MANUAL_REVIEW') {
    min_detectors = 1; // QTY-MIN-001

    if (extraDetectorBG) {
      min_detectors += 1; // QTY-MIN-002
    }

    recommended_detectors = Math.max(
      min_detectors,
      input.room_area > 100 ? Math.ceil(input.room_area / 100) : 1
    );

    tr('QTY', 'QTY-MIN-001', 'Quantity: min=' + min_detectors + ', recommended=' + recommended_detectors, 'Quantité: min=' + min_detectors + ', recommandé=' + recommended_detectors, null, { min_detectors, area: input.room_area }, { recommended_detectors });
  }

  // ========== PLACEMENT ENGINE ==========
  let placement_height = 'floor';
  let placement_height_m = '0 – 0.5 m';
  const densityRatio = r.vd / AIR_DENSITY;

  if (r.vd > 1.5 * AIR_DENSITY) {
    placement_height = 'floor';
    placement_height_m = '0 – 0.5 m';
  } else if (r.vd < 0.8 * AIR_DENSITY) {
    placement_height = 'ceiling';
    const h = input.room_height || 3.0;
    placement_height_m = (h - 0.3).toFixed(1) + ' m (ceiling − 0.3 m)';
  } else {
    placement_height = 'breathing_zone';
    placement_height_m = '1.2 – 1.8 m';
  }

  const candidate_zones = [];
  if (input.is_machinery_room) candidate_zones.push({ zone: 'Near compressor/equipment', rule: 'PLC-MR-001' });
  if (input.below_ground) candidate_zones.push({ zone: 'Lowest accessible point', rule: 'PLC-BG-001' });
  candidate_zones.push({ zone: 'Near probable leak source (joints, valves)', rule: 'PLC-POS-001' });

  // ========== REVIEW FLAGS ==========
  const review_flags = [];
  if (input.c3_applicable && !c3) review_flags.push('MR-002: QLMV/QLAV/RCL not available for ' + input.refrigerant);
  if (c3 && c3.qlmv > 0 && Math.abs(concentration - c3.qlmv) / c3.qlmv < 0.05) review_flags.push('MR-003: Concentration within 5% of QLMV boundary');
  if (input.location_class === 'IV') review_flags.push('MR-008: Ventilated enclosure — assess integrity');
  if (input.below_ground && r.tox === 'B') review_flags.push('MR-009: Below ground + class B refrigerant');

  // ========== OUTPUT CONTRACT ==========
  return {
    // Primary decision
    detection_required,
    detection_basis,
    governing_hazard,
    governing_rule_id,

    // Detectors
    min_detectors,
    recommended_detectors,

    // Placement
    placement_height,
    placement_height_m,
    candidate_zones,

    // Thresholds
    threshold_ppm,
    threshold_kg_m3,
    threshold_basis,
    stage2_threshold_ppm,

    // Actions
    required_actions,
    project_actions: stage2_threshold_ppm ? ['Emergency shutdown', 'Evacuation'] : [],

    // Calculation summary
    calculation_summary: {
      concentration_kg_m3: concentration,
      concentration_ppm: concentration > 0 ? Math.round(calcPpm(concentration, r.mm)) : 0,
      m2_charge_limit: m2,
      atel_ppm: atel_ppm ? Math.round(atel_ppm) : null,
      half_atel_ppm: half_atel_ppm ? Math.round(half_atel_ppm) : null,
      lfl_ppm: lfl_ppm ? Math.round(lfl_ppm) : null,
      lfl_25pct_ppm: lfl_25pct_ppm ? Math.round(lfl_25pct_ppm) : null,
      c3_data: c3,
      c3_zone: c3Zone,
      density_ratio: Math.round(densityRatio * 100) / 100
    },

    // Audit
    assumptions: ASSUMPTIONS,
    missing_inputs: [],
    review_flags,
    source_clauses: yesPaths.map(p => p.basis).filter(Boolean),
    rule_classes: yesPaths.length > 0 ? ['NORMATIVE'] : ['RECOMMENDED'],
    paths_summary: paths,

    // Trace
    trace,

    // Refrigerant info (pass-through for M2)
    refrigerant: input.refrigerant,
    safety_class: r.sc,
    vapour_density: r.vd,
    molecular_mass: r.mm
  };
}

// Export for Node.js or browser
if (typeof module !== 'undefined') module.exports = { runM1, REFS, C3TABLE };
