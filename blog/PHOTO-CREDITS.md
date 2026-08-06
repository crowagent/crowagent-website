# Blog photo credits

Most blog posts carry a real photograph, sourced from Pexels and used under the Pexels Licence, which
permits free commercial use **without attribution**. The credits below are recorded as a matter of
practice, not because anything requires them. Two posts published on 2026-08-05 carry generated
artwork instead, and the table marks them as such.

Licence terms: https://www.pexels.com/license/ — "All photos and videos on Pexels are free to use.
Attribution is not required. Giving credit to the photographer or Pexels is not necessary but always
appreciated." Every photo page listed below was checked individually for its own "Free to use" badge
and licence link; the licence is not assumed from the site.

**Every PHOTOGRAPH on this site is licence-free stock, and none of them is generated.** Candidates
uploaded under contributor accounts that advertise generated imagery were rejected during the
2026-08-04 pass for that reason, whatever their licence said, and that rule still stands for anything
presented as a photograph.

This blanket statement used to read "no image on this site is AI-generated", and that stopped being
true on 2026-08-05 when two posts shipped with generated heroes. Corrected on 2026-08-06 rather than
left standing: a sweeping claim in the file that exists to be the record is worse than no claim, and
the two exceptions are named in the table below rather than hidden by the sentence above it.

## No credit is shown on the page, and that is not the same as no record

Until 2026-08-04 `components/blog/PostImage.astro` printed a visible "Photograph: …" caption over
every hero, and darkened the lower third of the picture with a scrim so the caption would be legible.
The owner's instruction of 2026-08-04 was that the blog images "must not need to mention credits of
photographer". The caption is gone, the scrim went with it because it existed only to serve the
caption, and **this file is now the only record** — which is why it is kept current rather than
allowed to rot.

## Where the files come from

`scripts/build-blog-photos.mjs` is the only thing that writes into `Assets/blog-photos/`. It cuts the
master, applies any recorded exposure correction, and emits:

| | |
| --- | --- |
| `{name}.jpg` | the fallback every browser can read |
| `{name}.webp` · `{name}.avif` | the full-size modern pair |
| `{name}-400w` `-600w` `-800w` `-1200w` | in **both** `.webp` and `.avif` |

Encoders: JPEG quality 82 with mozjpeg; WebP quality 82 at full size and 76 on the ladder; AVIF
quality 60 at effort 6. The script **refuses to overwrite an existing output** unless `--force` is
passed, because `/Assets/*` is served `immutable` for a year and `scripts/build-dist.js` fails the
build when the bytes behind an unversioned URL move.

**Filenames describe the picture, not the post.** They used to be named after whichever article first
used them, which is how `ppn-002-guide.jpg` ended up as the hero of three unrelated posts and stayed
there after `ppn-002-guide.html` itself was deleted.

**Two registries, one set of files.** The Astro rebuild resolves slug → file through
`astro/src/components/blog/heroes.ts`. The legacy `blog/*.html` pages still reference their own
originals directly, which is why files replaced on 2026-08-04 are still on disk and still listed
below rather than deleted.

## In use — the Astro blog

