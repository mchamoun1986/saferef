'use client';

import { useEffect, useState } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

interface AppItem {
  id: string;
  labelFr: string;
  labelEn: string;
  icon: string;
  descFr: string;
  descEn: string;
  // M1
  accessCategory: string;
  locationClass: string;
  belowGround: boolean;
  isMachineryRoom: boolean;
  isOccupiedSpace: boolean;
  humanComfort: boolean;
  c3Applicable: boolean;
  mechVentilation: boolean;
  // M2
  productFamilies: string;
  defaultRanges: string;
  suggestedGases: string;
  applicableSpaceTypes: string;
  sortOrder: number;
}

interface SpaceTypeItem {
  id: string;
  labelFr: string;
  labelEn: string;
  icon: string;
}

const EMPTY_APP: AppItem = {
  id: '', labelFr: '', labelEn: '', icon: '🏢', descFr: '', descEn: '',
  accessCategory: 'b', locationClass: 'II',
  belowGround: false, isMachineryRoom: false, isOccupiedSpace: false,
  humanComfort: false, c3Applicable: false, mechVentilation: false,
  productFamilies: '[]', defaultRanges: '{}', suggestedGases: '[]',
  applicableSpaceTypes: '[]',
  sortOrder: 99,
};

const FAMILIES = ['MIDI', 'X5', 'G', 'GXR', 'GEX', 'TR', 'MP', 'RM', 'AQUIS', 'GK', 'GR'];

