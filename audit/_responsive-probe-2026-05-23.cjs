/* Responsive + cross-browser audit probe — 2026-05-23
 * Scans 10 pages × 10 viewports on chromium for responsive defects.
 * Cross-engine pass at 1440x900 on chromium / firefox / webkit.
 * Output: audit/responsive-probe-data.json
 */
const fs = require('fs');
const path = require('path');
const { chromium, firefox, webkit } = require('playwright');

const VIEWPORTS = [
  { w: 320, h: 568, name: 'iPhone SE',   cls: 'mobile' },
  { w: 375, h: 667, name: 'iPhone 8',    cls: 'mobile' },
  { w: 390, h: 844, name: 'iPhone 14',   cls: 'mobile' },
  { w: 414, h: 896, name: 'iPhone 11',   cls: 'mobile' },
  { w: 768, h: 1024, name: 'iPad',       cls: 'tablet' },
  { w: 1024, h: 1366, name: 'iPad Pro',  cls: 'tablet' },
  { w: 1280, h: 800, name: 'laptop',     cls: 'desktop' },
  { w: 1440, h: 900, name: 'desktop',    cls: 'desktop' },
  { w: 1920, h: 1080, name: 'full-HD',   cls: 'desktop' },
  { w: 2560, h: 1440, name: 'QHD',       cls: 'ultrawide' }
];

const PAGES = [
  '/',
  '/pricing',
  '/crowmark',
  '/crowcyber',
  '/crowcash',
  '/tools/late-payment-calculator/',
  '/blog/index',
  '/about',
  '/contact',
  '/security'
];

const BASE = 'http://localhost:8092';
const OUT_JSON = path.join(__dirname, 'responsive-probe-data.json');

const PROBE_FN = () => {
  // Run in page context.
  const r = {};
  // 1. Horizontal scroll
  const docW = document.documentElement.scrollWidth;
  const winW = window.innerWidth;
  r.docScrollWidth = docW;
  r.winInnerWidth = winW;
  r.horizontalScroll = docW > winW + 1; // 1px tolerance

  // 2. Nav + H1 visibility
  const h1 = document.querySelector('h1');
  let h1Visible = false;
  let h1Top = null;
  let h1Size = null;
  if (h1) {
    const rc = h1.getBoundingClientRect();
    h1Top = Math.round(rc.top);
    h1Visible = rc.top < window.innerHeight && rc.bottom > 0;
    const cs = window.getComputedStyle(h1);
    h1Size = parseFloat(cs.fontSize);
  }
  r.h1Present = !!h1;
  r.h1Visible = h1Visible;
  r.h1Top = h1Top;
  r.h1FontSize = h1Size;

  // 3. Touch targets — interactive elements < 40x40
  const interactive = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"]'));
  const smallTargets = [];
  interactive.forEach((el, i) => {
    if (el.offsetParent === null) return; // not rendered
    const rc = el.getBoundingClientRect();
    if (rc.width === 0 || rc.height === 0) return;
    // Skip elements inside the footer credits, in-text inline links inside paragraphs/li
    const parent = el.closest('p, li');
    const isInlineText = parent && (el.tagName === 'A') && !el.matches('.btn, .button, [class*="cta"], [class*="Cta"], nav a, header a, footer a');
    if (rc.width < 40 || rc.height < 40) {
      if (!isInlineText) {
        smallTargets.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 60),
          id: el.id || '',
          text: (el.textContent || '').trim().slice(0, 40),
          w: Math.round(rc.width),
          h: Math.round(rc.height),
          top: Math.round(rc.top),
          left: Math.round(rc.left)
        });
      }
    }
  });
  r.smallTouchTargets = smallTargets.slice(0, 20); // cap
  r.smallTouchTargetCount = smallTargets.length;

  // 4. Text size
  const textElems = Array.from(document.querySelectorAll('p, li, span, a, div'));
  let tinyTextCount = 0;
  const tinyTextSamples = [];
  textElems.forEach(el => {
    if (el.children.length > 0) return; // only leaf text
    const txt = (el.textContent || '').trim();
    if (!txt || txt.length < 10) return;
    const cs = window.getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    if (fs < 12 && cs.visibility !== 'hidden' && cs.display !== 'none') {
      tinyTextCount++;
      if (tinyTextSamples.length < 6) {
        tinyTextSamples.push({ fs, tag: el.tagName.toLowerCase(), text: txt.slice(0, 50), cls: (el.className||'').toString().slice(0,40) });
      }
    }
  });
  r.tinyTextCount = tinyTextCount;
  r.tinyTextSamples = tinyTextSamples;

  // 5. Image overflow
  const imgs = Array.from(document.querySelectorAll('img'));
  const overflowImgs = [];
  imgs.forEach(img => {
    if (img.offsetParent === null) return;
    const rc = img.getBoundingClientRect();
    if (rc.right > window.innerWidth + 1 || rc.left < -1) {
      overflowImgs.push({
        src: (img.src || '').split('/').slice(-1)[0].slice(0, 50),
        alt: (img.alt || '').slice(0, 40),
        left: Math.round(rc.left),
        right: Math.round(rc.right),
        w: Math.round(rc.width)
      });
    }
  });
  r.overflowImgs = overflowImgs.slice(0, 10);
  r.overflowImgCount = overflowImgs.length;

  // 6. Sticky overlap — back-to-top, chatbot, cookie banner
  const stickyIds = ['back-to-top', 'chatbot', 'crowagent-chatbot', 'cookie-banner', 'crowagent-cookie-banner'];
  const stickyRects = {};
  document.querySelectorAll('*').forEach(el => {
    if (!el.id) return;
    if (stickyIds.some(s => el.id.toLowerCase().includes(s))) {
      const cs = window.getComputedStyle(el);
      if (cs.position === 'fixed' || cs.position === 'sticky') {
        const rc = el.getBoundingClientRect();
        if (rc.width > 0 && rc.height > 0) {
          stickyRects[el.id] = {
            top: Math.round(rc.top), left: Math.round(rc.left),
            right: Math.round(rc.right), bottom: Math.round(rc.bottom),
            w: Math.round(rc.width), h: Math.round(rc.height),
            zIndex: cs.zIndex, position: cs.position
          };
        }
      }
    }
  });
  r.stickyRects = stickyRects;

  // overlap check: any two sticky bboxes that intersect
  const stickyOverlaps = [];
  const stickyKeys = Object.keys(stickyRects);
  for (let i = 0; i < stickyKeys.length; i++) {
    for (let j = i + 1; j < stickyKeys.length; j++) {
      const a = stickyRects[stickyKeys[i]];
      const b = stickyRects[stickyKeys[j]];
      const overlap = !(a.right < b.left || b.right < a.left || a.bottom < b.top || b.bottom < a.top);
      if (overlap) stickyOverlaps.push([stickyKeys[i], stickyKeys[j]]);
    }
  }
  r.stickyOverlaps = stickyOverlaps;

  // 7. Z-index conflicts — collect top stacking elements
  const fixedEls = Array.from(document.querySelectorAll('*')).filter(el => {
    const cs = window.getComputedStyle(el);
    return cs.position === 'fixed' && cs.zIndex !== 'auto' && parseInt(cs.zIndex) > 100;
  });
  r.fixedHighZ = fixedEls.slice(0, 10).map(el => ({
    tag: el.tagName.toLowerCase(),
    id: el.id || '',
    cls: (el.className || '').toString().slice(0, 50),
    z: parseInt(window.getComputedStyle(el).zIndex)
  }));

  // Header/nav above fold check
  const nav = document.querySelector('header nav, header, nav');
  if (nav) {
    const rc = nav.getBoundingClientRect();
    r.navVisible = rc.top < window.innerHeight;
    r.navHeight = Math.round(rc.height);
  }

  return r;
};

