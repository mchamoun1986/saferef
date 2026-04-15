'use client';

import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────

type Tab = 'formulas' | 'regulations' | 'pipeline';

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

export default function EngineDocPage() {
  const [activeTab, setActiveTab] = useState<Tab>('formulas');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'formulas', label: 'Formulas & Physics' },
    { id: 'regulations', label: 'Regulation Rules' },
    { id: 'pipeline', label: 'Decision Pipeline' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#1a2332] text-white px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">
            Moteur de Calcul{' '}
            <span className="text-gray-400 font-normal">/ Calculation Engine</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Technical reference for all formulas, regulation rules, and decision logic used by DetectCalc.
            <br />
            Covers EN 378-3:2016, ASHRAE 15-2022, and ISO 5149-3:2014.
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
            TAB 1: FORMULAS & PHYSICS
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'formulas' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Core Physics & Formulas</h2>
              <p className="text-gray-500 text-sm mt-1">
                Shared calculations used across all three regulation profiles. Source: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">engine/core.ts</code>
              </p>
            </div>

            <FormulaCard
              number="1"
              title="Concentration"
              description="Calculate refrigerant concentration in a room from total charge and room volume. The fundamental relationship between mass and space."
              inputs={['charge (kg)', 'roomVolume (m³)']}
              output="concentrationKgM3 (kg/m³)"
              code={`// CALC-003: concentrationKgM3
function concentrationKgM3(
  charge: number,
  volume: number
): number {
  if (volume <= 0) return 0;
  return charge / volume;  // C = m / V
}`}
            />

            <FormulaCard
              number="2"
              title="PPM Conversion"
              description="Convert concentration from kg/m³ to parts-per-million using molar volume at standard conditions (25°C, 101.3 kPa). MOLAR_VOLUME = 24.45 L/mol."
              inputs={['concentrationKgM3 (kg/m³)', 'molecularMass (g/mol)']}
              output="ppm"
              code={`// CALC-001: kgM3ToPpm
const MOLAR_VOLUME = 24.45; // L/mol at 25°C

function kgM3ToPpm(
  cKg: number,
  molecularMass: number
): number {
  return (MOLAR_VOLUME * cKg * 1e6)
         / molecularMass;
}

// Inverse: CALC-002
// ppmToKgM3 = (M * ppm) / (24.45 * 1e6)`}
            />

            <FormulaCard
              number="3"
              title="Alarm Threshold"
              description="Determine the detection alarm setpoint: the LOWER of 50% ATEL/ODL and 25% LFL, converted to ppm. This ensures the alarm triggers before either toxicity or flammability limits are approached."
              inputs={['atelOdl (kg/m³)', 'lfl (kg/m³)', 'molecularMass (g/mol)']}
              output="thresholdPpm (ppm)"
              code={`// THR-GEN-001 through THR-GEN-004
halfAtelPpm = kgM3ToPpm(atelOdl, M) * 0.50
lfl25PctPpm = kgM3ToPpm(lfl, M)     * 0.25

threshold = min(halfAtelPpm, lfl25PctPpm)

// If only one is available, use that one.
// Result is floored to integer ppm.`}
              note="Special case: R-717 (NH3) > 50 kg -> two-level alarm: pre-alarm 500 ppm (warning + ventilation), main alarm 30,000 ppm (emergency shutdown + evacuation)."
            />

            <FormulaCard
              number="4"
              title="Detector Placement (Height)"
              description="Determine detector mounting height based on vapour density relative to air. Uses absolute thresholds per EN 378-3 to classify gases as heavier, lighter, or neutral buoyancy."
              inputs={['vapourDensity (kg/m³)', 'roomHeight (m)']}
              output="placement: floor | ceiling | breathing_zone"
              code={`// PLC-HGT-001 through PLC-HGT-004
if (vapourDensity > 1.5) {
  // Heavier than air
  return { height: 'floor', heightM: '0-0.5 m' }
}
if (vapourDensity < 0.8) {
  // Lighter than air
  ceilingH = max(roomHeight - 0.3, 0.5)
  return { height: 'ceiling', heightM: ceilingH }
}
// Near-neutral buoyancy
return { height: 'breathing_zone',
         heightM: '1.2-1.8 m' }`}
            />

            <FormulaCard
              number="5"
              title="Detector Quantity (Area-based)"
              description="Default area-based calculation: one detector per 50 m². Always at least 1 detector. This is the fallback method when leak source positions are not available."
              inputs={['roomArea (m²)', 'm2PerDetector (default: 50)']}
              output="detectorCount"
              code={`// QTY-REC-001: areaBasedQuantity
function areaBasedQuantity(
  area: number,
  m2PerDetector: number = 50
): number {
  return max(1, ceil(area / m2PerDetector));
}

// Examples:
//   30 m²  -> 1 detector
//   80 m²  -> 2 detectors
//  250 m²  -> 5 detectors`}
            />

            <FormulaCard
              number="6"
              title="Detector Quantity (Cluster-based)"
              description="Group leak sources by proximity using union-find algorithm. Sources within 7 m of each other form one cluster, each cluster gets one detector. Positions are in percentage coordinates converted to meters."
              inputs={['leakSources[] {id, x%, y%}', 'roomLengthM', 'roomWidthM', 'maxDistanceM (default: 7)']}
              output="clusterCount"
              code={`// computeSourceClusters (union-find)
for each pair (i, j) in sources:
  dx = ((xi - xj) / 100) * roomLength
  dy = ((yi - yj) / 100) * roomWidth
  dist = sqrt(dx² + dy²)
  if dist <= 7m:
    union(i, j)

return count(unique roots)

// 0 sources -> 0, 1 source -> 1
// All within 7m -> 1 cluster`}
            />

            <FormulaCard
              number="7"
              title="Emergency Ventilation"
              description="Calculate emergency ventilation flow rate. EN 378 and ISO 5149 use 0.14 x sqrtm. ASHRAE 15 uses max(Gxsqrtm, 20xV/3600) where G depends on refrigerant."
              inputs={['chargeKg (kg)', 'roomVolumeM3 (m³) [ASHRAE only]', 'refrigerant [ASHRAE: G factor]']}
              output="flowRate (m³/s)"
              code={`// EN 378 / ISO 5149 (Clause 6.4.4):
q = 0.14 * sqrt(chargeKg)  // m³/s

// ASHRAE 15 (Section 8.11.5):
G = isNH3 ? 0.14 : 0.07
formula1 = G * sqrt(chargeKg)
formula2 = 20 * roomVolumeM3 / 3600
q = max(formula1, formula2)  // m³/s`}
            />

            <FormulaCard
              number="8"
              title="Charge Cap Factors (m1, m2, m3)"
              description="EN 378 charge threshold factors derived from the Lower Flammability Limit. Used to determine below-ground extra detector requirements and charge classification."
              inputs={['lfl (kg/m³)']}
              output="m1, m2, m3 (kg)"
              code={`// CALC-005/006/007: calcM1M2M3
m1 =   4 * LFL   // Small charge limit
m2 =  26 * LFL   // Medium charge limit
m3 = 130 * LFL   // Large charge limit

// Used in Path C (BelowGroundFlammable):
// charge > m2 -> extra detector required`}
            />

            {/* Constants reference */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Constants Reference</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Air Density (25°C)</div>
                  <div className="text-2xl font-mono font-bold text-gray-900 mt-1">1.18 <span className="text-sm text-gray-500">kg/m³</span></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Molar Volume (25°C, 101.3 kPa)</div>
                  <div className="text-2xl font-mono font-bold text-gray-900 mt-1">24.45 <span className="text-sm text-gray-500">L/mol</span></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Detector Distance (cluster)</div>
                  <div className="text-2xl font-mono font-bold text-gray-900 mt-1">7 <span className="text-sm text-gray-500">m</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: REGULATION RULES
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'regulations' && (
          <div className="space-y-8">

            {/* Comparison Table */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Regulation Comparison</h2>
              <p className="text-gray-500 text-sm mb-4">Side-by-side comparison of all three supported regulation profiles.</p>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#0a1628] text-white">
                        <th className="text-left px-5 py-3 font-semibold w-[200px]">Aspect</th>
                        <th className="text-left px-5 py-3 font-semibold">EN 378-3:2016</th>
                        <th className="text-left px-5 py-3 font-semibold">ASHRAE 15-2022</th>
                        <th className="text-left px-5 py-3 font-semibold">ISO 5149-3:2014</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-5 py-3 font-medium text-gray-700">Region</td>
                        <td className="px-5 py-3 text-gray-600">EU</td>
                        <td className="px-5 py-3 text-gray-600">US / International</td>
                        <td className="px-5 py-3 text-gray-600">International</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-700">Detection trigger</td>
                        <td className="px-5 py-3 text-gray-600">
                          Charge vs QLMV/QLAV (Table C.3)<br />
                          <span className="text-xs text-gray-400">Above/below ground variants</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          Charge &gt; Table 1 exemption (fixed kg)<br />
                          <span className="text-xs text-gray-400">Volume-independent</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          A2/A2L/A3/B-group: ALWAYS<br />
                          A1: charge &gt; RCL &times; V<br />
                          <span className="text-xs text-gray-400">No category-a factor</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-medium text-gray-700">Alarm levels (A2L)</td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">25% / 50% / 100%</span> RCL
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">12.5% / 25% / 25%</span> LFL
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">25% / 50% / 100%</span> RCL
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-700">Alarm levels (A1/B1)</td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">25% / 50% / 100%</span> RCL
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">25% / 50% / 100%</span> RCL
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">25% / 50% / 100%</span> RCL
                        </td>
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-medium text-gray-700">Ventilation</td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">0.14 &times; &radic;m</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">max(G&times;&radic;m, 20&times;V/3600)</span><br />
                          <span className="text-xs text-gray-400">G = 0.14 (NH3), 0.07 (others)</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">0.14 &times; &radic;m</span>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-700">Detector count</td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">&lceil;A/50&rceil;</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          Engineering judgment<br />
                          <span className="text-xs text-gray-400">(default: &lceil;A/50&rceil;)</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          <span className="font-mono text-xs">&lceil;A/50&rceil;</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-medium text-gray-700">Extras</td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          Below-ground extra detector (charge &gt; m2)
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          Return air det. (B-group)<br />
                          Redundancy (B2/B3 + institutional)<br />
                          Solenoid interlock (A2L + occupied)
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          &mdash;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* EN 378 Paths */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">EU</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">EN 378-3:2016 Detection Paths</h2>
                  <p className="text-gray-500 text-xs">Paths A through F evaluated in order. First YES wins, else MANUAL_REVIEW, else RECOMMENDED.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <RulePathCard
                  pathId="A"
                  title="Machinery Room"
                  description="Mandatory detection in any machinery room. B-group (toxic) refrigerants always trigger. Below-ground + flammable + charge > m2 adds extra detector."
                  conditions={[
                    'isMachineryRoom === true',
                    'B-group (toxic): always YES',
                    'Below ground + flammable + charge > m2 (26 x LFL): +1 detector',
                  ]}
                  result="YES"
                  ruleIds={['DET-MR-001', 'DET-MR-002']}
                  clauses={['EN 378-3:2016 Clause 9.1', 'EN 378-3:2016 Clause 4.3']}
                  color="red"
                />

                <RulePathCard
                  pathId="B"
                  title="C.3 Occupied Space (Table C.3)"
                  description="Compare actual concentration against QLMV and QLAV limits from EN 378-1 Table C.3. Different logic for above-ground (C.3.2.2) vs below-ground (C.3.2.3)."
                  conditions={[
                    'c3Applicable === true',
                    'Above-ground: conc <= QLMV -> NO | QLMV < conc <= QLAV -> YES (1 measure) | conc > QLAV -> YES (2 measures)',
                    'Below-ground: conc <= RCL -> NO | RCL < conc <= QLMV -> YES (1 measure) | conc > QLMV -> YES (must <= QLAV)',
                    'Boundary warning: concentration within 5% of QLMV triggers MR-003 review flag',
                  ]}
                  result="YES / NO"
                  ruleIds={['DET-C3-001', 'DET-C3-003', 'DET-C3-004', 'DET-C3-005', 'DET-C3-006', 'DET-C3-007', 'DET-C3-008']}
                  clauses={['EN 378-1:2016 Table C.3', 'C.3.2.2 (above)', 'C.3.2.3 (below)']}
                  color="blue"
                />

                <RulePathCard
                  pathId="C"
                  title="Below-Ground Flammable Systems"
                  description="Additional check for underground installations with flammable refrigerants. Triggers extra detector when charge exceeds m2 threshold."
                  conditions={[
                    'belowGround === true',
                    'isFlammable(flammabilityClass) === true (class 2L, 2, or 3)',
                    'charge > m2 (26 x LFL)',
                  ]}
                  result="YES"
                  ruleIds={['DET-BG-001']}
                  clauses={['EN 378-3:2016 Clause 4.3']}
                  color="amber"
                />

                <RulePathCard
                  pathId="D"
                  title="Ammonia (R-717)"
                  description="Specific two-level alarm regime for ammonia systems above 50 kg. Pre-alarm at 500 ppm triggers warning and ventilation. Main alarm at 30,000 ppm triggers emergency shutdown."
                  conditions={[
                    'refrigerant.id === R-717',
                    'charge > 50 kg',
                  ]}
                  result="YES"
                  ruleIds={['DET-NH3-001', 'DET-NH3-002']}
                  clauses={['EN 378-3:2016 Clause 9.3.3']}
                  color="purple"
                />

                <RulePathCard
                  pathId="E"
                  title="Ventilated Enclosure / Location IV"
                  description="Systems installed in ventilated enclosures (Location Class IV). Requires manual engineering review of enclosure integrity and ventilation monitoring."
                  conditions={[
                    'locationClass === "IV"',
                  ]}
                  result="MANUAL_REVIEW"
                  ruleIds={['DET-ENC-001']}
                  clauses={['EN 378-2', 'EN 378-3']}
                  color="amber"
                />

                <RulePathCard
                  pathId="F"
                  title="Not Required / Recommended"
                  description="If all paths A-E are negative (SKIP or NO), detection is not normatively required. SAMON policy: recommend detection as good engineering practice regardless."
                  conditions={[
                    'All paths A-E returned SKIP or NO',
                    'National/local regulations may still mandate detection',
                  ]}
                  result="RECOMMENDED"
                  ruleIds={['DET-NONE-001']}
                  clauses={[]}
                  color="emerald"
                />
              </div>
            </div>

            {/* ASHRAE 15 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs">US</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">ASHRAE 15-2022 Detection Logic</h2>
                  <p className="text-gray-500 text-xs">Exemption-based system using fixed charge thresholds from Table 1.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <RulePathCard
                  pathId="A"
                  title="Machinery Room"
                  description="Detection always mandatory in machinery rooms regardless of refrigerant type. B-group triggers additional emergency ventilation actions."
                  conditions={[
                    'isMachineryRoom === true',
                    'B-group: alarm + emergency ventilation',
                    'A-group: alarm',
                  ]}
                  result="YES"
                  ruleIds={['ASHRAE15-MR-001', 'ASHRAE15-MR-002']}
                  clauses={['ASHRAE 15-2022 Section 7.4']}
                  color="red"
                />

                <RulePathCard
                  pathId="B"
                  title="Occupied Space (Table 1 Exemption)"
                  description="Compare system charge against fixed exemption quantities from Table 1. Unlike EN 378, this is NOT volume-dependent \u2014 it is a simple charge threshold per refrigerant."
                  conditions={[
                    'isOccupiedSpace === true',
                    'charge > exemption (Table 1) -> YES',
                    'charge <= exemption -> RECOMMENDED (SAMON policy)',
                  ]}
                  result="YES / RECOMMENDED"
                  ruleIds={['ASHRAE15-OCC-001', 'ASHRAE15-OCC-002']}
                  clauses={['ASHRAE 15-2022 Table 1']}
                  color="blue"
                />

                <RulePathCard
                  pathId="C"
                  title="Ammonia (R-717)"
                  description="Same as EN 378 ammonia path: R-717 above 50 kg triggers mandatory two-level alarm."
                  conditions={[
                    'refrigerant.id === R-717',
                    'charge > 50 kg',
                  ]}
                  result="YES"
                  ruleIds={['ASHRAE15-NH3-001']}
                  clauses={['ASHRAE 15-2022 Section 7.4.3']}
                  color="purple"
                />
              </div>

              {/* ASHRAE Table 1 */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">ASHRAE 15-2022 Table 1 &mdash; Exemption Quantities</h3>
                  <p className="text-xs text-gray-500 mt-0.5">If system charge &le; exemption, detection is not normatively required.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#0a1628] text-white">
                        <th className="text-left px-4 py-2 font-medium">Refrigerant</th>
                        <th className="text-right px-4 py-2 font-medium">Exemption (kg)</th>
                        <th className="text-left px-4 py-2 font-medium">Refrigerant</th>
                        <th className="text-right px-4 py-2 font-medium">Exemption (kg)</th>
                        <th className="text-left px-4 py-2 font-medium">Refrigerant</th>
                        <th className="text-right px-4 py-2 font-medium">Exemption (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(() => {
                        const entries = [
                          ['R-22', '11.3'], ['R-32', '6.8'], ['R-123', '2.3'],
                          ['R-134a', '11.3'], ['R-152a', '1.0'], ['R-290', '1.0'],
                          ['R-404A', '11.3'], ['R-407A', '11.3'], ['R-407C', '11.3'],
                          ['R-407F', '11.3'], ['R-410A', '11.3'], ['R-448A', '11.3'],
                          ['R-449A', '11.3'], ['R-450A', '11.3'], ['R-452A', '11.3'],
                          ['R-452B', '6.8'], ['R-454A', '6.8'], ['R-454B', '6.8'],
                          ['R-454C', '6.8'], ['R-455A', '6.8'], ['R-464A', '6.8'],
                          ['R-465A', '6.8'], ['R-466A', '11.3'], ['R-468A', '6.8'],
                          ['R-507A', '11.3'], ['R-513A', '11.3'], ['R-600a', '0.5'],
                          ['R-717', '0 (always)'], ['R-744', '45'], ['R-1150', '0.5'],
                          ['R-1234yf', '6.8'], ['R-1234ze', '6.8'], ['R-1233zd', '6.8'],
                          ['R-1270', '0.5'], ['R-50', '0.5'], ['', ''],
                        ];
                        const rows = [];
                        for (let i = 0; i < entries.length; i += 3) {
                          rows.push(
                            <tr key={i} className={i % 6 < 3 ? '' : 'bg-gray-50'}>
                              <td className="px-4 py-1.5 font-mono text-gray-700">{entries[i]?.[0]}</td>
                              <td className="px-4 py-1.5 text-right font-mono text-gray-900">{entries[i]?.[1]}</td>
                              <td className="px-4 py-1.5 font-mono text-gray-700">{entries[i + 1]?.[0]}</td>
                              <td className="px-4 py-1.5 text-right font-mono text-gray-900">{entries[i + 1]?.[1]}</td>
                              <td className="px-4 py-1.5 font-mono text-gray-700">{entries[i + 2]?.[0]}</td>
                              <td className="px-4 py-1.5 text-right font-mono text-gray-900">{entries[i + 2]?.[1]}</td>
                            </tr>
                          );
                        }
                        return rows;
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ASHRAE 15 Extra Requirements */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">ASHRAE 15 Extra Requirements</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Return Air Detector</div>
                    <p className="text-sm text-gray-600 mt-1">Required for all B-group (toxic) refrigerants.</p>
                    <p className="text-[10px] font-mono text-gray-400 mt-2">Section 7.4.3</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Redundant Detection</div>
                    <p className="text-sm text-gray-600 mt-1">Required for B2/B3 in institutional occupancy.</p>
                    <p className="text-[10px] font-mono text-gray-400 mt-2">Section 7.4.5</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Solenoid Interlock</div>
                    <p className="text-sm text-gray-600 mt-1">Mandatory for A2L in occupied spaces.</p>
                    <p className="text-[10px] font-mono text-gray-400 mt-2">Section 7.6.2</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ISO 5149 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px]">ISO</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">ISO 5149-3:2014 Detection Logic</h2>
                  <p className="text-gray-500 text-xs">Simplified version of EN 378. Stricter for flammable/toxic: always required regardless of charge.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <RulePathCard
                  pathId="A"
                  title="Machinery Room"
                  description="Same as EN 378: detection always mandatory in machinery rooms."
                  conditions={[
                    'isMachineryRoom === true',
                  ]}
                  result="YES"
                  ruleIds={['ISO5149-MR-001']}
                  clauses={['ISO 5149-3:2014']}
                  color="red"
                />

                <RulePathCard
                  pathId="B"
                  title="Occupied Space"
                  description="Key difference from EN 378 and ASHRAE 15: flammable and toxic refrigerants ALWAYS require detection in occupied spaces, regardless of charge amount. A1 uses charge > RCL x V without category factor."
                  conditions={[
                    'isOccupiedSpace === true',
                    'Flammable (2L/2/3) or Toxic (B): ALWAYS YES',
                    'A1 only: charge > practicalLimit x volume -> YES',
                    'A1 only: charge <= practicalLimit x volume -> RECOMMENDED',
                  ]}
                  result="YES / RECOMMENDED"
                  ruleIds={['ISO5149-OCC-001', 'ISO5149-OCC-002', 'ISO5149-OCC-003']}
                  clauses={['ISO 5149-3:2014']}
                  color="emerald"
                />
              </div>
            </div>

            {/* EN 378 Table C.3 Reference */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">EN 378-1:2016 Table C.3 &mdash; QLMV / QLAV / RCL Values</h3>
                <p className="text-xs text-gray-500 mt-0.5">Used by EN 378 Path B (C.3 Occupied Space). All values in kg/m³.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0a1628] text-white">
                      <th className="text-left px-4 py-2 font-medium">Refrigerant</th>
                      <th className="text-right px-4 py-2 font-medium">RCL</th>
                      <th className="text-right px-4 py-2 font-medium">QLMV</th>
                      <th className="text-right px-4 py-2 font-medium">QLAV</th>
                      <th className="text-left px-4 py-2 font-medium">Refrigerant</th>
                      <th className="text-right px-4 py-2 font-medium">RCL</th>
                      <th className="text-right px-4 py-2 font-medium">QLMV</th>
                      <th className="text-right px-4 py-2 font-medium">QLAV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(() => {
                      const c3 = [
                        ['R-22', '0.21', '0.28', '0.50'],
                        ['R-134a', '0.21', '0.28', '0.58'],
                        ['R-404A', '0.29', '0.32', '0.48'],
                        ['R-407A', '0.28', '0.31', '0.47'],
                        ['R-407C', '0.27', '0.44', '0.49'],
                        ['R-407F', '0.29', '0.32', '0.48'],
                        ['R-410A', '0.39', '0.44', '0.42'],
                        ['R-448A', '0.29', '0.33', '0.46'],
                        ['R-449A', '0.29', '0.33', '0.46'],
                        ['R-450A', '0.42', '0.46', '0.56'],
                        ['R-452A', '0.28', '0.31', '0.47'],
                        ['R-452B', '0.33', '0.37', '0.50'],
                        ['R-454A', '0.26', '0.29', '0.44'],
                        ['R-454B', '0.31', '0.35', '0.48'],
                        ['R-454C', '0.31', '0.35', '0.48'],
                        ['R-455A', '0.32', '0.36', '0.49'],
                        ['R-507A', '0.29', '0.32', '0.48'],
                        ['R-513A', '0.42', '0.46', '0.56'],
                        ['R-717', '0.22', '0.35', '0.50'],
                        ['R-744', '0.072', '0.074', '0.18'],
                        ['R-290', '0.008', '0.038', '0.058'],
                        ['R-600a', '0.011', '0.046', '0.069'],
                        ['R-1270', '0.008', '0.038', '0.058'],
                        ['R-32', '0.061', '0.063', '0.15'],
                        ['R-1234yf', '0.058', '0.060', '0.14'],
                        ['R-1234ze(E)', '0.061', '0.063', '0.15'],
                        ['R-1233zd', '0.36', '0.40', '0.52'],
                        ['R-464A', '0.27', '0.30', '0.45'],
                        ['R-465A', '0.25', '0.28', '0.42'],
                        ['R-466A', '0.32', '0.36', '0.49'],
                        ['R-468A', '0.27', '0.30', '0.45'],
                        ['', '', '', ''],
                      ];
                      const rows = [];
                      for (let i = 0; i < c3.length; i += 2) {
                        rows.push(
                          <tr key={i} className={Math.floor(i / 2) % 2 === 1 ? 'bg-gray-50' : ''}>
                            <td className="px-4 py-1.5 font-mono text-gray-700 text-xs">{c3[i]?.[0]}</td>
                            <td className="px-4 py-1.5 text-right font-mono text-gray-900 text-xs">{c3[i]?.[1]}</td>
                            <td className="px-4 py-1.5 text-right font-mono text-gray-900 text-xs">{c3[i]?.[2]}</td>
                            <td className="px-4 py-1.5 text-right font-mono text-gray-900 text-xs">{c3[i]?.[3]}</td>
                            <td className="px-4 py-1.5 font-mono text-gray-700 text-xs">{c3[i + 1]?.[0]}</td>
                            <td className="px-4 py-1.5 text-right font-mono text-gray-900 text-xs">{c3[i + 1]?.[1]}</td>
                            <td className="px-4 py-1.5 text-right font-mono text-gray-900 text-xs">{c3[i + 1]?.[2]}</td>
                            <td className="px-4 py-1.5 text-right font-mono text-gray-900 text-xs">{c3[i + 1]?.[3]}</td>
                          </tr>
                        );
                      }
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: DECISION PIPELINE
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'pipeline' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Detection Decision Pipeline</h2>
              <p className="text-gray-500 text-sm">
                Visual flowchart showing how the engine evaluates whether gas detection is required,
                and how it calculates thresholds, placement, quantity, and ventilation.
              </p>
            </div>

            {/* Main Flowchart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col items-center max-w-2xl mx-auto">

                {/* START */}
                <FlowNode type="start" label="START" sub="Input: refrigerant, charge, room, context" />
                <FlowArrow />

                {/* Step 1: Machinery Room */}
                <FlowNode type="decision" label="Is Machinery Room?" />
                <div className="flex w-full items-start justify-center">
                  {/* YES branch */}
                  <div className="flex flex-col items-center w-1/2">
                    <div className="flex items-center">
                      <div className="w-12 h-0.5 bg-gray-400"></div>
                      <span className="text-[10px] text-emerald-600 font-bold px-1">YES</span>
                    </div>
                    <div className="w-0.5 h-4 bg-gray-400"></div>
                    <FlowNode type="output" label="DETECTION REQUIRED" sub="DET-MR-001 / MR-002" />
                    <div className="text-[10px] text-gray-400 mt-1 text-center">
                      B-group: +ventilation<br />
                      Below ground + flam + &gt;m2: +1 det
                    </div>
                  </div>
                  {/* NO branch continues down */}
                  <div className="flex flex-col items-center w-1/2">
                    <div className="flex items-center">
                      <span className="text-[10px] text-red-500 font-bold px-1">NO</span>
                      <div className="w-12 h-0.5 bg-gray-400"></div>
                    </div>
                    <div className="w-0.5 h-4 bg-gray-400"></div>
                    <div className="text-[10px] text-gray-500 font-medium">continue...</div>
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-gray-400"></div>
                <FlowArrow />

                {/* Step 2: Regulation fork */}
                <FlowNode type="decision" label="Which Regulation?" />
                <div className="flex w-full justify-center gap-2 mt-3">
                  <div className="flex flex-col items-center flex-1">
                    <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-t-lg">EN 378</div>
                    <div className="border-2 border-blue-200 bg-blue-50 rounded-b-lg p-3 text-xs text-center w-full">
                      <div className="font-semibold text-blue-900">C.3 Path</div>
                      <div className="text-blue-700 mt-1">
                        conc = charge / volume<br />
                        Compare vs QLMV/QLAV<br />
                        <span className="text-[10px]">(above/below ground variants)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-t-lg">ASHRAE 15</div>
                    <div className="border-2 border-red-200 bg-red-50 rounded-b-lg p-3 text-xs text-center w-full">
                      <div className="font-semibold text-red-900">Table 1 Exemption</div>
                      <div className="text-red-700 mt-1">
                        charge &gt; exemption(ref)?<br />
                        YES: required<br />
                        <span className="text-[10px]">NO: recommended</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-t-lg">ISO 5149</div>
                    <div className="border-2 border-emerald-200 bg-emerald-50 rounded-b-lg p-3 text-xs text-center w-full">
                      <div className="font-semibold text-emerald-900">Safety Class Check</div>
                      <div className="text-emerald-700 mt-1">
                        Flam/Toxic: ALWAYS<br />
                        A1: charge &gt; RCL &times; V<br />
                        <span className="text-[10px]">(no category factor)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <FlowArrow />

                {/* Step 3: Special paths */}
                <FlowNode type="decision" label="R-717 (NH3) > 50 kg?" />
                <div className="flex w-full items-start justify-center">
                  <div className="flex flex-col items-center w-1/2">
                    <div className="flex items-center">
                      <div className="w-12 h-0.5 bg-gray-400"></div>
                      <span className="text-[10px] text-emerald-600 font-bold px-1">YES</span>
                    </div>
                    <div className="w-0.5 h-3 bg-gray-400"></div>
                    <div className="bg-purple-100 border-2 border-purple-300 rounded-lg px-4 py-2 text-xs text-purple-900 text-center">
                      <div className="font-semibold">Two-Level Alarm</div>
                      <div className="mt-0.5">500 ppm &rarr; 30,000 ppm</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-1/2">
                    <div className="flex items-center">
                      <span className="text-[10px] text-red-500 font-bold px-1">NO</span>
                      <div className="w-12 h-0.5 bg-gray-400"></div>
                    </div>
                    <div className="w-0.5 h-3 bg-gray-400"></div>
                    <div className="text-[10px] text-gray-500 font-medium">standard threshold</div>
                  </div>
                </div>

                <FlowArrow />

                {/* Step 4: Calculate threshold */}
                <FlowNode type="process" label="Calculate Alarm Threshold" sub="min(50% ATEL/ODL, 25% LFL) -> ppm" />
                <FlowArrow />

                {/* Step 5: Placement */}
                <FlowNode type="process" label="Calculate Detector Placement" sub="VD > 1.5 -> floor | VD < 0.8 -> ceiling | else -> breathing zone" />
                <FlowArrow />

                {/* Step 6: Quantity */}
                <FlowNode type="process" label="Calculate Detector Quantity" sub="ceil(A/50) or union-find clusters (7m max)" />
                <FlowArrow />

                {/* Step 7: Ventilation */}
                <FlowNode type="process" label="Calculate Emergency Ventilation" sub="EN378/ISO: 0.14xsqrtm | ASHRAE: max(Gxsqrtm, 20V/3600)" />
                <FlowArrow />

                {/* Step 8: Extra requirements */}
                <FlowNode type="process" label="Check Extra Requirements" sub="ASHRAE: return air det, redundancy, solenoid" />
                <FlowArrow />

                {/* OUTPUT */}
                <FlowNode type="output" label="OUTPUT: RegulationResult" />
                <div className="mt-3 bg-[#0a1628] rounded-lg p-4 w-full max-w-lg">
                  <pre className="text-emerald-400 font-mono text-[11px] leading-relaxed">{`RegulationResult {
  detectionRequired: YES | NO | MANUAL_REVIEW | RECOMMENDED
  detectionBasis:    string  // governing clause
  governingRuleId:   string  // e.g. "DET-MR-001"
  threshold:         { ppm, kgM3, basis }
  alarm1 / alarm2 / cutoff
  placement:         { height, heightM }
  detectorCount:     number
  ventilation:       { flowRateM3s, formula, clause }
  extraRequirements: ExtraRequirement[]
  pathEvaluations:   PathEvaluation[]
  reviewFlags:       string[]
  assumptions:       string[]
}`}</pre>
                </div>

                <div className="mt-4">
                  <FlowNode type="end" label="END" />
                </div>
              </div>
            </div>

            {/* Aggregation Logic */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Path Aggregation Logic</h3>
              <p className="text-gray-600 text-sm mb-4">
                When multiple detection paths are evaluated, results are aggregated using this priority:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">1st</div>
                  <div className="font-semibold text-red-900 mt-1">Any YES</div>
                  <p className="text-xs text-red-700 mt-1">First YES path wins. All YES paths are combined in the basis string.</p>
                </div>
                <div className="border-2 border-amber-200 bg-amber-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600">2nd</div>
                  <div className="font-semibold text-amber-900 mt-1">Any MANUAL_REVIEW</div>
                  <p className="text-xs text-amber-700 mt-1">If no YES, but a path needs review, flag for engineer.</p>
                </div>
                <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">3rd</div>
                  <div className="font-semibold text-blue-900 mt-1">RECOMMENDED</div>
                  <p className="text-xs text-blue-700 mt-1">All paths negative. SAMON policy: recommend detection as good practice.</p>
                </div>
              </div>
            </div>

            {/* Safety Classification Helper */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Classification Helpers</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Flammability Classes</h4>
                  <div className="bg-[#0a1628] rounded-lg p-4">
                    <pre className="text-emerald-400 font-mono text-xs">{`isFlammable(class):
  "2L" → true   (mildly flammable)
  "2"  → true   (flammable)
  "3"  → true   (highly flammable)
  "1"  → false  (non-flammable)`}</pre>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Toxicity Classes</h4>
                  <div className="bg-[#0a1628] rounded-lg p-4">
                    <pre className="text-emerald-400 font-mono text-xs">{`isToxic(class):
  "B" → true   (higher toxicity)
  "A" → false  (lower toxicity)

Governing Hazard:
  B + flam  → BOTH
  B only    → TOXICITY
  flam only → FLAMMABILITY
  neither   → NONE`}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Source File Reference */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Files</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { file: 'engine/core.ts', desc: 'Shared physics, placement, clustering, unit conversions' },
                  { file: 'engine/rule-set.ts', desc: 'RuleSet interface — contract for all regulation profiles' },
                  { file: 'rules/en378.ts', desc: 'EN 378-3:2016 — Paths A-F, thresholds, ventilation, zones' },
                  { file: 'rules/ashrae15.ts', desc: 'ASHRAE 15-2022 — Exemption-based detection, LFL alarms, extras' },
                  { file: 'rules/iso5149.ts', desc: 'ISO 5149-3:2014 — Simplified EN 378, always-on for flammable/toxic' },
                  { file: 'rules/ashrae15-exemptions.ts', desc: 'ASHRAE Table 1 exemption quantities (35 refrigerants)' },
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
