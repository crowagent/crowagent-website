/**
 * check-csp-required-origins.js — origins the site DEPENDS ON must survive
 * every future edit to the policy.
 *
 * ── THE HOLE THIS FILLS, AND WHY IT IS A DIFFERENT HOLE ────────────────────
 *
 * check-csp.js walks `dist`, collects every origin the BUILD references, and
 * fails if the policy forbids one. That is derivation: the requirement is read
 * out of the artefact. It is the right shape for a subresource this repository
 * emits, and it is structurally blind to anything the repository never
 * mentions.
 *
 * CROWAGENT-WEB-N is exactly that blind spot, measured. Sentry recorded 129
 * enforced violations between 2026-05-29 and 2026-08-10:
 *
 *   blockedUri         https://static.cloudflareinsights.com/beacon.min.js/v4513…
 *   effectiveDirective script-src-elem
 *   documentUri        https://crowagent.ai/blog/
 *
 * Cloudflare injects that beacon into the HTML response at the edge, after
 * every build step has run. `git grep cloudflareinsights` finds nothing in this
 * tree and the built blog page carries exactly one `<script src>`, the Astro
 * bundle. So check-csp.js could never see it, could never fail, and reported a
 * clean policy for seventy-four days while Cloudflare Web Analytics recorded
 * nothing at all. The failure was silent in both directions: no error on the
 * page, and a dashboard that simply showed no traffic.
 *
 * THIS GATE INVERTS THE DIRECTION. It does not ask what the build references.
 * It carries an explicit, reasoned list of origins the SITE requires, and fails
 * if the shipped policy stops permitting one. A requirement that lives outside
 * the artefact has to be stated outside the artefact.
 *
 * ── WHAT IT READS, AND WHY THAT IS THE REAL POLICY ─────────────────────────
 *
 * `dist/_headers`, AFTER copy-cf-config.js has rewritten it. That file is the
 * deployment contract: Cloudflare Pages serves those headers verbatim. It is
 * emphatically NOT a local copy of the policy kept beside the test, which is
 * the failure this gate is most at risk of becoming: a guard that compares a
 * literal against a literal passes forever and defends the defect it was
 * written to catch.
 *
 * Proved equal to production on 2026-08-12 rather than assumed: the
 * Content-Security-Policy line in `dist/_headers`, including all sixteen
 * SHA-256 hashes that copy-cf-config.js computes from the build, is identical
 * to the header returned by https://crowagent.ai/blog/. Those hashes cannot be
 * reproduced by hand, so their agreement is what proves the chain
 * `_headers` -> copy-cf-config.js -> `dist/_headers` -> live response.
 *
 * `--url=<page>` re-runs the same assertions against a live response header,
 * for confirming a deploy landed. It is not in any build chain: a gate that
 * needs the network is a gate that fails for reasons unrelated to the site.
 *
 * ── HOW A SOURCE IS MATCHED ────────────────────────────────────────────────
 *
 * By the browser's own rules, not by substring:
 *
 *   1. The EFFECTIVE directive is resolved through the real fallback chain, so
 *      what is asserted is what the browser will enforce. `script-src-elem`
 *      falls back to `script-src`, which falls back to `default-src`. The
 *      Sentry report named `script-src-elem` precisely because the policy does
 *      not declare it; a gate that looked for a literal `script-src-elem`
 *      directive would report a missing directive that must not exist.
 *   2. A blanket source does NOT satisfy a requirement. `*`, a bare scheme like
 *      `https:`, `'unsafe-inline'` and `'unsafe-eval'` would all technically
 *      let the beacon through, and every one of them is a security regression
 *      that must not be able to buy a green tick here. Only a named host, or a
 *      subdomain wildcard that genuinely covers it, counts.
 *
 * Rule 2 can only ever make this gate stricter, never looser, which is the
 * property that keeps it from drifting into a defence of the thing it guards.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Origins this site requires, the directive that governs each, and the reason
 * it is here. The reason is not decoration: an entry nobody can justify is an
 * entry that should be deleted from the policy, not defended by a gate.
 */
