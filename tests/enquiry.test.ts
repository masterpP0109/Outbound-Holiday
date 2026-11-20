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
import {
  calculateNights,
  formatCompactCalendarRangeSummary,
} from '../src/components/travel/DateRangeCalendar';
import { getCanonicalShareUrl } from '../src/components/common/ShareButton';
import { getPriceUnitLabel } from '../src/utils/accommodation';
import {
  buildDynamicHolidayItinerary,
  calculateHolidayEstimate,
  calculateItemizedTripEstimate,
  formatTimeSlotDisplayLabel,
  mergeLiveBuilderActivities,
  resolveBuilderAccommodations,
  resolveMatchingActivityId,
} from '../src/utils/holidayCalculator';
import {
  TRIP_PLAN_STORAGE_KEY,
  buildPlannerPlanWhatsAppUrl,
  buildPlannerSubmissionPayload,
  buildQuickHelpWhatsAppUrl,
  createEmptyTripPlanDraft,
  getApplicableActivityTimeOptions,
  getDefaultTimeForActivity,
  getTripCalendarDays,
  hasMeaningfulDraftContent,
  isActivityDateOutsideTrip,
  loadTripPlanDraft,
  resolveTripPlanContext,
  saveTripPlanDraft,
} from '../src/utils/tripPlanBuilder';
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
  assert.equal(ilala?.pricePerNightUSD, 271);
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

test('Holiday Builder dynamic itinerary, room/date/child fields, undecided transfers, and sharing price labels stay consistent', () => {
  const ilalaLike = { ...(snapshot.accommodations[0] as DetailedAccommodation), priceUnit: 'per night (sharing)' };
  assert.equal(getPriceUnitLabel(ilalaLike), 'per person sharing per night');

  const itinerary4N = buildDynamicHolidayItinerary({
    nights: 4,
    stayLabel: 'Ilala Lodge Hotel ($271 per person sharing per night)',
    transportType: 'undecided',
    arrivalDate: '2026-08-10',
    departureDate: '2026-08-14',
    activities: [
      { id: 'act-sunset-cruise', title: 'Upper Zambezi Sunset Cruise', duration: '2 Hours', preferredDay: 'day-1' },
      { id: 'chobe-day-safari', title: 'Chobe Full-Day Safari', duration: '11 Hours', preferredDay: 'day-2' },
    ],
    requestedRooms: 1,
    familyRoomRequested: true,
  });
  assert.equal(itinerary4N.length, 5, '4 nights generates 5 days (Day 1..Day 5)');
  assert.match(itinerary4N[0].day, /^Day 1/);
  assert.match(itinerary4N[4].day, /^Day 5/);
  assert.match(itinerary4N[0].description, /to be quoted separately/i);
  assert.match(itinerary4N[0].description, /Upper Zambezi Sunset Cruise/);
  assert.match(itinerary4N[1].description, /Chobe Full-Day Safari/);

  const itineraryEmpty = buildDynamicHolidayItinerary({
    nights: 5,
    stayLabel: 'Comfort Plus Lodge ($235/night)',
    transportType: 'private-transfers',
    activities: [],
  });
  assert.equal(itineraryEmpty.length, 6);
  assert.ok(!itineraryEmpty.some((d) => /Boma|Helicopter|Chobe/i.test(d.title)), 'Zero activities leaves no unselected highlights');

  const estUndecided = calculateHolidayEstimate({
    nights: 2,
    adults: 2,
    children: 1,
    childAges: ['11+'],
    stayNightRateUSD: 271,
    activityRatesUSD: [85],
    transportType: 'undecided',
    pricingBasis: 'per_person',
  });
  assert.equal(estUndecided.transportQuotedSeparately, true);
  assert.equal(estUndecided.transportCost, 0);
  assert.equal(estUndecided.hasOlderChildren, true);
  assert.equal(estUndecided.activitiesCost, 85 * 3);

  const extendedTrip = EnquirySchema.parse({
    name: 'Amara Phiri',
    email: 'amara@example.com',
    message: '',
    source: 'holiday-builder',
    website: '',
    startedAt: Date.now() - 5000,
    trip: {
      entryMode: 'guided',
      adults: 2,
      children: 2,
      childAges: ['Under 11', '11 years'],
      nights: 14,
      arrivalDate: '2026-09-01',
      departureDate: '2026-09-15',
      requestedRooms: 1,
      familyRoomRequested: true,
      stayTierId: 'comfort-plus',
      transportType: 'undecided',
      transportQuotedSeparately: true,
      itineraryDraft: Array.from({ length: 15 }, (_, idx) => ({
        day: `Day ${idx + 1}`,
        title: `Victoria Falls Day ${idx + 1}`,
        description: 'Tailored holiday schedule.',
      })),
    },
  });
  assert.equal(extendedTrip.trip.itineraryDraft?.length, 15);
  assert.equal(extendedTrip.trip.familyRoomRequested, true);
});

