import { chromium } from 'playwright';

function srgbToLin(c) { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); }
function rgbStrToLum(rgbStr) {
  const m = rgbStr && rgbStr.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r,g,b] = m[1].split(',').map(s => parseFloat(s.trim()));
  return 0.2126*srgbToLin(r) + 0.7152*srgbToLin(g) + 0.0722*srgbToLin(b);
}
function contrastRatio(L1, L2) { const a=Math.max(L1,L2), b=Math.min(L1,L2); return (a+0.05)/(b+0.05); }

async function probe(url, viewport) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  await page.addInitScript(() => {
    window.__lcp = null;
    window.__fcp = null;
    window.__cls = 0;
    try {
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        window.__lcp = {
          startTime: last.startTime,
          element: last.element ? (last.element.tagName + (last.element.id ? '#'+last.element.id : '') + (last.element.className && typeof last.element.className === 'string' ? '.'+last.element.className.split(/\s+/).slice(0,2).join('.') : '')) : '?',
          url: last.url || null,
          size: last.size || null,
        };
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) {
          if (e.name === 'first-contentful-paint') window.__fcp = e.startTime;
        }
      }).observe({ type: 'paint', buffered: true });
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) {
          if (!e.hadRecentInput) window.__cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  });

  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);

  const metrics = await page.evaluate(() => ({
    lcp: window.__lcp,
    fcp: window.__fcp,
    cls: window.__cls,
  }));

  const audit = await page.evaluate(() => {
    const out = { elements: [], alignment: {}, images: [] };
    function findBgRgb(el) {
      let n = el;
      while (n) {
        const cs = getComputedStyle(n);
        const bg = cs.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          const m = bg.match(/rgba?\(([^)]+)\)/);
          if (m) {
            const parts = m[1].split(',').map(s=>parseFloat(s.trim()));
            if (parts.length >= 4 && parts[3] < 0.5) { n = n.parentElement; continue; }
            return bg;
          }
        }
        n = n.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }

    const selectors = [
      '.hero-eyebrow',
      '.hero h1',
      '.hero-sub',
      '.hero-btns .btn-primary-v2',
      '.hero-btns .btn-secondary',
      '.hero-trust .ht-item',
      '.seg-btn.active',
      '.seg-btn:not(.active)',
      '.mees-countdown',
      '.mees-countdown-value',
      '.cta-no-card',
      '.hero-penalty-text',
    ];
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      let el = null;
      for (const c of els) {
        const r = c.getBoundingClientRect();
        const cs = getComputedStyle(c);
        if (r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none') {
          el = c; break;
        }
      }
      if (!el) { out.elements.push({ sel, missing: true }); continue; }
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.elements.push({
        sel,
        color: cs.color,
        bg: findBgRgb(el),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        width: Math.round(r.width),
        height: Math.round(r.height),
        x: Math.round(r.x),
        y: Math.round(r.y),
        visible: true,
      });
    }

    const hb = document.querySelector('.hero-btns');
    if (hb) {
      const cs = getComputedStyle(hb);
      out.alignment.heroBtns = {
        display: cs.display,
        gap: cs.gap,
        justifyContent: cs.justifyContent,
        alignItems: cs.alignItems,
        flexWrap: cs.flexWrap,
      };
      const visibleBtns = Array.from(hb.querySelectorAll('.btn')).filter(b => {
        const c = b.closest('.seg-text');
        if (!c) return true;
        return !c.hidden && getComputedStyle(c).display !== 'none';
      });
      out.alignment.btnHeights = visibleBtns.map(b => Math.round(b.getBoundingClientRect().height));
      out.alignment.btnCount = visibleBtns.length;
    }
    const ht = document.querySelector('.hero-trust');
    if (ht) {
      const cs = getComputedStyle(ht);
      const r = ht.getBoundingClientRect();
      out.alignment.heroTrust = {
        display: cs.display,
        justifyContent: cs.justifyContent,
        x: Math.round(r.x),
        width: Math.round(r.width),
      };
    }

    const imgs = Array.from(document.querySelectorAll('img'));
    for (const img of imgs.slice(0, 40)) {
      const r = img.getBoundingClientRect();
      if (r.width < 80) continue;
      out.images.push({
        src: img.currentSrc || img.src,
        natW: img.naturalWidth,
        natH: img.naturalHeight,
        rendW: Math.round(r.width),
        rendH: Math.round(r.height),
        dpr: window.devicePixelRatio,
        loading: img.loading,
        fetchpriority: img.fetchPriority,
        visible: r.top < window.innerHeight && r.bottom > 0,
      });
    }
    return out;
  });

  await browser.close();
  return { url, viewport, metrics, audit };
}

