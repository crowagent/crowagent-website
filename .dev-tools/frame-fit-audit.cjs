#!/usr/bin/env node
/**
 * frame-fit-audit — measures how a capture actually sits inside its frame.
 *
 * Two questions this answers that eyeballing a screenshot cannot:
 *
 *   1. Which part of the SOURCE image is on screen? With object-fit: cover the
 *      browser silently discards whatever does not fit, and the discarded band
 *      is a function of the box aspect, which changes at every breakpoint. The
 *      script resolves the used object-position, replays the cover maths and
 *      reports the visible source rectangle as fractions of the natural size.
 *      A crop anchor is only defensible once you can see what it keeps.
 *
 *   2. Is the image flush inside its frame? Every gap between the image's border
 *      box and the frame's padding box is reported per side, so a 3px drift on
 *      one edge is a number rather than an impression.
 *
 * Usage: node .dev-tools/frame-fit-audit.cjs [--shots] [--only=W x H]
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '..', 'node_modules', 'playwright'));

const BASE = 'http://localhost:8092';
const OUT = path.resolve(__dirname, '..', '.dev-tools', '_frame-shots');

const SIZES = [
  [375, 812], [768, 1024], [1024, 1366], [1366, 768],
  [1440, 900], [1920, 1080], [2560, 1440],
];

/* Resolved in the page: the cover/contain maths the browser does internally and
   does not expose. Returns the visible source rectangle in natural pixels. */
