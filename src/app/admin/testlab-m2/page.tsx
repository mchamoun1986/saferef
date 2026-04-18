'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ProductRecord, DiscountRow } from '@/lib/m2-engine/types';
import type { SelectionInput, SelectionResult, PricingInput, PricingResult, TierSolution, PricedTier, TierSlot } from '@/lib/engine-types';
import type { ProductRelation } from '@/lib/m2-engine/relation-types';
import { toProductEntries } from '@/lib/m2-engine/parse-product';
import { selectProducts, REF_RANGES } from '@/lib/m2-engine/selection-engine';
import { calculatePricing } from '@/lib/m2-engine/pricing-engine';

// ── Preset scenarios ─────────────────────────────────────────────────────

interface Preset {
  label: string;
  refrigerant: string;
  zoneType: string;
  totalDetectors: number;
  voltage: '12V' | '24V' | '230V';
  outputRequired: string;
  zoneAtex: boolean;
  customerGroup: string;
}

const PRESETS: Preset[] = [
  { label: 'R744 Supermarket 4det', refrigerant: 'R744', zoneType: 'supermarket', totalDetectors: 4, voltage: '24V', outputRequired: 'any', zoneAtex: false, customerGroup: 'EDC' },
  { label: 'R717 Machinery 6det', refrigerant: 'R717', zoneType: 'machinery_room', totalDetectors: 6, voltage: '24V', outputRequired: 'modbus', zoneAtex: false, customerGroup: '1Fo' },
  { label: 'R290 Cold Room 2det', refrigerant: 'R290', zoneType: 'cold_room', totalDetectors: 2, voltage: '230V', outputRequired: 'relay', zoneAtex: true, customerGroup: 'EDC' },
  { label: 'R32 Hotel 1det', refrigerant: 'R32', zoneType: 'hotel', totalDetectors: 1, voltage: '24V', outputRequired: 'any', zoneAtex: false, customerGroup: 'BKund' },
  { label: 'CO Parking 8det', refrigerant: 'CO', zoneType: 'parking', totalDetectors: 8, voltage: '24V', outputRequired: '420mA', zoneAtex: false, customerGroup: 'OEM' },
];

const APPLICATIONS = [
  'supermarket', 'cold_room', 'machinery_room', 'cold_storage',
  'hotel', 'office', 'parking', 'ice_rink', 'heat_pump',
  'pressure_relief', 'duct', 'atex_zone', 'water_brine',
];

const OUTPUTS = [
  { value: 'any', label: 'Any', sub: 'No filter' },
  { value: 'relay', label: 'Relay', sub: 'Built-in' },
  { value: '420mA', label: '4-20mA', sub: 'Analog' },
  { value: '010V', label: '0-10V', sub: 'Analog' },
  { value: 'modbus', label: 'Modbus', sub: 'RS485' },
  { value: 'relay_analog_modbus', label: 'All', sub: 'Relay+Analog+Bus' },
];

const CUSTOMER_GROUPS = ['', 'EDC', 'OEM', '1Fo', '2Fo', '3Fo', '1Contractor', '2Contractor', '3Contractor', 'AKund', 'BKund', 'NO'];

const TIER_SLOTS: { key: TierSlot; label: string; icon: string; color: { border: string; accent: string; bg: string } }[] = [
  { key: 'premiumStandalone', label: 'Premium SA', icon: 'PS', color: { border: 'border-red-600', accent: 'text-red-400', bg: 'bg-red-600/20' } },
  { key: 'premiumCentralized', label: 'Premium Ctrl', icon: 'PC', color: { border: 'border-pink-600', accent: 'text-pink-400', bg: 'bg-pink-600/20' } },
  { key: 'ecoStandalone', label: 'Eco SA', icon: 'ES', color: { border: 'border-blue-600', accent: 'text-blue-400', bg: 'bg-blue-600/20' } },
  { key: 'ecoCentralized', label: 'Eco Ctrl', icon: 'EC', color: { border: 'border-green-600', accent: 'text-green-400', bg: 'bg-green-600/20' } },
];

// ── Shared UI components ────────────────────────────────────────────────

