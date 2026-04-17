# Sales Module — Quotes Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full sales module with Quote management — DB model, CRUD API, PDF generation, sales dashboard, and "Save as Quote" flow from both the Selector and Configurator wizards.

**Architecture:** New `Quote` Prisma model storing client info, BOM lines (JSON), pricing, and status lifecycle (draft→sent→accepted→rejected). API at `/api/quotes` with CRUD + PDF endpoint. Sales pages at `/sales` (dashboard) and `/sales/quotes` (list + detail). Both Selector StepBOM and Configurator StepProducts get a "Save as Quote" button that POSTs to the API and redirects to the quote detail page.

**Tech Stack:** TypeScript, Next.js 16 (App Router), Prisma 7 + libSQL, Tailwind CSS, jsPDF (existing)

---

## File Structure

```
prisma/
  schema.prisma                          — ADD Quote model
  migrations/                            — new migration
  seed.ts                                — no change (no seed data for quotes)

src/app/api/quotes/
  route.ts                               — CREATE: GET (list) + POST (create)
src/app/api/quotes/[id]/
  route.ts                               — CREATE: GET (detail) + PUT (update) + DELETE
src/app/api/quote-pdf/[id]/
  route.ts                               — CREATE: GET → generates PDF bytes

src/app/sales/
  layout.tsx                             — CREATE: sales layout with nav
  page.tsx                               — CREATE: sales dashboard
src/app/sales/quotes/
  page.tsx                               — CREATE: quotes list
src/app/sales/quotes/[id]/
  page.tsx                               — CREATE: quote detail

src/app/admin/nav.tsx                    — MODIFY: add "Sales" link
src/components/selector/StepBOM.tsx      — MODIFY: add "Save as Quote" button
src/components/configurator/StepProducts.tsx — MODIFY: add "Save as Quote" button (if exists)
```

---

### Task 1: Quote Prisma Model + Migration

**Files:**
- Modify: `prisma/schema.prisma` — append Quote model after DiscountMatrix
- Run migration

- [ ] **Step 1: Add Quote model to schema**

Add this at the end of `prisma/schema.prisma`, after the `DiscountMatrix` model:

```prisma
model Quote {
  id            String   @id @default(cuid())
  ref           String   @unique
  status        String   @default("draft")    // "draft","sent","accepted","rejected"
  // Client
  clientName    String   @default("")
  clientEmail   String   @default("")
  clientCompany String   @default("")
  clientPhone   String   @default("")
  // Project
  projectName   String   @default("")
  projectRef    String   @default("")
  // Content
  bomJson       String   @default("[]")       // JSON: BOMLine[] — all lines with qty, prices
  zonesJson     String   @default("[]")       // JSON: zone summaries
  configJson    String   @default("{}")       // JSON: SelectorInput or gas/app context
  // Pricing
  totalGross    Float    @default(0)
  totalNet      Float    @default(0)
  customerGroup String   @default("")
  currency      String   @default("EUR")
  // Regulation (if from Designer)
  regulation    String?
  calcSheetRef  String?                        // link to CalcSheet.ref if generated from Designer
  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  expiresAt     DateTime?
}
```

- [ ] **Step 2: Run migration**

```bash
cd "C:/1- Marwan/Claude/18- DetectCalc"
npx prisma migrate dev --name add_quote_model
```

Expected: Migration created, `Quote` table exists in `detectcalc.db`.

- [ ] **Step 3: Verify with build**

```bash
npx prisma generate
npx next build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Quote model to Prisma schema"
```

---

### Task 2: Quotes API — List + Create

**Files:**
- Create: `src/app/api/quotes/route.ts`

- [ ] **Step 1: Create the quotes API route**

