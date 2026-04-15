"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { MapPin, Scale, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { ZoneData, RegulatoryContext } from "./types";
import { calculateRegulationOnly } from "@/lib/m1-engine";
import type { RegulationInput, RefrigerantV5, RegulationResult } from "@/lib/engine-types";
import { type Lang, ZONES } from "./i18n";
import ZonePlan from "./ZonePlan";

// --- Props -----------------------------------------------------------------
const DEFAULT_REGULATORY: RegulatoryContext = {
  accessCategory: 'b',
  locationClass: 'II',
  belowGround: false,
  isMachineryRoom: false,
  isOccupiedSpace: false,
  humanComfort: false,
  c3Applicable: false,
  mechanicalVentilation: false,
};

interface SpaceTypeOption {
  id: string;
  labelFr: string;
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

interface StepZonesProps {
  zones: ZoneData[];
  onZonesChange: (zones: ZoneData[]) => void;
  refrigerant: RefrigerantV5 | null;
  zoneType: string;
  spaceTypes?: SpaceTypeOption[];
  lang?: Lang;
}

// --- Shared styles ---------------------------------------------------------
const inputClass =
  "w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#16354B] focus:border-[#16354B] focus:ring-2 focus:ring-[#16354B]/20 outline-none transition-colors";
const labelClass = "block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5";

// --- Component -------------------------------------------------------------
export default function StepZones({
  zones,
  onZonesChange,
  refrigerant,
  zoneType,
  spaceTypes = [],
  lang = "en",
}: StepZonesProps) {
  const t = ZONES[lang];
  const [regOpenZone, setRegOpenZone] = useState<number | null>(null);

  // -- Zone helpers ---------------------------------------------------------
  const updateZone = useCallback(
    (id: number, patch: Partial<ZoneData>) => {
      onZonesChange(zones.map((z) => (z.id === id ? { ...z, ...patch } : z)));
    },
    [zones, onZonesChange],
  );

  const addZone = useCallback(() => {
    const nextId = zones.length > 0 ? Math.max(...zones.map((z) => z.id)) + 1 : 1;
    const newZone: ZoneData = {
      id: nextId,
      name: `${t.zone} ${nextId}`,
      surface: 0,
      height: 3,
      volumeOverride: null,
      charge: 0,
      evaporators: 1,
      mountingType: "wall",
      length: null,
      width: null,
      leakSources: [],
      evaporatorPositions: [],
      planDetectorCount: null,
      regulatory: { ...DEFAULT_REGULATORY },
    };
    onZonesChange([...zones, newZone]);
  }, [zones, onZonesChange, t.zone]);

  const deleteZone = useCallback(
    (id: number) => {
      onZonesChange(zones.filter((z) => z.id !== id));
    },
    [zones, onZonesChange],
  );

  const addLeakSource = useCallback(
    (zoneId: number) => {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;
      const newSource = { id: `ls-${Date.now()}`, description: "", x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 };
      updateZone(zoneId, { leakSources: [...zone.leakSources, newSource] });
    },
    [zones, updateZone],
  );

  const updateLeakSource = useCallback(
    (zoneId: number, sourceId: string, description: string) => {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;
      updateZone(zoneId, {
        leakSources: zone.leakSources.map((s) =>
          s.id === sourceId ? { ...s, description } : s,
        ),
      });
    },
    [zones, updateZone],
  );

  const removeLeakSource = useCallback(
    (zoneId: number, sourceId: string) => {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;
      updateZone(zoneId, {
        leakSources: zone.leakSources.filter((s) => s.id !== sourceId),
      });
    },
    [zones, updateZone],
  );

  // -- Apply space type to zone (pre-fill regulatory) ----------------------
  const applySpaceType = useCallback(
    (zoneId: number, spaceTypeId: string) => {
      const st = spaceTypes.find(s => s.id === spaceTypeId);
      if (!st) return;
      updateZone(zoneId, {
        spaceTypeId,
        regulatory: {
          accessCategory: st.accessCategory as 'a' | 'b' | 'c',
          locationClass: st.locationClass as 'I' | 'II' | 'III' | 'IV',
          belowGround: st.belowGround,
          isMachineryRoom: st.isMachineryRoom,
          isOccupiedSpace: st.isOccupiedSpace,
          humanComfort: st.humanComfort,
          c3Applicable: st.c3Applicable,
          mechanicalVentilation: st.mechVentilation,
        },
      });
    },
    [spaceTypes, updateZone],
  );

  // -- Per-zone regulatory context helper (with normative coherence) ---------
  const updateZoneCtx = useCallback(
    <K extends keyof RegulatoryContext>(zoneId: number, field: K, value: RegulatoryContext[K]) => {
      const zone = zones.find(z => z.id === zoneId);
      if (!zone) return;
      const updated = { ...zone.regulatory, [field]: value };

      // Normative coherence: machinery room ≠ occupied space
      if (field === 'isMachineryRoom' && value === true) {
        updated.isOccupiedSpace = false;
        updated.accessCategory = 'c';
        updated.locationClass = 'III';
      }
      if (field === 'isOccupiedSpace' && value === true) {
        updated.isMachineryRoom = false;
      }

      updateZone(zoneId, { regulatory: updated });
    },
    [zones, updateZone],
  );

  // -- M1 Live Preview (per zone, using per-zone regulatory context) --------
  const previews = useMemo(() => {
    const map = new Map<number, RegulationResult>();
    if (!refrigerant) return map;

    for (const zone of zones) {
      if (zone.surface <= 0 || zone.height <= 0) continue;
      const volume = zone.volumeOverride ?? zone.surface * zone.height;
      const ctx = zone.regulatory || DEFAULT_REGULATORY;
      const input: RegulationInput = {
        refrigerant,
        charge: zone.charge,
        roomArea: zone.surface,
        roomHeight: zone.height,
        roomVolume: volume,
        accessCategory: ctx.accessCategory,
        locationClass: ctx.locationClass,
        belowGround: ctx.belowGround,
        isMachineryRoom: ctx.isMachineryRoom,
        isOccupiedSpace: ctx.isOccupiedSpace,
        humanComfort: ctx.humanComfort,
        c3Applicable: ctx.c3Applicable,
        mechanicalVentilation: ctx.mechanicalVentilation,
        leakSourceLocations: zone.leakSources.filter(s => s.id.startsWith("ls-")),
      };
      try {
        map.set(zone.id, calculateRegulationOnly(input));
      } catch {
        // skip zones with invalid data
      }
    }
    return map;
  }, [zones, refrigerant]);

  // -- Render ---------------------------------------------------------------
  return (
    <div className="space-y-5">
      {/* ZONES LIST */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-5">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-[#E63946] rounded-full" />
          <MapPin className="w-5 h-5 text-[#E63946]" />
          <h3 className="text-sm font-bold text-[#16354B]">{t.zonesTitle}</h3>
        </div>

        <div className="space-y-4">
          {zones.map((zone) => {
            const volume = zone.volumeOverride ?? zone.surface * zone.height;
            const preview = previews.get(zone.id);

            return (
              <div
                key={zone.id}
                className="bg-white border-l-4 border-[#A7C031] rounded-xl shadow-[0_2px_8px_rgba(22,53,75,0.07)] p-5"
              >
                {/* Zone header + delete */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-[#16354B]">
                    {zone.name || `${t.zone} ${zone.id}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => deleteZone(zone.id)}
                    title={t.deleteZone}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.deleteZone}</span>
                  </button>
                </div>

                {/* Space Type dropdown */}
                {spaceTypes.length > 0 && (
                  <div className="mb-4">
                    <label className={labelClass}>{lang === 'fr' ? 'Type de zone' : 'Space Type'}</label>
                    <select
                      className={inputClass}
                      value={zone.spaceTypeId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          applySpaceType(zone.id, e.target.value);
                        } else {
                          updateZone(zone.id, { spaceTypeId: undefined });
                        }
                      }}
                    >
                      <option value="">{lang === 'fr' ? '\u2014 S\u00e9lectionner un type \u2014' : '\u2014 Select space type \u2014'}</option>
                      {spaceTypes.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.icon} {lang === 'fr' ? st.labelFr : st.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Zone fields */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                  <div className="col-span-2">
                    <label className={labelClass}>{t.zoneName}</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={zone.name}
                      onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t.surface}</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className={inputClass}
                      value={zone.surface || ""}
                      onChange={(e) =>
                        updateZone(zone.id, { surface: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t.height}</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className={inputClass}
                      value={zone.height || ""}
                      onChange={(e) =>
                        updateZone(zone.id, { height: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      {t.volume}{" "}
                      <span className="text-[#6b8da5] text-[10px] normal-case tracking-normal font-normal">
                        {zone.volumeOverride === null
                          ? `(${t.volumeAuto}: ${volume.toFixed(1)})`
                          : ""}
                      </span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className={inputClass}
                      value={zone.volumeOverride ?? ""}
                      placeholder={volume.toFixed(1)}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateZone(zone.id, {
                          volumeOverride: val === "" ? null : parseFloat(val) || 0,
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t.charge}</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className={inputClass}
                      value={zone.charge || ""}
                      onChange={(e) =>
                        updateZone(zone.id, { charge: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                {/* Interactive Zone Plan */}
                <ZonePlan
                  zone={zone}
                  onUpdate={(patch) => updateZone(zone.id, patch)}
                  recommendedDetectors={preview?.recommendedDetectors ?? 0}
                  placementHeight={preview?.placementHeight ?? null}
                  gasDensity={refrigerant ? (refrigerant.vapourDensity > 1.3 ? "heavier" : refrigerant.vapourDensity < 1.1 ? "lighter" : "neutral") : null}
                  lang={lang}
                />

                {/* Per-zone Regulatory Context (collapsible) */}
                <div className="mt-3 rounded-lg border border-[#e2e8f0] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setRegOpenZone(regOpenZone === zone.id ? null : zone.id)}
                    className="w-full px-3 py-2 bg-[#f8fafc] hover:bg-[#f0f4f8] flex items-center gap-2 transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#6b8da5]" />
                    <span className="text-[10px] font-semibold text-[#16354B]">{t.regulatoryTitle}</span>
                    <span className="text-[10px] text-[#6b8da5] ml-1">
                      ({(zone.regulatory || DEFAULT_REGULATORY).accessCategory}, {t.locationClass} {(zone.regulatory || DEFAULT_REGULATORY).locationClass})
                    </span>
                    {regOpenZone === zone.id
                      ? <ChevronUp className="w-3 h-3 text-[#6b8da5] ml-auto" />
                      : <ChevronDown className="w-3 h-3 text-[#6b8da5] ml-auto" />}
                  </button>
                  {regOpenZone === zone.id && (() => {
                    const ctx = zone.regulatory || DEFAULT_REGULATORY;
                    return (
                      <div className="p-3 space-y-4 bg-white">
                        {/* Access Category */}
                        <div>
                          <label className={labelClass}>{t.accessCategory}</label>
                          <div className="space-y-1.5">
                            {(["a", "b", "c"] as const).map((cat) => (
                              <div key={cat} onClick={() => updateZoneCtx(zone.id, "accessCategory", cat)}
                                className={`p-2.5 rounded-lg border-2 cursor-pointer transition-colors text-xs ${ctx.accessCategory === cat ? "border-[#16354B] bg-[#16354B]/5" : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#6b8da5]"}`}>
                                <label className="flex items-start gap-2 cursor-pointer">
                                  <input type="radio" name={`access-${zone.id}`} className="mt-0.5 accent-[#16354B] flex-shrink-0" checked={ctx.accessCategory === cat} onChange={() => updateZoneCtx(zone.id, "accessCategory", cat)} />
                                  <span className="text-xs font-medium text-[#16354B]">{cat === "a" ? t.accessA : cat === "b" ? t.accessB : t.accessC}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Location Class */}
                        <div>
                          <label className={labelClass}>{t.locationClass}</label>
                          <div className="space-y-1.5">
                            {(["I", "II", "III", "IV"] as const).map((cls) => (
                              <div key={cls} onClick={() => updateZoneCtx(zone.id, "locationClass", cls)}
                                className={`p-2.5 rounded-lg border-2 cursor-pointer transition-colors text-xs ${ctx.locationClass === cls ? "border-[#16354B] bg-[#16354B]/5" : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#6b8da5]"}`}>
                                <label className="flex items-start gap-2 cursor-pointer">
                                  <input type="radio" name={`loc-${zone.id}`} className="mt-0.5 accent-[#16354B] flex-shrink-0" checked={ctx.locationClass === cls} onChange={() => updateZoneCtx(zone.id, "locationClass", cls)} />
                                  <span className="text-xs font-medium text-[#16354B]">{cls === "I" ? t.locI : cls === "II" ? t.locII : cls === "III" ? t.locIII : t.locIV}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Checkboxes */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {([
                            ["belowGround", t.belowGround], ["isMachineryRoom", t.isMachineryRoom], ["isOccupiedSpace", t.isOccupiedSpace],
                            ["humanComfort", t.humanComfort], ["c3Applicable", t.c3Applicable], ["mechanicalVentilation", t.mechanicalVentilation],
                          ] as [keyof RegulatoryContext, string][]).map(([field, label]) => (
                            <label key={field} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border-2 transition-colors text-xs ${ctx[field] ? "border-[#16354B] bg-[#16354B]/5" : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#6b8da5]"}`}>
                              <input type="checkbox" className="w-3.5 h-3.5 accent-[#16354B] flex-shrink-0" checked={ctx[field] as boolean} onChange={(e) => updateZoneCtx(zone.id, field, e.target.checked as never)} />
                              <span className="text-xs font-medium text-[#16354B]">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* M1 Preview — compact */}
                {preview && (
                  <div className="mt-3 rounded-lg border border-[#e2e8f0] overflow-hidden">
                    <div className={`px-3 py-2 flex items-center justify-between text-xs ${
                      preview.detectionRequired === "YES" ? "bg-red-50 border-b border-red-100"
                        : preview.detectionRequired === "RECOMMENDED" ? "bg-amber-50 border-b border-amber-100"
                        : "bg-green-50 border-b border-green-100"
                    }`}>
                      <span className={`font-bold ${
                        preview.detectionRequired === "YES" ? "text-red-600"
                          : preview.detectionRequired === "RECOMMENDED" ? "text-amber-600"
                          : "text-green-600"
                      }`}>
                        {preview.detectionRequired === "YES" ? t.detectionRequired
                          : preview.detectionRequired === "RECOMMENDED" ? t.detectionRecommended
                          : t.notRequired}
                      </span>
                      <span className="font-bold text-[#16354B]">{zone.planDetectorCount ?? preview.recommendedDetectors} {t.detectors}</span>
                    </div>
                    <div className="px-3 py-2 flex items-center gap-6 text-[11px] text-[#6b8da5] bg-[#fafbfc]">
                      <span>{t.threshold}: <b className="text-[#16354B]">{Math.round(preview.thresholdPpm).toLocaleString()} ppm</b> <span className="text-[9px] text-[#6b8da5] font-normal">({t.thresholdHint})</span></span>
                      <span>{t.placement}: <b className="text-[#16354B]">{preview.placementHeight === "floor" ? t.floor : preview.placementHeight === "ceiling" ? t.ceiling : t.breathingZone}</b> <span className="text-[10px]">({preview.placementHeightM})</span></span>
                    </div>
                    {preview.reviewFlags.length > 0 && (
                      <div className="px-3 py-1.5 text-[10px] text-amber-600 bg-amber-50 border-t border-amber-100">
                        {preview.reviewFlags.join(" \u2014 ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add zone button */}
        <button
          type="button"
          onClick={addZone}
          className="mt-4 w-full py-3 border-2 border-dashed border-[#e2e8f0] rounded-xl text-[#6b8da5] hover:border-[#A7C031] hover:text-[#A7C031] transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          {t.addZone}
        </button>
      </div>

      {/* M1 PREVIEW NOTICE (no refrigerant / no zones) */}
      {!refrigerant && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm font-medium text-amber-700">
          {t.noRefrigerant}
        </div>
      )}
      {refrigerant && zones.length === 0 && (
        <div className="bg-[#f0f4f8] border border-[#e2e8f0] rounded-xl p-4 text-sm font-medium text-[#6b8da5]">
          {t.noZones}
        </div>
      )}
    </div>
  );
}
