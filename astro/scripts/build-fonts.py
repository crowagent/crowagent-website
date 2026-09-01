"""build-fonts.py - the recipe that produced the woff2 files in Assets/fonts/.

RUN BY HAND, NEVER BY THE BUILD. It needs Python and fontTools, which are not
dependencies of this site, and its output is committed bytes rather than a build
artefact. It is here so the derivation is reproducible and auditable instead of
being a thing somebody once did on a laptop. The guard that keeps the result
honest is scripts/check-font-coverage.js, which DOES run in the gate chain.

    py -m venv .fontvenv
    .fontvenv/Scripts/python -m pip install "fonttools[woff]"
    .fontvenv/Scripts/python astro/scripts/build-fonts.py

IT IS IDEMPOTENT, BUT ONLY BECAUSE IT IS MADE SO. Re-subsetting to a charset a
file already carries and re-dropping features it no longer has are both fixed
points. RE-CLIPPING AN AXIS IS NOT: measured, running the instancer a second time
on the already clipped faces added 68 bytes to Inter and 116 to JetBrains Mono,
because the rebuilt avar and STAT tables do not round-trip. So the axis step is
skipped when the file's own fvar already reads the target range, and with that
test in place a second run reproduces the first run's bytes exactly.

It is idempotent, and it is NOT byte reproducible from the upstream file. See the
note on run() below: the instancer returns a slightly different size on every
invocation, so two people starting from pristine Inter get two different files
that carry identical coverage, identical axes and identical outlines.


WHY THIS EXISTS, AND WHAT THE MEASUREMENT ACTUALLY SAID
=======================================================

The home page critical path measured 104.0 KB brotli on 2026-08-31, of which the
two preloaded woff2 were 59.1 KB, 57 percent of everything blocking first paint.
The obvious diagnosis was that the fonts were not subset. That diagnosis was
WRONG and it is worth recording why, because it would have sent the work at the
charset and found almost nothing there.

MEASURED, per file, before any change:

    file                        bytes   cmap codepoints   fvar wght axis
    Inter-var.woff2            48,256   230              100 to 900
    JetBrainsMono-var.woff2    31,432   229              400 to 800
    PlusJakartaSans-600.woff2  12,188   229              static
    PlusJakartaSans-700.woff2  12,244   229              static
    PlusJakartaSans-800.woff2  11,896   229              static

Every one of them was ALREADY character-subset, to the Google and Fontsource
`latin` set, which is what scripts/fetch-self-host-fonts.js at the repository
root fetched them from. 230 codepoints is not an unsubset font. The site's own
built output uses 114 distinct printable codepoints across 45 routes, so the
files already carry roughly twice what the site paints, which is the right kind
of margin for a site whose blog and glossary are authored in Markdown.

THE FAT WAS SOMEWHERE ELSE. Reading the table directory rather than the charset:

    Inter-var.woff2, decompressed table sizes
        GPOS    39,236   33.2 percent   kern, mark, mkmk
        gvar    36,414   30.8 percent   variable deltas across a 100 to 900 axis
        glyf    20,628   17.5 percent
        GSUB    10,992    9.3 percent   calt ccmp dnom frac locl numr pnum tnum
        post     4,228    3.6 percent   glyph names, of no use to a browser

Inter declared, and carried, a 100 to 900 weight axis. MEASURED in Chromium over
all 45 routes, resolving the computed family and weight per text node and
weighting by characters, the site paints Inter at 400, 500, 600, 700 and 800 and
at nothing else: 375,621 characters at 400, then 1,619, 12,875, 10,146 and 6,037.
So 200 of the 800 declared units were paid for on every page load and reached by
no character on the site. JetBrains Mono declared 400 to 800 and is painted at
400, 500 and 700 only.

THE AXIS IS THE LEVER, and it costs no glyph and no character:

    Inter-var.woff2         48,256 -> 32,772   axis clipped to 400:800, features trimmed
    JetBrainsMono-var.woff2 31,432 -> 28,728   axis clipped to 400:700, features trimmed
    PlusJakartaSans-600       12,188 -> 10,976   static, features trimmed only
    PlusJakartaSans-700       12,244 -> 11,044   static, features trimmed only
    PlusJakartaSans-800       11,896 -> 10,756   static, features trimmed only
    TOTAL                    116,016 -> 94,276   down 18.7 percent

The two PRELOADED faces, which are the only ones on the critical path, go from
60,500 to 43,816 bytes, down 16,684 bytes or 27.6 percent.

CLIPPING IS LOSSLESS INSIDE THE KEPT RANGE, AND THAT WAS PROVED RATHER THAN
ASSUMED. Both fonts were instantiated at every weight the site paints, from the
original and from the clipped file, and compared glyph by glyph on hmtx advance
and on drawn outline coordinates. Worst case across 518 Inter glyphs at 400, 500,
600, 700 and 800: ONE font unit of advance out of 2048, which is 0.049 percent of
an em, and the same order on outline coordinates. Weighted by the site's own
character frequency the width ratio of clipped to original is 1.000000 at 400,
1.000004 at 500, 0.999841 at 600, 1.000091 at 700 and 1.000000 at 800, so the
worst real line of text moves by 0.016 percent, about a tenth of a pixel over a
700 pixel measure. THE CONTROL CAME OUT NEGATIVE where it had to: at 100 and 900,
which the clip deliberately removes, 441 of 518 glyphs differ. A comparison that
cannot fail is not a comparison, and this one fails exactly where it should.

A SPLIT INTO A CORE FACE AND A unicode-range GATED EXTRAS FACE WAS MEASURED AND
REJECTED. Moving the accented Latin letters out of the preloaded file would have
taken Inter from 32,908 to 30,664 bytes on the charset measured at the time, a
saving of about 2.2 KB, at the cost of a second face, a second request on any
page carrying an accented name, and a
combining mark that could straddle two files. The accented letters are composite
glyphs referencing components that stay behind, so they are cheap to keep. Two
kilobytes does not buy that complexity, and the negative result is recorded here
so nobody re-derives it.


THE FEATURES, AND WHY EACH ONE IS KEPT OR DROPPED
=================================================

KEPT EVERYWHERE
    kern   GPOS pair kerning. On by default in every browser through
           font-kerning: auto, and it applies to the 89.65 percent of this
           site's characters that are Inter. Dropping it would have taken Inter
           to 27,708 bytes. Not taken: 5,064 bytes bought by a typographic
           regression on almost every word on the site is a bad trade.
           calt costs 3,920 bytes on Inter and is kept for the same reason.
    ccmp   glyph composition and decomposition, which is what makes a base
           letter plus a combining mark render as one accented letter.
    locl   localised forms.
    calt   contextual alternates. In JetBrains Mono this is also the coding
           ligature machinery.
    mark   mark to base positioning, and mkmk mark to mark, kept on Inter for
           the same reason the combining marks are kept in the charset: the site
           uses none today, and a page that grows one must not position it
           wrongly. Costs 1.9 KB on Inter.
    liga   standard ligatures, on Plus Jakarta Sans, which is the only one of
           the three families that has the feature. Standard ligatures are on by
           default in CSS, so dropping this would silently change fi and fl.
    tnum   tabular figures. MEASURED as used: font-variant-numeric declares
           tabular-nums in seven places in the built CSS, and the statutory
           figures depend on it lining up.
    pnum   proportional figures, the counterpart of tnum, kept for 116 bytes so
           that adding font-variant-numeric: proportional-nums later cannot
           become a silent no-op.

DROPPED
    frac, numr, dnom   fraction, numerator and denominator forms. MEASURED as
           unrequested: there is no font-feature-settings anywhere in the built
           output, and the only font-variant-numeric values present are
           tabular-nums, slashed-zero and lining-nums. Note that slashed-zero
           and lining-nums are ALREADY no-ops on these files, because none of
           the three families carries a `zero` or an `lnum` feature. That is a
           separate finding and is not fixed here.
    glyph names in `post`. A browser addresses glyphs by index, never by name.
           pyftsubset drops them by default and that default is taken.

A NOTE ON JETBRAINS MONO AND `calt`. Dropping it would take the file from 28,728
to 14,396 bytes, which is the single largest remaining saving on this site's font
payload. It is NOT taken here, and it is not the author's call to take: `calt`
is what renders // and __ as ligatures, both of which MEASURED as present in
mono text on this site, so removing it is a visible change to the page and
belongs to the owner. JetBrains Mono is also not preloaded, so none of those
14,332 bytes block first paint. Recorded as an owner decision, with its number
attached, rather than taken quietly.


THE CHARSET, WHICH IS DELIBERATELY NOT MINIMAL
==============================================

KEEP is the Google and Fontsource `latin` subset range, verbatim, which is the
range these files were cut to upstream. It is not a range invented here, which
matters: an invented range is a judgement, and a named external one can be
checked. The site paints 114 codepoints and this keeps about 230, so roughly
half of it is margin, on purpose. Blog and glossary content is authored in
Markdown, so tomorrow's copy can contain a character no page contains today, and
a missing glyph on a live marketing site is a visible defect that appears in
content nobody has written yet.

The house style bans em and en dashes in user facing PROSE, and U+2013 is kept
anyway, because a dash inside a numeric range is correct typography and the
built /pricing page carries three of them.

Every character the site currently paints and NO face on this site carries:
U+2192 rightwards arrow (78 occurrences over 20 routes), U+2318 place of
interest sign (92 occurrences over all 46 routes, the command palette hint),
U+2713 check mark (21), U+2264, U+2265, U+2A7D and U+25D4. Those already fall
back to a system face and always did. That is a pre-existing finding, not
something this change introduces, and check-font-coverage.js reports them as
information rather than failing on them.
"""

