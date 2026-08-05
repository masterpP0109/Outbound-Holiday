import React, { useState } from 'react';
import { DetailedAccommodation, getAccommodationBySlug, ALL_ACCOMMODATIONS } from '../../data/accommodationsData';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { Experience, getExperienceById, ALL_EXPERIENCES } from '../../data/experiencesData';
import { 
  Home, 
  ArrowLeft, 
  MapPin, 
  Star, 
  MessageCircle, 
  CalendarCheck, 
  ShieldCheck, 
  Hotel, 
  Utensils, 
  Wifi, 
  Waves, 
  Users, 
  Plane, 
  Bed, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Award, 
  ChevronRight, 
  ArrowRight,
  Maximize2,
  X,
  Compass,
  Check,
  Building,
  Coffee
} from 'lucide-react';

interface AccommodationDetailPageProps {
  property: DetailedAccommodation;
  currency: Currency;
  onOpenPlanHolidayWithProperty: (property: DetailedAccommodation) => void;
  onSelectExperience: (exp: Experience) => void;
  onSelectRelatedProperty: (prop: DetailedAccommodation) => void;
  onNavigateBackToDirectory: () => void;
  onNavigateHome: () => void;
}

export const AccommodationDetailPage: React.FC<AccommodationDetailPageProps> = ({
  property,
  currency,
  onOpenPlanHolidayWithProperty,
  onSelectExperience,
  onSelectRelatedProperty,
  onNavigateBackToDirectory,
  onNavigateHome,
}) => {
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Outbound Holidays,\n\nI'm interested in staying at ${property.name} and would like to know about availability, pricing and your recommendation.\n\nThank you.`
  );
  const whatsappUrl = `https://wa.me/263714701721?text=${whatsappMessage}`;

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
            <button
              onClick={onNavigateHome}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <button
              onClick={onNavigateBackToDirectory}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Where to Stay
            </button>
            <span>/</span>
            <span className="text-[#C9A66B] font-semibold truncate max-w-[160px] sm:max-w-none">
              {property.name}
            </span>
          </nav>

          <button
            onClick={onNavigateBackToDirectory}
            className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Places to Stay</span>
          </button>
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
                  <span>{property.category}</span>
                </span>

                <span className="bg-[#FAF9F6] text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0B5E8E]" />
                  <span>{property.distanceFromFalls}</span>
                </span>
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

              {/* Price & Rating Callout */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-gray-500 block">Indicative Starting Rate</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-serif font-bold text-[#0B5E8E]">
                      From {formatPrice(property.priceFromUSD)}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">/ night</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs">
                  <Star className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
                  <span className="font-bold text-[#0B5E8E]">{property.rating} / 5.0</span>
                  <span className="text-gray-400">({property.reviewCount} guest reviews)</span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => onOpenPlanHolidayWithProperty(property)}
                  className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Check Availability</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm py-4 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

            </div>

            {/* Right Column: Hero Image Container */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => setSelectedLightboxImage(property.heroImage)}
                className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200/80 aspect-[4/3] bg-gray-100 group cursor-pointer"
              >
                <img
                  src={property.heroImage}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
                    <span className="font-semibold">Outbound Local Advisor Choice</span>
                  </div>
                  <span className="text-[11px] text-[#C9A66B] font-bold flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    <span>View Photos</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* At a Glance Specs Grid */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#C9A66B]" />
            <span>PROPERTY AT A GLANCE</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
            At a Glance Overview
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Hotel className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Type</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.type}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Star className="w-5 h-5 text-[#C9A66B]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Star Rating</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.starRating}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Users className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Best For</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.bestFor}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <MapPin className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Distance to Falls</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.distanceFromFalls}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Waves className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Swimming Pool</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.pool}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Utensils className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Restaurant</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.restaurant}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Wifi className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Wi-Fi</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.wifi}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Users className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Family Friendly</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.familyFriendly}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Plane className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Transfers</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.transfers}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-1.5">
              <Bed className="w-5 h-5 text-[#0B5E8E]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Room Types</span>
              <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-1">{property.atAGlance.roomTypesSummary}</span>
            </div>

          </div>
        </section>

        {/* Editorial Overview Section */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Compass className="w-4 h-4 text-[#C9A66B]" />
            <span>LOCAL ADVISOR EDITORIAL REVIEW</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
            Editorial Overview
          </h2>

          <p className="text-sm sm:text-base text-gray-700 font-light leading-relaxed">
            {property.editorialOverview}
          </p>
        </section>

        {/* Why We Recommend This Stay Section */}
        <section className="bg-gradient-to-r from-[#0B5E8E]/10 via-[#FAF9F6] to-[#C9A66B]/10 p-6 sm:p-8 rounded-2xl border border-[#0B5E8E]/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Award className="w-4 h-4 text-[#C9A66B]" />
            <span>OUTBOUND SPECIALIST SELECTION</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
            Why We Recommend This Stay
          </h2>

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
                <span>PHOTO GALLERY</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E] mt-1">
                Explore Property Photos
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">Click any photo to enlarge</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.galleryImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedLightboxImage(img)}
                className="relative rounded-xl overflow-hidden h-48 sm:h-56 bg-gray-100 border border-gray-200 group cursor-pointer"
              >
                <img
                  src={img}
                  alt={`${property.name} gallery image ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Room Types Section */}
        {property.roomTypes.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
              <Bed className="w-4 h-4 text-[#C9A66B]" />
              <span>ACCOMMODATION OPTIONS</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
              Room Types & Suites
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {property.roomTypes.map((room, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="h-48 w-full rounded-xl overflow-hidden bg-gray-100 relative">
                      <img
                        src={room.imageUrl}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                        Occupancy: {room.occupancy}
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#0B5E8E]">
                      {room.name}
                    </h3>

                    <p className="text-xs text-gray-600 font-light leading-relaxed">
                      {room.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {room.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="bg-[#FAF9F6] border border-gray-200 text-gray-700 text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-[#3F6B3C]" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Customisable for your stay</span>
                    <button
                      onClick={() => onOpenPlanHolidayWithProperty(property)}
                      className="text-xs font-bold text-[#E67E22] hover:underline cursor-pointer"
                    >
                      Request This Room →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Facilities Section */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Building className="w-4 h-4 text-[#C9A66B]" />
            <span>PROPERTY AMENITIES</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
            Lodge Facilities & Guest Amenities
          </h2>

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
            <span>LOCATION & ACCESSIBILITY</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
            Location & Surrounding Area
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-xs sm:text-sm text-gray-700">
              <div className="space-y-1">
                <span className="font-bold text-[#0B5E8E] block">Address / Setting:</span>
                <p className="font-light">{property.locationInfo.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Distance to Falls</span>
                  <span className="font-bold text-[#0B5E8E]">{property.locationInfo.distanceToFalls}</span>
                </div>

                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Distance to Airport</span>
                  <span className="font-bold text-[#0B5E8E]">{property.locationInfo.distanceToAirport}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="font-bold text-[#0B5E8E] block mb-1">Departure & Activity Pickups:</span>
                <p className="font-light">{property.locationInfo.departurePoints}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="font-bold text-xs text-[#0B5E8E] uppercase tracking-wider block">Nearby Attractions</span>
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
                <span className="font-bold text-xs text-[#0B5E8E] uppercase tracking-wider block">Nearby Dining Options</span>
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

        {/* Nearby Experiences (Clickable Experience Cards) */}
        {matchedExperiences.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-[#C9A66B]" />
              <span>NEARBY EXPERIENCES</span>
            </div>

            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                Activities Easily Accessible from {property.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-light mt-1">
                Click any experience below to view activity itineraries and details.
              </p>
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
                      <span>View Activity</span>
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
                You May Also Like
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-light mt-1">
                Explore similar recommended stays in Victoria Falls.
              </p>
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
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                      
                      {rel.badge && (
                        <div className="absolute top-3 left-3 bg-[#E67E22] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {rel.badge}
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 text-white text-xs font-serif font-bold">
                        From {formatPrice(rel.priceFromUSD)}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRelatedProperty(rel);
                      }}
                      className="w-full bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Property</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                    </button>
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
              YOUR VICTORIA FALLS ITINERARY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to Stay Here?
            </h2>
            <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed">
              Let our local Victoria Falls specialists include {property.name} in your personalised holiday itinerary.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <button
              onClick={() => onOpenPlanHolidayWithProperty(property)}
              className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Include This Stay in My Holiday</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm py-4 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </section>

      </div>

      {/* Lightbox Modal */}
      {selectedLightboxImage && (
        <div 
          onClick={() => setSelectedLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-5xl w-full max-h-[90vh]">
            <img
              src={selectedLightboxImage}
              alt={property.name}
              className="w-full h-full object-contain rounded-xl"
            />
            <button
              onClick={() => setSelectedLightboxImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
