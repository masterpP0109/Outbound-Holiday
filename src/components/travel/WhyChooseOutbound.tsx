import React from 'react';
import { ShieldCheck, MapPin, Sparkles, Headset, CalendarCheck, ArrowRight } from 'lucide-react';

interface WhyChooseOutboundProps {
  onOpenPlanHoliday?: () => void;
}

export const WhyChooseOutbound: React.FC<WhyChooseOutboundProps> = ({
  onOpenPlanHoliday,
}) => {
  const cards = [
    {
      icon: ShieldCheck,
      title: 'Trusted Advice',
      description: 'Honest recommendations tailored to your travel dreams, expectations and budget—without pressure to book things you do not need.',
      label: 'Clear and honest guidance',
    },
    {
      icon: MapPin,
      title: 'Local Expertise',
      description: 'First-hand knowledge of Victoria Falls, the Zambezi River, Hwange and the surrounding region.',
      label: 'Based in Victoria Falls',
    },
    {
      icon: Sparkles,
      title: 'Carefully Selected',
      description: 'We recommend lodges, guides and experiences based on local knowledge, reliability and the quality of experience they provide.',
      label: 'Locally informed choices',
    },
    {
      icon: Headset,
      title: 'Personal Service',
      description: 'Receive personal support from your first enquiry through planning, booking, arrival and your time in Victoria Falls.',
      label: 'Support throughout your journey',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/10 text-[#C9A66B] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>THE OUTBOUND DIFFERENCE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E] tracking-tight">
            Why Plan With Outbound Holidays?
          </h2>

          <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
            We replace uncertainty with clear, honest local guidance—helping you plan a Victoria Falls holiday that feels right for your interests, expectations and budget.
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
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B]" />
                  <span>{card.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Budget Reassurance Callout */}
        <div className="bg-[#FAF9F6] border border-[#0B5E8E]/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#0B5E8E]">
              Planning With a Particular Budget?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              You do not need to book everything to have a memorable Victoria Falls holiday. We’ll help you understand the expected costs, prioritise what matters most and choose experiences that offer the right value for you.
            </p>
          </div>

          <button
            onClick={onOpenPlanHoliday}
            className="shrink-0 bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Plan Around My Budget</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
