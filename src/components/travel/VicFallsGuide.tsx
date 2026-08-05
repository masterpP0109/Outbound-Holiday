import React from 'react';
import { Calendar, FileText, Plane, Hotel, ArrowRight, Sparkles } from 'lucide-react';

interface VicFallsGuideProps {
  onOpenFullGuide?: () => void;
}

export const VicFallsGuide: React.FC<VicFallsGuideProps> = ({ onOpenFullGuide }) => {
  const guideCards = [
    {
      id: 'when-to-visit',
      icon: Calendar,
      title: 'When to Visit',
      description: 'Understand Victoria Falls water levels, weather, seasons and the experience offered by each time of year.',
    },
    {
      id: 'visa-requirements',
      icon: FileText,
      title: 'Visa & Entry Requirements',
      description: 'Find practical information about Zimbabwe entry requirements, KAZA Univisa and cross-border travel.',
    },
    {
      id: 'getting-here',
      icon: Plane,
      title: 'Getting to Victoria Falls',
      description: 'Compare flights, road travel, airport transfers and regional connections.',
    },
    {
      id: 'where-to-stay',
      icon: Hotel,
      title: 'Where to Stay',
      description: 'Choose accommodation according to your location preferences, travel style, group and budget.',
    },
  ];

  return (
    <section id="travel-guide" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] border-t border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/10 text-[#C9A66B] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>LOCAL ZIMBABWEAN KNOWLEDGE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#0B5E8E] leading-tight">
            Plan Victoria Falls With Local Insight
          </h2>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light max-w-2xl mx-auto">
            Get clear, practical guidance before you travel—from choosing the right season to understanding entry requirements, costs and where to stay.
          </p>
        </div>

        {/* 4 Practical Planning Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guideCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={onOpenFullGuide}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-[#C9A66B]/60 transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center group-hover:bg-[#0B5E8E] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center gap-1.5 text-xs font-semibold text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors">
                  <span>Explore in Travel Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary CTA */}
        {onOpenFullGuide && (
          <div className="text-center">
            <button
              onClick={onOpenFullGuide}
              className="inline-flex items-center gap-2.5 bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Read the Complete Victoria Falls Travel Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
