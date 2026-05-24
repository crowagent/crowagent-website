const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{ width:1440, height:900 } });
  const page = await ctx.newPage();
  // Use a CDP-level inspector for matched rules
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  await page.goto('http://localhost:8092/?v=' + Date.now(), { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(700);
  const doc = await cdp.send('DOM.getDocument');
  const node = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '.hero-headline' });
  const matched = await cdp.send('CSS.getMatchedStylesForNode', { nodeId: node.nodeId });
  const fontSizeRules = matched.matchedCSSRules.filter(r =>
    r.rule.style && r.rule.style.cssProperties.some(p => p.name === 'font-size')
  );
  const seq = fontSizeRules.map((r, i) => {
    const fs = r.rule.style.cssProperties.find(p => p.name === 'font-size');
    return { i, sel: r.rule.selectorList.text, fs: fs.value, important: !!fs.important, source: r.rule.styleSheetId };
  });
  console.log(JSON.stringify(seq, null, 2));
  // Print sheet sources
  const sheetIds = [...new Set(seq.map(s => s.source))];
  for (const id of sheetIds) {
    const sh = await cdp.send('CSS.getStyleSheetText', { styleSheetId: id }).catch(e => null);
    const meta = matched.cssKeyframesRules; // not useful
  }
  // Resolve sheet metadata via headers
  const ssh = (await cdp.send('CSS.getMediaQueries')).medias || [];
  await browser.close();
})();
