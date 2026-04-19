'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Solution, BomComponent } from '@/lib/m2-engine/designer-types';
import { useLang } from '@/lib/i18n-context';
import { TIERED_BOM, t } from '@/lib/i18n-common';
import { Download, Printer, ChevronDown, ChevronRight } from 'lucide-react';

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
  solutions: Solution[];
  clientData: { firstName: string; lastName: string; company: string; email: string; phone: string; projectName: string; country: string; customerGroup: string };
  gasAppData: { zoneType: string; selectedRefrigerant: string; selectedRange: string; sitePowerVoltage: string; zoneAtex: boolean; mountingType: string };
  zoneCalcData?: ZoneCalcData[];
}

const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

function fmtEur(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function tierColor(sol: Solution): string {
  if (sol.mode === 'standalone' && sol.tier === 'premium') return '#E63946';
  if (sol.mode === 'centralized' && sol.tier === 'premium') return '#c2185b';
  if (sol.mode === 'standalone') return '#2563eb';
  return '#16a34a';
}

function tierLabel(sol: Solution): string {
  const tierStr = sol.tier.charAt(0).toUpperCase() + sol.tier.slice(1);
  const modeStr = sol.mode === 'standalone' ? 'Standalone' : 'Centralized';
  return `${tierStr} — ${modeStr}`;
}

export default function StepTieredBOM({
  solutions, clientData, gasAppData, zoneCalcData = [],
}: Props) {
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
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [filterMeas, setFilterMeas] = useState('');
  const [filterRange, setFilterRange] = useState('');

  // Parse measurement type from range string (e.g. "0-10000 ppm" → "ppm")
  function parseMeasType(range: string | null): string {
    if (!range) return '';
    const r = range.toLowerCase();
    if (r.includes('lel') || r.includes('lfl')) return 'lel';
    if (r.includes('vol') || r.includes('% vol')) return 'vol';
    if (r.includes('ppm')) return 'ppm';
    return '';
  }

  // Available measurement types from solutions
  const availMeasTypes = useMemo(() => {
    const s = new Set<string>();
    solutions.forEach(sol => { const m = parseMeasType(sol.detector.range); if (m) s.add(m); });
    return Array.from(s).sort();
  }, [solutions]);

  // Available ranges from solutions (after meas filter)
  const availRanges = useMemo(() => {
    const s = new Set<string>();
    solutions.forEach(sol => {
      if (filterMeas && parseMeasType(sol.detector.range) !== filterMeas) return;
      if (sol.detector.range) s.add(sol.detector.range);
    });
    return Array.from(s).sort();
  }, [solutions, filterMeas]);

  // Filtered solutions
  const filteredSolutions = useMemo(() => {
    return solutions.filter(sol => {
      if (filterMeas && parseMeasType(sol.detector.range) !== filterMeas) return false;
      if (filterRange && sol.detector.range !== filterRange) return false;
      return true;
    });
  }, [solutions, filterMeas, filterRange]);

  // Mandatory components only for total
  const getMandatoryTotal = (sol: Solution) =>
    sol.components.filter(c => !c.optional).reduce((s, c) => s + c.subtotal, 0);

  const handleSaveQuote = useCallback(async () => {
    setSaving(true);
    try {
      const firstSol = solutions[0];
      const bomJson = JSON.stringify(firstSol?.components ?? []);
      const configJson = JSON.stringify({ gasAppData, solutions: solutions.map(s => ({ name: s.name, tier: s.tier, mode: s.mode, total: s.total })) });

      await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quoteForm,
          bomJson,
          zonesJson: JSON.stringify([]),
          configJson,
          totalGross: firstSol ? getMandatoryTotal(firstSol) : 0,
          totalNet: firstSol?.total ?? 0,
          customerGroup: clientData.customerGroup || 'NO',
          currency: 'EUR',
        }),
      });
      setShowQuoteForm(false);
      setQuoteSubmitted(true);
    } finally {
      setSaving(false);
    }
  }, [quoteForm, solutions, gasAppData, clientData.customerGroup]);

  const handleDownloadReport = useCallback(async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();
    const margin = 14;
    const navy: [number, number, number] = [22, 53, 75];
    const green: [number, number, number] = [167, 192, 49];
    let y = 0;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Header
    doc.setFillColor(...navy);
    doc.rect(0, 0, pw, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SafeRef — Product Recommendation Report', margin, 11);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(dateStr, pw - margin, 11, { align: 'right' });
    doc.text(`${gasAppData.selectedRefrigerant || ''}  |  ${gasAppData.zoneType || ''}`, margin, 18);
    doc.setTextColor(...green);
    y = 30;

    // Client info
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
    y += 10;

    // Solutions
    for (const sol of solutions) {
      if (y > 240) { doc.addPage(); y = 15; }
      const color = tierColor(sol);
      const [r, g, b] = color.startsWith('#')
        ? [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)]
        : [22, 53, 75];

      // Solution header
      doc.setFillColor(r, g, b);
      doc.rect(margin, y, pw - 2 * margin, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(sol.name, margin + 3, y + 5.5);
      doc.text(`${fmtEur(getMandatoryTotal(sol))} EUR`, pw - margin - 3, y + 5.5, { align: 'right' });
      y += 11;

      // BOM lines
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8);
      for (const comp of sol.components) {
        if (y > 275) { doc.addPage(); y = 15; }
        doc.text(comp.code, margin + 2, y);
        doc.text(comp.name.substring(0, 40), margin + 35, y);
        doc.text(`${comp.qty}`, pw - margin - 53, y);
        doc.text(fmtEur(comp.unitPrice), pw - margin - 25, y, { align: 'right' });
        doc.setFont('helvetica', comp.optional ? 'italic' : 'bold');
        doc.text(fmtEur(comp.subtotal), pw - margin - 3, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        y += 4.5;
      }
      y += 5;
    }

    // Disclaimer
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

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('SafeRef — Gas Detection Systems', margin, 290);
      doc.text(`Page ${p}/${pageCount}`, pw - margin, 290, { align: 'right' });
    }

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SR-report-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [solutions, clientData, gasAppData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#16354B]">{i.title}</h2>
      </div>

      {/* Preliminary disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <span className="font-semibold">Preliminary recommendation</span> — This product selection is based on regulatory calculations and is provided for informational purposes only.
        Final selection, pricing, and availability must be confirmed by your local distributor or sales representative.
      </div>

      {/* Duct/Pipe accessory notice */}
      {gasAppData.mountingType === 'duct' && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-800">
          <span className="font-semibold">Duct detection selected</span> — Only detectors with remote sensor probes are shown. A duct sampling accessory will be required for installation.
        </div>
      )}
      {gasAppData.mountingType === 'pipe' && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-800">
          <span className="font-semibold">Pipe/valve detection selected</span> — Detectors with remote sensor probes or native pipe-mount products are shown.
        </div>
      )}

      {/* No solutions notice */}
      {solutions.length === 0 && (
        <div className="text-center py-8 text-red-500 font-semibold">
          {i.noProducts}
        </div>
      )}

      {/* Filter bar */}
      {solutions.length > 0 && (
        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(22,53,75,0.08)] p-4 space-y-3">
          {/* Measurement type */}
          {availMeasTypes.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider w-24">Measurement</span>
              <button onClick={() => { setFilterMeas(''); setFilterRange(''); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${!filterMeas ? 'bg-[#16354B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                All ({solutions.length})
              </button>
              {availMeasTypes.map(m => (
                <button key={m} onClick={() => { setFilterMeas(m); setFilterRange(''); }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filterMeas === m ? 'bg-[#16354B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {m.toUpperCase()} ({solutions.filter(s => parseMeasType(s.detector.range) === m).length})
                </button>
              ))}
            </div>
          )}
          {/* Range level */}
          {availRanges.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider w-24">Range</span>
              <button onClick={() => setFilterRange('')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${!filterRange ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                All
              </button>
              {availRanges.map(r => (
                <button key={r} onClick={() => setFilterRange(r)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filterRange === r ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {r}
                </button>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-400">
            Showing {filteredSolutions.length} of {solutions.length} solutions
          </div>
        </div>
      )}

      {/* Solution Cards — collapsible */}
      <div className="grid gap-4">
        {filteredSolutions.map((sol, idx) => {
          const color = tierColor(sol);
          const label = tierLabel(sol);
          const mandatoryTotal = getMandatoryTotal(sol);
          const mandatory = sol.components.filter(c => !c.optional);
          const optional = sol.components.filter(c => c.optional);
          const isExpanded = expandedCard === idx;

          return (
            <div key={idx} className="border-2 rounded-xl overflow-hidden" style={{ borderColor: color }}>
              {/* Solution Header — clickable */}
              <button
                onClick={() => setExpandedCard(isExpanded ? null : idx)}
                className="w-full px-5 py-3 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: color }}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-white/70" /> : <ChevronRight className="w-4 h-4 text-white/70" />}
                  <h3 className="text-white font-bold text-base text-left">{sol.name}</h3>
                  <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {label}
                  </span>
                </div>
                <div className="text-white text-right flex items-center gap-4">
                  {sol.detector.range && (
                    <span className="text-white/70 text-xs">{sol.detector.range}</span>
                  )}
                  <span className="text-white/70 text-xs">{mandatory.length} items</span>
                  <div>
                    <div className="font-bold text-lg">{fmtEur(mandatoryTotal)} EUR</div>
                    {sol.optionalTotal > 0 && (
                      <div className="text-[11px] opacity-70">+ {fmtEur(sol.optionalTotal)} opt</div>
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <>
                  {/* Detector summary */}
                  <div className="px-5 py-3 bg-gray-50 flex items-center gap-4 border-b">
                    {sol.detector.image && (
                      <img
                        src={sol.detector.image.startsWith('/') ? sol.detector.image : `/assets/${sol.detector.image}`}
                        alt={sol.detector.name}
                        className="w-16 h-16 object-contain rounded bg-white border border-gray-200 p-1 flex-shrink-0"
                      />
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span><b>Detector:</b> {sol.detector.name}</span>
                      <span><b>Code:</b> {sol.detector.code}</span>
                      {sol.detector.sensorTech && <span><b>Sensor:</b> {sol.detector.sensorTech}</span>}
                      {sol.detector.range && <span><b>Range:</b> {sol.detector.range}</span>}
                      {sol.controller && (
                        <span><b>Controller:</b> {sol.controllerQty}x {sol.controller.name}</span>
                      )}
                      {!sol.controller && (
                        <span className="text-green-600 font-semibold">Standalone</span>
                      )}
                      {sol.connectionLabel && (
                        <span><b>Connection:</b> {sol.connectionLabel}</span>
                      )}
                    </div>
                  </div>

                  {/* BOM Table */}
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="w-10 px-2 py-2"></th>
                        <th className="text-left px-3 py-2 text-[10px] uppercase text-[#6b8da5]">Code</th>
                        <th className="text-left px-3 py-2 text-[10px] uppercase text-[#6b8da5]">Product</th>
                        <th className="text-center px-3 py-2 text-[10px] uppercase text-[#6b8da5]">Role</th>
                        <th className="text-center px-3 py-2 text-[10px] uppercase text-[#6b8da5]">Qty</th>
                        <th className="text-right px-3 py-2 text-[10px] uppercase text-[#6b8da5]">Unit (EUR)</th>
                        <th className="text-right px-3 py-2 text-[10px] uppercase text-[#6b8da5]">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mandatory.map((comp: BomComponent, li: number) => (
                        <ComponentRow key={li} comp={comp} li={li} />
                      ))}
                      {optional.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={7} className="px-3 py-1.5 text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider bg-gray-50 border-t">
                              Optional Accessories
                            </td>
                          </tr>
                          {optional.map((comp: BomComponent, li: number) => (
                            <ComponentRow key={`opt-${li}`} comp={comp} li={li} optional />
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>

                  {/* Total row */}
                  <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
                    <div className="text-xs text-gray-400 italic">List prices — contact your distributor for final pricing</div>
                    <div className="text-lg font-bold" style={{ color }}>
                      {fmtEur(mandatoryTotal)} EUR
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Grand total (first / cheapest solution) */}
      {solutions.length > 0 && (
        <div className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white rounded-xl p-6 flex justify-between items-center">
          <div>
            <div className="text-sm opacity-75">Estimated List Price — {solutions[0].name}</div>
            <div className="text-xs opacity-50 mt-1">Indicative pricing — final quote from your distributor</div>
          </div>
          <div className="text-3xl font-extrabold">{fmtEur(getMandatoryTotal(solutions[0]))} EUR</div>
        </div>
      )}

      {/* Print / Download */}
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

      {/* Quote submitted confirmation */}
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

            <div className="mt-3">
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

function ComponentRow({ comp, li, optional }: { comp: BomComponent; li: number; optional?: boolean }) {
  return (
    <tr className={`border-t ${li % 2 === 0 ? '' : 'bg-gray-50'} ${optional ? 'opacity-70 italic' : ''}`}>
      <td className="px-2 py-1.5">
        {comp.image ? (
          <img src={comp.image.startsWith('/') ? comp.image : `/assets/${comp.image}`} alt="" className="w-8 h-8 object-contain rounded" />
        ) : (
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-[8px] text-gray-300">—</div>
        )}
      </td>
      <td className="px-3 py-1.5 font-mono text-xs text-[#16354B] font-bold">{comp.code}</td>
      <td className="px-3 py-1.5 text-xs">{comp.name}</td>
      <td className="px-3 py-1.5 text-center">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{comp.role}</span>
      </td>
      <td className="px-3 py-1.5 text-center text-xs">{comp.qty}</td>
      <td className="px-3 py-1.5 text-right text-xs">{fmtEur(comp.unitPrice)}</td>
      <td className="px-3 py-1.5 text-right text-xs font-semibold">{fmtEur(comp.subtotal)}</td>
    </tr>
  );
}
