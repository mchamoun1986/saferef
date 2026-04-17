# DETECTBUILDER — TRACE ENGINE SPECIFICATION

**V5.0 — [NEW IN V5]**

Defines the execution trace format for all three DetectBuilder engines.
Version 5.0 — April 2026
CONFIDENTIAL

---

## 1. Executive Summary

**[NEW IN V5]**

The Trace Engine is a cross-cutting specification that defines how all three DetectBuilder engines (Moteur 1: Detection Requirement, Moteur 2: Product Selection, Moteur 3: Pricing) record their execution steps for audit, debugging, and regulatory compliance.

Every engine execution produces a structured trace that captures:
- What inputs were received
- Which rules and functions were evaluated
- What decisions were made and why
- What outputs were produced
- Which EN 378 clauses or business rules governed each step

**What the Trace Engine does NOT do:**
- It does not change any engine logic — it only observes and records
- It does not store traces long-term — that is the responsibility of the quote persistence layer
- It does not filter or modify engine outputs

---

## 2. Position in Pipeline

**[NEW IN V5]**

| Component | Role | Relationship to Trace |
|-----------|------|-----------------------|
| Moteur 1 (Detection Requirement) | Determines if/how many detectors needed | Emits TraceSteps for each detection path, threshold calculation, placement decision |
| Moteur 2 (Product Selection) | Selects products and generates BOM | Emits TraceSteps for each function F0–F12, validation check, scoring calculation |
| Moteur 3 (Pricing) | Prices the BOM and generates quote | Emits TraceSteps for each function P1–P7, discount resolution, total calculation |
| Trace Engine | Collects, structures, and exposes traces | Receives TraceSteps from all engines, assembles TraceResult |
| Admin Simulator | Displays traces to SAMON team | Consumes TraceResult for visualization |
| Quote Storage | Persists traces with quotes | Stores TraceResult as part of quote record |

---

## 3. TraceStep Format

**[NEW IN V5]**

A TraceStep is the atomic unit of the trace. Every discrete decision, calculation, lookup, or validation produces one TraceStep.

### 3.1 TraceStep Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `step_id` | string | YES | Auto-generated sequential ID (e.g., "TS-001", "TS-002") |
| `engine` | enum | YES | Which engine produced this step: `M1`, `M2`, `M3` |
| `function` | string | YES | Function or sub-function identifier (e.g., `DET-MR-001`, `F3`, `P2`, `CALC-008`) |
| `zone_id` | string\|null | NO | Zone identifier if step is zone-specific, null if global |
| `inputs` | object | YES | Key-value map of all inputs consumed by this step |
| `rule_applied` | string | YES | Rule ID, function name, or calculation ID that was evaluated |
| `norm_ref` | string\|null | NO | EN 378 clause or standard reference if applicable (e.g., "EN 378-3:2016, 9.1") |
| `rule_class` | enum\|null | NO | NORMATIVE, DERIVED, RECOMMENDED, PROJECT, INTERNAL — from V4-D rule classes |
| `output` | object | YES | Key-value map of all outputs produced by this step |
| `decision` | string\|null | NO | The decision made (e.g., "YES", "NO", "SKIP", "BLOCK") if this is a decision step |
| `explanation_fr` | string | YES | Human-readable French explanation of what happened in this step |
| `explanation_en` | string | YES | Human-readable English explanation |
| `warnings` | array | NO | Any warnings generated during this step (default: []) |
| `errors` | array | NO | Any errors generated during this step (default: []) |
| `duration_ms` | float | YES | Execution time of this step in milliseconds |
| `timestamp` | datetime | YES | ISO 8601 timestamp when step was executed |

### 3.2 TraceStep Examples

**Example 1 — M1 Detection Path A (Machinery Room Check):**

```json
{
  "step_id": "TS-001",
  "engine": "M1",
  "function": "detection_requirement",
  "zone_id": "z-001",
  "inputs": {
    "is_machinery_room": true
  },
  "rule_applied": "DET-MR-001",
  "norm_ref": "EN 378-3:2016, Clause 9.1",
  "rule_class": "NORMATIVE",
  "output": {
    "detection_required": "YES",
    "detection_basis": "Machinery room — EN 378-3 9.1"
  },
  "decision": "YES",
  "explanation_fr": "Salle des machines détectée → détection obligatoire selon EN 378-3 clause 9.1",
  "explanation_en": "Machinery room detected → detection required per EN 378-3 clause 9.1",
  "warnings": [],
  "errors": [],
  "duration_ms": 0.3,
  "timestamp": "2026-04-02T14:30:00.123Z"
}
```

