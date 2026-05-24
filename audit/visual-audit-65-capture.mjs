// Visual audit screenshot capture — 65 production HTML pages
// READ-ONLY script. Captures 4 screenshots per page across desktop/mobile.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = process.env.OUT_DIR || '/tmp/visual-audit-65';
const BASE = 'http://localhost:8092';

// Production page list (65 pages — filtered by globber)
const pages = [
  '/404.html',
  '/about.html',
  '/blog/brown-discount-commercial-property-values.html',
  '/blog/csrd-omnibus-i-2026.html',
  '/blog/cyber-essentials-v3-3-danzell-2026.html',
  '/blog/epc-band-commercial-property-guide.html',
  '/blog/epc-register-explained.html',
  '/blog/index.html',
  '/blog/mees-band-c-2028.html',
  '/blog/mees-commercial-property-guide.html',
  '/blog/mees-compliance-checklist-commercial-property.html',
  '/blog/mees-exemptions-guide.html',
  '/blog/mees-fine-exposure-calculator-guide.html',
  '/blog/mfa-mandatory-2026.html',
  '/blog/ppn-002-guide.html',
  '/blog/ppn-002-social-value-explained.html',
  '/blog/ppn-002-social-value-guide.html',
  '/blog/ppn-014-cyber-essentials-guide.html',
  '/blog/regulatory-updates-2026.html',
  '/blog/retrofit-cost-calculator-guide.html',
  '/blog/social-value-portal-vs-crowmark.html',
  '/blog/social-value-themes-explained.html',
  '/blog/what-is-retrofit-assessment-cost.html',
  '/changelog.html',
  '/contact.html',
  '/cookie-preferences.html',
  '/cookies.html',
  '/crowagent-core.html',
  '/crowcash.html',
  '/crowcyber.html',
  '/crowesg.html',
  '/crowmark.html',
  '/csrd.html',
  '/faq.html',
  '/glossary/csrd.html',
  '/glossary/epc-rating.html',
  '/glossary/index.html',
  '/glossary/mees-compliance.html',
  '/glossary/ppn-002.html',
  '/glossary/si-2015-962.html',
  '/glossary/toms-framework.html',
  '/index.html',
  '/intel/cyber-essentials-tracker/index.html',
  '/intel/mees-tracker/index.html',
  '/partners.html',
  '/pricing.html',
  '/privacy.html',
  '/products/index.html',
  '/resources.html',
  '/roadmap.html',
  '/security.html',
  '/terms.html',
  '/tools/csrd-applicability-checker/index.html',
  '/tools/cyber-essentials-readiness/index.html',
  '/tools/index.html',
  '/tools/late-payment-calculator/index.html',
  '/tools/mees-risk-snapshot/index.html',
  '/tools/ppn-002-calculator/index.html',
  '/tools/vsme-materiality-light/index.html',
  '/tools-csrd-checker-methodology.html',
  '/tools-cyber-essentials-readiness-methodology.html',
  '/tools-late-payment-calculator-methodology.html',
  '/tools-mees-risk-snapshot-methodology.html',
  '/tools-ppn002-calculator-methodology.html',
  '/tools-vsme-materiality-light-methodology.html',
];

function safeName(urlPath) {
  return urlPath.replace(/^\//, '').replace(/\//g, '__').replace(/\.html$/, '') || 'root';
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

const errors = [];
let captured = 0;

for (const urlPath of pages) {
  const name = safeName(urlPath);
  const url = `${BASE}${urlPath}`;

  for (const [device, ctx] of [['desktop', desktopCtx], ['mobile', mobileCtx]]) {
    const page = await ctx.newPage();
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      if (!resp || !resp.ok()) {
        errors.push({ url, device, status: resp ? resp.status() : 'no-response' });
      }
      // Dismiss cookie banner if visible (it's slim, but might still occlude footer)
      try {
        const accept = page.locator('button:has-text("Accept"), button:has-text("Got it"), button:has-text("OK")').first();
        if (await accept.isVisible({ timeout: 500 })) await accept.click({ timeout: 800 });
      } catch {}
      await page.waitForTimeout(400);

      // Fold (above-the-fold)
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(150);
      await page.screenshot({
        path: path.join(OUT_DIR, `${name}-${device}-fold.png`),
        fullPage: false,
      });

      // Full page (desktop only — mobile fold + footer is enough)
      if (device === 'desktop') {
        await page.screenshot({
          path: path.join(OUT_DIR, `${name}-${device}-full.png`),
          fullPage: true,
        });
      } else {
        // Mobile footer: scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(250);
        await page.screenshot({
          path: path.join(OUT_DIR, `${name}-${device}-footer.png`),
          fullPage: false,
        });
      }
      captured++;
    } catch (e) {
      errors.push({ url, device, error: e.message });
    } finally {
      await page.close();
    }
  }
  process.stdout.write(`.`);
}

await desktopCtx.close();
await mobileCtx.close();
await browser.close();

console.log(`\nCaptured: ${captured} screenshot sessions across ${pages.length} pages.`);
if (errors.length) {
  console.log(`Errors: ${errors.length}`);
  fs.writeFileSync(path.join(OUT_DIR, '_errors.json'), JSON.stringify(errors, null, 2));
}
