import { z } from 'zod';
export const RoomBedConfigSchema = z.object({
  type: z.string(),
  quantity: z.number().int().min(1),
}).strict();

export const RoomOccupancyConfigSchema = z.object({
  maxAdults: z.number().int().min(1).optional(),
  maxChildren: z.number().int().min(0).optional(),
  maxTotalGuests: z.number().int().min(1).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().nonnegative().optional(),
  beds: z.array(RoomBedConfigSchema).optional(),
  extraBedAvailable: z.boolean().optional(),
  extraBedNotes: z.string().optional(),
  childAgePolicy: z.string().optional(),
  additionalGuestChargeNote: z.string().optional(),
  interleadingInfo: z.string().optional(),
}).strict();

export const RatePlanSchema = z.object({
  id: z.string(),
  internalRateName: z.string(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  amountUSD: z.number().nonnegative().nullable().optional(),
  priceBasis: z.string().optional(),
  customBasisLabel: z.string().optional(),
  visitorMarket: z.enum(['international', 'zimbabwe_resident', 'sadc_resident', 'custom']).optional(),
  customMarketLabel: z.string().optional(),
  adultOrChildCategory: z.enum(['adult', 'child', 'all']).optional(),
  boardBasis: z.enum(['room_only', 'self_catering', 'bed_and_breakfast', 'half_board', 'full_board', 'all_inclusive']).optional(),
  maxOccupancy: z.number().int().min(1).nullable().optional(),
  minStayNights: z.number().int().min(1).nullable().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  rateStatus: z.enum(['provisional', 'confirmed']).optional(),
  lastConfirmedDate: z.string().optional(),
  applicableUnitIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const AccommodationOfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  offerCategory: z.enum(['special_offer', 'honeymoon_package', 'seasonal_promotion', 'meal_plan', 'added_value']).optional(),
  description: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  includedServices: z.array(z.string()).optional(),
  applicableUnitIds: z.array(z.string()).optional(),
  applyToEntireProperty: z.boolean().optional(),
  applicableRatePlanIds: z.array(z.string()).optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  priceType: z.enum(['fixed_offer', 'percentage_discount', 'fixed_discount', 'added_value']).optional(),
  offerPriceUSD: z.number().nonnegative().nullable().optional(),
  discountPercent: z.number().nonnegative().nullable().optional(),
  discountAmountUSD: z.number().nonnegative().nullable().optional(),
  guestRequirements: z.string().optional(),
  conditions: z.string().optional(),
  status: z.enum(['published', 'draft', 'archived', 'trashed']).optional(),
  ctaLabel: z.string().optional(),
  featured: z.boolean().optional(),
}).strict();

export const RoomSeasonalRateSchema = z.object({
  id: z.string(),
  label: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  nightlyRateUSD: z.number().nonnegative(),
  weekendRateUSD: z.number().nonnegative().nullable().optional(),
  minStayNights: z.number().int().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

export const RoomDateRateSchema = z.object({
  id: z.string(),
  date: z.string(),
  label: z.string().optional(),
  nightlyRateUSD: z.number().nonnegative(),
  isActive: z.boolean().optional(),
}).strict();

export const RoomMealPlanRateSchema = z.object({
  id: z.string(),
  name: z.string(),
  supplementPerPersonPerNightUSD: z.number().nonnegative(),
  pricingType: z.enum(['per_person_per_night', 'per_unit_per_night']).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
}).strict();

export const RoomPricingSchema = z.object({
  baseNightlyRateUSD: z.number().nonnegative().nullable().optional(),
  startingFromPriceUSD: z.number().nonnegative().nullable().optional(),
  weekendRateUSD: z.number().nonnegative().nullable().optional(),
  weekendDays: z.array(z.enum(['fri', 'sat', 'sun'])).optional(),
  baseOccupancyAdults: z.number().int().min(1).nullable().optional(),
  additionalGuestRateUSD: z.number().nonnegative().nullable().optional(),
  childRateUSD: z.number().nonnegative().nullable().optional(),
  childRate11PlusUSD: z.number().nonnegative().nullable().optional(),
  minStayNights: z.number().int().min(1).nullable().optional(),
  rateValidFrom: z.string().optional(),
  rateValidTo: z.string().optional(),
  rateStatus: z.enum(['provisional', 'confirmed']).optional(),
  priceBasis: z.enum(['per_room', 'per_unit', 'per_person', 'per_person_sharing', 'per_person_single']).optional(),
  seasonalRates: z.array(RoomSeasonalRateSchema).optional(),
  dateSpecificRates: z.array(RoomDateRateSchema).optional(),
  mealPlanRates: z.array(RoomMealPlanRateSchema).optional(),
  ratePlans: z.array(RatePlanSchema).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
}).strict();

export const RoomGalleryImageSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
}).strict();

export const RoomPoliciesSchema = z.object({
  minStayNights: z.number().int().min(1).nullable().optional(),
  checkInRestrictions: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  extraPersonPolicy: z.string().optional(),
  accessibilityInfo: z.string().optional(),
  otherRestrictions: z.string().optional(),
}).strict();

export const RoomTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  occupancy: z.string(),
  description: z.string(),
  shortDescription: z.string().optional(),
  unitCategory: z.string().optional(),
  wing: z.string().optional(),
  isEntireProperty: z.boolean().optional(),
  sizeSqm: z.number().nonnegative().nullable().optional(),
  unitCount: z.number().int().min(1).nullable().optional(),
  featured: z.boolean().optional(),
  status: z.enum(['published', 'draft', 'archived', 'trashed']).optional(),
  availabilityStatus: z.enum(['available', 'on_request', 'temporarily_unavailable']).optional(),
  customCtaLabel: z.string().optional(),
  imageUrl: z.string(),
  gallery: z.array(RoomGalleryImageSchema).optional(),
  galleryImages: z.array(z.string()).optional(),
  features: z.array(z.string()),
  amenities: z.array(z.string()).optional(),
  customAmenities: z.array(z.string()).optional(),
  accessibilityFeatures: z.array(z.string()).optional(),
  inclusions: z.array(z.string()).optional(),
  ratePlanIds: z.array(z.string()).optional(),
  occupancyConfig: RoomOccupancyConfigSchema.optional(),
  pricing: RoomPricingSchema.optional(),
  policies: RoomPoliciesSchema.optional(),
}).strict();

