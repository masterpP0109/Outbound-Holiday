import React, { useState, useMemo } from 'react';
import { DetailedAccommodation, ALL_ACCOMMODATIONS } from '../../data/accommodationsData';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { 
  Hotel, 
  MapPin, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Home, 
  Filter, 
  Sparkles, 
  Search, 
  CalendarCheck,
  Compass
} from 'lucide-react';

interface AccommodationDirectoryPageProps {
  currency: Currency;
  onSelectProperty: (property: DetailedAccommodation) => void;
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
}

type FilterTag = 'all' | 'luxury-lodges' | 'boutique-hotels' | 'family-friendly' | 'romantic-escapes' | 'best-value' | 'safari-lodges' | 'self-catering' | 'walking-distance';

const FILTER_CATEGORIES: { id: FilterTag; label: string }[] = [
  { id: 'all', label: 'All Places to Stay' },
  { id: 'luxury-lodges', label: 'Luxury Lodges' },
  { id: 'boutique-hotels', label: 'Boutique Hotels' },
  { id: 'family-friendly', label: 'Family Friendly' },
  { id: 'romantic-escapes', label: 'Romantic Escapes' },
  { id: 'best-value', label: 'Best Value' },
  { id: 'safari-lodges', label: 'Safari Lodges' },
  { id: 'self-catering', label: 'Self-Catering' },
  { id: 'walking-distance', label: 'Walking Distance to Falls' },
];

export const AccommodationDirectoryPage: React.FC<AccommodationDirectoryPageProps> = ({
  currency,
  onSelectProperty,
  onOpenPlanHoliday,
  onNavigateHome,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTag>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  const filteredAccommodations = useMemo(() => {
    return ALL_ACCOMMODATIONS.filter((item) => {
      const matchesCategory =
        activeFilter === 'all' ? true : item.filterTags.includes(activeFilter);

      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      
      {/* Top Breadcrumb Header */}
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
            <span className="text-[#C9A66B] font-semibold">Where to Stay</span>
          </nav>

          <span className="text-white/80 text-[11px] font-semibold hidden sm:inline">
            Local Advisor Recommended Stays
          </span>
        </div>
      </div>

      {/* Directory Page Hero & Introduction */}
      <section className="bg-white border-b border-gray-200/80 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold uppercase tracking-widest">
            <Hotel className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>HANDPICKED ACCOMMODATION COLLECTION</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B5E8E] tracking-tight">
            Where to Stay in Victoria Falls
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-gray-600 font-light leading-relaxed">
            Whether you're looking for luxury, romance, family-friendly comfort or excellent value, our local specialists have carefully selected accommodation that we genuinely recommend. Browse our handpicked collection and find the place that best suits your travel style.
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-md mx-auto pt-4 relative">
            <input
              type="text"
              placeholder="Search hotels, lodges, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-gray-300 rounded-full py-3 pl-10 pr-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </section>

      {/* Main Directory Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Filter Chips Bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B5E8E] uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>Filter by Style & Experience:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTER_CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#0B5E8E] text-white border-[#0B5E8E] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#0B5E8E]/50 hover:bg-[#FAF9F6]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accommodation Grid */}
        {filteredAccommodations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAccommodations.map((property) => (
              <div
                key={property.id}
                onClick={() => onSelectProperty(property)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
              >
                <div>
                  {/* Hero Image */}
                  <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                    <img
                      src={property.heroImage}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />

                    {/* Badge */}
                    {property.badge && (
                      <div className="absolute top-3.5 left-3.5 bg-[#E67E22] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {property.badge}
                      </div>
                    )}

                    <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                      {property.category}
                    </div>

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                        <Star className="w-3.5 h-3.5 text-[#C9A66B] fill-[#C9A66B]" />
                        <span className="font-bold">{property.rating}</span>
                        <span className="text-white/70 text-[10px]">({property.reviewCount})</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-white/90 font-medium">
                        <MapPin className="w-3 h-3 text-[#C9A66B]" />
                        <span>{property.distanceFromFalls}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-serif font-bold text-xl text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors line-clamp-1">
                        {property.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {property.location}
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 font-light leading-relaxed">
                      {property.shortDescription}
                    </p>

                    {/* Highlights Meta Badges */}
                    <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[#0B5E8E]">
                      <span className="bg-[#0B5E8E]/10 px-2.5 py-1 rounded-md font-semibold">
                        {property.atAGlance.bestFor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Price & Action */}
                <div className="p-5 pt-0 space-y-3 border-t border-gray-100 mt-2">
                  <div className="flex items-baseline justify-between pt-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">From Rate</span>
                      <span className="font-serif font-bold text-lg text-[#0B5E8E]">
                        {formatPrice(property.priceFromUSD)}
                        <span className="text-[10px] text-gray-500 font-normal"> / night</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-[#3F6B3C] flex items-center gap-1 bg-[#3F6B3C]/10 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Local Advisor Approved</span>
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProperty(property);
                    }}
                    className="w-full bg-[#FAF9F6] hover:bg-[#0B5E8E] text-[#0B5E8E] hover:text-white border border-gray-200 hover:border-[#0B5E8E] text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <span>View Property Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-4">
            <Hotel className="w-12 h-12 text-[#C9A66B] mx-auto" />
            <h3 className="font-serif font-bold text-xl text-[#0B5E8E]">No properties match your filter</h3>
            <p className="text-sm text-gray-500">Try choosing a different style category or clearing your search phrase.</p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="bg-[#0B5E8E] text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Tailored Planning Assistance Footer Box */}
        <section className="bg-[#0B5E8E] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden mt-12">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-[#C9A66B] text-xs font-bold uppercase tracking-widest block">
              LOCAL VICTORIA FALLS CONCIERGE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Unsure Which Place to Choose?
            </h2>
            <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed">
              Tell our local Victoria Falls travel specialists your budget, preferred atmosphere, and travel dates, and we'll match you with the ideal lodge or hotel.
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <button
              onClick={onOpenPlanHoliday}
              className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-4 px-8 rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Ask a Local Specialist</span>
            </button>
          </div>
        </section>

      </div>

    </div>
  );
};
