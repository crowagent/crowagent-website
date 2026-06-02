const { chromium } = require('playwright');

async function verifyClaims() {
  const browser = await chromium.launch();
  const results = {};

  const checkPage = async (pagePath, viewport) => {
    const page = await browser.newPage();
    await page.setViewportSize(viewport);
    const url = `http://localhost:8092${pagePath}`;
    console.log(`Checking ${url} [${viewport.width}x${viewport.height}]...`);
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const data = await page.evaluate(() => {
      const getStyle = (sel, prop) => {
        const el = document.querySelector(sel);
        return el ? window.getComputedStyle(el)[prop] : null;
      };
      
      const getRect = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.getBoundingClientRect() : null;
      };

      const h1 = document.querySelector('h1');
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;
      const h1Center = h1Rect ? h1Rect.left + h1Rect.width / 2 : null;
      
      const container = document.querySelector('.ca-container') || document.querySelector('.container') || document.querySelector('.wrap');
      const containerStyle = container ? window.getComputedStyle(container) : null;

      const btn = document.querySelector('a.sv-btn, button, .cz-btn');
      const btnStyle = btn ? window.getComputedStyle(btn) : null;

      return {
        h1: {
          fontFamily: h1 ? window.getComputedStyle(h1).fontFamily : null,
          textAlign: h1 ? window.getComputedStyle(h1).textAlign : null,
          rect: h1Rect,
          center: h1Center
        },
        container: {
          paddingLeft: containerStyle ? containerStyle.paddingLeft : null,
          paddingRight: containerStyle ? containerStyle.paddingRight : null,
          rect: container ? container.getBoundingClientRect() : null
        },
        button: {
          transition: btnStyle ? btnStyle.transition : null,
          transitionTiming: btnStyle ? btnStyle.transitionTimingFunction : null
        }
      };
    });
    
    await page.close();
    return data;
  };

  results.homepage_desktop = await checkPage('/', { width: 1440, height: 900 });
  results.pricing_desktop = await checkPage('/pricing.html', { width: 1440, height: 900 });
  results.contact_desktop = await checkPage('/contact.html', { width: 1440, height: 900 });
  
  results.homepage_mobile = await checkPage('/', { width: 390, height: 844 });
  results.pricing_mobile = await checkPage('/pricing.html', { width: 390, height: 844 });

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

verifyClaims();
