#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { access } from 'node:fs/promises';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: render-pdf <input.html> <output.pdf>');
  process.exit(2);
}
try { await access(input); } catch { console.error(`input not found: ${input}`); process.exit(2); }

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

// Puppeteer is NOT bundled with the plugin (that would make the plugin an npm
// package with a heavy Chromium dependency). It is installed on demand into a
// cache folder; the skill sets LECHARGE_RENDER_HOME to that folder. We also fall
// back to a normally-resolvable puppeteer for local development.
function loadPuppeteer() {
  const home = process.env.LECHARGE_RENDER_HOME;
  const candidates = [];
  if (home) candidates.push(path.join(home, 'node_modules', 'puppeteer'));
  candidates.push('puppeteer');
  for (const c of candidates) {
    try { const m = require(c); return m.default || m; } catch { /* try next */ }
  }
  return null;
}

// Many sandboxes (Cowork included) block Puppeteer's Chrome download but ship a
// preinstalled browser (e.g. /opt/pw-browsers/chromium...). Find it so the render
// works without downloading Chrome. Honor PUPPETEER_EXECUTABLE_PATH first.
function findChrome() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers', '/opt/playwright-browsers'].filter(Boolean);
  const names = new Set(['chrome', 'chromium', 'headless_shell', 'chrome-headless-shell']);
  const walk = (dir, depth) => {
    if (depth < 0) return null;
    let entries;
    try { entries = readdirSync(dir); } catch { return null; }
    for (const e of entries) {
      const full = path.join(dir, e);
      let st;
      try { st = statSync(full); } catch { continue; }
      if (st.isDirectory()) { const hit = walk(full, depth - 1); if (hit) return hit; }
      else if (names.has(e) && (st.mode & 0o111)) return full;
    }
    return null;
  };
  for (const r of roots) { const hit = walk(r, 5); if (hit) return hit; }
  const common = [
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  return common.find((p) => { try { return existsSync(p); } catch { return false; } }) || undefined;
}

const puppeteer = loadPuppeteer();
if (!puppeteer) {
  console.error('puppeteer is not available. Install it once into your render cache:');
  console.error('  RENDER_HOME="$HOME/.cache/lecharge-render"; mkdir -p "$RENDER_HOME"');
  console.error('  (cd "$RENDER_HOME" && npm init -y >/dev/null && npm install puppeteer)');
  console.error('then re-run with LECHARGE_RENDER_HOME="$RENDER_HOME".');
  console.error('The HTML is still valid and can be printed to PDF from a browser as a fallback.');
  process.exit(3);
}

let browser;
try {
  const executablePath = findChrome();
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(executablePath ? { executablePath } : {}),
  });
  const page = await browser.newPage();
  const url = pathToFileURL(path.resolve(input)).href;
  await page.goto(url, { waitUntil: 'networkidle0' });

  // preferCSSPageSize lets each chassis own its page geometry:
  // proposal-doc.css sets A4, proposal-deck.css sets 16:9 landscape.
  const opts = { path: output, printBackground: true, preferCSSPageSize: true };

  // A vertical document declares <meta name="lc-footer" content="..."> and gets a
  // native PDF footer (proposal title left, Confidencial + page number right) that
  // lives in the page margin and can never overlap content. Decks draw their own
  // in-canvas footer, so they omit the meta and get no native footer.
  const footerText = await page.$eval('meta[name="lc-footer"]', (el) => el.content).catch(() => null);
  if (footerText !== null) {
    opts.displayHeaderFooter = true;
    opts.headerTemplate = '<div></div>';
    opts.footerTemplate =
      '<div style="width:100%;font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
      'font-size:7pt;color:#86868b;padding:0 14mm;display:flex;justify-content:space-between;">' +
      `<span>${escapeHtml(footerText)}</span>` +
      '<span>Confidencial &nbsp;&middot;&nbsp; <span class="pageNumber"></span> / <span class="totalPages"></span></span>' +
      '</div>';
  }

  await page.pdf(opts);
  console.log(`wrote ${output}`);
} catch (err) {
  console.error(`PDF render failed: ${err.message}`);
  console.error('The HTML is still valid and can be printed to PDF from a browser as a fallback.');
  process.exit(1);
} finally {
  if (browser) await browser.close();
}
