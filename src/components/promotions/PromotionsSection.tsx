import React from 'react';
import { Sparkles, Tag, Calendar, ArrowRight, MessageSquare } from 'lucide-react';
import type { PromotionOffer } from '../../types/promotion';
import { resolveAssetUrl } from '../../runtime/api';
import { trackPromotionEvent } from '../../data/promotionsData';

interface PromotionsSectionProps {
  promotions: PromotionOffer[];
  onSelectOffer: (promotion: PromotionOffer) => void;
  onOpenOfferDetails: (promotion: PromotionOffer) => void;
}

export const PromotionsSection: React.FC<PromotionsSectionProps> = ({
  promotions,
  onSelectOffer,
  onOpenOfferDetails,
}) => {
  // Only render cards that have CMS enabled 'showAsCard'
  const cardPromotions = promotions.filter((p) => p.display.showAsCard);

  if (cardPromotions.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F6] border-y border-[#E5D6B3]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A66B]/20 border border-[#C9A66B]/40 text-[#8A6D3B] text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exclusive Limited-Time Offers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D2833]">
            Featured Victoria Falls Promotions
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Handcrafted travel packages and seasonal savings backed by our local ground team in Victoria Falls.
          </p>
        </div>

        {/* Promotional Cards Grid */}
        <div className={`grid grid-cols-1 ${cardPromotions.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : 'max-w-xl mx-auto'} gap-6 lg:gap-8`}>
          {cardPromotions.map((promo) => {
            const priceBasisLabel = promo.priceBasis.replace(/_/g, ' ');

            const handleCardClick = () => {
              trackPromotionEvent(promo.id, 'cta_click');
              if (promo.primaryCta.destination === 'whatsapp') {
                trackPromotionEvent(promo.id, 'whatsapp_click');
                window.open(promo.whatsappUrl, '_blank', 'noopener,noreferrer');
                return;
              }
              if (promo.primaryCta.destination === 'offer_page') {
                onOpenOfferDetails(promo);
                return;
              }
              onSelectOffer(promo);
            };

            return (
              <div
                key={promo.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Card Image */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-900">
                  <img
                    src={resolveAssetUrl(promo.imageUrl)}
                    alt={promo.headline}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {promo.badgeText && (
                      <span className="px-2.5 py-1 rounded-full bg-[#C9A66B] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        {promo.badgeText}
                      </span>
                    )}
                    {promo.discountPercentage && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        Save {promo.discountPercentage}%
                      </span>
                    )}
                  </div>

                  {promo.destinationOrActivity && (
                    <div className="absolute bottom-3 left-3 text-white text-xs font-medium drop-shadow-sm">
                      {promo.destinationOrActivity}
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#0D2833] group-hover:text-[#0B5E8E] transition-colors line-clamp-1">
                      {promo.headline}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {promo.subtitle || promo.shortDescription}
                    </p>
                  </div>

                  {/* Pricing & Validity */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        {promo.promotionalPriceUSD ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-[#0B5E8E]">
                              ${promo.promotionalPriceUSD.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-gray-500 uppercase font-medium">
                              USD / {priceBasisLabel}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-[#0D2833]">Enquire for pricing</span>
                        )}
                        {promo.originalPriceUSD && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ${promo.originalPriceUSD.toLocaleString()} USD
                          </span>
                        )}
                      </div>

                      {promo.validityEnd && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                          <Calendar className="w-3 h-3" />
                          <span>Valid {new Date(promo.validityEnd).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {/* CTAs */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={handleCardClick}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0B5E8E] text-white text-xs font-semibold hover:bg-[#094c73] transition-colors shadow-xs"
                      >
                        <span>{promo.primaryCta.label || 'Enquire Offer'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenOfferDetails(promo)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
