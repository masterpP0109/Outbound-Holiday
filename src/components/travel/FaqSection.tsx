import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How much should I budget for a Victoria Falls holiday?',
      a: 'A 3-day holiday in Victoria Falls ranges from $650 per person for Comfort lodges up to $1,850+ per person for 5-star luxury riverfront resorts. Our Holiday Builder™ provides instant estimated costs including accommodation, transfers, and activities.',
    },
    {
      q: 'Is the travel planning consultation free?',
      a: 'Yes, 100% complimentary! Our local Zimbabwean travel specialists offer free, no-obligation planning advice and custom itinerary proposals.',
    },
    {
      q: 'Can I pay a deposit to hold my reservation?',
      a: 'Absolutely. We offer flexible payment arrangements allowing you to secure your preferred lodge and activity slots with a deposit, paying the remaining balance closer to your travel date.',
    },
    {
      q: 'Can you assist families traveling with young children?',
      a: 'Yes! We select family-friendly resort lodges with dedicated kids pools, interconnected rooms, and safe child-friendly activities like guided rainforest walks, gentle canopy ziplines, and crocodile sanctuaries.',
    },
    {
      q: 'How quickly will I receive my custom quotation?',
      a: 'You will receive an instant estimated budget range on screen in the Holiday Builder™. One of our senior Zimbabwean travel concierges will email your formal itemized proposal within 2 hours.',
    },
    {
      q: 'Is the estimated Holiday Builder price final?',
      a: 'The Builder provides an accurate estimate based on published supplier rates. Final quotes may vary slightly depending on exact seasonal lodge promotions, room availability, and custom upgrades.',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-2">
            Clear Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B5E8E] font-serif mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-[#2F3A44] text-sm sm:text-base">
            Everything you need to know about planning your Victoria Falls trip with confidence.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50 transition-all"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-[#0B5E8E] text-sm sm:text-base hover:bg-gray-100/80 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#C9A66B] shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIdx === idx ? 'rotate-180 text-[#0B5E8E]' : ''
                  }`}
                />
              </button>

              {openIdx === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#2F3A44] leading-relaxed border-t border-gray-200/60 bg-white">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
