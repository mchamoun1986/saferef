# DETECTBUILDER — UNIFIED DATA DICTIONARY
# Single source of truth for all variables across Moteur 1, 2, 3, Trace Engine, Admin Simulator, and Database
# Version: 5.0 — 2026-04-03 — V5 unified + Trace Engine + Admin Simulator variables

---

## HOW TO USE
- Every variable has ONE **canonical name** used consistently across ALL V5 documents, code, and DB
- V5 documents all use canonical names — no more aliases needed
- For V1 legacy names, see CHANGELOG_V1_to_V2.md
- `Used by` shows which engine(s) reference it
- `Source` = where the value originates

---

> **Note:** V1 had an Alias Mapping Table here. In V2, all documents use canonical names.
> For the V1→V2 rename history, see `CHANGELOG_V1_to_V2.md`.

### Refrigerant & Physics

| Canonical Name | V4-D Spec | Selection Engine V5 | Pricing Engine V5 | DB Export |
|---------------|-----------|--------------------|--------------------|-----------|
| `atel_odl` | `ATEL_ODL` | — | — | `atel` |
| `lfl` | `LFL` | — | — | `lfl` (uses `NF` string for null) |
| `practical_limit` | — | — | — | `pl` |
| `vapour_density` | `vapour_density`, `ρr` in formulas | — | — | `vd` |
| `air_density` | `ρa` in formulas | — | — | — |
| `molecular_mass` | `M` in formulas | — | — | `mm` |
| `boiling_point` | — | — | — | `bp` |
| `gwp` | — | — | — | `gw` |
| `density_category` | — | — | — | `density` (string) |

### Installation & Zone

| Canonical Name | V4-D Spec | Selection Engine V5 | Pricing Engine V5 | DB Export |
|---------------|-----------|--------------------|--------------------|-----------|
| `project_country` | — | `Country` | — | — |
| `zone_gas_id` | — | `Gas type(s) per zone` | — | `gasId` (in rules JSON) |
| `zone_atex` | — | `ATEX requirement` | — | `atex` (in rules JSON) |
| `zone_type` | — | `Application type` (via F0) | — | `type` (in rules JSON) |

### Product Attributes

| Canonical Name | V4-D Spec | Selection Engine V5 | Pricing Engine V5 | DB Export |
|---------------|-----------|--------------------|--------------------|-----------|
| `product_code` | — | — | `product_code` | `Code` |
| `product_name` | — | — | `description` | section header |
| `product_family` | — | — | — | `Family` |
| `list_price_eur` | — | — | `list_price_eur` | `Price` |
| `gas_type` | — | — | — | `gasType` |
| `gas_detail` | — | — | — | `gasDetail` |
| `sensor_tech` | — | `Sensor Tech` column | — | `sensorTech` |
| `sensor_life` | — | `Lifetime` column | — | `sensorLife` |
| `detection_range` | — | `Range Options` column | — | `range` |
| `power_watts` | — | `Power` column | — | `power` (string e.g. "4W max") |
| `ip_rating` | — | `IP Rating` column | — | `ip` |
| `has_modbus` | — | — | — | `modbus` |
| `modbus_type` | — | — | — | `modbusType` |
| `has_analog` | — | — | — | `analog` |
| `analog_types` | — | — | — | `analogType` (string, not array) |
| `has_app` | — | — | — | `app` |
| `is_atex` | — | — | — | `atex` |
| `is_standalone` | — | — | — | `standalone` |
| `is_remote` | — | — | — | `remote` |
| `is_discontinued` | — | — | `discontinued` | **MISSING** |
| `relay_spec` | — | — | — | `relaySpec` |
| `connect_to` | — | — | — | `connectTo` |
| `temp_range_min` | — | — | — | `tempRange` (single string "-40 to +50°C") |
| `temp_range_max` | — | — | — | `tempRange` (single string) |

### M1 Outputs & Trace

| Canonical Name | V4-D Spec | Selection Engine V5 | Pricing Engine V5 | DB Export |
|---------------|-----------|--------------------|--------------------|-----------|
| `atel_ppm` | `ATEL_ppm` | — | — | — |
| `lfl_25pct_ppm` | `LFL_25pct_ppm` | — | — | — |
| `review_flags` | `manual_review_flags[]` | — | — | — |
| `qty_normative_min` | `normative_minimum` | — | — | — |
| `dataset_approval_status` | `approval_status` | — | — | — |

### M2 Outputs

| Canonical Name | V4-D Spec | Selection Engine V5 | Pricing Engine V5 | DB Export |
|---------------|-----------|--------------------|--------------------|-----------|
| `solution_score` | — | `technical_score` | `technical_score` | — |
| `solution_tier` | — | — | `tier` | — |
| `total_detectors` | — | `Number of detectors (now)` | — | — |
| `max_power_to_sensors` | — | `Power Budget`, `max 10W` | — | — |

### M3 Outputs (Per-line)

| Canonical Name | V4-D Spec | Selection Engine V5 | Pricing Engine V5 | DB Export |
|---------------|-----------|--------------------|--------------------|-----------|
| `quote_date` | — | — | `date` | — |
| `quote_valid_until` | — | — | `valid_until` | — |
| `bom_lines` | — | — | `bom[]` | — |
| `line_product_name` | — | — | `description` | — |
| `line_quantity` | — | — | `quantity` | — |
| `line_discount_pct` | — | — | `discount_pct` | — |
| `line_discount_amount` | — | — | `discount_amt`, `discount_amount_eur` | — |
| `line_net_total_eur` | — | — | `net_line_total_eur`, `net_line_total` | — |
| `line_zone_id` | — | — | `zone_id` | — |

### Variables in M2 NOT YET in Data Dictionary

| Variable in M2 Doc | Proposed Canonical Name | Section | Description |
|--------------------|-----------------------|---------|-------------|
| `Number of detectors (future)` | `detector_count_future` | §3 Installation | Planned expansion detector count |
| `Existing system` | `existing_system_type` | §3 Installation | What's already on site (Modbus BMS, PLC, SAMON MPU, etc.) |
| `Connectivity preference` | `connectivity_preference` | §3 Installation | Bluetooth, DT300, magnetic wand, etc. |
| `Site power` | `site_power_voltage` | §3 Installation | 24V, 230V, or both |
| `Mounting type` | `mounting_type_required` | §4 Zone | Wall, flush, duct, pipe, pole, DIN |

---

## 1. REFRIGERANT PROPERTIES

