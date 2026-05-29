const fs = require('fs');
function strip(h){return h.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<svg[\s\S]*?<\/svg>/gi,'').replace(/<!--[\s\S]*?-->/g,'');}
function text(h){return strip(h).replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/gi,' ').replace(/\s+/g,' ').trim();}
function words(t){return t.split(' ').filter(Boolean).length;}
const base = fs.readFileSync('C:/Users/bhave/Crowagent Repo/crowagent-website/baseline-contact.html', 'utf8');
const cur = fs.readFileSync('C:/Users/bhave/Crowagent Repo/crowagent-website/contact.html', 'utf8');
console.log('Baseline:', words(text(base)));
console.log('Current:', words(text(cur)));
