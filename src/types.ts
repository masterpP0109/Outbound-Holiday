export type ActivePortal = 'travel' | 'art' | 'combined';

export type Currency = 'USD' | 'ZWL' | 'EUR' | 'GBP' | 'ZAR';

export interface CurrencyRate {
  symbol: string;
  rate: number; // conversion from USD
}

export interface TravelPackage {
  id: string;
  title: string;
  badge: 'Best Value' | 'Luxury' | 'Family Favourites' | 'Adventure' | 'Signature';
  category: 'value' | 'luxury' | 'family' | 'adventure';
  tagline: string;
  description: string;
  priceUSD: number;
  duration: string;
  imageUrl: string;
  highlights: string[];
  included: string[];
  itinerary: { day: string; title: string; description: string }[];
  rating: number;
  reviewCount: number;
}

export interface TravelSpot {
  id: string;
  name: string;
  category: 'Rainforest & Falls' | 'River & Wildlife' | 'Adrenaline' | 'Dining & Culture';
  shortDesc: string;
  fullDesc: string;
  imageUrl: string;
  location: string;
  idealFor: string;
  insiderTip: string;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'Luxury River Lodge' | 'Boutique Hotel' | 'Safari Camp' | 'Resort';
  priceRangeUSD: string;
  rating: number;
  imageUrl: string;
  features: string[];
  description: string;
}

export interface ArtCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  imageUrl: string;
  itemCount: number;
  description: string;
}

export interface ArtProduct {
  id: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  artistId: string;
  artistName: string;
  artistCountry: string;
  priceUSD: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  secondaryImages?: string[];
  dimensions: string;
  medium: string;
  yearCreated: number;
  description: string;
  provenance: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  inStock: number;
}

export interface Artist {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  avatarUrl: string;
  biography: string;
  specialty: string;
  featuredWorkImage: string;
  totalArtworks: number;
  exhibitions: string[];
}

export interface CartItem {
  product: ArtProduct;
  quantity: number;
  selectedCurrency: Currency;
}

export interface Review {
  id: string;
  author: string;
  roleOrCity: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  type: 'travel' | 'art';
}

export interface HolidayPlanForm {
  travelerType: 'couple' | 'family' | 'group' | 'solo';
  guestCount: number;
  durationDays: number;
  budgetTier: 'comfort' | 'luxury' | 'ultra-luxury';
  vibes: string[];
  travelDates: string;
  specialRequests: string;
  name: string;
  email: string;
  phone: string;
}
