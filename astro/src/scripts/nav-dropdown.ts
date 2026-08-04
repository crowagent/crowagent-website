/* ============================================================================
   NAV DROPDOWN — one initialiser, every dropdown in the header.
   ============================================================================

   THIS CODE HAS NOT CHANGED. It moved out of NavDropdown.astro's <script> on
   2026-08-04 under ADR 0010, unedited. See scripts/nav.ts for why the four
   sitewide scripts were pulled behind one entry; the short version is that an
   inlined script is duplicated into every document and cached in none of them.

   The frontmatter comment in NavDropdown.astro is still where the DESIGN of
   this is argued — why it is a disclosure and not an ARIA menu, why the
   pointer affordance is gated to devices that can hover, why every close path
   is the way it is. That reasoning belongs with the markup it describes. What
   moved here is the code, and it is still written for N menus rather than for
   the one it was born with.
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

  function setOpen(open: boolean) {
    isOpen = open;
    dropdown.dataset.open = open ? 'true' : 'false';
    trigger!.setAttribute('aria-expanded', open ? 'true' : 'false');
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
