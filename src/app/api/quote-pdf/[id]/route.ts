import { prisma } from "@/lib/db";

function safeParse<T>(json: string, fallback: T): T {
  try { return JSON.parse(json) as T; }
  catch { return fallback; }
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtEur(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ─── Types for parsed results ────────────────────────────────────────

interface PricedLine {
  code: string; name: string; productGroup: string; category: string;
  qty: number; listPrice: number; discountPct: number;
  discountAmount: number; netTotal: number;
}

interface PricedTier {
  tier: string; label: string; solutionScore: number;
  bomLines: PricedLine[];
  summary: { totalBeforeDiscount: number; totalDiscount: number; totalHt: number };
}

interface Results {
  regulation?: {
    detectionRequired?: string; recommendedDetectors?: number;
    thresholdPpm?: number; thresholdBasis?: string;
    placementHeight?: string; governingRuleId?: string;
    sourceClauses?: string[]; requiredActions?: string[];
  };
  pricing?: {
    quoteRef?: string; quoteDate?: string; quoteValidUntil?: string;
    priceListVersion?: string; recommended?: string; warnings?: string[];
    tiers?: { premium?: PricedTier | null; standard?: PricedTier | null; centralized?: PricedTier | null };
    comparison?: { rows?: { label: string; premium: string; standard: string; centralized: string }[] };
  };
  [key: string]: unknown;
}

interface ClientInfo {
  firstName?: string; lastName?: string; company?: string;
  email?: string; phone?: string; country?: string;
  customerGroup?: string; discountCode?: string; projectName?: string;
}

interface ProjectInfo {
  application?: string; refrigerant?: string; zoneType?: string;
  selectedRefrigerant?: string; selectedRange?: string;
  sitePowerVoltage?: string; mountingType?: string; zoneAtex?: boolean;
}

// ─── Route ───────────────────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id } });

  if (!quote) {
    return new Response("<h1>Quote not found</h1>", {
      status: 404, headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Parse stored JSON
  const configData = safeParse<Record<string, unknown>>(quote.configJson, {});
  const client: ClientInfo = {
    firstName: quote.clientName?.split(' ')[0],
    lastName: quote.clientName?.split(' ').slice(1).join(' '),
    company: quote.clientCompany ?? undefined,
    email: quote.clientEmail ?? undefined,
    phone: quote.clientPhone ?? undefined,
    customerGroup: quote.customerGroup ?? undefined,
    projectName: quote.projectName ?? undefined,
  };
  const project: ProjectInfo = {
    selectedRefrigerant: configData.selectedRefrigerant as string | undefined,
    zoneType: configData.zoneType as string | undefined,
    sitePowerVoltage: configData.sitePowerVoltage as string | undefined,
    mountingType: configData.mountingType as string | undefined,
    zoneAtex: configData.zoneAtex as boolean | undefined,
  };

  // Try to get full results (regulation + pricing tiers) from configJson
  const results: Results = safeParse<Results>(quote.configJson, {});

  // Get product images
  const allProducts = await prisma.product.findMany({
    select: { code: true, name: true, image: true, price: true },
  });
  const productMap = new Map(allProducts.map(p => [p.code, p]));

  const html = generateQuotePdfHtml(quote, client, project, results, productMap);

  return new Response(html, {
    status: 200, headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// ─── HTML Generator ──────────────────────────────────────────────────

function generateQuotePdfHtml(
  quote: { id: string; ref: string; status: string; createdAt: Date; expiresAt: Date | null; totalGross: number; totalNet: number; currency: string },
  client: ClientInfo,
  project: ProjectInfo,
  results: Results,
  productMap: Map<string, { code: string; name: string; image: string | null; price: number }>,
): string {
  const createdDate = fmtDate(quote.createdAt);
  const validUntil = quote.expiresAt ? fmtDate(quote.expiresAt) : '-';

  const pricing = results.pricing ?? results;
  const regulation = results.regulation ?? {};
  const pricingTiers = (pricing as Results['pricing'])?.tiers ?? {};
  const quoteRef = (pricing as Results['pricing'])?.quoteRef ?? quote.ref;
  const recommended = (pricing as Results['pricing'])?.recommended;

  // ── BOM Tables per tier ──
  const tierOrder = ['premium', 'standard', 'centralized'] as const;
  const tierLabels: Record<string, string> = { premium: 'Premium', standard: 'Standard', centralized: 'Centralized' };
  const tierColors: Record<string, string> = { premium: '#E63946', standard: '#2563eb', centralized: '#16a34a' };

  const bomTablesHtml = tierOrder.map(key => {
    const tier = pricingTiers[key] as PricedTier | null | undefined;
    if (!tier || !tier.bomLines?.length) return '';

    const linesHtml = tier.bomLines.map((line, i) => {
      const prod = productMap.get(line.code);
      const imgSrc = prod?.image ? `/assets/${prod.image}` : '';
      const imgHtml = imgSrc
        ? `<img src="${escHtml(imgSrc)}" alt="${escHtml(line.code)}" style="width:40px;height:40px;object-fit:contain;border-radius:4px;background:#f8fafc;" />`
        : `<div style="width:40px;height:40px;background:#f1f5f9;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#94a3b8;">N/A</div>`;
      return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="text-align:center;padding:6px 4px;">${imgHtml}</td>
        <td style="font-family:'Courier New',monospace;font-size:10px;color:#16354B;font-weight:700;">${escHtml(line.code)}</td>
        <td style="font-size:10px;">${escHtml(line.name)}</td>
        <td style="text-align:center;font-size:10px;">${line.qty}</td>
        <td style="text-align:right;font-size:10px;">${fmtEur(line.listPrice)}</td>
        <td style="text-align:right;font-size:10px;color:#666;">${line.discountPct > 0 ? `-${line.discountPct}%` : '-'}</td>
        <td style="text-align:right;font-size:10px;font-weight:600;">${fmtEur(line.netTotal)}</td>
      </tr>`;
    }).join('');

    const isRec = recommended === key;
    const recBadge = isRec ? ' <span style="color:#E63946;font-size:10px;font-weight:700;">&#9733; RECOMMENDED</span>' : '';

    return `
    <div style="break-inside:avoid;margin-top:24px;">
      <h3 style="margin:0 0 10px;color:#16354B;font-size:14px;border-bottom:3px solid ${tierColors[key] ?? '#666'};padding-bottom:6px;">
        ${tierLabels[key] || key}${recBadge}
      </h3>
      <table>
        <thead><tr>
          <th style="text-align:center;width:50px;">Photo</th>
          <th style="text-align:left;">Code</th>
          <th style="text-align:left;">Designation</th>
          <th style="text-align:center;width:50px;">Qty</th>
          <th style="text-align:right;width:90px;">Unit EUR HT</th>
          <th style="text-align:right;width:70px;">Discount</th>
          <th style="text-align:right;width:100px;">Line Total</th>
        </tr></thead>
        <tbody>${linesHtml}</tbody>
        <tfoot><tr style="background:#f1f5f9;">
          <td colspan="4" style="text-align:right;font-weight:700;font-size:10px;padding:8px;">Subtotal before discount</td>
          <td style="text-align:right;font-size:10px;">${fmtEur(tier.summary.totalBeforeDiscount)}</td>
          <td style="text-align:right;font-size:10px;color:#E63946;">-${fmtEur(tier.summary.totalDiscount)}</td>
          <td style="text-align:right;font-size:13px;font-weight:700;color:#16a34a;">${fmtEur(tier.summary.totalHt)}</td>
        </tr></tfoot>
      </table>
      <div style="font-size:9px;color:#94a3b8;margin-top:4px;">Solution score: ${tier.solutionScore}/21</div>
    </div>`;
  }).join('');

  // ── Comparison table ──
  const compRows = (pricing as Results['pricing'])?.comparison?.rows ?? [];
  const compHtml = compRows.length ? `
    <div style="break-inside:avoid;margin-top:24px;">
      <h3 style="margin:0 0 10px;color:#16354B;font-size:14px;">Solution Comparison</h3>
      <table>
        <thead><tr>
          <th style="text-align:left;background:#f1f5f9;color:#16354B;">Criteria</th>
          <th style="text-align:center;background:#f1f5f9;color:#16354B;">Premium</th>
          <th style="text-align:center;background:#f1f5f9;color:#16354B;">Standard</th>
          <th style="text-align:center;background:#f1f5f9;color:#16354B;">Centralized</th>
        </tr></thead>
        <tbody>${compRows.map(r => `<tr>
          <td style="font-weight:500;font-size:10px;">${escHtml(r.label)}</td>
          <td style="text-align:center;font-size:10px;">${escHtml(r.premium)}</td>
          <td style="text-align:center;font-size:10px;">${escHtml(r.standard)}</td>
          <td style="text-align:center;font-size:10px;">${escHtml(r.centralized)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>` : '';

  // ── Warnings ──
  const warnings = (pricing as Results['pricing'])?.warnings ?? [];
  const warningsHtml = warnings.length ? `
    <div style="margin-top:16px;padding:10px 14px;background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;font-size:10px;">
      <b>Warnings:</b><br/>${warnings.map(w => escHtml(w)).join('<br/>')}
    </div>` : '';

  // ── Regulation banner ──
  const reg = regulation;
  const regBannerHtml = reg.detectionRequired ? `
    <div style="background:linear-gradient(135deg,#16354B,#2a4a62);color:white;border-radius:8px;padding:14px 20px;margin-bottom:20px;display:flex;justify-content:space-around;flex-wrap:wrap;gap:8px;">
      <div style="text-align:center;min-width:80px;">
        <div style="font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Detection</div>
        <div style="font-size:16px;font-weight:700;color:${reg.detectionRequired === 'YES' ? '#f87171' : '#fbbf24'};">${escHtml(reg.detectionRequired)}</div>
      </div>
      <div style="text-align:center;min-width:80px;">
        <div style="font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Detectors</div>
        <div style="font-size:16px;font-weight:700;">${reg.recommendedDetectors ?? '-'}</div>
      </div>
      <div style="text-align:center;min-width:80px;">
        <div style="font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Threshold</div>
        <div style="font-size:16px;font-weight:700;">${reg.thresholdPpm ?? '-'} ppm</div>
      </div>
      <div style="text-align:center;min-width:80px;">
        <div style="font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Basis</div>
        <div style="font-size:11px;font-weight:700;">${escHtml(reg.thresholdBasis ?? '-')}</div>
      </div>
      <div style="text-align:center;min-width:80px;">
        <div style="font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Placement</div>
        <div style="font-size:11px;font-weight:700;">${escHtml(reg.placementHeight ?? '-')}</div>
      </div>
      <div style="text-align:center;min-width:80px;">
        <div style="font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Rule</div>
        <div style="font-size:11px;font-weight:700;">${escHtml(reg.governingRuleId ?? '-')}</div>
      </div>
    </div>` : '';

  const statusColors: Record<string, string> = {
    draft: '#6B7280', sent: '#2563EB', accepted: '#16A34A', rejected: '#DC2626',
  };
  const statusColor = statusColors[quote.status] ?? '#6B7280';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Quote ${escHtml(quoteRef)} - SafeRef</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 11px; color: #1a2332; line-height: 1.5; background: #fff; }
  @page { size: A4; margin: 12mm 15mm; }
  .page { max-width: 210mm; margin: 0 auto; padding: 24px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 4px solid #E63946; }
  .header-left h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
  .header-left h1 .safe { color: #E63946; }
  .header-left h1 .ref { color: #16354B; }
  .header-left .subtitle { font-size: 10px; color: #6b8da5; margin-top: 2px; }
  .header-right { text-align: right; font-size: 10px; color: #666; }
  .header-right .qref { font-size: 18px; font-weight: 700; color: #16354B; margin-bottom: 4px; }
  .status-badge { display:inline-block; margin-top:6px; padding:2px 10px; border-radius:12px; font-size:10px; font-weight:700; text-transform:uppercase; color:#fff; background:${statusColor}; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
  .info-box h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1.2px; color: #6b8da5; margin-bottom: 8px; font-weight: 700; }
  .info-box p { font-size: 11px; margin: 3px 0; }
  .info-box b { color: #16354B; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 8px; }
  th { background: #16354B; color: white; padding: 8px 10px; font-weight: 600; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
  .grand-total { margin-top: 24px; padding: 16px 20px; background: linear-gradient(135deg, #E63946, #c41819); color: white; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
  .grand-total .label { font-size: 14px; font-weight: 600; }
  .grand-total .amount { font-size: 22px; font-weight: 800; }
  .conditions { margin-top: 20px; font-size: 9px; color: #888; line-height: 1.7; padding: 12px 0; border-top: 1px solid #e2e8f0; }
  .conditions h4 { font-size: 10px; color: #666; margin-bottom: 6px; font-weight: 700; }
  .footer { margin-top: 24px; padding-top: 14px; border-top: 2px solid #E63946; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #94a3b8; }
  .footer b { color: #16354B; }
  @media print {
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .page { padding: 0; }
    .no-print { display: none !important; }
    div { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <h1><span class="safe">Safe</span><span class="ref">Ref</span></h1>
      <div class="subtitle">Gas Detection System - Quotation</div>
    </div>
    <div class="header-right">
      <div class="qref">${escHtml(quoteRef)}</div>
      <div>Date: ${createdDate}</div>
      <div>Valid until: ${validUntil}</div>
      <span class="status-badge">${escHtml(quote.status)}</span>
    </div>
  </div>

  <!-- Client & Project -->
  <div class="info-grid">
    <div class="info-box">
      <h4>Client</h4>
      <p><b>${escHtml(client.firstName ?? '')} ${escHtml(client.lastName ?? '')}</b></p>
      ${client.company ? `<p>${escHtml(client.company)}</p>` : ''}
      ${client.email ? `<p style="color:#2563eb;">${escHtml(client.email)}</p>` : ''}
      <p>${[client.phone, client.customerGroup ? `Group: ${client.customerGroup}` : ''].filter(Boolean).join(' | ')}</p>
    </div>
    <div class="info-box">
      <h4>Project</h4>
      <p><b>${escHtml(client.projectName ?? '')}</b></p>
      ${project.selectedRefrigerant ? `<p>Refrigerant: <b>${escHtml(project.selectedRefrigerant)}</b></p>` : ''}
      ${project.zoneType ? `<p>Application: ${escHtml(project.zoneType)}</p>` : ''}
      ${project.sitePowerVoltage ? `<p>Power: ${escHtml(project.sitePowerVoltage)}</p>` : ''}
      ${project.zoneAtex ? '<p style="color:#dc2626;font-weight:600;">ATEX Zone</p>' : ''}
    </div>
  </div>

  <!-- Regulation Banner -->
  ${regBannerHtml}

  <!-- BOM Tables per Tier -->
  ${bomTablesHtml}

  <!-- Comparison Table -->
  ${compHtml}

  <!-- Grand Total -->
  <div class="grand-total">
    <div class="label">TOTAL HT EUR</div>
    <div class="amount">${fmtEur(quote.totalNet > 0 ? quote.totalNet : quote.totalGross)}</div>
  </div>

  <!-- Warnings -->
  ${warningsHtml}

  <!-- Conditions -->
  <div class="conditions">
    <h4>General Conditions</h4>
    <p>Prices in EUR excl. taxes and transport. Valid 30 days from quote date.</p>
    <p>Delivery: subject to availability, to be confirmed upon order.</p>
    ${reg.sourceClauses?.length ? `<p>Applicable standards: ${reg.sourceClauses.map(s => escHtml(s)).join(', ')}.</p>` : '<p>Standards: EN 378:2016 / EN 14624:2014.</p>'}
    ${reg.requiredActions?.length ? `<p>Required actions: ${reg.requiredActions.map(s => escHtml(s)).join(' ; ')}.</p>` : ''}
    <p>This quote was automatically generated by SafeRef. Quantities and selections are based on regulatory analysis.</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div><b>SAMON AB</b> &mdash; Gas Detection Systems &mdash; www.samon.com</div>
    <div>EN 378:2016 / EN 14624:2014 &mdash; SafeRef v2</div>
  </div>

</div>

<script>
  window.onload = function() { setTimeout(function() { window.print(); }, 500); };
</script>
</body>
</html>`;
}
