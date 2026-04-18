// /api/product-relations — GET (public) + POST/DELETE (admin)
// Manages accessory/controller relations between products used by the M2 selection engine.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromCode = searchParams.get('fromCode');
    const toCode = searchParams.get('toCode');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (fromCode) where.fromCode = fromCode;
    if (toCode) where.toCode = toCode;
    if (type) where.type = type;

    const relations = await prisma.productRelation.findMany({
      where,
      orderBy: [{ fromCode: 'asc' }, { type: 'asc' }, { priority: 'desc' }],
    });

    return NextResponse.json(relations);
  } catch (error) {
    console.error('[API] GET /product-relations error:', error);
    return NextResponse.json({ error: 'Failed to fetch product relations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireRole(['admin', 'management']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { fromCode, toCode, type, mandatory, qtyRule, condition, reason, priority } = body;

    if (!fromCode || !toCode || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: fromCode, toCode, type' },
        { status: 400 },
      );
    }

    const relation = await prisma.productRelation.upsert({
      where: {
        fromCode_toCode_type: { fromCode, toCode, type },
      },
      update: {
        mandatory: mandatory ?? false,
        qtyRule: qtyRule ?? 'per_detector',
        condition: condition ?? null,
        reason: reason ?? null,
        priority: priority ?? 0,
      },
      create: {
        fromCode,
        toCode,
        type,
        mandatory: mandatory ?? false,
        qtyRule: qtyRule ?? 'per_detector',
        condition: condition ?? null,
        reason: reason ?? null,
        priority: priority ?? 0,
      },
    });

    return NextResponse.json(relation, { status: 201 });
  } catch (error) {
    console.error('[API] POST /product-relations error:', error);
    return NextResponse.json({ error: 'Failed to upsert product relation' }, { status: 500 });
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

    await prisma.productRelation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /product-relations error:', error);
    return NextResponse.json({ error: 'Failed to delete product relation' }, { status: 500 });
  }
}
