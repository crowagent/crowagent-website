// How many RENDERED LINES does each centred paragraph actually run to?
//
// The centred-prose census counts characters, which is the wrong unit for deciding whether
// centring hurts. A 130-character subhead that sets on two lines under a centred H1 is the
// intended hero pattern. The same 130 characters squeezed into a narrow column and setting
// on five lines is the defect that was already fixed once on this site by capping the measure
// — and that fix was made by measuring rendered lines, not character counts.
//
// So: lines = round(height / lineHeight), and only 4+ lines of CENTRED running prose is
// reported. Ragged-both-edges text is hard to track back to the start of the next line, and
// the difficulty scales with the number of line starts the eye has to find.
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

const LIMIT = 4; // lines

const PROBE = (LIMIT) => {
  const out = [];
  document.querySelectorAll("main p, main li").forEach((e) => {
    const t = (e.textContent || "").trim();
    if (t.length < 80) return;
    const cs = getComputedStyle(e);
    if (cs.textAlign !== "center") return;
    if (cs.display === "none" || cs.visibility === "hidden") return;
    const r = e.getBoundingClientRect();
    if (!r.height) return;
    let lh = parseFloat(cs.lineHeight);
    if (!lh || isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.4;
    const lines = Math.round(r.height / lh);
    if (lines >= LIMIT) {
      out.push({
        lines, chars: t.length,
        width: Math.round(r.width),
        cls: String(e.className || "-").slice(0, 34),
        text: t.replace(/\s+/g, " ").slice(0, 58),
      });
    }
  });
  return out;
};

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ca_cookie_consent_v2", JSON.stringify({ analytics: true, marketing: false, ts: 1 })); } catch (e) {}
  });

  // SELF-TEST: force a real paragraph narrow and centred, and require the probe to see it.
  const sp = await ctx.newPage();
  await sp.goto("http://localhost:8092/index.html", { waitUntil: "load", timeout: 45000 });
  await sp.waitForTimeout(900);
  await sp.evaluate(() => {
    const p = document.createElement("p");
    p.textContent = "planted ".repeat(40);
    p.style.cssText = "text-align:center;width:200px;font-size:16px;line-height:24px";
    document.querySelector("main").appendChild(p);
  });
  if (!(await sp.evaluate(PROBE, LIMIT)).length) {
    console.error("  SELF-TEST FAILED: probe missed a planted narrow centred paragraph.");
    await b.close(); process.exit(1);
  }
  await sp.close();
  console.log("  self-test: probe sees a planted multi-line centred paragraph. Trustworthy.\n");

  const rows = [];
  for (const rel of pages.sort()) {
    const p = await ctx.newPage();
    try {
      await p.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 45000 });
      await p.waitForTimeout(800);
      (await p.evaluate(PROBE, LIMIT)).forEach((r) => rows.push({ rel, ...r }));
    } catch (e) { /* absence shows in the total */ }
    await p.close();
  }
  await b.close();

  rows.sort((a, c) => c.lines - a.lines);
  console.log("  pages: " + pages.length + "   centred running prose at >= " + LIMIT + " rendered lines: " + rows.length + "\n");
  rows.forEach((r) =>
    console.log("     " + r.lines + " lines  " + String(r.width).padStart(4) + "px  " +
      r.rel.padEnd(34) + r.cls.padEnd(36) + '"' + r.text + '"'));
  if (!rows.length) console.log("     none");
})();
