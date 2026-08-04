/* ============================================================================
   SHELL — the one client entry every route carries.
   ============================================================================

   ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────

   Astro inlines a hoisted component `<script>` straight into the document
   whenever it compiles to a single chunk with no imports and under Vite's
   `assetsInlineLimit`, which is 4,096 bytes by default. Four scripts on this
   site qualified — the header, the dropdown, the command palette and the
   magnet — and every one of them belongs to `layouts/Base.astro`, so every one
   of them was written into all 44 documents.

   MEASURED ON THE 2026-08-04 BUILD, not estimated: 8,958 B a document, and
   8,958 x 44 = 394,152 B — 384.9 KB — of build that was byte-for-byte
   identical and that no browser could cache, because bytes inside an HTML
   document are not a cacheable resource. A reader moving between two pages
   downloaded the same command palette twice.

   Behind ONE entry the four are one chunk, one hashed file, one request,
   fetched on the first route and served from cache on every route after it.
   The saving is the 44th copy and the 43 after that, not the first.

   ── WHY IT IS AN ENTRY AND NOT FOUR MODULES ─────────────────────────────────

   Because four `<script>` tags would still be four Rollup entries, each its
   own chunk, and the small ones would go straight back to being inlined. The
   inline decision is made per chunk, so the only way to stop it is to have one
   chunk, and the only way to have one chunk is to have one entry. This is that
   entry, and `layouts/Base.astro` is the only file that may carry it.

   ── WHAT IT DOES NOT DO ─────────────────────────────────────────────────────

   It does not boot `motion.ts`. That module drives the homepage's arrival
   light, `src/pages/index.astro` imports it directly, and it stays a second
   entry on that one route. Adding it here would put an IntersectionObserver on
   43 routes that do not ask for one, and it would let /crowmark and
   /crowmark-buyers delete their duplicated inline view triggers — which is a
   MOTION decision with a visual consequence on every route, not a payload one.
   It is named in ADR 0010 as the next thing to look at and is deliberately not
   done here.

   ── ORDER, AND WHY IT DOES NOT MATTER ───────────────────────────────────────

   Nothing below depends on anything else below. The header, the dropdown, the
   palette and the magnet each query their own elements and bind their own
   listeners, and each returns early when its markup is absent. The order is
   the order they appear in the document, which is the order they ran in
   before, so the change is a no-op for anyone reading a stack trace.

   Astro emits this as a deferred module, so the DOM is parsed before any of it
   runs — exactly as it was when the four were separate hoisted scripts. Every
   `getElementById` below was already relying on that.
   ============================================================================ */
import { initNav } from './nav';
import { initNavDropdowns } from './nav-dropdown';
import { initCommandPalette } from './command-palette';
import { initMagnetic } from './magnetic';

/** The whole of the shell's client behaviour. Called once, from Base.astro. */
export function initShell(): void {
  initNav();
  initNavDropdowns();
  initCommandPalette();
  initMagnetic();
}
