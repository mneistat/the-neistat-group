# Licensed fonts still needed — November 12, 2026

The November 12 brand implementation targets Douglas Elliman's verified pairing:
**Euclid Circular A** and **Sainte Colombe**.

**Neither font file is in this repository, in the brand asset set, or in the
previous build.** Both are commercially licensed and cannot be obtained from a
free source. Nothing has been substituted silently: the real family names lead
every font stack in `brand.css`, and the site currently falls back to the
nearest widely installed faces until the licensed files arrive.

## What to buy

| Family | Weights and styles the site uses | Where it is licensed |
| --- | --- | --- |
| Euclid Circular A | Light 300 (roman), Regular 400 (roman) | Swiss Typefaces |
| Sainte Colombe | Regular 400 (roman), Regular 400 italic | The foundry that publishes it |

Buy a **web font licence** (not only desktop). A desktop-only licence does not
permit serving the files from the site. Size the licence to monthly pageviews
or to a self-hosting tier, whichever the foundry offers.

Confirm before purchase:

1. Web/self-hosting rights are included.
2. `.woff2` files are supplied (the only format the site needs).
3. The licence covers a commercial real estate brokerage website.

## How to install them

1. Create a `fonts/` folder at the repository root.
2. Add these four files, named exactly:
   - `EuclidCircularA-Light.woff2`
   - `EuclidCircularA-Regular.woff2`
   - `SainteColombe-Regular.woff2`
   - `SainteColombe-Italic.woff2`
3. In `brand.css`, uncomment the `@font-face` block marked
   **LICENSED FONT HOOK**.
4. Nothing else changes. The stacks already name these families first, so the
   whole site switches over on the next deploy.

If a foundry supplies a hosted kit (a `<link>` or `<script>` tag) instead of
files, add that tag to each page's `<head>` above `/brand.css` and leave the
`@font-face` block commented out. The family names must still match.

## What the site renders until then

`brand.css` declares, in order:

```
--font:  "Euclid Circular A", "EuclidCircularA", ui-sans-serif, system-ui,
         -apple-system, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;

--serif: "Sainte Colombe", "SainteColombe", Didot, "Didot LT STD",
         "Bodoni 72", "Bodoni MT", "Hoefler Text", Garamond,
         "Times New Roman", Georgia, serif;
```

What a visitor actually sees today:

| Platform | Sans fallback | Serif fallback |
| --- | --- | --- |
| macOS / iOS | San Francisco | Didot, then Bodoni 72 |
| Windows | Segoe UI | Bodoni MT, then Georgia |
| Android | Roboto | Georgia, then the system serif |

The macOS and iOS serif fallback (Didot) is close to the intended high-contrast
editorial look. The Windows and Android fallbacks are noticeably further from
it. This is the gap the licensed files close.

No webfont is downloaded from a third party in the meantime, so the fallback
adds no network request, no tracking, and nothing to remove later.

## Verification note

Screenshots taken in the build container do **not** show either fallback
faithfully: that container has neither Didot, Bodoni, Georgia nor Times
installed, so its serif resolves to DejaVu Serif. Judge the fallback on a real
Mac or Windows machine, not from a container screenshot.
