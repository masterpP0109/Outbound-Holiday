import React from 'react';
import { Compass, Heart, Users, Sparkles, Award, HelpCircle, ArrowRight } from 'lucide-react';

interface IntentCardsProps {
  onSelectIntent: (intentKey: string) => void;
}

export const IntentCards: React.FC<IntentCardsProps> = ({ onSelectIntent }) => {
  const intents = [
    {
      id: 'first-time',
      title: 'Visiting for the First Time',
      desc: 'Essential sights, guided rainforest walks, sunset river cruises, and seamless transfers.',
      icon: <Compass className="w-6 h-6 text-[#0B5E8E]" />,
      badge: 'Most Popular',
    },
    {
      id: 'family',
      title: 'Planning a Family Holiday',
      desc: 'Kid-friendly lodges, safe wildlife encounters, gentle canopy ziplines, and spacious family suites.',
      icon: <Users className="w-6 h-6 text-[#3F6B3C]" />,
      badge: 'Family Safe',
    },
    {
      id: 'romantic',
      title: 'Romantic Escape & Honeymoon',
      desc: 'Intimate riverfront villas, Flight of Angels helicopter tours, and private candlelit pontoon dining.',
      icon: <Heart className="w-6 h-6 text-[#E67E22]" />,
      badge: 'Luxury',
    },
    {
      id: 'best-value',
      title: 'Looking for the Best Value',
      desc: 'Curated 3-star boutique lodges, bundled activity passes, and budget-friendly travel packages.',
      icon: <Award className="w-6 h-6 text-[#0B5E8E]" />,
      badge: 'Great Value',
    },
    {
      id: 'celebration',
      title: 'Celebrating Something Special',
      desc: 'Birthdays, anniversaries, or milestones with custom surprise setups and private champagne cruises.',
      icon: <Sparkles className="w-6 h-6 text-[#C9A66B]" />,
      badge: 'VIP Touch',
    },
    {
      id: 'need-help',
      title: 'Need Help Planning Everything',
      desc: 'Let our Zimbabwean travel specialists design a tailored itinerary from scratch to suit your budget.',
      icon: <HelpCircle className="w-6 h-6 text-[#0B5E8E]" />,
      badge: 'Free Advice',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-2">
            Tailored To Your Travel Style
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B5E8E] font-serif mb-3">
            How Can We Help You Today?
          </h2>
          <p className="text-[#2F3A44] text-sm sm:text-base">
            Select what best describes your travel intention to explore recommended packages or build a custom itinerary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {intents.map((intent) => (
            <div
              key={intent.id}
              onClick={() => onSelectIntent(intent.id)}
              className="bg-gray-50 hover:bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#0B5E8E] shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white rounded-xl border border-gray-200 group-hover:bg-[#0B5E8E]/10 transition-colors">
                    {intent.icon}
                  </div>
                  <span className="text-[10px] font-bold text-[#3F6B3C] bg-[#3F6B3C]/10 px-2.5 py-1 rounded-full uppercase">
                    {intent.badge}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-[#0B5E8E] mb-2 group-hover:text-[#E67E22] transition-colors">
                  {intent.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {intent.desc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B5E8E] group-hover:translate-x-1 transition-transform">
                <span>Explore Options</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E67E22]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