Create `src/app/api/quotes/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ── Ref generation ──────────────────────────────────────────────────
async function generateQuoteRef(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;

  const existing = await prisma.quote.findMany({
    where: { ref: { startsWith: prefix } },
    select: { ref: true },
    orderBy: { createdAt: 'desc' },
  });

  let maxSeq = 0;
  for (const q of existing) {
    const seq = parseInt(q.ref.slice(prefix.length), 10);
    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }

  return `${prefix}${(maxSeq + 1).toString().padStart(4, '0')}`;
}

function normalize(val: unknown, fallback: string): string {
  if (typeof val === 'string') return val;
  if (val !== null && val !== undefined) {
    try { return JSON.stringify(val); } catch { /* ignore */ }
  }
  return fallback;
}

// ── GET — list quotes ───────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const quotes = await prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.quote.count({ where });

    // If search param, filter in JS (SQLite doesn't have good LIKE on multiple cols)
    let filtered = quotes;
    if (search) {
      const q = search.toLowerCase();
      filtered = quotes.filter(
        (qt) =>
          qt.ref.toLowerCase().includes(q) ||
          qt.clientName.toLowerCase().includes(q) ||
          qt.clientCompany.toLowerCase().includes(q) ||
          qt.projectName.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ quotes: filtered, total });
  } catch (error) {
    console.error('[API] GET /quotes error:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

// ── POST — create quote ─────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientName, clientEmail, clientCompany, clientPhone,
      projectName, projectRef,
      bomJson, zonesJson, configJson,
      totalGross, totalNet, customerGroup, currency,
      regulation, calcSheetRef,
    } = body;

    const ref = await generateQuoteRef();

    // Default expiry: 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const quote = await prisma.quote.create({
      data: {
        ref,
        clientName: clientName ?? '',
        clientEmail: clientEmail ?? '',
        clientCompany: clientCompany ?? '',
        clientPhone: clientPhone ?? '',
        projectName: projectName ?? '',
        projectRef: projectRef ?? '',
        bomJson: normalize(bomJson, '[]'),
        zonesJson: normalize(zonesJson, '[]'),
        configJson: normalize(configJson, '{}'),
        totalGross: typeof totalGross === 'number' ? totalGross : 0,
        totalNet: typeof totalNet === 'number' ? totalNet : 0,
        customerGroup: customerGroup ?? '',
        currency: currency ?? 'EUR',
        regulation: regulation ?? null,
        calcSheetRef: calcSheetRef ?? null,
        expiresAt,
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('[API] POST /quotes error:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

Expected: Build succeeds, `/api/quotes` route listed.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/quotes/route.ts
git commit -m "feat: add quotes API — list + create endpoints"
```

---

### Task 3: Quotes API — Detail + Update + Delete

**Files:**
- Create: `src/app/api/quotes/[id]/route.ts`

- [ ] **Step 1: Create the detail/update/delete route**

Create `src/app/api/quotes/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function safeParse(json: string, fallback: unknown = null) {
  try { return JSON.parse(json); } catch { return fallback; }
}

// ── GET — quote detail ──────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await prisma.quote.findUnique({ where: { id } });

    if (!quote) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...quote,
      bom: safeParse(quote.bomJson, []),
      zones: safeParse(quote.zonesJson, []),
      config: safeParse(quote.configJson, {}),
    });
  } catch (error) {
    console.error('[API] GET /quotes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

// ── PUT — update quote ──────────────────────────────────────────────
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    const stringFields = [
      'status', 'clientName', 'clientEmail', 'clientCompany', 'clientPhone',
      'projectName', 'projectRef', 'customerGroup', 'currency',
    ];
    for (const f of stringFields) {
      if (typeof body[f] === 'string') data[f] = body[f];
    }
    if (typeof body.totalGross === 'number') data.totalGross = body.totalGross;
    if (typeof body.totalNet === 'number') data.totalNet = body.totalNet;
    if (body.bomJson !== undefined) {
      data.bomJson = typeof body.bomJson === 'string' ? body.bomJson : JSON.stringify(body.bomJson);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const quote = await prisma.quote.update({ where: { id }, data });
    return NextResponse.json(quote);
  } catch (error) {
    console.error('[API] PUT /quotes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }
}

// ── DELETE ───────────────────────────────────────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.quote.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[API] DELETE /quotes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

Expected: `/api/quotes/[id]` route listed.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/quotes/[id]/route.ts
git commit -m "feat: add quotes API — detail, update, delete endpoints"
```

---

### Task 4: Quote PDF API

**Files:**
- Create: `src/app/api/quote-pdf/[id]/route.ts`

- [ ] **Step 1: Create the PDF generation endpoint**

