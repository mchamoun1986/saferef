// POST /api/login — admin authentication
// Validates email + password against AdminUser table (bcrypt hash).
// Returns a signed HMAC session cookie on success (8-hour lifetime).

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { ADMIN_SESSION_COOKIE, signSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 },
      );
    }

    // Basic input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      // Use generic message to avoid user enumeration
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Set signed session cookie
    const sessionValue = signSession({ userId: user.id, role: user.role });

    const response = NextResponse.json({
      success: true,
      name: user.name,
      role: user.role,
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[API] POST /login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
