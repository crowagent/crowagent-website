// SF46 Phase 2 P2-D probe — verify every shipped photo has a manifest entry.
// Asserts royalty-free image rule + traceability.

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const MANIFEST = path.join(REPO, 'Assets', 'photos', '_manifest.json');
const PHOTOS_DIR = path.join(REPO, 'Assets', 'photos');

// NASA Earth photos are public-domain — covered by audit doc, exempt from manifest.
const NASA_EARTH_PREFIX = /^hero-(earth-cinematic|earth-night|premium-earth)/;

test.describe('SF46 P2-D — image manifest provenance', () => {
  test('every JPG/WEBP photo has a manifest entry OR is NASA earth (PD)', async () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    const manifestFiles = new Set(manifest.flatMap(e => [e.jpg, e.webp].filter(Boolean)));
    const photos = fs.readdirSync(PHOTOS_DIR).filter(f => /\.(jpg|webp)$/i.test(f));
    const orphans = photos.filter(f =>
      !manifestFiles.has(f) && !NASA_EARTH_PREFIX.test(f)
    );
    if (orphans.length) {
      console.log('Photos missing from manifest:', orphans);
    }
    expect(orphans.length).toBe(0);
  });

  test('every manifest entry has a valid pageUrl OR PENDING_VERIFICATION sentinel', async () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    for (const entry of manifest) {
      const valid =
        (entry.pageUrl && /^https:\/\/unsplash\.com\//.test(entry.pageUrl)) ||
        entry.pageUrl === 'PENDING_VERIFICATION';
      if (!valid) {
        console.log('Invalid manifest entry:', entry);
      }
      expect(valid).toBe(true);
    }
  });

  test('every manifest entry has a photographer credit OR PENDING_VERIFICATION sentinel', async () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    for (const entry of manifest) {
      expect(entry.photographer).toBeTruthy();
    }
  });
});
