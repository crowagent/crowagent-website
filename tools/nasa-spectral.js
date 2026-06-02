const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://app.crowagent.ai';
const SESSION = JSON.parse(fs.readFileSync('C:\\Users\\bhave\\Crowagent Repo\\crowagent-platform\\session-clean.json', 'utf8')).session;

async function finalEntry() {
  console.log('🚀 NASA Mission: Final Spectral Analysis...');
  const browser = await chromium.launch({ headless: true });
  
  // Create context with real user agent to evade bot detection
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Set the Auth Cookie
  const cookieValue = Buffer.from(JSON.stringify(SESSION)).toString('base64');
  await context.addCookies([{
    name: 'sb-gujtuecjzfiqsdnzgyvo-auth-token',
    value: cookieValue,
    domain: 'app.crowagent.ai',
    path: '/',
    secure: true,
    sameSite: 'Lax'
  }]);

  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const diagnostics = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText;
      const isLogin = document.body.innerText.includes('Sign in');
      const hasError = document.body.innerText.includes('Unable to load');
      const cards = document.querySelectorAll('.metric-card').length;
      return { h1, isLogin, hasError, cards };
    });

    console.log('--- SPECTRAL RESULTS ---');
    console.log(JSON.stringify(diagnostics, null, 2));
    
    await page.screenshot({ path: 'audit-results/screenshots/nasa-final-spectral.png', fullPage: true });

  } catch (e) {
    console.error('Spectral crash:', e.message);
  } finally {
    await browser.close();
  }
}

finalEntry();
