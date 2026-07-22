import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFile(path.join(root, p), 'utf8');

test('lecharge-core .mcp.json declares the Linear Streamable-HTTP server', async () => {
  const mcp = JSON.parse(await read('plugins/lecharge-core/.mcp.json'));
  const linear = mcp.mcpServers?.linear;
  assert.ok(linear, 'missing mcpServers.linear');
  assert.equal(linear.type, 'http');
  assert.equal(linear.url, 'https://mcp.linear.app/mcp');
});

test('plugin.json points mcpServers at .mcp.json', async () => {
  const manifest = JSON.parse(await read('plugins/lecharge-core/.claude-plugin/plugin.json'));
  assert.equal(manifest.mcpServers, './.mcp.json');
});

test('tracking SKILL.md has required frontmatter and no em dash', async () => {
  const md = await read('plugins/lecharge-core/skills/tracking/SKILL.md');
  assert.match(md, /^---[\s\S]*\bname:\s*tracking\b/m);
  assert.match(md, /\bdescription:/);
  assert.equal(md.includes('—'), false, 'em dash found in tracking SKILL.md');
});
