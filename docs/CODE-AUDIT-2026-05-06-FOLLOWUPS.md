# crowagent-website — CODE-AUDIT 2026-05-06 follow-ups

## CODE-AUDIT-022 — Minified bundles in source control
**Status:** Intentional per CLAUDE.md §17 (CF Pages "no-build" deploy
posture). The `npm run build` script explicitly says
`'CF Pages deploy: assets are pre-built and committed; no build step needed'`
and exits 0. Minified files are deployment artefacts under that policy and
remain in the working tree. The fix is documentation: this entry is the
documentation. If/when CF Pages adopts a build step, flip the gitignore
guards in `.gitignore` (already commented in place).

## CODE-AUDIT-023 — PascalCase asset directories
**Status:** Mitigated via `_redirects` lowercase-to-PascalCase rewrites.
Renaming `Assets/`/`Doc/`/`Branding Logo/` directly is high-risk on Windows
(case-insensitive FS) and would break ~100 existing referrers. Lowercase
URLs now 200-rewrite to the PascalCase paths so external/SEO requests
resolve. Documented in `_redirects`.

## CODE-AUDIT-024 — Debug/test artefacts at repo root
**Status:** `.gitignore` updated to keep new artefacts out of tree.
Existing committed copies (e.g. `audit_website.txt`, `DEBUG-REPORT-*.md`)
need driver `git rm` action — see `crowagent-platform/docs/CODE-AUDIT-2026-05-06-DELETIONS.md`.

## CODE-AUDIT-038 — CLAUDE.md drift
**Status:** Fixed in this PR. §2.1 now correctly attributes platform to
Next 16 + React 19 and §2.2 to Cloudflare Pages.

## CODE-AUDIT-041 — Sparse website tests (31 total)
**Status:** Deferred. Adding test coverage for the chatbot and tools forms
is its own workstream; the agent confirmed the existing suites in `tests/`,
`crowagent.test.js`, and `scripts.test.js` continue to load.

## CODE-AUDIT-045 — `innerHTML` on `scripts.js:837`
**Status:** Reviewed. The `resultDiv.innerHTML = html` block in `scripts.js`
populates results from JSON the page itself fetched from the public CrowAgent
API. The API responses are first-party trusted JSON (no user-controlled HTML
slips through). Action required: chatbot.js paths that bypass `sanitizeHTML`
should be reviewed in a separate JS hygiene PR.

## CODE-AUDIT-048 — Coverage/playwright dirs in tree
**Status:** `.gitignore` updated. Existing committed copies need driver
`git rm` — see deletions doc.

## CODE-AUDIT-058 — Root-level `scripts.js` next to `js/` dir
**Status:** Intentional. `scripts.js` is the legacy site-wide script the
HTML pages reference; `js/` holds module-style helpers (`tool-teaser.js`,
`chatbot.js`). Documented as separate concerns.
