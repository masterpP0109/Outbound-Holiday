import { editorial, editorialValue } from "../../runtime/catalog";
import { PageLink } from '../common/PageLink';
import { sectionPath } from '../../routes';
import React from 'react';
import { Calendar,FileText,Plane,Hotel,ArrowRight,Sparkles } from 'lucide-react';

interface VicFallsGuideProps {
  onOpenFullGuide?: () => void;
}

export const VicFallsGuide: React.FC<VicFallsGuideProps> = ({ onOpenFullGuide }) => {
  const guideCards = editorialValue("travel/VicFallsGuide.section1", {Calendar,FileText,Plane,Hotel});

  return (
    <section id="travel-guide" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] border-t border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/10 text-[#C9A66B] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/VicFallsGuide.text9")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#0B5E8E] leading-tight">
            {editorial("travel/VicFallsGuide.text10")}</h2>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light max-w-2xl mx-auto">
            {editorial("travel/VicFallsGuide.text11")}</p>
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
                  <span>{editorial("travel/VicFallsGuide.text12")}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary CTA */}
        {onOpenFullGuide && (
          <div className="text-center">
            <PageLink href={sectionPath('guide')}
              onClick={onOpenFullGuide}
              className="inline-flex items-center gap-2.5 bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{editorial("travel/VicFallsGuide.text13")}</span>
              <ArrowRight className="w-4 h-4" />
            </PageLink>
          </div>
        )}

      </div>
    </section>
  );
};
