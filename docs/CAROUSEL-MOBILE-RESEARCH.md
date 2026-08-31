# Product screenshot carousels on mobile and tablet

Research and recommendation for `astro/src/components/ui/Carousel.astro` and the two homepage
showcases it feeds. Written 2026-08-31. No source file was modified to produce it.

Evidence: fourteen reference sites loaded in Chromium at 390x844 with `isMobile` and `hasTouch`
and a Safari iOS user agent, plus the local build on `http://localhost:8093/` measured at 390,
768, 834, 1024 and 1440. Every number below was measured, not estimated, unless it says
"estimate".

---

## 1. The short answer, in five lines

1. **A carousel is the wrong pattern for `#product` on a phone, and reference-class sites agree
   by a wide margin: ten of the fourteen sites measured ship no controlled carousel of product
   UI on a phone at all.** Four ship an uncontrolled horizontal scroll-snap strip with no dots,
   no arrows and no counter, where the only affordance is a sliver of the next card at the edge.
2. **The legibility failure is not a phone failure. It is total.** The `#product` stage paints a
   1440 CSS px design at 652.5 px on a 1440 desktop and at 306.0 px on a 390 phone. A 14 px
   design label lands at 6.3 CSS px on the desktop and 2.98 CSS px on the phone. Neither is
   readable. Fixing the phone alone fixes a symptom.
3. **The answer used by every reference site that shows dense product UI on a phone is to crop,
   not to shrink.** Intercom, Superhuman, Stotles and Attio all show 30 to 60 per cent of a
   desktop window at near native scale and let the rest bleed off the right edge. Vercel and
   Notion go further and serve a purpose made phone asset. Not one site puts a whole desktop
   window inside a 390 px viewport.
4. **Responsive art direction as the brief describes it is not available for `#product` today.**
   All five of its slides are 2880x1800 desktop masters. The four phone renders that exist are
   four different screens, not phone versions of these five. That premise needs correcting before
   anything is built on it.
5. **The tab overflow and the control stack are cheap to fix and cost zero bytes of HTML.** The
   expensive item is the crop, and the honest cheapest first move is a CSS crop of the masters
   already on disk, which costs no new assets and proves the approach before anyone redraws.

---

## 2. What the local build actually does, measured

### 2.1 The tab row

| Viewport | `#product` tablist clientW | scrollW | Hidden |
|---|---|---|---|
| 390 | 306 px | 599 px | 293 px, 48.9 per cent |
| 768 | 572 px | 572 px | none |
| 834 | 572 px | 572 px | none |
| 1024 | 572 px | 572 px | none |
| 1440 | 594 px | 594 px | none |

The overflow is phone only. At 390 and `scrollLeft: 0` the five tabs sit at these scroll
coordinates: Discover 19.5 to 124.7, Bid or no bid 128.7 to 261.6, Draft 265.6 to 340.4,
Evaluate 344.4 to 447.7, After award 451.7 to 579.1. Two tabs are fully visible, a third is cut,
and two are entirely off screen.

**One correction to the brief.** There is a scroll affordance. `TabSwitcher.astro` already applies
a fade mask below 767 px, measured live as
`linear-gradient(90deg, transparent 0px, black 19.5px, black calc(100% - 19.5px), transparent)`,
with `padding-inline: 19.5px` and `overscroll-behavior-inline: contain`. `scripts/tabs.ts` also
centres the active tab. The mechanism is correct and matches what Attio, Airtable and Sage do.

What is missing is not the affordance. It is **the count**. Nothing in the tab row says there are
five stages or that you are on the second. That fact lives 44 px below, in a separate control row,
which is exactly the redundancy problem in item 4 of the brief.

### 2.2 The control row

At 390, `#product` renders a second row below the tabs holding Pause at 87.9x44, Previous stage at
44x44, a counter, and Next stage at 44x44. The cluster spans x 64.1 to 325.9, which is 261.8 px of
the 306 px available. All three controls clear WCAG 2.5.8 (24 px) and 2.5.5 (44 px).

`#workstation-tour` renders its own row at 390: Previous screen 46x46, Pause 87.9x44, Next screen
46x46, above a six dot row of 44x44 targets that fits at 316 px with no overflow at any width.

**Worth flagging.** `Carousel.astro` carries a rule at `max-width: 40rem` that hides
`.pcar__arrow` on a phone, with a comment explaining that swipe is the gesture there. That rule
does not reach `#workstation-tour`, which is not a `.pcar` and renders its own arrows. The
component's stated phone policy and the tour's actual phone behaviour disagree.

### 2.3 The legibility arithmetic

All five `#product` slides are DESKTOP masters. Confirmed against `crowmark-screens.ts`:
`sup-1-discover`, `sup-3-bid-no-bid`, `sup-2-tender-questions`, `buy-2-response-review` and
`buy-4-delivery-oversight` all spread `...DESKTOP`, which is `{ width: 2880, height: 1800 }` at 2x,
so a 1440 CSS px design.

Using a 10 CSS px floor for a 14 px design label, which is about the smallest an adult reads on a
phone without pinching:

| Master | Design width | Required painted width | `#product` paints | 14 px label lands at |
|---|---|---|---|---|
| Desktop 2880x1800 | 1440 px | 1028 px | 306 px at vw 390 | **2.98 px** |
| Desktop 2880x1800 | 1440 px | 1028 px | 669.9 px at vw 768 | 6.51 px |
| Desktop 2880x1800 | 1440 px | 1028 px | 731.9 px at vw 834 | 7.11 px |
| Desktop 2880x1800 | 1440 px | 1028 px | **652.5 px at vw 1440** | **6.34 px** |
| Tablet 2048x1536 | 1024 px | 731 px | not used by `#product` | n/a |
| Phone 780x1688 | 390 px | 279 px | not used by `#product` | n/a |

The stage caps at 653 px on a desktop because the homepage renders it inside a 7fr grid column,
which `Carousel.astro`'s own header records and which the live `sizes` attribute confirms:
`(min-width: 1063px) 653px, (min-width: 400px) calc(90vw - 2px), calc(100vw - 42px)`.

