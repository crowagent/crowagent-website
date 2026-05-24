
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function carouselAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const root = document.querySelector('.crow-carousel');
    const viewport = document.querySelector('.crow-carousel-viewport');
    const track = document.querySelector('.crow-carousel-track');
    const slides = Array.from(document.querySelectorAll('.crow-carousel-slide'));
    
    return {
      rootHeight: root?.getBoundingClientRect().height,
      viewportHeight: viewport?.getBoundingClientRect().height,
      trackHeight: track?.getBoundingClientRect().height,
      slidesCount: slides.length,
      slidesHeights: slides.map(s => s.getBoundingClientRect().height),
      rootDisplay: window.getComputedStyle(root).display,
      viewportPosition: window.getComputedStyle(viewport).position
    };
  });

  console.log('--- Carousel Height Audit ---');
  console.log(JSON.stringify(results, null, 2));
  
  await browser.close();
}

carouselAudit().catch(console.error);
