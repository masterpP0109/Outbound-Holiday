import { editorial, editorialValue } from "../../runtime/catalog";
import React from 'react';
import { ArrowRight } from 'lucide-react';

// Public image paths for experiences







interface IntentCardsProps {
  onSelectIntent: (intentKey: string) => void;
}

export const IntentCards: React.FC<IntentCardsProps> = ({ onSelectIntent }) => {
  const collections = editorialValue("travel/IntentCards.section1", {});

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block">
            {editorial("travel/IntentCards.text13")}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#0B5E8E] leading-tight">
            {editorial("travel/IntentCards.text14")}</h2>
          <p className="text-sm sm:text-base text-[#2F3A44]/90 font-normal leading-relaxed max-w-2xl mx-auto pt-1">
            {editorial("travel/IntentCards.text15")}</p>
        </div>

        {/* 6 Curated Holiday Collection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectIntent(item.id)}
              className="bg-white rounded-[22px] overflow-hidden relative group cursor-pointer border border-gray-200/80 shadow-[0_16px_40px_rgba(47,58,68,0.06)] hover:shadow-[0_24px_60px_rgba(11,94,142,0.22)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[420px]"
            >
              {/* Background Photographic Image */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = item.fallbackUrl;
                  }}
                />
                {/* Gradient Overlay for Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B5E8E]/98 via-[#0B5E8E]/75 to-black/30 group-hover:from-[#0B5E8E] transition-colors duration-300" />
              </div>

              {/* Top Category Badge */}
              <div className="relative z-10 p-6 flex items-center justify-between">
                <span className="bg-[#C9A66B] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  {item.categoryLabel}
                </span>
              </div>

              {/* Bottom Card Content */}
              <div className="relative z-10 p-6 sm:p-7 text-white space-y-2">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-white group-hover:text-[#C9A66B] transition-colors leading-snug">
                  {item.title}
                </h3>

                {/* Description - Hidden by default, smoothly revealed on hover */}
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out py-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#E67E22] pt-2 group-hover:text-white transition-colors">
                  <span>{item.ctaText}</span>
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
