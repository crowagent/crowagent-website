# Bugfix Requirements Document

## Introduction

CrowAgent.ai has strong fundamentals (working hero, carousel, a11y compliance, geometric spine) but does not yet achieve the visual density, interaction refinement, and perception of quality that characterises top 1% ultra-premium websites (Stripe, Linear, Apple, Vercel, Raycast). This audit identifies specific gaps in visual polish, interaction design, performance, responsive behaviour, SEO quality, and trust presentation that can be resolved through code changes alone (no photography, video production, or manual creative work required).

## Bug Analysis

### Current Behavior (Defect)

**Visual Polish and Density (vs Stripe/Linear/Apple benchmarks)**

1.1 WHEN a visitor hovers over navigation links THEN the system shows no micro-interaction (no underline animation, no colour transition timing, no subtle scale)

1.2 WHEN a visitor hovers over cards (.ca-card) THEN the system shows only opacity changes on background images, with no elevation shift, border glow intensification, or transform feedback

1.3 WHEN a visitor scrolls between the dark hero section and the light "For your role" section THEN the transition is an abrupt hard edge with no gradient blend or soft dissolve

1.4 WHEN a visitor views section headings THEN the text appears with basic GSAP reveal but no stagger on supporting elements (description, eyebrow, and CTAs appear simultaneously rather than cascading)

1.5 WHEN a visitor views the product bento grid (section 05) THEN all four product cards use the same teal accent colour with no visual differentiation between CrowCash, CrowCyber, CrowMark, and CrowAgent Core

1.6 WHEN a visitor views the homepage THEN there is no "How it works" section showing the user journey (signup, configure, get value), which is a standard premium pattern for conversion

1.7 WHEN a visitor hovers and clicks CTA buttons across the site THEN hover states use only translateY(-2px) with no spring easing, glow pulse, or press feedback on click

1.8 WHEN a visitor views the footer on desktop THEN it lacks the visual density and information architecture of premium footers (no multi-column link density, no visual separators between groups)

1.9 WHEN a visitor views the announcement bar THEN it uses a basic background with no premium gradient edge or subtle animation to draw attention

1.10 WHEN a visitor scrolls down the page THEN the scroll-progress indicator uses a basic solid fill with no gradient or glow effect

**Section Transitions and Spatial Design**

1.11 WHEN a visitor scrolls between any two adjacent sections THEN sections sit as flat stacked blocks with no depth layering, overlapping elements, or z-axis visual cues

1.12 WHEN a visitor views the "Who it's for" cards THEN the icon containers (12x12 teal boxes) are generic rounded squares with uniform styling

1.13 WHEN a visitor views the marquee band THEN it scrolls at a constant speed with no pause-on-hover, no gradient fade at edges, and basic text styling

1.14 WHEN a visitor views the pricing page toggle THEN the animation between monthly/annual replaces price numbers instantly with no smooth counter transition

1.15 WHEN a visitor moves their cursor near interactive elements THEN magnetic buttons (already data-magnetic attributed) have no visible pull feedback

**Mobile and Responsive Refinement**

1.16 WHEN a visitor views product-page dashboard screenshots on mobile (width less than 768px) THEN the system renders them too small to be readable (full desktop dashboards squeezed to approximately 360px)

1.17 WHEN a visitor views the carousel browser-frame on mobile THEN there is empty whitespace below the dashboard image within the frame

1.18 WHEN a visitor reads carousel caption text on mobile THEN the text contrast is insufficient for comfortable reading

1.19 WHEN a visitor views the pricing comparison table on mobile THEN horizontal scrolling is required (min-width: 800px) with no mobile-friendly alternative

1.20 WHEN a visitor uses a tablet (768-1024px) THEN layouts jump directly from mobile to desktop with no intermediate optimisation

1.21 WHEN a visitor views the site on ultra-wide displays (2560px+) THEN content appears undersized with excessive empty margins

**Performance Perception**

1.22 WHEN a visitor loads any page on mobile THEN Three.js hero loads regardless of GPU capability, resulting in Lighthouse Performance score of approximately 30

