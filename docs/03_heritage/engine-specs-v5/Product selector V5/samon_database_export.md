# SAMON CONFIGURATOR V5 — DATABASE EXPORT
Exported: 2026-04-02

## SUMMARY
- Products: 80 total
  - detector: 49
  - controller: 13
  - alarm: 18
- Refrigerants: 20
- Gas Categories: 5
- Rules: 11
- Quotes: 75

---

## DETECTORS (49)

### Glaciär Midi IR CO₂ 10000ppm
- Code: 31-210-32
- Family: Glaciär Midi
- Price: 673 €
- analog: true
- analogType: 4-20mA / 0-5V / 1-5V / 0-10V / 2-10V
- app: true
- appType: Bluetooth (iOS/Android)
- atex: false
- connectTo: Direct (standalone) or Modbus to any RTU master
- features: Service wheel, magnetic switch, pre-cal sensor modules, LED status, sensor lifetime counter
- gasDetail: CO₂ R744
- gasType: CO2
- ip: IP67
- modbus: true
- modbusType: RTU RS485 (isolated)
- mounting: Wall, low level ~20cm
- power: 4W max, 170mA @24VDC
- range: 0-10,000 ppm
- relaySpec: 1A @ 24VAC/VDC
- relays: 2
- remote: false
- sensorLife: 7-10y
- sensorTech: NDIR IR
- standalone: true
- tempRange: -40 to +50°C
- voltage: 15-24 VDC; 24 VAC/DC
- apps: supermarket, cold_room, cold_storage, heat_pump
- tier: premium
- refs: R744

### Glaciär Midi Remote IR CO₂ 10000ppm
- Code: 31-510-32
- Family: Glaciär Midi
- Price: 739 €
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- connectTo: Direct or Modbus
- features: Remote sensor ideal for cold rooms, ducts
- gasDetail: CO₂ R744
- gasType: CO2
- ip: IP67
- modbus: true
- modbusType: RTU RS485
- mounting: Body: accessible height, Sensor: low/cold room
- power: 4W max
- range: 0-10,000 ppm
- relaySpec: 1A @ 24VAC/VDC
- relays: 2
- remote: true
- remoteSensor: Cable-connected remote sensor head
- sensorLife: 7-10y
- sensorTech: NDIR IR
- standalone: true
- tempRange: -40 to +50°C
- voltage: 15-24 VDC; 24 VAC/DC
- apps: supermarket, cold_room, cold_storage, duct
- tier: premium
- refs: R744

### Glaciär Midi SC HFC/HFO Group 1
- Code: 31-220-12
- Family: Glaciär Midi
- Price: 403 €
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- connectTo: Direct or Modbus
- features: Group 1 calibration — NOT interchangeable with Group 2
- gasDetail: R32/R407A/R407C/R407F/R410A/R448A/R449A/R452A/R452B/R454A/R454B/R454C/R455A/R507A
- gasType: HFC/HFO
- ip: IP67
- modbus: true
- modbusType: RTU RS485
- mounting: Wall, low level ~20cm
- power: 4W max
- range: 0-1,000 ppm
- relaySpec: 1A @ 24VAC/VDC
- relays: 2
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 15-24 VDC; 24 VAC/DC
- apps: supermarket, cold_room, cold_storage, heat_pump
- tier: standard
- refs: R32, R407A, R407C, R407F, R410A, R448A, R449A, R452A, R452B, R454A, R454B, R454C, R455A, R464A, R465A, R466A, R468A, R507A

### Glaciär Midi Remote SC HFC/HFO Grp1
- Code: 31-520-12
- Family: Glaciär Midi
- Price: 469 €
- gasType: HFC/HFO
- gasDetail: R134a/R404A/R450A/R513A/R1234yf/R1234ze/R1233zd
- range: 0-1,000 ppm
- sensorTech: Semiconductor (MOS)
- sensorLife: ~5y
- voltage: 15-24 VDC; 24 VAC/DC
- power: 4W max
- ip: IP67
- tempRange: -40 to +50°C
- relays: 2
- relaySpec: 1A @ 24VAC/VDC
- modbus: true
- modbusType: RTU RS485
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- standalone: true
- remote: true
- remoteSensor: Cable remote sensor
- connectTo: Direct or Modbus
- mounting: Remote sensor for ducts/cold rooms
- features: Group 1 remote
- apps: supermarket, cold_room, cold_storage, duct
- tier: standard
- refs: R32, R407A, R407C, R407F, R410A, R448A, R449A, R452A, R452B, R454A, R454B, R454C, R455A, R464A, R465A, R466A, R468A, R507A

### Glaciär Midi SC HFC/HFO Group 2
- Code: 31-220-17
- Family: Glaciär Midi
- Price: 403 €
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- connectTo: Direct or Modbus
- features: Group 2 calibration — DIFFERENT from Group 1
- gasDetail: R134a/R404A/R450A/R513A/R1234yf/R1234ze/R1233zd
- gasType: HFC/HFO
- ip: IP67
- modbus: true
- modbusType: RTU RS485
- mounting: Wall, low level ~20cm
- power: 4W max
- range: 0-1,000 ppm
- relaySpec: 1A @ 24VAC/VDC
- relays: 2
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 15-24 VDC; 24 VAC/DC
- apps: supermarket, cold_room, cold_storage, heat_pump
- tier: standard
- refs: R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd

### Glaciär Midi Remote SC HFC/HFO Grp2
- Code: 31-520-17
- Family: Glaciär Midi
- Price: 469 €
- gasType: HFC/HFO
- gasDetail: R134a/R404A/R450A/R513A/R1234yf/R1234ze/R1233zd
- range: 0-1,000 ppm
- sensorTech: Semiconductor (MOS)
- sensorLife: ~5y
- voltage: 15-24 VDC; 24 VAC/DC
- power: 4W max
- ip: IP67
- tempRange: -40 to +50°C
- relays: 2
- relaySpec: 1A @ 24VAC/VDC
- modbus: true
- modbusType: RTU RS485
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- standalone: true
- remote: true
- remoteSensor: Cable remote
- connectTo: Direct or Modbus
- mounting: Remote sensor
- features: Group 2 remote
- apps: supermarket, cold_room, cold_storage, duct
- tier: standard
- refs: R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd

### Glaciär Midi EC NH₃ 100ppm
- Code: 31-250-22
- Family: Glaciär Midi
- Price: 916 €
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- connectTo: Direct or Modbus
- features: EC sensor replace every 2-3 years. NOT ATEX.
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP67
- modbus: true
- modbusType: RTU RS485
- mounting: Wall, HIGH level ~20cm below ceiling (NH₃ lighter than air)
- power: 4W max
- range: 0-100 ppm
- relaySpec: 1A @ 24VAC/VDC
- relays: 2
- remote: false
- sensorLife: 2-3y
- sensorTech: Electrochemical (EC)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 15-24 VDC; 24 VAC/DC
- apps: machinery_room, cold_storage, ice_rink
- tier: premium
- refs: R717

### Glaciär Midi EC NH₃ 1000ppm
- Code: 31-250-23
- Family: Glaciär Midi
- Price: 916 €
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- connectTo: Direct or Modbus
- features: Standard range for industrial NH₃
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP67
- modbus: true
- modbusType: RTU RS485
- mounting: HIGH level
- power: 4W max
- range: 0-1,000 ppm
- relaySpec: 1A @ 24VAC/VDC
- relays: 2
- remote: false
- sensorLife: 2-3y
- sensorTech: Electrochemical (EC)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 15-24 VDC; 24 VAC/DC
- apps: machinery_room, cold_storage, ice_rink
- tier: premium
- refs: R717

### Glaciär Midi EC NH₃ 5000ppm
- Code: 31-250-24
- Family: Glaciär Midi
- Price: 916 €
- gasType: NH3
- gasDetail: NH₃ R717
- range: 0-5,000 ppm
- sensorTech: Electrochemical (EC)
- sensorLife: 2-3y
- voltage: 15-24 VDC; 24 VAC/DC
- power: 4W max
- ip: IP67
- tempRange: -40 to +50°C
- relays: 2
- relaySpec: 1A @ 24VAC/VDC
- modbus: true
- modbusType: RTU RS485
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- standalone: true
- remote: false
- connectTo: Direct or Modbus
- mounting: HIGH level
- features: High range NH₃
- apps: machinery_room, cold_storage, ice_rink
- tier: premium
- refs: R717

### Glaciär Midi Remote EC NH₃ 1000ppm
- Code: 31-550-23
- Family: Glaciär Midi
- Price: 981 €
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- connectTo: Direct or Modbus
- features: Remote ideal for high-mount NH₃ with body at accessible height
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP67
- modbus: true
- modbusType: RTU RS485
- mounting: Body: accessible, Sensor: HIGH near ceiling
- power: 4W max
- range: 0-1,000 ppm
- relaySpec: 1A @ 24VAC/VDC
- relays: 2
- remote: true
- remoteSensor: Remote sensor head at high level
- sensorLife: 2-3y
- sensorTech: Electrochemical (EC)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 15-24 VDC; 24 VAC/DC
- apps: machinery_room, cold_storage, ice_rink, duct
- tier: premium
- refs: R717

### Glaciär Midi SC R290 Group 3
- Code: 31-290-13
- Family: Glaciär Midi
- Price: 403 €
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- connectTo: Direct or Modbus
- features: Measures PPM not %LEL. NOT ATEX certified.
- gasDetail: R290/R50/R600a/R1150/R1270
- gasType: HC
- ip: IP67
- modbus: true
- modbusType: RTU RS485
- mounting: Wall, low level ~20cm
- power: 4W max
- range: 0-4,000 ppm
- relaySpec: 1A @ 24VAC/VDC
- relays: 2
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 15-24 VDC; 24 VAC/DC
- apps: heat_pump, supermarket, cold_room
- tier: standard
- refs: R290, R50, R600a, R1150, R1270

### Glaciär Midi Remote SC R290
- Code: 31-590-13
- Family: Glaciär Midi
- Price: 469 €
- analog: true
- analogType: Selectable
- app: true
- appType: Bluetooth
- atex: false
- connectTo: Direct or Modbus
- features: R290 remote. PPM not %LEL.
- gasDetail: R290/R50/R600a/R1150/R1270
- gasType: HC
- ip: IP67
- modbus: true
- modbusType: RTU RS485
- mounting: Remote sensor low level
- power: 4W max
- range: 0-4,000 ppm
- relaySpec: 1A @ 24VAC/VDC
- relays: 2
- remote: true
- remoteSensor: Cable remote
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 15-24 VDC; 24 VAC/DC
- apps: heat_pump, supermarket, cold_room, duct
- tier: standard
- refs: R290, R50, R600a, R1150, R1270

### Glaciär X5 NH₃ 0-100ppm
- Code: 3500-0001+3500-0002
- Family: Glaciär X5
- Price: 1830 €
- analog: true
- analogType: 2x independent 4-20mA
- app: false
- atex: true
- connectTo: 4-20mA to any PLC/controller, or standalone
- features: ATEX certified, digital display, dual sensor option, 5-year ionic NH₃ sensor, non-depleting
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP66
- modbus: false
- mounting: HIGH level, ATEX zone
- power: TBD
- range: 0-100 ppm
- relaySpec: 2 alarm + 1 fault relay
- relays: 2
- remote: false
- sensorLife: 5y
- sensorTech: Ionic EC (5-year)
- standalone: true
- tempRange: -20 to +55°C
- voltage: 24V
- apps: machinery_room, cold_storage, ice_rink, atex_zone
- tier: premium
- refs: R717

### Glaciär X5 CO₂ 0-5000ppm
- Code: 3500-0001+3500-0005
- Family: Glaciär X5
- Price: 1841 €
- analog: true
- analogType: 2x 4-20mA
- app: false
- atex: true
- connectTo: 4-20mA to PLC/controller
- features: ATEX, digital display, dual sensor
- gasDetail: CO₂ R744
- gasType: CO2
- ip: IP66
- modbus: false
- mounting: Low level, ATEX zone
- power: TBD
- range: 0-5,000 ppm
- relaySpec: 2 alarm + 1 fault
- relays: 2
- remote: false
- sensorLife: 7-10y
- sensorTech: NDIR IR
- standalone: true
- tempRange: -20 to +55°C
- voltage: 24V
- apps: machinery_room, cold_storage, atex_zone
- tier: premium
- refs: R744

### Glaciär X5 CO 0-100ppm
- Code: 3500-0001+3500-0096
- Family: Glaciär X5
- Price: 1424 €
- analog: true
- analogType: 2x 4-20mA
- app: false
- atex: true
- connectTo: 4-20mA to PLC/BMS
- features: ATEX, for parking garages. Dual sensor: combine CO+NO₂
- gasDetail: Carbon Monoxide
- gasType: CO
- ip: IP66
- modbus: false
- mounting: Breathing height ~1.5m
- power: TBD
- range: 0-100 ppm
- relaySpec: 2 alarm + 1 fault
- relays: 2
- remote: false
- sensorLife: 2-3y
- sensorTech: Electrochemical (EC)
- standalone: true
- tempRange: -20 to +55°C
- voltage: 24V
- apps: parking
- tier: standard
- refs: CO

### Glaciär X5 NO₂ 0-5ppm
- Code: 3500-0001+3500-0098
- Family: Glaciär X5
- Price: 1809 €
- analog: true
- analogType: 2x 4-20mA
- app: false
- atex: true
- connectTo: 4-20mA to PLC/BMS
- features: ATEX, parking/tunnels
- gasDetail: Nitrogen Dioxide
- gasType: NO2
- ip: IP66
- modbus: false
- mounting: Low level (NO₂ heavier than air)
- power: TBD
- range: 0-5 ppm
- relaySpec: 2 alarm + 1 fault
- relays: 2
- remote: false
- sensorLife: 2-3y
- sensorTech: Electrochemical (EC)
- standalone: true
- tempRange: -20 to +55°C
- voltage: 24V
- apps: parking
- tier: standard
- refs: NO2

### GSH24-CO₂-10000
- Code: 37-4120
- Family: G-Series
- Price: 792 €
- analog: false
- app: false
- atex: false
- connectTo: Relay outputs to external alarms/ventilation
- features: Field-proven, 3 alarm levels, failsafe, auto-reset or latching
- gasDetail: CO₂ R744
- gasType: CO2
- ip: IP67
- modbus: false
- mounting: Wall, low level
- power: 3W max
- range: 0-10,000 ppm
- relaySpec: 3 adjustable alarm levels
- relays: 3
- remote: false
- sensorLife: 7-10y
- sensorTech: NDIR IR
- standalone: true
- tempRange: -40 to +50°C
- voltage: 12-24V AC/DC
- apps: supermarket, cold_room, cold_storage, heat_pump
- tier: standard
- refs: R744

### GSLS24-CO₂-10000 (LED+buzzer)
- Code: 37-4120-LS
- Family: G-Series
- Price: 956 €
- analog: false
- app: false
- atex: false
- connectTo: Relay outputs, manual alarm input
- features: Built-in high-intensity LED + 85dB buzzer with mute
- gasDetail: CO₂ R744
- gasType: CO2
- ip: IP67
- modbus: false
- mounting: Wall, low level
- power: 3W max
- range: 0-10,000 ppm
- relaySpec: 3 alarm levels + manual remote alarm
- relays: 3
- remote: false
- sensorLife: 7-10y
- sensorTech: NDIR IR
- standalone: true
- tempRange: -40 to +50°C
- voltage: 12-24V AC/DC
- apps: supermarket, cold_room, cold_storage
- tier: standard
- refs: R744

### GSMB24-CO₂-10000 (Modbus)
- Code: 37-4120-MB
- Family: G-Series
- Price: 1011 €
- analog: false
- app: false
- atex: false
- connectTo: Modbus RTU to BMS/SCADA + relay outputs
- features: CO₂ with Modbus digital communication
- gasDetail: CO₂ R744
- gasType: CO2
- ip: IP67
- modbus: true
- modbusType: RTU RS485
- mounting: Wall, low level
- power: 3W max
- range: 0-10,000 ppm
- relaySpec: 3 alarm levels
- relays: 3
- remote: false
- sensorLife: 7-10y
- sensorTech: NDIR IR
- standalone: true
- tempRange: -40 to +50°C
- voltage: 12-24V AC/DC
- apps: supermarket, cold_room, cold_storage
- tier: standard
- refs: R744

### GS24-HFC-4000
- Code: 37-420
- Family: G-Series
- Price: 792 €
- analog: false
- app: false
- atex: false
- connectTo: Relay outputs
- features: MOS responds to both Group 1 & 2 — cannot distinguish
- gasDetail: R32/R134a/R404A/R407A/R407C/R407F/R410A/R448A/R449A/R450A/R452A/R452B/R454A/R454B/R454C/R455A/R507A/R513A/R1233zd/R1234yf/R1234ze
- gasType: HFC/HFO
- ip: IP54
- modbus: false
- mounting: Wall, low level ~20cm
- power: 2W max
- range: 0-4,000 ppm
- relaySpec: 3 alarm levels
- relays: 3
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 12-24V AC/DC
- apps: supermarket, cold_room, cold_storage, heat_pump
- tier: economic
- refs: R32, R407A, R407C, R407F, R410A, R448A, R449A, R452A, R452B, R454A, R454B, R454C, R455A, R464A, R465A, R466A, R468A, R507A, R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd

### GS24-NH₃-4000
- Code: 37-452
- Family: G-Series
- Price: 956 €
- analog: false
- app: false
- atex: false
- connectTo: Relay outputs
- features: Standard EC NH₃
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP54
- modbus: false
- mounting: HIGH level
- power: 2W max
- range: 0-4,000 ppm
- relaySpec: 3 alarm levels
- relays: 3
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 12-24V AC/DC
- apps: machinery_room, cold_storage, ice_rink
- tier: economic
- refs: R717

### GS24-HC (Propane)
- Code: 37-430
- Family: G-Series
- Price: 737 €
- analog: false
- app: false
- atex: false
- connectTo: Relay outputs
- features: %LEL measurement. NOT ATEX.
- gasDetail: R290 Propane
- gasType: HC
- ip: IP54
- modbus: false
- mounting: Low level (propane). HIGH for methane.
- power: 2W max
- range: 0-50% LEL
- relaySpec: 3 alarm levels
- relays: 3
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 12-24V AC/DC
- apps: heat_pump, supermarket
- tier: economic
- refs: R290, R50, R600a, R1150, R1270

### GXR24-HFC ATEX remote
- Code: 37-720
- Family: G-Series
- Price: 1460 €
- analog: false
- app: false
- atex: true
- connectTo: Relay outputs. Controller OUTSIDE ATEX zone.
- features: ATEX Zone 1 sensor. Controller box must be OUTSIDE ATEX zone.
- gasDetail: R32/R134a/R404A/R407A/R407C/R407F/R410A/R448A/R449A/R450A/R452A/R452B/R454A/R454B/R454C/R455A/R507A/R513A/R1233zd/R1234yf/R1234ze
- gasType: HFC/HFO
- ip: IP56
- modbus: false
- mounting: Sensor in ATEX Zone 1, controller outside
- power: 2W max
- range: 0-4,000 ppm
- relaySpec: 3 alarm levels
- relays: 3
- remote: true
- remoteSensor: ATEX remote sensor 5m cable, EX d flameproof
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 12-24V AC/DC
- apps: atex_zone, machinery_room
- tier: standard
- refs: R32, R407A, R407C, R407F, R410A, R448A, R449A, R452A, R452B, R454A, R454B, R454C, R455A, R464A, R465A, R466A, R468A, R507A, R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd

### GXR24-NH₃-4000 ATEX remote
- Code: 37-752
- Family: G-Series
- Price: 1460 €
- analog: false
- app: false
- atex: true
- connectTo: Relay outputs
- features: ATEX Zone 1 NH₃
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP56
- modbus: false
- mounting: Sensor HIGH in ATEX zone, controller outside
- power: 2W max
- range: 0-4,000 ppm
- relaySpec: 3 alarm levels
- relays: 3
- remote: true
- remoteSensor: ATEX remote 5m
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 12-24V AC/DC
- apps: atex_zone, machinery_room
- tier: standard
- refs: R717

### GXR24-Propane ATEX remote
- Code: 37-730
- Family: G-Series
- Price: 1460 €
- analog: false
- app: false
- atex: true
- connectTo: Relay outputs
- features: ATEX Zone 1 propane
- gasDetail: R290 Propane
- gasType: HC
- ip: IP56
- modbus: false
- mounting: Low level, ATEX zone
- power: 2W max
- range: 0-50% LEL
- relaySpec: 3 alarm levels
- relays: 3
- remote: true
- remoteSensor: ATEX remote 5m
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: true
- tempRange: -40 to +50°C
- voltage: 12-24V AC/DC
- apps: atex_zone, machinery_room
- tier: standard
- refs: R290, R50, R600a, R1150, R1270

### TR-IR-CO₂-10000
- Code: 39-4312
- Family: TR-Series
- Price: 693 €
- analog: true
- analogType: 4-20mA / 0-10V (selectable)
- app: false
- atex: false
- connectTo: MPU, SPU, LAN, or any PLC accepting 4-20mA
- features: Transmitter only — requires external controller for alarms
- gasDetail: CO₂ R744
- gasType: CO2
- ip: IP67
- modbus: false
- mounting: Wall, low level
- power: 2.5W max
- range: 0-10,000 ppm (4-20mA)
- relaySpec: None — via controller
- relays: 0
- remote: false
- sensorLife: 7-10y
- sensorTech: NDIR IR
- standalone: false
- tempRange: -40 to +50°C
- voltage: 12-30V DC
- apps: supermarket, cold_room, cold_storage
- tier: economic
- refs: R744

### TR-SC-HFC(A)-4000
- Code: 39-4120-A
- Family: TR-Series
- Price: 693 €
- analog: true
- analogType: 4-20mA / 0-10V
- app: false
- atex: false
- connectTo: MPU, SPU, LAN, PLC
- features: Transmitter, calibrated for R404A/R507
- gasDetail: R32/R134a/R404A/R407A/R407C/R407F/R410A/R448A/R449A/R450A/R452A/R452B/R454A/R454B/R454C/R455A/R507A/R513A/R1233zd/R1234yf/R1234ze
- gasType: HFC/HFO
- ip: IP54
- modbus: false
- mounting: Wall, low level
- power: TBD
- range: 0-4,000 ppm (4-20mA)
- relaySpec: None
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: 12-30V DC
- apps: supermarket, cold_room, cold_storage
- tier: economic
- refs: R32, R407A, R407C, R407F, R410A, R448A, R449A, R452A, R452B, R454A, R454B, R454C, R455A, R464A, R465A, R466A, R468A, R507A, R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd

### TR-EC-NH₃-1000
- Code: 39-4251
- Family: TR-Series
- Price: 1353 €
- analog: true
- analogType: 4-20mA
- app: false
- atex: false
- connectTo: MPU, SPU, LAN, PLC
- features: NH₃ transmitter for centralized systems
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP67
- modbus: false
- mounting: HIGH level
- power: TBD
- range: 0-1,000 ppm (4-20mA)
- relaySpec: None
- relays: 0
- remote: false
- sensorLife: 2-3y
- sensorTech: Electrochemical (EC)
- standalone: false
- tempRange: -30 to +50°C
- voltage: 12-30V DC
- apps: machinery_room, cold_storage, ice_rink
- tier: economic
- refs: R717

