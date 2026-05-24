// SF46 batch #10 — TITANIUM audit. Founder mandate 2026-05-20:
//   A) OVERLAP GATE  — no [class*="-card"] overlaps another card on /about + /pricing
//   B) ALIGNMENT GATE — breadcrumb + ptabs + h1 share horizontal center on /pricing
//   C) A11Y GATE     — focused button outline-color === --teal
//   D) METRICS GATE  — verified by external grep (see ledger)
//   E) BUILD GATE    — verified by csso re-mint (see ledger)
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8092';

function rectsOverlap(a, b) {
  const TOL = 2;
  return (
    a.left < b.right - TOL &&
    a.right > b.left + TOL &&
    a.top < b.bottom - TOL &&
    a.bottom > b.top + TOL
  );
}

test.describe('SF46 B10 — Sovereign Architecture (Titanium audit)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // ── Gate A: OVERLAP ─────────────────────────────────────────────────────

  for (const slug of ['/pricing.html', '/about.html']) {
    test(`OVERLAP GATE — ${slug} no [class*="-card"] container overlaps`, async ({ page }) => {
      await page.goto(`${BASE}${slug}?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(600);
      await page.evaluate(async () => {
        const max = document.body.scrollHeight;
        for (let y = 0; y <= max; y += 200) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 30));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);
      const rects = await page.evaluate(() => {
        const TEXT_SUFFIXES = /-(?:title|desc|description|label|meta|value|num|number|icon|cta|link|name|tagline|bio|sub|preview|footer|date|tag)$/;
        const TEXT_INFIXES = /-(?:title|desc|label|meta|value|num|icon|cta|link|name|tagline|bio|sub|preview|footer)-/;
        const els = Array.from(document.querySelectorAll('[class*="-card"]')).filter(el => {
          for (const c of el.classList) {
            if (TEXT_SUFFIXES.test(c) || TEXT_INFIXES.test(c)) return false;
          }
          return true;
        });
        return els.map((el, i) => {
          const r = el.getBoundingClientRect();
          return {
            i, cls: el.className,
            left: r.left, top: r.top, right: r.right, bottom: r.bottom,
            visible: r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none',
          };
        }).filter(r => r.visible);
      });
      const overlaps = [];
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const aContainsB = rects[i].left <= rects[j].left && rects[i].top <= rects[j].top &&
                             rects[i].right >= rects[j].right && rects[i].bottom >= rects[j].bottom;
          const bContainsA = rects[j].left <= rects[i].left && rects[j].top <= rects[i].top &&
                             rects[j].right >= rects[i].right && rects[j].bottom >= rects[i].bottom;
          if (aContainsB || bContainsA) continue;
          if (rectsOverlap(rects[i], rects[j])) {
            overlaps.push({ a: rects[i].cls.slice(0, 60), b: rects[j].cls.slice(0, 60) });
          }
        }
      }
      expect(overlaps, `${slug} card overlaps: ${JSON.stringify(overlaps.slice(0, 3))}`).toHaveLength(0);
    });
  }

  // ── Gate B: ALIGNMENT ──────────────────────────────────────────────────

  test('ALIGNMENT GATE — /pricing breadcrumb + h1 horizontal-center axis match', async ({ page }) => {
    await page.goto(`${BASE}/pricing.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const bc = document.querySelector('.f10-breadcrumbs');
      const h1 = document.querySelector('h1.page-title, h1');
      const ptabs = document.querySelector('.ptabs, .pricing-tabs');
      const center = (el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return rect.left + rect.width / 2;
      };
      return {
        bcCenter: center(bc),
        h1Center: center(h1),
        ptabsCenter: center(ptabs),
        bcMaxW: bc ? getComputedStyle(bc).maxWidth : null,
        ptabsExists: !!ptabs,
      };
    });
    // Horizontal centers must match within 4px (sub-pixel rounding + scrollbar)
    expect(Math.abs(r.bcCenter - r.h1Center), `breadcrumb center ${r.bcCenter} vs h1 center ${r.h1Center}`).toBeLessThanOrEqual(4);
    if (r.ptabsExists) {
      expect(Math.abs(r.bcCenter - r.ptabsCenter), `breadcrumb center vs ptabs center ${r.ptabsCenter}`).toBeLessThanOrEqual(20);
    }
  });

  // ── Gate C: A11Y FOCUS RING ────────────────────────────────────────────

  test('A11Y GATE — focused button outline-color === --teal', async ({ page }) => {
    await page.goto(`${BASE}/?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);
    // Programmatically focus a button via JS, then read outline-color.
    const r = await page.evaluate(() => {
      // Pick the first visible <button> or <a class="btn">
      const candidates = Array.from(document.querySelectorAll('button, a.btn, a[class*="btn"]'))
        .filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
        });
      const btn = candidates[0];
      if (!btn) return { error: 'no focusable button found' };
      btn.focus();
      // After focus, simulate :focus-visible by also keyboard-tabbing — Chromium
      // matches :focus-visible when focus comes via keyboard. Force the
      // pseudo-state via Element.focus({focusVisible:true}) where supported.
      try { btn.focus({ focusVisible: true }); } catch (e) {}
      const cs = getComputedStyle(btn);
      const teal = getComputedStyle(document.documentElement).getPropertyValue('--teal').trim();
      return {
        outlineColor: cs.outlineColor,
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        teal,
        btnTag: btn.tagName + (btn.className ? '.' + btn.className.split(' ')[0] : ''),
      };
    });
    // The `--teal` token is #0CC9A8 which is rgb(12, 201, 168).
    expect(r.outlineColor, `outline-color (button=${r.btnTag}, teal=${r.teal})`).toMatch(/rgb\(\s*12,\s*201,\s*168/);
  });
});
