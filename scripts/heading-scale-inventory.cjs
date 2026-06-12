#!/usr/bin/env node
/**
 * Heading-scale debt inventory + zero-pixel mapping analysis (PREMIUM-AUDIT-2026-06-11
 * "Noted but NOT actioned" item). Read-only by default; --rewrite applies the proven mapping.
 *
 * The cap (Assets/css/nav-global-fix-2026-05-27.css, LM-143/LM-154) forces on
 * `main h2[class*=text-5xl..text-9xl|text-huge]`:
 *   font-size clamp(1.9rem,1.2rem+2vw,2.75rem); weight 800; lh 1.15; ls -0.03em (all !important,
 *   re-declared in @layer base so it also beats !text-* utilities).
 * Canonical rewrite: on a PROVEN-capped h2, replace the dead size/weight/leading/tracking stack
 * with the single token `text-5xl` (keeps every [class*=...] selector match: cap R1/R2,
 * centring R5/R6/R7, justify-between R8) — parity conditions checked per occurrence below.
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const REWRITE = process.argv.includes("--rewrite");

// ---- collect 72 pages ----
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(ROOT, p).replace(/\\/g, "/");
    if (e.isDirectory()) {
      if (/^(node_modules|specs|scripts|test-results|\.git)$/.test(e.name)) continue;
      if (/_archive/.test(rel)) continue;
      walk(p, out);
    } else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}
const pages = walk(ROOT, []).sort();

const BIG = ["text-5xl", "text-6xl", "text-7xl", "text-8xl", "text-9xl", "text-huge"];
const bigRe = /text-(5xl|6xl|7xl|8xl|9xl|huge)/;
// font-size utility token (base part after stripping variant prefixes + leading !)
const sizeBase = /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|huge)$/;
const stripPrefix = (t) => t.replace(/^([a-z0-9-]+:)*/i, "").replace(/^!/, "");
const isBigToken = (t) => BIG.includes(stripPrefix(t));
const isSizeToken = (t) => sizeBase.test(stripPrefix(t));
const isLeading = (t) => /^leading-/.test(stripPrefix(t));
const isTracking = (t) => /^tracking-/.test(stripPrefix(t));
const isBlack = (t) => stripPrefix(t) === "font-black";

const results = [];
const perPage = {};
let rewrittenFiles = new Set();

