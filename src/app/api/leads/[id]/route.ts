// /api/leads/[id] — GET (auth) + PUT (public) + DELETE (admin only)
// Single lead operations: read, update progress, delete.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// Fields allowed for public PUT updates (step tracking from wizard)
const UPDATABLE_FIELDS = [
  'currentStep',
  'status',
  'application',
  'refrigerant',
  'preferredFamily',
  'voltage',
  'atex',
  'mountingType',
  'zonesJson',
  'totalDetectors',
  'resultJson',
  'quoteId',
  'quoteRef',
] as const;

// ── GET — single lead (auth required) ─────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['admin', 'sales', 'management']);
  if (authError) return authError;

  const { id } = await params;

  try {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('[API] GET /leads/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

// ── PUT — update lead (public, no auth — used for step tracking) ──────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Only allow updating specific fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};

    for (const field of UPDATABLE_FIELDS) {
      if (field in body) {
        const value = body[field];
        // Type-safe assignment based on field type
        if (field === 'currentStep' || field === 'totalDetectors') {
          data[field] = typeof value === 'number' ? value : parseInt(value, 10);
        } else if (field === 'atex') {
          data[field] = typeof value === 'boolean' ? value : value === true;
        } else if (field === 'zonesJson' || field === 'resultJson') {
          data[field] = typeof value === 'string' ? value : JSON.stringify(value);
        } else {
          data[field] = typeof value === 'string' ? value : String(value ?? '');
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const lead = await prisma.lead.update({ where: { id }, data });

    return NextResponse.json({ id: lead.id, currentStep: lead.currentStep });
  } catch (error: unknown) {
    console.error('[API] PUT /leads/[id] error:', error);
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('Record to update not found') || msg.includes('P2025')) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

// ── DELETE — remove lead (admin only) ─────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['admin']);
  if (authError) return authError;

  const { id } = await params;

  try {
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('[API] DELETE /leads/[id] error:', error);
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('Record to delete does not exist') || msg.includes('P2025')) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
