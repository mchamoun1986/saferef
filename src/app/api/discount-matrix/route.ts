// /api/discount-matrix — GET (public) + POST/PUT/DELETE (admin)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const rows = await prisma.discountMatrix.findMany({
      orderBy: [{ customerGroup: 'asc' }, { productGroup: 'asc' }],
    });
    return NextResponse.json(rows);
  } catch (error) {
    console.error('[API] GET /discount-matrix error:', error);
    return NextResponse.json({ error: 'Failed to fetch discount matrix' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    if (!body.customerGroup || !body.productGroup) {
      return NextResponse.json({ error: 'Missing customerGroup or productGroup' }, { status: 400 });
    }
    const row = await prisma.discountMatrix.create({
      data: {
        customerGroup: body.customerGroup,
        productGroup: body.productGroup,
        discountPct: typeof body.discountPct === 'number' ? body.discountPct : 0,
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error('[API] POST /discount-matrix error:', error);
    return NextResponse.json({ error: 'Failed to create discount rule' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const row = await prisma.discountMatrix.update({ where: { id }, data: rest });
    return NextResponse.json(row);
  } catch (error) {
    console.error('[API] PUT /discount-matrix error:', error);
    return NextResponse.json({ error: 'Failed to update discount rule' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await prisma.discountMatrix.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /discount-matrix error:', error);
    return NextResponse.json({ error: 'Failed to delete discount rule' }, { status: 500 });
  }
}
