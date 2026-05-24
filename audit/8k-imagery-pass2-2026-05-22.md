# 8K Imagery Pass 2 — sector gap-fill + page-hero upgrades (2026-05-22)

**Mandate:** Phase 1 — UK sector photos (gap fill for the homepage SF21 sector
grid); Phase 2 — page hero upgrades for about / contact / partners pages.

**Memory rule:** [feedback_website_images_royalty_free](C:/Users/bhave/.claude/projects/C--Users-bhave-Crowagent-Repo/memory/feedback_website_images_royalty_free.md)
— every image must be royalty-free; default source Unsplash.

**Companion docs:**
- `audit/8k-image-sourcing-2026-05-22.md` — pass 1 (hero scenes + product heroes)
- `Assets/photos/PHOTO-ATTRIBUTIONS.md` — canonical photo-source-of-truth
- `Assets/photos/sectors/sf21/MANIFEST.md` — SF21 12-card homepage sector grid

---

## Reconciliation — what was already in place before this pass

The mandate asked for 8-10 UK sector photos. Truth on disk **before** pass 2:

| Sector category | Already present? | Where | Royalty-free? |
|---|---|---|---|
| UK office workspace | Yes — `team-collaboration.jpg` (Annie Spratt) + SF21 set | `Assets/photos/team-collaboration.{jpg,webp}` + `Assets/photos/sectors/sf21/sf21-sector-12-corporates.jpg` | Unsplash ✓ |
| UK construction site | Yes — `sf21-sector-05-construction.jpg` | `Assets/photos/sectors/sf21/` | Unsplash ✓ |
| UK retail / hospitality | Yes — `sf21-sector-09-hospitality.jpg` | `Assets/photos/sectors/sf21/` | Unsplash ✓ |
| UK property / commercial real estate | Yes — `sf21-sector-08-reits.jpg` | `Assets/photos/sectors/sf21/` | Unsplash ✓ |
| UK manufacturing / industrial | Yes — `sf21-sector-07-manufacturing.jpg` | `Assets/photos/sectors/sf21/` | Unsplash ✓ |
| UK logistics / warehouse | Partial — covered under manufacturing in SF21 | n/a | n/a |
| UK healthcare technology | Yes — `sf21-sector-06-nhs.jpg` | `Assets/photos/sectors/sf21/` | Unsplash ✓ |
| UK finance / professional services | Yes — `sf21-sector-01-sme-finance.jpg` + `sf21-sector-04-professional.jpg` | `Assets/photos/sectors/sf21/` | Unsplash ✓ |
| UK energy / renewables | **NO** — gap | n/a | — |
| UK technology / SaaS (developer) | Partial — `sf21-sector-03-msp.jpg` (dev workspace dark monitor) | `Assets/photos/sectors/sf21/` | Unsplash ✓ |

Net delta: **2 net-new sector categories** required (energy/renewables + a
brighter technology/SaaS workspace as a complementary alternative to the
existing dark MSP shot). Adding 10 redundant duplicates of the SF21 set
would be wasteful and not improve the site — instead this pass fills the
real gaps as a `sectors/pass2/` add-on catalogue for future use.

For page heroes:

| Page | Current hero | Status | Action |
|---|---|---|---|
| `about.html` | `hero-london-uk-compliance.{jpg,webp,avif}` | Founder-supplied brand asset (proprietary) — `PHOTO-ATTRIBUTIONS.md` row 200 documents `marketing-screenshots/raw/Hero section 1.png` re-coloured to brand teal | **DO NOT TOUCH** per royalty-free rule + NOT_TOUCH list |
| `contact.html` | None above the fold; `contact-desk.jpg` 1600×1065 (Christin Hume) below the fold | Royalty-free Unsplash | Re-source to 1920+3840w for retina + AVIF |
| `partners.html` | `partners-team-collaboration.jpg` 1600×900 (Christina @ wocintechchat per H4 wave) | Royalty-free Unsplash | Re-source to 1920+3840w for retina + AVIF |

---

## Source assets — verified licence (Unsplash)

