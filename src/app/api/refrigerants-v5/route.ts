// /api/refrigerants-v5 — GET (public) + POST/PUT/DELETE (admin)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const refrigerants = await prisma.refrigerantV5.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(refrigerants);
  } catch (error) {
    console.error('[API] GET /refrigerants-v5 error:', error);
    return NextResponse.json({ error: 'Failed to fetch refrigerants' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const body = await request.json();
    if (!body.id || !body.name || !body.safetyClass) {
      return NextResponse.json({ error: 'Missing required fields: id, name, safetyClass' }, { status: 400 });
    }
    const ref = await prisma.refrigerantV5.create({ data: body });
    return NextResponse.json(ref, { status: 201 });
  } catch (error) {
    console.error('[API] POST /refrigerants-v5 error:', error);
    return NextResponse.json({ error: 'Failed to create refrigerant' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const ref = await prisma.refrigerantV5.update({ where: { id }, data: rest });
    return NextResponse.json(ref);
  } catch (error) {
    console.error('[API] PUT /refrigerants-v5 error:', error);
    return NextResponse.json({ error: 'Failed to update refrigerant' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await prisma.refrigerantV5.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /refrigerants-v5 error:', error);
    return NextResponse.json({ error: 'Failed to delete refrigerant' }, { status: 500 });
  }
}
