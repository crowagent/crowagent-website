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
  // The gate suite already assumed this: every script that builds a class
  // signature from a rendered element filters `/^astro-/` (check-render.js,
  // check-design-system.js, check-treatments.js, check-sheen.js,
  // check-utilities.js and six more), and check-status-pulse.mjs filters
  // `astro-cid-` by name.
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
});
