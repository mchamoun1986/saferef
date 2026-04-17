# SAMON Product Selection Engine

**V5.0 — Simulator-validated rules + refined selection logic (updated to match simulator.html)**

Based on Product Guide 2025 — Revision 5.0 | April 2026

---

## Table of Contents

- Part I — System Architecture
- Part II — Selection Algorithm (13 Functions — F5/F6 removed in V5)
- Part III — Complete Product Catalogue
- Part IV — Accessories, Service Tools & Spare Sensors
- Part V — Order Code Decoder

---

## Part I — System Architecture

A SAMON gas detection system is composed of functional layers. Each layer answers a specific question in the selection process.

### 1.1 The 5 Functional Layers

Every SAMON installation follows this chain:

| Layer | Function | Question Answered | Key Concept |
|-------|----------|-------------------|-------------|
| 1. DETECT | Sensor reads gas concentration | What gas? What range? | Sensor technology determines product family |
| 2. OUTPUT | Detector communicates the measurement | Relay? Analog? Modbus? | A detector with analog output = transmitter function |
| 3. CONTROL | Signal processing & alarm decisions | Standalone or centralized? | Driven by number of detectors |
| 4. ALERT | Visual and audible notification | Built-in or external? | Accessories need power input |
| 5. POWER | Electrical supply to all components | What voltage on site? | One site power for everything |

### 1.2 Key Definitions

| Term | Definition | Examples |
|------|-----------|----------|
| Detector | Any device that detects gas. Can be standalone (has relays) or not. | MIDI, X5, G-Series, RM, TR-Series, MP-Series, GEX |
| Transmitter | A FUNCTION, not a product. Any detector with analog output acts as a transmitter. It can send proportional signal to a controller or PLC. | TR-Series (analog only = pure transmitter), MIDI (analog + relay + Modbus = hybrid), X5 (2x 4-20mA + relays = hybrid) |
| Standalone | A detector that can operate alone: has built-in relay outputs and/or alarm. Does NOT need a controller. | MIDI, X5, G-Series (all), RM/RMV |
| Non-standalone | A detector that REQUIRES a controller. Has analog output only, no built-in relay, no built-in alarm. | TR-Series, MP-Series, GEX |
| Controller | A device that receives signals from detectors/transmitters and provides alarm relay outputs, status display, and alarm management. | MPU (analog input), SPU/SPLS (analog input), LAN63/64 (relay input — RM only) |

### 1.3 Product Classification

| Product | Detector? | Transmitter? | Standalone? | Outputs | Needs Controller? |
|---------|-----------|-------------|-------------|---------|-------------------|
| GLACIAR MIDI | Yes | Yes (analog + Modbus) | Yes | Relay (2) + Analog (selectable) + Modbus RTU — ALL SIMULTANEOUS | No (standalone only — never connects to MPU) |
| GLACIAR X5 | Yes | Yes (2x 4-20mA) | Yes | Relay (2 alarm + 1 fault) + 2x 4-20mA — SIMULTANEOUS | No (optional) |
| G-Series (GS/GSR/GK/GR/GXR) | Yes | No (relay only) | Yes | Relay (3) | No — standalone ONLY, no controller connection |
| GSH | Yes | No (relay only) | Yes | Relay (3) | No |
| GSMB | Yes | Yes (Modbus) | Yes | Relay (3) + Modbus RTU | No |
| GSLS | Yes | No (relay only) | Yes | Relay (3) + built-in LED & buzzer | No |
| TR-Series | Yes | Yes (analog only) | NO | Analog only (4-20mA / 0-10V) | YES — mandatory |
| MP-Series | Yes | Analog to MPU | NO | Analog to controller (internal) | YES — mandatory (MPU/SPU) |
| GEX | Yes | Analog to MPU | NO | Analog to controller, ATEX | YES — mandatory (MPU/SPU) |
| RM / RMV | Yes | No | Yes | Relay (1) + buzzer + LED | No |

**V5 Key Change — MIDI standalone only**: MIDI never connects to MPU. There is no MIDI+MPU architecture. MIDI operates independently with its own relays, analog output, and Modbus. Remove all references to MIDI+MPU dual-control, MAX_MIDI_PER_MPU.

### 1.4 Analog Output in Detail

When a detector has analog output, it acts as a transmitter. The analog signal is proportional to gas concentration.

4-20mA is the industry standard. SAMON controllers (MPU/SPU) accept both 4-20mA and 0-10V as input. The voltage options on MIDI (0-5V, 1-5V, 2-10V) exist for compatibility with third-party PLCs that may require them.

**Analog Output per Product**

| Analog Type | Signal | Failsafe? | Zero Gas | Fault / Wire Cut | Used By |
|-------------|--------|-----------|----------|-------------------|---------|
| 4-20mA | Current loop | YES | 4mA | 0mA = FAULT detectable | STANDARD — MIDI, X5, TR-Series. Accepted by MPU/SPU and any PLC |
| 0-10V | Voltage | No | 0V | 0V = ambiguous (gas or fault?) | MIDI (selectable), TR (selectable). Accepted by MPU/SPU |
| 2-10V | Voltage | YES | 2V | 0V = FAULT detectable | MIDI only (selectable). For third-party systems |
| 1-5V | Voltage | YES | 1V | 0V = FAULT detectable | MIDI only (selectable). For third-party systems |
| 0-5V | Voltage | No | 0V | 0V = ambiguous | MIDI only (selectable). For third-party systems |

| Product | Analog Outputs | Selectable? | Failsafe Capable? | Number of Outputs |
|---------|---------------|-------------|-------------------|-------------------|
| GLACIAR MIDI | 4-20mA, 0-10V, 2-10V, 1-5V, 0-5V | Yes — via app or service wheel | Yes (on 4-20mA, 1-5V, 2-10V) | 1 |
| GLACIAR X5 | 4-20mA only | No — fixed | Yes (always) | 2 independent (output 1 = sensor 1, output 2 = sensor 2) |
| TR-Series | 4-20mA, 0-10V | Yes — selectable | Yes (on 4-20mA) | 1 |
| G-Series | None | — | — | 0 (relay only) |
| GSMB | None (Modbus digital) | — | Failsafe via Modbus | 0 (digital only) |
| MP-Series | Analog to MPU (internal) | — | Via controller | 1 (internal) |
| RM / RMV | None | — | — | 0 |

### 1.5 Simultaneous Outputs

Critical concept: on capable products, ALL outputs work at the same time.

| Product | Relay | Analog | Modbus | All Simultaneous? |
|---------|-------|--------|--------|-------------------|
| MIDI | 2 alarm relays | 1x selectable (4-20mA/0-10V/2-10V/1-5V/0-5V) | Modbus RTU over RS485 | YES — all three at once |
| X5 | 2 alarm + 1 fault relay | 2x 4-20mA independent | No | YES — relay + analog |
| G-Series | 3 alarm relays | No | No | Relay only |
| GSMB | 3 alarm relays | No | Modbus RTU | YES — relay + Modbus |
| GSLS | 3 alarm relays + LED + buzzer | No | No | Relay + built-in alert |
| TR-Series | No | 1x selectable (4-20mA/0-10V) | No | Analog only |
| MP-Series | No | Internal to MPU | No | Via controller only |
| RM/RMV | 1 alarm relay + buzzer + LED | No | No | Relay + built-in alert |

---

## Part II — Selection Algorithm (13 Functions)

The engine receives external inputs and runs 11 functions sequentially (F5 Existing System and F6 Connectivity removed in V5). Each function filters, selects, or validates.

### External Inputs (from sizing engine + client)

| Input | Variable Name | Source | Values | Impact |
|-------|---------------|--------|--------|--------|
| Application type | `zone_type` | Client / project brief | Supermarket, cold room, machinery room, hotel, parking, etc. | **REAL FILTER** — eliminates products not designed for the application (via F0) |
| Single refrigerant | `selected_refrigerant` | Client / project brief | R744, R32, R410A, R717, R290, CO, NO2, O2, NH3W, etc. | **[UPDATED V5]** User picks ONE refrigerant from dropdown. Drives gas group via REF_TO_GAS mapping (F3) |
| Detection range | `selected_range` | Auto/manual per refrigerant | 0-100ppm, 0-500ppm, 0-1000ppm, 0-5000ppm, 0-10000ppm, 0-30000ppm, 0-5%vol, etc. | **[NEW V5]** F3b — sub-step for refrigerants with multiple ranges. Auto-recommended by application |
| Number of detectors | `total_detectors` | Sizing engine (EN378, ASHRAE 15, room calc) | 1 to 108+ | Drives controller architecture (F7) |
| ATEX requirement | `zone_atex` | Site classification | None / Zone 1 | Hard filter on all products (F2) |
| Country | `project_country` | Client location | Country name | Availability, voltage, regulation (F1) |
| Output required | `output_required` | Client / project | Relay, 4-20mA, 0-10V, 2-10V, Modbus, Relay+Analog+Modbus, Relay+Dual 4-20mA, Any | **[NEW V5]** Direct user input for F4 |
| Site power | `site_power_voltage` | Site survey / client | **12V, 24V, 230V** | **[UPDATED V5]** 12V added. Selects voltage variants and power accessories (F9) |
| Mounting type | `mounting_type_required` | Site survey / project | Wall, Flush, Surface, Duct, Pipe, Pole, DIN rail | Determines mounting accessories and product compatibility (F10) |

