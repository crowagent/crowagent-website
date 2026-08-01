# ADR 0002 — CSS is comment-stripped, never minified

**Status:** Accepted · **Date:** 2026-08-01 · **Severity:** this one shipped a P0

## Context

`scripts/build-dist.js` minified CSS with `csso.minify(src, { restructure: false })`.

Measured on `Assets/css/sovereign-core-v2.compiled.css`, which every page loads:

| | source | after csso |
|---|---|---|
| distinct `@media` | 8 | **2** |
| `@media` blocks | 158 | **2** |
| rules | 1633 | **989** |

**644 rules and 156 media blocks deleted.** No error. No warning. The build reported success.

The sheet is Tailwind v4 output using Media Queries Level 4 range syntax,
`@media (width >= 40rem)`. csso's parser predates that syntax, could not understand those
blocks, and dropped them. Production shipped a site with essentially no responsive layer
while localhost, which serves the unbuilt source, rendered correctly. The owner reported it
as "localhost has correct layout and live has issues", which is the exact signature.

## Decision

**CSS is not minified.** Comments are removed by postcss, which parses the stylesheet into
an AST and deletes comment nodes. Verified across all 34 stylesheets: **zero selectors and
zero media queries lost.**

A build gate now fails the build if any sheet reaches `dist/` with fewer rules or fewer
`@media` blocks than its source.

## Alternatives rejected

**esbuild's CSS minifier.** Parses the range syntax correctly and preserved the critical
file exactly, but still dropped 57 selectors across other sheets. For a defect about
correctness, "better than csso" is not good enough.

**A regex comment-stripper.** Already tried historically in this repo and it destroyed real
rules; pages rendered up to 3,298px taller with identical text. A regex cannot distinguish a
comment from the characters `/*` inside a string, a `url()` or a data URI.

## The bytes never justified it

Gzipped, which is what a visitor downloads:

| | all 34 sheets |
|---|---|
| as-is | 218 KB |
| comments stripped | **98 KB** |
| csso | 87 KB |

csso was destroying the responsive layer of the site to save **11 KB gzipped**.

## Consequences

Slightly larger CSS than a minified build, entirely offset by gzip and by the fact that the
site is correct. The gate makes this class of defect impossible to reintroduce silently: it
counts braces and `@media` occurrences rather than parsing, deliberately, because a parser
that does not understand the syntax is the exact failure being guarded against.

**Do not "fix" a gate failure by relaxing the gate. Find what is eating the rules.**
