import { defineConfig } from 'astro/config';

// The binding constraint on this migration is that not one URL changes.
// `format: 'directory'` emits /crowmark/index.html, which Cloudflare Pages
// serves at /crowmark — byte-for-byte the same route the legacy crowmark.html
// serves today. `format: 'file'` would emit /crowmark.html and quietly reshape
// every URL on the site, so it must not be used here.
//
// trailingSlash 'ignore' matches Cloudflare's own behaviour: it already serves
// /blog and /blog/ as the same page via the 200-rewrites in _redirects, and
// asserting anything stricter here would create a redirect that the baseline
// does not have.

/**
 * Make fenced code blocks reachable by keyboard.
 *
 * `.prose pre` scrolls horizontally so a long line cannot push the page
 * sideways — a real defect found on /blog/ppn-002-social-value-guide, where a
 * 648px formula overflowed a 390px viewport in WebKit while Chromium happened
 * to contain it. But a scrollable region that only a mouse can reach fails
 * WCAG 2.1.1, which is the same rule that put a focusable wrapper around wide
 * tables in the legal converter.
 *
 * Written out rather than pulling in unist-util-visit: it is a six-line tree
 * walk, and this project does not add a dependency for six lines.
 */
function rehypeFocusablePre() {
  return (tree) => {
    const walk = (node) => {
      if (node.tagName === 'pre') {
        node.properties = node.properties || {};
        node.properties.tabIndex = 0;
      }
      (node.children || []).forEach(walk);
    };
    walk(tree);
  };
}

/**
 * Put content-collection cards on the ONE card recipe.
 *
 * THE DEFECT. `.cmp-choose-card`, `.cmp-sources` and `.cmp-relcard` are written
 * as raw HTML inside src/content/compare/*.md and repeated in every one of those
 * files. They carried no `surface` class, so they were a second card recipe:
 * styles/surfaces.css had to name them one by one and restate border, radius,
 * background and shadow for them, layouts/Compare.astro restated the padding
 * again, and the one thing nobody restated was the alignment — which is why all
 * three sat left-aligned under centred headings on twelve route instances, and
 * why scripts/check-render.js failed on them. The charter's rule is that a
 * pattern exists exactly once.
 *
 * WHY NOT JUST TYPE `surface` INTO THE MARKDOWN. Because there are four files
 * today and there will be more, every one of them would have to remember, and
 * the failure mode of forgetting is silent. Attaching it in the pipeline means a
 * fifth comparison written next year is on the recipe whether or not its author
 * has read this file.
 *
 * WHY IT WORKS ON STRINGS. Astro runs user rehype plugins BEFORE `rehype-raw`
 * (node_modules/@astrojs/markdown-remark/dist/index.js: the loop over
 * `loadedRehypePlugins` is above `parser.use(rehypeRaw)`). Authored HTML is
 * therefore still a single `raw` node holding unparsed markup at this point,
 * not a tree of elements — verified rather than assumed. So this rewrites the
 * class attribute in that string. The alternative was to pull `rehype-raw`
 * forward ourselves, which would also move heading-id generation and image
 * handling inside authored HTML and change output well beyond this fix.
 *
 * The boundaries are `(?<![\w-])` and `(?![\w-])` rather than `\b`: `-` is not a
 * word character, so `\bcmp-sources\b` also matches inside `x-cmp-sources`.
 *
 * Six lines of tree walk, one regex, and no dependency — same principle as
 * rehypeFocusablePre above.
 */
const CONTENT_CARDS = ['cmp-choose-card', 'cmp-sources', 'cmp-relcard'];

