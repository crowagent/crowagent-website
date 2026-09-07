/**
 * check-device-frames.js — a desktop browser frame may only ever hold a
 * landscape screen.
 *
 * ── THE REPORT THIS EXISTS FOR ──────────────────────────────────────────────
 *
 * Owner, 2026-08-31, for the second time: *"i can again see the issue you are
 * repeating for carousels where mobile screens shots are being used in
 * Workstation tour, why the fuck you do this? you must make this hard rule and
 * correct"*.
 *
 * `ui/Carousel.astro` draws a browser: three traffic lights and the address
 * `app.crowagent.ai`. Into that frame, `/crowmark` and `/crowmark-buyers` were
 * each putting two 780x1688 PORTRAIT phone renders. A phone screen inside a Mac
 * browser window is wrong by definition, at any size, however well it is
 * fitted, and no amount of `object-fit` makes it right.
 *
 * ── AND THE FIRST ATTEMPT AT THIS FIXED THE WRONG THING ─────────────────────
 *
 * On 2026-08-31 an earlier pass found that `object-fit: contain` had never run
 * above 767px in `WorkstationTour.astro`, so three of six slides were being
 * cropped and the phone render was showing its top eleven per cent. That was a
 * true finding and a real repair, and it left this defect exactly where it was:
 * the asset is still a phone. **Making a wrong asset display tidily is not
 * fixing it**, and this gate exists because that distinction is easy to lose.
 *
 * ── WHAT IS ASSERTED, AND WHY EACH INSTRUMENT ───────────────────────────────
 *
 * WHICH IMAGES ARE INSIDE A CHROME FRAME IS READ FROM THE LIVE DOM. Not from a
 * class in the source, not from a component name, and not from a filename: a
 * page can carry the frame in one component and the picture in another, and a
 * text scan of either would answer about the file rather than about the page.
 * The browser is asked which images are descendants of an element that draws
 * the chrome, which is the only question that matches what a reader sees.
 *
 * WHETHER AN IMAGE IS PORTRAIT IS READ FROM THE FILE'S OWN BYTES. Not from the
 * `width` and `height` attributes, which are a registry's claim about a
 * drawing; not from `aspect-ratio` or any other computed property, which is a
 * CSS author's intention; and not from a name like `-mobile`, which is a
 * convention nobody is obliged to follow. **Both of those can be right while
 * the picture is wrong**, which is the whole lesson of the report above. The
 * intrinsic size comes out of the PNG or JPEG header of the file the src names.
 *
 * AN UNMEASURABLE FILE IS A FAILURE, NEVER A SKIP. A missing file, a format
 * this script has no reader for, or a header that does not parse all fail. A
 * gate that quietly passes over what it cannot read is a gate that reports
 * green for the one case nobody has thought about, and this repository has
 * found that shape more than once.
 *
 * FLOORS, BECAUSE ZERO SATISFIES EVERY RULE ABOVE. If no route carries a chrome
 * frame, or no image is measured inside one, this fails on the floor rather
 * than printing a clean run. The corpus is also DISCOVERED rather than listed:
 * every built route is considered, so a new page carrying the frame is covered
 * the day it ships and not the day somebody remembers to add it here.
 *
 * WHAT WAS CONSIDERED AND LEFT OUT. `components/blog/PostImage.astro` draws
 * `.pi__frame`, which is a picture frame rather than a device: it carries no
 * chrome, no address and no fixed ratio, and the photographs inside it are
 * legitimately any orientation. `.ps__frame` in sections/ProductScreens.astro
 * is a positioning wrapper whose contents are `.pcar__frame`, so it is already
 * covered through that. Both were checked rather than assumed.
 *
 * WHAT IS DELIBERATELY NOT IN SCOPE. A portrait render presented AS a phone is
 * correct and common: `/partners` shows `sup-8-action-centre` in a
 * portrait-shaped card with no browser around it, and that is the honest way to
 * show a phone. This gate is about one specific lie, which is a phone screen
 * dressed as a desktop one.
 *
 * Exit 0 clean, 1 on any failure. Reads dist/, so build first.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

/*
 * ── THE DESKTOP SURFACES, AND THERE ARE TWO OF THEM ────────────────────────
 *
 * THE FIRST DRAFT OF THIS GATE NAMED ONLY THE CHROME BAR, AND IT WOULD NOT
 * HAVE CAUGHT THE THING THE OWNER REPORTED. Run that way it failed four times,
 * twice on /crowmark and twice on /crowmark-buyers, and reported the homepage
 * clean. The homepage is where the Workstation tour is, and the tour is what
 * the owner was looking at. Its stage draws no address bar, so a gate keyed on
 * the address bar walked straight past a portrait phone render sitting in a
 * 16/10 desktop bezel. A control that reaches everything except the reported
 * defect is the signature failure this repository keeps finding, and it was
 * one selector away from shipping again.
 *
 * SO THE MARKER IS "A FRAME THAT PRESENTS A SCREEN AS A DESKTOP", of which
 * this site draws two. Each is named with the reason it qualifies, and each
 * must MATCH SOMETHING in the build: a selector that has quietly stopped
 * matching is reported as a violation rather than counted as a clean pass,
 * because a stale exclusion is silent where a stale inclusion is loud.
 *
 * THE ELEMENT NAMED IS THE FRAME ITSELF rather than the component that owns
 * it, so a second surface built anywhere else is covered the moment it reuses
 * the recipe. A genuinely new frame is added here, and the addition is the
 * decision to have a third one.
 */
