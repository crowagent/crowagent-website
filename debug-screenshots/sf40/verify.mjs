/* SF40 2026-05-18 — verify the page-abstract-banner removal on 6 pages,
   the banner retention on 3 pages, and the new .ca-footer-hairline strip
   on all 13 pages.

   For each cleared page (about, security, partners, pricing, faq, resources):
     1. Open at 1440x900
     2. Scroll to bottom and take screenshot
     3. DOM probe: confirm NO <figure class="page-abstract-banner"> exists
     4. DOM probe: confirm .ca-footer-hairline exists with height 6px and
        sits immediately before .ca-footer.

   For each retained page (404, demo, contact):
     1. Confirm <figure class="page-abstract-banner"> STILL exists
     2. Confirm .ca-footer-hairline ALSO exists above the footer.

   For each sitewide check (index, crowcyber, crowmark, pricing):
     1. Confirm .ca-footer-hairline exists above the footer.
*/
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT = path.resolve("debug-screenshots/sf40");
fs.mkdirSync(OUT, { recursive: true });

const clearedPages = [
  "about",
  "security",
  "partners",
  "pricing",
  "faq",
  "resources",
];
const retainedPages = ["404", "demo", "contact"];
const sitewidePages = ["index", "crowcyber", "crowmark"];

const baseUrl = "http://localhost:8092";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const results = [];

async function probe(p, expectBanner) {
  const url = `${baseUrl}/${p}.html`;
  const res = { page: p, url, expectBanner };
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
    res.httpStatus = resp ? resp.status() : null;

    // Wait for footer injection (Phase B of nav-inject.js)
    await page.waitForSelector(".ca-footer", { timeout: 8000 });
    await page.waitForTimeout(500);

    // DOM probe
    const probeResult = await page.evaluate(() => {
      const banner = document.querySelector("figure.page-abstract-banner");
      const hairline = document.querySelector(".ca-footer-hairline");
      const footer = document.querySelector(".ca-footer");
      let hairlineHeight = null;
      let hairlineBeforeFooter = false;
      if (hairline) {
        const rect = hairline.getBoundingClientRect();
        hairlineHeight = rect.height;
        // Confirm DOM order: hairline.nextElementSibling === footer OR
        // hairline appears earlier in DOM than footer.
        if (footer) {
          const pos = hairline.compareDocumentPosition(footer);
          // 0x04 = DOCUMENT_POSITION_FOLLOWING
          hairlineBeforeFooter = !!(pos & 0x04);
        }
      }
      return {
        bannerExists: !!banner,
        hairlineExists: !!hairline,
        hairlineHeight,
        hairlineBeforeFooter,
        footerExists: !!footer,
      };
    });
    res.probe = probeResult;

    // Scroll to bottom and screenshot
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const shotPath = path.join(OUT, `${p}-bottom.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    res.bottomPath = shotPath;

    // Pass/fail logic
    res.bannerOk = expectBanner ? probeResult.bannerExists : !probeResult.bannerExists;
    res.hairlineOk =
      probeResult.hairlineExists &&
      Math.abs(probeResult.hairlineHeight - 6) < 0.5 &&
      probeResult.hairlineBeforeFooter;
    res.ok = res.bannerOk && res.hairlineOk;
  } catch (e) {
    res.error = String(e);
    res.ok = false;
  }
  results.push(res);
  return res;
}

for (const p of clearedPages) await probe(p, /* expectBanner */ false);
for (const p of retainedPages) await probe(p, /* expectBanner */ true);
for (const p of sitewidePages) {
  // For sitewide pages, we don't enforce banner state; just confirm hairline.
  const url = `${baseUrl}/${p}.html`;
  const res = { page: p, url, sitewide: true };
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
    res.httpStatus = resp ? resp.status() : null;
    await page.waitForSelector(".ca-footer", { timeout: 8000 });
    await page.waitForTimeout(500);
    const probeResult = await page.evaluate(() => {
      const hairline = document.querySelector(".ca-footer-hairline");
      const footer = document.querySelector(".ca-footer");
      let hairlineHeight = null;
      let hairlineBeforeFooter = false;
      if (hairline) {
        const rect = hairline.getBoundingClientRect();
        hairlineHeight = rect.height;
        if (footer) {
          const pos = hairline.compareDocumentPosition(footer);
          hairlineBeforeFooter = !!(pos & 0x04);
        }
      }
      return {
        hairlineExists: !!hairline,
        hairlineHeight,
        hairlineBeforeFooter,
        footerExists: !!footer,
      };
    });
    res.probe = probeResult;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const shotPath = path.join(OUT, `${p}-bottom.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    res.bottomPath = shotPath;
    res.hairlineOk =
      probeResult.hairlineExists &&
      Math.abs(probeResult.hairlineHeight - 6) < 0.5 &&
      probeResult.hairlineBeforeFooter;
    res.ok = res.hairlineOk;
  } catch (e) {
    res.error = String(e);
    res.ok = false;
  }
  results.push(res);
}

await browser.close();

const summaryPath = path.join(OUT, "results.json");
fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

let pass = 0;
let fail = 0;
for (const r of results) {
  const status = r.ok ? "PASS" : "FAIL";
  if (r.ok) pass++;
  else fail++;
  console.log(`${status}  ${r.page}  banner=${r.probe?.bannerExists ?? "?"}  hairline=${r.probe?.hairlineExists ?? "?"}  h=${r.probe?.hairlineHeight ?? "?"}  before=${r.probe?.hairlineBeforeFooter ?? "?"}  ${r.error ?? ""}`);
}
console.log(`\n${pass}/${results.length} pages OK. ${fail} failed.`);
console.log(`Summary: ${summaryPath}`);
process.exit(fail === 0 ? 0 : 1);