Create `src/app/api/quote-pdf/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function safeParse(json: string, fallback: unknown = null) {
  try { return JSON.parse(json); } catch { return fallback; }
}

interface BOMLine {
  code: string;
  name: string;
  type: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await prisma.quote.findUnique({ where: { id } });

    if (!quote) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const lines: BOMLine[] = safeParse(quote.bomJson, []) as BOMLine[];
    const zones = safeParse(quote.zonesJson, []) as Array<{ zoneName: string }>;

    const expiresStr = quote.expiresAt
      ? new Date(quote.expiresAt).toLocaleDateString('en-GB')
      : '—';

    // Build HTML for PDF
    const lineRows = lines
      .map(
        (l) =>
          `<tr>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;font-family:monospace;font-size:11px">${l.code}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px">${l.name}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${l.qty}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${l.unitPrice.toFixed(0)}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${l.lineTotal.toFixed(0)}</td>
          </tr>`
      )
      .join('\n');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Quote ${quote.ref}</title>
<style>
  body { font-family: Arial, sans-serif; color: #1a2332; margin: 40px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 3px solid #E63946; padding-bottom: 15px; }
  .brand { font-size: 28px; font-weight: 800; }
  .brand span { color: #E63946; }
  .meta { text-align: right; font-size: 12px; color: #666; }
  .meta strong { color: #1a2332; }
  .client-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
  .client-box h3 { margin: 0 0 8px; font-size: 14px; color: #16354B; }
  .client-box p { margin: 2px 0; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #16354B; color: white; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
  th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
  .totals { background: #16354B; color: white; border-radius: 8px; padding: 16px; text-align: right; }
  .totals .gross { font-size: 18px; font-weight: 700; }
  .totals .net { color: #A7C031; font-size: 16px; margin-top: 4px; }
  .footer { margin-top: 40px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
</style>
</head><body>

<div class="header">
  <div>
    <div class="brand"><span>Safe</span>Ref</div>
    <div style="font-size:12px;color:#6b8da5;margin-top:4px">Refrigerant Gas Detection</div>
  </div>
  <div class="meta">
    <p><strong>Quote:</strong> ${quote.ref}</p>
    <p><strong>Date:</strong> ${new Date(quote.createdAt).toLocaleDateString('en-GB')}</p>
    <p><strong>Valid until:</strong> ${expiresStr}</p>
    <p><strong>Status:</strong> ${quote.status.toUpperCase()}</p>
  </div>
</div>

<div class="client-box">
  <h3>Client</h3>
  <p><strong>${quote.clientName || '—'}</strong></p>
  ${quote.clientCompany ? `<p>${quote.clientCompany}</p>` : ''}
  ${quote.clientEmail ? `<p>${quote.clientEmail}</p>` : ''}
  ${quote.clientPhone ? `<p>${quote.clientPhone}</p>` : ''}
  ${quote.projectName ? `<p style="margin-top:8px"><strong>Project:</strong> ${quote.projectName}</p>` : ''}
  ${quote.projectRef ? `<p><strong>Ref:</strong> ${quote.projectRef}</p>` : ''}
</div>

<h3 style="color:#16354B;margin-bottom:8px">Bill of Materials</h3>
<table>
  <thead>
    <tr>
      <th>Code</th>
      <th>Product</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Unit (${quote.currency})</th>
      <th style="text-align:right">Total (${quote.currency})</th>
    </tr>
  </thead>
  <tbody>
    ${lineRows}
  </tbody>
</table>

<div class="totals">
  <div class="gross">Total: ${quote.totalGross.toFixed(2)} ${quote.currency}</div>
  ${quote.totalNet > 0 && quote.totalNet !== quote.totalGross
    ? `<div class="net">Net (${quote.customerGroup}): ${quote.totalNet.toFixed(2)} ${quote.currency}</div>`
    : ''
  }
</div>

<div class="footer">
  <p>This quote was generated by SafeRef — Powered by SAMON AB, Gas Detection Systems</p>
  <p>Prices are subject to change. This quote is valid for 30 days from the date of issue.</p>
</div>

</body></html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('[API] GET /quote-pdf/[id] error:', error);
    return NextResponse.json({ error: 'Failed to generate quote PDF' }, { status: 500 });
  }
}
```

