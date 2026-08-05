import React from 'react';
import { Quote, Sparkles, MessageCircle } from 'lucide-react';

export const TravellerStories: React.FC = () => {
  const reviews = [
    {
      initials: 'T.M.',
      type: 'Family Trip',
      location: 'Zimbabwe',
      text: 'Outbound Holidays handled our Victoria Falls arrangements seamlessly. From our transfers to local activities, having a dedicated specialist on hand made the holiday feel completely stress-free.',
    },
    {
      initials: 'D.L.',
      type: 'Honeymoon Couple',
      location: 'United Kingdom',
      text: 'Having a local team in Victoria Falls was invaluable. They provided honest recommendations on what was worth doing, and every detail was perfectly arranged.',
    },
    {
      initials: 'N.F.',
      type: 'Family Safari',
      location: 'Zimbabwe',
      text: 'Traveling with children can be complicated, but our itinerary was paced wonderfully. The kids loved the sunset cruise and rainforest walk.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/10 text-[#C9A66B] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>REAL GUEST EXPERIENCES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E] leading-tight">
            What Our Guests Say
          </h2>

          <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed">
            Experiences shared by travellers who trusted Outbound Holidays to help plan their time in Victoria Falls.
          </p>
        </div>

        {/* Clean Neutral Guest Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200/80 p-7 shadow-xs flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <Quote className="w-8 h-8 text-[#C9A66B]/30" />
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] font-bold text-xs flex items-center justify-center">
                    {rev.initials}
                  </div>
                  <div>
                    <span className="font-bold text-[#0B5E8E] block">{rev.type}</span>
                    <span className="text-gray-500 text-[11px]">{rev.location}</span>
                  </div>
                </div>

                <div className="text-[#C9A66B] text-[11px] font-semibold flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Verified Feedback</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
