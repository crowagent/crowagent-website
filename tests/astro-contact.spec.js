/**
 * Gate for the Astro /contact page — the site's primary conversion path.
 *
 * Every sitewide "Request access" CTA points at
 * /contact?enquiry=limited-access#contact-form. Three things must hold for that
 * link to work, and each has already failed once on this site:
 *   - the ROUTE must exist (it 404s on Astro today, which is why this exists);
 *   - the #contact-form ANCHOR must exist, or the link lands at the page top;
 *   - the ?enquiry= parameter must still preselect the subject and seed the
 *     message, which two separate legacy scripts used to do between them.
 *
 * The consent assertions matter most. The legacy form marked its consent box
 * `required` while setting `novalidate` and never checking it in JS, so an
 * enquiry could be sent with consent unticked. That is asserted here as a
 * NEGATIVE: the endpoint is intercepted and must never be called.
 *
 *   ASTRO_URL=http://localhost:8095 npx playwright test tests/astro-contact.spec.js
 */
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const BASE = process.env.ASTRO_URL || 'http://localhost:8095';
const ENDPOINT = '**/api/contact/submit';

// networkidle never settles on this page: the Turnstile widget holds a
// connection open. domcontentloaded plus an explicit wait for the form is the
// honest signal that the page is ready.
async function open(page, path = '/contact/') {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#contactPageForm')).toBeVisible();
}

async function fillValidExceptConsent(page) {
  await page.fill('#cp-name', 'Test Person');
  await page.fill('#cp-email', 'test@example.com');
  await page.fill('#cp-msg', 'A message comfortably longer than the twenty character minimum.');
}

/*
 * ── WAIT FOR THE SECURITY CHECK BEFORE PRESSING SEND, 2026-08-05 (O-16) ────
 *
 * The consent test failed here, and it took a while to establish that the form
 * is fine and the test was not. The page loads Cloudflare Turnstile lazily —
 * on first focus into the form, or on first submit, whichever comes first —
 * and until a token exists a CAPTURE-phase listener on the form calls
 * preventDefault() and stopImmediatePropagation(), then shows "The security
 * check is still loading. Please try again in a moment." in #cp-turnstile-err.
 * stopImmediatePropagation is the important word: the page's own field
 * validation is registered afterwards, on the same element, so it never runs
 * on that press. #cp-consent-err stays hidden, and the failure reads exactly
 * like an unenforced consent gate.
 *
 * It is not one. Measured directly: with a token present and consent unticked,
 * the consent error appears, focus moves to the checkbox, and NOTHING is
 * transmitted. The bypass this file was written to prevent does not exist.
 *
 * The gap is only reachable by a machine. A person focuses a field — which
 * starts the load — and then types for several seconds; Playwright fills three
 * fields in under a millisecond and presses immediately. So the honest fix is
 * to make the test wait for the state a human would inevitably have reached,
 * not to relax what it asserts. Every assertion in the consent test is intact.
 */
async function armSecurityCheck(page) {
  await page.locator('#cp-name').focus();
  await page.waitForFunction(
    () => (document.querySelector('[name="cf-turnstile-response"]')?.value ?? '') !== '',
    null,
    { timeout: 25000 },
  );
}

