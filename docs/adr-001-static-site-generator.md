# ADR-001: Evaluate Migration to Static Site Generator (11ty/Astro)

**Status:** Decided — Maintain current structure with incremental improvements  
**Date:** 2026-04-30  
**Task:** 35.1 (Phase 9G)

## Context

The CrowAgent marketing site consists of 17 HTML files that duplicate `<head>`, nav, and footer markup (~495 KB total). This duplication is the root cause of multiple defects:

- Per-page OG meta drift (DEF-024, DEF-025)
- JSON-LD schema inconsistencies (DEF-035)
- Copyright year and address updates require touching all files
- Plan name drift across pages (DEF-049)
- Nav/footer changes require `nav-inject.js` runtime injection

## Options Evaluated

### Option A: Migrate to 11ty (Eleventy)

**Pros:**
- Zero-config static site generator, works with existing HTML
- Nunjucks/Liquid templates eliminate duplication
- Build-time data (plan names, prices) from a single JSON file
- Incremental adoption — can migrate one page at a time
- No client-side JS framework overhead
- Excellent Lighthouse scores out of the box

**Cons:**
- Migration effort: ~2-3 days for 17 pages
- Team needs to learn template syntax
- Build step required (currently deploy is just `git push`)
- Cloudflare Pages supports 11ty natively

### Option B: Migrate to Astro

**Pros:**
- Component-based (`.astro` files)
- Island architecture for interactive widgets (chatbot, CSRD wizard)
- TypeScript support
- Built-in image optimization (would solve DEF-038)

**Cons:**
- Heavier migration (~4-5 days)
- More complex than needed for a mostly-static site
- Team unfamiliar with Astro syntax
- Overkill for 17 pages with minimal interactivity

### Option C: Maintain current structure with improvements

**Pros:**
- Zero migration risk
- `nav-inject.js` already solves nav/footer duplication
- Plan names can be centralized in a `site-config.js` data file
- Cloudflare Pages deploys instantly (no build step)
- Team already knows the codebase

**Cons:**
- `<head>` duplication remains (OG tags, JSON-LD per page)
- Manual sync required for cross-cutting changes
- No build-time validation of template consistency

## Decision

**Maintain current structure (Option C)** with the following incremental improvements:

1. **Centralize plan data** in `lib/site-config.js` — single source of truth for plan names, prices, and features
2. **Externalize JSON-LD** into `js/structured-data.js` (already done)
3. **Add CI quality gate** (Task 35.3) to catch drift automatically
4. **Use `nav-inject.js` pattern** for any new shared markup

## Rationale

- The site has 17 pages and grows slowly (1-2 pages per quarter)
- `nav-inject.js` already eliminates the highest-impact duplication (nav + footer)
- The quality gate CI (Lighthouse + axe + link-check) will catch drift before it reaches production
- Migration to 11ty remains a viable future option if the site grows beyond ~30 pages
- The team's velocity is better spent on platform features than a marketing site rewrite

## Consequences

- Accept that `<head>` meta tags require manual sync across pages
- Rely on CI quality gate to catch inconsistencies
- Revisit this decision if the site exceeds 30 pages or if duplication defects recur after CI is in place
