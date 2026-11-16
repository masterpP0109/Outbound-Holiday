import React from 'react';
import { MessagesSquare, Map, Luggage, MessageCircle } from 'lucide-react';
import { editorialOptional } from '../../runtime/catalog';

const DEFAULT_WHATSAPP_URL =
  "https://wa.me/263714701721?text=Hello%20Outbound%20Holidays%21%20I%27d%20like%20help%20planning%20a%20Victoria%20Falls%20holiday.";

export const PlanYourHolidaySection: React.FC = () => {
  const eyebrow = editorialOptional(
    'travel/PlanYourHoliday.eyebrow',
    'YOUR HOLIDAY, MADE EASIER'
  );
  const heading = editorialOptional(
    'travel/PlanYourHoliday.heading',
    "You Dream It. We'll Help You Plan It."
  );
  const description = editorialOptional(
    'travel/PlanYourHoliday.description',
    ''
  );
  const ctaText = editorialOptional(
    'travel/PlanYourHoliday.ctaText',
    'Start Planning With Us'
  );
  const ctaSubtext = editorialOptional(
    'travel/PlanYourHoliday.ctaSubtext',
    'Talk to our local Victoria Falls team'
  );
  const whatsappUrl = editorialOptional(
    'travel/PlanYourHoliday.whatsappUrl',
    DEFAULT_WHATSAPP_URL
  );

  const steps = [
    {
      id: 'plans',
      icon: MessagesSquare,
      title: editorialOptional('travel/PlanYourHoliday.step1Title', 'Tell Us Your Plans'),
      description: editorialOptional(
        'travel/PlanYourHoliday.step1Desc',
        'Share your travel dates, group size and budget.'
      ),
    },
    {
      id: 'advice',
      icon: Map,
      title: editorialOptional('travel/PlanYourHoliday.step2Title', 'Get Local Advice'),
      description: editorialOptional(
        'travel/PlanYourHoliday.step2Desc',
        "We'll recommend stays and experiences that fit your needs."
      ),
    },
    {
      id: 'details',
      icon: Luggage,
      title: editorialOptional('travel/PlanYourHoliday.step3Title', 'We Handle the Details'),
      description: editorialOptional(
        'travel/PlanYourHoliday.step3Desc',
        "We'll help arrange your bookings and itinerary."
      ),
    },
  ];

  return (
    <section
      aria-labelledby="plan-your-holiday-heading"
      className="bg-[#FAF9F6] py-10 sm:py-14 lg:py-16 border-b border-gray-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-gray-200/90 px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C9A66B]">
              {eyebrow}
            </p>
            <h2
              id="plan-your-holiday-heading"
              className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B5E8E] leading-tight mt-2"
            >
              {heading}
            </h2>
            {description && (
              <p className="text-sm sm:text-base text-[#2F3A44]/85 leading-relaxed mt-3 sm:mt-4">
                {description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 lg:gap-10 mt-8 sm:mt-10 lg:mt-12">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center text-center px-2"
                >
                  <div className="text-[#0B5E8E] mb-3" aria-hidden="true">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0B5E8E]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#2F3A44]/80 leading-relaxed mt-1.5 max-w-xs">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 sm:mt-10 lg:mt-12 rounded-2xl bg-[#FAF9F6] border border-gray-200/70 px-4 py-5 sm:px-8 sm:py-6 text-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-2xl mx-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#E67E22] hover:bg-[#d36e17] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5E8E] text-white font-bold text-sm sm:text-base px-6 py-3.5 sm:py-4 transition-colors duration-200 motion-reduce:transition-none"
            >
              <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{ctaText}</span>
            </a>
            <p className="text-xs sm:text-sm text-[#2F3A44]/75 mt-3 font-medium">
              {ctaSubtext}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
