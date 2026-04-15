"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import type { ZoneData } from "./types";
import type { Lang } from "./i18n";

// ─── Types ───────────────────────────────────────────────────────────────────

type SourceType = "evaporator" | "valve" | "joint" | "compressor" | "other";
type DragTarget = { type: "source"; id: string } | null;

interface PlacedSource {
  id: string;
  type: SourceType;
  x: number; // 0-100%
  y: number; // 0-100%
  label: string;
}

interface ZonePlanProps {
  zone: ZoneData;
  onUpdate: (patch: Partial<ZoneData>) => void;
  recommendedDetectors: number;
  placementHeight: string | null;
  gasDensity: "heavier" | "lighter" | "neutral" | null; // relative to air
  lang: Lang;
}

// ─── Translations ────────────────────────────────────────────────────────────

const T = {
  en: {
    plan: "Zone Plan", openPlan: "Open Zone Plan", closePlan: "Close Plan", openHint: "Add probable leak sources to optimize detector placement",
    dragHint: "Drag elements to position them", length: "L", width: "W",
    evaporator: "Evaporator", valve: "Valve", joint: "Joint", compressor: "Compressor", other: "Other",
    detector: "Detector", calculate: "Calculate Detectors", recalculate: "Recalculate",
    coverage: "Coverage", coveredNote: "All leak sources within detector range",
    uncoveredNote: "area(s) not covered \u2014 add more sources or check placement",
    gasHeavier: "Gas heavier than air \u2014 detectors at FLOOR level",
    gasLighter: "Gas lighter than air \u2014 detectors at CEILING level",
    gasNeutral: "Gas neutral density \u2014 detectors at breathing zone level",
    reportTitle: "Placement Report",
    reportDetectors: "detector(s) recommended (EN 378-3)",
    reportPlacement: "Placement",
    reportFloor: "Floor level (0.3m from ground)",
    reportCeiling: "Ceiling level (0.3m from ceiling)",
    reportBreathing: "Breathing zone (1.5m height)",
    reportDistance: "from nearest source",
    reportEnsure: "Ensure clear air path between source and detector",
    reportNoSources: "Add leak sources or equipment to get placement recommendations",
    reportRule: "Each leak source must be within 7m of a detector (EN 378-3)",
    reportOptimized: "Optimized: this count will be used for your calculation",
  },
  fr: {
    plan: "Plan de zone", openPlan: "Ouvrir le plan", closePlan: "Fermer le plan", openHint: "Ajoutez les sources de fuite probables pour optimiser le placement des d\u00e9tecteurs",
    dragHint: "Glissez les \u00e9l\u00e9ments pour les positionner", length: "L", width: "l",
    evaporator: "\u00c9vaporateur", valve: "Vanne", joint: "Raccord", compressor: "Compresseur", other: "Autre",
    detector: "D\u00e9tecteur", calculate: "Calculer d\u00e9tecteurs", recalculate: "Recalculer",
    coverage: "Couverture", coveredNote: "Toutes les sources de fuite dans la port\u00e9e des d\u00e9tecteurs",
    uncoveredNote: "zone(s) non couvertes \u2014 ajoutez des sources ou v\u00e9rifiez le placement",
    gasHeavier: "Gaz plus lourd que l'air \u2014 d\u00e9tecteurs au SOL",
    gasLighter: "Gaz plus l\u00e9ger que l'air \u2014 d\u00e9tecteurs au PLAFOND",
    gasNeutral: "Gaz de densit\u00e9 neutre \u2014 d\u00e9tecteurs en zone respiratoire",
    reportTitle: "Rapport de placement",
    reportDetectors: "d\u00e9tecteur(s) recommand\u00e9s (EN 378-3)",
    reportPlacement: "Placement",
    reportFloor: "Au sol (0,3m du sol)",
    reportCeiling: "Au plafond (0,3m du plafond)",
    reportBreathing: "Zone respiratoire (1,5m de hauteur)",
    reportDistance: "de la source la plus proche",
    reportEnsure: "Assurer un chemin d'air d\u00e9gag\u00e9 entre la source et le d\u00e9tecteur",
    reportNoSources: "Ajoutez des sources de fuite ou des \u00e9quipements pour obtenir des recommandations",
    reportRule: "Chaque source de fuite doit \u00eatre \u00e0 moins de 7m d'un d\u00e9tecteur (EN 378-3)",
    reportOptimized: "Optimis\u00e9 : ce nombre sera utilis\u00e9 pour votre calcul",
  },
  sv: {
    plan: "Zonplan", openPlan: "\u00d6ppna plan", closePlan: "St\u00e4ng plan", openHint: "L\u00e4gg till troliga l\u00e4ckagek\u00e4llor f\u00f6r att optimera detektorplacering",
    dragHint: "Dra element f\u00f6r att placera dem", length: "L", width: "B",
    evaporator: "F\u00f6r\u00e5ngare", valve: "Ventil", joint: "Koppling", compressor: "Kompressor", other: "Annat",
    detector: "Detektor", calculate: "Ber\u00e4kna detektorer", recalculate: "Ber\u00e4kna om",
    coverage: "T\u00e4ckning", coveredNote: "Alla l\u00e4ckagek\u00e4llor inom detektorr\u00e4ckvidd",
    uncoveredNote: "omr\u00e5de(n) ej t\u00e4ckt \u2014 l\u00e4gg till k\u00e4llor eller kontrollera placering",
    gasHeavier: "Gas tyngre \u00e4n luft \u2014 detektorer vid GOLV",
    gasLighter: "Gas l\u00e4ttare \u00e4n luft \u2014 detektorer vid TAK",
    gasNeutral: "Gas neutral densitet \u2014 detektorer i andningszon",
    reportTitle: "Placeringsrapport",
    reportDetectors: "detektor(er) rekommenderade (EN 378-3)",
    reportPlacement: "Placering",
    reportFloor: "Golvniv\u00e5 (0,3m fr\u00e5n golv)",
    reportCeiling: "Takniv\u00e5 (0,3m fr\u00e5n tak)",
    reportBreathing: "Andningszon (1,5m h\u00f6jd)",
    reportDistance: "fr\u00e5n n\u00e4rmaste k\u00e4lla",
    reportEnsure: "S\u00e4kerst\u00e4ll fri luftv\u00e4g mellan k\u00e4lla och detektor",
    reportNoSources: "L\u00e4gg till l\u00e4ckagek\u00e4llor eller utrustning f\u00f6r placeringsrekommendationer",
    reportRule: "Varje l\u00e4ckagek\u00e4lla m\u00e5ste vara inom 7m fr\u00e5n en detektor (EN 378-3)",
    reportOptimized: "Optimerat: detta antal anv\u00e4nds f\u00f6r din ber\u00e4kning",
  },
  de: {
    plan: "Zonenplan", openPlan: "Plan \u00f6ffnen", closePlan: "Plan schlie\u00dfen", openHint: "F\u00fcgen Sie wahrscheinliche Leckagequellen hinzu um die Detektorplatzierung zu optimieren",
    dragHint: "Elemente ziehen zum Positionieren", length: "L", width: "B",
    evaporator: "Verdampfer", valve: "Ventil", joint: "Verbindung", compressor: "Kompressor", other: "Sonstige",
    detector: "Detektor", calculate: "Detektoren berechnen", recalculate: "Neu berechnen",
    coverage: "Abdeckung", coveredNote: "Alle Leckagequellen in Detektorreichweite",
    uncoveredNote: "Bereich(e) nicht abgedeckt \u2014 Quellen hinzuf\u00fcgen oder Platzierung pr\u00fcfen",
    gasHeavier: "Gas schwerer als Luft \u2014 Detektoren am BODEN",
    gasLighter: "Gas leichter als Luft \u2014 Detektoren an der DECKE",
    gasNeutral: "Gas neutrale Dichte \u2014 Detektoren in Atemzone",
    reportTitle: "Platzierungsbericht",
    reportDetectors: "Detektor(en) empfohlen (EN 378-3)",
    reportPlacement: "Platzierung",
    reportFloor: "Bodenniveau (0,3m vom Boden)",
    reportCeiling: "Deckenniveau (0,3m von der Decke)",
    reportBreathing: "Atemzone (1,5m H\u00f6he)",
    reportDistance: "von n\u00e4chster Quelle",
    reportEnsure: "Freien Luftweg zwischen Quelle und Detektor sicherstellen",
    reportNoSources: "Leckagequellen oder Ger\u00e4te hinzuf\u00fcgen f\u00fcr Platzierungsempfehlungen",
    reportRule: "Jede Leckagequelle muss innerhalb von 7m eines Detektors liegen (EN 378-3)",
    reportOptimized: "Optimiert: diese Anzahl wird f\u00fcr Ihre Berechnung verwendet",
  },
  es: {
    plan: "Plano de zona", openPlan: "Abrir plano", closePlan: "Cerrar plano", openHint: "A\u00f1ada fuentes de fuga probables para optimizar la ubicaci\u00f3n de los detectores",
    dragHint: "Arrastre elementos para posicionarlos", length: "L", width: "A",
    evaporator: "Evaporador", valve: "V\u00e1lvula", joint: "Uni\u00f3n", compressor: "Compresor", other: "Otro",
    detector: "Detector", calculate: "Calcular detectores", recalculate: "Recalcular",
    coverage: "Cobertura", coveredNote: "Todas las fuentes de fuga dentro del alcance del detector",
    uncoveredNote: "zona(s) no cubierta(s) \u2014 a\u00f1ada fuentes o verifique la ubicaci\u00f3n",
    gasHeavier: "Gas m\u00e1s pesado que el aire \u2014 detectores a nivel del SUELO",
    gasLighter: "Gas m\u00e1s ligero que el aire \u2014 detectores a nivel del TECHO",
    gasNeutral: "Gas de densidad neutra \u2014 detectores en zona respiratoria",
    reportTitle: "Informe de ubicaci\u00f3n",
    reportDetectors: "detector(es) recomendados (EN 378-3)",
    reportPlacement: "Ubicaci\u00f3n",
    reportFloor: "Nivel del suelo (0,3m del suelo)",
    reportCeiling: "Nivel del techo (0,3m del techo)",
    reportBreathing: "Zona respiratoria (1,5m de altura)",
    reportDistance: "de la fuente m\u00e1s cercana",
    reportEnsure: "Asegurar un camino de aire libre entre fuente y detector",
    reportNoSources: "A\u00f1ada fuentes de fuga o equipos para obtener recomendaciones",
    reportRule: "Cada fuente de fuga debe estar dentro de 7m de un detector (EN 378-3)",
    reportOptimized: "Optimizado: esta cantidad se utilizar\u00e1 para su c\u00e1lculo",
  },
} as const;

