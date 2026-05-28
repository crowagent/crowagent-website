/**
 * Premium Interactive Drag Slider v1.0 (Linear/Apple Grade)
 * Handles auto-play, drag-to-scroll, and high-precision physics.
 */

const gsap = window.gsap;
const Draggable = window.Draggable;

if (gsap && Draggable) {
  gsap.registerPlugin(Draggable);
}

export class CAPremiumSlider {
  constructor(element) {
    this.container = element;
    this.track = element.querySelector('.slider__track');
    this.progress = element.querySelector('.slider__progress-bar');
    this.cards = element.querySelectorAll('.slider__card');
    
    this.autoPlayDuration = 6; // seconds
    this.isPaused = false;
    this.currentIdx = 0;
    
    this.init();
  }

  init() {
    if (!this.track) return;

    // 1. Setup Draggable
    this.drag = Draggable.create(this.track, {
      type: "x",
      edgeResistance: 0.65,
      bounds: this.container,
      inertia: true,
      onDragStart: () => {
        this.isPaused = true;
      },
      onDragEnd: () => {
        this.updateCurrentIdx();
        // Resume autoplay after 3s of inactivity
        setTimeout(() => this.isPaused = false, 3000);
      }
    })[0];

    // 2. Setup Autoplay
    this.startAutoplay();

    // 3. Hover listeners
    this.container.addEventListener('mouseenter', () => this.isPaused = true);
    this.container.addEventListener('mouseleave', () => this.isPaused = false);
  }

  updateCurrentIdx() {
    // Basic index estimation based on offset
    const cardWidth = this.cards[0].offsetWidth + 40;
    this.currentIdx = Math.round(Math.abs(this.drag.x) / cardWidth);
  }

  startAutoplay() {
    let progress = 0;
    const tick = () => {
      if (!this.isPaused) {
        progress += (1 / (60 * this.autoPlayDuration)) * 100;
        if (progress >= 100) {
          progress = 0;
          this.next();
        }
        if (this.progress) {
          this.progress.style.width = `${progress}%`;
        }
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  next() {
    const cardWidth = this.cards[0].offsetWidth + 40;
    this.currentIdx = (this.currentIdx + 1) % this.cards.length;
    
    gsap.to(this.track, {
      x: -(this.currentIdx * cardWidth),
      duration: 1.2,
      ease: "expo.out",
      onUpdate: () => this.drag.update()
    });
  }
}

// Auto-init if DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-premium-slider]').forEach(el => {
      new CAPremiumSlider(el);
    });
  });
}