**So `#product` never paints a desktop master wide enough to read, at any viewport this site
serves.** The phone is the worst case by a factor of two, not a special case.

By contrast `#workstation-tour` paints 1,022 px at 1440, which is 0.710 of the 1440 design and puts
a 14 px label at 9.94 px. That is why the tour reads on a desktop and the showcase does not.

Hypothetically, if a phone render were used at 390: 306 / 390 design = 0.785 scale, and a 14 px
label lands at 10.99 px. **That is 3.69x the type size of the desktop master and is the only one of
the three drawn sizes that clears the floor at 306 px.** The principle in the brief is right. The
assets to execute it for these five slides do not exist.

### 2.4 Two defects found while measuring, neither in the brief

**a) `#workstation-tour` has no width ladder at all.** Its `<picture>` offers a single AVIF
candidate, the master, with no `sizes` and no rungs. Measured at 390 it fetches
`buy-1-requirement-builder-light.avif` at **88,153 bytes** to paint 314 CSS px, when
`buy-1-requirement-builder-light-800w.avif` exists on disk at 18,810 bytes and is what the browser
would pick at DPR 2.

| Tour slide | Master bytes | Correct rung at 390, DPR 2 |
|---|---|---|
| buy-1-requirement-builder | 88,153 | 18,810 (800w) |
| sup-5-answer-library | 69,489 | 23,006 (800w) |
| sup-4-evidence-tracker | 88,607 | 19,227 (800w) |
| buy-3-evaluation | 112,773 | 24,621 (800w) |
| buy-6-reports-audit | 46,126 | 16,247 (800w) |
| sup-8-action-centre | 35,525 | 35,525 (already a 780w master) |
| **Total** | **440,673** | **137,436** |

**303,237 bytes over-fetched on the homepage at 390.** `#product` does carry the ladder and does
not have this problem. `scripts/build-product-screens.mjs` built these rungs on 5 August and the
tour does not offer them.

**b) `#product`'s `sizes` overstates the stage by 13.7 per cent at 390.** The third arm resolves to
`calc(100vw - 42px)` = 348 px, and the image paints at 306.0 px. Not harmful at DPR 2 (both round
to the 800w rung) but it is a wrong number in a load bearing attribute.

### 2.5 The budget position

`astro/dist/index.html` is **104,480 bytes** against `check-budgets.js` `htmlPerRoute: 100 * KB` =
102,400 bytes. **The homepage is 2,080 bytes over.** Every proposal below carries a raw byte figure
against that.

Serialized sizes at 390, measured from `outerHTML`:

| Node | `#product` | `#workstation-tour` |
|---|---|---|
| whole section | 22,851 B | 10,216 B |
| tablist | 1,246 B | 1,491 B |
| all `<picture>` | 6,399 B (5) | 4,912 B (6) |
| captions | 779 B | 1,499 B |
| pause control | 253 B | 309 B |
| counter | 80 B | none |
| live region | none found | 81 B |

---

## 3. Per site: what I saw at 390x844

Every row was captured with `isMobile: true`, `hasTouch: true`, DPR 2, an iOS Safari user agent
and a full scroll pass to trigger lazy content. A cookie banner covered part of the viewport on
Intercom, Attio, Stotles, Figma, Airtable, Superhuman and Sage, which is noted where it limited
what could be observed.

### Stripe, https://stripe.com/gb

**Carousel on mobile:** no controlled carousel. Three horizontal scroll-snap strips, class names
`carousel__scroller case-study-carousel__scroller` (6 items, 2,260 px in a 390 px port,
`scroll-snap-type: x mandatory`, `scroll-snap-align: center`), `testimonial-carousel__cards`
(4 items, 1,560 px, align `start`) and, tellingly, `carousel__scroller mobile-carousel__scroller`
(8 items, 3,008 px, align `start`). **The class name says `mobile-carousel`: the phone gets a
different component, not the desktop one shrunk.**

**Progress and movement:** none. Zero elements matching prev, next, pause, slide or "N of M". Zero
dot groups. The affordance is arithmetic: 3,008 px across 8 items is about 376 px each in a 390 px
port, so a sliver of the next card shows. The testimonial strip at 390 px per item shows no peek
at all and relies on the snap alone.

**Label row overflow:** not applicable. No `role="tab"` or `role="tablist"` anywhere on the page.

**Screenshot legibility:** Stripe largely refuses the problem. What I saw scrolling was abstract
illustration (a particle globe, a gradient Visa card) with **one legible micro-detail composited
on it**, for example a `$102.23 USDC` chip at readable size. The hero is art directed with a real
`<picture>`: three `<source media>` arms at `(min-width: 1264px)`, `(min-width: 640px) and
(max-width: 1263px)` and `(max-width: 639px)`, the last serving `wave-fallback-mobile.png`. Many
other assets are named `-mobile`: `sessions-2026-on-demand-bg-mobile.png`,
`annual-letter-mobile.png`, seven `the-happenings-*-mobile.png`.

**Autoplay:** none observed. No video elements, no pause control.

### Linear, https://linear.app/

**Carousel on mobile:** no controlled carousel. Two horizontal scroll-snap strips (`x mandatory`),
1,016 px and 992 px inside a 390 px port.

**Progress and movement:** nothing. No dots, no counter, no arrows. **The peek is the entire
affordance and it is unmistakable**: the screenshot shows the next card cut hard at the right edge
with its heading legibly clipped mid-word ("Pow", "Des", "hu", "PR"). A reader cannot fail to see
there is more.

**Label row overflow:** not applicable, no tabs.

**Screenshot legibility:** sidestepped. The cards carry abstract isometric line drawings, not
product UI. Images render at 390 px from 1560 px naturals (4.0x oversample) but the subject is a
diagram, so scale does not matter.

**Autoplay:** none.

### Vercel, https://vercel.com/

