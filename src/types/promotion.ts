export interface PromotionCta {
  label: string;
  destination: 'enquiry_form' | 'whatsapp' | 'offer_page' | 'custom_url';
  target?: string;
}

export interface PromotionDisplayConfig {
  showOnHomepage: boolean;
  showAsCard: boolean;
  showAsPopup: boolean;
  targetPages: string[];
}

export interface PromotionTriggerConfig {
  mode: 'delay' | 'scroll' | 'exit_intent';
  delaySeconds: number;
  scrollPercentage: number;
  maxImpressions: number;
  frequencyHours: number;
}

export interface PromotionOffer {
  id: number;
  campaignCode: string;
  slug: string;
  name: string;
  headline: string;
  subtitle?: string;
  shortDescription: string;
  fullContent?: string;
  imageUrl: string;
  imageAlt?: string;
  badgeText?: string;
  category: 'all' | 'packages' | 'experiences' | 'accommodation' | string;
  destinationOrActivity: string;
  termsAndConditions?: string;
  originalPriceUSD?: number | null;
  promotionalPriceUSD?: number | null;
  priceBasis: 'per_person' | 'per_couple' | 'per_family' | 'per_booking' | 'per_night' | string;
  discountPercentage?: number | null;
  validityStart?: string | null;
  validityEnd?: string | null;
  primaryCta: PromotionCta;
  secondaryCta?: PromotionCta;
  whatsappTemplate?: string;
  whatsappUrl: string;
  display: PromotionDisplayConfig;
  trigger: PromotionTriggerConfig;
  offerPageUrl: string;
}

export interface PromotionEventPayload {
  promotionId: number;
  eventType: 'impression' | 'cta_click' | 'whatsapp_click' | 'enquiry_submit';
  visitorId?: string;
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}