for (const file of pages) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const html = fs.readFileSync(file, "utf8");
  if (!bigRe.test(html)) continue;
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const loadsNavFix = !!doc.querySelector('link[href*="nav-global-fix-2026-05-27.css"]');
  // inline <style> blocks defining rules keyed on the tokens?
  const inlineStyleHit = [...doc.querySelectorAll("style")].some((s) => bigRe.test(s.textContent));

  const els = [...doc.querySelectorAll("*")].filter(
    (el) => typeof el.className === "string" && bigRe.test(el.className)
  );
  if (!els.length) continue;
  perPage[rel] = els.length;

  const edits = []; // {oldAttr, newAttr}
  for (const el of els) {
    const cls = el.getAttribute("class");
    const tokens = cls.split(/\s+/).filter(Boolean);
    const tag = el.tagName.toLowerCase();
    const inMain = !!el.closest("main");
    const inSection = !!el.closest("section");
    const parent = el.parentElement;
    const rec = { page: rel, tag, class: cls, decision: "", reason: "" };
    results.push(rec);

    const leave = (why) => { rec.decision = "LEAVE"; rec.reason = why; };

    if (!loadsNavFix) { leave("page does not load nav-global-fix (cap absent; utilities live)"); continue; }
    if (inlineStyleHit) { leave("page has inline <style> mentioning size tokens; not provable"); continue; }
    if (tag !== "h2") { leave(`<${tag}> is not reached by the h2 cap`); continue; }
    if (!inMain) { leave("h2 outside <main>; cap selector main h2[...] does not reach it"); continue; }

    // All size tokens must be in the big (dead) set, else other [class*=text-3xl/4xl/xl] rules key on them
    const sizeTokens = tokens.filter(isSizeToken);
    if (!sizeTokens.every(isBigToken)) {
      leave(`mixed size tokens (${sizeTokens.join(" ")}); smaller tokens feed other selectors`);
      continue;
    }
    // Centring rules R5/R6/R7 only list text-xl..text-8xl. Replacement text-5xl always matches.
    // Parity requires original class string to contain one of text-5xl..text-8xl when in <section>.
    const has5to8 = /text-(5xl|6xl|7xl|8xl)/.test(cls);
    if (inSection && !has5to8) {
      leave("9xl/huge-only inside <section>: not centred today; text-5xl would add centring");
      continue;
    }
    // R8 justify-between wrapper rule lists text-3xl..text-6xl only.
    const parentJB =
      parent && parent.tagName === "DIV" &&
      /justify-between/.test(parent.getAttribute("class") || "") &&
      !!parent.closest("section");
    if (parentJB && !/text-(5xl|6xl)/.test(cls)) {
      leave("7xl/8xl-only h2 in section div[justify-between]: text-5xl would newly centre the row");
      continue;
    }
    // R4 stat rule keys on EXACT class .text-5xl with counter/#stats conditions.
    const alreadyExact = el.classList.contains("text-5xl");
    const gp = parent && parent.parentElement;
    const statHit =
      el.hasAttribute("data-counter-to") ||
      !!el.querySelector("[data-counter-to]") ||
      (parent && parent.tagName === "DIV" && gp && gp.classList.contains("grid") &&
        gp.closest("#stats") && gp.closest("#stats") !== gp);
    if (statHit && !alreadyExact) {
      leave("would newly match stat-number rule (.text-5xl counter/#stats)");
      continue;
    }

    // PROVEN: build canonical replacement
    const kept = tokens.filter(
      (t) => !isBigToken(t) && !isLeading(t) && !isTracking(t) && !isBlack(t)
    );
    // insert text-5xl at the position of the first removed size token for minimal diff
    const firstIdx = tokens.findIndex((t) => isBigToken(t));
    const before = tokens.slice(0, firstIdx).filter(
      (t) => !isBigToken(t) && !isLeading(t) && !isTracking(t) && !isBlack(t)
    );
    const after = kept.slice(before.length);
    const newCls = [...before, "text-5xl", ...after].join(" ");
    rec.decision = "REWRITE";
    rec.reason = `-> "${newCls}"`;
    edits.push({ oldAttr: `class="${cls}"`, newAttr: `class="${newCls}"` });
  }

  if (REWRITE && edits.length) {
    let out = html;
    for (const e of edits) {
      if (!out.includes(e.oldAttr)) {
        console.error(`ERROR: exact attr not found in ${rel}: ${e.oldAttr}`);
        process.exitCode = 1;
        continue;
      }
      out = out.split(e.oldAttr).join(e.newAttr);
    }
    if (out !== html) { fs.writeFileSync(file, out); rewrittenFiles.add(rel); }
  }
}

// ---- report ----
console.log(`Pages scanned: ${pages.length}`);
console.log(`Pages with big-size tokens: ${Object.keys(perPage).length}`);
console.log("\nCounts per page:");
for (const [p, n] of Object.entries(perPage)) console.log(`  ${String(n).padStart(3)}  ${p}`);
const rw = results.filter((r) => r.decision === "REWRITE");
const lv = results.filter((r) => r.decision === "LEAVE");
console.log(`\nTotal occurrences: ${results.length}  REWRITE: ${rw.length}  LEAVE: ${lv.length}`);
console.log("\n--- LEAVE detail ---");
for (const r of lv) console.log(`  ${r.page} <${r.tag} class="${r.class}">\n      reason: ${r.reason}`);
console.log("\n--- REWRITE detail ---");
for (const r of rw) console.log(`  ${r.page} <h2 class="${r.class}"> ${r.reason}`);
if (REWRITE) console.log(`\nFiles modified: ${[...rewrittenFiles].join(", ") || "(none)"}`);
fs.writeFileSync(path.join(__dirname, "heading-scale-inventory.json"), JSON.stringify(results, null, 2));
