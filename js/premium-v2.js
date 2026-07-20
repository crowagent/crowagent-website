(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scroll progress + nav
  var nav=document.getElementById('nav'), sb=document.getElementById('scrollbar');
  function onScroll(){
    nav.classList.toggle('scrolled', scrollY>8);
    var h=document.documentElement.scrollHeight-innerHeight;
    sb.style.width=(h>0?(scrollY/h*100):0)+'%';
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // announce
  var ann=document.getElementById('announce'),ax=document.getElementById('announceX');
  if(ax) ax.addEventListener('click',function(){ann.classList.add('hide');});

  // mobile menu
  var burger=document.getElementById('burger'),links=document.getElementById('navlinks');
  burger.addEventListener('click',function(){var o=links.classList.toggle('open');burger.setAttribute('aria-expanded',o?'true':'false');});
  links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open');burger.setAttribute('aria-expanded','false');});});

  // showcase tabs + auto-cycle with progress
  var tabs=[].slice.call(document.querySelectorAll('.sc-tab'));
  var slides=[].slice.call(document.querySelectorAll('.slide'));
  var frame=document.getElementById('frame'), bar=document.getElementById('scBar');
  var acc=['var(--violet)','var(--teal)','var(--sky)','var(--lime)'];
  var cur=0,timer,DUR=5000;
  function paint(i){
    tabs.forEach(function(t,ti){t.setAttribute('aria-selected',ti===i?'true':'false');});
    slides.forEach(function(s,si){s.classList.toggle('on',si===i);if(si===i)s.removeAttribute('hidden');else s.setAttribute('hidden','');});
    frame.style.setProperty('--acc',acc[i]); bar.style.setProperty('--acc',acc[i]);
  }
  function armBar(){
    if(reduce||!bar) return;
    bar.style.transition='none'; bar.style.width='0';
    requestAnimationFrame(function(){requestAnimationFrame(function(){ bar.style.transition='width '+DUR+'ms linear'; bar.style.width='100%'; });});
  }
  function show(i){ cur=i; paint(i); armBar(); }
  function rearm(){ if(reduce) return; clearInterval(timer); timer=setInterval(function(){ show((cur+1)%tabs.length); },DUR); }
  tabs.forEach(function(t){
    t.addEventListener('click',function(){show(+t.dataset.i);rearm();});
    t.addEventListener('keydown',function(e){var i=+t.dataset.i;
      if(e.key==='ArrowRight'){e.preventDefault();var n=(i+1)%tabs.length;tabs[n].focus();show(n);rearm();}
      if(e.key==='ArrowLeft'){e.preventDefault();var p=(i-1+tabs.length)%tabs.length;tabs[p].focus();show(p);rearm();}});
  });
  if(!reduce){ armBar(); rearm(); }

  // showcase tilt (desktop)
  if(!reduce && matchMedia('(pointer:fine)').matches){
    var showEl=document.getElementById('showcase');
    if(showEl&&frame){
    showEl.addEventListener('pointermove',function(e){
      var r=frame.getBoundingClientRect();
      var rx=((e.clientY-r.top)/r.height-0.5)*-4, ry=((e.clientX-r.left)/r.width-0.5)*4;
      frame.style.transform='rotateX('+rx+'deg) rotateY('+ry+'deg)';
    });
    showEl.addEventListener('pointerleave',function(){frame.style.transform='';});
    }
  }

  // reveals + counters
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');if(e.target.dataset&&e.target.dataset.count)countUp(e.target);io.unobserve(e.target);}});},{threshold:.14,rootMargin:'0px 0px -6% 0px'});
  var sc=document.getElementById('showcase'); if(sc) io.observe(sc);
  document.querySelectorAll('.reveal,[data-count]').forEach(function(el){io.observe(el);});
  function countUp(el){ if(reduce)return; var end=+el.dataset.count,suf=el.dataset.suffix||'',t0=null,dur=1300,em=el.querySelector('em'); if(!em)return;
    function f(n){return n>=1000?n.toLocaleString('en-GB'):n;}
    function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/dur,1);em.textContent=f(Math.floor((1-Math.pow(1-p,3))*end))+suf;if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  }

  // product screenshot tilt
  if(!reduce && matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.pshot').forEach(function(p){
      p.addEventListener('pointermove',function(e){var r=p.getBoundingClientRect();p.style.transform='perspective(1000px) rotateX('+(((e.clientY-r.top)/r.height-0.5)*-3)+'deg) rotateY('+(((e.clientX-r.left)/r.width-0.5)*3)+'deg)';});
      p.addEventListener('pointerleave',function(){p.style.transform='';});
    });
  }

  // magnetic CTA
  if(!reduce && matchMedia('(pointer:fine)').matches){
    var mag=document.getElementById('magnet');
    if(mag){mag.addEventListener('pointermove',function(e){var r=mag.getBoundingClientRect();mag.style.transform='translate('+((e.clientX-r.left-r.width/2)*.22)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)';});
      mag.addEventListener('pointerleave',function(){mag.style.transform='';});}
  }

  // api form
  var af=document.getElementById('apiForm'),ok=document.getElementById('apiOk');
  if(af&&ok){af.addEventListener('submit',function(e){e.preventDefault();if(!af.checkValidity()){af.reportValidity();return;}af.style.display='none';ok.classList.add('show');});}
})();

/* Runtime legibility guard v2: composites translucent background layers to get
   the TRUE effective background, then fixes only text that fails contrast
   against it (white text on dark, ink text on light). Skips gradient/clip text.
   Theme-agnostic; corrects any re-themed section regardless of dark/light. */
(function(){try{
function parse(c){var m=(String(c).match(/[-\d.]+/g)||[]).map(Number);if(m.length<3)return null;return [m[0],m[1],m[2],m.length>3?m[3]:1];}
function Lr(r,g,b){var a=[r,g,b].map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
function ct(l1,l2){return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);}
function effBg(el){
  var layers=[],p=el;
  while(p&&p.nodeType===1){var c=parse(getComputedStyle(p).backgroundColor);if(c&&c[3]>0){layers.push(c);if(c[3]>=0.999)break;}p=p.parentElement;}
  var base=(layers.length&&layers[layers.length-1][3]>=0.999)?layers.pop():parse(getComputedStyle(document.body).backgroundColor)||[255,255,255,1];
  var r=base[0],g=base[1],b=base[2];
  for(var i=layers.length-1;i>=0;i--){var la=layers[i],a=la[3];r=la[0]*a+r*(1-a);g=la[1]*a+g*(1-a);b=la[2]*a+b*(1-a);}
  return [r,g,b];
}
var sel='main h1,main h2,main h3,main h4,main h5,main h6,main p,main li,main a,main span,main td,main th,main dt,main dd,main figcaption,main blockquote,main strong,main em,main label';
document.querySelectorAll(sel).forEach(function(el){
  if(el.children.length)return; var t=(el.textContent||'').trim(); if(!t)return;
  var cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return;
  var fill=(cs.webkitTextFillColor||'').replace(/\s/g,''); if(fill==='rgba(0,0,0,0)')return;
  var fc=parse(cs.color); if(!fc)return;
  var bgArr=effBg(el), lbg=Lr(bgArr[0],bgArr[1],bgArr[2]), lfg=Lr(fc[0],fc[1],fc[2]);
  if(ct(lfg,lbg)>=3)return;
  el.style.setProperty('color', lbg<0.4?'#EAF1FB':'#14181C','important');
});
}catch(e){}})();
