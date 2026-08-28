import React from 'react';
import { DetailedPackage, getHomepageFeaturedPackages } from '../../data/packagesData';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { Clock, ArrowRight, Sparkles, Star } from 'lucide-react';

interface FeaturedPackagesProps {
  currency: Currency;
  onSelectPackage: (pkg: DetailedPackage) => void;
  onExploreAllPackages: () => void;
}

export const FeaturedPackages: React.FC<FeaturedPackagesProps> = ({
  currency,
  onSelectPackage,
  onExploreAllPackages,
}) => {
  const featured = getHomepageFeaturedPackages();

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  return (
    <section id="travel-packages" className="py-16 sm:py-20 lg:py-24 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/10 text-[#C9A66B] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>THOUGHTFULLY PLANNED ITINERARIES</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B5E8E] tracking-tight">
            Recommended Victoria Falls Holidays
          </h2>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light">
            Use these carefully balanced itineraries as a starting framework. Every package can be personalised around your interests, accommodation preferences, travel pace and budget.
          </p>

          <p className="text-xs text-gray-400 italic pt-1">
            *Displayed prices are planning estimates per person. Final itinerary availability and pricing will be tailored by an Outbound specialist.
          </p>
        </div>

        {/* 4 Featured Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featured.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => onSelectPackage(pkg)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
            >
              <div>
                {/* Hero Image Container */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-90" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-[#E67E22] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {pkg.badge}
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C9A66B]" />
                    <span>{pkg.duration}</span>
                  </div>

                  {/* Price Starting From */}
                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-200 block">From</span>
                      <span className="text-lg sm:text-xl font-bold font-serif text-white leading-none">
                        {formatPrice(pkg.priceUSD)} <span className="text-xs font-normal text-gray-300">/ person</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug mb-1">
                      {pkg.title}
                    </h3>

                    <p className="text-xs font-semibold text-[#E67E22] mb-1.5 line-clamp-1">
                      {pkg.tagline}
                    </p>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 font-normal">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Highlights snippet */}
                  <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-gray-200/80 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#C9A66B] uppercase tracking-wider">
                      <Star className="w-3 h-3 text-[#C9A66B] fill-[#C9A66B]" />
                      <span>Key Included Highlight</span>
                    </div>
                    <p className="text-[11px] text-gray-700 italic line-clamp-2 leading-tight">
                      "{pkg.highlights[0]}"
                    </p>
                  </div>
                </div>
              </div>

              {/* View Holiday Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPackage(pkg);
                  }}
                  className="w-full bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>View Holiday Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Centered CTA: Find Your Holiday → */}
        <div className="mt-12 sm:mt-16 text-center">
          <button
            onClick={onExploreAllPackages}
            className="inline-flex items-center gap-2.5 bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Find Your Holiday →</span>
          </button>
        </div>

      </div>
    </section>
  );
};
