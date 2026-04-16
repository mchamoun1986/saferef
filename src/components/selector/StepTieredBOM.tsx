'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SelectionResult, PricingResult, PricedTier, RegulationResult } from '@/lib/engine-types';
import { useLang } from '@/lib/i18n-context';
import { TIERED_BOM, t } from '@/lib/i18n-common';

const TIER_COLORS: Record<string, string> = {
  premium: '#E63946', standard: '#2563eb', centralized: '#16a34a',
};
const TIER_LABELS: Record<string, string> = {
  PREMIUM: 'Premium', STANDARD: 'Standard', CENTRALIZED: 'Centralized',
};

interface Props {
  selectionResult: SelectionResult;
  pricingResult: PricingResult;
  customerGroup: string;
  customerGroups: string[];
  onCustomerGroupChange: (v: string) => void;
  clientData: { firstName: string; lastName: string; company: string; email: string; phone: string; projectName: string; country: string; customerGroup: string };
  gasAppData: { zoneType: string; selectedRefrigerant: string; selectedRange: string; sitePowerVoltage: string; zoneAtex: boolean; mountingType: string };
  regulationResult?: RegulationResult;
}

const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

function fmtEur(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StepTieredBOM({
  selectionResult, pricingResult, customerGroup, customerGroups,
  onCustomerGroupChange, clientData, gasAppData, regulationResult,
}: Props) {
  const router = useRouter();
  const { lang } = useLang();
  const i = t(TIERED_BOM, lang);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    clientName: `${clientData.firstName} ${clientData.lastName}`.trim(),
    clientEmail: clientData.email,
    clientCompany: clientData.company,
    clientPhone: clientData.phone || '',
    projectName: clientData.projectName,
    projectRef: '',
  });
  const [saving, setSaving] = useState(false);

  const tierOrder = ['premium', 'standard', 'centralized'] as const;
  const availableTiers = tierOrder.filter(k => pricingResult.tiers[k] !== null);

  // Grand total = recommended tier's net total
  const recTier = pricingResult.tiers[pricingResult.recommended];
  const grandTotal = recTier?.summary.totalHt ?? 0;

  const handleSaveQuote = useCallback(async () => {
    setSaving(true);
    try {
      const configJson = JSON.stringify({
        ...gasAppData,
        regulation: regulationResult,
        pricing: pricingResult,
        selection: selectionResult,
      });
      // Flatten all BOM lines from recommended tier for legacy compatibility
      const recLines = recTier?.bomLines ?? [];
      const bomJson = JSON.stringify(recLines);
      const zonesJson = JSON.stringify([]);

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quoteForm,
          bomJson,
          zonesJson,
          configJson,
          totalGross: recTier?.summary.totalBeforeDiscount ?? 0,
          totalNet: grandTotal,
          customerGroup,
          currency: 'EUR',
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/sales/quotes/${data.id}`);
      }
    } finally {
      setSaving(false);
    }
  }, [quoteForm, pricingResult, selectionResult, gasAppData, regulationResult, recTier, grandTotal, customerGroup, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#16354B]">{i.title}</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowQuoteForm(true)}
            className="bg-[#A7C031] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#8fa827] transition-colors">
            {i.saveQuote}
          </button>
        </div>
      </div>

      {/* Customer Group */}
      <div>
        <label className={labelClass}>{i.customerGroup}</label>
        <select value={customerGroup} onChange={e => onCustomerGroupChange(e.target.value)}
          className="w-64 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm">
          <option value="">{i.noGroup}</option>
          {customerGroups.filter(Boolean).map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Regulation Banner */}
      {regulationResult && (
        <div className="bg-gradient-to-r from-[#16354B] to-[#2a4a62] text-white rounded-lg p-4 flex flex-wrap justify-around gap-3">
          <StatBlock label="Detection" value={regulationResult.detectionRequired} accent={regulationResult.detectionRequired === 'YES' ? '#f87171' : '#fbbf24'} />
          <StatBlock label="Detectors" value={String(regulationResult.recommendedDetectors)} />
          <StatBlock label="Threshold" value={`${regulationResult.thresholdPpm} ppm`} />
          <StatBlock label="Placement" value={regulationResult.placementHeight} />
          <StatBlock label="Rule" value={regulationResult.governingRuleId} />
        </div>
      )}

      {/* Warnings */}
      {pricingResult.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-400 rounded-lg p-3 text-sm text-amber-800">
          <span className="font-semibold">{i.warnings}:</span>
          <ul className="mt-1 list-disc list-inside text-xs">
            {pricingResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Tier Cards */}
      {availableTiers.length === 0 && (
        <div className="text-center py-8 text-red-500 font-semibold">
          {i.noProducts}
        </div>
      )}

      <div className="grid gap-6">
        {availableTiers.map(key => {
          const tier = pricingResult.tiers[key]!;
          const selTier = selectionResult.tiers[key];
          const isRec = pricingResult.recommended === key;
          const color = TIER_COLORS[key];

          return (
            <div key={key} className={`border-2 rounded-xl overflow-hidden ${isRec ? 'ring-2 ring-offset-2' : ''}`}
              style={{ borderColor: color, ...(isRec ? { ringColor: color } as React.CSSProperties : {}) }}>
              {/* Tier Header */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: color }}>
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-bold text-base">{TIER_LABELS[tier.tier] || tier.label}</h3>
                  {isRec && (
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {i.recommended}
                    </span>
                  )}
                </div>
                <div className="text-white text-right">
                  <div className="text-xs opacity-75">{i.score}</div>
                  <div className="font-bold text-lg">{tier.solutionScore}/21</div>
                </div>
              </div>

              {/* Detector summary */}
              {selTier && (
                <div className="px-5 py-3 bg-gray-50 flex flex-wrap gap-4 text-xs border-b">
                  <span><b>{i.detector}:</b> {selTier.detector.name}</span>
                  <span><b>{i.qty}:</b> {selTier.detector.qty}</span>
                  <span><b>{i.sensor}:</b> {selTier.detector.sensorTech ?? '-'}</span>
                  {selTier.controller && <span><b>{i.controller}:</b> {selTier.controller.qty}x {selTier.controller.name}</span>}
                  {!selTier.controller && <span className="text-green-600 font-semibold">{i.standalone}</span>}
                </div>
              )}

              {/* BOM Table */}
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-[#6b8da5]">{i.code}</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase text-[#6b8da5]">{i.product}</th>
                    <th className="text-center px-4 py-2 text-[10px] uppercase text-[#6b8da5]">{i.qty}</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase text-[#6b8da5]">{i.unitEur}</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase text-[#6b8da5]">{i.discount}</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase text-[#6b8da5]">{i.netTotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {tier.bomLines.map((line, li) => (
                    <tr key={li} className={`border-t ${li % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      <td className="px-4 py-2 font-mono text-xs text-[#16354B] font-bold">{line.code}</td>
                      <td className="px-4 py-2 text-xs">{line.name}</td>
                      <td className="px-4 py-2 text-center text-xs">{line.qty}</td>
                      <td className="px-4 py-2 text-right text-xs">{fmtEur(line.listPrice)}</td>
                      <td className="px-4 py-2 text-right text-xs text-gray-400">
                        {line.discountPct > 0 ? `-${line.discountPct}%` : '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-xs font-semibold">{fmtEur(line.netTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tier Totals */}
              <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {i.beforeDiscount}: {fmtEur(tier.summary.totalBeforeDiscount)} EUR
                  {tier.summary.totalDiscount > 0 && (
                    <span className="ml-2 text-red-500">-{fmtEur(tier.summary.totalDiscount)} EUR</span>
                  )}
                </div>
                <div className="text-lg font-bold" style={{ color }}>
                  {fmtEur(tier.summary.totalHt)} EUR
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      {pricingResult.comparison.rows.length > 0 && (
        <div className="border-2 border-[#e2e8f0] rounded-xl overflow-hidden">
          <div className="bg-[#16354B] text-white px-5 py-3 font-semibold text-sm">{i.comparison}</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2 text-[10px] uppercase text-[#6b8da5]">{i.criteria}</th>
                <th className="text-center px-4 py-2 text-[10px] uppercase" style={{ color: TIER_COLORS.premium }}>Premium</th>
                <th className="text-center px-4 py-2 text-[10px] uppercase" style={{ color: TIER_COLORS.standard }}>Standard</th>
                <th className="text-center px-4 py-2 text-[10px] uppercase" style={{ color: TIER_COLORS.centralized }}>Centralized</th>
              </tr>
            </thead>
            <tbody>
              {pricingResult.comparison.rows.map((row, ri) => (
                <tr key={ri} className={`border-t ${ri % 2 === 0 ? '' : 'bg-gray-50'}`}>
                  <td className="px-4 py-2 font-medium text-xs">{row.label}</td>
                  <td className="px-4 py-2 text-center text-xs">{row.premium}</td>
                  <td className="px-4 py-2 text-center text-xs">{row.standard}</td>
                  <td className="px-4 py-2 text-center text-xs">{row.centralized}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grand Total */}
      <div className="bg-gradient-to-r from-[#E63946] to-[#c41819] text-white rounded-xl p-6 flex justify-between items-center">
        <div>
          <div className="text-sm opacity-75">{i.totalHt} ({TIER_LABELS[recTier?.tier ?? ''] || pricingResult.recommended})</div>
          <div className="text-xs opacity-60 mt-1">{pricingResult.quoteRef} | {i.validUntil} {pricingResult.quoteValidUntil}</div>
        </div>
        <div className="text-3xl font-extrabold">{fmtEur(grandTotal)} EUR</div>
      </div>

      {/* Save Quote Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-[#16354B] mb-4">{i.saveTitle}</h3>
            <div className="space-y-3">
              {([
                { key: 'clientName', label: i.clientName },
                { key: 'clientEmail', label: i.clientEmail },
                { key: 'clientCompany', label: i.clientCompany },
                { key: 'clientPhone', label: i.clientPhone },
                { key: 'projectName', label: i.projectName },
                { key: 'projectRef', label: i.projectRef },
              ] as { key: keyof typeof quoteForm; label: string }[]).map(({ key, label }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input type="text" value={quoteForm[key]}
                    onChange={e => setQuoteForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031]" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowQuoteForm(false)}
                className="px-4 py-2 text-sm font-semibold text-[#16354B] border-2 border-[#e2e8f0] rounded-lg hover:bg-gray-50 transition-colors">
                {i.cancel}
              </button>
              <button onClick={handleSaveQuote} disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#A7C031] rounded-lg hover:bg-[#8fa827] transition-colors disabled:opacity-60">
                {saving ? i.saving : i.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="text-center min-w-[70px]">
      <div className="text-[8px] uppercase tracking-widest text-gray-400">{label}</div>
      <div className="font-bold text-sm mt-0.5" style={accent ? { color: accent } : undefined}>{value}</div>
    </div>
  );
}
