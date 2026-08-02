/**
 * PPN 002 calculator — legacy vs Astro parity.
 *
 * WHY THIS IS A PARITY TEST AND NOT A UNIT TEST. Unit-testing my own port
 * against my own transcription of the arithmetic proves only that I copied it
 * consistently. This drives the LIVE legacy calculator and the ported one with
 * identical inputs and compares what each actually renders. It is the only
 * check that can catch a transcription error, because it never reads my code.
 *
 * WHY IT MATTERS MORE THAN THE OTHER PAGES. This is the one page that emits a
 * NUMBER a supplier will quote to a contracting authority. A content page that
 * drifts during a port reads slightly differently. This one would tell somebody
 * their evaluation clears a statutory floor when it does not.
 *
 * IT ALREADY EARNED ITS KEEP. The first run showed the ported card displaying
 * the share-of-total where the legacy shows the raw weighting in points, and
 * omitting the "Scored mission" block entirely. Neither was visible from
 * reading the code; both appeared immediately when the two were driven side by
 * side.
 *
 * Requires BOTH servers:
 *   legacy  http://localhost:8092   (repo root)
 *   astro   http://localhost:8095   (astro preview)
 *
 *   npx playwright test tests/ppn002-parity.spec.js --project=chromium
 */
const { test, expect } = require('@playwright/test');

const LEGACY = process.env.LEGACY_URL || 'http://localhost:8092';
const ASTRO = process.env.ASTRO_URL || 'http://localhost:8095';
const PATH = '/tools/ppn-002-calculator/';

/** mission, total weighting, proposed social value. */
const CASES = [
  // Exactly on the floor — the boundary the whole tool exists to report.
  ['m1-growth', 100, 10],
  ['m2-energy', 60, 6],
  ['m3-streets', 40, 4],
  ['m4-opportunity', 10, 1],
  // Just below, where the shortfall arithmetic has to be right.
  ['m1-growth', 100, 9],
  ['m2-energy', 60, 5],
  ['m3-streets', 40, 3.5],
  ['m4-opportunity', 10, 0.5],
  // Comfortably above, and the extremes.
  ['m1-growth', 100, 25],
  ['m2-energy', 60, 12],
  ['m5-nhs', 100, 100],
  ['m1-growth', 100, 0],
  // Non-integer totals, where rounding could diverge.
  ['m5-nhs', 33, 3.3],
  ['m5-nhs', 7, 0.7],
  ['m5-nhs', 12.5, 1.25],
  ['m4-opportunity', 15, 1.5],
  ['m3-streets', 30, 3],
  // Rejections. `sv > total` is here because accepting it is how the tool once
  // reported "12 pts" on a "10 total points" evaluation.
  ['', 100, 10],
  ['m1-growth', 100, 101],
  ['m1-growth', 0, 0],
  ['m1-growth', 10, 12],
  ['m1-growth', 101, 10],
];

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

/** Every number the card puts in front of a user. */
function fields(text) {
  const g = (re) => {
    const m = text.match(re);
    return m ? m[1] : null;
  };
  return {
    rejected: /Select a mission, then enter the total evaluation weighting/.test(text) || null,
    verdict: g(/(Your [\d.,]+% social-value weighting is [^.]+\.)/),
    floorPts: g(/Mandatory 10% floor ([\d.,]+) pts/),
    floorNote: g(/10% of ([\d.,]+) total points/),
    yourPts: g(/Your proposed weighting ([\d.,]+) pts/),
    yourNote: g(/(At or above the floor|[\d.,]+ pts below the floor)/),
  };
}

async function calculate(page, base, [mission, total, sv]) {
  await page.goto(`${base}${PATH}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#ppn-form', { timeout: 20000 });
  if (mission) await page.selectOption('#missionType', mission);
  await page.fill('#bidWeighting', String(total));
  await page.fill('#socialValueCommitment', String(sv));
  // requestSubmit rather than clicking: the legacy submit button is magnetic
  // and can swallow a synthetic click between pointerdown and pointerup.
  await page.evaluate(() => document.getElementById('ppn-form').requestSubmit());
  await page.waitForTimeout(350);

  const text = await page.evaluate(() => {
    const result = document.getElementById('tool-result');
    const err = document.getElementById('calc-err');
    const visible = (el) => el && !el.hidden && !el.classList.contains('hidden');
    // The legacy engine writes its error INTO #tool-result; the port uses a
    // separate #calc-err. Read both so the comparison is fair either way.
    return [visible(result) ? result.textContent : '', visible(err) ? err.textContent : ''].join(' ');
  });

  return fields(norm(text));
}

for (const testCase of CASES) {
  const [mission, total, sv] = testCase;
  const name = mission ? `${mission} · total ${total} · sv ${sv}` : `no mission · total ${total} · sv ${sv}`;

  test(`renders identically to the legacy calculator — ${name}`, async ({ browser }) => {
    const context = await browser.newContext();
    const legacyPage = await context.newPage();
    const astroPage = await context.newPage();

    const legacy = await calculate(legacyPage, LEGACY, testCase);
    const astro = await calculate(astroPage, ASTRO, testCase);

    // Compared as whole objects so a divergence names every field at once.
    expect(astro).toEqual(legacy);

    await context.close();
  });
}
