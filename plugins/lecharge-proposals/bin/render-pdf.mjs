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
