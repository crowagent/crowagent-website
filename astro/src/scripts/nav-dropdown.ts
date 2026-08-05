/* ============================================================================
   NAV DROPDOWN — one initialiser, every dropdown in the header.
   ============================================================================

   IT MOVED HERE UNEDITED, AND THEN IT WAS EDITED ONCE. The code came out of
   NavDropdown.astro's <script> on 2026-08-04 under ADR 0010 byte for byte; the
   morph block at the foot of initDropdown is the only thing added since, on
   2026-08-05 under A-95. The sentence above USED TO SAY "this code has not
   changed", which stopped being true the moment the morph landed. See
   scripts/nav.ts for why the four sitewide scripts were pulled behind one
   entry; the short version is that an inlined script is duplicated into every
   document and cached in none of them.

   The frontmatter comment in NavDropdown.astro is still where the DESIGN of
   this is argued — why it is a disclosure and not an ARIA menu, why the
   pointer affordance is gated to devices that can hover, why every close path
   is the way it is. That reasoning belongs with the markup it describes. The
   morph is argued in two halves, each beside the thing it owns: the MECHANISM
   below, at initDropdown, and the two transitioned properties and the clip in
   the <style> block of NavDropdown.astro. What lives here is the code, and it
   is still written for N menus rather than for the one it was born with.
   ============================================================================ */

/*
 * One initialiser, every dropdown. See the frontmatter comment for why this
 * is written for N menus rather than for the one it was born with.
 */
