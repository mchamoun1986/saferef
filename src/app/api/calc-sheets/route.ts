// /api/calc-sheets — GET (list + detail) + POST (save) + PUT (update status) + DELETE
// Stores calculation sheets: client info, gas/app selection, zones, M1 results.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// ── Ref generation ────────────────────────────────────────────────────

async function generateRef(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DC-${year}-`;

  const existing = await prisma.calcSheet.findMany({
    where: { ref: { startsWith: prefix } },
    select: { ref: true },
    orderBy: { createdAt: 'desc' },
  });

  let maxSeq = 0;
  for (const sheet of existing) {
    const seq = parseInt(sheet.ref.slice(prefix.length), 10);
    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }

  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

// ── Helpers ───────────────────────────────────────────────────────────

function safeParse(json: string, fallback: unknown = null) {
  try { return JSON.parse(json); } catch { return fallback; }
}

function normalize(val: unknown, fallback: string): string {
  if (typeof val === 'string') return val;
  if (val !== null && val !== undefined) {
    try { return JSON.stringify(val); } catch { /* ignore */ }
  }
  return fallback;
}

// ── GET — list sheets OR detail by ?id= ──────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const detailId = searchParams.get('id');

    // ── Detail mode: return full sheet with parsed JSON ──
    if (detailId) {
      const sheet = await prisma.calcSheet.findUnique({ where: { id: detailId } });
      if (!sheet) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const client = safeParse(sheet.clientJson, {});
      const gasApp = safeParse(sheet.gasAppJson, {});
      const zones = safeParse(sheet.zonesJson, []);
      const result = safeParse(sheet.resultJson, {});

      return NextResponse.json({
        id: sheet.id,
        ref: sheet.ref,
        status: sheet.status,
        regulation: sheet.regulation,
        createdAt: sheet.createdAt,
        client,
        gasApp,
        zones,
        result,
      });
    }

    // ── List mode: return summaries ──
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const where = status ? { status } : {};

    const [sheets, total] = await Promise.all([
      prisma.calcSheet.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 200),
        skip: offset,
      }),
      prisma.calcSheet.count({ where }),
    ]);

    const summary = sheets.map((s) => {
      const client = safeParse(s.clientJson, {});
      const gasApp = safeParse(s.gasAppJson, {});
      const result = safeParse(s.resultJson, {});
      const zones = safeParse(s.zonesJson, []);

      const clientName = [client.firstName, client.lastName].filter(Boolean).join(' ');
      const clientDisplay = client.company
        ? (clientName ? `${clientName} (${client.company})` : client.company)
        : clientName;

      return {
        id: s.id,
        ref: s.ref,
        status: s.status,
        regulation: s.regulation,
        createdAt: s.createdAt,
        client: clientDisplay,
        projectName: client.projectName ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        refrigerant: gasApp.refrigerantId ? `${gasApp.refrigerantId} — ${gasApp.refrigerantName ?? ''}` : '',
        applicationId: gasApp.applicationId ?? '',
        totalDetectors: result.totalDetectors ?? 0,
        totalZones: result.totalZones ?? (Array.isArray(zones) ? zones.length : 0),
      };
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[API] GET /calc-sheets error:', error);
    return NextResponse.json({ error: 'Failed to fetch calculation sheets' }, { status: 500 });
  }
}

// ── POST — create sheet ───────────────────────────────────────────────

export async function POST(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { clientJson, gasAppJson, zonesJson, resultJson, status, regulation } = body;

    if (!zonesJson) {
      return NextResponse.json({ error: 'zonesJson is required' }, { status: 400 });
    }

    const ref = await generateRef();

    const sheet = await prisma.calcSheet.create({
      data: {
        ref,
        clientJson: normalize(clientJson, '{}'),
        gasAppJson: normalize(gasAppJson, '{}'),
        zonesJson: normalize(zonesJson, '[]'),
        resultJson: normalize(resultJson, '{}'),
        regulation: typeof regulation === 'string' ? regulation : 'en378',
        status: typeof status === 'string' ? status : 'draft',
      },
    });

    return NextResponse.json(sheet, { status: 201 });
  } catch (error) {
    console.error('[API] POST /calc-sheets error:', error);
    return NextResponse.json({ error: 'Failed to save calculation sheet' }, { status: 500 });
  }
}

// ── PUT — update sheet (status, fields) ───────────────────────────────

export async function PUT(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status, resultJson, zonesJson, clientJson, gasAppJson, regulation } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (typeof status === 'string') data.status = status;
    if (typeof regulation === 'string') data.regulation = regulation;
    if (resultJson !== undefined) data.resultJson = normalize(resultJson, '{}');
    if (zonesJson !== undefined) data.zonesJson = normalize(zonesJson, '[]');
    if (clientJson !== undefined) data.clientJson = normalize(clientJson, '{}');
    if (gasAppJson !== undefined) data.gasAppJson = normalize(gasAppJson, '{}');

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const sheet = await prisma.calcSheet.update({ where: { id }, data });
    return NextResponse.json(sheet);
  } catch (error) {
    console.error('[API] PUT /calc-sheets error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// ── DELETE — delete sheet ─────────────────────────────────────────────

export async function DELETE(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.calcSheet.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[API] DELETE /calc-sheets error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
