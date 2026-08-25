import React from 'react';
import { ArrowRight } from 'lucide-react';

import intentVicFallsIconicImg from '../../assets/images/intent_vic_falls_iconic_1785490034846.jpg';
import intentFamilyResortImg from '../../assets/images/intent_family_resort_zim_1785489699263.jpg';
import intentRomanticDinnerImg from '../../assets/images/intent_romantic_dinner_zim_1785489715667.jpg';
import intentCraftMarketImg from '../../assets/images/intent_craft_market_zim_1785489731195.jpg';
import intentBomaCelebrationImg from '../../assets/images/intent_boma_celebration_zim_1785489746202.jpg';
import heli1Img from '../../assets/Experiences/Flight of Angels/Heli-1-1-scaled.jpg';

interface IntentCardsProps {
  onSelectIntent: (intentKey: string) => void;
}

export const IntentCards: React.FC<IntentCardsProps> = ({ onSelectIntent }) => {
  const collections = [
    {
      id: 'first-time',
      categoryLabel: 'FIRST-TIME VISITORS',
      title: 'Your First Victoria Falls Adventure',
      description: 'Experience the highlights that make Victoria Falls unforgettable. Perfect for first-time visitors who want to see the Falls, cruise the Zambezi and enjoy the destination\'s must-do experiences—all without the stress of planning.',
      ctaText: 'Explore this Holiday',
      imageUrl: intentVicFallsIconicImg,
      fallbackUrl: 'https://images.unsplash.com/photo-1549472346-607ef3a33904?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'family',
      categoryLabel: 'FAMILY FAVOURITE',
      title: 'Create Family Memories That Last',
      description: 'Relax while we take care of the details. From family-friendly accommodation to exciting experiences for all ages, this holiday is designed to bring everyone together.',
      ctaText: 'Explore this Holiday',
      imageUrl: intentFamilyResortImg,
      fallbackUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'romantic',
      categoryLabel: 'ROMANTIC ESCAPES',
      title: 'Celebrate Something Special',
      description: 'Whether it\'s your honeymoon, anniversary or simply time away together, enjoy romantic sunsets, luxury accommodation and unforgettable moments in one of Africa\'s most spectacular destinations.',
      ctaText: 'Explore this Holiday',
      imageUrl: intentRomanticDinnerImg,
      fallbackUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'best-value',
      categoryLabel: 'BEST VALUE',
      title: 'Experience More for Less',
      description: 'A carefully planned Victoria Falls holiday that delivers incredible experiences while making the most of your budget. Great value without compromising on what matters most.',
      ctaText: 'Explore this Holiday',
      imageUrl: intentCraftMarketImg,
      fallbackUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'celebration',
      categoryLabel: 'CELEBRATIONS',
      title: 'Celebrate Life\'s Biggest Moments',
      description: 'Birthdays, anniversaries, graduations or family celebrations—let us create a personalised Victoria Falls experience worthy of the occasion.',
      ctaText: 'Explore this Holiday',
      imageUrl: intentBomaCelebrationImg,
      fallbackUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'planning-assistance',
      categoryLabel: 'TAILOR-MADE',
      title: 'Your Holiday, Expertly Planned',
      description: 'Looking for something unique? We\'ll create a personalised itinerary tailored to your interests, pace and budget, with expert advice every step of the way.',
      ctaText: 'Start Planning',
      imageUrl: heli1Img,
      fallbackUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    },
  ];

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block">
            Curated Holiday Collections
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[#0B5E8E] leading-tight">
            Find the Holiday That Fits You
          </h2>
          <p className="text-sm sm:text-base text-[#2F3A44]/90 font-normal leading-relaxed max-w-2xl mx-auto pt-1">
            Every traveller is different. Whether you're visiting Victoria Falls for the first time, planning a romantic escape or celebrating a special occasion, we've curated a collection of holidays designed around the experiences that matter most.
          </p>
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
