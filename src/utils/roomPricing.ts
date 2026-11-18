import type { Currency } from '../types';
import type {
  AccommodationOffer,
  AccommodationRatePlan,
  DetailedAccommodation,
  RoomGalleryImage,
  RoomType,
} from '../types/content';
import { formatCurrencyAmount } from './currency';
import type { GuestSelection } from './enquiry';

export interface RoomAmenityOption {
  id: string;
  label: string;
  icon:
    | 'wind'
    | 'wifi'
    | 'tv'
    | 'bath'
    | 'shower'
    | 'sun'
    | 'waves'
    | 'trees'
    | 'wine'
    | 'utensils'
    | 'coffee'
    | 'lock'
    | 'laptop'
    | 'sparkles'
    | 'check';
}

export const ROOM_AMENITY_OPTIONS: RoomAmenityOption[] = [
  { id: 'air-conditioning', label: 'Air conditioning', icon: 'wind' },
  { id: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
  { id: 'television', label: 'Television', icon: 'tv' },
  { id: 'private-bathroom', label: 'Private bathroom', icon: 'bath' },
  { id: 'bathtub', label: 'Bathtub', icon: 'bath' },
  { id: 'shower', label: 'Shower', icon: 'shower' },
  { id: 'balcony', label: 'Balcony / Patio', icon: 'sun' },
  { id: 'river-view', label: 'River view', icon: 'waves' },
  { id: 'garden-view', label: 'Garden view', icon: 'trees' },
  { id: 'minibar', label: 'Minibar', icon: 'wine' },
  { id: 'kitchenette', label: 'Kitchenette / Full Kitchen', icon: 'utensils' },
  { id: 'private-pool', label: 'Private pool', icon: 'waves' },
  { id: 'tea-coffee', label: 'Tea and coffee facilities', icon: 'coffee' },
  { id: 'safe', label: 'Safe', icon: 'lock' },
  { id: 'workspace', label: 'Workspace', icon: 'laptop' },
];

export const ROOM_EXTRAS_PRESETS: string[] = [
  'Breakfast included',
  'Half-board meals',
  'Full-board meals',
  'Romantic room setup',
  'Private dining',
  'Airport transfers',
  'Complimentary activities',
  'Honeymoon extras',
  'Special family arrangements',
];

export function isPublishedRoomType(room: RoomType): boolean {
  return room.status !== 'draft' && room.status !== 'archived' && room.status !== 'trashed';
}

export function getPublishedRoomTypes(property: DetailedAccommodation): RoomType[] {
  return (property.roomTypes ?? []).filter(isPublishedRoomType);
}

export function getRoomWings(property: DetailedAccommodation): string[] {
  const seen = new Set<string>();
  const wings: string[] = [];
  for (const room of getPublishedRoomTypes(property)) {
    const w = (room.wing || '').trim();
    if (!w) continue;
    const k = w.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      wings.push(w);
    }
  }
  return wings;
}

export function isSingleEntireHomeProperty(property: DetailedAccommodation): boolean {
  const published = getPublishedRoomTypes(property);
  return published.length === 1 && Boolean(published[0].isEntireProperty);
}

export function formatPriceBasisLabel(basis?: string, customLabel?: string): string {
  if (customLabel && customLabel.trim()) return customLabel.trim();
  switch (basis) {
    case 'per_person':
    case 'per_person_sharing':
      return 'per person sharing / night';
    case 'per_person_single':
      return 'per person single / night';
    case 'per_unit':
      return 'per unit / night';
    case 'per_room':
      return 'per room / night';
    default:
      return basis ? basis.replace(/_/g, ' ') : 'per night';
  }
}

export function formatVisitorMarketLabel(market?: string, customLabel?: string): string {
  if (market === 'custom' && customLabel?.trim()) return customLabel.trim();
  switch (market) {
    case 'zimbabwe_resident':
      return 'Zimbabwe Resident';
    case 'sadc_resident':
      return 'SADC Resident';
    case 'international':
      return 'International Visitor';
    default:
      return customLabel?.trim() || 'All Markets';
  }
}

export function formatBoardBasisLabel(board?: string): string {
  switch (board) {
    case 'room_only':
      return 'Room Only';
    case 'self_catering':
      return 'Self-Catering';
    case 'bed_and_breakfast':
      return 'Bed & Breakfast Included';
    case 'half_board':
      return 'Half Board (Breakfast & Dinner)';
    case 'full_board':
      return 'Full Board (All Meals)';
    case 'all_inclusive':
      return 'Fully Inclusive';
    default:
      return '';
  }
}

