"use client";

import { useState, useEffect } from "react";

/* ── Types ── */
interface ArchData {
  db: {
    products: { total: number; detectors: number; controllers: number; accessories: number };
    refrigerants: number;
    applications: number;
    spaceTypes: number;
    gasCategories: number;
    discountRules: number;
    quotes: { total: number; draft: number; sent: number; accepted: number };
    calcSheets: number;
  };
  pages: { public: number; admin: number; total: number };
  api: { public: number; auth: number; total: number };
  models: number;
  regulations: number;
}

/* ── Collapsible Section ── */
function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 w-full text-left py-1">
        <span className={`text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
        {title}
      </button>
      {open && <div className="mt-2 ml-5">{children}</div>}
    </div>
  );
}

/* ── Variable Table ── */
function VarTable({ rows }: { rows: { name: string; type: string; unit?: string; source?: string; note?: string }[] }) {
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="text-left text-[10px] text-gray-400 uppercase">
          <th className="py-1 px-2">Variable</th>
          <th className="py-1 px-2">Type</th>
          <th className="py-1 px-2">Unit</th>
          <th className="py-1 px-2">Source / Note</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="border-t border-gray-100 hover:bg-gray-50">
            <td className="py-1 px-2 font-mono text-purple-700">{r.name}</td>
            <td className="py-1 px-2"><span className="bg-purple-50 text-purple-600 px-1 rounded text-[10px]">{r.type}</span></td>
            <td className="py-1 px-2">{r.unit ? <span className="bg-sky-50 text-sky-700 px-1 rounded text-[10px]">{r.unit}</span> : "—"}</td>
            <td className="py-1 px-2 text-gray-500">{r.source || r.note || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Tabs ── */
const TABS = ["Overview", "Organigramme", "Variables", "Details", "Changes"] as const;
type Tab = (typeof TABS)[number];

/* ── Main Component ── */
export default function ArchitectureOverview({ defaultExpanded = false }: { defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [tab, setTab] = useState<Tab>("Overview");
  const [data, setData] = useState<ArchData | null>(null);

  useEffect(() => {
    if (expanded && !data) {
      fetch("/api/architecture").then((r) => r.json()).then(setData).catch(() => {});
    }
  }, [expanded, data]);

  const d = data?.db;

  return (
    <div className="mb-6">
      {!defaultExpanded && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white text-sm font-semibold hover:opacity-90 transition-opacity w-full justify-between"
        >
          <span>Architecture Overview</span>
          <span className="text-xs text-gray-400">{expanded ? "▲ collapse" : "▼ expand"}</span>
        </button>
      )}

      {expanded && (
        <div className={`${defaultExpanded ? "" : "mt-2"} rounded-xl border border-gray-200 bg-white overflow-hidden`}>
          {/* Stats Bar */}
          <div className="grid grid-cols-6 gap-px bg-gray-100">
            {[
              { value: d ? data.pages.total + 1 : "—", label: "Pages", sub: d ? `${data.pages.public} public · ${data.pages.admin + 1} admin` : "" },
              { value: d ? data.api.total + 1 : "—", label: "API Routes", sub: d ? `${data.api.public} public · ${data.api.auth + 1} auth` : "" },
              { value: d ? data.models : "—", label: "DB Models", sub: "6 seed · 3 runtime" },
              { value: d ? d.products.total : "—", label: "Products", sub: d ? `${d.products.detectors} det · ${d.products.controllers} ctrl · ${d.products.accessories} acc` : "" },
              { value: d ? d.refrigerants : "—", label: "Refrigerants", sub: d ? `${d.gasCategories} categories` : "" },
              { value: data?.regulations ?? "—", label: "Regulations", sub: "EN378 · ASHRAE · ISO" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-3 text-center">
                <div className="text-xl font-extrabold text-[#16354B]">{s.value}</div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">{s.label}</div>
                <div className="text-[9px] text-gray-300">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3 pb-2 border-b border-gray-100">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  tab === t ? "bg-[#16354B] text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {tab === "Overview" && <OverviewTab />}
            {tab === "Organigramme" && <OrgTab />}
            {tab === "Variables" && <VariablesTab />}
            {tab === "Details" && <DetailsTab data={data} />}
            {tab === "Changes" && <ChangesTab />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════ TAB: Overview ═══════ */
function OverviewTab() {
  const blocks = [
    { title: "Public", color: "#A7C031", items: ["Calculator (5 steps)", "Selector (4 steps)", "Products catalog", "Homepage"] },
    { title: "M1 Engine", color: "#E63946", items: ["EN 378 rules", "ASHRAE 15 rules", "ISO 5149 rules", "Alarm thresholds", "Ventilation calc"] },
    { title: "Database", color: "#3b82f6", items: ["Refrigerants", "Applications", "Products", "Discount rules", "Quotes & sheets"] },
    { title: "M2 Engine", color: "#E63946", items: ["F0–F9 filters", "Detector selection", "Controller match", "BOM assembly", "3-tier scoring"] },
    { title: "Output", color: "#f59e0b", items: ["3-tier BOM", "Pricing + discounts", "PDF quotes", "Calc sheets", "Audit trail"] },
  ];
  return (
    <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
      {blocks.map((b, i) => (
        <div key={b.title} className="flex items-stretch">
          {i > 0 && <div className="flex items-center px-2 text-gray-300 text-lg">→</div>}
          <div className="border-2 rounded-lg p-3 min-w-[140px]" style={{ borderColor: b.color }}>
            <h3 className="text-xs font-bold mb-2" style={{ color: b.color }}>{b.title}</h3>
            <ul className="space-y-0.5">
              {b.items.map((item) => (
                <li key={item} className="text-[10px] text-gray-500 before:content-['›_'] before:text-gray-300">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════ TAB: Organigramme ═══════ */
function OrgBox({ label, sub, color }: { label: string; sub: string; color: string }) {
  return (
    <div className="px-4 py-2 rounded-lg text-white text-center text-xs font-semibold" style={{ background: color }}>
      {label}
      <div className="font-normal text-[9px] opacity-80 mt-0.5">{sub}</div>
    </div>
  );
}

function OrgTab() {
  return (
    <div className="flex flex-col items-center gap-1 text-xs">
      <OrgBox label="User Input" sub="Client + Gas + Zones" color="#A7C031" />
      <div className="text-gray-300">↓</div>
      <OrgBox label="API Fetch" sub="/api/refrigerants-v5 · /api/applications · /api/space-types" color="#3b82f6" />
      <div className="text-gray-300">↓</div>
      <OrgBox label="RegulationInput" sub="charge + volume + flags + refrigerant" color="#A7C031" />
      <div className="text-gray-300">↓</div>
      <OrgBox label="M1 Engine — evaluateRegulation()" sub="Per zone × per regulation" color="#E63946" />
      <div className="text-gray-300">↓ ↓ ↓</div>
      <div className="flex gap-3">
        <OrgBox label="EN 378" sub="Paths A→G · C.3 Table" color="#E63946" />
        <OrgBox label="ASHRAE 15" sub="Occupancy · Exemptions" color="#E63946" />
        <OrgBox label="ISO 5149" sub="International · RCL" color="#E63946" />
      </div>
      <div className="w-48 h-px bg-gray-200 my-1" />
      <div className="text-gray-300">↓</div>
      <OrgBox label="RegulationResult" sub="detection · qty · placement · thresholds · alarms · ventilation · trace" color="#E63946" />
      <div className="text-gray-300">↓</div>
      <div className="flex gap-3 items-center">
        <OrgBox label="Product DB" sub="227 products" color="#3b82f6" />
        <OrgBox label="M2 Engine — selectionEngine()" sub="F0→F9 · scoring /21" color="#f59e0b" />
      </div>
      <div className="text-gray-300">↓</div>
      <div className="flex gap-3">
        <OrgBox label="Premium" sub="Best specs" color="#f59e0b" />
        <OrgBox label="Standard" sub="Mid-range" color="#f59e0b" />
        <OrgBox label="Centralized" sub="Lowest cost" color="#f59e0b" />
      </div>
      <div className="w-48 h-px bg-gray-200 my-1" />
      <div className="text-gray-300">↓</div>
      <OrgBox label="M3 Pricing" sub="Discount matrix · Customer group · Net prices" color="#22c55e" />
      <div className="text-gray-300">↓</div>
      <div className="flex gap-3">
        <OrgBox label="PDF Quote" sub="jsPDF" color="#16354B" />
        <OrgBox label="Calc Sheet" sub="Save to DB" color="#16354B" />
        <OrgBox label="Audit Trail" sub="Traceability" color="#16354B" />
      </div>
    </div>
  );
}

/* ═══════ TAB: Variables ═══════ */
function VariablesTab() {
  return (
    <div>
      <Section title="Constants" defaultOpen>
        <VarTable rows={[
          { name: "AIR_DENSITY_25C", type: "number", unit: "kg/m³", source: "1.18 — placement calc" },
          { name: "MOLAR_VOLUME", type: "number", unit: "L/mol", source: "24.45 — ppm conversion (25°C, 101.3 kPa)" },
          { name: "MAX_DETECTOR_DIST", type: "number", unit: "m", source: "7 — cluster distance" },
          { name: "M2_PER_DETECTOR", type: "number", unit: "m²", source: "50 — area-based quantity" },
        ]} />
      </Section>

      <Section title="M1 Input — RegulationInput" defaultOpen>
        <VarTable rows={[
          { name: "charge", type: "number", unit: "kg", source: "Zone config" },
          { name: "roomArea", type: "number", unit: "m²", source: "Zone config" },
          { name: "roomHeight", type: "number", unit: "m", source: "Zone config" },
          { name: "roomVolume", type: "number", unit: "m³", source: "Derived (area × height)" },
          { name: "refrigerant", type: "RefrigerantV5", source: "DB lookup" },
          { name: "accessCategory", type: "'a'|'b'|'c'", source: "Regulatory — worker access" },
          { name: "locationClass", type: "'I'|'II'|'III'|'IV'", source: "Regulatory — EN 378 location" },
          { name: "isMachineryRoom", type: "boolean", source: "Regulatory flag" },
          { name: "isOccupiedSpace", type: "boolean", source: "Regulatory flag" },
          { name: "belowGround", type: "boolean", source: "Regulatory flag" },
          { name: "humanComfort", type: "boolean", source: "Regulatory flag" },
          { name: "c3Applicable", type: "boolean", source: "EN378 C.3 table" },
          { name: "mechanicalVentilation", type: "boolean", source: "Regulatory flag" },
        ]} />
      </Section>

      <Section title="M1 Refrigerant — RefrigerantV5">
        <VarTable rows={[
          { name: "safetyClass", type: "string", note: "A1, A2L, A2, A3, B1, B2L..." },
          { name: "atelOdl", type: "number|null", unit: "kg/m³", note: "Toxicity limit → alarm basis" },
          { name: "lfl", type: "number|null", unit: "kg/m³", note: "Flammability limit → alarm basis" },
          { name: "practicalLimit", type: "number", unit: "kg/m³", note: "RCL — max safe concentration" },
          { name: "vapourDensity", type: "number", unit: "kg/m³", note: "Placement (floor/ceiling)" },
          { name: "molecularMass", type: "number", unit: "g/mol", note: "ppm conversion" },
          { name: "gasGroup", type: "string", note: "CO2, HFC1, NH3... → M2 matching" },
        ]} />
      </Section>

      <Section title="M1 Output — RegulationResult">
        <VarTable rows={[
          { name: "detectionRequired", type: "'YES'|'NO'|'MANUAL_REVIEW'|'RECOMMENDED'", note: "Final decision" },
          { name: "minDetectors", type: "number", note: "Normative minimum" },
          { name: "recommendedDetectors", type: "number", note: "Engineering recommendation" },
          { name: "thresholdPpm", type: "number", unit: "ppm", note: "Alarm trigger" },
          { name: "placementHeight", type: "'floor'|'ceiling'|'breathing_zone'", note: "Vapour density based" },
          { name: "alarmThresholds.alarm1", type: "number", unit: "ppm", note: "min(50% ATEL, 25% LFL)" },
          { name: "alarmThresholds.alarm2", type: "number", unit: "ppm", note: "2 × alarm1" },
          { name: "alarmThresholds.cutoff", type: "number", unit: "ppm", note: "max(RCL, alarm2)" },
          { name: "ventilation.flowRateM3s", type: "number", unit: "m³/s", note: "0.14 × √(charge)" },
          { name: "quantityMode", type: "'area'|'cluster'", note: "50m²/det or source clusters" },
        ]} />
      </Section>

      <Section title="M2 Input — SelectionInput">
        <VarTable rows={[
          { name: "totalDetectors", type: "number", source: "M1 output" },
          { name: "selectedRefrigerant", type: "string", source: "Config step 2" },
          { name: "sitePowerVoltage", type: "'12V'|'24V'|'230V'", source: "Config step 2" },
          { name: "zoneAtex", type: "boolean", source: "Config step 2" },
          { name: "outputRequired", type: "string", source: "relay / analog / modbus" },
          { name: "mountingType", type: "'ambient'|'duct'|'pipe_valve'", source: "Detection Location — ambient/duct/pipe" },
          { name: "customerGroup", type: "string", source: "Config step 1 (EDC/OEM/...)" },
        ]} />
      </Section>

      <Section title="M2 Filter Pipeline — F0→F9">
        <VarTable rows={[
          { name: "F0 Gas", type: "filter", note: "product.gas vs gasGroup" },
          { name: "F1 Ref", type: "filter", note: "product.refs vs selectedRefrigerant" },
          { name: "F2 App", type: "filter", note: "product.apps vs zoneType" },
          { name: "F3 Range", type: "filter", note: "product.range vs selectedRange" },
          { name: "F4 Output", type: "filter", note: "product.relay/analog/modbus" },
          { name: "F5 Voltage", type: "filter", note: "product.voltage vs sitePowerVoltage" },
          { name: "F6 Detection Location", type: "filter", note: "ambient=all, duct=MIDI remote only, pipe=MIDI remote+Aquis" },
          { name: "F7 ATEX", type: "filter", note: "product.atex vs zoneAtex" },
          { name: "F8 Standalone", type: "filter", note: "product.standalone requirement" },
          { name: "F9 Score", type: "scoring", note: "21-point → tier assignment" },
        ]} />
      </Section>

      <Section title="M3 Pricing — Formulas">
        <VarTable rows={[
          { name: "Net price", type: "formula", note: "(listPrice × qty) × (1 − discountPct/100)" },
          { name: "Discount lookup", type: "formula", note: "matrix[customerGroup][productGroup]" },
          { name: "Alarm threshold", type: "formula", unit: "ppm", note: "min(50% ATEL_ppm, 25% LFL_ppm)" },
          { name: "Ventilation", type: "formula", unit: "m³/s", note: "0.14 × √(charge_kg)" },
          { name: "ppm conversion", type: "formula", unit: "ppm", note: "(MOLAR_VOL × conc × 1e6) / molMass" },
          { name: "Charge M1", type: "formula", unit: "kg", note: "4 × LFL × volume" },
          { name: "Charge M2", type: "formula", unit: "kg", note: "26 × LFL × volume" },
          { name: "Charge M3", type: "formula", unit: "kg", note: "130 × LFL × volume" },
        ]} />
      </Section>
    </div>
  );
}

/* ═══════ TAB: Details ═══════ */
function DetailsTab({ data }: { data: ArchData | null }) {
  const d = data?.db;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="border border-gray-100 rounded-lg p-3">
        <h3 className="text-xs font-bold mb-2 text-gray-700">Pages & Routes</h3>
        <table className="w-full text-[11px]">
          <tbody>
            {[
              ["/", "Homepage", "public"],
              ["/calculator", "Calculator", "public"],
              ["/selector", "Selector", "public"],
              ["/products", "Catalog", "public"],
              ["/login", "Auth", "public"],
              ["/sales", "Dashboard", "sales+"],
              ["/sales/quotes", "Quotes", "sales+"],
              ["/admin", "Dashboard", "admin"],
              ["/admin/architecture", "Architecture", "admin"],
            ].map(([route, label, auth]) => (
              <tr key={route} className="border-t border-gray-50">
                <td className="py-1 font-mono text-[10px] text-gray-500">{route}</td>
                <td className="py-1 text-gray-600">{label}</td>
                <td className="py-1"><span className={`text-[9px] font-semibold px-1 rounded ${auth === "public" ? "bg-green-50 text-green-700" : auth === "admin" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{auth}</span></td>
              </tr>
            ))}
            <tr className="border-t border-gray-50"><td colSpan={3} className="py-1 text-[9px] text-gray-300">+ 9 admin sub-pages</td></tr>
          </tbody>
        </table>
      </div>

      <div className="border border-gray-100 rounded-lg p-3">
        <h3 className="text-xs font-bold mb-2 text-gray-700">DB Models — Live Counts</h3>
        <table className="w-full text-[11px]">
          <tbody>
            {d ? [
              ["Product", d.products.total, "seed"],
              ["RefrigerantV5", d.refrigerants, "seed"],
              ["DiscountMatrix", d.discountRules, "seed"],
              ["Application", d.applications, "seed"],
              ["SpaceType", d.spaceTypes, "seed"],
              ["GasCategory", d.gasCategories, "seed"],
              ["Quote", d.quotes.total, "runtime"],
              ["CalcSheet", d.calcSheets, "runtime"],
            ].map(([model, count, type]) => (
              <tr key={String(model)} className="border-t border-gray-50">
                <td className="py-1 text-gray-600">{model}</td>
                <td className="py-1 font-bold text-gray-800">{count}</td>
                <td className="py-1"><span className={`text-[9px] px-1 rounded ${type === "seed" ? "bg-gray-100 text-gray-500" : "bg-blue-50 text-blue-600"}`}>{type}</span></td>
              </tr>
            )) : <tr><td colSpan={3} className="py-2 text-gray-400 text-center">Loading...</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="border border-gray-100 rounded-lg p-3">
        <h3 className="text-xs font-bold mb-2 text-gray-700">API Endpoints</h3>
        <table className="w-full text-[11px]">
          <tbody>
            {[
              ["/api/products", "GET POST PUT DEL", "mixed"],
              ["/api/refrigerants-v5", "GET", "public"],
              ["/api/quotes", "GET POST", "sales+"],
              ["/api/gas-categories", "GET POST PUT DEL", "mixed"],
              ["/api/discount-matrix", "GET POST PUT DEL", "admin"],
              ["/api/login", "POST", "public"],
              ["/api/architecture", "GET", "admin"],
            ].map(([ep, methods, auth]) => (
              <tr key={ep} className="border-t border-gray-50">
                <td className="py-1 font-mono text-[10px] text-gray-500">{ep}</td>
                <td className="py-1 text-[9px] text-gray-400">{methods}</td>
                <td className="py-1"><span className={`text-[9px] font-semibold px-1 rounded ${auth === "public" ? "bg-green-50 text-green-700" : auth === "admin" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{auth}</span></td>
              </tr>
            ))}
            <tr className="border-t border-gray-50"><td colSpan={3} className="py-1 text-[9px] text-gray-300">+ 7 more endpoints</td></tr>
          </tbody>
        </table>
      </div>

      <div className="border border-gray-100 rounded-lg p-3">
        <h3 className="text-xs font-bold mb-2 text-gray-700">Engines & Tests</h3>
        <table className="w-full text-[11px]">
          <tbody>
            {[
              ["M1 Core Physics", "core.ts", "52"],
              ["M1 EN 378", "en378.ts", "28"],
              ["M1 ASHRAE 15", "ashrae15.ts", "18"],
              ["M1 ISO 5149", "iso5149.ts", "14"],
              ["M2 Selection", "selection-engine.ts", "22"],
              ["M2 BOM Builder", "build-bom.ts", "12"],
              ["M3 Pricing", "pricing-engine.ts", "8"],
            ].map(([name, file, tests]) => (
              <tr key={name} className="border-t border-gray-50">
                <td className="py-1 font-semibold text-gray-600">{name}</td>
                <td className="py-1 font-mono text-[10px] text-gray-400">{file}</td>
                <td className="py-1"><span className="bg-green-50 text-green-700 text-[9px] font-semibold px-1.5 rounded">{tests}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════ TAB: Changes ═══════ */
function ChangesTab() {
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700">Tests: 154/154</span>
        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700">Lint: 55 warnings</span>
        <span className="px-3 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700">Build: green</span>
      </div>
      <div className="space-y-2">
        {[
          { icon: "🔀", text: "Route /configurator → /calculator + redirect 301", meta: "Aligned URL with UI label" },
          { icon: "🏷️", text: 'Rebranded: "SAMON AB" → "SafeRef" everywhere (~40 occurrences)', meta: "i18n, engines, PDF, footer, disclaimers" },
          { icon: "🌐", text: "i18n unified: global language context across all pages", meta: "Calculator + Selector use I18nProvider cookie" },
          { icon: "🔒", text: "Public navbar: Sales/Admin hidden → discreet login icon", meta: "page.tsx" },
          { icon: "📊", text: "Architecture Overview page added (/admin/architecture)", meta: "5 tabs: Overview, Organigramme, Variables, Details, Changes" },
          { icon: "📋", text: "CalcSheet UX: single threshold, Continue to Products CTA, Save removed", meta: "StepCalcSheet.tsx" },
          { icon: "🛒", text: "Step 5 Products: list prices only, photos, disclaimer, no discounts", meta: "StepTieredBOM.tsx, StepProducts.tsx" },
          { icon: "📝", text: 'Request a Quote: business form (VAT, company type, address, comments)', meta: "Replaces Generate Quote — feeds Sales pipeline" },
          { icon: "📄", text: "PDF complete report: calc results + product BOM + pricing", meta: "StepTieredBOM.tsx handleDownloadReport" },
          { icon: "🎯", text: 'Detection Location replaces Mounting Type (ambient/duct/pipe_valve)', meta: "M2 filter: MIDI remote for duct/pipe, X5 ambient only" },
          { icon: "👤", text: "Selector: +Client step with RGPD, redesigned all steps", meta: "SelectorWizard.tsx, StepAppGas, StepTechnical, StepZoneQty" },
          { icon: "📊", text: "Dashboard: +Recent Quotes table, +Quotes KPI card", meta: "admin/page.tsx" },
          { icon: "🧪", text: "Gas Categories: HFC→HFC & HFO, refrigerants clickable, coverage removed", meta: "admin/gas/page.tsx" },
          { icon: "🏭", text: "Applications: families from DB (dynamic), all labels EN", meta: "admin/applications/page.tsx" },
          { icon: "🇬🇧", text: "All admin pages switched to English", meta: "Applications, Space Types, Engine, TestLab" },
          { icon: "⚠️", text: "5 bugs open: M-4, N-1, N-4, N-5, voltage", meta: "Non-critical, pending fix" },
        ].map((c, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50">
            <span className="text-sm">{c.icon}</span>
            <div>
              <div className="text-xs text-gray-700">{c.text}</div>
              <div className="text-[10px] text-gray-400">{c.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