const FRAMES = [
  {
    sel: '.pcar__frame',
    why: 'ui/Carousel.astro draws a browser: three traffic lights and the address app.crowagent.ai',
  },
  {
    sel: '.h2st__frame',
    why: 'home2/Story2.astro pins a desktop app frame and cross-fades five screens inside it',
  },
];

/* The floors. What the site renders today, stated as a minimum so a build that
   stops rendering the frames at all cannot report a clean run. */
const FLOOR = { routes: 3, images: 16 };

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.json': 'application/json',
};

/* ── THE INTRINSIC SIZE, OUT OF THE FILE ───────────────────────────────────
 *
 * PNG and JPEG only, and that is a decision rather than a gap. Those are the
 * two formats an `<img src>` on this site ever names: AVIF and WebP arrive
 * through `<source srcset>` as derivatives of the same master at the same
 * ratio. Anything else returns null, and null is a FAILURE below rather than a
 * pass, so the narrowness of this reader can never become a hole.
 */
function intrinsic(file) {
  const b = fs.readFileSync(file);

  /* PNG: the eight-byte signature, then IHDR at 16 and 20. */
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47 && b.readUInt32BE(4) === 0x0d0a1a0a) {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), how: 'PNG IHDR' };
  }

  /* JPEG: walk the segment chain to a start-of-frame, which is the only place
     the dimensions live. C4, C8 and CC are tables rather than frames. */
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5), how: `JPEG SOF${marker - 0xc0}` };
      }
      i += 2 + len;
    }
  }

  return null;
}

/* ── THE CORPUS: every built route, discovered ─────────────────────────────── */
function routes(dir = DIST, prefix = '/') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === '_assets' || entry.name === 'Assets' || entry.name.startsWith('.')) continue;
      out.push(...routes(path.join(dir, entry.name), `${prefix}${entry.name}/`));
    } else if (entry.name === 'index.html') {
      out.push(prefix);
    }
  }
  return out;
}

const ALL = routes().sort();
if (!ALL.length) {
  console.error('device-frames: dist/ holds no built route. Build first.');
  process.exit(1);
}

/*
 * PRE-FILTERED BY A TEXT SCAN, ASSERTED IN THE DOM. The scan only decides which
 * of the 46 routes are worth opening a page on, so a false negative here would
 * cost a route rather than hide a defect: the marker is server-rendered, and if
 * that ever stops being true the floor below is what reports it.
 */
const CLASSES = FRAMES.map((f) => f.sel.replace(/^\./, ''));
const CANDIDATES = ALL.filter((r) => {
  const html = fs.readFileSync(path.join(DIST, r.slice(1), 'index.html'), 'utf8');
  return CLASSES.some((c) => html.includes(c));
});

