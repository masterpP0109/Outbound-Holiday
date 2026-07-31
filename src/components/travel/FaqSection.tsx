import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

interface FaqSectionProps {
  onOpenGuide?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenGuide }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How much should I budget for a Victoria Falls trip?',
      a: 'Trips typically start from $350 per person for smart budget stays up to $2,150+ for luxury all-inclusive riverfront lodges. Packages usually include accommodation, transfers, guided rainforest tours, and sunset cruises. We tailor every itinerary to match your exact budget.',
    },
    {
      q: 'Can I pay a deposit to secure my booking?',
      a: 'Yes! You can secure your lodge dates and activity reservations with a small deposit (typically 20% - 30%), and pay the remaining balance closer to your arrival date. We offer flexible payment arrangements.',
    },
    {
      q: 'Is the initial planning consultation free?',
      a: '100% free with zero obligation to book! You can speak or chat with our Victoria Falls travel specialists, receive itemized quote options, and ask as many questions as you need without paying anything.',
    },
    {
      q: 'Can you plan around my specific budget or custom dates?',
      a: 'Absolutely. Whether you have 2 days or 2 weeks, a tight budget or an unrestricted luxury vision, our local team builds custom itineraries from scratch specifically for your dates and party size.',
    },
    {
      q: 'How quickly will I receive my custom quotation?',
      a: 'Once you submit your details via our 3-minute Holiday Builder or WhatsApp, a Victoria Falls specialist will review your preferences and send an itemized quotation within 2 to 4 hours during office hours.',
    },
  ];

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column (35-40% width) - Heading & Intro */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block">
              Clear Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E] leading-tight">
              You may be wondering…
            </h2>
            <p className="text-sm sm:text-base text-[#2F3A44] leading-relaxed max-w-md">
              Everything you need to know about planning your Victoria Falls holiday with total confidence.
            </p>

            {onOpenGuide && (
              <div className="pt-4">
                <button
                  onClick={onOpenGuide}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0B5E8E] hover:text-[#E67E22] transition-colors cursor-pointer group"
                >
                  <span>Explore our complete Victoria Falls Insider Guide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column (60-65% width) - Clean Accordion */}
          <div className="lg:col-span-7 space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className="border border-gray-200/80 rounded-[18px] overflow-hidden bg-[#FAFAFA] transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-[#0B5E8E] text-sm sm:text-base hover:bg-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-[#C9A66B] shrink-0" />
                      <span className="font-serif">{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#0B5E8E]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#2F3A44] leading-relaxed border-t border-gray-200/60 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
