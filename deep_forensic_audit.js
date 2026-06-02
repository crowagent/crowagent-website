const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const pages = [
  '/',
  '/pricing.html',
  '/about.html',
  '/contact.html',
  '/faq.html',
  '/crowagent-core.html',
  '/crowcash.html',
  '/crowcyber.html',
  '/crowesg.html',
  '/crowmark.html',
  '/security.html',
  '/partners.html',
  '/resources.html',
  '/roadmap.html',
  '/blog/index.html',
  '/blog/mfa-mandatory-2026.html',
  '/glossary/index.html',
  '/glossary/csrd.html',
  '/tools/index.html',
  '/tools/csrd-applicability-checker/index.html',
  '/tools/cyber-essentials-readiness/index.html',
  '/tools-vsme-materiality-light-methodology.html'
];

async function runDeepAudit() {
  const browser = await chromium.launch();
  const results = [];

  for (const pagePath of pages) {
    const url = `http://localhost:8092${pagePath}`;
    const page = await browser.newPage();
    console.log(`Forensic scan: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Inject Axe for a11y (if available) - skipping for speed, using manual DOM checks
      const audit = await page.evaluate(() => {
        const getRect = (sel) => document.querySelector(sel)?.getBoundingClientRect() || {};
        const getStyle = (sel, prop) => {
          const el = document.querySelector(sel);
          return el ? window.getComputedStyle(el)[prop] : null;
        };

        // 1. Typography Audit
        const h1 = document.querySelector('h1');
        const h1Style = h1 ? {
          font: window.getComputedStyle(h1).fontFamily,
          size: window.getComputedStyle(h1).fontSize,
          weight: window.getComputedStyle(h1).fontWeight,
          lineHeight: window.getComputedStyle(h1).lineHeight,
          color: window.getComputedStyle(h1).color
        } : null;

        // 2. Interactive States Audit
        const buttons = Array.from(document.querySelectorAll('a.sv-btn, button, .cz-btn'));
        const btnStates = buttons.map(b => ({
          text: b.innerText.trim(),
          transition: window.getComputedStyle(b).transition,
          hasHoverEffect: !window.getComputedStyle(b).transition.includes('none')
        }));

        // 3. Spacing & Grid (Optical Alignment)
        const main = document.querySelector('main');
        const container = document.querySelector('.ca-container') || document.querySelector('.container');
        const spacing = {
          mainPaddingTop: getStyle('main', 'paddingTop'),
          containerGutter: container ? window.getComputedStyle(container).paddingLeft : null
        };

        // 4. Performance (Simple)
        const perf = window.performance.getEntriesByType('navigation')[0];

        return {
          title: document.title,
          h1: h1Style,
          spacing,
          interactiveCount: buttons.length,
          interactiveAudit: btnStates.slice(0, 3), // Sample 3
          domNodes: document.querySelectorAll('*').length,
          hardcodedHex: document.documentElement.innerHTML.match(/#[0-9A-Fa-f]{3,6}/g)?.length || 0,
          foucRisk: !!document.querySelector('style[data-fouc]'),
          perf: perf ? { loadTime: perf.duration, domInteractive: perf.domInteractive } : null
        };
      });

      results.push({ path: pagePath, audit });
    } catch (e) {
      results.push({ path: pagePath, error: e.message });
    }
    await page.close();
  }

  await browser.close();
  fs.writeFileSync('deep-audit-results.json', JSON.stringify(results, null, 2));
  console.log('Deep audit complete.');
}

runDeepAudit();
