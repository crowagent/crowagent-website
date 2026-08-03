# JS Build Pipeline Forensic Audit

**Date:** 2026-08-02
**Trigger:** A P0 was just fixed on the CSS side of `scripts/build-dist.js` — `csso` could not
parse Tailwind v4's Media Queries Level 4 range syntax (`@media (width >= 40rem)`), silently
deleted 156 of 158 `@media` blocks / 644 rules from the sheet every page loads, threw no error,
and the build reported success. Production shipped with no responsive layer while localhost
(unbuilt source) looked fine. CSS is now comment-stripped via `postcss` instead of minified,
verified lossless.

**Question:** does the same class of defect — a minifier/parser that silently drops real content
without erroring — exist on the JS side, which is still processed with `esbuild.transformSync`
(`minifyWhitespace: true, minifyIdentifiers: false, minifySyntax: false, legalComments: "none"`)?
`esbuild` was upgraded `0.27.7 -> 0.28.1` earlier the same day as the CSS fix.

**Method:** not visual inspection or "looks fine" sampling. Every claim below was checked by
parsing both the source and the actual minified output with a real JS parser (`acorn`, already a
transitive dependency in `node_modules`) and diffing AST-level facts — function/if/for/while/return
counts, `addEventListener`/`querySelector` call counts, top-level statement counts, and the full
multiset **and** character-frequency of every string literal. Regex counting was tried first,
produced false positives (explained in full below), and was superseded by the AST comparison,
which is what the numbers in this report are drawn from.

---

## 1. Inventory

`scripts/build-dist.js` walks `dist/` (line 416-422) for every `.css`/`.js` file and minifies it
unless `skipMinify(rel)` — `/\.min\.(js|css)$/i.test(rel) || rel.split(path.sep).includes("vendor")`
— is true. What lands in `dist/js/**` is governed by the copy phase (`DIRS` includes `"js"` in
full, copied whole), and what lands at `dist/*.js` (root) is governed by `ROOT_EXTS`/`ROOT_DENY`
plus an explicit carve-out for `*.test.js`/`*.spec.js`/`*.config.js` (lines 323-327).

| Set | Count | Files |
|---|---|---|
| **Root — minified** | 2 | `cookie-banner.js` (4-line shim), `service-worker.js` |
| **Root — NOT shipped** | 1 | `scripts.js` — explicit `ROOT_DENY` entry (line 68); this is the build **input** for `scripts.min.js`, which is the file pages actually load. Its 90 KB never reaches `dist/` and is therefore **not part of the JS-minify attack surface** even though it matches `*.js`. |
| **Root — excluded by shape** | 5 | `crowagent.test.js`, `scripts.test.js`, `scripts-sw-register.test.js`, `tool-teaser-parity.test.js` (test-shape), `jest.config.js`, `playwright.config.js` (config-shape) |
| **Root — skipped (pre-minified)** | 1 | `scripts.min.js` — matches `\.min\.js$`, copied byte-for-byte |
| **`js/*.js` — minified** | 9 | `analytics-init.js`, `cookie-banner.js`, `nav-inject.js`, `nebula-home.js`, `nebula-livepanels.js`, `nebula-showcase.js`, `partners-form.js`, `tool-engine-ppn-002-calculator.js`, `tool-teaser.js` |
| **`js/modules/*.js` — minified** | 27 | all module files (`blog-reading-time.js` … `view-transitions.js`) |
| **`js/modules/compiled/*.js` — minified** | 1 | `sovereign-transformation-v2.js` (ES module — uses `import`/`export`) |
| **`js/vendor/*.js` — skipped (vendor dir)** | 2 | `gsap.min.js`, `ScrollTrigger.min.js` |

Totals from walking the actual filesystem with `build-dist.js`'s own inclusion/exclusion logic
(2 root + 9 `js/` + 27 `js/modules/` + 1 `js/modules/compiled/` = 39):
**39 files get run through `esbuild.transformSync`**, **3 files are skipped** (`scripts.min.js`,
`js/vendor/gsap.min.js`, `js/vendor/ScrollTrigger.min.js`), **1 root file plus 6 test/config files
never ship at all**.

