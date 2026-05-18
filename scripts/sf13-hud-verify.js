// SF13 — quick HUD verification screenshot. Closes chatbot + cookie banner
// so the actual hero composition is visible.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'debug-screenshots', 'sf13-hud');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PE:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CE:', m.text()); });

  await page.goto('http://localhost:8092/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);

  // Close cookie banner if present
  for (const sel of ['#cookie-reject-all', '.cookie-banner-close', '[data-cookie-reject]', 'button:has-text("Reject all")']) {
    try { await page.locator(sel).first().click({ timeout: 800 }); break; } catch {}
  }
  // Close chatbot panel
  for (const sel of ['.chatbot-close', '[aria-label*="Close" i][aria-label*="chat" i]', 'button:has-text("×")']) {
    try { await page.locator(sel).first().click({ timeout: 800 }); } catch {}
  }
  // Wait for the HUD intro animations to settle
  await page.waitForTimeout(1500);

  const hud = await page.evaluate(() => {
    function bbox(sel) {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { sel, top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), display: cs.display, opacity: cs.opacity, vis: cs.visibility };
    }
    return [
      bbox('.hero-bg-earth'),
      bbox('.hero-hud-counter'),
      bbox('.hero-orbit-stage'),
      bbox('.hob.b0'),
      bbox('.hero-hud-pulse'),
      bbox('.hero-hud-metrics'),
      bbox('.hero-hud-signal'),
    ];
  });
  console.log(JSON.stringify(hud, null, 2));

  await page.screenshot({ path: path.join(OUT, 'desktop-hero-clean.png'), fullPage: false, timeout: 60000 });

  // Also a tall hero-region shot
  const heroBox = await page.evaluate(() => {
    const el = document.querySelector('#hero');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: Math.min(900, r.height) };
  });
  if (heroBox) {
    await page.screenshot({ path: path.join(OUT, 'desktop-hero-zoom.png'), clip: { x: heroBox.x, y: heroBox.y, width: heroBox.w, height: heroBox.h } });
  }
  await browser.close();
})();