// ─── Source type config ──────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<SourceType, { color: string; shape: "rect" | "diamond" | "circle" | "rrect" | "triangle"; priority: number }> = {
  compressor:  { color: "#475569", shape: "rrect",    priority: 1 },
  evaporator:  { color: "#2563eb", shape: "rect",     priority: 2 },
  valve:       { color: "#f59e0b", shape: "diamond",  priority: 3 },
  joint:       { color: "#7c3aed", shape: "circle",   priority: 4 },
  other:       { color: "#E63946", shape: "triangle",  priority: 5 },
};

// ─── Detector placement logic ────────────────────────────────────────────────

const WALL_OFFSET = 4;
const MAX_DISTANCE_M = 7;

function snapToWall(px: number, py: number): { x: number; y: number; wall: "top" | "right" | "bottom" | "left" } {
  const dLeft = px, dRight = 100 - px, dTop = py, dBottom = 100 - py;
  const min = Math.min(dLeft, dRight, dTop, dBottom);
  if (min === dLeft)   return { x: WALL_OFFSET, y: py, wall: "left" };
  if (min === dRight)  return { x: 100 - WALL_OFFSET, y: py, wall: "right" };
  if (min === dTop)    return { x: px, y: WALL_OFFSET, wall: "top" };
  return { x: px, y: 100 - WALL_OFFSET, wall: "bottom" };
}

