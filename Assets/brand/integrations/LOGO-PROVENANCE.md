# Third-party logo provenance

Every vendor mark this site serves is another company's registered trade mark. This
file is the record of where each one came from and what permission it is served
under, in the same spirit as `Assets/photos/PHOTO-ATTRIBUTIONS.md`: a verifiable
provenance record rather than a courtesy.

It is enforced, not decorative. `astro/scripts/check-vendor-logos.js` fails the
build if `astro/src` references a mark in this directory that has no row below, if
a row below names a file that is not on disk, or if `astro/src` references a mark
whose row is marked `WITHDRAWN`. **A mark cannot be added to the site without a
row here, a row cannot outlive its file, and a withdrawal cannot be quietly
reversed.**

## The rules this record exists to keep

1. **Official assets only.** A mark is taken from the vendor's own published brand
   or press channel, or from a package the vendor itself publishes. It is never
   redrawn, traced, approximated, or lifted from a third-party icon pack's
   interpretation.
2. **No modification.** Not recoloured, not made monochrome, not cropped, not
   distorted, not held at reduced opacity. Several vendors here (Atlassian,
   Microsoft and Slack among them) forbid each of those in writing.
3. **No implied endorsement.** A mark identifies a product CrowMark connects to.
   Nothing on `/integrations` or the homepage says "partner", "certified",
   "approved" or "powered by" beside one, and nothing may be added that does.
4. **Served locally.** No vendor CDN is ever hotlinked. `astro/scripts/check-csp.js`
   fails the build on a third-party origin, and it should.
5. **When in doubt, no mark.** The chip and card components both fall back to a
   neutral token-coloured dot. An accurate absence beats an inaccurate logo, and
   the fallback exists precisely so nobody is tempted to invent one.

## The treatment, decided 2026-08-04 (A-38)

**A mark is served only where it is the vendor's own current mark for the product
named beside it. Where it is not, and cannot be obtained from the vendor, the
product is identified BY NAME and the icon slot holds the neutral dot.**

That rule is about ACCURACY, and it is deliberately not a rule about licences.
Six connectors failed it on 2026-08-04 and lost their mark — SharePoint, OneDrive,
Google Workspace, Microsoft Teams, Okta and Ping Identity, which is FIVE files,
because SharePoint and OneDrive were sharing one. The evidence for each is in its
row below and every one was re-checked against the vendor's own brand or press
channel that day. Nothing a reader can use was lost: both surfaces already print
the product name in text beside the icon slot, so a withdrawn mark costs the row
its picture and not its meaning. Microsoft's guidance names this alternative in as
many words — a third party may write that its product works with Microsoft Teams,
and may not draw the Teams icon.

**The licence question is a different question and it is still open.** Two marks
that are served without a licence — Entra ID and Google Drive — are the vendor's
correct current artwork, so the accuracy rule does not reach them and they stay.
Deciding whether to hold a licence is a commercial call and it is open item 1
below, unchanged. Mixing the two questions would make a withdrawal look like a
legal opinion, and it is not one.

**The withdrawn files stay on disk and keep their rows.** Restoring one is a
single `logo:` line in `astro/src/data/integrations.ts` on the day the vendor
publishes an obtainable current asset, or the day a licence is held. The gate
prints every recorded mark that nothing references on every run, which is what
keeps the question being asked.

## The record

