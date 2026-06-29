// P-5 extension — PurgeCSS the Assets/css/*.css files too.
import { PurgeCSS } from 'purgecss';
import fs from 'fs';
import path from 'path';

const dir = './Assets/css';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.css') && !f.endsWith('.min.css'));

let origTotal = 0;
let purgedTotal = 0;

for (const f of files) {
  const full = path.join(dir, f);
  const orig = fs.statSync(full).size;
  origTotal += orig;
  try {
    const result = await new PurgeCSS().purge({
      content: ['./*.html', './blog/**/*.html', './tools/**/*.html', './intel/**/*.html', './glossary/**/*.html', './products/**/*.html', './js/**/*.js', './*.js'],
      css: [full],
      safelist: {
        standard: [
          /^sv-/, /^ca-/, /^nav-/, /^cookie/, /^chatbot/, /^reveal/, /^visible/, /^is-/, /^js-/,
          /^hp-/, /^pmb-/, /^section/, /^hero/, /^footer/, /^logo/, /^skip-link/, /^sr-only/, /^breadcrumb/,
          /^card/, /^btn/, /^u-/, /^f8-/, /^f10-/, /^mob-/, /^announce/, /^active$/, /^open$/, /^role/, /^lh-/,
          /^pw-/, /^ms-/, /^how-/, /^demo-/, /^cinematic/, /^modal/, /^toast/
        ],
        deep: [/sf\d+/],
        greedy: [/^modal/, /^toast/, /^chip/]
      }
    });
    const purged = Buffer.byteLength(result[0].css);
    if (purged < orig * 0.9) {  // only save if >10% reduction
      fs.writeFileSync(full, result[0].css);
      purgedTotal += purged;
      console.log(`  ${f}: ${(orig/1024).toFixed(1)}KB → ${(purged/1024).toFixed(1)}KB (-${(100*(orig-purged)/orig).toFixed(1)}%)`);
    } else {
      purgedTotal += orig;
    }
  } catch (e) {
    console.log(`  ERROR ${f}: ${e.message}`);
    purgedTotal += orig;
  }
}

console.log(`\nTotal: ${(origTotal/1024).toFixed(1)}KB → ${(purgedTotal/1024).toFixed(1)}KB (-${(100*(origTotal-purgedTotal)/origTotal).toFixed(1)}%)`);
