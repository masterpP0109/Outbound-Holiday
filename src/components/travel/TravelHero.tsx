import React, { useState, useEffect } from 'react';
import fallsTour1 from '../../assets/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
import cruise1 from '../../assets/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
import gameDrive10 from '../../assets/Experiences/Game Drive/Game-drive-10-1-scaled.jpg';
import { ArrowRight, ShieldCheck, MapPin, ChevronLeft, ChevronRight, Heart, Users, Compass } from 'lucide-react';

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
    imageUrl: fallsTour1,
    fallbackUrl: fallsTour1,
    titleTag: 'PLANNED BY LOCAL VICTORIA FALLS SPECIALISTS',
    headline: (
      <>
        Planning Your Family’s Trip <br className="hidden sm:inline" />
        to Victoria Falls?
      </>
    ),
    description: 'We’ll help you choose the right accommodation, activities and itinerary for every member of the family—planned around your interests, pace and budget.',
    primaryCtaText: 'Plan Your Family Holiday',
    badgeIcon: <Users className="w-3.5 h-3.5 text-[#C9A66B]" />,
    altText: 'Zimbabwean family exploring Mosi-oa-Tunya Victoria Falls with mist and waterfall vistas',
  },
  {
    id: 'couple-honeymoon',
    imageUrl: cruise1,
    fallbackUrl: cruise1,
    titleTag: 'TRAVEL WITH CONFIDENCE',
    headline: (
      <>
        Looking for a Honeymoon <br className="hidden sm:inline" />
        You’ll Never Forget?
      </>
    ),
    description: 'Let us create a romantic Victoria Falls escape around your story, combining carefully selected stays with memorable Zambezi sunsets and experiences worth celebrating.',
    primaryCtaText: 'Plan Your Honeymoon Escape',
    badgeIcon: <Heart className="w-3.5 h-3.5 text-[#E67E22]" />,
    altText: 'Zimbabwean couple enjoying a romantic sunset Zambezi River cruise',
  },
  {
    id: 'family-safari',
    imageUrl: gameDrive10,
    fallbackUrl: gameDrive10,
    titleTag: 'LOCAL SAFARI KNOWLEDGE',
    headline: (
      <>
        Dreaming of Seeing <br className="hidden sm:inline" />
        Africa’s Wildlife Up Close?
      </>
    ),
    description: 'We’ll help you combine Victoria Falls with the right safari experience in Hwange or Chobe—without making your holiday feel rushed or unnecessarily expensive.',
    primaryCtaText: 'Plan Your Safari Experience',
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
        className="relative w-full min-h-[640px] sm:min-h-[720px] bg-[#0B5E8E] text-white flex flex-col items-start justify-center p-6 sm:p-12 lg:p-20 shadow-md group/hero"
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

        {/* Dark Gradient Overlay for left-aligned text contrast */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0B5E8E]/95 via-[#0B5E8E]/70 to-black/30 md:to-transparent" />

        {/* Main Content Area - Left-aligned with max-width container */}
        <div key={currentSlideIndex} className="relative z-10 max-w-2xl text-left space-y-6 flex flex-col items-start justify-center my-auto animate-fadeIn duration-500 max-w-[1280px] w-full">
          
          {/* Active Carousel Category Pill Label */}
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-[#C9A66B]/60 rounded-full px-5 py-2 text-xs font-semibold text-[#C9A66B] tracking-wide uppercase shadow-sm transition-all duration-300">
            {HERO_SLIDES[currentSlideIndex].badgeIcon}
            <span className="text-white">{HERO_SLIDES[currentSlideIndex].titleTag}</span>
          </div>

          {/* Dynamic Headline - Left Aligned */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-white leading-[1.12] tracking-tight drop-shadow-md">
            {HERO_SLIDES[currentSlideIndex].headline}
          </h1>

          {/* Dynamic Description - Left Aligned */}
          <p className="text-sm sm:text-base lg:text-xl text-white/95 font-normal leading-relaxed drop-shadow-sm max-w-2xl">
            {HERO_SLIDES[currentSlideIndex].description}
          </p>

          {/* Left-aligned Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-4 w-full sm:w-auto">
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

          {/* Reassurance Line - Left Aligned */}
          <div className="pt-2 flex flex-wrap items-center justify-start gap-3.5 text-xs sm:text-sm text-white/95 font-medium drop-shadow-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
              Travel with Confidence
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span>Honest, no-obligation guidance</span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span>Victoria Falls-based specialists</span>
          </div>

          {/* Carousel Slide Indicators / Dots - Left Aligned */}
          <div className="pt-4 flex items-center justify-start gap-2.5 z-20">
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
              Based in Victoria Falls
            </span>
            <span className="text-[11px] text-[#2F3A44]/80 leading-normal block mt-0.5">
              First-hand local knowledge and personal support before and during your holiday.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
