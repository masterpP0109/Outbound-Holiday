import { editorialFormat } from "../../runtime/catalog";
import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { getWhatsAppUrl } from '../../utils/whatsapp';
import { PageLink } from '../common/PageLink';
import { experiencePath,sectionPath } from '../../routes';
import React,{ useEffect,useState } from 'react';
import { ALL_EXPERIENCES,Experience } from '../../data/experiencesData';
import {
Sparkles,
Clock,
ArrowRight,Sun,
Binoculars,
Zap,
Waves,
Utensils,
Map,
CalendarCheck,
CheckCircle2,
ChevronDown,
ChevronUp,
MessageCircle,HelpCircle,Heart
} from 'lucide-react';

// Public image paths for experiences








export interface ExperienceCategoryPageProps {
  categoryId: string;
  onSelectExperience: (experience: Experience) => void;
  onSelectCategory: (catId: string) => void;
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
  onBackToLanding: () => void;
}

interface CategoryDetail {
  id: string;
  title: string;
  metaTitle: string;
  heroCopy: string;
  editorialIntro: string;
  image: string;
  icon: React.ElementType;
  highlights: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

let CATEGORY_DETAILS: Record<string, CategoryDetail>;
registerContent(() => { CATEGORY_DETAILS = editorialValue("travel/ExperienceCategoryPage.CATEGORY_DETAILS", {Sun,Binoculars,Zap,Waves,Utensils,Map,Heart}); });

export const ExperienceCategoryPage: React.FC<ExperienceCategoryPageProps> = ({
  categoryId,
  onSelectExperience,
  onSelectCategory,
  onOpenPlanHoliday,
  onNavigateHome,
  onBackToLanding
}) => {
  const detail = CATEGORY_DETAILS[categoryId] || CATEGORY_DETAILS['first-visit'];
  const CategoryIcon = detail.icon;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Filter central experience data source dynamically
  const categoryExperiences = ALL_EXPERIENCES.filter(exp => exp.categories.some(category => category === categoryId));

  // Determine 3 related categories for navigation
  const allCategoryKeys = Object.keys(CATEGORY_DETAILS);
  const relatedCategoryKeys = allCategoryKeys.filter(k => k !== categoryId).slice(0, 3);

  useEffect(() => {

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [categoryId]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1A2E35]">
      
      {/* 1. CATEGORY HERO */}
      <section className="relative bg-[#0D2833] text-white py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#C9A66B]/30">
        <div className="absolute inset-0 z-0">
          <img 
            src={detail.image} 
            alt={detail.title} 
            className="w-full h-full object-cover object-center scale-105 filter brightness-90 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D2833]/95 via-[#0D2833]/85 to-[#0D2833]/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-transparent to-[#0D2833]/70" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center">
          
          {/* Breadcrumb Navigation */}
          <nav className="inline-flex items-center gap-2 text-xs text-white/80 font-medium bg-[#0D2833]/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            <PageLink href={'/'} onClick={onNavigateHome} className="hover:text-white transition-colors cursor-pointer">
              {editorial("travel/ExperienceCategoryPage.text1")}</PageLink>
            <span>/</span>
            <PageLink href={sectionPath('experiences')} onClick={onBackToLanding} className="hover:text-white transition-colors cursor-pointer">
              {editorial("travel/ExperienceCategoryPage.text2")}</PageLink>
            <span>/</span>
            <span className="text-[#C9A66B] font-semibold">{detail.title}</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D2833]/80 backdrop-blur-md border border-[#C9A66B]/60 text-[#E5C989] text-xs font-bold uppercase tracking-widest shadow-lg mx-auto">
            <CategoryIcon className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/ExperienceCategoryPage.text3")}{categoryExperiences.length} {editorial("travel/ExperienceCategoryPage.text4")}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
            {detail.title} {editorial("travel/ExperienceCategoryPage.text5")}</h1>

          <p className="text-base sm:text-lg text-gray-100 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-xs">
            {detail.heroCopy}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('category-experiences-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#C9A66B]/40"
            >
              <span>{editorial("travel/ExperienceCategoryPage.text6")}{detail.title}</span>
              <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
            </button>

            <button
              onClick={onOpenPlanHoliday}
              className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{editorial("travel/ExperienceCategoryPage.text7")}</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. EDITORIAL INTRODUCTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#C9A66B]" />
            <span>{editorial("travel/ExperienceCategoryPage.text8")}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
            {editorial("travel/ExperienceCategoryPage.text9")}{detail.title}?
          </h2>

          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-light max-w-2xl mx-auto">
            {detail.editorialIntro}
          </p>
        </div>
      </section>

      {/* 3. CATEGORY HIGHLIGHTS (4 Icon Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {detail.highlights.map((item, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-2 text-left hover:border-[#C9A66B]/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E]">
                <CheckCircle2 className="w-5 h-5 text-[#C9A66B]" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#0B5E8E]">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EXPERIENCE GRID */}
      <section id="category-experiences-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200/60 scroll-mt-28 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
              {editorial("travel/ExperienceCategoryPage.text10")}</div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0B5E8E]">
              {detail.title} {editorial("travel/ExperienceCategoryPage.text11")}</h2>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-xl border border-gray-200/60">
            {editorial("travel/ExperienceCategoryPage.text12")}{categoryExperiences.length} {editorial("travel/ExperienceCategoryPage.text13")}</span>
        </div>

        {categoryExperiences.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
            <HelpCircle className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-gray-600 text-sm">{editorial("travel/ExperienceCategoryPage.text14")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {categoryExperiences.map((exp) => (
              <div
                key={exp.id}
                onClick={() => onSelectExperience(exp)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1 h-full"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    <img
                      src={exp.featuredImage}
                      alt={exp.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {exp.badge && (
                      <div className="absolute top-3 left-3 bg-[#C9A66B] text-[#0D2833] px-2.5 py-1 rounded-md text-[10px] font-bold shadow-md">
                        {exp.badge}
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-[#0D2833]/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold border border-white/20 shadow-xs">
                      {exp.fromPrice}
                    </div>

                    <div className="absolute bottom-3 left-3 bg-white/95 text-[#0B5E8E] backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3 text-[#C9A66B]" />
                      <span>{exp.duration}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-serif font-bold text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 font-light">
                      {exp.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <PageLink href={experiencePath(exp)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExperience(exp);
                    }}
                    className="w-full bg-[#FAF9F6] group-hover:bg-[#0B5E8E] text-[#0B5E8E] group-hover:text-white border border-gray-200 group-hover:border-[#0B5E8E] text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>{editorial("travel/ExperienceCategoryPage.text15")}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                  </PageLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. RELATED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200/60 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            {editorial("travel/ExperienceCategoryPage.text16")}</div>
          <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
            {editorial("travel/ExperienceCategoryPage.text17")}{detail.title} {editorial("travel/ExperienceCategoryPage.text18")}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedCategoryKeys.map((relKey) => {
            const relCat = CATEGORY_DETAILS[relKey];
            const RelIcon = relCat.icon;
            const count = ALL_EXPERIENCES.filter(e => e.categories.some(category => category === relKey)).length;

            return (
              <div
                key={relKey}
                onClick={() => onSelectCategory(relKey)}
                className="group relative h-56 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 flex flex-col justify-end p-5"
              >
                <img 
                  src={relCat.image} 
                  alt={relCat.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/60 to-transparent" />
                <div className="relative z-10 space-y-1 text-white">
                  <div className="flex items-center gap-1.5 text-[#E5C989] text-[11px] font-bold">
                    <RelIcon className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{count} {editorial("travel/ExperienceCategoryPage.text19")}</span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#E5C989] transition-colors">
                    {relCat.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[#C9A66B] font-bold pt-1">
                    <span>{editorial("travel/ExperienceCategoryPage.text20")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CATEGORY FAQ */}
      {detail.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200/60 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
              {editorial("travel/ExperienceCategoryPage.text21")}{detail.title}
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-xs">
            {detail.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx}>
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    <span className="font-serif font-bold text-sm text-[#0B5E8E]">
                      {faq.q}
                    </span>
                    <div className={`p-1 rounded-full ${isOpen ? 'bg-[#0B5E8E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 font-light leading-relaxed border-t border-gray-50 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-[#0D2833] via-[#0B5E8E] to-[#0D2833] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-[#C9A66B]/40">
          
          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#E5C989]">
              <Sparkles className="w-4 h-4 text-[#C9A66B]" />
              <span>{editorial("travel/ExperienceCategoryPage.text22")}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-white">
              {editorial("travel/ExperienceCategoryPage.text23")}</h3>
            <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
              {editorial("travel/ExperienceCategoryPage.text24")}{detail.title.toLowerCase()}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenPlanHoliday}
              className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{editorial("travel/ExperienceCategoryPage.text25")}</span>
            </button>

            <a
              href={getWhatsAppUrl(
                editorialFormat("travel/ExperienceCategoryPage.copy1", [detail.title])
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{editorial("travel/ExperienceCategoryPage.text26")}</span>
            </a>
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C9A66B_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
      </section>

    </div>
  );
};
