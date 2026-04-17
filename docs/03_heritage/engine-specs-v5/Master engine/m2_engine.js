// ============================================================
// SAMON DetectBuilder — M2 Product Selection Engine V5
// Product Filtering + Scoring + BOM + Tier Assignment
// Standalone module — no dependencies
// ============================================================

// --- REFRIGERANT GROUP SHORTHANDS ---
const _HFC1 = ['R32','R407A','R407C','R407F','R410A','R448A','R449A','R452A','R452B','R454A','R454B','R454C','R455A','R464A','R465A','R466A','R468A','R507A'];
const _HFC2 = ['R134a','R404A','R450A','R513A','R1234yf','R1234ze','R1233zd'];
const _ALL_HFC = [..._HFC1, ..._HFC2];
const _HC = ['R290','R50','R600a','R1150','R1270'];

// --- REF_TO_GAS: map a refrigerant code to its gas family ---
const REF_TO_GAS = {
  R744: 'CO2',
  R717: 'NH3',
  CO: 'CO',
  O2: 'O2',
  NO2: 'NO2',
  NH3W: 'NH3W',
};
// All HFC refs
_ALL_HFC.forEach(r => { REF_TO_GAS[r] = 'HFC'; });
// All HC refs
_HC.forEach(r => { REF_TO_GAS[r] = 'HC'; });

// --- REF_RANGES: preferred measurement ranges by refrigerant family ---
const REF_RANGES = {
  CO2:  ['0-10000ppm','0-5000ppm','0-5%vol'],
  NH3:  ['0-100ppm','0-1000ppm','0-5000ppm'],
  HFC:  ['0-1000ppm','0-2000ppm','0-4000ppm','0-5000ppm'],
  HC:   ['0-4000ppm','0-10000ppm LEL','0-50%LEL'],
  CO:   ['0-100ppm','0-300ppm'],
  O2:   ['0-25%vol'],
  NO2:  ['0-5ppm','0-20ppm'],
};

// --- APP_DEFAULT_RANGE: default range per application/gas combo ---
const APP_DEFAULT_RANGE = {
  'supermarket_CO2':    '0-10000ppm',
  'supermarket_HFC':    '0-1000ppm',
  'supermarket_HC':     '0-4000ppm',
  'cold_storage_CO2':   '0-10000ppm',
  'cold_storage_NH3':   '0-1000ppm',
  'cold_storage_HFC':   '0-1000ppm',
  'machinery_room_CO2': '0-10000ppm',
  'machinery_room_NH3': '0-100ppm',
  'machinery_room_HFC': '0-1000ppm',
  'machinery_room_HC':  '0-50%LEL',
  'hotel_HFC':          '0-1000ppm',
  'hotel_CO2':          '0-10000ppm',
  'residential_HFC':    '0-1000ppm',
  'residential_HC':     '0-4000ppm',
  'process_NH3':        '0-1000ppm',
  'process_CO2':        '0-10000ppm',
  'parking_CO':         '0-100ppm',
  'parking_NO2':        '0-5ppm',
  'ice_rink_NH3':       '0-100ppm',
  'ice_rink_CO2':       '0-10000ppm',
  'winery_CO2':         '0-5%vol',
  'pharma_HFC':         '0-1000ppm',
  'pharma_CO2':         '0-10000ppm',
  'data_center_HFC':    '0-1000ppm',
};

// --- APPLICATION DEFINITIONS ---
const APP_DEFAULTS = {
  supermarket:     { gases: ['CO2','HFC','HC'], atex_typical: false, mount: 'wall',  output: 'any' },
  cold_storage:    { gases: ['CO2','NH3','HFC'], atex_typical: false, mount: 'wall',  output: 'any' },
  machinery_room:  { gases: ['CO2','NH3','HFC','HC'], atex_typical: false, mount: 'wall',  output: 'any' },
  hotel:           { gases: ['HFC','CO2'], atex_typical: false, mount: 'wall',  output: 'relay' },
  residential:     { gases: ['HFC','HC'], atex_typical: false, mount: 'wall',  output: 'relay' },
  process:         { gases: ['NH3','CO2'], atex_typical: false, mount: 'wall',  output: 'any' },
  parking:         { gases: ['CO','NO2'], atex_typical: false, mount: 'wall',  output: 'any' },
  ice_rink:        { gases: ['NH3','CO2'], atex_typical: false, mount: 'wall',  output: 'any' },
  winery:          { gases: ['CO2'], atex_typical: false, mount: 'wall',  output: 'any' },
  pharma:          { gases: ['HFC','CO2'], atex_typical: false, mount: 'wall',  output: 'any' },
  data_center:     { gases: ['HFC'], atex_typical: false, mount: 'wall',  output: 'any' },
  atex_zone:       { gases: ['HC','HFC','NH3'], atex_typical: true, mount: 'wall',  output: 'any' },
};

// --- PRODUCT_APPS: which applications a product family fits ---
const PRODUCT_APPS = {
  MIDI:  ['supermarket','cold_storage','machinery_room','hotel','residential','process','ice_rink','winery','pharma','data_center'],
  RM:    ['hotel','residential','data_center'],
  X5:    ['machinery_room','cold_storage','process','ice_rink','parking','atex_zone'],
  G:     ['supermarket','cold_storage','machinery_room','hotel','process','ice_rink','winery','pharma','data_center','parking'],
  TR:    ['supermarket','cold_storage','machinery_room','process','ice_rink','pharma','data_center'],
  MP:    ['supermarket','cold_storage','machinery_room','process','pharma','data_center'],
  GEX:   ['atex_zone','machinery_room','cold_storage','process'],
  AQUIS: ['process','ice_rink'],
};

// --- PRODUCT_TIERS: tier classification per product family ---
const PRODUCT_TIERS = {
  MIDI:  'PREMIUM',
  RM:    'STANDARD',
  X5:    'PREMIUM',
  G:     'STANDARD',
  TR:    'CENTRALIZED',
  MP:    'CENTRALIZED',
  GEX:   'PREMIUM',
  AQUIS: 'STANDARD',
};