test('mergeLiveBuilderActivities respects includeInBuilder exclusions, suggestedByDefault, displayOrder, and explicit priceOverrideEnabled', () => {
  const sampleExp = snapshot.experiences.find((e) => e.slug === 'upper-zambezi-sunset-cruise')!;
  const curatedActs = [
    {
      id: 'act-sunset-cruise',
      experienceId: sampleExp.id,
      includeInBuilder: true,
      suggestedByDefault: false,
      displayOrder: 20,
      priceOverrideEnabled: true,
      title: 'Old Title',
      duration: '1 Hour',
      priceUSD: 72,
      imageUrl: '/old.jpg',
      badge: 'Override',
      shortDesc: 'Old desc',
      whyRecommend: 'Old why',
      idealFor: ['first-time'],
    },
    {
      id: 'act-guided-falls',
      experienceId: 'guided-tour-falls',
      includeInBuilder: false,
      suggestedByDefault: false,
      displayOrder: 5,
      priceOverrideEnabled: false,
      title: 'Excluded Falls',
      duration: '2 Hours',
      priceUSD: 40,
      imageUrl: '/falls.jpg',
      badge: 'Hidden',
      shortDesc: 'Should stay excluded',
      whyRecommend: 'Hidden',
      idealFor: ['first-time'],
    },
    {
      id: 'act-boma-dinner',
      experienceId: 'boma-dinner-show',
      includeInBuilder: true,
      suggestedByDefault: true,
      displayOrder: 1,
      priceOverrideEnabled: false,
      title: 'Stale Boma Title',
      duration: '1 Hour',
      priceUSD: 19,
      imageUrl: '/boma.jpg',
      badge: 'Dinner',
      shortDesc: 'Stale summary',
      whyRecommend: 'Stale why',
      idealFor: ['family'],
    },
  ];

  const merged = mergeLiveBuilderActivities(curatedActs as never, snapshot.experiences as never);
  assert.equal(merged.length, 2, 'Excluded & unconfigured experiences must not be auto-re-added');
  assert.equal(merged[0].id, 'act-boma-dinner', 'Sorted ascending by displayOrder');
  assert.equal(merged[0].suggestedByDefault, true);
  assert.equal(merged[0].priceSource, 'experience-catalog');
  assert.equal(merged[0].priceUSD, snapshot.experiences.find((e) => e.slug === 'boma-dinner-show')?.priceAmount);

  assert.equal(merged[1].id, 'act-sunset-cruise');
  assert.equal(merged[1].title, sampleExp.title, 'Catalog title stays authoritative');
  assert.equal(merged[1].priceSource, 'builder-override');
  assert.equal(merged[1].priceUSD, 72, 'Explicit priceOverrideEnabled preserves builder-only price');
});

test('first-screen direct WhatsApp draft starts with exact greeting and contains zero invented defaults', () => {
  const url = buildQuickHelpWhatsAppUrl({
    replyMethod: 'whatsapp',
    phone: '+263771234567',
  });
  const textParam = new URL(url).searchParams.get('text') || '';
  assert.ok(
    textParam.startsWith('Hi Outbound Holidays, I’d like help planning a Victoria Falls trip.'),
    `Expected exact greeting lead, got: ${textParam}`
  );
  assert.match(textParam, /\+263771234567/);
  assert.doesNotMatch(textParam, /nights|Adults|Stay Tier|Transfer/i);

  const emptyUrl = buildQuickHelpWhatsAppUrl({});
  const emptyText = new URL(emptyUrl).searchParams.get('text') || '';
  assert.equal(emptyText, 'Hi Outbound Holidays, I’d like help planning a Victoria Falls trip.');
});

