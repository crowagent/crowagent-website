/**
 * check-csp.js — every origin the build references must be allowed by its own CSP.
 *
 * WHY. copy-cf-config.js verifies that `_headers` CONTAINS a
 * Content-Security-Policy line. It does not verify that the policy permits
 * what this build actually loads. Those are different questions, and the
 * second one is the one that breaks a page.
 *
 * The failure mode is silent and total: a blocked script does not render an
 * error on the page, it simply does not run. A blocked stylesheet leaves the
 * page unstyled. Neither returns a non-2xx, so the sitewide subresource check
 * cannot see it — that check asks the SERVER for each asset, with no policy
 * applied. The browser is what enforces CSP, and only in production, where
 * Cloudflare is serving `_headers`. Locally the file is inert.
 *
 * The legacy CSP was written for the legacy site: PostHog, Calendly,
 * Turnstile, Railway. The Astro build makes zero third-party requests today,
 * so the risk is not that the policy is too tight in general — it is that a
 * single new origin (an embed, a font host, an analytics tag added later)
 * lands in the markup and nobody notices until production.
 *
 * This walks the built HTML and CSS, collects every absolute origin it
 * references, and checks each against the relevant CSP directive.
 *
 * ── WHAT THIS GATE COULD NOT SEE, UNTIL 2026-08-03 ────────────────────────
 *
 * It read four things: <script src>, <link rel=stylesheet>, <img src> and
 * <iframe src>, plus url() and @import in CSS. Every one of those is a
 * SUBRESOURCE declared as a static attribute. None of the ways a form actually
 * reaches a server is in that list, so the gate was blind to the entire class
 * of defect that matters most on a marketing site: where the leads go.
 *
 * PLATFORM-CHARTER.md records the consequence as a known hole — "PartnerForm's
 * submission to formspree.io is blocked by the shipped CSP, silently, and no
 * gate can see it". Measured on the LIVE site on 2026-08-03 rather than taken
 * from the note: `connect-src` carries no formspree.io, and driving
 * https://crowagent.ai/partners in Chromium produced
 *
 *   Connecting to 'https://formspree.io/' violates the following Content
 *   Security Policy directive: "connect-src 'self' https://crowagent.ai …"
 *
 * The origin was removed from both `connect-src` and `form-action` in commit
 * 911fbc5b on 2026-06-02, so partner enquiries have been refused by the browser
 * for two months. This is the fourth time on this project that a gate asserted
 * something ADJACENT to the thing that mattered (OA-20 links, OA-24 structured
 * data types, OA-28 rendered content, and now form endpoints).
 *
 * Three contexts are now read:
 *
 *   1. <form action="https://…">   checked against BOTH `form-action` and
 *      `connect-src`. Both, because every form on this site posts with
 *      fetch(form.action) after preventDefault — governed by connect-src — and
 *      falls back to a native submit when JavaScript is off, governed by
 *      form-action. An origin permitted by only one of the two is a form that
 *      works in exactly one of the two situations, silently.
 *   2. fetch('https://…') and navigator.sendBeacon('https://…') string
 *      literals inside inline <script> — `connect-src`.
 *   3. el.src = 'https://…' and any absolute string literal ending in .js
 *      inside inline <script> — `script-src`. This is how Turnstile is loaded,
 *      and until now nothing checked that the policy permitted it.
 *
 * A URL held in a variable that this build cannot resolve is still invisible.
 * That limit is real and is stated rather than papered over; the three shapes
 * above are what this codebase actually uses.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * Defaults to ../dist, the build `npm run build` produces.
 *
 * The override exists because `dist/` is served to the owner on :8095 while
 * work is in progress, so a change has to be proved against a build written
 * somewhere else. A gate that can only be run as part of the one build nobody
 * is allowed to disturb is a gate that gets skipped.
 */
const DIST = process.argv[2] || process.env.CSP_DIST || path.join(__dirname, '..', 'dist');

const headersFile = path.join(DIST, '_headers');
if (!fs.existsSync(headersFile)) {
  console.error('csp: no _headers in dist — run copy-cf-config.js first');
  process.exit(1);
}

