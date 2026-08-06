/**
 * share.ts — the copy-to-clipboard control on a blog post's share row.
 *
 * ── WHY THIS IS A MODULE AND NOT A `<script>` IN ShareRow.astro ─────────────
 *
 * It WAS a script block in the component until 2026-08-06, and it was correct
 * code sitting in the one place that made the build pay for it ten times.
 *
 * MEASURED. A component `<script>` with no imports is small enough that Astro
 * inlines the bundled result straight into the HTML of every page that renders
 * the component, rather than emitting a chunk and pointing at it. ShareRow is on
 * every blog post, so the same 652 bytes were inlined into ten documents, and
 * `scripts/check-budgets.js` counts the nine redundant copies as 5.7 KB of
 * duplicated bundled script against a 16 KB ceiling. Adding the two posts of
 * 2026-08-05 took the site's total to 17.0 KB and failed the gate.
 *
 * A script that IMPORTS is bundled as a shared chunk and referenced by `<script
 * src>`, which is why `layouts/Base.astro` has been one line and an import since
 * it was written. Moving the body here and importing it applies that same
 * pattern: ten copies become one file that the second blog post a reader visits
 * takes from cache.
 *
 * IT WAS FIXED RATHER THAN EXCEPTED, and the distinction matters because three
 * budget exceptions had already been opened for this breach and its neighbours.
 * An exception records that the site got heavier; this makes it lighter, and the
 * duplication it was opened for no longer exists to be excepted.
 *
 * The behaviour below is unchanged from the version in the component.
 */

/*
 * Progressive enhancement in the strict sense: the three share links beside this
 * button are plain anchors and work with this script blocked, failed or still
 * downloading. Only this one control needs it.
 *
 * The button is hidden until the script runs and confirms the API exists,
 * because a copy button that silently does nothing is worse than no copy button.
 * It is hidden with the `hidden` attribute rather than with CSS so it leaves the
 * focus order too.
 */
export function initShare(): void {
  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function';

  for (const el of document.querySelectorAll<HTMLButtonElement>('[data-share-copy]')) {
    if (!supported) {
      el.hidden = true;
      continue;
    }
    el.addEventListener('click', async () => {
      const url = el.dataset.shareUrl;
      const status = el.getAttribute('aria-describedby');
      const out = status ? document.getElementById(status) : null;
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
        el.classList.add('is-copied');
        if (out) out.textContent = 'Link copied';
        window.setTimeout(() => {
          el.classList.remove('is-copied');
          if (out) out.textContent = '';
        }, 2400);
      } catch (error) {
        /*
         * Not swallowed. A denied clipboard permission is the common case and
         * the reader has to be told, or they walk away believing they have the
         * URL on their clipboard when they do not.
         */
        if (out) out.textContent = 'Could not copy. Copy the address bar instead.';
        console.error('share: clipboard write failed', error);
      }
    });
  }
}
