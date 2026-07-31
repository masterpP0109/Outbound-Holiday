import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useScrollReveal } from '../../hooks';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const { ref, isVisible } = useScrollReveal(0.1);

  const faqs = [
    {
      q: 'How much should I budget for a Victoria Falls holiday?',
      a: 'A 3-day holiday in Victoria Falls ranges from $650 per person for Comfort lodges up to $1,850+ per person for 5-star luxury riverfront resorts. Our Holiday Builder\u2122 provides instant estimated costs including accommodation, transfers, and activities.',
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
      a: 'You will receive an instant estimated budget range on screen in the Holiday Builder\u2122. One of our senior Zimbabwean travel concierges will email your formal itemized proposal within 2 hours.',
    },
    {
      q: 'Is the estimated Holiday Builder price final?',
      a: 'The Builder provides an accurate estimate based on published supplier rates. Final quotes may vary slightly depending on exact seasonal lodge promotions, room availability, and custom upgrades.',
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-white">
      <div
        ref={ref}
        className={`container-center ${isVisible ? 'animate-reveal visible' : 'animate-reveal'}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Heading */}
          <div className="lg:col-span-5">
            <span className="section-label">Clear Answers</span>
            <h2 className="section-heading text-[#0B5E8E]">
              Frequently Asked Questions
            </h2>
            <p className="text-[#2F3A44] text-base sm:text-lg">
              Everything you need to know about planning your Victoria Falls trip with confidence.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="lg:col-span-7">
            <div className="space-y-0">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <button
                    onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                    className="w-full text-left py-5 flex items-center justify-between gap-4 font-bold text-[#0B5E8E] text-sm sm:text-base hover:opacity-70 transition-opacity group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0B5E8E] group-hover:text-white transition-colors duration-300">
                        <HelpCircle className="w-4 h-4" />
                      </span>
                      {faq.q}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold shrink-0">
                      {openIdx === idx ? 'Close' : 'Open'}
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openIdx === idx ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-sm sm:text-base text-[#2F3A44] leading-relaxed pl-11">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
