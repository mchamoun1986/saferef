'use client';

import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────

type Tab = 'filters' | 'selection' | 'pricing';

// ── Formula Card Component ─────────────────────────────────────────────

function FormulaCard({
  number,
  title,
  description,
  inputs,
  output,
  code,
  note,
}: {
  number: string;
  title: string;
  description: string;
  inputs: string[];
  output: string;
  code: string;
  note?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Left side */}
        <div className="flex-1 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              {number}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">{description}</p>
              {note && (
                <p className="text-amber-700 bg-amber-50 text-xs mt-2 px-3 py-1.5 rounded-lg border border-amber-200">
                  {note}
                </p>
              )}
              <div className="mt-4 space-y-2">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inputs</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {inputs.map((inp, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                        {inp}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Output</span>
                  <div className="mt-1">
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                      {output}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right side — code block */}
        <div className="lg:w-[420px] bg-[#0a1628] p-5 flex items-center">
          <pre className="text-emerald-400 font-mono text-sm leading-relaxed whitespace-pre-wrap w-full">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ── Rule Path Card Component ───────────────────────────────────────────

function RulePathCard({
  pathId,
  title,
  description,
  conditions,
  result,
  ruleIds,
  clauses,
  color = 'amber',
}: {
  pathId: string;
  title: string;
  description: string;
  conditions: string[];
  result: string;
  ruleIds: string[];
  clauses: string[];
  color?: 'amber' | 'blue' | 'emerald' | 'red' | 'purple';
}) {
  const colors = {
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full ${colors[color]} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
          {pathId}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
          <div className="mt-3 space-y-2">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conditions</span>
              <ul className="mt-1 space-y-1">
                {conditions.map((c, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">&bull;</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Result:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                result === 'YES' ? 'bg-red-100 text-red-700' :
                result === 'NO' ? 'bg-green-100 text-green-700' :
                result === 'MANUAL_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {result}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ruleIds.map((r, i) => (
                <span key={i} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {r}
                </span>
              ))}
              {clauses.map((c, i) => (
                <span key={i} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Flowchart Node Components ──────────────────────────────────────────

function FlowNode({
  label,
  type,
  sub,
}: {
  label: string;
  type: 'start' | 'decision' | 'process' | 'output' | 'end';
  sub?: string;
}) {
  const styles = {
    start: 'bg-emerald-500 text-white border-emerald-600 rounded-full',
    decision: 'bg-amber-100 text-amber-900 border-amber-400 rounded-lg',
    process: 'bg-blue-100 text-blue-900 border-blue-400 rounded-lg',
    output: 'bg-red-100 text-red-900 border-red-400 rounded-lg',
    end: 'bg-gray-700 text-white border-gray-800 rounded-full',
  };

  return (
    <div className={`px-5 py-3 border-2 text-center text-sm font-medium ${styles[type]} shadow-sm`}>
      {label}
      {sub && <div className="text-[11px] font-normal mt-0.5 opacity-80">{sub}</div>}
    </div>
  );
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-0.5 h-6 bg-gray-400"></div>
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-400"></div>
      {label && (
        <span className="text-[10px] text-gray-500 font-medium -mt-1">{label}</span>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function EngineM2DocPage() {
  const [activeTab, setActiveTab] = useState<Tab>('filters');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'filters', label: 'Filters & Scoring' },
    { id: 'selection', label: 'Selection Rules' },
    { id: 'pricing', label: 'Pricing Pipeline' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#1a2332] text-white px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">
            M2 Selection + M3 Pricing Engine{' '}
            <span className="text-gray-400 font-normal">/ Product & Quote Engine</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Technical reference for the product selection pipeline (M2), 3-tier recommendation system,
            and pricing engine (M3).
            <br />
            Covers filter chain F0-F9, scoring /21, BOM assembly, discount resolution, and quote generation.
          </p>

          {/* Tabs */}
          <div className="flex gap-0 mt-6 border-b border-gray-600">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: FILTERS & SCORING
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'filters' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filter Pipeline & Scoring</h2>
              <p className="text-gray-500 text-sm mt-1">
                Sequential filter chain that narrows the product catalog, followed by a /21 scoring system.
                Source: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">m2-engine/selection-engine.ts</code>
              </p>
            </div>

            <FormulaCard
              number="F0"
              title="Application Filter"
              description="Filters the product catalog by zone type to keep only product families relevant to the application. Uses the APP_DEFAULTS map to resolve zoneType to allowed product families (e.g. supermarket -> MIDI, MP). If appProductFamilies override is provided, it takes precedence."
              inputs={['products[]', 'zoneType', 'appProductFamilies?']}
              output="filtered products[]"
              code={`// F0: Application filter
const APP_DEFAULTS = {
  supermarket:     ['MIDI', 'MP'],
  cold_room:       ['MIDI', 'MP'],
  machinery_room:  ['X5', 'GXR', 'GEX'],
  cold_storage:    ['X5', 'MIDI', 'TR'],
  hotel:           ['RM'],
  office:          ['RM'],
  parking:         ['X5'],
  ice_rink:        ['X5', 'TR'],
  heat_pump:       ['MIDI', 'G'],
  pressure_relief: ['GR', 'TR'],
  duct:            ['GK', 'TR'],
  atex_zone:       ['X5', 'GXR', 'GEX'],
  water_brine:     ['AQUIS'],
};

// Match by family or subFamily
pool = products.filter(p =>
  allowed.includes(getFamily(p))
  || allowed.includes(getSubFamily(p))
);`}
            />

            <FormulaCard
              number="F2"
              title="ATEX Filter"
              description="If ATEX certification is required for the zone, keep only products that have atex=true. If ATEX is not required, all products pass through unchanged."
              inputs={['products[]', 'atex (boolean)']}
              output="filtered products[]"
              code={`// F2: ATEX filter
function f2_atex(
  products: ProductEntry[],
  atex: boolean
): ProductEntry[] {
  if (!atex) return products;
  return products.filter(p => p.atex);
}`}
            />

            <FormulaCard
              number="F3"
              title="Refrigerant Filter"
              description="Keep only products whose refs array includes the selected refrigerant. Each product declares which refrigerant IDs it can detect (e.g. R744, R32, R717)."
              inputs={['products[]', 'refrigerant']}
              output="filtered products[]"
              code={`// F3: Refrigerant compatibility
function f3_refrigerant(
  products: ProductEntry[],
  refrigerant: string
): ProductEntry[] {
  return products.filter(
    p => p.refs.includes(refrigerant)
  );
}

// REF_TO_GAS maps refrigerant -> gas group
// R744 -> CO2, R32 -> HFC1, R717 -> NH3
// R290/R600a/R1270 -> R290 (HC group)`}
            />

            <FormulaCard
              number="F3b"
              title="Range Filter"
              description="Multi-range support for refrigerants with multiple measurement ranges. R717 has 4 ranges (0-100, 0-500, 0-1000, 0-5000 ppm). R744 has 4 ranges (0-5000, 0-10000, 0-30000 ppm, 0-5% vol). Fallback: if 0 results after filtering, the range filter is skipped entirely."
              inputs={['products[]', 'range', 'refrigerant']}
              output="filtered products[]"
              code={`// F3b: Range filter with fallback
const REF_RANGES = {
  R717: ['0-100ppm', '0-500ppm',
         '0-1000ppm', '0-5000ppm'],
  R744: ['0-5000ppm', '0-10000ppm',
         '0-30000ppm', '0-5%vol'],
  CO:   ['0-100ppm', '0-300ppm'],
  NO2:  ['0-5ppm', '0-20ppm'],
};

const kept = products.filter(
  p => normalize(p.range) === normalize(range)
);
// Fallback: if 0 matches, skip filter
return kept.length > 0 ? kept : products;`}
              note="APP_DEFAULT_RANGE auto-selects range per zoneType (e.g. machinery_room + R717 = 0-1000ppm, cold_storage + R717 = 0-100ppm)."
            />

            <FormulaCard
              number="F4"
              title="Output Filter"
              description="Filter by required signal output type. Supports 8 output types: relay, 4-20mA, 0-10V, 2-10V, modbus, relay_analog_modbus, relay_dual_analog, and any (no filter)."
              inputs={['products[]', 'outputRequired']}
              output="filtered products[]"
              code={`// F4: Output type filter
switch (req) {
  case 'relay':
    return hasRelay && standalone;
  case '420mA':
    return hasAnalog && analog !== 'to MPU'
           || family === 'TR';
  case '010V':
    return analog === 'selectable'
           || analog === '4-20mA/0-10V';
  case '210V':
    return analog === 'selectable';
  case 'modbus':
    return product.modbus;
  case 'relay_analog_modbus':
    return hasRelay && hasAnalog && modbus;
  case 'relay_dual_analog':
    return analog === '4-20mA x2';
  case 'any': return true;
}`}
            />

            <FormulaCard
              number="F9"
              title="Power / Voltage Filter"
              description="Filter products by site voltage (12V, 24V, 230V). For 230V sites, MIDI, MP, and AQUIS families always pass (they accept power adapters). For 12V, a MIN_VOLTAGE lookup per family determines compatibility."
              inputs={['products[]', 'voltage']}
              output="filtered products[]"
              code={`// F9: Power / Voltage filter
if (voltage === '24V') {
  // Exclude 230V-only products
  return products.filter(p =>
    p.voltage !== '230V');
}
if (voltage === '230V') {
  // MIDI/MP/AQUIS always OK (adapter)
  // Others need voltage.includes('230')
  return products.filter(p =>
    isMidiFamily(p) || isMpFamily(p)
    || isAquisFamily(p)
    || p.voltage?.includes('230'));
}
if (voltage === '12V') {
  const MIN_V = { MIDI: 15, X5: 18,
    RM: 12, G: 12, TR: 12,
    MP: 24, AQUIS: 230 };
  return products.filter(p =>
    MIN_V[family] <= 12);
}`}
              note="MIDI detectors on 230V sites get a Power Adapter (code 4000-0002, 99 EUR) added to the BOM automatically."
            />

            <FormulaCard
              number="S"
              title="Scoring /21"
              description="Each surviving product is scored out of 21 points across 6 components. The score determines tier ranking and the final recommendation."
              inputs={['product', 'zoneType', 'outputRequired', 'zoneAtex']}
              output="ScoreBreakdown { total: 0-21 }"
              code={`// Scoring formula (max 21 points)
tierPriority:     0-5  // premium=5,std=3,eco=1
applicationFit:   0-3  // family in APP_DEFAULTS?
outputMatch:      0-3  // exact output match
simplicity:       0-2  // standalone=2, else 1
maintenanceCost:  0-2  // IR/IONIC=2,SC/pH=1,EC=0
featureRichness:  0-6  // modbus, analog, atex,
                       // MIDI/X5 bonus, remote

total = sum(all components)

// Tier assignment:
// MIDI IR/EC = premium
// X5 IR/IONIC = premium
// GXR = standard, G IR = standard
// RM, TR, MP = economic`}
            />

            {/* Constants reference */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Constants Reference</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Power Adapter Price</div>
                  <div className="text-2xl font-mono font-bold text-gray-900 mt-1">99 <span className="text-sm text-gray-500">EUR</span></div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">code: 4000-0002</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier Score Map</div>
                  <div className="mt-1 space-y-0.5">
                    <div className="text-sm font-mono"><span className="text-red-600 font-bold">premium</span> = 5</div>
                    <div className="text-sm font-mono"><span className="text-blue-600 font-bold">standard</span> = 3</div>
                    <div className="text-sm font-mono"><span className="text-gray-600 font-bold">economic</span> = 1</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Controller Power Budget</div>
                  <div className="text-2xl font-mono font-bold text-gray-900 mt-1">10 <span className="text-sm text-gray-500">W max</span></div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">cap = min(channels, floor(maxPower / detPower))</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: SELECTION RULES
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'selection' && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">3-Tier Selection Rules</h2>
              <p className="text-gray-500 text-sm mt-1">
                After filtering and scoring, the engine picks 3 tiers: Premium, Standard, and Centralized.
                Source: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">m2-engine/selection-engine.ts</code>
              </p>
            </div>

            <div className="grid gap-4">
              <RulePathCard
                pathId="P"
                title="PREMIUM Tier"
                description="Best standalone product by score. Picks the highest-scoring product that can operate without a controller (standalone=true). This is the reference tier for cost comparison."
                conditions={[
                  'standalone === true',
                  'Sorted by score descending',
                  'Pick first (best score)',
                ]}
                result="Best score standalone"
                ruleIds={['TIER-PREM-001']}
                clauses={['Best technology recommendation']}
                color="red"
              />

              <RulePathCard
                pathId="S"
                title="STANDARD Tier"
                description="Cheapest total cost product that is STRICTLY cheaper than the Premium tier. Includes controller cost if non-standalone. Different product from Premium (no duplicate)."
                conditions={[
                  'All products (standalone or not)',
                  'Sorted by estimateTotalCost ascending',
                  'Must be strictly cheaper than Premium totalCost',
                  'Must not be the same product as Premium',
                ]}
                result="Cheapest alternative"
                ruleIds={['TIER-STD-001']}
                clauses={['Best price/performance ratio']}
                color="blue"
              />

              <RulePathCard
                pathId="C"
                title="CENTRALIZED Tier"
                description="Non-standalone product with MPU/SPU controller, only considered when totalDetectors > 1. Provides a centralized monitoring option with shared controller infrastructure."
                conditions={[
                  'standalone === false',
                  'totalDetectors > 1',
                  'Sorted by estimateTotalCost ascending',
                  'Must not duplicate Premium or Standard pick',
                ]}
                result="Cheapest centralized"
                ruleIds={['TIER-CTRL-001']}
                clauses={['Centralized monitoring option']}
                color="emerald"
              />

              <RulePathCard
                pathId="F7"
                title="Controller Combo (F7)"
                description="Brute-force search for the cheapest MPU/SPU combination that covers all detectors. Respects connectTo compatibility (MPU vs SPU vs SPLS), voltage matching, and 10W power budget per controller. Hardcoded fallback defaults (SPU24/230, MPU2C/4C/6C) if the DB has no controllers."
                conditions={[
                  'connectTo compatibility check (MPU/SPU/SPLS)',
                  'Voltage match (230V controllers for 230V sites, 24V otherwise)',
                  '10W power budget: cap = min(channels, floor(maxPower / detPower))',
                  'Brute-force all MPU qty combinations + SPU remainder',
                  'SPU-only fallback also tested',
                ]}
                result="Cheapest combo"
                ruleIds={['F7-COMBO-001', 'F7-FALLBACK-001']}
                clauses={['SPU24: 20-350 (424 EUR)', 'SPU230: 20-355 (455 EUR)', 'MPU2C: 20-310 (1168 EUR)', 'MPU4C: 20-300 (1598 EUR)', 'MPU6C: 20-305 (2004 EUR)']}
                color="amber"
              />

              <RulePathCard
                pathId="B"
                title="BOM Builder"
                description="Per-tier BOM assembly. For each tier, the BOM includes: detector x qty, controller (if non-standalone), power adapters (F10), alert accessories EN 378 (F11), mounting accessories (F13), service tools (F14), and spare sensors (F15)."
                conditions={[
                  'F10 Power: 230V MIDI -> Power Adapter 99 EUR per detector',
                  'F11 Alert: FL-RL-R combined light+siren (150 EUR), 1 per controller or standalone',
                  'F13 Mounting: back-box per detector (family-compatible)',
                  'F14 Service: DT300 + calibration adapter, 1 per project',
                  'F15 Spares: calibration gas matched by gas group (HFC/NH3/HC)',
                ]}
                result="Complete BOM"
                ruleIds={['BOM-F10', 'BOM-F11', 'BOM-F13', 'BOM-F14', 'BOM-F15']}
                clauses={['EN 378 alert requirement', 'SAMON recommended accessories']}
                color="purple"
              />

              <RulePathCard
                pathId="FB"
                title="Fallback Strategy"
                description="Safety net when primary tier picks fail. If Premium is empty (no standalone products), pick the best remaining product by score. If Standard is empty, pick the cheapest remaining product that is still cheaper than Premium."
                conditions={[
                  'Premium empty -> best remaining by score (any standalone status)',
                  'Standard empty -> cheapest remaining (must be < Premium cost)',
                  'Centralized empty -> skip (only applicable when totalDetectors > 1)',
                ]}
                result="Fallback pick"
                ruleIds={['FALLBACK-PREM-001', 'FALLBACK-STD-001']}
                clauses={['Guarantees at least 1 tier is populated']}
                color="amber"
              />
            </div>

            {/* Comparison Table */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">3-Tier Comparison</h2>
              <p className="text-gray-500 text-sm mb-4">How the recommendation engine compares the 3 tiers and selects the winner.</p>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#0a1628] text-white">
                        <th className="text-left px-5 py-3 font-semibold w-[200px]">Aspect</th>
                        <th className="text-left px-5 py-3 font-semibold">PREMIUM</th>
                        <th className="text-left px-5 py-3 font-semibold">STANDARD</th>
                        <th className="text-left px-5 py-3 font-semibold">CENTRALIZED</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-5 py-3 font-medium text-gray-700">Selection Criteria</td>
                        <td className="px-5 py-3 text-gray-600">Best standalone by score</td>
                        <td className="px-5 py-3 text-gray-600">Cheapest total cost</td>
                        <td className="px-5 py-3 text-gray-600">Cheapest non-standalone + MPU</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-700">Standalone</td>
                        <td className="px-5 py-3 text-gray-600">Yes (required)</td>
                        <td className="px-5 py-3 text-gray-600">Any</td>
                        <td className="px-5 py-3 text-gray-600">No (required)</td>
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-medium text-gray-700">Controller</td>
                        <td className="px-5 py-3 text-gray-600">None</td>
                        <td className="px-5 py-3 text-gray-600">If needed</td>
                        <td className="px-5 py-3 text-gray-600">Always (MPU/SPU)</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-700">Cost Constraint</td>
                        <td className="px-5 py-3 text-gray-600">Reference price</td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">cost &lt; premiumCost</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">No constraint</td>
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-medium text-gray-700">Label</td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold">Best technology</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">Balanced</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">With controller</span>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-700">Recommendation</td>
                        <td className="px-5 py-3 text-gray-600 text-xs" colSpan={3}>
                          Sort tiers by <span className="font-mono">score DESC</span> then <span className="font-mono">totalBom ASC</span>.
                          Winner: score &ge; 15 = &quot;Best technology&quot;, else &quot;Best balance of score and price&quot;.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Comparison Table Rows */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Table Rows</h3>
              <p className="text-gray-600 text-sm mb-4">
                The <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">buildComparisonTable()</code> function generates these rows for the UI:
              </p>
              <div className="bg-[#0a1628] rounded-lg p-4">
                <pre className="text-emerald-400 font-mono text-xs leading-relaxed">{`ComparisonTable.rows = [
  { label: 'Detector',    premium, standard, centralized },
  { label: 'Qty',         ...detector.qty per tier },
  { label: 'Sensor Tech', ...detector.sensorTech },
  { label: 'Sensor Life', ...detector.sensorLife },
  { label: 'Controller',  ...controller.name or 'None (standalone)' },
  { label: 'Score',       ...solutionScore + '/21' },
  { label: 'Total BOM',   ...totalBom + ' EUR' },
]

// Recommendation logic:
tiers.sort((a, b) => b.score - a.score || a.totalBom - b.totalBom)
rec = tiers[0].key
reason = score >= 15
  ? "Highest score with best technology"
  : "Best balance of score and price"`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: PRICING PIPELINE
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'pricing' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">M3 Pricing Pipeline</h2>
              <p className="text-gray-500 text-sm">
                Takes M2 tier BOMs + discount data, applies price lookup, discount resolution,
                and line calculation to produce a priced quote. EUR-only, HT-only.
              </p>
            </div>

            {/* Main Flowchart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col items-center max-w-2xl mx-auto">

                <FlowNode type="start" label="START" sub="Input: M2 tiers, customerGroup, discountCode, priceDb" />
                <FlowArrow />

                <FlowNode type="process" label="P1: BOM Price Lookup" sub="Cross-check M2 price vs DB price per BOM line" />
                <FlowArrow />

                <FlowNode type="decision" label="Price Match?" />
                <div className="flex w-full items-start justify-center">
                  <div className="flex flex-col items-center w-1/2">
                    <div className="flex items-center">
                      <div className="w-12 h-0.5 bg-gray-400"></div>
                      <span className="text-[10px] text-red-500 font-bold px-1">MISMATCH</span>
                    </div>
                    <div className="w-0.5 h-3 bg-gray-400"></div>
                    <div className="bg-amber-100 border-2 border-amber-300 rounded-lg px-3 py-2 text-xs text-amber-900 text-center">
                      <div className="font-semibold">Emit Warning</div>
                      <div className="mt-0.5 text-[10px]">PRICE_MISMATCH / NOT_FOUND / DISCONTINUED</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-1/2">
                    <div className="flex items-center">
                      <span className="text-[10px] text-emerald-600 font-bold px-1">MATCH</span>
                      <div className="w-12 h-0.5 bg-gray-400"></div>
                    </div>
                    <div className="w-0.5 h-3 bg-gray-400"></div>
                    <div className="text-[10px] text-gray-500 font-medium">continue</div>
                  </div>
                </div>

                <FlowArrow />

                <FlowNode type="process" label="P2: Discount Resolution" sub="Group F=0% | customer override | standard matrix" />
                <FlowArrow />

                <FlowNode type="process" label="P3: Line Item Calculation" sub="lineTotal = R(listPrice * qty), net = lineTotal - discount" />
                <FlowArrow />

                <FlowNode type="process" label="P5: Tier Totals" sub="totalBeforeDiscount, totalDiscount, totalHt per tier" />
                <FlowArrow />

                <FlowNode type="decision" label="Compare Tiers" sub="Sort by score DESC, totalHt ASC" />
                <FlowArrow />

                <FlowNode type="process" label="Recommendation" sub="score >= 15 = best tech, else best balance" />
                <FlowArrow />

                <FlowNode type="output" label="OUTPUT: PricingResult" />

                <div className="mt-3 bg-[#0a1628] rounded-lg p-4 w-full max-w-lg">
                  <pre className="text-emerald-400 font-mono text-[11px] leading-relaxed">{`PricingResult {
  quoteRef:       "SR-2026-xxxxxxxx"
  quoteDate:      "2026-04-16"
  quoteValidUntil:"2026-05-16" (30 days)
  priceListVersion: "2026-R2"
  tiers: {
    premium:      PricedTier | null
    standard:     PricedTier | null
    centralized:  PricedTier | null
  }
  comparison: {
    rows: [...], savingsVsPremium: { std, ctrl }
  }
  recommended: "premium" | "standard" | "centralized"
  warnings:    string[]  // PRICE_MISMATCH, etc.
}`}</pre>
                </div>

                <div className="mt-4">
                  <FlowNode type="end" label="END" />
                </div>
              </div>
            </div>

            {/* P1 */}
            <FormulaCard
              number="P1"
              title="BOM Price Lookup"
              description="Cross-reference each BOM line code against the price database. Emits PRICE_MISMATCH if M2 price differs from DB, PRICE_NOT_FOUND if code is missing, and DISCONTINUED if product is flagged. The DB price (listPrice) always wins for calculation."
              inputs={['code', 'priceDb Map']}
              output="{ listPrice, productGroup, discontinued, found }"
              code={`// P1: Price lookup with validation
function p1_priceLookup(code, priceDb) {
  const entry = priceDb.get(code);
  if (!entry)
    return { listPrice: 0,
             productGroup: '?',
             found: false };

  return {
    listPrice: entry.price,
    productGroup: entry.productGroup,
    discontinued: entry.discontinued,
    found: true
  };
}

// Warnings emitted per line:
// PRICE_NOT_FOUND: code not in DB
// PRICE_MISMATCH: M2 != DB price
// DISCONTINUED: product flagged`}
            />

            {/* P2 */}
            <FormulaCard
              number="P2"
              title="Discount Resolution"
              description="Three-level discount resolution. Group F products always get 0% discount. Customer overrides (discountCode + productGroup -> ratePct) take precedence over the standard matrix. Standard matrix lookup uses customerGroup + productGroup."
              inputs={['customerGroup', 'productGroup', 'discountMatrix[]', 'discountCode?', 'customerOverrides?']}
              output="discountPct (number)"
              code={`// P2: Discount resolution order
function p2_resolveDiscount(
  customerGroup, productGroup,
  matrix, discountCode?, overrides?
) {
  // 1. Group F -> always 0%
  if (productGroup === 'F') return 0;

  // 2. Customer override (highest priority)
  if (discountCode && overrides) {
    const hit = overrides.find(o =>
      o.discountCode === discountCode
      && o.productGroup === productGroup);
    if (hit) return hit.ratePct;
  }

  // 3. Standard matrix lookup
  const cell = matrix.find(m =>
    m.customerGroup === customerGroup
    && m.productGroup === productGroup);
  return cell ? cell.discountPct : 0;
}`}
              note="Customer groups: EDC, OEM, 1Fo, 2Fo, 3Fo, 1Contractor, 2Contractor, 3Contractor, AKund, BKund, NO."
            />

            {/* P3 */}
            <FormulaCard
              number="P3"
              title="Line Item Calculation"
              description="Calculate per-line totals. lineTotal = R(listPrice * qty). discountAmount = R(lineTotal * discountPct / 100). netTotal = R(lineTotal - discountAmount). R() rounds to 2 decimal places (EUR cents)."
              inputs={['code', 'name', 'category', 'qty', 'listPrice', 'discountPct']}
              output="PricedLine { lineTotal, discountAmount, netTotal }"
              code={`// P3: Line calculation
// R() = round to 2 decimals (EUR cents)
const R = (n) =>
  Math.round(n * 100) / 100;

function p3_calculateLine(
  code, name, category,
  qty, listPrice, discountPct
) {
  const lineTotal = R(listPrice * qty);
  const discountAmount =
    R(lineTotal * (discountPct / 100));
  const netTotal =
    R(lineTotal - discountAmount);

  return { code, name, category, qty,
    listPrice, discountPct,
    discountAmount, netTotal };
}`}
            />

            {/* P5 */}
            <FormulaCard
              number="P5"
              title="Tier Totals"
              description="Aggregate all priced lines into tier-level totals: totalBeforeDiscount, totalDiscount, totalHt (hors taxes). Savings vs Premium is calculated as percentage: ((premiumHt - tierHt) / premiumHt) * 100."
              inputs={['PricedLine[]']}
              output="{ totalBeforeDiscount, totalDiscount, totalHt }"
              code={`// P5: Tier totals aggregation
function p5_totals(lines) {
  const totalBeforeDiscount = R(
    lines.reduce((s, l) =>
      s + R(l.listPrice * l.qty), 0));
  const totalDiscount = R(
    lines.reduce((s, l) =>
      s + l.discountAmount, 0));
  const totalHt = R(
    totalBeforeDiscount - totalDiscount);
  return { totalBeforeDiscount,
           totalDiscount, totalHt };
}

// Savings vs Premium:
savingsStd = R(
  ((premiumHt - standardHt)
   / premiumHt) * 100);  // %`}
            />

            {/* Recommendation */}
            <FormulaCard
              number="R"
              title="Recommendation Logic"
              description="Sort all non-null tiers by score descending, then totalHt ascending. The winner becomes the recommended tier. If score >= 15, label as best technology; otherwise label as best balance."
              inputs={['PricedTier[] (premium, standard, centralized)']}
              output="recommended: premium | standard | centralized"
              code={`// Final recommendation
candidates = tiers.filter(t => t !== null);

candidates.sort((a, b) => {
  // Primary: highest score
  if (a.score !== b.score)
    return b.score - a.score;
  // Secondary: lowest price
  return a.totalHt - b.totalHt;
});

recommended = candidates[0].key;

// Label:
// score >= 15 -> "Best technology"
// score < 15  -> "Best balance"`}
            />

            {/* Comparison Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Quote Comparison Rows</h3>
                <p className="text-xs text-gray-500 mt-0.5">Generated by calculatePricing() for the quote PDF and UI.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0a1628] text-white">
                      <th className="text-left px-4 py-2 font-medium">Row</th>
                      <th className="text-left px-4 py-2 font-medium">Premium</th>
                      <th className="text-left px-4 py-2 font-medium">Standard</th>
                      <th className="text-left px-4 py-2 font-medium">Centralized</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-700">Detector</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">detector.name</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">detector.name</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">detector.name</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-700">Controller</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">Standalone</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">controller.name or Standalone</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">controller.name</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-700">Technical Score</td>
                      <td className="px-4 py-2 text-gray-500 text-xs font-mono">X/21</td>
                      <td className="px-4 py-2 text-gray-500 text-xs font-mono">X/21</td>
                      <td className="px-4 py-2 text-gray-500 text-xs font-mono">X/21</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-700">Total HT</td>
                      <td className="px-4 py-2 text-gray-500 text-xs font-mono">X.XX EUR</td>
                      <td className="px-4 py-2 text-gray-500 text-xs font-mono">X.XX EUR</td>
                      <td className="px-4 py-2 text-gray-500 text-xs font-mono">X.XX EUR</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-700">Savings vs Premium</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">-</td>
                      <td className="px-4 py-2 text-gray-500 text-xs font-mono">X.X%</td>
                      <td className="px-4 py-2 text-gray-500 text-xs font-mono">X.X%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Source File Reference */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Files</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { file: 'm2-engine/selection-engine.ts', desc: 'M2 full filter pipeline F0-F9, scoring /21, 3-tier selection, BOM builder' },
                  { file: 'm2-engine/pricing-engine.ts', desc: 'M3 pricing: P1 lookup, P2 discount, P3 line calc, P5 totals, recommendation' },
                  { file: 'm2-engine/parse-product.ts', desc: 'Convert raw API ProductRecord to engine ProductEntry (JSON parse, defaults)' },
                  { file: 'engine-types.ts', desc: 'Unified type definitions: ProductEntry, TierSolution, PricedLine, PricingResult, etc.' },
                ].map((f) => (
                  <div key={f.file} className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3">
                    <code className="text-xs bg-[#0a1628] text-emerald-400 px-2 py-0.5 rounded font-mono shrink-0">{f.file}</code>
                    <span className="text-xs text-gray-600">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
