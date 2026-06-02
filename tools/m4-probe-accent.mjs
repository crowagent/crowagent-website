import { chromium } from 'playwright';

const browser = await chromium.launch();
for (const vp of [{w:1440,h:900,n:'desktop'},{w:390,h:844,n:'mobile'}]) {
  const ctx = await browser.newContext({ viewport: {width:vp.w,height:vp.h}, isMobile: vp.n==='mobile', deviceScaleFactor: vp.n==='mobile'?2:1 });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/tools/csrd-applicability-checker/', { waitUntil: 'networkidle' });
  const data = await page.evaluate(() => {
    const el = document.querySelector('.hero-h1-accent');
    if (!el) return { error: 'no .hero-h1-accent' };
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      text: el.textContent,
      tagName: el.tagName,
      computedColor: cs.color,
      computedBackground: cs.backgroundImage,
      computedClip: cs.webkitBackgroundClip || cs.backgroundClip,
      computedFill: cs.webkitTextFillColor,
      computedDisplay: cs.display,
      width: rect.width, height: rect.height,
      lineHeight: cs.lineHeight, fontSize: cs.fontSize,
      isVisible: rect.width > 0 && rect.height > 0,
    };
  });
  console.log(`\n=== ${vp.n} ===`);
  console.log(JSON.stringify(data, null, 2));
  await ctx.close();
}
await browser.close();
