Here is my instruction for all the items you flagged -
•	ID: W7 "Newsletter on 4 pages" My suggestion is to keep this only for about & contact page and remove from all other pages.
•	ID: W8 "Logo wall on 3 pages" – Remove these from all the pages where implemented, not needed at all.
•	ID: W9 "Canonical CSS shipped + verified" – This must be done, zero exception.
•	ID: W11 What I claimed: "4 product pages", chapter nav – must be done for all the product so do it for csrd.html + crowesg.html 
•	ID: W1 / W2 -   What I claimed: "Cascade behavior applies" – Must fixed this
•	ID: Y2 critical-CSS -   What I claimed: "Rolled out to 59 pages" – This must be fixed
•	ID: Y7 CSP -   What I claimed: "Moderate-tight shipped" – Must be fixed
•	ID: Q3 anchor-positioning – Must fix this
•	ID: Q7 inert -   What I claimed: "Adopted" – Must be fixed
•	ID: Q8 scroll-driven animations – Must be done and fixed
•	ID: V2 native nesting -   What I claimed: "Adopted in new blocks" - Must be fixed
•	ID: V6 subgrid  - Must be fixed  
•	 ID: X8 cross-browser – Ok just execute and fix failed test
•	ID: Visual baselines (X7/Y4) – must be done at the end 
•	ID: Theme toggle (W10) – must be tested and fix if any issue
•	ID: Cookie-banner WCAG fix – must be tested and fix if any issue
You are claiming false by saying 75% done, in actually when I have tested I found several issues all across, so much things you are claiming are not in the reality and you have compromised, missed,   altered, deferred and ignored a lot in all the phases. I might not be able to tell all as there are so many and in every pages has several alignment issues however here is key items list and I’m not sure how many times do I need to repeat the same. you must fix these along with all the partially done, missed, ignored and deferred work items
Form page - http://localhost:8092/partners  remove these
•	Customer stories · coming soon
•	Built for UK commercial property managers, public-sector suppliers, and SME finance teams
•	Customer stories Real case studies arriving Q3 2026  Card
Form home page http://localhost:8092/
•	Fix hero top section messages and animations alignment etc.
•	Demo is missing from home page
•	How it works section 4 steps screens auto play are not displaying and also can see alignment issue with below cards in same section
•	home page bottom section "Start with the workflow you need now" due to card length bottom section is trimmed.
•	Home page had scroll progress bar in top but missing from last 3 days
•	Back to up button is hiding behind cookies banner so make sure always show front of banner instead of back.
•	In Our methodology section, this text is misaligned  from its heading, here is the text para - CrowAgent does not generate compliance opinions. This must be centrally aligned. I am not sure can we force such things globally instead of fixing individually. 
•	Header overlap: Sticky nav or TOC overlaps the main heading when scrolled, hiding the page title.
•	Crowded hero: Top navigation and hero content sit too close, reducing breathing room and hierarchy.
•	Inconsistent card heights: Summary and feature cards have uneven heights, producing ragged rows.
•	Grid misalignment: Multi-column grids show uneven gutters and misaligned columns at medium widths.
•	CTA inconsistency: Primary and secondary CTAs vary in size, weight, and alignment across the section.
•	Text wrapping: Long labels and titles wrap awkwardly and push adjacent content out of alignment.
•	Baseline misalignment: Badges, icons, and chips are not baseline-aligned with their text.
•	List indent issues: Bullet and numbered lists use inconsistent left indents across sections.
•	Tight line-height: Dense paragraphs use low line-height and small font, creating hard-to-scan blocks.
•	Low contrast links: Inline links and CTAs use low-contrast colors against body text.
•	Empty placeholders: Cards or panels show empty/placeholder-like gaps that look unfinished.
•	Button spacing: Buttons sit too close to card edges or other elements, reducing tap targets.
•	Modal clipping: Dialogs or embedded iframes are not centered and can clip on small screens.
•	Table alignment: Tables have uneven column widths and misaligned header/value rows.
•	Icon centering: Icons and chevrons are not vertically centered with their labels.
•	Animation polish: Expand/collapse and hover animations feel abrupt or stutter, lacking easing.
•	Layout shift: Content load causes CTAs, headings, or cards to jump when assets render.
•	Mobile collapse: Breakpoints collapse multi-column layouts into cramped single-column stacks with small tap targets.
•	Divider faintness: Section dividers are too faint or inconsistently placed, failing to separate content.
•	Footer proximity: Footer and meta controls sit too close to the last content block, reducing breathing room.



