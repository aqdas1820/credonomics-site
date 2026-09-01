CredoNomics MF Tools Link Patch

Why this is needed
------------------
The 2025 + 2026 MF dataset was pushed, but the public /tools hub was not changed.
The local MF tracker page is also still modified but unstaged.

This patch adds a visible "MF Portfolio Tracker" card to /tools and changes the
hard-coded Methodology card number from 04 to 05.

It DOES NOT touch:
- MF dataset
- extraction pipeline
- OpenGraph image routes
- Twitter image routes
- other credit-card tools

How to run
----------
1. Copy add-mf-portfolio-tracker-to-tools.ps1 to the CredoNomics project root.
2. Run:

powershell -ExecutionPolicy Bypass -File ".\add-mf-portfolio-tracker-to-tools.ps1"

3. Review the diff.
4. Stage only:
   app/tools/page.tsx
   app/tools/mf-portfolio-tracker/page.tsx
5. Commit and push.

The existing OpenGraph/Twitter build error is unrelated and can be fixed
separately.
