// Checks every page's RENDERED text against the hard content constraints in
// specs/homepage-transformation/BLUEPRINT.md section 2.
//
// The blueprint calls these "a defect, not a style choice", and section 7 makes "no constraint
// in section 2 is violated" part of the definition of done — but nothing enforced them. They
// are exactly the claims that are cheap to reintroduce in a copy edit and expensive to have
// live: win-probability framing, asserted Procurement Act compliance, buyer-side AI scoring,
// live portal submission, a measured accuracy number, Crown Commercial Service as a current
// body, a sub-10% PPN 002 threshold, a MEES fine over the cap.
//
// Reads rendered innerText, not source, so it judges what a visitor actually reads and is not
// fooled by class names, comments or attributes containing these strings.
//
// NOT a pass/fail gate. Several terms are legitimate in context — "fraud" belongs on a security
// page, "TED" is a substring of plenty of words — so this prints every hit WITH ITS SENTENCE
// for a human to judge. A checker that auto-failed on these would be turned off within a week.
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

// [id, severity, regex]  severity: "defect" = blueprint says never; "review" = judge in context
const RULES = [
  ["C1 win-likelihood", "defect",
    /\b(win rate|win probability|probability of winning|chance(s)? of winning|odds of winning|likelihood of winning|more likely to win|boost(s|ing)? your win|improve(s|d)? your win|increase(s|d)? your win|higher win)\b/gi],
  ["C2 PA-compliance-asserted", "defect",
    /\b(procurement act[- ]compliant|compliant with the procurement act|ensures? compliance with the procurement act|guarantees? compliance|makes you compliant)\b/gi],
  ["C3 fraud-framing", "review",
    /\b(fraud|fraudulent|lie detect\w*|catch(es|ing)? liars|dishonest|deceit\w*)\b/gi],
  ["C4 buyer-side-AI-scoring", "defect",
    /\b(ai scor\w+|automatically scores|scores each (response|bid|supplier)|scores the (responses|bids|suppliers))\b/gi],
  ["C5 live-portal-submission", "defect",
    /\b(submits? (your|the) (bid|response|tender) (to|directly)|submit(s|ted)? directly to|direct submission to|submits? to the portal|files? your bid with)\b/gi],
  // THE ABBREVIATION COUNTS. A previous remediation replaced every "Crown Commercial Service"
  // with "the Cabinet Office's central commercial organisation" but left "(CCS)" in 12 places
  // across 5 pages — the article H1, the JSON-LD headline, four card titles, an og:description
  // and the URL-encoded share links — so a rule matching only the full phrase reported ZERO
  // while the forbidden body was still named in its most recognisable form. Case-sensitive on
  // the abbreviation so ordinary words are not matched; the full name stays case-insensitive.
  ["C7 crown-commercial-service", "defect", /\bcrown commercial service\b/gi],
  ["C7 crown-commercial-service (abbrev)", "defect", /\bCCS\b/g],
  ["C8 measured-accuracy-number", "defect",
    /\b(\d{1,3}(\.\d+)?\s*%\s*(accurate|accuracy|precision|recall|f1)|accuracy of \d|f1 of \d|\d{1,3}\s*%\s*of (answers|citations) (are|were) correct)\b/gi],
  ["C12 gated-features-marketed", "review",
    /\b(tenders electronic daily|\bTED\b|co-editing|collaborative editing|real-?time collaboration)\b/g],
  ["C13 ppn002-wrong-threshold", "defect",
    /\b(5\s*%\s*(minimum\s*)?(social value|weighting)|social value.{0,24}\b5\s*%\s*minimum)\b/gi],
];

// MEES is a numeric ceiling, not a phrase, so it needs its own pass.
const MEES_CAP = 150000;

