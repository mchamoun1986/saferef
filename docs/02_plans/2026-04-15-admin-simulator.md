# Admin Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a split-screen admin simulator page at `/admin/simulator` with live 3-regulation comparison, full calculation trace, space-type auto-config, and simulation history with CSV/PDF export.

**Architecture:** Single `page.tsx` component using React state + `useMemo` for live recalculation. Reuses existing `evaluateRegulation()` engine and all 3 rule sets client-side. No new API routes — only fetches refrigerants and space types on mount.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, jsPDF (for PDF export)

---

### Task 1: Add Simulator link to admin nav

**Files:**
- Modify: `src/app/admin/nav.tsx`

- [ ] **Step 1: Add the Simulator link**

In `src/app/admin/nav.tsx`, add to the `links` array after testlab:

```typescript
const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/gas', label: 'Refrigerants' },
  { href: '/admin/applications', label: 'Applications' },
  { href: '/admin/space-types', label: 'Space Types' },
  { href: '/admin/calc-sheets', label: 'Calc Sheets' },
  { href: '/admin/engine', label: 'Engine' },
  { href: '/admin/testlab', label: 'TestLab' },
  { href: '/admin/simulator', label: 'Simulator' },
];
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: builds with warning about missing page (OK for now)

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/nav.tsx
git commit -m "feat(admin): add Simulator link to nav"
```

---

### Task 2: Create simulator page — scaffold + data loading

**Files:**
- Create: `src/app/admin/simulator/page.tsx`

- [ ] **Step 1: Create the page with data fetching and empty layout**

Create `src/app/admin/simulator/page.tsx`:

```tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { RefrigerantV5, RegulationInput, RegulationResult, RegulationTrace } from '@/lib/engine/types';
import { evaluateRegulation } from '@/lib/engine/evaluate';
import { en378RuleSet } from '@/lib/rules/en378';
import { ashrae15RuleSet } from '@/lib/rules/ashrae15';
import { iso5149RuleSet } from '@/lib/rules/iso5149';
import { getC3Entry } from '@/lib/rules/en378';
import { calcM1M2M3, concentrationKgM3, isFlammable } from '@/lib/engine/core';

// ── Types ────────────────────────────────────────────────────────────────

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

interface SimInputs {
  refrigerantId: string;
  spaceTypeId: string;
  surface: number;
  height: number;
  charge: number;
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

interface SimResult {
  id: number;
  timestamp: string;
  inputs: SimInputs;
  refrigerant: RefrigerantV5;
  en378: RegulationResult;
  ashrae15: RegulationResult;
  iso5149: RegulationResult;
}

const DEFAULT_INPUTS: SimInputs = {
  refrigerantId: '',
  spaceTypeId: '',
  surface: 50,
  height: 3,
  charge: 10,
  volumeOverride: '',
  accessCategory: 'b',
  locationClass: 'II',
  belowGround: false,
  isMachineryRoom: false,
  isOccupiedSpace: true,
  humanComfort: false,
  c3Applicable: false,
  mechanicalVentilation: false,
};

// ── Presets ───────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  refId: string;
  inputs: Partial<SimInputs>;
}

const PRESETS: Preset[] = [
  { label: 'R-32 Office (3 kg)', refId: 'R32', inputs: { surface: 25, height: 2.8, charge: 3, isOccupiedSpace: true, c3Applicable: true, accessCategory: 'b', locationClass: 'II' } },
  { label: 'R-32 Office (10 kg)', refId: 'R32', inputs: { surface: 25, height: 2.8, charge: 10, isOccupiedSpace: true, c3Applicable: true, accessCategory: 'b', locationClass: 'II' } },
  { label: 'R-744 Supermarket', refId: 'R744', inputs: { surface: 200, height: 3.5, charge: 25, isOccupiedSpace: true, c3Applicable: true, accessCategory: 'b', locationClass: 'II' } },
  { label: 'R-717 Machinery (100 kg)', refId: 'R717', inputs: { surface: 100, height: 4, charge: 100, isMachineryRoom: true, isOccupiedSpace: false, accessCategory: 'c', locationClass: 'III', mechanicalVentilation: true } },
  { label: 'R-290 Underground', refId: 'R290', inputs: { surface: 50, height: 3, charge: 5, belowGround: true, isOccupiedSpace: false, c3Applicable: true, accessCategory: 'b', locationClass: 'II' } },
  { label: 'R-1234yf MR (20 kg)', refId: 'R1234yf', inputs: { surface: 20, height: 3, charge: 20, isMachineryRoom: true, isOccupiedSpace: false, accessCategory: 'c', locationClass: 'III' } },
];

// ── Component ────────────────────────────────────────────────────────────

export default function SimulatorPage() {
  const [refrigerants, setRefrigerants] = useState<RefrigerantV5[]>([]);
  const [spaceTypes, setSpaceTypes] = useState<SpaceTypeOption[]>([]);
  const [inputs, setInputs] = useState<SimInputs>(DEFAULT_INPUTS);
  const [history, setHistory] = useState<SimResult[]>([]);
  const [nextId, setNextId] = useState(1);
  const [refSearch, setRefSearch] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetch('/api/refrigerants-v5').then(r => r.json()).then(d => {
      const arr = Array.isArray(d) ? d : [];
      setRefrigerants(arr);
      if (arr.length > 0 && !inputs.refrigerantId) {
        setInputs(prev => ({ ...prev, refrigerantId: arr[0].id }));
      }
    });
    fetch('/api/space-types').then(r => r.json()).then(d => setSpaceTypes(Array.isArray(d) ? d : []));
  }, []);

  // Selected refrigerant
  const selectedRef = useMemo(
    () => refrigerants.find(r => r.id === inputs.refrigerantId) ?? null,
    [refrigerants, inputs.refrigerantId],
  );

  // Filtered refrigerants for search
  const filteredRefs = useMemo(() => {
    if (!refSearch) return refrigerants;
    const q = refSearch.toLowerCase();
    return refrigerants.filter(r =>
      r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.safetyClass.toLowerCase().includes(q)
    );
  }, [refrigerants, refSearch]);

  // Build RegulationInput from SimInputs
  const regulationInput = useMemo((): RegulationInput | null => {
    if (!selectedRef) return null;
    const volume = inputs.volumeOverride ? parseFloat(inputs.volumeOverride) : inputs.surface * inputs.height;
    if (volume <= 0 || inputs.charge <= 0) return null;
    return {
      refrigerant: selectedRef,
      charge: inputs.charge,
      roomArea: inputs.surface,
      roomHeight: inputs.height,
      roomVolume: volume,
      accessCategory: inputs.accessCategory,
      locationClass: inputs.locationClass,
      belowGround: inputs.belowGround,
      isMachineryRoom: inputs.isMachineryRoom,
      isOccupiedSpace: inputs.isOccupiedSpace,
      humanComfort: inputs.humanComfort,
      c3Applicable: inputs.c3Applicable,
      mechanicalVentilation: inputs.mechanicalVentilation,
    };
  }, [selectedRef, inputs]);

  // Live results — recalculate on every input change
  const liveResults = useMemo(() => {
    if (!regulationInput) return null;
    return {
      en378: evaluateRegulation(en378RuleSet, regulationInput),
      ashrae15: evaluateRegulation(ashrae15RuleSet, regulationInput),
      iso5149: evaluateRegulation(iso5149RuleSet, regulationInput),
    };
  }, [regulationInput]);

  // Update inputs helper
  const set = useCallback(<K extends keyof SimInputs>(field: K, value: SimInputs[K]) => {
    setInputs(prev => {
      const updated = { ...prev, [field]: value };
      // Coherence: machinery room ≠ occupied space
      if (field === 'isMachineryRoom' && value === true) {
        updated.isOccupiedSpace = false;
        updated.accessCategory = 'c';
        updated.locationClass = 'III';
      }
      if (field === 'isOccupiedSpace' && value === true) {
        updated.isMachineryRoom = false;
      }
      return updated;
    });
  }, []);

  // Apply space type
  const applySpaceType = useCallback((stId: string) => {
    const st = spaceTypes.find(s => s.id === stId);
    if (!st) return;
    setInputs(prev => ({
      ...prev,
      spaceTypeId: stId,
      accessCategory: st.accessCategory as 'a' | 'b' | 'c',
      locationClass: st.locationClass as 'I' | 'II' | 'III' | 'IV',
      belowGround: st.belowGround,
      isMachineryRoom: st.isMachineryRoom,
      isOccupiedSpace: st.isOccupiedSpace,
      humanComfort: st.humanComfort,
      c3Applicable: st.c3Applicable,
      mechanicalVentilation: st.mechVentilation,
    }));
  }, [spaceTypes]);

  // Apply preset
  const applyPreset = useCallback((preset: Preset) => {
    setInputs(prev => ({
      ...DEFAULT_INPUTS,
      refrigerantId: preset.refId,
      ...preset.inputs,
    }));
    setRefSearch('');
  }, []);

  // Save to history
  const saveToHistory = useCallback(() => {
    if (!liveResults || !selectedRef) return;
    const entry: SimResult = {
      id: nextId,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      inputs: { ...inputs },
      refrigerant: selectedRef,
      ...liveResults,
    };
    setHistory(prev => [entry, ...prev]);
    setNextId(prev => prev + 1);
  }, [liveResults, selectedRef, inputs, nextId]);

  // Volume helper
  const volume = inputs.volumeOverride ? parseFloat(inputs.volumeOverride) || 0 : inputs.surface * inputs.height;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="p-4 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#1a2332]">Simulator</h1>
        <div className="flex gap-2">
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => applyPreset(p)}
              className="px-2.5 py-1 text-[10px] font-semibold rounded bg-[#16354B] text-white hover:bg-[#1e4a66] transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {/* ── LEFT: Inputs ── */}
        <div className="w-[340px] flex-shrink-0 space-y-3">
          {/* TODO Task 3: Refrigerant selector */}
          {/* TODO Task 3: Zone inputs */}
          {/* TODO Task 3: Regulatory flags */}
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="flex-1 space-y-3">
          {/* TODO Task 4: 3-regulation comparison */}
          {/* TODO Task 5: Charge vs limits + paths + trace */}
          {/* TODO Task 6: History table + export */}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx next build 2>&1 | tail -5`
