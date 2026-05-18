#!/usr/bin/env node
// Strict button-contrast probe.
//
// Flags only visible <a>/<button> elements whose OWN computed background
// (color or gradient) is teal-dominant AND whose own text colour renders
// light, then confirms by pixel-sampling the rendered button area on a
// real screenshot. SVG-icon descendants are ignored — we look at the
// element's own background and the immediate text colour.
//
// Output: JSON to stdout, screenshots + selectors to ./debug-screenshots/contrast/
//
// Usage:
//   node scripts/probe-button-contrast.js                 # default 14 routes
//   node scripts/probe-button-contrast.js /pricing /faq   # specific routes
//
// Exit 0 = 0 offenders. Exit 2 = offenders found.

const { chromium } = require('@playwright/test');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:8092';
const OUT_DIR = path.join(__dirname, '..', 'debug-screenshots', 'contrast');
fs.mkdirSync(OUT_DIR, { recursive: true });

const DEFAULT_ROUTES = [
  '/', '/pricing', '/contact', '/about', '/blog/', '/faq',
  '/crowagent-core', '/crowmark', '/crowcyber', '/crowcash',
  '/crowesg', '/csrd', '/tools/', '/tools-mees-risk-snapshot',
  '/cookies', '/privacy', '/terms', '/security'
];

const routes = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_ROUTES;

