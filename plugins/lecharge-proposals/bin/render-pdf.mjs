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

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

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
