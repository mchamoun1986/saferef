'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { RefrigerantV5, RegulationInput, RegulationResult } from '@/lib/engine/types';
import { evaluateRegulation } from '@/lib/engine/evaluate';
import { en378RuleSet } from '@/lib/rules/en378';
import { ashrae15RuleSet } from '@/lib/rules/ashrae15';
import { iso5149RuleSet } from '@/lib/rules/iso5149';
import { getC3Entry } from '@/lib/rules/en378';
import { calcM1M2M3, concentrationKgM3, isFlammable, kgM3ToPpm } from '@/lib/engine/core';

// ── Interfaces ───────────────────────────────────────────────────────────

interface SimInputs {
  refrigerantId: string;
  spaceTypeId: string;
  surface: string;
  height: string;
  charge: string;
  volumeOverride: string;
  accessCategory: 'a' | 'b' | 'c';
  locationClass: 'I' | 'II' | 'III' | 'IV';
  belowGround: boolean;
  isMachineryRoom: boolean;
  isOccupiedSpace: boolean;
  humanComfort: boolean;
  c3Applicable: boolean;
  mechanicalVentilation: boolean;
}

interface SpaceTypeOption {
  id: string;
  labelEn: string;
  icon: string;
  accessCategory: string;
  locationClass: string;
  belowGround: boolean;
  isMachineryRoom: boolean;
  isOccupiedSpace: boolean;
  humanComfort: boolean;
  c3Applicable: boolean;
  mechVentilation: boolean;
}

interface SimResult {
  id: number;
  timestamp: string;
  inputs: SimInputs;
  refrigerant: RefrigerantV5;
  en378: RegulationResult;
  ashrae15: RegulationResult;
  iso5149: RegulationResult;
}

// ── Defaults & Presets ───────────────────────────────────────────────────

const DEFAULT_INPUTS: SimInputs = {
  refrigerantId: '',
  spaceTypeId: '',
  surface: '60',
  height: '3',
  charge: '5',
  volumeOverride: '',
  accessCategory: 'b',
  locationClass: 'II',
  belowGround: false,
  isMachineryRoom: false,
  isOccupiedSpace: true,
  humanComfort: true,
  c3Applicable: true,
  mechanicalVentilation: false,
};

interface Preset {
  label: string;
  refId: string;
  charge: string;
  surface: string;
  height: string;
  accessCategory: 'a' | 'b' | 'c';
  locationClass: 'I' | 'II' | 'III' | 'IV';
  belowGround: boolean;
  isMachineryRoom: boolean;
  isOccupiedSpace: boolean;
  humanComfort: boolean;
  c3Applicable: boolean;
  mechanicalVentilation: boolean;
}

const PRESETS: Preset[] = [
  {
    label: 'R-32 Office 3kg',
    refId: 'R32',
    charge: '3',
    surface: '60',
    height: '3',
    accessCategory: 'b',
    locationClass: 'II',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: false,
  },
  {
    label: 'R-32 Office 10kg',
    refId: 'R32',
    charge: '10',
    surface: '60',
    height: '3',
    accessCategory: 'b',
    locationClass: 'II',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: false,
  },
  {
    label: 'R-744 Supermarket 25kg',
    refId: 'R744',
    charge: '25',
    surface: '200',
    height: '3.5',
    accessCategory: 'b',
    locationClass: 'II',
    belowGround: false,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: true,
  },
  {
    label: 'R-717 Machinery 100kg',
    refId: 'R717',
    charge: '100',
    surface: '100',
    height: '4',
    accessCategory: 'c',
    locationClass: 'III',
    belowGround: false,
    isMachineryRoom: true,
    isOccupiedSpace: false,
    humanComfort: false,
    c3Applicable: false,
    mechanicalVentilation: true,
  },
  {
    label: 'R-290 Underground 5kg',
    refId: 'R290',
    charge: '5',
    surface: '40',
    height: '3',
    accessCategory: 'a',
    locationClass: 'I',
    belowGround: true,
    isMachineryRoom: false,
    isOccupiedSpace: true,
    humanComfort: true,
    c3Applicable: true,
    mechanicalVentilation: false,
  },
  {
    label: 'R-1234yf MR 20kg',
    refId: 'R1234yf',
    charge: '20',
    surface: '50',
    height: '3.5',
    accessCategory: 'c',
    locationClass: 'III',
    belowGround: false,
    isMachineryRoom: true,
    isOccupiedSpace: false,
    humanComfort: false,
    c3Applicable: false,
    mechanicalVentilation: true,
  },
];