const server = http.createServer((req, res) => {
  let f = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  return fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const violations = [];
let routesWithFrame = 0;
let imagesMeasured = 0;
/** How many times each declared frame selector matched. A zero is a violation. */
const matched = new Map(FRAMES.map((f) => [f.sel, 0]));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log('\n' + '='.repeat(100));
console.log('DEVICE FRAMES — a frame that presents a screen as a desktop holds a landscape screen');
console.log('='.repeat(100));
console.log(`  ${ALL.length} built route(s), ${CANDIDATES.length} carrying one of ${FRAMES.length} desktop frame(s)`);
for (const f of FRAMES) console.log(`    ${f.sel}  ${f.why}`);
console.log('');

for (const route of CANDIDATES) {
  await page.goto(base + route, { waitUntil: 'domcontentloaded' });

  /*
   * EVERY <img> UNDER A DECLARED FRAME. `getAttribute('src')` rather than
   * `currentSrc`, because the master is the file every derivative inherits its
   * ratio from and it is present whether or not a lazy slide has been decoded.
   * A `currentSrc` on an undecoded slide is the empty string, which would have
   * turned four defects into four skips.
   */
  const found = await page.evaluate((frames) => {
    const out = [];
    for (const f of frames) {
      for (const frame of document.querySelectorAll(f.sel)) {
        for (const img of frame.querySelectorAll('img')) {
          out.push({ sel: f.sel, src: img.getAttribute('src') || '' });
        }
      }
    }
    return out;
  }, FRAMES);

  if (!found.length) continue;
  routesWithFrame += 1;
  console.log(`  ${route}  ${found.length} image(s) inside a desktop frame`);

  for (const img of found) {
    matched.set(img.sel, matched.get(img.sel) + 1);
    const rel = decodeURIComponent(img.src.split('?')[0]).replace(/^\//, '');
    const file = path.join(DIST, rel);
    const label = `${route}  ${img.sel}  ${rel.split('/').pop() || '(no src)'}`;

    if (!img.src || !fs.existsSync(file)) {
      violations.push(
        `${label} — a desktop frame holds an image this gate cannot measure: "${img.src}" is not a file in dist/. An unmeasured image is a failure, never a skip`,
      );
      console.log(`    FAIL  ${label}  no such file`);
      continue;
    }

    const size = intrinsic(file);
    if (!size) {
      violations.push(
        `${label} — a desktop frame holds an image this gate cannot measure: no reader for its format, or its header does not parse. An unmeasured image is a failure, never a skip`,
      );
      console.log(`    FAIL  ${label}  unreadable`);
      continue;
    }

    imagesMeasured += 1;
    const portrait = size.h > size.w;
    console.log(
      `    ${portrait ? 'FAIL' : 'ok  '}  ${label}  ${size.w}x${size.h} (${(size.w / size.h).toFixed(3)}) via ${size.how}`,
    );
    if (portrait) {
      violations.push(
        `${label} — ${size.w}x${size.h} is PORTRAIT and it is drawn inside a frame that presents a screen as a desktop. A phone screen in a desktop window is wrong at any size, however well it is fitted. Show a landscape capture of this screen, or do not show the slide`,
      );
    }
  }
}

await browser.close();
server.close();

/* ── THE FLOORS ─────────────────────────────────────────────────────────────
   Every assertion above is satisfied by there being nothing to assert it on,
   and a selector that has stopped matching is the quietest way to get there. */
for (const f of FRAMES) {
  if (matched.get(f.sel) === 0) {
    violations.push(
      `stale — ${f.sel} matched no image on any of ${ALL.length} routes. It is declared as a desktop frame here and this gate is measuring nothing through it. Either the frame is gone, in which case delete the entry, or it has been renamed, in which case this gate has been blind since the rename`,
    );
  }
}
if (routesWithFrame < FLOOR.routes) {
  violations.push(
    `floor — ${routesWithFrame} route(s) render a desktop frame, and every rule above passes trivially below that. Needs at least ${FLOOR.routes}`,
  );
}
if (imagesMeasured < FLOOR.images) {
  violations.push(
    `floor — ${imagesMeasured} image(s) measured inside a desktop frame. Needs at least ${FLOOR.images}`,
  );
}

console.log(
  `\n  ${routesWithFrame} route(s) with a desktop frame, ${imagesMeasured} image(s) measured from their own bytes`,
);
for (const f of FRAMES) console.log(`    ${f.sel}  ${matched.get(f.sel)} image(s)`);

if (violations.length) {
  console.error(`\ndevice-frames: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  - ${v}`);
  console.error('');
  process.exit(1);
}

console.log('\ndevice-frames: clean\n');
