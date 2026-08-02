# Testing and Quality Gates — crowagent.ai

Single source of truth for every automated and manual gate that guards this repository.
Grounded in the actual configuration files as of 2026-08-02, not in what the gates were
originally intended to do. Where a gate's documented purpose and its measured behaviour
disagree, this file states the disagreement rather than the aspiration.

**Never claim a gate passed without running it.** A gate that "should pass" or "looked
fine on localhost" is not evidence. Incident 1 below is the canonical proof of why:
`csso` returned a non-empty string and threw no error while deleting 644 rules and 156
`@media` blocks from the sheet every page loads. The build reported success. The only
thing that would have caught it is counting the artefact, which is now a gate (§2.4).

## 1. Where each gate runs

| Gate | Runs in CI? | Runs locally? | Runs pre-commit / pre-push? |
|---|---|---|---|
| `npm run build` (`scripts/build-dist.js`) | Yes — Quality Gate, Lighthouse CI | Yes | No |
| `npm test` (Jest, root + `tests/unit/`) | Yes — Quality Gate | Yes | Pre-push |
| `tests/_guard.js` (content-loss guard) | No | Manually only | **No — see §5** |
| Lighthouse CI | Yes — Lighthouse CI workflow, against `.` not `dist/` (§6) | Via `lighthouserc.json` against `:8083` | No |
| axe-core (`tests/accessibility.spec.js`) | Yes — Quality Gate | Yes | No |
| Pa11y | Yes — Quality Gate, `continue-on-error: true` | Yes | No |
| `linkinator` broken-link check | Yes — Quality Gate, `continue-on-error: true` | No | No |
| `npm audit` | Yes — Quality Gate, `continue-on-error: true` | No | No |
| Snyk | Yes — Quality Gate, `continue-on-error: true` | No | No |
| `tests/responsive.spec.js` | No | `npm run test:responsive` | No |
| `tests/parity.spec.js` (legacy vs Astro) | No | Manual, two servers (§7) | No |
| `tests/smoke.spec.js` | No | Manual, `BASE_URL` env | No |
| Smoke workflow (`smoke-test.yml`) | **Disabled — see §8** | N/A | No |
| Robots guard (`scripts/verify-robots.mjs`) | Yes — Robots guard workflow | `node scripts/verify-robots.mjs` | No |
| Identity hard rule (personal name/email) | No | No | **Yes — pre-commit** |
| `.gitattributes` line-ending pin | N/A (git-level, not a script) | N/A | Applies on every checkout |

## 2. `npm run build` — `scripts/build-dist.js`

The build is not a compile step, it is a chain of independent gates. Each one is
described below with the command that runs it and the exact incident it exists to
prevent, because every one of them was added after something specific shipped broken.

### 2.1 Allowlist copy (not a denylist)

Copies only `Assets/js/blog/compare/sectors/glossary/tools/Doc/` and a fixed set of
root-file extensions into `dist/`. Existed because Cloudflare Pages was pointed at the
repository root and served 135 files under `.dev-tools/`, 70 under `tests/`, 35 under
`scripts/` and 14 under `specs/` — all publicly fetchable and returning 200. An
allowlist fails closed: a new directory is invisible until someone deliberately adds it
to `DIRS`.

