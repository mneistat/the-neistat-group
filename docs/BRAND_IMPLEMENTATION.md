# Brand and visual direction — November 12, 2026

This records the indigo/slate brand implementation on `codex/website-audit-fixes`.
It **supersedes** the earlier cream/parchment ("Carbon / Bone / Sand") palette,
the previous text wordmark, and the previous Gelasio + Liberation Sans pairing.
Preview only. Do not merge to production or publish without a separate
instruction from Matt.

## Direction

Sophisticated, architectural, spacious, approachable. Deep indigo and neutral
slate grounds, crisp white text, fine divider lines, restrained outlined
buttons, strong architectural photography, comfortable reading sizes. Douglas
Elliman is the typography and colour reference. The Neistat Group's identity,
content and site functionality are unchanged.

## Colour system

Tokens live in **`brand.css`**, which loads last on every route so the system
applies everywhere. `styles.css` and `site-design.css` no longer declare colours
of their own; their old variable names are kept as aliases that point at brand
tokens.

| Token | Value | Role |
| --- | --- | --- |
| `--indigo` | `#100B25` | Primary ground |
| `--slate` | `#323745` | Panels, raised surfaces |
| `--slate-muted` | `#50596C` | Bands, rules, muted ink on white |
| `--white` | `#FFFFFF` | Primary text on dark |

Derived, only where the four cannot carry a role alone — each drawn from the
same slate hue family:

| Token | Value | Role |
| --- | --- | --- |
| `--indigo-deep` | `#0B0719` | Footers, overlay scrims |
| `--indigo-raised` | `#232145` | Raised card on indigo |
| `--slate-tint` | `#F2F3F6` | Lightest neutral surface on white |
| `--slate-line` | `#DCDFE7` | Hairline rule on white |
| `--slate-soft` | `#A9B0BF` | Muted text on indigo or slate |

Cream, parchment and beige are gone from the interface: **947 colour values**
across 22 files were mapped to the new ramps, including three inside
URL-encoded SVG data URIs. Relative lightness within each ramp was preserved so
existing layering still reads correctly. The only colours deliberately left
alone are pure white, pure black, and the two form-error reds
(`#8D2B2B`, `#E8A5A5`).

The deep indigo is not an approximation: the supplied wordmark proof's dark
panel samples to exactly `rgb(16, 11, 37)`, and the mockup's slate band samples
to `#4B546A`, which `--slate-muted` matches.

### Measured contrast (WCAG 2.1)

| Pair | Ratio | Level |
| --- | ---: | --- |
| White on indigo | 19.15 | AAA |
| White on slate | 11.88 | AAA |
| White on muted slate | 7.03 | AAA |
| Indigo on white | 19.15 | AAA |
| Muted slate on white | 7.03 | AAA |
| `--slate-soft` on indigo | 8.80 | AAA |
| `--slate-soft` on slate | 5.46 | AA |

## Typography

Euclid Circular A (Light 300 for major sans headings and body; Regular 400 for
navigation, labels and buttons) paired with Sainte Colombe (Regular 400 for
selected editorial headings; italic for short supporting lines).

**The licensed font files are not present and nothing was substituted for them
silently.** See `FONTS_REQUIRED.md` for what to buy and how to drop it in —
the real family names already lead every stack, so installation is a one-step
change. Every hardcoded `Georgia, serif` and `-apple-system` stack in the
codebase was routed through `--serif` and `--font`, so there is now exactly one
place to change.

Balance, as applied:

- The homepage opening is spaced uppercase Euclid Light — not italic.
- Section headings are upright Sainte Colombe, sentence case.
- Eyebrows, labels and navigation are spaced uppercase Euclid Regular.
- Italic serif is reserved for short supporting lines, including
  **People First. Always.**
- Not every heading is uppercase and not every headline is italic.

## Wordmark

`neistat-wordmark-white.svg`, `neistat-wordmark-indigo.svg` and
`neistat-wordmark.svg` (inherits `currentColor`) were vectorised directly from
the supplied proof, so the proportions and letterforms match it rather than
approximating it with a font: small spaced uppercase THE, prominent uppercase
serif NEISTAT, smaller spaced uppercase GROUP, all three optically centred.
19 outlined subpaths, `viewBox 0 0 1000 394.89`, ~20 KB, resolution independent
and font independent.

The two-background proof image is **not** used as the site logo. White is used
on dark grounds, indigo on white.

