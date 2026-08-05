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
  CheckCircle2
} from 'lucide-react';

import intentVicFallsIconicImg from '../../assets/images/intent_vic_falls_iconic_1785490034846.jpg';

interface ExperiencesDirectoryPageProps {
  onSelectExperience: (experience: Experience) => void;
  onOpenPlanHoliday: () => void;
}

export const ExperiencesDirectoryPage: React.FC<ExperiencesDirectoryPageProps> = ({
  onSelectExperience,
  onOpenPlanHoliday,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    document.title = "Victoria Falls Experiences Directory | Outbound Holidays";
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const categories = [
    { id: 'featured', label: 'Featured Experiences', icon: Sparkles, desc: 'Flagship handpicked activities recommended for every traveler.' },
    { id: 'first-visit', label: 'First Visit Essentials', icon: Sun, desc: 'Must-do cornerstone experiences for your first trip to Victoria Falls.' },
    { id: 'wildlife', label: 'Wildlife & Safari', icon: Binoculars, desc: 'Track Big Five game, rhinos, and elephants in wilderness reserves.' },
    { id: 'adventure', label: 'Adventure', icon: Zap, desc: 'Adrenaline aerial flights, gorge swings, rafting, and ziplines.' },
    { id: 'river', label: 'River Experiences', icon: Waves, desc: 'Luxury sunset cruises, breakfast voyages, tiger fishing, and canoeing.' },
    { id: 'culture', label: 'Culture & Food', icon: Utensils, desc: 'Traditional Boma feasts, village visits, and local craft markets.' },
    { id: 'day-trips', label: 'Day Trips', icon: Map, desc: 'Cross-border safari expeditions to Chobe, Hwange, and Livingstone.' },
  ];

  const filteredExperiences = ALL_EXPERIENCES.filter(exp => {
    const matchesCategory = activeCategory === 'all' || exp.categories.includes(activeCategory as any);
    const matchesSearch = searchQuery === '' || 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      exp.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1A2E35]">
      
      {/* Directory Hero Banner with Centered Single-Column Layout */}
      <section className="relative bg-[#0D2833] text-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#C9A66B]/30">
        {/* Atmospheric Background Image Layer with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={intentVicFallsIconicImg} 
            alt="Victoria Falls Mosi-oa-Tunya backdrop" 
            className="w-full h-full object-cover object-center scale-105 filter brightness-90 saturate-110"
          />
          {/* Subtle dark overlay gradient for high legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D2833]/90 via-[#0D2833]/80 to-[#0D2833]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-transparent to-[#0D2833]/70" />
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C9A66B_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D2833]/80 backdrop-blur-md border border-[#C9A66B]/60 text-[#E5C989] text-xs font-bold uppercase tracking-widest shadow-lg">
            <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>Complete Victoria Falls Directory</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-md max-w-3xl mx-auto">
            Victoria Falls Experience Library
          </h1>

          {/* Paragraph */}
          <p className="text-base sm:text-lg text-gray-100 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-xs">
            Curated by local Victoria Falls specialists. Browse by interest, duration, and safari style to build your ideal Zimbabwe itinerary.
          </p>

          {/* Search Filter Bar */}
          <div className="max-w-2xl mx-auto relative pt-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search experiences (e.g. Helicopter, Safari, Sunset Cruise)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/95 backdrop-blur-md text-gray-900 placeholder-gray-500 rounded-2xl py-4 pl-12 pr-4 text-sm shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#C9A66B] border border-white/20"
              />
              <Search className="w-5 h-5 text-gray-500 absolute left-4 top-4" />
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-gray-200 font-medium">
            <div className="flex items-center gap-2 bg-[#0D2833]/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#C9A66B]" />
              <span>25+ Handpicked Activities</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0D2833]/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#C9A66B]" />
              <span>100% Local Guide Vetted</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0D2833]/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
              <span>Instant WhatsApp Enquiry</span>
            </div>
          </div>

        </div>
      </section>

      {/* Category Navigation Bar */}
      <section className="sticky top-[73px] z-30 bg-white border-b border-gray-200 shadow-xs py-3 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-[#0B5E8E] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Experiences ({ALL_EXPERIENCES.length})
          </button>

          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = ALL_EXPERIENCES.filter(e => e.categories.includes(cat.id as any)).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0B5E8E] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C9A66B]' : 'text-gray-500'}`} />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Directory Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        
        {/* If Filtering All or Specific Category, Render Categorized Section Views */}
        {activeCategory === 'all' && searchQuery === '' ? (
          categories.map((cat) => {
            const items = ALL_EXPERIENCES.filter(e => e.categories.includes(cat.id as any));
            if (items.length === 0) return null;
            const CategoryIcon = cat.icon;

            return (
              <section key={cat.id} id={`category-${cat.id}`} className="space-y-6 pt-4 border-t border-gray-200/60 first:border-none first:pt-0">
                
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#0B5E8E]">
                      <CategoryIcon className="w-5 h-5 text-[#C9A66B]" />
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                        {cat.label}
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 max-w-2xl">
                      {cat.desc}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">
                    {items.length} {items.length === 1 ? 'Experience' : 'Experiences'}
                  </span>
                </div>

                {/* Grid of Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {items.map((exp) => (
                    <ExperienceCard key={exp.id} experience={exp} onSelect={() => onSelectExperience(exp)} />
                  ))}
                </div>

              </section>
            );
          })
        ) : (
          /* Filtered Results View */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                {activeCategory === 'all' ? 'Search Results' : categories.find(c => c.id === activeCategory)?.label}
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                Showing {filteredExperiences.length} experiences
              </span>
            </div>

            {filteredExperiences.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 space-y-4">
                <p className="text-gray-500 text-sm">No experiences found matching your filter criteria.</p>
                <button
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  className="bg-[#0B5E8E] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredExperiences.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} onSelect={() => onSelectExperience(exp)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Global Bottom Banner CTA */}
        <section className="bg-gradient-to-r from-[#0D2833] to-[#0B5E8E] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-[#C9A66B]/30">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5C989]">Tailor-Made Victoria Falls Concierge</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">Need Help Customising Your Experience Plan?</h3>
            <p className="text-sm text-gray-200 font-light leading-relaxed">
              Our local Victoria Falls travel specialists design seamless multi-day itineraries combining safaris, river cruises, flights, and dining.
            </p>
          </div>

          <button
            onClick={onOpenPlanHoliday}
            className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg transition-all shrink-0 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Plan My Custom Holiday</span>
          </button>
        </section>

      </div>
    </div>
  );
};

/* Subcomponent for Standard Experience Card */
const ExperienceCard: React.FC<{ experience: Experience; onSelect: () => void }> = ({ experience, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
    >
      <div>
        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden bg-gray-100">
          <img
            src={experience.featuredImage}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

          {/* Price Badge */}
          <div className="absolute top-3 right-3 bg-[#0D2833]/85 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
            {experience.fromPrice}
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 left-3 bg-white/90 text-[#0B5E8E] backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#C9A66B]" />
            <span>{experience.duration}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-2">
          <h3 className="font-serif font-bold text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug">
            {experience.title}
          </h3>

          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
            {experience.shortDescription}
          </p>
        </div>
      </div>

      {/* Card Footer Button */}
      <div className="p-5 pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-full bg-[#FAF9F6] hover:bg-[#0B5E8E] text-[#0B5E8E] hover:text-white border border-gray-200 hover:border-[#0B5E8E] text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>View Experience</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
        </button>
      </div>
    </div>
  );
};
