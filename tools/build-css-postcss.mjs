// ARCH-1 — PostCSS build step that inlines @import statements BEFORE
// csso minifies + PurgeCSS purges. With this step in place the entry
// styles.css can @import sub-files and the final styles.min.css remains
// byte-equivalent to the all-in-one source.
// Usage: node tools/build-css-postcss.mjs <input> <output>
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import fs from 'fs';

const [, , input = 'styles.css', output = 'styles.inlined.css'] = process.argv;

const css = fs.readFileSync(input, 'utf8');
const result = await postcss([postcssImport()]).process(css, { from: input, to: output });
fs.writeFileSync(output, result.css);

const origSize = Buffer.byteLength(css);
const newSize = Buffer.byteLength(result.css);
console.log(`PostCSS @import inlined: ${input} → ${output}`);
console.log(`  Input:  ${origSize} bytes`);
console.log(`  Output: ${newSize} bytes`);
console.log(`  Delta:  ${newSize - origSize >= 0 ? '+' : ''}${newSize - origSize} bytes`);
