'use client';

import { useEffect, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';

interface FGasStats {
  total: number;
  topRefrigerants: { id: string; count: number }[];
  byBand: Record<string, number>;
  mandatoryPercent: number;
  recent: {
    id: string;
    refrigerantId: string;
    chargeKg: number;
    co2eq: number;
    band: string;
    mandatory: boolean;
    isHfo: boolean;
    isHermetic: boolean;
    createdAt: string;
  }[];
}

const BAND_BADGE: Record<string, string> = {
  none: 'bg-green-100 text-green-700',
  standard: 'bg-yellow-100 text-yellow-700',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
};

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return d; }
}

export default function AdminFGasPage() {
  const [stats, setStats] = useState<FGasStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch('/api/fgas-log')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchStats, []);

  if (loading) return <div className="p-6 text-gray-500">Loading F-Gas stats...</div>;
  if (!stats) return <div className="p-6 text-red-500">Failed to load stats.</div>;

  const maxRefCount = stats.topRefrigerants[0]?.count ?? 1;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#16354B] flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          F-Gas Checker Stats
        </h1>
        <button onClick={fetchStats} className="text-gray-500 hover:text-gray-800 p-2 rounded hover:bg-gray-100">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-[#16354B]">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">Total Calculations</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{stats.mandatoryPercent}%</div>
          <div className="text-xs text-gray-500 mt-1">Mandatory Detection</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.byBand['high'] ?? 0}</div>
          <div className="text-xs text-gray-500 mt-1">High Band</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.byBand['none'] ?? 0}</div>
          <div className="text-xs text-gray-500 mt-1">No Obligation</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-bold text-[#16354B] mb-4">Top 10 Refrigerants Queried</h3>
          {stats.topRefrigerants.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.topRefrigerants.map(r => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-mono font-medium text-gray-700">{r.id}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div className="bg-[#2196F3] h-full rounded-full" style={{ width: `${(r.count / maxRefCount) * 100}%` }} />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-bold text-[#16354B] mb-4">Distribution by Band</h3>
          <div className="space-y-3">
            {['none', 'standard', 'medium', 'high'].map(band => {
              const count = stats.byBand[band] ?? 0;
              const pct = stats.total > 0 ? Math.round(count / stats.total * 100) : 0;
              return (
                <div key={band} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium w-20 text-center ${BAND_BADGE[band]}`}>{band}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className={`h-full rounded-full ${band === 'none' ? 'bg-green-400' : band === 'standard' ? 'bg-yellow-400' : band === 'medium' ? 'bg-orange-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b">
          <h3 className="font-bold text-[#16354B]">Recent Calculations (last 50)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs">
                <th className="px-4 py-2 text-left">Refrigerant</th>
                <th className="px-4 py-2 text-right">Charge (kg)</th>
                <th className="px-4 py-2 text-right">CO2eq (t)</th>
                <th className="px-4 py-2 text-center">Band</th>
                <th className="px-4 py-2 text-center">Mandatory</th>
                <th className="px-4 py-2 text-center">Flags</th>
                <th className="px-4 py-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map(log => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono font-medium">{log.refrigerantId}</td>
                  <td className="px-4 py-2 text-right">{log.chargeKg}</td>
                  <td className="px-4 py-2 text-right">{log.co2eq.toFixed(1)}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded ${BAND_BADGE[log.band] ?? 'bg-gray-100'}`}>{log.band}</span>
                  </td>
                  <td className="px-4 py-2 text-center">{log.mandatory ? '\u26A0\uFE0F' : '\u2014'}</td>
                  <td className="px-4 py-2 text-center text-xs text-gray-400">
                    {log.isHfo ? 'HFO ' : ''}{log.isHermetic ? 'Sealed' : ''}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-400 text-xs">{fmtDate(log.createdAt)}</td>
                </tr>
              ))}
              {stats.recent.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No calculations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