Expected: successful build, `/admin/simulator` listed as static page

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/simulator/page.tsx
git commit -m "feat(admin): scaffold simulator page with data loading and live calc"
```

---

### Task 3: Left panel — inputs (refrigerant, zone, flags)

**Files:**
- Modify: `src/app/admin/simulator/page.tsx`

- [ ] **Step 1: Replace the TODO comments in the left panel with the full input UI**

Replace the three TODO lines inside `{/* ── LEFT: Inputs ── */}` with:

```tsx
          {/* Refrigerant */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-[10px] font-bold text-[#E63946] uppercase tracking-widest mb-2">Refrigerant</p>
            <input
              type="text"
              placeholder="Search R-32, R-744..."
              value={refSearch}
              onChange={e => { setRefSearch(e.target.value); }}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <select
              value={inputs.refrigerantId}
              onChange={e => set('refrigerantId', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">— Select —</option>
              {filteredRefs.map(r => (
                <option key={r.id} value={r.id}>{r.id} — {r.name} ({r.safetyClass})</option>
              ))}
            </select>
            {selectedRef && (
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-gray-600">
                <p>Safety: <span className="font-bold text-[#16354B]">{selectedRef.safetyClass}</span></p>
                <p>GWP: <span className="font-bold">{selectedRef.gwp}</span></p>
                <p>ATEL/ODL: <span className="font-bold">{selectedRef.atelOdl ?? '—'} kg/m³</span></p>
                <p>LFL: <span className="font-bold">{selectedRef.lfl ?? '—'} kg/m³</span></p>
                <p>VD: <span className="font-bold">{selectedRef.vapourDensity}</span></p>
                <p>MM: <span className="font-bold">{selectedRef.molecularMass}</span></p>
              </div>
            )}
          </div>

          {/* Zone */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-[10px] font-bold text-[#E63946] uppercase tracking-widest mb-2">Zone</p>
            {spaceTypes.length > 0 && (
              <select
                value={inputs.spaceTypeId}
                onChange={e => { if (e.target.value) applySpaceType(e.target.value); else set('spaceTypeId', ''); }}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="">— Space Type —</option>
                {spaceTypes.map(st => (
                  <option key={st.id} value={st.id}>{st.icon} {st.labelEn}</option>
                ))}
              </select>
            )}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-400">Surface (m²)</label>
                <input type="number" value={inputs.surface} onChange={e => set('surface', +e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Height (m)</label>
                <input type="number" value={inputs.height} step="0.1" onChange={e => set('height', +e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Charge (kg)</label>
                <input type="number" value={inputs.charge} onChange={e => set('charge', +e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
              </div>
            </div>
            <div className="mt-2">
              <label className="text-[10px] text-gray-400">Volume (m³) — auto: {(inputs.surface * inputs.height).toFixed(1)}</label>
              <input type="text" placeholder="auto" value={inputs.volumeOverride}
                onChange={e => set('volumeOverride', e.target.value)}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
            </div>
          </div>

          {/* Regulatory Flags */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-[10px] font-bold text-[#E63946] uppercase tracking-widest mb-2">Regulatory Context</p>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {(['a', 'b', 'c'] as const).map(cat => (
                <label key={cat} className={`flex items-center gap-1.5 text-[10px] p-1.5 rounded border cursor-pointer ${inputs.accessCategory === cat ? 'border-[#16354B] bg-[#16354B]/5 font-bold' : 'border-gray-200'}`}>
                  <input type="radio" name="cat" checked={inputs.accessCategory === cat} onChange={() => set('accessCategory', cat)} className="w-3 h-3" />
                  Cat. {cat}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {(['I', 'II', 'III', 'IV'] as const).map(cls => (
                <label key={cls} className={`flex items-center gap-1.5 text-[10px] p-1.5 rounded border cursor-pointer ${inputs.locationClass === cls ? 'border-[#16354B] bg-[#16354B]/5 font-bold' : 'border-gray-200'}`}>
                  <input type="radio" name="loc" checked={inputs.locationClass === cls} onChange={() => set('locationClass', cls)} className="w-3 h-3" />
                  Class {cls}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {([
                ['isMachineryRoom', 'Machinery Room'],
                ['isOccupiedSpace', 'Occupied Space'],
                ['belowGround', 'Below Ground'],
                ['c3Applicable', 'C3 Applicable'],
                ['humanComfort', 'Human Comfort'],
                ['mechanicalVentilation', 'Mech. Ventilation'],
              ] as [keyof SimInputs, string][]).map(([field, label]) => (
                <label key={field} className={`flex items-center gap-1.5 text-[10px] p-1.5 rounded border cursor-pointer ${inputs[field] ? 'border-[#16354B] bg-[#16354B]/5 font-bold' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={inputs[field] as boolean} onChange={e => set(field, e.target.checked as never)} className="w-3 h-3" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Save to history button */}
          <button onClick={saveToHistory} disabled={!liveResults}
            className="w-full py-2 rounded-lg text-xs font-bold text-white bg-[#E63946] hover:bg-[#c62d38] disabled:opacity-40 transition-colors">
            Save to History
          </button>
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: successful build

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/simulator/page.tsx
git commit -m "feat(admin): simulator left panel — refrigerant, zone, flags inputs"
```

---

### Task 4: Right panel — 3-regulation comparison table

**Files:**
- Modify: `src/app/admin/simulator/page.tsx`

- [ ] **Step 1: Replace the Task 4 TODO with the comparison table**

Replace `{/* TODO Task 4: 3-regulation comparison */}` with:

```tsx
          {/* 3-Regulation Comparison */}
          {liveResults && selectedRef ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#16354B] text-white px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest">3-Regulation Comparison</span>
                <span className="text-[10px] text-gray-300">{selectedRef.id} — {inputs.charge} kg / {volume.toFixed(0)} m³</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left px-3 py-2 text-gray-400 font-semibold w-[140px]">Field</th>
                      {([
                        { key: 'en378' as const, label: 'EN 378-3:2016', flag: '🇪🇺' },
                        { key: 'ashrae15' as const, label: 'ASHRAE 15-2022', flag: '🇺🇸' },
                        { key: 'iso5149' as const, label: 'ISO 5149-3:2014', flag: '🌍' },
                      ]).map(reg => (
                        <th key={reg.key} className="text-center px-3 py-2 font-semibold text-[#16354B]">
                          {reg.flag} {reg.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Detection Decision */}
                    <tr className="border-b">
                      <td className="px-3 py-2 font-semibold text-gray-600">Detection</td>
                      {(['en378', 'ashrae15', 'iso5149'] as const).map(k => {
                        const r = liveResults[k];
                        const bg = r.detectionRequired === 'YES' ? 'bg-red-100 text-red-700'
                          : r.detectionRequired === 'RECOMMENDED' ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700';
                        return <td key={k} className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bg}`}>{r.detectionRequired}</span>
                        </td>;
                      })}
                    </tr>
                    {/* Governing Rule */}
                    <tr className="border-b bg-gray-50/50">
                      <td className="px-3 py-1.5 text-gray-500">Rule</td>
                      {(['en378', 'ashrae15', 'iso5149'] as const).map(k => (
                        <td key={k} className="px-3 py-1.5 text-center font-mono text-[10px] text-gray-500">{liveResults[k].governingRuleId}</td>
                      ))}
                    </tr>
                    {/* Detectors */}
                    <tr className="border-b">
                      <td className="px-3 py-1.5 text-gray-500">Min / Rec detectors</td>
                      {(['en378', 'ashrae15', 'iso5149'] as const).map(k => (
                        <td key={k} className="px-3 py-1.5 text-center font-bold">
                          {liveResults[k].minDetectors} / {liveResults[k].recommendedDetectors}
                        </td>
                      ))}
                    </tr>
                    {/* Threshold */}
                    <tr className="border-b bg-gray-50/50">
                      <td className="px-3 py-1.5 text-gray-500">Threshold</td>
                      {(['en378', 'ashrae15', 'iso5149'] as const).map(k => (
                        <td key={k} className="px-3 py-1.5 text-center">
                          <span className="font-bold">{Math.round(liveResults[k].thresholdPpm).toLocaleString()} ppm</span>
                          <span className="text-[9px] text-gray-400 ml-1">({liveResults[k].thresholdBasis})</span>
                        </td>
                      ))}
                    </tr>
                    {/* Placement */}
                    <tr className="border-b">
                      <td className="px-3 py-1.5 text-gray-500">Placement</td>
                      {(['en378', 'ashrae15', 'iso5149'] as const).map(k => (
                        <td key={k} className="px-3 py-1.5 text-center">{liveResults[k].placementHeight} ({liveResults[k].placementHeightM})</td>
                      ))}
                    </tr>
                    {/* Ventilation */}
                    <tr className="border-b bg-gray-50/50">
                      <td className="px-3 py-1.5 text-gray-500">Ventilation</td>
                      {(['en378', 'ashrae15', 'iso5149'] as const).map(k => (
                        <td key={k} className="px-3 py-1.5 text-center">
                          {liveResults[k].ventilation
                            ? <span className="font-bold">{liveResults[k].ventilation!.flowRateM3s.toFixed(3)} m³/s</span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                      ))}
                    </tr>
                    {/* Alarms */}
                    <tr className="border-b">
                      <td className="px-3 py-1.5 text-gray-500">Alarm 1 / 2 / Cutoff</td>
                      {(['en378', 'ashrae15', 'iso5149'] as const).map(k => {
                        const a = liveResults[k].alarmThresholds;
                        return <td key={k} className="px-3 py-1.5 text-center text-[10px]">
                          {Math.round(a.alarm1.ppm).toLocaleString()} / {Math.round(a.alarm2.ppm).toLocaleString()} / {Math.round(a.cutoff.ppm).toLocaleString()}
                        </td>;
                      })}
                    </tr>
                    {/* Quantity Mode */}
                    <tr className="bg-gray-50/50">
                      <td className="px-3 py-1.5 text-gray-500">Mode</td>
                      {(['en378', 'ashrae15', 'iso5149'] as const).map(k => (
                        <td key={k} className="px-3 py-1.5 text-center text-[10px]">{liveResults[k].quantityMode}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400 text-sm">
              Select a refrigerant and set charge &gt; 0 to see results
            </div>
          )}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: successful build

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/simulator/page.tsx
git commit -m "feat(admin): simulator 3-regulation comparison table"
```

---

### Task 5: Charge vs limits, decision paths, and threshold trace

**Files:**
- Modify: `src/app/admin/simulator/page.tsx`

- [ ] **Step 1: Replace the Task 5 TODO with trace sections**

Replace `{/* TODO Task 5: Charge vs limits + paths + trace */}` with:

```tsx
          {/* Charge vs Limits + Decision Paths */}
          {liveResults && selectedRef && (() => {
            const conc = concentrationKgM3(inputs.charge, volume);
            const pl = selectedRef.practicalLimit;
            const plCharge = pl * volume;
            const c3 = getC3Entry(selectedRef.id);
            const flam = isFlammable(selectedRef.flammabilityClass);
            const mFactors = (flam && selectedRef.lfl != null) ? calcM1M2M3(selectedRef.lfl, volume) : null;
            const badge = (ok: boolean) => ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
            const okText = (ok: boolean) => ok ? '≤ OK' : '> EXCEEDED';

            return <>
              {/* Charge vs Limits */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-[10px] font-bold text-[#E63946] uppercase tracking-widest mb-2">Charge vs Limits</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-3">
                  <p>Charge: <span className="font-bold text-[#16354B]">{inputs.charge} kg</span></p>
                  <p>Volume: <span className="font-bold">{volume.toFixed(1)} m³</span></p>
                  <p>Concentration: <span className="font-bold">{conc.toPrecision(4)} kg/m³</span></p>
                  <p>PL (RCL): <span className="font-bold">{pl} kg/m³</span> = <span className={`font-bold ${inputs.charge > plCharge ? 'text-red-600' : 'text-green-600'}`}>{plCharge.toFixed(1)} kg</span></p>
                </div>

                {c3 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">EN 378 Table C.3</p>
                    <table className="w-full text-[10px]">
                      <thead><tr className="text-gray-400">
                        <th className="text-left pb-1">Limit</th><th className="text-right pb-1">kg/m³</th>
                        <th className="text-right pb-1">Max (kg)</th><th className="text-center pb-1">Status</th>
                      </tr></thead>
                      <tbody>
                        {([
                          ['RCL', c3.rcl, conc <= c3.rcl],
                          ['QLMV', c3.qlmv, conc <= c3.qlmv],
                          ['QLAV', c3.qlav, conc <= c3.qlav],
                        ] as [string, number, boolean][]).map(([name, val, ok]) => (
                          <tr key={name}>
                            <td className="font-semibold">{name}</td>
                            <td className="text-right font-mono">{val}</td>
                            <td className="text-right font-mono">{(val * volume).toFixed(1)}</td>
                            <td className="text-center"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${badge(ok)}`}>{okText(ok)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {mFactors && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Flammable Charge Caps</p>
                    <div className="flex gap-4 text-[10px]">
                      {([['m1', mFactors.m1], ['m2', mFactors.m2], ['m3', mFactors.m3]] as [string, number][]).map(([name, val]) => (
                        <p key={name}>{name} = <span className={`font-bold ${inputs.charge > val ? 'text-red-600' : 'text-green-600'}`}>{val.toFixed(1)} kg</span> {inputs.charge > val ? '(exceeded)' : '(OK)'}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Decision Paths — all 3 regulations */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-[10px] font-bold text-[#E63946] uppercase tracking-widest mb-2">Decision Paths</p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { key: 'en378' as const, label: 'EN 378' },
                    { key: 'ashrae15' as const, label: 'ASHRAE 15' },
                    { key: 'iso5149' as const, label: 'ISO 5149' },
                  ]).map(reg => (
                    <div key={reg.key}>
                      <p className="text-[10px] font-bold text-[#16354B] mb-1">{reg.label}</p>
                      <div className="space-y-0.5">
                        {liveResults[reg.key].trace?.pathEvaluations.map((pe, i) => {
                          const decColor = pe.decision === 'YES' ? 'bg-red-100 text-red-700'
                            : pe.decision === 'SKIP' ? 'bg-gray-100 text-gray-400'
                            : pe.decision === 'NO' ? 'bg-green-100 text-green-700'
                            : pe.decision === 'RECOMMENDED' ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700';
                          return (
                            <div key={i} className={`flex items-start gap-1 text-[9px] ${pe.decision === 'SKIP' ? 'opacity-50' : ''}`}>
                              <span className={`px-1 py-0.5 rounded font-bold flex-shrink-0 ${decColor}`}>{pe.decision}</span>
                              <span className="text-gray-500 truncate" title={pe.basis}>{pe.path.replace(/_/g, ' ')}: {pe.basis || '—'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threshold Calc */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-[10px] font-bold text-[#E63946] uppercase tracking-widest mb-2">Threshold & Placement</p>
                <div className="grid grid-cols-3 gap-4 text-[10px]">
                  <div>
                    <p className="text-gray-400 font-semibold mb-1">Threshold Calc</p>
                    {liveResults.en378.trace?.thresholdCalc && (() => {
                      const tc = liveResults.en378.trace!.thresholdCalc;
                      return <>
                        {tc.halfAtelPpm != null && <p>50% ATEL = <span className="font-bold">{Math.round(tc.halfAtelPpm).toLocaleString()} ppm</span></p>}
                        {tc.lfl25PctPpm != null && <p>25% LFL = <span className="font-bold">{Math.round(tc.lfl25PctPpm).toLocaleString()} ppm</span></p>}
                        <p className="mt-1">Chosen: <span className="font-bold text-[#16354B]">{tc.chosen} = {tc.finalPpm.toLocaleString()} ppm</span></p>
                      </>;
                    })()}
                  </div>
                  <div>
                    <p className="text-gray-400 font-semibold mb-1">Placement</p>
                    <p>VD = {selectedRef.vapourDensity} ({selectedRef.vapourDensity >= 1.0 ? 'heavier' : 'lighter'})</p>
                    <p>→ <span className="font-bold">{liveResults.en378.placementHeight} ({liveResults.en378.placementHeightM})</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-semibold mb-1">Quantity</p>
                    <p>Area-based: {liveResults.en378.trace?.quantityCalc.areaBased ?? '—'} det</p>
                    <p>Clusters: {liveResults.en378.trace?.quantityCalc.clusters ?? 0}</p>
                    <p>Mode: <span className="font-bold">{liveResults.en378.quantityMode}</span></p>
                  </div>
                </div>
              </div>
            </>;
          })()}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: successful build

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/simulator/page.tsx
git commit -m "feat(admin): simulator charge vs limits, decision paths, threshold trace"
```

---

### Task 6: History table + CSV/PDF export

**Files:**
- Modify: `src/app/admin/simulator/page.tsx`

- [ ] **Step 1: Replace the Task 6 TODO with the history section**

Replace `{/* TODO Task 6: History table + export */}` with:

```tsx
          {/* History */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#1a2332] text-white px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest">Simulation History ({history.length})</span>
              <div className="flex gap-2">
                <button onClick={() => {
                  if (history.length === 0) return;
                  const header = 'ID,Time,Refrigerant,Charge(kg),Volume(m3),SpaceType,EN378,ASHRAE15,ISO5149,Detectors(EN378)\n';
                  const rows = history.map(h =>
                    `${h.id},${h.timestamp},${h.refrigerant.id},${h.inputs.charge},${(h.inputs.volumeOverride ? parseFloat(h.inputs.volumeOverride) : h.inputs.surface * h.inputs.height).toFixed(1)},${h.inputs.spaceTypeId || '-'},${h.en378.detectionRequired},${h.ashrae15.detectionRequired},${h.iso5149.detectionRequired},${h.en378.recommendedDetectors}`
                  ).join('\n');
                  const blob = new Blob([header + rows], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `simulator-${new Date().toISOString().slice(0,10)}.csv`;
                  a.click(); URL.revokeObjectURL(url);
                }} disabled={history.length === 0}
                  className="px-2.5 py-1 text-[10px] rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors">
                  Export CSV
                </button>
                <button onClick={() => setHistory([])} disabled={history.length === 0}
                  className="px-2.5 py-1 text-[10px] rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors">
                  Clear
                </button>
              </div>
            </div>
            {history.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">
                Click &ldquo;Save to History&rdquo; to record simulations
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                <table className="w-full text-[10px]">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="border-b text-gray-400 font-semibold">
                      <th className="px-2 py-1.5 text-left">#</th>
                      <th className="px-2 py-1.5 text-left">Time</th>
                      <th className="px-2 py-1.5 text-left">Refrigerant</th>
                      <th className="px-2 py-1.5 text-right">Charge</th>
                      <th className="px-2 py-1.5 text-right">Vol</th>
                      <th className="px-2 py-1.5 text-center">EN 378</th>
                      <th className="px-2 py-1.5 text-center">ASHRAE</th>
                      <th className="px-2 py-1.5 text-center">ISO 5149</th>
                      <th className="px-2 py-1.5 text-right">Det.</th>
                      <th className="px-2 py-1.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => {
                      const vol = h.inputs.volumeOverride ? parseFloat(h.inputs.volumeOverride) : h.inputs.surface * h.inputs.height;
                      const decBg = (d: string) => d === 'YES' ? 'bg-red-100 text-red-700' : d === 'RECOMMENDED' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
                      return (
                        <tr key={h.id} className="border-b hover:bg-blue-50/30">
                          <td className="px-2 py-1.5 text-gray-400">{h.id}</td>
                          <td className="px-2 py-1.5 text-gray-500">{h.timestamp}</td>
                          <td className="px-2 py-1.5 font-mono font-bold">{h.refrigerant.id}</td>
                          <td className="px-2 py-1.5 text-right">{h.inputs.charge} kg</td>
                          <td className="px-2 py-1.5 text-right">{vol.toFixed(0)} m³</td>
                          <td className="px-2 py-1.5 text-center"><span className={`px-1 py-0.5 rounded font-bold ${decBg(h.en378.detectionRequired)}`}>{h.en378.detectionRequired}</span></td>
                          <td className="px-2 py-1.5 text-center"><span className={`px-1 py-0.5 rounded font-bold ${decBg(h.ashrae15.detectionRequired)}`}>{h.ashrae15.detectionRequired}</span></td>
                          <td className="px-2 py-1.5 text-center"><span className={`px-1 py-0.5 rounded font-bold ${decBg(h.iso5149.detectionRequired)}`}>{h.iso5149.detectionRequired}</span></td>
                          <td className="px-2 py-1.5 text-right font-bold">{h.en378.recommendedDetectors}</td>
                          <td className="px-2 py-1.5">
                            <button onClick={() => { setInputs(h.inputs); setRefSearch(''); }}
                              className="text-blue-600 hover:text-blue-800 font-semibold">Reload</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -5`
Expected: successful build

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/simulator/page.tsx
git commit -m "feat(admin): simulator history table with CSV export and reload"
```

---

### Task 7: Final integration test + push

**Files:** None (testing only)

- [ ] **Step 1: Build and run tests**

Run: `cd "C:/1- Marwan/Claude/18- DetectCalc" && npx next build 2>&1 | tail -5 && npx vitest run 2>&1 | tail -5`
Expected: build OK, 37 tests pass

- [ ] **Step 2: Manual verification**

Start dev server and verify in browser:
1. Navigate to `/admin/simulator`
2. Click "R-744 Supermarket" preset → verify live results appear
3. Click "R-717 Machinery" preset → verify YES decision, ventilation shows
4. Change charge to 1 kg → verify safety net SKIP, result changes to RECOMMENDED
5. Click "Save to History" multiple times → verify table populates
6. Click "Export CSV" → verify CSV downloads
7. Click "Reload" on a history row → verify inputs restore

- [ ] **Step 3: Final commit and push**

```bash
git push origin master
```
