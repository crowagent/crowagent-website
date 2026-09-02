#!/usr/bin/env node
/**
 * generate-og-images.js — MP1 §8 D3
 *
 * Build-time generator for per-page OG images on the static crowagent.ai
 * marketing site. Renders branded 1200x630 PNGs into Assets/og/{slug}.png
 * which are then referenced by each HTML page's <meta property="og:image">.
 *
 * The crowagent.ai site is a STATIC HTML site deployed via Cloudflare Pages.
 * It has no Next.js runtime and no Workers compute on every request, so the
 * canonical solution is build-time generation. PNGs ship as immutable static
 * assets through the CDN at zero per-request cost (Rule 0 cost discipline).
 *
 * Pipeline:
 *   JSX (React.createElement) → satori (SVG) → @resvg/resvg-js (PNG) → fs.write
 *
 * Brand tokens are inlined as hex (Satori does not resolve CSS variables);
 * canonical values come from crowagent-brand-tokens.css §:root and CLAUDE.md
 * §10 ("Brand & Design System"). If you change one, change both.
 *
 * Slug discovery: EVERY BUILT PAGE IN `astro/dist`.
 *   One card per built route. The route path becomes the slug, the page's own
 *   <title> drives the headline and its <meta name="description"> the subtitle.
 *   There is no hand-maintained page list, so a new route cannot be forgotten
 *   and a deleted route cannot keep rendering.
 *
 *   THE BUILD IS A PRECONDITION. `astro/dist` is gitignored, absent from a clean
 *   checkout, and `astro build` wipes it, so run the build first:
 *     cd astro && npm run build:deploy
 *   This script fails loudly when the directory is missing or empty. It never
 *   renders a card from nothing and never quietly emits a shorter list.
 *
 * Second output: ARTICLE HERO artwork.
 *   The same satori pipeline also renders the in-page hero image for blog posts
 *   that have no honest photograph available, into Assets/blog-photos/{slug}.{jpg,webp}
 *   plus the 400/600/800/1200w webp ladder the blog index srcset expects. See
 *   ARTICLE_HEROES below for why this exists and why the artwork carries no text.
 *
 * Usage (build `astro/dist` first, see the note above):
 *   node scripts/generate-og-images.js                    Render all images
 *   node scripts/generate-og-images.js --slug=pricing     Render single slug
 *   node scripts/generate-og-images.js --check            Dry-run, list output
 *   node scripts/generate-og-images.js --force            Re-render even if up to date
 *   node scripts/generate-og-images.js --heroes-only      Article hero artwork only
 *
 * Exit codes:
 *   0  success (or check completed)
 *   1  missing dependency (run `npm install` first)
 *   2  filesystem error, missing build, or a failed page-set assertion
 *   3  render error
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

// ---------- brand tokens (mirrors crowagent-brand-tokens.css) ----------

const BRAND = Object.freeze({
  bg: "#040E1A",     // --bg / --ca-bg-page
  surf: "#0A1F3A",    // --surf / --ca-bg-card
  surf2: "#0D2847",   // --surf2
  teal: "#0CC9A8",    // --teal / --ca-teal
  cloud: "#E8F0FA",   // --cloud / --ca-text-primary
  steel: "#B8CCE0",   // --steel
  mist: "#8A9DB8",    // --mist / --ca-text-secondary
  border: "rgba(12, 201, 168, 0.20)",
});

// CLAUDE.md §10 product accents.
//
// Only badges for things the site actually sells. The CSRD Checker, CrowCyber,
// CrowCash and CrowESG accents were removed 2026-07-30: none has a page, and the
// only tool left under tools/ is the PPN 002 calculator. Leaving them in place
// meant any future slug containing "csrd", "cyber-essentials", "late-payment" or
// "crowesg" would have silently badged its card with a product a visitor cannot
// buy — the same failure mode that put "CrowCyber from £99/mo" on a live card.
const PRODUCT_ACCENT = Object.freeze({
  crowmark:  { color: "#A78BFA", label: "CrowMark" },
  blog:      { color: "#0CC9A8", label: "Blog" },
  changelog: { color: "#0CC9A8", label: "Changelog" },
});

const DEFAULT_PRODUCT = { color: BRAND.teal, label: "CrowAgent" };

// Four ascending bars of the canonical mark, scaled from the 64px viewBox to 56px.
const MARK_BARS = Object.freeze([
  { height: 12.50, from: "#60a5fa", to: "#2563eb" },
  { height: 17.85, from: "#60a5fa", to: "#2563eb" },
  { height: 23.21, from: "#22c55e", to: "#3b82f6" },
  { height: 29.75, from: "#22c55e", to: "#3b82f6" },
]);

// ---------- the page set: the BUILT Astro site ----------

// THE SOURCE IS `astro/dist`, NOT THE LEGACY ROOT HTML. Changed 2026-09-01.
//
// This generator used to mine <title> and <meta description> out of the frozen
// root pages (index.html, pricing.html, crowmark.html and the rest) plus a
// hand-written list of which ones to read. Those pages stopped being served on
// 2026-08-05, when the Cloudflare Pages deploy source moved to `astro/dist`, and
// they have not been edited since. The CARDS did not stop shipping:
// astro/scripts/copy-assets.js copies every referenced `/Assets/og/*.png` into
// the build, so the live site kept serving cards whose words came from a page
// nobody can visit. Anyone sharing a link in Slack or on LinkedIn saw the frozen
// copy.
//
// Measured 2026-09-01 against the built pages, before this change:
//   roadmap.png     headline read "Roadmap". The page now ships
//                   "CrowMark roadmap | Shipped, in flight and next"
//   glossary-index  subtitle named "PPN 002". The page now names PPN 026 and
//                   PPN 017, and PPN 002 is retired vocabulary across the site
//   crowmark.png    subtitle described daily notice tracking. The page now leads
//                   on drafting cited answers and evidencing delivery. This is
//                   the most-referenced card on the site: 9 built pages use it.
// A copy of the copy always drifts. Reading the artefact that ships cannot.
//
// THE BUILD IS A PRECONDITION. `astro/dist` is gitignored and `astro build`
// wipes it, so ordering matters and absence is a hard error, never a skip.
const DIST_RELATIVE = path.join("astro", "dist");
// Written into every message, so a failure reads the same on Windows and Linux.
const DIST_LABEL = "astro/dist";

// Built routes that get no card, with the reason. 404 is the only one: it has a
// real <title>, so it would render happily, but a social card for "Page not
// found" is a card for a URL nobody shares on purpose.
const EXCLUDED_ROUTES = Object.freeze(["404.html"]);

// A slug is a PUBLIC filename: once a page references `/Assets/og/<slug>.png` it
// cannot be renamed without breaking that page. Derivation joins the route
// segments with "-", so `glossary/toms-framework/index.html` becomes
// `glossary-toms-framework`. This table names the single route where that rule
// disagrees with what already ships: astro/src/pages/glossary/index.astro and
// astro/src/content/glossary/ppn-026.md both point at
// /Assets/og/glossary-index.png, so the glossary index keeps that name.
const SLUG_OVERRIDES = Object.freeze({ glossary: "glossary-index" });

// Every built .html under a directory, returned as forward-slash paths relative
// to that directory so the slug derivation is identical on Windows and Linux.
function listBuiltPages(dist) {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.html$/i.test(entry.name)) {
        out.push(path.relative(dist, full).split(path.sep).join("/"));
      }
    }
  };
  walk(dist);
  return out.sort();
}

// "index.html" -> "index", "pricing/index.html" -> "pricing",
// "glossary/toms-framework/index.html" -> "glossary-toms-framework".
function routeToSlug(route) {
  const parts = route.split("/");
  const stem = parts.pop().replace(/\.html$/i, "");
  const segments = stem === "index" ? parts : [...parts, stem];
  const derived = segments.length === 0 ? "index" : segments.join("-");
  return SLUG_OVERRIDES[derived] ?? derived;
}

// Read the built site. Every failure here is loud, because the failure mode this
// replaced was silence: a generator that finds nothing and reports success.
function loadBuiltPages(repoRoot) {
  const dist = path.join(repoRoot, DIST_RELATIVE);
  if (!fs.existsSync(dist)) {
    throw new Error(
      `${DIST_LABEL} does not exist, so there are no shipping pages to read. ` +
        "It is gitignored and absent from a clean checkout, and `astro build` wipes it. " +
        "Build it first:  cd astro && npm run build:deploy",
    );
  }
  const routes = listBuiltPages(dist).filter((r) => !EXCLUDED_ROUTES.includes(r));
  if (routes.length === 0) {
    throw new Error(
      `${DIST_LABEL} exists but contains no .html files. A half-written or wiped build ` +
        "renders nothing while looking like a success. Rebuild:  cd astro && npm run build:deploy",
    );
  }

  const pages = [];
  const claimedBy = new Map();
  for (const route of routes) {
    const slug = routeToSlug(route);
    // Two routes collapsing onto one slug would silently drop a card, which is
    // the exact shrink this file is meant to make impossible.
    if (claimedBy.has(slug)) {
      throw new Error(
        `Two built routes derive the same slug "${slug}": ${claimedBy.get(slug)} and ${route}. ` +
          "One card would overwrite the other. Add a SLUG_OVERRIDES entry.",
      );
    }
    claimedBy.set(slug, route);

    const html = fs.readFileSync(path.join(dist, route), "utf8");
    const full = extractTitle(html);
    if (!full) {
      throw new Error(
        `Built page ${route} has no <title>, so its card would read the bare word "CrowAgent". ` +
          "Give the page a title in astro/src rather than a fallback here.",
      );
    }
    // Built titles follow "Subject | Description | CrowAgent". extractTitle drops
    // the trailing brand segment. The card puts the subject in the headline and
    // the meta description in the subtitle, so take the leading segment of what
    // is left. Verified against all 46 built titles 2026-09-01, headline by
    // headline, not asserted from the shape of the convention.
    const headline = full.split("|")[0].trim() || full;
    pages.push({
      slug,
      route,
      title: headline,
      subtitle: extractMetaDescription(html) ?? "",
      // A post is a post: "blog" is the right default under blog/ when the topic
      // matches nothing. Everywhere else an unmatched page gets the plain
      // CrowAgent badge rather than being mislabelled.
      product: inferProduct(slug, route.startsWith("blog/") ? "blog" : null),
    });
  }

  // The count assertion. A generator that emits fewer cards than there are pages
  // is the failure this project keeps hitting, and it never announces itself.
  if (pages.length !== routes.length) {
    throw new Error(
      `Built ${routes.length} route(s) but produced ${pages.length} page entr(ies). ` +
        "Something was dropped between discovery and the page list.",
    );
  }
  return pages;
}

// Every `/Assets/og/<slug>.png` the BUILT site actually asks for. The generated
// set must cover this exactly: a page referencing a card nothing renders ships a
// broken image on every social share, and no gate outside this one can see it.
function referencedCardSlugs(repoRoot) {
  const dist = path.join(repoRoot, DIST_RELATIVE);
  const wanted = new Map();
  for (const route of listBuiltPages(dist)) {
    const html = fs.readFileSync(path.join(dist, route), "utf8");
    for (const ref of html.match(/\/Assets\/og\/[A-Za-z0-9._%-]+\.png/g) ?? []) {
      const slug = path.basename(ref).replace(/\.png$/i, "");
      if (!wanted.has(slug)) wanted.set(slug, route);
    }
  }
  return wanted;
}

// ---------- helpers ----------

function structuredLog(level, message, context = {}) {
  const line = JSON.stringify({
    level,
    service: "generate-og-images",
    timestamp: new Date().toISOString(),
    message,
    ...context,
  });
  if (level === "error" || level === "warn") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

// Truncate for the card without cutting mid-word.
//
// The old version sliced at an exact character count, which put "every plan has a
// 14-day t…" on the live pricing card — a broken-looking fragment on an image whose
// whole job is to look considered. Prefer ending on a sentence, fall back to a word
// boundary, and only ever hard-cut a single word longer than the whole budget.
function clip(input, max, fallback = "") {
  const s = String(input ?? fallback).trim();
  if (!s) return fallback;
  if (s.length <= max) return s;

  const window = s.slice(0, max);

  // A complete sentence reads as deliberate rather than truncated, so take one if
  // it uses at least half the budget. Below that we'd be throwing away too much.
  const sentence = window.search(/\.(?=[^.]*$)/) >= 0 ? window.lastIndexOf(".") : -1;
  if (sentence >= Math.floor(max * 0.5)) return s.slice(0, sentence + 1);

  // Otherwise cut at the last word boundary and signal the truncation. Drop a
  // dangling connective too: "billing, MFA and…" reads as a mistake where
  // "billing, MFA…" reads as an excerpt.
  const space = window.lastIndexOf(" ");
  if (space > 0) {
    return s
      .slice(0, space)
      .replace(/\s+(?:and|or|but|with|for|from|to|of|in|on|at|by|the|a|an)$/i, "")
      .replace(/[\s,;:—-]+$/, "") + "…";
  }

  return window.slice(0, max - 1) + "…";
}

// HTML entity decode for the small set we care about (titles + descriptions).
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// Extract <title>...</title> from raw HTML. Returns null if not present.
function extractTitle(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!m) return null;
  // Strip the trailing " - CrowAgent" / " | CrowAgent" suffix used across the site.
  return decodeEntities(m[1].trim()).replace(/\s*[-|]\s*CrowAgent.*$/i, "").trim();
}

// Read a <meta> value without caring what order the attributes are written in.
//
// The previous regex required `name="description"` immediately followed by
// `content="…"`. Measured 2026-07-30: ALL EIGHT blog posts write content first
// (`<meta content="…" name="description">`), so extraction failed on every one and
// each card fell back to the same generic subtitle, "Regulatory intelligence and
// compliance guides" — eight posts, eight different topics, one identical line.
//
// Attribute order is not something HTML guarantees, so matching on it was the bug.
// Parse the tag and look at its attributes instead.
function extractMetaContent(html, key) {
  const wanted = key.toLowerCase();
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = {};
    for (const [, k, v] of tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)) {
      attrs[k.toLowerCase()] = v;
    }
    const id = (attrs.name ?? attrs.property ?? "").toLowerCase();
    if (id === wanted && attrs.content) return decodeEntities(attrs.content.trim());
  }
  return null;
}

function extractMetaDescription(html) {
  // Prefer the page's own description; fall back to og:description, which some
  // pages word differently but which is still that page's copy rather than a
  // generic line written here.
  return extractMetaContent(html, "description") ?? extractMetaContent(html, "og:description");
}

// Heuristic: assign a product accent based on the slug.
//
// `fallback` is what to use when nothing matches, and it must be supplied by the
// caller rather than defaulting to "blog". The old unconditional `return "blog"`
// is why every static page that had no explicit product — index, pricing, about,
// contact, faq, roadmap, resources, partners, security, privacy, terms, cookies —
// shipped a card badged "Blog". The homepage social card, the most-shared URL on
// the site, read "Blog" in the top-right corner. Verified 2026-07-30 by reading
// Assets/og/index.png and Assets/og/pricing.png, not by inspecting the config.
//
// `null` resolves to DEFAULT_PRODUCT, the plain CrowAgent badge, which is the
// correct answer for a page that is not about one product.
function inferProduct(slug, fallback = null) {
  const s = slug.toLowerCase();
  if (s.includes("crowmark") || s.includes("ppn") || s.includes("social-value") || s.includes("toms")) return "crowmark";
  if (s.includes("changelog")) return "changelog";
  return fallback;
}

// The five per-tree discovery functions that used to live here are gone, and so
// is the changelog.xml reader. They walked `blog/`, `glossary/`, `intel/`,
// `products/` and `changelog.xml` at the REPOSITORY ROOT, the frozen legacy
// tree, and the routes they knew about no longer match what ships:
// blog/ppn-002-social-value-guide is now blog/ppn-026-social-value-guide,
// glossary/ppn-002 is now glossary/ppn-026, `intel/` and `products/` were never
// built by the Astro site at all, and changelog.xml does not exist in this
// repository and has not since before the file was first read. One walk over the
// built routes replaces all six, and it cannot go stale against the site because
// it IS the site.

// ---------- JSX (as React.createElement) ----------
//
// Satori expects React-elements-or-equivalent. We avoid a JSX transform by
// constructing elements directly via a tiny `h` helper. This keeps the
// generator dependency-free at the language level (no babel/tsx).

function h(type, props, ...children) {
  const flatChildren = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false);
  return {
    type,
    props: {
      ...(props ?? {}),
      children: flatChildren.length === 0 ? undefined : flatChildren.length === 1 ? flatChildren[0] : flatChildren,
    },
  };
}

function buildOgTree({ title, subtitle, product }) {
  const accent = PRODUCT_ACCENT[product] ?? DEFAULT_PRODUCT;
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: BRAND.bg,
        backgroundImage: `radial-gradient(circle at 80% -10%, rgba(12,201,168,0.18), transparent 50%), linear-gradient(180deg, ${BRAND.bg} 0%, ${BRAND.surf} 100%)`,
        padding: "72px 80px",
        fontFamily: "Inter",
        color: BRAND.cloud,
      },
    },
    // Top row: brand mark + product badge
    h(
      "div",
      { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 18 } },
        // Canonical 4-bar mark (mirrors Assets/logo/crowagent-mark.svg, scaled 64 -> 56).
        h(
          "div",
          {
            style: {
              width: 56,
              height: 56,
              borderRadius: 12.25,
              backgroundColor: "#FCFDFF",
              border: "1.3px solid rgba(15,23,42,0.20)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              gap: 2.9,
              padding: "0 9.6px 9.6px 9.6px",
              boxSizing: "border-box",
            },
          },
          ...MARK_BARS.map((bar) =>
            h("div", {
              style: {
                width: 5.25,
                height: bar.height,
                borderRadius: 1.75,
                backgroundImage: `linear-gradient(180deg, ${bar.from} 0%, ${bar.to} 100%)`,
              },
            }),
          ),
        ),
        h(
          "div",
          { style: { fontSize: 28, fontWeight: 700, letterSpacing: -0.5, color: BRAND.cloud } },
          "CrowAgent",
        ),
      ),
      // The badge says which product or section the card belongs to, so it earns
      // its place only when there is one. On a page that is not about a single
      // product it resolved to DEFAULT_PRODUCT and rendered a "CrowAgent" chip
      // sitting inches from the "CrowAgent" wordmark — the same word twice in one
      // corner, carrying no information. Omitted instead.
      accent === DEFAULT_PRODUCT
        ? null
        : h(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 18px",
                borderRadius: 999,
                border: `1px solid ${BRAND.border}`,
                backgroundColor: BRAND.surf2,
                color: accent.color,
                fontSize: 20,
                fontWeight: 600,
              },
            },
            h("div", { style: { width: 10, height: 10, borderRadius: 999, backgroundColor: accent.color } }),
            accent.label,
          ),
    ),
    // Headline block
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 24 } },
      h(
        "div",
        {
          style: {
            fontSize: 76,
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: -1.5,
            color: BRAND.cloud,
            maxWidth: 1040,
          },
        },
        title,
      ),
      subtitle
        ? h(
            "div",
            { style: { fontSize: 30, lineHeight: 1.3, fontWeight: 400, color: BRAND.steel, maxWidth: 1040 } },
            subtitle,
          )
        : null,
    ),
    // Footer row
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${BRAND.border}`,
          paddingTop: 28,
        },
      },
      h(
        "div",
        { style: { fontSize: 22, fontWeight: 500, color: BRAND.mist, letterSpacing: 0.2 } },
        "Qualify. Win. Get paid.",
      ),
      h(
        "div",
        { style: { fontSize: 22, fontWeight: 600, color: BRAND.teal } },
        "crowagent.ai",
      ),
    ),
  );
}

// ---------- article hero artwork ----------
//
// WHY THIS EXISTS. Measured 2026-07-30: the eight posts under blog/ plus blog/index.html
// shared four photographs between them. /Assets/blog-photos/ppn-002-guide.jpg alone
// appeared on nine pages, as three different posts' heroes AND in their related-article
// rails, so a reader moving between two guides saw the same Westminster photo three
// times. /Assets/blog-photos/ (seven distinct photographs, all Pexels-licensed) cannot
// cover eight posts one-to-one.
//
// The wrong fix is to put a photograph on a post it does not depict — a social value
// photo on a frameworks explainer is worse than no photo, because it makes a factual
// claim about the article's subject that the article does not support. So a post with
// no honest photographic match gets generated brand artwork instead. Nothing is
// downloaded and nothing is drawn by hand: it comes out of the satori pipeline this
// file already runs for OG cards.
//
// WHY THE ARTWORK CARRIES NO TEXT — both reasons measured against the live markup, not
// assumed:
//   1. blog/index.html crops every card thumbnail to `aspect-ratio:1600/380` with
//      object-fit:cover, i.e. a horizontal band 35.6% of the image's height through the
//      vertical centre. A headline set anywhere else in the frame is simply gone there.
//   2. The article template prints the post's <h1> immediately above the hero
//      (blog/*.html, "Hero Image bridge" block). Repeating the same words inside the
//      image would be the title twice in one viewport.
// So the artwork is an abstract branded field that survives any crop, in the same
// palette as the four-bar mark.
//
// PER-SLUG, DETERMINISTIC. Geometry is seeded from the slug, so two posts can never be
// handed the same field, and re-running produces byte-identical output (which matters:
// /Assets/* is served immutable and build-dist.js fails on unversioned content drift).
//
// STATUS, MEASURED 2026-09-01 AND NOT ACTED ON HERE: the shipping site no longer
// references either of these two files. Both posts now carry a photograph in
// `astro/dist`. frameworks-and-dps-explained uses office-files-on-shelves and
// find-first-public-sector-contract uses its own ladder, so the generated
// artwork is output nothing reads. The `page` paths below were re-pointed from
// the frozen root HTML to the built routes so this file has no legacy reader
// left, and the artwork keeps rendering. Whether to retire it is an owner call,
// not one taken in a re-pointing change.
const ARTICLE_HEROES = [
  // Frameworks and DPS: an explainer about framework agreements, dynamic purchasing
  // systems and call-off competitions. None of the seven photographs depicts that
  // subject, and every one of them is already the honest match for another post.
  { slug: "frameworks-and-dps-explained", page: "astro/dist/blog/frameworks-and-dps-explained/index.html" },
  // Finding your first public sector contract. This one nearly shipped a photograph.
  // `mfa-mandatory-2026.jpg` is catalogued as "person holding smartphone while using
  // laptop" and passes as tender research at thumbnail size — but opened at full width
  // the laptop screen is unmistakably an IDE full of source code. A guide to searching
  // Find a Tender illustrated by a developer writing software is a wrong-subject photo,
  // so it gets artwork instead and the photograph is retired from the blog.
  { slug: "find-first-public-sector-contract", page: "astro/dist/blog/find-first-public-sector-contract/index.html" },
];

// Palettes, so two generated heroes listed on one page (blog/index.html lists both)
// never read as the same picture.
//
// Assigned by POSITION in ARTICLE_HEROES, not by hashing the slug. The first attempt
// hashed, and both slugs landed on the same palette AND the same mirror flag — two
// cards that differed only in bar silhouette, which at index-thumbnail size is not a
// difference at all. Caught by rendering both and looking at them. A hash gives
// independence, and independence is not what is wanted here: what is wanted is that
// no two heroes in the set collide, which only an assignment over the set can promise.
const HERO_PALETTES = [
  { warm: ["#22C55E", "#3B82F6"], cool: ["#60A5FA", "#2563EB"], glowA: "rgba(12,201,168,0.30)", glowB: "rgba(167,139,250,0.26)" },
  { warm: ["#A78BFA", "#6366F1"], cool: ["#0CC9A8", "#0EA5E9"], glowA: "rgba(167,139,250,0.30)", glowB: "rgba(12,201,168,0.24)" },
];
// palette x mirrored. Beyond this many heroes two would have to share a look, so the
// generator refuses rather than shipping a near-duplicate.
const HERO_VARIANTS = HERO_PALETTES.length * 2;

// 16:9. The article hero container is `.aspect-video` (blog/*.html "Hero Image bridge"),
// so a 3:2 render would be cropped top and bottom in the one place the image is largest.
const HERO_W = 1600;
const HERO_H = 900;
const HERO_WIDTHS = [400, 600, 800, 1200];

// FNV-1a. Small, stable across Node versions, and good enough to decorrelate slugs.
function hashSlug(slug) {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

// Deterministic 0..1 stream seeded from the slug hash (mulberry32).
function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHeroTree({ slug, variant }) {
  // The silhouette still comes from the slug, so the same post always renders the same
  // ridge; only the palette and mirroring come from the set position.
  const seed = hashSlug(slug);
  const rnd = seededRandom(seed);
  const palette = HERO_PALETTES[variant % HERO_PALETTES.length];
  // Ridge and mark swap sides, so two heroes differ in layout as well as hue.
  const mirrored = Math.floor(variant / HERO_PALETTES.length) % 2 === 1;

  // A ridge of vertical bars: the four-bar mark's motif at poster scale. Heights
  // follow a slow wave (so it reads as designed rather than as noise) with a small
  // seeded jitter per bar (so no two slugs share a silhouette).
  //
  // The ridge starts at RIDGE_LEFT rather than at the frame edge, leaving the left
  // third as a clean brand plate. First render put the mark on top of the tallest
  // bars and the two collided; compared both renders before keeping this one.
  const RIDGE_LEFT = 430;
  const BARS = 24;
  const BAR_W = 30;
  const GAP = 17;
  const phase = rnd() * Math.PI * 2;
  const freq = 1.35 + rnd() * 1.1;
  const bars = [];
  for (let i = 0; i < BARS; i += 1) {
    const t = i / (BARS - 1);
    const wave = (Math.sin(phase + t * Math.PI * freq * 2) + 1) / 2; // 0..1
    const jitter = (rnd() - 0.5) * 0.22;
    const norm = Math.min(1, Math.max(0.06, wave * 0.82 + 0.1 + jitter));
    // Two-stop ramp across the ridge, mirroring the mark's own gradient.
    const [from, to] = t > 0.55 ? palette.cool : palette.warm;
    bars.push(
      h("div", {
        style: {
          width: BAR_W,
          height: Math.round(90 + norm * 500),
          borderRadius: 9,
          backgroundImage: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
          opacity: 0.22 + norm * 0.46,
        },
      }),
    );
  }

  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: BRAND.bg,
        backgroundImage:
          `radial-gradient(circle at ${mirrored ? "18%" : "82%"} -12%, ${palette.glowA}, transparent 55%),` +
          `radial-gradient(circle at ${mirrored ? "96%" : "4%"} 112%, ${palette.glowB}, transparent 52%),` +
          `linear-gradient(${mirrored ? 200 : 160}deg, ${BRAND.bg} 0%, ${BRAND.surf} 62%, ${BRAND.surf2} 100%)`,
      },
    },
    // Faint horizontal rules, evenly spaced. They give the field a measured, technical
    // feel and read at every crop because they span the full width at every height.
    ...[0.24, 0.42, 0.6, 0.78].map((y) =>
      h("div", {
        style: {
          position: "absolute",
          left: 0,
          top: Math.round(HERO_H * y),
          width: HERO_W,
          height: 1,
          backgroundColor: "rgba(232,240,250,0.07)",
        },
      }),
    ),
    // The bar ridge.
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: mirrored ? 60 : RIDGE_LEFT,
          bottom: 0,
          width: HERO_W - RIDGE_LEFT - 60,
          height: HERO_H,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: GAP,
        },
      },
      ...bars,
    ),
    // The four-bar mark, vertically centred so it falls inside the blog index's
    // 1600/380 crop band as well as the full-bleed article hero.
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: mirrored ? HERO_W - 192 : 96,
          top: Math.round(HERO_H / 2) - 48,
          width: 96,
          height: 96,
          borderRadius: 21,
          backgroundColor: "#FCFDFF",
          border: "2px solid rgba(15,23,42,0.20)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-start",
          gap: 5,
          padding: "0 16px 16px 16px",
          boxSizing: "border-box",
        },
      },
      ...MARK_BARS.map((bar) =>
        h("div", {
          style: {
            width: 9,
            height: Math.round(bar.height * 1.71),
            borderRadius: 3,
            backgroundImage: `linear-gradient(180deg, ${bar.from} 0%, ${bar.to} 100%)`,
          },
        }),
      ),
    ),
    // Teal keyline under the mark. Sits inside the brand plate, clear of the ridge, and
    // stays inside the index crop band so the left third is never a bare gradient.
    h("div", {
      style: {
        position: "absolute",
        left: mirrored ? HERO_W - 328 : 96,
        top: Math.round(HERO_H / 2) + 82,
        width: 232,
        height: 4,
        borderRadius: 4,
        backgroundImage: `linear-gradient(${mirrored ? 270 : 90}deg, ${BRAND.teal} 0%, rgba(12,201,168,0) 100%)`,
      },
    }),
  );
}

// Render one article hero to the jpg + webp + width ladder the blog markup expects.
// Returns the list of files written.
async function renderArticleHero({ slug, variant }, { satori, Resvg, sharp, fonts, outDir }) {
  const svg = await satori(buildHeroTree({ slug, variant }), { width: HERO_W, height: HERO_H, fonts });
  const png = new Resvg(svg, {
    background: BRAND.bg,
    fitTo: { mode: "width", value: HERO_W },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();

  const written = [];
  // JPEG is the <img src> fallback; every browser that reaches it can decode it.
  const jpgPath = path.join(outDir, `${slug}.jpg`);
  await sharp(png).jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(jpgPath);
  written.push(jpgPath);

  // Flat brand artwork keeps its edges far better than a photograph at the same
  // quality, so the full-size webp is cheap. 76 matches the photo ladder.
  const webpPath = path.join(outDir, `${slug}.webp`);
  await sharp(png).webp({ quality: 88, effort: 6 }).toFile(webpPath);
  written.push(webpPath);

  for (const w of HERO_WIDTHS) {
    const p = path.join(outDir, `${slug}-${w}w.webp`);
    await sharp(png).resize(w).webp({ quality: 82, effort: 6 }).toFile(p);
    written.push(p);
  }
  return written;
}

// ---------- font loading ----------
//
// Satori needs raw font buffers. We pull Inter from Google Fonts at first run
// and cache to .cache/fonts/. The cache is per-developer-machine and is
// gitignored. At CI / Pages-build the same fetch runs once per build.

async function loadInterFonts(repoRoot) {
  const cacheDir = path.join(repoRoot, ".cache", "fonts");
  fs.mkdirSync(cacheDir, { recursive: true });

  // Source: @fontsource/inter on jsdelivr CDN. Satori accepts ttf/otf/woff
  // (NOT woff2). Fontsource serves woff at stable, immutable URLs and survives
  // CDN cache invalidation, so it's a safer build dependency than rsms/inter
  // GitHub raw URLs (which 404 after release retag/move) or Google's gstatic
  // hash-rotated paths.
  const FONTS = [
    {
      file: "Inter-Regular.woff",
      url: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-400-normal.woff",
      weight: 400,
      style: "normal",
    },
    {
      file: "Inter-SemiBold.woff",
      url: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-600-normal.woff",
      weight: 600,
      style: "normal",
    },
    {
      file: "Inter-Bold.woff",
      url: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-700-normal.woff",
      weight: 700,
      style: "normal",
    },
    {
      file: "Inter-ExtraBold.woff",
      url: "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-800-normal.woff",
      weight: 800,
      style: "normal",
    },
  ];

  const out = [];
  for (const f of FONTS) {
    const local = path.join(cacheDir, f.file);
    if (!fs.existsSync(local)) {
      structuredLog("info", "Fetching font", { file: f.file, url: f.url });
      const res = await fetch(f.url);
      if (!res.ok) {
        throw new Error(`Font fetch failed: ${f.url} → ${res.status}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(local, buf);
    }
    out.push({
      name: "Inter",
      data: fs.readFileSync(local),
      weight: f.weight,
      style: f.style,
    });
  }
  return out;
}

// ---------- main ----------

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const checkOnly = argv.includes("--check");
  const heroesOnly = argv.includes("--heroes-only");
  const slugFilter = argv.find((a) => a.startsWith("--slug="))?.slice("--slug=".length);

  const repoRoot = path.resolve(__dirname, "..");
  const outDir = path.join(repoRoot, "Assets", "og");
  fs.mkdirSync(outDir, { recursive: true });
  // Article heroes ship alongside the photographs they stand in for, so the blog
  // markup has one directory to reference.
  const heroDir = path.join(repoRoot, "Assets", "blog-photos");
  fs.mkdirSync(heroDir, { recursive: true });

  // Build the full page list from the built site. Every failure inside is a
  // statement about the ARTEFACT (absent, empty, untitled page, colliding slug),
  // not a crash, so it exits 2 with the message and no stack trace. A stack
  // buries the one line that says what to do.
  let built;
  try {
    built = loadBuiltPages(repoRoot);
  } catch (error) {
    structuredLog("error", "Cannot read the built site", {
      operation: "load-built-pages",
      dist: DIST_LABEL,
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(2);
  }

  const pages = built.map((p) => ({
    slug: p.slug,
    route: p.route,
    // Title budget is 72, not 90, because the HEADLINE is what overflows the card.
    // Measured off the rendered PNGs, not estimated: the headline sets at 76px and
    // wraps at roughly 24 characters per line, the subtitle at 30px and roughly 68.
    // Three headline lines plus two subtitle lines is the tallest layout that keeps
    // the divider and the footer on the card. 90 characters is four headline lines,
    // which pushes the footer off the bottom edge — satori clips rather than grows,
    // so it would have failed silently. 72 caps the headline at three lines.
    //
    // This is not hypothetical — one card was already in the degenerate state. The
    // changelog title "MP1: Marketing surface (tools hub, methodology pages, cookie
    // preferences, changelog)" is 84 characters, so it rendered four headline lines:
    // the headline crowded the brand row above it, the subtitle sat on the divider,
    // and the footer was jammed against the bottom edge with no padding. Compared
    // before and after by reading both PNGs. Nothing was cut off the canvas, but the
    // layout had lost every bit of its breathing room.
    //
    // That 84-character title came from changelog.xml, a source this generator no
    // longer has. The longest headline in the built site is 47 characters
    // ("Facilities Management Bid Software"), measured 2026-09-01 across all 46
    // routes, so nothing currently clips. The budget stays because a title is one
    // copy edit away from needing it.
    //
    // An earlier attempt shortened the SUBTITLE when the headline was long. That
    // was the wrong lever: at 68 characters per line, cutting 140 to 116 dropped
    // words without dropping a line, so it lost information and bought no space.
    title: clip(p.title, 72, "CrowAgent"),
    subtitle: clip(p.subtitle, 140, ""),
    product: p.product,
  }));

  // ── ASSERTION 1: every card the built site asks for is one this run can emit.
  //
  // Negative case, and the reason this is not decoration: five built pages point
  // at /Assets/og/crowmark.png, /Assets/og/glossary-index.png,
  // /Assets/og/glossary-toms-framework.png, /Assets/og/integrations.png and
  // /Assets/og/roadmap.png. Rename a route, or change the slug rule, and one of
  // those cards stops being rendered while the page keeps requesting it. The
  // result is a broken image on every social share of that page, and nothing else
  // in the build looks at it: copy-assets.js only fails on an asset that is
  // MISSING FROM DISK, and a stale PNG from a previous run is still on disk.
  const emitted = new Set(pages.map((p) => p.slug));
  const uncovered = [...referencedCardSlugs(repoRoot)].filter(([slug]) => !emitted.has(slug));
  if (uncovered.length > 0) {
    structuredLog("error", "Built pages reference OG cards this run cannot emit", {
      operation: "assert-referenced-cards-covered",
      uncovered: uncovered.map(([slug, route]) => `${slug}.png (first referenced by ${route})`),
      hint: "Add a SLUG_OVERRIDES entry so the route that owns the card derives that slug, or change the reference in astro/src.",
    });
    process.exit(2);
  }

  // ── ASSERTION 2: the page count is the route count.
  //
  // loadBuiltPages already refuses a duplicate slug and an untitled page, so this
  // is the outer statement of the same contract: what got processed equals what
  // was found. A generator that quietly emits fewer cards than there are pages is
  // the failure this file exists to make impossible, and it never announces
  // itself. The old run printed "Complete" with a total of whatever it happened
  // to find.
  const routeCount = listBuiltPages(path.join(repoRoot, DIST_RELATIVE)).filter(
    (r) => !EXCLUDED_ROUTES.includes(r),
  ).length;
  if (pages.length !== routeCount) {
    structuredLog("error", "Page count does not match the built route count", {
      operation: "assert-page-count",
      pages: pages.length,
      routes: routeCount,
    });
    process.exit(2);
  }

  // Surface cards on disk that no built page produces. This replaces a
  // hand-written RETIRED_SLUGS list, which could only ever name the orphans
  // somebody remembered: `demo`, `csrd`, `crowcyber`, `crowcash`, `crowesg`. The
  // set is derived now, so a route rename orphans a card and says so on the next
  // run. It is a WARNING, not a failure: deleting a PNG is an owner decision,
  // because a URL somebody shared last year still resolves to it today.
  const orphans = fs
    .readdirSync(outDir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".png"))
    .map((e) => e.name.replace(/\.png$/i, ""))
    .filter((slug) => !emitted.has(slug));
  if (orphans.length > 0) {
    structuredLog("warn", "OG cards on disk with no built page behind them", {
      operation: "audit-orphan-cards",
      count: orphans.length,
      slugs: orphans,
      note: "No route renders these. They are not regenerated and, being unreferenced, copy-assets.js does not ship them. Deleting them is an owner decision.",
    });
  }

  const filtered = heroesOnly ? [] : slugFilter ? pages.filter((p) => p.slug === slugFilter) : pages;
  if (slugFilter && !heroesOnly && filtered.length === 0) {
    structuredLog("error", "Slug not found", { slug: slugFilter });
    process.exit(2);
  }

  if (checkOnly) {
    structuredLog("info", "Check mode (no rendering)", {
      pages: filtered.length,
      out_dir: outDir,
    });
    for (const p of filtered) {
      process.stdout.write(`${p.slug}\t${path.join(outDir, `${p.slug}.png`)}\n`);
    }
    for (const hero of ARTICLE_HEROES) {
      process.stdout.write(`${hero.slug}\t${path.join(heroDir, `${hero.slug}.jpg`)}\n`);
    }
    return;
  }

  // Lazy-load satori + resvg only when actually rendering. This keeps `--check`
  // runnable without devDeps installed (useful in CI sanity checks).
  let satori;
  let Resvg;
  let sharp;
  try {
    // satori v0.10+ ships ESM; bridge to CJS via dynamic import.
    satori = (await import("satori")).default;
    ({ Resvg } = require("@resvg/resvg-js"));
    // sharp converts the article-hero PNG to the jpg/webp ladder the blog markup
    // references. Loaded here with the other renderers so a missing devDep is one
    // clear failure rather than a crash halfway through a run.
    sharp = require("sharp");
  } catch (error) {
    structuredLog("error", "Missing render dependencies", {
      error: error instanceof Error ? error.message : String(error),
      hint: "Run: npm install --save-dev satori @resvg/resvg-js sharp",
    });
    process.exit(1);
  }

  let fonts;
  try {
    fonts = await loadInterFonts(repoRoot);
  } catch (error) {
    structuredLog("error", "Font loading failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(3);
  }

  const t0 = performance.now();
  let rendered = 0;
  let skipped = 0;

  for (const page of filtered) {
    const outPath = path.join(outDir, `${page.slug}.png`);

    // Skip if up to date and not forcing. Treat any existing file as fresh
    // (the slug list itself is the cache key — change a slug, get a new file).
    if (!force && fs.existsSync(outPath)) {
      skipped += 1;
      continue;
    }

    try {
      const svg = await satori(buildOgTree(page), {
        width: 1200,
        height: 630,
        fonts,
      });
      const png = new Resvg(svg, {
        background: BRAND.bg,
        fitTo: { mode: "width", value: 1200 },
        font: { loadSystemFonts: false },
      })
        .render()
        .asPng();
      fs.writeFileSync(outPath, png);
      rendered += 1;
      structuredLog("info", "Rendered", { slug: page.slug, bytes: png.length });
    } catch (error) {
      structuredLog("error", "Render failed", {
        slug: page.slug,
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(3);
    }
  }

  // ── ASSERTION 3: every page processed has a card on disk afterwards.
  //
  // `rendered` and `skipped` are counters, and a counter agreeing with itself is
  // not evidence that a file exists. The negative case is a write that threw
  // somewhere the catch above did not reach, or a `skipped` page whose PNG was
  // deleted between the existence check and here. Assert the FILES.
  if (rendered + skipped !== filtered.length) {
    structuredLog("error", "Processed count does not match the page list", {
      operation: "assert-processed-count",
      rendered,
      skipped,
      expected: filtered.length,
    });
    process.exit(3);
  }
  const absent = filtered
    .map((p) => p.slug)
    .filter((slug) => !fs.existsSync(path.join(outDir, `${slug}.png`)));
  if (absent.length > 0) {
    structuredLog("error", "Pages were processed but their cards are not on disk", {
      operation: "assert-cards-written",
      slugs: absent,
    });
    process.exit(3);
  }

  // Article hero artwork. Same skip rule as the OG cards: the slug is the cache key,
  // so an existing file is treated as current unless --force.
  let heroesRendered = 0;
  let heroesSkipped = 0;
  if (ARTICLE_HEROES.length > HERO_VARIANTS) {
    structuredLog("error", "More article heroes than distinct looks", {
      heroes: ARTICLE_HEROES.length,
      variants: HERO_VARIANTS,
      note: "Two posts would ship visually interchangeable artwork. Add a palette to HERO_PALETTES.",
    });
    process.exit(2);
  }
  for (const [variant, hero] of ARTICLE_HEROES.entries()) {
    const probe = path.join(heroDir, `${hero.slug}.jpg`);
    if (!force && fs.existsSync(probe)) {
      heroesSkipped += 1;
      continue;
    }
    // A hero standing in for a photograph must belong to a post that exists. Without
    // this the generator would happily ship artwork for a deleted slug — the exact
    // failure the orphan-card audit above exists to catch on the OG side.
    const pagePath = path.join(repoRoot, hero.page);
    if (!fs.existsSync(pagePath)) {
      structuredLog("error", "Article hero points at a page that does not exist", {
        slug: hero.slug,
        page: hero.page,
      });
      process.exit(2);
    }
    try {
      const files = await renderArticleHero({ ...hero, variant }, { satori, Resvg, sharp, fonts, outDir: heroDir });
      heroesRendered += 1;
      structuredLog("info", "Rendered article hero", {
        slug: hero.slug,
        variant,
        files: files.map((f) => path.basename(f)),
      });
    } catch (error) {
      structuredLog("error", "Article hero render failed", {
        slug: hero.slug,
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(3);
    }
  }

  const ms = Math.round(performance.now() - t0);
  structuredLog("info", "Complete", {
    rendered,
    skipped,
    total: filtered.length,
    heroes_rendered: heroesRendered,
    heroes_skipped: heroesSkipped,
    out_dir: outDir,
    hero_dir: heroDir,
    duration_ms: ms,
  });
}

main().catch((error) => {
  structuredLog("error", "Unhandled failure", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(3);
});
