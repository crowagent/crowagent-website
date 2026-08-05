// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Playwright Smoke Test Suite — CrowAgent Marketing Site
 * Task 34.2: smoke tests covering nav links, CTAs, forms, cookie banner, blog posts
 *
 * ── TARGET: THE ASTRO TREE (astro/dist on :8095) ───────────────────────────
 * Retargeted 2026-08-05 under O-16, on the owner's instruction to fix the
 * whole suite.
 *
 * It defaulted to https://crowagent.ai, and passed 19/19 there. That green was
 * worth almost nothing: the site is under a deploy freeze, so production is a
 * frozen snapshot that no change in this repo can affect, and the tree that
 * every other agent spent the evening changing was never loaded. A smoke suite
 * that cannot be made red by the code you are writing is not a smoke suite.
 *
 * It now runs against the rebuild, which is the tree that will become
 * production. Pass BASE_URL=https://crowagent.ai to use it as a production
 * monitor instead — that mode is still useful, it just must not be the default.
 *
 * Routes are directory-form (/pricing/, not /pricing.html) because that is
 * what the Astro build emits and what production will serve.
 */

const BASE_URL = process.env.BASE_URL || process.env.ASTRO_URL || 'http://127.0.0.1:8095';

// ── Navigation Links ──
/*
 * 2026-08-05 (O-16) — WHY EVERY ROUTE TEST NOW ASSERTS A STATUS CODE.
 *
 * Five of these read "go to route, expect an <h1> to be visible", and that is
 * unfailable on the thing they exist to catch. The Astro 404 page renders
 * <h1 id="not-found-title">That page does not exist.</h1> inside a normal
 * layout, so a deleted or renamed route serves a page with a perfectly visible
 * h1 and the test goes green on a page that is not there. The responsive spec
 * was bitten by precisely this in August and carried five dead routes for
 * weeks; the note it left is a few files away and this suite had the same hole.
 *
 * Directory-form URLs are used because that is what the build emits; the
 * extensionless form only worked via a 302 the static host would also have to
 * honour.
 */
test.describe('Navigation', () => {
  test('1. Homepage loads with correct title', async ({ page }) => {
    const res = await page.goto(BASE_URL);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/CrowAgent/);
  });

  test('2. Pricing page loads', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/pricing/`);
    expect(res?.status()).toBe(200);
    // 2026-08-01: was 'Choose the product'. The pricing hero was rewritten
    // during the transformation; assert the current copy.
    await expect(page.locator('h1')).toContainText('See the price first');
  });

  test('3. About page loads', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/about/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4. Contact page loads', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/contact/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('#contactPageForm')).toBeVisible();
  });

  test('5. Blog index loads', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/blog/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  // 2026-08-01: was "CSRD checker page loads". /csrd was withdrawn with the
  // rest of the retired portfolio and 301s away, so this monitored a redirect
  // and could not fail. CrowMark for Buyers is the page that matters now.
  test('6. CrowMark for Buyers page loads', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/crowmark-buyers/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('body')).toContainText(/CrowMark/i);
  });

  test('7. FAQ page loads', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/faq/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  // 2026-08-01: was "/products/", which no longer exists. The tools hub is the
  // live equivalent surface and is a real acquisition route.
  test('8. Tools hub loads', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/tools/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  // A-128, 2026-08-05. The one free tool the site now has. It 404s on
  // production today, which is the open half of that board item, so a check
  // that it exists in the tree we are about to ship belongs in the smoke run.
  test('8b. The tender compliance matrix, the site’s one free tool, exists', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/tools/tender-compliance-matrix/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  // A-128, 2026-08-05. The withdrawn calculator must NOT come back. The owner
  // instruction of 2026-08-04 was "remove PPN 002 calculator page completly
  // also with redirects"; the Astro route is deleted and both URL forms are
  // meant to 301 to /glossary/ppn-002. Asserted as an absence, because the
  // failure everyone actually fears here is its quiet return.
  test('8c. The withdrawn PPN 002 calculator is gone', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/tools/ppn-002-calculator/`);
    // A static preview server has no _redirects engine, so a 404 here and the
    // 301 production is meant to serve are the same fact: the page is not
    // served from the tree. What must never happen is a 200 carrying the tool.
    expect(
      res?.status(),
      'the withdrawn PPN 002 calculator is being served again',
    ).not.toBe(200);
  });
});

