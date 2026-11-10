import { editorial } from "../../runtime/catalog";
import { getWhatsAppEnquiryUrl } from '../../utils/whatsapp';
import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppButton';
import { getWhatsAppSpecialistUrl } from '../../utils/whatsapp';

interface MobileStickyCtaProps {
  onOpenPlanHoliday: () => void;
  experienceName?: string;
  isModalOpen?: boolean;
}

export const MobileStickyCta: React.FC<MobileStickyCtaProps> = ({ onOpenPlanHoliday, experienceName, isModalOpen }) => {
  if (isModalOpen) return null;

  const whatsappUrl = experienceName 
    ? getWhatsAppEnquiryUrl(experienceName)
    : getWhatsAppSpecialistUrl();

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-3 pt-2.5 shadow-2xl flex items-center gap-2.5 transition-transform"
      style={{ paddingBottom: 'max(0.625rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))' }}
    >
      <button
        onClick={onOpenPlanHoliday}
        className="flex-1 min-h-[44px] bg-[#0B5E8E] hover:bg-[#094c73] active:bg-[#073c5b] text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
      >
        <CalendarCheck className="w-4 h-4 text-[#C9A66B]" />
        <span>{editorial("common/MobileStickyCta.text1")}</span>
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-h-[44px] bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1da851] text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-4 h-4" />
        <span>{editorial("common/MobileStickyCta.text2")}</span>
      </a>
    </div>
  );
};