### TR-EC-CO (0-300ppm)
- Code: 39-4260
- Family: TR-Series
- Price: 833 €
- analog: true
- analogType: 4-20mA / 0-10V
- app: false
- atex: false
- connectTo: MPU, SPU, PLC/BMS
- features: Parking CO transmitter
- gasDetail: Carbon Monoxide
- gasType: CO
- ip: IP67
- modbus: false
- mounting: Breathing height ~1.5m
- power: TBD
- range: 0-300 ppm
- relaySpec: None
- relays: 0
- remote: false
- sensorLife: 2-3y
- sensorTech: Electrochemical (EC)
- standalone: false
- tempRange: -10 to +40°C
- voltage: 12-30V DC
- apps: parking
- tier: economic
- refs: CO

### TR-EC-NO₂ (0-20ppm)
- Code: 39-4240
- Family: TR-Series
- Price: 833 €
- analog: true
- analogType: 4-20mA / 0-10V
- app: false
- atex: false
- connectTo: MPU, SPU, PLC/BMS
- features: Parking NO₂ transmitter
- gasDetail: Nitrogen Dioxide
- gasType: NO2
- ip: IP67
- modbus: false
- mounting: Low level
- power: TBD
- range: 0-20 ppm
- relaySpec: None
- relays: 0
- remote: false
- sensorLife: 2-3y
- sensorTech: Electrochemical (EC)
- standalone: false
- tempRange: -10 to +40°C
- voltage: 12-30V DC
- apps: parking
- tier: economic
- refs: NO2

### MPS-CO₂-10000
- Code: 34-410
- Family: MP-Series
- Price: 683 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU, SPLS only (powered + controlled by unit)
- features: Sensor head only. Pre-set alarm levels. Annual maintenance with DT300.
- gasDetail: CO₂ R744
- gasType: CO2
- ip: IP67
- modbus: false
- mounting: Wall, low level
- power: Powered by controller
- range: 0-10,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: 7-10y
- sensorTech: NDIR IR
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: supermarket, cold_room, cold_storage
- tier: economic
- refs: R744

### MPS-CO₂-30000
- Code: 34-414
- Family: MP-Series
- Price: 723 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU, SPLS
- features: High range CO₂ sensor head
- gasDetail: CO₂ R744
- gasType: CO2
- ip: IP67
- modbus: false
- mounting: Wall, low level
- power: Powered by controller
- range: 0-30,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: 7-10y
- sensorTech: NDIR IR
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: supermarket, cold_room, cold_storage
- tier: economic
- refs: R744

### MP-D-HFC-4000
- Code: 38-220
- Family: MP-Series
- Price: 477 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU, SPLS
- features: MOS sensor head, responds to all HFC/HFO
- gasDetail: R32/R134a/R404A/R407A/R407C/R407F/R410A/R448A/R449A/R450A/R452A/R452B/R454A/R454B/R454C/R455A/R507A/R513A/R1233zd/R1234yf/R1234ze
- gasType: HFC/HFO
- ip: IP54
- modbus: false
- mounting: Wall, low level ~20cm
- power: Powered by controller
- range: 0-4,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: supermarket, cold_room, cold_storage
- tier: economic
- refs: R32, R407A, R407C, R407F, R410A, R448A, R449A, R452A, R452B, R454A, R454B, R454C, R455A, R464A, R465A, R466A, R468A, R507A, R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd

### MP-D-HC
- Code: 38-230
- Family: MP-Series
- Price: 409 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU
- features: HC sensor head, %LEL
- gasDetail: R290/R50/R600a/R1150/R1270
- gasType: HC
- ip: IP54
- modbus: false
- mounting: Wall, low level
- power: Powered by controller
- range: 0-50% LEL
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: heat_pump, supermarket
- tier: economic
- refs: R290, R50, R600a, R1150, R1270

### MP-D-NH₃-4000
- Code: 38-252
- Family: MP-Series
- Price: 492 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU, SPLS
- features: NH₃ sensor head
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP54
- modbus: false
- mounting: HIGH level
- power: Powered by controller
- range: 0-4,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: machinery_room, cold_storage, ice_rink
- tier: economic
- refs: R717

### MP-D-NH₃-10000
- Code: 38-253
- Family: MP-Series
- Price: 492 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU
- features: High range NH₃ sensor head
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP54
- modbus: false
- mounting: HIGH level
- power: Powered by controller
- range: 0-10,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: machinery_room, cold_storage, ice_rink
- tier: economic
- refs: R717

### MP-D-Methane
- Code: 38-280
- Family: MP-Series
- Price: 409 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU
- features: Methane sensor head
- gasDetail: Methane
- gasType: HC
- ip: IP54
- modbus: false
- mounting: HIGH level (methane lighter than air)
- power: Powered by controller
- range: 0-50% LEL
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: heat_pump, supermarket
- tier: economic
- refs: R50

### MP-D-Propane
- Code: 38-290
- Family: MP-Series
- Price: 409 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU
- features: Propane sensor head
- gasDetail: R290 Propane
- gasType: HC
- ip: IP54
- modbus: false
- mounting: Low level
- power: Powered by controller
- range: 0-50% LEL
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: heat_pump, supermarket
- tier: economic
- refs: R290

### MP-DS-HFC-4000
- Code: 38-420
- Family: MP-Series
- Price: 547 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU
- features: MP-DS variant with Self Sense filter
- gasDetail: R32/R134a/R404A/R407A/R407C/R407F/R410A/R448A/R449A/R450A/R452A/R452B/R454A/R454B/R454C/R455A/R507A/R513A/R1233zd/R1234yf/R1234ze
- gasType: HFC/HFO
- ip: IP54
- modbus: false
- mounting: Wall, low level
- power: Powered by controller
- range: 0-4,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: supermarket, cold_room, cold_storage
- tier: economic
- refs: R32, R407A, R407C, R407F, R410A, R448A, R449A, R452A, R452B, R454A, R454B, R454C, R455A, R464A, R465A, R466A, R468A, R507A, R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd

### MP-DS-NH₃-4000
- Code: 38-452
- Family: MP-Series
- Price: 615 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU
- features: MP-DS NH₃ with Self Sense
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP54
- modbus: false
- mounting: HIGH level
- power: Powered by controller
- range: 0-4,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: machinery_room, cold_storage, ice_rink
- tier: economic
- refs: R717

### MP-DR2-HFC-4000 (remote)
- Code: 38-620-V2
- Family: MP-Series
- Price: 601 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU
- features: Remote sensor for PRV vent lines
- gasDetail: R32/R134a/R404A/R407A/R407C/R407F/R410A/R448A/R449A/R450A/R452A/R452B/R454A/R454B/R454C/R455A/R507A/R513A/R1233zd/R1234yf/R1234ze
- gasType: HFC/HFO
- ip: IP54
- modbus: false
- mounting: Vent lines from pressure relief valves, pipe fitting 1/2" Flare
- power: Powered by controller
- range: 0-4,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: true
- remoteSensor: Remote sensor 1.5m cable, for vent lines from PRV
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: pressure_relief
- tier: economic
- refs: R32, R407A, R407C, R407F, R410A, R448A, R449A, R452A, R452B, R454A, R454B, R454C, R455A, R464A, R465A, R466A, R468A, R507A, R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd

### MP-DR2-NH₃-4000 (remote)
- Code: 38-652-V2
- Family: MP-Series
- Price: 601 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU
- features: Remote NH₃ for pressure relief valve vent lines
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP54
- modbus: false
- mounting: PRV vent lines, HIGH
- power: Powered by controller
- range: 0-4,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: true
- remoteSensor: Remote sensor 1.5m for PRV
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: pressure_relief
- tier: economic
- refs: R717

### MP-DK2-HFC-4000 (duct)
- Code: 38-820-V2
- Family: MP-Series
- Price: 601 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU
- features: Duct-mounted HFC sensor head
- gasDetail: R32/R134a/R404A/R407A/R407C/R407F/R410A/R448A/R449A/R450A/R452A/R452B/R454A/R454B/R454C/R455A/R507A/R513A/R1233zd/R1234yf/R1234ze
- gasType: HFC/HFO
- ip: IP54
- modbus: false
- mounting: Ventilation ducts
- power: Powered by controller
- range: 0-4,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: true
- remoteSensor: Remote sensor 1.5m, duct mounting with rubber sleeve
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: duct
- tier: economic
- refs: R32, R407A, R407C, R407F, R410A, R448A, R449A, R452A, R452B, R454A, R454B, R454C, R455A, R464A, R465A, R466A, R468A, R507A, R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd

### MP-DK2-NH₃-4000 (duct)
- Code: 38-852-V2
- Family: MP-Series
- Price: 601 €
- analog: false
- analogType: Via controller
- app: false
- atex: false
- connectTo: MPU, SPU
- features: Duct-mounted NH₃ sensor head
- gasDetail: NH₃ R717
- gasType: NH3
- ip: IP54
- modbus: false
- mounting: Ventilation ducts
- power: Powered by controller
- range: 0-4,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: true
- remoteSensor: Duct mount 1.5m
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: duct
- tier: economic
- refs: R717

### GEX-SC-HFC-4000 (ATEX Zone 1)
- Code: 35-301
- Family: GEX
- Price: 1914 €
- analog: false
- analogType: Via controller
- app: false
- atex: true
- connectTo: MPU or SPU only (powered by controller)
- features: ATEX Zone 1 flameproof. Controller MUST be outside ATEX zone.
- gasDetail: R32/R134a/R404A/R407A/R407C/R407F/R410A/R448A/R449A/R450A/R452A/R452B/R454A/R454B/R454C/R455A/R507A/R513A/R1233zd/R1234yf/R1234ze
- gasType: HFC/HFO
- ip: IP66 (EX d)
- modbus: false
- mounting: ATEX Zone 1
- power: Powered by controller
- range: 0-4,000 ppm
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: atex_zone, machinery_room
- tier: economic
- refs: R32, R407A, R407C, R407F, R410A, R448A, R449A, R452A, R452B, R454A, R454B, R454C, R455A, R464A, R465A, R466A, R468A, R507A, R134a, R404A, R450A, R513A, R1234yf, R1234ze, R1233zd

### GEX-SC-Propane (ATEX Zone 1)
- Code: 35-302
- Family: GEX
- Price: 1914 €
- analog: false
- app: false
- atex: true
- connectTo: MPU or SPU
- features: ATEX Zone 1 propane
- gasDetail: R290 Propane
- gasType: HC
- ip: IP66 (EX d)
- modbus: false
- mounting: ATEX Zone 1, low level
- power: Powered by controller
- range: via controller
- relaySpec: Via controller
- relays: 0
- remote: false
- sensorLife: ~5y
- sensorTech: Semiconductor (MOS)
- standalone: false
- tempRange: -40 to +50°C
- voltage: via MPU/SPU
- apps: atex_zone, machinery_room
- tier: economic
- refs: R290, R50, R600a, R1150, R1270

### GEX-SC-NH₃-4000 (ATEX Zone 1)
- Code: 35-304
- Family: GEX
- Price: 1914 €
- gasType: NH3
- gasDetail: NH₃ R717
- range: 0-4,000 ppm
- sensorTech: Semiconductor (MOS)
- sensorLife: ~5y
- voltage: via MPU/SPU
- power: Powered by controller
- ip: IP66 (EX d)
- tempRange: -40 to +50°C
- relaySpec: Via controller
- modbus: false
- analog: false
- app: false
- atex: true
- standalone: false
- remote: false
- connectTo: MPU / SPU
- mounting: ATEX Zone 1, HIGH level
- features: ATEX Zone 1 NH₃
- apps: atex_zone, machinery_room
- tier: economic
- refs: R717

### RM-HFC (room detector)
- Code: 32-220
- Family: RM
- Price: 382 €
- gasType: HFC/HFO
- gasDetail: R32/R410A
- range: 0-5,000 ppm
- sensorTech: Semiconductor (MOS)
- sensorLife: ~5y
- voltage: 12-24V AC/DC
- power: 2W max
- ip: IP21
- tempRange: 0 to +40°C
- relays: 1
- relaySpec: 1 alarm relay
- modbus: false
- analog: false
- app: false
- atex: false
- standalone: true
- remote: false
- connectTo: Relay to BMS/room controller
- mounting: Wall, low level near evaporator
- features: Built-in 85dB buzzer + tri-colour LED. Alarm delay for false alarm reduction. IP21 only — NOT for wet environments.
- apps: hotel, office
- tier: economic
- refs: R32, R410A

### RMV-HFC (flush-mount)
- Code: 32-320
- Family: RM
- Price: 382 €
- gasType: HFC/HFO
- gasDetail: R32/R410A
- range: 0-5,000 ppm
- sensorTech: Semiconductor (MOS)
- sensorLife: ~5y
- voltage: 12-24V AC/DC
- power: 2W max
- ip: IP21
- tempRange: 0 to +40°C
- relays: 1
- relaySpec: 1 alarm relay
- modbus: false
- analog: false
- app: false
- atex: false
- standalone: true
- remote: false
- connectTo: Relay
- mounting: Flush-mount in wall (requires KAP045/KAP046 backbox)
- features: Aesthetic for hotels. Requires KAP045 (flush) or KAP046 (surface) backbox — order separately.
- apps: hotel, office
- tier: economic
- refs: R32, R410A

## CONTROLLERS (13)

### SPU24
- Code: 20-350
- Family: SPU
- Price: 424 €
- alarmConfig: Fixed (set by connected sensor)
- alarmLevels: 2
- analogIn: 1x 4-20mA
- bacnet: false
- certifications: CE
- channels: 1
- compatible: TR-Series, MP-Series (MPS/MP-D/MP-DS/MP-DR/MP-DK), GEX
- dimensions: 110x75x55 mm
- display: false
- ethernet: false
- failsafe: true
- features: Single-point monitoring. Powers sensor head. 2 relay outputs.
- incompatible: Glaciär Midi (standalone), Glaciär X5 (standalone), G-Series (standalone), RM
- ip: IP20
- latching: true
- led: true
- ledDetail: Status LEDs (power, alarm, fault)
- modbus: false
- mounting: DIN rail or wall
- power: 10W max
- powerToSensor: true
- relayOutputs: 2
- relaySpec: 1x alarm (SPDT 5A/250VAC) + 1x fault (SPDT 5A/250VAC)
- rs485: false
- sensorCableMax: 500m (2x1mm²)
- tempRange: -10 to +55°C
- voltage: 24V AC/DC

### SPU230
- Code: 20-355
- Family: SPU
- Price: 455 €
- alarmConfig: Fixed
- alarmLevels: 2
- analogIn: 1x 4-20mA
- bacnet: false
- certifications: CE
- channels: 1
- compatible: TR-Series, MP-Series, GEX
- dimensions: 110x75x55 mm
- display: false
- ethernet: false
- failsafe: true
- features: 230V version of SPU24
- incompatible: Glaciär Midi, Glaciär X5, G-Series, RM
- ip: IP20
- latching: true
- led: true
- ledDetail: Status LEDs
- modbus: false
- mounting: DIN rail or wall
- power: 10W max
- powerToSensor: true
- relayOutputs: 2
- relaySpec: 1x alarm + 1x fault (SPDT 5A/250VAC)
- rs485: false
- sensorCableMax: 500m
- tempRange: -10 to +55°C
- voltage: 230V AC

### SPLS24 (with LED+Siren)
- Code: 20-360
- Family: SPU
- Price: 546 €
- alarmConfig: Fixed
- alarmLevels: 2
- analogIn: 1x 4-20mA
- bacnet: false
- certifications: CE
- channels: 1
- compatible: TR-Series, MP-Series, GEX
- dimensions: 130x130x55 mm
- display: false
- ethernet: false
- failsafe: true
- features: SPU with built-in audio-visual alarm. Complete standalone solution with sensor head.
- incompatible: Glaciär Midi, Glaciär X5, G-Series, RM
- ip: IP20
- latching: true
- led: true
- ledDetail: Built-in high-intensity LED + 85dB siren
- modbus: false
- mounting: Wall
- power: 10W max
- powerToSensor: true
- relayOutputs: 2
- relaySpec: 1x alarm + 1x fault (SPDT 5A/250VAC)
- rs485: false
- sensorCableMax: 500m
- tempRange: -10 to +55°C
- voltage: 24V AC/DC

### MPU2C (2 channels)
- Code: 20-310
- Family: MPU
- Price: 1168 €
- alarmConfig: Adjustable per channel (2 alarm + 1 fault)
- alarmLevels: 3
- analogIn: 2x 4-20mA
- analogOut: 2x 4-20mA retransmission
- bacnet: false
- certifications: CE
- channels: 2
- compatible: TR-Series, MP-Series (all), GEX (all)
- dimensions: 210x130x55 mm
- display: true
- displayType: LCD alphanumeric
- ethernet: false
- failsafe: true
- features: 2-channel controller. Display shows concentration per channel. Modbus RTU slave for BMS integration. 4-20mA retransmission.
- incompatible: Glaciär Midi, Glaciär X5, G-Series, RM
- ip: IP20
- latching: true
- led: true
- ledDetail: Per-channel status LEDs + LCD
- modbus: false
- modbusType: 
- mounting: DIN rail or wall
- power: 25W max
- powerToSensor: true
- relayOutputs: 4
- relaySpec: 2x alarm per channel (SPDT 5A/250VAC) + 1x common fault
- rs485: true
- sensorCableMax: 500m per channel
- tempRange: -10 to +55°C
- voltage: 24V AC/DC

### MPU4C (4 channels)
- Code: 20-300
- Family: MPU
- Price: 1598 €
- alarmConfig: Adjustable per channel
- alarmLevels: 3
- analogIn: 4x 4-20mA
- analogOut: 4x 4-20mA retransmission
- bacnet: false
- certifications: CE
- channels: 4
- compatible: TR-Series, MP-Series (all), GEX (all)
- dimensions: 280x130x55 mm
- display: true
- displayType: LCD alphanumeric
- ethernet: false
- failsafe: true
- features: 4-channel. Most popular MPU for medium installations.
- incompatible: Glaciär Midi, Glaciär X5, G-Series, RM
- ip: IP20
- latching: true
- led: true
- ledDetail: Per-channel LEDs + LCD
- modbus: false
- modbusType: 
- mounting: DIN rail or wall
- power: 40W max
- powerToSensor: true
- relayOutputs: 8
- relaySpec: 2x alarm per channel + 1x common fault
- rs485: true
- sensorCableMax: 500m per channel
- tempRange: -10 to +55°C
- voltage: 24V AC/DC

### MPU6C (6 channels)
- Code: 20-305
- Family: MPU
- Price: 2004 €
- alarmConfig: Adjustable per channel
- alarmLevels: 3
- analogIn: 6x 4-20mA
- analogOut: 6x 4-20mA retransmission
- bacnet: false
- certifications: CE
- channels: 6
- compatible: TR-Series, MP-Series (all), GEX (all)
- dimensions: 350x130x55 mm
- display: true
- displayType: LCD alphanumeric
- ethernet: false
- failsafe: true
- features: 6-channel. Largest MPU.
- incompatible: Glaciär Midi, Glaciär X5, G-Series, RM
- ip: IP20
- latching: true
- led: true
- ledDetail: Per-channel LEDs + LCD
- modbus: false
- modbusType: 
- mounting: DIN rail or wall
- power: 55W max
- powerToSensor: true
- relayOutputs: 12
- relaySpec: 2x alarm per channel + 1x common fault
- rs485: true
- sensorCableMax: 500m per channel
- tempRange: -10 to +55°C
- voltage: 24V AC/DC

### Glaciär Controller 10
- Code: 6300-0001
- Family: Glaciär Controller
- Price: 0 €
- alarmConfig: Fully configurable per channel via touchscreen
- alarmLevels: 3
- analogIn: 10x (Modbus or 4-20mA)
- bacnet: false
- certifications: CE
- channels: 10
- compatible: Glaciär Midi (all, via Modbus RTU master), TR-Series (4-20mA), MP-Series (4-20mA)
- dimensions: TBD
- display: true
- displayType: Color LCD touchscreen
- ethernet: false
- failsafe: true
- features: New generation. Modbus MASTER that polls Glaciär Midi detectors. Touchscreen config. 10 channels.
- incompatible: GEX (needs MPU/SPU), G-Series (no comms), RM (no comms)
- ip: IP20
- latching: true
- led: true
- ledDetail: Per-channel + system status
- modbus: true
- modbusType: RTU RS485 (master — polls Glaciär Midi)
- mounting: Wall or panel
- power: TBD
- powerToSensor: false
- relayOutputs: 10
- relaySpec: Per-channel configurable relays
- rs485: true
- sensorCableMax: N/A — communicates via Modbus bus
- tempRange: 0 to +50°C
- voltage: 24V DC

### LAN63-PKT
- Code: 81-100
- Family: LAN
- Price: 0 €
- alarmConfig: Fully configurable per channel via software
- alarmLevels: 3
- analogIn: Up to 64 (via RS485 bus)
- bacnet: true
- certifications: CE
- channels: 64
- compatible: TR-Series, MP-Series, GEX — large multi-zone systems
- dimensions: TBD
- display: true
- displayType: Software interface (PC)
- ethernet: true
- failsafe: true
- features: Up to 64 channels. BMS/SCADA integration via BACnet + Modbus. Ethernet. For large industrial systems.
- incompatible: Glaciär Midi (use Controller 10), G-Series, RM
- ip: IP20
- latching: true
- led: false
- modbus: true
- modbusType: RTU RS485 (master)
- mounting: DIN rail / 19" rack
- power: TBD
- powerToSensor: false
- relayOutputs: 0
- relaySpec: Via external relay modules
- rs485: true
- sensorCableMax: RS485 bus up to 1200m
- tempRange: 0 to +50°C
- voltage: 24V DC

### LAN64
- Code: 81-120
- Family: LAN
- Price: 0 €
- alarmConfig: Software configurable
- alarmLevels: 3
- analogIn: Up to 64
- bacnet: true
- certifications: CE
- channels: 64
- compatible: TR-Series, MP-Series, GEX
- dimensions: TBD
- display: true
- displayType: Software
- ethernet: true
- failsafe: true
- features: LAN64 variant without PKT packaging
- incompatible: Glaciär Midi, G-Series, RM
- ip: IP20
- latching: true
- led: false
- modbus: true
- modbusType: RTU RS485
- mounting: DIN rail / rack
- power: TBD
- powerToSensor: false
- relayOutputs: 0
- relaySpec: Via external relay modules
- rs485: true
- sensorCableMax: 1200m
- tempRange: 0 to +50°C
- voltage: 24V DC

