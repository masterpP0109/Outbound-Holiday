import type { ActivityItem, DetailedAccommodation, Experience } from '../types/content';
import type { ContentSnapshot } from '../../shared/content-schema';
import { getPropertyDisplayPriceUSD, isPublishedAccommodation } from './accommodation';
import type { ChildGuest, GuestSelection } from './enquiry';
import { calculateRoomStayQuote, getRoomPriceUnitLabel, getRoomStartingPriceUSD } from './roomPricing';

export type BuilderTransferOption = NonNullable<
  NonNullable<ContentSnapshot['site']['builderConfig']>['transferOptions']
>[number];

export const LEGACY_ACTIVITY_EXPERIENCE_MAP: Record<string, string> = {
  'act-guided-falls': 'guided-tour-falls',
  'act-sunset-cruise': 'upper-zambezi-sunset-cruise',
  'act-boma-dinner': 'boma-dinner-show',
  'act-helicopter': 'flight-of-angels',
  'act-chobe-safari': 'chobe-day-safari',
  'act-gorge-swing': 'gorge-swing',
};

function normalizeTitleKey(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Sync Holiday Builder activities with live CMS Experiences so prices, durations,
 * descriptions, images, and newly added CMS experiences match 1:1 across the site.
 */
export function mergeLiveBuilderActivities(
  builderActivities: ActivityItem[] = [],
  experiences: Experience[] = [],
  excludedExperienceIds: string[] = []
): ActivityItem[] {
  const byIdOrSlug = new Map<string, Experience>();
  const byTitle = new Map<string, Experience>();
  const excludedSet = new Set(excludedExperienceIds.map((id) => String(id).trim()).filter(Boolean));

  for (const exp of experiences) {
    if (!exp || !exp.id) continue;
    byIdOrSlug.set(exp.id, exp);
    if (exp.slug) byIdOrSlug.set(exp.slug, exp);
    byTitle.set(normalizeTitleKey(exp.title), exp);
  }

  const matchedExpIds = new Set<string>();
  const merged: Array<ActivityItem & { _order: number }> = [];

  builderActivities.forEach((act, idx) => {
    if (!act || !act.id) return;
    const candidateKey = act.experienceId || LEGACY_ACTIVITY_EXPERIENCE_MAP[act.id] || act.id;
    const matchedExp =
      byIdOrSlug.get(candidateKey) ||
      byIdOrSlug.get(act.id) ||
      byTitle.get(normalizeTitleKey(act.title));

    if (matchedExp) {
      matchedExpIds.add(matchedExp.id);
      if (matchedExp.slug) matchedExpIds.add(matchedExp.slug);
    }

    if (act.includeInBuilder === false || excludedSet.has(act.id) || (matchedExp && (excludedSet.has(matchedExp.id) || (matchedExp.slug && excludedSet.has(matchedExp.slug))))) {
      return;
    }

    const order = typeof act.displayOrder === 'number' && Number.isFinite(act.displayOrder)
      ? act.displayOrder
      : idx + 1;

    if (matchedExp) {
      const hasExplicitOverride = Boolean(act.priceOverrideEnabled) && typeof act.priceUSD === 'number' && Number.isFinite(act.priceUSD) && act.priceUSD >= 0;
      const catalogPrice =
        typeof matchedExp.priceAmount === 'number' && Number.isFinite(matchedExp.priceAmount) && matchedExp.priceAmount > 0
          ? matchedExp.priceAmount
          : act.priceUSD;

      const validFrom = act.validFrom || matchedExp.validFrom;
      const validTo = act.validTo || matchedExp.validTo;
      const defaultTimeSlot = act.defaultTimeSlot || matchedExp.defaultTimeSlot;
      const departureTimes =
        Array.isArray(act.departureTimes) && act.departureTimes.length > 0
          ? act.departureTimes
          : matchedExp.departureTimes;
      merged.push({
        id: act.id,
        experienceId: matchedExp.id,
        title: matchedExp.title || act.title,
        duration: matchedExp.duration || act.duration,
        priceUSD: hasExplicitOverride ? act.priceUSD : catalogPrice,
        priceOverrideEnabled: hasExplicitOverride,
        priceSource: hasExplicitOverride ? 'builder-override' : 'experience-catalog',
        priceBasis: act.priceBasis || matchedExp.priceBasis || 'per_adult',
        childRateUnder11USD:
          typeof act.childRateUnder11USD === 'number'
            ? act.childRateUnder11USD
            : matchedExp.childRateUnder11USD ?? null,
        childRate11PlusUSD:
          typeof act.childRate11PlusUSD === 'number'
            ? act.childRate11PlusUSD
            : matchedExp.childRate11PlusUSD ?? null,
        rateStatus: act.rateStatus || matchedExp.rateStatus || 'provisional',
        ...(validFrom ? { validFrom } : {}),
        ...(validTo ? { validTo } : {}),
        ...(defaultTimeSlot ? { defaultTimeSlot } : {}),
        ...(departureTimes && departureTimes.length > 0 ? { departureTimes } : {}),
        ...(matchedExp.categories ? { categories: matchedExp.categories } : {}),
        includeInBuilder: true,
        suggestedByDefault: typeof act.suggestedByDefault === 'boolean'
          ? act.suggestedByDefault
          : ['act-guided-falls', 'act-sunset-cruise'].includes(act.id),
        displayOrder: order,
        imageUrl: matchedExp.featuredImage || act.imageUrl,
        badge: matchedExp.badge || act.badge || 'Popular',
        shortDesc: matchedExp.shortDescription || act.shortDesc,
        whyRecommend: matchedExp.whyWeRecommend || act.whyRecommend,
        idealFor: Array.isArray(act.idealFor) && act.idealFor.length > 0 ? act.idealFor : ['first-time'],
        _order: order,
      });
    } else {
      merged.push({
        ...act,
        includeInBuilder: true,
        suggestedByDefault: Boolean(act.suggestedByDefault),
        displayOrder: order,
        priceOverrideEnabled: Boolean(act.priceOverrideEnabled),
        priceSource: act.priceSource || 'custom',
        priceBasis: act.priceBasis || 'per_adult',
        rateStatus: act.rateStatus || 'provisional',
        _order: order,
      });
    }
  });

  // Only append unconfigured experiences when Builder Settings has NOT explicitly saved a curated builder list
  if (builderActivities.length === 0 || !builderActivities.some((a) => typeof a.includeInBuilder === 'boolean')) {
    experiences.forEach((exp, idx) => {
      if (!exp || !exp.id || matchedExpIds.has(exp.id) || excludedSet.has(exp.id) || (exp.slug && excludedSet.has(exp.slug))) {
        return;
      }
      if (exp.includeInBuilder === false) {
        return;
      }
      const hasValidPrice =
        typeof exp.priceAmount === 'number' &&
        Number.isFinite(exp.priceAmount) &&
        (exp.priceAmount > 0 || exp.priceBasis === 'on_request' || (exp.priceAmount === 0 && exp.rateStatus === 'confirmed'));
      if (!hasValidPrice) {
        return;
      }
      const cats = Array.isArray(exp.categories) && exp.categories.length > 0
        ? exp.categories.map((c) => String(c))
        : ['first-time'];

      const order = typeof exp.builderOrder === 'number' && Number.isFinite(exp.builderOrder)
        ? exp.builderOrder
        : merged.length + idx + 1;
      merged.push({
        id: exp.id,
        experienceId: exp.id,
        title: exp.title,
        duration: exp.duration || 'Half Day',
        priceUSD: exp.priceAmount,
        priceOverrideEnabled: false,
        priceSource: 'experience-catalog',
        priceBasis: exp.priceBasis || 'per_adult',
        childRateUnder11USD: exp.childRateUnder11USD ?? null,
        childRate11PlusUSD: exp.childRate11PlusUSD ?? null,
        rateStatus: exp.rateStatus || 'provisional',
        ...(exp.validFrom ? { validFrom: exp.validFrom } : {}),
        ...(exp.validTo ? { validTo: exp.validTo } : {}),
        ...(exp.defaultTimeSlot ? { defaultTimeSlot: exp.defaultTimeSlot } : {}),
        ...(exp.departureTimes && exp.departureTimes.length > 0 ? { departureTimes: exp.departureTimes } : {}),
        ...(exp.categories ? { categories: exp.categories } : {}),
        includeInBuilder: true,
        suggestedByDefault: Boolean(exp.recommendedInBuilder),
        displayOrder: order,
        imageUrl: exp.featuredImage,
        badge: exp.badge || 'Experience',
        shortDesc: exp.shortDescription,
        whyRecommend: exp.whyWeRecommend || exp.shortDescription,
        idealFor: cats,
        _order: order,
      });
    });
  }

  merged.sort((a, b) => a._order - b._order);
  return merged.map(({ _order: _, ...item }) => item);
}

export interface BuilderAccommodationOption {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  pricePerNightUSD: number;
  priceUnit: string;
  heroImage: string;
  property: DetailedAccommodation;
}

/**
 * Resolve all published Where to Stay accommodations with live CMS/room-derived nightly rates.
 */
export function resolveBuilderAccommodations(
  accommodations: DetailedAccommodation[] = []
): BuilderAccommodationOption[] {
  const result: BuilderAccommodationOption[] = [];
  for (const acc of accommodations) {
    if (!acc || !isPublishedAccommodation(acc)) continue;
    const rate = getPropertyDisplayPriceUSD(acc);
    if (rate === null || !Number.isFinite(rate) || rate <= 0) continue;
    result.push({
      id: acc.id,
      slug: acc.slug,
      name: acc.name,
      category: acc.category,
      location: acc.location,
      pricePerNightUSD: rate,
      priceUnit: acc.priceUnit?.trim() || 'per night',
      heroImage: acc.heroImage,
      property: acc,
    });
  }
  return result;
}

export function resolveMatchingActivityId(
  activities: ActivityItem[],
  candidate?: string | null
): string | null {
  if (!candidate) return null;
  const clean = candidate.trim().toLowerCase();
  if (!clean) return null;

  const exact = activities.find((a) => a.id.toLowerCase() === clean);
  if (exact) return exact.id;

  const reverseMapped = Object.entries(LEGACY_ACTIVITY_EXPERIENCE_MAP).find(
    ([, expId]) => expId.toLowerCase() === clean
  )?.[0];
  if (reverseMapped && activities.some((a) => a.id === reverseMapped)) {
    return reverseMapped;
  }

  const byTitle = activities.find(
    (a) =>
      normalizeTitleKey(a.title) === normalizeTitleKey(candidate) ||
      a.title.toLowerCase().includes(clean)
  );
  return byTitle ? byTitle.id : null;
}

export interface HolidayEstimateInput {
  nights: number;
  adults: number;
  children: number;
  childAges?: string[];
  stayNightRateUSD: number;
  activityRatesUSD: number[];
  transportType: string;
  roomsCount?: number;
  pricingBasis?: 'per_room' | 'per_person';
}

export interface HolidayEstimateResult {
  rooms: number;
  stayNightRateUSD: number;
  stayCost: number;
  activitiesCost: number;
  transportCost: number;
  transportQuotedSeparately: boolean;
  hasOlderChildren: boolean;
  minimumUSD: number;
  maximumUSD: number;
}

export function getTransportCostUSD(transportType: string): number {
  if (transportType === 'private-transfers') return 120;
  if (transportType === 'shared-shuttle') return 60;
  return 0;
}

/**
 * Resolve each child's activity pricing multiplier from optional child age labels
 * (`under-11` -> 0.8 indicative factor; `11-plus` / age >= 11 -> 1.0 adult factor).
 */
function resolveChildFactor(children: number, childAges?: string[]): { factorSum: number; hasOlderChildren: boolean } {
  if (children <= 0) {
    return { factorSum: 0, hasOlderChildren: false };
  }
  if (!Array.isArray(childAges) || childAges.length === 0) {
    return { factorSum: children * 0.8, hasOlderChildren: false };
  }
  let factorSum = 0;
  let hasOlderChildren = false;
  for (let i = 0; i < children; i += 1) {
    const raw = String(childAges[i] ?? '').trim().toLowerCase();
    const numericMatch = raw.match(/\d+/);
    const parsedAge = numericMatch ? Number(numericMatch[0]) : NaN;
    if (raw.includes('11+') || raw.includes('11-plus') || raw.includes('older') || (Number.isFinite(parsedAge) && parsedAge >= 11 && !raw.includes('under'))) {
      factorSum += 1.0;
      hasOlderChildren = true;
    } else {
      factorSum += 0.8;
    }
  }
  return { factorSum, hasOlderChildren };
}

/**
 * Authoritative client-side calculator mirroring WordPress PHP (`outbound_calculate_holiday_estimate`)
 * and Express/Prisma (`selectTrip`).
 */
export function calculateHolidayEstimate(input: HolidayEstimateInput): HolidayEstimateResult {
  const nights = Math.max(1, Math.round(input.nights || 1));
  const adults = Math.max(1, Math.round(input.adults || 1));
  const children = Math.max(0, Math.round(input.children || 0));
  const stayNightRateUSD = Math.max(0, Number(input.stayNightRateUSD) || 0);
  const rooms =
    typeof input.roomsCount === 'number' && input.roomsCount >= 1
      ? Math.round(input.roomsCount)
      : Math.max(1, Math.ceil((adults + children) / 2));

  const activitySum = (input.activityRatesUSD || []).reduce(
    (sum, rate) => sum + Math.max(0, Number(rate) || 0),
    0
  );

  const { factorSum: childFactorSum, hasOlderChildren } = resolveChildFactor(children, input.childAges);
  const stayCost =
    input.pricingBasis === 'per_person'
      ? Math.round(stayNightRateUSD * nights * (adults + childFactorSum))
      : Math.round(stayNightRateUSD * nights * rooms);
  const activitiesCost = Math.round(activitySum * (adults + childFactorSum));
  const transportCost = getTransportCostUSD(input.transportType);
  const transportQuotedSeparately = input.transportType === 'undecided';
  const minimumUSD = Math.round(stayCost + activitiesCost + transportCost);
  const maximumUSD = Math.round(minimumUSD * 1.18);

  return {
    rooms,
    stayNightRateUSD,
    stayCost,
    activitiesCost,
    transportCost,
    transportQuotedSeparately,
    hasOlderChildren,
    minimumUSD,
    maximumUSD,
  };
}

export interface DynamicItineraryDay {
  day: string;
  title: string;
  description: string;
}

export interface DynamicItineraryInput {
  nights?: number | null;
  stayLabel?: string;
  stayArrangement?: 'selected' | 'already-arranged' | 'recommend' | 'none';
  transportType?: string;
  transferLabel?: string;
  transferArrangement?: 'selected' | 'already-arranged' | 'recommend' | 'none';
  activities: Array<{
    id: string;
    title: string;
    duration?: string;
    preferredDay?: string;
    activityDate?: string;
    preferredTime?: string;
    defaultTimeSlot?: string;
  }>;
  arrivalDate?: string;
  departureDate?: string;
  adults?: number;
  children?: number;
  requestedRooms?: number | null;
  familyRoomRequested?: boolean;
}

function formatIsoDisplayDate(iso: string, offsetDays: number): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function formatTimeSlotDisplayLabel(slot?: string): string {
  const clean = String(slot || '').trim();
  if (!clean || clean === 'to-be-arranged' || clean === 'flexible') {
    return 'Time to be arranged';
  }
  const lower = clean.toLowerCase();
  if (lower === 'morning') return 'Morning';
  if (lower === 'midday') return 'Midday';
  if (lower === 'afternoon') return 'Afternoon';
  if (lower === 'sunset') return 'Sunset';
  if (lower === 'evening') return 'Evening';
  if (lower === 'any-time') return 'Any time';
  return clean;
}

function formatActivityTimeNote(act: {
  title?: string;
  duration?: string;
  preferredTime?: string;
  defaultTimeSlot?: string;
}): string {
  const chosenTime =
    act.preferredTime &&
    act.preferredTime !== 'flexible' &&
    act.preferredTime !== 'to-be-arranged'
      ? act.preferredTime.trim()
      : '';
  const defaultSlot = act.defaultTimeSlot?.trim() || '';
  const timeText = chosenTime
    ? formatTimeSlotDisplayLabel(chosenTime)
    : defaultSlot
    ? formatTimeSlotDisplayLabel(defaultSlot)
    : 'Time to be arranged';
  const titleText = act.title || 'Activity';
  return act.duration ? `${titleText} (${act.duration} · ${timeText})` : `${titleText} (${timeText})`;
}

/**
 * Resolve curated/published transfer options from CMS `builderConfig.transferOptions`.
 */
export function resolveBuilderTransfers(
  configured?: BuilderTransferOption[]
): BuilderTransferOption[] {
  const list = Array.isArray(configured) ? configured : [];
  return list
    .filter((t) => t && t.includeInBuilder !== false && t.title)
    .map((t, idx) => ({
      ...t,
      displayOrder: typeof t.displayOrder === 'number' ? t.displayOrder : idx + 1,
    }))
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
}

export interface ItemizedEstimateLine {
  section: 'Stay' | 'Activities' | 'Transfers';
  title: string;
  basis: string;
  amountUSD: number | null;
  status: 'estimated' | 'confirmed' | 'on_request' | 'arranged' | 'free';
}

export interface ItemizedTripEstimateResult {
  mode: 'complete' | 'partial' | 'quote-only';
  headlineLabel: 'Trip estimate' | 'Subtotal for priced items' | 'Get a quote' | 'Add guests to see your total';
  needsGuestCount?: boolean;
  subtotalUSD: number | null;
  hasProvisionalRates: boolean;
  lines: ItemizedEstimateLine[];
  excludedItems: string[];
}

export interface ItemizedTripEstimateInput {
  nights?: number | null;
  arrivalDate?: string;
  departureDate?: string;
  adults?: number | null;
  childAgesYears?: number[];
  visitorCategory?: 'international' | 'zimbabwe_resident' | 'sadc_resident';
  stayArrangement?: 'selected' | 'already-arranged' | 'recommend' | 'none';
  property?: DetailedAccommodation | null;
  roomId?: string;
  ratePlanId?: string;
  mealPlanId?: string;
  stayTier?: { id: string; name: string; pricePerNightUSD: number } | null;
  roomsCount?: number | null;
  activities?: Array<{
    id: string;
    title: string;
    priceUSD: number;
    priceBasis?: 'per_adult' | 'per_person' | 'per_child' | 'per_group' | 'per_vehicle' | 'on_request';
    childRateUnder11USD?: number | null;
    childRate11PlusUSD?: number | null;
    rateStatus?: 'provisional' | 'confirmed';
    priceOverrideEnabled?: boolean;
    validFrom?: string;
    validTo?: string;
  }>;
  transferArrangement?: 'selected' | 'already-arranged' | 'recommend' | 'none';
  transferOption?: BuilderTransferOption | null;
}

function isDateWithinRange(dateIso: string | undefined, validFrom?: string, validTo?: string): boolean {
  if (!dateIso || (!validFrom && !validTo)) return true;
  if (validFrom && dateIso < validFrom) return false;
  if (validTo && dateIso > validTo) return false;
  return true;
}

function buildGuestSelectionForPricing(adults: number, childAgesYears: number[]): GuestSelection {
  const safeAdults = Math.max(1, adults);
  const children: ChildGuest[] = childAgesYears.map((age, idx) => ({
    id: `child-${idx + 1}`,
    ageCategory: age < 11 ? 'under-11' : '11-plus',
  }));
  return { adults: safeAdults, children };
}

/**
 * Price each selected Stay, Activity, and Transfer item honestly from applicable WordPress CMS rates,
 * child ages (10 vs 11 vs 12), dates, occupancy, and rate bases — with no blanket +18% uplift or invented charges.
 */
export function calculateItemizedTripEstimate(input: ItemizedTripEstimateInput): ItemizedTripEstimateResult {
  const lines: ItemizedEstimateLine[] = [];
  const excludedItems: string[] = [];
  const guestNeededItems: string[] = [];
  let needsGuestCount = false;
  const adults = typeof input.adults === 'number' && input.adults >= 1 ? Math.round(input.adults) : 0;
  const childAgesYears = Array.isArray(input.childAgesYears) ? input.childAgesYears : [];
  const nights = typeof input.nights === 'number' && input.nights >= 1 ? Math.round(input.nights) : 0;
  const stayArr = input.stayArrangement || 'none';
  const transferArr = input.transferArrangement || 'none';
  const visitorCat = input.visitorCategory || 'international';

  // 1. Stay pricing
  if (stayArr === 'already-arranged') {
    lines.push({
      section: 'Stay',
      title: 'Accommodation already arranged',
      basis: 'Arranged independently (excluded from total)',
      amountUSD: null,
      status: 'arranged',
    });
  } else if (stayArr === 'recommend') {
    lines.push({
      section: 'Stay',
      title: 'Accommodation recommendations requested',
      basis: 'Price on request',
      amountUSD: null,
      status: 'on_request',
    });
    excludedItems.push('Accommodation (recommendations requested)');
  } else if (stayArr === 'selected') {
    if (input.property) {
      const prop = input.property;
      const room =
        input.roomId && prop.roomTypes?.find((r) => (r.id || r.name) === input.roomId);
      if (room && input.arrivalDate && input.departureDate && adults >= 1) {
        const guestSel = buildGuestSelectionForPricing(adults, childAgesYears);
        const quote = calculateRoomStayQuote({
          room,
          property: prop,
          checkIn: input.arrivalDate,
          checkOut: input.departureDate,
          guests: guestSel,
          roomsCount: input.roomsCount && input.roomsCount >= 1 ? input.roomsCount : 1,
          ...(input.mealPlanId ? { mealPlanId: input.mealPlanId } : {}),
          ...(input.visitorCategory ? { visitorMarket: input.visitorCategory } : {}),
          ...(input.ratePlanId ? { ratePlanId: input.ratePlanId } : {}),
        });
        const unitLabel = getRoomPriceUnitLabel(room);
        if (quote.mode === 'quoted' && quote.totalUSD !== null) {
          const lineStatus = quote.rateStatus === 'confirmed' ? 'confirmed' : 'estimated';
          lines.push({
            section: 'Stay',
            title: `${prop.name} — ${room.name}`,
            basis: `${quote.rateStatus === 'confirmed' ? 'Confirmed guide rate' : 'Estimated'} · US$${quote.nightlyAverageUSD} avg/night (${unitLabel}) × ${quote.nights} nights`,
            amountUSD: quote.totalUSD,
            status: lineStatus,
          });
        } else {
          lines.push({
            section: 'Stay',
            title: `${prop.name} — ${room.name}`,
            basis: quote.validityNotice || quote.minStayNotice || quote.disclaimer || 'Price on request',
            amountUSD: null,
            status: 'on_request',
          });
          excludedItems.push(`${prop.name} (${room.name}) — requires date/child confirmation`);
        }
      } else {
        const roomUnitRate = room ? getRoomStartingPriceUSD(room) : null;
        const displayRate = roomUnitRate ?? getPropertyDisplayPriceUSD(prop);
        const isPerPerson = /person|sharing/i.test((room ? getRoomPriceUnitLabel(room) : prop.priceUnit) || '');
        const basisUnit = isPerPerson ? 'per person sharing per night' : prop.priceUnit || 'per night';
        if (displayRate !== null && displayRate > 0 && nights >= 1 && adults >= 1) {
          if (isPerPerson) {
            const hasUnder11 = childAgesYears.some((a) => a < 11);
            const olderChildren = childAgesYears.filter((a) => a >= 11).length;
            const adultTotal = displayRate * nights * (adults + olderChildren);
            const note = hasUnder11
              ? `Estimated · US$${displayRate} ${basisUnit} × ${adults + olderChildren} guest(s) × ${nights} nights · Child under 11 price on request`
              : `Estimated · US$${displayRate} ${basisUnit} × ${adults + olderChildren} guest(s) × ${nights} nights`;
            lines.push({
              section: 'Stay',
              title: room ? `${prop.name} — ${room.name}` : prop.name,
              basis: note,
              amountUSD: Math.round(adultTotal),
              status: 'estimated',
            });
            if (hasUnder11) {
              excludedItems.push(`${prop.name} — Child (<11) sharing rate`);
            }
          } else if (typeof input.roomsCount === 'number' && input.roomsCount >= 1) {
            lines.push({
              section: 'Stay',
              title: room ? `${prop.name} — ${room.name}` : prop.name,
              basis: `Estimated · US$${displayRate} ${basisUnit} × ${input.roomsCount} room(s) × ${nights} nights`,
              amountUSD: Math.round(displayRate * nights * input.roomsCount),
              status: 'estimated',
            });
          } else {
            lines.push({
              section: 'Stay',
              title: room ? `${prop.name} — ${room.name}` : prop.name,
              basis: 'Select room count & dates to calculate',
              amountUSD: null,
              status: 'on_request',
            });
            excludedItems.push(`${prop.name} (select room count)`);
          }
        } else {
          const hasStayUnitRate = displayRate !== null && displayRate > 0;
          const missingGuests = hasStayUnitRate && adults < 1 && childAgesYears.length === 0;
          if (missingGuests) {
            needsGuestCount = true;
          }
          lines.push({
            section: 'Stay',
            title: room ? `${prop.name} — ${room.name}` : prop.name,
            basis: missingGuests
              ? `US$${displayRate} ${basisUnit} · Add guests to see your total`
              : hasStayUnitRate && nights < 1
              ? `US$${displayRate} ${basisUnit} · Add travel dates to calculate nights`
              : 'Price on request',
            amountUSD: null,
            status: 'on_request',
          });
          if (missingGuests) {
            guestNeededItems.push(`${prop.name} (needs guests)`);
          } else {
            excludedItems.push(
              hasStayUnitRate && nights < 1
                ? `${prop.name} (needs dates)`
                : `${prop.name}`
            );
          }
        }
      }
    } else if (input.stayTier) {
      if (nights >= 1 && typeof input.roomsCount === 'number' && input.roomsCount >= 1) {
        lines.push({
          section: 'Stay',
          title: input.stayTier.name,
          basis: `Estimated tier guide · US$${input.stayTier.pricePerNightUSD}/room/night × ${input.roomsCount} room(s) × ${nights} nights`,
          amountUSD: Math.round(input.stayTier.pricePerNightUSD * nights * input.roomsCount),
          status: 'estimated',
        });
      } else {
        lines.push({
          section: 'Stay',
          title: input.stayTier.name,
          basis: nights < 1 ? 'Add nights & rooms to estimate stay' : 'Select room count to estimate stay',
          amountUSD: null,
          status: 'on_request',
        });
        excludedItems.push(`${input.stayTier.name} (needs nights & room count)`);
      }
    }
  }

  // 2. Activity pricing
  for (const act of input.activities || []) {
    const basis = act.priceBasis || 'per_adult';
    const isConfirmed = act.rateStatus === 'confirmed';
    const dateValid = isDateWithinRange(input.arrivalDate, act.validFrom, act.validTo);

    if (!dateValid) {
      lines.push({
        section: 'Activities',
        title: act.title,
        basis: `Selected dates outside validity (${act.validFrom || 'open'} – ${act.validTo || 'open'}) — Price on request`,
        amountUSD: null,
        status: 'on_request',
      });
      excludedItems.push(`${act.title} (date rate confirmation required)`);
      continue;
    }

    if (basis === 'on_request') {
      lines.push({
        section: 'Activities',
        title: act.title,
        basis: 'Price on request',
        amountUSD: null,
        status: 'on_request',
      });
      excludedItems.push(act.title);
      continue;
    }

    if (act.priceUSD === 0 && isConfirmed) {
      lines.push({
        section: 'Activities',
        title: act.title,
        basis: 'Complimentary / Free',
        amountUSD: 0,
        status: 'free',
      });
      continue;
    }

    if (!Number.isFinite(act.priceUSD) || act.priceUSD <= 0) {
      lines.push({
        section: 'Activities',
        title: act.title,
        basis: 'Price on request',
        amountUSD: null,
        status: 'on_request',
      });
      excludedItems.push(act.title);
      continue;
    }

    if (basis === 'per_group' || basis === 'per_vehicle') {
      lines.push({
        section: 'Activities',
        title: act.title,
        basis: `${isConfirmed ? 'Confirmed' : 'Estimated'} · US$${act.priceUSD} ${basis.replace('_', ' ')}`,
        amountUSD: Math.round(act.priceUSD),
        status: isConfirmed ? 'confirmed' : 'estimated',
      });
      continue;
    }

    // per_adult / per_person / per_child
    if (adults < 1 && childAgesYears.length === 0) {
      needsGuestCount = true;
      lines.push({
        section: 'Activities',
        title: act.title,
        basis: `US$${act.priceUSD} ${basis.replace('_', ' ')} · Add guests to see your total`,
        amountUSD: null,
        status: 'on_request',
      });
      guestNeededItems.push(`${act.title} (needs guests)`);
      continue;
    }

    let lineTotal = adults * act.priceUSD;
    const basisParts: string[] = [];
    if (adults > 0) {
      basisParts.push(`US$${act.priceUSD} × ${adults} adult${adults === 1 ? '' : 's'}`);
    }

    let missingChildUnder11 = false;
    let missingChild11Plus = false;
    let pricedUnder11 = 0;
    let priced11Plus = 0;
    let childSubtotal = 0;

    for (const age of childAgesYears) {
      if (age < 11) {
        if (typeof act.childRateUnder11USD === 'number' && act.childRateUnder11USD >= 0) {
          childSubtotal += act.childRateUnder11USD;
          pricedUnder11 += 1;
        } else {
          missingChildUnder11 = true;
        }
      } else {
        // Ages 11+ (e.g. 11 and 12): apply explicit 11+ child rate or standard per-person 11+ tier if defined, else adult rate for per_person
        const rate11 =
          typeof act.childRate11PlusUSD === 'number' && act.childRate11PlusUSD >= 0
            ? act.childRate11PlusUSD
            : basis === 'per_person'
            ? act.priceUSD
            : null;
        if (rate11 !== null) {
          childSubtotal += rate11;
          priced11Plus += 1;
        } else {
          missingChild11Plus = true;
        }
      }
    }

    lineTotal += childSubtotal;
    if (pricedUnder11 > 0) {
      basisParts.push(`US$${act.childRateUnder11USD} × ${pricedUnder11} child (<11)`);
    }
    if (priced11Plus > 0) {
      const rate11Label =
        typeof act.childRate11PlusUSD === 'number' ? act.childRate11PlusUSD : act.priceUSD;
      basisParts.push(`US$${rate11Label} × ${priced11Plus} youth (11+)`);
    }
    if (missingChildUnder11 || missingChild11Plus) {
      basisParts.push('Child price on request');
      excludedItems.push(`${act.title} (child fare)`);
    }

    const prefix = isConfirmed ? 'Guide rate' : 'Estimated';
    lines.push({
      section: 'Activities',
      title: act.title,
      basis: `${prefix} · ${basisParts.join(' · ')}`,
      amountUSD: Math.round(lineTotal),
      status: isConfirmed && !missingChildUnder11 && !missingChild11Plus ? 'confirmed' : 'estimated',
    });
  }

  // 3. Transfers pricing
  if (transferArr === 'already-arranged') {
    lines.push({
      section: 'Transfers',
      title: 'Transport already arranged',
      basis: 'Arranged independently (excluded from total)',
      amountUSD: null,
      status: 'arranged',
    });
  } else if (transferArr === 'recommend') {
    lines.push({
      section: 'Transfers',
      title: 'Transfer options & pricing requested',
      basis: 'Price on request',
      amountUSD: null,
      status: 'on_request',
    });
    excludedItems.push('Transfers & route options');
  } else if (transferArr === 'selected' && input.transferOption) {
    const tr = input.transferOption;
    const tBasis = tr.priceBasis || 'per_vehicle';
    const isConfirmed = tr.rateStatus === 'confirmed';
    const dateValid = isDateWithinRange(input.arrivalDate, tr.validFrom, tr.validTo);
    const visitorAllowed = !tr.visitorCategory || tr.visitorCategory === 'all' || tr.visitorCategory === visitorCat;

    if (!dateValid || !visitorAllowed || tBasis === 'on_request' || typeof tr.priceUSD !== 'number') {
      lines.push({
        section: 'Transfers',
        title: tr.title,
        basis: !visitorAllowed
          ? `Rate varies for visitor category (${visitorCat.replace('_', ' ')}) — Price on request`
          : 'Price on request',
        amountUSD: null,
        status: 'on_request',
      });
      excludedItems.push(tr.title);
    } else if (tr.priceUSD === 0 && isConfirmed) {
      lines.push({
        section: 'Transfers',
        title: tr.title,
        basis: 'Complimentary transfer',
        amountUSD: 0,
        status: 'free',
      });
    } else if (tBasis === 'per_vehicle' || tBasis === 'per_vehicle_return' || tBasis === 'per_group') {
      const unitTxt =
        tBasis === 'per_vehicle_return'
          ? 'per vehicle return'
          : tBasis === 'per_vehicle'
          ? 'per vehicle'
          : 'per group';
      lines.push({
        section: 'Transfers',
        title: tr.title,
        basis: `${isConfirmed ? 'Guide rate' : 'Estimated'} · US$${tr.priceUSD} ${unitTxt}`,
        amountUSD: Math.round(tr.priceUSD),
        status: isConfirmed ? 'confirmed' : 'estimated',
      });
    } else {
      // per_person
      if (adults < 1 && childAgesYears.length === 0) {
        needsGuestCount = true;
        lines.push({
          section: 'Transfers',
          title: tr.title,
          basis: `US$${tr.priceUSD} per person · Add guests to see your total`,
          amountUSD: null,
          status: 'on_request',
        });
        guestNeededItems.push(`${tr.title} (needs guests)`);
      } else {
        let total = adults * tr.priceUSD;
        let missingChild = false;
        for (const age of childAgesYears) {
          if (age < 11) {
            if (typeof tr.childPriceUSD === 'number' && tr.childPriceUSD >= 0) {
              total += tr.childPriceUSD;
            } else {
              missingChild = true;
            }
          } else {
            const c11 =
              typeof tr.child11PlusPriceUSD === 'number' && tr.child11PlusPriceUSD >= 0
                ? tr.child11PlusPriceUSD
                : tr.priceUSD;
            total += c11;
          }
        }
        if (missingChild) {
          excludedItems.push(`${tr.title} (child fare)`);
        }
        lines.push({
          section: 'Transfers',
          title: tr.title,
          basis: `${isConfirmed ? 'Guide rate' : 'Estimated'} · US$${tr.priceUSD}/person${missingChild ? ' · Child price on request' : ''}`,
          amountUSD: Math.round(total),
          status: isConfirmed ? 'confirmed' : 'estimated',
        });
      }
    }
  }

  const pricedLines = lines.filter(
    (l) => typeof l.amountUSD === 'number' && (l.status === 'estimated' || l.status === 'confirmed' || l.status === 'free')
  );
  const hasProvisionalRates = pricedLines.some((l) => l.status === 'estimated');

  const allExcluded = [...excludedItems, ...guestNeededItems];

  if (pricedLines.length === 0) {
    return {
      mode: 'quote-only',
      headlineLabel: needsGuestCount ? 'Add guests to see your total' : 'Get a quote',
      needsGuestCount,
      subtotalUSD: null,
      hasProvisionalRates: false,
      lines,
      excludedItems,
    };
  }

  const subtotalUSD = pricedLines.reduce((sum, l) => sum + (l.amountUSD ?? 0), 0);
  if (allExcluded.length > 0) {
    return {
      mode: 'partial',
      headlineLabel: 'Subtotal for priced items',
      needsGuestCount,
      subtotalUSD,
      hasProvisionalRates,
      lines,
      excludedItems: allExcluded,
    };
  }

  return {
    mode: 'complete',
    headlineLabel: 'Trip estimate',
    needsGuestCount: false,
    subtotalUSD,
    hasProvisionalRates,
    lines,
    excludedItems: [],
  };
}

function formatTransportArrivalNote(transportType?: string, transferLabel?: string): string {
  if (transferLabel) return transferLabel;
  switch (transportType) {
    case 'private-transfers':
      return 'Private meet-and-greet Victoria Falls Airport (VFA) transfer';
    case 'shared-shuttle':
      return 'Scheduled shared shuttle airport transfer';
    case 'self-drive':
      return 'Self-drive arrival with lodge check-in coordination';
    case 'VIP-helicopter':
      return 'VIP helicopter arrival transfer (subject to flight schedule)';
    case 'already-arranged':
      return 'Arrival via your own independently arranged transport';
    case 'undecided':
      return 'Arrival transfers to be quoted separately by your specialist';
    default:
      return 'Arrival & check-in at leisure';
  }
}

function formatTransportDepartureNote(transportType?: string, transferLabel?: string): string {
  if (transferLabel) return `onward departure transfer (${transferLabel})`;
  switch (transportType) {
    case 'private-transfers':
      return 'private transfer to Victoria Falls Airport (VFA) for your onward flight';
    case 'shared-shuttle':
      return 'scheduled shuttle transfer to Victoria Falls Airport';
    case 'self-drive':
      return 'check-out at leisure for your onward drive';
    case 'already-arranged':
      return 'check-out at leisure using your arranged transport';
    case 'undecided':
      return 'departure transfer logistics to be quoted separately by your specialist';
    default:
      return 'check-out and onward departure arrangements';
  }
}

/**
 * Build a synchronized day-by-day itinerary directly from customer-selected dates/nights,
 * stay arrangement, transfer mode, and chosen activities (with preferred days/times).
 */
export function buildDynamicHolidayItinerary(input: DynamicItineraryInput): DynamicItineraryDay[] {
  const activities = Array.isArray(input.activities) ? input.activities.filter((a) => a && a.title) : [];
  const hasStayDays =
    typeof input.nights === 'number' &&
    input.nights >= 1 &&
    input.stayArrangement !== 'none';

  // Activity-only / transfer-only plan with no multi-night stay selected
  if (!hasStayDays) {
    const out: DynamicItineraryDay[] = [];
    if (activities.length > 0) {
      activities.forEach((act) => {
        const outOfRangeNoStay =
          Boolean(act.activityDate && input.arrivalDate && input.departureDate) &&
          (act.activityDate! < input.arrivalDate! || act.activityDate! > input.departureDate!);
        const dayText = outOfRangeNoStay
          ? 'Date to be arranged'
          : act.activityDate && /^\d{4}-\d{2}-\d{2}$/.test(act.activityDate)
          ? formatIsoDisplayDate(act.activityDate, 0) || act.activityDate
          : act.preferredDay && act.preferredDay !== 'flexible' && act.preferredDay !== 'to-be-scheduled'
          ? act.preferredDay.replace(/^day-/i, 'Day ')
          : 'Date to be arranged';
        out.push({
          day: outOfRangeNoStay
            ? 'Date to be arranged'
            : act.activityDate
            ? dayText
            : input.arrivalDate
            ? `${dayText} (${input.arrivalDate})`
            : dayText,
          title: act.title,
          description: `${formatActivityTimeNote(act)}${input.stayArrangement === 'already-arranged' ? ' — pickup from your booked Victoria Falls accommodation.' : '.'}`,
        });
      });
    }
    if (input.transferLabel && input.transferArrangement === 'selected') {
      out.push({
        day: input.arrivalDate || 'Transfers',
        title: input.transferLabel,
        description: 'Direct transfer service per selected route and schedule.',
      });
    }
    return out;
  }

  const nights = Math.max(1, Math.min(30, Math.round(input.nights || 1)));
  const totalDays = nights + 1;
  const stayLabel = (input.stayLabel || 'your Victoria Falls accommodation').trim();
  const roomNote = input.familyRoomRequested
    ? ' (Family / Interleading room requested)'
    : input.requestedRooms && input.requestedRooms > 1
    ? ` (${input.requestedRooms} rooms requested)`
    : '';

  const perDayActs: Map<number, typeof activities> = new Map();
  const unscheduledActs: typeof activities = [];

  for (const act of activities) {
    if (act.activityDate && input.arrivalDate && /^\d{4}-\d{2}-\d{2}$/.test(act.activityDate) && /^\d{4}-\d{2}-\d{2}$/.test(input.arrivalDate)) {
      const aTs = Date.parse(`${input.arrivalDate}T00:00:00Z`);
      const tTs = Date.parse(`${act.activityDate}T00:00:00Z`);
      const dayNum = Math.round((tTs - aTs) / 86400000) + 1;
      if (dayNum >= 1 && dayNum <= totalDays) {
        const list = perDayActs.get(dayNum) || [];
        list.push(act);
        perDayActs.set(dayNum, list);
        continue;
      }
      unscheduledActs.push({
        ...act,
        title: `${act.title} (Date to be arranged · Choose a new day)`,
      });
      continue;
    }
    const pref = (act.preferredDay || '').trim().toLowerCase();
    const match = pref.match(/^day-(\d+)$/);
    if (match) {
      const dayNum = Number(match[1]);
      if (dayNum >= 1 && dayNum <= totalDays) {
        const list = perDayActs.get(dayNum) || [];
        list.push(act);
        perDayActs.set(dayNum, list);
        continue;
      }
    }
    if (!pref || pref === 'flexible' || pref === 'to-be-scheduled') {
      unscheduledActs.push(act);
    } else {
      unscheduledActs.push(act);
    }
  }

  const days: DynamicItineraryDay[] = [];

  for (let d = 1; d <= totalDays; d += 1) {
    const dateLabel = input.arrivalDate ? formatIsoDisplayDate(input.arrivalDate, d - 1) : null;
    const dayKey = dateLabel ? `Day ${d} · ${dateLabel}` : `Day ${d}`;
    const chosenActs = perDayActs.get(d) || [];

    if (d === 1) {
      const actSummary =
        chosenActs.length > 0
          ? ` Scheduled: ${chosenActs.map(formatActivityTimeNote).join(', ')}.`
          : ' Afternoon at leisure to settle in.';
      const stayDesc =
        input.stayArrangement === 'already-arranged'
          ? `Arrival in Victoria Falls (${formatTransportArrivalNote(input.transportType, input.transferLabel)}) at your independently arranged stay.${actSummary}`
          : input.stayArrangement === 'recommend'
          ? `Arrival (${formatTransportArrivalNote(input.transportType, input.transferLabel)}) and check-in at your specialist-recommended stay.${actSummary}`
          : `${formatTransportArrivalNote(input.transportType, input.transferLabel)} followed by check-in at ${stayLabel}${roomNote}.${actSummary}`;
      days.push({
        day: dayKey,
        title: chosenActs.length > 0 ? `Arrival & ${chosenActs[0].title}` : 'Victoria Falls Arrival & Check-In',
        description: stayDesc,
      });
    } else if (d === totalDays) {
      const morningActNote =
        chosenActs.length > 0
          ? `Morning: ${chosenActs.map(formatActivityTimeNote).join(', ')}. `
          : '';
      days.push({
        day: dayKey,
        title: 'Check-Out & Onward Departure',
        description: `${morningActNote}Check-out and ${formatTransportDepartureNote(input.transportType, input.transferLabel)}.`,
      });
    } else {
      if (chosenActs.length > 0) {
        days.push({
          day: dayKey,
          title: chosenActs.map((a) => a.title).join(' & '),
          description: chosenActs.map(formatActivityTimeNote).join(' · '),
        });
      } else {
        days.push({
          day: dayKey,
          title: 'Victoria Falls Day at Leisure',
          description: 'Open day — assign a preferred experience or keep flexible with your specialist.',
        });
      }
    }
  }

  if (unscheduledActs.length > 0) {
    days.push({
      day: 'To be scheduled',
      title: `${unscheduledActs.length} Experience${unscheduledActs.length === 1 ? '' : 's'} to Schedule`,
      description: unscheduledActs.map(formatActivityTimeNote).join(' · '),
    });
  }

  return days;
}
