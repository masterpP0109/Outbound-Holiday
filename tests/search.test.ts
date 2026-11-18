import test from 'node:test';
import assert from 'node:assert/strict';
import publishedContent from '../src/runtime/published-content.json' with { type: 'json' };
import { installContent } from '../src/runtime/catalog';
import { resolveRoute, searchPath } from '../src/routes';
import type { PromotionOffer } from '../src/types/promotion';
import {
  buildSearchRequestUrl,
  executeGlobalSearch,
  executeLocalCatalogSearch,
  GOOGLE_CSE_ID,
  SEARCH_FILTER_TABS,
  splitHighlightSegments,
} from '../src/utils/globalSearch';

installContent(publishedContent as never);

const SAMPLE_PROMOTIONS: PromotionOffer[] = [
  {
    id: 901,
    campaignCode: 'ROMANTIC-VF-26',
    slug: 'romantic-victoria-falls-getaway',
    name: 'Romantic Getaway',
    headline: 'Romantic Getaway Package on the Zambezi',
    subtitle: '3 Nights Luxury Riverfront Suite + Sunset Cruise',
    shortDescription: 'Couples honeymoon & anniversary escape with private Zambezi sunset cruise and champagne dinner.',
    fullContent: 'Includes luxury riverfront accommodation, sunset cruise, and guided Falls tour.',
    imageUrl: '/images/romantic-promo.jpg',
    category: 'packages',
    destinationOrActivity: 'Victoria Falls',
    badgeText: 'Couples Special',
    originalPriceUSD: 1650,
    promotionalPriceUSD: 1390,
    priceBasis: 'per_couple',
    discountPercentage: 16,
    discountBadgeOverride: 'Save $260',
    validityStart: '2026-01-01',
    validityEnd: '2027-12-31',
    primaryCta: { label: 'Claim Offer', destination: 'offer_page', target: '/offers/romantic-victoria-falls-getaway' },
    whatsappUrl: 'https://wa.me/263714701721',
    display: { showOnHomepage: false, showAsCard: true, showAsPopup: false, targetPages: ['all'] },
    trigger: { mode: 'delay', delaySeconds: 5, scrollPercentage: 40, maxImpressions: 2, frequencyHours: 24 },
    offerPageUrl: '/offers/romantic-victoria-falls-getaway',
  },
];

test('Google CSE ID constant and search routing paths are configured accurately', () => {
  assert.equal(GOOGLE_CSE_ID, '04ba449966f8744d2');
  assert.equal(resolveRoute('/search').view, 'search');
  assert.equal(resolveRoute('/search/?q=Sunset+Cruise').view, 'search');
  assert.equal(searchPath('Victoria Falls'), '/search?q=Victoria+Falls');
  assert.equal(
    searchPath('Sunset Cruise', 'experiences'),
    '/search?q=Sunset+Cruise&type=experiences'
  );
  assert.deepEqual(
    SEARCH_FILTER_TABS.map((t) => t.id),
    ['all', 'accommodation', 'experiences', 'packages', 'blogs', 'offers', 'pages']
  );
});

test('representative global queries return relevant published content across all categories', () => {
  const queries = [
    { q: 'Victoria Falls', expectAny: true },
    { q: 'Sunset Cruise', expectAny: true },
    { q: 'Family accommodation', expectAny: true },
    { q: 'Lodge', expectAny: true },
    { q: 'Swimming pool', expectAny: true },
    { q: 'Chobe', expectAny: true },
    { q: 'Romantic getaway', expectAny: true },
    { q: 'Helicopter', expectAny: true },
    { q: 'Three-bedroom apartment', expectAny: true },
  ];

  for (const { q, expectAny } of queries) {
    const res = executeLocalCatalogSearch({
      q,
      type: 'all',
      page: 1,
      perPage: 12,
      promotions: SAMPLE_PROMOTIONS,
    });
    assert.ok(
      expectAny && res.total > 0 && res.results.length > 0,
      `Expected matches for representative query "${q}", got ${res.total}`
    );
  }

  const cruiseRes = executeLocalCatalogSearch({
    q: 'Sunset Cruise',
    type: 'experiences',
    promotions: SAMPLE_PROMOTIONS,
  });
  assert.ok(
    cruiseRes.results.some((r) => /sunset cruise/i.test(r.title)),
    'Sunset Cruise search includes Zambezi Sunset Cruise experience'
  );

  const heliRes = executeLocalCatalogSearch({
    q: 'Helicopter',
    type: 'experiences',
    promotions: SAMPLE_PROMOTIONS,
  });
  assert.ok(
    heliRes.results.some((r) => /helicopter|flight of angels/i.test(`${r.title} ${r.description}`)),
    'Helicopter search includes Flight of Angels helicopter tour'
  );

  const romanticRes = executeLocalCatalogSearch({
    q: 'Romantic getaway',
    type: 'offers',
    promotions: SAMPLE_PROMOTIONS,
  });
  assert.ok(
    romanticRes.results.some((r) => r.url === '/offers/romantic-victoria-falls-getaway'),
    'Romantic getaway search discovers matching special offer'
  );
});

