// GET /api/session — returns current user's role (or null)

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    role: session?.role ?? null,
    loggedInAt: session?.loggedInAt ?? null,
  });
}
