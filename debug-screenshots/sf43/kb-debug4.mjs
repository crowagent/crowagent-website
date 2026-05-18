import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Listen to focus events globally
const focusLog = await page.evaluate(() => {
  window.__focusLog = [];
  document.addEventListener('focusin', e => {
    window.__focusLog.push({ phase: 'focusin', tag: e.target.tagName.toLowerCase(), href: e.target.getAttribute?.('href'), text: (e.target.textContent || '').trim().slice(0, 20) });
  });
  document.addEventListener('focusout', e => {
    window.__focusLog.push({ phase: 'focusout', tag: e.target.tagName.toLowerCase(), href: e.target.getAttribute?.('href'), text: (e.target.textContent || '').trim().slice(0, 20) });
  });
  return true;
});
console.log('Focus log enabled');

// Tab into the trigger
await page.locator('.nav-dropdown-trigger').first().focus();
await page.waitForTimeout(100);

// Press Enter
await page.keyboard.press('Enter');
await page.waitForTimeout(300);

const log = await page.evaluate(() => window.__focusLog);
console.log('Focus event log after Enter:');
log.forEach((e, i) => console.log(`  ${i}. ${e.phase} ${e.tag}${e.href ? ':' + e.href : ''} "${e.text}"`));

await browser.close();