**Removed inputs (V5)**:
- ~~`detector_count_future`~~ — removed, single detector count only
- ~~`existing_system_type`~~ — removed, F5 eliminated
- ~~`connectivity_preference`~~ — removed, F6 eliminated
- ~~`zone_gas_id` (multi-gas groups)~~ — replaced by `selected_refrigerant` (single refrigerant)

### F0. APPLICATION (`zone_type`) — **REAL FILTER [UPDATED V5]**

Purpose: **Eliminate products not designed for the selected application**. Each product has an `apps` array listing compatible `zone_type` values. F0 keeps only products where `product.apps.includes(zone_type)`.

This is NOT just informational — it is a hard filter that removes incompatible products before any other function runs.

| `zone_type` | Default Gas | Placement | Products Designed For This App |
|-------------|-------------|-----------|-------------------------------|
| Supermarket / food retail | CO2 + HFC | Low (~20cm) | MIDI CO2/HFC, MPS, MP-DS, TR-IR/SC, GSH, GSMB, GSLS, GS, GSR, X5 HFC IRR |
| Cold room / walk-in freezer | CO2 | Low | MIDI CO2/HFC, MPS, MP-DS, TR-IR/SC, GSH, GSMB, GSLS, GS, GSR |
| Industrial machinery room | NH3 | High (~20cm below ceiling) | X5 NH3/CO2/O2/R290, GXR, GEX, MIDI NH3, TR-EC NH3 |
| Cold storage / food processing | NH3 or CO2 | NH3=high, CO2=low | X5, MIDI NH3/CO2, TR-EC/IR, MPS, MP-DS, GSH, GS, GSR |
| Hotel room (VRF/VRV) | HFC (R410A) | Low, under evaporator | RM, RMV **only** |
| Office (VRF) | HFC | Low | RM, RMV **only** |
| Parking garage | CO + NO2 | Per regulation | X5 CO, X5 NO2, TR-EC CO, TR-EC NO2 |
| Ice rink / stadium | NH3 | High | X5 NH3, MIDI NH3, TR-EC NH3 |
| Heat pump | R290 | Low | MIDI R290, GS HC, MP-DS HC, TR-SC HC, X5 R290 |
| Pressure relief / vent line | NH3 or HFC | On pipe | GR, TR-SCR, MP-DR2 |
| Ventilation duct | HFC | In duct | GK, TR-SCK, MP-DK, MIDI Remote (duct) |
| ATEX Zone 1 | HFC / NH3 / HC | Per ATEX rules | X5, GXR, GEX |
| Water/brine secondary cooling | NH3 in liquid | In pipe | Aquis 500 |

**Product → Application Mapping (from simulator `PRODUCT_APPS`)**:

Each product has a fixed `apps` array. Examples:
- `MIDI_CO2_10k.apps = ['supermarket','cold_room','cold_storage','heat_pump']`
- `RM_HFC.apps = ['hotel','office']`
- `X5_CO.apps = ['parking']`
- `GK_HFC_24.apps = ['duct']`

### F1. COUNTRY (`project_country`) — Hard Filter

Purpose: Remove products not available in the selected country. Set power standard and regulatory reference.

Output: AVAILABLE_PRODUCTS = full catalogue minus country exclusions. Power standard set. Regulation reference set.

| Country Impact | Details | Example |
|----------------|---------|---------|
| Product availability | Some models not sold in certain markets | Country-specific exclusion list (to be populated) |
| Power standard | EU/Middle East/Africa = 230V, US/Canada = 110V | Affects suffix selection (24 vs 230) |
| Regulation reference | EU = EN378, US = ASHRAE 15, other = local | Guidance only, installer responsibility |
| Specific restrictions | Some products limited to certain countries | UPS1000 (4000-0003) = Sweden only |
| Calibration gas | Availability varies | 6120-XXXX = Europe only |

### F2. ATEX (`zone_atex`) — Hard Filter

Purpose: If ATEX Zone 1, eliminate all non-ATEX products from the list.

| ATEX Zone | Detectors Allowed IN Zone | Eliminated | Controller Rule | Accessories IN Zone |
|-----------|--------------------------|------------|-----------------|---------------------|
| None | ALL products | Nothing | Any location | All accessories allowed |
| Zone 1 | X5 (full ATEX transmitter + sensors), GEX (ATEX flameproof sensor), GXR (ATEX remote sensor) | MIDI, GS/GSH/GSMB/GSLS/GR/GK/GSR, RM/RMV, TR, MP-DS/DK/DR2 | MUST be OUTSIDE ATEX zone (MPU/SPU/LAN in safe area) | ONLY ATEX-certified: X5 stopping plugs (3500-0031), X5 cable glands (3500-0030). Standard sirens/lights OUTSIDE zone only |

### F3. DETECT — Single Refrigerant Selection **[UPDATED V5]**

Purpose: User selects ONE refrigerant from a dropdown. Each product has a `refs` array of compatible refrigerants. F3 filters by `product.refs.includes(selectedRefrigerant)`.

**Key V5 change**: No multi-gas group selection. User picks a single refrigerant (e.g., R744, R410A, R717). The engine maps it to a gas group via `REF_TO_GAS` for internal use but filters products by exact refrigerant match against `product.refs`.

**Refrigerant → Gas Group Mapping (`REF_TO_GAS`)**:

| Refrigerant | Gas Group | Notes |
|-------------|-----------|-------|
| R744 | CO2 | IR sensor |
| R32, R407A/C/F, R410A, R448A, R449A, R452A/B, R454A/B/C, R455A, R464A, R465A, R466A, R468A, R507A | HFC1 | SC sensor, Group 1 calibration |
| R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd | HFC2 | SC sensor, Group 2 calibration |
| R717 | NH3 | EC or Ionic sensor |
| R290, R50, R600a, R1150, R1270 | R290 (HC) | SC sensor |
| CO | CO | EC sensor |
| NO2 | NO2 | EC sensor |
| O2 | O2 | EC sensor |
| NH3W | NH3W | pH electrode (Aquis 500) |

**Product `refs` arrays (examples from simulator)**:
- `MIDI_HFC1.refs = ['R32','R407A','R407C','R407F','R410A','R448A','R449A','R452A','R452B','R454A','R454B','R454C','R455A','R464A','R465A','R466A','R468A','R507A']` (all HFC Group 1)
- `RM_HFC.refs = ['R32','R410A']` (only 2 HFC refrigerants)
- `GS_HFC_A_24.refs = [..._ALL_HFC]` (all HFC Group 1 + Group 2)
- `MIDI_R290.refs = ['R290','R50','R600a','R1150','R1270']` (all HC)

### F3b. DETECTION RANGE — Sub-Step **[NEW V5]**

Purpose: For refrigerants with multiple detection ranges, a range dropdown appears after refrigerant selection. The range is auto-selected based on application with a "RECOMMENDED" label. Filters products by exact range match (`product.range === selectedRange`).

If range filtering leaves zero products, the range filter is skipped (fallback).

**Refrigerants with Multiple Ranges (`REF_RANGES`)**:

| Refrigerant | Available Ranges | Notes |
|-------------|-----------------|-------|
| R717 (NH3) | 0-100ppm (early warning), 0-500ppm (standard monitoring), 0-1000ppm (industrial standard), 0-5000ppm (high concentration) | 4 ranges available |
| R744 (CO2) | 0-5000ppm (X5), 0-10000ppm (standard), 0-30000ppm (high range), 0-5%vol (very high) | 4 ranges available |
| CO | 0-100ppm (X5), 0-300ppm (TR) | 2 ranges |
| NO2 | 0-5ppm (X5), 0-20ppm (TR) | 2 ranges |

**Application Default Ranges (`APP_DEFAULT_RANGE`)**:

| Application | R717 Default | R744 Default | CO Default | NO2 Default |
|-------------|-------------|-------------|-----------|------------|
| machinery_room | 0-1000ppm | 0-10000ppm | — | — |
| cold_storage | 0-100ppm | 0-10000ppm | — | — |
| ice_rink | 0-500ppm | 0-10000ppm | — | — |
| supermarket | — | 0-10000ppm | — | — |
| cold_room | — | 0-10000ppm | — | — |
| parking | — | — | 0-100ppm | 0-5ppm |

Refrigerants with only one range (e.g., all HFC/HFO, R290) skip this step — no dropdown shown.

### F4. OUTPUT (`output_required`) — **[UPDATED V5]**

