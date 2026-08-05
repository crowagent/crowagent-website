/* LIVE VERIFICATION. Run:  node verify.mjs
 *
 * contrast.mjs measures the values I INTENDED to ship. This file measures what
 * the browser actually paints, which is a different claim and the only one worth
 * making: it walks the real rendered DOM, reads getComputedStyle on every text
 * node and control, resolves each element's true backdrop by climbing until it
 * finds a non-transparent background, and computes the ratio from that.
 *
 * It also fails on: any console error, any network request to a third-party
 * origin, and any element whose measured ratio is under its requirement.
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const URL = 'http://localhost:8120/index.html';

const parse = (c) => {
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (!m) return null;
  const p = m[1].split(',').map(parseFloat);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
};
const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});
const lum = ({ r, g, b }) =>
  [r, g, b]
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [hi, lo] = lum(a) > lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)];
  return (hi + 0.05) / (lo + 0.05);
};

/* Collected inside the page: for every element carrying its own text, the
   computed colour plus the full stack of ancestor backgrounds. Compositing
   happens out here so the maths is the same maths contrast.mjs uses. */
const COLLECT = () => {
  const out = [];
  const els = document.querySelectorAll(
    'p, span, td, th, h1, h2, h3, h4, a, label, button, li, strong, div, caption, option, kbd'
  );
  for (const el of els) {
    const direct = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3 && n.textContent.trim().length > 1)
      .map((n) => n.textContent.trim())
      .join(' ');
    if (!direct) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const opacity = parseFloat(cs.opacity);

    const stack = [];
    let n = el;
    while (n && n !== document.documentElement) {
      stack.push(getComputedStyle(n).backgroundColor);
      n = n.parentElement;
    }
    stack.push(getComputedStyle(document.documentElement).backgroundColor);
    stack.push('rgb(255, 255, 255)');

    out.push({
      text: direct.slice(0, 46),
      tag: el.tagName.toLowerCase(),
      cls: (el.className || '').toString().slice(0, 42),
      colour: cs.color,
      size: parseFloat(cs.fontSize),
      weight: parseInt(cs.fontWeight, 10) || 400,
      opacity,
      stack,
      /* An element the author has deliberately dimmed to signal "disabled" is
         exempt from 1.4.3 by the spec's own carve-out for inactive controls.
         Recorded, not silently dropped. */
      disabled: el.matches(':disabled, [aria-disabled="true"], :disabled *, [aria-disabled="true"] *'),
    });
  }
  return out;
};

const resolveBackdrop = (stack) => {
  let acc = null;
  for (let i = stack.length - 1; i >= 0; i--) {
    const c = parse(stack[i]);
    if (!c || c.a === 0) continue;
    acc = acc ? over(c, acc) : { ...c, a: 1 };
  }
  return acc || { r: 255, g: 255, b: 255, a: 1 };
};

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();

  const consoleErrors = [];
  const offOrigin = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('http://localhost:8120') && !u.startsWith('data:') && !u.startsWith('blob:')) {
      offOrigin.push(u);
    }
  });

  await page.goto(URL, { waitUntil: 'networkidle' });

  const report = { modes: {}, consoleErrors, offOrigin };

  for (const mode of ['dark', 'light']) {
    await page.click(mode === 'dark' ? '#mode-dark' : '#mode-light');
    await page.waitForFunction(
      (m) => document.documentElement.getAttribute('data-mode') === m, mode
    );
    /* The evidence table re-renders from ratios.json on every mode change; wait
       for a populated row rather than a timer. */
    await page.waitForFunction(() => document.querySelectorAll('#ratios tbody tr').length > 5);

    /* TWO ANIMATION FRAMES, AND THEY ARE LOAD-BEARING. Without them this file
       reported 267 contrast failures on the FIRST switch into light mode and
       zero on the second, with the same markup and the same tokens. The cause is
       not the page: querying the root's custom properties flushes style for the
       root, and descendants whose only change is a var() substitution can still
       return their previous computed `color` inside that same task. Measured:
       `--c-text-muted` already read `#5a6478` while `.stat__label` still
       reported `rgb(169, 182, 210)`, the dark value. One frame later both agree.
       A theme audit that reads computed styles in the same task as the theme
       change is measuring the browser's scheduling, not the design. */
    await page.evaluate(
      () => new Promise((res) => requestAnimationFrame(
        () => requestAnimationFrame(() => requestAnimationFrame(res))))
    );

    const raw = await page.evaluate(COLLECT);
    const rows = raw.map((r) => {
      const fg = parse(r.colour);
      const bg = resolveBackdrop(r.stack);
      const composited = over({ ...fg, a: fg.a * r.opacity }, bg);
      const large = r.size >= 24 || (r.size >= 18.66 && r.weight >= 700);
      return {
        ...r,
        stack: undefined,
        bgDebug: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
        stackDebug: r.stack,
        ratio: Number(ratio(composited, bg).toFixed(2)),
        need: large ? 3.0 : 4.5,
        large,
      };
    });

    const fails = rows.filter((r) => !r.disabled && r.ratio < r.need);
    report.modes[mode] = { measured: rows.length, failures: fails.length, fails };

    await page.screenshot({ path: `shot-${mode}.png`, fullPage: true });
    console.log(
      `${mode.padEnd(6)} elements measured: ${String(rows.length).padStart(4)}   ` +
      `failures: ${fails.length}   screenshot: shot-${mode}.png`
    );
    for (const f of fails) {
      console.log(
        `   FAIL ${f.ratio.toFixed(2)} < ${f.need}  <${f.tag}${f.cls ? ' class="' + f.cls + '"' : ''}>` +
        `  fg ${f.colour}  bg ${f.bgDebug}  "${f.text}"`
      );
    }
  }

  console.log(`\nconsole errors: ${consoleErrors.length}`);
  consoleErrors.forEach((e) => console.log('   ' + e));
  console.log(`third-party requests: ${offOrigin.length}`);
  offOrigin.forEach((u) => console.log('   ' + u));

  writeFileSync('verify-report.json', JSON.stringify(report, null, 2));
  await browser.close();

  const total =
    report.modes.dark.failures + report.modes.light.failures +
    consoleErrors.length + offOrigin.length;
  console.log(`\nTOTAL PROBLEMS: ${total}`);
  process.exitCode = total === 0 ? 0 : 1;
};

run();
