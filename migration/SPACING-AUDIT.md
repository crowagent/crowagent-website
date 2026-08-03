# Spacing & Typography Forensic Audit — crowagent-website

Read-only audit. Reference standard = the `:root` token block in `index.html`
(lines 79-188): `--t-h1/h2/h3/h4/lede/body/micro`, `--r-card/panel/chip/pill`,
`--btn-h/btn-h-sm/btn-fs/btn-fw`, `--sec-pad-y/--sec-gap/--sec-media/--sec-band/
--blk-pad/--stack-2/--stack-1`. `index.html` and `astro/` were not modified;
everything below is sourced from files as they exist on disk today
(2026-08-01).

**Scope.** 19 inner pages (`crowmark.html`, `crowmark-buyers.html`,
`pricing.html`, `about.html`, `contact.html`, `partners.html`,
`integrations.html`, `faq.html`, `resources.html`, `roadmap.html`,
`security.html`, `changelog.html`, `terms.html`, `privacy.html`,
`cookies.html`, `blog/index.html`, `compare/index.html`, `sectors/index.html`,
`glossary/index.html`, `tools/index.html`) plus every stylesheet those pages
`<link>` or inline-`<style>`. `index.html` is read as the reference point
only.

**A note on method.** These pages load 6-11 stylesheets each, several of
which redeclare the same selector with conflicting values (some `!important`,
some not, loaded in different orders on different pages). Where I can resolve
the cascade with confidence (equal specificity, later file wins; unequal
`!important`, the `!important` rule wins regardless of order; unequal
specificity with both/neither `!important`, higher specificity wins) I state
the effective value and show my work. Where two rules are genuinely
ambiguous without opening a browser (which I was told not to do), I list both
declarations and flag it as unresolved rather than guess.

---

## 1. Section padding

### 1.1 What actually governs it

There is no single mechanism. I found five different systems, sometimes
combined on the same page:

**(a) Tailwind arbitrary `py-*` utilities written directly in the markup**
(`sovereign-core-v2.compiled.css:2295-2333`, `--spacing: 0.25rem` at
`sovereign-core-v2.compiled.css:32`):

| Class | Rule | Computed |
|---|---|---|
| `py-20` | `sovereign-core-v2.compiled.css:2307-2309` | 80px |
| `py-24` | `sovereign-core-v2.compiled.css:2310-2312` | 96px |
| `py-32` | `sovereign-core-v2.compiled.css:2313-2315` | 128px |
| `py-40` | `sovereign-core-v2.compiled.css:2316-2318` | 160px |
| `py-48` | `sovereign-core-v2.compiled.css:2319-2321` | 192px |
| `py-60` | `sovereign-core-v2.compiled.css:2322-2324` | 240px |
| `py-[var(--section-y-primary)]` | `sovereign-core-v2.compiled.css:2328-2330` | `clamp(64px,8vw,120px)` (token defined in the giant `:root` at `crowagent-brand-tokens.css:18`) |
| `py-[var(--section-y-secondary)]` | `sovereign-core-v2.compiled.css:2331-2333` | `clamp(48px,6vw,80px)` (same token block) |

Used raw in markup: `pricing.html:477,568,682,752,798,813,879,960` (`py-40`,
`py-60`, `py-20`); `about.html:225,270,368` (`py-32`, `py-40`);
`contact.html:178,231,271,343,460` (`py-24`, `pb-24`, `py-32`, `pb-32`,
`pb-40`, `py-40`); `faq.html:171,236,304,384,423` (`py-32` x5);
`integrations.html:179-287` (`py-60` x6); `resources.html:123-275` (`py-60`
x4, markup value, see 1.2 for why this is not what renders); `roadmap.html:
117-407` (`py-32` x5, `py-40` once); `crowmark.html:268-687`
(`py-[var(--section-y-secondary)]` x2, `py-[var(--section-y-primary)]` x6);
`crowmark-buyers.html:317-692` (`py-[var(--section-y-primary)]` x9,
`py-[var(--section-y-secondary)]` once); `changelog.html:105` (`py-40`);
`cookies.html:104` (`py-40`); `compare/index.html:125` (`py-32`).

There is a mobile-only global override that rewrites four of these numbers
under 768px, in `nav-global-fix-2026-05-27.css:30`
(`.py-60{padding-top/bottom:4.5rem!important}`, `.py-40->3.5rem`,
`.py-32->3rem`, `.py-24->2.5rem`, all `!important`, inside a
`@media (max-width:767px)` block, embedded in one long minified line). So the
desktop values above (80-240px) are themselves not what mobile visitors see;
mobile gets a second, narrower, undocumented scale (40-72px) laid on top.