Note: This returns HTML that can be printed to PDF via the browser's print dialog (Ctrl+P → Save as PDF). This is more reliable than server-side PDF generation and produces better results.

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/quote-pdf/
git commit -m "feat: add quote PDF API — HTML rendering for print-to-PDF"
```

---

### Task 5: Sales Layout + Dashboard

**Files:**
- Create: `src/app/sales/layout.tsx`
- Create: `src/app/sales/page.tsx`

- [ ] **Step 1: Create the sales layout**

Create `src/app/sales/layout.tsx`:

```tsx
import Link from 'next/link';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <nav className="bg-gradient-to-r from-[#16354B] to-[#1e4a6a] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#A7C031]">
        <a href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <span className="text-[#E63946] font-extrabold text-xl">Safe</span>
          <span className="text-white font-extrabold text-xl">Ref</span>
          <span className="ml-3 text-sm text-[#6b8da5]">Sales</span>
        </a>
        <div className="flex items-center gap-4">
          <Link href="/sales" className="text-sm text-gray-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/sales/quotes" className="text-sm text-gray-300 hover:text-white transition-colors">
            Quotes
          </Link>
          <Link href="/selector" className="text-sm text-[#A7C031] hover:text-white transition-colors">
            New Quote →
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create the sales dashboard**

Create `src/app/sales/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface QuoteSummary {
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

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function SalesDashboard() {
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quotes?limit=200')
      .then((r) => r.json())
      .then((data) => {
        setQuotes(data.quotes ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === 'draft').length,
    sent: quotes.filter((q) => q.status === 'sent').length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
    rejected: quotes.filter((q) => q.status === 'rejected').length,
    totalValue: quotes.reduce((s, q) => s + q.totalGross, 0),
    acceptedValue: quotes
      .filter((q) => q.status === 'accepted')
      .reduce((s, q) => s + q.totalGross, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#16354B]">Sales Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Quote overview and pipeline</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs uppercase text-gray-400 font-semibold">Total Quotes</p>
          <p className="text-3xl font-bold text-[#16354B] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs uppercase text-gray-400 font-semibold">Pending</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.draft + stats.sent}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs uppercase text-gray-400 font-semibold">Won</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-xs uppercase text-gray-400 font-semibold">Pipeline Value</p>
          <p className="text-3xl font-bold text-[#E63946] mt-1">
            {stats.totalValue.toLocaleString('en', { maximumFractionDigits: 0 })} EUR
          </p>
        </div>
      </div>

      {/* Recent quotes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[#16354B]">Recent Quotes</h2>
          <Link href="/sales/quotes" className="text-sm text-[#E63946] hover:underline">
            View all →
          </Link>
        </div>
        {quotes.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400">
            <p className="text-lg mb-2">No quotes yet</p>
            <Link href="/selector" className="text-[#A7C031] hover:underline text-sm">
              Create your first quote →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs uppercase text-gray-400">Ref</th>
                <th className="text-left px-5 py-3 text-xs uppercase text-gray-400">Client</th>
                <th className="text-left px-5 py-3 text-xs uppercase text-gray-400">Project</th>
                <th className="text-right px-5 py-3 text-xs uppercase text-gray-400">Total</th>
                <th className="text-center px-5 py-3 text-xs uppercase text-gray-400">Status</th>
                <th className="text-right px-5 py-3 text-xs uppercase text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {quotes.slice(0, 10).map((q) => (
                <tr key={q.id} className="border-t hover:bg-gray-50 cursor-pointer">
                  <td className="px-5 py-3">
                    <Link href={`/sales/quotes/${q.id}`} className="text-[#E63946] font-mono font-semibold hover:underline">
                      {q.ref}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium">{q.clientName || '—'}</div>
                    {q.clientCompany && <div className="text-xs text-gray-400">{q.clientCompany}</div>}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{q.projectName || '—'}</td>
                  <td className="px-5 py-3 text-right font-semibold">
                    {q.totalGross.toLocaleString('en', { maximumFractionDigits: 0 })} {q.currency}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[q.status] ?? 'bg-gray-100'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-400 text-xs">
                    {new Date(q.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npx next build 2>&1 | tail -8
```

Expected: `/sales` route listed.

- [ ] **Step 4: Commit**

```bash
git add src/app/sales/layout.tsx src/app/sales/page.tsx
git commit -m "feat: add sales layout + dashboard page"
```

