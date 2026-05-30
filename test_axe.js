const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('fs');

function pages(){
  const o=[]; for(const f of fs.readdirSync('.')) if(f.endsWith('.html')&&!/mock|-original/.test(f)) o.push(f);
  for(const d of ['blog','glossary']) if(fs.existsSync(d)) for(const f of fs.readdirSync(d)) if(f.endsWith('.html')) o.push(d+'/'+f);
  for(const b of ['tools','intel']) if(fs.existsSync(b)) for(const d of fs.readdirSync(b)){const p=b+'/'+d+'/index.html'; if(fs.existsSync(p)) o.push(p);}
  return o;
}

(async () => {
  const browser = await chromium.launch();
  const list = pages();
  
  for (const f of list) {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto('http://localhost:8092/'+f, { waitUntil: 'domcontentloaded', timeout: 5000 });
      await page.waitForTimeout(500);
      const results = await new AxeBuilder({ page }).withRules(['landmark-complementary-is-top-level']).analyze();
      
      if (results.violations.length > 0) {
          console.log('\n--- Violations on', f, '---');
          results.violations.forEach(v => {
              v.nodes.forEach(node => {
                  console.log(node.html);
              });
          });
      }
    } catch(e) { }
    await context.close();
  }
  
  await browser.close();
})();
