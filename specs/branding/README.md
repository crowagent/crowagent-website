# CrowAgent Branding Alignment Spec

**Tagline:** CrowAgent — Sustainability Intelligence  
**Owner:** Crow Agent  
**Scope:** Consistent branding across crowagent.ai, app.crowagent.ai, portal.crowagent.ai

---

## 1. Brand Identity

| Element | Value |
|---------|-------|
| Company | CrowAgent |
| Tagline | Sustainability Intelligence |
| Primary colour | Teal `#0CC9A8` |
| Secondary colour | Navy `#0A1F3A` |
| Gradient | Navy → Teal (4 ascending bars) |
| Background (light) | White `#FFFFFF` |
| Background (dark) | Navy `#0A1F3A` |
| Corner radius (icon) | 96px at 512px (18.75% — matches iOS/Android superellipse) |
| Font | Inter (headings + body) |

---

## 2. Icon System (The 4 Ascending Bars)

The CrowAgent icon is 4 ascending bars representing growth/intelligence, transitioning from navy to teal:

- Bar 1 (shortest): `#0A1F3A` (navy)
- Bar 2: `#0D3558` (dark blue)
- Bar 3: `#0AA88C` (dark teal)
- Bar 4 (tallest): `#0CC9A8` (teal)
- Baseline: `#0CC9A8` teal line beneath all bars

This icon works at all sizes from 16x16 to 1024x1024.

---

## 3. Required Assets Per Site

### Minimum favicon stack (per Evil Martians 2024 best practice):

| File | Size | Format | Purpose |
|------|------|--------|---------|
| `favicon.svg` | Scalable | SVG | Modern browsers — supports dark mode via CSS media query |
| `favicon.ico` | 32x32 | ICO | Legacy fallback (auto-detected in root) |
| `favicon-32.png` | 32x32 | PNG | Explicit PNG fallback |
| `favicon-192.png` | 192x192 | PNG | Android Chrome, PWA manifest |
| `icon-512.png` | 512x512 | PNG | PWA manifest, app stores |
| `icon-512-maskable.png` | 512x512 | PNG | PWA maskable (safe zone: inner 80%) |
| `apple-touch-icon.png` | 180x180 | PNG | iOS home screen (192 also works) |

### Logo assets (in `/brand/` directory):

| File | Dimensions | Use |
|------|-----------|-----|
| `crowagent_wordmark_dark_560x140.png` | 560x140 | Logo on dark backgrounds |
| `crowagent_wordmark_dark_1120x280.png` | 1120x280 | High-DPI logo on dark |
| `crowagent_wordmark_navy_560x140.png` | 560x140 | Logo on light backgrounds |
| `crowagent_wordmark_transparent_560x140.png` | 560x140 | Logo on any background |
| `crowagent_wordmark_transparent_1120x280.png` | 1120x280 | High-DPI transparent |
| `crowagent_icon_dark_512.png` | 512x512 | Icon on dark backgrounds |
| `crowagent_icon_light_512.png` | 512x512 | Icon on light backgrounds |
| `crowagent_icon_light_256.png` | 256x256 | Small icon on light |
| `crowagent_icon_transparent_512.png` | 512x512 | Icon on any background |
| `crowagent_app_icon_1024.png` | 1024x1024 | App store / high-DPI |

---