**Carousel on mobile:** none. Zero horizontal scrollers of any kind.

**Progress and movement:** not applicable. The page is a vertical stack.

**Label row overflow:** not applicable.

**Screenshot legibility: the strongest single example in the set.** Files are named
`notion-mobile-light.webp`, `zapier-mobile-light.webp`, `mintlify-mobile-light.webp`, natural
390x311, painted at 342 px, `sizes="100vw"`. **These are purpose made phone renders.** The framing
shows **one UI panel at near native scale with the surrounding application ghosted out behind it**.
Every word is readable in the screenshot: "New AI chat", "How can I help you today?", "Translate
this page", "Analyze for insights", "Create a task tracker", "Ask, search, or make anything...".
The app around it is deliberately faded to a pale outline, so the crop reads as a zoom rather than
as a cut.

**Autoplay:** none.

### Notion, https://www.notion.com/

**Carousel on mobile:** one strip only, and only for testimonials
(`socialProofV2 ... cards`, `scroll-snap-type: inline mandatory`, `scroll-snap-align: none center`,
3 items across 945 px). At 315 px per card in a 390 px port that is about 75 px of neighbour
visible on each side, the widest peek measured anywhere.

**Progress and movement:** no dots, no counter, no arrows.

**Label row overflow:** not applicable, no tabs.

**Screenshot legibility:** art directed. Several images carry a `<picture>` with
`<source media="(max-width: 839px)">` serving a different asset below 840 px. Product visuals
render as 326x326 squares from 357x357 naturals, a 1.10x oversample. A square frame at 326 px can
hold roughly ten lines of UI text and stay readable. It cannot hold a 1440 px window.

**Autoplay:** none observed.

### Figma, https://www.figma.com/

**Carousel on mobile: yes, and it is the only textbook ARIA carousel in the set.**
`aria-roledescription="carousel"` on the container with ten `aria-roledescription="slide"`
children.

**Progress and movement:** a live counter reading `1 of 10`, a `Previous slide` button at 36x36, a
`Next slide` button at 36x36, and a rotation control labelled `Pause` at 36x36. Nine further 36x36
buttons labelled `Play` appear alongside, which read as per-slide media controls rather than
carousel controls, though I did not confirm that. **36x36 clears WCAG 2.5.8 at 24 px and fails
2.5.5 at 44 px.** No `role="tab"` anywhere, so the slide picker is not the tabbed variant.

**Label row overflow:** not applicable.

**Screenshot legibility:** avoided rather than solved. Slides paint at 187x233 px from 389x485
naturals (2.08x) and the subject is design artwork, illustration and phone shaped mocks, not dense
application UI. At 187 px wide only a large number such as `$194.70` survives. Figma is not trying
to make a screenshot readable and does not need to.

**Autoplay:** yes, with a pause control, which is the 2.2.2 mechanism.

### Framer, https://www.framer.com/

**Carousel on mobile:** none. Zero horizontal scrollers.

**Progress and movement:** not applicable.

**Label row overflow:** not applicable.

**Screenshot legibility: served at exactly the rendered size.** Every product image measured has
`naturalWidth` equal to its painted width to the pixel: 340 natural at 340 painted, 337 at 337,
127 at 127. `sizes` carries a per-breakpoint ladder such as
`(min-width: 1200px) 337px, (max-width: 809.98px) 337px, ...`. The consequence is a 1.00x
oversample everywhere, which is the opposite of this site's 9.4x. Framer's own showcase grid uses
deliberate 127x260 thumbnails that nobody is expected to read.

**Autoplay:** one `<video autoplay loop muted>` at 390 px with no controls and no pause button
found. That is a 2.2.2 exposure if the motion runs past five seconds, which I did not time.

### Retool, https://retool.com/

**Carousel on mobile:** none in the slide sense. One `overflow-x: auto` strip, 557 px in a 390 px
port, `scroll-snap-type: none`.

**Progress and movement:** none.

**Label row overflow:** not applicable.

**Screenshot legibility: abandoned on purpose.** Fourteen images all alt-texted "... app
screenshot" render at **154x96 CSS px** with `object-fit: cover` and a natural size of exactly
154x96. These are thumbnails of applications built on Retool, shown as texture and variety rather
than as readable evidence. `sizes="auto, (min-width: 1280px) 20vw, (min-width: 768px) 25vw, 33vw"`.

**Autoplay:** none observed.

### Airtable, https://www.airtable.com/

**Carousel on mobile:** none with a slide model.

**Progress and movement:** not applicable, but the **label row is the interesting part**. A `<nav>`
holds "01 AI app building", "02 Agents at Scale", "03 Meet Omni", "04 Enterprise capabilities"
across 869 px in a 390 px port, `overflow-x` scrollable, `scroll-snap-type: none`, no mask. The
screenshot shows the active item fully visible and left aligned, the next item greyed and cut hard
at the right edge, above a full width rule. **Airtable accepts the cut with no fade and no
indicator.** The numbers 01 to 04 do the work a counter would do.

**Screenshot legibility:** replaced by motion. Three `<video autoplay loop muted>` at 338 to
342 px, plus a `Pause video` control at 40x40. 40x40 clears 2.5.8 and fails 2.5.5.

**Autoplay:** yes, with a pause control.

### Attio, https://attio.com/

**Carousel on mobile: yes, and it is the most instructive hybrid.** The changelog block carries
`aria-roledescription="carousel"` with nine `slide` children over a
`snap-x snap-mandatory overflow-x-auto overscroll-x-none` strip, 1,340 px in a 390 px port. So the
ARIA carousel semantics sit **on top of a CSS scroll-snap strip** rather than on a JS track.

**Progress and movement:** no arrows found. The probe found a nine item indicator row 267 px wide
alongside a nine slide carousel, which is consistent with scroll markers, though I did not confirm
the elements are the markers.