**Example 2 — M2 Function F3 (Gas-to-Sensor Mapping):**

```json
{
  "step_id": "TS-012",
  "engine": "M2",
  "function": "F3",
  "zone_id": "z-001",
  "inputs": {
    "zone_gas_id": "co2",
    "zone_atex": false
  },
  "rule_applied": "F3_GAS_SENSOR_MAP",
  "norm_ref": null,
  "rule_class": null,
  "output": {
    "sensor_tech": "NDIR IR",
    "compatible_families": ["midi", "x5", "g-series", "tr-series", "mp-series"],
    "detection_range": "0-10,000 ppm"
  },
  "decision": null,
  "explanation_fr": "Gaz CO2 → capteur infrarouge NDIR, familles compatibles identifiées",
  "explanation_en": "CO2 gas → NDIR IR sensor technology, compatible families identified",
  "warnings": [],
  "errors": [],
  "duration_ms": 1.2,
  "timestamp": "2026-04-02T14:30:00.456Z"
}
```

**Example 3 — M3 Function P2 (Discount Resolution):**

```json
{
  "step_id": "TS-045",
  "engine": "M3",
  "function": "P2",
  "zone_id": null,
  "inputs": {
    "customer_group": "2Fo",
    "product_group": "G",
    "discount_code": null
  },
  "rule_applied": "P2_DISCOUNT_MATRIX",
  "norm_ref": null,
  "rule_class": null,
  "output": {
    "line_discount_pct": 50.0,
    "discount_source": "MATRIX",
    "discount_matrix_cell": "[2Fo][G] = 50%"
  },
  "decision": null,
  "explanation_fr": "Client distributeur (2 Fö), produit GLACIAR (groupe G) → remise 50% selon matrice",
  "explanation_en": "Distributor customer (2 Fö), GLACIAR product (group G) → 50% discount from matrix",
  "warnings": [],
  "errors": [],
  "duration_ms": 0.8,
  "timestamp": "2026-04-02T14:30:01.234Z"
}
```

---

## 4. TraceResult Format

**[NEW IN V5]**

A TraceResult is the complete execution trace for one full pipeline run (M1 → M2 → M3). It wraps all TraceSteps with metadata.

### 4.1 TraceResult Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trace_id` | string | YES | Unique trace identifier (UUID) |
| `trace_level` | enum | YES | `full`, `summary`, `errors_only` — controls which steps are included |
| `pipeline_start` | datetime | YES | ISO 8601 timestamp when pipeline started |
| `pipeline_end` | datetime | YES | ISO 8601 timestamp when pipeline completed |
| `total_duration_ms` | float | YES | Total pipeline execution time in milliseconds |
| `engine_versions` | object | YES | Version strings for each engine (see 4.2) |
| `dataset_versions` | object | YES | Version strings for data sources (see 4.3) |
| `steps` | Array\<TraceStep\> | YES | Ordered array of all TraceSteps |
| `step_count` | int | YES | Total number of steps |
| `steps_by_engine` | object | YES | Count of steps per engine: `{M1: n, M2: n, M3: n}` |
| `warnings_count` | int | YES | Total warnings across all steps |
| `errors_count` | int | YES | Total errors across all steps |
| `warnings_summary` | array | YES | Deduplicated list of all warning messages |
| `errors_summary` | array | YES | Deduplicated list of all error messages |
| `outcome` | enum | YES | `SUCCESS`, `SUCCESS_WITH_WARNINGS`, `PARTIAL`, `FAILED` |

### 4.2 Engine Versions Object

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `m1_version` | string | `"V4D-5.0"` | Moteur 1 engine version |
| `m2_version` | string | `"PSE-5.0"` | Moteur 2 engine version |
| `m3_version` | string | `"PE-5.0"` | Moteur 3 engine version |
| `trace_version` | string | `"TE-5.0"` | Trace Engine version |

### 4.3 Dataset Versions Object

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `refrigerant_dataset` | string | `"REF-2026-04"` | Refrigerant properties version |
| `product_catalogue` | string | `"CAT-2026-R2"` | Product catalogue version |
| `price_list` | string | `"2026-R2"` | Price list version |
| `discount_matrix` | string | `"DM-2022-11-28"` | Discount matrix version |

