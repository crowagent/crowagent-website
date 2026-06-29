import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: {width:1440,height:900}, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/tools/csrd-applicability-checker/', { waitUntil: 'networkidle' });
const data = await page.evaluate(() => {
  const el = document.querySelector('.hero-h1-accent');
  const cs = getComputedStyle(el);
  // walk up the tree, sample --sky --teal --cloud
  const trail = [];
  let cur = el;
  while (cur && cur.tagName) {
    const c = getComputedStyle(cur);
    trail.push({
      tag: cur.tagName,
      cls: (cur.className?.baseVal || cur.className || '').toString().slice(0,80),
      sky: c.getPropertyValue('--sky'),
      teal: c.getPropertyValue('--teal'),
      cloud: c.getPropertyValue('--cloud'),
    });
    cur = cur.parentElement;
  }
  // Also try a manual set
  el.style.setProperty('background-image', 'linear-gradient(135deg, #0CC9A8, #E8F0FA 50%, #5BC8FF)', 'important');
  const cs2 = getComputedStyle(el);
  return {
    bgImage_before: cs.backgroundImage,
    bgImage_after_inline: cs2.backgroundImage,
    trail: trail.slice(0, 8),
  };
});
console.log(JSON.stringify(data, null, 2));
await ctx.close();
await browser.close();
