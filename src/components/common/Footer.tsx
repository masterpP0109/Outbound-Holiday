import React from 'react';
import { ActivePortal } from '../../types';
import { 
  Compass, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';

interface FooterProps {
  activePortal: ActivePortal;
  onNavigateSection: (sectionId: string) => void;
  onOpenPlanHoliday: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activePortal,
  onNavigateSection,
  onOpenPlanHoliday,
}) => {
  return (
    <footer className="bg-[#2F3A44] text-white pt-16 pb-12 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-700">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#0B5E8E] flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-[#E67E22]" />
              </div>
              <div>
                <span className="font-bold text-lg text-white block leading-none">
                  Outbound Holidays
                </span>
                <span className="text-[10px] font-bold text-[#C9A66B] uppercase tracking-widest">
                  & African Art Marketplace
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Zimbabwe’s trusted Victoria Falls travel specialists and curated African art marketplace. Dedicated to authentic cultural discovery, seamless travel planning, and supporting local African master artists.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-gray-300">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E67E22]" />
                <span>Victoria Falls, Zimbabwe</span>
              </div>
            </div>
          </div>

          {/* Col 2: Victoria Falls Travel */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#C9A66B]">
              Victoria Falls Travel
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigateSection('travel-packages')} className="hover:text-white transition-colors">
                  Curated Packages
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('travel-guide')} className="hover:text-white transition-colors">
                  Victoria Falls Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('travel-accommodations')} className="hover:text-white transition-colors">
                  Lodge Accommodation
                </button>
              </li>
              <li>
                <button onClick={onOpenPlanHoliday} className="hover:text-[#E67E22] font-semibold transition-colors">
                  Plan My Holiday
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: African Art Marketplace */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#C9A66B]">
              Art Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigateSection('art-shop')} className="hover:text-white transition-colors">
                  Shop All Artworks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('art-categories')} className="hover:text-white transition-colors">
                  Featured Categories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('art-artists')} className="hover:text-white transition-colors">
                  Verified Artists
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('art-why-us')} className="hover:text-white transition-colors">
                  Why Shop With Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Legal */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#C9A66B]">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><a href="#help" className="hover:text-white">Help Centre</a></li>
              <li><a href="#shipping" className="hover:text-white">Shipping Information</a></li>
              <li><a href="#returns" className="hover:text-white">Returns Policy</a></li>
              <li><a href="#privacy" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#contact" className="hover:text-white">Contact Details</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payment Badges & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="text-center sm:text-left">
            &copy; 2026 Outbound Holidays & African Art Marketplace. All rights reserved.{' '}
            <button
              onClick={onOpenPlanHoliday}
              className="text-[#C9A66B] font-bold hover:underline"
            >
              Talk to a Travel Expert
            </button>
          </p>

          {/* Payment Badges */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Secure Payments:</span>
            <span className="bg-gray-800 text-white px-2 py-1 rounded text-[10px] font-bold border border-gray-700">VISA</span>
            <span className="bg-gray-800 text-white px-2 py-1 rounded text-[10px] font-bold border border-gray-700">Mastercard</span>
            <span className="bg-gray-800 text-white px-2 py-1 rounded text-[10px] font-bold border border-gray-700">EcoCash</span>
            <span className="bg-gray-800 text-white px-2 py-1 rounded text-[10px] font-bold border border-gray-700">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
