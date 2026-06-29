#!/bin/bash
# ARCH-1 SAFE SEQUENTIAL chunk extractor with per-chunk VRT gate.
# Usage: bash tools/arch1-safe-chunk.sh <startLine> <endLine> <outFile>
# Backup → extract → build → VRT → keep-or-rollback
set -e
START=$1
END=$2
OUT=$3
if [ -z "$START" ] || [ -z "$END" ] || [ -z "$OUT" ]; then
  echo "Usage: bash tools/arch1-safe-chunk.sh <startLine> <endLine> <outFile>"
  exit 1
fi

cp styles.css /tmp/styles.before-chunk.css
echo "  Pre-chunk: $(wc -l < styles.css) lines"

# Extract
mkdir -p $(dirname "$OUT")
sed -n "${START},${END}p" styles.css > "$OUT"
LINES=$((END - START + 1))
echo "  Extracted $LINES lines → $OUT"

# Replace with @import in styles.css
sed -i "${START},${END}d" styles.css
sed -i "${START}i\  @import url('./${OUT}');" styles.css
echo "  Post-chunk: $(wc -l < styles.css) lines"

# Build
npm run build:css:legacy 2>&1 | tail -1

# VRT
echo "  Running VRT..."
if BASE_URL=http://localhost:8092 npx playwright test tests/visual-regression/sf46-p3f-baselines.spec.js --project=visual-regression --reporter=line 2>&1 | tail -1 | grep -q "12 passed"; then
  echo "  ✓ CHUNK ACCEPTED"
  rm -f /tmp/styles.before-chunk.css
  exit 0
else
  echo "  ✗ VRT FAILED — rolling back"
  cp /tmp/styles.before-chunk.css styles.css
  rm -f "$OUT"
  rm -f /tmp/styles.before-chunk.css
  npm run build:css:legacy 2>&1 | tail -1
  exit 1
fi