**Label row overflow: this is the closest analogue to the `#product` tab row.** A row reading
"Build pipeline / Convert leads / Run sales motions / Forecast revenue / Retain and expand" is
743 px inside a 390 px port, in an `overflow-x-auto` container with the scrollbar suppressed via
`[scrollbar-width:none]` and `[&::-webkit-scrollbar]:hidden`. **Five labels, 353 px hidden, handled
by horizontal scroll with the scrollbar hidden.** That is what this site already does.

A separate row, `enrichment-scroll`, does add the fade: computed
`mask-image: linear-gradient(to right, rgba(0,0,0,0) 0px, rgb(0,0,0) ...)`, 1,157 px in a 390 px
port. So Attio uses a fade mask where the content continues and no fade where the labels do.

**Screenshot legibility:** crop and bleed. The `enrichment-scroll` row holds a live looking record
panel with "Sarah Johnson", "Compose email", "Highlights", "Summary", and a full readable sentence
of body copy, at a width that runs 767 px past the viewport. Cover images render 390x240 from
390x243 naturals, a 1.00x oversample, so those are phone sized assets.

**Autoplay:** none observed on the changelog strip.

### Superhuman, https://superhuman.com/

**Carousel on mobile:** none. Zero horizontal scrollers.

**Progress and movement:** not applicable.

**Label row overflow:** not applicable.

**Screenshot legibility: crop and bleed, and it works.** Four product images render at 324x329
from 1336x1358 naturals, a 4.12x oversample, which by itself would suggest the same failure this
site has. It does not fail, because **the asset is a crop, not a whole window**. The screenshot
shows an inbox fragment running off the right edge with every line readable: "Ask AI", "find time
with James after I land and before the tetron meeting", "I found a slot with James between your
flight and the Tetron meeting at 10:30 AM. I'll schedule a meeting then.", "Final contract
signature needed", "eTicket Itinerary and Receipt for Confi...". **Oversample ratio is not the
variable that governs legibility. Framing is.**

**Autoplay:** one `<video autoplay loop muted>` hero background, decorative, no pause control found.

### Stotles, https://www.stotles.com/ (UK, public sector tender intelligence)

The closest direct comparator on the web: same buyer, same evidence problem.

**Carousel on mobile: yes.** `Previous slide` and `Next slide` buttons at **56x56**, the largest
carousel targets measured anywhere in the set. No horizontal scrollers found, so the track is
driven by JS rather than by scroll-snap. No dot group and no counter found.

**Label row overflow:** not applicable, no tabs.

**Screenshot legibility: crop and bleed, executed with two authored aspect ratios.** Stotles ships
two shapes of product asset and switches by section:

- wide crops, natural 1552x960, painted 348x215
- near square crops, natural 1040x960, painted 348x321

The near square 1040x960 asset holds a header line and about three table rows, and at 348 px every
word of it is readable in the screenshot: "782 Awards", "5 Buyer types", "Buyer", "Awards",
"Central government", "Ministerial department", "Non-ministerial department", "65". A second one
reads "HM Revenue & Customs (HMRC)", "Summary / Notices / Frameworks / Documents / Suppliers /
Contacts", "1,145 / 10,422 Notices", "131 / 1,346 Documents", "8 / 32 Frameworks",
"960 / 3,543 Suppliers", "1,238". The frame bleeds off the right edge rather than shrinking.

Three hero images at 1929x1485 painted 350x270 (5.51x) are the exception and are the least
readable thing on the page, which tends to confirm the rule.

**Autoplay:** not determined. A cookie banner covered the carousel region on first paint.

### Tussell, https://www.tussell.com/ (UK, public sector market data)

**Carousel on mobile:** none. No scrollers, no tabs, no controls.

**Screenshot legibility: the screenshot is abandoned entirely.** Seven SVG illustrations, all
`object-fit: contain`, painted at 346 px from naturals between 176x150 and 261x150. Filenames such
as `02-tussell-home-page-graphics-strategic-insight.svg` and
`Product laptop new UI SVG with bubbles.svg` describe schematic drawings of the product, not
captures of it. **A UK competitor selling to the same buyer decided a diagram beats an unreadable
screenshot.**

**Autoplay:** none.

### Sage, https://www.sage.com/en-gb/ (UK, established B2B)

**Carousel on mobile: yes, two of them, and they are the accessibility cautionary tale.**

**Progress and movement:** an `<ol class="carousel-indicators">` with six children across 215 px,
plus three dot buttons with correct accessible names "1 of 3", "2 of 3", "3 of 3". **Measured, the
dots are 16x8 and 8x8 CSS px.** 8x8 does not meet WCAG 2.5.8's 24x24 on its own, and adjacent dots
in a 180 px group are unlikely to satisfy the spacing exception, so this reads as a 2.5.8 failure.
A separate `Play/Pause Animation` control measures 44x44 and is correct.

**Label row overflow: this is the counter example worth having.** Five tabs, "Accounting",
"Payroll & HR", "Accountants", "ERP", "Explore Sage Ai", in a `role="tablist"` measuring
clientW 390 and scrollW 390 with `overflow-x: hidden` and `flex-wrap: nowrap`. **Five tabs fit in
390 px because the labels are short.** "Bid or no bid" and "After award" are 133 px and 127 px on
their own. Label length, not tab count, is what breaks the row.

**Screenshot legibility:** mixed. Product art at 310x342 from 1180x1300 (3.81x). Card art at
278x193 from 384x267 (1.38x), which is phone sized. Content cards sit in a horizontal strip with
the next card cut at the edge.

**Autoplay:** yes, with a 44x44 play/pause control.

### Intercom, https://www.intercom.com/

**Carousel on mobile:** none. No scrollers, no tabs, no controls, no counters.