| Variable | Aliases | Type | Unit | Source | Used by | Description |
|----------|---------|------|------|--------|---------|-------------|
| `refrigerant_id` | DB:`ID` (e.g. `744`, `32`) | string | — | User input | M1, M2, M3, DB | Unique refrigerant identifier (ISO 817 number) |
| `refrigerant_designation` | V4D:`refrigerant_designation` | string | — | DB lookup | M1, M2 | Full designation with R- prefix |
| `refrigerant_name` | DB: section header (e.g. `"Carbon dioxide"`) | string | — | DB lookup | M2, M3 | Common name |
| `safety_class` | DB:`Safety Class` | enum | — | DB (EN 378-1) | M1, M2 | ISO 817 / EN 378 safety classification |
| `toxicity_class` | V4D:`toxicity_class` | char | — | Derived | M1 | A = low toxicity, B = higher toxicity |
| `flammability_class` | V4D:`flammability_class` | enum | — | Derived | M1, M2 | Flammability sub-class (1/2L/2/3) |
| `atel_odl` | **V4D:**`ATEL_ODL` **DB:**`atel` | float\|null | kg/m³ | DB (Annex E) | M1 | Acute Toxicity Exposure Limit. null = NOT_DEFINED |
| `lfl` | **V4D:**`LFL` **DB:**`lfl` (lowercase) | float\|null | kg/m³ | DB (Annex E) | M1 | Lower Flammability Limit. null = NON_FLAMMABLE (DB uses `NF` string) |
| `practical_limit` | DB:`pl` | float | kg/m³ | DB (Annex E) | M1, M2 | Practical limit for the refrigerant |
| `vapour_density` | V4D:`vapour_density` DB:`vd` | float | kg/m³ | DB (Annex E) | M1, M2 | Vapour density at 25°C, 101.3 kPa |
| `air_density` | V4D: `ρa` (in formulas) | float | kg/m³ | Constant | M1 | Reference air density at 25°C = 1.18 |
| `molecular_mass` | V4D:`M` (in formulas) DB:`mm` | float | g/mol | DB (Annex E) | M1 | Molar mass |
| `boiling_point` | DB:`bp` | float | °C | DB | M2 | Normal boiling point |
| `gwp` | DB:`gw` | int | — | DB | M2, M3 | Global Warming Potential (AR5 100yr) |
| `density_category` | DB:`density` (string `"heavy"`/`"light"`) | enum | — | Derived | M1, M2 | heavy if ρr > air, light if ρr < air |

### Null handling
- `atel_odl = null` → `null_reason: "NOT_DEFINED"` (refrigerant has no ATEL/ODL)
- `lfl = null` → `null_reason: "NON_FLAMMABLE"` (class 1, no LFL)
- **RULE**: Never perform arithmetic on null. Check before every operation.

---

## 2. CHARGE LIMIT THRESHOLDS (EN 378-1 Annex C)

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `qlmv` | float\|null | kg/m³ | `0.063` | DB (Table C.3) or interpolation (C.4) | M1 | Quantity Limit — Measured Value. Detection trigger boundary |
| `qlav` | float\|null | kg/m³ | `0.15` | DB (Table C.3) | M1 | Quantity Limit — Accepted Value. Upper detection boundary |
| `rcl` | float\|null | kg/m³ | `0.061` | DB (Table C.3) | M1 | Refrigerant Concentration Limit. Underground boundary |
| `m1` | float | kg | `= 4 × lfl` | Derived (CALC-005) | M1 | Charge threshold 1 |
| `m2` | float | kg | `= 26 × lfl` | Derived (CALC-006) | M1 | Charge threshold 2 — underground flammable trigger |
| `m3` | float | kg | `= 130 × lfl` | Derived (CALC-007) | M1 | Charge threshold 3 |

---

## 3. INSTALLATION CONTEXT (User Inputs)

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `project_name` | string | — | `"Entrepôt Rungis"` | User | M2, M3 | Project identifier |
| `project_country` | enum | — | `"FR"`, `"SE"`, `"NO"` | User | M1, M2, M3 | ISO 3166-1 alpha-2 country code |
| `refrigerant_charge` | float | kg | `45` | User | M1 | Total system refrigerant charge |
| `room_volume` | float | m³ | `150` | Derived (`room_area × room_height`) | M1 | Room volume |
| `room_area` | float | m² | `60` | User | M1, M2 | Floor area |
| `room_height` | float | m | `2.5` | User | M1, M2 | Ceiling height |
| `access_category` | enum | — | `a`, `b`, `c` | User | M1 | EN 378-1: a=general public, b=authorized, c=restricted |
| `location_class` | enum | — | `I`, `II`, `III`, `IV` | User | M1 | EN 378-1 location classification |
| `below_ground` | bool | — | `true`, `false` | User | M1 | Is the space below ground level? |
| `is_machinery_room` | bool | — | `true`, `false` | User | M1, M2 | EN 378 machinery room? |
| `is_occupied_space` | bool | — | `true`, `false` | User | M1 | People normally present? |
| `human_comfort` | bool | — | `true`, `false` | User (conditional) | M1 | System serves human comfort? Affects C.3 |
| `c3_applicable` | bool | — | `true`, `false` | User/Derived | M1 | Is Annex C.3 alternative path in use? |
| `mechanical_ventilation_present` | bool | — | `true`, `false` | User (conditional) | M1 | Mechanical ventilation available? |
| `leak_source_locations` | array\|null | — | `[{x,y,desc}]` | User (optional) | M1 | Known probable leak points for placement |

---

## 4. ZONE MODEL

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `zone_id` | string | — | `"z-001"` | Auto-generated | M1, M2, M3 | Unique zone identifier |
| `zone_name` | string | — | `"Salle machines"` | User | M2, M3 | Display name |
| `zone_type` | enum | — | `technique`, `chambre_froide`, `publique`, `bureau`, `quai`, `stockage` | User | M2 | Zone classification for F0 defaults |
| `zone_gas_id` | string | — | `"co2"`, `"hfc1"`, `"a2l"`, `"nh3"`, `"r290"` | User | M1, M2 | Gas category for this zone |
| `zone_surface` | float | m² | `80` | User | M1, M2 | Zone floor area |
| `zone_height` | float | m | `3.5` | User | M1, M2 | Zone ceiling height |
| `zone_volume` | float | m³ | `280` | Derived | M1 | = zone_surface × zone_height |
| `zone_ventilation` | enum | — | `mechanical`, `natural`, `none` | User | M1, M2 | Ventilation type |
| `zone_occupation` | enum | — | `permanent`, `occasional`, `none` | User | M2 | Occupancy pattern |
| `zone_atex` | bool | — | `true`, `false` | User | M2 | ATEX Zone 1 classification |
| `zone_temperature_min` | float | °C | `-25` | User (optional) | M2 | Minimum ambient temperature — for product IP/temp validation |

