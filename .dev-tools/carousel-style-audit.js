
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function carouselStylesAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const el = document.querySelector('.crow-carousel');
    const style = window.getComputedStyle(el);
    const parentStyle = window.getComputedStyle(el.parentElement);
    const sectionStyle = window.getComputedStyle(el.closest('section'));

    return {
      carousel: {
        marginTop: style.marginTop,
        top: style.top,
        transform: style.transform,
        position: style.position
      },
      heroVisual: {
        marginTop: parentStyle.marginTop,
        paddingTop: parentStyle.paddingTop,
        position: parentStyle.position
      },
      parentSection: {
        height: el.closest('section').getBoundingClientRect().height,
        paddingBottom: sectionStyle.paddingBottom
      }
    };
  });

  console.log('--- Carousel Style Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

carouselStylesAudit().catch(console.error);
