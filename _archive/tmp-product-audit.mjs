import { chromium } from 'playwright';

function srgbToLin(c) { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); }
function rgbStrToLum(rgbStr) {
  const m = rgbStr && rgbStr.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r,g,b] = m[1].split(',').map(s => parseFloat(s.trim()));
  return 0.2126*srgbToLin(r) + 0.7152*srgbToLin(g) + 0.0722*srgbToLin(b);
}
function contrastRatio(L1, L2) { const a=Math.max(L1,L2), b=Math.min(L1,L2); return (a+0.05)/(b+0.05); }

const pages = [
  'http://localhost:8092/crowagent-core',
  'http://localhost:8092/crowmark',
  'http://localhost:8092/crowcyber',
  'http://localhost:8092/crowcash',
  'http://localhost:8092/crowesg',
  'http://localhost:8092/csrd',
];

const selectors = [
  '.hero-eyebrow',
  '.hero h1, .hero-headline, .page-title',
  '.hero-sub, .hero p',
  '.hero-btns .btn-primary-v2',
  '.hero-btns .btn-secondary',
  '.hero-trust .ht-item',
];

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  for (const url of pages) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    let lcpEntry = null;
    await page.addInitScript(() => {
      window.__lcp = null;
      try {
        new PerformanceObserver(list => {
          const e = list.getEntries().pop();
          window.__lcp = { startTime: e.startTime, url: e.url || null, el: e.element ? (e.element.tagName + (e.element.id?'#'+e.element.id:'')) : '?' };
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}
    });
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(2500);
    } catch (e) {
      console.log(url, 'ERROR:', e.message);
      await ctx.close();
      continue;
    }
    const lcp = await page.evaluate(() => window.__lcp);
    const audit = await page.evaluate((sels) => {
      const out = { elements: [], alignment: {} };
      function findBgRgb(el) {
        let n = el;
        while (n) {
          const cs = getComputedStyle(n);
          const bg = cs.backgroundColor;
          const m = bg && bg.match(/rgba?\(([^)]+)\)/);
          if (m) {
            const parts = m[1].split(',').map(s=>parseFloat(s.trim()));
            if (parts.length === 3 || parts[3] >= 0.5) return bg;
          }
          n = n.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      }
      for (const sel of sels) {
        const els = document.querySelectorAll(sel);
        let el = null;
        for (const c of els) {
          const r = c.getBoundingClientRect();
          const cs = getComputedStyle(c);
          if (r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.top < 1200) {
            el = c; break;
          }
        }
        if (!el) { out.elements.push({ sel, missing: true }); continue; }
        const cs = getComputedStyle(el);
        out.elements.push({ sel, color: cs.color, bg: findBgRgb(el), fontSize: cs.fontSize, fontWeight: cs.fontWeight });
      }
      const hb = document.querySelector('.hero-btns');
      if (hb) {
        const cs = getComputedStyle(hb);
        out.alignment.heroBtns = { display: cs.display, gap: cs.gap, justifyContent: cs.justifyContent };
        const btns = Array.from(hb.querySelectorAll('.btn')).filter(b => b.offsetWidth > 0);
        out.alignment.btnHeights = btns.map(b => Math.round(b.getBoundingClientRect().height));
      }
      return out;
    }, selectors);

    console.log(`\n=== ${url} ===`);
    console.log(`LCP: ${lcp ? Math.round(lcp.startTime)+'ms el='+lcp.el+' url='+(lcp.url||'-').slice(-60) : 'null'}`);
    for (const e of audit.elements) {
      if (e.missing) { console.log('  MISS ' + e.sel); continue; }
      const Lf = rgbStrToLum(e.color); const Lb = rgbStrToLum(e.bg);
      if (Lf == null || Lb == null) { console.log('  ' + e.sel + ' no rgb'); continue; }
      const cr = contrastRatio(Lf, Lb);
      const fs = parseFloat(e.fontSize), fw = parseInt(e.fontWeight);
      const isLarge = fs >= 24 || (fs >= 18.66 && fw >= 700);
      const threshold = isLarge ? 3 : 4.5;
      const status = cr >= threshold ? 'PASS' : 'FAIL';
      console.log('  ' + status + '  cr=' + cr.toFixed(2) + '  fs=' + e.fontSize + '  ' + e.sel + '  fg=' + e.color + '  bg=' + e.bg);
    }
    console.log('  align:', JSON.stringify(audit.alignment));
    await ctx.close();
  }
  await browser.close();
})();
