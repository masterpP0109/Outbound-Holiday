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
  getPropertyDisplayPriceUSD,
  isPublishedAccommodation,
  parseCategorySlugFromSearch,
  type AccommodationFilters,
} from '../src/utils/accommodation';
import {
  calculateRoomStayQuote,
  getOfferDisplayBadge,
  getPublishedPropertyOffers,
  getPublishedRoomTypes,
  getRoomBedSummary,
  getRoomCapacityLabel,
  getRoomDisplayAmenities,
  getRoomGalleryImages,
  getRoomRatePlans,
  getRoomStartingPriceUSD,
  getRoomWings,
  isSingleEntireHomeProperty,
} from '../src/utils/roomPricing';
import { buildDirectEnquiryEmail, buildDirectEnquiryWhatsAppMessage } from '../src/utils/enquiry';
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

test('supports unlimited custom unit types across hotels (10 rooms), lodges (chalets/tents), apartments, and room-less properties', () => {
  const base = publishedAccommodations[0];

  // 1. Hotel with 10 completely different custom room names
  const tenRoomNames = [
    'Heritage Courtyard Single',
    'Classic Twin Chamber',
    'Rainforest Mist Double',
    'Zambezi Terrace King',
    'Veranda Junior Suite',
    'Edwardian Corner Suite',
    'Royal Palm Honeymoon Suite',
    'Interconnecting Family Wing',
    'Garden Pavilion Studio',
    'Grand Livingstone Residence',
  ];
  const hotel10: DetailedAccommodation = {
    ...base,
    id: 'hotel-10-rooms',
    slug: 'hotel-10-rooms',
    name: 'Victoria Falls Grand Heritage Hotel',
    category: 'Hotel',
    accommodationCategory: 'hotels',
    roomSectionHeading: 'Choose Your Room',
    priceFromUSD: 0,
    roomTypes: tenRoomNames.map((name, i) => ({
      id: `unit_hotel_${i + 1}`,
      name,
      occupancy: `${2 + (i % 3)} Adults`,
      description: `Independent description for ${name}`,
      imageUrl: `https://example.com/hotel-room-${i + 1}.jpg`,
      gallery: [
        { id: `g-${i}-1`, url: `https://example.com/hotel-room-${i + 1}.jpg`, alt: name },
        { id: `g-${i}-2`, url: `https://example.com/hotel-room-${i + 1}-bath.jpg`, alt: `${name} bath` },
      ],
      features: [],
      amenities: i % 2 === 0 ? ['wifi', 'air-conditioning'] : ['bathtub', 'river-view'],
      customAmenities: [`Custom Perk ${i + 1}`],
      status: i === 9 ? 'draft' : 'published',
      pricing: {
        baseNightlyRateUSD: 180 + i * 35,
        startingFromPriceUSD: 180 + i * 35,
        rateStatus: 'provisional',
        priceBasis: 'per_room',
      },
    })),
  };

  const parsedHotel = validatePayload('accommodation', hotel10) as DetailedAccommodation;
  const publishedHotelUnits = getPublishedRoomTypes(parsedHotel);
  assert.equal(parsedHotel.roomTypes.length, 10);
  assert.equal(publishedHotelUnits.length, 9, 'Draft room should be hidden from public published units');
  assert.equal(getPropertyDisplayPriceUSD(parsedHotel), 180, 'Derives lowest published starting price when property base is 0');
  assert.equal(getRoomDisplayAmenities(publishedHotelUnits[0]).some((a) => a.label === 'Wi-Fi'), true);
  assert.equal(getRoomDisplayAmenities(publishedHotelUnits[1]).some((a) => a.label === 'Wi-Fi'), false, 'Room 1 amenities must not bleed into Room 2');
  assert.equal(getRoomGalleryImages(publishedHotelUnits[0]).length, 2);
  assert.notEqual(getRoomGalleryImages(publishedHotelUnits[0])[0].url, getRoomGalleryImages(publishedHotelUnits[1])[0].url);

  // 2. Lodge with chalet & safari tent names and configurable heading
  const lodge: DetailedAccommodation = {
    ...base,
    id: 'zambezi-safari-camp',
    slug: 'zambezi-safari-camp',
    name: 'Zambezi River Safari Camp',
    category: 'Safari Camp',
    accommodationCategory: 'lodges',
    roomSectionHeading: 'Choose Your Chalet or Tent',
    roomTypes: [
      {
        id: 'unit_tent_1',
        name: 'Luxury Safari Tent',
        occupancy: '2 Adults',
        description: 'Canvas tented suite on raised teak deck.',
        imageUrl: 'https://example.com/tent.jpg',
        features: [],
        amenities: ['river-view', 'shower'],
        status: 'published',
        pricing: {
          baseNightlyRateUSD: 410,
          startingFromPriceUSD: 410,
        },
      },
      {
        id: 'unit_chalet_1',
        name: 'River View Chalet',
        occupancy: '2 Adults + 2 Children',
        description: 'Thatch chalet overlooking the Zambezi.',
        imageUrl: 'https://example.com/chalet.jpg',
        features: [],
        amenities: ['private-pool', 'balcony'],
        status: 'published',
        pricing: {
          startingFromPriceUSD: 520,
          baseNightlyRateUSD: null,
        },
      },
    ],
  };
  const parsedLodge = validatePayload('accommodation', lodge) as DetailedAccommodation;
  assert.equal(parsedLodge.roomSectionHeading, 'Choose Your Chalet or Tent');
  assert.equal(getRoomStartingPriceUSD(parsedLodge.roomTypes[0]), 410);
  assert.equal(getRoomStartingPriceUSD(parsedLodge.roomTypes[1]), 520);

  // 3. Apartment listing with bedrooms, bathrooms, and bed configuration
  const apt: DetailedAccommodation = {
    ...base,
    id: 'vic-falls-apartments',
    slug: 'vic-falls-apartments',
    name: 'Victoria Falls Garden Residences',
    category: 'Apartment',
    accommodationCategory: 'apartments',
    roomSectionHeading: 'Explore Our Apartments',
    roomTypes: [
      {
        id: 'unit_apt_3br',
        name: 'Three-Bedroom Apartment',
        unitCategory: 'Apartment',
        sizeSqm: 140,
        occupancy: '6 Guests',
        description: 'Self-catering 3-bedroom residence.',
        imageUrl: 'https://example.com/apt3.jpg',
        features: [],
        amenities: ['kitchenette', 'wifi'],
        occupancyConfig: {
          maxAdults: 4,
          maxChildren: 2,
          maxTotalGuests: 6,
          bedrooms: 3,
          bathrooms: 2,
          beds: [
            { type: 'King Bed', quantity: 1 },
            { type: 'Twin Beds', quantity: 2 },
          ],
        },
        status: 'published',
      },
    ],
  };
  const parsedApt = validatePayload('accommodation', apt) as DetailedAccommodation;
  assert.equal(getRoomCapacityLabel(parsedApt.roomTypes[0]), 'Up to 6 Guests (4 Adults + 2 Children)');
  assert.match(getRoomBedSummary(parsedApt.roomTypes[0]), /3 Bedrooms/);
  assert.match(getRoomBedSummary(parsedApt.roomTypes[0]), /1 × King Bed, 2 × Twin Beds/);

  // 4. Property without room types still validates and displays cleanly
  const roomless: DetailedAccommodation = {
    ...base,
    id: 'roomless-villa',
    slug: 'roomless-villa',
    name: 'Private Zambezi House',
    priceFromUSD: 0,
    roomTypes: [],
  };
  const parsedRoomless = validatePayload('accommodation', roomless) as DetailedAccommodation;
  assert.equal(getPublishedRoomTypes(parsedRoomless).length, 0);
  assert.equal(getPropertyDisplayPriceUSD(parsedRoomless), null);
});