export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isRatePlanValidForDates(
  rp: AccommodationRatePlan,
  options?: { referenceDate?: string; checkIn?: string; checkOut?: string }
): boolean {
  if (!rp || rp.isActive === false) return false;
  const refDate = options?.referenceDate || getTodayIsoDate();
  if (rp.validTo && /^\d{4}-\d{2}-\d{2}$/.test(rp.validTo) && rp.validTo < refDate) {
    return false;
  }
  const checkIn = options?.checkIn || '';
  const checkOut = options?.checkOut || '';
  if (checkIn && checkOut) {
    const startDt = parseIsoDate(checkIn);
    const endDt = parseIsoDate(checkOut);
    if (startDt && endDt && endDt.getTime() > startDt.getTime()) {
      const lastNight = toIsoUtc(new Date(endDt.getTime() - 86400000));
      if (rp.validFrom && checkIn < rp.validFrom) return false;
      if (rp.validTo && lastNight > rp.validTo) return false;
    }
  } else if (checkIn) {
    if (rp.validFrom && checkIn < rp.validFrom) return false;
    if (rp.validTo && checkIn > rp.validTo) return false;
  }
  return true;
}

export function isOfferWithinDateWindow(
  offer: AccommodationOffer,
  options?: { referenceDate?: string; checkIn?: string; checkOut?: string }
): boolean {
  if (!offer) return false;
  if (offer.status === 'draft' || offer.status === 'archived' || offer.status === 'trashed') {
    return false;
  }
  const refDate = options?.referenceDate || getTodayIsoDate();
  if (offer.validTo && /^\d{4}-\d{2}-\d{2}$/.test(offer.validTo) && offer.validTo < refDate) {
    return false;
  }
  const checkIn = options?.checkIn || '';
  const checkOut = options?.checkOut || '';
  if (checkIn && checkOut) {
    const startDt = parseIsoDate(checkIn);
    const endDt = parseIsoDate(checkOut);
    if (startDt && endDt && endDt.getTime() > startDt.getTime()) {
      const lastNight = toIsoUtc(new Date(endDt.getTime() - 86400000));
      if (offer.validFrom && /^\d{4}-\d{2}-\d{2}$/.test(offer.validFrom) && checkIn < offer.validFrom) {
        return false;
      }
      if (offer.validTo && /^\d{4}-\d{2}-\d{2}$/.test(offer.validTo) && lastNight > offer.validTo) {
        return false;
      }
    }
  } else if (checkIn) {
    if (offer.validFrom && /^\d{4}-\d{2}-\d{2}$/.test(offer.validFrom) && checkIn < offer.validFrom) {
      return false;
    }
    if (offer.validTo && /^\d{4}-\d{2}-\d{2}$/.test(offer.validTo) && checkIn > offer.validTo) {
      return false;
    }
  }
  return true;
}

export function getRoomRatePlans(
  room: RoomType,
  property?: DetailedAccommodation,
  options?: { referenceDate?: string; includeExpired?: boolean }
): AccommodationRatePlan[] {
  const byId = new Map<string, AccommodationRatePlan>();
  const roomId = room.id || '';
  const linkedIds = new Set(room.ratePlanIds ?? []);
  const includeExpired = options?.includeExpired === true;
  const refDate = options?.referenceDate || getTodayIsoDate();

  for (const rp of property?.ratePlans ?? []) {
    if (!rp || !rp.id || rp.isActive === false) continue;
    if (!includeExpired && rp.validTo && /^\d{4}-\d{2}-\d{2}$/.test(rp.validTo) && rp.validTo < refDate) {
      continue;
    }
    const applies =
      linkedIds.has(rp.id) ||
      (roomId !== '' && Array.isArray(rp.applicableUnitIds) && rp.applicableUnitIds.includes(roomId));
    if (applies) {
      byId.set(rp.id, rp);
    }
  }
  for (const rp of room.pricing?.ratePlans ?? []) {
    if (!rp || !rp.id || rp.isActive === false) continue;
    if (!includeExpired && rp.validTo && /^\d{4}-\d{2}-\d{2}$/.test(rp.validTo) && rp.validTo < refDate) {
      continue;
    }
    byId.set(rp.id, rp);
  }
  return Array.from(byId.values());
}

