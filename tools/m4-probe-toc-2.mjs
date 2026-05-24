import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: {width:390,height:844}, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/tools-csrd-checker-methodology.html', { waitUntil: 'networkidle' });
const data = await page.evaluate(() => {
  const toc = document.querySelector('.tool-methodology-toc');
  if (!toc) return { error: 'no toc' };
  const cs = getComputedStyle(toc);
  // Find rule matches
  const matches = [];
  for (const sheet of [...document.styleSheets]) {
    let rules;
    try { rules = sheet.cssRules || sheet.rules; } catch { continue; }
    if (!rules) continue;
    walk(rules);
    function walk(rules) {
      const list = Array.from(rules || []);
      for (const r of list) {
        if (r.media) {
          if (window.matchMedia(r.media.mediaText).matches) walk(r.cssRules);
          continue;
        }
        if (r.type !== 1) continue;
        try {
          if (toc.matches(r.selectorText)) {
            matches.push({ selector: r.selectorText, css: r.cssText.slice(0, 200) });
          }
        } catch {}
      }
    }
  }
  return { position: cs.position, top: cs.top, zIndex: cs.zIndex, tag: toc.tagName, cls: toc.className.toString(), matches };
});
console.log(JSON.stringify(data, null, 2));
await ctx.close();
await browser.close();