From product pages issues – All the product pages

•	Visible video placeholder: "Hover to play. Drop a 16:9 demo video here." shown on the page. 
•	Duplicate "Product walkthrough" headings/content (appears as a placeholder and again as a real section). 
•	Repeated CTAs ("See pricing", "Start free trial") in multiple places, causing visual clutter. 
•	Odd CTA label with close icon: "Start free trial ×" shows a close/× inline with the CTA text. 
•	Unclear/dangling sentence fragments in step descriptions (e.g., "No manual data entry, single property or bulk CSV across a portfolio."). 
•	Security/feature badges run together without separators (AES-256 at rest TLS 1.3 in transit) making them hard to scan. 
•	Inconsistent brand spacing/formatting ("CrowAgent" vs "Crow Agent") visible in header/footer. 
•	Dynamic counter text placement ("MEES 2028 deadline: 683 days remaining") appears inline and may overlap other hero content. 
•	Footer content crowded and duplicated company info (company number, registration lines, cookie preferences) with poor spacing. Remove this complete line  - CrowAgent Ltd · Company No. 17076461, Registered in England & Wales · ICO data controller registered. Update this line © 2026 CrowAgent Ltd. All rights reserved. Sustainability•Intelligence. By adding Registered in England & Wales and remove Sustainability•Intelligence so final text will be © 2026 CrowAgent Ltd. All rights reserved. Registered in England & Wales. This musyt be fixed for all the footers in all the pages everywhere.
•	Multiple short lines of meta text in hero area (e.g., "Skip to main content Now live · 14-day free trial · No credit card required") create visual noise and possible focus/order issues. 
•	This complete section is very left instead of aligning centered so fix this - Start your MEES compliance assessment today
•	Why learn more about the calculation is hidden behind the product walkthrough video placeholder ? fix this
•	Broken or missing images/icons visible as empty frames or generic placeholders.
•	Low color contrast on some text against background, reducing readability.
•	Inconsistent font sizes and weights across headings and body copy.
•	Misaligned grid/cards (uneven gutters and baselines between columns).
•	Text overflow without truncation (lines run outside containers or get cut off).
•	Layout not responsive at narrow widths (elements stack poorly or overlap).
•	Missing alt text for decorative/functional images (no visible accessibility labels).
•	Form fields or inputs lack visible labels or have placeholder text used as labels.
•	Placeholder copy visible (e.g., lorem/templated sentences left in UI).
•	Inconsistent button styles (different shapes, paddings, and hover states for same-action CTAs).
•	Elements styled as links but not interactive (cursor/link affordance mismatch).
•	Insufficient or missing keyboard focus outlines on interactive controls.
•	Overlapping elements or z-index issues (content layered on top of other UI).
•	Inconsistent capitalization and punctuation across UI text and buttons.

