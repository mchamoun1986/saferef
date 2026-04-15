// /api/products — GET (public) + POST/PUT/DELETE (admin)
// Product catalog: detectors, controllers, and accessories.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const family = searchParams.get('family');
    const search = searchParams.get('search');
    const discontinued = searchParams.get('discontinued');
    const gas = searchParams.get('gas');

    // Build Prisma where clause for filterable DB columns
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (family) where.family = family;
    if (discontinued === 'true') where.discontinued = true;
    if (discontinued === 'false') where.discontinued = false;

    let products = await prisma.product.findMany({
      where,
      orderBy: [{ family: 'asc' }, { code: 'asc' }],
    });

    // In-memory filters for JSON/text fields
    if (gas) {
      products = products.filter((p) => {
        try {
          const gases: string[] = JSON.parse(p.gas);
          return gases.includes(gas);
        } catch {
          return false;
        }
      });
    }

    const atex = searchParams.get('atex');
    const refs = searchParams.get('refs');
    const subCategory = searchParams.get('subCategory');
    const compatibleFamily = searchParams.get('compatibleFamily');

    if (atex === 'true') {
      products = products.filter((p) => p.atex === true);
    }

    if (refs) {
      products = products.filter((p) => {
        try {
          const r: string[] = JSON.parse(p.refs);
          return r.includes(refs);
        } catch {
          return false;
        }
      });
    }

    if (subCategory) {
      products = products.filter((p) => p.subCategory === subCategory);
    }

    if (compatibleFamily) {
      products = products.filter((p) => {
        try {
          const families: string[] = JSON.parse(p.compatibleFamilies);
          return families.includes('ALL') || families.includes(compatibleFamily);
        } catch {
          return false;
        }
      });
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q),
      );
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('[API] GET /products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!body.code || !body.name || !body.type || !body.family) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, type, family' },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[API] POST /products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Remove fields Prisma manages automatically
    delete rest.createdAt;
    delete rest.updatedAt;

    const product = await prisma.product.update({ where: { id }, data: rest });
    return NextResponse.json(product);
  } catch (error) {
    console.error('[API] PUT /products error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /products error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
