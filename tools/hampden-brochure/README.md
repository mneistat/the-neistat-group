# Hampden board brochure

Four US Letter pages, updated September 25, 2026. Original fonts, branding, and photography are bundled.

From the repository root:

```sh
pip install -r tools/hampden-brochure/requirements.txt
python3 tools/hampden-brochure/generate_brochure.py --output hampden-board-site/Hampden-Board-Brochure.pdf
```

For a review PDF, append `--site-url <verified-preview-url>` so the online-background link stays with the reviewed website. The default links to production; regenerate with the default when publishing the approved version. The PDF committed on this draft branch links to its branch preview.

Page 1: personal approach and individual owner priorities. Page 2: two sale choices, including public or confidential full-building marketing. Page 3: valuation, continued ownership, negotiated leases, and lending context. Page 4: commission, five-item valuation checklist, supporting records, approvals, and contact.

The website retains detailed policy dates, primary-source links, unverified property figures, and their qualifications. Lending and Chicago approval sources were reviewed September 25, 2026; no building-specific lending, tax, or legal determination is made. Individual owners should consult their advisors.

Validation: all four PDF pages were rendered and visually reviewed. Desktop website review confirmed image loading, no horizontal overflow, working section navigation and disclosure links, and no site-origin JavaScript errors. HTML checks confirmed unique IDs, valid internal anchors, required sale/commission content, and unchanged embedded artwork. Mobile media rules were preserved and the new two-column sections stack below 600px; a separate mobile-browser visual review remains pending.

Review only: `codex/hampden-owner-advisory`, draft PR #3, based on `hampden-board-site` at `6ec7e16`. Do not merge or promote until the user approves this version.