1.23 WHEN a visitor loads any page THEN the Google Fonts API is loaded redundantly alongside self-hosted fonts

1.24 WHEN a visitor loads any page THEN no critical CSS is extracted for above-the-fold content, delaying First Contentful Paint

1.25 WHEN a visitor loads the homepage THEN 6+ CSS files load as separate render-blocking requests

1.26 WHEN a visitor loads the homepage THEN the first carousel product screenshot has no preload hint

**Trust and Credibility Presentation (implementable without manual content)**

1.27 WHEN a visitor views the homepage THEN there is no technology partner logo strip (Cloudflare, Stripe, UK Gov badges that can be rendered as SVG)

1.28 WHEN a visitor views any page footer THEN there is no status page link despite status.json existing

1.29 WHEN a visitor views the homepage THEN there is no structured social proof section placeholder ready for testimonials (even with architectural scaffolding)

1.30 WHEN a visitor views the contact page THEN there is no response time commitment or SLA indication

1.31 WHEN a visitor views the footer THEN there is no visible ICO registration number, UK data residency badge, or security certifications display

**SEO and Technical Quality**

1.32 WHEN any page is shared on social media THEN all pages serve the same generic og:image rather than page-specific images (build script exists but may not cover all pages)

1.33 WHEN search engines crawl the site THEN no JSON-LD structured data exists for Organization, Product, FAQ, or BreadcrumbList

1.34 WHEN search engines assess geographic targeting THEN no hreflang="en-GB" tags are present

1.35 WHEN search engines crawl product pages THEN no schema.org SoftwareApplication markup is present

1.36 WHEN search engines discover pages via sitemap THEN some tool and methodology pages may be missing

**Conversion Patterns**

1.37 WHEN a visitor views pricing tiers THEN there is no feature comparison table between tiers (only card descriptions with bullet points)

1.38 WHEN a visitor views product pages THEN there are no product-specific FAQ sections (FAQ only exists on the dedicated FAQ page)

1.39 WHEN a visitor is not ready to commit to a trial THEN there is no secondary CTA option (waitlist/early-access alongside the trial button)

1.40 WHEN a visitor views the Portfolio tier pricing THEN "Contact sales" feels premature for a pre-launch startup

**Device Handling**

1.41 WHEN a visitor prints the pricing page THEN there is no print stylesheet for clean offline reference

1.42 WHEN a visitor views the site on iPad in portrait THEN no tablet-specific grid or spacing adjustments exist

### Expected Behavior (Correct)

**Visual Polish and Density**

2.1 WHEN a visitor hovers over navigation links THEN the system SHALL display a smooth underline animation (slide-in from left, 200ms cubic-bezier) with colour transition from muted to full white

2.2 WHEN a visitor hovers over cards THEN the system SHALL apply a compound transform (translateY(-4px) + subtle border-glow intensification + shadow depth increase) with spring-physics easing (cubic-bezier(0.34, 1.56, 0.64, 1))

2.3 WHEN a visitor scrolls between dark and light sections THEN the system SHALL use a gradient overlap zone (80-120px soft blend using pseudo-elements) creating a smooth visual transition

2.4 WHEN a visitor views section headings THEN the GSAP reveal SHALL stagger child elements (eyebrow 0ms, heading 100ms, description 200ms, CTA 300ms) creating a cascading entrance

2.5 WHEN a visitor views the product bento grid THEN each product card SHALL use its own accent colour (CrowCash: var(--teal), CrowCyber: var(--teal), CrowMark: var(--mark), CrowAgent Core: var(--teal-d)) as already defined in the token system

2.6 WHEN a visitor views the homepage THEN the system SHALL display a "How it works" section with 3-4 numbered steps (Sign up, Configure your compliance, Get actionable intelligence, Scale across frameworks) using a horizontal step layout on desktop and vertical on mobile

2.7 WHEN a visitor hovers and clicks CTA buttons THEN the system SHALL apply hover: scale(1.02) + shadow expansion with spring easing, and active: scale(0.98) press feedback

2.8 WHEN a visitor views the footer on desktop THEN it SHALL display with clear visual column separators, a top gradient border, and organised link groups with appropriate premium density

