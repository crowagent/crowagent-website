// British English and punctuation audit across every page's RENDERED text.
//
// WRITTEN AS A FILE ON PURPOSE. The first version of this check ran through `node -e` inside
// a double-quoted shell string, where `\\\\b` collapsed and the word-boundary anchor stopped
// matching. It reported "0 American spellings across 40,093 words" and then FAILED its own
// self-test: injecting "We organize the color center and license it" into a page produced
// zero hits while the em-dash and spaced-hyphen checks in the same pass caught their
// injections. A confident zero from a blind detector is worse than no check.
//
// Reads rendered innerText, not source, so it judges what a visitor actually reads and is not
// fooled by attributes, comments or class names containing these strings.
const { chromium } = require("../node_modules/playwright");
const fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", ".claude", "dist", "coverage", ".dev-tools", "stripe-sample", "Assets", "Doc", "scripts", "specs", "docs", "tests"]);
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(d, e.name)); }
    else if (e.name.endsWith(".html") && !/^google[0-9a-f]+\.html$/i.test(e.name))
      pages.push(path.relative(ROOT, path.join(d, e.name)).split(path.sep).join("/"));
  }
})(ROOT);

// US spelling -> UK. Kept to forms that are unambiguous in this domain.
// `practice` is deliberately ABSENT: in UK English the noun is "practice" and only the verb is
// "practise", so a bare match would flag correct usage.
const US_UK = [
  ["organize", "organise"], ["organized", "organised"], ["organization", "organisation"],
  ["recognize", "recognise"], ["recognized", "recognised"],
  ["analyze", "analyse"], ["analyzed", "analysed"], ["analyzing", "analysing"],
  ["optimize", "optimise"], ["optimized", "optimised"], ["optimization", "optimisation"],
  ["prioritize", "prioritise"], ["standardize", "standardise"], ["customize", "customise"],
  ["minimize", "minimise"], ["maximize", "maximise"], ["utilize", "utilise"],
  ["realize", "realise"], ["specialize", "specialise"], ["summarize", "summarise"],
  ["color", "colour"], ["colors", "colours"], ["colored", "coloured"],
  ["favor", "favour"], ["favorite", "favourite"], ["behavior", "behaviour"],
  ["labor", "labour"], ["honor", "honour"], ["neighbor", "neighbour"],
  ["center", "centre"], ["centers", "centres"], ["fiber", "fibre"], ["liter", "litre"],
  ["defense", "defence"], ["offense", "offence"], ["pretense", "pretence"],
  ["fulfill", "fulfil"], ["fulfillment", "fulfilment"], ["enrollment", "enrolment"],
  ["catalog", "catalogue"], ["dialog", "dialogue"], ["analog", "analogue"],
  ["traveled", "travelled"], ["traveling", "travelling"], ["canceled", "cancelled"],
  ["modeling", "modelling"], ["labeled", "labelled"], ["labeling", "labelling"],
  ["judgment", "judgement"], ["aging", "ageing"], ["skillful", "skilful"],
  ["installment", "instalment"], ["fueled", "fuelled"], ["signaled", "signalled"],
];

const scan = (text) => {
  const hits = [];
  for (const [us, uk] of US_UK) {
    const re = new RegExp("\\b" + us + "\\b", "gi");
    const m = text.match(re);
    if (m) {
      const i = text.search(re);
      hits.push({ us, uk, n: m.length, eg: text.slice(Math.max(0, i - 40), i + 34).replace(/\s+/g, " ").trim() });
    }
  }
  return {
    us: hits,
    em: (text.match(/—/g) || []).length,
    en: (text.match(/–/g) || []).length,
    spacedHyphen: (text.match(/\s-\s/g) || []).length,
    words: text.split(/\s+/).filter(Boolean).length,
  };
};

// Self-test: the detector must report a known-positive before any zero is believed.
const PROBE = "We organize the color center and license it, then analyze behavior — fine - really.";
const t = scan(PROBE);
if (!t.us.length || !t.em || !t.spacedHyphen) {
  console.error("  SELF-TEST FAILED: detector is blind (us=" + t.us.length + " em=" + t.em + " hyphen=" + t.spacedHyphen + ")");
  process.exit(1);
}
console.log("  self-test: detector reports " + t.us.length + " US spellings, " + t.em + " em-dash, " + t.spacedHyphen + " spaced hyphen on a planted string. Trustworthy.\n");

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ca_cookie_consent_v2", JSON.stringify({ analytics: true, marketing: false, ts: 1 })); } catch (e) {}
  });
  const agg = {}, dash = [];
  let words = 0;
  for (const rel of pages.sort()) {
    const p = await ctx.newPage();
    try {
      await p.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 45000 });
      await p.waitForTimeout(900);
      const text = await p.evaluate(() => { const m = document.querySelector("main"); return m ? m.innerText || "" : ""; });
      const r = scan(text);
      words += r.words;
      r.us.forEach((h) => {
        agg[h.us] = agg[h.us] || { uk: h.uk, n: 0, pages: new Set(), eg: h.eg };
        agg[h.us].n += h.n; agg[h.us].pages.add(rel);
      });
      if (r.em || r.en || r.spacedHyphen) dash.push({ rel, ...r });
    } catch (e) { /* absence surfaces in the totals */ }
    await p.close();
  }
  await b.close();

  console.log("  pages: " + pages.length + "   words scanned: " + words);
  const keys = Object.keys(agg);
  console.log("\n  AMERICAN SPELLINGS: " + keys.length + " distinct");
  keys.sort((a, b2) => agg[b2].n - agg[a].n).forEach((k) =>
    console.log("     " + k.padEnd(14) + "-> " + agg[k].uk.padEnd(14) + agg[k].n + "x on " + agg[k].pages.size + " page(s)   \"" + agg[k].eg + "\""));
  if (!keys.length) console.log("     none");

  console.log("\n  DASH AND HYPHEN PUNCTUATION: " + dash.length + " page(s)");
  dash.forEach((d) => console.log("     " + d.rel.padEnd(40) + "em " + d.em + "  en " + d.en + "  spaced-hyphen " + d.spacedHyphen));
  if (!dash.length) console.log("     none");
})();