async function probePage(browser, browserName, viewport, urlPath) {
  const ctx = await browser.newContext({
    viewport: { width: viewport.w, height: viewport.h },
    deviceScaleFactor: 1,
    isMobile: viewport.cls === 'mobile',
    hasTouch: viewport.cls === 'mobile' || viewport.cls === 'tablet'
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e).slice(0, 200)));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200));
  });
  let httpStatus = null;
  try {
    const resp = await page.goto(BASE + urlPath, { waitUntil: 'networkidle', timeout: 25000 });
    httpStatus = resp ? resp.status() : null;
    // small settle for sticky/banner
    await page.waitForTimeout(500);
    const data = await page.evaluate(PROBE_FN);
    data.httpStatus = httpStatus;
    data.consoleErrors = consoleErrors.slice(0, 5);
    await ctx.close();
    return data;
  } catch (err) {
    await ctx.close();
    return { error: String(err).slice(0, 300), httpStatus, consoleErrors };
  }
}

(async () => {
  const out = { generatedAt: new Date().toISOString(), base: BASE, results: {}, crossEngine: {} };

  // PHASE 1: chromium × all viewports × all pages
  console.log('[phase 1] chromium full matrix…');
  const cb = await chromium.launch();
  for (const vp of VIEWPORTS) {
    out.results[vp.name] = { viewport: vp, pages: {} };
    for (const p of PAGES) {
      process.stdout.write(`  [${vp.name} ${vp.w}x${vp.h}] ${p} … `);
      const data = await probePage(cb, 'chromium', vp, p);
      out.results[vp.name].pages[p] = data;
      process.stdout.write(`${data.horizontalScroll ? 'HSCROLL ' : ''}${(data.smallTouchTargetCount || 0) > 0 ? 'TOUCH(' + data.smallTouchTargetCount + ') ' : ''}${(data.overflowImgCount || 0) > 0 ? 'IMG ' : ''}${data.error ? 'ERR ' : 'ok'}\n`);
    }
  }
  await cb.close();

  // PHASE 2: cross-engine at 1440x900
  console.log('[phase 2] cross-engine @ 1440x900…');
  const targets = [
    { name: 'chromium', launcher: chromium },
    { name: 'firefox',  launcher: firefox },
    { name: 'webkit',   launcher: webkit }
  ];
  const vp1440 = { w: 1440, h: 900, name: 'desktop', cls: 'desktop' };
  for (const t of targets) {
    out.crossEngine[t.name] = {};
    const br = await t.launcher.launch();
    for (const p of PAGES) {
      process.stdout.write(`  [${t.name}] ${p} … `);
      const data = await probePage(br, t.name, vp1440, p);
      out.crossEngine[t.name][p] = data;
      process.stdout.write(`${data.horizontalScroll ? 'HSCROLL ' : ''}${(data.smallTouchTargetCount||0)>0 ? 'TOUCH ':''}${data.error ? 'ERR' : 'ok'}\n`);
    }
    await br.close();
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2));
  console.log('Wrote', OUT_JSON);
})().catch(e => { console.error(e); process.exit(1); });
