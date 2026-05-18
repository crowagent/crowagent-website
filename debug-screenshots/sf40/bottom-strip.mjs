/* SF40 bottom-strip — capture a tight crop of the last 320px of each page so
   the hairline + footer are clearly visible. Replaces the prior bottom-bottom
   screenshots that captured only the 900px viewport at scroll-end (which on
   some long pages doesn't reach the footer). */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT = path.resolve("debug-screenshots/sf40");
fs.mkdirSync(OUT, { recursive: true });
const baseUrl = "http://localhost:8092";

const pages = [
  "about", "security", "partners", "pricing", "faq", "resources",
  "404", "demo", "contact",
  "index", "crowcyber", "crowmark",
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

for (const p of pages) {
  const url = `${baseUrl}/${p}.html`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector(".ca-footer", { timeout: 10000 });
    await page.waitForTimeout(800);

    // Scroll the hairline into the centre of the viewport so the screenshot
    // captures it plus the top of the footer below it.
    const yOffset = await page.evaluate(async () => {
      const h = document.querySelector(".ca-footer-hairline");
      if (!h) return null;
      const rect = h.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - 200; // hairline at y=200 in viewport
      window.scrollTo({ top: targetY, behavior: "instant" });
      await new Promise(r => setTimeout(r, 200));
      return window.scrollY;
    });
    await page.waitForTimeout(800);
    const shotPath = path.join(OUT, `${p}-bottom.png`);
    await page.screenshot({
      path: shotPath,
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    console.log(`OK  ${p}  yOffset=${yOffset}  ${shotPath}`);
  } catch (e) {
    console.log(`FAIL  ${p}  ${e}`);
  }
}

await browser.close();