test('independent seasonal, weekend, date-specific, child, and validity pricing falls back safely when incomplete', () => {
  const base = publishedAccommodations[0];
  const seasonalRoom = {
    ...base.roomTypes[0],
    id: 'unit_seasonal',
    name: 'Romantic Hideaway',
    pricing: {
      baseNightlyRateUSD: null,
      startingFromPriceUSD: 320,
      weekendRateUSD: 360,
      weekendDays: ['fri', 'sat'] as ('fri' | 'sat')[],
      baseOccupancyAdults: 2,
      additionalGuestRateUSD: 75,
      childRateUSD: 45,
      minStayNights: 2,
      rateValidFrom: '2026-07-01',
      rateValidTo: '2026-09-30',
      rateStatus: 'provisional' as const,
      priceBasis: 'per_room' as const,
      seasonalRates: [
        {
          id: 'sr_peak',
          label: 'Dry Peak',
          startDate: '2026-08-01',
          endDate: '2026-08-31',
          nightlyRateUSD: 350,
          weekendRateUSD: 400,
          minStayNights: 2,
        },
      ],
      dateSpecificRates: [
        {
          id: 'dr_special',
          date: '2026-08-15', // Saturday
          label: 'Long Weekend Special',
          nightlyRateUSD: 450,
        },
      ],
      mealPlanRates: [
        {
          id: 'mp_hb',
          name: 'Half Board',
          supplementPerPersonPerNightUSD: 30,
          pricingType: 'per_person_per_night' as const,
        },
      ],
    },
  };

  // Dates fully covered by seasonal + date override:
  // 2026-08-14 (Fri -> seasonal weekend 400) + 2026-08-15 (Sat -> date override 450) = 850 base for 2 nights
  // + 1 child @ 45/night * 2 = 90 + Half Board (3 guests * 30 * 2 = 180) => total = 1120
  const validQuote = calculateRoomStayQuote({
    room: seasonalRoom,
    checkIn: '2026-08-14',
    checkOut: '2026-08-16',
    guests: { adults: 2, children: [{ id: 'c1', ageCategory: 'under-11' }] },
    mealPlanId: 'mp_hb',
    currency: 'USD',
  });
  assert.equal(validQuote.mode, 'quoted');
  assert.equal(validQuote.totalUSD, 1120);
  assert.equal(validQuote.minStayNotice, null);

  // Dates outside seasonal coverage without base rate -> falls back to starting rate, never guesses!
  const uncoveredQuote = calculateRoomStayQuote({
    room: seasonalRoom,
    checkIn: '2026-09-05',
    checkOut: '2026-09-07',
    guests: { adults: 2, children: [] },
    currency: 'USD',
  });
  assert.equal(uncoveredQuote.mode, 'starting');
  assert.equal(uncoveredQuote.totalUSD, null);
  assert.match(uncoveredQuote.label, /From \$320 \/ night/);

  // Dates outside rate validity period -> falls back to starting rate with validity notice
  const expiredQuote = calculateRoomStayQuote({
    room: seasonalRoom,
    checkIn: '2026-10-05',
    checkOut: '2026-10-07',
    guests: { adults: 2, children: [] },
    currency: 'USD',
  });
  assert.equal(expiredQuote.mode, 'starting');
  assert.ok(expiredQuote.validityNotice);

  // Room with zero pricing -> "Price on enquiry"
  const unpricedRoom = { ...base.roomTypes[0], id: 'unit_unpriced', name: 'Presidential Villa' };
  const enquiryQuote = calculateRoomStayQuote({
    room: unpricedRoom,
    checkIn: '2026-08-14',
    checkOut: '2026-08-16',
    guests: { adults: 2, children: [] },
    currency: 'USD',
  });
  assert.equal(enquiryQuote.mode, 'enquiry');
  assert.equal(enquiryQuote.label, 'Price on enquiry');
});

