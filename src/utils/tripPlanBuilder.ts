import type { DetailedAccommodation } from '../types/content';
import type { TravelPackage } from '../types';
import type { DetailedPackage } from '../data/packagesData';
import type { EnquiryInput } from '../../shared/submission-schema';
import {
  buildDynamicHolidayItinerary,
  calculateItemizedTripEstimate,
  type BuilderTransferOption,
  type DynamicItineraryDay,
  type ItemizedTripEstimateResult,
} from './holidayCalculator';
import type { ActivityItem } from '../types/content';
import { getWhatsAppUrl } from './whatsapp';

export const TRIP_PLAN_STORAGE_KEY = 'outbound_trip_plan_draft_v1';

export type BuilderSectionId = 'dates-guests' | 'stay' | 'activities' | 'transfers' | 'review';
export type TimingMode = 'exact-dates' | 'approx-month' | 'flexible' | 'undecided';
export type StayArrangement = 'selected' | 'already-arranged' | 'recommend' | 'none';
export type TransferArrangement = 'selected' | 'already-arranged' | 'recommend' | 'none';
export type ReplyMethod = 'whatsapp' | 'email';

export interface SelectedPlanActivity {
  id: string;
  preferredDay: string; // 'day-1', 'day-2', ... or 'to-be-scheduled'
  activityDate?: string; // YYYY-MM-DD when pinned to a specific calendar day
  preferredTime: string; // published departure time (e.g. '4:00 pm'), 'morning', 'afternoon', 'sunset', 'any-time', or 'to-be-arranged'
}

export interface TripPlanDraft {
  version: 1;
  timingMode: TimingMode;
  arrivalDate: string;
  departureDate: string;
  approxMonth: string;
  nights: number | null;
  adults: number | null;
  childAgesYears: number[];
  visitorCategory: 'international' | 'zimbabwe_resident' | 'sadc_resident';
  stayArrangement: StayArrangement;
  accommodationId: string;
  roomId: string;
  ratePlanId: string;
  mealPlanId: string;
  offerId: string;
  stayTierId: string;
  requestedRooms: number | null;
  familyRoomRequested: boolean;
  packageId: string;
  packageTitle: string;
  selectedActivities: SelectedPlanActivity[];
  transferArrangement: TransferArrangement;
  transferId: string;
  transferDate: string;
  flightTime: string;
  flightTimeUnknown: boolean;
  pickupTime: string;
}

export function createEmptyTripPlanDraft(): TripPlanDraft {
  return {
    version: 1,
    timingMode: 'undecided',
    arrivalDate: '',
    departureDate: '',
    approxMonth: '',
    nights: null,
    adults: null,
    childAgesYears: [],
    visitorCategory: 'international',
    stayArrangement: 'none',
    accommodationId: '',
    roomId: '',
    ratePlanId: '',
    mealPlanId: '',
    offerId: '',
    stayTierId: '',
    requestedRooms: null,
    familyRoomRequested: false,
    packageId: '',
    packageTitle: '',
    selectedActivities: [],
    transferArrangement: 'none',
    transferId: '',
    transferDate: '',
    flightTime: '',
    flightTimeUnknown: false,
    pickupTime: '',
  };
}

export function hasMeaningfulDraftContent(draft: TripPlanDraft): boolean {
  return Boolean(
    draft.timingMode !== 'undecided' ||
      draft.arrivalDate ||
      draft.departureDate ||
      draft.approxMonth ||
      draft.nights !== null ||
      draft.adults !== null ||
      draft.childAgesYears.length > 0 ||
      draft.stayArrangement !== 'none' ||
      draft.accommodationId ||
      draft.stayTierId ||
      draft.packageId ||
      draft.selectedActivities.length > 0 ||
      draft.transferArrangement !== 'none' ||
      draft.transferId
  );
}

export function getDefaultTimeForActivity(act?: Partial<ActivityItem> | null): string {
  const pubTimes = Array.isArray(act?.departureTimes)
    ? act!.departureTimes.map((t) => String(t).trim()).filter(Boolean)
    : [];
  if (pubTimes.length === 1) {
    return pubTimes[0];
  }
  return act?.defaultTimeSlot?.trim() || 'to-be-arranged';
}

