import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

test('no em dash in any authored content file', async () => {
  // scoped to plugins/ + packages/ only, so test files (which legitimately contain the
  // character in their assertions) are never scanned
  const exts = new Set(['.md', '.html', '.css', '.json', '.svg', '.mjs']);
  const offenders = [];
  for await (const f of walk(path.join(root, 'plugins'))) {
    if (!exts.has(path.extname(f))) continue;
    if (f.includes('.local.')) continue;
    if ((await readFile(f, 'utf8')).includes('—')) offenders.push(f);
  }
  for await (const f of walk(path.join(root, 'packages'))) {
    if (!exts.has(path.extname(f))) continue;
    if (f.includes('.local.')) continue;
    if ((await readFile(f, 'utf8')).includes('—')) offenders.push(f);
  }
  assert.deepEqual(offenders, [], `em dash found in: ${offenders.join(', ')}`);
});
