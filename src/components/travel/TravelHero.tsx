import React from 'react';
import { Palmtree, ArrowRight, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface TravelHeroProps {
  onOpenPlanHoliday: () => void;
  onBrowsePackages: () => void;
}

export const TravelHero: React.FC<TravelHeroProps> = ({
  onOpenPlanHoliday,
  onBrowsePackages,
}) => {
  return (
    <section className="relative bg-[#0B5E8E] text-white overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1614527961817-21789c629fb4?auto=format&fit=crop&q=80&w=1600')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B5E8E]/85 via-[#0B5E8E]/90 to-[#0B5E8E]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        {/* Subtle Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-[#C9A66B] mb-6 tracking-wide uppercase">
          <Sparkles className="w-4 h-4 text-[#E67E22]" />
          <span>Zimbabwe’s Premier Travel Specialists</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white max-w-4xl mx-auto leading-tight mb-6">
          Zimbabwe’s Trusted Victoria Falls Travel Specialists
        </h1>

        {/* Hero Description */}
        <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          Helping Zimbabweans and international travelers explore Mosi-oa-Tunya with confidence through carefully planned experiences and expert local knowledge.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto mb-14">
          <button
            onClick={onOpenPlanHoliday}
            className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-base px-8 py-3.5 rounded-md shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Plan My Holiday
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onBrowsePackages}
            className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0B5E8E] font-bold text-base px-8 py-3.5 rounded-md transition-all flex items-center justify-center gap-2"
          >
            Browse Packages
          </button>
        </div>

        {/* Key Trust Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/15 text-left">
          <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-lg border border-white/10">
            <ShieldCheck className="w-6 h-6 text-[#C9A66B] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-white">100% Guaranteed</p>
              <p className="text-xs text-white/70">Verified local suppliers</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-lg border border-white/10">
            <MapPin className="w-6 h-6 text-[#C9A66B] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-white">Victoria Falls Based</p>
              <p className="text-xs text-white/70">First-hand insider advice</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-lg border border-white/10">
            <Palmtree className="w-6 h-6 text-[#C9A66B] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-white">12,000+ Guests</p>
              <p className="text-xs text-white/70">Trusted for 15+ years</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-lg border border-white/10">
            <Sparkles className="w-6 h-6 text-[#C9A66B] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-white">24/7 Concierge</p>
              <p className="text-xs text-white/70">Personal support on ground</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