export function getTripCalendarDays(
  arrivalDate: string,
  departureDate: string
): Array<{ dayId: string; dateIso: string; label: string }> {
  const nights = computeNightsBetweenDates(arrivalDate, departureDate);
  if (!nights || !/^\d{4}-\d{2}-\d{2}$/.test(arrivalDate)) return [];
  const start = Date.parse(`${arrivalDate}T00:00:00Z`);
  if (!Number.isFinite(start)) return [];
  const totalDays = Math.min(31, nights + 1);
  const out: Array<{ dayId: string; dateIso: string; label: string }> = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const shortDate = d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
    out.push({
      dayId: `day-${i + 1}`,
      dateIso: iso,
      label: `Day ${i + 1} · ${shortDate}`,
    });
  }
  return out;
}

export function isActivityDateOutsideTrip(
  sel: SelectedPlanActivity,
  arrivalDate: string,
  departureDate: string
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(arrivalDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)
  ) {
    return false;
  }
  if (sel.activityDate && /^\d{4}-\d{2}-\d{2}$/.test(sel.activityDate)) {
    return sel.activityDate < arrivalDate || sel.activityDate > departureDate;
  }
  const m = sel.preferredDay?.match(/^day-(\d+)$/i);
  if (m) {
    const dayNum = Number(m[1]);
    const nights = computeNightsBetweenDates(arrivalDate, departureDate);
    if (nights && dayNum > nights + 1) {
      return true;
    }
  }
  return false;
}

export function formatShortIsoDay(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(d)) return iso;
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

/**
 * Persist ONLY non-PII trip planning selections locally (names, emails, phones, and notes are never saved).
 */
export function saveTripPlanDraft(draft: TripPlanDraft): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (!hasMeaningfulDraftContent(draft)) {
      window.localStorage.removeItem(TRIP_PLAN_STORAGE_KEY);
      return;
    }
    const safePayload: TripPlanDraft = {
      version: 1,
      timingMode: draft.timingMode,
      arrivalDate: draft.arrivalDate,
      departureDate: draft.departureDate,
      approxMonth: draft.approxMonth,
      nights: draft.nights,
      adults: draft.adults,
      childAgesYears: [...draft.childAgesYears],
      visitorCategory: draft.visitorCategory,
      stayArrangement: draft.stayArrangement,
      accommodationId: draft.accommodationId,
      roomId: draft.roomId,
      ratePlanId: draft.ratePlanId,
      mealPlanId: draft.mealPlanId,
      offerId: draft.offerId,
      stayTierId: draft.stayTierId,
      requestedRooms: draft.requestedRooms,
      familyRoomRequested: draft.familyRoomRequested,
      packageId: draft.packageId,
      packageTitle: draft.packageTitle,
      selectedActivities: draft.selectedActivities.map((a) => ({
        id: a.id,
        preferredDay: a.preferredDay,
        ...(a.activityDate ? { activityDate: a.activityDate } : {}),
        preferredTime: a.preferredTime,
      })),
      transferArrangement: draft.transferArrangement,
      transferId: draft.transferId,
      transferDate: draft.transferDate,
      flightTime: draft.flightTime,
      flightTimeUnknown: draft.flightTimeUnknown,
      pickupTime: draft.pickupTime,
    };
    window.localStorage.setItem(TRIP_PLAN_STORAGE_KEY, JSON.stringify(safePayload));
  } catch {
    // Ignore private-browsing storage quota failures.
  }
}

