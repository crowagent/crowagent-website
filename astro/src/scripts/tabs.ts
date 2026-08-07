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
     [data-tab-for="ID"] optional, on any element ANYWHERE on the page: a control
                        that only means something while one of the named panels
                        is showing. Space-separated for more than one. Hidden
                        whenever the selected panel is not among them.

   ── WHY [data-tab-for] IS PART OF THE SWITCHER AND NOT A PAGE SCRIPT ────────

   O-57, owner, 2026-08-04: /pricing's monthly/annual switch stays live on the
   "For buyers" tab, where buyer pricing is "Contact sales" and there is no
   monthly or annual figure for it to move. A control that cannot change
   anything is worse than a missing one, because a reader presses it and
   concludes the page is broken rather than that the choice does not exist.

   The reference build carries a `data-no-billing-toggle` attribute on its buyer
   panel that nothing anywhere reads — a hook somebody left for a behaviour that
   was never written. The behaviour is wanted now, so it is written here, once,
   in the file that already owns which panel is showing. A second script on
   /pricing watching the same state would be a second answer to the same
   question, and the two would disagree the first time either was edited.

   The attribute goes on the CONTROL rather than on the panel, so the page says
   what it means — "this switch belongs to the supplier plans" — instead of
   leaving a reader to infer it from an exclusion listed on something else.

   HIDING IS REAL, NOT VISUAL. `hidden` takes the element out of the tab order
   and out of the accessibility tree, which is the whole point: an inert control
   must not be reachable by keyboard or announced. What `hidden` does NOT
   reliably do is paint, because the user agent rule behind it is a bare
   `display: none` that any author `display` declaration outranks. A call site
   that gives a marked element a `display` of its own therefore has to say what
   `[hidden]` means for it; /pricing does, beside the rule that made it
   necessary.

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

