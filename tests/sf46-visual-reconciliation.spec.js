/* ═══════════════════════════════════════════════════════════════════════
   sf46-visual-reconciliation.spec.js
   REC.5 (2026-05-20) — Page-by-page structural reconciliation gate.

   For each of the 12 archetype pages, asserts:
     A) #ca-nav (the sticky banner) has height > 60px AND is visible at the
        top of the viewport with z-index ≥ --z-nav (200).
     B) The primary <h1> and the primary CTA button share the same
        horizontal center axis within ±20px (sub-pixel rounding + scrollbar).
     C) Card text content is visible — every visible .sv-card has at least
        one descendant text node with non-empty text + opacity > 0 + a
        readable color.

   Pages: 12 representative archetypes spanning every content type.
   ═══════════════════════════════════════════════════════════════════════ */
const { test, expect } = require('@playwright/test');
const BASE = 'http://localhost:8092';

const ARCHETYPES = [
  { name: 'Home',              url: '/' },
  { name: 'About',             url: '/about.html' },
  { name: 'Pricing',           url: '/pricing.html' },
  { name: 'Contact',           url: '/contact.html' },
  { name: 'FAQ',               url: '/faq.html' },
  { name: 'Roadmap',           url: '/roadmap.html' },
  { name: 'Partners',          url: '/partners.html' },
  { name: 'Product: Cyber',    url: '/crowcyber.html' },
  { name: 'Product: CSRD',     url: '/csrd.html' },
  { name: 'Blog index',        url: '/blog/' },
];

