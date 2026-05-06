# CrowAgent Live Site Audit - 2026-05-05

Base URL: https://www.crowagent.ai
Pages audited: 50
Unique links probed: 100
Issues found: 336

## Summary By Severity
- P0: 10
- P1: 133
- P2: 182
- P3: 11

## P0 Findings
- https://www.crowagent.ai/products: Navigation failed - page.goto: net::ERR_TOO_MANY_REDIRECTS at https://www.crowagent.ai/products
Call log:
[2m  - navigating to "https://www.crowagent.ai/products", waiting until "domcontentloaded"[22m

- https://www.crowagent.ai/blog: Navigation failed - page.goto: net::ERR_TOO_MANY_REDIRECTS at https://www.crowagent.ai/blog
Call log:
[2m  - navigating to "https://www.crowagent.ai/blog", waiting until "domcontentloaded"[22m

- https://www.crowagent.ai/intel/cyber-essentials-tracker: Navigation failed - page.goto: net::ERR_TOO_MANY_REDIRECTS at https://www.crowagent.ai/intel/cyber-essentials-tracker
Call log:
[2m  - navigating to "https://www.crowagent.ai/intel/cyber-essentials-tracker", waiting until "domcontentloaded"[22m

- https://www.crowagent.ai/intel/mees-tracker: Navigation failed - page.goto: net::ERR_TOO_MANY_REDIRECTS at https://www.crowagent.ai/intel/mees-tracker
Call log:
[2m  - navigating to "https://www.crowagent.ai/intel/mees-tracker", waiting until "domcontentloaded"[22m

- https://www.crowagent.ai/glossary: Navigation failed - page.goto: net::ERR_TOO_MANY_REDIRECTS at https://www.crowagent.ai/glossary
Call log:
[2m  - navigating to "https://www.crowagent.ai/glossary", waiting until "domcontentloaded"[22m

- link-check: Broken link or redirect loop - https://www.crowagent.ai/products - apiRequestContext.get: Max redirect count exceeded
Call log:
[2m  - → GET https://www.crowagent.ai/products[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:23 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /products/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=sGhZrXNn%2F4KLqfyqKpRxkfw6R8ZM2rDGRJJ7amYnY9D9v9hW2R0kSS6mm2nPGmVU3%2FjXLfZsQ0cFtXSkRRDA5ONkDJvBhoVM6TnKBlZJiumGv8fqibH5gvHjd%2BVLij2lUcEN2px5RkPfimmsQ%2Bld"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347eb0c2a4795-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/products/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:23 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /products[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=KATsX78MsX%2Fjy71Ah3PzN9eY0pEkTFZ9gEajtlwNeDpTInu8SfIksuGDRldKO7grOtK%2Fqy%2B%2BIysw0%2F%2BCZMeOapYbDlyj52EKczeFR1%2BGyQZKpq1uJpOjYzfm0GtMFcAA%2F0k%2FC64zMGlCjGszDOmn"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347eb6df4054f-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/products[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:23 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /products/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=suhU4zpA%2FbFVW5kG9Qao62LFEB2pQ8l8VfZnAEsy7Ke7vQMa9juLWBHqgP%2BcBxUyQFu509mGAX%2FJO5sj0A4uHvnjQPCj61Rx5R7BKUZqvBrF2%2B7VK0X%2BRyT63qg55zsyyS4XbE3fkQOjg1YU0VSB"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347ebdeeabf0e-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/products/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:23 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /products[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=73Dem81Mprda17C60eIEzx%2BTdCs4n049%2FN9tt6ny4XbAXGxJ2SjJtVTp%2Ft%2FmgdwX5Vn1N6jvyT2WVrNzc1AmUCRw98PdkOH2sK2KWzmbuG3TKEK%2F70MeKYc%2FjcE8PyUNX37silyJw03IHcZNzdYl"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347ec4a74719e-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/products[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:23 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /products/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=hOEnnA6HYeuhsflNNjgkbBwZFR%2B7LNDJ4WjFy51bNcxzjLGU0U5t38O%2Fa%2F3gj5F7DBdnmbrpiwKjTs0UQGQ27L60RsZ%2FmwU20v2bx45ZB129gtK4KI3T2p9ThfN3Q%2FGyOz7eTsa%2BAOSNiFnTFq8z"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347ecdb43002f-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/products/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:23 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /products[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=9cAKDxfJSVha4c1dvrqceXghOGFjbOQQ3EZa3KqsIz0bblHsRptYixPVldIQWnGdSKJLlckA9gU7Yp6WdsxTrEnT%2BoleBukULrktrDiXTjSrxJGf7BfwUlsaVzL9LhvINmao67WAIRwPDbLY2Tea"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347ed395def3c-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/products[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:23 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /products/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=YLpHM0CUcv20SLPZsy6GP3zDzLuPb%2FyuRUople%2F4vlmjlzKKDT4YiGruFuWqawxXA2K0b1k%2F2E126m7D%2BTOgIqYDwx9WIpaDNvlRaEy1QP0AxwDCjVTyn7E4Jv%2BFTyCSY38sBrA8C1oXUzwNXhWS"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347ed9e50b2a4-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/products/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:23 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /products[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=vqM%2BQ6in0M4fEf5pfZ7ujt7FNa%2BD9N4rKWXEf6a2232z6dPgAGp1LQsEjVDvJIOhqxVD4MoVU3wCwUSQM0RGTmni6HOgNfQrDLtEHvUn5h7SxtKJhF%2BOTCOZeEO41LkU1t88E7FxP2twBp2P68Ps"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347ee0ca39439-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/products[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:23 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /products/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=nZQyQ7YOtsAPW4ne6wCkdi%2FBEutOv%2BRBAW1Us3P3dIt2SVUe3FXgEQgTjcjHdDK9lXHRex5tzPc07Kg8WnR6YWXqLjG1PGQ%2FoJc4B7m5yZf%2But3UaUCrU%2BvNVkwcxhVaIlPve6AdDV0fuAhq00VZ"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347ee7a65f656-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m

- link-check: Broken link or redirect loop - https://www.crowagent.ai/blog - apiRequestContext.get: Max redirect count exceeded
Call log:
[2m  - → GET https://www.crowagent.ai/blog[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:24 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /blog/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=vVb6RMWOM3%2FWrDHe9t5R6qq3x1YW%2Bjp1JrSuHQPeR4c2LO%2Bb8PM7yGc%2BNwjus6dihE5%2FjDt6tcJHGYvBwVwjVo1698jyY7kdjRP2GSVpdTHBVIFB5MmCmQL4wB3CNARlMdMhwmUjA6cm%2BbPL%2FZr4"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f2192da0d7-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/blog/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:24 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /blog[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=PoMH%2Bz7qrgkse4vfZJq5b%2FPbkbZikLAXwhJadxn8K3274PGMaY4IL0BsfzJhcAPliCBE4w6FdC%2BkDHGC7EYEeCIXVuDKr4m5VQ7%2F80VL4Aqfn4muvbZ21wImDeYljr%2FDcPoofuGpDJ3h0DcySlWg"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f289b093db-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/blog[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:24 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /blog/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=VnBGy8kCtvvhW4GWLuWCodm8QoDgz6%2BLvVjsH4bSkJdpGKmI0AzVeMOpv5jYUutFZHmzsouPsDlWJOJVn%2F%2FtRb4YF7OqKYYD0kJnoRKR0%2BS%2F4ZsEzZdsZ%2Bs0Tqp3Q2WELQPsB%2BdIxy2vWJ6T6J9t"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f30be6582e-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/blog/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:24 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /blog[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=gMgNyE0%2B6R%2FjejXtK%2BcMHLuaV6Q8EJ%2BqsbAnLba%2FDV7KgHl7ieFAvg97jhQJC9ecUhQUS63yEpVjQDBX5I9CMKSqGoTuXbjavHA2sSRHWruMxjhKXHji8HF1p%2BkDM7S3UzOv0AvtUbMWhGGWbHs2"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f379df6556-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/blog[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:24 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /blog/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=pcfdNmhUuBTJLu5rEO4uyf3l8DjgmY41a2j6JG7xs9LXL4FLHFTGIgQoEqw96oMydFOUvdKf1RXDQ9PAX1LiOpVLFss965UfjSkd90B1mELiLs3XRhasDXwnxdiapMkt5V03fHFXBBgzrHXUAMBe"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f3e83e3052-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/blog/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:24 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /blog[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=wvYVjM3CSoB9Lr5BkEb9hHxqkCAseZr1cbQsw6y4ZsJFC8mIFEg9QXq%2BnRlso%2BMo9YovpWmX0MoHNZQv5XSU1aEb%2BvvwqG9eMlyKN3LOSwFmFd7w%2BFL3frLgj4cvE%2FNUq27UBT6v8tUiPd3s5SJT"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f45d8c63f4-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/blog[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:24 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /blog/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=lQToI2MuPJ%2BRL6qyQC5ZNV4dqppss2ClP%2FkUJFgWDJGx4KsZQSQjJoVhO5zhi0m6HwbhgDvsKH7aF4gSp8RTJbzBjYbEtiKbM0YZjzTd97m70cnD3Adlk153OeEEx%2B%2Bb3GY%2BXHTvaKnFNt5UXb1K"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f4dc96beb5-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/blog/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:24 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /blog[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=F3LYqFlzTwHlrQx%2FnNvlTtRw87ni%2BbM1DD9AFAyKlwSCroCa6iyl9iO5OTQJvmb%2FGpQZiMzmr3nsdO5tgXK35YUEabxECKjbdDE4VJiTn97kljlksbSfS6kcNjfQr%2BqciOT16JxnZ0PPiO4vB4IR"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f55d8937aa-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/blog[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:24 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /blog/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=sq3leRPpaUD6J%2B6OLXPhUxQ08DP3zH5%2BhoDQKNB0ysuCGKvxpeFfLdRMc8wFWLQqwNFj%2BIoRe57ZJDuDGvTu%2FM4oMj8Gse65A%2FHZT9iFDBnBHtpivRnpvIi4a8POEMVkCRcJq7urohzVBMpUyCUN"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f5cc1ca928-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m

- link-check: Broken link or redirect loop - https://www.crowagent.ai/intel/cyber-essentials-tracker - apiRequestContext.get: Max redirect count exceeded
Call log:
[2m  - → GET https://www.crowagent.ai/intel/cyber-essentials-tracker[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:25 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/cyber-essentials-tracker/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=ICt8Z39z7mtIYU08U2%2B5SSfm08FNdkAwM7xz0kBnTL5bNykEKOs%2BOz1lZN1JllaWNezO6moq9lTrTxzl3GXLDO%2FQEs16lVb6hgLC1wEc6U0niggQpJVFhrk3yrAFSMrRGcTVU6RQnAjeRehzd9h8"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f8cd6a940b-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/cyber-essentials-tracker/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:25 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/cyber-essentials-tracker[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=2aX9Wx2XRDXw%2BN7aICULl3tMkE9WXxsX1V8NlQ6ecDQQlAQ50yZ1pjmEJ4mcPSMhCWjBoxmBIKzfLpvCgiyF7efRqFLdeYFmwq0h2F%2Fa5lYA%2FqZP8uVt%2FI5TVCTQPXlTTr0VBYThWvc4b5NFvglK"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f91da8ef3c-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/cyber-essentials-tracker[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:25 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/cyber-essentials-tracker/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=lh1phd64vG47XzomvwcECEpUhxGZ7eNTsceJCuIZE41pqxEsnNimhBvIZWORfisq3BkaVNWRHr%2Fddz1PGd8IE0FTLrRicXNlrbqgeEGKAzQI4FOIaYMqex0CeoM%2F5zhmBITllXWSUn5KsEC%2FQMot"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f97d4077a5-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/cyber-essentials-tracker/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:25 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/cyber-essentials-tracker[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=sgb3%2BrqI4KErZg%2F4KXYZVg8otIyDHwlmjQ2hopDcggjaMzWGvnjfwgPC3i3eKcbiydbzfEJsguCARtd7zyIJHSWY9BPVbcFXvLokPsdbGc4Rau2uxgULScLMaG9%2BWqiTywtVQqQkYHIyycYbCv9%2B"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347f9fa3c76fc-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/cyber-essentials-tracker[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:25 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/cyber-essentials-tracker/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=8dpdlMTU3Tjn3jD7qOZigXbEjdjNZoQsmPAdmrEEUkRQbgwEvH652HNI60dY0i%2FfFh8GRVpP25I4BqQ9qnvC3QPDO%2BUbcCrOUZ1aGt91wyGpCvPichjVC2EpOWY6W4LrFTkyGlMjQrZVzRv%2Fc0wU"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347fa5ea5efe0-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/cyber-essentials-tracker/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:25 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/cyber-essentials-tracker[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=JgUgDIzu9AtRUFDbJSKAyzEGJpLX43O2H2Utw66JQJzsArdJtV0%2Bimrn%2BquWQTrIJT8ziFVpqX8s3xtBJru6rxf7LMzkzvGBW5k8qR4Xy2XXfD9NZe6rWn1YraD6AegX%2FA0UAD3LQVlwKkfWj06w"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347facb109627-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/cyber-essentials-tracker[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:25 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/cyber-essentials-tracker/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=o8ZIoAxwQYbp%2FBQUns427POsd7mXsW%2Br7NbitUHQnI2t4ddiF7sW6AGK5ZvyuUJQrDkZw%2FeMmFspndurlg7dmttNl33VZC4coc3dA00NdfUcmwoMPh%2F737X8WMKnBxxVw52wQavp5BvQhhNFlBL0"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347fb2f6a71f2-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/cyber-essentials-tracker/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:25 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/cyber-essentials-tracker[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=4YVCBrALJbzbTAXYVWurnhN6%2BgXV4J81r2AMwpjY%2Fergl1MBh7zImR2BPGJenTZNBIhY0nju2bj4qJbqmOs8N8hafxwa97CTgtmzttWhitOrfcJe%2F0%2B9hyY1c8%2F6mfsiDxZaqAF9%2FikTP04NmOTd"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347fbb9b0a678-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/cyber-essentials-tracker[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:25 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/cyber-essentials-tracker/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=aPBNDeAC8U2a3uid8DtiCLizAaHqRE2Ko3lDsXnaPYgDoq36GB32uYKRGAYnyjEjYBHA23%2FW9a3mMlsSGJrkv0rEP8pWpQAdp%2Bc1usV3wkO3lBSXqy7W1GrVuFOLTxkh%2BGlz8v1m7utctRlAvv78"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347fc2bae6397-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m

- link-check: Broken link or redirect loop - https://www.crowagent.ai/intel/mees-tracker - apiRequestContext.get: Max redirect count exceeded
Call log:
[2m  - → GET https://www.crowagent.ai/intel/mees-tracker[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:26 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/mees-tracker/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=09xmvthigY20zfro1MuFy44PPJyI%2FZuAKfrMEelNaKPrEVfXYfOKnBejVg1%2B28ejKIcNpwKAnqEejmPI2Q3i12H5MCFR8XdIZQh%2Fv1y3VG4tKZpBxOmsjHVQozYT9IjceAWErs23pDjP48TNz3pG"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347fcccdab153-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/mees-tracker/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:26 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/mees-tracker[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=vpsupV5lILU4x8jcoRjzO9f1JoTQegPyLDTc0gHLTjOgjSw3lAW5Vkj2uKYb3gtexqDm36j3SdGj8MrpmXOKnX%2FF88R8jbotVJhcTgL578K0YNDn%2FgbLDHzOUZQG9OYHg9Ys%2FzGwEw3GEtatXG3d"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347fd3c783161-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/mees-tracker[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:26 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/mees-tracker/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=J7M5ebSQG7tlYZYTPQL8Q20PEzWYiWunQQv11QG8TLRdw14IDYKiRh7zi%2Fmswxoj4K1tK2Y6GOX%2FV1u8avXvg7bGnt8iUboej5VpMoM6zIJCyYrqQVir1dQlcUWEgvy9AMCK%2BFhWVAiyXhFSgfqq"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347fd9bec129d-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/mees-tracker/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:26 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/mees-tracker[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=BCW6u5prgTkZgz%2BafdanNidESngP%2B7eS467E9Fup5Bp57TLItcWnmRHDn8j16TwmP%2B4bFuf%2FaSvMRyAxSCIvkeeJ9e%2FQVMzTcNZXkTNOX43trS5DcPkbwi%2F1hwB8VqttOJwdIzqnn5eENsjN%2Bk6e"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347fe0d1f4ae0-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/mees-tracker[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:26 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/mees-tracker/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=1KcSsBysorb%2Fgr3LxonCVNYEY5QaGH9svr67WZWeAh%2BCp8VWIVCsOsRzvfOG9YrIEMtY2Kkb9mZjg8X51UWH3dErxUcCPDTsRMEKLUUZruT7hf5%2BSqoap21ShqrvI0B6j2IKQ2urlafBN1FytLj3"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347fe8fac94df-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/mees-tracker/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:26 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/mees-tracker[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=RyYRMIFizqXytRReV4F8uBYQXuuZaEIVGN%2FgVIsSxxaNqhYTp7pspj0q7ieNGw8Hi7x%2FqNs%2FYBI%2BKoI9wO065q3WKMN2Uv4iSvrNaWM3qwlslwoNhfpvpob1NytPLOtH2k9ECDSOeYJXAbYWlMOi"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347ff1bbdd178-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/mees-tracker[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:26 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/mees-tracker/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=kC9%2F5s7um6QRhQHEDtNvK0gYKHc3VFF3EQPsvV7QoTJL0f9OdcYU4soe9frtiVwmd5buSJMYIj107gGVM3qOaHVK8Fku75ZLAhxmuHbq8mHdZLu400On%2FuButDc7ASoKGGUFg5MRgvcXZCDQc8cF"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7347ff7a85950f-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/mees-tracker/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:26 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/mees-tracker[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=buGvya9565RH6209IVOy0hyH3y6SOnMMM85fSTVxAFL8XoAIEpEX0UrgmQJi81iX3gcGKYc8M%2FB3JXC8K0xCTdhgwzQsN0EPcxF9L8WACNY10GbBoDGNJMUy%2BhZuLTVGNnQH43SZDPgAPAwHMRs0"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7348001aa8413c-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/intel/mees-tracker[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:26 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /intel/mees-tracker/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=QiPPpwzGjdfSa6j6yyzm5%2FgIYC1L6BowUjFZYRlyqchLjY8mdnxIKVxuecCg0N8pnPX3yd1Yx2f%2BnUbCyZ%2BT97cU%2FkWPEuv%2Fo7jMRlZRi9lSx9sDWXkUyS5DtmmI%2Fp1aivzLstxa7hSf9MamEzFG"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f734800acdf86d0-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m

- link-check: Broken link or redirect loop - https://www.crowagent.ai/glossary - apiRequestContext.get: Max redirect count exceeded
Call log:
[2m  - → GET https://www.crowagent.ai/glossary[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:27 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /glossary/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=U3xHx7fhk9ptx0B0%2Fk%2BIIvvW3LvglQl%2Bx1Z3eW2GFAZhPJ4vYOGFURBUQ4t%2FV1DGtLhf4xkIdVJBWkxj31Z%2BFMNgmcQnTyTlnmIqJ7PIk5YisHHkLZVMKcVB0XoE5SOHPWvAgwxqr2Q0yCyFWHik"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f734803bede4172-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/glossary/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:27 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /glossary[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=mnQ2ZOFIcLLdPGaxARnIzMnLF4etjRyPnZbmA0LbFGvaWcMj13%2FFom88lpSE5ybPgf5tl3ASXkxAcuDL5BHSmDVIxxnf6L0zUpvpOS%2FGBFbZfmzrrY4LLFejc9y8%2BYh799ujs6EtItxjrtdKbcg%2F"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7348043cf5256d-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/glossary[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:27 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /glossary/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=%2F3wk8KBrtQmqXK%2BxGLvswkq0N%2Fa2nHMURaT9lDW%2BtGazNZtfmPJsPbOUNQkKdTIBSVmmUgp%2ByEZ1jQrz7vuzOnh76%2B8XmiNOcVLau1zfFcpOz6SqkDmFpNFIkN5A3HRWzkWN4xYvb9vZAeJJk7Hb"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7348049d9688a9-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/glossary/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:27 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /glossary[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=2fCzTOpvpcd%2F8yXb3tjwpD47IHXg3sUuCU92hAO0T6WrGN9umuftID5IEk9UBUT%2F5yzhwtuS3T1fgbfZdtdTeV%2Ff1nUMZRKs8yZpkWmzw28TLxAvwPPp%2Beqnsbbk7neofVbN8MwRCdwm6Z%2BrnGyZ"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7348051fc5f83b-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/glossary[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:27 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /glossary/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=e1TEvSZ2r4CRImlTGE1zyZIDz01%2F5odGrjnmYhBy0uiZuKHmR8uzVJnvrN%2ByYZN3dAXAChKFbL3T%2F9PXnzNzOAF5EN4phsLUJ4buOgnDK24nlecKRUn476%2BfwH9%2BY1iaqud21o62IyKza2%2Fsck26"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f734805797fef07-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/glossary/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:27 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /glossary[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=RFssjasxMuu6jiryBgodYjvRpHjwwPKT9DBJsDqV%2Bg22WvU1sE7DtQ27ZT7N3CIFdN%2BMhyELjXGbB79fAdS9xHvrG%2FwJgZMUcNDNT7mkHLNLPPLIkHsqu%2BIqr%2BBCakBQ7VSG2ysnrkdohal9kEan"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f734805ea64652d-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/glossary[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:27 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /glossary/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=lrHljdXqu8bF3H6HxMVI3hSlircfQ27AT6%2FzPXTYbfep6RieondataYPd%2BvVrKZxp7iTyILYlbhDDFCHrOTN0fb%2BwzIMCeEZyUuN4e0iJ0PxWgWj2hhktKC63ff1aGd24zyS433gmHywGPL9jBws"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7348066a750b09-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/glossary/[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:27 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /glossary[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=otTfuHeS0ZCtwTcIiG4U0jYpDkympblO85QYXSPS%2FnSf7xN0OqIBp4IZMlh5QR1VbJtkdHVEx2rx05EpXDONKIKUHbN7ENZHcdDFUUc4qn%2BVj2KUmjK4v92JECDCMXoGUGUqadnV9dsz0nzcaKZy"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f734806d92d9490-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m
[2m  - → GET https://www.crowagent.ai/glossary[22m
[2m    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/147.0.7727.15 Safari/537.36[22m
[2m    - accept: */*[22m
[2m    - accept-encoding: gzip,deflate,br[22m
[2m  - ← 308 Permanent Redirect[22m
[2m    - date: Tue, 05 May 2026 22:46:27 GMT[22m
[2m    - content-length: 0[22m
[2m    - connection: keep-alive[22m
[2m    - location: /glossary/[22m
[2m    - access-control-allow-origin: *[22m
[2m    - strict-transport-security: max-age=31536000; includeSubDomains; preload[22m
[2m    - content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com; connect-src 'self' https://app.crowagent.ai https://crowagent-platform-production.up.railway.app https://formspree.io https://eu.posthog.com; frame-src https://calendly.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io; object-src 'none'; worker-src 'self'; report-to default[22m
[2m    - permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()[22m
[2m    - referrer-policy: strict-origin-when-cross-origin[22m
[2m    - reporting-endpoints: default="https://app.crowagent.ai/api/csp-report"[22m
[2m    - x-content-type-options: nosniff[22m
[2m    - x-frame-options: DENY[22m
[2m    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=mJvcvQ7mEXf4He6Qjy2hpo%2FAmQUFnv40mUxNPHFuLBZbBidKnDhefufQ%2FNI6aKpT5YwpXHej1P7OkQY2PN12baBY6%2FPtVHCOQOmCy5nZ9SIvugG7wI4cMclfDYdwQFDRHYewNWyZvkulwj1flr%2BU"}]}[22m
[2m    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}[22m
[2m    - server: cloudflare[22m
[2m    - cf-cache-status: DYNAMIC[22m
[2m    - cf-ray: 9f7348075a4cf663-LHR[22m
[2m    - alt-svc: h3=":443"; ma=86400[22m


## P1 Findings
- https://www.crowagent.ai/: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-I/K++jyM82kz1ufL+oznM4xUCI2XSB9Dix0ToR6muCA='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/: Console error - Failed to find a valid digest in the 'integrity' attribute for resource 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js' with computed SHA-384 integrity '+VfUPEb0PdtChMwmBcBmykRMDd+v6D/oFmB3rZM/puCMDYcIvF968OimRh4KQY9a'. The resource has been blocked.
- https://www.crowagent.ai/: Page error - posthog.opt_out_capturing is not a function
- https://www.crowagent.ai/pricing: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-oycslJGVTqUnYWZkfjzn8hnVUD5zRoBvIshAK2lX6qo='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/pricing: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/crowagent-core: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-hphl1BaeVy5eIybLroWN4sFEiqIdFW0UKsL25U5NQYw='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/crowagent-core: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/crowmark: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-31FAbsfQpbbr6ZKsJit+BtMIflUdmh1NDMg/vOudXl8='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/crowmark: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/crowcyber: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-dqso4MU5/fDwpi2v8viKO16kF9Kfsl26ehAb6qrNj10='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/crowcyber: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/crowcash: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-iAV9JrRWEWJu0kIQ/B7xSDESvRh/Ej3gYEjUW4NN1m0='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/crowcash: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/crowesg: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-q6qtgSwOxRiw1MlYgZ0MoINzD0TxZhTUdpyb0ZCUKLE='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/crowesg: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/blog/csrd-omnibus-i-2026: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-bbdcc5KwnFqehhNz9p1PDjeHO+6oyenVCLbxyr1Is2E='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/blog/csrd-omnibus-i-2026: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/blog/csrd-omnibus-i-2026: axe serious: color-contrast - Elements must meet minimum color contrast ratio thresholds (4 nodes)
- https://www.crowagent.ai/blog/mees-band-c-2028: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-uzidKVE3W/uKzipcOaEf83c5Nt1JTFQhzaFNElwdiEE='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/blog/mees-band-c-2028: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/blog/mees-band-c-2028: axe serious: color-contrast - Elements must meet minimum color contrast ratio thresholds (1 nodes)
- https://www.crowagent.ai/blog/ppn-002-guide: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-DOmwCBZ3khaEUapmfAMw9HB52j1b5V+9I00PJDNPZ7Q='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/blog/ppn-002-guide: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/blog/ppn-002-guide: axe serious: color-contrast - Elements must meet minimum color contrast ratio thresholds (1 nodes)
- https://www.crowagent.ai/blog/mees-commercial-property-guide: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-Lnp92p/pLhqIx16Wd9EJ2VT8gYQCiVdt7h/JqzISOMQ='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/blog/mees-commercial-property-guide: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/blog/mees-commercial-property-guide: axe serious: link-in-text-block - Links must be distinguishable without relying on color (1 nodes)
- https://www.crowagent.ai/blog/ppn-002-social-value-guide: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-Jpr7ZynhPavwOKgJ48zZpJ4j9BT4tAmqPn9OkNXue0U='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/blog/ppn-002-social-value-guide: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/blog/ppn-002-social-value-guide: axe serious: color-contrast - Elements must meet minimum color contrast ratio thresholds (1 nodes)
- https://www.crowagent.ai/blog/retrofit-cost-calculator-guide: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-QYqb4WO0tMgnvJmr4O1Aj2F+5zC3qowOvjxXsSBQkLw='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/blog/retrofit-cost-calculator-guide: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/blog/retrofit-cost-calculator-guide: axe serious: color-contrast - Elements must meet minimum color contrast ratio thresholds (1 nodes)
- https://www.crowagent.ai/blog/cyber-essentials-v3-3-danzell-2026: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-TOC28y1TB9z57Hmi9idVVFHMOmrVGxQb9g+bwRHYghI='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/blog/cyber-essentials-v3-3-danzell-2026: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/blog/cyber-essentials-v3-3-danzell-2026: axe serious: color-contrast - Elements must meet minimum color contrast ratio thresholds (1 nodes)
- https://www.crowagent.ai/blog/ppn-014-cyber-essentials-guide: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-bm4XMADnnMfw95baMJg2ynqA9IiDxWx+B/QNONgbIxQ='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/blog/ppn-014-cyber-essentials-guide: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/blog/ppn-014-cyber-essentials-guide: axe serious: color-contrast - Elements must meet minimum color contrast ratio thresholds (1 nodes)
- https://www.crowagent.ai/blog/mfa-mandatory-2026: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-XYOAVuAUg/1t/w0KM5oz5CiPURCOSXBUSxl+vgXpqWY='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/blog/mfa-mandatory-2026: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/blog/mfa-mandatory-2026: axe serious: color-contrast - Elements must meet minimum color contrast ratio thresholds (1 nodes)
- https://www.crowagent.ai/about: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/about: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-D2uvGeBfNlYPBRuCQyOqUlCHzuSgFk1fPOwnU+FuvdU='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/partners: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-C/C3zDFmT5Lh74q1YqQBL108MnjmhEILk6OFYsnyq00='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/partners: Console error - Loading the image 'data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A9DB8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/partners: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/partners: Console error - Failed to load resource: the server responded with a status of 400 ()
- https://www.crowagent.ai/partners: Page error - [Cloudflare Turnstile] Error: 400020.
- https://www.crowagent.ai/roadmap: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-pnAhERdWd3m4NmGAQHNiQt+/uzQofXLuNI3JutWak1E='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/roadmap: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/security: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/security: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-0656vWaGpmpFPIuYfjnJwDd5ItRSlR8JJ14fdbyQGIs='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/resources: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-LXEIR5svdNGC26e3Z6c3CUcRcF39bUrWrFvBdS4bItA='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/resources: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/demo: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-VDpr7z64TF7IbYEGSxG0aRvxPvhhwDAn3Khet7bsEfw='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/demo: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/demo: Console error - Access to script at 'https://assets.calendly.com/assets/external/widget.js' from origin 'https://www.crowagent.ai' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 'https://calendly.com' that is not equal to the supplied origin.
- https://www.crowagent.ai/demo: Console error - Failed to load resource: net::ERR_FAILED
- https://www.crowagent.ai/contact: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/contact: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-3Y3SJKMG6YOKe9UeZFEaUrAYrw4Xvyg6QfFWFz5K8b4='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/contact: Console error - Failed to load resource: the server responded with a status of 400 ()
- https://www.crowagent.ai/contact: Page error - [Cloudflare Turnstile] Error: 400020.
- https://www.crowagent.ai/faq: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-qb858/gZZAneT2fufScl3+mFrOTLPu7m5gibwMp8dpM='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/faq: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/privacy: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/privacy: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-p7sGm/tOII4/Na86j1EO2UcLJFBlafTE51HB7OrTub8='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/terms: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/terms: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-Me9J2YywydUUfhyRKGMUf3gIgYb+2kMwtKYErfC8EZQ='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/terms: axe serious: link-in-text-block - Links must be distinguishable without relying on color (2 nodes)
- https://www.crowagent.ai/cookies: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/cookies: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-yi0ER52SXCreLxV3gdpEwqtFSyiFOsrOXrkR/AYlS4M='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/cookies: axe serious: link-in-text-block - Links must be distinguishable without relying on color (2 nodes)
- https://www.crowagent.ai/tools: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-1JxM964TcAFcYiBsyEk6J/Ql7bd6O4J8V+YJ6ek19f8='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/tools: Console error - Loading the image 'data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E' violates the following Content Security Policy directive: "default-src 'self'". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback. The action has been blocked.
- https://www.crowagent.ai/tools/mees-risk-snapshot/methodology: Console error - Executing inline script violates the following Content Security Policy directive 'script-src 'self' https://assets.calendly.com https://eu.posthog.com https://challenges.cloudflare.com https://cdnjs.cloudflare.com'. Either the 'unsafe-inline' keyword, a hash ('sha256-4o1n8L+wD2bG/+LPkkPO+sD2lMT+Y6xaGTghx29oIoE='), or a nonce ('nonce-...') is required to enable inline execution. The action has been blocked.
- https://www.crowagent.ai/tools/mees-risk-snapshot/methodology: Console error - Refused to apply style from 'https://www.crowagent.ai/tools/mees-risk-snapshot/styles.min.css?v=51' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.
- https://www.crowagent.ai/tools/mees-risk-snapshot/methodology: Console error - Refused to apply style from 'https://www.crowagent.ai/tools/mees-risk-snapshot/print.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.
- https://www.crowagent.ai/tools/mees-risk-snapshot/methodology: Console error - Failed to load resource: the server responded with a status of 404 ()
- ... 53 more P1 findings in JSON report.

## P2 Findings
- https://www.crowagent.ai/: Duplicate id - back-to-top
- https://www.crowagent.ai/: Small tap target - Start free trial → (124x28)
- https://www.crowagent.ai/: Small tap target - Products (72x16)
- https://www.crowagent.ai/: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/pricing: Small tap target - Products (72x16)
- https://www.crowagent.ai/pricing: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/pricing: Small tap target - Toggle monthly/annual billing (40x22)
- https://www.crowagent.ai/pricing: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/pricing: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/crowagent-core: Small tap target - Products (72x16)
- https://www.crowagent.ai/crowagent-core: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/crowagent-core: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/crowagent-core: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/crowagent-core: Small tap target - How does CrowMark work? (326x17)
- https://www.crowagent.ai/crowmark: Small tap target - Products (72x16)
- https://www.crowagent.ai/crowmark: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/crowmark: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/crowmark: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/crowmark: Small tap target - How does CrowMark work? (326x17)
- https://www.crowagent.ai/crowcyber: Small tap target - Products (72x16)
- https://www.crowagent.ai/crowcyber: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/crowcyber: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/crowcyber: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/crowcyber: Small tap target - How does CrowMark work? (326x17)
- https://www.crowagent.ai/crowcash: Small tap target - Products (72x16)
- https://www.crowagent.ai/crowcash: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/crowcash: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/crowcash: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/crowcash: Small tap target - How does CrowMark work? (326x17)
- https://www.crowagent.ai/crowesg: Small tap target - Products (72x16)
- https://www.crowagent.ai/crowesg: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/crowesg: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/crowesg: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/crowesg: Small tap target - How does CrowMark work? (326x17)
- https://www.crowagent.ai/csrd: Small tap target - CrowAgent home (112x28)
- https://www.crowagent.ai/blog/csrd-omnibus-i-2026: Small tap target - Products (72x16)
- https://www.crowagent.ai/blog/csrd-omnibus-i-2026: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/blog/mees-band-c-2028: Small tap target - Products (72x16)
- https://www.crowagent.ai/blog/mees-band-c-2028: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/blog/ppn-002-guide: Small tap target - Products (72x16)
- https://www.crowagent.ai/blog/ppn-002-guide: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/blog/mees-commercial-property-guide: Small tap target - Products (72x16)
- https://www.crowagent.ai/blog/mees-commercial-property-guide: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/blog/ppn-002-social-value-guide: Small tap target - Products (72x16)
- https://www.crowagent.ai/blog/ppn-002-social-value-guide: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/blog/retrofit-cost-calculator-guide: Small tap target - Products (72x16)
- https://www.crowagent.ai/blog/retrofit-cost-calculator-guide: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/blog/cyber-essentials-v3-3-danzell-2026: Small tap target - Products (72x16)
- https://www.crowagent.ai/blog/cyber-essentials-v3-3-danzell-2026: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/blog/ppn-014-cyber-essentials-guide: Small tap target - Products (72x16)
- https://www.crowagent.ai/blog/ppn-014-cyber-essentials-guide: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/blog/mfa-mandatory-2026: Small tap target - Products (72x16)
- https://www.crowagent.ai/blog/mfa-mandatory-2026: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/about: Small tap target - Products (72x16)
- https://www.crowagent.ai/about: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/about: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/about: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/about: Small tap target - How does CrowMark work? (326x17)
- https://www.crowagent.ai/partners: Small tap target - Products (72x16)
- https://www.crowagent.ai/partners: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/partners: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/partners: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/partners: Small tap target - How does CrowMark work? (326x17)
- https://www.crowagent.ai/roadmap: Missing twitter:image
- https://www.crowagent.ai/roadmap: Small tap target - Products (72x16)
- https://www.crowagent.ai/roadmap: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/roadmap: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/roadmap: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/roadmap: Small tap target - How does CrowMark work? (326x17)
- https://www.crowagent.ai/security: Missing twitter:image
- https://www.crowagent.ai/security: Small tap target - Products (72x16)
- https://www.crowagent.ai/security: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/security: Small tap target - Close chat (27x27)
- https://www.crowagent.ai/security: Small tap target - What is MEES 2028? (326x17)
- https://www.crowagent.ai/security: Small tap target - How does CrowMark work? (326x17)
- https://www.crowagent.ai/resources: Small tap target - Products (72x16)
- https://www.crowagent.ai/resources: Small tap target - Free Tools (77x16)
- https://www.crowagent.ai/resources: Small tap target - Close chat (27x27)
- ... 102 more P2 findings in JSON report.

## P3 Findings
- https://www.crowagent.ai/: Broken image - https://www.crowagent.ai/Assets/screenshots/epc-check.png
- https://www.crowagent.ai/: Broken image - https://www.crowagent.ai/Assets/screenshots/crowmark.png
- https://www.crowagent.ai/: Broken image - https://www.crowagent.ai/Assets/screenshots/csrd-checker.png
- https://www.crowagent.ai/csrd: Broken image - https://app.crowagent.ai/_next/image?url=%2Fbrand%2Fcrowagent_wordmark_dark_560x140.png&w=128&q=75&dpl=dpl_4DahUBZEVD2foM7AUo2NuyKYvGha
- https://www.crowagent.ai/tools/mees-risk-snapshot: Broken image - https://app.crowagent.ai/_next/image?url=%2Fbrand%2Fcrowagent_wordmark_dark_560x140.png&w=128&q=75&dpl=dpl_4DahUBZEVD2foM7AUo2NuyKYvGha
- https://www.crowagent.ai/tools/ppn002-calculator: Broken image - https://app.crowagent.ai/_next/image?url=%2Fbrand%2Fcrowagent_wordmark_dark_560x140.png&w=128&q=75&dpl=dpl_4DahUBZEVD2foM7AUo2NuyKYvGha
- https://www.crowagent.ai/tools/cyber-essentials-readiness: Broken image - https://app.crowagent.ai/_next/image?url=%2Fbrand%2Fcrowagent_wordmark_dark_560x140.png&w=128&q=75&dpl=dpl_4DahUBZEVD2foM7AUo2NuyKYvGha
- https://www.crowagent.ai/tools/late-payment-calculator: Broken image - https://app.crowagent.ai/_next/image?url=%2Fbrand%2Fcrowagent_wordmark_dark_560x140.png&w=128&q=75&dpl=dpl_4DahUBZEVD2foM7AUo2NuyKYvGha
- https://www.crowagent.ai/tools/csrd-checker: Broken image - https://app.crowagent.ai/_next/image?url=%2Fbrand%2Fcrowagent_wordmark_dark_560x140.png&w=128&q=75&dpl=dpl_4DahUBZEVD2foM7AUo2NuyKYvGha
- https://www.crowagent.ai/tools/vsme-materiality-light: Broken image - https://app.crowagent.ai/_next/image?url=%2Fbrand%2Fcrowagent_wordmark_dark_560x140.png&w=128&q=75&dpl=dpl_4DahUBZEVD2foM7AUo2NuyKYvGha
- https://www.crowagent.ai/status: axe moderate: meta-viewport - Zooming and scaling must not be disabled (1 nodes)

## Page Inventory
- https://www.crowagent.ai/: status 200, title "CrowAgent - MEES, Social Value, Cyber, Credit Control & ESG Software"
- https://www.crowagent.ai/pricing: status 200, title "Pricing - CrowAgent | Compliance Software"
- https://www.crowagent.ai/products: failed - page.goto: net::ERR_TOO_MANY_REDIRECTS at https://www.crowagent.ai/products
Call log:
[2m  - navigating to "https://www.crowagent.ai/products", waiting until "domcontentloaded"[22m

- https://www.crowagent.ai/crowagent-core: status 200, title "CrowAgent Core - CrowAgent | Compliance Software"
- https://www.crowagent.ai/crowmark: status 200, title "CrowMark - CrowAgent | Compliance Software"
- https://www.crowagent.ai/crowcyber: status 200, title "CrowCyber - CrowAgent | Cyber Essentials Co-Pilot"
- https://www.crowagent.ai/crowcash: status 200, title "CrowCash - CrowAgent | AI Credit Control for UK SMEs"
- https://www.crowagent.ai/crowesg: status 200, title "CrowESG - CrowAgent | Multi-Framework ESG Reporting"
- https://www.crowagent.ai/csrd: status 200, title "CSRD Applicability Checker - Free, Omnibus I Thresholds - Free Tools - CrowAgent"
- https://www.crowagent.ai/blog: failed - page.goto: net::ERR_TOO_MANY_REDIRECTS at https://www.crowagent.ai/blog
Call log:
[2m  - navigating to "https://www.crowagent.ai/blog", waiting until "domcontentloaded"[22m

- https://www.crowagent.ai/blog/csrd-omnibus-i-2026: status 200, title "CSRD and Omnibus I: What Changed on 18 March 2026 - CrowAgent"
- https://www.crowagent.ai/blog/mees-band-c-2028: status 200, title "MEES Band C 2028: What Commercial Landlords Need to Know | CrowAgent"
- https://www.crowagent.ai/blog/ppn-002-guide: status 200, title "PPN 002 Social Value: Complete Guide for UK Public Sector Suppliers | CrowAgent"
- https://www.crowagent.ai/blog/mees-commercial-property-guide: status 200, title "MEES 2028: The Commercial Landlord's Complete Guide to EPC Band C | CrowAgent"
- https://www.crowagent.ai/blog/ppn-002-social-value-guide: status 200, title "PPN 002: The Complete Guide to Social Value Scoring for UK Bids | CrowAgent"
- https://www.crowagent.ai/blog/retrofit-cost-calculator-guide: status 200, title "Commercial Property Retrofit Costs for MEES Band C Compliance | CrowAgent"
- https://www.crowagent.ai/blog/cyber-essentials-v3-3-danzell-2026: status 200, title "Cyber Essentials v3.3 (Danzell): What Changed in April 2026 | CrowAgent"
- https://www.crowagent.ai/blog/ppn-014-cyber-essentials-guide: status 200, title "PPN 014/21 Explained: Cyber Essentials for UK Public Sector | CrowAgent"
- https://www.crowagent.ai/blog/mfa-mandatory-2026: status 200, title "MFA Mandatory from April 2026: Guide for UK SMEs | CrowAgent"
- https://www.crowagent.ai/intel/cyber-essentials-tracker: failed - page.goto: net::ERR_TOO_MANY_REDIRECTS at https://www.crowagent.ai/intel/cyber-essentials-tracker
Call log:
[2m  - navigating to "https://www.crowagent.ai/intel/cyber-essentials-tracker", waiting until "domcontentloaded"[22m

- https://www.crowagent.ai/intel/mees-tracker: failed - page.goto: net::ERR_TOO_MANY_REDIRECTS at https://www.crowagent.ai/intel/mees-tracker
Call log:
[2m  - navigating to "https://www.crowagent.ai/intel/mees-tracker", waiting until "domcontentloaded"[22m

- https://www.crowagent.ai/about: status 200, title "About - CrowAgent | Compliance Software"
- https://www.crowagent.ai/partners: status 200, title "Partners - CrowAgent | Compliance Software"
- https://www.crowagent.ai/roadmap: status 200, title "Roadmap - CrowAgent | Compliance Software"
- https://www.crowagent.ai/security: status 200, title "Security - CrowAgent | Compliance Software"
- https://www.crowagent.ai/resources: status 200, title "Resources - CrowAgent | Compliance Software"
- https://www.crowagent.ai/demo: status 200, title "Book a Demo - CrowAgent | Compliance Software"
- https://www.crowagent.ai/contact: status 200, title "Contact - CrowAgent | Compliance Software"
- https://www.crowagent.ai/faq: status 200, title "FAQ - CrowAgent | Compliance Software"
- https://www.crowagent.ai/privacy: status 200, title "Privacy Policy - CrowAgent | Compliance Software"
- https://www.crowagent.ai/terms: status 200, title "Terms of Service - CrowAgent | Compliance Software"
- https://www.crowagent.ai/cookies: status 200, title "Cookie Policy - CrowAgent | Compliance Software"
- https://www.crowagent.ai/glossary: failed - page.goto: net::ERR_TOO_MANY_REDIRECTS at https://www.crowagent.ai/glossary
Call log:
[2m  - navigating to "https://www.crowagent.ai/glossary", waiting until "domcontentloaded"[22m

- https://www.crowagent.ai/tools/mees-risk-snapshot: status 200, title "MEES Risk Snapshot - UK Commercial Property Compliance - Free Tools - CrowAgent"
- https://www.crowagent.ai/tools/ppn002-calculator: status 200, title "PPN 002 Social Value Calculator - Free Tools - CrowAgent"
- https://www.crowagent.ai/tools/cyber-essentials-readiness: status 200, title "Cyber Essentials Readiness - Free 5-control v3.3 (Danzell) Assessment - Free Tools - CrowAgent"
- https://www.crowagent.ai/tools/late-payment-calculator: status 200, title "Late Payment Calculator - How much is late payment costing your business? - Free Tools - CrowAgent"
- https://www.crowagent.ai/tools/csrd-checker: status 200, title "CSRD Applicability Checker - Free, Omnibus I Thresholds - Free Tools - CrowAgent"
- https://www.crowagent.ai/tools/vsme-materiality-light: status 200, title "VSME Materiality Light - Free 10-topic ESRS materiality assessment for SMEs - Free Tools - CrowAgent"
- https://www.crowagent.ai/tools: status 200, title "Free Compliance Tools - CrowAgent | MEES, PPN, CSRD, Cyber, Late Payment"
- https://www.crowagent.ai/tools/mees-risk-snapshot/methodology: status 200, title "MEES Risk Snapshot Methodology - SI 2015/962 Reg 39 Explained | CrowAgent"
- https://www.crowagent.ai/tools/ppn002-calculator/methodology: status 200, title "PPN 002 Calculator Methodology - The 10% Rule Explained | CrowAgent"
- https://www.crowagent.ai/tools/cyber-essentials-readiness/methodology: status 200, title "Cyber Essentials Readiness Methodology - v3.3 'Danzell' Explained | CrowAgent"
- https://www.crowagent.ai/tools/late-payment-calculator/methodology: status 200, title "Late Payment Calculator Methodology - The 1998 Act Explained | CrowAgent"
- https://www.crowagent.ai/tools/csrd-checker/methodology: status 200, title "CSRD Checker Methodology - Omnibus I Thresholds Explained | CrowAgent"
- https://www.crowagent.ai/tools/vsme-materiality-light/methodology: status 200, title "VSME Materiality Light Methodology - EFRAG VSME 2024 | CrowAgent"
- https://www.crowagent.ai/changelog: status 200, title "Changelog - CrowAgent | Compliance Software Release Notes"
- https://www.crowagent.ai/status: status 200, title "CrowAgent status"
- https://www.crowagent.ai/cookie-preferences: status 200, title "Cookie Preferences - CrowAgent | Compliance Software"
- https://www.crowagent.ai/changelog.xml: status 404, title "Page Not Found - CrowAgent"
