/* THE NEISTAT GROUP — Selected Work transaction data.
 *
 * Single source of truth for the portfolio. Consumed by the homepage module and
 * selected-work.html, and intended for future case-study pages and the seller /
 * neighborhood proof sections.
 *
 * RULES FOR EDITING
 * -----------------
 * Every value here must be verifiable. Do not add a price, address, neighborhood,
 * representation or outcome that cannot be sourced. When a field is unknown, leave
 * it as an empty string — the renderers hide empty fields rather than printing a
 * placeholder. Never ship user-visible text such as "Figures to be confirmed".
 *
 * publishStatus
 *   "public"   — rendered on the site
 *   "internal" — kept here for reference, never rendered
 *
 * needsVerification
 *   true — do not promote to "public" until the outstanding fields are confirmed
 */
window.SELECTED_WORK = [
  {
    id: 'lake',
    address: '1035 W. Lake Street',
    neighborhood: 'West Loop',
    market: 'Chicago',
    assetType: 'Deconversion',
    representation: '',                     // not verified — deliberately blank
    priceOrResult: '$9,500,000',
    outcomeLine: 'Won the listing against major brokerages and brought it under contract off-market in two weeks.',
    pressMention: 'CoStar News',
    image: 'properties/1035-lake-listing.jpg',
    imageAlt: '1035 W. Lake Street, West Loop — multi-unit deconversion',
    caseStudyUrl: '',                       // TODO: CASE STUDY PAGE NEEDED
    publishStatus: 'public',
    needsVerification: false
  },
  {
    id: 'elm',
    address: '1183 Elm Street',
    neighborhood: 'Winnetka',
    market: 'North Shore',
    assetType: 'Residential',
    // Address per Matthew, who represented the seller. Note for the record: public
    // MLS listings (11734843) and the Crain's piece index this sale under 1185 Elm.
    // Matthew's instruction takes precedence — he transacted it.
    representation: 'Represented Seller',
    priceOrResult: '$1,265,000',
    // Asked $1.15M, sold $1,265,000 — 10% over — and never reached the open market.
    outcomeLine: 'Off-market sale, 10% over asking.',
    pressMention: 'Crain’s Chicago Business',
    image: 'properties/1185-elm-listing.jpg',
    imageAlt: '1183 Elm Street, Winnetka — North Shore residence',
    caseStudyUrl: '',                       // TODO: CASE STUDY PAGE NEEDED
    publishStatus: 'public',
    needsVerification: false
  },
  {
    id: 'lincoln',
    address: '2636 N. Lincoln Avenue',
    neighborhood: 'Lincoln Park',
    market: 'Chicago',
    assetType: '4-Unit Investment',
    representation: 'Represented Seller — Bayview LTD',
    priceOrResult: '$2,300,000',
    outcomeLine: '',
    pressMention: '',
    image: 'properties/2636-lincoln-listing.jpg',
    imageAlt: '2636 N. Lincoln Avenue, Lincoln Park — four-unit investment property',
    caseStudyUrl: '',                       // TODO: CASE STUDY PAGE NEEDED
    publishStatus: 'public',
    needsVerification: false
  },
  {
    id: 'wellington',
    address: '702 W. Wellington Avenue',
    neighborhood: 'Lakeview',
    market: 'Chicago',
    assetType: 'Development',
    representation: 'Represented Developer',
    priceOrResult: '$709K – $985K',
    outcomeLine: '4-condo sellout.',
    pressMention: '',
    image: 'properties/702-wellington-listing.jpg',
    imageAlt: '702 W. Wellington Avenue, Lakeview — four-condo sellout',
    caseStudyUrl: '',                       // TODO: CASE STUDY PAGE NEEDED
    publishStatus: 'public',
    needsVerification: false
  },
  {
    id: 'fullerton',
    address: '1126 W. Fullerton Avenue',
    neighborhood: 'Lincoln Park',
    market: 'Chicago',
    assetType: 'Condominium',
    representation: '',                     // not verified — deliberately blank
    priceOrResult: '$720,000',
    outcomeLine: '',
    pressMention: '',
    image: 'properties/1126-fullerton-listing.jpg',
    imageAlt: '1126 W. Fullerton Avenue, Lincoln Park',
    caseStudyUrl: '',                       // TODO: CASE STUDY PAGE NEEDED
    publishStatus: 'public',
    needsVerification: false
  },

  /* ---- Held back until figures are confirmed. Never rendered. ---- */
  {
    id: 'clark',
    address: '3801 N. Clark Street',
    neighborhood: 'Lakeview',
    market: 'Chicago',
    assetType: 'Investment',
    representation: '',
    priceOrResult: '',
    outcomeLine: '',
    pressMention: '',
    image: '',
    imageAlt: '',
    caseStudyUrl: '',
    publishStatus: 'internal',
    needsVerification: true
  },
  {
    id: 'athen',
    address: 'Athen / Werner Portfolio',
    neighborhood: 'Chicago',
    market: 'Chicago',
    assetType: 'Portfolio',
    representation: '',
    priceOrResult: '',
    outcomeLine: '',
    pressMention: '',
    image: '',
    imageAlt: '',
    caseStudyUrl: '',
    publishStatus: 'internal',
    needsVerification: true
  }
];
