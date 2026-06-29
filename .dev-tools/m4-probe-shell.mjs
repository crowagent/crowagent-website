import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: {width:1440,height:900} });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/tools/late-payment-calculator/', { waitUntil: 'networkidle' });
const data = await page.evaluate(() => {
  // find any product-shell / tool-shell heading at top
  const candidates = ['.tool-shell', '.product-shell', '.ca-product-shell', '.tool-header', '.tool-breadcrumb', '.tool-mini-nav', '.ca-tool-shell'];
  const out = [];
  for (const sel of candidates) {
    const el = document.querySelector(sel);
    if (el) {
      const cs = getComputedStyle(el);
      out.push({ sel, text: el.textContent.replace(/\s+/g,' ').trim().slice(0,180), display:cs.display, position:cs.position, width:el.getBoundingClientRect().width, height:el.getBoundingClientRect().height, top: el.getBoundingClientRect().top });
    }
  }
  // also try first element containing the word "CrowAgent" near top-left
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  let n;
  while ((n = tw.nextNode())) {
    const t = (n.textContent || '').trim();
    const r = n.getBoundingClientRect();
    if (r.top >= 0 && r.top < 100 && r.left >= 0 && r.left < 300 && t.toLowerCase().includes('crowagent') && t.length < 80) {
      out.push({ sel: '~top-left-with-CrowAgent', tag: n.tagName, cls: n.className.toString().slice(0,120), text: t, rect: { x:r.x, y:r.y, w:r.width, h:r.height, right:r.right }, overflow: getComputedStyle(n).overflow });
      break;
    }
  }
  return out;
});
console.log(JSON.stringify(data, null, 2));
await ctx.close();
await browser.close();