test('direct room enquiry WhatsApp and Email builders carry exact property, room, dates, child ages, and pricing', () => {
  const ctx = {
    category: 'room' as const,
    propertyName: 'Zambezi Safari Lodge',
    roomId: 'unit_tent_1',
    roomType: 'Luxury Safari Tent',
    mealPlan: 'Half Board',
    dates: '2026-08-14 to 2026-08-16 (2 nights)',
    guests: '2 Adults, 1 Child',
    childAges: ['Child 1: 7 yrs'],
    customerName: 'Rudo Moyo',
    customerEmail: 'rudo@example.com',
    customerPhone: '+263 77 111 2222',
    estimatedPrice: '$1,120 USD (2 nights)',
    notes: 'River-facing deck if available',
  };

  const waMsg = buildDirectEnquiryWhatsAppMessage(ctx);
  assert.match(waMsg, /Luxury Safari Tent at Zambezi Safari Lodge/);
  assert.match(waMsg, /Meal Plan: Half Board/);
  assert.match(waMsg, /Child 1: 7 yrs/);
  assert.match(waMsg, /\$1,120 USD/);

  const email = buildDirectEnquiryEmail(ctx);
  assert.ok(email);
  assert.equal(email.subject, 'Room Enquiry — Zambezi Safari Lodge — Luxury Safari Tent');
  assert.match(email.body, /Luxury Safari Tent at Zambezi Safari Lodge/);
  assert.match(email.body, /Child 1: 7 yrs/);
  assert.match(email.body, /Estimated Price: \$1,120 USD/);
});

