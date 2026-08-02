# Deployment and Release — crowagent.ai

Single source of truth for how this repository reaches production, what guards it on
the way, and the specific incidents that produced each guard. Grounded in the actual
`_headers`, `_redirects`, `scripts/build-dist.js` and git history as of 2026-08-02.

## 1. Platform

**Cloudflare Pages.** Custom domain `crowagent.ai` (`CNAME` file: `crowagent.ai`). £0
recurring cost beyond the domain itself — this is a binding constraint on every
architectural decision in this repo (`MODERNISATION-ARCHITECTURE.md` §2 rejects
Next.js/Vercel partly on this basis).

**Build output directory: `dist/`.** This was **not always true**. Before 2026-07-29 the
Pages project published the repository root, which shipped 135 files under `.dev-tools/`,
70 under `tests/`, 35 under `scripts/`, 14 under `specs/`, plus `package.json` and the
lockfiles — all publicly fetchable and returning 200 on crowagent.ai.
`_redirects` **cannot** fix this class of problem: Cloudflare serves an existing static
asset before it consults `_redirects`, so no redirect rule can shadow a file that is
actually deployed. Verified live at the time: `/tests/accessibility.spec.js` and
`/.dev-tools/arch1-chunk-extract.js` both still returned 200 with gating `_redirects`
rules in place. The only real fix was pointing the Pages build output directory at
`dist/`, enabled 2026-07-29.

**Build command:** `npm run build`, which runs `node scripts/build-dist.js`. Full detail
of what that script does and guards against is in `TESTING-AND-QUALITY-GATES.md` §2 —
this document covers the deployment-facing consequences, not the build mechanics.

## 2. Rollback

**Tag: `baseline-transformed-2026-08-01`.** Deployed to crowagent.ai the same day. Every
claim in `MODERNISATION-ARCHITECTURE.md` is diffed against this tag, never against
`main`, because `main` moves.

Cloudflare Pages retains every deployment, so rollback is either:
- A dashboard promote of the prior deployment (fastest, no git operation needed), or
- `git revert` to the tag, then push.

**The tag is never deleted or moved.** Earlier tags remain in history for reference but
are superseded:

| Tag | Date | Context |
|---|---|---|
| `pre-transform-2026-05-26` | 2026-05-26 | Before the 2026-05 transformation wave |
| `handover-gemini-baseline` | 2026-05-26 | Handover snapshot |
| `tm-baseline-2026-07-28` | 2026-07-28 | Before TM-REMEDIATION-001 (trademark-driven product removal) |
| `pre-r2-website-2026-07-29` | 2026-07-27 | Before the `dist/`-output-directory + R2.6.1 website ship |
| `baseline-transformed-2026-08-01` | 2026-08-01 | **Current rollback point** — before/around the Astro rebuild work |

To recover a page parked or removed by trademark remediation:
`git show tm-baseline-2026-07-28:<path>`. **Do not re-point any parked route at a
restored page without an owner instruction** — the parking is a deliberate legal
decision (§4), not a build artefact.

## 3. Caching and versioning rules

### 3.1 The rule

- `/Assets/*`, `/styles.min.css`, `/scripts.min.js` are served
  `Cache-Control: public, max-age=31536000, immutable` — one year, no revalidation.
- HTML pages (`/*.html` and every clean URL) are served
  `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=60` and
  `CDN-Cache-Control: no-store` — **never edge-cached**, so a content deploy is visible
  immediately.
- `/js/*` gets a short browser cache (`max-age=300`) but a long CDN edge cache
  (`s-maxage=86400`, `CDN-Cache-Control: public, max-age=86400`), safe because these are
  fetched with `?v=` cache-busters — a deploy that changes the file changes the URL, so
  the old edge entry is simply never requested again rather than needing invalidation.

### 3.2 What this means for a content change

**Any change to a file under `/Assets/*` (or `styles.min.css`/`scripts.min.js`) that
does not change its URL will not reach anyone who already fetched it, for up to a
year.** This is not theoretical: the 2026-07-30 OG-card correction (removing a
non-existent "CrowMark from £99/mo" price) could not reach anyone — or any social
platform — holding the old card, because 24 of 25 references carried no `?v=`.

**Fix, in order of preference:**
1. Bump the reference's `?v=` in every HTML/CSS/XML file that points at the asset. This
   is what actually reaches a browser or a social scraper holding a cached copy — a new
   URL is a cache miss by definition.
2. If the change is genuinely not user-visible (verified, not assumed), re-record the
   build's asset-hash lock instead:
   `node scripts/build-dist.js --accept-asset-changes`.

