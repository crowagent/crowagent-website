/* Analyse responsive-probe-data.json and dump categorised defects. */
const fs = require('fs');
const path = require('path');
const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'responsive-probe-data.json'), 'utf8'));

const PAGES = ['/','/pricing','/crowmark','/crowcyber','/crowcash','/tools/late-payment-calculator/','/blog/index','/about','/contact','/security'];

// A. per-viewport defect table
const perVp = {};
for (const [vpName, vpData] of Object.entries(d.results)) {
  perVp[vpName] = {
    viewport: vpData.viewport,
    totals: { hscroll: 0, touch: 0, tinyText: 0, imgOverflow: 0, h1Tiny: 0, errors: 0 },
    byPage: {}
  };
  for (const p of PAGES) {
    const pd = vpData.pages[p];
    if (!pd) continue;
    const def = {
      hscroll: pd.horizontalScroll || false,
      touchCount: pd.smallTouchTargetCount || 0,
      tinyText: pd.tinyTextCount || 0,
      imgOverflow: pd.overflowImgCount || 0,
      h1Tiny: (vpData.viewport.cls === 'mobile' && pd.h1FontSize && pd.h1FontSize < 28),
      h1Size: pd.h1FontSize,
      stickyOverlap: (pd.stickyOverlaps && pd.stickyOverlaps.length) > 0,
      error: pd.error || null,
      consoleErrors: (pd.consoleErrors || []).length
    };
    perVp[vpName].byPage[p] = def;
    if (def.hscroll) perVp[vpName].totals.hscroll++;
    if (def.touchCount > 0) perVp[vpName].totals.touch += def.touchCount;
    if (def.tinyText > 0) perVp[vpName].totals.tinyText += def.tinyText;
    if (def.imgOverflow > 0) perVp[vpName].totals.imgOverflow += def.imgOverflow;
    if (def.h1Tiny) perVp[vpName].totals.h1Tiny++;
    if (def.error) perVp[vpName].totals.errors++;
  }
}

console.log('=== A. PER VIEWPORT TOTALS ===');
for (const [vp, info] of Object.entries(perVp)) {
  console.log(`${vp} (${info.viewport.w}x${info.viewport.h}, ${info.viewport.cls}):`, info.totals);
}

