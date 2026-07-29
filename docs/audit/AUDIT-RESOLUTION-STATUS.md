# Audit Resolution Status

**Written 2026-07-29, after the fix pass.** The three audit documents in this folder were
produced earlier the same day (01:45 to 01:53). Substantial work landed *after* they were
written, so several of their headline findings no longer describe the site. Some were never
accurate. This file records what was verified, how, and what is actually left.

Read this before actioning anything in the other three documents.

**Method note that matters:** every "stale" or "false positive" verdict below was reached by
re-running the check against the current tree or the live DOM, not by assuming the fix
worked. Where I originally reported a number wrongly, that is stated plainly.

---

## Resolved — do not re-action

| Finding | Verified status |
|---|---|
| `--teal` has five values; brand-token dark palette is dead in production | **Partly wrong, real part fixed.** The dark palette is live: `data-theme="dark"` is set and the body paints `--bg` `#05070E`. `--teal`, `--teal-dark`, `--teal-oklch` and `--accent` all already resolved to `#2DD4BF` on every page tested, including sector and glossary pages where `premium-v2.css` loads *after* the token file. The real defect was narrower: `--mesh-teal` and `.nsp-svg .up` hardcoded the retired `#0CC9A8`, so homepage live-panel bars and shot-panel figures painted the old teal beside elements painting the new one. Fixed in `83529338`. Verified by scanning every element's computed `color`/`backgroundColor`/`borderColor`/`fill`: homepage 0 legacy / 139 current, contact.html 0 / 85. |
| 1,841 `!important` declarations | **Number was correct; my later "2,370" was wrong** (it counted `styles.css`, `styles.purged.css` and `styles.min.css`, which no page loads). Now **1,758** after removing 241 provably dead rules across 14 stylesheets. The remaining 1,036 in `nav-global-fix-2026-05-27.css` are architectural, not debt: `nav-inject.js` injects that sheet last precisely so it overrides earlier ones. Reducing it means consolidating the layered stylesheets, which is separate work and was deliberately not attempted. |
| 12 pages with no meta description or og/twitter tags | **Stale.** Current count: 0 missing description, 0 missing `og:title`, 0 missing `twitter:*`, across all 43 pages. |
| `integrations.html` missing from `sitemap.xml` | **False.** It is present. A follow-up sweep comparing every page's canonical against the sitemap found **0** pages absent. |
| `about.html` JSON-LD founding date contradicts its visible timeline | **False.** `about.html` contains no `foundingDate` property at all, so there is nothing to contradict. |
| Homepage hero and the spine section use two different three-part frames | **Stale.** Both now use Qualify / Win / Get paid. The "Find / Track / Measure / Anywhere" labels elsewhere on the homepage are the four showcase *tab names* for product screenshots, not a competing narrative frame. |
| Trust signals are near zero | **Stale.** The homepage trust grid carries six cells: UK/EU residency, AES-256 / TLS 1.3, uptime target, "figures are computed, not written", "evidence is quoted, or dropped", and "it fails out loud". |
| 15 orphaned stylesheets ship but load on zero pages | **Mostly resolved.** 11 were removed earlier; 196 further dead rules were removed from the 13 sheets that *do* load. Three remain deliberately (see below). |
| JS-injected stylesheets are invisible to any inventory that only reads `<head>` | **Correct, and now guarded.** This was a genuine blind spot that the audit itself fell into. The certification gate now has a dedicated check for assets injected by `nav-inject.js` and the module scripts; a stylesheet deleted on the strength of an HTML grep would previously have passed the gate and broken every page. |

---

## False positive — do not "fix"

**"30 of 41 pages load an identical Google Fonts `<link>` twice."**

Counting only actual stylesheet links, **0 pages** load Google Fonts more than once. The
duplicate count came from including `<link rel="preconnect" href="https://fonts.googleapis.com">`,
which is a legitimate and deliberate performance hint, not a second stylesheet. Editing 41
pages to remove these would have removed a correct optimisation.

---

## Still open

**Fonts are loaded from Google *and* self-hosted.** 42 pages load `fonts-selfhosted.css`
and *also* make one external request to `fonts.googleapis.com`. This is not redundancy that
can simply be deleted: the self-hosted set covers only Inter 400/500/600 and Plus Jakarta
Sans 600/700/800, while the Google request additionally supplies **Inter 300, Inter 700 and
JetBrains Mono 400/500**, all of which are used (weights 300 and 700 appear in served CSS,
and JetBrains Mono is referenced by at least six files). Dropping the link would break
typography.

Closing this properly means adding three or more `.woff2` files to `Assets/fonts/` and
extending `fonts-selfhosted.css`. Worth doing: it removes a render-blocking third-party
request, and a UK/EU-positioned site making an unnecessary call to Google Fonts is a
recognised GDPR exposure. Flagged rather than done because it adds binary assets to the
repo, which is the owner's call.

**Hardcoded literals.** The audit's counts of 266 hardcoded colour values and 376 hardcoded
spacing values bypassing existing tokens were not re-verified in this pass and are likely
still broadly accurate. This is the largest remaining design-system item.

**Per-page inline `<style>` blocks.** 31 of 41 pages carry a bespoke inline block on top of
the shared sheets, and 184 inline `style` attributes exist across 27 pages. The latter is
also why `style-src 'unsafe-inline'` cannot yet be dropped from the CSP; see the corrected
rationale in `_headers`.