---

### Task 6: Quotes List Page

**Files:**
- Create: `src/app/sales/quotes/page.tsx`

- [ ] **Step 1: Create the quotes list page**

Create `src/app/sales/quotes/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface QuoteRow {
  id: string;
  ref: string;
  status: string;
  clientName: string;
  clientCompany: string;
  projectName: string;
  totalGross: number;
  totalNet: number;
  customerGroup: string;
  currency: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUSES = ['', 'draft', 'sent', 'accepted', 'rejected'];

export default function QuotesListPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);

    fetch(`/api/quotes?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setQuotes(data.quotes ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [statusFilter, search]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#16354B]">All Quotes</h1>
        <Link
          href="/selector"
          className="bg-[#A7C031] text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#8fa828] transition-colors"
        >
          + New Quote
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search ref, client, project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-400">
          No quotes found.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs uppercase text-gray-400">Ref</th>
                <th className="text-left px-5 py-3 text-xs uppercase text-gray-400">Client</th>
                <th className="text-left px-5 py-3 text-xs uppercase text-gray-400">Project</th>
                <th className="text-right px-5 py-3 text-xs uppercase text-gray-400">Gross</th>
                <th className="text-right px-5 py-3 text-xs uppercase text-gray-400">Net</th>
                <th className="text-center px-5 py-3 text-xs uppercase text-gray-400">Status</th>
                <th className="text-right px-5 py-3 text-xs uppercase text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/sales/quotes/${q.id}`} className="text-[#E63946] font-mono font-semibold hover:underline">
                      {q.ref}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium">{q.clientName || '—'}</div>
                    {q.clientCompany && <div className="text-xs text-gray-400">{q.clientCompany}</div>}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{q.projectName || '—'}</td>
                  <td className="px-5 py-3 text-right font-semibold">
                    {q.totalGross.toLocaleString('en', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-5 py-3 text-right text-[#A7C031]">
                    {q.totalNet > 0 ? q.totalNet.toLocaleString('en', { maximumFractionDigits: 0 }) : '—'}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[q.status] ?? 'bg-gray-100'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-400 text-xs">
                    {new Date(q.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build + commit**

```bash
npx next build 2>&1 | tail -5
git add src/app/sales/quotes/page.tsx
git commit -m "feat: add quotes list page with search and status filter"
```

---

### Task 7: Quote Detail Page

**Files:**
- Create: `src/app/sales/quotes/[id]/page.tsx`

- [ ] **Step 1: Create quote detail page**

Create `src/app/sales/quotes/[id]/page.tsx`:

```tsx
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

interface BOMLine {
  code: string;
  name: string;
  type: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

interface QuoteDetail {
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
  bom: BOMLine[];
}

const STATUS_ACTIONS: Record<string, { label: string; next: string; color: string }[]> = {
  draft: [
    { label: 'Mark as Sent', next: 'sent', color: 'bg-blue-600 hover:bg-blue-700' },
  ],
  sent: [
    { label: 'Accept', next: 'accepted', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Reject', next: 'rejected', color: 'bg-red-600 hover:bg-red-700' },
  ],
  accepted: [],
  rejected: [
    { label: 'Reopen as Draft', next: 'draft', color: 'bg-gray-600 hover:bg-gray-700' },
  ],
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  function fetchQuote() {
    fetch(`/api/quotes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setQuote(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { fetchQuote(); }, [id]);

  async function updateStatus(newStatus: string) {
    await fetch(`/api/quotes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchQuote();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-red-500 text-lg">Quote not found</p>
        <Link href="/sales/quotes" className="text-[#E63946] hover:underline text-sm mt-4 inline-block">← Back to quotes</Link>
      </div>
    );
  }

  const actions = STATUS_ACTIONS[quote.status] ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/sales/quotes" className="text-sm text-gray-400 hover:text-gray-600 mb-2 inline-block">
            ← Back to quotes
          </Link>
          <h1 className="text-2xl font-bold text-[#16354B]">{quote.ref}</h1>
          <p className="text-sm text-gray-400 mt-1">
            Created {new Date(quote.createdAt).toLocaleDateString('en-GB')}
            {quote.expiresAt && ` · Valid until ${new Date(quote.expiresAt).toLocaleDateString('en-GB')}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[quote.status] ?? ''}`}>
            {quote.status.toUpperCase()}
          </span>
          <a
            href={`/api/quote-pdf/${quote.id}`}
            target="_blank"
            className="bg-[#16354B] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1e4a6a] transition-colors"
          >
            View PDF
          </a>
        </div>
      </div>

      {/* Client + Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="text-xs uppercase text-gray-400 font-semibold mb-3">Client</h3>
          <p className="font-semibold">{quote.clientName || '—'}</p>
          {quote.clientCompany && <p className="text-sm text-gray-500">{quote.clientCompany}</p>}
          {quote.clientEmail && <p className="text-sm text-gray-500">{quote.clientEmail}</p>}
          {quote.clientPhone && <p className="text-sm text-gray-500">{quote.clientPhone}</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="text-xs uppercase text-gray-400 font-semibold mb-3">Project</h3>
          <p className="font-semibold">{quote.projectName || '—'}</p>
          {quote.projectRef && <p className="text-sm text-gray-500">Ref: {quote.projectRef}</p>}
          {quote.regulation && <p className="text-sm text-gray-500">Regulation: {quote.regulation.toUpperCase()}</p>}
          {quote.calcSheetRef && <p className="text-sm text-gray-500">CalcSheet: {quote.calcSheetRef}</p>}
          {quote.customerGroup && <p className="text-sm text-gray-500">Customer group: {quote.customerGroup}</p>}
        </div>
      </div>

      {/* BOM Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
        <div className="bg-[#16354B] text-white px-5 py-3 font-semibold text-sm">Bill of Materials</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs uppercase text-gray-400">Code</th>
              <th className="text-left px-5 py-3 text-xs uppercase text-gray-400">Product</th>
              <th className="text-left px-5 py-3 text-xs uppercase text-gray-400">Type</th>
              <th className="text-center px-5 py-3 text-xs uppercase text-gray-400">Qty</th>
              <th className="text-right px-5 py-3 text-xs uppercase text-gray-400">Unit</th>
              <th className="text-right px-5 py-3 text-xs uppercase text-gray-400">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.bom.map((line, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-xs">{line.code}</td>
                <td className="px-5 py-3">{line.name}</td>
                <td className="px-5 py-3 text-gray-400 capitalize">{line.type}</td>
                <td className="px-5 py-3 text-center">{line.qty}</td>
                <td className="px-5 py-3 text-right">{line.unitPrice.toFixed(0)}</td>
                <td className="px-5 py-3 text-right font-semibold">{line.lineTotal.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-[#16354B] text-white rounded-xl p-6 mb-6">
        <div className="flex justify-between text-lg">
          <span>Total (Gross)</span>
          <span className="font-bold">{quote.totalGross.toFixed(2)} {quote.currency}</span>
        </div>
        {quote.totalNet > 0 && quote.totalNet !== quote.totalGross && (
          <div className="flex justify-between text-lg mt-2 text-[#A7C031]">
            <span>Total (Net — {quote.customerGroup})</span>
            <span className="font-bold">{quote.totalNet.toFixed(2)} {quote.currency}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex gap-3">
          {actions.map((a) => (
            <button
              key={a.next}
              onClick={() => updateStatus(a.next)}
              className={`${a.color} text-white font-semibold px-6 py-2.5 rounded-lg transition-colors`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build + commit**

```bash
npx next build 2>&1 | tail -5
git add src/app/sales/quotes/[id]/page.tsx
git commit -m "feat: add quote detail page with status actions and PDF link"
```

---

### Task 8: "Save as Quote" in Selector StepBOM

**Files:**
- Modify: `src/components/selector/StepBOM.tsx`
- Modify: `src/components/selector/SelectorWizard.tsx` (pass extra props)

- [ ] **Step 1: Add Save as Quote button to StepBOM**

In `src/components/selector/StepBOM.tsx`, add a "Save as Quote" button next to the existing "Download PDF" button. The button should:

1. Show a small modal/form for client name, email, company, project name
2. POST to `/api/quotes` with the BOM lines, totals, and client info
3. On success, redirect to `/sales/quotes/[id]`

Add these state variables and handler after the existing `handleDownloadPdf` callback (around line 112):

```typescript
const [showQuoteForm, setShowQuoteForm] = useState(false);
const [quoteForm, setQuoteForm] = useState({
  clientName: '', clientEmail: '', clientCompany: '', clientPhone: '', projectName: '', projectRef: '',
});
const [saving, setSaving] = useState(false);

const handleSaveQuote = useCallback(async () => {
  setSaving(true);
  try {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...quoteForm,
        bomJson: JSON.stringify(pricedLines),
        zonesJson: JSON.stringify(bom.zones.map(z => ({ zoneName: z.zoneName }))),
        configJson: JSON.stringify(selectorInput),
        totalGross: totalGross,
        totalNet: showNet ? totalNet : totalGross,
        customerGroup,
        currency: 'EUR',
      }),
    });
    const data = await res.json();
    if (data.id) {
      window.location.href = `/sales/quotes/${data.id}`;
    }
  } catch (e) {
    console.error('Failed to save quote:', e);
  } finally {
    setSaving(false);
  }
}, [quoteForm, pricedLines, bom.zones, selectorInput, totalGross, totalNet, showNet, customerGroup]);
```

Then in the JSX, replace the existing header div (the one with "Product Quote" h2 and "Download PDF" button) with:

```tsx
<div className="flex items-center justify-between">
  <h2 className="text-xl font-bold text-[#16354B]">Product Quote</h2>
  <div className="flex gap-2">
    <button
      onClick={() => setShowQuoteForm(true)}
      className="bg-[#A7C031] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#8fa828] transition-colors"
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

{showQuoteForm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
      <h3 className="text-lg font-bold text-[#16354B] mb-4">Save as Quote</h3>
      <div className="space-y-3">
        {(['clientName', 'clientEmail', 'clientCompany', 'clientPhone', 'projectName', 'projectRef'] as const).map((field) => (
          <div key={field}>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              {field.replace(/([A-Z])/g, ' $1').replace('client ', 'Client ').replace('project ', 'Project ')}
            </label>
            <input
              type={field === 'clientEmail' ? 'email' : 'text'}
              value={quoteForm[field]}
              onChange={(e) => setQuoteForm((p) => ({ ...p, [field]: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={() => setShowQuoteForm(false)}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveQuote}
          disabled={saving}
          className="bg-[#A7C031] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#8fa828] disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Quote'}
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 2: Verify build + commit**

```bash
npx next build 2>&1 | tail -5
git add src/components/selector/StepBOM.tsx
git commit -m "feat: add Save as Quote button to Selector StepBOM"
```

---

### Task 9: Add Sales link to Admin Nav + Homepage

**Files:**
- Modify: `src/app/admin/nav.tsx` — add Sales link
- Modify: `src/app/page.tsx` — add Sales link in homepage

- [ ] **Step 1: Add Sales link to admin nav**

In `src/app/admin/nav.tsx`, add to the `links` array after the Simulator entry:

```typescript
{ href: '/sales', label: 'Sales' },
```

- [ ] **Step 2: Add Sales link to homepage footer or nav**

In `src/app/page.tsx`, in the navbar section, add a Sales link next to Admin:

```tsx
<div className="flex items-center gap-4">
  <Link href="/sales" className="text-sm text-gray-300 hover:text-white transition-colors">
    Sales
  </Link>
  <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition-colors">
    Admin
  </Link>
</div>
```

Replace the existing single Admin link.

- [ ] **Step 3: Verify build + commit**

```bash
npx next build 2>&1 | tail -5
git add src/app/admin/nav.tsx src/app/page.tsx
git commit -m "feat: add Sales links to admin nav and homepage"
```

---

### Task 10: Final Verification + Push

- [ ] **Step 1: Run all tests**

```bash
cd "C:/1- Marwan/Claude/18- DetectCalc"
npx vitest run
```

Expected: All existing tests pass (64 tests).

- [ ] **Step 2: Full build**

```bash
npx next build 2>&1 | tail -15
```

Expected: All routes listed including `/sales`, `/sales/quotes`, `/sales/quotes/[id]`, `/api/quotes`, `/api/quotes/[id]`, `/api/quote-pdf/[id]`.

- [ ] **Step 3: Push**

```bash
git push origin master
```