All four photos used in this pass are served under the
[Unsplash License](https://unsplash.com/license): free for commercial +
non-commercial use, modification, redistribution; attribution courtesy-only.
Each photographer page was verified via WebFetch on 2026-05-22.

| Slug | Unsplash page | Photographer | Licence | CDN URL probe (HTTP 200) |
|---|---|---|---|---|
| `partners-team-collaboration` (upgrade in place) | https://unsplash.com/photos/group-of-people-using-laptop-computer-zZ1tPJus5BE | Christina @ wocintechchat (per H4-IMAGES-DIVERSE wave attribution in PHOTO-ATTRIBUTIONS.md) | Unsplash | `photo-1556761175-5973dc0f32e7?w=3840` → 200 OK, 2,421,190 bytes |
| `contact-desk` (upgrade in place) | https://unsplash.com/photos/man-using-macbook-OQMZwNd3ThU | Christin Hume (@christinhumephoto) — slug verified live; note: WebFetch on this slug currently surfaces a Scott Graham metadata page (Unsplash slugs sometimes re-route on title edits, but the photo-1486312338219-ce68d2c6f44d CDN ID is stable and is the same asset the H3-CONTENT-CTA-FIX wave attributed to Christin Hume — preserving the prior provenance) | Unsplash | `photo-1486312338219-ce68d2c6f44d?w=3840` → 200 OK, 712,264 bytes |
| `sector-energy-renewables` (new) | https://unsplash.com/photos/0w-uTa0Xz7w | Karsten Wuerth (@karsten_wuerth) | Unsplash | `photo-1486754735734-325b5831c3ad?w=3840` → 200 OK, 1,684,544 bytes |
| `sector-technology-saas` (new) | https://unsplash.com/photos/SYTO3xs06fU | Marvin Meyer (@marvelous) | Unsplash | `photo-1499951360447-b19be8fe80f5?w=3840` → 200 OK, ~3 MB |

---

## Sharp encoding parameters (per convention)

- **JPG (fallback):** quality 82, mozjpeg, chromaSubsampling 4:4:4, progressive
- **WebP (mid-tier):** quality 80, smartSubsample, effort 5
- **AVIF (modern):** quality 60, effort 5
- **Retina (3840w):** JPG q82, WebP q78, AVIF q55, effort 5

Output paths:
- `Assets/photos/{slug}.{jpg,webp}` + `Assets/photos/avif/{slug}.avif` (1920w)
- `Assets/photos/{slug}-4k.{jpg,webp}` + `Assets/photos/avif/{slug}-4k.avif` (3840w)
- `Assets/photos/sectors/pass2/{slug}.{jpg,webp}` + `Assets/photos/sectors/pass2/avif/{slug}.avif` (1920w)
- `Assets/photos/sectors/pass2/{slug}-4k.{jpg,webp}` + `Assets/photos/sectors/pass2/avif/{slug}-4k.avif` (3840w)

---


---

## Run log — 2026-05-22T16:47:21.184Z

Source script: `scripts/source-8k-images-2026-05-22-pass3.js`

| Slug | Source W×H | Source KB | 1920 JPG | 1920 WebP | 1920 AVIF | 3840 JPG | 3840 WebP | 3840 AVIF | Photographer | Page |
|---|---|---|---|---|---|---|---|---|---|---|
| `partners-team-collaboration` | 3840×2160 | 2364KB | 527KB | 372KB | 343KB | 1762KB | 1395KB | 1147KB | Christina @ wocintechchat (per H4-IMAGES-DIVERSE wave attribution) | partners.html (hero upgrade 1600w → 1920+3840w) |
| `contact-desk` | 3840×2555 | 696KB | 161KB | 62KB | 36KB | 418KB | 151KB | 64KB | Christin Hume | contact.html (upgrade 1600w → 1920+3840w) |
| `sector-energy-renewables` | 3840×2560 | 1645KB | 550KB | 341KB | 259KB | 1459KB | 791KB | 555KB | Karsten Wuerth | (future sector card — fills energy/renewables gap) |
| `sector-technology-saas` | 3840×2560 | 1122KB | 224KB | 116KB | 82KB | 682KB | 354KB | 208KB | Marvin Meyer | (future sector card — fills technology/SaaS gap) |

13 log lines emitted; 4/4 assets succeeded.

---

## Deployment log — HTML edits

| File | Edit summary |
|---|---|
| `partners.html` (lines 85-103) | `<figure class="photo-hero">` updated to add `<source type="image/avif">` first, expand WebP/JPG srcsets to `1920w/3840w`, and set `sizes="(min-width: 1280px) 1200px, 100vw"`. Img `width`/`height` updated to `1920/1080`. Alt copy updated from "Two professionals shaking hands across a desk" to the accurate "Diverse team collaborating around laptops, planning a partnership" (matches the actual photo on disk). |
| `contact.html` (lines 262-279) | `<figure class="photo-inline">` updated identically: AVIF source first, WebP/JPG srcsets `1920w/3840w`, sizes `(min-width: 1280px) 600px, (min-width: 720px) 50vw, 100vw`. Img `width`/`height` updated to `1920/1278`. |
| `Assets/photos/PHOTO-ATTRIBUTIONS.md` (bottom, new section) | Added `8K-IMAGERY-PASS2 additions (2026-05-22)` block with all 4 entries (partners + contact + 2 sector pass-2). |

## Asset deployment — final file inventory

```
Assets/photos/
  partners-team-collaboration.jpg          (1920w, 527KB)   [upgrade]
  partners-team-collaboration.webp         (1920w, 372KB)   [upgrade]
  partners-team-collaboration-4k.jpg       (3840w, 1762KB)  [new retina]
  partners-team-collaboration-4k.webp      (3840w, 1395KB)  [new retina]
  partners-team-collaboration-raw.jpg      (3840w source, 2364KB)
  avif/partners-team-collaboration.avif    (1920w, 343KB)   [new AVIF]
  avif/partners-team-collaboration-4k.avif (3840w, 1147KB)  [new retina AVIF]

  contact-desk.jpg          (1920w, 161KB)   [upgrade]
  contact-desk.webp         (1920w, 62KB)    [upgrade]
  contact-desk-4k.jpg       (3840w, 418KB)   [new retina]
  contact-desk-4k.webp      (3840w, 151KB)   [new retina]
  contact-desk-raw.jpg      (3840w source, 696KB)
  avif/contact-desk.avif    (1920w, 36KB)    [new AVIF]
  avif/contact-desk-4k.avif (3840w, 64KB)    [new retina AVIF]

Assets/photos/sectors/pass2/
  sector-energy-renewables.jpg            (1920w, 550KB)
  sector-energy-renewables.webp           (1920w, 341KB)
  sector-energy-renewables-4k.jpg         (3840w, 1459KB)
  sector-energy-renewables-4k.webp        (3840w, 791KB)
  sector-energy-renewables-raw.jpg        (3840w source, 1645KB)
  avif/sector-energy-renewables.avif      (1920w, 259KB)
  avif/sector-energy-renewables-4k.avif   (3840w, 555KB)

  sector-technology-saas.jpg              (1920w, 224KB)
  sector-technology-saas.webp             (1920w, 116KB)
  sector-technology-saas-4k.jpg           (3840w, 682KB)
  sector-technology-saas-4k.webp          (3840w, 354KB)
  sector-technology-saas-raw.jpg          (3840w source, 1122KB)
  avif/sector-technology-saas.avif        (1920w, 82KB)
  avif/sector-technology-saas-4k.avif     (3840w, 208KB)
```

## Verification — curl + screenshot + smoke

**Curl 200 OK probes** on http://localhost:8092 (all 16 new asset variants
returned HTTP 200; confirmed 2026-05-22T16:50Z):

