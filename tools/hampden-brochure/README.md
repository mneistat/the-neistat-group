# Hampden board brochure

Print edition of the Hampden board website, dated September 21, 2026.

## Generate

Install the Python dependencies in `requirements.txt` and install the DejaVu fonts
(Debian/Ubuntu package `fonts-dejavu-core`). Then run from the repository root:

```sh
python tools/hampden-brochure/generate_brochure.py
```

This reads embedded branding and the real building photograph from
`hampden-board-site/index.html`. The default output is
`hampden-board-site/Hampden-Board-Brochure.pdf`. It does not access the network.
If the generator is stored elsewhere, provide explicit paths:

```sh
python generate_brochure.py --source path/to/index.html --output path/to/Hampden-Board-Brochure.pdf
```

Use `--font-dir` if DejaVu TTFs are installed elsewhere. It must contain
`DejaVuSans.ttf`, `DejaVuSans-Bold.ttf`, `DejaVuSerif.ttf`, and
`DejaVuSerif-Bold.ttf`. Fonts are embedded in the PDF for consistent printing.
The optional `--assets` flag accepts an asset directory with `reference-0.svg`,
`reference-1.jpg`, and `reference-2.svg` instead of extracting data URIs.

## Editorial maintenance

The copy is intentionally condensed and laid out for four US Letter pages.
The website is the source of truth. Update the generator's copy and review date
when material website content changes. Legal, financing, and property figures
retain the website's qualifications; this document does not verify them anew.

Do not shrink body text to fit changes. Reflow or add pages if needed. Main body
text is 10.5-11 pt. Small labels, approval labels, source lines, and disclaimers
are deliberately smaller.

## Verification

The generator checks the vertical text extent. Also render every page using
Poppler, inspect for overlaps and clipping, and extract text to verify required
facts and links. Output is a selectable-text PDF, with embedded fonts and real
vector branding. Raster image transparency is preserved explicitly for the
Jameson Sotheby's mark because svglib's PDF renderer otherwise loses its alpha.

```sh
pdftoppm -scale-to 1200 -png hampden-board-site/Hampden-Board-Brochure.pdf /tmp/hampden-page
```

Default print setting: US Letter portrait, actual size or fit to printable area.
The PDF uses 44 pt side margins and does not require borderless printing.
