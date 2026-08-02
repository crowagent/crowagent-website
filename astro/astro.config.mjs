import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

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

export default defineConfig({
  site: 'https://crowagent.ai',
  markdown: { rehypePlugins: [rehypeFocusablePre] },
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // Hashed filenames. This is what retires the manual `?v=` cache-buster
    // ritual, where a stylesheet edit silently never reached production
    // because a version query string was not bumped across every page that
    // referenced it.
    assets: '_assets',
  },
  vite: {
    plugins: [tailwind()],
  },
  // Astro's own image optimisation writes to _assets with content hashes.
  image: {
    // The captures are already forged to exact pixel sizes by
    // .dev-tools/shot-forge.cjs and must not be resampled again.
    remotePatterns: [],
  },
});