(async () => {
  const urls = [
    'http://localhost:8092/',
    'http://localhost:8092/pricing',
  ];
  const viewports = [
    { width: 1440, height: 900, name: 'desktop' },
    { width: 375, height: 800, name: 'mobile' },
  ];

  const results = [];
  for (const u of urls) {
    for (const v of viewports) {
      console.log('--- ' + u + ' ' + v.name + ' ---');
      try {
        const r = await probe(u, { width: v.width, height: v.height });
        r.viewportName = v.name;
        results.push(r);
        console.log('LCP=' + (r.metrics.lcp ? Math.round(r.metrics.lcp.startTime) + 'ms el=' + r.metrics.lcp.element + ' url=' + (r.metrics.lcp.url||'-') : 'null'));
        console.log('FCP=' + (r.metrics.fcp ? Math.round(r.metrics.fcp) + 'ms' : 'null'));
        console.log('CLS=' + (r.metrics.cls != null ? r.metrics.cls.toFixed(3) : 'null'));
      } catch (e) {
        console.log('ERROR:', e.message);
        results.push({ url: u, viewportName: v.name, error: e.message });
      }
    }
  }

  console.log('\n=== CONTRAST (desktop, home) ===');
  const home = results.find(r => r.url === 'http://localhost:8092/' && r.viewportName === 'desktop');
  if (home && home.audit) {
    for (const e of home.audit.elements) {
      if (e.missing) { console.log('SKIP   ' + e.sel + ' missing'); continue; }
      const Lf = rgbStrToLum(e.color);
      const Lb = rgbStrToLum(e.bg);
      if (Lf == null || Lb == null) { console.log('SKIP   ' + e.sel + ' no rgb'); continue; }
      const cr = contrastRatio(Lf, Lb);
      const fs = parseFloat(e.fontSize);
      const fw = parseInt(e.fontWeight);
      const isLarge = fs >= 24 || (fs >= 18.66 && fw >= 700);
      const threshold = isLarge ? 3 : 4.5;
      const status = cr >= threshold ? 'PASS' : 'FAIL';
      console.log(status + '  ' + e.sel.padEnd(28) + '  cr=' + cr.toFixed(2) + '  fs=' + e.fontSize + '  fw=' + e.fontWeight + '  fg=' + e.color + '  bg=' + e.bg);
    }
    console.log('\n=== ALIGNMENT (desktop) ===');
    console.log(JSON.stringify(home.audit.alignment, null, 2));
  }

  console.log('\n=== CONTRAST (mobile, home) ===');
  const homeMob = results.find(r => r.url === 'http://localhost:8092/' && r.viewportName === 'mobile');
  if (homeMob && homeMob.audit) {
    for (const e of homeMob.audit.elements) {
      if (e.missing) continue;
      const Lf = rgbStrToLum(e.color);
      const Lb = rgbStrToLum(e.bg);
      if (Lf == null || Lb == null) continue;
      const cr = contrastRatio(Lf, Lb);
      const fs = parseFloat(e.fontSize);
      const fw = parseInt(e.fontWeight);
      const isLarge = fs >= 24 || (fs >= 18.66 && fw >= 700);
      const threshold = isLarge ? 3 : 4.5;
      const status = cr >= threshold ? 'PASS' : 'FAIL';
      console.log(status + '  ' + e.sel.padEnd(28) + '  cr=' + cr.toFixed(2) + '  fs=' + e.fontSize);
    }
    console.log('\n=== ALIGNMENT (mobile) ===');
    console.log(JSON.stringify(homeMob.audit.alignment, null, 2));
  }

  console.log('\n=== IMAGES (desktop home) ===');
  if (home && home.audit) {
    for (const img of home.audit.images) {
      const effective = img.natW / (img.rendW * img.dpr);
      let flag = 'OK';
      if (effective < 0.9 && img.rendW > 100) flag = 'UNDER';
      else if (img.natW > img.rendW * 2 && img.rendW > 100 && img.rendW > 0) flag = 'OVER';
      console.log(flag.padEnd(6) + ' ' + (img.src||'').slice(-65).padEnd(65) + ' nat=' + img.natW + 'x' + img.natH + ' rend=' + img.rendW + 'x' + img.rendH + ' dpr=' + img.dpr + ' eff=' + effective.toFixed(2) + ' vis=' + img.visible);
    }
  }
})();
