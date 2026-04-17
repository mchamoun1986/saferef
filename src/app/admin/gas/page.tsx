'use client';

import { useCallback, useEffect, useState } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

interface RefV5 {
  id: string; name: string; safetyClass: string; toxicityClass: string; flammabilityClass: string;
  atelOdl: number | null; lfl: number | null; practicalLimit: number; vapourDensity: number;
  molecularMass: number; boilingPoint: string | null; gwp: string | null; gasGroup: string;
}

interface GasCat {
  id: string; nameFr: string; nameEn: string; code: string; safetyClass: string;
  coverage: number; density: string; specs: string;
}

type Tab = 'refrigerants' | 'gas-categories';

const EMPTY_REF: RefV5 = { id: '', name: '', safetyClass: 'A1', toxicityClass: 'A', flammabilityClass: '1', atelOdl: null, lfl: null, practicalLimit: 0, vapourDensity: 0, molecularMass: 0, boilingPoint: null, gwp: null, gasGroup: 'HFC1' };
const EMPTY_GC: GasCat = { id: '', nameFr: '', nameEn: '', code: '', safetyClass: 'A1', coverage: 50, density: 'heavier', specs: '{}' };
const GAS_GROUPS = ['CO2', 'HFC1', 'HFC2', 'NH3', 'R290', 'CO', 'NO2', 'O2'];
const SAFETY_CLASSES = ['A1', 'A2L', 'A2', 'A3', 'B1', 'B2L', 'B2', 'B3'];

/** Color map for gas group badges */
const GAS_GROUP_COLORS: Record<string, string> = {
  CO2: 'bg-blue-100 text-blue-700',
  HFC1: 'bg-green-100 text-green-700',
  HFC2: 'bg-teal-100 text-teal-700',
  NH3: 'bg-red-100 text-red-700',
  HC: 'bg-orange-100 text-orange-700',
  CO: 'bg-gray-200 text-gray-700',
  NO2: 'bg-purple-100 text-purple-700',
  O2: 'bg-cyan-100 text-cyan-700',
  R290: 'bg-orange-100 text-orange-700',
  NH3W: 'bg-red-50 text-red-600',
};

/** Display-only name transform: "HFC Group" -> "HFC & HFO Group" */
function displayNameEn(nameEn: string): string {
  return nameEn.replace(/HFC Group/g, 'HFC & HFO Group');
}

// ── Component ───────────────────────────────────────────────────────────────