test('cruise-only and transfer-only plans validate strictly without fake nights/stays even when stays catalog is empty', () => {
  const cruiseDraft = createEmptyTripPlanDraft();
  cruiseDraft.adults = 2;
  cruiseDraft.selectedActivities = [
    { id: 'act-cruise', preferredDay: 'to-be-scheduled', preferredTime: 'sunset' },
  ];

  const cruiseActivity: ActivityItem = {
    id: 'act-cruise',
    title: 'Upper Zambezi Sunset Cruise',
    duration: '2 Hours',
    priceUSD: 85,
    priceBasis: 'per_person',
    imageUrl: '/cruise.jpg',
    badge: 'Cruise',
    shortDesc: 'Sunset cruise',
    whyRecommend: 'Classic cruise',
    idealFor: ['first-time'],
    defaultTimeSlot: 'sunset',
  };

  const cruiseCtx = resolveTripPlanContext({
    draft: cruiseDraft,
    accommodations: [],
    stayTiers: [],
    allActivities: [cruiseActivity],
    transferOptions: [],
  });
  assert.equal(cruiseCtx.itemized.mode, 'complete');
  assert.equal(cruiseCtx.itemized.headlineLabel, 'Trip estimate');
  assert.equal(cruiseCtx.itemized.subtotalUSD, 170);

  const cruisePayload = buildPlannerSubmissionPayload({
    mode: 'guided',
    ctx: cruiseCtx,
    name: 'Nyasha Cruise',
    email: '',
    phone: '+263771112233',
    replyMethod: 'whatsapp',
    notes: 'Cruise only',
    marketingConsent: false,
  });
  const parsedCruise = EnquirySchema.parse(cruisePayload);
  assert.equal(parsedCruise.trip.stayArrangement, 'none');
  assert.equal(parsedCruise.trip.nights, undefined);
  assert.equal(parsedCruise.trip.stayTierId, undefined);
  assert.equal(parsedCruise.trip.preferredReplyMethod, 'whatsapp');

  const trDraft = createEmptyTripPlanDraft();
  trDraft.transferArrangement = 'selected';
  trDraft.transferId = 'tr-vfa-return';
  const trCtx = resolveTripPlanContext({
    draft: trDraft,
    accommodations: [],
    stayTiers: [],
    allActivities: [],
    transferOptions: [
      {
        id: 'tr-vfa-return',
        title: 'VFA Return Private Transfer',
        badge: 'Transfer',
        desc: 'Private return airport transfer',
        route: 'VFA Airport <-> Victoria Falls Town',
        priceUSD: 60,
        priceBasis: 'per_vehicle_return',
      },
    ],
  });
  assert.equal(trCtx.itemized.subtotalUSD, 60);
  const trPayload = buildPlannerSubmissionPayload({
    mode: 'guided',
    ctx: trCtx,
    name: 'Kuda Transfer',
    email: 'kuda@example.com',
    phone: '',
    replyMethod: 'email',
    notes: 'Airport transfer only',
    marketingConsent: false,
  });
  const parsedTransfer = EnquirySchema.parse(trPayload);
  assert.equal(parsedTransfer.trip.transferId, 'tr-vfa-return');
  assert.equal(parsedTransfer.trip.stayArrangement, 'none');
});

