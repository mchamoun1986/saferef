'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/lib/i18n-context';

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
  apps: string;
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
}

interface AppOption {
  id: string;
  labelEn: string;
  labelFr: string;
  icon: string;
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
  { group: 'REFRIGERANTS', items: [
    { id: 'CO2', label: 'CO2 (R744)', color: '#3b82f6' },
    { id: 'HFC1', label: 'HFC/HFO Grp 1', color: '#22c55e' },
    { id: 'HFC2', label: 'HFC/HFO Grp 2', color: '#14b8a6' },
    { id: 'R290', label: 'R290 Propane', color: '#f97316' },
  ]},
  { group: 'AMMONIAC', items: [
    { id: 'NH3', label: 'NH3 (R717)', color: '#a855f7' },
  ]},
  { group: 'TOXIQUES / SECURITE', items: [
    { id: 'CO', label: 'CO', color: '#ef4444' },
    { id: 'NO2', label: 'NO2', color: '#eab308' },
    { id: 'O2', label: 'O2', color: '#06b6d4' },
  ]},
];

// ── Type badge colors ─────────────────────────────────────────────────────────

function typeBadge(type: string) {
  const map: Record<string, string> = {
    detector: 'bg-blue-600', controller: 'bg-green-600', accessory: 'bg-teal-600',
  };
  const labels: Record<string, string> = {
    detector: 'Detector', controller: 'Controller', accessory: 'Accessoire',
  };
  return (
    <span className={`${map[type] ?? 'bg-gray-600'} text-white text-[9px] font-bold px-2 py-0.5 rounded`}>
      {labels[type] ?? type}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductCatalogPage() {
  const { lang } = useLang();

  const [products, setProducts] = useState<Product[]>([]);
  const [applications, setApplications] = useState<AppOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterApp, setFilterApp] = useState('');
  const [filterGas, setFilterGas] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'family' | 'price' | 'name'>('family');

  useEffect(() => {
    Promise.all([
      fetch('/api/products?discontinued=false').then(r => r.json()),
      fetch('/api/applications').then(r => r.json()).catch(() => []),
    ]).then(([prods, apps]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      setApplications(Array.isArray(apps) ? apps : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Counts
  const detectors = products.filter(p => p.type === 'detector').length;
  const controllers = products.filter(p => p.type === 'controller').length;
  const accessories = products.filter(p => p.type === 'accessory').length;

  // Toggle gas filter
  function toggleGas(gasId: string) {
    setFilterGas(prev => prev.includes(gasId) ? prev.filter(g => g !== gasId) : [...prev, gasId]);
  }

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = products;
    if (filterType) list = list.filter(p => p.type === filterType);
    if (filterApp) list = list.filter(p => parseJson<string[]>(p.apps, []).includes(filterApp));
    if (filterGas.length > 0) list = list.filter(p => {
      const gases = parseJson<string[]>(p.gas, []);
      return filterGas.some(fg => gases.includes(fg));
    });
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.family.toLowerCase().includes(q) ||
        parseJson<string[]>(p.gas, []).some(g => g.toLowerCase().includes(q))
      );
    }
    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.family.localeCompare(b.family) || a.name.localeCompare(b.name);
    });
    return list;
  }, [products, filterType, filterApp, filterGas, search, sortBy]);

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
        <button onClick={() => setFilterType('')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${!filterType ? 'bg-[#E63946] text-white' : 'bg-transparent text-gray-400 border border-[#2a4a60] hover:border-gray-500'}`}>
          Tous <span className="ml-1 opacity-70">{products.length}</span>
        </button>
        <button onClick={() => setFilterType('detector')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${filterType === 'detector' ? 'bg-[#E63946] text-white' : 'bg-transparent text-gray-400 border border-[#2a4a60] hover:border-gray-500'}`}>
          <span className="w-2 h-2 rounded-full bg-blue-500" /> Detecteur <span className="opacity-70">{detectors}</span>
        </button>
        <button onClick={() => setFilterType('controller')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${filterType === 'controller' ? 'bg-[#E63946] text-white' : 'bg-transparent text-gray-400 border border-[#2a4a60] hover:border-gray-500'}`}>
          <span className="w-2 h-2 rounded-full bg-green-500" /> Controleur <span className="opacity-70">{controllers}</span>
        </button>
        <button onClick={() => setFilterType('accessory')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${filterType === 'accessory' ? 'bg-[#E63946] text-white' : 'bg-transparent text-gray-400 border border-[#2a4a60] hover:border-gray-500'}`}>
          <span className="w-2 h-2 rounded-full bg-teal-500" /> Accessoire <span className="opacity-70">{accessories}</span>
        </button>
      </div>

      <div className="flex flex-1">
        {/* ── Left Sidebar ── */}
        <aside className="w-[200px] shrink-0 bg-[#0c1824] border-r border-[#1a3348] overflow-y-auto p-4 space-y-6">
          {/* Application filter */}
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Application</div>
            <div className="space-y-0.5">
              {applications.map(app => (
                <button key={app.id} onClick={() => setFilterApp(filterApp === app.id ? '' : app.id)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
                    filterApp === app.id ? 'bg-[#1a3a50] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#111d2b]'
                  }`}>
                  <span className="text-sm">{APP_ICONS[app.id] ?? app.icon}</span>
                  <span className="truncate">{lang === 'fr' ? app.labelFr : app.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gas group filter */}
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Groupe de gaz</div>
            {GAS_GROUPS.map(group => (
              <div key={group.group} className="mb-3">
                <div className="text-[9px] font-bold text-[#E63946] uppercase tracking-wider mb-1">{group.group}</div>
                {group.items.map(item => (
                  <label key={item.id} className="flex items-center gap-2 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 cursor-pointer">
                    <input type="checkbox" checked={filterGas.includes(item.id)}
                      onChange={() => toggleGas(item.id)}
                      className="rounded border-gray-600 bg-transparent text-[#E63946] focus:ring-0 w-3 h-3" />
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="truncate">{item.label}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
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
                <div key={p.id} className="bg-[#12283d] rounded-lg border border-[#1a3a50] hover:border-[#2a5a70] transition-colors overflow-hidden group">
                  {/* Image area */}
                  <div className="h-40 bg-[#162a3d] flex items-center justify-center p-3 relative">
                    {p.image ? (
                      <img src={`/assets/${p.image}`} alt={p.name}
                        className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-gray-600 text-3xl font-bold opacity-20 select-none">{p.family}</div>
                    )}
                    {/* Type badge top-right */}
                    <div className="absolute top-2 right-2">{typeBadge(p.type)}</div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    {/* Name */}
                    <h3 className="text-sm font-bold text-white leading-tight mb-0.5 truncate">{p.name}</h3>
                    {/* Type + Family */}
                    <div className="text-[10px] text-gray-500 mb-1.5">{p.type === 'detector' ? 'Detector' : p.type === 'controller' ? 'Controller' : 'Accessory'}</div>
                    {/* Brand */}
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E63946]" />
                      <span className="text-[11px] font-bold text-[#E63946]">SafeRef</span>
                    </div>
                    {/* Specs line */}
                    {(p.voltage || p.sensorTech || p.ip) && (
                      <div className="text-[10px] text-gray-500">
                        {p.voltage && <span>Pwr: <b className="text-gray-300">{p.voltage}</b></span>}
                        {p.sensorTech && <span className="ml-2">Sensor: <b className="text-gray-300">{p.sensorTech}</b></span>}
                        {p.ip && <span className="ml-2">{p.ip}</span>}
                      </div>
                    )}
                    {/* Price */}
                    {p.price > 0 && (
                      <div className="mt-2 text-right">
                        <span className="text-lg font-bold text-white">{p.price.toFixed(0)}</span>
                        <span className="text-xs text-gray-500 ml-1">{'\u20AC'}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
