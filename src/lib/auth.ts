import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const SESSION_COOKIE = 'saferef-session';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export type Role = 'admin' | 'sales' | 'management';

export interface SessionPayload {
  role: Role;
  loggedInAt: number;
}

// ── Secret ──────────────────────────────────────────────────────────

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret === 'change-me-to-a-random-string')) {
    throw new Error('SESSION_SECRET environment variable must be set in production');
  }
  return secret || 'saferef-dev-secret-change-in-prod';
}
let _secret: string | undefined;
function secret(): string {
  if (!_secret) _secret = getSecret();
  return _secret;
}

// ── Sign / Verify ───────────────────────────────────────────────────

export function signSession(payload: SessionPayload): string {
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret()).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ data, signature })).toString('base64');
}

export function verifySession(cookieValue: string): SessionPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(cookieValue, 'base64').toString());
    const { data, signature } = decoded;
    if (!data || !signature) return null;

    const expected = crypto.createHmac('sha256', secret()).update(data).digest('hex');
    if (signature.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    const payload = JSON.parse(data);
    if (!payload.role || !['admin', 'sales', 'management'].includes(payload.role)) return null;
    if (typeof payload.loggedInAt !== 'number') return null;

    // Expiry check (7 days)
    if (Date.now() - payload.loggedInAt > SESSION_MAX_AGE * 1000) return null;

    return payload;
  } catch {
    return null;
  }
}

// ── Guards ──────────────────────────────────────────────────────────

/** Require one of the listed roles. Returns 401 response if not authorized. */
export async function requireRole(allowedRoles: Role[]): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifySession(session.value);
  if (!payload || !allowedRoles.includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}

/** Legacy alias for backward compat — equivalent to requireRole(['admin']) */
export async function requireAdmin(): Promise<NextResponse | null> {
  return requireRole(['admin']);
}

/** Get current session (server-side). Returns null if not authenticated. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;
  return verifySession(session.value);
}

/** Get current role only (returns null if not authenticated) */
export async function getSessionRole(): Promise<Role | null> {
  const session = await getSession();
  return session?.role ?? null;
}
