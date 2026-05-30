const fs = require('fs');
const glob = require('glob');
const files = glob.sync('blog/*.html');
let missingAlt = 0;
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const imgTags = content.match(/<img[^>]*>/g) || [];
  imgTags.forEach(img => {
    if (!img.match(/alt=["']/)) {
      console.log('Missing alt in ' + f + ': ' + img);
      missingAlt++;
    } else if (img.match(/alt=["']["']/)) {
      // Empty alt might be intentional for decorative, but let's log it
      // console.log('Empty alt in ' + f + ': ' + img);
    }
  });
});
console.log('Total missing alt attributes:', missingAlt);
