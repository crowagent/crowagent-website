// Do the CTAs in a row of equal-height cards share one baseline?
//
// This is the polish defect that separates a considered layout from an assembled one, and no
// existing gate looks for it. On tools/index.html the four cards were all exactly 248px tall,
// but one card's body ran to four lines where the others ran to three, so its "Explore" link
// sat 22px below its neighbours. Nothing overflowed, nothing was inaccessible, no console
// error, no contrast failure. It just looked wrong.
//
// METHOD, and the two things that make it honest:
//   1. Cards are grouped into ROWS by their own top edge, not assumed to be one row. A 4-up
//      grid becomes 2x2 at 900px and a single column at 390px, and comparing across a wrap
//      would report every responsive grid on the site as broken.
//   2. Only rows whose cards are the SAME HEIGHT are judged. Where cards have different
//      heights the CTA cannot be expected to align, and demanding it would be wrong.
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

const TOL = 2; // px

const PROBE = (TOL) => {
  const out = [];
  // Any grid or flex container with 2+ element children that each end in a link/button.
  document.querySelectorAll("main div, main section, main ul").forEach((grid) => {
    const cs = getComputedStyle(grid);
    if (cs.display !== "grid" && cs.display !== "flex") return;
    const kids = [...grid.children].filter((k) => {
      const r = k.getBoundingClientRect();
      return r.width > 60 && r.height > 60;
    });
    if (kids.length < 2) return;

    // Each child must carry exactly one trailing CTA for the comparison to mean anything.
    const items = kids.map((k) => {
      const links = [...k.querySelectorAll("a,button")];
      if (!links.length) return null;
      const last = links[links.length - 1];
      const lr = last.getBoundingClientRect(), kr = k.getBoundingClientRect();
      if (!lr.height) return null;
      // The CTA must actually sit in the lower half, or it is a title link, not a footer CTA.
      if (lr.top - kr.top < kr.height * 0.4) return null;
      // AND it must live in the card's LAST element child - a real action row - not merely be
      // the last link found. Without this the probe compared a Companies House number inside a
      // <p> on about.html against an email address inside a <span>, and a nav link on faq.html
      // against a prose link, reporting four "ragged" rows that were nothing of the kind. An
      // inline link in running prose has no business sharing a baseline with anything.
      const tail = k.lastElementChild;
      if (!tail || !(tail === last || tail.contains(last))) return null;
      return { top: Math.round(kr.top), h: Math.round(kr.height), cta: Math.round(lr.top),
               ctaH: Math.round(lr.height), ctaBottom: Math.round(lr.bottom),
               tail: k.lastElementChild.tagName + "." + String(k.lastElementChild.className || "-").split(" ")[0],
               label: (last.textContent || "").trim().replace(/\s+/g, " ").slice(0, 20) };
    });
    if (items.some((i) => !i)) return;

    const rows = {};
    items.forEach((i) => { (rows[i.top] = rows[i.top] || []).push(i); });
    Object.values(rows).forEach((row) => {
      if (row.length < 2) return;
      const hs = row.map((i) => i.h);
      if (Math.max(...hs) - Math.min(...hs) > TOL) return;      // unequal cards: not comparable
      // COMPARE LIKE WITH LIKE. The trailing element must be the same KIND across the row, or
      // the cards are not the same sort of card and a shared baseline is not a goal. This
      // dropped two rows that had survived every earlier filter: faq.html was comparing a
      // <nav> of legal links against a prose CTA, and contact.html an 11px fine-print <p>
      // ("Privacy Policy") against a button. Aligning fine print to a button is meaningless,
      // and reporting it forever would be how this check earns its way into the ignore pile.
      // Compared by COMPONENT (tag + first class), not tag alone: faq.html survived a
      // tag-only check because a sticky sidebar and an accordion body are both <div>. They are
      // a two-column page layout, not a row of cards, and their trailing elements
      // (DIV.sticky vs DIV.ca-faq) say so plainly.
      if (new Set(row.map((i) => i.tail)).size > 1) return;
      // A ROW WHOSE BUTTONS ARE DIFFERENT HEIGHTS CANNOT ALIGN ON BOTH EDGES, and picking the
      // top edge to measure is arbitrary. contact.html reported a 12px spread purely because
      // "Get in touch" wraps to two lines and its button is 12px taller than the other two -
      // yet all three shared an identical bottom edge at 495px, which is the alignment a
      // reader actually perceives in a row of buttons. Judge the bottom edge, and skip rows
      // where the CTAs are not the same height rather than demanding an impossible alignment.
      const ctaHs = row.map((i) => i.ctaH);
      if (Math.max(...ctaHs) - Math.min(...ctaHs) > TOL) {
        const bots = row.map((i) => i.ctaBottom);
        if (Math.max(...bots) - Math.min(...bots) <= TOL) return;   // bottoms agree: aligned
      }
      const ctas = row.map((i) => i.cta);
      const spread = Math.max(...ctas) - Math.min(...ctas);
      if (spread > TOL) {
        out.push({
          sel: grid.tagName.toLowerCase() + "." + String(grid.className || "-").split(" ")[0].slice(0, 26),
          n: row.length, h: hs[0], spread,
          labels: row.map((i) => i.label).join(" / ").slice(0, 54),
        });
      }
    });
  });
  return out;
};

