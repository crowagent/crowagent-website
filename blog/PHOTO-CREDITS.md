# Blog photo credits

Six of the eight blog posts carry a real photograph, sourced from Pexels and used under the Pexels
Licence, which permits free commercial use without attribution. Attribution is recorded here anyway as
a matter of good practice. The other two carry generated brand artwork and are listed separately below,
so nothing in this file implies a photograph where there is none.

Licence terms: https://www.pexels.com/license/

Files live in `/Assets/blog-photos/` as a JPEG plus a WebP of the same name, with a
`-400w` / `-600w` / `-800w` / `-1200w` WebP ladder for the srcset on `blog/index.html`. Each article
references the set through a `<picture>` element.

**Filenames describe the picture, not the post.** They used to be named after whichever article first
used them, which is how `ppn-002-guide.jpg` ended up as the hero of three unrelated posts and stayed
there after `ppn-002-guide.html` itself was deleted. Renamed 2026-07-30; the licence and photographer
below are unchanged, only the file name moved.

| Image file | What it shows | Used as the hero of | Photo page | Photographer | Licence |
| --- | --- | --- | --- | --- | --- |
| `writing-a-tender-response.jpg` / `.webp` (was `ppn-002-social-value-explained`) | Close-up of two people working through a printed document with a pen | `method-statement-that-scores.html` | https://www.pexels.com/photo/close-up-shot-of-a-person-writing-on-a-contract-7841499/ | RDNE Stock project | Pexels Licence |
| `social-value-in-the-community.jpg` / `.webp` (was `social-value-themes-explained`) | Volunteers handing out food and water at a community aid table | `ppn-002-social-value-guide.html` | https://www.pexels.com/photo/a-group-of-volunteers-assisting-an-elderly-person-on-a-black-wheelchair-for-charity-6646917/ | RDNE Stock project | Pexels Licence |
| `bid-team-reviewing-proposal.jpg` / `.webp` (was `ppn-002-social-value-guide`) | Three colleagues around a meeting table with documents and a laptop | `private-sector-rfp-pqq-guide.html` | https://www.pexels.com/photo/employees-sitting-at-table-in-office-discussing-12903101/ | Mizuno K | Pexels Licence |
| `uk-parliament-westminster.jpg` / `.webp` (was `ppn-002-guide`) | The Houses of Parliament and Elizabeth Tower from Westminster Bridge | `procurement-act-2023-sme-guide.html` | https://www.pexels.com/photo/westminster-in-london-19955275/ | Amandeep Singh | Pexels Licence |
| `regulatory-updates-2026.jpg` / `.webp` | Ring binders, loose papers and notebooks on a meeting room table | `regulatory-updates-2026.html` | https://www.pexels.com/photo/office-documentation-and-papers-laying-on-desks-10347152/ | Ron Lach | Pexels Licence |
| `social-value-portal-vs-crowmark.jpg` / `.webp` | Two desktop computers side by side on a wooden desk | `social-value-portal-vs-crowmark.html` | https://www.pexels.com/photo/two-imac-s-with-keyboard-and-phones-on-desk-326503/ | Tranmautritam | Pexels Licence |

## Generated artwork (not a photograph)

| Image file | What it shows | Used as the hero of | Source |
| --- | --- | --- | --- |
| `frameworks-and-dps-explained.jpg` / `.webp` | Abstract CrowAgent brand field: a ridge of green and blue bars beside the four-bar mark | `frameworks-and-dps-explained.html` | `node scripts/generate-og-images.js --heroes-only` |
| `find-first-public-sector-contract.jpg` / `.webp` | Abstract CrowAgent brand field: a ridge of violet and teal bars beside the four-bar mark | `find-first-public-sector-contract.html` | `node scripts/generate-og-images.js --heroes-only` |

Two posts have no honest photographic match, so they get branded artwork from the same satori pipeline
that renders the OG cards. Nothing is downloaded and nothing is hand-drawn.

- **Frameworks and DPS.** None of the photographs depicts a framework agreement, a dynamic purchasing
  system or a call-off competition, and each one is already the honest match for another article.
- **Finding your first contract.** See the note on `mfa-mandatory-2026` below.

The two are generated with different palettes and, beyond two, different mirroring, because both are
listed on `blog/index.html` and artwork that differs only in bar heights is not a difference at
thumbnail size. See the `ARTICLE_HEROES` block in `scripts/generate-og-images.js` for the geometry, the
per-slug seed, the set-position palette assignment, and why the artwork carries no text.

## On file but not in use

| Image file | Why it is not used |
| --- | --- |
| `searching-for-tenders.jpg` / `.webp` (was `mfa-mandatory-2026`) | Catalogued as "person holding smartphone while using laptop" and it passes as tender research at thumbnail size, but at full width the laptop screen is unmistakably an IDE full of source code. On a guide to searching Find a Tender that is a wrong-subject photograph, so that post gets generated artwork instead. Kept on disk because a future post about procurement software could use it honestly; `build-dist.js` prunes it from `dist/` for as long as nothing references it. Credit: https://www.pexels.com/photo/person-holding-smartphone-while-using-laptop-1181244/, Christina Morillo, Pexels Licence. |

## Editing notes

- One image per post, and one post per image. Measured 2026-07-30 before the change: eight posts plus
  `blog/index.html` shared four photographs; `ppn-002-guide.jpg` alone appeared on nine pages and
  three posts used it as their hero. A related-article card now always shows the hero of the post it
  links to, so no page shows the same picture twice and no post shows its own hero again lower down.
- `bid-team-reviewing-proposal.jpg` is a landscape crop (1600 x 1000) taken from the centre of the
  original portrait frame. No other content changes were made to any photograph.
- All photographs were resized to 1600px wide and re-encoded (JPEG quality 82 with mozjpeg, WebP
  quality 76 to 82) so that every file stays under 300KB. The width ladder is WebP quality 76.
- `Assets/blog-photos/` is pruned by reachability on every `node scripts/build-dist.js` run, so an
  image that stops being referenced stops shipping. Deleting a post therefore also retires its picture,
  and this table is the record of what that picture was.