// ── CTAs ──
test.describe('CTAs', () => {
  // 2026-08-01: this asserted a self-serve signup CTA pointing at
  // app.crowagent.ai/signup. That model is gone: the site is access-request
  // only, and there is not one /signup link left on any page. The test was
  // therefore checking for something the product deliberately does not do.
  //
  // 2026-08-05 (O-16): `a.nt-btn-primary` is a legacy-tree class and matches
  // nothing in the Astro build, whose button primitive emits
  // `btn btn--primary btn--<size>`. Asserted on the primitive class, not the
  // size or the scoped astro-* hash, so a restyle is not a failure.
  test('9. Hero CTA opens the access request', async ({ page }) => {
    await page.goto(BASE_URL);
    const cta = page.locator('a.btn--primary').first();
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute('href')).toContain('/contact');
  });

  // 2026-08-01: #core-p was the Core product's pricing panel. Core was
  // decommissioned, the tabbed Core/Cyber/Cash/ESG UI went with it, and no
  // element on the page carries data-plan-tier any more. Rewritten against
  // what pricing actually offers now: a per-tier enquiry link.
  test('10. Pricing CTA carries the tier through to the enquiry', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    const cta = page.locator('a[href*="/contact"][href*="tier="]').first();
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute('href')).toContain('tier=');
  });

  // 2026-08-05 (O-16): `.nav-login` is the legacy nav-inject.js class. The
  // Astro header renders its own markup and calls it `.ca-nav-login`.
  test('11. Nav sign-in link points to login', async ({ page }) => {
    await page.goto(BASE_URL);
    const login = page.locator('.ca-nav-login').first();
    await expect(login).toBeVisible();
    expect(await login.getAttribute('href')).toContain('app.crowagent.ai/login');
  });
});

// ── Contact Form ──
test.describe('Contact Form', () => {
  /*
   * 2026-08-05 (O-16). This test failed, and the reason is worth writing down
   * because it looks exactly like a broken form and is not one.
   *
   * The contact page loads Cloudflare Turnstile LAZILY, on first focus into
   * the form or on first submit, whichever comes first. Until a token exists,
   * a capture-phase listener on the form calls preventDefault() and
   * stopImmediatePropagation() and shows "The security check is still
   * loading." The page's own field validation is registered later and is
   * therefore never reached on that first press.
   *
   * A human types for several seconds before pressing Send, by which time the
   * widget has long since resolved. Playwright fills three fields in
   * milliseconds and presses immediately, so it — and only it — lands in the
   * gap. Waiting for the token is not weakening the assertion; it is the only
   * way to REACH the assertion. What the test is here to prove, that an empty
   * form is refused with a field-level error, is asserted unchanged below.
   */
  async function openContactFormReady(page) {
    await page.goto(`${BASE_URL}/contact/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#contactPageForm')).toBeVisible();
    // Focus triggers the lazy load; then wait for the token the guard checks.
    await page.locator('#cp-name').focus();
    await page
      .waitForFunction(
        () => (document.querySelector('[name="cf-turnstile-response"]')?.value ?? '') !== '',
        null,
        { timeout: 20000 },
      )
      .catch(() => {
        // Deliberately not a hard failure HERE: Turnstile is a third party and
        // a smoke run must not go red because challenges.cloudflare.com was
        // slow. The assertions below still run; if the guard swallowed the
        // press they fail with their own message, which is the honest outcome.
      });
  }

  test('12. Contact form shows validation on empty submit', async ({ page }) => {
    await openContactFormReady(page);
    await page.locator('#cpSubmitBtn').click();
    await expect(page.locator('#cp-name-err')).toBeVisible();
  });

  test('13. Contact form accepts valid input', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact/`);
    await page.fill('#cp-name', 'Test User');
    await page.fill('#cp-email', 'test@example.com');
    expect(await page.inputValue('#cp-name')).toBe('Test User');
    expect(await page.inputValue('#cp-email')).toBe('test@example.com');
  });
});

// ── CSRD Wizard: REMOVED 2026-08-01 ──
// The whole describe block went. CSRD was withdrawn with the retired
// portfolio: /csrd now 301s away and /tools/csrd-applicability-checker no
// longer exists on this site. Both tests followed the redirect and asserted
// against whatever landed, so they could not fail and were monitoring nothing.
// The PPN 002 calculator is the surviving free tool and is covered above.

