// axe a11y pass over one page at four widths.
//
// Four widths because the site's layout defects have historically been
// width-specific: a table that hides half its columns at 390 passes cleanly at 1440.
//   node .dev-tools/axe-one.cjs <url-path>
const { chromium } = require("../node_modules/playwright");
const { AxeBuilder } = require("../node_modules/@axe-core/playwright");

const REL = process.argv[2] || "/index.html";
const WIDTHS = [390, 768, 1040, 1440];

(async () => {
  const browser = await chromium.launch();
  let total = 0;
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: "dark" });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem("ca_consent", JSON.stringify({ analytics: true, marketing: true, ts: 1 }));
        localStorage.setItem("cookieConsent", "accepted");
      } catch (e) { /* storage blocked; banner may add its own nodes to the scan */ }
    });
    const page = await ctx.newPage();
    await page.goto("http://localhost:8092" + REL, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(900);
    const res = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const v = res.violations;
    total += v.length;
    console.log(`\n--- ${w}px: ${v.length} violation type(s) ---`);
    for (const x of v) {
      console.log(`  [${x.impact}] ${x.id}: ${x.help} (${x.nodes.length} node(s))`);
      for (const n of x.nodes.slice(0, 3)) console.log(`      ${n.target.join(" ")}`);
    }
    await ctx.close();
  }
  console.log(`\nTOTAL violation types across widths: ${total}`);
  await browser.close();
  process.exit(total ? 1 : 0);
})();
