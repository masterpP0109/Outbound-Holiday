import React, { useState, useEffect } from 'react';
import { ALL_EXPERIENCES, Experience } from '../../data/experiencesData';
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

// Image Assets from src/assets/Experiences/<Folder>
import heroVictoriaFalls from '../../assets/Experiences/Flight of Angels/Heli-1-1-scaled.jpg';
import fallsTour1 from '../../assets/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
import cruise1 from '../../assets/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
import bomaImg1 from '../../assets/Experiences/Boma Dinner_/IMG_0364.JPG';
import bungee1 from '../../assets/Experiences/Bungee Jump_/Bungee-1-scaled.jpg';
import gameDrive10 from '../../assets/Experiences/Game Drive/Game-drive-10-1-scaled.jpg';
import chobe1 from '../../assets/Experiences/Chobe Day Trip_/Chobe-1-1-scaled.jpg';
import spaImg1 from '../../assets/Experiences/Spa Treatments/IMG_0375.PNG';

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
    document.title = "Victoria Falls Experience Library | Outbound Holidays";
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
  const categoryDefinitions = [
    {
      id: 'first-visit',
      title: 'First Visit Essentials',
      icon: Sun,
      image: fallsTour1,
      desc: 'The experiences we recommend before anything else on a first visit to Victoria Falls.'
    },
    {
      id: 'wildlife',
      title: 'Wildlife & Safari',
      icon: Binoculars,
      image: gameDrive10,
      desc: 'River safaris, game drives and unforgettable encounters with Southern Africa’s wildlife.'
    },
    {
      id: 'adventure',
      title: 'Adventure',
      icon: Zap,
      image: bungee1,
      desc: 'Bungee jumping, rafting, gorge activities and adrenaline-filled experiences.'
    },
    {
      id: 'river',
      title: 'River Experiences',
      icon: Waves,
      image: cruise1,
      desc: 'Sunset cruises, luxury river journeys and relaxed experiences on the Zambezi.'
    },
    {
      id: 'culture',
      title: 'Culture & Food',
      icon: Utensils,
      image: bomaImg1,
      desc: 'Local cuisine, traditional performances and experiences that connect travellers with Zimbabwean culture.'
    },
    {
      id: 'day-trips',
      title: 'Day Trips',
      icon: Map,
      image: chobe1,
      desc: 'Full-day adventures beyond Victoria Falls, including Chobe and other nearby destinations.'
    },
    {
      id: 'wellness',
      title: 'Spa & Wellness',
      icon: Heart,
      image: spaImg1,
      desc: 'Holistic botanical massages, plunge pools and rejuvenating safari wellness overlooking the bush.'
    }
  ];

  // Directory filter logic for all 14 experiences
  const directoryExperiences = selectedDirectoryFilter === 'all' 
    ? ALL_EXPERIENCES 
    : ALL_EXPERIENCES.filter(exp => exp.categories.includes(selectedDirectoryFilter as any));

  // Featured / Signature Experiences (4-6 Signature Activities)
  const featuredExperiences = ALL_EXPERIENCES.filter(exp => exp.categories.includes('featured')).slice(0, 6);

  // Filtered search list
  const searchResults = searchQuery.trim() === '' ? [] : ALL_EXPERIENCES.filter(exp => 
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    exp.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (exp.highlights && exp.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Experience FAQs
  const experienceFaqs = [
    {
      q: 'Which experiences should a first-time visitor prioritise?',
      a: 'For first-time visitors, we strongly recommend starting with a Guided Tour of Victoria Falls rainforest, an Upper Zambezi Sunset Cruise, and the iconic Boma Dinner Experience. If time allows, adding the Flight of Angels helicopter tour provides an extraordinary aerial perspective.'
    },
    {
      q: 'How far in advance should I book activities?',
      a: 'We recommend booking popular experiences—such as helicopter flights, sunset cruises, and Chobe day safaris—at least 2 to 4 weeks in advance during peak season (June to October) to guarantee preferred time slots.'
    },
    {
      q: 'Can experiences be combined into one itinerary?',
      a: 'Absolutely! Most activities can be seamlessly scheduled across 2 to 4 days. Our local specialists ensure ideal timing so you enjoy relaxed transitions between morning tours, afternoon safaris, and evening dining.'
    },
    {
      q: 'Are transfers included?',
      a: 'Yes, almost all guided experiences in Victoria Falls town include return hotel transfers from major lodges and hotels.'
    },
    {
      q: 'Are activities suitable for children?',
      a: 'Many activities—including rainforest tours, sunset cruises, cultural Boma dinners, and family safaris—are fantastic for all ages. Age restrictions apply only to extreme adrenaline adventures like bungee jumping or white-water rafting.'
    },
    {
      q: 'Do prices include park fees?',
      a: 'Activity costs cover guided services and transport, while government park entry fees ($50 international per person for rainforest entry) are paid directly at park gates unless specified in your custom package.'
    },
    {
      q: 'Can Outbound Holidays recommend experiences based on my budget?',
      a: 'Yes! Our local advisors design custom experience bundles tailored precisely to your budget, travel dates, and preferred pace.'
    },
    {
      q: 'What happens if weather affects an activity?',
      a: 'Your safety is our priority. If an activity like a helicopter flight is postponed due to weather, we will rebook it for another time during your stay or issue a full refund.'
    }
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1A2E35]">
      
      {/* 1. PAGE HERO */}
      <section className="relative bg-[#0D2833] text-white py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#C9A66B]/30">
        <div className="absolute inset-0 z-0">
          <img
            src={heroVictoriaFalls}
            alt="Victoria Falls aerial view showing the Zambezi River, gorge and mist"
            className="w-full h-full object-cover object-center scale-105 filter brightness-90 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D2833]/90 via-[#0D2833]/75 to-[#0D2833]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-transparent to-[#0D2833]/60" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 sm:space-y-8">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D2833]/80 backdrop-blur-md border border-[#C9A66B]/60 text-[#E5C989] text-xs font-bold uppercase tracking-widest shadow-lg">
            <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>Curated by Local Specialists</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-md max-w-3xl mx-auto">
            Victoria Falls Experience Library
          </h1>

          {/* Paragraph */}
          <p className="text-base sm:text-lg text-gray-100 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-xs">
            Explore our complete collection of Victoria Falls experiences, carefully selected by local specialists to help you find what suits your interests, time and travel style.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => scrollToSection('featured-experiences')}
              className="w-full sm:w-auto bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#C9A66B]/40"
            >
              <span>Explore Featured Experiences</span>
              <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
            </button>

            <button
              onClick={() => scrollToSection('browse-by-type')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-7 py-3.5 rounded-xl border border-white/25 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Browse by Experience Type</span>
              <ChevronDown className="w-4 h-4 text-[#C9A66B]" />
            </button>
          </div>

          {/* Search Filter Bar */}
          <div className="max-w-2xl mx-auto relative pt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search experiences — e.g. Chobe Safari, Sunset Cruise, Helicopter Flight..."
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
              <span>{ALL_EXPERIENCES.length}+ Handpicked Activities</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0D2833]/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#C9A66B]" />
              <span>100% Specialist Vetted</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0D2833]/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
              <span>Instant WhatsApp Advice</span>
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
            <span>Featured ({featuredExperiences.length})</span>
          </button>

          <button
            onClick={() => scrollToSection('all-experiences')}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-[#FAF9F6] text-[#0B5E8E] border border-[#0B5E8E]/20 hover:bg-[#0B5E8E] hover:text-white flex items-center gap-1.5"
          >
            <Grid className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>All ({ALL_EXPERIENCES.length})</span>
          </button>

          {categoryDefinitions.map((cat) => {
            const Icon = cat.icon;
            const count = ALL_EXPERIENCES.filter(e => e.categories.includes(cat.id as any)).length;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-[#0B5E8E] hover:text-white group"
              >
                <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#C9A66B]" />
                <span>{cat.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 group-hover:bg-white/20 group-hover:text-white">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SEARCH RESULTS OVERRIDE IF USER HAS ENTERED SEARCH QUERY */}
      {searchQuery.trim() !== '' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
              Search Results for "{searchQuery}"
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#C9A66B] hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
              <HelpCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-gray-600 text-sm">No experiences match your search phrase. Try searching for safari, cruise, helicopter, or tour.</p>
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
                    <span>Carefully Selected Experiences</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0B5E8E]">
                    Featured Experiences
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-2xl font-light leading-relaxed">
                    Handpicked signature activities every traveller should consider for their Victoria Falls itinerary.
                  </p>
                </div>

                <span className="text-xs font-bold text-[#C9A66B] bg-[#FAF9F6] px-3.5 py-1.5 rounded-full border border-gray-200/60 shrink-0">
                  {featuredExperiences.length} Signature Activities
                </span>
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
                EXPLORE BY CATEGORY
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">
                Browse by Experience Type
              </h2>
              <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
                Start with the kind of holiday experience you are looking for, then explore the activities our local specialists recommend within each category.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryDefinitions.map((cat) => {
                const CategoryIcon = cat.icon;
                const count = ALL_EXPERIENCES.filter(e => e.categories.includes(cat.id as any)).length;

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
                      {count} Experiences
                    </div>

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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCategory(cat.id);
                          }}
                          className="w-full bg-[#0B5E8E] group-hover:bg-[#08486e] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border border-white/20"
                        >
                          <span>Explore Category</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                        </button>
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
                    <span>Complete Victoria Falls Catalogue</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0B5E8E]">
                    All Victoria Falls Experiences ({ALL_EXPERIENCES.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-2xl font-light leading-relaxed">
                    Explore our complete collection of 14 verified activities, safaris, river adventures and cultural encounters with authentic photography and clear pricing.
                  </p>
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
                    All ({ALL_EXPERIENCES.length})
                  </button>
                  {categoryDefinitions.map((cat) => {
                    const count = ALL_EXPERIENCES.filter(e => e.categories.includes(cat.id as any)).length;
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
                  <span>OUR QUALITY STANDARD</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">
                  How We Choose Our Experiences
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                  Every experience featured on Outbound Holidays has been carefully selected based on guest experience, operator quality, safety standards, value for money and our local knowledge of Victoria Falls.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E] text-white flex items-center justify-center shadow-xs">
                    <Compass className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E]">Local Expertise</h3>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    Guided by born-and-raised local specialists with decades of experience in Victoria Falls.
                  </p>
                </div>

                <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E] text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E]">Trusted Operators</h3>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    We only partner with fully insured, top-tier safari and activity operators with proven safety records.
                  </p>
                </div>

                <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E] text-white flex items-center justify-center shadow-xs">
                    <Star className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E]">Excellent Guest Experience</h3>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    Regularly audited for high hospitality standards, comfort, and guest satisfaction.
                  </p>
                </div>

                <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E] text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-5 h-5 text-[#C9A66B]" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E]">Carefully Curated</h3>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    We avoid overcrowded commercial traps in favor of authentic, high-value African adventures.
                  </p>
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
                  <span>PERSONAL RECOMMENDATIONS</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-white">
                  Not Sure Which Experiences Are Right For You?
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
                  Whether you're travelling as a couple, family, photographer, honeymooner or adventure seeker, our local specialists can recommend the experiences that best suit your interests, budget and available time.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0 w-full sm:w-auto">
                <button
                  onClick={onOpenPlanHoliday}
                  className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Plan My Holiday</span>
                </button>

                <a
                  href={`https://wa.me/263714701721?text=${encodeURIComponent(
                    "Hello Outbound Holidays,\n\nI’m planning a Victoria Falls holiday and would like help choosing the experiences that best suit my interests, dates and budget.\n\nThank you."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </section>

          {/* 6. FREQUENTLY ASKED QUESTIONS */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">
                Questions About Victoria Falls Experiences
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed max-w-xl mx-auto">
                Everything you need to know about planning, booking, and enjoying your activities in Victoria Falls.
              </p>
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
                  <span>VICTORIA FALLS ADVISOR SERVICE</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-white">
                  Start Planning Your Victoria Falls Adventure
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
                  Victoria Falls offers something for every traveller. Tell us about your interests, travel dates, pace and budget, and our local specialists will recommend the experiences that best fit your holiday.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0 w-full sm:w-auto">
                <button
                  onClick={onOpenPlanHoliday}
                  className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Plan My Holiday</span>
                </button>

                <a
                  href={`https://wa.me/263714701721?text=${encodeURIComponent(
                    "Hello Outbound Holidays,\n\nI’m planning a Victoria Falls holiday and would like help choosing the experiences that best suit my interests, dates and budget.\n\nThank you."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-full bg-[#FAF9F6] group-hover:bg-[#0B5E8E] text-[#0B5E8E] group-hover:text-white border border-gray-200 group-hover:border-[#0B5E8E] text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span>View Experience</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
        </button>
      </div>
    </div>
  );
};