import os
import subprocess
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

FONTS = Path(__file__).resolve().parent.parent.parent / "Assets" / "fonts"

# The Google and Fontsource `latin` subset range, verbatim, PLUS the four
# codepoints the shipped files carry that the named range does not cover.
#
# THE FOUR ARE NOT A GUESS. Subsetting to the named range alone would have
# SILENTLY DROPPED U+0102 A with breve from all three families and U+0300, U+0301
# and U+0303 combining grave, acute and tilde from every file. They were found by
# differencing each file's own cmap against the named range before any byte was
# written, which is the only way that class of loss shows up at all: nothing on
# the site uses them today, so no page and no gate would have gone red.
#
# U+0302 is inside the range below although no file carries it. A range that
# reads as one idea beats four singletons, and subsetting cannot add a codepoint
# the source does not have.
#
# Stating the whole thing here in one place is what lets check-font-coverage.js
# compare three things against one written down list: the CSS unicode-range, the
# file's own cmap, and the characters the built pages actually paint.
KEEP = ",".join([
    "U+0000-00FF", "U+0102", "U+0131", "U+0152-0153", "U+02BB-02BC", "U+02C6",
    "U+02DA", "U+02DC", "U+0300-0304", "U+0308", "U+0309", "U+0323", "U+0329",
    "U+2000-206F", "U+2074", "U+20AC", "U+2122", "U+2191", "U+2193", "U+2212",
    "U+2215", "U+FEFF", "U+FFFD",
])

