import type { DetailedAccommodation } from '../types/content';

export type AccommodationCategoryId = 'all' | 'hotels' | 'lodges' | 'guest-houses' | 'apartments';
export type CanonicalAccommodationCategory = Exclude<AccommodationCategoryId, 'all'>;
export type AmenityId = 'wifi' | 'pool' | 'ac' | 'self-catering' | 'family-friendly' | 'parking';
export type AccommodationSortOption = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc';

export interface AccommodationCategoryDefinition {
  id: CanonicalAccommodationCategory;
  label: string;
  singular: string;
  description: string;
}

export const ACCOMMODATION_CATEGORY_DEFS: AccommodationCategoryDefinition[] = [
  {
    id: 'hotels',
    label: 'Hotels',
    singular: 'Hotel',
    description: 'Full-service boutique and heritage hotels with on-site dining, concierge desks and effortless access to the Falls.',
  },
  {
    id: 'lodges',
    label: 'Lodges',
    singular: 'Lodge',
    description: 'Safari and Zambezi riverfront lodges offering waterhole wildlife views, sunset decks and immersive wilderness comfort.',
  },
  {
    id: 'guest-houses',
    label: 'Guest Houses',
    singular: 'Guest House',
    description: 'Intimate, personally hosted guest lodges and boutique residences set in tranquil Victoria Falls suburbs.',
  },
  {
    id: 'apartments',
    label: 'Apartments',
    singular: 'Apartment',
    description: 'Self-catering multi-bedroom units and apartments with kitchens, private patios and flexible family living space.',
  },
];

export const AMENITY_DEFINITIONS: { id: AmenityId; label: string }[] = [
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'pool', label: 'Swimming Pool' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'self-catering', label: 'Self-Catering' },
  { id: 'family-friendly', label: 'Family Friendly' },
  { id: 'parking', label: 'Parking' },
];

export interface AccommodationFilters {
  category: AccommodationCategoryId;
  search: string;
  minPriceUSD?: number | null;
  maxPriceUSD?: number | null;
  minGuests?: number | null;
  amenities: AmenityId[];
  sortBy: AccommodationSortOption;
}

/**
 * Maps a property's WordPress category or existing catalog category into one of the four canonical categories.
 */
export function getAccommodationCategoryId(property: DetailedAccommodation): CanonicalAccommodationCategory {
  if (property.accommodationCategory) {
    return property.accommodationCategory;
  }

  const raw = property.category.toLowerCase().trim();
  if (raw === 'boutique hotel' || raw === 'hotel' || raw === 'resort' || raw === 'hotels') {
    return 'hotels';
  }
  if (raw === 'luxury lodge' || raw === 'safari lodge' || raw === 'lodge' || raw === 'lodges') {
    return 'lodges';
  }
  if (raw === 'guest lodge' || raw === 'guest house' || raw === 'guest houses' || raw === 'b&b') {
    return 'guest-houses';
  }
  if (raw === 'self-catering' || raw === 'apartment' || raw === 'apartments' || raw === 'villa') {
    return 'apartments';
  }

  // Fallback inspection of filterTags if a custom category string is supplied
  if (property.filterTags.includes('self-catering')) return 'apartments';
  if (property.filterTags.includes('safari-lodges') || property.filterTags.includes('luxury-lodges')) return 'lodges';
  if (property.filterTags.includes('boutique-hotels')) return 'hotels';
  return 'guest-houses';
}

export function getAccommodationCategoryLabel(property: DetailedAccommodation): string {
  const id = getAccommodationCategoryId(property);
  return ACCOMMODATION_CATEGORY_DEFS.find((c) => c.id === id)?.label ?? property.category;
}

export function getAccommodationCategorySingular(property: DetailedAccommodation): string {
  const id = getAccommodationCategoryId(property);
  return ACCOMMODATION_CATEGORY_DEFS.find((c) => c.id === id)?.singular ?? property.category;
}