---

## 5. MOTEUR 1 OUTPUTS (Detection Decision)

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `detection_required` | enum | — | `YES`, `NO`, `MANUAL_REVIEW` | M1 | M2 | Primary decision |
| `detection_basis` | string | — | `"Machinery room EN 378-3 9.1"` | M1 | M2, M3 | Why detection is/isn't required |
| `governing_hazard` | enum | — | `TOXICITY`, `FLAMMABILITY`, `BOTH`, `NONE` | M1 | M2 | Which hazard drives the decision |
| `governing_rule_id` | string | — | `"DET-MR-001"` | M1 | M2, Audit | Rule ID from V4-D spec |
| `min_detectors` | int | — | `1` | M1 | M2 | Normative minimum detector count |
| `recommended_detectors` | int | — | `2` | M1 | M2 | Engineering recommendation |
| `placement_height` | enum | — | `floor`, `ceiling`, `breathing_zone` | M1 | M2 | Primary detector height band |
| `placement_height_m` | string | — | `"0-0.5 m"` | M1 | M2 | Numeric height range |
| `candidate_zones` | array | — | `[{zone_id, description, position}]` | M1 | M2 | Recommended placement zones |
| `threshold_ppm` | int | ppm | `36087` | M1 | M2, M3 | Normative alarm threshold (rounded DOWN) |
| `threshold_kg_m3` | float | kg/m³ | `0.0767` | M1 | M2 | Same threshold in mass concentration |
| `threshold_basis` | enum | — | `25%_LFL`, `50%_ATEL_ODL`, `NH3_500`, `NH3_30000` | M1 | M2 | Which limit governs |
| `stage2_threshold_ppm` | int\|null | ppm | `null` | M1/Project | M2, M3 | Optional project-defined second stage |
| `required_actions` | array | — | `["alarm", "ventilation"]` | M1 | M2 | Normative actions at threshold |
| `project_actions` | array | — | `["shutdown", "evacuation"]` | Project | M3 | Project actions at stage-2 |
| `concentration` | float | kg/m³ | `0.0533` | Derived (charge/volume) | M1 | Actual room concentration for C.3 comparison |
| `review_flags` | array | — | `["MR-003: charge within 5% of QLMV"]` | M1 | Audit | Manual review triggers |
| `source_clauses` | array | — | `["EN 378-3:2016, 9.1"]` | M1 | Audit | Standard references used |
| `rule_classes` | array | — | `["NORMATIVE", "DERIVED"]` | M1 | Audit | Classification per output |

---

## 6. PRODUCT ATTRIBUTES (Database)

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `product_code` | string | — | `"31-220-12"` | DB | M2, M3 | SAMON order code (unique) |
| `product_name` | string | — | `"Glaciär Midi SC HFC/HFO Group 1"` | DB | M2, M3 | Display name |
| `product_family` | enum | — | `midi`, `x5`, `g-series`, `tr-series`, `mp-series`, `gex`, `rm`, `mpu`, `spu`, `spls`, `lan`, `ctrl10` | DB | M2 | Product family for selection logic |
| `product_group` | enum | — | `A`, `C`, `D`, `F`, `G` | DB | M3 | **Pricing group** — determines discount column |
| `product_category` | enum | — | `detector`, `controller`, `alarm`, `accessory`, `service`, `spare` | DB | M2, M3 | BOM categorization |
| `gas_type` | enum | — | `CO2`, `HFC/HFO`, `NH3`, `HC`, `CO`, `NO2`, `O2` | DB | M2 | Primary gas compatibility |
| `gas_detail` | string | — | `"R32/R407C/R410A/..."` | DB | M2 | Specific refrigerant compatibility list |
| `gas_category_id` | enum | — | `co2`, `hfc1`, `hfc2`, `a2l`, `nh3`, `r290`, `parking`, `vrf` | DB | M2 | Maps to gas category for selection |
| `sensor_tech` | enum | — | `IR`, `SC`, `EC`, `IONIC`, `PELLISTER` | DB | M2 | Sensor technology |
| `sensor_life` | string | — | `"7-10y"`, `"~5y"`, `"2-3y"` | DB | M2 | Expected sensor lifetime |
| `detection_range` | string | — | `"0-10,000 ppm"` | DB | M2 | Measurement range |
| `voltage` | string | — | `"15-24 VDC"`, `"12-24V AC/DC"`, `"230V AC"` | DB | M2 | Operating voltage |
| `power_watts` | float\|null | W | `4.0`, `2.5`, `null` | DB | M2 | Power consumption. **null = TBD (must resolve)** |
| `ip_rating` | string | — | `"IP67"`, `"IP54"`, `"IP21"` | DB | M2 | Ingress protection |
| `temp_range_min` | float | °C | `-40` | DB | M2 | Minimum operating temperature |
| `temp_range_max` | float | °C | `+50` | DB | M2 | Maximum operating temperature |
| `relays` | int | — | `0`, `1`, `2`, `3` | DB | M2 | Number of relay outputs |
| `relay_spec` | string | — | `"1A @ 24VAC/VDC"` | DB | M2 | Relay electrical spec |
| `has_modbus` | bool | — | `true`, `false` | DB | M2 | Modbus RTU capability |
| `modbus_type` | string\|null | — | `"RTU RS485"`, `null` | DB | M2 | Modbus protocol detail |
| `has_analog` | bool | — | `true`, `false` | DB | M2 | Analog output capability |
| `analog_types` | array\|null | — | `["4-20mA", "0-10V"]` | DB | M2 | Available analog output types |
| `has_app` | bool | — | `true`, `false` | DB | M2 | Bluetooth app configuration |
| `is_atex` | bool | — | `true`, `false` | DB | M2 | ATEX Zone 1 certified |
| `is_standalone` | bool | — | `true`, `false` | DB | M2 | Can operate without controller |
| `is_remote` | bool | — | `true`, `false` | DB | M2 | Has remote sensor option |
| `connect_to` | string | — | `"MPU, SPU, PLC"` | DB | M2 | Compatible connection targets |
| `mounting` | string | — | `"Wall, low level ~20cm"` | DB | M2 | Mounting instructions |
| `is_discontinued` | bool | — | `false` | DB | M2, M3 | **Discontinued flag — MISSING in current DB, must add** |
| `country_exclusions` | array | — | `["US", "CA"]` | DB | M2 | **Countries where product NOT available — MISSING, must add** |
| `list_price_eur` | float | EUR | `403.00` | DB | M3 | List price (EUR, excl. VAT) |
| `price_list_version` | string | — | `"2026-R2"` | DB | M3 | Price list revision |