Here is all the issues from Cookie Policy - CrowAgent | Plain English Cookie & Tracking Policy page
•  Sticky table of contents overlaps page heading when scrolled, hiding section titles. 
•  Left-aligned grid causes uneven right-hand whitespace and inconsistent column widths.
•  TL;DR and main body text sizes are inconsistent, creating a jarring visual hierarchy.
•  Per-cookie table columns misalign on narrow viewports, producing horizontal scroll and clipped cells.
•  Table row headers and cell content are vertically misaligned, making rows hard to scan.
•  Long cookie names wrap awkwardly and overlap adjacent columns or icons.
•  Consent buttons and “Manage cookie preferences” CTA differ in size and visual weight.
•  Category accordion chevrons and labels are not vertically centered with their text.
•  Chip-style email elements overflow their container and create uneven line breaks.
•  “Load scheduler” button placement shifts when Calendly is consent-gated, causing layout jump.
•  Inconsistent spacing between numbered sections and their following paragraphs.
•  Section dividers are too faint; low contrast makes separation unclear.
•  Some badges and region labels are misaligned with adjacent text baseline.
•  Sticky TOC scroll spy highlight does not align precisely with section in-view.
•  Empty or placeholder-like gaps appear inside the compliance overview grid.
•  Footer content sits too close to the last section, reducing visual breathing room.
•  Bullet lists and numbered lists have inconsistent left indents across sections.
•  Mobile breakpoints cause buttons and chips to shrink unevenly, harming tap targets.
•  Error/notice text (if present) uses same color as body text, reducing visibility.
•  Accordion open/close animation stutters or lacks easing, feeling unpolished.
Here is all the issues from Terms of Service - CrowAgent | Compliance Software page
•  Sticky "On this page" table of contents overlaps main heading when scrolled. 
•  Summary grid (six clause highlights) uses inconsistent card sizes and uneven spacing. 
•  "Subscription rules at a glance" grid columns misalign and cause cramped text in cells. 
•  Long clause titles wrap awkwardly and push adjacent content out of alignment.
•  Section numbers (1., 2., 3.) sit too close to headings, reducing readability.
•  Permitted vs Prohibited lists under Acceptable Use have inconsistent bullet indents and spacing. 
•  Table-like layouts (billing, refunds) lack consistent vertical alignment between headers and values.
•  CTA buttons (Start free trial, Request DPA, Contact Support) vary in size and visual weight.
•  Links and inline CTAs use low-contrast color against background, hurting visibility.
•  "AI Output Disclaimer" paragraph text size and weight compete with section headings. 
•  Status and badge elements (e.g., uptime, status page) are misaligned with surrounding text.
•  Dense legal paragraphs create large visual blocks with insufficient line-height and margins.
•  Horizontal rules/dividers are too faint and inconsistent, failing to separate sections clearly.
•  Footer and "Cookie preferences" controls sit too close to the last content block, reducing breathing room.
•  Action links (Request DPA, Contact Support) appear as plain text and lack clear button affordance.
•  Mobile breakpoint causes multi-column grids to collapse poorly, producing cramped single-column stacks.
•  Inline code or numeric values (e.g., "99.5 %") are not visually distinct and disrupt text rhythm. 
•  Empty or placeholder looking gaps appear inside resource lists and the compliance overview area.
•  Navigation anchors in the TOC do not visually indicate the active section reliably when scrolled.
•  Any open/close animations for sections feel abrupt or are missing easing, making interactions feel unpolished.

Here is all the issues from Privacy Policy - CrowAgent | Compliance Software

