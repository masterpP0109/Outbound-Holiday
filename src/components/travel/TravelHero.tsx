import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import { resolveAssetUrl } from '../../runtime/api';
import { editorialOptional } from '../../runtime/catalog';
import { searchPath } from '../../routes';
import type { PromotionOffer } from '../../types/promotion';
import { executeGlobalSearch, type GlobalSearchResult } from '../../utils/globalSearch';

interface TravelHeroProps {
  onOpenPlanHoliday: () => void;
  onBrowsePackages?: () => void;
  onNavigate?: (path: string) => void;
  promotions?: PromotionOffer[];
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onSubmitSearch?: (q: string) => void;
}

const FALLS_HERO_IMAGE = '/Experiences/Guided Tour of the Falls_/5-4.jpg';

const HERO_QUICK_TOPICS = ['Lodges', 'Hotels', 'Sunset Cruise', 'Helicopter', 'Family', 'Packages'];

export const TravelHero: React.FC<TravelHeroProps> = ({
  onOpenPlanHoliday,
  onBrowsePackages,
  onNavigate,
  promotions = [],
  searchQuery: controlledQuery,
  setSearchQuery: setControlledQuery,
  onSubmitSearch,
}) => {
  const [localQuery, setLocalQuery] = useState('');
  const query = controlledQuery !== undefined ? controlledQuery : localQuery;
  const setQuery = (next: string) => {
    setLocalQuery(next);
    if (setControlledQuery) setControlledQuery(next);
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<GlobalSearchResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const heroSearchRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < 2) {
      setSuggestions([]);
      setTotalMatches(0);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await executeGlobalSearch({
          q: trimmed,
          type: 'all',
          page: 1,
          perPage: 6,
          promotions,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setSuggestions(res.results);
          setTotalMatches(res.total);
          setLoading(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 160);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, promotions]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (heroSearchRef.current && !heroSearchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const navigateTo = (url: string) => {
    setDropdownOpen(false);
    if (onNavigate) {
      onNavigate(url);
      return;
    }
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const submitHeroSearch = (explicitQ?: string) => {
    const targetQ = (explicitQ ?? query).trim();
    setDropdownOpen(false);
    if (onSubmitSearch) {
      onSubmitSearch(targetQ);
      return;
    }
    navigateTo(searchPath(targetQ));
  };
  const eyebrow = editorialOptional('travel/TravelHero.eyebrow', '');
  const headlineLine1 = editorialOptional('travel/TravelHero.headlineLine1', 'Victoria Falls');
  const headlineLine2 = editorialOptional('travel/TravelHero.headlineLine2', 'Holidays');
  const subtitle = editorialOptional('travel/TravelHero.subtitle', 'Planned by locals, tailored to you.');
  const ctaLabel = editorialOptional('travel/TravelHero.ctaLabel', 'Plan Your Trip');
  const ctaDest = editorialOptional('travel/TravelHero.ctaDestination', 'modal');
  const heroImage = resolveAssetUrl(editorialOptional('travel/TravelHero.heroImage', FALLS_HERO_IMAGE));
  const heroAlt = editorialOptional(
    'travel/TravelHero.heroImageAlt',
    'Majestic panoramic view of Victoria Falls with mist rising from the Zambezi gorge'
  );

  const handleCtaClick = () => {
    if (ctaDest === 'packages' && onBrowsePackages) {
      onBrowsePackages();
      return;
    }
    if (ctaDest && ctaDest !== 'modal' && (ctaDest.startsWith('http') || ctaDest.startsWith('/'))) {
      window.location.href = ctaDest;
      return;
    }
    onOpenPlanHoliday();
  };

  return (
    <section className="w-full relative overflow-hidden bg-[#0B5E8E]">
      {/* Full-bleed Static Hero Container - justify-end pushes content down */}
      <div className="travel-hero relative w-full flex flex-col justify-end items-end text-white">
        {/* Single Static High-Resolution Victoria Falls Photograph */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            width={1920}
            height={1244}
            alt={heroAlt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-[center_62%] block"
          />
        </div>

        {/* Dark Gradient Overlay calibrated so the entire falls remain visible while maintaining text contrast */}
        <div
          className="absolute inset-0 z-0 bg-gradient-to-l from-black/75 via-black/45 to-black/10 sm:from-black/75 sm:via-black/40 sm:to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
          aria-hidden="true"
        />

        {/* Main Hero Content Area - Right Positioned, Pushed Down, and Enlarged on Smaller Screens */}
        <div className="travel-hero-content relative z-10 text-right flex flex-col items-end justify-end max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl w-full space-y-3 sm:space-y-4 lg:space-y-5">
          {eyebrow ? (
            <span className="inline-block rounded-full bg-white/15 backdrop-blur-xs border border-white/25 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#E5C989]">
              {eyebrow}
            </span>
          ) : null}

          {/* Main Headline (H1) - Increased Size on Smaller Screens & Right Aligned */}
          <h1 className="travel-hero-title outbound-hero-stagger-1 font-serif font-bold text-white tracking-tight drop-shadow-md text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] leading-[1.03] sm:leading-[1.06]">
            <span className="block">{headlineLine1}</span>
            {headlineLine2 ? <span className="block">{headlineLine2}</span> : null}
          </h1>

          {/* Supporting Tagline - Increased Size on Smaller Screens */}
          <p className="travel-hero-tagline outbound-hero-stagger-2 text-xl xs:text-2xl sm:text-2xl lg:text-3xl xl:text-4xl text-white/95 font-light tracking-wide drop-shadow-sm max-w-2xl leading-snug sm:leading-relaxed">
            {subtitle}
          </p>

          {/* Emphasized Homepage Global Search Bar */}
          <div ref={heroSearchRef} className="outbound-hero-stagger-3 w-full max-w-xl relative text-left">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                submitHeroSearch();
              }}
              className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-[0_14px_38px_rgba(13,40,51,0.38)] border-2 border-[#C9A66B]/85 focus-within:border-[#E67E22] transition-colors"
            >
              <Search className="w-5 h-5 text-[#0B5E8E] ml-3 mr-2 shrink-0" />
              <input
                type="text"
                value={query}
                onFocus={() => setDropdownOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                placeholder="Search stays, rooms, sunset cruise, packages, guides..."
                aria-label="Search Outbound Holidays on homepage"
                className="flex-1 min-w-0 bg-transparent text-[#0D2833] placeholder:text-slate-500 text-xs sm:text-sm font-medium py-2 sm:py-2.5 pr-2 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search query"
                  className="p-1.5 text-slate-400 hover:text-[#0D2833] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="bg-[#0B5E8E] hover:bg-[#094b72] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick topic pills */}
            <div className="flex flex-wrap items-center justify-end gap-1.5 mt-2">
              {HERO_QUICK_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setQuery(topic);
                    setDropdownOpen(true);
                  }}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/45 hover:bg-[#C9A66B] text-white hover:text-[#0D2833] border border-white/25 backdrop-blur-xs transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>

            {dropdownOpen && trimmed.length >= 2 && (
              <div
                role="listbox"
                aria-label="Homepage live search suggestions"
                className="absolute left-0 right-0 bottom-full mb-2 bg-white text-[#0D2833] rounded-2xl shadow-2xl border border-[#0D2833]/15 p-2.5 z-50 max-h-72 overflow-y-auto space-y-1"
              >
                {loading && suggestions.length === 0 ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0B5E8E]" />
                    <span>Searching Outbound Holidays...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.map((item) => (
                      <button
                        key={`hero-sr-${item.id}`}
                        type="button"
                        role="option"
                        onClick={() => navigateTo(item.url)}
                        className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#0B5E8E]/8 transition-colors cursor-pointer"
                      >
                        {item.image ? (
                          <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#0D2833]/5 flex items-center justify-center shrink-0">
                            <Search className="w-4 h-4 text-[#0D2833]/50" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5E8E] block">
                            {item.typeLabel}
                            {item.priceLabel ? ` · ${item.priceLabel}` : ''}
                          </span>
                          <span className="text-xs font-semibold text-[#0D2833] block truncate">{item.title}</span>
                          {(item.propertyName || item.location || item.description) && (
                            <span className="text-[11px] text-slate-500 block truncate">
                              {item.propertyName ? `${item.propertyName} — ` : ''}
                              {item.location || item.description}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => submitHeroSearch()}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#0D2833] hover:bg-[#0B5E8E] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>{totalMatches > 0 ? `View all ${totalMatches} results` : 'View all results'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => submitHeroSearch()}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-[#0B5E8E] cursor-pointer"
                  >
                    <span>Search full site &amp; travel guide for &ldquo;{trimmed}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Primary Call-to-Action - Matches Featured Experiences CTA */}
          <div className="outbound-hero-stagger-3 pt-2 sm:pt-3 w-auto flex justify-end">
            <button
              type="button"
              onClick={handleCtaClick}
              className="travel-hero-cta group inline-flex items-center justify-center gap-2 bg-[#E67E22] hover:bg-[#d36e17] active:bg-[#c56814] text-white font-bold text-xs sm:text-base px-5 py-2.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#E67E22]"
              aria-label="Plan Your Trip with Outbound Holidays"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transition-none" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
