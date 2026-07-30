// Census of force-centred running prose, and a guard against over-correcting it.
//
// The rule, in nav-global-fix-2026-05-27.css:
//   body:not(.f8-legal) main section :is(h1..h6,p,span,a,li,div,dt,dd,blockquote,figcaption,
//   .ca-eyebrow,[class*=eyebrow]) { text-align:center!important }
//
// MEASURE IN A BROWSER, NEVER FROM THE HTML. A static scan named the compare pages as the
// worst offenders; in a real browser they have zero, because that family carries its own
// left-aligning rules at higher specificity. The rule is also !important and inherited
// through :is(), so only the computed value tells the truth.
//
// IT ALSO GUARDS AGAINST OVER-CORRECTING. The opt-out is !important and applies to h1..h6
// descendants, so marking a container that also holds the section heading silently left-aligns
// a heading that is meant to be centred. Run with --baseline BEFORE editing, then plain
// afterwards: the guard reports only headings that WERE centred and no longer are. An absolute
// "every h2 must be centred" assertion does NOT work here and produced ~45 false findings on
// pages that left-align headings by design.
const { chromium } = require("../node_modules/playwright");
const fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", ".claude", "dist", "coverage", ".dev-tools", "stripe-sample", "Assets", "Doc", "scripts", "specs", "docs", "tests"]);
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(d, e.name)); }
    else if (e.name.endsWith(".html") && !/^google[0-9a-f]+\.html$/i.test(e.name)) {
      pages.push(path.relative(ROOT, path.join(d, e.name)).split(path.sep).join("/"));
    }
  }
})(ROOT);

const MIN = Number(process.env.MIN_CHARS || 110);

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ca_cookie_consent_v2", JSON.stringify({ analytics: true, marketing: false, ts: 1 })); } catch (e) {}
  });

  const rows = [];
  for (const rel of pages.sort()) {
    const p = await ctx.newPage();
    try {
      await p.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 60000 });
      await p.waitForTimeout(1300);
      const r = await p.evaluate((min) => {
        const legal = document.body.classList.contains("f8-legal");
        const nodes = [...document.querySelectorAll("main section p, main section li, main section dd, main section div")]
          // Only leaf-ish text holders: a div wrapping other blocks is not "prose".
          .filter((el) => el.children.length === 0 || el.tagName !== "DIV")
          .filter((el) => (el.textContent || "").trim().length >= min);
        const centred = nodes.filter((el) => getComputedStyle(el).textAlign === "center");
        const longest = centred.reduce((m, el) => Math.max(m, el.textContent.trim().length), 0);
        const worst = centred.slice().sort((a, c) => c.textContent.trim().length - a.textContent.trim().length)[0];
        // HEADING ALIGNMENT IS RECORDED, NOT JUDGED.
        //
        // "Every `main section h2` must compute center" is NOT a site-wide invariant, and
        // asserting it produced ~45 false findings across security.html, terms.html, the
        // methodology page and the glossary pages, all of which left-align their headings by
        // design (three are body.f8-legal, which the centring rule excludes outright).
        // The property that actually matters is a BEFORE/AFTER one: no heading that WAS centred
        // may become left-aligned as a side effect of opting prose out. So record the alignment
        // of every heading and let --baseline / --diff compare two runs.
        const headings = [...document.querySelectorAll("main section :is(h1,h2,h3)")].map((h) => ({
          k: h.tagName + "|" + (h.textContent || "").replace(/\s+/g, " ").trim().slice(0, 48),
          a: getComputedStyle(h).textAlign,
        }));
        return {
          legal, total: nodes.length, centred: centred.length, longest,
          headings,
          sample: worst ? {
            tag: worst.tagName.toLowerCase(),
            cls: String(worst.className).slice(0, 34),
            text: worst.textContent.replace(/\s+/g, " ").trim().slice(0, 62),
          } : null,
        };
      }, MIN);
      rows.push({ rel, ...r });
    } catch (e) {
      rows.push({ rel, err: String(e).slice(0, 44) });
    }
    await p.close();
  }
  await b.close();

  const bad = rows.filter((r) => r.centred > 0).sort((a, b2) => b2.centred - a.centred);
  console.log("  centred running prose at >=" + MIN + " chars (computed, in-browser)\n");
  console.log("  " + "page".padEnd(38) + "centred/total  longest  sample");
  console.log("  " + "-".repeat(112));
  for (const r of bad) {
    console.log("  " + r.rel.padEnd(38) + String(r.centred + "/" + r.total).padEnd(15) + String(r.longest).padStart(5) + "    " +
      (r.sample ? "<" + r.sample.tag + " class=\"" + r.sample.cls + "\"> " + r.sample.text : ""));
  }
  if (!bad.length) console.log("     none");
  console.log("\n  pages measured: " + rows.length + " (" + rows.filter((r) => r.legal).length + " f8-legal, excluded by the rule)");
  console.log("  pages with centred prose: " + bad.length + "   total offending nodes: " + bad.reduce((n, r) => n + r.centred, 0));
  // Baseline / diff on heading alignment. Capture with --baseline BEFORE editing, then run
  // plain afterwards; the guard reports only headings that WERE centred and no longer are.
  const BASE = path.join(__dirname, "centred-prose-baseline.json");
  const snap = {};
  rows.forEach((r) => { if (r.headings) snap[r.rel] = Object.fromEntries(r.headings.map((h) => [h.k, h.a])); });

  if (process.argv.includes("--baseline")) {
    fs.writeFileSync(BASE, JSON.stringify(snap, null, 1));
    console.log("\n  heading-alignment baseline written: " + Object.keys(snap).length + " pages, " +
      Object.values(snap).reduce((n, o) => n + Object.keys(o).length, 0) + " headings");
  } else if (fs.existsSync(BASE)) {
    const base = JSON.parse(fs.readFileSync(BASE, "utf8"));
    const regressions = [];
    for (const [pg, hs] of Object.entries(snap)) {
      const b0 = base[pg];
      if (!b0) continue;
      for (const [k, a] of Object.entries(hs)) {
        if (b0[k] === "center" && a !== "center") regressions.push(pg + "   " + k.replace("|", " ") + "   center -> " + a);
      }
    }
    console.log("\n  GUARD  headings that WERE centred and now are not: " + regressions.length);
    regressions.slice(0, 20).forEach((x) => console.log("     " + x));
  } else {
    console.log("\n  GUARD  no baseline yet; run with --baseline before making changes");
  }
})();
