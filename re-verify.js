const { chromium } = require('playwright');

const items = [
    { id: 'LM-037', url: 'http://localhost:8092/blog/index.html' },
    { id: 'LM-056', url: 'http://localhost:8092/glossary/index.html' },
    { id: 'LM-058', url: 'http://localhost:8092/csrd.html' },
    { id: 'LM-082', url: 'http://localhost:8092/intel/cyber-essentials-tracker' },
    { id: 'LM-125', url: 'http://localhost:8092/blog/mees-band-c-2028' },
    { id: 'LM-126', url: 'http://localhost:8092/blog/cyber-essentials-v3-3-danzell-2026' }
];

(async () => {
    const browser = await chromium.launch();
    
    for (const item of items) {
        console.log(`Verifying ${item.id}...`);
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
            // 1280px
            await page.setViewportSize({ width: 1280, height: 800 });
            await page.goto(item.url, { waitUntil: 'networkidle' });
            await page.screenshot({ path: `tests/_vshots/${item.id}_1280.png`, fullPage: true });
            
            // 390px
            await page.setViewportSize({ width: 390, height: 844 });
            await page.goto(item.url, { waitUntil: 'networkidle' });
            await page.screenshot({ path: `tests/_vshots/${item.id}_390.png`, fullPage: true });
        } catch (e) {
            console.error(`Failed to verify ${item.id}: ${item.url} - ${e.message}`);
        }
        
        await context.close();
    }
    
    await browser.close();
    console.log('Verification shots captured.');
})();
