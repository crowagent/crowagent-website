/**
 * Sovereign Transformation Orchestrator v2.1 (Premium Premium Edition)
 * High-performance GSAP sequences for the Global Sovereign Refinement.
 * Includes Kinetic Typography, Magnetic Interactions, and 3D Parallax.
 */

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
}

export const SovereignTransformation = {
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,

    init() {
        if (window.__SOVEREIGN_INIT__) return;
        window.__SOVEREIGN_INIT__ = true;

        // Force manual scroll restoration to prevent "jumping to bottom" on load (LM-016)
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        // If a hash exists but the element is missing, clear the hash (LM-016)
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            if (!document.getElementById(id)) {
                history.replaceState(null, null, ' ');
            }
        }

        if (!gsap) {
            console.warn('SovereignTransformation: GSAP not found.');
            return;
        }

        this.setupKineticTypography();
        this.setupMagneticButtons();
        this.scrollReveals();
        if (!this.isTouch) {
            this.mouseGlows();
            this.setupSlabInteraction();
        }
        this.setupHeroParallax();
    },

    setupSlabInteraction() {
        const slabs = document.querySelectorAll('[data-pcar]');
        slabs.forEach(slab => {
            const frame = slab.querySelector('.ca-showcase-frame');
            const intensity = parseFloat(slab.getAttribute('data-tilt-intensity')) || 15;
            
            slab.addEventListener('mousemove', (e) => {
                const rect = slab.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width - 0.5) * intensity;
                const y = ((e.clientY - rect.top) / rect.height - 0.5) * -intensity;
                
                gsap.to(frame, {
                    rotateY: x,
                    rotateX: y,
                    duration: 1.2,
                    ease: 'power3.out',
                    transformPerspective: 2000
                });
            });
            
            slab.addEventListener('mouseleave', () => {
                gsap.to(frame, { rotateY: 0, rotateX: 0, duration: 2, ease: 'elastic.out(1, 0.5)' });
            });
        });
    },

    setupKineticTypography() {
        /* [hero-overlap fix 2026-07-18] Char-splitting DISABLED site-wide. The split rendered
           overlapping letters on every hero it ran on (security/privacy/terms/roadmap/…); the
           homepage never used it (data-no-split). Headings render as clean text and still get
           the timeline's span-level fade-in — zero visual loss, overlap gone. */
        const headings = [];
        
        const splitElement = (el) => {
            if (window.innerWidth < 480) return;
            // owner 2026-05-31: respect [data-no-split] so the home hero title keeps a single
            // smooth holographic gradient. Char-splitting moves the text into .char children,
            // which breaks the parent's -webkit-background-clip:text (gradient disappears).
            if (el.hasAttribute('data-no-split') || el.closest('[data-no-split]')) return;
            if (el.classList.contains('is-split') || el.querySelector('.char')) return;
            el.classList.add('is-split');

            const nodes = Array.from(el.childNodes);
            nodes.forEach(node => {
                if (node.nodeType === 3) { // Text node
                    const text = node.textContent;
                    if (!text.trim()) return;

                    const fragment = document.createDocumentFragment();
                    const words = text.split(/(\s+)/);

                    words.forEach(word => {
                        if (word.match(/^\s+$/)) {
                            fragment.appendChild(document.createTextNode(word));
                        } else if (word.length > 0) {
                            const wordSpan = document.createElement('span');
                            wordSpan.className = 'word';
                            wordSpan.style.display = 'inline-block';
                            wordSpan.style.whiteSpace = 'nowrap';
                            wordSpan.style.wordBreak = 'keep-all';

                            word.split('').forEach((char, i) => {
                                const charSpan = document.createElement('span');
                                charSpan.className = 'char';
                                if (i > 0 && i === word.length - 1 && /[.,!?;]/.test(char)) {
                                    charSpan.className += ' char--punct';
                                }
                                charSpan.style.display = 'inline-block';
                                charSpan.textContent = char;
                                wordSpan.appendChild(charSpan);
                            });
                            fragment.appendChild(wordSpan);
                        }
                    });
                    node.parentNode.replaceChild(fragment, node);
                } else if (node.nodeType === 1) { // Element node
                    if (node.tagName !== 'BR' && !node.classList.contains('word')) {
                        splitElement(node);
                    }
                }
            });
        };

        headings.forEach(h => splitElement(h));
    },

    heroEntrance() {
        if (!window.gsap) return;
        
        const tl = gsap.timeline({ 
            defaults: { ease: 'power3.out', duration: 1 } 
        });

        // 1. Eyebrow
        tl.from('.ca-hero-eyebrow, .ca-hero-badge', { opacity: 0, y: 15, delay: 0.1 });

        // 2. Kinetic Title Reveal
        const spans = document.querySelectorAll('.ca-hero-title-premium span, .ca-hero-title span');
        spans.forEach((span, i) => {
            const chars = span.querySelectorAll('.char');
            if (chars.length > 0) {
                tl.from(span, { opacity: 0, duration: 0.4 }, 0.3 + (i * 0.1));
                tl.from(chars, { 
                    opacity: 0, 
                    y: 6, 
                    stagger: 0.004,
                    duration: 0.6,
                    ease: 'power2.out'
                }, '-=0.5');
            } else {
                // Fallback for mobile (no char split)
                tl.from(span, { opacity: 0, y: 10, duration: 0.8 }, 0.3 + (i * 0.1));
            }
        });

        // 3. Others
        const others = document.querySelectorAll('.ca-hero-desc-premium, .ca-hero-desc, .ca-hero-btns');
        tl.from(others, { opacity: 0, y: 12, stagger: 0.1, duration: 0.8 }, '-=0.4');

        // 4. Product Showcase
        tl.from('[data-pcar]', { opacity: 0, y: 20, duration: 1.2 }, '-=0.3');
    },

    setupHeroParallax() {
        if (this.isTouch) return; // Disable parallax on mobile for stability
        
        gsap.to('.ca-hero .ca-container', {
            scrollTrigger: {
                trigger: '.ca-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
            y: 60,
            scale: 0.99,
            opacity: 0.9,
            ease: 'none'
        });
    },

    scrollReveals() {
        const blocks = document.querySelectorAll('.ca-card, .sv-block, .ca-method-item, .ca-trust-item, .ca-bento-item');
        blocks.forEach(block => {
            gsap.from(block, {
                scrollTrigger: {
                    trigger: block,
                    start: 'top 98%', 
                    toggleActions: 'play none none reverse',
                },
                y: 12, 
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out'
            });
        });
    },

    setupMagneticButtons() {
        if (this.isTouch) return;
        const magneticElements = document.querySelectorAll('.sv-btn-premium, .sv-btn:not(.ptab)');
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(el, { x: x * 0.12, y: y * 0.12, duration: 0.4, ease: 'power2.out' });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
            });
        });
    },

    mouseGlows() {
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const glowable = document.querySelectorAll('.ca-card, .ca-bento-item');
            glowable.forEach((el) => {
                const rect = el.getBoundingClientRect();
                const x = ((clientX - rect.left) / el.clientWidth) * 100;
                const y = ((clientY - rect.top) / el.clientHeight) * 100;
                el.style.setProperty('--mouse-x', `${x}%`);
                el.style.setProperty('--mouse-y', `${y}%`);
            });
        });
    }
};

// Auto-init
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        SovereignTransformation.init();
    });
}
