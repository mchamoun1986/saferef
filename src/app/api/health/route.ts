import { NextResponse } from 'next/server';

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const diag: Record<string, unknown> = {
    node: process.version,
    tursoUrl: tursoUrl ? tursoUrl.substring(0, 40) + '...' : 'MISSING',
    authToken: authToken ? `set (${authToken.length} chars)` : 'MISSING',
  };

  // Test direct libsql connection (bypass Prisma)
  try {
    const { createClient } = await import('@libsql/client');
    const httpUrl = tursoUrl?.replace('libsql://', 'https://') ?? '';
    const client = createClient({ url: httpUrl, authToken: authToken ?? '' });
    const result = await client.execute('SELECT COUNT(*) as c FROM Product');
    diag.libsqlDirect = { success: true, productCount: result.rows[0]?.c };
  } catch (e: any) {
    diag.libsqlDirect = { success: false, error: e.message, stack: e.stack?.split('\n').slice(0, 3) };
  }

  // Test Prisma connection
  try {
    const { prisma } = await import('@/lib/db');
    const count = await prisma.product.count();
    diag.prisma = { success: true, productCount: count };
  } catch (e: any) {
    diag.prisma = { success: false, error: e.message, stack: e.stack?.split('\n').slice(0, 3) };
  }

  return NextResponse.json(diag);
}