const REQUIRED = [
  {
    directive: 'script-src-elem',
    origin: 'https://static.cloudflareinsights.com',
    reason:
      'CROWAGENT-WEB-N. Cloudflare Web Analytics serves its beacon from this host and ' +
      'Cloudflare injects the <script> at the edge, so it appears in no build output and ' +
      'no build-derived gate can require it. Blocked under `enforce` for at least 74 days ' +
      '(2026-05-29 to 2026-08-10, 129 recorded violations), during which the product ' +
      'recorded nothing. Asserted against script-src-elem because that is the directive ' +
      'the browser reports; it is not declared, and resolves to script-src.',
  },
  {
    directive: 'connect-src',
    origin: 'https://cloudflareinsights.com',
    reason:
      'CROWAGENT-WEB-N, second host. The beacon POSTs its measurements with ' +
      'navigator.sendBeacon to https://cloudflareinsights.com/cdn-cgi/rum (read from ' +
      'beacon.min.js on 2026-08-12: sendObjectBeacon sends to `i || "/cdn-cgi/rum?"+t`, ' +
      'and the caller sets that override to the absolute apex URL whenever the injected ' +
      'data-cf-beacon payload carries no `version` key). A different host from the one ' +
      'above, so script-src does not cover it. No connect-src violation could ever have ' +
      'been reported while the script itself was blocked, so the quiet report on this ' +
      'directive was never evidence that it was correct.',
  },
  {
    directive: 'script-src',
    origin: 'https://challenges.cloudflare.com',
    reason:
      'Turnstile. Loaded from a string literal inside an inline script rather than a ' +
      'static <script src>, which is the shape check-csp.js was extended to read in ' +
      'August 2026 after it had been invisible to every gate before that.',
  },
  {
    directive: 'connect-src',
    origin: 'https://app.crowagent.ai',
    reason:
      'Where the leads go. Every form on this site posts with fetch(form.action) after ' +
      'preventDefault, so connect-src is the directive that decides whether an enquiry ' +
      'leaves the page. Losing it discards submissions silently, which is the precise ' +
      'shape of the formspree.io regression check-csp.js used to record in KNOWN_BLOCKED ' +
      'before it closed 2026-09-03 (R281-PARTNERS-ENQUIRY-DECISION-01).',
  },
  {
    directive: 'form-action',
    origin: 'https://app.crowagent.ai',
    reason:
      'The same endpoint on the no-JavaScript path, where the browser performs a native ' +
      'submit. An origin permitted by only one of connect-src and form-action is a form ' +
      'that works in exactly one of the two situations, and nothing on the page says so.',
  },
  {
    directive: 'connect-src',
    origin: 'https://crowagent-platform-production.up.railway.app',
    reason:
      'R281-PARTNERS-ENQUIRY-DECISION-01, 2026-09-03. PartnerForm.astro posts here via ' +
      'fetch(form.action), replacing the formspree.io submission that check-csp.js ' +
      'KNOWN_BLOCKED used to record as refused by this exact directive. Losing this entry ' +
      'reproduces that regression against a different host: every partner enquiry silently ' +
      'refused by the browser with no non-2xx response for any gate to notice.',
  },
  {
    directive: 'form-action',
    origin: 'https://crowagent-platform-production.up.railway.app',
    reason:
      'The same endpoint on the no-JavaScript path. See the connect-src entry above: an ' +
      'origin permitted by only one of the two directives is a form that works in exactly ' +
      'one of the two situations.',
  },
];

/**
 * Directives that must stay free of blanket sources. style-src is deliberately
 * NOT here: its 'unsafe-inline' is a known, argued retention documented at
 * length in `_headers`, and 184 inline style attributes depend on it. Asserting
 * against it would fail on a decision rather than on a defect.
 */
const NO_BLANKET = ['script-src', 'connect-src', 'form-action', 'object-src', 'base-uri'];
const BLANKET = ["'unsafe-inline'", "'unsafe-eval'", '*', 'data:', 'https:', 'http:'];