export function getPublishedPropertyOffers(
  property: DetailedAccommodation,
  unitId?: string,
  options?: { referenceDate?: string; checkIn?: string; checkOut?: string }
): AccommodationOffer[] {
  return (property.offers ?? []).filter((offer) => {
    if (!isOfferWithinDateWindow(offer, options)) return false;
    if (!unitId) return true;
    if (offer.applyToEntireProperty) return true;
    if (!offer.applicableUnitIds || offer.applicableUnitIds.length === 0) return true;
    return offer.applicableUnitIds.includes(unitId);
  });
}

export function getOfferDisplayBadge(
  offer: AccommodationOffer,
  currency: Currency = 'USD'
): string {
  if (offer.priceType === 'percentage_discount' && typeof offer.discountPercent === 'number' && offer.discountPercent > 0) {
    return `${offer.discountPercent}% Savings`;
  }
  if (offer.priceType === 'fixed_discount' && typeof offer.discountAmountUSD === 'number' && offer.discountAmountUSD > 0) {
    return `Save ${formatCurrencyAmount(offer.discountAmountUSD, currency)}`;
  }
  if (offer.priceType === 'fixed_offer' && typeof offer.offerPriceUSD === 'number' && offer.offerPriceUSD > 0) {
    return `Package From ${formatCurrencyAmount(offer.offerPriceUSD, currency)}`;
  }
  return 'Special Package';
}

export function getUnitAvailabilityBadge(
  room: RoomType
): { label: string; tone: 'emerald' | 'amber' | 'rose' } | null {
  if (room.availabilityStatus === 'on_request') {
    return { label: 'Available on Request', tone: 'amber' };
  }
  if (room.availabilityStatus === 'temporarily_unavailable') {
    return { label: 'Temporarily Unavailable', tone: 'rose' };
  }
  return null;
}

export function getRoomAmenityOption(idOrLabel: string): RoomAmenityOption | undefined {
  const norm = idOrLabel.trim().toLowerCase();
  return ROOM_AMENITY_OPTIONS.find(
    (opt) => opt.id === norm || opt.label.toLowerCase() === norm
  );
}

/**
 * Returns the unit's own amenities strictly scoped to this unit (never borrowed from other rooms).
 */
export function getRoomDisplayAmenities(room: RoomType): { id: string; label: string; icon: RoomAmenityOption['icon'] }[] {
  const seen = new Set<string>();
  const out: { id: string; label: string; icon: RoomAmenityOption['icon'] }[] = [];

  const pushItem = (raw: string) => {
    const clean = raw.trim();
    if (!clean) return;
    const match = getRoomAmenityOption(clean);
    const label = match ? match.label : clean;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      id: match?.id || key,
      label,
      icon: match?.icon || inferAmenityIcon(label),
    });
  };

  for (const a of room.amenities ?? []) pushItem(a);
  for (const ca of room.customAmenities ?? []) pushItem(ca);
  for (const f of room.features ?? []) pushItem(f);

  return out;
}

function inferAmenityIcon(label: string): RoomAmenityOption['icon'] {
  const low = label.toLowerCase();
  if (/wi-?fi|internet/.test(low)) return 'wifi';
  if (/air[\s-]?con|cooling|a\/c/.test(low)) return 'wind';
  if (/tv|television/.test(low)) return 'tv';
  if (/bathtub|bath\b|bathroom/.test(low)) return 'bath';
  if (/shower/.test(low)) return 'shower';
  if (/balcony|veranda|patio|deck/.test(low)) return 'sun';
  if (/river|pool|water/.test(low)) return 'waves';
  if (/garden|bush|view/.test(low)) return 'trees';
  if (/minibar|mini[\s-]?bar|bar\b/.test(low)) return 'wine';
  if (/kitchen|catering|dining/.test(low)) return 'utensils';
  if (/tea|coffee|nespresso/.test(low)) return 'coffee';
  if (/safe|vault/.test(low)) return 'lock';
  if (/desk|workspace/.test(low)) return 'laptop';
  return 'check';
}

