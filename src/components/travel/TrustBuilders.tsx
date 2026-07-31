import React from 'react';
import { TRUST_BUILDERS } from '../../data/travelData';
import { ShieldCheck, MapPin, Award, HeartHandshake } from 'lucide-react';

export const TrustBuilders: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-[#0B5E8E]" />;
      case 'MapPin': return <MapPin className="w-5 h-5 text-[#0B5E8E]" />;
      case 'Award': return <Award className="w-5 h-5 text-[#0B5E8E]" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-[#0B5E8E]" />;
      default: return <ShieldCheck className="w-5 h-5 text-[#0B5E8E]" />;
    }
  };

  return (
    <section className="bg-white py-10 sm:py-14 border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_BUILDERS.map((item, idx) => (
            <div 
              key={idx}
              className="bg-[#FAFAFA] hover:bg-white p-6 sm:p-7 rounded-[20px] border border-gray-200/70 hover:border-[#0B5E8E]/30 shadow-2xs hover:shadow-[0_16px_40px_rgba(47,58,68,0.08)] transition-all duration-300 flex flex-col items-start group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0B5E8E]/10 flex items-center justify-center mb-4 group-hover:bg-[#0B5E8E] group-hover:text-white transition-colors duration-300 shrink-0">
                {getIcon(item.icon)}
              </div>
              <h3 className="text-base font-bold font-serif text-[#0B5E8E] mb-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#2F3A44] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
