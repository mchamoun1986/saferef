/**
 * V5 Product Catalog — extracted from simulator.html
 * Each entry maps to the enriched Prisma Product model.
 */

// Refrigerant group lists (matching simulator)
const _HFC1 = ['R32','R407A','R407C','R407F','R410A','R448A','R449A','R452A','R452B','R454A','R454B','R454C','R455A','R464A','R465A','R466A','R468A','R507A'];
const _HFC2 = ['R134a','R404A','R450A','R513A','R1234yf','R1234ze','R1233zd'];
const _ALL_HFC = [..._HFC1, ..._HFC2];
const _HC = ['R290','R50','R600a','R1150','R1270'];

export const DISCONTINUED_CODES: string[] = [
  '20-310',     // MPU2C
  '20-300',     // MPU4C
  '20-305',     // MPU6C
  '20-350',     // SPU24
  '20-355',     // SPU230
  '20-360',     // SPLS24
  '20-365',     // SPLS230
  '21-3612',    // UNIT SPLS24-CO2-10000-KIT
  '21-3617',    // UNIT SPLS230-CO2-10000-KIT
  '21-3620',    // UNIT SPLS24-HFC-4000-KIT
  '21-3620-SE', // UNIT SPLS24-HFC-4000-KIT SELF SENSE
  '21-3625',    // UNIT SPLS230-HFC-4000-KIT
  '21-3625-SE', // UNIT SPLS230-HFC-4000-KIT SELF SENSE
  '21-3652',    // UNIT SPLS24-NH3-4000-KIT
  '21-3657',    // UNIT SPLS230-NH3-4000-KIT
  '60-300',     // DT300 Service Tool
  '60-200',     // SA200 Service Adapter
  '35-210',     // AQUIS 500 NH3 in water
];

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
  extra: Partial<{powerDesc:string; relaySpec:string; analogType:string; modbusType:string; connectTo:string; features:string; image:string}> = {}
): SeedProduct {
  return {
    type: 'detector', family, name, code, price: price ?? 0,
    image: extra.image ?? null,
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
  extra: Partial<{relaySpec:string; analogType:string; modbusType:string; connectTo:string; features:string; powerDesc:string; relayOutputs:number; rs485:boolean; display:boolean; mounting:string; image:string; atex:boolean; tempMin:number; tempMax:number}> = {}
): SeedProduct {
  return {
    type: 'controller', family: 'Controller', name, code, price,
    image: extra.image ?? null,
    specs: JSON.stringify({ channels, maxPower, voltage, ip, ...extra }),
    tier, productGroup,
    gas: '[]', refs: '[]', apps: '[]',
    range: null, sensorTech: null, sensorLife: null,
    power: null, voltage, ip,
    tempMin: extra.tempMin ?? null, tempMax: extra.tempMax ?? null,
    relay: extra.relayOutputs ?? 0,
    analog: extra.analogType ?? null,
    modbus: extra.rs485 ?? false,
    standalone: false, atex: extra.atex ?? false,
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
  extra: Partial<{features:string; ip:string; voltage:string; power:string; type:string; image:string}> = {}
): SeedProduct {
  return {
    type: 'accessory', family: 'Accessory', name, code, price: price ?? 0,
    image: extra.image ?? null,
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
    {powerDesc:'4W max, 170mA @24VDC',relaySpec:'1A @ 24VAC/VDC',analogType:'4-20mA / 0-5V / 1-5V / 0-10V / 2-10V',modbusType:'RTU RS485 (isolated)',connectTo:'Direct (standalone) or Modbus to any RTU master',features:'Service wheel, magnetic switch, pre-cal sensor modules, LED status, Bluetooth app',image:'glaciar-midi.png'}),

  det('MIDI_CO2_10k_R','MIDI Remote IR CO2','31-510-32','MIDI',['CO2'],['R744'],'IR','0-10000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,739,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Remote sensor ideal for cold rooms, ducts, Bluetooth app',image:'midi-remote.jpg'}),

  det('MIDI_HFC1','MIDI SC HFC/HFO Grp1','31-220-12','MIDI',['HFC1'],_HFC1,'SC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,403,'~5y','standard','G',
    ['supermarket','cold_room','cold_storage','heat_pump'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Group 1 calibration, Bluetooth app, NOT interchangeable with Group 2',image:'glaciar-midi.png'}),

  det('MIDI_HFC1_R','MIDI Remote SC Grp1','31-520-12','MIDI',['HFC1'],_HFC1,'SC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,469,'~5y','standard','G',
    ['supermarket','cold_room','cold_storage','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Group 1 remote, Bluetooth app',image:'midi-remote.jpg'}),

  det('MIDI_HFC2','MIDI SC HFC/HFO Grp2','31-220-17','MIDI',['HFC2'],_HFC2,'SC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,403,'~5y','standard','G',
    ['supermarket','cold_room','cold_storage','heat_pump'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Group 2 calibration, Bluetooth app, DIFFERENT from Group 1',image:'glaciar-midi.png'}),

  det('MIDI_HFC2_R','MIDI Remote SC Grp2','31-520-17','MIDI',['HFC2'],_HFC2,'SC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,469,'~5y','standard','G',
    ['supermarket','cold_room','cold_storage','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Group 2 remote, Bluetooth app',image:'midi-remote.jpg'}),

  det('MIDI_NH3_100','MIDI EC NH3 100ppm','31-250-22','MIDI',['NH3'],['R717'],'EC','0-100ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,916,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'EC sensor replace every 2-3 years, NOT ATEX, Bluetooth app',image:'glaciar-midi.png'}),

  det('MIDI_NH3_1000','MIDI EC NH3 1000ppm','31-250-23','MIDI',['NH3'],['R717'],'EC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,916,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Standard range for industrial NH3, Bluetooth app',image:'glaciar-midi.png'}),

  det('MIDI_NH3_5000','MIDI EC NH3 5000ppm','31-250-24','MIDI',['NH3'],['R717'],'EC','0-5000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,916,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'High range NH3, Bluetooth app',image:'glaciar-midi.png'}),

  det('MIDI_NH3_R','MIDI Remote EC NH3','31-550-23','MIDI',['NH3'],['R717'],'EC','0-1000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,981,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Remote ideal for high-mount NH3, Bluetooth app',image:'midi-remote.jpg'}),

  det('MIDI_R290','MIDI SC R290/HC 4000ppm','31-290-13','MIDI',['R290'],_HC,'SC','0-4000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],false,403,'~5y','standard','G',
    ['heat_pump','supermarket','cold_room'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Measures PPM not %LEL, NOT ATEX certified, Bluetooth app',image:'glaciar-midi.png'}),

  det('MIDI_R290_R','MIDI Remote SC R290/HC','31-590-13','MIDI',['R290'],_HC,'SC','0-4000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,469,'~5y','standard','G',
    ['heat_pump','supermarket','cold_room','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'R290 remote, PPM not %LEL, Bluetooth app',image:'midi-remote.jpg'}),

  // ── NEW MIDI variants (31-series) ──
  det('MIDI_NH3_100_R','MIDI Remote EC NH3 100ppm','31-550-22','MIDI',['NH3'],['R717'],'EC','0-100ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,981,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Remote NH3 100ppm, Bluetooth app',image:'midi-remote.jpg'}),

  det('MIDI_NH3_5000_R','MIDI Remote EC NH3 5000ppm','31-550-24','MIDI',['NH3'],['R717'],'EC','0-5000ppm','IP67',-40,50,0.8,'15-24V',2,'selectable',true,true,false,['wall'],true,981,'2-3y','premium','G',
    ['machinery_room','cold_storage','ice_rink','duct'],
    {powerDesc:'4W max',relaySpec:'1A @ 24VAC/VDC',analogType:'Selectable',modbusType:'RTU RS485',connectTo:'Direct or Modbus',features:'Remote NH3 5000ppm, Bluetooth app',image:'midi-remote.jpg'}),

  // ── RM (Room Detectors) ──
  det('RM_HFC','RM-HFC','32-220','RM',['HFC1','HFC2'],['R32','R410A'],'SC','0-5000ppm','IP21',0,40,0.5,'12-24V',1,null,false,true,false,['wall'],false,382,'~5y','economic','A',
    ['hotel','office'],
    {powerDesc:'2W max',relaySpec:'1 alarm relay',features:'Built-in 85dB buzzer + tri-colour LED, alarm delay, IP21 only',image:'rm.png'}),

  det('RMV_HFC','RMV-HFC','32-320','RM',['HFC1','HFC2'],['R32','R410A'],'SC','0-5000ppm','IP21',0,40,0.5,'12-24V',1,null,false,true,false,['flush','surface'],false,382,'~5y','economic','A',
    ['hotel','office'],
    {powerDesc:'2W max',relaySpec:'1 alarm relay',features:'Flush-mount aesthetic for hotels, requires KAP045/KAP046 backbox',image:'rm-v.png'}),

  // ── X5 ──
  // (X5 sensor modules, remote modules, and accessories are in the 3500-series section below)

  // ── Aquis ──
  det('AQUIS500','Aquis 500 NH3 in water','35-210','AQUIS',['NH3W'],['NH3W'],'pH','0.01-9999ppm','IP65',0,50,5,'230V',0,'4-20mA',false,true,false,['pipe'],false,0,'~2y','standard','A',
    ['water_brine'],
    {powerDesc:'230V AC',analogType:'4-20mA output',connectTo:'4-20mA to PLC/BMS',features:'NH3 in water/brine monitoring, pH electrode, specify brine type',image:'aquis500-water.png'}),

  // ── X5 individual products (3500-series) ──
  // X5 ATEX Transmitter (controller)
  ctrl('X5_CTRL','GLACIAR X5 ATEX Transmitter with display','3500-0001',2,10,'18-32V','IP66',822,'premium','G',
    {relayOutputs:3,relaySpec:'2x alarm + 1x fault',analogType:'4-20mA',rs485:false,display:true,mounting:'wall or pole',atex:true,tempMin:-20,tempMax:55,image:'glaciar-x5.png',features:'ATEX certified, 1 or 2 sensor channels, analogue output, incl 1 wand, 1 gland, 3 plugs'}),

  // ── X5 Sensor Modules (direct-mount, remote=false) ──
  det('X5_SEN_NH3_100','GLACIAR X5 NH3 0-100 ppm sensor module','3500-0002','X5',['NH3'],['R717'],'IONIC','0-100ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,1008,'5y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_NH3_500','GLACIAR X5 NH3 0-500 ppm sensor module','3500-0003','X5',['NH3'],['R717'],'IONIC','0-500ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,1008,'5y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_NH3_1000','GLACIAR X5 NH3 0-1000 ppm sensor module','3500-0095','X5',['NH3'],['R717'],'IONIC','0-1000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,1008,'5y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_NH3_5000','GLACIAR X5 NH3 0-5000 ppm sensor module','3500-0004','X5',['NH3'],['R717'],'IONIC','0-5000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,1008,'5y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_CO2_5000','GLACIAR X5 CO2 0-5000 ppm sensor module','3500-0005','X5',['CO2'],['R744'],'IR','0-5000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,1019,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_CO2_5pct','GLACIAR X5 CO2 0-5% vol sensor module','3500-0006','X5',['CO2'],['R744'],'IR','0-5%vol','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,1019,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_CO','GLACIAR X5 CO 0-100ppm sensor module','3500-0096','X5',['CO'],['CO'],'EC','0-100ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,602,'2-3y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_O2','GLACIAR X5 O2 0-25% vol sensor module','3500-0097','X5',['O2'],['O2'],'EC','0-25%vol','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,876,'2-3y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_NO2','GLACIAR X5 NO2 0-5ppm sensor module','3500-0098','X5',['NO2'],['NO2'],'EC','0-5ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,987,'2-3y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_ETHANOL','GLACIAR X5 Ethanol 0-100%LEL sensor module IR','3500-0103','X5',['Ethanol'],['Ethanol'],'IR','0-100%LEL','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,1338,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  // ── X5 Sensor Modules — gas-specific IR (direct-mount, remote=false) ──
  det('X5_SEN_R22','GLACIAR X5 R22 0-2000 ppm sensor module','3500-0065','X5',['HFC1'],['R22'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R32','GLACIAR X5 R32 0-2000 ppm sensor module','3500-0066','X5',['HFC1'],['R32'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R123','GLACIAR X5 R123 0-2000 ppm sensor module','3500-0067','X5',['HFC2'],['R123'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R125','GLACIAR X5 R125 0-2000 ppm sensor module','3500-0068','X5',['HFC1'],['R125'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R134A','GLACIAR X5 R134A 0-2000 ppm sensor module','3500-0069','X5',['HFC2'],['R134a'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R227','GLACIAR X5 R227 0-2000 ppm sensor module','3500-0070','X5',['HFC1'],['R227'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R404A','GLACIAR X5 R404A 0-2000 ppm sensor module','3500-0071','X5',['HFC2'],['R404A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R407A','GLACIAR X5 R407A 0-2000 ppm sensor module','3500-0072','X5',['HFC1'],['R407A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R407F','GLACIAR X5 R407F 0-2000 ppm sensor module','3500-0073','X5',['HFC1'],['R407F'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R410A','GLACIAR X5 R410A 0-2000 ppm sensor module','3500-0074','X5',['HFC1'],['R410A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R417A','GLACIAR X5 R417A 0-2000 ppm sensor module','3500-0075','X5',['HFC1'],['R417A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R442D','GLACIAR X5 R442D 0-2000 ppm sensor module','3500-0076','X5',['HFC1'],['R442D'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R448A','GLACIAR X5 R448A 0-2000 ppm sensor module','3500-0077','X5',['HFC1'],['R448A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R449A','GLACIAR X5 R449A 0-2000 ppm sensor module','3500-0078','X5',['HFC1'],['R449A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R452B','GLACIAR X5 R452B 0-2000 ppm sensor module','3500-0079','X5',['HFC1'],['R452B'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R507','GLACIAR X5 R507 0-2000 ppm sensor module','3500-0080','X5',['HFC1'],['R507A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R513A','GLACIAR X5 R513A 0-2000 ppm sensor module','3500-0081','X5',['HFC2'],['R513A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R1233zd','GLACIAR X5 R1233zd 0-2000 ppm sensor module','3500-0082','X5',['HFC2'],['R1233zd'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R1234yf','GLACIAR X5 R1234yf 0-2000 ppm sensor module','3500-0083','X5',['HFC2'],['R1234yf'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_SEN_R1234ze','GLACIAR X5 R1234ze 0-2000 ppm sensor module','3500-0084','X5',['HFC2'],['R1234ze'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],false,2500,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  // ── X5 Remote Sensor Modules (remote=true) ──
  det('X5_REM_NH3_1000','GLACIAR X5 NH3 0-1000 ppm Remote sensor module','3500-0022','X5',['NH3'],['R717'],'IONIC','0-1000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,1205,'5y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_NH3_100','GLACIAR X5 NH3 0-100 ppm Remote sensor module','3500-0023','X5',['NH3'],['R717'],'IONIC','0-100ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,1424,'5y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_NH3_500','GLACIAR X5 NH3 0-500 ppm Remote sensor module','3500-0024','X5',['NH3'],['R717'],'IONIC','0-500ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,1205,'5y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_NH3_5000','GLACIAR X5 NH3 0-5000 ppm Remote sensor module','3500-0025','X5',['NH3'],['R717'],'IONIC','0-5000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,1096,'5y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_CO2_5pct','GLACIAR X5 CO2 0-5% vol Remote sensor module','3500-0026','X5',['CO2'],['R744'],'IR','0-5%vol','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,1287,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_CO','GLACIAR X5 CO 0-100ppm Remote sensor module','3500-0099','X5',['CO'],['CO'],'EC','0-100ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,876,'2-3y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_O2','GLACIAR X5 O2 0-25% vol Remote sensor module','3500-0100','X5',['O2'],['O2'],'EC','0-25%vol','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,931,'2-3y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_NO2','GLACIAR X5 NO2 0-5ppm Remote sensor module','3500-0101','X5',['NO2'],['NO2'],'EC','0-5ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,1041,'2-3y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_CO2_5000','GLACIAR X5 CO2 0-5000ppm Remote sensor module IR','3500-0109','X5',['CO2'],['R744'],'IR','0-5000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,1287,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R290','GLACIAR X5 R290 0-100%LEL Remote sensor module IR','3500-0117','X5',['R290'],['R290','R50','R600a','R1150','R1270'],'IR','0-100%LEL','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,1277,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  // ── X5 Remote Sensor Modules — gas-specific IR (remote=true) ──
  det('X5_REM_R22','GLACIAR X5 R22 0-2000 ppm Remote sensor module','3500-0032','X5',['HFC1'],['R22'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R32','GLACIAR X5 R32 0-2000 ppm Remote sensor module','3500-0033','X5',['HFC1'],['R32'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R123','GLACIAR X5 R123 0-2000 ppm Remote sensor module','3500-0034','X5',['HFC2'],['R123'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R125','GLACIAR X5 R125 0-2000 ppm Remote sensor module','3500-0035','X5',['HFC1'],['R125'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R134A','GLACIAR X5 R134A 0-2000 ppm Remote sensor module','3500-0036','X5',['HFC2'],['R134a'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R227','GLACIAR X5 R227 0-2000 ppm Remote sensor module','3500-0037','X5',['HFC1'],['R227'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R404A','GLACIAR X5 R404A 0-2000 ppm Remote sensor module','3500-0038','X5',['HFC2'],['R404A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R407A','GLACIAR X5 R407A 0-2000 ppm Remote sensor module','3500-0039','X5',['HFC1'],['R407A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R407F','GLACIAR X5 R407F 0-2000 ppm Remote sensor module','3500-0040','X5',['HFC1'],['R407F'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R410A','GLACIAR X5 R410A 0-2000 ppm Remote sensor module','3500-0041','X5',['HFC1'],['R410A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R417A','GLACIAR X5 R417A 0-2000 ppm Remote sensor module','3500-0042','X5',['HFC1'],['R417A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R422D','GLACIAR X5 R422D 0-2000 ppm Remote sensor module','3500-0043','X5',['HFC1'],['R422D'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R448A','GLACIAR X5 R448A 0-2000 ppm Remote sensor module','3500-0044','X5',['HFC1'],['R448A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R449A','GLACIAR X5 R449A 0-2000 ppm Remote sensor module','3500-0045','X5',['HFC1'],['R449A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R452B','GLACIAR X5 R452B 0-2000 ppm Remote sensor module','3500-0046','X5',['HFC1'],['R452B'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R507','GLACIAR X5 R507 0-2000 ppm Remote sensor module','3500-0047','X5',['HFC1'],['R507A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R513A','GLACIAR X5 R513A 0-2000 ppm Remote sensor module','3500-0048','X5',['HFC2'],['R513A'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R1233zd','GLACIAR X5 R1233zd 0-2000 ppm Remote sensor module','3500-0049','X5',['HFC2'],['R1233zd'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R1234yf','GLACIAR X5 R1234yf 0-2000 ppm Remote sensor module','3500-0050','X5',['HFC2'],['R1234yf'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_R1234ze','GLACIAR X5 R1234ze 0-2000 ppm Remote sensor module','3500-0051','X5',['HFC2'],['R1234ze'],'IR','0-2000ppm','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,2339,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  det('X5_REM_ETHANOL','GLACIAR X5 Ethanol 0-100%LEL Remote sensor module','3500-0115','X5',['Ethanol'],['Ethanol'],'IR','0-100%LEL','IP66',-20,55,2,'18-32V',0,null,false,false,true,['wall','pole'],true,1701,'7-10y','premium','G',
    ['supermarket','cold_room','cold_storage','machinery_room','heat_pump','ice_rink','atex_zone'],
    {features:'ATEX, remote sensor module, requires X5 transmitter (3500-0001)',connectTo:'Plugs into X5 transmitter (3500-0001)',image:'glaciar-x5.png'}),

  // ── X5 Components (accessories) ──
  acc('GLACIAR X5 D44 Power Filter','3500-0029',104,'G','spare',['X5'],
    {features:'D44 power filter for X5 transmitter'}),

  acc('GLACIAR X5 Cable Gland EXd II C','3500-0030',77,'G','spare',['X5'],
    {features:'ATEX cable gland EXd II C for X5 (optional, order separately)',image:'x5-cable-gland.png'}),

  acc('GLACIAR X5 Stopping Plug M20','3500-0031',19,'G','mounting',['X5'],
    {features:'M20 stopping plug for X5',image:'x5-stopping-plug.png'}),

  // ── X5 Accessories ──
  acc('GLACIAR X5 Sun Shade','3500-0085',186,'G','spare',['X5'],
    {features:'Sun shade for outdoor X5 installations (optional, order separately)'}),

  acc('GLACIAR X5 Pole Clamp','3500-0086',383,'G','spare',['X5'],
    {features:'Pole clamp for X5 mounting (optional, order separately)'}),

  acc('GLACIAR X5 Tool Kit (Magnetic Wand)','3500-0087',77,'G','service',['X5'],
    {features:'Magnetic wand tool kit for X5',image:'x5-magnetic-wand.png'}),

  acc('GLACIAR X5 Gas Collector Cone','3500-0088',88,'G','spare',['X5'],
    {features:'Gas collector cone for X5',image:'x5-gas-collector.png'}),

  acc('GLACIAR X5 Protection Filter Disk','3500-0089',11,'G','spare',['X5'],
    {features:'Protection filter disk for X5 sensor'}),

  acc('GLACIAR X5 ATEX Splash Guard','3500-0090',98,'G','spare',['X5'],
    {features:'ATEX splash guard for X5',image:'x5-splash-guard.png'}),

  acc('GLACIAR X5 Spare Plug in PCB set','3500-0091',439,'G','spare',['X5'],
    {features:'Spare plug-in PCB set for X5'}),

  acc('GLACIAR X5 Replacement Base','3500-0092',274,'G','spare',['X5'],
    {features:'Replacement base for X5'}),

  acc('GLACIAR X5 Spare ATEX Housing','3500-0093',493,'G','spare',['X5'],
    {features:'Spare ATEX housing for X5'}),

  acc('GLACIAR X5 Calibration Kit','3500-0094',657,'G','service',['X5'],
    {features:'Calibration kit for X5 detectors',image:'x5-calibration-kit.jpg'}),

  acc('GLACIAR X5 Type 5 Duct Adaptor BSP','3500-0104',602,'G','spare',['X5'],
    {features:'Type 5 duct adaptor BSP for X5 (optional, order separately)'}),

  acc('GLACIAR X5 Pipe Adapter & Silencer','3500-0105',98,'G','spare',['X5'],
    {features:'Pipe adapter and silencer for X5 (optional, order separately)',image:'x5-pipe-adapter.jpg'}),

  acc('GLACIAR X5 Calibration Adapter','3500-0106',65,'G','service',['X5'],
    {features:'Calibration adapter for X5'}),

  acc('GLACIAR X5 Pipe Adapter kit','3500-0110',1085,'G','spare',['X5'],
    {features:'Pipe adapter kit for X5 (optional, order separately)',image:'x5-pipe-adapter.jpg'}),

  acc('GLACIAR X5 Barrier Gland Kit for IIC','3500-0118',161,'G','spare',['X5'],
    {features:'Barrier gland kit for IIC for X5'}),

  // ════════════════════ CONTROLLERS ════════════════════

  ctrl('MPU2C','MPU2C','20-310',2,10,'24V AC/DC','IP20',1168,'standard','A',
    {relayOutputs:4,relaySpec:'2x alarm per channel (SPDT 5A/250VAC) + 1x common fault',analogType:'2x 4-20mA retransmission',rs485:true,display:true,mounting:'DIN rail or wall',features:'2-channel controller, LCD display, Modbus RTU slave for BMS, 4-20mA retransmission',image:'mpu.png'}),

  ctrl('MPU4C','MPU4C','20-300',4,10,'24V AC/DC','IP20',1598,'standard','A',
    {relayOutputs:8,relaySpec:'2x alarm per channel + 1x common fault',analogType:'4x 4-20mA retransmission',rs485:true,display:true,mounting:'DIN rail or wall',features:'4-channel controller, most popular MPU, LCD display, Modbus RTU slave',image:'mpu.png'}),

  ctrl('MPU6C','MPU6C','20-305',6,10,'24V AC/DC','IP20',2004,'standard','A',
    {relayOutputs:12,relaySpec:'2x alarm per channel + 1x common fault',analogType:'6x 4-20mA retransmission',rs485:true,display:true,mounting:'DIN rail or wall',features:'6-channel controller, largest MPU, LCD display, Modbus RTU slave',image:'mpu.png'}),

  ctrl('SPU24','SPU24','20-350',1,10,'24V AC/DC','IP20',424,'standard','A',
    {relayOutputs:2,relaySpec:'1x alarm + 1x fault (SPDT 5A/250VAC)',analogType:'1x 4-20mA',rs485:false,display:false,mounting:'DIN rail or wall',features:'Single-point monitoring, powers sensor head, status LEDs',image:'spu.png'}),

  ctrl('SPU230','SPU230','20-355',1,10,'230V AC','IP20',455,'standard','A',
    {relayOutputs:2,relaySpec:'1x alarm + 1x fault (SPDT 5A/250VAC)',analogType:'1x 4-20mA',rs485:false,display:false,mounting:'DIN rail or wall',features:'230V version of SPU24, single-point monitoring',image:'spu.png'}),

  ctrl('SPLS24','SPLS24','20-360',1,10,'24V AC/DC','IP20',546,'standard','A',
    {relayOutputs:2,relaySpec:'1x alarm + 1x fault (SPDT 5A/250VAC)',analogType:'1x 4-20mA',rs485:false,display:false,mounting:'Wall',features:'SPU with built-in audio-visual alarm (high-intensity LED + 85dB siren)',image:'spls-hq.png'}),

  ctrl('SPLS230','SPLS230','20-365',1,10,'230V AC','IP20',589,'standard','A',
    {relayOutputs:2,relaySpec:'1x alarm + 1x fault (SPDT 5A/250VAC)',analogType:'1x 4-20mA',rs485:false,display:false,mounting:'Wall',features:'230V SPLS, built-in audio-visual alarm',image:'spls-hq.png'}),

  ctrl('LAN63_PKT','LAN63-PKT','81-100',12,999,'230V','IP32',730,'standard','A',
    {relayOutputs:2,features:'12 relay inputs for RM detectors, wall mount package',image:'lan.png'}),

  ctrl('LAN63_64_PKT','LAN63/64-PKT','81-200',24,999,'230V','IP32',1132,'standard','A',
    {relayOutputs:4,features:'24 relay inputs, master + slave package',image:'lan.png'}),

  ctrl('LAN63','LAN63 Master','81-110',12,999,'24V','DIN',561,'standard','A',
    {relayOutputs:2,features:'DIN rail master, 12 relay inputs',image:'lan.png'}),

  ctrl('LAN64','LAN64 Slave','81-120',12,999,'24V','DIN',551,'standard','A',
    {relayOutputs:2,features:'DIN rail slave, 12 relay inputs',image:'lan.png'}),

  // ── NEW UNIT Controllers (21-series) ──
  ctrl('UNIT_3612','SPLS24-CO2-10000-KIT','21-3612',12,999,'24V','IP20',1043,'standard','A',
    {relayOutputs:6,rs485:true,display:true,mounting:'DIN rail',features:'SPLS24 kit with CO2 10000ppm detector, 24V, complete system',image:'spls-hq.png'}),

  ctrl('UNIT_3617','SPLS230-CO2-10000-KIT','21-3617',17,999,'24V','IP20',1055,'standard','A',
    {relayOutputs:8,rs485:true,display:true,mounting:'DIN rail',features:'SPLS230 kit with CO2 10000ppm detector, 230V, complete system',image:'spls-hq.png'}),

  ctrl('UNIT_3620','SPLS24-HFC-4000-KIT','21-3620',20,999,'24V','IP20',887,'standard','A',
    {relayOutputs:4,rs485:true,display:true,mounting:'DIN rail',features:'SPLS24 kit with HFC 4000ppm detector, 24V, complete system',image:'spls-hq.png'}),

  ctrl('UNIT_3620_SE','SPLS24-HFC-4000-KIT (SELF SENSE)','21-3620-SE',20,999,'24V','IP20',887,'standard','A',
    {relayOutputs:4,rs485:true,display:true,mounting:'DIN rail',features:'SPLS24 kit with HFC 4000ppm detector, 24V, SELF SENSE variant',image:'spls-hq.png'}),

  ctrl('UNIT_3625','SPLS230-HFC-4000-KIT','21-3625',25,999,'24V','IP20',901,'standard','A',
    {relayOutputs:6,rs485:true,display:true,mounting:'DIN rail',features:'SPLS230 kit with HFC 4000ppm detector, 230V, complete system',image:'spls-hq.png'}),

  ctrl('UNIT_3625_SE','SPLS230-HFC-4000-KIT (SELF SENSE)','21-3625-SE',25,999,'24V','IP20',901,'standard','A',
    {relayOutputs:6,rs485:true,display:true,mounting:'DIN rail',features:'SPLS230 kit with HFC 4000ppm detector, 230V, SELF SENSE variant',image:'spls-hq.png'}),

  ctrl('UNIT_3652','SPLS24-NH3-4000-KIT','21-3652',52,999,'24V','IP20',887,'standard','A',
    {relayOutputs:4,rs485:true,display:true,mounting:'DIN rail',features:'SPLS24 kit with NH3 4000ppm detector, 24V, complete system',image:'spls-hq.png'}),

  ctrl('UNIT_3657','SPLS230-NH3-4000-KIT','21-3657',57,999,'24V','IP20',901,'standard','A',
    {relayOutputs:6,rs485:true,display:true,mounting:'DIN rail',features:'SPLS230 kit with NH3 4000ppm detector, 230V, complete system',image:'spls-hq.png'}),

  // ── NEW LAN controller (81-series) ──
  ctrl('LAN63_64','LAN65','81-130',24,999,'24V','DIN',1064,'standard','A',
    {relayOutputs:4,features:'LAN65, combined master+slave on DIN rail, 24 relay inputs',image:'lan.png'}),

  // ── NEW Advanced Controller (6300-series) ──
  ctrl('SCU3600','GLACIAR Controller 10','6300-0001',10,999,'24V','IP20',2996,'premium','G',
    {relayOutputs:16,rs485:true,display:true,mounting:'DIN rail or wall',features:'Advanced controller, up to 64 zones, touchscreen, Ethernet, Modbus TCP/RTU, BACnet support',image:'glaciar-controller-10.png'}),

  // ════════════════════ ACCESSORIES (Alerts) ════════════════════

  // ════════════════════ ALERT ACCESSORIES ════════════════════
  acc('FL-RL-R Combined light+siren Red','40-440',232,'A','alert',['ALL'],
    {ip:'IP65',voltage:'18-28V DC',features:'95dB, Red, Combined flash+siren',image:'alarm-flash-siren.png'}),

  acc('FL-OL-V-SEP Combined light+siren Orange','40-442',232,'A','alert',['ALL'],
    {ip:'IP65',voltage:'18-28V DC',features:'95dB, Orange, Combined flash+siren (pre-alarm)',image:'alarm-flash-siren.png'}),

  acc('FL-BL-V-SEP Combined light+siren Blue','40-441',232,'A','alert',['ALL'],
    {ip:'IP65',voltage:'18-28V DC',features:'95dB, Blue, Combined flash+siren',image:'alarm-flash-siren.png'}),

  acc('1992-R-LP Siren','40-410',90,'A','alert',['ALL'],
    {ip:'IP54',voltage:'9-28V DC',features:'95dB, Audible alarm only',image:'siren-1992.png'}),

  acc('BE-R-24VDC Flashing light Red','40-4022',101,'A','alert',['ALL'],
    {ip:'IP54',voltage:'9-60V DC',features:'Red, Visual alarm only',image:'be-flashing-light.jpg'}),

  acc('BE-A-24VDC Flashing light Orange','40-4021',101,'A','alert',['ALL'],
    {ip:'IP54',voltage:'9-60V DC',features:'Orange, Visual pre-alarm',image:'be-flashing-light.jpg'}),

  acc('BE-BL-24VDC Flashing light Blue','40-4023',101,'A','alert',['ALL'],
    {ip:'IP54',voltage:'9-60V DC',features:'Blue, Visual alarm',image:'be-flashing-light.jpg'}),

  // NOTE: 6100-0002 is NOT in the SAMON Price List 2026 — kept for reference
  acc('LED sign Refrigerant Alarm','6100-0002',0,'A','signage',['ALL'],
    {ip:'IP54',voltage:'230V/24V',features:'Visual warning sign'}),

  // ── NEW Alert accessories (40-series) ──
  acc('UPS 5000 Battery back-up without batteries','40-221',761,'A','power',['ALL'],
    {ip:'IP54',voltage:'24V DC',features:'UPS 5000 battery back-up unit, batteries not included',image:'ups-5000.png'}),

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

  acc('Mounting bracket 40-901','40-901',55,'A','mounting',['MIDI'],
    {features:'Wall mounting bracket for MIDI integrated detectors',image:'protection-bracket.png'}),

  acc('Mounting bracket 40-902','40-902',49,'A','mounting',['MIDI'],
    {features:'Wall mounting bracket for MIDI remote detectors (small size)',image:'protection-bracket.png'}),

  // ════════════════════ POWER ACCESSORIES ════════════════════
  acc('UPS 1000 Battery back-up without batteries','4000-0001',479,'A','power',['ALL'],
    {voltage:'100-240 VAC input, 24VDC 20A output',features:'UPS 1000 battery back-up unit, batteries not included',image:'ups-1000.png'}),

  acc('Power Adapter 230V-24V','4000-0002',99,'D','power',['MIDI'],
    {voltage:'85-305 VAC input, 24VDC 1.3A output',features:'31.2W, compatible with GLACIAR MIDI only',image:'power-adapter.jpg'}),

  // ════════════════════ PORTABLE GAS DETECTORS (5000-series) ════════════════════
  acc('Portable Gas Detector O2','5000-0001',247,'C','spare',['ALL'],
    {features:'Portable single-gas detector for Oxygen (O2)'}),

  acc('Portable Gas Detector O2,CO,H2S,%LEL IR','5000-0002',927,'C','spare',['ALL'],
    {features:'Portable multi-gas detector: O2, CO, H2S, %LEL (IR sensor)'}),

  acc('Portable Gas Detector O2,CO,H2S,%LEL CC','5000-0003',612,'C','spare',['ALL'],
    {features:'Portable multi-gas detector: O2, CO, H2S, %LEL (catalytic sensor)'}),

  acc('Portable Gas Detector CO2','5000-0004',603,'C','spare',['ALL'],
    {features:'Portable single-gas detector for CO2'}),

  acc('Portable Gas Detector NH3','5000-0005',519,'C','spare',['ALL'],
    {features:'Portable single-gas detector for NH3'}),

  // ════════════════════ IR LINK (5001-series) ════════════════════
  acc('IR Link for Portable Gas Detector (SGT/MGT)','5001-0001',155,'C','spare',['ALL'],
    {features:'IR communication link for SGT/MGT portable gas detectors'}),

  // ════════════════════ SERVICE TOOLS ════════════════════
  acc('SA200 Service tool','60-120',114,'A','service',['MIDI','X5'],
    {features:'SA200 service tool for SAMON detectors',image:'sa200.png'}),

  acc('DT 300 Service tool','60-130',589,'A','service',['MIDI','X5'],
    {features:'DT 300 service tool for field diagnostics',image:'dt300.png'}),

  acc('SM300-HC sensor module','60-132',277,'A','service',['MIDI','X5'],
    {features:'SM300-HC sensor module for HC gas detection'}),

  acc('SM300-H2 sensor module','60-133',277,'A','service',['MIDI','X5'],
    {features:'SM300-H2 sensor module for hydrogen detection'}),

  acc('SM300-HFC-4000 sensor module','60-134',277,'A','service',['MIDI','X5'],
    {features:'SM300-HFC-4000 sensor module for HFC gas detection'}),

  acc('SM300-NH3-4000 sensor module','60-136',277,'A','service',['MIDI','X5'],
    {features:'SM300-NH3-4000 sensor module for NH3 detection up to 4000ppm'}),

  acc('SM300-NH3-10000 sensor module','60-137',277,'A','service',['MIDI','X5'],
    {features:'SM300-NH3-10000 sensor module for NH3 detection up to 10000ppm'}),

  acc('SM300-SELF SENSE sensor module','60-150',277,'A','service',['MIDI','X5'],
    {features:'SM300-SELF SENSE sensor module with self-diagnostic capability'}),

  acc('Calibration Adapter v2.0','62-9011',0,'A','service',['MIDI'],
    {features:'Calibration adapter for GLACIAR MIDI',image:'calibration-adapter.jpg'}),

  // ════════════════════ TEST GAS CANS (61-series) ════════════════════
  acc('Test Gas NH3-50ppm (NH3/Air) 58LTR can','61-2030',500,'D','service',['ALL'],
    {features:'Test gas can NH3-50ppm in Air, 58 litre'}),

  acc('Test Gas NH3-50ppm (NH3/Air) 110LTR can','61-2030-110',643,'D','service',['ALL'],
    {features:'Test gas can NH3-50ppm in Air, 110 litre'}),

  acc('Test Gas NH3-500ppm (NH3/Air) 58LTR can','61-2031',500,'D','service',['ALL'],
    {features:'Test gas can NH3-500ppm in Air, 58 litre'}),

  acc('Test Gas NH3-500ppm (NH3/Air) 110LTR can','61-2031-110',643,'D','service',['ALL'],
    {features:'Test gas can NH3-500ppm in Air, 110 litre'}),

  acc('Test Gas NH3-2500ppm (NH3/Air) 58LTR can','61-2032',500,'D','service',['ALL'],
    {features:'Test gas can NH3-2500ppm in Air, 58 litre'}),

  acc('Test Gas NH3-2500ppm (NH3/Air) 110LTR can','61-2032-110',643,'D','service',['ALL'],
    {features:'Test gas can NH3-2500ppm in Air, 110 litre'}),

  acc('Test Gas NH3-4000ppm (NH3/Air) 58LTR can','61-2033',500,'D','service',['ALL'],
    {features:'Test gas can NH3-4000ppm in Air, 58 litre'}),

  acc('Test Gas NH3-4000ppm (NH3/Air) 110LTR can','61-2033-110',643,'D','service',['ALL'],
    {features:'Test gas can NH3-4000ppm in Air, 110 litre'}),

  acc('Test Gas R32-1000ppm (R32/Air) 58LTR can','61-2041',379,'D','service',['ALL'],
    {features:'Test gas can R32-1000ppm in Air, 58 litre'}),

  acc('Test Gas R32-1000ppm (R32/Air) 110LTR can','61-2041-110',500,'D','service',['ALL'],
    {features:'Test gas can R32-1000ppm in Air, 110 litre'}),

  acc('Test Gas R454A-1000ppm (R454A/Air) 58LTR can','61-2042',379,'D','service',['ALL'],
    {features:'Test gas can R454A-1000ppm in Air, 58 litre'}),

  acc('Test Gas R454B-1000ppm (R454B/Air) 58LTR can','61-2043',679,'D','service',['ALL'],
    {features:'Test gas can R454B-1000ppm in Air, 58 litre'}),

  acc('Test Gas R454C-1000ppm (R454C/Air) 58LTR can','61-2044',679,'D','service',['ALL'],
    {features:'Test gas can R454C-1000ppm in Air, 58 litre'}),

  acc('Test Gas R134a-1000ppm (R134a/Air) 58LTR can','61-2046',379,'D','service',['ALL'],
    {features:'Test gas can R134a-1000ppm in Air, 58 litre'}),

  acc('Test Gas R134a-1000ppm (R134a/Air) 110LTR can','61-2046-110',500,'D','service',['ALL'],
    {features:'Test gas can R134a-1000ppm in Air, 110 litre'}),

  acc('Test Gas R410a-1000ppm (R410a/N2) 58LTR can','61-2047',379,'D','service',['ALL'],
    {features:'Test gas can R410a-1000ppm in N2, 58 litre'}),

  acc('Test Gas R410a-1000ppm (R410a/N2) 110LTR can','61-2047-110',500,'D','service',['ALL'],
    {features:'Test gas can R410a-1000ppm in N2, 110 litre'}),

  acc('Test Gas R290-4000ppm (R290/Air) 58LTR can','61-2051',379,'D','service',['ALL'],
    {features:'Test gas can R290-4000ppm in Air, 58 litre'}),

  acc('Test Gas R290-4000ppm (R290/Air) 110LTR can','61-2051-110',500,'D','service',['ALL'],
    {features:'Test gas can R290-4000ppm in Air, 110 litre'}),

  acc('Test Gas CO2-8000ppm (CO2/N2) 58LTR can','61-2063',379,'D','service',['ALL'],
    {features:'Test gas can CO2-8000ppm in N2, 58 litre'}),

  acc('Test Gas CO2-8000ppm (CO2/N2) 110LTR can','61-2063-110',500,'D','service',['ALL'],
    {features:'Test gas can CO2-8000ppm in N2, 110 litre'}),

  acc('Test Gas Synthetic Air 110LTR can','61-2070-110',643,'D','service',['ALL'],
    {features:'Test gas can Synthetic Air, 110 litre'}),

  acc('Flow regulator 0.5l/min Stainless steel','61-9013',554,'D','service',['ALL'],
    {features:'Flow regulator 0.5l/min, stainless steel construction',image:'flow-regulator.jpg'}),

  acc('Flow regulator Fix 0.5l/min Brass','61-9015',348,'D','service',['ALL'],
    {features:'Fixed flow regulator 0.5l/min, brass construction',image:'flow-regulator.jpg'}),

  acc('TR Calibration Kit','61-9030',286,'D','service',['ALL'],
    {features:'Calibration kit for TR series detectors',image:'calibration-gas-bottle.png'}),

  acc('GLACIAR MIDI Calibration Kit','61-9040',104,'D','service',['ALL'],
    {features:'Calibration kit for GLACIAR MIDI detectors',image:'midi-calibration-kit.jpg'}),

  // ════════════════════ GLACIAR MIDI ACCESSORIES (62-series) ════════════════════
  acc('GLACIAR MIDI Delivery protection cap 4 pcs','62-9022',16,'D','spare',['MIDI'],
    {features:'Delivery protection cap for GLACIAR MIDI, pack of 4',image:'midi-protection-cap.jpg'}),

  acc('GLACIAR MIDI Pipe adapter 1/2" R','62-9031',32,'D','spare',['MIDI'],
    {features:'Pipe adapter 1/2" R for GLACIAR MIDI',image:'midi-pipe-adapter.jpg'}),

  acc('GLACIAR MIDI Duct adapter','62-9041',147,'D','spare',['MIDI'],
    {features:'Duct adapter for GLACIAR MIDI',image:'midi-duct-adapter.jpg'}),

  acc('GLACIAR MIDI Magnet wands 5 pcs','62-9051',26,'D','spare',['MIDI'],
    {features:'Magnet wands for GLACIAR MIDI, pack of 5',image:'midi-magnet-wands.jpg'}),

  // ════════════════════ LABELS / SMALL ACCESSORIES ════════════════════
  acc('Sensor protection cap (L) for GS,GSR,TR-SC,MP-DS','DEL659',4,'A','spare',['ALL'],
    {features:'Large sensor protection cap for GS, GSR, TR-SC, MP-DS detectors',image:'sensor-protection-cap.png'}),

  acc('Sensor protection cap (S) for GR,TR-SCR,MP-DR','DEL660',3,'A','spare',['ALL'],
    {features:'Small sensor protection cap for GR, TR-SCR, MP-DR detectors',image:'sensor-protection-cap.png'}),

  // ════════════════════ MIDI REPLACEMENT SENSORS (SEN-series) ════════════════════
  acc('SEN-41032 MIDI IR CO2 Sensor','SEN-41032',426,'G','spare',['MIDI'],
    {features:'Replacement IR CO2 sensor module for MIDI, 0-10000ppm',image:'midi-sensor-module.jpg'}),

  acc('SEN-42012 MIDI SC HFC Grp1 Sensor','SEN-42012',161,'G','spare',['MIDI'],
    {features:'Replacement SC HFC Group 1 sensor for MIDI',image:'midi-sensor-module.jpg'}),

  acc('SEN-42017 MIDI SC HFC Grp2 Sensor','SEN-42017',161,'G','spare',['MIDI'],
    {features:'Replacement SC HFC Group 2 sensor for MIDI',image:'midi-sensor-module.jpg'}),

  acc('SEN-45022 MIDI EC NH3 100ppm Sensor','SEN-45022',665,'G','spare',['MIDI'],
    {features:'Replacement EC NH3 sensor 0-100ppm for MIDI',image:'midi-sensor-module.jpg'}),

  acc('SEN-45023 MIDI EC NH3 1000ppm Sensor','SEN-45023',665,'G','spare',['MIDI'],
    {features:'Replacement EC NH3 sensor 0-1000ppm for MIDI',image:'midi-sensor-module.jpg'}),

  acc('SEN-45024 MIDI EC NH3 5000ppm Sensor','SEN-45024',665,'G','spare',['MIDI'],
    {features:'Replacement EC NH3 sensor 0-5000ppm for MIDI',image:'midi-sensor-module.jpg'}),

  acc('SEN-49013 MIDI SC HC Sensor','SEN-49013',161,'G','spare',['MIDI'],
    {features:'Replacement SC HC/R290 sensor for MIDI'}),

  // G-Series, TR, MP, GEX, GXR sensors — DISCONTINUED, removed from catalog
];
