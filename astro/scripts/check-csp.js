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
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

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
  } else if (f.endsWith('.css')) {
    const css = fs.readFileSync(f, 'utf8');
    for (const m of css.matchAll(/url\(["']?(https?:\/\/[^)"']+)["']?\)/g)) {
      record(/\.woff2?|\.ttf|\.otf/.test(m[1]) ? CONTEXT.font : CONTEXT.img, m[1], f);
    }
    for (const m of css.matchAll(/@import\s+["'](https?:\/\/[^"']+)["']/g)) record(CONTEXT.style, m[1], f);
  }
}

const blocked = [];
for (const [key, refs] of found) {
  const [directive, origin] = key.split(' ');
  if (!allowed(directive, origin)) blocked.push({ directive, origin, refs: [...refs] });
}

console.log(`csp: ${found.size} external origin reference(s) across the build`);
for (const [key, refs] of found) console.log(`  ${key}  (${refs.size} file(s))`);
if (found.size === 0) console.log('  none — the build loads nothing from a third party');

if (blocked.length) {
  console.error(`\ncsp: ${blocked.length} reference(s) BLOCKED by the policy this build ships\n`);
  for (const b of blocked) {
    console.error(`  ${b.origin} is not allowed by ${b.directive}`);
    b.refs.slice(0, 5).forEach((r) => console.error(`      ${r}`));
  }
  console.error('\n  A blocked subresource fails silently in production: no error on the page,');
  console.error('  no non-2xx, and the sitewide check cannot see it because it asks the server');
  console.error('  directly with no policy applied.\n');
  process.exit(1);
}

console.log('\n  every external reference is permitted by the shipped policy');
