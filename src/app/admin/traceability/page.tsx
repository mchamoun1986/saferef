'use client';

import { useState, useEffect, useMemo } from 'react';

// ── Types ────────────────────────────────────────────────────────────────

interface QuoteRow {
  id: string;
  ref: string;
  status: string;
  clientName: string;
  clientCompany: string;
  projectName: string;
  projectRef: string;
  totalGross: number;
  totalNet: number;
  currency: string;
  regulation: string | null;
  calcSheetRef: string | null;
  bomJson: string;
  zonesJson: string;
  configJson: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

interface ConfigData {
  regulation?: {
    detectionRequired?: string;
    governingRuleId?: string;
    thresholdPpm?: number;
    recommendedDetectors?: number;
    regulationName?: string;
    governingHazard?: string;
    placementHeight?: string;
    [key: string]: unknown;
  };
  selection?: {
    filterPipeline?: { name: string; in: number; out: number; eliminated: number }[];
    tierPicks?: { tier: string; productCode: string; reason: string }[];
    [key: string]: unknown;
  };
  pricing?: {
    tiers?: Record<string, {
      lines?: { code: string; name: string; qty: number; unitGross: number; unitNet: number; discount: number }[];
      totalGross?: number;
      totalNet?: number;
      warnings?: string[];
    }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ── Helpers ──────────────────────────────────────────────────────────────

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

function safeParse(val: string | null | undefined): ConfigData | null {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

// ── Status Badge (dark theme) ────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-700/50 text-gray-300 border-gray-600',
  sent: 'bg-blue-900/40 text-blue-400 border-blue-700',
  accepted: 'bg-green-900/40 text-green-400 border-green-700',
  rejected: 'bg-red-900/40 text-red-400 border-red-700',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {status}
    </span>
  );
}

// ── Collapsible Section ──────────────────────────────────────────────────

function Section({
  title,
  icon,
  defaultOpen = true,
  accent,
  children,
}: {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  accent?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-[#2a2e3d] bg-[#1a1d28] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#22263a] transition-colors"
      >
        <span className="text-base font-mono">{icon}</span>
        <span className={`font-semibold text-sm flex-1 ${accent ?? 'text-gray-200'}`}>{title}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

// ── JSON viewer ──────────────────────────────────────────────────────────

function JsonViewer({ data }: { data: unknown }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <pre className="bg-[#0f1117] border border-[#2a2e3d] rounded-lg p-4 text-xs text-green-400 overflow-auto max-h-[600px] font-mono leading-relaxed">
      {json}
    </pre>
  );
}

// ── M1 Regulation Trace ──────────────────────────────────────────────────

function M1Trace({ reg }: { reg: NonNullable<ConfigData['regulation']> }) {
  const decisionColor: Record<string, string> = {
    YES: 'text-red-400',
    NO: 'text-green-400',
    RECOMMENDED: 'text-amber-400',
    MANUAL_REVIEW: 'text-amber-400',
  };
  const decision = String(reg.detectionRequired ?? 'N/A');
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Detection Required</div>
          <div className={`text-lg font-bold font-mono ${decisionColor[decision] ?? 'text-gray-400'}`}>
            {decision}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Governing Rule</div>
          <div className="text-lg font-semibold text-white font-mono">
            {reg.governingRuleId ?? 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Threshold</div>
          <div className="text-lg font-bold text-cyan-400 font-mono">
            {reg.thresholdPpm != null ? `${reg.thresholdPpm.toLocaleString()} ppm` : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recommended Detectors</div>
          <div className="text-lg font-bold text-white font-mono">
            {reg.recommendedDetectors ?? 'N/A'}
          </div>
        </div>
      </div>
      {reg.regulationName && (
        <div className="text-xs text-gray-500 mt-1">
          Regulation: <span className="text-gray-300 font-mono">{reg.regulationName}</span>
          {reg.governingHazard && (
            <> | Hazard: <span className="text-gray-300 font-mono">{reg.governingHazard}</span></>
          )}
          {reg.placementHeight && (
            <> | Placement: <span className="text-gray-300 font-mono">{reg.placementHeight}</span></>
          )}
        </div>
      )}
    </div>
  );
}

// ── M2 Selection Trace ───────────────────────────────────────────────────

function M2Trace({ sel }: { sel: NonNullable<ConfigData['selection']> }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Filter pipeline */}
      {sel.filterPipeline && sel.filterPipeline.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Filter Pipeline</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 uppercase tracking-wider border-b border-[#2a2e3d]">
                  <th className="text-left py-2 px-3">Step</th>
                  <th className="text-right py-2 px-3">In</th>
                  <th className="text-right py-2 px-3">Out</th>
                  <th className="text-right py-2 px-3">Eliminated</th>
                </tr>
              </thead>
              <tbody>
                {sel.filterPipeline.map((step, i) => (
                  <tr key={i} className="border-t border-[#2a2e3d]">
                    <td className="py-2 px-3 text-gray-300 font-mono">{step.name}</td>
                    <td className="py-2 px-3 text-right text-gray-400 font-mono">{step.in}</td>
                    <td className="py-2 px-3 text-right text-blue-400 font-mono">{step.out}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {step.eliminated > 0 ? (
                        <span className="text-red-400">-{step.eliminated}</span>
                      ) : (
                        <span className="text-gray-600">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tier picks */}
      {sel.tierPicks && sel.tierPicks.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tier Picks</div>
          <div className="flex flex-col gap-2">
            {sel.tierPicks.map((pick, i) => {
              const tierColor =
                pick.tier === 'premium' ? 'border-red-700 bg-red-900/10 text-red-400' :
                pick.tier === 'standard' ? 'border-blue-700 bg-blue-900/10 text-blue-400' :
                pick.tier === 'centralized' ? 'border-green-700 bg-green-900/10 text-green-400' :
                'border-[#2a2e3d] bg-[#0f1117] text-gray-400';
              return (
                <div key={i} className={`rounded-lg border px-3 py-2 ${tierColor}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/30">
                      {pick.tier}
                    </span>
                    <span className="font-mono text-sm font-semibold text-white">{pick.productCode}</span>
                  </div>
                  <div className="text-xs mt-1 opacity-80">{pick.reason}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback if no structured data */}
      {(!sel.filterPipeline || sel.filterPipeline.length === 0) &&
       (!sel.tierPicks || sel.tierPicks.length === 0) && (
        <div className="text-xs text-gray-500">No structured selection trace available.</div>
      )}
    </div>
  );
}

// ── M3 Pricing Trace ─────────────────────────────────────────────────────

function M3Trace({ pricing }: { pricing: NonNullable<ConfigData['pricing']> }) {
  const tiers = pricing.tiers;
  if (!tiers || Object.keys(tiers).length === 0) {
    return <div className="text-xs text-gray-500">No structured pricing trace available.</div>;
  }

  const tierOrder = ['premium', 'standard', 'centralized'];
  const tierColors: Record<string, { border: string; bg: string; text: string; header: string }> = {
    premium: { border: 'border-red-700', bg: 'bg-red-900/10', text: 'text-red-400', header: 'bg-red-900/30' },
    standard: { border: 'border-blue-700', bg: 'bg-blue-900/10', text: 'text-blue-400', header: 'bg-blue-900/30' },
    centralized: { border: 'border-green-700', bg: 'bg-green-900/10', text: 'text-green-400', header: 'bg-green-900/30' },
  };
  const defaultColor = { border: 'border-[#2a2e3d]', bg: 'bg-[#0f1117]', text: 'text-gray-400', header: 'bg-[#22263a]' };

  const sortedKeys = Object.keys(tiers).sort((a, b) => {
    const ai = tierOrder.indexOf(a);
    const bi = tierOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <div className="flex flex-col gap-4">
      {sortedKeys.map((tierKey) => {
        const tier = tiers[tierKey];
        if (!tier) return null;
        const c = tierColors[tierKey] ?? defaultColor;
        return (
          <div key={tierKey} className={`rounded-lg border ${c.border} ${c.bg} overflow-hidden`}>
            <div className={`px-4 py-2 flex items-center justify-between ${c.header}`}>
              <span className={`text-xs font-bold uppercase tracking-widest ${c.text}`}>{tierKey}</span>
              <div className="flex items-center gap-4 text-xs">
                {tier.totalGross != null && (
                  <span className="text-gray-400">
                    Gross: <span className="text-white font-mono">{tier.totalGross.toFixed(2)}</span>
                  </span>
                )}
                {tier.totalNet != null && (
                  <span className="text-gray-400">
                    Net: <span className={`font-mono font-bold ${c.text}`}>{tier.totalNet.toFixed(2)}</span>
                  </span>
                )}
              </div>
            </div>
            {tier.lines && tier.lines.length > 0 && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 uppercase tracking-wider border-b border-[#2a2e3d]">
                    <th className="text-left py-2 px-3">Code</th>
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-right py-2 px-3">Qty</th>
                    <th className="text-right py-2 px-3">Unit Gross</th>
                    <th className="text-right py-2 px-3">Disc.</th>
                    <th className="text-right py-2 px-3">Unit Net</th>
                  </tr>
                </thead>
                <tbody>
                  {tier.lines.map((line, i) => (
                    <tr key={i} className="border-t border-[#2a2e3d]">
                      <td className="py-1.5 px-3 font-mono text-white">{line.code}</td>
                      <td className="py-1.5 px-3 text-gray-300">{line.name}</td>
                      <td className="py-1.5 px-3 text-right text-gray-400 font-mono">{line.qty}</td>
                      <td className="py-1.5 px-3 text-right text-gray-400 font-mono">{line.unitGross.toFixed(2)}</td>
                      <td className="py-1.5 px-3 text-right font-mono">
                        {line.discount > 0 ? (
                          <span className="text-amber-400">-{line.discount}%</span>
                        ) : (
                          <span className="text-gray-600">0%</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono text-white">{line.unitNet.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tier.warnings && tier.warnings.length > 0 && (
              <div className="px-4 py-2 border-t border-[#2a2e3d]">
                {tier.warnings.map((w, i) => (
                  <div key={i} className="text-xs text-amber-400 flex items-center gap-1.5">
                    <span className="text-amber-500 font-bold">!</span> {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Expanded Quote Row ───────────────────────────────────────────────────

function QuoteTrace({ quote }: { quote: QuoteRow }) {
  const config = useMemo(() => safeParse(quote.configJson), [quote.configJson]);
  const bom = useMemo(() => {
    try { return JSON.parse(quote.bomJson); } catch { return null; }
  }, [quote.bomJson]);

  const hasRegulation = config?.regulation && Object.keys(config.regulation).length > 0;
  const hasSelection = config?.selection && Object.keys(config.selection).length > 0;
  const hasPricing = config?.pricing && Object.keys(config.pricing).length > 0;

  // Build a full data object for the JSON viewer
  const fullData = useMemo(() => ({
    quote: {
      ref: quote.ref,
      status: quote.status,
      client: { name: quote.clientName, company: quote.clientCompany },
      project: { name: quote.projectName, ref: quote.projectRef },
      regulation: quote.regulation,
      calcSheetRef: quote.calcSheetRef,
      totalGross: quote.totalGross,
      totalNet: quote.totalNet,
      currency: quote.currency,
      createdAt: quote.createdAt,
    },
    config,
    bom,
  }), [quote, config, bom]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#0f1117] border-t border-[#2a2e3d]">
      {/* M1 */}
      <Section
        title="M1 -- Regulation Trace"
        icon="M1"
        defaultOpen={true}
        accent="text-red-400"
      >
        {hasRegulation ? (
          <M1Trace reg={config!.regulation!} />
        ) : (
          <div className="text-xs text-gray-500">No M1 regulation data in configJson.</div>
        )}
      </Section>

      {/* M2 */}
      <Section
        title="M2 -- Selection Trace"
        icon="M2"
        defaultOpen={true}
        accent="text-blue-400"
      >
        {hasSelection ? (
          <M2Trace sel={config!.selection!} />
        ) : (
          <div className="text-xs text-gray-500">No M2 selection data in configJson.</div>
        )}
      </Section>

      {/* M3 */}
      <Section
        title="M3 -- Pricing Trace"
        icon="M3"
        defaultOpen={true}
        accent="text-green-400"
      >
        {hasPricing ? (
          <M3Trace pricing={config!.pricing!} />
        ) : (
          <div className="text-xs text-gray-500">No M3 pricing data in configJson.</div>
        )}
      </Section>

      {/* Full JSON */}
      <Section
        title="Full JSON"
        icon="{}"
        defaultOpen={false}
        accent="text-green-400"
      >
        <JsonViewer data={fullData} />
      </Section>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════

export default function TraceabilityPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch all quotes on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/quotes?limit=200')
      .then((r) => r.json())
      .then((data) => {
        if (data.quotes && Array.isArray(data.quotes)) {
          setQuotes(data.quotes);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = quotes;
    if (q) {
      list = list.filter(
        (qt) =>
          qt.ref.toLowerCase().includes(q) ||
          qt.clientName.toLowerCase().includes(q) ||
          qt.clientCompany.toLowerCase().includes(q) ||
          qt.projectName.toLowerCase().includes(q)
      );
    }
    // Already sorted by date desc from API, but ensure it
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [quotes, search]);

  // Derive recommended tier from configJson for table column
  function getRecommendedTier(qt: QuoteRow): string {
    const config = safeParse(qt.configJson);
    if (!config) return '--';
    // Check selection.tierPicks for a "recommended" or first pick
    if (config.selection?.tierPicks && config.selection.tierPicks.length > 0) {
      return config.selection.tierPicks[0].tier ?? '--';
    }
    // Check pricing.tiers keys
    if (config.pricing?.tiers) {
      const keys = Object.keys(config.pricing.tiers);
      if (keys.length > 0) return keys[0];
    }
    return '--';
  }

  const tierBadge = (tier: string) => {
    const t = tier.toLowerCase();
    if (t === 'premium') return 'text-red-400 bg-red-900/30 border-red-700';
    if (t === 'standard') return 'text-blue-400 bg-blue-900/30 border-blue-700';
    if (t === 'centralized') return 'text-green-400 bg-green-900/30 border-green-700';
    return 'text-gray-500 bg-gray-800/30 border-gray-700';
  };

  return (
    <div className="min-h-[calc(100vh-48px)] bg-[#0f1117]">
      {/* Header */}
      <div className="bg-[#1a1d28] border-b border-[#2a2e3d] px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
            AUDIT
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-2">Traceability Panel</h1>
        <p className="text-sm text-gray-500 mt-1">
          Audit trail for M1/M2/M3 calculations
        </p>
      </div>

      {/* Search bar */}
      <div className="px-8 py-4 border-b border-[#2a2e3d] bg-[#1a1d28]">
        <input
          type="text"
          placeholder="Search by ref or client name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-[#0f1117] border border-[#2a2e3d] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
        />
        <div className="text-xs text-gray-600 mt-2">
          {filtered.length} quote{filtered.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl text-gray-800 mb-4 font-mono">&gt;_</div>
            <h2 className="text-xl text-gray-600 font-semibold">No quotes found</h2>
            <p className="text-gray-700 text-sm mt-2">
              {search ? 'Try a different search term.' : 'Create quotes via the Configurator to see audit trails here.'}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-[#2a2e3d] bg-[#1a1d28] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 uppercase tracking-wider text-xs border-b border-[#2a2e3d]">
                  <th className="text-left py-3 px-4">Ref</th>
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Regulation</th>
                  <th className="text-center py-3 px-4">Rec. Tier</th>
                  <th className="text-right py-3 px-4">Total HT</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((qt) => {
                  const isExpanded = expandedId === qt.id;
                  const recTier = getRecommendedTier(qt);
                  return (
                    <tr key={qt.id} className="contents">
                      {/* Use a wrapper that renders both the row and the expanded panel */}
                      <td colSpan={8} className="p-0">
                        {/* Main row */}
                        <div className={`grid grid-cols-[minmax(120px,1fr)_minmax(140px,1.5fr)_100px_90px_100px_100px_100px_90px] border-b border-[#2a2e3d] ${isExpanded ? 'bg-[#22263a]' : 'hover:bg-[#22263a]'} transition-colors`}>
                          <div className="py-3 px-4 font-mono text-white text-sm font-semibold truncate">
                            {qt.ref}
                          </div>
                          <div className="py-3 px-4 truncate">
                            <div className="text-white text-sm">{qt.clientName || '--'}</div>
                            {qt.clientCompany && (
                              <div className="text-gray-500 text-xs truncate">{qt.clientCompany}</div>
                            )}
                          </div>
                          <div className="py-3 px-4 text-gray-400 text-xs font-mono">
                            {fmtDate(qt.createdAt)}
                          </div>
                          <div className="py-3 px-4 text-center">
                            <StatusBadge status={qt.status} />
                          </div>
                          <div className="py-3 px-4 text-gray-300 text-xs font-mono uppercase">
                            {qt.regulation ?? '--'}
                          </div>
                          <div className="py-3 px-4 text-center">
                            {recTier !== '--' ? (
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${tierBadge(recTier)}`}>
                                {recTier}
                              </span>
                            ) : (
                              <span className="text-gray-600 text-xs">--</span>
                            )}
                          </div>
                          <div className="py-3 px-4 text-right text-white font-mono text-sm">
                            {qt.totalNet > 0 ? fmtCurrency(qt.totalNet, qt.currency) : '--'}
                          </div>
                          <div className="py-3 px-4 text-center">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : qt.id)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                isExpanded
                                  ? 'bg-red-600 text-white'
                                  : 'bg-[#0f1117] border border-[#2a2e3d] text-gray-400 hover:border-blue-500 hover:text-blue-400'
                              }`}
                            >
                              {isExpanded ? 'Close' : 'View trace'}
                            </button>
                          </div>
                        </div>
                        {/* Expanded trace */}
                        {isExpanded && <QuoteTrace quote={qt} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