export function parseCategorySlugFromSearch(search: string): AccommodationCategoryId {
  const params = new URLSearchParams(search);
  const raw = params.get('category')?.toLowerCase().trim();
  if (raw === 'hotels' || raw === 'lodges' || raw === 'guest-houses' || raw === 'apartments') {
    return raw;
  }
  return 'all';
}

export interface AdvisorPreferenceInput {
  travellerGroup: string;
  budgetLevel: string;
  priorities: string[];
  style: string;
}

/**
 * Translates Stay Advisor answers into directory filter selections so advisor
 * recommendations stay synchronized with the main accommodation filters.
 */
export function advisorAnswersToFilters(answers: AdvisorPreferenceInput): Partial<AccommodationFilters> {
  const styleToCategory: Record<string, AccommodationCategoryId> = {
    hotel: 'hotels',
    'safari-lodge': 'lodges',
    guesthouse: 'guest-houses',
    'self-catering': 'apartments',
  };

  let minPriceUSD: number | null = null;
  let maxPriceUSD: number | null = null;
  if (answers.budgetLevel === 'value') {
    maxPriceUSD = 220;
  } else if (answers.budgetLevel === 'comfortable') {
    minPriceUSD = 150;
    maxPriceUSD = 360;
  } else if (answers.budgetLevel === 'premium' || answers.budgetLevel === 'luxury' || answers.budgetLevel === 'ultra-luxury') {
    minPriceUSD = 300;
  }

  const amenities: AmenityId[] = [];
  if (answers.travellerGroup === 'family' || answers.travellerGroup === 'multi-gen') {
    amenities.push('family-friendly');
  }
  if (answers.style === 'self-catering') {
    amenities.push('self-catering');
  }

  const minGuests =
    answers.travellerGroup === 'family' || answers.travellerGroup === 'multi-gen' || answers.travellerGroup === 'friends'
      ? 4
      : null;

  return {
    category: styleToCategory[answers.style] ?? 'all',
    minPriceUSD,
    maxPriceUSD,
    minGuests,
    amenities: Array.from(new Set(amenities)),
  };
}

/**
 * Parses sleeping capacity from explicit maxGuests or roomTypes occupancy strings.
 * Returns null when no capacity figure is present in the property data.
 */
export function getMaxGuestCapacity(property: DetailedAccommodation): number | null {
  if (typeof property.maxGuests === 'number' && property.maxGuests > 0) {
    return property.maxGuests;
  }

  let maxCap = 0;
  for (const room of property.roomTypes ?? []) {
    const occ = room.occupancy ?? '';
    // Handle patterns like "4-6 Guests"
    const rangeMatch = occ.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (rangeMatch) {
      const upper = Number(rangeMatch[2]);
      if (upper > maxCap) maxCap = upper;
      continue;
    }

    // Handle additive patterns like "2 Adults + 2 Children" or single numbers like "2 Adults"
    const nums = occ.match(/\d+/g);
    if (nums && nums.length > 0) {
      const sum = nums.reduce((acc, n) => acc + Number(n), 0);
      if (sum > maxCap) maxCap = sum;
    }
  }

  return maxCap > 0 ? maxCap : null;
}

/**
 * Derives supported amenity IDs strictly from structured property fields without fabricating missing details.
 */
