import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { SOURCE_DIR, TARGET_DIRS, FILES } from './design-config.mjs';

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

export async function checkSync() {
  const mismatches = [];
  for (const dir of TARGET_DIRS) {
    for (const f of FILES) {
      const src = path.join(SOURCE_DIR, f);
      if (!(await exists(src))) continue;
      const dst = path.join(dir, f);
      if (!(await exists(dst))) { mismatches.push(`missing: ${dst}`); continue; }
      // byte-compare so binary assets (e.g. a future PNG) never round-trip lossily
      const [a, b] = [await readFile(src), await readFile(dst)];
      if (!a.equals(b)) mismatches.push(`stale: ${dst}`);
    }
  }
  return { ok: mismatches.length === 0, mismatches };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { ok, mismatches } = await checkSync();
  if (!ok) {
    console.error('design drift detected:\n' + mismatches.map(m => '  ' + m).join('\n'));
    console.error('run `npm run sync` to fix.');
    process.exit(1);
  }
  console.log('design in sync');
}
