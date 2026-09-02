# crowagent-website

Marketing site for crowagent.ai, built with Astro and deployed on Cloudflare Pages.

**What ships is the `astro/` tree.** Cloudflare Pages builds it and publishes
`astro/dist`. The plain HTML files at the repository root (`index.html`,
`pricing.html`, `blog/*.html` and the rest) are the LEGACY BASELINE. They are
frozen, nothing serves them, and editing one changes nothing that a visitor sees.

Verified against production on 2026-09-01:

| URL | Status |
|---|---|
| `https://crowagent.ai/pricing` | 308 to `/pricing/`, which returns 200 |
| `https://crowagent.ai/pricing.html` | **404** |
| `https://crowagent.ai/search-index.json` | 200, and that file exists only in the Astro build |

Directory routes and a served `search-index.json` are both Astro build outputs.
The legacy tree has neither.

Root `Assets/`, `_headers`, `_redirects`, `robots.txt` and `llms*.txt` are the
exception: they live at the root but they ARE load bearing. `astro/scripts/copy-assets.js`
and `astro/scripts/copy-cf-config.js` copy them into `astro/dist` on every build,
and copy-assets exits 1 on a referenced asset it cannot find.

## Development

```bash
cd astro
npm install
npm run dev        # http://localhost:8093
```

## Build

```bash
cd astro
npm run build:deploy   # what Cloudflare Pages runs: guards, type-check, build, emit
npm run build          # the full local gate chain, roughly 31 steps, for certification
```

`astro build` WIPES `astro/dist`, so anything that reads the build has to run
after it.

## Social cards

`scripts/generate-og-images.js` renders `Assets/og/*.png` from the titles and
descriptions of the BUILT pages in `astro/dist`. It needs the build to exist and
fails loudly when it does not. Order matters:

```bash
cd astro && npm run build:deploy
cd .. && npm run build:og:force
cd astro && node scripts/copy-assets.js
```

## Tests

```bash
cd astro && npm run build              # the gate chain, the real suite
npx playwright test tests/smoke.spec.js   # targets astro/dist on :8095
```

Five Playwright specs still target the legacy root tree on :8092. Its server no
longer starts by default. Run them with `CA_LEGACY_SERVER=1`.

`npm test` at the root is the jest suite. Its whole coverage floor is four legacy
root JS files that the built site does not load, so it is no longer a push gate.
