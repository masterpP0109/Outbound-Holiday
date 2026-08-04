import React, { useState, useEffect } from 'react';
import { ALL_GUIDE_ARTICLES, FIRST_TIME_VISITOR_ARTICLE } from '../../data/guideArticles';
import { GuideArticleTemplate } from './guide/GuideArticleTemplate';
import { Compass, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';

interface VicFallsGuidePageProps {
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
  selectedSlug?: string;
}

export const VicFallsGuidePage: React.FC<VicFallsGuidePageProps> = ({
  onOpenPlanHoliday,
  onNavigateHome,
  selectedSlug = 'first-time-visitor-guide',
}) => {
  const [activeSlug, setActiveSlug] = useState<string>(selectedSlug);

  // Sync state with prop if it changes
  useEffect(() => {
    if (selectedSlug && ALL_GUIDE_ARTICLES[selectedSlug]) {
      setActiveSlug(selectedSlug);
    }
  }, [selectedSlug]);

  // Handle URL Hash or Path sync if applicable
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/victoria-falls-guide/')) {
        const slug = path.split('/victoria-falls-guide/')[1];
        if (slug && ALL_GUIDE_ARTICLES[slug]) {
          setActiveSlug(slug);
        }
      }
    }
  }, []);

  const handleSelectArticle = (slug: string) => {
    if (ALL_GUIDE_ARTICLES[slug]) {
      setActiveSlug(slug);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Optionally update URL state without full page reload
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', `/victoria-falls-guide/${slug}`);
      }
    }
  };

  const currentArticle = ALL_GUIDE_ARTICLES[activeSlug] || FIRST_TIME_VISITOR_ARTICLE;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Top Guide Hub Selector Bar */}
      <div className="bg-[#0D2833] text-white border-b border-white/10 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button 
              onClick={onNavigateHome}
              className="hover:text-[#C9A66B] transition-colors flex items-center gap-1 font-semibold text-gray-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Outbound Holidays</span>
            </button>
            <span className="text-gray-500">|</span>
            <span className="text-[#C9A66B] font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Compass className="w-3.5 h-3.5" />
              <span>Victoria Falls Travel Guide Series</span>
            </span>
          </div>

          {/* Quick Switcher Dropdown / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <span className="text-gray-400 text-[11px] font-medium shrink-0">Switch Guide:</span>
            {Object.keys(ALL_GUIDE_ARTICLES).map((slug) => {
              const art = ALL_GUIDE_ARTICLES[slug];
              const isSelected = slug === activeSlug;
              return (
                <button
                  key={slug}
                  onClick={() => handleSelectArticle(slug)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C9A66B] text-[#0D2833] font-bold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-gray-200'
                  }`}
                >
                  {art.category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reusable Article Template */}
      <GuideArticleTemplate
        article={currentArticle}
        onOpenPlanHoliday={onOpenPlanHoliday}
        onSelectRelatedArticle={handleSelectArticle}
        onNavigateHome={onNavigateHome}
      />
    </div>
  );
};
