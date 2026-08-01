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
export default defineConfig({
  site: 'https://crowagent.ai',
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
