import React from 'react';
import { Calendar, FileText, Plane, Star, ArrowRight } from 'lucide-react';

interface QuickPlanningBarProps {
  onOpenGuide: () => void;
  onOpenExperiences: () => void;
}

export const QuickPlanningBar: React.FC<QuickPlanningBarProps> = ({
  onOpenGuide,
  onOpenExperiences,
}) => {
  const cards = [
    {
      id: 'best-time',
      icon: Calendar,
      title: 'Best Time to Visit',
      subtitle: 'Water levels, weather & seasons',
      action: onOpenGuide,
    },
    {
      id: 'visa',
      icon: FileText,
      title: 'Visa & Entry Requirements',
      subtitle: 'Kaza Univisa, Zimbabwe & Zambia',
      action: onOpenGuide,
    },
    {
      id: 'getting-here',
      icon: Plane,
      title: 'Getting Here',
      subtitle: 'Flights, airport transfers & border crossings',
      action: onOpenGuide,
    },
    {
      id: 'top-experiences',
      icon: Star,
      title: 'Top Experiences',
      subtitle: 'Helicopter, safaris & cruises',
      action: onOpenExperiences,
    },
  ];

  return (
    <section className="bg-[#FAF9F6] py-10 sm:py-12 border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
            Start Planning Your Victoria Falls Holiday
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Find practical answers on when to visit, entry requirements, getting here and what to experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={card.action}
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md hover:border-[#C9A66B]/60 transition-all duration-300 text-left flex items-start justify-between gap-3 group cursor-pointer transform hover:-translate-y-0.5"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] group-hover:bg-[#C9A66B] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-gray-300 group-hover:text-[#C9A66B] group-hover:translate-x-1 transition-all pt-1">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
