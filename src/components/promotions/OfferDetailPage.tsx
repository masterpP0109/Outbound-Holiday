import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import type { PromotionOffer } from '../../types/promotion';
import { resolveAssetUrl } from '../../runtime/api';
import { trackPromotionEvent, parseUtmParams } from '../../data/promotionsData';
import { PromotionEnquiryModal } from './PromotionEnquiryModal';

interface OfferDetailPageProps {
  offer: PromotionOffer;
  onNavigateHome: () => void;
  onNavigatePackages: () => void;
}

export const OfferDetailPage: React.FC<OfferDetailPageProps> = ({
  offer,
  onNavigateHome,
  onNavigatePackages,
}) => {
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    trackPromotionEvent(offer.id, 'impression');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [offer.id]);

  const handleEnquire = () => {
    trackPromotionEvent(offer.id, 'cta_click');
    setEnquiryOpen(true);
  };

  const handleWhatsApp = () => {
    trackPromotionEvent(offer.id, 'cta_click');
    trackPromotionEvent(offer.id, 'whatsapp_click');
    window.open(offer.whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const priceBasisLabel = offer.priceBasis.replace(/_/g, ' ');

  return (
    <article className="min-h-screen bg-[#FAF9F6] pb-24 pt-8">
      {/* Top Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-sm text-[#0B5E8E] hover:text-[#0D2833] transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Outbound Holidays</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Hero Image & Badges */}
          <div className="relative h-[340px] sm:h-[420px] md:h-[480px] w-full overflow-hidden bg-gray-900">
            <img
              src={resolveAssetUrl(offer.imageUrl)}
              alt={offer.headline}
              className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            {/* Badges in top corners */}
            <div className="absolute top-6 left-6 flex flex-wrap gap-2.5">
              {offer.badgeText && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C9A66B] text-white text-xs font-bold tracking-wider uppercase shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{offer.badgeText}</span>
                </span>
              )}
              {offer.discountPercentage && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold tracking-wider uppercase shadow-md">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Save {offer.discountPercentage}% Verified</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>{offer.destinationOrActivity || 'Victoria Falls, Zimbabwe'}</span>
              </span>
            </div>

            {/* Campaign Code Tag */}
            <div className="absolute top-6 right-6">
              <span className="px-3 py-1 rounded-md bg-black/50 backdrop-blur-md text-white/90 font-mono text-xs border border-white/20">
                Code: {offer.campaignCode}
              </span>
            </div>

            {/* Hero Overlay Headline */}
            <div className="absolute bottom-6 left-6 right-6 max-w-4xl">
              {offer.category && (
                <p className="text-[#C9A66B] text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2">
                  {offer.category.replace(/_/g, ' ')}
                </p>
              )}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                {offer.headline}
              </h1>
              {offer.subtitle && (
                <p className="text-gray-200 text-sm sm:text-lg mt-2 font-sans line-clamp-2">
                  {offer.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="p-6 sm:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left 2 Cols: Details & Inclusions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description Section */}
              <div>
                <h2 className="text-xl font-serif font-bold text-[#0D2833] mb-3">About This Promotion</h2>
                <div className="prose prose-stone text-gray-700 leading-relaxed text-sm sm:text-base">
                  <p>{offer.shortDescription}</p>
                  {offer.fullContent && <p className="mt-3">{offer.fullContent}</p>}
                </div>
              </div>

              {/* Offer Highlights / Inclusions */}
              <div className="p-6 bg-[#FAF5EB] rounded-2xl border border-[#E5D6B3]/60">
                <h3 className="text-base font-serif font-bold text-[#0D2833] flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-[#8A6D3B]" />
                  <span>Promotion Inclusions & Highlights</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>Personal Victoria Falls itinerary consultation with local specialists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>Dedicated local ground support from arrival to departure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>Authorised national park and activity coordination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>Direct WhatsApp line with your personal safari consultant</span>
                  </li>
                </ul>
              </div>

              {/* Terms and Conditions */}
              {offer.termsAndConditions && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span>Terms & Conditions</span>
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {offer.termsAndConditions}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Booking & Pricing Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 p-6 sm:p-7 rounded-2xl bg-white border border-gray-200 shadow-lg space-y-6">
                {/* Pricing Display */}
                <div className="border-b border-gray-100 pb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Special Campaign Pricing
                  </p>
                  <div className="flex items-baseline gap-3">
                    {offer.promotionalPriceUSD ? (
                      <>
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#0B5E8E]">
                          ${offer.promotionalPriceUSD.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 font-medium uppercase">
                          USD / {priceBasisLabel}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-[#0D2833]">Enquire for Exclusive Rates</span>
                    )}
                  </div>
                  {offer.originalPriceUSD && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                      <span>Standard Rate:</span>
                      <span className="line-through">${offer.originalPriceUSD.toLocaleString()} USD</span>
                    </div>
                  )}
                </div>

                {/* Validity Period (CAT / Africa/Harare) */}
                {offer.validityEnd && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                    <Calendar className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Offer Validity</p>
                      <p className="mt-0.5">
                        Valid until {new Date(offer.validityEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (CAT)
                      </p>
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleEnquire}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-[#0B5E8E] to-[#0D2833] text-white font-medium hover:from-[#094c73] hover:to-[#081a22] transition-all shadow-md focus:outline-hidden focus:ring-2 focus:ring-[#C9A66B] cursor-pointer"
                  >
                    <span>{offer.primaryCta.label || 'Enquire About This Offer'}</span>
                  </button>

                  <button
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#25D366] text-white font-medium hover:bg-[#20ba5a] transition-all shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#25D366] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Enquire via WhatsApp</span>
                  </button>
                </div>

                {/* Trust Guarantees */}
                <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No obligation quote & local price guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0B5E8E] shrink-0" />
                    <span>Fast response from our Victoria Falls office</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion-linked Enquiry Modal */}
      <PromotionEnquiryModal
        promotion={offer}
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />
    </article>
  );
};
