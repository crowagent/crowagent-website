# Tasks

## Task 1: Wave 1 - Visual Polish and Micro-Interactions
- [x] 1.1 Create Assets/css/ultra-premium-interactions.css with @layer components wrapper
- [x] 1.2 Add nav link hover underline animation (::after pseudo-element, 200ms slide-in, colour transition var(--steel) to var(--white))
- [x] 1.3 Add card compound hover (translateY(-4px) + var(--teal-25) border glow + var(--shadow-card-hover) + var(--ease-spring))
- [~] 1.4 Add section gradient blend (::before pseudo-element 80-120px gradient overlap on dark-to-light transitions)
- [~] 1.5 Create js/modules/section-motion-choreography.js with GSAP stagger (eyebrow 0ms, h2 100ms, p 200ms, CTA 300ms)
- [~] 1.6 Add product bento accent colours via data-product attribute (crowcash: var(--sky), crowmark: var(--mark), crowcyber: var(--teal-l), core: var(--teal-d))
- [~] 1.7 Add "How it works" section HTML in index.html (4 steps: Sign up, Configure, Get intelligence, Scale)
- [~] 1.8 Add CTA spring hover (scale(1.02) + var(--shadow-btn-hover)) and press feedback (scale(0.98)) with var(--ease-spring)
- [~] 1.9 Add footer top gradient border and column separators CSS
- [~] 1.10 Add announcement bar shimmer animation (::before gradient slide 3s infinite)
- [~] 1.11 Update scroll-progress to gradient fill (var(--teal) to var(--teal-l)) with glow
- [~] 1.12 Link ultra-premium-interactions.css in index.html and all page heads

## Task 2: Wave 2 - Section Transitions and Spatial Design
- [~] 2.1 Add section depth layering CSS (negative margin-top overlap + pseudo-element shadows between sections)
- [~] 2.2 Add "Who it's for" icon container refinement (per-card gradient backgrounds via nth-child)
- [~] 2.3 Add marquee hover pause and typography refinement (letter-spacing: 0.15em, font-weight: 800)
- [~] 2.4 Modify pricing-billing-toggle.js to animate price counter over 400ms instead of instant swap
- [~] 2.5 Create js/modules/magnetic-pull.js (60px radius, max 4px offset, spring return on mouseleave)
- [~] 2.6 Link magnetic-pull.js in page heads

## Task 3: Wave 3 - Mobile and Responsive Refinement (including Blog Pages)
- [~] 3.1 Create Assets/css/ultra-premium-responsive.css with @layer components wrapper
- [~] 3.2 Add mobile dashboard screenshot rules (object-fit: cover, object-position: top left, aspect-ratio: 4/3 on mobile)
- [~] 3.3 Add carousel frame mobile fit (height: auto on .ca-viewport for mobile)
- [~] 3.4 Add carousel caption mobile contrast (14px min, dark backdrop, 4.5:1 ratio)
- [~] 3.5 Add mobile pricing accordion layout replacing scrollable table (stacked collapsible sections)
- [~] 3.6 Add tablet breakpoint (768-1024px): 2-column grids, 44px touch targets, adjusted padding
- [~] 3.7 Add ultra-wide breakpoint (2560px+): increased max-width, proportional typography and spacing
- [~] 3.8 Add blog page responsive rules: single-column on mobile, TOC below article (position: static), proper font-size scaling, blog index 1/2/3 column grid across breakpoints
- [~] 3.9 Link ultra-premium-responsive.css in all page heads including blog pages

## Task 4: Wave 4 - Performance Perception
- [~] 4.1 Modify hero-citadel.js to check device capability (hardwareConcurrency, viewport width, connection) before Three.js init, add CSS gradient fallback
- [~] 4.2 Remove Google Fonts API link and preconnect tags from ALL HTML pages (index, products, tools, blog, about, contact, pricing, legal, etc.)
- [~] 4.3 Create scripts/build-critical-css.js to extract above-fold CSS for inline insertion
- [~] 4.4 Add first carousel image preload hint to index.html head
- [~] 4.5 Consolidate CSS into single deferred bundle (build script to concatenate all CSS files)

## Task 5: Wave 5 - Trust and Credibility Presentation
- [~] 5.1 Add technology partner strip section to index.html (Cloudflare, Stripe, UK Gov SVG badges)
- [~] 5.2 Add "System Status" link to footer template in js/nav-inject.js
- [~] 5.3 Add social proof testimonial scaffold section to index.html (3 placeholder cards)
- [~] 5.4 Add response time text to contact.html ("We aim to respond within 1 business day")
- [~] 5.5 Add footer certifications row (ICO badge, UK Data Residency, Cyber Essentials SVG badges)

## Task 6: Wave 6 - SEO and Technical Quality
- [~] 6.1 Audit and update og:image meta tags to page-specific images across all pages
- [~] 6.2 Add JSON-LD Organization schema to index.html
- [~] 6.3 Add JSON-LD BreadcrumbList to all pages
- [~] 6.4 Add hreflang en-GB and x-default to all pages missing them
- [~] 6.5 Add JSON-LD SoftwareApplication schema to each product page
- [~] 6.6 Add JSON-LD FAQPage schema to faq.html
- [~] 6.7 Audit and complete sitemap.xml (all tools, methodologies, blog posts, glossary)

## Task 7: Wave 7 - Conversion Patterns
- [~] 7.1 Add feature comparison table to pricing.html (sticky header, checkmarks per tier, responsive)
- [~] 7.2 Add product-specific FAQ accordion (3-5 items) to each of the 6 product pages
- [~] 7.3 Add secondary ghost CTA "Join the waitlist" alongside primary trial CTA on homepage and product pages
- [~] 7.4 Change Portfolio tier CTA text from "Contact sales" to "Talk to founders" in pricing.html
- [~] 7.5 Extend print.css with pricing-specific rules (hide toggle, stack tiers, B&W comparison table)
