export interface ClientData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  projectName: string;
  country: string;
  clientType: string;
  customerGroup: string;
  discountCode: string;
  rgpdConsent: boolean;
}

export interface GasAppData {
  regulation: 'en378' | 'ashrae15' | 'iso5149';
  zoneType: string;
  selectedRefrigerant: string;
  selectedRange: string;
  sitePowerVoltage: '12V' | '24V' | '230V';
  zoneAtex: boolean;
  mountingType: string;
}

export interface ZoneData {
  id: number;
  name: string;
  surface: number;
  height: number;
  volumeOverride: number | null;
  charge: number;
  evaporators: number;
  mountingType: string;
  length: number | null;       // optional L for plan ratio (m)
  width: number | null;        // optional W for plan ratio (m)
  leakSources: { id: string; description: string; x: number; y: number }[];
  evaporatorPositions: { id: string; x: number; y: number }[];
  planDetectorCount: number | null; // if set, overrides M1 recommendedDetectors
  regulatory: RegulatoryContext;    // per-zone regulatory context
  spaceTypeId?: string;             // selected space type (pre-fills regulatory)
}

export interface RegulatoryContext {
  accessCategory: 'a' | 'b' | 'c';
  locationClass: 'I' | 'II' | 'III' | 'IV';
  belowGround: boolean;
  isMachineryRoom: boolean;
  isOccupiedSpace: boolean;
  humanComfort: boolean;
  c3Applicable: boolean;
  mechanicalVentilation: boolean;
}

export type WizardStep = 'client' | 'gasapp' | 'zones' | 'calcsheet';