function Section({ title, icon, defaultOpen = true, accent, children }: {
  title: string; icon: string; defaultOpen?: boolean; accent?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-[#2a2e3d] bg-[#1a1d28] overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#22263a] transition-colors">
        <span className="text-base">{icon}</span>
        <span className={`font-semibold text-sm flex-1 ${accent ?? 'text-gray-200'}`}>{title}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer group">
      <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-[#2a2e3d]'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );
}

function NumInput({ label, value, onChange, unit, min, step }: {
  label: string; value: number; onChange: (v: number) => void; unit: string; min?: number; step?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" value={value || ''} onChange={e => onChange(parseFloat(e.target.value) || 0)}
          min={min ?? 0} step={step ?? 1}
          className="flex-1 bg-[#0f1117] border border-[#2a2e3d] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none" />
        <span className="text-xs text-gray-500 w-8">{unit}</span>
      </div>
    </div>
  );
}

function JsonViewer({ data }: { data: unknown }) {
  return (
    <pre className="bg-[#0f1117] border border-[#2a2e3d] rounded-lg p-4 text-xs text-green-400 overflow-auto max-h-[600px] font-mono leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// ── Decision Banner ─────────────────────────────────────────────────────

function M2DecisionBanner({ selResult, pricingResult }: { selResult: SelectionResult; pricingResult: PricingResult }) {
  const hasTiers = [selResult.tiers.premiumStandalone, selResult.tiers.premiumCentralized, selResult.tiers.ecoStandalone, selResult.tiers.ecoCentralized].filter(Boolean).length;

  return (
    <div className={`rounded-lg border-2 p-6 text-center ${
      hasTiers > 0 ? 'bg-green-600/20 border-green-600' : 'bg-red-600/20 border-red-600'
    }`}>
      <div className={`text-3xl font-black tracking-widest ${hasTiers > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {hasTiers > 0 ? `${hasTiers} SOLUTION${hasTiers > 1 ? 'S' : ''} FOUND` : 'NO COMPATIBLE PRODUCTS'}
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <span>Quote: <strong className="text-gray-300">{pricingResult.quoteRef}</strong></span>
        <span>Valid: <strong className="text-gray-300">{pricingResult.quoteValidUntil}</strong></span>
        <span>Warnings: <strong className={pricingResult.warnings.length > 0 ? 'text-amber-400' : 'text-gray-300'}>{pricingResult.warnings.length}</strong></span>
      </div>
    </div>
  );
}

// ── Tier Card ────────────────────────────────────────────────────────────

function TierCard({ tierKey, selTier, pricedTier }: {
  tierKey: TierSlot; selTier: TierSolution | null; pricedTier: PricedTier | null;
}) {
  if (!selTier || !pricedTier) return null;
  const slot = TIER_SLOTS.find(s => s.key === tierKey);
  const c = slot?.color ?? { border: 'border-gray-600', accent: 'text-gray-400', bg: 'bg-gray-600/20' };

  return (
    <Section
      title={`${slot?.label ?? tierKey} — ${selTier.label}`}
      icon={slot?.icon ?? '?'}
      defaultOpen={tierKey === 'premiumStandalone'}
      accent={c.accent}
    >
      {/* Detector summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Detector</div>
          <div className="text-lg font-semibold text-white">{selTier.detector.name}</div>
          <div className="text-xs text-gray-400 mt-0.5 font-mono">{selTier.detector.code}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Specs</div>
          <div className="text-sm text-gray-300">
            {selTier.detector.qty}x &middot; {selTier.detector.sensorTech ?? '?'} &middot; {selTier.detector.range ?? '?'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {selTier.controller ? `${selTier.controller.qty}x ${selTier.controller.name}` : 'Standalone — no controller'}
          </div>
        </div>
      </div>

      {/* BOM table */}
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 uppercase tracking-wider border-b border-[#2a2e3d]">
              <th className="text-left py-2 px-2">Code</th>
              <th className="text-left py-2 px-2">Designation</th>
              <th className="text-center py-2 px-2">Grp</th>
              <th className="text-center py-2 px-2">Qty</th>
              <th className="text-right py-2 px-2">List</th>
              <th className="text-right py-2 px-2">Disc%</th>
              <th className="text-right py-2 px-2">Net</th>
            </tr>
          </thead>
          <tbody>
            {pricedTier.bomLines.map((line, i) => (
              <tr key={i} className="border-t border-[#2a2e3d]">
                <td className="py-1.5 px-2 font-mono text-white">{line.code}</td>
                <td className="py-1.5 px-2 text-gray-300 max-w-[200px] truncate">{line.name}</td>
                <td className="py-1.5 px-2 text-center text-gray-500">{line.productGroup}</td>
                <td className="py-1.5 px-2 text-center text-gray-400">{line.qty}</td>
                <td className="py-1.5 px-2 text-right text-gray-400 font-mono">{line.listPrice.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right text-amber-400">{line.discountPct > 0 ? `-${line.discountPct}%` : '-'}</td>
                <td className="py-1.5 px-2 text-right font-semibold text-green-400 font-mono">{line.netTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#2a2e3d]">
              <td colSpan={4} className="py-2 px-2 text-right text-gray-500 text-xs">Totals</td>
              <td className="py-2 px-2 text-right text-gray-300 font-mono">{pricedTier.summary.totalBeforeDiscount.toFixed(2)}</td>
              <td className="py-2 px-2 text-right text-red-400 font-mono">-{pricedTier.summary.totalDiscount.toFixed(2)}</td>
              <td className="py-2 px-2 text-right font-bold text-green-400 text-sm font-mono">{pricedTier.summary.totalHt.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="text-xs text-gray-600">Validation: {pricedTier.priceValidation}</div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════

export default function TestLabM2Page() {
  const [rawProducts, setRawProducts] = useState<ProductRecord[]>([]);
  const [discountMatrix, setDiscountMatrix] = useState<DiscountRow[]>([]);
  const [relations, setRelations] = useState<ProductRelation[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [refrigerant, setRefrigerant] = useState('R744');
  const [selectedRange, setSelectedRange] = useState('');
  const [zoneType, setZoneType] = useState('supermarket');
  const [zoneAtex, setZoneAtex] = useState(false);
  const [outputRequired, setOutputRequired] = useState('any');
  const [voltage, setVoltage] = useState<'12V' | '24V' | '230V'>('24V');
  const [mountingType, setMountingType] = useState('wall');
  const [totalDetectors, setTotalDetectors] = useState(4);
  const [customerGroup, setCustomerGroup] = useState('EDC');

  // Results
  const [selectionResult, setSelectionResult] = useState<SelectionResult | null>(null);
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  const [runTime, setRunTime] = useState<number>(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?discontinued=false').then(r => r.json()),
      fetch('/api/discount-matrix').then(r => r.json()).catch(() => []),
      fetch('/api/product-relations').then(r => r.json()).catch(() => []),
    ]).then(([prods, dm, rels]) => {
      setRawProducts(prods);
      setDiscountMatrix(Array.isArray(dm) ? dm : []);
      setRelations(Array.isArray(rels) ? rels : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const { products, controllers, accessories } = useMemo(
    () => toProductEntries(rawProducts),
    [rawProducts],
  );

  const ranges = REF_RANGES[refrigerant] ?? [];

  const priceDb = useMemo(() => {
    const db = new Map<string, { price: number; productGroup: string; discontinued: boolean }>();
    for (const p of rawProducts) {
      db.set(p.code, { price: p.price, productGroup: p.productGroup || 'G', discontinued: p.discontinued });
    }
    return db;
  }, [rawProducts]);

  const loadPreset = useCallback((p: Preset) => {
    setRefrigerant(p.refrigerant);
    setSelectedRange('');
    setZoneType(p.zoneType);
    setTotalDetectors(p.totalDetectors);
    setVoltage(p.voltage);
    setOutputRequired(p.outputRequired);
    setZoneAtex(p.zoneAtex);
    setCustomerGroup(p.customerGroup);
    setSelectionResult(null);
    setPricingResult(null);
  }, []);

  const handleRun = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const start = performance.now();

      const input: SelectionInput = {
        regulationResult: {} as SelectionInput['regulationResult'],
        totalDetectors,
        selectedRefrigerant: refrigerant,
        selectedRange: selectedRange || undefined,
        zoneType,
        zoneAtex,
        outputRequired,
        sitePowerVoltage: voltage,
        mountingType,
        projectCountry: 'SE',
        products,
        controllers,
        accessories,
        relations,
      };

      const sel = selectProducts(input);
      setSelectionResult(sel);

      const pInput: PricingInput = {
        tiers: sel.tiers,
        customerGroup: (customerGroup || 'NO') as PricingInput['customerGroup'],
        discountMatrix,
        priceDb,
      };
      const pricing = calculatePricing(pInput);
      setPricingResult(pricing);

      setRunTime(Math.round(performance.now() - start));
      setRunning(false);
    }, 50);
  }, [totalDetectors, refrigerant, selectedRange, zoneType, zoneAtex, outputRequired, voltage, mountingType, products, controllers, accessories, customerGroup, discountMatrix, priceDb, relations]);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="flex min-h-[calc(100vh-48px)]">
      {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
      <aside className="w-[370px] shrink-0 bg-[#1a1d28] border-r border-[#2a2e3d] overflow-y-auto sticky top-0 h-screen">
        <div className="p-5 flex flex-col gap-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                SAFEREF TESTLAB
              </span>
              <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                M2/M3
              </span>
            </div>
            <h1 className="text-lg font-bold text-white mt-2">Selection + Pricing Simulator</h1>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? 'Loading...' : `${products.length} detectors, ${controllers.length} controllers, ${accessories.length} accessories`}
            </p>
          </div>

          {/* Presets */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Quick Presets</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => loadPreset(p)}
                  className="px-2.5 py-1.5 rounded text-xs border border-[#2a2e3d] bg-[#0f1117] text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Refrigerant */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Refrigerant</div>
            <input type="text" value={refrigerant} onChange={e => setRefrigerant(e.target.value)}
              placeholder="R744, R717, R32..."
              className="w-full bg-[#0f1117] border border-[#2a2e3d] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            {ranges.length > 0 && (
              <select value={selectedRange} onChange={e => setSelectedRange(e.target.value)}
                className="w-full mt-2 bg-[#0f1117] border border-[#2a2e3d] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="">Auto range (default)</option>
                {ranges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            )}
          </div>

          {/* Application */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Application</div>
            <select value={zoneType} onChange={e => setZoneType(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2a2e3d] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
              {APPLICATIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          {/* Detectors + Voltage */}
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Total Detectors" value={totalDetectors} onChange={setTotalDetectors} unit="det" min={1} step={1} />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Voltage</div>
              <div className="flex gap-1">
                {(['12V', '24V', '230V'] as const).map(v => (
                  <button key={v} onClick={() => setVoltage(v)}
                    className={`flex-1 px-2 py-2 rounded text-xs font-medium transition-all ${
                      voltage === v ? 'bg-blue-600 text-white' : 'bg-[#0f1117] border border-[#2a2e3d] text-gray-400 hover:border-gray-600'
                    }`}>{v}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Output */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Output Required</div>
            <div className="grid grid-cols-3 gap-1.5">
              {OUTPUTS.map(o => (
                <button key={o.value} onClick={() => setOutputRequired(o.value)}
                  className={`rounded border px-2 py-1.5 text-left transition-all ${
                    outputRequired === o.value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-[#2a2e3d] bg-[#0f1117] text-gray-400 hover:border-gray-600'
                  }`}>
                  <div className="text-xs font-medium">{o.label}</div>
                  <div className="text-[9px] opacity-60">{o.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mounting */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Mounting</div>
            <div className="flex flex-wrap gap-1">
              {[{v:'wall',l:'Wall'},{v:'pipe',l:'Pipe'},{v:'duct',l:'Duct'},{v:'flush',l:'Flush'},{v:'surface',l:'Surface'}].map(m => (
                <button key={m.v} onClick={() => setMountingType(m.v)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${mountingType === m.v ? 'bg-blue-600 text-white border-blue-600' : 'bg-[#0f1117] text-gray-400 border-[#2a2e3d] hover:border-gray-500'}`}>
                  {m.l}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Flags</div>
            <Toggle label="ATEX Zone 1" checked={zoneAtex} onChange={setZoneAtex} />
          </div>

          {/* Customer Group */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer Group</div>
            <select value={customerGroup} onChange={e => setCustomerGroup(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2a2e3d] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="">(none — gross only)</option>
              {CUSTOMER_GROUPS.filter(Boolean).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* RUN button */}
          <button onClick={handleRun} disabled={loading || running}
            className="w-full py-3 rounded-lg text-white font-bold text-sm tracking-wider bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/30">
            {running ? 'CALCULATING...' : 'RUN M2 + M3'}
          </button>

          {runTime > 0 && (
            <div className="text-xs text-gray-600 text-center font-mono">{runTime}ms &middot; {products.length} products scanned</div>
          )}
        </div>
      </aside>

      {/* ── RIGHT MAIN AREA ──────────────────────────────────────────── */}
      <main className="flex-1 bg-[#0f1117] overflow-y-auto p-6">
        {/* Empty state */}
        {!selectionResult && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl text-gray-800 mb-4">&gt;_</div>
              <h2 className="text-xl text-gray-600 font-semibold">M2 Selection + M3 Pricing</h2>
              <p className="text-gray-700 text-sm mt-2 max-w-md">
                Configure the parameters on the left panel and click{' '}
                <span className="text-green-500 font-semibold">RUN M2 + M3</span> to see filter pipeline, scoring, 2x2 matrix BOM, and pricing.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {selectionResult && pricingResult && (
          <div className="flex flex-col gap-5 max-w-4xl mx-auto">
            {/* 1 — Decision Banner */}
            <M2DecisionBanner selResult={selectionResult} pricingResult={pricingResult} />

            {/* 2 — Filter Pipeline */}
            {selectionResult.trace && (
              <Section title={`Filter Pipeline (${selectionResult.trace.filterPipeline.length} steps)`} icon="F" accent="text-cyan-400">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 uppercase tracking-wider">
                        <th className="text-left py-2 px-2">Filter</th>
                        <th className="text-center py-2 px-2">In</th>
                        <th className="text-center py-2 px-2">Out</th>
                        <th className="text-center py-2 px-2">Eliminated</th>
                        <th className="text-left py-2 px-2">Dropped</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectionResult.trace.filterPipeline.map(f => (
                        <tr key={f.name} className={`border-t border-[#2a2e3d] ${f.eliminated > 0 ? 'text-amber-300' : 'text-gray-400'}`}>
                          <td className="py-2 px-2 font-mono">{f.name}</td>
                          <td className="py-2 px-2 text-center">{f.inputCount}</td>
                          <td className="py-2 px-2 text-center font-semibold text-white">{f.outputCount}</td>
                          <td className="py-2 px-2 text-center">
                            {f.eliminated > 0 ? (
                              <span className="bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">-{f.eliminated}</span>
                            ) : (
                              <span className="text-gray-600">0</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-gray-600 font-mono text-[10px] max-w-[200px] truncate">
                            {f.eliminatedProducts?.join(', ') || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Final pool: <strong className="text-white">{selectionResult.trace.afterFilters}</strong> candidates after all filters
                </div>
              </Section>
            )}

            {/* 3 — Scored Candidates */}
            {selectionResult.trace && selectionResult.trace.scored.length > 0 && (
              <Section title={`Scored Candidates (${selectionResult.trace.scored.length})`} icon="S" defaultOpen={false} accent="text-amber-400">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 uppercase tracking-wider border-b border-[#2a2e3d]">
                        <th className="text-left py-2 px-2">Code</th>
                        <th className="text-left py-2 px-2">Name</th>
                        <th className="text-center py-2 px-2">Family</th>
                        <th className="text-center py-2 px-2">Tier</th>
                        <th className="text-center py-2 px-2">Score</th>
                        <th className="text-right py-2 px-2">Price</th>
                        <th className="text-center py-2 px-2">SA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...selectionResult.trace.scored].sort((a, b) => b.score.total - a.score.total).map(s => {
                        const isPicked = selectionResult.trace?.tierPicks.some(tp => tp.picked === s.id) ?? false;
                        return (
                          <tr key={s.id} className={`border-t border-[#2a2e3d] ${isPicked ? 'bg-blue-900/20' : ''}`}>
                            <td className="py-1.5 px-2 font-mono text-white">{s.code}</td>
                            <td className="py-1.5 px-2 text-gray-300 max-w-[180px] truncate">{s.name}</td>
                            <td className="py-1.5 px-2 text-center text-gray-400">{s.family}</td>
                            <td className="py-1.5 px-2 text-center text-gray-500">{s.tier}</td>
                            <td className="py-1.5 px-2 text-center font-bold text-blue-400">{s.score.total}/21</td>
                            <td className="py-1.5 px-2 text-right font-mono text-gray-300">{s.price}</td>
                            <td className="py-1.5 px-2 text-center">{s.standalone ? 'Y' : 'N'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* 4 — Tier Picks */}
            {selectionResult.trace && (
              <Section title="Tier Selection Logic" icon="T" accent="text-purple-400">
                <div className="flex flex-col gap-3">
                  {selectionResult.trace.tierPicks.map(tp => (
                    <div key={tp.tier} className={`rounded border px-4 py-3 ${
                      tp.picked ? 'border-green-800/50 bg-green-900/10' : 'border-[#2a2e3d] bg-[#0f1117]'
                    }`}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`font-bold text-sm ${tp.picked ? 'text-green-400' : 'text-gray-600'}`}>{tp.tier}</span>
                        <span className="text-xs text-gray-500">{tp.candidateCount} candidates</span>
                        {tp.picked && <span className="text-[10px] bg-green-700 text-white px-1.5 py-0.5 rounded font-bold">PICKED</span>}
                      </div>
                      <div className="text-xs text-gray-400">{tp.reason}</div>
                      {tp.candidates.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {tp.candidates.map(c => (
                            <span key={c.id} className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              c.id === tp.picked ? 'bg-green-800/40 text-green-300' : 'bg-[#1a1d28] text-gray-500'
                            }`}>
                              {c.code} ({c.score}/21, {c.price}EUR)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* 5 — Tier Solutions (BOM + Pricing) */}
            {TIER_SLOTS.map(({ key }) => (
              <TierCard
                key={key}
                tierKey={key}
                selTier={selectionResult.tiers[key]}
                pricedTier={pricingResult.tiers[key]}
              />
            ))}

            {/* 6 — Comparison Table */}
            {pricingResult.comparison.rows.length > 0 && (
              <Section title="Solution Comparison" icon="=" accent="text-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 uppercase tracking-wider border-b border-[#2a2e3d]">
                      <th className="text-left py-2 px-2 w-[140px]">Criteria</th>
                      <th className="text-center py-2 px-2 text-red-400">Prem SA</th>
                      <th className="text-center py-2 px-2 text-pink-400">Prem Ctrl</th>
                      <th className="text-center py-2 px-2 text-blue-400">Eco SA</th>
                      <th className="text-center py-2 px-2 text-green-400">Eco Ctrl</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingResult.comparison.rows.map((row, i) => (
                      <tr key={i} className="border-t border-[#2a2e3d]">
                        <td className="py-2 px-2 text-gray-400 font-medium">{row.label}</td>
                        <td className="py-2 px-2 text-center text-gray-200">{row.premiumStandalone}</td>
                        <td className="py-2 px-2 text-center text-gray-200">{row.premiumCentralized}</td>
                        <td className="py-2 px-2 text-center text-gray-200">{row.ecoStandalone}</td>
                        <td className="py-2 px-2 text-center text-gray-200">{row.ecoCentralized}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            )}

            {/* 7 — Warnings */}
            {pricingResult.warnings.length > 0 && (
              <Section title={`Warnings (${pricingResult.warnings.length})`} icon="!" accent="text-amber-400">
                <ul className="flex flex-col gap-1">
                  {pricingResult.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-amber-300 bg-amber-900/10 border border-amber-800/30 rounded px-3 py-1.5 font-mono text-xs">
                      {w}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* 8 — Full JSON */}
            <Section title="Full JSON Output" icon="{}" defaultOpen={false} accent="text-green-400">
              <JsonViewer data={{ selection: selectionResult, pricing: pricingResult }} />
            </Section>
          </div>
        )}
      </main>
    </div>
  );
}
