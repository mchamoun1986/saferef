'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductRelation {
  id: string;
  fromCode: string;
  toCode: string;
  type: string;
  mandatory: boolean;
  qtyRule: string;
  condition: string | null;
  reason: string | null;
  priority: number;
  createdAt: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  type: string;
  family: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const RELATION_TYPES = [
  'requires_base',
  'compatible_controller',
  'required_accessory',
  'alert_device',
  'suggested_accessory',
] as const;

const QTY_RULES = [
  '1:1',
  'per_detector',
  'per_controller',
  'per_project',
  'ceil_n_5',
] as const;

const TYPE_LABELS: Record<string, string> = {
  requires_base: 'Requires Base',
  compatible_controller: 'Controller',
  required_accessory: 'Required Acc.',
  alert_device: 'Alert Device',
  suggested_accessory: 'Suggested Acc.',
};

const TYPE_COLORS: Record<string, string> = {
  requires_base: 'bg-blue-100 text-blue-700 border-blue-200',
  compatible_controller: 'bg-purple-100 text-purple-700 border-purple-200',
  required_accessory: 'bg-red-100 text-red-700 border-red-200',
  alert_device: 'bg-orange-100 text-orange-700 border-orange-200',
  suggested_accessory: 'bg-green-100 text-green-700 border-green-200',
};