/** The browser's fallback chain, so this asserts what is actually enforced. */
const FALLBACK = {
  'script-src-elem': ['script-src', 'default-src'],
  'script-src-attr': ['script-src', 'default-src'],
  'style-src-elem': ['style-src', 'default-src'],
  'style-src-attr': ['style-src', 'default-src'],
  'script-src': ['default-src'],
  'style-src': ['default-src'],
  'connect-src': ['default-src'],
  'img-src': ['default-src'],
  'font-src': ['default-src'],
  'frame-src': ['child-src', 'default-src'],
  'media-src': ['default-src'],
  'worker-src': ['child-src', 'script-src', 'default-src'],
  'manifest-src': ['default-src'],
  /* form-action has NO fallback to default-src. Absent means unrestricted, and
     conflating that with "inherits default-src 'self'" would report a form that
     can post anywhere as if it were locked down. */
  'form-action': [],
  'base-uri': [],
  'object-src': ['default-src'],
};

const args = process.argv.slice(2);
const urlArg = args.find((a) => a.startsWith('--url='));
const distArg = args.find((a) => !a.startsWith('--'));

/*
 * [R28-WEB-4A] The catch-all's Cache-Control, read out of the same bytes.
 *
 * WHY THIS LIVES IN A CSP GATE. It is not a caching assertion. Cloudflare does
 * not inject its JavaScript Detections bootstrap when the origin response
 * carries `no-transform`, and that bootstrap is an INLINE script whose
 * `__CF$cv$params` carries the request's own cf-ray, so its sha256 differs on
 * every response and no hash allowlist can ever cover it. `no-transform` is
 * therefore the only thing standing between the policy and a permanent
 * enforce-mode violation on every HTML page. It is a CSP requirement wearing a
 * caching header's clothes, and it belongs with the other requirements that
 * live outside the artefact because nothing in `dist` can imply them.
 *
 * WHAT IT DEFENDS AGAINST, MEASURED. The owner approved it on 2026-09-02 and
 * 175a877e shipped it. 83a74c53 on 2026-09-07, a commit about deleting the
 * legacy estate, cut 78 lines out of that block and took the line with them.
 * Nothing failed. Live crowagent.ai served the Cloudflare Pages default with no
 * `no-transform` in it and `__CF$cv$params` on 3 of 3 pages fetched, for three
 * days, while every gate stayed green. A header this file does not assert is a
 * header any unrelated cleanup can delete.
 *
 * IT ASSERTS A PROPERTY, NOT A LITERAL. The directive must be present in the
 * catch-all's Cache-Control whatever the rest of that value says, so tuning the
 * TTL does not trip it and does not tempt anyone to soften it.
 */
function catchAllCacheControl(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trimEnd() === '/*');
  if (start === -1) return null;
  const values = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    /* A rule ends at the next line in column 0 that is not a comment. Blank
       lines and `#` banners sit inside a block and must not end it. */
    if (/^\S/.test(lines[i]) && !lines[i].startsWith('#')) break;
    const m = lines[i].match(/^\s*Cache-Control:\s*(.+)$/i);
    if (m) values.push(m[1].trim());
  }
  return values;
}

