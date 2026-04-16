import { describe, it, expect, beforeAll } from 'vitest';
import { signSession, verifySession } from '../auth';

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-for-auth-tests';
});

describe('signSession / verifySession', () => {
  it('round-trips payload correctly', async () => {
    const payload = { role: 'admin' as const, loggedInAt: Date.now() };
    const signed = await signSession(payload);
    const verified = await verifySession(signed);
    expect(verified).toEqual(payload);
  });

  it('returns null for tampered signature', async () => {
    const signed = await signSession({ role: 'admin', loggedInAt: Date.now() });
    const decoded = JSON.parse(atob(signed));
    decoded.data = JSON.stringify({ role: 'sales', loggedInAt: Date.now() });
    const tampered = btoa(JSON.stringify(decoded));
    expect(await verifySession(tampered)).toBeNull();
  });

  it('returns null for invalid base64', async () => {
    expect(await verifySession('not-valid-base64-!!!')).toBeNull();
  });

  it('returns null for expired session (> 7 days)', async () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const signed = await signSession({ role: 'admin', loggedInAt: eightDaysAgo });
    expect(await verifySession(signed)).toBeNull();
  });

  it('returns null for invalid role value', async () => {
    // Craft manually-signed payload with invalid role
    const data = JSON.stringify({ role: 'superuser', loggedInAt: Date.now() });
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode('test-secret-for-auth-tests'),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const signature = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    const signed = btoa(JSON.stringify({ data, signature }));
    expect(await verifySession(signed)).toBeNull();
  });

  it('accepts all 3 valid roles', async () => {
    for (const role of ['admin', 'sales', 'management'] as const) {
      const signed = await signSession({ role, loggedInAt: Date.now() });
      const verified = await verifySession(signed);
      expect(verified?.role).toBe(role);
    }
  });

  it('returns null for missing role field', async () => {
    const data = JSON.stringify({ loggedInAt: Date.now() });
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode('test-secret-for-auth-tests'),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const signature = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    const signed = btoa(JSON.stringify({ data, signature }));
    expect(await verifySession(signed)).toBeNull();
  });
});
