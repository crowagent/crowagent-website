// SF-32 lists probe. Captures fullPage screenshots at 1440x900 and prints
// computed-style audit for the first <li> of every main UL on terms + cookies.
import { chromium } from "playwright";

const PAGES = [
  { url: "http://localhost:8092/terms.html",   label: "terms" },
  { url: "http://localhost:8092/cookies.html", label: "cookies" },
];

const tag = process.argv[2] || "BEFORE";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

for (const p of PAGES) {
  await page.goto(p.url, { waitUntil: "networkidle" });
  // Let any auto-injected TOC/scroll-spy settle.
  await page.waitForTimeout(500);

  const out = `debug-screenshots/sf32-lists/${p.label}-${tag}.png`;
  await page.screenshot({ path: out, fullPage: true });
  console.log(`[${tag}] saved ${out}`);

  // Probe every UL inside main .legal-content that isn't a TOC.
  const data = await page.evaluate(() => {
    const lists = [...document.querySelectorAll(
      "main .legal-content ul, main ul"
    )].filter((ul) => {
      // Drop TOC + ULs that live inside the TOC subtree.
      if (ul.closest(".legal-toc")) return false;
      if (ul.classList.contains("legal-toc")) return false;
      return true;
    });
    return lists.map((ul, i) => {
      const li = ul.querySelector(":scope > li");
      if (!li) return { idx: i, note: "empty" };
      const cs = getComputedStyle(li);
      const csB = getComputedStyle(li, "::before");
      // Build a short selector chain for traceability.
      const chain = [];
      let n = ul;
      while (n && n !== document.body && chain.length < 4) {
        const cls = n.classList.length ? "." + [...n.classList].join(".") : "";
        chain.unshift(n.tagName.toLowerCase() + cls);
        n = n.parentElement;
      }
      return {
        idx: i,
        chain: chain.join(" > "),
        ulClass: ul.className || "(none)",
        liPaddingLeft: cs.paddingLeft,
        liListStyle: cs.listStyleType,
        beforeContent: csB.content,
        beforeBg: csB.backgroundColor,
        beforeBgImg: csB.backgroundImage.slice(0, 60),
        beforeLeft: csB.left,
        beforeTop: csB.top,
        beforeWidth: csB.width,
        beforeHeight: csB.height,
      };
    });
  });
  console.log(`\n=== ${p.label} (${tag}) ULs probed: ${data.length} ===`);
  for (const row of data) console.log(JSON.stringify(row));
  console.log("");
}

await browser.close();
