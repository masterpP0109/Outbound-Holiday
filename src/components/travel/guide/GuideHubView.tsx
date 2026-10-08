import { editorial, editorialValue, registerContent } from "../../../runtime/catalog";
import { PHONE_URL } from '../../../utils/whatsapp';
import React from 'react';
import { GUIDE_HUB_CATEGORIES } from '../../../data/guideArticles';
import {
Clock,
BookOpen,
ArrowRight,
Sparkles,
CalendarCheck,
PhoneCall,
CheckCircle2,
MapPin,
ShieldCheck,
Award
} from 'lucide-react';

let outboundLogo: any;
registerContent(() => { outboundLogo = editorialValue("travel/guide/GuideHubView.outboundLogo", {}); });
// Public image paths for experiences
// Experience photo; replace with a verified team portrait when available.
let elephantExperienceImg: any;
registerContent(() => { elephantExperienceImg = editorialValue("travel/guide/GuideHubView.elephantExperienceImg", {}); });

interface GuideHubViewProps {
  onSelectArticle: (slug: string) => void;
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
}

export const GuideHubView: React.FC<GuideHubViewProps> = ({
  onSelectArticle,
  onOpenPlanHoliday,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A2E35]">
      {/* 1. Hub Header Hero Section */}
      <section className="relative bg-[#0D2833] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#C9A66B]/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C9A66B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 space-y-6 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-xs font-bold uppercase tracking-widest border border-[#C9A66B]/40 shadow-xs">
            <img src={outboundLogo} alt={editorial("travel/guide/GuideHubView.text1")} className="w-6 h-6 object-contain" />
            <span>{editorial("travel/guide/GuideHubView.text2")}</span>
          </div>

          {/* Main Landing Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            {editorial("travel/guide/GuideHubView.text3")}</h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-200 font-medium max-w-3xl mx-auto leading-relaxed">
            {editorial("travel/guide/GuideHubView.text4")}</p>

          {/* Local Specialist Credentials Badge */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-300">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{editorial("travel/guide/GuideHubView.text5")}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{editorial("travel/guide/GuideHubView.text6")}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <Award className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{editorial("travel/guide/GuideHubView.text7")}</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Main Guide Library Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Loop through Categories */}
        {GUIDE_HUB_CATEGORIES.map((categoryGroup, idx) => (
          <section key={idx} className="space-y-6">
            {/* Category Header */}
            <div className="border-b border-gray-200/80 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C9A66B] block mb-1">
                  {editorial("travel/guide/GuideHubView.text8")}{idx + 1}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {categoryGroup.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  {categoryGroup.subtitle}
                </p>
              </div>
            </div>

            {/* Grid of Article Cards */}
            <div className={`grid grid-cols-1 ${
              categoryGroup.articles.length === 1 
                ? 'max-w-3xl' 
                : categoryGroup.articles.length === 2 
                ? 'md:grid-cols-2' 
                : 'md:grid-cols-2 lg:grid-cols-3'
            } gap-6`}>
              {categoryGroup.articles.map((article) => {
                const isFeatured = article.featured;
                return (
                  <div
                    key={article.slug}
                    onClick={() => onSelectArticle(article.slug)}
                    className={`group rounded-2xl overflow-hidden border bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between cursor-pointer ${
                      isFeatured 
                        ? 'border-[#C9A66B] ring-2 ring-[#C9A66B]/30 shadow-md' 
                        : 'border-gray-200/90 shadow-2xs'
                    }`}
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs ${
                            isFeatured
                              ? 'bg-[#C9A66B] text-[#0D2833]'
                              : 'bg-[#0D2833]/90 text-white backdrop-blur-xs'
                          }`}>
                            {article.category}
                          </span>
                        </div>

                        {/* Reading Time */}
                        <div className="absolute bottom-3 left-3 text-white text-[11px] font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#E5C989]" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 sm:p-6 space-y-3">
                        <h3 className="font-serif font-bold text-lg sm:text-xl text-[#0B5E8E] group-hover:text-[#E67E22] transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                          {article.summary}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer CTA */}
                    <div className="px-5 sm:px-6 pb-5 pt-0">
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#0B5E8E] group-hover:text-[#E67E22] transition-colors">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{editorial("travel/guide/GuideHubView.text9")}</span>
                        </span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* 3. Outbound Holidays Positioning Banner */}
        <section className="rounded-3xl bg-[#0D2833] text-white p-8 sm:p-12 border border-[#C9A66B]/40 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A66B] bg-[#C9A66B]/10 px-3 py-1 rounded-full border border-[#C9A66B]/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{editorial("travel/guide/GuideHubView.text10")}</span>
              </div>
              
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                {editorial("travel/guide/GuideHubView.text11")}</h2>
              
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {editorial("travel/guide/GuideHubView.text12")}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-gray-200 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A66B] shrink-0" />
                  <span>{editorial("travel/guide/GuideHubView.text13")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A66B] shrink-0" />
                  <span>{editorial("travel/guide/GuideHubView.text14")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A66B] shrink-0" />
                  <span>{editorial("travel/guide/GuideHubView.text15")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A66B] shrink-0" />
                  <span>{editorial("travel/guide/GuideHubView.text16")}</span>
                </div>
              </div>
            </div>

            {/* Author Profile Card & Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center space-y-4">
              <img 
                src={elephantExperienceImg}
                alt={editorial("travel/guide/GuideHubView.text17")}
                className="w-16 h-16 rounded-full mx-auto object-cover ring-4 ring-[#C9A66B]/40 shadow-md"
              />
              <div>
                <h3 className="font-serif font-bold text-base text-white">{editorial("travel/guide/GuideHubView.text18")}</h3>
                <span className="text-xs text-[#E5C989] font-medium block">{editorial("travel/guide/GuideHubView.text19")}</span>
              </div>
              <p className="text-xs text-gray-300 italic">
                {editorial("travel/guide/GuideHubView.text20")}</p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={onOpenPlanHoliday}
                  className="w-full bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{editorial("travel/guide/GuideHubView.text21")}</span>
                </button>
                <a
                  href={PHONE_URL}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 block cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>{editorial("travel/guide/GuideHubView.text22")}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