**Screenshot legibility: crop and bleed, with phone sized assets.** Every product image has a
390x390 natural painted at 358 px, a 1.09x oversample. **These are authored square, at phone
width.** The screenshot shows an inbox crop running off the right edge at near native scale, fully
readable: "All 2370", "Unassigned 0", "Dashboard", "Team inboxes", "Team Tickets 1", "Inbox
Basics", "Billing operations", "Fin Questions", "Jim Dietrich", "Hi there, I have a questio... 2m",
"Credit limit increase Procedure triggered", "Fin's thoughts (Step 1)", "Read credit profile and
payment history", "Assign to credit specialist, auto-approval thr...", and a full conversation
bubble. Alt text names the moment rather than the screen: "Intercom inbox showing a credit limit
increase con...", "Fin answering a subscription cancellation question", "Fin handing a conversation
to a human teammate wit...". **One decision per image, cropped to it.**

**Autoplay:** none observed.

---

## 4. The patterns that recur, ranked

Counting the fourteen sites.

| Rank | Pattern | Count | Sites |
|---|---|---|---|
| 1 | **No carousel of product UI on a phone at all** | 7 of 14 | Vercel, Framer, Superhuman, Intercom, Tussell, Retool, Airtable |
| 2 | **Uncontrolled horizontal scroll-snap strip, peek as the only affordance** | 4 of 14 | Stripe (3 strips), Linear (2), Notion (1), Attio (1) |
| 3 | **A controlled carousel with a slide model** | 4 of 14 | Figma, Sage, Stotles, Attio |
| 4 | **A label or tab row that overflows and scrolls horizontally with the scrollbar hidden** | 3 of 14 | Attio, Airtable, this site |
| 5 | **A fade mask on an overflowing horizontal row** | 2 of 14 | Attio (content rows only), this site |
| 6 | **Autoplaying muted looping video in place of a still screenshot** | 3 of 14 | Airtable, Framer, Superhuman |
| 7 | **A visible slide counter of the form "N of M"** | 1 of 14 | Figma |
| 8 | **Visible previous and next arrows on a phone** | 2 of 14 | Figma (36x36), Stotles (56x56) |
| 9 | **Dot indicators on a phone** | 2 of 14 | Sage, Attio (probable) |
| 10 | **A `role="tablist"` used as the slide picker on a phone** | 1 of 14 | Sage, and it does not overflow |

Read the top two rows together. **Eleven of fourteen sites give a phone reader either no carousel
or a carousel with no controls whatsoever.** The three navigation mechanisms this site shows at
once are more control surface than any reference site puts on a phone, and two of them are more
than most put on at all.

Three observations that did not fit the table.

- **Nobody uses `role="tab"` as a slide picker on a phone except Sage, whose row happens to fit.**
  The APG explicitly offers the tabbed carousel variant. Nobody in this set reaches for it at
  390 px.
- **The peek is the dominant affordance and it is free.** Where a strip scrolls, the next item is
  visible at the edge in every case. No site pays for a dot row to say what 14 px of a neighbouring
  card already says.
- **Where a row of labels overflows, two of the three sites simply let it be cut.** Airtable adds
  no fade at all. Attio hides the scrollbar and cuts. Neither adds a count.

---

## 5. The legibility answer specifically

This is the failure that matters and the one with a clear industry answer.

### 5.1 Nobody shrinks

Across the eight sites that show dense product UI on a phone (Intercom, Superhuman, Stotles,
Vercel, Notion, Attio, Retool, Sage), **not one places a complete desktop window inside the 390 px
viewport.** Ranked by how often each technique appears:

| Technique | Count | Where |
|---|---|---|
| **Crop the frame and let it bleed off the right edge at near native scale** | 4 | Intercom, Superhuman, Stotles, Attio |
| **Author a phone width or near square asset, so oversample is about 1.0x** | 5 | Vercel, Framer, Intercom, Notion, Attio |
| **Zoom to a single panel with the surrounding app ghosted out** | 1 | Vercel |
| **Replace the capture with an illustration or diagram** | 4 | Tussell, Linear, Stripe, Figma |
| **Deliberate thumbnails nobody is expected to read** | 2 | Retool, Framer's showcase grid |
| **Autoplaying video instead of a still** | 3 | Airtable, Framer, Superhuman |
| **Shrink the whole desktop window to fit** | **0** | nobody |

### 5.2 Oversample is not the variable

Superhuman renders at 4.12x oversample and is perfectly readable. Stotles renders at 2.99x and is
readable. Intercom renders at 1.09x and is readable. This site renders `#product` at about 4.7x at
DPR 2 and is unreadable. **The variable that separates them is how much of the design is inside the
frame**, not how many source pixels are behind it.

The measure that predicts legibility is the ratio of painted CSS pixels to design CSS pixels:

- Intercom 358 painted / 390 design = **0.92**
- Vercel 342 / 390 = **0.88**
- Attio 390 / 390 = **1.00**
- Stotles, near square crop, roughly 348 / 430 estimated design region = **0.81**
- this site `#product` at 390: 306 / 1440 = **0.21**
- this site `#product` at 1440: 652.5 / 1440 = **0.45**

**Everything readable sits above 0.8. This site sits at 0.21 on a phone and 0.45 on a desktop.**

### 5.3 What that means for the crop

To reach 0.785, which is what a phone render would give at 306 px, the visible design region must
be at most 306 / 0.785 = **390 design px**, which is **780 px of the 2880 px master, 27 per cent of
its width**. That is not a small crop. It is one panel of the interface, which is exactly what
Vercel does and roughly what Intercom and Superhuman do.

On a tablet, a 731.9 px stage at 834 needs a design region of at most 932 px, which is **1,864 px
of the master, 65 per cent of its width**. Or, more simply, **the 2048x1536 tablet masters already
on disk are exactly right at that width**: 731.9 / 1024 = 0.715, which clears the floor. The three
drawn device sizes map onto three viewport bands almost precisely, and the site currently uses one
of them everywhere.

### 5.4 The correction to the brief's premise

The brief says phone renders of the product already exist and are currently shown on desktop. That
is true of the asset set as a whole and false for the case that fails.

- `#product` uses `sup-1-discover`, `sup-3-bid-no-bid`, `sup-2-tender-questions`,
  `buy-2-response-review`, `buy-4-delivery-oversight`. **All five are DESKTOP.**
