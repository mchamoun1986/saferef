"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import type { GasAppData } from "./types";
import { Flame, Gauge, ShieldAlert, Search, Check, X, ChevronDown } from "lucide-react";
import { type Lang, GAS_APP, MOUNTING_TYPES } from "./i18n";
import { AVAILABLE_REGULATIONS } from "@/lib/rules";

interface AppItem {
  id: string;
  labelFr: string;
  labelEn: string;
  icon: string;
  suggestedGases?: string;   // JSON: ["co2","hfc1"]
  defaultRanges?: string;    // JSON: {"R744":"0-10000ppm"}
}

interface StepGasAppProps {
  data: GasAppData;
  onChange: (data: GasAppData) => void;
  refrigerants: { id: string; name: string; safetyClass: string; gasGroup: string }[];
  applications?: AppItem[];
  lang?: Lang;
  country?: string;
}

const mountingTypes = MOUNTING_TYPES;

const voltageOptions: { value: "12V" | "24V" | "230V"; label: string }[] = [
  { value: "12V", label: "12V" },
  { value: "24V", label: "24V" },
  { value: "230V", label: "230V" },
];

/** Fallback applications when DB provides none */
const fallbackApplications: { id: string; labelFr: string; labelEn: string; icon: string }[] = [
  { id: "supermarket", labelFr: "Supermarch\u00e9", labelEn: "Supermarket", icon: "\ud83d\uded2" },
  { id: "cold_room", labelFr: "Chambre froide", labelEn: "Cold Room", icon: "\u2744\ufe0f" },
  { id: "machinery_room", labelFr: "Salle des machines", labelEn: "Machinery Room", icon: "\u2699\ufe0f" },
  { id: "cold_storage", labelFr: "Entrep\u00f4t frigorifique", labelEn: "Cold Storage", icon: "\ud83c\udfed" },
  { id: "hotel", labelFr: "H\u00f4tel", labelEn: "Hotel", icon: "\ud83c\udfe8" },
  { id: "office", labelFr: "Bureau", labelEn: "Office", icon: "\ud83c\udfe2" },
  { id: "parking", labelFr: "Parking", labelEn: "Parking", icon: "\ud83c\udd7f\ufe0f" },
  { id: "ice_rink", labelFr: "Patinoire", labelEn: "Ice Rink", icon: "\u26f8\ufe0f" },
  { id: "heat_pump", labelFr: "Pompe \u00e0 chaleur", labelEn: "Heat Pump", icon: "\u2668\ufe0f" },
  { id: "water_brine", labelFr: "Eau / Saumure", labelEn: "Water / Brine", icon: "\ud83d\udca7" },
];

/** Refrigerants with multiple detection ranges */
const REF_RANGES: Record<string, { value: string; label: string }[]> = {
  R717: [
    { value: '0-100ppm', label: '0-100 ppm (early warning / comfort)' },
    { value: '0-500ppm', label: '0-500 ppm (standard monitoring)' },
    { value: '0-1000ppm', label: '0-1000 ppm (industrial standard)' },
    { value: '0-5000ppm', label: '0-5000 ppm (high concentration)' },
  ],
  R744: [
    { value: '0-10000ppm', label: '0-10,000 ppm (standard)' },
    { value: '0-5000ppm', label: '0-5,000 ppm (X5)' },
    { value: '0-30000ppm', label: '0-30,000 ppm (high range)' },
    { value: '0-5%vol', label: '0-5% vol (very high)' },
  ],
  CO: [
    { value: '0-100ppm', label: '0-100 ppm (X5)' },
    { value: '0-300ppm', label: '0-300 ppm (TR)' },
  ],
  NO2: [
    { value: '0-5ppm', label: '0-5 ppm (X5)' },
    { value: '0-20ppm', label: '0-20 ppm (TR)' },
  ],
};

/** Parse defaultRanges from DB app, with fallback */
function getAppDefaultRanges(app: AppItem | null | undefined): Record<string, string> {
  if (!app?.defaultRanges) return {};
  try { return JSON.parse(app.defaultRanges); } catch { return {}; }
}

