// /api/space-types — GET (public) + POST/PUT/DELETE (admin)
// Space types define physical space characteristics within an application
// (e.g. sales area, cold room, machinery room) with regulatory defaults.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const types = await prisma.spaceType.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error('[API] GET /space-types error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!body.id || !body.labelFr || !body.labelEn) {
      return NextResponse.json(
        { error: 'Missing required fields: id, labelFr, labelEn' },
        { status: 400 },
      );
    }

    const type = await prisma.spaceType.create({ data: body });
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    console.error('[API] POST /space-types error:', error);
    return NextResponse.json({ error: 'Failed to create space type' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const type = await prisma.spaceType.update({ where: { id }, data: rest });
    return NextResponse.json(type);
  } catch (error) {
    console.error('[API] PUT /space-types error:', error);
    return NextResponse.json({ error: 'Failed to update space type' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.spaceType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /space-types error:', error);
    return NextResponse.json({ error: 'Failed to delete space type' }, { status: 500 });
  }
}
