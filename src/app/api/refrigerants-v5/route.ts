// GET /api/refrigerants-v5 — public read-only list of refrigerants
// Used by the calculator to populate the refrigerant selector.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
