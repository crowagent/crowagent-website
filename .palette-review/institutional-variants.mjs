// Six institutional palette variants for CrowAgent, proposed 2026-08-04 in answer to the
// owner's request for options "instead of teal" that give "a feel of seriousness and
// enterprise depth".
//
// This file is the SOURCE for the E1-E6 cards on http://localhost:8096. It defines the
// tokens, computes every WCAG 2.2 contrast ratio, simulates deuteranopia and protanopia,
// and emits the HTML fragment. Nothing here touches astro/ or any production style.
//
// Run: node .palette-review/institutional-variants.mjs
// Writes: .palette-review/institutional-cards.html  and  .palette-review/institutional-audit.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------ colour maths */

const hex2rgb = (h) => {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const relLum = (h) => {
  const [r, g, b] = hex2rgb(h).map((v) => lin(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const l1 = relLum(a), l2 = relLum(b);
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
};
const r2 = (n) => Math.round(n * 100) / 100;

// sRGB -> CIE Lab (D65), for perceptual distance after colour-blind simulation.
const rgb2lab = ([R, G, B]) => {
  const [r, g, b] = [R, G, B].map((v) => lin(v / 255));
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const Y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 1.0;
  const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(X), f(Y), f(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};
const deltaE = (h1, h2) => {
  const a = rgb2lab(hex2rgb(h1)), b = rgb2lab(hex2rgb(h2));
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
};

// Vienot, Brettel & Mollon (1999) dichromat simulation, applied in linear RGB.
const CVD = {
  protanopia:   [[0.11238, 0.88762, 0.0], [0.11238, 0.88762, 0.0], [0.0, 0.0, 1.0]],
  deuteranopia: [[0.29275, 0.70725, 0.0], [0.29275, 0.70725, 0.0], [0.0, 0.0, 1.0]],
};
const unlin = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const simulate = (h, kind) => {
  const M = CVD[kind];
  const v = hex2rgb(h).map((c) => lin(c / 255));
  const out = M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
  return '#' + out
    .map((c) => Math.max(0, Math.min(255, Math.round(unlin(Math.max(0, Math.min(1, c))) * 255))))
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
};

/* ------------------------------------------------------------------ the variants */

const V = [
  {
    id: 'E1',
    name: 'E1 — The Register',
    sub: 'Deep navy ink · brass',
    line: 'The register, the seal, the ledger. Navy ground, brass rationed to the things that act.',
    t: {
      floor: '#03060D', bg: '#070C18', raised: '#0F1728', lit: '#18233A',
      hairline: '#1F2C45', borderStrong: '#6E7A94',
      text: '#FFFFFF', sub: '#D3DBEA', muted: '#A6B2C8',
      accent: '#D8B36A', accentHover: '#EFCB88', focus: '#EFCB88',
      link: '#D8B36A',
      fill: '#D8B36A', fillHover: '#EFCB88', fillEdge: '#D8B36A', fillText: '#070C18',
      success: '#6FC4A0', warning: '#F0A73C', danger: '#F47A72',
    },
    signals: 'Navy is the colour of the official record in this country — Companies House, the gilt-edged market, the civil service estate, the cover of anything that has been filed rather than launched. Brass is the seal on top of it. It suits a procurement audience because it is the palette an evaluator already associates with an authority that keeps records, not a vendor that ships features; and gold rations itself, because gold at any density stops reading as a seal and starts reading as a casino. The heading, body and card furniture are carried entirely by the navy ladder, so the brass appears perhaps six times on a page and is noticed every time.',
    weakness: 'It is the most heavily worn serious palette there is. Navy and gold is the default of every private bank, every magic-circle firm and a great many things pretending to be both, so it buys credibility at a real cost in distinctiveness — nobody will remember it. And the brass sits about fifteen degrees from the amber that carries "at risk", which means the warning state cannot rely on its hue and must always be a glyph plus a word.',
  },
  {
    id: 'E2',
    name: 'E2 — Chancery',
    sub: 'Graphite · oxblood',
    line: 'True neutral graphite, no blue cast anywhere. Oxblood is a material — fills, rules and seals — never body text.',
    t: {
      floor: '#0A0A0B', bg: '#121213', raised: '#1B1B1D', lit: '#262629',
      hairline: '#2E2E32', borderStrong: '#7A7A81',
      text: '#FFFFFF', sub: '#DCDCDF', muted: '#ABABB1',
      accent: '#CE7C87', accentHover: '#E29AA4', focus: '#E29AA4',
      link: '#FFFFFF',
      fill: '#7E2434', fillHover: '#96293C', fillEdge: '#CE7C87', fillText: '#FFFFFF',
      success: '#9BDCBB', warning: '#DDA94A', danger: '#FF8A72',
    },
    signals: 'Graphite with no blue in it at all is the single hardest ground to make look cheap, because there is no hue to get wrong — it reads as printed matter, bound reports, a set of chambers. Oxblood is unusual in software and instantly legible as legal and serious, and crucially it works here as a material rather than a tint: it fills the primary button, rules the section divides and stamps the seal, with white doing the interactive work on top of it. For a buyer reading a compliance claim, a palette that looks like a legal opinion is doing useful work before a word is read.',
    weakness: 'A brand built on dark red cannot then use red to mean danger. Danger has to shift to a lighter vermilion and carry a glyph in every instance, and even so those two reds are the closest pair anywhere in this exploration. There is a second, quieter cost: oxblood at its proper depth is too dark to be text on a dark ground at 4.5:1, so the brand colour appears less often than a brand colour normally does — its text form is a muted claret that is noticeably pinker than the fill, and the two have to be understood as one colour by an audience that has no reason to.',
  },
  {
    id: 'E3',
    name: 'E3 — Bottle',
    sub: 'Racing green · bone · aged gilt',
    line: 'Near-black warmed toward bottle green. Bone-white type, gilt for the things that act.',
    t: {
      floor: '#030806', bg: '#060E0A', raised: '#0D1913', lit: '#16261E',
      hairline: '#1C3227', borderStrong: '#5A7364',
      text: '#F5F2EA', sub: '#D6DACE', muted: '#A3AC9F',
      accent: '#E2C783', accentHover: '#F3DCA4', focus: '#F3DCA4',
      link: '#E2C783',
      fill: '#E2C783', fillHover: '#F3DCA4', fillEdge: '#E2C783', fillText: '#06100B',
      success: '#8FD6A8', warning: '#EFB24A', danger: '#F0796E',
    },
    signals: 'Bottle green with bone and gilt is about as British-establishment as a palette gets — the racing car, the leather of the reading room, the spine of a bound volume. Against a market where every bid tool is either blue or teal on grey, it is genuinely distinctive, and it carries age, which is exactly the thing a two-year-old company selling assurance would like to borrow. The bone-white type instead of pure white is the detail that does most of the work: it removes the screen-glare quality of #FFF and makes the whole page read as printed.',
    weakness: 'It does not solve the owner\'s complaint, it renames it. The site reads greenish today because teal is everywhere; a bottle-green ground reads green on purpose, and an audience that thought "sustainability" will go on thinking it — arguably more so, since green is now the ground rather than an accent. It is also the weakest variant for colour vision: a green ground under a green-blind eye flattens toward the same grey as the success state, so success must never be green here without a tick beside it.',
  },
  {
    id: 'E4',
    name: 'E4 — Foundry',
    sub: 'Slate blue-grey · copper',
    line: 'A lifted slate ground rather than near-black, with copper as the only warm thing on the page.',
    t: {
      floor: '#0E141A', bg: '#141C24', raised: '#1E2831', lit: '#2A3742',
      hairline: '#33414E', borderStrong: '#71828F',
      text: '#FFFFFF', sub: '#DAE1E8', muted: '#A9B5C0',
      accent: '#E9915F', accentHover: '#F7AC80', focus: '#F7AC80',
      link: '#E9915F',
      fill: '#E9915F', fillHover: '#F7AC80', fillEdge: '#E9915F', fillText: '#141C24',
      success: '#8FDCC8', warning: '#F3CB55', danger: '#FF7A8C',
    },
    signals: 'This is the only variant that does not fight for depth by going darker. A lifted slate ground gives the surfaces somewhere to go — you can actually see four steps — and the single warm accent against a cool ground produces perceptual depth without any element raising its voice. Copper reads as made rather than computed: foundry, plate, instrument. For an audience that has to trust a number, a palette that suggests fabrication and tolerance rather than software and velocity is arguing the right case.',
    weakness: 'It has the least contrast headroom of the six, because a lifted ground gives away the free contrast that near-black hands you, and every value here had to be pushed to clear AA rather than clearing it comfortably. Copper also sits inside the warm semantic band, so the accent, the warning and the danger state are three warm hues competing in one system — separable when you look, but the accent will occasionally be misread as an alert. Both risks are real and neither is fatal; they just mean this variant has no slack.',
  },
  {
    id: 'E5',
    name: 'E5 — Rationed Ink',
    sub: 'Monochrome ink · one desaturated steel blue',
    line: 'Ink and white do everything. A single low-chroma steel blue appears only where the reader must act.',
    t: {
      floor: '#08090B', bg: '#0C0E11', raised: '#14171B', lit: '#1E2228',
      hairline: '#262B32', borderStrong: '#666E79',
      text: '#FFFFFF', sub: '#DBDEE3', muted: '#A8ADB5',
      accent: '#93B8DC', accentHover: '#B4D0EB', focus: '#B4D0EB',
      link: '#93B8DC',
      fill: '#FFFFFF', fillHover: '#E3E7EC', fillEdge: '#FFFFFF', fillText: '#0C0E11',
      success: '#9ED2C4', warning: '#DCC183', danger: '#DE8E86',
    },
    signals: 'The most serious of the six, and the cheapest to hold to. When the page is ink and white, a single desaturated steel blue is the only thing a reader can see, so it earns attention by being rationed rather than by being loud — which is precisely the argument the product makes about evidence. White carries the primary button, which is what actually frees the accent from doing three jobs. It is also the only variant with no hue commitment at all, so it survives a change of positioning; nothing here says sustainability, or finance, or law.',
    weakness: 'Restraint and blandness are one step apart, and this variant stands on the wrong side of that line the moment the typography is anything less than excellent — there is no colour to hide behind. The semantic set is the weakest here by design: three low-chroma hues that read as three greys at a glance, so success, warning and danger depend almost entirely on their glyph and their label. And a steel-blue-on-ink page is close enough to a dozen developer tools that it risks trading one default for another.',
  },
  {
    id: 'E6',
    name: 'E6 — Paper',
    sub: 'Warm paper · ink · registry navy · seal red',
    line: 'The light option. Dark type on warm paper, the way a filed document actually looks.',
    light: true,
    t: {
      floor: '#EFEBE2', bg: '#F7F5F0', raised: '#FFFFFF', lit: '#E7E3D9',
      hairline: '#D9D4C8', borderStrong: '#7C766B',
      text: '#14171C', sub: '#3B424C', muted: '#565E69',
      accent: '#1B3A63', accentHover: '#102844', focus: '#1B3A63',
      link: '#1B3A63',
      fill: '#1B3A63', fillHover: '#102844', fillEdge: '#1B3A63', fillText: '#FFFFFF',
      success: '#0F6155', warning: '#7A5310', danger: '#96262C',
    },
    signals: 'Every competitor in this category is dark, which is the whole argument. Dark-on-light is what a document looks like — a notice, a determination, a published register — and this product\'s entire claim is that it will show you the source. It is also the only variant that is unambiguously readable in the conditions the buyer is actually in: a procurement officer on a locked-down desktop under office fluorescents, printing the page to attach to a file. Paper warmed off pure white, ink rather than black, registry navy for anything that acts, and a seal red kept exclusively for a refusal.',
    weakness: 'It is by a distance the most expensive change: every screenshot, diagram, illustration and photograph on the site is currently built for a dark ground and would need re-treating, and the teal-to-violet logo gradient sits badly on warm paper — it reads as a sticker rather than a mark. There is a positioning risk too. To the SME half of the audience, dark UI currently signals "modern software" and light signals "a website", so the seriousness this buys with a public-sector evaluator may be paid for with the supplier who is choosing a tool.',
  },
];

/* ------------------------------------------------------------------ the audit */

const SURFACES = ['floor', 'bg', 'raised', 'lit'];
const TEXT_ROLES = ['text', 'sub', 'muted', 'accent', 'link', 'success', 'warning', 'danger'];
const AA_TEXT = 4.5, AA_LARGE = 3.0, AA_NONTEXT = 3.0;

const audit = V.map((v) => {
  const t = v.t;
  const rows = [];

  for (const role of TEXT_ROLES) {
    const c = t[role];
    for (const s of SURFACES) {
      const cr = ratio(c, t[s]);
      rows.push({
        pair: `${role} on ${s}`, fg: c, bg: t[s], cr: r2(cr),
        req: AA_TEXT, pass: cr >= AA_TEXT, kind: 'text',
      });
    }
  }
  // Button label on its own fill, and the hover fill.
  rows.push({ pair: 'button label on fill', fg: t.fillText, bg: t.fill, cr: r2(ratio(t.fillText, t.fill)), req: AA_TEXT, pass: ratio(t.fillText, t.fill) >= AA_TEXT, kind: 'text' });
  rows.push({ pair: 'button label on hover fill', fg: t.fillText, bg: t.fillHover, cr: r2(ratio(t.fillText, t.fillHover)), req: AA_TEXT, pass: ratio(t.fillText, t.fillHover) >= AA_TEXT, kind: 'text' });

  // Non-text: control boundaries and the focus ring, against every surface they can land on.
  for (const s of SURFACES) {
    const cr = ratio(t.borderStrong, t[s]);
    rows.push({ pair: `control border on ${s}`, fg: t.borderStrong, bg: t[s], cr: r2(cr), req: AA_NONTEXT, pass: cr >= AA_NONTEXT, kind: 'nontext' });
  }
  for (const s of SURFACES) {
    const cr = ratio(t.focus, t[s]);
    rows.push({ pair: `focus ring on ${s}`, fg: t.focus, bg: t[s], cr: r2(cr), req: AA_NONTEXT, pass: cr >= AA_NONTEXT, kind: 'nontext' });
  }
  // The primary button's own boundary against the page ground. Where the fill itself is
  // too dark to clear 3:1 (E2's oxblood), the button carries a visible edge and it is the
  // edge that is measured -- which is why fillEdge exists as a token at all.
  rows.push({ pair: 'button boundary on bg', fg: t.fillEdge, bg: t.bg, cr: r2(ratio(t.fillEdge, t.bg)), req: AA_NONTEXT, pass: ratio(t.fillEdge, t.bg) >= AA_NONTEXT, kind: 'nontext' });
  // Secondary (outlined) button boundary.
  rows.push({ pair: 'secondary button edge on bg', fg: t.borderStrong, bg: t.bg, cr: r2(ratio(t.borderStrong, t.bg)), req: AA_NONTEXT, pass: ratio(t.borderStrong, t.bg) >= AA_NONTEXT, kind: 'nontext' });

  const fails = rows.filter((r) => !r.pass);
  const textRows = rows.filter((r) => r.kind === 'text');
  const worst = textRows.reduce((a, b) => (b.cr < a.cr ? b : a));

  // Colour vision. Every pair a reader must tell apart.
  const CVDSET = { accent: t.accent, success: t.success, warning: t.warning, danger: t.danger };
  const cvd = {};
  for (const kind of ['deuteranopia', 'protanopia']) {
    const sim = Object.fromEntries(Object.entries(CVDSET).map(([k, c]) => [k, simulate(c, kind)]));
    const pairs = [];
    const keys = Object.keys(sim);
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const dE = deltaE(sim[keys[i]], sim[keys[j]]);
        pairs.push({
          a: keys[i], b: keys[j], dE: r2(dE),
          verdict: dE >= 15 ? 'separable' : dE >= 8 ? 'marginal' : 'merges',
        });
      }
    }
    // Does each simulated colour still clear AA against the page ground?
    const stillAA = Object.fromEntries(
      Object.entries(sim).map(([k, c]) => [k, r2(ratio(c, t.bg))])
    );
    cvd[kind] = { sim, pairs, stillAA, worstPair: pairs.reduce((a, b) => (b.dE < a.dE ? b : a)) };
  }

  return { id: v.id, name: v.name, rows, fails, worst, cvd, passAA: fails.length === 0 };
});

/* ------------------------------------------------------------------ HTML output */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Prefixed --v-* so a variant's tokens can never collide with the review page's own.
const styleVars = (t) =>
  Object.entries(t).map(([k, val]) => `--v-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${val}`).join(';');

const TOKEN_LABEL = {
  floor: 'surface · floor', bg: 'surface · page', raised: 'surface · raised', lit: 'surface · lit',
  hairline: 'hairline (decorative)', borderStrong: 'control border',
  text: 'text · primary', sub: 'text · secondary', muted: 'text · muted',
  accent: 'accent (as text)', accentHover: 'accent · hover / active', focus: 'focus ring',
  link: 'link', fill: 'accent fill (button)', fillHover: 'accent fill · hover / active',
  fillEdge: 'accent fill · boundary', fillText: 'accent fill label',
  success: 'semantic · confirmed', warning: 'semantic · at risk', danger: 'semantic · refused',
};

function specimen(v) {
  const t = v.t;
  return `
  <div class="spec" style="${styleVars(t)}">
    <div class="spec-in">
      <span class="chip"><span class="chip-dot"></span>PPN 002 &middot; carbon reduction plan</span>
      <h4 class="sp-h">Every figure on this page is traceable to a statutory source</h4>
      <p class="sp-p">Where the Procurement Act 2023 and PPN 002 set a threshold, we cite the
      instrument and the paragraph. Where they do not, we say so rather than estimate.
      <a class="sp-a" href="#${v.id}">Read how we source figures</a>.</p>
      <div class="sp-btns">
        <button type="button" class="btn-p">Check a tender</button>
        <button type="button" class="btn-s">See the sources</button>
        <button type="button" class="btn-s ring">Focus ring</button>
      </div>
      <div class="sp-card">
        <div class="sp-card-h">Assessment &mdash; s.52 delivery obligations</div>
        <div class="sp-row"><span class="sp-k">Carbon reduction plan</span>
          <span class="sem ok"><span class="gl">&#10003;</span>Confirmed</span></div>
        <hr class="sp-hr">
        <div class="sp-row"><span class="sp-k">Social value weighting</span>
          <span class="sem warn"><span class="gl">&#9650;</span>At risk</span></div>
        <hr class="sp-hr">
        <div class="sp-row"><span class="sp-k">Win rate uplift</span>
          <span class="sem no"><span class="gl">&#10005;</span>Refused &mdash; no source</span></div>
      </div>
    </div>
  </div>`;
}

function tokenTable(t) {
  return `<table class="tk">` + Object.entries(t).map(([k, val]) =>
    `<tr><th><i style="background:${val}"></i>${esc(TOKEN_LABEL[k] || k)}</th><td>${esc(val.toUpperCase())}</td></tr>`
  ).join('') + `</table>`;
}

function contrastTable(a) {
  const cell = (r) =>
    `<tr class="${r.pass ? '' : 'f'}"><th>${esc(r.pair)}</th><td>${r.cr.toFixed(2)}:1</td>` +
    `<td class="need">&ge;${r.req.toFixed(1)}</td><td class="${r.pass ? 'ok' : 'bad'}">${r.pass ? 'PASS' : 'FAIL'}</td></tr>`;
  const text = a.rows.filter((r) => r.kind === 'text');
  const non = a.rows.filter((r) => r.kind === 'nontext');
  return `<table class="cx"><tr class="hd"><th>Pair</th><td>Measured</td><td>AA</td><td></td></tr>` +
    text.map(cell).join('') +
    `<tr class="hd"><th>Non-text (1.4.11)</th><td>Measured</td><td>AA</td><td></td></tr>` +
    non.map(cell).join('') + `</table>`;
}

function cvdBlock(a) {
  const one = (kind) => {
    const c = a.cvd[kind];
    const chips = Object.entries(c.sim).map(([k, hexv]) =>
      `<span class="cvsw"><i style="background:${hexv}"></i>${k}</span>`).join('');
    const pairs = c.pairs.map((p) =>
      `<span class="cvp ${p.verdict}">${p.a}/${p.b} &Delta;E ${p.dE.toFixed(1)} &middot; ${p.verdict}</span>`).join('');
    return `<div class="cv"><div class="cvh">${kind[0].toUpperCase() + kind.slice(1)} &mdash; simulated</div>
      <div class="cvrow">${chips}</div><div class="cvrow">${pairs}</div></div>`;
  };
  return one('deuteranopia') + one('protanopia');
}

const cards = V.map((v) => {
  const a = audit.find((x) => x.id === v.id);
  const worstNon = a.rows.filter((r) => r.kind === 'nontext').reduce((x, y) => (y.cr < x.cr ? y : x));
  return `
<article class="card" id="${v.id}">
  <header>
    <h2>${esc(v.name)}</h2>
    <p class="sub2">${esc(v.sub)}</p>
    <p class="line">${esc(v.line)}</p>
  </header>
  ${specimen(v)}
  <div class="body">
    <h3>What it signals</h3>
    <p>${esc(v.signals)}</p>
    <p class="flag"><b>Weakness.</b> ${esc(v.weakness)}</p>

    <h3>Tokens</h3>
    ${tokenTable(v.t)}

    <h3>WCAG 2.2 AA <span class="${a.passAA ? 'ok' : 'bad'}">${a.passAA ? 'PASS' : 'FAIL — ' + a.fails.length + ' pair(s)'}</span></h3>
    <p class="ratios">Worst text pair <b>${esc(a.worst.pair)} = ${a.worst.cr.toFixed(2)}:1</b> against a 4.5 requirement.
    Worst non-text pair <b>${esc(worstNon.pair)} = ${worstNon.cr.toFixed(2)}:1</b> against a 3.0 requirement.
    ${a.rows.length} pairs computed, ${a.rows.filter((r) => r.pass).length} pass.</p>
    ${contrastTable(a)}

    <h3>Colour vision</h3>
    ${cvdBlock(a)}
  </div>
</article>`;
}).join('\n');

fs.writeFileSync(path.join(HERE, 'institutional-cards.html'), cards, 'utf8');
fs.writeFileSync(path.join(HERE, 'institutional-audit.json'), JSON.stringify(audit, null, 2), 'utf8');

/* ------------------------------------------------------------------ console report */

for (const a of audit) {
  console.log(`\n${a.name}  ${a.passAA ? 'PASS' : 'FAIL'}`);
  console.log(`  worst text : ${a.worst.pair} = ${a.worst.cr}:1`);
  if (a.fails.length) for (const f of a.fails) console.log(`  FAIL       : ${f.pair} = ${f.cr}:1 (needs ${f.req})`);
  for (const k of ['deuteranopia', 'protanopia']) {
    const w = a.cvd[k].worstPair;
    console.log(`  ${k.padEnd(13)}: worst ${w.a}/${w.b} dE ${w.dE} (${w.verdict})`);
  }
}
console.log('\nwrote institutional-cards.html + institutional-audit.json');
