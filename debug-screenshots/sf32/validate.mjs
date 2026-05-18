// SF-32 validator: capture top-of-page screenshots for 6 pages, sectors section
// on index, console error report, and page-load timing. Saves to sf32/.
import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const BASE = 'http://localhost:8092';
const OUT = 'debug-screenshots/sf32';

const pages = [
  { slug: 'about',     path: '/about.html' },
  { slug: 'security',  path: '/security.html' },
  { slug: 'partners',  path: '/partners.html' },
  { slug: 'pricing',   path: '/pricing.html' },
  { slug: 'faq',       path: '/faq.html' },
  { slug: 'resources', path: '/resources.html' },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = {};

for (const p of pages) {
  consoleErrors[p.slug] = [];
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors[p.slug].push(msg.text());
  });
  page.on('pageerror', err => consoleErrors[p.slug].push('pageerror: ' + err.message));

  const url = BASE + p.path;
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(500);
  // Capture top-of-page (1440x900) — banner should be visible just under nav
  await page.screenshot({ path: `${OUT}/banner-top-${p.slug}.png`, fullPage: false });
  console.log(`[ok] ${p.slug} → banner-top-${p.slug}.png  errors=${consoleErrors[p.slug].length}`);
}

// Index page: sectors section + load timing
consoleErrors.index = [];
page.removeAllListeners('console');
page.removeAllListeners('pageerror');
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.index.push(msg.text()); });
page.on('pageerror', err => consoleErrors.index.push('pageerror: ' + err.message));

await page.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 30000 });
const timing = await page.evaluate(() => {
  const t = performance.timing;
  return t.loadEventEnd - t.navigationStart;
});
console.log(`[ok] index page-load timing = ${timing} ms`);

// Scroll to #sectors and wait for images
const sectorBox = await page.evaluate(() => {
  const el = document.getElementById('sectors');
  if (!el) return null;
  el.scrollIntoView({ block: 'start' });
  const rect = el.getBoundingClientRect();
  return { top: rect.top + window.scrollY, height: rect.height };
});
console.log('[info] #sectors found at top=' + (sectorBox?.top ?? 'null') + ' height=' + (sectorBox?.height ?? 'null'));
await page.waitForTimeout(2500); // allow lazy images to load (12 imgs)
// Force scroll position to the sector grid heading
if (sectorBox) {
  await page.evaluate((top) => window.scrollTo(0, top - 60), sectorBox.top);
  await page.waitForTimeout(800);
}
await page.screenshot({ path: `${OUT}/sectors-perf.png`, fullPage: false });
console.log(`[ok] sectors-perf.png saved`);

// Console errors summary
console.log('\n=== Console errors ===');
let anyErrors = false;
for (const [slug, errs] of Object.entries(consoleErrors)) {
  if (errs.length) {
    anyErrors = true;
    console.log(`  ${slug}:`);
    errs.forEach(e => console.log(`    - ${e}`));
  } else {
    console.log(`  ${slug}: 0`);
  }
}
console.log(anyErrors ? '\nSTATUS: console errors found' : '\nSTATUS: zero console errors');

await browser.close();
