const { chromium } = require('playwright');

async function testCollisions() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8092/', { waitUntil: 'networkidle' });

  // Check if cookie banner exists
  const cookieBanner = await page.$('#ca-cookie');
  if (cookieBanner) {
    const isVisible = await cookieBanner.isVisible();
    console.log(`Cookie banner visible: ${isVisible}`);
    
    if (isVisible) {
      // Check z-index
      const zIndex = await page.evaluate(() => {
        return window.getComputedStyle(document.getElementById('ca-cookie')).zIndex;
      });
      console.log(`Cookie banner z-index: ${zIndex}`);

      // Try to click a footer link
      const footerLink = await page.$('footer a');
      if (footerLink) {
        try {
          await footerLink.click({ timeout: 2000 });
          console.log('Footer link clicked successfully through banner (unexpected if blocking)');
        } catch (e) {
          console.log('Footer link click failed/blocked: ' + e.message);
        }
      }

      // Check chatbot button
      const chatbotBtn = await page.$('#ca-chatbot-btn');
      if (chatbotBtn) {
        try {
          await chatbotBtn.click({ timeout: 2000 });
          console.log('Chatbot button clicked successfully');
        } catch (e) {
          console.log('Chatbot button click failed/blocked');
        }
      }
    }
  }

  await browser.close();
}

testCollisions();
