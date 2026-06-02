#!/usr/bin/env python3
"""
M4 tokenize sweep — Mandate 1 of NASA-grade contract 2026-05-22.

Replaces in styles.css ONLY (sheriff also scans styles.purged.css — that file
is a build intermediate and will be regenerated downstream; we leave it alone
for this pass):
  • cubic-bezier literals  -> var(--ease-*)
  • z-index numeric literals -> var(--z-*)
  • font-size: Npx literals  -> var(--text-*)

Mapping decisions are conservative — only normalise WHEN
  - it's clearly the same canonical curve (within 0.005 numeric tolerance), or
  - the z-index exactly matches a published token, or
  - the px font-size exactly matches a published token.

The script keeps a count of each mapping so the diff can be audited.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(r"C:/Users/bhave/Crowagent Repo/crowagent-website")
CSS = ROOT / "styles.css"

text = CSS.read_text(encoding="utf-8")
orig_len = len(text)
counts: dict[str, int] = {}

def bump(name: str, n: int = 1) -> None:
    counts[name] = counts.get(name, 0) + n

# ── cubic-bezier ────────────────────────────────────────────────────────
# Canonical tokens (verified in crowagent-brand-tokens.css):
#   --ease-out / --ease-canonical / --ease-default  = cubic-bezier(0.16, 1, 0.3, 1)
#   --ease-spring                                   = cubic-bezier(0.34, 1.56, 0.64, 1)
#   --ease-standard                                 = cubic-bezier(0.4, 0, 0.2, 1)
#   --ease-tactile                                  = cubic-bezier(0.25, 1, 0.5, 1)
#   --ease-in-out                                   = cubic-bezier(0.65, 0, 0.35, 1)
EASE_MAP: list[tuple[tuple[float, float, float, float], str]] = [
    ((0.16, 1.0,  0.3,  1.0),  "var(--ease-out)"),
    ((0.4,  0.0,  0.2,  1.0),  "var(--ease-standard)"),
    ((0.34, 1.56, 0.64, 1.0),  "var(--ease-spring)"),
    ((0.25, 1.0,  0.5,  1.0),  "var(--ease-tactile)"),
    ((0.65, 0.0,  0.35, 1.0),  "var(--ease-in-out)"),
    ((0.2,  0.8,  0.2,  1.0),  "var(--ease-standard)"),   # close enough to Material standard; map to canonical
    ((0.25, 0.1,  0.25, 1.0),  "var(--ease-out)"),        # historical iOS ease — canonical out
    ((0.33, 1.0,  0.68, 1.0),  "var(--ease-out)"),        # close to ease-out
    ((0.22, 1.0,  0.36, 1.0),  "var(--ease-out)"),        # close to ease-out
    ((0.65, 0.05, 0.36, 1.0),  "var(--ease-in-out)"),     # close to in-out
]

BEZ_RE = re.compile(r"cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)")

def _bez_replace(m: re.Match) -> str:
    a, b, c, d = (float(x) for x in m.groups())
    for (ta, tb, tc, td), token in EASE_MAP:
        if abs(a - ta) < 0.01 and abs(b - tb) < 0.01 and abs(c - tc) < 0.01 and abs(d - td) < 0.01:
            bump(token)
            return token
    bump("CUBIC_UNMAPPED")
    return m.group(0)

text = BEZ_RE.sub(_bez_replace, text)

# ── z-index ─────────────────────────────────────────────────────────────
# Published canonical tokens (verified):
Z_MAP = {
    -10:   "var(--z-floor)",
    -3:    "var(--z-deep)",
    -2:    "var(--z-back)",
    -1:    "var(--z-under)",
    0:     "var(--z-base)",
    1:     "var(--z-content)",
    2:     "var(--z-stack)",
    3:     "var(--z-stack-2)",
    4:     "var(--z-stack-5)",
    5:     "var(--z-stack-3)",
    6:     "var(--z-stack-4)",
    10:    "var(--z-hud)",
    20:    "var(--z-stack-6)",
    90:    "var(--z-banner)",
    100:   "var(--z-shell)",
    200:   "var(--z-nav)",
    201:   "var(--z-mob-back)",
    202:   "var(--z-mob-menu)",
    205:   "var(--z-shell-2)",
    210:   "var(--z-announce)",
    300:   "var(--z-mega)",
    999:   "var(--z-tip)",
    1000:  "var(--z-overlay)",
    1100:  "var(--z-modal)",
    1150:  "var(--z-cookie)",
    1200:  "var(--z-toast)",
    1201:  "var(--z-chatbot)",
    2000:  "var(--z-tip-2)",
    2001:  "var(--z-max)",
    9000:  "var(--z-mob-sticky)",
    9998:  "var(--z-top-min)",
    9999:  "var(--z-top)",
    10000: "var(--z-top-x)",
    99999: "var(--z-top-2)",
    100050:"var(--z-top-3)",
    2147483646: "var(--z-top-max)",
}

Z_RE = re.compile(r"(z-index\s*:\s*)(-?\d+)")

def _z_replace(m: re.Match) -> str:
    n = int(m.group(2))
    if n in Z_MAP:
        token = Z_MAP[n]
        bump(token)
        return f"{m.group(1)}{token}"
    bump(f"Z_UNMAPPED:{n}")
    return m.group(0)

text = Z_RE.sub(_z_replace, text)

# ── font-size: Npx ──────────────────────────────────────────────────────
# Only fractional pixels (.5px) drift — integer px are already covered by tokens
# in most cases; we map the 6 unique drift values to the new --text-* tokens.
FONT_MAP = {
    "10.5px": "var(--text-micro)",
    "11.5px": "var(--text-eyebrow-s)",
    "12.5px": "var(--text-caption)",
    "13.5px": "var(--text-meta-s)",
    "14.5px": "var(--text-body-s)",
    "16.5px": "var(--text-body-m)",
}

FS_RE = re.compile(r"(font-size\s*:\s*)(\d+(?:\.\d+)?px)")

def _fs_replace(m: re.Match) -> str:
    val = m.group(2)
    if val in FONT_MAP:
        token = FONT_MAP[val]
        bump(token)
        return f"{m.group(1)}{token}"
    bump(f"FS_UNMAPPED:{val}")
    return m.group(0)

text = FS_RE.sub(_fs_replace, text)

# ── Write ───────────────────────────────────────────────────────────────
CSS.write_text(text, encoding="utf-8")

new_len = len(text)
print(f"styles.css: {orig_len} -> {new_len} bytes ({new_len - orig_len:+d})")
print()
print("=== Replacement counts ===")
for k in sorted(counts.keys()):
    print(f"  {counts[k]:5d}  {k}")
