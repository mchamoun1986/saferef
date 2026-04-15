'use client';

import { use, useEffect, useState, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface BOMLine {
  code: string;
  name: string;
  type: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

interface Quote {
  id: string;
  ref: string;
  status: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientPhone: string;
  projectName: string;
  projectRef: string;
  totalGross: number;
  totalNet: number;
  customerGroup: string;
  currency: string;
  regulation: string | null;
  calcSheetRef: string | null;
  createdAt: string;
  expiresAt: string | null;
  bom: BOMLine[] | null;
}

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  draft:    { label: 'Draft',    bg: 'bg-gray-200',   text: 'text-gray-700' },
  sent:     { label: 'Sent',     bg: 'bg-blue-100',   text: 'text-blue-800' },
  accepted: { label: 'Accepted', bg: 'bg-green-100',  text: 'text-green-800' },
  rejected: { label: 'Rejected', bg: 'bg-red-100',    text: 'text-red-800' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(n);
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQuote = useCallback(async () => {
    try {
      const res = await fetch(`/api/quotes/${id}`);
      if (res.status === 404) { setNotFound(true); setLoading(false); return; }
      const data = await res.json();
      setQuote(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  async function updateStatus(newStatus: string) {
    if (!quote) return;
    setActionLoading(true);
    try {
      await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchQuote();
    } finally {
      setActionLoading(false);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#A7C031] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── 404 ──────────────────────────────────────────────────────────────────

  if (notFound || !quote) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-2xl font-semibold text-gray-700 mb-2">Quote not found</p>
        <p className="text-gray-500 mb-6">The quote you are looking for does not exist or has been deleted.</p>
        <a href="/sales/quotes" className="inline-flex items-center gap-2 text-[#16354B] hover:underline font-medium">
          &larr; Back to quotes
        </a>
      </div>
    );
  }

  const bom: BOMLine[] = Array.isArray(quote.bom) ? quote.bom : [];
  const hasDiscount = quote.totalNet < quote.totalGross && quote.totalNet > 0;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <a href="/sales/quotes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#16354B] transition-colors mb-4">
          &larr; Back to quotes
        </a>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#16354B] tracking-tight">{quote.ref}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>Created {fmtDate(quote.createdAt)}</span>
              {quote.expiresAt && (
                <>
                  <span className="text-gray-300">·</span>
                  <span>Valid until {fmtDate(quote.expiresAt)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <StatusBadge status={quote.status} />
            <a
              href={`/api/quote-pdf/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#16354B] text-white text-sm font-medium rounded hover:bg-[#1e4a6a] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              View PDF
            </a>
          </div>
        </div>
      </div>

      {/* ── Client + Project cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Client</h2>
          <dl className="space-y-2">
            <Row label="Name"    value={quote.clientName    || '—'} />
            <Row label="Company" value={quote.clientCompany || '—'} />
            <Row label="Email"   value={quote.clientEmail   || '—'} />
            <Row label="Phone"   value={quote.clientPhone   || '—'} />
          </dl>
        </div>

        {/* Project */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Project</h2>
          <dl className="space-y-2">
            <Row label="Project name"    value={quote.projectName   || '—'} />
            <Row label="Project ref"     value={quote.projectRef    || '—'} />
            <Row label="Regulation"      value={quote.regulation    || '—'} />
            <Row label="Calc sheet ref"  value={quote.calcSheetRef  || '—'} />
            <Row label="Customer group"  value={quote.customerGroup || '—'} />
          </dl>
        </div>
      </div>

      {/* ── BOM Table ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-[#16354B] px-5 py-3">
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Bill of Materials</h2>
        </div>

        {bom.length === 0 ? (
          <p className="text-gray-500 text-sm px-5 py-8 text-center">No items in this quote.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-semibold">Code</th>
                  <th className="px-5 py-3 text-left font-semibold">Product</th>
                  <th className="px-5 py-3 text-left font-semibold">Type</th>
                  <th className="px-5 py-3 text-right font-semibold">Qty</th>
                  <th className="px-5 py-3 text-right font-semibold">Unit</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bom.map((line, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{line.code}</td>
                    <td className="px-5 py-3 text-gray-900">{line.name}</td>
                    <td className="px-5 py-3 text-gray-500">{capitalize(line.type)}</td>
                    <td className="px-5 py-3 text-right text-gray-900 font-medium">{line.qty}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{fmt(line.unitPrice, quote.currency)}</td>
                    <td className="px-5 py-3 text-right text-gray-900 font-semibold">{fmt(line.lineTotal, quote.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Totals box ───────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <div className="bg-[#16354B] rounded-xl px-8 py-5 text-white min-w-[280px]">
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-8 text-sm">
              <span className="text-gray-300">Gross total</span>
              <span className="font-semibold">{fmt(quote.totalGross, quote.currency)}</span>
            </div>
            {hasDiscount && (
              <div className="flex justify-between items-center gap-8 text-sm pt-2 border-t border-white/20">
                <span className="text-gray-300">
                  Net total
                  {quote.customerGroup && (
                    <span className="ml-1 text-xs text-gray-400">({quote.customerGroup})</span>
                  )}
                </span>
                <span className="font-bold text-base" style={{ color: '#A7C031' }}>
                  {fmt(quote.totalNet, quote.currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Action buttons ───────────────────────────────────────────────── */}
      <ActionBar status={quote.status} onUpdate={updateStatus} loading={actionLoading} />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="w-32 text-gray-400 flex-shrink-0">{label}</dt>
      <dd className="text-gray-900 font-medium">{value}</dd>
    </div>
  );
}

function ActionBar({
  status,
  onUpdate,
  loading,
}: {
  status: string;
  onUpdate: (s: string) => void;
  loading: boolean;
}) {
  if (status === 'accepted') return null;

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {status === 'draft' && (
        <ActionButton
          label="Mark as Sent"
          onClick={() => onUpdate('sent')}
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        />
      )}

      {status === 'sent' && (
        <>
          <ActionButton
            label="Accept"
            onClick={() => onUpdate('accepted')}
            loading={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <ActionButton
            label="Reject"
            onClick={() => onUpdate('rejected')}
            loading={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          />
        </>
      )}

      {status === 'rejected' && (
        <ActionButton
          label="Reopen as Draft"
          onClick={() => onUpdate('draft')}
          loading={loading}
          className="bg-gray-500 hover:bg-gray-600 text-white"
        />
      )}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  loading,
  className,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
      )}
      {label}
    </button>
  );
}