test('individual room types link directly to parent property ?unit=...#accommodation-units and hide unpublished drafts or supplier costs', () => {
  const customSnapshot = structuredClone(publishedContent) as typeof publishedContent & {
    accommodations: Array<Record<string, unknown>>;
  };

  customSnapshot.accommodations.push(
    {
      id: 'acc-custom-apartments',
      slug: 'victoria-falls-city-apartments',
      name: 'Victoria Falls City Residences',
      category: 'Apartment',
      publicationStatus: 'published',
      priceFromUSD: 240,
      rating: 4.8,
      reviewsCount: 12,
      shortSummary: 'Modern self-catering suites for families.',
      description: 'Central apartments with private garden terraces.',
      location: 'Victoria Falls Town',
      maxGuests: 6,
      amenities: ['wifi', 'pool', 'family-friendly', 'self-catering'],
      heroImage: '/images/apt.jpg',
      gallery: [],
      roomTypes: [
        {
          id: 'unit_three-bedroom-apartment_1',
          name: 'Three-Bedroom Apartment',
          status: 'published',
          description: 'Spacious family apartment with full kitchen.',
          amenities: ['Full Kitchen', 'Swimming Pool Access'],
          pricing: { baseNightlyRateUSD: 240, startingFromPriceUSD: 240 },
          ratePlans: [
            {
              id: 'rp_secret',
              internalRateName: 'Agent Net Rate',
              amountUSD: 240,
              supplierCostUSD: 155,
              internalNotes: 'CONFIDENTIAL SUPPLIER MARGIN WORD',
            },
          ],
        },
        {
          id: 'unit_hidden_draft_2',
          name: 'Secret Unpublished Penthouse',
          status: 'draft',
          description: 'Draft unit must never appear in search.',
        },
      ],
    },
    {
      id: 'acc-unpublished-draft',
      slug: 'draft-secret-lodge',
      name: 'Unpublished Draft Safari Lodge',
      category: 'Lodge',
      publicationStatus: 'draft',
      priceFromUSD: 500,
      rating: 4.5,
      reviewsCount: 1,
      shortSummary: 'Hidden draft lodge.',
      description: 'Should never be indexed.',
      location: 'Victoria Falls',
      maxGuests: 2,
      amenities: [],
      heroImage: '/images/draft.jpg',
      gallery: [],
      roomTypes: [],
    }
  );

  installContent(customSnapshot as never);

  const unitRes = executeLocalCatalogSearch({
    q: 'Three-Bedroom Apartment',
    type: 'accommodation',
    promotions: SAMPLE_PROMOTIONS,
  });
  const unitMatch = unitRes.results.find((r) => r.unitId === 'unit_three-bedroom-apartment_1');
  assert.ok(unitMatch, 'Published custom Three-Bedroom Apartment is indexed directly');
  assert.equal(
    unitMatch?.url,
    '/accommodation/victoria-falls-city-apartments?unit=unit_three-bedroom-apartment_1#accommodation-units'
  );

  const draftUnitRes = executeLocalCatalogSearch({
    q: 'Secret Unpublished Penthouse',
    type: 'all',
  });
  assert.equal(draftUnitRes.total, 0, 'Draft room types are strictly excluded from public search');

  const draftPropRes = executeLocalCatalogSearch({
    q: 'Unpublished Draft Safari Lodge',
    type: 'all',
  });
  assert.equal(draftPropRes.total, 0, 'Draft accommodations are strictly excluded from public search');

  const secretLeakRes = executeLocalCatalogSearch({
    q: 'CONFIDENTIAL SUPPLIER MARGIN WORD',
    type: 'all',
  });
  assert.equal(secretLeakRes.total, 0, 'Internal notes and supplier margins are never indexed or exposed');

  // Restore original published snapshot
  installContent(publishedContent as never);
});

