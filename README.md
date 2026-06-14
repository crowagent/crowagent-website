# crowagent-website

Static marketing site for crowagent.ai (plain HTML/CSS/JS, deployed on Cloudflare Pages).

## Development

The site uses **clean URLs** (e.g. `/pricing` serves `pricing.html`). Cloudflare Pages
rewrites these in production; a plain static file server would 404 them locally. Use the
`dev` script, which runs [`serve`](https://www.npmjs.com/package/serve) with its default
clean-URL handling on port **8092**:

```bash
npm run dev
# → http://localhost:8092
```

This resolves `/pricing` → `pricing.html`, `/about` → `about.html`, etc., and redirects
`*.html` to the extensionless URL, matching the production Cloudflare Pages behaviour. No
extra config (`serve.json`) is required; `serve`'s defaults already match prod.

## Tests

```bash
npm test          # Jest unit tests (jsdom)
npm run test:responsive   # Playwright responsive checks
```
