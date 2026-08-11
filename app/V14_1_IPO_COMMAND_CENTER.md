CREDONOMICS V14.1 — IPO COMMAND CENTER
=======================================

DESIGN / INFORMATION-ARCHITECTURE INSPIRATION
The redesign studies the depth of established Indian IPO portals such as Chittorgarh:
- separate Current / Upcoming / Mainboard / SME surfaces
- IPO timetable/calendar
- subscription tracker
- document/prospectus access
- issue details
- reservation / anchor data
- lot-size/application data
- promoter holding
- financials and KPIs
- peer-relative valuation
- objects of the issue
- listing information
- FAQs

CredoNomics does NOT copy Chittorgarh content, reviews, ads, data, HTML, CSS or branding.
The information architecture is rebuilt in the CredoNomics premium V13 visual system.

PUBLIC ROUTES
/ipo
/ipo/current
/ipo/upcoming
/ipo/mainboard
/ipo/sme
/ipo/calendar
/ipo/subscription
/ipo/documents
/ipo/analyzer
/ipo/methodology
/ipo/<normalized-ipo>

INDIVIDUAL IPO PAGE
Sticky research navigation:
Overview | IPO Details | Timeline | Lot Size | Financials | KPIs |
Valuation | Promoters | Subscription | Documents

SCHEMA EXTENSIONS
Optional normalized fields now support:
- reservation by investor category
- detailed retail / sNII / bNII application minimums
- anchor-investor allocation / lock-in dates
- company promoter / employee context
- post-listing data
- split sNII / bNII subscription

COMPLIANCE BOUNDARY
- Data Score remains statistical.
- Subscription remains outside the fundamental score.
- GMP remains outside the fundamental score.
- No Subscribe / Avoid / Buy calls.
- No listing-gain prediction or price target.

MF SAFETY
MF portfolio files/data/scripts and app/globals.css remain excluded.
