// Privacy page Playwright verification (1440 + 375).
// Run from project root: node debug-screenshots/privacy-verify.mjs
import { chromium } from 'playwright';

const URL = 'http://localhost:8092/privacy';

async function run(viewport, label) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`);
  });

  const resp = await page.goto(URL, { waitUntil: 'networkidle' });
  const status = resp.status();

  const h1Count = await page.locator('h1').count();
  const h2Ids = await page.$$eval('main h2[id]', (els) => els.map((e) => e.id));
  const ovCells = await page.locator('.privacy-overview-grid > .ov-cell').count();
  const callouts = await page.locator('.privacy-callout').count();
  const accordions = await page.locator('details.priv-accordion').count();
  const dpaCta = await page.locator('a.priv-cta[href*="DPA%20Request"]').count();
  const dpoCta = await page.locator('a.priv-cta[href*="DPO%20Enquiry"]').count();
  const stickyToc = await page.locator('aside.legal-toc').isVisible();

  // anchor verification: every TOC link target exists
  const tocLinks = await page.$$eval('aside.legal-toc a[href^="#"]', (as) =>
    as.map((a) => a.getAttribute('href').slice(1))
  );
  const missingTargets = [];
  for (const id of tocLinks) {
    const exists = await page.evaluate((id) => !!document.getElementById(id), id);
    if (!exists) missingTargets.push(id);
  }

  // sequential heading order check
  const headings = await page.$$eval('main h1, main h2, main h3', (els) =>
    els.map((e) => ({ tag: e.tagName, text: (e.textContent || '').trim().slice(0, 60) }))
  );
  let levelSequenceOk = true;
  let last = 1;
  for (const h of headings) {
    const lvl = parseInt(h.tag.slice(1), 10);
    if (lvl > last + 1) { levelSequenceOk = false; break; }
    last = lvl;
  }

  // scroll to mid + check is-active applied on a TOC link
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(500);
  const activeCount = await page.locator('aside.legal-toc a.is-active').count();

  await browser.close();

  console.log(`\n=== ${label} (${viewport.width}x${viewport.height}) ===`);
  console.log(`HTTP status        : ${status}`);
  console.log(`h1 count           : ${h1Count} ${h1Count === 1 ? 'OK' : 'FAIL'}`);
  console.log(`h2[id] count       : ${h2Ids.length}`);
  console.log(`overview cells     : ${ovCells} ${ovCells >= 6 ? 'OK' : 'FAIL'}`);
  console.log(`callouts           : ${callouts} ${callouts >= 3 ? 'OK' : 'FAIL'}`);
  console.log(`accordions         : ${accordions} ${accordions >= 3 ? 'OK' : 'FAIL'}`);
  console.log(`DPA CTA            : ${dpaCta} ${dpaCta >= 1 ? 'OK' : 'FAIL'}`);
  console.log(`DPO CTA            : ${dpoCta} ${dpoCta >= 1 ? 'OK' : 'FAIL'}`);
  console.log(`sticky TOC visible : ${stickyToc} ${(stickyToc || viewport.width < 1024) ? 'OK' : 'FAIL'}`);
  console.log(`broken anchors     : ${missingTargets.length} ${missingTargets.length === 0 ? 'OK' : 'FAIL: ' + missingTargets.join(',')}`);
  console.log(`heading sequence   : ${levelSequenceOk ? 'OK' : 'FAIL'}`);
  console.log(`scroll-spy active  : ${activeCount} ${(activeCount === 1 || viewport.width < 1024) ? 'OK' : 'WARN'}`);
  console.log(`console errors     : ${consoleErrors.length} ${consoleErrors.length === 0 ? 'OK' : 'FAIL'}`);
  if (consoleErrors.length) consoleErrors.forEach((e) => console.log('  -', e));
}

await run({ width: 1440, height: 900 }, 'desktop');
await run({ width: 375, height: 812 }, 'mobile');
