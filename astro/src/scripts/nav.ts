/* ============================================================================
   NAV: the header's own client behaviour: the mobile menu dialogue and the
   mobile accordions.
   ============================================================================

   ONE LINE CHANGED ON 2026-09-08 (A-267): the rule that closes the menu when
   something in it is activated now covers the palette button as well as the
   anchors, and the note on it says why the order matters. The paragraph below
   is about the move and is still accurate about that.

   THIS CODE HAD NOT CHANGED. It moved out of Nav.astro's <script> on
   2026-08-04 under ADR 0010 and not a line of it was rewritten on the way. The
   move is a PAYLOAD decision, not a behaviour one: Astro inlines a hoisted
   component script into the document whenever it compiles to a single chunk
   under 4 KB, so this block (identical byte for byte) was being written into
   all 44 documents. Four such blocks came to 8,958 B a document and 384.9 KB
   of build, none of which any browser could cache, because bytes inside an
   HTML document are not a cacheable resource.

   It is now one export, booted once from scripts/shell.ts, which is the single
   entry layouts/Base.astro carries. Four modules behind one entry compile to
   one chunk, one file, one request, cached once for the whole site.

   The dropdown's behaviour is NOT here. It lives in nav-dropdown.ts, beside
   the reasoning for it, for the same reason it used to live in
   NavDropdown.astro: a menu and a header are two objects.
   ============================================================================ */

// Client behaviour that belongs to the HEADER rather than to a dropdown: the
// mobile menu dialog (with a focus trap) and the mobile accordions. The
// dropdown's own behaviour lives in NavDropdown.astro, with the markup it
// drives.

function trapFocus(container: HTMLElement, onEscape: () => void) {
  const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  function getItems(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el.getClientRects().length,
    );
  }
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onEscape();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = getItems();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  document.addEventListener('keydown', onKeydown, true);
  return () => document.removeEventListener('keydown', onKeydown, true);
}

function initMobileMenu() {
  const ham = document.getElementById('nav-ham');
  const menu = document.getElementById('mob-menu');
  const closeBtn = menu?.querySelector<HTMLElement>('[data-mob-close]');
  if (!ham || !menu || !closeBtn) return;

  let untrap: (() => void) | null = null;
  let lastFocused: HTMLElement | null = null;

  function setOpen(open: boolean) {
    menu!.classList.toggle('open', open);
    ham!.setAttribute('aria-expanded', open ? 'true' : 'false');
    ham!.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      lastFocused = document.activeElement as HTMLElement;
      untrap = trapFocus(menu!, () => setOpen(false));
      const first = menu!.querySelector<HTMLElement>(
        'a[href],button:not([disabled])',
      );
      window.setTimeout(() => first?.focus({ preventScroll: true }), 30);
    } else {
      untrap?.();
      untrap = null;
      (lastFocused ?? ham)?.focus({ preventScroll: true });
    }
  }

  ham.addEventListener('click', () => setOpen(!menu!.classList.contains('open')));
  closeBtn.addEventListener('click', () => setOpen(false));
  /*
   * ANYTHING THAT TAKES THE READER SOMEWHERE CLOSES THE MENU, AND `a` WAS NOT
   * THE WHOLE OF THAT ANY MORE (A-267).
   *
   * The menu now carries a `[data-cmdk-open]` button that opens the command
   * palette, and a button is not an anchor, so this line would have left the
   * overlay standing behind the dialog. Two things go wrong when it does. The
   * palette sets `body.overflow = 'hidden'` on open and clears it on close,
   * while the menu is still open and still expects it hidden, so dismissing
   * the palette would leave the page scrolling underneath an open menu. And
   * closing the palette returns focus to whatever was focused when it opened,
   * which would be a control inside an overlay the reader has finished with.
   *
   * THE ORDER IS SAFE AND IT IS NOT AN ACCIDENT. This listener is bound
   * directly to the button, so it runs before the delegated document listener
   * in scripts/command-palette.ts. setOpen(false) restores the overflow and
   * puts focus back on the hamburger, and the palette then opens, records the
   * hamburger as the element to return to, and takes the overflow itself.
   */
  menu
    .querySelectorAll('a, [data-cmdk-open]')
    .forEach((el) => el.addEventListener('click', () => setOpen(false)));
}

/*
 * Every accordion in the mobile menu, not one named one. This loop already
 * worked for N panels before there were N of them, which is why Resources
 * needed no handler of its own. The only thing that had to change was the
 * markup it walks, and that now comes out of a map over NAV.menus.
 */
function initMobileAccordions() {
  document.querySelectorAll<HTMLElement>('.ca-mob-acc-trigger').forEach((trigger) => {
    const acc = trigger.closest<HTMLElement>('.ca-mob-acc');
    const panel = acc?.querySelector<HTMLElement>('.ca-mob-acc-panel');
    if (!acc || !panel) return;
    trigger.addEventListener('click', () => {
      const willOpen = !acc.classList.contains('open');
      acc.classList.toggle('open', willOpen);
      trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      panel.hidden = !willOpen;
    });
  });
}

/** Boot the header. Called once, from scripts/shell.ts. */
export function initNav(): void {
  initMobileMenu();
  initMobileAccordions();
}
