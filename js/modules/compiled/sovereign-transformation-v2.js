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
    init() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        if (!gsap) {
            console.warn('SovereignTransformation: GSAP not found on window.');
            return;
        }

        // 1. Core Prep
        this.setupKineticTypography();
        this.setupMagneticButtons();

        // 2. Orchestration
        this.heroEntrance();
        this.scrollReveals();
        this.mouseGlows();
        this.setupHeroParallax();
    },

    /**
     * Splits text into animatable character spans.
     * Higher-end than basic line reveals.
     */
    setupKineticTypography() {
        const titleSpans = document.querySelectorAll('.ca-hero-title-premium span');
        titleSpans.forEach(span => {
            const text = span.textContent;
            span.innerHTML = '';
            span.style.opacity = '1'; // Reset opacity set in CSS for GSAP control
            span.style.transform = 'none';

            text.split('').forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.className = 'char';
                charSpan.textContent = char === ' ' ? '\u00A0' : char;
                span.appendChild(charSpan);
            });
        });
    },

    setupMagneticButtons() {
        const magneticElements = document.querySelectorAll('.ca-magnetic');
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(el, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });
    },

    heroEntrance() {
        const tl = gsap.timeline({ 
            defaults: { ease: 'expo.out', duration: 1.8 } 
        });

        // 1. Eyebrow & Badges
        tl.fromTo('.ca-hero-eyebrow', 
            { opacity: 0, y: 30, filter: 'blur(10px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', delay: 0.3 }
        );

        // 2. Kinetic Title Reveal (Character stagger)
        const chars = document.querySelectorAll('.ca-hero-title-premium .char');
        tl.fromTo(chars,
            { opacity: 0, y: 40, rotateX: -45, filter: 'blur(8px)' },
            { 
                opacity: 1, 
                y: 0, 
                rotateX: 0, 
                filter: 'blur(0px)', 
                stagger: 0.015,
                duration: 1.2,
                ease: 'power4.out'
            },
            '-=1.4'
        );

        // 3. Description
        tl.fromTo('.ca-hero-desc-premium',
            { opacity: 0, y: 20, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5 },
            '-=1.0'
        );

        // 4. Buttons
        tl.fromTo('.ca-hero-btns',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0 },
            '-=1.2'
        );

        // 5. Product Showcase Frame
        tl.fromTo('[data-pcar]',
            { opacity: 0, y: 60, scale: 0.94, rotateX: 10 },
            { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 2, ease: 'expo.out' },
            '-=1.0'
        );
    },

    setupHeroParallax() {
        // Deep Spatial 3D Parallax on Scroll
        gsap.to('.ca-hero .ca-container', {
            scrollTrigger: {
                trigger: '.ca-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
            y: 100,
            scale: 0.95,
            opacity: 0.2,
            rotateX: 10,
            ease: 'none'
        });

        // Background Blob Parallax
        gsap.to('.ca-mesh__blob--teal', {
            scrollTrigger: {
                trigger: '.ca-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
            y: -150,
            scale: 1.2,
            ease: 'none'
        });
    },

    scrollReveals() {
        const blocks = document.querySelectorAll('.ca-card, .sv-block, .ca-method-item, .ca-trust-item, .ca-bento-item');
        blocks.forEach(block => {
            gsap.from(block, {
                scrollTrigger: {
                    trigger: block,
                    start: 'top bottom-=80',
                    toggleActions: 'play none none reverse',
                },
                y: 30,
                opacity: 0,
                duration: 1.2,
                filter: 'blur(4px)',
                ease: 'power3.out'
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
