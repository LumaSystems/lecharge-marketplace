import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const bin = path.join(here, '..', 'bin', 'render-pdf.mjs');

test('render-pdf turns HTML into a non-empty PDF', async () => {
  const html = path.join(here, 'fixture.local.html');
  const pdf = path.join(here, 'fixture.local.pdf');
  await writeFile(html, '<!doctype html><html lang="es"><body><h1>Hola LeCharge</h1></body></html>');
  await run('node', [bin, html, pdf]);
  const bytes = await readFile(pdf);
  assert.ok(bytes.length > 0);
  assert.equal(bytes.subarray(0, 5).toString('latin1'), '%PDF-');
  await rm(html); await rm(pdf);
});