### LAN65
- Code: 81-130
- Family: LAN
- Price: 0 €
- alarmConfig: Software configurable
- alarmLevels: 3
- analogIn: Up to 64
- bacnet: true
- certifications: CE
- channels: 64
- compatible: TR-Series, MP-Series, GEX
- dimensions: TBD
- display: true
- displayType: Built-in LCD + software
- ethernet: true
- failsafe: true
- features: LAN65 with built-in display and 8 relay outputs
- incompatible: Glaciär Midi, G-Series, RM
- ip: IP20
- latching: true
- led: true
- ledDetail: Status + alarm
- modbus: true
- modbusType: RTU RS485
- mounting: Wall / panel
- power: TBD
- powerToSensor: false
- relayOutputs: 8
- relaySpec: 8 configurable relays built-in
- rs485: true
- sensorCableMax: 1200m
- tempRange: 0 to +50°C
- voltage: 24V DC

### SPLS24-CO₂-10000-KIT
- Code: 21-3612
- Family: SPLS Kit
- Price: 1043 €
- alarmConfig: Pre-set for CO₂ 5000/10000 ppm
- alarmLevels: 2
- analogIn: 1x (integrated MPS-CO₂)
- bacnet: false
- certifications: CE
- channels: 1
- compatible: Included: MPS-CO₂-10000 sensor head (34-410)
- dimensions: SPU + MPS sensor head
- display: false
- ethernet: false
- failsafe: true
- features: Complete kit: SPLS controller + CO₂ IR sensor head. Ready to install. Pre-configured alarm levels.
- incompatible: Cannot add other sensors — 1 channel only
- ip: IP20
- latching: true
- led: true
- ledDetail: Status LEDs
- modbus: false
- mounting: Wall
- power: 10W max
- powerToSensor: true
- relayOutputs: 2
- relaySpec: 1x alarm + 1x fault
- rs485: false
- sensorCableMax: 500m
- tempRange: -10 to +55°C
- voltage: 24V AC/DC

### SPLS24-HFC-4000-KIT
- Code: 21-3620
- Family: SPLS Kit
- Price: 887 €
- alarmConfig: Pre-set for HFC
- alarmLevels: 2
- analogIn: 1x (integrated MP-D-HFC)
- bacnet: false
- certifications: CE
- channels: 1
- compatible: Included: MP-D-HFC-4000 sensor head (38-220)
- dimensions: SPU + MP-D sensor head
- display: false
- ethernet: false
- failsafe: true
- features: Complete kit: SPLS + HFC sensor head
- incompatible: 1 channel only
- ip: IP20
- latching: true
- led: true
- ledDetail: Status LEDs
- modbus: false
- mounting: Wall
- power: 10W max
- powerToSensor: true
- relayOutputs: 2
- relaySpec: 1x alarm + 1x fault
- rs485: false
- sensorCableMax: 500m
- tempRange: -10 to +55°C
- voltage: 24V AC/DC

### SPLS24-NH₃-4000-KIT
- Code: 21-3652
- Family: SPLS Kit
- Price: 887 €
- alarmConfig: Pre-set for NH₃
- alarmLevels: 2
- analogIn: 1x (integrated MP-D-NH₃)
- bacnet: false
- certifications: CE
- channels: 1
- compatible: Included: MP-D-NH₃-4000 sensor head (38-252)
- dimensions: SPU + MP-D sensor head
- display: false
- ethernet: false
- failsafe: true
- features: Complete kit: SPLS + NH₃ sensor head
- incompatible: 1 channel only
- ip: IP20
- latching: true
- led: true
- ledDetail: Status LEDs
- modbus: false
- mounting: Wall
- power: 10W max
- powerToSensor: true
- relayOutputs: 2
- relaySpec: 1x alarm + 1x fault
- rs485: false
- sensorCableMax: 500m
- tempRange: -10 to +55°C
- voltage: 24V AC/DC

## ALARMS (18)

### BE-A 24V Flash orange
- Code: 40-4021
- Family: Flash
- Price: 85 €
- color: Orange
- notes: Pre-alarm visual
- voltage: 24V

### BE-R 24V Flash rouge
- Code: 40-4022
- Family: Flash
- Price: 85 €
- color: Red
- notes: Alarm visual
- voltage: 24V

### BE-BL 24V Flash blue
- Code: 40-4023
- Family: Flash
- Price: 85 €
- color: Blue
- voltage: 24V

### 1992-R-LP SirèneX
- Code: 40-410
- Family: Siren
- Price: 120 €
- voltage: 9-28VDC
- modbus: false
- analog: false
- app: false
- atex: false
- standalone: false
- remote: false
- db: 95
- notes: Audible alarm

### FL-RL-R-SEP Flash+Sirène rouge
- Code: 40-440
- Family: Flash+Siren
- Price: 150 €
- color: Red
- db: 95
- notes: Combined
- voltage: 24V

### FL-OL-V-SEP Flash+Sirène orange
- Code: 40-442
- Family: Flash+Siren
- Price: 150 €
- color: Orange
- db: 95
- notes: Combined pre-alarm
- voltage: 24V

### FL-BL-V-SEP Flash+Sirène blue
- Code: 40-441
- Family: Flash+Siren
- Price: 150 €
- color: Blue
- db: 95
- voltage: 24V

### SOCK-H-R high socket IP65 rouge
- Code: 40-415
- Family: High socket
- Price: 100 €
- color: Red
- ip: IP65
- notes: Exterior machine room door
- voltage: 24V

### SOCK-H-R-230 high socket 230V
- Code: 40-420
- Family: High socket
- Price: 100 €
- color: Red
- ip: IP65
- notes: 230V version + PSU 40-420-ND
- voltage: 230VAC

### Protection bracket large 180mm
- Code: 40-901
- Family: Accessory
- Price: 25 €
- notes: For G-Series, TR-Series

### Protection bracket small 100mm
- Code: 40-902
- Family: Accessory
- Price: 20 €
- notes: For MP-Series

### UPS 1000 Battery back-up
- Code: 4000-0001
- Family: Power
- Price: 350 €
- notes: Without batteries
- voltage: 24V

### DT 300 Service tool
- Code: 60-130
- Family: Service
- Price: 114 €
- notes: Annual maintenance for G-Series, TR, MP

### SA200 Service tool
- Code: 60-120
- Family: Service
- Price: 114 €
- notes: For Glaciär Midi

### Glaciär Midi Calibration Kit
- Code: 61-9040
- Family: Service
- Price: 95 €
- notes: Annual calibration

### RMV backbox flush mount
- Code: KAP045
- Family: Accessory
- Price: 0 €
- notes: For RMV-HFC flush mounting

### RMV backbox surface mount
- Code: KAP046
- Family: Accessory
- Price: 0 €
- notes: For RMV-HFC surface mounting, H=30mm

### GLACIÄR Power Adapter 85-305VAC → 24VDC
- Code: 4000-0002
- Family: power-adapter
- Price: 99 €
- input: 85-305 VAC
- output: 24VDC 1.3A
- power: 31.2W
- temp: -30 ~ +70°C
- dimensions: 91x39.5x28.5mm
- compatibleWith: GLACIÄR MIDI
- warranty: 3 years

---

## REFRIGERANTS (20)

### Carbon dioxide (CO₂) (ID: 744)
- Safety Class: A1
- atel: 0.072
- bp: -78
- density: heavy
- gw: 1
- lfl: NF
- mm: 44
- mount: Low ~20cm
- pl: 0.1
- vd: 1.8

### R-410A (R-32/125) (ID: 410A)
- Safety Class: A1
- atel: 0.42
- bp: -52
- density: heavy
- gw: 2088
- lfl: NF
- mm: 72.6
- mount: Low ~20cm
- pl: 0.44
- vd: 2.97

### R-407C (R-32/125/134a) (ID: 407C)
- Safety Class: A1
- atel: 0.29
- bp: -37
- density: heavy
- gw: 1774
- lfl: NF
- mm: 86.2
- mount: Low ~20cm
- pl: 0.31
- vd: 3.53

### R-404A (R-125/143a/134a) (ID: 404A)
- Safety Class: A1
- atel: 0.52
- bp: -46
- density: heavy
- gw: 3922
- lfl: NF
- mm: 97.6
- mount: Low ~20cm
- pl: 0.52
- vd: 3.99

### R-134a (Tetrafluoroethane) (ID: 134a)
- Safety Class: A1
- atel: 0.21
- bp: -26
- density: heavy
- gw: 1430
- lfl: NF
- mm: 102
- mount: Low ~20cm
- pl: 0.25
- vd: 4.17

### R-507A (R-125/143a) (ID: 507A)
- Safety Class: A1
- atel: 0.53
- bp: -47
- density: heavy
- gw: 3985
- lfl: NF
- mm: 98.9
- mount: Low ~20cm
- pl: 0.53
- vd: 4.04

### R-448A (Solstice N40) (ID: 448A)
- Safety Class: A1
- atel: 0.388
- bp: -40
- density: heavy
- gw: 1387
- lfl: NF
- mm: 86.3
- mount: Low ~20cm
- pl: 0.388
- vd: 3.58

### R-449A (Opteon XP40) (ID: 449A)
- Safety Class: A1
- atel: 0.357
- bp: -40
- density: heavy
- gw: 1397
- lfl: NF
- mm: 87.2
- mount: Low ~20cm
- pl: 0.357
- vd: 3.62

### R-513A (Opteon XP10) (ID: 513A)
- Safety Class: A1
- atel: 0.319
- bp: -29
- density: heavy
- gw: 631
- lfl: NF
- mm: 108.4
- mount: Low ~20cm
- pl: 0.319
- vd: 4.26

### R-32 (Difluoromethane) (ID: 32)
- Safety Class: A2L
- atel: 0.3
- bp: -52
- density: heavy
- gw: 675
- lfl: 0.307
- mm: 52
- mount: Low ~20cm
- pl: 0.061
- vd: 2.13

### R-454A (ID: 454A)
- Safety Class: A2L
- atel: 0.461
- bp: -42
- density: heavy
- gw: 239
- lfl: 0.278
- mm: 80.5
- mount: Low ~20cm
- pl: 0.056
- vd: 3.34

### R-454B (Opteon XL41) (ID: 454B)
- Safety Class: A2L
- atel: 0.358
- bp: -50
- density: heavy
- gw: 466
- lfl: 0.303
- mm: 62.6
- mount: Low ~20cm
- pl: 0.039
- vd: 2.6

### R-454C (Opteon XL20) (ID: 454C)
- Safety Class: A2L
- atel: 0.445
- bp: -38
- density: heavy
- gw: 148
- lfl: 0.293
- mm: 90.8
- mount: Low ~20cm
- pl: 0.059
- vd: 3.78

### R-455A (Solstice L40X) (ID: 455A)
- Safety Class: A2L
- atel: 0.393
- bp: -39
- density: heavy
- gw: 148
- lfl: 0.431
- mm: 87.5
- mount: Low ~20cm
- pl: 0.086
- vd: 3.64

### R-452B (Opteon XL55) (ID: 452B)
- Safety Class: A2L
- atel: 0.364
- bp: -50
- density: heavy
- gw: 698
- lfl: 0.31
- mm: 63.5
- mount: Low ~20cm
- pl: 0.062
- vd: 2.63

### HFO-1234yf (ID: 1234yf)
- Safety Class: A2L
- atel: 0.47
- bp: -30
- density: heavy
- gw: 4
- lfl: 0.289
- mm: 114
- mount: Low ~20cm
- pl: 0.058
- vd: 4.66

### HFO-1234ze(E) (ID: 1234ze)
- Safety Class: A2L
- atel: 0.28
- bp: -19
- density: heavy
- gw: 7
- lfl: 0.303
- mm: 114
- mount: Low ~20cm
- pl: 0.061
- vd: 4.66

### Ammonia (NH₃) (ID: 717)
- Safety Class: B2L
- atel: 0.00022
- bp: -33
- density: light
- gw: 0
- lfl: 0.116
- mm: 17
- mount: HIGH ~20cm below ceiling
- pl: 0.00035
- vd: 0.7

### Propane (R290) (ID: 290)
- Safety Class: A3
- atel: 0.09
- bp: -42
- density: heavy
- gw: 3
- lfl: 0.038
- mm: 44
- mount: Low ~20cm
- pl: 0.008
- vd: 1.8

### Isobutane (R600a) (ID: 600a)
- Safety Class: A3
- atel: 0.059
- bp: -12
- density: heavy
- gw: 3
- lfl: 0.043
- mm: 58.1
- mount: Low ~20cm
- pl: 0.011
- vd: 2.38

---

## GAS CATEGORIES (5)

### CO₂ (R744) / CO₂ (R744)
- ID: co2
- Code: CO₂
- Safety Class: A1
- Coverage: 50 m²
- Density: heavy
- alarms: {"a1En":"Orange flash","a1Fr":"Flash orange","a2En":"Red flash + siren + forced ventilation","a2Fr":"Flash rouge + sirène + ventilation forcée","a3En":"All + machine stop + evacuation","a3Fr":"Tout + arrêt machine + évacuation","s1":"5,000 ppm","s2":"10,000 ppm","s3":"30,000 ppm"}
- lifeEn: "7-10 years"
- lifeFr: "7-10 ans"
- mountEn: "Low — ~20cm above floor"
- mountFr: "Bas — ~20cm du sol"
- refs: ["744"]
- techEn: "NDIR Infrared"
- techFr: "Infrarouge NDIR"

### HFC/HFO A1 / HFC/HFO A1
- ID: hfc1
- Code: R410A/R407C/R507A
- Safety Class: A1
- Coverage: 50 m²
- Density: heavy
- techFr: "Semi-conducteur (MOS)"
- techEn: "Semiconductor (MOS)"
- lifeFr: "~5 ans"
- lifeEn: "~5 years"
- mountFr: "Bas — ~20cm du sol"
- mountEn: "Low — ~20cm above floor"
- alarms: {"s1":"1,000 ppm","a1Fr":"Flash orange","a1En":"Orange flash","s2":"4,000 ppm","a2Fr":"Flash rouge + sirène + ventilation","a2En":"Red flash + siren + ventilation","s3":"—","a3Fr":"—","a3En":"—"}
- refs: ["410A","407F","404A","134a"]

### HFC/HFO A2L / HFC/HFO A2L
- ID: a2l
- Code: R32/R454B/R454C
- Safety Class: A2L
- Coverage: 40 m²
- Density: heavy
- alarms: {"a1En":"Orange flash","a1Fr":"Flash orange","a2En":"Red flash + siren + ventilation + ignition cutoff","a2Fr":"Flash rouge + sirène + ventilation + coupure ignition","a3En":"—","a3Fr":"—","s1":"25% LFL","s2":"50% LFL","s3":"—"}
- lifeEn: "~5 years"
- lifeFr: "~5 ans"
- mountEn: "Low — ~20cm above floor"
- mountFr: "Bas — ~20cm du sol"
- refs: ["32","454A","454B","454C","455A","452B","1234yf","1234ze"]
- techEn: "Semiconductor (MOS)"
- techFr: "Semi-conducteur (MOS)"

### NH₃ Ammoniac (R717) / NH₃ Ammonia (R717)
- ID: nh3
- Code: NH₃
- Safety Class: B2L
- Coverage: 30 m²
- Density: light
- alarms: {"a1En":"Orange flash + notification","a1Fr":"Flash orange + notification","a2En":"Siren + emergency ventilation + evacuation","a2Fr":"Sirène + ventilation urgence + évacuation","a3En":"Compressor stop + solenoid valve","a3Fr":"Arrêt compresseur + vanne solénoïde","s1":"25 ppm","s2":"300 ppm","s3":"5,000 ppm"}
- lifeEn: "2-3 years (std EC) / 5 years (X5 ionic)"
- lifeFr: "2-3 ans (EC std) / 5 ans (X5 ionique)"
- mountEn: "HIGH — ~20cm below ceiling"
- mountFr: "HAUT — ~20cm sous plafond"
- refs: ["717"]
- techEn: "Electrochemical (EC) / Ionic (X5)"
- techFr: "Électrochimique (EC) / Ionique (X5)"

### R290 Propane / Inflammables / R290 Propane / Flammable
- ID: r290
- Code: R290
- Safety Class: A3
- Coverage: 20 m²
- Density: heavy
- alarms: {"a1En":"Orange flash","a1Fr":"Flash orange","a2En":"Red flash + siren + ventilation + elec. cutoff","a2Fr":"Flash rouge + sirène + ventilation + coupure élec.","a3En":"Evacuation","a3Fr":"Évacuation","s1":"10% LFL","s2":"25% LFL","s3":"50% LFL"}
- lifeEn: "~5 years"
- lifeFr: "~5 ans"
- mountEn: "Low — ~20cm above floor"
- mountFr: "Bas — ~20cm du sol"
- refs: ["290","600a"]
- techEn: "Semiconductor (MOS)"
- techFr: "Semi-conducteur (MOS)"

---

## RULES (11)

### Rule: caseStudy
{
  "charge": 12,
  "client": "Cas type",
  "country": "FR",
  "gases": [
    "a2l"
  ],
  "project": "Chambre froide A2L — R454C",
  "ref": "454C",
  "zones": [
    {
      "atex": false,
      "gasId": "a2l",
      "height": 3,
      "name": "Salle des machines",
      "occupation": "occasional",
      "surface": 15,
      "type": "technique",
      "ventilation": "mechanical"
    },
    {
      "atex": false,
      "gasId": "a2l",
      "height": 3,
      "name": "Chambre froide positive +2°C",
      "occupation": "occasional",
      "surface": 45,
      "type": "chambre_froide",
      "ventilation": "none"
    },
    {
      "atex": false,
      "gasId": "a2l",
      "height": 3,
      "name": "Chambre froide négative -20°C",
      "occupation": "occasional",
      "surface": 30,
      "type": "chambre_froide",
      "ventilation": "none"
    },
    {
      "atex": false,
      "gasId": "a2l",
      "height": 3.5,
      "name": "Zone de préparation",
      "occupation": "permanent",
      "surface": 60,
      "type": "publique",
      "ventilation": "mechanical"
    }
  ]
}

### Rule: caseStudy
{
  "charge": 120,
  "client": "Cas type",
  "country": "FR",
  "gases": [
    "co2"
  ],
  "project": "Supermarché CO₂ transcritique",
  "ref": "744",
  "zones": [
    {
      "atex": false,
      "gasId": "co2",
      "height": 3.5,
      "name": "Salle machines compresseurs",
      "occupation": "occasional",
      "surface": 25,
      "type": "technique",
      "ventilation": "mechanical"
    },
    {
      "atex": false,
      "gasId": "co2",
      "height": 3,
      "name": "Chambre froide positive",
      "occupation": "occasional",
      "surface": 35,
      "type": "chambre_froide",
      "ventilation": "none"
    },
    {
      "atex": false,
      "gasId": "co2",
      "height": 3,
      "name": "Chambre froide négative",
      "occupation": "occasional",
      "surface": 25,
      "type": "chambre_froide",
      "ventilation": "none"
    },
    {
      "atex": false,
      "gasId": "co2",
      "height": 4,
      "name": "Surface de vente",
      "occupation": "permanent",
      "surface": 500,
      "type": "publique",
      "ventilation": "mechanical"
    },
    {
      "atex": false,
      "gasId": "co2",
      "height": 4.5,
      "name": "Quai de réception",
      "occupation": "occasional",
      "surface": 80,
      "type": "quai",
      "ventilation": "natural"
    }
  ]
}

### Rule: caseStudy
{
  "charge": 500,
  "client": "Cas type",
  "country": "FR",
  "gases": [
    "nh3"
  ],
  "project": "Entrepôt froid NH₃ industriel",
  "ref": "717",
  "zones": [
    {
      "atex": true,
      "gasId": "nh3",
      "height": 5,
      "name": "Salle des machines NH₃",
      "occupation": "occasional",
      "surface": 50,
      "type": "technique",
      "ventilation": "mechanical"
    },
    {
      "atex": false,
      "gasId": "nh3",
      "height": 8,
      "name": "Chambre froide -25°C (Zone A)",
      "occupation": "none",
      "surface": 300,
      "type": "chambre_froide",
      "ventilation": "none"
    },
    {
      "atex": false,
      "gasId": "nh3",
      "height": 8,
      "name": "Chambre froide -25°C (Zone B)",
      "occupation": "none",
      "surface": 200,
      "type": "chambre_froide",
      "ventilation": "none"
    },
    {
      "atex": false,
      "gasId": "nh3",
      "height": 5,
      "name": "Quai de chargement",
      "occupation": "occasional",
      "surface": 80,
      "type": "quai",
      "ventilation": "natural"
    }
  ]
}

### Rule: caseStudy
{
  "charge": 65,
  "client": "Cas type",
  "country": "FR",
  "gases": [
    "a2l",
    "vrf"
  ],
  "project": "Hôtel VRF R32 — 80 chambres",
  "ref": "32",
  "zones": [
    {
      "atex": false,
      "gasId": "a2l",
      "height": 3,
      "name": "Local technique RDC",
      "occupation": "occasional",
      "surface": 20,
      "type": "technique",
      "ventilation": "mechanical"
    },
    {
      "atex": false,
      "gasId": "a2l",
      "height": 3,
      "name": "Local technique R+3",
      "occupation": "occasional",
      "surface": 15,
      "type": "technique",
      "ventilation": "mechanical"
    },
    {
      "atex": false,
      "gasId": "a2l",
      "height": 2.5,
      "name": "Combles (unités extérieures)",
      "occupation": "none",
      "surface": 100,
      "type": "technique",
      "ventilation": "natural"
    },
    {
      "atex": false,
      "gasId": "vrf",
      "height": 4,
      "name": "Lobby + Restaurant",
      "occupation": "permanent",
      "surface": 180,
      "type": "publique",
      "ventilation": "mechanical"
    },
    {
      "atex": false,
      "gasId": "vrf",
      "height": 2.7,
      "name": "Chambres étage type (×80)",
      "occupation": "permanent",
      "surface": 25,
      "type": "bureau",
      "ventilation": "mechanical"
    }
  ]
}

### Rule: architecture
{
  "basicMaxDet": 8,
  "basicMaxZones": 4,
  "standaloneMaxDet": 2,
  "standaloneMaxZones": 1
}

### Rule: bomAutoAdd
[
  {
    "condition": "if_midi",
    "productId": "flash-siren-r",
    "qtyRule": "per_detector"
  },
  {
    "condition": "if_midi",
    "productId": "cal-kit-midi",
    "qtyRule": "fixed_1"
  },
  {
    "condition": "if_midi_230v",
    "productId": "power-adapter",
    "qtyRule": "per_detector"
  },
  {
    "condition": "if_flrl_230v",
    "productId": "sock-h-r-230",
    "qtyRule": "per_flrl"
  },
  {
    "condition": "if_mpu_spu_gseries",
    "productId": "dt300",
    "qtyRule": "fixed_1"
  }
]

