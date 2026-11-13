import React, { useEffect, useRef } from 'react';
import { X, ArrowRight, Tag, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { PromotionOffer } from '../../types/promotion';
import { resolveAssetUrl } from '../../runtime/api';
import {
  trackPromotionEvent,
  recordPromotionPopupImpression,
  recordSessionPromotionDismissal,
} from '../../data/promotionsData';

interface PromotionalModalProps {
  promotion: PromotionOffer;
  isOpen: boolean;
  onClose: () => void;
  onSelectOffer: (promotion: PromotionOffer) => void;
  onOpenOfferDetails: (promotion: PromotionOffer) => void;
}

export const PromotionalModal: React.FC<PromotionalModalProps> = ({
  promotion,
  isOpen,
  onClose,
  onSelectOffer,
  onOpenOfferDetails,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const trackedImpressionRef = useRef(false);

  // Focus trap & Escape key dismissal
  useEffect(() => {
    if (!isOpen) {
      trackedImpressionRef.current = false;
      return;
    }

    if (!trackedImpressionRef.current) {
      trackedImpressionRef.current = true;
      recordPromotionPopupImpression(promotion.id);
      trackPromotionEvent(promotion.id, 'impression');
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => closeBtnRef.current?.focus());

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, promotion.id]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    recordSessionPromotionDismissal();
    onClose();
  };

  const handlePrimaryClick = () => {
    trackPromotionEvent(promotion.id, 'cta_click');
    if (promotion.primaryCta.destination === 'whatsapp') {
      trackPromotionEvent(promotion.id, 'whatsapp_click');
      window.open(promotion.whatsappUrl, '_blank', 'noopener,noreferrer');
      handleDismiss();
      return;
    }
    if (promotion.primaryCta.destination === 'offer_page') {
      onOpenOfferDetails(promotion);
      handleDismiss();
      return;
    }
    if (promotion.primaryCta.destination === 'custom_url' && promotion.primaryCta.target) {
      window.location.href = promotion.primaryCta.target;
      handleDismiss();
      return;
    }
    // Default: Open Promotion-linked enquiry modal
    onSelectOffer(promotion);
    handleDismiss();
  };

  const handleSecondaryClick = () => {
    trackPromotionEvent(promotion.id, 'cta_click');
    if (promotion.secondaryCta?.destination === 'whatsapp') {
      trackPromotionEvent(promotion.id, 'whatsapp_click');
      window.open(promotion.whatsappUrl, '_blank', 'noopener,noreferrer');
      handleDismiss();
      return;
    }
    if (promotion.secondaryCta?.destination === 'offer_page' || !promotion.secondaryCta) {
      onOpenOfferDetails(promotion);
      handleDismiss();
      return;
    }
    if (promotion.secondaryCta.target) {
      window.location.href = promotion.secondaryCta.target;
      handleDismiss();
    }
  };

  const priceBasisLabel = promotion.priceBasis.replace(/_/g, ' ');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh] animate-in zoom-in-95 duration-200"
      >
        {/* Dismiss Button */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={handleDismiss}
          aria-label="Close promotion offer"
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Destination Photograph with Badge (Desktop) / Top (Mobile) */}
        <div className="relative w-full md:w-[48%] h-52 sm:h-64 md:h-auto min-h-[220px] md:min-h-full shrink-0 overflow-hidden bg-[#0B5E8E]">
          <img
            src={resolveAssetUrl(promotion.imageUrl)}
            alt={promotion.imageAlt || promotion.headline}
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

          {/* Promotional Badge */}
          {promotion.badgeText && (
            <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E67E22] text-white text-xs font-extrabold uppercase tracking-wider shadow-md">
              <Tag className="w-3.5 h-3.5" />
              <span>{promotion.badgeText}</span>
            </div>
          )}

          {/* Discount Ribbon if accurately verified */}
          {promotion.discountPercentage && promotion.discountPercentage > 0 && (
            <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs text-[#0B5E8E] px-3.5 py-1.5 rounded-xl shadow-lg border border-white/40 flex items-center gap-1.5 text-xs font-bold">
              <span className="text-[#3F6B3C] font-black text-sm">{promotion.discountPercentage}% OFF</span>
              <span className="text-gray-500 uppercase text-[10px]">Verified Offer</span>
            </div>
          )}
        </div>

        {/* Right Side: Copy, Pricing, CTAs, Validity */}
        <div className="flex-1 p-5 sm:p-7 md:p-8 overflow-y-auto flex flex-col justify-between space-y-5 bg-white">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A66B]">
              <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
              <span>{promotion.destinationOrActivity}</span>
            </div>

            <h2 id="promo-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#1A2E35] leading-tight">
              {promotion.headline}
            </h2>

            {promotion.subtitle && (
              <p className="text-sm font-semibold text-[#0B5E8E]">
                {promotion.subtitle}
              </p>
            )}

            <p className="text-sm text-gray-600 leading-relaxed">
              {promotion.shortDescription}
            </p>

            {/* Pricing Section */}
            {promotion.promotionalPriceUSD && (
              <div className="pt-2 pb-1 border-y border-gray-100 flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-[#0B5E8E]">
                  ${promotion.promotionalPriceUSD.toLocaleString()} USD
                </span>
                {promotion.originalPriceUSD && (
                  <span className="text-sm sm:text-base text-gray-400 line-through">
                    ${promotion.originalPriceUSD.toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-gray-500 capitalize">
                  / {priceBasisLabel}
                </span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handlePrimaryClick}
              className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-[#E67E22] hover:bg-[#d36e17] active:bg-[#c25f10] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E67E22]"
            >
              <span>{promotion.primaryCta.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {promotion.secondaryCta && (
              <button
                type="button"
                onClick={handleSecondaryClick}
                className="w-full min-h-[42px] py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0B5E8E] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{promotion.secondaryCta.label}</span>
              </button>
            )}

            {/* Terms & Validity Note */}
            {promotion.termsAndConditions && (
              <p className="text-[11px] text-gray-400 text-center pt-1 leading-snug">
                {promotion.termsAndConditions}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