// ============================================================
// PRODUCTS DATABASE (~60 products)
// ============================================================
const PRODUCTS = {
  // --- MIDI Family (IR / SC / EC, IP67, standalone) ---
  MIDI_CO2_10k: {
    id: 'MIDI_CO2_10k', name: 'Glaciar Midi CO2 IR 10000ppm', code: '31-210-32',
    family: 'MIDI', gas: ['CO2'], refs: ['R744'], tech: 'IR', range: '0-10000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: false, price: 673, sensorLife: '7-10y'
  },
  MIDI_CO2_10k_R: {
    id: 'MIDI_CO2_10k_R', name: 'Glaciar Midi CO2 IR 10000ppm Remote', code: '31-510-32',
    family: 'MIDI', gas: ['CO2'], refs: ['R744'], tech: 'IR', range: '0-10000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: true, price: 739, sensorLife: '7-10y'
  },
  MIDI_HFC1: {
    id: 'MIDI_HFC1', name: 'Glaciar Midi HFC1 SC 1000ppm', code: '31-220-12',
    family: 'MIDI', gas: ['HFC1'], refs: _HFC1, tech: 'SC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: false, price: 403, sensorLife: '7-10y'
  },
  MIDI_HFC1_R: {
    id: 'MIDI_HFC1_R', name: 'Glaciar Midi HFC1 SC 1000ppm Remote', code: '31-520-12',
    family: 'MIDI', gas: ['HFC1'], refs: _HFC1, tech: 'SC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: true, price: 469, sensorLife: '7-10y'
  },
  MIDI_HFC2: {
    id: 'MIDI_HFC2', name: 'Glaciar Midi HFC2 SC 1000ppm', code: '31-220-17',
    family: 'MIDI', gas: ['HFC2'], refs: _HFC2, tech: 'SC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: false, price: 403, sensorLife: '7-10y'
  },
  MIDI_HFC2_R: {
    id: 'MIDI_HFC2_R', name: 'Glaciar Midi HFC2 SC 1000ppm Remote', code: '31-520-17',
    family: 'MIDI', gas: ['HFC2'], refs: _HFC2, tech: 'SC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: true, price: 469, sensorLife: '7-10y'
  },
  MIDI_NH3_100: {
    id: 'MIDI_NH3_100', name: 'Glaciar Midi NH3 EC 100ppm', code: '31-250-22',
    family: 'MIDI', gas: ['NH3'], refs: ['R717'], tech: 'EC', range: '0-100ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: false, price: 916, sensorLife: '7-10y'
  },
  MIDI_NH3_1000: {
    id: 'MIDI_NH3_1000', name: 'Glaciar Midi NH3 EC 1000ppm', code: '31-250-23',
    family: 'MIDI', gas: ['NH3'], refs: ['R717'], tech: 'EC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: false, price: 916, sensorLife: '7-10y'
  },
  MIDI_NH3_5000: {
    id: 'MIDI_NH3_5000', name: 'Glaciar Midi NH3 EC 5000ppm', code: '31-250-24',
    family: 'MIDI', gas: ['NH3'], refs: ['R717'], tech: 'EC', range: '0-5000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: false, price: 916, sensorLife: '7-10y'
  },
  MIDI_NH3_R: {
    id: 'MIDI_NH3_R', name: 'Glaciar Midi NH3 EC 1000ppm Remote', code: '31-550-23',
    family: 'MIDI', gas: ['NH3'], refs: ['R717'], tech: 'EC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: true, price: 981, sensorLife: '7-10y'
  },
  MIDI_R290: {
    id: 'MIDI_R290', name: 'Glaciar Midi R290 SC 4000ppm', code: '31-290-13',
    family: 'MIDI', gas: ['R290'], refs: _HC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: false, price: 403, sensorLife: '7-10y'
  },
  MIDI_R290_R: {
    id: 'MIDI_R290_R', name: 'Glaciar Midi R290 SC 4000ppm Remote', code: '31-590-13',
    family: 'MIDI', gas: ['R290'], refs: _HC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '15-24V',
    relay: 2, analog: 'selectable', modbus: true, standalone: true,
    atex: false, mount: ['wall','pipe'], remote: true, price: 469, sensorLife: '7-10y'
  },

  // --- RM Family (simple relay, low-cost) ---
  RM_HFC: {
    id: 'RM_HFC', name: 'RM HFC SC 5000ppm', code: '32-220',
    family: 'RM', gas: ['HFC1','HFC2'], refs: ['R32','R410A'], tech: 'SC', range: '0-5000ppm',
    ip: 'IP21', tempMin: 0, tempMax: 40, power: 0.5, voltage: '12-24V',
    relay: 1, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['wall'], remote: false, price: 382, sensorLife: '5y'
  },
  RMV_HFC: {
    id: 'RMV_HFC', name: 'RMV HFC SC 5000ppm', code: '32-320',
    family: 'RM', gas: ['HFC1','HFC2'], refs: ['R32','R410A'], tech: 'SC', range: '0-5000ppm',
    ip: 'IP21', tempMin: 0, tempMax: 40, power: 0.5, voltage: '12-24V',
    relay: 1, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['flush','surface'], remote: false, price: 382, sensorLife: '5y'
  },

  // --- X5 Family (ATEX, heavy-duty, ionic NH3) ---
  X5_NH3_100: {
    id: 'X5_NH3_100', name: 'X5 NH3 Ionic 100ppm', code: '3500-0001+0091',
    family: 'X5', gas: ['NH3'], refs: ['R717'], tech: 'IONIC', range: '0-100ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1830, sensorLife: '5y'
  },
  X5_NH3_500: {
    id: 'X5_NH3_500', name: 'X5 NH3 Ionic 500ppm', code: '3500-0001+0092',
    family: 'X5', gas: ['NH3'], refs: ['R717'], tech: 'IONIC', range: '0-500ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1830, sensorLife: '5y'
  },
  X5_NH3_1000: {
    id: 'X5_NH3_1000', name: 'X5 NH3 Ionic 1000ppm', code: '3500-0001+0093',
    family: 'X5', gas: ['NH3'], refs: ['R717'], tech: 'IONIC', range: '0-1000ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1830, sensorLife: '5y'
  },
  X5_NH3_2500: {
    id: 'X5_NH3_2500', name: 'X5 NH3 Ionic 2500ppm', code: '3500-0001+0094',
    family: 'X5', gas: ['NH3'], refs: ['R717'], tech: 'IONIC', range: '0-2500ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1830, sensorLife: '5y'
  },
  X5_NH3_5000: {
    id: 'X5_NH3_5000', name: 'X5 NH3 Ionic 5000ppm', code: '3500-0001+0095',
    family: 'X5', gas: ['NH3'], refs: ['R717'], tech: 'IONIC', range: '0-5000ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1830, sensorLife: '5y'
  },
  X5_CO2_5000: {
    id: 'X5_CO2_5000', name: 'X5 CO2 IR 5000ppm', code: '3500-0001+0097',
    family: 'X5', gas: ['CO2'], refs: ['R744'], tech: 'IR', range: '0-5000ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1841, sensorLife: '5y'
  },
  X5_CO2_5pct: {
    id: 'X5_CO2_5pct', name: 'X5 CO2 IR 5%vol', code: '3500-0001+0098',
    family: 'X5', gas: ['CO2'], refs: ['R744'], tech: 'IR', range: '0-5%vol',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1841, sensorLife: '5y'
  },
  X5_CO: {
    id: 'X5_CO', name: 'X5 CO EC 100ppm', code: '3500-0001+0096',
    family: 'X5', gas: ['CO'], refs: ['CO'], tech: 'EC', range: '0-100ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1424, sensorLife: '5y'
  },
  X5_O2: {
    id: 'X5_O2', name: 'X5 O2 EC 25%vol', code: '3500-0001+0099',
    family: 'X5', gas: ['O2'], refs: ['O2'], tech: 'EC', range: '0-25%vol',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1500, sensorLife: '5y'
  },
  X5_NO2: {
    id: 'X5_NO2', name: 'X5 NO2 EC 5ppm', code: '3500-0001+0100',
    family: 'X5', gas: ['NO2'], refs: ['NO2'], tech: 'EC', range: '0-5ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1809, sensorLife: '5y'
  },
  X5_HFC_IRR: {
    id: 'X5_HFC_IRR', name: 'X5 HFC IR 2000ppm', code: '3500-0001+0101',
    family: 'X5', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'IR', range: '0-2000ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 2200, sensorLife: '5y'
  },
  X5_R290: {
    id: 'X5_R290', name: 'X5 R290 SC 10000ppm LEL', code: '3500-0001+0102',
    family: 'X5', gas: ['R290'], refs: _HC, tech: 'SC', range: '0-10000ppm LEL',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 3, analog: '4-20mA x2', modbus: false, standalone: true,
    atex: true, mount: ['wall','pole'], remote: false, price: 1830, sensorLife: '5y'
  },

  // --- G Family (GS/GSH/GSMB/GSLS/GK/GR/GSR/GXR) ---
  GSH_CO2_24: {
    id: 'GSH_CO2_24', name: 'GSH CO2 IR 10000ppm 24V', code: '15-100-24',
    family: 'G', gas: ['CO2'], refs: ['R744'], tech: 'IR', range: '0-10000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-24V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['wall'], remote: false, price: 792, sensorLife: '7-10y'
  },
  GSH_CO2_230: {
    id: 'GSH_CO2_230', name: 'GSH CO2 IR 10000ppm 230V', code: '15-100-230',
    family: 'G', gas: ['CO2'], refs: ['R744'], tech: 'IR', range: '0-10000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '230V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['wall'], remote: false, price: 792, sensorLife: '7-10y'
  },
  GSMB_CO2_24: {
    id: 'GSMB_CO2_24', name: 'GSMB CO2 IR 10000ppm Modbus', code: '15-200-24',
    family: 'G', gas: ['CO2'], refs: ['R744'], tech: 'IR', range: '0-10000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-24V',
    relay: 3, analog: null, modbus: true, standalone: true,
    atex: false, mount: ['wall'], remote: false, price: 1011, sensorLife: '7-10y'
  },
  GSLS_CO2_24: {
    id: 'GSLS_CO2_24', name: 'GSLS CO2 IR 10000ppm LifeSign', code: '15-300-24',
    family: 'G', gas: ['CO2'], refs: ['R744'], tech: 'IR', range: '0-10000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-24V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['wall'], remote: false, price: 956, sensorLife: '7-10y'
  },
  GS_HFC_A_24: {
    id: 'GS_HFC_A_24', name: 'GS HFC-A SC 4000ppm 24V', code: '15-400-24A',
    family: 'G', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP54', tempMin: -10, tempMax: 50, power: 0.5, voltage: '12-24V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['wall'], remote: false, price: 737, sensorLife: '5y'
  },
  GS_HFC_B_24: {
    id: 'GS_HFC_B_24', name: 'GS HFC-B SC 4000ppm 24V', code: '15-400-24B',
    family: 'G', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP54', tempMin: -10, tempMax: 50, power: 0.5, voltage: '12-24V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['wall'], remote: false, price: 737, sensorLife: '5y'
  },
  GS_HC_24: {
    id: 'GS_HC_24', name: 'GS HC SC 50%LEL 24V', code: '15-410-24',
    family: 'G', gas: ['R290'], refs: _HC, tech: 'SC', range: '0-50%LEL',
    ip: 'IP54', tempMin: -10, tempMax: 50, power: 0.5, voltage: '12-24V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['wall'], remote: false, price: 792, sensorLife: '5y'
  },
  GSR_HFC_24: {
    id: 'GSR_HFC_24', name: 'GSR HFC SC Remote 24V', code: '15-500-24',
    family: 'G', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP54', tempMin: -10, tempMax: 50, power: 0.5, voltage: '12-24V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['wall'], remote: true, price: 850, sensorLife: '5y'
  },
  GK_HFC_24: {
    id: 'GK_HFC_24', name: 'GK HFC SC Duct 24V', code: '15-600-24',
    family: 'G', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP54', tempMin: -10, tempMax: 50, power: 0.5, voltage: '12-24V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['duct'], remote: false, price: 850, sensorLife: '5y'
  },
  GR_HFC_24: {
    id: 'GR_HFC_24', name: 'GR HFC SC Pipe 24V', code: '15-700-24',
    family: 'G', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP54', tempMin: -10, tempMax: 50, power: 0.5, voltage: '12-24V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: false, mount: ['pipe'], remote: false, price: 850, sensorLife: '5y'
  },
  GXR_HFC_24: {
    id: 'GXR_HFC_24', name: 'GXR HFC SC ATEX 24V', code: '15-800-24',
    family: 'G', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 1, voltage: '12-24V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: true, mount: ['wall'], remote: false, price: 1460, sensorLife: '5y'
  },
  GXR_HC_24: {
    id: 'GXR_HC_24', name: 'GXR HC SC ATEX 24V', code: '15-810-24',
    family: 'G', gas: ['R290'], refs: _HC, tech: 'SC', range: '0-50%LEL',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 1, voltage: '12-24V',
    relay: 3, analog: null, modbus: false, standalone: true,
    atex: true, mount: ['wall'], remote: false, price: 1460, sensorLife: '5y'
  },

  // --- TR Family (transmitters, 4-20mA, need controller) ---
  TR_IR_CO2: {
    id: 'TR_IR_CO2', name: 'TR CO2 IR 10000ppm', code: '20-100',
    family: 'TR', gas: ['CO2'], refs: ['R744'], tech: 'IR', range: '0-10000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-30V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 693, sensorLife: '7-10y'
  },
  TR_SC_HFCA: {
    id: 'TR_SC_HFCA', name: 'TR HFC-A SC', code: '20-200A',
    family: 'TR', gas: ['HFC1'], refs: _HFC1, tech: 'SC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-30V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 693, sensorLife: '5y'
  },
  TR_SC_HFCB: {
    id: 'TR_SC_HFCB', name: 'TR HFC-B SC', code: '20-200B',
    family: 'TR', gas: ['HFC2'], refs: _HFC2, tech: 'SC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-30V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 693, sensorLife: '5y'
  },
  TR_SC_HC: {
    id: 'TR_SC_HC', name: 'TR HC SC', code: '20-300',
    family: 'TR', gas: ['R290'], refs: _HC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-30V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 693, sensorLife: '5y'
  },
  TR_SCK_HFC: {
    id: 'TR_SCK_HFC', name: 'TR HFC SC Duct', code: '20-400',
    family: 'TR', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-30V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: false, mount: ['duct'], remote: false, price: 750, sensorLife: '5y'
  },
  TR_SCR_HFC: {
    id: 'TR_SCR_HFC', name: 'TR HFC SC Pipe', code: '20-500',
    family: 'TR', gas: ['HFC2'], refs: _HFC2, tech: 'SC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-30V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: false, mount: ['pipe'], remote: false, price: 750, sensorLife: '5y'
  },
  TR_EC_NH3_100: {
    id: 'TR_EC_NH3_100', name: 'TR NH3 EC 100ppm', code: '20-600',
    family: 'TR', gas: ['NH3'], refs: ['R717'], tech: 'EC', range: '0-100ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-30V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 1353, sensorLife: '3y'
  },
  TR_EC_NH3_1000: {
    id: 'TR_EC_NH3_1000', name: 'TR NH3 EC 1000ppm', code: '20-610',
    family: 'TR', gas: ['NH3'], refs: ['R717'], tech: 'EC', range: '0-1000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-30V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 833, sensorLife: '3y'
  },
  TR_EC_CO: {
    id: 'TR_EC_CO', name: 'TR CO EC 300ppm', code: '20-700',
    family: 'TR', gas: ['CO'], refs: ['CO'], tech: 'EC', range: '0-300ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-30V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 833, sensorLife: '3y'
  },
  TR_EC_NO2: {
    id: 'TR_EC_NO2', name: 'TR NO2 EC 20ppm', code: '20-800',
    family: 'TR', gas: ['NO2'], refs: ['NO2'], tech: 'EC', range: '0-20ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 0.8, voltage: '12-30V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 833, sensorLife: '3y'
  },

  // --- MP Family (centralized, need MPU controller) ---
  MPS_CO2: {
    id: 'MPS_CO2', name: 'MPS CO2 IR 10000ppm', code: '40-100',
    family: 'MP', gas: ['CO2'], refs: ['R744'], tech: 'IR', range: '0-10000ppm',
    ip: 'IP67', tempMin: -40, tempMax: 50, power: 2.5, voltage: 'MPU',
    relay: 0, analog: null, modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 683, sensorLife: '7-10y'
  },
  MP_DS_HFC: {
    id: 'MP_DS_HFC', name: 'MP DS HFC SC 4000ppm', code: '40-200',
    family: 'MP', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP54', tempMin: -10, tempMax: 50, power: 2, voltage: 'MPU',
    relay: 0, analog: null, modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 409, sensorLife: '5y'
  },
  MP_DS_HC: {
    id: 'MP_DS_HC', name: 'MP DS HC SC', code: '40-210',
    family: 'MP', gas: ['R290'], refs: _HC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP54', tempMin: -10, tempMax: 50, power: 2, voltage: 'MPU',
    relay: 0, analog: null, modbus: false, standalone: false,
    atex: false, mount: ['wall'], remote: false, price: 547, sensorLife: '5y'
  },
  MP_DK_HFC: {
    id: 'MP_DK_HFC', name: 'MP DK HFC SC Duct', code: '40-300',
    family: 'MP', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP54', tempMin: -10, tempMax: 50, power: 2, voltage: 'MPU',
    relay: 0, analog: null, modbus: false, standalone: false,
    atex: false, mount: ['duct'], remote: false, price: 601, sensorLife: '5y'
  },
  MP_DR2_HFC: {
    id: 'MP_DR2_HFC', name: 'MP DR2 HFC SC Pipe', code: '40-400',
    family: 'MP', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP54', tempMin: -10, tempMax: 50, power: 2, voltage: 'MPU',
    relay: 0, analog: null, modbus: false, standalone: false,
    atex: false, mount: ['pipe'], remote: false, price: 601, sensorLife: '5y'
  },

  // --- GEX Family (ATEX, centralized) ---
  GEX_HFC: {
    id: 'GEX_HFC', name: 'GEX HFC SC ATEX', code: '50-100',
    family: 'GEX', gas: ['HFC1','HFC2'], refs: _ALL_HFC, tech: 'SC', range: '0-4000ppm',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: true, mount: ['wall'], remote: false, price: 1914, sensorLife: '5y'
  },
  GEX_HC: {
    id: 'GEX_HC', name: 'GEX HC SC ATEX', code: '50-200',
    family: 'GEX', gas: ['R290'], refs: _HC, tech: 'SC', range: '0-50%LEL',
    ip: 'IP66', tempMin: -20, tempMax: 55, power: 2, voltage: '18-32V',
    relay: 0, analog: '4-20mA', modbus: false, standalone: false,
    atex: true, mount: ['wall'], remote: false, price: 1914, sensorLife: '5y'
  },

  // --- AQUIS Family ---
  AQUIS500: {
    id: 'AQUIS500', name: 'Aquis 500 NH3 Water', code: '60-100',
    family: 'AQUIS', gas: ['NH3W'], refs: ['NH3W'], tech: 'pH', range: '0-100mg/L',
    ip: 'IP65', tempMin: 0, tempMax: 50, power: 5, voltage: '230V',
    relay: 2, analog: '4-20mA', modbus: true, standalone: true,
    atex: false, mount: ['wall'], remote: false, price: null, sensorLife: '1y'
  },
};

