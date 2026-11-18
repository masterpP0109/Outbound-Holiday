import { editorial } from "../../runtime/catalog";
import type { DirectEnquiryContext } from '../../utils/enquiry';
import { ShareButton } from '../common/ShareButton';
import { UnifiedEnquiryPanel } from './UnifiedEnquiryPanel';
import {
  AMENITY_DEFINITIONS,
  getAccommodationCategorySingular,
  getMaxGuestCapacity,
  getPriceUnitLabel,
  getPropertyDisplayPriceUSD,
} from '../../utils/accommodation';
import {
  getOfferDisplayBadge,
  getPublishedPropertyOffers,
  getPublishedRoomTypes,
  getRoomBedSummary,
  getRoomCapacityLabel,
  getRoomDisplayAmenities,
  getRoomGalleryImages,
  getRoomMaxGuests,
  getRoomPriceUnitLabel,
  getRoomStartingPriceUSD,
  getRoomWings,
  getUnitAvailabilityBadge,
  isSingleEntireHomeProperty,
} from '../../utils/roomPricing';
import { RoomAmenityIcon } from './RoomAmenityIcon';
import { RoomDetailModal } from './RoomDetailModal';
import { RoomEnquiryModal, type RoomEnquiryInitialState } from './RoomEnquiryModal';
import { PageLink } from '../common/PageLink';
import { accommodationPath,sectionPath } from '../../routes';
import React,{ useMemo, useState } from 'react';
import { DetailedAccommodation, ALL_ACCOMMODATIONS, RoomType } from '../../data/accommodationsData';
import { Currency } from '../../types';
import { formatCurrencyAmount } from '../../utils/currency';
import { Experience,getExperienceById,ALL_EXPERIENCES } from '../../data/experiencesData';
import { GalleryLightbox } from './GalleryLightbox';
import {
Home,
ArrowLeft,
MapPin,
Star,
MessageCircle,
ShieldCheck,
Hotel,
Utensils,
Wifi,
Waves,
Users,
Plane,
Bed,
CheckCircle2,
Sparkles,Award,ArrowRight,
Maximize2,
Compass,
Building,
Clock
} from 'lucide-react';

import type { PreselectedStayDetails } from './PlanHolidayModal';

interface AccommodationDetailPageProps {
  property: DetailedAccommodation;
  currency: Currency;
  onOpenPlanHolidayWithProperty: (
    property: DetailedAccommodation,
    stayDetails?: PreselectedStayDetails
  ) => void;
  onDirectEnquiry?: (context: DirectEnquiryContext) => void;
  onSelectExperience: (exp: Experience) => void;
  onSelectRelatedProperty: (prop: DetailedAccommodation) => void;
  onNavigateBackToDirectory: () => void;
  onNavigateHome: () => void;
}

