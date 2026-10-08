export interface RoomType {
  name: string;
  occupancy: string;
  description: string;
  imageUrl: string;
  features: string[];
}
export interface DetailedAccommodation {
  id: string;
  slug: string;
  name: string;
  category: 'Luxury Lodge' | 'Boutique Hotel' | 'Guest Lodge' | 'Safari Lodge' | 'Resort' | 'Self-Catering';
  badge?: 'Luxury' | 'Family Favourite' | 'Romantic' | 'Best Value' | 'Walking Distance' | 'Boutique';
  rating: number;
  reviewCount: number;
  location: string;
  distanceFromFalls: string;
  airportDistance: string;
  priceFromUSD: number;
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