// ── Component ────────────────────────────────────────────────────────────

export default function SimulatorPage() {
  // State
  const [refrigerants, setRefrigerants] = useState<RefrigerantV5[]>([]);
  const [spaceTypes, setSpaceTypes] = useState<SpaceTypeOption[]>([]);
  const [inputs, setInputs] = useState<SimInputs>(DEFAULT_INPUTS);
  const [history, setHistory] = useState<SimResult[]>([]);
  const [nextId, setNextId] = useState(1);
  const [refSearch, setRefSearch] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetch('/api/refrigerants-v5')
      .then((r) => r.json())
      .then((data: RefrigerantV5[]) => {
        setRefrigerants(data);
        if (data.length > 0 && !inputs.refrigerantId) {
          setInputs((prev) => ({ ...prev, refrigerantId: data[0].id }));
        }
      })
      .catch(console.error);

    fetch('/api/space-types')
      .then((r) => r.json())
      .then((data: SpaceTypeOption[]) => setSpaceTypes(data))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selected refrigerant
  const selectedRef = useMemo(
    () => refrigerants.find((r) => r.id === inputs.refrigerantId) ?? null,
    [refrigerants, inputs.refrigerantId],
  );

  // Filtered refrigerants for search
  const filteredRefs = useMemo(() => {
    if (!refSearch) return refrigerants;
    const q = refSearch.toLowerCase();
    return refrigerants.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.safetyClass.toLowerCase().includes(q),
    );
  }, [refrigerants, refSearch]);

  // Computed volume
  const volume = useMemo(() => {
    const override = parseFloat(inputs.volumeOverride);
    if (override > 0) return override;
    const s = parseFloat(inputs.surface);
    const h = parseFloat(inputs.height);
    if (s > 0 && h > 0) return s * h;
    return 0;
  }, [inputs.surface, inputs.height, inputs.volumeOverride]);

  // Build RegulationInput
  const regulationInput = useMemo((): RegulationInput | null => {
    if (!selectedRef) return null;
    const charge = parseFloat(inputs.charge);
    const area = parseFloat(inputs.surface);
    const height = parseFloat(inputs.height);
    if (!(charge > 0) || !(area > 0) || !(height >= 0.5)) return null;

    return {
      refrigerant: selectedRef,
      charge,
      roomArea: area,
      roomHeight: height,
      roomVolume: volume > 0 ? volume : undefined,
      accessCategory: inputs.accessCategory,
      locationClass: inputs.locationClass,
      belowGround: inputs.belowGround,
      isMachineryRoom: inputs.isMachineryRoom,
      isOccupiedSpace: inputs.isOccupiedSpace,
      humanComfort: inputs.humanComfort,
      c3Applicable: inputs.c3Applicable,
      mechanicalVentilation: inputs.mechanicalVentilation,
    };
  }, [selectedRef, inputs, volume]);

  // Live results — run all 3 regulations
  const liveResults = useMemo(() => {
    if (!regulationInput) return null;
    return {
      en378: evaluateRegulation(en378RuleSet, regulationInput),
      ashrae15: evaluateRegulation(ashrae15RuleSet, regulationInput),
      iso5149: evaluateRegulation(iso5149RuleSet, regulationInput),
    };
  }, [regulationInput]);

  // ── Helpers ──────────────────────────────────────────────────────────

  const set = useCallback(
    <K extends keyof SimInputs>(field: K, value: SimInputs[K]) => {
      setInputs((prev) => {
        const next = { ...prev, [field]: value };
        // Normative coherence: machinery room -> uncheck occupied, force cat c + class III
        if (field === 'isMachineryRoom' && value === true) {
          next.isOccupiedSpace = false;
          next.accessCategory = 'c';
          next.locationClass = 'III';
        }
        if (field === 'isOccupiedSpace' && value === true) {
          next.isMachineryRoom = false;
        }
        return next;
      });
    },
    [],
  );

  const applySpaceType = useCallback(
    (spaceTypeId: string) => {
      const st = spaceTypes.find((s) => s.id === spaceTypeId);
      if (!st) {
        set('spaceTypeId', spaceTypeId);
        return;
      }
      setInputs((prev) => ({
        ...prev,
        spaceTypeId,
        accessCategory: st.accessCategory as 'a' | 'b' | 'c',
        locationClass: st.locationClass as 'I' | 'II' | 'III' | 'IV',
        belowGround: st.belowGround,
        isMachineryRoom: st.isMachineryRoom,
        isOccupiedSpace: st.isOccupiedSpace,
        humanComfort: st.humanComfort,
        c3Applicable: st.c3Applicable,
        mechanicalVentilation: st.mechVentilation,
      }));
    },
    [spaceTypes, set],
  );

  const applyPreset = useCallback(
    (preset: Preset) => {
      setInputs({
        refrigerantId: preset.refId,
        spaceTypeId: '',
        surface: preset.surface,
        height: preset.height,
        charge: preset.charge,
        volumeOverride: '',
        accessCategory: preset.accessCategory,
        locationClass: preset.locationClass,
        belowGround: preset.belowGround,
        isMachineryRoom: preset.isMachineryRoom,
        isOccupiedSpace: preset.isOccupiedSpace,
        humanComfort: preset.humanComfort,
        c3Applicable: preset.c3Applicable,
        mechanicalVentilation: preset.mechanicalVentilation,
      });
      setRefSearch('');
    },
    [],
  );

  const saveToHistory = useCallback(() => {
    if (!liveResults || !selectedRef) return;
    const entry: SimResult = {
      id: nextId,
      timestamp: new Date().toISOString(),
      inputs: { ...inputs },
      refrigerant: selectedRef,
      en378: liveResults.en378,
      ashrae15: liveResults.ashrae15,
      iso5149: liveResults.iso5149,
    };
    setHistory((prev) => [entry, ...prev]);
    setNextId((n) => n + 1);
  }, [liveResults, selectedRef, inputs, nextId]);

  // ── Render helpers ──────────────────────────────────────────────────

  const decisionBadge = (d: string) => {
    const colors: Record<string, string> = {
      YES: 'bg-red-100 text-red-800 border-red-300',
      NO: 'bg-green-100 text-green-800 border-green-300',
      RECOMMENDED: 'bg-amber-100 text-amber-800 border-amber-300',
      MANUAL_REVIEW: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${colors[d] ?? 'bg-gray-100 text-gray-700'}`}>
        {d}
      </span>
    );
  };

  // ── JSX ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#16354B] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide">Simulator</h1>
          <p className="text-sm text-gray-300 mt-0.5">
            Live 3-regulation comparison calculator
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(p)}
              className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split layout */}
      <div className="flex">
        {/* ── LEFT PANEL: Inputs ──────────────────────────────────── */}
        <div className="w-[340px] flex-shrink-0 border-r border-gray-200 bg-white p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>

          {/* Refrigerant Section */}
          <section>
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">
              Refrigerant
            </h3>
            <input
              type="text"
              placeholder="Search refrigerant..."
              value={refSearch}
              onChange={(e) => setRefSearch(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946] mb-2"
            />
            <select
              value={inputs.refrigerantId}
              onChange={(e) => {
                set('refrigerantId', e.target.value);
                setRefSearch('');
              }}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]"
            >
              <option value="">-- Select --</option>
              {filteredRefs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.name} ({r.safetyClass})
                </option>
              ))}
            </select>

            {/* Properties card */}
            {selectedRef && (
              <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Safety class</span>
                  <span className="font-semibold">{selectedRef.safetyClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GWP</span>
                  <span className="font-semibold">{selectedRef.gwp ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ATEL/ODL</span>
                  <span className="font-semibold">
                    {selectedRef.atelOdl != null
                      ? `${selectedRef.atelOdl} kg/m3`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">LFL</span>
                  <span className="font-semibold">
                    {selectedRef.lfl != null
                      ? `${selectedRef.lfl} kg/m3`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vapour density</span>
                  <span className="font-semibold">{selectedRef.vapourDensity} kg/m3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mol. mass</span>
                  <span className="font-semibold">{selectedRef.molecularMass} g/mol</span>
                </div>
              </div>
            )}
          </section>

          {/* Zone Section */}
          <section>
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">
              Zone
            </h3>
            <select
              value={inputs.spaceTypeId}
              onChange={(e) => applySpaceType(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946] mb-2"
            >
              <option value="">-- Custom --</option>
              {spaceTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.icon} {st.labelEn}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Surface (m2)</label>
                <input
                  type="number"
                  value={inputs.surface}
                  onChange={(e) => set('surface', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]"
                  min="1"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Height (m)</label>
                <input
                  type="number"
                  value={inputs.height}
                  onChange={(e) => set('height', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]"
                  min="0.5"
                  step="0.1"
                />
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-0.5">Charge (kg)</label>
              <input
                type="number"
                value={inputs.charge}
                onChange={(e) => set('charge', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]"
                min="0.1"
                step="0.1"
              />
            </div>

            {/* Volume: auto or override */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-0.5">
                  Volume (m3){' '}
                  <span className="text-gray-400">
                    {inputs.volumeOverride ? 'override' : 'auto'}
                  </span>
                </label>
                <input
                  type="number"
                  value={inputs.volumeOverride || ''}
                  onChange={(e) => set('volumeOverride', e.target.value)}
                  placeholder={volume > 0 ? volume.toFixed(1) : '—'}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E63946]"
                  min="1"
                  step="1"
                />
              </div>
              <div className="pt-4 text-sm font-mono text-[#16354B]">
                = {volume > 0 ? volume.toFixed(1) : '—'} m3
              </div>
            </div>
          </section>

          {/* Regulatory Flags Section */}
          <section>
            <h3 className="text-sm font-semibold text-[#16354B] uppercase tracking-wider mb-2">
              Regulatory Flags
            </h3>

            {/* Access Category */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Access category</label>
              <div className="flex gap-1">
                {(['a', 'b', 'c'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => set('accessCategory', cat)}
                    className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                      inputs.accessCategory === cat
                        ? 'bg-[#16354B] text-white border-[#16354B]'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Cat {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Class */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Location class</label>
              <div className="flex gap-1">
                {(['I', 'II', 'III', 'IV'] as const).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => set('locationClass', cls)}
                    className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                      inputs.locationClass === cls
                        ? 'bg-[#16354B] text-white border-[#16354B]'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-1.5">
              {([
                { key: 'belowGround' as const, label: 'Below ground' },
                { key: 'isMachineryRoom' as const, label: 'Machinery room' },
                { key: 'isOccupiedSpace' as const, label: 'Occupied space' },
                { key: 'humanComfort' as const, label: 'Human comfort' },
                { key: 'c3Applicable' as const, label: 'C.3 applicable' },
                { key: 'mechanicalVentilation' as const, label: 'Mechanical ventilation' },
              ]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputs[key]}
                    onChange={(e) => set(key, e.target.checked)}
                    className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          {/* Save Button */}
          <button
            onClick={saveToHistory}
            disabled={!liveResults}
            className="w-full py-2 rounded text-sm font-semibold transition-colors bg-[#E63946] text-white hover:bg-[#d32f3b] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save to History
          </button>

          {/* Live summary */}
          {liveResults && (
            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs space-y-1">
              <div className="font-semibold text-[#16354B] mb-1">Live Summary</div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">EN 378</span>
                {decisionBadge(liveResults.en378.detectionRequired)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ASHRAE 15</span>
                {decisionBadge(liveResults.ashrae15.detectionRequired)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ISO 5149</span>
                {decisionBadge(liveResults.iso5149.detectionRequired)}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Results ────────────────────────────────── */}
        <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {!liveResults ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <p className="text-lg font-medium">Select a refrigerant to begin</p>
                <p className="text-sm mt-1">
                  Choose a preset above or configure inputs manually
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Task 4 — 3-regulation comparison table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#16354B] text-white px-5 py-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold">3-Regulation Comparison</h2>
                    {selectedRef && (
                      <p className="text-xs text-gray-300 mt-0.5">
                        {selectedRef.id} ({selectedRef.safetyClass}) &mdash; {inputs.charge} kg in {volume.toFixed(1)} m3
                      </p>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-2 w-40">Metric</th>
                        <th className="px-4 py-2">EN 378</th>
                        <th className="px-4 py-2">ASHRAE 15</th>
                        <th className="px-4 py-2">ISO 5149</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* Detection required */}
                      <tr>
                        <td className="px-4 py-2 font-medium text-gray-700">Detection</td>
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => (
                          <td key={key} className="px-4 py-2">{decisionBadge(liveResults[key].detectionRequired)}</td>
                        ))}
                      </tr>
                      {/* Governing rule */}
                      <tr className="bg-gray-50/50">
                        <td className="px-4 py-2 font-medium text-gray-700">Governing Rule</td>
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => (
                          <td key={key} className="px-4 py-2 font-mono text-xs">{liveResults[key].governingRuleId}</td>
                        ))}
                      </tr>
                      {/* Min / Rec detectors */}
                      <tr>
                        <td className="px-4 py-2 font-medium text-gray-700">Min / Rec Detectors</td>
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => (
                          <td key={key} className="px-4 py-2">
                            <span className="font-bold">{liveResults[key].minDetectors}</span>
                            {' / '}
                            <span className="font-bold">{liveResults[key].recommendedDetectors}</span>
                          </td>
                        ))}
                      </tr>
                      {/* Threshold */}
                      <tr className="bg-gray-50/50">
                        <td className="px-4 py-2 font-medium text-gray-700">Threshold</td>
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => (
                          <td key={key} className="px-4 py-2">
                            <span className="font-semibold">{liveResults[key].thresholdPpm} ppm</span>
                            <br />
                            <span className="text-xs text-gray-400">{liveResults[key].thresholdBasis}</span>
                          </td>
                        ))}
                      </tr>
                      {/* Placement */}
                      <tr>
                        <td className="px-4 py-2 font-medium text-gray-700">Placement</td>
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => (
                          <td key={key} className="px-4 py-2">
                            <span className="capitalize">{liveResults[key].placementHeight}</span>
                            <br />
                            <span className="text-xs text-gray-400">{liveResults[key].placementHeightM}</span>
                          </td>
                        ))}
                      </tr>
                      {/* Ventilation */}
                      <tr className="bg-gray-50/50">
                        <td className="px-4 py-2 font-medium text-gray-700">Ventilation</td>
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => (
                          <td key={key} className="px-4 py-2">
                            {liveResults[key].ventilation
                              ? `${liveResults[key].ventilation!.flowRateM3s.toFixed(3)} m3/s`
                              : <span className="text-gray-300">&mdash;</span>}
                          </td>
                        ))}
                      </tr>
                      {/* Alarm 1 */}
                      <tr>
                        <td className="px-4 py-2 font-medium text-gray-700">Alarm 1</td>
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => (
                          <td key={key} className="px-4 py-2">
                            <span className="font-semibold">{Math.floor(liveResults[key].alarmThresholds.alarm1.ppm)} ppm</span>
                          </td>
                        ))}
                      </tr>
                      {/* Alarm 2 */}
                      <tr className="bg-gray-50/50">
                        <td className="px-4 py-2 font-medium text-gray-700">Alarm 2</td>
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => (
                          <td key={key} className="px-4 py-2">
                            <span className="font-semibold">{Math.floor(liveResults[key].alarmThresholds.alarm2.ppm)} ppm</span>
                          </td>
                        ))}
                      </tr>
                      {/* Cutoff */}
                      <tr>
                        <td className="px-4 py-2 font-medium text-gray-700">Cutoff</td>
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => (
                          <td key={key} className="px-4 py-2">
                            <span className="font-semibold">{Math.floor(liveResults[key].alarmThresholds.cutoff.ppm)} ppm</span>
                          </td>
                        ))}
                      </tr>
                      {/* Quantity Mode */}
                      <tr className="bg-gray-50/50">
                        <td className="px-4 py-2 font-medium text-gray-700">Quantity Mode</td>
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => (
                          <td key={key} className="px-4 py-2">
                            <span className="capitalize">{liveResults[key].quantityMode}</span>
                            {liveResults[key].quantityMode === 'cluster' && (
                              <span className="text-xs text-gray-400 ml-1">({liveResults[key].clusterCount} clusters)</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Task 5 — Charge vs limits, decision paths, threshold trace */}
              {(() => {
                const charge = parseFloat(inputs.charge) || 0;
                const conc = volume > 0 ? concentrationKgM3(charge, volume) : 0;
                const pl = selectedRef ? selectedRef.practicalLimit : 0;
                const plExceeded = conc > pl;
                const c3 = selectedRef ? getC3Entry(selectedRef.id) : null;
                const flam = selectedRef ? isFlammable(selectedRef.flammabilityClass) : false;
                const masses = (flam && selectedRef?.lfl) ? calcM1M2M3(selectedRef.lfl, volume) : null;

                return (
                  <div className="space-y-4">
                    {/* Section 1: Charge vs Limits */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-[#16354B] text-white px-5 py-2">
                        <h2 className="text-base font-bold">Charge vs Limits</h2>
                      </div>
                      <div className="p-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="p-3 bg-gray-50 rounded border">
                            <div className="text-xs text-gray-500">Charge</div>
                            <div className="font-bold text-lg">{charge} kg</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded border">
                            <div className="text-xs text-gray-500">Volume</div>
                            <div className="font-bold text-lg">{volume.toFixed(1)} m3</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded border">
                            <div className="text-xs text-gray-500">Concentration</div>
                            <div className="font-bold text-lg">{conc.toPrecision(4)} kg/m3</div>
                          </div>
                          <div className={`p-3 rounded border ${plExceeded ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <div className="text-xs text-gray-500">PL (RCL)</div>
                            <div className="font-bold text-lg">{pl} kg/m3</div>
                            <span className={`text-xs font-semibold ${plExceeded ? 'text-red-600' : 'text-green-600'}`}>
                              {plExceeded ? 'EXCEEDED' : 'OK'}
                            </span>
                          </div>
                        </div>

                        {/* C.3 Table */}
                        {c3 && (
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">EN 378-1 Table C.3</h4>
                            <div className="grid grid-cols-3 gap-3">
                              {([
                                { label: 'RCL', val: c3.rcl, chargeMax: c3.rcl * volume },
                                { label: 'QLMV', val: c3.qlmv, chargeMax: c3.qlmv * volume },
                                { label: 'QLAV', val: c3.qlav, chargeMax: c3.qlav * volume },
                              ] as const).map(({ label, val, chargeMax }) => {
                                const exceeded = conc > val;
                                return (
                                  <div key={label} className={`p-2 rounded border text-xs ${exceeded ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                    <div className="font-semibold">{label}: {val} kg/m3</div>
                                    <div className="text-gray-500">Max charge: {chargeMax.toFixed(2)} kg</div>
                                    <span className={`font-semibold ${exceeded ? 'text-red-600' : 'text-green-600'}`}>
                                      {exceeded ? 'EXCEEDED' : 'OK'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* m1/m2/m3 for flammable */}
                        {masses && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Flammable Charge Limits (m1/m2/m3)</h4>
                            <div className="grid grid-cols-3 gap-3">
                              {([
                                { label: 'm1 (no measures)', val: masses.m1 },
                                { label: 'm2 (1 measure)', val: masses.m2 },
                                { label: 'm3 (2 measures)', val: masses.m3 },
                              ] as const).map(({ label, val }) => {
                                const exceeded = charge > val;
                                return (
                                  <div key={label} className={`p-2 rounded border text-xs ${exceeded ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                    <div className="font-semibold">{label}</div>
                                    <div className="text-gray-700">{val.toFixed(3)} kg</div>
                                    <span className={`font-semibold ${exceeded ? 'text-red-600' : 'text-green-600'}`}>
                                      {exceeded ? 'EXCEEDED' : 'OK'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 2: Decision Paths */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-[#16354B] text-white px-5 py-2">
                        <h2 className="text-base font-bold">Decision Paths</h2>
                      </div>
                      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(['en378', 'ashrae15', 'iso5149'] as const).map((key) => {
                          const r = liveResults[key];
                          const paths = r.trace?.pathEvaluations ?? [];
                          return (
                            <div key={key} className="space-y-2">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {r.regulationName}
                              </h4>
                              {paths.length === 0 ? (
                                <p className="text-xs text-gray-400">No trace data</p>
                              ) : (
                                paths.map((pe, i) => {
                                  const isSkip = pe.decision === 'SKIP';
                                  return (
                                    <div key={i} className={`flex items-start gap-2 text-xs ${isSkip ? 'opacity-50' : ''}`}>
                                      {decisionBadge(pe.decision)}
                                      <div className="min-w-0">
                                        <div className="font-medium text-gray-700 truncate">{pe.path}</div>
                                        <div className="text-gray-400 line-clamp-2">{pe.basis}</div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 3: Threshold & Placement */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-[#16354B] text-white px-5 py-2">
                        <h2 className="text-base font-bold">Threshold &amp; Placement</h2>
                      </div>
                      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Threshold calc */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Threshold Calculation</h4>
                          {liveResults.en378.trace?.thresholdCalc ? (() => {
                            const tc = liveResults.en378.trace.thresholdCalc;
                            return (
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">50% ATEL</span>
                                  <span className="font-mono">{tc.halfAtelPpm !== null ? `${Math.floor(tc.halfAtelPpm)} ppm` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">25% LFL</span>
                                  <span className="font-mono">{tc.lfl25PctPpm !== null ? `${Math.floor(tc.lfl25PctPpm)} ppm` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-200">
                                  <span className="text-gray-700 font-semibold">Chosen</span>
                                  <span className="font-mono font-semibold text-[#E63946]">{tc.finalPpm} ppm ({tc.chosen})</span>
                                </div>
                              </div>
                            );
                          })() : <p className="text-xs text-gray-400">No trace data</p>}
                        </div>

                        {/* Placement */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Placement</h4>
                          {liveResults.en378.trace?.placementCalc ? (() => {
                            const pc = liveResults.en378.trace.placementCalc;
                            return (
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Vapour density</span>
                                  <span className="font-mono">{pc.vapourDensity} kg/m3</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Ratio</span>
                                  <span className="font-mono capitalize">{pc.ratio}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-200">
                                  <span className="text-gray-700 font-semibold">Result</span>
                                  <span className="font-semibold text-[#16354B]">{pc.result}</span>
                                </div>
                              </div>
                            );
                          })() : <p className="text-xs text-gray-400">No trace data</p>}
                        </div>

                        {/* Quantity */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Quantity</h4>
                          {liveResults.en378.trace?.quantityCalc ? (() => {
                            const qc = liveResults.en378.trace.quantityCalc;
                            return (
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Area-based</span>
                                  <span className="font-mono">{qc.areaBased}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Clusters</span>
                                  <span className="font-mono">{qc.clusters}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-200">
                                  <span className="text-gray-700 font-semibold">Mode</span>
                                  <span className="font-semibold text-[#16354B] capitalize">{qc.mode}</span>
                                </div>
                              </div>
                            );
                          })() : <p className="text-xs text-gray-400">No trace data</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Task 6 — History table + CSV export */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#1a2332] text-white px-5 py-3 flex items-center justify-between">
                  <h2 className="text-base font-bold">Simulation History ({history.length})</h2>
                  <div className="flex gap-2">
                    <button
                      disabled={history.length === 0}
                      onClick={() => {
                        const header = '#,Time,Refrigerant,Charge (kg),Volume (m3),EN 378,ASHRAE 15,ISO 5149,Min Det,Rec Det';
                        const rows = history.map((h, i) => {
                          const vol = h.inputs.volumeOverride
                            ? parseFloat(h.inputs.volumeOverride)
                            : parseFloat(h.inputs.surface) * parseFloat(h.inputs.height);
                          return [
                            i + 1,
                            new Date(h.timestamp).toLocaleString(),
                            h.refrigerant.id,
                            h.inputs.charge,
                            vol.toFixed(1),
                            h.en378.detectionRequired,
                            h.ashrae15.detectionRequired,
                            h.iso5149.detectionRequired,
                            h.en378.minDetectors,
                            h.en378.recommendedDetectors,
                          ].join(',');
                        });
                        const csv = [header, ...rows].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `detectcalc-sim-${new Date().toISOString().slice(0, 10)}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors border border-white/20 disabled:opacity-40"
                    >
                      Export CSV
                    </button>
                    <button
                      disabled={history.length === 0}
                      onClick={() => setHistory([])}
                      className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors border border-white/20 disabled:opacity-40"
                    >
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
                      <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-left text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Time</th>
                          <th className="px-3 py-2">Refrigerant</th>
                          <th className="px-3 py-2">Charge</th>
                          <th className="px-3 py-2">Volume</th>
                          <th className="px-3 py-2">EN 378</th>
                          <th className="px-3 py-2">ASHRAE</th>
                          <th className="px-3 py-2">ISO</th>
                          <th className="px-3 py-2">Detectors</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {history.map((h, i) => {
                          const vol = h.inputs.volumeOverride
                            ? parseFloat(h.inputs.volumeOverride)
                            : parseFloat(h.inputs.surface) * parseFloat(h.inputs.height);
                          return (
                            <tr key={h.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{new Date(h.timestamp).toLocaleTimeString()}</td>
                              <td className="px-3 py-2 font-semibold">{h.refrigerant.id}</td>
                              <td className="px-3 py-2">{h.inputs.charge} kg</td>
                              <td className="px-3 py-2">{vol.toFixed(1)} m3</td>
                              <td className="px-3 py-2">{decisionBadge(h.en378.detectionRequired)}</td>
                              <td className="px-3 py-2">{decisionBadge(h.ashrae15.detectionRequired)}</td>
                              <td className="px-3 py-2">{decisionBadge(h.iso5149.detectionRequired)}</td>
                              <td className="px-3 py-2 font-mono">{h.en378.minDetectors}/{h.en378.recommendedDetectors}</td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => { setInputs(h.inputs); setRefSearch(''); }}
                                  className="text-[#E63946] hover:underline font-medium"
                                >
                                  Reload
                                </button>
                              </td>
                            </tr>
                          );
                        })}
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