export function loadTripPlanDraft(): TripPlanDraft | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(TRIP_PLAN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TripPlanDraft>;
    if (!parsed || parsed.version !== 1) return null;
    const empty = createEmptyTripPlanDraft();
    const merged: TripPlanDraft = {
      ...empty,
      timingMode: parsed.timingMode || 'undecided',
      arrivalDate: String(parsed.arrivalDate || ''),
      departureDate: String(parsed.departureDate || ''),
      approxMonth: String(parsed.approxMonth || ''),
      nights: typeof parsed.nights === 'number' && parsed.nights >= 1 ? parsed.nights : null,
      adults: typeof parsed.adults === 'number' && parsed.adults >= 1 ? parsed.adults : null,
      childAgesYears: Array.isArray(parsed.childAgesYears)
        ? parsed.childAgesYears.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 17)
        : [],
      visitorCategory: parsed.visitorCategory || 'international',
      stayArrangement: parsed.stayArrangement || 'none',
      accommodationId: String(parsed.accommodationId || ''),
      roomId: String(parsed.roomId || ''),
      ratePlanId: String(parsed.ratePlanId || ''),
      mealPlanId: String(parsed.mealPlanId || ''),
      offerId: String(parsed.offerId || ''),
      stayTierId: String(parsed.stayTierId || ''),
      requestedRooms: typeof parsed.requestedRooms === 'number' && parsed.requestedRooms >= 1 ? parsed.requestedRooms : null,
      familyRoomRequested: Boolean(parsed.familyRoomRequested),
      packageId: String(parsed.packageId || ''),
      packageTitle: String(parsed.packageTitle || ''),
      selectedActivities: Array.isArray(parsed.selectedActivities)
        ? parsed.selectedActivities
            .filter((a) => a && typeof a.id === 'string')
            .map((a) => ({
              id: a.id,
              preferredDay: String(a.preferredDay || 'to-be-scheduled'),
              ...(typeof a.activityDate === 'string' && a.activityDate ? { activityDate: a.activityDate } : {}),
              preferredTime: String(a.preferredTime || 'to-be-arranged'),
            }))
        : [],
      transferArrangement: parsed.transferArrangement || 'none',
      transferId: String(parsed.transferId || ''),
      transferDate: String(parsed.transferDate || ''),
      flightTime: String(parsed.flightTime || ''),
      flightTimeUnknown: Boolean(parsed.flightTimeUnknown),
      pickupTime: String(parsed.pickupTime || ''),
    };
    return hasMeaningfulDraftContent(merged) ? merged : null;
  } catch {
    return null;
  }
}

