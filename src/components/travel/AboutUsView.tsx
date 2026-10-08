import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import React from 'react';
import { ShieldCheck,HeartHandshake,MapPin,Award,Sparkles } from 'lucide-react';

// Public image paths for experiences
let fallsTour1: any;
registerContent(() => { fallsTour1 = editorialValue("travel/AboutUsView.fallsTour1", {}); });

interface AboutUsViewProps {
  onOpenPlanHoliday?: () => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = () => {
  return (
    <section id="about-us" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto space-y-16">
        
        {/* Homepage Section 9: About Outbound Holidays (Asymmetrical Image-and-Content Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Content Side (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{editorial("travel/AboutUsView.text1")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E] leading-tight">
              {editorial("travel/AboutUsView.text2")}</h2>

            <p className="text-sm sm:text-base text-[#2F3A44] leading-relaxed max-w-xl">
              {editorial("travel/AboutUsView.text3")}</p>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 max-w-lg">
              <div>
                <span className="block text-2xl sm:text-3xl font-bold text-[#0B5E8E] font-serif">{editorial("travel/AboutUsView.text4")}</span>
                <span className="text-xs text-[#2F3A44]/70 font-medium">{editorial("travel/AboutUsView.text5")}</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold text-[#3F6B3C] font-serif">12,000+</span>
                <span className="text-xs text-[#2F3A44]/70 font-medium">{editorial("travel/AboutUsView.text6")}</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold text-[#E67E22] font-serif">4.9 ★</span>
                <span className="text-xs text-[#2F3A44]/70 font-medium">{editorial("travel/AboutUsView.text7")}</span>
              </div>
            </div>
          </div>

          {/* Large Authentic Image Side (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(11,94,142,0.12)] border border-gray-100 group">
              <img
                src={fallsTour1}
                alt={editorial("travel/AboutUsView.text8")}
                className="w-full h-80 sm:h-[420px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Quote overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
                <p className="font-serif italic text-xs sm:text-sm leading-relaxed">
                  {editorial("travel/AboutUsView.text9")}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Homepage Section 10: Outbound Holidays Promise */}
        <div className="bg-[#FDFBF7] p-8 sm:p-12 rounded-[28px] border border-gray-200/80">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-2">
              {editorial("travel/AboutUsView.text10")}</span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#0B5E8E]">
              {editorial("travel/AboutUsView.text11")}</h3>
            <p className="text-xs sm:text-sm text-[#2F3A44]/80 mt-1">
              {editorial("travel/AboutUsView.text12")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: editorial("travel/AboutUsView.text13"),
                desc: editorial("travel/AboutUsView.text14"),
                icon: <ShieldCheck className="w-6 h-6 text-[#0B5E8E]" />,
                highlight: true,
              },
              {
                title: editorial("travel/AboutUsView.text15"),
                desc: editorial("travel/AboutUsView.text16"),
                icon: <Award className="w-6 h-6 text-[#3F6B3C]" />,
                highlight: false,
              },
              {
                title: editorial("travel/AboutUsView.text17"),
                desc: editorial("travel/AboutUsView.text18"),
                icon: <MapPin className="w-6 h-6 text-[#E67E22]" />,
                highlight: false,
              },
              {
                title: editorial("travel/AboutUsView.text19"),
                desc: editorial("travel/AboutUsView.text20"),
                icon: <HeartHandshake className="w-6 h-6 text-[#C9A66B]" />,
                highlight: false,
              },
            ].map((pillar, i) => (
              <div
                key={i}
                className={`p-6 rounded-[20px] border transition-all duration-300 ${
                  pillar.highlight
                    ? 'bg-[#0B5E8E] text-white border-[#0B5E8E] shadow-[0_16px_40px_rgba(11,94,142,0.2)]'
                    : 'bg-white text-[#2F3A44] border-gray-200/80 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                    pillar.highlight ? 'bg-white/10 text-white' : 'bg-gray-100'
                  }`}
                >
                  {pillar.icon}
                </div>
                <h4
                  className={`font-bold font-serif text-base mb-2 ${
                    pillar.highlight ? 'text-white' : 'text-[#0B5E8E]'
                  }`}
                >
                  {pillar.title}
                </h4>
                <p
                  className={`text-xs leading-relaxed ${
                    pillar.highlight ? 'text-white/85' : 'text-[#2F3A44]/80'
                  }`}
                >
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
