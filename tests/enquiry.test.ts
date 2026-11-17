import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { installContent } from '../src/runtime/catalog';
import { EnquirySchema } from '../shared/submission-schema';
import {
  buildDirectEnquiryEmail,
  buildDirectEnquiryWhatsAppMessage,
  buildDirectEnquiryWhatsAppUrl,
  calculateAccommodationEstimate,
  calculateActivityEstimate,
  calculatePackageEstimate,
  formatChildBreakdown,
  formatGuestSummary,
  getEnquiryItemLabel,
  isValidEmail,
  isValidPhone,
  resizeChildrenList,
} from '../src/utils/enquiry';
import { calculateNights } from '../src/components/travel/DateRangeCalendar';
import { getCanonicalShareUrl } from '../src/components/common/ShareButton';
import {
  calculateHolidayEstimate,
  mergeLiveBuilderActivities,
  resolveBuilderAccommodations,
  resolveMatchingActivityId,
} from '../src/utils/holidayCalculator';
import type { ActivityItem, DetailedAccommodation, Experience } from '../src/types/content';

const snapshotPath = path.resolve(process.cwd(), 'src/runtime/published-content.json');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

test('buildDirectEnquiryWhatsAppUrl generates contextual room, package, experience, and general URLs', () => {
  installContent(snapshot);

  const roomMsg = buildDirectEnquiryWhatsAppMessage({
    category: 'room',
    propertyName: 'Victoria Falls Safari Lodge',
    roomType: 'Waterhole Facing Suite',
    dates: '2026-08-12 to 2026-08-16',
    guests: '2 Adults',
  });
  assert.match(roomMsg, /Waterhole Facing Suite at Victoria Falls Safari Lodge/);
  assert.match(roomMsg, /Dates: 2026-08-12 to 2026-08-16/);
  assert.match(roomMsg, /Guests: 2 Adults/);

  const roomUrl = buildDirectEnquiryWhatsAppUrl({
    category: 'room',
    propertyName: 'Victoria Falls Safari Lodge',
    roomType: 'Waterhole Facing Suite',
  });
  assert.ok(roomUrl.startsWith('https://wa.me/263714701721?text='));

  const pkgMsg = buildDirectEnquiryWhatsAppMessage({
    category: 'package',
    packageName: 'Family Adventure',
  });
  assert.match(pkgMsg, /Family Adventure package/);

  const expMsg = buildDirectEnquiryWhatsAppMessage({
    category: 'experience',
    activityName: 'Sunset Cruise',
  });
  assert.match(expMsg, /Sunset Cruise in Victoria Falls/);
});

test('buildDirectEnquiryEmail uses CMS contact email and builds contextual subject and body', () => {
  installContent(snapshot);

  const email = buildDirectEnquiryEmail({
    category: 'room',
    propertyName: 'Victoria Falls Safari Lodge',
    roomType: 'Waterhole Facing Suite',
  });
  assert.ok(email !== null);
  assert.equal(email.to, snapshot.site.contact.email);
  assert.equal(
    email.subject,
    'Room Enquiry — Victoria Falls Safari Lodge — Waterhole Facing Suite'
  );
  assert.match(email.body, /Waterhole Facing Suite at Victoria Falls Safari Lodge/);
  assert.ok(email.mailtoUrl.startsWith(`mailto:${snapshot.site.contact.email}?subject=`));

  assert.equal(
    getEnquiryItemLabel({
      category: 'room',
      propertyName: 'Victoria Falls Safari Lodge',
      roomType: 'Waterhole Facing Suite',
    }),
    'Waterhole Facing Suite · Victoria Falls Safari Lodge'
  );
});

test('buildDirectEnquiryEmail returns null when CMS contact email is missing or invalid', () => {
  const brokenSnapshot = structuredClone(snapshot);
  brokenSnapshot.site.contact.email = '';
  installContent(brokenSnapshot);

  const email = buildDirectEnquiryEmail({
    category: 'package',
    packageName: 'Family Adventure',
  });
  assert.equal(email, null);
});

