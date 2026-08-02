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
    await fillValidExceptConsent(page);
    await page.check('#cp-consent');
    await page.evaluate(() => {
      document.querySelector('[name="website"]').value = 'bot';
    });
    await page.click('#cpSubmitBtn');
    // Silent: no error shown, and nothing sent. An error would tell the bot
    // exactly which field to leave alone next time.
    expect(calls).toHaveLength(0);
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

  test('SEO carried over verbatim from the live page', async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle('Contact | CrowAgent');
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