---

## 5. Trace Levels

**[NEW IN V5]**

The trace level controls the verbosity of the TraceResult. The engine always executes fully — the level only filters which steps are included in the output.

### 5.1 Level Definitions

| Level | Included Steps | Use Case | Typical Step Count |
|-------|---------------|----------|-------------------|
| `full` | Every TraceStep from every engine | Audit, debugging, regression testing, admin simulator | 50–200+ |
| `summary` | Decision steps only (steps where `decision` is not null) | Quick review, client-facing trace summary | 10–30 |
| `errors_only` | Steps that produced warnings or errors | Troubleshooting, error investigation | 0–10 |

### 5.2 Level Selection Rules

| Context | Default Level | Rationale |
|---------|---------------|-----------|
| Admin Simulator | `full` | Team needs complete visibility |
| Quote generation (standard) | `summary` | Stored with quote for audit |
| Quote generation (debug mode) | `full` | When investigating an issue |
| API response to configurator | `errors_only` | Minimize payload, show only problems |
| Regression test runner | `full` | Need complete comparison |

### 5.3 Filtering Logic

```
function filterTrace(steps, level):
  if level == "full":
    return steps  // all steps
  if level == "summary":
    return steps.filter(s => s.decision != null)
  if level == "errors_only":
    return steps.filter(s => s.warnings.length > 0 || s.errors.length > 0)
```

---

## 6. Trace Production by Engine

**[NEW IN V5]**

Each engine is responsible for emitting TraceSteps at defined points. This section specifies the mandatory trace points per engine.

### 6.1 Moteur 1 — Detection Requirement Engine Trace Points

| Trace Point | Function | Step Type | Mandatory |
|-------------|----------|-----------|-----------|
| TR-M1-001 | Input validation | Validate all required inputs present | YES |
| TR-M1-002 | Refrigerant property lookup | Load refrigerant properties from dataset | YES |
| TR-M1-003 | Path A — Machinery room | Evaluate DET-MR-001, DET-MR-002 | YES |
| TR-M1-004 | Path B — C.3 occupied space | Evaluate DET-C3-001 through DET-C3-009 | YES (if c3_applicable) |
| TR-M1-005 | Path C — Below-ground flammable | Evaluate DET-BG-001 | YES (if below_ground) |
| TR-M1-006 | Path D — Ammonia specific | Evaluate DET-NH3-001, DET-NH3-002 | YES (if R-717) |
| TR-M1-007 | Path E — Ventilated enclosure | Evaluate DET-ENC-001 | YES (if location_class=IV) |
| TR-M1-008 | Path F — No detection | Evaluate DET-NONE-001 | YES |
| TR-M1-009 | Detection decision summary | Aggregate all path results → final detection_required | YES |
| TR-M1-010 | Quantity calculation | Evaluate QTY-MIN-001 through QTY-REC-005 | YES (if detection=YES) |
| TR-M1-011 | Placement determination | Evaluate PLC-HGT-001 through PLC-MULTI-001 | YES (if detection=YES) |
| TR-M1-012 | Threshold calculation | Evaluate THR-GEN-001 through THR-NH3-002, CALC-008 through CALC-010 | YES (if detection=YES) |
| TR-M1-013 | QLMV/QLAV/RCL evaluation | Evaluate QLMV-001 through QLMV-004 | YES (if C.3 path) |
| TR-M1-014 | Output assembly | Assemble final M1 output object | YES |

### 6.2 Moteur 2 — Product Selection Engine Trace Points

