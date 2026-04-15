'use client';

import { useEffect, useState } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

interface CalcSheetSummary {
  id: string;
  ref: string;
  client: string;
  projectName: string;
  email: string;
  phone: string;
  status: string;
  regulation: string;
  createdAt: string;
  totalDetectors: number;
  totalZones: number;
  refrigerant: string;
  applicationId: string;
}

interface AlarmLevel {
  ppm: number;
  kgM3: number;
  basis: string;
}

interface ZoneRegResult {
  zoneId: string;
  zoneName: string;
  // Core decision
  detectionRequired: string;
  detectionBasis?: string;
  governingRuleId?: string;
  governingHazard: string;
  ruleClasses?: string[];
  // Quantities
  minDetectors?: number;
  recommendedDetectors: number;
  quantityMode: string;
  clusterCount?: number;
  // Thresholds
  thresholdPpm: number;
  thresholdKgM3: number;
  thresholdBasis?: string;
  stage2ThresholdPpm?: number | null;
  alarmThresholds?: {
    alarm1: AlarmLevel;
    alarm2: AlarmLevel;
    cutoff: AlarmLevel;
    stage2Ppm?: number | null;
  };
  // Placement
  placementHeight: string;
  placementHeightM: string;
  // Ventilation & extras
  ventilation?: { flowRateM3s: number; formula: string; clause: string } | null;
  extraRequirements?: { id: string; description: string; clause: string; mandatory: boolean }[];
  // Trace & audit
  sourceClauses?: string[];
  assumptions?: string[];
  requiredActions?: string[];
  reviewFlags: string[];
  candidateZones?: { zoneId: string; description: string; detectorPosition: string; rationale: string }[];
  // Full calculation trace
  trace?: {
    pathEvaluations: { path: string; decision: string; ruleId: string; basis: string; extraDetector: boolean }[];
    volumeCalculated: number;
    concentrationKgM3: number | null;
    chargeComparison?: {
      chargeKg: number;
      volumeM3: number;
      concentrationKgM3: number;
      practicalLimitKgM3: number;
      practicalLimitChargeKg: number;
      c3?: {
        rclKgM3: number; qlmvKgM3: number; qlavKgM3: number;
        rclChargeKg: number; qlmvChargeKg: number; qlavChargeKg: number;
        concVsRcl: string; concVsQlmv: string; concVsQlav: string;
      };
      m1Kg?: number; m2Kg?: number; m3Kg?: number;
    };
    thresholdCalc: { halfAtelPpm: number | null; lfl25PctPpm: number | null; chosen: string; finalPpm: number };
    placementCalc: { vapourDensity: number; airDensity: number; ratio: string; result: string };
    quantityCalc: { areaBased: number; leakSourceBased: number; extraDetector: boolean; min: number; recommended: number; mode: string; clusters: number };
  };
}

interface ZoneDetail {
  id: number;
  name: string;
  surface: number;
  height: number;
  charge: number;
  volumeOverride: number | null;
  spaceTypeId?: string;
  regulatory: {
    accessCategory: string;
    locationClass: string;
    belowGround: boolean;
    isMachineryRoom: boolean;
    isOccupiedSpace: boolean;
    humanComfort: boolean;
    c3Applicable: boolean;
    mechanicalVentilation: boolean;
  };
}

interface SheetDetail {
  id: string;
  ref: string;
  status: string;
  regulation: string;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    phone: string;
    projectName: string;
    country: string;
    clientType: string;
  };
  gasApp: {
    applicationId: string;
    refrigerantId: string;
    refrigerantName: string;
    safetyClass: string;
    gwp: string;
    sitePowerVoltage: string;
    zoneAtex: boolean;
  };
  zones: ZoneDetail[];
  result: {
    zoneRegulations: ZoneRegResult[];
    totalDetectors: number;
    totalZones: number;
  };
}

// ── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { dot: string; badge: string; label: string }> = {
  draft:     { dot: 'bg-gray-400',     badge: 'bg-gray-100 text-gray-600',       label: 'Draft' },
  pending:   { dot: 'bg-amber-400',    badge: 'bg-amber-100 text-amber-700',     label: 'Pending' },
  validated: { dot: 'bg-blue-400',     badge: 'bg-blue-100 text-blue-700',       label: 'Validated' },
  sent:      { dot: 'bg-emerald-400',  badge: 'bg-emerald-100 text-emerald-700', label: 'Sent' },
  archived:  { dot: 'bg-gray-500',     badge: 'bg-gray-200 text-gray-500',       label: 'Archived' },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const REGULATION_LABELS: Record<string, { short: string; full: string }> = {
  en378:    { short: 'EN 378',    full: 'EN 378-3:2016' },
  ashrae15: { short: 'ASHRAE 15', full: 'ASHRAE 15-2022' },
  iso5149:  { short: 'ISO 5149',  full: 'ISO 5149-3:2014' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return d; }
}

function fmtDateTime(d: string) {
  try {
    return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return d; }
}

function detBadge(status: string) {
  switch (status) {
    case 'YES': return 'bg-[#E63946] text-white';
    case 'RECOMMENDED': return 'bg-amber-500 text-white';
    case 'MANUAL_REVIEW': return 'bg-orange-500 text-white';
    default: return 'bg-emerald-500 text-white';
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CalcSheetsPage() {
  const [sheets, setSheets] = useState<CalcSheetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<SheetDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  async function fetchSheets() {
    setLoading(true);
    try {
      const res = await fetch('/api/calc-sheets');
      const data = await res.json();
      setSheets(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function fetchDetail(id: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/calc-sheets?id=${id}`);
      const data = await res.json();
      setSelectedSheet(data);
    } catch { /* ignore */ }
    setDetailLoading(false);
  }

  useEffect(() => { fetchSheets(); }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch('/api/calc-sheets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    await fetchSheets();
    if (selectedSheet?.id === id) {
      setSelectedSheet(prev => prev ? { ...prev, status: newStatus } : null);
    }
  }

  async function handleDelete(id: string, ref: string) {
    if (!confirm(`Delete calc sheet "${ref}"?`)) return;
    const res = await fetch(`/api/calc-sheets?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Delete failed'); return; }
    if (selectedSheet?.id === id) setSelectedSheet(null);
    await fetchSheets();
  }

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = sheets.filter(s => {
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || s.ref?.toLowerCase().includes(q) || s.client?.toLowerCase().includes(q) || s.projectName?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────

  const statsByStatus = ALL_STATUSES.reduce((acc, st) => {
    acc[st] = sheets.filter(s => s.status === st).length;
    return acc;
  }, {} as Record<string, number>);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2332]">Calc Sheets</h1>
          <p className="text-sm text-gray-500 mt-1">{sheets.length} calculation sheets saved</p>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            filterStatus === 'all' ? 'bg-[#1a2332] text-white border-[#1a2332]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
          }`}
        >
          All ({sheets.length})
        </button>
        {ALL_STATUSES.map(st => {
          const cfg = STATUS_CONFIG[st];
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterStatus === st ? `${cfg.badge} border-current` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {cfg.label} ({statsByStatus[st] ?? 0})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by ref, client, project..."
          className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Two-panel layout */}
      <div className={`flex gap-6 ${selectedSheet ? 'flex-col xl:flex-row' : ''}`}>

        {/* Table */}
        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${selectedSheet ? 'xl:w-[55%]' : 'w-full'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              {search || filterStatus !== 'all' ? 'No results match your filters' : 'No calc sheets yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#16354B] text-left text-[10px] font-semibold text-white uppercase tracking-wider">
                    <th className="px-4 py-3">Ref</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Refrigerant</th>
                    <th className="px-4 py-3">Standard</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Detectors</th>
                    <th className="px-4 py-3 text-right">Zones</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(s => {
                    const cfg = STATUS_CONFIG[s.status] ?? { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600', label: s.status };
                    const isActive = selectedSheet?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => { setSelectedSheet(null); fetchDetail(s.id); }}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${isActive ? 'bg-blue-50 border-l-2 border-red-500' : ''}`}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-800">{s.ref || '—'}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate">{s.client || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{s.projectName || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs max-w-[120px] truncate">{s.refrigerant || '—'}</td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-600">{REGULATION_LABELS[s.regulation]?.short || s.regulation || 'EN 378'}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(s.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className="text-xs text-gray-600">{cfg.label}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800">{s.totalDetectors ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{s.totalZones ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => { setSelectedSheet(null); fetchDetail(s.id); }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(s.id, s.ref)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Delete
                            </button>
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

        {/* Detail panel */}
        {(selectedSheet || detailLoading) && (
          <div className="xl:flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-[#1a2332] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {detailLoading ? 'Loading...' : selectedSheet?.ref || 'Sheet Detail'}
              </h2>
              <button onClick={() => setSelectedSheet(null)} className="text-white/50 hover:text-white text-lg leading-none">&times;</button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent" />
              </div>
            ) : selectedSheet ? (
              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-200px)]">

                {/* ── Client Info ── */}
                <div>
                  <p className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-2">Client Information</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Name</p>
                      <p className="font-medium text-gray-800">{selectedSheet.client?.firstName} {selectedSheet.client?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Company</p>
                      <p className="font-medium text-gray-800">{selectedSheet.client?.company || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Email</p>
                      <p className="font-medium text-gray-800">
                        {selectedSheet.client?.email ? (
                          <a href={`mailto:${selectedSheet.client.email}`} className="text-blue-600 hover:underline">{selectedSheet.client.email}</a>
                        ) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                      <p className="font-medium text-gray-800">{selectedSheet.client?.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Project</p>
                      <p className="font-medium text-gray-800">{selectedSheet.client?.projectName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Country</p>
                      <p className="font-medium text-gray-800">{selectedSheet.client?.country || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Profile</p>
                      <p className="font-medium text-gray-800">{selectedSheet.client?.clientType || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Created</p>
                      <p className="text-gray-600 text-xs">{fmtDateTime(selectedSheet.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* ── Gas & Application ── */}
                <div>
                  <p className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-2">Gas & Application</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Refrigerant</p>
                      <p className="font-mono font-medium text-gray-800">
                        {selectedSheet.gasApp?.refrigerantId} — {selectedSheet.gasApp?.refrigerantName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Safety Class</p>
                      <p className="font-bold text-gray-800 bg-[#f0f4f8] inline-block px-2 py-0.5 rounded">
                        {selectedSheet.gasApp?.safetyClass || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Application</p>
                      <p className="font-medium text-gray-800">{selectedSheet.gasApp?.applicationId || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">GWP</p>
                      <p className="font-medium text-gray-800">{selectedSheet.gasApp?.gwp || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Power</p>
                      <p className="font-medium text-gray-800">{selectedSheet.gasApp?.sitePowerVoltage || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">ATEX Zone</p>
                      <p className="font-medium text-gray-800">{selectedSheet.gasApp?.zoneAtex ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Regulation</p>
                      <p className="font-medium text-gray-800">{REGULATION_LABELS[selectedSheet.regulation]?.full || selectedSheet.regulation || 'EN 378-3:2016'}</p>
                    </div>
                  </div>
                </div>

                {/* ── Summary Stats ── */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0a1628] text-white rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">{selectedSheet.result?.totalDetectors ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-1">Detectors</p>
                  </div>
                  <div className="bg-[#0a1628] text-white rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">{selectedSheet.result?.totalZones ?? selectedSheet.zones?.length ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-1">Zones</p>
                  </div>
                  <div className="bg-[#0a1628] text-white rounded-lg p-4 text-center">
                    {(() => {
                      const cfg = STATUS_CONFIG[selectedSheet.status] ?? { badge: 'bg-gray-100 text-gray-600', label: selectedSheet.status };
                      return (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      );
                    })()}
                    <p className="text-xs text-gray-400 mt-1">Status</p>
                  </div>
                </div>

                {/* ── Status change ── */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Change Status</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map(st => {
                      const cfg = STATUS_CONFIG[st];
                      const isActive = selectedSheet.status === st;
                      return (
                        <button
                          key={st}
                          disabled={isActive}
                          onClick={() => handleStatusChange(selectedSheet.id, st)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-default ${
                            isActive ? `${cfg.badge} border-current` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Zone Results (EN 378 calculation) ── */}
                {selectedSheet.result?.zoneRegulations && selectedSheet.result.zoneRegulations.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#E63946] uppercase tracking-widest mb-2">
                      {REGULATION_LABELS[selectedSheet.regulation]?.full || 'EN 378-3:2016'} Calculation — {selectedSheet.result.zoneRegulations.length} zone{selectedSheet.result.zoneRegulations.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-3">
                      {selectedSheet.result.zoneRegulations.map((zr, idx) => {
                        const zone = selectedSheet.zones?.[idx];
                        const volume = zone ? (zone.volumeOverride ?? zone.surface * zone.height) : 0;
                        return (
                          <div key={zr.zoneId} className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                            {/* Zone header */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-[#16354B]/5 border-b border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-[#A7C031] rounded-full" />
                                <span className="text-sm font-bold text-[#16354B]">{zr.zoneName}</span>
                                {zone?.spaceTypeId && (
                                  <span className="font-mono text-[10px] bg-gray-200 px-1.5 py-0.5 rounded">{zone.spaceTypeId}</span>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${detBadge(zr.detectionRequired)}`}>
                                {zr.detectionRequired}
                              </span>
                            </div>

                            <div className="px-4 py-3 space-y-2">
                              {/* Dimensions */}
                              {zone && (
                                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600">
                                  <span><span className="text-gray-400">Area:</span> {zone.surface} m²</span>
                                  <span><span className="text-gray-400">Height:</span> {zone.height} m</span>
                                  <span><span className="text-gray-400">Volume:</span> {volume.toFixed(1)} m³</span>
                                  <span><span className="text-gray-400">Charge:</span> {zone.charge} kg</span>
                                </div>
                              )}

                              {/* Regulatory context */}
                              {zone?.regulatory && (
                                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                                  <span>Cat. {zone.regulatory.accessCategory}</span>
                                  <span>Class {zone.regulatory.locationClass}</span>
                                  {zone.regulatory.isMachineryRoom && <span className="text-amber-600">Machinery Room</span>}
                                  {zone.regulatory.isOccupiedSpace && <span>Occupied</span>}
                                  {zone.regulatory.belowGround && <span className="text-amber-600">Below Ground</span>}
                                  {zone.regulatory.mechanicalVentilation && <span>Mech. Vent.</span>}
                                </div>
                              )}

                              {/* Results */}
                              <div className="border-t border-dashed border-gray-200 pt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                                <span>
                                  <span className="text-gray-400">Detectors:</span>{' '}
                                  <span className="font-bold text-[#16354B]">{zr.recommendedDetectors}</span>
                                </span>
                                <span>
                                  <span className="text-gray-400">Threshold:</span>{' '}
                                  <span className="font-semibold">{Math.round(zr.thresholdPpm).toLocaleString()} ppm</span>
                                </span>
                                <span>
                                  <span className="text-gray-400">Placement:</span>{' '}
                                  <span className="font-semibold">{zr.placementHeight} ({zr.placementHeightM})</span>
                                </span>
                                <span>
                                  <span className="text-gray-400">Hazard:</span>{' '}
                                  <span className="font-semibold">{zr.governingHazard}</span>
                                </span>
                                <span>
                                  <span className="text-gray-400">Mode:</span>{' '}
                                  <span className="font-semibold">{zr.quantityMode}</span>
                                </span>
                              </div>

                              {/* Review flags */}
                              {zr.reviewFlags && zr.reviewFlags.length > 0 && (
                                <div className="flex items-start gap-1.5 text-[10px] text-amber-600 bg-amber-50 rounded px-2 py-1.5">
                                  <span>⚠️</span>
                                  <span>{zr.reviewFlags.join(' — ')}</span>
                                </div>
                              )}

                              {/* ── CALCULATION TRACE ── */}
                              {(zr.detectionBasis || zr.sourceClauses?.length || zr.trace) && (
                                <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                                  <p className="text-[10px] font-bold text-[#16354B] uppercase tracking-widest">Calculation Trace</p>

                                  {/* Path Evaluations — the core decision chain */}
                                  {zr.trace?.pathEvaluations && zr.trace.pathEvaluations.length > 0 && (
                                    <div className="text-[11px]">
                                      <span className="text-gray-400 font-semibold">Decision paths: </span>
                                      <div className="mt-1 space-y-1">
                                        {zr.trace.pathEvaluations.map((pe, i) => {
                                          const decColor = pe.decision === 'YES' ? 'bg-red-100 text-red-700'
                                            : pe.decision === 'SKIP' ? 'bg-gray-100 text-gray-400'
                                            : pe.decision === 'NO' ? 'bg-green-100 text-green-700'
                                            : pe.decision === 'RECOMMENDED' ? 'bg-blue-100 text-blue-700'
                                            : 'bg-orange-100 text-orange-700';
                                          return (
                                            <div key={i} className={`flex items-start gap-2 rounded px-2 py-1 ${pe.decision === 'SKIP' ? 'opacity-50' : ''}`}>
                                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${decColor}`}>{pe.decision}</span>
                                              <span className="font-mono text-[10px] text-gray-500 flex-shrink-0 w-[140px]">{pe.path}</span>
                                              <span className="text-gray-600">{pe.basis || '—'}</span>
                                              {pe.extraDetector && <span className="text-[10px] bg-amber-200 px-1 rounded flex-shrink-0">+1 det</span>}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Charge Comparisons — the key decision values */}
                                  {zr.trace?.chargeComparison && (() => {
                                    const cc = zr.trace!.chargeComparison!;
                                    const badge = (cond: string) => cond === 'below'
                                      ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                                    return (
                                      <div className="text-[11px] bg-[#f8fafc] border border-gray-200 rounded-lg p-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Charge vs Limits</p>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                                          <p>Charge: <span className="font-bold text-[#16354B]">{cc.chargeKg} kg</span></p>
                                          <p>Volume: <span className="font-bold">{cc.volumeM3.toFixed(1)} m³</span></p>
                                          <p>Concentration: <span className="font-bold">{cc.concentrationKgM3.toPrecision(4)} kg/m³</span></p>
                                          <p>Practical Limit (RCL): <span className="font-bold">{cc.practicalLimitKgM3} kg/m³</span> = <span className="font-bold">{cc.practicalLimitChargeKg.toFixed(1)} kg</span></p>
                                        </div>
                                        {cc.c3 && (
                                          <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">EN 378 Table C.3 Comparisons</p>
                                            <table className="w-full text-[10px]">
                                              <thead>
                                                <tr className="text-gray-400">
                                                  <th className="text-left font-semibold pb-1">Limit</th>
                                                  <th className="text-right font-semibold pb-1">kg/m³</th>
                                                  <th className="text-right font-semibold pb-1">Max charge (kg)</th>
                                                  <th className="text-center font-semibold pb-1">Conc. vs Limit</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                <tr>
                                                  <td className="font-semibold">RCL</td>
                                                  <td className="text-right font-mono">{cc.c3.rclKgM3}</td>
                                                  <td className="text-right font-mono">{cc.c3.rclChargeKg.toFixed(1)}</td>
                                                  <td className="text-center"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${badge(cc.c3.concVsRcl)}`}>{cc.c3.concVsRcl === 'below' ? '≤ OK' : '> EXCEEDED'}</span></td>
                                                </tr>
                                                <tr>
                                                  <td className="font-semibold">QLMV</td>
                                                  <td className="text-right font-mono">{cc.c3.qlmvKgM3}</td>
                                                  <td className="text-right font-mono">{cc.c3.qlmvChargeKg.toFixed(1)}</td>
                                                  <td className="text-center"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${badge(cc.c3.concVsQlmv)}`}>{cc.c3.concVsQlmv === 'below' ? '≤ OK' : '> EXCEEDED'}</span></td>
                                                </tr>
                                                <tr>
                                                  <td className="font-semibold">QLAV</td>
                                                  <td className="text-right font-mono">{cc.c3.qlavKgM3}</td>
                                                  <td className="text-right font-mono">{cc.c3.qlavChargeKg.toFixed(1)}</td>
                                                  <td className="text-center"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${badge(cc.c3.concVsQlav)}`}>{cc.c3.concVsQlav === 'below' ? '≤ OK' : '> EXCEEDED'}</span></td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                        {(cc.m1Kg != null || cc.m2Kg != null) && (
                                          <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Flammable Charge Caps (LFL-based)</p>
                                            <div className="flex gap-4">
                                              {cc.m1Kg != null && <p>m1 = <span className={`font-bold ${cc.chargeKg > cc.m1Kg ? 'text-red-600' : 'text-green-600'}`}>{cc.m1Kg.toFixed(1)} kg</span> {cc.chargeKg > cc.m1Kg ? '(exceeded)' : '(OK)'}</p>}
                                              {cc.m2Kg != null && <p>m2 = <span className={`font-bold ${cc.chargeKg > cc.m2Kg ? 'text-red-600' : 'text-green-600'}`}>{cc.m2Kg.toFixed(1)} kg</span> {cc.chargeKg > cc.m2Kg ? '(exceeded)' : '(OK)'}</p>}
                                              {cc.m3Kg != null && <p>m3 = <span className={`font-bold ${cc.chargeKg > cc.m3Kg ? 'text-red-600' : 'text-green-600'}`}>{cc.m3Kg.toFixed(1)} kg</span> {cc.chargeKg > cc.m3Kg ? '(exceeded)' : '(OK)'}</p>}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* Intermediate calculations */}
                                  {zr.trace && (
                                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                                      <div className="bg-gray-50 rounded p-2">
                                        <p className="text-gray-400 font-semibold mb-1">Threshold Calc</p>
                                        {zr.trace.thresholdCalc.halfAtelPpm != null && <p>50% ATEL = <span className="font-bold">{Math.round(zr.trace.thresholdCalc.halfAtelPpm).toLocaleString()} ppm</span></p>}
                                        {zr.trace.thresholdCalc.lfl25PctPpm != null && <p>25% LFL = <span className="font-bold">{Math.round(zr.trace.thresholdCalc.lfl25PctPpm).toLocaleString()} ppm</span></p>}
                                        <p>Chosen: <span className="font-bold text-[#16354B]">{zr.trace.thresholdCalc.chosen} = {zr.trace.thresholdCalc.finalPpm.toLocaleString()} ppm</span></p>
                                      </div>
                                      <div className="bg-gray-50 rounded p-2">
                                        <p className="text-gray-400 font-semibold mb-1">Placement</p>
                                        <p>VD = {zr.trace.placementCalc.vapourDensity} ({zr.trace.placementCalc.ratio}) → <span className="font-bold">{zr.trace.placementCalc.result}</span></p>
                                      </div>
                                      <div className="bg-gray-50 rounded p-2">
                                        <p className="text-gray-400 font-semibold mb-1">Quantity</p>
                                        <p>Area: {zr.trace.quantityCalc.areaBased} det | Clusters: {zr.trace.quantityCalc.clusters}</p>
                                        <p>Mode: <span className="font-bold">{zr.trace.quantityCalc.mode}</span> → min {zr.trace.quantityCalc.min}, rec {zr.trace.quantityCalc.recommended}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Detection basis & governing rule */}
                                  {zr.detectionBasis && (
                                    <div className="text-[11px] bg-blue-50 border border-blue-100 rounded px-2.5 py-1.5">
                                      <span className="text-blue-400 font-semibold">Final basis: </span>
                                      <span className="text-blue-700">{zr.detectionBasis}</span>
                                      {zr.governingRuleId && (
                                        <span className="ml-2 font-mono text-[10px] bg-blue-200 px-1.5 py-0.5 rounded">{zr.governingRuleId}</span>
                                      )}
                                    </div>
                                  )}

                                  {/* Source clauses */}
                                  {zr.sourceClauses && zr.sourceClauses.length > 0 && (
                                    <div className="text-[11px]">
                                      <span className="text-gray-400 font-semibold">Clauses: </span>
                                      {zr.sourceClauses.map((cl, i) => (
                                        <span key={i} className="inline-block bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] mr-1 mb-0.5 font-mono">{cl}</span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Alarm thresholds */}
                                  {zr.alarmThresholds && (
                                    <div className="text-[11px]">
                                      <span className="text-gray-400 font-semibold">Alarm thresholds: </span>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px]">
                                          Alarm 1: {Math.round(zr.alarmThresholds.alarm1.ppm).toLocaleString()} ppm ({zr.alarmThresholds.alarm1.basis})
                                        </span>
                                        <span className="bg-orange-50 border border-orange-200 px-2 py-0.5 rounded text-[10px]">
                                          Alarm 2: {Math.round(zr.alarmThresholds.alarm2.ppm).toLocaleString()} ppm ({zr.alarmThresholds.alarm2.basis})
                                        </span>
                                        <span className="bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px]">
                                          Cutoff: {Math.round(zr.alarmThresholds.cutoff.ppm).toLocaleString()} ppm ({zr.alarmThresholds.cutoff.basis})
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Ventilation */}
                                  {zr.ventilation && (
                                    <div className="text-[11px] bg-cyan-50 border border-cyan-100 rounded px-2.5 py-1.5">
                                      <span className="text-cyan-500 font-semibold">Emergency ventilation: </span>
                                      <span className="text-cyan-700 font-bold">{zr.ventilation.flowRateM3s.toFixed(3)} m³/s</span>
                                      <span className="text-cyan-600 ml-2">({zr.ventilation.formula})</span>
                                      <span className="ml-2 font-mono text-[10px] bg-cyan-200 px-1.5 py-0.5 rounded">{zr.ventilation.clause}</span>
                                    </div>
                                  )}

                                  {/* Extra requirements */}
                                  {zr.extraRequirements && zr.extraRequirements.length > 0 && (
                                    <div className="text-[11px]">
                                      <span className="text-gray-400 font-semibold">Extra requirements: </span>
                                      {zr.extraRequirements.map((req, i) => (
                                        <div key={i} className="flex items-start gap-1.5 mt-1">
                                          <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${req.mandatory ? 'bg-red-500' : 'bg-gray-400'}`} />
                                          <span className="text-gray-700">{req.description}</span>
                                          <span className="font-mono text-[10px] bg-gray-100 px-1 py-0.5 rounded">{req.clause}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Required actions */}
                                  {zr.requiredActions && zr.requiredActions.length > 0 && (
                                    <div className="text-[11px]">
                                      <span className="text-gray-400 font-semibold">Required actions: </span>
                                      <span className="text-gray-600">{zr.requiredActions.join(' | ')}</span>
                                    </div>
                                  )}

                                  {/* Assumptions */}
                                  {zr.assumptions && zr.assumptions.length > 0 && (
                                    <div className="text-[11px] text-gray-500 italic">
                                      <span className="text-gray-400 font-semibold not-italic">Assumptions: </span>
                                      {zr.assumptions.join(' | ')}
                                    </div>
                                  )}

                                  {/* Candidate zones */}
                                  {zr.candidateZones && zr.candidateZones.length > 0 && (
                                    <div className="text-[11px]">
                                      <span className="text-gray-400 font-semibold">Candidate zones: </span>
                                      <div className="mt-1 space-y-0.5">
                                        {zr.candidateZones.map((cz, i) => (
                                          <div key={i} className="text-[10px] text-gray-600">
                                            <span className="font-mono bg-gray-100 px-1 rounded">{cz.zoneId}</span> {cz.description} — <span className="text-gray-400">{cz.rationale}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Rule classes */}
                                  {zr.ruleClasses && zr.ruleClasses.length > 0 && (
                                    <div className="text-[11px]">
                                      <span className="text-gray-400 font-semibold">Rule class: </span>
                                      {zr.ruleClasses.map((rc, i) => (
                                        <span key={i} className={`inline-block px-1.5 py-0.5 rounded text-[10px] mr-1 font-semibold ${
                                          rc === 'NORMATIVE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>{rc}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
