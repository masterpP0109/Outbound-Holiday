import type { ActivityItem, DetailedAccommodation, Experience } from '../types/content';
import { getPropertyDisplayPriceUSD, isPublishedAccommodation } from './accommodation';

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
  experiences: Experience[] = []
): ActivityItem[] {
  const byIdOrSlug = new Map<string, Experience>();
  const byTitle = new Map<string, Experience>();

  for (const exp of experiences) {
    if (!exp || !exp.id) continue;
    byIdOrSlug.set(exp.id, exp);
    if (exp.slug) byIdOrSlug.set(exp.slug, exp);
    byTitle.set(normalizeTitleKey(exp.title), exp);
  }

  const matchedExpIds = new Set<string>();
  const merged: ActivityItem[] = [];

  for (const act of builderActivities) {
    if (!act || !act.id) continue;
    const mappedKey = LEGACY_ACTIVITY_EXPERIENCE_MAP[act.id];
    const matchedExp =
      (mappedKey ? byIdOrSlug.get(mappedKey) : undefined) ||
      byIdOrSlug.get(act.id) ||
      byTitle.get(normalizeTitleKey(act.title));

    if (matchedExp) {
      matchedExpIds.add(matchedExp.id);
      const livePrice =
        typeof matchedExp.priceAmount === 'number' && Number.isFinite(matchedExp.priceAmount) && matchedExp.priceAmount > 0
          ? matchedExp.priceAmount
          : act.priceUSD;

      merged.push({
        id: act.id,
        title: matchedExp.title || act.title,
        duration: matchedExp.duration || act.duration,
        priceUSD: livePrice,
        imageUrl: matchedExp.featuredImage || act.imageUrl,
        badge: matchedExp.badge || act.badge || 'Popular',
        shortDesc: matchedExp.shortDescription || act.shortDesc,
        whyRecommend: matchedExp.whyWeRecommend || act.whyRecommend,
        idealFor: Array.isArray(act.idealFor) && act.idealFor.length > 0 ? act.idealFor : ['first-time'],
      });
    } else {
      merged.push(act);
    }
  }

  for (const exp of experiences) {
    if (!exp || !exp.id || matchedExpIds.has(exp.id)) continue;
    if (typeof exp.priceAmount !== 'number' || !Number.isFinite(exp.priceAmount) || exp.priceAmount <= 0) {
      continue;
    }
    const cats = Array.isArray(exp.categories) && exp.categories.length > 0
      ? exp.categories.map((c) => String(c))
      : ['first-time'];

    merged.push({
      id: exp.id,
      title: exp.title,
      duration: exp.duration || 'Half Day',
      priceUSD: exp.priceAmount,
      imageUrl: exp.featuredImage,
      badge: exp.badge || 'Experience',
      shortDesc: exp.shortDescription,
      whyRecommend: exp.whyWeRecommend || exp.shortDescription,
      idealFor: cats,
    });
  }

  return merged;
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
  stayNightRateUSD: number;
  activityRatesUSD: number[];
  transportType: string;
  roomsCount?: number;
}

export interface HolidayEstimateResult {
  rooms: number;
  stayNightRateUSD: number;
  stayCost: number;
  activitiesCost: number;
  transportCost: number;
  minimumUSD: number;
  maximumUSD: number;
}

export function getTransportCostUSD(transportType: string): number {
  if (transportType === 'private-transfers') return 120;
  if (transportType === 'shared-shuttle') return 60;
  return 0;
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

  const stayCost = Math.round(stayNightRateUSD * nights * rooms);
  const activitiesCost = Math.round(activitySum * (adults + children * 0.8));
  const transportCost = getTransportCostUSD(input.transportType);
  const minimumUSD = Math.round(stayCost + activitiesCost + transportCost);
  const maximumUSD = Math.round(minimumUSD * 1.18);

  return {
    rooms,
    stayNightRateUSD,
    stayCost,
    activitiesCost,
    transportCost,
    minimumUSD,
    maximumUSD,
  };
}
