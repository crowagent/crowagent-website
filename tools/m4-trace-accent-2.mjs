import { chromium } from 'playwright';
const browser = await chromium.launch();
// no reducedMotion this time
const ctx = await browser.newContext({ viewport: {width:1440,height:900}, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/tools/csrd-applicability-checker/', { waitUntil: 'networkidle' });
const data = await page.evaluate(() => {
  const el = document.querySelector('.hero-h1-accent');
  // collect all matching rules
  // chrome devtools way: window.getMatchedCSSRules is removed; but we have CSSOM
  const cs = getComputedStyle(el);
  // Read each stylesheet's rules
  const matches = [];
  for (const sheet of [...document.styleSheets]) {
    let rules;
    try { rules = sheet.cssRules || sheet.rules; } catch { continue; }
    if (!rules) continue;
    for (const r of rules) {
      if (r.type !== 1) continue;
      try {
        if (el.matches(r.selectorText) && /background/i.test(r.cssText)) {
          matches.push({ selector: r.selectorText, css: r.cssText.slice(0, 250) });
        }
      } catch {}
    }
  }
  return { bgImage: cs.backgroundImage, color: cs.color, bgColor: cs.backgroundColor, matches };
});
console.log(JSON.stringify(data, null, 2));
await ctx.close();
await browser.close();
