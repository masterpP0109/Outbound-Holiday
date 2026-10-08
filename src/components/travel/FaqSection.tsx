import { editorial, editorialValue } from "../../runtime/catalog";
import { PageLink } from '../common/PageLink';
import { sectionPath } from '../../routes';
import React,{ useState } from 'react';
import { ChevronDown,HelpCircle,ArrowRight } from 'lucide-react';

interface FaqSectionProps {
  onOpenGuide?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenGuide }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = editorialValue("travel/FaqSection.section1", {});

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column (35-40% width) - Heading & Intro */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block">
              {editorial("travel/FaqSection.text11")}</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E] leading-tight">
              {editorial("travel/FaqSection.text12")}</h2>
            <p className="text-sm sm:text-base text-[#2F3A44] leading-relaxed max-w-md">
              {editorial("travel/FaqSection.text13")}</p>

            {onOpenGuide && (
              <div className="pt-4">
                <PageLink href={sectionPath('guide')}
                  onClick={onOpenGuide}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0B5E8E] hover:text-[#E67E22] transition-colors cursor-pointer group"
                >
                  <span>{editorial("travel/FaqSection.text14")}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </PageLink>
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
