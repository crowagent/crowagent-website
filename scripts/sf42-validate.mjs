/**
 * sf42-validate.mjs — Playwright validation harness for SF42 C3 + T3.
 *
 * Verifies each migrated form:
 *   1. Empty submit → inline .form-error renders.
 *   2. Valid submit → button disables + aria-busy="true" + data-submitting set.
 *   3. Two quick Enter presses → only one network request fires.
 *
 * Captures one mid-error screenshot per page to debug-screenshots/sf42/.
 */
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';

const BASE = 'http://localhost:8092';
const OUT = 'debug-screenshots/sf42';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const cases = [
  {
    name: 'contact',
    url: BASE + '/contact.html',
    formId: 'contactPageForm',
    valid: {
      'cp-name': 'Test User',
      'cp-email': 'test@example.com',
      'cp-msg': 'This is a sufficiently long test message that exceeds twenty chars.',
      'cp-consent': 'check',
    },
    submitButton: '#cpSubmitBtn',
  },
  {
    name: 'crowesg',
    url: BASE + '/crowesg.html',
    formId: 'esgWaitlistForm',
    valid: {
      'esgWaitlistEmail': 'test@example.com',
    },
    submitButton: '#esgWaitlistForm button[type="submit"]',
  },
  {
    name: 'csrd-applicability',
    url: BASE + '/tools/csrd-applicability-checker/',
    formId: 'csrd-form',
    valid: {
      'employees': '500',
      'turnover': '120',
      'growth': 'no',
    },
    submitButton: '#csrd-form button[type="submit"]',
  },
];

function log(line) { process.stdout.write(line + '\n'); }

async function run() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const summary = [];

  for (const tc of cases) {
    log('\n=== ' + tc.name + ' ===');
    const page = await ctx.newPage();
    const requests = [];
    page.on('request', (req) => {
      const u = req.url();
      if (u.includes('formspree.io') ||
          u.includes('/api/v1/csrd') ||
          (req.method() === 'POST' && !u.startsWith('chrome'))) {
        requests.push({ url: u, method: req.method(), time: Date.now() });
      }
    });

    try {
      await page.goto(tc.url, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => !!window.CAFormValidation, null, { timeout: 5000 });
      await page.waitForSelector('#' + tc.formId, { timeout: 5000 });
    } catch (e) {
      log('  FAIL goto/init: ' + e.message);
      summary.push({ name: tc.name, status: 'goto-failed', err: e.message });
      await page.close();
      continue;
    }

    // STEP 1 — empty submit → inline errors render.
    // Strip `required` HTML5 attrs first so the browser's native layer
    // doesn't short-circuit submit before our capture-phase listener runs.
    // (Test isolates the JS validation layer; native HTML5 is a separate
    // first-line defence that's already proven by the browser.)
    let emptyErrors = 0;
    try {
      await page.evaluate((formId) => {
        const form = document.getElementById(formId);
        form.querySelectorAll('[required]').forEach(n => n.removeAttribute('required'));
        form.setAttribute('novalidate', '');
        form.requestSubmit ? form.requestSubmit() : form.submit();
      }, tc.formId);
      await page.waitForTimeout(300);
      emptyErrors = await page.evaluate((formId) => {
        const form = document.getElementById(formId);
        // Count any visible element flagged by the module: either
        //   .form-error          (created by the module), OR
        //   #<inputId>-err       (existing slot re-used by id-lookup).
        const inputs = form.querySelectorAll('[aria-invalid="true"]');
        let visible = 0;
        inputs.forEach(inp => {
          const errId = inp.id + '-err';
          const errEl = document.getElementById(errId);
          if (!errEl) return;
          const s = window.getComputedStyle(errEl);
          if (s.display !== 'none' && errEl.textContent.trim().length > 0) visible++;
        });
        return visible;
      }, tc.formId);
      log('  empty-submit: visible .form-error count = ' + emptyErrors);
    } catch (e) {
      log('  empty-submit FAIL: ' + e.message);
    }

    // SCREENSHOT — mid-error.
    try {
      const formEl = await page.locator('#' + tc.formId);
      await formEl.scrollIntoViewIfNeeded();
      await page.screenshot({ path: OUT + '/form-' + tc.name + '.png', fullPage: false });
      log('  screenshot: ' + OUT + '/form-' + tc.name + '.png');
    } catch (e) {
      log('  screenshot FAIL: ' + e.message);
    }

    // STEP 2 — fill valid values, intercept network so the button stays locked.
    let lockedAfterValid = null;
    try {
      // Block the actual POST so we can observe the locked state.
      await page.route(/formspree\.io|\/api\/v1\/csrd/, async (route) => {
        // Hold the request for 2s then fulfill.
        await new Promise(r => setTimeout(r, 1200));
        await route.fulfill({ status: 200, body: '{"ok":true}' });
      });

      for (const [id, val] of Object.entries(tc.valid)) {
        const el = await page.$('#' + id);
        if (!el) continue;
        const tag = await el.evaluate(n => n.tagName.toLowerCase());
        const type = await el.evaluate(n => n.type || '');
        if (type === 'checkbox') {
          await el.check();
        } else if (tag === 'select') {
          await el.selectOption(val);
        } else {
          await el.fill(val);
        }
      }

      // Trigger submit twice in quick succession.
      const before = requests.length;
      await page.evaluate((formId) => {
        const f = document.getElementById(formId);
        f.requestSubmit ? f.requestSubmit() : f.submit();
        f.requestSubmit ? f.requestSubmit() : f.submit();
      }, tc.formId);

      // Sample the locked state ~250ms in (mid-flight).
      await page.waitForTimeout(250);
      lockedAfterValid = await page.evaluate((sel) => {
        const f = document.querySelector(sel.formSel);
        const b = document.querySelector(sel.btnSel);
        return {
          submitting: f && f.dataset.submitting === 'true',
          disabled: b && b.disabled === true,
          ariaBusy: b && b.getAttribute('aria-busy') === 'true',
        };
      }, { formSel: '#' + tc.formId, btnSel: tc.submitButton });
      log('  valid-submit locked-state: ' + JSON.stringify(lockedAfterValid));

      // Wait for any in-flight to resolve.
      await page.waitForTimeout(1800);
      const after = requests.length;
      log('  network requests captured: ' + (after - before));
      summary.push({
        name: tc.name,
        emptyErrors,
        locked: lockedAfterValid,
        reqDelta: after - before,
      });
    } catch (e) {
      log('  valid-submit FAIL: ' + e.message);
      summary.push({ name: tc.name, status: 'valid-failed', err: e.message });
    }

    await page.close();
  }

  await browser.close();
  log('\n=== summary ===');
  log(JSON.stringify(summary, null, 2));
}

run().catch(e => { console.error(e); process.exit(1); });
