# crowagent-website

Marketing site for crowagent.ai, built with Astro and deployed on Cloudflare Pages.

**What ships is the `astro/` tree.** Cloudflare Pages builds it and publishes
`astro/dist`.

There is no longer a second tree. The legacy static site that used to sit at the
repository root was removed in stages: the HTML on 2026-09-01, then its
JavaScript, CSS, build pipeline and unreferenced assets on 2026-09-07. If you are
reading an older note that describes root `index.html`, `styles.css`,
`scripts.js` or a `js/` directory as a "frozen baseline", that note is stale.

## Layout

| path | what it is |
|---|---|
| `astro/` | the site. Source in `astro/src`, gates in `astro/scripts`, build output in `astro/dist` (gitignored) |
| `Assets/` | fonts, the shared OG card, blog photography and product screens, copied into the build by `astro/scripts/copy-assets.js` **only where a built page references them** |
| `_headers`, `_redirects`, `robots.txt`, `llms*.txt` | Cloudflare config and crawler files, copied into the build by `astro/scripts/copy-cf-config.js` |
| `status/` | the website board, `status/issues.json`, and the architecture views that read it |
| `tests/` | Playwright specs and the UI audit harness |
| `scripts/` | the few root tools that still do something: OG card rendering, the release audit, robots verification |

## Build and check

Everything that guards what ships lives in `astro/`:

```
cd astro && npm ci
npm run build          # the full gate chain, every gate runs even if one fails
npm run build:deploy   # what Cloudflare Pages runs
```

`npm run build` at the repository root deliberately refuses and tells you this.
So does `npm test`: the jest suite was deleted on 2026-09-07 because every test
in it loaded the legacy tree. The tests that matter are the gate chain above and
the Playwright specs (`npx playwright test`).

## Free local audits

These cost no CI minutes and are not wired into any workflow, on purpose:

```
npm run audit:release   # axe-core over every route, Lighthouse per template
npm run audit:ui        # the UI audit harness
npm run build:og:check  # which OG cards the site asks for
```

## Deploying

**A push to `main` IS a Cloudflare Pages production deploy.** It needs explicit
owner approval every time. Verify locally first: the gate chain above is the
same set of checks, and running it costs nothing.

## Open Graph cards

Most pages share one card, `SITE.defaultOgImage`. A page that wants its own
references `/Assets/og/<slug>.png`, and `scripts/generate-og-images.js` renders
exactly the cards the built site references, nothing more. Wire a page up in
`astro/src` and its card appears on the next run.
