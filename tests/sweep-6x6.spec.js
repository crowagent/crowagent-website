/**
 * Homepage section-ground alternation, across the 6x6 viewport sweep.
 *
 * ── WHAT THIS FILE USED TO BE, AND WHY IT HAD TO CHANGE (O-16, 2026-08-05) ──
 *
 * It was a screenshot harness with NO ASSERTIONS AT ALL. Six tests, six green
 * ticks, and not one `expect` between them. Worse, every selector it hunted
 * for had already been deleted from the site: #hero, .hp-sector-marquee,
 * .hp-audience-band, .sf18-trust-bar, .cinematic-walkthrough, .crow-carousel,
 * section[aria-label="Our methodology"], .hp-cta-band — all zero occurrences in
 * index.html. Its inner loop read `if (y === null) continue;`, so it found
 * nothing, captured nothing, wrote nothing to C:/tmp/hp-screens, and reported
 * six passes. It also hard-coded localhost:8092 with no override.
 *
 * That is the exact failure this repository has been bitten by before and the
 * reason the instruction for this pass says a test must still be able to fail.
 * Six permanently-green tests are worse than no tests, because they are
 * counted in the total.
 *
 * ── WHAT IT IS NOW ──────────────────────────────────────────────────────────
 *
 * The 6x6 viewport matrix is kept, because sweeping widths is the one genuinely
 * useful idea in the original, and pointed at a rule worth locking: A-118,
 * derived and enforced centrally on 2026-08-05.
 *
 *   "A section's ground is a function of its POSITION and of nothing else.
 *    Odd sections are floor and paint nothing, so the --c-floor on <html>
 *    shows through; even sections are base and paint --c-bg, one step lighter."
 *
 * A rule derived from position is exactly the kind that a single hand-placed
 * class silently breaks, on one page, at one width, months later. Asserted as a
 * PROPERTY — alternation against the two tokens as the page itself reports
 * them — rather than against literal rgb strings, so retheming the site is not
 * a failure but a section painting the wrong ground is.
 *
 * MEASURED WHEN WRITTEN, and worth recording: the alternation holds on all 8
 * homepage sections, but FOUR stale `sv-floor` classes survive A-118's cleanup
 * of the 13 hand-placed ones — on #proof, #how-it-runs, #both-sides and
 * #integrations. Three of those four sit on EVEN sections, which are base, so
 * the class now says the opposite of the ground the section actually has. They
 * are inert today because the derived rule wins. They are not gated here
 * because removing them belongs to whoever owns astro/src; they are reported
 * with O-16 instead. If the derived rule is ever weakened, those three classes
 * become live and wrong, and this test is what will notice.
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.ASTRO_URL || 'http://127.0.0.1:8095';

const VIEWPORTS = [
  { name: 'm320', w: 320, h: 568 },
  { name: 'm390', w: 390, h: 844 },
  { name: 't768', w: 768, h: 1024 },
  { name: 't1024', w: 1024, h: 768 },
  { name: 'd1440', w: 1440, h: 900 },
  { name: 'd1920', w: 1920, h: 1080 },
];

/** Parse any CSS colour the page hands back into {r,g,b,a}. */
function parseColour(value) {
  const m = String(value).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map((n) => parseFloat(n.trim()));
  return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
}

// 2026-08-05 (O-16): the m390 pass timed out on Gecko at 30s under a
// six-project run — the homepage is long and Firefox lays it out more slowly
// at narrow widths. Tripled rather than raised globally.
test.slow();

for (const v of VIEWPORTS) {
  test(`section grounds alternate by position at ${v.name}`, async ({ page }) => {
    await page.setViewportSize({ width: v.w, height: v.h });
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    // Sections arrive with a reveal animation; the ground is painted by CSS and
    // is not animated, but settle anyway so nothing is read mid-transition.
    await page.waitForTimeout(800);

    const measured = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const sections = [...document.querySelectorAll('main > section, main > div > section')];
      return {
        floorToken: root.getPropertyValue('--c-floor').trim(),
        baseToken: root.getPropertyValue('--c-bg').trim(),
        sections: sections.map((s, i) => ({
          position: i + 1,
          id: s.id || `(section ${i + 1})`,
          background: getComputedStyle(s).backgroundColor,
        })),
      };
    });

    expect(
      measured.sections.length,
      'the homepage must have sections to check — if this is 0 the selector has drifted, not the site',
    ).toBeGreaterThan(4);
    expect(measured.baseToken, '--c-bg must be defined on :root').toBeTruthy();

    // --c-bg is authored as a hex token; compare against what the browser
    // actually paints, which it reports as rgb().
    const baseRgb = await page.evaluate((token) => {
      const probe = document.createElement('span');
      probe.style.color = token;
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    }, measured.baseToken);
    const base = parseColour(baseRgb);

    const wrong = [];
    for (const s of measured.sections) {
      const c = parseColour(s.background);
      const isTransparent = !c || c.a === 0;
      const paintsBase = !!c && c.a > 0 && c.r === base.r && c.g === base.g && c.b === base.b;
      const shouldBeFloor = s.position % 2 === 1;

      if (shouldBeFloor && !isTransparent) {
        wrong.push(
          `#${s.id} is section ${s.position} (odd, must be FLOOR and paint nothing) but paints ${s.background}`,
        );
      }
      if (!shouldBeFloor && !paintsBase) {
        wrong.push(
          `#${s.id} is section ${s.position} (even, must be BASE and paint ${baseRgb}) but paints ${s.background}`,
        );
      }
    }

    expect(
      wrong,
      `A-118: a section's ground is a function of its position and nothing else`,
    ).toEqual([]);
  });
}
