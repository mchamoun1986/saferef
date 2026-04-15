'use client';

import { useEffect, useState } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

interface SpaceTypeItem {
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
  sortOrder: number;
}

const EMPTY: SpaceTypeItem = {
  id: '', labelFr: '', labelEn: '', icon: '🏢',
  accessCategory: 'b', locationClass: 'II',
  belowGround: false, isMachineryRoom: false, isOccupiedSpace: false,
  humanComfort: false, c3Applicable: false, mechVentilation: false,
  sortOrder: 99,
};

// ── Component ───────────────────────────────────────────────────────────────

export default function SpaceTypesPage() {
  const [items, setItems] = useState<SpaceTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<'identity' | 'regulatory'>('identity');
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<SpaceTypeItem>(EMPTY);
  const [saving, setSaving] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch('/api/space-types');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function openNew() {
    setIsNew(true);
    setForm({ ...EMPTY, sortOrder: items.length + 1 });
    setDialogTab('identity');
    setDialogOpen(true);
  }

  function openEdit(item: SpaceTypeItem) {
    setIsNew(false);
    setForm({ ...item });
    setDialogTab('identity');
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = isNew
        ? await fetch('/api/space-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        : await fetch('/api/space-types', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Save failed: ${err.error || res.statusText}`);
        setSaving(false);
        return;
      }
      await fetchItems();
      setDialogOpen(false);
    } catch {
      alert('Network error — save failed');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(`Delete space type "${id}"?`)) return;
    const res = await fetch(`/api/space-types?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Delete failed'); return; }
    await fetchItems();
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2332]">Space Types (Zones)</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} space types — defaults réglementaires par type de zone</p>
        </div>
        <button onClick={openNew} className="bg-[#E63946] hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          + Add Space Type
        </button>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-[#16354B] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <div className="text-white font-semibold">{item.labelEn}</div>
                  <div className="text-white/50 text-xs">{item.labelFr}</div>
                </div>
              </div>
              <span className="font-mono text-[10px] text-white/30 bg-white/10 px-2 py-0.5 rounded">{item.id}</span>
            </div>
            <div className="px-5 py-4 space-y-3 text-xs">
              {/* Regulatory summary */}
              <div className="flex flex-wrap gap-1">
                <Tag label={`Cat. ${item.accessCategory}`} />
                <Tag label={`Class ${item.locationClass}`} />
                {item.isMachineryRoom && <Tag label="Machinery Room" color="red" />}
                {item.isOccupiedSpace && <Tag label="Occupied" color="blue" />}
                {item.humanComfort && <Tag label="Comfort" color="blue" />}
                {item.belowGround && <Tag label="Below Ground" color="orange" />}
                {item.c3Applicable && <Tag label="C.3" color="green" />}
                {item.mechVentilation && <Tag label="Mech. Vent." color="green" />}
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Dialog (2 tabs) ── */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#1a2332] text-white px-6 py-4 rounded-t-xl">
              <h2 className="text-lg font-bold">{isNew ? 'New Space Type' : `Edit: ${form.labelEn}`}</h2>
              <div className="flex gap-1 mt-2">
                {(['identity', 'regulatory'] as const).map(t => (
                  <button key={t} onClick={() => setDialogTab(t)}
                    className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                      dialogTab === t ? 'bg-white text-[#1a2332]' : 'text-white/60 hover:text-white'
                    }`}>
                    {t === 'identity' ? 'Identity' : 'Regulatory (M1)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="p-6 space-y-4">

              {/* ── Identity Tab ── */}
              {dialogTab === 'identity' && (<>
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Icon</label>
                    <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-center text-2xl" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">ID (unique, underscores)</label>
                    <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} disabled={!isNew}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-mono disabled:bg-gray-100" placeholder="cold_room" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sort Order</label>
                    <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DField label="Label (EN)" value={form.labelEn} onChange={v => setForm({ ...form, labelEn: v })} />
                  <DField label="Label (FR)" value={form.labelFr} onChange={v => setForm({ ...form, labelFr: v })} />
                </div>
              </>)}

              {/* ── Regulatory Tab (M1) ── */}
              {dialogTab === 'regulatory' && (<>
                <p className="text-xs text-gray-500">Default regulatory values pre-filled when this space type is selected per zone.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Access Category</label>
                    <select value={form.accessCategory} onChange={e => setForm({ ...form, accessCategory: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                      <option value="a">a — Authorized access</option>
                      <option value="b">b — General access</option>
                      <option value="c">c — Supervised access</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Location Class</label>
                    <select value={form.locationClass} onChange={e => setForm({ ...form, locationClass: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV — Ventilated enclosure</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <DToggle label="Below Ground" checked={form.belowGround} onChange={v => setForm({ ...form, belowGround: v })} />
                  <DToggle label="Machinery Room" checked={form.isMachineryRoom} onChange={v => setForm({ ...form, isMachineryRoom: v })} />
                  <DToggle label="Occupied Space" checked={form.isOccupiedSpace} onChange={v => setForm({ ...form, isOccupiedSpace: v })} />
                  <DToggle label="Human Comfort" checked={form.humanComfort} onChange={v => setForm({ ...form, humanComfort: v })} />
                  <DToggle label="C.3 Applicable" checked={form.c3Applicable} onChange={v => setForm({ ...form, c3Applicable: v })} />
                  <DToggle label="Mech. Ventilation" checked={form.mechVentilation} onChange={v => setForm({ ...form, mechVentilation: v })} />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
                  These values will auto-fill the regulatory context when user selects this space type per zone in the calculator.
                </div>
              </>)}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-xl">
              <div className="flex gap-2">
                {dialogTab === 'regulatory' && (
                  <button onClick={() => setDialogTab('identity')} className="text-sm text-gray-500 hover:text-gray-700">← Previous</button>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDialogOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                {dialogTab === 'identity' ? (
                  <button onClick={() => setDialogTab('regulatory')}
                    className="bg-[#16354B] text-white px-5 py-2 rounded-md text-sm font-semibold">
                    Next →
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={saving || !form.id || !form.labelEn}
                    className="bg-[#E63946] hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors">
                    {saving ? 'Saving...' : isNew ? 'Create' : 'Update'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Tag({ label, color }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors[color ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

function DField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
    </div>
  );
}

function DToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-gray-50">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
      {label}
    </label>
  );
}
