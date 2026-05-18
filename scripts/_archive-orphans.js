#!/usr/bin/env node
/*
 * Move every image listed as "orphan" (refs.length === 0) in
 * audit-results/_image-audit-raw.json into Assets/_archive/, preserving the
 * relative path so it can be recovered easily.
 *
 * Idempotent: re-running on an already-archived file is a no-op.
 * Safe: never deletes; never touches files with at least one HTML / CSS / JS
 * reference. Logs every move as JSON.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RAW = path.join(ROOT, 'audit-results', '_image-audit-raw.json');
const ARCHIVE = path.join(ROOT, 'Assets', '_archive', 'orphans-2026-05-17');

if (!fs.existsSync(RAW)) {
  console.error('Run audit-images.js first to produce', RAW);
  process.exit(1);
}

const recs = JSON.parse(fs.readFileSync(RAW, 'utf8'));
const orphans = recs.filter((r) => r.refs.length === 0);

let moved = 0;
let bytes = 0;
const log = [];
for (const r of orphans) {
  const src = path.join(ROOT, r.path);
  if (!fs.existsSync(src)) {
    log.push({ status: 'already-gone', path: r.path });
    continue;
  }
  const rel = r.path.startsWith('Assets/') ? r.path.slice('Assets/'.length) : r.path;
  const dst = path.join(ARCHIVE, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.renameSync(src, dst);
  moved++;
  bytes += r.bytes;
  log.push({ status: 'moved', from: r.path, to: path.relative(ROOT, dst).split(path.sep).join('/'), bytes: r.bytes });
}

fs.writeFileSync(
  path.join(ROOT, 'audit-results', '_archive-log-2026-05-17.json'),
  JSON.stringify({ moved, bytes, log }, null, 2),
);

console.log(JSON.stringify({ moved, bytes, mib: (bytes / 1024 / 1024).toFixed(2) }));
