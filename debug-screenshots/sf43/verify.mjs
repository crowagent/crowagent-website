// SF43 verification — after fixes
import { chromium } from 'playwright';

const BASE = 'http://localhost:8092';
const OUT = 'debug-screenshots/sf43';

const browser = await chromium.launch();

// V2 — homepage stats colour (normal motion + screenshot with reveals forced visible)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const data = await page.$$eval('.sc-num', nodes => nodes.slice(0, 5).map(n => {
    const s = getComputedStyle(n);
    return {
      text: n.textContent.trim().slice(0, 30),
      color: s.color,
      webkitFill: s.webkitTextFillColor,
      bgClip: s.backgroundClip,
    };
  }));
  console.log('V2 (normal motion):', JSON.stringify(data, null, 2));

  // Force reveals visible so screenshot shows content even if observer hasn't fired
  await page.addStyleTag({ content: `
    *,*::before,*::after{animation:none !important;transition:none !important;}
    .sf17-reveal,.fade-in-up,.fade-in,.slide-up,.ms-reveal,.reveal,.rev{
      opacity:1 !important; transform:none !important; visibility:visible !important;
    }
  ` });
  await page.waitForTimeout(200);
  // Use scrollIntoView so the section is centred
  await page.evaluate(() => {
    const n = document.querySelector('.sc-num');
    if (n) n.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + '/v2-stats.png' });
  await ctx.close();
}

// V2 — homepage stats colour (reduced motion)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const data = await page.$$eval('.sc-num', nodes => nodes.slice(0, 5).map(n => {
    const s = getComputedStyle(n);
    return {
      text: n.textContent.trim().slice(0, 30),
      color: s.color,
      webkitFill: s.webkitTextFillColor,
      bgClip: s.backgroundClip,
    };
  }));
  console.log('V2 (reduced motion):', JSON.stringify(data, null, 2));
  await ctx.close();
}

// AR3 — csrd.html zombie count after
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/csrd.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const findings = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const zeros = all.filter(el => {
      const r = el.getBoundingClientRect();
      return r.width === 0 && r.height === 0;
    });
    const offscreen = all.filter(el => {
      const r = el.getBoundingClientRect();
      return r.left < -1000;
    });
    return {
      total: all.length,
      zeros: zeros.length,
      offscreen: offscreen.length,
    };
  });
  console.log('AR3 csrd after:', JSON.stringify(findings, null, 2));

  await page.screenshot({ path: OUT + '/ar3-csrd-zombies.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await ctx.close();
}

// A6 — 375 viewport on /csrd.html with multi-line bullet
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/csrd.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  // Force reveal classes to visible for screenshot
  await page.addStyleTag({ content: `
    *,*::before,*::after{animation:none !important;transition:none !important;}
    .sf17-reveal,.fade-in-up,.fade-in,.slide-up,.ms-reveal,.reveal,.rev{
      opacity:1 !important; transform:none !important; visibility:visible !important;
    }
  ` });
  await page.waitForTimeout(200);

  const probe = await page.evaluate(() => {
    const lis = Array.from(document.querySelectorAll('.f10-prose-list li, .f10-summary-box ul li'));
    return lis.slice(0, 10).map(li => {
      const cs = getComputedStyle(li);
      const before = getComputedStyle(li, '::before');
      const r = li.getBoundingClientRect();
      return {
        display: cs.display,
        gap: cs.gap,
        paddingLeft: cs.paddingLeft,
        beforePosition: before.position,
        beforeLeft: before.left,
        beforeWidth: before.width,
        beforeMarginTop: before.marginTop,
        height: r.height,
        text: (li.textContent || '').trim().slice(0, 60),
      };
    });
  });
  console.log('A6 csrd after:', JSON.stringify(probe, null, 2));

  // Find a multi-line li and screenshot it via scrollIntoView
  await page.evaluate(() => {
    const li = Array.from(document.querySelectorAll('.f10-prose-list li')).find(el => el.getBoundingClientRect().height > 40);
    if (li) li.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + '/a6-bullets-375.png' });

  // Summary box screenshot
  await page.evaluate(() => {
    const li = Array.from(document.querySelectorAll('.f10-summary-box ul li, details.f10-summary-box ul li')).find(el => el.getBoundingClientRect().height > 50);
    if (li) li.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + '/a6-summary-bullets-375.png' });
  await ctx.close();
}

// A6 — also at 1440 to make sure desktop still looks right
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/csrd.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const desktopProbe = await page.$$eval('.f10-prose-list li', nodes => nodes.slice(0, 3).map(n => {
    const cs = getComputedStyle(n);
    const before = getComputedStyle(n, '::before');
    return {
      display: cs.display,
      gap: cs.gap,
      beforeFlex: before.flex,
      beforeWidth: before.width,
    };
  }));
  console.log('A6 desktop check:', JSON.stringify(desktopProbe, null, 2));
  await ctx.close();
}

await browser.close();
console.log('Verification done.');
