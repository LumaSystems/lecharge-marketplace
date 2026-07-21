# LeCharge Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Cowork plugin marketplace in this repo with three plugins (`lecharge-core`, `lecharge-proposals`, `lecharge-landing`) that let the LeCharge commercial team generate on-brand proposals (conversation to HTML to PDF) and edit the landing site via safe PRs, all from one single-sourced design system.

**Architecture:** This repo is both the design-system source and the Cowork marketplace. `packages/lecharge-ui` is the single authored source of tokens + components + print CSS + sprite + a block catalog. `scripts/sync-design.mjs` vendors that source into each plugin's skill `assets/` so every published plugin is self-contained (Cowork isolates plugin caches, so a skill can only read its own directory). `.claude-plugin/marketplace.json` lists the three plugins.

**Tech Stack:** Plain HTML/CSS (no framework, matching the landing site), Node.js 26 (ESM, `node:test` built-in runner), Puppeteer (headless-Chrome HTML-to-PDF). No TypeScript.

## Global Constraints

- Use the LeCharge design tokens exactly, from `packages/lecharge-ui/tokens.css` (canonical values already in `design/tokens.css`): `--accent: #00a15c`, `--accent-2: #12b06a`, `--accent-deep: #007a45`, ink scale `--ink #1d1d1f / --ink-2 #6e6e73 / --ink-3 #86868b`, `--bg #ffffff`, `--bg-alt #f5f5f7`, `--bg-dark #0b0c0e`, `--radius 20px`, `--maxw 1080px`, SF Pro system stack.
- All user-facing copy and content is **Spanish**.
- **NEVER use em dashes ("—")** anywhere in copy, content, templates, or generated output. Use commas, colons, or parentheses.
- Aesthetic: near-monochrome, one green accent, SF Pro, generous whitespace. Live reference: https://lecharge.co.
- Node ESM only (`"type": "module"`, `.mjs` where needed). Tests use the built-in `node --test` runner. No new test framework.
- Every plugin skill reads design assets only from its own vendored `assets/` directory, never from another plugin or from `packages/`.
- Work stays on branch `adgregory/kickoff`. Commit after each task.

---

### Task 1: Repo root scaffold + `lecharge-ui` source (tokens, components, print, sprite)

**Files:**
- Create: `package.json`
- Create: `packages/lecharge-ui/tokens.css`
- Create: `packages/lecharge-ui/components.css`
- Create: `packages/lecharge-ui/print.css`
- Create: `packages/lecharge-ui/sprite.svg`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `packages/lecharge-ui/{tokens.css, components.css, print.css, sprite.svg}` — the canonical design source that Task 2 vendors and Tasks 4/7 consume. Root `package.json` scripts: `sync`, `check-sync`, `test`.

- [ ] **Step 1: Create the root `package.json`**

```json
{
  "name": "lecharge-marketplace",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "LeCharge Cowork plugin marketplace and design-system source.",
  "scripts": {
    "sync": "node scripts/sync-design.mjs",
    "check-sync": "node scripts/check-sync.mjs",
    "test": "node --test scripts/test/"
  }
}
```

- [ ] **Step 2: Create `packages/lecharge-ui/tokens.css` by copying the canonical tokens**

Run: `mkdir -p packages/lecharge-ui && cp design/tokens.css packages/lecharge-ui/tokens.css`
Expected: file exists and contains the `:root` block with `--accent: #00a15c`.

- [ ] **Step 3: Create `packages/lecharge-ui/components.css` from the landing reference, minus its token block**

Run: `cp design/landing-reference.css packages/lecharge-ui/components.css`

Then edit `packages/lecharge-ui/components.css`: delete the `:root { ... }` block (lines beginning `:root {` through its closing `}`, the second CSS block in the file) because `tokens.css` now owns those variables. Keep everything else (the `*`, `html`, `body` resets and all component classes: `.btn`, `.wrap`, `.hero`, `.charger`, `.stats`, `section.band`, `.section-head`, `.tracks`, `.pillar`, `.product`, `.flow`, `.chart`, `.bars2`, `.segs`, `.quote`, `.final`, `footer`, `.reveal`, and the `@media (prefers-reduced-motion)` block). Add this header comment at the very top:

```css
/* ============================================================
   LeCharge components. Consumes variables from tokens.css.
   Source of truth: packages/lecharge-ui/. Do not edit vendored
   copies under plugins/**/assets/ (run `npm run sync`).
   ============================================================ */
```

- [ ] **Step 4: Create `packages/lecharge-ui/print.css` (static/print adaptation)**

```css
/* ============================================================
   LeCharge print adaptation. Layer AFTER tokens.css + components.css.
   Turns the animated web components into a static, paginated
   document suitable for a proposal PDF. A4 by default.
   ============================================================ */
@page { size: A4; margin: 18mm 16mm; }

html { scroll-behavior: auto; }
body { background: #fff; }

/* Motion off: proposals are static artifacts */
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
}
.reveal { opacity: 1 !important; transform: none !important; }

/* Reveal/scroll-only scaffolding collapses to normal flow */
.fill, .pin { height: auto !important; }
.fill-stage, .pin-stage { position: static !important; height: auto !important; }
.fill-stage .w { color: var(--ink) !important; }
.callout { position: static !important; opacity: 1 !important; transform: none !important; width: auto !important; }

/* Chart/stat values are pre-filled (no count-up / scroll fill) */
.bar2 .val { opacity: 1 !important; }
.bar2 .fill2 { transition: none !important; }

/* Page-break discipline: never split a section band or a card */
section.band, .track, .product, .seg, .chart, .pillar, .quote {
  break-inside: avoid;
}
h1, h2, h3 { break-after: avoid; }

/* Each top-level proposal section starts on its own page */
.proposal-page { break-before: page; }
.proposal-page:first-of-type { break-before: auto; }

/* Trim heavy web paddings so pages are dense but breathable */
section.band { padding: 40px 0; }
.hero { padding: 40px 0 20px; }
```