**The build enforces this rather than trusting a note.** `scripts/build-dist.js`
maintains `scripts/asset-version-lock.json` (95 tracked assets currently), hashing every
referenced, unversioned `/Assets/*` file and failing the build if the hash changes under
an unchanged URL. See `TESTING-AND-QUALITY-GATES.md` §2.3 for the mechanism.

### 3.3 HTML pages are deliberately never edge-cached

Was `max-age=14400` (4 hours) until 2026-06-03, then the fix that set that TTL used the
wrong header (`Cache-Control` instead of `CDN-Cache-Control`), so it only ever
half-worked — see Incident 3 (§6) for the full measured detail. HTML is now
`CDN-Cache-Control: no-store` unconditionally, so a deploy is visible at the edge
immediately. Every asset-path rule further down the `_headers` file re-asserts its own
`CDN-Cache-Control` explicitly, because the catch-all's `no-store` would otherwise ride
along onto them too (see §6, Incident 3's concatenation mechanism).

## 4. Known traps — read before touching `_headers` or `_redirects`

All five measured live in production, not inferred from documentation. Re-measure
before contradicting any of these.

### 4.1 Cloudflare Pages **concatenates** `_headers` rules; it does not override

If an earlier, less-specific rule (e.g. the global `/*` block) has already set a header,
a later, more-specific rule that sets the same header does not replace it — both values
are sent on the wire. Measured live 2026-08-01 on a stylesheet response:

```
cdn-cache-control: no-store
cdn-cache-control: public, max-age=31536000, immutable
```

Both headers were present simultaneously. Which one an edge node or a browser honours
is undefined. **Fix: `!` unsets the inherited value first.** Every specific rule block
in `_headers` (`/js/*`, `/styles.min.css`, `/scripts.min.js`, `/Assets/*`) now opens
with:

```
! Cache-Control
! CDN-Cache-Control
! Surrogate-Control
```

before re-asserting its own values. **Any new `_headers` block that sets one of these
three headers and sits below the global `/*` block must carry the same three `!` lines
first**, or it will silently ship the conflicting-header defect again.

### 4.2 A `301!` (force flag) rule in `_redirects` ships dead

The `!` force-flag suffix is **Netlify syntax**, not Cloudflare. Cloudflare Pages
silently drops any `_redirects` rule whose status token it does not recognise — no
build error, no warning. Two rules shipped as `301!` and both returned 404 in
production. It is easy to believe `!` works here because
`https://www.crowagent.ai/*  https://crowagent.ai/:splat  301!` does work — but that
rule is served by a zone-level Cloudflare **Redirect Rule** (a different mechanism,
configured in the dashboard), not by `_redirects` at all, so it proves nothing about
`_redirects` syntax. Contrast with `/get-cyber-essentials … 301` (no `!`), which fires
correctly. **Never write `301!`, `302!`, etc. in `_redirects`. Plain status codes only.**

### 4.3 `_redirects` has a hard rule budget, and it fails silently past it

Cloudflare stops honouring rules past roughly the 110th–115th non-comment line in
`_redirects`. Rules below that point are parsed but **never fire** — no error, no
warning, and (per §4.4) the branded 404 page still renders, so the site does not look
broken even when a rule 20 lines below the cutoff is completely dead.

Measured on production 2026-07-30 by curling crowagent.ai directly at each rule's
number: rule 110 fired (301), rule 112 fired (302), rule 114 fired (200), but rules 117,
120 and 124 were dead (404) despite being syntactically correct — including a link the
site's own `/resources` page pointed at. The file was 126 rules long at the time; the
last 17 were dead.

**Current count: check before every edit** with
`grep -vE '^\s*#|^\s*$' _redirects | wc -l` (82 as of this writing). **Budget: keep it
under 100.** New rules go **above** the `/* /404.html 404` catch-all at the bottom,
never after — matching is first-match-wins, top-down, so anything below the catch-all
is unreachable regardless of the rule-count cutoff. Verify with:
`awk '/^\/\*[[:space:]]+\/404\.html/{f=1;next} f && /^\//{print NR": "$0}' _redirects`
— this must print nothing.

### 4.4 An existing static asset is served before `_redirects` is consulted

No redirect rule — 3xx or otherwise — can shadow a file that actually exists in
`dist/`. This is why the "dev surface leak" incident (§1) could not be patched with a
redirect rule, and why block 4 of `_redirects` (blocking loose `.js`/`.mjs`/`.json`/
`.py`/`.sh` files directly under `/tools/`) uses a **200-rewrite to `/404.html`** rather
than a 404-status rule — a 404-status rule cannot shadow a file that exists, but a
200-rewrite genuinely replaces the response body while still transmitting a 404 status
via Cloudflare's own not-found handling, so the script source is never transmitted.

### 4.5 Cloudflare's own URL canonicalisation runs before `_redirects` is consulted

- `/about.html` → 308 → `/about` (flat file exists, extension stripped)
- `/about/` → 308 → `/about` (flat file exists, trailing slash stripped)
- `/sectors` → 308 → `/sectors/` (directory exists, trailing slash **added**)

Consequence: a URL form that Cloudflare canonicalises away can never be the form a
crawler indexed, because it never returned 200 — so `_redirects` does not need a rule
for it. This is why `_redirects` carries **no** `.html` twins or flat-path
trailing-slash twins for deleted pages (removing 21 such rules in one pass on
2026-07-30 bought the headroom that keeps the file under the §4.3 budget): while a page
exists, the `.html` form 308s away before `_redirects` is ever consulted; once the page
is deleted, the `.html` form 404s outright rather than being rewritten, so it was never
a URL any crawler could have indexed. Canonicalisation only happens when something
exists at the target — with no file present, both `/foo.html` and `/foo/` 404 directly.

## 5. `_headers` — current security and cache posture

Full policy lives in the `_headers` file itself with extensive inline provenance; this
section is the deployment-relevant summary.

- **CSP still contains `style-src 'unsafe-inline'` and `script-src-attr 'unsafe-inline'`,
  deliberately.** 184 inline `style="..."` attributes were measured across 27 served
  pages on 2026-07-29 (index.html alone: 32). A prior claim of "0 hits" from a since-deleted
  migration script cannot be reproduced and is explicitly flagged in the `_headers`
  comments as **not reliable** — do not cite it. Removing `'unsafe-inline'` requires
  migrating all 184 attributes to classes first; this has not happened.
- **`Content-Security-Policy-Report-Only` is deliberately not set on a preview-only
  origin.** Cloudflare Pages' `_headers` file has no way to scope a header to preview
  vs. production — the same file ships to both — so a staging-only Report-Only CSP would
  require a Pages Function or a separate `_headers` file in a subdirectory, both out of
  scope for this static stack. The enforced CSP already report-uri's to the platform
  endpoint, so violations are captured regardless.
- **`Surrogate-Control` is origin-only.** Cloudflare's own proxy strips it before the
  response reaches the browser (RFC 3040); it exists for the edge cache, not for the
  visitor's cache, and must not be read as browser-facing.
- Dev/audit surfaces (`/audit/*`, `/_archive/*`, `/remediation/*`, `/tests/*`,
  `/.dev-tools/*`, and the catch-all `/.*`) carry `X-Robots-Tag: noindex, nofollow` and
  `Cache-Control: no-store` as defence in depth, on top of those paths simply not
  existing in `dist/` per the allowlist build (§1).

## 6. Known incidents — full detail

These four are the reason the gates above exist. Get the detail right; a vague
paraphrase loses the exact mechanism that made each one reproducible.

### Incident 1 — CSS minifier silently deleted the responsive layer (2026-08-01, P0)

`csso` (the CSS minifier previously used in the build) could not parse Tailwind v4's
Media Queries Level 4 range syntax, `@media (width >= 40rem)`. Measured on
`Assets/css/sovereign-core-v2.compiled.css`, the sheet every page loads:

| | Source | After `csso` |
|---|---|---|
| Distinct `@media` | 8 | 2 |
| `@media` blocks | 158 | 2 |
| Rules | 1,633 | 989 |

**156 of 158 `@media` blocks and 644 rules were deleted. `csso` threw no error and
returned a non-empty string**, so the only check that existed at the time — "did the
minifier throw, and is the output non-empty" — passed. Production shipped a site with
essentially no responsive layer. **Localhost looked correct because it serves source;
production served the gutted `dist/` output.** That "works on localhost, broken live"
signature is exactly what a build-vs-source discrepancy produces, and is why
`TESTING-AND-QUALITY-GATES.md` §6 flags that the CI Lighthouse/axe jobs currently serve
`.` rather than `dist/` — the same discrepancy could hide there too.

esbuild's CSS minifier was tried as an alternative: it parses the range syntax
correctly and preserved that one file exactly, but dropped 57 selectors elsewhere. For
a defect about correctness, "better than csso" was judged not good enough.

**Fix:** CSS is comment-stripped by postcss (AST-based comment-node removal, verified
lossless across all 34 stylesheets) and never run through a minifier. A build gate
(`TESTING-AND-QUALITY-GATES.md` §2.4) now fails the build if any shipped stylesheet has
fewer rules or fewer `@media` blocks than its source, counted textually rather than
parsed — deliberately, so the gate itself can never be blind to a syntax it does not
understand. Full rationale: `specs/architecture/ADR/0002-no-css-minification.md`.

### Incident 2 — non-deterministic file bytes broke the asset-hash lock (2026-08-01/02)

`core.autocrlf=true` with no `.gitattributes` meant a text file's checked-out bytes
depended on where the checkout happened. Measured on
`Assets/brand/integrations/color-okta.svg`: 274 bytes/LF in the working tree that
recorded the lock, 275 bytes/CRLF in a fresh clone — a different hash from one byte of
line-ending difference. **Every Cloudflare Pages build clones fresh, so every deploy
disagreed with a lock recorded from the edited working tree. Four consecutive deploys
failed on the immutable-cache guard while the pushes themselves appeared to succeed** —
the failure surfaced only inside the build step, silently, from the deploying operator's
perspective.

**Fix:** `.gitattributes` (`* text=auto eol=lf`, plus explicit `binary` markers for
image/font/document formats) makes the working tree match the repository on every
platform. **Diagnostic technique that found this and is worth reusing for any
"works locally, fails in Cloudflare" report:** clone to a fresh temporary directory and
run `npm ci && npm run build` there — never in a working tree that has been hand-edited,
since that is precisely the state that will not match what Cloudflare clones.

### Incident 3 — conflicting `cdn-cache-control` headers, concatenated not overridden (2026-08-01)

Covered mechanically in §4.1. Root cause of the visible symptom: a new homepage was
deployed and **the owner could not see it for 87 minutes** on `/`, `/crowmark`, and
`/pricing`, all of which returned `cf-cache-status: HIT` with an identical `Age: 5261`
(87 minutes) despite an `s-maxage=300` (5-minute) intended TTL. Cloudflare obeys
`CDN-Cache-Control` over `Cache-Control` for its own edge cache, and only the `/*.html`
rule carried it at the time — clean URLs (`/`, `/pricing`, `/about`, etc.) never match
`/*.html`, so they fell through to the stale 4-hour `Surrogate-Control` set by an
earlier, incomplete fix (2026-06-03) that changed the wrong header. A Cloudflare Pages
deployment does not purge these entries on its own. Fixed by making HTML uncacheable at
the edge unconditionally (§3.3) rather than by chasing every path pattern that could
miss `/*.html`.

### Incident 4 — `301!` ships dead (Netlify syntax on Cloudflare)

Covered in §4.2. Two prototype-homepage redirect rules shipped as `301!` and both
404'd in production for as long as they existed, because Cloudflare Pages silently
drops any `_redirects` rule whose status token it does not recognise.

## 7. Deploy checklist

1. Confirm `_redirects` rule count is still under 100:
   `grep -vE '^\s*#|^\s*$' _redirects | wc -l`.
2. Confirm no rule sits below the `/* /404.html 404` catch-all:
   `awk '/^\/\*[[:space:]]+\/404\.html/{f=1;next} f && /^\//{print NR": "$0}' _redirects`
   must print nothing.
3. Confirm any new `_headers` block that sets `Cache-Control`, `CDN-Cache-Control`, or
   `Surrogate-Control` and sits below the global `/*` block also carries the three `!`
   unset lines (§4.1).
4. Run `npm run build` and read its console output in full — it prints what was copied,
   withheld, pruned, minified, and confirms the CSS-losslessness and retired-name gates
   explicitly. A clean exit code alone does not confirm any of that was checked; the
   text of the output is the evidence.
5. If `vercel.json` or anything Vercel-related appears in a diff for this repository:
   **stop.** This repository deploys to Cloudflare Pages, not Vercel — Vercel-specific
   rules belong to `crowagent-platform`, a different repository, and do not apply here.
6. Push to `main`. Cloudflare Pages builds automatically from `main`; there is no
   separate deploy command to run.
7. After the deploy completes, purge the Cloudflare cache for any changed **HTML**
   page's URL if it is not showing the update — HTML is `no-store` at the edge (§3.3)
   so this should not normally be necessary, but confirm rather than assume if a change
   does not appear.
8. For any `/Assets/*` file whose **content** changed under an **unchanged** URL: this
   should already have failed the build (§3.2) unless
   `--accept-asset-changes` was used deliberately. If it was, confirm the change really
   was not user-visible before trusting the re-recorded lock.
