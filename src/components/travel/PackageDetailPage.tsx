import React, { useState } from 'react';
import { DetailedPackage, ALL_PACKAGES, getPackageById } from '../../data/packagesData';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { Experience, ALL_EXPERIENCES, getExperienceById } from '../../data/experiencesData';
import { 
  Home, 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  CalendarCheck, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Hotel, 
  Utensils, 
  Compass, 
  Car, 
  Globe2, 
  Users, 
  Activity, 
  Sun,
  ArrowRight,
  Info,
  HelpCircle,
  Heart,
  Award
} from 'lucide-react';

interface PackageDetailPageProps {
  packageData: DetailedPackage;
  currency: Currency;
  onPlanHoliday: (pkg: DetailedPackage) => void;
  onSelectExperience: (exp: Experience) => void;
  onSelectRelatedPackage: (pkg: DetailedPackage) => void;
  onNavigateBackToPackages: () => void;
  onNavigateHome: () => void;
}

export const PackageDetailPage: React.FC<PackageDetailPageProps> = ({
  packageData,
  currency,
  onPlanHoliday,
  onSelectExperience,
  onSelectRelatedPackage,
  onNavigateBackToPackages,
  onNavigateHome,
}) => {
  const [openItineraryDay, setOpenItineraryDay] = useState<number | null>(0); // open first day by default
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Outbound Holidays,\n\nI’m interested in the "${packageData.title}" package (${packageData.duration}) and would like to know more about availability, pricing and personalisation options.\n\nThank you.`
  );
  const whatsappUrl = `https://wa.me/263714701721?text=${whatsappMessage}`;

  // Find matching included experiences from ALL_EXPERIENCES
  const matchedExperiences = packageData.includedExperienceIds
    .map((expId) => getExperienceById(expId) || ALL_EXPERIENCES.find((e) => e.id === expId))
    .filter((e): e is Experience => e !== undefined);

  // Find related packages
  const relatedPackages = packageData.relatedPackageIds
    .map((id) => ALL_PACKAGES.find((p) => p.id === id))
    .filter((p): p is DetailedPackage => p !== undefined && p.id !== packageData.id)
    .slice(0, 3);

  // Find alternative recommended package for "Is this right for you" section
  const alternativePackage = packageData.whoIsThisFor?.alternativeSlug
    ? getPackageById(packageData.whoIsThisFor.alternativeSlug)
    : undefined;

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
              onClick={onNavigateBackToPackages}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Holiday Packages
            </button>
            <span>/</span>
            <span className="text-[#C9A66B] font-semibold truncate max-w-[160px] sm:max-w-none">
              {packageData.title}
            </span>
          </nav>

          <button
            onClick={onNavigateBackToPackages}
            className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Packages</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Hero Details */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-[#E67E22] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {packageData.badge}
                </span>

                <span className="bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>{packageData.duration}</span>
                </span>

                <span className="bg-[#C9A66B]/15 text-[#8c6d32] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{packageData.travellerType}</span>
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B5E8E] tracking-tight leading-tight">
                  {packageData.title}
                </h1>
                <p className="text-base sm:text-lg text-[#E67E22] font-semibold">
                  {packageData.tagline}
                </p>
                <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
                  {packageData.description}
                </p>
              </div>

              {/* Price Callout */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-gray-500 block">Estimated Holiday Investment</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-serif font-bold text-[#0B5E8E]">
                      From {formatPrice(packageData.priceUSD)}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">/ person (per double occupancy)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#0B5E8E] font-semibold bg-white p-2.5 rounded-xl border border-gray-200">
                  <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
                  <span>100% Tailored by Local Specialists</span>
                </div>
              </div>

              {/* Primary Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => onPlanHoliday(packageData)}
                  className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Personalise This Holiday</span>
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
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200/80 aspect-[4/3] bg-gray-100 group">
                <img
                  src={packageData.imageUrl}
                  alt={packageData.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
                    <span className="font-bold">{packageData.rating} Rating</span>
                    <span className="text-gray-300">({packageData.reviewCount} verified guest reviews)</span>
                  </div>
                  <span className="text-[11px] text-[#C9A66B] font-semibold">Outbound Local Choice</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* At a Glance Specs Grid */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#C9A66B]" />
            <span>PACKAGE AT A GLANCE</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
            Holiday Specifications & Highlights
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Duration</span>
                <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-2">{packageData.duration}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center">
                <Hotel className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Accommodation Style</span>
                <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-2">{packageData.highlightsMeta.accommodation}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Transfers</span>
                <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-2">{packageData.highlightsMeta.transfers}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Meals</span>
                <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-2">{packageData.highlightsMeta.meals}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Best For</span>
                <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-2">{packageData.highlightsMeta.bestFor}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Holiday Pace</span>
                <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-2">{packageData.highlightsMeta.difficulty}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Best Time to Travel</span>
                <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-2">{packageData.highlightsMeta.season}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Countries Covered</span>
                <span className="text-xs font-semibold text-[#0B5E8E] line-clamp-2">{packageData.highlightsMeta.countries}</span>
              </div>
            </div>

          </div>
        </section>

        {/* Self-Selection: Is This Holiday Right for You? */}
        {packageData.whoIsThisFor && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
              <Award className="w-4 h-4 text-[#C9A66B]" />
              <span>SELF-SELECTION ADVISOR</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
              Is This Holiday Right for You?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              
              {/* Perfect If You */}
              <div className="bg-[#FAF9F6] p-6 rounded-xl border border-gray-200 space-y-4">
                <h3 className="font-serif font-bold text-base text-[#0B5E8E] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#3F6B3C]" />
                  <span>Perfect if you:</span>
                </h3>
                <ul className="space-y-3">
                  {packageData.whoIsThisFor.perfectIf.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3F6B3C] shrink-0 mt-2" />
                      <span className="leading-relaxed font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Consider Another Package If You */}
              <div className="bg-[#FAF9F6] p-6 rounded-xl border border-gray-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E] flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#E67E22]" />
                    <span>Consider another package if you:</span>
                  </h3>
                  <ul className="space-y-3">
                    {packageData.whoIsThisFor.considerOthersIf.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22] shrink-0 mt-2" />
                        <span className="leading-relaxed font-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {alternativePackage && (
                  <div className="pt-4 mt-4 border-t border-gray-200/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">Recommended Alternative:</span>
                    <button
                      onClick={() => onSelectRelatedPackage(alternativePackage)}
                      className="text-xs font-bold text-[#0B5E8E] hover:text-[#C9A66B] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{alternativePackage.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </section>
        )}

        {/* Editorial Story Introduction */}
        {packageData.storyIntroduction && (
          <section className="bg-gradient-to-r from-[#0B5E8E]/10 via-[#FAF9F6] to-[#C9A66B]/10 p-8 rounded-2xl border border-[#0B5E8E]/20 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-[#C9A66B]" />
              <span>THE EXPERIENCE</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
              What This Holiday Feels Like
            </h2>
            <p className="text-base sm:text-lg text-gray-800 font-serif leading-relaxed italic">
              "{packageData.storyIntroduction}"
            </p>
          </section>
        )}

        {/* Why We Designed This Holiday (Trusted Advisor Advice) */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
            <span>LOCAL SPECIALIST INSIGHT</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
            Why We Designed This Holiday
          </h2>

          <div className="space-y-3 text-sm text-gray-700 leading-relaxed font-light">
            <p>
              {packageData.whyWeRecommend || "Many travellers struggle to balance timing, activity pace, and lodge transfers when planning a trip to Victoria Falls. We designed this itinerary as a trusted framework to eliminate guesswork and ensure every day flows naturally."}
            </p>
            <div className="text-xs text-[#0B5E8E] font-medium bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C9A66B] shrink-0 mt-0.5" />
              <span><strong>Advisor Note:</strong> This itinerary is completely customizable. Whether you wish to upgrade accommodations, add extra nights in Hwange or Chobe, or adjust activity times to match your flight schedule, our local Victoria Falls travel team will tailor every detail for you.</span>
            </div>
          </div>
        </section>

        {/* Day-by-Day Itinerary Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Clock className="w-4 h-4 text-[#C9A66B]" />
            <span>DAY-BY-DAY ITINERARY</span>
          </div>

          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
              Detailed Day-by-Day Journey
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-light mt-1">
              Explore the daily morning, afternoon, and evening schedule included in this holiday.
            </p>
          </div>

          <div className="space-y-4">
            {(packageData.detailedItinerary || packageData.itinerary).map((item, idx) => {
              const isOpen = openItineraryDay === idx;
              const detailed = 'morning' in item ? (item as any) : null;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenItineraryDay(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0B5E8E] text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {item.day}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#0B5E8E]">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {detailed ? `${detailed.morning}` : item.description}
                        </p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-5 sm:p-6 pt-0 border-t border-gray-100 bg-[#FAF9F6]/50 space-y-6">
                      
                      {detailed ? (
                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Morning */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200/80 space-y-1.5">
                              <span className="text-[10px] font-bold text-[#E67E22] uppercase tracking-wider block">Morning</span>
                              <p className="text-xs text-gray-700 leading-relaxed font-light">{detailed.morning}</p>
                            </div>

                            {/* Afternoon */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200/80 space-y-1.5">
                              <span className="text-[10px] font-bold text-[#0B5E8E] uppercase tracking-wider block">Afternoon</span>
                              <p className="text-xs text-gray-700 leading-relaxed font-light">{detailed.afternoon}</p>
                            </div>

                            {/* Evening */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200/80 space-y-1.5">
                              <span className="text-[10px] font-bold text-[#C9A66B] uppercase tracking-wider block">Evening</span>
                              <p className="text-xs text-gray-700 leading-relaxed font-light">{detailed.evening}</p>
                            </div>

                          </div>

                          {/* Included and Optional Upgrades */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                            {detailed.included && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Included:</span>
                                {detailed.included.map((inc: string, i: number) => (
                                  <span key={i} className="bg-white border border-gray-200 text-[#0B5E8E] text-xs font-semibold px-2.5 py-1 rounded-full">
                                    {inc}
                                  </span>
                                ))}
                              </div>
                            )}

                            {detailed.optionalUpgrade && (
                              <span className="text-xs text-[#E67E22] font-semibold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Optional Upgrade: {detailed.optionalUpgrade}</span>
                              </span>
                            )}
                          </div>

                        </div>
                      ) : (
                        <div className="space-y-3 pt-4">
                          <p className="text-sm text-gray-700 leading-relaxed font-light">
                            {item.description}
                          </p>
                          {item.highlights && item.highlights.length > 0 && (
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Day Highlights:</span>
                              {item.highlights.map((h, i) => (
                                <span key={i} className="bg-white border border-gray-200 text-[#0B5E8E] text-xs font-semibold px-2.5 py-1 rounded-full">
                                  {h}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Included Experiences Section (Clickable Cards!) */}
        {matchedExperiences.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-[#C9A66B]" />
              <span>EXPERIENCES INCLUDED IN THIS HOLIDAY</span>
            </div>

            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                Experiences Included in This Holiday
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-light mt-1">
                Click any experience card below to view full activity details, photos, and FAQs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {matchedExperiences.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => onSelectExperience(exp)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                      <img
                        src={exp.featuredImage}
                        alt={exp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                      
                      <div className="absolute top-3 left-3 bg-[#3F6B3C] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Included Activity
                      </div>

                      <div className="absolute bottom-3 left-3 bg-white/90 text-[#0B5E8E] backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C9A66B]" />
                        <span>{exp.duration}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-serif font-bold text-base text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors line-clamp-1">
                        {exp.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-light">
                        {exp.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectExperience(exp);
                      }}
                      className="w-full bg-[#FAF9F6] hover:bg-[#0B5E8E] text-[#0B5E8E] hover:text-white border border-gray-200 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Experience Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Accommodation Section: Where You'll Stay */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Hotel className="w-4 h-4 text-[#C9A66B]" />
            <span>WHERE YOU'LL STAY</span>
          </div>

          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
              Where You’ll Stay
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-light mt-1">
              Handpicked hotels and lodges that match the comfort level and spirit of this package.
            </p>
          </div>

          {/* Why We Chose This Stay Callout */}
          {packageData.whyWeChoseStay && (
            <div className="bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 p-5 rounded-xl space-y-1">
              <h4 className="font-serif font-bold text-sm text-[#0B5E8E] flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
                <span>Why We Chose This Accommodation</span>
              </h4>
              <p className="text-xs text-gray-700 font-light leading-relaxed">
                {packageData.whyWeChoseStay}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packageData.recommendedHotels.map((hotel, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs p-6 flex flex-col sm:flex-row gap-6"
              >
                <div className="w-full sm:w-44 h-44 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#E67E22] uppercase tracking-wider">
                        {hotel.type}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-[#C9A66B]">
                        <Star className="w-3.5 h-3.5 fill-[#C9A66B]" />
                        <span className="font-bold">{hotel.rating}</span>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#0B5E8E]">
                      {hotel.name}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed font-light mt-1">
                      {hotel.description}
                    </p>

                    {hotel.location && (
                      <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-[#0B5E8E]" />
                        <span>{hotel.location}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#3F6B3C] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Outbound Approved</span>
                    </span>

                    <button
                      onClick={() => onPlanHoliday(packageData)}
                      className="text-xs font-bold text-[#E67E22] hover:underline cursor-pointer"
                    >
                      Select In Builder →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why We Recommend This Itinerary (Local Advisory Section) */}
        {packageData.whyWeRecommend && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
              <span>OUTBOUND LOCAL ADVISOR RECOMMENDATION</span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
              Why We Recommend This Itinerary
            </h2>

            <p className="text-sm text-gray-700 leading-relaxed font-light">
              {packageData.whyWeRecommend}
            </p>
          </section>
        )}

        {/* What's Included & Not Included */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* What's Included */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-xl text-[#0B5E8E] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#3F6B3C]" />
              <span>What's Included</span>
            </h3>

            <ul className="space-y-3">
              {packageData.included.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#3F6B3C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What's Not Included */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-xl text-[#0B5E8E] flex items-center gap-2">
              <XCircle className="w-5 h-5 text-gray-400" />
              <span>What's Not Included</span>
            </h3>

            <ul className="space-y-3">
              {packageData.notIncluded.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-500">
                  <XCircle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </section>

        {/* Estimated Holiday Investment & Pricing Explanation */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#C9A66B]" />
            <span>TRANSPARENT PRICING BREAKDOWN</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
            Estimated Holiday Investment
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 bg-[#FAF9F6] p-6 rounded-xl border border-gray-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-gray-400 block">Indicative Starting Rate</span>
                <span className="text-3xl font-serif font-bold text-[#0B5E8E]">
                  From {formatPrice(packageData.priceUSD)}
                </span>
                <p className="text-xs text-gray-500 mt-1 font-light">
                  {packageData.pricingDetails?.basis || 'Per person based on two adults sharing a room.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200/80 space-y-2">
                <button
                  onClick={() => onPlanHoliday(packageData)}
                  className="w-full bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer text-center"
                >
                  Request Personalised Quote
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {packageData.pricingDetails?.assumptions && (
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#0B5E8E]">This estimate assumes:</h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-gray-600 font-light">
                    {packageData.pricingDetails.assumptions.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0B5E8E]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {packageData.pricingDetails?.factorsAffecting && (
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#0B5E8E]">Factors affecting final price:</h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-gray-600 font-light">
                    {packageData.pricingDetails.factorsAffecting.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[11px] text-gray-500 font-light italic border-t border-gray-100 pt-3">
                Disclaimer: Prices are intended as planning estimates. Final availability and exact pricing will be confirmed by an Outbound Holidays travel specialist based on your travel dates.
              </p>
            </div>

          </div>
        </section>

        {/* Visual Route / Itinerary Flow */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <MapPin className="w-4 h-4 text-[#C9A66B]" />
            <span>VISUAL ITINERARY FLOW</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
            Your Route Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {packageData.routeMap.map((step) => (
              <div
                key={step.step}
                className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-200/80 space-y-2 relative"
              >
                <div className="w-7 h-7 rounded-full bg-[#0B5E8E] text-white font-bold text-xs flex items-center justify-center">
                  {step.step}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#0B5E8E]">{step.title}</h4>
                  <span className="text-[11px] font-semibold text-[#E67E22] block">{step.location}</span>
                  <p className="text-xs text-gray-600 font-light mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Package FAQs Section */}
        {packageData.faqs.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
              <HelpCircle className="w-4 h-4 text-[#C9A66B]" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
              Questions About This Holiday
            </h2>

            <div className="space-y-3">
              {packageData.faqs.map((faq, idx) => {
                const isOpen = activeFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-gray-200/80 overflow-hidden"
                  >
                    <button
                      onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#0B5E8E] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <div className="text-gray-400">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-4 sm:p-5 pt-0 border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Packages */}
        {relatedPackages.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-gray-200">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                You May Also Like
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-light mt-1">
                Explore alternative itineraries in Victoria Falls & Zimbabwe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPackages.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelatedPackage(rel)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                      <img
                        src={rel.imageUrl}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                      
                      <div className="absolute top-3 left-3 bg-[#E67E22] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {rel.badge}
                      </div>

                      <div className="absolute bottom-3 left-3 text-white text-xs font-serif font-bold">
                        From {formatPrice(rel.priceUSD)}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-serif font-bold text-base text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors line-clamp-1">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-light">
                        {rel.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRelatedPackage(rel);
                      }}
                      className="w-full bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Holiday Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA Banner */}
        <section className="bg-[#0B5E8E] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#C9A66B]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-[#C9A66B] text-xs font-bold uppercase tracking-widest block">
              YOUR PERSONALIZED VICTORIA FALLS HOLIDAY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to Make This Holiday Your Own?
            </h2>
            <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed">
              Use this itinerary as your starting point, then let our local Victoria Falls specialists tailor the accommodation, experiences, pace and budget around you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <button
              onClick={() => onPlanHoliday(packageData)}
              className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Personalise This Holiday</span>
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

      {/* Floating Bottom Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Selected Itinerary</span>
            <span className="font-serif font-bold text-base text-[#0B5E8E]">{packageData.title}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="text-right sm:pr-4 sm:border-r border-gray-200">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Indicative Price</span>
              <span className="font-serif font-bold text-lg text-[#0B5E8E] leading-none">
                From {formatPrice(packageData.priceUSD)} <span className="text-xs font-normal text-gray-500">/ person</span>
              </span>
            </div>

            <button
              onClick={() => onPlanHoliday(packageData)}
              className="flex-1 sm:flex-initial bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Personalise This Holiday</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
