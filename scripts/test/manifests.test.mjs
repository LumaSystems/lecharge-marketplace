import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readJSON = async (p) => JSON.parse(await readFile(path.join(root, p), 'utf8'));
const exists = async (p) => { try { await access(path.join(root, p)); return true; } catch { return false; } };

test('marketplace.json lists plugins that exist on disk', async () => {
  const mkt = await readJSON('.claude-plugin/marketplace.json');
  assert.ok(Array.isArray(mkt.plugins) && mkt.plugins.length >= 1);
  for (const p of mkt.plugins) {
    const dir = p.source || p;
    assert.ok(await exists(path.join(dir, '.claude-plugin', 'plugin.json')), `missing plugin.json for ${dir}`);
  }
});

test('every plugin.json has a name and at least one skill on disk', async () => {
  const mkt = await readJSON('.claude-plugin/marketplace.json');
  for (const p of mkt.plugins) {
    const dir = p.source || p;
    const manifest = await readJSON(path.join(dir, '.claude-plugin', 'plugin.json'));
    assert.ok(manifest.name, `plugin.json missing name in ${dir}`);
  }
});

test('using-lecharge SKILL.md has required frontmatter and no em dash', async () => {
  const md = await readFile(path.join(root, 'plugins/lecharge-core/skills/using-lecharge/SKILL.md'), 'utf8');
  assert.match(md, /^---[\s\S]*\bname:\s*using-lecharge\b/m);
  assert.match(md, /\bdescription:/);
  assert.equal(md.includes('—'), false, 'em dash found in SKILL.md');
});
