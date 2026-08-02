/**
 * Regression gate for consent enforcement on the contact form.
 *
 * THE DEFECT THIS LOCKS DOWN (found 2026-08-02, live on production).
 * `#cp-consent` carried `required`, but:
 *   - the form sets `novalidate` (contact.html:385), so the browser never
 *     enforced it — that attribute is load-bearing, it is what lets the
 *     designed inline errors fire instead of native validation bubbles;
 *   - the submit handler in scripts.js validated name, email, honeypot and
 *     Turnstile, and never looked at the checkbox.
 * So an enquiry could be sent with the consent box unticked: personal data
 * processed with no consent given. UK GDPR Art. 6(1)(a).
 *
 * WHAT THIS FILE DOES NOT ASSERT, AND WHY.
 * There is no "it submits successfully" test. A real submission depends on
 * Cloudflare Turnstile issuing a token and on app.crowagent.ai answering,
 * neither of which is available or desirable in a local run. Asserting it here
 * would produce a test that fails for reasons that have nothing to do with
 * consent, which is how a suite gets ignored. What matters is the negative
 * case: with the box unticked, nothing leaves the browser. That is asserted by
 * intercepting the endpoint and proving it was never called.
 *
 *   npx playwright test tests/contact-consent.spec.js --project=chromium
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.LEGACY_URL || 'http://localhost:8092';
const ENDPOINT = '**/api/contact/submit';

/** Fills everything the handler validates EXCEPT consent. */
async function fillValidExceptConsent(page) {
  await page.fill('#cp-name', 'Test Person');
  await page.fill('#cp-email', 'test@example.com');
  await page.fill(
    '#cp-msg',
    'This is a message of more than twenty characters, to clear the minlength rule.'
  );
}

test.describe('contact form consent gate', () => {
  /** @type {string[]} */
  let calls;

  test.beforeEach(async ({ page }) => {
    calls = [];
    // Intercept BEFORE navigation so nothing can escape to the real endpoint.
    await page.route(ENDPOINT, (route) => {
      calls.push(route.request().postData() ?? '');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"ok":true}',
      });
    });
    await page.goto(`${BASE}/contact.html`, { waitUntil: 'domcontentloaded' });
    // scripts.min.js stamps data-touched on every required field as it binds
    // the blur handlers, so this is the signal that the form is actually wired.
    await expect(page.locator('#cp-email')).toHaveAttribute('data-touched', /.*/, {
      timeout: 20000,
    });
  });

  test('does not send the enquiry when consent is unticked', async ({ page }) => {
    await fillValidExceptConsent(page);
    await expect(page.locator('#cp-consent')).not.toBeChecked();

    await page.click('#cpSubmitBtn');

    await expect(page.locator('#cp-consent-err')).toBeVisible();
    // The assertion that matters: nothing was transmitted.
    expect(calls, 'no request may reach the endpoint without consent').toHaveLength(0);
  });

  test('explains why, and moves focus to the control that failed', async ({ page }) => {
    await fillValidExceptConsent(page);
    await page.click('#cpSubmitBtn');

    const err = page.locator('#cp-consent-err');
    await expect(err).toBeVisible();
    await expect(err).toContainText(/privacy policy/i);
    // Without focus management a keyboard or screen-reader user gets a form
    // that silently refuses to submit, with the reason further up the page.
    await expect(page.locator('#cp-consent')).toBeFocused();
    // And the error must be programmatically associated, not merely nearby.
    await expect(page.locator('#cp-consent')).toHaveAttribute(
      'aria-describedby',
      'cp-consent-err'
    );
  });

  test('clears the consent error once the box is ticked', async ({ page }) => {
    await fillValidExceptConsent(page);
    await page.click('#cpSubmitBtn');
    await expect(page.locator('#cp-consent-err')).toBeVisible();

    await page.check('#cp-consent');
    /*
     * requestSubmit() rather than a second click, and the reason is a real
     * finding rather than convenience.
     *
     * #cpSubmitBtn carries data-magnetic, so magnetic-pull.js translates it
     * toward the pointer. On a SECOND synthetic click the trace is:
     * pointerdown fires, mousedown fires, and `click` never does — a browser
     * does not synthesise a click when the element moves between press and
     * release. The submit handler is therefore never reached, and the test
     * fails for a reason that has nothing to do with consent.
     *
     * Verified it is delivery and not logic: requestSubmit() and a real
     * keyboard Enter on the focused button both submit correctly. The
     * animation-versus-click interaction is logged separately as OA-07.
     */
    await page.evaluate(() =>
      document.getElementById('contactPageForm').requestSubmit()
    );
    // Consent is no longer the blocker. Whether the submission then succeeds
    // depends on Turnstile and the API, which this file deliberately ignores.
    await expect(page.locator('#cp-consent-err')).toBeHidden();
  });

  test('does not strand the user on a dead button after a rejection', async ({ page }) => {
    /*
     * The CC1 double-submit guard listens in the capture phase and disables the
     * button on EVERY submit event, releasing only after a 15-second timeout.
     * Any validation failure therefore left the primary CTA dead for fifteen
     * seconds with no explanation: the user fixes the field, presses Send, and
     * nothing happens. The handler now releases the lock on every path that
     * decides not to send.
     */
    await fillValidExceptConsent(page);
    await page.click('#cpSubmitBtn');
    await expect(page.locator('#cp-consent-err')).toBeVisible();
    await expect(page.locator('#cpSubmitBtn')).toBeEnabled();
  });

  test('a keyboard user can submit once consent is given', async ({ page }) => {
    await fillValidExceptConsent(page);
    await page.check('#cp-consent');
    await page.locator('#cpSubmitBtn').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#cp-consent-err')).toBeHidden();
  });
});

test.describe('email validation agrees between blur and submit', () => {
  // These used to disagree: blur accepted anything containing '@' and '.', so
  // "a@b." cleared the inline error on blur and was then rejected on submit,
  // which reads as the form changing its mind.
  const CASES = [
    { value: 'a@b.', invalid: true },
    { value: 'a@b', invalid: true },
    { value: 'no-at-sign.com', invalid: true },
    { value: 'real@example.com', invalid: false },
  ];

  for (const { value, invalid } of CASES) {
    test(`blur ${invalid ? 'rejects' : 'accepts'} ${JSON.stringify(value)}`, async ({
      page,
    }) => {
      await page.goto(`${BASE}/contact.html`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#cp-email')).toHaveAttribute('data-touched', /.*/, {
        timeout: 20000,
      });

      await page.fill('#cp-email', value);
      // A real blur event: page.locator().blur() does not reliably reach the
      // listener bound directly on the input.
      await page.dispatchEvent('#cp-email', 'blur');

      const err = page.locator('#cp-email-err');
      if (invalid) await expect(err).toBeVisible();
      else await expect(err).toBeHidden();
    });
  }
});
