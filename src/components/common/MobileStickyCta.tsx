import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppButton';
import { getWhatsAppSpecialistUrl } from '../../utils/whatsapp';

interface MobileStickyCtaProps {
  onOpenPlanHoliday: () => void;
  experienceName?: string;
}

export const MobileStickyCta: React.FC<MobileStickyCtaProps> = ({ onOpenPlanHoliday, experienceName }) => {
  const whatsappUrl = experienceName 
    ? `https://wa.me/263714701721?text=${encodeURIComponent(`Hello Outbound Holidays,\n\nI'm interested in ${experienceName} and would like to know its availability, pricing and how to book.\n\nThank you.`)}`
    : getWhatsAppSpecialistUrl();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-2.5 shadow-2xl flex items-center gap-2">
      <button
        onClick={onOpenPlanHoliday}
        className="flex-1 bg-[#0B5E8E] active:bg-[#08486e] text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
      >
        <CalendarCheck className="w-4 h-4" />
        <span>Custom Itinerary</span>
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 bg-[#25D366] active:bg-[#20ba5a] text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-4 h-4" />
        <span>WhatsApp Enquiry</span>
      </a>
    </div>
  );
};