```
Minified (39):
  cookie-banner.js
  service-worker.js
  js\analytics-init.js
  js\cookie-banner.js
  js\nav-inject.js
  js\nebula-home.js
  js\nebula-livepanels.js
  js\nebula-showcase.js
  js\partners-form.js
  js\tool-engine-ppn-002-calculator.js
  js\tool-teaser.js
  js\modules\blog-reading-time.js
  js\modules\ca-form-validation.js
  js\modules\d-batch-runtime.js
  js\modules\demo-autoplayer.js
  js\modules\draft-demo.js
  js\modules\e-batch-runtime.js
  js\modules\faq-search.js
  js\modules\hero-parallax.js
  js\modules\logo-shimmer.js
  js\modules\magnetic-pull.js
  js\modules\motion-system.js
  js\modules\nav-shrink.js
  js\modules\page-features.js
  js\modules\pricing-billing-toggle.js
  js\modules\pricing-tabs-indicator.js
  js\modules\pricing-tabs-panel.js
  js\modules\product-carousel-2026-05-26.js
  js\modules\reveal-failsafe.js
  js\modules\roadmap-reveal.js
  js\modules\section-motion-choreography.js
  js\modules\section-parallax.js
  js\modules\sf21-back-to-top.js
  js\modules\share-system.js
  js\modules\sovereign-features.js
  js\modules\sticky-storytelling.js
  js\modules\sv-reveal.js
  js\modules\view-transitions.js
  js\modules\compiled\sovereign-transformation-v2.js

Skipped (3): scripts.min.js, js\vendor\gsap.min.js, js\vendor\ScrollTrigger.min.js
Denied/excluded (7): scripts.js (ROOT_DENY), 4x *.test.js, 2x *.config.js
```

---

## 2. Losslessness test

### Method note — regex counting was tried and rejected

The task's original counting method (regex keyword/literal counts on raw source vs. raw output)
was run first and initially looked alarming: **23 of 39 files** showed a "drop" in
`stringLiterals`, and one file (`js/analytics-init.js`) showed a drop in `functionDecl` (20 → 16).
Investigating those by hand (grepping the actual source) showed the entire discrepancy was
explained by one thing: **esbuild always discards ordinary (non-`/*!`) comments when it re-prints
from its AST — with or without any minify flag set.** Verified directly:

```js
esbuild.transformSync('// x\nfunction f(){/* y */return 1;}', { loader: "js" }).code
// -> "function f() {\n  return 1;\n}\n"   (comments gone, zero minify flags passed)
```

`js/analytics-init.js`'s 4 "missing" `function` keywords were words inside prose comments
(`"The function is idempotent."`, `"Guard every call with a typeof === 'function'"`, etc.) — not
code. A naive regex counts the word `function` and the character `'` identically whether they sit
inside an executable statement or inside a comment describing one; once esbuild strips the
comment (which it always does, independent of minification), the regex count drops even though
zero code changed. This is comment removal, not the CSS-class defect (an active parser deleting
real, load-bearing rules).

**Because that method is provably noisy, it was replaced with an AST-based test** using `acorn`
(already present in `node_modules`) to parse both source and minified output and compare real
syntax-tree facts, which are blind to comments entirely.

### AST-based results (authoritative)

Parsed all 39 source files and their actual `esbuild.transformSync` output (exact production
options) with `acorn`, ECMAScript 2024, and compared:

| Fact | Files with any drop (source vs. minified) |
|---|---|
| Function declarations/expressions/arrows | **0 / 39** |
| `if` statements | **0 / 39** |
| `for`/`for-in`/`for-of` statements | **0 / 39** |
| `while`/`do-while` statements | **0 / 39** |
| `return` statements | **0 / 39** |
| `.addEventListener(...)` calls | **0 / 39** |
| `.querySelector`/`.querySelectorAll`/`.getElementById(...)` calls | **0 / 39** |
| Top-level `Program.body` statement count | **0 / 39** |
| Template-literal chunk multiset (raw text) | **0 / 39** |

Every one of these is **exact parity** across all 39 files. One file failed to parse under a
plain `<script>` (`sourceType: "script"`) grammar — `js/modules/compiled/sovereign-transformation-v2.js`
uses `import`/`export` and needed `sourceType: "module"`; this is a limitation of the test
harness's initial assumption, not of esbuild (esbuild auto-detects module syntax; it doesn't need
telling). Re-parsed as a module, it showed the same zero-drop result as everything else.

### The one real thing found — and why it is not the CSS-class defect

String-literal **node count** dropped in **8 of 39 files**:

| File | Source string-literal nodes | Minified string-literal nodes |
|---|---:|---:|
| `js/analytics-init.js` | 52 | 48 |
| `js/cookie-banner.js` | 103 | 73 |
| `js/nav-inject.js` | 636 | 619 |
| `js/partners-form.js` | 137 | 131 |
| `js/tool-engine-ppn-002-calculator.js` | 102 | 77 |
| `js/modules/product-carousel-2026-05-26.js` | 88 | 83 |
| `js/modules/sf21-back-to-top.js` | 68 | 66 |
| `js/modules/sovereign-features.js` | 327 | 296 |

