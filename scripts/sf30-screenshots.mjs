// SF30 2026-05-18: Hero-split visual regression screenshots.
// Captures 1440x900, 1024x900, and 375x900 viewports of localhost:8092/.
// Dismisses the cookie banner before capture so it doesn't occlude the hero.
import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const URL = 'http://localhost:8092/';
const OUT = 'debug-screenshots/sf30';
const targets = [
  { name: 'hero-split-1440.png', width: 1440, height: 900 },
  { name: 'hero-split-1024.png', width: 1024, height: 900 },
  { name: 'hero-split-375.png',  width:  375, height: 900 },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const t of targets) {
  const ctx = await browser.newContext({ viewport: { width: t.width, height: t.height }, deviceScaleFactor: 1 });
  // Pre-set consent so the cookie banner does not render and occlude the hero.
  await ctx.addInitScript(() => {
    try { localStorage.setItem('ca_consent', 'accepted'); } catch (e) {}
    try { localStorage.setItem('cookieconsent_status', 'dismiss'); } catch (e) {}
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  // Hide cookie / consent banners if they still rendered.
  await page.evaluate(() => {
    const sels = ['#cookie-preferences', '#cookie-banner', '.cookie-banner', '[data-cookie-banner]'];
    sels.forEach(s => document.querySelectorAll(s).forEach(el => { el.style.display = 'none'; }));
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${t.name}`, fullPage: false });
  console.log(`Saved ${OUT}/${t.name} (${t.width}x${t.height})`);
  await ctx.close();
}
await browser.close();
