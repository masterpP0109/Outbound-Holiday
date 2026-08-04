import React from 'react';
import { getWhatsAppEnquiryUrl, getWhatsAppSpecialistUrl, WHATSAPP_DISPLAY_NUMBER } from '../../utils/whatsapp';

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c0-5.445 4.43-9.875 9.877-9.875 2.64 0 5.122 1.03 6.987 2.898a9.825 9.825 0 012.893 6.98 9.875 9.875 0 01-9.878 9.87zM12.05 2c-5.523 0-10 4.477-10 10 0 1.77.46 3.486 1.332 5.006L2 22l5.126-1.344C8.614 21.528 10.3 22 12.05 22c5.523 0 10-4.477 10-10s-4.477-10-10-10z" />
  </svg>
);

interface WhatsAppEnquiryButtonProps {
  experienceName: string;
  date?: string;
  guests?: number | string;
  additionalNotes?: string;
  buttonText?: string;
  variant?: 'whatsapp-green' | 'amber-primary' | 'outline' | 'hero';
  fullWidth?: boolean;
  className?: string;
  showIcon?: boolean;
  onClick?: () => void;
}

export const WhatsAppEnquiryButton: React.FC<WhatsAppEnquiryButtonProps> = ({
  experienceName,
  date,
  guests,
  additionalNotes,
  buttonText = "Enquire About Availability",
  variant = 'whatsapp-green',
  fullWidth = true,
  className = "",
  showIcon = true,
  onClick
}) => {
  const url = getWhatsAppEnquiryUrl(experienceName, { date, guests, additionalNotes });

  let baseStyle = "font-bold text-sm py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md transform hover:-translate-y-0.5 active:translate-y-0";

  if (variant === 'whatsapp-green') {
    baseStyle += " bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-[#25D366]/20";
  } else if (variant === 'amber-primary') {
    baseStyle += " bg-[#E67E22] hover:bg-[#d36e17] text-white";
  } else if (variant === 'hero') {
    baseStyle += " bg-[#25D366] hover:bg-[#20ba5a] text-white text-base py-4 px-7 shadow-lg";
  } else if (variant === 'outline') {
    baseStyle += " bg-white hover:bg-emerald-50 text-[#128C7E] border-2 border-[#25D366]";
  }

  const widthStyle = fullWidth ? "w-full" : "w-auto inline-flex";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`${baseStyle} ${widthStyle} ${className}`}
    >
      {showIcon && <WhatsAppIcon className="w-5 h-5 shrink-0" />}
      <span>{buttonText}</span>
    </a>
  );
};

interface WhatsAppSpecialistCTAProps {
  topic?: string;
  className?: string;
  text?: string;
}

export const WhatsAppSpecialistCTA: React.FC<WhatsAppSpecialistCTAProps> = ({
  topic,
  className = "",
  text = "Need help choosing? Chat with a Victoria Falls Travel Specialist"
}) => {
  const url = getWhatsAppSpecialistUrl(topic);

  return (
    <div className={`text-center pt-2 ${className}`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B5E8E] hover:text-[#25D366] transition-colors group p-1"
      >
        <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] group-hover:scale-110 transition-transform" />
        <span className="underline underline-offset-4 decoration-gray-300 group-hover:decoration-[#25D366]">
          {text}
        </span>
      </a>
    </div>
  );
};
