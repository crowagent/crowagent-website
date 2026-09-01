'use strict';

// THE CORRECTED UI AUDIT HARNESS  (rows A-190 finding, A-198 fix)
//
// This file is the correction. It is not a method note. Each of the five
// evidenced flaws in the 2026-08-30 website audit and the 2026-08-31 E2E audit
// is prevented here by a code path that a run cannot get past, and each guard is
// red-proved in self-test.js.
//
//  FLAW 1  A desktop browser WINDOW was resized instead of a touch device being
//          emulated, so every @media (pointer: coarse) rule failed to match and
//          correct mobile styling was reported broken.
//   FIX    Contexts are built ONLY from playwright device descriptors. There is
//          no setViewportSize path in this harness and self-test.js greps the
//          source to keep it that way. At measure time the page is asked whether
//          pointer: coarse actually matches. A mismatch marks the record NOT
//          MEASURED. A window-resize run therefore cannot emit a finding.
//
//  FLAW 2  Capture ran headlessly WITHOUT SCROLLING against a page carrying 10
//          lazy loaded images, so sections below the fold read as empty.
//   FIX    settleLazyContent() scrolls the full height and waits for every img
//          to decode before anything is observed. Emptiness observations are
//          gated on lazyComplete, so if images are still pending the harness
//          reports "not measured" instead of "empty".
//
//  FLAW 3  The run MISLABELLED WHICH VIEWPORT IT MEASURED, reporting a 1440x900
//          desktop padding value as a 320px mobile figure.
//   FIX    Every record carries observedViewport read from the BROWSER at the
//          moment of measurement, never from the config variable. If it
//          disagrees with the profile, the record is NOT MEASURED.
//
//  FLAW 4  It did not read the code it judged, so it recommended reverting two
//          recorded owner decisions.
//   FIX    A finding must carry evidence: a non-empty observation array plus the
//          selector and the measured number. buildFindings() cannot construct a
//          finding without one, so a prose opinion has nowhere to live. Anything
//          the harness cannot evidence surfaces as a REVIEW item that names the
//          source file a human must read.
//
//  FLAW 5  The corpus. Route URLs were built from filesystem paths, so 131 of
//          145 platform routes were 404 by construction and 13 ever loaded, and
//          greens were asserted over that. Every machine-fillable observation
//          array was empty across all 193 records, so every UI, UX and
//          accessibility finding was prose with no observation behind it. The
//          run was also authenticated while reporting as unauthenticated.
//   FIX    routes.js normalises the router path. Here, every route is probed,
//          the HTTP status and the LANDED URL are asserted, non-200 is excluded
//          from every aggregate, and the DENOMINATOR is printed first and
//          stamped into the report. Auth posture is OBSERVED from the context
//          cookies, not declared.
//
// RULE 0-V: check the denominator before reading any green. A control that
// cannot come out negative proves nothing.

const { createRequire } = require('node:module');
const wr = createRequire(require('node:path').join(__dirname, '..', '..', 'package.json'));
const { chromium, devices } = wr('playwright');

const NAV_TIMEOUT = 20000;
const LAZY_TIMEOUT = 8000;

// ---------------------------------------------------------------------------
// PROFILES. Device descriptors only. No width/height assignment after creation.
// ---------------------------------------------------------------------------

const DESKTOP_DESCRIPTOR = {
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
  userAgent: devices['Desktop Chrome'] && devices['Desktop Chrome'].userAgent,
};

const PROFILES = {
  mobile: { id: 'mobile', device: 'iPhone 13', expectCoarse: true },
  tablet: { id: 'tablet', device: 'iPad (gen 7)', expectCoarse: true },
  desktop: { id: 'desktop', device: null, descriptor: DESKTOP_DESCRIPTOR, expectCoarse: false },
};

function resolveProfile(id) {
  const p = PROFILES[id];
  if (!p) throw new Error(`unknown profile: ${id}`);
  if (p.device) {
    const d = devices[p.device];
    if (!d) throw new Error(`playwright has no device descriptor named "${p.device}"`);
    return { ...p, descriptor: { ...d } };
  }
  return p;
}

// ---------------------------------------------------------------------------
// GUARD: a non-200 record may never enter an aggregate.
// ---------------------------------------------------------------------------

