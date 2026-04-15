// /api/gas-categories — GET only (public)
// Gas categories group refrigerants by detection technology and coverage rules.
// Read-only for the calculator UI — admin management done directly via DB or seed.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