/** The panel ids an element's `data-tab-for` names. Empty if it carries none. */
function panelsNamedBy(el: HTMLElement): string[] {
  return (el.dataset.tabFor ?? '').split(/\s+/).filter(Boolean);
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

  /*
   * The panel-specific controls THIS group governs. Searched across the whole
   * document, because such a control is not inside the panel it belongs to —
   * /pricing's billing switch sits beside the tabs in the sticky bar, above
   * both panels — and claimed only when EVERY id it names is one of this
   * group's panels. A second switcher elsewhere on the page therefore cannot
   * reach it, and an attribute naming an id nothing renders is ignored rather
   * than silently hiding a control forever.
   */
  const controls = Array.from(document.querySelectorAll<HTMLElement>('[data-tab-for]')).filter(
    (el) => {
      const named = panelsNamedBy(el);
      return named.length > 0 && named.every((id) => pairs.some((p) => p.panel.id === id));
    },
  );

  /*
   * The stepper counter, resolved before `select` so the ONE place state is
   * written is also the one place the counter is written. Null on every call
   * site that did not ask for steppers, which is every call site but the
   * homepage showcase.
   */
  const stepWrap = group.parentElement?.querySelector<HTMLElement>('[data-tabs-steppers]') ?? null;
  const counterEl = stepWrap?.querySelector<HTMLElement>('[data-tabs-counter]') ?? null;

  /** Show one panel and mark its tab. The only place either state is written. */
  const select = (id: string, moveFocus: boolean): void => {
    for (const { tab, panel } of pairs) {
      const on = panel.id === id;
      if (on && counterEl) {
        /* Written from the SELECTED panel's index rather than from a counter
           the steppers increment themselves. Autoplay, a hash, a tab click and
           an arrow all land here, so there is no route that moves the stage
           without moving the number with it. */
        counterEl.textContent = `${pairs.findIndex((pr) => pr.panel.id === id) + 1} of ${pairs.length}`;
      }
      tab.setAttribute('aria-selected', String(on));
      /* Roving tabindex: one stop in the tab order for the whole group, per the
         ARIA tabs pattern. Arrow keys move within it. */
      tab.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      if (on && moveFocus) tab.focus();
    }
    /* `hidden` and nothing else. It is the one attribute that removes an element
       from the tab order and from the accessibility tree at the same time, so
       the control cannot be tabbed to or announced while it is inert, and no
       second state has to be kept in step with it. */
    /* NO FOCUS RESCUE HERE, AND THAT WAS MEASURED RATHER THAN ASSUMED. Hiding
       the element the caret sits in normally drops focus to <body>, so a rescue
       looked necessary. The only route that can reach it is a hash change
       arriving with focus already on the control — Back, or a pasted URL — and
       fragment navigation blurs the active element itself, after the
       `hashchange` listener has run. Focusing the newly selected tab from here
       was tried and the caret still ended on <body>: same outcome, one branch
       that never survives its own turn. A click cannot reach it either, because
       clicking a tab focuses that tab first. */
    for (const el of controls) {
      el.hidden = !panelsNamedBy(el).includes(id);
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
   * ── THE STEPPERS, 2026-08-07 ────────────────────────────────────────────
   *
   * They do not implement stepping. They SYNTHESISE the arrow key the ARIA
   * pattern above already handles, and that is the whole of the design.
   *
   * WHY, RATHER THAN A SECOND COPY OF THE SAME FIVE LINES. The handler above
   * already wraps at both ends, selects, moves focus and writes the hash, and
   * the autoplay block already treats ArrowLeft/ArrowRight as a reader's
   * choice and stops the loop for good. Dispatching the key gets all four
   * behaviours by construction, so the buttons and the keyboard cannot drift
   * apart — and a second control for one piece of state that behaves subtly
   * differently from the first is worse than no second control.
   *
   * IT IS ALSO WHAT KEEPS THE JS BUDGET. Written out longhand, this block plus
   * its own autoplay listener pushed tabs.ts past the threshold at which Vite
   * stops inlining the chunk and emits it as a file, and check-budgets counts
   * that file whole: JS total went 21.6 KB across 2 files to 25.8 KB across 3
   * against a 23.0 KB budget, for roughly 600 bytes of actual new code. The
   * measured lesson is that a duplicated code path can cost seven times its
   * own size once it crosses a packaging boundary.
   *
   * REVEALED ONLY HERE. The wrapper ships `hidden`, so the arrows exist for a
   * reader whose module ran and for nobody else — the same contract the pause
   * control is under, and the reason neither can become a dead control.
   */
  if (stepWrap) {
    const press = (key: string) => () =>
      group.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    stepWrap.querySelector('[data-tabs-prev]')?.addEventListener('click', press('ArrowLeft'));
    stepWrap.querySelector('[data-tabs-next]')?.addEventListener('click', press('ArrowRight'));
    stepWrap.hidden = false;
  }

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

  /*
   * ── AUTOPLAY, OPT-IN, WITH THE THREE CONSTRAINTS THAT ARE NOT NEGOTIABLE ────
   *
   * Owner, 2026-08-05 (A-104 item 2): the homepage product showcase autoplays
   * through all five tabs in a loop. /pricing does not, and A-105 decided this
   * component stays SHARED rather than forked, so the behaviour is opt-in via
   * `data-tabs-autoplay` and a group without that attribute leaves this function
   * having created no timer, no listener and no control.
   *
   *   1. IT MUST NOT AUTOPLAY UNDER prefers-reduced-motion. Checked live rather
   *      than at build time, and re-checked on change, because a reader can turn
   *      the preference on while the page is open and a loop that keeps running
   *      through that is exactly the complaint the preference exists to make.
   *   2. WCAG 2.2.2 REQUIRES A PAUSE CONTROL for anything moving that starts
   *      automatically and lasts over five seconds. The control is rendered by
   *      TabSwitcher.astro and revealed HERE, only once a timer genuinely runs,
   *      so a reader who never gets autoplay never gets a dead button.
   *   3. IT STOPS PERMANENTLY THE MOMENT A READER CHOOSES A TAB. Continuing to
   *      advance after someone has expressed a preference is hostile: it takes
   *      the page back off them. `stop()` is one-way and there is deliberately
   *      no route that restarts the timer after it.
   *
   * Hover and focus merely SUSPEND, which is different from stopping: passing
   * the pointer over the control is not a choice, so the loop resumes on leave.
   */
  const autoplaySeconds = Number(group.dataset.tabsAutoplay);
  if (!Number.isFinite(autoplaySeconds) || autoplaySeconds <= 0) return;

  const wrapper = group.parentElement;
  const pauseBtn = wrapper?.querySelector<HTMLButtonElement>('[data-tabs-pause]') ?? null;
  const pauseLabel = pauseBtn?.querySelector<HTMLElement>('[data-tabs-pause-label]') ?? null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  let timer: number | null = null;
  /** Set once a reader picks a tab. One-way, by design: see constraint 3. */
  let abandoned = false;
  /** Paused by the button. Distinct from `abandoned` and from a hover suspend. */
  let paused = false;

  const advance = (): void => {
    const current = pairs.findIndex(({ panel }) => !panel.hidden);
    const next = pairs[(current + 1) % pairs.length];
    /* No hash write and no focus move. Writing the hash on a timer would
       rewrite the reader's URL every few seconds and poison a copied link;
       moving focus would steal the caret from whatever they were using. */
    if (next) select(next.panel.id, false);
  };

  const run = (): void => {
    if (timer !== null || abandoned || paused || reduced.matches) return;
    timer = window.setInterval(advance, autoplaySeconds * 1000);
  };

  const halt = (): void => {
    if (timer === null) return;
    window.clearInterval(timer);
    timer = null;
  };

  /** One-way. The control is removed with the behaviour it controls. */
  const stop = (): void => {
    abandoned = true;
    halt();
    if (pauseBtn) pauseBtn.hidden = true;
  };

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      if (paused) halt();
      else run();
      pauseBtn.setAttribute('aria-pressed', String(paused));
      if (pauseLabel) pauseLabel.textContent = paused ? 'Play' : 'Pause';
      pauseBtn.classList.toggle('is-paused', paused);
    });
  }

  /* An explicit choice, by pointer or by keyboard, ends autoplay for good.
     Capture phase so it lands even though the group's own click handler calls
     preventDefault, and `keydown` covers the arrow-key path through the ARIA
     pattern, which is a choice just as much as a click is. */
  group.addEventListener('click', (e) => {
    if ((e.target as Element | null)?.closest('a[data-tab]')) stop();
  }, true);
  group.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', ' '].includes(e.key)) stop();
  }, true);

  /* NO SEPARATE STEPPER LISTENER IS NEEDED, and that is a consequence of the
     steppers dispatching a real ArrowLeft/ArrowRight at the group: the keydown
     handler directly above already calls stop() for those keys, so a stepper
     press ends autoplay through the same route a key press does. */

  /* Suspend while the reader is over or inside the control, and while the tab
     is in the background. Neither is a choice, so neither is permanent. */
  const suspendOn = ['pointerenter', 'focusin'] as const;
  const resumeOn = ['pointerleave', 'focusout'] as const;
  for (const ev of suspendOn) wrapper?.addEventListener(ev, halt);
  for (const ev of resumeOn) wrapper?.addEventListener(ev, run);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') halt();
    else run();
  });

  /* Re-checked on change, per constraint 1. Turning the preference ON stops the
     loop and withdraws the control; turning it off does not silently start
     animating a page the reader is already reading, which is why this only
     halts and never calls run(). */
  const onReducedChange = (): void => {
    if (!reduced.matches) return;
    halt();
    if (pauseBtn) pauseBtn.hidden = true;
  };
  if (typeof reduced.addEventListener === 'function') {
    reduced.addEventListener('change', onReducedChange);
  }

  if (!reduced.matches) {
    if (pauseBtn) {
      pauseBtn.hidden = false;
      pauseBtn.setAttribute('aria-pressed', 'false');
    }
    run();
  }
}
