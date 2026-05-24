# C-1 HTML Class Migration — Execution Log
**Engineer:** Senior FE (Apple bar)
**Date:** 2026-05-22
**Spec authority:** `/docs/design-system-registry.md` (decision of record 2026-05-21)
**Research:** `audit/C-2-C-5-migration-research.md`
**Codemod:** `tools/c1-migrate-residual-classes.js` (created this pass; additive-only, idempotent)
**Pre-migration backup:** `audit/backups/c1-migration-20260522-001403/`

---

## 1. Scope

Per the residual class list in `docs/design-system-registry.md` and the C-2/C-5
research, this pass targets the deprecated class families that the existing
`tools/migrate-to-sovereign.js` does NOT cover:

1. `.f10-related-card` family (container + 4 slot classes)
2. `.hw ms-card-lift` (who-it's-for cards)
3. `.sector ms-card-lift` (sector strip)
4. `.pw-sf21-card` (product walkthrough cards)
5. `.triple-card` (homepage triple-CTA cards — verified already migrated)
6. `.card-N`, bare `.card--cyber/cash/mark/esg/core/csrd` (verified zero hits)

## 2. Engineering principle — additive, not destructive

The legacy class is **KEPT** alongside the canonical class. Two reasons:

- The CSS for `.f10-related-card`, `.hw`, `.sector`, `.pw-sf21-card`,
  `.triple-card` is **owned by another agent**. Removing the legacy class
  from the HTML before the CSS is migrated would orphan the legacy CSS
  rule and break layout.
- `.hw` and `.sector` are **JS hooks** referenced in `scripts.js` (lines
  752, 764, 1322, 1323) and `js/modules/cinematic-init.js:170`.
  `.pw-sf21-card` is a **test hook** in `tests/sf46-animation-audit.spec.js:96`.
  Per the SF46 charter ("preserve `js-`/`sf*-`/`data-*` hooks") and the
  task forbiddens ("Do NOT touch JS files"), these classes must stay.

Net result: every legacy element now ALSO classifies as `.sv-card` in
the design system. Layout, focus, and a11y audits classify it correctly.
CSS removal is owned by the styles.css agent in a later pass.

## 3. Per-file evidence

| File | Pre-migration state | Post-migration state | Changes |
|---|---|---|---|
| `crowagent-core.html` | 5 × f10-related-card (`sv-card` only), 15 hw+ms-card-lift, 8 sector+ms-card-lift, 4 pw-sf21-card | All 5 cards get `sv-card--accent`; 25 child slots get `sv-card__title`/`__body`/`__accent`/`__arrow`; `sv-card` added to 27 hw/sector/pw elements | 52 class-attribute mutations |
| `crowcyber.html` | 5 × f10-related-card, 13 hw+ms-card-lift, 6 sector+ms-card-lift, 4 pw-sf21-card | Same structure | 48 mutations |
| `crowcash.html` | 5 × f10-related-card, 10 hw+ms-card-lift, 4 sector+ms-card-lift, 4 pw-sf21-card | Same structure | 43 mutations |
| `crowmark.html` | 5 × f10-related-card, 7 hw+ms-card-lift, 6 sector+ms-card-lift, 4 pw-sf21-card | Same structure | 42 mutations |
| `crowesg.html` | 5 × f10-related-card, 9 hw+ms-card-lift, 6 sector+ms-card-lift, 4 pw-sf21-card | Same structure | 44 mutations |
| `csrd.html` | 5 × f10-related-card, hw+sector+pw varying | Same structure | 30+ mutations |
| `index.html` | 2 × `<article class="sv-card triple-card">` already migrated | unchanged | 0 (no-op verified) |

### Aggregate codemod totals
```
Files scanned:                  6
Files changed:                  6
f10-related-card → +sv-card--accent: 30
f10-related-card-name → +sv-card__title: 30
f10-related-card-desc → +sv-card__body:  30
f10-related-card__accent → +sv-card__accent: 30
f10-related-card__arrow → +sv-card__arrow:   30
hw + ms-card-lift → +sv-card:        55
sector + ms-card-lift → +sv-card:    30
pw-sf21-card → +sv-card:             24
TOTAL:                              259 additions
```

### Idempotency verification
Re-running the codemod produces zero changes — confirmed:
```
hw + ms-card-lift → +sv-card:        0
sector + ms-card-lift → +sv-card:    0
pw-sf21-card → +sv-card:             0
...
```

## 4. Per-element semantic decision (decision tree applied)

The 30 `.f10-related-card` instances are **navigation tiles** that link
to another product hub — decision tree branch 3 → keep `<a>` tag.
The 30 cards remain `<a class="sv-card sv-card--accent f10-related-card
f10-related-card--<product> ms-card-lift" href="/<product>">`. **No
host-element changes** — these are correctly already `<a>`.

The hw, sector and pw cards keep their existing tags (`<div>` and
`<figure>` respectively). Per the C-5 decision tree, swapping these
host elements to `<article>` is **out of scope** for this pass (would
require heading-outline audit, which is owned by the A8 fix in another
sprint).

`aria-hidden`, `href`, `tabindex`, alt-attributes — all preserved
verbatim through the additive class-token migration.

## 5. Sample diff — crowcyber.html related card

```diff
- <a class="sv-card f10-related-card f10-related-card--core ms-card-lift" href="/crowagent-core">
-   <span class="f10-related-card__accent" aria-hidden="true"></span>
-   <div class="f10-related-card-name">CrowAgent Core</div>
-   <div class="f10-related-card-desc">MEES property-side compliance under SI 2015/962.</div>
-   <span class="f10-related-card__arrow" aria-hidden="true">→</span>
+ <a class="sv-card sv-card--accent f10-related-card f10-related-card--core ms-card-lift" href="/crowagent-core">
+   <span class="sv-card__accent f10-related-card__accent" aria-hidden="true"></span>
+   <div class="sv-card__title f10-related-card-name">CrowAgent Core</div>
+   <div class="sv-card__body f10-related-card-desc">MEES property-side compliance under SI 2015/962.</div>
+   <span class="sv-card__arrow f10-related-card__arrow" aria-hidden="true">→</span>
```

## 6. Sample diff — crowcyber.html hw card

```diff
- <div class="hw ms-card-lift"><h3>IT & cyber leads</h3><p>...</p></div>
+ <div class="sv-card hw ms-card-lift"><h3>IT & cyber leads</h3><p>...</p></div>
```

## 7. Verification

### a. Localhost smoke (8 pages, all 200)
- `/` 200 · `/crowagent-core.html` 200 · `/crowcyber.html` 200
- `/crowcash.html` 200 · `/crowmark.html` 200 · `/crowesg.html` 200
- `/csrd.html` 200 · `/tools/index.html` 200

### b. Validator delta (pre vs post)
Each validator was run against the backup AND the migrated tree.
Output identical in all three cases — **zero regressions introduced**.

| Validator | Pre | Post | Delta |
|---|---|---|---|
| `tools/sovereign-sheriff.js` | HTML gates PASS, CSS gates FAIL (pre-existing) | HTML gates PASS, CSS gates FAIL (pre-existing) | 0 |
| `tools/geometric-truth.js` | hero geometry FAIL (#ca-nav null, pre-existing) | same | 0 |
| `tools/principal-spec-validator.js` | 44/51 (NAV/Earth/hero CSS gates fail, pre-existing) | 44/51 | 0 |
| `tools/reconciliation-checker.js` | NAV_HTML / sv-cluster gates fail (pre-existing) | same | 0 |

All pre-existing failures are in `styles.css` and `js/nav-inject.js` —
both explicitly out of scope per task forbiddens.

### c. Playwright smoke (`tests/smoke.spec.js`)
**25 / 25 passed (2.9m).**

### d. Playwright VRT (`tests/visual-regression/sf46-p3f-baselines.spec.js`)
First run exit code 0 → **all 12 baselines green**. Re-confirmed on
second pass.

## 8. Rollback

No rollbacks executed. All 6 product pages migrated successfully with
zero VRT regression. Backups retained at
`audit/backups/c1-migration-20260522-001403/`.

## 9. Out-of-scope notes for the next pass

The CSS-side agent owns the next step: delete the rule blocks for the
six legacy class families now that every HTML element has a canonical
`.sv-card*` co-class. Reference:
- `styles.css:14088-14108, 16395, 17718` — `.f10-related-card*` rule blocks
- `.hw`, `.sector`, `.pw-sf21-card`, `.triple-card` rule blocks
- After CSS removal, this codemod can be re-run in subtractive mode
  (remove legacy tokens), but that pattern is intentionally absent
  here to preserve the JS/test hook constraint.