•  Sticky "On this page" table of contents overlaps the main heading when scrolled. 
•  Top navigation and page header crowd the hero area, reducing breathing room and visual hierarchy. 
•  Retention periods table uses uneven column widths and misaligned rows, making values hard to scan. 
•  Cookies and consent table columns are cramped and cause text wrapping that breaks alignment. 
•  Sub-processor grid (name / region / purpose / DPA) shows inconsistent card sizes and misaligned cells. 
•  Section numbers sit too close to headings, reducing readability and visual separation.
•  Dense legal paragraphs form large unbroken blocks with low line-height and poor margins.
•  Action CTAs (Request DPA, Contact DPO, Start free trial) vary in size and visual weight across the page.
•  Inline links and contact emails use low-contrast color, hurting visibility against body text.
•  Bullet lists (rights, contact channels) have inconsistent left indents and spacing.
•  Long clause titles and labels wrap awkwardly and push adjacent content out of alignment.
•  Badges and status labels (ICO registered, ISO 27001) are not baseline-aligned with surrounding text.
•  Empty or placeholder-like gaps appear inside the resources/compliance overview area.
•  Footer content sits too close to the last section, reducing visual breathing room.
•  Mobile breakpoint collapses multi-column grids poorly, producing cramped single-column stacks.
•  Inline code/numeric values (percentages, retention days) are not visually distinct and disrupt rhythm.
• Overlap of text and tick bullet point, fix all
•  Accordion chevrons and section toggles are not vertically centered with their labels.
•  Session-replay and Sentry details appear as dense table rows with inconsistent vertical alignment.
•  Sticky TOC scroll spy highlight does not reliably match the section in view.
•  Any open/close animations for accordions or TOC feel abrupt or lack easing, appearing unpolished.


Here is all the issues from Security - CrowAgent | Compliance Software
•  Sticky "On this page" TOC overlaps the main heading when scrolled, hiding the page title.
•  Hero header and top nav crowd the security summary, reducing breathing room and hierarchy.
•  Key metrics cards (uptime, incidents) have inconsistent heights and uneven spacing.
•  Audit log table columns misalign and produce horizontal scrolling on medium viewports.
•  Timestamp and event text in the logs are vertically misaligned with icons.
•  Severity badges and status chips are not baseline-aligned with adjacent text.
•  Action buttons (Export, Filter, Download) vary in size and visual weight across the toolbar.
•  Filter chips overflow their container and wrap awkwardly, causing layout shifts.
•  Search input and clear icon are misaligned, making the clear control hard to tap.
•  Key/value pairs (e.g., key name / value) in details panel lack consistent column alignment.
•  Code snippets and copy buttons overlap on narrow screens, obscuring the copy affordance.
•  Modal dialogs (view event, confirm) are not centered and sometimes clip on small screens.
•  Empty state placeholders appear as large blank cards with no explanatory text.
•  Graphs and charts resize poorly, causing axis labels to overlap or truncate.
•  Inline help tooltips overlap nearby text and are clipped by container edges.
•  Accordion chevrons are not vertically centered with their section labels.
•  Section dividers are too faint and inconsistent, failing to separate dense content blocks.
•  Dense policy/legal text blocks use low line-height and small font, reducing readability.
•  Buttons inside tables (View, Acknowledge) shift position when rows wrap, breaking alignment.
•  Mobile breakpoint collapses multi-column grids into cramped single-column stacks.
•  Animations for expanding details stutter or lack easing, feeling unpolished.
•  Footer and contact controls sit too close to the last content block, reducing breathing room.

Here is all the issues from Partners - CrowAgent | Compliance Software
•  Sticky "On this page" TOC overlaps the main heading when scrolled, hiding the page title.
•  Hero heading and subheading are too close, reducing visual hierarchy and breathing room.
•  Partner logo grid items have inconsistent sizes and vertical alignment.
•  Logo cards wrap unevenly at breakpoints, creating irregular gutters and ragged rows.
•  Partner cards have inconsistent padding causing text and logos to appear off-center.
•  CTA buttons (Become a partner / Contact) differ in width and visual weight.
•  Partner description text wraps into the logo area on narrow viewports.
•  Grid gutters are uneven between rows, producing visible horizontal misalignment.
•  Card shadows and borders are inconsistent, making the layout feel unpolished.
•  Some partner cards show empty placeholder space that looks like missing content.
•  Badges and status chips are not baseline-aligned with card titles.
•  Bullet lists under partner benefits have inconsistent left indents and spacing.
•  Icons inside cards are not vertically centered with their labels.
•  CTA and secondary links sit too close to card edges, reducing tap targets.
•  Section divider line is too faint and misaligned with content columns.
•  Mobile breakpoint collapses multi-column partner grid into cramped single-column stacks.
•  Text contrast on some partner names/links is low, hurting readability.
•  Hover/focus states for cards and links are inconsistent or missing.
•  Animation for card hover or reveal stutters or lacks easing, feeling abrupt.
•  Footer or next-section content sits too close to the last partner row, reducing breathing room.

