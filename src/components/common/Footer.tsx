import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY_NUMBER, getWhatsAppUrl } from '../../utils/whatsapp';
import { PageLink } from './PageLink';
import { sectionPath } from '../../routes';
import React from 'react';
import { MapPin,PhoneCall,Mail } from 'lucide-react';

let outboundLogo: any;
registerContent(() => { outboundLogo = editorialValue("common/Footer.outboundLogo", {}); });
// Public image paths for experiences
let cruise1: any;
registerContent(() => { cruise1 = editorialValue("common/Footer.cruise1", {}); });

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenPlanHoliday: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onOpenPlanHoliday,
}) => {
  return (
    <footer className="bg-[#0B5E8E] text-white pt-16 pb-12 border-t border-white/10 relative overflow-hidden">
      {/* Subtle Panoramic Backdrop Image */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <img
          src={cruise1}
          alt={editorial("common/Footer.text1")}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B5E8E] via-transparent to-[#0B5E8E]" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/15">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <img 
                src={outboundLogo} 
                alt={editorial("common/Footer.text2")}
                className="h-14 sm:h-16 w-auto object-contain"
                onError={() => {
                  console.error('Logo failed to load from:', outboundLogo);
                }}
              />
            </div>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm">
              {editorial("common/Footer.text3")}</p>

            <div className="pt-2 space-y-2 text-xs text-white/80">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span>{editorial("common/Footer.text4")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <a 
                  href={getWhatsAppUrl("Hello Outbound Holidays, I'd like to enquire about Victoria Falls travel.")}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#C9A66B] transition-colors"
                >
                  {editorial("common/Footer.text5")}{WHATSAPP_DISPLAY_NUMBER}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span>{CONTACT_EMAIL}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Victoria Falls Travel */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#C9A66B]">
              {editorial("common/Footer.text6")}</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/80">
              <li>
                <PageLink href={sectionPath('travel-guide')} onClick={() => onNavigateSection('travel-guide')} className="hover:text-white transition-colors cursor-pointer">
                  {editorial("common/Footer.text7")}</PageLink>
              </li>
              <li>
                <PageLink href={sectionPath('travel-experiences')} onClick={() => onNavigateSection('travel-experiences')} className="hover:text-white transition-colors cursor-pointer">
                  {editorial("common/Footer.text8")}</PageLink>
              </li>
              <li>
                <PageLink href={sectionPath('accommodation')} onClick={() => onNavigateSection('accommodation')} className="hover:text-white transition-colors cursor-pointer">
                  {editorial("common/Footer.text9")}</PageLink>
              </li>
              <li>
                <PageLink href={sectionPath('travel-packages')} onClick={() => onNavigateSection('travel-packages')} className="hover:text-white transition-colors cursor-pointer">
                  {editorial("common/Footer.text10")}</PageLink>
              </li>
              <li>
                <button onClick={onOpenPlanHoliday} className="hover:text-[#C9A66B] font-bold transition-colors cursor-pointer">
                  {editorial("common/Footer.text11")}</button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Contact */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#C9A66B]">
              {editorial("common/Footer.text12")}</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/80">
              <li>
                <PageLink href={sectionPath('about-us')} onClick={() => onNavigateSection('about-us')} className="hover:text-white transition-colors font-medium cursor-pointer">
                  {editorial("common/Footer.text13")}</PageLink>
              </li>
              <li>
                <PageLink href={sectionPath('contact-us')} onClick={() => onNavigateSection('contact-us')} className="hover:text-white transition-colors font-medium cursor-pointer">
                  {editorial("common/Footer.text14")}</PageLink>
              </li>
              <li>
                <PageLink href={sectionPath('faqs')} onClick={() => onNavigateSection('faqs')} className="hover:text-white transition-colors cursor-pointer">
                  {editorial("common/Footer.text15")}</PageLink>
              </li>
              <li>
                <span className="text-white/60">{editorial("common/Footer.text16")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payment Badges & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p className="text-center sm:text-left">
            {editorial("common/Footer.text17")}{' '}
            <button
              onClick={onOpenPlanHoliday}
              className="text-[#C9A66B] font-bold hover:underline ml-1 cursor-pointer"
            >
              {editorial("common/Footer.text18")}</button>
          </p>

          {/* Payment Badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/60 font-semibold uppercase">{editorial("common/Footer.text19")}</span>
            <span className="bg-white/10 text-white px-2.5 py-1 rounded-md text-[10px] font-bold border border-white/15">{editorial("common/Footer.text20")}</span>
            <span className="bg-white/10 text-white px-2.5 py-1 rounded-md text-[10px] font-bold border border-white/15">{editorial("common/Footer.text21")}</span>
            <span className="bg-white/10 text-white px-2.5 py-1 rounded-md text-[10px] font-bold border border-white/15">{editorial("common/Footer.text22")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
