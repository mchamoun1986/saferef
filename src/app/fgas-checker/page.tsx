'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Search, ArrowLeft, ArrowRight, Leaf, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { calculateLeakCheck } from '@/lib/fgas/leak-check';
import { co2eqToEquivalents } from '@/lib/fgas/environmental';
import type { LeakCheckResult } from '@/lib/fgas/types';

interface Refrigerant {
  id: string;
  name: string;
  safetyClass: string;
  gwp: string | null;
  gasGroup: string;
}

// ── Styling constants (matching Calculator) ──────────────────────────

const inputClass = 'w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 focus:outline-none transition-all';
const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';
const cardClass = 'bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 sm:p-6';

const SAFETY_COLORS: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700',
  A2L: 'bg-amber-100 text-amber-700',
  A2: 'bg-orange-100 text-orange-700',
  A3: 'bg-red-100 text-red-700',
  B1: 'bg-blue-100 text-blue-700',
  B2L: 'bg-purple-100 text-purple-700',
  B2: 'bg-pink-100 text-pink-700',
  B3: 'bg-rose-100 text-rose-700',
};

const BAND_STYLES = {
  none: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  standard: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', icon: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
  medium: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-800', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  high: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: 'text-red-600', badge: 'bg-red-100 text-red-700' },
};

function isHfoRefrigerant(ref: Refrigerant): boolean {
  const gwp = parseFloat(ref.gwp ?? '0');
  return gwp > 0 && gwp < 10 && ref.gasGroup === 'HFC2';
}

function safetyBadge(safety: string) {
  const c = SAFETY_COLORS[safety] ?? 'bg-gray-100 text-gray-700';
  return <span className={`${c} text-[10px] font-bold px-1.5 py-0.5 rounded`}>{safety}</span>;
}

// ── Step Progress Bar ────────────────────────────────────────────────