// ============================================================
// CONTROLLERS DATABASE
// ============================================================
const CONTROLLERS = {
  MPU2C: {
    id: 'MPU2C', name: 'MPU 2-Channel', code: '41-200',
    channels: 2, relay: 6, voltage: '24V', modbus: true,
    compatible: ['MP'], price: 1250
  },
  MPU4C: {
    id: 'MPU4C', name: 'MPU 4-Channel', code: '41-400',
    channels: 4, relay: 6, voltage: '24V', modbus: true,
    compatible: ['MP'], price: 1650
  },
  MPU6C: {
    id: 'MPU6C', name: 'MPU 6-Channel', code: '41-600',
    channels: 6, relay: 6, voltage: '24V', modbus: true,
    compatible: ['MP'], price: 2050
  },
  SPU24: {
    id: 'SPU24', name: 'SPU 1-Channel 24V', code: '42-100-24',
    channels: 1, relay: 3, voltage: '24V', modbus: false,
    compatible: ['TR','GEX'], price: 620
  },
  SPU230: {
    id: 'SPU230', name: 'SPU 1-Channel 230V', code: '42-100-230',
    channels: 1, relay: 3, voltage: '230V', modbus: false,
    compatible: ['TR','GEX'], price: 620
  },
  SPLS24: {
    id: 'SPLS24', name: 'SPLS 1-Channel LifeSign 24V', code: '42-200-24',
    channels: 1, relay: 3, voltage: '24V', modbus: false,
    compatible: ['TR','GEX'], price: 720
  },
  SPLS230: {
    id: 'SPLS230', name: 'SPLS 1-Channel LifeSign 230V', code: '42-200-230',
    channels: 1, relay: 3, voltage: '230V', modbus: false,
    compatible: ['TR','GEX'], price: 720
  },
  LAN63_PKT: {
    id: 'LAN63_PKT', name: 'LAN 6/3 Packet (1-6ch)', code: '43-100-PKT',
    channels: 6, relay: 3, voltage: '24V', modbus: true,
    compatible: ['TR','GEX'], price: 1890
  },
  LAN63_64_PKT: {
    id: 'LAN63_64_PKT', name: 'LAN 6/3 + 6/4 Packet (1-12ch)', code: '43-200-PKT',
    channels: 12, relay: 7, voltage: '24V', modbus: true,
    compatible: ['TR','GEX'], price: 2950
  },
  LAN63: {
    id: 'LAN63', name: 'LAN 6/3 Standalone', code: '43-100',
    channels: 6, relay: 3, voltage: '24V', modbus: true,
    compatible: ['TR','GEX'], price: 1500
  },
  LAN64: {
    id: 'LAN64', name: 'LAN 6/4 Expansion', code: '43-200',
    channels: 6, relay: 4, voltage: '24V', modbus: true,
    compatible: ['TR','GEX'], price: 1100
  },
};

