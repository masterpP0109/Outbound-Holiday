import React, { useState } from 'react';
import { TravelPackage, Currency } from '../../types';
import { FEATURED_PACKAGES, CURRENCY_RATES } from '../../data/travelData';
import { Calendar, CheckCircle2, Star, Sparkles, ArrowRight, Clock, MapPin } from 'lucide-react';

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

  const filteredPackages = filterCategory === 'all'
    ? FEATURED_PACKAGES
    : FEATURED_PACKAGES.filter((p) => p.category === filterCategory);

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  return (
    <section id="travel-packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#3F6B3C] uppercase tracking-widest block mb-2">
            Tailored Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B5E8E] mb-4">
            Curated Holiday Packages
          </h2>
          <p className="text-[#2F3A44] text-base sm:text-lg">
            Carefully structured itineraries designed by Victoria Falls travel specialists to give you unforgettable memories with zero hassle.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filterCategory === 'all'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-gray-100 text-[#2F3A44] hover:bg-gray-200'
              }`}
            >
              All Packages
            </button>
            <button
              onClick={() => setFilterCategory('value')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filterCategory === 'value'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-gray-100 text-[#2F3A44] hover:bg-gray-200'
              }`}
            >
              Best Value
            </button>
            <button
              onClick={() => setFilterCategory('luxury')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filterCategory === 'luxury'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-gray-100 text-[#2F3A44] hover:bg-gray-200'
              }`}
            >
              Luxury Escapes
            </button>
            <button
              onClick={() => setFilterCategory('family')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filterCategory === 'family'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-gray-100 text-[#2F3A44] hover:bg-gray-200'
              }`}
            >
              Family Favourites
            </button>
            <button
              onClick={() => setFilterCategory('adventure')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filterCategory === 'adventure'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-gray-100 text-[#2F3A44] hover:bg-gray-200'
              }`}
            >
              Safari & Adventure
            </button>
          </div>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image & Badge Container */}
                <div className="relative h-60 overflow-hidden bg-[#3F6B3C]">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Badge */}
                  <span className="absolute top-4 left-4 bg-[#C9A66B] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-md">
                    {pkg.badge}
                  </span>

                  {/* Duration Tag */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-xs font-semibold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{pkg.duration}</span>
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 text-[#2F3A44] text-xs font-bold px-2 py-1 rounded-md shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-[#E67E22] text-[#E67E22]" />
                    <span>{pkg.rating}</span>
                    <span className="text-gray-400 font-normal">({pkg.reviewCount})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#0B5E8E] mb-2 group-hover:text-[#E67E22] transition-colors">
                    {pkg.title}
                  </h3>

                  <p className="text-sm text-[#2F3A44] mb-4 line-clamp-3 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Top Highlights Preview */}
                  <div className="space-y-2 mb-6">
                    {pkg.highlights.slice(0, 2).map((hl, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-[#3F6B3C] shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action Buttons Footer */}
              <div className="p-6 pt-0 border-t border-gray-100 mt-auto">
                <div className="flex items-baseline justify-between mb-4 pt-4">
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
                    className="w-full bg-transparent border-2 border-[#0B5E8E] text-[#0B5E8E] hover:bg-[#0B5E8E] hover:text-white font-bold text-xs py-2.5 px-3 rounded-md transition-colors text-center"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onPlanHolidayWithPackage(pkg)}
                    className="w-full bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-xs py-2.5 px-3 rounded-md transition-colors text-center shadow-xs"
                  >
                    Plan This Trip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