/** Parse suggestedGases from DB app */
function getAppSuggestedGases(app: AppItem | null | undefined): string[] {
  if (!app?.suggestedGases) return [];
  try { return JSON.parse(app.suggestedGases); } catch { return []; }
}

/** Map gas group codes to refrigerant IDs. Keys are stored lowercase; look-up
 *  normalizes the incoming code so either case works (DB historically stores
 *  applications.suggestedGases as lowercase but refrigerant.gasGroup as UPPERCASE). */
const GAS_GROUP_TO_REFS: Record<string, string[]> = {
  co2: ['R744'],
  nh3: ['R717'],
  r290: ['R290'],
  hfc1: ['R-404A', 'R-407C', 'R-410A', 'R-134a', 'R32'],
  hfc2: ['R-448A', 'R-449A', 'R-452A', 'R-513A', 'R1234yf', 'R1234ze(E)'],
  co: ['CO'],
  no2: ['NO2'],
  o2: ['O2'],
};

function refsForGasGroup(code: string): string[] {
  return GAS_GROUP_TO_REFS[code.toLowerCase()] ?? [];
}

/** Common refrigerants shown first */
const COMMON_REFS = new Set(["R-404A", "R-407C", "R-410A", "R-134a", "R744", "R32", "R290", "R717"]);
/** Natural refrigerants */
const NATURAL_REFS = new Set(["R290", "R717", "R744", "R600a", "R1270", "R1150", "R50"]);
/** Toxic / special gases */
const TOXIC_REFS = new Set(["CO", "NO2", "O2"]);

/** Refrigerants that have multiple detection ranges */
const RANGE_REFRIGERANTS = new Set(Object.keys(REF_RANGES));

/** Safety class badge color */
function safetyBadgeColor(sc: string): string {
  const upper = sc.toUpperCase();
  if (upper === "A1") return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (upper === "A2L") return "bg-amber-100 text-amber-700 border-amber-300";
  if (upper === "A2") return "bg-orange-100 text-orange-700 border-orange-300";
  if (upper === "A3") return "bg-red-100 text-red-700 border-red-300";
  if (upper === "B1") return "bg-blue-100 text-blue-700 border-blue-300";
  if (upper === "B2L") return "bg-pink-100 text-pink-700 border-pink-300";
  if (upper === "B2") return "bg-rose-100 text-rose-700 border-rose-300";
  if (upper === "B3") return "bg-red-200 text-red-800 border-red-400";
  return "bg-gray-100 text-gray-600 border-gray-300";
}

/** Categorize a refrigerant into groups */
function categorizeRef(r: { id: string; gasGroup: string }): string[] {
  const cats: string[] = [];
  if (COMMON_REFS.has(r.id)) cats.push("common");
  if (NATURAL_REFS.has(r.id)) cats.push("natural");
  if (TOXIC_REFS.has(r.id)) cats.push("toxic");
  const gg = (r.gasGroup ?? "").toUpperCase();
  if (gg.includes("HFC") || gg.includes("HFO") || gg === "HFC1" || gg === "HFC2") {
    cats.push("hfc_hfo");
  }
  if (cats.length === 0) cats.push("hfc_hfo");
  return cats;
}

