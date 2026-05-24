// @ts-check
const { test } = require('@playwright/test');

test('probe blog + 404', async ({ page }, testInfo) => {
  test.setTimeout(40000);
  const base = process.env.BASE_URL || 'http://localhost:8092';
  for (const url of ['/blog/', '/404.html']) {
    await page.goto(base + url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const data = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      const main = document.querySelector('main');
      const h1 = document.querySelector('h1');
      const cs = (el) => el ? window.getComputedStyle(el) : null;
      const sH1 = cs(h1);
      const sM = cs(main);
      const sB = cs(body);
      const sR = cs(root);
      return {
        cls: body.className,
        rootBG: sR && sR.backgroundColor,
        bodyBG: sB && sB.backgroundColor,
        mainBG: sM && sM.backgroundColor,
        h1Color: sH1 && sH1.color,
        h1BG: sH1 && sH1.backgroundColor,
        // The var values currently in effect.
        bgVar_root: getComputedStyle(root).getPropertyValue('--bg'),
        cloudVar_root: getComputedStyle(root).getPropertyValue('--cloud'),
        surfVar_root: getComputedStyle(root).getPropertyValue('--surf'),
        bgDarkVar_root: getComputedStyle(root).getPropertyValue('--bg-dark'),
        cloudDarkVar_root: getComputedStyle(root).getPropertyValue('--cloud-dark'),
        bgVar_body: getComputedStyle(body).getPropertyValue('--bg'),
        cloudVar_body: getComputedStyle(body).getPropertyValue('--cloud'),
        htmlClass: root.className,
        htmlDataTheme: root.getAttribute('data-theme'),
        htmlColorScheme: getComputedStyle(root).colorScheme,
        bodyColorScheme: getComputedStyle(body).colorScheme,
        mediaPrefersLight: matchMedia('(prefers-color-scheme: light)').matches,
        mediaPrefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
      };
    });
    testInfo.annotations.push({ type: 'probe', description: url + ' :: ' + JSON.stringify(data) });
    console.log('PROBE', url, JSON.stringify(data));
  }
});
