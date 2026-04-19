// /api/product-relations — stub (V2)
// ProductRelation model removed in V2 — compatibleWith field on Product replaces this.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([]);
}

export async function POST() {
  return NextResponse.json(
    { error: 'Product relations removed in V2. Use compatibleWith field on Product.' },
    { status: 410 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Product relations removed in V2.' },
    { status: 410 },
  );
}
