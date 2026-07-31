import React, { useRef, useState, useEffect } from 'react';
import { TravelPackage, Currency } from '../../types';
import { FEATURED_PACKAGES, CURRENCY_RATES } from '../../data/travelData';
import { Check, ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedPackagesProps {
  currency: Currency;
  onSelectPackage: (pkg: TravelPackage) => void;
  onPlanHolidayWithPackage: (pkg: TravelPackage) => void;
}

export const FeaturedPackages: React.FC<FeaturedPackagesProps> = ({
  currency,
  onSelectPackage,
  onPlanHolidayWithPackage,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  return (
    <section id="travel-packages" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Section Header with Left-Aligned Title and Right-Aligned Carousel Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl text-left">
            <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-2">
              Handcrafted Itineraries
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E] leading-tight mb-2">
              Curated Holiday Packages
            </h2>
            <p className="text-sm sm:text-base text-[#2F3A44]/85 leading-relaxed">
              Thoughtfully balanced itineraries designed by Victoria Falls travel specialists.
            </p>
          </div>

          {/* Carousel Circular Arrow Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                canScrollLeft
                  ? 'bg-white border-gray-300 text-[#0B5E8E] hover:bg-[#0B5E8E] hover:text-white hover:border-[#0B5E8E] shadow-sm'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                canScrollRight
                  ? 'bg-white border-gray-300 text-[#0B5E8E] hover:bg-[#0B5E8E] hover:text-white hover:border-[#0B5E8E] shadow-sm'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Container with CSS Scroll Snap */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {FEATURED_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="snap-start shrink-0 w-[300px] sm:w-[360px] bg-white rounded-[20px] border border-gray-200/80 shadow-[0_16px_40px_rgba(47,58,68,0.06)] hover:shadow-[0_20px_50px_rgba(11,94,142,0.14)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* 3:2 Standardized Landscape Photo Header */}
                <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-3.5 left-3.5 bg-[#E67E22] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {pkg.badge}
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-3.5 right-3.5 bg-black/50 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C9A66B]" />
                    <span>{pkg.duration}</span>
                  </div>

                  {/* Price Starting From */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-200 block">Starting from</span>
                      <span className="text-xl font-bold font-serif text-white leading-none">
                        {formatPrice(pkg.priceUSD)} <span className="text-xs font-normal text-gray-300">/ person</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold font-serif text-lg text-[#0B5E8E] mb-1 line-clamp-1">
                      {pkg.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#E67E22] mb-1.5">
                      {pkg.tagline}
                    </p>
                    <p className="text-xs text-[#2F3A44]/80 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Inclusions list */}
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-[#0B5E8E] uppercase tracking-wider block mb-1.5">
                      Package Includes:
                    </span>
                    <ul className="space-y-1 text-xs text-[#2F3A44]">
                      {pkg.highlights.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#3F6B3C] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Dual Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className="bg-[#FAFAFA] hover:bg-gray-100 text-[#0B5E8E] font-semibold text-xs py-2.5 rounded-xl border border-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => onPlanHolidayWithPackage(pkg)}
                  className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span>Plan This Trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
