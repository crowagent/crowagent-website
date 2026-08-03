# Testing and Quality Gates: crowagent.ai

Single source of truth for every automated and manual gate that guards this repository.
Grounded in the actual configuration files as of 2026-08-02, not in what the gates were
originally intended to do. Where a gate's documented purpose and its measured behaviour
disagree, this file states the disagreement rather than the aspiration.

> **Updated 2026-08-03.** §§1–11 describe the **legacy tree at the repo root**:
> `scripts/build-dist.js`, Jest, and the Playwright suites. They did not mention the
> `astro/` build at all, and by 2026-08-03 that build carried **five** gates of its own,
> two of which (`check-content-parity.js`, `check-design-system.js`) did not exist when
> this document was written. **§12 is the `astro/` build**, and it is the one that guards
> what actually ships once the rebuild cuts over.

**Never claim a gate passed without running it.** A gate that "should pass" or "looked
fine on localhost" is not evidence. Incident 1 below is the canonical proof of why:
`csso` returned a non-empty string and threw no error while deleting 644 rules and 156
`@media` blocks from the sheet every page loads. The build reported success. The only
thing that would have caught it is counting the artefact, which is now a gate (§2.4).

## 1. Where each gate runs

**The `astro/` build gates (§12), all five of which run on every `npm run build` in `astro/`
and fail it:**

| Gate | Runs in CI? | Runs locally? | Runs pre-commit / pre-push? |
|---|---|---|---|
| `astro/scripts/check-links.js` | Not yet wired | **Yes, in `astro` `npm run build`** | No |
| `astro/scripts/check-seo-parity.js` | Not yet wired | **Yes, same** | No |
| `astro/scripts/check-content-parity.js` | Not yet wired | **Yes, same** | No |
| `astro/scripts/check-design-system.js` | Not yet wired | **Yes, same** | No |
| `astro/scripts/check-csp.js` | Not yet wired | **Yes, same** | No |

**The legacy root gates:**

| Gate | Runs in CI? | Runs locally? | Runs pre-commit / pre-push? |
|---|---|---|---|
| `npm run build` (`scripts/build-dist.js`) | Yes, Quality Gate, Lighthouse CI | Yes | No |
| `npm test` (Jest, root + `tests/unit/`) | Yes, Quality Gate | Yes | Pre-push |
| `tests/_guard.js` (content-loss guard) | No | Manually only | **No, see §5** |
| Lighthouse CI | Yes, Lighthouse CI workflow, against `.` not `dist/` (§6) | Via `lighthouserc.json` against `:8083` | No |
| axe-core (`tests/accessibility.spec.js`) | Yes, Quality Gate | Yes | No |
| Pa11y | Yes, Quality Gate, `continue-on-error: true` | Yes | No |
| `linkinator` broken-link check | Yes, Quality Gate, `continue-on-error: true` | No | No |
| `npm audit` | Yes, Quality Gate, `continue-on-error: true` | No | No |
| Snyk | Yes, Quality Gate, `continue-on-error: true` | No | No |
| `tests/responsive.spec.js` | No | `npm run test:responsive` | No |
| `tests/parity.spec.js` (legacy vs Astro) | No | Manual, two servers (§7) | No |
| `tests/smoke.spec.js` | No | Manual, `BASE_URL` env | No |
| Smoke workflow (`smoke-test.yml`) | **Disabled, see §8** | N/A | No |
| Robots guard (`scripts/verify-robots.mjs`) | Yes, Robots guard workflow | `node scripts/verify-robots.mjs` | No |
| Identity hard rule (personal name/email) | No | No | **Yes, pre-commit** |
| `.gitattributes` line-ending pin | N/A (git-level, not a script) | N/A | Applies on every checkout |

## 2. `npm run build`: `scripts/build-dist.js`

The build is not a compile step; it is a chain of independent gates. Each one is
described below with the command that runs it and the exact incident it exists to
prevent, because every one of them was added after something specific shipped broken.

### 2.1 Allowlist copy (not a denylist)

Copies only `Assets/js/blog/compare/sectors/glossary/tools/Doc/` and a fixed set of
root-file extensions into `dist/`. Existed because Cloudflare Pages was pointed at the
repository root and served 135 files under `.dev-tools/`, 70 under `tests/`, 35 under
`scripts/` and 14 under `specs/`, all publicly fetchable and returning 200. An
allowlist fails closed: a new directory is invisible until someone deliberately adds it
to `DIRS`.