export function getRoomGalleryImages(room: RoomType, fallbackUrl = ''): RoomGalleryImage[] {
  const out: RoomGalleryImage[] = [];
  const seen = new Set<string>();

  const pushImg = (url: string | undefined, alt?: string, caption?: string, id?: string) => {
    const clean = (url || '').trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    out.push({
      id: id || `room-img-${out.length + 1}`,
      url: clean,
      alt: alt || room.name,
      caption: caption || '',
    });
  };

  pushImg(room.imageUrl, room.name);
  for (const g of room.gallery ?? []) {
    pushImg(g.url, g.alt, g.caption, g.id);
  }
  for (const u of room.galleryImages ?? []) {
    pushImg(u, room.name);
  }
  if (out.length === 0 && fallbackUrl) {
    pushImg(fallbackUrl, room.name);
  }
  return out;
}

export function getRoomMaxGuests(room: RoomType): number | null {
  const cfg = room.occupancyConfig;
  if (cfg?.maxTotalGuests && cfg.maxTotalGuests > 0) {
    return cfg.maxTotalGuests;
  }
  if (cfg?.maxAdults && cfg.maxAdults > 0) {
    return cfg.maxAdults + Math.max(0, cfg.maxChildren ?? 0);
  }
  const occ = room.occupancy ?? '';
  const rangeMatch = occ.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    return Number(rangeMatch[2]) || null;
  }
  const nums = occ.match(/\d+/g);
  if (nums && nums.length > 0) {
    const sum = nums.reduce((acc, n) => acc + Number(n), 0);
    return sum > 0 ? sum : null;
  }
  return null;
}

export function getRoomCapacityLabel(room: RoomType): string {
  const cfg = room.occupancyConfig;
  if (cfg && (cfg.maxAdults || cfg.maxTotalGuests)) {
    const parts: string[] = [];
    if (cfg.maxTotalGuests) {
      parts.push(`Up to ${cfg.maxTotalGuests} ${cfg.maxTotalGuests === 1 ? 'Guest' : 'Guests'}`);
    }
    const detail: string[] = [];
    if (cfg.maxAdults) detail.push(`${cfg.maxAdults} ${cfg.maxAdults === 1 ? 'Adult' : 'Adults'}`);
    if (typeof cfg.maxChildren === 'number' && cfg.maxChildren > 0) {
      detail.push(`${cfg.maxChildren} ${cfg.maxChildren === 1 ? 'Child' : 'Children'}`);
    }
    if (parts.length > 0 && detail.length > 0) {
      return `${parts[0]} (${detail.join(' + ')})`;
    }
    return parts[0] || detail.join(' + ') || room.occupancy || '2 Guests';
  }
  return room.occupancy?.trim() || '2 Guests';
}

export function getRoomBedSummary(room: RoomType): string {
  const cfg = room.occupancyConfig;
  const parts: string[] = [];
  if (cfg?.bedrooms && cfg.bedrooms > 0) {
    parts.push(`${cfg.bedrooms} ${cfg.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`);
  }
  if (cfg?.beds && cfg.beds.length > 0) {
    const bedStrings = cfg.beds
      .filter((b) => b.type.trim() !== '' && b.quantity > 0)
      .map((b) => `${b.quantity} × ${b.type.trim()}`);
    if (bedStrings.length > 0) {
      parts.push(bedStrings.join(', '));
    }
  }
  if (cfg?.bathrooms && cfg.bathrooms > 0) {
    parts.push(`${cfg.bathrooms} ${cfg.bathrooms === 1 ? 'Bath' : 'Baths'}`);
  }
  return parts.join(' · ');
}

export function getRoomStartingPriceUSD(
  room: RoomType,
  property?: DetailedAccommodation
): number | null {
  const p = room.pricing;
  if (typeof p?.startingFromPriceUSD === 'number' && p.startingFromPriceUSD > 0) {
    return p.startingFromPriceUSD;
  }
  if (typeof p?.baseNightlyRateUSD === 'number' && p.baseNightlyRateUSD > 0) {
    return p.baseNightlyRateUSD;
  }
  const plans = getRoomRatePlans(room, property).filter(
    (rp) => typeof rp.amountUSD === 'number' && rp.amountUSD > 0 && rp.adultOrChildCategory !== 'child'
  );
  if (plans.length > 0) {
    return Math.min(...plans.map((rp) => Number(rp.amountUSD)));
  }
  return null;
}

export function getRoomPriceUnitLabel(room: RoomType): string {
  return formatPriceBasisLabel(room.pricing?.priceBasis);
}

function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toIsoUtc(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekdayKey(dt: Date): 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' {
  const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  return keys[dt.getUTCDay()];
}

