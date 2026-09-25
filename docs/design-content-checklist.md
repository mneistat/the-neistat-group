# Design and content handoff — September 23, 2026

Matt directed a full design and functionality pass before collecting more stories. Missing stories do not block the preview and are not displayed as placeholders. This pass uses the approved photography, copy, transaction facts, neighborhood resources, and no-IDX structure. The existing Lake Street narrative remains.

## Visual system

- Shared spacing, readable typography, restrained buttons, editorial links, and footer on all twelve pages.
- Homepage: open decision rows, stronger architectural proof, a portrait beside the family principle, and a clearer inquiry form.
- Selected Work: a publication-style opening and a generated assignment index. The existing publication gate also controls that index.
- About: Matthew's portrait is part of the opening; the approved Mason photograph and family text remain.
- Contact: a cream introduction and distinct dark form. Existing delivery, validation, success, and inquiry context stay in place.
- Neighborhoods: large natural-color imagery, readable resources, and an active section indicator on each guide. Housing content remains unchanged.
- Seller Strategy: direct links to outcomes, Access, Presentation, and Partnership.
- Affordability and supporting guides: consistent headings, visible form controls, readable explanations and larger touch targets.
- Motion: one optional native animation system replaces the individual reveal scripts and third-party GSAP downloads. Content is visible with scripts disabled or reduced motion.

## Content to collect after design review

| Location | What is still needed | Current treatment |
| --- | --- | --- |
| Wellington | The developer's challenge and Matthew's specific strategy; any verified timing. | Existing four-condo sellout, representation and price range only. |
| Lincoln Avenue | Client objective, specific work performed and supported outcome. | Existing verified assignment facts only. |
| Fullerton | Representation and the circumstances that made this assignment useful proof. | Existing verified assignment facts only. |
| Lake Street | Approved exterior or interior photography; any further approved client context. | Honestly labeled illustrative floor plan and approved narrative. |
| Lincoln Park / Lakeview | Matthew's own local recommendations and broker observations. | Existing sourced parks, schools and amenities; no invented first-person recommendations. |
| Elm Street and other held assignments | Reconciled address, figures, representation and source evidence. | Not included in public assignment collections. |

Career sales totals remain excluded everywhere. Individual property prices are preserved. Do not restore totals from old briefs or profiles. No new case-study claims, testimonials, listings feeds, or unpublished neighborhoods are added.

## Delivery

Work stays on the preview branch. Production publication requires Matt's separate instruction. Browser verification and the final commit are recorded in PR #2.

## Mobile homepage opening — September 25, 2026

Matt approved the river-photo concept. The mobile homepage uses his second supplied Chicago river photograph, a three-line cream headline, the shorter supporting copy, a rectangular conversation button and an understated Selected Work link. Desktop retains its existing video and copy. The existing video controller skips autoplay on mobile and pauses when the viewport becomes mobile.

`images/chicago-river-mobile.jpeg` is the supplied 359 × 740 JPEG, preserved without image alterations. CSS crops its screenshot edges. It is a temporary source pending a higher-resolution original; do not substitute the AI-generated concept photograph or invent a photographer credit. The bottom footnote identifies Matthew as the supplier. No additional stories or transaction claims are introduced.

## Complete homepage composition — September 25, 2026

Matt said the site still felt generic, then approved the complete homepage mockup. This supersedes the incremental opening-only styling. Desktop now pairs the headline on paper with the actual river photograph. Mobile retains the immersive photograph opening, followed by the same streamlined page order: Selected Work, neighborhoods, Matthew, and contact. The generated mockup is a visual reference only; no AI-rendered architecture or portrait is used on the site.

Wellington appears immediately after the opening as a large architectural feature, generated from the gated public records. The multi-property collection, prices and approved Lake Street narrative remain on Selected Work. The homepage no longer needs the JavaScript assignment switcher. The tested inquiry form remains available in a native disclosure, as do all three existing client quotes. Buying, Selling, Investing, and the shared navigation retain working destinations. Recognition and press links now sit at the bottom with the source notes. Lincoln Park's original photo and license attribution are included on the homepage.

The homepage uses `homepage-editorial.css`; the older opening stylesheets are no longer loaded there. The shared header, other page designs, neighborhood housing text, publication holds, and transaction figures are preserved. This update is preview-only.

## Source-credit standard — September 24, 2026

Matt approved the small bottom-of-page footnote treatment for photography and information sources throughout the site. Use the shared `.footer-credits` block after the footer bar whenever a page needs attribution; keep source and license links, photo subjects, crop notes, and original verification dates. Do not add empty credit blocks or invent photographers. The neighborhood guides, hub, Selected Work, Seller Strategy and Affordability use this treatment. Generated transaction sources follow the same public-record gate as their assignments. Practical resource links, press/recognition features, illustrative-image labels, and explanations needed to interpret the numbers remain with the relevant content. Apply this standard to new pages and sources as they are added.
