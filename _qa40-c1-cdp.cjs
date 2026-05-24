const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const client = await page.context().newCDPSession(page);
  await page.goto('http://localhost:8092/?nocache=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelector('.home-demo-cycle__dots').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(500);

  await client.send('DOM.enable');
  await client.send('CSS.enable');
  const root = await client.send('DOM.getDocument');
  const ol = await client.send('DOM.querySelector', { nodeId: root.root.nodeId, selector: '.home-demo-cycle__dots' });
  const computed = await client.send('CSS.getComputedStyleForNode', { nodeId: ol.nodeId });
  const interesting = ['padding-inline-start','padding-left','padding','padding-inline','flex-direction','display','margin-left','margin-inline-start'];
  const out = {};
  for (const p of computed.computedStyle) {
    if (interesting.includes(p.name)) out[p.name] = p.value;
  }
  console.log('Final computed:', JSON.stringify(out, null, 2));

  // Now query the dot itself
  const dot = await client.send('DOM.querySelector', { nodeId: root.root.nodeId, selector: '.home-demo-cycle__dot' });
  const cs2 = await client.send('CSS.getComputedStyleForNode', { nodeId: dot.nodeId });
  const dotOut = {};
  for (const p of cs2.computedStyle) {
    if (['width','height','background-color','padding','min-height'].includes(p.name)) dotOut[p.name] = p.value;
  }
  console.log('Dot computed:', JSON.stringify(dotOut, null, 2));

  await browser.close();
})();
