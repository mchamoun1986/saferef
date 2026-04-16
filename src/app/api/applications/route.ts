// /api/applications — GET (public) + POST/PUT/DELETE (admin)
// Applications define the installation context (supermarket, cold room, etc.)
// and carry M1 regulatory defaults used to pre-fill the calculator.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const apps = await prisma.application.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(apps);
  } catch (error) {
    console.error('[API] GET /applications error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.id || !body.labelFr || !body.labelEn) {
      return NextResponse.json(
        { error: 'Missing required fields: id, labelFr, labelEn' },
        { status: 400 },
      );
    }

    // Serialize JSON array/object fields before storing
    const data = {
      ...body,
      productFamilies: Array.isArray(body.productFamilies)
        ? JSON.stringify(body.productFamilies)
        : body.productFamilies ?? '[]',
      defaultRanges:
        typeof body.defaultRanges === 'object' && body.defaultRanges !== null
          ? JSON.stringify(body.defaultRanges)
          : body.defaultRanges ?? '{}',
      suggestedGases: Array.isArray(body.suggestedGases)
        ? JSON.stringify(body.suggestedGases)
        : body.suggestedGases ?? '[]',
    };

    const app = await prisma.application.create({ data });
    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error('[API] POST /applications error:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
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

    // Serialize JSON array/object fields if provided as non-string
    if (rest.productFamilies !== undefined && Array.isArray(rest.productFamilies)) {
      rest.productFamilies = JSON.stringify(rest.productFamilies);
    }
    if (rest.defaultRanges !== undefined && typeof rest.defaultRanges === 'object' && rest.defaultRanges !== null) {
      rest.defaultRanges = JSON.stringify(rest.defaultRanges);
    }
    if (rest.suggestedGases !== undefined && Array.isArray(rest.suggestedGases)) {
      rest.suggestedGases = JSON.stringify(rest.suggestedGases);
    }

    const app = await prisma.application.update({ where: { id }, data: rest });
    return NextResponse.json(app);
  } catch (error) {
    console.error('[API] PUT /applications error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
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

    await prisma.application.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /applications error:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
