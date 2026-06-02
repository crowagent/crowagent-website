// SF46 batch #5 — foundational architecture probe.
// Founder mandate 2026-05-20: visit index.html + about.html, target 3
// different card types, assert they share computed border-radius, padding,
// and box-shadow. Plus: typography sanity (h1 uses fluid clamp, body
// font-size resolves via tokens, not bare px).
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8092';

test.describe('SF46 B5 — Foundational architecture', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('home + about — three card types share radius / padding / box-shadow', async ({ page }) => {
    const readings = {};

    // Home: .hw (How-it-works step card) + .uc (use-case card)
    await page.goto(`${BASE}/?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    for (const sel of ['.hw', '.uc']) {
      const el = page.locator(sel).first();
      const exists = await el.count();
      if (!exists) continue;
      readings[`home ${sel}`] = await el.evaluate(node => {
        const cs = getComputedStyle(node);
        return {
          borderTopLeftRadius: cs.borderTopLeftRadius,
          paddingTop: cs.paddingTop,
          paddingRight: cs.paddingRight,
          paddingBottom: cs.paddingBottom,
          paddingLeft: cs.paddingLeft,
          boxShadow: cs.boxShadow,
        };
      });
    }

    // About: .sv-card (migrated from .about-card → sovereign primitive)
    await page.goto(`${BASE}/about.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const aboutCard = page.locator('.sv-card, .about-card').first();
    const aboutExists = await aboutCard.count();
    if (aboutExists) {
      readings['about .sv-card'] = await aboutCard.evaluate(node => {
        const cs = getComputedStyle(node);
        return {
          borderTopLeftRadius: cs.borderTopLeftRadius,
          paddingTop: cs.paddingTop,
          paddingRight: cs.paddingRight,
          paddingBottom: cs.paddingBottom,
          paddingLeft: cs.paddingLeft,
          boxShadow: cs.boxShadow,
        };
      });
    }

    const entries = Object.entries(readings);
    expect(entries.length, 'must find ≥3 card readings').toBeGreaterThanOrEqual(3);

    // All three cards must share radius/padding/shadow.
    const ref = entries[0][1];
    for (const [label, r] of entries.slice(1)) {
      expect(r.borderTopLeftRadius, `${label} borderRadius vs ${entries[0][0]} (${JSON.stringify(readings)})`).toBe(ref.borderTopLeftRadius);
      expect(r.paddingTop, `${label} paddingTop`).toBe(ref.paddingTop);
      expect(r.paddingRight, `${label} paddingRight`).toBe(ref.paddingRight);
      expect(r.paddingBottom, `${label} paddingBottom`).toBe(ref.paddingBottom);
      expect(r.paddingLeft, `${label} paddingLeft`).toBe(ref.paddingLeft);
      expect(r.boxShadow, `${label} boxShadow`).toBe(ref.boxShadow);
    }

    // Founder canonical (post Material Card Engine 2026-05-20):
    //   --radius-lg 16px · --space-6 24px · --shadow-card-tactile (Tailwind shadow-md):
    //   0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06).
    expect(ref.borderTopLeftRadius, 'canonical radius').toBe('16px');
    expect(ref.paddingTop, 'canonical padding').toBe('24px');
    expect(ref.paddingLeft, 'canonical padding').toBe('24px');
    expect(ref.boxShadow, 'canonical card-tactile shadow present').toMatch(/rgba\(0,\s*0,\s*0,\s*0\.0?6\)/);
  });

  test('typography — h1 uses fluid clamp at desktop (not bare px)', async ({ page }) => {
    await page.goto(`${BASE}/about.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const h1 = page.locator('h1.page-title').first();
    const fs = await h1.evaluate(node => parseFloat(getComputedStyle(node).fontSize));
    // canonical .page-title is clamp(2.5rem, 5vw, 4rem) = 40-64px. After
    // font-size-adjust scaling, computed will land ~48-64px range.
    expect(fs, 'h1.page-title font-size in fluid range').toBeGreaterThanOrEqual(36);
    expect(fs, 'h1.page-title font-size in fluid range').toBeLessThanOrEqual(80);
  });

  test('icon utilities — .ca-icon-sm/md/lg sizing rules shipped', async ({ page }) => {
    await page.goto(`${BASE}/`);
    // SF46 P1.5 (2026-05-20): probe must RECURSE through @layer blocks
    // because rules are now nested. Walk every CSSRule that exposes .cssRules.
    const has = await page.evaluate(() => {
      let smOk = false, mdOk = false, lgOk = false;
      const visit = (rules) => {
        if (!rules) return;
        for (const r of rules) {
          const sel = r.selectorText || '';
          const style = r.style;
          // Style rule match on selector + property
          if (style && /\.ca-icon-sm\b/.test(sel) && /16px/.test(style.width || '')) smOk = true;
          if (style && /\.ca-icon-md\b/.test(sel) && /24px/.test(style.width || '')) mdOk = true;
          if (style && /\.ca-icon-lg\b/.test(sel) && /32px/.test(style.width || '')) lgOk = true;
          // Recurse into nested rule containers (@layer, @media, @supports, etc.)
          if (r.cssRules) visit(r.cssRules);
        }
      };
      for (const ss of document.styleSheets) {
        try { visit(ss.cssRules); } catch (e) {}
      }
      return { smOk, mdOk, lgOk };
    });
    expect(has.smOk).toBe(true);
    expect(has.mdOk).toBe(true);
    expect(has.lgOk).toBe(true);
  });

  test('section rhythm — .section-padding uses --section-pad-primary token', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const has = await page.evaluate(() => {
      let ok = false;
      for (const ss of document.styleSheets) {
        try {
          for (const r of ss.cssRules || []) {
            const t = r.cssText || '';
            if (/section\.section-padding/.test(t) && /--section-pad-primary|--section-y-primary/.test(t)) ok = true;
          }
        } catch (e) {}
      }
      return ok;
    });
    expect(has, 'section.section-padding must use token-driven padding-block').toBe(true);
  });
});