export function clearTripPlanDraft(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(TRIP_PLAN_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

export function computeNightsBetweenDates(arrival: string, departure: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(arrival) || !/^\d{4}-\d{2}-\d{2}$/.test(departure)) {
    return null;
  }
  const s = Date.parse(`${arrival}T00:00:00Z`);
  const e = Date.parse(`${departure}T00:00:00Z`);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return null;
  const diff = Math.round((e - s) / 86400000);
  return diff >= 1 && diff <= 30 ? diff : null;
}

export interface QuickEnquiryWhatsAppInput {
  name?: string;
  email?: string;
  phone?: string;
  replyMethod?: ReplyMethod;
  timingLabel?: string;
  notes?: string;
  explicitItemLabel?: string;
}

/**
 * Build the direct first-screen WhatsApp draft starting with the exact welcoming lead line
 * and including ONLY details explicitly supplied by the customer or pre-attached item.
 */
export function buildQuickHelpWhatsAppUrl(input: QuickEnquiryWhatsAppInput): string {
  const lines = ['Hi Outbound Holidays, I’d like help planning a Victoria Falls trip.'];
  const details: string[] = [];
  if (input.explicitItemLabel?.trim()) details.push(`Enquiring about: ${input.explicitItemLabel.trim()}`);
  if (input.name?.trim()) details.push(`Name: ${input.name.trim()}`);
  if (input.replyMethod) details.push(`Preferred reply method: ${input.replyMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}`);
  if (input.email?.trim()) details.push(`Email: ${input.email.trim()}`);
  if (input.phone?.trim()) details.push(`WhatsApp / Phone: ${input.phone.trim()}`);
  if (input.timingLabel?.trim()) details.push(`Timing: ${input.timingLabel.trim()}`);
  if (input.notes?.trim()) details.push(`Details / requests: ${input.notes.trim()}`);

  if (details.length > 0) {
    lines.push('', details.join('\n'));
  }
  return getWhatsAppUrl(lines.join('\n'));
}

export interface ResolvedTripPlanContext {
  draft: TripPlanDraft;
  property: DetailedAccommodation | null;
  stayTier: { id: string; name: string; pricePerNightUSD: number } | null;
  activities: ActivityItem[];
  transferOption: BuilderTransferOption | null;
  itemized: ItemizedTripEstimateResult;
  itinerary: DynamicItineraryDay[];
}

export function resolveTripPlanContext(params: {
  draft: TripPlanDraft;
  accommodations: DetailedAccommodation[];
  stayTiers: Array<{ id: string; name: string; pricePerNightUSD: number }>;
  allActivities: ActivityItem[];
  transferOptions: BuilderTransferOption[];
}): ResolvedTripPlanContext {
  const { draft, accommodations, stayTiers, allActivities, transferOptions } = params;
  const property =
    draft.accommodationId
      ? accommodations.find((a) => a.id === draft.accommodationId || a.slug === draft.accommodationId) || null
      : null;
  const stayTier =
    !property && draft.stayTierId
      ? stayTiers.find((t) => t.id === draft.stayTierId) || null
      : null;

  const activities = draft.selectedActivities
    .map((sel) => allActivities.find((a) => a.id === sel.id))
    .filter((a): a is ActivityItem => Boolean(a));

  const transferOption =
    draft.transferArrangement === 'selected' && draft.transferId
      ? transferOptions.find((t) => t.id === draft.transferId) || null
      : null;

  const effectiveNights =
    draft.timingMode === 'exact-dates' && draft.arrivalDate && draft.departureDate
      ? computeNightsBetweenDates(draft.arrivalDate, draft.departureDate) ?? draft.nights
      : draft.nights;

  const itemized = calculateItemizedTripEstimate({
    nights: effectiveNights,
    ...(draft.timingMode === 'exact-dates' ? { arrivalDate: draft.arrivalDate, departureDate: draft.departureDate } : {}),
    adults: draft.adults,
    childAgesYears: draft.childAgesYears,
    visitorCategory: draft.visitorCategory,
    stayArrangement: draft.stayArrangement,
    property,
    ...(draft.roomId ? { roomId: draft.roomId } : {}),
    ...(draft.ratePlanId ? { ratePlanId: draft.ratePlanId } : {}),
    ...(draft.mealPlanId ? { mealPlanId: draft.mealPlanId } : {}),
    stayTier,
    roomsCount: draft.requestedRooms,
    activities: activities.map((act) => ({
      id: act.id,
      title: act.title,
      priceUSD: act.priceUSD,
      ...(act.priceBasis ? { priceBasis: act.priceBasis } : {}),
      ...(act.childRateUnder11USD !== undefined ? { childRateUnder11USD: act.childRateUnder11USD } : {}),
      ...(act.childRate11PlusUSD !== undefined ? { childRate11PlusUSD: act.childRate11PlusUSD } : {}),
      ...(act.rateStatus ? { rateStatus: act.rateStatus } : {}),
      ...(act.priceOverrideEnabled !== undefined ? { priceOverrideEnabled: act.priceOverrideEnabled } : {}),
      ...(act.validFrom ? { validFrom: act.validFrom } : {}),
      ...(act.validTo ? { validTo: act.validTo } : {}),
    })),
    transferArrangement: draft.transferArrangement,
    transferOption,
  });

  const roomObj = property?.roomTypes?.find((r) => (r.id || r.name) === draft.roomId);
  const stayLabel = property
    ? `${property.name}${roomObj ? ` (${roomObj.name})` : ''}`
    : stayTier
    ? stayTier.name
    : '';

  const mappedActivities = activities.map((act) => {
    const sel = draft.selectedActivities.find((s) => s.id === act.id);
    return {
      id: act.id,
      title: act.title,
      duration: act.duration,
      ...(sel?.preferredDay ? { preferredDay: sel.preferredDay } : {}),
      ...(sel?.activityDate ? { activityDate: sel.activityDate } : {}),
      ...(sel?.preferredTime ? { preferredTime: sel.preferredTime } : {}),
      ...(act.defaultTimeSlot ? { defaultTimeSlot: act.defaultTimeSlot } : {}),
    };
  });

  const itinerary = buildDynamicHolidayItinerary({
    nights: effectiveNights,
    stayLabel,
    stayArrangement: draft.stayArrangement,
    transferArrangement: draft.transferArrangement,
    ...(transferOption ? { transferLabel: `${transferOption.title}${transferOption.route ? ` (${transferOption.route})` : ''}` } : {}),
    transportType:
      draft.transferArrangement === 'already-arranged'
        ? 'already-arranged'
        : draft.transferArrangement === 'recommend'
        ? 'undecided'
        : draft.transferArrangement === 'selected'
        ? transferOption?.id || 'selected'
        : 'none',
    activities: mappedActivities,
    ...(draft.timingMode === 'exact-dates' ? { arrivalDate: draft.arrivalDate, departureDate: draft.departureDate } : {}),
    ...(draft.adults !== null ? { adults: draft.adults } : {}),
    children: draft.childAgesYears.length,
    requestedRooms: draft.requestedRooms,
    familyRoomRequested: draft.familyRoomRequested,
  });

  return {
    draft: { ...draft, nights: effectiveNights },
    property,
    stayTier,
    activities,
    transferOption,
    itemized,
    itinerary,
  };
}

export function buildPlannerPlanWhatsAppUrl(params: {
  ctx: ResolvedTripPlanContext;
  name?: string;
  replyMethod?: ReplyMethod;
  includeReplyMethod?: boolean;
  notes?: string;
}): string {
  const { ctx, name, replyMethod, includeReplyMethod, notes } = params;
  const { draft, property, stayTier, transferOption, itemized, itinerary } = ctx;
  const lines: string[] = ['Hi Outbound Holidays, I’d like to share my Victoria Falls trip plan for a quote:'];
  const details: string[] = [];

  if (name?.trim()) details.push(`Name: ${name.trim()}`);
  const shouldIncludeReply =
    replyMethod && (includeReplyMethod === true || (includeReplyMethod === undefined && Boolean(name?.trim())));
  if (shouldIncludeReply) {
    details.push(`Preferred reply method: ${replyMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}`);
  }

  if (draft.timingMode === 'exact-dates' && draft.arrivalDate && draft.departureDate) {
    details.push(`Dates: ${draft.arrivalDate} to ${draft.departureDate}${draft.nights ? ` (${draft.nights} nights)` : ''}`);
  } else if (draft.timingMode === 'approx-month' && draft.approxMonth) {
    details.push(`Approximate timing: ${draft.approxMonth}${draft.nights ? ` (${draft.nights} nights)` : ''}`);
  } else if (draft.timingMode === 'flexible') {
    details.push(`Timing: Flexible dates${draft.nights ? ` (${draft.nights} nights)` : ''}`);
  } else {
    details.push('Dates: Dates not chosen');
  }

  if (draft.adults !== null || draft.childAgesYears.length > 0) {
    const childText =
      draft.childAgesYears.length > 0
        ? `, ${draft.childAgesYears.length} Child(ren) (ages ${draft.childAgesYears.join(', ')})`
        : '';
    const resLabel =
      draft.visitorCategory === 'zimbabwe_resident'
        ? 'Zimbabwe Resident'
        : draft.visitorCategory === 'sadc_resident'
        ? 'SADC Resident'
        : 'International Visitor';
    details.push(`Guests: ${draft.adults ?? 0} Adult(s)${childText} · ${resLabel}`);
  }

  if (draft.packageTitle) {
    details.push(`Package: ${draft.packageTitle}`);
  }

  if (draft.stayArrangement === 'already-arranged') {
    details.push('Stay: Already arranged independently');
  } else if (draft.stayArrangement === 'recommend') {
    details.push('Stay: Please recommend suitable Victoria Falls options');
  } else if (draft.stayArrangement === 'selected') {
    const roomObj = property?.roomTypes?.find((r) => (r.id || r.name) === draft.roomId);
    const rateObj = roomObj?.pricing?.ratePlans?.find((rp) => rp.id === draft.ratePlanId) || property?.ratePlans?.find((rp) => rp.id === draft.ratePlanId);
    const mealObj = roomObj?.pricing?.mealPlanRates?.find((m) => m.id === draft.mealPlanId);
    const offerObj = property?.offers?.find((o) => o.id === draft.offerId);
    const parts = [property?.name || stayTier?.name || 'Stay selected'];
    if (roomObj) parts.push(`Room: ${roomObj.name}`);
    if (rateObj) parts.push(`Rate plan: ${rateObj.internalRateName}`);
    if (mealObj) parts.push(`Meal plan: ${mealObj.name}`);
    if (offerObj) parts.push(`Offer: ${offerObj.title}`);
    if (draft.familyRoomRequested) parts.push('Family / Interleading room requested');
    else if (draft.requestedRooms) parts.push(`${draft.requestedRooms} room(s)`);
    details.push(`Stay: ${parts.join(' · ')}`);
  }

  if (ctx.activities.length > 0) {
    const actSummaries = ctx.activities.map((act) => {
      const sel = draft.selectedActivities.find((s) => s.id === act.id);
      const dayPart = sel?.activityDate
        ? formatShortIsoDay(sel.activityDate)
        : sel?.preferredDay && sel.preferredDay !== 'to-be-scheduled'
        ? sel.preferredDay.replace(/^day-/i, 'Day ')
        : 'Day flexible';
      const timePart = sel?.preferredTime || getDefaultTimeForActivity(act);
      return `${act.title} (${dayPart}, ${timePart === 'to-be-arranged' ? 'Time to be arranged' : timePart})`;
    });
    details.push(`Activities: ${actSummaries.join('; ')}`);
  }

  if (draft.transferArrangement === 'already-arranged') {
    details.push('Transfers: Already arranged');
  } else if (draft.transferArrangement === 'recommend') {
    const trExtras: string[] = [];
    const trDate = draft.transferDate || draft.arrivalDate;
    if (trDate) trExtras.push(`Date: ${trDate}`);
    if (draft.flightTimeUnknown) trExtras.push('Flight time: Not yet known');
    else if (draft.flightTime) trExtras.push(`Flight time: ${draft.flightTime}`);
    if (draft.pickupTime) trExtras.push(`Pickup time: ${draft.pickupTime}`);
    details.push(`Transfers: Please recommend transfer options & quote${trExtras.length > 0 ? ` (${trExtras.join(', ')})` : ''}`);
  } else if (draft.transferArrangement === 'selected' && transferOption) {
    const trExtras: string[] = [];
    const trDate = draft.transferDate || draft.arrivalDate;
    if (trDate) trExtras.push(`Date: ${trDate}`);
    if (draft.flightTimeUnknown) trExtras.push('Flight time: Not yet known');
    else if (draft.flightTime) trExtras.push(`Flight time: ${draft.flightTime}`);
    if (draft.pickupTime) trExtras.push(`Pickup time: ${draft.pickupTime}`);
    details.push(
      `Transfers: ${transferOption.title}${transferOption.route ? ` (${transferOption.route})` : ''}${
        trExtras.length > 0 ? ` — ${trExtras.join(', ')}` : ''
      }`
    );
  }

  lines.push('', details.join('\n'));

  if (itemized.lines.length > 0) {
    const fallbackStatus = itemized.needsGuestCount ? 'Add guests to see your total' : 'Get a quote';
    lines.push('', `*${itemized.headlineLabel}:* ${itemized.subtotalUSD !== null ? `US$${itemized.subtotalUSD}` : fallbackStatus}`);
    for (const l of itemized.lines) {
      const priceStr =
        l.amountUSD !== null
          ? l.status === 'free'
            ? 'Free'
            : `US$${l.amountUSD}`
          : l.status === 'arranged'
          ? 'Arranged'
          : l.basis.includes('Add guests to see your total')
          ? 'Add guests to see your total'
          : 'Price on request';
      lines.push(`- ${l.section}: ${l.title} — ${priceStr} (${l.basis})`);
    }
    if (itemized.excludedItems.length > 0) {
      lines.push(`Excluded / to be quoted: ${itemized.excludedItems.join(', ')}`);
    }
  }

  if (itinerary.length > 0) {
    lines.push('', '*Schedule / Itinerary:*');
    for (const d of itinerary) {
      lines.push(`- ${d.day}: ${d.title} (${d.description})`);
    }
  }

  if (notes?.trim()) {
    lines.push('', `Notes: ${notes.trim()}`);
  }

  return getWhatsAppUrl(lines.join('\n'));
}

export function buildPlannerSubmissionPayload(params: {
  mode: 'quick' | 'guided';
  ctx: ResolvedTripPlanContext;
  name: string;
  email: string;
  phone: string;
  replyMethod: ReplyMethod;
  notes: string;
  marketingConsent: boolean;
  quickTimingLabel?: string;
  preselectedPromotion?: { id: number; name: string } | null;
  preselectedPackage?: TravelPackage | DetailedPackage | null;
  preselectedActivityId?: string | null;
  preselectedActivityTitle?: string | null;
}): EnquiryInput & { [k: string]: unknown } {
  const { mode, ctx, name, email, phone, replyMethod, notes, marketingConsent, quickTimingLabel, preselectedPromotion, preselectedPackage, preselectedActivityId, preselectedActivityTitle } = params;
  const { draft, property, stayTier, activities, transferOption, itemized, itinerary } = ctx;

  const safeText = (v: unknown, max: number) => String(v || '').trim().slice(0, max);

  const roomObj = property?.roomTypes?.find((r) => (r.id || r.name) === draft.roomId);
  const rateObj =
    roomObj?.pricing?.ratePlans?.find((rp) => rp.id === draft.ratePlanId) ||
    property?.ratePlans?.find((rp) => rp.id === draft.ratePlanId);
  const mealObj = roomObj?.pricing?.mealPlanRates?.find((m) => m.id === draft.mealPlanId);
  const offerObj = property?.offers?.find((o) => o.id === draft.offerId);

  const mappedSelectedActs = activities.map((act) => {
    const sel = draft.selectedActivities.find((s) => s.id === act.id);
    return {
      id: act.id,
      title: act.title,
      duration: act.duration || '',
      unitPriceUSD: Number.isFinite(act.priceUSD) && act.priceUSD >= 0 ? act.priceUSD : 0,
      ...(sel?.preferredDay && sel.preferredDay !== 'to-be-scheduled' ? { preferredDay: sel.preferredDay } : {}),
      ...(sel?.activityDate ? { activityDate: sel.activityDate } : {}),
      ...(sel?.preferredTime && sel.preferredTime !== 'to-be-arranged'
        ? { preferredTime: sel.preferredTime }
        : act.defaultTimeSlot
        ? { preferredTime: act.defaultTimeSlot }
        : {}),
      ...(act.priceBasis ? { priceBasis: act.priceBasis } : {}),
      rateStatus: act.rateStatus === 'confirmed' ? ('confirmed' as const) : ('provisional' as const),
    };
  });

  const mappedLineItems = itemized.lines.map((l) => ({
    section: safeText(l.section, 40),
    title: safeText(l.title, 200),
    basis: safeText(l.basis, 160),
    amountUSD: l.amountUSD,
    status: l.status,
  }));

  const travelDatesText =
    mode === 'quick'
      ? quickTimingLabel || undefined
      : draft.timingMode === 'exact-dates' && draft.arrivalDate && draft.departureDate
      ? `${draft.arrivalDate} to ${draft.departureDate}`
      : draft.timingMode === 'approx-month' && draft.approxMonth
      ? draft.approxMonth
      : draft.timingMode === 'flexible'
      ? 'Flexible dates'
      : undefined;

  const trip: Record<string, unknown> = {
    entryMode: mode,
    promotionId: preselectedPromotion?.id,
    promotionName: preselectedPromotion?.name,
    preferredContact: replyMethod,
    preferredReplyMethod: replyMethod,
    ...(mode === 'guided' && itemized.lines.length > 0
      ? {
          itemizedEstimate: {
            status: itemized.mode,
            totalLabel: itemized.headlineLabel,
            subtotalUSD: itemized.subtotalUSD,
            excludedItems: itemized.excludedItems.map((e) => safeText(e, 200)),
            lines: mappedLineItems,
          },
        }
      : {}),
    ...(mode === 'guided' && itinerary.length > 0
      ? {
          itineraryDraft: itinerary.map((d) => ({
            day: safeText(d.day, 100),
            title: safeText(d.title, 150),
            description: safeText(d.description, 1000),
          })),
        }
      : {}),
    ...(mode === 'guided' && draft.adults ? { adults: draft.adults } : {}),
    ...(mode === 'guided' ? { children: draft.childAgesYears.length } : {}),
    ...(mode === 'guided' && draft.childAgesYears.length > 0
      ? {
          childAges: draft.childAgesYears.map((age, idx) => `Child ${idx + 1}: age ${age}${age < 11 ? ' (Under 11)' : ' (11+)'}`),
          childAgeValues: draft.childAgesYears,
        }
      : {}),
    ...(mode === 'guided' && draft.nights ? { nights: draft.nights } : {}),
    ...(mode === 'guided' ? { timingMode: draft.timingMode } : {}),
    ...(draft.approxMonth ? { approxMonth: draft.approxMonth } : {}),
    ...(travelDatesText ? { travelDates: travelDatesText } : {}),
    ...(draft.timingMode === 'exact-dates' && draft.arrivalDate ? { arrivalDate: draft.arrivalDate } : {}),
    ...(draft.timingMode === 'exact-dates' && draft.departureDate ? { departureDate: draft.departureDate } : {}),
    ...(mode === 'guided' ? { visitorCategory: draft.visitorCategory } : {}),
    ...(mode === 'guided' ? { stayArrangement: draft.stayArrangement } : {}),
    ...(draft.stayArrangement === 'selected' && draft.stayTierId ? { stayTierId: draft.stayTierId } : {}),
    ...(draft.stayArrangement === 'selected' && stayTier?.name ? { stayTierName: stayTier.name } : {}),
    ...(draft.stayArrangement === 'selected' && draft.requestedRooms ? { requestedRooms: draft.requestedRooms } : {}),
    ...(draft.familyRoomRequested ? { familyRoomRequested: true } : {}),
    ...(property?.id ? { accommodationId: property.id } : {}),
    ...(property?.name ? { accommodationName: property.name } : {}),
    ...(property?.category ? { accommodationCategory: property.category } : {}),
    ...(roomObj ? { roomId: roomObj.id || roomObj.name, roomType: roomObj.name } : {}),
    ...(rateObj ? { ratePlanId: rateObj.id, ratePlanName: rateObj.internalRateName } : {}),
    ...(mealObj ? { mealPlanId: mealObj.id, mealPlan: mealObj.name } : {}),
    ...(offerObj ? { offerId: offerObj.id, offerName: offerObj.title } : {}),
    ...(preselectedPackage?.id || draft.packageId ? { packageId: preselectedPackage?.id || draft.packageId } : {}),
    ...(preselectedPackage?.title || draft.packageTitle ? { packageTitle: preselectedPackage?.title || draft.packageTitle } : {}),
    activityIds: activities.map((a) => a.id),
    ...(mappedSelectedActs.length > 0 ? { selectedActivities: mappedSelectedActs } : {}),
    experienceIds: preselectedActivityId ? [preselectedActivityId] : [],
    ...(preselectedActivityTitle ? { preselectedExperienceTitle: preselectedActivityTitle } : {}),
    ...(mode === 'guided' ? { transferArrangement: draft.transferArrangement } : {}),
    ...(transferOption
      ? {
          transferId: transferOption.id,
          transferTitle: transferOption.title,
          transferRoute: transferOption.route || transferOption.desc,
          ...(typeof transferOption.priceUSD === 'number' ? { transferPriceUSD: transferOption.priceUSD } : {}),
          transferBasis: transferOption.priceBasis || 'per_vehicle',
        }
      : {}),
    ...(draft.transferDate ? { transferDate: draft.transferDate } : {}),
    ...(draft.flightTime && !draft.flightTimeUnknown ? { flightTime: draft.flightTime } : {}),
    ...(draft.flightTimeUnknown ? { flightTimeUnknown: true } : {}),
    ...(draft.pickupTime ? { pickupTime: draft.pickupTime } : {}),
    transportType:
      draft.transferArrangement === 'already-arranged'
        ? 'self-drive'
        : draft.transferArrangement === 'recommend'
        ? 'undecided'
        : 'none',
    ...(draft.transferArrangement === 'recommend' ? { transportQuotedSeparately: true } : {}),
    stayPreferences: [],
  };

  return {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim() || undefined,
    message: notes.trim(),
    source: 'holiday-builder',
    promotionId: preselectedPromotion?.id,
    promotionName: preselectedPromotion?.name,
    marketingConsent,
    website: '',
    startedAt: Date.now() - 1000,
    trip: trip as EnquiryInput['trip'],
  };
}
