/* nebula-shotpanels.js

   The product captures in /Assets/shots/dark were taken from a live but
   almost empty demo account. Several of them read 0%, "not generated",
   a dash, or a chart with nothing in it. This file paints a worked
   EXAMPLE over the empty regions of those screens and animates it in once:
   counters count up, bars grow, lines and arcs draw, covers fade off in
   sequence. Then it stops. Nothing loops and nothing drifts.

   ONE SOURCE OF TRUTH. Each screen's overlay is defined exactly once,
   below, and stamped into every frame on the site that shows that
   screenshot. That is what guarantees the same product screen shows the
   same figures on every page. The CrowMark analytics and CrowESG reports
   overlays are the same worked example the homepage uses
   (js/nebula-livepanels.js), so the numbers agree there too.

   Every coordinate is a pixel of the 2400x1600 source PNG, measured off
   it, and every painted rectangle is filled with a surface colour sampled
   from the same PNG, which is why there is no seam where the overlay
   meets the screenshot. The overlay box is placed onto the image's own
   rendered rectangle, so it tracks object-fit: cover, contain or fill and
   the crop those imply.

   Behaviour:
   - One shared requestAnimationFrame loop drives every track. It runs only
     while at least one overlay is mid-entrance.
   - An IntersectionObserver starts each overlay when its frame scrolls in,
     and the loop is dropped when the frame leaves or the page is hidden
     (the overlay then snaps to its true final values, never half-drawn).
   - prefers-reduced-motion: reduce paints the final values immediately.
   - The animating layer is aria-hidden and a matching text alternative is
     placed beside it, so nothing is announced digit by digit.
*/
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CrowMark analytics. The account behind this screen holds one
     contract, so four of its panels are blank. The example fills them
     with one internally consistent 90-day picture for a small UK
     supplier: 22 contracts, of which 3 draft, 4 profiling, 2 evidence,
     6 won and 7 lost. 6 of 13 terminal bids is the 46% win rate, the
     monthly win rates resolve to the same 6 of 13, and the sector split
     sums to the same 22. Identical to the homepage overlay.
     ------------------------------------------------------------------ */
  var MARK_ANALYTICS =
    '<svg class="nsp-svg" viewBox="0 0 2400 1600" preserveAspectRatio="none" focusable="false">' +
      /* KPI tiles: figure and comparison line replaced on each of the four */
      '<rect class="fill-card" x="612" y="318" width="352" height="44"/>' +
      '<rect class="fill-card" x="612" y="384" width="352" height="36"/>' +
      '<rect class="fill-card" x="1013" y="318" width="352" height="44"/>' +
      '<rect class="fill-card" x="1013" y="384" width="352" height="36"/>' +
      '<rect class="fill-card" x="1414" y="318" width="352" height="44"/>' +
      '<rect class="fill-card" x="1414" y="384" width="352" height="36"/>' +
      '<rect class="fill-card" x="1815" y="318" width="352" height="44"/>' +
      '<rect class="fill-card" x="1815" y="384" width="352" height="36"/>' +
      /* Chart plot areas repainted whole, so no partial edge can show */
      '<rect class="fill-card" x="626" y="634" width="34" height="288"/>' +
      '<rect class="fill-card" x="668" y="640" width="672" height="272"/>' +
      '<rect class="fill-card" x="1430" y="634" width="34" height="288"/>' +
      '<rect class="fill-card" x="1472" y="640" width="672" height="272"/>' +
      '<rect class="fill-card" x="1750" y="916" width="120" height="32"/>' +
      '<rect class="fill-card" x="845" y="1268" width="290" height="40"/>' +
      '<g class="nsp-in">' +
        /* Contracts by status: gridlines, ticks 0 to 10, category axis */
        '<g class="grid">' +
          '<path d="M670 907.5h668M670 881.25h668M670 855h668M670 828.75h668M670 802.5h668M670 776.25h668M670 750h668M670 723.75h668M670 697.5h668M670 671.25h668M670 645h668"/>' +
          '<path d="M670 645v262.5M803.6 645v262.5M937.2 645v262.5M1070.8 645v262.5M1204.4 645v262.5M1338 645v262.5"/>' +
        '</g>' +
        '<g font-size="19" text-anchor="end">' +
          '<text x="655" y="914">0</text><text x="655" y="887.75">1</text><text x="655" y="861.5">2</text>' +
          '<text x="655" y="835.25">3</text><text x="655" y="809">4</text><text x="655" y="782.75">5</text>' +
          '<text x="655" y="756.5">6</text><text x="655" y="730.25">7</text><text x="655" y="704">8</text>' +
          '<text x="655" y="677.75">9</text><text x="655" y="651.5">10</text>' +
        '</g>' +
        /* Bids by sector: same axis, four sectors summing to 22 */
        '<g class="grid">' +
          '<path d="M1474 907.5h668M1474 881.25h668M1474 855h668M1474 828.75h668M1474 802.5h668M1474 776.25h668M1474 750h668M1474 723.75h668M1474 697.5h668M1474 671.25h668M1474 645h668"/>' +
          '<path d="M1474 645v262.5M1641 645v262.5M1808 645v262.5M1975 645v262.5M2142 645v262.5"/>' +
        '</g>' +
        '<g font-size="19" text-anchor="end">' +
          '<text x="1462" y="914">0</text><text x="1462" y="887.75">1</text><text x="1462" y="861.5">2</text>' +
          '<text x="1462" y="835.25">3</text><text x="1462" y="809">4</text><text x="1462" y="782.75">5</text>' +
          '<text x="1462" y="756.5">6</text><text x="1462" y="730.25">7</text><text x="1462" y="704">8</text>' +
          '<text x="1462" y="677.75">9</text><text x="1462" y="651.5">10</text>' +
        '</g>' +
        '<g font-size="19" text-anchor="middle">' +
          '<text x="1557.5" y="936">Construction</text><text x="1724.5" y="936">Facilities</text>' +
          '<text x="1891.5" y="936">Highways</text><text x="2058.5" y="936">Education</text>' +
        '</g>' +
        /* Win rate over time: the panel had no axis at all, so it gets one */
        '<g class="grid">' +
          '<path d="M675 1472h647.5M675 1445.75h647.5M675 1419.5h647.5M675 1393.25h647.5M675 1367h647.5M675 1340.75h647.5M675 1314.5h647.5M675 1288.25h647.5M675 1262h647.5M675 1235.75h647.5M675 1209.5h647.5"/>' +
          '<path d="M675 1209.5v262.5M782.5 1209.5v262.5M890 1209.5v262.5M997.5 1209.5v262.5M1105 1209.5v262.5M1212.5 1209.5v262.5M1320 1209.5v262.5"/>' +
        '</g>' +
        '<g font-size="19" text-anchor="end">' +
          '<text x="665.5" y="1478.5">0</text><text x="665.5" y="1452.25">10</text><text x="665.5" y="1426">20</text>' +
          '<text x="665.5" y="1399.75">30</text><text x="665.5" y="1373.5">40</text><text x="665.5" y="1347.25">50</text>' +
          '<text x="665.5" y="1321">60</text><text x="665.5" y="1294.75">70</text><text x="665.5" y="1268.5">80</text>' +
          '<text x="665.5" y="1242.25">90</text><text x="665.5" y="1216">100</text>' +
        '</g>' +
        '<g font-size="19" text-anchor="middle">' +
          '<text x="676.5" y="1500">Apr 26</text><text x="891" y="1500">May 26</text>' +
          '<text x="1105" y="1500">Jun 26</text><text x="1319" y="1500">Jul 26</text>' +
        '</g>' +
        '<rect x="906" y="1178.5" width="55.5" height="18" rx="2" fill="none" stroke="#0CC9A8" stroke-width="5"/>' +
        '<text x="975" y="1194" font-size="21" fill="#95A7C2">Win rate %</text>' +
      '</g>' +
      /* Bars: 3 draft, 4 profiling, 2 evidence, 6 won, 7 lost = 22 */
      '<g fill="#8A9DB8">' +
        '<rect class="nsp-sbar" x="689.3" y="828.75" width="95" height="78.75" rx="4"/>' +
        '<rect class="nsp-sbar" x="822.9" y="802.5" width="95" height="105" rx="4"/>' +
        '<rect class="nsp-sbar" x="956.5" y="855" width="95" height="52.5" rx="4"/>' +
        '<rect class="nsp-sbar" x="1090.1" y="750" width="95" height="157.5" rx="4"/>' +
        '<rect class="nsp-sbar" x="1223.7" y="723.75" width="95" height="183.75" rx="4"/>' +
      '</g>' +
      /* Sectors: 9 construction, 5 facilities, 4 highways, 4 education = 22 */
      '<g fill="#A78BFA">' +
        '<rect class="nsp-sbar" x="1498.5" y="671.25" width="118" height="236.25" rx="4"/>' +
        '<rect class="nsp-sbar" x="1665.5" y="776.25" width="118" height="131.25" rx="4"/>' +
        '<rect class="nsp-sbar" x="1832.5" y="802.5" width="118" height="105" rx="4"/>' +
        '<rect class="nsp-sbar" x="1999.5" y="802.5" width="118" height="105" rx="4"/>' +
      '</g>' +
      /* Monthly win rate: 1 of 4, 2 of 4, 1 of 2, 2 of 3 = 6 of 13 = 46% */
      '<path class="nsp-path" d="M676.5 1406.4L891 1340.75L1105 1340.75L1319 1296.15" fill="none" stroke="#0CC9A8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g fill="#0A1F3A" stroke="#0CC9A8" stroke-width="5">' +
        '<circle class="nsp-dot" cx="676.5" cy="1406.4" r="8"/>' +
        '<circle class="nsp-dot" cx="891" cy="1340.75" r="8"/>' +
        '<circle class="nsp-dot" cx="1105" cy="1340.75" r="8"/>' +
        '<circle class="nsp-dot" cx="1319" cy="1296.15" r="8"/>' +
      '</g>' +
      /* Average social value score, monthly: 62, 66, 71, 74 out of 100 */
      '<path class="nsp-path" d="M1479 1309.25L1693.5 1298.75L1907.5 1285.63L2121.5 1277.75" fill="none" stroke="#A78BFA" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g fill="#0A1F3A" stroke="#A78BFA" stroke-width="5">' +
        '<circle class="nsp-dot" cx="1479" cy="1309.25" r="8"/>' +
        '<circle class="nsp-dot" cx="1693.5" cy="1298.75" r="8"/>' +
        '<circle class="nsp-dot" cx="1907.5" cy="1285.63" r="8"/>' +
        '<circle class="nsp-dot" cx="2121.5" cy="1277.75" r="8"/>' +
      '</g>' +
      /* KPI figures. 22 contracts, 46% win rate, £86,200 delivered, 75% evidenced */
      '<g class="fig" font-size="44">' +
        '<text x="620" y="356" data-nsp-to="22" data-nsp-fmt="int">22</text>' +
        '<text x="1021" y="356" data-nsp-to="46" data-nsp-fmt="pct">46%</text>' +
        '<text x="1422" y="356" data-nsp-to="86200" data-nsp-fmt="gbp0">£86,200</text>' +
        '<text x="1823" y="356" data-nsp-to="75" data-nsp-fmt="pct">75%</text>' +
      '</g>' +
      '<g class="nsp-in" font-size="18">' +
        '<text x="622" y="409"><tspan class="up">+4</tspan> vs prior 90 days</text>' +
        '<text x="1023" y="409"><tspan class="up">+7 pts</tspan> vs prior 90 days</text>' +
        '<text x="1424" y="409"><tspan class="up">+£21,400</tspan> vs prior 90 days</text>' +
        '<text x="1825" y="409">18 of 24 measures evidenced</text>' +
      '</g>' +
    '</svg>' +
    '<div class="nsp-cover fill" style="left:25%;top:18.813%;width:15.583%;height:8.375%"></div>' +
    '<div class="nsp-cover fill" style="left:41.75%;top:18.813%;width:15.5%;height:8.375%"></div>' +
    '<div class="nsp-cover fill" style="left:58.417%;top:18.813%;width:15.5%;height:8.375%"></div>' +
    '<div class="nsp-cover fill" style="left:75.083%;top:18.813%;width:15.5%;height:8.375%"></div>' +
    '<div class="nsp-cover fill" style="left:25%;top:31.75%;width:32%;height:29.125%"></div>' +
    '<div class="nsp-cover fill" style="left:58.5%;top:31.75%;width:32.083%;height:29.125%"></div>' +
    '<div class="nsp-cover fill" style="left:25%;top:65.688%;width:32.083%;height:30.625%"></div>' +
    '<div class="nsp-cover fill" style="left:58.438%;top:65.688%;width:31.979%;height:30.625%"></div>';

  /* ------------------------------------------------------------------
     CrowMark contracts. Same account, same 90 days, so the same 22
     contracts: 9 of them still open (3 draft, 4 profiling, 2 evidence),
     13 decided, of which 6 won, which is the 46% win rate the analytics
     screen shows. Pipeline value is the value of the 9 open ones. The
     single "Test Contract 1" row is replaced with one of the awarded
     contracts.
     ------------------------------------------------------------------ */
  var MARK_CONTRACTS =
    '<svg class="nsp-svg" viewBox="0 0 2400 1600" preserveAspectRatio="none" focusable="false">' +
      '<rect class="fill-card" x="614" y="366" width="290" height="40"/>' +
      '<rect class="fill-card" x="614" y="406" width="290" height="54"/>' +
      '<rect class="fill-card" x="1014" y="366" width="290" height="40"/>' +
      '<rect class="fill-card" x="1014" y="406" width="290" height="54"/>' +
      '<rect class="fill-card" x="1414" y="366" width="290" height="40"/>' +
      '<rect class="fill-card" x="1414" y="406" width="290" height="54"/>' +
      '<rect class="fill-card" x="1814" y="366" width="290" height="40"/>' +
      '<rect class="fill-card" x="1814" y="406" width="290" height="54"/>' +
      '<rect class="fill-card" x="612" y="650" width="690" height="52"/>' +
      '<rect class="fill-card" x="1548" y="658" width="120" height="30"/>' +
      /* 9 open, 46% from 6 of 13 decided, 6 won, pipeline across the 9 open */
      '<g class="fig" font-size="36">' +
        '<text x="620" y="398" data-nsp-to="9" data-nsp-fmt="int">9</text>' +
        '<text x="1020" y="398" data-nsp-to="46" data-nsp-fmt="pct">46%</text>' +
        '<text x="1420" y="398" data-nsp-to="6" data-nsp-fmt="int">6</text>' +
        '<text x="1820" y="398" data-nsp-to="248400" data-nsp-fmt="gbp0">£248,400</text>' +
      '</g>' +
      '<g class="nsp-in" font-size="19">' +
        '<text x="620" y="423">Active contracts</text>' +
        '<text x="620" y="450">3 draft, 4 profiling, 2 evidence</text>' +
        '<text x="1020" y="423">Win rate</text>' +
        '<text x="1020" y="450">6 of 13 bids decided</text>' +
        '<text x="1420" y="423">Bids won</text>' +
        '<text x="1420" y="450">Awarded in the last 90 days</text>' +
        '<text x="1820" y="423">Pipeline value</text>' +
        '<text x="1820" y="450">9 open contracts</text>' +
      '</g>' +
      '<g class="nsp-in">' +
        '<text class="ink disp" x="619" y="670" font-size="21">Halewood Court Retrofit</text>' +
        '<text x="619" y="692" font-size="17">Halton Borough Council</text>' +
        '<text class="body" x="895" y="680" font-size="20">Construction</text>' +
        '<text class="body" x="1289" y="680" font-size="20" text-anchor="end">£42,800</text>' +
        '<text class="body" x="1556" y="680" font-size="19">8 Jul 2026</text>' +
      '</g>' +
    '</svg>' +
    /* covers sit inside the flat part of each card, clear of the icon glow
       in its top-right corner */
    '<div class="nsp-cover fill" style="left:25.25%;top:21.25%;width:12.25%;height:7.875%"></div>' +
    '<div class="nsp-cover fill" style="left:41.917%;top:21.25%;width:12.25%;height:7.875%"></div>' +
    '<div class="nsp-cover fill" style="left:58.583%;top:21.25%;width:12.25%;height:7.875%"></div>' +
    '<div class="nsp-cover fill" style="left:75.25%;top:21.25%;width:12.25%;height:7.875%"></div>' +
    '<div class="nsp-cover fill" style="left:25.5%;top:40.5%;width:45.333%;height:3.5%"></div>';

  /* ------------------------------------------------------------------
     CrowESG overview. The account has confirmed nothing, so the whole
     screen reads 0%, 0 of 19 and a dash. The example confirms 9 of the
     19 VSME Basic datapoints, which is the 47% readiness. Those 9 split
     across the pillars as 4 of 9 environment (44%), 3 of 5 workforce and
     social (60%) and 2 of 5 governance (40%). Materiality and carbon stay
     unstarted, which is exactly what 9 of 19 means, so those two tiles
     keep their dash. Same worked example as the reports screen.
     ------------------------------------------------------------------ */
  var ESG_OVERVIEW =
    '<svg class="nsp-svg" viewBox="0 0 2400 1600" preserveAspectRatio="none" focusable="false">' +
      '<rect class="fill-card" x="614" y="352" width="300" height="40"/>' +
      '<rect class="fill-card" x="1014" y="352" width="300" height="40"/>' +
      /* readiness 47%, 9 of 19 datapoints */
      '<text class="fig esg" x="620" y="383" font-size="34" data-nsp-to="47" data-nsp-fmt="pct">47%</text>' +
      '<text class="fig" x="1020" y="383" font-size="34"><tspan data-nsp-to="9" data-nsp-fmt="int">9</tspan> / 19</text>' +
      /* Donut: hole repainted, 47% arc drawn onto the existing track */
      '<rect class="fill-hole" x="666" y="682" width="86" height="38"/>' +
      '<path class="nsp-path" d="M708 645.5 A67 67 0 0 1 720.7 778.3" fill="none" stroke="#2DD5C0" stroke-width="23"/>' +
      '<text class="fig" x="708" y="714" font-size="34" text-anchor="middle" data-nsp-to="47" data-nsp-fmt="pct">47%</text>' +
      /* Pillar meters. 4 of 9, 3 of 5, 2 of 5 */
      '<rect class="nsp-hbar" x="1004" y="673" width="269.7" height="8" rx="4" fill="#24C460"/>' +
      '<rect class="nsp-hbar" x="1004" y="713" width="367.8" height="8" rx="4" fill="#5CC8FF"/>' +
      '<rect class="nsp-hbar" x="1004" y="753" width="245.2" height="8" rx="4" fill="#D9A523"/>' +
      '<rect class="fill-card" x="1664" y="666" width="40" height="26"/>' +
      '<rect class="fill-card" x="1664" y="706" width="40" height="26"/>' +
      '<rect class="fill-card" x="1664" y="746" width="40" height="26"/>' +
      '<g class="fig" font-size="21" text-anchor="end">' +
        '<text x="1700" y="684" data-nsp-to="44" data-nsp-fmt="pct">44%</text>' +
        '<text x="1700" y="724" data-nsp-to="60" data-nsp-fmt="pct">60%</text>' +
        '<text x="1700" y="764" data-nsp-to="40" data-nsp-fmt="pct">40%</text>' +
      '</g>' +
      /* Reporting period meter */
      '<rect class="nsp-hbar" x="1782" y="648" width="131.6" height="8" rx="4" fill="#2DD5C0"/>' +
      '<rect class="fill-card" x="2092" y="638" width="54" height="26"/>' +
      '<text class="fig" x="2143" y="658" font-size="21" text-anchor="end" data-nsp-to="47" data-nsp-fmt="pct">47%</text>' +
      /* Framework crosswalk: the share of each framework the 9 confirmed
         answers already cover. SECR and ISSB stay low because carbon is
         not computed yet. */
      '<g>' +
        '<rect class="fill-card" x="2028" y="923" width="54" height="24"/>' +
        '<rect class="fill-card" x="2028" y="975" width="54" height="24"/>' +
        '<rect class="fill-card" x="2028" y="1027" width="54" height="24"/>' +
        '<rect class="fill-card" x="2028" y="1079" width="54" height="24"/>' +
        '<rect class="fill-card" x="2028" y="1131" width="54" height="24"/>' +
      '</g>' +
      '<g font-size="19" text-anchor="end">' +
        '<text x="2078" y="941" data-nsp-to="25" data-nsp-fmt="pct">25%</text>' +
        '<text x="2078" y="993" data-nsp-to="60" data-nsp-fmt="pct">60%</text>' +
        '<text x="2078" y="1045" data-nsp-to="47" data-nsp-fmt="pct">47%</text>' +
        '<text x="2078" y="1097" data-nsp-to="42" data-nsp-fmt="pct">42%</text>' +
        '<text x="2078" y="1149" data-nsp-to="26" data-nsp-fmt="pct">26%</text>' +
      '</g>' +
      /* Next actions: 10 of the 19 still open, draft already at 47% */
      '<rect class="fill-soft" x="692" y="946" width="326" height="32"/>' +
      '<text class="nsp-in" x="697" y="970" font-size="22" font-weight="600" style="fill:#F4FBFF">Answer 10 outstanding datapoints</text>' +
      '<rect class="fill-soft" x="692" y="1180" width="474" height="30"/>' +
      '<text class="nsp-in" x="697" y="1202" font-size="19">Draft available now at 47% · preview as PDF, Word or iXBRL.</text>' +
    '</svg>' +
    /* the donut carries a soft halo, so it is left uncovered and simply
       draws itself in; every cover below sits on a flat surface */
    '<div class="nsp-cover fill" style="left:25.25%;top:21%;width:15.167%;height:7.75%"></div>' +
    '<div class="nsp-cover fill" style="left:41.917%;top:21%;width:15.167%;height:7.75%"></div>' +
    '<div class="nsp-cover fill" style="left:41.667%;top:41.25%;width:29.333%;height:7.25%"></div>' +
    '<div class="nsp-cover fill" style="left:74%;top:39.75%;width:15.583%;height:1.75%"></div>' +
    '<div class="nsp-cover fill" style="left:84.333%;top:57.375%;width:2.583%;height:14.875%"></div>';

  /* ------------------------------------------------------------------
     CrowESG reports. Same account, same 9 of 19 confirmed, so the same
     47% and the same 10 open datapoints, split 2 + 2 + 3 + 2 + 1 across
     the five VSME Basic sections. Scores 61 / 68 / 55 for an overall 61.
     Identical to the homepage overlay.
     ------------------------------------------------------------------ */
  var ESG_REPORTS =
    '<svg class="nsp-svg" viewBox="0 0 2400 1600" preserveAspectRatio="none" focusable="false">' +
      '<rect class="fill-card" x="612.5" y="400" width="170" height="32"/>' +
      '<rect class="fill-card" x="840" y="400" width="170" height="32"/>' +
      '<rect class="fill-card" x="1067" y="400" width="170" height="32"/>' +
      '<rect class="fill-card" x="1294.5" y="400" width="170" height="32"/>' +
      '<rect class="fill-card" x="1522" y="400" width="170" height="32"/>' +
      '<rect class="fill-page" x="773" y="519" width="17" height="21"/>' +
      '<rect class="fill-pill2" x="2113" y="717" width="13" height="16"/>' +
      '<rect class="fill-pill" x="1642" y="832.6" width="16" height="18"/>' +
      '<rect class="fill-pill" x="1642" y="888.3" width="16" height="18"/>' +
      '<rect class="fill-pill" x="1642" y="944" width="16" height="18"/>' +
      '<rect class="fill-pill" x="1642" y="999.7" width="16" height="18"/>' +
      '<g class="fig esg" font-size="31">' +
        '<text x="620.5" y="428" data-nsp-to="47" data-nsp-fmt="pct">47%</text>' +
        '<text x="848" y="428" data-nsp-to="61" data-nsp-fmt="int">61</text>' +
        '<text x="1075" y="428" data-nsp-to="68" data-nsp-fmt="int">68</text>' +
        '<text x="1302.5" y="428" data-nsp-to="55" data-nsp-fmt="int">55</text>' +
        '<text x="1530" y="428" data-nsp-to="61" data-nsp-fmt="int">61</text>' +
      '</g>' +
      '<text class="ink" x="776" y="536.25" font-size="18" data-nsp-to="9" data-nsp-fmt="int">9</text>' +
      '<text class="amb" x="2116" y="730.4" font-size="13" data-nsp-to="9" data-nsp-fmt="int">9</text>' +
      '<g class="amb" font-size="15">' +
        '<text x="1645" y="846.6" data-nsp-to="2" data-nsp-fmt="int">2</text>' +
        '<text x="1645" y="902.3" data-nsp-to="2" data-nsp-fmt="int">2</text>' +
        '<text x="1645" y="958" data-nsp-to="3" data-nsp-fmt="int">3</text>' +
        '<text x="1645" y="1013.7" data-nsp-to="2" data-nsp-fmt="int">2</text>' +
      '</g>' +
    '</svg>' +
    '<div class="nsp-cover fill" style="left:25.113%;top:23.775%;width:8.583%;height:6.313%"></div>' +
    '<div class="nsp-cover fill" style="left:34.408%;top:23.775%;width:8.583%;height:6.313%"></div>' +
    '<div class="nsp-cover fill" style="left:43.946%;top:23.775%;width:8.583%;height:6.313%"></div>' +
    '<div class="nsp-cover fill" style="left:53.367%;top:23.775%;width:8.583%;height:6.313%"></div>' +
    '<div class="nsp-cover fill" style="left:62.896%;top:23.775%;width:8.583%;height:6.313%"></div>';

  /* ------------------------------------------------------------------
     CrowCyber policies. The account has generated none of the eight
     Cyber Essentials v3.3 (Danzell) documents, so every row reads "Not
     generated" and the tiles read zero. The example generates all eight:
     six finalised, two still in draft, none yet at its annual review.
     6 + 2 = 8, which is the 8 of 8 in the first tile.
     ------------------------------------------------------------------ */
  var CYBER_POLICIES = (function () {
    var x = [832, 828, 864, 865, 762, 883, 859, 805];
    var y = [487, 607.4, 727.8, 848.2, 968.6, 1089, 1209.4, 1329.8];
    var s = '<svg class="nsp-svg" viewBox="0 0 2400 1600" preserveAspectRatio="none" focusable="false">' +
      '<rect class="fill-card" x="614" y="348" width="300" height="40"/>' +
      '<rect class="fill-card" x="1014" y="348" width="300" height="40"/>' +
      '<rect class="fill-card" x="1414" y="348" width="300" height="40"/>' +
      '<g class="fig" font-size="34">' +
        '<text x="620" y="378"><tspan data-nsp-to="8" data-nsp-fmt="int">8</tspan> / 8</text>' +
        '<text x="1020" y="378" data-nsp-to="6" data-nsp-fmt="int">6</text>' +
        '<text x="1420" y="378" data-nsp-to="2" data-nsp-fmt="int">2</text>' +
      '</g>';
    for (var i = 0; i < 8; i++) {
      var draft = i >= 6;
      var w = draft ? 78 : 112;
      s += '<rect class="fill-card" x="' + (x[i] - 3) + '" y="' + (y[i] - 3) + '" width="136" height="34"/>' +
        '<g class="nsp-in">' +
        '<rect x="' + x[i] + '" y="' + y[i] + '" width="' + w + '" height="28" rx="14" fill="' + (draft ? '#0F2D53' : '#15564C') + '"/>' +
        '<text x="' + (x[i] + w / 2) + '" y="' + (y[i] + 20) + '" font-size="18" font-weight="600" text-anchor="middle" style="fill:' + (draft ? '#CBDCEF' : '#35D581') + '">' + (draft ? 'Draft' : 'Finalised') + '</text>' +
        '</g>';
    }
    s += '</svg>' +
      '<div class="nsp-cover fill" style="left:25.25%;top:20.625%;width:15.167%;height:5.938%"></div>' +
      '<div class="nsp-cover fill" style="left:41.917%;top:20.625%;width:15.167%;height:5.938%"></div>' +
      '<div class="nsp-cover fill" style="left:58.583%;top:20.625%;width:15.167%;height:5.938%"></div>';
    return s;
  })();

  /* ------------------------------------------------------------------
     CrowCyber connectors. Nothing is connected on the account, so the
     tiles read 0 of 2 and "Never" and the drift log is empty. The example
     connects both read-only providers, leaves nothing needing attention,
     and records one drift entry from the most recent read.
     ------------------------------------------------------------------ */
  var CYBER_CONNECTORS =
    '<svg class="nsp-svg" viewBox="0 0 2400 1600" preserveAspectRatio="none" focusable="false">' +
      '<rect class="fill-card" x="624" y="426" width="290" height="40"/>' +
      '<rect class="fill-card" x="1424" y="426" width="330" height="40"/>' +
      '<g class="fig" font-size="34">' +
        '<text x="632" y="456"><tspan data-nsp-to="2" data-nsp-fmt="int">2</tspan> / 2</text>' +
      '</g>' +
      '<text class="fig nsp-in" x="1432" y="456" font-size="34">18 Jul 2026</text>' +
      /* Both providers connected, read-only */
      '<rect class="fill-row" x="874" y="674" width="130" height="32"/>' +
      '<rect class="fill-row" x="919" y="770" width="130" height="32"/>' +
      /* an inline style is used rather than a fill attribute: the stylesheet
         gives `.nsp-svg text` a muted default, and that beats both a
         presentation attribute and an inherited fill */
      '<g class="nsp-in" font-size="20" font-weight="600">' +
        '<text x="881" y="697" style="fill:#2ED3B7">Connected</text>' +
        '<text x="926" y="793" style="fill:#2ED3B7">Connected</text>' +
      '</g>' +
      /* Action buttons follow the new state */
      '<rect class="fill-row" x="1932" y="674" width="208" height="52"/>' +
      '<rect class="fill-row" x="1932" y="770" width="208" height="52"/>' +
      '<g class="nsp-in">' +
        '<rect x="1936" y="678" width="200" height="44" rx="8" fill="#0CC9A8"/>' +
        '<text x="2036" y="707" font-size="20" font-weight="700" text-anchor="middle" style="fill:#05121E">Read now</text>' +
        '<rect x="1936" y="774" width="200" height="44" rx="8" fill="#0CC9A8"/>' +
        '<text x="2036" y="803" font-size="20" font-weight="700" text-anchor="middle" style="fill:#05121E">Read now</text>' +
      '</g>' +
      /* One drift entry in place of the empty log */
      '<rect class="fill-card" x="634" y="1042" width="980" height="34"/>' +
      '<text class="nsp-in" x="640" y="1066" font-size="21" style="fill:#98ABC5">18 Jul 2026 · MFA on cloud admin accounts moved from 5 of 6 to 6 of 6. Read-only, nothing changed.</text>' +
    '</svg>' +
    '<div class="nsp-cover fill" style="left:25.667%;top:26.125%;width:15.167%;height:5.125%"></div>' +
    '<div class="nsp-cover fill" style="left:59%;top:26.125%;width:15.167%;height:5.125%"></div>' +
    '<div class="nsp-cover row" style="left:27.083%;top:41.75%;width:62.5%;height:4.375%"></div>' +
    '<div class="nsp-cover row" style="left:27.083%;top:47.75%;width:62.5%;height:4.375%"></div>' +
    '<div class="nsp-cover fill" style="left:26.417%;top:65%;width:41.083%;height:2.375%"></div>';

  /* ------------------------------------------------------------------
     CrowCash dashboard. This screen is genuinely populated: the
     receivables, ageing, statutory interest and fixed compensation are
     all the account's own and all reconcile with the forecast screen. The
     one thing that does not belong is the placeholder debtor address the
     demo account was seeded with, so that is the only value replaced.
     ------------------------------------------------------------------ */
  var CASH_DASHBOARD =
    '<svg class="nsp-svg" viewBox="0 0 2400 1600" preserveAspectRatio="none" focusable="false">' +
      '<rect fill="#0C213C" x="612" y="952" width="300" height="32"/>' +
      '<text class="ink nsp-in" x="618" y="974" font-size="21" font-family="\'Plus Jakarta Sans\', system-ui, sans-serif">finance@halewoodfm.co.uk</text>' +
    '</svg>' +
    '<div class="nsp-cover soft2" style="left:24.917%;top:58.5%;width:40%;height:3.75%"></div>';

  var PANELS = {
    'mark-analytics': {
      html: MARK_ANALYTICS,
      sr: 'Example figures on this screen, from a sample account rather than a live one: 22 total contracts, up 4 on the prior 90 days. Bid win rate 46%, up 7 points. Social value delivered £86,200, up £21,400. Evidence completion 75%, from 18 of 24 committed measures evidenced. Contracts by status: 3 draft, 4 profiling, 2 evidence, 6 won, 7 lost. Bids by sector: 9 construction, 5 facilities, 4 highways, 4 education. Monthly win rate: 25% in April, 50% in May, 50% in June, 67% in July. Average social value score: 62, then 66, 71 and 74 out of 100.'
    },
    'mark-contracts': {
      html: MARK_CONTRACTS,
      sr: 'Example figures on this screen, from a sample account rather than a live one: 9 active contracts, being 3 in draft, 4 in profiling and 2 at evidence stage. Win rate 46%, from 6 of 13 bids decided. 6 bids won in the last 90 days. Pipeline value £248,400 across the 9 open contracts. The contract listed is Halewood Court Retrofit for Halton Borough Council, construction, £42,800, created 8 July 2026.'
    },
    'esg-overview': {
      html: ESG_OVERVIEW,
      sr: 'Example figures on this screen, from a sample account rather than a live one: 47% disclosure readiness, from 9 of the 19 VSME Basic datapoints confirmed. Completion by pillar: environment 44%, social 60%, governance 40%. Framework crosswalk coverage: SECR 25%, PPN 006 60%, ESRS 47%, GRI 42%, ISSB 26%. Ten datapoints remain to answer. The double materiality assessment and the carbon calculation are not started, so those two tiles stay empty.'
    },
    'esg-reports': {
      html: ESG_REPORTS,
      sr: 'Example figures on this screen, from a sample account rather than a live one: 47% completion, with scores of 61 for environment, 68 for social, 55 for governance and 61 overall. The report draws on 9 of 19 confirmed VSME datapoints. Ten datapoints remain open: 2 under general information and policies, 2 under energy and greenhouse gas emissions, 3 under pollution, water and resource use, 2 under workforce and 1 under business conduct. Materiality, carbon and auditor review are not yet started.'
    },
    'cyber-policies': {
      html: CYBER_POLICIES,
      sr: 'Example figures on this screen, from a sample account rather than a live one: all 8 Cyber Essentials v3.3 policy documents generated, of which 6 are finalised and 2 are still in draft, and none is yet due for its annual review. Acceptable use, access control, patch management, malware protection, firewall and secure configuration are finalised; incident response and data backup are in draft.'
    },
    'cyber-connectors': {
      html: CYBER_CONNECTORS,
      sr: 'Example figures on this screen, from a sample account rather than a live one: 2 of 2 read-only posture connectors connected, Microsoft 365 and Google Workspace, with nothing needing attention and the last posture read on 18 July 2026. The drift log records one change: multi-factor authentication on cloud admin accounts moved from 5 of 6 accounts to 6 of 6. Nothing in the tenant is changed by CrowCyber.'
    },
    'cash-dashboard': {
      html: CASH_DASHBOARD,
      sr: 'The debtor address on the chase worklist is an example rather than a real customer. Every other figure is as captured: £34,671.94 total receivables, 90 days average time to pay, £5,000.00 overdue and nothing past 120 days, all of it in the 0 to 30 day bucket, with £73.22 of statutory interest and fixed compensation claimable on the one overdue invoice.'
    }
  };

  /* ---- cover fills, matched to the surface each cover sits on ---- */
  var COVER_FILL = {
    fill: '#0A1F3A',
    card: '#0A1F3A',
    row: '#0D2847',
    soft: '#0B203B',
    soft2: '#0C213C'
  };

  var mq = matchMedia('(prefers-reduced-motion: reduce)');
  var whole = new Intl.NumberFormat('en-GB');
  var gbp0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  var gbp2 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---- timeline shape (ms) ---- */
  var COVER = { at: 60, step: 70, dur: 420 };
  var IN = { at: 120, step: 26, dur: 520 };
  var NUM = { at: 240, step: 90, dur: 980 };
  var BAR = { at: 400, step: 90, dur: 760 };
  var PATH = { at: 660, step: 160, dur: 900 };
  var DOT = { at: 940, step: 90, dur: 380 };

  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }

  function format(el, v) {
    var f = el.getAttribute('data-nsp-fmt');
    if (f === 'gbp2') return gbp2.format(v);
    if (f === 'gbp0') return gbp0.format(v);
    if (f === 'pct') return whole.format(Math.round(v)) + '%';
    return whole.format(Math.round(v));
  }

  function build(layer) {
    var tracks = [];
    var add = function (nodes, plan, apply) {
      [].slice.call(nodes).forEach(function (el, i) {
        tracks.push({ el: el, start: plan.at + i * plan.step, dur: plan.dur, apply: apply });
      });
    };
    var grow = function (el, p) { el.style.setProperty('--g', String(p)); };
    add(layer.querySelectorAll('.nsp-cover'), COVER, function (el, p) {
      el.style.setProperty('--o', String(1 - p));
    });
    add(layer.querySelectorAll('.nsp-in'), IN, function (el, p) {
      el.style.setProperty('--i', String(p));
    });
    add(layer.querySelectorAll('[data-nsp-to]'), NUM, function (el, p) {
      el.textContent = format(el, parseFloat(el.getAttribute('data-nsp-to')) * p);
    });
    add(layer.querySelectorAll('.nsp-sbar, .nsp-hbar'), BAR, grow);
    add(layer.querySelectorAll('.nsp-path'), PATH, function (el, p) {
      var len = el.__nspLen;
      if (len == null) {
        len = typeof el.getTotalLength === 'function' ? el.getTotalLength() : 0;
        el.__nspLen = len;
      }
      if (!len) return;
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len * (1 - p));
    });
    add(layer.querySelectorAll('.nsp-dot'), DOT, grow);
    return tracks;
  }

  /* ---- shared rAF loop ---- */
  var running = [];
  var raf = 0;

  function frame(ts) {
    raf = 0;
    var still = [];
    for (var i = 0; i < running.length; i++) {
      var show = running[i];
      if (!show.t0) show.t0 = ts;
      var t = ts - show.t0;
      var done = true;
      for (var j = 0; j < show.tracks.length; j++) {
        var tr = show.tracks[j];
        var p = (t - tr.start) / tr.dur;
        if (p < 0) { p = 0; done = false; }
        else if (p < 1) { done = false; }
        else { p = 1; }
        tr.apply(tr.el, easeOut(p));
      }
      if (!done) still.push(show);
    }
    running = still;
    if (running.length) raf = requestAnimationFrame(frame);
  }

  function paint(show, p) {
    for (var i = 0; i < show.tracks.length; i++) show.tracks[i].apply(show.tracks[i].el, p);
  }

  function drop(show, snap) {
    var i = running.indexOf(show);
    if (i > -1) running.splice(i, 1);
    if (snap) paint(show, 1);
    if (!running.length && raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  function play(show) {
    if (show.played && !running.length) { paint(show, 1); return; }
    if (mq.matches) { paint(show, 1); show.played = true; return; }
    show.played = true;
    show.t0 = 0;
    paint(show, 0);
    if (running.indexOf(show) === -1) running.push(show);
    if (!raf) raf = requestAnimationFrame(frame);
  }

  /* ---- place the overlay onto the image's own rendered rectangle ---- */
  function place(show) {
    var img = show.img, layer = show.layer;
    var cw = img.clientWidth, ch = img.clientHeight;
    if (!cw || !ch) return;
    var nw = img.naturalWidth || 2400, nh = img.naturalHeight || 1600;
    var cs = getComputedStyle(img);
    var fit = cs.objectFit, w, h, s;
    if (fit === 'cover') { s = Math.max(cw / nw, ch / nh); w = nw * s; h = nh * s; }
    else if (fit === 'contain' || fit === 'scale-down') { s = Math.min(cw / nw, ch / nh); w = nw * s; h = nh * s; }
    else if (fit === 'none') { w = nw; h = nh; }
    else { w = cw; h = ch; }
    var pos = (cs.objectPosition || '50% 50%').split(/\s+/);
    var px = parseFloat(pos[0]); var py = parseFloat(pos.length > 1 ? pos[1] : pos[0]);
    if (isNaN(px)) px = 50; if (isNaN(py)) py = 50;
    var ir = img.getBoundingClientRect();
    var hr = show.host.getBoundingClientRect();
    layer.style.left = (ir.left - hr.left + (cw - w) * px / 100) + 'px';
    layer.style.top = (ir.top - hr.top + (ch - h) * py / 100) + 'px';
    layer.style.width = w + 'px';
    layer.style.height = h + 'px';
  }

  function init() {
    var imgs = [].slice.call(document.querySelectorAll('img[src*="/Assets/shots/dark/"]'));
    var shows = [];

    imgs.forEach(function (img) {
      var src = img.getAttribute('src') || '';
      var key = src.split('/').pop().split('?')[0].replace(/\.png$/, '');
      var panel = PANELS[key];
      var host = img.parentElement;
      if (!panel || !host || img.__nsp) return;
      img.__nsp = true;

      host.classList.add('nsp-host');
      var layer = document.createElement('div');
      layer.className = 'nsp';
      layer.setAttribute('aria-hidden', 'true');
      layer.innerHTML = panel.html;
      [].slice.call(layer.querySelectorAll('.nsp-cover')).forEach(function (c) {
        var k = (c.className.match(/nsp-cover\s+(\w+)/) || [])[1] || 'fill';
        c.style.background = COVER_FILL[k] || COVER_FILL.fill;
      });
      host.appendChild(layer);

      var sr = document.createElement('p');
      sr.className = 'nsp-sr';
      sr.textContent = panel.sr;
      host.appendChild(sr);

      var show = { img: img, host: host, layer: layer, tracks: build(layer), t0: 0, played: false };
      shows.push(show);
      place(show);
      paint(show, mq.matches ? 1 : 0);

      if (typeof ResizeObserver === 'function') {
        new ResizeObserver(function () { place(show); }).observe(host);
      }
      if (!img.complete) img.addEventListener('load', function () { place(show); }, { once: true });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          var on = entries[entries.length - 1].isIntersecting;
          show.onScreen = on;
          if (on && !document.hidden) play(show);
          else drop(show, show.played);
        }, { threshold: 0.25 }).observe(host);
      } else {
        play(show);
      }
    });

    if (!shows.length) return;

    window.addEventListener('resize', function () { shows.forEach(place); });
    document.addEventListener('visibilitychange', function () {
      shows.forEach(function (s) {
        if (document.hidden) drop(s, s.played);
        else if (s.onScreen) play(s);
      });
    });
    var onMq = function () {
      if (mq.matches) shows.forEach(function (s) { drop(s, false); paint(s, 1); s.played = true; });
    };
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onMq);
    else if (typeof mq.addListener === 'function') mq.addListener(onMq);

    /* exposed for automated checks only */
    window.__nspShows = shows;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
