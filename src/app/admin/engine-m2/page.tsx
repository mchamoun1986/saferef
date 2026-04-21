'use client';

import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────

type Tab = 'filters' | 'selection' | 'products';

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
    { id: 'filters', label: 'Filter Pipeline' },
    { id: 'selection', label: 'Solution Assembly' },
    { id: 'products', label: 'Product Types & Families' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#1a2332] text-white px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">
            SystemDesigner V2{' '}
            <span className="text-gray-400 font-normal">/ Product Selection Engine</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Technical reference for the V2 product selection engine (<code className="text-xs bg-white/10 px-1 py-0.5 rounded">SystemDesigner</code>).
            <br />
            Covers the filter pipeline, solution assembly (centralized + standalone), BOM generation, X5 config A/B/C, alert &amp; adapter selection.
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
            TAB 1: FILTER PIPELINE
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'filters' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">V2 Filter Pipeline</h2>
              <p className="text-gray-500 text-sm mt-1">
                Sequential filter chain inside <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">filterDetectorsInternal()</code>.
                Each filter narrows the candidate pool of detectors and sensors.
                Source: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">m2-engine/designer.ts</code>
              </p>
            </div>

            <FormulaCard
              number="F1"
              title="Type Filter"
              description="Keep only products of type 'detector' or 'sensor'. Controllers, accessories, and alerts are excluded from the detector pool. Only active products (status='active') pass through."
              inputs={['products[]', 'type', 'status']}
              output="detectors/sensors only, active only"
              code={`// F1: Type + status filter
pool = products.filter(p =>
  (p.type === 'detector' || p.type === 'sensor')
  && p.status === 'active'
);`}
            />

            <FormulaCard
              number="F2"
              title="Gas Filter"
              description="Keep only detectors whose refs[] array includes the selected refrigerant. Each product stores a JSON array of individual refrigerant codes it detects (e.g. ['R744'], ['R32','R410A']). Individual refrigerants are matched directly — no gas group translation."
              inputs={['products[]', 'gas (e.g. R744, R32, R717)']}
              output="filtered detectors[]"
              code={`// F2: Gas filter (individual refrigerant)
function f2_gas(products, gas) {
  if (!gas) return products;
  return products.filter(p => {
    const refs = JSON.parse(p.refs || '[]');
    return refs.includes(gas);
  });
}

// Example: gas = "R717"
// Matches products with refs: ["R717"]
// Does NOT use gas group translation`}
            />

            <FormulaCard
              number="F3"
              title="ATEX Filter"
              description="If ATEX certification is required (Zone 1/2), keep only products with atex=true. If ATEX is not required, all products pass through unchanged."
              inputs={['products[]', 'atex (boolean)']}
              output="filtered detectors[]"
              code={`// F3: ATEX filter
function f3_atex(products, atex) {
  if (!atex) return products;
  return products.filter(p => p.atex === true);
}

// ATEX-certified families:
// X5 Direct Sensor Module (SIL/ATEX variants)
// GLACIAR MIDI ATEX variants`}
            />

            <FormulaCard
              number="F4"
              title="Voltage Filter"
              description="Keep only detectors compatible with the site voltage. X5 sensors (no voltage field) are powered by their transmitter — they always pass. For 230V AC sites, all detectors pass (adapters can be added). For 24V DC/AC, products with 24V or 12-24V voltage pass."
              inputs={['products[]', 'voltage ("12V DC" | "24V DC/AC" | "230V AC")']}
              output="filtered detectors[]"
              code={`// F4: Voltage compatibility
if (!product.voltage) {
  // X5 sensors — powered by transmitter
  return family.includes('X5');
}
if (voltage === '24V DC/AC') {
  return pv.includes('24') || pv.includes('12-24');
}
if (voltage === '230V AC') {
  // All detectors pass — adapter if needed
  return true;
}
if (voltage === '12V DC') {
  return pv.includes('12');
}`}
              note="GLACIAR MIDI on 230V AC sites automatically gets a Power Adapter added to the BOM during solution assembly."
            />

            <FormulaCard
              number="F5"
              title="Location Filter (ambient / duct / pipe)"
              description="Filters by installation location. For duct or pipe installations: GLACIAR MIDI must be the Remote variant (variant includes 'remote'). X5 Direct Sensor Module is excluded (only X5 Remote Sensor works in duct/pipe). All other families pass for all locations."
              inputs={['products[]', 'location ("ambient" | "duct" | "pipe")']}
              output="filtered detectors[]"
              code={`// F5: Location filter
if (location === 'duct' || location === 'pipe') {
  if (family === 'GLACIAR MIDI') {
    // Must be Remote variant
    const variantLower =
      (p.variant || '').toLowerCase();
    if (!variantLower.includes('remote'))
      return false;
  }
  if (family === 'X5 Direct Sensor Module')
    return false; // Only remote works
}
// ambient: all families pass`}
            />

            <FormulaCard
              number="F6"
              title="Measurement Type Filter"
              description="Keep only detectors whose measurement range matches the selected type. Measurement type is inferred from the product's range field: 'lel'/'lfl' → LEL, 'vol'/'% vol' → volume, 'ppm' → PPM. If the product has no range or type can't be determined, it passes."
              inputs={['products[]', 'measType ("ppm" | "lel" | "vol" | "")']}
              output="filtered detectors[]"
              code={`// F6: Measurement type filter
function getMeasType(product) {
  const r = (product.range || '').toLowerCase();
  if (r.includes('lel') || r.includes('lfl'))
    return 'lel';
  if (r.includes('vol') || r.includes('% vol'))
    return 'vol';
  if (r.includes('ppm')) return 'ppm';
  return ''; // unknown — passes filter
}

if (!measType) return true; // no filter
const prodType = getMeasType(product);
if (!prodType) return true; // unknown passes
return prodType === measType;`}
            />

            <FormulaCard
              number="F7"
              title="Application Filter"
              description="Filter by application type using Application.productFamilies. Each Application defines which product families are compatible (e.g. supermarket → ['MIDI','MP']). Products whose family matches the allowed list pass. If no application is selected or no families are defined, all products pass."
              inputs={['products[]', 'application (optional)', 'Application.productFamilies[]']}
              output="filtered detectors[]"
              code={`// F7: Application filter (family-based)
function f7_application(products, app, appFamilies) {
  if (!app) return products; // no filter
  if (!appFamilies || appFamilies.length === 0)
    return products; // no restriction
  const allowed = appFamilies
    .map(f => f.toUpperCase());
  return products.filter(p => {
    const family = p.family.toUpperCase();
    return allowed.some(a =>
      family.includes(a));
  });
}

// Application.productFamilies examples:
// supermarket → ["MIDI","MP"]
// machinery_room → ["X5","GXR","GEX"]`}
            />

            {/* Constants reference */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Pipeline Summary</h3>
              <div className="bg-[#0a1628] rounded-lg p-4">
                <pre className="text-emerald-400 font-mono text-xs leading-relaxed">{`// SystemDesigner.filterDetectorsInternal() — executed in order:
F1: type = 'detector' | 'sensor'  &&  status = 'active'
F2: gas array includes selected refrigerant  (individual code, e.g. "R744")
F3: atex = true  (only if inputs.atex = true)
F4: voltage compatible  (X5 sensors always pass)
F5: location compatible  (duct/pipe → remote variants only)
F6: measType matches range  (ppm / lel / vol)
F7: Application.productFamilies filter  (family-based)

Result: ProductV2[] — compatible detectors/sensors`}</pre>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Engine Class</div>
                  <div className="font-mono text-sm font-bold text-gray-900 mt-1">SystemDesigner</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">m2-engine/designer.ts</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">API</div>
                  <div className="font-mono text-sm font-bold text-gray-900 mt-1">designer.generate(inputs)</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">returns Solution[]</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product source</div>
                  <div className="font-mono text-sm font-bold text-gray-900 mt-1">/api/products?status=active</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">V2 ProductV2 type</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: SOLUTION ASSEMBLY
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'selection' && (
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Solution Assembly</h2>
              <p className="text-gray-500 text-sm mt-1">
                After filtering, <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">generate()</code> builds
                centralized and standalone solutions for each compatible detector. Each solution gets a full BOM.
                Source: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">m2-engine/designer.ts</code>
              </p>
            </div>

            <div className="grid gap-4">
              <RulePathCard
                pathId="C"
                title="Centralized Solution (detector + controller)"
                description="For each compatible detector, find controllers it is compatible with (via compatibleWith JSON array). Each detector+controller pair generates one centralized solution. Controller quantity is calculated from connectionRules.maxDetectors or maxSensorModules."
                conditions={[
                  'detector.compatibleWith[] lists compatible controller families',
                  'Controller must be type=controller and status=active',
                  'controllerQty = ceil(points / maxDetectors)',
                  'For X5: ceil(points / maxSensorModules)',
                ]}
                result="Solution (mode=centralized)"
                ruleIds={['CTRL-COMPAT-001']}
                clauses={['compatibleWith field on detector']}
                color="blue"
              />

              <RulePathCard
                pathId="SA"
                title="Standalone Solution (detector only)"
                description="A standalone solution is generated when detector.relay > 0 AND detector.standalone = true. No controller is needed. Alert accessories are added at 1 beacon + 1 siren per detection point."
                conditions={[
                  'detector.relay > 0',
                  'detector.standalone = true',
                  'Alerts: 1 beacon + 1 siren per point',
                ]}
                result="Solution (mode=standalone)"
                ruleIds={['SA-001']}
                clauses={['relay field', 'standalone field']}
                color="emerald"
              />

              <RulePathCard
                pathId="AL"
                title="Alert Products (beacons + sirens)"
                description="Alert accessories are found via their compatibleWith[] field — they must list the detector family (for standalone) or both detector and controller families (for centralized). Rules from connectionRules control quantities: beaconsPerTransmitter, sirensPerTransmitter for X5, or beaconsNeeded/sirensNeeded for GC10-style controllers."
                conditions={[
                  'alert.compatibleWith includes detector/controller family',
                  'subType: beacon, siren, beacon_siren_combo, socket_beacon',
                  'X5: qty = ceil(points / maxSensorModules) * beaconsPerTransmitter',
                  'GC10: qty = beaconsNeeded (usually 1)',
                  'Standalone: qty = points (1 per detection point)',
                ]}
                result="BomComponent (role=alert)"
                ruleIds={['ALERT-X5-001', 'ALERT-GC10-001', 'ALERT-SA-001']}
                clauses={['connectionRules.beaconsPerTransmitter', 'connectionRules.beaconsNeeded']}
                color="red"
              />

              <RulePathCard
                pathId="PA"
                title="Power Adapter"
                description="Added when site voltage is 230V AC and detector voltage does not include 230V (i.e. the detector is 12V or 24V only). The accessory must have subType=power_adapter and be in compatibleWith the detector family. Quantity = ceil(points / powerAdapterCapacity) from detector connectionRules."
                conditions={[
                  'inputs.voltage = "230V AC"',
                  '!detector.voltage.includes("230")',
                  'Controller does NOT power detectors (connectionRules.powersDetectors)',
                  'accessory.subType = "power_adapter"',
                  'qty = ceil(points / powerAdapterCapacity)',
                ]}
                result="BomComponent (role=accessory)"
                ruleIds={['ADAPTER-001']}
                clauses={['connectionRules.powerAdapterCapacity (default: 5)', 'connectionRules.powersDetectors']}
                color="amber"
              />

              <RulePathCard
                pathId="X5"
                title="X5 Config A / B / C"
                description="When the controller is an X5 Transmitter, the required accessories depend on the sensor connection type. Config A (Direct Sensor Module only): no extra accessories. Config B (mixed): mixed accessories. Config C (Remote Sensor only): highway cable and remote accessories."
                conditions={[
                  'Config A: X5 Direct Sensor Module only → no required accessories',
                  'Config B: mixed direct + remote → uses configs[B] accessories',
                  'Config C: X5 Remote Sensor only → highway cable + remote head',
                  'Source: controller.connectionRules.configurations',
                ]}
                result="BomComponent[] (role=accessory)"
                ruleIds={['X5-CONFIG-A', 'X5-CONFIG-B', 'X5-CONFIG-C']}
                clauses={['connectionRules.configurations.A/B/C', 'requiredAccessories[]']}
                color="purple"
              />

              <RulePathCard
                pathId="LC"
                title="Location Accessories (duct / pipe)"
                description="For duct and pipe installations, specific mounting adapters are required. GLACIAR MIDI in duct: code 62-9041 adapter per detector. GLACIAR MIDI in pipe: code 62-9031 pipe adapter per detector. X5 in duct: code 3500-0104 per transmitter. X5 in pipe: code 3500-0105 per transmitter."
                conditions={[
                  'location = "duct" or "pipe"',
                  'GLACIAR MIDI duct: 62-9041 × detectorQty',
                  'GLACIAR MIDI pipe: 62-9031 × detectorQty',
                  'X5 duct: 3500-0104 × transmitterQty',
                  'X5 pipe: 3500-0105 × transmitterQty',
                ]}
                result="BomComponent[] (role=accessory, required)"
                ruleIds={['LOC-DUCT-001', 'LOC-PIPE-001']}
                clauses={['62-9041', '62-9031', '3500-0104', '3500-0105']}
                color="blue"
              />

              <RulePathCard
                pathId="OPT"
                title="Optional Accessories"
                description="Calibration kits, magnetic wands, and protection caps are added as optional BOM items (optional=true). Found via compatibleWith matching detector family and subType matching. These inflate the optionalTotal but NOT the required total."
                conditions={[
                  'calibration_kit: subType=calibration_kit or name includes "calibration kit"',
                  'magnetic_wand: subType=magnetic_wand or name includes "magnetic wand"',
                  'protection_cap: subType=protection_cap (excluding delivery caps)',
                  'All matched by compatibleWith includes detectorFamily',
                ]}
                result="BomComponent[] (optional=true)"
                ruleIds={['OPT-CAL-001', 'OPT-WAND-001', 'OPT-CAP-001']}
                clauses={['optional=true', 'optionalTotal separate from total']}
                color="amber"
              />
            </div>

            {/* Solution output */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Solution Output Format</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#0a1628] p-5">
                  <pre className="text-emerald-400 font-mono text-xs leading-relaxed">{`Solution {
  name:           string   // e.g. "GLACIAR MIDI + GC10 Controller"
  subtitle:       string   // detector.name
  tier:           string   // "premium" | "standard" | "economic"
  mode:           string   // "centralized" | "standalone"
  detector:       ProductV2
  controller:     ProductV2 | null
  controllerQty:  number
  components:     BomComponent[]
  total:          number   // required components only
  optionalTotal:  number   // optional accessories
  hasNaPrice:     boolean  // true if any required component has price=0
  alertQty:       { beacons: number, sirens: number }
  connectionLabel: string | null  // e.g. "4-20mA" or "Direct mount (Port A/B)"
}

BomComponent {
  code:       string
  name:       string
  family:     string
  type:       string
  qty:        number
  unitPrice:  number
  subtotal:   number
  role:       "detector" | "controller" | "alert" | "accessory"
  optional:   boolean
  reason?:    string  // e.g. "Config C: remote sensor cable"
  image?:     string | null
}`}</pre>
                </div>
              </div>
            </div>

            {/* Sort order */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Solution Sorting</h3>
              <p className="text-gray-600 text-sm">
                Solutions are sorted by <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">total ASC</code> (cheapest first).
                There is no 2x2 tier matrix in V2 — all compatible solutions are returned as a flat array.
                The UI can group them by tier or mode as needed.
              </p>
              <div className="bg-[#0a1628] rounded-lg p-4 mt-3">
                <pre className="text-emerald-400 font-mono text-xs leading-relaxed">{`// Final sort — cheapest required total first
solutions.sort((a, b) => a.total - b.total);

// Multiple solutions per detector:
// - 1 standalone (if detector.standalone + relay > 0)
// - N centralized (one per compatible controller)

// Typical output for R744 + 4pt:
// [
//   { name: "GLACIAR MIDI -- Standalone", mode: "standalone", tier: "premium", total: 1234 },
//   { name: "GLACIAR MIDI + GC10",        mode: "centralized", tier: "premium", total: 2100 },
//   { name: "GLACIAR RM -- Standalone",   mode: "standalone", tier: "economic", total: 890 },
// ]`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: PRODUCT TYPES & FAMILIES
            ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Product Types &amp; Families (V2 Model)</h2>
              <p className="text-gray-500 text-sm">
                The V2 product catalog replaces gas groups with individual refrigerant codes and uses new family names.
              </p>
            </div>

            {/* Product Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Product Types</h3>
                <p className="text-xs text-gray-500 mt-0.5">Each product has a type field that controls how it is used in the engine.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0a1628] text-white">
                      <th className="text-left px-4 py-2 font-medium">Type</th>
                      <th className="text-left px-4 py-2 font-medium">Role in Engine</th>
                      <th className="text-left px-4 py-2 font-medium">Key Fields</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-2 font-mono font-semibold text-blue-700">detector</td>
                      <td className="px-4 py-2 text-gray-600">Standalone detector (has relay, built-in sensor)</td>
                      <td className="px-4 py-2 text-xs text-gray-500 font-mono">refs, relay, standalone, atex, voltage, compatibleWith</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 font-mono font-semibold text-purple-700">sensor</td>
                      <td className="px-4 py-2 text-gray-600">Sensor module (connects to X5 Transmitter)</td>
                      <td className="px-4 py-2 text-xs text-gray-500 font-mono">refs, connectionRules.connectionType, compatibleWith</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono font-semibold text-green-700">controller</td>
                      <td className="px-4 py-2 text-gray-600">Control unit (GC10, X5 Transmitter, SPU, MPU)</td>
                      <td className="px-4 py-2 text-xs text-gray-500 font-mono">connectionRules.maxDetectors, maxSensorModules, beaconsNeeded</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 font-mono font-semibold text-red-700">alert</td>
                      <td className="px-4 py-2 text-gray-600">Beacon, siren, or combo alarm device</td>
                      <td className="px-4 py-2 text-xs text-gray-500 font-mono">subType (beacon/siren/beacon_siren_combo), compatibleWith</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono font-semibold text-amber-700">accessory</td>
                      <td className="px-4 py-2 text-gray-600">Adapter, cable, calibration kit, protection cap</td>
                      <td className="px-4 py-2 text-xs text-gray-500 font-mono">subType (power_adapter, calibration_kit, magnetic_wand…), compatibleWith</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detector Families */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Detector &amp; Sensor Families</h3>
                <p className="text-xs text-gray-500 mt-0.5">V2 family names — these are the exact strings used in product.family and compatibleWith[] arrays.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0a1628] text-white">
                      <th className="text-left px-4 py-2 font-medium">Family</th>
                      <th className="text-left px-4 py-2 font-medium">Type</th>
                      <th className="text-left px-4 py-2 font-medium">Tier</th>
                      <th className="text-left px-4 py-2 font-medium">Key Gases</th>
                      <th className="text-left px-4 py-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-2 font-mono font-semibold text-red-700">GLACIAR MIDI</td>
                      <td className="px-4 py-2 text-gray-600">detector</td>
                      <td className="px-4 py-2"><span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">premium</span></td>
                      <td className="px-4 py-2 text-xs text-gray-500">R744, R717, R32, R290, R134A, HFOs…</td>
                      <td className="px-4 py-2 text-xs text-gray-500">IR/EC sensor. Remote variant for duct/pipe. ATEX variants available.</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 font-mono font-semibold text-purple-700">X5 Direct Sensor Module</td>
                      <td className="px-4 py-2 text-gray-600">sensor</td>
                      <td className="px-4 py-2"><span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">premium</span></td>
                      <td className="px-4 py-2 text-xs text-gray-500">R717, R290, R32, toxic gases</td>
                      <td className="px-4 py-2 text-xs text-gray-500">Config A — direct mount on X5 Transmitter. ATEX versions. Excluded for duct/pipe.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono font-semibold text-blue-700">X5 Remote Sensor</td>
                      <td className="px-4 py-2 text-gray-600">sensor</td>
                      <td className="px-4 py-2"><span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">premium</span></td>
                      <td className="px-4 py-2 text-xs text-gray-500">R717, R290, R32, toxic gases</td>
                      <td className="px-4 py-2 text-xs text-gray-500">Config C — remote highway cable. Works for duct/pipe installations.</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 font-mono font-semibold text-green-700">GLACIAR RM</td>
                      <td className="px-4 py-2 text-gray-600">detector</td>
                      <td className="px-4 py-2"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">economic</span></td>
                      <td className="px-4 py-2 text-xs text-gray-500">R744, R32, HFCs</td>
                      <td className="px-4 py-2 text-xs text-gray-500">Room monitor. Standalone with relay. Hotels, offices.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono font-semibold text-amber-700">GLACIAR MIDI Remote</td>
                      <td className="px-4 py-2 text-gray-600">detector</td>
                      <td className="px-4 py-2"><span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">premium</span></td>
                      <td className="px-4 py-2 text-xs text-gray-500">R744, R717, R32…</td>
                      <td className="px-4 py-2 text-xs text-gray-500">Remote sensor head — used for duct and pipe detection. variant includes 'remote'.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Controller families */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Controller Families</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0a1628] text-white">
                      <th className="text-left px-4 py-2 font-medium">Family</th>
                      <th className="text-left px-4 py-2 font-medium">Max Detectors</th>
                      <th className="text-left px-4 py-2 font-medium">Alerts</th>
                      <th className="text-left px-4 py-2 font-medium">Compatible With</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-2 font-mono font-semibold">GC10 Controller</td>
                      <td className="px-4 py-2 text-gray-600 font-mono">connectionRules.maxDetectors</td>
                      <td className="px-4 py-2 text-gray-600 text-xs">beaconsNeeded=1, sirensNeeded=1</td>
                      <td className="px-4 py-2 text-gray-600 text-xs">GLACIAR MIDI, GLACIAR RM</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-2 font-mono font-semibold">X5 Transmitter</td>
                      <td className="px-4 py-2 text-gray-600 font-mono">connectionRules.maxSensorModules</td>
                      <td className="px-4 py-2 text-gray-600 text-xs">beaconsPerTransmitter, sirensPerTransmitter</td>
                      <td className="px-4 py-2 text-gray-600 text-xs">X5 Direct Sensor Module, X5 Remote Sensor</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* V2 field reference */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">V2 Product Fields (key)</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { field: 'refs: string (JSON)', desc: 'JSON array of individual refrigerant codes: ["R744"] or ["R32","R410A"]' },
                  { field: 'Application.productFamilies', desc: 'JSON array of product family names per application. Replaces the legacy per-product apps field.' },
                  { field: 'compatibleWith: string (JSON)', desc: 'JSON array of compatible product family names (detectors list controllers; alerts list detectors)' },
                  { field: 'connectionRules: string (JSON)', desc: 'JSON object: maxDetectors, maxSensorModules, beaconsNeeded, powersDetectors, configurations, etc.' },
                  { field: 'status: string', desc: 'active | planned | discontinued. Engine only uses active products.' },
                  { field: 'subType: string | null', desc: 'For accessories and alerts: power_adapter, beacon, siren, calibration_kit, magnetic_wand, etc.' },
                  { field: 'variant: string | null', desc: 'For detectors: "Remote" variant enables duct/pipe filter (GLACIAR MIDI Remote)' },
                  { field: 'tier: string', desc: 'premium | standard | economic. Stored on detector/sensor products.' },
                ].map((f) => (
                  <div key={f.field} className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3">
                    <code className="text-xs bg-[#0a1628] text-emerald-400 px-2 py-0.5 rounded font-mono shrink-0 mt-0.5">{f.field}</code>
                    <span className="text-xs text-gray-600">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source files */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Files</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { file: 'm2-engine/designer.ts', desc: 'SystemDesigner class — filter pipeline, solution assembly, BOM generation' },
                  { file: 'm2-engine/designer-types.ts', desc: 'DesignerInputs, Solution, BomComponent, ProductV2, AlertQty types' },
                  { file: 'm2-engine/selection-engine.ts', desc: 'Re-exports SystemDesigner + legacy selectProducts() for backwards compat' },
                  { file: 'api/products/route.ts', desc: 'GET /api/products?status=active — returns ProductV2[] for the engine' },
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
