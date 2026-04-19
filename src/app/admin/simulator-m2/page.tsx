'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { SystemDesigner } from '@/lib/m2-engine/selection-engine';
import type { ProductV2, DesignerInputs, Solution } from '@/lib/m2-engine/selection-engine';

// ── Interfaces ───────────────────────────────────────────────────────────

interface SimInputs {
  gas: string;
  atex: boolean;
  voltage: string;
  location: string;
  points: number;
  measType: string;
  application: string;
}

interface SimResult {
  id: number;
  timestamp: string;
  inputs: SimInputs;
  solutions: Solution[];
  runMs: number;
}

// ── Presets ──────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  gas: string;
  atex: boolean;
  voltage: string;
  location: string;
  points: number;
  measType: string;
  application: string;
}

const PRESETS: Preset[] = [
  { label: 'R744 Supermarket 4pt', gas: 'R744', atex: false, voltage: '24V DC/AC', location: 'ambient', points: 4, measType: 'ppm', application: '' },
  { label: 'R717 Machinery 6pt', gas: 'R717', atex: false, voltage: '24V DC/AC', location: 'ambient', points: 6, measType: 'ppm', application: '' },
  { label: 'R32 ATEX 2pt', gas: 'R32', atex: true, voltage: '24V DC/AC', location: 'ambient', points: 2, measType: 'lel', application: '' },
  { label: 'R744 Duct 4pt', gas: 'R744', atex: false, voltage: '24V DC/AC', location: 'duct', points: 4, measType: 'ppm', application: '' },
  { label: 'R32 Hotel 1pt', gas: 'R32', atex: false, voltage: '24V DC/AC', location: 'ambient', points: 1, measType: 'lel', application: '' },
  { label: 'R290 Cold Room 4pt 230V', gas: 'R290', atex: false, voltage: '230V AC', location: 'ambient', points: 4, measType: 'lel', application: '' },
];

const VOLTAGES = ['12V DC', '24V DC/AC', '230V AC'];
const LOCATIONS = ['ambient', 'duct', 'pipe'];
const MEAS_TYPES = ['', 'ppm', 'lel', 'vol'];

const DEFAULT_INPUTS: SimInputs = {
  gas: 'R744',
  atex: false,
  voltage: '24V DC/AC',
  location: 'ambient',
  points: 4,
  measType: 'ppm',
  application: '',
};

// ── Tier badge helpers ───────────────────────────────────────────────────

function tierBadge(tier: string) {
  const map: Record<string, string> = {
    premium: 'bg-red-100 text-red-700 border border-red-200',
    standard: 'bg-blue-100 text-blue-700 border border-blue-200',
    economic: 'bg-green-100 text-green-700 border border-green-200',
  };
  const cls = map[tier?.toLowerCase()] ?? 'bg-gray-100 text-gray-700 border border-gray-200';
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${cls}`}>{tier ?? '?'}</span>;
}

function modeBadge(mode: string) {
  const cls = mode === 'standalone'
    ? 'bg-purple-100 text-purple-700 border border-purple-200'
    : 'bg-amber-100 text-amber-700 border border-amber-200';
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${cls}`}>{mode}</span>;
}

// ── Main Component ───────────────────────────────────────────────────────