test('category filter tabs, pagination, and query highlighting work consistently', () => {
  const page1 = executeLocalCatalogSearch({
    q: 'Victoria Falls',
    type: 'all',
    page: 1,
    perPage: 5,
    promotions: SAMPLE_PROMOTIONS,
  });
  const page2 = executeLocalCatalogSearch({
    q: 'Victoria Falls',
    type: 'all',
    page: 2,
    perPage: 5,
    promotions: SAMPLE_PROMOTIONS,
  });

  assert.equal(page1.results.length, 5);
  assert.ok(page1.total > 5);
  assert.ok(page1.totalPages >= 2);
  assert.notEqual(page1.results[0].id, page2.results[0].id);
  assert.equal(page1.typeCounts.all, page1.total);

  const accOnly = executeLocalCatalogSearch({
    q: 'Victoria Falls',
    type: 'accommodation',
    page: 1,
    perPage: 20,
    promotions: SAMPLE_PROMOTIONS,
  });
  assert.ok(accOnly.results.every((r) => r.type === 'accommodation'));
  assert.equal(accOnly.total, page1.typeCounts.accommodation);

  const segments = splitHighlightSegments('Sunset Cruise on the Zambezi', 'sunset');
  assert.ok(segments.some((s) => s.match && s.text.toLowerCase() === 'sunset'));
});

test('executeGlobalSearch preserves existing query params like ?ver= when calling WP REST searchUrl', async () => {
  const prevWin = (globalThis as { window?: unknown }).window;
  const prevFetch = globalThis.fetch;
  let capturedUrl = '';

  (globalThis as { window?: unknown }).window = {
    __OUTBOUND_WP_CONFIG__: {
      isWordPress: true,
      searchUrl: 'https://outboundholiday.com/wp-json/outbound/v1/search?ver=1.7.0',
    },
  };
  globalThis.fetch = (async (input: URL | RequestInfo) => {
    capturedUrl = String(input);
    return {
      ok: true,
      json: async () => ({
        query: 'sunset cruise',
        type: 'all',
        total: 1,
        page: 1,
        perPage: 12,
        totalPages: 1,
        typeCounts: { all: 1, accommodation: 0, experiences: 1, packages: 0, blogs: 0, offers: 0, pages: 0 },
        results: [
          {
            id: 'exp:upper-zambezi-sunset-cruise',
            title: 'Upper Zambezi Sunset Cruise',
            type: 'experiences',
            typeLabel: 'Thing to Do',
            url: '/things-to-do/upper-zambezi-sunset-cruise',
            description: 'Sunset river cruise.',
          },
        ],
        source: 'wordpress-cms',
      }),
    } as Response;
  }) as typeof fetch;

  try {
    const res = await executeGlobalSearch({ q: 'sunset cruise', type: 'all' });
    assert.ok(capturedUrl.includes('?ver=1.7.0&q=sunset+cruise'), `Expected & separator after ?ver=, got: ${capturedUrl}`);
    assert.equal((capturedUrl.match(/\?/g) || []).length, 1, 'URL must contain only a single ?');
    assert.equal(res.total, 1);
  } finally {
    globalThis.fetch = prevFetch;
    if (prevWin === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      (globalThis as { window?: unknown }).window = prevWin;
    }
  }
});

test('buildSearchRequestUrl handles plain permalinks and repairs malformed double-question-mark URLs', () => {
  const plainUrl = buildSearchRequestUrl(
    'https://outboundholiday.com/index.php?rest_route=/outbound/v1/search&ver=20261117',
    { q: 'sunset cruise', type: 'all', page: 1, perPage: 6 }
  );
  assert.equal((plainUrl.match(/\?/g) || []).length, 1);
  assert.ok(plainUrl.includes('rest_route=%2Foutbound%2Fv1%2Fsearch'));
  assert.ok(plainUrl.includes('ver=20261117'));
  assert.ok(plainUrl.includes('q=sunset+cruise'));

  const repairedUrl = buildSearchRequestUrl(
    'https://outboundholiday.com/wp-json/outbound/v1/search?ver=123?foo=bar',
    { q: 'ilala', type: 'accommodation', page: 2, perPage: 12 }
  );
  assert.equal((repairedUrl.match(/\?/g) || []).length, 1);
  assert.ok(repairedUrl.includes('ver=123&foo=bar&q=ilala&type=accommodation&page=2&per_page=12'));
});
