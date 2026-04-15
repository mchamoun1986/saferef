/**
 * V5 Product Catalog — extracted from simulator.html
 * Each entry maps to the enriched Prisma Product model.
 */

// Refrigerant group lists (matching simulator)
const _HFC1 = ['R32','R407A','R407C','R407F','R410A','R448A','R449A','R452A','R452B','R454A','R454B','R454C','R455A','R464A','R465A','R466A','R468A','R507A'];
const _HFC2 = ['R134a','R404A','R450A','R513A','R1234yf','R1234ze','R1233zd'];
const _ALL_HFC = [..._HFC1, ..._HFC2];
const _HC = ['R290','R50','R600a','R1150','R1270'];

export interface SeedProduct {
  type: string;
  family: string;
  name: string;
  code: string;
  price: number;
  image: string | null;
  specs: string;
  tier: string;
  productGroup: string;
  gas: string;
  refs: string;
  apps: string;
  range: string | null;
  sensorTech: string | null;
  sensorLife: string | null;
  power: number | null;
  voltage: string | null;
  ip: string | null;
  tempMin: number | null;
  tempMax: number | null;
  relay: number;
  analog: string | null;
  modbus: boolean;
  standalone: boolean;
  atex: boolean;
  mount: string;
  remote: boolean;
  features: string | null;
  connectTo: string | null;
  discontinued: boolean;
  channels: number | null;
  maxPower: number | null;
  powerDesc: string | null;
  relaySpec: string | null;
  analogType: string | null;
  modbusType: string | null;
  subCategory: string | null;
  compatibleFamilies: string;
}

// Helper to build a detector product
function det(
  id: string, name: string, code: string, family: string,
  gas: string[], refs: string[], tech: string, range: string,
  ip: string, tempMin: number, tempMax: number, power: number,
  voltage: string, relay: number, analog: string | null, modbus: boolean,
  standalone: boolean, atex: boolean, mount: string[], remote: boolean,
  price: number | null, sensorLife: string, tier: string, productGroup: string,
  apps: string[],
  extra: Partial<{powerDesc:string; relaySpec:string; analogType:string; modbusType:string; connectTo:string; features:string}> = {}
): SeedProduct {
  return {
    type: 'detector', family, name, code, price: price ?? 0,
    image: null,
    specs: JSON.stringify({ tech, ip, tempMin, tempMax, power, voltage, relay, analog, modbus, standalone, atex, mount, remote, sensorLife, ...extra }),
    tier, productGroup,
    gas: JSON.stringify(gas), refs: JSON.stringify(refs), apps: JSON.stringify(apps),
    range, sensorTech: tech, sensorLife, power, voltage, ip,
    tempMin, tempMax, relay, analog, modbus, standalone, atex,
    mount: JSON.stringify(mount), remote,
    features: extra.features ?? null, connectTo: extra.connectTo ?? null,
    discontinued: false, channels: null, maxPower: null,
    powerDesc: extra.powerDesc ?? null, relaySpec: extra.relaySpec ?? null,
    analogType: extra.analogType ?? null, modbusType: extra.modbusType ?? null,
    subCategory: null, compatibleFamilies: '[]',
  };
}

// Helper to build a controller product
function ctrl(
  id: string, name: string, code: string,
  channels: number, maxPower: number, voltage: string, ip: string, price: number,
  tier: string, productGroup: string,
  extra: Partial<{relaySpec:string; analogType:string; modbusType:string; connectTo:string; features:string; powerDesc:string; relayOutputs:number; rs485:boolean; display:boolean; mounting:string}> = {}
): SeedProduct {
  return {
    type: 'controller', family: 'Controller', name, code, price,
    image: null,
    specs: JSON.stringify({ channels, maxPower, voltage, ip, ...extra }),
    tier, productGroup,
    gas: '[]', refs: '[]', apps: '[]',
    range: null, sensorTech: null, sensorLife: null,
    power: null, voltage, ip,
    tempMin: null, tempMax: null,
    relay: extra.relayOutputs ?? 0,
    analog: extra.analogType ?? null,
    modbus: extra.rs485 ?? false,
    standalone: false, atex: false,
    mount: JSON.stringify([extra.mounting ?? 'DIN rail']),
    remote: false,
    features: extra.features ?? null, connectTo: extra.connectTo ?? null,
    discontinued: false, channels, maxPower,
    powerDesc: extra.powerDesc ?? null, relaySpec: extra.relaySpec ?? null,
    analogType: extra.analogType ?? null, modbusType: extra.modbusType ?? null,
    subCategory: null, compatibleFamilies: '[]',
  };
}

// Helper to build an accessory product
function acc(
  name: string, code: string, price: number | null, productGroup: string,
  subCat: 'alert' | 'mounting' | 'power' | 'service' | 'spare' | 'signage',
  compat: string[],
  extra: Partial<{features:string; ip:string; voltage:string; power:string; type:string}> = {}
): SeedProduct {
  return {
    type: 'accessory', family: 'Accessory', name, code, price: price ?? 0,
    image: null,
    specs: JSON.stringify(extra),
    tier: 'standard', productGroup,
    gas: '[]', refs: '[]', apps: '[]',
    range: null, sensorTech: null, sensorLife: null,
    power: null, voltage: extra.voltage ?? null, ip: extra.ip ?? null,
    tempMin: null, tempMax: null, relay: 0,
    analog: null, modbus: false, standalone: false, atex: false,
    mount: '[]', remote: false,
    features: extra.features ?? null, connectTo: null,
    discontinued: false, channels: null, maxPower: null,
    powerDesc: null, relaySpec: null, analogType: null, modbusType: null,
    subCategory: subCat, compatibleFamilies: JSON.stringify(compat),
  };
}