test('family itemized calculation honors child ages (10, 11, 12) and updates only changed lines', () => {
  installContent(snapshot);
  const prop = snapshot.accommodations.find((a: DetailedAccommodation) =>
    Array.isArray(a.roomTypes) && a.roomTypes.length > 0
  ) as DetailedAccommodation;
  assert.ok(prop);
  const room = prop.roomTypes![0];
  const activity: ActivityItem = {
    id: 'act-family-cruise',
    title: 'Sunset Cruise',
    duration: '2 Hours',
    priceUSD: 100,
    priceBasis: 'per_person',
    childRateUnder11USD: 50,
    childRate11PlusUSD: 100,
    imageUrl: '/cruise.jpg',
    badge: 'Cruise',
    shortDesc: 'Cruise',
    whyRecommend: 'Cruise',
    idealFor: ['family'],
  };

  const estBase = calculateItemizedTripEstimate({
    nights: 2,
    arrivalDate: '2026-08-10',
    departureDate: '2026-08-12',
    adults: 2,
    childAgesYears: [10, 11, 12],
    visitorCategory: 'international',
    stayArrangement: 'selected',
    property: prop,
    roomId: room.id || room.name,
    roomsCount: 2,
    activities: [
      {
        id: activity.id,
        title: activity.title,
        priceUSD: activity.priceUSD,
        priceBasis: activity.priceBasis,
        childRateUnder11USD: activity.childRateUnder11USD,
        childRate11PlusUSD: activity.childRate11PlusUSD,
      },
    ],
    transferArrangement: 'selected',
    transferOption: {
      id: 'tr-1',
      title: 'Airport Transfer',
      badge: 'Transfer',
      desc: 'Private airport transfer',
      priceUSD: 60,
      priceBasis: 'per_vehicle_return',
    },
  });

  // 2 adults (200) + age 10 (<11 => 50) + age 11 (100) + age 12 (100) = 450
  const actLineBase = estBase.lines.find((l) => l.section === 'Activities');
  const trLineBase = estBase.lines.find((l) => l.section === 'Transfers');
  assert.equal(actLineBase?.amountUSD, 450);
  assert.equal(trLineBase?.amountUSD, 60);

  // Change dates from 2 nights to 3 nights -> transfer stays 60, activity stays 450
  const est3Nights = calculateItemizedTripEstimate({
    nights: 3,
    arrivalDate: '2026-08-10',
    departureDate: '2026-08-13',
    adults: 2,
    childAgesYears: [10, 11, 12],
    visitorCategory: 'international',
    stayArrangement: 'selected',
    property: prop,
    roomId: room.id || room.name,
    roomsCount: 2,
    activities: [
      {
        id: activity.id,
        title: activity.title,
        priceUSD: activity.priceUSD,
        priceBasis: activity.priceBasis,
        childRateUnder11USD: activity.childRateUnder11USD,
        childRate11PlusUSD: activity.childRate11PlusUSD,
      },
    ],
    transferArrangement: 'selected',
    transferOption: {
      id: 'tr-1',
      title: 'Airport Transfer',
      badge: 'Transfer',
      desc: 'Private airport transfer',
      priceUSD: 60,
      priceBasis: 'per_vehicle_return',
    },
  });
  assert.equal(est3Nights.lines.find((l) => l.section === 'Activities')?.amountUSD, 450);
  assert.equal(est3Nights.lines.find((l) => l.section === 'Transfers')?.amountUSD, 60);
});

