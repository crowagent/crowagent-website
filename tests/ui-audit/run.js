'use strict';

// THE CORRECTED UI AUDIT RUNNER.
//
// Usage:
//   node tests/ui-audit/run.js --target website  [--profiles mobile,tablet,desktop]
//   node tests/ui-audit/run.js --target platform [--limit 40] [--storage path/to/auth.json]
//   node tests/ui-audit/run.js --target portal
//
// Nothing is reported that was not measured, and the denominator is printed
// before any result. The static self-test runs first and the audit aborts if a
// guard is missing, so the method cannot silently regress to the 2026-08-31 one.

const fs = require('node:fs');
const path = require('node:path');
const H = require('./harness');
const R = require('./routes');

const REPO = path.resolve(__dirname, '..', '..', '..');

const TARGETS = {
  website: {
    baseUrl: process.env.AUDIT_WEBSITE_BASE || 'http://localhost:8093',
    discover: () => R.discoverStaticRoutes(path.join(REPO, 'crowagent-website', 'astro', 'dist')),
    profiles: ['mobile', 'tablet', 'desktop'],
  },
  platform: {
    baseUrl: process.env.AUDIT_PLATFORM_BASE || 'http://localhost:3000',
    discover: () => R.discoverNextRoutes(path.join(REPO, 'crowagent-platform', 'web', 'app')),
    profiles: ['desktop', 'mobile'],
  },
  portal: {
    baseUrl: process.env.AUDIT_PORTAL_BASE || 'http://localhost:3100',
    discover: () => R.discoverNextRoutes(path.join(REPO, 'crowagent-platform', 'apps', 'portal', 'src', 'app')),
    profiles: ['desktop', 'mobile'],
  },
};

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function main() {
  const targetName = arg('target', 'website');
  const target = TARGETS[targetName];
  if (!target) { console.error(`unknown target ${targetName}. known: ${Object.keys(TARGETS).join(', ')}`); process.exit(2); }

  // GATE: the method guards must be present before anything is measured.
  const selfTest = require('./self-test');
  selfTest.staticGuards();
  const failedGuards = selfTest.results.filter(r => !r.pass);
  if (failedGuards.length) {
    console.error('ABORT: harness self-test failed. The method is not trustworthy, so no report is produced.');
    for (const f of failedGuards) console.error(`  FAIL ${f.name}: ${f.detail}`);
    process.exit(3);
  }

  const minCoverage = Number(arg('min-coverage', '0.9'));
  const limit = Number(arg('limit', '0')) || 0;
  const storageState = arg('storage', null);
  const profileIds = arg('profiles', target.profiles.join(',')).split(',').map(s => s.trim()).filter(Boolean);

  // CORPUS PROVENANCE. The route list is derived from one artefact and the
  // measurement lands on another, and nothing forces those to be the same thing.
  // The website corpus comes from astro/dist, the deploy artefact, while port
  // 8093 currently runs the Astro dev server, which serves from astro/src and
  // ships a HMR client the deployed page does not have. That difference is
  // stated on every run rather than assumed away.
  let servedBy = 'unknown';
  try {
    const res = await fetch(target.baseUrl, { redirect: 'manual' });
    const body = res.status === 200 ? await res.text() : '';
    servedBy = /@vite\/client|astro-dev-toolbar/.test(body) ? 'dev-server (Vite HMR present)'
      : /__NEXT_DATA__|\/_next\//.test(body) ? 'next server'
      : res.status === 200 ? 'static build'
      : `no 200 at the base url (${res.status})`;
  } catch (err) {
    servedBy = 'unreachable: ' + String(err.message).split('\n')[0];
  }

  const discovery = target.discover();
  let proposals = discovery.proposals;
  if (limit) proposals = proposals.slice(0, limit);

  console.log('CORPUS PROVENANCE');
  console.log(`  route list derived from ... ${targetName === 'website' ? 'astro/dist, the deploy artefact' : 'the Next app router tree, route groups stripped'}`);
  console.log(`  target at ${target.baseUrl} is ... ${servedBy}`);
  if (servedBy.startsWith('dev-server')) {
    console.log('  WARNING: a dev server is NOT the deploy artefact. Route set, bundling and');
    console.log('           lazy behaviour can differ from production, so a result here is');
    console.log('           evidence about the dev render, not about the shipped page.');
  }

  const started = new Date().toISOString();
  const allRecords = [];
  const authPosture = {};

  for (const profileId of profileIds) {
    const { browser, context, profile } = await H.launchContext(profileId, { storageState });
    authPosture[profileId] = await H.observeAuthPosture(context);
    process.stderr.write(`\n[${targetName}/${profileId}] ${proposals.length} routes, auth observed: ${authPosture[profileId].authenticated ? 'AUTHENTICATED (' + authPosture[profileId].sessionCookieNames.join(',') + ')' : 'UNAUTHENTICATED'}\n`);
    let n = 0;
    for (const p of proposals) {
      const rec = await H.measureRoute(context, profile, target.baseUrl, p.route);
      rec.source = p.source;
      allRecords.push(rec);
      n++;
      if (n % 10 === 0) process.stderr.write(`  ${n}/${proposals.length}\n`);
    }
    await context.close();
    await browser.close();
  }

  const perProfile = {};
  for (const profileId of profileIds) {
    const recs = allRecords.filter(r => r.profile === profileId);
    const den = H.denominator(recs, { proposals, skipped: discovery.skipped });
    const banner = H.denominatorBanner(den, minCoverage);
    const { findings, notMeasured } = H.buildFindings(recs);
    const aggregates = H.DEFECT_CATEGORIES.map(c => H.aggregate(recs, c));
    perProfile[profileId] = { denominator: den, valid: banner.valid, banner: banner.text, aggregates, findings, notMeasured, authPosture: authPosture[profileId] };
    console.log('\n### TARGET ' + targetName + '   PROFILE ' + profileId);
    console.log(banner.text);
    console.log('AUTH POSTURE, OBSERVED not declared: ' + (authPosture[profileId].authenticated ? 'AUTHENTICATED' : 'UNAUTHENTICATED') + ` (${authPosture[profileId].cookieCount} cookies)`);
    console.log('\nAGGREGATES, over measured routes only:');
    for (const a of aggregates) console.log(`  ${a.category.padEnd(20)} ${a.claim}`);
    console.log(`\nEVIDENCED FINDINGS: ${findings.length}`);
    for (const f of findings.slice(0, 40)) {
      console.log(`  [${f.category}] ${f.route} @ ${f.observedViewport} x${f.count}  eg ${JSON.stringify(f.evidence[0]).slice(0, 160)}`);
    }
    console.log(`NOT MEASURED entries: ${notMeasured.length} (route or category that produced no observation, reported as unassessed rather than clean)`);
  }

  const report = {
    // The denominator is the FIRST key of the report on purpose.
    denominatorSummary: Object.fromEntries(Object.entries(perProfile).map(([k, v]) => [k, { ...v.denominator, validAudit: v.valid }])),
    target: targetName,
    baseUrl: target.baseUrl,
    corpusProvenance: { routeListFrom: targetName === 'website' ? 'astro/dist' : 'next app router tree', targetServedBy: servedBy },
    startedAt: started,
    finishedAt: new Date().toISOString(),
    method: {
      emulation: 'playwright device descriptors, verified live by matchMedia(pointer: coarse) on every page',
      lazyContent: 'full page scroll plus image decode wait before any observation',
      statusPolicy: 'HTTP status and landed URL asserted, non-200 and auth-wall excluded from every aggregate',
      corpus: 'route paths normalised from the router, route groups and slots stripped, every route probed',
      findingPolicy: 'a finding requires a non-empty observation array with evidence, otherwise the output is not-measured',
    },
    discoverySkipped: discovery.skipped,
    profiles: perProfile,
    records: allRecords,
  };

  const outPath = arg('out', path.join(__dirname, `report-${targetName}.json`));
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nreport written to ${outPath}`);

  const anyInvalid = Object.values(perProfile).some(p => !p.valid);
  process.exitCode = anyInvalid ? 4 : 0;
}

main().catch(err => { console.error(err); process.exit(1); });
