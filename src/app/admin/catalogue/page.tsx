'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/lib/i18n-context';
import {
  X, Zap, Radio, Wrench, Box, Layers,
  Eye, Search,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  type: string;
  family: string;
  name: string;
  code: string;
  price: number;
  image: string | null;
  gas: string;
  refs: string;
  range: string | null;
  sensorTech: string | null;
  sensorLife: string | null;
  power: number | null;
  voltage: string | null;
  ip: string | null;
  tempMin: number | null;
  tempMax: number | null;
  relay: number;
  analog: string | null;
  modbus: boolean;
  standalone: boolean;
  atex: boolean;
  mount: string;
  remote: boolean;
  features: string | null;
  connectTo: string | null;
  discontinued: boolean;
  channels: number | null;
  subCategory: string | null;
  compatibleFamilies: string;
  tier: string;
  productGroup: string;
  // V2 fields
  variant: string | null;
  subType: string | null;
  function: string | null;
  status: string;
  ports: string;
  connectionRules: string;
  compatibleWith: string;
}

interface AppOption {
  id: string;
  labelEn: string;
  labelFr: string;
  icon: string;
  productFamilies: string;
  suggestedGases: string;
}

function parseJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

// ── Application sidebar items ─────────────────────────────────────────────────

const APP_ICONS: Record<string, string> = {
  supermarket: '\u{1F6D2}', cold_room: '\u{2744}\uFE0F', machinery_room: '\u{2699}\uFE0F',
  cold_storage: '\u{1F9CA}', hotel: '\u{1F3E8}', office: '\u{1F3E2}',
  parking: '\u{1F17F}\uFE0F', ice_rink: '\u{26F8}\uFE0F', heat_pump: '\u{1F525}',
  pressure_relief: '\u{1F4A8}', duct: '\u{1F4A8}', atex_zone: '\u{26A0}\uFE0F',
  water_brine: '\u{1F4A7}', data_center: '\u{1F5A5}\uFE0F', marine: '\u{26F5}',
};

const GAS_GROUPS = [
  { group: 'CO2', items: [
    { id: 'R744', label: 'CO2 (R744)', color: '#3b82f6' },
  ]},
  { group: 'HFC / HFO', items: [
    { id: 'R32', label: 'R32', color: '#22c55e' },
    { id: 'R134A', label: 'R134A', color: '#14b8a6' },
    { id: 'R410A', label: 'R410A', color: '#10b981' },
    { id: 'R404A', label: 'R404A', color: '#059669' },
    { id: 'R449A', label: 'R449A', color: '#047857' },
    { id: 'R1234yf', label: 'R1234yf', color: '#22d3ee' },
  ]},
  { group: 'HC', items: [
    { id: 'R290', label: 'R290 Propane', color: '#f97316' },
  ]},
  { group: 'NH3', items: [
    { id: 'R717', label: 'NH3 (R717)', color: '#a855f7' },
  ]},
  { group: 'SAFETY / TOXIC', items: [
    { id: 'CO', label: 'CO', color: '#ef4444' },
    { id: 'NO2', label: 'NO2', color: '#eab308' },
    { id: 'O2', label: 'O2', color: '#06b6d4' },
  ]},
];

// ── Tier badge ────────────────────────────────────────────────────────────────

function tierBadge(tier: string) {
  const tierNorm = tier?.toLowerCase() ?? '';
  if (tierNorm.includes('premium') && tierNorm.includes('ir')) {
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30">Premium IR</span>;
  }
  if (tierNorm.includes('premium') && tierNorm.includes('ec')) {
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30">Premium EC</span>;
  }
  if (tierNorm.includes('premium')) {
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/30">Premium</span>;
  }
  if (tierNorm.includes('economic')) {
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#16a34a]/20 text-[#16a34a] border border-[#16a34a]/30">Economic</span>;
  }
  // default: standard
  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#2563eb]/20 text-[#2563eb] border border-[#2563eb]/30">Standard</span>;
}

// ── Type badge colors ─────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  sensor: 'bg-purple-600', detector: 'bg-blue-600', controller: 'bg-green-600', alert: 'bg-red-600', accessory: 'bg-teal-600',
};
const TYPE_LABELS: Record<string, string> = {
  sensor: 'Sensor', detector: 'Detector', controller: 'Controller', alert: 'Alert', accessory: 'Accessory',
};