export const PRODUCTS: SeedProduct[] = [
  // ════════════════════ DETECTORS ════════════════════

  // ── MIDI (GLACIAR MIDI) ──
  det('MIDI_CO2_10k','MIDI IR CO2 10000ppm','31-210-32','MIDI',['CO2'],['R744'],'IR','0-10000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall','pipe'],false,673,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','heat_pump'],
    {powerDesc:'4W max, 170mA @24VDC',relaySpec:'1A @ 24VAC/VDC',analogType:'4-20mA / 0-5V / 1-5V / 0-10V / 2-10V',modbusType:'RTU RS485 (isolated)',connectTo:'Direct (standalone) or Modbus to any RTU master',features:'Service wheel, magnetic switch, pre-cal sensor modules, LED status, Bluetooth app'}),

  det('MIDI_CO2_10k_R','MIDI Remote IR CO2','31-510-32','MIDI',['CO2'],['R744'],'IR','0-10000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,739,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Remote sensor ideal for cold rooms, ducts, Bluetooth app'}),

  det('MIDI_HFC1','MIDI SC HFC/HFO Grp1','31-220-12','MIDI',['HFC1'],_HFC1,'SC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,403,'~5y','standard','G',
    ['supermarket','cold_room','cold_storage','heat_pump'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Group 1 calibration, Bluetooth app, NOT interchangeable with Group 2'}),

  det('MIDI_HFC1_R','MIDI Remote SC Grp1','31-520-12','MIDI',['HFC1'],_HFC1,'SC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,469,'~5y','standard','G',
    ['supermarket','cold_room','cold_storage','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Group 1 remote, Bluetooth app'}),

  det('MIDI_HFC2','MIDI SC HFC/HFO Grp2','31-220-17','MIDI',['HFC2'],_HFC2,'SC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,403,'~5y','standard','G',
    ['supermarket','cold_room','cold_storage','heat_pump'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Group 2 calibration, Bluetooth app, DIFFERENT from Group 1'}),

  det('MIDI_HFC2_R','MIDI Remote SC Grp2','31-520-17','MIDI',['HFC2'],_HFC2,'SC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,469,'~5y','standard','G',
    ['supermarket','cold_room','cold_storage','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Group 2 remote, Bluetooth app'}),

  det('MIDI_NH3_100','MIDI EC NH3 100ppm','31-250-22','MIDI',['NH3'],['R717'],'EC','0-100ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,916,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'EC sensor replace every 2-3 years, NOT ATEX, Bluetooth app'}),

  det('MIDI_NH3_1000','MIDI EC NH3 1000ppm','31-250-23','MIDI',['NH3'],['R717'],'EC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,916,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Standard range for industrial NH3, Bluetooth app'}),

  det('MIDI_NH3_5000','MIDI EC NH3 5000ppm','31-250-24','MIDI',['NH3'],['R717'],'EC','0-5000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,916,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'High range NH3, Bluetooth app'}),

  det('MIDI_NH3_R','MIDI Remote EC NH3','31-550-23','MIDI',['NH3'],['R717'],'EC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,981,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Remote ideal for high-mount NH3, Bluetooth app'}),

  det('MIDI_R290','MIDI SC R290/HC 4000ppm','31-290-13','MIDI',['R290'],_HC,'SC','0-4000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,403,'~5y','standard','G',
    ['heat_pump','supermarket','cold_room'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Measures PPM not %LEL, NOT ATEX certified, Bluetooth app'}),

  det('MIDI_R290_R','MIDI Remote SC R290/HC','31-590-13','MIDI',['R290'],_HC,'SC','0-4000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,469,'~5y','standard','G',
    ['heat_pump','supermarket','cold_room','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'R290 remote, PPM not %LEL, Bluetooth app'}),

  // ── NEW MIDI variants (31-series) ──
  det('MIDI_NH3_100_R','MIDI Remote EC NH3 100ppm','31-550-22','MIDI',['NH3'],['R717'],'EC','0-100ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,981,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Remote NH3 100ppm, Bluetooth app'}),

  det('MIDI_NH3_5000_R','MIDI Remote EC NH3 5000ppm','31-550-24','MIDI',['NH3'],['R717'],'EC','0-5000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,981,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Remote NH3 5000ppm, Bluetooth app'}),

  // ── RM (Room Detectors) ──
  det('RM_HFC','RM-HFC','32-220','RM',['HFC1','HFC2'],['R32','R410A'],'SC','0-5000ppm','IP21',0,40,0.5,'12-24V',1,null,false,true,false,['wall'],false,382,'~5y','economic','A',
    ['hotel','office'],
    {powerDesc:'2W max',relaySpec:'1 alarm relay',features:'Built-in 85dB buzzer + tri-colour LED, alarm delay, IP21 only'}),

  det('RMV_HFC','RMV-HFC','32-320','RM',['HFC1','HFC2'],['R32','R410A'],'SC','0-5000ppm','IP21',0,40,0.5,'12-24V',1,null,false,true,false,['flush','surface'],false,382,'~5y','economic','A',
    ['hotel','office'],
    {powerDesc:'2W max',relaySpec:'1 alarm relay',features:'Flush-mount aesthetic for hotels, requires KAP045/KAP046 backbox'}),

  // ── X5 ──
  det('X5_NH3_100','X5 + NH3 0-100ppm','3500-0001+0002','X5',['NH3'],['R717'],'IONIC','0-100ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1830,'5y','premium','G',
    ['machinery_room','cold_storage','ice_rink','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to any PLC/controller, or standalone',features:'ATEX certified, digital display, dual sensor option, 5-year ionic NH3 sensor, non-depleting'}),

  det('X5_NH3_500','X5 + NH3 0-500ppm','3500-0001+0003','X5',['NH3'],['R717'],'IONIC','0-500ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1830,'5y','premium','G',
    ['machinery_room','cold_storage','ice_rink','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, digital display, dual sensor, ionic NH3'}),

  det('X5_NH3_1000','X5 + NH3 0-1000ppm','3500-0001+0095','X5',['NH3'],['R717'],'IONIC','0-1000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1830,'5y','premium','G',
    ['machinery_room','cold_storage','ice_rink','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, digital display, dual sensor, ionic NH3'}),

  det('X5_NH3_5000','X5 + NH3 0-5000ppm','3500-0001+0004','X5',['NH3'],['R717'],'IONIC','0-5000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1830,'5y','premium','G',
    ['machinery_room','cold_storage','ice_rink','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, digital display, dual sensor, ionic NH3'}),

  det('X5_CO2_5000','X5 + CO2 0-5000ppm','3500-0001+0005','X5',['CO2'],['R744'],'IR','0-5000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1841,'7-10y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, digital display, dual sensor'}),

  det('X5_CO2_5pct','X5 + CO2 0-5%vol','3500-0001+0006','X5',['CO2'],['R744'],'IR','0-5%vol','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1841,'7-10y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, digital display, high range CO2'}),

  det('X5_CO','X5 + CO 0-100ppm','3500-0001+0096','X5',['CO'],['CO'],'EC','0-100ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1424,'2-3y','standard','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'ATEX, parking garages, dual sensor: combine CO+NO2'}),

  det('X5_O2','X5 + O2 0-25%vol','3500-0001+0097','X5',['O2'],['O2'],'EC','0-25%vol','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1500,'2-3y','standard','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'ATEX, O2 depletion monitoring'}),

  det('X5_NO2','X5 + NO2 0-5ppm','3500-0001+0098','X5',['NO2'],['NO2'],'EC','0-5ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1809,'2-3y','standard','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'ATEX, parking/tunnels'}),

  det('X5_HFC_IRR','X5 + IRR HFC 0-2000ppm','3500-0001+IRR','X5',['HFC1','HFC2'],_ALL_HFC,'IR','0-2000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2200,'7-10y','premium','G',
    ['machinery_room','cold_storage','supermarket','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, gas-specific IR sensor, digital display'}),

  det('X5_R290','X5 + R290 SC 0-10000ppm','3500-0001+R2','X5',['R290'],_HC,'SC','0-10000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1600,'~5y','standard','G',
    ['machinery_room','heat_pump','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, digital display, SC sensor'}),

  // ── Aquis ──
  det('AQUIS500','Aquis 500 NH3 in water','35-210','AQUIS',['NH3W'],['NH3W'],'pH','0.01-9999ppm','IP65',0,50,5,'230V',0,'4-20mA',false,true,false,['pipe'],false,0,'~2y','standard','A',
    ['water_brine'],
    {powerDesc:'230V AC',analogType:'4-20mA output',connectTo:'4-20mA to PLC/BMS',features:'NH3 in water/brine monitoring, pH electrode, specify brine type'}),

  // ── X5 individual products (3500-series) ──
  // X5 base unit
  acc('X5 Base Unit (no sensor)','3500-0001',822,'G','spare',['X5'],
    {features:'X5 base unit without sensor module, requires separate sensor'}),

  // X5 sensor modules
  acc('X5 Sensor Module NH3 0-100ppm','3500-0002',1008,'G','spare',['X5'],
    {features:'X5 ionic NH3 sensor module 0-100ppm, 5-year life'}),

  acc('X5 Sensor Module NH3 0-500ppm','3500-0003',1008,'G','spare',['X5'],
    {features:'X5 ionic NH3 sensor module 0-500ppm, 5-year life'}),

  acc('X5 Sensor Module NH3 0-5000ppm','3500-0004',1008,'G','spare',['X5'],
    {features:'X5 ionic NH3 sensor module 0-5000ppm, 5-year life'}),

  acc('X5 Sensor Module CO2 0-5000ppm','3500-0005',1019,'G','spare',['X5'],
    {features:'X5 IR CO2 sensor module 0-5000ppm'}),

  acc('X5 Sensor Module CO2 0-5%vol','3500-0006',1019,'G','spare',['X5'],
    {features:'X5 IR CO2 sensor module 0-5%vol'}),

  // X5 DUAL sensor combos
  det('X5_DUAL_NH3_CO2','X5 DUAL NH3+CO2','3500-0022','X5',['NH3','CO2'],['R717','R744'],'IONIC+IR','0-100ppm NH3 + 0-5000ppm CO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1205,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, dual sensor NH3+CO2, digital display'}),

  det('X5_DUAL_CO_NO2','X5 DUAL CO+NO2','3500-0023','X5',['CO','NO2'],['CO','NO2'],'EC','0-100ppm CO + 0-5ppm NO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1424,'2-3y','premium','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'ATEX, dual sensor CO+NO2 for parking'}),

  det('X5_DUAL_NH3_O2','X5 DUAL NH3+O2','3500-0024','X5',['NH3','O2'],['R717','O2'],'IONIC+EC','0-100ppm NH3 + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1205,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, dual sensor NH3+O2'}),

  det('X5_DUAL_CO2_O2','X5 DUAL CO2+O2','3500-0025','X5',['CO2','O2'],['R744','O2'],'IR+EC','0-5000ppm CO2 + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1096,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, dual sensor CO2+O2'}),

  det('X5_DUAL_HFC_O2','X5 DUAL HFC+O2','3500-0026','X5',['HFC1','HFC2','O2'],['R404A','O2'],'IR+EC','0-2000ppm HFC + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1287,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'ATEX, dual sensor HFC+O2'}),

  // X5 accessories
  acc('X5 Weather Shield','3500-0029',104,'G','mounting',['X5'],
    {features:'Outdoor weather protection shield for X5'}),

  acc('X5 Mounting Bracket','3500-0030',77,'G','mounting',['X5'],
    {features:'Wall/pole mounting bracket for X5'}),

  acc('X5 Cable Gland','3500-0031',19,'G','mounting',['X5'],
    {features:'Cable gland for X5 wiring entry'}),

  // X5 PRE-CONFIGURED kits (3500-0032 to 0051)
  det('X5_KIT_NH3_100','X5 Kit NH3 0-100ppm','3500-0032','X5',['NH3'],['R717'],'IONIC','0-100ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'5y','premium','G',
    ['machinery_room','cold_storage','ice_rink','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured kit: X5 + NH3 100ppm sensor + accessories'}),

  det('X5_KIT_NH3_500','X5 Kit NH3 0-500ppm','3500-0033','X5',['NH3'],['R717'],'IONIC','0-500ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'5y','premium','G',
    ['machinery_room','cold_storage','ice_rink','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured kit: X5 + NH3 500ppm sensor + accessories'}),

  det('X5_KIT_NH3_1000','X5 Kit NH3 0-1000ppm','3500-0034','X5',['NH3'],['R717'],'IONIC','0-1000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'5y','premium','G',
    ['machinery_room','cold_storage','ice_rink','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured kit: X5 + NH3 1000ppm sensor + accessories'}),

  det('X5_KIT_NH3_5000','X5 Kit NH3 0-5000ppm','3500-0035','X5',['NH3'],['R717'],'IONIC','0-5000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'5y','premium','G',
    ['machinery_room','cold_storage','ice_rink','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured kit: X5 + NH3 5000ppm sensor + accessories'}),

  det('X5_KIT_CO2_5000','X5 Kit CO2 0-5000ppm','3500-0036','X5',['CO2'],['R744'],'IR','0-5000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'7-10y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured kit: X5 + CO2 5000ppm sensor + accessories'}),

  det('X5_KIT_CO2_5pct','X5 Kit CO2 0-5%vol','3500-0037','X5',['CO2'],['R744'],'IR','0-5%vol','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'7-10y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured kit: X5 + CO2 5%vol sensor + accessories'}),

  det('X5_KIT_CO','X5 Kit CO 0-100ppm','3500-0038','X5',['CO'],['CO'],'EC','0-100ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'2-3y','standard','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'Pre-configured kit: X5 + CO sensor + accessories'}),

  det('X5_KIT_O2','X5 Kit O2 0-25%vol','3500-0039','X5',['O2'],['O2'],'EC','0-25%vol','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'2-3y','standard','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'Pre-configured kit: X5 + O2 sensor + accessories'}),

  det('X5_KIT_NO2','X5 Kit NO2 0-5ppm','3500-0040','X5',['NO2'],['NO2'],'EC','0-5ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'2-3y','standard','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'Pre-configured kit: X5 + NO2 sensor + accessories'}),

  det('X5_KIT_10','X5 Kit Variant 10','3500-0041','X5',['NH3'],['R717'],'IONIC','0-100ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured X5 kit variant 10'}),

  det('X5_KIT_11','X5 Kit Variant 11','3500-0042','X5',['NH3'],['R717'],'IONIC','0-500ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured X5 kit variant 11'}),

  det('X5_KIT_12','X5 Kit Variant 12','3500-0043','X5',['NH3'],['R717'],'IONIC','0-1000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured X5 kit variant 12'}),

  det('X5_KIT_13','X5 Kit Variant 13','3500-0044','X5',['NH3'],['R717'],'IONIC','0-5000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured X5 kit variant 13'}),

  det('X5_KIT_14','X5 Kit Variant 14','3500-0045','X5',['CO2'],['R744'],'IR','0-5000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'7-10y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured X5 kit variant 14'}),

  det('X5_KIT_15','X5 Kit Variant 15','3500-0046','X5',['CO2'],['R744'],'IR','0-5%vol','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'7-10y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured X5 kit variant 15'}),

  det('X5_KIT_16','X5 Kit Variant 16','3500-0047','X5',['CO'],['CO'],'EC','0-100ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'2-3y','standard','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'Pre-configured X5 kit variant 16'}),

  det('X5_KIT_17','X5 Kit Variant 17','3500-0048','X5',['O2'],['O2'],'EC','0-25%vol','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'2-3y','standard','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'Pre-configured X5 kit variant 17'}),

  det('X5_KIT_18','X5 Kit Variant 18','3500-0049','X5',['NO2'],['NO2'],'EC','0-5ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'2-3y','standard','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'Pre-configured X5 kit variant 18'}),

  det('X5_KIT_19','X5 Kit Variant 19','3500-0050','X5',['HFC1','HFC2'],_ALL_HFC,'IR','0-2000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'7-10y','premium','G',
    ['machinery_room','cold_storage','supermarket','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured X5 kit variant 19'}),

  det('X5_KIT_20','X5 Kit Variant 20','3500-0051','X5',['R290'],_HC,'SC','0-10000ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2339,'~5y','standard','G',
    ['machinery_room','heat_pump','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Pre-configured X5 kit variant 20'}),

  // X5 DUAL PRE-CONFIGURED kits (3500-0065 to 0084)
  det('X5_DKIT_01','X5 DUAL Kit NH3+CO2 v1','3500-0065','X5',['NH3','CO2'],['R717','R744'],'IONIC+IR','0-100ppm NH3 + 0-5000ppm CO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit: NH3+CO2 variant 1'}),

  det('X5_DKIT_02','X5 DUAL Kit NH3+CO2 v2','3500-0066','X5',['NH3','CO2'],['R717','R744'],'IONIC+IR','0-500ppm NH3 + 0-5000ppm CO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit: NH3+CO2 variant 2'}),

  det('X5_DKIT_03','X5 DUAL Kit NH3+O2 v1','3500-0067','X5',['NH3','O2'],['R717','O2'],'IONIC+EC','0-100ppm NH3 + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit: NH3+O2 variant 1'}),

  det('X5_DKIT_04','X5 DUAL Kit NH3+O2 v2','3500-0068','X5',['NH3','O2'],['R717','O2'],'IONIC+EC','0-500ppm NH3 + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit: NH3+O2 variant 2'}),

  det('X5_DKIT_05','X5 DUAL Kit CO+NO2 v1','3500-0069','X5',['CO','NO2'],['CO','NO2'],'EC','0-100ppm CO + 0-5ppm NO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'2-3y','premium','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'DUAL pre-configured kit: CO+NO2 variant 1'}),

  det('X5_DKIT_06','X5 DUAL Kit CO+NO2 v2','3500-0070','X5',['CO','NO2'],['CO','NO2'],'EC','0-100ppm CO + 0-5ppm NO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'2-3y','premium','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'DUAL pre-configured kit: CO+NO2 variant 2'}),

  det('X5_DKIT_07','X5 DUAL Kit CO2+O2 v1','3500-0071','X5',['CO2','O2'],['R744','O2'],'IR+EC','0-5000ppm CO2 + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit: CO2+O2 variant 1'}),

  det('X5_DKIT_08','X5 DUAL Kit CO2+O2 v2','3500-0072','X5',['CO2','O2'],['R744','O2'],'IR+EC','0-5%vol CO2 + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit: CO2+O2 variant 2'}),

  det('X5_DKIT_09','X5 DUAL Kit HFC+O2','3500-0073','X5',['HFC1','HFC2','O2'],['R404A','O2'],'IR+EC','0-2000ppm HFC + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit: HFC+O2'}),

  det('X5_DKIT_10','X5 DUAL Kit Variant 10','3500-0074','X5',['NH3','CO2'],['R717','R744'],'IONIC+IR','0-1000ppm NH3 + 0-5000ppm CO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit variant 10'}),

  det('X5_DKIT_11','X5 DUAL Kit Variant 11','3500-0075','X5',['NH3','CO2'],['R717','R744'],'IONIC+IR','0-5000ppm NH3 + 0-5000ppm CO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit variant 11'}),

  det('X5_DKIT_12','X5 DUAL Kit Variant 12','3500-0076','X5',['NH3','O2'],['R717','O2'],'IONIC+EC','0-1000ppm NH3 + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit variant 12'}),

  det('X5_DKIT_13','X5 DUAL Kit Variant 13','3500-0077','X5',['NH3','O2'],['R717','O2'],'IONIC+EC','0-5000ppm NH3 + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit variant 13'}),

  det('X5_DKIT_14','X5 DUAL Kit Variant 14','3500-0078','X5',['CO2','O2'],['R744','O2'],'IR+EC','0-5000ppm CO2 + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit variant 14'}),

  det('X5_DKIT_15','X5 DUAL Kit Variant 15','3500-0079','X5',['CO2','O2'],['R744','O2'],'IR+EC','0-5%vol CO2 + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit variant 15'}),

  det('X5_DKIT_16','X5 DUAL Kit Variant 16','3500-0080','X5',['HFC1','HFC2','O2'],['R404A','O2'],'IR+EC','0-2000ppm HFC + 0-25%vol O2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit variant 16'}),

  det('X5_DKIT_17','X5 DUAL Kit Variant 17','3500-0081','X5',['CO','NO2'],['CO','NO2'],'EC','0-100ppm CO + 0-5ppm NO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'2-3y','premium','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'DUAL pre-configured kit variant 17'}),

  det('X5_DKIT_18','X5 DUAL Kit Variant 18','3500-0082','X5',['CO','NO2'],['CO','NO2'],'EC','0-300ppm CO + 0-20ppm NO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'2-3y','premium','G',
    ['parking'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/BMS',features:'DUAL pre-configured kit variant 18'}),

  det('X5_DKIT_19','X5 DUAL Kit Variant 19','3500-0083','X5',['NH3','CO2'],['R717','R744'],'IONIC+IR','0-100ppm NH3 + 0-5%vol CO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit variant 19'}),

  det('X5_DKIT_20','X5 DUAL Kit Variant 20','3500-0084','X5',['NH3','CO2'],['R717','R744'],'IONIC+IR','0-500ppm NH3 + 0-5%vol CO2','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,2500,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'DUAL pre-configured kit variant 20'}),

  // X5 spare parts & accessories (3500-0085 to 0094)
  acc('X5 Sensor Guard','3500-0085',186,'G','spare',['X5'],
    {features:'Protective guard for X5 sensor module'}),

  acc('X5 Display Module','3500-0086',383,'G','spare',['X5'],
    {features:'Replacement display module for X5'}),

  acc('X5 Mounting Plate','3500-0087',77,'G','spare',['X5'],
    {features:'Replacement mounting plate for X5'}),

  acc('X5 Terminal Block','3500-0088',88,'G','spare',['X5'],
    {features:'Replacement terminal block for X5'}),

  acc('X5 Gasket Set','3500-0089',11,'G','spare',['X5'],
    {features:'Replacement gasket set for X5 enclosure'}),

  acc('X5 PCB Board','3500-0090',98,'G','spare',['X5'],
    {features:'Replacement main PCB for X5'}),

  acc('X5 Relay Module','3500-0091',439,'G','spare',['X5'],
    {features:'Replacement relay output module for X5'}),

  acc('X5 Analog Module','3500-0092',274,'G','spare',['X5'],
    {features:'Replacement 4-20mA analog output module for X5'}),

  acc('X5 Communication Module','3500-0093',493,'G','spare',['X5'],
    {features:'Replacement communication module for X5'}),

  acc('X5 Calibration Kit','3500-0094',657,'G','spare',['X5'],
    {features:'Calibration kit for X5 detectors'}),

  // X5 additional individual sensors and expansion modules (3500-0095 to 0118)
  acc('X5 Sensor Module NH3 0-1000ppm','3500-0095',1008,'G','spare',['X5'],
    {features:'X5 ionic NH3 sensor module 0-1000ppm'}),

  acc('X5 Sensor Module CO 0-100ppm','3500-0096',602,'G','spare',['X5'],
    {features:'X5 EC CO sensor module 0-100ppm'}),

  acc('X5 Sensor Module O2 0-25%vol','3500-0097',876,'G','spare',['X5'],
    {features:'X5 EC O2 sensor module 0-25%vol'}),

  acc('X5 Sensor Module NO2 0-5ppm','3500-0098',987,'G','spare',['X5'],
    {features:'X5 EC NO2 sensor module 0-5ppm'}),

  acc('X5 Sensor Module O2 variant','3500-0099',876,'G','spare',['X5'],
    {features:'X5 EC O2 sensor module variant'}),

  acc('X5 Sensor Module CO variant','3500-0100',931,'G','spare',['X5'],
    {features:'X5 EC CO sensor module variant'}),

  acc('X5 Sensor Module NO2 variant','3500-0101',1041,'G','spare',['X5'],
    {features:'X5 EC NO2 sensor module variant'}),

  acc('X5 Expansion Module IRR HFC','3500-0103',1338,'G','spare',['X5'],
    {features:'X5 IR refrigerant expansion sensor module'}),

  acc('X5 Expansion Module CO spare','3500-0104',602,'G','spare',['X5'],
    {features:'X5 EC CO expansion module spare'}),

  acc('X5 Sensor Cover','3500-0105',98,'G','spare',['X5'],
    {features:'Replacement sensor cover for X5'}),

  acc('X5 Cable Entry Kit','3500-0106',65,'G','spare',['X5'],
    {features:'Cable entry accessory kit for X5'}),

  acc('X5 Dual Sensor Module HFC+O2','3500-0109',1287,'G','spare',['X5'],
    {features:'X5 dual sensor module HFC+O2 IR+EC'}),

  acc('X5 Analog Output Expansion','3500-0110',1085,'G','spare',['X5'],
    {features:'Additional 4-20mA analog output expansion for X5'}),

  det('X5_KIT_PRECONF','X5 Pre-configured Advanced','3500-0115','X5',['NH3'],['R717'],'IONIC','0-100ppm','IP66',-20,55,2,'18-32V',3,'4-20mA x2',false,true,true,['wall','pole'],false,1701,'5y','premium','G',
    ['machinery_room','cold_storage','atex_zone'],
    {relaySpec:'2 alarm + 1 fault relay',analogType:'2x independent 4-20mA',connectTo:'4-20mA to PLC/controller',features:'Advanced pre-configured X5 kit'}),

  acc('X5 Modbus Expansion Module','3500-0117',1277,'G','spare',['X5'],
    {features:'Modbus RTU communication expansion module for X5'}),

  acc('X5 Replacement Sensor HC','3500-0118',161,'G','spare',['X5'],
    {features:'X5 SC HC replacement sensor module'}),

  // ════════════════════ CONTROLLERS ════════════════════

  ctrl('MPU2C','MPU2C','20-310',2,10,'24V AC/DC','IP20',1168,'standard','A',
    {relayOutputs:4,relaySpec:'2x alarm per channel (SPDT 5A/250VAC) + 1x common fault',analogType:'2x 4-20mA retransmission',rs485:true,display:true,mounting:'DIN rail or wall',features:'2-channel controller, LCD display, Modbus RTU slave for BMS, 4-20mA retransmission'}),

  ctrl('MPU4C','MPU4C','20-300',4,10,'24V AC/DC','IP20',1598,'standard','A',
    {relayOutputs:8,relaySpec:'2x alarm per channel + 1x common fault',analogType:'4x 4-20mA retransmission',rs485:true,display:true,mounting:'DIN rail or wall',features:'4-channel controller, most popular MPU, LCD display, Modbus RTU slave'}),

  ctrl('MPU6C','MPU6C','20-305',6,10,'24V AC/DC','IP20',2004,'standard','A',
    {relayOutputs:12,relaySpec:'2x alarm per channel + 1x common fault',analogType:'6x 4-20mA retransmission',rs485:true,display:true,mounting:'DIN rail or wall',features:'6-channel controller, largest MPU, LCD display, Modbus RTU slave'}),

  ctrl('SPU24','SPU24','20-350',1,10,'24V AC/DC','IP20',424,'standard','A',
    {relayOutputs:2,relaySpec:'1x alarm + 1x fault (SPDT 5A/250VAC)',analogType:'1x 4-20mA',rs485:false,display:false,mounting:'DIN rail or wall',features:'Single-point monitoring, powers sensor head, status LEDs'}),

  ctrl('SPU230','SPU230','20-355',1,10,'230V AC','IP20',455,'standard','A',
    {relayOutputs:2,relaySpec:'1x alarm + 1x fault (SPDT 5A/250VAC)',analogType:'1x 4-20mA',rs485:false,display:false,mounting:'DIN rail or wall',features:'230V version of SPU24, single-point monitoring'}),

  ctrl('SPLS24','SPLS24','20-360',1,10,'24V AC/DC','IP20',546,'standard','A',
    {relayOutputs:2,relaySpec:'1x alarm + 1x fault (SPDT 5A/250VAC)',analogType:'1x 4-20mA',rs485:false,display:false,mounting:'Wall',features:'SPU with built-in audio-visual alarm (high-intensity LED + 85dB siren)'}),

  ctrl('SPLS230','SPLS230','20-365',1,10,'230V AC','IP20',589,'standard','A',
    {relayOutputs:2,relaySpec:'1x alarm + 1x fault (SPDT 5A/250VAC)',analogType:'1x 4-20mA',rs485:false,display:false,mounting:'Wall',features:'230V SPLS, built-in audio-visual alarm'}),

  ctrl('LAN63_PKT','LAN63-PKT','81-100',12,999,'230V','IP32',730,'standard','A',
    {relayOutputs:2,features:'12 relay inputs for RM detectors, wall mount package'}),

  ctrl('LAN63_64_PKT','LAN63/64-PKT','81-200',24,999,'230V','IP32',1132,'standard','A',
    {relayOutputs:4,features:'24 relay inputs, master + slave package'}),

  ctrl('LAN63','LAN63 Master','81-110',12,999,'24V','DIN',561,'standard','A',
    {relayOutputs:2,features:'DIN rail master, 12 relay inputs'}),

  ctrl('LAN64','LAN64 Slave','81-120',12,999,'24V','DIN',551,'standard','A',
    {relayOutputs:2,features:'DIN rail slave, 12 relay inputs'}),

  // ── NEW UNIT Controllers (21-series) ──
  ctrl('UNIT_3612','UNIT 3612','21-3612',12,999,'24V','IP20',1043,'standard','A',
    {relayOutputs:6,rs485:true,display:true,mounting:'DIN rail',features:'UNIT controller panel, 12 zones, Modbus RTU, multi-zone monitoring'}),

  ctrl('UNIT_3617','UNIT 3617','21-3617',17,999,'24V','IP20',1055,'standard','A',
    {relayOutputs:8,rs485:true,display:true,mounting:'DIN rail',features:'UNIT controller panel, 17 zones, Modbus RTU, multi-zone monitoring'}),

  ctrl('UNIT_3620','UNIT 3620','21-3620',20,999,'24V','IP20',887,'standard','A',
    {relayOutputs:4,rs485:true,display:true,mounting:'DIN rail',features:'UNIT controller panel, 20 zones, Modbus RTU'}),

  ctrl('UNIT_3620_SE','UNIT 3620-SE','21-3620-SE',20,999,'24V','IP20',887,'standard','A',
    {relayOutputs:4,rs485:true,display:true,mounting:'DIN rail',features:'UNIT 3620 Special Edition, 20 zones'}),

  ctrl('UNIT_3625','UNIT 3625','21-3625',25,999,'24V','IP20',901,'standard','A',
    {relayOutputs:6,rs485:true,display:true,mounting:'DIN rail',features:'UNIT controller panel, 25 zones, Modbus RTU'}),

  ctrl('UNIT_3625_SE','UNIT 3625-SE','21-3625-SE',25,999,'24V','IP20',901,'standard','A',
    {relayOutputs:6,rs485:true,display:true,mounting:'DIN rail',features:'UNIT 3625 Special Edition, 25 zones'}),

  ctrl('UNIT_3652','UNIT 3652','21-3652',52,999,'24V','IP20',887,'standard','A',
    {relayOutputs:4,rs485:true,display:true,mounting:'DIN rail',features:'UNIT controller panel, 52 zones, Modbus RTU'}),

  ctrl('UNIT_3657','UNIT 3657','21-3657',57,999,'24V','IP20',901,'standard','A',
    {relayOutputs:6,rs485:true,display:true,mounting:'DIN rail',features:'UNIT controller panel, 57 zones, Modbus RTU'}),

  // ── NEW LAN controller (81-series) ──
  ctrl('LAN63_64','LAN63/64 Combined','81-130',24,999,'24V','DIN',1064,'standard','A',
    {relayOutputs:4,features:'Combined LAN63/64 master+slave on DIN rail, 24 relay inputs'}),

  // ── NEW Advanced Controller (6300-series) ──
  ctrl('SCU3600','SCU3600 Advanced Controller','6300-0001',64,999,'24V','IP20',2996,'premium','G',
    {relayOutputs:16,rs485:true,display:true,mounting:'DIN rail or wall',features:'Advanced controller, up to 64 zones, touchscreen, Ethernet, Modbus TCP/RTU, BACnet support'}),

  // ════════════════════ ACCESSORIES (Alerts) ════════════════════

  // ════════════════════ ALERT ACCESSORIES ════════════════════
  acc('FL-RL-R Combined light+siren Red','40-440',232,'A','alert',['ALL'],
    {ip:'IP65',voltage:'18-28V DC',features:'95dB, Red, Combined flash+siren'}),

  acc('FL-OL-V-SEP Combined light+siren Orange','40-442',232,'A','alert',['ALL'],
    {ip:'IP65',voltage:'18-28V DC',features:'95dB, Orange, Combined flash+siren (pre-alarm)'}),

  acc('FL-BL-V-SEP Combined light+siren Blue','40-441',232,'A','alert',['ALL'],
    {ip:'IP65',voltage:'18-28V DC',features:'95dB, Blue, Combined flash+siren'}),

  acc('1992-R-LP Siren','40-410',90,'A','alert',['ALL'],
    {ip:'IP54',voltage:'9-28V DC',features:'95dB, Audible alarm only'}),

  acc('BE-R-24VDC Flashing light Red','40-4022',101,'A','alert',['ALL'],
    {ip:'IP54',voltage:'9-60V DC',features:'Red, Visual alarm only'}),

  acc('BE-A-24VDC Flashing light Orange','40-4021',101,'A','alert',['ALL'],
    {ip:'IP54',voltage:'9-60V DC',features:'Orange, Visual pre-alarm'}),

  acc('BE-BL-24VDC Flashing light Blue','40-4023',101,'A','alert',['ALL'],
    {ip:'IP54',voltage:'9-60V DC',features:'Blue, Visual alarm'}),

  acc('LED sign Refrigerant Alarm','6100-0002',0,'A','signage',['ALL'],
    {ip:'IP54',voltage:'230V/24V',features:'Visual warning sign'}),

  // ── NEW Alert accessories (40-series) ──
  acc('Alarm Panel 40-221','40-221',761,'A','alert',['ALL'],
    {ip:'IP54',voltage:'24V DC',features:'Multi-zone alarm panel with LED indicators and buzzer'}),

  acc('SOCK-H-R-ND High socket No Display','40-420-ND',78,'A','mounting',['ALL'],
    {voltage:'230V',features:'High socket no display variant'}),

  // ════════════════════ MOUNTING ACCESSORIES ════════════════════
  acc('SOCK-H-R High socket IP65 Red','40-415',19,'A','mounting',['ALL'],
    {ip:'IP65',voltage:'24V',features:'Exterior mounting socket'}),

  acc('SOCK-H-R-230 High socket 230V','40-420',78,'A','mounting',['ALL'],
    {voltage:'230V',features:'230V high socket'}),

  acc('KAP045 Back-box flush mount','KAP045',2,'A','mounting',['RM'],
    {features:'Flush mount back-box for RM/RMV detectors'}),

  acc('KAP046 Back-box surface mount','KAP046',4,'A','mounting',['RM'],
    {features:'Surface mount back-box for RM/RMV detectors'}),

  acc('Mounting bracket 40-901','40-901',55,'A','mounting',['ALL'],
    {features:'Universal mounting bracket'}),

  acc('Mounting bracket 40-902','40-902',49,'A','mounting',['ALL'],
    {features:'Heavy-duty mounting bracket'}),

  // ════════════════════ POWER ACCESSORIES ════════════════════
  acc('PSU-24-480 Power Supply','4000-0001',479,'A','power',['ALL'],
    {voltage:'100-240 VAC input, 24VDC 20A output',features:'480W DIN rail power supply for multi-detector installations'}),

  acc('Power Adapter 230V-24V','4000-0002',99,'A','power',['MIDI'],
    {voltage:'85-305 VAC input, 24VDC 1.3A output',features:'31.2W, compatible with GLACIAR MIDI only'}),

  // ════════════════════ NETWORK / BMS INTERFACES (5000-series) ════════════════════
  acc('MODBUS Gateway','5000-0001',247,'G','spare',['ALL'],
    {voltage:'24V DC',features:'Modbus RTU to TCP gateway, connects SAMON detectors to BMS via Ethernet'}),

  acc('Ethernet Gateway','5000-0002',927,'G','spare',['ALL'],
    {voltage:'24V DC',features:'Ethernet gateway for remote monitoring and cloud connectivity'}),

  acc('BACnet Interface','5000-0003',612,'G','spare',['ALL'],
    {voltage:'24V DC',features:'BACnet/IP interface for BMS integration'}),

  acc('LON Interface','5000-0004',603,'G','spare',['ALL'],
    {voltage:'24V DC',features:'LON/FTT-10 interface for building automation'}),

  acc('OPC Server License','5000-0005',519,'G','spare',['ALL'],
    {features:'OPC UA/DA server license for SCADA integration'}),

  // ════════════════════ SOFTWARE (5001-series) ════════════════════
  acc('GasView Software License','5001-0001',155,'G','spare',['ALL'],
    {features:'PC-based monitoring software for SAMON gas detection systems'}),

  // ════════════════════ SERVICE TOOLS ════════════════════
  acc('DT300 Cable','60-120',114,'A','service',['MIDI','MP','GS','GR','GK','GSH','GSLS','GSMB','GXR'],
    {features:'Connection cable for DT300 diagnostic tool'}),

  acc('DT300 Diagnostic Tool','60-130',589,'A','service',['MIDI','MP','GS','GR','GK','GSH','GSLS','GSMB','GXR'],
    {features:'Field diagnostic tool for G-Series and MP-Series detectors'}),

  acc('SM300-HC Calibration gas for DT300','60-132',277,'A','service',['MIDI','MP','GS','GR','GK','GSH','GSLS','GSMB','GXR'],
    {features:'HC calibration gas module for DT300'}),

  acc('SM300-CO2 Calibration gas for DT300','60-133',277,'A','service',['MIDI','MP','GS','GR','GK','GSH','GSLS','GSMB','GXR'],
    {features:'CO2 calibration gas module for DT300'}),

  acc('SM300-HFC Calibration gas for DT300','60-134',277,'A','service',['MIDI','MP','GS','GR','GK','GSH','GSLS','GSMB','GXR'],
    {features:'HFC calibration gas module for DT300'}),

  acc('SM300-NH3 Calibration gas for DT300','60-136',277,'A','service',['MIDI','MP','GS','GR','GK','GSH','GSLS','GSMB','GXR'],
    {features:'NH3 calibration gas module for DT300'}),

  acc('SM300-R290 Calibration gas for DT300','60-137',277,'A','service',['MIDI','MP','GS','GR','GK','GSH','GSLS','GSMB','GXR'],
    {features:'R290 calibration gas module for DT300'}),

  acc('Calibration gas adapter','60-150',277,'A','service',['MIDI','MP','GS','GR','GK','GSH','GSLS','GSMB','GXR'],
    {features:'Universal calibration gas adapter'}),

  acc('Calibration Adapter v2.0','62-9011',0,'A','service',['MIDI'],
    {features:'Calibration adapter for GLACIAR MIDI'}),

  // ════════════════════ CALIBRATION GAS BOTTLES (61-series) ════════════════════
  acc('Cal Gas Bottle R404A 230V','61-2030',500,'A','service',['ALL'],
    {voltage:'230V',features:'Calibration gas bottle R404A, 230V heated regulator'}),

  acc('Cal Gas Bottle R404A 110V','61-2030-110',643,'A','service',['ALL'],
    {voltage:'110V',features:'Calibration gas bottle R404A, 110V heated regulator'}),

  acc('Cal Gas Bottle R134a 230V','61-2031',500,'A','service',['ALL'],
    {voltage:'230V',features:'Calibration gas bottle R134a, 230V heated regulator'}),

  acc('Cal Gas Bottle R134a 110V','61-2031-110',643,'A','service',['ALL'],
    {voltage:'110V',features:'Calibration gas bottle R134a, 110V heated regulator'}),

  acc('Cal Gas Bottle R32 230V','61-2032',500,'A','service',['ALL'],
    {voltage:'230V',features:'Calibration gas bottle R32, 230V heated regulator'}),

  acc('Cal Gas Bottle R32 110V','61-2032-110',643,'A','service',['ALL'],
    {voltage:'110V',features:'Calibration gas bottle R32, 110V heated regulator'}),

  acc('Cal Gas Bottle R410A 230V','61-2033',500,'A','service',['ALL'],
    {voltage:'230V',features:'Calibration gas bottle R410A, 230V heated regulator'}),

  acc('Cal Gas Bottle R410A 110V','61-2033-110',643,'A','service',['ALL'],
    {voltage:'110V',features:'Calibration gas bottle R410A, 110V heated regulator'}),

  acc('Cal Gas Bottle NH3 50ppm','61-2041',379,'A','service',['ALL'],
    {features:'Calibration gas bottle NH3 50ppm'}),

  acc('Cal Gas Bottle NH3 50ppm 110V','61-2041-110',500,'A','service',['ALL'],
    {voltage:'110V',features:'Calibration gas bottle NH3 50ppm, 110V'}),

  acc('Cal Gas Bottle NH3 500ppm','61-2042',379,'A','service',['ALL'],
    {features:'Calibration gas bottle NH3 500ppm'}),

  acc('Cal Gas Bottle NH3 2500ppm','61-2043',679,'A','service',['ALL'],
    {features:'Calibration gas bottle NH3 2500ppm'}),

  acc('Cal Gas Bottle NH3 5000ppm','61-2044',679,'A','service',['ALL'],
    {features:'Calibration gas bottle NH3 5000ppm'}),

  acc('Cal Gas Bottle R290 230V','61-2046',379,'A','service',['ALL'],
    {voltage:'230V',features:'Calibration gas bottle R290/propane'}),

  acc('Cal Gas Bottle R290 110V','61-2046-110',500,'A','service',['ALL'],
    {voltage:'110V',features:'Calibration gas bottle R290/propane, 110V'}),

  acc('Cal Gas Bottle CO2 230V','61-2047',379,'A','service',['ALL'],
    {voltage:'230V',features:'Calibration gas bottle CO2'}),

  acc('Cal Gas Bottle CO2 110V','61-2047-110',500,'A','service',['ALL'],
    {voltage:'110V',features:'Calibration gas bottle CO2, 110V'}),

  acc('Cal Gas Bottle CO 230V','61-2051',379,'A','service',['ALL'],
    {voltage:'230V',features:'Calibration gas bottle CO'}),

  acc('Cal Gas Bottle CO 110V','61-2051-110',500,'A','service',['ALL'],
    {voltage:'110V',features:'Calibration gas bottle CO, 110V'}),

  acc('Cal Gas Bottle NO2 230V','61-2063',379,'A','service',['ALL'],
    {voltage:'230V',features:'Calibration gas bottle NO2'}),

  acc('Cal Gas Bottle NO2 110V','61-2063-110',500,'A','service',['ALL'],
    {voltage:'110V',features:'Calibration gas bottle NO2, 110V'}),

  acc('Cal Gas Bottle R1234yf 110V','61-2070-110',643,'A','service',['ALL'],
    {voltage:'110V',features:'Calibration gas bottle R1234yf, 110V'}),

  acc('Cal Gas Regulator Heated 230V','61-9013',554,'A','service',['ALL'],
    {voltage:'230V',features:'Heated regulator for calibration gas bottles, 230V'}),

  acc('Cal Gas Regulator Standard','61-9015',348,'A','service',['ALL'],
    {features:'Standard regulator for calibration gas bottles'}),

  acc('Cal Gas Regulator Flow Meter','61-9030',286,'A','service',['ALL'],
    {features:'Flow meter regulator for calibration gas, adjustable flow'}),

  acc('Cal Gas Tubing Kit','61-9040',104,'A','service',['ALL'],
    {features:'Tubing and fittings kit for calibration gas delivery'}),

  // ════════════════════ SPARE PARTS (62-series) ════════════════════
  acc('Spare fuse set','62-9022',16,'A','spare',['ALL'],
    {features:'Replacement fuse set for controllers'}),

  acc('Spare relay module','62-9031',32,'A','spare',['ALL'],
    {features:'Replacement relay module for MPU/SPU controllers'}),

  acc('Spare power supply board','62-9041',147,'A','spare',['ALL'],
    {features:'Replacement power supply board'}),

  acc('Spare terminal strip','62-9051',26,'A','spare',['ALL'],
    {features:'Replacement terminal strip for controllers'}),

  // ════════════════════ LABELS / SMALL ACCESSORIES ════════════════════
  acc('Label DEL659 Refrigerant Warning','DEL659',4,'A','signage',['ALL'],
    {features:'Warning label for refrigerant areas'}),

  acc('Label DEL660 Gas Detection','DEL660',3,'A','signage',['ALL'],
    {features:'Gas detection system label'}),

  // ════════════════════ MIDI REPLACEMENT SENSORS (SEN-series) ════════════════════
  acc('SEN-41032 MIDI IR CO2 Sensor','SEN-41032',426,'G','spare',['MIDI'],
    {features:'Replacement IR CO2 sensor module for MIDI, 0-10000ppm'}),

  acc('SEN-42012 MIDI SC HFC Grp1 Sensor','SEN-42012',161,'G','spare',['MIDI'],
    {features:'Replacement SC HFC Group 1 sensor for MIDI'}),

  acc('SEN-42017 MIDI SC HFC Grp2 Sensor','SEN-42017',161,'G','spare',['MIDI'],
    {features:'Replacement SC HFC Group 2 sensor for MIDI'}),

  acc('SEN-45022 MIDI EC NH3 100ppm Sensor','SEN-45022',665,'G','spare',['MIDI'],
    {features:'Replacement EC NH3 sensor 0-100ppm for MIDI'}),

  acc('SEN-45023 MIDI EC NH3 1000ppm Sensor','SEN-45023',665,'G','spare',['MIDI'],
    {features:'Replacement EC NH3 sensor 0-1000ppm for MIDI'}),

  acc('SEN-45024 MIDI EC NH3 5000ppm Sensor','SEN-45024',665,'G','spare',['MIDI'],
    {features:'Replacement EC NH3 sensor 0-5000ppm for MIDI'}),

  acc('SEN-49013 MIDI SC HC Sensor','SEN-49013',161,'G','spare',['MIDI'],
    {features:'Replacement SC HC/R290 sensor for MIDI'}),

  // ════════════════════ G-SERIES REPLACEMENT SENSORS (SEN-series) ════════════════════
  acc('SEN002 G-Series SC HFC Sensor A','SEN002',165,'A','spare',['GS','GR','GK','GSR','GSLS'],
    {features:'Replacement SC sensor for G-Series HFC(A) detectors'}),

  acc('SEN003 G-Series SC HFC Sensor B','SEN003',165,'A','spare',['GS','GR','GK','GSR','GSLS'],
    {features:'Replacement SC sensor for G-Series HFC(B) detectors'}),

  acc('SEN004 G-Series SC HC Sensor','SEN004',165,'A','spare',['GS','GR','GK','GSR','GSLS'],
    {features:'Replacement SC sensor for G-Series HC/propane detectors'}),

  acc('SEN006 G-Series SC Sensor Alt','SEN006',165,'A','spare',['GS','GR','GK','GSR','GSLS'],
    {features:'Alternative replacement SC sensor for G-Series'}),

  acc('SEN015 G-Series IR CO2 Sensor','SEN015',770,'A','spare',['GSH','GSLS','GSMB'],
    {features:'Replacement IR CO2 sensor for G-Series CO2 detectors'}),

  acc('SEN016 G-Series IR CO2 Sensor v2','SEN016',770,'A','spare',['GSH','GSLS','GSMB'],
    {features:'Replacement IR CO2 sensor v2 for G-Series'}),

  acc('SEN017 G-Series IR CO2 Sensor SelfSense','SEN017',770,'A','spare',['GSH','GSLS','GSMB'],
    {features:'SelfSense IR CO2 sensor for G-Series'}),

  acc('SEN018 G-Series IR CO2 Sensor SelfSense v2','SEN018',770,'A','spare',['GSH','GSLS','GSMB'],
    {features:'SelfSense IR CO2 sensor v2 for G-Series'}),

  acc('SEN019 G-Series SC Sensor SelfSense HFC','SEN019',165,'A','spare',['GS','GR','GK','GSR','GSLS'],
    {features:'SelfSense SC HFC sensor for G-Series'}),

  acc('SEN027 G-Series SC Sensor SelfSense HC','SEN027',165,'A','spare',['GS','GR','GK','GSR','GSLS'],
    {features:'SelfSense SC HC sensor for G-Series'}),

  // ════════════════════ TR/MP REPLACEMENT SENSORS (SEN-series) ════════════════════
  acc('SEN113 TR SC HFC Sensor A','SEN113',351,'A','spare',['TR'],
    {features:'Replacement SC HFC(A) sensor for TR transmitters'}),

  acc('SEN1134 TR SC HFC Sensor A SelfSense','SEN1134',353,'A','spare',['TR'],
    {features:'SelfSense SC HFC(A) sensor for TR transmitters'}),

  acc('SEN114 TR SC HFC Sensor B','SEN114',351,'A','spare',['TR'],
    {features:'Replacement SC HFC(B) sensor for TR transmitters'}),

  acc('SEN1144 TR SC HFC Sensor B SelfSense','SEN1144',353,'A','spare',['TR'],
    {features:'SelfSense SC HFC(B) sensor for TR transmitters'}),

  acc('SEN115 TR EC NH3 Sensor','SEN115',439,'A','spare',['TR'],
    {features:'Replacement EC NH3 sensor for TR transmitters'}),

  acc('SEN203 MP SC HFC Sensor','SEN203',229,'A','spare',['MP'],
    {features:'Replacement SC HFC sensor for MP sensor heads'}),

  acc('SEN204 MP SC HC Sensor','SEN204',229,'A','spare',['MP'],
    {features:'Replacement SC HC sensor for MP sensor heads'}),

  acc('SEN210 MP IR CO2 Sensor','SEN210',297,'A','spare',['MP'],
    {features:'Replacement IR CO2 sensor for MPS sensor heads'}),

  acc('SEN212 MP IR CO2 SelfSense Sensor','SEN212',450,'A','spare',['MP'],
    {features:'SelfSense IR CO2 sensor for MPS sensor heads'}),

  acc('SEN219 MP SC SelfSense Sensor','SEN219',229,'A','spare',['MP'],
    {features:'SelfSense SC sensor for MP sensor heads'}),

  // ════════════════════ ATEX REPLACEMENT SENSORS (SEX-series) ════════════════════
  acc('SEX003 GEX ATEX SC HFC Sensor','SEX003',472,'A','spare',['GEX'],
    {features:'ATEX-rated replacement SC HFC sensor for GEX detectors'}),

  acc('SEX006 GEX ATEX SC HC Sensor','SEX006',472,'A','spare',['GEX'],
    {features:'ATEX-rated replacement SC HC sensor for GEX detectors'}),

  acc('SEX013 GXR ATEX SC HFC Sensor','SEX013',472,'A','spare',['GXR'],
    {features:'ATEX-rated replacement SC HFC sensor for GXR detectors'}),

  acc('SEX016 GXR ATEX SC HC Sensor','SEX016',472,'A','spare',['GXR'],
    {features:'ATEX-rated replacement SC HC sensor for GXR detectors'}),

  acc('SEX018 GEX ATEX EC NH3 Sensor','SEX018',472,'A','spare',['GEX'],
    {features:'ATEX-rated replacement EC NH3 sensor for GEX detectors'}),

  acc('SEX019 GEX ATEX IR CO2 Sensor','SEX019',472,'A','spare',['GEX'],
    {features:'ATEX-rated replacement IR CO2 sensor for GEX detectors'}),
];