---

## 7. CONTROLLER-SPECIFIC ATTRIBUTES

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `channels` | int | — | `4` | DB | M2 | Number of input channels |
| `max_power_to_sensors` | float | W | `10` | DB | M2 | **Max power budget for connected sensors** |
| `relay_outputs` | int | — | `8` | DB | M2 | Number of relay outputs |
| `has_display` | bool | — | `true` | DB | M2 | Has built-in display |
| `display_type` | string\|null | — | `"LCD"`, `"touchscreen"` | DB | M2 | Display technology |
| `has_ethernet` | bool | — | `false` | DB | M2 | Ethernet connectivity |
| `has_bacnet` | bool | — | `false` | DB | M2 | BACnet protocol support |
| `has_rs485` | bool | — | `true` | DB | M2 | RS485 bus capability |
| `power_to_sensor` | bool | — | `true` | DB | M2 | Powers connected sensor heads |
| `sensor_cable_max` | string | — | `"500m"` | DB | M2 | Maximum sensor cable length |
| `compatible_detectors` | array | — | `["TR-Series", "MP-Series", "GEX"]` | DB | M2 | Compatible detector families |
| `incompatible_detectors` | array | — | `["Glaciär Midi", "G-Series"]` | DB | M2 | Incompatible families |

---

## 8. MOTEUR 2 OUTPUTS (Product Selection / BOM)

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `solution_id` | string | — | `"sol-001"` | M2 | M3 | Unique solution identifier |
| `solution_tier` | enum | — | `economique`, `standard`, `premium` | M2 | M3 | Solution tier classification |
| `solution_score` | int | — | `18` | M2 | M3 | Total ranking score (from F12 criteria) |
| `bom_lines` | array | — | see below | M2 | M3 | Complete Bill of Materials |
| `bom_line.product_code` | string | — | `"31-220-12"` | M2 | M3 | SAMON order code |
| `bom_line.quantity` | int | — | `3` | M2 | M3 | Quantity needed |
| `bom_line.zone_id` | string | — | `"z-001"` or `"GLOBAL"` | M2 | M3 | Zone assignment |
| `bom_line.category` | enum | — | `detector`, `controller`, `alarm`, `accessory`, `service`, `spare` | M2 | M3 | BOM category |
| `bom_line.is_mandatory` | bool | — | `true` | M2 | M3 | Mandatory (dependency) vs recommended |
| `bom_line.dependency_rule` | string\|null | — | `"X5 remote requires D44"` | M2 | M3 | Why this item is mandatory |
| `total_detectors` | int | — | `9` | M2 | M3 | Total detectors across all zones |
| `total_controllers` | int | — | `2` | M2 | M3 | Total controllers |
| `architecture_type` | enum | — | `standalone`, `centralized`, `hybrid`, `bms` | M2 | M3 | System architecture classification |
| `power_budget_used` | float | W | `7.5` | M2 | M3 | Total power consumption on controller(s) |
| `power_budget_max` | float | W | `10` | M2 | M3 | Controller max power |
| `power_budget_ok` | bool | — | `true` | M2 | Validation | power_budget_used ≤ power_budget_max |
| `warnings` | array | — | `["ATEX: controller outside zone"]` | M2 | M3 | Installation warnings |
| `errors` | array | — | `[]` | M2 | Validation | Blocking validation errors |

---

## 9. MOTEUR 3 OUTPUTS (Pricing) **[UPDATED V5 — aligned with M2 + EUR-only HT-only]**

### Quote-Level

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `quote_ref` | string | — | `"DET-2026-0042"` | M3 | Output | Auto-generated quote reference |
| `quote_date` | date | — | `"2026-04-02"` | M3 | Output | Generation date |
| `quote_valid_until` | date | — | `"2026-05-02"` | M3 | Output | = quote_date + 30 days |
| `price_list_version` | string | — | `"2026-R2"` | M3 (locked) | Audit | Price list version at generation time |
| `customer_group` | enum | — | `EDC`, `OEM`, `1Fö`, `2Fö`, `3Fö`, `1Contractor`, `2Contractor`, `3Contractor`, `AKund`, `BKund`, `NO` | User | M3 | Customer discount group |
| `discount_code` | string\|null | — | `"CUST-FR-042"` | User (optional) | M3 | Customer-specific pricing override |
| `project_net_override` | bool | — | `false` | User | M3 | Use Project Net (Group F) pricing |

> **[V5 Removed]** `currency`, `exchange_rate`, `include_installation`, `include_commissioning`, `vat_rate_pct` — EUR-only, HT-only, no optional services.

### Per Tier (from M2) **[UPDATED V5]**

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `tier` | enum | — | `PREMIUM`, `STANDARD`, `CENTRALIZED` | M2 (F12) | M3 | Tier identifier from M2 |
| `solution_score` | int | — | `18` | M2 (F12) | Output | Score 0–21 (6 criteria) |
| `m2_total_bom` | float | EUR | `2415.00` | M2 | Audit | M2's total (list prices) for cross-validation |
| `price_validation` | enum | — | `MATCH` \| `MISMATCH` | M3 (P1) | Audit | M2 total vs M3 DB lookup total |

### Per Line Item (Priced BOM) **[UPDATED V5]**

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `line_number` | int | — | `1` | M3 | Output | Sequential |
| `line_product_code` | string | — | `"31-220-12"` | M2→M3 | Output | From BOM |
| `line_product_name` | string | — | `"Glaciär Midi SC..."` | DB | Output | From DB lookup |
| `line_product_group` | enum | — | `G` | DB | M3 | Discount column selector |
| `line_category` | enum | — | `detector`, `controller`, `power`, `alert`, `mounting`, `service`, `spare` | M2→M3 | Output | BOM category from M2 section |
| `line_quantity` | int | — | `3` | M2→M3 | Output | From BOM |
| `line_list_price_eur` | float | EUR | `403.00` | DB | M3 | Unit list price (DB authoritative) |
| `line_m2_price` | float\|null | EUR | `403.00` | M2→M3 | Audit | M2's embedded price for cross-validation |
| `line_total_eur` | float | EUR | `1209.00` | Derived | Output | = list_price × quantity |
| `line_discount_pct` | float | % | `50.0` | M3 (P2) | Output | Applicable discount |
| `line_discount_amount` | float | EUR | `604.50` | Derived | Output | = line_total × discount_pct/100 |
| `line_net_total_eur` | float | EUR | `604.50` | Derived | Output | = line_total - discount_amount |