export const PropertyPoliciesSchema = z.object({
  checkInPolicy: z.string().optional(),
  checkOutPolicy: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  childPolicy: z.string().optional(),
  petPolicy: z.string().optional(),
  generalNotes: z.string().optional(),
}).strict();

export const PropertyEnquirySettingsSchema = z.object({
  enableWhatsApp: z.boolean().optional(),
  enableEmail: z.boolean().optional(),
  customEnquiryNote: z.string().optional(),
  contactEmail: z.string().optional(),
  whatsappNumber: z.string().optional(),
  contactPhone: z.string().optional(),
}).strict();

export const DetailedAccommodationSchema = z.object({"id":z.string(),"slug":z.string(),"name":z.string(),"category":z.string().min(1),"accommodationCategory":z.enum(["hotels","lodges","guest-houses","apartments"]).optional(),"badge":z.union([z.literal('Luxury'),z.literal('Family Favourite'),z.literal('Romantic'),z.literal('Best Value'),z.literal('Walking Distance'),z.literal('Boutique')]).optional(),"rating":z.number().finite(),"reviewCount":z.number().finite(),"location":z.string(),"distanceFromFalls":z.string(),"airportDistance":z.string(),"priceFromUSD":z.number().finite(),"currency":z.string().optional(),"priceUnit":z.string().optional(),"maxGuests":z.number().int().positive().optional(),"amenities":z.array(z.string()).optional(),"checkInTime":z.string().optional(),"checkOutTime":z.string().optional(),"publicationStatus":z.enum(["published","draft","archived"]).optional(),"roomSectionHeading":z.string().optional(),"roomSectionSubtitle":z.string().optional(),"policies":PropertyPoliciesSchema.optional(),"enquirySettings":PropertyEnquirySettingsSchema.optional(),"ratePlans":z.array(RatePlanSchema).optional(),"offers":z.array(AccommodationOfferSchema).optional(),"heroImage":z.string(),"galleryImages":z.array(z.string()),"tagline":z.string(),"shortDescription":z.string(),"editorialOverview":z.string(),"whyWeRecommend":z.string(),"filterTags":z.array(z.enum(["luxury-lodges","boutique-hotels","family-friendly","romantic-escapes","best-value","safari-lodges","self-catering","walking-distance"])),"atAGlance":z.object({"type":z.string(),"starRating":z.string(),"bestFor":z.string(),"distanceFromFalls":z.string(),"pool":z.string(),"restaurant":z.string(),"wifi":z.string(),"familyFriendly":z.string(),"transfers":z.string(),"roomTypesSummary":z.string()}).strict(),"roomTypes":z.array(z.lazy(() => RoomTypeSchema)),"facilities":z.array(z.object({"name":z.string(),"category":z.string()}).strict()),"locationInfo":z.object({"address":z.string(),"distanceToFalls":z.string(),"distanceToAirport":z.string(),"nearbyAttractions":z.array(z.string()),"nearbyRestaurants":z.array(z.string()),"departurePoints":z.string()}).strict(),"nearbyExperienceIds":z.array(z.string()),"relatedPropertyIds":z.array(z.string())}).strict();
export const ExperienceStepSchema = z.object({"stepNumber":z.number().finite(),"time":z.string().optional(),"title":z.string(),"description":z.string(),"highlight":z.string().optional(),"image":z.string().optional()}).strict();
export const ExperienceSchema = z.object({"id":z.string(),"slug":z.string(),"title":z.string(),"subtitle":z.string().optional(),"badge":z.string().optional(),"categories":z.array(z.union([z.literal('featured'),z.literal('first-visit'),z.literal('wildlife'),z.literal('adventure'),z.literal('river'),z.literal('culture'),z.literal('day-trips')])),"shortDescription":z.string(),"fullOverview":z.string(),"whyWeRecommend":z.string(),"duration":z.string(),"location":z.string().optional(),"fromPrice":z.string(),"priceAmount":z.number().finite(),"priceBasis":z.enum(['per_adult','per_person','per_child','per_group','per_vehicle','on_request']).optional(),"childRateUnder11USD":z.number().nonnegative().nullable().optional(),"childRate11PlusUSD":z.number().nonnegative().nullable().optional(),"rateStatus":z.enum(['provisional','confirmed']).optional(),"validFrom":z.string().optional(),"validTo":z.string().optional(),"defaultTimeSlot":z.string().optional(),"departureTimes":z.array(z.string()).optional(),"includeInBuilder":z.boolean().optional(),"builderOrder":z.number().int().optional(),"recommendedInBuilder":z.boolean().optional(),"featuredImage":z.string(),"galleryImages":z.array(z.string()),"highlights":z.array(z.string()),"whatsIncluded":z.array(z.string()),"whatsExcluded":z.array(z.string()).optional(),"goodToKnow":z.array(z.string()),"steps":z.array(z.lazy(() => ExperienceStepSchema)).optional(),"localExpertTip":z.string().optional(),"faqs":z.array(z.object({"q":z.string(),"a":z.string()}).strict()),"relatedIds":z.array(z.string())}).strict();
export const DetailedItineraryDaySchema = z.object({"day":z.string(),"title":z.string(),"morning":z.string(),"afternoon":z.string(),"evening":z.string(),"included":z.array(z.string()),"optionalUpgrade":z.string().optional(),"travelNotes":z.string().optional(),"image":z.string().optional()}).strict();
export const DetailedPackageSchema = z.object({"id":z.string(),"slug":z.string(),"title":z.string(),"badge":z.union([z.literal('Best Value'),z.literal('Luxury'),z.literal('Family Favourites'),z.literal('Adventure'),z.literal('Signature'),z.literal('Popular')]),"category":z.union([z.literal('value'),z.literal('luxury'),z.literal('family'),z.literal('adventure'),z.literal('safari'),z.literal('first-visit'),z.literal('couples')]),"categories":z.array(z.union([z.literal('first-visit'),z.literal('couples'),z.literal('families'),z.literal('luxury'),z.literal('adventure'),z.literal('safari'),z.literal('value')])),"tagline":z.string(),"description":z.string(),"priceUSD":z.number().finite(),"duration":z.string(),"travellerType":z.string(),"imageUrl":z.string(),"galleryImages":z.array(z.string()),"storyIntroduction":z.string(),"whyWeRecommend":z.string(),"whoIsThisFor":z.object({"perfectIf":z.array(z.string()),"considerOthersIf":z.array(z.string()),"alternativeSlug":z.string().optional(),"alternativeTitle":z.string().optional()}).strict(),"highlightsMeta":z.object({"accommodation":z.string(),"transfers":z.string(),"meals":z.string(),"countries":z.string(),"bestFor":z.string(),"difficulty":z.string(),"season":z.string()}).strict(),"highlights":z.array(z.string()),"included":z.array(z.string()),"notIncluded":z.array(z.string()),"itinerary":z.array(z.object({"day":z.string(),"title":z.string(),"description":z.string(),"highlights":z.array(z.string()).optional()}).strict()),"detailedItinerary":z.array(z.lazy(() => DetailedItineraryDaySchema)).optional(),"recommendedHotels":z.array(z.object({"id":z.string(),"name":z.string(),"type":z.string(),"rating":z.number().finite(),"description":z.string(),"imageUrl":z.string(),"location":z.string().optional(),"facilities":z.array(z.string()).optional(),"upgradeOptions":z.string().optional()}).strict()),"whyWeChoseStay":z.string(),"includedExperienceIds":z.array(z.string()),"routeMap":z.array(z.object({"step":z.number().finite(),"title":z.string(),"location":z.string(),"description":z.string()}).strict()),"pricingDetails":z.object({"basis":z.string(),"assumptions":z.array(z.string()),"factorsAffecting":z.array(z.string())}).strict(),"faqs":z.array(z.object({"question":z.string(),"answer":z.string()}).strict()),"relatedPackageIds":z.array(z.string()),"rating":z.number().finite(),"reviewCount":z.number().finite()}).strict();
export const QuickFactSchema = z.object({"label":z.string(),"value":z.string(),"subtext":z.string().optional(),"iconName":z.string()}).strict();
export const AuthorSchema = z.object({"name":z.string(),"role":z.string(),"avatarUrl":z.string(),"bio":z.string().optional()}).strict();
export const CalloutTypeSchema = z.union([z.literal('advice'),z.literal('insight'),z.literal('recommendation')]);
export const CalloutBlockSchema = z.object({"type":z.lazy(() => CalloutTypeSchema),"title":z.string(),"content":z.string()}).strict();
export const PullQuoteSchema = z.object({"quote":z.string(),"author":z.string(),"title":z.string().optional(),"avatarUrl":z.string().optional()}).strict();
export const PracticalInfoItemSchema = z.object({"heading":z.string(),"detail":z.string(),"iconName":z.string().optional()}).strict();
export const PracticalInfoPanelSchema = z.object({"title":z.string(),"subtitle":z.string().optional(),"items":z.array(z.lazy(() => PracticalInfoItemSchema))}).strict();
export const TravellerTypeCardSchema = z.object({"id":z.string(),"title":z.string(),"tagline":z.string(),"idealFor":z.string(),"topTip":z.string(),"recommendedDuration":z.string(),"imageUrl":z.string()}).strict();
export const RelatedGuideCardSchema = z.object({"slug":z.string(),"title":z.string(),"category":z.string(),"readTime":z.string(),"summary":z.string(),"imageUrl":z.string(),"badge":z.string().optional()}).strict();
export const FaqItemSchema = z.object({"question":z.string(),"answer":z.string(),"category":z.string().optional()}).strict();
export const TimelineItemSchema = z.object({"day":z.string(),"title":z.string(),"activities":z.array(z.string()),"note":z.string().optional()}).strict();
export const TimelineBlockDataSchema = z.object({"title":z.string(),"duration":z.string().optional(),"idealFor":z.string().optional(),"investment":z.string().optional(),"style":z.string().optional(),"bestTime":z.string().optional(),"pace":z.string().optional(),"items":z.array(z.lazy(() => TimelineItemSchema)),"whyRecommend":z.string().optional()}).strict();
export const TableDataSchema = z.object({"title":z.string().optional(),"headers":z.array(z.string()),"rows":z.array(z.array(z.string()))}).strict();
export const PricingCardSchema = z.object({"title":z.string(),"price":z.string(),"period":z.string().optional(),"idealFor":z.string().optional(),"description":z.string().optional(),"features":z.array(z.string()),"highlight":z.boolean().optional()}).strict();
export const BlockTypeSchema = z.union([z.literal('text'),z.literal('heading'),z.literal('image'),z.literal('callout'),z.literal('pullquote'),z.literal('practical_info'),z.literal('traveller_cards'),z.literal('bullet_list'),z.literal('timeline'),z.literal('table'),z.literal('pricing_cards')]);
export const ArticleBlockSchema = z.object({"type":z.lazy(() => BlockTypeSchema),"content":z.string().optional(),"subheading":z.string().optional(),"headingLevel":z.union([z.literal('h2'),z.literal('h3')]).optional(),"items":z.array(z.string()).optional(),"imageUrl":z.string().optional(),"imageAlt":z.string().optional(),"imageCaption":z.string().optional(),"imageCredit":z.string().optional(),"callout":z.lazy(() => CalloutBlockSchema).optional(),"pullQuote":z.lazy(() => PullQuoteSchema).optional(),"practicalPanel":z.lazy(() => PracticalInfoPanelSchema).optional(),"timeline":z.lazy(() => TimelineBlockDataSchema).optional(),"table":z.lazy(() => TableDataSchema).optional(),"pricingCards":z.array(z.lazy(() => PricingCardSchema)).optional()}).strict();
export const GuideSectionSchema = z.object({"id":z.string(),"tocTitle":z.string(),"heading":z.string(),"blocks":z.array(z.lazy(() => ArticleBlockSchema))}).strict();
export const SEOConfigSchema = z.object({"metaTitle":z.string(),"metaDescription":z.string(),"canonicalUrl":z.string(),"ogImage":z.string(),"keywords":z.array(z.string())}).strict();
export const GuideArticleSchema = z.object({"id":z.string(),"slug":z.string(),"category":z.string(),"title":z.string(),"subtitle":z.string(),"heroImageUrl":z.string(),"heroImageAlt":z.string(),"heroImageCredit":z.string().optional(),"author":z.lazy(() => AuthorSchema),"publishedDate":z.string(),"lastUpdatedDate":z.string(),"readingTime":z.string(),"location":z.string(),"seo":z.lazy(() => SEOConfigSchema),"quickFacts":z.array(z.lazy(() => QuickFactSchema)),"sections":z.array(z.lazy(() => GuideSectionSchema)),"travellerTypes":z.array(z.lazy(() => TravellerTypeCardSchema)).optional(),"faqs":z.array(z.lazy(() => FaqItemSchema)).optional(),"relatedGuides":z.array(z.lazy(() => RelatedGuideCardSchema))}).strict();
export const ActivePortalSchema = z.union([z.literal('travel'),z.literal('art'),z.literal('combined')]);
export const CurrencySchema = z.union([z.literal('USD'),z.literal('ZWL'),z.literal('EUR'),z.literal('GBP'),z.literal('ZAR')]);
export const CurrencyRateSchema = z.object({"symbol":z.string(),"rate":z.number().finite()}).strict();
export const TravelPackageSchema = z.object({"id":z.string(),"title":z.string(),"badge":z.union([z.literal('Best Value'),z.literal('Luxury'),z.literal('Family Favourites'),z.literal('Adventure'),z.literal('Signature')]),"category":z.union([z.literal('value'),z.literal('luxury'),z.literal('family'),z.literal('adventure')]),"tagline":z.string(),"description":z.string(),"priceUSD":z.number().finite(),"duration":z.string(),"imageUrl":z.string(),"highlights":z.array(z.string()),"included":z.array(z.string()),"itinerary":z.array(z.object({"day":z.string(),"title":z.string(),"description":z.string()}).strict()),"rating":z.number().finite(),"reviewCount":z.number().finite()}).strict();
export const TravelSpotSchema = z.object({"id":z.string(),"name":z.string(),"category":z.union([z.literal('Rainforest & Falls'),z.literal('River & Wildlife'),z.literal('Adrenaline'),z.literal('Dining & Culture')]),"shortDesc":z.string(),"fullDesc":z.string(),"imageUrl":z.string(),"location":z.string(),"idealFor":z.string(),"insiderTip":z.string()}).strict();
export const AccommodationSchema = z.object({"id":z.string(),"name":z.string(),"type":z.union([z.literal('Luxury River Lodge'),z.literal('Boutique Hotel'),z.literal('Safari Camp'),z.literal('Resort')]),"priceRangeUSD":z.string(),"rating":z.number().finite(),"imageUrl":z.string(),"features":z.array(z.string()),"description":z.string()}).strict();
export const ArtCategorySchema = z.object({"id":z.string(),"name":z.string(),"slug":z.string(),"iconName":z.string(),"imageUrl":z.string(),"itemCount":z.number().finite(),"description":z.string()}).strict();
export const ArtProductSchema = z.object({"id":z.string(),"name":z.string(),"categorySlug":z.string(),"categoryName":z.string(),"artistId":z.string(),"artistName":z.string(),"artistCountry":z.string(),"priceUSD":z.number().finite(),"rating":z.number().finite(),"reviewCount":z.number().finite(),"imageUrl":z.string(),"secondaryImages":z.array(z.string()).optional(),"dimensions":z.string(),"medium":z.string(),"yearCreated":z.number().finite(),"description":z.string(),"provenance":z.string(),"isBestSeller":z.boolean().optional(),"isNewArrival":z.boolean().optional(),"isFeatured":z.boolean().optional(),"inStock":z.number().finite()}).strict();
export const ArtistSchema = z.object({"id":z.string(),"name":z.string(),"country":z.string(),"countryCode":z.string(),"avatarUrl":z.string(),"biography":z.string(),"specialty":z.string(),"featuredWorkImage":z.string(),"totalArtworks":z.number().finite(),"exhibitions":z.array(z.string())}).strict();
export const CartItemSchema = z.object({"product":z.lazy(() => ArtProductSchema),"quantity":z.number().finite(),"selectedCurrency":z.lazy(() => CurrencySchema)}).strict();
export const ReviewSchema = z.object({"id":z.string(),"author":z.string(),"roleOrCity":z.string(),"avatar":z.string(),"rating":z.number().finite(),"date":z.string(),"title":z.string(),"comment":z.string(),"verifiedBuyer":z.boolean(),"type":z.union([z.literal('travel'),z.literal('art')])}).strict();
export const HolidayPlanFormSchema = z.object({"travelerType":z.union([z.literal('couple'),z.literal('family'),z.literal('group'),z.literal('solo')]),"guestCount":z.number().finite(),"durationDays":z.number().finite(),"budgetTier":z.union([z.literal('comfort'),z.literal('luxury'),z.literal('ultra-luxury')]),"vibes":z.array(z.string()),"travelDates":z.string(),"specialRequests":z.string(),"name":z.string(),"email":z.string(),"phone":z.string()}).strict();
export const ActivityItemSchema = z.object({"id":z.string(),"title":z.string(),"duration":z.string(),"priceUSD":z.number().finite(),"imageUrl":z.string(),"badge":z.string(),"shortDesc":z.string(),"whyRecommend":z.string(),"idealFor":z.array(z.string()),"experienceId":z.string().optional(),"includeInBuilder":z.boolean().optional(),"suggestedByDefault":z.boolean().optional(),"displayOrder":z.number().int().optional(),"priceOverrideEnabled":z.boolean().optional(),"priceSource":z.enum(["experience-catalog","builder-override","custom"]).optional(),"categories":z.array(z.string()).optional(),"priceBasis":z.enum(["per_adult","per_person","per_child","per_group","per_vehicle","on_request"]).optional(),"childRateUnder11USD":z.number().nonnegative().nullable().optional(),"childRate11PlusUSD":z.number().nonnegative().nullable().optional(),"rateStatus":z.enum(["provisional","confirmed"]).optional(),"validFrom":z.string().optional(),"validTo":z.string().optional(),"defaultTimeSlot":z.string().optional(),"departureTimes":z.array(z.string()).optional()}).strict();
