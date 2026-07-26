import React, { useState } from 'react';
import { ActivePortal, Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { 
  Compass, 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  Palmtree, 
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  activePortal: ActivePortal;
  setActivePortal: (portal: ActivePortal) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenPlanHoliday: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePortal,
  setActivePortal,
  currency,
  setCurrency,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenPlanHoliday,
  searchQuery,
  setSearchQuery,
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#C9A66B]/30 shadow-xs">
      {/* Top Banner Switcher */}
      <div className="bg-[#2F3A44] text-white text-xs px-4 py-2 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Brand Portal Selector */}
          <div className="flex items-center gap-1 bg-[#1A232A] p-1 rounded-full text-xs">
            <button
              onClick={() => setActivePortal('travel')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
                activePortal === 'travel'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Palmtree className="w-3.5 h-3.5 text-[#E67E22]" />
              Outbound Holidays
            </button>
            <button
              onClick={() => setActivePortal('art')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
                activePortal === 'art'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              African Art Marketplace
            </button>
            <button
              onClick={() => setActivePortal('combined')}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-gray-300 hover:text-white font-medium ${
                activePortal === 'combined' ? 'bg-[#3F6B3C] text-white' : ''
              }`}
            >
              Explore Both
            </button>
          </div>

          {/* Quick Info & Currency Switcher */}
          <div className="flex items-center gap-4 text-gray-300">
            <span className="hidden lg:inline-flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-[#C9A66B]" />
              Zimbabwe Travel Line: +263 77 123 4567
            </span>

            {/* Currency Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 font-semibold text-white bg-[#0B5E8E]/40 hover:bg-[#0B5E8E] px-2.5 py-1 rounded-md transition-colors"
              >
                <span>{currency} ({CURRENCY_RATES[currency].symbol})</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white text-[#2F3A44] rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        setCurrency(curr);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-[#0B5E8E]/10 flex justify-between ${
                        currency === curr ? 'text-[#0B5E8E] font-bold bg-[#0B5E8E]/5' : ''
                      }`}
                    >
                      <span>{curr}</span>
                      <span className="text-gray-500">{CURRENCY_RATES[curr].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigateSection('hero')}
          className="cursor-pointer flex items-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#0B5E8E] flex items-center justify-center text-white shadow-xs group-hover:bg-[#0B5E8E]/90 transition-colors">
            {activePortal === 'art' ? (
              <Sparkles className="w-6 h-6 text-[#C9A66B]" />
            ) : (
              <Compass className="w-6 h-6 text-[#E67E22]" />
            )}
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-[#0B5E8E] block leading-none">
              {activePortal === 'art' ? 'African Art Marketplace' : 'Outbound Holidays'}
            </span>
            <span className="text-[11px] font-semibold text-[#3F6B3C] tracking-wider uppercase block mt-0.5">
              {activePortal === 'art' ? 'Authentic Crafts & Gallery' : 'Victoria Falls Specialists'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-semibold text-sm text-[#2F3A44]">
          {activePortal === 'art' ? (
            <>
              <button onClick={() => onNavigateSection('art-shop')} className="hover:text-[#C9A66B] transition-colors">
                Shop Art
              </button>
              <button onClick={() => onNavigateSection('art-categories')} className="hover:text-[#C9A66B] transition-colors">
                Categories
              </button>
              <button onClick={() => onNavigateSection('art-artists')} className="hover:text-[#C9A66B] transition-colors">
                Artists
              </button>
              <button onClick={() => onNavigateSection('art-why-us')} className="hover:text-[#C9A66B] transition-colors">
                Why Us
              </button>
              <button onClick={() => onNavigateSection('reviews')} className="hover:text-[#C9A66B] transition-colors">
                Reviews
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onNavigateSection('hero')} className="hover:text-[#C9A66B] transition-colors">
                Home
              </button>
              <button onClick={() => onNavigateSection('travel-guide')} className="hover:text-[#C9A66B] transition-colors">
                Victoria Falls Guide
              </button>
              <button onClick={() => onNavigateSection('travel-accommodations')} className="hover:text-[#C9A66B] transition-colors">
                Accommodation
              </button>
              <button onClick={() => onNavigateSection('travel-experiences')} className="hover:text-[#C9A66B] transition-colors">
                Experiences
              </button>
              <button onClick={() => onNavigateSection('travel-packages')} className="hover:text-[#C9A66B] transition-colors">
                Packages
              </button>
              <button onClick={() => onNavigateSection('about-us')} className="hover:text-[#C9A66B] transition-colors">
                About Us
              </button>
              <button onClick={() => onNavigateSection('contact-us')} className="hover:text-[#C9A66B] transition-colors">
                Contact
              </button>
            </>
          )}
        </nav>

        {/* Action Controls & CTA */}
        <div className="flex items-center gap-3">
          {/* Search Input (Art Portal / General) */}
          <div className="relative hidden lg:block w-48 xl:w-56">
            <input
              type="text"
              placeholder={activePortal === 'art' ? "Search art, artists..." : "Search packages..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-full py-1.5 pl-8 pr-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B5E8E]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2 text-[#2F3A44] hover:text-[#0B5E8E] transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E67E22] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-[#2F3A44] hover:text-[#0B5E8E] transition-colors"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#0B5E8E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Primary High-Priority Sunset Orange CTA */}
          <button
            onClick={onOpenPlanHoliday}
            className="bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-md shadow-xs hover:shadow-md transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            Plan My Holiday
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#2F3A44]"
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
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="grid grid-cols-1 gap-2 font-semibold text-sm text-[#2F3A44]">
            {activePortal === 'art' ? (
              <>
                <button 
                  onClick={() => { onNavigateSection('art-shop'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  Shop Art
                </button>
                <button 
                  onClick={() => { onNavigateSection('art-categories'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  Categories
                </button>
                <button 
                  onClick={() => { onNavigateSection('art-artists'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  Artists
                </button>
                <button 
                  onClick={() => { onNavigateSection('art-why-us'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  Why Shop With Us
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { onNavigateSection('hero'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  Home
                </button>
                <button 
                  onClick={() => { onNavigateSection('travel-guide'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  Victoria Falls Guide
                </button>
                <button 
                  onClick={() => { onNavigateSection('travel-accommodations'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  Accommodation
                </button>
                <button 
                  onClick={() => { onNavigateSection('travel-experiences'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  Experiences
                </button>
                <button 
                  onClick={() => { onNavigateSection('travel-packages'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  Packages
                </button>
                <button 
                  onClick={() => { onNavigateSection('about-us'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  About Us
                </button>
                <button 
                  onClick={() => { onNavigateSection('contact-us'); setMobileMenuOpen(false); }}
                  className="text-left py-1.5 px-2 hover:bg-gray-50 rounded-md"
                >
                  Contact
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
