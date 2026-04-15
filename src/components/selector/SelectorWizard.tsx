'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ProductRecord, DiscountRow, SelectorInput, BOMZone, BOMResult } from '@/lib/m2-engine/types';
import { buildBOM } from '@/lib/m2-engine/build-bom';
import StepAppGas from './StepAppGas';
import StepTechnical from './StepTechnical';
import StepZoneQty from './StepZoneQty';
import StepBOM from './StepBOM';

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

export default function SelectorWizard() {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<ProductRecord[]>([]);
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
  const [bomResult, setBomResult] = useState<BOMResult | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?discontinued=false').then(r => r.json()),
      fetch('/api/refrigerants-v5').then(r => r.json()),
      fetch('/api/applications').then(r => r.json()),
    ]).then(([prods, refs, apps]) => {
      setProducts(prods);
      setRefrigerants(refs);
      setApplications(apps);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selectorInput = useMemo((): SelectorInput => ({
    gasGroup,
    refrigerantRefs,
    preferredFamily: preferredFamily || undefined,
    voltage,
    atexRequired,
    mountType,
    standalone,
  }), [gasGroup, refrigerantRefs, preferredFamily, voltage, atexRequired, mountType, standalone]);

  function generateBOM() {
    const result = buildBOM(selectorInput, zones, products);
    setBomResult(result);
    setStep(4);
  }

  function nextStep() {
    if (step === 3) { generateBOM(); return; }
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
        <div className="flex items-center gap-1">
          <span className="text-[#E63946] font-extrabold text-xl">SAMON</span>
          <span className="text-white font-extrabold text-xl ml-2">Product Selector</span>
        </div>
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
        {step === 4 && bomResult && (
          <StepBOM
            bom={bomResult}
            products={products}
            selectorInput={selectorInput}
            customerGroup={customerGroup}
            onCustomerGroupChange={setCustomerGroup}
            discountMatrix={discountMatrix}
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