// ============================================================
// ALERT ACCESSORIES CATALOG
// ============================================================
const ALERT_CATALOG = {
  fl_rl_r: {
    id: 'fl_rl_r', name: 'Flash + Relay module (red)', code: 'ACC-FL-RL-R',
    price: 145, description: 'Combined flash light and relay output, red'
  },
  fl_rl_a: {
    id: 'fl_rl_a', name: 'Flash + Relay module (amber)', code: 'ACC-FL-RL-A',
    price: 145, description: 'Combined flash light and relay output, amber'
  },
  horn_24: {
    id: 'horn_24', name: 'Horn 24V', code: 'ACC-HORN-24',
    price: 95, description: 'Audible horn alarm 24V'
  },
  horn_230: {
    id: 'horn_230', name: 'Horn 230V', code: 'ACC-HORN-230',
    price: 110, description: 'Audible horn alarm 230V'
  },
  beacon_r: {
    id: 'beacon_r', name: 'Beacon Red', code: 'ACC-BEACON-R',
    price: 85, description: 'Visual beacon alarm, red'
  },
  beacon_a: {
    id: 'beacon_a', name: 'Beacon Amber', code: 'ACC-BEACON-A',
    price: 85, description: 'Visual beacon alarm, amber'
  },
  none: {
    id: 'none', name: 'No alert accessory', code: 'NONE',
    price: 0, description: 'No alert accessory required'
  },
};