Purpose: Direct user input for required output type. Filters compatible products. Key rule: "Relay only" means **standalone products with own built-in relays** — non-standalone products (MP, TR, GEX) are eliminated even though their controllers have relays.

| `output_required` | Compatible Products | Eliminated | Notes |
|-------------------|-------------------|------------|-------|
| Any (no constraint) | ALL | None | — |
| Relay only (standalone) | MIDI, G-Series, X5, RM/RMV | TR, MP, GEX | Only products with own built-in relays |
| Analog: 4-20mA | MIDI (selectable), X5 (fixed), TR (to PLC) | G-Series, RM, MP (internal to MPU only) | MP analog goes internally to MPU, no pass-through to BMS |
| Analog: 0-10V | MIDI (selectable), TR (selectable) | X5 (4-20mA fixed), G-Series, RM, MP | — |
| Analog: 2-10V or 1-5V or 0-5V | MIDI ONLY (selectable) | All others | — |
| Modbus RTU | MIDI (standard), GSMB | All others | — |
| Simultaneous: relay + analog + Modbus | MIDI ONLY | All others | All three outputs at once |
| Simultaneous: relay + dual analog | X5 ONLY | All others | 2 alarm + 2x 4-20mA |

### ~~F5. EXISTING SYSTEM~~ — **[REMOVED V5]**

*Removed from selection flow in V5. The simulator assumes new installations.*

### ~~F6. CONNECTIVITY~~ — **[REMOVED V5]**

*Removed from selection flow in V5. Connectivity is informational, not a selection filter.*

### F7. CONTROL (Driven by `total_detectors`) — **[UPDATED V5]**

Purpose: Select the controller architecture based on the number of detectors.

**Key V5 Rules:**
- **MIDI = standalone only** — MIDI never connects to MPU. No MIDI+MPU architecture. No MAX_MIDI_PER_MPU.
- **G-Series**: Standalone ONLY — cannot connect to any controller
- **LAN63/64**: Only for **RM detectors** (relay input from RM)
- **Power Adapter 4000-0002**: Works ONLY with GLACIAR MIDI, **1 adapter per MIDI**
- **Controller needed only for**: TR-Series, MP-Series, GEX (non-standalone products)

| `total_detectors` | Recommended | Order Code | Notes |
|-------------------|-------------|------------|-------|
| 1 | Standalone (MIDI/G/X5/RM) | — | Simplest, lowest cost. SPU/SPLS if 3 relays needed |
| 2 | MPU2C + 2x detectors (non-standalone) or 2x standalone | 20-310 | Or X5 dual sensor (same room) |
| 3-4 | MPU4C + detectors (non-standalone) | 20-300 | Check 10W budget |
| 5-6 | MPU6C + detectors (non-standalone) | 20-305 | CRITICAL: check 10W budget! Max 4x MPS-CO2 or 5x MP-DS |
| 7+ (non-RM) | Multiple MPU6C | 20-305 x N | ceil(detectors/6) MPUs |
| 7-12 (RM) | LAN63-PKT + RM | 81-100 | LAN is RM ONLY |
| 13-24 (RM) | LAN63/64-PKT + RM | 81-200 | Master + slave |
| 25-108 (RM) | LAN63 + LAN64 slaves | 81-110 + 81-120 | Max 108 inputs |

**Cheapest Controller Combination Algorithm [NEW V5]**

For non-standalone products, the engine finds the cheapest combination of controllers (SPU/SPLS + MPU2C/4C/6C) that covers all detectors, respecting both **channel count** AND **10W power budget** per controller.

Available controllers for the algorithm:

| Controller | Channels | Max Power | Price (24V/230V) |
|-----------|----------|-----------|------------------|
| SPU24 / SPU230 | 1 | 10W | 424€ / 455€ |
| SPLS24 / SPLS230 | 1 | 10W | 546€ / 546€ |
| MPU2C | 2 | 10W | 1168€ |
| MPU4C | 4 | 10W | 1598€ |
| MPU6C | 6 | 10W | 2004€ |

Each controller's effective capacity = `min(channels, floor(maxPower / detectorPower))`. The algorithm brute-forces all MPU combinations, then fills remaining slots with the cheapest 1-channel controller (SPU or SPLS based on site voltage).

**MPU Power Budget (`max_power_to_sensors`) — Critical Validation**

WARNING: MPU6C has 6 channels but max 10W — you cannot always fill all 6 channels!

| Detector | Power | Max on MPU6C (10W) | Max on MPU4C (10W) | Max on MPU2C (10W) |
|----------|-------|-------------------|-------------------|-------------------|
| MPS-CO2 (IR) | 2.5W | 4 units (10W) | 4 units (10W) | 2 units (5W) |
| MP-DS-HFC (SC) | ~2W | 5 units (10W) | 4 units (8W) | 2 units (4W) |
| MP-DS-HC/H2/Propane | ~2W | 5 units | 4 units | 2 units |
| MP-DK2 / MP-DR2 | ~2W | 5 units | 4 units | 2 units |
| GEX-SC | ~2W | 5 units | 4 units | 2 units |

### F8. ALERT — **[UPDATED V5]**

Purpose: Select alert method. User picks an external alert accessory from a dropdown. Alert selection dynamically updates BOM pricing for all solutions.

**Built-in Alerts (in detector or controller)**

| Product | LED | Buzzer | Display | Notes |
|---------|-----|--------|---------|-------|
| MIDI | Yes (status LEDs) | No | No | Visual only |
| X5 | Yes | No | Yes (digital: ppm + status) | Best built-in feedback |
| G-Series (GS/GSH/GSR/GK/GR/GXR) | Yes (status LEDs) | No | No | Visual only |
| GSLS | Yes (high-intensity) | Yes | No | Best built-in alert in G-Series |
| RM / RMV | Yes (tri-colour) | Yes (85dB) | No | Designed for occupied spaces |
| MPU | Yes (per-channel) | NO | No | LEDs only, NO buzzer |
| SPU | Yes | NO | No | LEDs only |
| SPLS | Yes (high-intensity) | Yes | No | SPU + audio-visual |
| LAN63/64 | Yes (per-input) | NO | No | LEDs only, NO buzzer |
| TR-Series | No | No | No | NO built-in alert at all |
| MP-Series | No | No | No | NO built-in alert at all |

**External Alert Accessories with Prices [UPDATED V5]**

| Key | Product | Order Code | Power Input | `ip_rating` | Price | dB | Color |
|-----|---------|-----------|-------------|-------------|-------|-----|-------|
| fl_rl_r | FL-RL-R Combined light+siren Red | 40-440 | 18-28V DC | IP65 | **150€** | 95dB | Red |
| fl_ol | FL-OL-V-SEP Combined light+siren Orange | 40-442 | 18-28V DC | IP65 | **150€** | 95dB | Orange |
| fl_bl | FL-BL-V-SEP Combined light+siren Blue | 40-441 | 18-28V DC | IP65 | **150€** | 95dB | Blue |
| siren | 1992-R-LP Siren | 40-410 | 9-28V DC | IP54 | **120€** | 95dB | — |
| flash_red | BE-R-24VDC Flashing light Red | 40-4022 | 9-60V DC | IP54 | **85€** | — | Red |
| flash_orange | BE-A-24VDC Flashing light Orange | 40-4021 | 9-60V DC | IP54 | **85€** | — | Orange |
| flash_blue | BE-BL-24VDC Flashing light Blue | 40-4023 | 9-60V DC | IP54 | **85€** | — | Blue |
| sock_h_r | SOCK-H-R High socket IP65 Red | 40-415 | 24V | IP65 | **100€** | — | Red |
| — | SOCK-H-R-230 (230V socket) | 40-420 | 230V AC | IP65 | **100€** | — | — |

**Alert Quantity Rules [UPDATED V5]:**
- **MPU architecture (non-standalone)**: 1x alert accessory per MPU controller
- **Standalone**: 1x alert accessory per detector (each detector drives its own alert)
- Alert accessories are **NOT ATEX certified** — must be installed OUTSIDE the ATEX zone. **ATEX warning only shown if ATEX is active.**

Alert trigger source: detector relay output (standalone) OR controller relay output (MPU/SPU/LAN) OR MPU 24V/150mA output.

### F9. POWER (`site_power_voltage`) — **[UPDATED V5 — 12V added]**

Purpose: Select product voltage variants and power accessories based on one site power. Same power for detectors, controllers, and alert accessories.

**Three voltage options: 12V, 24V, 230V**

| `site_power_voltage` | Products KEPT | Products ELIMINATED | Conversion |
|----------------------|---------------|---------------------|------------|
| 12V DC | RM (12-24V), G-Series 24V (12-24V), TR (12-30V) | **MIDI (min 15V), X5 (min 18V), G-Series 230V, MP (needs MPU at 24V), AQUIS (230V)** | Most limited selection |
| 24V DC/AC | MIDI, RM, G-Series 24V, TR, X5, MP | G-Series 230V variants | None needed |
| 230V AC | MIDI (with 4000-0002), G-Series 230V, MP (via MPU 230V), AQUIS | **TR, X5, RM, G-Series 24V** — no SAMON adapter | Power Adapter 4000-0002: **1 per MIDI** |

