import React from 'react';
import { TRUST_BUILDERS } from '../../data/travelData';
import { ShieldCheck, MapPin, Award, HeartHandshake } from 'lucide-react';

export const TrustBuilders: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-8 h-8 text-[#0B5E8E]" />;
      case 'MapPin': return <MapPin className="w-8 h-8 text-[#0B5E8E]" />;
      case 'Award': return <Award className="w-8 h-8 text-[#0B5E8E]" />;
      case 'HeartHandshake': return <HeartHandshake className="w-8 h-8 text-[#0B5E8E]" />;
      default: return <ShieldCheck className="w-8 h-8 text-[#0B5E8E]" />;
    }
  };

  return (
    <section className="bg-[#FAFAFA] py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {TRUST_BUILDERS.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white p-6 rounded-lg border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center group"
            >
              <div className="w-14 h-14 rounded-full bg-[#0B5E8E]/10 flex items-center justify-center mb-4 group-hover:bg-[#0B5E8E] group-hover:text-white transition-colors duration-300">
                {getIcon(item.icon)}
              </div>
              <h3 className="text-lg font-bold text-[#0B5E8E] mb-2">
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