SANS_FEATURES = "ccmp,calt,locl,kern,mark,mkmk,tnum,pnum"
DISPLAY_FEATURES = "ccmp,calt,locl,liga,kern,mark,tnum,pnum"
MONO_FEATURES = "ccmp,calt,locl,mark"

# file, wght axis to keep or None for a static face, layout features to keep
PLAN = [
    ("Inter-var.woff2", "wght=400:800", SANS_FEATURES),
    ("JetBrainsMono-var.woff2", "wght=400:700", MONO_FEATURES),
    ("PlusJakartaSans-600.woff2", None, DISPLAY_FEATURES),
    ("PlusJakartaSans-700.woff2", None, DISPLAY_FEATURES),
    ("PlusJakartaSans-800.woff2", None, DISPLAY_FEATURES),
]


def axis_already_clipped(path, spec):
    """True when the file's own fvar already carries exactly the target range.

    THIS IS WHAT MAKES THE SCRIPT IDEMPOTENT, and it is not decoration. Running
    the instancer a second time on an already clipped face is NOT a fixed point:
    measured, it added 68 bytes to Inter and 116 to JetBrains Mono, because the
    rebuilt avar and STAT tables do not round-trip to the same bytes. Without
    this test, every re-run would quietly inflate the shipped files, and the
    inflation is small enough that nobody would notice it for a long time.
    """
    tag, _, rng = spec.partition("=")
    lo, _, hi = rng.partition(":")
    f = TTFont(path, lazy=True)
    try:
        if "fvar" not in f:
            return False
        for a in f["fvar"].axes:
            if a.axisTag == tag:
                return a.minValue == float(lo) and a.maxValue == float(hi)
        return False
    finally:
        f.close()


