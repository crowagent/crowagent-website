// SF43 probe — V2 sc-num colour, AR3 zombie DOM, A6 bullet leakage
import { chromium } from 'playwright';

const BASE = 'http://localhost:8092';
const OUT = 'debug-screenshots/sf43';

const browser = await chromium.launch();

// ---------- V2: .sc-num colour on homepage ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const data = await page.$$eval('.sc-num', nodes => nodes.slice(0, 10).map(n => {
    const s = getComputedStyle(n);
    return {
      text: n.textContent.trim().slice(0, 30),
      color: s.color,
      webkitFill: s.webkitTextFillColor,
      bgImage: s.backgroundImage.slice(0, 80),
      bgClip: s.backgroundClip || s.webkitBackgroundClip,
    };
  }));
  console.log('V2 sc-num probe:', JSON.stringify(data, null, 2));

  // Scroll to the stats section and screenshot
  try {
    const target = await page.$('.sc-num');
    if (target) {
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
    }
  } catch (e) {}
  await page.screenshot({ path: OUT + '/v2-stats-before.png', fullPage: false });
  await ctx.close();
}

// ---------- AR3: Zombie DOM on /csrd.html ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/csrd.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const counts = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const zeros = all.filter(el => {
      const r = el.getBoundingClientRect();
      return r.width === 0 && r.height === 0;
    });
    const offscreen = all.filter(el => {
      const r = el.getBoundingClientRect();
      // left:-9999 type
      return r.left < -1000;
    });
    const srOnly = all.filter(el => el.classList && el.classList.contains('sr-only'));
    const hiddenAttr = all.filter(el => el.hasAttribute('hidden'));
    const displayNone = all.filter(el => {
      try { return getComputedStyle(el).display === 'none'; } catch { return false; }
    });

    // Sample 20 zero-size nodes
    const sample = zeros.slice(0, 20).map(el => ({
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 80),
      parent: el.parentElement ? el.parentElement.tagName.toLowerCase() + (el.parentElement.className ? '.' + (typeof el.parentElement.className === 'string' ? el.parentElement.className.split(' ')[0] : '') : '') : null,
      text: (el.textContent || '').trim().slice(0, 40),
    }));

    return {
      total: all.length,
      zeros: zeros.length,
      offscreen: offscreen.length,
      srOnly: srOnly.length,
      hiddenAttr: hiddenAttr.length,
      displayNone: displayNone.length,
      sample,
    };
  });
  console.log('AR3 csrd zombie probe:', JSON.stringify(counts, null, 2));

  await page.screenshot({ path: OUT + '/ar3-csrd-zombies-before.png', fullPage: false });
  await ctx.close();
}

// ---------- A6: bullet leakage at 375x812 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/csrd.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const bullets = await page.$$eval('.f10-prose-list li, ul li, ol li', nodes => {
    return nodes.slice(0, 20).map(n => {
      const s = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      let before = null;
      try {
        const b = getComputedStyle(n, '::before');
        before = {
          position: b.position,
          left: b.left,
          top: b.top,
          width: b.width,
          height: b.height,
          background: b.background.slice(0, 60),
        };
      } catch (e) {}
      return {
        cls: (typeof n.className === 'string' ? n.className : '').slice(0, 60),
        display: s.display,
        position: s.position,
        paddingLeft: s.paddingLeft,
        before,
        text: (n.textContent || '').trim().slice(0, 60),
        width: r.width,
      };
    });
  });
  console.log('A6 bullet probe (375px csrd):', JSON.stringify(bullets.slice(0, 5), null, 2));

  await page.screenshot({ path: OUT + '/a6-bullets-375-before.png', fullPage: false });
  await ctx.close();
}

await browser.close();
console.log('Done.');
