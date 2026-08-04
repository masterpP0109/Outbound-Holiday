import React, { useState, useEffect } from 'react';
import { ALL_GUIDE_ARTICLES, FIRST_TIME_VISITOR_ARTICLE } from '../../data/guideArticles';
import { GuideArticleTemplate } from './guide/GuideArticleTemplate';
import { GuideHubView } from './guide/GuideHubView';
import { 
  Compass, 
  ArrowLeft, 
  Grid, 
  ChevronRight, 
  ChevronDown,
  BookOpen
} from 'lucide-react';

interface VicFallsGuidePageProps {
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
  selectedSlug?: string;
}

export const VicFallsGuidePage: React.FC<VicFallsGuidePageProps> = ({
  onOpenPlanHoliday,
  onNavigateHome,
  selectedSlug,
}) => {
  // Active state: null/undefined or 'hub' means Hub view; slug string means Article view
  const [activeSlug, setActiveSlug] = useState<string | null>(selectedSlug || null);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  useEffect(() => {
    if (selectedSlug) {
      setActiveSlug(selectedSlug);
    }
  }, [selectedSlug]);

  const handleSelectArticle = (slug: string) => {
    setActiveSlug(slug);
    setQuickMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHub = () => {
    setActiveSlug(null);
    setQuickMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentArticle = activeSlug ? ALL_GUIDE_ARTICLES[activeSlug] || FIRST_TIME_VISITOR_ARTICLE : null;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Universal Top Guide Header Bar */}
      <div className="sticky top-[73px] z-40 bg-[#0D2833] text-white border-b border-[#C9A66B]/30 py-2.5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Left Actions: Back buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={onNavigateHome}
              className="hover:text-[#C9A66B] transition-colors flex items-center gap-1.5 font-semibold text-gray-300 cursor-pointer text-[11px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Outbound Holidays</span>
              <span className="sm:hidden">Home</span>
            </button>

            {activeSlug && (
              <>
                <span className="text-gray-600">/</span>
                <button 
                  onClick={handleBackToHub}
                  className="bg-[#C9A66B]/20 hover:bg-[#C9A66B]/30 text-[#E5C989] transition-colors flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg border border-[#C9A66B]/40 cursor-pointer text-[11px]"
                >
                  <Grid className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>Victoria Falls Guide Hub</span>
                </button>
              </>
            )}
          </div>

          {/* Center Brand Title */}
          <div className="hidden lg:flex items-center gap-2 text-[#C9A66B] font-bold text-[11px] uppercase tracking-wider">
            <Compass className="w-4 h-4 text-[#C9A66B]" />
            <span>Victoria Falls Local Specialist Knowledge Base</span>
          </div>

          {/* Right Quick Article Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span className="max-w-[150px] sm:max-w-[220px] truncate">
                {currentArticle ? currentArticle.title : 'Guide Library Directory'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {quickMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-[#1A2E35] rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C9A66B]">
                    Guide Articles Directory
                  </span>
                  <button 
                    onClick={handleBackToHub}
                    className="text-[11px] font-bold text-[#0B5E8E] hover:underline"
                  >
                    View Hub
                  </button>
                </div>

                <div className="py-1">
                  {Object.values(ALL_GUIDE_ARTICLES).map((art) => (
                    <button
                      key={art.slug}
                      onClick={() => handleSelectArticle(art.slug)}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#FAF9F6] flex items-center justify-between cursor-pointer border-l-2 transition-colors ${
                        activeSlug === art.slug
                          ? 'border-[#0B5E8E] text-[#0B5E8E] bg-[#0B5E8E]/5 font-bold'
                          : 'border-transparent text-gray-700'
                      }`}
                    >
                      <span className="truncate pr-2">{art.title}</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main View Render: Hub vs Standalone Article */}
      {!activeSlug || !currentArticle ? (
        <GuideHubView
          onSelectArticle={handleSelectArticle}
          onOpenPlanHoliday={onOpenPlanHoliday}
          onNavigateHome={onNavigateHome}
        />
      ) : (
        <GuideArticleTemplate
          article={currentArticle}
          onOpenPlanHoliday={onOpenPlanHoliday}
          onSelectRelatedArticle={handleSelectArticle}
          onNavigateHome={onNavigateHome}
        />
      )}
    </div>
  );
};
