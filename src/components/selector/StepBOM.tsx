'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { BOMResult, ProductRecord, SelectorInput, DiscountRow, BOMLine } from '@/lib/m2-engine/types';
import { applyPricing, type PricedLine } from '@/lib/m2-engine/pricing';
import { selectAccessories } from '@/lib/m2-engine/select-accessories';

const CUSTOMER_GROUPS = [
  '', 'EDC', 'OEM', '1Fo', '2Fo', '3Fo',
  '1Contractor', '2Contractor', '3Contractor',
  'AKund', 'BKund', 'NO',
];

interface Props {
  bom: BOMResult;
  products: ProductRecord[];
  selectorInput: SelectorInput;
  customerGroup: string;
  onCustomerGroupChange: (v: string) => void;
  discountMatrix?: DiscountRow[];
}

const labelClass = 'block text-[10px] font-semibold text-[#6b8da5] uppercase tracking-wider mb-1.5';

export default function StepBOM({
  bom, products, selectorInput, customerGroup,
  onCustomerGroupChange, discountMatrix = [],
}: Props) {
  const router = useRouter();
  const detectorFamily = bom.zones[0]?.detector?.family ?? '';
  const optionalAccessories = useMemo(() => {
    if (!detectorFamily) return [];
    const { optional } = selectAccessories(detectorFamily, selectorInput.gasGroup, selectorInput.mountType, products);
    return optional;
  }, [detectorFamily, selectorInput.gasGroup, selectorInput.mountType, products]);

  const [selectedOptional, setSelectedOptional] = useState<Record<string, number>>({});

  function toggleOptional(code: string) {
    setSelectedOptional(prev => {
      const copy = { ...prev };
      if (copy[code]) { delete copy[code]; } else { copy[code] = 1; }
      return copy;
    });
  }

  const allLines = useMemo((): BOMLine[] => {
    const lines: BOMLine[] = [];
    for (const zone of bom.zones) {
      if (zone.detector) lines.push(zone.detector);
      lines.push(...zone.accessories);
    }
    if (bom.controller) lines.push(bom.controller);
    for (const [code, qty] of Object.entries(selectedOptional)) {
      const prod = optionalAccessories.find(a => a.code === code);
      if (prod) {
        lines.push({
          productId: prod.id, code: prod.code, name: prod.name,
          family: prod.family, type: 'accessory', unitPrice: prod.price,
          productGroup: prod.productGroup, qty, lineTotal: prod.price * qty,
          essential: false,
        });
      }
    }
    return lines;
  }, [bom, selectedOptional, optionalAccessories]);

  const pricedLines = useMemo(
    () => applyPricing(allLines, customerGroup, discountMatrix),
    [allLines, customerGroup, discountMatrix],
  );

  const totalGross = pricedLines.reduce((s, l) => s + l.lineTotal, 0);
  const totalNet = pricedLines.reduce((s, l) => s + l.lineNetTotal, 0);
  const showNet = customerGroup !== '' && discountMatrix.length > 0;

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    clientName: '', clientEmail: '', clientCompany: '', clientPhone: '', projectName: '', projectRef: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSaveQuote = useCallback(async () => {
    setSaving(true);
    try {
      const zonesJson = JSON.stringify(bom.zones.map(z => z.zoneName));
      const bomJson = JSON.stringify(pricedLines);
      const configJson = JSON.stringify(selectorInput);
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quoteForm,
          bomJson,
          zonesJson,
          configJson,
          totalGross,
          totalNet: showNet ? totalNet : totalGross,
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
  }, [quoteForm, pricedLines, bom.zones, selectorInput, totalGross, totalNet, showNet, customerGroup, router]);

  const handleDownloadPdf = useCallback(async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('SAMON Product Quote', 14, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    let y = 45;
    doc.setFontSize(12);
    doc.text('Bill of Materials', 14, y);
    y += 10;

    doc.setFontSize(9);
    doc.text('Code', 14, y);
    doc.text('Description', 50, y);
    doc.text('Qty', 130, y);
    doc.text('Unit Price', 145, y);
    doc.text('Total', 175, y);
    y += 6;

    for (const line of pricedLines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line.code, 14, y);
      doc.text(line.name.substring(0, 40), 50, y);
      doc.text(String(line.qty), 132, y);
      doc.text(`${line.unitPrice.toFixed(0)}`, 145, y);
      doc.text(`${line.lineTotal.toFixed(0)}`, 175, y);
      y += 5;
    }

    y += 10;
    doc.setFontSize(11);
    doc.text(`Total: EUR ${totalGross.toFixed(2)}`, 145, y);

    doc.save('samon-quote.pdf');
  }, [pricedLines, totalGross]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#16354B]">Product Quote</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuoteForm(true)}
            className="bg-[#A7C031] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#8fa827] transition-colors"
          >
            Save as Quote
          </button>
          <button
            onClick={handleDownloadPdf}
            className="bg-[#16354B] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1e4a6a] transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass}>Customer Group (optional &mdash; for net pricing)</label>
        <select
          value={customerGroup}
          onChange={e => onCustomerGroupChange(e.target.value)}
          className="w-64 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm"
        >
          <option value="">No group (gross prices only)</option>
          {CUSTOMER_GROUPS.filter(Boolean).map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {bom.zones.map((zone, zi) => (
        <div key={zi} className="border-2 border-[#e2e8f0] rounded-lg overflow-hidden">
          <div className="bg-[#16354B] text-white px-4 py-2 font-semibold text-sm">{zone.zoneName}</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-[10px] uppercase text-[#6b8da5]">Code</th>
                <th className="text-left px-4 py-2 text-[10px] uppercase text-[#6b8da5]">Product</th>
                <th className="text-center px-4 py-2 text-[10px] uppercase text-[#6b8da5]">Qty</th>
                <th className="text-right px-4 py-2 text-[10px] uppercase text-[#6b8da5]">Unit</th>
                <th className="text-right px-4 py-2 text-[10px] uppercase text-[#6b8da5]">Total</th>
              </tr>
            </thead>
            <tbody>
              {zone.detector && (
                <tr className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{zone.detector.code}</td>
                  <td className="px-4 py-2">{zone.detector.name}</td>
                  <td className="px-4 py-2 text-center">{zone.detector.qty}</td>
                  <td className="px-4 py-2 text-right">{zone.detector.unitPrice.toFixed(0)}</td>
                  <td className="px-4 py-2 text-right font-semibold">{zone.detector.lineTotal.toFixed(0)}</td>
                </tr>
              )}
              {zone.accessories.map((acc, ai) => (
                <tr key={ai} className="border-t text-[#6b8da5]">
                  <td className="px-4 py-2 font-mono text-xs">{acc.code}</td>
                  <td className="px-4 py-2">{acc.name}</td>
                  <td className="px-4 py-2 text-center">{acc.qty}</td>
                  <td className="px-4 py-2 text-right">{acc.unitPrice.toFixed(0)}</td>
                  <td className="px-4 py-2 text-right">{acc.lineTotal.toFixed(0)}</td>
                </tr>
              ))}
              {!zone.detector && (
                <tr><td colSpan={5} className="px-4 py-3 text-center text-red-500">No compatible detector found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ))}

      {bom.controller && (
        <div className="border-2 border-[#A7C031] rounded-lg overflow-hidden">
          <div className="bg-[#A7C031] text-white px-4 py-2 font-semibold text-sm">Controller</div>
          <div className="px-4 py-3 flex justify-between items-center">
            <div>
              <span className="font-mono text-xs mr-3">{bom.controller.code}</span>
              <span className="text-sm">{bom.controller.name}</span>
            </div>
            <span className="font-semibold">{bom.controller.unitPrice.toFixed(0)} EUR</span>
          </div>
        </div>
      )}

      {optionalAccessories.length > 0 && (
        <div className="border-2 border-[#e2e8f0] rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-semibold text-sm text-[#16354B]">Additional Accessories</div>
          <div className="divide-y">
            {optionalAccessories.map(acc => (
              <label key={acc.code} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!selectedOptional[acc.code]}
                  onChange={() => toggleOptional(acc.code)}
                  className="mr-3"
                />
                <span className="font-mono text-xs mr-3 text-[#6b8da5]">{acc.code}</span>
                <span className="flex-1 text-sm">{acc.name}</span>
                <span className="text-sm font-semibold">{acc.price.toFixed(0)} EUR</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#16354B] text-white rounded-lg p-6">
        <div className="flex justify-between text-lg">
          <span>Total (Gross)</span>
          <span className="font-bold">{totalGross.toFixed(2)} EUR</span>
        </div>
        {showNet && (
          <div className="flex justify-between text-lg mt-2 text-[#A7C031]">
            <span>Total (Net - {customerGroup})</span>
            <span className="font-bold">{totalNet.toFixed(2)} EUR</span>
          </div>
        )}
      </div>

      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-[#16354B] mb-4">Save as Quote</h3>
            <div className="space-y-3">
              {(
                [
                  { key: 'clientName', label: 'Client Name' },
                  { key: 'clientEmail', label: 'Client Email' },
                  { key: 'clientCompany', label: 'Client Company' },
                  { key: 'clientPhone', label: 'Client Phone' },
                  { key: 'projectName', label: 'Project Name' },
                  { key: 'projectRef', label: 'Project Reference' },
                ] as { key: keyof typeof quoteForm; label: string }[]
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type="text"
                    value={quoteForm[key]}
                    onChange={e => setQuoteForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#A7C031]"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowQuoteForm(false)}
                className="px-4 py-2 text-sm font-semibold text-[#16354B] border-2 border-[#e2e8f0] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuote}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#A7C031] rounded-lg hover:bg-[#8fa827] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
