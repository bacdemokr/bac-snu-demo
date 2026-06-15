// snu-map.mjs — open SNU campus map live via CDP and capture a screenshot.
// Usage: node scripts/snu-map.mjs ["optional place query"]
// Output: single JSON line {query,title,screenshot,error}
import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
const WORKSPACE = process.env.WORKSPACE || path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { chromium } = require(path.join(WORKSPACE, 'node_modules/playwright-core/index.js'));
const SHOT_DIR = process.env.SHOT_DIR || path.resolve(path.dirname(new URL(import.meta.url).pathname), '../app/public');

const query = process.argv[2] || '';
const shot = path.join(SHOT_DIR, 'snumap_shot.png');
const out = { query, title: '', screenshot: null, error: null };

try {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = browser.contexts()[0] || await browser.newContext();
  // Dedicated worker tab for the map; don't hijack the user's demo tab and
  // never drop page count to 0 (snap Chromium would quit).
  let page = ctx.pages().find(p => p.url().includes('map.snu.ac.kr'));
  if (!page) page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('https://map.snu.ac.kr/web/main.action', {
    waitUntil: 'domcontentloaded', timeout: 35000,
  });
  // map tiles need time to render
  await page.waitForTimeout(3000);
  out.title = await page.title();

  // If a place query is given, try typing it into the search box.
  if (query) {
    try {
      const box = await page.$('input[type="text"], input#searchKeyword, input[name*="keyword"]');
      if (box) {
        await box.click();
        await box.fill(query);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3500);
      }
    } catch (e) { /* best-effort search */ }
  }

  await page.screenshot({ path: shot });
  out.screenshot = '/snumap_shot.png';
  // Do NOT close the page or browser — keep the tab alive so Chromium stays up.
} catch (e) {
  out.error = String(e && e.message || e);
}
console.log(JSON.stringify(out));
process.exit(0);