Layered on top of the allowlist:
- `ASSET_DENY_DIRS` / `ASSET_DENY_FILES` withhold specific unreferenced directories and
  files even though their parent directory is allowlisted (e.g.
  `Assets/product-shots`, screenshots of retired products; `Assets/shots/_raw`, the
  screenshot harness's staging area, which was shipping straight to production).
- Every `.md` file inside a copied directory is silently dropped, authoring notes must
  never ship, and one leaked 18 mentions of retired products via a public URL.

**Command:** `npm run build` (this step has no standalone command).
**Protects against:** the dev surface and internal working files being publicly
readable on crowagent.ai.
**Measured state:** passing as of the last build; verify by re-running, not by reading
this table.

### 2.2 Reference check

After copying, every asset referenced by the built HTML, by the two injector scripts
(`js/nav-inject.js` and everything under `js/modules/`), by every stylesheet's `url()`,
by inline `<style>`/`style=""`, and by `href` attributes in XML/XSL feeds is resolved
against `dist/`. Anything missing fails the build with up to 25 examples printed.

This check is bidirectional in a second pass: `REFERENCED_ONLY_DIRS` (currently
`Assets/brand/integrations`, `Assets/blog-photos`, `Assets/css`) additionally **prune**
any file inside them that nothing references, after the missing-asset check has proven
`referenced` is complete. This caught third-party trademarks (Xero, Sage, QuickBooks,
Creditsafe, Experian logos) that remained fetchable after the page sections linking to
them were deleted.

**Protects against:** a missing stylesheet or font that nobody notices for a week; a
withdrawn image whose URL is still live.
**Known blind spots already found and closed:** `srcset` candidates (2026-07-30, 45
missed references), CSS `url()` (same date), the `<?xml-stylesheet?>` PI in
`changelog.xml` (closed the same day the CSS `@import` prune broke it). Any future
reachability prune must extend this scan rather than exempt the asset it cannot see;
that lesson has been paid for twice.

### 2.3 Immutable-cache asset-hash lock

`/Assets/*` is served `Cache-Control: public, max-age=31536000, immutable`. For any
referenced `/Assets/*` URL that carries no `?v=` query string, the build hashes the
file's bytes (sha256, first 16 hex chars) and compares against
`scripts/asset-version-lock.json` (95 tracked assets as of this writing). A changed hash
under an unchanged URL fails the build, because that content will not reach anyone who
already fetched it, including social-media OG-card scrapers, for up to a year.

**Command:** `npm run build`; to accept an intentional non-user-visible change:
`node scripts/build-dist.js --accept-asset-changes`. The preferred fix is bumping the
reference's `?v=`, because that is what actually reaches users.
**Protects against:** a corrected OG card (e.g. removing a wrong price) silently never
reaching anyone who saw the old one: this happened for 24 of 25 OG cards on 2026-07-30.
**Depends on:** deterministic file bytes across checkouts (§9, `.gitattributes`).

### 2.4 CSS losslessness gate

Compares rule count (`{` occurrences) and `@media` occurrences between every source
stylesheet in `Assets/css/` and its `dist/` counterpart, after comments are stripped
from the source side for a fair comparison. Fails the build if `dist/` has fewer rules
or fewer `@media` blocks than source.

**Command:** `npm run build`.
**Protects against:** the 2026-08-01 P0 (Incident 1, §11), CSS is now never run through
a syntax-aware minifier, and this gate is the backstop if that decision is ever
reversed. Deliberately counts braces and `@media` textually rather than parsing,
because a parser that does not understand modern CSS syntax is the exact failure being
guarded against: a smarter check could reintroduce the same blind spot it exists to
close.
**Do not "fix" a failure here by relaxing the gate.** Find what is eating the rules.

### 2.5 Dev-surface leak check

After the build, asserts none of `tests`, `.dev-tools`, `specs`, `scripts`, `docs`,
`cloudflare-workers`, `.github`, `.husky`, `node_modules`, `coverage`,
`package.json`/`package-lock.json`/`pnpm-lock.yaml` exist in `dist/`, and separately
scans for any stray `*.test.js` / `*.spec.js` / `*.config.js` file by pattern (a name
list cannot catch a new one). One such stray previously passed the name-list check and
was only caught because Jest then collected it from `dist/`.

### 2.6 Retired-product-name scan

Fails the build if `crowcyber`, `crowcash`, `crowesg`, or `crowagent core`/`crowagent-core`
appear anywhere in `dist/`, in file **names** (widened 2026-07-30 after three OG images
shipped with a retired name in the filename while the content-only scan reported clean)
or in the text content of any file with a text extension. This is a hard owner directive:
these products must not appear anywhere on the public marketing site.

### 2.7 Authoring-comment strip

Runs last. Strips HTML/XML comments (preserving conditional comments, of which none
currently exist in the tree) from every shipped `.html`/`.xml`/`.xsl` file, because
source comments in this repo carry genuine provenance intended for maintainers and are
otherwise served verbatim in view-source. Deliberately HTML/XML-only: an earlier attempt
to regex-strip CSS comments destroyed real rules (two stylesheets lost a rule each,
7 of 10 sampled pages rendered up to 3,298px taller). CSS comments are removed
separately, by postcss AST manipulation, inside §2.4's minify step, a different,
verified-lossless operation.

## 3. Jest: `npm test`

Configuration: `jest.config.js`. `testEnvironment: jest-environment-jsdom`.
`collectCoverageFrom` is `scripts.js`, `cookie-banner.js`, `js/cookie-banner.js`,
`service-worker.js` only; no other source file is measured for coverage.

Per-file coverage floors (not a global floor, by design: a global floor bounces on the
boundary and does not identify which file regressed):

| File | Lines | Statements | Functions | Branches |
|---|---|---|---|---|
| `scripts.js` | 59 | 55 | 55 | 42 |
| `cookie-banner.js` (root shim) | 80 | 62 | 60 | 45 |
| `js/cookie-banner.js` (canonical) | 55 | 50 | 55 | 35 |
| `service-worker.js` | 90 | 90 | 80 | 80 |

Floors are set "just below the actual measured coverage" (floor-of-current policy), not
at a target the team is working towards. **A floor moving down is not automatically a
regression**; it may be a legitimate re-baseline after deleting code that was disproportionately
well-covered (documented 2026-07-30: removing the announce-bar dismiss handler dropped
`scripts.js` branch coverage 45.21% → 43.84% because that block was near-fully covered
while the file average was lower).

`testPathIgnorePatterns` excludes `/tests/(?!unit\/)/`, i.e. everything under `tests/`
**except** `tests/unit/`, because the bare `tests/` directory also hosts Playwright specs
that Jest must never execute.

Jest test files, counted by file (test-block counts are `grep -c "test(\|it("`, a rough
proxy, not a substitute for running the suite):

| File | Approx. test blocks |
|---|---|
| `crowagent.test.js` (root) | 75 |
| `tests/unit/cookie-banner.test.js` | 28 |
| `scripts.test.js` (root) | 33 |
| `tests/unit/service-worker.test.js` | 4 |
| `scripts-sw-register.test.js` (root) | 4 |
| `tool-teaser-parity.test.js` (root) | 4 |

`MODERNISATION-ARCHITECTURE.md` §6 states "147 passing" as the current baseline for the
Astro rebuild's success bar. That number was not re-run to produce this document (see
the scope note at the top of this file); treat it as the architecture doc's claim, not
this document's independent verification.