/** Reads the policy, and refuses to proceed on anything it cannot vouch for. */
async function readPolicy() {
  if (urlArg) {
    const url = urlArg.slice('--url='.length);
    const res = await fetch(url, { redirect: 'follow' });
    const header = res.headers.get('content-security-policy');
    if (!header) {
      console.error(`csp-required: ${url} returned HTTP ${res.status} with NO Content-Security-Policy header.`);
      process.exit(1);
    }
    /* Live mode reads the response header, which is the merged result rather
       than the rule. That is the stronger reading of the two: it is what the
       browser actually received. */
    return {
      policy: header,
      source: `${url} (live response header)`,
      cacheControl: [res.headers.get('cache-control')].filter(Boolean),
    };
  }

  const dist = distArg || process.env.CSP_DIST || path.join(__dirname, '..', 'dist');
  const headersFile = path.join(dist, '_headers');
  if (!fs.existsSync(headersFile)) {
    console.error(`csp-required: no _headers in ${dist} — run copy-cf-config.js first.`);
    process.exit(1);
  }
  const text = fs.readFileSync(headersFile, 'utf8');
  const match = text.match(/^\s*Content-Security-Policy:\s*(.+)$/m);
  if (!match) {
    console.error(`csp-required: ${headersFile} contains no Content-Security-Policy line.`);
    process.exit(1);
  }
  const cacheControl = catchAllCacheControl(text);
  if (cacheControl === null) {
    console.error(`csp-required: ${headersFile} has no \`/*\` catch-all rule at all.`);
    console.error('  This is a parse failure, not a policy failure. Refusing to report on it.');
    process.exit(1);
  }
  return { policy: match[1].trim(), source: path.relative(process.cwd(), headersFile), cacheControl };
}

const { policy, source, cacheControl } = await readPolicy();

/** directive -> source list, from the policy string and nothing else. */
const declared = {};
for (const part of policy.split(';')) {
  const [name, ...sources] = part.trim().split(/\s+/).filter(Boolean);
  if (name) declared[name.toLowerCase()] = sources;
}

/*
 * CONTROL THE CONTROL. A policy string this gate failed to parse would yield an
 * empty table, every requirement would be reported missing, and the failure
 * would look like a real regression. The inverse matters more: a parse that
 * silently produced garbage while still finding the origins would pass. Both
 * are refused here, before a single assertion runs.
 */
if (Object.keys(declared).length < 5 || !declared['script-src'] || !declared['default-src']) {
  console.error(`csp-required: parsed only ${Object.keys(declared).length} directive(s) from ${source}.`);
  console.error('  This is a parse failure, not a policy failure. Refusing to report on it.');
  process.exit(1);
}
if (REQUIRED.length === 0) {
  console.error('csp-required: the REQUIRED list is empty, so this gate asserts nothing. That is a defect in the gate.');
  process.exit(1);
}

/* [R28-WEB-4A] See catchAllCacheControl above for why a caching directive is a
   CSP requirement here. Two ways this can be wrong, and both are checked: the
   directive missing, and MORE THAN ONE Cache-Control on the catch-all, because
   Cloudflare Pages concatenates a header rather than overriding it and which
   value an edge then honours is undefined. */
const transform = [];
if (cacheControl.length === 0) {
  transform.push('the /* catch-all sets no Cache-Control at all, so Cloudflare Pages serves its own default and that default has no no-transform in it');
} else if (cacheControl.length > 1) {
  transform.push(`the /* catch-all sets ${cacheControl.length} Cache-Control lines (${cacheControl.join(' | ')}); Pages concatenates them and which one an edge honours is undefined`);
} else if (!/(^|[\s,])no-transform($|[\s,])/i.test(cacheControl[0])) {
  transform.push(`the /* catch-all Cache-Control is "${cacheControl[0]}" and carries no no-transform`);
}

/** Resolves the directive the browser would actually consult. */
function effective(directive) {
  const chain = [directive, ...(FALLBACK[directive] || [])];
  for (const name of chain) {
    if (declared[name]) return { name, sources: declared[name] };
  }
  return { name: null, sources: null };
}

/**
 * True only for a NAMED host that covers `origin`. A blanket source is
 * deliberately not enough, for the reason argued in the header comment.
 */
function names(sources, origin) {
  return sources.find((src) => {
    if (BLANKET.includes(src) || src.startsWith("'")) return false;
    if (src === origin) return true;
    if (src.includes('*')) {
      const re = new RegExp('^' + src.replace(/[.]/g, '\\.').replace(/\*/g, '[^.]+') + '$');
      return re.test(origin);
    }
    return false;
  });
}

console.log(`csp-required: reading the shipped policy from ${source}`);
console.log(`csp-required: ${Object.keys(declared).length} directive(s) parsed, ${REQUIRED.length} requirement(s) to check\n`);