// Per-page defect breakdown
console.log('\n=== PER-PAGE DEFECT MATRIX (touch-target count) ===');
const header = 'viewport\t' + PAGES.map(p => p.replace(/\//g,'').slice(0,8) || 'home').join('\t');
console.log(header);
for (const [vp, info] of Object.entries(perVp)) {
  const row = [vp];
  for (const p of PAGES) {
    const cell = info.byPage[p];
    if (!cell) { row.push('-'); continue; }
    row.push(cell.error ? 'ERR' : (cell.touchCount || 0));
  }
  console.log(row.join('\t'));
}

// Tiny-text rows
console.log('\n=== TINY-TEXT (<12px) PER VIEWPORT-PAGE ===');
for (const [vp, info] of Object.entries(perVp)) {
  for (const [p, cell] of Object.entries(info.byPage)) {
    if (cell.tinyText > 0) console.log(`  ${vp} ${p}: ${cell.tinyText}`);
  }
}

// Image-overflow rows
console.log('\n=== IMG-OVERFLOW PER VIEWPORT-PAGE ===');
for (const [vp, info] of Object.entries(perVp)) {
  for (const [p, cell] of Object.entries(info.byPage)) {
    if (cell.imgOverflow > 0) console.log(`  ${vp} ${p}: ${cell.imgOverflow}`);
  }
}

// H1 tiny on mobile
console.log('\n=== H1 < 28px ON MOBILE ===');
for (const [vp, info] of Object.entries(perVp)) {
  if (info.viewport.cls !== 'mobile') continue;
  for (const [p, cell] of Object.entries(info.byPage)) {
    if (cell.h1Tiny) console.log(`  ${vp} ${p}: ${cell.h1Size}px`);
  }
}

// Sticky overlaps
console.log('\n=== STICKY-FIXED OVERLAPS ===');
for (const [vp, info] of Object.entries(perVp)) {
  for (const [p, cell] of Object.entries(info.byPage)) {
    if (cell.stickyOverlap) console.log(`  ${vp} ${p}`);
  }
}

// Errors
console.log('\n=== ERRORS ===');
for (const [vp, info] of Object.entries(perVp)) {
  for (const [p, cell] of Object.entries(info.byPage)) {
    if (cell.error) console.log(`  ${vp} ${p}: ${cell.error}`);
  }
}

// Sample tiny-text + small touch-targets from the worst pages
console.log('\n=== SAMPLE SMALL TOUCH TARGETS @ desktop 1440x900 ===');
const desk = d.results['desktop'].pages;
for (const p of PAGES) {
  const pd = desk[p];
  if (!pd || !pd.smallTouchTargets) continue;
  for (const t of pd.smallTouchTargets.slice(0, 8)) {
    console.log(`  ${p}: <${t.tag} ${t.cls.slice(0,30)}> "${t.text.slice(0,30)}" ${t.w}x${t.h}`);
  }
}

console.log('\n=== SAMPLE SMALL TOUCH TARGETS @ iPhone SE 320x568 ===');
const se = d.results['iPhone SE'].pages;
for (const p of PAGES) {
  const pd = se[p];
  if (!pd || !pd.smallTouchTargets) continue;
  for (const t of pd.smallTouchTargets.slice(0, 6)) {
    console.log(`  ${p}: <${t.tag} ${t.cls.slice(0,30)}> "${t.text.slice(0,30)}" ${t.w}x${t.h}`);
  }
}

console.log('\n=== TINY TEXT SAMPLES (desktop) ===');
for (const p of PAGES) {
  const pd = desk[p];
  if (!pd || !pd.tinyTextSamples || pd.tinyTextSamples.length === 0) continue;
  for (const s of pd.tinyTextSamples.slice(0, 4)) {
    console.log(`  ${p}: ${s.fs}px <${s.tag}.${s.cls.slice(0,30)}> "${s.text}"`);
  }
}

console.log('\n=== TINY TEXT SAMPLES (iPhone SE) ===');
for (const p of PAGES) {
  const pd = se[p];
  if (!pd || !pd.tinyTextSamples || pd.tinyTextSamples.length === 0) continue;
  for (const s of pd.tinyTextSamples.slice(0, 4)) {
    console.log(`  ${p}: ${s.fs}px <${s.tag}.${s.cls.slice(0,30)}> "${s.text}"`);
  }
}

console.log('\n=== H1 SIZES BY VIEWPORT (home) ===');
for (const [vp, info] of Object.entries(perVp)) {
  const cell = info.byPage['/'];
  if (cell) console.log(`  ${vp}: ${cell.h1Size}px`);
}

console.log('\n=== STICKY RECTS @ iPhone SE / ===');
console.log(JSON.stringify(d.results['iPhone SE'].pages['/'].stickyRects, null, 2));
console.log('=== STICKY RECTS @ desktop / ===');
console.log(JSON.stringify(d.results['desktop'].pages['/'].stickyRects, null, 2));

// B. cross-engine
console.log('\n\n=== B. CROSS-ENGINE DIFFS @ 1440x900 ===');
const engines = Object.keys(d.crossEngine);
for (const p of PAGES) {
  const rows = engines.map(e => ({
    eng: e, data: d.crossEngine[e][p]
  }));
  // compare key metrics
  const out = rows.map(r => ({
    eng: r.eng,
    hscroll: r.data.horizontalScroll,
    docW: r.data.docScrollWidth,
    touch: r.data.smallTouchTargetCount || 0,
    tiny: r.data.tinyTextCount || 0,
    imgOv: r.data.overflowImgCount || 0,
    h1Sz: r.data.h1FontSize,
    h1Top: r.data.h1Top,
    consoleErrs: (r.data.consoleErrors || []).length
  }));
  // diff?
  const sig = JSON.stringify(out.map(o => ({touch:o.touch,tiny:o.tiny,img:o.imgOv,h1:o.h1Sz,docW:o.docW,errs:o.consoleErrs})));
  // show all engines
  const allSame = out.every(o => o.touch === out[0].touch && o.tiny === out[0].tiny && o.imgOv === out[0].imgOv && Math.abs((o.h1Sz||0) - (out[0].h1Sz||0)) < 0.5 && Math.abs((o.docW||0) - (out[0].docW||0)) < 5);
  console.log(`\n  ${p}${allSame ? '   [identical]' : '   [DIFF]'}`);
  for (const o of out) console.log(`     ${o.eng}: hscroll=${o.hscroll} docW=${o.docW} touch=${o.touch} tiny=${o.tiny} imgOv=${o.imgOv} h1=${o.h1Sz} consoleErr=${o.consoleErrs}`);
}

// console errors per engine
console.log('\n=== CONSOLE ERRORS PER ENGINE ===');
for (const e of engines) {
  let total = 0;
  for (const p of PAGES) {
    const ce = (d.crossEngine[e][p].consoleErrors || []);
    total += ce.length;
    if (ce.length) {
      console.log(`  ${e} ${p}:`);
      for (const m of ce) console.log(`     - ${m}`);
    }
  }
  console.log(`  TOTAL ${e}: ${total}`);
}