| Image file | What it shows | Hero of | Photo page | Photographer | Licence |
| --- | --- | --- | --- | --- | --- |
| `uk-parliament-westminster` | The Houses of Parliament and Elizabeth Tower from Westminster Bridge | `procurement-act-2023-sme-guide` | https://www.pexels.com/photo/westminster-in-london-19955275/ | Amandeep Singh | Pexels Licence |
| `writing-a-tender-response` | Close-up of two people working through a printed document with a pen | `method-statement-that-scores` | https://www.pexels.com/photo/close-up-shot-of-a-person-writing-on-a-contract-7841499/ | RDNE Stock project | Pexels Licence |
| `social-value-in-the-community` | Volunteers handing out food and water at a community aid table | `ppn-002-social-value-guide` | https://www.pexels.com/photo/a-group-of-volunteers-assisting-an-elderly-person-on-a-black-wheelchair-for-charity-6646917/ | RDNE Stock project | Pexels Licence |
| `bid-team-reviewing-proposal` | Three colleagues around a meeting table with documents and a laptop | `private-sector-rfp-pqq-guide` | https://www.pexels.com/photo/employees-sitting-at-table-in-office-discussing-12903101/ | Mizuno K | Pexels Licence |
| `hm-treasury-whitehall` **(new 2026-08-04)** | The colonnaded stone facade and royal arms of a Whitehall government building against a clear blue sky | `regulatory-updates-2026` | https://www.pexels.com/photo/hm-treasury-building-in-london-england-17718824/ | Jagjeet Dhuna | Pexels Licence |
| `reviewing-charts-together` **(new 2026-08-04)** | Two colleagues holding printed bar-chart reports side by side, one pointing at a row with a pencil | `social-value-portal-vs-crowmark` | https://www.pexels.com/photo/two-people-discussing-graphs-on-printouts-7691673/ | Yan Krukau | Pexels Licence |
| `office-files-on-shelves` **(new 2026-08-04)** | Shelves of red and blue lever-arch files, each with a handwritten label on its spine | `frameworks-and-dps-explained` | https://www.pexels.com/photo/colorful-office-files-on-a-shelf-34293526/ | Zulfugar Karimov | Pexels Licence |
| `workshop-owner-at-a-laptop` **(new 2026-08-04)** | A tradesperson typing on a laptop at a workbench, with hand tools and offcuts beside it | `find-first-public-sector-contract` | https://www.pexels.com/photo/crop-craftsman-working-on-laptop-in-workplace-5973975/ | Ono Kosuki | Pexels Licence |
| `carbon-reduction-plan-ppn-0621-sme-guide` **(new 2026-08-05)** | Solar panels in front of a modern low-rise office building | `carbon-reduction-plan-ppn-0621-sme-guide` | Generated, not photographed. See below. | n/a | Generated artwork, no third party rights |
| `ai-tender-evaluation-uk-public-sector` **(new 2026-08-05)** | A laptop on a desk displaying analytics charts | `ai-tender-evaluation-uk-public-sector` | Generated, not photographed. See below. | n/a | Generated artwork, no third party rights |

### The two 2026-08-05 images are generated artwork, not photographs

Confirmed by the owner on 2026-08-06: both were produced with Gemini, so there is no third party
licence to record and no photographer to credit. They are listed in the table above rather than in the
"Generated artwork" section further down, because that section records images RETIRED from the Astro
blog and these two are in use.

They arrived in commit `e91db4c5` and were added to `components/blog/heroes.ts` and to
`scripts/build-blog-photos.mjs` but not to this file, which is what prompted the check. Two
measurements from 2026-08-06 are worth keeping, because they are what a future reader would otherwise
have to re-derive:

- Both are **1376 x 768**, not the 1600 x 900 every photographic master here is cut to. Close to 16:9
  but not exactly it, so `.pi__frame` trims a little rather than nothing.
- Both carry **no EXIF, no ICC profile and no XMP**, unlike every photograph above, which retains its
  source metadata.


### Modifications made to these photographs

The Pexels Licence permits editing. What it does not permit is an unrecorded edit, because then the
file on disk and this record disagree about what the photograph is.

- The four new masters are cut to **1600 x 900 (16:9)** with a centre crop. 16:9 is the ratio
  `.pi__frame` renders at, so cutting the master at it stops the browser downloading rows that
  `object-fit: cover` throws away — 16% of the pixels in every file, at every rung, on the older 3:2
  masters.
- `office-files-on-shelves` is the only one with a tonal change: brightness **x1.16**. The original is
  exposed for the dim room it was shot in and closed up to near-black at thumbnail size on a dark
  page. The correction is baked into the file, once, rather than applied as a CSS `filter` — a CSS
  filter over the picture is exactly what made every blog image look washed out before this pass.
- `bid-team-reviewing-proposal.jpg` is a landscape crop (1600 x 1000) from the centre of the original
  portrait frame.
- The two 2026-08-05 images were **re-encoded on 2026-08-06** with the recipe every other file here
  uses (mozjpeg, quality 82), at their existing geometry and with no crop and no tonal change. They
  shipped as raw un-encoded JPEGs at **928 KB and 715 KB**, against a 250 KB per-image budget and
  against 188 KB for a correctly encoded 1600 x 900 file, so they were roughly five times the size of
  a larger picture. Re-encoding brought them to **193 KB and 123 KB**. Three budget exceptions had
  been opened to absorb the breach, including one raising the whole-build ceiling; all three are
  deleted, because the breach is gone rather than permitted.
