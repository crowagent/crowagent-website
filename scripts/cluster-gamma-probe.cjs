/* Cluster Gamma performance probe — measures network state for homepage.
   Captures: JS file count, cookie-banner.js fetch count, arrow lottie fetch
   count, hero image bytes, logo image bytes, total bytes. */
const { chromium } = require('playwright');

const PAGE_URL = process.env.URL || 'http://localhost:8092/';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const reqs = [];
  page.on('response', async (resp) => {
    try {
      const req = resp.request();
      const url = req.url();
      const status = resp.status();
      const type = req.resourceType();
      const ct = (resp.headers()['content-type'] || '').split(';')[0];
      let bytes = 0;
      try {
        const b = await resp.body();
        bytes = b ? b.length : 0;
      } catch (e) { bytes = 0; }
      reqs.push({ url, status, type, ct, bytes });
    } catch (e) {}
  });

  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);

  const ORIGIN = new (require('url').URL)(PAGE_URL).origin;
  const jsReqs = reqs.filter(r => r.type === 'script' && r.url.startsWith(ORIGIN));
  const cookieBanner = reqs.filter(r => /cookie-banner\.js/.test(r.url));
  const arrowJson = reqs.filter(r => /arrow-right-stroke\.json/.test(r.url));
  const heroPng = reqs.filter(r => /hero-premium-earth\.png/.test(r.url));
  const heroAvif = reqs.filter(r => /hero-(premium-earth|earth-cinematic)/.test(r.url));
  const logo = reqs.filter(r => /crowagent-logo-2-dark/.test(r.url));

  const out = {
    url: PAGE_URL,
    totalRequests: reqs.length,
    jsFileCount: jsReqs.length,
    jsFiles: jsReqs.map(r => r.url.replace(ORIGIN, '')),
    cookieBannerFetches: cookieBanner.length,
    cookieBannerUrls: cookieBanner.map(r => r.url),
    arrowJsonFetches: arrowJson.length,
    heroPngFetches: heroPng.length,
    heroPngBytes: heroPng.reduce((s, r) => s + r.bytes, 0),
    heroAvifFetches: heroAvif.length,
    heroAvifBytes: heroAvif.reduce((s, r) => s + r.bytes, 0),
    logoFetches: logo.length,
    logoUrls: logo.map(r => ({ url: r.url, bytes: r.bytes, ct: r.ct })),
    logoBytes: logo.reduce((s, r) => s + r.bytes, 0),
  };

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
