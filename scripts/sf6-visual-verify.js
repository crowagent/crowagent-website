/**
 * SF-6 Visual Verification — 2026-05-17
 * Loads http://localhost:8092/, scrolls through every section, captures full-page
 * screenshots at desktop / tablet / mobile, records every console error, and asserts
 * every named section is visible.
 *
 * Run: node scripts/sf6-visual-verify.js
 * Outputs: debug-screenshots/sf6/*.png + sf6-report.json + sf6-report.txt
 */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'debug-screenshots', 'sf6');
fs.mkdirSync(OUT, { recursive: true });

const URL = 'http://localhost:8092/';
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 375, height: 812 },
];

// Sections we expect to be visible & non-empty
const SECTIONS = [
  { id: 'hero', selector: '#hero', name: 'Hero (earth + persona switcher)' },
  { id: 'hero-demo', selector: '.hero-demo-block', name: 'Hero animated demo (SF-3 standalone)' },
  { id: 'carousel', selector: '.crow-carousel', name: '5-slide carousel' },
  { id: 'frameworks', selector: '#compliance-frameworks', name: 'Compliance frameworks (6 cards)' },
  { id: 'regstrip', selector: '.reg-strip-section', name: 'Regulatory chip row' },
  { id: 'livedemo', selector: '#live-demo', name: 'MEES live demo (postcode)' },
  { id: 'stats', selector: '.stats', name: '3-stat band' },
  { id: 'why', selector: 'section.section-alt', name: 'Why this work matters' },
  { id: 'how', selector: '#how', name: 'How it works (6-tab scene strips)' },
  { id: 'products', selector: '#products', name: 'Products bento (6 blocks)' },
  { id: 'sectors', selector: '#sectors', name: 'Sectors (12 cards)' },
  { id: 'trust', selector: '#trust', name: 'Trust block' },
  { id: 'methodology', selector: '.sf10-methodology-grid', name: 'Methodology (4 citations)' },
  { id: 'cta-band', selector: '.cta-band', name: 'Triple CTA band' },
  { id: 'contact', selector: '#contact', name: 'Contact form' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = { url: URL, viewports: {}, started: new Date().toISOString() };

  for (const vp of VIEWPORTS) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Viewport: ${vp.name} ${vp.width}x${vp.height}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      colorScheme: 'dark',
    });
    const page = await context.newPage();

    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.failure().errorText} ${req.url()}`);
    });
    page.on('response', (resp) => {
      if (resp.status() >= 400) failedRequests.push(`HTTP ${resp.status()} ${resp.url()}`);
    });

    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for any deferred scripts (GSAP, scripts.min.js) to finish executing
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    // Scroll the full page top to bottom slowly so IntersectionObservers fire
    await page.evaluate(async () => {
      const totalHeight = document.body.scrollHeight;
      const step = Math.max(80, Math.floor(window.innerHeight * 0.3));
      for (let y = 0; y < totalHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 220));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 500));
    });

    // Full-page screenshot (don't wait for fonts — many remote fonts time out
    // and we just want a current visual snapshot)
    const fullPath = path.join(OUT, `${vp.name}-fullpage.png`);
    try {
      await page.screenshot({ path: fullPath, fullPage: true, timeout: 60000 });
      console.log(`  ✓ full-page → ${path.basename(fullPath)}`);
    } catch (err) {
      console.log(`  ! full-page screenshot failed: ${err.message}`);
    }

    // Above-fold screenshot
    const foldPath = path.join(OUT, `${vp.name}-abovefold.png`);
    try {
      await page.screenshot({ path: foldPath, fullPage: false, timeout: 60000 });
    } catch (err) {
      console.log(`  ! above-fold screenshot failed: ${err.message}`);
    }

    // Per-section visibility + per-section screenshot
    const sectionResults = [];
    for (const s of SECTIONS) {
      const el = await page.$(s.selector);
      if (!el) {
        sectionResults.push({ id: s.id, name: s.name, found: false, visible: false });
        console.log(`  ✗ ${s.id.padEnd(14)} NOT FOUND  (${s.selector})`);
        continue;
      }
      const box = await el.boundingBox();
      const cs = await el.evaluate((node) => {
        const s = getComputedStyle(node);
        return { display: s.display, visibility: s.visibility, opacity: s.opacity };
      });
      const visible =
        !!box && box.width > 10 && box.height > 10 &&
        cs.display !== 'none' && cs.visibility !== 'hidden' &&
        parseFloat(cs.opacity) > 0.05;

      sectionResults.push({
        id: s.id, name: s.name, found: true, visible,
        box, computed: cs,
      });

      const flag = visible ? '✓' : '✗';
      console.log(`  ${flag} ${s.id.padEnd(14)} ${visible ? 'visible' : 'HIDDEN'}  opacity=${cs.opacity} display=${cs.display} h=${box ? Math.round(box.height) : 0}`);

      // Section screenshot (clip to element)
      if (visible && box && vp.name === 'desktop') {
        await page.evaluate(([sel]) => {
          const e = document.querySelector(sel);
          if (e) e.scrollIntoView({ behavior: 'instant', block: 'start' });
        }, [s.selector]);
        await page.waitForTimeout(300);
        const sPath = path.join(OUT, `section-${s.id}.png`);
        try {
          await el.screenshot({ path: sPath });
        } catch (_) { /* element may be off-screen at this point */ }
      }
    }

    report.viewports[vp.name] = {
      width: vp.width, height: vp.height,
      consoleErrors, pageErrors, failedRequests,
      sections: sectionResults,
      hidden: sectionResults.filter((s) => !s.visible).map((s) => s.id),
    };

    console.log(`  console errors: ${consoleErrors.length}, page errors: ${pageErrors.length}`);
    if (consoleErrors.length) console.log('  ',consoleErrors.slice(0,5).join('\n  '));
    if (pageErrors.length) console.log('  PAGE:',pageErrors.slice(0,5).join('\n  PAGE:'));

    await context.close();
  }

  await browser.close();

  // Write JSON + text report
  fs.writeFileSync(path.join(OUT, 'sf6-report.json'), JSON.stringify(report, null, 2));

  const lines = [];
  lines.push(`SF-6 Visual Verification — ${report.started}`);
  lines.push(`URL: ${report.url}`);
  lines.push('');
  for (const vpName of Object.keys(report.viewports)) {
    const v = report.viewports[vpName];
    lines.push(`━━━ ${vpName} ${v.width}x${v.height} ━━━`);
    lines.push(`  Console errors: ${v.consoleErrors.length}`);
    lines.push(`  Page errors:    ${v.pageErrors.length}`);
    lines.push(`  Hidden sections: ${v.hidden.length === 0 ? 'NONE' : v.hidden.join(', ')}`);
    for (const s of v.sections) {
      lines.push(`    ${s.visible ? '✓' : '✗'} ${s.id.padEnd(14)} ${s.name}`);
    }
    if (v.consoleErrors.length) {
      lines.push('  ERRORS:');
      v.consoleErrors.slice(0, 10).forEach((e) => lines.push(`    ${e}`));
    }
    lines.push('');
  }
  fs.writeFileSync(path.join(OUT, 'sf6-report.txt'), lines.join('\n'));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Wrote ${path.join(OUT, 'sf6-report.txt')}`);
  console.log(`Screenshots: ${OUT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
