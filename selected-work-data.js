/* THE NEISTAT GROUP — Selected Work transaction data.
 *
 * Single source of truth for the portfolio. Only the homepage module renders from
 * it at runtime. Run node scripts/build-selected-work.mjs after approved edits
 * to update the static portfolio, seller proof, and nearby-work sections.
 * Run the same command with --check to catch drift without writing files.
 * caseStudyUrl is empty everywhere because no case-study pages exist yet.
 *
 * RULES FOR EDITING
 * -----------------
 * Every value here must be verifiable. Do not add a price, address, neighborhood,
 * representation or outcome that cannot be sourced. When a field is unknown, leave
 * it as an empty string — the renderers hide empty fields rather than printing a
 * placeholder. Never ship user-visible text such as "Figures to be confirmed".
 *
 * tenants
 *   Current occupants, stated as a fact about the building. Do NOT phrase this as
 *   work Matthew performed unless he actually handled the leasing.
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
    caseStudyUrl: '',
    publishStatus: 'public',
    needsVerification: false
  },
  {
    id: 'lake',
    address: '1035 W. Lake Street',
    neighborhood: 'West Loop',
    market: 'Chicago',
    assetType: 'Commercial',
    representation: '',                     // not verified — deliberately blank
    priceOrResult: '$9,500,000',
    outcomeLine: 'Won the listing against major brokerages and brought it under contract off-market in two weeks.',
    // Occupancy, not Matthew's work — he represented the seller on the sale.
    // BODYBAR confirms 1035 W. Lake Suite 100A on its own site; The Athletic Club
    // per Matthew, who transacted the building.
    tenants: 'Now home to BODYBAR Pilates and The Athletic Club.',
    pressMention: 'CoStar News',
    pressUrl: 'https://product.costar.com/home/news/710741247',
    image: 'properties/1035-lake-layout.jpg',
    imageAlt: 'Illustrative floor plan for 1035 W. Lake Street',
    imageFit: 'contain',
    imageCaption: 'Floor plan · illustrative',
    caseStudyUrl: '',
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
    caseStudyUrl: '',
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
    caseStudyUrl: '',
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
