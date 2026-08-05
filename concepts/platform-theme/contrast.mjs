/* WCAG 2.2 contrast measurement for the platform theme preview.
 *
 * Every ratio quoted in README.md and in the preview's own contrast panel is
 * produced by this file. Run:  node contrast.mjs
 *
 * Alpha-carrying tokens (--c-card, --c-border) are composited over their real
 * backdrop before measurement, because a ratio against an rgba() value is
 * meaningless. The backdrop is named per pair in the tables below.
 */

const hex = (h) => {
  const s = h.replace('#', '');
  const f = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};

/** src may be '#RRGGBB' or 'rgba(r,g,b,a)'. Composites over opaque `over`. */
const resolve = (src, over) => {
  const m = /^rgba?\(([^)]+)\)$/.exec(src.trim());
  if (!m) return hex(src);
  const p = m[1].split(',').map((n) => parseFloat(n));
  const a = p.length > 3 ? p[3] : 1;
  const b = hex(over);
  return [0, 1, 2].map((i) => p[i] * a + b[i] * (1 - a));
};

const lum = ([r, g, b]) =>
  [r, g, b]
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);

const ratio = (fg, bg, over = '#000000') => {
  const a = lum(resolve(fg, over));
  const b = lum(resolve(bg, over));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};

const r2 = (n) => n.toFixed(2);

/* ── THE TWO PALETTES ──────────────────────────────────────────────────── */

const DARK = {
  floor: '#03040A',
  bg: '#05070E',
  raised: '#0F131F',
  lit: '#191E2C',
  panel: '#0C1020',
  card: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.12)',
  /* 0.38, not the website's 0.12. Solved rather than chosen: the sweep in this
     file's sibling run found 0.36 is the first step that clears 3:1 on the worst
     of the four dark surfaces, and 0.38 is the next step up for headroom. */
  borderStrong: 'rgba(255,255,255,0.38)',
  text: '#FFFFFF',
  textSub: '#D2DBEE',
  textMuted: '#A9B6D2',
  interactive: '#FFFFFF',
  fill: '#FFFFFF',
  fillLit: '#D2DBEE',
  fillText: '#05070E',
  verified: '#2DD4BF',
  refused: '#B39DFB',
  atRisk: '#E8B84B',
  danger: '#FF7A85',
  /* OPAQUE, not alpha. An alpha pill ground tracks whatever row it lands on,
     and the measured cost of that is in README section 3: the light teal pill
     fell from 4.76:1 on a resting row to 4.21:1 on a hovered one, i.e. under AA,
     purely because the row moved. These are the 12-13% washes flattened over
     --c-raised once, so a pill reads identically wherever it sits. */
  verifiedWash: '#132A32',
  refusedWash: '#24253C',
  atRiskWash: '#2B2825',
  dangerWash: '#2E202C',
  neutralWash: '#20242F',
};

const LIGHT = {
  floor: '#E7EAF2',
  bg: '#F5F6FA',
  raised: '#FFFFFF',
  lit: '#EDF0F7',
  panel: '#FFFFFF',
  card: 'rgba(11,14,25,0.025)',
  border: 'rgba(11,14,25,0.14)',
  /* 0.48. Same solve on the four light surfaces: 0.46 is the first passing step,
     0.48 the next. Light needs MORE alpha than dark for the same ratio, which is
     a real asymmetry and the reason one border token cannot serve both modes. */
  borderStrong: 'rgba(11,14,25,0.48)',
  text: '#0B0E19',
  textSub: '#2B3245',
  textMuted: '#5A6478',
  interactive: '#0B0E19',
  fill: '#0B0E19',
  fillLit: '#2B3245',
  fillText: '#F5F6FA',
  verified: '#0F766E',
  refused: '#6D28D9',
  atRisk: '#7A5514',
  danger: '#B32131',
  verifiedWash: '#E7F1F1',
  refusedWash: '#F2ECFC',
  atRiskWash: '#F2EEE8',
  dangerWash: '#F8EBEC',
  neutralWash: '#F2F2F2',
};

