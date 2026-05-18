# Website Full Transformation - Master Task List
# Created: 2026-05-16
# Status: IN PROGRESS
# Server: http://localhost:8092

## CRITICAL CONTEXT
- styles.min.css now includes cinematic styles (rebuilt via csso)
- All pages reference styles.min.css (no separate cinematic.css)
- Server running at localhost:8092
- NO production deployment without user approval

---

## WAVE 1: Product Pages Complete Redesign (6 pages)
Pages: crowagent-core.html, crowcyber.html, crowcash.html, crowmark.html, crowesg.html, csrd.html

### Issues to fix:
- [ ] Remove duplicate carousel (keep only 1 per page)
- [ ] Fix carousel blackout (bottom cut off during autoplay)
- [ ] Redesign hero: remove image-left/text-right layout, make centered hero like Stripe
- [ ] Remove duplicate images
- [ ] Fix mobile responsiveness (buttons stack, text readable)
- [ ] Add Stripe-style multi-screen autoplay carousel
- [ ] Remove AI-sounding language
- [ ] Flag any false/unverifiable claims for user review
- [ ] Ensure cinematic animations work (scroll reveals, hover effects)

---

## WAVE 2: Free Tools Pages (6 tool pages + 6 methodology pages)
Pages: tools/mees-risk-snapshot, tools/ppn-002-calculator, tools/late-payment-calculator, tools/cyber-essentials-readiness, tools/csrd-applicability-checker, tools/vsme-materiality-light + methodology pages

### Issues to fix:
- [ ] Transform form inputs (glass background, teal focus, rounded)
- [ ] Transform buttons (teal gradient, hover lift)
- [ ] Fix cookie banner not appearing
- [ ] Add premium card treatment to results
- [ ] Mobile responsiveness
- [ ] Remove AI language

---

## WAVE 3: Blog Pages (index + 20 posts)
Pages: blog/index.html + all blog/*.html

### Issues to fix:
- [ ] Transform to real blog format (Google/AWS/Microsoft style)
- [ ] Card grid with proper spacing on index
- [ ] Article pages: comfortable reading width, proper typography
- [ ] Remove fake-looking elements
- [ ] Mobile responsiveness

---

## WAVE 4: About, Contact, Partners Pages
### About (about.html):
- [ ] Fix image alignment
- [ ] Fix text/button overlap
- [ ] Proper section spacing

### Contact (contact.html):
- [ ] Fix text overlap in text boxes
- [ ] Fix large image issue
- [ ] Fix responsiveness
- [ ] Transform form inputs

### Partners (partners.html):
- [ ] Fix text overlap
- [ ] Transform to modern UI

---

## WAVE 5: Legal/Utility Pages
Pages: security.html, privacy.html, terms.html, cookies.html, cookie-preferences.html, glossary/*, changelog.html

### Issues to fix:
- [ ] Transform to match site design (currently look legacy)
- [ ] Fix footer inconsistency (different from other pages)
- [ ] Proper typography and spacing
- [ ] Mobile responsiveness

---

## WAVE 6: Pricing, Roadmap, FAQ, Tools Index
### Pricing (pricing.html):
- [ ] Fix mobile misalignment
- [ ] Cards stack properly on mobile

### Other pages:
- [ ] Roadmap: timeline animation
- [ ] FAQ: accordion styling
- [ ] Tools index: card grid

---

## WAVE 7: Global Issues
- [ ] Cookie banner: fix alignment on ALL pages
- [ ] Breadcrumbs: fix mobile alignment on ALL pages
- [ ] Dead code cleanup (remove unused JS/CSS/images)
- [ ] Image audit: replace poorly aligned/mismatched images with 8K alternatives
- [ ] Performance testing (Lighthouse)
- [ ] Security testing (headers, CSP)
- [ ] Remove AI-sounding language across all pages
- [ ] Flag false/unverifiable information for user review

---

## RULES (NEVER BREAK):
- All colours: var(--ca-*) tokens only, never hex
- CTA buttons: bg var(--teal), text var(--obsidian)
- MEES Band C 2028: always "proposed"
- MEES fines: never exceed 150,000 GBP
- PPN 002 threshold: always 10%
- No em-dashes in user-facing text
- Keep original content/context intact
- All changes must be responsive
- No production deployment without approval
