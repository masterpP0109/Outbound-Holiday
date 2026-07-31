import React from 'react';
import { ArrowRight, Compass, Users, Heart, Award, Sparkles, HelpCircle } from 'lucide-react';

interface IntentCardsProps {
  onSelectIntent: (intentKey: string) => void;
}

export const IntentCards: React.FC<IntentCardsProps> = ({ onSelectIntent }) => {
  const intents = [
    {
      id: 'first-time',
      title: 'Our first Victoria Falls holiday',
      subtitle: 'Iconic sights, guided rainforest walks, sunset cruises, and zero stress.',
      imageUrl: 'https://images.unsplash.com/photo-1549472346-607ef3a33904?auto=format&fit=crop&q=80&w=800',
      badge: 'First-Time Essential',
      category: 'Iconic Sights',
    },
    {
      id: 'family',
      title: 'A family getaway',
      subtitle: 'Child-friendly lodges, safe wildlife safaris, and engaging activities for all ages.',
      imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
      badge: 'Family Safe',
      category: 'All Ages',
    },
    {
      id: 'romantic',
      title: 'A romantic celebration',
      subtitle: 'Private riverfront villas, helicopter flights, and candlelit river dinners.',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
      badge: 'Honeymoon & Luxury',
      category: 'Romance',
    },
    {
      id: 'best-value',
      title: 'The best experience for our budget',
      subtitle: 'Handpicked boutique stays, bundled activity savings, and maximum value.',
      imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
      badge: 'Smart Value',
      category: 'Best Value',
    },
    {
      id: 'celebration',
      title: 'Milestone celebration',
      subtitle: 'Special birthdays, anniversaries, and reunions with VIP special touches.',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
      badge: 'Milestones',
      category: 'Special Touch',
    },
    {
      id: 'planning-assistance',
      title: 'Custom travel planning',
      subtitle: 'Personalized guidance from local concierges to tailor every detail of your stay.',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
      badge: 'Concierge Care',
      category: 'Personal Service',
    },
  ];

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-2">
            Tailored To Your Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E] leading-tight mb-3">
            How Can We Help You Today?
          </h2>
          <p className="text-sm sm:text-base text-[#2F3A44] leading-relaxed">
            Choose what best describes your travel intention to explore tailored recommendations and custom options.
          </p>
        </div>

        {/* 6 Large Image Cards in 3 Columns x 2 Rows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {intents.map((intent) => (
            <div
              key={intent.id}
              onClick={() => onSelectIntent(intent.id)}
              className="bg-white rounded-[20px] overflow-hidden relative group cursor-pointer border border-gray-200/80 shadow-[0_16px_40px_rgba(47,58,68,0.06)] hover:shadow-[0_20px_50px_rgba(11,94,142,0.16)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between h-[360px]"
            >
              {/* Background Photographic Image */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={intent.imageUrl}
                  alt={intent.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B5E8E]/95 via-[#0B5E8E]/60 to-black/20 group-hover:from-[#0B5E8E] transition-colors duration-300" />
              </div>

              {/* Top Badge Pill */}
              <div className="relative z-10 p-5 flex items-center justify-between">
                <span className="bg-[#E67E22] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {intent.badge}
                </span>
                <span className="bg-white/10 backdrop-blur-md text-white/90 border border-white/20 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {intent.category}
                </span>
              </div>

              {/* Bottom Card Content */}
              <div className="relative z-10 p-6 text-white space-y-2">
                <h3 className="font-serif font-bold text-xl text-white group-hover:text-[#C9A66B] transition-colors leading-snug">
                  {intent.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed">
                  {intent.subtitle}
                </p>

                <div className="flex items-center gap-2 text-xs font-bold text-[#E67E22] pt-3 group-hover:text-white transition-colors">
                  <span>Explore Options</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
