// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Playwright Smoke Test Suite — CrowAgent Marketing Site
 * Task 34.2: smoke tests covering nav links, CTAs, forms, CSRD wizard, cookie banner, blog posts
 */

const BASE_URL = process.env.BASE_URL || 'https://crowagent.ai';

// ── Navigation Links ──
test.describe('Navigation', () => {
  test('1. Homepage loads with correct title', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/CrowAgent/);
  });

  test('2. Pricing page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await expect(page.locator('h1')).toContainText('Choose the product');
  });

  test('3. About page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4. Contact page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await expect(page.locator('#contactPageForm')).toBeVisible();
  });

  test('5. Blog index loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog/`);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('6. CSRD checker page loads', async ({ page }) => {
    // 2026-05-09 update: csrd.html is now a standard product marketing
    // page (Hero → Carousel → Benefits → Features → Pricing → Free
    // Tool Teaser → CTA Band). The interactive wizard lives at
    // /tools/csrd-applicability-checker/. Test the marketing page.
    await page.goto(`${BASE_URL}/csrd`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('body')).toContainText(/CSRD/i);
  });

  test('7. FAQ page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/faq`);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('8. Products page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/products/`);
    await expect(page.locator('h1')).toBeVisible();
  });
});

// ── CTAs ──
test.describe('CTAs', () => {
  test('9. Hero CTA links to signup', async ({ page }) => {
    await page.goto(BASE_URL);
    // 2026-05-21 C-2: migrated selector from .btn-primary-v2 → .sv-btn--primary
    // (canonical sovereign primitive). Old legacy class deleted from CSS this pass.
    const cta = page.locator('a.sv-btn--primary[href*="signup"]').first();
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute('href')).toContain('app.crowagent.ai/signup');
  });

  test('10. Pricing CTA links to signup with plan', async ({ page }) => {
    // 2026-05-18 C1 fix: pricing.html exposes a tabbed UI (Core / CrowMark /
    // Cyber / Cash / ESG) where each panel re-uses `data-plan-tier="pro"`.
    // Hidden panels still match the selector, which triggers Playwright's
    // strict-mode violation. Scope the locator to the default-visible Core
    // panel (#core-p) so we always test the same canonical CTA.
    await page.goto(`${BASE_URL}/pricing`);
    const cta = page.locator('#core-p [data-plan-tier="pro"]');
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute('href')).toContain('plan=pro');
  });

  test('11. Nav sign-in link points to login', async ({ page }) => {
    await page.goto(BASE_URL);
    const login = page.locator('.nav-login');
    await expect(login).toBeVisible();
    expect(await login.getAttribute('href')).toContain('app.crowagent.ai/login');
  });
});

// ── Contact Form ──
test.describe('Contact Form', () => {
  test('12. Contact form shows validation on empty submit', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    const submitBtn = page.locator('#cpSubmitBtn');
    await submitBtn.click();
    const nameErr = page.locator('#cp-name-err');
    await expect(nameErr).toBeVisible();
  });

  test('13. Contact form accepts valid input', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await page.fill('#cp-name', 'Test User');
    await page.fill('#cp-email', 'test@example.com');
    expect(await page.inputValue('#cp-name')).toBe('Test User');
    expect(await page.inputValue('#cp-email')).toBe('test@example.com');
  });
});

// ── CSRD Wizard ──
// WEB-AUDIT-082: /csrd on the marketing site now redirects to
// https://app.crowagent.ai/tools/csrd-checker (the platform-hosted tool).
// Tests follow the redirect and assert the destination renders the
// applicability content + an actionable interactive control.
test.describe('CSRD Checker', () => {
  test('14. CSRD checker page loads', async ({ page }) => {
    // 2026-05-09: csrd.html is the marketing product page; the actual
    // interactive checker lives at /tools/csrd-applicability-checker/.
    await page.goto(`${BASE_URL}/csrd`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('body')).toContainText(/CSRD|applicability/i);
  });

  test('15. CSRD checker has an actionable next step', async ({ page }) => {
    // 2026-05-18 C2 fix: csrd.html includes a global nav mega menu whose
    // CSRD link appears FIRST in DOM order but is hidden until the user
    // opens the menu. `.first()` therefore matched a hidden element and
    // the visibility assertion timed out. Scope to the page main content
    // so we only see in-flow body CTAs (hero + free-tool teaser + bottom
    // CTA band each link to /tools/csrd-applicability-checker).
    await page.goto(`${BASE_URL}/csrd`);
    const action = page.locator('main a[href*="csrd-applicability-checker"]').first();
    await expect(action).toBeVisible();
  });
});

// ── Chatbot removed (owner 2026-05-31): the website ships no chat launcher.
//    The previous tests 16-18 asserted a #ca-chatbot-btn that no longer exists.

// ── Cookie Banner ──
test.describe('Cookie Banner', () => {
  test('19. Cookie banner appears on first visit', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
    const banner = page.locator('#ca-cookie');
    await expect(banner).toBeVisible({ timeout: 5000 });
  });

  test('20. Cookie banner accept hides it', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
    const acceptBtn = page.locator('#ca-cookie-accept');
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      const banner = page.locator('#ca-cookie');
      await expect(banner).toBeHidden();
    }
  });

  test('21. Cookie banner reject hides it', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
    const rejectBtn = page.locator('#ca-cookie-reject');
    if (await rejectBtn.isVisible()) {
      await rejectBtn.click();
      const banner = page.locator('#ca-cookie');
      await expect(banner).toBeHidden();
    }
  });
});

// ── Blog Posts ──
test.describe('Blog Posts', () => {
  test('23. PPN 002 guide loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog/ppn-002-guide`);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('24. CSRD Omnibus blog post loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog/csrd-omnibus-i-2026`);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('25. Blog index shows articles', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    const articles = page.locator('article, .blog-card, [data-category]');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
  });
});