### Rule: clientForm
{
  "fields": [
    {
      "id": "clientName",
      "labelEn": "Full name",
      "labelFr": "Nom complet",
      "placeholder": "Jean Dupont",
      "required": true,
      "type": "text"
    },
    {
      "id": "clientEmail",
      "labelEn": "Professional email",
      "labelFr": "Email professionnel",
      "placeholder": "jean.dupont@company.com",
      "required": true,
      "type": "email"
    },
    {
      "id": "clientCompany",
      "labelEn": "Company",
      "labelFr": "Société",
      "placeholder": "Carrefour SA",
      "required": true,
      "type": "text"
    },
    {
      "id": "clientPhone",
      "labelEn": "Phone",
      "labelFr": "Téléphone",
      "placeholder": "+33 6 12 34 56 78",
      "required": false,
      "type": "tel"
    },
    {
      "id": "clientRole",
      "labelEn": "Role",
      "labelFr": "Fonction",
      "options": "Installateur,Bureau d'études,Exploitant,Distributeur,Autre",
      "required": false,
      "type": "select"
    }
  ],
  "rgpdRequired": true,
  "rgpdTextEn": "By submitting this form, I consent to SAMON AB collecting and processing my personal data in accordance with GDPR (EU Regulation 2016/679) for the purpose of providing a technical proposal. My data will not be shared with third parties without my consent. I can exercise my rights of access, rectification and deletion by contacting privacy@samon.com.",
  "rgpdTextFr": "En soumettant ce formulaire, j'accepte que SAMON AB collecte et traite mes données personnelles conformément au RGPD (Règlement UE 2016/679) dans le but de fournir une proposition technique. Mes données ne seront pas partagées avec des tiers sans mon consentement. Je peux exercer mes droits d'accès, de rectification et de suppression en contactant privacy@samon.com."
}

### Rule: controllerSelection
[
  {
    "controllerId": "mpu2c",
    "maxDet": 2,
    "minDet": 1,
    "qtyFormula": "fixed_1"
  },
  {
    "controllerId": "mpu4c",
    "maxDet": 4,
    "minDet": 3,
    "qtyFormula": "fixed_1"
  },
  {
    "controllerId": "mpu6c",
    "maxDet": 6,
    "minDet": 5,
    "qtyFormula": "fixed_1"
  },
  {
    "controllerId": "ctrl10",
    "maxDet": 10,
    "minDet": 7,
    "qtyFormula": "fixed_1"
  },
  {
    "controllerId": "ctrl10",
    "maxDet": 999,
    "minDet": 11,
    "qtyFormula": "ceil_div_10"
  }
]

### Rule: detection
{
  "criticalMultiplier": 1.5,
  "minPerZone": 1,
  "noVentilationAdd": 1
}

### Rule: detectorSelection
[
  {
    "atex": false,
    "detectorId": "midi-co2",
    "gasId": "co2",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": false,
    "detectorId": "midi-co2-r",
    "gasId": "co2",
    "sensorId": "",
    "zoneType": "chambre_froide"
  },
  {
    "atex": true,
    "detectorId": "x5-co2",
    "gasId": "co2",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": false,
    "detectorId": "midi-hfc1",
    "gasId": "hfc1",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": true,
    "detectorId": "gex-hfc",
    "gasId": "hfc1",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": false,
    "detectorId": "midi-hfc1",
    "gasId": "a2l",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": true,
    "detectorId": "gex-hfc",
    "gasId": "a2l",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": false,
    "detectorId": "midi-nh3-1000",
    "gasId": "nh3",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": true,
    "detectorId": "x5-nh3-100",
    "gasId": "nh3",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": false,
    "detectorId": "midi-r290",
    "gasId": "r290",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": true,
    "detectorId": "gex-r290",
    "gasId": "r290",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": false,
    "detectorId": "x5-co",
    "gasId": "parking",
    "sensorId": "x5-no2",
    "zoneType": "*"
  },
  {
    "atex": false,
    "detectorId": "rm-hfc",
    "gasId": "vrf",
    "sensorId": "",
    "zoneType": "*"
  },
  {
    "atex": false,
    "detectorId": "midi-hfc1",
    "gasId": "vrf",
    "sensorId": "",
    "zoneType": "technique"
  }
]

### Rule: technicalNote
{
  "a3Norms": "EN 60079, ATEX Zone 2",
  "baseNorms": "EN 378-1/2/3/4, EN 14624",
  "maintenance": "Calibration annuelle de tous les détecteurs (EN 378-4)\nTest fonctionnel semestriel avec gaz étalon\nRemplacement capteur EC tous les 2-3 ans (sauf X5 ionic : 5 ans)\nFormation du personnel au protocole d'évacuation",
  "nh3Norms": "EN 13313, ATEX 2014/34/EU",
  "parkingNorms": "EN 50545"
}

---

## QUOTES (75)

### Quote SAM-2026-0001
- Status: new
- Date: Wed Mar 25 2026 23:05:00 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 788 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"0663837577","country":"France","message":""}
- Project: {"name":"","location":"","type":""}
- Selections: {}
- Results: {
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "Détecteur",
      "qty": 1,
      "price": 403,
      "total": 403,
      "zones": "Zone 1"
    },
    {
      "ref": "40-4021",
      "name": "BE-A 24V Flash orange",
      "cat": "Alarme",
      "qty": 1,
      "price": 85,
      "total": 85,
      "zones": "All"
    },
    {
      "ref": "40-4022",
      "name": "BE-R 24V Flash rouge",
      "cat": "Alarme",
      "qty": 1,
      "price": 85,
      "total": 85,
      "zones": "All"
    },
    {
      "ref": "40-410",
      "name": "1992-R-LP Sirène 9-28VDC",
      "cat": "Alarme",
      "qty": 1,
      "price": 120,
      "total": 120,
      "zones": "All"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "Accessoire",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "if_midi"
    }
  ],
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "vrf",
        "icon": "&#127978;",
        "nameFr": "VRF / Espaces occupés",
        "nameEn": "VRF / Occupied spaces",
        "code": "HFC (R410A/R32)",
        "safetyClass": "A1",
        "tagCls": "tag-a1",
        "coverage": 50,
        "density": "heavy",
        "mountFr": "Bas — ~20cm du sol, près évaporateur",
        "mountEn": "Low — ~20cm, near evaporator",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "refs": [
          "410A",
          "32",
          "134a"
        ],
        "alarms": {
          "s1": "1,000 ppm",
          "s2": "4,000 ppm",
          "s3": "—",
          "a1Fr": "LED tri-couleur + buzzer",
          "a1En": "Tri-colour LED + buzzer",
          "a2Fr": "Alarme sonore 85dB + ventilation",
          "a2En": "85dB alarm + ventilation",
          "a3Fr": "—",
          "a3En": "—"
        }
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      }
    }
  ],
  "summary": "AUTONOME\ndedde — Le Grand Liban\n1\nDÉTECTEURS\n1\nZONES\n50\nM²\n788\nTOTAL HT\nSchéma Architecture\nSAMON — AUTONOME\nProject: dedde    1 detectors / 1 zones\n═════════════════════════════════════════════════════════════════\n\n  Zone 1\n  [Glaciär Midi SC HFC/HFO Group 1 x1] ──relais──▶ [Flash + Sirène]\n\n\n═════════════════════════════════════════════════════════════════\nNorme : EN 378-1/2/3 + EN 14624   |   Pays: FR\nDétail par Zone\nZone 1\n50 m² × 3m = 150 m³\nGaz : HFC (R410A/R32) (A1)\nMontage : Bas — ~20cm du sol, près évaporateur\nProduit : Glaciär Midi SC HFC/HFO Group 1\n1 détecteur(s)\nNomenclature (BOM)\n#\tRÉF. SAMON\tDÉSIGNATION\tCAT.\tQTÉ\tPU €\tTOTAL €\nDÉTECTEUR\n1\t31-220-12\tGlaciär Midi SC HFC/HFO Group 1\tDétecteur\t1\t403\t403\nALARME\n2\t40-4021\tBE-A 24V Flash orange\tAlarme\t1\t85\t85\n3\t40-4022\tBE-R 24V Flash rouge\tAlarme\t1\t85\t85\n4\t40-410\t1992-R-LP Sirène 9-28VDC\tAlarme\t1\t120\t120\nACCESSOIRE\n5\t61-9040\tGlaciär Midi Calibration Kit\tAccessoire\t1\t95\t95\n\tTOTAL HT\t788 €\nMatrice d'Alarme\nGAZ\tSEUIL 1 (PRÉALARME)\tSEUIL 2 (ALARME)\tSEUIL 3 (CRITIQUE)\tACTIONS\nHFC (R410A/R32)\nA1\t1,000 ppm\nLED tri-couleur + buzzer\t4,000 ppm\nAlarme sonore 85dB + ventilation\t—\tAlarme sonore 85dB + ventilation\nNote Technique\nNORMES APPLICABLES\n\nEN 378-1/2/3/4 • EN 14624\n\nHYPOTHÈSES\nCharge réfrigérant : N/A kg\nScénario de fuite : 100% de la charge (worst case EN 378)\nCouverture par détecteur basée sur la classification de sécurité du réfrigérant\nCONFORMITÉ EN 378\n§6.4.5 — Détection obligatoire si concentration peut dépasser la limite pratique ✓\n§6.4.6 — Positionnement selon densité du gaz ✓\n§6.4.7 — Alarme à 2 niveaux minimum ✓\n§6.4.8 — Ventilation mécanique activée sur alarme ✓\nLIMITES\nPositionnement exact des détecteurs à valider par visite technique sur site\nLongueurs de câble estimées — à confirmer selon plan d'implantation\nPrix basés sur tarif SAMON 2026 EUR Rev 2 — hors installation et mise en service\nRECOMMANDATIONS MAINTENANCE\nCalibration annuelle de tous les détecteurs (EN 378-4)\nTest fonctionnel semestriel avec"
}

### Quote SAM-2026-0002
- Status: new
- Date: Wed Mar 25 2026 23:21:00 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 9341 €
- Client: {"firstName":"Pierre","lastName":"Martin","company":"Frigotech SARL","email":"p.martin@frigotech.fr","phone":"+33 6 45 67 89 01","country":"France","message":"Besoin urgent pour mise en conformite EN378 avant audit juin 2026"}
- Project: {"name":"Entrepot Logistique Rungis","charge":"45","country":"FR"}
- Selections: {"gases":[{"id":"co2","nameFr":"CO2 (R744)","nameEn":"CO2 (R744)","safetyClass":"A1"}],"refrigerant":{"id":"744","name":"Carbon dioxide","safetyClass":"A1","gwp":"1"},"zonesInput":[{"name":"Salle machines","type":"technique","surface":80,"height":4,"gasId":"co2","ventilation":"mechanical","occupation":"occasional","atex":false},{"name":"Quai reception","type":"stockage","surface":200,"height":5,"gasId":"co2","ventilation":"natural","occupation":"permanent","atex":false},{"name":"Chambre froide -25C","type":"technique","surface":120,"height":4,"gasId":"co2","ventilation":"none","occupation":"occasional","atex":false}]}
- Results: {
  "architecture": "CENTRALISEE MULTI-ZONES",
  "totalDetectors": 9,
  "zonesCalculated": [
    {
      "name": "Salle machines",
      "type": "technique",
      "surface": 80,
      "height": 4,
      "volume": 320,
      "gasId": "co2",
      "gasName": "CO2 (R744)",
      "safetyClass": "A1",
      "detectors": 2,
      "ventilation": "mechanical",
      "atex": false,
      "productName": "GSH24-CO2-10000",
      "productCode": "37-4120"
    },
    {
      "name": "Quai reception",
      "type": "stockage",
      "surface": 200,
      "height": 5,
      "volume": 1000,
      "gasId": "co2",
      "gasName": "CO2 (R744)",
      "safetyClass": "A1",
      "detectors": 4,
      "ventilation": "natural",
      "atex": false,
      "productName": "MPS-CO2-10000",
      "productCode": "34-410"
    },
    {
      "name": "Chambre froide -25C",
      "type": "technique",
      "surface": 120,
      "height": 4,
      "volume": 480,
      "gasId": "co2",
      "gasName": "CO2 (R744)",
      "safetyClass": "A1",
      "detectors": 3,
      "ventilation": "none",
      "atex": false,
      "productName": "Glaciar Midi IR CO2 10000ppm",
      "productCode": "31-210-32"
    }
  ],
  "bom": [
    {
      "ref": "37-4120",
      "name": "GSH24-CO2-10000",
      "cat": "Detecteur",
      "qty": 2,
      "price": 792,
      "total": 1584,
      "zones": "Salle machines"
    },
    {
      "ref": "34-410",
      "name": "MPS-CO2-10000",
      "cat": "Detecteur",
      "qty": 4,
      "price": 683,
      "total": 2732,
      "zones": "Quai reception"
    },
    {
      "ref": "31-210-32",
      "name": "Glaciar Midi IR CO2 10000ppm",
      "cat": "Detecteur",
      "qty": 3,
      "price": 673,
      "total": 2019,
      "zones": "Chambre froide"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "Controleur",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Central"
    },
    {
      "ref": "20-350",
      "name": "SPU24",
      "cat": "Controleur",
      "qty": 1,
      "price": 424,
      "total": 424,
      "zones": "Salle machines"
    },
    {
      "ref": "40-4021",
      "name": "BE-A 24V Flash orange",
      "cat": "Alarme",
      "qty": 3,
      "price": 85,
      "total": 255,
      "zones": "All"
    },
    {
      "ref": "40-4022",
      "name": "BE-R 24V Flash rouge",
      "cat": "Alarme",
      "qty": 3,
      "price": 85,
      "total": 255,
      "zones": "All"
    },
    {
      "ref": "40-410",
      "name": "Sirene 1992-R-LP",
      "cat": "Alarme",
      "qty": 3,
      "price": 120,
      "total": 360,
      "zones": "All"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "Accessoire",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Maintenance"
    }
  ],
  "grandTotal": 9341
}

### Quote SAM-2026-0003
- Status: new
- Date: Thu Mar 26 2026 00:02:04 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 0 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"dfdd","country":"FR","charge":"3","notes":"","rgpdConsent":true}
- Project: {}
- Selections: {}
- Results: {}

### Quote SAM-2026-0004
- Status: new
- Date: Thu Mar 26 2026 00:04:34 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 0 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"ddfdfd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {}
- Selections: {}
- Results: {}

### Quote SAM-2026-0005
- Status: new
- Date: Thu Mar 26 2026 01:02:54 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 0 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"fdd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {}
- Selections: {}
- Results: {}

### Quote SAM-2026-0006
- Status: new
- Date: Thu Mar 26 2026 01:23:43 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 6704 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"dfdfd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"dfdfd","country":"FR","notes":""}
- Selections: {"gases":["nh3"],"zones":[{"id":"b140a99d-644e-44bc-98c5-663e1d8a5ea3","name":"Zone 1","type":"technique","gasId":"nh3","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false},{"id":"2c0e878f-ccbd-4ebd-98d9-02dbb32911dc","name":"Zone 2","type":"technique","gasId":"nh3","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "nh3",
        "nameFr": "NH₃ Ammoniac (R717)",
        "nameEn": "NH₃ Ammonia (R717)",
        "code": "NH₃",
        "safetyClass": "B2L",
        "coverage": 30,
        "density": "light",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash + notification",
          "a1Fr": "Flash orange + notification",
          "a2En": "Siren + emergency ventilation + evacuation",
          "a2Fr": "Sirène + ventilation urgence + évacuation",
          "a3En": "Compressor stop + solenoid valve",
          "a3Fr": "Arrêt compresseur + vanne solénoïde",
          "s1": "25 ppm",
          "s2": "300 ppm",
          "s3": "5,000 ppm"
        },
        "lifeEn": "2-3 years (std EC) / 5 years (X5 ionic)",
        "lifeFr": "2-3 ans (EC std) / 5 ans (X5 ionique)",
        "mountEn": "HIGH — ~20cm below ceiling",
        "mountFr": "HAUT — ~20cm sous plafond",
        "refs": [
          "717"
        ],
        "techEn": "Electrochemical (EC) / Ionic (X5)",
        "techFr": "Électrochimique (EC) / Ionique (X5)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "product": {
        "det": "midi-nh3-1000",
        "needsSensor": false
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "nh3",
        "nameFr": "NH₃ Ammoniac (R717)",
        "nameEn": "NH₃ Ammonia (R717)",
        "code": "NH₃",
        "safetyClass": "B2L",
        "coverage": 30,
        "density": "light",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash + notification",
          "a1Fr": "Flash orange + notification",
          "a2En": "Siren + emergency ventilation + evacuation",
          "a2Fr": "Sirène + ventilation urgence + évacuation",
          "a3En": "Compressor stop + solenoid valve",
          "a3Fr": "Arrêt compresseur + vanne solénoïde",
          "s1": "25 ppm",
          "s2": "300 ppm",
          "s3": "5,000 ppm"
        },
        "lifeEn": "2-3 years (std EC) / 5 years (X5 ionic)",
        "lifeFr": "2-3 ans (EC std) / 5 ans (X5 ionique)",
        "mountEn": "HIGH — ~20cm below ceiling",
        "mountFr": "HAUT — ~20cm sous plafond",
        "refs": [
          "717"
        ],
        "techEn": "Electrochemical (EC) / Ionic (X5)",
        "techFr": "Électrochimique (EC) / Ionique (X5)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "product": {
        "det": "midi-nh3-1000",
        "needsSensor": false
      }
    }
  ],
  "totalDets": 4,
  "arch": "reinforced",
  "archLabel": "SÉCURITÉ RENFORCÉE",
  "bom": [
    {
      "ref": "31-250-23",
      "name": "Glaciär Midi EC NH₃ 1000ppm",
      "cat": "detector",
      "qty": 4,
      "price": 916,
      "total": 3664,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "System"
    },
    {
      "ref": "40-4021",
      "name": "BE-A 24V Flash orange",
      "cat": "alarm",
      "qty": 2,
      "price": 85,
      "total": 170,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "40-4022",
      "name": "BE-R 24V Flash rouge",
      "cat": "alarm",
      "qty": 2,
      "price": 85,
      "total": 170,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "40-410",
      "name": "1992-R-LP Sirène",
      "cat": "alarm",
      "qty": 2,
      "price": 120,
      "total": 240,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 1, Zone 2"
    }
  ],
  "grandTotal": 6704
}

### Quote SAM-2026-0007
- Status: new
- Date: Thu Mar 26 2026 02:34:40 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4317 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"cvvc","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"cvccv","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"cvccv","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"9c6d1ac9-6004-4be0-8954-477007f7dfbd","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false},{"id":"6899d1ef-fa39-4337-bf45-258bb9b281a6","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO Groupe 1",
        "nameEn": "HFC/HFO Group 1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "1,000 ppm",
          "s2": "4,000 ppm",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "410A",
          "407C",
          "407F",
          "404A",
          "507A",
          "448A",
          "449A",
          "513A"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO Groupe 1",
        "nameEn": "HFC/HFO Group 1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "1,000 ppm",
          "s2": "4,000 ppm",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "410A",
          "407C",
          "407F",
          "404A",
          "507A",
          "448A",
          "449A",
          "513A"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 4,
      "price": 403,
      "total": 1612,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 4317,
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)"
  ]
}

