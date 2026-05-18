import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT = path.resolve("debug-screenshots/sf39");
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const url = "http://localhost:8092/partners.html";
const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
console.log("status", resp.status());

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, "partners-top.png"), fullPage: false });

const probe = await page.evaluate(() => {
  const main = document.querySelector("main");
  if (!main) return { ok: false, reason: "no <main>" };
  const banner = main.querySelector(":scope > figure.page-abstract-banner");
  if (!banner) {
    const anywhere = document.querySelector("figure.page-abstract-banner");
    return {
      ok: false,
      reason: anywhere ? "banner exists but is NOT a direct child of <main>" : "no banner",
    };
  }
  const directChildren = Array.from(main.children);
  const bannerIdx = directChildren.indexOf(banner);
  const lastIdx = directChildren.length - 1;
  const sectionIdxs = directChildren
    .map((el, i) => (el.tagName === "SECTION" ? i : -1))
    .filter((i) => i >= 0);
  const maxSectionIdx = sectionIdxs.length ? Math.max(...sectionIdxs) : -1;
  return {
    ok: true,
    bannerIdx,
    lastIdx,
    isLast: bannerIdx === lastIdx,
    directChildrenCount: directChildren.length,
    maxSectionIdx,
    afterAllSections: bannerIdx > maxSectionIdx,
  };
});
console.log("probe", JSON.stringify(probe));

await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight - 900);
});
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(OUT, "partners-bottom.png"), fullPage: false });

const bv = await page.evaluate(() => {
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
console.log("bannerVisible", JSON.stringify(bv));

await browser.close();