export const AccommodationDetailPage: React.FC<AccommodationDetailPageProps> = ({
  property,
  currency,
  onOpenPlanHolidayWithProperty,
  onDirectEnquiry: _onDirectEnquiry,
  onSelectExperience,
  onSelectRelatedProperty,
  onNavigateBackToDirectory,
  onNavigateHome,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [detailRoom, setDetailRoom] = useState<RoomType | null>(null);
  const [enquiryTarget, setEnquiryTarget] = useState<RoomEnquiryInitialState | null>(null);
  const [activeWing, setActiveWing] = useState<string>('ALL');
  const publishedRooms = useMemo(() => getPublishedRoomTypes(property), [property]);
  const publishedOffers = useMemo(() => getPublishedPropertyOffers(property), [property]);
  const wings = useMemo(() => getRoomWings(property), [property]);
  const isSingleHome = useMemo(() => isSingleEntireHomeProperty(property), [property]);
  const visibleRooms = useMemo(
    () =>
      activeWing === 'ALL'
        ? publishedRooms
        : publishedRooms.filter((r) => (r.wing || '').trim().toLowerCase() === activeWing.toLowerCase()),
    [publishedRooms, activeWing]
  );
  const propertyAmenityLabels = useMemo(() => {
    const raw = property.amenities ?? [];
    return raw
      .map((item) => {
        const clean = item.trim();
        if (!clean) return '';
        const match = AMENITY_DEFINITIONS.find(
          (d) => d.id === clean.toLowerCase() || d.label.toLowerCase() === clean.toLowerCase()
        );
        return match ? match.label : clean;
      })
      .filter(Boolean);
  }, [property.amenities]);

  const allPropertyImages = Array.from(
    new Set(
      [
        property.heroImage,
        ...property.galleryImages,
        ...publishedRooms.flatMap((r) => getRoomGalleryImages(r).map((g) => g.url)),
      ].filter(Boolean),
    ),
  );
  const openLightboxForImage = (imgUrl: string) => {
    const idx = allPropertyImages.indexOf(imgUrl);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };
  const [intendedDates, setIntendedDates] = useState<string>('');
  const [partySize, setPartySize] = useState<string>('2 Adults');
  const [roomPreference, setRoomPreference] = useState<string>(
    publishedRooms[0]?.name ?? 'Best available / Please advise'
  );

  const formatPrice = (priceUSD: number) => formatCurrencyAmount(priceUSD, currency);

  const categoryBadge = getAccommodationCategorySingular(property);
  const maxGuests = getMaxGuestCapacity(property);
  const priceUnitLabel = getPriceUnitLabel(property);
  const displayPriceUSD = getPropertyDisplayPriceUSD(property);
  const hasGuidePrice = typeof displayPriceUSD === 'number' && displayPriceUSD > 0;

  // Match nearby experiences
  const matchedExperiences = property.nearbyExperienceIds
    .map((expId) => getExperienceById(expId) || ALL_EXPERIENCES.find((e) => e.id === expId))
    .filter((e): e is Experience => e !== undefined)
    .slice(0, 4);

  // Related properties
  const relatedProperties = property.relatedPropertyIds
    .map((id) => ALL_ACCOMMODATIONS.find((p) => p.id === id || p.slug === id))
    .filter((p): p is DetailedAccommodation => p !== undefined && p.id !== property.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28">
      
      {/* Top Breadcrumb Navigation */}
      <div className="bg-[#0B5E8E] text-white py-3.5 px-4 sm:px-6 lg:px-8 border-b border-[#08486e]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium">
          <nav className="flex items-center gap-2 text-white/70">
            <PageLink href={'/'}
              onClick={onNavigateHome}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{editorial("travel/AccommodationDetailPage.text1")}</span>
            </PageLink>
            <span>/</span>
            <PageLink href={sectionPath('accommodation')}
              onClick={onNavigateBackToDirectory}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {editorial("travel/AccommodationDetailPage.text2")}</PageLink>
            <span>/</span>
            <span className="text-[#C9A66B] font-semibold truncate max-w-[160px] sm:max-w-none">
              {property.name}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <ShareButton
              title={property.name}
              canonicalPath={accommodationPath(property)}
            />
            <PageLink href={sectionPath('accommodation')}
              onClick={onNavigateBackToDirectory}
              className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{editorial("travel/AccommodationDetailPage.text3")}</span>
            </PageLink>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Property Hero Info */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-2.5">
                {property.badge && (
                  <span className="bg-[#E67E22] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {property.badge}
                  </span>
                )}

                <span className="bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Hotel className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>{categoryBadge}</span>
                </span>

                {property.category && property.category !== categoryBadge && (
                  <span className="bg-[#FAF9F6] text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-1 rounded-full">
                    {property.category}
                  </span>
                )}

                <span className="bg-[#FAF9F6] text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0B5E8E]" />
                  <span>{property.distanceFromFalls}</span>
                </span>

                {maxGuests !== null && (
                  <span className="bg-[#FAF9F6] text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>
                      {publishedRooms.length > 1
                        ? `Up to ${maxGuests} guests per unit (varies by unit type)`
                        : `Up to ${maxGuests} guests`}
                    </span>
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B5E8E] tracking-tight leading-tight">
                  {property.name}
                </h1>
                <p className="text-base sm:text-lg text-[#E67E22] font-semibold">
                  {property.tagline}
                </p>
                <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
                  {property.shortDescription}
                </p>
              </div>

              {/* Price & Qualification Callout */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-gray-500 block">
                    {hasGuidePrice ? editorial("travel/AccommodationDetailPage.text4") : 'Availability & Rates'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    {hasGuidePrice && displayPriceUSD !== null ? (
                      <>
                        <span className="text-3xl font-serif font-bold text-[#0B5E8E]">
                          {editorial("travel/AccommodationDetailPage.text5")}{formatPrice(displayPriceUSD)}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">
                          {property.priceUnit ? priceUnitLabel : editorial("travel/AccommodationDetailPage.text6")}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-serif font-bold text-[#0B5E8E]">
                        Price on enquiry
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Guide rate · Rates confirmed before booking
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs">
                  <Star className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
                  <span className="font-bold text-[#0B5E8E]">{property.rating} / 5.0</span>
                  <span className="text-gray-400">({property.reviewCount} {editorial("travel/AccommodationDetailPage.text7")}</span>
                </div>
              </div>

              {/* Quick Enquiry Details (feeds WhatsApp message cleanly) */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B5E8E] block">
                  Quick Enquiry Details (Included on WhatsApp)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    placeholder="Intended dates (e.g. 12–16 Aug)"
                    aria-label="Intended stay dates"
                    value={intendedDates}
                    onChange={(e) => setIntendedDates(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                  <input
                    type="text"
                    placeholder="Party size (e.g. 2 Adults)"
                    aria-label="Party size"
                    value={partySize}
                    onChange={(e) => setPartySize(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                  <select
                    aria-label="Preferred room or unit"
                    value={roomPreference}
                    onChange={(e) => setRoomPreference(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  >
                    {publishedRooms.map((room) => (
                      <option key={room.id || room.name} value={room.name}>
                        {room.name}
                      </option>
                    ))}
                    <option value="Best available / Please advise">
                      Best available / Please advise
                    </option>
                  </select>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const matchedRoom =
                      publishedRooms.find((r) => r.name === roomPreference) || null;
                    setEnquiryTarget({ property, room: matchedRoom });
                  }}
                  className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire About This Stay</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const matchedRoom =
                      publishedRooms.find((r) => r.name === roomPreference) || null;
                    onOpenPlanHolidayWithProperty(
                      property,
                      matchedRoom ? { roomId: matchedRoom.id || matchedRoom.name } : undefined
                    );
                  }}
                  className="bg-white hover:bg-[#FAF9F6] text-[#0B5E8E] border border-[#0B5E8E]/30 font-bold text-sm py-4 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Add stay to my plan</span>
                </button>
              </div>

            </div>

            {/* Right Column: Hero Image Container */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => openLightboxForImage(property.heroImage)}
                className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200/80 aspect-[4/3] bg-gray-100 group cursor-pointer"
              >
                <img
                  src={property.heroImage}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
                    <span className="font-semibold">{editorial("travel/AccommodationDetailPage.text10")}</span>
                  </div>
                  <span className="text-[11px] text-[#C9A66B] font-bold flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    <span>{editorial("travel/AccommodationDetailPage.text11")}</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Property Overview & Unified Accommodation Enquiry Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 space-y-4">
              <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block">
                {categoryBadge} · {property.location}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                About {property.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {property.editorialOverview || property.shortDescription}
              </p>
              {property.whyWeRecommend && (
                <div className="rounded-xl bg-[#FAF9F6] border border-gray-200/80 p-4 text-xs sm:text-sm text-[#0B5E8E]">
                  <strong className="block mb-1">Why Our Local Team Recommends It:</strong>
                  <span className="text-gray-700">{property.whyWeRecommend}</span>
                </div>
              )}
            </div>

        {/* At a Glance Specs Grid */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#C9A66B]" />
            <span>{editorial("travel/AccommodationDetailPage.text12")}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
            {editorial("travel/AccommodationDetailPage.text13")}</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Hotel className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text14")}</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.type}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Star className="w-5 h-5 text-[#C9A66B]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text15")}</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.starRating}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Users className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text16")}</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.bestFor}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <MapPin className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text17")}</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.distanceFromFalls}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Waves className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text18")}</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.pool}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Utensils className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text19")}</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.restaurant}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Wifi className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text20")}</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.wifi}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Users className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text21")}</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.familyFriendly}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Plane className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text22")}</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.transfers}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Bed className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text23")}</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.roomTypesSummary}</span>
            </div>

          </div>
        </section>

        {/* Editorial Overview Section */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Compass className="w-4 h-4 text-[#C9A66B]" />
            <span>{editorial("travel/AccommodationDetailPage.text24")}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
            {editorial("travel/AccommodationDetailPage.text25")}</h2>

          <p className="text-sm sm:text-base text-gray-700 font-light leading-relaxed">
            {property.editorialOverview}
          </p>
        </section>

        {/* Why We Recommend This Stay Section */}
        <section className="bg-gradient-to-r from-[#0B5E8E]/10 via-[#FAF9F6] to-[#C9A66B]/10 p-6 sm:p-8 rounded-2xl border border-[#0B5E8E]/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Award className="w-4 h-4 text-[#C9A66B]" />
            <span>{editorial("travel/AccommodationDetailPage.text26")}</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
            {editorial("travel/AccommodationDetailPage.text27")}</h2>

          <p className="text-sm sm:text-base text-gray-800 font-serif leading-relaxed italic">
            "{property.whyWeRecommend}"
          </p>
        </section>

        {/* Photo Gallery Masonry */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                <span>{editorial("travel/AccommodationDetailPage.text28")}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E] mt-1">
                {editorial("travel/AccommodationDetailPage.text29")}</h2>
            </div>
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">{editorial("travel/AccommodationDetailPage.text30")}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.galleryImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightboxForImage(img)}
                className="relative rounded-xl overflow-hidden h-48 sm:h-56 bg-gray-100 border border-gray-200 group cursor-pointer"
              >
                <img
                  src={img}
                  alt={`${property.name} gallery image ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Room / Accommodation Unit Types Section */}
        {publishedRooms.length > 0 && (
          <section id="accommodation-units" className="space-y-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
                <Bed className="w-4 h-4 text-[#C9A66B]" />
                <span>{editorial("travel/AccommodationDetailPage.text31")}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                {property.roomSectionHeading?.trim() || editorial("travel/AccommodationDetailPage.text32")}
              </h2>

              {property.roomSectionSubtitle && (
                <p className="text-xs sm:text-sm text-gray-600 font-light">
                  {property.roomSectionSubtitle}
                </p>
              )}

              {wings.length > 1 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveWing('ALL')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      activeWing === 'ALL'
                        ? 'bg-[#0B5E8E] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#0B5E8E]'
                    }`}
                  >
                    All Options ({publishedRooms.length})
                  </button>
                  {wings.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setActiveWing(w)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        activeWing === w
                          ? 'bg-[#0B5E8E] text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-[#0B5E8E]'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleRooms.map((room, idx) => {
                const unitGallery = getRoomGalleryImages(room, property.heroImage);
                const mainImg = unitGallery[0]?.url || property.heroImage;
                const unitPriceUSD = getRoomStartingPriceUSD(room, property);
                const unitPriceSuffix = getRoomPriceUnitLabel(room);
                const availBadge = getUnitAvailabilityBadge(room);
                const capacityText = getRoomCapacityLabel(room);
                const bedSummary = getRoomBedSummary(room);
                const unitAmenities = getRoomDisplayAmenities(room);
                const previewAmenities = unitAmenities.slice(0, 5);
                const extraAmenityCount = Math.max(0, unitAmenities.length - previewAmenities.length);

                return (
                  <article
                    key={room.id || `${room.name}-${idx}`}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-lg transition-shadow p-5 sm:p-6 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3.5">
                      <div
                        onClick={() => setDetailRoom(room)}
                        className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer"
                      >
                        <img
                          src={mainImg}
                          alt={unitGallery[0]?.alt || room.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          {room.featured && (
                            <span className="bg-[#E67E22] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                              Featured
                            </span>
                          )}
                          {room.unitCategory && (
                            <span className="bg-[#0D2833]/85 text-[#E5C989] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                              {room.unitCategory}
                            </span>
                          )}
                          {room.wing && (
                            <span className="bg-amber-900/85 text-amber-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                              {room.wing}
                            </span>
                          )}
                          {availBadge && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                availBadge.tone === 'rose'
                                  ? 'bg-red-700/90 text-white'
                                  : 'bg-amber-600/90 text-white'
                              }`}
                            >
                              {availBadge.label}
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2.5 left-2.5 bg-black/65 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-[#C9A66B]" />
                          <span>{capacityText}</span>
                        </div>

                        {unitGallery.length > 1 && (
                          <div className="absolute bottom-2.5 right-2.5 bg-black/65 text-white text-[11px] font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" />
                            <span>{unitGallery.length} photos</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-serif font-bold text-lg sm:text-xl text-[#0B5E8E] leading-snug break-words">
                            {room.name}
                          </h3>
                          {(bedSummary || (typeof room.sizeSqm === 'number' && room.sizeSqm > 0)) && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {[
                                bedSummary,
                                typeof room.sizeSqm === 'number' && room.sizeSqm > 0
                                  ? `${room.sizeSqm} m²`
                                  : '',
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          {unitPriceUSD !== null ? (
                            <div>
                              <span className="text-sm sm:text-base font-serif font-bold text-[#0B5E8E] block whitespace-nowrap">
                                From {formatPrice(unitPriceUSD)}
                              </span>
                              <span className="text-[10px] text-gray-500 block whitespace-nowrap">
                                {unitPriceSuffix}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm font-serif font-bold text-[#0B5E8E] whitespace-nowrap">
                              Price on enquiry
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed line-clamp-3">
                        {room.shortDescription || room.description}
                      </p>

                      {previewAmenities.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {previewAmenities.map((am) => (
                            <span
                              key={am.id}
                              className="bg-[#FAF9F6] border border-gray-200 text-gray-700 text-[11px] font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1.5"
                            >
                              <RoomAmenityIcon icon={am.icon} className="w-3 h-3 text-[#3F6B3C] shrink-0" />
                              <span>{am.label}</span>
                            </span>
                          ))}
                          {extraAmenityCount > 0 && (
                            <span className="bg-[#FAF9F6] border border-gray-200 text-gray-500 text-[11px] font-medium px-2 py-1 rounded-md">
                              +{extraAmenityCount} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDetailRoom(room)}
                        className="px-4 py-2.5 rounded-xl border border-[#0B5E8E]/30 text-[#0B5E8E] hover:bg-[#0B5E8E] hover:text-white text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRoomPreference(room.name);
                          setEnquiryTarget({ property, room });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#d36e17] text-white text-xs font-bold transition-colors cursor-pointer text-center flex-1 sm:flex-initial"
                      >
                        {room.customCtaLabel ||
                          (isSingleHome ? 'Enquire About This Stay' : 'Enquire About This Room')}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Promotional Offers & Special Packages */}
        {publishedOffers.length > 0 && (
          <section id="property-offers" className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                <span>Seasonal Packages &amp; Value-Add Deals</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                Special Offers at {property.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publishedOffers.map((off) => {
                const eligibleUnits = off.applyToEntireProperty
                  ? publishedRooms
                  : publishedRooms.filter((r) => r.id && off.applicableUnitIds?.includes(r.id));
                const targetUnit = eligibleUnits[0] || publishedRooms[0] || null;
                const catLabelMap: Record<string, string> = {
                  special_offer: 'Special Offer',
                  honeymoon_package: 'Honeymoon Package',
                  seasonal_promotion: 'Seasonal Promotion',
                  meal_plan: 'Meal Plan Offer',
                  added_value: 'Added Value Package',
                };
                const catLabel = off.offerCategory ? catLabelMap[off.offerCategory] || '' : '';

                return (
                  <article
                    key={off.id}
                    className="bg-white rounded-2xl border border-[#C9A66B]/40 shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {catLabel && (
                            <span className="inline-block mb-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E]">
                              {catLabel}
                            </span>
                          )}
                          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B5E8E]">
                            {off.title}
                          </h3>
                        </div>
                        <span className="bg-[#E67E22] text-white text-[11px] font-bold px-3 py-1 rounded-full shrink-0">
                          {getOfferDisplayBadge(off, currency)}
                        </span>
                      </div>
                      {off.description && (
                        <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                          {off.description}
                        </p>
                      )}
                      {eligibleUnits.length > 0 && (
                        <p className="text-xs text-[#0B5E8E]">
                          <strong>Applicable Units:</strong>{' '}
                          {eligibleUnits.map((u) => u.name).join(', ')}
                        </p>
                      )}
                      {(off.validFrom || off.validTo) && (
                        <p className="text-[11px] text-gray-500">
                          Valid {off.validFrom || 'now'} to {off.validTo || 'further notice'}
                        </p>
                      )}
                      {off.includedServices && off.includedServices.length > 0 && (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-700 pt-1">
                          {off.includedServices.map((srv, sidx) => (
                            <li key={sidx} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#3F6B3C] shrink-0" />
                              <span>{srv}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {off.conditions && (
                        <p className="text-[11px] text-gray-500 bg-[#FAF9F6] border border-gray-200 rounded-xl p-2.5">
                          {off.conditions}
                        </p>
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setEnquiryTarget({
                            property,
                            room: targetUnit,
                            offer: off,
                          })
                        }
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        {off.ctaLabel || 'Enquire About This Offer'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Facilities Section */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Building className="w-4 h-4 text-[#C9A66B]" />
            <span>{editorial("travel/AccommodationDetailPage.text36")}</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
            {editorial("travel/AccommodationDetailPage.text37")}</h2>

          {propertyAmenityLabels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {propertyAmenityLabels.map((amLabel, idx) => (
                <span
                  key={`${amLabel}-${idx}`}
                  className="bg-[#FAF9F6] border border-gray-200/80 text-[#0B5E8E] text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3F6B3C]" />
                  <span>{amLabel}</span>
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {property.facilities.map((fac, idx) => (
              <div
                key={idx}
                className="bg-[#FAF9F6] p-3.5 rounded-xl border border-gray-200/80 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A66B]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#0B5E8E] block">{fac.name}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase">{fac.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Location & Access Info */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <MapPin className="w-4 h-4 text-[#C9A66B]" />
            <span>{editorial("travel/AccommodationDetailPage.text38")}</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
            {editorial("travel/AccommodationDetailPage.text39")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-xs sm:text-sm text-gray-700">
              <div className="space-y-1">
                <span className="font-bold text-[#0B5E8E] block">{editorial("travel/AccommodationDetailPage.text40")}</span>
                <p className="font-light">{property.locationInfo.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">{editorial("travel/AccommodationDetailPage.text41")}</span>
                  <span className="font-bold text-[#0B5E8E]">{property.locationInfo.distanceToFalls}</span>
                </div>

                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">{editorial("travel/AccommodationDetailPage.text42")}</span>
                  <span className="font-bold text-[#0B5E8E]">{property.locationInfo.distanceToAirport}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="font-bold text-[#0B5E8E] block mb-1">{editorial("travel/AccommodationDetailPage.text43")}</span>
                <p className="font-light">{property.locationInfo.departurePoints}</p>
              </div>

              {(property.checkInTime || property.checkOutTime) && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {property.checkInTime && (
                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#0B5E8E]" />
                        Check-in
                      </span>
                      <span className="font-bold text-[#0B5E8E]">{property.checkInTime}</span>
                    </div>
                  )}
                  {property.checkOutTime && (
                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#0B5E8E]" />
                        Check-out
                      </span>
                      <span className="font-bold text-[#0B5E8E]">{property.checkOutTime}</span>
                    </div>
                  )}
                </div>
              )}

              {(property.enquirySettings?.contactEmail ||
                property.enquirySettings?.whatsappNumber ||
                property.enquirySettings?.contactPhone) && (
                <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200 space-y-1.5 text-xs">
                  <span className="font-bold text-[#0B5E8E] uppercase tracking-wider block">
                    Reservations &amp; Desk Contact
                  </span>
                  {property.enquirySettings.contactEmail && (
                    <p>
                      <strong>Email:</strong> {property.enquirySettings.contactEmail}
                    </p>
                  )}
                  {property.enquirySettings.contactPhone && (
                    <p>
                      <strong>Phone:</strong> {property.enquirySettings.contactPhone}
                    </p>
                  )}
                  {property.enquirySettings.whatsappNumber && (
                    <p>
                      <strong>WhatsApp:</strong> {property.enquirySettings.whatsappNumber}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="font-bold text-xs text-[#0B5E8E] uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text44")}</span>
                <ul className="space-y-1.5 text-xs text-gray-600 font-light">
                  {property.locationInfo.nearbyAttractions.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B5E8E]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="font-bold text-xs text-[#0B5E8E] uppercase tracking-wider block">{editorial("travel/AccommodationDetailPage.text45")}</span>
                <ul className="space-y-1.5 text-xs text-gray-600 font-light">
                  {property.locationInfo.nearbyRestaurants.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* General Property Policies (if configured) */}
        {property.policies &&
          (property.policies.checkInPolicy ||
            property.policies.checkOutPolicy ||
            property.policies.cancellationPolicy ||
            property.policies.childPolicy ||
            property.policies.petPolicy ||
            property.policies.generalNotes) && (
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
                <span>Property Policies</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                Good to Know &amp; Property Policies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-700">
                {property.policies.checkInPolicy && (
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
                    <strong className="text-[#0B5E8E] block mb-1">Check-in Policy</strong>
                    <p className="font-light">{property.policies.checkInPolicy}</p>
                  </div>
                )}
                {property.policies.checkOutPolicy && (
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
                    <strong className="text-[#0B5E8E] block mb-1">Check-out Policy</strong>
                    <p className="font-light">{property.policies.checkOutPolicy}</p>
                  </div>
                )}
                {property.policies.cancellationPolicy && (
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
                    <strong className="text-[#0B5E8E] block mb-1">Cancellation Policy</strong>
                    <p className="font-light">{property.policies.cancellationPolicy}</p>
                  </div>
                )}
                {property.policies.childPolicy && (
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
                    <strong className="text-[#0B5E8E] block mb-1">Child &amp; Family Policy</strong>
                    <p className="font-light">{property.policies.childPolicy}</p>
                  </div>
                )}
                {property.policies.petPolicy && (
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
                    <strong className="text-[#0B5E8E] block mb-1">Pet Policy</strong>
                    <p className="font-light">{property.policies.petPolicy}</p>
                  </div>
                )}
                {property.policies.generalNotes && (
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
                    <strong className="text-[#0B5E8E] block mb-1">Additional Notes</strong>
                    <p className="font-light">{property.policies.generalNotes}</p>
                  </div>
                )}
              </div>
            </section>
          )}
          </div>

          <aside id="accommodation-enquiry-panel" className="lg:col-span-4 lg:sticky lg:top-28">
            <UnifiedEnquiryPanel
              mode="accommodation"
              currency={currency}
              itemTitle={property.name}
              itemSlug={property.slug || property.id}
              basePriceUSD={hasGuidePrice ? displayPriceUSD : null}
              priceLabelPrefix="Indicative Stay Rate"
              priceSuffix={priceUnitLabel || 'per night'}
              maxGuests={maxGuests ?? undefined}
              roomOptions={publishedRooms.map((r) => ({
                id: r.id,
                name: r.name,
                occupancy: getRoomCapacityLabel(r),
                maxGuests: getRoomMaxGuests(r) ?? (maxGuests ?? undefined),
                pricePerNightUSD: getRoomStartingPriceUSD(r, property),
                room: r,
              }))}
              selectedRoomName={roomPreference}
              onSelectedRoomChange={setRoomPreference}
              pricingBasis={/person|sharing/i.test(priceUnitLabel || '') ? 'per_person' : 'per_room'}
              whatsappButtonLabel="Enquire About Availability"
              emailButtonLabel="Send Stay Enquiry by Email"
            />
          </aside>
        </div>

        {/* Nearby Experiences (Clickable Experience Cards) */}
        {matchedExperiences.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-[#C9A66B]" />
              <span>{editorial("travel/AccommodationDetailPage.text46")}</span>
            </div>

            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                {editorial("travel/AccommodationDetailPage.text47")}{property.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-light mt-1">
                {editorial("travel/AccommodationDetailPage.text48")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {matchedExperiences.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => onSelectExperience(exp)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                      <img
                        src={exp.featuredImage}
                        alt={exp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                      
                      <div className="absolute bottom-2 left-2 bg-white/90 text-[#0B5E8E] backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold">
                        {exp.duration}
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h3 className="font-serif font-bold text-sm text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors line-clamp-1">
                        {exp.title}
                      </h3>
                      <p className="text-[11px] text-gray-600 line-clamp-2 font-light">
                        {exp.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <span className="text-[11px] font-bold text-[#0B5E8E] flex items-center gap-1">
                      <span>{editorial("travel/AccommodationDetailPage.text49")}</span>
                      <ArrowRight className="w-3 h-3 text-[#C9A66B]" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Places to Stay */}
        {relatedProperties.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-gray-200">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                {editorial("travel/AccommodationDetailPage.text50")}</h2>
              <p className="text-xs sm:text-sm text-gray-600 font-light mt-1">
                {editorial("travel/AccommodationDetailPage.text51")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProperties.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelatedProperty(rel)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                      <img
                        src={rel.heroImage}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                      
                      {rel.badge && (
                        <div className="absolute top-3 left-3 bg-[#E67E22] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {rel.badge}
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 text-white text-xs font-serif font-bold">
                        {editorial("travel/AccommodationDetailPage.text52")}{formatPrice(rel.priceFromUSD)}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-serif font-bold text-base text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors line-clamp-1">
                        {rel.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-light">
                        {rel.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <PageLink href={accommodationPath(rel)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRelatedProperty(rel);
                      }}
                      className="w-full bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{editorial("travel/AccommodationDetailPage.text53")}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                    </PageLink>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Final Closing CTA Banner */}
        <section className="bg-[#0B5E8E] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-[#C9A66B] text-xs font-bold uppercase tracking-widest block">
              {editorial("travel/AccommodationDetailPage.text54")}</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              {editorial("travel/AccommodationDetailPage.text55")}</h2>
            <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed">
              {editorial("travel/AccommodationDetailPage.text56")}{property.name} {editorial("travel/AccommodationDetailPage.text57")}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <button
              type="button"
              onClick={() => {
                const matchedRoom =
                  publishedRooms.find((r) => r.name === roomPreference) || null;
                setEnquiryTarget({ property, room: matchedRoom });
              }}
              className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enquire About This Stay</span>
            </button>
          </div>
        </section>

      </div>

      {/* Room / Unit Detail Modal */}
      <RoomDetailModal
        property={property}
        room={detailRoom}
        currency={currency}
        onClose={() => setDetailRoom(null)}
        onAddRoomToPlan={(room, prefill) => {
          setDetailRoom(null);
          setRoomPreference(room.name);
          onOpenPlanHolidayWithProperty(property, {
            roomId: room.id || room.name,
            ratePlanId: prefill?.ratePlanId,
            mealPlanId: prefill?.mealPlanId,
            arrivalDate: prefill?.checkIn,
            departureDate: prefill?.checkOut,
            adults: prefill?.adults,
            childAgesYears: prefill?.childrenCount
              ? Array(prefill.childrenCount).fill(10)
              : undefined,
          });
        }}
        onEnquireRoom={(room, prefill) => {
          setDetailRoom(null);
          setRoomPreference(room.name);
          setEnquiryTarget({
            property,
            room,
            offer: prefill?.offer ?? null,
            ratePlanId: prefill?.ratePlanId,
            ratePlanLabel: prefill?.ratePlanLabel,
            visitorMarket: prefill?.visitorMarket,
            checkIn: prefill?.checkIn,
            checkOut: prefill?.checkOut,
            adults: prefill?.adults,
            childrenCount: prefill?.childrenCount,
            mealPlanId: prefill?.mealPlanId,
          });
        }}
      />

      {/* Room Direct Enquiry Modal (WhatsApp & Email) */}
      <RoomEnquiryModal
        target={enquiryTarget}
        currency={currency}
        onClose={() => setEnquiryTarget(null)}
      />

      {/* Gallery Lightbox Modal with Prev/Next Navigation */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={allPropertyImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

    </div>
  );
};
