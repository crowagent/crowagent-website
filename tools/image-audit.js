
const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';

async function fullImageAudit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  const results = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      visible: img.offsetParent !== null,
      complete: img.complete
    }));
  });

  console.log('--- Image Load Audit ---');
  const broken = results.filter(img => img.width === 0);
  if (broken.length === 0) {
    console.log('All images loaded successfully.');
  } else {
    console.log(`${broken.length} broken images found:`);
    console.log(JSON.stringify(broken, null, 2));
  }
  
  await browser.close();
}

fullImageAudit().catch(console.error);