export default function GasPage() {
  const [tab, setTab] = useState<Tab>('refrigerants');
  const [refrigerants, setRefrigerants] = useState<RefV5[]>([]);
  const [gasCategories, setGasCategories] = useState<GasCat[]>([]);
  const [refLoading, setRefLoading] = useState(true);
  const [gcLoading, setGcLoading] = useState(true);

  // Dialog state
  const [refDialog, setRefDialog] = useState(false);
  const [refIsNew, setRefIsNew] = useState(false);
  const [refForm, setRefForm] = useState<RefV5>(EMPTY_REF);
  const [gcDialog, setGcDialog] = useState(false);
  const [gcIsNew, setGcIsNew] = useState(false);
  const [gcForm, setGcForm] = useState<GasCat>(EMPTY_GC);
  const [saving, setSaving] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchRefs = useCallback(async () => {
    setRefLoading(true);
    const res = await fetch('/api/refrigerants-v5');
    const data = await res.json();
    setRefrigerants(Array.isArray(data) ? data : []);
    setRefLoading(false);
  }, []);

  const fetchGc = useCallback(async () => {
    setGcLoading(true);
    const res = await fetch('/api/gas-categories');
    const data = await res.json();
    setGasCategories(Array.isArray(data) ? data : []);
    setGcLoading(false);
  }, []);

  useEffect(() => { fetchRefs(); fetchGc(); }, [fetchRefs, fetchGc]);

  // ── Refrigerant CRUD ──────────────────────────────────────────────────────

  function openRefNew() { setRefIsNew(true); setRefForm({ ...EMPTY_REF }); setRefDialog(true); }
  function openRefEdit(r: RefV5) { setRefIsNew(false); setRefForm({ ...r }); setRefDialog(true); }

  async function saveRef() {
    setSaving(true);
    if (refIsNew) {
      await fetch('/api/refrigerants-v5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refForm) });
    } else {
      await fetch('/api/refrigerants-v5', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(refForm) });
    }
    await fetchRefs();
    setRefDialog(false);
    setSaving(false);
  }

  async function deleteRef(id: string) {
    if (!confirm(`Delete refrigerant "${id}"?`)) return;
    await fetch(`/api/refrigerants-v5?id=${id}`, { method: 'DELETE' });
    await fetchRefs();
  }

  // ── Gas Category CRUD ─────────────────────────────────────────────────────

  function openGcNew() { setGcIsNew(true); setGcForm({ ...EMPTY_GC }); setGcDialog(true); }
  function openGcEdit(gc: GasCat) { setGcIsNew(false); setGcForm({ ...gc }); setGcDialog(true); }

  async function saveGc() {
    setSaving(true);
    if (gcIsNew) {
      await fetch('/api/gas-categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gcForm) });
    } else {
      await fetch('/api/gas-categories', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gcForm) });
    }
    await fetchGc();
    setGcDialog(false);
    setSaving(false);
  }

  async function deleteGc(id: string) {
    if (!confirm(`Delete gas category "${id}"?`)) return;
    await fetch(`/api/gas-categories?id=${id}`, { method: 'DELETE' });
    await fetchGc();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2332]">Gaz & Refrigerants</h1>
          <p className="text-sm text-gray-500 mt-1">{refrigerants.length} refrigerants, {gasCategories.length} categories</p>
        </div>
        <button
          onClick={tab === 'refrigerants' ? openRefNew : openGcNew}
          className="bg-[#E63946] hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + {tab === 'refrigerants' ? 'Add Refrigerant' : 'Add Gas Category'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button onClick={() => setTab('refrigerants')}
          className={`px-6 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'refrigerants' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Refrigerants ({refrigerants.length})
        </button>
        <button onClick={() => setTab('gas-categories')}
          className={`px-6 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'gas-categories' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Gas Categories ({gasCategories.length})
        </button>
      </div>

      {/* ── Refrigerants Tab ── */}
      {tab === 'refrigerants' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {refLoading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#16354B] text-left text-[10px] font-semibold text-white uppercase tracking-wider">
                    <th className="px-3 py-2.5">ID</th>
                    <th className="px-3 py-2.5">Name</th>
                    <th className="px-3 py-2.5">Safety</th>
                    <th className="px-3 py-2.5">Tox.</th>
                    <th className="px-3 py-2.5">Flamm.</th>
                    <th className="px-3 py-2.5">Gas Grp</th>
                    <th className="px-3 py-2.5">Mol.Mass</th>
                    <th className="px-3 py-2.5">Vap.D.</th>
                    <th className="px-3 py-2.5">GWP</th>
                    <th className="px-3 py-2.5">ATEL/ODL</th>
                    <th className="px-3 py-2.5">LFL</th>
                    <th className="px-3 py-2.5">P.Limit</th>
                    <th className="px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {refrigerants.map(r => {
                    const badges: Record<string, string> = { A1: 'bg-blue-100 text-blue-700', A2L: 'bg-amber-100 text-amber-700', B2L: 'bg-purple-100 text-purple-700', A3: 'bg-red-100 text-red-700', B1: 'bg-pink-100 text-pink-700' };
                    return (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                        <td className="px-3 py-2 font-mono text-xs font-semibold">{r.id}</td>
                        <td className="px-3 py-2 text-xs font-semibold">{r.name}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badges[r.safetyClass] ?? 'bg-gray-100 text-gray-700'}`}>{r.safetyClass}</span></td>
                        <td className="px-3 py-2 text-xs text-gray-600">{r.toxicityClass}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{r.flammabilityClass}</td>
                        <td className="px-3 py-2 text-xs"><span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${GAS_GROUP_COLORS[r.gasGroup] ?? 'bg-gray-100 text-gray-700'}`}>{r.gasGroup}</span></td>
                        <td className="px-3 py-2 text-xs text-gray-600">{r.molecularMass}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{r.vapourDensity}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{r.gwp ?? '—'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{r.atelOdl ?? '—'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{r.lfl ?? '—'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{r.practicalLimit}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button onClick={() => openRefEdit(r)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                            <button onClick={() => deleteRef(r.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Gas Categories Tab ── */}
      {tab === 'gas-categories' && (
        <>
          {gcLoading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {gasCategories.map(gc => {
                const badges: Record<string, string> = { A1: 'bg-blue-100 text-blue-700', A2L: 'bg-amber-100 text-amber-700', B2L: 'bg-purple-100 text-purple-700', A3: 'bg-red-100 text-red-700', Toxic: 'bg-pink-100 text-pink-700' };
                const matchingRefs = refrigerants.filter(r => r.gasGroup === gc.code);
                const refCount = matchingRefs.length;
                return (
                  <div key={gc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-[#16354B] px-4 py-3 flex items-center justify-between">
                      <div className="text-white font-semibold text-sm">{displayNameEn(gc.nameEn)}</div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badges[gc.safetyClass] ?? 'bg-gray-100 text-gray-700'}`}>{gc.safetyClass}</span>
                    </div>
                    <div className="px-4 py-3 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Code</span><span className={`font-mono font-semibold px-1.5 py-0.5 rounded ${GAS_GROUP_COLORS[gc.code] ?? 'bg-gray-100 text-gray-700'}`}>{gc.code}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Density</span><span className="font-semibold">{gc.density}</span></div>
                      <div className="border-t border-gray-100 pt-2">
                        <span className="text-[10px] font-bold text-[#A7C031] uppercase">Refrigerants ({refCount})</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {matchingRefs.map(r => (
                            <button key={r.id} onClick={() => { setTab('refrigerants'); setTimeout(() => openRefEdit(r), 100); }}
                              className="bg-gray-100 text-gray-600 text-[10px] font-mono px-1.5 py-0.5 rounded hover:bg-[#16354B] hover:text-white transition-colors cursor-pointer">
                              {r.id}
                            </button>
                          ))}
                          {refCount === 0 && <span className="text-[10px] text-gray-400 italic">No refrigerants assigned</span>}
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <button onClick={() => openGcEdit(gc)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">Edit</button>
                        <button onClick={() => deleteGc(gc.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Refrigerant Dialog ── */}
      {refDialog && (
        <Dialog title={refIsNew ? 'New Refrigerant' : `Edit ${refForm.id}`} onClose={() => setRefDialog(false)}>
          <div className="grid grid-cols-3 gap-3">
            <F label="ID" value={refForm.id} onChange={v => setRefForm({ ...refForm, id: v })} disabled={!refIsNew} mono />
            <F label="Name" value={refForm.name} onChange={v => setRefForm({ ...refForm, name: v })} span={2} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Sel label="Safety Class" value={refForm.safetyClass} options={SAFETY_CLASSES} onChange={v => setRefForm({ ...refForm, safetyClass: v })} />
            <Sel label="Toxicity" value={refForm.toxicityClass} options={['A', 'B']} onChange={v => setRefForm({ ...refForm, toxicityClass: v })} />
            <Sel label="Flammability" value={refForm.flammabilityClass} options={['1', '2L', '2', '3']} onChange={v => setRefForm({ ...refForm, flammabilityClass: v })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Sel label="Gas Group" value={refForm.gasGroup} options={GAS_GROUPS} onChange={v => setRefForm({ ...refForm, gasGroup: v })} />
            <N label="Molecular Mass" value={refForm.molecularMass} onChange={v => setRefForm({ ...refForm, molecularMass: v })} />
            <N label="Vapour Density" value={refForm.vapourDensity} onChange={v => setRefForm({ ...refForm, vapourDensity: v })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <N label="Practical Limit" value={refForm.practicalLimit} onChange={v => setRefForm({ ...refForm, practicalLimit: v })} />
            <N label="ATEL/ODL" value={refForm.atelOdl ?? 0} onChange={v => setRefForm({ ...refForm, atelOdl: v || null })} />
            <N label="LFL" value={refForm.lfl ?? 0} onChange={v => setRefForm({ ...refForm, lfl: v || null })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="GWP" value={refForm.gwp ?? ''} onChange={v => setRefForm({ ...refForm, gwp: v || null })} />
            <F label="Boiling Point" value={refForm.boilingPoint ?? ''} onChange={v => setRefForm({ ...refForm, boilingPoint: v || null })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setRefDialog(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button onClick={saveRef} disabled={saving || !refForm.id || !refForm.name}
              className="bg-[#E63946] hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-md text-sm font-semibold">
              {saving ? 'Saving...' : refIsNew ? 'Create' : 'Update'}
            </button>
          </div>
        </Dialog>
      )}

      {/* ── Gas Category Dialog ── */}
      {gcDialog && (
        <Dialog title={gcIsNew ? 'New Gas Category' : `Edit ${gcForm.id}`} onClose={() => setGcDialog(false)}>
          <div className="grid grid-cols-3 gap-3">
            <F label="ID" value={gcForm.id} onChange={v => setGcForm({ ...gcForm, id: v })} disabled={!gcIsNew} mono />
            <F label="Code" value={gcForm.code} onChange={v => setGcForm({ ...gcForm, code: v })} mono />
            <Sel label="Safety Class" value={gcForm.safetyClass} options={[...SAFETY_CLASSES, 'Toxic', 'N/A']} onChange={v => setGcForm({ ...gcForm, safetyClass: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Nom (FR)" value={gcForm.nameFr} onChange={v => setGcForm({ ...gcForm, nameFr: v })} />
            <F label="Name (EN)" value={gcForm.nameEn} onChange={v => setGcForm({ ...gcForm, nameEn: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Sel label="Densite" value={gcForm.density} options={['heavier', 'lighter', 'neutral']} onChange={v => setGcForm({ ...gcForm, density: v })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setGcDialog(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button onClick={saveGc} disabled={saving || !gcForm.id || !gcForm.nameFr}
              className="bg-[#E63946] hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-md text-sm font-semibold">
              {saving ? 'Saving...' : gcIsNew ? 'Create' : 'Update'}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Dialog({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-[#1a2332] text-white px-6 py-4 rounded-t-xl">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function F({ label, value, onChange, disabled, mono, span }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean; mono?: boolean; span?: number }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className={`w-full px-2 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 ${mono ? 'font-mono' : ''}`} />
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
