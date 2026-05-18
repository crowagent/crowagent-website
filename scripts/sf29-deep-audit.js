/**
 * SF29 — Comprehensive site-wide UI audit.
 *
 * For every page on the site, probe for:
 *   A. Low text contrast (visible text with WCAG contrast < 4.5)
 *   B. Bullet / list visual issues (li without bullet, indented past container, overflow)
 *   C. Section overlap (consecutive sections whose boxes intersect vertically)
 *   D. Card overlap (cards whose bounding boxes intersect)
 *   E. Text overflow (element scrollWidth > clientWidth on visible text)
 *   F. Em-dash presence in rendered text
 *   G. Buttons/CTAs with contrast < 4.5
 *
 * Per-page report → debug-screenshots/sf29/report.json
 * Console summary lists worst offenders.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8092';
const OUT = 'debug-screenshots/sf29';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  '/',
  '/about.html',
  '/contact.html',
  '/security.html',
  '/partners.html',
  '/privacy.html',
  '/terms.html',
  '/cookies.html',
  '/faq.html',
  '/roadmap.html',
  '/changelog.html',
  '/resources.html',
  '/pricing.html',
  '/404.html',
  '/crowagent-core.html',
  '/crowmark.html',
  '/crowcyber.html',
  '/crowcash.html',
  '/crowesg.html',
  '/csrd.html',
  '/products/',
  '/tools/',
  '/tools/mees-risk-snapshot/',
  '/tools/ppn-002-calculator/',
  '/tools/csrd-applicability-checker/',
  '/tools/cyber-essentials-readiness/',
  '/tools/late-payment-calculator/',
  '/tools/vsme-materiality-light/',
  '/blog/',
  '/blog/cyber-essentials-v3-3-danzell-2026.html',
  '/blog/mees-band-c-2028.html',
  '/blog/ppn-002-social-value-explained.html',
  '/blog/csrd-omnibus-i-2026.html'
];

function parseColor(c) {
  if (!c) return null;
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map(s => parseFloat(s.trim()));
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
}
function lum({ r, g, b }) {
  const f = v => { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(c1, c2) {
  if (!c1 || !c2) return null;
  const L1 = lum(c1), L2 = lum(c2);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

async function auditPage(p, url) {
  const probe = await p.evaluate(() => {
    function parseRGB(c) {
      if (!c) return null;
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(',').map(s => parseFloat(s.trim()));
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
    }
    function approxGradientMid(bgImg) {
      // Extract first rgb()/hex from gradient string as proxy for visual bg
      const m = bgImg.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/);
      if (!m) return null;
      if (m[0].startsWith('#')) {
        const hex = m[0].slice(1);
        const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
        const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
        const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
      return m[0];
    }
    function findOpaqueBg(el) {
      let node = el;
      while (node && node !== document.body) {
        const cs = getComputedStyle(node);
        const c = parseRGB(cs.backgroundColor);
        if (c && c.a >= 0.85) return cs.backgroundColor;
        // background-image (gradient) — proxy with first stop colour
        if (cs.backgroundImage && cs.backgroundImage !== 'none' && /gradient|url\(/.test(cs.backgroundImage)) {
          const proxy = approxGradientMid(cs.backgroundImage);
          if (proxy) return proxy;
        }
        node = node.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor || 'rgb(10, 22, 40)';
    }
    function lum(c) {
      const f = v => { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    }
    function contrast(a, b) {
      a = parseRGB(a); b = parseRGB(b);
      if (!a || !b) return null;
      const L1 = lum(a), L2 = lum(b);
      return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    }
    function clsname(el) {
      return typeof el.className === 'string' ? el.className.slice(0, 50) : '';
    }
    function pathOf(el) {
      const parts = [];
      let n = el;
      while (n && n !== document.body && parts.length < 5) {
        let s = n.tagName.toLowerCase();
        if (n.id) s += '#' + n.id;
        else if (typeof n.className === 'string' && n.className.trim()) s += '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.');
        parts.unshift(s);
        n = n.parentElement;
      }
      return parts.join(' > ');
    }

    const out = {
      lowContrast: [],
      cardOverlap: [],
      sectionOverlap: [],
      textOverflow: [],
      bulletIssues: [],
      emDashes: [],
      buttonContrast: []
    };

    // (A) Low contrast scan on visible text-bearing elements
    const TEXT_NODES = Array.from(document.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, a, span, .btn, button, label, td, th, dt, dd'));
    const seenLowKeys = new Set();
    TEXT_NODES.forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.5) return;
      const r = el.getBoundingClientRect();
      if (r.width < 30 || r.height < 12) return;
      const text = (el.textContent || '').trim();
      if (text.length < 2 || text.length > 400) return;
      const bg = findOpaqueBg(el);
      const cr = contrast(cs.color, bg);
      if (cr !== null && cr < 4.5) {
        const key = pathOf(el);
        if (seenLowKeys.has(key)) return;
        seenLowKeys.add(key);
        out.lowContrast.push({ path: key, text: text.slice(0, 60), color: cs.color, bg, contrast: +cr.toFixed(2) });
      }
    });

    // (G) Buttons/CTAs contrast (stricter — 4.5 min)
    const BTN_NODES = Array.from(document.querySelectorAll('.btn, button, a.btn, .pgc-cta, [role="button"], .cta'));
    const seenBtn = new Set();
    BTN_NODES.forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 20) return;
      let bg = cs.backgroundColor;
      if (parseRGB(bg) && parseRGB(bg).a < 0.5) bg = findOpaqueBg(el);
      const cr = contrast(cs.color, bg);
      if (cr !== null && cr < 4.5) {
        const key = pathOf(el);
        if (seenBtn.has(key)) return;
        seenBtn.add(key);
        out.buttonContrast.push({ path: key, text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), color: cs.color, bg, contrast: +cr.toFixed(2) });
      }
    });

    // (D) Card overlap — find cards by class containing "card" and check bounding box intersections
    const CARDS = Array.from(document.querySelectorAll('[class*="card"]'));
    const cardRects = CARDS.filter(c => {
      const cs = getComputedStyle(c);
      const r = c.getBoundingClientRect();
      return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width >= 80 && r.height >= 40;
    }).map(c => ({ el: c, r: c.getBoundingClientRect() }));
    for (let i = 0; i < cardRects.length; i++) {
      for (let j = i + 1; j < cardRects.length; j++) {
        const A = cardRects[i].r, B = cardRects[j].r;
        if (cardRects[i].el.contains(cardRects[j].el) || cardRects[j].el.contains(cardRects[i].el)) continue;
        const ix = Math.max(A.left, B.left) < Math.min(A.right, B.right);
        const iy = Math.max(A.top, B.top) < Math.min(A.bottom, B.bottom);
        if (ix && iy) {
          const ovX = Math.min(A.right, B.right) - Math.max(A.left, B.left);
          const ovY = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
          if (ovX > 4 && ovY > 4) {
            out.cardOverlap.push({
              a: pathOf(cardRects[i].el),
              b: pathOf(cardRects[j].el),
              overlap: { x: Math.round(ovX), y: Math.round(ovY) }
            });
          }
        }
      }
    }

    // (C) Section overlap — consecutive <section> elements should not overlap
    const SECTIONS = Array.from(document.querySelectorAll('main > section'));
    for (let i = 0; i < SECTIONS.length - 1; i++) {
      const A = SECTIONS[i].getBoundingClientRect();
      const B = SECTIONS[i + 1].getBoundingClientRect();
      if (A.bottom > B.top + 2) {
        out.sectionOverlap.push({
          a: pathOf(SECTIONS[i]),
          b: pathOf(SECTIONS[i + 1]),
          overlap: Math.round(A.bottom - B.top)
        });
      }
    }

    // (E) Text overflow — scrollWidth > clientWidth on visible text-bearing elements
    TEXT_NODES.forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (cs.overflow === 'visible' || cs.overflow === 'auto' || cs.overflow === 'scroll') return;
      const r = el.getBoundingClientRect();
      if (r.width < 40) return;
      if (el.scrollWidth > el.clientWidth + 2 && cs.whiteSpace === 'nowrap' && cs.overflow === 'hidden') {
        out.textOverflow.push({ path: pathOf(el), scrollW: el.scrollWidth, clientW: el.clientWidth, text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) });
      }
    });

    // (B) Bullet issues — <ul> with list-style:none AND no visible custom bullet markers.
    // A bullet counts as present if ::before has non-empty content OR a non-trivial
    // background-image (data-URI svg checkmark / disc / etc.) OR a background-color
    // that isn't transparent (CSS disc-style).
    const ULS = Array.from(document.querySelectorAll('ul, ol'));
    ULS.forEach(ul => {
      const cs = getComputedStyle(ul);
      if (cs.display === 'none') return;
      const r = ul.getBoundingClientRect();
      if (r.width < 80) return;
      const firstLi = ul.querySelector('li');
      if (!firstLi) return;
      const beforeCs = getComputedStyle(firstLi, '::before');
      const hasContent = beforeCs && beforeCs.content && beforeCs.content !== 'none' && beforeCs.content !== '""' && beforeCs.content !== 'normal';
      const hasBgImage = beforeCs && beforeCs.backgroundImage && beforeCs.backgroundImage !== 'none';
      const beforeBg = parseRGB(beforeCs && beforeCs.backgroundColor);
      const hasBgColour = !!(beforeBg && beforeBg.a > 0);
      // Also accept if the ::before has any width/height (a styled box)
      const beforeBox = beforeCs && (parseFloat(beforeCs.width) > 0 || parseFloat(beforeCs.height) > 0);
      // Or inline icon inside the LI (e.g., <svg> before text)
      const inlineIcon = firstLi.querySelector(':scope > svg, :scope > .icon, :scope > [class*="bullet"]');
      const bulletPresent = hasContent || hasBgImage || (hasBgColour && beforeBox) || !!inlineIcon;
      if (cs.listStyle && /none/.test(cs.listStyle) && !bulletPresent) {
        const txt = (firstLi.textContent || '').trim();
        if (txt.length > 20 && txt.length < 300) {
          out.bulletIssues.push({ path: pathOf(ul), reason: 'no visible bullet marker', sample: txt.slice(0, 60) });
        }
      }
    });

    // (F) Em-dashes — scan all visible text
    const ALL_TEXT_NODES = Array.from(document.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, span, td, th, dt, dd, .btn, button, label, a'));
    ALL_TEXT_NODES.forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt) return;
      if (/—/.test(txt)) {
        out.emDashes.push({ path: pathOf(el), snippet: txt.slice(0, 80) });
      }
    });

    return out;
  });
  return probe;
}

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  const overall = {};
  for (const url of PAGES) {
    try {
      await p.goto(BASE + url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { timeout: 20000 });
      await p.waitForTimeout(1800);
      const res = await auditPage(p, url);
      overall[url] = res;
      const counts = Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v.length]));
      console.log(url, JSON.stringify(counts));
    } catch (e) {
      overall[url] = { error: e.message };
      console.log(url, 'ERROR', e.message);
    }
  }
  await b.close();

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(overall, null, 2));

  // Console summary — most painful pages first
  const summary = Object.entries(overall).map(([url, r]) => {
    if (r.error) return { url, error: r.error, total: -1 };
    const total = (r.lowContrast?.length || 0) + (r.cardOverlap?.length || 0) + (r.sectionOverlap?.length || 0) + (r.textOverflow?.length || 0) + (r.bulletIssues?.length || 0) + (r.emDashes?.length || 0) + (r.buttonContrast?.length || 0);
    return { url, total, lowContrast: r.lowContrast?.length || 0, cardOverlap: r.cardOverlap?.length || 0, sectionOverlap: r.sectionOverlap?.length || 0, textOverflow: r.textOverflow?.length || 0, bulletIssues: r.bulletIssues?.length || 0, emDashes: r.emDashes?.length || 0, buttonContrast: r.buttonContrast?.length || 0 };
  });
  summary.sort((a, b) => (b.total || 0) - (a.total || 0));
  console.log('\n══ SF29 SUMMARY (worst first) ══');
  summary.forEach(s => console.log(JSON.stringify(s)));
})().catch(e => { console.error('AUDIT ERROR:', e); process.exit(1); });