// ── Component ───────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [allSpaceTypes, setAllSpaceTypes] = useState<SpaceTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<'identity' | 'regulatory' | 'selection'>('identity');
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<AppItem>(EMPTY_APP);
  const [saving, setSaving] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  async function fetchApps() {
    setLoading(true);
    try {
      const [appsRes, stRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/space-types'),
      ]);
      const appsData = await appsRes.json();
      const stData = await stRes.json();
      setApps(Array.isArray(appsData) ? appsData : []);
      setAllSpaceTypes(Array.isArray(stData) ? stData : []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { fetchApps(); }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function openNew() {
    setIsNew(true);
    setForm({ ...EMPTY_APP, sortOrder: apps.length + 1 });
    setDialogTab('identity');
    setDialogOpen(true);
  }

  function openEdit(app: AppItem) {
    setIsNew(false);
    setForm({ ...app });
    setDialogTab('identity');
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = isNew
        ? await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        : await fetch('/api/applications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Save failed: ${err.error || res.statusText}`);
        setSaving(false);
        return;
      }
      await fetchApps();
      setDialogOpen(false);
    } catch (err) {
      alert('Network error — save failed');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/applications?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Delete failed — check login'); return; }
    await fetchApps();
  }

  // ── JSON helpers ──────────────────────────────────────────────────────────

  function parsedFamilies(): string[] {
    try { return JSON.parse(form.productFamilies); } catch { return []; }
  }

  function toggleFamily(f: string) {
    const current = parsedFamilies();
    const next = current.includes(f) ? current.filter(x => x !== f) : [...current, f];
    setForm({ ...form, productFamilies: JSON.stringify(next) });
  }

  function parsedGases(): string[] {
    try { return JSON.parse(form.suggestedGases); } catch { return []; }
  }

  function toggleGas(g: string) {
    const current = parsedGases();
    const next = current.includes(g) ? current.filter(x => x !== g) : [...current, g];
    setForm({ ...form, suggestedGases: JSON.stringify(next) });
  }

  function parsedRanges(): Record<string, string> {
    try { return JSON.parse(form.defaultRanges); } catch { return {}; }
  }

  function setRange(ref: string, range: string) {
    const current = parsedRanges();
    if (!range) { delete current[ref]; } else { current[ref] = range; }
    setForm({ ...form, defaultRanges: JSON.stringify(current) });
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
          <h1 className="text-2xl font-bold text-[#1a2332]">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">{apps.length} applications — source de verite pour M1 + M2</p>
        </div>
        <button onClick={openNew} className="bg-[#E63946] hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          + Add Application
        </button>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {apps.map(app => {
          const families = (() => { try { return JSON.parse(app.productFamilies) as string[]; } catch { return []; } })();
          const gases = (() => { try { return JSON.parse(app.suggestedGases) as string[]; } catch { return []; } })();
          const zoneIds = (() => { try { return JSON.parse(app.applicableSpaceTypes || '[]') as string[]; } catch { return []; } })();
          return (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-[#16354B] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{app.icon}</span>
                  <div>
                    <div className="text-white font-semibold">{app.labelFr}</div>
                    <div className="text-white/50 text-xs">{app.labelEn}</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-white/30 bg-white/10 px-2 py-0.5 rounded">{app.id}</span>
              </div>
              <div className="px-5 py-4 space-y-3 text-xs">
                <p className="text-sm text-gray-600">{app.descFr}</p>

                {/* M1 summary */}
                <div className="flex flex-wrap gap-1">
                  <Tag label={`Cat.${app.accessCategory}`} />
                  <Tag label={`Loc.${app.locationClass}`} />
                  {app.isMachineryRoom && <Tag label="Salle machines" color="red" />}
                  {app.isOccupiedSpace && <Tag label="Occupe" color="blue" />}
                  {app.humanComfort && <Tag label="Confort" color="blue" />}
                  {app.belowGround && <Tag label="Sous-sol" color="orange" />}
                  {app.c3Applicable && <Tag label="C.3" color="green" />}
                  {app.mechVentilation && <Tag label="Ventil." color="green" />}
                </div>

                {/* M2 summary */}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Familles M2:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {families.map(f => <span key={f} className="bg-purple-100 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{f}</span>)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Gaz:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {gases.map(g => <span key={g} className="bg-[#A7C031]/15 text-[#6b7d1e] text-[10px] font-semibold px-2 py-0.5 rounded-full">{g}</span>)}
                  </div>
                </div>
                {zoneIds.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Zones:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {zoneIds.map(zId => {
                        const st = allSpaceTypes.find(s => s.id === zId);
                        return (
                          <span key={zId} className="bg-cyan-100 text-cyan-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {st ? `${st.icon} ${st.labelEn}` : zId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(app)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">Edit</button>
                  <button onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Edit Dialog (3 tabs) ── */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#1a2332] text-white px-6 py-4 rounded-t-xl">
              <h2 className="text-lg font-bold">{isNew ? 'New Application' : `Edit: ${form.labelFr}`}</h2>
              <div className="flex gap-1 mt-2">
                {(['identity', 'regulatory', 'selection'] as const).map(t => (
                  <button key={t} onClick={() => setDialogTab(t)}
                    className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                      dialogTab === t ? 'bg-white text-[#1a2332]' : 'text-white/60 hover:text-white'
                    }`}>
                    {t === 'identity' ? 'Identite' : t === 'regulatory' ? 'Reglementaire (M1)' : 'Selection (M2)'}
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
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Ordre</label>
                    <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DField label="Label (FR)" value={form.labelFr} onChange={v => setForm({ ...form, labelFr: v })} />
                  <DField label="Label (EN)" value={form.labelEn} onChange={v => setForm({ ...form, labelEn: v })} />
                  <DField label="Description (FR)" value={form.descFr} onChange={v => setForm({ ...form, descFr: v })} />
                  <DField label="Description (EN)" value={form.descEn} onChange={v => setForm({ ...form, descEn: v })} />
                </div>
              </>)}

              {/* ── Regulatory Tab (M1) ── */}
              {dialogTab === 'regulatory' && (<>
                <p className="text-xs text-gray-500">Valeurs pre-remplies dans le wizard quand cette application est selectionnee. L&apos;utilisateur peut override.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Categorie d&apos;acces</label>
                    <select value={form.accessCategory} onChange={e => setForm({ ...form, accessCategory: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                      <option value="a">a — Acces autorise</option>
                      <option value="b">b — Acces general</option>
                      <option value="c">c — Acces supervise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Classe d&apos;emplacement</label>
                    <select value={form.locationClass} onChange={e => setForm({ ...form, locationClass: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV — Enceinte ventilee</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <DToggle label="Sous-sol" checked={form.belowGround} onChange={v => setForm({ ...form, belowGround: v })} />
                  <DToggle label="Salle des machines" checked={form.isMachineryRoom} onChange={v => setForm({ ...form, isMachineryRoom: v })} />
                  <DToggle label="Espace occupe" checked={form.isOccupiedSpace} onChange={v => setForm({ ...form, isOccupiedSpace: v })} />
                  <DToggle label="Confort humain" checked={form.humanComfort} onChange={v => setForm({ ...form, humanComfort: v })} />
                  <DToggle label="C.3 applicable" checked={form.c3Applicable} onChange={v => setForm({ ...form, c3Applicable: v })} />
                  <DToggle label="Ventilation mecanique" checked={form.mechVentilation} onChange={v => setForm({ ...form, mechVentilation: v })} />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
                  Ces valeurs seront auto-remplies dans le Step 3 du calculateur quand l&apos;utilisateur choisit cette application.
                </div>
              </>)}

              {/* ── Selection Tab (M2) ── */}
              {dialogTab === 'selection' && (<>
                <p className="text-xs text-gray-500">Familles de produits prioritaires et ranges par defaut pour le moteur de selection M2.</p>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Zones applicables</label>
                  <div className="flex flex-wrap gap-2">
                    {allSpaceTypes.map(st => {
                      const currentIds: string[] = (() => { try { return JSON.parse(form.applicableSpaceTypes || '[]'); } catch { return []; } })();
                      const active = currentIds.includes(st.id);
                      return (
                        <button key={st.id} type="button" onClick={() => {
                          const next = active ? currentIds.filter(x => x !== st.id) : [...currentIds, st.id];
                          setForm({ ...form, applicableSpaceTypes: JSON.stringify(next) });
                        }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            active ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}>
                          {st.icon} {st.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Familles produits prioritaires</label>
                  <div className="flex flex-wrap gap-2">
                    {FAMILIES.map(f => {
                      const active = parsedFamilies().includes(f);
                      return (
                        <button key={f} onClick={() => toggleFamily(f)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            active ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}>
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Gaz suggeres</label>
                  <div className="flex flex-wrap gap-2">
                    {['co2', 'hfc1', 'hfc2', 'nh3', 'r290', 'co', 'no2', 'o2'].map(g => {
                      const active = parsedGases().includes(g);
                      return (
                        <button key={g} onClick={() => toggleGas(g)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            active ? 'bg-[#A7C031] text-white border-[#A7C031]' : 'bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}>
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Ranges par defaut (refrigerant → range)</label>
                  <div className="space-y-2">
                    {['R744', 'R717', 'CO', 'NO2'].map(ref => {
                      const ranges = parsedRanges();
                      return (
                        <div key={ref} className="flex items-center gap-2">
                          <span className="text-xs font-mono w-12">{ref}</span>
                          <input value={ranges[ref] ?? ''} onChange={e => setRange(ref, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" placeholder="ex: 0-10000ppm" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>)}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-xl">
              <div className="flex gap-2">
                {dialogTab !== 'identity' && (
                  <button onClick={() => setDialogTab(dialogTab === 'selection' ? 'regulatory' : 'identity')} className="text-sm text-gray-500 hover:text-gray-700">← Precedent</button>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDialogOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                {dialogTab !== 'selection' ? (
                  <button onClick={() => setDialogTab(dialogTab === 'identity' ? 'regulatory' : 'selection')}
                    className="bg-[#16354B] text-white px-5 py-2 rounded-md text-sm font-semibold">
                    Suivant →
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={saving || !form.id || !form.labelFr}
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
