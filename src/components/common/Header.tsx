import React, { useState } from 'react';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { 
  Compass, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  PhoneCall,
  CalendarCheck
} from 'lucide-react';

interface HeaderProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onOpenPlanHoliday: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNavigateSection: (sectionId: string) => void;
  isGuideActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  setCurrency,
  onOpenPlanHoliday,
  searchQuery,
  setSearchQuery,
  onNavigateSection,
  isGuideActive = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200/80 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-[#0B5E8E] text-white text-[11px] px-4 py-2 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2">
          {/* Tagline */}
          <div className="flex items-center gap-2 text-[11px] font-medium text-white/90">
            <span className="hidden sm:inline bg-[#E67E22] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Victoria Falls Specialist
            </span>
            <span className="truncate">Zimbabwe’s Premier Travel & Safari Concierge</span>
          </div>

          {/* Quick Info & Currency Switcher */}
          <div className="flex items-center gap-4 text-white/90 text-[11px]">
            <a href="tel:+263771234567" className="hidden lg:inline-flex items-center gap-1.5 hover:text-[#C9A66B] transition-colors">
              <PhoneCall className="w-3 h-3 text-[#C9A66B]" />
              <span>Concierge: +263 77 123 4567</span>
            </a>

            {/* Currency Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 font-medium text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors text-[11px] cursor-pointer"
              >
                <span>{currency} ({CURRENCY_RATES[currency].symbol})</span>
                <ChevronDown className="w-3 h-3 text-[#C9A66B]" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white text-[#2F3A44] rounded-xl shadow-xl border border-gray-200 py-1.5 z-50">
                  {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        setCurrency(curr);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[11px] font-semibold hover:bg-gray-100 flex justify-between cursor-pointer ${
                        currency === curr ? 'text-[#0B5E8E] font-bold bg-[#0B5E8E]/10' : ''
                      }`}
                    >
                      <span>{curr}</span>
                      <span className="text-gray-400">{CURRENCY_RATES[curr].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigateSection('hero')}
          className="cursor-pointer flex items-center gap-3 group shrink-0 pr-4"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0B5E8E] flex items-center justify-center text-white shadow-xs group-hover:bg-[#08486e] transition-colors">
            <Compass className="w-5 h-5 text-[#C9A66B]" />
          </div>
          <div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-[#0B5E8E] block leading-none font-serif">
              Outbound Holidays
            </span>
            <span className="text-[10px] font-semibold text-[#C9A66B] tracking-widest uppercase block mt-1">
              Victoria Falls Zimbabwe
            </span>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-semibold text-xs sm:text-sm text-[#2F3A44]">
          {/* Victoria Falls Guide Link with Active Highlight */}
          <button 
            onClick={() => onNavigateSection('travel-guide')} 
            aria-current={isGuideActive ? 'page' : undefined}
            className={`transition-all whitespace-nowrap py-1 cursor-pointer flex items-center gap-2 border-b-2 font-bold ${
              isGuideActive
                ? 'border-[#C9A66B] text-[#0B5E8E]'
                : 'border-transparent text-[#2F3A44] hover:text-[#0B5E8E] hover:border-[#C9A66B]/50'
            }`}
          >
            {/* Visual Indicator Dot */}
            <span className={`w-2 h-2 rounded-full transition-all ${
              isGuideActive ? 'bg-[#C9A66B] ring-4 ring-[#C9A66B]/20' : 'bg-transparent'
            }`} />
            <span>Victoria Falls Guide</span>
          </button>

          <button 
            onClick={() => onNavigateSection('travel-experiences')} 
            className="hover:text-[#0B5E8E] transition-colors whitespace-nowrap py-1 border-b-2 border-transparent hover:border-[#0B5E8E] cursor-pointer"
          >
            Experiences
          </button>
          <button 
            onClick={() => onNavigateSection('travel-packages')} 
            className="hover:text-[#0B5E8E] transition-colors whitespace-nowrap py-1 border-b-2 border-transparent hover:border-[#0B5E8E] cursor-pointer"
          >
            Packages
          </button>
          <button 
            onClick={() => onNavigateSection('contact-us')} 
            className="hover:text-[#0B5E8E] transition-colors whitespace-nowrap py-1 border-b-2 border-transparent hover:border-[#0B5E8E] cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Action Controls & Primary CTA */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative hidden xl:block w-44">
            <input
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border border-gray-200 rounded-full py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Primary Call To Action in Sunset Orange */}
          <button
            onClick={onOpenPlanHoliday}
            className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Plan My Holiday</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#0B5E8E]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="grid grid-cols-1 gap-2 font-semibold text-sm text-[#2F3A44]">
            <button 
              onClick={() => { onNavigateSection('travel-guide'); setMobileMenuOpen(false); }}
              aria-current={isGuideActive ? 'page' : undefined}
              className={`text-left py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors ${
                isGuideActive 
                  ? 'bg-[#0B5E8E]/10 text-[#0B5E8E] font-bold border-l-4 border-[#C9A66B]' 
                  : 'hover:bg-gray-50 text-[#2F3A44]'
              }`}
            >
              <div className="flex items-center gap-2">
                {isGuideActive && <span className="w-2 h-2 rounded-full bg-[#C9A66B]" />}
                <span>Victoria Falls Guide</span>
              </div>
              {isGuideActive && <span className="text-[10px] font-extrabold uppercase text-[#C9A66B]">Active</span>}
            </button>
            <button 
              onClick={() => { onNavigateSection('travel-experiences'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 hover:bg-gray-50 rounded-xl flex items-center justify-between"
            >
              <span>Experiences & Activities</span>
            </button>
            <button 
              onClick={() => { onNavigateSection('travel-packages'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 hover:bg-gray-50 rounded-xl flex items-center justify-between"
            >
              <span>Holiday Packages</span>
            </button>
            <button 
              onClick={() => { onNavigateSection('contact-us'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 hover:bg-gray-50 rounded-xl flex items-center justify-between"
            >
              <span>Contact Specialist</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
