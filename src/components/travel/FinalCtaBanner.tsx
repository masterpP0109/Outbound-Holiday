import React from 'react';
import { CalendarCheck, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { getWhatsAppSpecialistUrl } from '../../utils/whatsapp';

// Public image paths for experiences
const fallsTour1 = '/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';

interface FinalCtaBannerProps {
  onOpenPlanHoliday: () => void;
}

export const FinalCtaBanner: React.FC<FinalCtaBannerProps> = ({ onOpenPlanHoliday }) => {
  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto">
        <div className="relative bg-[#0B5E8E] text-white rounded-[32px] p-8 sm:p-14 lg:p-16 text-center shadow-[0_20px_50px_rgba(11,94,142,0.2)] overflow-hidden">
          
          {/* Authentic Victoria Falls Background Image with Blue Gradient Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: `url('${fallsTour1}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B5E8E]/95 via-[#0B5E8E]/90 to-[#0B5E8E]/80" />

          {/* Content Area */}
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-bold text-[#C9A66B] bg-white/10 border border-[#C9A66B]/40 px-4 py-1.5 rounded-full uppercase tracking-widest inline-block">
              START YOUR JOURNEY
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white leading-tight">
              Ready to Plan Your Victoria Falls Holiday?
            </h2>

            <p className="text-sm sm:text-lg text-white/90 leading-relaxed max-w-xl mx-auto">
              Tell us what you are considering, who you are travelling with and the budget you are working around. A Victoria Falls specialist will help you understand your best options.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
              <button
                onClick={onOpenPlanHoliday}
                className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Plan My Holiday</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={getWhatsAppSpecialistUrl("Planning Victoria Falls Trip")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm px-7 py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-white/80 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
              <span>Free initial consultation • Honest guidance • No obligation to book</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