/* ── THE PAIRS WE ACTUALLY SHIP ────────────────────────────────────────── */

const pairs = (P) => [
  ['body text on page', P.text, P.bg, 4.5],
  ['body text on raised panel', P.text, P.raised, 4.5],
  ['body text on card', P.text, P.card, 4.5, P.bg],
  ['secondary text on page', P.textSub, P.bg, 4.5],
  ['secondary text on raised panel', P.textSub, P.raised, 4.5],
  ['muted text on page', P.textMuted, P.bg, 4.5],
  ['muted text on raised panel', P.textMuted, P.raised, 4.5],
  ['muted text on lit row (table hover)', P.textMuted, P.lit, 4.5],
  ['muted text on floor (sidebar)', P.textMuted, P.floor, 4.5],
  ['body text on floor (sidebar)', P.text, P.floor, 4.5],
  ['primary button label on its fill', P.fillText, P.fill, 4.5],
  ['primary button label on hover fill', P.fillText, P.fillLit, 4.5],
  ['secondary button label on panel', P.text, P.raised, 4.5],
  ['focus ring against page', P.interactive, P.bg, 3.0],
  ['focus ring against raised panel', P.interactive, P.raised, 3.0],
  ['control border against panel', P.borderStrong, P.raised, 3.0, P.raised],
  ['control border against page', P.borderStrong, P.bg, 3.0, P.bg],
  ['hairline against page (decorative)', P.border, P.bg, 0, P.bg],
  ['verified mark on page', P.verified, P.bg, 4.5],
  ['verified mark on raised panel', P.verified, P.raised, 4.5],
  ['verified mark on lit row', P.verified, P.lit, 4.5],
  ['refused mark on page', P.refused, P.bg, 4.5],
  ['refused mark on raised panel', P.refused, P.raised, 4.5],
  ['refused mark on lit row', P.refused, P.lit, 4.5],
  ['at-risk mark on page', P.atRisk, P.bg, 4.5],
  ['at-risk mark on raised panel', P.atRisk, P.raised, 4.5],
  ['at-risk mark on lit row', P.atRisk, P.lit, 4.5],
  ['danger text on page', P.danger, P.bg, 4.5],
  ['danger text on raised panel', P.danger, P.raised, 4.5],
  ['destructive button label on its fill', P.fillText, P.danger, 4.5],
  ['raised panel against page (surface step)', P.raised, P.bg, 0],
  ['lit row against raised panel (hover step)', P.lit, P.raised, 0],
  /* A status pill is coloured ink on a tinted ground, and the tint is the thing
     most likely to be waved through unmeasured. Each wash is composited over
     --c-raised, because a pill lives on a card or in a table row. */
  ['verified pill: ink on its own wash', P.verified, P.verifiedWash, 4.5, P.raised],
  ['refused pill: ink on its own wash', P.refused, P.refusedWash, 4.5, P.raised],
  ['at-risk pill: ink on its own wash', P.atRisk, P.atRiskWash, 4.5, P.raised],
  ['danger pill: ink on its own wash', P.danger, P.dangerWash, 4.5, P.raised],
  ['neutral pill: sub ink on neutral wash', P.textSub, P.neutralWash, 4.5, P.raised],
  /* The same pills quoted against a hovered row. With opaque grounds the number
     is now identical to the row above, which is the point of making them opaque. */
  ['verified pill on a hovered row', P.verified, P.verifiedWash, 4.5, P.lit],
  ['refused pill on a hovered row', P.refused, P.refusedWash, 4.5, P.lit],
  ['at-risk pill on a hovered row', P.atRisk, P.atRiskWash, 4.5, P.lit],
  ['danger pill on a hovered row', P.danger, P.dangerWash, 4.5, P.lit],
];