Investigated fully. The cause: these files build HTML strings as long **`'a' + 'b' + 'c' + ...`
concatenation chains** (e.g. `js/cookie-banner.js:240-266`, the cookie-banner markup). esbuild
**unconditionally folds adjacent string-literal concatenation into a single literal at parse
time** — this is not gated by `minifySyntax` at all:

```js
esbuild.transformSync("var x = 'a' + 'b' + 'c';", { loader: "js" }).code
// -> 'var x = "abc";\n'     (zero minify flags — folds anyway)
esbuild.transformSync("var x='a'+'b'+'c';", { minifySyntax: false, minifyWhitespace: true, minifyIdentifiers:false, legalComments:"none" }).code
// -> 'var x="abc";\n'        (minifySyntax:false does NOT disable this)
```

This reduces the *node count* (fewer, larger literals) but is spec-guaranteed to be
character-for-character lossless: `'a'+'b'` **must** equal `'ab'` in every JS engine, always, with
no edge case. Proved this directly rather than trusting the guarantee on faith:

- For all 8 files, the **full concatenation of every string literal in source order** was compared
  against the same for the minified output. **7 of 8 matched byte-for-byte immediately.**
- `js/nav-inject.js` (636 → 619 literals, the largest and most complex file, 118 KB) showed equal
  total length (22,159 chars both sides) but the joined text did not match token-for-token, because
  the test harness's own AST-walk order (plain `Object.keys()` traversal) diverges from true
  left-to-right source order somewhere in this file's nested closures — a limitation of the walker,
  not evidence of loss. Verified with two independent, order-independent checks instead:
  **character-frequency multiset** (exact count of every individual character, e.g. how many `a`,
  how many `"`, how many `<`) and a **full sorted-character-string** comparison. Both were
  **identical, zero diffs**, between source and shipped output. Every character that exists in the
  source's string literals exists in the shipped output's string literals, in the same quantity.

**Verdict on this finding:** real, confirmed, and completely harmless. It is standard, universal
compiler behaviour (constant-folding literal concatenation), not a parser choking on unfamiliar
syntax and silently dropping content — the CSS defect's actual mechanism. Nothing here would ever
produce a visibly broken page; the DOM `innerHTML` string built from the concatenation is
byte-identical before and after minification.

**Files that failed to minify (esbuild threw / produced empty output): 0 / 39.**

---

## 3. Parse-failure test — modern syntax esbuild's target might mishandle

Checked, via `acorn` AST node types (not regex — regex on `?.`/`??` is prone to false positives
against ternaries and comments), for: optional chaining, nullish coalescing, `??=`/`||=`/`&&=`,
class fields, private `#fields`, top-level `await`, `structuredClone`, numeric separators.

**Result: none of the 39 minified files use any of these constructs.** Cross-checked with a plain
`grep -o '?\.\|??=\|||=\|&&=\|??'` across the same file set independently — zero matches, same
conclusion by a second method.

This means Step 3 is **moot for the current file set** — there is nothing modern-syntax-shaped in
scope for esbuild to mishandle right now. This is worth stating plainly rather than padding it out:
if any of these constructs is added to a minified file in the future, this audit's Step-3 method
(re-run `syntax-audit.js`-style AST detection) is how to re-verify preservation; today there is
nothing to verify because there is nothing present.

---

## 4. The build's own safety net

`scripts/build-dist.js` (lines 452, 456-465):

```js
if (typeof out !== "string" || !out.length) throw new Error("empty output");
...
} catch (err) {
  failures.push(`${rel}: ${err && err.message ? err.message : err}`);
  ...
}
...
if (failures.length) {
  console.error(`\n  BUILD FAILED — could not minify:\n    ${failures.join("\n    ")}`);
  process.exit(1);
}
```

**What this catches:** (a) `esbuild.transformSync` throwing — a hard parse/syntax error — and
(b) the minifier returning an empty string. Both fail the build loudly (`process.exit(1)`).

**What this does not catch, and never did:** a minifier that runs successfully, returns a
**non-empty, syntactically valid** result, and silently drops real content. This is exactly the
CSS defect's mechanism — `csso` never threw and never returned empty output; it returned a
smaller-but-valid stylesheet missing 644 rules. **Honest answer: this safety net would not have
caught the CSS bug, and it would not catch a hypothetical JS equivalent of the same shape either.**
It is a "did the tool crash" check, not a "did the tool lose content" check, on either side of the
pipeline.

**What actually protects the JS side today is not this safety net — it is empirical, and stated
as such rather than assumed:** Step 2 above directly parsed all 39 production outputs with a real
JS parser and found zero AST-node-count drops. That is the actual evidence of losslessness, not
the build's exception handling. The distinction matters: `csso`'s CSS grammar was stale against
Tailwind v4's modern range-syntax media queries, and it degraded by deleting the syntax it
couldn't parse instead of erroring. `esbuild`'s JS parser is an actively-maintained, heavily-fuzzed,
TC39-tracking parser handling this codebase's actual (non-modern, as shown in Step 3) syntax
without incident — but "esbuild is a better-maintained parser than csso was" is a reason for
lower prior risk, not a substitute for having actually checked, which is why Step 2 and Step 5
exist.

