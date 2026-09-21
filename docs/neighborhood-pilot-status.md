# Neighborhood pilot — September 21, 2026

Scope: the hub, Lincoln Park, and Lakeview on `codex/website-audit-fixes`. Preview only; retain the draft PR and the hold on merging and production publishing. The four canonical website documents were reread before this pass.

## Implemented

- Hub introductions explain the guide contents; direct housing and market-note links complement the two photographic guide entries. Fixed the gallery's missing closing wrapper.
- Both guides have a dated annual market section, three specific parks/open-space entries, official transit station links, an architectural landmark observation, library resources, an address-based CPS lookup, and visible boundary provenance.
- Each guide links to the other. The advisory invitation retains neighborhood context in the contact form and the brief's “Explore the Market With Matthew” wording.
- Existing photographs, maps, image credits, approved Lincoln Park broker note, and generated nearby assignments are preserved. Layouts collapse to single columns; section links have 44px targets and standard focus outlines.

## Market source record

Primary sources checked September 21, 2026:

- [DePaul IHS — Lincoln Park](https://www.housingstudies.org/data-portal/geography/lincoln-park/)
- [DePaul IHS — Lake View](https://www.housingstudies.org/data-portal/geography/lake-view/)

Calendar-year **2025 Total Sales Activity**, official community-area geography:

| Recorded residential property sales | Lincoln Park | Lake View |
| --- | ---: | ---: |
| Total | 1,355 | 1,731 |
| Condominium units | 963 | 1,375 |
| Single-family properties | 252 | 196 |
| Buildings with 2–4 units | 113 | 124 |
| Buildings with 5+ units | 27 | 36 |

These are historical property-sale records. Multifamily categories count building sales, not individual apartments. Do not relabel them as current inventory, prices, MLS closings, or days on market. Condominium sales were the largest category in both areas; the property-comparison guidance is editorial interpretation. The source and year remain next to the figures. Recheck the primary profiles before any future data update; change the period, values, and verification date together.

## Public source register

Every source is linked beside the relevant content in the guides. Verified September 21, 2026.

- Boundaries: [City community areas](https://data.cityofchicago.org/Facilities-Geographic-Boundaries/Boundaries-Community-Areas/igwz-8jzy). The existing SVGs remain approximate editorial maps; school attendance areas are separate.
- Schools: [CPS School Locator](https://schoolinfo.cps.edu/schoollocator/). No school-quality rankings or demographic recommendations.
- Transit: CTA [Fullerton](https://www.transitchicago.com/station/full/), [Armitage](https://www.transitchicago.com/station/armi/), [Belmont](https://www.transitchicago.com/station/belm/), [Southport](https://www.transitchicago.com/station/sprt/). Purple Line Express is qualified as weekday rush-period service.
- Lincoln Park: [Nature Boardwalk](https://www.lpzoo.org/exhibits/nature-boardwalk/), [Oz Park](https://www.chicagoparkdistrict.com/parks-facilities/oz-park), [Alfred Caldwell Lily Pool](https://www.chicagoparkdistrict.com/parks-facilities/lincoln-park-alfred-caldwell-lily-pool), [Armitage-Halsted district](https://webapps1.chicago.gov/landmarksweb/web/districtdetails.htm?disId=3), [Lincoln Park Branch](https://www.chipublib.org/locations/44/).
- Lakeview: [Belmont Harbor](https://www.chicagoparkdistrict.com/parks-facilities/belmont-harbor), [Lakefront Trail](https://www.chicagoparkdistrict.com/lakefront-trail), [Gill Park](https://www.chicagoparkdistrict.com/parks-facilities/gill-joseph-park), [Alta Vista Terrace](https://webapps1.chicago.gov/landmarksweb/web/districtdetails.htm?disId=1), [Merlo Branch](https://www.chipublib.org/locations/51/), [Lincoln Belmont Branch](https://www.chipublib.org/locations/43/).

Seasonal hours, pool schedules, maintenance, and transit alerts stay at the official source instead of being copied into static guidance.

## Personal material still needed

The guides are not editorially complete against the master brief until Matthew supplies:

1. **Places I'd Send You:** two or three genuine favorites in each neighborhood, with a sentence on why he recommends each.
2. **Lakeview broker note:** a specific observation he shares with clients about buying, selling, or evaluating property there.

Keep these sections absent until approved copy exists. The factual parks and architectural resources are not presented as Matthew's endorsements. Preserve the approved Lincoln Park note exactly.

No new neighborhood pages, IDX, active listings, transaction claims, or case studies were added.

## Verification

All 17 existing Node/jsdom regression checks pass, including local links and fragment targets, generated proof, and contextual inquiries. The generated-content and whitespace checks also pass. Desktop preview inspection covered the new market sections, parks/resources, and hub; it caught an inherited light heading color on the new cream sections, corrected in this pass. Responsive grid rules were reviewed in source; this browser cannot resize, so no new mobile visual test is claimed.