> **[V5 Removed]** `line_zone_id` — M2 uses flat BOM (category-based), not zone-based.

### Quote Totals (Per Tier) **[UPDATED V5 — HT only]**

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `total_before_discount` | float | EUR | `5400.00` | Derived | Output | SUM(line_totals) |
| `total_discount` | float | EUR | `2700.00` | Derived | Output | SUM(discount_amounts) |
| `total_after_discount` | float | EUR | `2700.00` | Derived | Output | = before - discount |
| `total_ht` | float | EUR | `2700.00` | Derived | Output | **[V5]** = total_after_discount (final amount) |

> **[V5 Removed]** `total_services`, `total_excl_vat`, `vat_amount`, `total_incl_vat` — HT only, no VAT, no services.

---

## 10. GAS CATEGORY (Mapping Layer)

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `gas_category_id` | enum | — | `co2`, `hfc1`, `hfc2`, `a2l`, `nh3`, `r290`, `parking`, `vrf` | DB | M2 | Internal gas category |
| `gas_category_name_fr` | string | — | `"CO₂ (R744)"` | DB | UI | French display name |
| `gas_category_name_en` | string | — | `"CO₂ (R744)"` | DB | UI | English display name |
| `gas_category_safety_class` | string | — | `"A1"` | DB | M2 | Category safety class |
| `gas_category_coverage` | int | m² | `50` | DB | M2 | Area coverage per detector |
| `gas_category_density` | enum | — | `heavy`, `light` | DB | M2 | Gas density vs air |
| `gas_category_refs` | array | — | `["744"]` | DB | M2 | Refrigerant IDs in this category |
| `gas_category_sensor_tech` | string | — | `"NDIR IR"` | DB | M2 | Primary sensor technology |
| `gas_category_sensor_life` | string | — | `"7-10y"` | DB | M2 | Expected sensor lifetime |
| `gas_category_mount_height` | string | — | `"Low ~20cm"` | DB | M2 | Default mounting height |
| `gas_category_alarms` | object | — | `{s1, s2, s3, a1Fr, a1En, ...}` | DB | M2, UI | Alarm thresholds and actions |

---

## 11. CALCULATION CONSTANTS

| Variable | Type | Value | Unit | Used by | Description |
|----------|------|-------|------|---------|-------------|
| `MOLAR_VOLUME` | float | `24.45` | L/mol | M1 | At 25°C, 101.3 kPa |
| `AIR_DENSITY_25C` | float | `1.18` | kg/m³ | M1 | Reference air density |
| `GRAVITY` | float | `9.81` | m/s² | M1 | For C.6 formula |
| `HEAVY_THRESHOLD` | float | `1.5` | multiplier | M1 | ρr > 1.5×ρa = floor |
| `LIGHT_THRESHOLD` | float | `0.8` | multiplier | M1 | ρr < 0.8×ρa = ceiling |
| `QUOTE_VALIDITY_DAYS` | int | `30` | days | M3 | Quote expiry |
| `ROUNDING_THRESHOLD_PPM` | string | `"floor"` | — | M1 | Thresholds round DOWN (conservative) |
| `ROUNDING_PRICE` | int | `2` | decimal places | M3 | EUR cents |
| `TOLERANCE_THRESHOLD_PPM` | int | `1` | ppm | M1 QA | Acceptable threshold variance |
| `TOLERANCE_CONCENTRATION` | float | `0.5` | % relative | M1 QA | Acceptable concentration variance |
| `NH3_PREALARM_PPM` | int | `500` | ppm | M1 | R-717 > 50kg pre-alarm (NORMATIVE) |
| `NH3_MAIN_ALARM_PPM` | int | `30000` | ppm | M1 | R-717 > 50kg main alarm (NORMATIVE) |
| `NH3_CHARGE_THRESHOLD` | float | `50` | kg | M1 | R-717 special regime threshold |
| `LEAK_RATE_C6` | float | `0.00278` | kg/s | M1 | C.6 formula (10 kg/h) |
| `DOOR_GAP_C6` | float | `0.0032` | m² | M1 | C.6 formula default door gap |

---

## 12. AUDIT & METADATA

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `result_id` | string | — | UUID | System | All | Unique result identifier |
| `engine_version` | string | — | `"V4D-5.0"` | System | Audit | Engine version that produced result |
| `timestamp` | datetime | — | ISO 8601 | System | Audit | When result was generated |
| `dataset_version` | string | — | `"REF-2026-04"` | DB | M1, Audit | Refrigerant data version |
| `dataset_approval_status` | enum | — | `approved`, `draft`, `under_review` | DB | M1, Audit | Data governance status |
| `assumptions` | array | — | `["100% charge release"]` | Engine | Audit | Assumptions made |
| `missing_inputs` | array | — | `["leak_source_locations"]` | Engine | Audit | Inputs not provided |

---

## 13. ENUMS REFERENCE

### safety_class
`A1`, `A2L`, `A2`, `A3`, `B1`, `B2L`, `B2`, `B3`

### zone_type
`technique`, `chambre_froide`, `publique`, `bureau`, `quai`, `stockage`, `parking`, `patinoire`

### gas_category_id
`co2`, `hfc1`, `hfc2`, `a2l`, `nh3`, `r290`, `parking`, `vrf`

### product_family
`midi`, `x5`, `g-series`, `tr-series`, `mp-series`, `gex`, `rm`, `mpu`, `spu`, `spls`, `spls-kit`, `lan`, `ctrl10`, `aquis`

### product_group (Pricing)
`A` (controllers, legacy detectors, alerts, service tools), `C` (portable detectors), `D` (spare parts, test gas), `F` (free items), `G` (GLACIAR line)

### product_category (BOM — M2 flat sections) **[UPDATED V5]**
`detector`, `controller`, `power`, `alert`, `mounting`, `service`, `spare`

### solution_tier (M2 → M3) **[NEW V5]**
`PREMIUM`, `STANDARD`, `CENTRALIZED`

### price_validation (M3) **[NEW V5]**
`MATCH`, `MISMATCH`

### customer_group
`EDC`, `OEM`, `1Fo`, `2Fo`, `3Fo`, `1Contractor`, `2Contractor`, `3Contractor`, `AKund`, `BKund`, `NO`