function initDropdown(dropdown: HTMLElement) {
  const trigger = dropdown.querySelector<HTMLElement>('.ca-dropdown-trigger');
  const panel = dropdown.querySelector<HTMLElement>('.ca-mega');
  if (!trigger || !panel) return;

  /*
   * Taking ownership of the open state. `data-js` retires the CSS-only hover
   * fallback, which exists solely for readers without JavaScript; from here
   * the panel opens if and only if this script says so, so aria-expanded
   * cannot disagree with what is on screen.
   *
   * It is also the double-init guard: this script runs once per page, but a
   * page that ever gained a second copy would otherwise bind twice and every
   * toggle would cancel itself.
   */
  if (dropdown.dataset.js !== undefined) return;
  dropdown.dataset.js = '';

  let isOpen = false;
  let closeTimer: number | undefined;

  function items(): HTMLElement[] {
    return Array.from(panel!.querySelectorAll<HTMLElement>('.ca-mega-item'));
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * THE MORPH — A-95, 2026-08-05, owner approved.
   *
   * The panel used to appear and disappear. Now, when the reader travels from
   * one menu to the next, the incoming panel starts at the OUTGOING panel's
   * measured box and grows or shrinks to its own, so the two menus read as one
   * surface changing shape rather than as two surfaces swapping.
   *
   * ── WHAT IS ACTUALLY MEASURED, AT 1440, ON THE BUILT PAGE ─────────────────
   *
   *   Products   362.00 x 320.31
   *   Resources  362.00 x 412.52
   *
   * So TODAY THIS IS A HEIGHT MORPH AND NOTHING ELSE, and saying otherwise
   * would be the kind of claim this repository keeps catching. Both panels are
   * one column of `minmax(320px, 1fr)` inside 20px of padding and a 1px border,
   * and an absolutely positioned box with no width shrinks to fit — which for
   * both menus is the 320px column floor plus 42px of chrome, identically.
   * Width is still animated because `--mega-cols` exists: the component takes
   * as many columns as a menu declares, so the first two-column menu makes the
   * width real, and a transition added on the day it is needed is a transition
   * added while somebody is looking at something else.
   *
   * WIDTH HAS A KNOWN LIMIT WHEN IT DOES BECOME REAL. Constraining the width of
   * the grid also constrains its column, so a panel morphing between two
   * DIFFERENT widths will rewrap its descriptions as it travels. Height does
   * not do this — a grid row keeps its content height and overflows, which is
   * why `.ca-mega` clips. The fix at that point is an inner wrapper held at the
   * panel's natural width with the outer box as the clip, and it is not built
   * today because it would be markup carrying a case that does not exist.
   *
   * ── WHERE THE "FROM" BOX COMES FROM, AND WHY IT IS NOT A REMEMBERED ONE ───
   *
   * It is read off whichever OTHER dropdown is open at the instant this one
   * opens, live, rather than from a box cached when something last closed. The
   * pointer path hands it over for free: moving from one trigger to the next
   * fires mouseleave on the first, which starts its 160ms delayed close, and
   * mouseenter on the second, which opens immediately. The old panel is
   * therefore still on screen and still measurable — and if it is itself
   * mid-morph, its rect is where it VISUALLY is, which is the box a reader's
   * eye is actually travelling from.
   *
   * A cached box would have to answer "how long is a remembered size still the
   * right thing to grow from", and every answer to that is a number nobody can
   * defend. Nothing open means nothing to morph from, so the panel simply
   * appears, which is the correct behaviour for a menu opened cold.
   *
   * THE KEYBOARD DELIBERATELY DOES NOT MORPH, and that is a consequence rather
   * than a carve-out. Tabbing out of a panel closes it on the next frame, so by
   * the time the reader presses Down on the next trigger there is nothing open
   * to measure. Two panels never coexist on that path, so there is no travel to
   * express, and inventing one would be animating from a box the reader never
   * saw.
   *
   * ── REDUCED MOTION: INERT, AND NOT MERELY FAST ────────────────────────────
   *
   * tokens.css collapses --dur-fast to 0.01ms under `reduce`, so the CSS half
   * is already handled the way NavDropdown.astro's chevron is, and by the same
   * token rather than by a media query of its own. That is not enough on
   * its own: it would leave this code still measuring two boxes and still
   * writing inline width and height on every open, to no visible end. So the
   * preference is read HERE too and the whole block is skipped — no
   * measurement, no inline size, nothing but show and hide.
   *
   * READ LIVE, ON EVERY OPEN, unlike `canHover` below. The difference is real:
   * whether a pointer can hover is a property of the device and cannot change
   * under the reader's feet, whereas a reader can turn reduced motion on in
   * system settings with this page open, and the next menu they open has to
   * honour it. One `.matches` read per open is the whole cost of that.
   * ════════════════════════════════════════════════════════════════════════ */

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /** Drop the inline size, so the panel measures and draws at its own again. */
  function clearSize() {
    panel!.style.width = '';
    panel!.style.height = '';
  }

  /** The panel of whichever OTHER dropdown is open right now, if any. */
  function outgoingPanel(): HTMLElement | null {
    for (const other of document.querySelectorAll<HTMLElement>('[data-nav-dropdown]')) {
      if (other === dropdown || other.dataset.open !== 'true') continue;
      const p = other.querySelector<HTMLElement>('.ca-mega');
      if (p) return p;
    }
    return null;
  }

  function morphFromOutgoing() {
    if (reduced.matches) return;
    const outgoing = outgoingPanel();
    if (!outgoing) return;
    const from = outgoing.getBoundingClientRect();
    /* Measured with no inline size on it, so `to` is the panel's OWN box and
       not a leftover from the last morph. */
    clearSize();
    const to = panel!.getBoundingClientRect();
    panel!.style.width = `${from.width}px`;
    panel!.style.height = `${from.height}px`;
    /* THE FLUSH IS THE WHOLE TRICK, AND IT WAS MEASURED BOTH WAYS RATHER THAN
       ASSUMED. The panel left `display: none` in this same task, so without
       forcing style resolution here the two writes collapse into one change and
       the browser has no before-state to interpolate from. Reading offsetWidth
       makes it resolve what it has been told so far, which turns the next write
       into a CHANGE rather than a first value.

       CONTROL, 2026-08-05, this line deleted from the built bundle and nothing
       else: `panel.getAnimations()` returned NONE, the panel rendered at 412.52
       in the same task instead of at the outgoing 320.31, and — because no
       transition ever ended — the inline size was never handed back. With the
       line in place the same probe reports one CSSTransition on height,
       320.312px to 412.516px over 180ms, and a bare `--mega-cols` style
       attribute once it settles. */
    void panel!.offsetWidth;
    panel!.style.width = `${to.width}px`;
    panel!.style.height = `${to.height}px`;
  }

  /* The inline size is temporary by design: it is removed the moment the travel
     lands, so a window resize, a font swap or a text-size change resizes the
     panel normally instead of being held at a number measured once. Both
     properties share one duration, so whichever fires first the other is at its
     end value too.

     THIS IS NOT THE ONLY THING THAT CLEARS IT, and it must not be. A transition
     that never starts never ends: two menus of identical size write identical
     numbers, no property changes, and nothing fires here. That is why closing
     clears too — the inline size can outlive one travel and cannot outlive the
     menu being shut. It is also harmless while it lasts, being by construction
     the size the panel would have taken anyway. */
  panel.addEventListener('transitionend', (e) => {
    if (e.target === panel && (e.propertyName === 'width' || e.propertyName === 'height')) clearSize();
  });

  function setOpen(open: boolean) {
    const changed = open !== isOpen;
    isOpen = open;
    dropdown.dataset.open = open ? 'true' : 'false';
    trigger!.setAttribute('aria-expanded', open ? 'true' : 'false');
    /* Only on the closed -> open edge. mouseenter and click both call this with
       `true` on a menu that is already open, and re-running the morph then would
       restart a travel the reader completed. Closing always clears, so the next
       open starts from the panel's own size whatever interrupted the last one. */
    if (!open) clearSize();
    else if (changed) morphFromOutgoing();
  }
  setOpen(false);

  /** Open (if needed) and put focus on one end of the link list. */
  function openAt(edge: 'first' | 'last') {
    setOpen(true);
    const list = items();
    if (!list.length) return;
    (edge === 'first' ? list[0] : list[list.length - 1]).focus();
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    // Safe: focus no longer reopens the panel, because :focus-within is not
    // part of the open condition once data-js is set.
    if (returnFocus) trigger!.focus();
  }

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    // Reading the flag rather than the DOM. Deriving state from a class the
    // CSS also reacts to is what made the old version unclosable.
    setOpen(!isOpen);
  });

  /*
   * KEYBOARD, ON THE TRIGGER. Enter and Space are the button's own and need
   * no handler. Down and Up open the panel and land on a link, which is the
   * disclosure-navigation affordance; Escape closes without moving focus,
   * since focus is already where it should end up.
   */
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openAt('first');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAt('last');
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      close(false);
    }
  });

  /*
   * KEYBOARD, INSIDE THE PANEL. Arrow keys move between links and WRAP, Home
   * and End jump to the ends, Escape closes and hands focus back to the
   * trigger — the return is what stops a keyboard reader being dropped at the
   * top of the document.
   *
   * Tab is deliberately not intercepted. This is a disclosure, not a modal:
   * tabbing past the last link should leave the menu and carry on through the
   * header, and the focusout handler below closes the panel when it does.
   * Trapping focus here would be the mobile dialog's behaviour applied to
   * something that is not a dialog.
   */
  panel.addEventListener('keydown', (e) => {
    const list = items();
    const here = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
      return;
    }
    if (!list.length || here === -1) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      list[(here + 1) % list.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      list[(here - 1 + list.length) % list.length].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      list[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      list[list.length - 1].focus();
    }
  });

  /*
   * Pointer affordance, and it is GATED to devices that can genuinely hover.
   *
   * Without the guard this menu cannot be opened by touch at all. A tap fires
   * a synthetic mouseenter before the click on every mobile browser, so the
   * sequence is: mouseenter opens, click toggles, net result closed. The user
   * taps the trigger and nothing happens, for ever. Caught by driving the real
   * control rather than reasoning about the handlers.
   *
   * The close is delayed so the diagonal travel from trigger to panel does
   * not dismiss it, and it yields to the keyboard: if focus is still inside,
   * the menu stays put.
   */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover) {
    dropdown.addEventListener('mouseenter', () => {
      window.clearTimeout(closeTimer);
      setOpen(true);
    });
    dropdown.addEventListener('mouseleave', () => {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        if (!dropdown.contains(document.activeElement)) setOpen(false);
      }, 160);
    });
  }

  // Tabbing out of the menu closes it. requestAnimationFrame because
  // document.activeElement is still the OLD element during focusout.
  dropdown.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!dropdown.contains(document.activeElement)) setOpen(false);
    });
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target as Node)) setOpen(false);
  });
}

/** Boot every dropdown in the header. Called once, from scripts/shell.ts. */
export function initNavDropdowns(): void {
  document.querySelectorAll<HTMLElement>('[data-nav-dropdown]').forEach(initDropdown);
}
