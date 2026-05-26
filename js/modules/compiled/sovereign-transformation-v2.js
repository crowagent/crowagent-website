import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
/**
 * Sovereign Transformation Orchestrator
 * High-performance GSAP sequences for the Global Sovereign Refinement.
 */
export const SovereignTransformation = {
    init() {
        this.heroEntrance();
        this.scrollReveals();
        this.mouseGlows();
    },
    heroEntrance() {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 2.5 } });
        tl.from('.ca-hero-badge', { opacity: 0, y: 20, delay: 0.5 })
            .from('.ca-hero-title', { y: 60, opacity: 0 }, '-=2')
            .from('.ca-hero-desc', { y: 30, opacity: 0 }, '-=1.8')
            .from('.ca-hero-btns', { y: 20, opacity: 0 }, '-=1.6')
            .from('.ca-hero-preview', { scale: 0.9, opacity: 0, y: 100 }, '-=1.4');
        // Dashboard Parallax
        gsap.to('.ca-preview-frame', {
            scrollTrigger: {
                trigger: '.ca-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
            y: -80,
            scale: 1.05,
            rotateX: 5
        });
    },
    scrollReveals() {
        // Standard block reveal pattern
        const blocks = document.querySelectorAll('.ca-card, .sv-block, .trust-item, .sector-card');
        blocks.forEach(block => {
            gsap.from(block, {
                scrollTrigger: {
                    trigger: block,
                    start: 'top bottom-=100',
                    toggleActions: 'play none none reverse',
                },
                y: 40,
                opacity: 0,
                duration: 1.2,
                ease: 'power3.out'
            });
        });
    },
    mouseGlows() {
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const glowable = document.querySelectorAll('.ca-card, .sector-card');
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
// Auto-init if global
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        SovereignTransformation.init();
    });
}
