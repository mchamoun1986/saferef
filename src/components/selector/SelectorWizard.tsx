'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ProductRecord, DiscountRow, BOMZone } from '@/lib/m2-engine/types';
import type { SelectionInput, SelectionResult, PricingInput, PricingResult } from '@/lib/engine-types';
import { toProductEntries } from '@/lib/m2-engine/parse-product';
import { selectProducts } from '@/lib/m2-engine/selection-engine';
import { calculatePricing } from '@/lib/m2-engine/pricing-engine';
import StepAppGas from './StepAppGas';
import StepTechnical from './StepTechnical';
import StepZoneQty from './StepZoneQty';
import StepTieredBOM from './StepTieredBOM';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const STEP_LABELS = ['Application & Gas', 'Technical', 'Zones', 'Quote'];

interface RefOption {
  id: string;
  name: string;
  safetyClass: string;
  gasGroup: string;
}

interface AppOption {
  id: string;
  labelEn: string;
  icon: string;
  suggestedGases?: string;
}

const CUSTOMER_GROUPS = [
  '', 'EDC', 'OEM', '1Fo', '2Fo', '3Fo',
  '1Contractor', '2Contractor', '3Contractor',
  'AKund', 'BKund', 'NO',
];

export default function SelectorWizard() {
  const [step, setStep] = useState(1);
  const [rawProducts, setRawProducts] = useState<ProductRecord[]>([]);
  const [discountMatrix, setDiscountMatrix] = useState<DiscountRow[]>([]);
  const [refrigerants, setRefrigerants] = useState<RefOption[]>([]);
  const [applications, setApplications] = useState<AppOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Step 1 state
  const [application, setApplication] = useState('');
  const [gasGroup, setGasGroup] = useState('');
  const [refrigerantRefs, setRefrigerantRefs] = useState<string[]>([]);
  const [preferredFamily, setPreferredFamily] = useState('');

  // Step 2 state
  const [voltage, setVoltage] = useState<'12V' | '24V' | '230V'>('24V');
  const [atexRequired, setAtexRequired] = useState(false);
  const [mountType, setMountType] = useState('wall');
  const [standalone, setStandalone] = useState(false);

  // Step 3 state
  const [zones, setZones] = useState<BOMZone[]>([{ name: 'Zone 1', detectorQty: 1 }]);

  // Step 4 state
  const [customerGroup, setCustomerGroup] = useState('');
  const [selectionResult, setSelectionResult] = useState<SelectionResult | null>(null);
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?discontinued=false').then(r => r.json()),
      fetch('/api/refrigerants-v5').then(r => r.json()),
      fetch('/api/applications').then(r => r.json()),
      fetch('/api/discount-matrix').then(r => r.json()).catch(() => []),
    ]).then(([prods, refs, apps, dm]) => {
      setRawProducts(prods);
      setRefrigerants(refs);
      setApplications(apps);
      setDiscountMatrix(Array.isArray(dm) ? dm : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const { products, controllers, accessories } = useMemo(
    () => toProductEntries(rawProducts),
    [rawProducts],
  );

  const priceDb = useMemo(() => {
    const db = new Map<string, { price: number; productGroup: string; discontinued: boolean }>();
    for (const p of rawProducts) db.set(p.code, { price: p.price, productGroup: p.productGroup || 'G', discontinued: p.discontinued });
    return db;
  }, [rawProducts]);

  const totalDetectors = zones.reduce((s, z) => s + z.detectorQty, 0);

  function generateQuote() {
    const selInput: SelectionInput = {
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors,
      selectedRefrigerant: refrigerantRefs[0] || '',
      zoneType: application || 'supermarket',
      zoneAtex: atexRequired,
      outputRequired: 'any',
      sitePowerVoltage: voltage,
      mountingType: mountType,
      projectCountry: 'SE',
      products,
      controllers,
      accessories,
    };

    const sel = selectProducts(selInput);
    setSelectionResult(sel);

    const pInput: PricingInput = {
      tiers: sel.tiers,
      customerGroup: (customerGroup || 'NO') as PricingInput['customerGroup'],
      discountMatrix,
      priceDb,
    };
    setPricingResult(calculatePricing(pInput));
    setStep(4);
  }

  // Recalculate pricing when customer group changes on step 4
  useMemo(() => {
    if (step !== 4 || !selectionResult) return;
    const pInput: PricingInput = {
      tiers: selectionResult.tiers,
      customerGroup: (customerGroup || 'NO') as PricingInput['customerGroup'],
      discountMatrix,
      priceDb,
    };
    setPricingResult(calculatePricing(pInput));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerGroup]);

  function nextStep() {
    if (step === 3) { generateQuote(); return; }
    setStep(s => Math.min(s + 1, 4));
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
        <a href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <span className="text-[#E63946] font-extrabold text-xl">Safe</span>
          <span className="text-white font-extrabold text-xl">Ref</span>
          <span className="ml-3 text-sm text-[#6b8da5]">Selector</span>
        </a>
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
          <StepAppGas
            applications={applications}
            refrigerants={refrigerants}
            application={application}
            gasGroup={gasGroup}
            refrigerantRefs={refrigerantRefs}
            preferredFamily={preferredFamily}
            onApplicationChange={setApplication}
            onGasGroupChange={setGasGroup}
            onRefrigerantRefsChange={setRefrigerantRefs}
            onPreferredFamilyChange={setPreferredFamily}
          />
        )}
        {step === 2 && (
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
        {step === 3 && (
          <StepZoneQty zones={zones} onChange={setZones} />
        )}
        {step === 4 && selectionResult && pricingResult && (
          <StepTieredBOM
            selectionResult={selectionResult}
            pricingResult={pricingResult}
            customerGroup={customerGroup}
            customerGroups={CUSTOMER_GROUPS}
            onCustomerGroupChange={setCustomerGroup}
            clientData={{ firstName: '', lastName: '', company: '', email: '', phone: '', projectName: '', country: 'SE', customerGroup }}
            gasAppData={{ zoneType: application, selectedRefrigerant: refrigerantRefs[0] || '', selectedRange: '', sitePowerVoltage: voltage, zoneAtex: atexRequired, mountingType: mountType }}
          />
        )}

        {step < 4 ? (
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={prevStep} className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg">Back</button>
            ) : <div />}
            <button onClick={nextStep} className="bg-gradient-to-r from-[#A7C031] to-[#8fb028] hover:from-[#8fb028] hover:to-[#7da024] text-white font-bold px-8 py-3 rounded-lg shadow-lg">
              {step === 3 ? 'Generate Quote' : 'Next'}
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
