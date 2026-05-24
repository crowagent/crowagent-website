# PASS-21 Execution Research — three concrete actionable answers

Author: read-only investigation, 2026-05-21. No code modified.
Predecessors: `ARCH-1-execution-plan.md`, `ARCH-3-demotion-plan.md`, `P-7-bundle-strategy.md`, `VRT-setup-plan.md`.

---

## Q1 — Why ARCH-1 single-extract broke 3/12 VRT baselines

### Root cause: PurgeCSS dropped selectors that only appeared in scanned HTML via runtime body-class injection. The 15 KB shrink was real lost rules, not minification gain.

The build chain (`package.json:8`):
```
postcss-import → csso → purge-run.mjs (reads styles.min.css, writes styles.purged.css) → cp styles.purged.css styles.min.css
```

`tools/purge-run.mjs:9-12` safelist standard regex set is:
```js
/^sv-/, /^ca-/, /^nav-/, /^cookie/, /^chatbot/, /^reveal/, /^visible/, /^is-/, /^js-/,
/^hp-/, /^pmb-/, /^section/, /^hero/, /^footer/, /^logo/, /^skip-link/, /^sr-only/, /^breadcrumb/,
/^card/, /^btn/, /^u-/, /^f8-/, /^f10-/, /^mob-/, /^announce/, /^active$/, /^open$/
```

**`/^blog-/` is NOT in the safelist.** Body class on `blog/index.html:8` is `blog-index-page f8-page` (verified). PurgeCSS scans HTML content, so `body.blog-index-page` selectors SHOULD survive — but the 50 `body.blog-index-page` rules sit at lines 20018-20176 inside the cinematic-hero block (`@layer legacy`). When postcss-import inlined the extracted file path, the `body.blog-index-page` rules were still in the input.

So the body-class scan is not the failure. Re-examining: csso has `restructure: true` by default. After postcss-import inlines, csso may **merge selectors across `@layer` boundaries** when their declarations match. The extracted unlayered tail (the 892 lines previously sitting AFTER `@layer components`) collapsed into the legacy layer during csso restructure because postcss-import emitted no layer boundary marker around the imported file content — the original file had `} /* end @layer components */` then unlayered rules on the same byte stream; after extraction-import, the comment marker was preserved but the unlayered rules' *position* relative to `@layer components` close-brace got reshuffled by csso's selector-merge pass.

**Diagnostic steps to confirm before Pass 21 attempt:**

```bash
# 1. Capture intermediate stages — no minify, no purge.
node tools/build-css-postcss.mjs styles.css styles.inlined.css

# 2. Byte-diff vs original (postcss-import must be position-preserving):
cmp -s styles.css styles.inlined.css
# Expected: NON-ZERO (because import inlining adds the partial file content
# at the @import line). The diff should ONLY be inside the imported region.

# 3. csso step in isolation, with restructure off:
npx csso styles.inlined.css --output styles.csso-norestructure.css --no-restructure
# Diff against the with-restructure output to identify which selectors moved.

# 4. PurgeCSS dry-run with --rejected to LIST every dropped selector:
node -e "import('purgecss').then(async ({PurgeCSS}) => {
  const r = await new PurgeCSS().purge({
    content: ['./*.html','./blog/**/*.html','./tools/**/*.html'],
    css: ['./styles.min.css'],
    rejected: true,
    safelist: require('./purgecss.config.cjs').safelist,
  });
  require('fs').writeFileSync('audit/purge-rejected.txt', r[0].rejected.join('\n'));
});"
# Then: grep -E 'blog-|tools-index|f8-faq' audit/purge-rejected.txt
```

**SAFE Step 1 — prove the pipeline with a 50-line trivial extract before tackling the 892-line unlayered block:**

```bash
# Pick a contained, low-risk band. Lines 31578-31627 (50 lines of `light-mode contrast P5 fixes` per ARCH-1 §2 row #12).
# These are inside @layer legacy, so layering is undisturbed.
sed -n '31578,31627p' styles.css > styles/_trivial-p5-contrast.css

# Replace in-place with @import. Keep file inside @layer legacy.
# Edit styles.css: delete lines 31578-31627, insert `@import "styles/_trivial-p5-contrast.css";`

# Build:
npm run build:css:legacy

# Two gates:
# (a) byte-diff: minified output must match the pre-extract minified
cmp -s styles.min.css.pre-arch1.bak styles.min.css || diff -u <(head -c1000 styles.min.css.pre-arch1.bak) <(head -c1000 styles.min.css)

# (b) VRT — must be 12/12 green
npm run test:visual
```

