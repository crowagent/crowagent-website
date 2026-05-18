/* SF39 2026-05-18 — verify .page-abstract-banner is now bottom-of-main on 8 pages.
   For each page:
     1. Open at 1440x900
     2. Top screenshot (banner should be absent)
     3. Scroll to bottom (scrollTop = scrollHeight - 900) and take bottom screenshot
     4. DOM probe: confirm <figure class="page-abstract-banner"> is the LAST element child of <main>
        (or at minimum appears after every <section> inside <main>).
*/
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT = path.resolve("debug-screenshots/sf39");
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  "about",
  "security",
  "partners",
  "pricing",
  "faq",
  "resources",
  "404",
  "demo",
];

const baseUrl = "http://localhost:8092";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const results = [];

for (const p of pages) {
  const url = `${baseUrl}/${p}.html`;
  const res = { page: p, url };
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
    res.httpStatus = resp ? resp.status() : null;

    // Top screenshot
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const topPath = path.join(OUT, `${p}-top.png`);
    await page.screenshot({ path: topPath, fullPage: false });
    res.topPath = topPath;

    // DOM probe BEFORE scrolling
    const probe = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return { ok: false, reason: "no <main>" };
      const banner = main.querySelector(":scope > figure.page-abstract-banner");
      if (!banner) {
        // Also check deeper
        const anywhere = document.querySelector("figure.page-abstract-banner");
        return {
          ok: false,
          reason: anywhere ? "banner exists but is NOT a direct child of <main>" : "no banner",
        };
      }
      const directChildren = Array.from(main.children);
      const bannerIdx = directChildren.indexOf(banner);
      const lastIdx = directChildren.length - 1;
      // Section indices
      const sectionIdxs = directChildren
        .map((el, i) => (el.tagName === "SECTION" ? i : -1))
        .filter((i) => i >= 0);
      const maxSectionIdx = sectionIdxs.length ? Math.max(...sectionIdxs) : -1;
      // Find any "non-trivial" non-script element after banner
      const afterBanner = directChildren.slice(bannerIdx + 1).filter((el) => {
        const t = el.tagName;
        if (t === "SCRIPT" || t === "DIV") return false;
        return true;
      });
      return {
        ok: true,
        bannerIdx,
        lastIdx,
        isLast: bannerIdx === lastIdx,
        directChildrenCount: directChildren.length,
        afterBanner: afterBanner.map((el) => el.tagName + (el.id ? "#" + el.id : "")),
        maxSectionIdx,
        afterAllSections: bannerIdx > maxSectionIdx,
      };
    });
    res.probe = probe;

    // Scroll to bottom and bottom screenshot
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight - 900);
    });
    await page.waitForTimeout(600);
    const bottomPath = path.join(OUT, `${p}-bottom.png`);
    await page.screenshot({ path: bottomPath, fullPage: false });
    res.bottomPath = bottomPath;

    // Check banner is visible at bottom
    const bannerVisible = await page.evaluate(() => {
      const b = document.querySelector("figure.page-abstract-banner");
      if (!b) return { found: false };
      const r = b.getBoundingClientRect();
      return {
        found: true,
        top: r.top,
        bottom: r.bottom,
        height: r.height,
        inViewport: r.top < window.innerHeight && r.bottom > 0,
        viewportHeight: window.innerHeight,
      };
    });
    res.bannerVisible = bannerVisible;
  } catch (err) {
    res.error = String(err);
  }
  results.push(res);
  console.log(JSON.stringify(res, null, 2));
}

fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));

await browser.close();
console.log("\nDONE — wrote results.json + 16 screenshots to", OUT);
