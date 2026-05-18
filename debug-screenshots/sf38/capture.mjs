import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PAGES = [
  ['about', 'http://localhost:8092/about.html'],
  ['security', 'http://localhost:8092/security.html'],
  ['partners', 'http://localhost:8092/partners.html'],
  ['pricing', 'http://localhost:8092/pricing.html'],
  ['faq', 'http://localhost:8092/faq.html'],
  ['resources', 'http://localhost:8092/resources.html'],
  ['404', 'http://localhost:8092/404.html'],
  ['demo', 'http://localhost:8092/demo.html'],
];

const OUT_DIR = path.resolve(process.cwd(), 'debug-screenshots/sf38');
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

for (const [name, url] of PAGES) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);
    const outPath = path.join(OUT_DIR, `final-${name}.png`);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: 1440, height: 820 },
    });
    console.log('ok', name, outPath);
  } catch (e) {
    console.error('fail', name, e.message);
  }
}

await browser.close();
