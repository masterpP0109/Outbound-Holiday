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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-2.5 py-1.5 shadow-lg flex items-center justify-between gap-2 max-w-full box-border"
      style={{ paddingBottom: 'max(0.375rem, calc(env(safe-area-inset-bottom, 0px) + 0.25rem))' }}
    >
      <button
        onClick={onOpenPlanHoliday}
        className="flex-1 min-w-0 min-h-[36px] bg-[#0B5E8E] hover:bg-[#094c73] active:bg-[#073c5b] text-white font-semibold text-[11px] xs:text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
      >
        <CalendarCheck className="w-3.5 h-3.5 shrink-0 text-[#C9A66B]" />
        <span className="truncate">{editorial("common/MobileStickyCta.text1")}</span>
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 min-h-[36px] bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1da851] text-white font-semibold text-[11px] xs:text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{editorial("common/MobileStickyCta.text2")}</span>
      </a>
    </div>
  );
};