2.9 WHEN a visitor views the announcement bar THEN it SHALL feature a subtle left-to-right gradient shimmer animation and refined typography with monospace countdown styling

2.10 WHEN a visitor scrolls THEN the scroll-progress indicator SHALL use a gradient fill (var(--teal) to var(--teal-l)) with smooth easing and subtle glow at the leading edge

**Section Transitions and Spatial Design**

2.11 WHEN a visitor scrolls between sections THEN the system SHALL create depth through overlapping section edges, subtle parallax on background elements, or layered pseudo-element shadows

2.12 WHEN a visitor views the "Who it's for" cards THEN icon containers SHALL have unique, product-contextual styling (subtle gradient backgrounds, refined border treatments) rather than uniform boxes

2.13 WHEN a visitor views the marquee band THEN it SHALL pause on hover, have gradient fade masks at both edges, and use refined letter-spacing and weight for premium typographic feel

2.14 WHEN a visitor views the pricing toggle THEN switching between monthly/annual SHALL animate price numbers with a smooth counter transition (counting up/down over 400ms) rather than instant replacement

2.15 WHEN a visitor moves their cursor near interactive elements THEN magnetic buttons SHALL have visible pull feedback via subtle transform toward the cursor position

**Mobile and Responsive Refinement**

2.16 WHEN a visitor views product-page dashboard screenshots on mobile THEN the system SHALL apply a focused crop or zoom-to-important-area on mobile breakpoints, making key metrics readable

2.17 WHEN a visitor views the carousel browser-frame on mobile THEN the frame SHALL fit tightly to the image with no empty whitespace below

2.18 WHEN a visitor reads carousel caption text on mobile THEN captions SHALL have minimum 14px font size and 4.5:1 contrast ratio against the background

2.19 WHEN a visitor views pricing on mobile THEN the system SHALL present a mobile-native comparison (stacked accordion or swipeable cards) instead of a scrollable table

2.20 WHEN a visitor uses a tablet (768-1024px) THEN the system SHALL provide intermediate grid layouts (2-column for 4-col desktop grids, adjusted padding, 44px minimum touch targets)

2.21 WHEN a visitor views the site on ultra-wide displays (2560px+) THEN content SHALL scale proportionally with increased max-width or proportionally larger typography and spacing

**Performance Perception**

2.22 WHEN a visitor loads any page on mobile (or a device with limited GPU) THEN the system SHALL skip Three.js loading and serve a performant CSS-only animated gradient background, targeting Lighthouse Performance score of 70+

2.23 WHEN a visitor loads any page THEN the system SHALL NOT load the Google Fonts API (self-hosted fonts are sufficient and already preloaded)

2.24 WHEN a visitor loads any page THEN critical above-the-fold CSS SHALL be inlined in the document head for sub-1.5s First Contentful Paint

2.25 WHEN a visitor loads the homepage THEN CSS SHALL be consolidated (critical inline + 1-2 deferred bundles) to reduce render-blocking requests

2.26 WHEN a visitor loads the homepage THEN the first carousel image SHALL be preloaded via a resource hint link element

**Trust and Credibility Presentation**

2.27 WHEN a visitor views the homepage THEN the system SHALL display a technology partner/platform strip showing "Built on" logos (Cloudflare Pages, Stripe Billing, UK Gov Digital Standards) rendered as inline SVG badges

2.28 WHEN a visitor views any page footer THEN the footer SHALL include a "System Status" link pointing to the status page

2.29 WHEN a visitor views the homepage THEN the system SHALL include a social proof section with placeholder architecture (testimonial card component with avatar, quote, and attribution slots) ready to populate

2.30 WHEN a visitor views the contact page THEN it SHALL display "We aim to respond within 1 business day" or equivalent time commitment

2.31 WHEN a visitor views the footer THEN it SHALL display ICO registration badge, UK data residency indicator, and Cyber Essentials badge as inline SVG elements

**SEO and Technical Quality**

2.32 WHEN any page is shared on social media THEN the system SHALL serve page-specific og:images generated by the existing build:og script, covering all main pages

