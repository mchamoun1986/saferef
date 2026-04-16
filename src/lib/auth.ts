// Auth module — works in both Edge (middleware) and Node (API routes)
// Uses Web Crypto API (crypto.subtle) which is available in both runtimes.

import { NextResponse } from 'next/server';

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

// ── Web Crypto HMAC-SHA256 ─────────────────────────────────────────

const encoder = new TextEncoder();

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64(s: string): string {
  if (typeof btoa === 'function') return btoa(s);
  // Node fallback (shouldn't be needed since Edge has btoa)
  return Buffer.from(s, 'binary').toString('base64');
}

function fromBase64(s: string): string {
  if (typeof atob === 'function') return atob(s);
  return Buffer.from(s, 'base64').toString('binary');
}

// ── Sign / Verify ───────────────────────────────────────────────────

export async function signSession(payload: SessionPayload): Promise<string> {
  const data = JSON.stringify(payload);
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signature = bufToHex(sig);
  return toBase64(JSON.stringify({ data, signature }));
}

export async function verifySession(cookieValue: string): Promise<SessionPayload | null> {
  try {
    const decoded = JSON.parse(fromBase64(cookieValue));
    const { data, signature } = decoded;
    if (!data || !signature || typeof data !== 'string' || typeof signature !== 'string') return null;

    const key = await getKey();
    const expectedBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const expected = bufToHex(expectedBuf);

    // Constant-time comparison
    if (signature.length !== expected.length) return null;
    let mismatch = 0;
    for (let i = 0; i < signature.length; i++) {
      mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (mismatch !== 0) return null;

    const payload = JSON.parse(data);
    if (!payload.role || !['admin', 'sales', 'management'].includes(payload.role)) return null;
    if (typeof payload.loggedInAt !== 'number') return null;

    // Expiry check
    if (Date.now() - payload.loggedInAt > SESSION_MAX_AGE * 1000) return null;

    return payload;
  } catch {
    return null;
  }
}

// ── Guards (Node/server-only — use cookies() from next/headers) ────

/** Require one of the listed roles. Returns 401/403 response if not authorized. */
export async function requireRole(allowedRoles: Role[]): Promise<NextResponse | null> {
  // Dynamic import to avoid pulling next/headers into Edge bundle
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifySession(session.value);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!allowedRoles.includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}

/** Legacy alias for backward compat */
export async function requireAdmin(): Promise<NextResponse | null> {
  return requireRole(['admin']);
}

/** Get current session (server-side). */
export async function getSession(): Promise<SessionPayload | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;
  return verifySession(session.value);
}

export async function getSessionRole(): Promise<Role | null> {
  const session = await getSession();
  return session?.role ?? null;
}
