import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { syncDesign } from '../sync-design.mjs';
import { checkSync } from '../check-sync.mjs';
import { SOURCE_DIR, TARGET_DIRS, FILES } from '../design-config.mjs';

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

test('sync copies every source file into every target', async () => {
  await syncDesign();
  for (const dir of TARGET_DIRS) {
    for (const f of FILES) {
      const srcPath = path.join(SOURCE_DIR, f);
      if (!(await exists(srcPath))) continue; // not authored yet (e.g. COMPONENTS.md until Task 3)
      const src = await readFile(srcPath, 'utf8');
      const dst = await readFile(path.join(dir, f), 'utf8');
      assert.equal(dst, src, `${path.join(dir, f)} should match source`);
    }
  }
});

test('checkSync passes right after a sync', async () => {
  await syncDesign();
  const { ok, mismatches } = await checkSync();
  assert.equal(ok, true, `expected no drift, got: ${mismatches.join(', ')}`);
});

test('checkSync fails when a vendored file drifts', async () => {
  await syncDesign();
  const victim = path.join(TARGET_DIRS[0], FILES[0]);
  const original = await readFile(victim, 'utf8');
  await writeFile(victim, original + '\n/* drift */\n');
  const { ok, mismatches } = await checkSync();
  assert.equal(ok, false);
  assert.ok(mismatches.length > 0);
  await syncDesign(); // restore
});