test.describe('/contact — the sitewide CTA target', () => {
  /** @type {string[]} */
  let calls;

  test.beforeEach(async ({ page }) => {
    calls = [];
    await page.route(ENDPOINT, (route) => {
      calls.push(route.request().postData() ?? '');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"ok":true}',
      });
    });
  });

  test('the exact URL every CTA uses resolves, anchor included', async ({ page }) => {
    const res = await page.goto(`${BASE}/contact/?enquiry=limited-access#contact-form`, {
      waitUntil: 'domcontentloaded',
    });
    expect(res.status()).toBe(200);
    await expect(page.locator('#contact-form')).toHaveCount(1);
  });

  test('?enquiry= preselects the subject and seeds the message', async ({ page }) => {
    await open(page, '/contact/?enquiry=limited-access');
    // The option VALUES are a wire contract with the submit API. If this fails
    // because a value was renamed, fix the rename, not the test.
    await expect(page.locator('#cp-type')).toHaveValue('limited-access');
    await expect(page.locator('#cp-msg')).toHaveValue(/^I would like to request access/);
  });

  test('?product= and ?tier= still map to an enquiry type', async ({ page }) => {
    await open(page, '/contact/?product=buyers');
    await expect(page.locator('#cp-type')).toHaveValue('buyer-side');
  });

  test('a retired product slug does NOT resolve to an enquiry type', async ({ page }) => {
    // cyber/cash/esg/csrd are deliberately unmapped: those products no longer
    // exist and must not silently become a sales enquiry.
    await open(page, '/contact/?product=cyber');
    await expect(page.locator('#cp-type')).toHaveValue('');
  });

  test('nothing is transmitted when consent is unticked', async ({ page }) => {
    await open(page);
    await armSecurityCheck(page);
    await fillValidExceptConsent(page);
    await page.click('#cpSubmitBtn');

    await expect(page.locator('#cp-consent-err')).toBeVisible();
    expect(calls, 'no request may reach the endpoint without consent').toHaveLength(0);
    // Focus must land on the control that failed, and the button must stay
    // usable so the corrected retry is not swallowed.
    await expect(page.locator('#cp-consent')).toBeFocused();
    await expect(page.locator('#cpSubmitBtn')).toBeEnabled();
  });

  test('the honeypot drops a bot submission silently', async ({ page }) => {
    await open(page);
    await armSecurityCheck(page);
    await fillValidExceptConsent(page);
    await page.check('#cp-consent');
    await page.evaluate(() => {
      document.querySelector('[name="website"]').value = 'bot';
    });
    await page.click('#cpSubmitBtn');
    // Silent: no error shown, and nothing sent. An error would tell the bot
    // exactly which field to leave alone next time.
    expect(calls).toHaveLength(0);
    // 2026-08-05 (O-16): added. Without it this passes when the press is
    // swallowed for ANY reason — including the security check not being ready,
    // which is how the whole file was failing before. "Nothing was sent" is
    // only evidence of a working honeypot if the submit actually happened.
    await expect(page.locator('#cp-turnstile-err')).toBeHidden();
  });

  test('blur and submit agree on what a valid email is', async ({ page }) => {
    await open(page);
    for (const bad of ['a@b.', 'a@b', 'no-at-sign.com']) {
      await page.fill('#cp-email', bad);
      await page.dispatchEvent('#cp-email', 'blur');
      await expect(page.locator('#cp-email-err')).toBeVisible();
      // The message must have text. The legacy blur handler revealed an EMPTY
      // span — visible to a naive check, invisible to a human.
      await expect(page.locator('#cp-email-err')).toContainText(/valid email/i);
      await expect(page.locator('#cp-email')).toHaveAttribute('aria-invalid', 'true');
    }
    await page.fill('#cp-email', 'real@example.com');
    await expect(page.locator('#cp-email-err')).toBeHidden();
    await expect(page.locator('#cp-email')).toHaveAttribute('aria-invalid', 'false');
  });

  test('no WCAG 2.2 AA violations', async ({ page }) => {
    await open(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  /*
   * 2026-08-05 (O-16). Was "SEO carried over verbatim from the live page",
   * asserting the legacy title "Contact | CrowAgent". That is now stale by
   * DECISION, not by drift: A-89 rewrote the site's titles for length, taking
   * "titles under 20 characters" from 5 to 0, and "Contact | CrowAgent" is 19.
   * The same pass rewrote /pricing/ and /faq/ the same way. Verbatim carry-over
   * stopped being the goal, so the test is renamed to what it now guarantees.
   *
   * The canonical is still asserted verbatim, and deliberately so: the title
   * is a SERP line that may be tuned, the canonical is an identity claim about
   * which URL this page IS, and that must not drift with a redesign.
   */
  test('SEO: title is the tuned one, canonical and breadcrumbs unchanged', async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle('Contact CrowAgent | Book a demo or ask a question');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://crowagent.ai/contact'
    );
    const ld = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => s.textContent)
        .join('')
    );
    expect(ld).toContain('BreadcrumbList');
  });

  for (const width of [390, 768, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflows).toBe(false);
    });
  }
});