function rehypeContentCards() {
  const names = CONTENT_CARDS.join('|');
  const CLASS_ATTR = new RegExp(`class="([^"]*(?<![\\w-])(?:${names})(?![\\w-])[^"]*)"`, 'g');
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'raw' && typeof node.value === 'string') {
        node.value = node.value.replace(CLASS_ATTR, (_m, cls) =>
          `class="${cls} surface surface--pad"`
        );
      }
      (node.children || []).forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://crowagent.ai',
  markdown: { rehypePlugins: [rehypeFocusablePre, rehypeContentCards] },
  output: 'static',
  trailingSlash: 'ignore',
  // HTML whitespace is collapsed under HTML rules, which is what this site has
  // always shipped. Stated rather than inherited, because Astro 7 changed the
  // DEFAULT from `true` to `'jsx'` (JSX whitespace rules), and the two do not
  // produce the same document. R262-WEB-01 measured all three on the same source
  // tree, `dist` rebuilt between each:
  //
  //   astro 5.18.2, default `true`     median route 53.1 KB
  //   astro 7.2.0,  default `'jsx'`    median route 52.5 KB
  //   astro 7.2.0,  `true` (this)      median route 53.1 KB
  //
  // `'jsx'` is SMALLER, and that is the reason to refuse it rather than a reason
  // to take it: it removes roughly 600 bytes per route of whitespace that the
  // site has always emitted, and JSX rules drop newline-only whitespace BETWEEN
  // inline elements where HTML rules collapse it to a significant space. None of
  // the 33 gates caught a rendering difference, which is not the same as there
  // being none — no gate compares inline word spacing. Matching the previous
  // median byte-for-byte is the evidence that nothing moved. Saving 600 bytes is
  // not worth buying that question on 45 routes.
  compressHTML: true,
  // Scoped styles are marked with a CLASS, not with a data attribute.
  //
  // Astro's default, `'attribute'`, stamps ` data-astro-cid-ivyj52o5` — 24 bytes
  // — onto every element of every component that carries a <style>. On
  // /crowmark that was 813 elements and 19.2 KB, 17% of the whole document, and
  // it is paid on every route: it was the single largest line item behind the
  // per-route HTML budget breach recorded in scripts/check-budgets.js.
  //
  // `'class'` compiles the same rules to `.foo.astro-ivyj52o5` instead of
  // `.foo[data-astro-cid-ivyj52o5]`. Specificity is IDENTICAL — a class and an
  // attribute selector both weigh (0,1,0) — so not one cascade decision on this
  // site moves, which is what distinguishes it from `'where'`, whose zero
  // specificity would quietly change which rule wins.
  //
  // Ten of the eleven gates that build a class signature from a rendered element
  // already filter `/^astro-/` and were unaffected: check-render.js,
  // check-design-system.js, check-treatments.js, check-sheen.js,
  // check-controls.js, check-disclosure.js, check-heading-ink.js,
  // check-timeline.js and check-utilities.js among them.
  //
  // THE ELEVENTH FAILED, AND IT IS WORTH SAYING SO. check-status-pulse.mjs
  // filtered `astro-cid-`, which is the ATTRIBUTE name and was never a class —
  // a guard against something that could not happen, correct only while there
  // was nothing to strip. Under this setting both of its registered carriers
  // went STALE and the same two elements were reported as unregistered under a
  // hash-prefixed signature. It now filters `/^astro-/` like the other ten. A
  // config change that reaches every route will find gates that were passing
  // for the wrong reason; this one did, and that is the gate improving.
  scopedStyleStrategy: 'class',
  build: {
    format: 'directory',
    // Hashed filenames. This is what retires the manual `?v=` cache-buster
    // ritual, where a stylesheet edit silently never reached production
    // because a version query string was not bumped across every page that
    // referenced it.
    assets: '_assets',
  },
  // Astro's own image optimisation writes to _assets with content hashes.
  image: {
    // The captures are already forged to exact pixel sizes by
    // .dev-tools/shot-forge.cjs and must not be resampled again.
    remotePatterns: [],
  },
  // ── A-62 · THIS PROJECT DECLARES ITS OWN POSTCSS CHAIN ────────────────────
  //
  // WHAT WAS HAPPENING. Vite searches UPWARD from the project root for a PostCSS
  // config, so `astro build` was finding the REPOSITORY root's
  // `postcss.config.mjs` — a file belonging to the legacy tree, one directory
  // above this project — and running its two plugins over every stylesheet this
  // site ships. Nothing in astro/src imports `tailwindcss`, so
  // `@tailwindcss/postcss` emitted no utility layer at all, and the Tailwind
  // utility classes that appear in the legal markdown were dead classes with no
  // CSS behind them. Neither plugin is a dependency of astro/package.json, so the
  // build only worked because the root node_modules happened to be installed
  // beside it, and .github/workflows/astro-gates.yml had to run a second
  // `npm ci` at the repository root before this one would build at all.
  //
  // CORRECTED 2026-08-05. This used to add "`sr-only` is hand-written in
  // styles/tokens.css for exactly that reason". It is not: tokens.css records
  // that the recipe was renamed to `.visually-hidden` so the site has one name
  // for it, and `.sr-only` now appears zero times in the built CSS and zero
  // times in the built markup. The claim was true when written and outlived its
  // subject. It is corrected rather than deleted because it is the kind of
  // sentence a future reader would otherwise trust.
  //
  // AND THE ROOT INSTALL IS NOW GONE TOO, 2026-08-05. Proved by building: a
  // `git archive HEAD astro` into a directory with no node_modules and no
  // package.json above it, `npm ci` in astro/ only, `astro build` exit 0 across
  // 43 pages, with 12 of 16 emitted stylesheets byte-identical to a build made
  // with the root tree present. See .github/workflows/astro-gates.yml.
  //
  // AN INLINE OBJECT STOPS THE SEARCH. Vite treats `css.postcss` as a config
  // when it is an object and skips file discovery entirely, so this is not a
  // narrower search path that a future sibling config could still win — there is
  // no walk left to capture. The root file is untouched and still describes the
  // legacy tree; it simply no longer reaches in here.
  //
  // AND THE CHAIN IS EMPTY, WHICH IS THE PART THAT NEEDED MEASURING RATHER THAN
  // ARGUING, because dropping autoprefixer changes what ships. It was measured
  // by running the plugin back over the 16 built sheets and diffing declaration
  // by declaration — a fixed input, so the answer does not move when somebody
  // else edits a stylesheet mid-pass. Its ENTIRE contribution to this site is
  // 12 declarations and 503 bytes:
  //
  //   width: -moz-fit-content / -moz-max-content  x3   Firefox before 94 (2021)
  //   ::-moz-placeholder rules                    x2   Firefox before 51 (2017)
  //   -moz-appearance: none                       x2   Firefox before 80 (2020)
  //   -moz-column-gap                             x2   Firefox before 61 (2018)
  //   -o-object-fit / -o-object-position          x3   Opera Presto / Opera Mini
  //
  // AND THE BROWSERS IT WAS WRITING THEM FOR CANNOT RENDER THIS SITE. Neither
  // package declares a browserslist, so the plugin was running on the defaults,
  // and the only two entries in that resolved list old enough to want any of the
  // above are `kaios 2.5` — a feature-phone OS on Gecko 48 — and `op_mini all`.
  // Both are several years short of `color-mix()`, `:has()`, `backdrop-filter`
  // and `mask-image`, all of which this site's surfaces, headings and sheen are
  // built on. A fallback that only reaches a browser which cannot paint the page
  // it is a fallback for is not a fallback.
  //
  // NOT ONE PREFIX THE SITE ACTUALLY RELIES ON CAME FROM IT, and the same diff
  // proves it: autoprefixer adds no `-webkit-` declaration to these sheets at
  // all. Every one in the built CSS is hand-written in src beside the reason for
  // it — `-webkit-backdrop-filter` on the glass surface, `-webkit-mask-image` and
  // `-webkit-mask-composite` on the sheen, `-webkit-text-fill-color` and
  // `-webkit-background-clip` on the clipped-gradient headings that once produced
  // this site's invisible-text P0. Those are load-bearing, they are in the
  // source rather than generated, and they are untouched.
  //
  // ── CORRECTION [R27-WEB-PREFIX-01, 2026-08-17] ────────────────────────────
  // THE LAST SENTENCE ABOVE IS NO LONGER TRUE, and it is left in place rather
  // than quietly edited because the reasoning around it is still correct and
  // worth reading. `-webkit-background-clip` is NOT untouched any more.
  //
  // MEASURED ON THE LIVE SITE, not in the source: `src/` contains 15
  // `-webkit-background-clip` declarations and the three stylesheets served from
  // crowagent.ai contain ZERO. lightningcss (1.33.0, installed and running with
  // NO configured `targets`, because nothing here sets `build.cssMinify` or
  // `css.transformer`) strips it as unnecessary for its default target set. This
  // began with the Astro 5 -> 7.2.0 bump on 2026-08-09 and shipped in the
  // 2026-08-13 deploy.
  //
  // IT IS NOT THE INVISIBLE-TEXT P0 COMING BACK, and that distinction is the
  // whole point of writing this down. lightningcss narrowed the guard IN LOCKSTEP
  // with the declaration: source says
  //     @supports ((background-clip: text) or (-webkit-background-clip: text))
  // and the shipped CSS says
  //     @supports (background-clip: text)
  // so a browser that only understands the prefixed form now evaluates that
  // condition as FALSE, skips the whole block, and gets the deliberate
  // `color: var(--c-text)` fallback. Readable text, not transparent text. The
  // transformation is self-consistent; had it removed the declaration and LEFT
  // the `or (-webkit-...)` clause, that WOULD have been the P0 again, because
  // those browsers would have entered the block and applied
  // `-webkit-text-fill-color: transparent` with no working clip.
  //
  // WHAT IS ACTUALLY LOST is cosmetic: WebKit versions that support only the
  // prefixed property no longer get the gradient heading, they get flat text.
  // Deliberately NOT "fixed" by pinning lightningcss targets: the gain is a
  // gradient on old Safari, the cost is a build-config change plus a production
  // Cloudflare deploy, and the fallback is readable either way. Recorded as the
  // decision it is rather than left as an unexplained difference between src and
  // dist. If it IS ever restored, set explicit `targets` and re-verify in `dist/`
  // — never in `src/`, which is what made this invisible for eight days.
  vite: {
    css: {
      postcss: { plugins: [] },
    },
    build: {
      /*
       * THE TabSwitcher CHUNK STAYS A FILE. R262-WEB-01, measured on the
       * Astro 7.2.0 upgrade.
       *
       * Astro inlines a script chunk into the document when it is under
       * `assetsInlineLimit`, default 4096 B (see
       * node_modules/astro/dist/core/build/plugins/util.js, `shouldInlineAsset`).
       * `src/scripts/tabs.ts` sat just ABOVE that line under Astro 5's Rollup
       * output at 4,105 B, so it shipped as one cached file shared by the two
       * routes carrying TabSwitcher — / and /pricing. Vite 8's Rolldown minifies
       * the same source to 4,022 B, 74 bytes under the threshold, and it was
       * inlined into BOTH documents instead: /index.html went 101,929 B → 106,139 B
       * and breached the 100 KB per-route budget in scripts/check-budgets.js by
       * 3.7 KB, while the identical 4 KB was served twice in a form no browser
       * can cache.
       *
       * ADR 0010 and the A-73 rewrite of that gate already settled which side of
       * this trade-off is right: a chunk that MOVES between inline and emitted is
       * not a change in what the site does, and the emitted form is what readers
       * actually pay less for. So the threshold is answered directly rather than
       * by shaving bytes off tabs.ts to push it back over 4,096 — which is the
       * same defect in the other direction, and is refused for the same reason
       * the jsTotal exception refuses it.
       *
       * NARROW ON PURPOSE. Returning `undefined` for every other asset hands the
       * decision back to the default `< 4096` rule, so small stylesheets and
       * data-URI assets inline exactly as before; only this one chunk is
       * answered. Astro's `shouldInlineAsset` and Vite's own asset pipeline both
       * treat a nullish return as "use the default", so one predicate serves
       * both.
       */
      assetsInlineLimit: (assetPath) =>
        /TabSwitcher\.astro_astro_type_script/.test(assetPath) ? false : undefined,
    },
  },
});
