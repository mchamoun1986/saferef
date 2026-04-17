'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SelectionResult, PricingResult, PricedTier, RegulationResult } from '@/lib/engine-types';
import { useLang } from '@/lib/i18n-context';
import { TIERED_BOM, t } from '@/lib/i18n-common';
import { Download, Printer } from 'lucide-react';

const TIER_COLORS: Record<string, string> = {
  premium: '#E63946', standard: '#2563eb', centralized: '#16a34a',
};
const TIER_LABELS: Record<string, string> = {
  PREMIUM: 'Premium', STANDARD: 'Standard', CENTRALIZED: 'Centralized',
};

interface ProductImageMap {
  [code: string]: string | null;
}

interface ZoneCalcData {
  zoneName: string;
  surface: number;
  height: number;
  charge: number;
  volume: number;
  detectionRequired: string;
  detectors: number;
  thresholdPpm: number;
  placement: string;
  placementM: string;
}

interface Props {
  selectionResult: SelectionResult;
  pricingResult: PricingResult;
  customerGroup: string;
  customerGroups: string[];
  onCustomerGroupChange: (v: string) => void;
  clientData: { firstName: string; lastName: string; company: string; email: string; phone: string; projectName: string; country: string; customerGroup: string };
  gasAppData: { zoneType: string; selectedRefrigerant: string; selectedRange: string; sitePowerVoltage: string; zoneAtex: boolean; mountingType: string };
  regulationResult?: RegulationResult;
  productImages?: ProductImageMap;
  zoneCalcData?: ZoneCalcData[];
}

const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