Here is all the issues from Contact - CrowAgent | Compliance Software
•  Sticky TOC overlaps the main heading when scrolled, hiding the page title.
•  Hero area and top nav crowd the contact form, reducing breathing room.
•  Contact form labels are not vertically aligned with their input fields.
•  Input placeholders use low-contrast text, hurting readability.
•  Validation/error messages overlap inputs or push layout unexpectedly.
•  Submit button size and weight differ from secondary CTAs, breaking visual hierarchy.
•  Checkbox and consent controls are misaligned with their labels.
•  Form field heights are inconsistent across the form, creating a ragged column.
•  Map/iframe placeholder appears as an empty box with no explanatory content.
•  Social icons and contact links are not baseline-aligned with adjacent text.
•  Spacing between sections is inconsistent, producing awkward large and small gaps.
•  Footer sits too close to the last content block, reducing breathing room.
•  Mobile breakpoint collapses form fields and CTAs into cramped stacks with small tap targets.
•  Inline help text and hints use the same color as body copy, reducing visibility.
•  Breadcrumbs or page path are misaligned with the main heading.
•  Card or panel shadows are inconsistent, making components feel visually disconnected.
•  Focus outlines on inputs and buttons are missing or too subtle for keyboard users.
•  Animation for form interactions (open/submit) stutters or lacks easing.
•  Button and link contrast is low in places, reducing perceived affordance.
•  Empty placeholder elements (cards/boxes) appear without labels, looking like missing content.

Here is all the issues from Roadmap - CrowAgent | Compliance Software

•  Sticky "Skip to main content" or TOC overlaps the page heading when scrolled. 
•  Hero area feels crowded by top nav and utility links, reducing breathing room. 
•  Roadmap timeline items use inconsistent card heights, producing a ragged grid. 
•  Phase labels (Planned · In progress · Shipped) and dates are misaligned with item titles. 
•  Long feature names wrap awkwardly and push adjacent content out of alignment. 
•  Column widths in the roadmap list are uneven, causing visual imbalance and horizontal gaps.
•  Status badges and icons are not baseline-aligned with their text labels.
•  CTA buttons (Start free trial) differ in size and visual weight from surrounding CTAs. 
•  "Last updated" and meta text compete visually with headings due to similar weight/size. 
•  Grid gutters are inconsistent between rows, creating visible misalignment.
•  Empty or placeholder-like gaps appear in the product/feature overview area. 
•  Dense paragraph blocks (product descriptions/legal) use low line-height and small font, reducing readability. 
•  Links and inline CTAs use low-contrast color, hurting visibility against body text.
•  Section dividers are too faint and inconsistently placed, failing to separate content clearly.
•  Bulleted lists and timeline bullets have inconsistent left indents across sections.
•  Mobile breakpoint collapses multi-column roadmap into cramped single-column stacks.
•  Hover and focus states for roadmap items and CTAs are inconsistent or missing.
•  Any open/close or reveal animations for roadmap items feel abrupt or lack easing.
•  Footer and cookie/status controls sit too close to the last content block, reducing breathing room. 
•  Action links (e.g., changelog, resources) appear as plain text and lack clear button affordance.

Here is all the issues from About - CrowAgent | Compliance Software

