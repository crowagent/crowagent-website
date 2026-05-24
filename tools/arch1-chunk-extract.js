// ARCH-1 Steps 2-14 chunked extractor.
// Per ARCH-1-execution-plan.md: extract @layer legacy block into N partials via @import.
// Usage: node tools/arch1-chunk-extract.js [chunkN-startLine endLine outFile] ...
//
// Each extract: cuts the line range from styles.css, writes to styles/NAME.css,
// replaces with @import url('./styles/NAME.css'); preserves @layer legacy { } wrap
// (so partials contain raw declarations only).
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0 || args.length % 3 !== 0) {
  console.error('Usage: node tools/arch1-chunk-extract.js <startLine> <endLine> <outFile> [...]');
  console.error('Note: lines are 1-indexed. extracted range INCLUSIVE.');
  process.exit(1);
}

// Backup before any change
if (!fs.existsSync('styles.css.pre-arch1-sprint')) {
  fs.copyFileSync('styles.css', 'styles.css.pre-arch1-sprint');
  console.log('Backup: styles.css.pre-arch1-sprint');
}

// Parse args into chunks, sort by startLine descending (process bottom-up so line numbers stay valid)
const chunks = [];
for (let i = 0; i < args.length; i += 3) {
  chunks.push({ start: parseInt(args[i]), end: parseInt(args[i + 1]), outFile: args[i + 2] });
}
chunks.sort((a, b) => b.start - a.start);  // bottom-up

if (!fs.existsSync('styles')) fs.mkdirSync('styles');

let css = fs.readFileSync('styles.css', 'utf8').split('\n');
for (const c of chunks) {
  const block = css.slice(c.start - 1, c.end).join('\n');
  fs.writeFileSync(c.outFile, block + '\n');
  // Replace original lines with single @import
  const importLine = `  @import url('./${c.outFile}');`;
  css = [...css.slice(0, c.start - 1), importLine, ...css.slice(c.end)];
  console.log(`  Extracted lines ${c.start}-${c.end} (${c.end - c.start + 1} lines) → ${c.outFile}`);
}

fs.writeFileSync('styles.css', css.join('\n'));
console.log(`\nstyles.css now ${css.length} lines (was 33369)`);
console.log('Run: npm run build:css:legacy && playwright test visual-regression');
