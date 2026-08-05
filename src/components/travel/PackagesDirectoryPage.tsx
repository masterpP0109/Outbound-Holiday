import React, { useState } from 'react';
import { DetailedPackage, ALL_PACKAGES } from '../../data/packagesData';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { 
  Compass, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Search, 
  SlidersHorizontal,
  Home,
  Check,
  Star
} from 'lucide-react';

interface PackagesDirectoryPageProps {
  currency: Currency;
  onSelectPackage: (pkg: DetailedPackage) => void;
  onNavigateHome: () => void;
}

type FilterCategory = 'all' | 'first-visit' | 'couples' | 'families' | 'luxury' | 'adventure' | 'safari' | 'value';

export const PackagesDirectoryPage: React.FC<PackagesDirectoryPageProps> = ({
  currency,
  onSelectPackage,
  onNavigateHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterCategories: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All Packages' },
    { id: 'first-visit', label: 'First-Time Visitors' },
    { id: 'couples', label: 'Couples' },
    { id: 'families', label: 'Families' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'safari', label: 'Safari Extensions' },
    { id: 'value', label: 'Best Value' },
  ];

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  const filteredPackages = ALL_PACKAGES.filter((pkg) => {
    // Filter by Category
    const matchesCategory =
      selectedCategory === 'all' || pkg.categories.includes(selectedCategory as any) || pkg.category === selectedCategory;

    // Filter by Search Query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      pkg.title.toLowerCase().includes(query) ||
      pkg.tagline.toLowerCase().includes(query) ||
      pkg.description.toLowerCase().includes(query) ||
      pkg.highlights.some((h) => h.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">
      {/* Top Banner / Breadcrumb Header */}
      <div className="bg-[#0B5E8E] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#08486e]">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-white/70 font-medium">
            <button
              onClick={onNavigateHome}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-[#C9A66B] font-semibold">Holiday Packages</span>
          </nav>

          {/* Hero Titles */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C9A66B] text-xs font-bold uppercase tracking-widest border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>OUTBOUND HOLIDAY ITINERARIES</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Recommended Victoria Falls Holidays
            </h1>

            <p className="text-sm sm:text-base text-white/90 font-light leading-relaxed">
              Use these thoughtfully designed itineraries as inspiration. Every package can be personalised to suit your interests, accommodation preferences, travel dates and budget.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search packages by keyword, accommodation or experience..."
                className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#2F3A44] focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] focus:bg-white"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>

            {/* Results Count Badge */}
            <div className="text-xs font-semibold text-gray-500 shrink-0">
              Showing <span className="text-[#0B5E8E] font-bold">{filteredPackages.length}</span> holiday itineraries
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider shrink-0 pr-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0B5E8E]" />
              <span>Filter:</span>
            </div>

            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#0B5E8E] text-white shadow-xs'
                    : 'bg-[#FAF9F6] text-gray-600 hover:bg-gray-200/80 hover:text-[#0B5E8E]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
              >
                <div>
                  {/* Hero Image Container */}
                  <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                    {/* Badge */}
                    <div className="absolute top-3.5 left-3.5 bg-[#E67E22] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      {pkg.badge}
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C9A66B]" />
                      <span>{pkg.duration}</span>
                    </div>

                    {/* Price Starting From */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white flex items-end justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-gray-200 block">Estimated Investment</span>
                        <span className="text-xl font-bold font-serif text-white leading-none">
                          {formatPrice(pkg.priceUSD)} <span className="text-xs font-normal text-gray-300">/ person</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-serif font-bold text-xl text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug mb-1">
                        {pkg.title}
                      </h3>

                      <p className="text-xs font-semibold text-[#E67E22] mb-2">
                        {pkg.tagline}
                      </p>

                      <p className="text-xs text-gray-600 leading-relaxed font-light line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Highlights Summary List */}
                    <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-200/80 space-y-2">
                      <span className="text-[10px] font-bold text-[#0B5E8E] uppercase tracking-wider block">
                        Included Experience Highlights:
                      </span>
                      <ul className="space-y-1.5 text-xs text-gray-700">
                        {pkg.highlights.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#3F6B3C] shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* View Package Button */}
                <div className="p-6 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPackage(pkg);
                    }}
                    className="w-full bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>View Package Details</span>
                    <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 space-y-4">
            <Compass className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-serif font-bold text-xl text-[#0B5E8E]">No packages match your search</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Try adjusting your category filter or search keywords. Alternatively, our local specialists can craft a custom itinerary for you.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="bg-[#E67E22] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#d36e17] transition-colors cursor-pointer inline-block"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