•	Sticky "On this page" TOC overlaps the main heading when scrolled, hiding the page title.
•	Hero heading and subheading sit too close, reducing visual hierarchy and breathing room.
•	Intro summary cards have inconsistent heights and uneven horizontal gutters.
•	Feature/benefit grid columns misalign, producing ragged rows and irregular whitespace.
•	Primary CTA and secondary links differ in size and weight, breaking visual hierarchy.
•	Long paragraph blocks use low line-height and small font, creating dense, hard-to-scan text.
•	Bulleted lists have inconsistent left indents and spacing across sections.
•	Icons and badges are not baseline-aligned with their labels.
•	Cards show empty placeholder space that looks like missing content.
•	Images or logos bleed to card edges due to inconsistent padding.
•	Section dividers are too faint and inconsistently placed, failing to separate content.
•	Inline links use low-contrast color, reducing visibility against body text.
•	Accordion chevrons and labels are not vertically centered.
•	Tables (if present) have uneven column widths and misaligned cells.
•	Buttons and chips shrink unevenly at mobile breakpoints, harming tap targets.
•	Modal or embedded iframe placeholders appear as empty boxes with no explanatory text.
•	Hover and focus states for interactive elements are inconsistent or missing.
•	Animations for reveals or accordions feel abrupt or lack easing.
•	Footer sits too close to the last section, reducing visual breathing room.
•	Any status or meta text competes with headings due to similar size/weight.


Here is all the issues from Resources - CrowAgent | Compliance Software

•  Sticky table of contents or skip link overlaps the main heading when scrolled, hiding the page title. 
•  Hero area and top navigation crowd the header, reducing breathing room and visual hierarchy. 
•  Free tools grid cards show inconsistent heights and uneven horizontal gutters. 
•  Tool cards and long tool names wrap awkwardly and push adjacent content out of alignment. 
•  “View all tools” and other CTAs vary in size and visual weight across the section. 
•  Summary and guide list blocks form dense text masses with low line-height and poor margins.
•  Section numbers or meta labels sit too close to headings, reducing readability.
•  Grid columns (guides, tools, resources) misalign at medium breakpoints, creating ragged rows.
•  Badges and security labels (AES 256, TLS, ISO) are not baseline-aligned with surrounding text.
•  Inline links and CTAs use low-contrast color against body text, hurting visibility.
•  Empty or placeholder-like gaps appear inside the resources or tools area, looking unfinished.
•  Footer and cookie/status controls sit too close to the last content block, reducing breathing room.
•  Bulleted lists and article meta (read time, date) have inconsistent left indents across sections.
•  Hero subheading and tagline text sizes compete with section headings, weakening hierarchy.
•  Images or logos (if present) bleed to card edges due to inconsistent padding.
•  Mobile breakpoint collapses multi-column grids into cramped single-column stacks with small tap targets.
•  Hover and focus states for cards and links are inconsistent or missing.
•  Accordion or reveal animations (if used) feel abrupt or lack easing, appearing unpolished.
•  Search or filter controls (if present) are misaligned with their labels or icons.
•  Any map/iframe or embedded widget appears as an empty box with no explanatory placeholder.

Here is all the issues from all the blogs pages – 
•  Sticky TOC overlaps the main page title when scrolled, hiding the heading.
•  Hero heading and subheading sit too close, reducing visual hierarchy.
•  Hero image or banner bleeds into the header area, creating cramped top spacing.
•  Lead paragraph line-height is tight, producing a dense, hard-to-scan block.
•  Intro CTA and secondary link differ in size and weight, breaking hierarchy.
•  Section headings and their numeric markers are misaligned vertically.
•  Paragraph text and inline links use low-contrast color, hurting readability.
•  Step-by-step list bullets and step numbers are not aligned with their text.
•  Code snippets overflow their container or cause horizontal scrolling on medium viewports.
•  Inline code styling lacks sufficient contrast and padding, reducing legibility.
•  Images or screenshots are inconsistent sizes and not baseline-aligned with captions.
•  Callout boxes (tips/warnings) have inconsistent padding and uneven vertical spacing.
•  Buttons inside content (e.g., "Read more", "Download") shift position when images load.
•  Long list items wrap awkwardly and push adjacent content out of alignment.
•  Table columns (if present) have uneven widths and misaligned cells.
•  Anchor links in the TOC do not reliably highlight the active section when scrolled.
•  Empty or placeholder-like gaps appear between content blocks, looking unfinished.
•  Mobile breakpoint collapses multi-column content into cramped single-column stacks.
•  Form fields or subscription inputs (if present) have labels misaligned with inputs.
•  Any expand/collapse or scroll animations feel abrupt or stutter, appearing unpolished.

