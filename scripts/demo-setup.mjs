// Creates .env for the local demo from .env.demo.example (see DEMO.md).
// Never overwrites an existing .env.

import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

if (existsSync('.env')) {
  console.log('.env already exists - left unchanged. Delete it first to start over.');
  process.exit(0);
}
copyFileSync('.env.demo.example', '.env');
const key = randomBytes(32).toString('hex');
writeFileSync('.env', readFileSync('.env', 'utf8').replace('CREDENTIAL_ENCRYPTION_KEY=""', `CREDENTIAL_ENCRYPTION_KEY="${key}"`));
console.log('Created .env for the local demo (database: Docker PostgreSQL, sign-in: off).');
console.log('Next: docker compose up -d, then npm run demo:db, then npm run dev');
