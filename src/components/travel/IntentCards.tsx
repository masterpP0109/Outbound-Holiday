import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../../hooks';

interface IntentCardsProps {
  onSelectIntent: (intentKey: string) => void;
}

export const IntentCards: React.FC<IntentCardsProps> = ({ onSelectIntent }) => {
  const { ref, isVisible } = useScrollReveal(0.1);

  const intents = [
    {
      id: 'first-time',
      title: 'Visiting for the First Time',
      desc: 'Essential sights, guided rainforest walks, sunset river cruises, and seamless transfers.',
      image: 'https://images.unsplash.com/photo-1549472346-607ef3a33904?auto=format&fit=crop&q=80&w=800',
      badge: 'Most Popular',
    },
    {
      id: 'family',
      title: 'Planning a Family Holiday',
      desc: 'Kid-friendly lodges, safe wildlife encounters, gentle canopy ziplines, and spacious family suites.',
      image: 'https://images.unsplash.com/photo-1547471080-77a8b3014d23?auto=format&fit=crop&q=80&w=800',
      badge: 'Family Safe',
    },
    {
      id: 'romantic',
      title: 'Romantic Escape & Honeymoon',
      desc: 'Intimate riverfront villas, Flight of Angels helicopter tours, and private candlelit pontoon dining.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
      badge: 'Luxury',
    },
    {
      id: 'best-value',
      title: 'Looking for the Best Value',
      desc: 'Curated 3-star boutique lodges, bundled activity passes, and budget-friendly travel packages.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
      badge: 'Great Value',
    },
    {
      id: 'celebration',
      title: 'Celebrating Something Special',
      desc: 'Birthdays, anniversaries, or milestones with custom surprise setups and private champagne cruises.',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02e5f4f009?auto=format&fit=crop&q=80&w=800',
      badge: 'VIP Touch',
    },
    {
      id: 'need-help',
      title: 'Need Help Planning Everything',
      desc: 'Let our Zimbabwean travel specialists design a tailored itinerary from scratch to suit your budget.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800',
      badge: 'Free Advice',
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-white">
      <div
        ref={ref}
        className={`container-center ${isVisible ? 'animate-reveal visible' : 'animate-reveal'}`}
      >
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="section-label">Tailored To Your Travel Style</span>
          <h2 className="section-heading text-[#0B5E8E]">
            How Can We Help You Today?
          </h2>
          <p className="text-[#2F3A44] text-base sm:text-lg mx-auto">
            Select what best describes your travel intention to explore recommended packages or build a custom itinerary.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isVisible ? 'animate-stagger visible' : 'animate-stagger'}`}
        >
          {intents.map((intent) => (
            <div
              key={intent.id}
              onClick={() => onSelectIntent(intent.id)}
              className="card overflow-hidden cursor-pointer flex flex-col group"
            >
              <div className="card-image relative h-56 sm:h-64 overflow-hidden">
                <img
                  src={intent.image}
                  alt={intent.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className="absolute top-4 right-4 bg-[#C9A66B] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                  {intent.badge}
                </span>
              </div>

              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-[#0B5E8E] mb-2 font-serif group-hover:text-[#E67E22] transition-colors duration-300">
                  {intent.title}
                </h3>
                <p className="text-sm text-[#2F3A44] leading-relaxed mb-5 flex-1">
                  {intent.desc}
                </p>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B5E8E] group-hover:text-[#E67E22] transition-colors duration-300">
                  <span>Explore Options</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E67E22]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
