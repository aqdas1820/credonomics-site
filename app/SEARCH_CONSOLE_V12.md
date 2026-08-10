CREDONOMICS V12 — GOOGLE SEARCH / ENTITY LAUNCH CHECKLIST
========================================================

CODE THAT V12 HANDLES
- Canonical hostname: https://www.credonomics.in
- 308 redirect from apex credonomics.in to www.credonomics.in
- Self-canonical metadata
- Crawlable robots.txt with sitemap
- Dynamic canonical sitemap
- WebSite structured data with name: CredoNomics
- Organization structured data with logo, official URL, email, phone and Instagram
- Stable square favicon/icon assets
- Official identity page: /official
- All verified cards directory: /cards/all
- Card, issuer and category internal linking
- Search/indexing health checks

MANUAL GOOGLE SEARCH CONSOLE STEPS (OWNER ACTION REQUIRED)
1. Create/verify the Domain property:
   credonomics.in

2. Use the DNS TXT token Google provides.
   Do not paste an invented token into the code.

3. Add NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel only if you also want
   Google HTML meta-tag verification. DNS Domain verification is preferred for
   whole-domain visibility.

4. Submit:
   https://www.credonomics.in/sitemap.xml

5. URL Inspection -> Test live URL -> Request indexing for:
   https://www.credonomics.in/
   https://www.credonomics.in/cards
   https://www.credonomics.in/cards/all
   https://www.credonomics.in/cards/cashback
   https://www.credonomics.in/cards/fuel
   https://www.credonomics.in/cards/coverage
   https://www.credonomics.in/official

6. In URL Inspection confirm:
   - Page fetch: Successful
   - Indexing allowed: Yes
   - User-declared canonical: https://www.credonomics.in/...
   - Google-selected canonical: eventually matches the www URL

7. Review:
   - Page indexing
   - Manual actions
   - Security issues
   - Sitemaps
   - Links
   - Performance

IMPORTANT
Search indexing cannot be guaranteed or forced by code. V12 improves the signals
Google can use; Search Console is still needed to diagnose Google's actual index state.
