import React from 'react';
import { FIRST_TIME_VISITOR_ARTICLE } from '../../data/guideArticles';
import { GuideArticleTemplate } from './guide/GuideArticleTemplate';
const outboundLogo = '/images/logo/outbound-holidays-logo.webp';
import { Compass, ArrowLeft } from 'lucide-react';

interface VicFallsGuidePageProps {
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
}

export const VicFallsGuidePage: React.FC<VicFallsGuidePageProps> = ({
  onOpenPlanHoliday,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Universal Top Guide Header Bar */}
      <div className="sticky top-[73px] z-40 bg-[#0D2833] text-white border-b border-[#C9A66B]/30 py-2.5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          
          {/* Left Action: Back to Home */}
          <button 
            onClick={onNavigateHome}
            className="hover:text-[#C9A66B] transition-colors flex items-center gap-1.5 font-semibold text-gray-300 cursor-pointer text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Outbound Holidays</span>
            <span className="sm:hidden">Home</span>
          </button>

          {/* Center/Right Brand Title */}
          <div className="flex items-center gap-2 text-[#C9A66B] font-bold text-[11px] uppercase tracking-wider">
            <img src={outboundLogo} alt="Outbound Holidays" className="w-6 h-6 object-contain" />
            <span>Victoria Falls Local Travel Specialist Guide</span>
          </div>
        </div>
      </div>

      {/* Render Master Long-Form Editorial Guide */}
      <GuideArticleTemplate
        article={FIRST_TIME_VISITOR_ARTICLE}
        onOpenPlanHoliday={onOpenPlanHoliday}
        onNavigateHome={onNavigateHome}
      />
    </div>
  );
};