function distributeOnWalls(count: number): { x: number; y: number; wall: string }[] {
  if (count <= 0) return [];
  const positions: { x: number; y: number; wall: string }[] = [];
  const seg = 100 - 2 * WALL_OFFSET;
  const perimeter = 4 * seg;
  const spacing = perimeter / count;
  for (let i = 0; i < count; i++) {
    const d = (spacing * i + spacing / 2) % perimeter;
    if (d < seg)          positions.push({ x: WALL_OFFSET + d, y: WALL_OFFSET, wall: "top" });
    else if (d < 2 * seg) positions.push({ x: 100 - WALL_OFFSET, y: WALL_OFFSET + (d - seg), wall: "right" });
    else if (d < 3 * seg) positions.push({ x: 100 - WALL_OFFSET - (d - 2 * seg), y: 100 - WALL_OFFSET, wall: "bottom" });
    else                  positions.push({ x: WALL_OFFSET, y: 100 - WALL_OFFSET - (d - 3 * seg), wall: "left" });
  }
  return positions;
}

function computeDetectorPositions(
  count: number,
  sources: { x: number; y: number; type: SourceType }[],
  roomLm: number,
  roomWm: number,
): { x: number; y: number; wall: string }[] {
  if (count <= 0) return [];
  if (sources.length === 0) return distributeOnWalls(count);

  const sorted = [...sources].sort((a, b) =>
    (SOURCE_CONFIG[a.type]?.priority ?? 5) - (SOURCE_CONFIG[b.type]?.priority ?? 5)
  );

  const positions: { x: number; y: number; wall: string }[] = [];
  const covered = new Set<number>();
  const used = new Set<string>();

  for (let round = 0; round < sorted.length && positions.length < Math.max(count, sorted.length); round++) {
    const srcIdx = sorted.findIndex((_, i) => !covered.has(i));
    if (srcIdx === -1) break;

    const src = sorted[srcIdx];
    const snapped = snapToWall(src.x, src.y);

    const key = `${Math.round(snapped.x)}-${Math.round(snapped.y)}`;
    if (used.has(key)) {
      const re = snapToWall(src.x + 8, src.y + 6);
      snapped.x = re.x; snapped.y = re.y; snapped.wall = re.wall;
    }
    used.add(`${Math.round(snapped.x)}-${Math.round(snapped.y)}`);
    positions.push(snapped);

    for (let i = 0; i < sorted.length; i++) {
      const dist = realDistanceM(snapped.x, snapped.y, sorted[i].x, sorted[i].y, roomLm, roomWm);
      if (dist <= MAX_DISTANCE_M) covered.add(i);
    }
  }

  return positions;
}

