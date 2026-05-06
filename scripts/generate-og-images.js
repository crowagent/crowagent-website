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
const PRODUCT_ACCENT = Object.freeze({
  core:      { color: "#00D4E8", label: "CrowAgent Core" },
  crowmark:  { color: "#A78BFA", label: "CrowMark" },
  csrd:      { color: "#5BC8FF", label: "CSRD Checker" },
  crowcyber: { color: "#0CC9A8", label: "CrowCyber" },
  crowcash:  { color: "#0CC9A8", label: "CrowCash" },
  crowesg:   { color: "#F59E0B", label: "CrowESG" },
  blog:      { color: "#0CC9A8", label: "Blog" },
  changelog: { color: "#0CC9A8", label: "Changelog" },
});

const DEFAULT_PRODUCT = { color: BRAND.teal, label: "CrowAgent" };

// ---------- explicit static page list ----------

const STATIC_PAGES = [
  { slug: "index",          title: "CrowAgent",           subtitle: "Sustainability Intelligence — MEES, PPN 002, CSRD compliance for UK organisations" },
  { slug: "pricing",        title: "Transparent pricing",  subtitle: "CrowAgent Core from £149/mo - CrowMark from £99/mo - CSRD Checker free" },
  { slug: "about",          title: "About CrowAgent",     subtitle: "Compliance software built for UK landlords, suppliers and sustainability teams" },
  { slug: "contact",        title: "Contact us",          subtitle: "Get in touch with the CrowAgent team" },
  { slug: "demo",           title: "Book a demo",         subtitle: "See CrowAgent in action - 30-minute live walkthrough" },
  { slug: "faq",            title: "FAQ",                  subtitle: "Frequently asked questions about CrowAgent products" },
  { slug: "csrd",           title: "CSRD Checker",        subtitle: "Free Omnibus I applicability tool",                                                              product: "csrd" },
  { slug: "crowmark",       title: "CrowMark",             subtitle: "PPN 002 social value scoring platform",                                                          product: "crowmark" },
  { slug: "crowagent-core", title: "CrowAgent Core",      subtitle: "MEES compliance intelligence for UK commercial landlords",                                       product: "core" },
  { slug: "crowcyber",      title: "CrowCyber",            subtitle: "Cyber Essentials co-pilot for UK SMEs - from £99/mo",                                            product: "crowcyber" },
  { slug: "crowcash",       title: "CrowCash",             subtitle: "AI credit control and accounts receivable - from £79/mo",                                       product: "crowcash" },
  { slug: "crowesg",        title: "CrowESG",              subtitle: "Multi-framework ESG reporting - GRI, TCFD, CSRD, ISSB, UK SDR (waitlist)",                       product: "crowesg" },
  { slug: "roadmap",        title: "Roadmap",              subtitle: "Live tools and upcoming launches" },
  { slug: "resources",      title: "Resources",            subtitle: "Guides and analysis for UK compliance teams" },
  { slug: "partners",       title: "Partners",             subtitle: "Channel partner programme for consultants and advisors" },
  { slug: "security",       title: "Security",             subtitle: "AES-256 encryption - UK data residency - GDPR" },
  { slug: "privacy",        title: "Privacy Policy",       subtitle: "How we protect your personal data" },
  { slug: "terms",          title: "Terms of Service",     subtitle: "Platform terms and conditions" },
  { slug: "cookies",        title: "Cookie Policy",        subtitle: "How CrowAgent uses cookies" },
  { slug: "blog",           title: "Blog",                  subtitle: "Regulatory intelligence and compliance guides",                                                  product: "blog" },
];

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

function clip(input, max, fallback = "") {
  const s = String(input ?? fallback).trim();
  if (!s) return fallback;
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
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
function inferProduct(slug) {
  const s = slug.toLowerCase();
  if (s.includes("crowmark") || s.includes("ppn") || s.includes("social-value") || s.includes("toms")) return "crowmark";
  if (s.includes("csrd") || s.includes("omnibus")) return "csrd";
  if (s.includes("crowcyber") || s.includes("cyber-essentials")) return "crowcyber";
  if (s.includes("crowcash") || s.includes("late-payment") || s.includes("credit-control")) return "crowcash";
  if (s.includes("crowesg")) return "crowesg";
  if (s.includes("mees") || s.includes("epc") || s.includes("retrofit") || s.includes("brown-discount")) return "core";
  if (s.includes("changelog")) return "changelog";
  return "blog";
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
    out.push({ slug, title, subtitle, product: inferProduct(entry) });
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
    out.push({ slug, title, subtitle, product: inferProduct(entry) });
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
    out.push({ slug, title, subtitle, product: inferProduct(entry) });
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
    product: "blog",
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
        h(
          "div",
          {
            style: {
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: BRAND.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 800,
              color: BRAND.bg,
              fontFamily: "Inter",
            },
          },
          "C",
        ),
        h(
          "div",
          { style: { fontSize: 28, fontWeight: 700, letterSpacing: -0.5, color: BRAND.cloud } },
          "CrowAgent",
        ),
      ),
      h(
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
        "Sustainability Intelligence",
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

  // Build the full page list.
  const pages = [
    ...STATIC_PAGES,
    ...discoverBlogPages(repoRoot),
    ...discoverGlossaryPages(repoRoot),
    ...discoverIntelPages(repoRoot),
    ...discoverProductsPage(repoRoot),
    ...discoverChangelogPages(repoRoot),
  ].map((p) => ({
    slug: p.slug,
    title: clip(p.title, 90, "CrowAgent"),
    subtitle: clip(p.subtitle, 140, ""),
    product: p.product ?? inferProduct(p.slug),
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