const PROBE = `(function () {
  function num(v, basis) {
    if (v.endsWith('%')) return parseFloat(v) / 100 * basis;
    return parseFloat(v);
  }
  function fitInfo(img) {
    var cs = getComputedStyle(img);
    var r = img.getBoundingClientRect();
    // Content box, since object-fit works inside padding, not the border box.
    // Taken from the fractional rect, not clientWidth/clientHeight: those are
    // rounded to integers, which fabricated a 0.3% aspect mismatch on a frame
    // that is in fact exact.
    var W = r.width - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth)
                    - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var H = r.height - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth)
                     - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var nw = img.naturalWidth, nh = img.naturalHeight;
    var of = cs.objectFit;
    var scale = of === 'cover' ? Math.max(W / nw, H / nh)
              : of === 'contain' ? Math.min(W / nw, H / nh)
              : of === 'none' ? 1
              : null; // fill => stretched, no single scale
    var pos = cs.objectPosition.split(' ');
    var out = {
      box: { w: +W.toFixed(2), h: +H.toFixed(2), aspect: +(W / H).toFixed(3) },
      rect: { x: +r.left.toFixed(2), y: +r.top.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) },
      natural: { w: nw, h: nh, aspect: +(nw / nh).toFixed(3) },
      objectFit: of, objectPosition: cs.objectPosition,
      complete: img.complete && nw > 0
    };
    if (of === 'fill') {
      out.distortion = +((W / H) / (nw / nh)).toFixed(3);
      return out;
    }
    var pw = nw * scale, ph = nh * scale;
    var freeX = W - pw, freeY = H - ph;
    var px = num(pos[0], freeX === 0 ? 1 : 1); // placeholder, replaced below
    // object-position percentage aligns the p% point of the image with the p%
    // point of the box, which reduces to offset = free * p for both fits.
    var fx = pos[0].endsWith('%') ? parseFloat(pos[0]) / 100 : null;
    var fy = pos[1].endsWith('%') ? parseFloat(pos[1]) / 100 : null;
    var offX = fx !== null ? freeX * fx : parseFloat(pos[0]);
    var offY = fy !== null ? freeY * fy : parseFloat(pos[1]);
    out.painted = { w: +pw.toFixed(2), h: +ph.toFixed(2), scale: +scale.toFixed(4) };
    out.overflow = { x: +(-freeX).toFixed(2), y: +(-freeY).toFixed(2) };
    // Visible slice of the SOURCE, as fractions of the natural size.
    var sx0 = Math.max(0, -offX / scale), sy0 = Math.max(0, -offY / scale);
    var sx1 = Math.min(nw, sx0 + W / scale), sy1 = Math.min(nh, sy0 + H / scale);
    out.visibleSrc = {
      x0: +(sx0 / nw).toFixed(4), x1: +(sx1 / nw).toFixed(4),
      y0: +(sy0 / nh).toFixed(4), y1: +(sy1 / nh).toFixed(4),
      keptW: +(((sx1 - sx0) / nw) * 100).toFixed(1),
      keptH: +(((sy1 - sy0) / nh) * 100).toFixed(1)
    };
    return out;
  }

  function insets(img, frame) {
    var i = img.getBoundingClientRect();
    var f = frame.getBoundingClientRect();
    var cs = getComputedStyle(frame);
    // Padding box of the frame: what the image is supposed to sit flush against.
    var pl = f.left + parseFloat(cs.borderLeftWidth);
    var pt = f.top + parseFloat(cs.borderTopWidth);
    var pr = f.right - parseFloat(cs.borderRightWidth);
    var pb = f.bottom - parseFloat(cs.borderBottomWidth);
    var ics = getComputedStyle(img);
    var outerR = parseFloat(cs.borderTopLeftRadius);
    var innerR = parseFloat(ics.borderTopLeftRadius);
    var insetTop = i.top - pt, insetSide = i.left - pl;
    return {
      left: +insetSide.toFixed(2),
      top: +insetTop.toFixed(2),
      right: +(pr - i.right).toFixed(2),
      bottom: +(pb - i.bottom).toFixed(2),
      framePad: cs.padding,
      // Concentric radii. The bezel's INNER curve has radius outer minus the
      // border, and the screen sits one padding inside that, so the screen's
      // radius must be outer - border - padding. An earlier version of this
      // check omitted the border and reported every correct frame as 1px out.
      radius: { outer: outerR, inner: innerR,
                wanted: +(outerR - parseFloat(cs.borderTopWidth) - insetSide).toFixed(2),
                err: +(innerR - (outerR - parseFloat(cs.borderTopWidth) - insetSide)).toFixed(2) },
      // How much of the capture the frame's own overflow:hidden throws away.
      clippedBottomPx: +Math.max(0, i.bottom - f.bottom).toFixed(2)
    };
  }

  var res = { s4: [], s6: [] };

  var VW = document.documentElement.clientWidth; // excludes a classic scrollbar

  [].slice.call(document.querySelectorAll('.oe-panel')).forEach(function (p, i) {
    var img = p.querySelector('img');
    if (!img) return;
    var wrap = document.querySelector('.oe-panelwrap');
    var wr = wrap.getBoundingClientRect(), pr = p.getBoundingClientRect();
    var ir = img.getBoundingClientRect();
    var fit = fitInfo(img);
    // The loss object-fit reports is only half the story. .oe-sec is
    // overflow:hidden, so anything past the viewport edge is thrown away too and
    // never shows up in a box measurement. This is the number that matters.
    var offRight = Math.max(0, ir.right - VW);
    var shownW = Math.max(0, Math.min(ir.right, VW) - Math.max(ir.left, 0));
    res.s4.push({
      i: i, src: img.getAttribute('src').split('/').pop(),
      on: p.classList.contains('is-on'),
      wrap: { w: +wr.width.toFixed(2), h: +wr.height.toFixed(2), aspect: +(wr.width / wr.height).toFixed(3) },
      wrapOvershoot: +(wr.right - VW).toFixed(2),
      panelPad: getComputedStyle(p).padding,
      washLeft: +(ir.left - pr.left).toFixed(2),
      washTop: +(ir.top - pr.top).toFixed(2),
      washBottom: +(pr.bottom - ir.bottom).toFixed(2),
      washRight: +(pr.right - ir.right).toFixed(2),
      clippedRightPx: +offRight.toFixed(2),
      // Share of the CAPTURE the reader can actually see: what object-fit kept,
      // multiplied by what survived the viewport clip.
      captureVisiblePct: +(((shownW / ir.width) * (fit.visibleSrc ? (fit.visibleSrc.x1 - fit.visibleSrc.x0) : 1)) * 100).toFixed(1),
      fit: fit
    });
  });

  [].slice.call(document.querySelectorAll('.dv-device')).forEach(function (d, i) {
    var img = d.querySelector('img');
    if (!img) return;
    var stage = d.closest('.dv-stage');
    var sr = stage.getBoundingClientRect(), dr = d.getBoundingClientRect();
    var scs = getComputedStyle(stage);
    res.s6.push({
      i: i, src: img.getAttribute('src').split('/').pop(),
      kind: d.classList.contains('dv-device--phone') ? 'phone' : 'tablet',
      stage: { w: +sr.width.toFixed(2), h: +sr.height.toFixed(2), pad: scs.padding },
      device: { w: +dr.width.toFixed(2), h: +dr.height.toFixed(2) },
      // Does the frame stay inside the stage?
      stageOverflow: {
        left: +(dr.left - (sr.left + parseFloat(scs.paddingLeft))).toFixed(2),
        right: +((sr.right - parseFloat(scs.paddingRight)) - dr.right).toFixed(2),
        top: +(dr.top - (sr.top + parseFloat(scs.paddingTop))).toFixed(2),
        bottom: +(sr.bottom - dr.bottom).toFixed(2)
      },
      inset: insets(img, d),
      fit: fitInfo(img)
    });
  });

  return res;
})()`;

