#!/usr/bin/env python3
"""M4 hex sweep — Mandate 1, drift-hex normalisation.

Replaces *occurrences* of well-known brand hex values OUTSIDE var() fallbacks
and OUTSIDE inline svg data-uri rules. Conservative: only exact matches.

Map basis verified against crowagent-brand-tokens.css.
"""
from __future__ import annotations
import re
from pathlib import Path

CSS = Path(r"C:/Users/bhave/Crowagent Repo/crowagent-website/styles.css")

# Canonical map.  Brand hex (lowercased) -> var() token reference.
HEX_MAP = {
    # Brand teal family
    "#0cc9a8": "var(--teal)",
    "#0cc9a9": "var(--teal)",         # csso rounding artefact of teal
    "#0cc9ab": "var(--teal)",
    "#14e8c2": "var(--teal-l, var(--teal))",  # lighter teal — fall back to teal
    "#6ee9d2": "var(--teal-l, var(--teal))",
    "#9efce8": "var(--teal-l, var(--teal))",
    "#0aa88c": "var(--teal-d)",
    "#088570": "var(--teal-d)",
    "#066a59": "var(--teal-d)",
    "#00d4aa": "var(--teal)",         # alt brand teal — converged to canonical
    "#00b894": "var(--teal-d)",
    "#10b981": "var(--teal-d)",
    "#10dfbb": "var(--teal)",
    # Surface family
    "#040e1a": "var(--bg)",
    "#020b16": "var(--bg)",
    "#0a1422": "var(--bg)",
    "#0a1628": "var(--bg)",
    "#050e1a": "var(--bg)",
    "#051222": "var(--bg)",
    "#0a1f3a": "var(--surf)",
    "#0b1828": "var(--surf)",
    "#0d1e35": "var(--surf2)",
    "#0d2847": "var(--surf2)",
    "#0d3558": "var(--surf3)",
    "#0f2240": "var(--surf3)",
    "#132849": "var(--surf4)",
    "#0a7970": "var(--teal-d)",       # dark teal
    # Cloud family (dark-mode primary text)
    "#e8f0fa": "var(--cloud)",
    "#fff": "var(--cloud)",           # in dark mode pages, white = cloud
    "#ffffff": "var(--cloud)",
    # Light-mode surfaces
    "#f7f9fc": "var(--surf, #f7f9fc)",
    "#eef2f8": "var(--surf2, #eef2f8)",
    "#e4eaf3": "var(--surf3, #e4eaf3)",
    "#dde4ee": "var(--surf4, #dde4ee)",
    # Steel / mist
    "#b8cce0": "var(--steel)",
    "#7e97b5": "var(--mist)",
    "#8a9db8": "var(--mist)",
    "#2a3b52": "var(--border3)",
    "#54688a": "var(--steel)",
    # Sustainability / accent
    "#84cc16": "var(--lime)",
    "#c2ff57": "var(--lime)",
    # Mark (purple)
    "#8b6fd9": "var(--mark)",
    "#b89efc": "var(--mark)",
    "#c792ea": "var(--mark)",
    # Cash (gold/coral)
    "#ffb300": "var(--cash, #ffb300)",
    "#febc2e": "var(--cash, #febc2e)",
    "#f87171": "var(--coral)",
    "#f78c6c": "var(--coral)",
    "#ff5f57": "var(--coral)",
    "#28c840": "var(--success, #28c840)",
    "#c3e88d": "var(--success, #c3e88d)",
    # External brand colors that genuinely must stay as-is — LinkedIn is a
    # social CTA color contract; we cannot rebrand. Use a documented exception
    # token so the value is still centralised and re-skinnable.
    "#0a66c2": "var(--brand-linkedin, #0a66c2)",
    # Cyber accent
    "#4c99ff": "var(--cyber, #4c99ff)",
}

HEX_RE = re.compile(r"#[0-9A-Fa-f]{3,8}\b")

text = CSS.read_text(encoding="utf-8")
out_lines: list[str] = []
counts: dict[str, int] = {}

for line in text.splitlines(keepends=False):
    # Skip svg+xml lines (data:image)
    if "svg+xml" in line or "data:image" in line:
        out_lines.append(line)
        continue
    def _sub(m: re.Match) -> str:
        h = m.group(0).lower()
        # Don't replace inside var() fallback (the existing pattern is fine)
        # We need to check context.
        start = m.start()
        before = line[:start]
        idx_var = before.rfind("var(")
        idx_paren = before.rfind(")")
        if idx_var > idx_paren and idx_var != -1:
            return m.group(0)  # leave fallback alone
        if h in HEX_MAP:
            token = HEX_MAP[h]
            counts[h] = counts.get(h, 0) + 1
            return token
        return m.group(0)
    out_lines.append(HEX_RE.sub(_sub, line))

CSS.write_text("\n".join(out_lines) + ("\n" if text.endswith("\n") else ""), encoding="utf-8")

print("=== drift hex replaced ===")
for h in sorted(counts.keys()):
    print(f"  {counts[h]:3d}  {h} -> {HEX_MAP[h]}")
print(f"\nTotal replacements: {sum(counts.values())}")
