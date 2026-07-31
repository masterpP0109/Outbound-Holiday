import React from 'react';
import { TRUST_BUILDERS } from '../../data/travelData';
import { ShieldCheck, MapPin, Award, HeartHandshake } from 'lucide-react';
import { useScrollReveal } from '../../hooks';

export const TrustBuilders: React.FC = () => {
  const { ref, isVisible } = useScrollReveal(0.2);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-7 h-7" />;
      case 'MapPin': return <MapPin className="w-7 h-7" />;
      case 'Award': return <Award className="w-7 h-7" />;
      case 'HeartHandshake': return <HeartHandshake className="w-7 h-7" />;
      default: return <ShieldCheck className="w-7 h-7" />;
    }
  };

  return (
    <section className="py-20 md:py-24 bg-[#FAFAFA]">
      <div
        ref={ref}
        className={`container-center ${isVisible ? 'animate-stagger visible' : 'animate-stagger'}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_BUILDERS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-8 border border-gray-200/60 transition-all duration-400 hover:shadow-card group"
            >
              <div className="w-14 h-14 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center mb-5 text-[#0B5E8E] group-hover:bg-[#0B5E8E] group-hover:text-white transition-colors duration-300">
                {getIcon(item.icon)}
              </div>
              <h3 className="text-lg font-bold text-[#0B5E8E] mb-2 font-serif">
                {item.title}
              </h3>
              <p className="text-sm text-[#2F3A44] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
