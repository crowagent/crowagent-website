// Agent M10 — Marketing pages screenshot capture
// Captures 6 PNGs per page: fold + full + footer at desktop 1440x900 + mobile 390x844
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PAGES = [
  { url: 'pricing.html', name: 'pricing' },
  { url: 'roadmap.html', name: 'roadmap' },
  { url: 'faq.html', name: 'faq' },
  { url: 'changelog.html', name: 'changelog' },
  { url: 'resources.html', name: 'resources' },
  { url: 'products/index.html', name: 'products-index' },
  { url: 'tools/index.html', name: 'tools-index' },
  { url: 'glossary/index.html', name: 'glossary-index' },
  { url: 'blog/index.html', name: 'blog-index' },
  { url: '404.html', name: '404' },
];

const OUT = process.env.OUT_DIR || '/tmp/m10-marketing';
const BASE = 'http://localhost:8092';

async function shoot(page, name, vp) {
  const desktop = vp === 'desktop';
  // fold
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${name}-${vp}-fold.png`), fullPage: false });
  // full
  await page.screenshot({ path: path.join(OUT, `${name}-${vp}-full.png`), fullPage: true });
  // footer (scroll to bottom, capture viewport)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${name}-${vp}-footer.png`), fullPage: false });
}

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const filter = process.argv[2]; // optional page name filter
  for (const p of PAGES) {
    if (filter && filter !== p.name) continue;
    const url = `${BASE}/${p.url}`;
    console.log('SHOOT', p.name, url);
    // desktop
    let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    let page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(700);
      await shoot(page, p.name, 'desktop');
    } catch (e) { console.error(' desktop fail', p.name, e.message); }
    await ctx.close();
    // mobile
    ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(700);
      await shoot(page, p.name, 'mobile');
    } catch (e) { console.error(' mobile fail', p.name, e.message); }
    await ctx.close();
  }
  await browser.close();
  console.log('DONE');
})();