### Quote SAM-2026-0008
- Status: new
- Date: Thu Mar 26 2026 16:08:23 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4306 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jhj","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jhj","country":"FR","notes":""}
- Selections: {"gases":["r290"],"zones":[{"id":"cb85e2b8-8ed6-4132-9648-0036929e0060","name":"Zone 3","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 3",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "product": {
        "det": "gex-r290",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)",
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 2,
  "arch": "reinforced",
  "archLabel": "SÉCURITÉ RENFORCÉE",
  "bom": [
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 2,
      "price": 1914,
      "total": 3828,
      "zones": "Zone 3"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "40-420",
      "name": "SOCK-H-R-230 high socket 230V",
      "cat": "accessory",
      "qty": 1,
      "price": 100,
      "total": 100,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 3"
    }
  ],
  "grandTotal": 4306,
  "complianceNotes": [
    "Zone 3: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 3: Zone ATEX requise pour A3 en local technique",
    "Architecture renforcée : relais de défaut et alimentation secours requis (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0009
- Status: new
- Date: Thu Mar 26 2026 16:09:02 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 8362 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jhj","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jhj","country":"FR","notes":""}
- Selections: {"gases":["r290"],"zones":[{"id":"cb85e2b8-8ed6-4132-9648-0036929e0060","name":"Zone 3","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":20,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 3",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 4,
      "ventilation": "none",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "product": {
        "det": "gex-r290",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 2,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Aucune ventilation : facteur ×2",
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)",
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "reinforced",
  "archLabel": "SÉCURITÉ RENFORCÉE",
  "bom": [
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 4,
      "price": 1914,
      "total": 7656,
      "zones": "Zone 3"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "40-420",
      "name": "SOCK-H-R-230 high socket 230V",
      "cat": "accessory",
      "qty": 1,
      "price": 100,
      "total": 100,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 3"
    }
  ],
  "grandTotal": 8362,
  "complianceNotes": [
    "Zone 3: Aucune ventilation : facteur ×2",
    "Zone 3: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 3: Zone ATEX requise pour A3 en local technique",
    "Architecture renforcée : relais de défaut et alimentation secours requis (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0010
- Status: new
- Date: Thu Mar 26 2026 16:09:14 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 8362 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jhj","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jhj","country":"FR","notes":""}
- Selections: {"gases":["r290"],"zones":[{"id":"cb85e2b8-8ed6-4132-9648-0036929e0060","name":"Zone 3","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":20,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 3",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 4,
      "ventilation": "none",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "product": {
        "det": "gex-r290",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 2,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Aucune ventilation : facteur ×2",
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)",
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "reinforced",
  "archLabel": "SÉCURITÉ RENFORCÉE",
  "bom": [
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 4,
      "price": 1914,
      "total": 7656,
      "zones": "Zone 3"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "40-420",
      "name": "SOCK-H-R-230 high socket 230V",
      "cat": "accessory",
      "qty": 1,
      "price": 100,
      "total": 100,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 3"
    }
  ],
  "grandTotal": 8362,
  "complianceNotes": [
    "Zone 3: Aucune ventilation : facteur ×2",
    "Zone 3: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 3: Zone ATEX requise pour A3 en local technique",
    "Architecture renforcée : relais de défaut et alimentation secours requis (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0011
- Status: new
- Date: Thu Mar 26 2026 16:09:37 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 8362 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jhj","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jhj","country":"FR","notes":""}
- Selections: {"gases":["r290"],"zones":[{"id":"cb85e2b8-8ed6-4132-9648-0036929e0060","name":"Zone 3","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":20,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 3",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 4,
      "ventilation": "none",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "product": {
        "det": "gex-r290",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 2,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Aucune ventilation : facteur ×2",
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)",
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "reinforced",
  "archLabel": "SÉCURITÉ RENFORCÉE",
  "bom": [
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 4,
      "price": 1914,
      "total": 7656,
      "zones": "Zone 3"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "40-420",
      "name": "SOCK-H-R-230 high socket 230V",
      "cat": "accessory",
      "qty": 1,
      "price": 100,
      "total": 100,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 3"
    }
  ],
  "grandTotal": 8362,
  "complianceNotes": [
    "Zone 3: Aucune ventilation : facteur ×2",
    "Zone 3: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 3: Zone ATEX requise pour A3 en local technique",
    "Architecture renforcée : relais de défaut et alimentation secours requis (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0012
- Status: new
- Date: Thu Mar 26 2026 16:09:43 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2242 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jhj","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jhj","country":"FR","notes":""}
- Selections: {"gases":["r290"],"zones":[{"id":"cb85e2b8-8ed6-4132-9648-0036929e0060","name":"Zone 3","type":"chambre_froide","gasId":"r290","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":20,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 3",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 4,
      "ventilation": "none",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "mp-d-hc",
        "needsSensor": true
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 2,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Aucune ventilation : facteur ×2",
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "reinforced",
  "archLabel": "SÉCURITÉ RENFORCÉE",
  "bom": [
    {
      "ref": "38-230",
      "name": "MP-D-HC",
      "cat": "detector",
      "qty": 4,
      "price": 409,
      "total": 1636,
      "zones": "Zone 3"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 3"
    }
  ],
  "grandTotal": 2242,
  "complianceNotes": [
    "Zone 3: Aucune ventilation : facteur ×2",
    "Zone 3: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Architecture renforcée : relais de défaut et alimentation secours requis (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0013
- Status: new
- Date: Thu Mar 26 2026 16:09:53 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 6398 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jhj","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jhj","country":"FR","notes":""}
- Selections: {"gases":["r290"],"zones":[{"id":"cb85e2b8-8ed6-4132-9648-0036929e0060","name":"Zone 3","type":"chambre_froide","gasId":"r290","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":20,"evaporators":1},{"id":"f61c406e-ceac-453c-9313-7cd4df1a0f08","name":"Zone 2","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 3",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 4,
      "ventilation": "none",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "mp-d-hc",
        "needsSensor": true
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 2,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Aucune ventilation : facteur ×2",
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "product": {
        "det": "gex-r290",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)",
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 6,
  "arch": "reinforced",
  "archLabel": "SÉCURITÉ RENFORCÉE",
  "bom": [
    {
      "ref": "38-230",
      "name": "MP-D-HC",
      "cat": "detector",
      "qty": 4,
      "price": 409,
      "total": 1636,
      "zones": "Zone 3"
    },
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 2,
      "price": 1914,
      "total": 3828,
      "zones": "Zone 2"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "40-420",
      "name": "SOCK-H-R-230 high socket 230V",
      "cat": "accessory",
      "qty": 1,
      "price": 100,
      "total": 100,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 6,
      "price": 114,
      "total": 684,
      "zones": "Zone 3, Zone 2"
    }
  ],
  "grandTotal": 6398,
  "complianceNotes": [
    "Zone 3: Aucune ventilation : facteur ×2",
    "Zone 3: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Zone ATEX requise pour A3 en local technique",
    "Architecture renforcée : relais de défaut et alimentation secours requis (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0014
- Status: new
- Date: Thu Mar 26 2026 16:11:54 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 6398 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jhj","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jhj","country":"FR","notes":""}
- Selections: {"gases":["r290"],"zones":[{"id":"cb85e2b8-8ed6-4132-9648-0036929e0060","name":"Zone 3","type":"chambre_froide","gasId":"r290","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":20,"evaporators":1},{"id":"f61c406e-ceac-453c-9313-7cd4df1a0f08","name":"Zone 2","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 3",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 4,
      "ventilation": "none",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "mp-d-hc",
        "needsSensor": true
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 2,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Aucune ventilation : facteur ×2",
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "product": {
        "det": "gex-r290",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)",
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 6,
  "arch": "reinforced",
  "archLabel": "SÉCURITÉ RENFORCÉE",
  "bom": [
    {
      "ref": "38-230",
      "name": "MP-D-HC",
      "cat": "detector",
      "qty": 4,
      "price": 409,
      "total": 1636,
      "zones": "Zone 3"
    },
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 2,
      "price": 1914,
      "total": 3828,
      "zones": "Zone 2"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "40-420",
      "name": "SOCK-H-R-230 high socket 230V",
      "cat": "accessory",
      "qty": 1,
      "price": 100,
      "total": 100,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 6,
      "price": 114,
      "total": 684,
      "zones": "Zone 3, Zone 2"
    }
  ],
  "grandTotal": 6398,
  "complianceNotes": [
    "Zone 3: Aucune ventilation : facteur ×2",
    "Zone 3: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Zone ATEX requise pour A3 en local technique",
    "Architecture renforcée : relais de défaut et alimentation secours requis (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0015
- Status: new
- Date: Thu Mar 26 2026 16:16:22 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 6398 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jhj","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jhj","country":"FR","notes":""}
- Selections: {"gases":["r290"],"zones":[{"id":"cb85e2b8-8ed6-4132-9648-0036929e0060","name":"Zone 3","type":"chambre_froide","gasId":"r290","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":20,"evaporators":1},{"id":"f61c406e-ceac-453c-9313-7cd4df1a0f08","name":"Zone 2","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 3",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 4,
      "ventilation": "none",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "mp-d-hc",
        "needsSensor": true
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 2,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Aucune ventilation : facteur ×2",
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "product": {
        "det": "gex-r290",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)",
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 6,
  "arch": "reinforced",
  "archLabel": "SÉCURITÉ RENFORCÉE",
  "bom": [
    {
      "ref": "38-230",
      "name": "MP-D-HC",
      "cat": "detector",
      "qty": 4,
      "price": 409,
      "total": 1636,
      "zones": "Zone 3"
    },
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 2,
      "price": 1914,
      "total": 3828,
      "zones": "Zone 2"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "40-420",
      "name": "SOCK-H-R-230 high socket 230V",
      "cat": "accessory",
      "qty": 1,
      "price": 100,
      "total": 100,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 6,
      "price": 114,
      "total": 684,
      "zones": "Zone 3, Zone 2"
    }
  ],
  "grandTotal": 6398,
  "complianceNotes": [
    "Zone 3: Aucune ventilation : facteur ×2",
    "Zone 3: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Zone ATEX requise pour A3 en local technique",
    "Architecture renforcée : relais de défaut et alimentation secours requis (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0016
- Status: new
- Date: Thu Mar 26 2026 16:19:12 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 6398 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jhj","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jhj","country":"FR","notes":""}
- Selections: {"gases":["co2"],"zones":[{"id":"cb85e2b8-8ed6-4132-9648-0036929e0060","name":"Zone 3","type":"chambre_froide","gasId":"r290","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":20,"evaporators":1},{"id":"f61c406e-ceac-453c-9313-7cd4df1a0f08","name":"Zone 2","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 3",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 4,
      "ventilation": "none",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "mp-d-hc",
        "needsSensor": true
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 2,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Aucune ventilation : facteur ×2",
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "product": {
        "det": "gex-r290",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Classe A3 : minimum 2 détecteurs (redondance EN 378)",
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 6,
  "arch": "reinforced",
  "archLabel": "SÉCURITÉ RENFORCÉE",
  "bom": [
    {
      "ref": "38-230",
      "name": "MP-D-HC",
      "cat": "detector",
      "qty": 4,
      "price": 409,
      "total": 1636,
      "zones": "Zone 3"
    },
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 2,
      "price": 1914,
      "total": 3828,
      "zones": "Zone 2"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "40-420",
      "name": "SOCK-H-R-230 high socket 230V",
      "cat": "accessory",
      "qty": 1,
      "price": 100,
      "total": 100,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 6,
      "price": 114,
      "total": 684,
      "zones": "Zone 3, Zone 2"
    }
  ],
  "grandTotal": 6398,
  "complianceNotes": [
    "Zone 3: Aucune ventilation : facteur ×2",
    "Zone 3: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A3 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Zone ATEX requise pour A3 en local technique",
    "Architecture renforcée : relais de défaut et alimentation secours requis (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0017
- Status: new
- Date: Thu Mar 26 2026 16:20:27 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4317 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"ddf","phone":"ddfd","projectName":"ere","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"ere","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"31f60081-6a61-48f7-a910-fb3bb5a856ac","name":"Zone 1","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"15fa4e4a-a025-4406-ac82-ab13c870eff8","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 30,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "warnings": [
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 4,
      "price": 403,
      "total": 1612,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 4317,
  "complianceNotes": [
    "Zone 1: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A2L : minimum 2 détecteurs (redondance EN 378)"
  ]
}

### Quote SAM-2026-0018
- Status: new
- Date: Thu Mar 26 2026 16:30:26 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4317 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"ddf","phone":"ddfd","projectName":"ere","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"ere","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"31f60081-6a61-48f7-a910-fb3bb5a856ac","name":"Zone 1","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"15fa4e4a-a025-4406-ac82-ab13c870eff8","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 4,
      "price": 403,
      "total": 1612,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 4317,
  "complianceNotes": [
    "Zone 1: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A2L : minimum 2 détecteurs (redondance EN 378)"
  ]
}

### Quote SAM-2026-0019
- Status: new
- Date: Thu Mar 26 2026 16:33:26 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4317 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"ddf","phone":"ddfd","projectName":"ere","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"ere","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"31f60081-6a61-48f7-a910-fb3bb5a856ac","name":"Zone 1","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"15fa4e4a-a025-4406-ac82-ab13c870eff8","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 4,
      "price": 403,
      "total": 1612,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 4317,
  "complianceNotes": [
    "Zone 1: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A2L : minimum 2 détecteurs (redondance EN 378)"
  ]
}

### Quote SAM-2026-0020
- Status: new
- Date: Thu Mar 26 2026 16:38:50 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4317 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"fgfg","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"fgfg","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"615c728e-f5d4-4e9a-938c-546104501826","name":"Zone 1","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"179aaedc-2691-4b90-be6f-ed42413f8f7c","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 4,
      "price": 403,
      "total": 1612,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 4317,
  "complianceNotes": [
    "Zone 1: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A2L : minimum 2 détecteurs (redondance EN 378)"
  ]
}

### Quote SAM-2026-0021
- Status: new
- Date: Thu Mar 26 2026 16:44:01 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4834 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"fgfg","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"fgfg","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"615c728e-f5d4-4e9a-938c-546104501826","name":"Zone 1","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":9,"evaporators":1},{"id":"179aaedc-2691-4b90-be6f-ed42413f8f7c","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 9,
          "volume": 150,
          "concentration": 0.06,
          "pl": 0.062,
          "atel": 0.364,
          "lfl": 0.31,
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "medium"
        },
        "warnings": [
          "Charge modérée : concentration 60.0 g/m³ > 50% du PL — détection recommandée (EN 378-1 §5.3)",
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 3,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.062,
          "atel": 0.364,
          "lfl": 0.31,
          "exceedsPL": true,
          "exceedsATEL": false,
          "riskLevel": "high"
        },
        "warnings": [
          "⚠️ Charge élevée : concentration 66.7 g/m³ dépasse le PL (62.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)",
          "Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)"
        ]
      }
    }
  ],
  "totalDets": 5,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 5,
      "price": 403,
      "total": 2015,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 5,
      "price": 114,
      "total": 570,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 4834,
  "complianceNotes": [
    "Zone 1: Charge modérée : concentration 60.0 g/m³ > 50% du PL — détection recommandée (EN 378-1 §5.3)",
    "Zone 1: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: ⚠️ Charge élevée : concentration 66.7 g/m³ dépasse le PL (62.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
    "Zone 2: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0022
- Status: new
- Date: Thu Mar 26 2026 16:45:40 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4834 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"fgfg","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"fgfg","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"615c728e-f5d4-4e9a-938c-546104501826","name":"Zone 1","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":2,"evaporators":1},{"id":"179aaedc-2691-4b90-be6f-ed42413f8f7c","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 2,
          "volume": 150,
          "concentration": 0.013333333333333334,
          "pl": 0.062,
          "atel": 0.364,
          "lfl": 0.31,
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": [
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 3,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.062,
          "atel": 0.364,
          "lfl": 0.31,
          "exceedsPL": true,
          "exceedsATEL": false,
          "riskLevel": "high"
        },
        "warnings": [
          "⚠️ Charge élevée : concentration 66.7 g/m³ dépasse le PL (62.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
          "Classe A2L : minimum 2 détecteurs (redondance EN 378)",
          "Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)"
        ]
      }
    }
  ],
  "totalDets": 5,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 5,
      "price": 403,
      "total": 2015,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 5,
      "price": 114,
      "total": 570,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 4834,
  "complianceNotes": [
    "Zone 1: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: ⚠️ Charge élevée : concentration 66.7 g/m³ dépasse le PL (62.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
    "Zone 2: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0023
- Status: new
- Date: Thu Mar 26 2026 16:49:40 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"gfv","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"gfv","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"25bcbebc-0d88-4be2-bb23-e2486b5b30a6","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"fbace162-9b41-4c52-a4c1-fad66eabf7aa","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0024
- Status: new
- Date: Thu Mar 26 2026 16:55:42 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"gfv","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"gfv","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"25bcbebc-0d88-4be2-bb23-e2486b5b30a6","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"fbace162-9b41-4c52-a4c1-fad66eabf7aa","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0025
- Status: new
- Date: Thu Mar 26 2026 16:55:49 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"gfv","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"gfv","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"25bcbebc-0d88-4be2-bb23-e2486b5b30a6","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"fbace162-9b41-4c52-a4c1-fad66eabf7aa","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0026
- Status: new
- Date: Thu Mar 26 2026 16:56:05 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4317 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"cdfd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"cdfd","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"f3bb70ae-5526-440b-b0c3-e38633a92fdf","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"e9e20d21-bffa-458a-976a-8299ce9aa9b0","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 4,
      "price": 403,
      "total": 1612,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 4317,
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)"
  ]
}

### Quote SAM-2026-0027
- Status: new
- Date: Thu Mar 26 2026 16:56:32 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"cdfd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"cdfd","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"f3bb70ae-5526-440b-b0c3-e38633a92fdf","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"e9e20d21-bffa-458a-976a-8299ce9aa9b0","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0028
- Status: new
- Date: Thu Mar 26 2026 16:59:05 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"cdfd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"cdfd","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"f3bb70ae-5526-440b-b0c3-e38633a92fdf","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":20,"evaporators":1},{"id":"e9e20d21-bffa-458a-976a-8299ce9aa9b0","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":5,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 20,
          "volume": 150,
          "concentration": 0.13333333333333333,
          "pl": 0.52,
          "atel": 0.52,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 5,
          "volume": 150,
          "concentration": 0.03333333333333333,
          "pl": 0.52,
          "atel": 0.52,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0029
- Status: new
- Date: Thu Mar 26 2026 16:59:15 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"cdfd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"cdfd","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"f3bb70ae-5526-440b-b0c3-e38633a92fdf","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":20,"evaporators":1},{"id":"e9e20d21-bffa-458a-976a-8299ce9aa9b0","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":5,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 20,
          "volume": 150,
          "concentration": 0.13333333333333333,
          "pl": 0.52,
          "atel": 0.52,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 5,
          "volume": 150,
          "concentration": 0.03333333333333333,
          "pl": 0.52,
          "atel": 0.52,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0030
- Status: new
- Date: Thu Mar 26 2026 17:00:06 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"xsxsx","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"xsxs","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"xsxs","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"680889b3-6a40-4aef-a3fd-1ab3927f769c","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1},{"id":"4d143a3e-03f4-4f87-a405-35789c0ff462","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0031
- Status: new
- Date: Thu Mar 26 2026 17:00:30 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"xsxsx","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"xsxs","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"xsxs","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"680889b3-6a40-4aef-a3fd-1ab3927f769c","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":20,"evaporators":1},{"id":"4d143a3e-03f4-4f87-a405-35789c0ff462","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 20,
          "volume": 150,
          "concentration": 0.13333333333333333,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0032
- Status: new
- Date: Thu Mar 26 2026 17:00:39 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 3394 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"xsxsx","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"xsxs","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"xsxs","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"680889b3-6a40-4aef-a3fd-1ab3927f769c","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":100,"evaporators":1},{"id":"4d143a3e-03f4-4f87-a405-35789c0ff462","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 100,
          "volume": 150,
          "concentration": 0.6666666666666666,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": true,
          "exceedsATEL": true,
          "riskLevel": "critical"
        },
        "warnings": [
          "⚠️ CRITIQUE : concentration 666.7 g/m³ dépasse l'ATEL (420.0 g/m³) — ventilation d'urgence et détection renforcée obligatoires (EN 378-1 §5.3)",
          "Charge > PL : facteur détection ×2 (EN 378-3 §6.4)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 3,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 3,
      "price": 403,
      "total": 1209,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 3,
      "price": 114,
      "total": 342,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 3394,
  "complianceNotes": [
    "Zone 1: ⚠️ CRITIQUE : concentration 666.7 g/m³ dépasse l'ATEL (420.0 g/m³) — ventilation d'urgence et détection renforcée obligatoires (EN 378-1 §5.3)",
    "Zone 1: Charge > PL : facteur détection ×2 (EN 378-3 §6.4)"
  ]
}

### Quote SAM-2026-0033
- Status: new
- Date: Thu Mar 26 2026 17:00:53 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"xsxsx","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"xsxs","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"xsxs","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"680889b3-6a40-4aef-a3fd-1ab3927f769c","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":50,"evaporators":1},{"id":"4d143a3e-03f4-4f87-a405-35789c0ff462","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 50,
          "volume": 150,
          "concentration": 0.3333333333333333,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "medium"
        },
        "warnings": [
          "Charge modérée : concentration 333.3 g/m³ > 50% du PL — détection recommandée (EN 378-1 §5.3)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": [
    "Zone 1: Charge modérée : concentration 333.3 g/m³ > 50% du PL — détection recommandée (EN 378-1 §5.3)"
  ]
}

### Quote SAM-2026-0034
- Status: new
- Date: Thu Mar 26 2026 17:01:03 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"xsxsx","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"xsxs","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"xsxs","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"680889b3-6a40-4aef-a3fd-1ab3927f769c","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1},{"id":"4d143a3e-03f4-4f87-a405-35789c0ff462","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0035
- Status: new
- Date: Thu Mar 26 2026 17:01:32 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"xsxsx","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"xsxs","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"xsxs","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"680889b3-6a40-4aef-a3fd-1ab3927f769c","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1},{"id":"4d143a3e-03f4-4f87-a405-35789c0ff462","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0036
- Status: new
- Date: Thu Mar 26 2026 17:02:35 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"xsxsx","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"xsxs","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"xsxs","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"680889b3-6a40-4aef-a3fd-1ab3927f769c","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1},{"id":"4d143a3e-03f4-4f87-a405-35789c0ff462","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0037
- Status: new
- Date: Thu Mar 26 2026 17:03:01 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"xsxsx","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"xsxs","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"xsxs","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"680889b3-6a40-4aef-a3fd-1ab3927f769c","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1},{"id":"4d143a3e-03f4-4f87-a405-35789c0ff462","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0038
- Status: new
- Date: Thu Mar 26 2026 17:05:56 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2877 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"xsxsx","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"xsxs","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"xsxs","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"680889b3-6a40-4aef-a3fd-1ab3927f769c","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1},{"id":"4d143a3e-03f4-4f87-a405-35789c0ff462","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":10,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 10,
          "volume": 150,
          "concentration": 0.06666666666666667,
          "pl": 0.44,
          "atel": 0.42,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": false,
          "riskLevel": "low"
        },
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 2877,
  "complianceNotes": []
}

### Quote SAM-2026-0039
- Status: new
- Date: Thu Mar 26 2026 17:08:50 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 1429 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jjh","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jjh","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"9d7d3d45-b003-4b02-92b4-8435de528aff","name":"Zone 1","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "standalone",
  "archLabel": "AUTONOME",
  "bom": [
    {
      "ref": "31-220-17",
      "name": "Glaciär Midi SC HFC/HFO Group 2",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 2,
      "price": 150,
      "total": 300,
      "zones": "Zone 1"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 1429,
  "complianceNotes": [
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "cabling": {
    "totalLength": 40,
    "sensorCable": 20,
    "busCable": 0,
    "powerCable": 20,
    "notes": [
      "Architecture autonome : câblage alimentation uniquement"
    ]
  },
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 2,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 2,
          "price": 477,
          "total": 954,
          "zones": "Zone 1"
        },
        {
          "ref": "20-300",
          "name": "MPU4C (4 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 1598,
          "total": 1598,
          "zones": "Système"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 1,
          "price": 150,
          "total": 150,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 2,
          "price": 114,
          "total": 228,
          "zones": "Zone 1"
        }
      ],
      "grandTotal": 2930,
      "description": "Solution centralisée avec contrôleur — supervision Modbus, maintenance simplifiée"
    }
  ]
}

### Quote SAM-2026-0040
- Status: new
- Date: Thu Mar 26 2026 17:09:41 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 1429 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jjh","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jjh","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"9d7d3d45-b003-4b02-92b4-8435de528aff","name":"Zone 1","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 2,
  "arch": "standalone",
  "archLabel": "AUTONOME",
  "bom": [
    {
      "ref": "31-220-17",
      "name": "Glaciär Midi SC HFC/HFO Group 2",
      "cat": "detector",
      "qty": 2,
      "price": 403,
      "total": 806,
      "zones": "Zone 1"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 2,
      "price": 150,
      "total": 300,
      "zones": "Zone 1"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 1429,
  "complianceNotes": [
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "cabling": {
    "totalLength": 40,
    "sensorCable": 20,
    "busCable": 0,
    "powerCable": 20,
    "notes": [
      "Architecture autonome : câblage alimentation uniquement"
    ]
  },
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 2,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 2,
          "price": 477,
          "total": 954,
          "zones": "Zone 1"
        },
        {
          "ref": "20-300",
          "name": "MPU4C (4 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 1598,
          "total": 1598,
          "zones": "Système"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 1,
          "price": 150,
          "total": 150,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 2,
          "price": 114,
          "total": 228,
          "zones": "Zone 1"
        }
      ],
      "grandTotal": 2930,
      "description": "Solution centralisée avec contrôleur — supervision Modbus, maintenance simplifiée"
    }
  ]
}

### Quote SAM-2026-0041
- Status: new
- Date: Thu Mar 26 2026 17:09:54 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 762 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jjh","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jjh","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"9d7d3d45-b003-4b02-92b4-8435de528aff","name":"Zone 1","type":"technique","gasId":"a2l","surface":30,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 30,
      "height": 3,
      "volume": 90,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 1,
  "arch": "standalone",
  "archLabel": "AUTONOME",
  "bom": [
    {
      "ref": "31-220-17",
      "name": "Glaciär Midi SC HFC/HFO Group 2",
      "cat": "detector",
      "qty": 1,
      "price": 403,
      "total": 403,
      "zones": "Zone 1"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Zone 1"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Zone 1"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 762,
  "complianceNotes": [
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "cabling": {
    "totalLength": 20,
    "sensorCable": 10,
    "busCable": 0,
    "powerCable": 10,
    "notes": [
      "Architecture autonome : câblage alimentation uniquement"
    ]
  },
  "alternatives": []
}

### Quote SAM-2026-0042
- Status: new
- Date: Thu Mar 26 2026 17:10:45 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 762 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jjh","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jjh","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"9d7d3d45-b003-4b02-92b4-8435de528aff","name":"Zone 1","type":"technique","gasId":"a2l","surface":30,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 30,
      "height": 3,
      "volume": 90,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 1,
  "arch": "standalone",
  "archLabel": "AUTONOME",
  "bom": [
    {
      "ref": "31-220-17",
      "name": "Glaciär Midi SC HFC/HFO Group 2",
      "cat": "detector",
      "qty": 1,
      "price": 403,
      "total": 403,
      "zones": "Zone 1"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Zone 1"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Zone 1"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 762,
  "complianceNotes": [
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "cabling": {
    "totalLength": 20,
    "sensorCable": 10,
    "busCable": 0,
    "powerCable": 10,
    "notes": [
      "Architecture autonome : câblage alimentation uniquement"
    ]
  },
  "alternatives": []
}

### Quote SAM-2026-0043
- Status: new
- Date: Thu Mar 26 2026 17:11:13 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 3394 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jjh","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jjh","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"9d7d3d45-b003-4b02-92b4-8435de528aff","name":"Zone 1","type":"technique","gasId":"a2l","surface":30,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"f338aa81-0537-43cc-8800-412486c8d1fa","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 30,
      "height": 3,
      "volume": 90,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 3,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-17",
      "name": "Glaciär Midi SC HFC/HFO Group 2",
      "cat": "detector",
      "qty": 3,
      "price": 403,
      "total": 1209,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 3,
      "price": 114,
      "total": 342,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 3394,
  "complianceNotes": [
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "cabling": {
    "totalLength": 85,
    "sensorCable": 25,
    "busCable": 35,
    "powerCable": 25,
    "notes": [
      "Bus RS485/Modbus : prévoir câble blindé 2×0.75mm²",
      "Câble capteur : 2×1mm² (max 500m par boucle)"
    ]
  },
  "alternatives": [
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 3,
      "bom": [
        {
          "ref": "31-220-17",
          "name": "Glaciär Midi SC HFC/HFO Group 2",
          "cat": "detector",
          "qty": 3,
          "price": 403,
          "total": 1209,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 3,
          "price": 150,
          "total": 450,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "60-120",
          "name": "SA200 Service tool",
          "cat": "accessory",
          "qty": 3,
          "price": 114,
          "total": 342,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "accessory",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2096,
      "description": "Solution autonome sans contrôleur — installation rapide, coût réduit"
    }
  ]
}

### Quote SAM-2026-0044
- Status: new
- Date: Thu Mar 26 2026 17:12:40 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 3394 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jjh","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jjh","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"9d7d3d45-b003-4b02-92b4-8435de528aff","name":"Zone 1","type":"technique","gasId":"a2l","surface":30,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"f338aa81-0537-43cc-8800-412486c8d1fa","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 30,
      "height": 3,
      "volume": 90,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 3,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-17",
      "name": "Glaciär Midi SC HFC/HFO Group 2",
      "cat": "detector",
      "qty": 3,
      "price": 403,
      "total": 1209,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 3,
      "price": 114,
      "total": 342,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 3394,
  "complianceNotes": [
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "cabling": {
    "totalLength": 85,
    "sensorCable": 25,
    "busCable": 35,
    "powerCable": 25,
    "notes": [
      "Bus RS485/Modbus : prévoir câble blindé 2×0.75mm²",
      "Câble capteur : 2×1mm² (max 500m par boucle)"
    ]
  },
  "alternatives": [
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 3,
      "bom": [
        {
          "ref": "31-220-17",
          "name": "Glaciär Midi SC HFC/HFO Group 2",
          "cat": "detector",
          "qty": 3,
          "price": 403,
          "total": 1209,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 3,
          "price": 150,
          "total": 450,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "60-120",
          "name": "SA200 Service tool",
          "cat": "accessory",
          "qty": 3,
          "price": 114,
          "total": 342,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "accessory",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2096,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    },
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 3,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 3,
          "price": 477,
          "total": 1431,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-300",
          "name": "MPU4C (4 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 1598,
          "total": 1598,
          "zones": "Système"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 1,
          "price": 150,
          "total": 150,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 3,
          "price": 114,
          "total": 342,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 3521,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    }
  ]
}

### Quote SAM-2026-0045
- Status: new
- Date: Thu Mar 26 2026 17:12:56 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 3394 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jjh","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jjh","country":"FR","notes":""}
- Selections: {"gases":["a2l"],"zones":[{"id":"9d7d3d45-b003-4b02-92b4-8435de528aff","name":"Zone 1","type":"technique","gasId":"a2l","surface":30,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"f338aa81-0537-43cc-8800-412486c8d1fa","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 30,
      "height": 3,
      "volume": 90,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 3,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-17",
      "name": "Glaciär Midi SC HFC/HFO Group 2",
      "cat": "detector",
      "qty": 3,
      "price": 403,
      "total": 1209,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-440",
      "name": "FL-RL-R-SEP Flash+Sirène rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 150,
      "total": 150,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 3,
      "price": 114,
      "total": 342,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "accessory",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    }
  ],
  "grandTotal": 3394,
  "complianceNotes": [
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "cabling": {
    "totalLength": 85,
    "sensorCable": 25,
    "busCable": 35,
    "powerCable": 25,
    "notes": [
      "Bus RS485/Modbus : prévoir câble blindé 2×0.75mm²",
      "Câble capteur : 2×1mm² (max 500m par boucle)"
    ]
  },
  "alternatives": [
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 3,
      "bom": [
        {
          "ref": "31-220-17",
          "name": "Glaciär Midi SC HFC/HFO Group 2",
          "cat": "detector",
          "qty": 3,
          "price": 403,
          "total": 1209,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 3,
          "price": 150,
          "total": 450,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "60-120",
          "name": "SA200 Service tool",
          "cat": "accessory",
          "qty": 3,
          "price": 114,
          "total": 342,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "accessory",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2096,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    },
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 3,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 3,
          "price": 477,
          "total": 1431,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-300",
          "name": "MPU4C (4 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 1598,
          "total": 1598,
          "zones": "Système"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 1,
          "price": 150,
          "total": 150,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 3,
          "price": 114,
          "total": 342,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 3521,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    }
  ]
}

### Quote SAM-2026-0046
- Status: new
- Date: Thu Mar 26 2026 17:26:08 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 3704 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jjh","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jjh","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"9d7d3d45-b003-4b02-92b4-8435de528aff","name":"Zone 1","type":"chambre_froide","gasId":"a2l","surface":30,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"f338aa81-0537-43cc-8800-412486c8d1fa","name":"Zone 2","type":"publique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "chambre_froide",
      "surface": 30,
      "height": 3,
      "volume": 90,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "publique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 3,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-17",
      "name": "Glaciär Midi SC HFC/HFO Group 2",
      "cat": "detector",
      "qty": 3,
      "price": 403,
      "total": 1209,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-4021",
      "name": "BE-A 24V Flash orange",
      "cat": "alarm",
      "qty": 2,
      "price": 85,
      "total": 170,
      "zones": "Système"
    },
    {
      "ref": "40-4022",
      "name": "BE-R 24V Flash rouge",
      "cat": "alarm",
      "qty": 2,
      "price": 85,
      "total": 170,
      "zones": "Système"
    },
    {
      "ref": "40-410",
      "name": "1992-R-LP Sirène",
      "cat": "alarm",
      "qty": 1,
      "price": 120,
      "total": 120,
      "zones": "Système"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "alarm",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 3,
      "price": 114,
      "total": 342,
      "zones": "Zone 1, Zone 2"
    }
  ],
  "grandTotal": 3704,
  "complianceNotes": [
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "cabling": {
    "totalLength": 85,
    "sensorCable": 25,
    "busCable": 35,
    "powerCable": 25,
    "notes": [
      "Bus RS485/Modbus : prévoir câble blindé 2×0.75mm²",
      "Câble capteur : 2×1mm² (max 500m par boucle)"
    ]
  },
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 3,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 3,
          "price": 477,
          "total": 1431,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-300",
          "name": "MPU4C (4 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 1598,
          "total": 1598,
          "zones": "Système"
        },
        {
          "ref": "40-4021",
          "name": "BE-A 24V Flash orange",
          "cat": "alarm",
          "qty": 2,
          "price": 85,
          "total": 170,
          "zones": "Système"
        },
        {
          "ref": "40-4022",
          "name": "BE-R 24V Flash rouge",
          "cat": "alarm",
          "qty": 2,
          "price": 85,
          "total": 170,
          "zones": "Système"
        },
        {
          "ref": "40-410",
          "name": "1992-R-LP Sirène",
          "cat": "alarm",
          "qty": 1,
          "price": 120,
          "total": 120,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 3,
          "price": 114,
          "total": 342,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 3831,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 3,
      "bom": [
        {
          "ref": "31-220-17",
          "name": "Glaciär Midi SC HFC/HFO Group 2",
          "cat": "detector",
          "qty": 3,
          "price": 403,
          "total": 1209,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-4021",
          "name": "BE-A 24V Flash orange",
          "cat": "alarm",
          "qty": 2,
          "price": 85,
          "total": 170,
          "zones": "Système"
        },
        {
          "ref": "40-4022",
          "name": "BE-R 24V Flash rouge",
          "cat": "alarm",
          "qty": 2,
          "price": 85,
          "total": 170,
          "zones": "Système"
        },
        {
          "ref": "40-410",
          "name": "1992-R-LP Sirène",
          "cat": "alarm",
          "qty": 1,
          "price": 120,
          "total": 120,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "60-120",
          "name": "SA200 Service tool",
          "cat": "accessory",
          "qty": 3,
          "price": 114,
          "total": 342,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 2106,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ]
}

### Quote SAM-2026-0047
- Status: new
- Date: Thu Mar 26 2026 17:27:07 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4797 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"jjh","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"jjh","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"9d7d3d45-b003-4b02-92b4-8435de528aff","name":"Zone 1","type":"chambre_froide","gasId":"a2l","surface":30,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"f338aa81-0537-43cc-8800-412486c8d1fa","name":"Zone 2","type":"publique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"3e54cad4-c285-448c-900d-421f01fa3956","name":"Zone 3","type":"publique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"permanent","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "chambre_froide",
      "surface": 30,
      "height": 3,
      "volume": 90,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    },
    {
      "name": "Zone 2",
      "type": "publique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "a2l",
        "nameFr": "HFC/HFO A2L",
        "nameEn": "HFC/HFO A2L",
        "code": "R32/R454B/R454C",
        "safetyClass": "A2L",
        "coverage": 40,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + ignition cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure ignition",
          "a3En": "—",
          "a3Fr": "—",
          "s1": "25% LFL",
          "s2": "50% LFL",
          "s3": "—"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "32",
          "454A",
          "454B",
          "454C",
          "455A",
          "452B",
          "1234yf",
          "1234ze"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc2",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 40,
        "nBase": 2,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    },
    {
      "name": "Zone 3",
      "type": "publique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "permanent",
      "atex": false,
      "atexRequired": false,
      "product": {
        "det": "midi-hfc1",
        "needsSensor": false
      },
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE BASIQUE",
  "bom": [
    {
      "ref": "31-220-17",
      "name": "Glaciär Midi SC HFC/HFO Group 2",
      "cat": "detector",
      "qty": 3,
      "price": 403,
      "total": 1209,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "31-220-12",
      "name": "Glaciär Midi SC HFC/HFO Group 1",
      "cat": "detector",
      "qty": 1,
      "price": 403,
      "total": 403,
      "zones": "Zone 3"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "40-4021",
      "name": "BE-A 24V Flash orange",
      "cat": "alarm",
      "qty": 3,
      "price": 85,
      "total": 255,
      "zones": "Système"
    },
    {
      "ref": "40-4022",
      "name": "BE-R 24V Flash rouge",
      "cat": "alarm",
      "qty": 3,
      "price": 85,
      "total": 255,
      "zones": "Système"
    },
    {
      "ref": "40-410",
      "name": "1992-R-LP Sirène",
      "cat": "alarm",
      "qty": 1,
      "price": 120,
      "total": 120,
      "zones": "Système"
    },
    {
      "ref": "61-9040",
      "name": "Glaciär Midi Calibration Kit",
      "cat": "alarm",
      "qty": 1,
      "price": 95,
      "total": 95,
      "zones": "Système"
    },
    {
      "ref": "60-120",
      "name": "SA200 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 1, Zone 2, Zone 3"
    }
  ],
  "grandTotal": 4797,
  "complianceNotes": [
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "cabling": {
    "totalLength": 115,
    "sensorCable": 35,
    "busCable": 50,
    "powerCable": 30,
    "notes": [
      "Bus RS485/Modbus : prévoir câble blindé 2×0.75mm²",
      "Câble capteur : 2×1mm² (max 500m par boucle)"
    ]
  },
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2, Zone 3"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "40-4021",
          "name": "BE-A 24V Flash orange",
          "cat": "alarm",
          "qty": 3,
          "price": 85,
          "total": 255,
          "zones": "Système"
        },
        {
          "ref": "40-4022",
          "name": "BE-R 24V Flash rouge",
          "cat": "alarm",
          "qty": 3,
          "price": 85,
          "total": 255,
          "zones": "Système"
        },
        {
          "ref": "40-410",
          "name": "1992-R-LP Sirène",
          "cat": "alarm",
          "qty": 1,
          "price": 120,
          "total": 120,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 4,
          "price": 114,
          "total": 456,
          "zones": "Zone 1, Zone 2, Zone 3"
        }
      ],
      "grandTotal": 4998,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-17",
          "name": "Glaciär Midi SC HFC/HFO Group 2",
          "cat": "detector",
          "qty": 3,
          "price": 403,
          "total": 1209,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 1,
          "price": 403,
          "total": 403,
          "zones": "Zone 3"
        },
        {
          "ref": "40-4021",
          "name": "BE-A 24V Flash orange",
          "cat": "alarm",
          "qty": 3,
          "price": 85,
          "total": 255,
          "zones": "Système"
        },
        {
          "ref": "40-4022",
          "name": "BE-R 24V Flash rouge",
          "cat": "alarm",
          "qty": 3,
          "price": 85,
          "total": 255,
          "zones": "Système"
        },
        {
          "ref": "40-410",
          "name": "1992-R-LP Sirène",
          "cat": "alarm",
          "qty": 1,
          "price": 120,
          "total": 120,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "60-120",
          "name": "SA200 Service tool",
          "cat": "accessory",
          "qty": 4,
          "price": 114,
          "total": 456,
          "zones": "Zone 1, Zone 2, Zone 3"
        }
      ],
      "grandTotal": 2793,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ]
}

### Quote SAM-2026-0048
- Status: new
- Date: Thu Mar 26 2026 18:21:12 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 3070 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"sqs","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"sqs","country":"FR","notes":""}
- Selections: {"gases":["hfc1"],"zones":[{"id":"fd8d7acc-98ea-4834-86a8-da18a17582a7","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":34,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": {
          "charge": 34,
          "volume": 150,
          "concentration": 0.22666666666666666,
          "pl": 0.25,
          "atel": 0.21,
          "lfl": "NF",
          "exceedsPL": false,
          "exceedsATEL": true,
          "riskLevel": "critical"
        },
        "warnings": [
          "⚠️ CRITIQUE : concentration 226.7 g/m³ dépasse l'ATEL (210.0 g/m³) — ventilation d'urgence et détection renforcée obligatoires (EN 378-1 §5.3)",
          "Charge > PL : facteur détection ×2 (EN 378-3 §6.4)"
        ]
      }
    }
  ],
  "totalDets": 2,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "38-220",
      "name": "MP-D-HFC-4000",
      "cat": "detector",
      "qty": 2,
      "price": 477,
      "total": 954,
      "zones": "Zone 1"
    },
    {
      "ref": "20-300",
      "name": "MPU4C (4 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1598,
      "total": 1598,
      "zones": "Système"
    },
    {
      "ref": "40-4021",
      "name": "BE-A 24V Flash orange",
      "cat": "alarm",
      "qty": 1,
      "price": 85,
      "total": 85,
      "zones": "Système"
    },
    {
      "ref": "40-4022",
      "name": "BE-R 24V Flash rouge",
      "cat": "alarm",
      "qty": 1,
      "price": 85,
      "total": 85,
      "zones": "Système"
    },
    {
      "ref": "40-410",
      "name": "1992-R-LP Sirène",
      "cat": "alarm",
      "qty": 1,
      "price": 120,
      "total": 120,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 2,
      "price": 114,
      "total": 228,
      "zones": "Zone 1"
    }
  ],
  "grandTotal": 3070,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 2,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 2,
          "price": 477,
          "total": 954,
          "zones": "Zone 1"
        },
        {
          "ref": "20-300",
          "name": "MPU4C (4 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 1598,
          "total": 1598,
          "zones": "Système"
        },
        {
          "ref": "40-4021",
          "name": "BE-A 24V Flash orange",
          "cat": "alarm",
          "qty": 1,
          "price": 85,
          "total": 85,
          "zones": "Système"
        },
        {
          "ref": "40-4022",
          "name": "BE-R 24V Flash rouge",
          "cat": "alarm",
          "qty": 1,
          "price": 85,
          "total": 85,
          "zones": "Système"
        },
        {
          "ref": "40-410",
          "name": "1992-R-LP Sirène",
          "cat": "alarm",
          "qty": 1,
          "price": 120,
          "total": 120,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 2,
          "price": 114,
          "total": 228,
          "zones": "Zone 1"
        }
      ],
      "grandTotal": 3070,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 2,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 2,
          "price": 403,
          "total": 806,
          "zones": "Zone 1"
        },
        {
          "ref": "40-4021",
          "name": "BE-A 24V Flash orange",
          "cat": "alarm",
          "qty": 1,
          "price": 85,
          "total": 85,
          "zones": "Système"
        },
        {
          "ref": "40-4022",
          "name": "BE-R 24V Flash rouge",
          "cat": "alarm",
          "qty": 1,
          "price": 85,
          "total": 85,
          "zones": "Système"
        },
        {
          "ref": "40-410",
          "name": "1992-R-LP Sirène",
          "cat": "alarm",
          "qty": 1,
          "price": 120,
          "total": 120,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "60-120",
          "name": "SA200 Service tool",
          "cat": "accessory",
          "qty": 2,
          "price": 114,
          "total": 228,
          "zones": "Zone 1"
        }
      ],
      "grandTotal": 1419,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: ⚠️ CRITIQUE : concentration 226.7 g/m³ dépasse l'ATEL (210.0 g/m³) — ventilation d'urgence et détection renforcée obligatoires (EN 378-1 §5.3)",
    "Zone 1: Charge > PL : facteur détection ×2 (EN 378-3 §6.4)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 2,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 2,
          "price": 477,
          "total": 954,
          "zones": "Zone 1"
        },
        {
          "ref": "20-300",
          "name": "MPU4C (4 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 1598,
          "total": 1598,
          "zones": "Système"
        },
        {
          "ref": "40-4021",
          "name": "BE-A 24V Flash orange",
          "cat": "alarm",
          "qty": 1,
          "price": 85,
          "total": 85,
          "zones": "Système"
        },
        {
          "ref": "40-4022",
          "name": "BE-R 24V Flash rouge",
          "cat": "alarm",
          "qty": 1,
          "price": 85,
          "total": 85,
          "zones": "Système"
        },
        {
          "ref": "40-410",
          "name": "1992-R-LP Sirène",
          "cat": "alarm",
          "qty": 1,
          "price": 120,
          "total": 120,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 2,
          "price": 114,
          "total": 228,
          "zones": "Zone 1"
        }
      ],
      "grandTotal": 3070,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 2,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 2,
          "price": 403,
          "total": 806,
          "zones": "Zone 1"
        },
        {
          "ref": "40-4021",
          "name": "BE-A 24V Flash orange",
          "cat": "alarm",
          "qty": 1,
          "price": 85,
          "total": 85,
          "zones": "Système"
        },
        {
          "ref": "40-4022",
          "name": "BE-R 24V Flash rouge",
          "cat": "alarm",
          "qty": 1,
          "price": 85,
          "total": 85,
          "zones": "Système"
        },
        {
          "ref": "40-410",
          "name": "1992-R-LP Sirène",
          "cat": "alarm",
          "qty": 1,
          "price": 120,
          "total": 120,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "60-120",
          "name": "SA200 Service tool",
          "cat": "accessory",
          "qty": 2,
          "price": 114,
          "total": 228,
          "zones": "Zone 1"
        }
      ],
      "grandTotal": 1419,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0049
