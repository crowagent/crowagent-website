/* SF40 retry — partners (networkidle timeout) + contact (already has illustration,
   not figure.page-abstract-banner; verify hairline only). */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT = path.resolve("debug-screenshots/sf40");
fs.mkdirSync(OUT, { recursive: true });
const baseUrl = "http://localhost:8092";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const results = [];
const pagesToCheck = ["partners", "contact"];

for (const p of pagesToCheck) {
  const url = `${baseUrl}/${p}.html`;
  const res = { page: p, url };
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    res.httpStatus = resp ? resp.status() : null;
    await page.waitForSelector(".ca-footer", { timeout: 10000 });
    await page.waitForTimeout(800);

    const probeResult = await page.evaluate(() => {
      const banner = document.querySelector("figure.page-abstract-banner");
      const hairline = document.querySelector(".ca-footer-hairline");
      const footer = document.querySelector(".ca-footer");
      let hairlineHeight = null;
      let hairlineBeforeFooter = false;
      let hairlineIsImmediateSibling = false;
      if (hairline) {
        const rect = hairline.getBoundingClientRect();
        hairlineHeight = rect.height;
        if (footer) {
          const pos = hairline.compareDocumentPosition(footer);
          hairlineBeforeFooter = !!(pos & 0x04);
          hairlineIsImmediateSibling = hairline.nextElementSibling === footer;
        }
      }
      return {
        bannerExists: !!banner,
        hairlineExists: !!hairline,
        hairlineHeight,
        hairlineBeforeFooter,
        hairlineIsImmediateSibling,
        footerExists: !!footer,
      };
    });
    res.probe = probeResult;

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const shotPath = path.join(OUT, `${p}-bottom.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    res.bottomPath = shotPath;
    res.ok =
      probeResult.hairlineExists &&
      Math.abs(probeResult.hairlineHeight - 6) < 0.5 &&
      probeResult.hairlineBeforeFooter;
  } catch (e) {
    res.error = String(e);
    res.ok = false;
  }
  results.push(res);
  const probe = res.probe || {};
  console.log(`${res.ok ? "PASS" : "FAIL"}  ${res.page}  banner=${probe.bannerExists ?? "?"}  hairline=${probe.hairlineExists ?? "?"}  h=${probe.hairlineHeight ?? "?"}  before=${probe.hairlineBeforeFooter ?? "?"}  immediateSibling=${probe.hairlineIsImmediateSibling ?? "?"}  ${res.error ?? ""}`);
}

await browser.close();
fs.writeFileSync(path.join(OUT, "retry-results.json"), JSON.stringify(results, null, 2));
