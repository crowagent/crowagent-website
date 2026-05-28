const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CREDENTIALS = {
    email: 'support.crowagent@gmail.com',
    password: 'CrowE2E-Test-2026-04!K9xQ'
};

const BASE_URL = 'https://app.crowagent.ai';
const OUTPUT_DIR = path.join(__dirname, '..', 'Assets', 'product-screens');

async function capture() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await chromium.launch({
        headless: true,
        args: ['--use-angle=swiftshader']
    });

    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
        reducedMotion: 'no-preference'
    });

    const page = await context.newPage();

    console.log('Navigating to login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    console.log('Logging in...');
    await page.fill('input[type="email"]', CREDENTIALS.email);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');

    console.log('Waiting for dashboard...');
    await page.waitForURL(url => url.toString().includes('/dashboard'), { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('Capturing main dashboard...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'main.png') });

    // Look for navigation links in the sidebar
    const navLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.map(a => ({ text: a.innerText.trim(), href: a.href, selector: `a[href="${a.getAttribute('href')}"]` }))
                    .filter(l => l.text && l.href.includes('app.crowagent.ai'));
    });
    console.log('Found links:', JSON.stringify(navLinks, null, 2));

    const modules = [
        { name: 'cyber', search: 'Cyber' },
        { name: 'cash', search: 'Cash' },
        { name: 'mark', search: 'Mark' },
        { name: 'core', search: 'Core' }
    ];

    for (const mod of modules) {
        console.log(`Trying to navigate to ${mod.name}...`);
        const link = navLinks.find(l => l.text.includes(mod.search));
        if (link) {
            console.log(`Clicking ${link.text}...`);
            await page.click(link.selector);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(5000);
            console.log(`Capturing ${mod.name}...`);
            await page.screenshot({ path: path.join(OUTPUT_DIR, `${mod.name}.png`) });
            // Go back to dashboard to be safe
            await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
        } else {
            console.log(`Link for ${mod.name} not found, trying direct navigation...`);
            await page.goto(`${BASE_URL}/${mod.name}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(5000);
            await page.screenshot({ path: path.join(OUTPUT_DIR, `${mod.name}.png`) });
        }
    }

    await browser.close();
}

capture().catch(err => {
    console.error('Error during capture:', err);
    process.exit(1);
});