- Status: new
- Date: Thu Mar 26 2026 18:24:55 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 1759 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"dsds","country":"FR","charge":"","notes":"sds","rgpdConsent":true}
- Project: {"name":"dsds","country":"FR","notes":"sds"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"36bbda46-a692-4d2b-aff1-c6e0167823a0","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 1,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": []
      }
    }
  ],
  "totalDets": 1,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "38-220",
      "name": "MP-D-HFC-4000",
      "cat": "detector",
      "qty": 1,
      "price": 477,
      "total": 477,
      "zones": "Zone 1"
    },
    {
      "ref": "20-310",
      "name": "MPU2C (2 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 1168,
      "total": 1168,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Zone 1"
    }
  ],
  "grandTotal": 1759,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 1,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 1,
          "price": 477,
          "total": 477,
          "zones": "Zone 1"
        },
        {
          "ref": "20-310",
          "name": "MPU2C (2 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 1168,
          "total": 1168,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Zone 1"
        }
      ],
      "grandTotal": 1759,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 1,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 1,
          "price": 403,
          "total": 403,
          "zones": "Zone 1"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 1,
          "price": 150,
          "total": 150,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "60-120",
          "name": "SA200 Service tool",
          "cat": "accessory",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Zone 1"
        }
      ],
      "grandTotal": 762,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 1,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 1,
          "price": 477,
          "total": 477,
          "zones": "Zone 1"
        },
        {
          "ref": "20-310",
          "name": "MPU2C (2 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 1168,
          "total": 1168,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Zone 1"
        }
      ],
      "grandTotal": 1759,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 1,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 1,
          "price": 403,
          "total": 403,
          "zones": "Zone 1"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 1,
          "price": 150,
          "total": 150,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "60-120",
          "name": "SA200 Service tool",
          "cat": "accessory",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Zone 1"
        }
      ],
      "grandTotal": 762,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0050
- Status: new
- Date: Thu Mar 26 2026 18:26:54 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4368 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"df","country":"FR","charge":"","notes":"dfdf","rgpdConsent":true}
- Project: {"name":"df","country":"FR","notes":"dfdf"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"afcae301-33a9-4d06-880d-3f724813fbd0","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"af08a8e8-6097-41e6-9421-09292585ff73","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "38-220",
      "name": "MP-D-HFC-4000",
      "cat": "detector",
      "qty": 4,
      "price": 477,
      "total": 1908,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "accessory",
      "qty": 4,
      "price": 114,
      "total": 456,
      "zones": "Zone 1, Zone 2"
    }
  ],
  "grandTotal": 4368,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 4,
          "price": 114,
          "total": 456,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 4368,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "accessory",
          "qty": 4,
          "price": 114,
          "total": 456,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 4368,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0051
- Status: new
- Date: Thu Mar 26 2026 18:29:13 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4482 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"sdsd","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"dsd","country":"FR","charge":"","notes":"sdsd","rgpdConsent":true}
- Project: {"name":"dsd","country":"FR","notes":"sdsd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"8b7dc6d2-754f-4be0-9615-a55e7662a731","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"95352911-7db9-4888-8bcb-16b45c2a0c5a","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "38-220",
      "name": "MP-D-HFC-4000",
      "cat": "detector",
      "qty": 4,
      "price": 477,
      "total": 1908,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "alarm",
      "qty": 5,
      "price": 114,
      "total": 570,
      "zones": "Système, Zone 1, Zone 2"
    }
  ],
  "grandTotal": 4482,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 5,
          "price": 114,
          "total": 570,
          "zones": "Système, Zone 1, Zone 2"
        }
      ],
      "grandTotal": 4482,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 5,
          "price": 114,
          "total": 570,
          "zones": "Système, Zone 1, Zone 2"
        }
      ],
      "grandTotal": 4482,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0052