| Trace Point | Function | Step Type | Mandatory |
|-------------|----------|-----------|-----------|
| TR-M2-001 | Input validation | Validate M1 outputs + external inputs | YES |
| TR-M2-002 | F0 — Application defaults | Load zone_type defaults | YES |
| TR-M2-003 | F1 — Country filter | Remove country-excluded products | YES |
| TR-M2-004 | F2 — ATEX filter | Remove non-ATEX products if zone_atex=true | YES |
| TR-M2-005 | F3 — Gas-to-sensor mapping | Map zone_gas_id → sensor_tech → compatible products | YES (per zone) |
| TR-M2-006 | F4 — Output compatibility | Filter by required output types | YES |
| TR-M2-007 | F5 — Existing system check | Evaluate extend vs. new system | YES |
| TR-M2-008 | F6 — Connectivity ranking | Rank by connectivity_preference | YES |
| TR-M2-009 | F7 — Controller architecture | Select controller based on total_detectors + future | YES |
| TR-M2-010 | F8 — Alert selection | Select alert accessories | YES |
| TR-M2-011 | F9 — Power configuration | Select voltage variants and power accessories | YES |
| TR-M2-012 | F10 — Installation/mounting | Determine mounting and IP/temp compatibility | YES |
| TR-M2-013 | F11 — Validation (per check) | Run all 18 validation checks | YES (one step per check) |
| TR-M2-014 | F12 — BOM generation and scoring | Generate ranked solutions with scores | YES |
| TR-M2-015 | Tier assignment | Assign solutions to Economique/Standard/Premium | YES |
| TR-M2-016 | Output assembly | Assemble final M2 output with 3 tier BOMs | YES |

### 6.3 Moteur 3 — Pricing Engine Trace Points

| Trace Point | Function | Step Type | Mandatory |
|-------------|----------|-----------|-----------|
| TR-M3-001 | Input validation | Validate M2 BOM + user context | YES |
| TR-M3-002 | P1 — BOM price lookup (per line) | Resolve list_price_eur + product_group | YES (per line per tier) |
| TR-M3-003 | P2 — Discount resolution (per line) | Determine line_discount_pct | YES (per line per tier) |
| TR-M3-004 | P3 — Line item calculation (per line) | Compute line_net_total_eur | YES (per line per tier) |
| TR-M3-005 | P4 — Category subtotals (per tier) | Group and sum by category | YES (per tier) |
| TR-M3-006 | P5 — Optional services | Calculate installation/commissioning costs | YES (if applicable) |
| TR-M3-007 | P6 — Currency conversion | Convert EUR to target currency | YES (if currency != EUR) |
| TR-M3-008 | P7 — Final totals (per tier) | Compute grand totals with VAT | YES (per tier) |
| TR-M3-009 | Tier comparison | Generate side-by-side comparison | YES |
| TR-M3-010 | Output assembly | Assemble final quote JSON | YES |

---

## 7. Trace Storage

**[NEW IN V5]**

### 7.1 Storage Rules

| Rule | Detail |
|------|--------|
| Trace with quote | Every generated quote MUST have a TraceResult stored alongside it |
| Storage level | Quotes store `summary` level by default; `full` level stored if quote was generated in debug mode |
| Immutability | Once stored, a trace is NEVER modified — it is an audit record |
| Retention | Traces follow the same retention policy as quotes (minimum 5 years for regulatory compliance) |
| Size estimate | `full` trace: 50–200 KB JSON; `summary` trace: 5–20 KB JSON |

### 7.2 Database Table

The trace is stored in the existing `quotes` table as a JSON column, or in a dedicated `quote_traces` table:

| Field | Type | Description |
|-------|------|-------------|
| `trace_id` | string (PK) | Unique trace identifier |
| `quote_ref` | string (FK) | Reference to the associated quote |
| `trace_level` | enum | full, summary, errors_only |
| `trace_data` | JSON | Complete TraceResult object |
| `created_at` | datetime | When trace was created |
| `engine_versions` | JSON | Snapshot of engine versions |

---

## 8. Trace Outcome Classification

**[NEW IN V5]**

| Outcome | Condition | Action |
|---------|-----------|--------|
| `SUCCESS` | Zero warnings, zero errors across all steps | Quote generated normally |
| `SUCCESS_WITH_WARNINGS` | One or more warnings, zero errors | Quote generated but flagged for review |
| `PARTIAL` | One or more errors in non-critical steps (e.g., one tier blocked) | Partial quote generated, blocked items excluded |
| `FAILED` | Critical error preventing quote generation | No quote generated, trace preserved for debugging |

---

## 9. Integration Points

**[NEW IN V5]**

| System | Direction | Data | Notes |
|--------|-----------|------|-------|
| Moteur 1 | EMIT | TraceSteps during detection engine execution | Via trace collector interface |
| Moteur 2 | EMIT | TraceSteps during product selection execution | Via trace collector interface |
| Moteur 3 | EMIT | TraceSteps during pricing execution | Via trace collector interface |
| Admin Simulator | CONSUME | Full TraceResult for visualization | Real-time trace display |
| Quote Storage (Prisma) | WRITE | TraceResult persisted with quote | For audit trail |
| Regression Test Runner | CONSUME | Full TraceResult for comparison | Automated testing |

