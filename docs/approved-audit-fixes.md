# Approved visual and UX audit fixes

Implemented on `codex/website-audit-fixes` after Matthew approved the audit recommendations. Keep PR #2 in draft. No merge or production promotion is authorized.

## Page changes

| Page | Changes |
| --- | --- |
| Homepage | Wider supporting copy includes buyers; buying path leads to the process guide; photographic Selected Work lead; smaller-screen selections reveal and focus the selected assignment; three original testimonials in an editorial composition; exact approved grandfather quote; less repeated section spacing; contextual press links. |
| Selected Work | Wellington photography leads; Lake Street remains labeled illustrative supporting material and is classified Commercial; alternating image widths are consistent; all published figures and publication gates remain intact. |
| Neighborhood hub | Belmont Harbor lead varies the opening from Lincoln Park; image credits follow the relevant imagery; stronger text overlay. |
| Lincoln Park | Architectural photograph accompanies housing descriptions; redundant housing/parks lists removed from At a Glance; broker-note section link; tighter adjoining light sections; contextual closing question. |
| Lakeview | Same guide refinements; the single nearby assignment spans an intentional image-and-text composition. |
| Seller Strategy | Approved listing photograph demonstrates presentation at its native scale; repetitive comparison table removed; less spacing between adjoining dark sections. |
| Affordability | Readable amortization row headers; horizontal table scrolling; clearer secondary text; consistent control geometry; compact sticky estimate at tablet/phone widths, including the last-valid-result warning. |
| About | People First opening; portrait immediately follows a shorter hero; exact grandfather quotation; hospitality context; entry blackout, counters, and background parallax removed; portrait crop preserves the head. |
| Contact | Optional intent can return to No preference; native select indicator; more specific invitation; consistent form geometry. |

Shared changes: active page/parent navigation, larger footer link targets, native pointer, invalid form field and label centered clear of the fixed header, and mobile input sizing. The cursor removal and shared asset version updates also apply to the existing supporting pages.

## Verification

- 17 Node/jsdom regression checks cover mortgage mathematics, schedule reconciliation, all four form flows with mocked delivery, optional intent reset, invalid-field focus/scroll, calculator estimate synchronization, selected-assignment focus/scroll, navigation, publication gates, scripts, landmarks, unique IDs, and local links.
- Generated proof content and `git diff --check` pass.
- The Vercel branch preview was inspected at 1363 × 936. All nine requested pages were opened. Live interaction checks confirmed invalid inquiry focus below the header, intent reset, active navigation, and keyboard-operated yearly/monthly amortization.
- Matthew subsequently reported that everything is working on September 21, 2026. This is owner-reported acceptance; the browser still exposes no viewport resize, so agent verification remains desktop inspection plus responsive source and DOM checks.
- No successful live inquiry was sent by the agent. Delivery/error paths were checked with mocked responses.

## Content still held

See `content-holds.md`: approved Lake Street photography, reconciled transaction/case-study proof and Elm address, Matthew's Lakeview broker note, and personal recommendations. Dated market notes were added in the subsequent neighborhood pass documented in `neighborhood-pilot-status.md`. Existing photography was reused with honest assignment captions; new personal experience was not invented.

## Shared header — September 22, 2026

Matt approved extending the refined homepage header across all 12 pages. This implements the reference-led direction (Aman restraint, Moncler editorial hierarchy, and SOM clarity), not a separate temporary redesign.

- Shared serif wordmark, sentence-case navigation, spacing, outlined Contact action, and 44px minimum targets now live in `styles.css`; homepage-only header overrides are removed.
- The wordmark links home. The redundant desktop Home link is removed consistently; mobile Home remains. Existing active-page/parent states, focus handling, and menu controls are preserved.
- Neighborhood section navigation and the compact affordability estimate follow the measured header height. Guide anchors account for both navigation bars.
- All 12 main-content blocks are byte-for-byte unchanged, including the approved Mason photograph. No figures, copy, imagery, forms, or housing-stock content changed.
- Local verification: all 19 regression checks pass, including two new header checks; generated Selected Work content, JavaScript syntax, and whitespace checks pass. Responsive source and simulated mobile-menu behavior are covered; a phone-sized visual browser check remains unavailable.
- Preview branch only. Keep PR #2 in draft; no merge or production publication.
