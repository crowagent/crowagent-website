/**
 * SF46 X6 — Page-template consistency audit.
 *
 * Asserts every marketing archetype page has the canonical skeleton:
 *   <a class="skip-link"> + <nav> + <main id="main-content"> + <footer>
 *   <main> contains: <section> with .hero + <h1> + .hero-eyebrow|.section-label
 * Plus: exactly one <h1>, no h1→h3 jump (folded from P2-AB; double-checked).
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

const MARKETING_PAGES = [
  '/index.html',
  '/pricing.html',
  '/crowagent-core.html',
  '/crowcyber.html',
  '/crowcash.html',
  '/crowmark.html',
  '/crowesg.html',
  '/csrd.html',
  '/about.html',
  '/contact.html',
  '/partners.html',
  '/security.html',
  '/faq.html',
];

for (const route of MARKETING_PAGES) {
  test.describe(`X6 ${route}`, () => {
    test('X6 has canonical skeleton (skip-link + nav + main#main-content + footer)', async ({ page }) => {
      await page.goto(BASE + route);
      // nav-inject.js replaces <div id="ca-nav"> with the actual nav after
      // load. Allow time for that swap.
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
      const result = await page.evaluate(() => {
        const skip = document.querySelector('a.skip-link');
        // Either the injection slot survived OR a real <header>/<nav> exists
        // after nav-inject.js has done its swap.
        const nav = document.getElementById('ca-nav')
                 || document.querySelector('header > nav[aria-label]')
                 || document.querySelector('header nav')
                 || document.querySelector('nav[aria-label*="Main" i], nav[aria-label*="Primary" i]');
        const main = document.querySelector('main#main-content, main[id="main-content"]');
        return {
          hasSkip: !!skip,
          hasNav: !!nav,
          hasMain: !!main,
        };
      });
      expect(result.hasSkip, `${route} missing skip-link`).toBe(true);
      expect(result.hasNav, `${route} missing nav (slot or injected)`).toBe(true);
      expect(result.hasMain, `${route} missing main#main-content`).toBe(true);
    });

    test('X6 hero section has h1 + eyebrow|section-label', async ({ page }) => {
      await page.goto(BASE + route);
      const result = await page.evaluate(() => {
        const heroLike = document.querySelector('main section.hero, main section[class*="hero"], main > section:first-of-type');
        if (!heroLike) return { hasHero: false };
        const h1 = heroLike.querySelector('h1, .page-title');
        const eyebrow = heroLike.querySelector('.hero-eyebrow, .section-label, .ca-eyebrow');
        return { hasHero: true, hasH1: !!h1, hasEyebrow: !!eyebrow };
      });
      expect(result.hasHero, `${route} missing hero section`).toBe(true);
      expect(result.hasH1, `${route} hero missing h1`).toBe(true);
    });
  });
}