(async () => {
  const wantShots = process.argv.includes('--shots');
  const onlyArg = (process.argv.find(a => a.startsWith('--only=')) || '').split('=')[1];
  const sizes = onlyArg ? SIZES.filter(s => s.join('x') === onlyArg) : SIZES;
  const label = (process.argv.find(a => a.startsWith('--label=')) || '').split('=')[1] || 'run';
  if (wantShots) fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const all = {};

  for (const [w, h] of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/.partials/preview-frames.html`, { waitUntil: 'load' });
    await page.waitForFunction('document.documentElement.dataset.pvReady === "1"', { timeout: 20000 });
    // Cross-fades and the rail's autoplay both need to settle before a rect is
    // worth reading; one long frame is not enough for a .8s transition.
    await page.waitForTimeout(1200);

    const res = await page.evaluate(PROBE);

    // Section height across all four stages. If the four panes do not all size
    // the grid row, the whole page below jumps every time the stage advances.
    res.secHeights = [];
    for (let t = 0; t < 4; t++) {
      await page.evaluate(n => {
        const tabs = document.querySelectorAll('.oe-tab');
        if (tabs[n]) tabs[n].click();
      }, t);
      await page.waitForTimeout(700);
      res.secHeights.push(await page.evaluate(
        () => +document.querySelector('.oe-sec').getBoundingClientRect().height.toFixed(2)));
    }
    res.secJump = +(Math.max(...res.secHeights) - Math.min(...res.secHeights)).toFixed(2);

    all[`${w}x${h}`] = res;

    if (wantShots) {
      const s4 = await page.$('.oe-panelwrap');
      if (s4) await s4.screenshot({ path: path.join(OUT, `${label}-s4-${w}x${h}.png`) });
      const s6 = await page.$('.dv-railwrap');
      if (s6) await s6.screenshot({ path: path.join(OUT, `${label}-s6-${w}x${h}.png`) });
    }
    await ctx.close();
  }
  await browser.close();

  fs.writeFileSync(path.join(__dirname, `_frame-fit-${label}.json`), JSON.stringify(all, null, 2));

  // Human-readable digest.
  for (const [size, r] of Object.entries(all)) {
    console.log(`\n=== ${size} ===   .oe-sec heights ${r.secHeights ? r.secHeights.join(' / ') : '-'}  JUMP ${r.secJump}px`);
    for (const p of r.s4) {
      const f = p.fit;
      if (!p.on) continue; // the three inactive panels carry the entry transform
      console.log(` S4 ${p.src.padEnd(28)} wrap ${p.wrap.w}x${p.wrap.h} (${p.wrap.aspect}) overshoot ${p.wrapOvershoot}`
        + ` | imgbox ${f.box.w}x${f.box.h} (${f.box.aspect}) ${f.objectFit} @ ${f.objectPosition}`
        + ` | fitKeepsW ${f.visibleSrc ? f.visibleSrc.keptW : '-'}%`
        + ` clippedRight ${p.clippedRightPx}px`
        + ` => CAPTURE VISIBLE ${p.captureVisiblePct}%`
        + ` | wash L${p.washLeft} T${p.washTop} R${p.washRight} B${p.washBottom}`);
    }
    for (const d of r.s6) {
      const f = d.fit;
      if (d.i > 1) continue; // one phone and one tablet is the whole geometry
      console.log(` S6 ${d.kind.padEnd(6)} ${d.src.padEnd(24)} stage ${d.stage.w}x${d.stage.h} dev ${d.device.w}x${d.device.h}`
        + ` | stageOverflow T${d.stageOverflow.top} L${d.stageOverflow.left} R${d.stageOverflow.right}`
        + ` | inset L${d.inset.left} T${d.inset.top} R${d.inset.right}`
        + ` | radius outer ${d.inset.radius.outer} inner ${d.inset.radius.inner} wanted ${d.inset.radius.wanted} ERR ${d.inset.radius.err}`
        + ` | box ${f.box.w.toFixed(1)}x${f.box.h.toFixed(1)} (${f.box.aspect}) nat ${f.natural.aspect}`
        + ` | clippedBottom ${d.inset.clippedBottomPx}px (${(100 * d.inset.clippedBottomPx / f.box.h).toFixed(1)}% of capture)`);
    }
  }
  console.log(`\nwrote _frame-fit-${label}.json`);
})();
