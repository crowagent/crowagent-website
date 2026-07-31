// Every URL shown inside simulated product chrome, as a READER sees it.
//
// BLUEPRINT section 5: "Any simulated product chrome must show the REAL CURRENT URL", and
// section 1 names `/crowmark/bid-editor` as retired and never to be shown again.
//
// WHY THIS EXISTS RATHER THAN A GREP. An earlier audit of these URLs used
// `rg -o "app\.crowagent\.ai[/a-zA-Z0-9_<>?=&.-]*"`. That character class has no space in it,
// so on crowmark.html it matched "app.crowagent.ai" and silently discarded the " / mark" that
// followed. The audit reported a clean, real-looking URL for a chrome bar that actually
// rendered "APP.CROWAGENT.AI / MARK" — not a route the product has ever served. The bug was in
// the QUESTION, not the answer: a URL split across text nodes and spaces cannot be read with a
// regex over source. Read the rendered text of the chrome element instead.
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

// Routes the product actually serves. Anything else in a chrome bar is a finding.
const REAL = [
  /^app\.crowagent\.ai$/i,
  /^app\.crowagent\.ai\/crowmark$/i,
  /^app\.crowagent\.ai\/crowmark\/contracts\/[^/]+$/i,
  /^app\.crowagent\.ai\/crowmark\/contracts\/[^/]+\/answers$/i,
  /^app\.crowagent\.ai\/crowmark\/[a-z-]+$/i,
];
const RETIRED = /bid-editor/i;

const PROBE = () => {
  const out = [];
  // Any element whose own rendered text is a crowagent app URL and which looks like chrome.
  const seen = new Set();
  document.querySelectorAll("div,span,p,code").forEach((e) => {
    const t = (e.innerText || e.textContent || "").trim().replace(/\s+/g, " ");
    if (!/^app\.crowagent\.ai/i.test(t)) return;
    if (t.length > 90) return;                       // prose mentioning the domain, not chrome
    if (e.querySelector("div,span,p,code") && [...e.children].some((c) => /^app\.crowagent\.ai/i.test((c.textContent || "").trim()))) return; // keep the innermost
    if (seen.has(t)) return;
    seen.add(t);
    const cs = getComputedStyle(e);
    out.push({ text: t, transform: cs.textTransform,
               shown: cs.textTransform === "uppercase" ? t.toUpperCase() : t });
  });
  return out;
};

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ca_cookie_consent_v2", JSON.stringify({ analytics: true, marketing: false, ts: 1 })); } catch (e) {}
  });

  // SELF-TEST: plant a bogus chrome URL and require it back.
  const sp = await ctx.newPage();
  await sp.goto("http://localhost:8092/index.html", { waitUntil: "load", timeout: 45000 });
  await sp.waitForTimeout(800);
  await sp.evaluate(() => {
    const d = document.createElement("div");
    d.textContent = "app.crowagent.ai / nonsense";
    document.querySelector("main").appendChild(d);
  });
  const planted = await sp.evaluate(PROBE);
  await sp.close();
  if (!planted.some((h) => /nonsense/.test(h.text))) {
    console.error("  SELF-TEST FAILED: probe did not see a planted bogus chrome URL.");
    await b.close(); process.exit(1);
  }
  console.log("  self-test: probe sees a planted 'app.crowagent.ai / nonsense'. Trustworthy.\n");

  const all = [], bad = [];
  for (const rel of pages.sort()) {
    const p = await ctx.newPage();
    try {
      await p.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 45000 });
      await p.waitForTimeout(700);
      (await p.evaluate(PROBE)).forEach((h) => {
        const url = h.text.replace(/…|\.\.\./g, "X").replace(/\s/g, "");
        const ok = REAL.some((r) => r.test(url)) && !RETIRED.test(url);
        all.push({ rel, ...h, ok });
        if (!ok) bad.push({ rel, ...h });
      });
    } catch (e) { /* absence shows in the totals */ }
    await p.close();
  }
  await b.close();

  console.log("  pages: " + pages.length + "   chrome URLs found: " + all.length);
  console.log("\n  NOT A REAL ROUTE: " + bad.length);
  bad.forEach((h) => console.log("     " + h.rel.padEnd(26) + 'renders as "' + h.shown + '"'));
  if (!bad.length) console.log("     none");
  console.log("\n  all URLs shown, for review:");
  [...new Set(all.map((h) => h.rel + "  |  " + h.shown))].forEach((s) => console.log("     " + s));
})();
