'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { RefrigerantV5, RegulationInput, RegulationResult, RegulationId, PathEvaluation } from '@/lib/engine/types';
import type { RuleSet } from '@/lib/engine/rule-set';
import { evaluateRegulation } from '@/lib/engine/evaluate';
import { en378RuleSet } from '@/lib/rules/en378';
import { ashrae15RuleSet } from '@/lib/rules/ashrae15';
import { iso5149RuleSet } from '@/lib/rules/iso5149';

// ── Rule set registry ────────────────────────────────────────────────────
const RULE_SETS: Record<RegulationId, RuleSet> = {
  en378: en378RuleSet,
  ashrae15: ashrae15RuleSet,
  iso5149: iso5149RuleSet,
};

const ALL_REGULATIONS: { id: RegulationId; label: string; flag: string }[] = [
  { id: 'en378', label: 'EN 378', flag: 'EU' },
  { id: 'ashrae15', label: 'ASHRAE 15', flag: 'US' },
  { id: 'iso5149', label: 'ISO 5149', flag: 'INT' },
];

// ── Preset scenarios ─────────────────────────────────────────────────────
interface Preset {
  label: string;
  refId: string;
  charge: number;
  roomArea: number;
  roomHeight: number;
  accessCategory: 'a' | 'b' | 'c';
  locationClass: 'I' | 'II' | 'III' | 'IV';
  belowGround: boolean;
  isMachineryRoom: boolean;
  isOccupiedSpace: boolean;
  humanComfort: boolean;
  c3Applicable: boolean;
  mechanicalVentilation: boolean;
  regulation: RegulationId;
}

const PRESETS: Preset[] = [
  {
    label: 'R-32 Office',
    refId: 'R32',
    charge: 8,
    roomArea: 60,
    roomHeight: 3,
    accessCategory: 'b',
    locationClass: 'II',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: false,
    regulation: 'en378',
  },
  {
    label: 'R-290 Shop',
    refId: 'R290',
    charge: 2,
    roomArea: 40,
    roomHeight: 3,
    accessCategory: 'a',
    locationClass: 'I',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: false,
    regulation: 'en378',
  },
  {
    label: 'R-717 Machinery',
    refId: 'R717',
    charge: 80,
    roomArea: 100,
    roomHeight: 4,
    accessCategory: 'c',
    locationClass: 'III',
    belowGround: false,
    isMachineryRoom: true,
    isOccupiedSpace: false,
    humanComfort: false,
    c3Applicable: false,
    mechanicalVentilation: true,
    regulation: 'en378',
  },
  {
    label: 'R-744 Supermarket',
    refId: 'R744',
    charge: 25,
    roomArea: 200,
    roomHeight: 3.5,
    accessCategory: 'b',
    locationClass: 'II',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: true,
    regulation: 'en378',
  },
  {
    label: 'R-1234yf Hotel',
    refId: 'R1234yf',
    charge: 5,
    roomArea: 30,
    roomHeight: 2.8,
    accessCategory: 'a',
    locationClass: 'I',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: false,
    regulation: 'en378',
  },
];

// ── Random scenario generator ────────────────────────────────────────────
interface RandomScenario {
  ref: RefrigerantV5;
  charge: number;
  roomArea: number;
  roomHeight: number;
  accessCategory: 'a' | 'b' | 'c';
  locationClass: 'I' | 'II' | 'III' | 'IV';
  isMachineryRoom: boolean;
  isOccupiedSpace: boolean;
  humanComfort: boolean;
  c3Applicable: boolean;
  belowGround: boolean;
  mechanicalVentilation: boolean;
}

function generateRandomScenario(refrigerants: RefrigerantV5[]): RandomScenario {
  // Weighted refrigerant selection — common ones get 3x weight
  const common = ['R32', 'R410A', 'R744', 'R290', 'R717', 'R134a', 'R404A', 'R1234yf', 'R454B', 'R600a'];
  const pool = [...common, ...common, ...common, ...refrigerants.map(r => r.id)];
  const refId = pool[Math.floor(Math.random() * pool.length)];
  const ref = refrigerants.find(r => r.id === refId) || refrigerants[0];

  // Log-distributed values for realistic spread
  const charge = Math.round(Math.exp(Math.random() * Math.log(200)) * 10) / 10; // 1-200 kg
  const roomArea = Math.round(Math.exp(Math.random() * Math.log(50) + Math.log(10))); // 10-500 m²
  const roomHeight = Math.round((2.5 + Math.random() * 3.5) * 10) / 10; // 2.5-6m

  // Weighted categories
  const catRoll = Math.random();
  const accessCategory: 'a' | 'b' | 'c' = catRoll < 0.2 ? 'a' : catRoll < 0.7 ? 'b' : 'c';

  const locRoll = Math.random();
  const locationClass: 'I' | 'II' | 'III' | 'IV' = locRoll < 0.15 ? 'I' : locRoll < 0.6 ? 'II' : locRoll < 0.9 ? 'III' : 'IV';

  // Consistent flags
  const isMachineryRoom = accessCategory === 'c' && Math.random() > 0.5;
  const isOccupiedSpace = !isMachineryRoom && accessCategory !== 'c';
  const humanComfort = isOccupiedSpace && Math.random() > 0.3;
  const c3Applicable = isOccupiedSpace && humanComfort;
  const belowGround = Math.random() > 0.8;
  const mechanicalVentilation = isMachineryRoom || Math.random() > 0.7;

  return {
    ref, charge, roomArea, roomHeight, accessCategory, locationClass,
    isMachineryRoom, isOccupiedSpace, humanComfort, c3Applicable,
    belowGround, mechanicalVentilation,
  };
}

