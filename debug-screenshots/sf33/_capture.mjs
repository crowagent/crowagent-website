import { chromium } from 'playwright';

const out = 'debug-screenshots/sf33';
const pages = [
  { url: 'http://localhost:8092/404.html', file: `${out}/404-bg.png` },
  { url: 'http://localhost:8092/demo.html', file: `${out}/demo-bg.png` },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const errors = {};
for (const p of pages) {
  const page = await ctx.newPage();
  const consoleErr = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErr.push(msg.text()); });
  page.on('pageerror', e => consoleErr.push('pageerror: ' + e.message));
  await page.goto(p.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const hasBanner = await page.evaluate(() => {
    const f = document.querySelector('main figure.page-abstract-banner');
    if (!f) return { present: false };
    const img = f.querySelector('img');
    const r = img.getBoundingClientRect();
    const main = document.querySelector('main');
    return {
      present: true,
      src: img?.getAttribute('src'),
      w: Math.round(r.width),
      h: Math.round(r.height),
      mainHasPmbHost: main?.classList.contains('pmb-host') || false,
    };
  });
  await page.screenshot({ path: p.file, fullPage: false });
  errors[p.url] = { consoleErr, banner: hasBanner };
  await page.close();
}
console.log(JSON.stringify(errors, null, 2));
await browser.close();
