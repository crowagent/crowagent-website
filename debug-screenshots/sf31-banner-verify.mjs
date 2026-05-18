// SF-31 page-abstract-banner verification at 1440x900.
// Captures the bottom of each page where the new decorative SVG banner sits.
// Run from project root: node debug-screenshots/sf31-banner-verify.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = 'http://localhost:8092';
const VIEWPORT = { width: 1440, height: 900 };

const PAGES = [
  { name: 'about',     url: '/about.html',     svg: 'about-abstract.svg' },
  { name: 'security',  url: '/security.html',  svg: 'security-abstract.svg' },
  { name: 'partners',  url: '/partners.html',  svg: 'partners-abstract.svg' },
  { name: 'pricing',   url: '/pricing.html',   svg: 'pricing-abstract.svg' },
  { name: 'faq',       url: '/faq.html',       svg: 'faq-abstract.svg' },
  { name: 'resources', url: '/resources.html', svg: 'resources-abstract.svg' },
];

const OUT_DIR = 'debug-screenshots/sf31';

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();

  const results = [];

  for (const p of PAGES) {
    const consoleErrors = [];
    const handlerPageErr = (e) => consoleErrors.push(`pageerror: ${e.message}`);
    const handlerConsole = (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`);
    };
    page.on('pageerror', handlerPageErr);
    page.on('console', handlerConsole);

    const resp = await page.goto(BASE + p.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    // Allow lazy images + observers to attach
    await page.waitForTimeout(800);
    const status = resp ? resp.status() : 0;

    // Scroll the abstract banner into view
    const bannerCount = await page.locator(`figure.page-abstract-banner img[src*="${p.svg}"]`).count();
    let dataLoaded = null, opacity = null, computedH = null, boxY = null;
    if (bannerCount > 0) {
      const sel = `figure.page-abstract-banner img[src*="${p.svg}"]`;
      await page.locator(sel).first().scrollIntoViewIfNeeded();
      // Wait for image decode + photo-fade-in.js to set data-loaded
      try { await page.locator(sel).first().waitFor({ state: 'visible', timeout: 5000 }); } catch (_) {}
      await page.waitForFunction(
        (s) => {
          const el = document.querySelector(s);
          if (!el) return false;
          return el.complete && el.naturalWidth > 0;
        },
        sel,
        { timeout: 5000 },
      ).catch(() => {});
      await page.waitForTimeout(900); // let fade transition complete
      const info = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { dataLoaded: el.dataset.loaded, opacity: cs.opacity, height: cs.height, y: r.top };
      }, sel);
      if (info) { dataLoaded = info.dataLoaded; opacity = info.opacity; computedH = info.height; boxY = info.y; }
    } else {
      // Fall back to scrolling to bottom of the page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
    }

    const outFile = `${OUT_DIR}/page-abstract-${p.name}.png`;
    await page.screenshot({ path: outFile, fullPage: false });

    results.push({
      page: p.name,
      status,
      bannerFound: bannerCount > 0,
      dataLoaded,
      opacity,
      height: computedH,
      y: boxY,
      consoleErrors: consoleErrors.length,
      errorList: consoleErrors,
    });

    page.off('pageerror', handlerPageErr);
    page.off('console', handlerConsole);
  }

  await browser.close();

  console.log('\nSF-31 banner verification results:');
  console.log('==================================');
  for (const r of results) {
    console.log(`${r.page.padEnd(10)} status=${r.status} banner=${r.bannerFound ? 'YES' : 'NO '} dataLoaded=${r.dataLoaded ?? '-'} opacity=${r.opacity ?? '-'} h=${r.height ?? '-'} y=${r.y?.toFixed?.(0) ?? '-'} consoleErrors=${r.consoleErrors}`);
    if (r.errorList.length > 0) {
      r.errorList.forEach((e) => console.log(`           ${e}`));
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
