'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ── Types ── */
interface Quote {
  id: string;
  ref: string;
  status: string;
  clientName: string;
  clientCompany: string;
  projectName: string;
  totalGross: number;
  currency: string;
  createdAt: string;
}

/* ── Helpers ── */
function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

function fmtCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/* ── Status badge ── */
const STATUS_BADGE: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-600',
  sent:     'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

/* ── Loading spinner ── */
function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-4 border-[#A7C031] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#0a1628]">{value}</p>
      {sub && <p className="mt-2 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

/* ── Main component ── */
export default function SalesDashboardPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/quotes?limit=200');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setQuotes(Array.isArray(data.quotes) ? data.quotes : []);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ── Derived stats ── */
  const totalQuotes = quotes.length;
  const pending = quotes.filter((q) => q.status === 'draft' || q.status === 'sent').length;
  const won = quotes.filter((q) => q.status === 'accepted').length;
  const pipeline = quotes
    .filter((q) => q.status !== 'rejected')
    .reduce((sum, q) => sum + (q.totalGross ?? 0), 0);

  const recentQuotes = quotes.slice(0, 10);

  /* ── Render ── */
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a1628]">Sales Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Quotes overview and pipeline</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Failed to load data: {error}
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-white shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-20 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-12 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard label="Total Quotes" value={totalQuotes} sub="All time" />
          <KpiCard label="Pending" value={pending} sub="Draft + Sent" />
          <KpiCard label="Won" value={won} sub="Accepted quotes" />
          <KpiCard
            label="Pipeline Value"
            value={
              quotes.length > 0
                ? fmtCurrency(pipeline, quotes[0]?.currency ?? 'EUR')
                : '—'
            }
            sub="Excl. rejected"
          />
        </div>
      )}

      {/* Recent Quotes Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-[#0a1628]">Recent Quotes</h2>
          <Link
            href="/sales/quotes"
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : recentQuotes.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">No quotes yet</p>
            <Link
              href="/selector"
              className="inline-block px-4 py-2 rounded-lg bg-[#A7C031] text-[#0a1628] text-sm font-medium hover:bg-[#8fa828] transition-colors"
            >
              Create your first quote &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50/60">
                  <th className="px-6 py-3">Ref</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentQuotes.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/sales/quotes/${q.id}`}
                        className="font-mono text-xs text-red-600 hover:text-red-800 hover:underline transition-colors"
                      >
                        {q.ref}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-gray-800 font-medium leading-tight">
                        {q.clientName || '—'}
                      </p>
                      {q.clientCompany && (
                        <p className="text-gray-400 text-xs">{q.clientCompany}</p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-600 max-w-[180px] truncate">
                      {q.projectName || '—'}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-800">
                      {fmtCurrency(q.totalGross ?? 0, q.currency)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {fmtDate(q.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