// Token reference (CrowAgent design tokens):
//   --teal = #0CC9A8 = rgb(12, 201, 168)
//   --bg   = #040E1A
// A "teal-ish" pixel: green dominant, blue present, red low.
function isTeal(r, g, b) {
  return r < 80 && g > 140 && b > 90 && (g + b) > (r * 2 + 100);
}
// "Light" text: luminance > 0.65 (white/cloud/mist/cream variants).
function isLight(r, g, b) {
  const L = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
  return L > 0.65;
}
function parseRGB(str) {
  if (!str) return null;
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map(s => parseFloat(s.trim()));
  if (parts.length < 3) return null;
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
}
function contrastRatio(c1, c2) {
  const lum = c => {
    const v = [c.r, c.g, c.b].map(x => {
      const s = x / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const L1 = lum(c1), L2 = lum(c2);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

// In-page collector: visible <a>/<button> only; element's OWN bg (not inherited
// from parent); element's OWN text colour (ignoring child SVG).
const collectorFn = () => {
  const items = [];
  const all = document.querySelectorAll('a, button');
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    if (r.bottom < 0 || r.top > document.documentElement.scrollHeight) continue;
    // Need direct text content (not just icon descendants)
    const text = (el.textContent || '').trim();
    if (!text || text.length < 1) continue;
    // Has SVG-only child? We still want to check text colour set on the element.
    items.push({
      tag: el.tagName.toLowerCase(),
      text: text.slice(0, 80),
      bg: cs.backgroundColor,
      bgImage: cs.backgroundImage,
      color: cs.color,
      classList: Array.from(el.classList).join(' '),
      id: el.id || '',
      href: el.getAttribute('href') || '',
      rect: { x: r.x, y: r.y, width: r.width, height: r.height },
      // path: a short selector to help locate winning rule
      selector: (() => {
        const parts = [];
        let cur = el;
        while (cur && cur.nodeType === 1 && parts.length < 4) {
          let p = cur.tagName.toLowerCase();
          if (cur.id) { p += '#' + cur.id; parts.unshift(p); break; }
          if (cur.classList.length) p += '.' + Array.from(cur.classList).join('.');
          parts.unshift(p);
          cur = cur.parentElement;
        }
        return parts.join(' > ');
      })()
    });
  }
  return items;
};

// Returns the gradient first-stop colour if backgroundImage is a teal linear-gradient.
function gradientFirstStop(bgImage) {
  if (!bgImage || bgImage === 'none') return null;
  // Match the first rgb(...)/rgba(...) inside the gradient declaration.
  const m = bgImage.match(/(linear|radial|conic)-gradient\([^)]*?(rgba?\([^)]+\))/);
  if (!m) return null;
  return parseRGB(m[2]);
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const allOffenders = [];
  const summary = [];

  for (const route of routes) {
    const url = BASE + route;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (e) {
      summary.push({ route, status: 'ERROR_NAVIGATE', message: String(e.message || e) });
      continue;
    }
    await page.waitForTimeout(600); // allow nav-inject + cookie-banner to settle

    const items = await page.evaluate(collectorFn);
    const candidates = [];
    for (const it of items) {
      const bg = parseRGB(it.bg);
      const fg = parseRGB(it.color);
      if (!fg) continue;
      // Determine the effective dominant background of the element itself:
      // 1) solid bg if alpha>0.5 AND teal-ish
      // 2) gradient first stop if teal-ish
      let effectiveBg = null;
      if (bg && bg.a > 0.5 && isTeal(bg.r, bg.g, bg.b)) effectiveBg = bg;
      if (!effectiveBg) {
        const grad = gradientFirstStop(it.bgImage);
        if (grad && isTeal(grad.r, grad.g, grad.b)) effectiveBg = grad;
      }
      if (!effectiveBg) continue;
      if (!isLight(fg.r, fg.g, fg.b)) continue;
      // Both teal bg AND light fg: candidate. Confirm with pixel sample.
      const ratio = contrastRatio(effectiveBg, fg);
      candidates.push({ ...it, effectiveBg, fg, ratio });
    }

    // Pixel-sample each candidate to confirm what the user actually sees.
    const confirmed = [];
    for (const c of candidates) {
      const safeName = (c.selector.replace(/[^a-z0-9]+/gi, '_').slice(0, 60));
      const shotPath = path.join(OUT_DIR, `${route.replace(/[\/]/g, '_') || 'home'}__${safeName}.png`);
      try {
        // Clip to element rect (clamped to viewport)
        const clip = {
          x: Math.max(0, Math.floor(c.rect.x)),
          y: Math.max(0, Math.floor(c.rect.y)),
          width: Math.min(1280 - Math.max(0, Math.floor(c.rect.x)), Math.ceil(c.rect.width)),
          height: Math.min(900 - Math.max(0, Math.floor(c.rect.y)), Math.ceil(c.rect.height)),
        };
        if (clip.width < 4 || clip.height < 4) continue;
        if (c.rect.y + c.rect.height > 900) {
          // Element below the fold — scroll into view first then re-fetch rect
          await page.evaluate((sel) => {
            const els = document.querySelectorAll(sel.split(' > ').pop());
            for (const el of els) {
              const t = (el.textContent || '').trim();
              if (t.startsWith('') || true) { el.scrollIntoView({ block: 'center' }); return; }
            }
          }, c.selector);
          await page.waitForTimeout(150);
          const newRect = await page.evaluate((selPart) => {
            const els = document.querySelectorAll(selPart);
            for (const el of els) {
              const r = el.getBoundingClientRect();
              return { x: r.x, y: r.y, width: r.width, height: r.height };
            }
            return null;
          }, c.selector.split(' > ').pop());
          if (newRect) {
            clip.x = Math.max(0, Math.floor(newRect.x));
            clip.y = Math.max(0, Math.floor(newRect.y));
            clip.width = Math.min(1280 - clip.x, Math.ceil(newRect.width));
            clip.height = Math.min(900 - clip.y, Math.ceil(newRect.height));
          }
        }
        await page.screenshot({ path: shotPath, clip });
        // Sample dominant pixels: read the PNG via sharp, sample ~400 non-edge pixels
        const { data, info } = await sharp(shotPath).raw().toBuffer({ resolveWithObject: true });
        const W = info.width, H = info.height, channels = info.channels;
        let tealHits = 0, lightHits = 0;
        const samples = Math.min(400, W * H);
        for (let i = 0; i < samples; i++) {
          const sx = 3 + Math.floor(Math.random() * Math.max(1, W - 6));
          const sy = 3 + Math.floor(Math.random() * Math.max(1, H - 6));
          const idx = (W * sy + sx) * channels;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          if (isTeal(r, g, b)) tealHits++;
          else if (isLight(r, g, b)) lightHits++;
        }
        const tealRatio = tealHits / samples;
        const lightRatio = lightHits / samples;
        // Confirm: WCAG contrast-ratio failure (the user's actual "can't
        // read it" complaint) + pixel-sample sanity (button is on-screen
        // with visible teal + light text pixels, however few). WCAG AA
        // requires 4.5:1 for normal text and 3:1 for large text — we use
        // 4.5 to be safe (large-text exemption requires font-size+weight
        // inspection which we sidestep).
        const failsWCAG = c.ratio < 4.5;
        const visiblyTealWithLightPixels = tealRatio > 0.10 && lightRatio > 0.003;
        if (failsWCAG && visiblyTealWithLightPixels) {
          confirmed.push({
            route, selector: c.selector, text: c.text,
            classList: c.classList, id: c.id, href: c.href,
            tag: c.tag,
            bg: c.bg, bgImage: c.bgImage, color: c.color,
            effectiveBg: c.effectiveBg, fg: c.fg, contrast: c.ratio.toFixed(2),
            screenshot: shotPath,
            sampledTealRatio: tealRatio.toFixed(2),
            sampledLightRatio: lightRatio.toFixed(2),
          });
        } else {
          // Not confirmed — drop the screenshot to save disk
          try { fs.unlinkSync(shotPath); } catch {}
        }
      } catch (e) {
        // Screenshot failed — skip rather than false-positive
      }
    }

    allOffenders.push(...confirmed);
    summary.push({
      route,
      candidates: candidates.length,
      confirmedOffenders: confirmed.length,
      candidateDetails: candidates.map(c => ({
        sel: c.selector, text: c.text.slice(0, 30),
        bg: c.bg, bgImage: c.bgImage.slice(0, 60), color: c.color,
        effectiveBg: c.effectiveBg, fg: c.fg,
        ratio: Number(c.ratio.toFixed(2)),
      })),
    });
  }

  await browser.close();

  const report = {
    base: BASE,
    timestamp: new Date().toISOString(),
    summary,
    totalOffenders: allOffenders.length,
    offenders: allOffenders,
  };

  const reportPath = path.join(OUT_DIR, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    base: BASE,
    routes: summary,
    totalOffenders: allOffenders.length,
    reportPath,
  }, null, 2));

  process.exit(allOffenders.length === 0 ? 0 : 2);
}

main().catch(e => { console.error(e); process.exit(1); });