- Status: new
- Date: Thu Mar 26 2026 18:30:19 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4026 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"sdsd","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"dsd","country":"FR","charge":"","notes":"sdsd","rgpdConsent":true}
- Project: {"name":"dsd","country":"FR","notes":"sdsd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"8b7dc6d2-754f-4be0-9615-a55e7662a731","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"95352911-7db9-4888-8bcb-16b45c2a0c5a","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "38-220",
      "name": "MP-D-HFC-4000",
      "cat": "detector",
      "qty": 4,
      "price": 477,
      "total": 1908,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "alarm",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Système"
    }
  ],
  "grandTotal": 4026,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4026,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4026,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0053
- Status: new
- Date: Thu Mar 26 2026 18:30:25 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4026 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"sdsd","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"dsd","country":"FR","charge":"","notes":"sdsd","rgpdConsent":true}
- Project: {"name":"dsd","country":"FR","notes":"sdsd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"8b7dc6d2-754f-4be0-9615-a55e7662a731","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"95352911-7db9-4888-8bcb-16b45c2a0c5a","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "38-220",
      "name": "MP-D-HFC-4000",
      "cat": "detector",
      "qty": 4,
      "price": 477,
      "total": 1908,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "alarm",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Système"
    }
  ],
  "grandTotal": 4026,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4026,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4026,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0054
- Status: new
- Date: Thu Mar 26 2026 18:30:43 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4026 €
- Client: {"firstName":"33","lastName":"VINCENT","company":"sdsd","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"dsd","country":"FR","charge":"","notes":"sdsd","rgpdConsent":true}
- Project: {"name":"dsd","country":"FR","notes":"sdsd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"8b7dc6d2-754f-4be0-9615-a55e7662a731","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"95352911-7db9-4888-8bcb-16b45c2a0c5a","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "38-220",
      "name": "MP-D-HFC-4000",
      "cat": "detector",
      "qty": 4,
      "price": 477,
      "total": 1908,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "alarm",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Système"
    }
  ],
  "grandTotal": 4026,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4026,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4026,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0055
- Status: new
- Date: Thu Mar 26 2026 18:35:10 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 11484 €
- Client: {"firstName":"MARWAN","lastName":"CHAMOUN","company":"Le Grand Liban","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"dffd","country":"FR","charge":"","notes":"fddfd","rgpdConsent":true}
- Project: {"name":"dffd","country":"FR","notes":"fddfd"}
- Selections: {"gases":["r290"],"zones":[{"id":"8b313f69-9378-42bd-8e8b-a8f6d4db1330","name":"Zone 1","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"8d00a16b-4ee6-4340-bf56-6c0e5dfe178e","name":"Zone 2","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 3,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 20,
        "nBase": 3,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 3,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 20,
        "nBase": 3,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 6,
  "arch": "reinforced",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 6,
      "price": 1914,
      "total": 11484,
      "zones": "Zone 1, Zone 2"
    }
  ],
  "grandTotal": 11484,
  "proposals": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Zone ATEX requise pour A3 en local technique",
    "Zone 2: Zone ATEX requise pour A3 en local technique",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Normes A3/ATEX : EN 60079, ATEX Zone 2",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0056
- Status: new
- Date: Thu Mar 26 2026 18:35:22 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 11484 €
- Client: {"firstName":"MARWAN","lastName":"CHAMOUN","company":"Le Grand Liban","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"dffd","country":"FR","charge":"","notes":"fddfd","rgpdConsent":true}
- Project: {"name":"dffd","country":"FR","notes":"fddfd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"8b313f69-9378-42bd-8e8b-a8f6d4db1330","name":"Zone 1","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"8d00a16b-4ee6-4340-bf56-6c0e5dfe178e","name":"Zone 2","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 3,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 20,
        "nBase": 3,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 3,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 20,
        "nBase": 3,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 6,
  "arch": "reinforced",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 6,
      "price": 1914,
      "total": 11484,
      "zones": "Zone 1, Zone 2"
    }
  ],
  "grandTotal": 11484,
  "proposals": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Zone ATEX requise pour A3 en local technique",
    "Zone 2: Zone ATEX requise pour A3 en local technique",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Normes A3/ATEX : EN 60079, ATEX Zone 2",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0057
- Status: new
- Date: Thu Mar 26 2026 18:35:32 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 11484 €
- Client: {"firstName":"MARWAN","lastName":"CHAMOUN","company":"Le Grand Liban","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"dffd","country":"FR","charge":"","notes":"fddfd","rgpdConsent":true}
- Project: {"name":"dffd","country":"FR","notes":"fddfd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"8b313f69-9378-42bd-8e8b-a8f6d4db1330","name":"Zone 1","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"8d00a16b-4ee6-4340-bf56-6c0e5dfe178e","name":"Zone 2","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 3,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 20,
        "nBase": 3,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 3,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 20,
        "nBase": 3,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 6,
  "arch": "reinforced",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 6,
      "price": 1914,
      "total": 11484,
      "zones": "Zone 1, Zone 2"
    }
  ],
  "grandTotal": 11484,
  "proposals": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Zone ATEX requise pour A3 en local technique",
    "Zone 2: Zone ATEX requise pour A3 en local technique",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Normes A3/ATEX : EN 60079, ATEX Zone 2",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0058
- Status: new
- Date: Thu Mar 26 2026 18:35:46 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 11484 €
- Client: {"firstName":"MARWAN","lastName":"CHAMOUN","company":"Le Grand Liban","email":"marwanchamoun@hotmail.com","phone":"+33663837577","projectName":"dffd","country":"FR","charge":"","notes":"fddfd","rgpdConsent":true}
- Project: {"name":"dffd","country":"FR","notes":"fddfd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"8b313f69-9378-42bd-8e8b-a8f6d4db1330","name":"Zone 1","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"8d00a16b-4ee6-4340-bf56-6c0e5dfe178e","name":"Zone 2","type":"technique","gasId":"r290","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 3,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 20,
        "nBase": 3,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "r290",
        "nameFr": "R290 Propane / Inflammables",
        "nameEn": "R290 Propane / Flammable",
        "code": "R290",
        "safetyClass": "A3",
        "coverage": 20,
        "density": "heavy",
        "icon": "",
        "alarms": {
          "a1En": "Orange flash",
          "a1Fr": "Flash orange",
          "a2En": "Red flash + siren + ventilation + elec. cutoff",
          "a2Fr": "Flash rouge + sirène + ventilation + coupure élec.",
          "a3En": "Evacuation",
          "a3Fr": "Évacuation",
          "s1": "10% LFL",
          "s2": "25% LFL",
          "s3": "50% LFL"
        },
        "lifeEn": "~5 years",
        "lifeFr": "~5 ans",
        "mountEn": "Low — ~20cm above floor",
        "mountFr": "Bas — ~20cm du sol",
        "refs": [
          "290",
          "600a"
        ],
        "techEn": "Semiconductor (MOS)",
        "techFr": "Semi-conducteur (MOS)"
      },
      "detectors": 3,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": true,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 20,
        "nBase": 3,
        "nMin": 1,
        "redundancyRequired": false,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Zone ATEX requise pour A3 en local technique"
        ]
      }
    }
  ],
  "totalDets": 6,
  "arch": "reinforced",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "35-302",
      "name": "GEX-SC-Propane (ATEX Zone 1)",
      "cat": "detector",
      "qty": 6,
      "price": 1914,
      "total": 11484,
      "zones": "Zone 1, Zone 2"
    }
  ],
  "grandTotal": 11484,
  "proposals": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Zone ATEX requise pour A3 en local technique",
    "Zone 2: Zone ATEX requise pour A3 en local technique",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Normes A3/ATEX : EN 60079, ATEX Zone 2",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "35-302",
          "name": "GEX-SC-Propane (ATEX Zone 1)",
          "cat": "detector",
          "qty": 6,
          "price": 1914,
          "total": 11484,
          "zones": "Zone 1, Zone 2"
        }
      ],
      "grandTotal": 11484,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0059
- Status: new
- Date: Thu Mar 26 2026 18:36:01 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4026 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"ddd","country":"FR","charge":"","notes":"dd","rgpdConsent":true}
- Project: {"name":"ddd","country":"FR","notes":"dd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"5b116cdd-aec7-4dfe-897c-e4d8a5fb42c9","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"349dc712-26e0-472a-9ff4-e79b9f356efc","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "38-220",
      "name": "MP-D-HFC-4000",
      "cat": "detector",
      "qty": 4,
      "price": 477,
      "total": 1908,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "alarm",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Système"
    }
  ],
  "grandTotal": 4026,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4026,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4026,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 2307,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0060
- Status: new
- Date: Thu Mar 26 2026 18:36:12 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 5286 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"ddd","country":"FR","charge":"","notes":"dd","rgpdConsent":true}
- Project: {"name":"ddd","country":"FR","notes":"dd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"5b116cdd-aec7-4dfe-897c-e4d8a5fb42c9","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"349dc712-26e0-472a-9ff4-e79b9f356efc","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "37-420",
      "name": "GS24-HFC-4000",
      "cat": "detector",
      "qty": 4,
      "price": 792,
      "total": 3168,
      "zones": "Zone 1, Zone 2"
    },
    {
      "ref": "20-305",
      "name": "MPU6C (6 channels)",
      "cat": "controller",
      "qty": 1,
      "price": 2004,
      "total": 2004,
      "zones": "Système"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "alarm",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Système"
    }
  ],
  "grandTotal": 5286,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 792,
          "total": 3168,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 5286,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 4,
          "price": 99,
          "total": 396,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 4,
          "price": 100,
          "total": 400,
          "zones": "Système"
        }
      ],
      "grandTotal": 3103,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 792,
          "total": 3168,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 5286,
      "description": "Contrôleur central + capteurs déportés — supervision Modbus, historique alarmes, maintenance centralisée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 4,
          "price": 99,
          "total": 396,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 4,
          "price": 100,
          "total": 400,
          "zones": "Système"
        }
      ],
      "grandTotal": 3103,
      "description": "Détecteurs autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0061
- Status: new
- Date: Thu Mar 26 2026 18:56:50 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4866 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"ddd","country":"FR","charge":"","notes":"dd","rgpdConsent":true}
- Project: {"name":"ddd","country":"FR","notes":"dd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"5b116cdd-aec7-4dfe-897c-e4d8a5fb42c9","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"349dc712-26e0-472a-9ff4-e79b9f356efc","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"e7495a4e-c810-4bc8-a3ae-5ab3c6fb08e0","name":"Zone 3","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 3",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 6,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "37-420",
      "name": "GS24-HFC-4000",
      "cat": "detector",
      "qty": 6,
      "price": 792,
      "total": 4752,
      "zones": "Zone 1, Zone 2, Zone 3"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "alarm",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Système"
    }
  ],
  "grandTotal": 4866,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 6,
          "price": 792,
          "total": 4752,
          "zones": "Zone 1, Zone 2, Zone 3"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4866,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 6,
          "price": 403,
          "total": 2418,
          "zones": "Zone 1, Zone 2, Zone 3"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 6,
          "price": 150,
          "total": 900,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 6,
          "price": 99,
          "total": 594,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 6,
          "price": 100,
          "total": 600,
          "zones": "Système"
        }
      ],
      "grandTotal": 4607,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 3: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 6,
          "price": 792,
          "total": 4752,
          "zones": "Zone 1, Zone 2, Zone 3"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4866,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 6,
          "price": 403,
          "total": 2418,
          "zones": "Zone 1, Zone 2, Zone 3"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 6,
          "price": 150,
          "total": 900,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 6,
          "price": 99,
          "total": 594,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 6,
          "price": 100,
          "total": 600,
          "zones": "Système"
        }
      ],
      "grandTotal": 4607,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0062
- Status: new
- Date: Thu Mar 26 2026 18:56:53 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4866 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"ddd","country":"FR","charge":"","notes":"dd","rgpdConsent":true}
- Project: {"name":"ddd","country":"FR","notes":"dd"}
- Selections: {"gases":["hfc1"],"zones":[{"id":"5b116cdd-aec7-4dfe-897c-e4d8a5fb42c9","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"349dc712-26e0-472a-9ff4-e79b9f356efc","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"e7495a4e-c810-4bc8-a3ae-5ab3c6fb08e0","name":"Zone 3","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "zones": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    },
    {
      "name": "Zone 3",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "gas": {
        "id": "hfc1",
        "nameFr": "HFC/HFO A1",
        "nameEn": "HFC/HFO A1",
        "code": "R410A/R407C/R507A",
        "safetyClass": "A1",
        "coverage": 50,
        "density": "heavy",
        "icon": "",
        "techFr": "Semi-conducteur (MOS)",
        "techEn": "Semiconductor (MOS)",
        "lifeFr": "~5 ans",
        "lifeEn": "~5 years",
        "mountFr": "Bas — ~20cm du sol",
        "mountEn": "Low — ~20cm above floor",
        "alarms": {
          "s1": "1,000 ppm",
          "a1Fr": "Flash orange",
          "a1En": "Orange flash",
          "s2": "4,000 ppm",
          "a2Fr": "Flash rouge + sirène + ventilation",
          "a2En": "Red flash + siren + ventilation",
          "s3": "—",
          "a3Fr": "—",
          "a3En": "—"
        },
        "refs": [
          "410A",
          "407F",
          "404A",
          "134a"
        ]
      },
      "detectors": 2,
      "ventilation": "mechanical",
      "occupation": "occasional",
      "atex": false,
      "atexRequired": false,
      "compliance": {
        "heightFactor": 1,
        "ventilationFactor": 1,
        "coverageArea": 50,
        "nBase": 1,
        "nMin": 2,
        "redundancyRequired": true,
        "detectorPosition": "LOW",
        "en378Limits": null,
        "warnings": [
          "Classe A1 : minimum 2 détecteurs (redondance EN 378)"
        ]
      }
    }
  ],
  "totalDets": 6,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "bom": [
    {
      "ref": "37-420",
      "name": "GS24-HFC-4000",
      "cat": "detector",
      "qty": 6,
      "price": 792,
      "total": 4752,
      "zones": "Zone 1, Zone 2, Zone 3"
    },
    {
      "ref": "60-130",
      "name": "DT 300 Service tool",
      "cat": "alarm",
      "qty": 1,
      "price": 114,
      "total": 114,
      "zones": "Système"
    }
  ],
  "grandTotal": 4866,
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 6,
          "price": 792,
          "total": 4752,
          "zones": "Zone 1, Zone 2, Zone 3"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4866,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 6,
          "price": 403,
          "total": 2418,
          "zones": "Zone 1, Zone 2, Zone 3"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 6,
          "price": 150,
          "total": 900,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 6,
          "price": 99,
          "total": 594,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 6,
          "price": 100,
          "total": 600,
          "zones": "Système"
        }
      ],
      "grandTotal": 4607,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 3: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "alternatives": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 6,
          "price": 792,
          "total": 4752,
          "zones": "Zone 1, Zone 2, Zone 3"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4866,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 6,
          "price": 403,
          "total": 2418,
          "zones": "Zone 1, Zone 2, Zone 3"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 6,
          "price": 150,
          "total": 900,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 6,
          "price": 99,
          "total": 594,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 6,
          "price": 100,
          "total": 600,
          "zones": "Système"
        }
      ],
      "grandTotal": 4607,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "cabling": null
}

### Quote SAM-2026-0063
- Status: new
- Date: Thu Mar 26 2026 19:00:38 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 5286 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"ddd","country":"FR","charge":"","notes":"dd","rgpdConsent":true}
- Project: {"name":"ddd","country":"FR","notes":"dd"}
- Selections: {"application":"machine-room","gases":["hfc1"],"refrigerant":{"id":"404A","name":"R-404A — R-404A (R-125/143a/134a)"},"techPrefs":{"voltage":"230VAC","ip":"","communication":"","atex":false,"outdoor":false,"redundancy":true},"zones":[{"id":"5b116cdd-aec7-4dfe-897c-e4d8a5fb42c9","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"349dc712-26e0-472a-9ff4-e79b9f356efc","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 792,
          "total": 3168,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 5286,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 4,
          "price": 99,
          "total": 396,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 4,
          "price": 100,
          "total": 400,
          "zones": "Système"
        }
      ],
      "grandTotal": 3103,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "zoneSizing": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": null
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": null
    }
  ]
}

### Quote SAM-2026-0064
- Status: new
- Date: Thu Mar 26 2026 19:02:22 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 5286 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"fdd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"fdd","country":"FR","notes":""}
- Selections: {"application":"machine-room","gases":["hfc1"],"refrigerant":{"id":"410A","name":"R-410A — R-410A (R-32/125)"},"techPrefs":{"voltage":"230VAC","ip":"","communication":"","atex":false,"outdoor":false,"redundancy":true},"zones":[{"id":"0dba531b-badf-4232-a26a-ac5f3e310836","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"10fd4496-bd10-4144-b4ce-9f2c3d85b509","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 792,
          "total": 3168,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 5286,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 4,
          "price": 99,
          "total": 396,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 4,
          "price": 100,
          "total": 400,
          "zones": "Système"
        }
      ],
      "grandTotal": 3103,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "zoneSizing": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": null
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": null
    }
  ]
}

### Quote SAM-2026-0065
- Status: new
- Date: Thu Mar 26 2026 19:05:28 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 5286 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"fdd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"fdd","country":"FR","notes":""}
- Selections: {"application":"machine-room","gases":["hfc1"],"refrigerant":{"id":"410A","name":"R-410A — R-410A (R-32/125)"},"techPrefs":{"voltage":"230VAC","ip":"","communication":"","atex":false,"outdoor":false,"redundancy":true},"zones":[{"id":"0dba531b-badf-4232-a26a-ac5f3e310836","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":20,"evaporators":1},{"id":"10fd4496-bd10-4144-b4ce-9f2c3d85b509","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":30,"evaporators":1}]}
- Results: {
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 792,
          "total": 3168,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 5286,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 4,
          "price": 99,
          "total": 396,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 4,
          "price": 100,
          "total": 400,
          "zones": "Système"
        }
      ],
      "grandTotal": 3103,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "zoneSizing": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": {
        "charge": 20,
        "volume": 150,
        "concentration": 0.13333333333333333,
        "pl": 0.44,
        "atel": 0.42,
        "lfl": "NF",
        "exceedsPL": false,
        "exceedsATEL": false,
        "riskLevel": "low"
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": {
        "charge": 30,
        "volume": 150,
        "concentration": 0.2,
        "pl": 0.44,
        "atel": 0.42,
        "lfl": "NF",
        "exceedsPL": false,
        "exceedsATEL": false,
        "riskLevel": "low"
      }
    }
  ]
}

### Quote SAM-2026-0066
- Status: new
- Date: Thu Mar 26 2026 19:05:33 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 5286 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"fdd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"fdd","country":"FR","notes":""}
- Selections: {"application":"machine-room","gases":["hfc1"],"refrigerant":{"id":"410A","name":"R-410A — R-410A (R-32/125)"},"techPrefs":{"voltage":"230VAC","ip":"","communication":"","atex":false,"outdoor":false,"redundancy":true},"zones":[{"id":"0dba531b-badf-4232-a26a-ac5f3e310836","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":20,"evaporators":1},{"id":"10fd4496-bd10-4144-b4ce-9f2c3d85b509","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":30,"evaporators":1}]}
- Results: {
  "totalDets": 4,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 4,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 792,
          "total": 3168,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "20-305",
          "name": "MPU6C (6 channels)",
          "cat": "controller",
          "qty": 1,
          "price": 2004,
          "total": 2004,
          "zones": "Système"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 5286,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 4,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 4,
          "price": 403,
          "total": 1612,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 4,
          "price": 150,
          "total": 600,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 4,
          "price": 99,
          "total": 396,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 4,
          "price": 100,
          "total": 400,
          "zones": "Système"
        }
      ],
      "grandTotal": 3103,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "zoneSizing": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": {
        "charge": 20,
        "volume": 150,
        "concentration": 0.13333333333333333,
        "pl": 0.44,
        "atel": 0.42,
        "lfl": "NF",
        "exceedsPL": false,
        "exceedsATEL": false,
        "riskLevel": "low"
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": {
        "charge": 30,
        "volume": 150,
        "concentration": 0.2,
        "pl": 0.44,
        "atel": 0.42,
        "lfl": "NF",
        "exceedsPL": false,
        "exceedsATEL": false,
        "riskLevel": "low"
      }
    }
  ]
}

### Quote SAM-2026-0067
- Status: new
- Date: Thu Mar 26 2026 19:05:39 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4866 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"fdd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"fdd","country":"FR","notes":""}
- Selections: {"application":"machine-room","gases":["hfc1"],"refrigerant":{"id":"410A","name":"R-410A — R-410A (R-32/125)"},"techPrefs":{"voltage":"230VAC","ip":"","communication":"","atex":false,"outdoor":false,"redundancy":true},"zones":[{"id":"0dba531b-badf-4232-a26a-ac5f3e310836","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":209,"evaporators":1},{"id":"10fd4496-bd10-4144-b4ce-9f2c3d85b509","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":30,"evaporators":1}]}
- Results: {
  "totalDets": 6,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Zone 1: ⚠️ CRITIQUE : concentration 1393.3 g/m³ dépasse l'ATEL (420.0 g/m³) — ventilation d'urgence et détection renforcée obligatoires (EN 378-1 §5.3)",
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 1: Charge > PL : facteur détection ×2 (EN 378-3 §6.4)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 6,
          "price": 792,
          "total": 4752,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4866,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1"
        },
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 2,
          "price": 403,
          "total": 806,
          "zones": "Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 6,
          "price": 150,
          "total": 900,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 6,
          "price": 99,
          "total": 594,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 6,
          "price": 100,
          "total": 600,
          "zones": "Système"
        }
      ],
      "grandTotal": 4903,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "zoneSizing": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 4,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": {
        "charge": 209,
        "volume": 150,
        "concentration": 1.3933333333333333,
        "pl": 0.44,
        "atel": 0.42,
        "lfl": "NF",
        "exceedsPL": true,
        "exceedsATEL": true,
        "riskLevel": "critical"
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": {
        "charge": 30,
        "volume": 150,
        "concentration": 0.2,
        "pl": 0.44,
        "atel": 0.42,
        "lfl": "NF",
        "exceedsPL": false,
        "exceedsATEL": false,
        "riskLevel": "low"
      }
    }
  ]
}

