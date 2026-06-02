const { test } = require('@playwright/test');
test('hud metrics rules', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8092/?_=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '.hero-hud-metrics' });
  const m = await cdp.send('CSS.getMatchedStylesForNode', { nodeId });
  const positionRules = m.matchedCSSRules.filter(r => (r.rule.style.cssProperties || []).some(p => p.name === 'position'));
  console.log(JSON.stringify(positionRules.map(r => ({ sel: r.rule.selectorList.text.slice(0,80), pos: r.rule.style.cssProperties.find(p => p.name === 'position').value })), null, 2));
});
