#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { access } from 'node:fs/promises';
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
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
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