| File | Vendor / product | Source | Retrieved | Permission relied on | Status |
|---|---|---|---|---|---|
| `color-confluence.svg` | Atlassian — Confluence | `@atlaskit/logo` 21.4.1, published to npm by Atlassian (`dist/esm/artifacts/logo-components/confluence/icon.js`, the artwork Atlassian's own products render). Tile `#1868db`, glyph white, unaltered. | 2026-08-04 | [Atlassian Trademark and Brand Guidelines](https://www.atlassian.com/legal/trademark): "you have permission to use Atlassian's trademarks to promote Atlassian and its products or to identify and describe that your own products are designed for and compatible with Atlassian's products", provided logos are "depicted exactly as shown … without any modification (aside from re-sizing), and without combining, transposing, or incorporating Atlassian's logo with your own logo". | ✅ Current mark, current generation, permission on point |
| `color-microsoft.svg` | Microsoft — corporate symbol | Original download URL UNRECORDED (predates this file). Hex values corrected on 2026-08-04 from `#F1511B/#80CC28/#00ADEF/#FBBC09` to the published `#F25022/#7FBA00/#00A4EF/#FFB900`. | Colours corrected 2026-08-04 | None held. | ⛔ **WITHDRAWN 2026-08-04 — withdrawals 1 and 2.** It was standing in for SharePoint AND OneDrive, two products with their own marks: SharePoint's is three teal circles, OneDrive's is a blue cloud. This says "a Microsoft product", which is true and is not what a logo slot is for. Neither product's own current icon is obtainable — see the Microsoft open item. Both are now named in text. |
| `color-microsoft-entra-id.svg` | Microsoft — Entra ID | Original download URL UNRECORDED. Geometry and the six fills (`#6df`, `#cbf8ff`, `#0294e4`, `#96bcc2`, `#225086`, `#074793`) match `Microsoft Entra ID color icon.svg` in Microsoft's [Entra architecture icons](https://learn.microsoft.com/en-us/entra/architecture/architecture-icons) pack. | Verified against the pack 2026-08-04 | None held. That pack's terms permit "architectural diagrams, training materials, or documentation" and say "Don't use Microsoft product icons in marketing communications." | ⚠️ Correct current mark; the licence it is published under does not cover this page. |
| `color-microsoft-teams.svg` | Microsoft — Teams | Original download URL UNRECORDED. Matches the 2023-generation Teams icon. | — | None held. | ⛔ **WITHDRAWN 2026-08-04 — withdrawal 4.** One generation behind: Microsoft refreshed the Microsoft 365 app icons on 2025-10-16, and the current file is licence-gated. Microsoft's own trademark guidance names the alternative taken here: a third party may write that its product works with Microsoft Teams and may not use the icon. Named in text. |
| `color-google.svg` | Google — corporate "G" | Original download URL UNRECORDED. | — | None held. | ⛔ **WITHDRAWN 2026-08-04 — withdrawal 3.** It was standing in for Google Workspace, which is a different mark. Re-checked at Google's Partner Marketing Hub on 2026-08-04: Workspace does not appear in Google's logos-and-icons list at all, and the guidance on the "G" reads "Use the Google G to refer to Google (the company) … Don't use the Google G in marketing materials for a business or to imply endorsement from Google." Named in text. |
| `color-google-drive.svg` | Google — Drive | Original download URL UNRECORDED. | — | None held. Google product icons require permission via the Partner Marketing Hub. | ⚠️ Permission not requested. |
| `color-slack.svg` | Slack | Original download URL UNRECORDED. All four fills (`#E01E5A`, `#36C5F0`, `#2EB67D`, `#ECB22E`) and the geometry match the current 2019 octothorpe, which Slack has not refreshed. | Verified current 2026-08-04 | [Slack Brand Guidelines](https://slack.com/terms-of-service/slack-brand) permit use of the supplied files unmodified. | ✅ Current mark. Served unmodified since 2026-08-04, when a sitewide `opacity: 0.86` was removed. |
| `color-okta.svg` | Okta | Original download URL UNRECORDED. A plain ring in `#007DC1`. | — | None held. | ⛔ **WITHDRAWN 2026-08-04 — withdrawal 5.** Never an official asset: Okta's current mark is the faceted "aura". Re-checked at [Okta's press room](https://www.okta.com/press-room/media-assets/) on 2026-08-04 — one "Logos & Boilerplates" download, gated behind [Terms of Use for Okta Content](https://www.okta.com/terms-of-use-for-okta-content/), which reads "You may not use the Okta Content in any manner that implies sponsorship or endorsement by Okta without an express written permission and license from Okta" and directs trademark questions to trademarks@okta.com. No colour standalone symbol is published. Named in text. |
| `color-ping-identity.svg` | Ping Identity | Original download URL UNRECORDED. Red square `#B8232F` with a white "Ping" knocked out. | — | None held. | ⛔ **WITHDRAWN 2026-08-04 — withdrawal 6.** Superseded: it is the pre-2023 mark. Re-checked on 2026-08-04 — `pingidentity.com/en/company/brand-guidelines.html` returns 404, and the newsroom publishes no media kit and no brand assets, only press@pingidentity.com. The one current colour file Ping serves is the horizontal colour lockup in its own site chrome (Logo-Ping-Brand-Horizontal-Color, named here without backticks on purpose — a filename in backticks in this document is read by the gate as a row claiming an asset on disk), and its square cannot be extracted without deconstructing the lockup. Named in text. |

## Open items for the owner

Items 2 to 5 of the list this section used to hold were the six inaccurate marks,
and they are closed: on 2026-08-04 each was re-checked at the vendor's own channel,
none could be corrected from an official source, and all six were withdrawn to a
name in text. What is left is the one question a build script must not answer.

1. **A licence, for the two correct marks that are served without one.**
   `color-microsoft-entra-id.svg` and `color-google-drive.svg` are the vendor's own
   current artwork for the products they sit beside, so nothing on this site is
   inaccurate. But no permission is held for either.

   - The [Microsoft logo third-party usage guidance](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks),
     re-read 2026-08-04, states that "our logos, app and product icons,
     illustrations, photographs, videos, and designs can never be used without an
     express license", and that a third party may state compatibility in text —
     "works with Microsoft Teams" — without using the icon. Entra ID's own file is
     from the [Entra architecture icons](https://learn.microsoft.com/en-us/entra/architecture/architecture-icons)
     pack, whose terms permit "architectural diagrams, training materials, or
     documentation" and say "Don't use Microsoft product icons in marketing
     communications."
   - Google's guidance, re-read 2026-08-04 at the Partner Marketing Hub, restricts
     its logos in "marketing materials for a business" and points a business with a
     co-branding relationship at a signed partnership.

   Three ways to close it, and they are the only three: obtain the licence, ask the
   vendor for written permission for this specific use, or withdraw these two the
   same way the six were withdrawn. Substituting an approximation is not one of
   them, and neither is leaving it undecided indefinitely.

2. **Two vendors are worth re-checking rather than assumed permanent.** Okta and
   Ping Identity both publish a mark somewhere and neither publishes a usable one
   today. If Okta ever ships a colour symbol, or Ping ever publishes a media kit,
   withdrawals 5 and 6 become a one-line restore each.

Nothing in this file implies a partnership, a certification or an endorsement, and
nothing added to it may. A mark here identifies a product CrowMark connects to.
