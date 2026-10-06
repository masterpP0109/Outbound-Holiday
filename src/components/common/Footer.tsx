import { CONTACT_EMAIL, WHATSAPP_DISPLAY_NUMBER, getWhatsAppUrl } from '../../utils/whatsapp';
import { PageLink } from './PageLink';
import { sectionPath } from '../../routes';
import React from 'react';
import { MapPin,PhoneCall,Mail } from 'lucide-react';

const outboundLogo = '/images/logo/outbound-holidays-logo.webp';
// Public image paths for experiences
const cruise1 = '/Experiences/Standard Cruise_/Standard-1-scaled.jpg';

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
          alt="Zambezi River dusk panorama backdrop"
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
                alt="Outbound Holidays" 
                className="h-14 sm:h-16 w-auto object-contain"
                onError={() => {
                  console.error('Logo failed to load from:', outboundLogo);
                }}
              />
            </div>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm">
              Zimbabwe’s trusted Victoria Falls travel specialists. Dedicated to seamless travel planning, curated lodge accommodation, sunset Zambezi cruises, and unforgettable African safari experiences.
            </p>

            <div className="pt-2 space-y-2 text-xs text-white/80">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span>Mosi-oa-Tunya Commercial Centre, Victoria Falls, Zimbabwe</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <a 
                  href={getWhatsAppUrl("Hello Outbound Holidays, I'd like to enquire about Victoria Falls travel.")}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#C9A66B] transition-colors"
                >
                  WhatsApp: {WHATSAPP_DISPLAY_NUMBER}
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
              Explore Victoria Falls
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/80">
              <li>
                <PageLink href={sectionPath('travel-guide')} onClick={() => onNavigateSection('travel-guide')} className="hover:text-white transition-colors cursor-pointer">
                  Vic Falls Guide
                </PageLink>
              </li>
              <li>
                <PageLink href={sectionPath('travel-experiences')} onClick={() => onNavigateSection('travel-experiences')} className="hover:text-white transition-colors cursor-pointer">
                  Experiences & Safaris
                </PageLink>
              </li>
              <li>
                <PageLink href={sectionPath('accommodation')} onClick={() => onNavigateSection('accommodation')} className="hover:text-white transition-colors cursor-pointer">
                  Where to Stay
                </PageLink>
              </li>
              <li>
                <PageLink href={sectionPath('travel-packages')} onClick={() => onNavigateSection('travel-packages')} className="hover:text-white transition-colors cursor-pointer">
                  Holiday Packages
                </PageLink>
              </li>
              <li>
                <button onClick={onOpenPlanHoliday} className="hover:text-[#C9A66B] font-bold transition-colors cursor-pointer">
                  Plan Your Trip
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Contact */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#C9A66B]">
              Outbound Holidays
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/80">
              <li>
                <PageLink href={sectionPath('about-us')} onClick={() => onNavigateSection('about-us')} className="hover:text-white transition-colors font-medium cursor-pointer">
                  About Us & Promises
                </PageLink>
              </li>
              <li>
                <PageLink href={sectionPath('contact-us')} onClick={() => onNavigateSection('contact-us')} className="hover:text-white transition-colors font-medium cursor-pointer">
                  Contact Specialist
                </PageLink>
              </li>
              <li>
                <PageLink href={sectionPath('faqs')} onClick={() => onNavigateSection('faqs')} className="hover:text-white transition-colors cursor-pointer">
                  Frequently Asked Questions
                </PageLink>
              </li>
              <li>
                <span className="text-white/60">Licensed Zimbabwe Tourism Authority Partner</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payment Badges & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p className="text-center sm:text-left">
            &copy; 2026 Outbound Holidays Zimbabwe. All rights reserved.{' '}
            <button
              onClick={onOpenPlanHoliday}
              className="text-[#C9A66B] font-bold hover:underline ml-1 cursor-pointer"
            >
              Talk to a Local Specialist
            </button>
          </p>

          {/* Payment Badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/60 font-semibold uppercase">Accepted Payments:</span>
            <span className="bg-white/10 text-white px-2.5 py-1 rounded-md text-[10px] font-bold border border-white/15">VISA</span>
            <span className="bg-white/10 text-white px-2.5 py-1 rounded-md text-[10px] font-bold border border-white/15">Mastercard</span>
            <span className="bg-white/10 text-white px-2.5 py-1 rounded-md text-[10px] font-bold border border-white/15">EcoCash</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