function maxDistancePct(surfaceM2: number): number {
  const roomSideM = Math.sqrt(surfaceM2 || 100);
  return (MAX_DISTANCE_M / roomSideM) * 100;
}

function realDistanceM(x1: number, y1: number, x2: number, y2: number, roomLm: number, roomWm: number): number {
  const dx = ((x2 - x1) / 100) * roomLm;
  const dy = ((y2 - y1) / 100) * roomWm;
  return Math.sqrt(dx * dx + dy * dy);
}

// ─── SVG Shape renderers ────────────────────────────────────────────────────

function SourceShape({ type, x, y, s, color }: { type: SourceType; x: number; y: number; s: number; color: string }) {
  const cfg = SOURCE_CONFIG[type];
  const half = s / 2;
  switch (cfg.shape) {
    case "rect":
      return <rect x={x - half} y={y - half} width={s} height={s} rx={0.5} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={0.6} />;
    case "rrect":
      return <rect x={x - half} y={y - half * 0.7} width={s} height={s * 0.7} rx={1.5} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={0.6} />;
    case "diamond":
      return <polygon points={`${x},${y - half} ${x + half},${y} ${x},${y + half} ${x - half},${y}`} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={0.6} />;
    case "circle":
      return <circle cx={x} cy={y} r={half} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={0.6} />;
    case "triangle":
      return <polygon points={`${x},${y - half} ${x - half},${y + half * 0.7} ${x + half},${y + half * 0.7}`} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={0.6} />;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ZonePlan({ zone, onUpdate, recommendedDetectors, placementHeight, gasDensity, lang }: ZonePlanProps) {
  const t = T[lang];
  const svgRef = useRef<SVGSVGElement>(null);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState<DragTarget | { type: "detector"; idx: number } | null>(null);
  const [showDetectors, setShowDetectors] = useState(false);
  const [manualDetectorPositions, setManualDetectorPositions] = useState<{ x: number; y: number; wall: string }[] | null>(null);

  function getSourceType(id: string): SourceType {
    const prefix = id.split("-")[0];
    if (prefix in SOURCE_CONFIG) return prefix as SourceType;
    return "other";
  }

  const placedSources: PlacedSource[] = useMemo(() => [
    ...zone.leakSources
      .filter((s) => s.x !== undefined && s.y !== undefined)
      .map((s) => ({ id: s.id, type: getSourceType(s.id), x: s.x ?? 50, y: s.y ?? 50, label: s.description || "" })),
    ...(zone.evaporatorPositions || []).map((e) => ({ id: e.id, type: "evaporator" as SourceType, x: e.x, y: e.y, label: "" })),
  ], [zone.leakSources, zone.evaporatorPositions]);

  const roomL = zone.length || Math.sqrt(zone.surface || 100);
  const roomW = zone.width || (zone.surface ? zone.surface / roomL : Math.sqrt(100));
  const aspect = Math.max(0.5, Math.min(2, roomL / roomW));
  const svgW = 100;
  const svgH = svgW / aspect;

  const clusterCount = useMemo(() => {
    if (placedSources.length === 0) return 0;
    const parent = new Map<string, string>();
    const find = (id: string): string => {
      if (!parent.has(id)) parent.set(id, id);
      let root = id;
      while (parent.get(root) !== root) root = parent.get(root)!;
      let curr = id;
      while (curr !== root) { const next = parent.get(curr)!; parent.set(curr, root); curr = next; }
      return root;
    };
    const union = (a: string, b: string) => { parent.set(find(a), find(b)); };
    for (const s of placedSources) find(s.id);
    for (let i = 0; i < placedSources.length; i++) {
      for (let j = i + 1; j < placedSources.length; j++) {
        const a = placedSources[i], b = placedSources[j];
        const dist = realDistanceM(a.x, a.y, b.x, b.y, roomL, roomW);
        if (dist <= MAX_DISTANCE_M) union(a.id, b.id);
      }
    }
    return new Set(placedSources.map(s => find(s.id))).size;
  }, [placedSources, roomL, roomW]);

  const autoDetectorPositions = useMemo(() => {
    if (placedSources.length === 0) {
      return distributeOnWalls(recommendedDetectors);
    }
    return computeDetectorPositions(
      placedSources.length,
      placedSources.map((s) => ({ x: s.x, y: s.y, type: s.type })),
      roomL,
      roomW,
    );
  }, [placedSources, recommendedDetectors, roomL, roomW]);

  const planDetectorCount = autoDetectorPositions.length;

  const detectorPositions = showDetectors
    ? (manualDetectorPositions ?? autoDetectorPositions)
    : [];

  const maxDistPct = maxDistancePct(zone.surface);

  const coverageResult = useMemo(() => {
    if (!showDetectors || detectorPositions.length === 0 || placedSources.length === 0)
      return { pct: null, uncovered: [] as PlacedSource[] };
    let covered = 0;
    const uncovered: PlacedSource[] = [];
    for (const src of placedSources) {
      const inRange = detectorPositions.some((d) => {
        const dist = realDistanceM(d.x, d.y, src.x, src.y, roomL, roomW);
        return dist <= MAX_DISTANCE_M;
      });
      if (inRange) covered++;
      else uncovered.push(src);
    }
    return { pct: Math.round((covered / placedSources.length) * 100), uncovered };
  }, [showDetectors, detectorPositions, placedSources, roomL, roomW]);
  const coveragePct = coverageResult.pct;

  const toPercent = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 50, y: 50 };
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.max(3, Math.min(97, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(3, Math.min(97, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const pos = toPercent(e);

    if (dragging.type === "detector") {
      const snapped = snapToWall(pos.x, pos.y);
      setManualDetectorPositions((prev) => {
        const arr = prev ? [...prev] : [...autoDetectorPositions];
        arr[(dragging as { idx: number }).idx] = { ...snapped };
        return arr;
      });
      return;
    }

    const isLeak = zone.leakSources.some((s) => s.id === dragging.id);
    if (isLeak) {
      onUpdate({ leakSources: zone.leakSources.map((s) => s.id === dragging.id ? { ...s, x: pos.x, y: pos.y } : s) });
    } else {
      onUpdate({ evaporatorPositions: (zone.evaporatorPositions || []).map((ev) => ev.id === dragging.id ? { ...ev, x: pos.x, y: pos.y } : ev) });
    }
  }, [dragging, toPercent, onUpdate, zone.leakSources, zone.evaporatorPositions, autoDetectorPositions]);

  const addSource = useCallback((type: SourceType) => {
    const pos = { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 };
    if (type === "evaporator") {
      onUpdate({ evaporatorPositions: [...(zone.evaporatorPositions || []), { id: `evap-${Date.now()}`, ...pos }] });
    } else {
      onUpdate({ leakSources: [...zone.leakSources, { id: `${type}-${Date.now()}`, description: "", x: pos.x, y: pos.y }] });
    }
    setShowDetectors(false); setManualDetectorPositions(null);
  }, [onUpdate, zone.evaporatorPositions, zone.leakSources]);

  const removeSource = useCallback((id: string) => {
    const isLeak = zone.leakSources.some((s) => s.id === id);
    if (isLeak) {
      onUpdate({ leakSources: zone.leakSources.filter((s) => s.id !== id) });
    } else {
      onUpdate({ evaporatorPositions: (zone.evaporatorPositions || []).filter((e) => e.id !== id) });
    }
    setShowDetectors(false);
  }, [onUpdate, zone.leakSources, zone.evaporatorPositions]);

  const sourceLabel = (type: SourceType) => {
    const key = type as keyof typeof t;
    return t[key] || type;
  };

  if (zone.surface <= 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-[#e2e8f0] overflow-hidden">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 bg-[#f8fafc] hover:bg-[#f0f4f8] border-b border-[#e2e8f0] flex items-center gap-2 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 text-[#16354B]" />
        <span className="text-xs font-semibold text-[#16354B]">{open ? t.closePlan : t.openPlan}</span>
        <span className="text-[10px] text-[#6b8da5] ml-1">&mdash; {open ? `${roomL.toFixed(1)}m \u00d7 ${roomW.toFixed(1)}m` : t.openHint}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-[#6b8da5] ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 text-[#6b8da5] ml-auto" />}
      </button>

      {open && (
        <div className="bg-white">
          {/* Toolbar */}
          <div className="px-3 py-2 border-b border-[#e2e8f0] flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-[#6b8da5] font-semibold mr-1">+</span>
            {(Object.keys(SOURCE_CONFIG) as SourceType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addSource(type)}
                className="flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-semibold transition-colors hover:shadow-sm"
                style={{ borderColor: SOURCE_CONFIG[type].color + "60", color: SOURCE_CONFIG[type].color, background: SOURCE_CONFIG[type].color + "08" }}
              >
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SOURCE_CONFIG[type].color + "30", border: `1px solid ${SOURCE_CONFIG[type].color}` }} />
                {sourceLabel(type)}
              </button>
            ))}
          </div>

          {/* Dimension inputs */}
          <div className="px-3 py-2 flex items-center gap-3 border-b border-[#e2e8f0] text-[10px]">
            <div className="flex items-center gap-1">
              <label className="font-semibold text-[#6b8da5] uppercase">{t.length}</label>
              <input type="number" min={0} step={0.5} className="w-14 bg-[#f8fafc] border border-[#e2e8f0] rounded px-1.5 py-1 text-xs text-[#16354B] focus:border-[#16354B] outline-none" value={zone.length || ""} placeholder={roomL.toFixed(1)} onChange={(e) => onUpdate({ length: e.target.value ? parseFloat(e.target.value) : null })} />
              <span className="text-[#6b8da5]">m</span>
            </div>
            <span className="text-[#6b8da5]">&times;</span>
            <div className="flex items-center gap-1">
              <label className="font-semibold text-[#6b8da5] uppercase">{t.width}</label>
              <input type="number" min={0} step={0.5} className="w-14 bg-[#f8fafc] border border-[#e2e8f0] rounded px-1.5 py-1 text-xs text-[#16354B] focus:border-[#16354B] outline-none" value={zone.width || ""} placeholder={roomW.toFixed(1)} onChange={(e) => onUpdate({ width: e.target.value ? parseFloat(e.target.value) : null })} />
              <span className="text-[#6b8da5]">m</span>
            </div>
            <span className="text-[10px] text-[#6b8da5] ml-auto">{t.dragHint}</span>
          </div>

          {/* Gas density arrow */}
          {gasDensity && (
            <div className={`px-3 py-1.5 flex items-center gap-2 text-[10px] font-semibold border-b border-[#e2e8f0] ${
              gasDensity === "heavier" ? "bg-blue-50 text-blue-700" : gasDensity === "lighter" ? "bg-orange-50 text-orange-700" : "bg-gray-50 text-gray-600"
            }`}>
              <span className="text-base">{gasDensity === "heavier" ? "\u2b07\ufe0f" : gasDensity === "lighter" ? "\u2b06\ufe0f" : "\u2194\ufe0f"}</span>
              {gasDensity === "heavier" ? t.gasHeavier : gasDensity === "lighter" ? t.gasLighter : t.gasNeutral}
            </div>
          )}

          {/* SVG Plan */}
          <div className="p-4">
            <svg
              ref={svgRef}
              viewBox={`-2 -2 ${svgW + 4} ${svgH + 10}`}
              className="w-full rounded-lg select-none"
              style={{ maxHeight: 350, background: "#f8fafc" }}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setDragging(null)}
              onMouseLeave={() => setDragging(null)}
            >
              <defs>
                <clipPath id={`room-clip-${zone.id}`}>
                  <rect x={0} y={0} width={svgW} height={svgH} />
                </clipPath>
              </defs>

              {/* Room fill */}
              <rect x={0} y={0} width={svgW} height={svgH} fill="white" stroke="#16354B" strokeWidth={1.5} rx={1} />

              {/* Subtle grid */}
              {Array.from({ length: 4 }, (_, i) => (
                <line key={`gv-${i}`} x1={(i + 1) * 20} y1={0} x2={(i + 1) * 20} y2={svgH} stroke="#e8ecf0" strokeWidth={0.15} strokeDasharray="0.5,2" />
              ))}
              {Array.from({ length: Math.floor(svgH / 20) }, (_, i) => (
                <line key={`gh-${i}`} x1={0} y1={(i + 1) * 20} x2={svgW} y2={(i + 1) * 20} stroke="#e8ecf0" strokeWidth={0.15} strokeDasharray="0.5,2" />
              ))}

              {/* Wall indicators */}
              <rect x={-0.5} y={-0.5} width={svgW + 1} height={2} fill="#16354B" fillOpacity={0.12} rx={0.5} />
              <rect x={-0.5} y={svgH - 1.5} width={svgW + 1} height={2} fill="#16354B" fillOpacity={0.12} rx={0.5} />
              <rect x={-0.5} y={-0.5} width={2} height={svgH + 1} fill="#16354B" fillOpacity={0.12} rx={0.5} />
              <rect x={svgW - 1.5} y={-0.5} width={2} height={svgH + 1} fill="#16354B" fillOpacity={0.12} rx={0.5} />

              {/* LAYER 1: Coverage zones */}
              {detectorPositions.map((pos, i) => {
                const cy = pos.y * (svgH / 100);
                const rxPct = (MAX_DISTANCE_M / roomL) * 100;
                const ryPct = (MAX_DISTANCE_M / roomW) * 100 * (svgH / 100);
                return (
                  <ellipse key={`cov-${i}`} cx={pos.x} cy={cy} rx={rxPct} ry={ryPct}
                    fill="#A7C031" fillOpacity={0.08} stroke="#A7C031" strokeWidth={0.2} strokeOpacity={0.3}
                    clipPath={`url(#room-clip-${zone.id})`} />
                );
              })}

              {/* LAYER 2: Connection lines */}
              {detectorPositions.map((pos, i) => {
                const cy = pos.y * (svgH / 100);
                if (placedSources.length === 0) return null;
                let closest = placedSources[0];
                let minDist = Infinity;
                for (const s of placedSources) {
                  const d = Math.hypot(s.x - pos.x, (s.y * (svgH / 100)) - cy);
                  if (d < minDist) { minDist = d; closest = s; }
                }
                const distM = realDistanceM(pos.x, pos.y, closest.x, closest.y, roomL, roomW);
                const tooFar = distM > MAX_DISTANCE_M;
                return (
                  <g key={`line-${i}`}>
                    <line x1={pos.x} y1={cy} x2={closest.x} y2={closest.y * (svgH / 100)}
                      stroke={tooFar ? "#ef4444" : "#A7C031"} strokeWidth={0.4} strokeDasharray="1.5,1" strokeOpacity={0.5} />
                    <text x={(pos.x + closest.x) / 2} y={(cy + closest.y * (svgH / 100)) / 2 - 1}
                      textAnchor="middle" className={`text-[2.5px] font-semibold ${tooFar ? "fill-[#ef4444]" : "fill-[#6b8da5]"}`}
                      style={{ pointerEvents: "none" }}>
                      {distM.toFixed(1)}m
                    </text>
                  </g>
                );
              })}

              {/* LAYER 3: Placed sources (draggable) */}
              {placedSources.map((src, idx) => {
                const sy = src.y * (svgH / 100);
                const cfg = SOURCE_CONFIG[src.type] || SOURCE_CONFIG.other;
                const letter = src.type[0].toUpperCase();
                const num = placedSources.filter((s, j) => j <= idx && s.type === src.type).length;
                return (
                  <g
                    key={src.id}
                    onMouseDown={(e) => { e.preventDefault(); setDragging({ type: "source", id: src.id }); }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <SourceShape type={src.type} x={src.x} y={sy} s={7} color={cfg.color} />
                    <text x={src.x} y={sy + 1} textAnchor="middle" className="text-[3px] font-bold"
                      style={{ fill: cfg.color, pointerEvents: "none" }}>
                      {letter}{num}
                    </text>
                    <g onClick={(e) => { e.stopPropagation(); removeSource(src.id); }} className="cursor-pointer">
                      <circle cx={src.x + 4} cy={sy - 4} r={2} fill="#ef4444" />
                      <text x={src.x + 4} y={sy - 3} textAnchor="middle"
                        className="text-[2.5px] fill-white font-bold" style={{ pointerEvents: "none" }}>&times;</text>
                    </g>
                  </g>
                );
              })}

              {/* LAYER 4: Detectors */}
              {detectorPositions.map((pos, i) => {
                const cy = pos.y * (svgH / 100);
                const isDragging = dragging?.type === "detector" && (dragging as { idx: number }).idx === i;
                return (
                  <g key={`det-${i}`}
                    onMouseDown={(e) => { e.preventDefault(); setDragging({ type: "detector", idx: i }); }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <rect x={pos.x - 3.5} y={cy - 3.5} width={7} height={7} rx={1.5}
                      fill={isDragging ? "#8fb028" : "#A7C031"} fillOpacity={0.9}
                      stroke="white" strokeWidth={0.8} />
                    <line x1={pos.x - 1.5} y1={cy} x2={pos.x + 1.5} y2={cy} stroke="white" strokeWidth={0.5} />
                    <line x1={pos.x} y1={cy - 1.5} x2={pos.x} y2={cy + 1.5} stroke="white" strokeWidth={0.5} />
                    <text x={pos.x} y={cy + 7} textAnchor="middle"
                      className="text-[3px] fill-[#A7C031] font-bold" style={{ pointerEvents: "none" }}>
                      D{i + 1}
                    </text>
                  </g>
                );
              })}

              {/* Dimensions label */}
              <text x={svgW / 2} y={svgH + 3} textAnchor="middle" className="text-[3px] fill-[#6b8da5]">
                {roomL.toFixed(1)}m &times; {roomW.toFixed(1)}m = {zone.surface}m&sup2;
              </text>
            </svg>
          </div>

          {/* Calculate button */}
          <div className="px-3 pb-2">
            <button
              type="button"
              onClick={() => {
                setManualDetectorPositions(null);
                setShowDetectors(true);
                const autoPositions = computeDetectorPositions(
                  placedSources.length,
                  placedSources.map((s) => ({ x: s.x, y: s.y, type: s.type })),
                  roomL, roomW,
                );
                onUpdate({ planDetectorCount: placedSources.length > 0 ? autoPositions.length : null });
              }}
              className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                showDetectors
                  ? "bg-[#f0f4f8] text-[#16354B] border border-[#e2e8f0] hover:bg-[#e8ecf0]"
                  : "bg-gradient-to-r from-[#A7C031] to-[#8fb028] text-white shadow-md hover:shadow-lg"
              }`}
            >
              {showDetectors ? t.recalculate : t.calculate}
            </button>
          </div>

          {/* Coverage score */}
          {showDetectors && coveragePct !== null && (
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-[#16354B]">{t.coverage}:</span>
                <div className="flex-1 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${coveragePct}%`, background: coveragePct >= 100 ? "#A7C031" : coveragePct >= 70 ? "#f59e0b" : "#ef4444" }} />
                </div>
                <span className={`text-[10px] font-bold ${coveragePct >= 100 ? "text-[#A7C031]" : coveragePct >= 70 ? "text-amber-500" : "text-red-500"}`}>
                  {coveragePct}%
                </span>
              </div>
              <p className="text-[10px] text-[#6b8da5] mt-0.5">
                {coveragePct >= 100 ? t.coveredNote : `${Math.round(placedSources.length * (1 - coveragePct / 100))} ${t.uncoveredNote}`}
              </p>
            </div>
          )}

          {/* Mini-report */}
          {showDetectors && planDetectorCount > 0 && (
            <div className="mx-3 mb-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] p-3 space-y-1.5">
              <div className="text-[10px] font-bold text-[#16354B] uppercase tracking-wider">{t.reportTitle}</div>
              {placedSources.length > 0 && planDetectorCount !== recommendedDetectors && (
                <div className="text-[10px] text-[#6b8da5] flex items-center gap-2">
                  <span className="line-through">{recommendedDetectors} (50m&sup2; rule)</span>
                  <span>&rarr;</span>
                  <span className="font-bold text-[#A7C031]">{planDetectorCount} (cluster analysis)</span>
                </div>
              )}
              <div className="text-[11px] text-[#16354B]">
                <span className="font-bold text-[#A7C031]">{planDetectorCount}</span> {t.reportDetectors}
                {placedSources.length > 0 && <span className="text-[10px] text-[#6b8da5] ml-1">({clusterCount} cluster{clusterCount > 1 ? "s" : ""})</span>}
              </div>
              <div className="text-[11px] text-[#16354B]">
                {t.reportPlacement}: <span className="font-semibold">
                  {placementHeight === "floor" ? t.reportFloor : placementHeight === "ceiling" ? t.reportCeiling : t.reportBreathing}
                </span>
              </div>
              {detectorPositions.length > 0 && placedSources.length > 0 && detectorPositions.map((d, i) => {
                const closest = placedSources.reduce((best, s) => {
                  const dist = realDistanceM(d.x, d.y, s.x, s.y, roomL, roomW);
                  return dist < best.dist ? { src: s, dist } : best;
                }, { src: placedSources[0], dist: Infinity });
                const tooFar = closest.dist > MAX_DISTANCE_M;
                return (
                  <div key={i} className={`text-[10px] ${tooFar ? "text-red-500" : "text-[#6b8da5]"}`}>
                    D{i + 1}: <span className={`font-medium ${tooFar ? "text-red-600" : "text-[#16354B]"}`}>{closest.dist.toFixed(1)}m</span> {t.reportDistance} ({sourceLabel(closest.src.type)})
                    {tooFar && <span className="ml-1 font-bold">&gt;{MAX_DISTANCE_M}m</span>}
                  </div>
                );
              })}
              <div className="text-[10px] text-[#16354B] mt-1 font-medium">{t.reportRule}</div>
              {placedSources.length > 0 && (
                <div className="text-[10px] text-[#A7C031] font-semibold mt-0.5">{t.reportOptimized}</div>
              )}
              <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                {t.reportEnsure}
              </div>
            </div>
          )}

          {showDetectors && placedSources.length === 0 && (
            <div className="mx-3 mb-3 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[10px] text-amber-700">
              {t.reportNoSources}
            </div>
          )}

          {/* Legend */}
          <div className="px-3 pb-2 flex flex-wrap items-center gap-3 text-[10px] text-[#6b8da5]">
            {(Object.keys(SOURCE_CONFIG) as SourceType[]).map((type) => (
              <span key={type} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: SOURCE_CONFIG[type].color + "30", border: `1px solid ${SOURCE_CONFIG[type].color}` }} />
                {sourceLabel(type)}
              </span>
            ))}
            {showDetectors && (
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A7C031]/30 border border-[#A7C031] inline-block" />
                {t.detector}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