def run(args):
    """Run one fontTools module with a fixed hash seed.

    THE SEED IS SET AND IT IS NOT ENOUGH, which is the point worth recording.
    Three runs of this recipe over the same pristine Inter-var.woff2 produced
    32,836 then 33,020 then 32,968 bytes with three different md5 sums. Setting
    PYTHONHASHSEED did not stop it: three more runs gave three more sums. The
    variance was then isolated by running each half on its own, and it is ALL in
    the instancer. fontTools.varLib.instancer produced 37,128, 37,104 and 37,144
    byte outputs from one input, while fontTools.subset produced the same md5
    three times out of three, and the three static Plus Jakarta faces, which
    never touch the instancer, land on the same byte count on every run.

    SO THE HONEST STATEMENT OF REPRODUCIBILITY IS TWO STATEMENTS. Re-running this
    script on the SHIPPED files reproduces them byte for byte, because the axis
    step is skipped and the subsetter is deterministic. Re-running it from the
    pristine upstream file does NOT reproduce an earlier run's bytes, to within
    about 0.1 percent. A byte level or lockfile style check on these files would
    therefore go red at random, and that is a reason not to write one rather than
    a defect to chase. The guard that does exist checks COVERAGE and AXES, which
    are the properties a reader can actually see.

    The seed is kept anyway. It removes one real source of variance for free, and
    it has to be set before the interpreter starts, which is why it is set here
    for the child rather than at the top of this file.
    """
    env = dict(os.environ, PYTHONHASHSEED="0")
    r = subprocess.run(
        [sys.executable, "-m", *args], capture_output=True, text=True, env=env
    )
    if r.returncode != 0:
        sys.stderr.write(r.stdout + r.stderr)
        raise SystemExit("FAILED: %s" % " ".join(args))


def main():
    total_before = total_after = 0
    for name, axis, features in PLAN:
        src = FONTS / name
        before = src.stat().st_size
        work = src
        tmp = FONTS / (name + ".tmp.ttf")
        out = FONTS / (name + ".tmp.woff2")
        if axis and not axis_already_clipped(src, axis):
            run(["fontTools.varLib.instancer", str(src), axis, "--output", str(tmp)])
            work = tmp
        run([
            "fontTools.subset", str(work),
            "--unicodes=" + KEEP,
            "--layout-features=" + features,
            "--flavor=woff2",
            "--output-file=" + str(out),
        ])
        after = out.stat().st_size
        # READ THE WHOLE RESULT BEFORE OPENING THE TARGET FOR WRITING. Opening a
        # file for writing truncates it first, so a read that happened after the
        # open would read nothing and the target would be destroyed. os.replace
        # is not used because a rename onto an existing font in this tree returns
        # WinError 5 while an ordinary write to the same path succeeds.
        payload = out.read_bytes()
        src.write_bytes(payload)
        out.unlink()
        if tmp.exists():
            tmp.unlink()
        total_before += before
        total_after += after
        print("%-28s %7d -> %7d B  (%+.1f%%)"
              % (name, before, after, 100.0 * (after - before) / before))
    print("%-28s %7d -> %7d B  (%+.1f%%)"
          % ("TOTAL", total_before, total_after,
             100.0 * (total_after - total_before) / total_before))


if __name__ == "__main__":
    main()