### Quote SAM-2026-0068
- Status: new
- Date: Thu Mar 26 2026 19:06:25 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 4866 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"fdd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"fdd","country":"FR","notes":""}
- Selections: {"application":"machine-room","gases":["hfc1"],"refrigerant":{"id":"410A","name":"R-410A — R-410A (R-32/125)"},"techPrefs":{"voltage":"230VAC","ip":"","communication":"","atex":false,"outdoor":false,"redundancy":true},"zones":[{"id":"0dba531b-badf-4232-a26a-ac5f3e310836","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":209,"evaporators":1},{"id":"10fd4496-bd10-4144-b4ce-9f2c3d85b509","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":30,"evaporators":1}]}
- Results: {
  "totalDets": 6,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Zone 1: ⚠️ CRITIQUE : concentration 1393.3 g/m³ dépasse l'ATEL (420.0 g/m³) — ventilation d'urgence et détection renforcée obligatoires (EN 378-1 §5.3)",
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 1: Charge > PL : facteur détection ×2 (EN 378-3 §6.4)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 6,
          "price": 792,
          "total": 4752,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 4866,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 4,
          "price": 477,
          "total": 1908,
          "zones": "Zone 1"
        },
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 2,
          "price": 403,
          "total": 806,
          "zones": "Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 6,
          "price": 150,
          "total": 900,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 6,
          "price": 99,
          "total": 594,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 6,
          "price": 100,
          "total": 600,
          "zones": "Système"
        }
      ],
      "grandTotal": 4903,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "zoneSizing": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 4,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": {
        "charge": 209,
        "volume": 150,
        "concentration": 1.3933333333333333,
        "pl": 0.44,
        "atel": 0.42,
        "lfl": "NF",
        "exceedsPL": true,
        "exceedsATEL": true,
        "riskLevel": "critical"
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": {
        "charge": 30,
        "volume": 150,
        "concentration": 0.2,
        "pl": 0.44,
        "atel": 0.42,
        "lfl": "NF",
        "exceedsPL": false,
        "exceedsATEL": false,
        "riskLevel": "low"
      }
    }
  ]
}

### Quote SAM-2026-0069
- Status: new
- Date: Thu Mar 26 2026 21:18:12 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 6450 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"CXXXX","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"pardieu","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"pardieu","country":"FR","notes":""}
- Selections: {"application":"machine-room","gases":["a2l"],"refrigerant":{"id":"1234yf","name":"R-1234yf — HFO-1234yf"},"techPrefs":{"voltage":"230VAC","ip":"","communication":"analog_420,modbus","atex":true,"outdoor":false,"redundancy":true},"zones":[{"id":"b5160831-e702-4048-999d-2d528e99b28d","name":"Zone 1","type":"chambre_froide","gasId":"a2l","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":40,"evaporators":1},{"id":"928a654e-afbb-4d4a-b8af-73335c45baea","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":true,"charge":0,"evaporators":1}]}
- Results: {
  "totalDets": 8,
  "arch": "reinforced",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Zone 1: ⚠️ Charge élevée : concentration 266.7 g/m³ dépasse le PL (58.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
    "Zone 1: Aucune ventilation : facteur ×2",
    "Zone 1: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 1: Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)",
    "Zone 2: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 8,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 8,
          "price": 792,
          "total": 6336,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 6450,
      "description": "Contrôleur Modbus + capteurs déportés — supervision réseau, historique alarmes"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 8,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 6,
          "price": 477,
          "total": 2862,
          "zones": "Zone 1"
        },
        {
          "ref": "35-301",
          "name": "GEX-SC-HFC-4000 (ATEX Zone 1)",
          "cat": "detector",
          "qty": 2,
          "price": 1914,
          "total": 3828,
          "zones": "Zone 2"
        }
      ],
      "grandTotal": 6690,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "zoneSizing": [
    {
      "name": "Zone 1",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 6,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": {
        "charge": 40,
        "volume": 150,
        "concentration": 0.26666666666666666,
        "pl": 0.058,
        "atel": 0.47,
        "lfl": 0.289,
        "exceedsPL": true,
        "exceedsATEL": false,
        "riskLevel": "high"
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": true,
      "coverage": 40,
      "position": "LOW",
      "en378": null
    }
  ],
  "printedAt": "2026-03-26T20:18:59.195Z"
}

### Quote SAM-2026-0070
- Status: new
- Date: Fri Mar 27 2026 00:20:57 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 6450 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"CXXXX","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"pardieu","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"pardieu","country":"FR","notes":""}
- Selections: {"application":"machine-room","gases":["a2l"],"refrigerant":{"id":"1234yf","name":"R-1234yf — HFO-1234yf"},"techPrefs":{"voltage":"230VAC","ip":"","communication":"analog_420,modbus","atex":true,"outdoor":false,"redundancy":true},"zones":[{"id":"b5160831-e702-4048-999d-2d528e99b28d","name":"Zone 1","type":"chambre_froide","gasId":"a2l","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":40,"evaporators":1},{"id":"928a654e-afbb-4d4a-b8af-73335c45baea","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "totalDets": 8,
  "arch": "reinforced",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Zone 1: ⚠️ Charge élevée : concentration 266.7 g/m³ dépasse le PL (58.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
    "Zone 1: Aucune ventilation : facteur ×2",
    "Zone 1: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 1: Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)",
    "Zone 2: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 8,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 8,
          "price": 792,
          "total": 6336,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 6450,
      "description": "Contrôleur Modbus + capteurs déportés — supervision réseau, historique alarmes"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 8,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 6,
          "price": 477,
          "total": 2862,
          "zones": "Zone 1"
        },
        {
          "ref": "31-220-17",
          "name": "Glaciär Midi SC HFC/HFO Group 2",
          "cat": "detector",
          "qty": 2,
          "price": 403,
          "total": 806,
          "zones": "Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 8,
          "price": 150,
          "total": 1200,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 8,
          "price": 99,
          "total": 792,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 8,
          "price": 100,
          "total": 800,
          "zones": "Système"
        }
      ],
      "grandTotal": 6555,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "zoneSizing": [
    {
      "name": "Zone 1",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 6,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": {
        "charge": 40,
        "volume": 150,
        "concentration": 0.26666666666666666,
        "pl": 0.058,
        "atel": 0.47,
        "lfl": 0.289,
        "exceedsPL": true,
        "exceedsATEL": false,
        "riskLevel": "high"
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": null
    }
  ]
}

### Quote SAM-2026-0071
- Status: new
- Date: Fri Mar 27 2026 01:31:47 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 8034 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"CXXXX","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"pardieu","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"pardieu","country":"FR","notes":""}
- Selections: {"application":"machine-room","gases":["co2"],"refrigerant":{"id":"744","name":"R-744 — Carbon dioxide (CO₂)"},"techPrefs":{"voltage":"230VAC","ip":"","communication":"analog_420,modbus","atex":true,"outdoor":false,"redundancy":true},"zones":[{"id":"b5160831-e702-4048-999d-2d528e99b28d","name":"Zone 1","type":"chambre_froide","gasId":"a2l","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":40,"evaporators":1},{"id":"928a654e-afbb-4d4a-b8af-73335c45baea","name":"Zone 2","type":"technique","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "totalDets": 10,
  "arch": "reinforced",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Zone 1: ⚠️ CRITIQUE : concentration 266.7 g/m³ dépasse l'ATEL (72.0 g/m³) — ventilation d'urgence et détection renforcée obligatoires (EN 378-1 §5.3)",
    "Zone 1: Aucune ventilation : facteur ×2",
    "Zone 1: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Zone 1: Charge > PL : facteur détection ×2 (EN 378-3 §6.4)",
    "Zone 2: Classe A2L : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 10,
      "bom": [
        {
          "ref": "37-420",
          "name": "GS24-HFC-4000",
          "cat": "detector",
          "qty": 10,
          "price": 792,
          "total": 7920,
          "zones": "Zone 1, Zone 2"
        },
        {
          "ref": "60-130",
          "name": "DT 300 Service tool",
          "cat": "alarm",
          "qty": 1,
          "price": 114,
          "total": 114,
          "zones": "Système"
        }
      ],
      "grandTotal": 8034,
      "description": "Contrôleur Modbus + capteurs déportés — supervision réseau, historique alarmes"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 10,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 8,
          "price": 477,
          "total": 3816,
          "zones": "Zone 1"
        },
        {
          "ref": "31-220-17",
          "name": "Glaciär Midi SC HFC/HFO Group 2",
          "cat": "detector",
          "qty": 2,
          "price": 403,
          "total": 806,
          "zones": "Zone 2"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 10,
          "price": 150,
          "total": 1500,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        },
        {
          "ref": "4000-0002",
          "name": "GLACIÄR Power Adapter 85-305VAC → 24VDC",
          "cat": "alarm",
          "qty": 10,
          "price": 99,
          "total": 990,
          "zones": "Système"
        },
        {
          "ref": "40-420",
          "name": "SOCK-H-R-230 high socket 230V",
          "cat": "alarm",
          "qty": 10,
          "price": 100,
          "total": 1000,
          "zones": "Système"
        }
      ],
      "grandTotal": 8207,
      "description": "Détecteurs MIDI autonomes + adaptateur 230V — installation simple, relais intégrés"
    }
  ],
  "zoneSizing": [
    {
      "name": "Zone 1",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 8,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": {
        "charge": 40,
        "volume": 150,
        "concentration": 0.26666666666666666,
        "pl": 0.1,
        "atel": 0.072,
        "lfl": "NF",
        "exceedsPL": true,
        "exceedsATEL": true,
        "riskLevel": "critical"
      }
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": null
    }
  ]
}

### Quote SAM-2026-0072
- Status: new
- Date: Sat Mar 28 2026 18:49:36 GMT+0100 (heure normale d’Europe centrale)
- Grand Total: 2862 €
- Client: {"firstName":"Marwan","lastName":"Chamoun","company":"Le Grand Liban","email":"legrandliban@gmail.com","phone":"+33663837577","projectName":"ffdfdfd","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"ffdfdfd","country":"FR","notes":""}
- Selections: {"application":"cold-room","gases":["hfc1"],"refrigerant":{"id":"134a","name":"R-134a — R-134a (Tetrafluoroethane)"},"techPrefs":{"voltage":"","ip":"","communication":"","atex":false,"outdoor":false,"redundancy":true},"zones":[{"id":"88ad8835-34dc-47ce-9ed2-3c4f519d9155","name":"Zone 1","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"af47ff51-6760-4ef3-9b08-26ef8be8a502","name":"Zone 2","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"b258326a-0039-4771-a98e-3831d99beab9","name":"Zone 3","type":"technique","gasId":"hfc1","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "totalDets": 6,
  "arch": "basic",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Zone 1: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 2: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Zone 3: Classe A1 : minimum 2 détecteurs (redondance EN 378)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "basic",
      "archLabel": "CENTRALISÉE",
      "totalDets": 6,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 6,
          "price": 477,
          "total": 2862,
          "zones": "Zone 1, Zone 2, Zone 3"
        }
      ],
      "grandTotal": 2862,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 6,
      "bom": [
        {
          "ref": "31-220-12",
          "name": "Glaciär Midi SC HFC/HFO Group 1",
          "cat": "detector",
          "qty": 6,
          "price": 403,
          "total": 2418,
          "zones": "Zone 1, Zone 2, Zone 3"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 6,
          "price": 150,
          "total": 900,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 3413,
      "description": "Détecteurs MIDI autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "zoneSizing": [
    {
      "name": "Zone 1",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": null
    },
    {
      "name": "Zone 2",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": null
    },
    {
      "name": "Zone 3",
      "type": "technique",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R410A/R407C/R507A",
      "atexRequired": false,
      "coverage": 50,
      "position": "LOW",
      "en378": null
    }
  ],
  "printedAt": "2026-03-28T17:49:42.249Z"
}

### Quote SAM-2026-0073
- Status: new
- Date: Sun Mar 29 2026 20:23:54 GMT+0200 (heure d’été d’Europe centrale)
- Grand Total: 5724 €
- Client: {"firstName":"Serge","lastName":"Menassa","company":"Sezam","email":"XXXX","phone":"+33663837577","projectName":"3 chambre carrefour","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"3 chambre carrefour","country":"FR","notes":""}
- Selections: {"application":"cold-room","gases":["a2l"],"refrigerant":{"id":"454A","name":"R-454A — R-454A"},"techPrefs":{"voltage":"24VAC/DC","ip":"","communication":"relay","atex":false,"outdoor":false,"redundancy":false},"zones":[{"id":"3102368a-b8c7-48c5-a208-4fae3675d294","name":"Légumes","type":"chambre_froide","gasId":"a2l","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"138ca2d6-3035-4052-9d5f-578f1c0d5349","name":"Viande","type":"chambre_froide","gasId":"a2l","surface":70,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":0,"evaporators":1},{"id":"1fc75d0c-1e26-4b66-967e-e20c03f8675c","name":"Fromage","type":"chambre_froide","gasId":"a2l","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "totalDets": 12,
  "arch": "reinforced",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Légumes: Aucune ventilation : facteur ×2",
    "Viande: Aucune ventilation : facteur ×2",
    "Fromage: Aucune ventilation : facteur ×2",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 12,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 12,
          "price": 477,
          "total": 5724,
          "zones": "Légumes, Viande, Fromage"
        }
      ],
      "grandTotal": 5724,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 12,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 12,
          "price": 477,
          "total": 5724,
          "zones": "Légumes, Viande, Fromage"
        }
      ],
      "grandTotal": 5724,
      "description": "Détecteurs MIDI autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "zoneSizing": [
    {
      "name": "Légumes",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 4,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": null
    },
    {
      "name": "Viande",
      "type": "chambre_froide",
      "surface": 70,
      "height": 3,
      "volume": 210,
      "detectors": 4,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": null
    },
    {
      "name": "Fromage",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 4,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": null
    }
  ]
}

### Quote SAM-2026-0074
- Status: new
- Date: Sun Mar 29 2026 20:24:36 GMT+0200 (heure d’été d’Europe centrale)
- Grand Total: 8586 €
- Client: {"firstName":"Serge","lastName":"Menassa","company":"Sezam","email":"XXXX","phone":"+33663837577","projectName":"3 chambre carrefour","country":"FR","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"3 chambre carrefour","country":"FR","notes":""}
- Selections: {"application":"cold-room","gases":["a2l"],"refrigerant":{"id":"454A","name":"R-454A — R-454A"},"techPrefs":{"voltage":"24VAC/DC","ip":"","communication":"relay","atex":false,"outdoor":false,"redundancy":false},"zones":[{"id":"3102368a-b8c7-48c5-a208-4fae3675d294","name":"Légumes","type":"chambre_froide","gasId":"a2l","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":30,"evaporators":1},{"id":"138ca2d6-3035-4052-9d5f-578f1c0d5349","name":"Viande","type":"chambre_froide","gasId":"a2l","surface":70,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":40,"evaporators":1},{"id":"1fc75d0c-1e26-4b66-967e-e20c03f8675c","name":"Fromage","type":"chambre_froide","gasId":"a2l","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":20,"evaporators":1}]}
- Results: {
  "totalDets": 18,
  "arch": "reinforced",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Légumes: ⚠️ Charge élevée : concentration 200.0 g/m³ dépasse le PL (56.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
    "Légumes: Aucune ventilation : facteur ×2",
    "Légumes: Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)",
    "Viande: ⚠️ Charge élevée : concentration 190.5 g/m³ dépasse le PL (56.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
    "Viande: Aucune ventilation : facteur ×2",
    "Viande: Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)",
    "Fromage: ⚠️ Charge élevée : concentration 133.3 g/m³ dépasse le PL (56.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
    "Fromage: Aucune ventilation : facteur ×2",
    "Fromage: Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 18,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 18,
          "price": 477,
          "total": 8586,
          "zones": "Légumes, Viande, Fromage"
        }
      ],
      "grandTotal": 8586,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 18,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 18,
          "price": 477,
          "total": 8586,
          "zones": "Légumes, Viande, Fromage"
        }
      ],
      "grandTotal": 8586,
      "description": "Détecteurs MIDI autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "zoneSizing": [
    {
      "name": "Légumes",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 6,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": {
        "charge": 30,
        "volume": 150,
        "concentration": 0.2,
        "pl": 0.056,
        "atel": 0.461,
        "lfl": 0.278,
        "exceedsPL": true,
        "exceedsATEL": false,
        "riskLevel": "high"
      }
    },
    {
      "name": "Viande",
      "type": "chambre_froide",
      "surface": 70,
      "height": 3,
      "volume": 210,
      "detectors": 6,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": {
        "charge": 40,
        "volume": 210,
        "concentration": 0.19047619047619047,
        "pl": 0.056,
        "atel": 0.461,
        "lfl": 0.278,
        "exceedsPL": true,
        "exceedsATEL": false,
        "riskLevel": "high"
      }
    },
    {
      "name": "Fromage",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 6,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": {
        "charge": 20,
        "volume": 150,
        "concentration": 0.13333333333333333,
        "pl": 0.056,
        "atel": 0.461,
        "lfl": 0.278,
        "exceedsPL": true,
        "exceedsATEL": false,
        "riskLevel": "high"
      }
    }
  ],
  "printedAt": "2026-03-29T18:25:11.346Z"
}

### Quote SAM-2026-0075
- Status: new
- Date: Mon Mar 30 2026 22:10:52 GMT+0200 (heure d’été d’Europe centrale)
- Grand Total: 5247 €
- Client: {"firstName":"Chady","lastName":"Kharrat","company":"Likewhatt","email":"xxxx","phone":"","projectName":"Safe monitoring solution","country":"IT","charge":"","notes":"","rgpdConsent":true}
- Project: {"name":"Safe monitoring solution","country":"IT","notes":""}
- Selections: {"application":"cold-room","gases":["a2l"],"refrigerant":{"id":"454C","name":"R-454C — R-454C (Opteon XL20)"},"techPrefs":{"voltage":"24VDC","ip":"","communication":"analog_420,relay","atex":false,"outdoor":false,"redundancy":false},"zones":[{"id":"c033d930-48ff-4b74-9f86-073f89329436","name":"Légumes","type":"chambre_froide","gasId":"a2l","surface":50,"height":3,"ventilation":"none","occupation":"occasional","atex":false,"charge":20,"evaporators":1},{"id":"84ab1ed6-d56e-465f-936c-f15f1a0095b8","name":"Zone 2","type":"chambre_froide","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":40,"evaporators":1},{"id":"70cce5bf-dbfd-41ec-b3be-3b1e0bcdd824","name":"Zone 3","type":"chambre_froide","gasId":"a2l","surface":50,"height":3,"ventilation":"mechanical","occupation":"occasional","atex":false,"charge":0,"evaporators":1}]}
- Results: {
  "totalDets": 11,
  "arch": "reinforced",
  "archLabel": "CENTRALISÉE",
  "complianceNotes": [
    "Légumes: ⚠️ Charge élevée : concentration 133.3 g/m³ dépasse le PL (59.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
    "Légumes: Aucune ventilation : facteur ×2",
    "Légumes: Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)",
    "Zone 2: ⚠️ Charge élevée : concentration 266.7 g/m³ dépasse le PL (59.0 g/m³) — détection obligatoire + ventilation mécanique (EN 378-1 §5.3)",
    "Zone 2: Charge > PL : facteur détection ×1.5 (EN 378-3 §6.4)",
    "Normes de référence : EN 378-1/2/3/4, EN 14624",
    "Maintenance : Calibration annuelle de tous les détecteurs (EN 378-4)",
    "Prix indicatifs hors taxes — tarifs sujets à mise à jour. Contactez SAMON pour un devis définitif."
  ],
  "proposals": [
    {
      "arch": "reinforced",
      "archLabel": "CENTRALISÉE",
      "totalDets": 11,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 11,
          "price": 477,
          "total": 5247,
          "zones": "Légumes, Zone 2, Zone 3"
        }
      ],
      "grandTotal": 5247,
      "description": "Contrôleur central + capteurs analogiques — surveillance centralisée, maintenance simplifiée"
    },
    {
      "arch": "standalone",
      "archLabel": "AUTONOME",
      "totalDets": 11,
      "bom": [
        {
          "ref": "38-220",
          "name": "MP-D-HFC-4000",
          "cat": "detector",
          "qty": 6,
          "price": 477,
          "total": 2862,
          "zones": "Légumes"
        },
        {
          "ref": "31-220-17",
          "name": "Glaciär Midi SC HFC/HFO Group 2",
          "cat": "detector",
          "qty": 5,
          "price": 403,
          "total": 2015,
          "zones": "Zone 2, Zone 3"
        },
        {
          "ref": "40-440",
          "name": "FL-RL-R-SEP Flash+Sirène rouge",
          "cat": "alarm",
          "qty": 11,
          "price": 150,
          "total": 1650,
          "zones": "Système"
        },
        {
          "ref": "61-9040",
          "name": "Glaciär Midi Calibration Kit",
          "cat": "alarm",
          "qty": 1,
          "price": 95,
          "total": 95,
          "zones": "Système"
        }
      ],
      "grandTotal": 6622,
      "description": "Détecteurs MIDI autonomes avec relais intégrés — installation simple, pas de contrôleur"
    }
  ],
  "zoneSizing": [
    {
      "name": "Légumes",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 6,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": {
        "charge": 20,
        "volume": 150,
        "concentration": 0.13333333333333333,
        "pl": 0.059,
        "atel": 0.445,
        "lfl": 0.293,
        "exceedsPL": true,
        "exceedsATEL": false,
        "riskLevel": "high"
      }
    },
    {
      "name": "Zone 2",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 3,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": {
        "charge": 40,
        "volume": 150,
        "concentration": 0.26666666666666666,
        "pl": 0.059,
        "atel": 0.445,
        "lfl": 0.293,
        "exceedsPL": true,
        "exceedsATEL": false,
        "riskLevel": "high"
      }
    },
    {
      "name": "Zone 3",
      "type": "chambre_froide",
      "surface": 50,
      "height": 3,
      "volume": 150,
      "detectors": 2,
      "gasCode": "R32/R454B/R454C",
      "atexRequired": false,
      "coverage": 40,
      "position": "LOW",
      "en378": null
    }
  ]
}



---

## NEW FIELDS ADDED (V5 Simulator)

Three new fields have been added to each DETECTOR entry, sourced from the V5 Simulator engine:

### apps
- **Description**: List of compatible application zone_types from the V5 product selection engine
- **Values**: supermarket, cold_room, machinery_room, cold_storage, hotel, office, parking, ice_rink, heat_pump, pressure_relief, duct, atex_zone, water_brine
- **Source**: `PRODUCT_APPS` mapping in simulator.html
- **Usage**: Determines which applications/zone types each detector is designed for

### tier
- **Description**: Product tier classification for ranking in selection results
- **Values**: premium, standard, economic
- **Logic**:
  - **premium**: Best sensor technology + best features (e.g., MIDI CO2 IR, MIDI NH3 EC, X5 ATEX ionic NH3, X5 CO2 IR)
  - **standard**: Good sensor or elevated features (e.g., MIDI HFC SC, G-Series CO2 IR, GXR ATEX, X5 CO/NO2/O2)
  - **economic**: Basic sensor heads or transmitters requiring external controller (e.g., TR-Series, MP-Series, G-Series HFC/HC, RM)
- **Source**: `PRODUCT_TIERS` mapping in simulator.html

### refs
- **Description**: List of individual compatible refrigerant IDs that this detector can measure
- **Values**: Specific refrigerant codes (R744, R32, R407A, R134a, R717, R290, CO, NO2, O2, NH3W, etc.)
- **Source**: `refs` field from each product in the `PRODUCTS` catalogue in simulator.html
- **Usage**: Enables precise matching of detector to specific refrigerant in the selection algorithm
