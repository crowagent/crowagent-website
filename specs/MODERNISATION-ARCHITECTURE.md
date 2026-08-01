# Modernisation Architecture — crowagent-website

**Status:** in execution. **Baseline:** tag `baseline-transformed-2026-08-01`, deployed to
crowagent.ai 2026-08-01. Every claim below is diffed against that tag, never against `main`.

---

## 1. Why

The site works. It is expensive to change. Measured on the baseline:

| Symptom | Measurement |
|---|---|
| No layout system | 45 pages each carry their own `<head>`. `index.html` and `crowmark.html` heads differ on **427 lines**. |
| Content lives in markup | **13 files** hardcode a price, **8** hardcode the signup URL, **40** repeat the Organization JSON-LD, **44** repeat OG tags. |
| CSS sprawl | **34 stylesheets** (~1.03 MB), of which **7 (~166 KB) are loaded by no page at all**. The homepage alone ships **575 KB of CSS** — 435 KB linked across 8 sheets plus 140 KB inline — before the 3 more the nav injects at runtime. |
| …and it cannot be fixed by deletion | Measured 2026-08-01 by disabling each sheet in a live browser and re-measuring 9 tracked elements. `sovereign-core-v2.compiled` (164 KB), `nav-global-fix` (135 KB), `ultra-premium-responsive` (72 KB) and `crowagent-brand-tokens` (19 KB) are all **load-bearing** — disabling `ultra-premium-responsive` alone changes the footer from 2340px to 1639px. Only 37 KB of 435 KB (8.5%) shows no static change, and those three sheets are named *interactions*, *gloss* and *atmosphere*, i.e. hover, focus and ambient states a static probe cannot test. **There is no safe deletion path on the legacy stack.** This is the strongest single argument for the rebuild: the payload can only come down by rebuilding the page against one token system, not by pruning. |
| The master sheet cannot be rebuilt | `npm run build:css` is hard-coded to refuse: a fresh Tailwind build drops 472 utility rules and loses the `color-mix()` srgb fallbacks. The largest CSS asset is frozen and hand-edited. |
| Manual cache busting | Every CSS/JS edit needs `?v=` bumped by hand across all referencing HTML, or the change silently never lands. |
| Competing motion systems | **Eleven** overlapping scroll/motion systems, not the seven first counted. `sv-reveal.js` stamps `.sv-reveal { opacity: 0 }` on every `main > section` and its observer is unreliable — it left **4 of 9 sections permanently invisible** on the homepage. A second, independent instance of the same hide-then-reveal pattern in `sovereign-transformation-v2.js` stuck 20/20, 13/13 and 9/9 card groups. The failure is systemic to the pattern, not a bug in one file. |
| No regression net | 65 Playwright specs, but most are one-off `debug-*` / `probe-*` scripts, not a suite. |

The cost is not "no framework". It is three specific absences: **no layout system, no
content-as-data, no single motion system**. All three are architectural.

## 2. Target stack, and why each piece earns its place

| Choice | Justification | What was rejected and why |
|---|---|---|
| **Astro 5** | Ships static HTML with zero JS by default; islands only where interactivity exists. The site has no auth, no sessions, no per-request data — that is Astro's exact shape. | **Next.js**: right when you need a server. The app at app.crowagent.ai already is that. Using it here pays a React runtime tax on pages whose job is to render text fast for Google and for LLM crawlers, and pushes builds onto Vercel, which RULE 0 exists to avoid. |
| **Content Collections** | blog (8) + compare (5) + sectors (5) + glossary (3) + legal (6) = **27 pages from 5 templates**, authored in Markdown with type-checked frontmatter. | **11ty/Hugo**: good at content, but no component islands, weaker TS story, and you hand-roll everything the motion goal needs. |
| **Tailwind v4** | Already a dependency. Theme seeded from the token block already written in `homepage-claude-v1.html`. | Retaining the hand-maintained `--ca-*` sheets: they are the thing that cannot be rebuilt. |
| **GSAP + ScrollTrigger** | Already vendored. Fully free since 2025, including the plugins. One system replaces seven. | Bespoke IntersectionObserver code: that is what produced the invisible-sections defect. |
| **Cloudflare Pages** | Unchanged. `astro build` emits `dist/`, which is already the configured output directory. £0. | Anything with a recurring cost. |
| **Astro asset hashing** | Removes the manual `?v=` ritual and the entire class of "the change never landed" bug. | — |

