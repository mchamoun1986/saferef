'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { type Lang, NAV, VALIDATION } from '@/components/configurator/i18n';
import { useLang } from '@/lib/i18n-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import StepClient from '@/components/configurator/StepClient';
import StepGasApp from '@/components/configurator/StepGasApp';
import StepZones from '@/components/configurator/StepZones';
import StepCalcSheet from '@/components/configurator/StepCalcSheet';
import StepProducts from '@/components/configurator/StepProducts';
import StepTechnical from '@/components/selector/StepTechnical';
import StepProgress from '@/components/configurator/StepProgress';
import { calculateAllZones } from '@/lib/m1-engine';
import { en378RuleSet } from '@/lib/rules/en378';
import { ashrae15RuleSet } from '@/lib/rules/ashrae15';
import { iso5149RuleSet } from '@/lib/rules/iso5149';
import { evaluateAllZones } from '@/lib/engine/evaluate';
import type { RefrigerantV5, ZoneRegulationResult, AllZonesResult } from '@/lib/engine-types';
import type { ClientData, GasAppData, ZoneData, RegulatoryContext } from '@/components/configurator/types';

// ─── Default state ──────────────────────────────────────────────────────────

const defaultClientData: ClientData = {
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  phone: '',
  projectName: '',
  country: 'FR',
  clientType: '',
  customerGroup: '',
  discountCode: '',
  rgpdConsent: false,
};

const defaultGasAppData: GasAppData = {
  regulation: 'en378',
  zoneType: '',
  selectedRefrigerant: '',
  selectedRange: '',
  sitePowerVoltage: '24V',
  zoneAtex: false,
  mountingType: 'ambient',
};

const defaultRegulatoryContext: RegulatoryContext = {
  accessCategory: 'b',
  locationClass: 'II',
  belowGround: false,
  isMachineryRoom: false,
  isOccupiedSpace: false,
  humanComfort: false,
  c3Applicable: false,
  mechanicalVentilation: false,
};

// ─── Page component ─────────────────────────────────────────────────────────

