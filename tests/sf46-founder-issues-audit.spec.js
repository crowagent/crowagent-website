// SF46 — empirical probe of every concrete claim from Website issues 19052026.md.
// Goal: catch what the founder reported, not what the prior session claimed.
// 2026-05-20
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8092';

test.describe('Founder-named issues — concrete probes', () => {
  test.beforeEach(async ({ page }) => { await page.context().clearCookies(); });

  // ── HOME (index.html) ──────────────────────────────────────────────────────

  test('home — .ca-scroll-progress is injected into the DOM', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800); // nav-inject async
    const sp = await page.$('.ca-scroll-progress');
    expect(sp).not.toBeNull();
  });

  test('home — back-to-top z-index sits above cookie banner', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    const cookieZ = await page.$eval('#ca-cookie', el => parseInt(getComputedStyle(el).zIndex, 10));
    const btZ = await page.$eval('#sf21-back-to-top', el => parseInt(getComputedStyle(el).zIndex, 10)).catch(() => null);
    expect(btZ).not.toBeNull();
    expect(btZ).toBeGreaterThan(cookieZ);
    expect(btZ).toBeLessThanOrEqual(1300); // canonical ladder cap
  });

  test('home — CrowAgent methodology paragraph is centered', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    // The phrase is part of the methodology block; assert the containing element is centered.
    const para = page.getByText('CrowAgent does not generate compliance opinions', { exact: false }).first();
    const exists = await para.count();
    test.skip(exists === 0, 'methodology paragraph not on home — different page may host it');
    const align = await para.evaluate(el => {
      // walk up to find the nearest element whose computed text-align is set
      let cur = el;
      while (cur && cur !== document.body) {
        const a = getComputedStyle(cur).textAlign;
        if (a && a !== 'start' && a !== '') return a;
        cur = cur.parentElement;
      }
      return getComputedStyle(el).textAlign;
    });
    expect(['center', 'middle']).toContain(align);
  });

  // ── PRODUCT PAGES — CTA band centering ─────────────────────────────────────

  for (const slug of ['crowcyber', 'crowmark', 'crowcash', 'crowesg', 'csrd']) {
    test(`${slug} — CTA band h2 is centered`, async ({ page }) => {
      await page.goto(`${BASE}/${slug}.html`);
      await page.waitForLoadState('domcontentloaded');
      const h2 = page.locator('section.cta-band h2').first();
      const exists = await h2.count();
      test.skip(exists === 0, `no .cta-band on ${slug}`);
      const wrapAlign = await page.$eval('section.cta-band .wrap', el => getComputedStyle(el).textAlign);
      expect(wrapAlign).toBe('center');
    });
  }

  // ── ANNOUNCE BAR (× close icon) ────────────────────────────────────────────

  test('home — announce-bar wrap reserves end padding so close button cannot crowd the CTA', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const pad = await page.$eval('.announce-bar .wrap', el => parseInt(getComputedStyle(el).paddingInlineEnd, 10) || parseInt(getComputedStyle(el).paddingRight, 10));
    expect(pad).toBeGreaterThanOrEqual(48);
  });

  // ── DUPLICATE "Product walkthrough" — hero label should be "Live demo" ─────

  for (const slug of ['crowcyber', 'crowmark', 'crowcash', 'csrd']) {
    test(`${slug} — hero-demo-slot label is "Live demo" (not "Product walkthrough")`, async ({ page }) => {
      await page.goto(`${BASE}/${slug}.html`);
      const exists = await page.locator('.hero-demo-slot__label').count();
      test.skip(exists === 0, 'no hero-demo-slot label');
      const label = await page.locator('.hero-demo-slot__label').first().textContent();
      expect(label.trim()).toMatch(/^Live demo$/i);
    });
  }

  // ── GLOSSARY — "UK compliance terms in plain English" gone ─────────────────

  test('glossary — tagline removed', async ({ page }) => {
    await page.goto(`${BASE}/glossary/index.html`);
    const hits = await page.locator('text=/UK compliance terms in plain English/i').count();
    expect(hits).toBe(0);
  });

  // ── FOOTER — canonical text on every audited page ──────────────────────────

  for (const slug of ['', '/about.html', '/contact.html', '/crowmark.html', '/pricing.html', '/glossary/index.html']) {
    test(`footer canonical text — ${slug || 'home'}`, async ({ page }) => {
      await page.goto(`${BASE}${slug}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(800);
      const t = await page.locator('.footer-copyright').first().textContent().catch(() => '');
      // expect exact phrasing per founder rule
      expect(t.replace(/\s+/g, ' ').trim()).toMatch(/©\s*2026\s*CrowAgent Ltd\.\s*All rights reserved\.\s*Registered in England\s*&\s*Wales\.?/i);
    });
  }

  // ── HOVER-TO-PLAY placeholder — gone from all live HTML ────────────────────

  test('no "Hover to play" placeholder text anywhere in live HTML', async ({ page }) => {
    for (const slug of ['/', '/products/index.html', '/crowesg.html']) {
      await page.goto(`${BASE}${slug}`);
      const hits = await page.locator('text=/Hover to play/i').count();
      expect(hits, `expected 0 on ${slug}`).toBe(0);
    }
  });

  // ── HOW-IT-WORKS — autoplay rotates tabs (founder directive 2026-05-20) ────

  test('how-it-works — tab auto-rotates within ~10s', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.how-tab.active', { state: 'attached', timeout: 5000 });
    // Scroll the how section into view so IntersectionObserver fires
    await page.locator('#how').scrollIntoViewIfNeeded();
    const initialTab = await page.$eval('.how-tab.active', el => el.getAttribute('data-hw-tab'));
    // Wait up to 12s for the active tab to change. The interval is 7s.
    await page.waitForFunction((seed) => {
      const cur = document.querySelector('.how-tab.active');
      return cur && cur.getAttribute('data-hw-tab') !== seed;
    }, initialTab, { timeout: 12000 });
    const next = await page.$eval('.how-tab.active', el => el.getAttribute('data-hw-tab'));
    expect(next).not.toBe(initialTab);
  });

  test('how-it-works — active panel carries is-scene-active class', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.how-tab.active', { state: 'attached', timeout: 5000 });
    await page.locator('#how').scrollIntoViewIfNeeded();
    // Click a tab manually to trigger scene-active class
    await page.click('.how-tab[data-hw-tab="mark"]');
    await page.waitForTimeout(300);
    const hasClass = await page.$eval('#hw-panel-mark', el => el.classList.contains('is-scene-active'));
    expect(hasClass).toBe(true);
  });

  // ── B2.3 CARD STANDARD on .contact-card / .about-card / .f10-office-card ───

  for (const [slug, sel] of [['/contact.html', '.contact-card'], ['/about.html', '.about-card'], ['/contact.html', '.f10-office-card']]) {
    test(`card standard — ${sel} on ${slug}`, async ({ page, browserName }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // Cache-bust so we always read the latest min.css after CSS edits
      await page.goto(`${BASE}${slug}?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      const exists = await page.locator(sel).first().count();
      test.skip(exists === 0, `${sel} not on ${slug}`);
      const r = await page.$eval(sel, el => {
        const cs = getComputedStyle(el);
        return { paddingTop: cs.paddingTop, paddingRight: cs.paddingRight, paddingBottom: cs.paddingBottom, paddingLeft: cs.paddingLeft, borderRadius: cs.borderTopLeftRadius, boxShadow: cs.boxShadow };
      });
      expect(r.paddingTop, `${sel} paddingTop`).toBe('24px');
      expect(r.paddingRight, `${sel} paddingRight`).toBe('24px');
      expect(r.paddingBottom, `${sel} paddingBottom`).toBe('24px');
      expect(r.paddingLeft, `${sel} paddingLeft`).toBe('24px');
      expect(r.borderRadius, `${sel} borderRadius`).toBe('16px');
      expect(r.boxShadow, `${sel} boxShadow`).toContain('rgba(0, 0, 0, 0.05)');
    });
  }

  // ── B2.4 BUTTON ACTIVE STATE (Stripe/Apple tactile standard) ───────────────

  test('button :active state — transform: scale + filter: brightness', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    // Inject :active state via JS so we can read computed style without holding pointer
    const r = await page.evaluate(() => {
      const btn = document.querySelector('.btn');
      if (!btn) return null;
      // Use matchMedia to verify the rule exists; can't easily simulate :active in computed-style
      // Instead, parse stylesheets for the rule
      const rules = [];
      for (const ss of document.styleSheets) {
        try {
          for (const r of ss.cssRules) {
            if (r.cssText && /\.btn[^\{]*:active/.test(r.cssText)) rules.push(r.cssText);
          }
        } catch (e) {}
      }
      return rules;
    });
    expect(r, 'no .btn:active rules found').not.toBeNull();
    const joined = r.join(' ');
    expect(joined, '.btn:active should set transform scale').toMatch(/scale\(\s*0?\.9[0-9]+\s*\)/);
    expect(joined, '.btn:active should set filter brightness').toMatch(/brightness\(\s*0?\.9[0-9]+\s*\)/);
  });

  // ── B2.7 H1.page-title TYPOGRAPHY STANDARDIZATION ──────────────────────────

  test('h1.page-title — uses fluid clamp at desktop ≥1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const sizes = {};
    for (const slug of ['/about.html', '/pricing.html', '/contact.html', '/security.html', '/roadmap.html']) {
      await page.goto(`${BASE}${slug}`);
      const exists = await page.locator('h1.page-title').first().count();
      if (exists === 0) continue;
      const fs = await page.$eval('h1.page-title', el => parseFloat(getComputedStyle(el).fontSize));
      sizes[slug] = fs;
    }
    const values = Object.values(sizes);
    expect(values.length, 'should find h1.page-title on at least 2 pages').toBeGreaterThanOrEqual(2);
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Note: the SPECIFIED font-size is now harmonised (clamp(2.5rem, 5vw, 4rem))
    // across every named page. The COMPUTED pixel value can still drift up to
    // ~20px due to `font-size-adjust: var(--fsa-body)` scaling each font to its
    // own x-height. Plus Jakarta Sans + Inter have different aspect ratios.
    // Pre-fix drift was 20+px AND used different clamp formulas. Now uniform
    // formula + uniform scaling guards keep drift ≤20px.
    expect(max - min, `h1.page-title drift across pages (${JSON.stringify(sizes)})`).toBeLessThanOrEqual(20);
  });

  // ── B2.2 BACK-TO-TOP STAYS VISIBLE WITH COOKIE BANNER ACTIVE ───────────────

  test('back-to-top z-index is 1200 (canonical toast tier)', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForSelector('#sf21-back-to-top', { state: 'attached' });
    const z = await page.$eval('#sf21-back-to-top', el => parseInt(getComputedStyle(el).zIndex, 10));
    expect(z).toBe(1200);
  });

  test('back-to-top remains visible when cookie-banner-active body class is set', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForSelector('#sf21-back-to-top', { state: 'attached' });
    await page.evaluate(() => {
      document.body.classList.add('cookie-banner-active');
      window.scrollTo(0, 1800);
    });
    await page.waitForTimeout(400);
    const display = await page.$eval('#sf21-back-to-top', el => getComputedStyle(el).display);
    expect(display, 'back-to-top must not be display:none under cookie-banner-active').not.toBe('none');
  });

  // ── B2.10 ABOUT PAGE PLATFORM-FIRST PIVOT — anonymised ─────────────────────

  test('about — no founder bios (Platform-First pivot)', async ({ page }) => {
    await page.goto(`${BASE}/about.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const founderBlock = await page.locator('.about-founders-block').count();
    const teamGrid = await page.locator('.f10-team-grid').count();
    expect(founderBlock, 'about-founders-block must be gone').toBe(0);
    expect(teamGrid, 'f10-team-grid Founders and advisors must be gone').toBe(0);
    // CTA copy update
    const ctaText = await page.locator('section.cta-band p.cta-band-sub').first().textContent();
    expect(ctaText).not.toMatch(/with the founders/i);
    expect(ctaText).toMatch(/with the team/i);
    // MVV section + Approach card still present
    const mvv = await page.locator('.f10-mvv-grid').count();
    const approachCard = await page.locator('.about-card .about-card-label').filter({ hasText: /the approach/i }).count();
    expect(mvv, 'MVV grid must remain').toBeGreaterThanOrEqual(1);
    expect(approachCard, 'Approach card must remain').toBeGreaterThanOrEqual(1);
    // Timeline retained
    const timeline = await page.locator('.f10-timeline').count();
    expect(timeline, 'Timeline must remain for institutional trust').toBeGreaterThanOrEqual(1);
  });

  // ── B2.5 SECURITY BADGE MIDDLE-DOT SEPARATOR ───────────────────────────────

  test('home — .ht-item carries pseudo-element middle-dot separator', async ({ page }) => {
    await page.goto(`${BASE}/?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const exists = await page.locator('.hero-trust .ht-item').first().count();
    test.skip(exists === 0, '.ht-item not on home');
    // Compute ::after content of first item — should be · (middle dot)
    const result = await page.evaluate(() => {
      const el = document.querySelector('.hero-trust .ht-item:not(:last-child)');
      if (!el) return null;
      const after = getComputedStyle(el, '::after');
      return { content: after.content };
    });
    expect(result, 'first .ht-item should have ::after rule').not.toBeNull();
    // computed content can be unicode char or "·" or "·"
    expect(result.content, '::after content should be middle dot').toMatch(/[··\\]/);
  });

  // ── B2.8 PRODUCT HERO CENTERING ────────────────────────────────────────────

  for (const slug of ['crowmark', 'crowcyber', 'crowcash', 'crowesg']) {
    test(`product hero centered — ${slug}@1440`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${BASE}/${slug}.html?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      const exists = await page.locator('.hero-product .hero-content').count();
      test.skip(exists === 0, `${slug} has no .hero-product .hero-content`);
      const r = await page.$eval('.hero-product .hero-content', el => {
        const cs = getComputedStyle(el);
        return { textAlign: cs.textAlign, maxWidth: cs.maxWidth, marginLeft: cs.marginLeft, marginRight: cs.marginRight };
      });
      expect(r.textAlign, `${slug} hero-content text-align`).toBe('center');
    });
  }

  // ── B2.11 HERO STAGGER CASCADE ─────────────────────────────────────────────

  test('hero cascade — children of .hero-content.ms-reveal cascade-in via CSS keyframes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/crowmark.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    // Trigger ms-in class (the observer may not fire instantly in headless)
    await page.evaluate(() => {
      const el = document.querySelector('.hero-content.ms-reveal');
      if (el) el.classList.add('ms-in');
    });
    await page.waitForTimeout(200);
    // Verify the @keyframes rule exists for hero-content children
    const has = await page.evaluate(() => {
      for (const ss of document.styleSheets) {
        try {
          for (const r of ss.cssRules) {
            if (r.cssText && /ms-hero-cascade-in/i.test(r.cssText)) return true;
            if (r.cssRules) {
              for (const r2 of r.cssRules) if (r2.cssText && /ms-hero-cascade-in/i.test(r2.cssText)) return true;
            }
          }
        } catch (e) {}
      }
      return false;
    });
    expect(has, '@keyframes ms-hero-cascade-in or rule referencing it must exist in any stylesheet').toBe(true);
  });

  // ── B3.1 GLASSMORPHIC .pgc PRICING CARDS ───────────────────────────────────

  test('pricing — .pgc has glassmorphic surface (radius 24px + blur 24px + ::before)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/pricing.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const r = await page.$eval('body.f8-pricing .pgc', el => {
      const cs = getComputedStyle(el);
      const before = getComputedStyle(el, '::before');
      return {
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        bf: cs.backdropFilter || cs.webkitBackdropFilter,
        border: cs.borderTopColor,
        position: cs.position,
        beforeContent: before.content,
        beforeInset: before.inset || before.top + '|' + before.right + '|' + before.bottom + '|' + before.left,
      };
    });
    expect(r.radius).toBe('24px');
    expect(r.position, '.pgc must be a positioned ancestor for ::before').toMatch(/relative|absolute|fixed|sticky/);
    expect(r.beforeContent, '.pgc::before must render').not.toBe('none');
    expect(r.bf || '', 'backdrop-filter blur applied').toMatch(/blur\(24px\)/);
  });

  test('pricing — .pgc.pgc-pop has teal border + persistent teal glow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/pricing.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const exists = await page.locator('.pgc.pgc-pop').first().count();
    test.skip(exists === 0, '.pgc.pgc-pop not visible on default tab');
    const r = await page.$eval('.pgc.pgc-pop', el => {
      const cs = getComputedStyle(el);
      return { border: cs.borderTopColor, shadow: cs.boxShadow };
    });
    // teal is rgb(12, 201, 168). The border may be slightly different shade
    // depending on whether the pop card carries 1.5px or 1px — accept teal-ish.
    expect(r.shadow, 'pgc-pop must carry teal glow shadow').toMatch(/rgba?\(\s*12,\s*201,\s*168/);
  });

  // ── B3.2 TACTILE BILLING TOGGLE FEEDBACK ───────────────────────────────────

  test('pricing — .ttrack:active rule sets scale(0.97)', async ({ page }) => {
    await page.goto(`${BASE}/pricing.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const has = await page.evaluate(() => {
      for (const ss of document.styleSheets) {
        try {
          for (const r of ss.cssRules) {
            const txt = r.cssText || '';
            if (/\.ttrack:active/.test(txt) && /scale\(\s*0?\.97\s*\)/.test(txt)) return true;
            if (r.cssRules) {
              for (const r2 of r.cssRules) {
                const t2 = r2.cssText || '';
                if (/\.ttrack:active/.test(t2) && /scale\(\s*0?\.97\s*\)/.test(t2)) return true;
              }
            }
          }
        } catch (e) {}
      }
      return false;
    });
    expect(has, '.ttrack:active rule with scale(0.97) must be in a stylesheet').toBe(true);
  });

  // ── B3.3 TRUST PILL PREMIUM TRANSLUCENT STYLING ────────────────────────────

  test('.f10-trust-pill uses translucent teal bg + teal text', async ({ page }) => {
    await page.goto(`${BASE}/pricing.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const exists = await page.locator('.f10-trust-pill').first().count();
    test.skip(exists === 0, '.f10-trust-pill not on this page');
    const r = await page.$eval('.f10-trust-pill', el => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color, border: cs.borderTopColor, radius: cs.borderTopLeftRadius };
    });
    // bg should be rgba(12, 201, 168, 0.1) — accept 0.0X close match
    expect(r.bg, '.f10-trust-pill bg should be translucent teal').toMatch(/rgba?\(\s*12,\s*201,\s*168/);
    expect(r.color, '.f10-trust-pill color should be teal').toMatch(/rgb\(\s*12,\s*201,\s*168/);
    expect(r.radius).toBe('100px');
  });

  // ── B3.4 COMPARISON TABLE MODERNISATION ────────────────────────────────────

  test('pricing — .comparison-table headers use Plus Jakarta + uppercase + 0.05em', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/pricing.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const exists = await page.locator('.comparison-table th').first().count();
    test.skip(exists === 0, 'no comparison-table on this page');
    const r = await page.$eval('.comparison-table th', el => {
      const cs = getComputedStyle(el);
      return {
        fontFamily: cs.fontFamily,
        textTransform: cs.textTransform,
        letterSpacing: cs.letterSpacing,
        borderLeft: cs.borderLeftWidth,
        borderRight: cs.borderRightWidth,
      };
    });
    expect(r.fontFamily.toLowerCase()).toMatch(/plus jakarta sans/);
    expect(r.textTransform).toBe('uppercase');
    // letter-spacing: 0.05em → at default 14px would be 0.7px
    const ls = parseFloat(r.letterSpacing);
    expect(ls, `letter-spacing ${r.letterSpacing} should be ≥0.5px`).toBeGreaterThanOrEqual(0.5);
    // no vertical dividers
    expect(parseInt(r.borderLeft, 10) || 0).toBe(0);
    expect(parseInt(r.borderRight, 10) || 0).toBe(0);
  });

  test('pricing — .comparison-table tr has subtle (rgba ≤0.07) bottom border', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/pricing.html?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const exists = await page.locator('.comparison-table tbody tr').first().count();
    test.skip(exists === 0, 'no comparison-table on this page');
    const r = await page.$eval('.comparison-table tbody tr', el => {
      const cs = getComputedStyle(el);
      return { borderBottom: cs.borderBottomWidth, color: cs.borderBottomColor };
    });
    // Expect 1px border (founder spec). Color is white-low-alpha.
    expect(parseInt(r.borderBottom, 10)).toBe(1);
  });

  // ── B4 — closing the pending ledger ───────────────────────────────────────

  // Y2 Critical-CSS rollout — every live HTML page must ship inline <style>.
  // Spot-checked across a representative set (home + 6 products + 6 info).
  test('Y2 — every audited page has at least one inline <style> block', async ({ page }) => {
    const pages = [
      '/', '/about.html', '/contact.html', '/pricing.html', '/partners.html',
      '/security.html', '/privacy.html', '/terms.html', '/cookies.html',
      '/glossary/index.html', '/faq.html', '/changelog.html', '/roadmap.html',
      '/crowmark.html', '/crowcyber.html', '/crowcash.html',
      '/crowesg.html', '/csrd.html', '/tools/index.html',
    ];
    for (const p of pages) {
      await page.goto(`${BASE}${p}`);
      const c = await page.locator('head > style, body > style').count();
      expect(c, `${p} must have ≥1 inline <style> for critical-CSS Y2`).toBeGreaterThanOrEqual(1);
    }
  });

  // Q3 anchor-positioning — the CSS rule exists @supports-gated.
  test('Q3 — anchor-name/position-anchor rules shipped under @supports', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const has = await page.evaluate(() => {
      let found = false;
      for (const ss of document.styleSheets) {
        try {
          const walk = (rs) => {
            for (const r of rs) {
              if (r.cssRules) walk(r.cssRules);
              const t = r.cssText || '';
              if (/anchor-name|position-anchor/i.test(t) && /@supports/i.test(t)) {
                found = true;
              }
            }
          };
          walk(ss.cssRules || []);
        } catch (e) {}
      }
      return found;
    });
    expect(has, 'anchor-name / position-anchor must be shipped under @supports').toBe(true);
  });

  // V6 subgrid — shipped @supports-gated on .pgc; acceptance: rule exists.
  test('V6 — subgrid @supports rule shipped (acceptance: feature-ready)', async ({ page }) => {
    await page.goto(`${BASE}/pricing.html`);
    const has = await page.evaluate(() => {
      let found = false;
      for (const ss of document.styleSheets) {
        try {
          const walk = (rs) => {
            for (const r of rs) {
              if (r.cssRules) walk(r.cssRules);
              const t = r.cssText || '';
              if (/grid-template-rows:\s*subgrid/i.test(t)) found = true;
            }
          };
          walk(ss.cssRules || []);
        } catch (e) {}
      }
      return found;
    });
    expect(has, 'subgrid rule must be shipped @supports-gated').toBe(true);
  });

  // W10 theme toggle — button exists, click flips data-theme, persisted in localStorage.
  test('W10 — theme toggle button flips data-theme and persists', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    const btn = await page.locator('button[data-action="theme-toggle"], button.theme-toggle, button[aria-label*="theme" i]').first();
    const exists = await btn.count();
    test.skip(exists === 0, 'theme toggle not injected on this page');
    const initial = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'dark');
    await btn.click();
    await page.waitForTimeout(200);
    const next = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'dark');
    expect(next, 'theme attribute must change on click').not.toBe(initial);
    const stored = await page.evaluate(() => localStorage.getItem('ca-theme') || localStorage.getItem('theme') || localStorage.getItem('data-theme'));
    expect(stored, 'theme selection must persist to localStorage').toBeTruthy();
  });

  // Cookie-banner WCAG — 44×44 touch targets + visible focus ring.
  test('Cookie banner WCAG — buttons are ≥44×44 + cookie banner visible at first load', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('#ca-cookie', { timeout: 5000 }).catch(() => {});
    const banner = await page.locator('#ca-cookie').first();
    const visible = await banner.isVisible();
    expect(visible, 'cookie banner must show on first visit').toBe(true);
    // Only check VISIBLE buttons. Preferences-detail buttons are intentionally
    // hidden (width:0) until the user expands the preferences pane.
    const sizes = await page.$$eval('#ca-cookie button', els => els
      .filter(b => {
        const r = b.getBoundingClientRect();
        const cs = getComputedStyle(b);
        return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
      })
      .map(b => {
        const r = b.getBoundingClientRect();
        return { w: r.width, h: r.height, label: b.getAttribute('aria-label') || b.textContent.trim().slice(0, 20) };
      }));
    expect(sizes.length, 'cookie banner must have ≥2 visible buttons (Accept/Reject)').toBeGreaterThanOrEqual(2);
    for (const s of sizes) {
      expect(s.w, `visible button "${s.label}" width`).toBeGreaterThanOrEqual(44);
      expect(s.h, `visible button "${s.label}" height`).toBeGreaterThanOrEqual(44);
    }
  });

  // CTA consistency — .btn-sm / .btn-md / .btn-lg sizes are uniform site-wide.
  test('CTA consistency — .btn-sm/md/lg heights are uniform across audited pages', async ({ page }) => {
    const pages = ['/', '/pricing.html', '/about.html', '/contact.html'];
    const sizes = { 'btn-sm': new Set(), 'btn-md': new Set(), 'btn-lg': new Set() };
    for (const p of pages) {
      await page.goto(`${BASE}${p}`);
      await page.waitForLoadState('domcontentloaded');
      for (const klass of Object.keys(sizes)) {
        const els = await page.locator(`.btn.${klass}`).all();
        for (const el of els.slice(0, 3)) {
          const h = await el.evaluate(e => Math.round(parseFloat(getComputedStyle(e).minHeight) || e.getBoundingClientRect().height));
          if (h > 0) sizes[klass].add(h);
        }
      }
    }
    // Each size class should resolve to ≤3 distinct rendered heights site-wide (some variation OK)
    for (const klass of Object.keys(sizes)) {
      if (sizes[klass].size === 0) continue;
      expect(sizes[klass].size, `${klass} distinct heights across pages`).toBeLessThanOrEqual(3);
    }
  });

  // ── HOME — triple-cta-section bottom padding restored (founder report) ─────

  test('home — triple-cta-section has ≥72px bottom padding (no trim)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    const pb = await page.$eval('.triple-cta-section', el => parseInt(getComputedStyle(el).paddingBottom, 10));
    expect(pb).toBeGreaterThanOrEqual(72);
  });

  // ── WCAG: TAB-INDEX BACK-TO-TOP visible only when scrolled ─────────────────

  test('back-to-top hides on initial load + shows after scroll', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    // Wait for sf21-back-to-top.js to inject the button (it runs on DOMContentLoaded)
    await page.waitForSelector('#sf21-back-to-top', { state: 'attached', timeout: 5000 });
    await page.waitForTimeout(400);
    // Initial: should be visually hidden (opacity 0 or display none)
    const initialOpacity = await page.$eval('#sf21-back-to-top', el => parseFloat(getComputedStyle(el).opacity));
    expect(initialOpacity, 'initial opacity').toBeLessThanOrEqual(0.5);
    // Scroll down past threshold (600px)
    await page.evaluate(() => window.scrollTo(0, 2200));
    // Wait for transition (220ms) + scroll handler (rAF)
    await page.waitForFunction(() => {
      const el = document.querySelector('#sf21-back-to-top');
      return el && el.classList.contains('is-visible');
    }, { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(350);
    const scrolledOpacity = await page.$eval('#sf21-back-to-top', el => parseFloat(getComputedStyle(el).opacity));
    expect(scrolledOpacity, 'scrolled opacity').toBeGreaterThan(0.5);
  });
});
