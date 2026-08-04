/* ============================================================================
   TABS — one switcher mechanism for the whole site, and one source of truth
   for which panel is showing.
   ============================================================================

   WHY THIS EXISTS. The owner, 2026-08-03, on /pricing:

     "there is issue in price page why everything is visible by deafult if
      thats the case why we need the product switcher?"

   That was accurate. The rebuilt /pricing rendered a two-pill control that
   looked like a switcher and was a pair of in-page anchor links: both audience
   sections were `display: block` at all times, so the control changed nothing
   it appeared to control. Measured on the running build before this file
   existed: `#suppliers` 1089px tall and `#buyers` 1279px tall, both visible,
   both `role: null`, zero `[role="tablist"]` and zero `[role="tabpanel"]` on
   the document.

   THE OWNER ASKED FOR THE SWITCHING BEHAVIOUR EXPLICITLY, and it is recorded in
   the legacy markup it was dropped from (`pricing.html`, the comment above
   `.ptabs`, 2026-07-29): "we must have both things as separate and must provide
   end users to switch for product for private and public suite". The price is
   shared between the two sides; the capabilities are not.

   ── WHY A SHARED MODULE RATHER THAN A SCRIPT ON /pricing ────────────────────

   The legacy site solved this once per page. `js/modules/pricing-tabs-panel.js`
   knew the id suffix `-p`, knew a hardcoded list of comparison-table ids, and
   was loaded by exactly one route; a second tabbed surface would have been a
   second copy of the same 120 lines with its own drift. The same failure the
   card recipe and the heading scale already went through on this site.

   So the contract here is data attributes, not names:

     [data-tabs]        the container. Becomes role="tablist".
     data-tabs-label    its accessible name. Carried as data rather than as
                        `aria-label` in the markup, because aria-label on a
                        generic <div> with no role names nothing; it only starts
                        meaning something once role="tablist" lands, which is
                        here.
     a[data-tab="ID"]   a tab. ID is the element id of the panel it controls,
                        and the anchor's href is `#ID`, so the control is a real
                        link before any of this runs.
     data-tab-default   optional, on one tab: the panel shown when the URL names
                        none. Falls back to the first tab.

   Nothing in this file knows what a pricing page is. Any route that renders
   `components/ui/TabSwitcher.astro` over elements that already have ids gets
   the identical widget, including the parts nobody remembers to write twice:
   roving tabindex, Home/End, the hash, and the cross-panel anchor rescue below.

   ── PROGRESSIVE ENHANCEMENT IS THE POINT, NOT A CONCESSION ──────────────────

   The legacy page shipped `<div id="buyers-p" style="display:none" hidden>` in
   the HTML. With JavaScript off or broken, an entire priced offering was
   invisible with no way to reach it, and that is why the Astro rebuild removed
   the mechanism rather than porting it. Deleting the switcher was the wrong
   half of a correct objection.

   This keeps both halves. The server renders every panel visible and the tabs
   as ordinary in-page links, which is a page that works. This module then
   upgrades that page into a tablist. If it never runs, the reader sees exactly
   what the reader saw yesterday and every link still resolves.

   The one thing enhancement cannot do from here is avoid painting the
   un-selected panel first, because the tabs sit in a sticky bar ABOVE the
   panels and a synchronous script at that point cannot see elements the parser
   has not reached. TabSwitcher.astro handles that in three lines of inline
   bootstrap, and the reason it is written the way it is, is recorded there.

   ── STATE LIVES IN ONE PLACE ────────────────────────────────────────────────

   `aria-selected` on the tab is the state. There is no companion class, so the
   accessible state and the painted state cannot disagree; the stylesheet reads
   the same attribute assistive technology does. That is also why nothing here
   touches classList: a class would be a second source of truth for the one
   thing this file exists to own.
   ========================================================================== */

/** A tab and the panel it controls, resolved once at set-up. */
interface Pair {
  tab: HTMLAnchorElement;
  panel: HTMLElement;
}

/**
 * Upgrade every `[data-tabs]` group under `root`.
 *
 * Idempotent: a group that has already been set up is skipped, so this may be
 * called again after content is injected without doubling up its listeners.
 */
export function initTabs(root: ParentNode = document): void {
  for (const group of Array.from(root.querySelectorAll<HTMLElement>('[data-tabs]'))) {
    setUp(group);
  }
}