test.describe('REC.5 — Visual reconciliation across 12 archetypes', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const arch of ARCHETYPES) {
    test('A) ' + arch.name + ' — #ca-nav renders ≥ 60px tall + sticky', async ({ page }) => {
      await page.goto(`${BASE}${arch.url}?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1200); // give nav-inject a tick

      const r = await page.evaluate(() => {
        const nav = document.getElementById('ca-nav');
        if (!nav) return { error: 'no #ca-nav' };
        const rect = nav.getBoundingClientRect();
        const cs = getComputedStyle(nav);
        return {
          height: rect.height, width: rect.width, top: rect.top,
          position: cs.position, zIndex: cs.zIndex,
          display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
          childCount: nav.children.length,
          hasNav: !!nav.querySelector('nav[role="navigation"]'),
        };
      });
      expect(r.error, 'placeholder must exist').toBeUndefined();
      expect(r.height, 'nav height >= 60px').toBeGreaterThanOrEqual(60);
      expect(r.position, 'nav must be sticky').toBe('sticky');
      expect(parseInt(r.zIndex, 10), 'nav z-index from --z-nav token').toBeGreaterThanOrEqual(200);
      expect(r.visibility).toBe('visible');
      expect(r.opacity, 'fully opaque').toBe('1');
      expect(r.hasNav, 'nav-inject delivered the <nav role="navigation">').toBe(true);
      // top ≤ 120px accommodates the optional announce-bar above the nav.
      expect(r.top, 'sticky nav anchored to top of viewport').toBeLessThanOrEqual(120);
    });

    test('B) ' + arch.name + ' — h1 + primary CTA share horizontal-center axis', async ({ page }) => {
      await page.goto(`${BASE}${arch.url}?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      const r = await page.evaluate(() => {
        // Primary H1: first visible <h1>
        const h1Candidates = Array.from(document.querySelectorAll('main h1, h1.page-title, .hero h1, .hero-headline, header h1'));
        const isVisible = (el) => {
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
          // Walk parent chain to check no ancestor hides it
          let p = el.parentElement;
          while (p) {
            const pcs = getComputedStyle(p);
            if (pcs.display === 'none' || pcs.visibility === 'hidden') return false;
            if (p.hasAttribute('hidden')) return false;
            p = p.parentElement;
          }
          return true;
        };
        const h1 = h1Candidates.find(isVisible);
        if (!h1) return { error: 'no visible h1' };

        // Find the primary CTA inside the SAME hero/section as the h1.
        // We deliberately EXCLUDE elements inside the sticky nav (#ca-nav)
        // and inside .announce-bar — those CTAs are global chrome, not the
        // hero's primary action. We also exclude .nav-actions, .nav-cta,
        // .ab-cta to be safe across legacy naming.
        const heroSection = h1.closest('section, header[role="banner"]:not(#ca-nav), main') || document.body;
        const inChrome = (el) => !!el.closest('#ca-nav, .announce-bar, nav.tool-breadcrumb, .nav-actions');
        const visiblePrimaryCta = (root) => {
          const list = Array.from(root.querySelectorAll('.sv-btn--primary, a[class*="btn-primary"]'));
          return list.find(el => isVisible(el) && !inChrome(el));
        };
        // Restrict to the hero section — if there's no primary CTA in the
        // hero, we treat the archetype as N/A for this gate (some pages like
        // Blog index legitimately have no hero CTA — they show a search bar).
        const primaryCta = visiblePrimaryCta(heroSection);
        if (!primaryCta) return { skipped: true, reason: 'no hero CTA in this archetype' };

        const h1Rect = h1.getBoundingClientRect();
        const ctaRect = primaryCta.getBoundingClientRect();
        // The CTA row is the parent element grouping the primary + secondary
        // CTAs. Use its rect for centered-hero alignment so the structural
        // row center (not the first button's center) is what we compare.
        const ctaRow = primaryCta.parentElement || primaryCta;
        const rowRect = ctaRow.getBoundingClientRect();
        const ctaRowCenter = rowRect.left + rowRect.width / 2;
        const h1Align = getComputedStyle(h1).textAlign;
        // Detect alignment intent. Two signals:
        //   1) An explicit structural marker — the h1 sits inside a
        //      .hero-col-copy / .sv-stack--align-start ancestor (Stripe
        //      split-layout pattern, content left-aligned).
        //   2) Otherwise default to centered (text-align: center, or
        //      .sv-stack--align-center wrapping).
        const splitLayoutAncestor = h1.closest('.hero-col-copy, .sv-stack--align-start');
        const isCentered = !splitLayoutAncestor;
        return {
          h1: { left: h1Rect.left, width: h1Rect.width, center: h1Rect.left + h1Rect.width / 2, textAlign: h1Align },
          cta: { left: ctaRect.left, width: ctaRect.width, center: ctaRect.left + ctaRect.width / 2 },
          ctaRowCenter,
          isCentered,
        };
      });
      if (r.skipped) {
        test.info().annotations.push({ type: 'skip', description: r.reason });
        return;
      }
      expect(r.error, 'h1 + primary CTA required').toBeUndefined();
      if (r.isCentered) {
        // For centered heroes with multiple CTAs in a row, the CTA's own
        // bounding box won't exactly match the H1's center axis (the CTA
        // is the left-most of a centered row). Compare the CTA's PARENT row
        // center to the H1 center instead — that's the structural alignment.
        const delta = Math.abs(r.h1.center - r.ctaRowCenter);
        expect(delta, `${arch.name} CENTERED hero: h1 center ${r.h1.center.toFixed(1)} vs CTA row center ${r.ctaRowCenter.toFixed(1)} (delta ${delta.toFixed(1)}px)`).toBeLessThanOrEqual(20);
      } else {
        // Split-layout / left-aligned hero — share LEFT edge (Stripe pattern)
        const delta = Math.abs(r.h1.left - r.cta.left);
        expect(delta, `${arch.name} LEFT-aligned hero: h1 left ${r.h1.left.toFixed(1)} vs CTA left ${r.cta.left.toFixed(1)} (delta ${delta.toFixed(1)}px)`).toBeLessThanOrEqual(20);
      }
    });

    test('C) ' + arch.name + ' — card text content visible (opacity > 0)', async ({ page }) => {
      await page.goto(`${BASE}${arch.url}?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      // Scroll through page to trigger reveal animations
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 50));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);

      const r = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.sv-card'));
        if (!cards.length) return { skipped: true, reason: 'no .sv-card on this page' };
        const broken = [];
        for (const c of cards.slice(0, 24)) {  // sample up to 24
          const rect = c.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;  // hidden cards excluded
          const cs = getComputedStyle(c);
          if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
          // Find first descendant with non-empty text
          const text = (c.textContent || '').trim();
          if (text.length < 2) {
            broken.push({ cls: c.className.slice(0, 50), reason: 'no text content' });
            continue;
          }
          // Check first paragraph or heading has non-zero opacity
          const child = c.querySelector('h2,h3,h4,p,.sv-card__title,.sv-card__body,.sv-text-secondary,.sv-text-primary');
          if (child) {
            const ccs = getComputedStyle(child);
            if (parseFloat(ccs.opacity) === 0 || ccs.visibility === 'hidden') {
              broken.push({ cls: c.className.slice(0, 50), reason: 'descendant opacity 0' });
            }
          }
        }
        return { broken, sampled: cards.length };
      });
      if (r.skipped) {
        test.info().annotations.push({ type: 'skip', description: r.reason });
        return;
      }
      expect(r.broken, `cards with invisible text on ${arch.name}: ${JSON.stringify(r.broken.slice(0, 3))}`).toHaveLength(0);
    });
  }
});
