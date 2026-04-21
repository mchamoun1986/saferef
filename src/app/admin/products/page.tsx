'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  type: string;
  family: string;
  name: string;
  code: string;
  price: number;
  image: string | null;
  specs: string;
  tier: string;
  productGroup: string;
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
  maxPower: number | null;
  powerDesc: string | null;
  relaySpec: string | null;
  analogType: string | null;
  modbusType: string | null;
  subCategory: string | null;
  compatibleFamilies: string;
  variant: string | null;
  subType: string | null;
  function: string | null;
  status: string;
  ports: string;
  connectionRules: string;
  compatibleWith: string;
  createdAt: string;
  updatedAt: string;
}

const TYPES = ['sensor', 'detector', 'controller', 'alert', 'accessory'] as const;
const FAMILIES = [
  'GLACIAR MIDI', 'GLACIAR MICRO', 'GLACIAR RM',
  'X5 Direct Sensor Module', 'X5 Remote Sensor', 'X5 Transmitter',
  'GLACIAR Controller 10',
  '1992-R-LP Siren', 'BE Flashing Light', 'FL Combined Flashing Light and Siren', 'SOCK-H-R High Socket Beacon',
  'Power Adapter', 'Protection Bracket', 'RMV Backbox', 'UPS Battery Backup',
  'Flow Regulator', 'Calibration Kit', 'MIDI Accessories', 'X5 Accessories',
] as const;
const TIERS = ['standard', 'premium', 'economic'] as const;
const MOUNT_OPTIONS = ['wall', 'ceiling', 'floor', 'duct'] as const;

