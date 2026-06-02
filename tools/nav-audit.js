
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function navAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const nav = document.getElementById('ca-nav');
    const breadcrumbs = document.querySelector('.f10-breadcrumbs');
    
    const style = window.getComputedStyle(nav);
    
    return {
      nav: {
        id: nav.id,
        className: nav.className,
        height: nav.getBoundingClientRect().height,
        top: nav.getBoundingClientRect().top,
        position: style.position,
        insetBlockStart: style.top,
        display: style.display,
        zIndex: style.zIndex
      },
      breadcrumbs: {
        top: breadcrumbs?.getBoundingClientRect().top,
        marginTop: window.getComputedStyle(breadcrumbs).marginTop
      }
    };
  });

  console.log('--- Nav & Breadcrumb Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

navAudit().catch(console.error);
