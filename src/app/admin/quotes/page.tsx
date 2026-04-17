'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────

interface Quote {
  id: string;
  ref: string;
  status: string;
  clientName: string;
  clientCompany?: string;
  projectName?: string;
  totalGross?: number;
  totalNet?: number;
  customerGroup?: string;
  currency?: string;
  createdAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function fmtMoney(amount: number | undefined, currency = 'EUR') {
  if (amount == null) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-700',
  sent:     'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = ['All', 'Draft', 'Sent', 'Accepted', 'Rejected'];

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: '100', offset: '0' });
        if (statusFilter !== 'All') params.set('status', statusFilter.toLowerCase());
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

        const res = await fetch(`/api/quotes?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setQuotes(Array.isArray(data.quotes) ? data.quotes : []);
        setTotal(typeof data.total === 'number' ? data.total : (data.quotes?.length ?? 0));
      } catch (e) {
        setError(String(e));
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [statusFilter, debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1628]">All Quotes</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {total} quote{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          href="/selector"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <span className="text-base leading-none">+</span>
          New Quote
        </Link>
      </div>

      {/* Filter bar */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by ref, client, project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-44 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
        >
          {STATUS_LABELS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Failed to load quotes: {error}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : quotes.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">No quotes found</p>
            {(search || statusFilter !== 'All') && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('All'); }}
                className="mt-3 text-xs text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3">Ref</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3 text-right">Gross</th>
                  <th className="px-6 py-3 text-right">Net</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    {/* Ref */}
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/quotes/${q.id}`}
                        className="font-mono text-xs text-red-600 hover:text-red-800 hover:underline"
                      >
                        {q.ref}
                      </Link>
                    </td>

                    {/* Client */}
                    <td className="px-6 py-3">
                      <span className="text-gray-800 font-medium">{q.clientName || '—'}</span>
                      {q.clientCompany && (
                        <span className="block text-xs text-gray-400 mt-0.5">{q.clientCompany}</span>
                      )}
                    </td>

                    {/* Project */}
                    <td className="px-6 py-3 text-gray-600 max-w-[200px] truncate">
                      {q.projectName || '—'}
                    </td>

                    {/* Gross */}
                    <td className="px-6 py-3 text-right text-gray-700">
                      {fmtMoney(q.totalGross, q.currency) ?? '—'}
                    </td>

                    {/* Net */}
                    <td className="px-6 py-3 text-right">
                      {q.totalNet != null ? (
                        <span className="text-green-700 font-medium">
                          {fmtMoney(q.totalNet, q.currency)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3">
                      <StatusBadge status={q.status} />
                    </td>

                    {/* Date */}
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
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
