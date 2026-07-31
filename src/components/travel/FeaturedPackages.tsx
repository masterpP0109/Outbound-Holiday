import React, { useState, useRef } from 'react';
import { TravelPackage, Currency } from '../../types';
import { FEATURED_PACKAGES, CURRENCY_RATES } from '../../data/travelData';
import { CheckCircle2, Star, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useScrollReveal } from '../../hooks';

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
  const [filterCategory, setFilterCategory] = useState<'all' | 'value' | 'luxury' | 'family' | 'adventure'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref, isVisible } = useScrollReveal(0.1);

  const filteredPackages = filterCategory === 'all'
    ? FEATURED_PACKAGES
    : FEATURED_PACKAGES.filter((p) => p.category === filterCategory);

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth * 0.75;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="travel-packages" className="py-20 md:py-24 bg-white">
      <div
        ref={ref}
        className={`container-center ${isVisible ? 'animate-reveal visible' : 'animate-reveal'}`}
      >
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="section-label">Tailored Experiences</span>
          <h2 className="section-heading text-[#0B5E8E]">
            Curated Holiday Packages
          </h2>
          <p className="text-[#2F3A44] text-base sm:text-lg mx-auto">
            Carefully structured itineraries designed by Victoria Falls travel specialists to give you unforgettable memories with zero hassle.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === 'all'
                  ? 'bg-[#0B5E8E] text-white shadow-sm'
                  : 'bg-gray-100 text-[#2F3A44] hover:bg-gray-200'
              }`}
            >
              All Packages
            </button>
            <button
              onClick={() => setFilterCategory('value')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === 'value'
                  ? 'bg-[#0B5E8E] text-white shadow-sm'
                  : 'bg-gray-100 text-[#2F3A44] hover:bg-gray-200'
              }`}
            >
              Best Value
            </button>
            <button
              onClick={() => setFilterCategory('luxury')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === 'luxury'
                  ? 'bg-[#0B5E8E] text-white shadow-sm'
                  : 'bg-gray-100 text-[#2F3A44] hover:bg-gray-200'
              }`}
            >
              Luxury Escapes
            </button>
            <button
              onClick={() => setFilterCategory('family')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === 'family'
                  ? 'bg-[#0B5E8E] text-white shadow-sm'
                  : 'bg-gray-100 text-[#2F3A44] hover:bg-gray-200'
              }`}
            >
              Family Favourites
            </button>
            <button
              onClick={() => setFilterCategory('adventure')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === 'adventure'
                  ? 'bg-[#0B5E8E] text-white shadow-sm'
                  : 'bg-gray-100 text-[#2F3A44] hover:bg-gray-200'
              }`}
            >
              Safari & Adventure
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth no-scrollbar"
          >
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="min-w-[85%] sm:min-w-[60%] md:min-w-[45%] lg:min-w-[30%] snap-start"
              >
                <div className="card overflow-hidden flex flex-col h-full">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.title}
                      className="w-full h-full object-cover transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    <span className="absolute top-4 left-4 bg-[#C9A66B] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                      {pkg.badge}
                    </span>

                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                      <span>{pkg.duration}</span>
                    </div>

                    <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/95 text-[#2F3A44] text-xs font-bold px-2.5 py-1.5 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-[#E67E22] text-[#E67E22]" />
                      <span>{pkg.rating}</span>
                      <span className="text-gray-400 font-normal">({pkg.reviewCount})</span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-[#0B5E8E] mb-2 font-serif">
                      {pkg.title}
                    </h3>

                    <p className="text-sm text-[#2F3A44] leading-relaxed mb-4 flex-1">
                      {pkg.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      {pkg.highlights.slice(0, 2).map((hl, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#3F6B3C] shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-6 pb-6 mt-auto">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-xs text-gray-500 font-medium block">Starting from</span>
                        <span className="text-2xl font-extrabold text-[#0B5E8E]">
                          {formatPrice(pkg.priceUSD)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">/ person</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => onSelectPackage(pkg)}
                        className="w-full bg-transparent border-2 border-[#0B5E8E] text-[#0B5E8E] hover:bg-[#0B5E8E] hover:text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors text-center"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => onPlanHolidayWithPackage(pkg)}
                        className="w-full bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors text-center shadow-sm"
                      >
                        Plan This Trip
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {filteredPackages.length > 3 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-card border border-gray-200 items-center justify-center text-[#2F3A44] hover:text-[#0B5E8E] hover:border-[#0B5E8E] transition-all z-10"
                aria-label="Scroll packages left"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-card border border-gray-200 items-center justify-center text-[#2F3A44] hover:text-[#0B5E8E] hover:border-[#0B5E8E] transition-all z-10"
                aria-label="Scroll packages right"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