export function getPropertyAmenities(property: DetailedAccommodation): AmenityId[] {
  const found = new Set<AmenityId>();
  const explicit = (property.amenities ?? []).map((a) => a.toLowerCase());
  const facilityNames = (property.facilities ?? []).map((f) => f.name.toLowerCase());
  const roomFeatures = (property.roomTypes ?? []).flatMap((r) => r.features.map((f) => f.toLowerCase()));
  const textPool = [...explicit, ...facilityNames, ...roomFeatures];

  const hasText = (pattern: RegExp) => textPool.some((item) => pattern.test(item));

  if (
    explicit.includes('wifi') ||
    hasText(/wi-?fi/) ||
    (property.atAGlance?.wifi && /wi-?fi/i.test(property.atAGlance.wifi) && !/^no\b/i.test(property.atAGlance.wifi))
  ) {
    found.add('wifi');
  }

  if (
    explicit.includes('pool') ||
    explicit.includes('swimming-pool') ||
    hasText(/\bpool\b/) ||
    (property.atAGlance?.pool && /\bpool\b/i.test(property.atAGlance.pool) && !/^no\b/i.test(property.atAGlance.pool))
  ) {
    found.add('pool');
  }

  if (
    explicit.includes('ac') ||
    explicit.includes('air-conditioning') ||
    hasText(/air[\s-]?condition|air[\s-]?con/)
  ) {
    found.add('ac');
  }

  if (
    explicit.includes('self-catering') ||
    property.category === 'Self-Catering' ||
    property.filterTags.includes('self-catering') ||
    hasText(/self[\s-]?catering|full kitchen|kitchenette/)
  ) {
    found.add('self-catering');
  }

  if (
    explicit.includes('family-friendly') ||
    property.filterTags.includes('family-friendly') ||
    hasText(/family|children|interconnecting|playground/)
  ) {
    found.add('family-friendly');
  }

  if (
    explicit.includes('parking') ||
    hasText(/\bparking\b/) ||
    (property.locationInfo?.address && /\bparking\b/i.test(property.locationInfo.address))
  ) {
    found.add('parking');
  }

  return Array.from(found);
}

/**
 * Returns up to 3 displayable key amenities supported by the property record.
 */
export function getKeyAmenitiesForCard(property: DetailedAccommodation, max = 3): string[] {
  const ids = getPropertyAmenities(property);
  return ids
    .slice(0, max)
    .map((id) => AMENITY_DEFINITIONS.find((def) => def.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

export function getPriceUnitLabel(property: DetailedAccommodation): string {
  return property.priceUnit?.trim() || 'per night';
}

export function isPublishedAccommodation(property: DetailedAccommodation): boolean {
  return property.publicationStatus !== 'draft' && property.publicationStatus !== 'archived';
}

export function filterAndSortAccommodations(
  accommodations: DetailedAccommodation[],
  filters: AccommodationFilters
): DetailedAccommodation[] {
  const query = filters.search.trim().toLowerCase();

  const filtered = accommodations.filter((property) => {
    if (!isPublishedAccommodation(property)) return false;

    if (filters.category !== 'all' && getAccommodationCategoryId(property) !== filters.category) {
      return false;
    }

    if (query) {
      const categoryLabel = getAccommodationCategoryLabel(property).toLowerCase();
      const searchableFields = [
        property.name,
        property.category,
        categoryLabel,
        property.location,
        property.locationInfo?.address ?? '',
        property.distanceFromFalls,
        property.tagline,
        property.shortDescription,
        property.editorialOverview,
        ...(property.facilities ?? []).map((f) => f.name),
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableFields.includes(query)) {
        return false;
      }
    }

    if (typeof filters.minPriceUSD === 'number' && !Number.isNaN(filters.minPriceUSD)) {
      if (property.priceFromUSD < filters.minPriceUSD) return false;
    }

    if (typeof filters.maxPriceUSD === 'number' && !Number.isNaN(filters.maxPriceUSD)) {
      if (property.priceFromUSD > filters.maxPriceUSD) return false;
    }

    if (typeof filters.minGuests === 'number' && filters.minGuests > 0) {
      const cap = getMaxGuestCapacity(property);
      if (cap === null || cap < filters.minGuests) return false;
    }

    if (filters.amenities.length > 0) {
      const propAmenities = getPropertyAmenities(property);
      const hasAll = filters.amenities.every((a) => propAmenities.includes(a));
      if (!hasAll) return false;
    }

    return true;
  });

  if (filters.sortBy === 'price-asc') {
    return [...filtered].sort((a, b) => a.priceFromUSD - b.priceFromUSD);
  }
  if (filters.sortBy === 'price-desc') {
    return [...filtered].sort((a, b) => b.priceFromUSD - a.priceFromUSD);
  }
  if (filters.sortBy === 'name-asc') {
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  return filtered;
}
