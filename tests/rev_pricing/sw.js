const { chromium } = require('playwright');
const path = require('path');
const OUT = __dirname;
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
  const page = await context.newPage();
  await page.goto('http://localhost:8092/pricing.html',{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{document.querySelectorAll('div,section,aside').forEach(el=>{const cs=getComputedStyle(el);if((cs.position==='fixed'||cs.position==='sticky')){const t=(el.innerText||'').toLowerCase();if(t.includes('cookie')&&t.includes('accept'))el.style.display='none';}});});
  // find switcher element
  const info = await page.evaluate(()=>{
    const btns=[...document.querySelectorAll('button,a,div')].filter(e=>['Core','Mark','Cyber','Cash','ESG'].includes((e.textContent||'').trim()));
    if(!btns.length) return null;
    let el=btns[0];
    // climb to common container
    let c=el.parentElement; for(let i=0;i<4;i++){ if(c&&c.querySelectorAll&&[...c.querySelectorAll('*')].filter(x=>['Mark','Cyber','Cash'].includes((x.textContent||'').trim())).length>=2) break; c=c.parentElement;}
    const r=c.getBoundingClientRect();
    return {top:r.top+scrollY, height:r.height, width:r.width, left:r.left, cls:c.className};
  });
  console.log(JSON.stringify(info));
  if(info){ await page.evaluate(t=>window.scrollTo(0,t-40),info.top); await page.waitForTimeout(400);
    await page.screenshot({path:path.join(OUT,'switcher_mobile.png'),clip:{x:0,y:0,width:390,height:Math.min(700,info.height+120)}});
  }
  await context.close(); await browser.close(); console.log('DONE');
})();