export interface RoomQuoteResult {
  mode: 'quoted' | 'starting' | 'enquiry';
  nightlyAverageUSD: number | null;
  totalUSD: number | null;
  nights: number;
  startingPriceUSD: number | null;
  rateStatus: 'provisional' | 'confirmed';
  label: string;
  disclaimer: string;
  minStayNotice: string | null;
  validityNotice: string | null;
}

/**
 * Calculates a transparent stay quote strictly from the selected room's own pricing rules.
 * If dates are selected and any night lacks a valid pricing rule, falls outside rate validity,
 * or involves unpriced child/additional guest tiers, falls back honestly to "From US$X per night"
 * or "Price on enquiry" rather than guessing or bleeding rates from another room.
 */
export function calculateRoomStayQuote(params: {
  room: RoomType;
  property?: DetailedAccommodation;
  checkIn?: string;
  checkOut?: string;
  guests: GuestSelection;
  roomsCount?: number;
  mealPlanId?: string;
  visitorMarket?: string;
  ratePlanId?: string;
  referenceDate?: string;
  currency?: Currency;
}): RoomQuoteResult {
  const { room, property, checkIn = '', checkOut = '', guests, mealPlanId, visitorMarket, ratePlanId } = params;
  const roomsCount = Math.max(1, params.roomsCount ?? 1);
  const currency = params.currency || 'USD';
  const refDate = params.referenceDate || getTodayIsoDate();
  const pricing = room.pricing;
  const allLinkedPlansIncludingExpired = getRoomRatePlans(room, property, {
    referenceDate: refDate,
    includeExpired: true,
  });
  const linkedPlans = getRoomRatePlans(room, property, {
    referenceDate: refDate,
    includeExpired: false,
  });
  const activePlan =
    (ratePlanId ? allLinkedPlansIncludingExpired.find((rp) => rp.id === ratePlanId) : undefined) ||
    (visitorMarket
      ? linkedPlans.find(
          (rp) =>
            rp.visitorMarket === visitorMarket &&
            rp.adultOrChildCategory !== 'child' &&
            (!checkIn || !rp.validFrom || checkIn >= rp.validFrom) &&
            (!checkOut || !rp.validTo || checkOut <= rp.validTo)
        )
      : undefined);

  const isExplicitPlanExpired = Boolean(
    activePlan?.validTo && /^\d{4}-\d{2}-\d{2}$/.test(activePlan.validTo) && activePlan.validTo < refDate
  );

  const startingPriceUSD = !isExplicitPlanExpired && activePlan && typeof activePlan.amountUSD === 'number' && activePlan.amountUSD > 0
    ? activePlan.amountUSD
    : getRoomStartingPriceUSD(room, property);
  const effectiveStatus = activePlan?.rateStatus || pricing?.rateStatus;
  const rateStatus: 'provisional' | 'confirmed' = effectiveStatus === 'confirmed' ? 'confirmed' : 'provisional';

  const startingLabel = startingPriceUSD !== null
    ? `From ${formatCurrencyAmount(startingPriceUSD, currency)} / night`
    : 'Price on enquiry';

  const statusNote =
    rateStatus === 'confirmed'
      ? 'Subject to live room availability — enquiry only, not a confirmed booking.'
      : 'Provisional guide rate — final availability and rates confirmed by our specialists.';

  if (ratePlanId && activePlan && isExplicitPlanExpired) {
    return {
      mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
      nightlyAverageUSD: startingPriceUSD,
      totalUSD: null,
      nights: 0,
      startingPriceUSD,
      rateStatus,
      label: startingLabel,
      disclaimer: statusNote,
      minStayNotice: null,
      validityNotice: `The "${activePlan.internalRateName || formatVisitorMarketLabel(activePlan.visitorMarket, activePlan.customMarketLabel)}" rate plan expired on ${activePlan.validTo}; selected dates require an active rate plan or custom confirmation.`,
    };
  }

  const startDt = parseIsoDate(checkIn);
  const endDt = parseIsoDate(checkOut);
  if (!startDt || !endDt || endDt.getTime() <= startDt.getTime()) {
    return {
      mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
      nightlyAverageUSD: startingPriceUSD,
      totalUSD: null,
      nights: 0,
      startingPriceUSD,
      rateStatus,
      label: startingLabel,
      disclaimer: statusNote,
      minStayNotice: null,
      validityNotice: null,
    };
  }

  const nights = Math.round((endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60 * 24));
  const checkOutLastNight = new Date(endDt.getTime() - 86400000);
  const lastNightIso = toIsoUtc(checkOutLastNight);

  // Enforce validity dates on explicitly selected rate plans BEFORE pricing nights
  if (activePlan && (ratePlanId || visitorMarket)) {
    const planLabel = activePlan.internalRateName || formatVisitorMarketLabel(activePlan.visitorMarket, activePlan.customMarketLabel);
    if (activePlan.validFrom && checkIn < activePlan.validFrom) {
      return {
        mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
        nightlyAverageUSD: startingPriceUSD,
        totalUSD: null,
        nights,
        startingPriceUSD,
        rateStatus,
        label: startingLabel,
        disclaimer: statusNote,
        minStayNotice: null,
        validityNotice: `Rate plan "${planLabel}" begins ${activePlan.validFrom}; selected dates fall outside its validity window.`,
      };
    }
    if (activePlan.validTo && lastNightIso > activePlan.validTo) {
      return {
        mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
        nightlyAverageUSD: startingPriceUSD,
        totalUSD: null,
        nights,
        startingPriceUSD,
        rateStatus,
        label: startingLabel,
        disclaimer: statusNote,
        minStayNotice: null,
        validityNotice: `Rate plan "${planLabel}" is valid until ${activePlan.validTo}; selected dates fall outside its validity window.`,
      };
    }
  }

  // Check validity period if configured on this room
  if (pricing?.rateValidFrom && checkIn < pricing.rateValidFrom) {
    return {
      mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
      nightlyAverageUSD: startingPriceUSD,
      totalUSD: null,
      nights,
      startingPriceUSD,
      rateStatus,
      label: startingLabel,
      disclaimer: statusNote,
      minStayNotice: null,
      validityNotice: `Published rates begin ${pricing.rateValidFrom}; selected dates require custom confirmation.`,
    };
  }
  if (pricing?.rateValidTo && lastNightIso > pricing.rateValidTo) {
    return {
      mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
      nightlyAverageUSD: startingPriceUSD,
      totalUSD: null,
      nights,
      startingPriceUSD,
      rateStatus,
      label: startingLabel,
      disclaimer: statusNote,
      minStayNotice: null,
      validityNotice: `Published rates are valid until ${pricing.rateValidTo}; selected dates require custom confirmation.`,
    };
  }

  const weekendDays = pricing?.weekendDays && pricing.weekendDays.length > 0
    ? pricing.weekendDays
    : (['fri', 'sat'] as const);

  let effectiveMinStay = pricing?.minStayNights ?? room.policies?.minStayNights ?? null;
  let roomTotal = 0;

  if (ratePlanId && activePlan) {
    const chosenBasis = activePlan.priceBasis || 'per_room';
    if (
      !['per_room', 'per_unit', 'per_person', 'per_person_sharing', 'per_person_single'].includes(
        chosenBasis
      )
    ) {
      return {
        mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
        nightlyAverageUSD: startingPriceUSD,
        totalUSD: null,
        nights,
        startingPriceUSD,
        rateStatus,
        label: startingLabel,
        disclaimer: statusNote,
        minStayNotice: null,
        validityNotice: 'This rate plan uses a bespoke basis confirmed individually upon enquiry.',
      };
    }
  }

  for (let i = 0; i < nights; i++) {
    const cur = new Date(startDt.getTime() + i * 86400000);
    const iso = toIsoUtc(cur);
    const wk = getWeekdayKey(cur);
    const isWeekend = (weekendDays as readonly string[]).includes(wk);

    // Explicit ratePlanId or visitorMarket selection overrides unit seasonal/base fallback ONLY within plan validity dates
    if (
      (ratePlanId || visitorMarket) &&
      activePlan &&
      typeof activePlan.amountUSD === 'number' &&
      activePlan.amountUSD > 0 &&
      (!activePlan.validFrom || iso >= activePlan.validFrom) &&
      (!activePlan.validTo || iso <= activePlan.validTo)
    ) {
      if (activePlan.minStayNights && (!effectiveMinStay || activePlan.minStayNights > effectiveMinStay)) {
        effectiveMinStay = activePlan.minStayNights;
      }
      roomTotal += activePlan.amountUSD;
      continue;
    }

    // 1. Date-specific override
    const dateOverride = pricing?.dateSpecificRates?.find((dr) => dr.isActive !== false && dr.date === iso);
    if (dateOverride && dateOverride.nightlyRateUSD > 0) {
      roomTotal += dateOverride.nightlyRateUSD;
      continue;
    }

    // 2. Seasonal rate matching date
    const season = pricing?.seasonalRates?.find(
      (sr) => sr.isActive !== false && sr.startDate && sr.endDate && iso >= sr.startDate && iso <= sr.endDate
    );
    if (season) {
      if (season.minStayNights && (!effectiveMinStay || season.minStayNights > effectiveMinStay)) {
        effectiveMinStay = season.minStayNights;
      }
      const rate = isWeekend && typeof season.weekendRateUSD === 'number' && season.weekendRateUSD > 0
        ? season.weekendRateUSD
        : season.nightlyRateUSD;
      if (rate > 0) {
        roomTotal += rate;
        continue;
      }
    }

    // 3. Matching Visitor Market / Linked Rate Plan (if valid & compatible basis)
    const matchingPlanForDate = linkedPlans.find(
      (rp) =>
        typeof rp.amountUSD === 'number' &&
        rp.amountUSD > 0 &&
        rp.adultOrChildCategory !== 'child' &&
        (!ratePlanId || rp.id === ratePlanId) &&
        (!visitorMarket || rp.visitorMarket === visitorMarket) &&
        (!rp.validFrom || iso >= rp.validFrom) &&
        (!rp.validTo || iso <= rp.validTo)
    );
    if (matchingPlanForDate && typeof matchingPlanForDate.amountUSD === 'number') {
      const rpBasis = matchingPlanForDate.priceBasis || 'per_room';
      if (
        !['per_room', 'per_unit', 'per_person', 'per_person_sharing', 'per_person_single'].includes(
          rpBasis
        )
      ) {
        return {
          mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
          nightlyAverageUSD: startingPriceUSD,
          totalUSD: null,
          nights,
          startingPriceUSD,
          rateStatus,
          label: startingLabel,
          disclaimer: statusNote,
          minStayNotice: null,
          validityNotice: 'This rate plan uses a bespoke basis confirmed individually upon enquiry.',
        };
      }
      if (matchingPlanForDate.minStayNights && (!effectiveMinStay || matchingPlanForDate.minStayNights > effectiveMinStay)) {
        effectiveMinStay = matchingPlanForDate.minStayNights;
      }
      roomTotal += matchingPlanForDate.amountUSD;
      continue;
    }

    // 4. Base nightly rate (only if explicitly configured > 0)
    if (typeof pricing?.baseNightlyRateUSD === 'number' && pricing.baseNightlyRateUSD > 0) {
      const rate = isWeekend && typeof pricing.weekendRateUSD === 'number' && pricing.weekendRateUSD > 0
        ? pricing.weekendRateUSD
        : pricing.baseNightlyRateUSD;
      roomTotal += rate;
      continue;
    }

    // Missing valid rule for this date -> do NOT guess!
    return {
      mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
      nightlyAverageUSD: startingPriceUSD,
      totalUSD: null,
      nights,
      startingPriceUSD,
      rateStatus,
      label: startingLabel,
      disclaimer: statusNote,
      minStayNotice:
        effectiveMinStay && nights < effectiveMinStay
          ? `Minimum stay of ${effectiveMinStay} nights applies.`
          : null,
      validityNotice: 'One or more selected dates require seasonal rate confirmation.',
    };
  }

  const minStayNotice =
    effectiveMinStay && nights < effectiveMinStay
      ? `Minimum stay of ${effectiveMinStay} nights applies (selected: ${nights} ${nights === 1 ? 'night' : 'nights'}).`
      : null;

  const basis = activePlan?.priceBasis || pricing?.priceBasis || 'per_room';
  const adults = Math.max(1, guests.adults);
  const children = guests.children || [];
  let totalUSD: number;

  if (basis === 'per_person_sharing' && adults === 1 && roomsCount === 1) {
    return {
      mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
      nightlyAverageUSD: startingPriceUSD,
      totalUSD: null,
      nights,
      startingPriceUSD,
      rateStatus,
      label: startingLabel,
      disclaimer: 'Single-occupancy supplement applies on per-person sharing rates — confirmed on enquiry.',
      minStayNotice,
      validityNotice: null,
    };
  }

  if (basis === 'per_person' || basis === 'per_person_sharing' || basis === 'per_person_single') {
    const avgNightly = roomTotal / nights;
    let perNightGuests = adults * avgNightly;
    for (const c of children) {
      if (c.ageCategory === 'under-11') {
        if (typeof pricing?.childRateUSD === 'number' && pricing.childRateUSD >= 0) {
          perNightGuests += pricing.childRateUSD;
        } else {
          return {
            mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
            nightlyAverageUSD: startingPriceUSD,
            totalUSD: null,
            nights,
            startingPriceUSD,
            rateStatus,
            label: startingLabel,
            disclaimer: 'Child rates for selected ages are confirmed on enquiry.',
            minStayNotice,
            validityNotice: null,
          };
        }
      } else {
        const r11 =
          typeof pricing?.childRate11PlusUSD === 'number' && pricing.childRate11PlusUSD >= 0
            ? pricing.childRate11PlusUSD
            : typeof pricing?.childRateUSD === 'number' && pricing.childRateUSD >= 0
            ? pricing.childRateUSD
            : avgNightly;
        perNightGuests += r11;
      }
    }
    totalUSD = perNightGuests * nights;
  } else {
    // per_room or per_unit
    totalUSD = roomTotal * roomsCount;

    const baseOccupancy = pricing?.baseOccupancyAdults ?? room.occupancyConfig?.maxAdults ?? 2;
    const extraAdults = Math.max(0, adults - baseOccupancy * roomsCount);
    if (extraAdults > 0) {
      if (typeof pricing?.additionalGuestRateUSD === 'number' && pricing.additionalGuestRateUSD >= 0) {
        totalUSD += extraAdults * pricing.additionalGuestRateUSD * nights;
      } else {
        return {
          mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
          nightlyAverageUSD: startingPriceUSD,
          totalUSD: null,
          nights,
          startingPriceUSD,
          rateStatus,
          label: startingLabel,
          disclaimer: 'Additional adult guest rates are confirmed on enquiry.',
          minStayNotice,
          validityNotice: null,
        };
      }
    }

    if (children.length > 0) {
      for (const c of children) {
        if (c.ageCategory === 'under-11') {
          if (typeof pricing?.childRateUSD === 'number' && pricing.childRateUSD >= 0) {
            totalUSD += pricing.childRateUSD * nights;
          } else {
            return {
              mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
              nightlyAverageUSD: startingPriceUSD,
              totalUSD: null,
              nights,
              startingPriceUSD,
              rateStatus,
              label: startingLabel,
              disclaimer: 'Child rates for selected ages are confirmed on enquiry.',
              minStayNotice,
              validityNotice: null,
            };
          }
        } else {
          if (typeof pricing?.childRate11PlusUSD === 'number' && pricing.childRate11PlusUSD >= 0) {
            totalUSD += pricing.childRate11PlusUSD * nights;
          } else if (typeof pricing?.childRateUSD === 'number' && pricing.childRateUSD >= 0) {
            totalUSD += pricing.childRateUSD * nights;
          } else {
            return {
              mode: startingPriceUSD !== null ? 'starting' : 'enquiry',
              nightlyAverageUSD: startingPriceUSD,
              totalUSD: null,
              nights,
              startingPriceUSD,
              rateStatus,
              label: startingLabel,
              disclaimer: 'Child rates for selected ages are confirmed on enquiry.',
              minStayNotice,
              validityNotice: null,
            };
          }
        }
      }
    }
  }

  // Meal plan supplement
  if (mealPlanId && pricing?.mealPlanRates?.length) {
    const plan = pricing.mealPlanRates.find((m) => m.isActive !== false && (m.id === mealPlanId || m.name === mealPlanId));
    if (plan && plan.supplementPerPersonPerNightUSD > 0) {
      const multiplier =
        plan.pricingType === 'per_unit_per_night' ? roomsCount : adults + children.length;
      totalUSD += plan.supplementPerPersonPerNightUSD * multiplier * nights;
    }
  }

  const roundedTotal = Math.round(totalUSD);
  const nightlyAvg = Math.round(roundedTotal / nights);
  return {
    mode: 'quoted',
    nightlyAverageUSD: nightlyAvg,
    totalUSD: roundedTotal,
    nights,
    startingPriceUSD,
    rateStatus,
    label: `${formatCurrencyAmount(roundedTotal, currency)} ${currency} (${nights} ${nights === 1 ? 'night' : 'nights'})`,
    disclaimer: statusNote,
    minStayNotice,
    validityNotice: null,
  };
}
