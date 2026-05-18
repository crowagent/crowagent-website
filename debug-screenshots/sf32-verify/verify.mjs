// SF32 verification harness — read-only checks via Playwright
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:8092';
const OUT = path.resolve('debug-screenshots/sf32-verify');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = ['about', 'security', 'partners', 'pricing', 'faq', 'resources'];

const results = {
  banners: [],
  sectors: null,
  timings: [],
  a11y: null,
};

(async () => {
  const browser = await chromium.launch();

  // === Task A: banner top visual verify ===
  for (const slug of PAGES) {
    const url = `${BASE}/${slug}.html`;

    // 1440x900 top
    const ctx1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx1440.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load', { timeout: 30000 }).catch(()=>{});
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, `${slug}-1440-top.png`), fullPage: false });

    const banner = await page.evaluate(() => {
      const b = document.querySelector('.page-abstract-banner');
      const nav = document.querySelector('nav') || document.querySelector('header');
      const navRect = nav ? nav.getBoundingClientRect() : null;
      if (!b) return { present: false, navBottom: navRect?.bottom ?? null };
      const r = b.getBoundingClientRect();
      // Find the first hero/main content to ensure banner is above it
      const candidates = ['.hero', 'main > section:first-child', 'main', '.page-hero', '[data-hero]'];
      let firstContent = null;
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el && el !== b && !el.contains(b)) { firstContent = el; break; }
      }
      const fcRect = firstContent ? firstContent.getBoundingClientRect() : null;
      return {
        present: true,
        bannerTop: Math.round(r.top + window.scrollY),
        bannerBottom: Math.round(r.bottom + window.scrollY),
        navBottom: navRect ? Math.round(navRect.bottom + window.scrollY) : null,
        firstContentTop: fcRect ? Math.round(fcRect.top + window.scrollY) : null,
        firstContentSelector: firstContent ? (firstContent.tagName.toLowerCase() + (firstContent.className ? '.' + String(firstContent.className).split(' ').filter(Boolean).slice(0,2).join('.') : '')) : null,
      };
    });

    await ctx1440.close();

    // 768
    const ctx768 = await browser.newContext({ viewport: { width: 768, height: 900 } });
    const p768 = await ctx768.newPage();
    await p768.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p768.waitForLoadState('load', { timeout: 20000 }).catch(()=>{});
    await p768.waitForTimeout(500);
    await p768.screenshot({ path: path.join(OUT, `${slug}-768.png`), fullPage: false });
    await ctx768.close();

    // 375
    const ctx375 = await browser.newContext({ viewport: { width: 375, height: 900 } });
    const p375 = await ctx375.newPage();
    await p375.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p375.waitForLoadState('load', { timeout: 20000 }).catch(()=>{});
    await p375.waitForTimeout(500);
    await p375.screenshot({ path: path.join(OUT, `${slug}-375.png`), fullPage: false });
    await ctx375.close();

    const aboveContent = banner.present && banner.firstContentTop != null
      ? banner.bannerTop <= banner.firstContentTop
      : null;
    const yRelToNav = banner.present && banner.navBottom != null
      ? banner.bannerTop - banner.navBottom
      : (banner.present ? banner.bannerTop : null);
    const ok = banner.present && (yRelToNav != null && yRelToNav < 200) && (aboveContent !== false);

    results.banners.push({
      page: slug,
      bannerPresent: banner.present,
      bannerTop: banner.bannerTop ?? null,
      navBottom: banner.navBottom ?? null,
      yRelToNav,
      firstContentTop: banner.firstContentTop ?? null,
      firstContentSelector: banner.firstContentSelector,
      aboveContent,
      ok,
    });
  }

  // === Task B: sectors loading ===
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load', { timeout: 30000 }).catch(()=>{});
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      const el = document.querySelector('#sectors');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await page.waitForTimeout(1500);
    // wait for images to settle
    await page.evaluate(async () => {
      const sec = document.querySelector('#sectors');
      if (!sec) return;
      const imgs = Array.from(sec.querySelectorAll('img'));
      await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; setTimeout(r, 5000); })));
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, 'sectors-1440.png'), fullPage: false });

    const data = await page.evaluate(() => {
      const sectorSection = document.querySelector('#sectors');
      let imgs = [];
      if (sectorSection) {
        imgs = Array.from(sectorSection.querySelectorAll('img'));
      }
      const imgInfo = imgs.map(img => ({
        src: img.currentSrc || img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayedWidth: img.getBoundingClientRect().width,
        alt: img.alt,
      }));
      const resources = performance.getEntriesByType('resource')
        .filter(e => /sectors/i.test(e.name))
        .map(e => ({
          name: e.name,
          transferSize: e.transferSize,
          encodedBodySize: e.encodedBodySize,
          decodedBodySize: e.decodedBodySize,
        }));
      return { imgInfo, resources };
    });

    const totalTransfer = data.resources.reduce((s, r) => s + (r.transferSize || 0), 0);
    const totalDecoded = data.resources.reduce((s, r) => s + (r.decodedBodySize || 0), 0);
    results.sectors = {
      imageCount: data.imgInfo.length,
      images: data.imgInfo,
      resourceCount: data.resources.length,
      resources: data.resources,
      totalTransferBytes: totalTransfer,
      totalDecodedBytes: totalDecoded,
    };
    await ctx.close();
  }

  // === Task C: page-load timing ===
  for (const slug of ['index', 'pricing']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.clearCookies();
    const page = await ctx.newPage();
    // Bypass cache via Cache-Control disabled
    await page.route('**/*', route => {
      const headers = { ...route.request().headers(), 'cache-control': 'no-cache', 'pragma': 'no-cache' };
      route.continue({ headers });
    });
    await page.goto(`${BASE}/${slug}.html`, { waitUntil: 'load', timeout: 60000 });
    // Wait a tick to ensure loadEventEnd is set
    await page.waitForTimeout(400);
    const t = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        return {
          DCL: Math.round(nav.domContentLoadedEventEnd),
          load: Math.round(nav.loadEventEnd),
          source: 'navigation-entry',
        };
      }
      const pt = performance.timing;
      return {
        DCL: pt.domContentLoadedEventEnd - pt.navigationStart,
        load: pt.loadEventEnd - pt.navigationStart,
        source: 'timing',
      };
    });
    results.timings.push({ page: slug, ...t });
    await ctx.close();
  }

  // === Task D: a11y quick scan on /index.html ===
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('load', { timeout: 30000 }).catch(()=>{});
    await page.waitForTimeout(500);
    const a11y = await page.evaluate(() => {
      const getXPath = (el) => {
        if (!el) return '';
        if (el.id) return `//*[@id="${el.id}"]`;
        const parts = [];
        let cur = el;
        while (cur && cur.nodeType === 1 && parts.length < 6) {
          let part = cur.tagName.toLowerCase();
          if (cur.className && typeof cur.className === 'string') {
            const cls = cur.className.trim().split(/\s+/).slice(0, 2).join('.');
            if (cls) part += '.' + cls;
          }
          parts.unshift(part);
          cur = cur.parentElement;
        }
        return parts.join(' > ');
      };
      const imgs = Array.from(document.querySelectorAll('img'));
      const imgsMissingAlt = imgs.filter(i => !i.hasAttribute('alt')).map(i => ({
        src: (i.currentSrc || i.src || '').slice(-80),
        path: getXPath(i),
      }));

      const focusables = Array.from(document.querySelectorAll('button, a'));
      const getAccName = (el) => {
        if (el.getAttribute('aria-label')?.trim()) return el.getAttribute('aria-label').trim();
        const labelledby = el.getAttribute('aria-labelledby');
        if (labelledby) {
          const ids = labelledby.split(/\s+/);
          const txt = ids.map(id => document.getElementById(id)?.textContent?.trim()).filter(Boolean).join(' ');
          if (txt) return txt;
        }
        const txt = el.textContent?.trim();
        if (txt) return txt;
        const title = el.getAttribute('title')?.trim();
        if (title) return title;
        // images inside with alt
        const img = el.querySelector('img[alt]');
        if (img && img.getAttribute('alt')?.trim()) return img.getAttribute('alt').trim();
        // svg title
        const svgTitle = el.querySelector('svg title');
        if (svgTitle && svgTitle.textContent?.trim()) return svgTitle.textContent.trim();
        return '';
      };
      const noName = focusables.filter(el => !getAccName(el)).map(el => ({
        tag: el.tagName.toLowerCase(),
        path: getXPath(el),
        outerHTML: el.outerHTML.slice(0, 120),
      }));

      const h1s = Array.from(document.querySelectorAll('h1'));
      return {
        imgCount: imgs.length,
        imgsMissingAltCount: imgsMissingAlt.length,
        imgsMissingAlt,
        buttonOrLinkCount: focusables.length,
        noAccessibleNameCount: noName.length,
        noAccessibleName: noName.slice(0, 20),
        h1Count: h1s.length,
        h1Texts: h1s.map(h => h.textContent?.trim().slice(0, 80)),
      };
    });
    results.a11y = a11y;
    await ctx.close();
  }

  await browser.close();

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