Here is all the issues from FAQ - CrowAgent | Compliance Software page
•  Sticky "On this page" TOC overlaps the main heading when scrolled, hiding the page title.
•  Hero heading and FAQ intro sit too close, reducing breathing room and hierarchy.
•  Search input in the FAQ header is misaligned with its label and clear icon.
•  Question list bullets and numbering are not vertically aligned with question text.
•  Accordion chevrons are not centered with their question labels.
•  Expanded answers have inconsistent top/bottom padding, creating ragged spacing between items.
•  Long answers wrap and push adjacent content out of alignment or cause horizontal scroll.
•  Answer text sometimes overlaps adjacent UI elements on narrow viewports.
•  Inline code blocks and examples overflow their containers and cause horizontal scrolling.
•  Tables (if present) use uneven column widths and misaligned header/value rows.
•  Icons next to questions or answers are not baseline-aligned with text.
•  CTA buttons (contact/support) vary in size and visual weight across the section.
•  Links inside answers use low-contrast color, reducing visibility against body text.
•  Filter chips or category tags overflow their container and wrap awkwardly.
•  Empty or placeholder-like cards appear in the resources or related-questions area.
•  Section dividers are too faint and inconsistently placed, failing to separate topics clearly.
•  Focus outlines on interactive elements are missing or too subtle for keyboard users.
•  Accordion open/close animation is abrupt or stutters, feeling unpolished.
•  Mobile breakpoint collapses multi-column FAQ layouts into cramped single-column stacks.
•  Footer sits too close to the last FAQ item, reducing visual breathing room

Here is all the issues from UK Sustainability Compliance Glossary - CrowAgent
•  remove this text from headline - UK compliance terms in plain English
•  Sticky "Skip to main content" or TOC overlaps the page heading when scrolled, hiding the title. 
•  Search input and label alignment in the glossary header are inconsistent, making the search control look off kilter. 
•  Intro hero and nav crowd the top of the page, reducing breathing room and hierarchy. 
•  Summary/feature chips (e.g., "Try CSRD Checker", security badges) vary in size and weight, breaking visual rhythm. 
•  Glossary term cards and list items have inconsistent vertical spacing, producing a ragged list flow. 
•  Long term names and clause lines wrap awkwardly and push adjacent content out of alignment. 
•  Table like elements (e.g., regulation details, fines) show uneven column widths and misaligned rows. 
•  Action CTAs (Start free trial, Try CSRD Checker, See all free tools) differ in size and visual weight. 
•  Inline badges and status labels are not baseline aligned with surrounding text. 
•  Dense definition paragraphs use low line height and small font, creating hard to scan blocks. 
•  Section dividers and separators are faint or inconsistent, failing to clearly separate glossary sections. 
•  Bullet and list indents are inconsistent across term entries, harming scannability. 
•  Some cards or tool links appear as empty or placeholder like gaps in the Free Tools / Resources area. 
•  Footer and legal meta sit too close to the last content block, reducing visual breathing room. 
•  Links and inline CTAs use low contrast colors against body text, reducing visibility. 
•  TOC scroll spy or anchor highlighting does not reliably indicate the active section while scrolling. 
•  Mobile breakpoint likely collapses multi column lists into cramped single column stacks with small tap targets. 
•  Icons and small UI elements (security badges, company meta) are not vertically centered with labels. 
•  Any reveal/expand interactions (term details) lack smooth easing or feel abrupt. 
•  Search suggestions or term links may shift layout when results render, causing content jump. 