- No other content changes were made to any photograph.

## Replaced on 2026-08-04, still on disk

These are still referenced by the legacy `blog/*.html` pages, so they are not deleted. If those pages
are retired, `scripts/build-dist.js` prunes these by reachability on its next run.

| Image file | What it shows | Why it was replaced | Photo page | Photographer | Licence |
| --- | --- | --- | --- | --- | --- |
| `regulatory-updates-2026` | Ring binders, loose papers and notebooks on a meeting room table | A photograph of any office at all. A guide to what changed in the procurement rules is better served by the building the rules come out of. | https://www.pexels.com/photo/office-documentation-and-papers-laying-on-desks-10347152/ | Ron Lach | Pexels Licence |
| `social-value-portal-vs-crowmark` | Two desktop computers side by side on a wooden desk | Wrong subject at full width: it is a designer's desk and one screen is unmistakably running a design tool, on a piece comparing two social value reporting platforms. | https://www.pexels.com/photo/two-imac-s-with-keyboard-and-phones-on-desk-326503/ | Tranmautritam | Pexels Licence |

## Generated artwork — retired from the Astro blog on 2026-08-04

| Image file | What it shows | Source |
| --- | --- | --- |
| `frameworks-and-dps-explained` | Abstract CrowAgent brand field: a ridge of green and blue bars beside the four-bar mark | `node scripts/generate-og-images.js --heroes-only` |
| `find-first-public-sector-contract` | Abstract CrowAgent brand field: a ridge of violet and teal bars beside the four-bar mark | `node scripts/generate-og-images.js --heroes-only` |

These two posts used to carry generated brand artwork rather than a photograph, on the argument that
neither subject had an honest photographic match: no photograph in the set depicted a framework
agreement, a dynamic purchasing system or a call-off competition.

**That argument was made while every photograph on the page was being desaturated to near-monochrome**
by the treatment in `PostImage.astro`, which made a drawn graphic and a treated photograph read as the
same kind of object. With the treatment removed they no longer do, and a register of eight entries in
which six are full-colour photographs and two are abstract bar graphics reads as two of them failing
to load. The owner's instruction was "all the images must be visble in color".

The artwork and its generator are untouched and `npm run build:og` still renders them, so this is
reversible by putting the two `file` values in `heroes.ts` back. The legacy `blog/*.html` pages still
use them.

## On file but not in use

| Image file | Why it is not used |
| --- | --- |
| `searching-for-tenders.jpg` / `.webp` (was `mfa-mandatory-2026`) | Catalogued as "person holding smartphone while using laptop" and it passes as tender research at thumbnail size, but at full width the laptop screen is unmistakably an IDE full of source code. On a guide to searching Find a Tender that is a wrong-subject photograph. `find-first-public-sector-contract` now uses `workshop-owner-at-a-laptop` instead, which is the same idea with a blank screen. Kept on disk because a future post about procurement software could use it honestly; `build-dist.js` prunes it from `dist/` for as long as nothing references it. Credit: https://www.pexels.com/photo/person-holding-smartphone-while-using-laptop-1181244/, Christina Morillo, Pexels Licence. |

## Editing notes

- One image per post, and one post per image. Measured 2026-07-30 before that change: eight posts plus
  `blog/index.html` shared four photographs; `ppn-002-guide.jpg` alone appeared on nine pages and
  three posts used it as their hero. A related-article card now always shows the hero of the post it
  links to, so no page shows the same picture twice and no post shows its own hero again lower down.
- **Check the picture at full width, not at thumbnail size.** Two photographs have been rejected for
  wrong-subject detail that is invisible in a 156px thumbnail and unmissable in a 1000px hero: an IDE
  full of source code, and a set of post-operative discharge instructions signed by a named surgeon.
- `Assets/blog-photos/` is pruned by reachability on every `node scripts/build-dist.js` run, so an
  image that stops being referenced stops shipping. Deleting a post therefore also retires its
  picture, and these tables are the record of what that picture was.
