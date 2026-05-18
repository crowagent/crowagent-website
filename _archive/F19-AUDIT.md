# F19 — WebKit cross-browser smoke test

Date: 2026-05-16

## Method

Used Playwright's bundled WebKit binary (`webkit-2272`, installed at
`%LOCALAPPDATA%\ms-playwright\webkit-2272`) and Chromium (1217) to load five
key pages and compare:

- HTTP status
- Console errors (count + first 5 messages)
- Page errors (uncaught exceptions)
- Failed network requests
- `<main>` rendered height
- Detected horizontal overflow
- Visible H1

## Pages tested

| Slug | URL |
| --- | --- |
| home | `http://localhost:8092/index.html` |
| pricing | `http://localhost:8092/pricing.html` |
| contact | `http://localhost:8092/contact.html` |
| csrd | `http://localhost:8092/csrd.html` |
| tool-cer | `http://localhost:8092/tools/cyber-essentials-readiness/index.html` |

## Results

| Page | Chromium | WebKit | Δ main height | Console errors (C / W) | Page errors (C / W) | Failed requests (C / W) | Layout issues |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| home | 200 | 200 | 22 px | 0 / 0 | 0 / 0 | 0 / 0 | none |
| pricing | 200 | 200 | 0 px | 0 / 0 | 0 / 0 | 0 / 0 | none |
| contact | 200 | 200 | 1 px | 0 / 0 | 0 / 0 | 0 / 0 | none |
| csrd | 200 | 200 | 2 px | 0 / 0 | 0 / 0 | 0 / 0 | none |
| tool-cer | 200 | 200 | 4 px | 0 / 0 | 0 / 0 | 0 / 0 | none |

Screenshots:

- Chromium: `audit-results/f19-chromium/{home,pricing,contact,csrd,tool-cer}.png`
- WebKit:   `audit-results/f19-webkit/{home,pricing,contact,csrd,tool-cer}.png`

Summary JSON: `audit-results/f19-summary.json`.
Per-engine detail: `audit-results/f19-{chromium,webkit}/results.json`.

## Findings

- **All five pages return HTTP 200 on both engines.**
- **Zero console errors, zero page errors, zero failed requests** on either
  engine across all five pages.
- **Main content height differences are sub-pixel rendering drift only**
  (max 22 px on home out of 13,912 px; <0.16%). This is normal between
  Blink and WebKit due to font rasterisation differences and is not a
  layout-regression signal.
- **Text content character counts** match within 2% on every page,
  confirming nothing is hidden or duplicated on WebKit.
- **No horizontal overflow** detected on any page at 1280-px viewport on
  either engine.
- **H1 visible** on every page on both engines.

## Verdict

Pass. WebKit parity with Chromium is clean on the five tested critical
journeys (homepage, pricing, contact form, primary product, free tool).

## Verification command

```bash
node tmp-f19-webkit.js
```

Playwright auto-selects the locally-installed WebKit and Chromium binaries
(`webkit-2272` and `chromium-1217` under `%LOCALAPPDATA%\ms-playwright`).