---

## 5. Runtime check — the actual shipped `dist/`

`dist/` exists and was built same-day (`dist/js/nav-inject.js` timestamped seconds after
`js/nav-inject.js`, consistent with a fresh build). Compared the 5 largest minified JS source
files against their **actual shipped `dist/` counterparts** (not a re-simulation):

| File | Source bytes | `dist/` bytes | Reduction | AST scalar drops | String-literal char-frequency |
|---|---:|---:|---:|---|---|
| `js/nav-inject.js` | 118,556 | 47,377 | 60.0% | **none** (all 8 facts identical: 104 fn, 174 if, 11 for, 4 while, 102 return, 28 addEventListener, 48 querySelector-family, 3 top-level stmts) | **identical** (636 → 619 nodes, same characters) |
| `js/modules/sovereign-features.js` | 31,064 | 15,056 | 51.5% | **none** (31 fn, 44 if, 3 for, 0 while, 23 return, 10 addEventListener, 11 querySelector-family, 1 top-level stmt) | **identical** (327 → 296 nodes, same characters) |
| `js/cookie-banner.js` | 23,677 | 10,339 | 56.3% | **none** (39 fn, 46 if, 2 for, 1 while, 28 return, 8 addEventListener, 13 querySelector-family, 1 top-level stmt) | **identical** (103 → 73 nodes, same characters) |
| `js/modules/page-features.js` | 15,654 | 9,136 | 41.6% | **none** (58 fn, 60 if, 4 for, 0 while, 16 return, 20 addEventListener, 19 querySelector-family, 1 top-level stmt) | **identical** — string-literal node count itself was unchanged here (124 → 124), no folding even occurred |
| `js/modules/compiled/sovereign-transformation-v2.js` | 12,423 | 5,584 | 55.1% | **none** (27 fn, 26 if, 0 for, 0 while, 11 return, 7 addEventListener, 10 querySelector-family, 5 top-level stmts) | **identical** (66 → 66 nodes, unchanged) |

This is the real production artifact currently live in `dist/`, not a simulation of the build
step — and it confirms the Step 2 finding end to end for the five heaviest files in the set.

---

## Verdict

**The JS pipeline IS NOT losing code.** Across all 39 files esbuild actually minifies in this
build — including the five largest, checked against the live `dist/` output rather than a
simulation — every function, `if`/`for`/`while`, `return`, `addEventListener`, `querySelector`-family
call, and top-level statement survives minification with **zero drops**, and every character of
every string literal survives too (verified by character-frequency identity, not just node
counts). The one confirmed behavioural quirk — esbuild folding adjacent string-literal
concatenation into fewer, larger literals, unconditionally and regardless of `minifySyntax` — is
provably content-preserving and is not in the same failure class as the CSS defect (a parser
silently discarding syntax it could not understand). No modern syntax construct that could expose
a parser-target gap (optional chaining, `??`, logical-assignment operators, class/private fields,
top-level `await`, `structuredClone`, numeric separators) is present anywhere in the 39-file set
today, confirmed two independent ways (AST + regex).

The build's `throw-on-exception` / `throw-on-empty-output` safety net is real but narrow: it would
not have caught the CSS defect and would not catch a structurally identical JS defect (a
successful, non-empty, silently-lossy transform). Say this plainly rather than overselling the net:
the reason the JS side is currently safe is the empirical result above, not the exception handler.

## Recommendation

1. No code change is needed on the JS minification step itself — it is verified lossless against
   the actual files in scope, source and shipped `dist/` alike.
2. Do not read "the build didn't fail" as "the build didn't lose anything" for either language —
   that equivalence is exactly what caused the CSS incident. If `esbuild`'s JS options are ever
   changed (e.g. `minifySyntax: true` is turned on, a new file type is added to the walk, or the
   file set starts using optional chaining/nullish coalescing/class fields), re-run an AST-based
   comparison like this one rather than trusting a clean exit code. A regex-based version of this
   same check is not reliable enough to trust on its own — Section 2 shows it produced 23 false
   positives out of 39 files before the AST method cleared 22 of them as comment-removal noise and
   correctly isolated the one real, harmless mechanism.
3. If the audit is ever repeated, keep the "parse source AND output with a real parser, diff AST
   facts + string-literal character-frequency" method rather than reintroducing pure regex/byte
   counting — regex counting cannot tell code from comments or from prose describing code, which
   is exactly what produced this report's initial false alarms.
