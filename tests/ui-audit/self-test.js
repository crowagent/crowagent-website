'use strict';

// CONTROL THE CONTROL.
//
// Every guard in harness.js is red-proved here against the actual failure it
// exists to stop. A guard that has never been shown to fire is a claim.
// run.js executes the static half of this file before every audit and refuses
// to produce a report if it does not pass.
//
//   node tests/ui-audit/self-test.js          static guards only
//   node tests/ui-audit/self-test.js --live   static plus live browser proofs

const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const wr = createRequire(path.join(__dirname, '..', '..', 'package.json'));
const { chromium, devices } = wr('playwright');

const H = require('./harness');
const R = require('./routes');

const WEBSITE_BASE = process.env.AUDIT_WEBSITE_BASE || 'http://localhost:8093';

const results = [];
function check(name, fn) {
  try {
    const detail = fn();
    results.push({ name, pass: true, detail: detail || '' });
  } catch (err) {
    results.push({ name, pass: false, detail: err.message });
  }
}
async function checkAsync(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, pass: true, detail: detail || '' });
  } catch (err) {
    results.push({ name, pass: false, detail: err.message });
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

// ---------------------------------------------------------------------------
// STATIC GUARDS
// ---------------------------------------------------------------------------

function staticGuards() {
  check('S1 no window resize path exists in the harness (FLAW 1)', () => {
    const src = fs.readFileSync(path.join(__dirname, 'harness.js'), 'utf8');
    const stripped = src.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
    for (const banned of ['setViewportSize', 'resize_window', 'windowSize', '--window-size']) {
      assert(!stripped.includes(banned), `harness.js contains a window resize path: ${banned}`);
    }
    return 'no setViewportSize, no --window-size, contexts come from device descriptors only';
  });

  check('S2 route normaliser kills the exact broken URLs of 2026-08-31 (FLAW 5)', () => {
    const cases = [
      ['(auth)\\auth\\forgot-password', '/auth/forgot-password'],
      ['(auth)/auth/accept-invite', '/auth/accept-invite'],
      ['(dashboard)\\buyer', '/buyer'],
      ['portal\\agents\\ab-tests', '/portal/agents/ab-tests'],
      ['(overview)', '/'],
      ['crowmark/@modal/contracts', '/crowmark/contracts'],
    ];
    for (const [input, want] of cases) {
      const got = R.toRoutePath(input);
      assert(got && got.route === want, `toRoutePath(${JSON.stringify(input)}) gave ${got && got.route}, wanted ${want}`);
    }
    assert(R.toRoutePath('_components/thing') === null, 'private segment should not be routable');
    const dyn = R.toRoutePath('shared/report/[token]');
    assert(dyn.dynamic === true, 'dynamic route must be flagged so it is not guessed');
    return `${cases.length} paths normalised, private segments rejected, dynamic flagged`;
  });

  check('S3 aggregate refuses a non-200 record (FLAW 5)', () => {
    const rec404 = { requestedUrl: 'http://x/y', measured: false, status: 404, excludedReason: 'http-404' };
    let threw = false;
    try { H.assertMeasured(rec404); } catch { threw = true; }
    assert(threw, 'assertMeasured accepted a 404 record');

    const recOk = { requestedUrl: 'http://x/y', measured: true, status: 200, observationsCollected: ['horizontalOverflow'], observations: { horizontalOverflow: { offenders: [] } } };
    const agg = H.aggregate([recOk, rec404], 'horizontalOverflow');
    assert(agg.measured === 1 && agg.requested === 2, `aggregate counted ${agg.measured}/${agg.requested}`);
    assert(agg.claim.includes('of 1 MEASURED') && agg.claim.includes('2 requested'), `claim hides the denominator: ${agg.claim}`);
    return `404 rejected, claim reads "${agg.claim}"`;
  });

  check('S4 an empty observation array cannot become a finding (FLAW 5)', () => {
    // This is the shape of all 193 records of the 2026-08-31 run: measured, but
    // every machine fillable array empty and nothing collected.
    const ghost = {
      route: '/anything', profile: 'desktop', measured: true, status: 200,
      observedViewport: { width: 1440, height: 900, dpr: 1, coarse: false },
      landedUrl: 'http://x/anything',
      observationsCollected: [], observations: {},
    };
    const out = H.buildFindings([ghost]);
    assert(out.findings.length === 0, `harness emitted ${out.findings.length} findings from zero observations`);
    assert(out.notMeasured.length === H.CATEGORIES.length, `expected ${H.CATEGORIES.length} not-measured entries, got ${out.notMeasured.length}`);

    // And a finding that IS emitted must carry evidence.
    const real = {
      route: '/x', profile: 'mobile', measured: true, status: 200,
      observedViewport: { width: 390, height: 844, dpr: 3, coarse: true },
      landedUrl: 'http://x/x',
      observationsCollected: ['touchTargets'],
      observations: { touchTargets: [{ selector: 'a', width: 12, height: 12, min: 24 }] },
    };
    const out2 = H.buildFindings([real]);
    assert(out2.findings.length === 1 && out2.findings[0].evidence.length === 1, 'a real finding lost its evidence');
    assert(out2.findings[0].observedViewport.includes('390x844'), 'finding is not labelled with the observed viewport');
    return 'zero findings from zero observations, evidence mandatory, viewport label attached';
  });

  check('S6 no ad hoc audit script in tests/ can still run the old method', () => {
    // The corrected harness only helps if the superseded scripts cannot be run
    // by the next agent who greps for "audit". Any sibling script that drives a
    // browser and reads geometry must either scroll first and emulate a device,
    // or carry the AUDIT-METHOD-DISABLED stop.
    const dir = path.join(__dirname, '..');
    const offenders = [];
    for (const name of fs.readdirSync(dir)) {
      // Standalone runners only. A *.spec.js file executes under
      // playwright.config.js, so its emulation is a property of that config and
      // not of the file. That config declares no device projects today, which is
      // a separate gap and belongs in its own row, not in a silent widening here.
      if (!name.endsWith('.js') || name.endsWith('.spec.js') || name.startsWith('_')) continue;
      const full = path.join(dir, name);
      if (!fs.statSync(full).isFile()) continue;
      const src = fs.readFileSync(full, 'utf8');
      const drivesBrowser = /require\(['"](playwright|@playwright\/test)['"]\)/.test(src) && src.includes('.goto(');
      if (!drivesBrowser) continue;
      const readsGeometry = /getBoundingClientRect|scrollWidth|offsetWidth|getComputedStyle|toHaveScreenshot|screenshot\(/.test(src);
      if (!readsGeometry) continue;
      const scrolls = /scrollTo|settleLazyContent|scrollIntoView/.test(src);
      const emulates = /devices\[/.test(src);
      const disabled = src.includes('AUDIT-METHOD-DISABLED');
      if (!disabled && !(scrolls && emulates)) {
        offenders.push(`${name} (scrollsBeforeMeasuring=${scrolls}, emulatesDevice=${emulates})`);
      }
    }
    assert(offenders.length === 0, `these scripts still carry the superseded method and are neither corrected nor stopped: ${offenders.join(', ')}`);
    return 'every browser driving script under tests/ either emulates and scrolls, or is stopped';
  });

  check('S7 no category can fire on every page, and overflow needs the document to scroll', () => {
    // A control that comes out positive on every route is not a control.
    // Headings and links are on every page, so they are inventory and can never
    // be a finding.
    for (const cat of H.INVENTORY_CATEGORIES) {
      assert(H.categoryItems(cat, [{ anything: 1 }, { anything: 2 }]).length === 0, `${cat} produced a finding from inventory`);
    }
    // An element sticking out inside an overflow:hidden ancestor does not make
    // the page scroll, so it is not a finding on its own.
    const decorative = { documentScrollWidth: 390, viewportWidth: 390, offenders: [{ selector: 'i.hero__amb', right: 1211, viewportWidth: 390 }] };
    assert(H.categoryItems('horizontalOverflow', decorative).length === 0, 'a clipped decorative element was reported as overflow');
    const real = { documentScrollWidth: 641, viewportWidth: 390, offenders: [{ selector: 'table.cmp-table', right: 641, viewportWidth: 390 }] };
    assert(H.categoryItems('horizontalOverflow', real).length === 1, 'a document that genuinely scrolls sideways was not reported');
    return 'inventory cannot become a finding, overflow requires documentScrollWidth to exceed the viewport, both directions proved';
  });

  check('S5 device descriptors exist and desktop is not touch (FLAW 1)', () => {
    const m = H.resolveProfile('mobile');
    const t = H.resolveProfile('tablet');
    const d = H.resolveProfile('desktop');
    assert(m.descriptor.hasTouch === true && m.descriptor.isMobile === true, 'mobile profile is not a touch device');
    assert(t.descriptor.hasTouch === true, 'tablet profile is not a touch device');
    assert(d.descriptor.hasTouch === false, 'desktop profile claims touch');
    return `mobile=${m.device} ${m.descriptor.viewport.width}x${m.descriptor.viewport.height} hasTouch, tablet=${t.device}, desktop=1440x900 no touch`;
  });
}

// ---------------------------------------------------------------------------
// LIVE PROOFS
// ---------------------------------------------------------------------------

async function liveProofs() {
  const browser = await chromium.launch({ headless: true });
  try {
    // L1 reproduces FLAW 1 and shows the fix. Same pixel size, two methods.
    await checkAsync('L1 LIVE: a resized window reports pointer:coarse=false, an emulated iPhone reports true (FLAW 1)', async () => {
      const resized = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const p1 = await resized.newPage();
      await p1.goto(WEBSITE_BASE + '/', { waitUntil: 'domcontentloaded' });
      const a = await p1.evaluate(() => ({ w: innerWidth, coarse: matchMedia('(pointer: coarse)').matches, touch: navigator.maxTouchPoints }));
      await resized.close();

      const emulated = await browser.newContext({ ...devices['iPhone 13'] });
      const p2 = await emulated.newPage();
      await p2.goto(WEBSITE_BASE + '/', { waitUntil: 'domcontentloaded' });
      const b = await p2.evaluate(() => ({ w: innerWidth, coarse: matchMedia('(pointer: coarse)').matches, touch: navigator.maxTouchPoints }));
      await emulated.close();

      assert(a.coarse === false, 'expected the old method to fail pointer:coarse, it did not');
      assert(b.coarse === true, 'emulation did not produce pointer:coarse');
      return `resized ${a.w}px coarse=${a.coarse} touchPoints=${a.touch}  vs  emulated ${b.w}px coarse=${b.coarse} touchPoints=${b.touch}. Identical width, opposite media match.`;
    });

    // L2 reproduces FLAW 3. The config lies, the browser does not.
    await checkAsync('L2 LIVE: a mislabelled viewport is refused, not reported (FLAW 3)', async () => {
      const ctx = await browser.newContext({ ...devices['iPhone 13'] });
      const liar = { id: 'mobile-320-claimed', descriptor: { viewport: { width: 320, height: 568 } }, expectCoarse: true };
      const rec = await H.measureRoute(ctx, liar, WEBSITE_BASE, '/');
      await ctx.close();
      assert(rec.measured === false, 'a mislabelled viewport produced a measured record');
      assert(String(rec.excludedReason).startsWith('viewport-label-mismatch'), `wrong reason: ${rec.excludedReason}`);
      return rec.excludedReason;
    });

    // L3 reproduces FLAW 2 on the real page.
    await checkAsync('L3 LIVE: lazy images are pending before the scroll and settled after (FLAW 2)', async () => {
      const ctx = await browser.newContext({ ...devices['iPhone 13'] });
      const page = await ctx.newPage();
      await page.goto(WEBSITE_BASE + '/', { waitUntil: 'domcontentloaded' });
      const before = await page.evaluate(() => {
        const imgs = Array.from(document.images);
        return { total: imgs.length, lazy: imgs.filter(i => i.loading === 'lazy').length, pending: imgs.filter(i => !i.complete).length };
      });
      const settled = await H.settleLazyContent(page);
      await ctx.close();
      assert(settled.lazyComplete === true, `after scroll ${settled.images.pending.length} VISIBLE images are still pending`);
      assert(before.pending > 0, 'nothing was pending at first paint, so this guard was not red proved on this page');
      const hidden = settled.images.pendingOffscreenOrHidden.length;
      return `${before.total} images on the page, ${before.lazy} marked loading=lazy, ${before.pending} not yet loaded at first paint, 0 visible pending after the scroll. ` +
        `RED PROVED: a no-scroll capture would have seen ${before.pending} of ${before.total} images as missing. ` +
        `${hidden} images sit in a hidden tab panel and are reported separately, not as broken.`;
    });

    // L4 reproduces the 404 laundering. A 404 page has real geometry.
    await checkAsync('L4 LIVE: a 404 page yields plausible geometry and is still excluded (FLAW 5)', async () => {
      const ctx = await browser.newContext({ ...H.DESKTOP_DESCRIPTOR });
      const page = await ctx.newPage();
      const resp = await page.goto(WEBSITE_BASE + '/definitely-not-a-route-xyz', { waitUntil: 'domcontentloaded' });
      const geom = await page.evaluate(() => ({ status: null, paragraphs: document.querySelectorAll('p').length, headings: document.querySelectorAll('h1,h2,h3').length, scrollWidth: document.documentElement.scrollWidth }));
      await page.close();
      const profile = H.resolveProfile('desktop');
      const rec = await H.measureRoute(ctx, profile, WEBSITE_BASE, '/definitely-not-a-route-xyz');
      await ctx.close();
      assert(resp.status() === 404, `expected a 404 from the server, got ${resp.status()}`);
      assert(rec.measured === false && rec.excludedReason === 'http-404', `404 was not excluded: ${rec.excludedReason}`);
      let threw = false;
      try { H.assertMeasured(rec); } catch { threw = true; }
      assert(threw, 'the 404 record was admitted to an aggregate');
      return `the 404 page renders ${geom.paragraphs} paragraphs and ${geom.headings} headings at scrollWidth ${geom.scrollWidth}, which is exactly why status must be asserted. Excluded as http-404.`;
    });

    // L5 a real page measures cleanly, so the harness can come out negative.
    await checkAsync('L5 LIVE: a healthy route DOES measure, so the control can come out negative (RULE 0-V)', async () => {
      const profile = H.resolveProfile('mobile');
      const ctx = await browser.newContext({ ...profile.descriptor });
      const rec = await H.measureRoute(ctx, profile, WEBSITE_BASE, '/');
      await ctx.close();
      assert(rec.measured === true, `homepage did not measure: ${rec.excludedReason}`);
      assert(rec.observationsCollected.length >= 6, `only ${rec.observationsCollected.length} categories collected`);
      return `/ measured at ${rec.observedViewport.width}x${rec.observedViewport.height} coarse=${rec.observedViewport.coarse}, categories collected: ${rec.observationsCollected.join(', ')}`;
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  const live = process.argv.includes('--live');
  staticGuards();
  if (live) await liveProofs();

  const bar = '='.repeat(78);
  console.log(bar);
  console.log(live ? 'UI AUDIT HARNESS SELF-TEST  (static + live)' : 'UI AUDIT HARNESS SELF-TEST  (static)');
  console.log(bar);
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}`);
    if (r.detail) console.log(`        ${r.detail}`);
  }
  const failed = results.filter(r => !r.pass);
  console.log(bar);
  console.log(`${results.length - failed.length} of ${results.length} guards proved.`);
  console.log(bar);
  process.exitCode = failed.length ? 1 : 0;
}

module.exports = { staticGuards, results };

if (require.main === module) main();