**12V Voltage Minimums per Family**:

| Family | Minimum Voltage | Accepted on 12V? |
|--------|----------------|-------------------|
| RM | 12V | YES |
| G-Series (24V variants) | 12V | YES |
| TR-Series | 12V | YES |
| MIDI | 15V | **NO — eliminated** |
| X5 | 18V | **NO — eliminated** |
| MP-Series | 24V (via MPU) | **NO — eliminated** |
| AQUIS | 230V | **NO — eliminated** |

**Power Adapter 4000-0002 [UPDATED V5]:**
- Works **ONLY with GLACIAR MIDI** — not compatible with TR, X5, RM, or any other product
- Quantity: **1 per MIDI** (not shared)
- Input: 85-305V AC → Output: 24VDC 1.3A (31.2W)
- Price: **99€**
- Added **per solution** only for MIDI solutions on 230V site (not global)

**Battery Backup**

| Product | Code | Output | Max Load | Batteries | Notes |
|---------|------|--------|----------|-----------|-------|
| UPS5000 | 40-221 | 6/12/24V DC | 4A | 12V/7Ah (80-320) — order separately | IP21. Batteries = dangerous goods shipping |
| UPS1000 | 4000-0001 | 27.3V DC | 1A | 2x 12V/1.2Ah (4000-0004) | Parallelable. Without batteries. |
| UPS1000 (Sweden) | 4000-0003 | 27.3V DC | 1A | Included | Sweden only |

### F10. INSTALL (`mounting_type_required`)

Purpose: Determine mounting type, `ip_rating`, temperature range, remote sensor need, and protection accessories.

**Mounting Types**

**[UPDATED V5]** — Accessory restrictions clarified.

| `mounting_type_required` | Products | Accessories Needed |
|--------------------------|----------|-------------------|
| Wall mount (standard) | Most products | None |
| Flush mount (aesthetic) | RMV-HFC | KAP045 back-box — **RM/RMV only** |
| Surface mount (aesthetic) | RMV-HFC | KAP046 back-box — **RM/RMV only** |
| Duct mount | GK, TR-SCK, MP-DK | MSVK duct kit (60-800) — **GLACIAR MIDI Remote only** |
| Pipe / vent line | GR, TR-SCR, MP-DR2 | Pipe Adapter (62-9031) — **GLACIAR MIDI Remote only** |
| Pole mount | X5 | Pole Clamp (3500-0086) — **GLACIAR MIDI Remote only** |
| DIN rail | LAN63/64 (panel only) | None |

**`ip_rating` & Temperature**

| Product | `ip_rating` | Temperature Range |
|---------|-------------|-------------------|
| MIDI | IP67 | -40C to +50C |
| X5 | IP66 | -20C to +55C |
| GS/GSR/GK/GR (SC) | IP54 | -40C to +50C |
| GSH/GSMB/GSLS (IR) | IP67 | -40C to +50C |
| GXR (ATEX remote) | IP54 | -40C to +50C |
| TR-SC/SCK/SCR | IP54 | -40C to +50C |
| TR-IR | IP67 | -40C to +50C |
| TR-EC NH3 | IP67 | -30C to +50C |
| TR-EC CO/NO2 | IP67 | -10C to +40C |
| MP-DS/DK/DR2 | IP54-IP67 | -40C to +50C |
| MPS (IR) | IP67 | -40C to +50C |
| RM/RMV | IP21 | Indoor only |
| MPU | IP66 | -40C to +50C |
| SPU/SPLS | IP67 | -40C to +50C |

**Remote Sensor Options**

| Product | Remote Option | Cable | Use Case | Requires |
|---------|-------------|-------|----------|----------|
| MIDI Remote | 31-5xx series | Standard | Sensor in cold zone, electronics in warm zone | Nothing extra |
| X5 Config B | 1 direct + 1 remote | Up to remote distance | Mixed local + remote | D44 Power Filter (3500-0029) + Cable Glands (3500-0030) |
| X5 Config C | 2 remote | Up to remote distance | Both sensors remote | D44 Power Filter + Cable Glands |
| GSR | Remote sensor | 1.5m cable | Splash-proof remote | Nothing extra |
| GXR | ATEX remote sensor | 5m cable | ATEX zone sensor, controller outside | Nothing extra |
| GK / TR-SCK / MP-DK | Duct remote | 1.5m cable | Sensor in duct | Nothing extra |
| GR / TR-SCR / MP-DR2 | Vent line remote | Pipe fitting | Pressure relief valve monitoring | Nothing extra |

### F11. VALIDATE

Purpose: Run all validation checks on EACH valid solution before generating BOM. Any failure = solution blocked or warning issued.

| Check | Rule | Fail Action |
|-------|------|-------------|
| MPU Power Budget (`max_power_to_sensors`) | Sum of all connected detector power <= 10W | ERROR: reduce detectors, split across 2x MPU, or switch to LAN/standalone |
| X5 Remote -> D44 Power Filter | Any X5 remote sensor -> MUST include 3500-0029 | ERROR: add D44 to BOM |
| X5 Remote -> Cable Glands | Any X5 remote sensor -> MUST include 3500-0030 | ERROR: add cable glands |
| X5 Gas Collector Cone | 3500-0088 requires Splash Guard (3500-0090) + single sensor head only | ERROR: add splash guard or remove cone |
| X5 Protection Filter Disk | 3500-0089 requires Splash Guard (3500-0090) | ERROR: add splash guard |
| RMV back-box | RMV-HFC requires KAP045 (flush) or KAP046 (surface) | ERROR: add back-box |
| MP-Series / GEX controller | MP-Series and GEX MUST have MPU or SPU | ERROR: add controller |
| GEX ATEX zone | GEX in ATEX zone -> controller OUTSIDE zone | WARNING: installation note |
| 230V site + MIDI | MIDI needs 24V -> add Power Adapter (4000-0002) per MIDI | ERROR: add power adapter |
| 230V site + alerts | External alert accessories need SOCK-H-R-230 (40-420) | ERROR: add 230V socket |
| ATEX compliance | All products IN zone must be ATEX certified | ERROR: replace non-ATEX products |
| Expansion capacity | Controller channels >= total detectors | WARNING: controller too small |
| Expansion power | Power budget usage <= 80% | WARNING: power budget tight |
| Temperature range | Site min temp >= product min operating temp | ERROR: product cannot operate at site temperature |
| `ip_rating` | Required IP <= product `ip_rating` | ERROR: product IP insufficient for environment |
| Country availability (`project_country`) | Product available in selected country | ERROR: product not available, suggest alternative |
| Aquis brine type | Aquis 500 order MUST specify brine type | WARNING: ask client for brine type |
| Battery shipping | Batteries (80-320, 4000-0004) = dangerous goods | WARNING: recommend local purchase to avoid shipping cost |

**Service Tools (Auto-Recommend)**

**[UPDATED V5]** — SM300 modules only recommended when DT300 is present.

| If BOM Contains | Recommend | Order Code |
|----------------|-----------|------------|
| G-Series or MP-Series | DT300 diagnostic tool | 60-130 |
| MIDI | Calibration Adapter v2.0 | 62-9011 |
| X5 | X5 Calibration Kit — **X5 only** | 3500-0094 |
| G-Series / MPU / SPU | SA200 basic service tool | 60-120 |
| DT300 + SC sensor | SM300-HFC (for DT300) — **only if DT300 present** | 60-134 |
| DT300 + HC/propane | SM300-HC (for DT300) — **only if DT300 present** | 60-132 |
| DT300 + NH3 | SM300-NH3 (for DT300) — **only if DT300 present** | 60-136 / 60-137 |

**Spare Sensor Planning (Auto-Recommend)**

| `sensor_tech` | `sensor_life` | Replacement Cycle | Plan |
|---------------|---------------|-------------------|------|
| IR (CO2, X5 IRR) | 7-10 years | Long | Stock 1 spare per 10 detectors |
| SC (HFC/HFO/R290) | ~5 years | Medium | Stock 1 spare per 5 detectors |
| EC (NH3/CO/NO2) | 2-3 years | Short — CRITICAL | Stock 1 spare per 2-3 detectors, plan annual budget |
| Ionic EC (X5 NH3) | 5 years | Medium | Stock 1 spare per 5 detectors |
| Pellister (X5 MK8) | 2-5 years | Medium | Stock 1 spare per 5 detectors |

### F12. BOM OUTPUT — **[UPDATED V5]**

Purpose: Generate ALL valid solutions, ranked by `solution_score`. Each product variant = its own solution. Each solution includes a complete bill of materials with full pricing.

**3 Solution Tiers [NEW V5]**