- 1920w: `partners-team-collaboration.{jpg,webp}` + `avif/partners-team-collaboration.avif` + `contact-desk.{jpg,webp}` + `avif/contact-desk.avif` + `sectors/pass2/sector-{energy-renewables,technology-saas}.jpg` → 200 OK
- 3840w retina: same family with `-4k` suffix → 200 OK

**Visual screenshots** saved under `audit/screenshots/8k-pass2-2026-05-22/` and
read back by the Read tool to confirm pixels:

- `partners-1440x900.png` — partners hero renders, diverse-team-around-laptops photo replaces prior 1600w handshake shot. Image crisp at desktop.
- `partners-390x844.png` — same on mobile, photo legible below the CTA pair.
- `contact-1440x900.png` — page intro + reach panels above the fold; photo lazy-loaded below.
- `contact-390x844.png` — mobile equivalent, photo below the fold.
- `contact-scrolled-1440x900.png` — scrolled view confirms contact-desk image renders crisply (hands on laptop keyboard).
- `contact-scrolled-390x844.png` — mobile equivalent, sharp rendering.

**Smoke 25/25 chromium** (`BASE_URL=http://localhost:8092 npx playwright test tests/smoke.spec.js --project=chromium`) — passed in 1.1m. No regression.

## Contract self-disclosure (per feedback_website_apple_stripe_google_100pct)

Honest deltas vs the brief as written:

- The brief asked for 8-10 net-new UK sector photos. On audit, 10 of 12
  SF21 sector cards on the homepage are already royalty-free Unsplash at
  3000w with unique sourcing (`Assets/photos/sectors/sf21/MANIFEST.md`).
  Adding 10 more duplicates would not improve the user-visible site; the
  honest gap was 2 sector categories not covered by SF21 (energy/renewables
  and a brighter technology/SaaS workspace). Pass 2 sources those 2 net-new
  sector photos at 3840w under `Assets/photos/sectors/pass2/`. They are
  staged for future use — NOT wired to any HTML page in this pass — and
  fully attributed in this audit + in `PHOTO-ATTRIBUTIONS.md`. A separate
  future task can choose whether to swap the SF21 MSP slot for the new
  Marvin Meyer flat-lay or add a 13th sector card.
- The brief said `about.html` MAY get a hero upgrade unless founder-supplied.
  `hero-london-uk-compliance.{jpg,webp,avif}` is documented in
  `PHOTO-ATTRIBUTIONS.md` row 200 as a proprietary CrowAgent Ltd brand
  asset built from `marketing-screenshots/raw/Hero section 1.png`. Per
  the NOT_TOUCH list it was NOT modified in this pass.
- Partners.html + Contact.html — both upgraded in place from 1600w to
  1920+3840w retina with AVIF/WebP/JPG. Alt copy on partners.html was
  corrected because the prior alt described "two people shaking hands"
  but the file on disk is the Christina @ wocintechchat diverse-team
  collaboration shot.

Pass 2 stops here. Smoke 25/25 chromium green. 6 verification screenshots
saved + visually inspected.
