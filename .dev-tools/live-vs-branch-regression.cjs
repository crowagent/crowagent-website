// Compare every page on this branch against the SAME page live on crowagent.ai.
//
// Why this exists. The owner found a P0 I had missed: a dangling comma in a restored CSS
// rule applied a 9.5px chip style to every heading inside `.bg-ca-*.text-white`, so the
// pricing tiers rendered at 9.5px with transparent text and 100 elements overflowed. My
// own axe, overflow and console sweeps all passed on that page, because none of them asks
// "does this look like it used to". Live is main. Anything that differs here is either an
// intended improvement or a regression, and the difference is what makes it visible.
//
// Signals chosen because they catch STRUCTURAL breakage, not content edits:
//   medianHeadingPx  - a rule hijacking headings moves this hard
//   tinyHeadings     - headings under 12px, the signature of a chip/label rule leaking
//   invisibleText    - transparent text-fill with NO gradient behind it. Transparent fill
//                      alone is the intended gradient-heading technique and flags 26 of 43
//                      pages as false positives; the gradient test is what makes it real.
//   overflowCount    - elements past the right edge
//   errors           - console + page errors
//
// Content differences are EXPECTED on this branch (sections were rewritten), so text length
// and node counts are reported but never failed on. Only the structural signals gate.
const { chromium } = require("../node_modules/playwright");
const fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const LOCAL = "http://localhost:8092/";
const LIVE = "https://crowagent.ai/";
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

// Live serves extensionless URLs; map local file paths to the public shape.
const toUrl = (rel) => rel.replace(/index\.html$/, "").replace(/\.html$/, "");

const PROBE = () => {
  const heads = [...document.querySelectorAll("main h1, main h2, main h3")];
  const sizes = heads.map((h) => parseFloat(getComputedStyle(h).fontSize)).sort((a, b) => a - b);
  const median = sizes.length ? sizes[Math.floor(sizes.length / 2)] : 0;
  let tiny = 0, invisible = 0;
  heads.forEach((h) => {
    const c = getComputedStyle(h);
    if (parseFloat(c.fontSize) < 12) tiny++;
    const f = c.webkitTextFillColor || c.getPropertyValue("-webkit-text-fill-color");
    if (/rgba\(0, 0, 0, 0\)/.test(f) && !/gradient/.test(c.backgroundImage)) invisible++;
  });
  let overflow = 0;
  document.querySelectorAll("*").forEach((e) => { if (e.getBoundingClientRect().right > window.innerWidth + 1) overflow++; });
  return { median, tiny, invisible, overflow, heads: heads.length,
           textLen: (document.body.innerText || "").length };
};

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1050 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ca_cookie_consent_v2", JSON.stringify({ analytics: true, marketing: false, ts: 1 })); } catch (e) {}
  });

  const grab = async (base, rel) => {
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    try {
      const resp = await p.goto(base + toUrl(rel), { waitUntil: "load", timeout: 45000 });
      await p.waitForTimeout(1400);
      // A 404 page is NOT a baseline. Live 404s on pages that exist only on this branch,
      // and its branded not-found page carries two big headings, which made the comparator
      // report "heading median 64px live -> 20.8px local" as a regression on a page that is
      // simply new. Detect it by status AND by the not-found copy, because Cloudflare Pages
      // can serve the branded 404 body with a 200 in some configurations.
      // 404.html IS the not-found page, so the not-found heuristic must not disqualify it.
      const isTheErrorPage = /(^|\/)404\.html$/.test(rel);
      const notFound = !isTheErrorPage && ((resp && resp.status() === 404) ||
        await p.evaluate(() => /lost in the|try these instead|page not found/i.test(document.body.innerText || "")));
      // SCROLL, SETTLE, FINISH ANIMATIONS, THEN PROBE. Added 2026-07-31.
      // This detector probed at page load, unscrolled — the same blind spot that let a real
      // defect through elsewhere this cycle: `.ca-back-link` is position:fixed and measures
      // 17.71:1 over the dark hero but 1.10:1 once the reader carries it onto the white
      // article body. Anything whose appearance depends on scroll position was invisible here.
      //
      // The settle is not optional either. Probing mid-transition reads in-flight values —
      // one axe run reported 60+ contrast failures against grey (#97999c) colours that exist
      // only during a reveal. Scroll first, wait, finish animations, then measure.
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 35));
        }
      });
      await p.evaluate(() => window.scrollTo(0, Math.min(1600, document.body.scrollHeight)));
      await p.waitForTimeout(1800);
      await p.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch (e) {} }));
      const r = await p.evaluate(PROBE);
      await p.close();
      return { ...r, errors: errs.length, ok: !notFound, why: notFound ? "live 404 / not-found page" : "" };
    } catch (e) { await p.close(); return { ok: false, why: String(e).slice(0, 50) }; }
  };

  const regressions = [], skipped = [];
  for (const rel of pages.sort()) {
    const [a, c] = [await grab(LOCAL, rel), await grab(LIVE, rel)];
    if (!a.ok) { regressions.push({ rel, what: "LOCAL FAILED TO LOAD: " + a.why }); continue; }
    if (!c.ok) { skipped.push(rel + " (not on live: " + c.why + ")"); continue; }
    const issues = [];
    // A heading median that collapses is the chip-leak signature.
    if (c.median > 0 && a.median < c.median * 0.7) issues.push("heading median " + c.median + "px live -> " + a.median + "px local");
    if (a.tiny > c.tiny) issues.push("tiny headings " + c.tiny + " -> " + a.tiny);
    if (a.invisible > c.invisible) issues.push("invisible headings " + c.invisible + " -> " + a.invisible);
    if (a.overflow > c.overflow) issues.push("overflowing elements " + c.overflow + " -> " + a.overflow);
    if (a.errors > c.errors) issues.push("errors " + c.errors + " -> " + a.errors);
    if (issues.length) regressions.push({ rel, what: issues.join("; ") });
  }
  await b.close();

  console.log("  pages compared: " + (pages.length - skipped.length) + " of " + pages.length);
  if (skipped.length) console.log("  not on live, skipped: " + skipped.length);
  console.log("  REGRESSIONS vs live: " + regressions.length + "\n");
  regressions.forEach((r) => console.log("     " + r.rel.padEnd(40) + r.what));
  if (!regressions.length) console.log("     none");
})();
