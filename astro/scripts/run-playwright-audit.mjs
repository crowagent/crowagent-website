import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];
  const networkFailures = [];

  page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => pageErrors.push(err.message));
  page.on('requestfailed', req => networkFailures.push({ url: req.url(), failure: req.failure()?.errorText }));

  console.log('Navigating to http://localhost:8095/ ...');
  const response = await page.goto('http://localhost:8095/', { waitUntil: 'networkidle' });

  const auditData = {};

  auditData.status = response.status();
  auditData.title = await page.title();
  
  // Meta tags
  auditData.meta = await page.evaluate(() => {
    const metaObj = {};
    document.querySelectorAll('meta').forEach(m => {
      const name = m.getAttribute('name') || m.getAttribute('property');
      if (name) metaObj[name] = m.getAttribute('content');
    });
    return metaObj;
  });

  // Headings
  auditData.headings = await page.evaluate(() => {
    const hs = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return hs.map(h => ({
      tag: h.tagName.toLowerCase(),
      text: h.innerText.trim(),
      id: h.id,
      class: h.className,
      isVisible: h.offsetWidth > 0 && h.offsetHeight > 0
    }));
  });

  // Images
  auditData.images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img, svg'));
    return imgs.map(img => {
      const isSvg = img.tagName.toLowerCase() === 'svg';
      const rect = img.getBoundingClientRect();
      return {
        tag: img.tagName.toLowerCase(),
        src: img.src || img.getAttribute('src') || null,
        alt: img.getAttribute('alt'),
        ariaHidden: img.getAttribute('aria-hidden'),
        role: img.getAttribute('role'),
        width: rect.width,
        height: rect.height,
        isVisible: rect.width > 0 && rect.height > 0
      };
    });
  });

  // Links & Buttons
  auditData.interactive = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"]'));
    return elements.map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type'),
        href: el.getAttribute('href'),
        text: el.innerText.trim() || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '',
        id: el.id,
        className: el.className,
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
        computed: {
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          display: style.display,
          visibility: style.visibility
        }
      };
    });
  });

  // Sections and Narrative flow
  auditData.sections = await page.evaluate(() => {
    const secs = Array.from(document.querySelectorAll('section, header, footer, main, nav, [data-section]'));
    return secs.map(s => ({
      tag: s.tagName.toLowerCase(),
      id: s.id,
      dataSection: s.getAttribute('data-section'),
      className: s.className,
      innerText: s.innerText.trim(),
      headings: Array.from(s.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.innerText.trim())
    }));
  });

  // Viewport Responsive Testing
  const viewports = [
    { width: 375, height: 812, name: '375px' },
    { width: 390, height: 844, name: '390px' },
    { width: 414, height: 896, name: '414px' },
    { width: 768, height: 1024, name: '768px' },
    { width: 1024, height: 768, name: '1024px' },
    { width: 1440, height: 900, name: '1440px' },
    { width: 1920, height: 1080, name: '1920px' }
  ];

  auditData.responsive = [];
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(200);
    const result = await page.evaluate((vpName) => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
      const clientWidth = docEl.clientWidth;
      const hasHorizontalScroll = scrollWidth > clientWidth + 1;
      
      const overflowingElements = [];
      if (hasHorizontalScroll) {
        const all = document.querySelectorAll('*');
        for (const el of all) {
          const r = el.getBoundingClientRect();
          if (r.right > clientWidth + 5 && r.width > 0) {
            overflowingElements.push({
              tag: el.tagName.toLowerCase(),
              id: el.id,
              className: el.className.substring(0, 50),
              right: r.right,
              clientWidth: clientWidth
            });
            if (overflowingElements.length >= 10) break;
          }
        }
      }

      return {
        viewport: vpName,
        scrollWidth,
        clientWidth,
        hasHorizontalScroll,
        overflowingElements
      };
    }, vp.name);

    auditData.responsive.push(result);
  }

  // Full page text audit
  const fullText = await page.evaluate(() => document.body.innerText);

  auditData.consoleLogs = consoleLogs;
  auditData.pageErrors = pageErrors;
  auditData.networkFailures = networkFailures;
  auditData.fullText = fullText;

  const outputPath = 'C:\\Users\\bhave\\.gemini\\antigravity\\brain\\896f2b09-2ed3-4f5b-982f-aa18ab1213f4\\scratch\\audit_results.json';
  fs.writeFileSync(outputPath, JSON.stringify(auditData, null, 2));
  console.log('Audit complete! Output saved to ' + outputPath);

  await browser.close();
}

runAudit().catch(err => console.error(err));