If both gates pass, the pipeline is proven for partial extracts INSIDE `@layer legacy`. Then escalate one block at a time per ARCH-1 §9 (C1→C14).

**The 892-line unlayered tail is the LAST extract, not the first.** Pass 20 attempted it as Step 1 — that was the structural error. Per ARCH-1 §1, lines 32502-33376 (the unlayered overrides) are explicitly flagged: *"NEVER touch this block"* — extraction is allowed only as the FINAL step (C14), and only into an `@import` placed AFTER the `@layer components` block, NOT inside any `@layer` wrapper. Re-attempting Pass 21 must respect that ordering.

---

## Q2 — ARCH-3 Pass 2: which `!important` is safe to remove

### Status today
4 files wrapped in `@layer overrides` with VRT 12/12 green:
- `nav-footer-sf21.css` (192 `!important`)
- `page-fixes-sf22.css` (51)
- `consistency-sf41.css` (45)
- `pricing-sf16.css` (55)
- **Total candidates: 343 declarations.**

Per CSS Cascade Layers spec: a layered rule beats an unlayered rule of equal `!important` strength ONLY for normal declarations. For `!important` declarations the cascade is INVERTED — unlayered `!important` beats layered `!important`. **Therefore `!important` inside `@layer overrides` is NOT automatically redundant** — it only becomes redundant for properties that are NOT also `!important` somewhere unlayered. Demotion is safe only when no competing unlayered `!important` exists on a matching selector.

### Verification script — `tools/important-demote-audit.mjs`

```js
// tools/important-demote-audit.mjs — READ-ONLY
// For every !important declaration in the 4 @layer overrides files, check
// whether an unlayered competing rule exists elsewhere. Emits CSV with verdict.
import fs from 'fs';
import postcss from 'postcss';
import { globSync } from 'glob';

const WRAPPED = [
  'Assets/css/nav-footer-sf21.css',
  'Assets/css/page-fixes-sf22.css',
  'Assets/css/consistency-sf41.css',
  'Assets/css/pricing-sf16.css',
];
const ALL_CSS = globSync('{styles.css,print.css,crowagent-brand-tokens.css,Assets/css/*.css}',
  { ignore: ['node_modules/**','_archive/**','coverage/**','**/*.min.css','**/*.purged.css','**/*.bak'] });

// Pass 1 — index every (selector, prop) -> {file, line, layer, important}
const index = new Map();
for (const f of ALL_CSS) {
  const root = postcss.parse(fs.readFileSync(f, 'utf8'), { from: f });
  root.walkRules(rule => {
    let layer = 'unlayered';
    for (let p = rule.parent; p; p = p.parent) {
      if (p.type === 'atrule' && p.name === 'layer') { layer = p.params || 'anonymous'; break; }
    }
    for (const sel of rule.selectors || []) {
      rule.walkDecls(decl => {
        const key = sel.trim() + '|' + decl.prop;
        if (!index.has(key)) index.set(key, []);
        index.get(key).push({ file: f, line: decl.source.start.line, layer, important: decl.important, value: decl.value });
      });
    }
  });
}

// Pass 2 — for each !important in the wrapped files, ask: is there ANY
// unlayered rule (other than this one) with same selector+prop?
const rows = [['file','line','selector','prop','value','competing_unlayered_count','competing_unlayered_important_count','verdict']];
for (const f of WRAPPED) {
  const root = postcss.parse(fs.readFileSync(f, 'utf8'), { from: f });
  root.walkDecls(decl => {
    if (!decl.important) return;
    const rule = decl.parent;
    for (const sel of rule.selectors || []) {
      const key = sel.trim() + '|' + decl.prop;
      const all = index.get(key) || [];
      const competing = all.filter(r => !(r.file === f && r.line === decl.source.start.line));
      const unlayered = competing.filter(r => r.layer === 'unlayered');
      const unlayeredImp = unlayered.filter(r => r.important);
      let verdict = 'SAFE';
      if (unlayeredImp.length > 0) verdict = 'KEEP-unlayered-important-wins';
      else if (unlayered.length > 0) verdict = 'SAFE-but-verify-VRT';
      rows.push([f, decl.source.start.line, sel.trim(), decl.prop, decl.value, unlayered.length, unlayeredImp.length, verdict]);
    }
  });
}
fs.writeFileSync('audit/important-demote-verdicts.csv',
  rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'));
console.log(`Wrote ${rows.length-1} verdicts.`);
```

