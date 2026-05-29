const fs = require('fs');
let js = fs.readFileSync('chatbot.js', 'utf8');

const newStyles = `
      /* Toggle button — z-index 1201 to outrank cookie banner (1150). */
      '#ca-chatbot-btn{' +
        'position:fixed;bottom:24px;right:24px;z-index:1201;' +
        'width:56px;height:56px;border-radius:50%;border:none;' +
        'background:var(--ca-teal);color:var(--ca-panel-bg);cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;' +
        'box-shadow:0 4px 16px rgba(0,0,0,.3);transition:transform .3s cubic-bezier(0.4, 0, 0.2, 1),opacity .3s ease;' +
      '}' +
      '@media(max-width:768px){' +
        '#ca-chatbot-btn{width:44px;height:44px;bottom:16px;right:16px;}' +
        '#ca-chatbot-btn svg{width:22px;height:22px;}' +
        '#ca-chatbot-btn.is-scrolling-down{transform:translateY(150%) scale(0.8);opacity:0;pointer-events:none;}' +
        '#ca-chatbot-panel{bottom:72px;right:16px;max-width:calc(100vw - 32px);}' +
      '}' +
      '#ca-chatbot-btn:hover:not(.is-scrolling-down){transform:scale(1.08);}' +`;

js = js.replace(
      /'#ca-chatbot-btn\{' \+[\s\S]*?'#ca-chatbot-btn:hover\{transform:scale\(1\.08\);\}' \+/,
      newStyles + '\n'
);

const scrollLogic = `
  // Auto-collapse logic (Crisp-style)
  var lastScrollY = window.scrollY;
  window.addEventListener('scroll', function() {
    if (isOpen) return; // Don't hide if panel is open
    var currentScrollY = window.scrollY;
    var btn = document.getElementById('ca-chatbot-btn');
    if (!btn) return;
    
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down
      btn.classList.add('is-scrolling-down');
    } else {
      // Scrolling up
      btn.classList.remove('is-scrolling-down');
    }
    lastScrollY = currentScrollY;
  }, { passive: true });
`;

js = js.replace('// Handle simple greetings client-side', scrollLogic + '\n    // Handle simple greetings client-side');

fs.writeFileSync('chatbot.js', js, 'utf8');
console.log('Chatbot updated.');