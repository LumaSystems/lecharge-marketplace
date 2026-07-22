import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, rm, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const bin = path.join(here, '..', 'bin', 'render-pdf.mjs');

// Puppeteer is not bundled with the plugin; it installs on demand into a render
// cache. Mirror that here: ensure a cache home has puppeteer, then point the
// renderer at it via LECHARGE_RENDER_HOME (exactly as the skill does).
async function ensureRenderHome() {
  const home = process.env.LECHARGE_RENDER_HOME || path.join(os.homedir(), '.cache', 'lecharge-render');
  await mkdir(home, { recursive: true });
  try {
    await access(path.join(home, 'node_modules', 'puppeteer'));
  } catch {
    await run('npm', ['init', '-y'], { cwd: home });
    await run('npm', ['install', 'puppeteer'], { cwd: home });
  }
  return home;
}

test('render-pdf turns HTML into a non-empty PDF', async () => {
  const home = await ensureRenderHome();
  const html = path.join(here, 'fixture.local.html');
  const pdf = path.join(here, 'fixture.local.pdf');
  await writeFile(html, '<!doctype html><html lang="es"><body><h1>Hola LeCharge</h1></body></html>');
  await run('node', [bin, html, pdf], { env: { ...process.env, LECHARGE_RENDER_HOME: home } });
  const bytes = await readFile(pdf);
  assert.ok(bytes.length > 0);
  assert.equal(bytes.subarray(0, 5).toString('latin1'), '%PDF-');
  await rm(html); await rm(pdf);
});
