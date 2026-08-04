# Third-party logo provenance

Every vendor mark this site serves is another company's registered trade mark. This
file is the record of where each one came from and what permission it is served
under, in the same spirit as `Assets/photos/PHOTO-ATTRIBUTIONS.md`: a verifiable
provenance record rather than a courtesy.

It is enforced, not decorative. `astro/scripts/check-vendor-logos.js` fails the
build if `astro/src` references a mark in this directory that has no row below, or
if a row below names a file that is not on disk. **A mark cannot be added to the
site without a row here, and a row cannot outlive its file.**

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

## The record

| File | Vendor / product | Source | Retrieved | Permission relied on | Status |
|---|---|---|---|---|---|
| `color-confluence.svg` | Atlassian — Confluence | `@atlaskit/logo` 21.4.1, published to npm by Atlassian (`dist/esm/artifacts/logo-components/confluence/icon.js`, the artwork Atlassian's own products render). Tile `#1868db`, glyph white, unaltered. | 2026-08-04 | [Atlassian Trademark and Brand Guidelines](https://www.atlassian.com/legal/trademark): "you have permission to use Atlassian's trademarks to promote Atlassian and its products or to identify and describe that your own products are designed for and compatible with Atlassian's products", provided logos are "depicted exactly as shown … without any modification (aside from re-sizing), and without combining, transposing, or incorporating Atlassian's logo with your own logo". | ✅ Current mark, current generation, permission on point |
| `color-microsoft.svg` | Microsoft — corporate symbol | Original download URL UNRECORDED (predates this file). Hex values corrected on 2026-08-04 from `#F1511B/#80CC28/#00ADEF/#FBBC09` to the published `#F25022/#7FBA00/#00A4EF/#FFB900`. | Colours corrected 2026-08-04 | None held. See the open items below. | ⚠️ Stands in for SharePoint and OneDrive, which have their own marks. Symbol used without the logotype. Licence not held. |
| `color-microsoft-entra-id.svg` | Microsoft — Entra ID | Original download URL UNRECORDED. Geometry and the six fills (`#6df`, `#cbf8ff`, `#0294e4`, `#96bcc2`, `#225086`, `#074793`) match `Microsoft Entra ID color icon.svg` in Microsoft's [Entra architecture icons](https://learn.microsoft.com/en-us/entra/architecture/architecture-icons) pack. | Verified against the pack 2026-08-04 | None held. That pack's terms permit "architectural diagrams, training materials, or documentation" and say "Don't use Microsoft product icons in marketing communications." | ⚠️ Correct current mark; the licence it is published under does not cover this page. |
| `color-microsoft-teams.svg` | Microsoft — Teams | Original download URL UNRECORDED. Matches the 2023-generation Teams icon. | — | None held. | ⚠️ One generation behind: Microsoft refreshed the Microsoft 365 app icons on 2025-10-16. |
| `color-google.svg` | Google — corporate "G" | Original download URL UNRECORDED. | — | None held. | ⚠️ Stands in for Google Workspace, which is a different mark. Google restricts the "G" and forbids it on backgrounds that inhibit legibility. |
| `color-google-drive.svg` | Google — Drive | Original download URL UNRECORDED. | — | None held. Google product icons require permission via the Partner Marketing Hub. | ⚠️ Permission not requested. |
| `color-slack.svg` | Slack | Original download URL UNRECORDED. All four fills (`#E01E5A`, `#36C5F0`, `#2EB67D`, `#ECB22E`) and the geometry match the current 2019 octothorpe, which Slack has not refreshed. | Verified current 2026-08-04 | [Slack Brand Guidelines](https://slack.com/terms-of-service/slack-brand) permit use of the supplied files unmodified. | ✅ Current mark. Served unmodified since 2026-08-04, when a sitewide `opacity: 0.86` was removed. |
| `color-okta.svg` | Okta | Original download URL UNRECORDED. A plain ring in `#007DC1`. | — | None held. | ⚠️ Okta's current mark is the faceted "aura", and Okta publishes only black and white wordmark PNGs — no colour symbol exists to replace this with. Not an official asset. |
| `color-ping-identity.svg` | Ping Identity | Original download URL UNRECORDED. Red square `#B8232F` with a white "Ping" knocked out. | — | None held. | ⚠️ Superseded. Ping's current mark is a solid `#D20E0F` square beside a `#263746` "Ping Identity" wordmark. |

## Open items for the owner

These are recorded rather than fixed, because each one is a commercial or legal
decision and not a decision to take inside a build script. Nothing below was
introduced on 2026-08-04; all of it was found that day.

1. **Microsoft.** The [Microsoft logo third-party usage guidance](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks)
   (August 2025) states that "as a general rule, a formal license is required to use
   the Microsoft logo", that "the symbol and logotype must be used together", and
   that the logo must not be altered or reduced to a single colour. The Microsoft 365
   trademark guidelines add that "a trademark use license is required in order to …
   use the Microsoft 365 trademarks and Microsoft 365 app icons", and that product
   app icons must not be used "decoratively or as logos". Three Microsoft marks are
   currently served here and no licence is held. **This is the largest open item.**
2. **SharePoint and OneDrive show the Microsoft corporate symbol, not their own
   marks.** Both products have distinct published icons. They are not used here
   because the only obtainable versions are either a superseded generation or are
   published under the architecture-icon terms that exclude marketing. Correcting
   this properly means holding the licence in item 1.
3. **Google Workspace shows the Google "G".** Google's guidance says the "G" is for
   referring to Google the company, that a partner must not use it for marketing
   without a co-branding arrangement, and "don't place the Google G on backgrounds
   that inhibit legibility". This site's background is `--c-bg`, a dark navy. The
   product's own mark is a wide "Google Workspace" wordmark with no standalone
   glyph, so it cannot occupy the 18px chip slot at all.
4. **Okta and Ping Identity are both showing a mark the vendor no longer uses.**
   Neither can be corrected from an official source at the size this design needs:
   Okta publishes no colour symbol, and Ping publishes only a horizontal lockup
   whose square cannot be extracted without deconstructing it.
5. **`color-microsoft-teams.svg` is one generation behind.** Microsoft's October 2025
   refresh changed it. No official current file is obtainable outside the licensed
   channel in item 1.

The honest options for 2–5 are: obtain the licence or permission, or drop back to
the neutral dot the components already support. Substituting an approximation is
not one of them.
