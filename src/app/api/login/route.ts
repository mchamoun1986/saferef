// POST /api/login — role-based authentication
// Validates password against role-specific env hash. Returns signed session cookie.

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE, type Role } from '@/lib/auth';

const ROLE_ENV_VARS: Record<Role, string> = {
  admin: 'ADMIN_PASSWORD_HASH',
  sales: 'SALES_PASSWORD_HASH',
  management: 'MANAGEMENT_PASSWORD_HASH',
};

export async function POST(request: Request) {
  try {
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

    const hash = process.env[ROLE_ENV_VARS[role as Role]];
    if (!hash) {
      return NextResponse.json(
        { error: `${role} role not configured — set ${ROLE_ENV_VARS[role as Role]} in .env` },
        { status: 500 },
      );
    }

    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