test('Guest selection, child age categories, and pricing rules handle adults, children, and provisional rates', () => {
  const children = resizeChildrenList([], 2);
  children[1] = { id: 'child-2', ageCategory: '11-plus' };

  const guests = { adults: 2, children };
  assert.equal(formatGuestSummary(guests), '2 Adults · 2 Children');
  assert.deepEqual(formatChildBreakdown(children), [
    'Child 1 — Under 11',
    'Child 2 — 11 years or older',
  ]);

  // Activity with 2 adults only
  const actAdultsOnly = calculateActivityEstimate({
    basePriceUSD: 85,
    guests: { adults: 2, children: [] },
  });
  assert.equal(actAdultsOnly.amount, 170);

  // Activity with Under 11 child and no supplier child rate -> provisional
  const actWithChild = calculateActivityEstimate({
    basePriceUSD: 85,
    guests,
  });
  assert.equal(actWithChild.amount, null);
  assert.equal(actWithChild.label, 'Price available on enquiry');

  // Package for family without child rate -> provisional adult + child rates on enquiry
  const pkgFamily = calculatePackageEstimate({
    basePricePerAdultUSD: 1200,
    guests,
  });
  assert.equal(pkgFamily.amount, null);
  assert.match(pkgFamily.disclaimer, /subject to availability and confirmation/i);

  // Accommodation 3-night range
  const nights = calculateNights('2026-09-10', '2026-09-13');
  assert.equal(nights, 3);
  const invalidNights = calculateNights('2026-09-13', '2026-09-10');
  assert.equal(invalidNights, 0);

  const accEstimate = calculateAccommodationEstimate({
    nightlyRateUSD: 280,
    nights: 3,
    roomsCount: 1,
    guests: { adults: 2, children: [] },
    pricingBasis: 'per_room',
  });
  assert.equal(accEstimate.amount, 840);

  const accUnknown = calculateAccommodationEstimate({
    nightlyRateUSD: null,
    nights: 3,
    roomsCount: 1,
    guests: { adults: 2, children: [] },
  });
  assert.equal(accUnknown.label, 'Price available on enquiry');
});

test('Contact validation and canonical share URL strip private data', () => {
  assert.equal(isValidPhone('+263 714 701 721'), true);
  assert.equal(isValidPhone('123'), false);
  assert.equal(isValidEmail('guest@example.com'), true);
  assert.equal(isValidEmail('not-an-email'), false);

  const url = getCanonicalShareUrl('/accommodation/victoria-falls-safari-lodge');
  assert.equal(url, 'https://outboundholiday.com/accommodation/victoria-falls-safari-lodge');
});

test('Holiday Builder calculator syncs live CMS experience prices, Where to Stay rates, and shared/private transfer costs', () => {
  const experiences = snapshot.experiences as Experience[];
  const rawBuilderActs = snapshot.builderActivities as ActivityItem[];
  const accommodations = snapshot.accommodations as DetailedAccommodation[];

  // Append a newly added CMS experience with custom price
  const extendedExps: Experience[] = [
    ...experiences.map((e) => (e.id === 'guided-tour-falls' ? { ...e, priceAmount: 70 } : e)),
    {
      ...experiences[0],
      id: 'zambezi-microlight',
      slug: 'zambezi-microlight',
      title: 'Zambezi Microlight Flight',
      duration: '15 Mins',
      priceAmount: 195,
      fromPrice: 'From US$195',
    },
  ];

  const syncedActs = mergeLiveBuilderActivities(rawBuilderActs, extendedExps);
  const guided = syncedActs.find((a) => a.id === 'act-guided-falls');
  const cruise = syncedActs.find((a) => a.id === 'act-sunset-cruise');
  const bungee = syncedActs.find((a) => a.id === 'bungee-jump');
  const microlight = syncedActs.find((a) => a.id === 'zambezi-microlight');

  assert.equal(guided?.priceUSD, 70, 'Synced builder activity uses updated live CMS Experience price ($70)');
  assert.equal(cruise?.priceUSD, 85, 'Synced Sunset Cruise matches live Experience price ($85 vs stale $75)');
  assert.equal(bungee?.priceUSD, 160, 'All remaining CMS experiences are selectable with live prices');
  assert.equal(microlight?.priceUSD, 195, 'Newly added CMS experience is included with exact price');

  assert.equal(resolveMatchingActivityId(syncedActs, 'bungee-jump'), 'bungee-jump');
  assert.equal(resolveMatchingActivityId(syncedActs, 'guided-tour-falls'), 'act-guided-falls');

  // Test Where to Stay resolution including property with priceFromUSD=0 falling back to lowest published room rate
  const customAccs: DetailedAccommodation[] = [
    ...accommodations,
    {
      ...accommodations[0],
      id: 'acc-room-derived',
      slug: 'room-derived-lodge',
      name: 'Room Derived Safari Lodge',
      priceFromUSD: 0,
      roomTypes: [
        {
          id: 'draft-cheap',
          name: 'Draft Cheap Room',
          status: 'draft',
          occupancy: '2 Adults',
          description: '',
          imageUrl: '',
          features: [],
          pricing: { startingFromPriceUSD: 99, baseNightlyRateUSD: 99 },
        },
        {
          id: 'pub-suite',
          name: 'River Tent',
          status: 'published',
          occupancy: '2 Adults',
          description: '',
          imageUrl: '',
          features: [],
          pricing: { startingFromPriceUSD: 340, baseNightlyRateUSD: 340 },
        },
      ],
    },
  ];
  const stayOptions = resolveBuilderAccommodations(customAccs);
  const ilala = stayOptions.find((o) => o.id === 'ilala-lodge-hotel' || o.slug === 'ilala-lodge-hotel');
  const derived = stayOptions.find((o) => o.id === 'acc-room-derived');
  assert.equal(ilala?.pricePerNightUSD, 295);
  assert.equal(derived?.pricePerNightUSD, 340, 'Uses lowest published room rate ($340) ignoring draft ($99)');

  // Estimate math parity check: 2A + 1C (2 rooms), 3 nights @ $295, activities $70 + $85 = $155, shared-shuttle $60
  const est = calculateHolidayEstimate({
    nights: 3,
    adults: 2,
    children: 1,
    stayNightRateUSD: 295,
    activityRatesUSD: [guided!.priceUSD, cruise!.priceUSD],
    transportType: 'shared-shuttle',
  });
  // stay: 295 * 3 * 2 = 1770; activities: 155 * 2.8 = 434; transport: 60 => min = 2264, max = round(2264 * 1.18) = 2672
  assert.equal(est.rooms, 2);
  assert.equal(est.stayCost, 1770);
  assert.equal(est.activitiesCost, 434);
  assert.equal(est.transportCost, 60);
  assert.equal(est.minimumUSD, 2264);
  assert.equal(est.maximumUSD, 2672);
});