export default function ConfiguratorPage() {
  // Wizard step
  const [step, setStep] = useState(1);
  const { lang } = useLang();

  // Step state
  const [clientData, setClientData] = useState<ClientData>(defaultClientData);
  const [gasAppData, setGasAppData] = useState<GasAppData>(defaultGasAppData);
  const [zones, setZones] = useState<ZoneData[]>([]);

  // Technical step state (Step 5)
  const [siteVoltage, setSiteVoltage] = useState<'12V' | '24V' | '230V'>('24V');
  const [atexRequired, setAtexRequired] = useState(false);
  const [mountType, setMountType] = useState('ambient');

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Draft restoration
  const [hasDraft, setHasDraft] = useState(false);
  const draftChecked = useRef(false);

  // Engine results (M1 only)
  const [calcResult, setCalcResult] = useState<AllZonesResult | null>(null);

  // API data
  const [refrigerants, setRefrigerants] = useState<RefrigerantV5[]>([]);
  const [applications, setApplications] = useState<{ id: string; labelFr: string; labelEn: string; icon: string; accessCategory: string; locationClass: string; belowGround: boolean; isMachineryRoom: boolean; isOccupiedSpace: boolean; humanComfort: boolean; c3Applicable: boolean; mechVentilation: boolean; applicableSpaceTypes: string; }[]>([]);
  const [spaceTypes, setSpaceTypes] = useState<{ id: string; labelFr: string; labelEn: string; icon: string; accessCategory: string; locationClass: string; belowGround: boolean; isMachineryRoom: boolean; isOccupiedSpace: boolean; humanComfort: boolean; c3Applicable: boolean; mechVentilation: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Fetch API data on mount ──────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      fetch('/api/refrigerants-v5').then((r) => r.json()),
      fetch('/api/applications').then((r) => r.json()),
      fetch('/api/space-types').then((r) => r.json()),
    ])
      .then(([refs, apps, sts]) => {
        setRefrigerants(refs);
        setApplications(Array.isArray(apps) ? apps : []);
        setSpaceTypes(Array.isArray(sts) ? sts : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load configurator data:', err);
        setLoading(false);
      });
  }, []);

  // ─── Auto-select regulation based on country ────────────────────────

  useEffect(() => {
    const country = clientData.country;
    let reg: 'en378' | 'ashrae15' | 'iso5149';

    const enCountries = [
      'FR', 'SE', 'UK', 'DE', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT',
      'NO', 'DK', 'FI', 'PL', 'CZ', 'PT', 'IE', 'GR', 'RO', 'HU',
    ];

    if (enCountries.includes(country)) {
      reg = 'en378';
    } else if (country === 'US') {
      reg = 'ashrae15';
    } else {
      reg = 'iso5149';
    }

    if (gasAppData.regulation !== reg) {
      setGasAppData(prev => ({ ...prev, regulation: reg }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientData.country]);

  // ─── Pre-fill per-zone regulatory context when application changes ────

  useEffect(() => {
    if (!gasAppData.zoneType) return;
    const app = applications.find((a) => a.id === gasAppData.zoneType);
    if (!app) return;
    const appRegulatory: RegulatoryContext = {
      accessCategory: app.accessCategory as 'a' | 'b' | 'c',
      locationClass: app.locationClass as 'I' | 'II' | 'III' | 'IV',
      belowGround: app.belowGround,
      isMachineryRoom: app.isMachineryRoom,
      isOccupiedSpace: app.isOccupiedSpace,
      humanComfort: app.humanComfort,
      c3Applicable: app.c3Applicable,
      mechanicalVentilation: app.mechVentilation,
    };
    if (zones.length > 0) {
      setZones(zones.map(z => ({ ...z, regulatory: appRegulatory })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasAppData.zoneType, applications]);

  // ─── Clear validation errors when user modifies data ─────────────────────

  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientData, gasAppData, zones]);

  // ─── Draft: check localStorage on mount ─────────────────────────────────

  useEffect(() => {
    if (draftChecked.current) return;
    draftChecked.current = true;
    try {
      const raw = localStorage.getItem('saferef-wizard-draft');
      if (raw) {
        setHasDraft(true);
      }
    } catch { /* ignore */ }
  }, []);

  // ─── Draft: save to localStorage on step/data change ────────────────────

  useEffect(() => {
    if (loading) return;
    if (!clientData.firstName && !clientData.company && !gasAppData.zoneType && zones.length === 0) return;
    try {
      const draft = { step, clientData, gasAppData, zones };
      localStorage.setItem('saferef-wizard-draft', JSON.stringify(draft));
    } catch { /* ignore */ }
  }, [step, clientData, gasAppData, zones, loading]);

  function restoreDraft() {
    try {
      const raw = localStorage.getItem('saferef-wizard-draft');
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.clientData) setClientData(draft.clientData);
      if (draft.gasAppData) setGasAppData(draft.gasAppData);
      if (draft.zones) setZones(draft.zones);
      // Never restore to step 4 — calcResult is not saved in draft
      if (draft.step) setStep(draft.step >= 4 ? 3 : draft.step);
      setHasDraft(false);
      toast.success(NAV[lang].draftRestored);
    } catch { /* ignore */ }
  }

  function dismissDraft() {
    localStorage.removeItem('saferef-wizard-draft');
    setHasDraft(false);
  }

  // ─── Derived: selected refrigerant object ──────────────────────────────

  const selectedRefrigerant = useMemo(() => {
    if (!gasAppData.selectedRefrigerant) return null;
    return refrigerants.find((r) => r.id === gasAppData.selectedRefrigerant) ?? null;
  }, [gasAppData.selectedRefrigerant, refrigerants]);

  // ─── Selected application object ──────────────────────────────────────

  const selectedApplication = useMemo(() => {
    if (!gasAppData.zoneType) return null;
    return applications.find((a) => a.id === gasAppData.zoneType) ?? null;
  }, [gasAppData.zoneType, applications]);

  // Filter space types to only those applicable to the selected application
  const filteredSpaceTypes = useMemo(() => {
    if (!selectedApplication) return spaceTypes;
    try {
      const applicableIds: string[] = JSON.parse(selectedApplication.applicableSpaceTypes || '[]');
      if (applicableIds.length === 0) return spaceTypes;
      return spaceTypes.filter((st) => applicableIds.includes(st.id));
    } catch {
      return spaceTypes;
    }
  }, [selectedApplication, spaceTypes]);

  // ─── Run M1 engine on all zones ──────────────────────────────────────

  const runCalculation = useCallback(() => {
    if (!selectedRefrigerant || zones.length === 0) return null;

    const inputs = zones.map((zone) => ({
      zoneId: String(zone.id),
      zoneName: zone.name,
      refrigerant: selectedRefrigerant,
      charge: zone.charge,
      roomArea: zone.surface,
      roomHeight: zone.height,
      roomVolume: zone.volumeOverride || undefined,
      ...(zone.regulatory || defaultRegulatoryContext),
      leakSourceLocations: [
        ...zone.leakSources,
        ...(zone.evaporatorPositions || []).map(e => ({ id: e.id, description: '[evaporator]', x: e.x, y: e.y })),
      ],
      roomLength: zone.length || undefined,
      roomWidth: zone.width || undefined,
    }));

    try {
      const ruleSetMap = { en378: en378RuleSet, ashrae15: ashrae15RuleSet, iso5149: iso5149RuleSet } as const;
      const ruleSet = ruleSetMap[gasAppData.regulation] || en378RuleSet;
      return evaluateAllZones(ruleSet, inputs);
    } catch (err) {
      console.error('M1 engine error:', err);
      return null;
    }
  }, [selectedRefrigerant, zones, gasAppData.regulation]);

  // ─── Validation ────────────────────────────────────────────────────────

  function validateStep(current: number): boolean {
    const errors: Record<string, string> = {};

    if (current === 1) {
      const { firstName, lastName, company, email, projectName, rgpdConsent } = clientData;
      const v = VALIDATION[lang];
      if (!rgpdConsent) errors.rgpdConsent = v.rgpdConsent;
      if (!firstName.trim()) errors.firstName = v.firstName;
      if (!lastName.trim()) errors.lastName = v.lastName;
      if (!company.trim()) errors.company = v.company;
      if (!email.trim()) errors.email = v.email;
      if (!projectName.trim()) errors.projectName = v.projectName;
    }

    if (current === 2) {
      if (!gasAppData.zoneType) errors.zoneType = VALIDATION[lang].zoneType;
      if (!gasAppData.selectedRefrigerant) errors.selectedRefrigerant = VALIDATION[lang].selectedRefrigerant;
    }

    if (current === 3) {
      if (zones.length === 0) {
        errors.zones = VALIDATION[lang].zones;
      } else {
        for (const z of zones) {
          if (z.surface <= 0 || z.height <= 0 || z.charge <= 0) {
            errors.zones = VALIDATION[lang].zonesInvalid;
            break;
          }
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ─── Navigation ────────────────────────────────────────────────────────

  function nextStep() {
    if (!validateStep(step)) return;
    setValidationErrors({});

    if (step === 3) {
      // Run M1 calculation before entering Step 4
      const result = runCalculation();
      if (!result) {
        setValidationErrors({ calculation: VALIDATION[lang].calculation });
        return;
      }
      setCalcResult(result);
      setStep(4);
      // Clear draft on successful calculation
      try { localStorage.removeItem('saferef-wizard-draft'); } catch { /* ignore */ }
      return;
    }

    setStep((s) => Math.min(s + 1, 5));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  // ─── Loading state ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white px-6 py-4 flex items-center justify-between print:hidden border-b-2 border-[#E63946]">
        <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <span className="text-[#E63946] font-extrabold text-xl tracking-wide">Safe</span>
          <span className="text-white font-extrabold text-xl">Ref</span>
          <span className="ml-3 text-sm text-[#6b8da5]">Calculator</span>
        </Link>
        <LanguageSwitcher compact />
      </nav>

      {/* Step progress */}
      <StepProgress current={step} lang={lang} />

      {/* Draft restoration banner */}
      {hasDraft && step === 1 && (
        <div className="max-w-4xl mx-auto w-full px-4 mt-4">
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-amber-800">
                {NAV[lang].draftResume}
              </span>
              <span className="text-sm text-amber-600 ml-2">
                {NAV[lang].draftFound}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={restoreDraft}
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-1.5 rounded transition-colors"
              >
                {NAV[lang].restore}
              </button>
              <button
                onClick={dismissDraft}
                className="text-amber-600 hover:text-amber-800 text-sm font-medium px-3 py-1.5 transition-colors"
              >
                {NAV[lang].dismiss}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Step 1 — Client */}
        {step === 1 && (
          <StepClient data={clientData} onChange={setClientData} lang={lang} />
        )}

        {/* Step 2 — Gas & Application */}
        {step === 2 && (
          <StepGasApp
            data={gasAppData}
            onChange={setGasAppData}
            refrigerants={refrigerants.map((r) => ({
              id: r.id,
              name: r.name,
              safetyClass: r.safetyClass,
              gasGroup: r.gasGroup,
            }))}
            applications={applications.map((a) => ({
              id: a.id,
              labelFr: a.labelFr,
              labelEn: a.labelEn,
              icon: a.icon,
              suggestedGases: (a as Record<string, unknown>).suggestedGases as string | undefined,
              defaultRanges: (a as Record<string, unknown>).defaultRanges as string | undefined,
            }))}
            lang={lang}
            country={clientData.country}
          />
        )}

        {/* Step 3 — Zones */}
        {step === 3 && (
          <StepZones
            zones={zones}
            onZonesChange={setZones}
            refrigerant={selectedRefrigerant}
            zoneType={gasAppData.zoneType}
            spaceTypes={filteredSpaceTypes}
            lang={lang}
          />
        )}

        {/* Step 4 — Calculation Sheet */}
        {step === 4 && calcResult && selectedRefrigerant && (
          <StepCalcSheet
            clientData={clientData}
            gasAppData={gasAppData}
            zones={zones}
            refrigerant={selectedRefrigerant}
            application={selectedApplication ? { id: selectedApplication.id, labelFr: selectedApplication.labelFr, labelEn: selectedApplication.labelEn, icon: selectedApplication.icon } : null}
            spaceTypes={spaceTypes.map(st => ({ id: st.id, labelFr: st.labelFr, labelEn: st.labelEn, icon: st.icon }))}
            zoneRegulations={calcResult.zoneResults}
            lang={lang}
          />
        )}

        {/* Step 5 — Technical */}
        {step === 5 && (
          <StepTechnical
            voltage={siteVoltage}
            atexRequired={atexRequired}
            mountType={mountType}
            onVoltageChange={setSiteVoltage}
            onAtexChange={setAtexRequired}
            onMountChange={setMountType}
          />
        )}

        {/* Step 6 — Products */}
        {step === 6 && calcResult && selectedRefrigerant && (
          <StepProducts
            clientData={clientData}
            gasAppData={{ ...gasAppData, sitePowerVoltage: siteVoltage, zoneAtex: atexRequired, mountingType: mountType }}
            zones={zones}
            refrigerant={selectedRefrigerant}
            zoneRegulations={calcResult.zoneResults}
            application={selectedApplication}
            spaceTypes={spaceTypes.map(st => ({ id: st.id, labelFr: st.labelFr, labelEn: st.labelEn, icon: st.icon }))}
            lang={lang}
          />
        )}

        {/* Validation errors */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-1">
            {Object.entries(validationErrors).map(([key, msg]) => (
              <p key={key} className="text-sm text-red-600 font-medium">{msg}</p>
            ))}
          </div>
        )}

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="flex justify-between mt-8 print:hidden">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                {NAV[lang].back}
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={nextStep}
              className="bg-gradient-to-r from-[#A7C031] to-[#8fb028] hover:from-[#8fb028] hover:to-[#7da024] text-white font-bold px-8 py-3 rounded-lg transition-all shadow-lg shadow-[#A7C031]/30"
            >
              {step === 3 ? NAV[lang].calculate : NAV[lang].next}
            </button>
          </div>
        )}

        {/* Back + Continue on Step 4 (CalcSheet → Technical) */}
        {step === 4 && (
          <div className="mt-6 print:hidden flex gap-3">
            <button
              onClick={prevStep}
              className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {NAV[lang].back}
            </button>
            <button
              onClick={() => setStep(5)}
              className="bg-gradient-to-r from-[#A7C031] to-[#8fb028] hover:from-[#8fb028] hover:to-[#7da024] text-white font-bold px-8 py-3 rounded-lg transition-all shadow-lg shadow-[#A7C031]/30"
            >
              Continue to Technical &rarr;
            </button>
          </div>
        )}

        {/* Back + Continue on Step 5 (Technical → Products) */}
        {step === 5 && (
          <div className="flex justify-between mt-8 print:hidden">
            <button
              onClick={() => setStep(4)}
              className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {NAV[lang].back}
            </button>
            <button
              onClick={() => setStep(6)}
              className="bg-gradient-to-r from-[#A7C031] to-[#8fb028] hover:from-[#8fb028] hover:to-[#7da024] text-white font-bold px-8 py-3 rounded-lg transition-all shadow-lg shadow-[#A7C031]/30"
            >
              View Product Recommendations &rarr;
            </button>
          </div>
        )}

        {/* Back button on Step 6 (Products) */}
        {step === 6 && (
          <div className="mt-6 print:hidden">
            <button
              onClick={() => setStep(5)}
              className="border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {NAV[lang].back}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
