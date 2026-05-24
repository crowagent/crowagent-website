const { test } = require('@playwright/test');
const BASE = 'http://localhost:8092';
test.use({ viewport: { width: 1440, height: 900 } });
test('home h1 alignment cascade', async ({ page }) => {
  await page.goto(`${BASE}/?_=` + Date.now());
  await page.waitForTimeout(1500);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '.hero .hero-headline' });
  const m = await cdp.send('CSS.getMatchedStylesForNode', { nodeId });
  const filtered = (m.matchedCSSRules || []).map(r => ({
    sel: r.rule.selectorList.text.slice(0, 80),
    align: (r.rule.style.cssProperties || []).filter(p => p.name === 'text-align').map(p => p.value + (p.important ? ' !' : '')).join(','),
  })).filter(r => r.align);
  console.log(JSON.stringify(filtered, null, 2));
});
