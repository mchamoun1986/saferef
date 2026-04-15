import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