### architecture_type
`standalone`, `centralized`, `hybrid`, `bms`

### rule_class
`NORMATIVE`, `DERIVED`, `RECOMMENDED`, `PROJECT`, `INTERNAL`

### detection_required
`YES`, `NO`, `MANUAL_REVIEW`

### threshold_basis
`25%_LFL`, `50%_ATEL_ODL`, `NH3_500`, `NH3_30000`

### placement_height
`floor`, `ceiling`, `breathing_zone`

### governing_hazard
`TOXICITY`, `FLAMMABILITY`, `BOTH`, `NONE`

---

## 14. CALCULATION TRACE — M1 Threshold

Intermediate values for full audit trail. Every threshold decision must be reproducible.

| Variable | Type | Unit | Formula | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `atel_ppm` | float\|null | ppm | `(24.45 × atel_odl × 1e6) / molecular_mass` | Derived (CALC-008) | M1 | ATEL/ODL converted to ppm. null if atel_odl is null |
| `atel_50pct_ppm` | float\|null | ppm | `atel_ppm × 0.5` | Derived | M1 | 50% of ATEL — toxicity threshold candidate |
| `lfl_ppm` | float\|null | ppm | `(24.45 × lfl × 1e6) / molecular_mass` | Derived (CALC-009) | M1 | LFL converted to ppm. null if lfl is null |
| `lfl_25pct_ppm` | float\|null | ppm | `lfl_ppm × 0.25` | Derived | M1 | 25% of LFL — flammability threshold candidate |
| `threshold_candidates` | object | — | `{atel_50pct_ppm, lfl_25pct_ppm}` | Derived | M1, Audit | Both candidates shown side-by-side |
| `threshold_governing` | enum | — | `min(atel_50pct, lfl_25pct)` selects winner | Derived (CALC-010) | M1 | Which candidate won: `ATEL` or `LFL` |
| `threshold_ppm_raw` | float | ppm | exact min() result before rounding | Derived | M1 | Pre-rounding value for QA tolerance check |
| `threshold_ppm` | int | ppm | `floor(threshold_ppm_raw)` | Derived | M1, M2 | Final normative threshold (rounded DOWN = conservative) |
| `threshold_kg_m3` | float | kg/m³ | `(M × threshold_ppm) / (24.45 × 1e6)` | Derived (CALC-002) | M1 | Reverse conversion for display |

---

## 15. CALCULATION TRACE — M1 C.3 Decision Path

Intermediate values for Annex C.3 detection decision. Critical for YES/NO justification.

| Variable | Type | Unit | Formula | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `concentration_kg_m3` | float | kg/m³ | `refrigerant_charge / room_volume` | Derived (CALC-003) | M1 | Actual room concentration |
| `conc_vs_qlmv` | enum | — | `BELOW` if conc ≤ qlmv, `ABOVE` if conc > qlmv | Derived | M1, Audit | Key gate: below = no detection needed (this path) |
| `conc_vs_qlav` | enum | — | `BELOW` if conc ≤ qlav, `ABOVE` if conc > qlav | Derived | M1, Audit | Second gate: above = 2 measures required |
| `conc_vs_rcl` | enum | — | `BELOW` if conc ≤ rcl, `ABOVE` if conc > rcl | Derived | M1, Audit | Underground gate |
| `c3_zone` | enum | — | `SAFE`, `ONE_MEASURE`, `TWO_MEASURES` | Derived | M1, Audit | Which C.3 regime applies |
| `measures_required` | int | — | `0`, `1`, or `2` | Derived | M1 | How many protective measures needed |
| `detection_is_chosen_measure` | bool\|null | — | User choice or null (MANUAL_REVIEW) | User/M1 | M1 | Is detection the chosen protective measure? null = not yet decided |
| `c3_decision_rule_id` | string | — | — | M1 | Audit | Which DET-C3-xxx rule was triggered |

---

## 16. CALCULATION TRACE — M1 Placement & Quantity

| Variable | Type | Unit | Formula | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `density_ratio` | float | — | `vapour_density / air_density` | Derived | M1 | Ratio that determines placement height |
| `density_band` | enum | — | `>1.5 → HEAVY, <0.8 → LIGHT, else NEUTRAL` | Derived | M1 | Which density band |
| `placement_rule_id` | string | — | — | M1 | Audit | PLC-HGT-xxx rule applied |
| `qty_normative_min` | int | — | `1` (base) + conditional extras (BG, NH3) | M1 | M2, Audit | Normative minimum — absolute floor |
| `qty_area_based` | int | — | `ceil(room_area / 100)` | Derived | M1 | Area-based recommendation (if area > 100m²) |
| `qty_zone_based` | int | — | `count(leak_source_zones)` | Derived | M1 | Zone-based recommendation |
| `qty_final_recommended` | int | — | `max(qty_normative_min, qty_area_based, qty_zone_based)` | Derived | M1, M2 | Final recommended count |
| `qty_formula_inputs` | object | — | `{normative, area, zone, which_max}` | Derived | Audit | All inputs shown for traceability |

---

## 17. CALCULATION TRACE — M1 Decision Path Evaluation

Each detection path (A-F) evaluated independently. All paths run even after first YES.

| Variable | Type | Unit | Formula | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `path_a_machinery_room` | object | — | `{evaluated: bool, result: YES/NO/SKIP, rule_id}` | M1 | Audit | Path A result + which rule |
| `path_b_c3_occupied` | object | — | `{evaluated: bool, result: YES/NO/MR/SKIP, rule_id, c3_zone}` | M1 | Audit | Path B with C.3 detail |
| `path_c_below_ground` | object | — | `{evaluated: bool, result: YES/NO/SKIP, rule_id, charge_vs_m2}` | M1 | Audit | Path C + charge comparison |
| `path_d_ammonia` | object | — | `{evaluated: bool, result: YES/NO/SKIP, rule_id, charge_vs_50kg}` | M1 | Audit | Path D NH3 special |
| `path_e_enclosure` | object | — | `{evaluated: bool, result: MR/SKIP, rule_id}` | M1 | Audit | Path E Location IV |
| `path_f_none` | object | — | `{evaluated: bool, result: NO, all_paths_negative: bool}` | M1 | Audit | Path F — detection not required |
| `paths_summary` | array | — | all path results collected | M1 | Audit | Complete audit: which paths triggered, which skipped |
| `detection_final_reason` | string | — | — | M1 | M2, Audit | Human-readable summary of why YES/NO/MR |

