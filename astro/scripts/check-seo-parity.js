/**
 * check-seo-parity.js — the Astro page must not lose the legacy page's SEO.
 *
 * WHAT THIS CLOSES. specs/MODERNISATION-ARCHITECTURE.md section 9 requires
 * "zero regressions against the baseline in: rendered content, URLs,
 * METADATA, STRUCTURED DATA, redirects, accessibility, Core Web Vitals".
 * Every one of those is gated by something except metadata and structured
 * data, which nothing has ever compared. A rebuild that quietly drops a
 * canonical, changes a title, or loses an FAQPage block passes all 249
 * existing checks and costs rankings months later, silently.
 *
 * NOT A DIFF OF WORDS. Titles and descriptions are ALLOWED to change — the
 * rebuild rewrote copy deliberately. What is not allowed is a field that
 * existed and now does not, or a structured-data type that was published and
 * has vanished. So this reports:
 *
 *   MISSING   the legacy page had it, the Astro page does not   -> failure
 *   CHANGED   both have it, values differ                        -> reported
 *   ADDED     only the Astro page has it                         -> reported
 *
 * Only MISSING fails. The other two are for a human to read.
 *
 * Legacy pages are read from the repo root build (`dist/`), Astro from
 * `astro/dist/`, so both are what actually ships rather than what a dev server
 * renders.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASTRO = path.join(__dirname, '..', 'dist');
const LEGACY = path.join(__dirname, '..', '..', 'dist');

/** Astro route -> the legacy file that served the same URL. */
function legacyCandidates(route) {
  const clean = route.replace(/^\/|\/$/g, '');
  if (!clean) return ['index.html'];
  return [`${clean}.html`, `${clean}/index.html`];
}

function routes(dir, base = '', out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) routes(path.join(dir, e.name), `${base}/${e.name}`, out);
    else if (e.name === 'index.html') out.push(base === '' ? '/' : `${base}/`);
  }
  return out;
}

const pick = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};

function meta(html) {
  const ld = [];
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const parsed = JSON.parse(m[1]);
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        if (node && node['@type']) ld.push(node['@type']);
        if (node && node['@graph']) for (const g of node['@graph']) if (g['@type']) ld.push(g['@type']);
      }
    } catch {
      ld.push('UNPARSEABLE');
    }
  }
  return {
    title: pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i),
    canonical: pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i),
    ogTitle: pick(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i),
    ogImage: pick(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i),
    lang: pick(html, /<html[^>]+lang=["']([^"']*)["']/i),
    robots: pick(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i),
    schema: [...new Set(ld)].sort(),
  };
}

if (!fs.existsSync(LEGACY)) {
  console.log('seo-parity: no legacy dist/ to compare against — run the root build first. Skipped.');
  process.exit(0);
}

const FIELDS = ['title', 'description', 'canonical', 'ogTitle', 'ogImage', 'lang'];
const missing = [];
const changed = [];
let compared = 0;
let unmatched = 0;

for (const route of routes(ASTRO).sort()) {
  const aFile = path.join(ASTRO, route === '/' ? 'index.html' : route.replace(/^\//, '') + 'index.html');
  if (!fs.existsSync(aFile)) continue;

  const lFile = legacyCandidates(route)
    .map((c) => path.join(LEGACY, c))
    .find((f) => fs.existsSync(f));
  if (!lFile) {
    unmatched++;
    continue; // new page with no legacy equivalent — nothing to regress
  }

  compared++;
  const a = meta(fs.readFileSync(aFile, 'utf8'));
  const l = meta(fs.readFileSync(lFile, 'utf8'));

  for (const f of FIELDS) {
    if (l[f] && !a[f]) missing.push(`${route}  ${f} was present on the legacy page and is gone`);
    else if (l[f] && a[f] && l[f] !== a[f]) changed.push({ route, f, from: l[f], to: a[f] });
  }

  for (const type of l.schema) {
    if (type === 'UNPARSEABLE') continue;
    if (a.schema.includes(type)) continue;
    /*
     * A SUBTYPE SATISFIES ITS PARENT, and only in that direction. schema.org
     * defines BlogPosting as a subtype of Article, and Google's Article rich
     * result accepts Article, NewsArticle and BlogPosting interchangeably, so
     * a page that published Article and now publishes BlogPosting has become
     * MORE specific, not less. Flagging that as a loss would train the reader
     * to ignore this check, which is how a real loss gets through.
     *
     * Deliberately a short, explicit list rather than a schema.org hierarchy
     * lookup: every entry here is a judgement someone has to defend, and a
     * general rule would quietly excuse substitutions nobody reviewed.
     */
    const SATISFIED_BY = {
      Article: ['BlogPosting', 'NewsArticle', 'TechArticle'],
      WebPage: ['CollectionPage', 'AboutPage', 'ContactPage', 'FAQPage'],
    };
    const accepted = SATISFIED_BY[type] || [];
    if (accepted.some((t) => a.schema.includes(t))) {
      changed.push({ route, f: `${type} → ${accepted.find((t) => a.schema.includes(t))}`, from: type, to: 'subtype' });
      continue;
    }
    missing.push(`${route}  structured data "${type}" was published and is gone`);
  }
}

console.log(`seo-parity: ${compared} route(s) compared against the legacy build, ${unmatched} new route(s) skipped\n`);

if (changed.length) {
  console.log(`  ${changed.length} field(s) changed value (allowed — the rebuild rewrote copy):`);
  const byRoute = {};
  for (const c of changed) (byRoute[c.route] ??= []).push(c.f);
  for (const [r, fields] of Object.entries(byRoute)) console.log(`    ${r.padEnd(42)} ${fields.join(', ')}`);
  console.log('');
}

if (missing.length) {
  console.error(`seo-parity: ${missing.length} FIELD(S) LOST\n`);
  missing.forEach((m) => console.error(`  ${m}`));
  console.error('');
  process.exit(1);
}

console.log('  nothing lost: every title, description, canonical, og tag, lang and');
console.log('  structured-data type on a legacy page is still present on its Astro replacement.');