function setUp(group: HTMLElement): void {
  if (group.dataset.tabsReady === 'true') return;

  const pairs: Pair[] = [];
  for (const tab of Array.from(group.querySelectorAll<HTMLAnchorElement>('a[data-tab]'))) {
    const id = tab.dataset.tab;
    const panel = id ? document.getElementById(id) : null;
    if (panel) pairs.push({ tab, panel });
  }

  /*
   * Fewer than two resolved panels is not a switcher, and pretending otherwise
   * would hide content behind a control that cannot reveal it. Leave the
   * anchors alone: un-upgraded, they still navigate, which is the baseline this
   * whole file is layered on top of.
   */
  if (pairs.length < 2) return;
  group.dataset.tabsReady = 'true';

  group.setAttribute('role', 'tablist');
  const label = group.dataset.tabsLabel;
  if (label) group.setAttribute('aria-label', label);

  for (const { tab, panel } of pairs) {
    if (!tab.id) tab.id = `tab-${panel.id}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    /*
     * Section.astro already points a section's `aria-labelledby` at its own
     * heading, which names the panel better than the tab does ("CrowMark for
     * Suppliers" against "For suppliers"). Only supply the tab as the label
     * where nothing has named the panel yet.
     */
    if (!panel.hasAttribute('aria-labelledby')) {
      panel.setAttribute('aria-labelledby', tab.id);
    }
  }

  /** Show one panel and mark its tab. The only place either state is written. */
  const select = (id: string, moveFocus: boolean): void => {
    for (const { tab, panel } of pairs) {
      const on = panel.id === id;
      tab.setAttribute('aria-selected', String(on));
      /* Roving tabindex: one stop in the tab order for the whole group, per the
         ARIA tabs pattern. Arrow keys move within it. */
      tab.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      if (on && moveFocus) tab.focus();
    }
  };

  /*
   * replaceState, not a hash assignment. Writing `location.hash` pushes a
   * history entry and makes the browser jump to the element, which fights the
   * sticky bar: the panels differ in height, so a native anchor jump on every
   * tab press moved the page under the control the reader had just pressed.
   * The legacy script reached the same conclusion for the same reason.
   */
  const writeHash = (id: string): void => {
    window.history.replaceState(null, '', `#${id}`);
  };

  const panelFor = (id: string): Pair | undefined =>
    pairs.find((p) => p.panel.id === id);

  group.addEventListener('click', (event) => {
    const tab = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-tab]');
    if (!tab || !group.contains(tab)) return;
    /* A modified click is a request for a new tab or window. These are real
       links; let the browser honour that rather than swallowing it. */
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    const id = tab.dataset.tab;
    if (!id || !panelFor(id)) return;
    event.preventDefault();
    select(id, false);
    writeHash(id);
  });

  group.addEventListener('keydown', (event) => {
    const current = pairs.findIndex(({ tab }) => tab === document.activeElement);
    if (current === -1) return;

    let next = current;
    switch (event.key) {
      case 'ArrowRight':
        next = (current + 1) % pairs.length;
        break;
      case 'ArrowLeft':
        next = (current - 1 + pairs.length) % pairs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = pairs.length - 1;
        break;
      case ' ':
        /* Space activates a role="tab". Activation is already a no-op here
           because the arrows select as they move, but without this the browser
           treats the anchor as a link and scrolls the page instead, which is
           the wrong answer to the right key. */
        event.preventDefault();
        return;
      default:
        return;
    }

    event.preventDefault();
    const id = pairs[next].panel.id;
    select(id, true);
    writeHash(id);
  });

  /*
   * CROSS-PANEL ANCHOR RESCUE. Any other in-page link can point at something
   * inside a panel that is not currently showing, and /pricing has one: the
   * hero's "See the plans" targets `#suppliers`. Pressed while the buyer panel
   * is up, it would scroll to a hidden element and appear to do nothing.
   *
   * Capture phase, so the panel is revealed before the browser resolves the
   * jump and the scroll lands in the right place on the first press.
   */
  document.addEventListener(
    'click',
    (event) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || link.hasAttribute('data-tab')) return;
      const id = decodeURIComponent(link.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      const owner = pairs.find(({ panel }) => panel === target || panel.contains(target));
      if (!owner || !owner.panel.hidden) return;
      select(owner.panel.id, false);
    },
    true,
  );

  /* A hash arriving from anywhere else — the browser's Back button, a pasted
     URL, a link in the footer — selects the panel it names. */
  window.addEventListener('hashchange', () => {
    const hit = panelFor(decodeURIComponent(window.location.hash.slice(1)));
    if (hit) select(hit.panel.id, false);
  });

  const fromHash = panelFor(decodeURIComponent(window.location.hash.slice(1)));
  const fallback =
    pairs.find(({ tab }) => tab.dataset.tabDefault !== undefined) ?? pairs[0];
  select((fromHash ?? fallback).panel.id, false);
}