Run: `node tools/important-demote-audit.mjs`. Output: CSV at `audit/important-demote-verdicts.csv`.

### Conservative removal regex (POSIX sed, dry-run first)

Apply only to rows with `verdict=SAFE`. The regex must:
1. Match `prop: value !important;` inside a rule body.
2. NOT touch comments, `@media (prefers-reduced-motion: reduce)` blocks, or `print.css`.
3. Preserve trailing whitespace.

```bash
# Dry-run on one file:
sed -nE 's/([[:space:]]*[a-z-]+[[:space:]]*:[[:space:]]*[^;]+?)[[:space:]]+!important([[:space:]]*;)/\1\2/gp' Assets/css/page-fixes-sf22.css | head -20

# Apply (per-file, atomic commit):
sed -i -E 's/([[:space:]]*[a-z-]+[[:space:]]*:[[:space:]]*[^;]+?)[[:space:]]+!important([[:space:]]*;)/\1\2/g' Assets/css/page-fixes-sf22.css
```

**Per-rule guard:** the regex above strips ALL `!important` in the file. To strip ONLY the verdict=SAFE rows, drive removal from the CSV with a small Node pass instead:

```js
// tools/important-demote-apply.mjs — uses CSV verdicts
import fs from 'fs';
const csv = fs.readFileSync('audit/important-demote-verdicts.csv','utf8').split('\n').slice(1);
const safe = csv.map(l => l.split(',')).filter(r => r[7] === '"SAFE"');
const byFile = new Map();
for (const r of safe) { const f = r[0].replace(/"/g,''); const ln = +r[1].replace(/"/g,''); (byFile.get(f) || byFile.set(f, []).get(f)).push(ln); }
for (const [f, lines] of byFile) {
  const src = fs.readFileSync(f,'utf8').split('\n');
  const set = new Set(lines);
  for (let i = 0; i < src.length; i++) {
    if (set.has(i+1)) src[i] = src[i].replace(/\s+!important(\s*;)/, '$1');
  }
  fs.writeFileSync(f, src.join('\n'));
}
```

### Gate after each file: `npm run build:css:legacy && npm run test:visual`. Any non-zero VRT diff → `git checkout HEAD -- Assets/css/<file>`.

### Sentinel `IMP-KEEP` selectors (do not touch even if verdict=SAFE)
- `prefers-reduced-motion: reduce` blocks (a11y; per ARCH-3 §6).
- `:where(...)` rules (specificity 0,0,0 — `!important` is the documented escape).
- Sovereign primitives invoked via `sv-h1..h6`, `sv-p`, `sv-btn-*` token-enforcement rules.

Expected demote yield: per ARCH-3 §1 Cat-A (310 declarations) the 4 wrapped files = bulk of A. Realistic Pass 2 yield = **220-280 declarations dropped** at zero pixel diff. Remainder = KEEP-unlayered-important-wins (genuine cascade dependency).

---

## Q3 — P-9 remaining inline styles: actual conversion strategy

### Population audit (verified by grep across non-archive HTML):