---

## 18. CALCULATION TRACE — M2 Power Budget & Scoring

| Variable | Type | Unit | Formula | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `power_per_detector` | array | W | `[{product_code, watts}]` per connected detector | DB lookup | M2 | Individual power consumption |
| `power_sum` | float | W | `SUM(power_per_detector[].watts)` | Derived | M2 | Total power draw on controller |
| `power_headroom` | float | W | `max_power_to_sensors - power_sum` | Derived | M2 | Remaining capacity |
| `power_budget_ok` | bool | — | `power_sum ≤ max_power_to_sensors` | Derived | M2 | Pass/fail |
| `power_budget_detail` | object | — | `{per_detector[], sum, max, headroom, ok}` | Derived | Audit | Complete breakdown |
| `score_breakdown` | object | — | see below | M2 | Audit | Per-criterion scoring detail |
| `score_application_fit` | int | — | `+3` if family matches default, `+1` if compatible | M2 | Audit | F12 criterion 1 |
| `score_output_match` | int | — | `+3` exact, `+1` partial | M2 | Audit | F12 criterion 2 |
| `score_existing_compat` | int | — | `+3` extends, `0` new, `-1` incompatible | M2 | Audit | F12 criterion 3 |
| `score_simplicity` | int | — | `+2` standalone, `+1` single ctrl, `0` multi | M2 | Audit | F12 criterion 4 |
| `score_expansion` | int | — | `+2` room, `0` exact, `-1` no room | M2 | Audit | F12 criterion 5 |
| `score_maintenance` | int | — | `+2` longest life, `+1` medium, `0` shortest | M2 | Audit | F12 criterion 6 |
| `score_features` | int | — | `+1` per feature (app, display, Modbus, etc.) | M2 | Audit | F12 criterion 7 |
| `score_total` | int | — | sum of all criteria | M2 | M3, Audit | = solution_score |

---

## 19. CALCULATION TRACE — M3 Discount Resolution

| Variable | Type | Unit | Formula | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `discount_source` | enum | — | `MATRIX`, `OVERRIDE`, `PROJECT_NET` | M3 | Audit | Where the discount came from |
| `discount_matrix_cell` | string | — | `"[customer_group][product_group]"` | M3 | Audit | Exact matrix cell used (e.g. "[2Fo][G] = 50%") |
| `discount_override_code` | string\|null | — | — | User | M3 | Customer-specific code if used |
| `discount_override_rate` | float\|null | % | DB lookup by discount_code | DB | M3 | Override rate if found |
| `discount_applied_pct` | float | % | final rate applied | M3 | Audit | The actual % used (from matrix or override) |
| `price_list_version_locked` | string | — | — | M3 | Audit | Price list version frozen at quote time |

### M3 Cross-Validation Variables **[NEW V5]**

| Variable | Type | Unit | Formula | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `m2_total_bom` | float | EUR | From M2 `total_bom` field | M2→M3 | Audit | M2's calculated total (list prices) for cross-validation |
| `line_m2_price` | float\|null | EUR | From M2 item `price` field | M2→M3 | Audit | M2's embedded unit price per line |
| `line_category` | enum | — | From M2 BOM section name | M2→M3 | Output | `detector`\|`controller`\|`power`\|`alert`\|`mounting`\|`service`\|`spare` |
| `price_validation` | enum | — | `MATCH` if m2_total = M3 total, else `MISMATCH` | M3 | Audit | Cross-check M2 vs M3 DB prices |
| `total_ht` | float | EUR | `= total_after_discount` | Derived | Output | **[V5]** Final quote amount HT (replaces total_incl_vat) |

---

## 20. GAPS STATUS (V5)

| # | Field | Status in V5 | Notes |
|---|-------|-------------|-------|
| 1 | `product_group` (A/C/D/F/G) | **RESOLVED** — Added to DB schema V5 | Assigned per product family |
| 2 | `is_discontinued` | **RESOLVED** — Added to DB schema V5 | Default: false |
| 3 | `power_watts` (TBD) | **PARTIAL** — null values flagged | X5, TR power TBD — need SAMON data |
| 4 | `country_exclusions` | **RESOLVED** — Added to DB schema V5 | Default: [] (empty, to be populated) |
| 5 | `list_price_eur` (0€) | **OPEN** | Ctrl10, LAN63/64/65 prices needed from SAMON |
| 6 | `dataset_version` | **RESOLVED** — Added to DB schema V5 | Set to "V5-2026-04" |
| 7 | `dataset_approval_status` | **RESOLVED** — Added to DB schema V5 | Set to "draft" |

---

## 21. TRACE ENGINE VARIABLES **[NEW IN V5]**

Variables introduced by the Trace Engine specification (`Trace_Engine_V5.md`). Used for execution tracing across all three engines.

### 21.1 TraceResult (Pipeline-Level)

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `trace_id` | string (UUID) | — | `"a1b2c3d4-..."` | System | Trace, Audit | Unique trace identifier |
| `trace_level` | enum | — | `full`, `summary`, `errors_only` | User/Config | Trace | Controls which steps are included in output |
| `trace_outcome` | enum | — | `SUCCESS`, `SUCCESS_WITH_WARNINGS`, `PARTIAL`, `FAILED` | Derived | Trace, Audit | Overall pipeline outcome |
| `pipeline_start` | datetime | — | ISO 8601 | System | Trace | Pipeline start timestamp |
| `pipeline_end` | datetime | — | ISO 8601 | System | Trace | Pipeline end timestamp |
| `total_duration_ms` | float | ms | `245.6` | Derived | Trace | Total pipeline execution time |
| `warnings_count` | int | — | `2` | Derived | Trace, Audit | Total warnings across all steps |
| `errors_count` | int | — | `0` | Derived | Trace, Audit | Total errors across all steps |
| `step_count` | int | — | `87` | Derived | Trace | Total number of TraceSteps |
| `m1_version` | string | — | `"V4D-5.0"` | System | Trace, Audit | Moteur 1 engine version |
| `m2_version` | string | — | `"PSE-5.0"` | System | Trace, Audit | Moteur 2 engine version |
| `m3_version` | string | — | `"PE-5.0"` | System | Trace, Audit | Moteur 3 engine version |
| `trace_version` | string | — | `"TE-5.0"` | System | Trace, Audit | Trace Engine specification version |

