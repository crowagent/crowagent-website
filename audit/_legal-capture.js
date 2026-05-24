/**
 * Cluster-B Legal pages screenshot capture (v5 — based on working test2).
 * 8 pages × 2 viewports × 3 positions = 48 PNGs
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8092';
const OUT  = 'C:/tmp/cluster-B-legal';

const PAGES = ['about','contact','partners','privacy','terms','security','cookies','cookie-preferences'];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, dsf: 1 },
  { name: 'mobile',  width: 390,  height: 844, dsf: 2 },
];

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const measurements = {};
  for (const vp of VIEWPORTS) {
    for (const slug of PAGES) {
      const key = `${slug}-${vp.name}`;
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.dsf,
        reducedMotion: 'reduce',
      });
      await ctx.addInitScript(() => {
        const s = document.createElement('style');
        s.textContent = '*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;animation-iteration-count:1!important}canvas[data-hero-mesh]{display:none!important}.reveal,.reveal.visible,.ms-reveal,.ms-reveal.ms-in,.fade-in{opacity:1!important;transform:none!important;visibility:visible!important}#cookie-banner,.cookie-banner{display:none!important}';
        (document.head || document.documentElement).appendChild(s);
      });
      const page = await ctx.newPage();
      const t0 = Date.now();
      try {
        await page.goto(`${BASE}/${slug}.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(1000);
        // eager-load lazy images
        await page.evaluate(() => {
          document.querySelectorAll('img[loading="lazy"]').forEach(img => { try { img.loading = 'eager'; } catch (e) {} });
        }).catch(() => {});
        await page.waitForTimeout(400);

        await page.screenshot({ path: path.join(OUT, `${key}-fold.png`), clip: { x:0, y:0, width: vp.width, height: vp.height }, timeout: 15000 }).catch(e => console.error(`  fold ${key}: ${e.message.slice(0,80)}`));
        await page.screenshot({ path: path.join(OUT, `${key}-full.png`), fullPage: true, timeout: 60000 }).catch(e => console.error(`  full ${key}: ${e.message.slice(0,80)}`));
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(()=>{});
        await page.waitForTimeout(250);
        await page.screenshot({ path: path.join(OUT, `${key}-footer.png`), clip: { x:0, y:0, width: vp.width, height: vp.height }, timeout: 15000 }).catch(e => console.error(`  footer ${key}: ${e.message.slice(0,80)}`));

        const m = await page.evaluate(() => {
          const docHeight = document.documentElement.scrollHeight;
          const body = getComputedStyle(document.body);
          const root = getComputedStyle(document.documentElement);
          const h1All = document.querySelectorAll('h1');
          const h2All = document.querySelectorAll('h2');
          const docHasHorizScroll = document.documentElement.scrollWidth > window.innerWidth + 1;
          const main = document.querySelector('main');
          const firstH1 = h1All[0];
          const h1Info = firstH1 ? (() => {
            const cs = getComputedStyle(firstH1);
            const r = firstH1.getBoundingClientRect();
            return { fontSize: cs.fontSize, lineHeight: cs.lineHeight, w: r.width|0, h: r.height|0, text: (firstH1.textContent||'').trim().slice(0,80) };
          })() : null;
          return {
            docHeight,
            bodyFontSize: body.fontSize,
            bodyLineHeight: body.lineHeight,
            bodyColor: body.color,
            bodyBg: body.backgroundColor,
            teal: root.getPropertyValue('--teal').trim(),
            mainWidth: main ? main.getBoundingClientRect().width|0 : null,
            docHasHorizScroll,
            h1Count: h1All.length,
            h2Count: h2All.length,
            firstH1: h1Info,
          };
        });
        measurements[key] = m;
        console.log(`OK ${key} doc=${m.docHeight}px h1=${m.h1Count}/${m.h2Count}h2 hscroll=${m.docHasHorizScroll} ${Date.now()-t0}ms`);
      } catch (e) {
        console.error(`ERR ${key}: ${e.message.slice(0,200)}`);
        measurements[key] = { error: e.message };
      }
      await page.close().catch(()=>{});
      await ctx.close().catch(()=>{});
    }
  }
  fs.writeFileSync(path.join(OUT, '_measurements.json'),
    JSON.stringify(measurements, null, 2));
  await browser.close();
  console.log('DONE');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