function safetyBadgeColor(sc: string): string {
  const u = sc.toUpperCase();
  if (u === 'A1') return 'bg-emerald-900/40 text-emerald-400 border-emerald-700';
  if (u === 'A2L') return 'bg-amber-900/40 text-amber-400 border-amber-700';
  if (u === 'A2') return 'bg-orange-900/40 text-orange-400 border-orange-700';
  if (u === 'A3') return 'bg-red-900/40 text-red-400 border-red-700';
  if (u === 'B1') return 'bg-blue-900/40 text-blue-400 border-blue-700';
  if (u === 'B2L') return 'bg-pink-900/40 text-pink-400 border-pink-700';
  return 'bg-gray-800 text-gray-400 border-gray-600';
}

function typeBadge(type: string) {
  return (
    <span className={`${TYPE_COLORS[type] ?? 'bg-gray-600'} text-white text-[9px] font-bold px-2 py-0.5 rounded`}>
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}

// ── Gas chip color lookup ────────────────────────────────────────────────────

const GAS_COLOR_MAP: Record<string, string> = {};
for (const group of GAS_GROUPS) {
  for (const item of group.items) {
    GAS_COLOR_MAP[item.id] = item.color;
  }
}
function gasColor(gasId: string): string {
  return GAS_COLOR_MAP[gasId] ?? '#6b7280';
}

// ── Chip component ─────────────────────────────────────────────────────────────

function Chip({
  label, active, color, onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full transition-all ${
        active
          ? 'text-white'
          : 'bg-[#162a3d] text-gray-500 hover:text-gray-300'
      }`}
      style={active && color ? { backgroundColor: color + 'cc', border: `1px solid ${color}` } : active ? { backgroundColor: '#E63946cc', border: '1px solid #E63946' } : { border: '1px solid #1a3a50' }}
    >
      {label}
    </button>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function ProductDetailModal({ product: p, onClose }: { product: Product; onClose: () => void }) {
  const gases = parseJson<string[]>(p.gas, []);
  const refs = parseJson<string[]>(p.refs, []);
  const mountTypes = parseJson<string[]>(p.mount, []);
  const compatFamilies = parseJson<string[]>(p.compatibleFamilies, []);
  const compatWith = parseJson<string[]>(p.compatibleWith, []);
  const connectToList = parseJson<string[]>(p.connectTo, []);
  const isDetection = p.type === 'detector' || p.type === 'sensor';

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
         onClick={onClose}>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 transition-opacity" />

      {/* Modal card */}
      <div className="relative bg-[#0f1f2e] border border-[#1a3a50] rounded-xl max-w-3xl w-full mx-4 my-8 shadow-2xl"
           onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 p-1 rounded-lg hover:bg-[#1a3a50] transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex gap-6 p-6 border-b border-[#1a3348]">
          {/* Image */}
          <div className="w-48 h-48 bg-[#162a3d] rounded-lg flex items-center justify-center shrink-0 p-4">
            {p.image ? (
              <img src={`/assets/${p.image}`} alt={p.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="text-gray-600 text-2xl font-bold opacity-30 select-none">{p.family}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white mb-1">{p.name}</h2>
            <p className="text-sm text-gray-400 mb-2">
              {p.family}{p.variant ? ` \u2014 ${p.variant}` : ''}
            </p>
            <p className="text-xs font-mono text-gray-500 mb-3">{p.code}</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {typeBadge(p.type)}
              {tierBadge(p.tier)}
              {p.status === 'planned' && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Planned</span>
              )}
              {p.standalone && isDetection && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Standalone</span>
              )}
              {p.atex && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">ATEX</span>
              )}
            </div>
            {p.price > 0 && (
              <div className="text-2xl font-bold text-white">{p.price.toFixed(0)} <span className="text-sm text-gray-500">{'\u20AC'}</span></div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="p-6 space-y-6">

          {/* Detection */}
          {isDetection && (
            <section>
              <h3 className="text-xs font-bold text-[#E63946] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Search className="w-3.5 h-3.5" /> Detection
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {p.range && <DetailRow label="Range" value={p.range} />}
                {p.sensorTech && <DetailRow label="Sensor Tech" value={p.sensorTech} />}
                {p.sensorLife && <DetailRow label="Sensor Life" value={p.sensorLife} />}
                <DetailRow label="ATEX Certified" value={p.atex ? 'Yes' : 'No'} />
              </div>
              {(gases.length > 0 || refs.length > 0) && (
                <div className="mt-3">
                  <span className="text-xs text-gray-500 mr-2">Gases:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(refs.length > 0 ? refs : gases).map(g => (
                      <span key={g} className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ color: gasColor(g), borderColor: gasColor(g) + '40', background: gasColor(g) + '15' }}>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Electrical */}
          {(p.voltage || p.power || p.ip || p.tempMin !== null || p.tempMax !== null) && (
            <section>
              <h3 className="text-xs font-bold text-[#E63946] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Electrical
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {p.voltage && <DetailRow label="Voltage" value={p.voltage} />}
                {p.power !== null && p.power !== undefined && <DetailRow label="Power" value={`${p.power} W`} />}
                {p.ip && <DetailRow label="IP Rating" value={p.ip} />}
                {(p.tempMin !== null || p.tempMax !== null) && (
                  <DetailRow label="Temp Range" value={`${p.tempMin ?? '?'}\u00B0C to ${p.tempMax ?? '?'}\u00B0C`} />
                )}
              </div>
            </section>
          )}

          {/* Outputs */}
          {isDetection && (p.relay > 0 || p.analog || p.modbus || p.standalone) && (
            <section>
              <h3 className="text-xs font-bold text-[#E63946] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5" /> Outputs
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {p.relay > 0 && <DetailRow label="Relay Count" value={String(p.relay)} />}
                {p.analog && <DetailRow label="Analog Output" value={p.analog} />}
                <DetailRow label="Modbus" value={p.modbus ? 'Yes' : 'No'} />
                <DetailRow label="Standalone" value={p.standalone ? 'Yes' : 'No'} />
              </div>
            </section>
          )}

          {/* Compatibility */}
          {(compatWith.length > 0 || compatFamilies.length > 0 || connectToList.length > 0) && (
            <section>
              <h3 className="text-xs font-bold text-[#E63946] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> Compatibility
              </h3>
              <div className="space-y-2 text-sm">
                {compatWith.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 shrink-0 w-36">Compatible with:</span>
                    <div className="flex flex-wrap gap-1">
                      {compatWith.map(c => (
                        <span key={c} className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#1a3a50] text-gray-300">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {compatFamilies.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 shrink-0 w-36">Compatible families:</span>
                    <div className="flex flex-wrap gap-1">
                      {compatFamilies.map(f => (
                        <span key={f} className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#1a3a50] text-gray-300">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {connectToList.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 shrink-0 w-36">Connects to:</span>
                    <div className="flex flex-wrap gap-1">
                      {connectToList.map(c => (
                        <span key={c} className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#1a3a50] text-gray-300">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Mounting */}
          {(mountTypes.length > 0 || p.remote) && (
            <section>
              <h3 className="text-xs font-bold text-[#E63946] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5" /> Mounting
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {mountTypes.length > 0 && <DetailRow label="Mount Types" value={mountTypes.join(', ')} />}
                <DetailRow label="Remote" value={p.remote ? 'Yes' : 'No'} />
              </div>
            </section>
          )}

          {/* Description */}
          {(p.function || p.features) && (
            <section>
              <h3 className="text-xs font-bold text-[#E63946] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Box className="w-3.5 h-3.5" /> Description
              </h3>
              {p.function && <p className="text-sm text-gray-300 mb-2">{p.function}</p>}
              {p.features && <p className="text-sm text-gray-400">{p.features}</p>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-200 font-medium">{value}</span>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product: p, onClick }: { product: Product; onClick: () => void }) {
  const gases = parseJson<string[]>(p.gas, []);
  const refs = parseJson<string[]>(p.refs, []);
  const displayGases = refs.length > 0 ? refs : gases;
  const isDetection = p.type === 'detector' || p.type === 'sensor';

  return (
    <div onClick={onClick}
      className="bg-[#12283d] rounded-lg border border-[#1a3a50] hover:border-[#2a5a70] transition-all duration-200 overflow-hidden group cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      {/* Image area */}
      <div className="h-40 bg-[#162a3d] flex items-center justify-center p-3 relative">
        {p.image ? (
          <img src={`/assets/${p.image}`} alt={p.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200" />
        ) : (
          <div className="text-gray-600 text-3xl font-bold opacity-20 select-none">{p.family}</div>
        )}
        {/* Type badge top-right */}
        <div className="absolute top-2 right-2">{typeBadge(p.type)}</div>
        {/* View icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-60 transition-opacity" />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Name */}
        <h3 className="text-sm font-bold text-white leading-tight mb-0.5 truncate" title={p.name}>{p.name}</h3>
        {/* Family + Variant */}
        <div className="text-[10px] text-gray-500 mb-1.5 truncate">
          {p.family}{p.variant ? ` \u2014 ${p.variant}` : ''}
        </div>
        {/* Code */}
        <div className="text-[10px] font-mono text-gray-600 mb-2">{p.code}</div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {tierBadge(p.tier)}
          {isDetection && p.sensorTech && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
              {p.sensorTech}
            </span>
          )}
          {p.standalone && isDetection && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
              Standalone
            </span>
          )}
          {p.atex && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
              ATEX
            </span>
          )}
          {p.status === 'planned' && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
              Planned
            </span>
          )}
        </div>

        {/* Range for detectors/sensors */}
        {isDetection && p.range && (
          <div className="text-[10px] text-gray-500 mb-1.5">
            Range: <span className="text-gray-300 font-medium">{p.range}</span>
          </div>
        )}

        {/* Gas chips */}
        {displayGases.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mb-2">
            {displayGases.slice(0, 3).map(g => (
              <span key={g} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ color: gasColor(g), background: gasColor(g) + '18', border: `1px solid ${gasColor(g)}30` }}>
                {g}
              </span>
            ))}
            {displayGases.length > 3 && (
              <span className="text-[8px] text-gray-500 font-medium">+{displayGases.length - 3} more</span>
            )}
          </div>
        )}

        {/* Price */}
        {p.price > 0 && (
          <div className="mt-1 text-right">
            <span className="text-lg font-bold text-white">{p.price.toFixed(0)}</span>
            <span className="text-xs text-gray-500 ml-1">{'\u20AC'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductCatalogPage() {
  const { lang } = useLang();

  const [products, setProducts] = useState<Product[]>([]);
  const [applications, setApplications] = useState<AppOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterApp, setFilterApp] = useState('');
  const [filterGas, setFilterGas] = useState<string[]>([]);
  const [filterFamily, setFilterFamily] = useState<string[]>([]);
  const [filterTech, setFilterTech] = useState<string[]>([]);
  const [filterOutput, setFilterOutput] = useState<string[]>([]);
  const [filterCert, setFilterCert] = useState<string[]>([]);
  const [filterTier, setFilterTier] = useState('');
  const [gasSearch, setGasSearch] = useState('');
  const [refDropdownOpen, setRefDropdownOpen] = useState(false);
  const [allRefrigerants, setAllRefrigerants] = useState<{ id: string; safetyClass: string }[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'family' | 'price' | 'name'>('family');

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/applications').then(r => r.json()).catch(() => []),
      fetch('/api/refrigerants-v5').then(r => r.json()).catch(() => []),
    ]).then(([prods, apps, refs]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      setAllRefrigerants(Array.isArray(refs) ? refs.map((r: { id: string; safetyClass: string }) => ({ id: r.id, safetyClass: r.safetyClass })) : []);
      setApplications(Array.isArray(apps) ? apps : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Build a map: appId -> list of product family names from productFamilies
  const appFamiliesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const app of applications) {
      map[app.id] = parseJson<string[]>(app.productFamilies, []);
    }
    return map;
  }, [applications]);

  // Counts per type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { sensor: 0, detector: 0, controller: 0, alert: 0, accessory: 0 };
    for (const p of products) {
      if (counts[p.type] !== undefined) counts[p.type]++;
    }
    return counts;
  }, [products]);

  // Count products matching each gas (based on all products, not filtered)
  const gasProductCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const group of GAS_GROUPS) {
      for (const item of group.items) {
        counts[item.id] = products.filter(p => {
          const gases = parseJson<string[]>(p.gas, []);
          const refs = parseJson<string[]>(p.refs, []);
          return gases.includes(item.id) || refs.includes(item.id);
        }).length;
      }
    }
    return counts;
  }, [products]);

  // Toggle gas filter
  const toggleGas = useCallback((gasId: string) => {
    setFilterGas(prev => prev.includes(gasId) ? prev.filter(g => g !== gasId) : [...prev, gasId]);
  }, []);

  // Derive available families, techs from type-filtered + app-filtered products (before other filters)
  const baseFiltered = useMemo(() => {
    let list = products;
    if (filterType) list = list.filter(p => p.type === filterType);
    if (filterApp) {
      const families = appFamiliesMap[filterApp] ?? [];
      if (families.length > 0) {
        list = list.filter(p => families.some(f => p.family.toUpperCase().includes(f.toUpperCase())));
      }
    }
    return list;
  }, [products, filterType, filterApp, appFamiliesMap]);

  const availableFamilies = useMemo(() => {
    const seen = new Set<string>();
    for (const p of baseFiltered) if (p.family) seen.add(p.family);
    return Array.from(seen).sort();
  }, [baseFiltered]);

  const availableTechs = useMemo(() => {
    const seen = new Set<string>();
    for (const p of baseFiltered) if (p.sensorTech) seen.add(p.sensorTech);
    return Array.from(seen).sort();
  }, [baseFiltered]);

  // Available gases in base-filtered set
  const availableGasIds = useMemo(() => {
    const seen = new Set<string>();
    for (const p of baseFiltered) {
      const gases = parseJson<string[]>(p.gas, []);
      const refs = parseJson<string[]>(p.refs, []);
      for (const g of [...gases, ...refs]) seen.add(g);
    }
    return seen;
  }, [baseFiltered]);

  // Filtered + sorted (all filters applied)
  const filtered = useMemo(() => {
    let list = baseFiltered;

    // Gas filter (OR)
    if (filterGas.length > 0) {
      list = list.filter(p => {
        const gases = parseJson<string[]>(p.gas, []);
        const refs = parseJson<string[]>(p.refs, []);
        const allGases = [...gases, ...refs];
        return filterGas.some(fg => allGases.includes(fg));
      });
    }

    // Family filter
    if (filterFamily.length > 0) list = list.filter(p => filterFamily.includes(p.family));

    // Tech filter
    if (filterTech.length > 0) list = list.filter(p => p.sensorTech && filterTech.includes(p.sensorTech));

    // Output filters
    if (filterOutput.includes('relay')) list = list.filter(p => p.relay > 0);
    if (filterOutput.includes('4-20mA')) list = list.filter(p => p.analog?.includes('4-20mA'));
    if (filterOutput.includes('modbus')) list = list.filter(p => p.modbus);

    // Certifications
    if (filterCert.includes('atex')) list = list.filter(p => p.atex);
    if (filterCert.includes('standalone')) list = list.filter(p => p.standalone);

    // Tier
    if (filterTier) list = list.filter(p => {
      const tierNorm = p.tier?.toLowerCase() ?? '';
      return tierNorm.includes(filterTier.toLowerCase());
    });

    // Text search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.family.toLowerCase().includes(q) ||
        (p.variant ?? '').toLowerCase().includes(q) ||
        parseJson<string[]>(p.gas, []).some(g => g.toLowerCase().includes(q)) ||
        parseJson<string[]>(p.refs, []).some(r => r.toLowerCase().includes(q))
      );
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.family.localeCompare(b.family) || a.name.localeCompare(b.name);
    });
    return list;
  }, [baseFiltered, filterGas, filterFamily, filterTech, filterOutput, filterCert, filterTier, search, sortBy]);

  // Count products matching selected application
  const appProductCount = useCallback((appId: string) => {
    const families = appFamiliesMap[appId] ?? [];
    if (families.length === 0) return 0;
    return products.filter(p => families.some(f => p.family.toUpperCase().includes(f.toUpperCase()))).length;
  }, [products, appFamiliesMap]);

  // Any filter active?
  const anyFilterActive = filterApp || filterGas.length > 0 || filterFamily.length > 0 ||
    filterTech.length > 0 || filterOutput.length > 0 || filterCert.length > 0 || filterTier || search;

  const clearAllFilters = useCallback(() => {
    setFilterApp('');
    setFilterGas([]);
    setFilterFamily([]);
    setFilterTech([]);
    setFilterOutput([]);
    setFilterCert([]);
    setFilterTier('');
    setGasSearch('');
    setSearch('');
  }, []);

  // Filtered gas groups for the compact searchable gas list
  const filteredGasGroups = useMemo(() => {
    const q = gasSearch.toLowerCase();
    return GAS_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(item =>
        availableGasIds.has(item.id) &&
        (q === '' || item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q))
      ),
    })).filter(group => group.items.length > 0);
  }, [gasSearch, availableGasIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0c1824]">
      {/* ── Top Bar ── */}
      <header className="bg-[#0f1f2e] border-b border-[#1a3348] px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="text-[#E63946] font-extrabold text-lg">Safe</span>
          <span className="text-white font-extrabold text-lg">Ref</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-3xl relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Rechercher un produit, gaz, famille..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#162a3d] border border-[#1a3a50] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E63946]" />
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="bg-[#162a3d] border border-[#1a3a50] rounded-lg text-sm text-gray-300 px-3 py-2.5 focus:outline-none">
          <option value="family">Tri par famille</option>
          <option value="name">Tri par nom</option>
          <option value="price">Tri par prix</option>
        </select>

        {/* Count */}
        <span className="text-sm text-gray-500 font-mono shrink-0">{filtered.length} / {products.length}</span>

        <LanguageSwitcher compact />
      </header>

      {/* ── Type Tabs ── */}
      <div className="bg-[#0f1f2e] px-4 py-2 flex items-center gap-2 border-b border-[#1a3348]">
        {[
          { key: '', label: 'Tous', count: products.length, dot: '' },
          { key: 'sensor', label: 'Sensor', count: typeCounts.sensor, dot: 'bg-purple-500' },
          { key: 'detector', label: 'Detector', count: typeCounts.detector, dot: 'bg-blue-500' },
          { key: 'controller', label: 'Controller', count: typeCounts.controller, dot: 'bg-green-500' },
          { key: 'alert', label: 'Alert', count: typeCounts.alert, dot: 'bg-red-500' },
          { key: 'accessory', label: 'Accessory', count: typeCounts.accessory, dot: 'bg-teal-500' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilterType(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filterType === tab.key
                ? 'bg-[#E63946] text-white'
                : 'bg-transparent text-gray-400 border border-[#2a4a60] hover:border-gray-500'
            }`}>
            {tab.dot && <span className={`w-2 h-2 rounded-full ${tab.dot}`} />}
            {tab.label} <span className="opacity-70">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <aside className="w-[200px] shrink-0 bg-[#0c1824] border-r border-[#1a3348] overflow-y-auto p-3 space-y-4">

          {/* Reset link */}
          {anyFilterActive && (
            <button
              onClick={clearAllFilters}
              className="w-full text-left text-[9px] font-bold text-[#E63946] hover:text-red-400 uppercase tracking-widest transition-colors"
            >
              ✕ Reset all filters
            </button>
          )}

          {/* ── 1. APPLICATION ── */}
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Application</div>
            <div className="space-y-0.5">
              {applications.map(app => {
                const count = appProductCount(app.id);
                return (
                  <button key={app.id} onClick={() => setFilterApp(filterApp === app.id ? '' : app.id)}
                    className={`w-full text-left px-2 py-1 rounded text-[10px] transition-colors flex items-center gap-1.5 ${
                      filterApp === app.id ? 'bg-[#1a3a50] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#111d2b]'
                    }`}>
                    <span className="text-xs">{APP_ICONS[app.id] ?? app.icon}</span>
                    <span className="truncate flex-1">{lang === 'fr' ? app.labelFr : app.labelEn}</span>
                    {count > 0 && (
                      <span className="text-[9px] font-mono text-gray-600 shrink-0">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 2. REFRIGERANT — collapsible dropdown with safety class ── */}
          <div className="border-t border-[#1a3348] pt-3">
            <button
              onClick={() => setRefDropdownOpen(!refDropdownOpen)}
              className="w-full flex items-center justify-between mb-2"
            >
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Refrigerant</span>
              <span className="text-gray-500 text-[10px]">{refDropdownOpen ? '▼' : '▶'}</span>
            </button>
            {/* Selected gas chips */}
            {filterGas.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {filterGas.map(g => (
                  <span key={g} className="inline-flex items-center gap-1 bg-[#E63946]/20 text-[#E63946] text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                    {g}
                    <button onClick={() => toggleGas(g)} className="hover:text-white">×</button>
                  </span>
                ))}
              </div>
            )}
            {refDropdownOpen && (
              <div className="bg-[#0a1620] border border-[#1a3348] rounded-lg overflow-hidden">
                <div className="p-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={gasSearch}
                    onChange={e => setGasSearch(e.target.value)}
                    className="w-full px-2 py-1 text-[10px] bg-[#162a3d] border border-[#1a3a50] rounded text-white placeholder-gray-600 focus:outline-none focus:border-[#E63946]"
                  />
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
                  {filteredGasGroups.map(group => (
                    <div key={group.group}>
                      <div className="text-[8px] font-bold text-[#E63946]/70 uppercase tracking-wider px-2 py-1 bg-[#0c1824] border-t border-[#1a3348]">{group.group}</div>
                      {group.items.map(item => {
                        const ref = allRefrigerants.find(r => r.id === item.id);
                        const sc = ref?.safetyClass || '';
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleGas(item.id)}
                            className={`w-full flex items-center gap-1.5 px-2 py-1 text-[10px] transition-colors ${
                              filterGas.includes(item.id) ? 'bg-[#1a3a50] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#111d2b]'
                            }`}
                          >
                            <span className="font-semibold min-w-[45px]">{item.id}</span>
                            {sc && <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${safetyBadgeColor(sc)}`}>{sc}</span>}
                            <span className="text-[8px] font-mono text-gray-600 ml-auto">{gasProductCounts[item.id] ?? 0}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 3. TECHNOLOGY — clickable list ── */}
          {availableTechs.length > 0 && (
            <div className="border-t border-[#1a3348] pt-3">
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Technology</div>
              <div className="space-y-0.5">
                {availableTechs.map(tech => (
                  <button
                    key={tech}
                    onClick={() => setFilterTech(prev =>
                      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
                    )}
                    className={`w-full text-left px-2 py-1 rounded text-[10px] transition-colors ${
                      filterTech.includes(tech) ? 'bg-purple-900/40 text-purple-300' : 'text-gray-400 hover:text-gray-200 hover:bg-[#111d2b]'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 4. OUTPUT ── */}
          <div className="border-t border-[#1a3348] pt-3">
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Output</div>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'relay', label: 'Relay', color: '#f59e0b' },
                { id: '4-20mA', label: '4-20mA', color: '#06b6d4' },
                { id: 'modbus', label: 'Modbus', color: '#8b5cf6' },
              ].map(opt => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  active={filterOutput.includes(opt.id)}
                  color={opt.color}
                  onClick={() => setFilterOutput(prev =>
                    prev.includes(opt.id) ? prev.filter(o => o !== opt.id) : [...prev, opt.id]
                  )}
                />
              ))}
            </div>
          </div>

          {/* ── 6. CERTIFICATIONS ── */}
          <div className="border-t border-[#1a3348] pt-3">
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Certifications</div>
            <div className="flex flex-wrap gap-1">
              <Chip
                label="ATEX"
                active={filterCert.includes('atex')}
                color="#f97316"
                onClick={() => setFilterCert(prev =>
                  prev.includes('atex') ? prev.filter(c => c !== 'atex') : [...prev, 'atex']
                )}
              />
              <Chip
                label="Standalone"
                active={filterCert.includes('standalone')}
                color="#22c55e"
                onClick={() => setFilterCert(prev =>
                  prev.includes('standalone') ? prev.filter(c => c !== 'standalone') : [...prev, 'standalone']
                )}
              />
            </div>
          </div>

          {/* ── 7. TIER ── */}
          <div className="border-t border-[#1a3348] pt-3">
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Tier</div>
            <div className="flex flex-wrap gap-1">
              <Chip
                label="Premium"
                active={filterTier === 'premium'}
                color="#E63946"
                onClick={() => setFilterTier(prev => prev === 'premium' ? '' : 'premium')}
              />
              <Chip
                label="Standard"
                active={filterTier === 'standard'}
                color="#2563eb"
                onClick={() => setFilterTier(prev => prev === 'standard' ? '' : 'standard')}
              />
              <Chip
                label="Economic"
                active={filterTier === 'economic'}
                color="#16a34a"
                onClick={() => setFilterTier(prev => prev === 'economic' ? '' : 'economic')}
              />
            </div>
          </div>

          {/* ── 8. FAMILY (last — for advanced filtering) ── */}
          {availableFamilies.length > 0 && (
            <div className="border-t border-[#1a3348] pt-3">
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Family</div>
              <div className="flex flex-wrap gap-1">
                {availableFamilies.map(fam => (
                  <Chip
                    key={fam}
                    label={fam.replace('GLACIAR ', '').replace(' Sensor Module', '').replace(' Sensor', '')}
                    active={filterFamily.includes(fam)}
                    onClick={() => setFilterFamily(prev =>
                      prev.includes(fam) ? prev.filter(f => f !== fam) : [...prev, fam]
                    )}
                  />
                ))}
              </div>
            </div>
          )}

        </aside>

        {/* ── Product Grid ── */}
        <main className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Detail Modal ── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