**Long-term risks, stated honestly.** Astro is an independent project, not hyperscaler-backed.
Mitigation: the output is plain static HTML/CSS/JS with no runtime lock-in — worst case the built
`dist/` keeps serving forever. This is the *lowest* lock-in of any option considered. Astro ships
majors roughly annually and has had breaking changes; the content is Markdown and portable
regardless. If the marketing site ever needs logged-in state, revisit Next — that is the trigger.

## 3. Information architecture

**URLs do not change. Not one.** The 42 sitemapped URLs, the extensionless routes, and the 80
`_redirects` rules are all preserved exactly. This is the hardest constraint in the migration and
the one most likely to be violated by accident.

```
src/
  layouts/    Base.astro · Page.astro · Article.astro · Legal.astro
  components/ nav/ footer/ seo/ sections/ ui/ motion/
  content/    blog/ compare/ sectors/ glossary/ legal/   (Markdown + typed frontmatter)
  data/       site.ts products.ts pricing.ts nav.ts footer.ts faq.ts seo.ts structured-data.ts
  styles/     tokens.css (the ONLY token source) + component styles
  pages/      one file per route, mirroring today's URLs exactly
public/       Assets/ _headers _redirects robots.txt (verbatim carry-over)
```

## 4. Design system

One scale each for typography, spacing, radius, shadow, colour, motion duration/easing. Seeded from
the `--t-*` / `--r-*` / `--btn-*` / `--sec-*` tokens already proven on the homepage. The `--ca-*`
and `--nt-*` systems are reconciled into one; every disagreement between them is resolved
deliberately and recorded, never averaged.

## 5. Motion

Six primitives replace seven systems: `reveal`, `parallax`, `sticky-scene`, `counter`, `magnetic`,
`sequence`. Binding rules, each written against a defect that actually happened:

1. **Guaranteed visible.** No primitive may leave content at `opacity: 0` without a timed failsafe.
   This is the `sv-reveal` defect and it is non-negotiable.
2. **One observer**, shared, not one per module.
3. `prefers-reduced-motion: reduce` disables transforms and resolves every element to its final state.
4. Print and anchor-jump resolve to final state.
5. GPU-friendly properties only: `transform` and `opacity`.

## 6. Testing strategy

| Gate | Tool | Bar |
|---|---|---|
| Visual regression | Playwright, per route, 3 widths, **old vs new** | no unintended diff |
| Accessibility | axe, every route | 0 violations |
| SEO parity | script diffing title/description/canonical/OG/JSON-LD **vs baseline tag** | byte-identical or deliberately improved |
| Links | crawler over `dist/` | 0 broken |
| Performance | Lighthouse | ≥ baseline on every metric |
| Build | `astro build` + the existing allowlist reference-check | clean |
| Unit | jest, carried over | 147 passing |

## 7. Rollout — strangler, not big bang

Astro builds alongside the legacy site; un-ported pages are served from `public/` untouched. **Every
commit leaves a fully working site**, and the migration can stop at any point without leaving a
half-built one.

Order: foundation → homepage → collections (27 pages, 5 templates) → bespoke pages (~13) → teardown.

## 8. Rollback

Baseline tag `baseline-transformed-2026-08-01`. Cloudflare Pages keeps every deployment, so rollback
is either a dashboard promote of the prior deployment or `git revert` to the tag. The tag is never
deleted or moved.

## 9. Success criteria

Zero regressions against the baseline in: rendered content, URLs, metadata, structured data,
redirects, accessibility, Core Web Vitals. Plus: changing a price is one file; adding a product is
one file; adding an industry or a blog post is one Markdown file; changing nav is one component;
changing metadata is one layout. No duplicated HTML, CSS or JS. Hosting cost unchanged at £0.
