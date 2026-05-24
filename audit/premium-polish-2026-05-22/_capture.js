/**
 * READ-ONLY premium-polish audit screenshot capture.
 * Captures 10 pages × 2 viewports = 20 PNGs + per-page CSS measurements.
 * Output: audit/premium-polish-2026-05-22/{slug}-{viewport}.png
 *         audit/premium-polish-2026-05-22/_measurements.json
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8092';
const OUT  = path.join(__dirname);

const PAGES = [
  { slug: 'home',         url: '/index.html' },
  { slug: 'pricing',      url: '/pricing.html' },
  { slug: 'crowagent-core', url: '/crowagent-core.html' },
  { slug: 'crowmark',     url: '/crowmark.html' },
  { slug: 'about',        url: '/about.html' },
  { slug: 'contact',      url: '/contact.html' },
  { slug: 'faq',          url: '/faq.html' },
  { slug: 'blog-index',   url: '/blog/index.html' },
  { slug: 'blog-mees',    url: '/blog/mees-band-c-2028.html' },
  { slug: 'tools-index',  url: '/tools/index.html' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, dsf: 1 },
  { name: 'mobile',  width: 390,  height: 844, dsf: 2 },
];

(async () => {
  const browser = await chromium.launch();
  const measurements = {};
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dsf,
      reducedMotion: 'no-preference',
    });
    for (const p of PAGES) {
      const page = await ctx.newPage();
      const key = `${p.slug}-${vp.name}`;
      try {
        await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(800); // let GSAP reveals settle
        // disable scroll-triggered hover/focus that could distort
        const out = path.join(OUT, `${key}.png`);
        await page.screenshot({ path: out, fullPage: true });

        // CSS measurements
        const m = await page.evaluate(() => {
          const docHeight = document.documentElement.scrollHeight;
          const root = getComputedStyle(document.documentElement);
          const bodyCs = getComputedStyle(document.body);
          const h1 = document.querySelector('h1');
          const h2 = document.querySelector('h2');
          const h3 = document.querySelector('h3');
          const p = document.querySelector('main p, p');
          const btn = document.querySelector('.sv-btn, .btn-primary, .btn-v2, .btn');
          const nav = document.querySelector('header, .site-nav, nav');
          const logo = document.querySelector('.logo-img-wrap, .logo-img, header img');
          const sections = Array.from(document.querySelectorAll('section')).slice(0, 8).map(s => {
            const cs = getComputedStyle(s);
            return {
              tag: s.className || s.id || s.tagName,
              paddingTop: cs.paddingTop,
              paddingBottom: cs.paddingBottom,
              height: s.getBoundingClientRect().height|0,
            };
          });
          const measure = (el) => el ? (() => {
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return {
              tag: el.tagName,
              cls: (el.className||'').toString().slice(0,80),
              fontSize: cs.fontSize, lineHeight: cs.lineHeight,
              letterSpacing: cs.letterSpacing, fontWeight: cs.fontWeight,
              color: cs.color, bg: cs.backgroundColor,
              w: r.width|0, h: r.height|0,
            };
          })() : null;
          return {
            docHeight,
            bodyFontSize: bodyCs.fontSize,
            bodyLineHeight: bodyCs.lineHeight,
            bodyFontFamily: bodyCs.fontFamily,
            bg: bodyCs.backgroundColor,
            color: bodyCs.color,
            teal: root.getPropertyValue('--teal').trim(),
            bgVar: root.getPropertyValue('--bg').trim(),
            h1: measure(h1),
            h2: measure(h2),
            h3: measure(h3),
            p: measure(p),
            btn: measure(btn),
            nav: measure(nav),
            logo: measure(logo),
            sections,
          };
        });
        measurements[key] = m;
        console.log(`OK  ${key}  doc=${m.docHeight}px`);
      } catch (e) {
        console.error(`ERR ${key}: ${e.message}`);
        measurements[key] = { error: e.message };
      } finally {
        await page.close();
      }
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, '_measurements.json'),
    JSON.stringify(measurements, null, 2));
  await browser.close();
  console.log('DONE');
})();
