/* ============================================================================
   COMMAND PALETTE: the Cmd-K / Ctrl-K search, behind one export.
   ============================================================================

   IT CHANGED ON 2026-09-08 FOR THE FIRST TIME SINCE THE MOVE (A-267): the
   ACTIONS block below adds an action layer beside the route results. The
   paragraph under this one describes the move itself and is still accurate
   about it.

   THIS CODE HAD NOT CHANGED. It moved out of CommandPalette.astro's <script>
   on 2026-08-04 under ADR 0010, unedited. At 3,572 B it was the largest of the
   four scripts Astro was inlining into all 44 documents, 157 KB of build on
   its own, for a panel bound to a keystroke most readers never press.

   That is the SECOND time this component has paid for being inlined. Its
   search index used to be a <script type="application/json"> beside it, 7.1 KB
   identical in 44 documents, and moving that to a fetched
   /search-index.json is what took /crowmark back inside the per-route HTML
   budget. The index moved; the code that reads it did not, and stayed
   duplicated for another day. Both halves are external now.

   The accessibility reasoning (combobox with listbox, aria-activedescendant
   rather than moving focus, the three distinct empty states) is in the
   frontmatter of CommandPalette.astro, with the markup it describes.
   ============================================================================ */

interface Entry {
  title: string;
  href: string;
  section: string;
  hint?: string;
  /** Set only on the ACTIONS below. Entries from the index never carry it. */
  kind?: 'action';
  /** Opens in a new tab. True for the one target that is not on this origin. */
  external?: boolean;
}

/* ============================================================================
   THE ACTION LAYER (A-267, owner decision 2026-09-08, option B).
   ============================================================================

   The palette shipped as a route jumper: the index is derived from the nav,
   the footer and the content collections, so every row is a page. An action is
   a different thing. It carries INTENT into the page it lands on, so the
   reader arrives with the enquiry type already chosen and the message started
   rather than on a form they still have to configure.

   EVERY ROW HERE RESOLVES TODAY, AND EACH ONE WAS CHECKED AGAINST THE FILE
   THAT READS IT, not against a memory of it.

     - `limited-access`, `ppn002-bid`, `buyer-side` and `enterprise` are the
       literal `value` strings in ENQUIRY_OPTIONS in
       components/forms/ContactForm.astro:95-102. That matters because the
       reader in the same file only applies `?enquiry=` when the value matches
       an existing <option> (`setType` returns false otherwise), so a typo here
       would land on /contact with the select untouched and nothing to see.
     - `#contact-form` is the id on the section wrapping the form,
       pages/contact.astro:267.
     - The Calendly URL is the same constant the contact page's own "Book a
       30-minute call" button uses, pages/contact.astro:37, and that page opens
       it in a new tab, which is why `external` exists below.

   TWO ACTIONS THE EXTERNAL REVIEW ASKED FOR ARE DELIBERATELY ABSENT. There is
   no PPN 026 scoring template to export and no enterprise technical
   walkthrough to book: neither exists anywhere in this repo or on the site.
   Listing either would put a row in a palette that goes nowhere, which is the
   defect class this codebase has now fixed several times over, so they are
   raised as their own work rather than stubbed here.

   THE FREE TOOL IS NOT DUPLICATED HERE EITHER. /tools/tender-compliance-matrix/
   is already an index row titled "Tender Compliance Matrix" (verified in the
   built dist/search-index.json), so an action pointing at the same URL would
   be a second row for one destination. Running that tool ON A SAMPLE is not
   listed because the sample is loaded by a click handler on `#btn-sample` and
   the page accepts no URL parameter that would trigger it. That is a change to
   the tool, not to the palette.
   ============================================================================ */
const ACTIONS: Entry[] = [
  {
    title: 'Request access',
    href: '/contact/?enquiry=limited-access#contact-form',
    section: 'Action',
    hint: 'trial sign up get started demo account onboarding',
    kind: 'action',
  },
  {
    title: 'Book a 30-minute call',
    href: 'https://calendly.com/crowagent-platform/30min',
    section: 'Action',
    hint: 'demo meeting walkthrough talk to sales schedule calendar',
    kind: 'action',
    external: true,
  },
  {
    title: 'Ask about CrowMark for Suppliers',
    href: '/contact/?enquiry=ppn002-bid#contact-form',
    section: 'Action',
    hint: 'bid tender questionnaire ppn 002 supplier enquiry',
    kind: 'action',
  },
  {
    title: 'Ask about CrowMark for Buyers',
    href: '/contact/?enquiry=buyer-side#contact-form',
    section: 'Action',
    hint: 'buyer evaluation procurement authority enquiry',
    kind: 'action',
  },
  {
    title: 'Ask about Portfolio or volume pricing',
    href: '/contact/?enquiry=enterprise#contact-form',
    section: 'Action',
    hint: 'enterprise quote seats licence cost budget',
    kind: 'action',
  },
];