function assertMeasured(record) {
  if (!record || record.measured !== true) {
    throw new Error(`aggregate refused: record for ${record && record.requestedUrl} is not measured (${record && record.excludedReason})`);
  }
  if (record.status !== 200) {
    throw new Error(`aggregate refused: ${record.requestedUrl} returned ${record.status}`);
  }
  return record;
}

// ---------------------------------------------------------------------------
// In-page probes. Everything the harness knows about a page comes from these.
// ---------------------------------------------------------------------------

// Probes are real functions, not strings. Playwright serialises the function
// source, so what runs in the page is exactly what is written here and reviewed
// here. A string passed to page.evaluate is treated as an expression and yields
// the function object rather than calling it, which returns undefined and reads
// downstream as "nothing observed". That failure mode is the same class as the
// defect this harness exists to correct, so it is red-proved by L5.

const PROBE_ENV = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: window.devicePixelRatio,
  coarse: window.matchMedia('(pointer: coarse)').matches,
  anyCoarse: window.matchMedia('(any-pointer: coarse)').matches,
  hover: window.matchMedia('(hover: hover)').matches,
  maxTouchPoints: navigator.maxTouchPoints,
  ua: navigator.userAgent,
});

const PROBE_SCROLL = async () => {
  const step = Math.max(200, Math.round(window.innerHeight * 0.8));
  const max = () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  for (let y = 0; y < max(); y += step) {
    window.scrollTo(0, y);
    await new Promise(r => requestAnimationFrame(() => setTimeout(r, 60)));
  }
  window.scrollTo(0, max());
  await new Promise(r => setTimeout(r, 150));
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 150));
  return max();
};

const PROBE_IMAGES = () => {
  const imgs = Array.from(document.images);
  const describe = i => {
    const r = i.getBoundingClientRect();
    return {
      src: i.currentSrc || i.getAttribute('src') || '(none)',
      loading: i.loading,
      renderedWidth: Math.round(r.width),
      renderedHeight: Math.round(r.height),
    };
  };
  // Three states, not two. An image inside a hidden tab panel is never going to
  // load and is not a defect. An image that finished loading at zero width IS.
  const loading = imgs.filter(i => !i.complete);
  const failed = imgs.filter(i => i.complete && i.naturalWidth === 0 && i.getBoundingClientRect().width > 0);
  const isVisible = i => { const r = i.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  return {
    total: imgs.length,
    lazy: imgs.filter(i => i.loading === 'lazy').length,
    loaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length,
    pending: loading.filter(isVisible).map(describe),
    pendingOffscreenOrHidden: loading.filter(i => !isVisible(i)).map(describe),
    failed: failed.map(describe),
    missingAlt: imgs.filter(i => i.getAttribute('alt') === null).map(describe),
  };
};

const PROBE_OVERFLOW = () => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const right = r.right + window.scrollX;
    if (right > vw + 1) {
      const cls = typeof el.className === 'string' && el.className.trim()
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
      offenders.push({
        selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls,
        right: Math.round(right),
        viewportWidth: vw,
      });
    }
    if (offenders.length >= 20) break;
  }
  return { documentScrollWidth: document.documentElement.scrollWidth, viewportWidth: vw, offenders };
};

