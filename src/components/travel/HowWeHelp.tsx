import React from 'react';
import { Hotel, Bus, Compass, Trees, CalendarRange, Globe2, Sparkles } from 'lucide-react';

export const HowWeHelp: React.FC = () => {
  const services = [
    {
      icon: Hotel,
      title: 'Accommodation',
      description: 'Carefully selected hotels, lodges, apartments and family stays matched to your travel style and budget.',
    },
    {
      icon: Bus,
      title: 'Airport Transfers',
      description: 'Reliable transfer options from Victoria Falls, Livingstone and Kasane airports to your accommodation.',
    },
    {
      icon: Compass,
      title: 'Experiences',
      description: 'Honest guidance on which cruises, tours, safaris and adventure activities are right for you.',
    },
    {
      icon: Trees,
      title: 'Safari Extensions',
      description: 'Combine Victoria Falls with Hwange, Chobe or another regional safari without creating a rushed itinerary.',
    },
    {
      icon: CalendarRange,
      title: 'Travel Planning',
      description: 'Receive a personalised itinerary with clear estimated costs, timings and practical local advice.',
    },
    {
      icon: Globe2,
      title: 'Cross-Border Holidays',
      description: 'Practical coordination for holidays connecting Zimbabwe, Zambia and Botswana.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>COMPLETE HOLIDAY PLANNING</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E] tracking-tight">
            How We Help
          </h2>

          <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
            From where you stay to what you do and how you get around, we bring every part of your Victoria Falls holiday together.
          </p>
        </div>

        {/* 6 Grid Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-[#0B5E8E]/40 transition-all duration-300 flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center shrink-0 group-hover:bg-[#0B5E8E] group-hover:text-white transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
