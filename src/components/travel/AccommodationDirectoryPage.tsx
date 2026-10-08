import { editorialFormat } from "../../runtime/catalog";
import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { getWhatsAppUrl } from '../../utils/whatsapp';
import { PageLink } from '../common/PageLink';
import { accommodationPath } from '../../routes';
import React,{ useState,useMemo } from 'react';
import { DetailedAccommodation,ALL_ACCOMMODATIONS } from '../../data/accommodationsData';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { AccommodationAdvisor } from './AccommodationAdvisor';
import {
Star,
ArrowRight,
ShieldCheck,
Home,Sparkles,CalendarCheck,
Compass,
MessageCircle,
ChevronDown,
ChevronUp,
HelpCircle,Award
} from 'lucide-react';

interface AccommodationDirectoryPageProps {
  currency: Currency;
  onSelectProperty: (property: DetailedAccommodation) => void;
  onIncludeInHoliday: (property: DetailedAccommodation) => void;
  onNavigateHome: () => void;
}

type FilterTag = 'all' | 'luxury-lodges' | 'boutique-hotels' | 'family-friendly' | 'romantic-escapes' | 'best-value' | 'safari-lodges' | 'self-catering' | 'walking-distance';

let FILTER_CATEGORIES: { id: FilterTag; label: string }[];
registerContent(() => { FILTER_CATEGORIES = editorialValue("travel/AccommodationDirectoryPage.FILTER_CATEGORIES", {}); });

let FAQS: any;
registerContent(() => { FAQS = editorialValue("travel/AccommodationDirectoryPage.FAQS", {}); });