const PROBE_TOUCH_TARGETS = () => {
  // WCAG 2.5.8 is 24 by 24 CSS px, with named exceptions. The exceptions are
  // applied here, in the probe, because a harness that reports every visually
  // hidden checkbox and every inline link in a sentence produces exactly the
  // false positive class this harness exists to correct. A-189 was one of those.
  const MIN = 24;
  const out = [];
  const sel = 'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [tabindex]:not([tabindex="-1"])';
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;

    // EXCEPTION, not a user facing control at all. aria-hidden takes it off the
    // accessibility tree, so it is not a target anyone is asked to hit. The
    // contact form honeypot is exactly this.
    if (el.closest('[aria-hidden="true"]')) continue;

    // EXCEPTION, visually hidden control. A 1px absolutely positioned or clipped
    // input is the sr-only or CSS toggle pattern. Its hit area is the label.
    const clipped = (cs.clipPath && cs.clipPath !== 'none') || (cs.clip && cs.clip !== 'auto');
    if (clipped || (cs.position === 'absolute' && r.width <= 2 && r.height <= 2)) continue;

    // EXCEPTION, clipped away by an ancestor. The off-screen honeypot pattern is
    // a 1px overflow:hidden box holding a full sized input: the input's own rect
    // is 177 by 21 and none of it is on screen. Measuring the element's rect and
    // ignoring what clips it is how a hidden control becomes a touch target
    // finding, which is the same false positive class as A-189.
    let hiddenByAncestor = false;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const acs = getComputedStyle(a);
      if (acs.overflow === 'visible' && acs.overflowX === 'visible' && acs.overflowY === 'visible') continue;
      const ar = a.getBoundingClientRect();
      const overlapW = Math.min(r.right, ar.right) - Math.max(r.left, ar.left);
      const overlapH = Math.min(r.bottom, ar.bottom) - Math.max(r.top, ar.top);
      if (overlapW < MIN || overlapH < MIN) { hiddenByAncestor = true; break; }
    }
    if (hiddenByAncestor) continue;

    // EXCEPTION, the control has a label acting as its hit area.
    if (el.id) {
      const lab = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lab) {
        const lr = lab.getBoundingClientRect();
        if (lr.width >= MIN && lr.height >= MIN) continue;
      }
    }
    if (el.closest('label')) {
      const lr = el.closest('label').getBoundingClientRect();
      if (lr.width >= MIN && lr.height >= MIN) continue;
    }

    // EXCEPTION, WCAG 2.5.8 inline. A link inside a sentence of running text is
    // sized by the line box and is explicitly out of scope.
    if (el.tagName === 'A' && cs.display.startsWith('inline')) {
      const p = el.parentElement;
      const parentText = p ? (p.textContent || '').trim().length : 0;
      const ownText = (el.textContent || '').trim().length;
      if (p && parentText > ownText + 10) continue;
    }

    if (r.width < MIN || r.height < MIN) {
      out.push({
        selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''),
        text: (el.textContent || '').trim().slice(0, 40),
        width: Math.round(r.width * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        min: MIN,
      });
    }
    if (out.length >= 40) break;
  }
  return out;
};

const PROBE_SECTIONS = () => {
  const out = [];
  for (const el of document.querySelectorAll('section, main > div, [data-section]')) {
    const r = el.getBoundingClientRect();
    const text = (el.innerText || '').trim();
    const media = el.querySelectorAll('img, svg, canvas, video, iframe').length;

    // A PAINTED SURFACE IS NOT AN EMPTY SECTION. A full height decorative panel
    // carrying a gradient or an image has no text and no media element and would
    // otherwise read as a blank section, which is the A-188 false positive in a
    // different costume. Judge it by what it paints, not by what it contains.
    const cs = getComputedStyle(el);
    const parentBg = el.parentElement ? getComputedStyle(el.parentElement).backgroundColor : '';
    const paints = (cs.backgroundImage && cs.backgroundImage !== 'none')
      || (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== parentBg)
      || (cs.borderTopWidth !== '0px' || cs.borderBottomWidth !== '0px');
    if (paints) continue;

    if (r.height > 40 && text.length === 0 && media === 0) {
      out.push({
        selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''),
        height: Math.round(r.height),
        textLength: 0,
        mediaCount: 0,
      });
    }
    if (out.length >= 20) break;
  }
  return out;
};

const PROBE_HEADINGS = () => Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
  .map(h => ({ level: Number(h.tagName[1]), text: (h.innerText || '').trim().slice(0, 80) }));

const PROBE_LINKS = () => Array.from(document.querySelectorAll('a[href]'))
  .map(a => a.getAttribute('href'))
  .filter(h => h && !h.startsWith('#') && !h.startsWith('mailto:') && !h.startsWith('tel:'));

// Categories the harness can actually collect. Anything not in this list has no
// route to a finding, which is what stops model prose entering a report.
//
// DEFECT categories can produce a finding. INVENTORY categories never can: they
// are context recorded alongside a finding. Headings and links are inventory,
// because every page has them and a control that fires on every page is a
// control that cannot come out negative, which is the thing RULE 0-V bans.
const DEFECT_CATEGORIES = ['horizontalOverflow', 'touchTargets', 'images', 'emptySections', 'consoleErrors', 'networkErrors'];
const INVENTORY_CATEGORIES = ['headings', 'links'];
const CATEGORIES = [...DEFECT_CATEGORIES, ...INVENTORY_CATEGORIES];