### 21.2 TraceStep (Per-Step)

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `step_id` | string | — | `"TS-001"` | System | Trace | Sequential step identifier |
| `step_engine` | enum | — | `M1`, `M2`, `M3` | System | Trace | Which engine produced the step |
| `step_function` | string | — | `"DET-MR-001"`, `"F3"`, `"P2"` | System | Trace | Function or rule identifier |
| `step_zone_id` | string\|null | — | `"z-001"` or `null` | System | Trace | Zone context (null if global) |
| `step_inputs` | object | — | `{is_machinery_room: true}` | Engine | Trace | Input key-value map |
| `step_rule_applied` | string | — | `"DET-MR-001"` | Engine | Trace | Rule or function evaluated |
| `step_norm_ref` | string\|null | — | `"EN 378-3:2016, 9.1"` | Engine | Trace | Standard clause reference |
| `step_rule_class` | enum\|null | — | `NORMATIVE`, `DERIVED`, etc. | Engine | Trace | Rule classification |
| `step_output` | object | — | `{detection_required: "YES"}` | Engine | Trace | Output key-value map |
| `step_decision` | string\|null | — | `"YES"`, `"NO"`, `"SKIP"`, `"BLOCK"` | Engine | Trace | Decision result |
| `step_explanation_fr` | string | — | `"Salle des machines -> detection obligatoire"` | Engine | Trace, UI | French human-readable explanation |
| `step_explanation_en` | string | — | `"Machinery room -> detection required"` | Engine | Trace, UI | English human-readable explanation |
| `step_warnings` | array | — | `[]` | Engine | Trace | Warnings generated |
| `step_errors` | array | — | `[]` | Engine | Trace | Errors generated |
| `step_duration_ms` | float | ms | `0.3` | System | Trace | Step execution time |
| `step_timestamp` | datetime | — | ISO 8601 | System | Trace | Step execution timestamp |

### 21.3 Dataset Version Tracking

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `refrigerant_dataset_version` | string | — | `"REF-2026-04"` | DB | Trace, Audit | Refrigerant properties data version |
| `product_catalogue_version` | string | — | `"CAT-2026-R2"` | DB | Trace, Audit | Product catalogue version |
| `discount_matrix_version` | string | — | `"DM-2022-11-28"` | DB | Trace, Audit | Discount matrix data version |

---

## 22. ADMIN SIMULATOR VARIABLES **[NEW IN V5]**

Variables introduced by the Admin Simulator specification (`Admin_Simulator_V3.md`). Used for the internal testing and validation tool.

### 22.1 Preset Management

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `preset_id` | string | — | `"pre-001"` | System | Simulator | Unique preset identifier |
| `preset_name` | string | — | `"R-717 MR 200kg"` | User | Simulator | Human-readable preset name |
| `preset_description` | string | — | `"Test NH3 machinery room detection"` | User | Simulator | What this scenario tests |
| `preset_category` | enum | — | `golden_test`, `edge_case`, `regression`, `training`, `custom` | User | Simulator | Preset classification |
| `preset_inputs` | object | — | (full scenario) | User | Simulator | Complete scenario input object |
| `preset_expected_outcomes` | object\|null | — | `{detection_required: "YES"}` | User | Regression | Expected results for comparison |
| `preset_created_by` | string | — | `"admin"` | System | Simulator | Creator user |
| `preset_created_at` | datetime | — | ISO 8601 | System | Simulator | Creation timestamp |
| `preset_last_run_at` | datetime\|null | — | ISO 8601 | System | Simulator | Last execution timestamp |
| `preset_last_run_outcome` | enum\|null | — | `SUCCESS` | System | Simulator | Last run pipeline outcome |
| `preset_tags` | array | — | `["NH3", "machinery_room"]` | User | Simulator | Searchable tags |

### 22.2 Comparison Mode

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `sim_comparison_mode` | bool | — | `true` | User | Simulator | Whether comparison mode is active |
| `sim_scenario_a` | object | — | (scenario inputs) | User | Simulator | First scenario in comparison |
| `sim_scenario_b` | object | — | (scenario inputs) | User | Simulator | Second scenario in comparison |
| `sim_diff_params` | array | — | `["site_power_voltage"]` | Derived | Simulator | Parameters that differ between A and B |
| `sim_diff_bom` | array | — | `[{added: [...], removed: [...]}]` | Derived | Simulator | BOM differences between A and B |
| `sim_diff_price` | object | — | `{eco_delta: 127.00, ...}` | Derived | Simulator | Price deltas between scenarios |

### 22.3 Regression Testing

| Variable | Type | Unit | Example | Source | Used by | Description |
|----------|------|------|---------|--------|---------|-------------|
| `regression_result` | enum | — | `PASS`, `FAIL` | System | Regression | Regression test outcome |
| `regression_diff` | object\|null | — | `{field: "detection_required", expected: "YES", actual: "NO"}` | System | Regression | Mismatch details if FAIL |

---

## 23. ENUMS REFERENCE — V5 ADDITIONS **[NEW IN V5]**

### trace_level
`full`, `summary`, `errors_only`

### trace_outcome
`SUCCESS`, `SUCCESS_WITH_WARNINGS`, `PARTIAL`, `FAILED`

### step_engine
`M1`, `M2`, `M3`

### preset_category
`golden_test`, `edge_case`, `regression`, `training`, `custom`

### regression_result
`PASS`, `FAIL`

---

## 24. GAPS STATUS (V5 — continued) **[NEW IN V5]**

| # | Field | Status in V5 | Notes |
|---|-------|-------------|-------|
| 1 | `product_group` (A/C/D/F/G) | **RESOLVED** (V2) | Assigned per product family |
| 2 | `is_discontinued` | **RESOLVED** (V2) | Default: false |
| 3 | `power_watts` (TBD) | **PARTIAL** (unchanged from V2) | X5, TR power TBD — need SAMON data |
| 4 | `country_exclusions` | **RESOLVED** (V2) | Default: [] (empty, to be populated) |
| 5 | `list_price_eur` (0 EUR) | **OPEN** (unchanged from V2) | Ctrl10, LAN63/64/65 prices needed from SAMON |
| 6 | `dataset_version` | **RESOLVED** (V2) | Set to "V5-2026-04" |
| 7 | `dataset_approval_status` | **RESOLVED** (V2) | Set to "draft" |
| 8 | Trace variables | **NEW — RESOLVED** | All trace variables defined in section 21 |
| 9 | Simulator variables | **NEW — RESOLVED** | All simulator variables defined in section 22 |
| 10 | Trace DB tables | **NEW — RESOLVED** | quote_traces, simulator_presets, simulator_runs defined in DB Schema V5 |