---

## 10. Implementation Notes

**[NEW IN V5]**

### 10.1 Performance

- Trace overhead target: < 5% of total pipeline execution time
- TraceSteps are appended to an in-memory array during execution — no I/O during engine run
- Trace serialization (to JSON) happens AFTER pipeline completion
- For `summary` and `errors_only` levels, filtering happens at serialization time, not during execution

### 10.2 Error Handling in Traces

- If a TraceStep itself fails to construct (e.g., missing field), the engine MUST NOT fail — log a warning and continue
- The trace captures engine errors, but trace infrastructure errors must not break the engine
- Principle: the trace is an observer, never a participant

### 10.3 Bilingual Explanations

- Every TraceStep MUST include both `explanation_fr` and `explanation_en`
- French explanations use SAMON/industry terminology (e.g., "salle des machines", "capteur", "seuil d'alarme")
- English explanations use EN 378 standard terminology
- Explanations are human-readable sentences, not technical codes

---

## 11. Trace Variables Reference

**[NEW IN V5]**

All variables introduced by the Trace Engine specification. These are added to DATA_DICTIONARY_V5.md.

| Variable | Type | Engine | Description |
|----------|------|--------|-------------|
| `trace_id` | string (UUID) | Trace | Unique trace identifier |
| `trace_level` | enum | Trace | full, summary, errors_only |
| `trace_outcome` | enum | Trace | SUCCESS, SUCCESS_WITH_WARNINGS, PARTIAL, FAILED |
| `step_id` | string | Trace | Sequential step identifier within a trace |
| `step_engine` | enum | Trace | M1, M2, M3 — which engine produced the step |
| `step_function` | string | Trace | Function identifier (rule ID, Fn, Pn, CALC-xxx) |
| `step_zone_id` | string\|null | Trace | Zone context for the step |
| `step_inputs` | object | Trace | Input key-value map |
| `step_rule_applied` | string | Trace | Rule or function evaluated |
| `step_norm_ref` | string\|null | Trace | EN 378 or standard clause reference |
| `step_rule_class` | enum\|null | Trace | NORMATIVE, DERIVED, RECOMMENDED, PROJECT, INTERNAL |
| `step_output` | object | Trace | Output key-value map |
| `step_decision` | string\|null | Trace | Decision result (YES/NO/SKIP/BLOCK) |
| `step_explanation_fr` | string | Trace | French human-readable explanation |
| `step_explanation_en` | string | Trace | English human-readable explanation |
| `step_warnings` | array | Trace | Warnings generated |
| `step_errors` | array | Trace | Errors generated |
| `step_duration_ms` | float | Trace | Step execution time in milliseconds |
| `step_timestamp` | datetime | Trace | ISO 8601 execution timestamp |
| `pipeline_start` | datetime | Trace | Pipeline start timestamp |
| `pipeline_end` | datetime | Trace | Pipeline end timestamp |
| `total_duration_ms` | float | Trace | Total pipeline execution time |
| `warnings_count` | int | Trace | Total warnings across all steps |
| `errors_count` | int | Trace | Total errors across all steps |
| `m1_version` | string | Trace | Moteur 1 engine version |
| `m2_version` | string | Trace | Moteur 2 engine version |
| `m3_version` | string | Trace | Moteur 3 engine version |
| `trace_version` | string | Trace | Trace Engine specification version |

---

## 12. Release Checklist

**[NEW IN V5]**

- [ ] TraceStep schema implemented in TypeScript types
- [ ] TraceResult schema implemented in TypeScript types
- [ ] M1 emits TraceSteps at all TR-M1-xxx points
- [ ] M2 emits TraceSteps at all TR-M2-xxx points
- [ ] M3 emits TraceSteps at all TR-M3-xxx points
- [ ] Trace levels (full/summary/errors_only) filtering works correctly
- [ ] Bilingual explanations reviewed by SAMON team (FR) and engineering (EN)
- [ ] Trace stored with quote in database
- [ ] Admin Simulator displays full trace (see Admin_Simulator_V5.md)
- [ ] Regression test runner compares traces
- [ ] Performance overhead < 5% validated on typical scenarios
- [ ] Golden test pack traces verified: R-32, R-290, R-717, R-744, R-1234yf
