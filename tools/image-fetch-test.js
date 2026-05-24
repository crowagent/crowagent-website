
const http = require('http');

const URL = 'http://localhost:8092/Assets/marketing-screenshots/01-dashboard-dark-framed.avif';

http.get(URL, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  res.on('data', () => {});
  res.on('end', () => process.exit(0));
}).on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