| Tier | Label | Selection Criteria | Score Bonus |
|------|-------|-------------------|-------------|
| PREMIUM | Best technology | Best sensor tech + features. IR for CO2/HFC, Ionic/EC for NH3. Sorted by score descending. | +5 |
| STANDARD | Balanced | Mid-tier products. Sorted by total price ascending, then score. | +3 |
| CENTRALIZED | With controller | Only shown if `total_detectors > 1`. Non-standalone products (MP, TR, GEX) requiring controller. Sorted by total price ascending. | +1 (economic) |

**Product Tier Assignment (`PRODUCT_TIERS` — configurable per product)**:

Each product has a configurable `tier` field (premium/standard/economic) stored in `PRODUCT_TIERS`:

| Product | Tier | Rationale |
|---------|------|-----------|
| MIDI CO2 (IR) | premium | Best tech (IR) + best features (Bluetooth, Modbus, analog, app) |
| MIDI HFC (SC) | standard | Basic tech (SC) but MIDI features elevate it |
| MIDI NH3 (EC) | premium | Right tech (EC) + MIDI features |
| MIDI R290 (SC) | standard | SC + MIDI features |
| X5 NH3 (Ionic 5y) | premium | Best NH3 sensor + ATEX + display |
| X5 CO2 (IR) | premium | Best CO2 tech + ATEX |
| X5 HFC IRR (IR) | premium | IR = best HFC tech |
| X5 CO/NO2/O2 (EC) | standard | Only tech for these gases |
| X5 R290 (SC) | standard | SC tech |
| G-Series CO2 (IR) | standard | Good tech, limited features |
| G-Series HFC/HC (SC) | economic | Basic tech, basic features |
| GXR ATEX (SC) | standard | ATEX adds value |
| RM/RMV | economic | Basic room detector |
| TR-Series (all) | economic | Transmitter only, needs controller |
| MP-Series (all) | economic | Sensor head, needs controller |
| GEX (all) | economic | Needs controller |
| Aquis 500 | standard | Niche, only option for NH3 in water |

Tier scoring: `TIER_SCORE = {premium: 5, standard: 3, economic: 1}`

**Scoring — 6 Criteria [UPDATED V5]**

Removed: "System compatibility" (F5 removed) and "Future expansion" (`detector_count_future` removed).

| Priority | Criteria | Score Range | Logic |
|----------|---------|-------------|-------|
| 1 | **Tier priority** | +5 / +3 / +1 | From product's configurable tier: premium=+5, standard=+3, economic=+1 |
| 2 | **Application fit** | +3 / +1 | +3 if product family matches application default products, +1 if compatible but not primary |
| 3 | **Output match** | +3 / +2 / +1 | +3 if exact match (e.g., Modbus needed → MIDI), +2 if no constraint, +1 default |
| 4 | **Simplicity** | +2 / +1 | +2 standalone (fewer components), +1 non-standalone (needs controller) |
| 5 | **Maintenance cost** | +2 / +1 / +0 | +2 longest `sensor_life` (IR, Ionic), +1 medium (SC, pH), +0 shortest (EC) |
| 6 | **Feature richness** | +0 to +6 | +1 per: Modbus, analog, ATEX, remote. +2 for MIDI family, +2 for X5 family |

**Full BOM Pricing [NEW V5]**

Total solution price is calculated dynamically and includes ALL items:

| Component | Calculation | Updates On |
|-----------|-------------|------------|
| Detectors | `product.price × total_detectors` | Fixed |
| Controller combo | Cheapest MPU/SPU combination (F7 algorithm) | Fixed |
| Power Adapter | 99€ × `total_detectors` (only MIDI on 230V) | Fixed |
| Alert accessories | `alert.price × alertQty` (from F8 dropdown) | Alert change |
| SOCK-H-R-230 | 100€ × `alertQty` (only on 230V site) | Alert change |

Alert quantity: `alertQty = mpuCount` (if non-standalone with MPUs) or `total_detectors` (if standalone).

Total BOM updates dynamically when alert accessory selection changes in F8.

**BOM Output Format (per solution)**

| Section | Content |
|---------|---------|
| DETECTORS | Qty × Model | Order Code | Gas | Range | Price | Sensor Tech / Life | IP / Temp |
| DETECTOR SPECS | Power, Voltage, Relays (spec), Analog type, Modbus type, Connection, Features |
| CONTROLLER (if non-standalone) | Qty × Model | Code | Channels | Max detectors (ch & power) | Unit Price | Subtotal |
| CONTROLLER SPECS | Voltage, Power to sensors, Relay outputs, IP, Analog in/out, RS485, Display type, Temp range, Mounting, Cable max, Failsafe, Features |
| POWER ACCESSORIES | Qty × Power Adapter (4000-0002) | Code | Unit Price | Subtotal | Reason (per MIDI on 230V) |
| MOUNTING ACCESSORIES | Item | Code (KAP045/046, MSVK, Pipe Adapter, Pole Clamp) |
| ALERT ACCESSORIES | Qty × Alert | Code | Type | Power | IP | Unit Price | Subtotal + SOCK-H-R-230 if 230V |
| TOTAL BOM | Sum of all above — updates dynamically |
| SERVICE TOOLS (recommended) | Tool | Code |
| SPARE SENSORS (recommended) | Tech | Sensor Life | Stocking Plan |

**Price Comparison Table**: When 2+ solutions have prices, a comparison table shows detectors cost, controller cost, total, and delta vs cheapest.

---

## Part III — Complete Product Catalogue

All SAMON products with order codes, organized by family. Refer to Part II for selection logic.

**Product Database Fields [NEW V5]**

Each product in the simulator has these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique product identifier |
| `name` | string | Display name |
| `code` | string | SAMON order code |
| `family` | string | Product family (MIDI, X5, G, RM, TR, MP, AQUIS) |
| `gas` | string[] | Gas groups detected |
| `refs` | string[] | Compatible refrigerants (for F3 filtering) |
| `tech` | string | Sensor technology (IR, SC, EC, IONIC, pH) |
| `range` | string | Detection range |
| `ip` | string | IP rating |
| `tempMin` / `tempMax` | number | Operating temperature range |
| `power` | number | Power consumption in watts |
| `voltage` | string | Input voltage range |
| `relay` | number | Number of relay outputs |
| `analog` | string/null | Analog output type (selectable, 4-20mA x2, to MPU, etc.) |
| `modbus` | boolean | Has Modbus RTU |
| `standalone` | boolean | Can operate without controller |
| `atex` | boolean | ATEX certified |
| `mount` | string[] | Compatible mounting types |
| `remote` | boolean | Has remote sensor |
| `price` | number/null | Unit price in EUR |
| `sensorLife` | string | Sensor lifespan |
| `powerDesc` | string | Power description |
| `relaySpec` | string | Relay specification |
| `analogType` | string/null | Analog output details |
| `modbusType` | string/null | Modbus protocol details |
| `connectTo` | string | Connection options |
| `features` | string | Feature description |
| `tier` | string | Product tier (premium/standard/economic) |
| `apps` | string[] | Compatible applications (zone_types) |

**Controller Database Fields [NEW V5]**

Each controller has:

| Field | Type | Description |
|-------|------|-------------|
| `channels` | number | Number of input channels |
| `maxPower` | number | Max power to sensors (W) |
| `price` | number | Unit price EUR |
| `relayOutputs` | number | Number of relay outputs |
| `relaySpec` | string | Relay specification |
| `analogIn` | string | Analog input description |
| `analogOut` | string | Analog retransmission |
| `rs485` | boolean | Has RS485 |
| `display` | boolean | Has display |
| `displayType` | string | Display type |
| `led` | boolean | Has status LEDs |
| `failsafe` | boolean | Has failsafe |
| `tempRange` | string | Operating temperature |
| `mounting` | string | Mounting type |
| `cableMax` | string | Max cable length |
| `features` | string | Feature description |

### 3.1 GLACIAR MIDI

IP67, -40/+50C, Bluetooth app, Modbus RTU, selectable analog, 2 alarm relays, service wheel, magnetic switch, pre-calibrated sensor modules.

