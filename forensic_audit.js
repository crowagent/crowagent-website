const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const pages = [
  '/',
  '/index.html',
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
  '/glossary/index.html'
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

async function runAudit() {
  const browser = await chromium.launch();
  const results = [];

  const screenshotDir = path.join(__dirname, 'audit-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  for (const pagePath of pages) {
    const pageResults = { path: pagePath, viewports: {} };
    const url = `http://localhost:8092${pagePath}`;

    for (const viewport of viewports) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      console.log(`Auditing ${url} [${viewport.name}]...`);

      try {
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        if (response.status() !== 200) {
          pageResults.viewports[viewport.name] = { error: `HTTP ${response.status()}` };
          await page.close();
          continue;
        }

        const screenshotName = `${pagePath.replace(/\//g, '_')}_${viewport.name}.png`;
        const screenshotPath = path.join(screenshotDir, screenshotName);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const metrics = await page.evaluate(() => {
          const getComputed = (sel, prop) => {
            const el = document.querySelector(sel);
            return el ? window.getComputedStyle(el)[prop] : null;
          };

          const getRect = (sel) => {
            const el = document.querySelector(sel);
            return el ? el.getBoundingClientRect() : null;
          };

          // Check for hardcoded hex colors (rough check)
          const allElements = Array.from(document.querySelectorAll('*'));
          let hardcodedColors = 0;
          const hexRegex = /#[0-9A-Fa-f]{3,6}/;
          
          // This is a simplified check for the audit
          const hasBareHex = (el) => {
            const style = el.getAttribute('style') || '';
            return hexRegex.test(style);
          };
          
          hardcodedColors = allElements.filter(hasBareHex).length;

          return {
            title: document.title,
            h1Count: document.querySelectorAll('h1').length,
            mainExists: !!document.querySelector('main'),
            navExists: !!document.querySelector('nav'),
            footerExists: !!document.querySelector('footer'),
            alignment: {
              logoLeft: getRect('.ca-nav-logo')?.left || getRect('.sv-nav-logo')?.left || getRect('nav img')?.left,
              heroH1Left: getRect('#hero h1')?.left || getRect('h1')?.left,
              containerLeft: getRect('.ca-container')?.left || getRect('.container')?.left || getRect('.wrap')?.left
            },
            hardcodedColorsCount: hardcodedColors,
            hasMotionTokens: !!Array.from(document.styleSheets).some(ss => {
                try {
                    return Array.from(ss.cssRules).some(rule => rule.cssText.includes('--ca-duration'));
                } catch(e) { return false; }
            }),
            hasThemeTokens: !!Array.from(document.styleSheets).some(ss => {
                try {
                    return Array.from(ss.cssRules).some(rule => rule.cssText.includes('--ca-brand'));
                } catch(e) { return false; }
            })
          };
        });

        pageResults.viewports[viewport.name] = {
          screenshot: screenshotName,
          metrics: metrics
        };

      } catch (e) {
        pageResults.viewports[viewport.name] = { error: e.message };
      }

      await page.close();
    }
    results.push(pageResults);
  }

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'audit-results.json'), JSON.stringify(results, null, 2));
  console.log('Audit complete. Results saved to audit-results.json');
}

runAudit();
