import { chromium } from 'playwright';
const browser = await chromium.launch();
// emulate light mode prefers-color-scheme
const ctx = await browser.newContext({ viewport: {width:1440,height:900}, colorScheme: 'light' });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/intel/cyber-essentials-tracker/', { waitUntil: 'networkidle' });
const data = await page.evaluate(() => {
  const f = document.querySelector('footer.ca-footer');
  if (!f) return { error: 'no footer' };
  const cs = getComputedStyle(f);
  const child = f.querySelector('.ca-footer-col');
  const csChild = child ? getComputedStyle(child) : null;
  return {
    footer: { bg: cs.backgroundColor, color: cs.color, surf: cs.getPropertyValue('--surf'), cloud: cs.getPropertyValue('--cloud'), steel: cs.getPropertyValue('--steel'), mist: cs.getPropertyValue('--mist'), bgImage: cs.backgroundImage.slice(0,200) },
    child: csChild ? { color: csChild.color, surf: csChild.getPropertyValue('--surf') } : null,
    bodyClass: document.body.className,
  };
});
console.log(JSON.stringify(data, null, 2));
await ctx.close();
await browser.close();
