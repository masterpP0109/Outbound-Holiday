import React from 'react';
import { CalendarCheck, MessageSquare } from 'lucide-react';

interface MobileStickyCtaProps {
  onOpenPlanHoliday: () => void;
}

export const MobileStickyCta: React.FC<MobileStickyCtaProps> = ({ onOpenPlanHoliday }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-2.5 shadow-2xl flex items-center gap-2">
      <button
        onClick={onOpenPlanHoliday}
        className="flex-1 bg-[#D97706] active:bg-[#b45309] text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
      >
        <CalendarCheck className="w-4 h-4" />
        <span>Plan My Holiday</span>
      </button>

      <a
        href="https://wa.me/263771234567?text=Hi%20Outbound%20Holidays%2C%20I%20would%20like%20to%20plan%20a%20Victoria%20Falls%20trip."
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] active:bg-[#20ba5a] text-white font-bold text-xs p-2.5 rounded-lg flex items-center justify-center shadow-xs"
        aria-label="Chat on WhatsApp"
      >
        <MessageSquare className="w-4 h-4" />
      </a>
    </div>
  );
};
