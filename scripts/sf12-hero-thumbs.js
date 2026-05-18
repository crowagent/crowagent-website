#!/usr/bin/env node
// SF12 — capture 4 hero-option above-fold thumbnails at desktop 1440x900.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'debug-screenshots', 'sf12-heroes');
fs.mkdirSync(OUT, { recursive: true });

const OPTIONS = [
  'option-1-restored-earth',
  'option-2-pure-svg-uk',
  'option-3-live-hud',
  'option-4-stripe-gradient',
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const opt of OPTIONS) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'dark',
      reducedMotion: 'no-preference',
    });
    const page = await ctx.newPage();
    const url = `http://localhost:8092/hero-options/${opt}.html`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2500); // let intro/draw-in animations settle
      const file = path.join(OUT, `${opt}.png`);
      await page.screenshot({ path: file, fullPage: false, timeout: 60000 });
      console.log(`✓ ${opt}`);
    } catch (err) {
      console.log(`✗ ${opt}: ${err.message}`);
    }
    await ctx.close();
  }
  await browser.close();
})();
