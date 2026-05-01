// /api/gas-categories — GET (public) + PUT/DELETE (admin)
// Gas categories group refrigerants by detection technology and coverage rules.
// Read-only for the calculator UI — admin can edit/delete via the admin Gas page.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const gasCategories = await prisma.gasCategory.findMany({
      orderBy: { nameEn: 'asc' },
    });
    return NextResponse.json(gasCategories);
  } catch (error) {
    console.error('[API] GET /gas-categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch gas categories' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = await requireRole(['admin']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const category = await prisma.gasCategory.update({ where: { id }, data: rest });
    return NextResponse.json(category);
  } catch (error) {
    console.error('[API] PUT /gas-categories error:', error);
    return NextResponse.json({ error: 'Failed to update gas category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireRole(['admin']);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.gasCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /gas-categories error:', error);
    return NextResponse.json({ error: 'Failed to delete gas category' }, { status: 500 });
  }
}