| Code | Model | Gas | `detection_range` | `sensor_tech` | Price | Mounting |
|------|-------|-----|-------------------|---------------|-------|---------|
| 31-210-32 | MIDI IR CO2 10000ppm | CO2 | 0-10000 ppm | IR | 673€ | Built-in |
| 31-510-32 | MIDI Remote IR CO2 10000ppm | CO2 | 0-10000 ppm | IR | 739€ | Remote |
| 31-220-12 | MIDI SC HFC/HFO Group 1 1000ppm | HFC/HFO Grp1 | 0-1000 ppm | SC | 403€ | Built-in |
| 31-520-12 | MIDI Remote SC HFC/HFO Group 1 | HFC/HFO Grp1 | 0-1000 ppm | SC | 469€ | Remote |
| 31-220-17 | MIDI SC HFC/HFO Group 2 1000ppm | HFC/HFO Grp2 | 0-1000 ppm | SC | 403€ | Built-in |
| 31-520-17 | MIDI Remote SC HFC/HFO Group 2 | HFC/HFO Grp2 | 0-1000 ppm | SC | 469€ | Remote |
| 31-250-22 | MIDI EC NH3 100ppm | NH3 | 0-100 ppm | EC | 916€ | Built-in |
| 31-250-23 | MIDI EC NH3 1000ppm | NH3 | 0-1000 ppm | EC | 916€ | Built-in |
| 31-250-24 | MIDI EC NH3 5000ppm | NH3 | 0-5000 ppm | EC | 916€ | Built-in |
| 31-550-22 | MIDI Remote EC NH3 100ppm | NH3 | 0-100 ppm | EC | — | Remote |
| 31-550-23 | MIDI Remote EC NH3 1000ppm | NH3 | 0-1000 ppm | EC | 981€ | Remote |
| 31-550-24 | MIDI Remote EC NH3 5000ppm | NH3 | 0-5000 ppm | EC | — | Remote |
| 31-290-13 | MIDI SC R290/Group 3 4000ppm | R290/HC | 0-4000 ppm | SC | 403€ | Built-in |
| 31-590-13 | MIDI Remote SC R290 HC 4000ppm | R290/HC | 0-4000 ppm | SC | 469€ | Remote |

### 3.2 RM & RM-V (Occupied Spaces)

IP21, 12-24V AC/DC, 1 alarm relay, tri-colour LED, 85dB buzzer. Calibrated R410A (other on request).

| Code | Model | `detection_range` | Price | Mounting | Notes |
|------|-------|-------------------|-------|---------|-------|
| 32-220 | RM-HFC | 0-5000 ppm | 382€ | Wall mount | — |
| 32-320 | RMV-HFC | 0-5000 ppm | 382€ | Flush mount | Requires KAP045 (flush, included) or KAP046 (surface, free option) |

### 3.3 GLACIAR X5 (Industrial / ATEX)

ATEX certified, IP66, -20/+55C, digital display, 2x 4-20mA (output 1=sensor 1, output 2=sensor 2), 2 alarm + 1 fault relay, magnetic wand, 5-year ionic NH3.

Transmitter: 3500-0001 (always required). Configs: A (1-2 direct), B (1 direct + 1 remote + D44), C (2 remote + D44).

**X5 Core Sensors (Direct)**

| Code | Gas | `detection_range` | `sensor_tech` | Price |
|------|-----|-------------------|---------------|-------|
| 3500-0002 | NH3 | 0-100 ppm | IONIC EC | 1830€ |
| 3500-0003 | NH3 | 0-500 ppm | IONIC EC | 1830€ |
| 3500-0095 | NH3 | 0-1000 ppm | IONIC EC | 1830€ |
| 3500-0004 | NH3 | 0-5000 ppm | IONIC EC | 1830€ |
| 3500-0005 | CO2 | 0-5000 ppm | IR | 1841€ |
| 3500-0006 | CO2 | 0-5% vol | IR | 1841€ |
| 3500-0096 | CO | 0-100 ppm | EC | 1424€ |
| 3500-0097 | O2 | 0-25% vol | EC | 1500€ |
| 3500-0098 | NO2 | 0-5 ppm | EC | 1809€ |

**X5 IRR Sensors (Gas-Specific IR, 0-2000 ppm each, Direct)**

Codes 3500-0065 to 3500-0084: R22, R32, R123, R125, R134A, R227, R404A, R407A, R407F, R410A, R417A, R442D, R448A, R449A, R452B, R507, R513A, R1233zd, R1234yf, R1234ze. All ATEX IR, sensor & spare sensor included. Price: 2200€.

**X5 SC Sensors (Direct)**

- R1 group (0-1000 ppm SC): 3500-0007 to 0011 — R407C, R22, R134A, R404A, R410.
- R2 group (1000-10000 ppm SC): 3500-0012 to 0019 — R32, R22, R1234yf, R410A, R1234ze, R290, R454B, R404A.
- Flammable: 3500-0020 (IR 0-100%LEL), 3500-0021 (Pellister 0-100%LEL).

**X5 Remote Sensors**

Same gas options as direct sensors, with Remote prefix. Core remote: 3500-0022 to 0028. IRR remote: 3500-0032 to 0051. R1 remote: 3500-0052 to 0056. R2 remote: 3500-0057 to 0064. Flammable remote: 3500-0028.

REQUIRED for remote config: D44 Power Filter (3500-0029) + ATEX Cable Glands (3500-0030).

### 3.4 G-Series (Standalone with 3 Relays)

-40/+50C, 3 adjustable alarm levels, 3 relay outputs, test terminal, DT300 service. 12-24V or 230V variants.

| Variant | Application | `ip_rating` | `sensor_tech` | Gases | Price |
|---------|-------------|-------------|---------------|-------|-------|
| GSH | CO2 standalone | IP67 | IR | CO2 10k/30k ppm | 792€ |
| GSMB | CO2 + Modbus | IP67 | IR | CO2 10k/30k ppm | 1011€ |
| GSLS | CO2 + LED/buzzer | IP67 | IR | CO2 10k/30k ppm | 956€ |
| GS | HFC/HC splash-proof | IP54 | SC | HFC 4000ppm, HC/H2/Methane/Propane 50%LEL | 737-792€ |
| GSR | HFC/HC remote sensor | IP54 | SC | HFC 4000ppm, HC/Methane/Propane 50%LEL | 850€ |
| GK | Duct mounting | IP54 | SC | HFC 4000ppm | 850€ |
| GR | Vent line / pressure relief | IP54 | SC | HFC 4000ppm | 850€ |
| GXR | ATEX remote sensor | IP54 | SC | HFC 4000ppm, Propane 50%LEL | 1460€ |

### 3.5 TR-Series (Pure Transmitters)

Analog only (4-20mA / 0-10V selectable), 12-30V DC. NO relay, NO built-in alarm. REQUIRES controller (MPU/SPU/PLC).

| Variant | Application | `ip_rating` | `sensor_tech` | Gases | Price |
|---------|-------------|-------------|---------------|-------|-------|
| TR-IR | CO2 | IP67 | IR | CO2 10k/30k ppm | 693€ |
| TR-SC | HFC/HC splash-proof | IP54 | SC | HFC(A) R404A cal, HFC(B) R134a cal, HC, H2 | 693€ |
| TR-SCK | Duct mounting | IP54 | SC | HFC(A), HFC(B), HC, H2 | 750€ |
| TR-SCR | Vent line | IP54 | SC | HFC(B) only | 750€ |
| TR-EC | NH3/CO/NO2 electrochemical | IP67 | EC | NH3 100/1k ppm, CO 300ppm, NO2 20ppm | 833-1353€ |

### 3.6 MP-Series & GEX (Requires MPU/SPU)

Powered by controller. Analog signal to MPU/SPU. -40/+50C. NO standalone capability.

| Variant | Application | `sensor_tech` | Gases | Price |
|---------|-------------|---------------|-------|-------|
| MPS | CO2 (IP67) | IR | CO2 10k/30k ppm | 683€ |
| MP-DS | HFC/HC splash-proof (IP54) | SC | HFC 4000ppm, HC/H2/Methane/Propane 50%LEL | 409-547€ |
| MP-DK | Duct mounting | SC | HFC 4000ppm | 601€ |
| MP-DR2 | Vent line | SC | HFC 4000ppm | 601€ |
| GEX | ATEX Zone 1 (IP66) | SC | HFC 4000ppm, Propane 50%LEL | 1914€ |

### 3.7 Controllers & Monitoring Units

| Code | Model | Channels | Power | Price | Inputs | Outputs | Notes |
|------|-------|----------|-------|-------|--------|---------|-------|
| 20-310 | MPU2C | 2 | 24V AC/DC | 1168€ | 2x 4-20mA | 2x alarm/ch + 1 fault (SPDT 5A/250VAC) + 24V/150mA | LCD display, RS485, 4-20mA retransmit |
| 20-300 | MPU4C | 4 | 24V AC/DC | 1598€ | 4x 4-20mA | 2x alarm/ch + 1 fault + 24V/150mA | LCD display, RS485, most popular |
| 20-305 | MPU6C | 6 | 24V AC/DC | 2004€ | 6x 4-20mA | 2x alarm/ch + 1 fault + 24V/150mA | LCD display, RS485, largest MPU |
| 20-350 | SPU24 | 1 | 24V AC/DC | 424€ | 1x 4-20mA | 1x alarm + 1x fault (SPDT 5A/250VAC) | LEDs, failsafe, 500m cable |
| 20-355 | SPU230 | 1 | 230V AC | 455€ | 1x 4-20mA | 1x alarm + 1x fault | 230V version of SPU24 |
| 20-360 | SPLS24 | 1 | 24V AC/DC | 546€ | 1x 4-20mA | 1x alarm + 1x fault + LED + 85dB siren | Built-in audio-visual |
| 20-365 | SPLS230 | 1 | 230V AC | 546€ | 1x 4-20mA | 1x alarm + 1x fault + LED + 85dB siren | 230V SPLS |
| 81-100 | LAN63-PKT | 12 | 230V AC | — | 12x relay (RM only) | 2 relay (A+B alarm) + 24V/9W output | IP32, wall mount |
| 81-200 | LAN63/64-PKT | 24 | 230V AC | — | 24x relay (RM only) | 2 relay per module | IP32, master+slave |
| 81-110 | LAN63 | 12 | 24V AC | — | 12x relay (RM only) | 2 relay (A+B) | DIN rail, master |
| 81-120 | LAN64 | 12 | 24V AC | — | 12x relay (RM only) | 2 relay (A+B) | DIN rail, slave |
| 81-130 | LAN65 | 12 | 24V AC | — | Digital in | Per-input relay (NO) | DIN rail, relay box |

