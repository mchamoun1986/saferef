'use client';

import { useCallback, useEffect, useState } from 'react';

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
  maxPower: number | null;
  powerDesc: string | null;
  relaySpec: string | null;
  analogType: string | null;
  modbusType: string | null;
  subCategory: string | null;
  compatibleFamilies: string;
  createdAt: string;
  updatedAt: string;
}

const TYPES = ['detector', 'controller', 'accessory'] as const;
const FAMILIES = ['MIDI', 'X5', 'RM', 'Aquis', 'Controller', 'Accessory'] as const;
const TIERS = ['standard', 'premium', 'economy'] as const;
const GAS_OPTIONS = ['CO2', 'HFC1', 'HFC2', 'NH3', 'R290', 'CO', 'NO2', 'O2'] as const;
const MOUNT_OPTIONS = ['wall', 'ceiling', 'floor'] as const;

const EMPTY_PRODUCT: Omit<Product, 'createdAt' | 'updatedAt'> = {
  id: '', type: 'detector', family: 'MIDI', name: '', code: '', price: 0,
  image: null, specs: '{}', tier: 'standard', productGroup: 'A',
  gas: '[]', refs: '[]', apps: '[]', range: null, sensorTech: null, sensorLife: null,
  power: null, voltage: null, ip: null, tempMin: null, tempMax: null,
  relay: 0, analog: null, modbus: false, standalone: true, atex: false,
  mount: '[]', remote: false, features: null, connectTo: null, discontinued: false,
  channels: null, maxPower: null, powerDesc: null, relaySpec: null, analogType: null,
  modbusType: null, subCategory: null, compatibleFamilies: '[]',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseJson<T>(val: string, fallback: T): T {
  try { return JSON.parse(val); } catch { return fallback; }
}

function gasColor(g: string): string {
  const map: Record<string, string> = {
    CO2: 'bg-blue-100 text-blue-700', HFC1: 'bg-green-100 text-green-700',
    HFC2: 'bg-teal-100 text-teal-700', NH3: 'bg-purple-100 text-purple-700',
    R290: 'bg-orange-100 text-orange-700', CO: 'bg-red-100 text-red-700',
    NO2: 'bg-yellow-100 text-yellow-800', O2: 'bg-cyan-100 text-cyan-700',
  };
  return map[g] ?? 'bg-gray-100 text-gray-700';
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterFamily, setFilterFamily] = useState<string>('');
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<Product, 'createdAt' | 'updatedAt'>>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (filterFamily) params.set('family', filterFamily);
    if (search) params.set('search', search);
    const url = '/api/products' + (params.toString() ? '?' + params.toString() : '');
    const res = await fetch(url);
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filterType, filterFamily, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalAll = products.length;
  // We need unfiltered counts for the stats cards, so compute from all products
  // But since products are already filtered, we fetch all for stats
  const detectors = products.filter(p => p.type === 'detector').length;
  const controllers = products.filter(p => p.type === 'controller').length;
  const accessories = products.filter(p => p.type === 'accessory').length;

  // ── CRUD ──────────────────────────────────────────────────────────────────

  function openNew() {
    setIsNew(true);
    setForm({ ...EMPTY_PRODUCT });
    setDialog(true);
  }

  function openEdit(p: Product) {
    setIsNew(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...rest } = p;
    setForm({ ...rest });
    setDialog(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (isNew) {
        const { id, ...data } = form;
        void id;
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      await fetchProducts();
      setDialog(false);
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaving(false);
  }

  async function deleteProduct(id: string, code: string) {
    if (!confirm(`Delete product "${code}"?`)) return;
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    await fetchProducts();
  }

  // ── Form helpers ──────────────────────────────────────────────────────────

  function formGas(): string[] { return parseJson(form.gas, []); }
  function formMount(): string[] { return parseJson(form.mount, []); }

  function toggleGas(g: string) {
    const cur = formGas();
    const next = cur.includes(g) ? cur.filter(x => x !== g) : [...cur, g];
    setForm({ ...form, gas: JSON.stringify(next) });
  }

  function toggleMount(m: string) {
    const cur = formMount();
    const next = cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m];
    setForm({ ...form, mount: JSON.stringify(next) });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2332]">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{totalAll} products in catalog</p>
        </div>
        <button onClick={openNew}
          className="bg-[#E63946] hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          + Add Product
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: totalAll, color: 'text-[#16354B]' },
          { label: 'Detectors', value: detectors, color: 'text-blue-600' },
          { label: 'Controllers', value: controllers, color: 'text-green-600' },
          { label: 'Accessories', value: accessories, color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Type buttons */}
        <div className="flex gap-1">
          {[{ label: 'All', value: '' }, ...TYPES.map(t => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t }))].map(t => (
            <button key={t.value} onClick={() => setFilterType(t.value)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                filterType === t.value ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Family dropdown */}
        <select value={filterFamily} onChange={e => setFilterFamily(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm">
          <option value="">All Families</option>
          {FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {/* Search */}
        <input type="text" placeholder="Search by name or code..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm w-64" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#16354B] text-left text-[10px] font-semibold text-white uppercase tracking-wider">
                  <th className="px-3 py-2.5">Code</th>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Family</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Tier</th>
                  <th className="px-3 py-2.5">Gas</th>
                  <th className="px-3 py-2.5">Range</th>
                  <th className="px-3 py-2.5">Voltage</th>
                  <th className="px-3 py-2.5">Price</th>
                  <th className="px-3 py-2.5">ATEX</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const gases: string[] = parseJson(p.gas, []);
                  return (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                      <td className="px-3 py-2 font-mono text-xs font-semibold">{p.code}</td>
                      <td className="px-3 py-2 text-xs font-semibold max-w-[200px] truncate">{p.name}</td>
                      <td className="px-3 py-2 text-xs"><span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{p.family}</span></td>
                      <td className="px-3 py-2 text-xs capitalize">{p.type}</td>
                      <td className="px-3 py-2 text-xs capitalize">{p.tier}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {gases.map(g => (
                            <span key={g} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${gasColor(g)}`}>{g}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">{p.range ?? '—'}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{p.voltage ?? '—'}</td>
                      <td className="px-3 py-2 text-xs font-semibold">{p.price > 0 ? `${p.price.toFixed(0)} \u20AC` : '—'}</td>
                      <td className="px-3 py-2 text-xs">{p.atex ? <span className="text-green-600 font-bold">&#10003;</span> : ''}</td>
                      <td className="px-3 py-2 text-xs">
                        {p.discontinued && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold">EOL</span>}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                          <button onClick={() => deleteProduct(p.id, p.code)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr><td colSpan={12} className="px-3 py-8 text-center text-gray-400">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit / Create Modal ── */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-[#1a2332] text-white px-6 py-4 rounded-t-xl">
              <h2 className="text-lg font-bold">{isNew ? 'New Product' : `Edit ${form.code}`}</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Row 1: code, name, type, family, tier, price */}
              <div className="grid grid-cols-6 gap-3">
                <F label="Code" value={form.code} onChange={v => setForm({ ...form, code: v })} mono />
                <div className="col-span-2">
                  <F label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
                </div>
                <Sel label="Type" value={form.type} options={[...TYPES]} onChange={v => setForm({ ...form, type: v })} />
                <Sel label="Family" value={form.family} options={[...FAMILIES]} onChange={v => setForm({ ...form, family: v })} />
                <Sel label="Tier" value={form.tier} options={[...TIERS]} onChange={v => setForm({ ...form, tier: v })} />
              </div>

              {/* Row 2: gas checkboxes, range, sensorTech, sensorLife */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Gas Types</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {GAS_OPTIONS.map(g => (
                    <label key={g} className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={formGas().includes(g)} onChange={() => toggleGas(g)} className="rounded" />
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${gasColor(g)}`}>{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <F label="Range" value={form.range ?? ''} onChange={v => setForm({ ...form, range: v || null })} />
                <F label="Sensor Tech" value={form.sensorTech ?? ''} onChange={v => setForm({ ...form, sensorTech: v || null })} />
                <F label="Sensor Life" value={form.sensorLife ?? ''} onChange={v => setForm({ ...form, sensorLife: v || null })} />
                <N label="Price" value={form.price} onChange={v => setForm({ ...form, price: v })} />
              </div>

              {/* Row 3: voltage, power, relay, analog, modbus */}
              <div className="grid grid-cols-5 gap-3">
                <F label="Voltage" value={form.voltage ?? ''} onChange={v => setForm({ ...form, voltage: v || null })} />
                <N label="Power (W)" value={form.power ?? 0} onChange={v => setForm({ ...form, power: v || null })} />
                <N label="Relay" value={form.relay} onChange={v => setForm({ ...form, relay: Math.round(v) })} />
                <F label="Analog" value={form.analog ?? ''} onChange={v => setForm({ ...form, analog: v || null })} />
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={form.modbus} onChange={e => setForm({ ...form, modbus: e.target.checked })} className="rounded" />
                    Modbus
                  </label>
                </div>
              </div>

              {/* Row 4: mount checkboxes, ip, standalone, atex, remote */}
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Mount</label>
                  <div className="flex flex-wrap gap-2">
                    {MOUNT_OPTIONS.map(m => (
                      <label key={m} className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={formMount().includes(m)} onChange={() => toggleMount(m)} className="rounded" />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
                <F label="IP Rating" value={form.ip ?? ''} onChange={v => setForm({ ...form, ip: v || null })} />
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={form.standalone} onChange={e => setForm({ ...form, standalone: e.target.checked })} className="rounded" />
                    Standalone
                  </label>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={form.atex} onChange={e => setForm({ ...form, atex: e.target.checked })} className="rounded" />
                    ATEX
                  </label>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={form.remote} onChange={e => setForm({ ...form, remote: e.target.checked })} className="rounded" />
                    Remote
                  </label>
                </div>
              </div>

              {/* Row 5: channels, maxPower, connectTo, subCategory, compatibleFamilies */}
              <div className="grid grid-cols-5 gap-3">
                <N label="Channels" value={form.channels ?? 0} onChange={v => setForm({ ...form, channels: v || null })} />
                <N label="Max Power (W)" value={form.maxPower ?? 0} onChange={v => setForm({ ...form, maxPower: v || null })} />
                <F label="Connect To" value={form.connectTo ?? ''} onChange={v => setForm({ ...form, connectTo: v || null })} />
                <F label="Sub-Category" value={form.subCategory ?? ''} onChange={v => setForm({ ...form, subCategory: v || null })} />
                <F label="Compatible Families" value={form.compatibleFamilies} onChange={v => setForm({ ...form, compatibleFamilies: v })} mono />
              </div>

              {/* Row 6: features, discontinued */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Features</label>
                  <textarea value={form.features ?? ''} onChange={e => setForm({ ...form, features: e.target.value || null })}
                    rows={3} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={form.discontinued} onChange={e => setForm({ ...form, discontinued: e.target.checked })} className="rounded" />
                  <span className="font-semibold text-red-600">Discontinued (EOL)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => setDialog(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                <button onClick={save} disabled={saving || !form.code || !form.name}
                  className="bg-[#E63946] hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-md text-sm font-semibold">
                  {saving ? 'Saving...' : isNew ? 'Create' : 'Update'}
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

function F({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className={`w-full px-2 py-1.5 border border-gray-300 rounded text-sm ${mono ? 'font-mono' : ''}`} />
    </div>
  );
}

function N({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input type="number" step="any" value={value} onChange={e => onChange(+e.target.value)}
        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-mono" />
    </div>
  );
}

function Sel({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