const csp = (fs.readFileSync(headersFile, 'utf8').match(/Content-Security-Policy:\s*(.+)/) || [])[1];
if (!csp) {
  console.error('csp: no Content-Security-Policy directive found in _headers');
  process.exit(1);
}

/** directive -> allowed source list */
const policy = {};
for (const part of csp.split(';')) {
  const [name, ...sources] = part.trim().split(/\s+/);
  if (name) policy[name] = sources;
}

function allowed(directive, origin) {
  const list = policy[directive] || policy['default-src'] || [];
  return list.some((src) => {
    if (src === "'self'" || src === '*') return src === '*';
    if (src.startsWith('http')) {
      if (src.includes('*')) {
        // https://*.calendly.com
        const re = new RegExp('^' + src.replace(/[.]/g, '\\.').replace(/\*/g, '[^.]+') + '$');
        return re.test(origin);
      }
      return src === origin;
    }
    return false;
  });
}

/** Which directive governs a reference found in this context. */
const CONTEXT = {
  script: 'script-src',
  style: 'style-src',
  img: 'img-src',
  font: 'font-src',
  frame: 'frame-src',
  connect: 'connect-src',
  media: 'media-src',
  form: 'form-action',
};

/**
 * Origins this build references and the shipped policy does NOT permit, each
 * with the reason it is still here and who has to decide.
 *
 * Same contract as KNOWN_UNPORTED in check-links.js: every entry is printed on
 * every build so it cannot rot quietly, an entry that no longer matches
 * anything is reported as stale, and anything not listed FAILS. The list can
 * only shrink.
 *
 * An entry here is not permission to ignore the problem. It is a record that
 * the problem is known, is a decision rather than an oversight, and is visible
 * on every single build until somebody settles it.
 */
const KNOWN_BLOCKED = {
  'form-action https://formspree.io':
    'OA-08 / OA-09 / OA-31. The partner form posts here and the shipped CSP forbids it, ' +
    'so partner enquiries have been refused by the browser since commit 911fbc5b on ' +
    '2026-06-02. Restoring the origin re-opens an undisclosed-until-2026-08-02 US ' +
    'transfer; moving to a first-party endpoint on app.crowagent.ai fixes this AND ' +
    'OA-09 (nothing verifies the Turnstile token Formspree receives). That is an ' +
    'owner decision, recorded in OWNER-ACTIONS.md, not one to take inside a gate.',
  'connect-src https://formspree.io':
    'Same decision as the form-action entry above. Listed separately because the two ' +
    'directives govern different submission paths and either one alone leaves the form ' +
    'working in only half of them.',
};

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else out.push(f);
  }
  return out;
}

const found = new Map(); // `${directive} ${origin}` -> Set(files)
const files = walk(DIST);

function record(directive, url, file) {
  let origin;
  try {
    origin = new URL(url).origin;
  } catch {
    return; // relative — same-origin, covered by 'self'
  }
  if (origin === 'https://crowagent.ai') return; // self
  const key = `${directive} ${origin}`;
  if (!found.has(key)) found.set(key, new Set());
  found.get(key).add(path.relative(DIST, file));
}

