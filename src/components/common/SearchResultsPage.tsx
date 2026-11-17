import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  Compass,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type { PromotionOffer } from '../../types/promotion';
import { getWpConfig } from '../../runtime/api';
import { searchPath } from '../../routes';
import {
  executeGlobalSearch,
  GOOGLE_CSE_ID,
  SEARCH_FILTER_TABS,
  splitHighlightSegments,
  type GlobalSearchResponse,
  type GlobalSearchResult,
  type GlobalSearchType,
} from '../../utils/globalSearch';

interface SearchResultsPageProps {
  initialQuery: string;
  initialType?: GlobalSearchType;
  promotions: PromotionOffer[];
  onNavigate: (path: string) => void;
}

const POPULAR_TOPICS = [
  'Victoria Falls',
  'Sunset Cruise',
  'Family accommodation',
  'Lodge',
  'Swimming pool',
  'Chobe',
  'Romantic getaway',
  'Helicopter',
  'Three-bedroom apartment',
];

function HighlightedText({ text, query }: { text: string; query: string }) {
  const segs = splitHighlightSegments(text, query);
  return (
    <>
      {segs.map((seg, i) =>
        seg.match ? (
          <mark
            key={i}
            className="bg-[#C9A66B]/30 text-[#0B5E8E] font-semibold px-0.5 rounded-xs"
          >
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        )
      )}
    </>
  );
}