- The four phone renders on disk are `sup-7-opportunity-detail`, `sup-8-action-centre`,
  `buy-7-evaluator-queue`, `buy-8-criterion-detail`. **Four different screens, not phone versions
  of the five stages.**
- `#workstation-tour` uses `buy-1` (D), `sup-5` (T), `sup-4` (D), `buy-3` (D), `buy-6` (T),
  `sup-8` (M). Only one of six has a phone render, and it already is one.

  > **CORRECTED 2026-08-31, AND THE SENTENCE ABOVE IS WHERE THIS WENT WRONG.** "It already is
  > one" asked whether the ASSET was a phone render. It never asked what FRAME the asset was
  > being shown in. `.wt__stage` is a 16/10 desktop bezel, so a 780x1688 portrait render sitting
  > in it reads as a phone photographed on a monitor, and this line recorded that as already
  > correct. The owner reported it twice. An earlier pass on 2026-08-31 then fixed
  > `object-fit: contain`, which had never run above 767px, and made the render display tidily
  > instead of making it right.
  >
  > `sup-8-action-centre` is out of the tour and the four portrait renders are out of
  > `SUPPLIER_SCREENS` and `BUYER_SCREENS`. **The tour is five slides, all landscape**, and the
  > two product carousels are six each. The files stay on disk, and `/partners` still shows
  > `sup-8-action-centre` in a portrait card with no desktop frame around it, which is the
  > honest way to show a phone. `astro/scripts/check-device-frames.js` now fails the build on a
  > portrait image inside either desktop frame, measured from the file's own header.
  >
  > Every measurement in this document is left exactly as it was taken. Only this composition
  > claim and the dot count in R4 are corrected, because those two describe the build rather
  > than a moment.

So "serve the phone render on a phone" **cannot be executed for `#product` today**. It can be
executed for exactly one slide of the tour, which is already correct. Building the plumbing without
the assets would ship a mechanism with nothing to switch to.

---

## 6. Standards, from primary sources

### WAI-ARIA Authoring Practices, Carousel pattern
<https://www.w3.org/WAI/ARIA/apg/patterns/carousel/>

- The container "has either role region or role group" with "the aria-roledescription property set
  to carousel". Each slide "has role group with the property aria-roledescription set to slide".
- Auto-rotation "stops when keyboard focus enters the carousel. It does not restart unless the user
  explicitly requests it to do so." It also "stops rotating whenever the mouse is hovering over the
  carousel."
- The tabbed variant uses "slide picker controls implemented using the tabs pattern" where
  "each control is a tab element, so activating a tab displays the slide associated with that tab".
  Of the button style it says "as each button adds an element to the page tab sequence, this style
  is the least friendly for keyboard users."

`Carousel.astro` already satisfies the hover and focus rules through `--pcar-play`, and its header
records the 2026-08-05 cascade defect where it did not. Nothing below should disturb that.

### WAI-ARIA Authoring Practices, Tabs pattern
<https://www.w3.org/WAI/ARIA/apg/patterns/tabs/>

- Left and Right Arrow move focus with wraparound. Home and End are optional and move focus to the
  first and last tab.
- "It is recommended that tabs activate automatically when they receive focus as long as their
  associated tab panels are displayed without noticeable latency."
- **The page contains no guidance whatsoever about what to do when a tab list exceeds the available
  width.** That gap is real and is why the reference sites all improvise.

### WCAG 2.2

