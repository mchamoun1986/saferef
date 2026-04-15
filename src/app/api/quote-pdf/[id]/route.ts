import { prisma } from "@/lib/db";

interface BOMLine {
  code: string;
  name: string;
  type?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " " + currency;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({ where: { id } });

  if (!quote) {
    return new Response("<h1>Quote not found</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const bom = safeParse<BOMLine[]>(quote.bomJson, []);

  const createdDate = formatDate(quote.createdAt);
  const expiresDate = quote.expiresAt ? formatDate(quote.expiresAt) : "—";

  const statusColors: Record<string, string> = {
    draft: "#6B7280",
    sent: "#2563EB",
    accepted: "#16A34A",
    rejected: "#DC2626",
  };
  const statusColor = statusColors[quote.status] ?? "#6B7280";

  const bomRows = bom
    .map(
      (line) => `
    <tr>
      <td class="td-code">${escHtml(line.code)}</td>
      <td class="td-name">${escHtml(line.name)}</td>
      <td class="td-center">${line.qty}</td>
      <td class="td-right">${formatCurrency(line.unitPrice, quote.currency)}</td>
      <td class="td-right td-total">${formatCurrency(line.lineTotal, quote.currency)}</td>
    </tr>`
    )
    .join("");

  const showNet = quote.totalNet > 0 && quote.totalNet !== quote.totalGross;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Quote ${escHtml(quote.ref)} — SafeRef</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      background: #fff;
      padding: 32px 40px;
      max-width: 960px;
      margin: 0 auto;
    }

    /* ── HEADER ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 3px solid #E63946;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1;
    }
    .brand-safe { color: #E63946; }
    .brand-ref  { color: #16354B; }
    .brand-sub {
      font-size: 10px;
      color: #6B7280;
      margin-top: 4px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .quote-meta {
      text-align: right;
    }
    .quote-ref {
      font-size: 18px;
      font-weight: 700;
      color: #16354B;
    }
    .quote-date {
      font-size: 11px;
      color: #6B7280;
      margin-top: 4px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #fff;
      background: ${statusColor};
    }

    /* ── CLIENT BOX ── */
    .client-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid #16354B;
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 32px;
    }
    .client-box h2 {
      grid-column: 1 / -1;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6B7280;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .client-field {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .client-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9CA3AF;
      font-weight: 600;
    }
    .client-value {
      font-size: 12px;
      color: #1a1a1a;
      font-weight: 500;
    }
    .client-value.empty {
      color: #9CA3AF;
      font-style: italic;
    }

    /* ── BOM TABLE ── */
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6B7280;
      font-weight: 600;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    thead tr {
      background: #16354B;
      color: #fff;
    }
    thead th {
      padding: 9px 12px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 600;
    }
    thead th:first-child { border-radius: 4px 0 0 0; }
    thead th:last-child  { border-radius: 0 4px 0 0; }
    th.th-right, td.td-right { text-align: right; }
    th.th-center, td.td-center { text-align: center; }

    tbody tr:nth-child(even) { background: #F8FAFC; }
    tbody tr:hover { background: #EFF6FF; }
    tbody td {
      padding: 8px 12px;
      border-bottom: 1px solid #E2E8F0;
      font-size: 11px;
    }
    .td-code {
      font-family: 'Courier New', monospace;
      font-size: 10px;
      color: #16354B;
      font-weight: 700;
      white-space: nowrap;
    }
    .td-name { color: #374151; }
    .td-total { font-weight: 600; color: #16354B; }

    .bom-empty {
      text-align: center;
      padding: 24px;
      color: #9CA3AF;
      font-style: italic;
    }

    /* ── TOTALS BOX ── */
    .totals-box {
      background: #16354B;
      color: #fff;
      border-radius: 8px;
      padding: 20px 28px;
      margin-bottom: 32px;
      max-width: 340px;
      margin-left: auto;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
    }
    .totals-row + .totals-row {
      border-top: 1px solid rgba(255,255,255,0.15);
    }
    .totals-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.75;
    }
    .totals-value {
      font-size: 14px;
      font-weight: 700;
    }
    .totals-value.net { color: #A7C031; }
    .totals-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      opacity: 0.5;
      margin-bottom: 12px;
    }

    /* ── FOOTER ── */
    .footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .footer-brand {
      font-size: 10px;
      color: #9CA3AF;
    }
    .footer-brand strong { color: #E63946; }
    .footer-validity {
      font-size: 10px;
      color: #9CA3AF;
      text-align: right;
    }

    /* ── PRINT ── */
    @media print {
      body { padding: 16px 20px; }
      @page { margin: 16mm 18mm; size: A4; }
      tbody tr:hover { background: inherit; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div>
      <div class="brand">
        <span class="brand-safe">Safe</span><span class="brand-ref">Ref</span>
      </div>
      <div class="brand-sub">Gas Detection Systems</div>
    </div>
    <div class="quote-meta">
      <div class="quote-ref">${escHtml(quote.ref)}</div>
      <div class="quote-date">Issued: ${createdDate}&nbsp;&nbsp;|&nbsp;&nbsp;Valid until: ${expiresDate}</div>
      <span class="status-badge">${escHtml(quote.status)}</span>
    </div>
  </header>

  <!-- CLIENT BOX -->
  <div class="client-box">
    <h2>Client &amp; Project</h2>

    <div class="client-field">
      <span class="client-label">Client Name</span>
      <span class="client-value${!quote.clientName ? " empty" : ""}">${quote.clientName ? escHtml(quote.clientName) : "—"}</span>
    </div>
    <div class="client-field">
      <span class="client-label">Company</span>
      <span class="client-value${!quote.clientCompany ? " empty" : ""}">${quote.clientCompany ? escHtml(quote.clientCompany) : "—"}</span>
    </div>
    <div class="client-field">
      <span class="client-label">Email</span>
      <span class="client-value${!quote.clientEmail ? " empty" : ""}">${quote.clientEmail ? escHtml(quote.clientEmail) : "—"}</span>
    </div>
    <div class="client-field">
      <span class="client-label">Phone</span>
      <span class="client-value${!quote.clientPhone ? " empty" : ""}">${quote.clientPhone ? escHtml(quote.clientPhone) : "—"}</span>
    </div>
    <div class="client-field">
      <span class="client-label">Project Name</span>
      <span class="client-value${!quote.projectName ? " empty" : ""}">${quote.projectName ? escHtml(quote.projectName) : "—"}</span>
    </div>
    <div class="client-field">
      <span class="client-label">Project Ref</span>
      <span class="client-value${!quote.projectRef ? " empty" : ""}">${quote.projectRef ? escHtml(quote.projectRef) : "—"}</span>
    </div>
  </div>

  <!-- BOM TABLE -->
  <div class="section-title">Bill of Materials</div>
  <table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Product</th>
        <th class="th-center">Qty</th>
        <th class="th-right">Unit (${escHtml(quote.currency)})</th>
        <th class="th-right">Total (${escHtml(quote.currency)})</th>
      </tr>
    </thead>
    <tbody>
      ${bom.length > 0 ? bomRows : `<tr><td colspan="5" class="bom-empty">No items in this quote.</td></tr>`}
    </tbody>
  </table>

  <!-- TOTALS -->
  <div class="totals-box">
    <div class="totals-title">Pricing Summary</div>
    <div class="totals-row">
      <span class="totals-label">Gross Total</span>
      <span class="totals-value">${formatCurrency(quote.totalGross, quote.currency)}</span>
    </div>
    ${showNet ? `
    <div class="totals-row">
      <span class="totals-label">Net Total</span>
      <span class="totals-value net">${formatCurrency(quote.totalNet, quote.currency)}</span>
    </div>` : ""}
  </div>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-brand">
      Generated by <strong>SafeRef</strong> &mdash; Powered by SAMON AB, Gas Detection Systems
    </div>
    <div class="footer-validity">
      ${quote.expiresAt
        ? `This quote is valid until ${expiresDate}.`
        : "Please contact us for validity terms."
      }<br />
      Prices are in ${escHtml(quote.currency)} and exclude applicable taxes.
    </div>
  </footer>

</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