test('missing child fare renders Subtotal for priced items, preserves adult subtotal, and excludes child fare cleanly across outputs', () => {
  const draft = createEmptyTripPlanDraft();
  draft.adults = 2;
  draft.childAgesYears = [8];
  draft.selectedActivities = [
    { id: 'act-chobe', preferredDay: 'day-2', preferredTime: 'morning' },
  ];

  const partialActivity: ActivityItem = {
    id: 'act-chobe',
    title: 'Chobe Full-Day Safari',
    duration: 'Full Day',
    priceUSD: 180,
    priceBasis: 'per_adult', // under-11 child rate deliberately omitted -> Child price on request
    imageUrl: '/chobe.jpg',
    badge: 'Safari',
    shortDesc: 'Chobe safari',
    whyRecommend: 'Chobe',
    idealFor: ['family'],
  };

  const ctx = resolveTripPlanContext({
    draft,
    accommodations: [],
    stayTiers: [],
    allActivities: [partialActivity],
    transferOptions: [],
  });

  assert.equal(ctx.itemized.mode, 'partial');
  assert.equal(ctx.itemized.headlineLabel, 'Subtotal for priced items');
  assert.equal(ctx.itemized.subtotalUSD, 360);
  assert.ok(ctx.itemized.excludedItems.some((item) => /child fare|child price on request/i.test(item)));
  assert.match(ctx.itemized.lines[0].basis, /Child price on request/);

  const waUrl = buildPlannerPlanWhatsAppUrl({ ctx, name: 'Tafadzwa', replyMethod: 'whatsapp' });
  const waText = new URL(waUrl).searchParams.get('text') || '';
  assert.match(waText, /Subtotal for priced items:\*?\s*US\$360/);
  assert.match(waText, /Child price on request/);

  const payload = buildPlannerSubmissionPayload({
    mode: 'guided',
    ctx,
    name: 'Tafadzwa',
    email: '',
    phone: '+263775556677',
    replyMethod: 'whatsapp',
    notes: '',
    marketingConsent: false,
  });
  const parsed = EnquirySchema.parse(payload);
  assert.equal(parsed.trip.itemizedEstimate?.status, 'partial');
  assert.equal(parsed.trip.itemizedEstimate?.subtotalUSD, 360);
});

test('4-night plan with arrival/departure dates creates 5 calendar days and places scheduled or unscheduled activities cleanly', () => {
  const days = buildDynamicHolidayItinerary({
    nights: 4,
    stayLabel: 'Ilala Lodge Hotel',
    stayArrangement: 'selected',
    transferArrangement: 'none',
    transportType: 'none',
    arrivalDate: '2026-09-10',
    departureDate: '2026-09-14',
    activities: [
      {
        id: 'a1',
        title: 'Sunset Cruise',
        duration: '2 Hours',
        preferredDay: 'day-2',
        preferredTime: 'sunset',
      },
      {
        id: 'a2',
        title: 'Falls Guided Walk',
        duration: '2 Hours',
        preferredDay: 'to-be-scheduled',
        preferredTime: 'to-be-arranged',
      },
    ],
  });

  assert.equal(days.length, 6, '5 calendar days (4 nights) + To be scheduled bucket');
  assert.match(days[0].day, /^Day 1/);
  assert.match(days[1].description, /Sunset Cruise .*sunset/i);
  assert.equal(days[4].title, 'Check-Out & Onward Departure');
  assert.equal(days[5].day, 'To be scheduled');
  assert.match(days[5].description, /Falls Guided Walk .*Time to be arranged/);
});

test('non-PII localStorage draft persistence saves trip selections and excludes contact fields', () => {
  const store = new Map<string, string>();
  const origWindow = (globalThis as { window?: unknown }).window;
  (globalThis as { window: unknown }).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    },
  };

  try {
    const empty = createEmptyTripPlanDraft();
    assert.equal(hasMeaningfulDraftContent(empty), false);
    saveTripPlanDraft(empty);
    assert.equal(store.has(TRIP_PLAN_STORAGE_KEY), false);

    const draft = createEmptyTripPlanDraft();
    draft.timingMode = 'flexible';
    draft.adults = 2;
    draft.childAgesYears = [10];
    draft.selectedActivities = [{ id: 'act-1', preferredDay: 'day-1', preferredTime: 'morning' }];
    saveTripPlanDraft(draft);

    const rawSaved = store.get(TRIP_PLAN_STORAGE_KEY) || '';
    assert.doesNotMatch(rawSaved, /email|phone|name/i);

    const loaded = loadTripPlanDraft();
    assert.ok(loaded);
    assert.equal(loaded.adults, 2);
    assert.deepEqual(loaded.childAgesYears, [10]);
    assert.equal(loaded.selectedActivities[0].id, 'act-1');
  } finally {
    (globalThis as { window?: unknown }).window = origWindow;
  }
});