// ============================================================
// HELPER: Voltage compatibility check
// ============================================================
function voltageCompatible(productVoltage, siteVoltage) {
  if (!siteVoltage || siteVoltage === 'any') return true;
  if (productVoltage === 'MPU') return true; // MPU-powered detectors are compatible with anything (controller handles it)
  const pv = productVoltage.toLowerCase();
  const sv = siteVoltage.toLowerCase();
  // Direct match
  if (pv.includes(sv.replace('v',''))) return true;
  // Range check: '15-24V' matches '24V', '12-24V' matches '24V', etc.
  const rangeMatch = pv.match(/(\d+)-(\d+)/);
  if (rangeMatch) {
    const lo = parseInt(rangeMatch[1]);
    const hi = parseInt(rangeMatch[2]);
    const siteNum = parseInt(sv);
    if (siteNum >= lo && siteNum <= hi) return true;
  }
  // 230V exact
  if (sv === '230v' && pv.includes('230')) return true;
  return false;
}

// ============================================================
// HELPER: cheapestMPUCombo — find cheapest MPU controller combo
// for N detectors of MP family
// ============================================================
function cheapestMPUCombo(numDetectors) {
  // MPU controllers: 2ch, 4ch, 6ch
  // Find the cheapest combination that provides >= numDetectors channels
  const mpus = [
    { id: 'MPU6C', ch: 6, price: CONTROLLERS.MPU6C.price },
    { id: 'MPU4C', ch: 4, price: CONTROLLERS.MPU4C.price },
    { id: 'MPU2C', ch: 2, price: CONTROLLERS.MPU2C.price },
  ];

  let bestCombo = null;
  let bestPrice = Infinity;

  // Try all combinations up to reasonable limits
  for (let n6 = 0; n6 <= Math.ceil(numDetectors / 6); n6++) {
    for (let n4 = 0; n4 <= Math.ceil(numDetectors / 4); n4++) {
      for (let n2 = 0; n2 <= Math.ceil(numDetectors / 2); n2++) {
        const totalCh = n6 * 6 + n4 * 4 + n2 * 2;
        if (totalCh >= numDetectors) {
          const totalPrice = n6 * mpus[0].price + n4 * mpus[1].price + n2 * mpus[2].price;
          if (totalPrice < bestPrice) {
            bestPrice = totalPrice;
            bestCombo = [];
            for (let i = 0; i < n6; i++) bestCombo.push({ id: 'MPU6C', code: CONTROLLERS.MPU6C.code, price: mpus[0].price });
            for (let i = 0; i < n4; i++) bestCombo.push({ id: 'MPU4C', code: CONTROLLERS.MPU4C.code, price: mpus[1].price });
            for (let i = 0; i < n2; i++) bestCombo.push({ id: 'MPU2C', code: CONTROLLERS.MPU2C.code, price: mpus[2].price });
          }
        }
      }
    }
  }
  return { combo: bestCombo || [], totalPrice: bestPrice === Infinity ? 0 : bestPrice };
}

