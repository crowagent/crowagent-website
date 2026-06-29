
const fs = require('fs');

try {
  const css = fs.readFileSync('styles.min.css', 'utf8');
  console.log(`CSS Length: ${css.length}`);
  
  // Look for broken var pattern
  const broken = css.match(/var\(----[a-z0-9-]+\)/g);
  if (broken) {
    console.log(`Found ${broken.length} broken vars:`, broken.slice(0, 5));
  } else {
    console.log('No broken vars found.');
  }

  // Look for strange values like NaN or undefined
  const strange = css.match(/NaN|undefined|null|\[object/g);
  if (strange) {
    console.log(`Found strange values:`, strange);
  }

  // Look for triple hyphens
  const triple = css.match(/---/g);
  if (triple) {
    console.log(`Found triple hyphens: ${triple.length}`);
  }

} catch (err) {
  console.error('Error reading CSS:', err.message);
}