- **2.2.2 Pause, Stop, Hide, Level A.** "For any moving, blinking or scrolling information that
  (1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with
  other content, there is a mechanism for the user to pause, stop, or hide it unless the movement,
  blinking, or scrolling is part of an activity where it is essential."
  <https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html>
- **2.1.1 Keyboard, Level A.** "All functionality of the content is operable through a keyboard
  interface without requiring specific timings for individual keystrokes, except where the
  underlying function requires input that depends on the path of the user's movement and not just
  the endpoints." <https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html>
- **2.5.8 Target Size (Minimum), Level AA.** "The size of the target for pointer inputs is at least
  24 by 24 CSS pixels, except when:" with the spacing exception "Undersized targets (those less
  than 24 by 24 CSS pixels) are positioned so that if a 24 CSS pixel diameter circle is centered on
  the bounding box of each, the circles do not intersect another target or the circle for another
  undersized target".
  <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>
- **2.5.5 Target Size (Enhanced), Level AAA.** "The size of the target for pointer inputs is at
  least 44 by 44 CSS pixels except when: Equivalent, Inline, User Agent Control, or Essential."
  <https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html>
- **1.4.10 Reflow, Level AA.** "Content can be presented without loss of information or
  functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content
  at a width equivalent to 320 CSS pixels ... Except for parts of the content which require
  two-dimensional layout for usage or meaning."
  <https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>

Every control on both carousels currently measures at least 44x44 and so clears both target size
criteria. Sage's 8x8 dots are the example of what not to do.

### GOV.UK Design System

The buyer this site sells to works inside this system daily.

- **There is no carousel, slider or slideshow component.** The index lists 40 components and none
  of them is one. <https://design-system.service.gov.uk/components/>
- Of tabs the system says: "Tabs hide content from users and not everyone will notice them or
  understand how they work", "Test your content without tabs first", and do not use tabs if users
  "need to read through all of the content in order" or "compare information in different tabs".
- On small screens **GOV.UK tabs stop being tabs**. The page states the component "displays tabbed
  content on a single page in order when JavaScript is unavailable" and "This is also how the
  component currently behaves on small screens, though more research is needed on this."
  <https://design-system.service.gov.uk/components/tabs/>

**That is a direct precedent for the strongest option below: below the breakpoint, render the five
stages as five headed sections in order.** It is also already this site's no-JS behaviour, since
`ProductScreens.astro` renders the panels visible and lets `tabs.ts` upgrade them.

### CSS mechanisms

- `::scroll-marker-group` and `::scroll-marker` would give a CSS-only dot row over a scroll-snap
  strip with zero JavaScript. MDN marks it **"Limited availability ... not Baseline because it does
  not work in some of the most widely-used browsers"** and **"Experimental"**.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/::scroll-marker-group>
  It degrades to a plain scroll strip, so it is safe as an enhancement and unsafe as the mechanism.
- `scroll-behavior: smooth` is **not** automatically suppressed under `prefers-reduced-motion`.
  MDN documents no such behaviour, so any smooth scrolling this component introduces must be gated
  explicitly. <https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior>

---

## 7. Recommendation

Framing decision first, because everything else follows from it.

> **Below 40rem, `#product` should stop being a carousel.** It should become a horizontal
> scroll-snap strip with edge peek and no autoplay, or, if the owner prefers the GOV.UK model,
> five stacked sections. It should not be a tabbed carousel with arrows, a counter and a pause
> button, because no reference site ships that shape on a phone and this one measurably does not
> fit.
>
> `#workstation-tour` is closer to correct already. Its dot row fits at 316 px, its slides are
> unlabelled positions rather than named stages, and a scroll-snap strip with markers is the
> natural shape. Its arrows should go, as `Carousel.astro`'s own phone rule already intends and
> does not reach.

Turning autoplay off below 40rem is the load bearing move, and it is worth stating why. It is not
only a preference. **With no automatic motion there is no moving content, so WCAG 2.2.2 requires no
mechanism, so the pause button has no job, so the second control row has no reason to exist.** One
decision removes three controls and one conformance obligation. It also removes the risk introduced
by any scroll based approach, where an autoplay that moves the scroll position under a reader's
thumb is a worse defect than the one being fixed.

### R1. The tab overflow

**Do not add a dropdown, do not wrap, do not shorten the labels.** The labels are the argument and
Sage proves that only short labels fit. The scroll and fade mechanism already in `TabSwitcher.astro`
is what Attio and Airtable do and is correct.

**Add the count, and take it from the row below rather than inventing it.** The counter node
already exists at 80 bytes and already says "2 OF 5". Moving it into the tab row, or rendering the
same information as a trailing "2/5" chip inside the trough, tells a reader both that there are
five and where they are, which is the one thing the fade cannot say.

Alternative, if the owner takes the GOV.UK route: below 40rem the tabs are `display: none` and the
five panels render in order with their headings. The panels are already in the HTML and already
server rendered visible, so this costs no HTML at all and deletes the problem rather than managing
it.

- **Byte cost, counter into the row:** 0 B HTML (the node moves), about 90 B CSS. Estimate.
- **Byte cost, GOV.UK stacking:** 0 B HTML, about 300 B CSS. Estimate.
- **Tokens:** `--radius-pill`, `--c-border`, `--c-card`, `--c-text-muted`, `--t-micro`,
  `--gutter`, `--stack-1`.
- **No-JS:** unaffected. The panels already render visible without the script.

### R2. The control stack

Below 40rem: no autoplay, therefore no pause control, therefore no second row. Keep exactly one
navigation mechanism.

- On `#product` keep the tab row, because it names the five stages and the names carry the
  argument.
- On `#workstation-tour` keep the dots (six when this was written, five since the phone render
  came out of the set on 2026-08-31) and drop both 46x46 arrows, which is what
  `Carousel.astro` already says should happen at this width and what the tour does not inherit.

- **Byte cost:** 0 B HTML. About 130 B CSS to hide the arrows and pause at the breakpoint, plus
  about 70 B to scope the autoplay animation rule to `(min-width: 40rem)`. Estimate.
- **Tokens:** `--btn-h-sm` (44px) stays the floor for anything that survives.
- **Accessibility:** 2.2.2 is satisfied by the absence of motion rather than by a control, which is
  a stronger position than the current one. 2.1.1 is unaffected, since `tabs.ts` keeps the roving
  tabindex, arrows, Home and End. If a scroll-snap strip replaces the track, the strip must remain
  reachable and operable by keyboard, and any smooth scroll must be gated behind
  `prefers-reduced-motion: no-preference` because the browser will not do it.

### R3. The legibility problem

Three options, in the order they should be taken.

**R3a. Prove it with a CSS crop of the masters already on disk. Recommended first move.**

Below 40rem, give `.pcar__screen` a phone aspect ratio and use `object-fit: cover` with a per-slide
`object-position`, so the frame shows a 780 px wide window of the 2880 px master. That lands the
scale at 0.785 and a 14 px design label at about 11 CSS px, which is the phone render's number
without a phone render.

Honest limits, both of which must be stated when it ships. The browser still downloads the full
master, so this buys legibility and not bytes. And the focal point is a number rather than an art
director's decision, so a badly chosen one crops the argument out of the frame. It is the cheapest
way to find out whether a crop reads before anyone draws anything.

- **Byte cost:** about 200 B CSS, plus about 40 B of HTML per slide if each carries its own
  `object-position` through a style attribute. 200 B for `#product`, 240 B for the tour. Estimate.
- **Tokens:** `--radius-frame`, `--c-border`, `--gutter`. A per-slide focal point is data, not a
  design value, and belongs in `crowmark-screens.ts` beside `width` and `height`.

**R3b. Author a phone crop per slide and art direct it. The shipped answer.**

A 780 px wide crop of the region that carries each stage's argument, exported AVIF, delivered as
the first `<source media="(max-width: 40rem)">` inside the existing `<picture>`. This is precisely
what Vercel, Intercom, Notion and Stripe do.

- **Byte cost, HTML:** about 118 B raw per slide. **590 B for `#product`, 708 B for the tour,
  1,298 B total** on a route already 2,080 B over budget. Estimate, raw not gzipped, because
  `check-budgets.js` measures the file on disk.
- **Byte cost, assets:** roughly 19 to 25 KB per crop in AVIF at 780 px, judged from the existing
  800w rungs. About 120 KB for five, 145 KB for six. All lazy, none on the critical path.
- **How to pay for the HTML:** each of these `<picture>` elements also carries a
  `<source type="image/webp">` at roughly 100 B. `astro/scripts/check-budgets.js` already records in
  writing that "the WebP tier of those sixteen screens is LARGER than the PNG tier on all 16 of 16
  files (1.94 MB against 1.13 MB)". Dropping that source from these eleven pictures saves about
  1,100 B raw and reaches nobody except Safari before 16.4, which still gets the PNG. **That very
  nearly funds the art direction source, and it is an owner decision, because the same file says
  retiring the tier "needs an owner decision because it deletes published assets".**
- **Tokens:** none new. The crop is asset work.
- **No-JS:** unaffected. `<source media>` is pure markup.

**R3c. Do the same at tablet width, using assets that already exist.**

At 834 the stage paints 731.9 px. A 2048x1536 tablet master at that width is 0.715 scale and reads.
A 2880x1800 desktop master at that width is 0.508 and does not. **The tablet masters on disk are
already the correct asset for the 768 to 1063 band.** Where a stage has no tablet sibling, a
1,864 px wide crop of the desktop master gives the same number.

- **Byte cost:** one further `<source media="(min-width: 40.0625rem) and (max-width: 66.4375rem)">`
  arm per slide, about 140 B raw each. Estimate. Only worth paying where the tablet asset exists.

**R3d. What not to do.** Letting the phone stage run full bleed from 306 px to 390 px raises the
scale only from 0.213 to 0.271 and a 14 px label from 2.98 to 3.80 CSS px. It is still unreadable
and it should not be presented as a fix.

### R4. The redundant navigation

Below 40rem the answer is one mechanism, and R2 delivers it. Above 40rem the case for three at once
is also weak, but that is outside this brief and should not be changed without its own measurement.

### R5. Two defects to close alongside, both outside the brief

**R5a. Give `#workstation-tour` the width ladder.** It fetches 440,673 B of masters at 390 to paint
six slides at 314 CSS px, when the correct rungs total 137,436 B. **303,237 bytes over-fetched on
the homepage on a phone.** The rungs were built on 5 August and are on disk unused.

- **Byte cost:** about 300 B raw HTML per slide for four rungs plus a `sizes` attribute,
  **about 1,800 B on the route**, against 296 KB saved on the wire. HTML goes up, the reader's
  download goes down by two orders of magnitude more. Estimate for the HTML, measured for the
  images.
- Note the tension with the budget honestly rather than hiding it. `htmlPerRoute` counts the 1,800
  and cannot see the 303,237.

**R5b. Correct `#product`'s `sizes`.** Its third arm resolves to 348 px at 390 and the image paints
at 306.0 px, a 13.7 per cent overstatement. Harmless at DPR 2, wrong in a load bearing attribute.
Zero byte change.

### Byte ledger

| Item | HTML, raw | CSS | Assets | Wire effect |
|---|---|---|---|---|
| R1 counter into the tab row | 0 | ~90 B | 0 | none |
| R1 alt, GOV.UK stacking | 0 | ~300 B | 0 | none |
| R2 no autoplay, no pause, no arrows below 40rem | 0 | ~200 B | 0 | none |
| R3a CSS crop proof | ~200 B (`#product`) | ~200 B | 0 | none |
| R3b phone crops, art directed | +590 B / +708 B | 0 | ~265 KB lazy | legibility |
| R3b funding, drop the webp source | **-1,100 B** | 0 | 0 | none |
| R3c tablet arm where an asset exists | +140 B per slide | 0 | 0 | legibility |
| R5a tour width ladder | +1,800 B | 0 | 0 | **-303,237 B** |
| R5b `sizes` correction | 0 | 0 | 0 | none |

Route stands at 104,480 B against 102,400 B. R1, R2, R3a and R5b are byte neutral or better. R3b
pays for itself if the webp tier goes. R5a does not, and needs its own argument.

---

## 8. What I could not establish

- **Whether any of these sites tested any of this.** No public evidence of A/B results, swipe
  rates, or how often a phone reader reaches slide 2. Everything above is what the sites do, not
  what the sites learned.
- **Keyboard behaviour of the reference scroll-snap strips.** I measured DOM and computed styles.
  I did not drive Tab, arrow keys or Home and End on Stripe, Linear, Notion or Attio, so I cannot
  say whether their strips are keyboard operable.
- **Whether the reference sites hide controls below a breakpoint or never render them.** I observed
  390 px only. A site that shows arrows at 1440 and hides them at 390 is indistinguishable here
  from one that has none.
- **Cookie banners covered part of seven pages** (Intercom, Attio, Stotles, Figma, Airtable,
  Superhuman, Sage). Content behind the banner at the moment of capture was not observed, and
  Stotles' carousel autoplay in particular could not be judged.
- **Whether the `-mobile` assets on Stripe and Vercel are crops of a desktop render or separately
  drawn.** Filenames and dimensions say phone shaped. Which of the two, I cannot tell from outside.
- **Whether Figma's nine `Play` buttons are per-slide media controls or carousel controls.** I read
  the accessible names, not the handlers.
- **Whether Attio's nine item row is a scroll marker group.** A nine item indicator row beside a
  nine slide carousel is consistent with it and is not proof.
- **Gzip figures.** Every HTML byte quoted is raw, because `check-budgets.js` measures the file on
  disk. Compressed cost will be much lower and is not what the gate reads.
- **320 px.** All local measurement was at 390, 768, 834, 1024 and 1440. `Carousel.astro`'s own
  comments record a clipped overflow defect at 320 that WCAG 1.4.10 contemplates and I did not
  re-measure it.
- **Real devices.** Everything was Chromium with `isMobile` and `hasTouch` emulation. No iOS or
  Android hardware, and therefore no judgement on real swipe feel, momentum or snap behaviour.
- **The 10 CSS px readability floor.** It is a working threshold consistent with the reference set,
  not a figure from a standard. WCAG sets no minimum text size in an image. If the owner wants a
  different floor, every scale figure above rescales linearly from it.