test('Holiday Builder Quick & Guided payloads validate cleanly against EnquirySchema', () => {
  const guidedPayload = {
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phone: '+263771122334',
    message: '',
    source: 'holiday-builder',
    promotionId: 12,
    promotionName: 'Winter Falls Special',
    marketingConsent: false,
    website: '',
    startedAt: Date.now() - 5000,
    trip: {
      entryMode: 'guided',
      promotionId: 12,
      promotionName: 'Winter Falls Special',
      preferredContact: 'email',
      displayedEstimate: {
        minimumUSD: 1450,
        maximumUSD: 1711,
        currency: 'USD',
        clientUnverified: true,
      },
      itineraryDraft: [
        { day: 'Day 1', title: 'Arrival', description: 'Private transfer to lodge.' },
      ],
      intent: 'first-time',
      partyType: 'couple',
      adults: 2,
      children: 0,
      nights: 3,
      travelDates: 'dry',
      stayTierId: 'comfort-plus',
      stayTierName: 'Comfort Plus Lodge',
      stayNightRateUSD: 235,
      stayPreferences: ['Riverfront'],
      activityIds: ['act-sunset-cruise'],
      selectedActivities: [
        { id: 'act-sunset-cruise', title: 'Sunset Cruise', duration: '2 Hours', unitPriceUSD: 85 },
      ],
      experienceIds: [],
      accommodationId: 'victoria-falls-safari-lodge',
      accommodationName: 'Victoria Falls Safari Lodge',
      accommodationCategory: 'Lodge',
      transportType: 'undecided',
    },
  };

  const parsedGuided = EnquirySchema.parse(guidedPayload);
  assert.equal(parsedGuided.source, 'holiday-builder');
  assert.equal(parsedGuided.trip.entryMode, 'guided');
  assert.equal(parsedGuided.trip.transportType, 'undecided');

  const quickPayload = {
    ...guidedPayload,
    message: 'Quick enquiry for family trip.',
    trip: {
      ...guidedPayload.trip,
      entryMode: 'quick',
      itineraryDraft: undefined,
      transportType: 'shared-shuttle',
    },
  };
  const parsedQuick = EnquirySchema.parse(quickPayload);
  assert.equal(parsedQuick.trip.entryMode, 'quick');

  const badExtra = EnquirySchema.safeParse({ ...guidedPayload, unexpectedEvilKey: 'x' });
  assert.equal(badExtra.success, false, 'Strict EnquirySchema still rejects unknown keys');
});
