// GET /api/admin-settings — return recent login logs
// POST /api/admin-settings — generate bcrypt hash for a password

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const denied = await requireRole(['admin']);
  if (denied) return denied;

  try {
    const logs = await prisma.loginLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('[API] GET /admin-settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch login logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireRole(['admin']);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { action, password } = body;

    if (action === 'generate-hash') {
      if (!password || typeof password !== 'string' || password.length < 4) {
        return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, 12);
      return NextResponse.json({ hash });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[API] POST /admin-settings error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
