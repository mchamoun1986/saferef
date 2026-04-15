import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const ADMIN_SESSION_COOKIE = 'refcalc-admin-session';

// Secret for HMAC signing — MUST be set via SESSION_SECRET in production
function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('SESSION_SECRET environment variable is required in production');
  }
  return secret || 'refcalc-dev-secret-change-in-prod';
}
let _secret: string | undefined;
function secret(): string {
  if (!_secret) _secret = getSecret();
  return _secret;
}

/** Sign a payload with HMAC-SHA256 */
export function signSession(payload: { userId: string; role: string }): string {
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret()).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ data, signature })).toString('base64');
}

/** Verify and decode a signed session cookie */
export function verifySession(cookieValue: string): { userId: string; role: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(cookieValue, 'base64').toString());
    const { data, signature } = decoded;
    if (!data || !signature) return null;

    const expected = crypto.createHmac('sha256', secret()).update(data).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    const payload = JSON.parse(data);
    if (!payload.userId || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Middleware: require valid admin session */
export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifySession(session.value);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // authorized
}

/** Get current session role (returns null if not authenticated) */
export async function getSessionRole(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);
  if (!session?.value) return null;
  const payload = verifySession(session.value);
  return payload?.role || null;
}
