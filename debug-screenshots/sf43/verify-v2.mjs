// Drill into why stats not screenshotting
import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// Force reveal/fade classes to visible so screenshot doesn't get gated by IO
await page.addStyleTag({ content: `
  *,*::before,*::after{animation:none !important;transition:none !important;}
  .sf17-reveal,.fade-in-up,.fade-in,.slide-up,.ms-reveal,.reveal,.rev{
    opacity:1 !important; transform:none !important; visibility:visible !important;
  }
` });
await page.waitForTimeout(300);

// Check what's around the .sc-num
const info = await page.evaluate(() => {
  const ns = Array.from(document.querySelectorAll('.sc-num'));
  return ns.map(n => {
    const r = n.getBoundingClientRect();
    const parentSection = n.closest('section');
    const ps = parentSection ? getComputedStyle(parentSection) : null;
    return {
      text: n.textContent.trim().slice(0, 30),
      visible: r.width > 0 && r.height > 0,
      top: r.top + window.scrollY,
      width: r.width,
      sectionDisplay: ps ? ps.display : null,
      sectionOpacity: ps ? ps.opacity : null,
      sectionTransform: ps ? ps.transform : null,
      computed: {
        color: getComputedStyle(n).color,
        webkitFill: getComputedStyle(n).webkitTextFillColor,
        bg: getComputedStyle(n).backgroundImage.slice(0, 60),
        opacity: getComputedStyle(n).opacity,
        visibility: getComputedStyle(n).visibility,
      }
    };
  });
});
console.log(JSON.stringify(info, null, 2));

// Scroll & screenshot - use scrollIntoView
await page.evaluate(() => {
  const n = document.querySelector('.sc-num');
  if (n) n.scrollIntoView({ block: 'center', behavior: 'instant' });
});
await page.waitForTimeout(800);
const viewportContents = await page.evaluate(() => {
  const ns = document.querySelectorAll('.sc-num');
  return Array.from(ns).map(n => {
    const r = n.getBoundingClientRect();
    return { text: n.textContent.trim(), top: r.top, visible_in_viewport: r.top > 0 && r.top < 900 };
  });
});
console.log('After scroll, sc-num positions:', JSON.stringify(viewportContents, null, 2));
await page.screenshot({ path: 'debug-screenshots/sf43/v2-stats.png' });
await browser.close();
