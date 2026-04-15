"use client";

import { useMemo, useState, useCallback } from "react";
import { Printer, Download, Save, AlertTriangle, ChevronDown, ChevronRight, Map, Info } from "lucide-react";
import { toast } from "sonner";
// jsPDF imported dynamically in handleDownloadPdf to avoid SSR issues
import type { ClientData, GasAppData, ZoneData, RegulatoryContext } from "./types";
import type { RefrigerantV5, RegulationResult, ZoneRegulationResult } from "@/lib/engine-types";
import { type Lang, CALC_SHEET, ZONES } from "./i18n";
import { AVAILABLE_REGULATIONS } from "@/lib/rules";

// ─── Props ───────────────────────────────────────────────────────────────────

interface SpaceTypeOption {
  id: string;
  labelFr: string;
  labelEn: string;
  icon: string;
}

interface StepCalcSheetProps {
  clientData: ClientData;
  gasAppData: GasAppData;
  zones: ZoneData[];
  refrigerant: RefrigerantV5;
  application: { id: string; labelFr: string; labelEn: string; icon: string } | null;
  spaceTypes: SpaceTypeOption[];
  zoneRegulations: ZoneRegulationResult[];
  lang?: Lang;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateRef(): string {
  const now = new Date();
  const y = now.getFullYear();
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `DC-${y}-${seq}`;
}

function formatDate(lang: string): string {
  const now = new Date();
  const d = now.getDate().toString().padStart(2, "0");
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const y = now.getFullYear();
  if (lang === "en") return `${m}/${d}/${y}`;
  return `${d}/${m}/${y}`;
}

function detectionBadgeClass(status: string): string {
  switch (status) {
    case "YES": return "bg-[#E63946] text-white";
    case "RECOMMENDED": return "bg-amber-500 text-white";
    case "MANUAL_REVIEW": return "bg-orange-500 text-white";
    default: return "bg-emerald-500 text-white";
  }
}

type CalcSheetTranslation = (typeof CALC_SHEET)[Lang];

function placementLabel(placement: string, t: CalcSheetTranslation): string {
  switch (placement) {
    case "floor": return t.floor;
    case "ceiling": return t.ceiling;
    case "breathing_zone": return t.breathingZone;
    default: return placement;
  }
}

function statusLabel(status: string, t: CalcSheetTranslation): string {
  switch (status) {
    case "YES": return t.required;
    case "RECOMMENDED": return t.recommended;
    case "MANUAL_REVIEW": return t.manualReview;
    default: return t.notRequired;
  }
}

function flagsList(ctx: RegulatoryContext, t: CalcSheetTranslation): string[] {
  const flags: string[] = [];
  if (ctx.isMachineryRoom) flags.push(t.machineryRoom);
  if (ctx.isOccupiedSpace) flags.push(t.occupied);
  if (ctx.humanComfort) flags.push(t.comfort);
  if (ctx.belowGround) flags.push(t.belowGround);
  if (ctx.mechanicalVentilation) flags.push(t.mechVent);
  if (ctx.c3Applicable) flags.push(t.c3);
  return flags;
}

// ─── Zone Plan Preview ───────────────────────────────────────────────────────

type SourceType = "evaporator" | "valve" | "joint" | "compressor" | "other";

const SOURCE_COLOR: Record<SourceType, string> = {
  evaporator: "#2563eb",
  valve: "#f59e0b",
  compressor: "#475569",
  joint: "#7c3aed",
  other: "#E63946",
};

const SOURCE_LABEL: Record<SourceType, string> = {
  evaporator: "Evap.",
  valve: "Valve",
  compressor: "Comp.",
  joint: "Joint",
  other: "Other",
};

const WALL_OFFSET = 4;
const MAX_DISTANCE_M = 7;

function getSourceType(id: string): SourceType {
  const prefix = id.split("-")[0];
  if (prefix in SOURCE_COLOR) return prefix as SourceType;
  return "other";
}

function snapToWallPreview(px: number, py: number): { x: number; y: number } {
  const dLeft = px, dRight = 100 - px, dTop = py, dBottom = 100 - py;
  const min = Math.min(dLeft, dRight, dTop, dBottom);
  if (min === dLeft) return { x: WALL_OFFSET, y: py };
  if (min === dRight) return { x: 100 - WALL_OFFSET, y: py };
  if (min === dTop) return { x: px, y: WALL_OFFSET };
  return { x: px, y: 100 - WALL_OFFSET };
}

function distributeOnWallsPreview(count: number): { x: number; y: number }[] {
  if (count <= 0) return [];
  const positions: { x: number; y: number }[] = [];
  const seg = 100 - 2 * WALL_OFFSET;
  const perimeter = 4 * seg;
  const spacing = perimeter / count;
  for (let i = 0; i < count; i++) {
    const d = (spacing * i + spacing / 2) % perimeter;
    if (d < seg) positions.push({ x: WALL_OFFSET + d, y: WALL_OFFSET });
    else if (d < 2 * seg) positions.push({ x: 100 - WALL_OFFSET, y: WALL_OFFSET + (d - seg) });
    else if (d < 3 * seg) positions.push({ x: 100 - WALL_OFFSET - (d - 2 * seg), y: 100 - WALL_OFFSET });
    else positions.push({ x: WALL_OFFSET, y: 100 - WALL_OFFSET - (d - 3 * seg) });
  }
  return positions;
}

function computeDetectorPositionsPreview(
  count: number,
  sources: { x: number; y: number; type: SourceType }[],
  roomLm: number,
  roomWm: number,
): { x: number; y: number }[] {
  if (count <= 0) return [];
  if (sources.length === 0) return distributeOnWallsPreview(count);

  const sorted = [...sources].sort((a, b) => {
    const pri: Record<SourceType, number> = { compressor: 1, evaporator: 2, valve: 3, joint: 4, other: 5 };
    return (pri[a.type] ?? 5) - (pri[b.type] ?? 5);
  });

  const positions: { x: number; y: number }[] = [];
  const covered = new Set<number>();
  const used = new Set<string>();

  for (let round = 0; round < sorted.length && positions.length < Math.max(count, sorted.length); round++) {
    const srcIdx = sorted.findIndex((_, i) => !covered.has(i));
    if (srcIdx === -1) break;

    const src = sorted[srcIdx];
    const snapped = snapToWallPreview(src.x, src.y);
    let key = `${Math.round(snapped.x)}-${Math.round(snapped.y)}`;
    if (used.has(key)) {
      const re = snapToWallPreview(src.x + 8, src.y + 6);
      snapped.x = re.x;
      snapped.y = re.y;
    }
    key = `${Math.round(snapped.x)}-${Math.round(snapped.y)}`;
    used.add(key);
    positions.push(snapped);

    for (let i = 0; i < sorted.length; i++) {
      const dx = ((snapped.x - sorted[i].x) / 100) * roomLm;
      const dy = ((snapped.y - sorted[i].y) / 100) * roomWm;
      if (Math.sqrt(dx * dx + dy * dy) <= MAX_DISTANCE_M) covered.add(i);
    }
  }

  return positions;
}

function ZonePlanPreview({
  zone,
  detectorCount,
  placementHeight,
}: {
  zone: ZoneData;
  detectorCount: number;
  placementHeight: string;
}) {
  const roomL = zone.length ?? Math.sqrt(zone.surface);
  const roomW = zone.width ?? Math.sqrt(zone.surface);

  // Compute aspect ratio for SVG viewBox
  const maxW = 300;
  const maxH = 200;
  const aspectRoom = roomL / roomW;
  const aspectSvg = maxW / maxH;
  let svgW: number, svgH: number;
  if (aspectRoom > aspectSvg) {
    svgW = maxW;
    svgH = maxW / aspectRoom;
  } else {
    svgH = maxH;
    svgW = maxH * aspectRoom;
  }

  // viewBox: 0-100 coordinate system
  const vb = "0 0 100 100";

  // Collect sources
  const allSources = [
    ...zone.leakSources.map(s => ({ x: s.x, y: s.y, type: getSourceType(s.id), label: s.description })),
    ...zone.evaporatorPositions.map(e => ({ x: e.x, y: e.y, type: "evaporator" as SourceType, label: "Evap." })),
  ];

  // Compute detector positions
  const detPositions = computeDetectorPositionsPreview(
    detectorCount,
    allSources.map(s => ({ x: s.x, y: s.y, type: s.type })),
    roomL,
    roomW,
  );

  // 7m coverage circle radius in %
  const roomDiagM = Math.sqrt(roomL * roomL + roomW * roomW);
  const coverageRadiusPct = roomDiagM > 0 ? (MAX_DISTANCE_M / roomDiagM) * 100 * Math.SQRT2 : 20;
  // Simpler: coverage radius as % of room side
  const covRadX = (MAX_DISTANCE_M / roomL) * 100;
  const covRadY = (MAX_DISTANCE_M / roomW) * 100;
  const covRad = Math.min(covRadX, covRadY);

  // Unique source types for legend
  const usedTypes = [...new Set(allSources.map(s => s.type))];

  return (
    <div className="space-y-2">
      <svg
        width={svgW}
        height={svgH}
        viewBox={vb}
        className="border border-[#d1d5db] rounded bg-white"
        style={{ maxWidth: "100%" }}
      >
        {/* Room outline */}
        <rect x={1} y={1} width={98} height={98} rx={1} fill="none" stroke="#94a3b8" strokeWidth={0.8} />

        {/* Dimension labels */}
        <text x={50} y={99} textAnchor="middle" fontSize={3.5} fill="#64748b" fontFamily="sans-serif">
          {roomL.toFixed(1)}m
        </text>
        <text x={0.5} y={50} textAnchor="middle" fontSize={3.5} fill="#64748b" fontFamily="sans-serif"
          transform="rotate(-90, 0.5, 50)">
          {roomW.toFixed(1)}m
        </text>

        {/* 7m coverage circles around detectors */}
        {detPositions.map((d, i) => (
          <circle
            key={`cov-${i}`}
            cx={d.x}
            cy={d.y}
            r={covRad}
            fill="#22c55e"
            fillOpacity={0.06}
            stroke="#22c55e"
            strokeWidth={0.4}
            strokeDasharray="1.5 1"
            strokeOpacity={0.5}
          />
        ))}

        {/* Leak sources */}
        {allSources.map((s, i) => {
          const color = SOURCE_COLOR[s.type];
          return (
            <g key={`src-${i}`}>
              <circle cx={s.x} cy={s.y} r={2.5} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={0.6} />
              <circle cx={s.x} cy={s.y} r={0.8} fill={color} />
              {allSources.length <= 8 && (
                <text x={s.x} y={s.y - 3.5} textAnchor="middle" fontSize={2.2} fill={color} fontFamily="sans-serif" fontWeight="bold">
                  {s.label.slice(0, 8)}
                </text>
              )}
            </g>
          );
        })}

        {/* Detector positions — green diamonds */}
        {detPositions.map((d, i) => (
          <g key={`det-${i}`}>
            <polygon
              points={`${d.x},${d.y - 2.5} ${d.x + 2.5},${d.y} ${d.x},${d.y + 2.5} ${d.x - 2.5},${d.y}`}
              fill="#22c55e"
              fillOpacity={0.3}
              stroke="#22c55e"
              strokeWidth={0.7}
            />
            <text x={d.x} y={d.y + 0.8} textAnchor="middle" fontSize={2} fill="#166534" fontFamily="sans-serif" fontWeight="bold">
              D{i + 1}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#475569]">
        {usedTypes.map(type => (
          <span key={type} className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_COLOR[type] }} />
            {SOURCE_LABEL[type]}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rotate-45 bg-[#22c55e]" style={{ borderRadius: 1 }} />
          Detector
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border border-dashed border-[#22c55e] opacity-50" />
          7m coverage
        </span>
        <span className="text-[#94a3b8] ml-2">
          Placement: {placementHeight}
        </span>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function StepCalcSheet({
  clientData,
  gasAppData,
  zones,
  refrigerant,
  application,
  spaceTypes,
  zoneRegulations,
  lang = "en",
}: StepCalcSheetProps) {
  const t = CALC_SHEET[lang];
  const tz = ZONES[lang];
  const sheetRef = useMemo(() => generateRef(), []);
  const dateStr = useMemo(() => formatDate(lang), [lang]);

  // Dynamic regulation name
  const regulationName = useMemo(() => {
    const reg = AVAILABLE_REGULATIONS.find(r => r.id === gasAppData.regulation);
    return reg?.name ?? 'EN 378-3:2016';
  }, [gasAppData.regulation]);

  // Totals
  const totalDetectors = useMemo(() => {
    return zoneRegulations.reduce((sum, zr) => {
      const zone = zones.find(z => String(z.id) === zr.zoneId);
      return sum + (zone?.planDetectorCount ?? zr.result.recommendedDetectors);
    }, 0);
  }, [zoneRegulations, zones]);

  const hasAnyAreaMode = zoneRegulations.some(zr => zr.result.quantityMode === "area");
  const hasAnyClusterMode = zoneRegulations.some(zr => zr.result.quantityMode === "cluster");

  // Country label
  const countryLabel = clientData.country || "N/A";

  // Application label
  const appLabel = application
    ? `${application.icon} ${lang === "fr" ? application.labelFr : application.labelEn}`
    : gasAppData.zoneType || "N/A";

  // Space type lookup
  const getSpaceType = (id?: string) => {
    if (!id) return null;
    return spaceTypes.find(st => st.id === id) ?? null;
  };

  // ─── Zone Plan Preview State ──────────────────────────────────────────────

  // Which zones have positioned sources (only these get a plan section)
  const zonesWithSources = useMemo(() => {
    const set = new Set<string>();
    for (const z of zones) {
      if ((z.leakSources && z.leakSources.length > 0) || (z.evaporatorPositions && z.evaporatorPositions.length > 0)) {
        set.add(String(z.id));
      }
    }
    return set;
  }, [zones]);

  const [planVisibility, setPlanVisibility] = useState<Record<string, boolean>>({});
  const [includePlanInPdf, setIncludePlanInPdf] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const z of zones) {
      const hasSources = (z.leakSources?.length ?? 0) > 0 || (z.evaporatorPositions?.length ?? 0) > 0;
      init[String(z.id)] = hasSources;
    }
    return init;
  });

  const togglePlanVisibility = useCallback((zoneId: string) => {
    setPlanVisibility(prev => ({ ...prev, [zoneId]: !prev[zoneId] }));
  }, []);

  const toggleIncludePlanInPdf = useCallback((zoneId: string) => {
    setIncludePlanInPdf(prev => ({ ...prev, [zoneId]: !prev[zoneId] }));
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPdf() {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = 210;
      const margin = 15;
      const cw = pw - margin * 2;
      let y = 0;

      // ── Colors ──
      const navy = [22, 53, 75] as const;
      const red = [230, 57, 70] as const;
      const green = [167, 192, 49] as const;
      const gray = [107, 141, 165] as const;

      // ── Helper: check page break ──
      function checkPage(needed: number) {
        if (y + needed > 280) {
          doc.addPage();
          y = 15;
        }
      }

      // ── HEADER ──
      doc.setFillColor(...navy);
      doc.rect(0, 0, pw, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RefCalc — Gas Detection Calculation Sheet", margin, 12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${regulationName} — SAMON AB`, margin, 19);
      doc.setTextColor(...green);
      doc.setFont("helvetica", "bold");
      doc.text(`Ref: ${sheetRef}`, pw - margin, 12, { align: "right" });
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${dateStr}`, pw - margin, 19, { align: "right" });
      y = 34;

      // ── Section helper ──
      function sectionTitle(title: string) {
        checkPage(12);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...red);
        doc.text(title.toUpperCase(), margin, y);
        y += 1;
        doc.setDrawColor(...red);
        doc.setLineWidth(0.3);
        doc.line(margin, y, margin + cw, y);
        y += 5;
      }

      function field(label: string, value: string, x: number, width: number) {
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray);
        doc.text(label, x, y);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text(value || "—", x, y + 4, { maxWidth: width });
      }

      // ── PROJECT ──
      sectionTitle(t.project);
      field(t.client, `${clientData.company} — ${clientData.firstName} ${clientData.lastName}`, margin, 55);
      field(t.projectName, clientData.projectName, margin + 60, 55);
      field(t.country, countryLabel, margin + 120, 40);
      y += 10;

      // ── Contact ──
      field("Email", clientData.email, margin, 55);
      field("Phone", clientData.phone, margin + 60, 55);
      y += 10;

      // ── APPLICATION & REFRIGERANT ──
      sectionTitle(t.appRefrigerant);
      field(t.application, appLabel, margin, 80);
      field(t.refrigerant, `${refrigerant.id} — ${refrigerant.name}`, margin + 90, 80);
      y += 10;
      field(t.safetyClass, refrigerant.safetyClass, margin, 30);
      field(t.gwp, refrigerant.gwp ?? "N/A", margin + 35, 30);
      field(t.lfl, refrigerant.lfl != null ? `${refrigerant.lfl} kg/m³` : "N/A", margin + 70, 40);
      field(t.atelOdl, refrigerant.atelOdl != null ? `${refrigerant.atelOdl} kg/m³` : "N/A", margin + 115, 40);
      y += 12;

      // ── ZONES ──
      zoneRegulations.forEach((zr, idx) => {
        const zone = zones.find(z => String(z.id) === zr.zoneId);
        if (!zone) return;

        checkPage(45);

        const volume = zone.volumeOverride ?? zone.surface * zone.height;
        const ctx = zone.regulatory;
        const flags = flagsList(ctx, t);
        const detCount = zone.planDetectorCount ?? zr.result.recommendedDetectors;
        const coveragePerDet = detCount > 0 ? Math.round(zone.surface / detCount) : 0;
        const concKgM3 = volume > 0 ? zone.charge / volume : 0;

        // Zone header bar
        doc.setFillColor(240, 244, 248);
        doc.rect(margin, y - 3, cw, 8, "F");
        doc.setFillColor(...green);
        doc.rect(margin, y - 3, 1.5, 8, "F");
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...navy);
        doc.text(`Zone ${idx + 1}: ${zone.name}`, margin + 4, y + 2);

        // Detection badge
        const badge = zr.result.detectionRequired;
        const badgeColor: readonly [number, number, number] = badge === "YES" ? red : badge === "RECOMMENDED" ? [245, 158, 11] as const : [34, 197, 94] as const;
        doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
        const badgeText = statusLabel(badge, t);
        const bw = doc.getTextWidth(badgeText) + 6;
        doc.roundedRect(pw - margin - bw, y - 2.5, bw, 6, 1, 1, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(badgeText, pw - margin - bw + 3, y + 1.5);

        y += 10;

        // Dimensions
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(`${zone.surface} m² × ${zone.height} m = ${volume.toFixed(1)} m³  |  Charge: ${zone.charge} kg  |  Cat. ${ctx.accessCategory}, Class ${ctx.locationClass}`, margin + 4, y);
        y += 5;

        if (flags.length > 0) {
          doc.setTextColor(...gray);
          doc.text(`Flags: ${flags.join(", ")}`, margin + 4, y);
          y += 5;
        }

        // Results
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(margin + 4, y, pw - margin, y);
        doc.setLineDashPattern([], 0);
        y += 4;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...navy);
        doc.text(`${detCount} detector${detCount > 1 ? "s" : ""}`, margin + 4, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(`Threshold: ${Math.round(zr.result.thresholdPpm).toLocaleString()} ppm  |  Conc.: ${concKgM3.toFixed(4)} kg/m³  |  Placement: ${zr.result.placementHeight} (${zr.result.placementHeightM})  |  Coverage: ${coveragePerDet} m²/det`, margin + 30, y);
        y += 5;

        if (zr.result.reviewFlags.length > 0) {
          doc.setFontSize(7);
          doc.setTextColor(180, 120, 0);
          doc.text(`⚠ ${zr.result.reviewFlags.join(" — ")}`, margin + 4, y);
          y += 5;
        }

        y += 4;

        // ── Zone Plan in PDF ──
        const hasSources = (zone.leakSources?.length ?? 0) > 0 || (zone.evaporatorPositions?.length ?? 0) > 0;
        if (hasSources && includePlanInPdf[zr.zoneId] !== false) {
          checkPage(115); // need ~110mm for the plan

          const planW = 160;
          const planH = 100;
          const roomL = zone.length ?? Math.sqrt(zone.surface);
          const roomW = zone.width ?? Math.sqrt(zone.surface);

          // Compute aspect-correct drawing area
          const aspectRoom = roomL / roomW;
          const aspectPlan = planW / planH;
          let drawW: number, drawH: number;
          if (aspectRoom > aspectPlan) {
            drawW = planW;
            drawH = planW / aspectRoom;
          } else {
            drawH = planH;
            drawW = planH * aspectRoom;
          }

          const planX = margin + (planW - drawW) / 2;
          const planY = y;

          // Title
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...navy);
          const srcCount = (zone.leakSources?.length ?? 0) + (zone.evaporatorPositions?.length ?? 0);
          doc.text(`Zone Plan — ${srcCount} source${srcCount > 1 ? "s" : ""}, ${detCount} detector${detCount > 1 ? "s" : ""}`, margin + 4, y);
          y += 4;
          const roomTopY = y;

          // Room outline
          doc.setDrawColor(148, 163, 184); // slate-400
          doc.setLineWidth(0.4);
          doc.setLineDashPattern([], 0);
          doc.rect(planX, roomTopY, drawW, drawH);

          // Dimension labels
          doc.setFontSize(5.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139); // slate-500
          doc.text(`${roomL.toFixed(1)}m`, planX + drawW / 2, roomTopY + drawH + 3.5, { align: "center" });
          doc.text(`${roomW.toFixed(1)}m`, planX - 2, roomTopY + drawH / 2, { align: "right" });

          // Collect all sources
          const pdfSources = [
            ...zone.leakSources.map(s => ({ x: s.x, y: s.y, type: getSourceType(s.id), label: s.description })),
            ...zone.evaporatorPositions.map(e => ({ x: e.x, y: e.y, type: "evaporator" as SourceType, label: "Evap." })),
          ];

          // Compute detector positions
          const pdfDetPositions = computeDetectorPositionsPreview(
            detCount,
            pdfSources.map(s => ({ x: s.x, y: s.y, type: s.type })),
            roomL,
            roomW,
          );

          // 7m coverage radius in drawing units
          const covRadMmX = (MAX_DISTANCE_M / roomL) * drawW;
          const covRadMmY = (MAX_DISTANCE_M / roomW) * drawH;
          const covRadMm = Math.min(covRadMmX, covRadMmY);

          // Draw coverage circles (dashed green)
          doc.setDrawColor(34, 197, 94); // green-500
          doc.setLineWidth(0.2);
          doc.setLineDashPattern([1, 0.8], 0);
          for (const d of pdfDetPositions) {
            const dx = planX + (d.x / 100) * drawW;
            const dy = roomTopY + (d.y / 100) * drawH;
            doc.setFillColor(34, 197, 94);
            doc.circle(dx, dy, covRadMm, "S");
          }
          doc.setLineDashPattern([], 0);

          // Draw sources
          const srcColorMap: Record<SourceType, readonly [number, number, number]> = {
            evaporator: [37, 99, 235],
            valve: [245, 158, 11],
            compressor: [71, 85, 105],
            joint: [124, 58, 237],
            other: [230, 57, 70],
          };
          for (const s of pdfSources) {
            const sx = planX + (s.x / 100) * drawW;
            const sy = roomTopY + (s.y / 100) * drawH;
            const col = srcColorMap[s.type] ?? srcColorMap.other;
            doc.setFillColor(col[0], col[1], col[2]);
            doc.setDrawColor(col[0], col[1], col[2]);
            doc.setLineWidth(0.3);
            doc.circle(sx, sy, 1.5, "FD");
            // Label
            if (pdfSources.length <= 8) {
              doc.setFontSize(4);
              doc.setFont("helvetica", "bold");
              doc.setTextColor(col[0], col[1], col[2]);
              doc.text(s.label.slice(0, 10), sx, sy - 2.5, { align: "center" });
            }
          }

          // Draw detectors (diamond shapes)
          for (let di = 0; di < pdfDetPositions.length; di++) {
            const d = pdfDetPositions[di];
            const dx = planX + (d.x / 100) * drawW;
            const dy = roomTopY + (d.y / 100) * drawH;
            const ds = 1.8;
            doc.setFillColor(34, 197, 94);
            doc.setDrawColor(34, 197, 94);
            doc.setLineWidth(0.3);
            // Draw diamond as a polygon path — use triangle pairs
            const points = [
              { x: dx, y: dy - ds },
              { x: dx + ds, y: dy },
              { x: dx, y: dy + ds },
              { x: dx - ds, y: dy },
            ];
            doc.setFillColor(34, 197, 94);
            // jsPDF doesn't have polygon — draw as lines + fill with triangle workaround
            doc.triangle(points[0].x, points[0].y, points[1].x, points[1].y, points[3].x, points[3].y, "F");
            doc.triangle(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y, "F");
            // Label
            doc.setFontSize(3.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(22, 101, 52);
            doc.text(`D${di + 1}`, dx, dy + 0.5, { align: "center" });
          }

          // Legend row
          y = roomTopY + drawH + 6;
          doc.setFontSize(5);
          doc.setFont("helvetica", "normal");
          let legendX = margin + 4;
          const usedTypesSet = new Set(pdfSources.map(s => s.type));
          for (const sType of usedTypesSet) {
            const col = srcColorMap[sType] ?? srcColorMap.other;
            doc.setFillColor(col[0], col[1], col[2]);
            doc.circle(legendX + 1, y, 0.8, "F");
            doc.setTextColor(60, 60, 60);
            doc.text(SOURCE_LABEL[sType], legendX + 3, y + 0.5);
            legendX += doc.getTextWidth(SOURCE_LABEL[sType]) + 6;
          }
          // Detector legend
          doc.setFillColor(34, 197, 94);
          doc.circle(legendX + 1, y, 0.8, "F");
          doc.setTextColor(60, 60, 60);
          doc.text("Detector", legendX + 3, y + 0.5);
          y += 5;

          // Placement limitation notice
          doc.setFillColor(219, 234, 254); // blue-100
          doc.rect(margin, y, planW, 10, "F");
          doc.setFontSize(5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(29, 78, 216); // blue-700
          doc.text("INDICATIVE PLACEMENT ONLY", margin + 2, y + 3);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(4.5);
          doc.setTextColor(37, 99, 235); // blue-600
          doc.text(
            "This plan does not account for: ventilation (forced/natural), doors, air currents, physical obstructions. Final positioning must be validated on site.",
            margin + 2, y + 6.5, { maxWidth: planW - 4 }
          );
          y += 13;
        }
      });

      // ── SUMMARY ──
      checkPage(25);
      doc.setFillColor(240, 244, 248);
      doc.rect(margin, y - 2, cw, 18, "F");
      doc.setDrawColor(...navy);
      doc.setLineWidth(0.5);
      doc.line(margin, y - 2, margin + cw, y - 2);

      sectionTitle(t.summary);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text(`Total Zones: ${zones.length}`, margin + 4, y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...navy);
      doc.text(`Total Detectors: ${totalDetectors}`, margin + 50, y);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray);
      doc.text(regulationName, margin + 120, y);
      y += 10;

      // ── DISCLAIMER ──
      checkPage(15);
      doc.setFillColor(254, 252, 232);
      doc.rect(margin, y, cw, 12, "F");
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(160, 110, 0);
      doc.text("DISCLAIMER", margin + 3, y + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.text(t.disclaimerText, margin + 3, y + 8, { maxWidth: cw - 6 });

      // ── Save — use manual blob download for reliable filename ──
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RefCalc_${sheetRef}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(lang === "fr" ? "PDF téléchargé" : "PDF downloaded");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error(lang === "fr" ? "Erreur lors de la génération du PDF" : "PDF generation failed");
    }
  }

  async function handleSave() {
    try {
      const payload = {
        clientJson: clientData,
        regulation: gasAppData.regulation,
        gasAppJson: {
          regulation: gasAppData.regulation,
          applicationId: gasAppData.zoneType,
          refrigerantId: refrigerant.id,
          refrigerantName: refrigerant.name,
          safetyClass: refrigerant.safetyClass,
          gwp: refrigerant.gwp,
          selectedRange: gasAppData.selectedRange,
          sitePowerVoltage: gasAppData.sitePowerVoltage,
          zoneAtex: gasAppData.zoneAtex,
          mountingType: gasAppData.mountingType,
        },
        zonesJson: zones.map(z => ({
          id: z.id,
          name: z.name,
          surface: z.surface,
          height: z.height,
          charge: z.charge,
          volumeOverride: z.volumeOverride,
          regulatory: z.regulatory,
          spaceTypeId: z.spaceTypeId,
          leakSources: z.leakSources,
          evaporatorPositions: z.evaporatorPositions,
          planDetectorCount: z.planDetectorCount,
        })),
        resultJson: {
          zoneRegulations: zoneRegulations.map(zr => ({
            zoneId: zr.zoneId,
            zoneName: zr.zoneName,
            detectionRequired: zr.result.detectionRequired,
            recommendedDetectors: zr.result.recommendedDetectors,
            thresholdPpm: zr.result.thresholdPpm,
            thresholdKgM3: zr.result.thresholdKgM3,
            placementHeight: zr.result.placementHeight,
            placementHeightM: zr.result.placementHeightM,
            quantityMode: zr.result.quantityMode,
            reviewFlags: zr.result.reviewFlags,
            governingHazard: zr.result.governingHazard,
          })),
          totalDetectors,
          totalZones: zones.length,
        },
        status: 'draft',
      };

      const res = await fetch("/api/calc-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(t.saved);
      } else {
        toast.error(t.saveError);
      }
    } catch {
      toast.error(t.saveError);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0">
      {/* Print-friendly styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .calc-sheet, .calc-sheet * { visibility: visible; }
          .calc-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="calc-sheet bg-white rounded-xl shadow-[0_4px_24px_rgba(22,53,75,0.12)] overflow-hidden border border-[#e2e8f0]">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="bg-[#16354B] text-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-extrabold tracking-wide">
                {t.calcSheetTitle} &mdash; {regulationName}
              </h1>
              <p className="text-sm text-white/70 mt-0.5">{t.samonAb}</p>
            </div>
            <div className="text-right text-sm">
              <div className="font-semibold">{t.ref}: <span className="text-[#A7C031]">{sheetRef}</span></div>
              <div className="text-white/70">{t.date}: {dateStr}</div>
            </div>
          </div>
        </div>

        {/* ── PROJECT ────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-2">{t.project}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-[#6b8da5] text-xs">{t.client}:</span>{" "}
              <span className="font-semibold text-[#16354B]">
                {clientData.company} &mdash; {clientData.firstName} {clientData.lastName}
              </span>
            </div>
            <div>
              <span className="text-[#6b8da5] text-xs">{t.projectName}:</span>{" "}
              <span className="font-semibold text-[#16354B]">{clientData.projectName}</span>
            </div>
            <div>
              <span className="text-[#6b8da5] text-xs">{t.country}:</span>{" "}
              <span className="font-semibold text-[#16354B]">{countryLabel}</span>
            </div>
          </div>
        </div>

        {/* ── APPLICATION & REFRIGERANT ──────────────────────────── */}
        <div className="px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-2">{t.appRefrigerant}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[#6b8da5] text-xs">{t.application}:</span>{" "}
              <span className="font-semibold text-[#16354B]">{appLabel}</span>
            </div>
            <div>
              <span className="text-[#6b8da5] text-xs">{t.refrigerant}:</span>{" "}
              <span className="font-semibold text-[#16354B]">{refrigerant.id} &mdash; {refrigerant.name}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs">
                <span className="text-[#6b8da5]">{t.safetyClass}:</span>{" "}
                <span className="font-bold text-[#16354B] bg-[#f0f4f8] px-1.5 py-0.5 rounded">{refrigerant.safetyClass}</span>
              </span>
              <span className="text-xs">
                <span className="text-[#6b8da5]">{t.gwp}:</span>{" "}
                <span className="font-semibold text-[#16354B]">{refrigerant.gwp ?? "N/A"}</span>
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs">
                <span className="text-[#6b8da5]">{t.lfl}:</span>{" "}
                <span className="font-semibold text-[#16354B]">{refrigerant.lfl != null ? `${refrigerant.lfl} kg/m\u00b3` : "N/A"}</span>
              </span>
              <span className="text-xs">
                <span className="text-[#6b8da5]">{t.atelOdl}:</span>{" "}
                <span className="font-semibold text-[#16354B]">{refrigerant.atelOdl != null ? `${refrigerant.atelOdl} kg/m\u00b3` : "N/A"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── ZONE DETAILS ───────────────────────────────────────── */}
        {zoneRegulations.map((zr, idx) => {
          const zone = zones.find(z => String(z.id) === zr.zoneId);
          if (!zone) return null;

          const volume = zone.volumeOverride ?? zone.surface * zone.height;
          const ctx = zone.regulatory;
          const flags = flagsList(ctx, t);
          const spaceType = getSpaceType(zone.spaceTypeId);
          const spaceLabel = spaceType
            ? `${spaceType.icon} ${lang === "fr" ? spaceType.labelFr : spaceType.labelEn}`
            : "";
          const detCount = zone.planDetectorCount ?? zr.result.recommendedDetectors;
          const coveragePerDetector = detCount > 0 ? Math.round(zone.surface / detCount) : 0;
          const concentrationKgM3 = volume > 0 ? zone.charge / volume : 0;

          return (
            <div key={zr.zoneId} className={`px-6 py-4 ${idx < zoneRegulations.length - 1 ? "border-b border-[#e2e8f0]" : ""}`}>
              {/* Zone header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-5 bg-[#A7C031] rounded-full" />
                <h3 className="text-sm font-bold text-[#16354B]">
                  {tz.zone} {idx + 1}: {zone.name}
                  {spaceLabel && <span className="text-[#6b8da5] font-normal ml-2">&mdash; {spaceLabel}</span>}
                </h3>
              </div>

              <div className="ml-3 space-y-2">
                {/* Dimensions row */}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <span>
                    <span className="text-[#6b8da5]">{t.dimensions}:</span>{" "}
                    <span className="font-semibold text-[#16354B]">
                      {zone.surface} m&sup2; &times; {zone.height} m = {volume.toFixed(1)} m&sup3;
                    </span>
                  </span>
                  <span>
                    <span className="text-[#6b8da5]">{t.charge}:</span>{" "}
                    <span className="font-semibold text-[#16354B]">{zone.charge} kg</span>
                  </span>
                </div>

                {/* Regulatory row */}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <span>
                    <span className="text-[#6b8da5]">{t.regulatory}:</span>{" "}
                    <span className="font-semibold text-[#16354B]">
                      {t.accessCat}({ctx.accessCategory}), {t.locClass} {ctx.locationClass}
                    </span>
                  </span>
                  {flags.length > 0 && (
                    <span>
                      <span className="text-[#6b8da5]">{t.flags}:</span>{" "}
                      <span className="font-medium text-[#16354B]">{flags.join(", ")}</span>
                    </span>
                  )}
                </div>

                {/* Separator */}
                <div className="border-t border-dashed border-[#e2e8f0] my-2" />

                {/* Calculation results */}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <span>
                    <span className="text-[#6b8da5]">{t.maxConcentration}:</span>{" "}
                    <span className="font-semibold text-[#16354B]">{concentrationKgM3.toFixed(4)} kg/m&sup3;</span>
                  </span>
                  <span>
                    <span className="text-[#6b8da5]">{t.alarmThreshold}:</span>{" "}
                    <span className="font-semibold text-[#16354B]">{Math.round(zr.result.thresholdPpm).toLocaleString()} ppm</span>
                  </span>
                </div>

                {/* Detection verdict */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs mt-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[#6b8da5]">{t.detection}:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${detectionBadgeClass(zr.result.detectionRequired)}`}>
                      {statusLabel(zr.result.detectionRequired, t)}
                    </span>
                    <span className="font-bold text-[#16354B]">{detCount} {t.detectorPlural}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <span>
                    <span className="text-[#6b8da5]">{t.placement}:</span>{" "}
                    <span className="font-semibold text-[#16354B]">
                      {placementLabel(zr.result.placementHeight, t)} ({zr.result.placementHeightM})
                    </span>
                  </span>
                  <span>
                    <span className="text-[#6b8da5]">{t.coverage}:</span>{" "}
                    <span className="font-semibold text-[#16354B]">{coveragePerDetector} m&sup2;{t.perDetector}</span>
                  </span>
                </div>

                {/* Review flags */}
                {zr.result.reviewFlags.length > 0 && (
                  <div className="flex items-start gap-1.5 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[10px] text-amber-600">{zr.result.reviewFlags.join(" \u2014 ")}</span>
                  </div>
                )}

                {/* ── Zone Plan Preview (collapsible) ── */}
                {zone && (() => {
                  const sourceCount = (zone.leakSources?.length ?? 0) + (zone.evaporatorPositions?.length ?? 0);
                  const isOpen = planVisibility[zr.zoneId] ?? false;
                  const includeInPdf = includePlanInPdf[zr.zoneId] ?? true;

                  return (
                    <div className="mt-3 border border-[#e2e8f0] rounded-lg overflow-hidden">
                      {/* Collapsible header */}
                      <button
                        type="button"
                        onClick={() => togglePlanVisibility(zr.zoneId)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-[#f8fafc] hover:bg-[#f0f4f8] transition-colors text-left"
                      >
                        <span className="flex items-center gap-2 text-xs font-semibold text-[#16354B]">
                          <Map className="w-3.5 h-3.5 text-[#6b8da5]" />
                          Zone Plan — {sourceCount} source{sourceCount > 1 ? "s" : ""}, {detCount} detector{detCount > 1 ? "s" : ""}
                        </span>
                        {isOpen
                          ? <ChevronDown className="w-4 h-4 text-[#6b8da5]" />
                          : <ChevronRight className="w-4 h-4 text-[#6b8da5]" />
                        }
                      </button>

                      {/* Collapsible body */}
                      {isOpen && (
                        <div className="px-3 py-3 border-t border-[#e2e8f0] bg-white">
                          <ZonePlanPreview
                            zone={zone}
                            detectorCount={detCount}
                            placementHeight={`${placementLabel(zr.result.placementHeight, t)} (${zr.result.placementHeightM})`}
                          />

                          {/* Placement limitations notice */}
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                            <div className="flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                                  {lang === "fr" ? "Placement indicatif" : "Indicative Placement Only"}
                                </p>
                                <p className="text-[10px] text-blue-600 leading-relaxed">
                                  {lang === "fr"
                                    ? "Ce plan est une recommandation basée sur les sources de fuite identifiées et la densité du gaz. Il ne prend PAS en compte : ventilation (forcée ou naturelle), portes et ouvertures, courants d'air, obstacles physiques (cloisons, racks). Le positionnement final des détecteurs doit être validé par un ingénieur qualifié sur site."
                                    : "This plan is a recommendation based on identified leak sources and gas density. It does NOT account for: ventilation (forced or natural), doors and openings, air currents, physical obstructions (partitions, racks). Final detector positioning must be validated by a qualified engineer on site."}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Include in PDF toggle */}
                          <label className="flex items-center gap-2 mt-2 text-[10px] text-[#6b8da5] cursor-pointer no-print">
                            <input
                              type="checkbox"
                              checked={includeInPdf}
                              onChange={() => toggleIncludePlanInPdf(zr.zoneId)}
                              className="w-3 h-3 rounded border-[#d1d5db] text-[#A7C031] focus:ring-[#A7C031]"
                            />
                            Include plan in PDF
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}

        {/* ── SUMMARY ────────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-[#f8fafc] border-t-2 border-[#16354B]">
          <h2 className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-3">{t.summary}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#6b8da5]">{t.totalZones}:</span>
                <span className="font-bold text-[#16354B]">{zones.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#6b8da5] text-xs">{t.totalDetectors}:</span>
                <span className="text-xl font-extrabold text-[#16354B]">{totalDetectors}</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[#6b8da5]">{t.standard}:</span>{" "}
                <span className="font-semibold text-[#16354B]">{regulationName}</span>
              </div>
              <div>
                <span className="text-[#6b8da5]">{t.calculationMethod}:</span>{" "}
                <span className="font-semibold text-[#16354B]">
                  {hasAnyAreaMode && t.areaBased}
                  {hasAnyAreaMode && hasAnyClusterMode && " + "}
                  {hasAnyClusterMode && t.clusterBased}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── DISCLAIMER ─────────────────────────────────────────── */}
        <div className="px-6 py-3 bg-[#fefce8] border-t border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">{t.disclaimer}</p>
              <p className="text-[10px] text-amber-600 mt-0.5 leading-relaxed">{t.disclaimerText}</p>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ─────────────────────────────────────── */}
        <div className="px-6 py-4 bg-white border-t border-[#e2e8f0] flex items-center gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#16354B] text-white text-sm font-semibold rounded-lg hover:bg-[#1e4a6a] transition-colors"
          >
            <Printer className="w-4 h-4" />
            {t.print}
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E63946] text-white text-sm font-semibold rounded-lg hover:bg-[#d32f3c] transition-colors"
          >
            <Download className="w-4 h-4" />
            {t.downloadPdf}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#A7C031] text-white text-sm font-semibold rounded-lg hover:bg-[#8fb028] transition-colors"
          >
            <Save className="w-4 h-4" />
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
