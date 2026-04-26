'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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

const BAND_COLORS = {
  none: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', icon: 'text-green-600' },
  standard: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', icon: 'text-yellow-600' },
  medium: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-800', icon: 'text-orange-600' },
  high: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: 'text-red-600' },
};

function isHfoRefrigerant(ref: Refrigerant): boolean {
  const gwp = parseFloat(ref.gwp ?? '0');
  return gwp > 0 && gwp < 10 && ref.gasGroup === 'HFC2';
}

function StatusBanner({ result }: { result: LeakCheckResult }) {
  const colors = BAND_COLORS[result.thresholdBand];
  let message = '';
  let sub = '';

  if (result.naturalExempt) {
    message = 'No F-Gas leak check obligation for natural refrigerants (GWP \u2264 3).';
    sub = 'Note: EN 378 may still require gas detection for safety reasons.';
  } else if (result.hermeticExempt) {
    message = 'Hermetically sealed system \u2014 exempt from F-Gas leak checks.';
  } else if (result.thresholdBand === 'none') {
    message = 'No F-Gas leak check obligation for this installation.';
  } else if (result.thresholdBand === 'standard') {
    message = 'F-Gas leak checks required \u2014 standard frequency.';
  } else if (result.thresholdBand === 'medium') {
    message = 'F-Gas leak checks required \u2014 increased frequency.';
  } else if (result.thresholdBand === 'high') {
    message = 'Automatic leak detection system is MANDATORY (EU 2024/573 Article 6).';
  }

  return (
    <div className={`${colors.bg} ${colors.border} border-l-4 rounded-r-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <svg className={`w-6 h-6 ${colors.icon} shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {result.thresholdBand === 'high' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
        </svg>
        <div>
          <p className={`font-semibold ${colors.text}`}>{message}</p>
          {sub && (
            <p className={`text-sm mt-1 ${colors.text} opacity-80`}>
              {sub}{' '}
              {result.naturalExempt && (
                <Link href="/calculator" className="underline font-medium">Use the SafeRef Calculator to check &rarr;</Link>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ObligationsTable({ result }: { result: LeakCheckResult }) {
  if (result.thresholdBand === 'none') return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-[#16354B]">Leak Check Obligations</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 py-3 text-left text-gray-500 font-medium"></th>
            <th className="px-5 py-3 text-center font-semibold text-gray-700">WITHOUT gas detector</th>
            <th className="px-5 py-3 text-center font-semibold text-[#2196F3]">WITH gas detector</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-50">
            <td className="px-5 py-3 font-medium text-gray-700">Leak check frequency</td>
            <td className="px-5 py-3 text-center">Every <span className="font-bold">{result.without.months}</span> months</td>
            <td className="px-5 py-3 text-center">Every <span className="font-bold text-[#2196F3]">{result.with.months}</span> months</td>
          </tr>
          <tr>
            <td className="px-5 py-3 font-medium text-gray-700">Checks per year</td>
            <td className="px-5 py-3 text-center font-bold">{result.without.checksPerYear}</td>
            <td className="px-5 py-3 text-center font-bold text-[#2196F3]">{result.with.checksPerYear}</td>
          </tr>
        </tbody>
      </table>
      {result.autoDetectionMandatory && (
        <div className="px-5 py-3 bg-red-50 border-t border-red-200 text-sm text-red-700 font-medium">
          Automatic leak detection is REQUIRED for this installation.
        </div>
      )}
    </div>
  );
}

function EnvironmentalImpact({ co2eq }: { co2eq: number }) {
  if (co2eq <= 0) return null;
  const eq = co2eqToEquivalents(co2eq);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
      <h3 className="font-bold text-[#16354B] mb-3">Environmental Impact</h3>
      <p className="text-sm text-gray-600 mb-4">
        If this refrigerant charge leaks entirely, it represents <span className="font-bold text-[#16354B]">{co2eq.toFixed(1)}</span> tonnes of CO2 equivalent:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-1">&#x1F697;</div>
          <div className="text-xl font-bold text-[#16354B]">{eq.carsPerYear}</div>
          <div className="text-xs text-gray-500">cars driving for 1 year</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-1">&#x2708;&#xFE0F;</div>
          <div className="text-xl font-bold text-[#16354B]">{eq.flightsParisNY}</div>
          <div className="text-xs text-gray-500">Paris-NY round trips</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-1">&#x1F333;</div>
          <div className="text-xl font-bold text-[#16354B]">{eq.treesToOffset.toLocaleString()}</div>
          <div className="text-xs text-gray-500">trees to offset (per year)</div>
        </div>
      </div>
    </div>
  );
}

function ThresholdTable({ result, selectedRef }: { result: LeakCheckResult; selectedRef: Refrigerant }) {
  const gwp = parseFloat(selectedRef.gwp ?? '0');

  const bands = result.isHfo
    ? [
        { label: 'No obligation', range: '< 1 kg', without: '--', with: '--', key: 'none' },
        { label: 'Standard', range: '1 \u2013 10 kg', without: '12 months', with: '24 months', key: 'standard' },
        { label: 'Medium', range: '10 \u2013 100 kg', without: '6 months', with: '12 months', key: 'medium' },
        { label: 'High', range: '\u2265 100 kg', without: '3 months', with: '6 months', key: 'high' },
      ]
    : [
        { label: 'No obligation', range: `< ${(5000 / gwp).toFixed(1)} kg`, without: '--', with: '--', key: 'none' },
        { label: 'Standard', range: `${(5000 / gwp).toFixed(1)} \u2013 ${(50000 / gwp).toFixed(1)} kg`, without: '12 months', with: '24 months', key: 'standard' },
        { label: 'Medium', range: `${(50000 / gwp).toFixed(1)} \u2013 ${(500000 / gwp).toFixed(1)} kg`, without: '6 months', with: '12 months', key: 'medium' },
        { label: 'High', range: `\u2265 ${(500000 / gwp).toFixed(1)} kg`, without: '3 months', with: '6 months', key: 'high' },
      ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-[#16354B]">F-Gas Thresholds for {selectedRef.id} (GWP {gwp})</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 py-3 text-left text-gray-500 font-medium">Band</th>
            <th className="px-5 py-3 text-left text-gray-500 font-medium">{result.isHfo ? 'Charge range' : `Charge range (${selectedRef.id})`}</th>
            <th className="px-5 py-3 text-center text-gray-500 font-medium">Without detector</th>
            <th className="px-5 py-3 text-center text-gray-500 font-medium">With detector</th>
          </tr>
        </thead>
        <tbody>
          {bands.map(b => (
            <tr key={b.key} className={`border-b border-gray-50 ${b.key === result.thresholdBand ? 'bg-blue-50 font-semibold' : ''}`}>
              <td className="px-5 py-3">{b.label} {b.key === result.thresholdBand && '\u25C0'}</td>
              <td className="px-5 py-3">{b.range}</td>
              <td className="px-5 py-3 text-center">{b.without}</td>
              <td className="px-5 py-3 text-center">{b.with}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AllRefrigerantsTable({ refrigerants, selectedId }: { refrigerants: Refrigerant[]; selectedId: string }) {
  const [open, setOpen] = useState(false);

  const fgasRefs = refrigerants.filter(r => {
    const gwp = parseFloat(r.gwp ?? '0');
    return gwp > 3;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors">
        <h3 className="font-bold text-[#16354B]">Full Reference Table ({fgasRefs.length} refrigerants)</h3>
        <svg className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-500">Refrigerant</th>
                <th className="px-4 py-2 text-center font-medium text-gray-500">GWP</th>
                <th className="px-4 py-2 text-center font-medium text-gray-500">5–49 t CO2eq<br /><span className="text-[10px]">12m / 24m</span></th>
                <th className="px-4 py-2 text-center font-medium text-gray-500">50–499 t CO2eq<br /><span className="text-[10px]">6m / 12m</span></th>
                <th className="px-4 py-2 text-center font-medium text-gray-500">≥ 500 t CO2eq<br /><span className="text-[10px]">3m / 6m</span></th>
              </tr>
            </thead>
            <tbody>
              {fgasRefs.map(r => {
                const gwp = parseFloat(r.gwp ?? '0');
                const isSelected = r.id === selectedId;
                return (
                  <tr key={r.id} className={`border-b border-gray-50 ${isSelected ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-2">{r.id}</td>
                    <td className="px-4 py-2 text-center">{gwp}</td>
                    <td className="px-4 py-2 text-center">{(5000 / gwp).toFixed(1)} kg</td>
                    <td className="px-4 py-2 text-center">{(50000 / gwp).toFixed(1)} kg</td>
                    <td className="px-4 py-2 text-center">{(500000 / gwp).toFixed(1)} kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function FGasCheckerPage() {
  const [refrigerants, setRefrigerants] = useState<Refrigerant[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [chargeKg, setChargeKg] = useState<number | ''>('');
  const [isHermetic, setIsHermetic] = useState(false);
  const [search, setSearch] = useState('');
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

  useEffect(() => {
    if (!result || logged) return;
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
    }, 2000);
    return () => clearTimeout(timer);
  }, [result, logged, selectedId, chargeKg, isHermetic]);

  useEffect(() => { setLogged(false); }, [selectedId, chargeKg, isHermetic]);

  const filtered = search
    ? refrigerants.filter(r =>
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    : refrigerants;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b-2 border-[#2196F3]">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-[#E63946] font-extrabold text-xl tracking-wide">Safe</span>
          <span className="text-white font-extrabold text-xl">Ref</span>
        </Link>
        <span className="text-sm text-gray-300">F-Gas Checker</span>
      </nav>

      <div className="bg-gradient-to-b from-[#16354B] to-[#1e4a6a] text-white px-4 sm:px-6 py-8 text-center">
        <h1 className="text-3xl font-extrabold mb-2">F-Gas Checker</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Check your leak check obligations per EU Regulation 2024/573. Select your refrigerant and enter the charge to get instant results.
        </p>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refrigerant</label>
              <input
                type="text"
                placeholder="Search (e.g. R-404A, R-32)..."
                value={search}
                onChange={e => { setSearch(e.target.value); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2196F3] focus:border-transparent mb-1"
              />
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2196F3] focus:border-transparent"
                size={Math.min(filtered.length, 6)}
              >
                {filtered.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.name} (GWP {r.gwp})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Charge (kg)</label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                placeholder="Enter charge in kg"
                value={chargeKg}
                onChange={e => setChargeKg(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2196F3] focus:border-transparent"
              />
              <label className="flex items-center gap-2 mt-3 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHermetic}
                  onChange={e => setIsHermetic(e.target.checked)}
                  className="rounded border-gray-300 text-[#2196F3] focus:ring-[#2196F3]"
                />
                Hermetically sealed system
              </label>
            </div>
          </div>

          {selectedRef && (
            <div className="flex flex-wrap gap-4 text-sm bg-gray-50 rounded-lg px-4 py-2">
              <span><span className="text-gray-500">GWP:</span> <span className="font-bold">{gwp}</span></span>
              <span><span className="text-gray-500">Safety:</span> <span className="font-bold">{selectedRef.safetyClass}</span></span>
              {result && (
                <span><span className="text-gray-500">CO2eq:</span> <span className="font-bold">{result.co2eqTonnes.toFixed(2)} t</span></span>
              )}
              {isHfoRefrigerant(selectedRef) && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">HFO — kg-based thresholds</span>
              )}
            </div>
          )}
        </div>

        {result && (
          <>
            <StatusBanner result={result} />
            <ObligationsTable result={result} />
            <EnvironmentalImpact co2eq={result.co2eqTonnes} />
            {selectedRef && <ThresholdTable result={result} selectedRef={selectedRef} />}
            <AllRefrigerantsTable refrigerants={refrigerants} selectedId={selectedId} />
          </>
        )}

        <div className="text-xs text-gray-400 text-center mt-8 space-y-1">
          <p>Based on EU Regulation 2024/573 (F-Gas), Articles 5 & 6.</p>
          <p>This tool provides guidance only. Consult local regulations for binding requirements.</p>
          <p className="mt-3">
            <Link href="/" className="text-[#2196F3] hover:underline">&larr; Back to SafeRef</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
