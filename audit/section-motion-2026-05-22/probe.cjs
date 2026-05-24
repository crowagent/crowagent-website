/**
 * Section Motion Choreography — runtime probe.
 *
 * For each of 7 pages × 2 viewports (1440 wide, 390 mobile):
 *   1. Open page at localhost:8092
 *   2. Wait for DOMContentLoaded + 200ms (lets GSAP register)
 *   3. Snapshot initial state of choreographed targets (above-fold ones —
 *      we expect autoAlpha 0 → 1, so opacity should start <1 on items
 *      *below* the viewport, and rise to 1 once scrolled to)
 *   4. Scroll page bottom → top via gsap timeline
 *   5. Wait 3000ms for all ScrollTrigger entries to fire
 *   6. Assert all target elements final opacity === 1 (no stuck/hidden state)
 *   7. Save full-page PNG to ./screens/<page>-<viewport>.png
 *   8. Emit JSON report
 *
 * Run from repo root:  node audit/section-motion-2026-05-22/probe.cjs
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8092';
const OUT_DIR = path.join(__dirname, 'screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { slug: 'index', url: '/' },
  { slug: 'crowmark', url: '/crowmark.html' },
  { slug: 'crowcyber', url: '/crowcyber.html' },
  { slug: 'crowcash', url: '/crowcash.html' },
  { slug: 'crowagent-core', url: '/crowagent-core.html' },
  { slug: 'crowesg', url: '/crowesg.html' },
  { slug: 'csrd', url: '/csrd.html' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

// Selectors that section-motion-choreography.js animates.
// All must finish at opacity 1 after we scroll the whole page.
const CHOREO_SELECTORS = [
  // homepage
  '.hp-jtbd-grid .hp-jtbd-path',
  '.hp-moat-terminal',
  '.hp-moat-fineprint',
  '.stats-grid .sc',
  'section[aria-label="Why this work matters"] .u-grid-3 > .sv-card',
  '.sectors-grid > *',
  '.sector-grid > *',
  '.trust .sv-card',
  '.triple-cta-section .triple-card',
  '.hp-cta-band',
  // product pages
  '.product-mockup-widget',
  '.hero-product .hero-visual',
  '.pw-sf21-grid .pw-sf21-card',
  '.hw-grid > .sv-card',
  '[data-section="related"] .f10-related-card',
  '[data-section="pricing-or-waitlist"] .sv-card',
  'section.cta-band',
  'section[data-section="cta-band"]',
];

async function probePage(page, slug, url, viewport) {
  const fullUrl = `${BASE}${url}`;
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

  await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
  // Wait for module to load + register
  await page.waitForTimeout(400);

  // Check module loaded
  const moduleLoaded = await page.evaluate(() => !!window.__caSectionMotionLoaded);
  const gsapPresent = await page.evaluate(() => !!window.gsap && !!window.ScrollTrigger);

  // Scroll through the whole page so every ScrollTrigger fires
  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(200, Math.floor(viewport.height * 0.6));
  for (let y = 0; y <= docHeight; y += step) {
    await page.evaluate((Y) => window.scrollTo(0, Y), y);
    await page.waitForTimeout(60);
  }
  // Final wait so all animations complete (max anim ~0.85s + 0.2s delay)
  await page.waitForTimeout(3000);
  // Back to top for clean screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  // Count visible animated targets per selector
  const targetReport = await page.evaluate((selectors) => {
    const result = {};
    selectors.forEach((sel) => {
      const els = Array.from(document.querySelectorAll(sel));
      if (els.length === 0) { result[sel] = { count: 0, allVisible: true }; return; }
      const hidden = els.filter((el) => {
        const cs = getComputedStyle(el);
        const op = parseFloat(cs.opacity);
        const vis = cs.visibility;
        return op < 0.95 || vis === 'hidden';
      });
      result[sel] = { count: els.length, hidden: hidden.length, allVisible: hidden.length === 0 };
    });
    return result;
  }, CHOREO_SELECTORS);

  // Save screenshot
  const shotPath = path.join(OUT_DIR, `${slug}-${viewport.name}.png`);
  await page.screenshot({ path: shotPath, fullPage: false });

  const stuckSelectors = Object.entries(targetReport)
    .filter(([, r]) => r.count > 0 && !r.allVisible)
    .map(([sel, r]) => `${sel} (${r.hidden}/${r.count} hidden)`);

  return {
    slug,
    viewport: viewport.name,
    url: fullUrl,
    moduleLoaded,
    gsapPresent,
    consoleErrors: consoleErrors.slice(0, 10),
    pageScrollHeight: docHeight,
    selectorsFound: Object.entries(targetReport)
      .filter(([, r]) => r.count > 0)
      .map(([sel, r]) => `${sel}=${r.count}`),
    stuckSelectors,
    screenshot: shotPath,
  };
}

(async () => {
  const browser = await chromium.launch();
  const reports = [];
  for (const v of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
    for (const p of PAGES) {
      const page = await ctx.newPage();
      try {
        const r = await probePage(page, p.slug, p.url, v);
        reports.push(r);
        const status = r.stuckSelectors.length === 0 && r.consoleErrors.length === 0 ? 'OK' : 'FAIL';
        console.log(`[${status}] ${p.slug} ${v.name} — module:${r.moduleLoaded} gsap:${r.gsapPresent} selectorsFound:${r.selectorsFound.length} stuck:${r.stuckSelectors.length} errors:${r.consoleErrors.length}`);
      } catch (err) {
        reports.push({ slug: p.slug, viewport: v.name, error: err.message });
        console.log(`[ERR] ${p.slug} ${v.name} — ${err.message}`);
      } finally {
        await page.close();
      }
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'probe-report.json'), JSON.stringify(reports, null, 2));
  const failures = reports.filter((r) => r.error || (r.stuckSelectors && r.stuckSelectors.length > 0) || (r.consoleErrors && r.consoleErrors.length > 0));
  console.log(`\n=== ${reports.length - failures.length}/${reports.length} pass ===`);
  if (failures.length) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log(JSON.stringify(f, null, 2)));
    process.exit(1);
  }
})();
