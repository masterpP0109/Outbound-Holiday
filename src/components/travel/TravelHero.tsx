import React from 'react';
import { Sparkles, ShieldCheck, MapPin, Palmtree, ArrowRight } from 'lucide-react';

interface TravelHeroProps {
  onOpenPlanHoliday: () => void;
  onBrowsePackages: () => void;
}

export const TravelHero: React.FC<TravelHeroProps> = ({
  onOpenPlanHoliday,
  onBrowsePackages,
}) => {
  return (
    <section className="section-spacing bg-white">
      <div className="container-center">
        <div className="relative rounded-3xl overflow-hidden min-h-[620px] md:min-h-[680px] flex items-end md:items-center">
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1614527961817-21789c629fb4?auto=format&fit=crop&q=80&w=1600"
            alt="Victoria Falls Zambia Zimbabwe"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B5E8E]/90 via-[#0B5E8E]/70 to-transparent md:bg-gradient-to-r md:from-[#0B5E8E]/90 md:via-[#0B5E8E]/75 md:to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-[#C9A66B] mb-5 tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-[#E67E22]" />
              <span>Zimbabwe's Premier Travel Specialists</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-5 font-serif">
              Zimbabwe's Trusted Victoria Falls Travel Specialists
            </h1>

            <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-8 max-w-lg">
              Helping Zimbabweans and international travelers explore Mosi-oa-Tunya with confidence through carefully planned experiences and expert local knowledge.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={onOpenPlanHoliday}
                className="inline-flex items-center justify-center gap-2 bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-base px-7 py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Plan My Holiday
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onBrowsePackages}
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#0B5E8E] font-bold text-base px-7 py-3.5 rounded-xl transition-all duration-300"
              >
                Browse Packages
              </button>
            </div>
          </div>

          {/* Trust Stats Card - Overlapping */}
          <div className="absolute bottom-0 right-0 md:bottom-auto md:right-8 lg:right-12 bg-white rounded-t-3xl md:rounded-3xl md:shadow-card p-6 md:p-8 max-w-sm md:max-w-xs hidden sm:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#0B5E8E]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#2F3A44]">100% Guaranteed</p>
                  <p className="text-xs text-gray-500">Verified local suppliers</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3F6B3C]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#3F6B3C]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#2F3A44]">Based in Vic Falls</p>
                  <p className="text-xs text-gray-500">First-hand insider advice</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C9A66B]/10 flex items-center justify-center shrink-0">
                  <Palmtree className="w-5 h-5 text-[#C9A66B]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#2F3A44]">12,000+ Guests</p>
                  <p className="text-xs text-gray-500">Trusted for 15+ years</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E67E22]/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#E67E22]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#2F3A44]">24/7 Concierge</p>
                  <p className="text-xs text-gray-500">Personal on-ground support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
