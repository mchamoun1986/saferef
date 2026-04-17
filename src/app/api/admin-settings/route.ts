// GET /api/admin-settings — return login logs + current passwords
// POST /api/admin-settings — generate hash or change password

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ENV_PATH = join(process.cwd(), '.env.local');

function readEnvPasswords(): { admin: string; sales: string; management: string } {
  try {
    const lines = readFileSync(ENV_PATH, 'utf-8').split('\n');
    const extract = (role: string): string => {
      const prefix = `# ${role}:`;
      const line = lines.find(l => l.trimStart().startsWith(prefix));
      if (!line) return '(not set)';
      return line.substring(line.indexOf(prefix) + prefix.length).trim();
    };
    return {
      admin: extract('ADMIN'),
      sales: extract('SALES'),
      management: extract('MANAGEMENT'),
    };
  } catch {
    return { admin: '(unknown)', sales: '(unknown)', management: '(unknown)' };
  }
}

function updateEnvPassword(role: 'admin' | 'sales' | 'management', newPassword: string, newHash: string) {
  const content = readFileSync(ENV_PATH, 'utf-8');
  const lines = content.split('\n');
  const roleUpper = role.toUpperCase();
  const hashKey = `${roleUpper}_PASSWORD_HASH`;
  const commentPrefix = `# ${roleUpper}:`;

  const updated = lines.map(line => {
    // Update the comment line with the plaintext password
    if (line.trimStart().startsWith(commentPrefix)) {
      return `# ${roleUpper}:      ${newPassword}`;
    }
    // Update the hash line — escape $ for Next.js env parsing
    if (line.startsWith(hashKey + '=')) {
      const escaped = newHash.replace(/\$/g, '\\$');
      return `${hashKey}="${escaped}"`;
    }
    return line;
  });

  writeFileSync(ENV_PATH, updated.join('\n'), 'utf-8');
}

export async function GET() {
  const denied = await requireRole(['admin']);
  if (denied) return denied;

  try {
    const [logs, passwords] = await Promise.all([
      prisma.loginLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      Promise.resolve(readEnvPasswords()),
    ]);
    return NextResponse.json({ logs, passwords });
  } catch (error) {
    console.error('[API] GET /admin-settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireRole(['admin']);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { action, password, role } = body;

    if (action === 'generate-hash') {
      if (!password || typeof password !== 'string' || password.length < 4) {
        return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, 12);
      return NextResponse.json({ hash });
    }

    if (action === 'change-password') {
      if (!password || typeof password !== 'string' || password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      if (!['admin', 'sales', 'management'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, 12);
      updateEnvPassword(role, password, hash);
      return NextResponse.json({ success: true, message: `Password for ${role} updated. Restart the server for changes to take effect.` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[API] POST /admin-settings error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
