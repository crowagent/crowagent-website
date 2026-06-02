import { PurgeCSS } from 'purgecss';
import fs from 'fs';

const result = await new PurgeCSS().purge({
  content: ['./*.html', './blog/**/*.html', './tools/**/*.html', './intel/**/*.html', './glossary/**/*.html', './products/**/*.html', './js/**/*.js', './*.js'],
  css: ['./styles.min.css'],
  safelist: {
    standard: [
      /^sv-/, /^ca-/, /^nav-/, /^cookie/, /^chatbot/, /^reveal/, /^visible/, /^is-/, /^js-/,
      /^hp-/, /^pmb-/, /^section/, /^hero/, /^footer/, /^logo/, /^skip-link/, /^sr-only/, /^breadcrumb/,
      /^card/, /^btn/, /^u-/, /^f8-/, /^f10-/, /^mob-/, /^announce/, /^active$/, /^open$/
    ],
    deep: [/sf\d+/, /^pw-/, /^ms-/],
    greedy: [/^modal/, /^toast/, /^role/]
  }
});

const orig = fs.statSync('./styles.min.css').size;
fs.writeFileSync('./styles.purged.css', result[0].css);
const next = fs.statSync('./styles.purged.css').size;
console.log(`Original: ${orig} bytes`);
console.log(`Purged:   ${next} bytes`);
console.log(`Reduction: ${(100*(orig-next)/orig).toFixed(1)}%`);