Placement: centred in the desktop header between the two navigation sets;
left-aligned beside the hamburger below 1251px; and in the footer of every
interior page. Rendered height is 30–40px desktop, 28px mobile — checked in
both.

Jameson Sotheby's International Realty branding and the required attribution
are unchanged. The Jameson mark stays pure white or pure black; recolouring it
is a compliance risk.

## Application

`brand.css` is loaded last on all 16 pages: header, mobile navigation, footer,
homepage, six neighborhood guides, the neighborhoods hub, Selected Work, Seller
Strategy, Buying Process, Selling Process, Affordability, About, Contact and
Vendors — plus forms, cards, buttons and interactive states.

The header now centres the wordmark between two navigation sets. **Every
existing navigation item, its order and its destination are unchanged**; the
split is presentational, lives inside `.nav-links`, and collapses below the
hamburger breakpoint, so `nav.js` and the mobile menu are untouched.

The indigo → slate transition from the reference appears on the homepage: the
asset-consulting section sits on charcoal slate and Neighborhood Intelligence on
the slate band gradient. **No new section, link row or content was added to
carry it** — the treatment was applied to sections that already existed, which
keeps the September 29 decision to simplify the reading path intact.

## Preserved

Approved content, transaction facts, neighborhood structure (boundaries first;
parks, schools and local amenities emphasised), verified data, calculators,
forms, publication gates and generated proof are unchanged. No previously
removed section was restored. No property fact, market statistic, testimonial
or credential was invented.

## Verification

- **Contrast:** an automated WCAG AA pass over every rendered text node on all
  16 pages — **0 failures**. Seven homepage elements failed on the first pass
  (muted ink on the new dark ground) and were fixed at source.
- **Layout:** desktop 1440×900 and phone 390×844 on all 16 pages — no
  horizontal scroll, no clipped headings, no overlap.
- **Wordmark:** loads on every page; centre offset 0px from the viewport centre
  at desktop width.
- **Images:** every local image loads on every page. Four remote Wikimedia
  hotlinks on the neighborhoods hub could not be fetched from the build
  container's network; they are pre-existing and unrelated to this pass.
- **Mobile menu:** opens, shows all eight links, retains the wordmark.
- **Regression suite:** 20 of 22 pass. Tests 3 and 21 also fail on the branch
  **before** this work — they are pre-existing and were not introduced here.
  See below.
- `git diff --check` clean; all 16 pages parse cleanly.

### Pre-existing failures, not addressed here

1. **Test 3** — guide section indicator does not clear `aria-current` from the
   first link on scroll (`site-experience.js`).
2. **Test 21** — `scripts/build-selected-work.mjs --check` reports generated
   content as stale. Regenerating it would rewrite gated transaction proof, so
   it was deliberately left for Matt rather than changed inside a branding pass.

Both reproduce on a clean checkout of this branch. Fixing them is a separate
task.

## Decisions — settled November 12, 2026

Both open questions from this pass were put to Matt and answered the same day.

**Tagline — no comma. Settled.** The brief asked to keep "Real estate
decisions, made better." with a comma; the site uses "Real estate decisions
made better." without one, per Matt's September 22, 2026 approval. Matt
confirmed the **no-comma** wording stands. The brief's punctuation does not
override it. No change was made and none is pending. Do not reopen this.

**Fonts — ship on the fallback for now. Settled.** Matt chose not to license
Euclid Circular A or Sainte Colombe at this time. The site runs on the
documented system fallback stack in `brand.css`. This is a deliberate decision,
not an outstanding task.

The implementation is unchanged either way: the real family names still lead
every stack and the commented `@font-face` hook is still in place, so whenever
Matt does buy the files it remains a one-step change. See `FONTS_REQUIRED.md`.

Because the brand fonts are not installed, do not make typography claims about
them in any client-facing or marketing material until they are.

## Header progression — November 12, 2026 (second pass)

Matt asked for the permanent solid bar to go, referencing Douglas Elliman:
start with the wordmark and the menu control sitting on the hero photograph,
then bring in a 50% gradient as the page scrolls.

**Two states.** At rest the header has no background, no border and no blur —
the wordmark and the three-line menu control sit directly on the photograph.
Past 60px of scroll, a 50% indigo gradient fades in behind them
(`.88` at the top edge → `.50` → transparent) with an 8px backdrop blur, so the
header stays legible over whatever passes underneath without becoming a block.
`nav.js` already toggled `.scrolled`; no script change was needed.

