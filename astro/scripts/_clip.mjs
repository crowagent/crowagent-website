import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const DIST='C:/Users/bhave/Crowagent Repo/crowagent-website/astro/dist';
const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.webp':'image/webp','.avif':'image/avif','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const s=http.createServer((q,r)=>{let f=path.join(DIST,decodeURIComponent(q.url.split('?')[0]));
 if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
 if(!fs.existsSync(f)){r.writeHead(404);return r.end();}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>s.listen(0,r)); const base=`http://localhost:${s.address().port}`;
const b=await chromium.launch();
for(const route of ['/crowmark/','/crowmark-buyers/','/']){
 for(const w of [320,360,390,834]){
  const p=await b.newPage({viewport:{width:w,height:900},reducedMotion:'reduce'});
  await p.goto(base+route,{waitUntil:'load'});
  await p.evaluate(()=>document.querySelector('.pcar')?.scrollIntoView({block:'center'}));
  await p.evaluate(()=>document.querySelectorAll('*').forEach(e=>e.getAnimations?.().forEach(a=>a.finish())));
  const r=await p.evaluate(()=>{
    const car=document.querySelector('.pcar'); if(!car)return null;
    const cr=car.getBoundingClientRect();
    const cap=car.querySelector('.pcar__cap, figcaption, .pcar__caption');
    const tabs=car.querySelector('.pcar__tabs');
    const out={carL:Math.round(cr.left),carR:Math.round(cr.right),clip:getComputedStyle(car).overflowX};
    if(cap){const q=cap.getBoundingClientRect(); out.capL=Math.round(q.left*10)/10; out.capR=Math.round(q.right*10)/10;
      out.cutLeft=Math.round((cr.left-q.left)*10)/10; out.cutRight=Math.round((q.right-cr.right)*10)/10;}
    if(tabs){const t=tabs.getBoundingClientRect(); out.tabsL=Math.round(t.left*10)/10; out.tabsR=Math.round(t.right*10)/10;
      out.tabsCutL=Math.round((cr.left-t.left)*10)/10; out.tabsCutR=Math.round((t.right-cr.right)*10)/10;}
    return out;});
  if(r) console.log(`${route.padEnd(20)} ${String(w).padStart(4)}  overflowX=${r.clip}  caption cut L/R: ${r.cutLeft}/${r.cutRight}  tabs cut L/R: ${r.tabsCutL}/${r.tabsCutR}`);
  else console.log(`${route.padEnd(20)} ${String(w).padStart(4)}  no .pcar on this route`);
  await p.close();
 }
}
await b.close(); s.close();
