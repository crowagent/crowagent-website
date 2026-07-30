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
 * Slug discovery:
 *   - Static page list (homepage, pricing, about, etc.) — explicit below.
 *   - Blog posts: every blog/*.html (excluding blog/index.html) is auto-picked;
 *     <title> tag drives the headline, <meta name="description"> drives subtitle.
 *   - Changelog: every <item> in changelog.xml gets one OG image keyed by guid.
 *
 * Usage:
 *   node scripts/generate-og-images.js                    Render all images
 *   node scripts/generate-og-images.js --slug=pricing     Render single slug
 *   node scripts/generate-og-images.js --check            Dry-run, list output
 *   node scripts/generate-og-images.js --force            Re-render even if up to date
 *
 * Exit codes:
 *   0  success (or check completed)
 *   1  missing dependency (run `npm install` first)
 *   2  filesystem error
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

// ---------- explicit static page list ----------

// Each entry names the page it depicts; the title and subtitle are read FROM that
// page at render time, exactly as the blog and glossary discovery below already do.
//
// This used to be a hand-maintained copy table, and it drifted badly. Measured
// 2026-07-30, before this change: `pricing.png` — a card that gets shared publicly
// — read "CrowMark from £99/mo - CSRD Checker free", while pricing.html has sold
// Starter £49 / Pro £149 / Portfolio quoted since R2.6. £99 was not any tier. The
// homepage card advertised "PPN 002, Cyber Essentials and CSRD compliance", a
// portfolio framing dropped when Core was switched off and CrowCyber went Phase 2.
// A duplicate of page copy will always drift; reading the page cannot.
//
// `fallbackTitle` covers only the case where a page has no <title>, which the
// render would otherwise fill with the bare word "CrowAgent".
const STATIC_PAGES = [
  { slug: "index",     page: "index.html",       fallbackTitle: "CrowAgent" },
  { slug: "pricing",   page: "pricing.html" },
  { slug: "about",     page: "about.html" },
  { slug: "contact",   page: "contact.html" },
  { slug: "faq",       page: "faq.html" },
  { slug: "crowmark",  page: "crowmark.html",    product: "crowmark" },
  { slug: "roadmap",   page: "roadmap.html" },
  { slug: "resources", page: "resources.html" },
  { slug: "partners",  page: "partners.html" },
  { slug: "security",  page: "security.html" },
  { slug: "privacy",   page: "privacy.html" },
  { slug: "terms",     page: "terms.html" },
  { slug: "cookies",   page: "cookies.html" },
  { slug: "blog",      page: "blog/index.html",  product: "blog" },
];

// Slugs this generator used to emit for pages that no longer exist: `demo`,
// `csrd`, `crowcyber`, `crowcash`, `crowesg`. Verified 2026-07-30 — none has a
// page, and no HTML on the site references their PNG. They were still being
// rendered every run, so four of them shipped cards quoting prices for products
// that were decommissioned or never launched (CrowCyber "from £99/mo", CrowCash
// "from £79/mo"). Removed from the list rather than regenerated. Deleting the
// stale PNGs themselves is a separate call for the owner, since anyone who shared
// one of those URLs in the past still resolves it today.
const RETIRED_SLUGS = Object.freeze(["demo", "csrd", "crowcyber", "crowcash", "crowesg"]);

// Read a static page's own <title> / meta description so the card cannot drift
// from the page it represents. A missing page is a hard error: silently skipping
// would leave a stale PNG in place and report success.
function loadStaticPages(repoRoot) {
  return STATIC_PAGES.map((entry) => {
    const abs = path.join(repoRoot, entry.page);
    if (!fs.existsSync(abs)) {
      throw new Error(
        `STATIC_PAGES entry "${entry.slug}" points at ${entry.page}, which does not exist. ` +
          `Remove the entry (and consider whether Assets/og/${entry.slug}.png should still ship).`,
      );
    }
    const html = fs.readFileSync(abs, "utf8");
    const full = extractTitle(html) ?? entry.fallbackTitle ?? "CrowAgent";
    // Static page <title>s follow the site convention "Subject | Description"
    // ("CrowMark | Find UK tenders, draft grounded answers, prove delivery"). The
    // card puts the subject in the large headline and the meta description in the
    // subtitle, so take the leading segment. Verified against all 14 static titles
    // 2026-07-30. Deliberately NOT applied to blog or glossary titles, which are
    // free-form headlines that may legitimately contain a pipe.
    const headline = full.split("|")[0].trim() || full;
    return {
      slug: entry.slug,
      title: headline,
      subtitle: extractMetaDescription(html) ?? "",
      product: entry.product ?? null,
    };
  });
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

function extractMetaDescription(html) {
  const m = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(html);
  if (!m) return null;
  return decodeEntities(m[1].trim());
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

// Discover blog posts. Exclude index (already in STATIC_PAGES).
function discoverBlogPages(repoRoot) {
  const dir = path.join(repoRoot, "blog");
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith(".html")) continue;
    if (entry === "index.html") continue; // covered by STATIC_PAGES "blog"
    const slug = `blog-${entry.replace(/\.html$/i, "")}`;
    const html = fs.readFileSync(path.join(dir, entry), "utf8");
    const title = extractTitle(html) ?? "CrowAgent blog";
    const subtitle = extractMetaDescription(html) ?? "Regulatory intelligence and compliance guides";
    // A post is a post: "blog" is the right default when the topic matches nothing.
    out.push({ slug, title, subtitle, product: inferProduct(entry, "blog") });
  }
  return out;
}

// Discover glossary entries. Pattern: glossary/{name}.html → slug glossary-{name}.
// Index is rendered separately as glossary-index.
function discoverGlossaryPages(repoRoot) {
  const dir = path.join(repoRoot, "glossary");
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith(".html")) continue;
    const stem = entry.replace(/\.html$/i, "");
    const slug = stem === "index" ? "glossary-index" : `glossary-${stem}`;
    const html = fs.readFileSync(path.join(dir, entry), "utf8");
    const title = extractTitle(html) ?? "CrowAgent glossary";
    const subtitle = extractMetaDescription(html) ?? "Regulatory term definitions";
    // A glossary entry is not a blog post; unmatched topics get the CrowAgent badge.
    out.push({ slug, title, subtitle, product: inferProduct(entry, null) });
  }
  return out;
}

// Discover intel tracker pages. Pattern: intel/{name}/index.html → slug intel-{name}.
function discoverIntelPages(repoRoot) {
  const dir = path.join(repoRoot, "intel");
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const sub = path.join(dir, entry, "index.html");
    if (!fs.existsSync(sub)) continue;
    const slug = `intel-${entry}`;
    const html = fs.readFileSync(sub, "utf8");
    const title = extractTitle(html) ?? "CrowAgent intel";
    const subtitle = extractMetaDescription(html) ?? "Regulatory intelligence tracker";
    out.push({ slug, title, subtitle, product: inferProduct(entry, null) });
  }
  return out;
}

// Discover products hub page (products/index.html) → slug products.
function discoverProductsPage(repoRoot) {
  const p = path.join(repoRoot, "products", "index.html");
  if (!fs.existsSync(p)) return [];
  const html = fs.readFileSync(p, "utf8");
  return [{
    slug: "products",
    title: extractTitle(html) ?? "CrowAgent Products",
    subtitle: extractMetaDescription(html) ?? "Sustainability compliance products",
    product: null,
  }];
}

// Discover changelog entries. Each <item><guid>...</guid> drives the slug.
function discoverChangelogPages(repoRoot) {
  const xmlPath = path.join(repoRoot, "changelog.xml");
  if (!fs.existsSync(xmlPath)) return [];
  const xml = fs.readFileSync(xmlPath, "utf8");
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRe.exec(xml)) !== null) {
    const inner = match[1];
    const guid = /<guid[^>]*>([^<]+)<\/guid>/i.exec(inner)?.[1]?.trim();
    const title = /<title>([\s\S]*?)<\/title>/i.exec(inner)?.[1]?.trim();
    const description = /<description>([\s\S]*?)<\/description>/i.exec(inner)?.[1]?.trim();
    if (!guid || !title) continue;
    items.push({
      slug: guid,
      title: decodeEntities(title),
      subtitle: description ? decodeEntities(description) : "Product and website updates",
      product: "changelog",
    });
  }
  return items;
}

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
  const slugFilter = argv.find((a) => a.startsWith("--slug="))?.slice("--slug=".length);

  const repoRoot = path.resolve(__dirname, "..");
  const outDir = path.join(repoRoot, "Assets", "og");
  fs.mkdirSync(outDir, { recursive: true });

  // Surface stale cards rather than leaving them to a code comment. These slugs
  // are no longer rendered, so without this the PNGs would just sit in Assets/og
  // and keep shipping, which is how they went unnoticed in the first place.
  const stale = RETIRED_SLUGS.filter((s) => fs.existsSync(path.join(outDir, `${s}.png`)));
  if (stale.length > 0) {
    structuredLog("warn", "Retired OG cards still present on disk", {
      operation: "audit-retired-slugs",
      slugs: stale,
      note: "No page and no HTML reference. They are no longer regenerated; deleting them is an owner decision because previously shared URLs still resolve.",
    });
  }

  // Build the full page list.
  const pages = [
    ...loadStaticPages(repoRoot),
    ...discoverBlogPages(repoRoot),
    ...discoverGlossaryPages(repoRoot),
    ...discoverIntelPages(repoRoot),
    ...discoverProductsPage(repoRoot),
    ...discoverChangelogPages(repoRoot),
  ].map((p) => ({
    slug: p.slug,
    title: clip(p.title, 90, "CrowAgent"),
    subtitle: clip(p.subtitle, 140, ""),
    product: p.product ?? inferProduct(p.slug, null),
  }));

  const filtered = slugFilter ? pages.filter((p) => p.slug === slugFilter) : pages;
  if (slugFilter && filtered.length === 0) {
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
    return;
  }

  // Lazy-load satori + resvg only when actually rendering. This keeps `--check`
  // runnable without devDeps installed (useful in CI sanity checks).
  let satori;
  let Resvg;
  try {
    // satori v0.10+ ships ESM; bridge to CJS via dynamic import.
    satori = (await import("satori")).default;
    ({ Resvg } = require("@resvg/resvg-js"));
  } catch (error) {
    structuredLog("error", "Missing render dependencies", {
      error: error instanceof Error ? error.message : String(error),
      hint: "Run: npm install --save-dev satori @resvg/resvg-js",
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

  const ms = Math.round(performance.now() - t0);
  structuredLog("info", "Complete", {
    rendered,
    skipped,
    total: filtered.length,
    out_dir: outDir,
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