export default function StepGasApp({
  data,
  onChange,
  refrigerants,
  applications,
  lang = "en",
  country,
}: StepGasAppProps) {
  const [refSearch, setRefSearch] = useState("");
  const [refOpen, setRefOpen] = useState(false);
  const refDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (refDropdownRef.current && !refDropdownRef.current.contains(e.target as Node)) {
        setRefOpen(false);
      }
    }
    if (refOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [refOpen]);

  // Applications: DB or fallback
  const appList = applications && applications.length > 0 ? applications : fallbackApplications as AppItem[];

  // Selected application object (with suggestedGases/defaultRanges)
  const selectedApp = useMemo(() => {
    if (!data.zoneType) return null;
    return appList.find(a => a.id === data.zoneType) ?? null;
  }, [data.zoneType, appList]);

  // DB-driven default ranges for the selected app
  const appDefaultRanges = useMemo(() => getAppDefaultRanges(selectedApp), [selectedApp]);

  // Suggested refrigerant IDs from the selected app's suggestedGases
  const suggestedRefIds = useMemo(() => {
    const gases = getAppSuggestedGases(selectedApp);
    const ids = new Set<string>();
    for (const g of gases) {
      refsForGasGroup(g).forEach(r => ids.add(r));
    }
    return ids;
  }, [selectedApp]);

  const update = <K extends keyof GasAppData>(field: K, value: GasAppData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const inputClass =
    "w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors";

  const labelClass = "block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5";

  // Does the selected refrigerant have multiple detection ranges?
  const hasRangeOptions = useMemo(() => {
    if (!data.selectedRefrigerant) return false;
    return RANGE_REFRIGERANTS.has(data.selectedRefrigerant);
  }, [data.selectedRefrigerant]);

  // Available ranges for the current refrigerant
  const rangeOptions = useMemo(() => {
    if (!hasRangeOptions) return [];
    return REF_RANGES[data.selectedRefrigerant] ?? [];
  }, [hasRangeOptions, data.selectedRefrigerant]);

  // Recommended range based on application + refrigerant (from DB)
  const recommendedRange = useMemo(() => {
    if (!data.selectedRefrigerant) return null;
    return appDefaultRanges[data.selectedRefrigerant] ?? null;
  }, [appDefaultRanges, data.selectedRefrigerant]);

  // When refrigerant changes, auto-select recommended range from DB
  const handleRefrigerantChange = (refId: string) => {
    const newData: GasAppData = { ...data, selectedRefrigerant: refId };
    if (RANGE_REFRIGERANTS.has(refId)) {
      const defaultRange = appDefaultRanges[refId];
      newData.selectedRange = defaultRange ?? "";
    } else {
      newData.selectedRange = "";
    }
    onChange(newData);
  };

  // When zone changes, update recommended range from the new app's DB defaults
  const handleZoneChange = (zone: string) => {
    const newData: GasAppData = { ...data, zoneType: zone };
    if (data.selectedRefrigerant && RANGE_REFRIGERANTS.has(data.selectedRefrigerant)) {
      const newApp = appList.find(a => a.id === zone);
      const ranges = getAppDefaultRanges(newApp);
      if (ranges[data.selectedRefrigerant]) {
        newData.selectedRange = ranges[data.selectedRefrigerant];
      }
    }
    onChange(newData);
  };

  // ── Translations ─────────────────────────────────────────────────────────
  const t = GAS_APP[lang];

  // ── Grouped & filtered refrigerants ──────────────────────────────────────
  const searchLower = refSearch.toLowerCase().trim();

  const filteredRefs = useMemo(() => {
    if (!searchLower) return refrigerants;
    return refrigerants.filter(
      (r) =>
        r.id.toLowerCase().includes(searchLower) ||
        r.name.toLowerCase().includes(searchLower) ||
        r.safetyClass.toLowerCase().includes(searchLower)
    );
  }, [refrigerants, searchLower]);

  const groupedRefs = useMemo(() => {
    const recommendedLabel = lang === 'fr' ? '\u2b50 Recommande pour cette application' : '\u2b50 Recommended for this application';
    const groups: {
      key: string;
      label: string;
      refs: typeof refrigerants;
    }[] = [
      ...(suggestedRefIds.size > 0 ? [{ key: "recommended", label: recommendedLabel, refs: [] as typeof refrigerants }] : []),
      { key: "common", label: t.groupCommon, refs: [] },
      { key: "hfc_hfo", label: t.groupHfcHfo, refs: [] },
      { key: "natural", label: t.groupNatural, refs: [] },
      { key: "toxic", label: t.groupToxic, refs: [] },
    ];

    const groupMap = new Map(groups.map((g) => [g.key, g]));
    const added = new Map<string, Set<string>>();

    for (const r of filteredRefs) {
      // Add to recommended group if applicable
      if (suggestedRefIds.has(r.id)) {
        const recGroup = groupMap.get("recommended");
        if (recGroup) {
          if (!added.has("recommended")) added.set("recommended", new Set());
          if (!added.get("recommended")!.has(r.id)) {
            added.get("recommended")!.add(r.id);
            recGroup.refs.push(r);
          }
        }
      }

      const cats = categorizeRef(r);
      for (const cat of cats) {
        const group = groupMap.get(cat);
        if (group) {
          if (!added.has(cat)) added.set(cat, new Set());
          if (!added.get(cat)!.has(r.id)) {
            added.get(cat)!.add(r.id);
            group.refs.push(r);
          }
        }
      }
    }

    return groups.filter((g) => g.refs.length > 0);
  }, [filteredRefs, suggestedRefIds, lang]);

  // Selected refrigerant object
  const selectedRefObj = useMemo(() => {
    if (!data.selectedRefrigerant) return null;
    return refrigerants.find((r) => r.id === data.selectedRefrigerant) ?? null;
  }, [data.selectedRefrigerant, refrigerants]);

  return (
    <div className="space-y-5">

      {/* ── 0. Regulation Standard ─────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5">
        <div className="text-sm font-semibold text-[#16354B] mb-2">
          {lang === 'fr' ? 'Norme réglementaire' : 'Regulation Standard'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AVAILABLE_REGULATIONS.map(reg => (
            <button
              key={reg.id}
              type="button"
              onClick={() => onChange({ ...data, regulation: reg.id as GasAppData['regulation'] })}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                data.regulation === reg.id
                  ? 'border-[#E63946] bg-[#E63946]/5 shadow-md'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <span className="text-xl">{reg.flag}</span>
              <span className="text-xs font-bold text-[#16354B]">{reg.name}</span>
              <span className="text-[10px] text-[#6b8da5]">{reg.region}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. Gas Detection ────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-5">
        <h3 className="text-base font-bold text-[#16354B] flex items-center gap-2.5">
          <span className="w-1 h-5 bg-[#E21C1F] rounded-full flex-shrink-0" />
          <Flame className="w-4 h-4 text-[#E21C1F]" />
          {t.gasDetection}
        </h3>

        {/* ── Application Cards Grid ────────────────────────────── */}
        <div>
          <label className={labelClass}>{t.application}</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {appList.map((app) => {
              const isSelected = data.zoneType === app.id;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleZoneChange(app.id)}
                  className={`relative flex flex-col items-center justify-center gap-1.5 px-3 py-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#16354B] text-white border-[#16354B] shadow-md"
                      : "bg-white text-[#16354B] border-[#e2e8f0] hover:border-[#16354B]/40 hover:shadow-sm"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-[#16354B]" />
                    </span>
                  )}
                  <span className="text-2xl leading-none">{app.icon}</span>
                  <span className="text-xs font-semibold leading-tight">
                    {lang === "fr" ? app.labelFr : app.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Refrigerant Searchable Selector ───────────────────── */}
        <div>
          <label className={labelClass}>{t.refrigerant}</label>

          {/* Selected chip */}
          {selectedRefObj && (
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-2 bg-[#16354B] text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
                <span>{selectedRefObj.id}</span>
                <span className="text-white/70">&mdash;</span>
                <span className="text-white/90 font-normal">{selectedRefObj.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${safetyBadgeColor(selectedRefObj.safetyClass)}`}>
                  {selectedRefObj.safetyClass}
                </span>
                <button
                  type="button"
                  onClick={() => handleRefrigerantChange("")}
                  className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* Dropdown container */}
          <div ref={refDropdownRef} className="relative">
            {/* Search trigger / input */}
            <div
              className={`flex items-center gap-2 ${inputClass} cursor-pointer`}
              onClick={() => setRefOpen(true)}
            >
              <Search className="w-4 h-4 text-[#6b8da5] flex-shrink-0" />
              {refOpen ? (
                <input
                  type="text"
                  autoFocus
                  className="flex-1 bg-transparent outline-none text-sm text-[#16354B] placeholder:text-[#6b8da5]"
                  placeholder={t.searchRef}
                  value={refSearch}
                  onChange={(e) => setRefSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setRefOpen(false);
                      setRefSearch("");
                    }
                  }}
                />
              ) : (
                <span className="flex-1 text-sm text-[#6b8da5]">
                  {selectedRefObj
                    ? `${selectedRefObj.id} \u2014 ${selectedRefObj.name}`
                    : t.selectRef}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-[#6b8da5] transition-transform ${refOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Dropdown list */}
            {refOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border-2 border-[#e2e8f0] rounded-xl shadow-xl max-h-80 overflow-y-auto">
                {groupedRefs.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-[#6b8da5]">
                    {t.noResults}
                  </div>
                ) : (
                  groupedRefs.map((group) => (
                    <div key={group.key}>
                      {/* Group header */}
                      <div className={`sticky top-0 px-3.5 py-1.5 border-b ${
                        group.key === 'recommended'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-[#f1f5f9] border-[#e2e8f0]'
                      }`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          group.key === 'recommended' ? 'text-amber-700' : 'text-[#6b8da5]'
                        }`}>
                          {group.label}
                        </span>
                      </div>
                      {/* Group items */}
                      {group.refs.map((r) => {
                        const isActive = data.selectedRefrigerant === r.id;
                        return (
                          <button
                            key={`${group.key}-${r.id}`}
                            type="button"
                            onClick={() => {
                              handleRefrigerantChange(r.id);
                              setRefOpen(false);
                              setRefSearch("");
                            }}
                            className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors ${
                              isActive
                                ? "bg-[#16354B]/10"
                                : "hover:bg-[#f8fafc]"
                            }`}
                          >
                            <span className="text-sm font-semibold text-[#16354B] min-w-[65px]">{r.id}</span>
                            <span className="text-sm text-[#475569] flex-1 truncate">{r.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${safetyBadgeColor(r.safetyClass)}`}>
                              {r.safetyClass}
                            </span>
                            {isActive && (
                              <Check className="w-4 h-4 text-[#16354B] flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detection Range — removed from UI, handled on results page */}
      </div>

      {/* ── 2. Technical Options (hidden — M2 product selection, not used by M1 engine) ──── */}
      <div className="hidden bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5 space-y-5">
        <h3 className="text-base font-bold text-[#16354B] flex items-center gap-2.5">
          <span className="w-1 h-5 bg-[#16354B] rounded-full flex-shrink-0" />
          <Gauge className="w-4 h-4 text-[#16354B]" />
          {t.techOptions}
        </h3>

        {/* Row 1: Voltage + Mounting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t.siteVoltage}</label>
            <div className="flex gap-1.5">
              {voltageOptions.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => update("sitePowerVoltage", v.value)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    data.sitePowerVoltage === v.value
                      ? "bg-[#16354B] text-white shadow-md"
                      : "bg-[#f8fafc] border-2 border-[#e2e8f0] text-[#6b8da5] hover:border-[#16354B]"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.mountingType}</label>
            <select
              className={inputClass}
              value={data.mountingType}
              onChange={(e) => update("mountingType", e.target.value)}
            >
              <option value="">{t.selectMounting}</option>
              {mountingTypes.map((m) => (
                <option key={m.value} value={m.value}>
                  {(m as Record<string, string>)[lang] || m.en}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: ATEX — inline compact */}
        <div className={`flex items-center justify-between rounded-lg px-4 py-3 border-2 transition-all ${
          data.zoneAtex ? "bg-red-50 border-red-300" : "bg-[#f8fafc] border-[#e2e8f0]"
        }`}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#E21C1F] flex-shrink-0"
              checked={data.zoneAtex}
              onChange={(e) => update("zoneAtex", e.target.checked)}
            />
            <div>
              <span className="text-sm font-semibold text-[#16354B]">{t.atexZone1}</span>
              {!data.zoneAtex && (
                <span className="text-xs text-[#6b8da5] ml-2">
                  {t.atexCheck}
                </span>
              )}
            </div>
          </label>
          {data.zoneAtex && <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />}
        </div>

        {data.zoneAtex && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 leading-relaxed">{t.atexWarning}</p>
          </div>
        )}
      </div>

    </div>
  );
}
