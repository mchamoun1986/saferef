# DETECTBUILDER V4-D Detector Requirement & Sizing Specification

**V5.0 — UX clarity, assumptions & liability, RECOMMENDED default (based on V3.0 trace integration)**

> Focused Gas Detection Decision Engine

| Field | Value |
|-------|-------|
| Prepared for | SAMON / DetectBuilder |
| Scope | Detection requirement + sizing + placement + thresholds |
| Status | Internal working draft |
| Doc ID | DB-V4D-2026-04 |
| Parent | DB-EFR-V4-2026-04 |
| Spec Version | V5.0 (UX clarity + assumptions + RECOMMENDED default) |

**CONFIDENTIAL**

---

## Table of Contents

1. [Executive Scope](#1-executive-scope)
2. [Source Hierarchy and Rule Classes](#2-source-hierarchy-and-rule-classes)
3. [Output Contract](#3-output-contract)
4. [Input Model](#4-input-model)
5. [Detection Requirement Engine](#5-detection-requirement-engine)
6. [Detector Quantity Engine](#6-detector-quantity-engine)
7. [Placement Engine](#7-placement-engine)
8. [Threshold Engine](#8-threshold-engine)
9. [Calculation Library](#9-calculation-library)
10. [QLMV / QLAV / RCL Decision Logic](#10-qlmv--qlav--rcl-decision-logic)
11. [Worked Examples](#11-worked-examples)
12. [Data Governance and Manual Review](#12-data-governance-and-manual-review)
13. [Release Blockers](#13-release-blockers)
14. [Trace Integration](#14-trace-integration)
15. [Assumptions & Liability Disclaimer](#15-assumptions--liability-disclaimer) **[NEW V5]**
- [Appendix A — Refrigerant Detection Properties](#appendix-a--refrigerant-detection-properties)
- [Appendix B — Detection Decision Matrix](#appendix-b--detection-decision-matrix)
- [Appendix C — Threshold Quick Reference](#appendix-c--threshold-quick-reference)
- [Appendix D — Changelog V4 to V4-D](#appendix-d--changelog-v4-to-v4-d)
- [Variable Changes from V1](#variable-changes-from-v1)
- [Variable Changes from V3](#variable-changes-from-v3) **[NEW V5]**

---

## 1. Executive Scope

V4-D exists to answer five questions with auditable technical logic:

1. **Is gas detection required?** (YES / NO / MANUAL REVIEW)
2. **How many detectors are needed?** (minimum normative + recommended)
3. **Where should detectors be placed?** (height, zone, rationale)
4. **What alarm threshold(s) apply?** (ppm, kg/m³, basis)
5. **Why?** (rule path, calculations, source clauses)

This document is derived from the DetectBuilder Engine Functions Reference V4 (DB-EFR-V4). It extracts and refocuses only the content that materially affects gas detection decisions. For charge limit calculations, system design, ventilation sizing, or general compliance, refer to V4.

- Internal implementation and decision specification only
- Not a substitute for published standards
- Published standards and applicable national rules prevail
- Where standard path is ambiguous: return MANUAL REVIEW
- Intentionally conservative: when in doubt, require detection

---

## 2. Source Hierarchy and Rule Classes

### 2.1 Sources

| Priority | Document | Use in V4-D |
|----------|----------|-------------|
| Primary | EN 378-3:2016 (Installation site and personal protection) | Detection requirements machinery rooms occupied spaces alarm clauses |
| Primary | EN 378-1:2016 Annex C (Charge limitations) | QLMV/QLAV/RCL thresholds that trigger detection |
| Primary | EN 14624:2020 | Detector performance validation |
| Supporting | EN 378-1:2016 Annex E | Refrigerant properties for threshold calculations |
| Supporting | ISO 817:2014 | Thermodynamic basis for unit conversions |
| Context only | EU 517/2014 | F-Gas context does not drive detection logic |

> **Implementation note:** Internal source texts are FprEN (Final Draft) editions. Before external compliance use verify against published adopted national standards.

### 2.2 Rule Classes

| Class | Definition | V4-D Use |
|-------|-----------|----------|
| NORMATIVE | Direct standard requirement | Drives detection YES/NO and mandatory thresholds |
| DERIVED | Calculated from normative data | Threshold ppm values concentration comparisons |
| RECOMMENDED | Engineering best practice | Detector count beyond minimum placement refinement |
| PROJECT | Project-specific configuration | Stage-2 alarms shutdown logic company preferences |
| INTERNAL | SAMON company requirement | Product validation flags not presented as standard requirement |

---

## 3. Output Contract

Every V4-D engine execution produces the following output object. All fields are mandatory in the output; null values must carry an explicit reason.

| Field | Type | Values/Unit | Description |
|-------|------|-------------|-------------|
| `detection_required` | enum | YES / NO / MANUAL_REVIEW | Primary decision |
| `detection_basis` | string | — | Why detection is or is not required |
| `governing_hazard` | enum | TOXICITY / FLAMMABILITY / BOTH / NONE | Which hazard path drives the decision |
| `governing_rule_id` | string | — | Rule ID from this specification |
| `min_detectors` | number | — | Normative minimum count |
| `recommended_detectors` | number | — | Engineered recommendation |
| `placement_height` | string | floor / ceiling / breathing_zone | Primary placement band |
| `placement_height_m` | string | e.g. 0-0.5 m | Numeric height range |
| `candidate_zones[]` | array | — | Recommended placement zones with rationale |
| `threshold_ppm` | number | ppm | Normative detector threshold |
| `threshold_kg_m3` | number | kg/m³ | Same threshold in mass units |
| `threshold_basis` | enum | 25%_LFL / 50%_ATEL_ODL / NH3_500 / NH3_30000 | Which limit governs |
| `stage2_threshold_ppm` | number\|null | ppm | Project-defined second stage (null if not configured) |
| `required_actions[]` | array | — | Normative actions at threshold (alarm ventilation) |
| `project_actions[]` | array | — | Project actions at stage-2 (shutdown evacuation) |
| `calculation_summary` | object | — | Key intermediate values |
| `assumptions[]` | array | — | Assumptions made by engine |
| `missing_inputs[]` | array | — | Inputs not provided |
| `review_flags` | array | — | Conditions requiring manual review |
| `source_clauses[]` | array | — | Standard clauses used |
| `rule_classes[]` | array | — | NORMATIVE/DERIVED/RECOMMENDED tags per output |

---

## 4. Input Model

Only inputs that materially affect detection decisions are included. System design inputs (pipe sizing, pressure equipment, etc.) are excluded.

### 4.1 Refrigerant Properties (from F1)

| Field | Type | Unit | Required | Source |
|-------|------|------|----------|--------|
| `refrigerant_designation` | string | — | Yes | User or system |
| `safety_class` | string | A1/A2L/B2L etc | Yes | F1 lookup |
| `toxicity_class` | char | A or B | Yes | Derived from safety_class |
| `flammability_class` | string | 1/2L/2/3 | Yes | Derived from safety_class |
| `atel_odl` | number\|null | kg/m³ | Conditional | F1 lookup (null if ND) |
| `lfl` | number\|null | kg/m³ | Conditional | F1 lookup (null if class 1) |
| `practical_limit` | number | kg/m³ | Yes | F1 lookup |
| `vapour_density` | number | kg/m³ | Yes | F1 lookup |
| `molecular_mass` | number | g/mol | Yes | F1 lookup |

### 4.2 Installation Context

| Field | Type | Values | Required | Purpose |
|-------|------|--------|----------|---------|
| `refrigerant_charge` | number | kg | Yes | Charge/volume comparison |
| `room_area` | number | m² | Yes | Detector count recommendation + volume derivation |
| `room_height` | number | m | Yes | Placement logic + volume derivation |
| `room_volume` | number | m³ | **Derived** | `room_area × room_height` — auto-calculated, user-overridable |
| `access_category` | enum | a/b/c | Yes | Determines if C.3 path available |
| `location_class` | enum | I/II/III/IV | Yes | Determines detection trigger rules |
| `below_ground` | bool | true/false | Yes | Extra detector logic underground |
| `is_machinery_room` | bool | true/false | Yes | Mandatory detection trigger |
| `is_occupied_space` | bool | true/false | Yes | C.3 measure logic |
| `human_comfort` | bool | true/false | Conditional | Affects C.3 applicability |
| `c3_applicable` | bool | true/false | Yes | Whether Annex C.3 alternative path is in use |
| `leak_source_locations` | array\|null | — | Optional | Placement optimization |
| `mechanical_ventilation_present` | bool | true/false | Conditional | Affects measure count logic |

> **[V5.0]** `room_volume` changed from user-input to derived field. Default: `room_area × room_height`. User may override for non-rectangular spaces.

### 4.3 Access Category Definitions (EN 378-1, Table A.1)

| Category | Name | Description | Examples |
|----------|------|-------------|----------|
| **a** | General occupancy | Public access, no restriction on number of persons | Shops, supermarkets, cinemas, hospitals, schools, hotels |
| **b** | Supervised occupancy | Authorized persons only, occupants aware of safety measures | Offices, laboratories, factories |
| **c** | Authorized personnel | Trained and qualified personnel only | Machinery rooms, dedicated equipment rooms, industrial plants |

### 4.4 Location Class Definitions (EN 378-1, Clause 5)

| Class | Name | Description | Examples |
|-------|------|-------------|----------|
| **I** | Occupied space | Compressor/receiver inside the occupied space | Split AC indoor unit, display cases on shop floor |
| **II** | Adjacent room | System in unoccupied room that communicates with occupied space via openings | Adjacent plantroom with connecting door |
| **III** | Machinery room | Dedicated ventilated room with no direct opening to occupied space | Separate engine room, rooftop plantroom |
| **IV** | Ventilated enclosure | Equipment in a ventilated enclosure within an occupied space | Rooftop unit casing, sealed equipment cabinet |

### 4.5 Condition Flags

| Flag | Description | Impact on Detection Logic |
|------|-------------|--------------------------|
| `below_ground` | System installed in basement or underground level | Triggers Path C (EN 378-3 Cl.4.3) — extra detector for flammable > m2 |
| `is_machinery_room` | Dedicated room for refrigeration equipment | Triggers Path A (EN 378-3 Cl.9.1) — mandatory detection |
| `is_occupied_space` | People present during normal operation | Enables C.3 measure evaluation |
| `human_comfort` | System used for human comfort cooling/heating (AC, heat pumps) | Affects C.3 applicability scope |
| `c3_applicable` | Annex C.3 alternative charge limits in use | Enables Path B — QLMV/QLAV/RCL concentration check |
| `mechanical_ventilation_present` | Mechanical ventilation installed in the space | Affects protective measure count under C.3 |

---

## 5. Detection Requirement Engine

This is the core decision logic. It determines whether gas detection is required for the given installation. The engine evaluates multiple independent paths. If ANY path returns YES, detection is required.

### 5.1 Decision Sequence

Evaluate in order. First YES result is sufficient but continue to identify all applicable paths for audit completeness.

### 5.2 Path A — Machinery Room

**[Rule DET-MR-001]**
If `is_machinery_room = true`: `detection_required = YES`.

> Refrigerant detectors shall be installed in machinery rooms and shall activate the alarm system and mechanical ventilation.

> **Reference:** EN 378-3:2016, Clause 9.1 [NORMATIVE]

**[Rule DET-MR-002]**
If `is_machinery_room = true` AND `below_ground = true` AND `flammability_class in (2L, 2, 3)` AND `charge > m2`: additional detector required (see Section 6).

> **Reference:** EN 378-3:2016, Clause 4.3 [NORMATIVE]

### 5.3 Path B — Occupied Space with C.3 Alternative Provisions

When Annex C.3 alternative provisions are used for charge limits in occupied spaces, detection may become a required protective measure depending on concentration thresholds.

**[Rule DET-C3-001]**
Prerequisite: `c3_applicable = true`. If false, skip this path.

**[Rule DET-C3-002]**
Calculate: `concentration = charge / volume` [kg/m³]

#### Above-ground spaces (C.3.2.2)

**[Rule DET-C3-003]**
If `concentration <= QLMV`: detection NOT required by this path.

**[Rule DET-C3-004]**
If `QLMV < concentration <= QLAV`: at least one protective measure required. Detection with alarm is one valid measure. `detection_required = YES` if detection is the chosen measure, or `MANUAL_REVIEW` if the choice has not been made.

**[Rule DET-C3-005]**
If `concentration > QLAV`: at least two measures required. Detection with alarm is typically one of them. `detection_required = YES`.

#### Lowest underground floor (C.3.2.3)

**[Rule DET-C3-006]**
If `concentration <= RCL`: detection NOT required by this path.

**[Rule DET-C3-007]**
If `RCL < concentration <= QLMV`: at least one measure required, detection in conjunction with alarm is one of the specified measures. `detection_required = YES`.

**[Rule DET-C3-008]**
If `concentration > QLMV`: at least two measures required. Must not exceed QLAV. `detection_required = YES`.

#### Flow-down effect (C.3.2.4)

**[Rule DET-C3-009]**
Even without a system on the lowest floor: if `largest system charge / total lowest-floor volume > QLMV`, mechanical ventilation is required. If detection is relied upon as a protective measure elsewhere in the building, evaluate whether flow-down creates a detection need on the lowest floor. If uncertain: `MANUAL_REVIEW`.

### 5.4 Path C — Below-Ground Flammable Systems

**[Rule DET-BG-001]**
If `below_ground = true` AND `flammability_class in (2L, 2, 3)` AND `charge > m2`: `detection_required = YES` with additional detector and audible/visual alarm.

> **Reference:** EN 378-3:2016, Clause 4.3 [NORMATIVE]

### 5.5 Path D — Ammonia-Specific

**[Rule DET-NH3-001]**
If `refrigerant = R-717` AND `charge > 50 kg`: `detection_required = YES` with two-level alarm (500 ppm pre-alarm, 30,000 ppm main alarm).

> **Reference:** EN 378-3:2016, Clause 9.3.3 [NORMATIVE]

**[Rule DET-NH3-002]**
If `refrigerant = R-717` AND `charge <= 50 kg`: evaluate under general paths (A, B, C). Ammonia-specific two-level regime does not apply.

### 5.6 Path E — Ventilated Enclosure (Location IV)

**[Rule DET-ENC-001]**
For systems in ventilated enclosures within occupied spaces (Location IV): detection requirements are assessed according to the underlying Location I/II/III logic plus enclosure-specific rules from EN 378-2. If enclosure ventilation failure could release refrigerant to occupied space: `detection_required = MANUAL_REVIEW` (assess whether enclosure integrity and ventilation monitoring are sufficient).

### 5.7 Path F — Detection Recommended (Not Normatively Required)

**[Rule DET-NONE-001]**
Detection is NOT normatively required by the standard when ALL of the following are true:

- Not a machinery room
- Not below ground with flammable charge > m2
- Not using C.3 alternative path, OR using C.3 but concentration <= QLMV (above ground) or <= RCL (underground)
- Not R-717 > 50 kg
- No other national regulation mandates detection

> **[V5.0] SAMON policy:** When all paths are negative, the engine output displays **"DETECTION RECOMMENDED"** (not "DETECTION NOT REQUIRED"). SAMON always recommends detection as good engineering practice. The output must clearly indicate: (1) detection is not normatively required by EN 378, AND (2) SAMON recommends it nonetheless. The `RECOMMENDED` rule class applies — never present as a standard requirement.

### 5.8 Decision Matrix Summary

| Rule ID | Condition | Detection Required | Basis |
|---------|-----------|-------------------|-------|
| DET-MR-001 | Machinery room | YES | EN 378-3 9.1 |
| DET-MR-002 | MR + underground + flammable > m2 | YES + extra detector | EN 378-3 4.3 |
| DET-C3-003 | C.3 above ground conc <= QLMV | NO (this path) | C.3.2.2 |
| DET-C3-004 | C.3 above ground QLMV < conc <= QLAV | YES or MANUAL_REVIEW | C.3.2.2 |
| DET-C3-005 | C.3 above ground conc > QLAV | YES (part of 2 measures) | C.3.2.2 |
| DET-C3-006 | C.3 underground conc <= RCL | NO (this path) | C.3.2.3 |
| DET-C3-007 | C.3 underground RCL < conc <= QLMV | YES | C.3.2.3 |
| DET-C3-008 | C.3 underground conc > QLMV | YES (part of 2 measures) | C.3.2.3 |
| DET-BG-001 | Underground + flam + charge > m2 | YES + extra | EN 378-3 4.3 |
| DET-NH3-001 | R-717 > 50 kg | YES two-level | EN 378-3 9.3.3 |
| DET-NONE-001 | All paths negative | RECOMMENDED | Not normatively required — SAMON recommends detection |

---

## 6. Detector Quantity Engine

This section determines the number of detectors. It strictly separates normative minimum from engineering recommendation.

### 6.1 Normative Minimum

The normative minimum (`qty_normative_min`) is the absolute floor. The engine must never recommend fewer detectors than `qty_normative_min`.

| Rule ID | Condition | Min Detectors | Reference | Rule Class |
|---------|-----------|---------------|-----------|------------|
| QTY-MIN-001 | Detection required by any path | 1 | EN 378-3 9.1 | NORMATIVE |
| QTY-MIN-002 | Below ground + flam class 2L/2/3 + charge > m2 | +1 additional with audible/visual alarm | EN 378-3 4.3 | NORMATIVE |
| QTY-MIN-003 | R-717 > 50 kg | 1 (two-level: 500 + 30000 ppm) | EN 378-3 9.3.3 | NORMATIVE |

### 6.2 Engineering Recommendations

The following recommendations apply when detection is required. They are engineering best practice, NOT normative requirements.

| Rule ID | Condition | Recommendation | Rationale | Rule Class |
|---------|-----------|---------------|-----------|------------|
| QTY-REC-001 | Room area > 100 m² | 1 detector per 100 m² | Industry practice for coverage | RECOMMENDED |
| QTY-REC-002 | Multiple separated leak source zones | 1 detector per zone | Each zone needs independent coverage | RECOMMENDED |
| QTY-REC-003 | Room with airflow barriers (walls partitions equipment) | Additional detectors in separated airflow zones | Barriers prevent gas reaching single detector | RECOMMENDED |
| QTY-REC-004 | Room > 200 m² with multiple compressors | At least 2 detectors | Redundancy for large installations | RECOMMENDED |
| QTY-REC-005 | Ventilation exhaust near single detector | Relocate or add detector | Exhaust dilutes sample before detection | RECOMMENDED |

### 6.3 Calculation

Recommended count:

```
recommended_detectors = max(
  qty_normative_min,
  ceil(room_area / 100),   // if area > 100 m²
  count(leak_source_zones)  // if multiple zones
)
```

> **Implementation note:** This formula is RECOMMENDED, not NORMATIVE. The `qty_normative_min` always governs as the floor.

### 6.4 Manual Review Triggers

- Room geometry is highly irregular (L-shaped, multi-level)
- Significant airflow obstructions that create dead zones
- Mixed refrigerant systems in same space
- Conflicting national regulations
- Charge very close to threshold boundaries (within 5% of m2 or QLMV boundary)

---

## 7. Placement Engine

Detector placement depends on refrigerant density relative to air, room geometry, leak source location, and ventilation patterns.

### 7.1 Height Determination

**[Rule PLC-HGT-001]**
Primary rule: compare refrigerant `vapour_density` to `air_density` at 25°C (1.18 kg/m³).

> Where ρr = `vapour_density`, ρa = `air_density`

| Rule ID | Condition | Placement Height | Height Band | Rationale | Rule Class |
|---------|-----------|-----------------|-------------|-----------|------------|
| PLC-HGT-002 | ρr > 1.5 × ρa (clearly heavier) | Floor level | 0 to 0.5 m | Gas pools at floor most halogenated refrigerants | DERIVED |
| PLC-HGT-003 | ρr < 0.8 × ρa (clearly lighter) | Ceiling level | ceiling minus 0.3 m | Gas rises R-717 ammonia | DERIVED |
| PLC-HGT-004 | 0.8×ρa <= ρr <= 1.5×ρa (near-neutral) | Breathing zone | 1.2 to 1.8 m | Gas disperses at intermediate height | DERIVED |
| PLC-HGT-005 | Cannot determine density | MANUAL_REVIEW | — | Insufficient data | — |

### 7.2 Horizontal Positioning

**[Rule PLC-POS-001]**
Position detectors where refrigerant is most likely to concentrate in the event of a leak.

> **Reference:** EN 378-3:2016, Clause 9.2 [NORMATIVE]

- Near compressors, pressure vessels, valve manifolds, non-permanent joints
- In low points of the room for heavier-than-air refrigerants
- Away from doors and windows (dilution risk)
- Away from ventilation supply outlets (dilution before detection)
- Consider natural airflow paths from likely leak source to detector
- In machinery rooms: near the most likely leak source AND near the ventilation exhaust intake

### 7.3 Special Placement Cases

#### Below-ground spaces

**[Rule PLC-BG-001]**
Below-ground spaces with heavier-than-air refrigerants: install at lowest accessible point. Gas will accumulate in the lowest area. Additional detector at stairwell/shaft entry point to warn of gas migration upward.

#### Machinery rooms

**[Rule PLC-MR-001]**
In machinery rooms: at least one detector near the most probable leak source (typically compressor area). For rooms with multiple equipment groups: one detector per equipment group recommended.

#### Ammonia

**[Rule PLC-NH3-001]**
R-717 is lighter than air (`vapour_density` = 0.70 kg/m³). Install at ceiling level. Position near likely leak sources at high points. Ammonia has a strong odor detectable below `atel_odl`, but instrumented detection is required for charge > 50 kg.

#### Multiple leak points

**[Rule PLC-MULTI-001]**
If multiple probable leak sources exist and are separated by more than 5 m or by physical barriers: each zone should have its own detector. The detector should be positioned between the leak source and the room's natural gas accumulation zone.

### 7.4 Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `placement_height` | enum | floor / ceiling / breathing_zone |
| `placement_height_m` | string | Numeric range e.g. 0-0.5 m |
| `candidate_zones[]` | array | List of zone objects with: zone_id zone_description leak_sources[] detector_position rationale |
| `placement_rationale` | string | Text explanation for audit trail |
| `review_flags` | array | Conditions that need human judgement |

---

## 8. Threshold Engine

Determines the normative detector alarm threshold based on refrigerant toxicity and flammability limits.

### 8.1 General Threshold (EN 378-3, Clause 9.3.1)

**[Rule THR-GEN-001]**
The detector preset threshold is the LOWER of:

- 50% of `atel_odl` (converted to ppm)
- 25% of `lfl` (converted to ppm)

**Step 1 — Convert atel_odl:**

```
atel_ppm = (24.45 × atel_odl_kg × 1,000,000) / M
```

> Where M = `molecular_mass`

**Step 2 — Convert 25% lfl:**

```
lfl_25pct_ppm = (24.45 × lfl_kg × 0.25 × 1,000,000) / M
```

> Where M = `molecular_mass`

**Step 3 — Select threshold:**

```
threshold_ppm = min(0.5 × atel_ppm, lfl_25pct_ppm)
```

**[Rule THR-GEN-002]**
If `atel_odl` is null: `threshold = lfl_25pct_ppm` only.

**[Rule THR-GEN-003]**
If `lfl` is null (non-flammable): `threshold = 50% × atel_ppm` only.

**[Rule THR-GEN-004]**
If both null: return `INSUFFICIENT DATA`.

### 8.2 Ammonia Special Threshold (EN 378-3, Clause 9.3.3)

**[Rule THR-NH3-001]**
For R-717 with charge > 50 kg:

| Level | Threshold | Action | Rule Class |
|-------|-----------|--------|------------|
| Pre-alarm | 500 ppm | Warning signal + start ventilation | NORMATIVE |
| Main alarm | 30,000 ppm | Emergency shutdown + evacuation | NORMATIVE |

**[Rule THR-NH3-002]**
For R-717 with charge <= 50 kg: use general threshold logic (THR-GEN-001).

### 8.3 Reverse Conversion

Threshold back to kg/m³:

```
threshold_kg_m3 = (M × threshold_ppm) / (24.45 × 1,000,000)
```

> Where M = `molecular_mass`

Unit basis: 25°C, 101.3 kPa. Molar volume = 24.45 L/mol.

### 8.4 Normative vs Project Actions

| Action | Trigger | Source | Classification |
|--------|---------|--------|----------------|
| Activate alarm signal | At normative threshold | EN 378-3 9.1 | NORMATIVE |
| Start emergency ventilation | At normative threshold (machinery room) | EN 378-3 9.1 + 5.13 | NORMATIVE |
| System shutdown | At project stage-2 threshold | Not universally mandated | PROJECT |
| Evacuation signal | At project stage-2 threshold | Not universally mandated | PROJECT |

> **Implementation note:** Two-stage alarm is normatively required ONLY for R-717 > 50 kg. For all other cases, project stage-2 is optional and must be clearly marked `PROJECT`, never `NORMATIVE`.

### 8.5 Regulation Text

> « The detector(s) shall activate an alarm when the concentration of refrigerant in the ambient atmosphere reaches 50 % of the ATEL/ODL or 25 % of the LFL, whichever is lower. »

> **Reference:** EN 378-3:2016, Clause 9.3.1 [NORMATIVE]

---

## 9. Calculation Library

Only calculations that directly affect detection decisions. All use standard conditions: 25°C, 101.3 kPa, Vm = 24.45 L/mol.

> **Formula shorthand convention:** Formulas use M, ρr, ρa for readability.
> Where M = `molecular_mass`, ρr = `vapour_density`, ρa = `air_density`

### 9.1 Concentration Conversions

| Calc ID | Formula | Variables | Unit | Rule Class |
|---------|---------|-----------|------|------------|
| CALC-001 | `C_ppm = (24.45 × C_kg × 1e6) / M` | C_kg in kg/m³ M in g/mol | ppm | DERIVED |
| CALC-002 | `C_kg = (M × C_ppm) / (24.45 × 1e6)` | C_ppm in ppm | kg/m³ | DERIVED |
| CALC-003 | `C_kg = charge / volume` | charge in kg volume in m³ | kg/m³ | DERIVED |
| CALC-004 | `C_pct = C_ppm / 10000` | — | %vol | DERIVED |

### 9.2 Cap Factors

Used for below-ground flammable detection triggers and threshold boundary evaluation.

| Calc ID | Formula | Unit | Rule Class |
|---------|---------|------|------------|
| CALC-005 | `m1 = 4 × lfl` | kg | NORMATIVE |
| CALC-006 | `m2 = 26 × lfl` | kg | NORMATIVE |
| CALC-007 | `m3 = 130 × lfl` | kg | NORMATIVE |

> **Implementation note:** m1 m2 m3 are charge thresholds in kg. The multipliers carry implicit m³ that cancel with `lfl`'s kg/m³.

### 9.3 Threshold Calculations

| Calc ID | Formula | Purpose | Rule Class |
|---------|---------|---------|------------|
| CALC-008 | `atel_ppm = (24.45 × atel_odl_kg × 1e6) / M` | atel_odl to ppm | DERIVED |
| CALC-009 | `lfl_25pct_ppm = (24.45 × lfl_kg × 0.25 × 1e6) / M` | 25% lfl to ppm | DERIVED |
| CALC-010 | `threshold = min(0.5 × atel_ppm, lfl_25pct_ppm)` | Select governing threshold | DERIVED |

> Where M = `molecular_mass`

### 9.4 Numeric Policy

- Internal: IEEE 754 double precision no intermediate rounding
- Threshold display: nearest integer ppm
- Concentration display: 4 significant figures kg/m³
- Conservative rounding: thresholds round DOWN (more conservative alarm point)
- Null handling: never arithmetic on null. Return `INSUFFICIENT DATA` if required field is null
- QA tolerance: ±1 ppm for thresholds, ±0.5% for concentrations

---

## 10. QLMV / QLAV / RCL Decision Logic

The QLMV/QLAV/RCL thresholds determine whether detection is required as an additional protective measure in occupied spaces using Annex C.3. This section is critical for V4-D because it directly drives detection YES/NO decisions.

### 10.1 Table C.3 Values

> **Reference:** EN 378-1:2016, Table C.3 [NORMATIVE]

| Refrigerant | RCL kg/m³ | QLMV kg/m³ | QLAV kg/m³ | Basis |
|-------------|-----------|------------|------------|-------|
| R-22 | 0.21 | 0.28 | 0.50 | ODL |
| R-134a | 0.21 | 0.28 | 0.58 | ODL |
| R-407C | 0.27 | 0.44 | 0.49 | ODL |
| R-410A | 0.39 | 0.42 | 0.42 | ODL |
| R-744 | 0.072 | 0.074 | 0.18 | 10% vol |
| R-32 | 0.061 | 0.063 | 0.15 | 50% LFL |
| R-1234yf | 0.058 | 0.060 | 0.14 | 50% LFL |
| R-1234ze(E) | 0.061 | 0.063 | 0.15 | 50% LFL |

### 10.2 QLMV Derivation for Unlisted Refrigerants

When the refrigerant is not listed in Table C.3, use the following paths in order of preference:

**[Rule QLMV-001]**
Path 1 — Table C.3 direct lookup. PREFERRED. If refrigerant is listed, use directly.

**[Rule QLMV-002]**
Path 2 — Table C.4 interpolation. ALLOWED when: `molecular_mass` is 50–125 g/mol AND RCL is 0.05–0.35 kg/m³. Linear interpolation between adjacent entries.

> **Reference:** EN 378-1:2016, Table C.4 [NORMATIVE]

| RCL | M=50 | M=75 | M=100 | M=125 |
|-----|------|------|-------|-------|
| 0.05 | 0.051 | 0.051 | 0.051 | 0.051 |
| 0.10 | 0.106 | 0.108 | 0.108 | 0.109 |
| 0.15 | 0.168 | 0.173 | 0.175 | 0.176 |
| 0.20 | 0.242 | 0.254 | 0.260 | 0.264 |
| 0.25 | 0.336 | 0.367 | 0.383 | 0.394 |
| 0.30 | 0.470 | 0.564 | 0.633 | 0.689 |
| 0.35 | 0.724 | — | — | — |

**[Rule QLMV-003]**
Path 3 — Formula C.6 direct solving. CONTROLLED. Requires QA signoff. Only when Path 1 and 2 are not available.

Formula C.6:

```
dx/ds = m - x × A × c × sqrt(ρ × |ρ - ρa| × h × g)
```

Where:
- m = 0.00278 kg/s (10 kg/h leak rate)
- A = 0.0032 m² (door gap)
- c = 1, h = ceiling height, g = 9.81
- ρ = refrigerant density, ρa = `air_density`
- QLMV = x at normalized time s = RCL

**[Rule QLMV-004]**
Path 4 — MANUAL REVIEW. Required when: refrigerant not in C.3, M outside 50–125, RCL outside 0.05–0.35, and C.6 not QA-approved.

Where QLMV is undefined or exceeds QLAV: use `QLMV = QLAV`.

### 10.3 Detection Decision from QLMV/QLAV/RCL

Once thresholds are determined, apply the decision logic from Section 5.3 (DET-C3-003 through DET-C3-009).

The concentration comparison `charge/volume` vs `QLMV/QLAV/RCL` is the gate that determines whether detection becomes a required measure.

---

## 11. Worked Examples

Each example shows the complete V4-D decision path: inputs → detection required? → how many? → where? → what threshold? All values verified. Informative.

### 11.1 R-32 in Occupied Space (A2L)

**Scenario:** R-32 split AC system, 8 kg charge, office 60 m² × 2.5 m = 150 m³, access cat b, location II, above ground, C.3 applicable.

#### Detection Decision

| Step | Calculation | Result |
|------|-------------|--------|
| Machinery room? | No | Path A: skip |
| C.3 applicable? | Yes | Evaluate Path B |
| concentration | 8/150 = 0.0533 kg/m³ | — |
| vs QLMV (0.063) | 0.0533 < 0.063 | Below QLMV |
| C.3 decision | No measures required | DET-C3-003 |
| Below ground? | No | Path C: skip |
| R-717? | No | Path D: skip |
| **RESULT** | **detection_required = NO** (by C.3 path) | All paths negative |

#### Note

Detection not normatively required. SAMON may recommend detection as good practice (RECOMMENDED, not NORMATIVE).

#### If detection were recommended

| Step | Calculation | Result |
|------|-------------|--------|
| Threshold | min(50% × atel_ppm, 25% × lfl_ppm) | — |
| atel_ppm | (24.45 × 0.30 × 1e6) / 52 | 141,058 |
| 50% atel_ppm | 70,529 ppm | — |
| lfl_ppm | (24.45 × 0.307 × 1e6) / 52 | 144,349 |
| 25% lfl_ppm (= lfl_25pct_ppm) | 36,087 ppm | — |
| **Threshold** | min(70,529; 36,087) | **36,087 ppm (25% LFL)** |
| Placement | ρr=2.13 > 1.18×1.5=1.77 | Floor level 0–0.5 m |

### 11.2 R-290 in Occupied Space (A3)

**Scenario:** R-290 display case, 2 kg charge, small shop 40 m² × 2.8 m = 112 m³, access cat a, location I, above ground, C.3 NOT applicable (A3 not eligible for C.3).

#### Detection Decision

| Step | Calculation | Result |
|------|-------------|--------|
| Machinery room? | No | Skip |
| C.3 applicable? | No (A3 not eligible) | Skip Path B |
| Below ground? | No | Skip |
| R-717? | No | Skip |
| Other paths? | No mandatory detection path triggered | — |
| **RESULT** | **detection_required = NO** (normatively) | Standard does not mandate for this case |

#### If detection recommended

| Step | Calculation | Result |
|------|-------------|--------|
| m2 | 26 × 0.038 = 0.988 kg | Charge 2 > m2 |
| atel_ppm | (24.45 × 0.09 × 1e6) / 44 | 50,011 |
| 50% atel_ppm | 25,006 | — |
| lfl_ppm | (24.45 × 0.038 × 1e6) / 44 | 21,116 |
| lfl_25pct_ppm | 5,279 ppm | — |
| **Threshold** | min(25,006; 5,279) | **5,279 ppm (25% LFL)** |
| Placement | ρr=1.80 > 1.77 | Floor level 0–0.5 m |

### 11.3 R-717 Machinery Room (B2L)

**Scenario:** R-717 industrial system, 200 kg charge, machinery room 80 m² × 3.5 m = 280 m³, access cat c, location III, above ground.

#### Detection Decision

| Step | Calculation | Result |
|------|-------------|--------|
| Machinery room? | YES | DET-MR-001: detection = YES |
| R-717 > 50 kg? | YES (200 > 50) | DET-NH3-001: two-level alarm |
| Below ground? | No | No extra detector needed |
| **RESULT** | **detection_required = YES** | EN 378-3 9.1 + 9.3.3 |

#### Detector Count

| Step | Value | Rule |
|------|-------|------|
| qty_normative_min | 1 | QTY-MIN-001 |
| Room area | 80 m² < 100 | No area-based increase |
| **RESULT** | min_detectors = 1 recommended_detectors = 1 | — |

#### Placement

| Parameter | Value | Note |
|-----------|-------|------|
| vapour_density (R-717) | 0.70 kg/m³ | — |
| vs air_density | 0.70 < 0.8 × 1.18 = 0.944 | Lighter than air |
| Height | Ceiling level minus 0.3 m | PLC-NH3-001 |
| Position | Near compressor at ceiling | PLC-MR-001 |

#### Threshold

| Level | Value | Rule |
|-------|-------|------|
| Level 1 (pre-alarm) | 500 ppm | THR-NH3-001 [NORMATIVE] |
| Level 2 (main alarm) | 30,000 ppm | THR-NH3-001 [NORMATIVE] |
| General calc ref | atel_ppm = (24.45 × 0.00022 × 1e6) / 17 = 316 | For reference only |

### 11.4 R-744 Machinery Room (A1)

**Scenario:** R-744 (CO2) transcritical system, 120 kg charge, machinery room 50 m² × 3.0 m = 150 m³, access cat c, location III.

#### Detection Decision

| Step | Calculation | Result |
|------|-------------|--------|
| Machinery room? | YES | DET-MR-001: detection = YES |
| **RESULT** | **detection_required = YES** | EN 378-3 9.1 |

#### Detector Count

| Step | Value | Rule |
|------|-------|------|
| qty_normative_min | 1 | QTY-MIN-001 |
| Room area | 50 m² < 100 | No increase |
| **RESULT** | min = 1 recommended = 1 | — |

#### Placement

| Parameter | Value | Note |
|-----------|-------|------|
| vapour_density (R-744) | 1.80 kg/m³ | — |
| vs air_density | 1.80 > 1.77 (marginal) | Floor level 0–0.5 m |
| Note | CO2 is marginally heavier than air | PLC-HGT-002 |

#### Threshold

| Parameter | Value | Note |
|-----------|-------|------|
| atel_ppm | (24.45 × 0.072 × 1e6) / 44 | 40,009 |
| 50% atel_ppm | 20,005 ppm | — |
| lfl | null (non-flammable) | N/A |
| **Threshold** | **20,005 ppm** | THR-GEN-003 (50% ATEL only) |

### 11.5 R-1234yf in Occupied Space with C.3 (A2L HFO)

**Scenario:** R-1234yf VRF system, 25 kg charge, retail space 200 m² × 3.0 m = 600 m³, access cat a, location II, above ground, C.3 applicable.

#### Detection Decision

| Step | Calculation | Result |
|------|-------------|--------|
| Machinery room? | No | Skip |
| C.3 applicable? | Yes | Evaluate Path B |
| concentration | 25/600 = 0.0417 kg/m³ | — |
| vs QLMV (0.060) | 0.0417 < 0.060 | Below QLMV |
| C.3 decision | No measures required | DET-C3-003 |
| **RESULT** | **detection_required = NO** | All paths negative |

#### Alternate: if charge were 50 kg

| Step | Calculation | Result |
|------|-------------|--------|
| concentration | 50/600 = 0.0833 | — |
| vs QLMV (0.060) | 0.0833 > 0.060 | Exceeds QLMV |
| vs QLAV (0.14) | 0.0833 < 0.14 | Below QLAV |
| C.3 decision | At least 1 measure | DET-C3-004: YES or MANUAL_REVIEW |
| If detection chosen | detection_required = YES | DET-C3-004 |

#### Threshold (if detection applied)

| Parameter | Calculation | Value |
|-----------|-------------|-------|
| atel_ppm | (24.45 × 0.47 × 1e6) / 114 | 100,789 |
| 50% atel_ppm | 100,789 / 2 | 50,395 ppm |
| lfl_ppm | (24.45 × 0.289 × 1e6) / 114 | 61,983 |
| lfl_25pct_ppm | 61,983 / 4 | 15,496 ppm |
| **Threshold** | min(50,395; 15,496) | **15,496 ppm (25% LFL)** |
| Placement | ρr=4.66 >> 1.77 | Floor level 0–0.5 m |

---

## 12. Data Governance and Manual Review

### 12.1 Refrigerant Data Requirements

- Every refrigerant property used in V4-D must come from a controlled versioned dataset
- Each record carries `source_edition`, `source_clause`, `dataset_version`, `dataset_approval_status`
- Null values stored as typed null with `null_reason` enum (`NOT_DEFINED` / `NON_FLAMMABLE`)
- Never perform arithmetic on null. Check before every operation
- Unsupported refrigerants: return `INSUFFICIENT DATA` for all V4-D outputs

### 12.2 Manual Review Triggers

The engine returns `MANUAL_REVIEW` when it cannot produce a defensible answer.

| Trigger ID | Condition | Reason |
|------------|-----------|--------|
| MR-001 | Refrigerant not in controlled dataset | Properties unverified |
| MR-002 | QLMV needed but not in Table C.3 and interpolation not possible | Cannot determine detection threshold |
| MR-003 | Charge within 5% of QLMV or RCL boundary | Result is sensitivity-critical |
| MR-004 | Highly irregular room geometry | Placement logic may be inadequate |
| MR-005 | Mixed refrigerant systems in same space | Multiple hazard paths interact |
| MR-006 | National regulation may override standard | External rules not encoded |
| MR-007 | C.3 applicability uncertain | One or more C.3 conditions ambiguous |
| MR-008 | Ventilated enclosure integrity uncertain | Cannot assess containment reliability |
| MR-009 | Below ground with class B refrigerant | Complex interaction of toxicity underground and detection |
| MR-010 | Standard path produces contradictory results | Should not occur but safety-critical if it does |

### 12.3 QA Requirements

- Every V4-D result carries full metadata: `result_id`, `timestamp`, `engine_version`, `source_clauses`, `rule_classes`, `assumptions`, `review_flags`
- Golden test pack: R-32, R-290, R-717, R-744, R-1234yf (each through full decision path)
- Threshold tolerance: ±1 ppm
- Concentration tolerance: ±0.5% relative
- Detector count must always >= `qty_normative_min` (verify in all test cases)

---

## 13. Release Blockers

### 13.1 Critical

| ID | Blocker | Owner | Status |
|----|---------|-------|--------|
| V4D-C-001 | Detection decision matrix (Section 5.8) verified against standard | Standards | Open |
| V4D-C-002 | QLMV/QLAV/RCL logic validated with test cases | QA | Open |
| V4D-C-003 | All worked examples independently verified | QA | Open |
| V4D-C-004 | Threshold calculations checked for all golden test refrigerants | Engineering | Open |

### 13.2 High

| ID | Blocker | Owner | Status |
|----|---------|-------|--------|
| V4D-H-001 | Refrigerant detection property dataset approved | Data team | Open |
| V4D-H-002 | Manual review trigger list reviewed by senior engineer | Engineering | Open |
| V4D-H-003 | Placement logic reviewed for edge cases | Applications | Open |

### 13.3 Medium

| ID | Blocker | Owner | Status |
|----|---------|-------|--------|
| V4D-M-001 | Recommended detector count formula validated with field data | Applications | Open |
| V4D-M-002 | National regulation override mechanism defined | Compliance | Open |
| V4D-M-003 | Integration testing with V4 engine complete | Development | Open |

---

## Appendix A — Refrigerant Detection Properties

Subset of EN 378-1 Annex E properties relevant to detection decisions.

> **Reference:** EN 378-1:2016, Annex E [NORMATIVE]

| R-no | Class | atel_odl kg/m³ | lfl kg/m³ | vapour_density kg/m³ | molecular_mass g/mol | Placement | Threshold Basis |
|------|-------|----------------|-----------|---------------------|---------------------|-----------|----------------|
| R-22 | A1 | 0.21 | null | 3.54 | 86.5 | Floor | 50% ATEL |
| R-32 | A2L | 0.30 | 0.307 | 2.13 | 52 | Floor | 25% LFL |
| R-134a | A1 | 0.21 | null | 4.17 | 102 | Floor | 50% ATEL |
| R-290 | A3 | 0.09 | 0.038 | 1.80 | 44 | Floor | 25% LFL |
| R-404A | A1 | 0.52 | null | 4.03 | 97.6 | Floor | 50% ATEL |
| R-407C | A1 | 0.27 | null | 3.54 | 86.2 | Floor | 50% ATEL |
| R-410A | A1 | 0.42 | null | 2.97 | 72.6 | Floor | 50% ATEL |
| R-448A | A1 | 0.30 | null | 3.98 | 97.1 | Floor | 50% ATEL |
| R-449A | A1 | 0.43 | null | 3.98 | 97.3 | Floor | 50% ATEL |
| R-513A | A1 | 0.28 | null | 4.64 | 108.4 | Floor | 50% ATEL |
| R-600a | A3 | 0.0059 | 0.043 | 2.38 | 58.1 | Floor | 25% LFL |
| R-717 | B2L | 0.00022 | 0.116 | 0.70 | 17 | Ceiling | NH3 special |
| R-744 | A1 | 0.072 | null | 1.80 | 44 | Floor (marginal) | 50% ATEL |
| R-1234yf | A2L | 0.47 | 0.289 | 4.66 | 114 | Floor | 25% LFL |
| R-1234ze(E) | A2L | 0.28 | 0.303 | 4.66 | 114 | Floor | 25% LFL |

---

## Appendix B — Detection Decision Matrix

Complete decision matrix for quick reference. Evaluate all applicable rows.

| Rule ID | Path | Condition | Detection | Extra Requirements | Source |
|---------|------|-----------|-----------|-------------------|--------|
| DET-MR-001 | A | Machinery room | YES | Alarm + ventilation activation | 378-3 9.1 |
| DET-MR-002 | A | MR + underground + flam > m2 | YES | +1 detector + audible/visual | 378-3 4.3 |
| DET-C3-003 | B | C.3 above ground conc <= QLMV | NO | — | C.3.2.2 |
| DET-C3-004 | B | C.3 above QLMV < conc <= QLAV | YES/MR | 1 measure required | C.3.2.2 |
| DET-C3-005 | B | C.3 above conc > QLAV | YES | 2 measures required | C.3.2.2 |
| DET-C3-006 | B | C.3 underground conc <= RCL | NO | — | C.3.2.3 |
| DET-C3-007 | B | C.3 underground RCL < conc <= QLMV | YES | Incl detection | C.3.2.3 |
| DET-C3-008 | B | C.3 underground conc > QLMV | YES | 2 measures <= QLAV | C.3.2.3 |
| DET-C3-009 | B | Flow-down lowest floor > QLMV | MR | Ventilation + assess detection | C.3.2.4 |
| DET-BG-001 | C | Underground + flam + charge > m2 | YES | +1 detector | 378-3 4.3 |
| DET-NH3-001 | D | R-717 > 50 kg | YES | Two-level 500/30,000 | 378-3 9.3.3 |
| DET-ENC-001 | E | Location IV enclosure | MR | Assess enclosure integrity | 378-2 + 378-3 |
| DET-NONE-001 | F | All paths negative | RECOMMENDED | Not normatively required — SAMON always recommends detection | — |

---

## Appendix C — Threshold Quick Reference

Pre-calculated thresholds for common refrigerants. All at 25°C, 101.3 kPa.

| Refrigerant | 50% atel_ppm | 25% lfl_ppm (= lfl_25pct_ppm) | Governing Threshold ppm | Basis |
|-------------|-------------|-------------------------------|------------------------|-------|
| R-22 | 29,676 | null | 29,676 | 50% ATEL |
| R-32 | 70,529 | 36,087 | 36,087 | 25% LFL |
| R-134a | 25,169 | null | 25,169 | 50% ATEL |
| R-290 | 25,006 | 5,279 | 5,279 | 25% LFL |
| R-404A | 65,113 | null | 65,113 | 50% ATEL |
| R-407C | 38,282 | null | 38,282 | 50% ATEL |
| R-410A | 70,744 | null | 70,744 | 50% ATEL |
| R-600a | 1,241 | 4,523 | 1,241 | 50% ATEL |
| R-717 | 158 | 41,682 | 500 / 30,000* | NH3 special* |
| R-744 | 20,005 | null | 20,005 | 50% ATEL |
| R-1234yf | 50,395 | 15,496 | 15,496 | 25% LFL |
| R-1234ze(E) | 30,026 | 16,246 | 16,246 | 25% LFL |

\* R-717: general threshold would be 158 ppm (50% ATEL), but for systems > 50 kg the special two-level regime applies: 500 ppm pre-alarm, 30,000 ppm main alarm per EN 378-3, 9.3.3.

> **Implementation note:** Verify R-22 calculation: atel_ppm = (24.45 × 0.21 × 1e6) / 86.5 = 59,353. 50% = 29,676. Use engine-calculated values, not this table, for implementation.

\* R-717 >50 kg: two-level regime per EN 378-3, 9.3.3 overrides general calculation.

---

## Appendix D — Changelog V4 to V4-D

### D.1 Scope Change

V4-D is a focused extraction from V4 (DB-EFR-V4-2026-04). It retains only content that directly affects gas detection decisions.

### D.2 Removed from V4

- F2 charge limit decision engine (retained only QLMV/QLAV/RCL comparison logic)
- F3 occupied-space flammability formulas (not needed for detection decisions)
- F6A machinery-room ventilation rate calculations (detection triggers ventilation but V4-D does not size it)
- F7 space classification questionnaire (V4-D takes classification as input)
- F8A portable leak detector validation (separate concern from detection requirement)
- F8B fixed detector validation (separate concern; V4-D determines IF detection is needed, not detector product compliance)
- Appendix B charge limit rule matrices (retained only as referenced prerequisite in V4)
- General refrigerant data governance beyond detection-relevant properties

### D.3 Added in V4-D

- Unified detection decision engine with 6 explicit paths (Section 5)
- Detection decision matrix summary (Appendix B)
- Threshold quick reference with pre-calculated values for 12 refrigerants (Appendix C)
- Focused placement engine with density bands and special cases (Section 7)
- Detector quantity engine with strict normative/recommended separation (Section 6)
- Manual review trigger catalog (Section 12.2)
- Tighter output contract with all decision fields defined (Section 3)
- Focused input model excluding non-detection fields (Section 4)

### D.4 Structural Changes

- Functions reorganized from F1-F9 pipeline to decision-oriented engines
- Detection decision is the primary output not a side effect of charge calculations
- QLMV/QLAV/RCL presented as detection triggers not charge limit tools
- All rule IDs use detection-specific prefixes (DET-, THR-, PLC-, QTY-, QLMV-)
- Worked examples show complete decision paths not isolated calculations

---

## Variable Changes from V1

All variable renames applied in this V2.0 release. Logic, formulas, numeric values, and thresholds are unchanged.

| V1 Name (in V4-D Spec V1) | V2 Canonical Name | Context |
|----------------------------|-------------------|---------|
| `ATEL_ODL` | `atel_odl` | Input field, Appendix A column header |
| `LFL` | `lfl` | Input field, Appendix A column header, cap factor formulas |
| `ATEL_ppm` | `atel_ppm` | Threshold calculation intermediate, Appendix C column |
| `LFL_25pct_ppm` | `lfl_25pct_ppm` | Threshold calculation intermediate, Appendix C column |
| `M` (molecular mass) | `molecular_mass` (M retained as formula shorthand) | Input field, all unit conversion formulas |
| `ρr` (vapour density) | `vapour_density` (ρr retained as formula shorthand) | Placement height rules, worked examples |
| `ρa` (air density) | `air_density` (ρa retained as formula shorthand) | Placement height rules, Formula C.6 |
| `manual_review_flags[]` | `review_flags` | Output contract, placement output, QA metadata |
| `normative_minimum` | `qty_normative_min` | Detector quantity engine, worked examples |
| `approval_status` | `dataset_approval_status` | Data governance (Section 12.1) |

> **Formula shorthand note:** Formulas continue to use `M`, `ρr`, `ρa` for readability and consistency with EN 378 notation. Each formula section defines the mapping to canonical names.


---

## 14. Trace Integration **[NEW IN V3]**

All V4-D engine execution steps produce TraceSteps as defined in `Trace_Engine_V3.md`. This section defines the mandatory trace points specific to Moteur 1.

### 14.1 Trace Points

Every decision path (A–F), threshold calculation, quantity determination, and placement decision emits a TraceStep. See `Trace_Engine_V3.md`, Section 6.1 for the complete list of M1 trace points (TR-M1-001 through TR-M1-014).

### 14.2 M1-Specific Trace Requirements

| Requirement | Detail |
|-------------|--------|
| All detection paths traced | Even paths that result in SKIP must emit a TraceStep with `decision: "SKIP"` |
| QLMV/QLAV/RCL comparisons | Each comparison (conc vs QLMV, conc vs QLAV, conc vs RCL) emits its own TraceStep |
| Threshold calculation chain | CALC-008, CALC-009, CALC-010 each emit a TraceStep showing inputs and intermediate values |
| Placement reasoning | PLC-HGT-xxx rules emit TraceSteps with `vapour_density`, `air_density`, and density ratio |
| Review flags | Each review flag (MR-001 through MR-010) emitted as a TraceStep with `decision: "MANUAL_REVIEW"` |
| Norm references | Every NORMATIVE rule TraceStep MUST include `norm_ref` (e.g., "EN 378-3:2016, Clause 9.1") |
| Worked example tracing | The golden test scenarios (Section 11) serve as trace validation targets |

### 14.3 Output Contract Extension

The V4-D output contract (Section 3) is extended with the following field:

| Field | Type | Values/Unit | Description |
|-------|------|-------------|-------------|
| `trace` | TraceResult\|null | — | **[NEW IN V3]** Full execution trace. null if trace_level = none. See Trace_Engine_V3.md for schema |

This field is OPTIONAL in the output contract. When present, it contains the complete TraceResult for the M1 execution. The trace is assembled by the Trace Engine after M1 completes.

### 14.4 Admin Simulator Support

The Admin Simulator (`Admin_Simulator_V3.md`) displays M1 results in Panel 1 (Detection Decision). All M1 output fields from Section 3 are displayed, plus:

- Path-by-path evaluation table (paths A–F with result and rule ID)
- Threshold calculation breakdown (intermediate values shown)
- Placement rationale in human-readable form
- Review flags highlighted in orange

The simulator also uses M1 trace data for the Trace panel (Panel 4) and for regression testing against the golden test scenarios (Section 11).

---

## Variable Changes from V2

**[NEW IN V3]** — All V3 additions. No V2 variables were renamed, removed, or modified.

| V3 Variable | Type | Section | Description |
|-------------|------|---------|-------------|
| `trace` (in output contract) | TraceResult\|null | §14.3 | Full M1 execution trace |

**No changes to:** Rules (DET-, THR-, PLC-, QTY-, QLMV-), worked examples, appendices, threshold quick reference, formulas, or any V2 content.

---

## 15. Assumptions & Liability Disclaimer **[NEW IN V5]**

Every V4-D engine execution output MUST include an `assumptions[]` array. These assumptions are also displayed in the simulator UI.

### 15.1 Mandatory Assumptions

| # | Assumption | Category |
|---|-----------|----------|
| A1 | Based on EN 378:2016 (FprEN final draft). National adoptions (NF, BS, DIN, UNI) may impose additional or different requirements. | Normative scope |
| A2 | This tool provides a preliminary engineering assessment only. It does not replace a qualified engineer's judgement or a formal risk assessment. | Liability |
| A3 | Room geometry is assumed simple rectangular. L-shaped, multi-level, or irregular spaces require manual review (MR-004). | Model limitation |
| A4 | Single refrigerant system per space assumed. Mixed refrigerant installations are not covered (MR-005). | Model limitation |
| A5 | Refrigerant data sourced from EN 378-1 Annex E. Values must be verified against the latest published edition before use in compliance documentation. | Data governance |
| A6 | Conservative approach: when data is uncertain or borderline, the engine defaults to requiring detection. | Design philosophy |
| A7 | National and local regulations (ATEX zones, F-Gas requirements, insurance conditions) may mandate detection even when EN 378 does not. | Regulatory |
| A8 | Detector placement is indicative. Final positioning must account for actual airflow, obstructions, and equipment layout on site. | Placement |
| A9 | Threshold values calculated at standard conditions (25°C, 101.3 kPa). Altitude and temperature variations may affect real-world concentrations. | Environmental |
| A10 | SAMON accepts no liability for design decisions based solely on this tool's output. All results must be validated by a competent professional before implementation. | Liability |

### 15.2 Output Contract Extension

The V4-D output contract (Section 3) is extended with:

| Field | Type | Values/Unit | Description |
|-------|------|-------------|-------------|
| `assumptions[]` | string[] | — | **[NEW IN V5]** Mandatory array of 10 assumptions embedded in every engine output |

### 15.3 Display Requirements

- Assumptions MUST be visible in the simulator sidebar (below Run Engine button)
- Assumptions MUST be included in every JSON output
- Assumptions MUST NOT be removable by user interaction
- The liability disclaimer (A10) MUST appear in any exported report or PDF

---

## Variable Changes from V3

**[NEW IN V5]** — All V4 additions. No V3 variables were renamed, removed, or modified.

| V5 Change | Type | Section | Description |
|-----------|------|---------|-------------|
| `room_volume` | Changed | §4.2 | Now derived from `room_area × room_height` (user-overridable) |
| `assumptions[]` | Added to output | §15.2 | Mandatory liability and scope assumptions in every output |
| DET-NONE-001 display | Changed | §5.7 | Output displays "DETECTION RECOMMENDED" instead of "DETECTION NOT REQUIRED" |
| §4.3 Access Category | Added | §4.3 | Definitions for categories a/b/c with EN 378-1 Table A.1 descriptions |
| §4.4 Location Class | Added | §4.4 | Definitions for classes I–IV with EN 378-1 Clause 5 descriptions |
| §4.5 Condition Flags | Added | §4.5 | Description and detection impact for each boolean condition flag |
| §15 Assumptions | Added | §15 | 10 mandatory assumptions covering liability, scope, and limitations |

**No changes to:** Rules (DET-, THR-, PLC-, QTY-, QLMV-), worked examples, threshold quick reference, formulas, calculation library, or any V3 content.
