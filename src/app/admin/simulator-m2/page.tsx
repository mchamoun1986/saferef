'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ProductRecord, DiscountRow } from '@/lib/m2-engine/types';
import type { SelectionInput, SelectionResult, PricingInput, PricingResult, PricedTier, TierSlot } from '@/lib/engine-types';
import type { ProductRelation } from '@/lib/m2-engine/relation-types';
import { toProductEntries } from '@/lib/m2-engine/parse-product';
import { selectProducts, REF_RANGES } from '@/lib/m2-engine/selection-engine';
import { calculatePricing } from '@/lib/m2-engine/pricing-engine';

// ── Interfaces ───────────────────────────────────────────────────────────

interface SimInputs {
  refrigerant: string;
  selectedRange: string;
  zoneType: string;
  totalDetectors: number;
  voltage: '12V' | '24V' | '230V';
  outputRequired: string;
  zoneAtex: boolean;
  mountingType: string;
  customerGroup: string;
}

interface SimResult {
  id: number;
  timestamp: string;
  inputs: SimInputs;
  selection: SelectionResult;
  pricing: PricingResult;
  runMs: number;
}

// ── Presets ──────────────────────────────────────────────────────────────

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
  { label: 'R290 ATEX 2det 230V', refrigerant: 'R290', zoneType: 'cold_room', totalDetectors: 2, voltage: '230V', outputRequired: 'relay', zoneAtex: true, customerGroup: 'EDC' },
  { label: 'R32 Hotel 1det', refrigerant: 'R32', zoneType: 'hotel', totalDetectors: 1, voltage: '24V', outputRequired: 'any', zoneAtex: false, customerGroup: 'BKund' },
  { label: 'CO Parking 8det', refrigerant: 'CO', zoneType: 'parking', totalDetectors: 8, voltage: '24V', outputRequired: '420mA', zoneAtex: false, customerGroup: 'OEM' },
  { label: 'R744 Cold Storage 10det', refrigerant: 'R744', zoneType: 'cold_storage', totalDetectors: 10, voltage: '24V', outputRequired: 'modbus', zoneAtex: false, customerGroup: '2Fo' },
];

const APPLICATIONS = [
  'supermarket', 'cold_room', 'machinery_room', 'cold_storage',
  'hotel', 'office', 'parking', 'ice_rink', 'heat_pump',
  'pressure_relief', 'duct', 'atex_zone', 'water_brine',
];
const CUSTOMER_GROUPS = ['', 'EDC', 'OEM', '1Fo', '2Fo', '3Fo', '1Contractor', '2Contractor', '3Contractor', 'AKund', 'BKund', 'NO'];

const DEFAULT_INPUTS: SimInputs = {
  refrigerant: 'R744', selectedRange: '', zoneType: 'supermarket',
  totalDetectors: 4, voltage: '24V', outputRequired: 'any',
  zoneAtex: false, mountingType: 'wall', customerGroup: 'EDC',
};

const TIER_SLOTS: { key: TierSlot; label: string; color: string }[] = [
  { key: 'premiumStandalone', label: 'Premium SA', color: '#E63946' },
  { key: 'premiumCentralized', label: 'Premium Ctrl', color: '#c2185b' },
  { key: 'ecoStandalone', label: 'Eco SA', color: '#2563eb' },
  { key: 'ecoCentralized', label: 'Eco Ctrl', color: '#16a34a' },
];

// ── Render helpers ───────────────────────────────────────────────────────

