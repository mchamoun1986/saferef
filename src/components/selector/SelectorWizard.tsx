'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, FolderOpen } from 'lucide-react';
import type { ProductRecord, BOMZone } from '@/lib/m2-engine/types';
import type { ProductV2, Solution } from '@/lib/m2-engine/designer-types';
import { SystemDesigner } from '@/lib/m2-engine/selection-engine';
import StepAppGas from './StepAppGas';
import StepTechnical from './StepTechnical';
import StepZoneQty from './StepZoneQty';
import StepTieredBOM from './StepTieredBOM';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const STEP_LABELS = ['Client', 'Application & Gas', 'Technical', 'Zones', 'Products'];

interface SelectorClientData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  projectName: string;
  country: string;
  rgpdConsent: boolean;
}

const COUNTRIES = [
  { value: 'FR', label: 'France' },
  { value: 'SE', label: 'Sweden' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'AT', label: 'Austria' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'PL', label: 'Poland' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'PT', label: 'Portugal' },
  { value: 'IE', label: 'Ireland' },
  { value: 'GR', label: 'Greece' },
  { value: 'RO', label: 'Romania' },
  { value: 'HU', label: 'Hungary' },
  { value: 'OTHER', label: 'Other' },
];

interface RefOption {
  id: string;
  name: string;
  safetyClass: string;
  gasGroup?: string;
}

interface AppOption {
  id: string;
  labelEn: string;
  icon: string;
  suggestedGases?: string;
}

