import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { SOURCE_DIR } from '../design-config.mjs';

test('COMPONENTS.md documents every proposal block id', async () => {
  const md = await readFile(path.join(SOURCE_DIR, 'COMPONENTS.md'), 'utf8');
  const required = ['portada', 'resumen-ejecutivo', 'solucion', 'roi', 'precios', 'cronograma', 'segmentos', 'cita', 'condiciones', 'contacto'];
  for (const id of required) {
    // block headings live under the "Format A" section as `## <id>`
    assert.ok(new RegExp(`^#{2,3} ${id}\\b`, 'm').test(md), `missing block section: ## ${id}`);
  }
});

test('COMPONENTS.md documents both proposal formats', async () => {
  const md = await readFile(path.join(SOURCE_DIR, 'COMPONENTS.md'), 'utf8');
  assert.ok(md.includes('proposal-doc.css'), 'missing vertical document chassis reference');
  assert.ok(md.includes('proposal-deck.css'), 'missing landscape deck chassis reference');
});

test('COMPONENTS.md contains no em dashes', async () => {
  const md = await readFile(path.join(SOURCE_DIR, 'COMPONENTS.md'), 'utf8');
  assert.equal(md.includes('—'), false, 'em dash found in COMPONENTS.md');
});