**Navigation moved into the menu at every width.** The wordmark is optically
centred with the menu control on the left, matching the reference. All eight
destinations (Home plus the seven existing items) remain in the menu panel, and
the `.nav-links` markup is unchanged, so the regression suite's navigation
assertions still hold. The trade-off is real: desktop visitors no longer see
the link row without opening the menu.

**The homepage hero now runs to the top of the viewport.** `.home-main` carried
a header-height offset that pushed the photograph below the bar; with the
header overlaying, that offset is removed and the hero reclaims the height. The
"Lincoln Park, Chicago" caption was moved down clear of the menu control, which
it would otherwise collide with.

**The wordmark follows its ground.** Ten of the sixteen pages open on a white
section — measured, not assumed, by sampling what sits behind the header strip
at scroll 0 on every page. Those pages carry a `header-on-light` body class and
show the indigo wordmark with indigo menu bars at rest, exactly as the logo
proof specifies; the other six show the white mark. Once the gradient fades in,
the ground is dark everywhere and the white mark returns. Both marks are in the
markup and CSS chooses between them, so there is no flash and no script.

### Verification

- Contrast: WCAG AA across every text node on all 16 pages — **0 failures**.
- Both header states probed on desktop and mobile: background, border, nav
  height, wordmark centring (0px offset at both widths), and which mark is
  visible at rest and scrolled.
- Exactly one wordmark renders in every state on every page checked.
- The menu opens at desktop width with all eight links.
- No horizontal scroll on any page at 1440×900 or 390×844.
- Regression suite back to 20/22, the two known pre-existing failures.

### Correction to the first pass

The first branding commit was reported as 20/22. It was **19/22**: the
stylesheet cache-bust bump from `v=39` to `v=40` happened after that commit's
last test run, and test 17 pins the version string. The test now expects
`v=40` and the suite is back to 20/22. The error was in the report, not in the
shipped CSS.

## The two pre-existing test failures — fixed November 12, 2026

Both were investigated to root cause before anything was changed. Neither was
caused by the branding work, and neither turned out to be a product bug.

### Test 3 — guide section indicator

**Not a bug. Stale test fixture.** The test drove `#parks` and `#resources`,
which stopped being quick-link targets when the September 2026 restructure put
boundaries first and folded parks, schools and local life into `#essentials`.
Moving sections the nav no longer points at proves nothing, so the indicator
never moved and the assertion failed.

Verified in a real browser first: scrolling Lincoln Park moves the indicator
`#context → #essentials → #market-notes → #contact-lincoln-park`, focus stays
where it was, and `location.hash` stays empty. The behaviour is correct.

`site-experience.js` is unchanged. The fixture now drives `#context` and
`#essentials` — the sections the quick links actually point at — and keeps the
test's original shape and intent.

### Test 21 — publication gates and static portfolio

**A real bug, but not the one it looked like.** `build-selected-work.mjs`
failed outright with `Missing generation markers: neighborhoods/lincoln-park.html`.
The `GENERATED: nearby-work` markers and their block had been deleted from
`lincoln-park.html` and `lakeview.html`.

That contradicts the recorded decision. `neighborhood-pilot-status.md` states
twice that the generated nearby-work block "remains in source for build
compatibility but is hidden in this compact pilot", and
`neighborhoods/editorial.css` still carries the rule that hides it
(`.compact-guide #nearby-work { display: none; }`). The block was removed from
source anyway, which broke the generator.

The markers were restored to both pages and the generator run. This is **not**
a restored section in the content sense: it renders at `display: none` and 0px
height on both guides, exactly as documented, and is invisible to visitors.

The regeneration added 45 lines across those two guide pages and changed
**nothing** in `index.html`, `selected-work.html` or `seller-strategy.html` —
no transaction proof, price or publication gate was rewritten. Lincoln Park
carries two nearby assignments and Lakeview one, matching the pilot record.

The alternative fix — deleting the guide loop from the generator — was
rejected because it would contradict the documented decision and discard the
ability to re-enable the block.

One leftover worth knowing: the generated block uses the class
`np-band--cream`. The name is now a misnomer; it resolves to white through the
`--cream: var(--white)` alias, and the block is hidden regardless. Renaming it
was left alone as pure churn.

### Result

**Regression suite: 22 of 22 passing** — the first clean run. WCAG AA still
0 failures across all 16 pages.