/** How many actions the resting list shows before the route suggestions. */
const RESTING_ACTIONS = 3;

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
   * meant an identical 7.1 KB in all 44 documents, 313 KB of build, paid in
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

    /*
     * ACTIONS AND ROUTES ARE SCORED IN ONE POOL, NOT IN TWO STACKED LISTS.
     * A split list would mean the reader arrows past a group heading and the
     * combobox would need aria-owns on two containers, for a distinction they
     * did not ask about. One ranked list keeps aria-activedescendant walking a
     * single sequence, which is the behaviour the earlier audit passed on.
     *
     * The +40 is a nudge, not an override. It settles a tie between an action
     * and a route that match equally well (a query of "access" hits the
     * "Request access" action and the route hint on the same words) and it
     * cannot lift a weak action over a strong route: the score bands are 1000
     * for a title prefix, 800 down to 500 for a title hit and 500 down to 100
     * elsewhere, so 40 never crosses a band.
     */
    const q = input!.value.trim().toLowerCase();
    results = q
      ? ACTIONS.concat(entries)
          .map((e) => ({ e, s: score(e, q) }))
          .filter((r) => r.s > -1)
          .map((r) => (r.e.kind === 'action' ? { e: r.e, s: r.s + 40 } : r))
          .sort((a, b) => b.s - a.s)
          .slice(0, 12)
          .map((r) => r.e)
      : /*
         * The resting list is still eight rows, so the panel does not grow.
         * Three actions and five routes rather than eight routes: an empty
         * query is a reader who has not said what they want yet, and the
         * highest-intent things this site can offer them are the ones that
         * carry an intent into the page.
         */
        ACTIONS.slice(0, RESTING_ACTIONS).concat(entries.slice(0, 8 - RESTING_ACTIONS));

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
      .map((e, i) => {
        /*
         * AN ACTION IS STILL AN ANCHOR WITH A REAL HREF, and that is the whole
         * reason the action layer costs so little here. A command row driven
         * by a callback would need a non-anchor option element, which loses
         * middle-click, "open in new tab" and "copy link address" on the rows
         * beside it and reopens the nested-interactive question the note above
         * settled. Every action on this list is a URL, so none of that applies.
         *
         * `rel` is written out rather than left to the opener because these
         * anchors can be activated by the browser directly (middle-click), not
         * only through go().
         */
        const target = e.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        const cls = e.kind === 'action' ? ' class="cmdk__opt--action"' : '';
        return (
          `<a role="option" id="cmdk-opt-${i}" aria-selected="${i === 0}" data-i="${i}" ` +
          `href="${escapeHtml(e.href)}"${target}${cls} tabindex="-1">` +
          `<span class="cmdk__t">${escapeHtml(e.title)}</span>` +
          `<span class="meta cmdk__s">${escapeHtml(e.section)}</span></a>`
        );
      })
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
    if (!entry) return;
    if (entry.external) {
      /*
       * The booking link leaves this origin, and pages/contact.astro:148 opens
       * the same URL with target="_blank". Enter and click here have to agree
       * with the anchor's own target, or the keyboard reader gets a different
       * outcome from the pointer reader on one row of the same list.
       *
       * The dialog closes because the page behind it did not change, and
       * leaving a modal open over a document the reader has come back to is
       * how a scrim ends up locking body scroll with nothing on top of it.
       */
      window.open(entry.href, '_blank', 'noopener,noreferrer');
      close();
      return;
    }
    window.location.href = entry.href;
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
   * The focus trap. Only the input is focusable inside the dialog (options
   * are driven by aria-activedescendant), so the trap reduces to keeping Tab
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

  /*
   * Delegated, so one listener serves every entry point: the header trigger,
   * the row inside the mobile menu overlay added for A-267, and the button on
   * the 404 page. This comment claimed the mobile menu one already existed and
   * it did not: measured on the built site at 390, `#mob-menu [data-cmdk-open]`
   * matched zero elements, so the claim was ahead of the markup by a month.
   * Nav.astro carries it now.
   */
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-cmdk-open]');
    if (!btn) return;
    e.preventDefault();
    open();
  });
}