const EMPTY_FORM = {
  fromCode: '',
  toCode: '',
  type: 'requires_base',
  mandatory: false,
  qtyRule: 'per_detector',
  condition: '',
  reason: '',
  priority: 0,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 text-center">
      <div className={`text-2xl font-bold ${accent ?? 'text-[#1a2332]'}`}>{value}</div>
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function Dialog({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-[#1a2332] text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function F({ label, value, onChange, mono, placeholder }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-2 py-1.5 border border-gray-300 rounded text-sm ${mono ? 'font-mono' : ''}`} />
    </div>
  );
}

function Sel({ label, value, options, onChange }: { label: string; value: string; options: readonly string[] | string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CompatibilityPage() {
  const [relations, setRelations] = useState<ProductRelation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRelations = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/product-relations');
    const data = await res.json();
    setRelations(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await fetch('/api/products?discontinued=false');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchRelations();
    fetchProducts();
  }, [fetchRelations, fetchProducts]);

  // ── Product lookup map ─────────────────────────────────────────────────────

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach(p => map.set(p.code, p));
    return map;
  }, [products]);

  function productName(code: string): string {
    return productMap.get(code)?.name ?? '';
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  const countByType = useMemo(() => {
    const counts: Record<string, number> = {};
    RELATION_TYPES.forEach(t => { counts[t] = 0; });
    relations.forEach(r => { if (counts[r.type] !== undefined) counts[r.type]++; else counts[r.type] = 1; });
    return counts;
  }, [relations]);

  const mandatoryCount = useMemo(() => relations.filter(r => r.mandatory).length, [relations]);

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = relations;
    if (filterType) list = list.filter(r => r.type === filterType);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.fromCode.toLowerCase().includes(q) ||
        r.toCode.toLowerCase().includes(q) ||
        (r.reason ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [relations, filterType, search]);

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fromCode || !form.toCode || !form.type) return;
    setSaving(true);
    try {
      const res = await fetch('/api/product-relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          condition: form.condition || null,
          reason: form.reason || null,
        }),
      });
      if (res.ok) {
        await fetchRelations();
        setForm({ ...EMPTY_FORM });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Add relation error:', err);
    }
    setSaving(false);
  }

  async function handleDelete(id: string, fromCode: string, toCode: string) {
    if (!confirm(`Delete relation "${fromCode} → ${toCode}"?`)) return;
    await fetch(`/api/product-relations?id=${id}`, { method: 'DELETE' });
    await fetchRelations();
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 max-w-[1800px] mx-auto">

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
        <StatCard value={relations.length} label="TOTAL RELATIONS" />
        <StatCard value={countByType['requires_base'] ?? 0} label="REQUIRES BASE" />
        <StatCard value={countByType['compatible_controller'] ?? 0} label="CONTROLLER" />
        <StatCard value={countByType['required_accessory'] ?? 0} label="REQ. ACCESSORY" />
        <StatCard value={countByType['alert_device'] ?? 0} label="ALERT DEVICE" />
        <StatCard value={countByType['suggested_accessory'] ?? 0} label="SUGGESTED ACC." />
        <StatCard value={mandatoryCount} label="MANDATORY" accent={mandatoryCount > 0 ? 'text-red-600' : 'text-[#1a2332]'} />
      </div>

      {/* Header + controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a2332]">Product Compatibility</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filtered.length} relation{filtered.length !== 1 ? 's' : ''}
            {filterType || search ? ` (filtered from ${relations.length})` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#E63946] hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          + Add Relation
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search codes or reason..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm w-56 bg-white"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
        >
          <option value="">All Types</option>
          {RELATION_TYPES.map(t => (
            <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
          ))}
        </select>
        {(filterType || search) && (
          <button
            onClick={() => { setFilterType(''); setSearch(''); }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            {relations.length === 0 ? 'No relations defined yet.' : 'No relations match the current filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#16354B] text-left text-[10px] font-semibold text-white uppercase tracking-wider">
                  <th className="px-3 py-2.5">From</th>
                  <th className="px-3 py-2.5">To</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Mandatory</th>
                  <th className="px-3 py-2.5">Qty Rule</th>
                  <th className="px-3 py-2.5">Condition</th>
                  <th className="px-3 py-2.5">Reason</th>
                  <th className="px-3 py-2.5">Prio</th>
                  <th className="px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                    <td className="px-3 py-2 min-w-[140px]">
                      <span className="font-mono text-xs font-semibold text-[#1a2332]">{r.fromCode}</span>
                      {productName(r.fromCode) && (
                        <div className="text-[10px] text-gray-400 truncate max-w-[160px]">{productName(r.fromCode)}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 min-w-[140px]">
                      <span className="font-mono text-xs font-semibold text-[#1a2332]">{r.toCode}</span>
                      {productName(r.toCode) && (
                        <div className="text-[10px] text-gray-400 truncate max-w-[160px]">{productName(r.toCode)}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${TYPE_COLORS[r.type] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {TYPE_LABELS[r.type] ?? r.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {r.mandatory ? (
                        <span className="inline-block w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">✓</span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{r.qtyRule}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 max-w-[120px] truncate">
                      {r.condition ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 max-w-[160px] truncate">
                      {r.reason ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 text-center">{r.priority}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDelete(r.id, r.fromCode, r.toCode)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Relation Dialog */}
      {showAddForm && (
        <Dialog title="Add Product Relation" onClose={() => { setShowAddForm(false); setForm({ ...EMPTY_FORM }); }}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <F label="From Code *" value={form.fromCode} onChange={v => setForm({ ...form, fromCode: v.toUpperCase() })} mono placeholder="e.g. MIDI-CO2-W" />
              <F label="To Code *" value={form.toCode} onChange={v => setForm({ ...form, toCode: v.toUpperCase() })} mono placeholder="e.g. SPU-4" />
            </div>

            <Sel
              label="Type *"
              value={form.type}
              options={RELATION_TYPES}
              onChange={v => setForm({ ...form, type: v })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Sel
                label="Qty Rule"
                value={form.qtyRule}
                options={QTY_RULES}
                onChange={v => setForm({ ...form, qtyRule: v })}
              />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.mandatory}
                  onChange={e => setForm({ ...form, mandatory: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-red-600"
                />
                <span className="text-sm font-semibold text-gray-700">Mandatory</span>
                <span className="text-xs text-gray-400">(required for safe operation)</span>
              </label>
            </div>

            <F label="Condition (optional)" value={form.condition} onChange={v => setForm({ ...form, condition: v })} placeholder="e.g. standalone=true" />
            <F label="Reason (optional)" value={form.reason} onChange={v => setForm({ ...form, reason: v })} placeholder="e.g. Detector requires SPU controller" />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setForm({ ...EMPTY_FORM }); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !form.fromCode || !form.toCode}
                className="bg-[#E63946] hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-md text-sm font-semibold"
              >
                {saving ? 'Saving...' : 'Add Relation'}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
