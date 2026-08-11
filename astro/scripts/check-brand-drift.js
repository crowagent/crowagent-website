/**
 * check-brand-drift.js — this site is the CANONICAL surface for brand colour,
 * and a canonical surface that drifts from its own record is the worst kind.
 * ============================================================================
 *
 * WHAT WENT WRONG. app.crowagent.ai and crowagent.ai rendered different brand
 * colours. Measured 2026-08-11 off what each surface actually SERVES:
 *
 *     brand teal        platform #0CC9A8   ·   this site #2DD4BF
 *     deep ground       platform #040E1A   ·   this site #02040A
 *
 * The cause was not a bad value anywhere. It was that there was NO SHARED
 * SOURCE. `crowagent-website/package.json` has never depended on
 * `@crowagent/tokens`; this site's palette was authored independently, in a
 * different repository, behind a different build system. "Change once ->
 * propagate everywhere" was impossible by construction, so the owner's request
 * to make them match could only ever be honoured by hand, twice, and then
 * silently come apart again.
 *
 * THE FIX, AND WHY IT LOOKS LIKE THIS. `src/styles/brand.source.json` is a
 * COMMITTED ARTEFACT generated from the canonical brand record that both repos
 * now share (`crowagent-platform/packages/tokens/brand/brand.source.json`,
 * written by `packages/tokens/scripts/gen-brand.mjs`). A committed JSON file is
 * what two independent build systems can actually agree on: Cloudflare Pages
 * builds this directory with the platform repo ABSENT from the filesystem, so a
 * package dependency, a submodule or a cross-repo import would all be a gate
 * that cannot run in the one place it matters most. This gate needs no network,
 * no install and no sibling checkout.
 *
 * OWNER DECISION, 2026-08-11: "colour theme and branding must freez as we have
 * in website". THIS SITE IS CANONICAL. The platform moves to it. So a
 * disagreement found here does NOT mean "the site is wrong" — it means the
 * shared record has fallen behind a deliberate change made here, and the record
 * plus the platform must be brought forward. The failure message says so.
 *
 * WHAT IT ASSERTS. NAMED TOKENS holding NAMED VALUES, read out of
 * `src/styles/tokens.css` — `--c-teal` IS `#2DD4BF`, not "the palette parses"
 * and not "the hue shelf is non-empty". A gate that only proves a corpus is
 * non-empty passes happily while pointing at the wrong corpus.
 *
 * PROVE IT CAN FAIL: change --c-teal in src/styles/tokens.css and run this. It
 * must exit 1 and name the token. A guard nobody has watched fail is not a
 * guard.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, '..', 'src');
const SOURCE_JSON = path.join(SRC, 'styles', 'brand.source.json');
const TOKENS_CSS = path.join(SRC, 'styles', 'tokens.css');

for (const f of [SOURCE_JSON, TOKENS_CSS]) {
  if (!fs.existsSync(f)) {
    console.error(`check-brand-drift: ${path.relative(SRC, f)} is missing. This gate cannot run, so it fails rather than passing over an absent corpus.`);
    process.exit(1);
  }
}

const source = JSON.parse(fs.readFileSync(SOURCE_JSON, 'utf8'));
const raw = fs.readFileSync(TOKENS_CSS, 'utf8');

/* Blank every comment while preserving byte offsets, so a hex QUOTED IN PROSE
   can never be read as a declaration. tokens.css is ~2,900 lines and most of it
   is commentary that names colours; without this the gate would measure the
   argument rather than the palette. */
const stripped = raw.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

function declaredValue(token) {
  const re = new RegExp(`(?:^|\\n)[ \\t]*${token.replace(/-/g, '\\-')}[ \\t]*:[ \\t]*`, 'g');
  let m;
  let last = null;
  while ((m = re.exec(stripped))) last = m.index + m[0].length;
  if (last === null) return null;
  const semi = stripped.indexOf(';', last);
  if (semi === -1) return null;
  return raw.slice(last, semi).replace(/\s+/g, ' ').trim();
}

const bindings = Object.entries(source.websiteBindings).filter(([k]) => !k.startsWith('_'));
if (bindings.length === 0) {
  console.error('check-brand-drift: brand.source.json declares NO website bindings. A gate over an empty set is not a gate.');
  process.exit(1);
}

const rows = [];
for (const [token, pigment] of bindings) {
  const expected = source.pigments[pigment]?.dark?.value;
  if (!expected) {
    console.error(`check-brand-drift: brand.source.json binds ${token} to unknown pigment "${pigment}".`);
    process.exit(1);
  }
  const actual = declaredValue(token);
  rows.push({
    token,
    pigment,
    expected: expected.toUpperCase(),
    actual: actual ? actual.toUpperCase() : null,
    ok: !!actual && actual.toUpperCase() === expected.toUpperCase(),
  });
}

const bad = rows.filter((r) => !r.ok);

console.log(`brand-drift: ${rows.length} canonical brand token(s) measured in src/styles/tokens.css`);
for (const r of rows) {
  console.log(`  ${r.ok ? 'ok  ' : 'DRIFT'}  ${r.token.padEnd(16)} ${String(r.actual)}  (source: ${r.expected}, pigment ${r.pigment})`);
}

if (bad.length) {
  console.error(`\ncheck-brand-drift: ${bad.length} brand token(s) disagree with src/styles/brand.source.json.\n`);
  for (const r of bad) {
    console.error(`  ${r.token}: this site has ${r.actual === null ? 'NO DECLARATION' : r.actual}, the shared record says ${r.expected}`);
  }
  console.error(
    '\n  THIS SITE IS CANONICAL for brand colour (owner, 2026-08-11), so a drift here is\n'
    + '  almost always a deliberate change that has not been propagated yet, not a mistake\n'
    + '  in this file. TO PROPAGATE IT:\n'
    + '    1. edit crowagent-platform/packages/tokens/brand/brand.source.json to the new value\n'
    + '    2. run  node packages/tokens/scripts/gen-brand.mjs   in the platform repo\n'
    + '       (this rewrites the platform token file, its TypeScript mirror, and the copy\n'
    + '        of brand.source.json committed here)\n'
    + '    3. commit both repos\n'
    + '  Do NOT re-type the hex into the platform by hand. That is the exact defect this\n'
    + '  gate exists to close: it is how the two surfaces came apart in the first place.\n',
  );
  process.exit(1);
}

console.log('\n  clean: every canonical brand token matches the shared record.');
