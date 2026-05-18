#!/usr/bin/env node
/*
 * M5 verification: load 5 routes, confirm h1 renders in
 * "Plus Jakarta Sans", no font-asset console 404s, and
 * document.fonts.size > 5.
 */
const { chromium } = require("playwright");

const ROUTES = [
  "/",
  "/pricing",
  "/about",
  "/blog/",
  "/tools/cyber-essentials-readiness/",
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  let allOk = true;
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("requestfailed", (req) => {
      failedRequests.push(`${req.failure()?.errorText} ${req.url()}`);
    });
    page.on("response", (res) => {
      const u = res.url();
      if (
        res.status() >= 400 &&
        (u.includes("/Assets/fonts/") || u.includes("fonts-selfhosted.css"))
      ) {
        failedRequests.push(`HTTP ${res.status()} ${u}`);
      }
    });
    const url = "http://localhost:8092" + route;
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
    if (!resp || !resp.ok()) {
      console.log(`  FAIL  ${route} -> HTTP ${resp?.status()}`);
      allOk = false;
      await page.close();
      continue;
    }
    // Allow @font-face faces to register
    await page.waitForTimeout(300);
    const result = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return {
        fontsSize: document.fonts ? document.fonts.size : 0,
        h1Family: h1 ? getComputedStyle(h1).fontFamily : null,
        h1Text: h1 ? h1.innerText.slice(0, 60) : null,
        hasSelfhostedLink: !!document.querySelector(
          'link[href*="fonts-selfhosted.css"]'
        ),
        hasPreloadFont: !!document.querySelector(
          'link[rel="preload"][href*="PlusJakartaSans-700.woff2"]'
        ),
        hasGoogleFontLink: !!document.querySelector(
          'link[href*="fonts.googleapis.com"]'
        ),
      };
    });
    const fontOk = result.h1Family && result.h1Family.includes("Plus Jakarta Sans");
    const sizeOk = result.fontsSize > 5;
    const linksOk =
      result.hasSelfhostedLink && result.hasPreloadFont && !result.hasGoogleFontLink;
    const fontErrors = failedRequests.length === 0;
    const ok = fontOk && sizeOk && linksOk && fontErrors;
    console.log(
      `  ${ok ? "PASS" : "FAIL"}  ${route}` +
        `  fonts.size=${result.fontsSize}` +
        `  h1=${JSON.stringify(result.h1Family)}` +
        `  selfhostedLink=${result.hasSelfhostedLink}` +
        `  preload=${result.hasPreloadFont}` +
        `  noGoogle=${!result.hasGoogleFontLink}` +
        `  fontReqErrors=${failedRequests.length}` +
        `  consoleErr=${consoleErrors.length}`
    );
    if (!ok) {
      allOk = false;
      if (failedRequests.length)
        console.log("     failed:", failedRequests.slice(0, 5));
      if (consoleErrors.length)
        console.log("     console:", consoleErrors.slice(0, 5));
    }
    await page.close();
  }
  await browser.close();
  process.exit(allOk ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(2);
});
