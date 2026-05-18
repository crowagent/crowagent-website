// SF43 probe v2 — drill into V2 + AR3 + A6
import { chromium } from 'playwright';

const BASE = 'http://localhost:8092';
const OUT = 'debug-screenshots/sf43';

const browser = await chromium.launch();

// ---------- V2 — scroll to stats + screenshot the actual section ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  // Dismiss cookie banner if present
  try { await page.click('button:has-text("Accept all")', { timeout: 1000 }); } catch {}
  await page.waitForTimeout(300);

  // Force-disable animations so we can scroll
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none !important; transition:none !important;}' });
  await page.waitForTimeout(200);

  // Find approx y of .sc-num by JS
  const y = await page.evaluate(() => {
    const n = document.querySelector('.sc-num');
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return r.top + window.scrollY;
  });
  if (y != null) {
    await page.evaluate(yy => window.scrollTo(0, Math.max(0, yy - 200)), y);
    await page.waitForTimeout(400);
    await page.screenshot({
      path: OUT + '/v2-stats-section.png',
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
  }

  // Detailed probe — what wins the cascade?
  const detailed = await page.$$eval('.sc-num', nodes => nodes.map(n => {
    const s = getComputedStyle(n);
    // Try to discern: if -webkit-text-fill-color is transparent AND background-clip:text supported AND a gradient exists → it renders.
    // If background-clip not supported → text is invisible.
    const hasGradient = /linear-gradient/i.test(s.backgroundImage);
    const supportsBgClipText = CSS.supports('background-clip', 'text') || CSS.supports('-webkit-background-clip', 'text');
    return {
      text: n.textContent.trim().slice(0, 30),
      color: s.color,
      webkitFill: s.webkitTextFillColor,
      hasGradient,
      supportsBgClipText,
      bgClip: s.backgroundClip,
      webkitBgClip: s.webkitBackgroundClip,
    };
  }));
  console.log('V2 detailed:', JSON.stringify(detailed, null, 2));
  await ctx.close();
}

// ---------- AR3 — drill into the zombie categories ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/csrd.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const findings = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const visibleZero = [];
    const offscreen = [];
    const inHead = [];
    const seg = [];
    const wizard = [];
    const srOnly = [];
    const other = [];

    function describe(el) {
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        cls: (typeof el.className === 'string' ? el.className : (el.className.baseVal || '')).slice(0, 100),
        parent: el.parentElement ? el.parentElement.tagName.toLowerCase() + '.' + ((typeof el.parentElement.className === 'string' ? el.parentElement.className : '') || '').split(' ')[0].slice(0, 30) : null,
        text: (el.textContent || '').trim().slice(0, 50),
        cs_display: getComputedStyle(el).display,
        cs_left: getComputedStyle(el).left,
        cs_pos: getComputedStyle(el).position,
        cs_visibility: getComputedStyle(el).visibility,
      };
    }

    for (const el of all) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const isZero = r.width === 0 && r.height === 0;
      const isOffscreen = r.left < -1000 || cs.left === '-9999px';

      if (isZero) {
        // Categorise
        let inHeadFlag = false;
        let cur = el;
        while (cur) {
          if (cur.tagName === 'HEAD') { inHeadFlag = true; break; }
          cur = cur.parentElement;
        }
        if (inHeadFlag) {
          inHead.push(el);
          continue;
        }
        if (el.classList && el.classList.contains('sr-only')) { srOnly.push(el); continue; }
        if (el.classList && (el.classList.contains('seg-text') || el.classList.contains('seg-btn'))) { seg.push(el); continue; }
        if (el.closest && el.closest('.wizard, .wiz, [data-step], .step-pane, [data-wizard]')) { wizard.push(el); continue; }
        visibleZero.push(el);
      }
      if (isOffscreen) offscreen.push(el);
    }

    return {
      totalNodes: all.length,
      zeroTotal: inHead.length + srOnly.length + seg.length + wizard.length + visibleZero.length,
      inHead: inHead.length,
      srOnly: srOnly.length,
      seg: seg.length,
      wizard: wizard.length,
      visibleZeroNotCategorised: visibleZero.length,
      offscreen: offscreen.length,
      offscreenSample: offscreen.slice(0, 20).map(describe),
      visibleZeroSample: visibleZero.slice(0, 25).map(describe),
    };
  });
  console.log('AR3 detailed:', JSON.stringify(findings, null, 2));
  await ctx.close();
}

// ---------- A6 — find lists with absolute bullet that wraps under text ----------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/csrd.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const lists = await page.evaluate(() => {
    const lis = Array.from(document.querySelectorAll('li'));
    return lis.slice(0, 50).map(li => {
      const cs = getComputedStyle(li);
      const before = getComputedStyle(li, '::before');
      const r = li.getBoundingClientRect();
      // Detect absolute-bullet anti-pattern
      const isAbs = before.position === 'absolute';
      return {
        cls: (typeof li.className === 'string' ? li.className : '').slice(0, 80),
        parentCls: li.parentElement ? (typeof li.parentElement.className === 'string' ? li.parentElement.className : '').slice(0, 80) : '',
        display: cs.display,
        paddingLeft: cs.paddingLeft,
        beforePos: before.position,
        beforeLeft: before.left,
        beforeContent: before.content,
        isAbsBullet: isAbs,
        height: r.height,
        text: (li.textContent || '').trim().slice(0, 60),
      };
    }).filter(o => o.isAbsBullet || o.beforeContent !== 'none');
  });
  console.log('A6 csrd lists:', JSON.stringify(lists.slice(0, 15), null, 2));

  await page.screenshot({ path: OUT + '/a6-csrd-before-375.png', fullPage: true });
  await ctx.close();

  // Also probe blog article
  const ctx2 = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page2 = await ctx2.newPage();
  await page2.goto(BASE + '/blog/cyber-essentials-v3-3-danzell-2026.html', { waitUntil: 'networkidle' });
  await page2.waitForTimeout(500);

  const blogLists = await page2.evaluate(() => {
    const lis = Array.from(document.querySelectorAll('.blog-stripe-prose ul li, .blog-stripe-prose ol li, ul li'));
    return lis.slice(0, 20).map(li => {
      const cs = getComputedStyle(li);
      const before = getComputedStyle(li, '::before');
      return {
        cls: (typeof li.className === 'string' ? li.className : '').slice(0, 80),
        parentCls: li.parentElement ? (typeof li.parentElement.className === 'string' ? li.parentElement.className : '').slice(0, 80) : '',
        display: cs.display,
        paddingLeft: cs.paddingLeft,
        beforePos: before.position,
        beforeContent: before.content,
        text: (li.textContent || '').trim().slice(0, 60),
      };
    }).filter(o => o.beforePos === 'absolute');
  });
  console.log('A6 blog lists:', JSON.stringify(blogLists.slice(0, 10), null, 2));
  await page2.screenshot({ path: OUT + '/a6-blog-before-375.png', fullPage: false });
  await ctx2.close();
}

await browser.close();
console.log('Done.');