### 3.8 Aquis 500 (NH3 in Water & Brine)

| Code | Model | Details |
|------|-------|---------|
| 35-210 | Aquis 500 | Monitoring unit, wall mount, 4-20mA output, 230V AC |
| 35-220 | NH3 sensor, standard | Media temp 0..+50C |
| 35-221 | NH3 sensor, low temp | Media temp -8..+30C |
| 35-229 | Coax cable set | 1x5mm 75ohm, 5.0m |
| 35-230 | Pipe fitting for sensor | Retractable, G 1-1/4", max 6 bar |
| 35-231 | Aquis bottle kit | Mounting kit with hose and bottle for liquid sample |

---

## Part IV — Accessories, Service Tools & Spare Sensors

### 4.1 MIDI Accessories

| Code | Product | Price | Details |
|------|---------|-------|---------|
| 4000-0002 | Power Adapter | 99€ | 85-305V AC → 24VDC 1.3A (31.2W), IP54, GLACIAR MIDI only, 1 per MIDI |
| 6100-0002 | LED Sign "Refrigerant Alarm" | — | 300x132mm, IP54, 230V AC or 24V DC |
| 6120-XXXX | Calibration Gas | — | Contact sales (Europe only) |
| 62-9031 | Pipe Adapter 1/2" R | — | For high-pressure NH3 vent lines |
| 62-9011 | Calibration Adapter v2.0 | — | For periodic testing & calibration |
| 62-9041 | Duct Adapter | — | For monitoring in ductwork & tank head spaces |
| 62-9022 | Delivery Protection Cap | — | Protects sensor head before installation |
| 62-9051 | Magnetic Wand (pack of 5) | — | For non-intrusive configuration |

### 4.2 X5 Accessories

| Code | Product | Details | Dependency |
|------|---------|---------|------------|
| 3500-0029 | D44 Power Filter | For remote sensor solutions | REQUIRED for Config B/C |
| 3500-0030 | Cable Gland EXd II C | ATEX certified spare | REQUIRED for remote |
| 3500-0031 | Stopping Plug M20 | ATEX, blanks unused entries | ATEX compliance |
| 3500-0087 | Magnetic Wand | For configuration | Included with transmitter |
| 3500-0088 | Gas Collector Cone | For lighter-than-air gases | REQUIRES 3500-0090 + single sensor |
| 3500-0090 | ATEX Splash Guard | Water splash protection | — |
| 3500-0085 | Sun Shade | Rain-guard & sun glare | — |
| 3500-0086 | Pole Clamp | Versatile pole installation | — |
| 3500-0089 | Protection Filter Disk | Prevents blockages | REQUIRES 3500-0090 |
| 3500-0091 | Spare Plug in PCB set | Replacement PCB plugs | — |
| 3500-0092 | Replacement Base | Spare base unit | — |
| 3500-0093 | Spare ATEX Housing | Replacement housing | — |
| 3500-0094 | Calibration Kit | Complete calibration tools | — |

### 4.3 Service Tools

| Code | Model | For |
|------|-------|-----|
| 60-130 | DT300 base unit | Diagnostic & calibration tool for SC sensors |
| 60-131 | SM300-VOC | DT300 sensor module — VOC |
| 60-132 | SM300-HC | DT300 sensor module — Hydrocarbons |
| 60-133 | SM300-H2 | DT300 sensor module — Hydrogen |
| 60-134 | SM300-HFC | DT300 sensor module — HFC/CFC/HCFC/HFO |
| 60-136 | SM300-NH3-4000 | DT300 sensor module — NH3 4000ppm |
| 60-137 | SM300-NH3-10000 | DT300 sensor module — NH3 10000ppm |
| 60-150 | SM300-self sense | DT300 sensor module — HFC/HFO with filter |
| 60-120 | SA200 | Basic service tool for G-Series, MPU, SPU/SPLS |

### 4.4 Spare Sensors

| Code | Model | Compatible With |
|------|-------|----------------|
| SEN002 | HC sensor 0-50% LEL (SC) | G / MP-DS / MP-DR2 / MP-DK2 |
| SEN004 | HFC sensor 0-4000ppm (SC) | G / MP-DS / MP-DR2 / MP-DK2 |
| SEN006 | H2 sensor 0-50% LEL (SC) | G / MP-DS / MP-DR2 / MP-DK2 |
| SEN027 | SELF SENSE filter HFC/HFO/Propane | G / MP-DS / MP-DR2 / MP-DK2 |
| SEN204 | HFC Sensor 0-4000ppm + RS02 | MP-D |
| SEN210 | CO Sensor + RS05 | TR-EC |
| SEN212 | NO2 Sensor + RS05 | TR-EC |
| SEN113 | CO2 IR-sensor 0-10000ppm | MPS / TR-IR |
| SEN1144 | CO2 IR-sensor 0-10000ppm | GSH |
| SEN1114 | CO2 IR-sensor 0-30000ppm | GSH |
| SEN115 | CO2 IR-sensor 0-10000ppm | GSLS |
| SEX019 HFC | ATEX Sensor 0-4000ppm, 23cm | GEX |
| SEX019 HC | ATEX Sensor 0-50%LEL, 23cm | GEX |
| SEX018 HFC | ATEX Sensor 0-4000ppm, 5m | GXR |
| SEX018 Propane | ATEX Sensor 0-50%LEL, 5m | GXR |

---

## Part V — Order Code Decoder

### 5.1 MIDI Code Structure

Format: `31-XYZ-NN`

| Element | Meaning | Values |
|---------|---------|--------|
| 31-2xx | Built-in sensor | 31-210, 31-220, 31-250, 31-290 |
| 31-5xx | Remote sensor | 31-510, 31-520, 31-550, 31-590 |
| 31-x1x | IR sensor (CO2) | 31-210, 31-510 |
| 31-x2x | SC sensor (HFC/HFO) | 31-220, 31-520 |
| 31-x5x | EC sensor (NH3) | 31-250, 31-550 |
| 31-x9x | SC sensor (R290/HC) | 31-290, 31-590 |
| -12 | Group 1 calibration | HFC/HFO Group 1 |
| -17 | Group 2 calibration | HFC/HFO Group 2 |
| -22 / -23 / -24 | NH3 range | 100 / 1000 / 5000 ppm |
| -32 | CO2 range | 10000 ppm |
| -13 | R290/HC range | 4000 ppm |

### 5.2 G-Series Code Structure

| Prefix | Meaning |
|--------|---------|
| 37-41xx / 37-41xx-MB / 37-41xx-LS | GSH / GSMB / GSLS (CO2 IR) |
| 37-42x / 37-43x / 37-47x / 37-48x / 37-49x | GS (HFC / HC / H2 / Methane / Propane) |
| 37-6xx | GR (vent line) |
| 37-7xx | GXR (ATEX remote) |
| 37-8xx | GK (duct) |
| 37-9xx | GSR (remote sensor) |
| ...24... or suffix 24 | 12-24V AC/DC |
| ...230... or suffix 230 | 85-230V AC |

### 5.3 X5 Code Structure

| Range | Category |
|-------|----------|
| 3500-0001 | Transmitter base unit (always required) |
| 3500-0002 to 0006 | Core direct sensors (NH3 Ionic, CO2 IR) |
| 3500-0007 to 0021 | Direct sensor modules (R1 SC, R2 SC, IRR IR, IRF IR, MK8 Pellister) |
| 3500-0022 to 0028 | Remote sensor modules (core + flammable) |
| 3500-0029 | D44 Power Filter (required for remote) |
| 3500-0030 to 0031 | Cable glands + stopping plugs (ATEX) |
| 3500-0032 to 0064 | Remote IRR / R1 / R2 sensors |
| 3500-0065 to 0084 | Direct IRR sensors (gas-specific IR) |
| 3500-0085 to 0094 | Accessories |
| 3500-0095 to 0101 | Additional sensors (NH3 1000, CO, O2, NO2) |

