import { editorialFormat } from "../../runtime/catalog";
import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { getWhatsAppUrl } from '../../utils/whatsapp';
import { PageLink } from '../common/PageLink';
import { categoryPath,experiencePath } from '../../routes';
import React,{ useState,useEffect } from 'react';
import { ALL_EXPERIENCES,Experience } from '../../data/experiencesData';
import {
Sparkles,
Clock,
ArrowRight,
Compass,
Sun,
Binoculars,
Zap,
Waves,
Utensils,
Map,
CalendarCheck,
Search,
CheckCircle2,
ChevronDown,
ChevronUp,
MessageCircle,
ShieldCheck,
HelpCircle,
Award,
Users,
Star,
Heart,
Grid
} from 'lucide-react';

// Public image paths for experiences
let heroVictoriaFalls: any;
registerContent(() => { heroVictoriaFalls = editorialValue("travel/ExperiencesDirectoryPage.heroVictoriaFalls", {}); });








interface ExperiencesDirectoryPageProps {
  onSelectExperience: (experience: Experience) => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenPlanHoliday: () => void;
}

export const ExperiencesDirectoryPage: React.FC<ExperiencesDirectoryPageProps> = ({
  onSelectExperience,
  onSelectCategory,
  onOpenPlanHoliday,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [selectedDirectoryFilter, setSelectedDirectoryFilter] = useState<string>('all');

  useEffect(() => {

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -130;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // 7 Main Categories
  const categoryDefinitions = editorialValue("travel/ExperiencesDirectoryPage.section1", {Sun,Binoculars,Zap,Waves,Utensils,Map,Heart});

  // Directory filter logic for all 14 experiences
  const directoryExperiences = selectedDirectoryFilter === 'all' 
    ? ALL_EXPERIENCES 
    : ALL_EXPERIENCES.filter(exp => exp.categories.some(category => category === selectedDirectoryFilter));

  // Featured / Signature Experiences (4-6 Signature Activities)
  const featuredExperiences = ALL_EXPERIENCES.filter(exp => exp.categories.includes('featured')).slice(0, 6);

  // Filtered search list
  const searchResults = searchQuery.trim() === '' ? [] : ALL_EXPERIENCES.filter(exp => 
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    exp.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (exp.highlights && exp.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Experience FAQs
  const experienceFaqs = editorialValue("travel/ExperiencesDirectoryPage.section2", {});

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1A2E35]">
      
      {/* 1. PAGE HERO */}
      <section className="relative bg-[#0D2833] text-white py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#C9A66B]/30">
        <div className="absolute inset-0 z-0">
          <img
            src={heroVictoriaFalls}
            alt={editorial("travel/ExperiencesDirectoryPage.text31")}
            className="w-full h-full object-cover object-center scale-105 filter brightness-90 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D2833]/90 via-[#0D2833]/75 to-[#0D2833]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-transparent to-[#0D2833]/60" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 sm:space-y-8">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D2833]/80 backdrop-blur-md border border-[#C9A66B]/60 text-[#E5C989] text-xs font-bold uppercase tracking-widest shadow-lg">
            <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/ExperiencesDirectoryPage.text32")}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-md max-w-3xl mx-auto">
            {editorial("travel/ExperiencesDirectoryPage.text33")}</h1>

          {/* Paragraph */}
          <p className="text-base sm:text-lg text-gray-100 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-xs">
            {editorial("travel/ExperiencesDirectoryPage.text34")}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => scrollToSection('featured-experiences')}
              className="w-full sm:w-auto bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#C9A66B]/40"
            >
              <span>{editorial("travel/ExperiencesDirectoryPage.text35")}</span>
              <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
            </button>

            <button
              onClick={() => scrollToSection('browse-by-type')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-7 py-3.5 rounded-xl border border-white/25 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{editorial("travel/ExperiencesDirectoryPage.text36")}</span>
              <ChevronDown className="w-4 h-4 text-[#C9A66B]" />
            </button>
          </div>

          {/* Search Filter Bar */}
          <div className="max-w-2xl mx-auto relative pt-4">
            <div className="relative">
              <input
                type="text"
                placeholder={editorial("travel/ExperiencesDirectoryPage.text37")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/95 backdrop-blur-md text-gray-900 placeholder-gray-500 rounded-2xl py-3.5 pl-12 pr-4 text-xs sm:text-sm shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#C9A66B] border border-white/20"
              />
              <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-gray-200 font-medium">
            <div className="flex items-center gap-2 bg-[#0D2833]/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
              <span>{ALL_EXPERIENCES.length}{editorial("travel/ExperiencesDirectoryPage.text38")}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0D2833]/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#C9A66B]" />
              <span>{editorial("travel/ExperiencesDirectoryPage.text39")}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0D2833]/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
              <span>{editorial("travel/ExperiencesDirectoryPage.text40")}</span>
            </div>
          </div>

        </div>
      </section>

      {/* STICKY COMPACT CATEGORY NAVIGATION BAR */}
      <section className="sticky top-[73px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs py-3 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
          <button
            onClick={() => scrollToSection('featured-experiences')}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-[#0B5E8E] hover:text-white flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/ExperiencesDirectoryPage.text41")}{featuredExperiences.length})</span>
          </button>

          <button
            onClick={() => scrollToSection('all-experiences')}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-[#FAF9F6] text-[#0B5E8E] border border-[#0B5E8E]/20 hover:bg-[#0B5E8E] hover:text-white flex items-center gap-1.5"
          >
            <Grid className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/ExperiencesDirectoryPage.text42")}{ALL_EXPERIENCES.length})</span>
          </button>

          {categoryDefinitions.map((cat) => {
            const Icon = cat.icon;
            const count = ALL_EXPERIENCES.filter(e => e.categories.some(category => category === cat.id)).length;

            return (
              <PageLink href={categoryPath(cat.id)}
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-[#0B5E8E] hover:text-white group"
              >
                <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#C9A66B]" />
                <span>{cat.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 group-hover:bg-white/20 group-hover:text-white">
                  {count}
                </span>
              </PageLink>
            );
          })}
        </div>
      </section>

      {/* SEARCH RESULTS OVERRIDE IF USER HAS ENTERED SEARCH QUERY */}
      {searchQuery.trim() !== '' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
              {editorial("travel/ExperiencesDirectoryPage.text43")}{searchQuery}"
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#C9A66B] hover:underline cursor-pointer"
            >
              {editorial("travel/ExperiencesDirectoryPage.text44")}</button>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
              <HelpCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-gray-600 text-sm">{editorial("travel/ExperiencesDirectoryPage.text45")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map(exp => (
                <ExperienceCard key={exp.id} experience={exp} onSelect={() => onSelectExperience(exp)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MAIN INSPIRATIONAL LANDING PAGE JOURNEY */}
      {searchQuery.trim() === '' && (
        <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
          
          {/* 2. FEATURED EXPERIENCES SECTION (4-6 Signature Cards) */}
          <section id="featured-experiences" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-36">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#C9A66B]/40 text-[#0B5E8E] text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/ExperiencesDirectoryPage.text46")}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0B5E8E]">
                    {editorial("travel/ExperiencesDirectoryPage.text47")}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-2xl font-light leading-relaxed">
                    {editorial("travel/ExperiencesDirectoryPage.text48")}</p>
                </div>

                <span className="text-xs font-bold text-[#C9A66B] bg-[#FAF9F6] px-3.5 py-1.5 rounded-full border border-gray-200/60 shrink-0">
                  {featuredExperiences.length} {editorial("travel/ExperiencesDirectoryPage.text49")}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {featuredExperiences.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} onSelect={() => onSelectExperience(exp)} />
                ))}
              </div>
            </div>
          </section>

          {/* 3. BROWSE BY EXPERIENCE TYPE (6 Editorial Category Cards navigating to Category Pages) */}
          <section id="browse-by-type" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-36 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block">
                {editorial("travel/ExperiencesDirectoryPage.text50")}</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">
                {editorial("travel/ExperiencesDirectoryPage.text51")}</h2>
              <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
                {editorial("travel/ExperiencesDirectoryPage.text52")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryDefinitions.map((cat) => {
                const CategoryIcon = cat.icon;
                const count = ALL_EXPERIENCES.filter(e => e.categories.some(category => category === cat.id)).length;

                return (
                  <div
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className="group relative h-80 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 flex flex-col justify-end transform hover:-translate-y-1"
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/60 to-transparent" />

                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-[#0B5E8E] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {count} {editorial("travel/ExperiencesDirectoryPage.text53")}</div>

                    <div className="relative z-10 p-6 space-y-2 text-white">
                      <div className="flex items-center gap-2 text-[#E5C989]">
                        <CategoryIcon className="w-4 h-4 text-[#C9A66B]" />
                        <span className="text-xs font-bold uppercase tracking-wider">{cat.title}</span>
                      </div>

                      <h3 className="font-serif font-bold text-2xl text-white group-hover:text-[#E5C989] transition-colors leading-snug">
                        {cat.title}
                      </h3>

                      <p className="text-xs text-gray-200 font-light line-clamp-2 leading-relaxed">
                        {cat.desc}
                      </p>

                      <div className="pt-3">
                        <PageLink href={categoryPath(cat.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCategory(cat.id);
                          }}
                          className="w-full bg-[#0B5E8E] group-hover:bg-[#08486e] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border border-white/20"
                        >
                          <span>{editorial("travel/ExperiencesDirectoryPage.text54")}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                        </PageLink>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3.5 COMPLETE DIRECTORY: ALL 14 EXPERIENCES */}
          <section id="all-experiences" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-36 space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#C9A66B]/40 text-[#0B5E8E] text-[11px] font-bold uppercase tracking-wider">
                    <Grid className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/ExperiencesDirectoryPage.text55")}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0B5E8E]">
                    {editorial("travel/ExperiencesDirectoryPage.text56")}{ALL_EXPERIENCES.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-2xl font-light leading-relaxed">
                    {editorial("travel/ExperiencesDirectoryPage.text57")}</p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedDirectoryFilter('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDirectoryFilter === 'all'
                        ? 'bg-[#0B5E8E] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {editorial("travel/ExperiencesDirectoryPage.text58")}{ALL_EXPERIENCES.length})
                  </button>
                  {categoryDefinitions.map((cat) => {
                    const count = ALL_EXPERIENCES.filter(e => e.categories.some(category => category === cat.id)).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedDirectoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedDirectoryFilter === cat.id
                            ? 'bg-[#0B5E8E] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>{cat.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          selectedDirectoryFilter === cat.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid of Experiences */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {directoryExperiences.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} onSelect={() => onSelectExperience(exp)} />
                ))}
              </div>
            </div>
          </section>

          {/* 4. HOW WE CHOOSE OUR EXPERIENCES */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-xs space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#C9A66B]/40 text-[#0B5E8E] text-[11px] font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>{editorial("travel/ExperiencesDirectoryPage.text59")}</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">
                  {editorial("travel/ExperiencesDirectoryPage.text60")}</h2>
                <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                  {editorial("travel/ExperiencesDirectoryPage.text61")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E] text-white flex items-center justify-center shadow-xs">
                    <Compass className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E]">{editorial("travel/ExperiencesDirectoryPage.text62")}</h3>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    {editorial("travel/ExperiencesDirectoryPage.text63")}</p>
                </div>

                <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E] text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E]">{editorial("travel/ExperiencesDirectoryPage.text64")}</h3>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    {editorial("travel/ExperiencesDirectoryPage.text65")}</p>
                </div>

                <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E] text-white flex items-center justify-center shadow-xs">
                    <Star className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E]">{editorial("travel/ExperiencesDirectoryPage.text66")}</h3>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    {editorial("travel/ExperiencesDirectoryPage.text67")}</p>
                </div>

                <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E] text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E]">{editorial("travel/ExperiencesDirectoryPage.text68")}</h3>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    {editorial("travel/ExperiencesDirectoryPage.text69")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. NEED HELP CHOOSING? */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0D2833] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-[#C9A66B]/30 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl text-center md:text-left z-10">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#E5C989]">
                  <Users className="w-4 h-4 text-[#C9A66B]" />
                  <span>{editorial("travel/ExperiencesDirectoryPage.text70")}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-white">
                  {editorial("travel/ExperiencesDirectoryPage.text71")}</h3>
                <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
                  {editorial("travel/ExperiencesDirectoryPage.text72")}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0 w-full sm:w-auto">
                <button
                  onClick={onOpenPlanHoliday}
                  className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{editorial("travel/ExperiencesDirectoryPage.text73")}</span>
                </button>

                <a
                  href={getWhatsAppUrl(
                    editorialFormat("travel/ExperiencesDirectoryPage.copy1")
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{editorial("travel/ExperiencesDirectoryPage.text74")}</span>
                </a>
              </div>
            </div>
          </section>

          {/* 6. FREQUENTLY ASKED QUESTIONS */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>{editorial("travel/ExperiencesDirectoryPage.text75")}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">
                {editorial("travel/ExperiencesDirectoryPage.text76")}</h2>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed max-w-xl mx-auto">
                {editorial("travel/ExperiencesDirectoryPage.text77")}</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
              {experienceFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="transition-colors">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                    >
                      <span className="font-serif font-bold text-sm sm:text-base text-[#0B5E8E]">
                        {faq.q}
                      </span>
                      <div className={`p-1.5 rounded-full ${isOpen ? 'bg-[#0B5E8E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-gray-600 font-light leading-relaxed border-t border-gray-50 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7. FINAL CTA */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-[#0D2833] via-[#0B5E8E] to-[#0D2833] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-[#C9A66B]/40">
              
              <div className="space-y-3 max-w-xl text-center md:text-left z-10">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#E5C989]">
                  <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                  <span>{editorial("travel/ExperiencesDirectoryPage.text78")}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-white">
                  {editorial("travel/ExperiencesDirectoryPage.text79")}</h3>
                <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
                  {editorial("travel/ExperiencesDirectoryPage.text80")}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0 w-full sm:w-auto">
                <button
                  onClick={onOpenPlanHoliday}
                  className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{editorial("travel/ExperiencesDirectoryPage.text81")}</span>
                </button>

                <a
                  href={getWhatsAppUrl(
                    editorialFormat("travel/ExperiencesDirectoryPage.copy2")
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{editorial("travel/ExperiencesDirectoryPage.text82")}</span>
                </a>
              </div>

              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C9A66B_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
          </section>

        </div>
      )}

    </div>
  );
};

/* Simplified Experience Card Subcomponent */
const ExperienceCard: React.FC<{ experience: Experience; onSelect: () => void }> = ({ experience, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1 h-full"
    >
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={experience.featuredImage}
            alt={experience.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

          {experience.badge && (
            <div className="absolute top-3 left-3 bg-[#C9A66B] text-[#0D2833] px-2.5 py-1 rounded-md text-[10px] font-bold shadow-md">
              {experience.badge}
            </div>
          )}

          <div className="absolute top-3 right-3 bg-[#0D2833]/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold border border-white/20 shadow-xs">
            {experience.fromPrice}
          </div>

          <div className="absolute bottom-3 left-3 bg-white/95 text-[#0B5E8E] backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-xs">
            <Clock className="w-3 h-3 text-[#C9A66B]" />
            <span>{experience.duration}</span>
          </div>
        </div>

        <div className="p-5 space-y-2">
          <h3 className="font-serif font-bold text-base sm:text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug">
            {experience.title}
          </h3>

          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 font-light">
            {experience.shortDescription}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0">
        <PageLink href={experiencePath(experience)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-full bg-[#FAF9F6] group-hover:bg-[#0B5E8E] text-[#0B5E8E] group-hover:text-white border border-gray-200 group-hover:border-[#0B5E8E] text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span>{editorial("travel/ExperiencesDirectoryPage.text83")}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
        </PageLink>
      </div>
    </div>
  );
};