test('Booking-style calendar summary, single departure time prefill, shifted date flagging, and transfer flight/pickup separation', () => {
  installContent(snapshot);

  assert.equal(
    formatCompactCalendarRangeSummary('2026-12-18', '2026-12-22'),
    '18–22 December · 4 nights'
  );
  assert.equal(
    formatCompactCalendarRangeSummary('2026-12-18', '', true),
    '18 December 2026'
  );

  // Published departure times & flexible slot labels
  assert.equal(getDefaultTimeForActivity({ departureTimes: ['4:00 pm'] }), '4:00 pm');
  assert.equal(
    getDefaultTimeForActivity({ departureTimes: ['4:00 pm', '4:30 pm'] }),
    'to-be-arranged'
  );
  assert.equal(
    getDefaultTimeForActivity({ defaultTimeSlot: 'sunset' }),
    'sunset'
  );
  assert.equal(formatTimeSlotDisplayLabel('any-time'), 'Any time');
  assert.equal(formatTimeSlotDisplayLabel('to-be-arranged'), 'Time to be arranged');

  // Shifting dates 18-22 Dec -> 19-23 Dec preserves room + activities & flags 18 Dec activity cleanly
  const daysInitial = getTripCalendarDays('2026-12-18', '2026-12-22');
  assert.equal(daysInitial.length, 5);
  assert.equal(daysInitial[0].dateIso, '2026-12-18');
  assert.equal(daysInitial[1].dateIso, '2026-12-19');

  const actOn18th = { id: 'act-sunset-cruise', preferredDay: 'day-1', preferredTime: '4:00 pm', activityDate: '2026-12-18' };
  const actOn19th = { id: 'act-guided-falls', preferredDay: 'day-2', preferredTime: 'morning', activityDate: '2026-12-19' };

  assert.equal(isActivityDateOutsideTrip(actOn18th, '2026-12-19', '2026-12-23'), true);
  assert.equal(isActivityDateOutsideTrip(actOn19th, '2026-12-19', '2026-12-23'), false);

  const shiftedItinerary = buildDynamicHolidayItinerary({
    nights: 4,
    arrivalDate: '2026-12-19',
    departureDate: '2026-12-23',
    stayLabel: 'Ilala Lodge Hotel',
    stayArrangement: 'selected',
    transferArrangement: 'recommend',
    transportType: 'private-transfers',
    activities: [
      { ...actOn18th, title: 'Sunset Cruise', duration: '2 hrs' },
      { ...actOn19th, title: 'Guided Tour of the Falls', duration: '2 hrs' },
    ],
  });
  const unscheduledBucket = shiftedItinerary.find((d) => /Choose a new day/i.test(d.description));
  assert.ok(unscheduledBucket, 'Shifted trip dates preserve out-of-range activity with Choose a new day warning');
  assert.match(unscheduledBucket.description, /Sunset Cruise/);
  assert.match(shiftedItinerary[0].description, /Guided Tour of the Falls/);

  // Transfer date, flight time / unknown, and separate pickup time serialize & validate
  const trDraft = createEmptyTripPlanDraft();
  trDraft.timingMode = 'exact-dates';
  trDraft.arrivalDate = '2026-12-19';
  trDraft.departureDate = '2026-12-23';
  trDraft.nights = 4;
  trDraft.adults = 2;
  trDraft.stayArrangement = 'selected';
  trDraft.stayTierId = 'comfort-lodge';
  trDraft.requestedRooms = 1;
  trDraft.selectedActivities = [actOn19th];
  trDraft.transferArrangement = 'recommend';
  trDraft.transferDate = '2026-12-19';
  trDraft.flightTime = '13:45';
  trDraft.flightTimeUnknown = false;
  trDraft.pickupTime = '14:30';

  const trCtx = resolveTripPlanContext({
    draft: trDraft,
    accommodations: snapshot.accommodations,
    stayTiers: [{ id: 'comfort-lodge', name: 'Comfort Lodge', pricePerNightUSD: 250 }],
    allActivities: [
      {
        id: 'act-guided-falls',
        title: 'Guided Tour of the Falls',
        duration: '2 hrs',
        priceUSD: 70,
        priceBasis: 'per_adult',
        rateStatus: 'confirmed',
        imageUrl: '/falls.jpg',
        badge: 'Must Do',
        shortDesc: 'Rainforest tour',
        whyRecommend: 'Classic',
        idealFor: ['first-visit'],
      },
    ],
    transferOptions: [],
  });
  assert.equal(trCtx.itemized.subtotalUSD, 1140);

  const payload = buildPlannerSubmissionPayload({
    mode: 'guided',
    ctx: trCtx,
    name: 'Test Traveller',
    email: 'test@example.com',
    phone: '',
    replyMethod: 'email',
    notes: '',
    marketingConsent: false,
  });
  const parsed = EnquirySchema.safeParse({
    ...payload,
    startedAt: Date.now() - 5000,
    website: '',
  });
  assert.equal(parsed.success, true, 'Transfer timing fields validate against EnquirySchema');
  assert.equal(payload.trip?.transferDate, '2026-12-19');
  assert.equal(payload.trip?.flightTime, '13:45');
  assert.equal(payload.trip?.pickupTime, '14:30');
});

