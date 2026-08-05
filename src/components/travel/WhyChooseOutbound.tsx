import React from 'react';
import { MapPin, SlidersHorizontal, Headset, ShieldCheck, Sparkles } from 'lucide-react';

export const WhyChooseOutbound: React.FC = () => {
  const cards = [
    {
      icon: MapPin,
      title: 'Local Victoria Falls Specialists',
      description: 'Based directly on the ground in Victoria Falls, our local Zimbabwean concierges provide authentic insights and up-to-the-minute destination guidance.',
    },
    {
      icon: SlidersHorizontal,
      title: 'Tailor-made Holidays',
      description: 'Every traveler is unique. We craft personalized itineraries aligned strictly with your pace, style, party size, and preferred budget.',
    },
    {
      icon: Headset,
      title: 'Concierge Travel Support',
      description: 'Enjoy dedicated 24/7 WhatsApp concierge assistance throughout your journey for instant help, schedule changes, and local recommendations.',
    },
    {
      icon: ShieldCheck,
      title: 'Trusted Local Partners',
      description: 'We partner exclusively with fully licensed safari operators, vetted transfer drivers, and top-tier lodges to guarantee safety and quality.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/10 text-[#C9A66B] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>The Outbound Advantage</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E] tracking-tight">
            Why Choose Outbound Holidays
          </h2>

          <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
            We make planning your Victoria Falls safari effortless with expert local guidance, transparent advice, and full on-the-ground support.
          </p>
        </div>

        {/* 4 Premium Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF9F6] p-7 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-[#C9A66B]/60 transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B5E8E] text-white flex items-center justify-center shadow-md group-hover:bg-[#C9A66B] transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200/60 flex items-center gap-2 text-xs font-semibold text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                  <span>100% Vetted Quality</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