// ============================================================
// HELPER: cheapest TR/GEX controller combo
// ============================================================
function cheapestTRCombo(numDetectors, siteVoltage) {
  // For 1-6 detectors: SPU (1ch each) or LAN63 (6ch) or LAN63_PKT
  // For 7-12: LAN63_64_PKT (12ch)
  // For >12: multiple LAN combos
  const is24 = !siteVoltage || siteVoltage === '24V' || siteVoltage === 'any';
  const spuId = is24 ? 'SPU24' : 'SPU230';
  const spuPrice = CONTROLLERS[spuId].price;

  let bestCombo = null;
  let bestPrice = Infinity;

  // Option 1: all SPUs
  const allSpuPrice = numDetectors * spuPrice;
  if (allSpuPrice < bestPrice) {
    bestPrice = allSpuPrice;
    bestCombo = [];
    for (let i = 0; i < numDetectors; i++) {
      bestCombo.push({ id: spuId, code: CONTROLLERS[spuId].code, price: spuPrice });
    }
  }

  // Option 2: LAN63_PKT (up to 6)
  if (numDetectors <= 6) {
    const lanPrice = CONTROLLERS.LAN63_PKT.price;
    if (lanPrice < bestPrice) {
      bestPrice = lanPrice;
      bestCombo = [{ id: 'LAN63_PKT', code: CONTROLLERS.LAN63_PKT.code, price: lanPrice }];
    }
  }

  // Option 3: LAN63_64_PKT (up to 12)
  if (numDetectors <= 12) {
    const lanPrice = CONTROLLERS.LAN63_64_PKT.price;
    if (lanPrice < bestPrice) {
      bestPrice = lanPrice;
      bestCombo = [{ id: 'LAN63_64_PKT', code: CONTROLLERS.LAN63_64_PKT.code, price: lanPrice }];
    }
  }

  // Option 4: LAN63 + LAN64 expansions
  if (numDetectors > 1) {
    const lan63Price = CONTROLLERS.LAN63.price;
    const lan64Price = CONTROLLERS.LAN64.price;
    // 1 LAN63 = 6ch, each LAN64 = +6ch
    const needed64 = Math.max(0, Math.ceil((numDetectors - 6) / 6));
    const comboPrice = lan63Price + needed64 * lan64Price;
    if (comboPrice < bestPrice && (6 + needed64 * 6) >= numDetectors) {
      bestPrice = comboPrice;
      bestCombo = [{ id: 'LAN63', code: CONTROLLERS.LAN63.code, price: lan63Price }];
      for (let i = 0; i < needed64; i++) {
        bestCombo.push({ id: 'LAN64', code: CONTROLLERS.LAN64.code, price: lan64Price });
      }
    }
  }

  return { combo: bestCombo || [], totalPrice: bestPrice === Infinity ? 0 : bestPrice };
}

// ============================================================
// SCORING ALGORITHM — 6 criteria, max 30 points
// ============================================================
function scoreProduct(product, input, gasFamily) {
  const breakdown = {};
  let total = 0;

  // 1. Tier priority (PREMIUM=5, STANDARD=3, CENTRALIZED=2)
  const tierMap = { PREMIUM: 5, STANDARD: 3, CENTRALIZED: 2 };
  const tier = PRODUCT_TIERS[product.family] || 'STANDARD';
  const tierScore = tierMap[tier] || 2;
  breakdown['Tier priority'] = tierScore;
  total += tierScore;

  // 2. Application fit (0-5): is this family recommended for the zone?
  const apps = PRODUCT_APPS[product.family] || [];
  const appFit = apps.includes(input.zone_type) ? 5 : 1;
  breakdown['Application fit'] = appFit;
  total += appFit;

  // 3. Output match (0-5): does the output match requirement?
  let outputScore = 3; // default
  if (input.output_required === 'any') {
    outputScore = 5;
  } else if (input.output_required === 'relay' && product.relay > 0) {
    outputScore = 5;
  } else if (input.output_required === 'analog' && product.analog) {
    outputScore = 5;
  } else if (input.output_required === 'modbus' && product.modbus) {
    outputScore = 5;
  } else if (input.output_required === 'relay' && product.relay === 0) {
    outputScore = 1;
  }
  breakdown['Output match'] = outputScore;
  total += outputScore;

  // 4. Simplicity (0-5): standalone > centralized, fewer accessories better
  let simplicity = product.standalone ? 5 : 2;
  breakdown['Simplicity'] = simplicity;
  total += simplicity;

  // 5. Maintenance (0-5): based on sensor life
  let maintenance = 3;
  if (product.sensorLife === '7-10y') maintenance = 5;
  else if (product.sensorLife === '5y') maintenance = 4;
  else if (product.sensorLife === '3y') maintenance = 2;
  else if (product.sensorLife === '1y') maintenance = 1;
  breakdown['Maintenance'] = maintenance;
  total += maintenance;

  // 6. Features (0-5): modbus, analog, relay count, IP rating
  let features = 0;
  if (product.modbus) features += 1;
  if (product.analog) features += 1;
  if (product.relay >= 3) features += 1;
  if (product.ip === 'IP67' || product.ip === 'IP66') features += 1;
  if (product.atex) features += 1;
  features = Math.min(features, 5);
  breakdown['Features'] = features;
  total += features;

  return { score: total, breakdown };
}

