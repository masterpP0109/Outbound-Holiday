import { editorialFormat, editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { getWhatsAppAccommodationEnquiryUrl, getWhatsAppUrl } from '../../utils/whatsapp';
import { PageLink } from '../common/PageLink';
import { accommodationPath } from '../../routes';
import React, { useState, useMemo, useEffect } from 'react';
import { DetailedAccommodation, ALL_ACCOMMODATIONS } from '../../data/accommodationsData';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { AccommodationAdvisor } from './AccommodationAdvisor';
import {
  ACCOMMODATION_CATEGORY_DEFS,
  AMENITY_DEFINITIONS,
  AccommodationCategoryId,
  AccommodationFilters,
  AccommodationSortOption,
  AmenityId,
  filterAndSortAccommodations,
  getAccommodationCategoryId,
  getAccommodationCategorySingular,
  getKeyAmenitiesForCard,
  getPriceUnitLabel,
  getPropertyAmenities,
  isPublishedAccommodation,
  parseCategorySlugFromSearch,
} from '../../utils/accommodation';
import {
  ArrowRight,
  Home,
  Sparkles,
  Compass,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Search,
  X,
  SlidersHorizontal,
  MapPin,
  Building2,
  Trees,
  House,
  Building,
  Grid,
  ArrowUpDown,
} from 'lucide-react';

interface AccommodationDirectoryPageProps {
  currency: Currency;
  onSelectProperty: (property: DetailedAccommodation) => void;
  onIncludeInHoliday: (property: DetailedAccommodation) => void;
  onNavigateHome: () => void;
}

let FAQS: { q: string; a: string }[] = [];
registerContent(() => {
  FAQS = editorialValue("travel/AccommodationDirectoryPage.FAQS", {});
});

const CATEGORY_ICONS: Record<Exclude<AccommodationCategoryId, 'all'>, React.ComponentType<{ className?: string }>> = {
  hotels: Building2,
  lodges: Trees,
  'guest-houses': House,
  apartments: Building,
};

export const AccommodationDirectoryPage: React.FC<AccommodationDirectoryPageProps> = ({
  currency,
  onSelectProperty,
  onIncludeInHoliday,
  onNavigateHome,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<AccommodationCategoryId>(() => {
    if (typeof window === 'undefined') return 'all';
    return parseCategorySlugFromSearch(window.location.search);
  });
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  const [minGuests, setMinGuests] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityId[]>([]);
  const [sortBy, setSortBy] = useState<AccommodationSortOption>('recommended');
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);
  const [advisorExpanded, setAdvisorExpanded] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  // Keep category selection synchronized with URL ?category=<slug>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPopState = () => {
      setActiveCategory(parseCategorySlugFromSearch(window.location.search));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const syncCategoryUrl = (nextCategory: AccommodationCategoryId) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (nextCategory === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', nextCategory);
    }
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
      window.history.replaceState({}, '', nextUrl);
    }
  };

  const handleSelectCategory = (categoryId: AccommodationCategoryId) => {
    setActiveCategory(categoryId);
    syncCategoryUrl(categoryId);
  };

  const publishedAccommodations = useMemo(
    () => ALL_ACCOMMODATIONS.filter(isPublishedAccommodation),
    []
  );

  const heroBackdropImage = useMemo(() => {
    const preferred = publishedAccommodations.find((p) => p.slug === 'palm-river-hotel')
      || publishedAccommodations.find((p) => p.slug === 'victoria-falls-safari-lodge')
      || publishedAccommodations[0];
    return preferred?.heroImage || '';
  }, [publishedAccommodations]);

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'] || { symbol: '$', rate: 1 };
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<AccommodationCategoryId, number> = {
      all: publishedAccommodations.length,
      hotels: 0,
      lodges: 0,
      'guest-houses': 0,
      apartments: 0,
    };
    for (const item of publishedAccommodations) {
      const cat = getAccommodationCategoryId(item);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [publishedAccommodations]);

  const amenityCounts = useMemo(() => {
    const counts: Record<AmenityId, number> = {
      wifi: 0,
      pool: 0,
      ac: 0,
      'self-catering': 0,
      'family-friendly': 0,
      parking: 0,
    };
    for (const item of publishedAccommodations) {
      for (const amenity of getPropertyAmenities(item)) {
        counts[amenity] = (counts[amenity] || 0) + 1;
      }
    }
    return counts;
  }, [publishedAccommodations]);

  const parsedMinPrice = minPriceInput.trim() !== '' ? Number(minPriceInput) : null;
  const parsedMaxPrice = maxPriceInput.trim() !== '' ? Number(maxPriceInput) : null;

  const filteredAccommodations = useMemo(() => {
    return filterAndSortAccommodations(publishedAccommodations, {
      category: activeCategory,
      search: searchQuery,
      minPriceUSD: parsedMinPrice,
      maxPriceUSD: parsedMaxPrice,
      minGuests,
      amenities: selectedAmenities,
      sortBy,
    });
  }, [
    publishedAccommodations,
    activeCategory,
    searchQuery,
    parsedMinPrice,
    parsedMaxPrice,
    minGuests,
    selectedAmenities,
    sortBy,
  ]);

  const activeFilterCount =
    (minPriceInput.trim() !== '' ? 1 : 0) +
    (maxPriceInput.trim() !== '' ? 1 : 0) +
    (minGuests !== null ? 1 : 0) +
    selectedAmenities.length;

  const hasAnyActiveFilter =
    searchQuery.trim() !== '' ||
    activeCategory !== 'all' ||
    activeFilterCount > 0 ||
    sortBy !== 'recommended';

  const clearAllFilters = () => {
    setSearchQuery('');
    handleSelectCategory('all');
    setMinPriceInput('');
    setMaxPriceInput('');
    setMinGuests(null);
    setSelectedAmenities([]);
    setSortBy('recommended');
  };

  const toggleAmenity = (amenity: AmenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -132;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleApplyAdvisorFilters = (next: Partial<AccommodationFilters>) => {
    if (next.category) {
      handleSelectCategory(next.category);
    } else {
      handleSelectCategory('all');
    }
    setMinPriceInput(next.minPriceUSD !== undefined && next.minPriceUSD !== null ? String(next.minPriceUSD) : '');
    setMaxPriceInput(next.maxPriceUSD !== undefined && next.maxPriceUSD !== null ? String(next.maxPriceUSD) : '');
    setMinGuests(next.minGuests ?? null);
    setSelectedAmenities(next.amenities ?? []);
    setShowFiltersPanel(true);
    scrollToSection('all-stays');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToSection('all-stays');
  };

  const activeCategoryLabel =
    activeCategory === 'all'
      ? 'All Stays'
      : ACCOMMODATION_CATEGORY_DEFS.find((c) => c.id === activeCategory)?.label ?? 'Stays';

  const conciseFaqs = useMemo(() => FAQS.slice(0, 5), []);

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1A2E35] pb-20 overflow-x-clip">
      {/* Top Breadcrumb Bar */}
      <div className="bg-[#0B5E8E] text-white py-3 px-4 sm:px-6 lg:px-8 border-b border-[#08486e]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium">
          <nav className="flex items-center gap-2 text-white/75" aria-label="Breadcrumb">
            <PageLink
              href={'/'}
              onClick={onNavigateHome}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{editorial("travel/AccommodationDirectoryPage.text1")}</span>
            </PageLink>
            <span>/</span>
            <span className="text-[#C9A66B] font-semibold">
              {editorial("travel/AccommodationDirectoryPage.text2")}
            </span>
          </nav>

          <span className="text-white/80 text-[11px] font-semibold hidden sm:inline">
            {editorial("travel/AccommodationDirectoryPage.text3")}
          </span>
        </div>
      </div>

      {/* 1. HERO HEADER: SHORT INTRODUCTION + ONE PRIMARY SEARCH FIELD */}
      <section className="relative bg-[#0D2833] text-white py-12 sm:py-16 overflow-hidden border-b border-[#C9A66B]/30">
        <div className="absolute inset-0 z-0">
          {heroBackdropImage && (
            <img
              src={heroBackdropImage}
              alt="Victoria Falls Accommodation"
              className="w-full h-full object-cover object-center filter brightness-90 saturate-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D2833]/92 via-[#0D2833]/82 to-[#0D2833]/92" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-transparent to-[#0D2833]/60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0D2833]/80 backdrop-blur-md border border-[#C9A66B]/60 text-[#E5C989] text-xs font-bold uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{editorial("travel/AccommodationDirectoryPage.text4")}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
              {editorial("travel/AccommodationDirectoryPage.text5")}
            </h1>

            <p className="text-sm sm:text-base text-gray-100 font-light leading-relaxed max-w-2xl mx-auto">
              {editorial("travel/AccommodationDirectoryPage.text6")}
            </p>

            {/* Single Primary Search Input integrated directly with the directory */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  aria-label="Search accommodation"
                  placeholder="Search hotels, lodges, guest houses or apartments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/95 backdrop-blur-md text-gray-900 placeholder-gray-500 rounded-2xl py-3.5 pl-12 pr-24 text-sm shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#C9A66B] border border-white/20"
                />
                {searchQuery.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-14 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>
              {searchQuery.trim() !== '' && (
                <p className="mt-2.5 text-xs text-[#E5C989] font-medium">
                  Showing {filteredAccommodations.length}{' '}
                  {filteredAccommodations.length === 1 ? 'stay matching' : 'stays matching'} "{searchQuery}"
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 2. SINGLE CATEGORY NAVIGATION BAR ABOVE LISTINGS */}
      <section
        className="sticky top-[var(--header-height,73px)] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs py-3 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none"
        aria-label="Accommodation categories"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
          <button
            type="button"
            onClick={() => handleSelectCategory('all')}
            aria-pressed={activeCategory === 'all'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-[#0B5E8E] text-white shadow-xs'
                : 'bg-[#FAF9F6] text-[#0B5E8E] border border-[#0B5E8E]/20 hover:bg-[#0B5E8E] hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>All Stays ({categoryCounts.all})</span>
          </button>

          {ACCOMMODATION_CATEGORY_DEFS.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                aria-pressed={isSelected}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap group ${
                  isSelected
                    ? 'bg-[#0B5E8E] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-[#0B5E8E] hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C9A66B]' : 'text-gray-500 group-hover:text-[#C9A66B]'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600 group-hover:bg-white/20 group-hover:text-white'
                  }`}
                >
                  {categoryCounts[cat.id]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER (Consistent 1280px max width across every section) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-14 lg:space-y-16">
        {/* 3. ACCOMMODATION DIRECTORY */}
        <section id="all-stays" className="scroll-mt-36 space-y-6">
          {/* Unified Toolbar Header (Heading, Sort, Compact Filter Toggle) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                {activeCategoryLabel} ({filteredAccommodations.length})
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-light">
                Handpicked Victoria Falls properties reviewed in person. Click any property to view room options and request rates.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              {/* Sort Selector */}
              <div className="relative flex-1 sm:flex-none min-w-[185px]">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  aria-label="Sort accommodation"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as AccommodationSortOption)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pl-8 pr-8 text-xs font-semibold text-[#0B5E8E] focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] cursor-pointer shadow-2xs"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Compact Filters Drawer Toggle (Budget · Guests · Amenities) */}
              <button
                type="button"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                aria-expanded={showFiltersPanel}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs shrink-0 ${
                  showFiltersPanel || activeFilterCount > 0
                    ? 'bg-[#0B5E8E] text-white border-[#0B5E8E]'
                    : 'bg-white text-[#0B5E8E] border-gray-200 hover:border-[#0B5E8E]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Budget · Guests · Amenities</span>
                {activeFilterCount > 0 && (
                  <span className="bg-[#C9A66B] text-[#0D2833] text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {activeFilterCount}
                  </span>
                )}
                {showFiltersPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Collapsible Filters Panel */}
          {showFiltersPanel && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-start">
                {/* Nightly Budget */}
                <div className="lg:col-span-4 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0B5E8E] block">
                    Nightly Budget (USD guide rate)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="number"
                      min={0}
                      placeholder="Min ($)"
                      aria-label="Minimum nightly price USD"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="Max ($)"
                      aria-label="Maximum nightly price USD"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                    />
                  </div>
                </div>

                {/* Party Size / Guests */}
                <div className="lg:col-span-3 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0B5E8E] block">
                    Party Size (Room Occupancy)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: null, label: 'Any' },
                      { value: 2, label: '2+ guests' },
                      { value: 4, label: '4+ guests' },
                      { value: 6, label: '6+ guests' },
                    ].map((opt) => {
                      const active = minGuests === opt.value;
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => setMinGuests(opt.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            active
                              ? 'bg-[#0B5E8E] text-white border-[#0B5E8E]'
                              : 'bg-[#FAF9F6] text-gray-700 border-gray-200 hover:border-[#0B5E8E]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amenities */}
                <div className="lg:col-span-5 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0B5E8E] block">
                    Amenities
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AMENITY_DEFINITIONS.map((amenity) => {
                      const active = selectedAmenities.includes(amenity.id);
                      const count = amenityCounts[amenity.id];
                      return (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                            active
                              ? 'bg-[#0B5E8E] text-white border-[#0B5E8E]'
                              : 'bg-[#FAF9F6] text-gray-700 border-gray-200 hover:border-[#0B5E8E]'
                          }`}
                        >
                          <span>{amenity.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${
                              active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visible Applied Filter Selections (Clear Visibility & One-Click Removal) */}
          {hasAnyActiveFilter && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Applied filters:</span>

              {activeCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all')}
                  className="inline-flex items-center gap-1 bg-white border border-[#0B5E8E]/30 text-[#0B5E8E] font-semibold px-2.5 py-1 rounded-full hover:bg-gray-50 cursor-pointer"
                >
                  <span>Category: {activeCategoryLabel}</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {searchQuery.trim() !== '' && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1 bg-white border border-[#0B5E8E]/30 text-[#0B5E8E] font-semibold px-2.5 py-1 rounded-full hover:bg-gray-50 cursor-pointer"
                >
                  <span>Search: "{searchQuery.trim()}"</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {(minPriceInput.trim() !== '' || maxPriceInput.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setMinPriceInput('');
                    setMaxPriceInput('');
                  }}
                  className="inline-flex items-center gap-1 bg-white border border-[#0B5E8E]/30 text-[#0B5E8E] font-semibold px-2.5 py-1 rounded-full hover:bg-gray-50 cursor-pointer"
                >
                  <span>
                    Budget: {minPriceInput.trim() ? `$${minPriceInput}` : '$0'} – {maxPriceInput.trim() ? `$${maxPriceInput}` : 'Any'}
                  </span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {minGuests !== null && (
                <button
                  type="button"
                  onClick={() => setMinGuests(null)}
                  className="inline-flex items-center gap-1 bg-white border border-[#0B5E8E]/30 text-[#0B5E8E] font-semibold px-2.5 py-1 rounded-full hover:bg-gray-50 cursor-pointer"
                >
                  <span>{minGuests}+ guests</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              {selectedAmenities.map((amenityId) => {
                const label = AMENITY_DEFINITIONS.find((a) => a.id === amenityId)?.label ?? amenityId;
                return (
                  <button
                    key={amenityId}
                    type="button"
                    onClick={() => toggleAmenity(amenityId)}
                    className="inline-flex items-center gap-1 bg-white border border-[#0B5E8E]/30 text-[#0B5E8E] font-semibold px-2.5 py-1 rounded-full hover:bg-gray-50 cursor-pointer"
                  >
                    <span>{label}</span>
                    <X className="w-3 h-3" />
                  </button>
                );
              })}

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[#E67E22] hover:text-[#c96712] font-bold underline px-1.5 py-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Listings Grid (3 cols desktop / 2 cols tablet / 1 col mobile) or Empty State */}
          {filteredAccommodations.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-2xl border border-gray-200 p-8 space-y-4 shadow-2xs">
              <HelpCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#0B5E8E]">
                  No stays match your current filters
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm max-w-md mx-auto font-light">
                  Try widening your budget, adjusting guest capacity, or clearing filters to view all eight Victoria Falls properties.
                </p>
              </div>
              <button
                type="button"
                onClick={clearAllFilters}
                className="bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Reset Search &amp; Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              {filteredAccommodations.map((property) => (
                <PropertyDisplayCard
                  key={property.id}
                  property={property}
                  formatPrice={formatPrice}
                  onSelectProperty={onSelectProperty}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. OPTIONAL STAY ADVISOR (COLLAPSIBLE BELOW LISTINGS, CONNECTED TO DIRECTORY FILTERS) */}
        <section id="advisor-section" className="scroll-mt-36">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A66B] block">
                Optional Matching Tool
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                Not sure which stay suits you?
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-light">
                Use the Stay Advisor to narrow down options by travel party, nightly budget and setting—or ask a Victoria Falls specialist directly on WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setAdvisorExpanded(!advisorExpanded)}
                aria-expanded={advisorExpanded}
                className="bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4 text-[#C9A66B]" />
                <span>{advisorExpanded ? 'Hide Stay Advisor' : 'Open Stay Advisor'}</span>
                {advisorExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <a
                href={getWhatsAppAccommodationEnquiryUrl('Victoria Falls Accommodation')}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FAF9F6] hover:bg-gray-100 text-[#0B5E8E] border border-gray-200 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Ask a Specialist</span>
              </a>
            </div>
          </div>

          {advisorExpanded && (
            <div className="mt-4">
              <AccommodationAdvisor
                currency={currency}
                onSelectProperty={onSelectProperty}
                onIncludeInHoliday={onIncludeInHoliday}
                onApplyFiltersToDirectory={handleApplyAdvisorFilters}
              />
            </div>
          )}
        </section>

        {/* 5. CONDENSED PLANNING ADVICE & FAQS */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/90 shadow-xs space-y-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9A66B] uppercase tracking-wider">
              <Compass className="w-4 h-4 text-[#C9A66B]" />
              <span>Local Planning Guidance</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
              Helpful Planning Advice &amp; FAQs
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-light">
              {editorial("travel/AccommodationDirectoryPage.text29")}
            </p>
          </div>

          {/* Condensed 3 Local Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-gray-200/80 space-y-2">
              <h3 className="font-serif font-bold text-base text-[#0B5E8E]">
                {editorial("travel/AccommodationDirectoryPage.text30")}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                <strong>{editorial("travel/AccommodationDirectoryPage.text31")}</strong>{' '}
                {editorial("travel/AccommodationDirectoryPage.text32")}
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-gray-200/80 space-y-2">
              <h3 className="font-serif font-bold text-base text-[#0B5E8E]">
                {editorial("travel/AccommodationDirectoryPage.text37")}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                <strong>{editorial("travel/AccommodationDirectoryPage.text38")}</strong>{' '}
                {editorial("travel/AccommodationDirectoryPage.text39")}
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-gray-200/80 space-y-2">
              <h3 className="font-serif font-bold text-base text-[#0B5E8E]">
                {editorial("travel/AccommodationDirectoryPage.text42")}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                {editorial("travel/AccommodationDirectoryPage.text43")}
              </p>
            </div>
          </div>

          {/* 5 Concise FAQs */}
          <div className="space-y-3 border-t border-gray-100 pt-8">
            <h3 className="font-serif text-xl font-bold text-[#0B5E8E]">
              {editorial("travel/AccommodationDirectoryPage.text49")}
            </h3>
            <div className="space-y-2.5">
              {conciseFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-gray-200/80 rounded-2xl overflow-hidden transition-all bg-[#FAF9F6]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-[#0B5E8E] hover:text-[#C9A66B] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#C9A66B] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-0 text-xs sm:text-sm text-gray-600 font-light leading-relaxed border-t border-gray-100 bg-white">
                        <p className="pt-3">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. FINAL SPECIALIST CTA */}
        <section className="bg-[#0D2833] text-white p-8 sm:p-12 rounded-3xl border border-[#C9A66B]/30 text-center relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B5E8E]/60 text-[#E5C989] text-xs font-bold uppercase tracking-widest border border-[#C9A66B]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>Need Help Choosing?</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Speak with Outbound Holidays
            </h2>

            <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
              {editorial("travel/AccommodationDirectoryPage.text53")}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={getWhatsAppUrl(editorialFormat("travel/AccommodationDirectoryPage.copy1"))}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Enquiry</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setAdvisorExpanded(true);
                  scrollToSection('advisor-section');
                }}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm py-3.5 px-7 rounded-xl border border-white/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Open Stay Advisor</span>
                <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
              </button>
            </div>
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C9A66B_1px,transparent_1px)] [background-size:20px_20px]" />
        </section>
      </div>
    </div>
  );
};

/* SIMPLIFIED ACCOMMODATION LISTING CARD */
interface PropertyDisplayCardProps {
  property: DetailedAccommodation;
  formatPrice: (priceUSD: number) => string;
  onSelectProperty: (property: DetailedAccommodation) => void;
}

const PropertyDisplayCard: React.FC<PropertyDisplayCardProps> = ({
  property,
  formatPrice,
  onSelectProperty,
}) => {
  const categoryBadge = getAccommodationCategorySingular(property);
  const keyAmenities = getKeyAmenitiesForCard(property, 3);
  const priceUnit = getPriceUnitLabel(property);
  const hasGuidePrice = typeof property.priceFromUSD === 'number' && property.priceFromUSD > 0;

  return (
    <article
      onClick={() => onSelectProperty(property)}
      className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer h-full"
    >
      <div>
        {/* Clean Image with single Category badge */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <img
            src={property.heroImage}
            alt={property.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <div className="absolute top-3.5 left-3.5 bg-[#0D2833]/90 text-[#E5C989] px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-md border border-[#C9A66B]/40">
            {categoryBadge}
          </div>
        </div>

        {/* Focused Body: Location, Name, Short Description, 3 Amenities */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#C9A66B] shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          <h3 className="font-serif font-bold text-xl text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug">
            {property.name}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 font-light">
            {property.shortDescription}
          </p>

          {keyAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {keyAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="bg-[#FAF9F6] border border-gray-200/90 text-gray-700 text-[11px] font-medium px-2.5 py-0.5 rounded-md"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Clearly Qualified Price + View Details CTA */}
      <div className="p-5 sm:p-6 pt-0 space-y-3.5">
        <div className="border-t border-gray-100 pt-3.5 space-y-0.5">
          {hasGuidePrice ? (
            <div className="text-sm font-serif font-bold text-[#0B5E8E]">
              From {formatPrice(property.priceFromUSD)}{' '}
              <span className="font-sans text-xs font-normal text-gray-500">{priceUnit}</span>
            </div>
          ) : (
            <div className="text-sm font-serif font-bold text-[#0B5E8E]">
              Price on enquiry
            </div>
          )}
          <div className="text-[11px] text-gray-500 font-normal">
            Guide rate · Rates confirmed before booking
          </div>
        </div>

        <PageLink
          href={accommodationPath(property)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectProperty(property);
          }}
          className="w-full bg-[#FAF9F6] group-hover:bg-[#0B5E8E] text-[#0B5E8E] group-hover:text-white border border-gray-200 group-hover:border-[#0B5E8E] text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
        </PageLink>
      </div>
    </article>
  );
};