Here is all the issues from Changelog - CrowAgent | Compliance Software Release Notes
•  Sticky TOC overlaps the page heading when scrolled, hiding the title. 
•  Top nav and hero content crowd the header, reducing breathing room and hierarchy. 
•  Changelog entries form dense unbroken blocks with low line-height and poor paragraph spacing. 
•  Date and entry metadata are not visually separated from body text, making entries hard to scan. 
•  Subscribe RSS control sits too close to surrounding text and lacks clear affordance. 
•  Summary/feature cards (marketing surface highlights) have inconsistent heights and uneven gutters. 
•  CTA buttons (Start free trial, Try CSRD Checker) vary in size and visual weight across the main area. 
•  Long item titles wrap awkwardly and push adjacent content out of alignment. 
•  Grid and list columns misalign at medium widths, producing ragged rows and horizontal gaps. 
•  Badges and security labels are not baseline-aligned with surrounding text, appearing off-center. 
•  Empty or placeholder-like gaps appear in the Free Tools / resources area, looking unfinished. 
•  Hero tagline and meta text compete with headings due to similar size and weight. 
•  Inline links and CTAs use low-contrast color against body text, reducing visibility. 
•  Section dividers are faint and inconsistently placed, failing to separate changelog entries clearly. 
•  Footer and cookie/status controls sit too close to the last content block, reducing breathing room. 
•  Numbered or dated markers sit too close to headings, reducing readability and scanability. 
•  Images or logos (if present) bleed to card edges due to inconsistent padding. 
•  Any reveal or list-rendering animations feel abrupt or lack easing, appearing unpolished. 
•  Mobile breakpoint likely collapses multi-column sections into cramped single-column stacks with small tap targets. 
•  Content load causes layout shifts (CTAs and headings move when assets render), producing jarring jumps. 

Here is all the issues from free tools http://localhost:8092/tools/*

•  Sticky skip/TOC area overlaps the page heading when scrolled, hiding the title. 
•  Top nav and hero copy crowd the hero, reducing breathing room and hierarchy. 
•  Primary tool panel (calculator) and form controls are not visually centered, producing an off balance layout. 
•  Input fields (rateable value, EPC band, breach length) have inconsistent heights and misaligned labels. 
•  Long inline explanatory text wraps awkwardly and pushes adjacent controls out of alignment. 
•  Result cards (penalty exposure / Band C verdict) use inconsistent card heights and uneven gutters. 
•  Statute citation and methodology block is dense, with low line height and poor paragraph spacing. 
•  Numeric values and currency figures are not visually distinct (poor typographic emphasis), reducing scanability. 
•  “See the full product” / secondary CTAs differ in size and visual weight from the primary CTA. 
•  Feature/process steps (1/2/3) have numbers sitting too close to headings, reducing readability. 
•  Free tool vs paid product comparison blocks form large visual masses with inconsistent spacing. 
•  Methodology min/max figures and percentage rules run together, causing cramped inline math and poor legibility. 
•  Security badges and meta (AES 256, TLS, ISO, ICO) are not baseline aligned with surrounding text. 
•  Footer and company meta sit too close to the last content block, reducing breathing room. 
•  Empty or placeholder looking gaps appear in the Free Tools list and resource area, looking unfinished. 
•  Inline links and CTAs use low contrast color against body text, hurting visibility and affordance. 
•  Bulleted lists and explanatory lines have inconsistent left indents across sections. 
•  Any reveal/expand interactions (methodology, full product details) lack smooth easing and feel abrupt. 
•  Mobile breakpoint likely collapses multi column tool layout into cramped single column stacks with small tap targets. 
•  Content load causes layout shifts (CTAs, headings, or result cards move when assets render), producing jarring jumps. 

