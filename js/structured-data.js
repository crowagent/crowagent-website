/**
 * JSON-LD Structured Data for CrowAgent homepage.
 * Externalized from inline <script> for CSP compliance (DEF-003 / DEF-010).
 */
(function () {
  'use strict';

  var schemas = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "CrowAgent Core",
      "description": "MEES compliance intelligence for UK commercial landlords — EPC gap analysis, penalty exposure, retrofit scenarios, and branded PDF reports.",
      "url": "https://crowagent.ai/crowagent-core",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": [
        {"@type": "Offer", "name": "Starter", "price": "149.00", "priceCurrency": "GBP"},
        {"@type": "Offer", "name": "Pro", "price": "299.00", "priceCurrency": "GBP"},
        {"@type": "Offer", "name": "Portfolio", "price": "599.00", "priceCurrency": "GBP"}
      ],
      "provider": {
        "@type": "Organization",
        "name": "CrowAgent Ltd",
        "url": "https://crowagent.ai",
        "foundingLocation": "England and Wales",
        "identifier": {"@type": "PropertyValue", "name": "Companies House Number", "value": "17076461"}
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "CrowMark",
      "description": "PPN 002 social value platform for UK public sector suppliers — mission mapping, TOMs measures, AI narratives, and evidence tracking.",
      "url": "https://crowagent.ai/crowmark",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": [
        {"@type": "Offer", "name": "Solo", "price": "99.00", "priceCurrency": "GBP", "description": "Social value reporting for individual users"},
        {"@type": "Offer", "name": "Team", "price": "149.00", "priceCurrency": "GBP", "description": "Social value reporting for teams up to 5"},
        {"@type": "Offer", "name": "Agency", "price": "399.00", "priceCurrency": "GBP", "description": "Social value reporting for agencies"}
      ],
      "provider": {
        "@type": "Organization",
        "name": "CrowAgent Ltd",
        "url": "https://crowagent.ai",
        "foundingLocation": "England and Wales",
        "identifier": {"@type": "PropertyValue", "name": "Companies House Number", "value": "17076461"}
      }
    }
  ];

  var orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CrowAgent Ltd",
    "legalName": "CrowAgent Ltd",
    "url": "https://crowagent.ai",
    "foundingDate": "2026",
    "description": "Sustainability Intelligence. MEES compliance, PPN 002 social value, and CSRD applicability — self-serve SaaS for commercial landlords and public sector suppliers.",
    /* DEF-022 / U-02 follow-through 2026-05-10: detailed registered-office
       postal address removed from the homepage Organization schema per user
       directive — the registered office is disclosed in the JSON-LD on
       privacy.html, terms.html and cookies.html instead (UK GDPR Art 13
       minimal disclosure). The country code is retained so search engines
       still localise CrowAgent as a UK organisation. */
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB"
    },
    "contactPoint": {"@type": "ContactPoint", "contactType": "customer support", "email": "hello@crowagent.ai", "availableLanguage": "English"},
    /* WEB-AUDIT-140 C1 2026-05-09 fix: X sameAs unified on crowagent_ai
       (legacy company-name handle deprecated). */
    "sameAs": ["https://www.linkedin.com/company/crowagent-ltd/", "https://x.com/crowagent_ai"],
    "identifier": {"@type": "PropertyValue", "name": "Companies House", "value": "17076461"}
  };

  // Inject JSON-LD script tags
  function injectSchema(data) {
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  injectSchema(schemas);
  injectSchema(orgSchema);
})();
