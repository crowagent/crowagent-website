// SF46 batch #8 — Animation + demo runtime audit.
// Founder mandate 2026-05-20: verify every animated / demo component
// actually plays at runtime. Builds the canonical proof that nothing is
// statically "rendered but dead."
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8092';

test.describe('SF46 B8 — Animation + demo runtime', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('home demo cycle — rotates scene within 8s', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('#home-demo-cycle').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const first = await page.$eval('.home-demo-cycle__scene.is-active', el => el.getAttribute('data-scene'));
    await page.waitForTimeout(8000);
    const next = await page.$eval('.home-demo-cycle__scene.is-active', el => el.getAttribute('data-scene'));
    expect(next, `scene should rotate from ${first} within 8s`).not.toBe(first);
  });

  test('how-it-works — tab auto-rotates + scene-active class fires', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('#how').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const first = await page.$eval('.how-tab.active', el => el.getAttribute('data-hw-tab'));
    await page.waitForTimeout(9000);
    const next = await page.$eval('.how-tab.active', el => el.getAttribute('data-hw-tab'));
    expect(next, `tab should rotate from ${first} within 9s`).not.toBe(first);
    const sceneActive = await page.locator('.hw-panel.is-scene-active').count();
    expect(sceneActive, '.is-scene-active class must be on active panel').toBeGreaterThanOrEqual(1);
  });

  test('crow carousel — auto-rotates within 8s', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('.crow-carousel').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const first = await page.$eval('.crow-carousel-slide.is-active', el => el.getAttribute('aria-label'));
    await page.waitForTimeout(8000);
    const next = await page.$eval('.crow-carousel-slide.is-active', el => el.getAttribute('aria-label'));
    expect(next, 'carousel should rotate within 8s').not.toBe(first);
  });

  test('scroll progress bar fills as user scrolls', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(400);
    const initial = await page.$eval('.ca-scroll-progress', el => el.getBoundingClientRect().width).catch(() => 0);
    expect(initial, 'progress bar starts at width ~0').toBeLessThanOrEqual(4);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(400);
    const scrolled = await page.$eval('.ca-scroll-progress', el => el.getBoundingClientRect().width);
    expect(scrolled, `progress bar fills on scroll (was ${initial}, now ${scrolled})`).toBeGreaterThan(initial);
  });

  test('hero stagger cascade runs on product page', async ({ page }) => {
    await page.goto(`${BASE}/crowagent-core.html`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);
    const r = await page.$eval('.hero-content.ms-reveal', el => ({
      hasMsIn: el.classList.contains('ms-in'),
      opacity: parseFloat(getComputedStyle(el).opacity),
      childAnim: getComputedStyle(el.children[0] || el).animationName,
    }));
    expect(r.hasMsIn, 'hero-content must add .ms-in class').toBe(true);
    expect(r.opacity, 'hero-content must be visible').toBeGreaterThan(0.5);
    expect(r.childAnim, 'first child must run ms-hero-cascade-in').toBe('ms-hero-cascade-in');
  });

  test('mees countdown — renders numeric value (not "--")', async ({ page }) => {
    await page.goto(`${BASE}/crowagent-core.html`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    const text = await page.$eval('#mees-days-core, .mees-countdown-value', el => el.textContent.trim());
    expect(text, 'countdown must render a number').toMatch(/^\d+$/);
  });

  test('live-demo postcode widget — submission renders result panel', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('#live-demo').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.fill('#demo-postcode', 'EC1A 1BB');
    await page.click('#demo-submit');
    await page.waitForTimeout(2500);
    const resultText = await page.$eval('#demo-result', el => el.textContent.trim()).catch(() => '');
    expect(resultText.length, 'result panel must render text after submission').toBeGreaterThan(20);
  });

  test('product walkthrough — 4 cards on every live product page', async ({ page }) => {
    for (const slug of ['crowagent-core', 'crowmark', 'crowcyber', 'crowcash', 'crowesg', 'csrd']) {
      await page.goto(`${BASE}/${slug}.html`);
      await page.waitForLoadState('domcontentloaded');
      const n = await page.locator('.pw-sf21-card').count();
      expect(n, `${slug}.html walkthrough cards`).toBe(4);
    }
  });

  test('product hero — demo slot or pre-launch card present on every product', async ({ page }) => {
    const map = {
      'crowagent-core.html': '.hero-demo-slot',
      'crowmark.html':       '.hero-demo-slot',
      'crowcyber.html':      '.hero-demo-slot',
      'crowcash.html':       '.hero-demo-slot',
      'csrd.html':           '.hero-demo-slot',
      'crowesg.html':        '.esg-waitlist-card', // pre-launch: waitlist by design
    };
    for (const [slug, sel] of Object.entries(map)) {
      await page.goto(`${BASE}/${slug}`);
      await page.waitForLoadState('domcontentloaded');
      const c = await page.locator(sel).count();
      expect(c, `${slug} ${sel}`).toBeGreaterThanOrEqual(1);
    }
  });

  // Chatbot removed (owner 2026-05-31): the website ships no chat launcher,
  // so the former "#ca-chatbot-btn injected + visible" assertion was deleted.

  test('SVG mockups carry internal animation elements', async ({ page }) => {
    // Verify the SVG assets we reference actually have <animate> / @keyframes inside.
    const svgs = [
      '/Assets/svg-mockups/how-step-1-upload.svg',
      '/Assets/svg-mockups/how-step-2-analyse.svg',
      '/Assets/svg-mockups/how-step-3-report.svg',
      '/Assets/svg-mockups/how-step-4-export.svg',
      '/Assets/svg-mockups/hero-demo-dashboard.svg',
    ];
    for (const src of svgs) {
      const txt = await page.evaluate(async (url) => {
        const r = await fetch(url);
        return r.ok ? await r.text() : '';
      }, `${BASE}${src}`);
      const animCount = (txt.match(/<animate|<animateTransform|@keyframes|animation:/g) || []).length;
      expect(animCount, `${src} animation elements`).toBeGreaterThanOrEqual(5);
    }
  });
});
