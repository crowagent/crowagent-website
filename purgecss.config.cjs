module.exports = {
  content: ['./*.html', './blog/**/*.html', './tools/**/*.html', './intel/**/*.html', './glossary/**/*.html', './products/**/*.html', './js/**/*.js', './*.js'],
  css: ['./styles.min.css'],
  output: './styles.purged.css',
  safelist: {
    standard: [
      /^sv-/, /^ca-/, /^nav-/, /^cookie/, /^reveal/, /^visible/, /^is-/, /^js-/,
      /^hp-/, /^pmb-/, /^section/, /^hero/, /^footer/, /^logo/, /^skip-link/, /^sr-only/, /^breadcrumb/,
      /^card/, /^btn/, /^u-/, /^f8-/, /^f10-/, /^mob-/, /^announce/, /^active$/, /^open$/, /^role/
    ],
    deep: [/sf\d+/, /^pw-/, /^ms-/],
    greedy: [/^modal/, /^toast/]
  }
};