for (const f of files) {
  if (f.endsWith('.html')) {
    const html = fs.readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<script[^>]+src=["'](https?:\/\/[^"']+)["']/g)) record(CONTEXT.script, m[1], f);
    for (const m of html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["'](https?:\/\/[^"']+)["']/g)) record(CONTEXT.style, m[1], f);
    for (const m of html.matchAll(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/g)) record(CONTEXT.img, m[1], f);
    for (const m of html.matchAll(/<iframe[^>]+src=["'](https?:\/\/[^"']+)["']/g)) record(CONTEXT.frame, m[1], f);
    // og:image and JSON-LD urls are metadata, not fetched by the page — skipped on purpose.

    /* WHERE THE LEADS GO. A form's action is checked against BOTH directives:
       form-action for the no-JavaScript native submit, connect-src for the
       fetch(form.action) every form on this site actually uses. */
    for (const m of html.matchAll(/<form[^>]+action=["'](https?:\/\/[^"']+)["']/g)) {
      record(CONTEXT.form, m[1], f);
      record(CONTEXT.connect, m[1], f);
    }

    /* Inline scripts. Astro inlines every component script on this site, so
       this is where the newsletter POST and the Turnstile loader live. */
    for (const s of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
      const body = s[1];
      if (/^\s*[{[]/.test(body)) continue; // application/ld+json and friends
      for (const m of body.matchAll(/\bfetch\(\s*["'](https?:\/\/[^"']+)["']/g)) record(CONTEXT.connect, m[1], f);
      for (const m of body.matchAll(/\bsendBeacon\(\s*["'](https?:\/\/[^"']+)["']/g)) record(CONTEXT.connect, m[1], f);
      for (const m of body.matchAll(/\.src\s*=\s*["'](https?:\/\/[^"']+)["']/g)) record(CONTEXT.script, m[1], f);
      // A script URL held in a const, which is how Turnstile is loaded.
      for (const m of body.matchAll(/["'](https?:\/\/[^"']+\.js(?:\?[^"']*)?)["']/g)) record(CONTEXT.script, m[1], f);
    }
  } else if (f.endsWith('.css')) {
    const css = fs.readFileSync(f, 'utf8');
    for (const m of css.matchAll(/url\(["']?(https?:\/\/[^)"']+)["']?\)/g)) {
      record(/\.woff2?|\.ttf|\.otf/.test(m[1]) ? CONTEXT.font : CONTEXT.img, m[1], f);
    }
    for (const m of css.matchAll(/@import\s+["'](https?:\/\/[^"']+)["']/g)) record(CONTEXT.style, m[1], f);
  }
}

const blocked = [];
const known = [];
for (const [key, refs] of found) {
  const [directive, origin] = key.split(' ');
  if (allowed(directive, origin)) continue;
  if (KNOWN_BLOCKED[key]) known.push({ key, reason: KNOWN_BLOCKED[key], refs: [...refs] });
  else blocked.push({ directive, origin, refs: [...refs] });
}

console.log(`csp: ${found.size} external origin reference(s) across the build`);
for (const [key, refs] of found) console.log(`  ${key}  (${refs.size} file(s))`);
if (found.size === 0) console.log('  none — the build loads nothing from a third party');

/* Printed on EVERY build, not tucked behind a flag. A recorded defect that
   nobody sees is indistinguishable from one nobody found. */
if (known.length) {
  console.log(`\ncsp: ${known.length} reference(s) BLOCKED BUT RECORDED — these do not fail the build\n`);
  for (const k of known) {
    console.log(`  ${k.key}`);
    console.log(`      ${k.reason}`);
    k.refs.slice(0, 5).forEach((r) => console.log(`      in: ${r}`));
  }
}

/* A recorded exception that no longer matches anything is worse than none: it
   makes the list read as current when it is not. */
const stale = Object.keys(KNOWN_BLOCKED).filter((k) => !found.has(k));
if (stale.length) {
  console.log(`\ncsp: ${stale.length} STALE entr(ies) in KNOWN_BLOCKED — nothing references these any more:`);
  stale.forEach((k) => console.log(`  ${k}  — remove it from check-csp.js`));
}

if (blocked.length) {
  console.error(`\ncsp: ${blocked.length} reference(s) BLOCKED by the policy this build ships\n`);
  for (const b of blocked) {
    console.error(`  ${b.origin} is not allowed by ${b.directive}`);
    b.refs.slice(0, 5).forEach((r) => console.error(`      ${r}`));
  }
  console.error('\n  A blocked subresource fails silently in production: no error on the page,');
  console.error('  no non-2xx, and the sitewide check cannot see it because it asks the server');
  console.error('  directly with no policy applied.');
  console.error('  A blocked FORM ENDPOINT is worse: the visitor fills the form, presses send,');
  console.error('  and the enquiry is discarded by the browser before it leaves the page.\n');
  process.exit(1);
}

console.log(
  known.length
    ? '\n  every external reference is either permitted by the shipped policy or recorded above'
    : '\n  every external reference is permitted by the shipped policy'
);