**Command:** `npm test` (CI adds `-- --ci`). Pre-push hook (`.husky/pre-push`) runs
`npm test` unconditionally unless `SKIP_PREPUSH_TESTS=1` is set.

## 4. Playwright suites

Configuration: `playwright.config.js`. `baseURL` defaults to `https://crowagent.ai`, so
**most Playwright specs target production by default** unless `BASE_URL` is overridden.
None of these run in CI; all are manual/local only.

| Spec | Purpose | Notes |
|---|---|---|
| `tests/smoke.spec.js` | Nav, CTAs, contact form, cookie banner, blog posts against `BASE_URL` | Rewritten 2026-08-01 to drop tests for withdrawn products/features that could only pass (e.g. a CSRD wizard test that followed a redirect and asserted on whatever landed) |
| `tests/accessibility.spec.js` | axe-core `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa` on 13 named routes | **Does not assert `response.status() === 200`** on any route (see §6 gap) |
| `tests/responsive.spec.js` | 8 viewports × 12 pages: overflow, title length, nav visibility | **Explicitly asserts `response?.status()` `toBe(200)`**, added 2026-08-01, see §6 |
| `tests/parity.spec.js` | Legacy vs Astro rebuild, per route | See §7 |
| `tests/sweep-6x6.spec.js`, `tests/visual-audit.spec.js`, `tests/e2e-3g-perf.spec.js` | Ad hoc visual/perf sweeps | Not part of the CI gate |
| `tests/visual-regression/*.js` | Full-page snapshot baselines, 12 routes, Chromium only | `npm run test:visual`, tolerance `maxDiffPixelRatio: 0.02` |
| `tests/cross-browser/*.js` | Chromium/Firefox/WebKit smoke matrix | `npm run test:cross-browser` |

## 5. `tests/_guard.js`: content-loss guard is currently orphaned

`tests/_guard.js` compares a staged `.html` file's visible text length and "substance
links" (product/tool page links) against the currently-committed `HEAD` version, and is
meant to block a commit that silently drops more than 15% of visible text or a
product/tool link.

