/* ============================================================================
   COMMAND PALETTE — the Cmd-K / Ctrl-K search, behind one export.
   ============================================================================

   THIS CODE HAS NOT CHANGED. It moved out of CommandPalette.astro's <script>
   on 2026-08-04 under ADR 0010, unedited. At 3,572 B it was the largest of the
   four scripts Astro was inlining into all 44 documents — 157 KB of build on
   its own, for a panel bound to a keystroke most readers never press.

   That is the SECOND time this component has paid for being inlined. Its
   search index used to be a <script type="application/json"> beside it, 7.1 KB
   identical in 44 documents, and moving that to a fetched
   /search-index.json is what took /crowmark back inside the per-route HTML
   budget. The index moved; the code that reads it did not, and stayed
   duplicated for another day. Both halves are external now.

   The accessibility reasoning — combobox with listbox, aria-activedescendant
   rather than moving focus, the three distinct empty states — is in the
   frontmatter of CommandPalette.astro, with the markup it describes.
   ============================================================================ */

interface Entry {
  title: string;
  href: string;
  section: string;
  hint?: string;
}

/** Boot the palette. Called once, from scripts/shell.ts. */
export function initCommandPalette(): void {
  const root = document.getElementById('cmdk');
  const panel = root?.querySelector<HTMLElement>('.cmdk__panel');
  const input = document.getElementById('cmdk-input') as HTMLInputElement | null;
  const list = document.getElementById('cmdk-list');
  const empty = root?.querySelector<HTMLElement>('.cmdk__empty');
  const status = root?.querySelector<HTMLElement>('[data-cmdk-status]');
  if (!root || !panel || !input || !list || !empty || !status) return;

  let entries: Entry[] = [];
  let results: Entry[] = [];
  let active = 0;
  let lastFocused: HTMLElement | null = null;

  /**
   * THE INDEX IS FETCHED, ONCE, THE FIRST TIME THE PALETTE OPENS.
   *
   * It used to be a <script type="application/json"> beside this one, which
   * meant an identical 7.1 KB in all 44 documents — 313 KB of build, paid in
   * critical HTML by every reader on every page whether or not they ever
   * pressed ⌘K, and one of the two things holding /crowmark over the 100 KB
   * per-route budget in scripts/check-budgets.js. See search-index.json.ts.
   *
   * `wanted` is a promise rather than a boolean so that opening, closing and
   * reopening during the request cannot start a second one.
   */
  const NO_MATCH = empty.textContent ?? '';
  const LOADING = 'Loading the search index…';
  const UNAVAILABLE = 'Search is unavailable: the index did not load. Try reloading the page.';
  let state: 'idle' | 'loading' | 'ready' | 'failed' = 'idle';
  let wanted: Promise<void> | null = null;

  function loadIndex(): Promise<void> {
    if (wanted) return wanted;
    state = 'loading';
    wanted = fetch('/search-index.json', { headers: { accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: Entry[]) => {
        entries = data;
        state = 'ready';
      })
      .catch((error: unknown) => {
        // Not swallowed and not silent: the reader is told in the panel and
        // through the live region, and the reason is left in the console for
        // whoever is looking at why. The rest of the nav is unaffected.
        state = 'failed';
        console.error(
          'command palette: /search-index.json did not load',
          error instanceof Error ? error.message : String(error)
        );
      })
      .then(render);
    return wanted;
  }

  /**
   * Subsequence match, not substring: "ppn" finds "PPN 002 Calculator" and
   * "crowbuy" finds "CrowMark for Buyers". Scored so that a title match beats
   * a match that only landed in the section or the description, and an
   * earlier match beats a later one.
   */
  function score(entry: Entry, q: string): number {
    const title = entry.title.toLowerCase();
    const hay = `${title} ${entry.section} ${entry.hint ?? ''}`.toLowerCase();
    if (title.startsWith(q)) return 1000;
    const inTitle = title.indexOf(q);
    if (inTitle > -1) return 800 - inTitle;
    const inHay = hay.indexOf(q);
    if (inHay > -1) return 500 - Math.min(inHay, 400);
    // Subsequence fallback: every character of the query, in order.
    let i = 0;
    for (const ch of hay) if (ch === q[i]) i++;
    return i === q.length ? 100 : -1;
  }

  function render() {
    if (state !== 'ready') {
      results = [];
      list!.innerHTML = '';
      input!.removeAttribute('aria-activedescendant');
      empty!.textContent = state === 'failed' ? UNAVAILABLE : LOADING;
      empty!.hidden = false;
      status!.textContent = empty!.textContent;
      return;
    }
    empty!.textContent = NO_MATCH;

    const q = input!.value.trim().toLowerCase();
    results = q
      ? entries
          .map((e) => ({ e, s: score(e, q) }))
          .filter((r) => r.s > -1)
          .sort((a, b) => b.s - a.s)
          .slice(0, 12)
          .map((r) => r.e)
      : entries.slice(0, 8);

    active = 0;
    /*
     * The ANCHOR carries role="option". The first version nested an <a>
     * inside <li role="option">, which is two interactive elements inside one
     * another: axe reported nested-interactive on all 8 rows, and a screen
     * reader gets a link inside an option with no way to tell which it is on.
     *
     * Putting the role on the anchor keeps exactly one interactive element
     * per row while preserving the href, so middle-click, "open in new tab"
     * and "copy link address" all still work. Dropping to plain <span> rows
     * would have been the easy fix and would have quietly removed all three.
     *
     * tabindex="-1" because focus stays in the input; the active row is
     * communicated by aria-activedescendant, not by focus.
     */
    list!.innerHTML = results
      .map(
        (e, i) =>
          `<a role="option" id="cmdk-opt-${i}" aria-selected="${i === 0}" data-i="${i}" ` +
          `href="${escapeHtml(e.href)}" tabindex="-1">` +
          `<span class="cmdk__t">${escapeHtml(e.title)}</span>` +
          `<span class="meta cmdk__s">${escapeHtml(e.section)}</span></a>`
      )
      .join('');

    empty!.hidden = results.length > 0;
    syncActive();
    status!.textContent = q
      ? `${results.length} result${results.length === 1 ? '' : 's'} for ${q}`
      : `${results.length} suggestions`;
  }

  function escapeHtml(s: string) {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
    );
  }

  /**
   * aria-activedescendant rather than moving focus. Moving DOM focus into the
   * list would stop the user typing, which is the entire point of a palette.
   */
  function syncActive() {
    const items = list!.querySelectorAll<HTMLElement>('[role="option"]');
    items.forEach((li, i) => {
      const on = i === active;
      li.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) {
        input!.setAttribute('aria-activedescendant', li.id);
        li.scrollIntoView({ block: 'nearest' });
      }
    });
    if (!items.length) input!.removeAttribute('aria-activedescendant');
  }

  function open() {
    if (!root!.hidden) return;
    lastFocused = document.activeElement as HTMLElement;
    root!.hidden = false;
    document.body.style.overflow = 'hidden';
    input!.value = '';
    loadIndex();
    render();
    // preventScroll so opening the palette never jumps the page behind it.
    input!.focus({ preventScroll: true });
  }

  function close() {
    if (root!.hidden) return;
    root!.hidden = true;
    document.body.style.overflow = '';
    lastFocused?.focus({ preventScroll: true });
  }

  function go(i: number) {
    const entry = results[i];
    if (entry) window.location.href = entry.href;
  }

  input.addEventListener('input', render);

  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (results.length) active = (active + 1) % results.length;
        syncActive();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (results.length) active = (active - 1 + results.length) % results.length;
        syncActive();
        break;
      case 'Home':
        e.preventDefault();
        active = 0;
        syncActive();
        break;
      case 'End':
        e.preventDefault();
        active = Math.max(0, results.length - 1);
        syncActive();
        break;
      case 'Enter':
        e.preventDefault();
        go(active);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  });

  // Pointer selection. Delegated so it survives every re-render.
  list.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (!li) return;
    e.preventDefault();
    go(Number(li.dataset.i));
  });
  list.addEventListener('mousemove', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (!li) return;
    const i = Number(li.dataset.i);
    if (i !== active) {
      active = i;
      syncActive();
    }
  });

  root.querySelector('[data-cmdk-scrim]')?.addEventListener('click', close);

  /*
   * The focus trap. Only the input is focusable inside the dialog — options
   * are driven by aria-activedescendant — so the trap reduces to keeping Tab
   * on the input. Simpler than a general trap, and it cannot be escaped into
   * the page behind, which would be WCAG 2.4.3 and 2.1.2 trouble.
   */
  panel.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Tab') {
      e.preventDefault();
      input!.focus();
    }
  });

  document.addEventListener('keydown', (e) => {
    const ke = e as KeyboardEvent;
    if ((ke.metaKey || ke.ctrlKey) && ke.key.toLowerCase() === 'k') {
      ke.preventDefault();
      root!.hidden ? open() : close();
    }
  });

  // Delegated so it also catches the mobile menu's search entry point.
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-cmdk-open]');
    if (!btn) return;
    e.preventDefault();
    open();
  });
}
