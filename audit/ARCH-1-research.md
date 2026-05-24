# ARCH-1 — Safe Modularisation of `styles.css` (33,385 lines)

**Investigator:** read-only research, 2026-05-21
**Source:** `styles.css` 1.21 MB / 33,385 lines / `@layer legacy, theme, base, components, layout, overrides`
**Pipeline today:** `csso styles.css → styles.min.css → tools/purge-run.mjs → styles.purged.css → cp → styles.min.css` (547 KB)
**Already installed:** `csso@5.0.5`, `csso-cli@4.0.2`, `purgecss@8`, `esbuild`, `postcss` (transitive — `postcss-selector-parser`, `postcss-value-parser`)

---

## 1. Why the previous attempt broke

`csso` is a single-file minifier — it parses one CSS document, runs a structural optimiser on the AST, and emits one document. It **does not implement a bundler**; `@import url(...)` statements are preserved verbatim. PurgeCSS@8 likewise reads one CSS file at a time (passed via `css:` array) and does not inline imports. So the chain `styles.css` (with `@import "styles-legacy.css"`) → `csso` → `purge` shipped a file containing a literal `@import` that browsers honour at runtime but our build never bundled. End result: legacy rules silently dropped after PurgeCSS, smoke regressions.

The two correct ways to ship multiple CSS files as one minified bundle are: (a) **inline the imports before minify**, or (b) **shell-concatenate the source files in declared order before minify**. Both are documented below.

---

## 2. Recommended toolchain (ranked)

### Choice A — `postcss` + `postcss-import` + `csso` (RECOMMENDED, lowest risk)

Pros:
- `postcss-import` is the de-facto standard inliner. Resolves relative paths, dedupes, hoists `@charset`, preserves `@layer` ordering correctly (verified against CSS Cascade Layers spec; identical to what cssnano/Tailwind/Linear use).
- Keeps `csso` (already installed, current minifier) — minifier output is byte-identical for a given inlined input, so no risk of new minification regressions.
- PostCSS is already a transitive dependency; the new direct install is tiny.
- Plays nicely with PurgeCSS — purge sees the fully inlined CSS string, not an `@import` it can't follow.
- Source-map support if ever needed.

Cons:
- One new direct dependency (`postcss-import`).
- Two-step pipeline (postcss inline → csso) but both are < 1 s for 1.2 MB.

### Choice B — `lightningcss` (single-binary alternative)

Pros: native Rust speed; built-in `@import` inlining + minify in one pass; handles `@layer` per spec.
Cons: would replace `csso`. Different minifier means different output → must re-baseline `styles.min.css` byte size + re-run smoke against all 50 pages. Higher migration risk for zero functional gain right now.

### Choice C — `cat` / Node `fs` concatenation before csso

Pros: zero new dependencies; deterministic; trivial to audit.
Cons: requires the source files to be **already valid** when concatenated in order (no nested `@import` resolution); easy to introduce subtle `@layer` declaration-order bugs (the layer-statement `@layer legacy, theme, …;` MUST appear in the first concatenated file or layer priority shifts). Recommended only if Choice A is blocked.

---

## 3. Install command

```bash
cd "C:/Users/bhave/Crowagent Repo/crowagent-website"
npm install --save-dev postcss postcss-import
```

(csso, csso-cli, purgecss already pinned.)

---

## 4. Exact `build:css` replacement (Choice A)

Replace the current `scripts/build-css.js` pre-purge step. Pseudocode of the new entry:

```js
// scripts/build-css.js (new top)
const postcss = require("postcss");
const atImport = require("postcss-import");
const csso    = require("csso");

const SOURCE = path.join(REPO_ROOT, "styles.css");          // entry file, may @import others
const inlined = (await postcss([atImport()]).process(
  fs.readFileSync(SOURCE, "utf8"),
  { from: SOURCE, map: false }
)).css;

// then existing flow: PurgeCSS({ css: [{ raw: inlined }] }) → csso.minify → write styles.min.css
```

`package.json` script remains `"build:css": "node scripts/build-css.js"` — no script-name change, just a new internal step before purge. `build:css:legacy` can be left untouched as the rollback path.

---

## 5. Migration strategy — **chunks, not all-at-once**

`@layer legacy` is 31,724 lines of pre-2026 debt. Split it in **6 deterministic passes**, each shippable independently:

| Step | Extract | Lines (approx) | Validator |
|------|---------|---------------:|-----------|
| 0 | Install postcss+postcss-import, prove pipeline with **zero** extracts (entry file unchanged) | 0 | Byte-diff `styles.min.css` vs current = 0. Smoke 50/50. |
| 1 | `styles/00-reset-base.css` (lines 22-200 — reset + reduced-motion + `:root` tokens) | ~180 | Smoke + 4 validators |
| 2 | `styles/10-typography.css` | ~1.5 k | Smoke |
| 3 | `styles/20-layout-legacy.css` | ~6 k | Smoke |
| 4 | `styles/30-components-legacy.css` | ~12 k | Smoke |
| 5 | `styles/40-product-page-legacy.css` | ~8 k | Smoke |
| 6 | `styles/50-utilities-legacy.css` (residue) | rest | Smoke |
| 7 | Extract `@layer components` (post-31757) into `styles/60-sovereign-components.css` | ~1.6 k | Smoke |

Critical invariants for every step:
- The **entry `styles.css` must keep** `@layer legacy, theme, base, components, layout, overrides;` as the first non-comment statement.
- The `@layer legacy { … }` opening brace stays in the entry; the extracted file is `@import`ed *inside* the brace block, OR the brace wrapper moves into the extracted file. Choose one convention and document it at top of `styles.css`.
- Byte-diff `styles.min.css` before/after each step. Expected diff after a pure-move = 0 bytes (`postcss-import` preserves order). Any diff = abort + investigate.

---

## 6. Rollback strategy

- `styles.css.pre-sovereign.bak` and `styles.min.css.pre-purge` already exist as historical snapshots. Add a fresh snapshot before step 0: `cp styles.css styles.css.pre-arch1.bak && cp styles.min.css styles.min.css.pre-arch1.bak`.
- `build:css:legacy` script (the old `csso → purge` chain) stays in `package.json`. Reverting = `git checkout styles.css scripts/build-css.js && npm run build:css:legacy`.
- Each step is one git commit on a branch; revert is `git revert <sha>` with no cross-file coupling because the entry file's `@import` list is the only manifest.

---

## 7. Risk assessment

| Risk | Level | Mitigation |
|------|-------|-----------|
| `postcss-import` reorders `@layer` declarations | **Low** | Spec-compliant since postcss-import 15; verified by Tailwind, Linear, GitHub Primer. Byte-diff step 0 proves identity. |
| PurgeCSS misses dynamic classes after inlining | **Low** | Purge input is identical post-inline; existing safelist unchanged. |
| csso struct-optimiser produces different bytes for inlined-vs-original | **None** | csso input is the fully-inlined string — same as today. |
| Source map / debugging harder | **Low** | Source maps off in prod; postcss-import preserves comments, so unminified debugging via `build:css --no-minify` still works. |
| Cloudflare Pages build env missing new deps | **None** | `package.json` `build` script is a no-op (`echo … && exit 0`); CSS is pre-built and committed. New deps only used locally. |
| Concurrent edits to extracted files cause merge conflicts | **Medium** | Mitigated by chunked rollout (1 extract per commit) and entry-file manifest. |

**Overall: LOW risk** with Choice A + byte-diff gate at step 0.

---

## 8. How peers do it

- **Stripe (Elements / docs):** PostCSS pipeline, `postcss-import` + `postcss-preset-env` + cssnano; one entry file per surface (~10-30 partials).
- **GitHub Primer:** Sass partials compiled with Dart Sass (`@use` / `@forward`), then `postcss` + cssnano. Equivalent inline-then-minify topology.
- **Linear:** Vite + Lightning CSS (Choice B equivalent); single binary bundles + minifies.
- **Tailwind (v4 engine):** `@import` resolution baked into `@tailwindcss/postcss`; identical inline-then-minify model to Choice A.

No major site ships `@import url(...)` to production unbundled because of the extra round-trip cost and FOUC risk — universal pattern is inline-at-build.

---

## 9. Recommendation

**Adopt Choice A.** Install `postcss` + `postcss-import`, modify `scripts/build-css.js` to inline before purge, gate step 0 on a zero-byte diff of `styles.min.css`. Then extract `@layer legacy` in 6 chunks across separate commits, each validated by smoke 50/50 + the 4 existing validators. Keep `build:css:legacy` as rollback. Estimated work: ~3 hours total across all 7 steps.

---

**Files referenced (absolute paths):**
- `C:/Users/bhave/Crowagent Repo/crowagent-website/package.json` (lines 7-10, build:css scripts)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/scripts/build-css.js` (lines 175-249, purge + csso pipeline)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/tools/purge-run.mjs` (purge step ingests styles.min.css)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/styles.css` (lines 20-22 layer declaration; line 31745 end of legacy; line 31757 start of components)
- `C:/Users/bhave/Crowagent Repo/crowagent-website/index.html` (line 36, only `/styles.min.css` is shipped)
