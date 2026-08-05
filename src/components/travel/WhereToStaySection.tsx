import React from 'react';
import { DetailedAccommodation, FEATURED_HOMEPAGE_ACCOMMODATIONS } from '../../data/accommodationsData';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { 
  Hotel, 
  MapPin, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Compass
} from 'lucide-react';

interface WhereToStaySectionProps {
  currency: Currency;
  onSelectProperty: (property: DetailedAccommodation) => void;
  onExploreAllProperties: () => void;
}

export const WhereToStaySection: React.FC<WhereToStaySectionProps> = ({
  currency,
  onSelectProperty,
  onExploreAllProperties,
}) => {
  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  return (
    <section id="where-to-stay" className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-gray-200/80 relative overflow-hidden">
      
      {/* Decorative Subtle Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0B5E8E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C9A66B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Heading & Local Advisory Introduction */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5E8E]/10 border border-[#0B5E8E]/20 text-[#0B5E8E] text-xs font-bold uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>LOCAL SPECIALIST RECOMMENDATIONS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B5E8E] tracking-tight">
            Where to Stay in Victoria Falls
          </h2>

          <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
            Choosing the right place to stay can shape your entire holiday. From boutique guesthouses and family-friendly hotels to luxury safari lodges, we've carefully selected accommodation we confidently recommend based on location, service and overall guest experience.
          </p>
        </div>

        {/* 4 Featured Accommodation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {FEATURED_HOMEPAGE_ACCOMMODATIONS.map((property) => (
            <div
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
            >
              <div>
                {/* Image & Badge Overlay */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  <img
                    src={property.heroImage}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />

                  {/* Recommendation Badge */}
                  {property.badge && (
                    <div className="absolute top-3.5 left-3.5 bg-[#E67E22] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {property.badge}
                    </div>
                  )}

                  {/* Category Chip */}
                  <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                    {property.category}
                  </div>

                  {/* Star Rating & Distance Overlay */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <Star className="w-3.5 h-3.5 text-[#C9A66B] fill-[#C9A66B]" />
                      <span className="font-bold">{property.rating}</span>
                      <span className="text-white/70 text-[10px]">({property.reviewCount})</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-white/90 font-medium">
                      <MapPin className="w-3 h-3 text-[#C9A66B]" />
                      <span className="truncate max-w-[120px]">{property.distanceFromFalls}</span>
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors line-clamp-1">
                      {property.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {property.location}
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 font-light leading-relaxed">
                    {property.shortDescription}
                  </p>
                </div>
              </div>

              {/* Card Footer Price & Primary CTA */}
              <div className="p-5 pt-0 space-y-3 border-t border-gray-100 mt-2">
                <div className="flex items-baseline justify-between pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">From Rate</span>
                    <span className="font-serif font-bold text-base text-[#0B5E8E]">
                      {formatPrice(property.priceFromUSD)}
                      <span className="text-[10px] text-gray-500 font-normal"> / night</span>
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-[#3F6B3C] flex items-center gap-1 bg-[#3F6B3C]/10 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Outbound Choice</span>
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProperty(property);
                  }}
                  className="w-full bg-[#FAF9F6] hover:bg-[#0B5E8E] text-[#0B5E8E] hover:text-white border border-gray-200 hover:border-[#0B5E8E] text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>View Property</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Explore More Places to Stay Centred CTA */}
        <div className="text-center pt-4">
          <button
            onClick={onExploreAllProperties}
            className="inline-flex items-center justify-center gap-2 bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-sm py-4 px-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Explore All Places to Stay</span>
            <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
          </button>
        </div>

      </div>
    </section>
  );
};
