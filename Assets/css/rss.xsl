<?xml version="1.0" encoding="UTF-8"?>
<!-- CrowAgent RSS XSL transform - 2026-05-16
     Renders /changelog.xml as a branded HTML page in a browser tab.
     Feed readers ignore this stylesheet and consume the raw RSS 2.0 below. -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="en-gb">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="rss/channel/title"/> - RSS feed</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
        <style>
          :root { --bg:#040E1A; --surf:#0B1B2B; --teal:#0CC9A8; --cloud:#E6EEF6; --mist:#9FB0C2; --border:#1F3142; }
          *,*::before,*::after { box-sizing:border-box; }
          html,body { margin:0; padding:0; background:var(--bg); color:var(--cloud); font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; line-height:1.55; }
          .wrap { max-width:760px; margin:0 auto; padding:48px 24px 96px; }
          .brand { display:flex; align-items:center; gap:12px; margin-bottom:32px; }
          .brand img { height:36px; width:auto; }
          .banner { background:var(--surf); border:1px solid var(--border); border-radius:12px; padding:20px 24px; margin-bottom:32px; }
          .banner .eyebrow { color:var(--teal); font-size:12px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; margin:0 0 6px; }
          .banner p { margin:0 0 8px; color:var(--mist); font-size:14px; }
          .banner code { background:#000; color:var(--teal); padding:2px 8px; border-radius:4px; font-size:13px; word-break:break-all; }
          h1 { font-size:32px; font-weight:700; letter-spacing:-0.01em; margin:0 0 8px; color:var(--cloud); }
          .channel-desc { color:var(--mist); margin:0 0 8px; font-size:15px; }
          .channel-link a { color:var(--teal); text-decoration:none; font-size:14px; }
          .channel-link a:hover { text-decoration:underline; }
          .items { list-style:none; padding:0; margin:32px 0 0; }
          .item { border-top:1px solid var(--border); padding:24px 0; }
          .item-date { color:var(--teal); font-size:12px; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; margin:0 0 6px; }
          .item-title { font-size:18px; font-weight:600; margin:0 0 8px; }
          .item-title a { color:var(--cloud); text-decoration:none; }
          .item-title a:hover { color:var(--teal); }
          .item-desc { color:var(--mist); margin:0; font-size:14px; }
          footer { margin-top:48px; padding-top:24px; border-top:1px solid var(--border); color:var(--mist); font-size:13px; }
          footer a { color:var(--teal); text-decoration:none; }
          footer a:hover { text-decoration:underline; }
          @media (max-width:520px) { .wrap { padding:32px 16px 64px; } h1 { font-size:24px; } }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="brand">
            <a href="/"><img src="/Assets/brand/crowagent_wordmark_transparent_560x140.png" alt="CrowAgent"/></a>
          </div>
          <div class="banner">
            <p class="eyebrow">RSS feed</p>
            <p>Subscribe via your feed reader. Add this URL:</p>
            <code>https://crowagent.ai/changelog.xml</code>
          </div>
          <h1><xsl:value-of select="rss/channel/title"/></h1>
          <p class="channel-desc"><xsl:value-of select="rss/channel/description"/></p>
          <p class="channel-link">
            <a><xsl:attribute name="href"><xsl:value-of select="rss/channel/link"/></xsl:attribute>View the changelog page -&gt;</a>
          </p>
          <ul class="items">
            <xsl:for-each select="rss/channel/item">
              <li class="item">
                <p class="item-date"><xsl:value-of select="substring(pubDate,1,16)"/></p>
                <h2 class="item-title">
                  <a>
                    <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </h2>
                <p class="item-desc"><xsl:value-of select="description"/></p>
              </li>
            </xsl:for-each>
          </ul>
          <footer>
            <p>This is an RSS feed. Paste the URL above into Feedly, Inoreader, NetNewsWire, or any reader. Or visit <a href="/changelog">the changelog page</a>.</p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