test('representative configurations TEST A–E: hotel wings, guest lodge beds, self-catering breakfast, entire private home, and special offers', () => {
  const base = publishedAccommodations[0];

  // TEST A — LUXURY HOTEL: property wings, distinct galleries, seasonal & market rate plans (including custom market non-calculation safety)
  const testA: DetailedAccommodation = {
    ...base,
    id: 'test-a-luxury-hotel',
    slug: 'test-a-luxury-hotel',
    name: 'Test A Zambezi Grand',
    category: 'Hotel',
    accommodationCategory: 'hotels',
    ratePlans: [
      {
        id: 'rp_zim',
        internalRateName: 'Zimbabwe Resident Seasonal Rate',
        visitorMarket: 'zimbabwe_resident',
        amountUSD: 210,
        priceBasis: 'per_room',
        boardBasis: 'bed_and_breakfast',
        rateStatus: 'confirmed',
        applicableUnitIds: ['unit_a_deluxe'],
      },
      {
        id: 'rp_bespoke',
        internalRateName: 'Charter Group Custom Rate',
        visitorMarket: 'custom',
        customMarketLabel: 'Charter Group',
        amountUSD: 999,
        priceBasis: 'per_group_charter',
        rateStatus: 'provisional',
        applicableUnitIds: ['unit_a_deluxe'],
      },
    ],
    roomTypes: [
      {
        id: 'unit_a_deluxe',
        name: 'Deluxe Riverfront Room',
        wing: 'Deluxe Wing',
        occupancy: '2 Adults',
        description: 'Riverside hotel room.',
        imageUrl: 'https://example.com/deluxe-a.jpg',
        gallery: [{ id: 'ga1', url: 'https://example.com/deluxe-a-2.jpg', alt: 'Bath' }],
        features: ['Air Conditioning'],
        ratePlanIds: ['rp_zim', 'rp_bespoke'],
        pricing: {
          baseNightlyRateUSD: 320,
          startingFromPriceUSD: 320,
          priceBasis: 'per_room',
          seasonalRates: [
            { id: 's1', label: 'Peak Dry', startDate: '2026-08-01', endDate: '2026-08-31', nightlyRateUSD: 380 },
          ],
        },
      },
      {
        id: 'unit_a_suite',
        name: 'Garden Executive Suite',
        wing: 'Pool Wing',
        occupancy: '2 Adults + 1 Child',
        description: 'Poolside suite.',
        imageUrl: 'https://example.com/suite-a.jpg',
        features: ['Private Balcony'],
      },
    ],
  };
  const parsedA = validatePayload('accommodation', testA) as DetailedAccommodation;
  assert.deepEqual(getRoomWings(parsedA), ['Deluxe Wing', 'Pool Wing']);
  assert.equal(getRoomRatePlans(parsedA.roomTypes[0], parsedA).length, 2);
  // Incompatible custom basis must not compute misleading totals
  const customBasisQuote = calculateRoomStayQuote({
    room: parsedA.roomTypes[0],
    property: parsedA,
    checkIn: '2026-08-10',
    checkOut: '2026-08-12',
    guests: { adults: 2, children: [] },
    ratePlanId: 'rp_bespoke',
    currency: 'USD',
  });
  assert.equal(customBasisQuote.mode, 'starting');
  assert.equal(customBasisQuote.totalUSD, null);

  // TEST B — GUEST LODGE: Garden View Room, Pool View Room, Family Room with interleading info & distinct beds
  const testB: DetailedAccommodation = {
    ...base,
    id: 'test-b-guest-lodge',
    slug: 'test-b-guest-lodge',
    name: 'Test B Garden Lodge',
    category: 'Guest Lodge',
    accommodationCategory: 'guest-houses',
    roomTypes: [
      {
        id: 'unit_b_garden',
        name: 'Garden View Room',
        occupancy: '2 Adults',
        description: 'Veranda overlooking lawns.',
        imageUrl: 'https://example.com/bg.jpg',
        features: [],
        occupancyConfig: { maxAdults: 2, maxTotalGuests: 2, beds: [{ type: 'Queen Bed', quantity: 1 }] },
      },
      {
        id: 'unit_b_pool',
        name: 'Pool View Room',
        occupancy: '2 Adults',
        description: 'Poolside wing room.',
        imageUrl: 'https://example.com/bp.jpg',
        features: [],
        occupancyConfig: { maxAdults: 2, maxTotalGuests: 2, beds: [{ type: 'Twin Beds', quantity: 2 }] },
      },
      {
        id: 'unit_b_family',
        name: 'Family Room',
        occupancy: '2 Adults + 2 Children',
        description: 'Two adjoining garden chambers.',
        imageUrl: 'https://example.com/bf.jpg',
        features: [],
        occupancyConfig: {
          maxAdults: 2,
          maxChildren: 2,
          maxTotalGuests: 4,
          bedrooms: 2,
          bathrooms: 2,
          beds: [{ type: 'King Bed', quantity: 1 }, { type: 'Twin Beds', quantity: 2 }],
          interleadingInfo: 'Interleading doorway between main bedroom and twin alcove.',
        },
      },
    ],
  };
  const parsedB = validatePayload('accommodation', testB) as DetailedAccommodation;
  assert.equal(getPublishedRoomTypes(parsedB).length, 3);
  assert.match(getRoomBedSummary(parsedB.roomTypes[2]), /2 Bedrooms · 1 × King Bed, 2 × Twin Beds · 2 Baths/);

  // TEST C — SELF-CATERING PROPERTY: Two-Bedroom & Three-Bedroom Lodges with per-unit pricing + optional breakfast
  const testC: DetailedAccommodation = {
    ...base,
    id: 'test-c-self-catering',
    slug: 'test-c-self-catering',
    name: 'Test C Bush Lodges',
    category: 'Self-Catering',
    accommodationCategory: 'apartments',
    roomTypes: [
      {
        id: 'unit_c_2br',
        name: 'Two-Bedroom Lodge',
        occupancy: 'Up to 4 Guests',
        description: 'Full kitchen, braai deck and loft bedrooms.',
        imageUrl: 'https://example.com/c2.jpg',
        features: ['Full Kitchen'],
        occupancyConfig: { maxAdults: 4, maxTotalGuests: 4, bedrooms: 2, bathrooms: 1 },
        pricing: {
          baseNightlyRateUSD: 240,
          startingFromPriceUSD: 240,
          baseOccupancyAdults: 4,
          priceBasis: 'per_unit',
          mealPlanRates: [
            { id: 'mp_bb', name: 'Optional Breakfast', supplementPerPersonPerNightUSD: 20, pricingType: 'per_person_per_night' },
          ],
        },
      },
      {
        id: 'unit_c_3br',
        name: 'Three-Bedroom Lodge',
        occupancy: 'Up to 6 Guests',
        description: 'Spacious family self-catering lodge.',
        imageUrl: 'https://example.com/c3.jpg',
        features: ['Full Kitchen'],
        occupancyConfig: { maxAdults: 6, maxTotalGuests: 6, bedrooms: 3, bathrooms: 2 },
        pricing: { baseNightlyRateUSD: 340, startingFromPriceUSD: 340, baseOccupancyAdults: 6, priceBasis: 'per_unit' },
      },
    ],
  };
  const parsedC = validatePayload('accommodation', testC) as DetailedAccommodation;
  const selfCateringWithBreakfast = calculateRoomStayQuote({
    room: parsedC.roomTypes[0],
    checkIn: '2026-08-10',
    checkOut: '2026-08-12', // 2 nights
    guests: { adults: 3, children: [] },
    mealPlanId: 'mp_bb',
    currency: 'USD',
  });
  // (240 * 2) + (20 * 3 adults * 2 nights = 120) = 600 USD
  assert.equal(selfCateringWithBreakfast.totalUSD, 600);

  // TEST D — ENTIRE PRIVATE HOME: single exclusive-use unit
  const testD: DetailedAccommodation = {
    ...base,
    id: 'test-d-private-home',
    slug: 'test-d-private-home',
    name: 'Test D Zambezi Manor House',
    category: 'Private Home',
    accommodationCategory: 'apartments',
    roomTypes: [
      {
        id: 'unit_d_house',
        name: 'Exclusive Four-Bedroom Manor House',
        isEntireProperty: true,
        occupancy: '8 Guests',
        description: 'Whole private home with pool and chef kitchen.',
        imageUrl: 'https://example.com/manor.jpg',
        features: ['Full Kitchen', 'Private Pool'],
        occupancyConfig: { maxAdults: 8, maxTotalGuests: 8, bedrooms: 4, bathrooms: 4 },
        pricing: { baseNightlyRateUSD: 950, startingFromPriceUSD: 950, baseOccupancyAdults: 8, priceBasis: 'per_unit' },
      },
    ],
  };
  const parsedD = validatePayload('accommodation', testD) as DetailedAccommodation;
  assert.equal(isSingleEntireHomeProperty(parsedD), true);

  // TEST E — SPECIAL OFFER linked to an existing room without duplicating the room record
  const testE: DetailedAccommodation = {
    ...parsedA,
    offers: [
      {
        id: 'offer_romantic_getaway',
        title: 'Romantic Zambezi Getaway',
        description: 'Sunset river cruise and candlelit private terrace dinner applied to Deluxe rooms.',
        includedServices: ['Sunset boat cruise', 'Private champagne dinner'],
        applicableUnitIds: ['unit_a_deluxe'],
        priceType: 'percentage_discount',
        discountPercent: 15,
        status: 'published',
        ctaLabel: 'Enquire About This Offer',
      },
    ],
  };
  const parsedE = validatePayload('accommodation', testE) as DetailedAccommodation;
  assert.equal(parsedE.roomTypes.length, 2); // No duplicated room record!
  const linkedOffers = getPublishedPropertyOffers(parsedE, 'unit_a_deluxe');
  assert.equal(linkedOffers.length, 1);
  assert.equal(getOfferDisplayBadge(linkedOffers[0], 'USD'), '15% Savings');
  assert.equal(getPublishedPropertyOffers(parsedE, 'unit_a_suite').length, 0);

  const offerWaMsg = buildDirectEnquiryWhatsAppMessage({
    category: 'room',
    propertyName: parsedE.name,
    roomId: 'unit_a_deluxe',
    roomType: 'Deluxe Riverfront Room',
    offerId: 'offer_romantic_getaway',
    offerName: 'Romantic Zambezi Getaway',
  });
  assert.match(offerWaMsg, /Special Offer: Romantic Zambezi Getaway/);
});

