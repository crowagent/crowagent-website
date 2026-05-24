/* eslint-disable */
// Nav breakpoint + CTA cascade probe for cluster-delta-critical-fix-2026-05-22
const { chromium } = require('playwright');

const PAGES_CTA = [
  '/crowmark', '/crowcyber', '/crowcash', '/crowagent-core', '/crowesg', '/csrd', '/blog'
];

const NAV_WIDTHS = [320, 640, 768, 1024, 1025, 1050, 1099, 1100, 1101, 1280, 1440];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1) Nav probe across breakpoints
  const navReport = [];
  for (const w of NAV_WIDTHS) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('http://localhost:8092/', { waitUntil: 'domcontentloaded' });
    // give nav-inject time
    await page.waitForSelector('.ham, .nav-links', { timeout: 5000 }).catch(() => {});
    const r = await page.evaluate(() => {
      const ham = document.querySelector('.ham');
      const navlinks = document.querySelector('.nav-links');
      const navactions = document.querySelector('.nav-actions');
      return {
        ham_display: ham ? getComputedStyle(ham).display : 'MISSING',
        ham_w: ham ? ham.getBoundingClientRect().width : 0,
        ham_h: ham ? ham.getBoundingClientRect().height : 0,
        nav_display: navlinks ? getComputedStyle(navlinks).display : 'MISSING',
        nav_actions_display: navactions ? getComputedStyle(navactions).display : 'MISSING',
      };
    });
    navReport.push({ width: w, ...r });
  }
  console.log('NAV-PROBE');
  console.log(JSON.stringify(navReport, null, 2));

  // 2) CTA cascade investigation on broken pages
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const p of PAGES_CTA) {
    await page.goto('http://localhost:8092' + p, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.nav-cta', { timeout: 5000 }).catch(() => {});
    const r = await page.evaluate(() => {
      const cta = document.querySelector('.btn-primary-v2.nav-cta');
      if (!cta) return { found: false };
      const cs = getComputedStyle(cta);
      // Enumerate matched rules via document.styleSheets
      const matched = [];
      for (const sheet of document.styleSheets) {
        let rules;
        try { rules = sheet.cssRules; } catch (e) { continue; }
        if (!rules) continue;
        const walk = (rulesList, mediaQuery, layerName) => {
          for (const rule of rulesList) {
            if (rule.type === CSSRule.MEDIA_RULE) {
              walk(rule.cssRules, rule.conditionText, layerName);
            } else if (rule.type === CSSRule.SUPPORTS_RULE) {
              walk(rule.cssRules, mediaQuery, layerName);
            } else if (rule.cssRules && rule.name) {
              // layer
              walk(rule.cssRules, mediaQuery, rule.name || layerName);
            } else if (rule.selectorText) {
              try {
                if (cta.matches(rule.selectorText)) {
                  const txt = rule.cssText;
                  if (/background/.test(txt)) {
                    matched.push({
                      selector: rule.selectorText,
                      mediaQuery: mediaQuery || '',
                      layer: layerName || '',
                      bg: rule.style.background || '',
                      bgColor: rule.style.backgroundColor || '',
                      bgImage: rule.style.backgroundImage || '',
                      important: rule.style.getPropertyPriority('background') ||
                                 rule.style.getPropertyPriority('background-color') ||
                                 rule.style.getPropertyPriority('background-image'),
                      href: sheet.href || 'inline',
                    });
                  }
                }
              } catch (_) {}
            }
          }
        };
        try { walk(rules, '', ''); } catch (_) {}
      }
      return {
        found: true,
        computed: {
          backgroundColor: cs.backgroundColor,
          backgroundImage: cs.backgroundImage,
          color: cs.color,
          width: cta.getBoundingClientRect().width,
          height: cta.getBoundingClientRect().height,
        },
        matched
      };
    });
    console.log('CTA-PROBE', p);
    console.log(JSON.stringify(r, null, 2));
  }

  await browser.close();
})();
