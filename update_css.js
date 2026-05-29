const fs = require('fs');
let css = fs.readFileSync('Assets/css/premium-transformation-2026-05-27.css', 'utf8');

const newRule = `
/* LM-081: Clear chat widget on mobile */
@media (max-width: 768px) {
  .ca-container, .f10-container, .prose {
    padding-inline-end: max(24px, calc(1.5rem + 44px)); /* Ensure clearance for 44px chat bubble */
  }
}
`;

fs.writeFileSync('Assets/css/premium-transformation-2026-05-27.css', css + '\n' + newRule, 'utf8');
console.log('CSS updated.');
