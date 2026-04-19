'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { SystemDesigner } from '@/lib/m2-engine/selection-engine';
import type { ProductV2, DesignerInputs, Solution } from '@/lib/m2-engine/selection-engine';

// ── Preset scenarios ─────────────────────────────────────────────────────

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
];

const VOLTAGES = ['12V DC', '24V DC/AC', '230V AC'];
const LOCATIONS = ['ambient', 'duct', 'pipe'];
const MEAS_TYPES = ['', 'ppm', 'lel', 'vol'];

const OUTPUTS = [
  { value: '', label: 'Any', sub: 'No filter' },
  { value: '4-20mA', label: '4-20mA', sub: 'Analog' },
  { value: '0-10V', label: '0-10V', sub: 'Analog' },
  { value: 'Modbus RTU', label: 'Modbus', sub: 'RS485' },
  { value: 'Relay', label: 'Relay', sub: 'Built-in' },
];

// ── Shared UI components ─────────────────────────────────────────────────

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

// ── Decision Banner ──────────────────────────────────────────────────────

function DecisionBanner({ solutions, runTime }: { solutions: Solution[]; runTime: number }) {
  const count = solutions.length;
  return (
    <div className={`rounded-lg border-2 p-6 text-center ${
      count > 0 ? 'bg-green-600/20 border-green-600' : 'bg-red-600/20 border-red-600'
    }`}>
      <div className={`text-3xl font-black tracking-widest ${count > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {count > 0 ? `${count} SOLUTION${count > 1 ? 'S' : ''} FOUND` : 'NO COMPATIBLE PRODUCTS'}
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <span>Run time: <strong className="text-gray-300">{runTime}ms</strong></span>
        {count > 0 && (
          <>
            <span>Tiers: <strong className="text-gray-300">{[...new Set(solutions.map(s => s.tier))].join(', ')}</strong></span>
            <span>Modes: <strong className="text-gray-300">{[...new Set(solutions.map(s => s.mode))].join(', ')}</strong></span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Solution Card ─────────────────────────────────────────────────────────

function SolutionCard({ solution, index }: { solution: Solution; index: number }) {
  const tierColors: Record<string, { border: string; accent: string }> = {
    premium: { border: 'border-red-600', accent: 'text-red-400' },
    standard: { border: 'border-blue-600', accent: 'text-blue-400' },
    economic: { border: 'border-green-600', accent: 'text-green-400' },
  };
  const colors = tierColors[solution.tier?.toLowerCase()] ?? { border: 'border-gray-600', accent: 'text-gray-400' };

  return (
    <Section
      title={`#${index + 1} — ${solution.name}`}
      icon={solution.mode === 'standalone' ? 'SA' : 'CX'}
      defaultOpen={index === 0}
      accent={colors.accent}
    >
      {/* Solution summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Detector</div>
          <div className="text-lg font-semibold text-white">{solution.detector.name}</div>
          <div className="text-xs text-gray-400 mt-0.5 font-mono">{solution.detector.code}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">System</div>
          <div className="text-sm text-gray-300">
            <span className="mr-2">{solution.detector.family}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${colors.accent} border ${colors.border} border-opacity-50`}>
              {solution.tier}
            </span>
            <span className="ml-2 text-xs text-gray-500">{solution.mode}</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {solution.controller
              ? `${solution.controllerQty}x ${solution.controller.name}`
              : 'Standalone — no controller'}
          </div>
          {solution.connectionLabel && (
            <div className="text-xs text-blue-400 mt-0.5">{solution.connectionLabel}</div>
          )}
        </div>
      </div>

      {/* BOM table */}
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 uppercase tracking-wider border-b border-[#2a2e3d]">
              <th className="text-left py-2 px-2">Code</th>
              <th className="text-left py-2 px-2">Product</th>
              <th className="text-center py-2 px-2">Role</th>
              <th className="text-center py-2 px-2">Qty</th>
              <th className="text-right py-2 px-2">Unit</th>
              <th className="text-right py-2 px-2">Subtotal</th>
              <th className="text-center py-2 px-2">Opt</th>
            </tr>
          </thead>
          <tbody>
            {solution.components.map((c, i) => (
              <tr key={i} className={`border-t border-[#2a2e3d] ${c.optional ? 'opacity-50' : ''}`}>
                <td className="py-1.5 px-2 font-mono text-white">{c.code}</td>
                <td className="py-1.5 px-2 text-gray-300 max-w-[200px] truncate">
                  {c.name}
                  {c.reason && <span className="ml-1 text-gray-600 italic text-[10px]">({c.reason})</span>}
                </td>
                <td className="py-1.5 px-2 text-center text-gray-500">{c.role}</td>
                <td className="py-1.5 px-2 text-center text-gray-400">{c.qty}</td>
                <td className="py-1.5 px-2 text-right text-gray-400 font-mono">
                  {c.unitPrice > 0 ? c.unitPrice.toFixed(2) : '—'}
                </td>
                <td className="py-1.5 px-2 text-right font-semibold text-green-400 font-mono">
                  {c.subtotal > 0 ? c.subtotal.toFixed(2) : '—'}
                </td>
                <td className="py-1.5 px-2 text-center text-amber-400">{c.optional ? 'opt' : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#2a2e3d]">
              <td colSpan={5} className="py-2 px-2 text-right text-gray-500 text-xs">Total (required)</td>
              <td className="py-2 px-2 text-right font-bold text-green-400 text-sm font-mono">
                {solution.hasNaPrice ? 'N/A' : solution.total.toFixed(2)}
              </td>
              <td />
            </tr>
            {solution.optionalTotal > 0 && (
              <tr className="border-t border-[#2a2e3d]">
                <td colSpan={5} className="py-1.5 px-2 text-right text-gray-600 text-xs">Optional accessories</td>
                <td className="py-1.5 px-2 text-right text-amber-400 font-mono text-xs">
                  +{solution.optionalTotal.toFixed(2)}
                </td>
                <td />
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </Section>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════

export default function TestLabM2Page() {
  const [rawProducts, setRawProducts] = useState<ProductV2[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [gas, setGas] = useState('R744');
  const [atex, setAtex] = useState(false);
  const [voltage, setVoltage] = useState('24V DC/AC');
  const [location, setLocation] = useState('ambient');
  const [points, setPoints] = useState(4);
  const [measType, setMeasType] = useState('');
  const [outputFilter, setOutputFilter] = useState('');
  const [application, setApplication] = useState('');

  // Results
  const [solutions, setSolutions] = useState<Solution[] | null>(null);
  const [runTime, setRunTime] = useState<number>(0);
  const [running, setRunning] = useState(false);

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

  const loadPreset = useCallback((p: Preset) => {
    setGas(p.gas);
    setAtex(p.atex);
    setVoltage(p.voltage);
    setLocation(p.location);
    setPoints(p.points);
    setMeasType(p.measType);
    setApplication(p.application);
    setSolutions(null);
  }, []);

  const handleRun = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const start = performance.now();

      const di: DesignerInputs = {
        gas,
        atex,
        voltage,
        location,
        outputs: outputFilter ? [outputFilter] : [],
        measType,
        points,
        application: application || undefined,
      };

      const result = designer.generate(di);
      setSolutions(result);
      setRunTime(Math.round(performance.now() - start));
      setRunning(false);
    }, 50);
  }, [gas, atex, voltage, location, outputFilter, measType, points, application, designer]);

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
                V2 Engine
              </span>
            </div>
            <h1 className="text-lg font-bold text-white mt-2">SystemDesigner Testlab</h1>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? 'Loading...' : `${rawProducts.length} products loaded`}
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
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Refrigerant (gas)</div>
            <input type="text" value={gas} onChange={e => setGas(e.target.value)}
              placeholder="R744, R717, R32, R290..."
              className="w-full bg-[#0f1117] border border-[#2a2e3d] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Location */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Detection Location</div>
            <div className="flex gap-1">
              {LOCATIONS.map(l => (
                <button key={l} onClick={() => setLocation(l)}
                  className={`flex-1 px-2 py-2 rounded text-xs font-medium transition-all ${
                    location === l ? 'bg-blue-600 text-white' : 'bg-[#0f1117] border border-[#2a2e3d] text-gray-400 hover:border-gray-600'
                  }`}>{l}</button>
              ))}
            </div>
          </div>

          {/* Measurement type */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Measurement Type</div>
            <div className="flex gap-1 flex-wrap">
              {MEAS_TYPES.map(m => (
                <button key={m} onClick={() => setMeasType(m)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    measType === m ? 'bg-blue-600 text-white' : 'bg-[#0f1117] border border-[#2a2e3d] text-gray-400 hover:border-gray-600'
                  }`}>{m || 'Any'}</button>
              ))}
            </div>
          </div>

          {/* Points + Voltage */}
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Detection Points" value={points} onChange={setPoints} unit="pt" min={1} step={1} />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Voltage</div>
              <div className="flex flex-col gap-1">
                {VOLTAGES.map(v => (
                  <button key={v} onClick={() => setVoltage(v)}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                      voltage === v ? 'bg-blue-600 text-white' : 'bg-[#0f1117] border border-[#2a2e3d] text-gray-400 hover:border-gray-600'
                    }`}>{v}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Output */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Output Filter</div>
            <div className="grid grid-cols-3 gap-1.5">
              {OUTPUTS.map(o => (
                <button key={o.value} onClick={() => setOutputFilter(o.value)}
                  className={`rounded border px-2 py-1.5 text-left transition-all ${
                    outputFilter === o.value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-[#2a2e3d] bg-[#0f1117] text-gray-400 hover:border-gray-600'
                  }`}>
                  <div className="text-xs font-medium">{o.label}</div>
                  <div className="text-[9px] opacity-60">{o.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Flags</div>
            <Toggle label="ATEX Zone 1" checked={atex} onChange={setAtex} />
          </div>

          {/* RUN button */}
          <button onClick={handleRun} disabled={loading || running}
            className="w-full py-3 rounded-lg text-white font-bold text-sm tracking-wider bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/30">
            {running ? 'CALCULATING...' : 'RUN SystemDesigner V2'}
          </button>

          {runTime > 0 && (
            <div className="text-xs text-gray-600 text-center font-mono">{runTime}ms &middot; {rawProducts.length} products scanned</div>
          )}
        </div>
      </aside>

      {/* ── RIGHT MAIN AREA ──────────────────────────────────────────── */}
      <main className="flex-1 bg-[#0f1117] overflow-y-auto p-6">
        {/* Empty state */}
        {solutions === null && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl text-gray-800 mb-4">&gt;_</div>
              <h2 className="text-xl text-gray-600 font-semibold">SystemDesigner V2</h2>
              <p className="text-gray-700 text-sm mt-2 max-w-md">
                Configure parameters on the left and click{' '}
                <span className="text-green-500 font-semibold">RUN SystemDesigner V2</span> to generate
                solutions with BOM, pricing, and alert accessories.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {solutions !== null && (
          <div className="flex flex-col gap-5 max-w-4xl mx-auto">
            {/* 1 — Decision Banner */}
            <DecisionBanner solutions={solutions} runTime={runTime} />

            {/* 2 — Solutions Summary Table */}
            {solutions.length > 0 && (
              <Section title={`Solutions Overview (${solutions.length})`} icon="=" accent="text-cyan-400">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 uppercase tracking-wider border-b border-[#2a2e3d]">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2 px-2">Solution</th>
                      <th className="text-center py-2 px-2">Tier</th>
                      <th className="text-center py-2 px-2">Mode</th>
                      <th className="text-left py-2 px-2">Controller</th>
                      <th className="text-left py-2 px-2">Connection</th>
                      <th className="text-right py-2 px-2">Total EUR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solutions.map((s, i) => (
                      <tr key={i} className="border-t border-[#2a2e3d]">
                        <td className="py-1.5 px-2 text-gray-500">{i + 1}</td>
                        <td className="py-1.5 px-2 text-white font-medium">{s.name}</td>
                        <td className="py-1.5 px-2 text-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            s.tier === 'premium' ? 'bg-red-900/40 text-red-300' :
                            s.tier === 'standard' ? 'bg-blue-900/40 text-blue-300' :
                            'bg-green-900/40 text-green-300'
                          }`}>{s.tier}</span>
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            s.mode === 'standalone' ? 'bg-purple-900/30 text-purple-300' : 'bg-amber-900/30 text-amber-300'
                          }`}>{s.mode}</span>
                        </td>
                        <td className="py-1.5 px-2 text-gray-400">
                          {s.controller ? `${s.controllerQty}x ${s.controller.name}` : '—'}
                        </td>
                        <td className="py-1.5 px-2 text-gray-500 text-[10px]">{s.connectionLabel ?? '—'}</td>
                        <td className="py-1.5 px-2 text-right font-semibold font-mono text-green-400">
                          {s.hasNaPrice ? 'N/A' : s.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            )}

            {/* 3 — Detailed Solution Cards */}
            {solutions.map((s, i) => (
              <SolutionCard key={i} solution={s} index={i} />
            ))}

            {/* 4 — Full JSON */}
            <Section title="Full JSON Output" icon="{}" defaultOpen={false} accent="text-green-400">
              <JsonViewer data={{ inputs: { gas, atex, voltage, location, points, measType }, solutions }} />
            </Section>
          </div>
        )}
      </main>
    </div>
  );
}
