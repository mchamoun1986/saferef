// /api/quotes — GET (list) + POST (create)
// Stores quotes: client info, BOM, zones, pricing, regulation context.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// ── Ref generation ────────────────────────────────────────────────────

async function generateRef(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;

  const existing = await prisma.quote.findMany({
    where: { ref: { startsWith: prefix } },
    select: { ref: true },
    orderBy: { createdAt: 'desc' },
  });

  let maxSeq = 0;
  for (const quote of existing) {
    const seq = parseInt(quote.ref.slice(prefix.length), 10);
    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }

  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

// ── Helpers ───────────────────────────────────────────────────────────

function normalize(val: unknown, fallback: string): string {
  if (typeof val === 'string') return val;
  if (val !== null && val !== undefined) {
    try { return JSON.stringify(val); } catch { /* ignore */ }
  }
  return fallback;
}

// ── GET — list quotes ─────────────────────────────────────────────────

export async function GET(request: Request) {
  const authError = await requireRole(['admin', 'sales']);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase() ?? '';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const where = status ? { status } : {};

    // Fetch all matching status (search filtering done in JS due to SQLite LIKE limitations)
    const all = await prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Apply search filter in JS across multiple text fields
    const filtered = search
      ? all.filter((q) =>
          q.ref.toLowerCase().includes(search) ||
          q.clientName.toLowerCase().includes(search) ||
          q.clientCompany.toLowerCase().includes(search) ||
          q.projectName.toLowerCase().includes(search)
        )
      : all;

    const total = filtered.length;
    const quotes = filtered.slice(offset, offset + limit);

    return NextResponse.json({ quotes, total });
  } catch (error) {
    console.error('[API] GET /quotes error:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

// ── POST — create quote ───────────────────────────────────────────────

export async function POST(request: Request) {
  const authError = await requireRole(['admin', 'sales']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientCompany,
      clientPhone,
      projectName,
      projectRef,
      bomJson,
      zonesJson,
      configJson,
      totalGross,
      totalNet,
      customerGroup,
      currency,
      regulation,
      calcSheetRef,
    } = body;

    const ref = await generateRef();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const quote = await prisma.quote.create({
      data: {
        ref,
        status: 'draft',
        clientName: typeof clientName === 'string' ? clientName : '',
        clientEmail: typeof clientEmail === 'string' ? clientEmail : '',
        clientCompany: typeof clientCompany === 'string' ? clientCompany : '',
        clientPhone: typeof clientPhone === 'string' ? clientPhone : '',
        projectName: typeof projectName === 'string' ? projectName : '',
        projectRef: typeof projectRef === 'string' ? projectRef : '',
        bomJson: normalize(bomJson, '[]'),
        zonesJson: normalize(zonesJson, '[]'),
        configJson: normalize(configJson, '{}'),
        totalGross: typeof totalGross === 'number' ? totalGross : 0,
        totalNet: typeof totalNet === 'number' ? totalNet : 0,
        customerGroup: typeof customerGroup === 'string' ? customerGroup : '',
        currency: typeof currency === 'string' ? currency : 'EUR',
        regulation: typeof regulation === 'string' ? regulation : null,
        calcSheetRef: typeof calcSheetRef === 'string' ? calcSheetRef : null,
        expiresAt,
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('[API] POST /quotes error:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}