**This file is documented as a pre-commit hook (its own header says "The pre-commit
hook calls: `node tests/_guard.js <staged .html files...>`") but is not invoked
anywhere.** Checked: `.husky/pre-commit` (identity checks only, see §5a), `.husky/pre-push`
(`npm test` only), `package.json` scripts, and `.github/workflows/*.yml`; none of them
reference `tests/_guard.js`. It runs only if someone calls it by hand. **Do not cite it
as an active gate.**

### 5a. Pre-commit hook: what it actually does

`.husky/pre-commit` enforces the platform identity hard rule only: blocks a commit
whose author identity is not `Crow Agent <crowagent.platform@gmail.com>`, and separately
greps staged diffs (excluding `CLAUDE.md` files and `.husky/**`) for the personal name
or personal Gmail address. It performs no content, build, or test check of any kind.

### 5b. Pre-push hook

`.husky/pre-push` runs `npm test` (Jest only, no Playwright, no `npm run build`)
before allowing a push, unless `SKIP_PREPUSH_TESTS=1` is set. Its own comment
("Website build is a no-op, assets pre-built & committed") predates the current
`scripts/build-dist.js` pipeline and is stale (the build is not a no-op), but the hook
does not run the build regardless, so the comment's inaccuracy has no functional effect
today.

## 6. Gaps found in this pass: documented, not fixed here

These are real, currently-existing gaps between what a gate is supposed to catch and
what it actually tests. Recorded because this document's job is to be grounded in what
the repo actually does.

- **`quality-gate.yml` and `lighthouse-ci.yml` build `dist/` and then serve `.` (the
  repository root), never `dist/.`** Both workflows run `npm run build` and then
  `npx serve . -l 8080`. Every Lighthouse, axe, and Pa11y check in CI therefore runs
  against unbuilt source, comment-carrying CSS, unminified JS, whatever the allowlist
  would have withheld, not against the artefact Cloudflare Pages actually serves. This
  is precisely the class of defect Incident 1 (§11) was: "localhost looked right because
  it serves source; production served dist." CI, as configured, could not have caught
  that incident even after `npm run build` ran, because it never looked at `dist/`.
- **`tests/accessibility.spec.js` asserts no status code.** `page.goto()`'s response is
  discarded. A route that 404s renders the site's branded 404 page, which itself has no
  serious axe violations, so a dead route in the `PAGES` list would pass silently. This
  is exactly what happened to `tests/responsive.spec.js` before its 2026-08-01 fix (see
  Incident 5, §11) and to a `visual-regression` baseline for `crowcyber` the same day.
  The accessibility spec's own fix on 2026-08-01 was to replace the four dead routes
  with live ones, not to add a status assertion, so the same failure mode can recur the
  next time a route is retired without anyone updating this list.
- **Lighthouse threshold claims do not match the enforced config.** `quality-gate.yml`
  and `lighthouse-ci.yml` both print "Required: perf >= 90 (mobile), a11y = 100,
  SEO = 100" in their failure-notification steps. The actual enforced thresholds, in
  `lighthouserc.json`, are `performance >= 0.30`, `accessibility >= 0.95`,
  `best-practices >= 0.90`, `seo >= 0.95`, run against the **desktop** preset. The
  echoed text in both workflows is aspirational and does not reflect what would
  actually fail the run.
- **The axe-core sweep does not request the `wcag22aa` tag.** `tests/accessibility.spec.js`
  requests `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` only. `specs/architecture/README.md`
  and `astro/src/styles/tokens.css` both state a WCAG 2.2 AA target (see
  `ACCESSIBILITY-STANDARDS.md`), but the automated gate does not check the WCAG 2.2-only
  success criteria (e.g. 2.4.11 Focus Not Obscured, 2.5.8 Target Size Minimum) even
  though `@axe-core/playwright ^4.11.3` supports the `wcag22aa` tag. WCAG 2.2 conformance
  on this site currently rests on manual review and targeted fixes referencing specific
  success criteria in code comments (e.g. the `--btn-h-sm` token comment in
  `tokens.css:101`), not on an automated tag.
- **`npm audit`, Snyk, Pa11y, and `linkinator` all run with `continue-on-error: true`**
  in `quality-gate.yml`. A failure in any of these four steps does not fail the workflow
  run or block a merge. They report; they do not gate.

## 7. `tests/parity.spec.js`: legacy vs Astro

Compares every route the Astro rebuild has ported (discovered by walking
`astro/dist/{blog,compare,sectors,glossary}` for `index.html` files, never hand-maintained)
against the same route on the legacy static site. Requires two servers already running,
which the spec does not start itself:

```
LEGACY : http://127.0.0.1:8092   (npx serve . -l 8092, repository root)
ASTRO  : http://127.0.0.1:8093   (cd astro && npm run build; npx serve astro/dist -l 8093)
```

**Hard failures** (fail the test): route missing on either side; `<title>` differs;
meta description differs; canonical differs; JSON-LD `@type` set differs; visible text
differs by more than 2% (word-multiset symmetric difference, not a positional diff);
h1 count is not exactly 1 on either side.

**Reported only, never fails:** h2/h3 counts, internal link counts, JSON-LD block count,
`scrollHeight` delta, `main`/`nav`/`footer` geometry: the rebuild is a deliberate
redesign, so layout differences are expected.

**Measured current state (`migration/VISUAL-PARITY.md`, generated 2026-08-01):**
22 routes discovered, 22 compared, **0 routes with zero hard failures, 22 with at least
one, 50 total hard-failure findings.** Every sampled row in the report shows a JSON-LD
`@type` mismatch. This is consistent with a separate finding recorded in
`SEO-STANDARDS.md`: three of the four ported layouts (`Compare.astro`, `Sector.astro`,
`Glossary.astro`) hand-assemble their own JSON-LD inline rather than importing
`astro/src/lib/schema.ts`, so their emitted `@type` set does not match legacy by
construction, not by a content bug. **The rebuild is not cutover-ready; this suite is
why, by design** (`specs/architecture/README.md` §"Honest status").

Regenerate the report: `node tests/build-parity-report.js`, after running the spec.

## 8. Smoke workflow: disabled on purpose

`.github/workflows/smoke-test.yml` declares `schedule: cron: '*/15 * * * *'`, but its
GitHub Actions **workflow state is `disabled_manually`**, confirmed via
`gh api repos/crowagent/crowagent-website/actions/workflows`, not inferred from the YAML.
A `*/15` cron would be 96 scheduled runs per day; at that cadence the workflow was a
GitHub Actions cost driver disproportionate to the value of a marketing-site uptime
check, so it was manually disabled rather than deleted. It still runs on `push: main`
and `workflow_dispatch` if re-enabled, and the file itself remains the correct
production-smoke logic (checks crowagent.ai returns 200 not a redirect, serves marketing
content not the platform app, does not load a Supabase client, and that
`app.crowagent.ai` is reachable); it is simply **run locally / manually instead of on
a schedule**. To run its checks by hand: read the four `curl`-based steps in the file
and execute them directly, or `gh workflow run smoke-test.yml` (which will not execute
while the workflow is disabled; re-enable it first via the GitHub UI or
`gh workflow enable`).

## 9. `.gitattributes`: why a content-hash gate needs deterministic bytes

The immutable-cache lock (§2.3) hashes file bytes. The machine's global git config
carries `core.autocrlf=true`, and until 2026-08-02 the repository had no `.gitattributes`,
so a text file's checked-out bytes depended on **where** it was checked out. Measured on
`Assets/brand/integrations/color-okta.svg`:

| Checkout | Bytes | Line ending | Hash |
|---|---|---|---|
| Working tree (this machine) | 274 | LF | `a78ee153dd5bab3a` |
| Fresh clone | 275 | CRLF | `825a0974fa5ce494` |

The lock was recorded from the LF working tree, so every fresh clone, including every
Cloudflare Pages build, which always clones fresh, disagreed with it. **Four
consecutive Cloudflare deploys failed on this guard while appearing to succeed locally**,
because the build ran cleanly on the machine that recorded the lock and failed on every
machine that did not.

**Fix:** `.gitattributes` now pins `* text=auto eol=lf` plus explicit `binary` markers
for image/font/document formats, so the working tree matches the repository on every
platform and the hash recorded locally is the hash Cloudflare computes.

**Diagnostic technique worth reusing for any "works locally, fails in CI/prod" report:**
clone the repo to a fresh temporary directory and run `npm ci && npm run build` there,
never in the working tree that has been edited and re-edited by hand. That reproduces
exactly what Cloudflare does; the working tree does not.

## 10. Manual verification checklist

Run before claiming any release-adjacent change is safe, in this order:

1. `npm run build`, must exit 0. Read its console output; it prints copy/deny/prune
   counts, minify byte deltas, and the lossless-CSS confirmation line. A clean exit with
   suppressed output is not the same as reading that nothing was silently dropped.
2. `npm test`, must exit 0.
3. `npx playwright test tests/accessibility.spec.js --project=chromium` against a server
   actually serving `dist/` (not `.`, see §6), e.g. `npx serve dist -l 8080` then
   `BASE_URL=http://localhost:8080`.
4. `npx playwright test tests/responsive.spec.js` against the same `dist/`-backed server.
5. For any change to a ported Astro route: `tests/parity.spec.js` per §7.
6. `node scripts/verify-robots.mjs` if `robots.txt` or Cloudflare's managed-robots
   setting changed.

## 11. Incidents these gates encode

Full detail lives with the gate each incident produced (§2.4, §9, §2.2). Summarised for
cross-reference:

1. **CSS minifier silently destroyed the responsive layer (2026-08-01, P0).** `csso`
   could not parse Tailwind v4 range syntax `@media (width >= 40rem)` and deleted 156 of
   158 `@media` blocks and 644 of 1,633 rules from `sovereign-core-v2.compiled.css`, the
   sheet every page loads, with no error, no warning, and a non-empty output string.
   Production served the gutted sheet; localhost served unbuilt source and looked
   correct. Fix: CSS is comment-stripped by postcss only, never minified (ADR 0002), plus
   the losslessness gate at §2.4.
2. **`core.autocrlf=true` with no `.gitattributes` made the asset-hash lock
   non-reproducible (2026-08-01/02).** Four consecutive Cloudflare deploys failed
   silently. Fix and diagnostic technique: §9.
3. **Cloudflare Pages concatenates `_headers` rules instead of overriding.** An asset
   matched by both the global `/*` block and a more specific rule (e.g. `/Assets/*`)
   received **both** `cdn-cache-control` values on the wire, measured live 2026-08-01:
   `cdn-cache-control: no-store` and `cdn-cache-control: public, max-age=31536000,
   immutable` both present on one response. Fix: every specific `_headers` block now
   opens with `! Cache-Control` / `! CDN-Cache-Control` / `! Surrogate-Control` to unset
   the inherited value before re-asserting it. See `DEPLOYMENT-AND-RELEASE.md`.
4. **A `301!` rule in `_redirects` ships dead.** The `!` force flag is Netlify syntax;
   Cloudflare Pages silently drops any rule whose status token it does not recognise.
   Two rules shipped as `301!` and both 404'd in production. Verified against
   `/get-cyber-essentials`, a plain `301` in the same file, which fires correctly. See
   `DEPLOYMENT-AND-RELEASE.md`.
5. **Two suites reported green while exercising the 404 page.** `tests/responsive.spec.js`
   (64 test cases across 8 viewports × dead routes) and `tests/accessibility.spec.js`
   both carried routes for retired products (`/crowcyber.html`, `/crowcash.html`,
   `/crowesg.html`, `/csrd.html`, `/products/`) that returned 404. The site's branded
   404 page has a nav, a real `<title>`, and no horizontal overflow; every assertion
   both suites made except a status check could pass against it. `responsive.spec.js`
   was fixed 2026-08-01 by adding an explicit `expect(response?.status()).toBe(200)`
   assertion (see the quoted assertion in §4); `accessibility.spec.js` was fixed by
   route substitution only, not a status assertion (§6 gap).
6. **`tests/parity.spec.js` hard-fails on title, canonical, JSON-LD `@type` set, >2%
   text change, or a wrong h1 count**, comparing every ported Astro route against
   legacy. See §7 for the current measured result (22/22 routes failing).

---

## 12. The `astro/` build gates

**These are the gates that guard what ships after cutover**, and none of §§1–11 covers them.
Added to this document 2026-08-03, verified by running each one against `astro/dist` on that
date.

```jsonc
// astro/package.json
"build": "astro build
        && node scripts/copy-assets.js
        && node scripts/copy-cf-config.js
        && node scripts/build-sitemap.js
        && node scripts/check-links.js
        && node scripts/check-seo-parity.js
        && node scripts/check-content-parity.js
        && node scripts/check-design-system.js
        && node scripts/check-csp.js"
```

Every one exits non-zero on a violation, so `&&` chaining means the build stops. **None of
them runs in CI**: no file in `.github/workflows/` mentions `astro`. They run when a human or
an agent runs the build. That is the largest single gap in the testing story and it is §12.7.

### 12.0 The contract all five share

**Arrived at four times independently before anyone named it.** Each gate was written after a
defect shipped because a gate asserted something *adjacent* to what mattered, and each landed
on the same shape:

1. An **allow-list of named exceptions**, each carrying the reason it is one.
2. The allow-list is **printed on every build**: *"an exception nobody re-reads is
   indistinguishable from a defect nobody noticed."*
3. Entries matching nothing are **reported as stale**, so the list can only shrink. Reported,
   never fatal: failing a build because a defect was *fixed* would be perverse.
4. Anything **not** on the list **fails the build**.
5. **DEBT is counted separately from DESIGN.** A reason beginning `DEBT:` prints under its own
   count and its own heading. *"Debt that is never counted is debt that is never paid."*
6. **It must be proved to fail before it is trusted.**

Keys are deliberately written **without line numbers**: a line number drifts every time
somebody edits the file above it, and an exemption that silently stops matching is how the
next real violation gets waved through.

**The list is not a snooze button.** Seeding it to get a green build makes the gate worthless,
which is precisely the failure mode it exists to prevent. And *"a reason is a sentence
somebody can disagree with, not a restatement."*

### 12.1 `check-links.js`: every internal link points at something that ships

**The gap it closes.** The sitewide suite asserts that a page's *subresources* return 2xx. It
says nothing about where the page's own links go, because a link is not fetched during a page
load. **A link to an unported route passes every check on the site and 404s the moment a
reader clicks it.**

Not hypothetical: routes are deliberately unported while their content-accuracy questions sit
with the owner, and at cutover the Astro build replaces the legacy site wholesale.

A link resolves if it hits a built page, a built file, **or a rule in `_redirects`**: the last
because *"a redirect is a deliberate decision that a URL should keep working without a page
behind it"*, and 82 such rules exist.

**Measured 2026-08-03:**

```
links: 3 target(s) do not ship yet, each blocked on an owner decision:
  /integrations          OA-10                  linked from 41/41 pages
  /roadmap               OA-13                  linked from 41/41 pages
  /cookie-preferences    no consent system yet  linked from 41/41 pages
links: every other internal link across 41 pages resolves
```

All three are in the global nav or footer, hence 41/41. `/pricing` was a fourth and shipped on
2026-08-02; its entry was **deleted rather than reworded**, which is the contract working.

### 12.2 `check-csp.js`: every origin the build references must be allowed by its own CSP

**The gap it closes.** `copy-cf-config.js` verifies that `_headers` *contains* a CSP line. It
does not verify that the policy permits what the build actually loads. **The failure mode is
silent and total:** a blocked script does not render an error, it simply does not run; a
blocked stylesheet leaves the page unstyled. Neither returns a non-2xx, so the subresource
check cannot see it: that check asks the *server* for each asset, with no policy applied. The
browser is what enforces CSP, and only in production.

**Measured 2026-08-03:** `csp: 0 external origin reference(s) across the build; none, the
build loads nothing from a third party.`

**⚠️ That result is true and incomplete, and the gap is live.** The gate scans **static
attributes only**: `<script src>`, `<link rel=stylesheet>`, `<img src>`, `<iframe src>`, and
CSS `url()` / `@import`. It cannot see a `fetch()`, an `XMLHttpRequest`, a `<form action>`, or
a script element created at runtime. Two consequences today:

1. **`/contact` and `/partners` do load a third-party origin.** Both inject
   `https://challenges.cloudflare.com/turnstile/v0/api.js` on **first focus** inside the form
   (`ContactForm.astro:302-308`, `PartnerForm.astro:273-279`). That is a deliberate, measured
   decision: cold, `/contact` was 419 KB of which 344 KB was the challenge widget: and the
   shipped CSP **does** permit it in `script-src` and `frame-src`. So it is correct behaviour
   that the gate simply cannot see. The accurate claim is *zero third-party origins at first
   paint on all 41 routes*, not *zero third-party origins*.
2. **`PartnerForm` submits to an origin the CSP blocks.** `PartnerForm.astro:354` calls
   `fetch(form.action)` against `https://formspree.io/f/xbdpkaol`, with an `action=` attribute
   at line 114 as the no-JS fallback. The shipped policy has
   `connect-src 'self' https://crowagent.ai https://app.crowagent.ai …` and
   `form-action 'self' https://app.crowagent.ai`. **Neither names `formspree.io`.** In
   production the submission is blocked, silently, exactly as this gate's own header describes.
   A comment at `_headers:34` reads *"form-action restricted to self + formspree"*, so the
   intent was recorded and the origin was then dropped from the directive.

**The fix is a ~30-line extension:** scan inline scripts for `fetch(`, `.src =`,
`XMLHttpRequest` and `action=` with an absolute URL, and check each against `connect-src`,
`form-action` and `script-src`. It would have caught both.

**Separately, the CSP itself is stale.** It still allows `assets.calendly.com`,
`eu.posthog.com`, `eu.i.posthog.com`, `eu-assets.i.posthog.com`, `calendly.com` and
`crowagent-platform-production.up.railway.app`, all legacy-site origins that the Astro build
never touches. That is not a break; it is a wider policy than the build needs, and it is the
opposite of the property the gate exists to protect.

### 12.3 `check-seo-parity.js`: no metadata is lost against the legacy page

Compares titles, descriptions, canonicals, `og:*`, `lang` and structured-data **types** between
each legacy route in the root `dist/` and its Astro replacement in `astro/dist/`.

Deliberate divergences are listed with a reason. Measured 2026-08-03, the tail of its own
output: `nothing lost: every title, description, canonical, og tag, lang and structured-data
type on a legacy page is still present on its Astro replacement.` Around 22 routes carry a
recorded, intentional difference (a reworded `title`, a corrected `description`, a replaced
`ogImage`).

**What it caught that nothing else would have:** all 8 ported blog posts emitting only an
`Organization` node where legacy emitted `BlogPosting` and `FAQPage`. **Live SEO surface that
would have been destroyed silently at cutover.** The fix went into `layouts/Article.astro`
rather than into 8 files, *"which is the difference between closing the gap and closing it in a
way that cannot reopen."*

### 12.4 `check-content-parity.js`: no capability is lost against the legacy page

**Written 2026-08-02. The charter's list did not know about it.**

**The gap it closes, in the file's own words:** `check-seo-parity.js` compares metadata,
`check-links.js` resolves link targets, `check-csp.js` checks headers. **Not one of them looks
at what is actually on the page**, so 38 routes passed every gate on three browser engines
while whole blocks were missing:

```
/contact  lost "Send us an email", "What you will see on the call", and
          "Prefer regulatory updates?" — the newsletter signup.
          Document height 6725px -> 2416px, seven <section>s -> two.
/about    lost "Get monthly UK procurement digests" — the same newsletter
          block. 7038px -> 4834px.
```

**The newsletter signup is a lead-capture mechanism. Losing it is a commercial regression, not
a styling one, and nothing in the build said a word.** That is OA-28.

**It is not a diff of words.** The rebuild rewrote copy on purpose, so prose is not compared at
all. It asserts that three kinds of thing that existed still exist, and each is *a capability a
reader had and no longer has*:

| Signal | What it means |
|---|---|
| **HEADING** | an `h1`–`h4` whose text has no close counterpart: a section to navigate to |
| **FORM CONTROL** | an `input`/`select`/`textarea` with no counterpart: a field to type in |
| **LINK TARGET** | an `href` the legacy page offered: a place to go |

**Source HTML, not rendered text.** An early version compared rendered `innerText` and reported
nine paragraphs "lost" from `/terms` and five from `/security`. **All nine were present**: inside
`<details>` elements, which `innerText` omits because they are collapsed. Parsing shipped HTML
counts collapsed accordions, tab panels and anything else hidden at first paint, **which is
exactly the content most likely to be dropped unnoticed.** The same reasoning is why
`check-design-system.js` reads `dist/` rather than a browser.

**A consequence worth knowing.** On the legacy site the nav and footer are injected at runtime
by `js/nav-inject.js` and the cookie banner by `js/cookie-banner.js`, so none of them is in the
legacy *source* and none is compared. That is the correct outcome, not a workaround: the Astro
site ships its own nav and footer as real markup, and it sets no cookies, so it needs no consent
banner. Comparing runtime chrome would report 38 identical false losses and train the reader to
skim the output.

**Measured 2026-08-03:** 7 allowed losses, each with a reason, plus **1 stale entry** to delete
(`/  heading: your evidence already exists. we read it where it lives.`, the content is back).
**21 entries were deleted on 2026-08-02** when `RelatedPosts.astro` and `ShareRow.astro`
restored the rail and the share rows on all 8 posts.

### 12.5 `check-design-system.js`: the design system is enforced by the build

**Written 2026-08-02. The charter's list did not know about it.** It exists because of a direct
owner criticism:

> *"So much content and text still showing left aligned. I think there is a serious issue if we
> cannot control all such things centrally despite moving into new architecture, and I can see
> the same pain points. I am not sure if you are doing things manually crafted, or following and
> enforcing centrally a design system and best practices."*

**That is the correct diagnosis.** Every parity fix to that point had been a manual sweep:
measure at 1440 across 24 routes, fix, drift, measure again. Card recipes went 21 to 3 to 1 and
heading recipes 15 to 9 to 6 that way, and nothing in the build held either number.

**Five rules:**

| # | Rule | From |
|---|---|---|
| 1 | **ALIGNMENT**; a card is scanned, so its content centres; prose is read, so it stays left | `OWNER-FEEDBACK-LOG.md` decision 9, `surfaces.css:92` |
| 2 | **TYPE SCALE**: four heading sizes, one weight per tier, all from `tokens.css` | audit A5 |
| 3 | **CARD RECIPE**; one card sitewide: `--radius-card` and `--blk-pad`, via `.surface` | audit A3 |
| 4 | **TOKENS**: no hardcoded hex, `font-size` or `max-width` outside the token block | `tokens.css` |
| 5 | **HEADINGS**: one `<h1>` per route, no skipped levels | also `tests/heading-structure.spec.js` |

**Evidence is split, and both halves are load-bearing.** Markup rules read the **built HTML in
`dist/`**, for the `innerText` reason in §12.4. CSS rules read the **source stylesheets in
`src/`**, for two reasons: a bundle can say a hardcoded hex exists and cannot say where it was
written, and `copy-assets.js` copies the *legacy* stylesheets into `dist/`, whose 2,279
`!important` declarations would bury every real finding.

**No browser, deliberately.** Playwright is available and 41 routes would cost tens of seconds
on every build, *"and a gate that is slow is a gate somebody eventually takes out of `npm run
build`."* Everything is derived from text and runs in well under a second.

**Two exemptions that are correct and non-obvious:**

- **A colour inside a `mask` is not a colour.** `mask: linear-gradient(#000 0 0)` is the
  standard mask-composite idiom: only the alpha channel is read, so the `#000` is the number 1
  written in the only syntax the property accepts. Reporting it would push somebody to replace
  it with a brand colour that behaves identically and reads as though it meant something.
- **Rebinding a token name is not a hardcoded colour.** `Article.astro`'s light pane sets
  `--c-bg`, `--c-text` and four more to light values on one element. That is the palette
  re-scoped, and rejecting it would push the light theme into a second set of rules. **You may
  re-scope the palette; you may not invent a member of it.**

**Measured 2026-08-03 at 00:45**, `cd astro && node scripts/check-design-system.js`:

> **These four numbers are a snapshot of a moving target, and that is the point of the gate.**
> Re-measured 35 minutes later, on the same day, the debt count had already fallen from **9 to 7**
> and the unrecorded violation was gone, because another agent was editing
> `pages/crowmark-buyers.astro`, `pages/crowmark.astro` and `pages/about.astro` at the time.
> **Do not quote the figures below as current. Run the gate.** What is durable is the *shape* of
> the output and what each number means.

```
40 route(s), 1589 rule(s) in 46 stylesheet(s)
cards: 197 .surface, 123 centred, 34 holding a list, table, form, code or disclosure

18 recorded exception(s), each with the argument for it
 9 KNOWN DEBT — recorded, named, and still wrong
 5 allow-list entr(ies) matched nothing — delete them
 1 DESIGN SYSTEM VIOLATION, NOT RECORDED  ->  exit 1
```

**The nine debt items** are all rule 4, and all one-line changes:

| File | Item |
|---|---|
| `components/nav/Nav.astro` | `font-size: 11px`, the Cmd-K key cap, below every tier |
| `components/footer/Footer.astro` | `font-size: 10px`, the "free" chip, the only 10px on the site |
| `components/sections/MarketShape.astro` | a restated `clamp()` in a responsive override where the base rule correctly uses `--t-numeral` |
| `components/forms/NewsletterForm.astro` | `max-width: 520px` |
| `pages/about.astro` | `max-width: 720px`, 5px from `--measure-prose` |
| `pages/faq.astro` | `max-width: 460px` |
| `pages/tools/ppn-002-calculator/index.astro` | `max-width: 560px` |
| `pages/crowmark-buyers.astro` | hardcoded `#E8B84B` |
| `pages/tools/ppn-002-calculator/index.astro` | the same `#E8B84B`, in a second file |

**The two amber entries are now fixable.** They were blocked on an owner decision: the palette
had teal, violet, orchid and cyan, and no fourth mark. `tokens.css:437-499` records the decision
and defines `--c-amber: #E8B84B`, measured against all four surface steps (worst case 9.24:1)
and matched to teal and cyan on CIE L*. **The token exists; the two files have not been changed
to use it.**

**The gate fails as it stands.** One unrecorded violation against the current `dist/`:

```
ALIGNMENT  /blog/  feat.surface.surface--pad.surface--read
           1 card(s) opted out of centring with surface--read
```

`surface--read` silences the CSS but deliberately **does not** silence the gate, *"because a
marker in a class list is not a reason"*. Someone added the class without adding the argument,
which is the gate doing exactly its job.

**Five stale entries**, all in `Nav.astro` and `Footer.astro` (`1.05rem`, `0.8125rem`,
`1.15rem`), meaning those off-scale sizes were fixed and the exemptions should be deleted.

**What it cannot see, stated rather than implied.** It checks the **source** of a value, not the
pixel it renders to. It cannot catch a heading pushed off the scale by an inherited `em`, by a
specificity fight, or by a token whose own definition changed. What it *does* assert: that every
heading's `font-size` is a `--t-*` token: **bounds** the set of rendered sizes by the token set,
so it cannot drift one component at a time, which is how it reached 15 recipes. Rendered-px
verification stays with Playwright, where a browser is already paid for.

### 12.6 The build steps that are not checks but fail like them

| Script | Guards |
|---|---|
| `copy-assets.js` | Copies **by reachability**, not wholesale. That is why the eight blog photographs, licensed, resized to a 400/600/800/1200 ladder, and credited, had **never** shipped: until `PostImage.astro` existed, nothing referenced them |
| `copy-cf-config.js` | Verifies `_headers` contains a CSP line at all. `check-csp.js` then checks it means something |
| `build-sitemap.js` | 40 `<loc>` entries for 41 routes; `/404` is correctly excluded |
| Zod schemas in `content.config.ts` | A missing required field fails the build |
| `heroFor()` in `heroes.ts` | A post with no hero image throws and names the file |
| `RelatedPosts.astro` | A related slug that no longer exists throws, rather than shipping a card that 404s |
| `convert-legal.js` | **Refuses to write** a legal document whose visible text is not token-identical to the legacy source. 32,594 characters verified across four documents |

### 12.7 Gaps in the `astro/` gates: stated, not fixed

Ordered by what their absence has already cost.

1. **None of the five runs in CI.** No workflow in `.github/workflows/` mentions `astro`. Every
   gate depends on a human or an agent running `npm run build` in `astro/`. They are the only
   thing standing between the rebuild and a silent content loss at cutover.
2. **`check-csp.js` cannot see runtime origins**, and there is a live consequence: `PartnerForm`'s
   submission is CSP-blocked in production. §12.2.
3. **The design-system gate currently fails**, and its allow-list has five stale entries and nine
   debt items, two of which are now unblocked. §12.5.
4. **Nothing checks the copy rules.** No em-dash scan, no currency check, no UK-spelling check.
   Measured 2026-08-03: **15 em-dashes in visible text across `/crowmark`, `/tools` and
   `/tools/ppn-002-calculator/methodology`.** A ~20-line scan over `dist/` would catch all of
   them. `CODING-STANDARDS.md` §5.1.
5. **Nothing checks the `@layer` restatement**, and its absence has already produced a
   route-specific cascade inversion on `/terms`. A ~10-line check over `src/styles/*.css`.
   `CODING-STANDARDS.md` §2.2.
6. **Nothing measures anything responsive.** No overflow check, no target-size check, no rendered
   px. `tests/responsive.spec.js` exists but targets the legacy tree and measures a **settled**
   page, which cannot see the class of overflow that only exists mid-animation.
   `RESPONSIVE-STANDARDS.md` §4.2 gives the scrubbing method.
7. **No accessibility gate runs against `astro/dist`.** `tests/accessibility.spec.js` runs axe on
   13 named routes of the **legacy** tree. The rebuild's contrast, focus order and heading outline
   are covered only by rule 5 of the design-system gate and by manual checks.
8. **No performance gate.** `PERFORMANCE-BUDGETS.md` sets per-route ceilings; nothing asserts
   them. One image is already over the 250 KB single-file budget at 371 KB.