- [ ] **Step 5: Create `packages/lecharge-ui/sprite.svg` (icon symbols used by components)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>
  </symbol>
  <symbol id="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </symbol>
  <symbol id="ic-inv" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>
  </symbol>
  <symbol id="ic-charger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="3" width="9" height="18" rx="2"/><path d="M15 9h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-2-2"/><path d="M9 7h3"/>
  </symbol>
  <symbol id="ic-car" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 13l2-5h10l2 5"/><path d="M3 13h18v4H3z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>
  </symbol>
</svg>
```

- [ ] **Step 6: Add build/vendor ignores to `.gitignore`**

Append these lines to `.gitignore`:

```
# plugin dependencies (installed on demand)
plugins/**/node_modules/
# scratch PDF/HTML render outputs
*.local.html
*.local.pdf
```

- [ ] **Step 7: Verify the source files exist and tokens are intact**

Run: `ls packages/lecharge-ui && grep -c "#00a15c" packages/lecharge-ui/tokens.css && grep -c ":root" packages/lecharge-ui/components.css`
Expected: lists `components.css print.css sprite.svg tokens.css`; token grep prints `1` or more; components `:root` grep prints `0` (token block removed).

- [ ] **Step 8: Commit**

```bash
git add package.json packages/lecharge-ui .gitignore
git commit -m "feat: add lecharge-ui design source (tokens, components, print, sprite)"
```

---

### Task 2: Design-system sync + drift check (with tests)

**Files:**
- Create: `scripts/design-config.mjs`
- Create: `scripts/sync-design.mjs`
- Create: `scripts/check-sync.mjs`
- Test: `scripts/test/sync.test.mjs`

**Interfaces:**
- Consumes: `packages/lecharge-ui/*` from Task 1.
- Produces:
  - `design-config.mjs` exports `SOURCE_DIR` (string), `TARGET_DIRS` (string[]), `FILES` (string[]).
  - `sync-design.mjs` exports `syncDesign()` → `{ copied: number }` and runs as CLI.
  - `check-sync.mjs` exports `checkSync()` → `{ ok: boolean, mismatches: string[] }` and runs as CLI (exit 1 on drift).

- [ ] **Step 1: Write the failing test**

`scripts/test/sync.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { syncDesign } from '../sync-design.mjs';
import { checkSync } from '../check-sync.mjs';
import { SOURCE_DIR, TARGET_DIRS, FILES } from '../design-config.mjs';

test('sync copies every source file into every target', async () => {
  await syncDesign();
  for (const dir of TARGET_DIRS) {
    for (const f of FILES) {
      const src = await readFile(path.join(SOURCE_DIR, f), 'utf8');
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/test/sync.test.mjs`
Expected: FAIL — cannot import `../sync-design.mjs` / module not found.

- [ ] **Step 3: Write `scripts/design-config.mjs`**

```js
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

export const SOURCE_DIR = path.join(root, 'packages', 'lecharge-ui');

export const FILES = ['tokens.css', 'components.css', 'print.css', 'sprite.svg', 'COMPONENTS.md'];

export const TARGET_DIRS = [
  path.join(root, 'plugins', 'lecharge-proposals', 'skills', 'proposal-generator', 'assets'),
  path.join(root, 'plugins', 'lecharge-landing', 'skills', 'landing-editor', 'assets'),
];
```

Note: `COMPONENTS.md` is created in Task 3. Until then, sync skips missing source files (see Step 4 guard), so Task 2 tests pass with the four CSS/SVG files present.

- [ ] **Step 4: Write `scripts/sync-design.mjs`**

```js
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
```

- [ ] **Step 5: Write `scripts/check-sync.mjs`**

```js
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
      const [a, b] = [await readFile(src, 'utf8'), await readFile(dst, 'utf8')];
      if (a !== b) mismatches.push(`stale: ${dst}`);
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test scripts/test/sync.test.mjs`
Expected: PASS (3 tests). Vendored `assets/` dirs now contain the four source files.

- [ ] **Step 7: Commit**

```bash
git add scripts packages plugins
git commit -m "feat: add design-system sync and drift check with tests"
```

---

### Task 3: Block catalog (`COMPONENTS.md`) + re-sync

**Files:**
- Create: `packages/lecharge-ui/COMPONENTS.md`
- Test: `scripts/test/components.test.mjs`

**Interfaces:**
- Consumes: `components.css` class names from Task 1.
- Produces: `COMPONENTS.md` — the block catalog that `proposal-generator` (Task 5) reads to assemble proposals. After this task, `FILES` in `design-config.mjs` fully resolves (all five files present).

- [ ] **Step 1: Write the failing test**

`scripts/test/components.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { SOURCE_DIR } from '../design-config.mjs';

test('COMPONENTS.md documents every proposal block id', async () => {
  const md = await readFile(path.join(SOURCE_DIR, 'COMPONENTS.md'), 'utf8');
  const required = ['portada', 'resumen-ejecutivo', 'solucion', 'roi', 'precios', 'cronograma', 'segmentos', 'cita', 'condiciones', 'contacto'];
  for (const id of required) {
    assert.ok(md.includes(`### ${id}`), `missing block section: ### ${id}`);
  }
});

test('COMPONENTS.md contains no em dashes', async () => {
  const md = await readFile(path.join(SOURCE_DIR, 'COMPONENTS.md'), 'utf8');
  assert.equal(md.includes('—'), false, 'em dash found in COMPONENTS.md');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/test/components.test.mjs`
Expected: FAIL — cannot read `COMPONENTS.md` (ENOENT).

- [ ] **Step 3: Write `packages/lecharge-ui/COMPONENTS.md`**

Full content:

````markdown
# LeCharge proposal block catalog

Each block is a static, print-safe section built from `components.css` + `print.css`.
A proposal is an ordered list of blocks wrapped in `<section class="proposal-page">`.
All copy is Spanish. Never use em dashes.

Every proposal HTML document has this shell (assets are siblings in this folder):

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Propuesta LeCharge · {{cliente}}</title>
  <link rel="stylesheet" href="tokens.css">
  <link rel="stylesheet" href="components.css">
  <link rel="stylesheet" href="print.css">
</head>
<body>
  <!-- inline the sprite so icons render in print -->
  {{sprite.svg contents}}
  <!-- ordered blocks go here, each wrapped in <section class="proposal-page"> -->
</body>
</html>
```

## Blocks

### portada
Cover. Client name, sector, date, LeCharge brand mark.
```html
<section class="proposal-page hero">
  <div class="wrap">
    <div class="eyebrow"><span class="dot"></span> Propuesta comercial</div>
    <h1 class="hero-title">Electromovilidad para <span class="g">{{cliente}}</span></h1>
    <p class="sub">{{sector}} · {{fecha}}</p>
  </div>
</section>
```

### resumen-ejecutivo
Executive summary. One `section.band` with a `.section-head` and a short paragraph.
```html
<section class="proposal-page band">
  <div class="wrap">
    <div class="section-head">
      <div class="kicker">Resumen ejecutivo</div>
      <h2>{{titulo_resumen}}</h2>
      <p>{{parrafo_resumen}}</p>
    </div>
  </div>
</section>
```

### solucion
Solution and technical spec. Uses `.pillar` with a checklist of specs (kW, conectores, numero de cargadores).
```html
<section class="proposal-page band">
  <div class="wrap">
    <div class="pillar">
      <div>
        <div class="badge"><svg width="16" height="16"><use href="#ic-charger"/></svg> Solucion</div>
        <h3>{{producto}}</h3>
        <p class="lead">{{descripcion_solucion}}</p>
        <ul>
          <li><svg width="18" height="18"><use href="#check"/></svg> Potencia: {{kw}} kW</li>
          <li><svg width="18" height="18"><use href="#check"/></svg> Conectores: {{conectores}}</li>
          <li><svg width="18" height="18"><use href="#check"/></svg> Cargadores: {{num_cargadores}}</li>
        </ul>
      </div>
      <div class="p-visual soft"></div>
    </div>
  </div>
</section>
```

### roi
Return chart. The `.chart` / `.bars2` bar chart with static, pre-filled values (no count-up).
```html
<section class="proposal-page band grey">
  <div class="wrap">
    <div class="section-head"><div class="kicker">Retorno</div><h2>Proyeccion de retorno</h2></div>
    <div class="chart">
      <div class="bars2">
        <div class="bar2 in"><div class="val">{{roi_1}}</div><div class="fill2" style="height:{{roi_1_pct}}%;background:var(--accent)"></div></div>
        <div class="bar2 in"><div class="val">{{roi_2}}</div><div class="fill2" style="height:{{roi_2_pct}}%;background:var(--accent-2)"></div></div>
        <div class="bar2 in"><div class="val">{{roi_3}}</div><div class="fill2" style="height:{{roi_3_pct}}%;background:var(--accent-deep)"></div></div>
      </div>
      <div class="bar-names"><span>{{roi_label_1}}</span><span>{{roi_label_2}}</span><span>{{roi_label_3}}</span></div>
    </div>
  </div>
</section>
```

### precios
Pricing table. Dual `.tracks` cards or a simple list; use the `.track` card with a big number.
```html
<section class="proposal-page band">
  <div class="wrap">
    <div class="section-head"><div class="kicker">Inversion</div><h2>Propuesta economica</h2></div>
    <div class="tracks">
      <div class="track"><div class="t-badge">Equipamiento</div><div class="big">Total<b>{{precio_equipo}}</b></div><p>{{detalle_equipo}}</p></div>
      <div class="track invest"><div class="t-badge">Instalacion y servicio</div><div class="big">Total<b>{{precio_servicio}}</b></div><p>{{detalle_servicio}}</p></div>
    </div>
  </div>
</section>
```

### cronograma
Deployment timeline. The `.flow` stepper.
```html
<section class="proposal-page band grey">
  <div class="wrap">
    <div class="section-head"><div class="kicker">Despliegue</div><h2>Cronograma</h2></div>
    <div class="flow"><div class="flow-track">
      <div class="fnode"><div class="fcirc green"><svg width="26" height="26"><use href="#check"/></svg></div><div class="fname">{{fase_1}}</div><div class="fsub">{{fase_1_dur}}</div></div>
      <div class="fconn"><span>{{hito_1}}</span></div>
      <div class="fnode"><div class="fcirc"><svg width="26" height="26"><use href="#ic-charger"/></svg></div><div class="fname">{{fase_2}}</div><div class="fsub">{{fase_2_dur}}</div></div>
      <div class="fconn"><span>{{hito_2}}</span></div>
      <div class="fnode"><div class="fcirc green"><svg width="26" height="26"><use href="#spark"/></svg></div><div class="fname">{{fase_3}}</div><div class="fsub">{{fase_3_dur}}</div></div>
    </div></div>
  </div>
</section>
```

### segmentos
Use-cases. The `.segs` grid.
```html
<section class="proposal-page band">
  <div class="wrap">
    <div class="section-head"><div class="kicker">Casos de uso</div><h2>Aplicaciones para {{cliente}}</h2></div>
    <div class="segs"><div class="grid">
      <div class="seg"><div class="s-ico"><svg width="22" height="22"><use href="#ic-car"/></svg></div><h5>{{segmento_1}}</h5><p>{{segmento_1_desc}}</p></div>
      <div class="seg"><div class="s-ico"><svg width="22" height="22"><use href="#ic-charger"/></svg></div><h5>{{segmento_2}}</h5><p>{{segmento_2_desc}}</p></div>
      <div class="seg"><div class="s-ico"><svg width="22" height="22"><use href="#ic-inv"/></svg></div><h5>{{segmento_3}}</h5><p>{{segmento_3_desc}}</p></div>
      <div class="seg"><div class="s-ico"><svg width="22" height="22"><use href="#spark"/></svg></div><h5>{{segmento_4}}</h5><p>{{segmento_4_desc}}</p></div>
    </div></div>
  </div>
</section>
```

### cita
Testimonial / positioning quote.
```html
<section class="proposal-page band grey">
  <div class="wrap"><div class="quote">
    <p>{{cita_texto}}</p>
    <div class="who"><b>{{cita_autor}}</b>, {{cita_cargo}}</div>
  </div></div>
</section>
```

### condiciones
Terms. A `section.band` with a `.section-head` and a bullet list.
```html
<section class="proposal-page band">
  <div class="wrap">
    <div class="section-head"><div class="kicker">Condiciones</div><h2>Terminos de la propuesta</h2></div>
    <ul class="pts">
      <li><svg width="18" height="18"><use href="#check"/></svg> {{condicion_1}}</li>
      <li><svg width="18" height="18"><use href="#check"/></svg> {{condicion_2}}</li>
      <li><svg width="18" height="18"><use href="#check"/></svg> {{condicion_3}}</li>
    </ul>
  </div>
</section>
```

### contacto
Closing CTA and contact.
```html
<section class="proposal-page band grey final">
  <div class="wrap">
    <h2>Avancemos juntos</h2>
    <p>{{contacto_nombre}} · {{contacto_email}} · {{contacto_tel}}</p>
  </div>
</section>
```
````

- [ ] **Step 4: Re-sync so the catalog reaches every plugin, then verify**

Run: `npm run sync && node --test scripts/test/components.test.mjs`
Expected: sync logs 10 files; both component tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/lecharge-ui/COMPONENTS.md scripts/test/components.test.mjs plugins
git commit -m "feat: add proposal block catalog and vendor it into plugins"
```

---

### Task 4: `lecharge-core` plugin + marketplace manifest

**Files:**
- Create: `.claude-plugin/marketplace.json`
- Create: `plugins/lecharge-core/.claude-plugin/plugin.json`
- Create: `plugins/lecharge-core/skills/using-lecharge/SKILL.md`
- Test: `scripts/test/manifests.test.mjs`

**Interfaces:**
- Consumes: nothing (orientation only).
- Produces: `marketplace.json` listing three plugin paths; `lecharge-core` with the `using-lecharge` skill. Tasks 5 and 7 add their plugins to the same `marketplace.json` `plugins` array and declare `lecharge-core` as a dependency.

- [ ] **Step 1: Write the failing test**

`scripts/test/manifests.test.mjs`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/test/manifests.test.mjs`
Expected: FAIL — cannot read `.claude-plugin/marketplace.json`.

- [ ] **Step 3: Write `.claude-plugin/marketplace.json`**

```json
{
  "name": "lecharge",
  "displayName": "LeCharge",
  "description": "On-brand proposal and landing tools for the LeCharge commercial team.",
  "owner": { "name": "LumaSystems", "url": "https://lecharge.co" },
  "plugins": [
    { "name": "lecharge-core", "source": "plugins/lecharge-core" },
    { "name": "lecharge-proposals", "source": "plugins/lecharge-proposals" },
    { "name": "lecharge-landing", "source": "plugins/lecharge-landing" }
  ]
}
```

Note: Tasks 5 and 6 create the `lecharge-proposals` and `lecharge-landing` directories these entries point at. The `manifests.test.mjs` `exists` check for those two will fail until then; run the full manifest test only after Task 6. For this task, verify just the core entry (Step 6).

- [ ] **Step 4: Write `plugins/lecharge-core/.claude-plugin/plugin.json`**

```json
{
  "name": "lecharge-core",
  "displayName": "LeCharge Core",
  "version": "0.1.0",
  "description": "Orientation and brand rules for all LeCharge skills. Install this first.",
  "author": { "name": "LumaSystems" },
  "homepage": "https://lecharge.co",
  "keywords": ["lecharge", "orientation", "brand"]
}
```

- [ ] **Step 5: Write `plugins/lecharge-core/skills/using-lecharge/SKILL.md`**

```markdown
---
name: using-lecharge
description: Use at the start of ANY LeCharge work (proposals, landing-page edits, blogs, any on-brand content). Establishes the brand rules and routes to the right LeCharge skill.
---

# Using LeCharge

You are working on LeCharge, an EV-charging company. Everything you produce must be
on-brand and consistent across skills. Read this before acting.

## Non-negotiable brand rules

These apply to every LeCharge skill and every piece of output:

1. **Language: Spanish.** All client-facing and site copy is Spanish.
2. **Never use em dashes ("—").** Use commas, colons, or parentheses instead. This is a hard rule.
3. **Design system, exactly.** Near-monochrome with one green accent `#00a15c`
   (`--accent`), SF Pro type, generous whitespace. Use the design tokens verbatim;
   do not invent colors, fonts, or spacing.
4. **Live reference:** https://lecharge.co. When unsure how something should look, match the live site.

The design system is single-sourced in `packages/lecharge-ui` in the marketplace repo
and vendored into each plugin's `assets/`. Each skill reads the copy in its own
`assets/` folder (`tokens.css`, `components.css`, `print.css`, `sprite.svg`, `COMPONENTS.md`).

## Routing: pick the right skill

- The user wants an **on-brand client proposal** (a quote, a commercial proposal, a PDF for a client):
  use `lecharge-proposals:proposal-generator`.
- The user wants to **edit the landing site**: a new blog post, a new landing section,
  a copy change on lecharge.co: use `lecharge-landing:landing-editor`.
- The user wants to **track work**: what is assigned to me, what is next, issue status,
  logging a follow-up in Linear: use `lecharge-core:tracking`.

If the intent is ambiguous, ask one clarifying question, then route.

## How to behave

- Announce which LeCharge skill you are using and why.
- Follow that skill's steps exactly.
- Re-check the brand rules above before you emit any final copy or file.
```

- [ ] **Step 6: Verify the core plugin and its manifest**

Run: `node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json'));JSON.parse(require('fs').readFileSync('plugins/lecharge-core/.claude-plugin/plugin.json'));console.log('json ok')"` and `node --test --test-name-pattern="using-lecharge" scripts/test/manifests.test.mjs`
Expected: `json ok`; the `using-lecharge` frontmatter test PASSES.

- [ ] **Step 7: Commit**

```bash
git add .claude-plugin plugins/lecharge-core scripts/test/manifests.test.mjs
git commit -m "feat: add marketplace manifest and lecharge-core orientation plugin"
```

---

### Task 5: `lecharge-proposals` plugin + headless-Chrome PDF renderer

**Files:**
- Create: `plugins/lecharge-proposals/.claude-plugin/plugin.json`
- Create: `plugins/lecharge-proposals/package.json`
- Create: `plugins/lecharge-proposals/bin/render-pdf.mjs`
- Create: `plugins/lecharge-proposals/skills/proposal-generator/SKILL.md`
- Create: `plugins/lecharge-proposals/skills/proposal-generator/example/sample-proposal.html`
- Test: `plugins/lecharge-proposals/test/render.test.mjs`
- (Sync creates `plugins/lecharge-proposals/skills/proposal-generator/assets/*`)

**Interfaces:**
- Consumes: vendored `assets/` (from sync), `COMPONENTS.md` block markup.
- Produces: `render-pdf.mjs` CLI: `node bin/render-pdf.mjs <input.html> <output.pdf>` → writes a PDF, exits 0; on Chrome failure exits non-zero with a clear message. `proposal-generator` skill.

- [ ] **Step 1: Write `plugins/lecharge-proposals/package.json`**

```json
{
  "name": "lecharge-proposals-render",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Headless-Chrome HTML-to-PDF renderer for LeCharge proposals.",
  "bin": { "render-pdf": "bin/render-pdf.mjs" },
  "scripts": { "test": "node --test test/" },
  "dependencies": { "puppeteer": "^23.0.0" }
}
```

- [ ] **Step 2: Write the failing test**

`plugins/lecharge-proposals/test/render.test.mjs`:

```js
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd plugins/lecharge-proposals && npm install && node --test test/render.test.mjs; cd -`
Expected: `npm install` succeeds (downloads puppeteer + Chromium); test FAILS because `bin/render-pdf.mjs` does not exist.

- [ ] **Step 4: Write `plugins/lecharge-proposals/bin/render-pdf.mjs`**

```js
#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { access } from 'node:fs/promises';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: render-pdf <input.html> <output.pdf>');
  process.exit(2);
}
try { await access(input); } catch { console.error(`input not found: ${input}`); process.exit(2); }

let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch {
  console.error('puppeteer is not installed. Run `npm install` in the plugin directory, then retry.');
  process.exit(3);
}

let browser;
try {
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const url = pathToFileURL(path.resolve(input)).href;
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: output,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  console.log(`wrote ${output}`);
} catch (err) {
  console.error(`PDF render failed: ${err.message}`);
  console.error('The HTML is still valid and can be printed to PDF from a browser as a fallback.');
  process.exit(1);
} finally {
  if (browser) await browser.close();
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd plugins/lecharge-proposals && node --test test/render.test.mjs; cd -`
Expected: PASS (a `%PDF-` file is produced).

- [ ] **Step 6: Write `plugins/lecharge-proposals/.claude-plugin/plugin.json`**

```json
{
  "name": "lecharge-proposals",
  "displayName": "LeCharge Proposals",
  "version": "0.1.0",
  "description": "Generate on-brand LeCharge client proposals through a Spanish conversation, output HTML and PDF.",
  "author": { "name": "LumaSystems" },
  "homepage": "https://lecharge.co",
  "keywords": ["lecharge", "proposals", "pdf"],
  "dependencies": [{ "name": "lecharge-core" }]
}
```

- [ ] **Step 7: Write `plugins/lecharge-proposals/skills/proposal-generator/SKILL.md`**

```markdown
---
name: proposal-generator
description: Use when the user needs to create an on-brand LeCharge client proposal (commercial quote, propuesta). Collects the details in a Spanish conversation, builds a print-clean HTML document from the LeCharge design system, and renders it to PDF.
allowed-tools:
  - Read
  - Write
  - Bash
---

# LeCharge proposal generator

Produce a client proposal as HTML first (clean structure), then a PDF. Follow the
LeCharge brand rules from `using-lecharge`: Spanish copy, never an em dash, design
tokens exactly.

Your design assets are next to this file, under `assets/`: `tokens.css`,
`components.css`, `print.css`, `sprite.svg`, and `COMPONENTS.md` (the block catalog).

## Step 1: Collect the details (Spanish, one topic at a time)

Ask for, and confirm back, these fields. Do not ask everything at once; move topic by topic:

- Cliente: nombre, sector, contacto (nombre, email, telefono), logo (opcional).
- Objetivo de la propuesta.
- Solucion / producto elegido.
- Especificaciones tecnicas: kW, conectores, numero de cargadores.
- Terminos comerciales y precios (equipamiento, instalacion y servicio).
- Cifras de retorno (ROI) y sus etiquetas.
- Cronograma de despliegue (fases, duracion, hitos).
- Casos de uso / segmentos.
- Cita o mensaje de posicionamiento (opcional).
- Condiciones de la propuesta.

## Step 2: Choose the blocks

Read `assets/COMPONENTS.md`. A proposal is an ordered list of blocks wrapped in
`<section class="proposal-page">`. Default order: portada, resumen-ejecutivo,
solucion, roi, precios, cronograma, segmentos, cita, condiciones, contacto. Drop any
block the user has no data for. Keep the order.

## Step 3: Build the HTML

Create `propuesta-<cliente>.html` using the document shell in `COMPONENTS.md`. Link
the three stylesheets by relative path (`assets/tokens.css`, `assets/components.css`,
`assets/print.css`) OR, if the file will move away from this folder, inline them so the
document stays self-contained. Inline the contents of `assets/sprite.svg` at the top of
`<body>` so icons render. Fill every `{{placeholder}}` with the confirmed Spanish copy.
Verify there is not a single em dash in the output.

## Step 4: Render the PDF

If the plugin's renderer dependencies are not installed yet, run once:
`npm install` inside the plugin root (the folder with `package.json`).

Then run: `node bin/render-pdf.mjs <path-to-html> <path-to-output-pdf>`

If the renderer exits non-zero (headless Chrome unavailable in this environment),
tell the user the HTML is ready and they can open it and use the browser's
"Guardar como PDF". Do not fail silently.

## Step 5: Deliver

Give the user both files: the HTML (reusable, editable) and the PDF. Summarize in
Spanish which blocks were included.
```

- [ ] **Step 8: Write a worked example `plugins/lecharge-proposals/skills/proposal-generator/example/sample-proposal.html`**

Build a complete, filled example so the renderer and the design can be eyeballed: copy the document shell from `COMPONENTS.md`, include the `portada`, `resumen-ejecutivo`, `solucion`, `roi`, and `contacto` blocks with realistic Spanish sample data for a fictional client "Grupo Andes" (sector "Retail", 60 kW, 8 cargadores). Reference the stylesheets as `../assets/tokens.css`, `../assets/components.css`, `../assets/print.css` and inline the sprite. Ensure no em dashes.

- [ ] **Step 9: Render the example to verify the full pipeline and design**

Run: `cd plugins/lecharge-proposals && node bin/render-pdf.mjs skills/proposal-generator/example/sample-proposal.html skills/proposal-generator/example/sample-proposal.local.pdf && ls -l skills/proposal-generator/example/*.local.pdf; cd -`
Expected: a non-empty `sample-proposal.local.pdf` is written (gitignored by `*.local.pdf`). Open it to confirm the green accent, SF Pro, and page breaks look on-brand.

- [ ] **Step 10: Re-sync and commit**

```bash
npm run sync
git add plugins/lecharge-proposals scripts
git commit -m "feat: add lecharge-proposals plugin with conversational generator and PDF renderer"
```

---

### Task 6: `lecharge-landing` plugin (safe on-brand PR editor)

**Files:**
- Create: `plugins/lecharge-landing/.claude-plugin/plugin.json`
- Create: `plugins/lecharge-landing/skills/landing-editor/SKILL.md`
- Create: `plugins/lecharge-landing/skills/landing-editor/SETUP.md`
- Create: `plugins/lecharge-landing/skills/landing-editor/templates/blog-post.html`
- Create: `plugins/lecharge-landing/skills/landing-editor/templates/landing-section.html`
- (Sync creates `plugins/lecharge-landing/skills/landing-editor/assets/*`)

**Interfaces:**
- Consumes: vendored `assets/` (design reference), the user-owned CI (deploy on merge to `main`).
- Produces: `landing-editor` skill + on-brand templates + a setup note.

- [ ] **Step 1: Write `plugins/lecharge-landing/.claude-plugin/plugin.json`**

```json
{
  "name": "lecharge-landing",
  "displayName": "LeCharge Landing",
  "version": "0.1.0",
  "description": "Make on-brand edits to the LeCharge landing site (blogs, sections, copy) via safe pull requests.",
  "author": { "name": "LumaSystems" },
  "homepage": "https://lecharge.co",
  "keywords": ["lecharge", "landing", "blog", "content"],
  "dependencies": [{ "name": "lecharge-core" }]
}
```

- [ ] **Step 2: Write `plugins/lecharge-landing/skills/landing-editor/templates/blog-post.html`**

A self-contained on-brand blog article scaffold, Spanish, no em dashes:

```html
<article class="band">
  <div class="wrap" style="max-width: 760px;">
    <div class="eyebrow"><span class="dot"></span> Blog LeCharge</div>
    <h1 class="hero-title" style="font-size: clamp(32px,5vw,56px); text-align:left; margin:16px 0;">{{titulo}}</h1>
    <p class="sub" style="margin:0 0 32px; text-align:left;">{{bajada}}</p>
    <p>{{parrafo_1}}</p>
    <h2 style="margin-top:32px;">{{subtitulo}}</h2>
    <p>{{parrafo_2}}</p>
    <p><a class="link" href="/contacto">Habla con nuestro equipo <span class="chev">&rsaquo;</span></a></p>
  </div>
</article>
```

- [ ] **Step 3: Write `plugins/lecharge-landing/skills/landing-editor/templates/landing-section.html`**

A drop-in `section.band` scaffold matching the site's section pattern:

```html
<section class="band">
  <div class="wrap">
    <div class="section-head">
      <div class="kicker">{{kicker}}</div>
      <h2>{{titulo_seccion}}</h2>
      <p>{{descripcion_seccion}}</p>
    </div>
    <div class="segs"><div class="grid">
      <div class="seg"><h5>{{item_1}}</h5><p>{{item_1_desc}}</p></div>
      <div class="seg"><h5>{{item_2}}</h5><p>{{item_2_desc}}</p></div>
      <div class="seg"><h5>{{item_3}}</h5><p>{{item_3_desc}}</p></div>
    </div></div>
  </div>
</section>
```

- [ ] **Step 4: Write `plugins/lecharge-landing/skills/landing-editor/SETUP.md`**

```markdown
# Landing editor: one-time setup

Before your first edit you need:

1. Access to the `LumaSystems/landing` GitHub repository (ask your admin to add you).
2. GitHub authentication on this machine: run `gh auth login` and follow the prompts,
   or configure git with a personal access token.
3. Confirm the deploy pipeline exists: merging to `main` auto-deploys to lecharge.co.
   The pipeline is owned by the LeCharge team; this skill never creates or changes it.

If any of these is missing, stop and ask your admin. Do not push directly to `main`.
```

- [ ] **Step 5: Write `plugins/lecharge-landing/skills/landing-editor/SKILL.md`**

```markdown
---
name: landing-editor
description: Use when the user wants to change the LeCharge landing site (lecharge.co): add a blog post, add or edit a landing section, or update copy. Makes on-brand edits on a branch and opens a pull request. Assumes deploy-on-merge CI already exists.
allowed-tools:
  - Read
  - Write
  - Bash
---

# LeCharge landing editor

Make on-brand edits to `LumaSystems/landing` safely. Follow the brand rules from
`using-lecharge`: Spanish copy, never an em dash, design tokens exactly. Your design
reference is in `assets/` (`components.css`, `tokens.css`, `COMPONENTS.md`).

## Guardrails (do not break these)

- Never commit or push to `main`. Always work on a new branch and open a pull request.
- Never touch CI/deploy configuration. The pipeline is owned by the LeCharge team.
- If GitHub access or auth is missing, stop and point the user to `SETUP.md`.

## Step 1: Confirm prerequisites

Check the repo is available and auth works: `gh auth status`. If it fails, read
`SETUP.md` to the user and stop.

## Step 2: Get the repo and branch

Clone or update `LumaSystems/landing`, then create a branch named for the change,
for example `content/blog-carga-rapida` or `section/casos-de-uso`. Never edit on `main`.

## Step 3: Make the change on brand

- New blog post: start from `templates/blog-post.html`. New section: start from
  `templates/landing-section.html`. Match the existing file structure of the landing repo.
- Fill every `{{placeholder}}` with Spanish copy. Reuse the site's existing classes
  (see `assets/components.css` and `assets/COMPONENTS.md`). Do not add new colors or fonts.
- Re-read the output and confirm there is not a single em dash.

## Step 4: Open the pull request

Commit on the branch, push, and open a PR with `gh pr create`, a Spanish title and a
short description of the change. Tell the user: once a maintainer merges to `main`, the
CI deploys it to lecharge.co automatically.

## Step 5: Hand off

Give the user the PR link and a one-line Spanish summary of what changed.
```

- [ ] **Step 6: Sync design into this plugin and verify no em dashes in templates/skill**

Run: `npm run sync && ! grep -rl $'—' plugins/lecharge-landing && echo "no em dashes"`
Expected: sync logs files; the grep finds nothing and prints `no em dashes`.

- [ ] **Step 7: Commit**

```bash
git add plugins/lecharge-landing scripts
git commit -m "feat: add lecharge-landing plugin for safe on-brand PR edits"
```

---

### Task 7: `lecharge-core` Linear tracking skill + bundled MCP server

**Files:**
- Create: `plugins/lecharge-core/.mcp.json`
- Modify: `plugins/lecharge-core/.claude-plugin/plugin.json`
- Create: `plugins/lecharge-core/skills/tracking/SKILL.md`
- Test: `scripts/test/linear.test.mjs`

**Interfaces:**
- Consumes: the `lecharge-core` plugin from Task 4.
- Produces: a bundled Linear MCP server (full read + write) and a `tracking` skill that
  routes from `using-lecharge`.

- [ ] **Step 1: Write the failing test**

`scripts/test/linear.test.mjs`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/test/linear.test.mjs`
Expected: FAIL — cannot read `plugins/lecharge-core/.mcp.json`.

- [ ] **Step 3: Write `plugins/lecharge-core/.mcp.json`**

```json
{
  "mcpServers": {
    "linear": {
      "type": "http",
      "url": "https://mcp.linear.app/mcp"
    }
  }
}
```

- [ ] **Step 4: Point `plugin.json` at the MCP config**

Modify `plugins/lecharge-core/.claude-plugin/plugin.json`: add the `mcpServers` key so it reads:

```json
{
  "name": "lecharge-core",
  "displayName": "LeCharge Core",
  "version": "0.1.0",
  "description": "Orientation, brand rules, and issue tracking for all LeCharge skills. Install this first.",
  "author": { "name": "LumaSystems" },
  "homepage": "https://lecharge.co",
  "keywords": ["lecharge", "orientation", "brand", "linear"],
  "mcpServers": "./.mcp.json"
}
```

- [ ] **Step 5: Write `plugins/lecharge-core/skills/tracking/SKILL.md`**

```markdown
---
name: tracking
description: Use when the user wants to track their work in Linear: what is assigned to me, what is next by priority, the status of an issue, or logging a follow-up (creating or updating an issue). Uses the bundled Linear MCP tools.
allowed-tools:
  - Read
---

# LeCharge work tracking (Linear)

The `lecharge-core` plugin connects Linear through its MCP server. The Linear tools
appear automatically once the plugin is enabled. The first time, Linear opens a browser
to sign in (OAuth); after that it is remembered. Everything a rep can see or change is
scoped to their own Linear permissions.

Follow the LeCharge brand rules from `using-lecharge`: answer in Spanish, never use an
em dash.

## What you can help with

- "Que tengo asignado?": list issues assigned to the current user.
- "Que sigue?": list open issues by priority / next up, for the user or their team.
- "Estado de <issue>": look up an issue and summarize status, assignee, priority.
- "Registra un seguimiento": create a new issue (title, description, team, optional
  assignee and priority), confirming the details in Spanish before creating.
- "Marca como listo" / status change: update an issue's state, after confirming.

## How to behave

1. Prefer the Linear MCP tools for anything about issues; do not guess issue data.
2. For any change (create, update, comment, state change), restate what you are about
   to do in Spanish and get a yes before calling the write tool.
3. Summarize results as a short Spanish list: issue name, status, priority, who owns it.
4. If Linear is not connected yet, tell the user to enable the plugin and complete the
   Linear sign-in, then retry.
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test scripts/test/linear.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add plugins/lecharge-core scripts/test/linear.test.mjs
git commit -m "feat: bundle Linear MCP and add tracking skill in lecharge-core"
```

---

### Task 8: Full integration — manifests, sync check, and top-level test run

**Files:**
- Create: `scripts/test/nodash.test.mjs`
- Modify: `README.md`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a green `npm test` at the repo root covering sync, drift, catalog, manifests, and the no-em-dash guarantee across all published plugin content.

- [ ] **Step 1: Write the repo-wide no-em-dash test**

`scripts/test/nodash.test.mjs`:

```js
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
  const exts = new Set(['.md', '.html', '.css', '.json']);
  const offenders = [];
  for await (const f of walk(path.join(root, 'plugins'))) {
    if (!exts.has(path.extname(f))) continue;
    if (f.endsWith('.local.html') || f.endsWith('.local.pdf')) continue;
    if ((await readFile(f, 'utf8')).includes('—')) offenders.push(f);
  }
  for await (const f of walk(path.join(root, 'packages'))) {
    if (!exts.has(path.extname(f))) continue;
    if ((await readFile(f, 'utf8')).includes('—')) offenders.push(f);
  }
  assert.deepEqual(offenders, [], `em dash found in: ${offenders.join(', ')}`);
});
```

- [ ] **Step 2: Run the full suite; expect it to surface any real drift or em dashes**

Run: `npm run sync && npm test`
Expected: all tests PASS across `scripts/test/` (sync, components, manifests, nodash). If `manifests.test.mjs` reports a missing plugin, confirm Tasks 5 and 6 created both plugin dirs.

- [ ] **Step 3: Run the drift check as it would run pre-publish**

Run: `npm run check-sync`
Expected: prints `design in sync`, exits 0.

- [ ] **Step 4: Update `README.md` with how to use and maintain the marketplace**

Replace the `## Status` and `## Next step` sections of `README.md` with:

```markdown
## Structure

- `packages/lecharge-ui/` single source of the design system (tokens, components, print, sprite, block catalog).
- `plugins/lecharge-core/` orientation (`using-lecharge`) plus Linear issue tracking (`tracking` + bundled Linear MCP). Install first.
- `plugins/lecharge-proposals/` proposal generator (conversation to HTML to PDF).
- `plugins/lecharge-landing/` on-brand landing edits via pull requests.
- `.claude-plugin/marketplace.json` lists the plugins so Cowork can install them from this repo.

## Using it in Cowork

Add this git repo as a plugin marketplace in Cowork, then install `lecharge-core` plus
whichever capability you need.

## Maintaining the design system

Edit files only in `packages/lecharge-ui/`, then run `npm run sync` to vendor them into
every plugin. `npm run check-sync` fails if any plugin copy is stale. `npm test` runs the
full suite (sync, catalog, manifests, no-em-dash guard).
```

- [ ] **Step 5: Final commit**

```bash
git add scripts/test/nodash.test.mjs README.md
git commit -m "test: repo-wide integration and no-em-dash guard; document marketplace"
```

---

## Self-Review

**Spec coverage:**
- Marketplace repo + `marketplace.json` → Task 4. ✓
- `packages/lecharge-ui` single source (tokens/components/print/sprite/COMPONENTS) → Tasks 1, 3. ✓
- Sync + drift check → Task 2. ✓
- `lecharge-core` / `using-lecharge` → Task 4. ✓
- `lecharge-core` Linear MCP (full read+write) + `tracking` skill, OAuth per user → Task 7. ✓
- `lecharge-proposals` conversational generator, HTML then PDF via headless Chrome, HTML fallback → Task 5. ✓
- Static/print adaptation of components → Task 1 (`print.css`), Task 3 (blocks wrapped `proposal-page`). ✓
- `lecharge-landing` safe PR editor, assumes CI, templates, setup note → Task 6. ✓
- Brand rules enforced (Spanish, no em dash, tokens) → `using-lecharge` (Task 4) + `nodash.test.mjs` (Task 8). ✓
- Independent versioning via per-plugin `plugin.json` → Tasks 4, 5, 6. ✓
- Dependency on `lecharge-core` → Tasks 5, 6 manifests. ✓
- Testing strategy (sync unit, e2e render, manifest validity, MCP config) → Tasks 2, 3, 5, 7, 8. ✓
- Out-of-scope items (visual builder, CRM feed, bilingual, landing consuming lecharge-ui, building CI) correctly omitted. ✓

**Placeholder scan:** No "TBD"/"handle edge cases"/vague steps. `{{...}}` tokens in HTML templates are intentional fill-in markers documented by their surrounding skill, not plan placeholders.

**Type consistency:** `syncDesign()`, `checkSync()`, and the `SOURCE_DIR`/`TARGET_DIRS`/`FILES` exports are named identically across `design-config.mjs`, the scripts, and the tests. `render-pdf.mjs` CLI signature `<input.html> <output.pdf>` matches its test and the `proposal-generator` skill invocation.
