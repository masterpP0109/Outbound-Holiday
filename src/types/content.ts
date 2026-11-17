export interface RoomBedConfig {
  type: string;
  quantity: number;
}

export interface RoomOccupancyConfig {
  maxAdults?: number;
  maxChildren?: number;
  maxTotalGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: RoomBedConfig[];
  extraBedAvailable?: boolean;
  extraBedNotes?: string;
  childAgePolicy?: string;
  additionalGuestChargeNote?: string;
  interleadingInfo?: string;
}

export type VisitorMarketCode = 'international' | 'zimbabwe_resident' | 'sadc_resident' | 'custom';
export type BoardBasisCode = 'room_only' | 'self_catering' | 'bed_and_breakfast' | 'half_board' | 'full_board' | 'all_inclusive';

export interface AccommodationRatePlan {
  id: string;
  internalRateName: string;
  validFrom?: string;
  validTo?: string;
  amountUSD?: number | null;
  priceBasis?: string;
  customBasisLabel?: string;
  visitorMarket?: VisitorMarketCode;
  customMarketLabel?: string;
  adultOrChildCategory?: 'adult' | 'child' | 'all';
  boardBasis?: BoardBasisCode;
  maxOccupancy?: number | null;
  minStayNights?: number | null;
  inclusions?: string[];
  exclusions?: string[];
  rateStatus?: 'provisional' | 'confirmed';
  lastConfirmedDate?: string;
  applicableUnitIds?: string[];
  isActive?: boolean;
}

export interface AccommodationOffer {
  id: string;
  title: string;
  offerCategory?: 'special_offer' | 'honeymoon_package' | 'seasonal_promotion' | 'meal_plan' | 'added_value';
  description?: string;
  galleryImages?: string[];
  includedServices?: string[];
  applicableUnitIds?: string[];
  applyToEntireProperty?: boolean;
  applicableRatePlanIds?: string[];
  validFrom?: string;
  validTo?: string;
  priceType?: 'fixed_offer' | 'percentage_discount' | 'fixed_discount' | 'added_value';
  offerPriceUSD?: number | null;
  discountPercent?: number | null;
  discountAmountUSD?: number | null;
  guestRequirements?: string;
  conditions?: string;
  status?: 'published' | 'draft' | 'archived' | 'trashed';
  ctaLabel?: string;
  featured?: boolean;
}

export interface RoomSeasonalRate {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  nightlyRateUSD: number;
  weekendRateUSD?: number | null;
  minStayNights?: number | null;
  isActive?: boolean;
}

export interface RoomDateRate {
  id: string;
  date: string;
  label?: string;
  nightlyRateUSD: number;
  isActive?: boolean;
}

export interface RoomMealPlanRate {
  id: string;
  name: string;
  supplementPerPersonPerNightUSD: number;
  pricingType?: 'per_person_per_night' | 'per_unit_per_night';
  description?: string;
  isActive?: boolean;
}

export interface RoomPricing {
  baseNightlyRateUSD?: number | null;
  startingFromPriceUSD?: number | null;
  weekendRateUSD?: number | null;
  weekendDays?: ('fri' | 'sat' | 'sun')[];
  baseOccupancyAdults?: number | null;
  additionalGuestRateUSD?: number | null;
  childRateUSD?: number | null;
  childRate11PlusUSD?: number | null;
  minStayNights?: number | null;
  rateValidFrom?: string;
  rateValidTo?: string;
  rateStatus?: 'provisional' | 'confirmed';
  priceBasis?: 'per_room' | 'per_unit' | 'per_person' | 'per_person_sharing' | 'per_person_single';
  seasonalRates?: RoomSeasonalRate[];
  dateSpecificRates?: RoomDateRate[];
  mealPlanRates?: RoomMealPlanRate[];
  ratePlans?: AccommodationRatePlan[];
  inclusions?: string[];
  exclusions?: string[];
}

export interface RoomGalleryImage {
  id?: string;
  url: string;
  alt?: string;
  caption?: string;
}

export interface RoomPolicies {
  minStayNights?: number | null;
  checkInRestrictions?: string;
  cancellationPolicy?: string;
  extraPersonPolicy?: string;
  accessibilityInfo?: string;
  otherRestrictions?: string;
}

export interface RoomType {
  id?: string;
  name: string;
  occupancy: string;
  description: string;
  shortDescription?: string;
  unitCategory?: string;
  wing?: string;
  isEntireProperty?: boolean;
  sizeSqm?: number | null;
  unitCount?: number | null;
  featured?: boolean;
  status?: 'published' | 'draft' | 'archived' | 'trashed';
  availabilityStatus?: 'available' | 'on_request' | 'temporarily_unavailable';
  customCtaLabel?: string;
  imageUrl: string;
  gallery?: RoomGalleryImage[];
  galleryImages?: string[];
  features: string[];
  amenities?: string[];
  customAmenities?: string[];
  accessibilityFeatures?: string[];
  inclusions?: string[];
  ratePlanIds?: string[];
  occupancyConfig?: RoomOccupancyConfig;
  pricing?: RoomPricing;
  policies?: RoomPolicies;
}

export interface PropertyPolicies {
  checkInPolicy?: string;
  checkOutPolicy?: string;
  cancellationPolicy?: string;
  childPolicy?: string;
  petPolicy?: string;
  generalNotes?: string;
}

