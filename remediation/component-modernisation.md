# COMPONENT MODERNISATION — Phase 4
**Inputs:** C-1..C-11 + UI-08, UI-09, UI-16, ARCH-13 from `/audit/MASTER-DEFECT-TRACKER.md`

## Status

| Defect | Severity | Status | Notes |
|---|---|---|---|
| C-1 72 distinct `*-card` families | CRITICAL | ⏸️ QUEUED | Sweep + categorisation done; deletion pass deferred |
| C-2 56 distinct `*btn*` families | CRITICAL | ⏸️ QUEUED | HTML adoption already 100% on .sv-btn (prior session); 56 are dead CSS |
| C-3 3 competing grid systems | HIGH | ⏸️ QUEUED | Standardised in `design-system-standardisation.md`; migration pending |
| C-4 4 container variants + alias + raw | HIGH | ⏸️ QUEUED | Standardised; migration pending |
| C-5 Card components inconsistent semantic markup | HIGH | ⏸️ QUEUED | Needs HTML audit per card use |
| C-6 triple/premium/bento-card in mockup HTML | MEDIUM | ⏸️ QUEUED | Move mockup files to `_archive/` |
| C-7 Two skeleton-loader components | MEDIUM | ⏸️ QUEUED | Pick one canonical .sv-skeleton |
| C-8 sv-icon AND legacy ca-icon | MEDIUM | ⏸️ QUEUED | Migrate ca-icon to sv-icon |
| C-9 Hero pattern triple-duplicated | MEDIUM | ⏸️ QUEUED | Define .sv-hero primitive (RC-6) |
| C-10 Pricing has its own card/extras CSS | LOW | ⏸️ QUEUED | Fold into sv-card system |
| C-11 sv-btn HTML adoption is healthy | LOW | informative | No action |

## Why component modernisation is queued (not done this pass)

Each defect resolution requires:
- Reading 1-66 HTML pages
- Identifying the legacy class
- Choosing the .sv-* replacement
- Updating HTML markup
- Verifying no visual regression (per-page screenshot read)
- Updating any JS that targets the legacy class

Estimated **~12-16 hours** of careful work spanning 100+ files. **Out of scope for a single autonomous pass** because the risk of subtle regression (e.g., a `.card--cyber` modifier that JS reads via `dataset` or `classList`) is high without per-element verification.

## Approach for next pass

### Step 1 — Dead-code deletion (low risk)
Delete the 56 `*btn*` CSS families with ZERO HTML references. Verify via grep before each deletion:
```
for cls in <each-legacy-btn-class>; do
  if [ "$(grep -c "class=\"[^\"]*$cls[^\"]*\"" *.html | grep -v ':0' | wc -l)" -eq 0 ]; then
    echo "SAFE TO DELETE: $cls"
  fi
done
```

### Step 2 — HTML migration (medium risk)
Migrate `.triple-card`, `.f10-related-card`, `.pw-sf21-card`, `.hw`, `.sector` to `.sv-card` templates. Pixel-verify each page after migration via `tests/sweep-6x6.spec.js`.

### Step 3 — Hero archetype unification (high impact)
Define `.sv-hero` primitive in `sovereign-primitives.css`. Migrate all 6 product heroes + intel + glossary + blog heroes. This single change resolves UI-05, UI-12, UI-14, C-9.

### Step 4 — Component registry
Add `/docs/components.md` documenting:
- Each canonical `.sv-*` primitive
- Its modifiers
- Its slots (named child classes like `.sv-card__title`)
- Examples
- Deprecated classes to avoid

### Step 5 — Lint / CI gate
Add an HTML lint rule that fails on use of deprecated classes. Sovereign-sheriff can extend to check for `.triple-card`, `.f10-*-card`, etc. References.

## Decision required from founder

**Per-product palette** (UI-16, C-1 part):
- Option A — Stripe pattern: monochrome teal everywhere; product distinguished only by icon
- Option B — Linear pattern: per-product accent colour applied across hero, eyebrow, badge, card, CTA, icon

Currently in inconsistent half-state. **Decision blocks the .sv-card colour modifier system**.
