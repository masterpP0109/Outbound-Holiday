import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { getWpConfig, resolveAssetUrl } from "../../runtime/api";
import { WHATSAPP_DISPLAY_NUMBER, getWhatsAppUrl } from '../../utils/whatsapp';
import { PageLink } from './PageLink';
import { sectionPath } from '../../routes';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  PhoneCall,
  CalendarCheck,
} from 'lucide-react';

let outboundLogo: any;
registerContent(() => { outboundLogo = editorialValue("common/Header.outboundLogo", {}); });

interface HeaderProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onOpenPlanHoliday: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNavigateSection: (sectionId: string) => void;
  isHomepage?: boolean;
  isGuideActive?: boolean;
  isExperiencesActive?: boolean;
  isAccommodationActive?: boolean;
  isPackagesActive?: boolean;
  isGalleryActive?: boolean;
  isAboutActive?: boolean;
  isBlogActive?: boolean;
  isContactActive?: boolean;
}

interface NavItem {
  id: string;
  section: string;
  label: string;
  active: boolean;
}

export const Header = ({
  currency,
  setCurrency,
  onOpenPlanHoliday,
  searchQuery,
  setSearchQuery,
  onNavigateSection,
  isHomepage = false,
  isGuideActive = false,
  isExperiencesActive = false,
  isAccommodationActive = false,
  isPackagesActive = false,
  isGalleryActive = false,
  isAboutActive = false,
  isBlogActive = false,
  isContactActive = false,
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileCloseBtnRef = useRef<HTMLButtonElement>(null);

  const wpConfig = getWpConfig();
  const isDraftPreview = Boolean(wpConfig?.isPreview);
  const useLightHeroOverlay = isHomepage && !scrolled && !isDraftPreview;

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock background scroll and manage focus when modal mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => mobileCloseBtnRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!currencyDropdownOpen && !mobileMenuOpen && !searchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrencyDropdownOpen(false);
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(target)) {
        setCurrencyDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [currencyDropdownOpen, mobileMenuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchOpen]);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const updateHeight = () => {
      document.documentElement.style.setProperty(
        '--header-height',
        `${header.getBoundingClientRect().height}px`
      );
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-height');
    };
  }, []);

  const navItems: NavItem[] = [
    { id: 'guide', section: 'travel-guide', label: editorial("common/Header.text5"), active: isGuideActive },
    { id: 'experiences', section: 'travel-experiences', label: editorial("common/Header.text6"), active: isExperiencesActive },
    { id: 'accommodation', section: 'accommodation', label: editorial("common/Header.text7"), active: isAccommodationActive },
    { id: 'packages', section: 'travel-packages', label: editorial("common/Header.text8"), active: isPackagesActive },
    { id: 'gallery', section: 'client-gallery', label: editorial("common/Header.text9"), active: isGalleryActive },
    { id: 'about', section: 'about', label: editorial("common/Header.text10"), active: isAboutActive },
    { id: 'blog', section: 'blog', label: 'Blog', active: isBlogActive },
    { id: 'contact', section: 'contact-us', label: editorial("common/Header.text11").trim(), active: isContactActive },
  ];

  const isDefaultLogo = !outboundLogo || /outbound-holidays-logo/i.test(String(outboundLogo));
  const logoSrc = isDefaultLogo
    ? resolveAssetUrl(
        useLightHeroOverlay
          ? '/logo/outbound-holidays-logo-light.webp'
          : '/logo/outbound-holidays-logo-dark.webp'
      )
    : String(outboundLogo);

  const positionClass = isHomepage && !isDraftPreview ? 'fixed top-0 left-0 right-0' : 'sticky top-0';

  return (
    <>
      <header
        ref={headerRef}
        className={`${positionClass} z-50 transition-[background-color,box-shadow,border-color] duration-300 motion-reduce:transition-none ${
          useLightHeroOverlay
            ? 'bg-transparent border-b border-transparent pointer-events-none'
            : 'outbound-header-frosted bg-white/90 backdrop-blur-md border-b border-[#0D2833]/10 shadow-[0_4px_24px_rgba(13,40,51,0.08)]'
        }`}
      >
        <div
          className={`relative w-full max-w-[1680px] mx-auto site-header-inner flex items-center justify-between transition-[padding] duration-300 motion-reduce:transition-none ${
            useLightHeroOverlay ? 'pt-3.5 pb-2.5 sm:pt-4 sm:pb-3 xl:pt-5 xl:pb-3.5' : 'py-2 sm:py-2.5'
          }`}
        >
          {/* Independent Top-Left Brand Logo */}
          <PageLink
            href="/"
            onClick={() => {
              onNavigateSection('hero');
              setMobileMenuOpen(false);
            }}
            aria-label="Outbound Holidays - Home"
            className={`pointer-events-auto relative inline-flex items-center shrink-0 origin-left transition-transform duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5E8E] rounded-lg ${
              useLightHeroOverlay ? 'header-logo-hero' : ''
            } ${scrolled ? 'scale-[0.88]' : 'scale-100'}`}
          >
            <img
              src={logoSrc}
              width={1170}
              height={352}
              alt={editorial("common/Header.text4")}
              className="relative z-10 site-logo-img opacity-100"
              onError={() => {
                console.error('Header logo failed to load from:', logoSrc);
              }}
            />
          </PageLink>

          {/* Desktop Floating Glassmorphism Navigation Capsule (>= 1280px) */}
          <div
            className={`pointer-events-auto hidden xl:flex items-center gap-0.5 2xl:gap-1 min-h-[54px] 2xl:min-h-[58px] rounded-full px-2 2xl:px-2.5 py-1.5 border transition-[background-color,box-shadow,border-color] duration-300 motion-reduce:transition-none outbound-glass-pill ${
              useLightHeroOverlay
                ? 'bg-[#0D2833]/58 backdrop-blur-[14px] border-white/22 shadow-[0_10px_36px_rgba(13,40,51,0.32)]'
                : 'bg-[#0D2833]/90 backdrop-blur-[14px] border-white/15 shadow-[0_10px_30px_rgba(13,40,51,0.22)]'
            }`}
          >
            <nav aria-label="Primary Navigation" className="flex items-center gap-0.5">
              {navItems.map((item) => (
                <PageLink
                  key={item.id}
                  href={sectionPath(item.section)}
                  onClick={() => onNavigateSection(item.section)}
                  aria-current={item.active ? 'page' : undefined}
                  className={`relative px-2 2xl:px-2.5 py-2 rounded-full text-[12.5px] 2xl:text-[13.5px] font-medium whitespace-nowrap transition-all duration-200 motion-reduce:transition-none flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                    item.active
                      ? 'bg-white/18 text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]'
                      : 'text-white/92 hover:text-white hover:bg-white/12'
                  }`}
                >
                  {item.active && (
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 rounded-full bg-[#3F6B3C] ring-2 ring-white/80 shrink-0"
                    />
                  )}
                  <span>{item.label}</span>
                </PageLink>
              ))}
            </nav>

            <span aria-hidden="true" className="h-5 w-px bg-white/20 mx-0.5 shrink-0" />

            {/* Compact Search Popover Trigger */}
            <div className="relative" ref={searchContainerRef}>
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label="Search holiday packages"
                aria-expanded={searchOpen}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/12 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              <div
                className={`absolute right-0 mt-2.5 w-64 bg-white text-[#0D2833] rounded-2xl shadow-2xl border border-[#0D2833]/10 p-2.5 z-50 origin-top-right transition-all duration-200 motion-reduce:transition-none ${
                  searchOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }`}
              >
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={editorial("common/Header.text12")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2 pl-8 pr-3 text-xs text-[#0D2833] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Currency Selector Dropdown */}
            <div className="relative" ref={currencyMenuRef}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={currencyDropdownOpen}
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 font-semibold text-white/95 hover:text-white bg-white/10 hover:bg-white/18 px-2.5 py-1.5 rounded-full transition-colors duration-200 text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <span>{currency}</span>
                <span className="text-white/70">{CURRENCY_RATES[currency].symbol}</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#C9A66B] transition-transform duration-200 motion-reduce:transition-none ${
                    currencyDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                role="listbox"
                aria-label="Select currency"
                className={`absolute right-0 mt-2.5 w-32 bg-white text-[#0D2833] rounded-2xl shadow-2xl border border-[#0D2833]/10 py-1.5 z-50 origin-top-right transition-all duration-200 motion-reduce:transition-none ${
                  currencyDropdownOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }`}
              >
                {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    role="option"
                    aria-selected={currency === curr}
                    onClick={() => {
                      setCurrency(curr);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold hover:bg-gray-100 flex justify-between cursor-pointer transition-colors ${
                      currency === curr ? 'text-[#0B5E8E] font-bold bg-[#0B5E8E]/10' : ''
                    }`}
                  >
                    <span>{curr}</span>
                    <span className="text-gray-400">{CURRENCY_RATES[curr].symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Planning CTA */}
            <button
              type="button"
              onClick={onOpenPlanHoliday}
              className="min-h-[42px] 2xl:min-h-[44px] bg-[#E67E22] hover:bg-[#d36e17] active:bg-[#c25f10] text-white font-bold text-[12.5px] 2xl:text-[13.5px] px-3.5 2xl:px-4.5 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 motion-reduce:transition-none whitespace-nowrap flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span>{editorial("common/Header.text13")}</span>
            </button>
          </div>

          {/* Mobile / Tablet Minimal Floating Glass Hamburger Trigger (< 1280px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`pointer-events-auto xl:hidden w-[46px] h-[46px] shrink-0 rounded-full flex items-center justify-center text-white border transition-[background-color,box-shadow,border-color] duration-300 motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white outbound-glass-pill ${
              useLightHeroOverlay
                ? 'bg-[#0D2833]/62 backdrop-blur-[14px] border-white/22 shadow-[0_8px_24px_rgba(13,40,51,0.3)] hover:bg-[#0D2833]/80'
                : 'bg-[#0D2833]/90 backdrop-blur-[14px] border-white/15 shadow-[0_8px_24px_rgba(13,40,51,0.22)] hover:bg-[#0D2833]'
            }`}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Full-Screen Modal Mobile / Tablet Navigation Panel */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
          className="xl:hidden fixed inset-0 z-50 bg-[#0D2833]/65 backdrop-blur-md flex flex-col justify-start p-3 sm:p-6 overflow-y-auto outbound-step-enter"
        >
          <div className="w-full max-w-lg mx-auto rounded-3xl bg-[#0D2833]/95 backdrop-blur-xl border border-white/15 text-white shadow-2xl p-5 sm:p-6 space-y-5">
            {/* Drawer Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/15">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                Outbound Holidays Menu
              </span>
              <button
                ref={mobileCloseBtnRef}
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-[44px] h-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={editorial("common/Header.text14")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/70"
              />
              <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-3.5" />
            </div>

            {/* Navigation Links */}
            <nav aria-label="Mobile Navigation" className="grid grid-cols-1 gap-1.5 font-medium text-[15px]">
              {navItems.map((item) => (
                <PageLink
                  key={item.id}
                  href={sectionPath(item.section)}
                  onClick={() => {
                    onNavigateSection(item.section);
                    setMobileMenuOpen(false);
                  }}
                  aria-current={item.active ? 'page' : undefined}
                  className={`min-h-[46px] px-4 py-2.5 rounded-2xl flex items-center justify-between transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                    item.active
                      ? 'bg-white/16 text-white font-bold border-l-4 border-[#3F6B3C]'
                      : 'text-white/92 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.active && <span className="w-2 h-2 rounded-full bg-[#3F6B3C] ring-2 ring-white/80" />}
                    <span>{item.label}</span>
                  </span>
                  {item.active && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C9A66B]">
                      Current
                    </span>
                  )}
                </PageLink>
              ))}
            </nav>

            {/* Prominent Plan My Holiday CTA */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPlanHoliday();
              }}
              className="w-full min-h-[48px] bg-[#E67E22] hover:bg-[#d36e17] active:bg-[#c25f10] text-white font-bold text-sm px-5 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span>{editorial("common/Header.text13")}</span>
            </button>

            {/* Currency & Concierge Footer inside Mobile Drawer */}
            <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Currency selector">
                {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`min-h-[38px] px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      currency === curr
                        ? 'bg-[#0B5E8E] text-white ring-1 ring-white/40'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {curr} ({CURRENCY_RATES[curr].symbol})
                  </button>
                ))}
              </div>

              <a
                href={getWhatsAppUrl("Hello Outbound Holidays, I'd like to enquire about Victoria Falls travel.")}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-[#C9A66B] transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-[#C9A66B]" />
                <span>{WHATSAPP_DISPLAY_NUMBER}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