const report = (name, P) => {
  console.log(`\n=== ${name.toUpperCase()} ===`);
  console.log('pair'.padEnd(46) + 'fg'.padEnd(24) + 'bg'.padEnd(24) + 'ratio    need   verdict');
  let fails = 0;
  for (const [label, fg, bg, need, over] of pairs(P)) {
    const backdrop = over || (name === 'dark' ? DARK.bg : LIGHT.bg);
    const v = ratio(fg, bg, backdrop);
    const ok = need === 0 ? 'info' : v >= need ? 'PASS' : 'FAIL';
    if (ok === 'FAIL') fails++;
    console.log(
      label.padEnd(46) + fg.padEnd(24) + bg.padEnd(24) +
      r2(v).padStart(6) + '   ' + (need === 0 ? '  -' : need.toFixed(1).padStart(4)) + '   ' + ok
    );
  }
  console.log(`FAILURES: ${fails}`);
  return fails;
};

/* ── DERIVATION SEARCH: what a light-mode mark had to become ───────────── */

const derivations = [
  ['verified', '#2DD4BF', LIGHT.verified],
  ['refused', '#B39DFB', LIGHT.refused],
  ['at-risk', '#E8B84B', LIGHT.atRisk],
];

const derivationReport = () => {
  console.log('\n=== LIGHT-MODE DERIVATIONS: before / after, on #F5F6FA and #FFFFFF ===');
  console.log('mark'.padEnd(12) + 'dark value'.padEnd(12) + 'on bg'.padStart(7) + 'on raised'.padStart(11) +
              '   ->   ' + 'light value'.padEnd(12) + 'on bg'.padStart(7) + 'on raised'.padStart(11));
  for (const [n, d, l] of derivations) {
    console.log(
      n.padEnd(12) + d.padEnd(12) +
      r2(ratio(d, LIGHT.bg)).padStart(7) + r2(ratio(d, LIGHT.raised)).padStart(11) +
      '   ->   ' + l.padEnd(12) +
      r2(ratio(l, LIGHT.bg)).padStart(7) + r2(ratio(l, LIGHT.raised)).padStart(11)
    );
  }
  console.log('\nAnd the reverse: the light values on the DARK surfaces, which is why');
  console.log('one value cannot serve both modes.');
  for (const [n, d, l] of derivations) {
    console.log(`${n.padEnd(12)} light ${l} on ${DARK.bg} = ${r2(ratio(l, DARK.bg))}:1  (dark ${d} = ${r2(ratio(d, DARK.bg))}:1)`);
  }
};

/* THE PAGE READS THESE NUMBERS RATHER THAN QUOTING THEM. ratios.json is
   emitted here and rendered by index.html, so the contrast panel in the preview
   cannot drift from the measurement. A hand-copied table is a table that is
   wrong one edit later. */
import { writeFileSync } from 'node:fs';
const emit = () => {
  const rows = (name, P) =>
    pairs(P).map(([label, fg, bg, need, over]) => {
      const backdrop = over || P.bg;
      const v = ratio(fg, bg, backdrop);
      return { label, fg, bg, need, ratio: Number(v.toFixed(2)),
               verdict: need === 0 ? 'info' : v >= need ? 'PASS' : 'FAIL' };
    });
  writeFileSync('ratios.json', JSON.stringify({
    generated: 'node contrast.mjs',
    dark: rows('dark', DARK),
    light: rows('light', LIGHT),
    palette: { dark: DARK, light: LIGHT },
    derivations: derivations.map(([mark, darkValue, lightValue]) => ({
      mark, darkValue, lightValue,
      darkOnDarkBg: Number(ratio(darkValue, DARK.bg).toFixed(2)),
      darkOnLightBg: Number(ratio(darkValue, LIGHT.bg).toFixed(2)),
      lightOnLightBg: Number(ratio(lightValue, LIGHT.bg).toFixed(2)),
      lightOnDarkBg: Number(ratio(lightValue, DARK.bg).toFixed(2)),
    })),
  }, null, 2));
};

const f1 = report('dark', DARK);
const f2 = report('light', LIGHT);
derivationReport();
emit();
console.log(`\nTOTAL FAILURES: ${f1 + f2}`);
console.log('ratios.json written.');