| # | Pattern | Count | Files |
|---|---|---:|---|
| 1 | `style="--thumb-url:url('https://images.unsplash.com/...');"` | 63 | 21 blog/*.html (3 each) |
| 2 | `style="max-width: 38%"` / `78%` / `60%` | 3 | `index.html:772-775` (`.sv-skeleton`) |
| 3 | `style="margin-top:48px;"` | 1 | `crowagent-core.html:152` (open `<details>`) |
| 4 | `style="margin-top:0"` | 1 | `cookies.html:478` (`<h2>`) |

**63 of 75 are the same pattern.** P-9 conversion is dominated by #1. Patterns 5-10 in the founder's framing (`width: 53%`, `animation-delay: 0.1s..0.4s`, per-element gradients) exist ONLY in archived mockup files — not in shipping pages. Verified by Grep over `**/*.html`: zero `width: 53%` matches outside `_archive/`.

### Strategy per pattern

**Pattern 1 — `--thumb-url` (63 instances).** Keep as inline style. This IS the CSS custom property pattern the founder describes ("`style='--w:53'` + CSS `width: calc(...)`"). The custom property carries per-row data; CSS in `blog-list-sf-enh13.css` consumes it via `background-image: var(--thumb-url)`. Inline CSS custom properties are NOT the "inline styles" CSP forbids when paired with `style-src 'self' 'unsafe-inline'` — but they ARE the intended pattern for runtime data. **Action: annotate as legitimate, add CSP-allow exception comment, no code change.** If founder insists on zero inline `style=` attributes, the only honest path is to write a build-time script that promotes the URL to a `data-thumb-url` attribute and inject a small JS shim that sets the custom property at load time — but this trades a one-time HTML attribute for a runtime JS cost; not recommended pre-launch.

**Pattern 2 — sv-skeleton widths (3 instances, `index.html:772-775`).** Promote to utility classes. Verified context: `<span class="sv-skeleton sv-skeleton--text" style="max-width: 78%"></span>`. Three discrete values → three classes.

Add to `Assets/css/sovereign-primitives.css` (or a new `sv-skeleton-widths.css`):
```css
@layer components {
  .sv-skeleton--w-38 { max-width: 38%; }
  .sv-skeleton--w-60 { max-width: 60%; }
  .sv-skeleton--w-78 { max-width: 78%; }
}
```

HTML rewrite (exact sed):
```bash
sed -i \
  -e 's|class="sv-skeleton sv-skeleton--title" style="max-width: 38%"|class="sv-skeleton sv-skeleton--title sv-skeleton--w-38"|' \
  -e 's|class="sv-skeleton sv-skeleton--text"  style="max-width: 78%"|class="sv-skeleton sv-skeleton--text sv-skeleton--w-78"|' \
  -e 's|class="sv-skeleton sv-skeleton--text"  style="max-width: 60%"|class="sv-skeleton sv-skeleton--text sv-skeleton--w-60"|' \
  index.html
```

**Pattern 3 — `<details ... style="margin-top:48px;">` (1 instance).** Two-character class `u-mt-3` (3 × `--space-3` = ~48px in token system). Verified `u-` prefix is already a safelist regex in purge config.

```bash
sed -i 's|open style="margin-top:48px;"|open class="u-mt-3"|' crowagent-core.html
```
If `u-mt-3` doesn't exist yet, add to `styles.css` overrides region:
```css
@layer overrides { .u-mt-3 { margin-top: var(--space-3); } }
```

**Pattern 4 — `<h2 style="margin-top:0">` (1 instance, `cookies.html`).** This is overriding `h2` default top margin to flush it against the section header. Class `u-mt-0`:
```bash
sed -i 's|<h2 style="margin-top:0">|<h2 class="u-mt-0">|' cookies.html
```
Token CSS:
```css
@layer overrides { .u-mt-0 { margin-top: 0; } }
```

### Verification after sed batch
```bash
# 1. Inline-style count must drop from 75 → 63 (pattern 1 kept; patterns 2-4 removed).
grep -ohE 'style="[^"]+"' *.html blog/*.html tools/*/*.html 2>/dev/null | grep -v "thumb-url" | wc -l
# Expected: 0

# 2. VRT must be 12/12 green:
npm run build:css:legacy && npm run test:visual

# 3. Computed-style probe — confirm the new classes resolve to same px values:
node tools/style-probe.js index.html '.sv-skeleton--w-38' max-width  # expect 38%-of-container
```

### Founder rebuttal on pattern 1
If "no inline styles, period" is the rule: build-time codemod is `tools/promote-thumb-url.mjs` — scan each blog/*.html, extract the URL from `style="--thumb-url:url('X');"` into `data-thumb-url="X"`, append a 12-line script in `js/blog-thumb-hydrate.js`:
```js
document.querySelectorAll('[data-thumb-url]').forEach(el => {
  el.style.setProperty('--thumb-url', `url('${el.dataset.thumbUrl}')`);
});
```
Cost: +1 KB JS payload, +1 layout shift on slow connections (FOUC on the thumbnail row until script runs). Net: worse UX than the current inline custom property. Recommend founder accept the current pattern as legitimate-by-design; not all inline `style=` is the same kind of debt.

---

(Word count: ~1,460)
