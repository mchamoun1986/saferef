'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface DiscountRow {
  id: string;
  customerGroup: string;
  productGroup: string;
  discountPct: number;
}

const CUSTOMER_GROUPS = ['EDC', 'OEM', '1Fo', '2Fo', '3Fo', '1Contractor', '2Contractor', '3Contractor', 'AKund', 'BKund', 'NO'];
const PRODUCT_GROUPS = ['A', 'C', 'D', 'F', 'G'];

export default function DiscountMatrixPage() {
  const [rows, setRows] = useState<DiscountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCell, setEditCell] = useState<string | null>(null); // "customerGroup:productGroup"
  const [editValue, setEditValue] = useState('');

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/discount-matrix');
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // Build matrix: { [customerGroup]: { [productGroup]: DiscountRow } }
  const matrix = useMemo(() => {
    const m: Record<string, Record<string, DiscountRow>> = {};
    for (const row of rows) {
      if (!m[row.customerGroup]) m[row.customerGroup] = {};
      m[row.customerGroup][row.productGroup] = row;
    }
    return m;
  }, [rows]);

  async function saveCell(customerGroup: string, productGroup: string, pct: number) {
    const existing = matrix[customerGroup]?.[productGroup];
    if (existing) {
      await fetch('/api/discount-matrix', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existing.id, customerGroup, productGroup, discountPct: pct }),
      });
    } else {
      await fetch('/api/discount-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerGroup, productGroup, discountPct: pct }),
      });
    }
    await fetchRows();
  }

  async function deleteCell(customerGroup: string, productGroup: string) {
    const existing = matrix[customerGroup]?.[productGroup];
    if (!existing) return;
    await fetch(`/api/discount-matrix?id=${existing.id}`, { method: 'DELETE' });
    await fetchRows();
  }

  function startEdit(cg: string, pg: string) {
    const existing = matrix[cg]?.[pg];
    setEditCell(`${cg}:${pg}`);
    setEditValue(existing ? String(existing.discountPct) : '0');
  }

  async function commitEdit(cg: string, pg: string) {
    const pct = parseFloat(editValue) || 0;
    await saveCell(cg, pg, pct);
    setEditCell(null);
  }

  function cancelEdit() {
    setEditCell(null);
  }

  function cellColor(pct: number): string {
    if (pct === 0) return 'bg-gray-50 text-gray-400';
    if (pct < 20) return 'bg-blue-50 text-blue-700';
    if (pct < 40) return 'bg-green-50 text-green-700';
    if (pct < 60) return 'bg-amber-50 text-amber-700';
    return 'bg-red-50 text-red-700';
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a2332]">Discount Matrix</h1>
        <p className="text-sm text-gray-500 mt-1">
          Click any cell to edit the discount % for that Customer Group x Product Group combination.
          Group F is always 0% (no-margin items) and should stay 0.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-2xl font-bold text-[#1a2332]">{rows.length}</div>
          <div className="text-xs text-gray-500 mt-1">TOTAL RULES</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{CUSTOMER_GROUPS.length}</div>
          <div className="text-xs text-gray-500 mt-1">CUSTOMER GROUPS</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{PRODUCT_GROUPS.length}</div>
          <div className="text-xs text-gray-500 mt-1">PRODUCT GROUPS</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-2xl font-bold text-red-600">{CUSTOMER_GROUPS.length * PRODUCT_GROUPS.length}</div>
          <div className="text-xs text-gray-500 mt-1">MAX CELLS</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3 items-center text-xs">
        <span className="text-gray-500 font-semibold">Discount:</span>
        <span className="px-2 py-1 rounded bg-gray-50 text-gray-400">0%</span>
        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">&lt; 20%</span>
        <span className="px-2 py-1 rounded bg-green-50 text-green-700">20-40%</span>
        <span className="px-2 py-1 rounded bg-amber-50 text-amber-700">40-60%</span>
        <span className="px-2 py-1 rounded bg-red-50 text-red-700">&gt; 60%</span>
      </div>

      {/* Matrix */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#16354B] text-white">
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider sticky left-0 bg-[#16354B] z-10">Customer \ Product Group</th>
                  {PRODUCT_GROUPS.map(pg => (
                    <th key={pg} className="px-4 py-3 text-center text-[11px] uppercase tracking-wider w-24">
                      {pg}
                      {pg === 'F' && <div className="text-[9px] font-normal text-white/60 normal-case">(always 0%)</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CUSTOMER_GROUPS.map(cg => (
                  <tr key={cg} className="border-b border-gray-100 hover:bg-blue-50/20">
                    <td className="px-4 py-2 font-semibold text-[#16354B] bg-gray-50 sticky left-0 z-10 border-r border-gray-200">{cg}</td>
                    {PRODUCT_GROUPS.map(pg => {
                      const row = matrix[cg]?.[pg];
                      const pct = row?.discountPct ?? 0;
                      const isEditing = editCell === `${cg}:${pg}`;
                      return (
                        <td key={pg} className="px-2 py-1 text-center">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number" value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(cg, pg); if (e.key === 'Escape') cancelEdit(); }}
                                autoFocus min={0} max={100} step={1}
                                className="w-16 px-2 py-1 border border-[#E63946] rounded text-sm font-bold text-center"
                              />
                              <button onClick={() => commitEdit(cg, pg)} className="text-green-600 hover:text-green-800 text-xs font-bold">OK</button>
                              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 text-xs">X</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 justify-center">
                              <button
                                onClick={() => startEdit(cg, pg)}
                                disabled={pg === 'F'}
                                className={`px-3 py-1.5 rounded text-xs font-bold min-w-[60px] transition-colors ${
                                  pg === 'F' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : cellColor(pct) + ' hover:ring-2 hover:ring-[#E63946]/50'
                                }`}
                              >
                                {pct > 0 ? `${pct}%` : pg === 'F' ? '0%' : '\u2014'}
                              </button>
                              {row && pg !== 'F' && (
                                <button onClick={() => deleteCell(cg, pg)} title="Delete rule"
                                  className="text-red-400 hover:text-red-700 text-xs">X</button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw rules table */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#1a2332] mb-3">All Rules ({rows.length})</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Customer Group</th>
                <th className="px-4 py-2">Product Group</th>
                <th className="px-4 py-2 text-right">Discount %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-1.5 font-mono text-xs text-gray-400">{r.id.substring(0, 8)}...</td>
                  <td className="px-4 py-1.5 font-semibold">{r.customerGroup}</td>
                  <td className="px-4 py-1.5"><span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-mono font-bold">{r.productGroup}</span></td>
                  <td className="px-4 py-1.5 text-right font-bold">{r.discountPct}%</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">No discount rules defined. Click any cell above to create one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