## 4. HTML Head Tags (canonical — use on ALL 3 sites)

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/favicon-192.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0CC9A8">
```

---

## 5. manifest.json (canonical — use on ALL 3 sites)

```json
{
  "name": "CrowAgent",
  "short_name": "CrowAgent",
  "description": "Sustainability Intelligence — UK compliance for MEES, social value, cyber, and ESG.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#05101E",
  "theme_color": "#0CC9A8",
  "icons": [
    { "src": "/favicon-32.png", "sizes": "32x32", "type": "image/png" },
    { "src": "/favicon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/favicon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

## 6. Gaps Found & Fixes Required

### Fix 1: Portal favicon.svg is WRONG
- **Problem:** Portal uses 48x48 viewBox with different bar proportions
- **Fix:** Replace with canonical 512x512 version (see `favicon-canonical.svg` in this directory)

### Fix 2: Portal missing SVG favicon in HTML head
- **Problem:** Portal layout.tsx only has `.ico` and `.png`, no `.svg`
- **Fix:** Add `{ url: '/favicon.svg', type: 'image/svg+xml' }` to icons array

### Fix 3: No manifest.json on platform or portal
- **Problem:** Only marketing site has manifest — no PWA support elsewhere
- **Fix:** Add manifest.json to both `web/public/` and `apps/portal/public/`

### Fix 4: Missing icon-512 on platform/portal
- **Problem:** Only website has 512px icons
- **Fix:** Copy `icon-512.png` and `icon-512-maskable.png` to platform + portal

### Fix 5: CrowAgentLogo component only in portal
- **Problem:** Reusable logo component doesn't exist in platform web app
- **Fix:** Create shared component or duplicate in `web/components/`

### Fix 6: Dark mode favicon not implemented
- **Problem:** SVG doesn't adapt to OS dark mode
- **Fix:** Use enhanced SVG with `prefers-color-scheme` media query (see `favicon-canonical.svg`)

### Fix 7: Portal missing theme-color meta
- **Problem:** No theme-color set in portal
- **Fix:** Add `<meta name="theme-color" content="#0CC9A8">`

---

## 7. Consistency Matrix (Current → Target)

| Asset | crowagent.ai | app.crowagent.ai | portal.crowagent.ai |
|-------|:---:|:---:|:---:|
| favicon.svg (512, dark-mode) | ⚠️ Upgrade | ⚠️ Upgrade | ❌ Replace + Upgrade |
| favicon.ico | ✅ | ✅ | ✅ |
| favicon-32.png | ✅ | ✅ | ✅ |
| favicon-192.png | ✅ | ✅ | ✅ |
| icon-512.png | ✅ | ❌ Add | ❌ Add |
| icon-512-maskable.png | ✅ | ❌ Add | ❌ Add |
| manifest.json | ✅ | ❌ Add | ❌ Add |
| SVG in head | ✅ | ✅ | ❌ Add |
| theme-color | ✅ | ✅ | ❌ Add |
| /brand/ assets | ❌ Add | ✅ | ✅ |
| CrowAgentLogo component | N/A (static) | ❌ Add | ✅ |

---

## 8. Implementation Steps

**Step 1 — Fix portal favicon (immediate):**
1. Copy `specs/branding/favicon-canonical.svg` → `crowagent-platform/apps/portal/public/favicon.svg`
2. Update portal `layout.tsx` icons to include SVG reference
3. Add theme-color meta tag

**Step 2 — Add missing assets to platform + portal:**
1. Copy `icon-512.png` and `icon-512-maskable.png` from website to both
2. Create `manifest.json` in both public directories
3. Add manifest link to both layout files

**Step 3 — Upgrade all favicons to dark-mode-aware:**
1. Replace `favicon.svg` on all 3 sites with `favicon-canonical.svg`
2. Test in Chrome/Firefox with dark mode toggled

**Step 4 — Add /brand/ to website:**
1. Copy brand assets from platform to website (for consistency)
2. Or: reference platform brand assets via CDN/shared bucket

**Step 5 — Shared CrowAgentLogo component:**
1. Copy portal's `CrowAgentLogo.tsx` to `web/components/`
2. Use in platform sidebar header and auth pages

---

## 9. Theme Color Strategy

| Site | theme-color | Rationale |
|------|-------------|-----------|
| crowagent.ai | `#0A1F3A` (navy) | Dark marketing hero — browser chrome matches |
| app.crowagent.ai | `#0CC9A8` (teal) | Light app shell — teal accent in browser chrome |
| portal.crowagent.ai | `#0CC9A8` (teal) | Match platform — internal tool, same brand feel |

This is intentional differentiation: marketing = premium dark, product = clean light with teal accent.