function fmtEur(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StepTieredBOM({
  selectionResult, pricingResult, customerGroup, customerGroups,
  onCustomerGroupChange, clientData, gasAppData, regulationResult, productImages = {}, zoneCalcData = [],
}: Props) {
  const router = useRouter();
  const { lang } = useLang();
  const i = t(TIERED_BOM, lang);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    clientName: `${clientData.firstName} ${clientData.lastName}`.trim(),
    clientEmail: clientData.email,
    clientCompany: clientData.company,
    clientPhone: clientData.phone || '',
    projectName: clientData.projectName,
    projectRef: '',
    vatNumber: '',
    companyAddress: '',
    deliveryAddress: '',
    companyType: '',
    comments: '',
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

      await fetch('/api/quotes', {
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
      setShowQuoteForm(false);
      setQuoteSubmitted(true);
    } finally {
      setSaving(false);
    }
  }, [quoteForm, pricingResult, selectionResult, gasAppData, regulationResult, recTier, grandTotal, customerGroup, router]);

  const handleDownloadReport = useCallback(async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const margin = 14;
    const navy: [number, number, number] = [22, 53, 75];
    const red: [number, number, number] = [230, 57, 70];
    const green: [number, number, number] = [167, 192, 49];
    let y = 0;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // ── Header ──
    doc.setFillColor(...navy);
    doc.rect(0, 0, pw, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SafeRef — Product Recommendation Report', margin, 11);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(dateStr, pw - margin, 11, { align: 'right' });
    if (regulationResult) {
      doc.text(`${regulationResult.regulationName || regulationResult.regulationId} | ${gasAppData.selectedRefrigerant}`, margin, 18);
    }
    doc.setTextColor(...green);
    doc.setFont('helvetica', 'bold');
    doc.text(pricingResult.quoteRef || '', pw - margin, 18, { align: 'right' });
    y = 30;

    // ── Client Info ──
    doc.setTextColor(...navy);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECT', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Client: ${clientData.firstName} ${clientData.lastName} — ${clientData.company}`, margin, y);
    doc.text(`Project: ${clientData.projectName}    Country: ${clientData.country}`, pw / 2, y);
    y += 8;

    // ── Regulation Summary ──
    if (regulationResult) {
      doc.setFillColor(240, 243, 247);
      doc.rect(margin, y - 3, pw - 2 * margin, 14, 'F');
      doc.setTextColor(...navy);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const regItems = [
        `Detection: ${regulationResult.detectionRequired === 'YES' ? 'Required' : regulationResult.detectionRequired}`,
        `Detectors: ${regulationResult.recommendedDetectors}`,
        `Placement: ${regulationResult.placementHeight}`,
        `Standard: ${regulationResult.regulationName || regulationResult.regulationId}`,
      ];
      doc.text(regItems.join('    |    '), margin + 3, y + 4);
      y += 16;
    }

    // ── Zone Calculations ──
    if (zoneCalcData.length > 0) {
      doc.setTextColor(...navy);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('CALCULATION RESULTS', margin, y);
      y += 5;

      // Table header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y - 2, pw - 2 * margin, 5, 'F');
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(7);
      doc.text('ZONE', margin + 2, y + 1.5);
      doc.text('DIMENSIONS', margin + 40, y + 1.5);
      doc.text('CHARGE', margin + 80, y + 1.5);
      doc.text('DETECTION', margin + 105, y + 1.5);
      doc.text('DETECTORS', margin + 135, y + 1.5);
      doc.text('PLACEMENT', pw - margin - 3, y + 1.5, { align: 'right' });
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8);
      for (const z of zoneCalcData) {
        if (y > 275) { doc.addPage(); y = 15; }
        doc.setFont('helvetica', 'bold');
        doc.text(z.zoneName, margin + 2, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${z.surface}m² × ${z.height}m = ${z.volume.toFixed(1)}m³`, margin + 40, y);
        doc.text(`${z.charge} kg`, margin + 80, y);
        const detLabel = z.detectionRequired === 'YES' ? 'Required' : z.detectionRequired === 'RECOMMENDED' ? 'Recommended' : z.detectionRequired;
        doc.text(detLabel, margin + 105, y);
        doc.text(String(z.detectors), margin + 140, y);
        doc.text(`${z.placement} (${z.placementM})`, pw - margin - 3, y, { align: 'right' });
        y += 5;
      }

      // Total detectors
      const totalDets = zoneCalcData.reduce((s, z) => s + z.detectors, 0);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pw - margin, y);
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...navy);
      doc.text(`Total detectors: ${totalDets}`, margin + 2, y);
      if (regulationResult) {
        doc.text(`Threshold: ${Math.round(regulationResult.thresholdPpm).toLocaleString()} ppm (max — set alarm below)`, pw - margin - 3, y, { align: 'right' });
      }
      y += 10;
    }

    // ── Per-Tier BOM ──
    for (const tierKey of tierOrder) {
      const tier = pricingResult.tiers[tierKey];
      if (!tier) continue;
      const selTier = selectionResult.tiers[tierKey];
      const isRec = pricingResult.recommended === tierKey;
      const color = tierKey === 'premium' ? red : tierKey === 'standard' ? [37, 99, 235] as [number, number, number] : [22, 163, 74] as [number, number, number];

      // Check page space
      if (y > 240) { doc.addPage(); y = 15; }

      // Tier header
      doc.setFillColor(...color);
      doc.rect(margin, y, pw - 2 * margin, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${TIER_LABELS[tier.tier] || tier.label}${isRec ? '  — RECOMMENDED' : ''}`, margin + 3, y + 5.5);
      doc.text(`Score: ${tier.solutionScore}/21`, pw - margin - 3, y + 5.5, { align: 'right' });
      y += 11;

      // Detector info
      if (selTier) {
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const detInfo = `Detector: ${selTier.detector.name}  |  Qty: ${selTier.detector.qty}  |  Sensor: ${selTier.detector.sensorTech ?? '-'}${selTier.detector.range ? `  |  Range: ${selTier.detector.range}` : ''}`;
        doc.text(detInfo, margin + 2, y);
        y += 5;
      }

      // BOM table header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y - 2, pw - 2 * margin, 5, 'F');
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('CODE', margin + 2, y + 1.5);
      doc.text('PRODUCT', margin + 35, y + 1.5);
      doc.text('QTY', pw - margin - 55, y + 1.5);
      doc.text('LIST PRICE', pw - margin - 35, y + 1.5);
      doc.text('SUBTOTAL', pw - margin - 3, y + 1.5, { align: 'right' });
      y += 6;

      // BOM lines
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8);
      for (const line of tier.bomLines) {
        if (y > 275) { doc.addPage(); y = 15; }
        doc.text(line.code, margin + 2, y);
        doc.text(line.name.substring(0, 40), margin + 35, y);
        doc.text(String(line.qty), pw - margin - 53, y);
        doc.text(fmtEur(line.listPrice), pw - margin - 25, y, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(fmtEur(line.listPrice * line.qty), pw - margin - 3, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        y += 4.5;
      }

      // Tier total
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pw - margin, y);
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(`Total: ${fmtEur(tier.summary.totalBeforeDiscount)} EUR`, pw - margin - 3, y, { align: 'right' });
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('List prices — contact your distributor for final pricing', margin + 2, y);
      y += 10;
    }

    // ── Disclaimer ──
    if (y > 255) { doc.addPage(); y = 15; }
    doc.setFillColor(255, 249, 235);
    doc.rect(margin, y, pw - 2 * margin, 16, 'F');
    doc.setTextColor(150, 100, 30);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('PRELIMINARY RECOMMENDATION', margin + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('This product selection is based on regulatory calculations and is provided for informational purposes only.', margin + 3, y + 9);
    doc.text('Final selection, pricing, and availability must be confirmed by your local distributor or SafeRef sales representative.', margin + 3, y + 13);

    // ── Footer ──
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`SafeRef — Gas Detection Systems`, margin, 290);
      doc.text(`Page ${p}/${pageCount}`, pw - margin, 290, { align: 'right' });
    }

    const ref = pricingResult.quoteRef || `SR-${Date.now()}`;
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ref}-report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pricingResult, selectionResult, regulationResult, clientData, gasAppData, tierOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#16354B]">{i.title}</h2>
      </div>

      {/* Preliminary Selection Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <span className="font-semibold">Preliminary recommendation</span> — This product selection is based on regulatory calculations and is provided for informational purposes only.
        Final selection, pricing, and availability must be confirmed by your local distributor or sales representative.
      </div>

      {/* Duct/Pipe accessory notice */}
      {gasAppData.mountingType === 'duct' && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-800">
          <span className="font-semibold">Duct detection selected</span> — Only detectors with remote sensor probes are shown. A duct sampling accessory will be required for installation. Please confirm with your sales representative.
        </div>
      )}
      {gasAppData.mountingType === 'pipe_valve' && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-800">
          <span className="font-semibold">Pipe/valve detection selected</span> — Detectors with remote sensor probes or native pipe-mount products are shown. A pipe mounting accessory may be required. Please confirm with your sales representative.
        </div>
      )}

      {/* Regulation Banner — simplified for client */}
      {regulationResult && (
        <div className="bg-gradient-to-r from-[#16354B] to-[#2a4a62] text-white rounded-lg p-4 flex flex-wrap justify-around gap-3">
          <StatBlock label="Detection" value={regulationResult.detectionRequired === 'YES' ? 'Required' : regulationResult.detectionRequired === 'RECOMMENDED' ? 'Recommended' : regulationResult.detectionRequired} accent={regulationResult.detectionRequired === 'YES' ? '#f87171' : '#fbbf24'} />
          <StatBlock label="Detectors" value={String(regulationResult.recommendedDetectors)} />
          <StatBlock label="Placement" value={regulationResult.placementHeight === 'floor' ? 'Floor level' : regulationResult.placementHeight === 'ceiling' ? 'Ceiling' : 'Breathing zone'} />
          <StatBlock label="Standard" value={regulationResult.regulationName || regulationResult.regulationId.toUpperCase()} />
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

              {/* Detector summary with image */}
              {selTier && (
                <div className="px-5 py-3 bg-gray-50 flex items-center gap-4 border-b">
                  {selTier.detector.image && (
                    <img
                      src={selTier.detector.image.startsWith('/') ? selTier.detector.image : `/assets/${selTier.detector.image}`}
                      alt={selTier.detector.name}
                      className="w-16 h-16 object-contain rounded bg-white border border-gray-200 p-1 flex-shrink-0"
                    />
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span><b>{i.detector}:</b> {selTier.detector.name}</span>
                    <span><b>{i.qty}:</b> {selTier.detector.qty}</span>
                    <span><b>{i.sensor}:</b> {selTier.detector.sensorTech ?? '-'}</span>
                    {selTier.detector.range && <span><b>Range:</b> {selTier.detector.range}</span>}
                    {selTier.controller && <span><b>{i.controller}:</b> {selTier.controller.qty}x {selTier.controller.name}</span>}
                    {!selTier.controller && <span className="text-green-600 font-semibold">{i.standalone}</span>}
                  </div>
                </div>
              )}

              {/* BOM Table — list prices only (indicative) */}
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="w-10 px-2 py-2"></th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase text-[#6b8da5]">{i.code}</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase text-[#6b8da5]">{i.product}</th>
                    <th className="text-center px-3 py-2 text-[10px] uppercase text-[#6b8da5]">{i.qty}</th>
                    <th className="text-right px-3 py-2 text-[10px] uppercase text-[#6b8da5]">List Price (EUR)</th>
                    <th className="text-right px-3 py-2 text-[10px] uppercase text-[#6b8da5]">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {tier.bomLines.map((line, li) => {
                    const img = productImages[line.code];
                    return (
                      <tr key={li} className={`border-t ${li % 2 === 0 ? '' : 'bg-gray-50'}`}>
                        <td className="px-2 py-1.5">
                          {img ? (
                            <img src={img.startsWith('/') ? img : `/assets/${img}`} alt="" className="w-8 h-8 object-contain rounded" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-[8px] text-gray-300">—</div>
                          )}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-xs text-[#16354B] font-bold">{line.code}</td>
                        <td className="px-3 py-1.5 text-xs">{line.name}</td>
                        <td className="px-3 py-1.5 text-center text-xs">{line.qty}</td>
                        <td className="px-3 py-1.5 text-right text-xs">{fmtEur(line.listPrice)}</td>
                        <td className="px-3 py-1.5 text-right text-xs font-semibold">{fmtEur(line.listPrice * line.qty)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Tier Total — list price only */}
              <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
                <div className="text-xs text-gray-400 italic">List prices — contact your distributor for final pricing</div>
                <div className="text-lg font-bold" style={{ color }}>
                  {fmtEur(tier.summary.totalBeforeDiscount)} EUR
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

      {/* Grand Total — list price */}
      <div className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white rounded-xl p-6 flex justify-between items-center">
        <div>
          <div className="text-sm opacity-75">Estimated List Price ({TIER_LABELS[recTier?.tier ?? ''] || pricingResult.recommended})</div>
          <div className="text-xs opacity-50 mt-1">Indicative pricing — final quote from your distributor</div>
        </div>
        <div className="text-3xl font-extrabold">{fmtEur(recTier?.summary.totalBeforeDiscount ?? 0)} EUR</div>
      </div>

      {/* Print / Download Report */}
      <div className="flex items-center gap-3 no-print">
        <button onClick={handleDownloadReport}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#16354B] text-white text-sm font-semibold rounded-lg hover:bg-[#1e4a6a] transition-colors">
          <Download className="w-4 h-4" />
          Download Report (PDF)
        </button>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50 transition-colors">
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Request a Quote */}
      <div className="bg-[#A7C031]/10 border-2 border-[#A7C031] rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold text-[#16354B] mb-2">Interested in this configuration?</h3>
        <p className="text-sm text-gray-600 mb-4">Contact your local distributor or sales representative for a detailed quote with final pricing and availability.</p>
        <button onClick={() => setShowQuoteForm(true)}
          className="bg-[#A7C031] text-white text-sm font-bold px-8 py-3 rounded-lg hover:bg-[#8fa827] transition-colors shadow-lg shadow-[#A7C031]/30">
          Request a Quote &rarr;
        </button>
      </div>

      {/* Quote Submitted Confirmation */}
      {quoteSubmitted && (
        <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">&#10003;</div>
          <h3 className="text-lg font-bold text-green-800 mb-2">Quote Request Sent</h3>
          <p className="text-sm text-green-700 mb-4">
            Your configuration and details have been sent to our sales team.<br />
            We will prepare an official quotation and get back to you shortly.
          </p>
          <p className="text-xs text-gray-500">
            For urgent requests, contact us at <span className="font-semibold">sales@saferef.com</span>
          </p>
        </div>
      )}

      {/* Request Quote Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-bold text-[#16354B] mb-1">Request an Official Quote</h3>
            <p className="text-xs text-gray-500 mb-4">Please provide your company details so we can prepare an official quotation.</p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'clientName', label: 'Contact Name' },
                  { key: 'clientEmail', label: 'Email' },
                ] as { key: keyof typeof quoteForm; label: string }[]).map(({ key, label }) => (
                  <div key={key}>
                    <label className={labelClass}>{label} *</label>
                    <input type="text" value={quoteForm[key]}
                      onChange={e => setQuoteForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031]" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Company Name *</label>
                  <input type="text" value={quoteForm.clientCompany}
                    onChange={e => setQuoteForm(prev => ({ ...prev, clientCompany: e.target.value }))}
                    className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031]" />
                </div>
                <div>
                  <label className={labelClass}>VAT Number *</label>
                  <input type="text" value={quoteForm.vatNumber} placeholder="e.g. FR12345678901"
                    onChange={e => setQuoteForm(prev => ({ ...prev, vatNumber: e.target.value }))}
                    className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031]" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Company Type *</label>
                <select value={quoteForm.companyType}
                  onChange={e => setQuoteForm(prev => ({ ...prev, companyType: e.target.value }))}
                  className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031]">
                  <option value="">Select type...</option>
                  <option value="end_user">End User / Facility Owner</option>
                  <option value="contractor">Installation Contractor</option>
                  <option value="engineering">Engineering / Consulting Firm</option>
                  <option value="distributor">Distributor / Wholesaler</option>
                  <option value="oem">OEM / Manufacturer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Company Address *</label>
                <textarea value={quoteForm.companyAddress} rows={2}
                  onChange={e => setQuoteForm(prev => ({ ...prev, companyAddress: e.target.value }))}
                  className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031] resize-none" />
              </div>

              <div>
                <label className={labelClass}>Delivery Address <span className="text-gray-400 font-normal">(if different)</span></label>
                <textarea value={quoteForm.deliveryAddress} rows={2}
                  onChange={e => setQuoteForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                  className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031] resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="text" value={quoteForm.clientPhone}
                    onChange={e => setQuoteForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                    className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031]" />
                </div>
                <div>
                  <label className={labelClass}>Project Reference</label>
                  <input type="text" value={quoteForm.projectRef}
                    onChange={e => setQuoteForm(prev => ({ ...prev, projectRef: e.target.value }))}
                    className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031]" />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Comments / Questions</label>
              <textarea value={quoteForm.comments} rows={3} placeholder="Any specific requirements, questions, or additional information..."
                onChange={e => setQuoteForm(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031] resize-none" />
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowQuoteForm(false)}
                className="px-4 py-2 text-sm font-semibold text-[#16354B] border-2 border-[#e2e8f0] rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveQuote} disabled={saving || !quoteForm.clientEmail || !quoteForm.clientCompany}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#A7C031] rounded-lg hover:bg-[#8fa827] transition-colors disabled:opacity-60">
                {saving ? 'Sending...' : 'Send Quote Request'}
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