/* ── Inline Client Step (mirrors Calculator StepClient styling) ── */
function StepClientInline({ data, onChange }: { data: SelectorClientData; onChange: (d: SelectorClientData) => void }) {
  const update = <K extends keyof SelectorClientData>(field: K, value: SelectorClientData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const inputClass =
    'w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors';
  const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

  return (
    <div className="space-y-5">
      {/* RGPD Consent */}
      <div className="bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-xl px-5 py-3 flex items-start gap-3">
        <input type="checkbox" className="mt-1 w-4 h-4 accent-[#16354B] flex-shrink-0" checked={data.rgpdConsent} onChange={(e) => update('rgpdConsent', e.target.checked)} />
        <span className="text-xs text-[#6b8da5] leading-relaxed">
          I consent to my data being processed by SafeRef for this request (GDPR EU 2016/679).
        </span>
      </div>

      {/* Client Info */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-[#E63946] rounded-full" />
          <User className="w-5 h-5 text-[#E63946]" />
          <h3 className="text-sm font-bold text-[#16354B]">Client Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name</label>
            <input type="text" className={inputClass} value={data.firstName} onChange={(e) => update('firstName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input type="text" className={inputClass} value={data.lastName} onChange={(e) => update('lastName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Company</label>
            <input type="text" className={inputClass} value={data.company} onChange={(e) => update('company', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass} value={data.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" className={inputClass} value={data.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-[#E63946] rounded-full" />
          <FolderOpen className="w-5 h-5 text-[#E63946]" />
          <h3 className="text-sm font-bold text-[#16354B]">Project Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Project Name</label>
            <input type="text" className={inputClass} value={data.projectName} onChange={(e) => update('projectName', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <select className={inputClass} value={data.country} onChange={(e) => update('country', e.target.value)}>
              <option value="">Select country...</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cast a ProductRecord (API shape) to ProductV2 (engine shape) */
function toProductV2(p: ProductRecord): ProductV2 {
  return {
    id: p.id,
    type: p.type,
    family: p.family,
    name: p.name,
    code: p.code,
    price: p.price,
    image: p.image ?? null,
    specs: p.specs ?? '',
    tier: p.tier || 'standard',
    productGroup: p.productGroup || 'G',
    gas: p.gas,
    refs: p.refs,
    apps: p.apps,
    range: p.range,
    sensorTech: p.sensorTech,
    sensorLife: p.sensorLife ?? null,
    power: p.power ?? null,
    voltage: p.voltage,
    ip: p.ip ?? null,
    tempMin: p.tempMin ?? null,
    tempMax: p.tempMax ?? null,
    relay: p.relay ?? 0,
    analog: p.analog,
    modbus: p.modbus ?? false,
    standalone: p.standalone ?? false,
    atex: p.atex ?? false,
    mount: typeof p.mount === 'string' ? p.mount : JSON.stringify(p.mount),
    remote: p.remote ?? false,
    features: p.features ?? null,
    connectTo: p.connectTo ?? null,
    discontinued: p.discontinued ?? false,
    channels: p.channels ?? null,
    maxPower: p.maxPower ?? null,
    subCategory: p.subCategory ?? null,
    compatibleFamilies: p.compatibleFamilies ?? '[]',
    // V2 fields
    variant: p.variant ?? null,
    subType: p.subType ?? null,
    function: p.function ?? null,
    status: p.status ?? 'active',
    ports: p.ports ?? '[]',
    connectionRules: p.connectionRules ?? '{}',
    compatibleWith: p.compatibleWith ?? '[]',
  };
}

export default function SelectorWizard() {
  const [step, setStep] = useState(1);
  const [rawProducts, setRawProducts] = useState<ProductRecord[]>([]);
  const [refrigerants, setRefrigerants] = useState<RefOption[]>([]);
  const [applications, setApplications] = useState<AppOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Step 1 — Client state
  const [clientData, setClientData] = useState<SelectorClientData>({
    firstName: '', lastName: '', company: '', email: '', phone: '', projectName: '', country: 'FR', rgpdConsent: false,
  });

  // Step 2 state
  const [application, setApplication] = useState('');
  const [refrigerant, setRefrigerant] = useState('');
  const [preferredFamily, setPreferredFamily] = useState('');

  // Step 3 state
  const [voltage, setVoltage] = useState<'12V' | '24V' | '230V'>('24V');
  const [atexRequired, setAtexRequired] = useState(false);
  const [mountType, setMountType] = useState('ambient');
  const [standalone, setStandalone] = useState(false);

  // Step 4 state
  const [zones, setZones] = useState<BOMZone[]>([{ name: 'Zone 1', detectorQty: 1 }]);

  // Step 5 state
  const [solutions, setSolutions] = useState<Solution[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?status=active').then(r => r.json()),
      fetch('/api/refrigerants-v5').then(r => r.json()),
      fetch('/api/applications').then(r => r.json()),
    ]).then(([prods, refs, apps]) => {
      setRawProducts(Array.isArray(prods) ? prods : []);
      setRefrigerants(Array.isArray(refs) ? refs : []);
      setApplications(Array.isArray(apps) ? apps : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalDetectors = zones.reduce((s, z) => s + z.detectorQty, 0);

  function generateQuote() {
    const products = rawProducts.map(toProductV2);
    const designer = new SystemDesigner(products);

    // Map voltage to V2 format
    const voltageMap: Record<string, string> = {
      '12V': '12V DC',
      '24V': '24V DC/AC',
      '230V': '230V AC',
    };

    const sols = designer.generate({
      gas: refrigerant,
      atex: atexRequired,
      voltage: voltageMap[voltage] || '24V DC/AC',
      location: mountType as 'ambient' | 'duct' | 'pipe',
      outputs: [],
      measType: '',
      points: totalDetectors,
      application: application || undefined,
    });

    setSolutions(sols);
    setStep(5);
  }

  function nextStep() {
    if (step === 4) { generateQuote(); return; }
    setStep(s => Math.min(s + 1, 5));
  }

  function prevStep() {
    setStep(s => Math.max(s - 1, 1));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E63946]">
        <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <span className="text-[#E63946] font-extrabold text-xl">Safe</span>
          <span className="text-white font-extrabold text-xl">Ref</span>
          <span className="ml-3 text-sm text-[#6b8da5]">Selector</span>
        </Link>
        <LanguageSwitcher compact />
      </nav>

      <div className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] py-5">
        <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const isDone = step > num;
            const isActive = step === num;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone ? 'bg-[#A7C031] text-white' : isActive ? 'bg-[#E63946] text-white' : 'border-2 border-[#2a4a60] text-[#4a7a95]'
                  }`}>
                    {isDone ? '\u2713' : num}
                  </div>
                  <span className={`mt-2 text-[11px] font-semibold ${isDone ? 'text-[#A7C031]' : isActive ? 'text-white' : 'text-[#4a7a95]'}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-[3px] mx-4 mt-[-1rem] rounded-full ${step > num ? 'bg-[#A7C031]' : 'bg-[#2a4a60]'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {step === 1 && (
          <StepClientInline data={clientData} onChange={setClientData} />
        )}
        {step === 2 && (
          <StepAppGas
            applications={applications}
            refrigerants={refrigerants}
            application={application}
            refrigerant={refrigerant}
            preferredFamily={preferredFamily}
            onApplicationChange={setApplication}
            onRefrigerantChange={setRefrigerant}
            onPreferredFamilyChange={setPreferredFamily}
          />
        )}
        {step === 3 && (
          <StepTechnical
            voltage={voltage}
            atexRequired={atexRequired}
            mountType={mountType}
            standalone={standalone}
            onVoltageChange={setVoltage}
            onAtexChange={setAtexRequired}
            onMountChange={setMountType}
            onStandaloneChange={setStandalone}
          />
        )}
        {step === 4 && (
          <StepZoneQty zones={zones} onChange={setZones} />
        )}
        {step === 5 && (
          <StepTieredBOM
            solutions={solutions}
            clientData={{ ...clientData, customerGroup: '' }}
            gasAppData={{
              zoneType: application,
              selectedRefrigerant: refrigerant,
              selectedRange: '',
              sitePowerVoltage: voltage,
              zoneAtex: atexRequired,
              mountingType: mountType,
            }}
            zoneCalcData={[]}
          />
        )}

        {step < 5 ? (
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={prevStep} className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg">Back</button>
            ) : <div />}
            <button onClick={nextStep} className="bg-gradient-to-r from-[#A7C031] to-[#8fb028] hover:from-[#8fb028] hover:to-[#7da024] text-white font-bold px-8 py-3 rounded-lg shadow-lg">
              {step === 4 ? 'Continue to Products' : 'Next'}
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <button onClick={prevStep} className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg">Back</button>
          </div>
        )}
      </main>
    </div>
  );
}