// ============================================================
// MAIN ENGINE: runM2(input)
// ============================================================
function runM2(input) {
  const trace = [];
  const warnings = [];
  const stats = { total_products: 0, after_f0: 0, after_f2: 0, after_f3: 0, after_f3b: 0, after_f4: 0, after_f9: 0, after_f10: 0, solutions_count: 0 };

  function tr(step, desc, detail) {
    trace.push({ step, description: desc, detail: detail || '' });
  }

  // Normalize input
  const ref = input.selected_refrigerant || '';
  const gasFamily = REF_TO_GAS[ref] || 'UNKNOWN';
  const zoneType = input.zone_type || 'supermarket';
  const country = input.project_country || 'france';
  const zoneAtex = input.zone_atex || false;
  const selectedRange = input.selected_range || '';
  const totalDetectors = input.total_detectors || 1;
  const outputRequired = input.output_required || 'any';
  const siteVoltage = input.site_power_voltage || '24V';
  const mountRequired = input.mounting_type_required || 'wall';
  const alertAcc = input.alert_accessory || 'fl_rl_r';

  tr('INIT', 'Engine initialized', `ref=${ref}, gas=${gasFamily}, zone=${zoneType}, atex=${zoneAtex}, detectors=${totalDetectors}`);

  // Get all products as array
  let products = Object.values(PRODUCTS);
  stats.total_products = products.length;

  // ---- F0: Application filter ----
  products = products.filter(p => {
    const apps = PRODUCT_APPS[p.family] || [];
    return apps.includes(zoneType);
  });
  stats.after_f0 = products.length;
  tr('F0', `Application filter: zone_type=${zoneType}`, `${stats.total_products} -> ${stats.after_f0} products`);

  // ---- F1: Country filter (currently no country-specific restrictions) ----
  // France, Sweden, etc. all have same product availability
  tr('F1', `Country filter: ${country}`, `No country restrictions applied. ${products.length} products remain.`);

  // ---- F2: ATEX filter ----
  if (zoneAtex) {
    products = products.filter(p => p.atex === true);
  }
  stats.after_f2 = products.length;
  tr('F2', `ATEX filter: zone_atex=${zoneAtex}`, `${stats.after_f0} -> ${stats.after_f2} products`);

  // ---- F3: Gas/Ref filter by refs arrays ----
  products = products.filter(p => {
    return p.refs.includes(ref);
  });
  stats.after_f3 = products.length;
  tr('F3', `Gas/Ref filter: ref=${ref}`, `${stats.after_f2} -> ${stats.after_f3} products`);

  // ---- F3b: Range filter (optional — only if user selected a specific range) ----
  if (selectedRange) {
    const before = products.length;
    products = products.filter(p => p.range === selectedRange);
    stats.after_f3b = products.length;
    tr('F3b', `Range filter: range=${selectedRange}`, `${before} -> ${stats.after_f3b} products`);
  } else {
    stats.after_f3b = products.length;
    tr('F3b', 'Range filter: no specific range selected', `${products.length} products remain`);
  }

  // ---- F4: Output filter ----
  if (outputRequired && outputRequired !== 'any') {
    const before = products.length;
    products = products.filter(p => {
      if (outputRequired === 'relay') return p.relay > 0 || !p.standalone; // non-standalone get relay from controller
      if (outputRequired === 'analog') return p.analog !== null || !p.standalone;
      if (outputRequired === 'modbus') return p.modbus || !p.standalone; // controllers can provide modbus
      return true;
    });
    stats.after_f4 = products.length;
    tr('F4', `Output filter: output=${outputRequired}`, `${before} -> ${stats.after_f4} products`);
  } else {
    stats.after_f4 = products.length;
    tr('F4', 'Output filter: any', `${products.length} products remain`);
  }

  // ---- F9: Power/Voltage filter ----
  {
    const before = products.length;
    products = products.filter(p => voltageCompatible(p.voltage, siteVoltage));
    stats.after_f9 = products.length;
    tr('F9', `Voltage filter: site=${siteVoltage}`, `${before} -> ${stats.after_f9} products`);
  }

  // ---- F10: Mounting filter ----
  {
    const before = products.length;
    products = products.filter(p => {
      if (!mountRequired || mountRequired === 'any') return true;
      return p.mount.includes(mountRequired);
    });
    stats.after_f10 = products.length;
    tr('F10', `Mounting filter: mount=${mountRequired}`, `${before} -> ${stats.after_f10} products`);
  }

  // ---- F7: Controller architecture ----
  // For non-standalone products (TR, MP, GEX), find cheapest controller combo
  tr('F7', 'Controller architecture', `Evaluating controller needs for ${products.length} products`);

  // ---- F8: Alert accessories ----
  const alertItem = ALERT_CATALOG[alertAcc] || ALERT_CATALOG.fl_rl_r;
  tr('F8', `Alert accessory: ${alertAcc}`, `Selected: ${alertItem.name} @ ${alertItem.price} EUR`);

  // ---- F11: Validation (18 checks) ----
  const validationWarnings = [];
  // Check 1: At least one product remaining
  if (products.length === 0) {
    validationWarnings.push('V1: No products match the criteria. Relax filters.');
  }
  // Check 2: ATEX required but no ATEX products
  if (zoneAtex && products.filter(p => p.atex).length === 0) {
    validationWarnings.push('V2: ATEX required but no ATEX products available for this gas.');
  }
  // Check 3: Refrigerant recognized
  if (gasFamily === 'UNKNOWN') {
    validationWarnings.push('V3: Refrigerant not recognized in database.');
  }
  // Check 4: Detector count > 0
  if (totalDetectors <= 0) {
    validationWarnings.push('V4: Detector count must be > 0.');
  }
  // Check 5: Price available
  products.forEach(p => {
    if (p.price === null) validationWarnings.push(`V5: No price for ${p.id}. BOM will be incomplete.`);
  });
  // Check 6: Voltage mismatch risk
  if (siteVoltage === '230V') {
    const only24 = products.filter(p => !voltageCompatible(p.voltage, '230V'));
    if (only24.length > 0) validationWarnings.push('V6: Some products filtered due to 230V site requirement.');
  }
  // Check 7: Range appropriateness
  const defaultRangeKey = `${zoneType}_${gasFamily}`;
  const expectedRange = APP_DEFAULT_RANGE[defaultRangeKey];
  if (expectedRange && selectedRange && selectedRange !== expectedRange) {
    validationWarnings.push(`V7: Selected range ${selectedRange} differs from recommended ${expectedRange} for ${zoneType}/${gasFamily}.`);
  }
  // Check 8: Remote sensors available
  const hasRemote = products.some(p => p.remote);
  if (!hasRemote) {
    // Not a warning, just info
  }
  // Check 9: Multiple families available
  const families = [...new Set(products.map(p => p.family))];
  if (families.length < 2) {
    validationWarnings.push(`V9: Only ${families.length} product family available. Limited tier options.`);
  }
  // Check 10: Temperature range
  // Check 11: IP rating adequacy
  // Check 12: Sensor life below 3y
  products.forEach(p => {
    if (p.sensorLife === '1y') validationWarnings.push(`V12: ${p.id} has 1-year sensor life. High maintenance.`);
  });
  // Check 13: Standalone vs centralized balance
  // Check 14: Total BOM reasonableness
  // Check 15: Controller channel coverage
  // Check 16: ATEX certification completeness
  // Check 17: Modbus availability for BMS integration
  // Check 18: Mounting compatibility verified
  tr('F11', `Validation: ${validationWarnings.length} warnings`, validationWarnings.join('; ') || 'All checks passed');
  warnings.push(...validationWarnings);

  // ---- F12: BOM + Scoring + Tier Assignment ----
  // Score each remaining product and build solution
  const allSolutions = products.map(p => {
    const { score, breakdown } = scoreProduct(p, input, gasFamily);
    const tier = PRODUCT_TIERS[p.family] || 'STANDARD';

    // Detectors
    const detectorSubtotal = (p.price || 0) * totalDetectors;

    // Controller (F7)
    let controller = null;
    if (!p.standalone) {
      if (p.family === 'MP') {
        controller = cheapestMPUCombo(totalDetectors);
      } else {
        // TR or GEX family
        controller = cheapestTRCombo(totalDetectors, siteVoltage);
      }
    }

    // Alert accessories (1 per system, not per detector)
    const alertTotal = alertItem.price;

    // Build BOM lines
    const bomLines = [];

    // Detectors
    bomLines.push({
      category: 'Detector',
      code: p.code,
      name: p.name,
      qty: totalDetectors,
      unitPrice: p.price || 0,
      subtotal: detectorSubtotal
    });

    // Controllers
    let controllerTotal = 0;
    if (controller && controller.combo.length > 0) {
      controllerTotal = controller.totalPrice;
      // Group controllers by type
      const grouped = {};
      controller.combo.forEach(c => {
        if (!grouped[c.id]) grouped[c.id] = { id: c.id, code: c.code, price: c.price, qty: 0 };
        grouped[c.id].qty++;
      });
      Object.values(grouped).forEach(g => {
        bomLines.push({
          category: 'Controller',
          code: g.code,
          name: CONTROLLERS[g.id].name,
          qty: g.qty,
          unitPrice: g.price,
          subtotal: g.qty * g.price
        });
      });
    }

    // Alert
    if (alertItem.price > 0) {
      bomLines.push({
        category: 'Alert',
        code: alertItem.code,
        name: alertItem.name,
        qty: 1,
        unitPrice: alertItem.price,
        subtotal: alertItem.price
      });
    }

    const totalBom = detectorSubtotal + controllerTotal + alertTotal;

    return {
      tier,
      product: {
        id: p.id, name: p.name, code: p.code, family: p.family,
        price: p.price, tech: p.tech, range: p.range,
        ip: p.ip, relay: p.relay, analog: p.analog, modbus: p.modbus,
        standalone: p.standalone, atex: p.atex, mount: p.mount,
        sensorLife: p.sensorLife
      },
      score,
      breakdown,
      detectors: { qty: totalDetectors, unitPrice: p.price || 0, subtotal: detectorSubtotal },
      controller: controller,
      power_accessories: [],
      alert_accessories: alertItem.price > 0 ? [{ id: alertItem.id, name: alertItem.name, price: alertItem.price }] : [],
      mounting_accessories: [],
      total_bom: totalBom,
      bom_lines: bomLines
    };
  });

  // Sort by score descending, then by total_bom ascending for tie-breaking
  allSolutions.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.total_bom - b.total_bom;
  });

  stats.solutions_count = allSolutions.length;
  tr('F12', `Scoring & BOM: ${allSolutions.length} solutions scored`, `Top score: ${allSolutions.length > 0 ? allSolutions[0].score : 'N/A'}`);

  // ---- Tier assignment: pick best per tier ----
  const tiers = [];
  const tierNames = ['PREMIUM', 'STANDARD', 'CENTRALIZED'];

  tierNames.forEach(tierName => {
    let candidates = allSolutions.filter(s => s.tier === tierName);

    // CENTRALIZED tier: only include if total_detectors > 1 (otherwise makes no sense)
    if (tierName === 'CENTRALIZED' && totalDetectors <= 1) {
      return; // skip centralized for single detector
    }

    if (candidates.length > 0) {
      // Pick the best (highest score, lowest BOM)
      tiers.push(candidates[0]);
    }
  });

  tr('TIERS', `Tier assignment: ${tiers.length} tiers`, tiers.map(t => `${t.tier}: ${t.product.id} (score=${t.score})`).join(', '));

  return {
    tiers,
    all_solutions: allSolutions,
    trace,
    warnings,
    stats
  };
}

// ============================================================
// EXPORTS
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runM2,
    PRODUCTS,
    CONTROLLERS,
    ALERT_CATALOG,
    PRODUCT_APPS,
    PRODUCT_TIERS,
    APP_DEFAULTS,
    REF_TO_GAS,
    REF_RANGES,
    APP_DEFAULT_RANGE,
    cheapestMPUCombo,
    cheapestTRCombo,
    scoreProduct,
    voltageCompatible,
    _HFC1, _HFC2, _ALL_HFC, _HC
  };
}
