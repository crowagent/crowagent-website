#!/bin/sh
# Claude's autonomous Gemini driver — keeps Gemini "awake" by invoking it
# task-by-task (ONE process at a time) until the work is done or MAX reached.
# Each iteration: one guard-gated task + commit. Claude's watchdog audits each commit.
cd "/c/Users/bhave/Crowagent Repo/crowagent-website" || exit 1
MAX=${1:-8}
i=0
while [ "$i" -lt "$MAX" ]; do
  i=$((i + 1))
  if grep -q "ALL-DONE-CONFIRMED" .review/GEMINI-LOG.md 2>/dev/null; then
    echo "DRIVE: ALL-DONE-CONFIRMED found — stopping after $((i-1)) iterations."
    break
  fi
  before=$(git rev-parse --short HEAD 2>/dev/null)
  echo "DRIVE iter $i/$MAX starting ($(date -u +%H:%M:%S)) at $before"
  gemini -p "$(cat .review/_drive-standing.txt)" --approval-mode yolo --skip-trust > ".review/_drive-iter-$i.log" 2>&1
  rc=$?
  after=$(git rev-parse --short HEAD 2>/dev/null)
  if [ "$before" = "$after" ]; then
    echo "DRIVE iter $i: NO COMMIT (rc=$rc) — Gemini did not commit; check .review/_drive-iter-$i.log"
  else
    echo "DRIVE iter $i: committed $after (rc=$rc) — $(git log -1 --pretty=%s | cut -c1-50)"
  fi
  sleep 4
done
echo "DRIVE LOOP COMPLETE after $i iteration(s). HEAD=$(git rev-parse --short HEAD)"