export const AccommodationDirectoryPage: React.FC<AccommodationDirectoryPageProps> = ({
  currency,
  onSelectProperty,
  onIncludeInHoliday,
  onNavigateHome,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTag>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showBrowseDirectory, setShowBrowseDirectory] = useState<boolean>(false);

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  const filteredAccommodations = useMemo(() => {
    return ALL_ACCOMMODATIONS.filter((item) => {
      if (activeFilter === 'all') return true;
      return item.filterTags.includes(activeFilter);
    });
  }, [activeFilter]);

  // Curated Groups
  const firstTimeStays = useMemo(() => {
    return ALL_ACCOMMODATIONS.filter(a => a.filterTags.includes('walking-distance') || a.slug === 'victoria-falls-safari-lodge').slice(0, 4);
  }, []);

  const couplesStays = useMemo(() => {
    return ALL_ACCOMMODATIONS.filter(a => a.filterTags.includes('romantic-escapes') || a.badge === 'Romantic' || a.category === 'Boutique Hotel').slice(0, 4);
  }, []);

  const familyStays = useMemo(() => {
    return ALL_ACCOMMODATIONS.filter(a => a.filterTags.includes('family-friendly') || a.category === 'Self-Catering').slice(0, 4);
  }, []);

  const valueStays = useMemo(() => {
    return ALL_ACCOMMODATIONS.filter(a => a.filterTags.includes('best-value') || a.priceFromUSD <= 220).slice(0, 4);
  }, []);

  const luxuryStays = useMemo(() => {
    return ALL_ACCOMMODATIONS.filter(a => a.filterTags.includes('luxury-lodges') || a.priceFromUSD >= 350).slice(0, 4);
  }, []);

  const scrollToAdvisor = () => {
    const el = document.getElementById('accommodation-advisor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      
      {/* Top Breadcrumb Navigation Header */}
      <div className="bg-[#0B5E8E] text-white py-3.5 px-4 sm:px-6 lg:px-8 border-b border-[#08486e]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium">
          <nav className="flex items-center gap-2 text-white/70">
            <PageLink href={'/'}
              onClick={onNavigateHome}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{editorial("travel/AccommodationDirectoryPage.text1")}</span>
            </PageLink>
            <span>/</span>
            <span className="text-[#C9A66B] font-semibold">{editorial("travel/AccommodationDirectoryPage.text2")}</span>
          </nav>

          <span className="text-white/80 text-[11px] font-semibold hidden sm:inline">
            {editorial("travel/AccommodationDirectoryPage.text3")}</span>
        </div>
      </div>

      {/* 1. Hero Section */}
      <section className="bg-white border-b border-gray-200/80 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold uppercase tracking-widest border border-[#0B5E8E]/20">
            <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/AccommodationDirectoryPage.text4")}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#0B5E8E] tracking-tight leading-tight">
            {editorial("travel/AccommodationDirectoryPage.text5")}</h1>

          <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
            {editorial("travel/AccommodationDirectoryPage.text6")}</p>

          {/* Local Advisor Guarantee Box */}
          <div className="max-w-2xl mx-auto bg-[#FAF9F6] p-4 sm:p-5 rounded-2xl border border-gray-200/90 text-left flex items-start gap-3 shadow-2xs mt-4">
            <ShieldCheck className="w-5 h-5 text-[#3F6B3C] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-gray-700 font-light leading-relaxed">
              <strong className="font-bold text-[#0B5E8E]">{editorial("travel/AccommodationDirectoryPage.text7")}</strong>
              {editorial("travel/AccommodationDirectoryPage.text8")}</p>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">
        
        {/* 2. Accommodation Advisor Tool */}
        <section id="advisor-section">
          <AccommodationAdvisor 
            currency={currency}
            onSelectProperty={onSelectProperty}
            onIncludeInHoliday={onIncludeInHoliday}
          />
        </section>

        {/* 3. Curated Recommendation Sections by Traveller Type */}
        <section className="space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9A66B] uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>{editorial("travel/AccommodationDirectoryPage.text9")}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">
              {editorial("travel/AccommodationDirectoryPage.text10")}</h2>
            <p className="text-sm text-gray-600 font-light">
              {editorial("travel/AccommodationDirectoryPage.text11")}</p>
          </div>

          {/* Group 1: Best for First-Time Visitors */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 space-y-6 shadow-xs">
            <div className="border-b border-gray-100 pb-4 space-y-1">
              <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">{editorial("travel/AccommodationDirectoryPage.text12")}</span>
              <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">{editorial("travel/AccommodationDirectoryPage.text13")}</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light">
                {editorial("travel/AccommodationDirectoryPage.text14")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {firstTimeStays.map(prop => (
                <PropertyDisplayCard 
                  key={prop.id}
                  property={prop}
                  currency={currency}
                  formatPrice={formatPrice}
                  onSelectProperty={onSelectProperty}
                  onIncludeInHoliday={onIncludeInHoliday}
                />
              ))}
            </div>
          </div>

          {/* Group 2: Best for Couples & Honeymoons */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 space-y-6 shadow-xs">
            <div className="border-b border-gray-100 pb-4 space-y-1">
              <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">{editorial("travel/AccommodationDirectoryPage.text15")}</span>
              <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">{editorial("travel/AccommodationDirectoryPage.text16")}</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light">
                {editorial("travel/AccommodationDirectoryPage.text17")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {couplesStays.map(prop => (
                <PropertyDisplayCard 
                  key={prop.id}
                  property={prop}
                  currency={currency}
                  formatPrice={formatPrice}
                  onSelectProperty={onSelectProperty}
                  onIncludeInHoliday={onIncludeInHoliday}
                />
              ))}
            </div>
          </div>

          {/* Group 3: Best for Families */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 space-y-6 shadow-xs">
            <div className="border-b border-gray-100 pb-4 space-y-1">
              <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">{editorial("travel/AccommodationDirectoryPage.text18")}</span>
              <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">{editorial("travel/AccommodationDirectoryPage.text19")}</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light">
                {editorial("travel/AccommodationDirectoryPage.text20")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {familyStays.map(prop => (
                <PropertyDisplayCard 
                  key={prop.id}
                  property={prop}
                  currency={currency}
                  formatPrice={formatPrice}
                  onSelectProperty={onSelectProperty}
                  onIncludeInHoliday={onIncludeInHoliday}
                />
              ))}
            </div>
          </div>

          {/* Group 4: Best Value */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 space-y-6 shadow-xs">
            <div className="border-b border-gray-100 pb-4 space-y-1">
              <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">{editorial("travel/AccommodationDirectoryPage.text21")}</span>
              <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">{editorial("travel/AccommodationDirectoryPage.text22")}</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light">
                {editorial("travel/AccommodationDirectoryPage.text23")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {valueStays.map(prop => (
                <PropertyDisplayCard 
                  key={prop.id}
                  property={prop}
                  currency={currency}
                  formatPrice={formatPrice}
                  onSelectProperty={onSelectProperty}
                  onIncludeInHoliday={onIncludeInHoliday}
                />
              ))}
            </div>
          </div>

          {/* Group 5: Luxury & Riverfront */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 space-y-6 shadow-xs">
            <div className="border-b border-gray-100 pb-4 space-y-1">
              <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">{editorial("travel/AccommodationDirectoryPage.text24")}</span>
              <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">{editorial("travel/AccommodationDirectoryPage.text25")}</h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light">
                {editorial("travel/AccommodationDirectoryPage.text26")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {luxuryStays.map(prop => (
                <PropertyDisplayCard 
                  key={prop.id}
                  property={prop}
                  currency={currency}
                  formatPrice={formatPrice}
                  onSelectProperty={onSelectProperty}
                  onIncludeInHoliday={onIncludeInHoliday}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. "Where Should You Stay?" Editorial Guide */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/90 shadow-sm space-y-10">
          
          <div className="space-y-3 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{editorial("travel/AccommodationDirectoryPage.text27")}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">
              {editorial("travel/AccommodationDirectoryPage.text28")}</h2>
            <p className="text-sm text-gray-600 font-light leading-relaxed">
              {editorial("travel/AccommodationDirectoryPage.text29")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            
            {/* Location Decision Card */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-[#0B5E8E]">{editorial("travel/AccommodationDirectoryPage.text30")}</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                <strong>{editorial("travel/AccommodationDirectoryPage.text31")}</strong> {editorial("travel/AccommodationDirectoryPage.text32")}<br/>
                <strong>{editorial("travel/AccommodationDirectoryPage.text33")}</strong> {editorial("travel/AccommodationDirectoryPage.text34")}<br/>
                <strong>{editorial("travel/AccommodationDirectoryPage.text35")}</strong> {editorial("travel/AccommodationDirectoryPage.text36")}</p>
            </div>

            {/* Travel Style Decision Card */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-[#0B5E8E]">{editorial("travel/AccommodationDirectoryPage.text37")}</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                <strong>{editorial("travel/AccommodationDirectoryPage.text38")}</strong> {editorial("travel/AccommodationDirectoryPage.text39")}<br/>
                <strong>{editorial("travel/AccommodationDirectoryPage.text40")}</strong> {editorial("travel/AccommodationDirectoryPage.text41")}</p>
            </div>

            {/* Time Spent Decision Card */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-[#0B5E8E]">{editorial("travel/AccommodationDirectoryPage.text42")}</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                {editorial("travel/AccommodationDirectoryPage.text43")}</p>
            </div>

          </div>

          {/* Local Insight Callout */}
          <div className="bg-[#0D2833] text-white p-6 sm:p-8 rounded-2xl border border-[#C9A66B]/30 space-y-2">
            <div className="flex items-center gap-2 text-[#E5C989] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#C9A66B]" />
              <span>{editorial("travel/AccommodationDirectoryPage.text44")}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
              {editorial("travel/AccommodationDirectoryPage.text45")}</p>
          </div>

        </section>

        {/* 5. Collapsible Browse Our Recommended Places to Stay Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                {editorial("travel/AccommodationDirectoryPage.text46")}</h3>
              <p className="text-xs text-gray-500 font-light">
                {editorial("travel/AccommodationDirectoryPage.text47")}</p>
            </div>

            <button
              onClick={() => setShowBrowseDirectory(!showBrowseDirectory)}
              className="inline-flex items-center gap-2 bg-[#FAF9F6] hover:bg-[#0B5E8E] text-[#0B5E8E] hover:text-white border border-gray-200 hover:border-[#0B5E8E] font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <span>{showBrowseDirectory ? 'Hide Property List' : 'Browse All Recommended Stays'}</span>
              {showBrowseDirectory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showBrowseDirectory && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 space-y-8 animate-fadeIn">
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {FILTER_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeFilter === cat.id
                        ? 'bg-[#0B5E8E] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAccommodations.map(property => (
                  <PropertyDisplayCard 
                    key={property.id}
                    property={property}
                    currency={currency}
                    formatPrice={formatPrice}
                    onSelectProperty={onSelectProperty}
                    onIncludeInHoliday={onIncludeInHoliday}
                  />
                ))}
              </div>

            </div>
          )}
        </section>

        {/* 6. Frequently Asked Questions */}
        <section className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9A66B] uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-[#C9A66B]" />
              <span>{editorial("travel/AccommodationDirectoryPage.text48")}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
              {editorial("travel/AccommodationDirectoryPage.text49")}</h2>
            <p className="text-xs text-gray-500 font-light">
              {editorial("travel/AccommodationDirectoryPage.text50")}</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="border border-gray-200/80 rounded-2xl overflow-hidden transition-all bg-[#FAF9F6]"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-[#0B5E8E] hover:text-[#C9A66B] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#C9A66B] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-gray-600 font-light leading-relaxed border-t border-gray-100 bg-white">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. Final Planning CTA */}
        <section className="bg-[#0D2833] text-white p-8 sm:p-12 rounded-3xl border border-[#C9A66B]/30 text-center relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B5E8E]/60 text-[#E5C989] text-xs font-bold uppercase tracking-widest border border-[#C9A66B]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{editorial("travel/AccommodationDirectoryPage.text51")}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {editorial("travel/AccommodationDirectoryPage.text52")}</h2>

            <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
              {editorial("travel/AccommodationDirectoryPage.text53")}</p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={scrollToAdvisor}
                className="w-full sm:w-auto bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-xl border border-[#C9A66B]/30 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{editorial("travel/AccommodationDirectoryPage.text54")}</span>
                <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
              </button>

              <a
                href={getWhatsAppUrl(editorialFormat("travel/AccommodationDirectoryPage.copy1"))}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{editorial("travel/AccommodationDirectoryPage.text55")}</span>
              </a>
            </div>

          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C9A66B_1px,transparent_1px)] [background-size:20px_20px]" />
        </section>

      </div>

    </div>
  );
};

/* REUSABLE PROPERTY DISPLAY CARD */
interface PropertyDisplayCardProps {
  property: DetailedAccommodation;
  currency: Currency;
  formatPrice: (priceUSD: number) => string;
  onSelectProperty: (property: DetailedAccommodation) => void;
  onIncludeInHoliday: (property: DetailedAccommodation) => void;
}

const PropertyDisplayCard: React.FC<PropertyDisplayCardProps> = ({
  property,
  formatPrice,
  onSelectProperty,
  onIncludeInHoliday,
}) => {
  return (
    <div 
      onClick={() => onSelectProperty(property)}
      className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img 
            src={property.heroImage} 
            alt={property.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          
          {property.badge && (
            <div className="absolute top-3 left-3 bg-[#E67E22] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {property.badge}
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
            <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
              <Star className="w-3 h-3 text-[#C9A66B] fill-[#C9A66B]" />
              <span className="font-bold">{property.rating}</span>
            </span>
            <span className="text-[11px] text-white/90">
              {property.distanceFromFalls}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#C9A66B]">
            {property.category}
          </div>
          <h4 className="font-serif font-bold text-base text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors line-clamp-1">
            {property.name}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-2 font-light leading-relaxed">
            {property.shortDescription}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0 space-y-3 border-t border-gray-100 mt-2">
        <div className="flex items-baseline justify-between pt-2">
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-400 block">{editorial("travel/AccommodationDirectoryPage.text56")}</span>
            <span className="font-serif font-bold text-sm text-[#0B5E8E]">
              {formatPrice(property.priceFromUSD)}
              <span className="text-[10px] text-gray-500 font-normal"> {editorial("travel/AccommodationDirectoryPage.text57")}</span>
            </span>
          </div>
          <span className="text-[10px] text-[#3F6B3C] font-bold bg-[#3F6B3C]/10 px-2 py-0.5 rounded-md">
            {editorial("travel/AccommodationDirectoryPage.text58")}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <PageLink href={accommodationPath(property)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectProperty(property);
            }}
            className="w-full bg-[#FAF9F6] hover:bg-[#0B5E8E] text-[#0B5E8E] hover:text-white border border-gray-200 text-[11px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{editorial("travel/AccommodationDirectoryPage.text59")}</span>
            <ArrowRight className="w-3 h-3" />
          </PageLink>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onIncludeInHoliday(property);
            }}
            className="w-full bg-[#E67E22] hover:bg-[#d36e17] text-white text-[11px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <CalendarCheck className="w-3 h-3" />
            <span>{editorial("travel/AccommodationDirectoryPage.text60")}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
