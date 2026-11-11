import test from 'node:test';
import assert from 'node:assert/strict';
import publishedContent from '../src/runtime/published-content.json' with { type: 'json' };
import { SnapshotSchema, validatePayload } from '../shared/content-schema';
import { installContent } from '../src/runtime/catalog';
import type { DetailedAccommodation } from '../src/types/content';
import {
  advisorAnswersToFilters,
  filterAndSortAccommodations,
  getAccommodationCategoryId,
  getAccommodationCategoryLabel,
  getAccommodationCategorySingular,
  getKeyAmenitiesForCard,
  getMaxGuestCapacity,
  getPriceUnitLabel,
  getPropertyAmenities,
  isPublishedAccommodation,
  parseCategorySlugFromSearch,
  type AccommodationFilters,
} from '../src/utils/accommodation';
import { getWhatsAppAccommodationEnquiryUrl } from '../src/utils/whatsapp';

const publishedAccommodations = publishedContent.accommodations as DetailedAccommodation[];

const DEFAULT_FILTERS: AccommodationFilters = {
  category: 'all',
  search: '',
  minPriceUSD: null,
  maxPriceUSD: null,
  minGuests: null,
  amenities: [],
  sortBy: 'recommended',
};

test('published snapshot passes strict schema validation', () => {
  const result = SnapshotSchema.parse(publishedContent);
  assert.ok(result, 'Expected SnapshotSchema to parse published-content.json');
  assert.equal(result.accommodations.length, publishedAccommodations.length);
});

test('all existing properties map cleanly into the four canonical categories', () => {
  const counts: Record<string, number> = {
    hotels: 0,
    lodges: 0,
    'guest-houses': 0,
    apartments: 0,
  };

  for (const property of publishedAccommodations) {
    const id = getAccommodationCategoryId(property);
    counts[id] = (counts[id] ?? 0) + 1;
  }

  assert.equal(counts.hotels, 2);
  assert.equal(counts.lodges, 2);
  assert.equal(counts['guest-houses'], 3);
  assert.equal(counts.apartments, 1);

  const sampleHotel = publishedAccommodations.find((p) => p.category === 'Boutique Hotel');
  assert.ok(sampleHotel);
  assert.equal(getAccommodationCategoryLabel(sampleHotel), 'Hotels');
});

test('dynamic search matches names, categories, locations, and descriptions alongside category filter', () => {
  const byLocation = filterAndSortAccommodations(publishedAccommodations, {
    ...DEFAULT_FILTERS,
    search: 'zambezi',
  });
  assert.ok(byLocation.length >= 1, 'Expected at least one Zambezi match');

  const byCategoryKeyword = filterAndSortAccommodations(publishedAccommodations, {
    ...DEFAULT_FILTERS,
    search: 'apartments',
  });
  assert.equal(byCategoryKeyword.length, 1);
  assert.equal(byCategoryKeyword[0].id, 'lokuthula-lodges');

  const mismatchedCategory = filterAndSortAccommodations(publishedAccommodations, {
    ...DEFAULT_FILTERS,
    category: 'hotels',
    search: 'Lokuthula',
  });
  assert.equal(mismatchedCategory.length, 0);
});

test('price range, guest capacity, amenities, and sorting work together', () => {
  const luxuryMin = filterAndSortAccommodations(publishedAccommodations, {
    ...DEFAULT_FILTERS,
    minPriceUSD: 400,
    sortBy: 'price-asc',
  });
  assert.ok(luxuryMin.length >= 2);
  for (let i = 1; i < luxuryMin.length; i++) {
    assert.ok(luxuryMin[i - 1].priceFromUSD <= luxuryMin[i].priceFromUSD);
  }

  const familySelfCatering = filterAndSortAccommodations(publishedAccommodations, {
    ...DEFAULT_FILTERS,
    minGuests: 4,
    amenities: ['self-catering', 'pool'],
  });
  assert.equal(familySelfCatering.length, 1);
  assert.equal(familySelfCatering[0].id, 'lokuthula-lodges');
  assert.equal(getMaxGuestCapacity(familySelfCatering[0]), 6);
  assert.ok(getKeyAmenitiesForCard(familySelfCatering[0]).length <= 3);

  const sortedByName = filterAndSortAccommodations(publishedAccommodations, {
    ...DEFAULT_FILTERS,
    sortBy: 'name-asc',
  });
  for (let i = 1; i < sortedByName.length; i++) {
    assert.ok(sortedByName[i - 1].name.localeCompare(sortedByName[i].name) <= 0);
  }

  const sortedDesc = filterAndSortAccommodations(publishedAccommodations, {
    ...DEFAULT_FILTERS,
    sortBy: 'price-desc',
  });
  for (let i = 1; i < sortedDesc.length; i++) {
    assert.ok(sortedDesc[i - 1].priceFromUSD >= sortedDesc[i].priceFromUSD);
  }
});

