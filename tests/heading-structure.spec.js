/**
 * Heading structure across every Astro route.
 *
 * WHY THIS EXISTS. Four pages shipped with NO h1 at all — contact, faq, about
 * and partners — because the Section primitive they are built from only allowed
 * `h2 | h3`, and defaulted to h2. Every hand-built page on the site had one, so
 * nothing looked wrong: the pages rendered correctly, read correctly, and passed
 * axe, which does not require an h1.
 *
 * It cost a page its document title in the accessibility tree and its strongest
 * on-page ranking signal, invisibly, on four pages at once. That is the shape of
 * defect a primitive introduces: silent, uniform, and everywhere the primitive
 * is used.
 *
 * My own earlier heading check missed it too, because it asserted "no level
 * skip" and a page starting at h2 with no h1 never skips. So this file asserts
 * BOTH properties, and the h1 one first.
 *
 *   ASTRO_URL=http://localhost:8095 npx playwright test tests/heading-structure.spec.js
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.ASTRO_URL || 'http://localhost:8095';

/** One representative route per template, plus every bespoke page. */
const ROUTES = [
  '/',
  '/contact/',
  '/faq/',
  '/about/',
  '/partners/',
  '/resources/',
  '/changelog/',
  '/crowmark/',
  '/crowmark-buyers/',
  '/tools/',
  '/privacy/',
  '/terms/',
  '/cookies/',
  '/security/',
  '/blog/',
  '/blog/regulatory-updates-2026/',
  '/compare/',
  '/compare/crowmark-vs-autogenai/',
  '/sectors/',
  '/sectors/construction/',
  '/glossary/',
  '/glossary/ppn-002/',
];

for (const route of ROUTES) {
  test(`${route} has exactly one h1`, async ({ page }) => {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
    const h1s = await page.evaluate(() =>
      [...document.querySelectorAll('main h1')].map((h) => h.textContent.trim())
    );
    // Naming the headings in the failure makes a regression readable without
    // opening the page.
    expect(h1s, `expected exactly one h1, found ${h1s.length}: ${JSON.stringify(h1s)}`).toHaveLength(
      1
    );
    expect(h1s[0].length, 'the h1 must not be empty').toBeGreaterThan(0);
  });

  test(`${route} has no heading-level skip`, async ({ page }) => {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
    const levels = await page.evaluate(() =>
      [...document.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main h6')].map((h) => ({
        level: Number(h.tagName[1]),
        text: h.textContent.trim().slice(0, 40),
      }))
    );
    const skips = [];
    for (let i = 1; i < levels.length; i++) {
      if (levels[i].level - levels[i - 1].level > 1) {
        skips.push(`h${levels[i - 1].level} "${levels[i - 1].text}" -> h${levels[i].level} "${levels[i].text}"`);
      }
    }
    expect(skips, `heading levels jump more than one step: ${skips.join('; ')}`).toEqual([]);
  });
}
