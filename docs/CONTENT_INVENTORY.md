# Full-site content inventory and route status

Local database import: 75 stable records, 217 relational links, 271 media records; 0 unresolved references. Original content is retained under prisma/fixtures; browser runtime imports API catalog adapters only.

| Section | Persistent source | Count / scope |
|---|---|---|
| Accommodation | accommodation records | 8 full properties, rooms, amenities, editorial, FAQs, galleries and related links |
| Experiences | experience records and shared categories | 25 experiences, 7 category pages, full details, galleries, FAQs, prices and related links |
| Packages | package plus packageStay records | 8 itineraries and 9 recommendation variants preserving original hotel copy |
| Guides | guide records | All 11 full documents and structured blocks; 10 supplementary URLs plus master guide |
| Gallery | album and Media | Existing client images, order, alt text and captions |
| Homepage / shared | site:shared | Hero, sections, founder, About, testimonials, FAQ, CTAs, contact, currencies, categories and legacy variants |
| Builder | builderActivity and stayTier | Original 8 activities and 4 stay tiers, validated selections and server estimates |
| Contact/newsletter | Enquiry, Subscription and Notification | Durable submissions, consent, references, confirmation/unsubscribe, retry outbox |

The additional legacy travel arrays are retained in shared content because they contain original variations; active homepage entities use canonical catalog relationships. The original art portal, cart and wishlist product fixtures remain in the repository but are not reachable from the active travel route tree and are outside this Holidays backend. src/data/masterGuideData.ts is superseded by the full guide records and is not a browser runtime fallback. Original one-time extraction helpers must not be rerun over edited content.

The route table below records persistent backing and successful local prerender/Chrome rendering. Every route is **not deployed by this work**. For all form routes, saving is locally verified; live email/newsletter delivery remains pending configuration.

| Route | Backend source | Integration completed | Verification performed | Remaining issue |
|---|---|---|---|---|
| / | site/shared | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do-in-victoria-falls | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-accommodation | accommodation | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-packages | package | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /client-gallery | album | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /about | site/shared | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/category/first-visit | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/category/wildlife | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/category/adventure | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/category/river | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/category/culture | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/category/day-trips | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/category/wellness | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/guided-tour-falls | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/upper-zambezi-sunset-cruise | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/chobe-day-safari | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/flight-of-angels | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/boma-dinner | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/lookout-cafe | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/rhino-tracking-safari | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/game-drive-zambezi | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/elephant-interaction | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/white-water-rafting | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/gorge-swing | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/bungee-jump | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/zip-line | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/flying-fox | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/jet-boat-gorge | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/canopy-tour | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/luxury-pontoon-cruise | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/breakfast-cruise | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/fishing-trips | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/canoeing-zambezi | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/local-village-tour | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/art-galleries-markets | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/hwange-day-safari | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/livingstone-zambia-tour | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /things-to-do/simunye-theatre-show | experience | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /packages/victoria-falls-essentials | package | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /packages/classic-victoria-falls | package | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /packages/family-adventure | package | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /packages/romantic-escape | package | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /packages/victoria-falls-chobe-explorer | package | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /packages/adventure-itinerary | package | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /packages/vic-falls-hwange-safari | package | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /packages/luxury-escape | package | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /accommodation/victoria-falls-safari-lodge | accommodation | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /accommodation/ilala-lodge-hotel | accommodation | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /accommodation/pioneers-victoria-falls | accommodation | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /accommodation/batonka-guest-lodge | accommodation | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /accommodation/victoria-falls-hotel | accommodation | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /accommodation/palm-river-hotel | accommodation | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /accommodation/lokuthula-lodges | accommodation | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /accommodation/shearwater-explorers-village | accommodation | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /newsletter-confirmed | site/shared | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /contact | site/shared | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide/best-time-to-visit | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide/month-by-month-guide | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide/weather-guide | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide/where-to-stay-victoria-falls | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide/experience-victoria-falls | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide/victoria-falls-itineraries | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide/victoria-falls-budget-guide | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide/getting-to-victoria-falls | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide/visa-entry-requirements | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |
| /victoria-falls-guide/victoria-falls-faqs | guide | Yes | API-backed prerender + Chrome passed | Deployment pending; delivery configuration pending for forms |

Unknown URLs use the generated 404. The confirmation status page is noindexed and excluded from sitemap; it does not itself confirm consent. Actual confirmation/unsubscribe require a valid token and POST on the API.
