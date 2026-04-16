import { describe, it, expect, beforeAll } from 'vitest';
import { signSession, verifySession } from '../auth';

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-for-auth-tests';
});

describe('signSession / verifySession', () => {
  it('round-trips payload correctly', () => {
    const payload = { role: 'admin' as const, loggedInAt: Date.now() };
    const signed = signSession(payload);
    const verified = verifySession(signed);
    expect(verified).toEqual(payload);
  });

  it('returns null for tampered signature', () => {
    const signed = signSession({ role: 'admin', loggedInAt: Date.now() });
    // Decode, tamper with data, re-encode
    const decoded = JSON.parse(Buffer.from(signed, 'base64').toString());
    decoded.data = JSON.stringify({ role: 'sales', loggedInAt: Date.now() });
    const tampered = Buffer.from(JSON.stringify(decoded)).toString('base64');
    expect(verifySession(tampered)).toBeNull();
  });

  it('returns null for invalid base64', () => {
    expect(verifySession('not-valid-base64')).toBeNull();
  });

  it('returns null for expired session (> 7 days)', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const signed = signSession({ role: 'admin', loggedInAt: eightDaysAgo });
    expect(verifySession(signed)).toBeNull();
  });

  it('returns null for missing role', () => {
    // Manually craft invalid payload
    const crypto = require('crypto');
    const data = JSON.stringify({ loggedInAt: Date.now() });
    const signature = crypto.createHmac('sha256', 'test-secret-for-auth-tests').update(data).digest('hex');
    const signed = Buffer.from(JSON.stringify({ data, signature })).toString('base64');
    expect(verifySession(signed)).toBeNull();
  });

  it('returns null for invalid role value', () => {
    const crypto = require('crypto');
    const data = JSON.stringify({ role: 'superuser', loggedInAt: Date.now() });
    const signature = crypto.createHmac('sha256', 'test-secret-for-auth-tests').update(data).digest('hex');
    const signed = Buffer.from(JSON.stringify({ data, signature })).toString('base64');
    expect(verifySession(signed)).toBeNull();
  });

  it('accepts all 3 valid roles', () => {
    for (const role of ['admin', 'sales', 'management'] as const) {
      const signed = signSession({ role, loggedInAt: Date.now() });
      const verified = verifySession(signed);
      expect(verified?.role).toBe(role);
    }
  });
});