export interface PropertyEnquirySettings {
  enableWhatsApp?: boolean;
  enableEmail?: boolean;
  customEnquiryNote?: string;
  contactEmail?: string;
  whatsappNumber?: string;
  contactPhone?: string;
}

export interface DetailedAccommodation {
  id: string;
  slug: string;
  name: string;
  category: string;
  accommodationCategory?: 'hotels' | 'lodges' | 'guest-houses' | 'apartments';
  badge?: 'Luxury' | 'Family Favourite' | 'Romantic' | 'Best Value' | 'Walking Distance' | 'Boutique';
  rating: number;
  reviewCount: number;
  location: string;
  distanceFromFalls: string;
  airportDistance: string;
  priceFromUSD: number;
  currency?: string;
  priceUnit?: string;
  maxGuests?: number;
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  publicationStatus?: 'published' | 'draft' | 'archived';
  roomSectionHeading?: string;
  roomSectionSubtitle?: string;
  policies?: PropertyPolicies;
  enquirySettings?: PropertyEnquirySettings;
  ratePlans?: AccommodationRatePlan[];
  offers?: AccommodationOffer[];
  heroImage: string;
  galleryImages: string[];
  tagline: string;
  shortDescription: string;
  editorialOverview: string;
  whyWeRecommend: string;
  filterTags: ('luxury-lodges' | 'boutique-hotels' | 'family-friendly' | 'romantic-escapes' | 'best-value' | 'safari-lodges' | 'self-catering' | 'walking-distance')[];

  atAGlance: {
    type: string;
    starRating: string;
    bestFor: string;
    distanceFromFalls: string;
    pool: string;
    restaurant: string;
    wifi: string;
    familyFriendly: string;
    transfers: string;
    roomTypesSummary: string;
  };

  roomTypes: RoomType[];

  facilities: {
    name: string;
    category: string;
  }[];

  locationInfo: {
    address: string;
    distanceToFalls: string;
    distanceToAirport: string;
    nearbyAttractions: string[];
    nearbyRestaurants: string[];
    departurePoints: string;
  };

  nearbyExperienceIds: string[];
  relatedPropertyIds: string[];
}
export interface ExperienceStep {
  stepNumber: number;
  time?: string;
  title: string;
  description: string;
  highlight?: string;
  image?: string;
}
export interface Experience {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  badge?: string;
  categories: Array<'featured' | 'first-visit' | 'wildlife' | 'adventure' | 'river' | 'culture' | 'day-trips'>;
  shortDescription: string;
  fullOverview: string;
  whyWeRecommend: string;
  duration: string;
  location?: string;
  fromPrice: string;
  priceAmount: number;
  featuredImage: string;
  galleryImages: string[];
  highlights: string[];
  whatsIncluded: string[];
  whatsExcluded?: string[];
  goodToKnow: string[];
  steps?: ExperienceStep[];
  localExpertTip?: string;
  faqs: { q: string; a: string }[];
  relatedIds: string[];
}
export interface DetailedItineraryDay {
  day: string;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  included: string[];
  optionalUpgrade?: string;
  travelNotes?: string;
  image?: string;
}
export interface DetailedPackage {
  id: string;
  slug: string;
  title: string;
  badge: 'Best Value' | 'Luxury' | 'Family Favourites' | 'Adventure' | 'Signature' | 'Popular';
  category: 'value' | 'luxury' | 'family' | 'adventure' | 'safari' | 'first-visit' | 'couples';
  categories: Array<'first-visit' | 'couples' | 'families' | 'luxury' | 'adventure' | 'safari' | 'value'>;
  tagline: string;
  description: string;
  priceUSD: number;
  duration: string;
  travellerType: string;
  imageUrl: string;
  galleryImages: string[];

  // Editorial additions
  storyIntroduction: string;
  whyWeRecommend: string;

  whoIsThisFor: {
    perfectIf: string[];
    considerOthersIf: string[];
    alternativeSlug?: string;
    alternativeTitle?: string;
  };

  highlightsMeta: {
    accommodation: string;
    transfers: string;
    meals: string;
    countries: string;
    bestFor: string;
    difficulty: string;
    season: string;
  };

  highlights: string[];
  included: string[];
  notIncluded: string[];

  itinerary: {
    day: string;
    title: string;
    description: string;
    highlights?: string[];
  }[];

  detailedItinerary?: DetailedItineraryDay[];

  recommendedHotels: {
    id: string;
    name: string;
    type: string;
    rating: number;
    description: string;
    imageUrl: string;
    location?: string;
    facilities?: string[];
    upgradeOptions?: string;
  }[];

  whyWeChoseStay: string;

  includedExperienceIds: string[];

  routeMap: {
    step: number;
    title: string;
    location: string;
    description: string;
  }[];

  pricingDetails: {
    basis: string;
    assumptions: string[];
    factorsAffecting: string[];
  };

  faqs: {
    question: string;
    answer: string;
  }[];

  relatedPackageIds: string[];
  rating: number;
  reviewCount: number;
}
export interface ActivityItem {
  id: string;
  title: string;
  duration: string;
  priceUSD: number;
  imageUrl: string;
  badge: string;
  shortDesc: string;
  whyRecommend: string;
  idealFor: string[];
}
