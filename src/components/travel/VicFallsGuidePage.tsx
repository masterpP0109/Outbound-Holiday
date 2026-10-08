import type { GuideArticle } from '../../types/guide';
import { PageLink as GuideLink } from '../common/PageLink';
import { ALL_GUIDE_ARTICLES } from '../../runtime/catalog';
import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { PageLink } from '../common/PageLink';
import React from 'react';
import { FIRST_TIME_VISITOR_ARTICLE } from '../../data/guideArticles';
import { GuideArticleTemplate } from './guide/GuideArticleTemplate';
import { ArrowLeft } from 'lucide-react';
let outboundLogo: any;
registerContent(() => { outboundLogo = editorialValue("travel/VicFallsGuidePage.outboundLogo", {}); });

interface VicFallsGuidePageProps {
  article?: GuideArticle;
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
}

export const VicFallsGuidePage: React.FC<VicFallsGuidePageProps> = ({
  article = FIRST_TIME_VISITOR_ARTICLE,
  onOpenPlanHoliday,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Universal Top Guide Header Bar */}
      <div className="sticky top-[73px] z-40 bg-[#0D2833] text-white border-b border-[#C9A66B]/30 py-2.5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          
          {/* Left Action: Back to Home */}
          <PageLink href={'/'}
            onClick={onNavigateHome}
            className="hover:text-[#C9A66B] transition-colors flex items-center gap-1.5 font-semibold text-gray-300 cursor-pointer text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{editorial("travel/VicFallsGuidePage.text1")}</span>
            <span className="sm:hidden">{editorial("travel/VicFallsGuidePage.text2")}</span>
          </PageLink>

          {/* Center/Right Brand Title */}
          <div className="flex items-center gap-2 text-[#C9A66B] font-bold text-[11px] uppercase tracking-wider">
            <img src={outboundLogo} alt={editorial("travel/VicFallsGuidePage.text3")} className="w-6 h-6 object-contain" />
            <span>{editorial("travel/VicFallsGuidePage.text4")}</span>
          </div>
        </div>
      </div>

      <nav aria-label="Travel guide articles" className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-3">{Object.values(ALL_GUIDE_ARTICLES).map(g=><GuideLink key={g.id} className="text-sm text-[#0B5E8E] underline" href={g.slug==='first-time-visitor-guide'?'/victoria-falls-guide':'/victoria-falls-guide/'+g.slug}>{g.title}</GuideLink>)}</nav>
      {/* Render Master Long-Form Editorial Guide */}
      <GuideArticleTemplate
        article={article}
        onOpenPlanHoliday={onOpenPlanHoliday}
        onNavigateHome={onNavigateHome}
      />
    </div>
  );
};
