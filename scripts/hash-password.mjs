#!/usr/bin/env node
// Generate bcrypt hash for .env passwords
// Usage: node scripts/hash-password.mjs <password>

import bcrypt from 'bcryptjs';

const pwd = process.argv[2];
if (!pwd) {
  console.error('Usage: node scripts/hash-password.mjs <password>');
  process.exit(1);
}

const hash = await bcrypt.hash(pwd, 10);
const escaped = hash.replace(/\$/g, '\\$');
console.log('Raw hash:     ' + hash);
console.log('For .env:     "' + escaped + '"');
console.log('');
console.log('Paste the "For .env" line into .env.local');
