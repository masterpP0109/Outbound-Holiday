import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, MapPin, ChevronLeft, ChevronRight, Heart, Users, Compass } from 'lucide-react';

import familyTourImg from '../../assets/images/zimbabwean_family_tour_1785488498015.jpg';
import coupleHoneymoonImg from '../../assets/images/zimbabwean_couple_honeymoon_1785488512769.jpg';
import familySafariImg from '../../assets/images/zimbabwean_family_safari_tour_1785488788507.jpg';

interface TravelHeroProps {
  onOpenPlanHoliday: () => void;
  onBrowsePackages: () => void;
}

interface HeroSlide {
  id: string;
  imageUrl: string;
  fallbackUrl: string;
  titleTag: string;
  headline: React.ReactNode;
  description: string;
  primaryCtaText: string;
  badgeIcon: React.ReactNode;
  altText: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'family-tour',
    imageUrl: familyTourImg,
    fallbackUrl: 'https://images.unsplash.com/photo-1614527961817-21789c629fb4?auto=format&fit=crop&q=80&w=2400',
    titleTag: 'Zimbabwean Family Victoria Falls Tour',
    headline: (
      <>
        Zimbabwe’s Family <br className="hidden sm:inline" />
        Victoria Falls Specialists
      </>
    ),
    description: 'Explore Mosi-oa-Tunya with guided rainforest walking tours, dramatic waterfall mist vistas, and custom family itineraries for all ages.',
    primaryCtaText: 'Plan Family Holiday',
    badgeIcon: <Users className="w-3.5 h-3.5 text-[#C9A66B]" />,
    altText: 'Zimbabwean family exploring Mosi-oa-Tunya Victoria Falls with mist and waterfall vistas',
  },
  {
    id: 'couple-honeymoon',
    imageUrl: coupleHoneymoonImg,
    fallbackUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=2400',
    titleTag: 'Zimbabwean Couple Romantic Honeymoon',
    headline: (
      <>
        Romantic Honeymoons & <br className="hidden sm:inline" />
        Sunset Zambezi Cruises
      </>
    ),
    description: 'Celebrate love with golden hour Zambezi river sunset cruises, luxury intimate lodges, and tailored couples getaways in Victoria Falls.',
    primaryCtaText: 'Plan Honeymoon Escape',
    badgeIcon: <Heart className="w-3.5 h-3.5 text-[#E67E22]" />,
    altText: 'Zimbabwean couple enjoying a romantic sunset Zambezi River cruise',
  },
  {
    id: 'family-safari',
    imageUrl: familySafariImg,
    fallbackUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=2400',
    titleTag: 'Family Wildlife Safari & Experience',
    headline: (
      <>
        Guided African Wildlife <br className="hidden sm:inline" />
        Safaris & Game Drives
      </>
    ),
    description: 'Embark on thrilling Big Five game drives across Hwange and Victoria Falls with expert Zimbabwean rangers and child-friendly safari vehicles.',
    primaryCtaText: 'Plan Safari Tour',
    badgeIcon: <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />,
    altText: 'Family guided African wildlife safari discovery tour in Victoria Falls and Hwange',
  },
];

export const TravelHero: React.FC<TravelHeroProps> = ({
  onOpenPlanHoliday,
  onBrowsePackages,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section className="w-full relative overflow-hidden">
      {/* Full-bleed Hero Container with background image carousel */}
      <div 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full min-h-[640px] sm:min-h-[720px] bg-[#0B5E8E] text-white flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 shadow-md group/hero"
      >
        
        {/* Carousel Background Images with Cross-Fade Effect */}
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.altText}
                className="w-full h-full object-cover object-center"
                loading={idx === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = slide.fallbackUrl;
                }}
              />
            </div>
          );
        })}

        {/* Balanced Dark Overlay for high text contrast while keeping background photos clearly visible */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B5E8E]/65 via-black/40 to-[#0B5E8E]/85" />

        {/* Main Content Area - Wide & Centered with smooth dynamic text transition */}
        <div key={currentSlideIndex} className="relative z-10 max-w-4xl mx-auto text-center space-y-6 flex flex-col items-center justify-center my-auto animate-fadeIn duration-500">
          
          {/* Active Carousel Category Pill Label */}
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-[#C9A66B]/60 rounded-full px-5 py-2 text-xs font-semibold text-[#C9A66B] tracking-wide uppercase shadow-sm transition-all duration-300">
            {HERO_SLIDES[currentSlideIndex].badgeIcon}
            <span className="text-white">{HERO_SLIDES[currentSlideIndex].titleTag}</span>
          </div>

          {/* Dynamic Headline - Tailored to active slide */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-white leading-[1.12] tracking-tight max-w-3xl drop-shadow-md">
            {HERO_SLIDES[currentSlideIndex].headline}
          </h1>

          {/* Dynamic Description - Tailored to active slide */}
          <p className="text-sm sm:text-base lg:text-xl text-white/95 font-normal leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
            {HERO_SLIDES[currentSlideIndex].description}
          </p>

          {/* Centered Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={onOpenPlanHoliday}
              className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm sm:text-base px-9 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <span>{HERO_SLIDES[currentSlideIndex].primaryCtaText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={onBrowsePackages}
              className="w-full sm:w-auto bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/50 text-white font-semibold text-sm sm:text-base px-9 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Browse Packages
            </button>
          </div>

          {/* Reassurance Line */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5 text-xs sm:text-sm text-white/90 font-medium drop-shadow-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
              No obligation custom quote
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span>Free concierge support</span>
          </div>

          {/* Carousel Slide Indicators / Dots */}
          <div className="pt-4 flex items-center justify-center gap-2.5 z-20">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                aria-label={`Go to slide ${idx + 1}: ${slide.titleTag}`}
                className={`transition-all duration-300 cursor-pointer ${
                  idx === currentSlideIndex
                    ? 'w-8 h-2.5 bg-[#E67E22] rounded-full shadow-md'
                    : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80 rounded-full'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Carousel Arrow Navigation - Left */}
        <button
          onClick={handlePrevSlide}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-90 sm:opacity-0 group-hover/hero:opacity-100 transition-all duration-300 cursor-pointer shadow-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Carousel Arrow Navigation - Right */}
        <button
          onClick={handleNextSlide}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-90 sm:opacity-0 group-hover/hero:opacity-100 transition-all duration-300 cursor-pointer shadow-md"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Floating Local Support Card - Bottom Badge */}
        <div className="relative sm:absolute sm:bottom-6 sm:right-6 z-10 mt-8 sm:mt-0 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_16px_40px_rgba(47,58,68,0.18)] border border-white/60 max-w-xs text-[#2F3A44] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
            <MapPin className="w-5 h-5 text-[#0B5E8E]" />
          </div>
          <div className="text-left">
            <span className="font-bold font-serif text-xs sm:text-sm block text-[#0B5E8E] leading-snug">
              Victoria Falls Based
            </span>
            <span className="text-[11px] text-[#2F3A44]/80 leading-normal block mt-0.5">
              First-hand local advice and on-ground support
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
