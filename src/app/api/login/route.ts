// POST /api/login — role-based authentication
// Validates password against role-specific env hash. Returns signed session cookie.
// Rate-limited to 5 attempts per IP per 15 minutes.

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE, type Role } from '@/lib/auth';
import { prisma } from '@/lib/db';

const ROLE_ENV_VARS: Record<Role, string> = {
  admin: 'ADMIN_PASSWORD_HASH',
  sales: 'SALES_PASSWORD_HASH',
  management: 'MANAGEMENT_PASSWORD_HASH',
};

// ── Rate limiting (in-memory, per-IP) ────────────────────────────────
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // max attempts per window
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// Clean up stale entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of attempts) {
    if (now > entry.resetAt) attempts.delete(ip);
  }
}, 30 * 60 * 1000).unref?.();

async function logLogin(role: string, success: boolean, request: Request) {
  try {
    await prisma.loginLog.create({
      data: {
        role,
        success,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });
  } catch (e) {
    console.error('[API] Login log failed:', e);
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { role, password } = body;

    if (!role || !password) {
      return NextResponse.json({ error: 'Role and password required' }, { status: 400 });
    }
    if (typeof role !== 'string' || !['admin', 'sales', 'management'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 4) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
    }

    const rawHash = process.env[ROLE_ENV_VARS[role as Role]];
    if (!rawHash) {
      console.error(`[Auth] Missing env var ${ROLE_ENV_VARS[role as Role]} for role ${role}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    // Vercel may mangle $ in env vars — restore bcrypt prefix if needed
    const hash = rawHash.startsWith('$2b$') || rawHash.startsWith('$2a$') ? rawHash : `$2b${rawHash.startsWith('$') ? '' : '$'}${rawHash}`;

    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      await logLogin(role, false, request);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await logLogin(role, true, request);

    const sessionValue = await signSession({ role: role as Role, loggedInAt: Date.now() });

    const response = NextResponse.json({ success: true, role });
    response.cookies.set(SESSION_COOKIE, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[API] POST /login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
