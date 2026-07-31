// Does every internal link on the site actually resolve to a page that exists?
//
// The third member of the dead-control family, after dead-button-audit and
// dead-input-audit. A link that 404s is the most visible quality failure a site can have and
// the cheapest to ship: rename a file, miss one cross-reference, and it is live.
//
// RESOLVED THE WAY CLOUDFLARE PAGES RESOLVES, NOT THE WAY http-server DOES. The site links
// to extensionless URLs (`/crowmark`, `/tools/ppn-002-calculator`) which Pages serves from
// `crowmark.html` and `tools/ppn-002-calculator/index.html`. Asking localhost for `/crowmark`
// returns 404, so a naive HTTP check would report almost every internal link on the site as
// broken. This resolves against the FILESYSTEM using the same candidate order Pages uses:
//     exact path -> path + ".html" -> path + "/index.html"
// and separately honours `_redirects`, because a link to a retired URL that is redirected is
// working, not broken.
//
// Anchors are checked too: a link to `/faq#billing` is only whole if `#billing` exists on the
// target page. That is a different failure from a missing page and is reported separately.
const fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", ".claude", "dist", "coverage", ".dev-tools", "stripe-sample", "Doc", "scripts", "specs", "docs", "tests"]);

const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(d, e.name)); }
    else if (e.name.endsWith(".html") && !/^google[0-9a-f]+\.html$/i.test(e.name))
      pages.push(path.relative(ROOT, path.join(d, e.name)).split(path.sep).join("/"));
  }
})(ROOT);

// _redirects: "from  to  status". Only the source column matters here.
const redirects = new Set();
try {
  fs.readFileSync(path.join(ROOT, "_redirects"), "utf8").split(/\r?\n/).forEach((line) => {
    const t = line.trim();
    if (!t || t[0] === "#") return;
    const from = t.split(/\s+/)[0];
    if (from) redirects.add(from.replace(/\/$/, "") || "/");
  });
} catch (e) { /* no _redirects is fine */ }

const exists = (p) => { try { return fs.statSync(path.join(ROOT, p)).isFile(); } catch (e) { return false; } };

// Returns the file that would serve this URL path, or null.
function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath).replace(/^\//, "");
  if (p === "" ) return exists("index.html") ? "index.html" : null;
  p = p.replace(/\/$/, "");
  const candidates = [p, p + ".html", p + "/index.html"];
  for (const c of candidates) if (exists(c)) return c;
  return null;
}

const idCache = {};
function idsOf(file) {
  if (idCache[file]) return idCache[file];
  let set = new Set();
  try {
    const html = fs.readFileSync(path.join(ROOT, file), "utf8");
    const re = /\sid\s*=\s*["']([^"']+)["']/g;
    let m; while ((m = re.exec(html)) !== null) set.add(m[1]);
    const re2 = /\sname\s*=\s*["']([^"']+)["']/g;
    while ((m = re2.exec(html)) !== null) set.add(m[1]);
  } catch (e) { /* unreadable target */ }
  idCache[file] = set;
  return set;
}

const brokenPages = [], brokenAnchors = [], empties = [];
let total = 0;

for (const rel of pages.sort()) {
  const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const re = /<a\b[^>]*\shref\s*=\s*["']([^"']*)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    if (!href) { empties.push(rel + '  href=""'); continue; }
    if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    if (href === "#") { empties.push(rel + '  href="#"'); continue; }
    total++;

    const hashAt = href.indexOf("#");
    const pathPart = hashAt === -1 ? href : href.slice(0, hashAt);
    const hash = hashAt === -1 ? "" : href.slice(hashAt + 1);

    // same-page anchor
    if (pathPart === "" ) {
      if (hash && !idsOf(rel).has(hash)) brokenAnchors.push(rel + "  #" + hash + "  (same page)");
      continue;
    }
    if (pathPart[0] !== "/") continue;                       // relative links are rare here
    const bare = pathPart.replace(/\?.*$/, "");
    if (redirects.has(bare.replace(/\/$/, "") || "/")) continue;   // redirected on purpose

    const file = resolveFile(bare);
    if (!file) { brokenPages.push(rel + "  ->  " + href); continue; }
    if (hash && !idsOf(file).has(hash)) brokenAnchors.push(rel + "  ->  " + href + "   (target " + file + " has no #" + hash + ")");
  }
}

console.log("  pages scanned: " + pages.length + "   internal links checked: " + total);
console.log("\n  LINKS TO A PAGE THAT DOES NOT EXIST: " + brokenPages.length);
[...new Set(brokenPages)].slice(0, 25).forEach((x) => console.log("     " + x));
if (!brokenPages.length) console.log("     none");

console.log("\n  LINKS TO AN ANCHOR THAT DOES NOT EXIST: " + brokenAnchors.length);
[...new Set(brokenAnchors)].slice(0, 25).forEach((x) => console.log("     " + x));
if (!brokenAnchors.length) console.log("     none");

console.log("\n  EMPTY / PLACEHOLDER HREFS: " + empties.length);
[...new Set(empties)].slice(0, 15).forEach((x) => console.log("     " + x));
if (!empties.length) console.log("     none");
