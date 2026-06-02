const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('fs');

const targetPages = [
  'about.html',
  'privacy.html',
  'terms.html',
  'cookies.html',
  'cookie-preferences.html',
  'crowagent-core.html',
  'crowcash.html',
  'crowcyber.html',
  'crowesg.html',
  'crowmark.html',
  'csrd.html',
  'pricing.html',
  'blog/brown-discount-commercial-property-values.html',
  'blog/csrd-omnibus-i-2026.html',
  'blog/cyber-essentials-v3-3-danzell-2026.html',
  'blog/epc-band-commercial-property-guide.html',
  'blog/epc-register-explained.html',
  'blog/mees-band-c-2028.html',
  'blog/mees-commercial-property-guide.html',
  'blog/mees-compliance-checklist-commercial-property.html',
  'blog/mees-exemptions-guide.html',
  'blog/mees-fine-exposure-calculator-guide.html',
  'blog/mfa-mandatory-2026.html',
  'blog/ppn-002-social-value-explained.html',
  'glossary/csrd.html',
  'glossary/epc-rating.html',
  'glossary/mees-compliance.html',
  'glossary/ppn-002.html',
  'glossary/si-2015-962.html',
  'glossary/toms-framework.html',
  'tools-csrd-checker-methodology.html',
  'tools-cyber-essentials-readiness-methodology.html',
  'tools-late-payment-calculator-methodology.html',
  'tools-mees-risk-snapshot-methodology.html',
  'tools-ppn002-calculator-methodology.html',
  'tools-vsme-materiality-light-methodology.html'
];

(async () => {
  const browser = await chromium.launch();
  const ruleTotals = {}; 
  let totalHeadingOrderNodes = 0;

  for (const f of targetPages) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto('http://localhost:8092/'+f, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1200);
      const res = await new AxeBuilder({ page }).disableRules(['region','landmark-unique']).analyze();
      
      const headingOrderViolation = res.violations.find(v => v.id === 'heading-order');
      if (headingOrderViolation) {
        totalHeadingOrderNodes += headingOrderViolation.nodes.length;
        console.log(`${f}: ${headingOrderViolation.nodes.length} heading-order nodes`);
      }
    } catch(e){ 
      console.error(`Failed to scan ${f}: ${e.message}`);
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`\nTotal heading-order nodes across targets: ${totalHeadingOrderNodes}`);
})().catch(e=>{console.error(e);process.exit(1);});