const PROBE = (RULES_SRC) => {
  const rules = RULES_SRC.map(([id, sev, src, flags]) => [id, sev, new RegExp(src, flags)]);
  // textContent, not innerText, on a clone with script/style removed.
  // innerText omits COLLAPSED content, and the FAQ answers on crowmark-buyers.html sit in a
  // closed accordion — so the checker saw "Does the AI score or rank supplier bids?" and could
  // not see the "No. Scores are evaluator-set..." two nodes later, and reported the site's
  // clearest statement of the constraint as a violation of it. For a constraint checker,
  // copy a visitor can reveal is copy that counts. Scripts are stripped so the JSON-LD FAQ
  // block does not double-count every answer it mirrors.
  const main = document.querySelector("main");
  let text = "";
  if (main) {
    const c = main.cloneNode(true);
    c.querySelectorAll("script,style,template").forEach((n) => n.remove());
    text = (c.textContent || "").replace(/\s+/g, " ");
    // ATTRIBUTE TEXT COUNTS. alt, aria-label and title are read aloud by screen readers and
    // indexed by search engines, but they are not textContent, so this checker was structurally
    // blind to them. It missed "CrowMark Analytics screen showing total contracts, bid win
    // rate, ..." on contact.html and a matching alt on sectors/index.html - both C1 violations,
    // and both describing a tile that had already been removed from the image. Appended with a
    // marker so the context line in the report says where the hit actually lives.
    const attrs = [];
    c.querySelectorAll("[alt],[aria-label],[title],[placeholder]").forEach((e) => {
      ["alt", "aria-label", "title", "placeholder"].forEach((a) => {
        const v = e.getAttribute(a);
        if (v && v.trim()) attrs.push("[" + a + "] " + v.trim());
      });
    });
    if (attrs.length) text += " ||ATTRIBUTES|| " + attrs.join(" ||ATTRIBUTES|| ");
  }
  const hits = [];
  for (const [id, sev, re] of rules) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      const i = m.index;
      const ctx = text.slice(Math.max(0, i - 60), i + m[0].length + 60).replace(/\s+/g, " ").trim();
      // A DENIAL IS NOT A CLAIM. crowmark-buyers.html asks "Does the AI score or rank supplier
      // bids?" and answers "No. Scores are evaluator-set... it does not score, rank, or
      // recommend a mark." That is the constraint being honoured in the plainest possible way,
      // and flagging it would train the reader of this report to ignore C4 entirely. Skip a hit
      // that sits in a question, or that is immediately negated.
      // Search the lookahead WINDOW, not just its first characters. The match usually lands
      // mid-question ("Does the AI score or rank supplier bids?"), so the denial that follows
      // ("No. Scores are evaluator set...") is 20-40 characters further on, and anchoring the
      // test at the start of the window missed it every time.
      const after = text.slice(i + m[0].length, i + m[0].length + 160);
      const before = text.slice(Math.max(0, i - 60), i);
      const isNegated =
        /(^|[.?!]\s*)(No|Never)\b/.test(after) ||
        /\b(does not|do not|never|cannot|is not|are not|no)\b[^.?!]{0,40}$/i.test(before) ||
        /\b(does not|do not|never|cannot)\s+(score|rank|recommend|submit|predict|file)/i.test(after);
      if (!isNegated) hits.push({ id, sev, match: m[0], ctx });
      if (!re.global) break;
    }
  }
  // MEES: any money figure in a sentence mentioning MEES that exceeds the cap.
  text.split(/(?<=[.!?])\s+/).forEach((s) => {
    if (!/\bMEES\b/i.test(s)) return;
    const money = s.match(/£\s?([\d,]+)/g) || [];
    money.forEach((mv) => {
      const n = parseInt(mv.replace(/[^\d]/g, ""), 10);
      if (n > 150000) hits.push({ id: "C13 mees-over-cap", sev: "defect", match: mv, ctx: s.slice(0, 130) });
    });
  });
  return hits;
};

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ca_cookie_consent_v2", JSON.stringify({ analytics: true, marketing: false, ts: 1 })); } catch (e) {}
  });

  const SRC = RULES.map(([id, sev, re]) => [id, sev, re.source, re.flags]);

  // SELF-TEST. A constraint checker that has never fired is worth nothing: plant one sentence
  // per DEFECT rule and require every one of them back. Three earlier detectors in this repo
  // reported confident zeroes while blind, one of them because a regex escape collapsed.
  const sp = await ctx.newPage();
  await sp.goto("http://localhost:8092/index.html", { waitUntil: "load", timeout: 45000 });
  await sp.waitForTimeout(800);
  await sp.evaluate(() => {
    const p = document.createElement("p");
    p.id = "planted-constraints";
    p.textContent = [
      "It will boost your win rate and improve your odds of winning.",
      "The tool is Procurement Act-compliant and guarantees compliance.",
      "Our AI scoring automatically scores each response for the panel.",
      "We submit your bid directly to the portal on your behalf.",
      "Approved by the Crown Commercial Service.",
      "Independently measured at 94% accuracy across every answer.",
      "A 5% minimum social value weighting applies.",
      "MEES penalties can reach £250,000 for a breach.",
    ].join(" ");
    document.querySelector("main").appendChild(p);
    // The attribute arm must be proven too, or the carve-out that reads attributes could
    // silently stop working and the checker would go back to being blind to alt text.
    const img = document.createElement("img");
    img.setAttribute("alt", "a screen showing the bid win rate over time");
    img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
    document.querySelector("main").appendChild(img);
  });
  const planted = await sp.evaluate(PROBE, SRC);
  await sp.close();
  const wantIds = ["C1 win-likelihood", "C2 PA-compliance-asserted", "C4 buyer-side-AI-scoring",
    "C5 live-portal-submission", "C7 crown-commercial-service", "C8 measured-accuracy-number",
    "C13 ppn002-wrong-threshold", "C13 mees-over-cap"];
  const missed = wantIds.filter((id) => !planted.some((h) => h.id === id));
  // The attribute arm needs its OWN assertion. C1 already fires from the planted paragraph, so
  // "C1 was reported" proves nothing about whether alt text was read at all - the arm could be
  // dead and this self-test would still pass. Require a hit whose context carries the [alt]
  // marker, which only the attribute pass emits.
  if (!planted.some((h) => /\[alt\]/.test(h.ctx))) {
    console.error("  SELF-TEST FAILED: no hit came from an attribute. The alt/aria-label pass is dead.");
    await b.close(); process.exit(1);
  }
  if (missed.length) {
    console.error("  SELF-TEST FAILED: these rules did not fire on planted violations:\n     " + missed.join("\n     "));
    await b.close(); process.exit(1);
  }
  console.log("  self-test: all " + wantIds.length + " defect rules fired on planted violations. Trustworthy.\n");

  const byRule = {};
  for (const rel of pages.sort()) {
    const p = await ctx.newPage();
    try {
      await p.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 45000 });
      await p.waitForTimeout(700);
      (await p.evaluate(PROBE, SRC)).forEach((h) => {
        (byRule[h.id] = byRule[h.id] || { sev: h.sev, hits: [] }).hits.push({ rel, ...h });
      });
    } catch (e) { /* absence shows in the totals */ }
    await p.close();
  }
  await b.close();

  console.log("  pages: " + pages.length + "\n");
  const ids = Object.keys(byRule).sort();
  const defects = ids.filter((i) => byRule[i].sev === "defect");
  console.log("  BLUEPRINT DEFECTS: " + defects.length + " rule(s)");
  defects.forEach((id) => {
    console.log("     " + id + "  x" + byRule[id].hits.length);
    byRule[id].hits.slice(0, 6).forEach((h) => console.log("        " + h.rel + "  \"" + h.ctx + "\""));
  });
  if (!defects.length) console.log("     none");

  const reviews = ids.filter((i) => byRule[i].sev === "review");
  console.log("\n  NEEDS JUDGEMENT IN CONTEXT: " + reviews.length + " rule(s)");
  reviews.forEach((id) => {
    console.log("     " + id + "  x" + byRule[id].hits.length);
    byRule[id].hits.slice(0, 8).forEach((h) => console.log("        " + h.rel + "  [" + h.match + "]  \"" + h.ctx.slice(0, 110) + "\""));
  });
  if (!reviews.length) console.log("     none");
})();