---

## Variable Changes from V1

This section documents all variable name changes from V1 to V2 for traceability.

### Renamed Variables (V1 name -> V2 canonical name)

| V1 Name (in document) | V2 Canonical Name | Section | Reason |
|------------------------|-------------------|---------|--------|
| Country | `project_country` | External Inputs, F1 | Align with DATA_DICTIONARY |
| Application type | `zone_type` | External Inputs, F0 | Align with zone model |
| Gas type(s) per zone | `zone_gas_id` | External Inputs, F3 | Align with zone model |
| ATEX requirement | `zone_atex` | External Inputs, F2 | Align with zone model |
| Number of detectors (now) | `total_detectors` | External Inputs, F7 | Align with M2 outputs |
| Power Budget / max 10W | `max_power_to_sensors` | F7, F11 | Align with controller attributes |
| Sensor Tech (column) | `sensor_tech` | F3, Part III | Align with product attributes |
| Lifetime (column) | `sensor_life` | F3, F11 | Align with product attributes |
| Range Options (column) | `detection_range` | F3, Part III | Align with product attributes |
| IP Rating (column) | `ip_rating` | F10, F11, Part III | Align with product attributes |
| technical_score | `solution_score` | F12 | Align with M2 outputs |

### New Variables Added in V2

| V2 Canonical Name | Section | Type | Description |
|-------------------|---------|------|-------------|
| `site_power_voltage` | External Inputs, F9 | enum | Site power supply (12V, 24V, 230V) |
| `mounting_type_required` | External Inputs, F10 | enum | Required mounting type (Wall, Flush, Surface, Duct, Pipe, Pole, DIN rail) |

---

## 15. Trace Integration **[NEW IN V3]**

All Product Selection Engine execution steps produce TraceSteps as defined in `Trace_Engine_V3.md`. This section defines the mandatory trace points specific to Moteur 2.

### 15.1 Trace Points

Every function (F0–F12), validation check (F11), and BOM generation step emits a TraceStep. See `Trace_Engine_V3.md`, Section 6.2 for the complete list of M2 trace points (TR-M2-001 through TR-M2-016).

### 15.2 M2-Specific Trace Requirements

| Requirement | Detail |
|-------------|--------|
| Product elimination tracing | F0 (Application), F1 (Country), F2 (ATEX), F3 (Gas), F3b (Range), F9 (Power) each emit a TraceStep showing products eliminated and remaining |
| Controller architecture decision | F7 emits a TraceStep with `total_detectors`, recommended controller combo, and reasoning |
| Power budget calculation | F7/F11 emits a TraceStep showing per-detector power, sum, max, headroom, and pass/fail |
| Validation checks | Each of the 18 F11 validation checks emits its own TraceStep with pass/fail and details |
| Scoring breakdown | F12 emits a TraceStep per scoring criterion (tier priority, application fit, output match, simplicity, maintenance cost, feature richness) with individual scores |
| Tier assignment | A TraceStep records which solutions were assigned to Premium/Standard/Centralized and why |
| Service tool recommendations | Auto-recommended items (DT300, spare sensors) each emit a TraceStep |

### 15.3 Output Contract Extension

The M2 output is extended with the following field:

| Field | Type | Description |
|-------|------|-------------|
| `trace` | TraceResult\|null | **[NEW IN V3]** Full execution trace for M2. See Trace_Engine_V3.md |

### 15.4 Admin Simulator Support

The Admin Simulator (`Admin_Simulator_V3.md`) displays M2 results in Panel 2 (Product Selection). All M2 output fields are displayed including:

- Architecture type and controller selection rationale
- Three-tier solution cards (Premium / Standard / Centralized)
- Solution score breakdowns per tier (6 criteria)
- Power budget visualization with pass/fail
- All 18 validation check results
- Full BOM pricing with dynamic alert updates
- Warnings and installation notes

The simulator comparison mode (Section 5 of Admin_Simulator_V3.md) highlights BOM differences when parameters change (e.g., ATEX on/off, voltage change).

---

## Variable Changes from V3 to V5

### Removed Variables

| Variable | Section | Reason |
|----------|---------|--------|
| `detector_count_future` | External Inputs, F7 | Removed — single detector count only |
| `existing_system_type` | External Inputs, F5 | Removed — F5 eliminated |
| `connectivity_preference` | External Inputs, F6 | Removed — F6 eliminated |
| `totalAll` | F12 | Removed — replaced by per-solution pricing |
| `hasBMS` | F12 | Removed — not used in scoring |

### New Variables (V5)

| Variable | Type | Section | Description |
|----------|------|---------|-------------|
| `output_required` | enum | External Inputs, F4 | Direct user input: Relay, 4-20mA, 0-10V, 2-10V, Modbus, Relay+Analog+Modbus, Relay+Dual 4-20mA, Any |

### New Variables (V5 — continued)

| Variable | Type | Section | Description |
|----------|------|---------|-------------|
| `selected_refrigerant` | string | External Inputs, F3 | Single refrigerant from dropdown (replaces multi-gas group selection) |
| `selected_range` | string | External Inputs, F3b | Detection range for multi-range refrigerants |
| `product.refs` | string[] | Product DB, F3 | Array of compatible refrigerants per product |
| `product.apps` | string[] | Product DB, F0 | Array of compatible applications per product |
| `product.tier` | enum | Product DB, F12 | Configurable tier (premium/standard/economic) |
| `product.price` | number | Product DB, F12 | Unit price in EUR |
| `product.sensorLife` | string | Product DB | Sensor lifespan description |
| `product.powerDesc` | string | Product DB | Power consumption description |
| `product.relaySpec` | string | Product DB | Relay output specification |
| `product.analogType` | string | Product DB | Analog output type detail |
| `product.modbusType` | string | Product DB | Modbus protocol detail |
| `product.connectTo` | string | Product DB | Connection options description |
| `product.features` | string | Product DB | Feature list |

### Removed Functions

| Function | Reason |
|----------|--------|
| F5 Existing System | Not needed for new installations |
| F6 Connectivity | Informational only, not a selection filter |

### Major Rule Changes in V5

| Rule | V3 Behavior | V5 Behavior |
|------|-------------|-------------|
| F0 Application | Informational defaults only | **REAL FILTER** — eliminates products via `product.apps.includes(zone_type)` |
| F3 Gas selection | Multi-gas group checkboxes | **Single refrigerant dropdown** — filters by `product.refs.includes(selectedRefrigerant)` |
| F3b Range | Not present | **NEW** — range sub-step for multi-range refrigerants with auto-recommended default |
| MIDI + MPU | Up to 3-6 MIDI on MPU | **MIDI standalone ONLY** — never connects to MPU. No MIDI+MPU architecture. |
| G-Series controller | Could connect to LAN63/64 | **Standalone ONLY** — no controller connection |
| LAN63/64 | For any standalone detector | **RM detectors ONLY** |
| Power Adapter 4000-0002 | "Powers up to 5 MIDI" | **1 per MIDI**, 99€, GLACIAR MIDI only, added per solution (not global) |
| F9 Power options | 24V and 230V only | **12V added** — eliminates MIDI (15V min), X5 (18V min), MP (24V MPU) |
| 230V site products | All kept with adapter notes | **Eliminates TR, X5, RM, G-Series 24V** (no adapter path) |
| F4 Output | Derived from existing system | **Direct user input** |
| Solution tiers | 3 tiers by family grouping | **3 tiers: PREMIUM, STANDARD, CENTRALIZED** (with controller, only if >1 detector) |
| Product tier | Not configurable | **Configurable `tier` field** per product (premium=+5, standard=+3, economic=+1) |
| Scoring criteria | 7 criteria (incl. system compat + future expansion) | **6 criteria** — removed "System compatibility" and "Future expansion" |
| Controller selection | Fixed MPU by detector count | **Cheapest combination algorithm** (SPU/SPLS/MPU mix respecting channels + 10W power) |
| BOM pricing | No pricing | **Full BOM pricing** — detectors + controllers + power adapter + alerts + SOCK-H-R-230 |
| Alert accessories | No prices | **Priced**: FL-RL-R=150€, siren=120€, flash=85€, SOCK=100€ |
| Alert BOM update | Static | **Dynamic** — updates total when alert selection changes |
| Alert quantity (MPU) | Per relay | **1 per MPU controller** |
| Alert quantity (standalone) | Per relay | **1 per detector** |
| Alert ATEX | Noted | **Warning only shown if ATEX is active** |
| SM300 modules | Always recommended | **Only if DT300 present** (G-Series or MP-Series in BOM) |
| KAP045/046 | Always for flush/surface | **RM/RMV only** |
| Pipe Adapter, MSVK, Pole Clamp | For various products | **GLACIAR MIDI Remote only** |
| BOM solutions | Grouped by family | **Each product variant = own solution** (built-in vs remote) |

---

*End of document.*