const EMPTY_PRODUCT: Omit<Product, 'createdAt' | 'updatedAt'> = {
  id: '', type: 'sensor', family: 'GLACIAR MIDI', name: '', code: '', price: 0,
  image: null, specs: '{}', tier: 'standard', productGroup: 'A',
  refs: '[]', range: null, sensorTech: null, sensorLife: null,
  power: null, voltage: null, ip: null, tempMin: null, tempMax: null,
  relay: 0, analog: null, modbus: false, standalone: true, atex: false,
  mount: '[]', remote: false, features: null, connectTo: null, discontinued: false,
  channels: null, maxPower: null, powerDesc: null, relaySpec: null, analogType: null,
  modbusType: null, subCategory: null, compatibleFamilies: '[]',
  variant: null, subType: null, function: null, status: 'active',
  ports: '[]', connectionRules: '{}', compatibleWith: '[]',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

function gasColor(g: string): string {
  const map: Record<string, string> = {
    CO2: 'bg-blue-500 text-white', HFC1: 'bg-green-500 text-white',
    HFC2: 'bg-teal-500 text-white', NH3: 'bg-purple-500 text-white',
    R290: 'bg-orange-500 text-white', CO: 'bg-red-500 text-white',
    NO2: 'bg-yellow-500 text-white', O2: 'bg-cyan-500 text-white',
  };
  return map[g] ?? 'bg-gray-400 text-white';
}

function tierBadge(tier: string) {
  const map: Record<string, string> = {
    premium: 'bg-blue-100 text-blue-700 border-blue-300',
    standard: 'bg-green-100 text-green-700 border-green-300',
    economic: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  };
  return map[tier] ?? 'bg-gray-100 text-gray-600 border-gray-300';
}

function connectionBadges(p: Product) {
  if (p.standalone) {
    return (
      <div className="flex flex-wrap gap-0.5">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 border border-green-300">Standalone</span>
        {p.relay > 0 && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-300">Relay</span>}
      </div>
    );
  }
  const parts: string[] = [];
  if (p.connectTo) {
    const ct = p.connectTo.toUpperCase();
    if (ct.includes('MPU')) parts.push('MPU');
    if (ct.includes('SPU')) parts.push('SPU');
    if (ct.includes('SPLS')) parts.push('SPLS');
  }
  if (parts.length === 0) parts.push('Via controller');
  return (
    <div className="flex flex-wrap gap-0.5">
      {parts.map(pt => (
        <span key={pt} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-300">{pt}</span>
      ))}
    </div>
  );
}

function outputDesc(p: Product): string {
  const parts: string[] = [];
  if (p.relay > 0) parts.push(`${p.relay} Relay${p.relay > 1 ? 's' : ''}`);
  if (p.analog) parts.push(p.analog);
  if (p.modbus) parts.push('Modbus');
  if (parts.length === 0 && p.connectTo) return 'Via controller';
  return parts.join(', ') || '\u2014';
}

function tempRange(p: Product): string {
  if (p.tempMin !== null && p.tempMax !== null) return `${p.tempMin} to ${p.tempMax}\u00B0C`;
  return '\u2014';
}

const TYPE_TABS = [
  { value: 'sensor', label: 'Sensors' },
  { value: 'detector', label: 'Detectors' },
  { value: 'controller', label: 'Controllers' },
  { value: 'alert', label: 'Alerts' },
  { value: 'accessory', label: 'Accessories' },
] as const;

// ── Component ───────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('sensor');
  const [filterFamily, setFilterFamily] = useState<string>('');
  const [filterGas, setFilterGas] = useState('');
  const [filterSubCat, setFilterSubCat] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterVoltage, setFilterVoltage] = useState('');
  const [filterSensor, setFilterSensor] = useState('');
  const [filterCompat, setFilterCompat] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
  }
  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id)));
  }
  async function deleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} products? This cannot be undone.`)) return;
    for (const id of selected) {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    }
    setSelected(new Set());
    fetchProducts();
  }
  const [dialog, setDialog] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<Product, 'createdAt' | 'updatedAt'>>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [allRefrigerants, setAllRefrigerants] = useState<{ id: string; name: string }[]>([]);
  const [allProductGroups, setAllProductGroups] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Fetch refrigerants + product groups for dropdowns
  useEffect(() => {
    fetch('/api/refrigerants-v5').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setAllRefrigerants(d.map((r: { id: string; name: string }) => ({ id: r.id, name: r.name })));
    });
    fetch('/api/discount-matrix').then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        const groups = [...new Set(d.map((r: { productGroup: string }) => r.productGroup))].sort() as string[];
        setAllProductGroups(groups);
      }
    });
  }, []);

  // Derived
  const totalAll = products.filter(p => p.status !== 'discontinued' && !p.discontinued).length;
  const detectors = products.filter(p => p.type === 'detector' && p.status !== 'discontinued' && !p.discontinued).length;
  const sensors = products.filter(p => p.type === 'sensor' && p.status !== 'discontinued' && !p.discontinued).length;
  const controllers = products.filter(p => p.type === 'controller' && p.status !== 'discontinued' && !p.discontinued).length;
  const alerts = products.filter(p => p.type === 'alert' && p.status !== 'discontinued' && !p.discontinued).length;
  const accessories = products.filter(p => p.type === 'accessory' && p.status !== 'discontinued' && !p.discontinued).length;
  const families = useMemo(() => {
    const set = new Set(products.filter(p => p.type === filterType).map(p => p.family));
    return Array.from(set).sort();
  }, [products, filterType]);
  const gasTypes = useMemo(() => {
    const set = new Set<string>();
    products.filter(p => p.type === filterType).forEach(p => parseJson<string[]>(p.refs, []).forEach(g => set.add(g)));
    return Array.from(set).sort();
  }, [products, filterType]);
  const subCategories = useMemo(() => {
    const set = new Set(products.filter(p => p.type === filterType && p.subCategory).map(p => p.subCategory!));
    return Array.from(set).sort();
  }, [products, filterType]);
  const avgPrice = useMemo(() => {
    const priced = products.filter(p => p.price > 0 && p.status !== 'discontinued' && !p.discontinued);
    return priced.length > 0 ? Math.round(priced.reduce((s, p) => s + p.price, 0) / priced.length) : 0;
  }, [products]);
  const withImage = products.filter(p => p.image && p.status !== 'discontinued' && !p.discontinued).length;
  const missingPrice = products.filter(p => p.price <= 0 && p.status !== 'discontinued' && !p.discontinued).length;

  // Filter
  const filtered = useMemo(() => {
    let list = products;
    if (filterType) list = list.filter(p => p.type === filterType);
    if (filterFamily) list = list.filter(p => p.family === filterFamily);
    if (filterGas) list = list.filter(p => parseJson<string[]>(p.refs, []).includes(filterGas));
    if (filterSubCat) list = list.filter(p => p.subCategory === filterSubCat);
    if (filterTier) list = list.filter(p => p.tier === filterTier);
    if (filterVoltage) list = list.filter(p => (p.voltage || '').includes(filterVoltage));
    if (filterSensor) list = list.filter(p => p.sensorTech === filterSensor);
    if (filterCompat) list = list.filter(p => parseJson<string[]>(p.compatibleFamilies, []).includes(filterCompat));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    }
    return list;
  }, [products, filterType, filterFamily, filterGas, filterSubCat, filterTier, filterVoltage, filterSensor, filterCompat, search]);

  // CRUD
  function openNew() { setIsNew(true); setForm({ ...EMPTY_PRODUCT, type: filterType || 'detector' }); setDialog(true); }
  function openEdit(p: Product) {
    setIsNew(false);
    const { createdAt: _c, updatedAt: _u, ...rest } = p;
    setForm({ ...rest });
    setDialog(true);
  }
  async function save() {
    setSaving(true);
    try {
      if (isNew) {
        const { id: _id, ...data } = form;
        await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      } else {
        await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      }
      await fetchProducts();
      setDialog(false);
    } catch (err) { console.error('Save error:', err); }
    setSaving(false);
  }
  async function deleteProduct(id: string, code: string) {
    if (!confirm(`Delete product "${code}"?`)) return;
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    await fetchProducts();
  }

  function formMount(): string[] { return parseJson(form.mount, []); }
  function toggleMount(m: string) { const cur = formMount(); setForm({ ...form, mount: JSON.stringify(cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]) }); }

  return (
    <div className="p-5 max-w-[1800px] mx-auto">
      {/* Stats row — 8 cards */}
      <div className="grid grid-cols-5 lg:grid-cols-10 gap-3 mb-5">
        <StatCard value={totalAll} label="TOTAL" />
        <StatCard value={sensors} label="SENSORS" />
        <StatCard value={detectors} label="DETECTORS" />
        <StatCard value={controllers} label="CONTROLLERS" />
        <StatCard value={alerts} label="ALERTS" />
        <StatCard value={accessories} label="ACCESSORIES" />
        <StatCard value={families.length} label="FAMILIES" />
        <StatCard value={gasTypes.length} label="GAS TYPES" />
        <StatCard value={`${avgPrice} \u20AC`} label="AVG PRICE" />
        <StatCard value={`${withImage}/${totalAll}`} label="WITH IMAGE" accent={withImage === totalAll ? 'text-green-600' : 'text-amber-600'} />
      </div>

      {/* Type tabs + Add button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {TYPE_TABS.map(tab => (
            <button key={tab.value} onClick={() => { setFilterType(tab.value); setFilterFamily(''); setFilterGas(''); setFilterSubCat(''); }}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                filterType === tab.value ? 'bg-[#E63946] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={openNew}
          className="bg-[#E63946] hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
          + Add {TYPE_TABS.find(t => t.value === filterType)?.label ?? 'Product'}
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="text" placeholder="Search products..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm w-56 bg-white" />
        <select value={filterFamily} onChange={e => setFilterFamily(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
          <option value="">All Families</option>
          {families.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filterGas} onChange={e => setFilterGas(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
          <option value="">All Gases</option>
          {gasTypes.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        {(filterType === 'accessory' || filterType === 'alert') && subCategories.length > 0 && (
          <select value={filterSubCat} onChange={e => setFilterSubCat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
            <option value="">All Sub-Categories</option>
            {subCategories.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {(filterType === 'detector' || filterType === 'sensor') && (
          <>
            <select value={filterTier} onChange={e => setFilterTier(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
              <option value="">All Tiers</option>
              <option value="premium">Premium</option>
              <option value="standard">Standard</option>
              <option value="centralized">Centralized</option>
            </select>
            <select value={filterSensor} onChange={e => setFilterSensor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
              <option value="">All Sensors</option>
              <option value="IR">IR</option>
              <option value="SC">SC</option>
              <option value="EC">EC</option>
              <option value="pH">pH</option>
            </select>
          </>
        )}
        {(filterType === 'accessory' || filterType === 'alert' || filterType === 'controller') && (
          <select value={filterCompat} onChange={e => setFilterCompat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
            <option value="">All Compatible</option>
            <option value="GLACIAR MIDI">GLACIAR MIDI</option>
            <option value="GLACIAR MICRO">GLACIAR MICRO</option>
            <option value="GLACIAR RM">GLACIAR RM</option>
            <option value="GLACIAR Controller 10">GLACIAR Controller 10</option>
            <option value="X5 Transmitter">X5 Transmitter</option>
            <option value="X5 Direct Sensor Module">X5 Direct Sensor Module</option>
            <option value="X5 Remote Sensor">X5 Remote Sensor</option>
          </select>
        )}
        {selected.size > 0 && (
          <button onClick={deleteSelected}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors">
            Delete {selected.size} selected
          </button>
        )}
        <span className="text-sm text-gray-500 ml-auto font-mono">{filtered.length} / {products.filter(p => p.type === filterType).length}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[#f0f1f5] text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                  <th className="px-2 py-2.5 w-8">
                    <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="px-2 py-2.5">ACTIONS</th>
                  <th className="px-2 py-2.5">IMAGE</th>
                  <th className="px-2 py-2.5">FAMILY</th>
                  <th className="px-2 py-2.5">VARIANT</th>
                  <th className="px-2 py-2.5 min-w-[160px]">PRODUCT NAME</th>
                  <th className="px-2 py-2.5">ORDER CODE</th>
                  <th className="px-2 py-2.5 text-right">PRICE {'\u20AC'}</th>
                  <th className="px-2 py-2.5 text-center">TIER</th>
                  <th className="px-2 py-2.5 text-center">GROUP</th>
                  <th className="px-2 py-2.5">GASES</th>
                  <th className="px-2 py-2.5">RANGE</th>
                  <th className="px-2 py-2.5">SENSOR</th>
                  <th className="px-2 py-2.5">ELECTRICAL</th>
                  <th className="px-2 py-2.5 text-center">IP</th>
                  <th className="px-2 py-2.5">OUTPUT</th>
                  <th className="px-2 py-2.5">FEATURES</th>
                  <th className="px-2 py-2.5 text-center">CERT.</th>
                  <th className="px-2 py-2.5">CONNECTION</th>
                  <th className="px-2 py-2.5 text-center">POWER</th>
                  <th className="px-2 py-2.5">TEMP</th>
                  <th className="px-2 py-2.5">MOUNTING</th>
                  {(filterType === 'accessory' || filterType === 'alert') && <th className="px-2 py-2.5">SUB-CAT</th>}
                  {(filterType === 'accessory' || filterType === 'alert') && <th className="px-2 py-2.5">COMPATIBLE</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => {
                  const gases: string[] = parseJson(p.refs, []);
                  const mounts: string[] = parseJson(p.mount, []);
                  return (
                    <tr key={p.id} className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${p.status === 'discontinued' ? 'opacity-40' : p.status === 'planned' ? 'opacity-30 italic' : p.discontinued ? 'opacity-40' : ''} ${idx % 2 === 1 ? 'bg-gray-50/50' : ''} ${selected.has(p.id) ? 'bg-red-50' : ''}`}>
                      <td className="px-2 py-1.5">
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" />
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(p)} title="Edit"
                            className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 text-[10px] font-bold">E</button>
                          <button onClick={() => deleteProduct(p.id, p.code)} title="Delete"
                            className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 text-[10px] font-bold">X</button>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        {p.image ? (
                          <img src={`/assets/${p.image}`} alt={p.code} className="w-9 h-9 object-contain rounded bg-gray-50" />
                        ) : (
                          <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1.5"><span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">{p.family}</span></td>
                      <td className="px-2 py-1.5 text-gray-500 text-[11px] max-w-[120px] truncate">{p.variant ?? '—'}</td>
                      <td className="px-2 py-1.5 font-semibold text-[#1a2332] max-w-[180px]">{p.name}</td>
                      <td className="px-2 py-1.5 font-mono text-gray-500">{p.code}</td>
                      <td className="px-2 py-1.5 text-right font-bold text-[#1a2332]">{p.price > 0 ? <>{p.price.toFixed(0)} <span className="text-gray-400 font-normal">{'\u20AC'}</span></> : '\u2014'}</td>
                      <td className="px-2 py-1.5 text-center"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${tierBadge(p.tier)}`}>{p.tier}</span></td>
                      <td className="px-2 py-1.5 text-center"><span className="bg-gray-200 px-1.5 py-0.5 rounded text-[9px] font-bold">{p.productGroup}</span></td>
                      <td className="px-2 py-1.5">
                        <div className="flex flex-wrap gap-0.5">
                          {gases.map(g => <span key={g} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${gasColor(g)}`}>{g}</span>)}
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-gray-600">{p.range ?? '\u2014'}</td>
                      <td className="px-2 py-1.5">
                        {p.sensorTech && <div><span className="font-semibold">{p.sensorTech}</span>{p.sensorLife && <div className="text-[9px] text-gray-400">{p.sensorLife}</div>}</div>}
                        {!p.sensorTech && '\u2014'}
                      </td>
                      <td className="px-2 py-1.5 text-gray-600">{p.voltage ?? '\u2014'}</td>
                      <td className="px-2 py-1.5 text-center text-gray-600">{p.ip ?? '\u2014'}</td>
                      <td className="px-2 py-1.5 text-gray-600 max-w-[120px]">{outputDesc(p)}</td>
                      <td className="px-2 py-1.5 text-gray-500 max-w-[100px] truncate text-[10px]">{p.features ?? '\u2014'}</td>
                      <td className="px-2 py-1.5 text-center">
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-200 text-gray-600">CE</span>
                          {p.atex && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500 text-white">ATEX</span>}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">{connectionBadges(p)}</td>
                      <td className="px-2 py-1.5 text-center text-gray-600">{p.power ? `${p.power}W` : '\u2014'}</td>
                      <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{tempRange(p)}</td>
                      <td className="px-2 py-1.5 text-gray-600">{mounts.length > 0 ? mounts.join(', ') : '\u2014'}</td>
                      {(filterType === 'accessory' || filterType === 'alert') && <td className="px-2 py-1.5 text-gray-600">{p.subCategory ?? '\u2014'}</td>}
                      {(filterType === 'accessory' || filterType === 'alert') && <td className="px-2 py-1.5 text-gray-500 text-[10px]">{parseJson<string[]>(p.compatibleFamilies, []).join(', ') || '\u2014'}</td>}
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={22} className="px-3 py-12 text-center text-gray-400">No products found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit / Create Modal (DetectBuilder layout) ── */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#1a2332] text-white px-6 py-4 rounded-t-xl sticky top-0 z-10 flex items-center justify-between">
              <h2 className="text-lg font-bold">{isNew ? 'New Product' : `Edit ${form.code}`}</h2>
              <button onClick={() => setDialog(false)} className="text-white/70 hover:text-white text-xl leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-6">

              {/* ═══ BASIC INFORMATION ═══ */}
              <Section title="BASIC INFORMATION" color="text-[#1a2332]" defaultOpen>
                <div className="grid grid-cols-2 gap-4">
                  <Sel label="Type" value={form.type} options={[...TYPES]} onChange={v => setForm({ ...form, type: v })} />
                  <F label="Family" value={form.family} onChange={v => setForm({ ...form, family: v })} />
                  <F label="Product Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
                  <F label="Order Code" value={form.code} onChange={v => setForm({ ...form, code: v })} mono />
                  <F label="Variant" value={form.variant ?? ''} onChange={v => setForm({ ...form, variant: v || null })} placeholder="e.g. CO2 Integrated" />
                  <Sel label="Status" value={form.status} options={['active', 'planned', 'discontinued']} onChange={v => setForm({ ...form, status: v })} />
                  {(form.type === 'detector' || form.type === 'sensor' || form.type === 'alert' || form.type === 'accessory') && (
                    <F label="Sub-Type" value={form.subType ?? ''} onChange={v => setForm({ ...form, subType: v || null })} placeholder="e.g. gas_detector, beacon, power_adapter" />
                  )}
                  {/* Sub-Category + Compatibility — shown early for accessories/controllers */}
                  {(form.type === 'accessory' || form.type === 'alert') && (
                    <>
                      <Sel label="Sub-Category" value={form.subCategory ?? ''} options={['', 'mounting', 'alert', 'spare', 'service', 'power', 'cable', 'other']} onChange={v => setForm({ ...form, subCategory: v || null })} />
                      <F label="Compatible Families" value={form.compatibleFamilies} onChange={v => setForm({ ...form, compatibleFamilies: v })} mono placeholder='["GLACIAR MIDI","X5 Transmitter"]' />
                    </>
                  )}
                  <N label="Price (EUR)" value={form.price} onChange={v => setForm({ ...form, price: v })} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Image</label>
                    <div className="flex gap-2">
                      <input value={form.image ?? ''} onChange={e => setForm({ ...form, image: e.target.value || null })}
                        placeholder="e.g. midi-integrated.png"
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm font-mono" />
                    </div>
                  </div>
                </div>
                {/* Image preview */}
                {form.image && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={`/assets/${form.image}`} alt="preview"
                      className="w-16 h-16 object-contain rounded border border-gray-200 bg-gray-50" />
                    <button onClick={() => setForm({ ...form, image: null })}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold">
                      X Remove
                    </button>
                  </div>
                )}
              </Section>

              {/* ═══ CLASSIFICATION M2 ═══ */}
              <Section title="CLASSIFICATION (M2)" color="text-[#E63946]" defaultOpen>
                <div className="grid grid-cols-2 gap-4">
                  <Sel label="Tier" value={form.tier} options={[...TIERS]} onChange={v => setForm({ ...form, tier: v })} />
                  <Sel label="Product Group" value={form.productGroup} options={allProductGroups.length > 0 ? allProductGroups : ['A', 'C', 'D', 'F', 'G']} onChange={v => setForm({ ...form, productGroup: v })} />
                </div>
                {/* Refrigerant tag picker */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Compatible Refrigerants</label>
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-[32px] p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {(() => {
                      try {
                        const selected: string[] = JSON.parse(form.refs || '[]');
                        return selected.map(r => (
                          <span key={r} className="inline-flex items-center gap-1 bg-[#16354B] text-white text-xs font-semibold px-2 py-1 rounded-md">
                            {r}
                            <button type="button" onClick={() => {
                              const next = selected.filter(x => x !== r);
                              setForm({ ...form, refs: JSON.stringify(next) });
                            }} className="hover:text-red-300 ml-0.5">&times;</button>
                          </span>
                        ));
                      } catch { return null; }
                    })()}
                    {(() => {
                      try { return JSON.parse(form.refs || '[]').length === 0 && <span className="text-xs text-gray-400">No refrigerants selected</span>; } catch { return null; }
                    })()}
                  </div>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
                    value=""
                    onChange={e => {
                      if (!e.target.value) return;
                      try {
                        const current: string[] = JSON.parse(form.refs || '[]');
                        if (!current.includes(e.target.value)) {
                          setForm({ ...form, refs: JSON.stringify([...current, e.target.value]) });
                        }
                      } catch { /* ignore */ }
                      e.target.value = '';
                    }}
                  >
                    <option value="">+ Add refrigerant...</option>
                    {allRefrigerants
                      .filter(r => { try { return !JSON.parse(form.refs || '[]').includes(r.id); } catch { return true; } })
                      .map(r => <option key={r.id} value={r.id}>{r.id} — {r.name}</option>)
                    }
                  </select>
                </div>
              </Section>

              {/* ═══ DETECTION ═══ (detectors + sensors) */}
              {(form.type === 'detector' || form.type === 'sensor') && <Section title="DETECTION" color="text-[#1a2332]">
                <div className="grid grid-cols-2 gap-4">
                  <F label="Range" value={form.range ?? ''} onChange={v => setForm({ ...form, range: v || null })} placeholder="e.g. 0-10000ppm" />
                  <F label="Sensor Tech" value={form.sensorTech ?? ''} onChange={v => setForm({ ...form, sensorTech: v || null })} placeholder="IR / SC / EC / pH" />
                  <F label="Sensor Life" value={form.sensorLife ?? ''} onChange={v => setForm({ ...form, sensorLife: v || null })} placeholder="e.g. 7-10y" />
                  <F label="IP Rating" value={form.ip ?? ''} onChange={v => setForm({ ...form, ip: v || null })} placeholder="e.g. IP54" />
                  <N label="Temp Min (C)" value={form.tempMin ?? 0} onChange={v => setForm({ ...form, tempMin: v || null })} />
                  <N label="Temp Max (C)" value={form.tempMax ?? 0} onChange={v => setForm({ ...form, tempMax: v || null })} />
                </div>
                <TA label="Function" value={form.function ?? ''} onChange={v => setForm({ ...form, function: v || null })} rows={2} placeholder="Gas detection — standalone or via controller..." />
              </Section>}

              {/* ═══ ELECTRICAL ═══ (detectors + sensors + controllers + alerts) */}
              {(form.type === 'detector' || form.type === 'sensor' || form.type === 'controller' || form.type === 'alert') && <Section title="ELECTRICAL" color="text-[#1a2332]">
                <div className="grid grid-cols-2 gap-4">
                  <F label="Voltage" value={form.voltage ?? ''} onChange={v => setForm({ ...form, voltage: v || null })} placeholder="e.g. 15-24V" />
                  <N label="Power (W)" value={form.power ?? 0} onChange={v => setForm({ ...form, power: v || null })} />
                </div>
              </Section>}

              {/* ═══ OUTPUTS ═══ (detectors + sensors) */}
              {(form.type === 'detector' || form.type === 'sensor') && <Section title="OUTPUTS" color="text-[#1a2332]">
                <div className="grid grid-cols-2 gap-4">
                  <N label="Relay count" value={form.relay} onChange={v => setForm({ ...form, relay: Math.round(v) })} />
                  <F label="Analog" value={form.analog ?? ''} onChange={v => setForm({ ...form, analog: v || null })} placeholder="selectable / 4-20mA / 0-10V" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <Check label="Modbus" checked={form.modbus} onChange={v => setForm({ ...form, modbus: v })} />
                  <Check label="Remote" checked={form.remote} onChange={v => setForm({ ...form, remote: v })} />
                  <Check label="Standalone" checked={form.standalone} onChange={v => setForm({ ...form, standalone: v })} />
                </div>
              </Section>}

              {/* ═══ CONNECTION ═══ (controllers + detectors + sensors) */}
              {(form.type === 'controller' || form.type === 'detector' || form.type === 'sensor') && <Section title="CONNECTION" color="text-[#1a2332]">
                <div className="grid grid-cols-2 gap-4">
                  <F label="Connect To" value={form.connectTo ?? ''} onChange={v => setForm({ ...form, connectTo: v || null })} placeholder="e.g. MPU/SPU/SPLS" />
                  <F label="Compatible Families" value={form.compatibleFamilies} onChange={v => setForm({ ...form, compatibleFamilies: v })} mono placeholder='["GLACIAR MIDI","X5 Transmitter"]' />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <N label="Channels" value={form.channels ?? 0} onChange={v => setForm({ ...form, channels: v || null })} />
                  <N label="Max Power (W)" value={form.maxPower ?? 0} onChange={v => setForm({ ...form, maxPower: v || null })} />
                </div>
              </Section>}

              {/* ═══ MOUNTING ═══ (detectors + sensors + alerts) */}
              {(form.type === 'detector' || form.type === 'sensor' || form.type === 'alert') && <Section title="MOUNTING" color="text-[#1a2332]">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Mount Types</label>
                  <div className="flex flex-wrap gap-3">
                    {MOUNT_OPTIONS.map(m => (
                      <label key={m} className="flex items-center gap-1.5 text-xs cursor-pointer bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                        <input type="checkbox" checked={formMount().includes(m)} onChange={() => toggleMount(m)} className="rounded" />
                        <span className="capitalize">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </Section>}

              {/* ═══ CERTIFICATIONS & FEATURES ═══ */}
              <Section title="CERTIFICATIONS & FEATURES" color="text-[#1a2332]">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <Check label="ATEX certified" checked={form.atex} onChange={v => setForm({ ...form, atex: v })} />
                  <F label="Sub-Category" value={form.subCategory ?? ''} onChange={v => setForm({ ...form, subCategory: v || null })} placeholder="alert/service/mounting/power/spare" />
                </div>
                <TA label="Features" value={form.features ?? ''} onChange={v => setForm({ ...form, features: v || null })} rows={3} placeholder="LED display, Bluetooth app, etc." />
              </Section>

              {/* ═══ COMPATIBILITY (V2) ═══ */}
              <Section title="COMPATIBILITY (V2)" color="text-[#E63946]">
                <TA label="Compatible With (JSON)" value={form.compatibleWith} onChange={v => setForm({ ...form, compatibleWith: v })} rows={2} mono placeholder='["GLACIAR MIDI", "GLACIAR Controller 10"]' />
                <TA label="Connection Rules (JSON)" value={form.connectionRules} onChange={v => setForm({ ...form, connectionRules: v })} rows={3} mono placeholder='{"maxDetectors": 10, "beaconsNeeded": 1}' />
                <TA label="Ports (JSON)" value={form.ports} onChange={v => setForm({ ...form, ports: v })} rows={3} mono placeholder='[{"name": "...", "direction": "input"}]' />
              </Section>

              {/* ═══ STATUS ═══ */}
              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.discontinued} onChange={e => setForm({ ...form, discontinued: e.target.checked })} className="rounded" />
                  <span className="text-sm font-semibold text-red-600">Discontinued (End of Life — legacy flag)</span>
                </label>
              </div>

              {/* ═══ Actions ═══ */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button onClick={() => setDialog(false)}
                  className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Cancel
                </button>
                <button onClick={save} disabled={saving || !form.code || !form.name}
                  className="bg-[#E63946] hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2 rounded-md text-sm font-semibold">
                  {saving ? 'Saving...' : isNew ? 'Create Product' : 'Update Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3">
      <div className={`text-xl font-bold ${accent ?? 'text-[#1a2332]'}`}>{value}</div>
      <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5 font-semibold">{label}</div>
    </div>
  );
}

function F({ label, value, onChange, mono, placeholder }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/30 focus:border-[#E63946] ${mono ? 'font-mono' : ''}`} />
    </div>
  );
}

function N({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <input type="number" step="any" value={value} onChange={e => onChange(+e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#E63946]/30 focus:border-[#E63946]" />
    </div>
  );
}

function Sel({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E63946]/30 focus:border-[#E63946]">
        {options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
      </select>
    </div>
  );
}

function TA({ label, value, onChange, rows = 2, mono, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; mono?: boolean; placeholder?: string }) {
  return (
    <div className="mt-3">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]/30 focus:border-[#E63946] ${mono ? 'font-mono' : ''}`} />
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]" />
      <span className="text-sm text-gray-700 font-medium">{label}</span>
    </label>
  );
}

function Section({ title, color = 'text-[#1a2332]', defaultOpen = false, children }: { title: string; color?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 border-b border-gray-200 hover:border-gray-300 transition-colors">
        <span className={`text-xs font-bold tracking-wider ${color}`}>{title}</span>
        <span className="text-gray-400 text-lg font-light">{open ? '\u2212' : '+'}</span>
      </button>
      {open && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  );
}
