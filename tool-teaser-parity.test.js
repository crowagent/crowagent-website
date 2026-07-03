/**
 * R24-WEBS-002 — guard the free-tool teaser global-name binding.
 *
 * The shared helper (js/tool-teaser.js) exports its public API on a global, and
 * every tool engine (js/tool-engine-*.js) calls that global's recordRun/gate/
 * appendUpgradeStrip. A previous bug shipped a mismatch (engines referenced
 * `window.CAToolTeaser` while the helper only exported `window.CrowAgentTeaser`),
 * which silently disabled the entire lead-gen funnel. This test fails if the
 * name the engines reference is not actually defined by the helper.
 */
const fs = require('fs');
const path = require('path');

const JS_DIR = path.join(__dirname, 'js');
const TEASER = path.join(JS_DIR, 'tool-teaser.js');
const ENGINES = fs
  .readdirSync(JS_DIR)
  .filter((f) => /^tool-engine-.*\.js$/.test(f));

function exportedGlobals(src) {
  const names = new Set();
  const re = /window\.([A-Za-z0-9_$]+)\s*=/g;
  let m;
  while ((m = re.exec(src))) names.add(m[1]);
  return names;
}

function referencedGlobals(src) {
  const names = new Set();
  const re = /window\.([A-Za-z0-9_$]+)\.(?:recordRun|gateSoftWall|appendUpgradeStrip)/g;
  let m;
  while ((m = re.exec(src))) names.add(m[1]);
  return names;
}

describe('free-tool teaser global-name parity', () => {
  const teaserSrc = fs.readFileSync(TEASER, 'utf8');
  const exported = exportedGlobals(teaserSrc);

  test('there is at least one tool engine to check', () => {
    expect(ENGINES.length).toBeGreaterThan(0);
  });

  test('helper defines the canonical global window.CAToolTeaser', () => {
    expect(exported.has('CAToolTeaser')).toBe(true);
  });

  ENGINES.forEach((file) => {
    test(`${file} references a global the helper actually exports`, () => {
      const src = fs.readFileSync(path.join(JS_DIR, file), 'utf8');
      const referenced = [...referencedGlobals(src)];
      expect(referenced.length).toBeGreaterThan(0);
      referenced.forEach((name) => {
        expect(exported.has(name)).toBe(true);
      });
    });
  });
});