test('trashed units, trashed/archived offers, and deactivated rates are excluded from frontend display and quotes', () => {
  const sampleProp = publishedAccommodations[0];
  const withCrudStates: DetailedAccommodation = {
    ...sampleProp,
    offers: [
      { id: 'off_live', title: 'Live Special', offerCategory: 'special_offer', priceType: 'added_value', status: 'published', applyToEntireProperty: true },
      { id: 'off_arch', title: 'Archived Promo', offerCategory: 'seasonal_promotion', priceType: 'added_value', status: 'archived', applyToEntireProperty: true },
      { id: 'off_trash', title: 'Trashed Package', offerCategory: 'honeymoon_package', priceType: 'added_value', status: 'trashed', applyToEntireProperty: true },
    ],
    ratePlans: [
      { id: 'rp_live', internalRateName: 'Active B&B', validFrom: '2026-01-01', validTo: '2026-12-31', amountUSD: 250, priceBasis: 'per_room', visitorMarket: 'international', adultOrChildCategory: 'all', boardBasis: 'bed_and_breakfast', rateStatus: 'confirmed', isActive: true, applicableUnitIds: ['u_pub'] },
      { id: 'rp_off', internalRateName: 'Deactivated 2025 Tariff', validFrom: '2025-01-01', validTo: '2025-12-31', amountUSD: 180, priceBasis: 'per_room', visitorMarket: 'international', adultOrChildCategory: 'all', boardBasis: 'room_only', rateStatus: 'confirmed', isActive: false, applicableUnitIds: ['u_pub'] },
    ],
    roomTypes: [
      {
        id: 'u_pub',
        name: 'Published Villa',
        occupancy: '2 Adults',
        description: 'Live unit',
        imageUrl: 'https://example.com/u_pub.jpg',
        features: ['Wi-Fi'],
        status: 'published',
        pricing: {
          baseNightlyRateUSD: 300,
          seasonalRates: [
            { id: 'sr_active', label: 'Peak Active', startDate: '2026-07-01', endDate: '2026-09-30', nightlyRateUSD: 380, isActive: true },
            { id: 'sr_deact', label: 'Old Inactive Season', startDate: '2026-07-01', endDate: '2026-09-30', nightlyRateUSD: 150, isActive: false },
          ],
          mealPlanRates: [
            { id: 'mp_live', name: 'Half Board', supplementPerPersonPerNightUSD: 40, pricingType: 'per_person_per_night', isActive: true },
            { id: 'mp_off', name: 'Old Discontinued Board', supplementPerPersonPerNightUSD: 10, pricingType: 'per_person_per_night', isActive: false },
          ],
        },
      },
      { id: 'u_trash', name: 'Trashed Unit', occupancy: '2 Adults', description: 'Hidden', imageUrl: 'https://example.com/t.jpg', features: [], status: 'trashed' },
      { id: 'u_arch', name: 'Archived Unit', occupancy: '2 Adults', description: 'Hidden', imageUrl: 'https://example.com/a.jpg', features: [], status: 'archived' },
    ],
  };

  const parsed = validatePayload('accommodation', withCrudStates) as DetailedAccommodation;
  const pubRooms = getPublishedRoomTypes(parsed);
  assert.deepEqual(pubRooms.map((r) => r.id), ['u_pub']);

  const pubOffers = getPublishedPropertyOffers(parsed, 'u_pub');
  assert.deepEqual(pubOffers.map((o) => o.id), ['off_live']);

  const activePlans = getRoomRatePlans(pubRooms[0], parsed);
  assert.deepEqual(activePlans.map((rp) => rp.id), ['rp_live']);

  const quote = calculateRoomStayQuote({
    room: pubRooms[0],
    property: parsed,
    checkIn: '2026-07-10',
    checkOut: '2026-07-12',
    guests: { adults: 2, children: [] },
  });
  // Deactivated $150 seasonal rate must be ignored; active $380 seasonal rate applies (2 * $380 = $760)
  assert.equal(quote.totalUSD, 760);
});