export default function SimulatorM2Page() {
  const [rawProducts, setRawProducts] = useState<ProductV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<SimInputs>(DEFAULT_INPUTS);
  const [history, setHistory] = useState<SimResult[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    fetch('/api/products?status=active')
      .then(r => r.json())
      .then((prods: ProductV2[]) => {
        setRawProducts(Array.isArray(prods) ? prods : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const designer = useMemo(() => new SystemDesigner(rawProducts), [rawProducts]);

  const set = useCallback(<K extends keyof SimInputs>(field: K, value: SimInputs[K]) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  const liveResults = useMemo(() => {
    if (rawProducts.length === 0) return null;
    const start = performance.now();
    const di: DesignerInputs = {
      gas: inputs.gas,
      atex: inputs.atex,
      voltage: inputs.voltage,
      location: inputs.location,
      outputs: [],
      measType: inputs.measType,
      points: inputs.points,
      application: inputs.application || undefined,
    };
    const solutions = designer.generate(di);
    const runMs = Math.round(performance.now() - start);
    return { solutions, runMs };
  }, [rawProducts, designer, inputs]);

  const applyPreset = useCallback((p: Preset) => {
    setInputs({ gas: p.gas, atex: p.atex, voltage: p.voltage, location: p.location, points: p.points, measType: p.measType, application: p.application });
  }, []);

  const saveToHistory = useCallback(() => {
    if (!liveResults) return;
    setHistory(prev => [{
      id: nextId,
      timestamp: new Date().toISOString(),
      inputs: { ...inputs },
      solutions: liveResults.solutions,
      runMs: liveResults.runMs,
    }, ...prev]);
    setNextId(n => n + 1);
  }, [liveResults, inputs, nextId]);

  const runBatchRandom = useCallback((count: number) => {
    if (rawProducts.length === 0) return;
    const gases = ['R744', 'R717', 'R32', 'R290', 'R134A', 'R404A', 'R410A', 'R1234yf', 'CO', 'NO2'];
    const volts = ['12V DC', '24V DC/AC', '230V AC'];
    const locs = ['ambient', 'duct', 'pipe'];
    const measTypes = ['ppm', 'lel', 'vol', ''];
    const entries: SimResult[] = [];
    let id = nextId;

    for (let i = 0; i < count; i++) {
      const gas = gases[Math.floor(Math.random() * gases.length)];
      const pts = Math.floor(Math.random() * 12) + 1;
      const volt = volts[Math.floor(Math.random() * volts.length)];
      const atex = Math.random() > 0.85;
      const loc = locs[Math.floor(Math.random() * locs.length)];
      const meas = measTypes[Math.floor(Math.random() * measTypes.length)];

      const simInputs: SimInputs = { gas, atex, voltage: volt, location: loc, points: pts, measType: meas, application: '' };
      const di: DesignerInputs = { gas, atex, voltage: volt, location: loc, outputs: [], measType: meas, points: pts };

      const start = performance.now();
      const solutions = designer.generate(di);
      const runMs = Math.round(performance.now() - start);

      entries.push({ id: id++, timestamp: new Date().toISOString(), inputs: simInputs, solutions, runMs });
    }
    setHistory(prev => [...entries.reverse(), ...prev]);
    setNextId(id);
  }, [rawProducts, designer, nextId]);

  const exportCsv = useCallback(() => {
    if (history.length === 0) return;
    const q = (v: string | number | boolean | null | undefined) => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ['#', 'Time', 'Gas', 'Points', 'Voltage', 'Location', 'ATEX', 'Solutions', 'Best Name', 'Best Total', 'Run (ms)'].join(',');
    const rows = history.map((h, i) => {
      const best = h.solutions[0];
      return [
        i + 1, new Date(h.timestamp).toLocaleString(),
        h.inputs.gas, h.inputs.points, h.inputs.voltage, h.inputs.location, h.inputs.atex,
        h.solutions.length,
        q(best?.name ?? ''), best?.total?.toFixed(2) ?? '', h.runMs,
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
          <h1 className="text-xl font-bold tracking-wide">Simulator M2 — SystemDesigner V2</h1>
          <p className="text-sm text-gray-300 mt-0.5">
            Live product selection engine &mdash; {rawProducts.length} products loaded
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
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">Refrigerant (gas)</h3>
            <input type="text" value={inputs.gas} onChange={e => set('gas', e.target.value)}
              placeholder="R744, R717, R32, R290..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]" />
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">Measurement Type</h3>
            <div className="flex gap-1 flex-wrap">
              {MEAS_TYPES.map(m => (
                <button key={m} onClick={() => set('measType', m)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${inputs.measType === m ? 'bg-[#16354B] text-white border-[#16354B]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                  {m || 'Any'}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">Location</h3>
            <div className="flex gap-1">
              {LOCATIONS.map(l => (
                <button key={l} onClick={() => set('location', l)}
                  className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${inputs.location === l ? 'bg-[#16354B] text-white border-[#16354B]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                  {l}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">Configuration</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Detection Points</label>
                <input type="number" value={inputs.points} onChange={e => set('points', parseInt(e.target.value) || 1)}
                  min={1} max={20} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Voltage</label>
                <select value={inputs.voltage} onChange={e => set('voltage', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]">
                  {VOLTAGES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={inputs.atex} onChange={e => set('atex', e.target.checked)} className="rounded border-gray-300 text-[#E63946]" />
                ATEX Zone 1
              </label>
            </div>
          </section>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={saveToHistory} disabled={!liveResults}
              className="flex-1 py-2 rounded text-sm font-semibold transition-colors bg-[#E63946] text-white hover:bg-[#d32f3b] disabled:opacity-40 disabled:cursor-not-allowed">
              Save to History
            </button>
            <button onClick={() => runBatchRandom(50)} disabled={rawProducts.length === 0}
              className="px-3 py-2 rounded text-sm font-semibold transition-colors bg-[#16354B] text-white hover:bg-[#1e4a66] disabled:opacity-40"
              title="Generate 50 random simulations">
              50 Random
            </button>
          </div>

          {/* Live summary */}
          {liveResults && (
            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs space-y-1">
              <div className="font-semibold text-[#16354B] mb-1">
                Live Summary ({liveResults.runMs}ms) — {liveResults.solutions.length} solution{liveResults.solutions.length !== 1 ? 's' : ''}
              </div>
              {liveResults.solutions.slice(0, 4).map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-gray-600 truncate max-w-[180px]">{s.name}</span>
                  <span className="font-mono font-semibold">{s.total > 0 ? `${s.total.toFixed(0)} EUR` : 'N/A'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
        <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p className="text-lg font-medium">Loading products...</p>
            </div>
          ) : !liveResults ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p className="text-lg font-medium">No results yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary header */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#16354B] text-white px-5 py-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold">Solutions Found: {liveResults.solutions.length}</h2>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {inputs.gas} &middot; {inputs.location} &middot; {inputs.points} pt &middot; {inputs.voltage}{inputs.atex ? ' · ATEX' : ''}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">{liveResults.runMs}ms</div>
                </div>

                {liveResults.solutions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No compatible products found for these criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                          <th className="px-4 py-2">#</th>
                          <th className="px-4 py-2">Solution</th>
                          <th className="px-4 py-2">Tier</th>
                          <th className="px-4 py-2">Mode</th>
                          <th className="px-4 py-2">Connection</th>
                          <th className="px-4 py-2 text-right">Total (EUR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {liveResults.solutions.map((s, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-4 py-2">
                              <div className="font-semibold text-gray-900">{s.name}</div>
                              <div className="text-xs text-gray-500">{s.subtitle}</div>
                            </td>
                            <td className="px-4 py-2">{tierBadge(s.tier)}</td>
                            <td className="px-4 py-2">{modeBadge(s.mode)}</td>
                            <td className="px-4 py-2 text-xs text-gray-600">{s.connectionLabel ?? '—'}</td>
                            <td className="px-4 py-2 text-right font-semibold font-mono">
                              {s.hasNaPrice ? <span className="text-amber-600">N/A</span> : `${s.total.toFixed(2)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* BOM per solution */}
              {liveResults.solutions.map((s, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 flex items-center justify-between bg-gray-800">
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-bold">{s.name}</h3>
                      {tierBadge(s.tier)}
                      {modeBadge(s.mode)}
                    </div>
                    <span className="text-white font-bold text-lg">
                      {s.hasNaPrice ? 'N/A' : `${s.total.toFixed(2)} EUR`}
                    </span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b text-left text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-1.5">Code</th>
                        <th className="px-4 py-1.5">Product</th>
                        <th className="px-4 py-1.5">Role</th>
                        <th className="px-4 py-1.5 text-center">Qty</th>
                        <th className="px-4 py-1.5 text-right">Unit</th>
                        <th className="px-4 py-1.5 text-right">Subtotal</th>
                        <th className="px-4 py-1.5">Opt.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {s.components.map((c, ci) => (
                        <tr key={ci} className={`hover:bg-gray-50 ${c.optional ? 'opacity-60' : ''}`}>
                          <td className="px-4 py-1.5 font-mono text-[#16354B] font-semibold">{c.code}</td>
                          <td className="px-4 py-1.5 text-gray-700">{c.name}{c.reason ? <span className="ml-1 text-gray-400 italic">({c.reason})</span> : null}</td>
                          <td className="px-4 py-1.5 text-gray-500">{c.role}</td>
                          <td className="px-4 py-1.5 text-center">{c.qty}</td>
                          <td className="px-4 py-1.5 text-right text-gray-500">{c.unitPrice > 0 ? c.unitPrice.toFixed(2) : '—'}</td>
                          <td className="px-4 py-1.5 text-right font-semibold">{c.subtotal > 0 ? c.subtotal.toFixed(2) : '—'}</td>
                          <td className="px-4 py-1.5 text-center">{c.optional ? <span className="text-amber-600">opt</span> : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t font-semibold">
                        <td colSpan={5} className="px-4 py-2 text-right text-gray-500">Total (required)</td>
                        <td className="px-4 py-2 text-right text-[#16354B]">{s.total.toFixed(2)}</td>
                        <td />
                      </tr>
                      {s.optionalTotal > 0 && (
                        <tr className="bg-amber-50 border-t text-xs">
                          <td colSpan={5} className="px-4 py-2 text-right text-amber-700">Optional accessories</td>
                          <td className="px-4 py-2 text-right text-amber-700">+{s.optionalTotal.toFixed(2)}</td>
                          <td />
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              ))}

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
                          <th className="px-3 py-2">Gas</th>
                          <th className="px-3 py-2">Pts</th>
                          <th className="px-3 py-2">Volt</th>
                          <th className="px-3 py-2">Loc</th>
                          <th className="px-3 py-2">ATEX</th>
                          <th className="px-3 py-2">Solutions</th>
                          <th className="px-3 py-2">Best Total</th>
                          <th className="px-3 py-2">ms</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {history.map((h, i) => (
                          <tr key={h.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2 font-semibold">{h.inputs.gas}</td>
                            <td className="px-3 py-2">{h.inputs.points}</td>
                            <td className="px-3 py-2">{h.inputs.voltage}</td>
                            <td className="px-3 py-2">{h.inputs.location}</td>
                            <td className="px-3 py-2">{h.inputs.atex ? 'Y' : 'N'}</td>
                            <td className="px-3 py-2 font-semibold">{h.solutions.length}</td>
                            <td className="px-3 py-2 font-mono">
                              {h.solutions[0] ? (h.solutions[0].hasNaPrice ? 'N/A' : h.solutions[0].total.toFixed(0)) : '—'}
                            </td>
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