Layered on top of the allowlist:
- `ASSET_DENY_DIRS` / `ASSET_DENY_FILES` withhold specific unreferenced directories and
  files even though their parent directory is allowlisted (e.g.
  `Assets/product-shots`, screenshots of retired products; `Assets/shots/_raw`, the
  screenshot harness's staging area, which was shipping straight to production).
- Every `.md` file inside a copied directory is silently dropped — authoring notes must
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
reachability prune must extend this scan rather than exempt the asset it cannot see —
that lesson has been paid for twice.

### 2.3 Immutable-cache asset-hash lock

`/Assets/*` is served `Cache-Control: public, max-age=31536000, immutable`. For any
referenced `/Assets/*` URL that carries no `?v=` query string, the build hashes the
file's bytes (sha256, first 16 hex chars) and compares against
`scripts/asset-version-lock.json` (95 tracked assets as of this writing). A changed hash
under an unchanged URL fails the build, because that content will not reach anyone who
already fetched it — including social-media OG-card scrapers — for up to a year.

**Command:** `npm run build`; to accept an intentional non-user-visible change:
`node scripts/build-dist.js --accept-asset-changes`. The preferred fix is bumping the
reference's `?v=`, because that is what actually reaches users.
**Protects against:** a corrected OG card (e.g. removing a wrong price) silently never
reaching anyone who saw the old one — this happened for 24 of 25 OG cards on 2026-07-30.
**Depends on:** deterministic file bytes across checkouts (§9, `.gitattributes`).

### 2.4 CSS losslessness gate

Compares rule count (`{` occurrences) and `@media` occurrences between every source
stylesheet in `Assets/css/` and its `dist/` counterpart, after comments are stripped
from the source side for a fair comparison. Fails the build if `dist/` has fewer rules
or fewer `@media` blocks than source.

**Command:** `npm run build`.
**Protects against:** the 2026-08-01 P0 (Incident 1, §11) — CSS is now never run through
a syntax-aware minifier, and this gate is the backstop if that decision is ever
reversed. Deliberately counts braces and `@media` textually rather than parsing,
because a parser that does not understand modern CSS syntax is the exact failure being
guarded against — a smarter check could reintroduce the same blind spot it exists to
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
appear anywhere in `dist/` — in file **names** (widened 2026-07-30 after three OG images
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
separately, by postcss AST manipulation, inside §2.4's minify step — a different,
verified-lossless operation.

## 3. Jest — `npm test`

Configuration: `jest.config.js`. `testEnvironment: jest-environment-jsdom`.
`collectCoverageFrom` is `scripts.js`, `cookie-banner.js`, `js/cookie-banner.js`,
`service-worker.js` only — no other source file is measured for coverage.

Per-file coverage floors (not a global floor, by design — a global floor bounces on the
boundary and does not identify which file regressed):

| File | Lines | Statements | Functions | Branches |
|---|---|---|---|---|
| `scripts.js` | 59 | 55 | 55 | 42 |
| `cookie-banner.js` (root shim) | 80 | 62 | 60 | 45 |
| `js/cookie-banner.js` (canonical) | 55 | 50 | 55 | 35 |
| `service-worker.js` | 90 | 90 | 80 | 80 |

Floors are set "just below the actual measured coverage" (floor-of-current policy), not
at a target the team is working towards. **A floor moving down is not automatically a
regression** — it may be a legitimate re-baseline after deleting code that was disproportionately
well-covered (documented 2026-07-30: removing the announce-bar dismiss handler dropped
`scripts.js` branch coverage 45.21% → 43.84% because that block was near-fully covered
while the file average was lower).

`testPathIgnorePatterns` excludes `/tests/(?!unit\/)/` — i.e. everything under `tests/`
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

Configuration: `playwright.config.js`. `baseURL` defaults to `https://crowagent.ai` —
**most Playwright specs target production by default** unless `BASE_URL` is overridden.
None of these run in CI; all are manual/local only.

| Spec | Purpose | Notes |
|---|---|---|
| `tests/smoke.spec.js` | Nav, CTAs, contact form, cookie banner, blog posts against `BASE_URL` | Rewritten 2026-08-01 to drop tests for withdrawn products/features that could only pass (e.g. a CSRD wizard test that followed a redirect and asserted on whatever landed) |
| `tests/accessibility.spec.js` | axe-core `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa` on 13 named routes | **Does not assert `response.status() === 200`** on any route (see §6 gap) |
| `tests/responsive.spec.js` | 8 viewports × 12 pages: overflow, title length, nav visibility | **Explicitly asserts `response?.status()` `toBe(200)`** — added 2026-08-01, see §6 |
| `tests/parity.spec.js` | Legacy vs Astro rebuild, per route | See §7 |
| `tests/sweep-6x6.spec.js`, `tests/visual-audit.spec.js`, `tests/e2e-3g-perf.spec.js` | Ad hoc visual/perf sweeps | Not part of the CI gate |
| `tests/visual-regression/*.js` | Full-page snapshot baselines, 12 routes, Chromium only | `npm run test:visual`, tolerance `maxDiffPixelRatio: 0.02` |
| `tests/cross-browser/*.js` | Chromium/Firefox/WebKit smoke matrix | `npm run test:cross-browser` |

## 5. `tests/_guard.js` — content-loss guard is currently orphaned

`tests/_guard.js` compares a staged `.html` file's visible text length and "substance
links" (product/tool page links) against the currently-committed `HEAD` version, and is
meant to block a commit that silently drops more than 15% of visible text or a
product/tool link.

**This file is documented as a pre-commit hook (its own header says "The pre-commit
hook calls: `node tests/_guard.js <staged .html files...>`") but is not invoked
anywhere.** Checked: `.husky/pre-commit` (identity checks only, see §5a), `.husky/pre-push`
(`npm test` only), `package.json` scripts, and `.github/workflows/*.yml` — none of them
reference `tests/_guard.js`. It runs only if someone calls it by hand. **Do not cite it
as an active gate.**

### 5a. Pre-commit hook — what it actually does

`.husky/pre-commit` enforces the platform identity hard rule only: blocks a commit
whose author identity is not `Crow Agent <crowagent.platform@gmail.com>`, and separately
greps staged diffs (excluding `CLAUDE.md` files and `.husky/**`) for the personal name
or personal Gmail address. It performs no content, build, or test check of any kind.

### 5b. Pre-push hook

`.husky/pre-push` runs `npm test` (Jest only — no Playwright, no `npm run build`)
before allowing a push, unless `SKIP_PREPUSH_TESTS=1` is set. Its own comment
("Website build is a no-op, assets pre-built & committed") predates the current
`scripts/build-dist.js` pipeline and is stale — the build is not a no-op — but the hook
does not run the build regardless, so the comment's inaccuracy has no functional effect
today.

## 6. Gaps found in this pass — documented, not fixed here

These are real, currently-existing gaps between what a gate is supposed to catch and
what it actually tests. Recorded because this document's job is to be grounded in what
the repo actually does.

- **`quality-gate.yml` and `lighthouse-ci.yml` build `dist/` and then serve `.` (the
  repository root), never `dist/.`** Both workflows run `npm run build` and then
  `npx serve . -l 8080`. Every Lighthouse, axe, and Pa11y check in CI therefore runs
  against unbuilt source — comment-carrying CSS, unminified JS, whatever the allowlist
  would have withheld — not against the artefact Cloudflare Pages actually serves. This
  is precisely the class of defect Incident 1 (§11) was: "localhost looked right because
  it serves source; production served dist." CI, as configured, could not have caught
  that incident even after `npm run build` ran, because it never looked at `dist/`.
- **`tests/accessibility.spec.js` asserts no status code.** `page.goto()`'s response is
  discarded. A route that 404s renders the site's branded 404 page, which itself has no
  serious axe violations, so a dead route in the `PAGES` list would pass silently — this
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

## 7. `tests/parity.spec.js` — legacy vs Astro

Compares every route the Astro rebuild has ported (discovered by walking
`astro/dist/{blog,compare,sectors,glossary}` for `index.html` files — never hand-maintained)
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
`scrollHeight` delta, `main`/`nav`/`footer` geometry — the rebuild is a deliberate
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

## 8. Smoke workflow — disabled on purpose

`.github/workflows/smoke-test.yml` declares `schedule: cron: '*/15 * * * *'`, but its
GitHub Actions **workflow state is `disabled_manually`** — confirmed via
`gh api repos/crowagent/crowagent-website/actions/workflows`, not inferred from the YAML.
A `*/15` cron would be 96 scheduled runs per day; at that cadence the workflow was a
GitHub Actions cost driver disproportionate to the value of a marketing-site uptime
check, so it was manually disabled rather than deleted. It still runs on `push: main`
and `workflow_dispatch` if re-enabled, and the file itself remains the correct
production-smoke logic (checks crowagent.ai returns 200 not a redirect, serves marketing
content not the platform app, does not load a Supabase client, and that
`app.crowagent.ai` is reachable) — it is simply **run locally / manually instead of on
a schedule**. To run its checks by hand: read the four `curl`-based steps in the file
and execute them directly, or `gh workflow run smoke-test.yml` (which will not execute
while the workflow is disabled — re-enable it first via the GitHub UI or
`gh workflow enable`).

## 9. `.gitattributes` — why a content-hash gate needs deterministic bytes

The immutable-cache lock (§2.3) hashes file bytes. The machine's global git config
carries `core.autocrlf=true`, and until 2026-08-02 the repository had no `.gitattributes`,
so a text file's checked-out bytes depended on **where** it was checked out. Measured on
`Assets/brand/integrations/color-okta.svg`:

| Checkout | Bytes | Line ending | Hash |
|---|---|---|---|
| Working tree (this machine) | 274 | LF | `a78ee153dd5bab3a` |
| Fresh clone | 275 | CRLF | `825a0974fa5ce494` |

The lock was recorded from the LF working tree, so every fresh clone — including every
Cloudflare Pages build, which always clones fresh — disagreed with it. **Four
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

1. `npm run build` — must exit 0. Read its console output; it prints copy/deny/prune
   counts, minify byte deltas, and the lossless-CSS confirmation line. A clean exit with
   suppressed output is not the same as reading that nothing was silently dropped.
2. `npm test` — must exit 0.
3. `npx playwright test tests/accessibility.spec.js --project=chromium` against a server
   actually serving `dist/` (not `.` — see §6), e.g. `npx serve dist -l 8080` then
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
   158 `@media` blocks and 644 of 1,633 rules from `sovereign-core-v2.compiled.css` — the
   sheet every page loads — with no error, no warning, and a non-empty output string.
   Production served the gutted sheet; localhost served unbuilt source and looked
   correct. Fix: CSS is comment-stripped by postcss only, never minified (ADR 0002), plus
   the losslessness gate at §2.4.
2. **`core.autocrlf=true` with no `.gitattributes` made the asset-hash lock
   non-reproducible (2026-08-01/02).** Four consecutive Cloudflare deploys failed
   silently. Fix and diagnostic technique: §9.
3. **Cloudflare Pages concatenates `_headers` rules instead of overriding.** An asset
   matched by both the global `/*` block and a more specific rule (e.g. `/Assets/*`)
   received **both** `cdn-cache-control` values on the wire — measured live 2026-08-01:
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
   404 page has a nav, a real `<title>`, and no horizontal overflow — every assertion
   both suites made except a status check could pass against it. `responsive.spec.js`
   was fixed 2026-08-01 by adding an explicit `expect(response?.status()).toBe(200)`
   assertion (see the quoted assertion in §4); `accessibility.spec.js` was fixed by
   route substitution only, not a status assertion (§6 gap).
6. **`tests/parity.spec.js` hard-fails on title, canonical, JSON-LD `@type` set, >2%
   text change, or a wrong h1 count**, comparing every ported Astro route against
   legacy. See §7 for the current measured result (22/22 routes failing).