function FGasStepProgress({ current }: { current: number }) {
  const steps = ['Refrigerant & Charge', 'Results'];
  return (
    <div className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] py-3 sm:py-5">
      <div className="flex items-center justify-between max-w-md mx-auto px-4">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isDone = current > stepNum;
          const isActive = current === stepNum;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone ? 'bg-[#A7C031] text-white shadow-[0_0_10px_rgba(167,192,49,0.4)]'
                    : isActive ? 'bg-[#2196F3] text-white shadow-[0_0_10px_rgba(33,150,243,0.4)]'
                    : 'border-2 border-[#2a4a60] text-[#4a7a95]'
                }`}>
                  {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : String(stepNum)}
                </div>
                <span className={`mt-2 text-[11px] font-semibold hidden sm:block ${
                  isDone ? 'text-[#A7C031]' : isActive ? 'text-white' : 'text-[#4a7a95]'
                }`}>{label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-[3px] mx-4 mt-[-1rem] rounded-full ${current > stepNum ? 'bg-[#A7C031]' : 'bg-[#2a4a60]'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 1: Refrigerant & Charge ─────────────────────────────────────

function StepInput({
  refrigerants,
  selectedId,
  onSelectRef,
  chargeKg,
  onChargeChange,
  isHermetic,
  onHermeticChange,
}: {
  refrigerants: Refrigerant[];
  selectedId: string;
  onSelectRef: (id: string) => void;
  chargeKg: number | '';
  onChargeChange: (v: number | '') => void;
  isHermetic: boolean;
  onHermeticChange: (v: boolean) => void;
}) {
  const [refOpen, setRefOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedRef = refrigerants.find(r => r.id === selectedId);

  const filtered = search
    ? refrigerants.filter(r =>
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    : refrigerants;

  // Group: recommended (common) vs others
  const recommended = ['R134A', 'R404A', 'R407C', 'R410A', 'R32', 'R449A', 'R448A', 'R454B', 'R452A', 'R507A', 'R744', 'R717', 'R290'];
  const recList = filtered.filter(r => recommended.includes(r.id));
  const otherList = filtered.filter(r => !recommended.includes(r.id));

  return (
    <div className="space-y-5">
      {/* Refrigerant Selection Card */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#2196F3] flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-base font-bold text-[#16354B]">Select Refrigerant</h3>
        </div>

        {/* Selected chip */}
        {selectedRef && (
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-[#16354B] text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
              <span className="font-bold">{selectedRef.id}</span>
              <span className="text-gray-300">—</span>
              <span>{selectedRef.name}</span>
              {safetyBadge(selectedRef.safetyClass)}
              <span className="text-gray-400 text-xs">GWP {selectedRef.gwp}</span>
              <button onClick={() => { onSelectRef(''); setSearch(''); }} className="ml-1 text-gray-400 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setRefOpen(!refOpen)}
            className={`${inputClass} cursor-pointer flex items-center justify-between ${refOpen ? 'border-[#16354B] ring-2 ring-[#16354B]/20' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#6b8da5]" />
              {refOpen ? (
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  placeholder="Type to search..."
                  className="bg-transparent border-none outline-none text-sm font-medium text-[#16354B] placeholder:text-[#6b8da5] w-full"
                />
              ) : (
                <span className={selectedRef ? 'text-[#16354B]' : 'text-[#6b8da5]'}>
                  {selectedRef ? `${selectedRef.id} — ${selectedRef.name}` : 'Select refrigerant...'}
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-[#6b8da5] transition-transform ${refOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown list */}
          {refOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border-2 border-[#16354B]/20 rounded-xl shadow-xl max-h-80 overflow-y-auto">
              {recList.length > 0 && (
                <>
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border-b border-amber-200 sticky top-0">
                    Common Refrigerants
                  </div>
                  {recList.map(r => {
                    const gwp = parseFloat(r.gwp ?? '0');
                    const isActive = r.id === selectedId;
                    return (
                      <button key={r.id} onClick={() => { onSelectRef(r.id); setRefOpen(false); setSearch(''); }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors ${isActive ? 'bg-[#16354B]/10' : 'hover:bg-[#f8fafc]'}`}>
                        <span className="font-bold text-sm text-[#16354B] w-16">{r.id}</span>
                        <span className="text-sm text-[#16354B] flex-1">{r.name}</span>
                        {safetyBadge(r.safetyClass)}
                        <span className="text-xs text-[#6b8da5]">GWP {gwp}</span>
                        {isActive && <Check className="w-4 h-4 text-[#A7C031]" />}
                      </button>
                    );
                  })}
                </>
              )}
              {otherList.length > 0 && (
                <>
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6b8da5] bg-[#f1f5f9] border-b border-[#e2e8f0] sticky top-0">
                    All Refrigerants
                  </div>
                  {otherList.map(r => {
                    const gwp = parseFloat(r.gwp ?? '0');
                    const isActive = r.id === selectedId;
                    return (
                      <button key={r.id} onClick={() => { onSelectRef(r.id); setRefOpen(false); setSearch(''); }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors ${isActive ? 'bg-[#16354B]/10' : 'hover:bg-[#f8fafc]'}`}>
                        <span className="font-bold text-sm text-[#16354B] w-16">{r.id}</span>
                        <span className="text-sm text-[#16354B] flex-1">{r.name}</span>
                        {safetyBadge(r.safetyClass)}
                        <span className="text-xs text-[#6b8da5]">GWP {gwp}</span>
                        {isActive && <Check className="w-4 h-4 text-[#A7C031]" />}
                      </button>
                    );
                  })}
                </>
              )}
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-[#6b8da5]">No refrigerants found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Charge & Options Card */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#16354B] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#16354B]">System Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Refrigerant Charge (kg)</label>
            <input
              type="number"
              min={0.1}
              step={0.1}
              placeholder="Enter total charge in kg"
              value={chargeKg}
              onChange={e => onChargeChange(e.target.value ? parseFloat(e.target.value) : '')}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 w-full hover:border-[#16354B]/40 transition-colors">
              <input
                type="checkbox"
                checked={isHermetic}
                onChange={e => onHermeticChange(e.target.checked)}
                className="w-4 h-4 rounded border-[#e2e8f0] text-[#2196F3] focus:ring-[#2196F3]"
              />
              <div>
                <span className="text-sm font-medium text-[#16354B]">Hermetically sealed</span>
                <p className="text-[10px] text-[#6b8da5]">Factory-sealed, no service valves</p>
              </div>
            </label>
          </div>
        </div>

        {/* Info summary */}
        {selectedRef && (
          <div className="mt-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] p-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span><span className="text-[#6b8da5]">Refrigerant:</span> <span className="font-bold text-[#16354B]">{selectedRef.id}</span></span>
            <span><span className="text-[#6b8da5]">GWP:</span> <span className="font-bold text-[#16354B]">{selectedRef.gwp}</span></span>
            <span><span className="text-[#6b8da5]">Safety:</span> {safetyBadge(selectedRef.safetyClass)}</span>
            {chargeKg && parseFloat(selectedRef.gwp ?? '0') > 0 && (
              <span><span className="text-[#6b8da5]">CO2eq:</span> <span className="font-bold text-[#16354B]">{((chargeKg as number) * parseFloat(selectedRef.gwp ?? '0') / 1000).toFixed(2)} t</span></span>
            )}
            {isHfoRefrigerant(selectedRef) && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">HFO — kg-based thresholds</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 2: Results ──────────────────────────────────────────────────

function StepResults({ result, selectedRef, refrigerants, selectedId }: {
  result: LeakCheckResult;
  selectedRef: Refrigerant;
  refrigerants: Refrigerant[];
  selectedId: string;
}) {
  const [refTableOpen, setRefTableOpen] = useState(false);
  const styles = BAND_STYLES[result.thresholdBand];
  const gwp = parseFloat(selectedRef.gwp ?? '0');
  const eq = co2eqToEquivalents(result.co2eqTonnes);

  // Banner message
  let bannerMessage = '';
  let bannerSub = '';
  const BannerIcon = result.thresholdBand === 'high' ? AlertTriangle : result.naturalExempt || result.hermeticExempt || result.thresholdBand === 'none' ? CheckCircle : Info;

  if (result.naturalExempt) {
    bannerMessage = 'No F-Gas leak check obligation for natural refrigerants (GWP \u2264 3).';
    bannerSub = 'Note: EN 378 may still require gas detection for safety reasons.';
  } else if (result.hermeticExempt) {
    bannerMessage = 'Hermetically sealed system \u2014 exempt from F-Gas leak checks.';
  } else if (result.thresholdBand === 'none') {
    bannerMessage = 'No F-Gas leak check obligation for this installation.';
  } else if (result.thresholdBand === 'standard') {
    bannerMessage = 'F-Gas leak checks required \u2014 standard frequency.';
  } else if (result.thresholdBand === 'medium') {
    bannerMessage = 'F-Gas leak checks required \u2014 increased frequency.';
  } else {
    bannerMessage = 'Fixed leak detection system is MANDATORY (EU 2024/573 Article 6).';
  }

  // Threshold table data
  const bands = result.isHfo
    ? [
        { label: 'No obligation', range: '< 1 kg', without: '\u2014', withD: '\u2014', key: 'none' },
        { label: 'Standard', range: '1 \u2013 10 kg', without: '12 months', withD: '24 months', key: 'standard' },
        { label: 'Medium', range: '10 \u2013 100 kg', without: '6 months', withD: '12 months', key: 'medium' },
        { label: 'High', range: '\u2265 100 kg', without: '3 months', withD: '6 months', key: 'high' },
      ]
    : [
        { label: 'No obligation', range: `< ${(5000 / gwp).toFixed(1)} kg`, without: '\u2014', withD: '\u2014', key: 'none' },
        { label: 'Standard', range: `${(5000 / gwp).toFixed(1)} \u2013 ${(50000 / gwp).toFixed(1)} kg`, without: '12 months', withD: '24 months', key: 'standard' },
        { label: 'Medium', range: `${(50000 / gwp).toFixed(1)} \u2013 ${(500000 / gwp).toFixed(1)} kg`, without: '6 months', withD: '12 months', key: 'medium' },
        { label: 'High', range: `\u2265 ${(500000 / gwp).toFixed(1)} kg`, without: '3 months', withD: '6 months', key: 'high' },
      ];

  const fgasRefs = refrigerants.filter(r => parseFloat(r.gwp ?? '0') > 3);

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      <div className={`${styles.bg} ${styles.border} border-l-4 rounded-r-xl p-4 sm:p-5`}>
        <div className="flex items-start gap-3">
          <BannerIcon className={`w-6 h-6 ${styles.icon} shrink-0 mt-0.5`} />
          <div>
            <p className={`font-bold text-base ${styles.text}`}>{bannerMessage}</p>
            {bannerSub && (
              <p className={`text-sm mt-1 ${styles.text} opacity-80`}>
                {bannerSub}{' '}
                {result.naturalExempt && (
                  <Link href="/calculator" className="underline font-semibold hover:opacity-100">Use SafeRef Calculator &rarr;</Link>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Obligations Table */}
      {result.thresholdBand !== 'none' && (
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#16354B] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#16354B]">Leak Check Obligations</h3>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#e2e8f0]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider"></th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider">Without detector</th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold text-[#2196F3] uppercase tracking-wider">With detector</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#e2e8f0]">
                  <td className="px-4 py-3 font-medium text-[#16354B]">Leak check frequency</td>
                  <td className="px-4 py-3 text-center">Every <span className="font-bold text-[#16354B]">{result.without.months}</span> months</td>
                  <td className="px-4 py-3 text-center bg-blue-50/50">Every <span className="font-bold text-[#2196F3]">{result.with.months}</span> months</td>
                </tr>
                <tr className="border-t border-[#e2e8f0]">
                  <td className="px-4 py-3 font-medium text-[#16354B]">Checks per year</td>
                  <td className="px-4 py-3 text-center font-bold text-[#16354B]">{result.without.checksPerYear}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#2196F3] bg-blue-50/50">{result.with.checksPerYear}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {result.autoDetectionMandatory && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-sm text-red-700 font-semibold">Fixed leak detection is REQUIRED for this installation.</span>
            </div>
          )}
        </div>
      )}

      {/* Environmental Impact */}
      {result.co2eqTonnes > 0 && (
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-[#16354B]">Environmental Impact</h3>
          </div>

          <p className="text-sm text-[#6b8da5] mb-4">
            If this refrigerant charge leaks entirely, it represents <span className="font-bold text-[#16354B]">{result.co2eqTonnes.toFixed(1)} tonnes</span> of CO2 equivalent:
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
              <div className="text-2xl mb-2">&#x1F697;</div>
              <div className="text-xl font-bold text-[#16354B]">{eq.carsPerYear}</div>
              <div className="text-[10px] text-[#6b8da5] uppercase tracking-wider mt-1">cars / year</div>
            </div>
            <div className="text-center p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
              <div className="text-2xl mb-2">&#x2708;&#xFE0F;</div>
              <div className="text-xl font-bold text-[#16354B]">{eq.flightsParisNY}</div>
              <div className="text-[10px] text-[#6b8da5] uppercase tracking-wider mt-1">Paris-NY flights</div>
            </div>
            <div className="text-center p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
              <div className="text-2xl mb-2">&#x1F333;</div>
              <div className="text-xl font-bold text-[#16354B]">{eq.treesToOffset.toLocaleString()}</div>
              <div className="text-[10px] text-[#6b8da5] uppercase tracking-wider mt-1">trees to offset</div>
            </div>
          </div>
        </div>
      )}

      {/* Threshold Table for Selected Refrigerant */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#2196F3] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#16354B]">F-Gas Thresholds — {selectedRef.id} (GWP {gwp})</h3>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#e2e8f0]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc]">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider">Band</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider">{result.isHfo ? 'Charge' : `Charge (${selectedRef.id})`}</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider">Without</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider">With</th>
              </tr>
            </thead>
            <tbody>
              {bands.map(b => {
                const isActive = b.key === result.thresholdBand;
                return (
                  <tr key={b.key} className={`border-t border-[#e2e8f0] transition-colors ${isActive ? 'bg-blue-50 font-semibold' : ''}`}>
                    <td className="px-4 py-2.5 flex items-center gap-2">
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#2196F3]" />}
                      <span className={isActive ? 'text-[#16354B]' : 'text-[#6b8da5]'}>{b.label}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[#16354B]">{b.range}</td>
                    <td className="px-4 py-2.5 text-center text-[#6b8da5]">{b.without}</td>
                    <td className="px-4 py-2.5 text-center text-[#2196F3]">{b.withD}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Reference Table (collapsible) */}
      <div className={cardClass + ' !p-0 overflow-hidden'}>
        <button onClick={() => setRefTableOpen(!refTableOpen)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#6b8da5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="font-bold text-[#16354B]">Full Reference Table ({fgasRefs.length} refrigerants)</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#6b8da5] transition-transform ${refTableOpen ? 'rotate-180' : ''}`} />
        </button>
        {refTableOpen && (
          <div className="border-t border-[#e2e8f0] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f8fafc]">
                  <th className="px-4 py-2 text-left font-semibold text-[#6b8da5]">Refrigerant</th>
                  <th className="px-4 py-2 text-center font-semibold text-[#6b8da5]">GWP</th>
                  <th className="px-4 py-2 text-center font-semibold text-[#6b8da5]">{"5\u201349 t CO\u2082eq"}<br /><span className="text-[9px]">12m / 24m</span></th>
                  <th className="px-4 py-2 text-center font-semibold text-[#6b8da5]">{"50\u2013499 t CO\u2082eq"}<br /><span className="text-[9px]">6m / 12m</span></th>
                  <th className="px-4 py-2 text-center font-semibold text-[#6b8da5]">{"\u2265 500 t CO\u2082eq"}<br /><span className="text-[9px]">3m / 6m</span></th>
                </tr>
              </thead>
              <tbody>
                {fgasRefs.map(r => {
                  const g = parseFloat(r.gwp ?? '0');
                  const sel = r.id === selectedId;
                  return (
                    <tr key={r.id} className={`border-t border-[#e2e8f0] ${sel ? 'bg-blue-50 font-semibold' : 'hover:bg-[#f8fafc]'}`}>
                      <td className="px-4 py-1.5 font-mono">{r.id}</td>
                      <td className="px-4 py-1.5 text-center">{g}</td>
                      <td className="px-4 py-1.5 text-center">{(5000 / g).toFixed(1)} kg</td>
                      <td className="px-4 py-1.5 text-center">{(50000 / g).toFixed(1)} kg</td>
                      <td className="px-4 py-1.5 text-center">{(500000 / g).toFixed(1)} kg</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legal */}
      <div className="text-xs text-[#6b8da5] text-center space-y-1 pt-2">
        <p>Based on EU Regulation 2024/573 (F-Gas), Articles 5 & 6.</p>
        <p>This tool provides guidance only. Consult local regulations for binding requirements.</p>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function FGasCheckerPage() {
  const [refrigerants, setRefrigerants] = useState<Refrigerant[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [chargeKg, setChargeKg] = useState<number | ''>('');
  const [isHermetic, setIsHermetic] = useState(false);
  const [step, setStep] = useState(1);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    fetch('/api/refrigerants-v5')
      .then(r => r.json())
      .then((data: Refrigerant[]) => {
        const valid = data.filter(r => r.gwp && parseFloat(r.gwp) >= 0);
        setRefrigerants(valid.sort((a, b) => a.id.localeCompare(b.id)));
      })
      .catch(() => {});
  }, []);

  const selectedRef = refrigerants.find(r => r.id === selectedId);
  const gwp = selectedRef ? parseFloat(selectedRef.gwp ?? '0') : 0;

  const result = useMemo<LeakCheckResult | null>(() => {
    if (!selectedRef || !chargeKg || chargeKg <= 0) return null;
    return calculateLeakCheck({
      refrigerantId: selectedRef.id,
      gwp,
      chargeKg,
      isHermetic,
      isHfo: isHfoRefrigerant(selectedRef),
    });
  }, [selectedRef, gwp, chargeKg, isHermetic]);

  // Anonymous logging
  useEffect(() => {
    if (!result || logged || step !== 2) return;
    const timer = setTimeout(() => {
      fetch('/api/fgas-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refrigerantId: selectedId,
          chargeKg,
          co2eq: result.co2eqTonnes,
          band: result.thresholdBand,
          mandatory: result.autoDetectionMandatory,
          isHfo: result.isHfo,
          isHermetic,
        }),
      }).catch(() => {});
      setLogged(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [result, logged, step, selectedId, chargeKg, isHermetic]);

  useEffect(() => { setLogged(false); }, [selectedId, chargeKg, isHermetic]);

  const canProceed = !!selectedRef && !!chargeKg && chargeKg > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9]">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b-2 border-[#2196F3]">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-[#E63946] font-extrabold text-xl tracking-wide">Safe</span>
          <span className="text-white font-extrabold text-xl">Ref</span>
        </Link>
        <span className="text-sm text-gray-300 font-medium">F-Gas Checker</span>
      </nav>

      {/* Step Progress */}
      <FGasStepProgress current={step} />

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 sm:py-8">
        {step === 1 && (
          <StepInput
            refrigerants={refrigerants}
            selectedId={selectedId}
            onSelectRef={setSelectedId}
            chargeKg={chargeKg}
            onChargeChange={setChargeKg}
            isHermetic={isHermetic}
            onHermeticChange={setIsHermetic}
          />
        )}

        {step === 2 && result && selectedRef && (
          <StepResults
            result={result}
            selectedRef={selectedRef}
            refrigerants={refrigerants}
            selectedId={selectedId}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-[#e2e8f0] px-4 py-3 sm:py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {step === 1 ? (
            <Link href="/" className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white hover:border-[#16354B]/30 transition-all text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          ) : (
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-[#e2e8f0] text-[#6b8da5] hover:bg-white hover:border-[#16354B]/30 transition-all text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step === 1 && (
            <button
              onClick={() => { if (canProceed) setStep(2); }}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                canProceed
                  ? 'bg-gradient-to-r from-[#2196F3] to-[#1976D2] text-white shadow-lg shadow-[#2196F3]/30 hover:shadow-xl hover:shadow-[#2196F3]/40'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Check Obligations <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