// ── Chatbot removed (owner 2026-05-31): the website ships no chat launcher.
//    The previous tests 16-18 asserted a #ca-chatbot-btn that no longer exists.

// ── Cookies ──
/*
 * 2026-08-05 (O-16). Tests 19-21 asserted the legacy `#ca-cookie` banner and
 * its accept/reject buttons. The Astro build ships NO banner, and that is
 * correct rather than missing: measured on the built homepage, it requests
 * zero third-party hosts and sets zero cookies, so there is no processing to
 * consent to and a banner would be theatre. PECR/UK GDPR require consent for
 * non-essential storage, not a dialogue about storage that does not happen.
 *
 * Note also what tests 20 and 21 were: `if (await btn.isVisible()) { ... }`.
 * On the Astro build the button is absent, the branch never runs, and the
 * test reports green having asserted precisely nothing. They were unfailable
 * before the banner was removed too — a banner that never appeared would have
 * passed them both. Replaced with the property that actually matters and CAN
 * fail: nothing may be stored without consent, so if a cookie or a
 * third-party request ever appears, this goes red and a banner becomes owed.
 */
test.describe('Cookies', () => {
  test('19. The homepage sets no cookie and calls no third party', async ({ page, context }) => {
    await context.clearCookies();
    const thirdParty = [];
    const origin = new URL(BASE_URL).host;
    page.on('request', (req) => {
      try {
        const host = new URL(req.url()).host;
        if (host !== origin) thirdParty.push(`${req.resourceType()} ${req.url()}`);
      } catch (_) {
        /* opaque URL (data:, blob:) — not a network call to anyone */
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    expect(
      thirdParty,
      'a third-party request appeared: this page now needs a consent banner before it fires',
    ).toEqual([]);
    expect(
      (await context.cookies()).map((c) => c.name),
      'a cookie was set with no consent UI on the page',
    ).toEqual([]);
    expect(
      await page.evaluate(() => [
        ...Object.keys(localStorage),
        ...Object.keys(sessionStorage),
      ]),
      'web storage was written with no consent UI on the page',
    ).toEqual([]);
  });
});

// ── Blog Posts ──
test.describe('Blog Posts', () => {
  // 2026-08-05 (O-16): the slug is /blog/ppn-002-social-value-guide/ in the
  // Astro content collection. /blog/ppn-002-guide does not exist there, and
  // pointing at a missing route would have been caught only because the 404
  // page has no <h1> in <main> — a thin thread to hang a route check on.
  test('23. PPN 002 social value guide loads', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/blog/ppn-002-social-value-guide/`);
    expect(res?.status(), 'the post must exist, not merely render something').toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  // 2026-08-01: was the CSRD Omnibus post, which is not in blog/ any more.
  // Retargeted at a post that exists and is a live acquisition page.
  test('24. Procurement Act SME guide loads', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/blog/procurement-act-2023-sme-guide/`);
    expect(res?.status(), 'the post must exist, not merely render something').toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  /*
   * 2026-08-05 (O-16). Was `article, .blog-card, [data-category]`, which
   * matches nothing in the Astro build and returned 0. That is a markup change,
   * not a defect: the index renders a semantic list — <ul><li class="ledger__row">
   * <a class="ledger__link" href="/blog/…"> — and a list of links to posts needs
   * no <article> wrapper.
   *
   * Rewritten to assert the outcome instead of the markup: the index must offer
   * links to posts, and those posts must exist. Counting elements would have
   * gone green again the moment somebody wrapped the rows in a div; a dead link
   * from the index is the failure a reader would actually meet.
   */
  test('25. Blog index links to posts that exist', async ({ page, request }) => {
    await page.goto(`${BASE_URL}/blog/`);
    const hrefs = await page.evaluate(() =>
      [...new Set(
        [...document.querySelectorAll('main a[href*="/blog/"]')]
          .map((a) => a.getAttribute('href'))
          .filter((h) => h && !/\/blog\/?$/.test(h) && !h.startsWith('#')),
      )],
    );
    expect(hrefs.length, 'the blog index must link to at least one post').toBeGreaterThan(0);

    const dead = [];
    for (const href of hrefs) {
      const url = /^https?:\/\//i.test(href) ? href : `${BASE_URL}${href}`;
      const res = await request.get(url);
      if (res.status() >= 400) dead.push(`${href} (${res.status()})`);
    }
    expect(dead, 'the blog index must not link to a post that is not there').toEqual([]);
  });
});