test('supports structured WordPress fields, parking amenity, check-in/out times, and publicationStatus', () => {
  const base = publishedAccommodations[0];
  const wpPublished: DetailedAccommodation = {
    ...base,
    id: 'wp-sample-apartment',
    slug: 'wp-sample-apartment',
    name: 'Zambezi Riverside Suites',
    category: 'Apartment',
    accommodationCategory: 'apartments',
    currency: 'USD',
    priceUnit: 'per apartment',
    maxGuests: 5,
    amenities: ['Wi-Fi', 'Parking', 'Self-Catering'],
    checkInTime: '14:00',
    checkOutTime: '10:00',
    publicationStatus: 'published',
  };
  const wpDraft: DetailedAccommodation = {
    ...wpPublished,
    id: 'wp-draft-stay',
    slug: 'wp-draft-stay',
    name: 'Unpublished Draft Stay',
    publicationStatus: 'draft',
  };

  const validatedPublished = validatePayload('accommodation', wpPublished);
  const validatedDraft = validatePayload('accommodation', wpDraft);
  assert.ok(validatedPublished, 'Expected WP-structured accommodation fields to pass strict Zod validation');
  assert.ok(validatedDraft, 'Expected draft accommodation record to pass strict Zod validation');

  assert.equal(isPublishedAccommodation(wpPublished), true);
  assert.equal(isPublishedAccommodation(wpDraft), false);
  assert.equal(getAccommodationCategoryId(wpPublished), 'apartments');
  assert.equal(getMaxGuestCapacity(wpPublished), 5);
  assert.equal(getPriceUnitLabel(wpPublished), 'per apartment');
  assert.ok(getPropertyAmenities(wpPublished).includes('parking'));

  const withParking = filterAndSortAccommodations([wpPublished, wpDraft], {
    ...DEFAULT_FILTERS,
    amenities: ['parking'],
    minGuests: 5,
  });
  assert.equal(withParking.length, 1);
  assert.equal(withParking[0].id, 'wp-sample-apartment');
});

test('category URL parsing, singular badges, advisor filter sync, and WhatsApp enquiry details work together', () => {
  installContent(SnapshotSchema.parse(publishedContent));
  assert.equal(parseCategorySlugFromSearch('?category=hotels'), 'hotels');
  assert.equal(parseCategorySlugFromSearch('?category=guest-houses'), 'guest-houses');
  assert.equal(parseCategorySlugFromSearch('?category=unknown'), 'all');

  const sampleLodge = publishedAccommodations.find((p) => p.category === 'Safari Lodge');
  assert.ok(sampleLodge);
  assert.equal(getAccommodationCategorySingular(sampleLodge), 'Lodge');

  const advisorFilters = advisorAnswersToFilters({
    travellerGroup: 'family',
    budgetLevel: 'comfortable',
    priorities: [],
    style: 'self-catering',
  });
  assert.equal(advisorFilters.category, 'apartments');
  assert.equal(advisorFilters.minGuests, 4);
  assert.ok(advisorFilters.amenities?.includes('family-friendly'));
  assert.ok(advisorFilters.amenities?.includes('self-catering'));

  const whatsappHref = getWhatsAppAccommodationEnquiryUrl('Ilala Lodge Hotel', {
    dates: '12-16 Aug 2026',
    guests: '2 Adults',
    roomPreference: 'Deluxe Suite',
  });
  assert.ok(whatsappHref.startsWith('https://wa.me/263714701721?text='));
  const decoded = decodeURIComponent(whatsappHref.split('text=')[1]);
  assert.match(decoded, /Ilala Lodge Hotel/);
  assert.match(decoded, /12-16 Aug 2026/);
  assert.match(decoded, /2 Adults/);
  assert.match(decoded, /Deluxe Suite/);
});
