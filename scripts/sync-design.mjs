import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { SOURCE_DIR, TARGET_DIRS, FILES } from './design-config.mjs';

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

export async function syncDesign() {
  let copied = 0;
  for (const dir of TARGET_DIRS) {
    await mkdir(dir, { recursive: true });
    for (const f of FILES) {
      const src = path.join(SOURCE_DIR, f);
      if (!(await exists(src))) continue; // source not authored yet
      await writeFile(path.join(dir, f), await readFile(src));
      copied++;
    }
  }
  return { copied };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { copied } = await syncDesign();
  console.log(`synced ${copied} file(s) into ${TARGET_DIRS.length} plugin(s)`);
}
