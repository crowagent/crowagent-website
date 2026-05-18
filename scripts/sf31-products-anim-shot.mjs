import { chromium } from 'playwright';

const URL = 'http://localhost:8092/index.html';
const OUT = 'debug-screenshots/sf31/products-anim-1440.png';

const errors = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push('pageerror: ' + err.message));

await page.goto(URL, { waitUntil: 'networkidle' });
// scroll to products section
await page.waitForSelector('#products', { timeout: 8000 });
await page.evaluate(() => {
  const el = document.querySelector('#products');
  if (el) el.scrollIntoView({ block: 'start' });
});
// let animations run for a moment
await page.waitForTimeout(1500);

// screenshot just the products section
const handle = await page.$('#products');
if (handle) {
  await handle.screenshot({ path: OUT });
  console.log('saved', OUT);
} else {
  await page.screenshot({ path: OUT, fullPage: false });
  console.log('fallback fullpage', OUT);
}

console.log('errors:', errors.length);
errors.forEach(e => console.log('  ', e));
await browser.close();
process.exit(0);