// ---------------------------------------------------------------------------

async function settleLazyContent(page) {
  await page.evaluate(PROBE_SCROLL);
  let images = await page.evaluate(PROBE_IMAGES);
  const deadline = Date.now() + LAZY_TIMEOUT;
  while (images.pending.length > 0 && Date.now() < deadline) {
    await page.waitForTimeout(250);
    images = await page.evaluate(PROBE_IMAGES);
  }
  return { images, lazyComplete: images.pending.length === 0 };
}

/**
 * Measure one route under one profile.
 * Returns a record that is either measured:true with observations, or
 * measured:false with an excludedReason. There is no third state, and only
 * measured:true records reach an aggregate.
 */
async function measureRoute(context, profile, baseUrl, route, opts = {}) {
  const requestedUrl = new URL(route, baseUrl).toString();

  // A URL that cannot round-trip through the URL parser unchanged is a corpus
  // defect, not a broken route. Catch it before it becomes a 404 finding.
  const corpusWarning = requestedUrl.includes('(') || requestedUrl.includes('%5C') || requestedUrl.includes('\\')
    ? 'route path contains a route group or a path separator that survived discovery'
    : null;

  const record = {
    profile: profile.id,
    route,
    requestedUrl,
    landedUrl: null,
    status: null,
    redirected: false,
    measured: false,
    excludedReason: null,
    corpusWarning,
    observedViewport: null,
    observationsCollected: [],
    observations: {},
    durationMs: 0,
  };

  if (corpusWarning) {
    record.excludedReason = 'corpus-malformed-url';
    return record;
  }

  const page = await context.newPage();
  const consoleErrors = [];
  const networkErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
  page.on('requestfailed', r => { networkErrors.push({ url: r.url(), error: (r.failure() && r.failure().errorText) || 'unknown' }); });
  page.on('response', r => { if (r.status() >= 400 && !r.url().includes('favicon')) networkErrors.push({ url: r.url(), status: r.status() }); });

  const started = Date.now();
  try {
    let resp = null;
    try {
      resp = await page.goto(requestedUrl, { waitUntil: 'domcontentloaded', timeout: opts.navTimeout || NAV_TIMEOUT });
    } catch (err) {
      record.excludedReason = 'navigation-failed: ' + String(err.message).split('\n')[0];
      return record;
    }

    record.status = resp ? resp.status() : null;
    record.landedUrl = page.url();
    record.redirected = new URL(record.landedUrl).pathname !== new URL(requestedUrl).pathname;

    // GUARD: status asserted. A 404 page has paragraphs and a container and
    // yields perfectly plausible geometry. Two website routes 404 today.
    if (record.status !== 200) {
      record.excludedReason = `http-${record.status}`;
      return record;
    }

    // GUARD: an auth wall is not a measured page. Recording it as clean is how
    // the earlier run reported "Authentication and Sessions Fully Functional".
    if (record.redirected && /\/(login|sign-?in|auth)(\/|$|\?)/.test(new URL(record.landedUrl).pathname)) {
      record.excludedReason = 'auth-wall: redirected to ' + new URL(record.landedUrl).pathname;
      return record;
    }

    // GUARD FLAW 3: the viewport is read from the browser, never from config.
    const env = await page.evaluate(PROBE_ENV);
    record.observedViewport = env;

    const expectW = profile.descriptor.viewport.width;
    if (Math.abs(env.width - expectW) > 2) {
      record.excludedReason = `viewport-label-mismatch: profile ${profile.id} declares ${expectW}, browser reports ${env.width}`;
      return record;
    }

    // GUARD FLAW 1: emulation proved live. If pointer: coarse does not match the
    // profile, the run is a resized window and no mobile finding is admissible.
    if (env.coarse !== profile.expectCoarse) {
      record.excludedReason = `pointer-media-mismatch: profile ${profile.id} expects (pointer: coarse)=${profile.expectCoarse}, browser reports ${env.coarse}. A resized window cannot measure mobile styling.`;
      return record;
    }

    // GUARD FLAW 2: scroll and settle before any observation.
    // A page that navigates under us (a client redirect, a meta refresh) destroys
    // the execution context mid probe. That is an UNMEASURED route, not a crash
    // and not a clean one. Partial observations already collected are kept and
    // reported as such, because a half measured page must not read as measured.
    try {
    const settled = await settleLazyContent(page);
    record.lazyComplete = settled.lazyComplete;

    record.observations.images = settled.images;
    record.observationsCollected.push('images');

    record.observations.horizontalOverflow = await page.evaluate(PROBE_OVERFLOW);
    record.observationsCollected.push('horizontalOverflow');

    if (profile.expectCoarse) {
      record.observations.touchTargets = await page.evaluate(PROBE_TOUCH_TARGETS);
      record.observationsCollected.push('touchTargets');
    }

    if (settled.lazyComplete) {
      record.observations.emptySections = await page.evaluate(PROBE_SECTIONS);
      record.observationsCollected.push('emptySections');
    }
    // else: emptySections stays uncollected on purpose. Below the fold content
    // that has not finished loading is not evidence of an empty section.

    record.observations.headings = await page.evaluate(PROBE_HEADINGS);
    record.observationsCollected.push('headings');
    record.observations.links = await page.evaluate(PROBE_LINKS);
    record.observationsCollected.push('links');

    record.observations.consoleErrors = consoleErrors;
    record.observationsCollected.push('consoleErrors');
    record.observations.networkErrors = networkErrors;
    record.observationsCollected.push('networkErrors');

    record.measured = true;
    return record;
    } catch (err) {
      record.measured = false;
      record.excludedReason = 'observation-aborted: ' + String(err.message).split('\n')[0];
      record.landedUrlAtAbort = page.url();
      return record;
    }
  } finally {
    record.durationMs = Date.now() - started;
    await page.close().catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// FINDINGS. A finding needs evidence. There is no constructor without one.
// ---------------------------------------------------------------------------

// One place decides what counts as an item for a category, so an aggregate and a
// finding can never disagree about the same observation.
function categoryItems(cat, obs) {
  if (obs === undefined || obs === null) return [];
  if (INVENTORY_CATEGORIES.includes(cat)) return [];
  if (cat === 'horizontalOverflow') {
    // THE VERDICT IS WHETHER THE DOCUMENT SCROLLS, not whether some element
    // sticks out. A decorative glow inside an overflow:hidden ancestor extends
    // past the viewport by design and moves nothing. Reporting it would be the
    // same false positive class as A-187, where two real colours were read as a
    // defect because neither was the element the claim was about.
    if (!obs || obs.documentScrollWidth <= obs.viewportWidth + 1) return [];
    return obs.offenders || [];
  }
  if (cat === 'images') return [...(obs.failed || []), ...(obs.pending || [])];
  if (Array.isArray(obs)) return obs;
  return [];
}

function buildFindings(records) {
  const findings = [];
  const notMeasured = [];

  for (const rec of records) {
    if (!rec.measured) {
      notMeasured.push({ route: rec.route, profile: rec.profile, reason: rec.excludedReason, status: rec.status });
      continue;
    }
    for (const cat of CATEGORIES) {
      if (!rec.observationsCollected.includes(cat)) {
        // GUARD FLAW 5: an uncollected category yields "not measured", never a
        // prose finding. All 193 records of the earlier run were in this state.
        notMeasured.push({ route: rec.route, profile: rec.profile, category: cat, reason: 'observation not collected' });
        continue;
      }
      const obs = rec.observations[cat];
      const items = categoryItems(cat, obs);
      if (items.length === 0) continue; // a real, evidenced negative
      findings.push({
        route: rec.route,
        profile: rec.profile,
        observedViewport: `${rec.observedViewport.width}x${rec.observedViewport.height} dpr=${rec.observedViewport.dpr} coarse=${rec.observedViewport.coarse}`,
        landedUrl: rec.landedUrl,
        category: cat,
        count: items.length,
        evidence: items.slice(0, 5),
      });
    }
  }
  return { findings, notMeasured };
}

/** Aggregate over MEASURED records only. Refuses anything else, loudly. */
function aggregate(records, category) {
  const measured = records.filter(r => r.measured);
  for (const r of measured) assertMeasured(r);
  const withCategory = measured.filter(r => r.observationsCollected.includes(category));
  const affected = withCategory.filter(r => categoryItems(category, r.observations[category]).length > 0);
  return {
    category,
    requested: records.length,
    measured: measured.length,
    observedForCategory: withCategory.length,
    affected: affected.length,
    // The claim is only ever "clean over N", never "clean across all routes".
    claim: `${affected.length} of ${withCategory.length} MEASURED routes affected (${records.length} requested)`,
  };
}

// ---------------------------------------------------------------------------
// DENOMINATOR. Printed first, stamped into the report, gates the verdict.
// ---------------------------------------------------------------------------

function denominator(records, discovery) {
  const byReason = {};
  for (const r of records) {
    if (!r.measured) byReason[r.excludedReason ? r.excludedReason.split(':')[0] : 'unknown'] = (byReason[r.excludedReason ? r.excludedReason.split(':')[0] : 'unknown'] || 0) + 1;
  }
  const requested = records.length;
  const http200 = records.filter(r => r.status === 200).length;
  const measured = records.filter(r => r.measured).length;
  return {
    discovered: discovery.proposals.length,
    discoverySkipped: discovery.skipped.length,
    requested,
    http200,
    measured,
    coverage: requested === 0 ? 0 : Math.round((measured / requested) * 1000) / 1000,
    excludedByReason: byReason,
  };
}

function denominatorBanner(den, minCoverage) {
  const bar = '='.repeat(78);
  const valid = den.coverage >= minCoverage;
  const lines = [
    bar,
    'DENOMINATOR FIRST  (RULE 0-V: check the denominator before reading any green)',
    bar,
    `  routes discovered ........ ${den.discovered}`,
    `  discovery skipped ........ ${den.discoverySkipped}  (dynamic or not routable, see report)`,
    `  routes requested ......... ${den.requested}`,
    `  returned HTTP 200 ........ ${den.http200}`,
    `  ACTUALLY MEASURED ........ ${den.measured} of ${den.requested}   coverage ${(den.coverage * 100).toFixed(1)}%`,
    '  excluded by reason:',
    ...Object.entries(den.excludedByReason).map(([k, v]) => `      ${k.padEnd(28)} ${v}`),
    bar,
    valid
      ? `VERDICT: coverage ${(den.coverage * 100).toFixed(1)}% meets the ${(minCoverage * 100).toFixed(0)}% floor. Aggregates below cover ${den.measured} routes ONLY.`
      : `VERDICT: NOT A VALID AUDIT. Coverage ${(den.coverage * 100).toFixed(1)}% is below the ${(minCoverage * 100).toFixed(0)}% floor.\n         Every aggregate below describes ${den.measured} routes, NOT ${den.requested}.\n         Do not quote a green from this run. Fix the corpus or the access first.`,
    bar,
  ];
  return { text: lines.join('\n'), valid };
}

async function launchContext(profileId, opts = {}) {
  const profile = resolveProfile(profileId);
  const browser = await chromium.launch({ headless: opts.headless !== false });
  const contextOptions = { ...profile.descriptor };
  if (opts.storageState) contextOptions.storageState = opts.storageState;
  const context = await browser.newContext(contextOptions);
  context.setDefaultTimeout(opts.navTimeout || NAV_TIMEOUT);
  return { browser, context, profile };
}

/** Auth posture is OBSERVED, never declared. The earlier run got this backwards. */
async function observeAuthPosture(context) {
  const cookies = await context.cookies();
  const session = cookies.filter(c => /auth|session|sb-|token/i.test(c.name));
  return {
    cookieCount: cookies.length,
    sessionCookieNames: session.map(c => c.name),
    authenticated: session.length > 0,
  };
}

module.exports = {
  PROFILES, CATEGORIES, DEFECT_CATEGORIES, INVENTORY_CATEGORIES, categoryItems,
  resolveProfile, launchContext, measureRoute,
  settleLazyContent, buildFindings, aggregate, assertMeasured,
  denominator, denominatorBanner, observeAuthPosture,
  DESKTOP_DESCRIPTOR, devices,
};
