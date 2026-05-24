import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const url of ['http://localhost:8092/tools-csrd-checker-methodology.html', 'http://localhost:8092/tools/csrd-applicability-checker/', 'http://localhost:8092/intel/cyber-essentials-tracker/']) {
  const ctx = await browser.newContext({ viewport: {width:1440,height:900} });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const data = await page.evaluate(() => {
    const nav = document.querySelector('header > nav, nav.ca-nav, header nav');
    if (!nav) return { error: 'no main nav' };
    const cs = getComputedStyle(nav);
    return { pos: cs.position, top: cs.top, zIndex: cs.zIndex, height: cs.height, isMain: nav.matches('header > nav, .ca-nav') };
  });
  console.log(`${url.split('//')[1]} ::`, JSON.stringify(data));
  await ctx.close();
}
await browser.close();