(async () => {
  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ca_cookie_consent_v2", JSON.stringify({ analytics: true, marketing: false, ts: 1 })); } catch (e) {}
  });

  // SELF-TEST: shove one CTA down on a real card row and require the probe to report it.
  const sp = await ctx.newPage();
  await sp.goto("http://localhost:8092/tools/index.html", { waitUntil: "load", timeout: 45000 });
  await sp.waitForTimeout(1000);
  await sp.evaluate(() => {
    const c = document.querySelector(".xcard a.go");
    // `position:relative; top` rather than a margin. The first version planted
    // `marginTop:40px`, which stopped producing misalignment the moment the real fix set
    // `margin-top:auto` on that CTA - the plant was overwriting the very property under test,
    // and the self-test correctly failed rather than passing a blind detector through.
    // Offsetting the painted box instead is independent of the flex model.
    if (c) { c.style.position = "relative"; c.style.top = "40px"; }
  });
  if (!(await sp.evaluate(PROBE, TOL)).length) {
    console.error("  SELF-TEST FAILED: probe missed a CTA pushed 40px out of line. Detector is blind.");
    await b.close(); process.exit(1);
  }
  await sp.close();
  console.log("  self-test: probe reports a CTA pushed 40px out of line. Trustworthy.\n");

  const widths = [1440, 900, 768, 390];
  const found = [];
  for (const rel of pages.sort()) {
    for (const w of widths) {
      const p = await ctx.newPage();
      await p.setViewportSize({ width: w, height: 1000 });
      try {
        await p.goto("http://localhost:8092/" + rel, { waitUntil: "load", timeout: 45000 });
        await p.waitForTimeout(700);
        await p.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30));
          }
          window.scrollTo(0, 0);
        });
        await p.waitForTimeout(400);
        (await p.evaluate(PROBE, TOL)).forEach((r) => found.push({ rel, w, ...r }));
      } catch (e) { /* absence shows in the total */ }
      await p.close();
    }
  }
  await b.close();

  console.log("  pages: " + pages.length + "   widths: " + widths.join(", "));
  console.log("  RAGGED CTA BASELINES IN EQUAL-HEIGHT ROWS: " + found.length + "\n");
  found.sort((a, c) => c.spread - a.spread).forEach((f) =>
    console.log("     " + String(f.spread + "px").padStart(6) + "  " + f.rel.padEnd(32) + "@" + String(f.w).padEnd(6) +
      f.sel.padEnd(28) + f.n + " cards h=" + f.h + "  " + f.labels));
  if (!found.length) console.log("     none");
})();
