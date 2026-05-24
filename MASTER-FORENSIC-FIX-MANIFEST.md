# MASTER FORENSIC FIX MANIFEST (SF46 Phase 5)

## 1. STRATEGIC MANDATES (The "Absolute" Rules)
- **Role:** Principal UI/UX Architect.
- **Strict honesty:** NO FAKE DATA. No hallucinated logos, testimonials, or dummy videos.
- **Zero PX Policy:** EVERY `font-size`, `margin`, `padding`, and `gap` MUST use a `var()` token. (STILL LEAKING in blog/legal).
- **Sovereign First:** ALL buttons must be `.sv-btn`. ALL cards must be `.sv-card`.

---

## 2. SURGICAL DELETION (Delete Duplicate/Legacy Sections)
The Homepage (`index.html`) is currently a mess of duplicated sections. You must DELETE the following legacy blocks immediately to recover the geometry:

1. **Delete the "Use-case cards" block:** (lines ~542-566). It is superseded by the JTBD grid.
2. **Delete the old "Products" Bento:** (lines ~1261-1430). It is superseded by the `hp-frameworks-strip`.
3. **Delete the "Engine methodology statements":** (lines ~1243-1259). It is superseded by the `hp-moat`.
4. **Delete the duplicate "Our methodology" grid:** (lines ~1732-1768). 
5. **Delete the redundant "Demo section":** Any block that duplicates the `#live-demo` widget.

---

## 3. GLOBAL RECOVERY (Apply to ALL 66+ HTML Files)
1. **Logo Wall:** DELETE every "Trusted by" or client logo strip recursively.
2. **Newsletter:** DELETE from all pages EXCEPT `about.html` and `contact.html`.
3. **Canonical Footer:** Ensure 100% of pages use the single-line footer injected via `js/nav-inject.js`.
4. **Build Step:** After every CSS change, you MUST run `npm run build:css:legacy` and `npm run build:js:legacy`. The user sees `styles.min.css`. If you don't rebuild, your changes are INVISIBLE.

---

## 4. FILE-EXHAUSTIVE RECOVERY CHECKLIST

### STAGE 1: CORE & HERO (100% Geometry)
- [ ] `index.html`: Fix Earth Opacity (92%). Reintegrate Demo. Restore Scroll Bar.
- [ ] `pricing.html`: Delete `ms-card-lift` and `pgrid` overrides. Use `.sv-grid` and `.sv-card`. Enforce exact equal heights.
- [ ] `404.html`: Fix centering.

### STAGE 2: PRODUCTS (Recursive Fix)
- [ ] ALL 6 Product Pages: Ensure sticky Chapter Nav is live. Remove "Drop video" placeholders. Replace with screenshots.

### STAGE 3: LEGAL & SECURITY (Alignment Truth)
- [ ] `cookies.html`, `terms.html`, `privacy.html`: Force `line-height: 1.7` (tokenized). Purge all `px` margins.

### STAGE 4: KNOWLEDGE HUB (Recursive Sweep)
- [ ] `blog/*.html`: Fix line-height. Fix bullet alignment.
- [ ] `tools/*.html`: Centrally align tool panels using `.sv-container--narrow`.

---

## 5. EVIDENCE & AUDIT
Generate `FORENSIC-FIX-COMPLETE.md` with proof of DELETIONS and a success report from `node tools/geometric-truth.js`.