function scoreBadge(score: number) {
  const color = score >= 15 ? 'text-green-700 bg-green-50 border-green-200' : score >= 10 ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-gray-700 bg-gray-50 border-gray-200';
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${color}`}>{score}/21</span>;
}

// ── Main Component ───────────────────────────────────────────────────────

export default function SimulatorM2Page() {
  const [rawProducts, setRawProducts] = useState<ProductRecord[]>([]);
  const [discountMatrix, setDiscountMatrix] = useState<DiscountRow[]>([]);
  const [relations, setRelations] = useState<ProductRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<SimInputs>(DEFAULT_INPUTS);
  const [history, setHistory] = useState<SimResult[]>([]);
  const [nextId, setNextId] = useState(1);

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

  const { products, controllers, accessories } = useMemo(() => toProductEntries(rawProducts), [rawProducts]);
  const ranges = REF_RANGES[inputs.refrigerant] ?? [];
  const priceDb = useMemo(() => {
    const db = new Map<string, { price: number; productGroup: string; discontinued: boolean }>();
    for (const p of rawProducts) db.set(p.code, { price: p.price, productGroup: p.productGroup || 'G', discontinued: p.discontinued });
    return db;
  }, [rawProducts]);

  const set = useCallback(<K extends keyof SimInputs>(field: K, value: SimInputs[K]) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  const liveResults = useMemo(() => {
    if (products.length === 0) return null;
    // eslint-disable-next-line react-hooks/purity
    const start = performance.now();
    const selInput: SelectionInput = {
      regulationResult: {} as SelectionInput['regulationResult'],
      totalDetectors: inputs.totalDetectors,
      selectedRefrigerant: inputs.refrigerant,
      selectedRange: inputs.selectedRange || undefined,
      zoneType: inputs.zoneType,
      zoneAtex: inputs.zoneAtex,
      outputRequired: inputs.outputRequired,
      sitePowerVoltage: inputs.voltage,
      mountingType: inputs.mountingType,
      projectCountry: 'SE',
      products, controllers, accessories,
      relations,
    };
    const selection = selectProducts(selInput);
    const pricingInput: PricingInput = {
      tiers: selection.tiers,
      customerGroup: (inputs.customerGroup || 'NO') as PricingInput['customerGroup'],
      discountMatrix, priceDb,
    };
    const pricing = calculatePricing(pricingInput);
    // eslint-disable-next-line react-hooks/purity
    const runMs = Math.round(performance.now() - start);
    return { selection, pricing, runMs };
  }, [products, controllers, accessories, inputs, discountMatrix, priceDb, relations]);

  const applyPreset = useCallback((p: Preset) => {
    setInputs({
      refrigerant: p.refrigerant, selectedRange: '', zoneType: p.zoneType,
      totalDetectors: p.totalDetectors, voltage: p.voltage, outputRequired: p.outputRequired,
      zoneAtex: p.zoneAtex, mountingType: 'wall', customerGroup: p.customerGroup,
    });
  }, []);

  const saveToHistory = useCallback(() => {
    if (!liveResults) return;
    setHistory(prev => [{
      id: nextId, timestamp: new Date().toISOString(),
      inputs: { ...inputs },
      selection: liveResults.selection, pricing: liveResults.pricing,
      runMs: liveResults.runMs,
    }, ...prev]);
    setNextId(n => n + 1);
  }, [liveResults, inputs, nextId]);

  const runBatchRandom = useCallback((count: number) => {
    if (products.length === 0) return;
    const refs = ['R744', 'R717', 'R32', 'R290', 'R134a', 'R404A', 'R410A', 'R1234yf', 'CO', 'NO2'];
    const apps = ['supermarket', 'machinery_room', 'cold_storage', 'hotel', 'parking', 'cold_room', 'ice_rink'];
    const volts: ('12V' | '24V' | '230V')[] = ['24V', '24V', '24V', '230V', '12V'];
    const groups = ['EDC', 'OEM', '1Fo', '2Fo', '3Fo', 'BKund', 'NO'];
    const entries: SimResult[] = [];
    let id = nextId;

    for (let i = 0; i < count; i++) {
      const ref = refs[Math.floor(Math.random() * refs.length)];
      const app = apps[Math.floor(Math.random() * apps.length)];
      const dets = Math.floor(Math.random() * 12) + 1;
      const volt = volts[Math.floor(Math.random() * volts.length)];
      const atex = Math.random() > 0.85;
      const grp = groups[Math.floor(Math.random() * groups.length)];

      const simInputs: SimInputs = {
        refrigerant: ref, selectedRange: '', zoneType: app,
        totalDetectors: dets, voltage: volt, outputRequired: 'any',
        zoneAtex: atex, mountingType: 'wall', customerGroup: grp,
      };

      const start = performance.now();
      const selInput: SelectionInput = {
        regulationResult: {} as SelectionInput['regulationResult'],
        totalDetectors: dets, selectedRefrigerant: ref,
        zoneType: app, zoneAtex: atex, outputRequired: 'any',
        sitePowerVoltage: volt, mountingType: 'wall', projectCountry: 'SE',
        products, controllers, accessories,
        relations,
      };
      const selection = selectProducts(selInput);
      const pricing = calculatePricing({
        tiers: selection.tiers,
        customerGroup: (grp || 'NO') as PricingInput['customerGroup'],
        discountMatrix, priceDb,
      });
      const runMs = Math.round(performance.now() - start);

      entries.push({ id: id++, timestamp: new Date().toISOString(), inputs: simInputs, selection, pricing, runMs });
    }
    setHistory(prev => [...entries.reverse(), ...prev]);
    setNextId(id);
  }, [products, controllers, accessories, discountMatrix, priceDb, nextId, relations]);

  const exportCsv = useCallback(() => {
    if (history.length === 0) return;
    const q = (v: string | number | boolean | null | undefined) => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = [
      '#', 'Time', 'Refrigerant', 'Application', 'Detectors', 'Voltage', 'Output', 'ATEX', 'Customer Group',
      'PremSA Det', 'PremSA Score', 'PremSA Gross', 'PremSA Net',
      'PremCtrl Det', 'PremCtrl Score', 'PremCtrl Gross', 'PremCtrl Net',
      'EcoSA Det', 'EcoSA Score', 'EcoSA Gross', 'EcoSA Net',
      'EcoCtrl Det', 'EcoCtrl Score', 'EcoCtrl Gross', 'EcoCtrl Net',
      'Recommended', 'Warnings', 'Run (ms)',
    ].join(',');
    const rows = history.map((h, i) => {
      const pt = (t: PricedTier | null, slotKey: TierSlot) => t ? [q(h.selection.tiers[slotKey]?.detector.name ?? ''), t.solutionScore, t.summary.totalBeforeDiscount.toFixed(2), t.summary.totalHt.toFixed(2)] : ['', '', '', ''];
      return [
        i + 1, new Date(h.timestamp).toLocaleString(),
        h.inputs.refrigerant, h.inputs.zoneType, h.inputs.totalDetectors,
        h.inputs.voltage, h.inputs.outputRequired, h.inputs.zoneAtex, h.inputs.customerGroup,
        ...pt(h.pricing.tiers.premiumStandalone, 'premiumStandalone'),
        ...pt(h.pricing.tiers.premiumCentralized, 'premiumCentralized'),
        ...pt(h.pricing.tiers.ecoStandalone, 'ecoStandalone'),
        ...pt(h.pricing.tiers.ecoCentralized, 'ecoCentralized'),
        h.pricing.recommended ?? '-', h.pricing.warnings.length, h.runMs,
      ].join(',');
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saferef-m2-sim-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#16354B] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide">Simulator M2/M3</h1>
          <p className="text-sm text-gray-300 mt-0.5">
            Live product selection + pricing calculator &mdash; {products.length} products loaded
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => applyPreset(p)}
              className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split layout */}
      <div className="flex">
        {/* ── LEFT PANEL ──────────────────────────────────────────── */}
        <div className="w-[340px] flex-shrink-0 border-r border-gray-200 bg-white p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>

          <section>
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">Refrigerant</h3>
            <input type="text" value={inputs.refrigerant} onChange={e => set('refrigerant', e.target.value)}
              placeholder="R744, R717, R32..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]" />
            {ranges.length > 0 && (
              <select value={inputs.selectedRange} onChange={e => set('selectedRange', e.target.value)}
                className="w-full mt-2 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]">
                <option value="">Auto range</option>
                {ranges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">Application</h3>
            <select value={inputs.zoneType} onChange={e => set('zoneType', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]">
              {APPLICATIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
            </select>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">Configuration</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Detectors</label>
                <input type="number" value={inputs.totalDetectors} onChange={e => set('totalDetectors', parseInt(e.target.value) || 1)}
                  min={1} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Voltage</label>
                <div className="flex gap-1">
                  {(['12V', '24V', '230V'] as const).map(v => (
                    <button key={v} onClick={() => set('voltage', v)}
                      className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${inputs.voltage === v ? 'bg-[#16354B] text-white border-[#16354B]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-0.5">Output required</label>
              <select value={inputs.outputRequired} onChange={e => set('outputRequired', e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]">
                {[{v:'any',l:'Any'},{v:'relay',l:'Relay'},{v:'420mA',l:'4-20mA'},{v:'010V',l:'0-10V'},{v:'modbus',l:'Modbus'},{v:'relay_analog_modbus',l:'All outputs'}].map(o => (
                  <option key={o.v} value={o.v}>{o.l}</option>
                ))}
              </select>
            </div>

            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-0.5">Mounting</label>
              <div className="flex flex-wrap gap-1">
                {[{v:'wall',l:'Wall'},{v:'pipe',l:'Pipe'},{v:'duct',l:'Duct'},{v:'flush',l:'Flush'},{v:'surface',l:'Surface'}].map(m => (
                  <button key={m.v} onClick={() => set('mountingType', m.v)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${inputs.mountingType === m.v ? 'bg-[#16354B] text-white border-[#16354B]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                    {m.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 space-y-1.5">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={inputs.zoneAtex} onChange={e => set('zoneAtex', e.target.checked)} className="rounded border-gray-300 text-[#E63946]" />
                ATEX Zone 1
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">Commercial</h3>
            <select value={inputs.customerGroup} onChange={e => set('customerGroup', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]">
              <option value="">(none - gross only)</option>
              {CUSTOMER_GROUPS.filter(Boolean).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </section>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={saveToHistory} disabled={!liveResults}
              className="flex-1 py-2 rounded text-sm font-semibold transition-colors bg-[#E63946] text-white hover:bg-[#d32f3b] disabled:opacity-40 disabled:cursor-not-allowed">
              Save to History
            </button>
            <button onClick={() => runBatchRandom(50)} disabled={products.length === 0}
              className="px-3 py-2 rounded text-sm font-semibold transition-colors bg-[#16354B] text-white hover:bg-[#1e4a66] disabled:opacity-40"
              title="Generate 50 random M2+M3 simulations">
              50 Random
            </button>
          </div>

          {/* Live summary */}
          {liveResults && (
            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs space-y-1">
              <div className="font-semibold text-[#16354B] mb-1">Live Summary ({liveResults.runMs}ms)</div>
              {TIER_SLOTS.map(({ key, label }) => {
                const t = liveResults.pricing.tiers[key];
                return (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-500">{label}</span>
                    {t ? (
                      <span className="font-mono">
                        {scoreBadge(t.solutionScore)}
                        <span className="ml-2 font-semibold">{t.summary.totalHt.toFixed(0)} EUR</span>
                      </span>
                    ) : (
                      <span className="text-gray-300">&mdash;</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
        <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {!liveResults ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <p className="text-lg font-medium">Loading products...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 4-Solution Comparison Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#16354B] text-white px-5 py-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold">2x2 Product Comparison</h2>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {inputs.refrigerant} &middot; {inputs.zoneType.replace(/_/g, ' ')} &middot; {inputs.totalDetectors} det &middot; {inputs.voltage} &middot; {inputs.customerGroup || 'no group'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">{liveResults.runMs}ms</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-2 w-36">Metric</th>
                        <th className="px-4 py-2 text-red-600">Premium SA</th>
                        <th className="px-4 py-2 text-pink-600">Premium Ctrl</th>
                        <th className="px-4 py-2 text-blue-600">Eco SA</th>
                        <th className="px-4 py-2 text-green-600">Eco Ctrl</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {liveResults.pricing.comparison.rows.map((row, i) => (
                        <tr key={i} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                          <td className="px-4 py-2 font-medium text-gray-700">{row.label}</td>
                          <td className="px-4 py-2">{row.premiumStandalone}</td>
                          <td className="px-4 py-2">{row.premiumCentralized}</td>
                          <td className="px-4 py-2">{row.ecoStandalone}</td>
                          <td className="px-4 py-2">{row.ecoCentralized}</td>
                        </tr>
                      ))}
                      {liveResults.selection.comparison.rows.filter(r => !liveResults.pricing.comparison.rows.some(pr => pr.label === r.label)).map((row, i) => (
                        <tr key={`sel-${i}`} className="bg-gray-50/50">
                          <td className="px-4 py-2 font-medium text-gray-700">{row.label}</td>
                          <td className="px-4 py-2">{row.premiumStandalone}</td>
                          <td className="px-4 py-2">{row.premiumCentralized}</td>
                          <td className="px-4 py-2">{row.ecoStandalone}</td>
                          <td className="px-4 py-2">{row.ecoCentralized}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOM per tier */}
              {TIER_SLOTS.map(({ key, label, color }) => {
                const tier = liveResults.pricing.tiers[key];
                const selTier = liveResults.selection.tiers[key];
                if (!tier) return null;
                return (
                  <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-5 py-3 flex items-center justify-between" style={{ background: color }}>
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-bold">{label}</h3>
                        <span className="text-white/70 text-xs">Score: {tier.solutionScore}/21</span>
                      </div>
                      <span className="text-white font-bold text-lg">{tier.summary.totalHt.toFixed(2)} EUR</span>
                    </div>
                    {selTier && (
                      <div className="px-5 py-2 bg-gray-50 text-xs text-gray-600 flex flex-wrap gap-3 border-b">
                        <span>Detector: <b className="text-gray-900">{selTier.detector.name}</b> x{selTier.detector.qty}</span>
                        <span>{selTier.detector.sensorTech}</span>
                        {selTier.controller && <span>Ctrl: <b className="text-gray-900">{selTier.controller.qty}x {selTier.controller.name}</b></span>}
                        {!selTier.controller && <span className="text-green-600 font-semibold">Standalone</span>}
                      </div>
                    )}
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b text-left text-gray-500 uppercase tracking-wider">
                          <th className="px-4 py-1.5">Code</th>
                          <th className="px-4 py-1.5">Product</th>
                          <th className="px-4 py-1.5 text-center">Qty</th>
                          <th className="px-4 py-1.5 text-right">List</th>
                          <th className="px-4 py-1.5 text-right">Disc</th>
                          <th className="px-4 py-1.5 text-right">Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {tier.bomLines.map((line, li) => (
                          <tr key={li} className="hover:bg-gray-50">
                            <td className="px-4 py-1.5 font-mono text-[#16354B] font-semibold">{line.code}</td>
                            <td className="px-4 py-1.5 text-gray-700">{line.name}</td>
                            <td className="px-4 py-1.5 text-center">{line.qty}</td>
                            <td className="px-4 py-1.5 text-right text-gray-500">{line.listPrice.toFixed(2)}</td>
                            <td className="px-4 py-1.5 text-right text-red-500">{line.discountPct > 0 ? `-${line.discountPct}%` : '-'}</td>
                            <td className="px-4 py-1.5 text-right font-semibold">{line.netTotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t font-semibold">
                          <td colSpan={3} className="px-4 py-2 text-right text-gray-500">Totals</td>
                          <td className="px-4 py-2 text-right">{tier.summary.totalBeforeDiscount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-red-500">-{tier.summary.totalDiscount.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-[#16354B]">{tier.summary.totalHt.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}

              {/* Warnings */}
              {liveResults.pricing.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-amber-800 mb-2">Warnings ({liveResults.pricing.warnings.length})</h3>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {liveResults.pricing.warnings.map((w, i) => <li key={i} className="font-mono">{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Filter pipeline summary */}
              {liveResults.selection.trace && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-[#16354B] text-white px-5 py-2">
                    <h2 className="text-base font-bold">Filter Pipeline</h2>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {liveResults.selection.trace.filterPipeline.map(f => (
                      <div key={f.name} className={`rounded border px-3 py-1.5 text-xs ${f.eliminated > 0 ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                        <span className="font-mono text-gray-700">{f.name}</span>
                        <span className="ml-2 text-gray-500">{f.inputCount}&rarr;{f.outputCount}</span>
                        {f.eliminated > 0 && <span className="ml-1 text-amber-600 font-semibold">(-{f.eliminated})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#1a2332] text-white px-5 py-3 flex items-center justify-between">
                  <h2 className="text-base font-bold">Simulation History ({history.length})</h2>
                  <div className="flex gap-2">
                    <button disabled={history.length === 0} onClick={exportCsv}
                      className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors border border-white/20 disabled:opacity-40">
                      Export CSV
                    </button>
                    <button disabled={history.length === 0} onClick={() => setHistory([])}
                      className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors border border-white/20 disabled:opacity-40">
                      Clear
                    </button>
                  </div>
                </div>
                {history.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No simulations saved yet. Configure inputs and click &quot;Save to History&quot;.
                  </div>
                ) : (
                  <div className="overflow-auto" style={{ maxHeight: 280 }}>
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-gray-50 border-b text-left text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Ref</th>
                          <th className="px-3 py-2">App</th>
                          <th className="px-3 py-2">Det</th>
                          <th className="px-3 py-2">Group</th>
                          <th className="px-3 py-2">Prem SA</th>
                          <th className="px-3 py-2">Prem Ctrl</th>
                          <th className="px-3 py-2">Eco SA</th>
                          <th className="px-3 py-2">Eco Ctrl</th>
                          <th className="px-3 py-2">ms</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {history.map((h, i) => (
                          <tr key={h.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2 font-semibold">{h.inputs.refrigerant}</td>
                            <td className="px-3 py-2">{h.inputs.zoneType.replace(/_/g, ' ')}</td>
                            <td className="px-3 py-2">{h.inputs.totalDetectors}</td>
                            <td className="px-3 py-2">{h.inputs.customerGroup || '-'}</td>
                            <td className="px-3 py-2 font-mono">{h.pricing.tiers.premiumStandalone ? `${h.pricing.tiers.premiumStandalone.summary.totalHt.toFixed(0)}` : '-'}</td>
                            <td className="px-3 py-2 font-mono">{h.pricing.tiers.premiumCentralized ? `${h.pricing.tiers.premiumCentralized.summary.totalHt.toFixed(0)}` : '-'}</td>
                            <td className="px-3 py-2 font-mono">{h.pricing.tiers.ecoStandalone ? `${h.pricing.tiers.ecoStandalone.summary.totalHt.toFixed(0)}` : '-'}</td>
                            <td className="px-3 py-2 font-mono">{h.pricing.tiers.ecoCentralized ? `${h.pricing.tiers.ecoCentralized.summary.totalHt.toFixed(0)}` : '-'}</td>
                            <td className="px-3 py-2 text-gray-400">{h.runMs}</td>
                            <td className="px-3 py-2">
                              <button onClick={() => setInputs(h.inputs)} className="text-[#E63946] hover:underline font-medium">Reload</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
