import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const scriptsDir = 'C:/Users/bhave/Crowagent Repo/crowagent-website/astro/scripts';
const files = fs.readdirSync(scriptsDir).filter(f => f.startsWith('check-') && (f.endsWith('.js') || f.endsWith('.mjs')));

console.log(`Found ${files.length} check scripts. Running each...`);

const results = [];

for (const file of files) {
  const filePath = path.join(scriptsDir, file);
  try {
    const output = execSync(`node "${filePath}"`, { cwd: 'C:/Users/bhave/Crowagent Repo/crowagent-website/astro', encoding: 'utf-8' });
    results.push({ script: file, status: 'PASS', output: output.trim().substring(0, 200) });
  } catch (err) {
    results.push({ script: file, status: 'FAIL', error: err.message, output: err.stdout?.substring(0, 200) || err.stderr?.substring(0, 200) });
  }
}

console.log('\n=== CHECK SCRIPTS RESULTS ===');
console.table(results);