const failures = [];

for (const req of REQUIRED) {
  const { name, sources } = effective(req.directive);
  if (!name) {
    failures.push({ ...req, detail: `no directive governs ${req.directive} and it has no fallback, so nothing permits the origin` });
    continue;
  }
  const via = name === req.directive ? name : `${req.directive} -> ${name}`;
  const hit = names(sources, req.origin);
  if (hit) {
    console.log(`  OK   ${req.origin}`);
    console.log(`         permitted by ${via}, matched by ${hit}`);
  } else {
    const blanket = sources.filter((s) => BLANKET.includes(s));
    failures.push({
      ...req,
      detail:
        `${via} does not name it` +
        (blanket.length ? `. It carries ${blanket.join(' ')}, which is NOT accepted here: a blanket source must not buy a pass for a named requirement` : ''),
    });
  }
}

/* Tightness, asserted rather than trusted. The fix for CROWAGENT-WEB-N adds two
   named hosts; this is what stops a future fix from reaching for `*` instead. */
const weakened = [];
for (const directive of NO_BLANKET) {
  const sources = declared[directive];
  if (!sources) continue;
  const found = sources.filter((s) => BLANKET.includes(s));
  if (found.length) weakened.push(`${directive} carries ${found.join(' ')}`);
}

if (weakened.length) {
  console.error(`\ncsp-required: ${weakened.length} directive(s) WEAKENED by a blanket source\n`);
  weakened.forEach((w) => console.error(`  ${w}`));
  console.error('\n  A wildcard or an unsafe- keyword in these directives undoes the policy rather');
  console.error('  than extends it. If an origin is genuinely needed, name it.\n');
}

if (transform.length) {
  console.error('\ncsp-required: the JavaScript Detections guard is OFF\n');
  transform.forEach((t) => console.error(`  ${t}`));
  console.error('\n  Cloudflare injects its JS Detections bootstrap into the HTML at the edge unless');
  console.error('  the origin response carries `no-transform`. That script is INLINE and its');
  console.error('  __CF$cv$params carries the request\'s own cf-ray, so its sha256 differs on every');
  console.error('  response and NO hash allowlist can ever cover it. Without no-transform this');
  console.error('  policy is in permanent enforce-mode violation on every HTML page.');
  console.error('\n  Fix it by appending no-transform to the /* rule\'s existing Cache-Control value,');
  console.error('  never by adding a second Cache-Control line and never by weakening script-src.\n');
}

if (failures.length) {
  console.error(`\ncsp-required: ${failures.length} required origin(s) NOT permitted by the policy this build ships\n`);
  for (const f of failures) {
    console.error(`  ${f.origin}  (${f.directive})`);
    console.error(`      ${f.detail}`);
    console.error(`      why it is required: ${f.reason}`);
  }
  console.error('\n  Every one of these fails SILENTLY in production. A blocked script does not');
  console.error('  render an error, does not return a non-2xx, and does not appear in any');
  console.error('  build output. The only symptom is a capability that quietly stops working,');
  console.error('  which is how CROWAGENT-WEB-N ran for 74 days.\n');
}

/*
 * `process.exitCode` rather than `process.exit()`, and the difference is not
 * cosmetic. MEASURED on Windows: in `--url` mode the undici socket from the
 * live fetch is still open when the process is torn down, and `process.exit(1)`
 * trips `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` in libuv, which
 * replaces the intended exit 1 with 127. A gate that reports a crash code
 * instead of a failure code still blocks, but it tells the reader the gate
 * broke rather than the policy did. Setting the code and letting the event loop
 * drain reports 1 in both modes.
 */
if (failures.length || weakened.length || transform.length) {
  process.exitCode = 1;
} else {
  console.log(`\n  all ${REQUIRED.length} required origins are named by the policy this build ships, and no directive was weakened to get there`);
  console.log(`  the /* catch-all carries no-transform, so Cloudflare injects no unhashable inline script into the HTML`);
}
