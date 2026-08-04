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
  // `@tailwindcss/postcss` emitted no utility layer at all: `sr-only` is
  // hand-written in styles/tokens.css for exactly that reason, and the eight
  // Tailwind utilities found in the legal markdown were dead classes with no CSS
  // behind them. Neither plugin is a dependency of astro/package.json, so the
  // build only worked because the root node_modules happened to be installed
  // beside it — which is why .github/workflows/astro-gates.yml has to run a
  // second `npm ci` at the repository root before this one will build at all.
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
  vite: {
    css: {
      postcss: { plugins: [] },
    },
  },
});