function buildInput(scenario: RandomScenario): RegulationInput {
  return {
    refrigerant: scenario.ref,
    charge: scenario.charge,
    roomArea: scenario.roomArea,
    roomHeight: scenario.roomHeight,
    roomVolume: scenario.roomArea * scenario.roomHeight,
    accessCategory: scenario.accessCategory,
    locationClass: scenario.locationClass,
    belowGround: scenario.belowGround,
    isMachineryRoom: scenario.isMachineryRoom,
    isOccupiedSpace: scenario.isOccupiedSpace,
    humanComfort: scenario.humanComfort,
    c3Applicable: scenario.c3Applicable,
    mechanicalVentilation: scenario.mechanicalVentilation,
  };
}

// ── Compare result type ──────────────────────────────────────────────────
interface CompareResult {
  regulationId: RegulationId;
  result: RegulationResult;
}

interface BatchRow {
  index: number;
  scenario: RandomScenario;
  results: Record<RegulationId, RegulationResult>;
  isDivergent: boolean;
}

// ── Collapsible section ──────────────────────────────────────────────────
function Section({
  title,
  icon,
  defaultOpen = true,
  accent,
  children,
}: {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  accent?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-[#2a2e3d] bg-[#1a1d28] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#22263a] transition-colors"
      >
        <span className="text-base">{icon}</span>
        <span className={`font-semibold text-sm flex-1 ${accent ?? 'text-gray-200'}`}>{title}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

// ── Toggle switch ────────────────────────────────────────────────────────
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer group">
      <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-[#2a2e3d]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );
}

// ── Number input ─────────────────────────────────────────────────────────
function NumInput({
  label,
  value,
  onChange,
  unit,
  min,
  step,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  min?: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min ?? 0}
          step={step ?? 0.1}
          disabled={disabled}
          className={`flex-1 bg-[#0f1117] border border-[#2a2e3d] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none ${
            disabled ? 'opacity-50' : ''
          }`}
        />
        <span className="text-xs text-gray-500 w-8">{unit}</span>
      </div>
    </div>
  );
}

// ── Radio card ───────────────────────────────────────────────────────────
function RadioCards<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded border px-3 py-2 text-left transition-all ${
              value === opt.value
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-[#2a2e3d] bg-[#0f1117] text-gray-400 hover:border-gray-600'
            }`}
          >
            <div className="text-sm font-medium">{opt.label}</div>
            {opt.sub && <div className="text-xs opacity-60 mt-0.5">{opt.sub}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Concentration bar visualization ──────────────────────────────────────
function ConcentrationBar({
  alarm1,
  alarm2,
  cutoff,
  roomConc,
  thresholdPpm,
}: {
  alarm1: number;
  alarm2: number;
  cutoff: number;
  roomConc: number | null;
  thresholdPpm: number;
}) {
  const maxVal = Math.max(cutoff * 1.3, (roomConc ?? 0) * 1.3, thresholdPpm * 2);
  if (maxVal <= 0) return null;

  const pct = (v: number) => Math.min((v / maxVal) * 100, 100);

  return (
    <div className="relative mt-2">
      <div className="h-8 rounded-md overflow-hidden flex bg-[#0f1117] border border-[#2a2e3d]">
        <div className="bg-green-900/60" style={{ width: `${pct(alarm1)}%` }} />
        <div className="bg-amber-900/60" style={{ width: `${pct(alarm2) - pct(alarm1)}%` }} />
        <div className="bg-red-900/60" style={{ width: `${pct(cutoff) - pct(alarm2)}%` }} />
        <div className="bg-red-950/60 flex-1" />
      </div>
      {/* markers */}
      {[
        { val: alarm1, label: 'A1', color: 'text-green-400' },
        { val: alarm2, label: 'A2', color: 'text-amber-400' },
        { val: cutoff, label: 'Cut', color: 'text-red-400' },
      ].map((m) => (
        <div
          key={m.label}
          className={`absolute top-0 h-8 border-l-2 border-dashed ${m.color.replace('text-', 'border-')}`}
          style={{ left: `${pct(m.val)}%` }}
        >
          <span className={`absolute -top-5 -translate-x-1/2 text-[10px] font-mono ${m.color}`}>
            {m.label} {m.val.toLocaleString()}
          </span>
        </div>
      ))}
      {roomConc !== null && roomConc > 0 && (
        <div
          className="absolute top-0 h-8 border-l-2 border-cyan-400"
          style={{ left: `${pct(roomConc)}%` }}
        >
          <span className="absolute top-9 -translate-x-1/2 text-[10px] font-mono text-cyan-400">
            Room {Math.round(roomConc)} ppm
          </span>
        </div>
      )}
    </div>
  );
}

// ── Decision banner ──────────────────────────────────────────────────────
function DecisionBanner({ result }: { result: RegulationResult }) {
  const config = {
    YES: { bg: 'bg-red-600/20 border-red-600', text: 'text-red-400', label: 'DETECTION REQUIRED', icon: '!!' },
    NO: { bg: 'bg-green-600/20 border-green-600', text: 'text-green-400', label: 'NO DETECTION REQUIRED', icon: 'OK' },
    RECOMMENDED: { bg: 'bg-amber-600/20 border-amber-600', text: 'text-amber-400', label: 'DETECTION RECOMMENDED', icon: '~' },
    MANUAL_REVIEW: { bg: 'bg-amber-600/20 border-amber-600', text: 'text-amber-400', label: 'MANUAL REVIEW REQUIRED', icon: '??' },
  };
  const c = config[result.detectionRequired];
  return (
    <div className={`rounded-lg border-2 ${c.bg} p-6 text-center`}>
      <div className={`text-4xl font-black tracking-widest ${c.text}`}>{c.label}</div>
      <div className="text-gray-400 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
        {result.detectionBasis}
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <span>Regulation: <strong className="text-gray-300">{result.regulationName}</strong></span>
        <span>Rule: <strong className="text-gray-300">{result.governingRuleId}</strong></span>
        <span>Hazard: <strong className="text-gray-300">{result.governingHazard}</strong></span>
      </div>
    </div>
  );
}

// ── JSON viewer ──────────────────────────────────────────────────────────
function JsonViewer({ data }: { data: unknown }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <pre className="bg-[#0f1117] border border-[#2a2e3d] rounded-lg p-4 text-xs text-green-400 overflow-auto max-h-[600px] font-mono leading-relaxed">
      {json}
    </pre>
  );
}

// ── Comparison View ──────────────────────────────────────────────────────
function ComparisonView({
  compareResults,
  scenario,
}: {
  compareResults: CompareResult[];
  scenario: { refId: string; charge: number; roomArea: number; accessCategory: string; locationClass: string };
}) {
  if (compareResults.length === 0) return null;

  // Extract comparable fields from each result
  const fields: { label: string; getValue: (r: RegulationResult) => string }[] = [
    { label: 'Detection Decision', getValue: (r) => r.detectionRequired },
    { label: 'Detectors (rec.)', getValue: (r) => String(r.recommendedDetectors) },
    { label: 'Threshold (ppm)', getValue: (r) => r.thresholdPpm.toLocaleString() },
    { label: 'Placement', getValue: (r) => r.placementHeight.replace('_', ' ') },
    { label: 'Ventilation (m\u00B3/s)', getValue: (r) => r.ventilation ? r.ventilation.flowRateM3s.toFixed(3) : 'N/A' },
    { label: 'Extra Reqs', getValue: (r) => String(r.extraRequirements.length) },
  ];

  // Check for divergences
  const divergences: string[] = [];
  for (const field of fields) {
    const values = compareResults.map((cr) => field.getValue(cr.result));
    const unique = new Set(values);
    if (unique.size > 1) {
      divergences.push(field.label);
    }
  }

  // For a given field, determine the majority value to highlight outliers
  function isCellDivergent(field: { label: string; getValue: (r: RegulationResult) => string }, idx: number): boolean {
    const values = compareResults.map((cr) => field.getValue(cr.result));
    const unique = new Set(values);
    if (unique.size <= 1) return false;
    // Find majority
    const counts: Record<string, number> = {};
    for (const v of values) counts[v] = (counts[v] || 0) + 1;
    const maxCount = Math.max(...Object.values(counts));
    const majorityVal = Object.entries(counts).find(([, c]) => c === maxCount)?.[0];
    return values[idx] !== majorityVal;
  }

  const decisionColor = (d: string) => {
    if (d === 'YES') return 'text-red-400 font-bold';
    if (d === 'NO') return 'text-green-400';
    if (d === 'RECOMMENDED') return 'text-amber-400';
    return 'text-amber-400';
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-lg border border-[#2a2e3d] bg-[#1a1d28] p-4">
        <div className="text-sm text-gray-400 mb-2">Comparing scenario:</div>
        <div className="text-lg font-bold text-white">
          {scenario.refId}, {scenario.charge} kg, {scenario.roomArea} m², Cat {scenario.accessCategory}, Location {scenario.locationClass}
        </div>
        {divergences.length > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-amber-600/20 border border-amber-600 rounded-lg px-3 py-1.5">
            <span className="text-amber-400 font-bold text-sm">DIVERGENCE FOUND</span>
            <span className="text-amber-300 text-xs">in: {divergences.join(', ')}</span>
          </div>
        )}
        {divergences.length === 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-green-600/20 border border-green-600 rounded-lg px-3 py-1.5">
            <span className="text-green-400 font-bold text-sm">ALL REGULATIONS AGREE</span>
          </div>
        )}
      </div>

      {/* Comparison table */}
      <div className="rounded-lg border border-[#2a2e3d] bg-[#1a1d28] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2e3d]">
              <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider w-[180px]">Field</th>
              {compareResults.map((cr) => {
                const reg = ALL_REGULATIONS.find(r => r.id === cr.regulationId);
                return (
                  <th key={cr.regulationId} className="text-center px-4 py-3">
                    <div className="text-sm font-semibold text-white">{reg?.label}</div>
                    <div className="text-[10px] text-gray-500">{reg?.flag}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.label} className="border-t border-[#2a2e3d]">
                <td className="px-4 py-3 text-xs text-gray-400">{field.label}</td>
                {compareResults.map((cr, idx) => {
                  const val = field.getValue(cr.result);
                  const divergent = isCellDivergent(field, idx);
                  const isDecision = field.label === 'Detection Decision';
                  return (
                    <td
                      key={cr.regulationId}
                      className={`px-4 py-3 text-center font-mono text-sm ${
                        divergent ? 'bg-amber-900/30' : ''
                      } ${isDecision ? decisionColor(val) : 'text-gray-200'}`}
                    >
                      {divergent && <span className="text-amber-500 mr-1">*</span>}
                      {val}
                      {divergent && <span className="text-amber-500 ml-1">*</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-regulation details */}
      {compareResults.map((cr) => (
        <Section
          key={cr.regulationId}
          title={`${ALL_REGULATIONS.find(r => r.id === cr.regulationId)?.label} — Details`}
          icon={cr.regulationId === 'en378' ? 'E' : cr.regulationId === 'ashrae15' ? 'A' : 'I'}
          defaultOpen={false}
          accent="text-gray-300"
        >
          <JsonViewer data={cr.result} />
        </Section>
      ))}
    </div>
  );
}

// ── Batch View ───────────────────────────────────────────────────────────
function BatchView({
  batchRows,
  onSelectRow,
}: {
  batchRows: BatchRow[];
  onSelectRow: (row: BatchRow) => void;
}) {
  const divergentCount = batchRows.filter((r) => r.isDivergent).length;
  const pct = Math.round((divergentCount / batchRows.length) * 100);

  const decisionLabel = (d: string) => {
    if (d === 'YES') return 'YES';
    if (d === 'NO') return 'NO';
    if (d === 'RECOMMENDED') return 'RECOM.';
    return 'REVIEW';
  };

  const decisionColor = (d: string) => {
    if (d === 'YES') return 'text-red-400 font-bold';
    if (d === 'NO') return 'text-green-400';
    if (d === 'RECOMMENDED') return 'text-amber-400';
    return 'text-amber-300';
  };

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      {/* Summary header */}
      <div className="rounded-lg border border-[#2a2e3d] bg-[#1a1d28] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Batch Random Test &mdash; {batchRows.length} scenarios</h2>
            <p className="text-xs text-gray-500 mt-1">Click a row to load the scenario into the sidebar</p>
          </div>
          <div className={`text-2xl font-bold ${divergentCount > 0 ? 'text-amber-400' : 'text-green-400'}`}>
            {divergentCount}/{batchRows.length} divergent ({pct}%)
          </div>
        </div>
        <div className="flex gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-green-900/60 border border-green-800/50 inline-block" /> All agree
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-amber-900/60 border border-amber-800/50 inline-block" /> Divergent
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#2a2e3d] bg-[#1a1d28] overflow-hidden overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 uppercase tracking-wider border-b border-[#2a2e3d]">
              <th className="text-left py-3 px-3">#</th>
              <th className="text-left py-3 px-3">Refrigerant</th>
              <th className="text-right py-3 px-3">Charge</th>
              <th className="text-right py-3 px-3">Area</th>
              <th className="text-center py-3 px-3">Cat</th>
              <th className="text-center py-3 px-3">Loc</th>
              <th className="text-center py-3 px-3">EN 378</th>
              <th className="text-center py-3 px-3">ASHRAE 15</th>
              <th className="text-center py-3 px-3">ISO 5149</th>
              <th className="text-center py-3 px-3">Divergent?</th>
            </tr>
          </thead>
          <tbody>
            {batchRows.map((row) => (
              <tr
                key={row.index}
                onClick={() => onSelectRow(row)}
                className={`border-t border-[#2a2e3d] cursor-pointer transition-colors hover:bg-[#22263a] ${
                  row.isDivergent ? 'bg-amber-900/10' : 'bg-green-900/5'
                }`}
              >
                <td className="py-2.5 px-3 font-mono text-gray-500">{row.index + 1}</td>
                <td className="py-2.5 px-3 text-white font-semibold">{row.scenario.ref.id}</td>
                <td className="py-2.5 px-3 text-right text-gray-300 font-mono">{row.scenario.charge} kg</td>
                <td className="py-2.5 px-3 text-right text-gray-300 font-mono">{row.scenario.roomArea} m²</td>
                <td className="py-2.5 px-3 text-center text-gray-400">{row.scenario.accessCategory}</td>
                <td className="py-2.5 px-3 text-center text-gray-400">{row.scenario.locationClass}</td>
                <td className={`py-2.5 px-3 text-center ${decisionColor(row.results.en378.detectionRequired)}`}>
                  {decisionLabel(row.results.en378.detectionRequired)}
                </td>
                <td className={`py-2.5 px-3 text-center ${decisionColor(row.results.ashrae15.detectionRequired)}`}>
                  {decisionLabel(row.results.ashrae15.detectionRequired)}
                </td>
                <td className={`py-2.5 px-3 text-center ${decisionColor(row.results.iso5149.detectionRequired)}`}>
                  {decisionLabel(row.results.iso5149.detectionRequired)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {row.isDivergent ? (
                    <span className="text-amber-400 font-bold">YES</span>
                  ) : (
                    <span className="text-green-600">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════

export default function TestLabPage() {
  // ── Refrigerant data ───────────────────────────────────────────────
  const [refrigerants, setRefrigerants] = useState<RefrigerantV5[]>([]);
  const [loadingRef, setLoadingRef] = useState(true);

  useEffect(() => {
    fetch('/api/refrigerants-v5')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRefrigerants(data);
      })
      .catch(console.error)
      .finally(() => setLoadingRef(false));
  }, []);

  // ── Form state ─────────────────────────────────────────────────────
  const [refId, setRefId] = useState('R32');
  const [regulation, setRegulation] = useState<RegulationId>('en378');
  const [charge, setCharge] = useState(8);
  const [roomArea, setRoomArea] = useState(60);
  const [roomHeight, setRoomHeight] = useState(3);
  const [volumeOverride, setVolumeOverride] = useState<number | null>(null);
  const [accessCategory, setAccessCategory] = useState<'a' | 'b' | 'c'>('b');
  const [locationClass, setLocationClass] = useState<'I' | 'II' | 'III' | 'IV'>('II');
  const [belowGround, setBelowGround] = useState(false);
  const [isMachineryRoom, setIsMachineryRoom] = useState(false);
  const [isOccupiedSpace, setIsOccupiedSpace] = useState(true);
  const [humanComfort, setHumanComfort] = useState(true);
  const [c3Applicable, setC3Applicable] = useState(true);
  const [mechanicalVentilation, setMechanicalVentilation] = useState(false);

  const autoVolume = roomArea * roomHeight;
  const effectiveVolume = volumeOverride ?? autoVolume;

  // ── Selected refrigerant ───────────────────────────────────────────
  const selectedRef = useMemo(
    () => refrigerants.find((r) => r.id === refId) ?? null,
    [refrigerants, refId],
  );

  // ── View mode ──────────────────────────────────────────────────────
  type ViewMode = 'single' | 'compare' | 'batch';
  const [viewMode, setViewMode] = useState<ViewMode>('single');

  // ── Result (single) ────────────────────────────────────────────────
  const [result, setResult] = useState<RegulationResult | null>(null);
  const [pathEvals, setPathEvals] = useState<PathEvaluation[]>([]);
  const [running, setRunning] = useState(false);

  // ── Compare results ────────────────────────────────────────────────
  const [compareResults, setCompareResults] = useState<CompareResult[]>([]);
  const [compareScenario, setCompareScenario] = useState<{ refId: string; charge: number; roomArea: number; accessCategory: string; locationClass: string } | null>(null);

  // ── Batch results ──────────────────────────────────────────────────
  const [batchRows, setBatchRows] = useState<BatchRow[]>([]);

  const runCalculation = useCallback(() => {
    if (!selectedRef) return;
    setRunning(true);
    setViewMode('single');
    // Tiny delay so UI can show spinner
    setTimeout(() => {
      const input: RegulationInput = {
        refrigerant: selectedRef,
        charge,
        roomArea,
        roomHeight,
        roomVolume: effectiveVolume,
        accessCategory,
        locationClass,
        belowGround,
        isMachineryRoom,
        isOccupiedSpace,
        humanComfort,
        c3Applicable,
        mechanicalVentilation,
      };
      const ruleSet = RULE_SETS[regulation];
      const res = evaluateRegulation(ruleSet, input);
      // Also get path evaluations directly from the ruleSet
      const detection = ruleSet.evaluateDetection(input);
      setPathEvals(detection.pathEvaluations);
      setResult(res);
      setRunning(false);
    }, 50);
  }, [
    selectedRef, charge, roomArea, roomHeight, effectiveVolume,
    accessCategory, locationClass, belowGround, isMachineryRoom,
    isOccupiedSpace, humanComfort, c3Applicable, mechanicalVentilation,
    regulation,
  ]);

  // ── Load preset ────────────────────────────────────────────────────
  const loadPreset = useCallback(
    (p: Preset) => {
      setRefId(p.refId);
      setRegulation(p.regulation);
      setCharge(p.charge);
      setRoomArea(p.roomArea);
      setRoomHeight(p.roomHeight);
      setVolumeOverride(null);
      setAccessCategory(p.accessCategory);
      setLocationClass(p.locationClass);
      setBelowGround(p.belowGround);
      setIsMachineryRoom(p.isMachineryRoom);
      setIsOccupiedSpace(p.isOccupiedSpace);
      setHumanComfort(p.humanComfort);
      setC3Applicable(p.c3Applicable);
      setMechanicalVentilation(p.mechanicalVentilation);
      setResult(null);
      setPathEvals([]);
    },
    [],
  );

  // ── Load random scenario into form ─────────────────────────────────
  const loadScenarioIntoForm = useCallback((s: RandomScenario) => {
    setRefId(s.ref.id);
    setCharge(s.charge);
    setRoomArea(s.roomArea);
    setRoomHeight(s.roomHeight);
    setVolumeOverride(null);
    setAccessCategory(s.accessCategory);
    setLocationClass(s.locationClass);
    setBelowGround(s.belowGround);
    setIsMachineryRoom(s.isMachineryRoom);
    setIsOccupiedSpace(s.isOccupiedSpace);
    setHumanComfort(s.humanComfort);
    setC3Applicable(s.c3Applicable);
    setMechanicalVentilation(s.mechanicalVentilation);
  }, []);

  // ── Random scenario (generates + fills + runs) ─────────────────────
  const handleRandom = useCallback(() => {
    if (refrigerants.length === 0) return;
    const scenario = generateRandomScenario(refrigerants);
    loadScenarioIntoForm(scenario);
    // Run calculation after state settles
    setRunning(true);
    setViewMode('single');
    setTimeout(() => {
      const input = buildInput(scenario);
      const ruleSet = RULE_SETS[regulation];
      const res = evaluateRegulation(ruleSet, input);
      const detection = ruleSet.evaluateDetection(input);
      setPathEvals(detection.pathEvaluations);
      setResult(res);
      setRunning(false);
    }, 80);
  }, [refrigerants, regulation, loadScenarioIntoForm]);

  // ── Compare All 3 ─────────────────────────────────────────────────
  const handleCompareAll = useCallback(() => {
    if (!selectedRef) return;
    setRunning(true);
    setViewMode('compare');
    setTimeout(() => {
      const input: RegulationInput = {
        refrigerant: selectedRef,
        charge,
        roomArea,
        roomHeight,
        roomVolume: effectiveVolume,
        accessCategory,
        locationClass,
        belowGround,
        isMachineryRoom,
        isOccupiedSpace,
        humanComfort,
        c3Applicable,
        mechanicalVentilation,
      };
      const results: CompareResult[] = ALL_REGULATIONS.map((reg) => ({
        regulationId: reg.id,
        result: evaluateRegulation(RULE_SETS[reg.id], input),
      }));
      setCompareResults(results);
      setCompareScenario({ refId, charge, roomArea, accessCategory, locationClass });
      setResult(null);
      setPathEvals([]);
      setRunning(false);
    }, 50);
  }, [
    selectedRef, charge, roomArea, roomHeight, effectiveVolume,
    accessCategory, locationClass, belowGround, isMachineryRoom,
    isOccupiedSpace, humanComfort, c3Applicable, mechanicalVentilation,
    refId,
  ]);

  // ── Batch 20 ──────────────────────────────────────────────────────
  const handleBatch = useCallback(() => {
    if (refrigerants.length === 0) return;
    setRunning(true);
    setViewMode('batch');
    setTimeout(() => {
      const rows: BatchRow[] = [];
      for (let i = 0; i < 20; i++) {
        const scenario = generateRandomScenario(refrigerants);
        const input = buildInput(scenario);
        const results = {} as Record<RegulationId, RegulationResult>;
        for (const reg of ALL_REGULATIONS) {
          results[reg.id] = evaluateRegulation(RULE_SETS[reg.id], input);
        }
        const decisions = new Set(ALL_REGULATIONS.map(r => results[r.id].detectionRequired));
        rows.push({
          index: i,
          scenario,
          results,
          isDivergent: decisions.size > 1,
        });
      }
      setBatchRows(rows);
      setResult(null);
      setPathEvals([]);
      setRunning(false);
    }, 50);
  }, [refrigerants]);

  // ── Handle batch row click ─────────────────────────────────────────
  const handleBatchRowSelect = useCallback((row: BatchRow) => {
    loadScenarioIntoForm(row.scenario);
    // Show the comparison for this row
    setViewMode('compare');
    setCompareResults(ALL_REGULATIONS.map((reg) => ({
      regulationId: reg.id,
      result: row.results[reg.id],
    })));
    setCompareScenario({
      refId: row.scenario.ref.id,
      charge: row.scenario.charge,
      roomArea: row.scenario.roomArea,
      accessCategory: row.scenario.accessCategory,
      locationClass: row.scenario.locationClass,
    });
  }, [loadScenarioIntoForm]);

  // ── Room concentration in ppm (for the bar) ────────────────────────
  const roomConcPpm = useMemo(() => {
    if (!selectedRef || effectiveVolume <= 0) return null;
    const concKg = charge / effectiveVolume;
    // kg/m3 to ppm
    return (24.45 * concKg * 1e6) / selectedRef.molecularMass;
  }, [selectedRef, charge, effectiveVolume]);

  // ═════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="flex min-h-[calc(100vh-48px)]">
      {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
      <aside className="w-[370px] shrink-0 bg-[#1a1d28] border-r border-[#2a2e3d] overflow-y-auto sticky top-0 h-screen">
        <div className="p-5 flex flex-col gap-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                SAMON TESTLAB
              </span>
            </div>
            <h1 className="text-lg font-bold text-white mt-2">SafeRef Engine Simulator</h1>
            <p className="text-xs text-gray-500 mt-1">
              Interactive sandbox for the multi-regulation gas detection engine
            </p>
          </div>

          {/* Preset scenarios */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Quick Presets</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => loadPreset(p)}
                  className="px-2.5 py-1.5 rounded text-xs border border-[#2a2e3d] bg-[#0f1117] text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={handleRandom}
                disabled={refrigerants.length === 0}
                className="px-2.5 py-1.5 rounded text-xs border border-teal-700 bg-teal-900/30 text-teal-400 hover:border-teal-500 hover:bg-teal-800/40 hover:text-teal-300 transition-colors disabled:opacity-40"
              >
                RANDOM
              </button>
            </div>
          </div>

          {/* Regulation */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Regulation</div>
            <div className="flex gap-1">
              {ALL_REGULATIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRegulation(r.id)}
                  className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-all ${
                    regulation === r.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#0f1117] border border-[#2a2e3d] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div>{r.label}</div>
                  <div className="text-[10px] opacity-60">{r.flag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Refrigerant */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Refrigerant</div>
            {loadingRef ? (
              <div className="text-xs text-gray-600">Loading refrigerants...</div>
            ) : (
              <select
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2a2e3d] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                {refrigerants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.name} ({r.safetyClass})
                  </option>
                ))}
              </select>
            )}

            {/* Refrigerant properties card */}
            {selectedRef && (
              <div className="mt-3 bg-[#0f1117] border border-[#2a2e3d] rounded-lg p-3">
                <div className="text-xs font-semibold text-cyan-400 mb-2">
                  {selectedRef.id} Properties
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <PropRow label="Safety Class" value={selectedRef.safetyClass} />
                  <PropRow label="Toxicity" value={selectedRef.toxicityClass === 'A' ? 'A (Low)' : 'B (High)'} />
                  <PropRow label="Flammability" value={selectedRef.flammabilityClass} />
                  <PropRow
                    label="ATEL/ODL"
                    value={selectedRef.atelOdl !== null ? `${selectedRef.atelOdl} kg/m\u00B3` : 'N/D'}
                  />
                  <PropRow
                    label="LFL"
                    value={selectedRef.lfl !== null ? `${selectedRef.lfl} kg/m\u00B3` : 'N/A'}
                  />
                  <PropRow label="Vapour Density" value={`${selectedRef.vapourDensity} kg/m\u00B3`} />
                  <PropRow label="Molecular Mass" value={`${selectedRef.molecularMass} g/mol`} />
                  <PropRow
                    label="Placement"
                    value={selectedRef.vapourDensity > 1.18 ? 'Floor level (heavier)' : selectedRef.vapourDensity < 1.1 ? 'Ceiling (lighter)' : 'Mid-height (neutral)'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Installation context */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Installation Context
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Charge" value={charge} onChange={setCharge} unit="kg" min={0.01} step={0.5} />
              <NumInput label="Room Area" value={roomArea} onChange={setRoomArea} unit="m²" min={1} step={1} />
              <NumInput label="Ceiling Height" value={roomHeight} onChange={setRoomHeight} unit="m" min={0.5} step={0.1} />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Volume</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={volumeOverride ?? autoVolume.toFixed(1)}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (v && Math.abs(v - autoVolume) > 0.01) {
                        setVolumeOverride(v);
                      } else {
                        setVolumeOverride(null);
                      }
                    }}
                    min={1}
                    step={1}
                    className="flex-1 bg-[#0f1117] border border-[#2a2e3d] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-gray-500 w-8">m&#179;</span>
                </div>
                {volumeOverride === null && (
                  <span className="text-[10px] text-gray-600">auto = area x height</span>
                )}
                {volumeOverride !== null && (
                  <button
                    onClick={() => setVolumeOverride(null)}
                    className="text-[10px] text-blue-500 hover:text-blue-400 text-left"
                  >
                    Reset to auto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Access Category */}
          <RadioCards
            label="Access Category"
            options={[
              { value: 'a' as const, label: 'a', sub: 'General' },
              { value: 'b' as const, label: 'b', sub: 'Supervised' },
              { value: 'c' as const, label: 'c', sub: 'Authorized' },
            ]}
            value={accessCategory}
            onChange={setAccessCategory}
          />

          {/* Location Class */}
          <RadioCards
            label="Location Class"
            options={[
              { value: 'I' as const, label: 'I' },
              { value: 'II' as const, label: 'II' },
              { value: 'III' as const, label: 'III' },
              { value: 'IV' as const, label: 'IV' },
            ]}
            value={locationClass}
            onChange={setLocationClass}
          />

          {/* Toggles */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Flags</div>
            <div className="flex flex-col gap-0.5">
              <Toggle label="Below Ground" checked={belowGround} onChange={setBelowGround} />
              <Toggle label="Machinery Room" checked={isMachineryRoom} onChange={setIsMachineryRoom} />
              <Toggle label="Occupied Space" checked={isOccupiedSpace} onChange={setIsOccupiedSpace} />
              <Toggle label="Human Comfort" checked={humanComfort} onChange={setHumanComfort} />
              <Toggle label="C.3 Applicable" checked={c3Applicable} onChange={setC3Applicable} />
              <Toggle label="Mechanical Ventilation" checked={mechanicalVentilation} onChange={setMechanicalVentilation} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {/* RUN button */}
            <button
              onClick={runCalculation}
              disabled={!selectedRef || running}
              className="w-full py-3 rounded-lg text-white font-bold text-sm tracking-wider bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/30"
            >
              {running ? 'CALCULATING...' : 'RUN CALCULATION'}
            </button>

            {/* Compare All 3 */}
            <button
              onClick={handleCompareAll}
              disabled={!selectedRef || running}
              className="w-full py-2.5 rounded-lg text-white font-bold text-xs tracking-wider bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-900/30"
            >
              COMPARE ALL 3
            </button>

            {/* Batch 20 */}
            <button
              onClick={handleBatch}
              disabled={refrigerants.length === 0 || running}
              className="w-full py-2.5 rounded-lg text-white font-bold text-xs tracking-wider bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/30"
            >
              BATCH 20 RANDOM
            </button>
          </div>
        </div>
      </aside>

      {/* ── RIGHT MAIN AREA ──────────────────────────────────────────── */}
      <main className="flex-1 bg-[#0f1117] overflow-y-auto p-6">
        {/* ── Empty state ── */}
        {viewMode === 'single' && !result && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl text-gray-800 mb-4">&gt;_</div>
              <h2 className="text-xl text-gray-600 font-semibold">Engine Simulator</h2>
              <p className="text-gray-700 text-sm mt-2 max-w-md">
                Configure the parameters on the left panel and click{' '}
                <span className="text-blue-500 font-semibold">RUN CALCULATION</span> to see the full
                engine output.
              </p>
            </div>
          </div>
        )}

        {/* ── Single result view ── */}
        {viewMode === 'single' && result && (
          <div className="flex flex-col gap-5 max-w-4xl mx-auto">
            {/* 1 — Decision Banner */}
            <DecisionBanner result={result} />

            {/* 2 — Threshold */}
            <Section title="Detection Threshold" icon="T" defaultOpen accent="text-cyan-400">
              <div className="flex items-center gap-8 justify-center py-2">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white font-mono">
                    {result.thresholdPpm.toLocaleString()}
                    <span className="text-lg text-gray-500 ml-1">ppm</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{result.thresholdBasis}</div>
                </div>
                <div className="w-px h-12 bg-[#2a2e3d]" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white font-mono">
                    {result.thresholdKgM3.toPrecision(4)}
                    <span className="text-lg text-gray-500 ml-1">kg/m&#179;</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">concentration</div>
                </div>
              </div>
              {result.stage2ThresholdPpm !== null && (
                <div className="mt-3 text-center bg-amber-900/20 border border-amber-800/50 rounded-lg p-3">
                  <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">
                    Stage 2 / Main Alarm
                  </div>
                  <div className="text-2xl font-bold text-amber-300 font-mono">
                    {result.stage2ThresholdPpm.toLocaleString()} ppm
                  </div>
                </div>
              )}
            </Section>

            {/* 3 — Alarm Thresholds */}
            <Section title="Alarm Thresholds" icon="A" defaultOpen accent="text-amber-400">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: 'Alarm 1',
                    data: result.alarmThresholds.alarm1,
                    color: 'text-green-400 border-green-800/50 bg-green-900/10',
                  },
                  {
                    label: 'Alarm 2',
                    data: result.alarmThresholds.alarm2,
                    color: 'text-amber-400 border-amber-800/50 bg-amber-900/10',
                  },
                  {
                    label: 'Cutoff',
                    data: result.alarmThresholds.cutoff,
                    color: 'text-red-400 border-red-800/50 bg-red-900/10',
                  },
                ].map((a) => (
                  <div key={a.label} className={`rounded-lg border p-3 text-center ${a.color}`}>
                    <div className="text-xs uppercase tracking-wider opacity-70 mb-1">{a.label}</div>
                    <div className="text-xl font-bold font-mono">{a.data.ppm.toLocaleString()} ppm</div>
                    <div className="text-xs opacity-60 mt-1">{a.data.kgM3.toPrecision(3)} kg/m&#179;</div>
                    <div className="text-[10px] opacity-50 mt-1">{a.data.basis}</div>
                  </div>
                ))}
              </div>
              {result.alarmThresholds.stage2Ppm !== null && (
                <div className="mt-2 text-xs text-amber-400 text-center">
                  Stage 2: {result.alarmThresholds.stage2Ppm.toLocaleString()} ppm (NH3 two-level)
                </div>
              )}
            </Section>

            {/* 4 — Concentration Bar */}
            <Section title="Concentration Visualization" icon="#" defaultOpen accent="text-blue-400">
              <div className="py-4 px-2">
                <ConcentrationBar
                  alarm1={result.alarmThresholds.alarm1.ppm}
                  alarm2={result.alarmThresholds.alarm2.ppm}
                  cutoff={result.alarmThresholds.cutoff.ppm}
                  roomConc={roomConcPpm}
                  thresholdPpm={result.thresholdPpm}
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-8">
                  <span>0 ppm</span>
                  <span className="text-green-600">Safe</span>
                  <span className="text-amber-600">Warning</span>
                  <span className="text-red-600">Danger</span>
                </div>
              </div>
            </Section>

            {/* 5 — Detector Placement */}
            <Section title="Detector Placement" icon="P" accent="text-purple-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Placement Height</div>
                  <div className="text-lg font-semibold text-white capitalize">
                    {result.placementHeight.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">{result.placementHeightM}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Vapour Density</div>
                  <div className="text-sm text-gray-300">
                    {selectedRef?.vapourDensity} kg/m&#179;
                    {selectedRef && (
                      <span className={`ml-2 text-xs ${
                        selectedRef.vapourDensity > 1.18 ? 'text-amber-400' : selectedRef.vapourDensity < 1.1 ? 'text-blue-400' : 'text-gray-500'
                      }`}>
                        ({selectedRef.vapourDensity > 1.18 ? 'heavier than air' : selectedRef.vapourDensity < 1.1 ? 'lighter than air' : 'neutral'})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            {/* 6 — Detector Quantity */}
            <Section title="Detector Quantity" icon="Q" accent="text-green-400">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{result.minDetectors}</div>
                  <div className="text-xs text-gray-500 mt-1">Minimum</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{result.recommendedDetectors}</div>
                  <div className="text-xs text-gray-500 mt-1">Recommended</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-300 capitalize mt-2">
                    {result.quantityMode}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {result.quantityMode === 'area' ? '50 m\u00B2 per detector' : `${result.clusterCount} cluster(s)`}
                  </div>
                </div>
              </div>
            </Section>

            {/* 7 — Emergency Ventilation */}
            {result.ventilation && (
              <Section title="Emergency Ventilation" icon="V" accent="text-sky-400">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Flow Rate</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {result.ventilation.flowRateM3s.toFixed(3)}
                      <span className="text-sm text-gray-500 ml-1">m&#179;/s</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Formula</div>
                    <div className="text-sm text-gray-300 font-mono">{result.ventilation.formula}</div>
                    <div className="text-xs text-gray-500 mt-1">{result.ventilation.clause}</div>
                  </div>
                </div>
              </Section>
            )}

            {/* 8 — Extra Requirements */}
            {result.extraRequirements.length > 0 && (
              <Section title="Extra Requirements" icon="+" accent="text-orange-400">
                <div className="flex flex-col gap-2">
                  {result.extraRequirements.map((req) => (
                    <div
                      key={req.id}
                      className={`rounded border px-3 py-2 text-sm ${
                        req.mandatory
                          ? 'border-red-800/50 bg-red-900/10 text-red-300'
                          : 'border-[#2a2e3d] text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {req.mandatory && (
                          <span className="text-[10px] bg-red-700 text-white px-1.5 py-0.5 rounded uppercase font-bold">
                            mandatory
                          </span>
                        )}
                        <span className="font-mono text-xs text-gray-500">{req.id}</span>
                      </div>
                      <div className="mt-1">{req.description}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{req.clause}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* 9 — Path Evaluations */}
            <Section title="Path Evaluations" icon=">" accent="text-indigo-400">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 uppercase tracking-wider">
                      <th className="text-left py-2 px-2">Path</th>
                      <th className="text-left py-2 px-2">Decision</th>
                      <th className="text-left py-2 px-2">Rule ID</th>
                      <th className="text-left py-2 px-2">Basis</th>
                      <th className="text-center py-2 px-2">Extra Det.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pathEvals.map((pe) => {
                      let rowClass = 'text-gray-600';
                      let badge = 'bg-gray-800 text-gray-500';
                      if (pe.decision === 'YES') {
                        rowClass = 'text-red-300';
                        badge = 'bg-red-900/40 text-red-400';
                      } else if (pe.decision === 'NO') {
                        rowClass = 'text-green-300';
                        badge = 'bg-green-900/40 text-green-400';
                      } else if (pe.decision === 'MANUAL_REVIEW') {
                        rowClass = 'text-amber-300';
                        badge = 'bg-amber-900/40 text-amber-400';
                      } else if (pe.decision === 'RECOMMENDED') {
                        rowClass = 'text-blue-300';
                        badge = 'bg-blue-900/40 text-blue-400';
                      }
                      return (
                        <tr key={pe.path} className={`border-t border-[#2a2e3d] ${rowClass}`}>
                          <td className="py-2 px-2 font-mono">{pe.path}</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge}`}>
                              {pe.decision}
                            </span>
                          </td>
                          <td className="py-2 px-2 font-mono">{pe.ruleId}</td>
                          <td className="py-2 px-2 max-w-[300px] truncate">{pe.basis}</td>
                          <td className="py-2 px-2 text-center">{pe.extraDetector ? 'YES' : '-'}</td>
                        </tr>
                      );
                    })}
                    {pathEvals.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-600">
                          No path evaluations available for this regulation
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 10 — Review Flags & Assumptions */}
            {(result.reviewFlags.length > 0 || result.assumptions.length > 0 || result.requiredActions.length > 0) && (
              <Section title="Review Flags, Assumptions & Actions" icon="!" accent="text-yellow-400">
                <div className="flex flex-col gap-3">
                  {result.reviewFlags.length > 0 && (
                    <div>
                      <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">
                        Review Flags
                      </div>
                      <ul className="flex flex-col gap-1">
                        {result.reviewFlags.map((f, i) => (
                          <li key={i} className="text-sm text-amber-300 bg-amber-900/10 border border-amber-800/30 rounded px-3 py-1.5">
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.assumptions.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Assumptions
                      </div>
                      <ul className="flex flex-col gap-1">
                        {result.assumptions.map((a, i) => (
                          <li key={i} className="text-sm text-gray-400 bg-gray-900/50 border border-[#2a2e3d] rounded px-3 py-1.5">
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.requiredActions.length > 0 && (
                    <div>
                      <div className="text-xs text-blue-400 uppercase tracking-wider mb-1">
                        Required Actions
                      </div>
                      <ul className="flex flex-col gap-1">
                        {result.requiredActions.map((a, i) => (
                          <li key={i} className="text-sm text-blue-300 bg-blue-900/10 border border-blue-800/30 rounded px-3 py-1.5">
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* 11 — Full JSON Output */}
            <Section title="Full JSON Output" icon="{}" defaultOpen={false} accent="text-green-400">
              <JsonViewer data={result} />
            </Section>
          </div>
        )}

        {/* ── Compare view ── */}
        {viewMode === 'compare' && compareScenario && (
          <ComparisonView compareResults={compareResults} scenario={compareScenario} />
        )}

        {/* ── Batch view ── */}
        {viewMode === 'batch' && batchRows.length > 0 && (
          <BatchView batchRows={batchRows} onSelectRow={handleBatchRowSelect} />
        )}
      </main>
    </div>
  );
}

// ── Helper: property row ─────────────────────────────────────────────────
function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-mono">{value}</span>
    </>
  );
}
