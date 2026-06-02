(function() {
  'use strict';
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.ca-share-btn');
    if (!btn) return;
    e.preventDefault();
    const platform = btn.dataset.platform;
    const url = window.location.href;
    const title = document.title;
    
    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        const originalIcon = btn.querySelector('svg');
        if (originalIcon) originalIcon.style.display = 'none';
        const msg = document.createElement('span');
        msg.className = 'text-[10px] font-black uppercase';
        msg.textContent = 'Copied';
        btn.appendChild(msg);
        setTimeout(() => { 
          if (originalIcon) originalIcon.style.display = '';
          msg.remove();
        }, 2000);
      });
    }
  });
})();