**(b) `.ca-hero`, the hero band on every inner page.** Base rule
`sovereign-core-v2.compiled.css:4620-4631`: `padding-top: 8rem (128px)`,
`padding-bottom: 10rem (160px)`. Overridden site-wide by
`premium-transformation-2026-05-27.css:521-524` (`!important`):
`padding-top: clamp(80px,15vh,160px)`, `padding-bottom: clamp(60px,10vh,120px)`.
Because that rule is `!important`, it wins over every non-`!important`,
lower-specificity page override, including one that looks like it should
apply: `terms.html:87` sets `.f8-legal .tm-hero { padding-top: 7.5rem;
padding-bottom: 3.25rem; }` with no `!important`, so per CSS cascade rules
that declaration is dead code, the terms.html hero still renders at the
site-wide `clamp(80px,15vh,160px)/clamp(60px,10vh,120px)`, not the 120px/52px
the page's own comment implies. `security.html:73` gets this right:
`.f8-security .ca-hero { padding-bottom: 3rem !important; }`, two classes
(higher specificity) and `!important`, so it genuinely wins, making
security.html's hero bottom padding 48px, a real and distinct value.

**(c) Page-scoped inline-`<style>` "band" systems**, one invented per page,
none sharing a token:
- `terms.html:92`: `.tm-band { padding: 4.5rem 0; }` (72px flat, no clamp)
- `privacy.html:100`: `.pv-band { padding: 4.5rem 0; }` (72px flat, matches terms.html's number, at least)
- `security.html:78`: `.sec-band { padding: 5.5rem 0; }` (88px flat)
- `roadmap-page.css:303`: `padding-bottom: 3rem;` inside a max-width media query only

**(d) `resources-page.css:34`** (unlayered, `!important`, matches
`body.f8-resources section` generically): `padding-block: clamp(4rem,10vh,8rem)`
(64-128px). Because this selector is unlayered CSS with `!important` against
a Tailwind utility that ships inside `@layer utilities`
(`crowagent-brand-tokens.css:18` opens `@layer reset,brand,sf-fixes,
components,utilities,overrides;`), the unlayered rule wins regardless of the
specific `py-60` etc. written in `resources.html`'s markup. The `py-60`
(240px) classes visible in `resources.html:123-275`'s HTML do not describe
what renders; the actual padding is `clamp(64px,10vh,128px)`. Worth flagging
on its own: reading the markup of resources.html gives you the wrong number.

**(e) `.ca-section`, used with no padding source at all.** `partners.html:150`
(`<section class="ca-section bg-ca-bg-deep !pt-0">`) and `partners.html:178`
(`<section class="ca-section bg-ca-bg border-t border-white/5">`). I grepped
every stylesheet `partners.html` loads (`sovereign-core-v2.compiled.css`,
`signature-atmosphere-2026-05-26.css`, `premium-transformation-2026-05-27.css`,
`nav-global-fix-2026-05-27.css`, `premium-gloss-2026-05-31.css`,
`crowagent-brand-tokens.css`, `ultra-premium-interactions.css`,
`ultra-premium-responsive.css`) for a bare `.ca-section { ... padding ... }`
rule. None exists. The only rule that mentions `.ca-section` and padding is
`nav-global-fix-2026-05-27.css:30`, and it only matches `.ca-section.py-60`
(both classes required) or bare `section.py-20/24/32/40/60`, neither of these
two `partners.html` sections carries a `py-*` class, so that rule doesn't
fire either. `partners.html:150` also carries `!pt-0` (forces
`padding-top:0 !important`). Net result: these two sections have zero
controlled vertical padding, see Worst Offenders section 6.1.

### 1.2 Distinct padding values counted

Counting only sitewide vertical rhythm values I can confirm are genuinely
distinct (not counting the many one-off inline pixel paddings on cards,
tables, badges, etc., which run into the dozens by themselves):

`80px, 96px, 128px, 160px, 192px, 240px` (flat Tailwind py-*) ·
`clamp(64px,8vw,120px)` and `clamp(48px,6vw,80px)` (crowmark/crowmark-buyers
section-y tokens) · `clamp(80px,15vh,160px)`/`clamp(60px,10vh,120px)`
(site-wide hero, top/bottom differ) · `48px` (security.html hero override) ·
`72px` (tm-band/pv-band flat) · `88px` (sec-band flat) ·
`clamp(64px,10vh,128px)` (resources-page.css, silently overriding the
markup's `py-60`) · `clamp(84px,11vw,150px)` (`.band`, `premium-v2.css:164`)
· `clamp(60px,8vw,110px)` (`.band-tight`, `premium-v2.css:165`) ·
`clamp(90px,13vw,170px)` (`.final`, `premium-v2.css:296`) ·
`clamp(104px,14vw,164px) 0 clamp(20px,4vw,44px)` (`.sec-hero` on
sectors/index.html:38, asymmetric) · `clamp(88px,13vh,150px) 0
clamp(38px,6vw,60px)` (`.blog-hero` on blog/index.html:38, asymmetric) ·
`112px 0 30px` (`.hero`, `premium-v2.css:121`, glossary/index & tools/index,
also asymmetric, and the only one that isn't fluid at all) · plus the
mobile-only rewrite at `nav-global-fix-2026-05-27.css:30`
(`clamp(48px,6vh,96px)` / `clamp(24px,4vh,56px)`, two more values, only
visible under 767px).

That is at least 17 distinct section-padding values in active use across
these 19 pages, against the homepage's single `--sec-pad-y:
clamp(64px, 8vh, 128px)` (`index.html:141`) applied uniformly via
`.nt-section` (`index.html:319-327`).

### 1.3 Who shares a class, who hardcodes their own

- Genuinely shared (all resolve to the same rule, modulo the mobile
  override): `crowmark.html`, `crowmark-buyers.html`, both use
  `--section-y-primary`/`--section-y-secondary` tokens.
- Shared Tailwind numerals, but a different number per page (each page
  picked its own flat `py-NN`, not from a shared design token):
  `pricing.html`, `about.html`, `contact.html`, `faq.html`,
  `integrations.html`, `roadmap.html`, `changelog.html`, `cookies.html`,
  `compare/index.html`.
- Own bespoke inline "band" system, page-scoped class name: `terms.html`
  (`.tm-band`), `privacy.html` (`.pv-band`), `security.html` (`.sec-band`),
  `roadmap.html` (partially, via `roadmap-page.css`).
- Own inline system inherited from a shared file, not the markup:
  `resources.html` (markup says `py-60`, `resources-page.css` overrides it).
- A fourth, unrelated system entirely (`.band`/`.band-tight`/`.final`/`.hero`
  from `premium-v2.css`): `blog/index.html`, `sectors/index.html`,
  `glossary/index.html`, `tools/index.html`, each additionally overriding
  hero padding with its own one-off clamp (`.blog-hero`, `.sec-hero`, plain
  `.hero`).
- No spacing source at all: `partners.html` (two of its five sections).

---

## 2. Heading scale

### 2.1 H1

| # | Rule | File:line | Value | Pages |
|---|---|---|---|---|
| 1 | --t-h1 | index.html:93 | clamp(2.6rem, 6.2vw, 5.2rem) = 41.6-83.2px | homepage only (reference) |
| 2 | .ca-hero-title | sovereign-core-v2.compiled.css:4696-4705 | clamp(3.5rem, 12vw, 10rem) = 56-160px | crowmark.html:123, crowmark-buyers.html, pricing.html:421, about.html, contact.html, partners.html, integrations.html, faq.html, resources.html, roadmap.html, security.html:377, changelog.html, cookies.html:94, terms.html:291, privacy.html, compare/index.html, roughly 16 pages |
| 3 | .hero h1 | premium-v2.css:123 | clamp(3rem, 8.8vw, 6.8rem) = 48-108.8px | glossary/index.html, tools/index.html:102 |
| 4 | .blog-hero h1 | blog/index.html:40 | clamp(2.6rem, 6.4vw, 4.7rem) = 41.6-75.2px | blog/index.html:142 |
| 5 | .sec-hero h1 | sectors/index.html:41 | clamp(2.4rem, 6.4vw, 4.4rem) = 38.4-70.4px | sectors/index.html:98 |

I checked every stylesheet each .ca-hero-title using page loads for a second
declaration that would narrow rule 2 (there is a dedicated
data-hero-scale="product" selector at ultra-premium-responsive.css:129-144,
and unused-looking --h1-size-home / --h1-size-product tokens at
premium-transformation-2026-05-27.css:18-19, both are real leads worth
chasing but neither actually sets font-size: the data-hero-scale rule only
touches background-clip / color / animation, and --h1-size-product /
--h1-size-home are declared and then never referenced by any var() call in
any stylesheet these pages load, confirmed by grepping every loaded CSS file
for the token name). So rule 2 is the sole font-size source, and it computes
to a genuine ceiling of 160px on any viewport 1333px wide or more
(10rem / 0.12 = 83.3rem = 1333px), nearly double the homepage own H1 ceiling
of 83.2px.

Count: 5 distinct H1 rules across the 19 pages, none identical to each other
or to the homepage --t-h1; 6 total including the homepage.

### 2.2 H2

| # | Rule | File:line | Value |
|---|---|---|---|
| 1 | --t-h2 (homepage) | index.html:94 | clamp(1.9rem,3.5vw,2.9rem) = 30.4-46.4px |
| 2 | .ca-section-title (default) | sovereign-core-v2.compiled.css:5112-5126 | var(--text-6xl)=60px flat below 768px, jumps to var(--text-8xl)=96px flat at 768px and above (a hard breakpoint, not a fluid clamp); --text-6xl / --text-8xl defined sovereign-core-v2.compiled.css:60,64 |
| 3 | about.html override | about.html:245,281,372 | .text-5xl = 48px flat, added alongside .ca-section-title to shrink it |
| 3b | about.html override | about.html:327 | .text-4xl = 36px flat, same pattern |
| 4 | .head h2 | premium-v2.css:168 | clamp(2.1rem,4.6vw,3.4rem) = 33.6-54.4px |
| 5 | .final h2 | premium-v2.css:297 | clamp(2.8rem,7.5vw,6rem) = 44.8-96px |
| 6 | .tools h2 | premium-v2.css:236 | clamp(1.7rem,3.4vw,2.5rem) = 27.2-40px |
| 7 | .dev h2 | premium-v2.css:263 | clamp(2rem,4vw,3rem) = 32-48px |
| 8 | .tm-title (terms.html) | terms.html:108-114 | clamp(1.5rem,4vw,2.25rem) = 24-36px |
| 9 | .pv-title (privacy.html) | privacy.html:116-121 | clamp(1.5rem,4vw,2.25rem) = 24-36px, identical formula to 8, the one genuinely matched pair on the site |
| 10 | .legal-doc h2 (in-body headings, terms/privacy/cookies) | legal-content.css:37 | clamp(1.6rem, 1rem + 1.8vw, 2.25rem) = 25.6-36px, same ceiling as 8/9 but a different min and slope, a near duplicate rather than a match |
| 11 | cookies.html in-body h2 | cookies.html:112,122,209,217,220,236 | Tailwind .text-3xl = 30px flat, no clamp at all |
| 12 | .sec-title (security.html) | security.html:96-102 | clamp(1.65rem,4vw,2.5rem) = 26.4-40px |
| 13 | .sec-h2 inline (security.html) | security.html:208-213 | clamp(1.35rem,3vw,1.75rem) = 21.6-28px, smallest H2 on the site |
| 14 | .sec-h2 external (security-page.css) | security-page.css:115-126 | clamp(1.5rem,2.6vw,1.875rem) = 24-30px, likely superseded by 13 (same selector, inline style block loads later in security.html head at equal specificity, neither marked important), listed for completeness since computed style cannot be verified without a browser |
| 15 | roadmap.html h2, variant A | roadmap.html:121,242 | Tailwind text-4xl md:text-6xl = 36px below md, 60px at md and above |
| 15b | roadmap.html h2, variant B | roadmap.html:317,369,391 | Tailwind .text-5xl = 48px flat, no responsive step |

Count: 13 meaningfully distinct H2 declarations (treating 8/9 as one matched
pair and 3/3b/15/15b as Tailwind utility one-offs rather than separate
systems), none matching the homepage --t-h2. Two of them (5 at 96px, 2 at its
768px-and-above value of 96px) exceed the homepage own H1 ceiling (83.2px),
see 2.4 below.

### 2.3 H3 (sample, for the inversion check)

| Rule | File:line | Value |
|---|---|---|
| --t-h3 (homepage) | index.html:95 | clamp(1.5rem,2.3vw,2.05rem) = 24-32.8px |
| .tcell h3 (premium-v2 trust grid) | premium-v2.css:286 | 1.15rem fixed = 18.4px |
| .sec-tile h3 (security.html) | security.html:139-142 | 1.0625rem fixed = 17px |
| .sec-subcard-h (security.html, applied to h3) | security.html:264 | 0.95rem fixed = 15.2px |
| .tm-card h3 (terms.html) | terms.html:138 | 1rem fixed = 16px |
| .legal-doc h3 (terms/privacy/cookies body) | legal-content.css:39 | 1.375rem fixed = 22px |

### 2.4 Hierarchy inversions, the finding the task asked to prioritize

Confirmed inversion: security.html own h2 class="sec-h2" renders smaller
than the homepage h3.

- security.html in-page .sec-h2 (security.html:208-213, the class literally
  applied to h2 class="sec-h2" at security.html:495, 523, 547, 565, 609, 633,
  685, 736, 756, 796, 848, i.e. every subsection of the page: Encryption at
  rest, TLS in transit, GDPR, Access controls, ISO 27001, AI handling,
  Vulnerability disclosure, Uptime, Deep dives, Company details, the closing
  CTA) has a ceiling of 28px (clamp(1.35rem,3vw,1.75rem)).
- The homepage --t-h3 (index.html:95) has a ceiling of 32.8px
  (clamp(1.5rem,2.3vw,2.05rem)), applied to third-level headings like the
  tab-panel titles.
- 28px is less than 32.8px at every viewport width (both clamps are
  monotonic and the H2 clamp never exceeds 28px even as its vw term grows,
  while the H3 clamp reaches 32.8px by roughly 1122px viewport width). So on
  wide viewports, every H2 on security.html is visibly smaller than a plain
  H3 on the homepage.
- The possibly-dead external rule at security-page.css:120
  (clamp(1.5rem,2.6vw,1.875rem), ceiling 30px) reaches the same conclusion
  either way: 30px is still below 32.8px.
- As a second, page-internal symptom of the same problem: security.html has
  two different h2 styles on one page, .sec-title (security.html:96-102,
  ceiling 40px, used for the two band headings Operational standards and
  Security documentation) and .sec-h2 (ceiling 28px, used for every
  subsection underneath). A 12px gap between two headings that are both,
  structurally, h2 elements.

I also checked whether any other page H2 undercuts the homepage H3 the same
way: .sec-h2 above is the only sitewide instance where a page own H2 ceiling
drops below 32.8px while that page also carries H3 text sized in the
15-22px range underneath it (2.3), so the ordering degrades twice on the
same page: .sec-title (40) is greater than .sec-h2 (28) is greater than
.sec-tile h3 (17) and .sec-subcard-h (15.2), which is at least directionally
monotonic on its own page even though the H2 tier is compressed against the
rest of the site.

---

## 3. Content width

| Container class | Value | File:line | Pages |
|---|---|---|---|
| .nt-container | max-width: 1260px | index.html:309-317 | homepage only (reference) |
| .ca-container | max-width: 90rem (1440px), padding-inline 2rem, growing to 5rem at 64rem and above | sovereign-core-v2.compiled.css:4612-4619 | crowmark.html, crowmark-buyers.html, pricing.html, about.html, contact.html, partners.html, integrations.html, faq.html, resources.html, roadmap.html, security.html, changelog.html, terms.html, privacy.html, cookies.html, compare/index.html, 16 pages |
| .wrap | max-width: var(--max) = 1200px (premium-v2.css:40) | premium-v2.css:56 | blog/index.html, sectors/index.html, glossary/index.html, tools/index.html |

Three distinct content widths are in play: 1260px (homepage), 1440px (16 of
the 19 inner pages), 1200px (4 of the 19 inner pages). compare/index.html
loads both sovereign-core-v2.compiled.css and premium-v2.css but its markup
(compare/index.html:115,126,179) uses .ca-container, so it renders at
1440px, not 1200px, worth flagging because it is the one page mixing both
systems and could easily drift either way in a future edit.

There is also a fourth container scale, unrelated to the three above:
crowagent-brand-tokens.css defines --container-narrow:720px,
--container-default:1200px, --container-wide:1400px (inside the huge :root
block at crowagent-brand-tokens.css:18). Grepping every loaded stylesheet
and every page markup for var(--container-narrow, var(--container-default,
or var(--container-wide turns up no consumer among the 19 pages. Dead
tokens, listed for completeness.

---

## 4. Radius and buttons

### 4.1 Border-radius

At least four separate token scales exist simultaneously:

1. Homepage (index.html:109-112): --r-card:20px, --r-panel:16px,
   --r-chip:10px, --r-pill:100px.
2. crowagent-brand-tokens.css:18, scale A: --r:12px; --r2:16px; --r3:20px;
   --rp:100px.
3. Same file, scale B (further along the same :root block):
   --radius-xs:4px; --radius-sm:6px; --radius-md:10px; --radius-lg:16px;
   --radius-xl:24px; --radius-2xl:32px; --radius-full:9999px.
4. Same file, scale C: --btn-radius:10px; --btn-radius-pill:100px, and later
   still --radius-pill:100px; --radius-full:999px (yet another pill value,
   999 vs 9999 vs 100).
5. premium-v2.css:42: --r:14px; --r-lg:22px; --r-xl:28px, a fifth scale,
   reusing the token name --r from scale A/B with a different value (14px
   here vs 12px in crowagent-brand-tokens.css), which only does not collide
   visibly because premium-v2.css declares its own unscoped
   :root{--r:14px;...} that wins on the pages that load it after
   crowagent-brand-tokens.css.

Concrete radii actually painted on cards and panels, sampled:

| Selector | File:line | Radius |
|---|---|---|
| .ca-card | sovereign-core-v2.compiled.css:4814 | 3rem = 48px, hardcoded, not a variable |
| .sec-tile (security.html) | security.html:121 | var(--r2) = 16px |
| .sec-toc-card, .sec-contact (security.html) | security.html:174,197 | var(--r2) = 16px |
| .tm-card (terms.html) | terms.html:127 | 18px hardcoded |
| .legal-aside__card | legal-content.css:22 | 1.25rem = 20px |
| .lc-callout, .lc-details | legal-content.css:60,75 | 1rem = 16px |
| .lc-stat | legal-content.css:94 | 1.5rem = 24px |
| .cookies-table-wrapper | legal-content.css:106 | 1.25rem = 20px |
| .badge-cookie | legal-content.css:112 | 0.375rem = 6px |
| .frame, .phase (premium-v2 pages) | premium-v2.css:144,182 | var(--r-xl) = 28px |
| .pshot, .ledger, .stats, .trust | premium-v2.css:205,212,226,283 | var(--r-lg) = 22px |
| .chrome, .viewport | premium-v2.css:146,153 | 18px |

Radius values in confirmed active use: 4, 6, 10, 12, 14, 16, 18, 20, 22, 24,
28, 32, 48px, plus three different pill encodings (100px, 999px, 9999px).
That is 13 or more distinct non-pill radii against the homepage 3
(10/16/20px), and the single most visible outlier is .ca-card at 48px, more
than double the homepage --r-card of 20px, used for every generic content
card across the entire .ca-* page family (crowmark, pricing, about, contact,
partners, integrations, faq, resources, roadmap, security, changelog,
crowmark-buyers).

### 4.2 Buttons

The homepage button is a different class family entirely
(.nt-btn-primary / .nt-btn-secondary, index.html:427-506) and is never
loaded by any of the 19 inner pages, so there is zero code-level sharing
regardless of token values. Homepage: min-height:48px (hardcoded, not
var(--btn-h), index.html:466; note --btn-h:54px at index.html:117 is itself
declared and, per a sitewide grep, never consumed by any var() call, i.e. a
dead token even on the homepage itself), font-size: var(--btn-fs,15px),
font-weight: var(--btn-fw,600), no text-transform.

Inner pages use .sv-btn. There are three layers of declaration for it:

1. Base (sovereign-core-v2.compiled.css:4733-4744): padding-block: 1rem,
   padding-inline: 2.5rem, font-size: var(--text-xs) = 12px, font-weight:
   var(--font-weight-black) = 900, text-transform: uppercase,
   letter-spacing: var(--tracking-widest), border-radius: 9999px
   (calc(infinity*1px)). No important flag.
2. Sitewide override (nav-global-fix-2026-05-27.css:30, one long minified
   line, marked important): .sv-btn padding-block:var(--space-4) important,
   padding-inline:var(--space-8) important, font-size:var(--text-sm)
   important, line-height:1 important, border-radius:999px important,
   min-height:0 important, where var(--space-4)=1rem(16px),
   var(--space-8)=2rem(32px), var(--text-sm)=0.875rem(14px), all from
   crowagent-brand-tokens.css:18. Because this is marked important and
   layer 1 is not, this wins on every page that loads nav-global-fix.css,
   which is all 19. It does not touch font-weight or text-transform, so
   those properties still resolve from whichever rule sets them. Same file,
   same selector, a second declaration (.ca-hero .sv-btn, and also
   section.ca-cta-final .sv-btn) bumps hero and final-CTA buttons
   specifically to padding-block: var(--space-5) (1.25rem/20px),
   padding-inline: var(--space-10) (2.5rem/40px), font-size: var(--text-md)
   (1rem/16px), so a button inside a hero or a .ca-cta-final section is a
   third, larger size again.
3. premium-v2.css:69-70 (loaded, without important, on blog/index,
   compare/index, sectors/index, glossary/index, tools/index, all five load
   sovereign-core-v2.compiled.css and premium-v2.css): min-height:48px,
   font-weight:800, font-size:1rem (16px). This is not marked important, so
   it loses to layer 2 on padding / font-size / min-height (those are set
   with important in nav-global-fix, which loads earlier in the head on
   these five pages but importance beats source order), but it does win the
   font-weight property specifically (800 vs layer 1 900), since neither the
   font-weight:800 declaration nor layer 1 font-weight:900 carries
   important, and premium-v2.css loads later in the document. Net effect on
   these five pages: buttons are 14px (from layer 2), font-weight 800 (from
   layer 3), uppercase (only source is layer 1, never overridden), radius
   pill.
4. .sv-btn--sm / .sv-btn--lg (premium-v2.css:87-88): min-height:44px,
   font-size:.9rem(14.4px) / min-height:58px, font-size:1.06rem(16.96px),
   two more explicit sizes layered on top of the above.

At minimum 5 distinct button height / font-size / weight combinations are
declared and in active use (base 12px/900/uppercase; sitewide-override
14px/900/uppercase; hero-scoped 16px/900/uppercase; premium-v2-page
14px/800/uppercase; .sv-btn--sm / .sv-btn--lg 14.4px/17px variants), none
matching the homepage 15px/600/not-uppercase .nt-btn-primary, and the
homepage own declared --btn-h / --btn-h-sm tokens are unused by anything,
including the homepage.

---

## 5. Gap to the homepage standard, normalisation table

| Token | Homepage value | Rest-of-site status | What the rest of the site uses instead |
|---|---|---|---|
| --t-h1 | clamp(2.6rem,6.2vw,5.2rem) (41.6-83.2px) | Different value, no equivalent token | .ca-hero-title: clamp(3.5rem,12vw,10rem) (56-160px) on roughly 16 pages; three more one-off clamps on blog/sectors/glossary/tools indexes, section 2.1 |
| --t-h2 | clamp(1.9rem,3.5vw,2.9rem) (30.4-46.4px) | Different value, no equivalent token; 13 distinct H2 rules found, section 2.2 | .ca-section-title (60/96px hard jump) is the closest thing to a default, but about.html, roadmap.html, terms.html, privacy.html, security.html, cookies.html, and all premium-v2.css pages each override it locally |
| --t-h3 | clamp(1.5rem,2.3vw,2.05rem) (24-32.8px) | No equivalent token; every page defines its own fixed-px H3s (15.2-22px on the .ca-* pages, no fluid clamp at all) | .tcell h3 (18.4px), .sec-tile h3 (17px), .sec-subcard-h (15.2px), .tm-card h3 (16px), .legal-doc h3 (22px) |
| --t-h4 | clamp(1.0625rem,1.35vw,1.28rem) (17-20.5px) | No equivalent token found on any of the 19 pages loaded CSS | Not tracked as a tier; card sub-headings use ad hoc sizes (for example security.html .sec-subcard-h at 0.95rem/15.2px, smaller than the homepage own H4 floor) |
| --t-lede | 1.02rem fixed | Matched, coincidentally, terms.html:116 .tm-lede font-size:1.02rem, privacy.html:125 .pv-lede same value | Otherwise ad hoc: security.html .sec-lede is 1.05rem (close but not equal) |
| --t-body | 0.9375rem | Different value / no token | crowagent-brand-tokens.css declares its own --text-body: clamp(1rem,1.2vw,1.125rem), a different value under a similarly named token, in the file the site actually calls its brand tokens |
| --t-micro | 11.5px | Close but not equal | crowagent-brand-tokens.css --text-micro: 0.6563rem = 10.5px |
| --r-card | 20px | Different value | .ca-card = 48px (hardcoded, section 4.1), used sitewide on .ca-* pages |
| --r-panel | 16px | Coincidentally matched via a differently named token | --r2: 16px in crowagent-brand-tokens.css (scale A) happens to equal it |
| --r-chip | 10px | Coincidentally matched via a differently named token | --r: 12px (scale A, close but not equal) vs --radius-md: 10px (scale B, exact match, different name) |
| --r-pill | 100px | Three competing pill encodings | --rp:100px (scale A) vs --radius-full:9999px (scale B) vs .sv-btn border-radius 9999px/999px (section 4.2), functionally equivalent visually but not the same declared value, and the raw number 9999/999 disagree with each other too |
| --btn-h | 54px | Unused everywhere, including the homepage itself | No inner page references a token by this name; effective button heights range 44-58px across five different declarations, section 4.2 |
| --btn-h-sm | 44px | Coincidentally matched by value in places | .sv-btn--sm = min-height:44px (premium-v2.css:87), but via a hardcoded number, not a shared token |
| --btn-fs | 15px | Different value everywhere | 12px (base .sv-btn), 14px (sitewide override), 16px (hero-scoped), 14.4/17px (--sm/--lg), none is 15px |
| --btn-fw | 600 | Different value everywhere | 900 (base) or 800 (premium-v2 pages), no inner page uses 600, and all of them add text-transform:uppercase, which the homepage button does not use at all |
| --sec-pad-y | clamp(64px,8vh,128px) | Different value(s), no shared token, 17 or more distinct values found, section 1.2 | Closest analogue: .ca-hero effective clamp(80px,15vh,160px) / clamp(60px,10vh,120px); everything else is py-NN Tailwind flats or a page-local clamp |
| --sec-gap | clamp(36px,4.5vh,64px) | No equivalent token | Not tracked; head-to-content spacing is ad hoc per page (for example .tm-glance margin-top:2.5rem at terms.html:121, .head margin:0 auto clamp(48px,7vw,80px) at premium-v2.css:166) |
| --sec-media | clamp(240px,32vh,420px) | No equivalent token | Not tracked on any inner page |
| --sec-band | clamp(100px,13vh,176px) | No equivalent token | Not tracked; closest analogue is .lc-stat (legal-content.css:94, padding:2.5rem/40px, unrelated concept) |
| --blk-pad | clamp(22px,3vh,36px) | No equivalent token | Card padding is hardcoded per component: .ca-card uses calc(var(--spacing)*12)=48px (sovereign-core-v2.compiled.css:4815); .sec-tile uses 1.75rem=28px (security.html:122); .lc-callout uses 1.75rem 2rem (legal-content.css:60) |
| --stack-2 | clamp(16px,2vh,24px) | No equivalent token | Ad hoc margins throughout, typically 1rem to 1.5rem fixed |
| --stack-1 | clamp(10px,1.3vh,15px) | No equivalent token | Ad hoc, typically 0.5rem to 0.75rem fixed |

Summary: of the 14 homepage tokens, none are consumed by name anywhere in
the 19 inner pages CSS. A handful of values coincide by accident (--t-lede
close to .tm-lede / .pv-lede, --r-panel close to --r2), but every
coincidence is a different token name pointing at the same number rather
than a shared source, meaning any future change to the homepage tokens will
silently diverge from the rest of the site with no build-time signal.

---

## 6. Top 10 worst offenders, ranked

1. partners.html:150 and partners.html:178, section class="ca-section ..."
   uses a spacing class, .ca-section, that is not defined by any stylesheet
   the page loads (confirmed by grepping all eight loaded CSS files). With
   !pt-0 also forcing padding-top:0 important on the first of the two, these
   sections render with zero controlled vertical padding, content runs
   flush against the section above it. Should become: padding-block:
   var(--sec-pad-y) (or the nearest agreed equivalent), an actual, defined
   rhythm token.

2. .ca-hero-title, sovereign-core-v2.compiled.css:4696-4705, font-size:
   clamp(3.5rem, 12vw, 10rem), a ceiling of 160px, used as the H1 on roughly
   16 pages. Nearly double the homepage own H1 ceiling (--t-h1, 83.2px,
   index.html:93). Should become var(--t-h1).

3. .ca-section-title, sovereign-core-v2.compiled.css:5112-5126, H2 that hard
   jumps to 96px at 768px viewport width and above (not even a fluid clamp,
   a breakpoint step from 60px to 96px). 96px is larger than the homepage
   own H1 ceiling (83.2px). Used as-is on crowmark.html:603,724,
   pricing.html (7 instances), contact.html, faq.html, partners.html,
   integrations.html, resources.html, changelog.html, crowmark-buyers.html,
   roadmap.html:412. Should become var(--t-h2).

4. .sv-btn uppercase plus weight 900/800, versus the homepage
   .nt-btn-primary at weight 600, sentence case
   (sovereign-core-v2.compiled.css:4733-4744 vs index.html:461-479), every
   primary CTA on every inner page reads in shouting case at black or
   extra-bold weight; the homepage CTAs do not. This is the single most
   visible typographic mismatch a user would notice navigating from the
   homepage into any product page. Should become var(--btn-fw) (600),
   text-transform: none.

5. security.html .sec-h2 (security.html:208-213, ceiling 28px) rendering
   smaller than the homepage plain H3 (index.html:95, ceiling 32.8px), the
   confirmed hierarchy inversion from section 2.4. Governs the ten most
   important subsection headings on the page users read to evaluate trust
   in the product (Encryption, Data residency, GDPR, Access controls, ISO
   27001, AI handling, Vulnerability disclosure, Uptime, Deep dives,
   Company details). Should become var(--t-h3) at minimum, ideally
   var(--t-h2) since it is structurally an h2.

6. .ca-card, sovereign-core-v2.compiled.css:4814, border-radius: 3rem
   (48px) hardcoded (not a variable), versus the homepage --r-card: 20px
   (index.html:109). Applied to essentially every generic content card
   across the .ca-* page family. Should become var(--r-card).

7. Content width drifts between 1200px, 1260px and 1440px depending on
   which four files a page happens to load (section 3), .wrap
   (premium-v2.css:56) vs .nt-container (index.html:309) vs .ca-container
   (sovereign-core-v2.compiled.css:4612). A user clicking from the blog
   (1200px) to a product page (1440px) to the homepage (1260px) gets three
   different reading-column widths in three clicks. Should collapse to one
   container token.

8. resources.html markup says py-60 (resources.html:123,158,216,247,275,
   240px) but resources-page.css:34 silently rewrites every section
   padding to clamp(4rem,10vh,8rem) (64-128px) via an unlayered important
   rule. The HTML and the rendered page disagree by up to 112px, and
   nothing in the markup signals this to a future editor. Should remove the
   dead py-60 classes from the markup or fold the override into a named,
   documented rhythm token.

9. Five distinct .sv-btn height / font / weight combinations depending on
   page and location within the page (12px/900 base, 14px/900 sitewide
   override, 16px/900 inside .ca-hero / .ca-cta-final, 14px/800 on the five
   premium-v2.css pages, 14.4px/17px for --sm / --lg variants; full
   citations in section 4.2), none of which is the homepage 15px/600. A
   visitor moving between sections of a single page (for example a hero CTA
   versus a mid-page CTA on crowmark.html) sees two different button sizes
   for what is visually the same component. Should collapse to
   var(--btn-h) / var(--btn-h-sm) / var(--btn-fs) / var(--btn-fw).

10. terms.html:87 hero-padding override is dead code, .f8-legal .tm-hero
    padding-top: 7.5rem; padding-bottom: 3.25rem; has no important flag and
    lower specificity than premium-transformation-2026-05-27.css:521-524
    important rule, so it never applies; the page actual hero padding is
    the sitewide clamp(80px,15vh,160px) / clamp(60px,10vh,120px), not the
    tighter 120px/52px a maintainer reading terms.html own style block
    would reasonably believe is in effect. Low visual severity (the
    fallback value is still a valid value, just not the intended one) but
    high migration risk: this kind of drift, where the source of truth for
    a value is not the file that looks like it should own it, is exactly
    what generates the next round of inconsistency. Should be deleted or
    made to actually win.

---

## Appendix: files read for this audit

Pages: index.html (reference), crowmark.html, crowmark-buyers.html,
pricing.html, about.html, contact.html, partners.html, integrations.html,
faq.html, resources.html, roadmap.html, security.html, changelog.html,
terms.html, privacy.html, cookies.html, blog/index.html, compare/index.html,
sectors/index.html, glossary/index.html, tools/index.html.

Stylesheets: Assets/css/sovereign-core-v2.compiled.css,
Assets/css/signature-atmosphere-2026-05-26.css,
Assets/css/premium-transformation-2026-05-27.css,
Assets/css/nav-global-fix-2026-05-27.css,
Assets/css/premium-gloss-2026-05-31.css, crowagent-brand-tokens.css,
Assets/css/ultra-premium-interactions.css,
Assets/css/ultra-premium-responsive.css, Assets/css/premium-v2.css,
Assets/css/roadmap-page.css, Assets/css/security-page.css,
Assets/css/legal-content.css, Assets/css/resources-page.css,
Assets/css/no-js-content-fallback.css, print.css, tailwind.config.mjs.

Not loaded by any of the 19 pages (confirmed by grepping every page head),
and therefore excluded from this audit despite existing in Assets/css/:
page-fixes-sf22.css, nav-footer-sf21.css, back-to-top.css,
sovereign-primitives.css, sovereign-cmdk.css, page-archetype-unify.css,
pricing-sf16.css (checked, pricing.html does not actually load it, despite
the filename), styles.css / styles.min.css / styles.purged.css (the legacy
pre-sovereign-core stylesheet; not linked by any page in scope).