2.33 WHEN search engines crawl the site THEN every page SHALL include JSON-LD for Organization (homepage), Product (product pages), FAQ (FAQ page), and BreadcrumbList (all pages)

2.34 WHEN search engines assess geographic targeting THEN all pages SHALL include hreflang="en-GB" and hreflang="x-default" link elements

2.35 WHEN search engines crawl product pages THEN each SHALL include schema.org SoftwareApplication with name, description, offers, and applicationCategory

2.36 WHEN search engines discover pages THEN sitemap.xml SHALL include all public pages including tools, methodologies, and blog posts

**Conversion Patterns**

2.37 WHEN a visitor compares pricing tiers THEN the system SHALL provide a detailed feature comparison table showing included features per tier with checkmarks and visual hierarchy

2.38 WHEN a visitor reads product pages THEN the system SHALL include 3-5 product-specific FAQ items in a collapsible accordion at the bottom of each product page

2.39 WHEN a visitor views the hero CTA area THEN the system SHALL offer both "Start 14-day free trial" (primary) and "Join the waitlist" (secondary ghost CTA) appropriate for pre-launch

2.40 WHEN a visitor views the Portfolio tier THEN the CTA SHALL read "Talk to founders" instead of "Contact sales"

**Device Handling**

2.41 WHEN a visitor prints the pricing page THEN a print stylesheet SHALL render content legibly in black and white without decorative backgrounds, animations, or navigation chrome

2.42 WHEN a visitor views the site on iPad in portrait THEN the system SHALL use a 2-column grid (instead of 4-col desktop) with adjusted card sizes and spacing optimised for touch interaction

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a visitor views the homepage hero section THEN the system SHALL CONTINUE TO display the isolated cz-* namespace hero with holographic gradient animation, Three.js globe backdrop (on capable devices), and correct centred layout

3.2 WHEN a visitor interacts with the product carousel THEN the system SHALL CONTINUE TO cycle through all product screenshots with smooth transitions, browser chrome frame, and glass caption overlay

3.3 WHEN a visitor uses the mobile hamburger menu THEN the system SHALL CONTINUE TO open/close correctly with proper aria states and z-index isolation

3.4 WHEN a visitor views the site on desktop (1440px) THEN the system SHALL CONTINUE TO render with the canonical geometric spine (80rem max-width, symmetric gutters) across all sections

3.5 WHEN a visitor views pricing with the annual toggle THEN the system SHALL CONTINUE TO calculate monthly pricing as (monthly times 12 times 0.9) shown per month "billed annually"

3.6 WHEN a visitor submits a contact form or partner enquiry THEN the system SHALL CONTINUE TO submit via Formspree with Cloudflare Turnstile validation

3.7 WHEN a visitor uses the footer on mobile THEN the system SHALL CONTINUE TO display the accordion-style collapsible columns

3.8 WHEN a visitor navigates the site THEN all existing internal links SHALL CONTINUE TO resolve without 404 errors

3.9 WHEN a visitor uses a screen reader THEN the system SHALL CONTINUE TO pass axe WCAG 2.1 AA with 0 violations across all pages

3.10 WHEN a visitor views the site on any device THEN the system SHALL CONTINUE TO display 0 horizontal overflow, 0 console errors, and 0 broken images

3.11 WHEN the site is deployed via Cloudflare Pages THEN the build process SHALL CONTINUE TO work with the existing static HTML and pre-compiled assets model

3.12 WHEN a visitor views any CTA button THEN buttons SHALL CONTINUE TO use the brand-correct colour scheme (background teal with obsidian/dark text for primary CTAs)

3.13 WHEN a visitor uses the compliance tools (MEES calculator, debt recovery, etc.) THEN the tools SHALL CONTINUE TO function correctly with results displayed before any email capture

3.14 WHEN search engines crawl the site THEN existing SEO elements (title tags, meta descriptions, canonical URLs) SHALL CONTINUE TO be present and correct

3.15 WHEN a visitor views the eyebrow rotator THEN it SHALL CONTINUE TO cycle through compliance messages with smooth transitions and no FOUC