declare global {
  interface Window {
    google?: {
      search?: {
        cse?: {
          element?: {
            render: (opts: Record<string, unknown>) => void;
            getElement: (gname: string) => { execute: (q: string) => void } | undefined;
          };
        };
      };
    };
    __gcse?: Record<string, unknown>;
  }
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  initialQuery,
  initialType = 'all',
  promotions,
  onNavigate,
}) => {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<GlobalSearchType>(initialType);
  const [sourceTab, setSourceTab] = useState<'cms' | 'google'>('cms');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<GlobalSearchResponse | null>(null);
  const [accumulatedResults, setAccumulatedResults] = useState<GlobalSearchResult[]>([]);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);

  const cseId = getWpConfig()?.googleCseId || GOOGLE_CSE_ID;

  useEffect(() => {
    setInputValue(initialQuery);
    setActiveQuery(initialQuery);
    setActiveType(initialType);
    setPage(1);
  }, [initialQuery, initialType]);

  const runSearch = useCallback(
    async (q: string, type: GlobalSearchType, targetPage: number, append: boolean) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setData(null);
        setAccumulatedResults([]);
        setLoading(false);
        setErrorMsg(null);
        return;
      }

      setLoading(true);
      setErrorMsg(null);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);

      try {
        const res = await executeGlobalSearch({
          q: trimmed,
          type,
          page: targetPage,
          perPage: 12,
          promotions,
          signal: controller.signal,
        });
        setData(res);
        setAccumulatedResults((prev) =>
          append ? [...prev, ...res.results] : res.results
        );
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setErrorMsg('Search encountered a temporary delay. Showing local results or retry below.');
        }
      } finally {
        window.clearTimeout(timeout);
        setLoading(false);
      }
    },
    [promotions]
  );

  useEffect(() => {
    void runSearch(activeQuery, activeType, page, page > 1);
  }, [activeQuery, activeType, page, runSearch]);

  // Load Google Programmable Search Engine (04ba449966f8744d2) cleanly when user opens Google view
  useEffect(() => {
    if (sourceTab !== 'google' || typeof document === 'undefined') return;

    const existing = document.getElementById('outbound-google-cse-script');
    if (existing) {
      setGoogleScriptReady(true);
      const el = window.google?.search?.cse?.element?.getElement('outbound-cse-results');
      if (el && activeQuery.trim()) {
        try {
          el.execute(activeQuery.trim());
        } catch {
          // Safe noop if element is still initializing
        }
      }
      return;
    }

    window.__gcse = {
      parsetags: 'explicit',
      callback: () => {
        setGoogleScriptReady(true);
        const host = document.getElementById('outbound-gcse-results-container');
        if (host && window.google?.search?.cse?.element) {
          host.innerHTML = '';
          window.google.search.cse.element.render({
            div: 'outbound-gcse-results-container',
            tag: 'searchresults-only',
            gname: 'outbound-cse-results',
            attributes: { as_sitesearch: 'outboundholiday.com' },
          });
          if (activeQuery.trim()) {
            window.google.search.cse.element.getElement('outbound-cse-results')?.execute(activeQuery.trim());
          }
        }
      },
    };

    const script = document.createElement('script');
    script.id = 'outbound-google-cse-script';
    script.async = true;
    script.src = `https://cse.google.com/cse.js?cx=${encodeURIComponent(cseId)}`;
    document.head.appendChild(script);
  }, [sourceTab, cseId, activeQuery]);

  // Keep Google CSE executed query synced when script is already ready
  useEffect(() => {
    if (sourceTab !== 'google' || !googleScriptReady || !activeQuery.trim()) return;
    const host = document.getElementById('outbound-gcse-results-container');
    if (host && host.childElementCount === 0 && window.google?.search?.cse?.element) {
      window.google.search.cse.element.render({
        div: 'outbound-gcse-results-container',
        tag: 'searchresults-only',
        gname: 'outbound-cse-results',
        attributes: { as_sitesearch: 'outboundholiday.com' },
      });
    }
    const el = window.google?.search?.cse?.element?.getElement('outbound-cse-results');
    if (el) {
      try {
        el.execute(activeQuery.trim());
      } catch {
        // Ignore if element unmounted during navigation
      }
    }
  }, [sourceTab, googleScriptReady, activeQuery]);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputValue.trim();
    setPage(1);
    setActiveQuery(cleaned);
    onNavigate(searchPath(cleaned, activeType));
  };

  const handleSelectType = (nextType: GlobalSearchType) => {
    setPage(1);
    setActiveType(nextType);
    onNavigate(searchPath(activeQuery, nextType));
  };

  const handlePickTopic = (topic: string) => {
    setInputValue(topic);
    setActiveQuery(topic);
    setActiveType('all');
    setPage(1);
    onNavigate(searchPath(topic, 'all'));
  };

  const typeCounts = data?.typeCounts || {
    all: 0,
    accommodation: 0,
    experiences: 0,
    packages: 0,
    blogs: 0,
    offers: 0,
    pages: 0,
  };

  const hasMore = Boolean(data && page < data.totalPages);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Header Search Banner */}
      <section className="bg-[#0B5E8E] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#08486e]">
        <div className="max-w-4xl mx-auto space-y-5 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
            <Sparkles className="w-4 h-4" />
            <span>Global Website Search</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {activeQuery ? `Results for "${activeQuery}"` : 'Search Outbound Holidays'}
          </h1>
          <p className="text-sm sm:text-base text-white/80 font-light max-w-2xl mx-auto">
            Search Victoria Falls hotels, lodges, individual room types, activities, holiday packages, planning guides, and special offers.
          </p>

          <form onSubmit={handleSubmitForm} className="relative max-w-2xl mx-auto pt-2">
            <div className="flex items-center bg-white rounded-2xl shadow-xl p-1.5 border border-white/20">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-gray-400 ml-3.5 shrink-0" />
                <input
                  type="search"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Try Victoria Falls, Family accommodation, Sunset Cruise, Chobe..."
                  aria-label="Global website search query"
                  className="w-full bg-transparent py-3 px-3 text-sm text-[#0D2833] placeholder:text-gray-400 focus:outline-none"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue('');
                      setActiveQuery('');
                      setData(null);
                      setAccumulatedResults([]);
                      onNavigate('/search');
                    }}
                    aria-label="Clear search query"
                    className="p-2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular Topic Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[11px] text-white/65 font-medium">Popular:</span>
            {POPULAR_TOPICS.slice(0, 6).map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handlePickTopic(topic)}
                className="text-xs bg-white/12 hover:bg-white/22 text-white/90 px-3 py-1 rounded-full transition-colors cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Results Workspace */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Source Switcher: Live WordPress CMS Search vs Google Programmable Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Search source">
            <button
              type="button"
              role="tab"
              aria-selected={sourceTab === 'cms'}
              onClick={() => setSourceTab('cms')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                sourceTab === 'cms'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-[#0B5E8E]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Website Catalog Results{data ? ` (${data.total})` : ''}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={sourceTab === 'google'}
              onClick={() => setSourceTab('google')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                sourceTab === 'google'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-[#0B5E8E]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Site Search (outboundholiday.com)</span>
            </button>
          </div>

          {activeQuery && data && sourceTab === 'cms' && (
            <span className="text-xs text-gray-500">
              Showing <strong>{accumulatedResults.length}</strong> of <strong>{data.total}</strong> published matches
            </span>
          )}
        </div>

        {sourceTab === 'cms' ? (
          <>
            {/* Content Type Filter Bar */}
            {activeQuery && (
              <div className="flex flex-wrap gap-2">
                {SEARCH_FILTER_TABS.map((tab) => {
                  const count = typeCounts[tab.id] ?? 0;
                  const active = activeType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleSelectType(tab.id)}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#E67E22] text-white shadow-xs'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-[#0B5E8E]'
                      }`}
                    >
                      {tab.label} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {errorMsg && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
                {errorMsg}
              </div>
            )}

            {loading && accumulatedResults.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
                <Loader2 className="w-7 h-7 animate-spin text-[#0B5E8E]" />
                <span className="text-sm font-medium">Searching Outbound Holidays...</span>
              </div>
            ) : !activeQuery ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center space-y-5">
                <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                  Start Exploring Everything on Outbound Holidays
                </h2>
                <p className="text-sm text-gray-600 max-w-xl mx-auto">
                  Enter any hotel, lodge, room name, activity, holiday destination, amenity, or planning question above.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {POPULAR_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handlePickTopic(topic)}
                      className="px-4 py-2 rounded-full bg-[#FAF9F6] border border-gray-200 hover:border-[#0B5E8E] text-xs font-semibold text-[#0B5E8E] cursor-pointer transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            ) : accumulatedResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center space-y-4">
                <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                  No catalog matches found for &ldquo;{activeQuery}&rdquo;
                  {activeType !== 'all' ? ` in ${SEARCH_FILTER_TABS.find((t) => t.id === activeType)?.label}` : ''}
                </h2>
                <p className="text-sm text-gray-600 max-w-lg mx-auto">
                  Try broader keywords, switch category filters back to All, or check our Google Programmable Search tab for indexed web pages.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {activeType !== 'all' && (
                    <button
                      type="button"
                      onClick={() => handleSelectType('all')}
                      className="px-5 py-2.5 rounded-xl bg-[#0B5E8E] text-white text-xs font-bold cursor-pointer"
                    >
                      View All Categories ({typeCounts.all})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSourceTab('google')}
                    className="px-5 py-2.5 rounded-xl border border-[#0B5E8E] text-[#0B5E8E] hover:bg-[#0B5E8E]/5 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Try Google Site Search</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {accumulatedResults.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => onNavigate(item.url)}
                      className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col sm:flex-row cursor-pointer group"
                    >
                      {item.image && (
                        <div className="sm:w-44 aspect-[16/10] sm:aspect-auto shrink-0 bg-gray-100 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            decoding="async"
                          />
                        </div>
                      )}

                      <div className="p-4 sm:p-5 flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0B5E8E]/10 text-[#0B5E8E]">
                              {item.typeLabel}
                            </span>
                            {item.priceLabel && (
                              <span className="text-xs font-serif font-bold text-[#E67E22]">
                                {item.priceLabel}
                              </span>
                            )}
                          </div>

                          <h2 className="font-serif text-lg font-bold text-[#0B5E8E] group-hover:text-[#E67E22] transition-colors leading-snug break-words">
                            <HighlightedText text={item.title} query={activeQuery} />
                          </h2>

                          {item.location && (
                            <p className="text-[11px] text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#C9A66B] shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </p>
                          )}

                          {item.description && (
                            <p className="text-xs text-gray-600 font-light line-clamp-2 leading-relaxed">
                              <HighlightedText text={item.description} query={activeQuery} />
                            </p>
                          )}

                          {item.highlights && item.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.highlights.map((h, hidx) => (
                                <span
                                  key={hidx}
                                  className="text-[10px] bg-[#FAF9F6] border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md"
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-1 flex items-center justify-between text-xs font-bold text-[#0B5E8E] group-hover:text-[#E67E22]">
                          <span>
                            {item.subtype === 'unit'
                              ? `View ${item.unitName || 'Unit'} at ${item.propertyName || 'Property'}`
                              : 'View Details'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-6 py-3 rounded-xl bg-white border border-[#0B5E8E] text-[#0B5E8E] hover:bg-[#0B5E8E] hover:text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Loading more...' : `Load More Results (${data ? data.total - accumulatedResults.length : 0} remaining)`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Google Programmable Search Engine Separate Results View */
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#0B5E8E]">
                  Google Site Search (`outboundholiday.com`)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Powered by Google Programmable Search Engine (<code>{cseId}</code>). Newly added CMS entries appear immediately in the Website Catalog tab while Google updates its crawl index periodically.
                </p>
              </div>
              <a
                href={`https://cse.google.com/cse?cx=${encodeURIComponent(cseId)}&q=${encodeURIComponent(activeQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5E8E] hover:text-[#E67E22] shrink-0"
              >
                <span>Open in Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div id="outbound-gcse-results-container" className="min-h-[200px]" />
          </div>
        )}
      </div>
    </div>
  );
};