test('EnquirySchema strictly enforces matching reply-method contact field, and pricing distinguishes missing guests vs partial child fares vs full plans', () => {
  installContent(snapshot);

  // 1. Server-side schema rejects mismatched reply-method / contact field
  const baseTrip = {
    entryMode: 'quick' as const,
    preferredReplyMethod: 'whatsapp' as const,
    preferredContact: 'whatsapp' as const,
  };
  const missingPhoneForWa = EnquirySchema.safeParse({
    name: 'Kudzai Moyo',
    email: 'kudzai@example.com',
    phone: '',
    source: 'holiday-builder',
    startedAt: Date.now() - 5000,
    website: '',
    trip: baseTrip,
  });
  assert.equal(missingPhoneForWa.success, false, 'WhatsApp reply requires WhatsApp phone even if email is provided');

  const validWaOnly = EnquirySchema.safeParse({
    name: 'Kudzai Moyo',
    email: '',
    phone: '+263771234567',
    source: 'holiday-builder',
    startedAt: Date.now() - 5000,
    website: '',
    trip: baseTrip,
  });
  assert.equal(validWaOnly.success, true, 'WhatsApp reply passes with phone and blank email');

  const missingEmailForEmail = EnquirySchema.safeParse({
    name: 'Kudzai Moyo',
    email: '',
    phone: '+263771234567',
    source: 'holiday-builder',
    startedAt: Date.now() - 5000,
    website: '',
    trip: {
      entryMode: 'quick',
      preferredReplyMethod: 'email',
      preferredContact: 'email',
    },
  });
  assert.equal(missingEmailForEmail.success, false, 'Email reply requires valid email even if phone is provided');

  // 2. Cruise-only with missing guest count -> "Add guests to see your total" (not "Price on request")
  const cruiseOnlyAct: ActivityItem = {
    id: 'act-sunset-cruise',
    title: 'Upper Zambezi Sunset Cruise',
    duration: '2 Hours',
    priceUSD: 85,
    priceBasis: 'per_adult',
    rateStatus: 'confirmed',
    imageUrl: '/cruise.jpg',
    badge: 'Popular',
    shortDesc: 'Sunset cruise',
    whyRecommend: 'Classic',
    idealFor: ['couple'],
  };
  const noGuestsDraft = createEmptyTripPlanDraft();
  noGuestsDraft.selectedActivities = [
    { id: 'act-sunset-cruise', preferredDay: 'to-be-scheduled', preferredTime: '4:00 pm' },
  ];
  const noGuestsCtx = resolveTripPlanContext({
    draft: noGuestsDraft,
    accommodations: [],
    stayTiers: [],
    allActivities: [cruiseOnlyAct],
    transferOptions: [],
  });
  assert.equal(noGuestsCtx.itemized.headlineLabel, 'Add guests to see your total');
  assert.equal(noGuestsCtx.itemized.needsGuestCount, true);
  assert.equal(noGuestsCtx.itemized.excludedItems.length, 0, 'Single item needing guest count does not duplicate in excludedItems');
  assert.match(noGuestsCtx.itemized.lines[0].basis, /Add guests to see your total/);

  // Adding an unpriced transfer alongside a priced cruise shows partial subtotal and excludes only unpriced transfer
  const partialDraft = createEmptyTripPlanDraft();
  partialDraft.adults = 2;
  partialDraft.selectedActivities = [
    { id: 'act-sunset-cruise', preferredDay: 'to-be-scheduled', preferredTime: '4:00 pm' },
  ];
  partialDraft.transferArrangement = 'recommend';
  const partialCtx = resolveTripPlanContext({
    draft: partialDraft,
    accommodations: [],
    stayTiers: [],
    allActivities: [cruiseOnlyAct],
    transferOptions: [],
  });
  assert.equal(partialCtx.itemized.mode, 'partial');
  assert.equal(partialCtx.itemized.subtotalUSD, 170);
  assert.ok(partialCtx.itemized.excludedItems.some((item) => /Transfers & route options/i.test(item)));

  // WhatsApp draft opened before entering contact details includes trip details & Dates not chosen
  const waUrlNoContact = buildPlannerPlanWhatsAppUrl({ ctx: noGuestsCtx });
  const waTextNoContact = new URL(waUrlNoContact).searchParams.get('text') || '';
  assert.match(waTextNoContact, /Dates: Dates not chosen/);
  assert.match(waTextNoContact, /Upper Zambezi Sunset Cruise/);
  assert.doesNotMatch(waTextNoContact, /Preferred reply method:/);

  // Applicable activity time options: Sunset cruise excludes unrelated Morning/Afternoon; single CMS time shows Suggested time
  const sunsetTimeOpts = getApplicableActivityTimeOptions(cruiseOnlyAct);
  assert.equal(sunsetTimeOpts.options.some((o) => o.id === 'morning' || o.id === 'afternoon'), false);
  assert.equal(sunsetTimeOpts.options.some((o) => o.id === 'sunset' && /Suggested/i.test(o.label)), true);
  assert.equal(sunsetTimeOpts.options.some((o) => o.id === 'to-be-arranged' && o.label === 'Time to be arranged'), true);

  const singleCmsTimeOpts = getApplicableActivityTimeOptions({
    ...cruiseOnlyAct,
    departureTimes: ['4:00 pm'],
  });
  assert.deepEqual(
    singleCmsTimeOpts.options.map((o) => o.label),
    ['4:00 pm · Suggested time', 'Time to be arranged']
  );

  // Shifted out-of-range activity emits "Date to be arranged" in WhatsApp draft & website submission payload (not stale Nov date)
  const shiftedPlanDraft = createEmptyTripPlanDraft();
  shiftedPlanDraft.timingMode = 'exact-dates';
  shiftedPlanDraft.arrivalDate = '2026-12-19';
  shiftedPlanDraft.departureDate = '2026-12-23';
  shiftedPlanDraft.nights = 4;
  shiftedPlanDraft.adults = 2;
  shiftedPlanDraft.selectedActivities = [
    {
      id: 'act-sunset-cruise',
      preferredDay: 'day-1',
      preferredTime: 'sunset',
      activityDate: '2026-11-27',
    },
  ];
  const shiftedPlanCtx = resolveTripPlanContext({
    draft: shiftedPlanDraft,
    accommodations: [],
    stayTiers: [],
    allActivities: [cruiseOnlyAct],
    transferOptions: [],
  });
  const shiftedWaText = new URL(buildPlannerPlanWhatsAppUrl({ ctx: shiftedPlanCtx })).searchParams.get('text') || '';
  assert.match(shiftedWaText, /Date to be arranged/);
  assert.doesNotMatch(shiftedWaText, /2026-11-27|27 Nov/);

  const shiftedPayload = buildPlannerSubmissionPayload({
    mode: 'guided',
    ctx: shiftedPlanCtx,
    name: 'Test Traveller',
    email: 'test@example.com',
    phone: '',
    replyMethod: 'email',
    notes: '',
    marketingConsent: false,
  });
  assert.equal(shiftedPayload.trip?.selectedActivities?.[0]?.preferredDay, 'Date to be arranged');
  assert.equal(shiftedPayload.trip?.selectedActivities?.[0]?.activityDate, undefined);
});
