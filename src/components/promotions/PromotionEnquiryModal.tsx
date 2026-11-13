import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, MessageSquare, Calendar, Users, Phone, Mail, User } from 'lucide-react';
import type { PromotionOffer } from '../../types/promotion';
import { useSubmission } from '../common/SubmissionSafety';
import { trackPromotionEvent, parseUtmParams } from '../../data/promotionsData';

interface PromotionEnquiryModalProps {
  promotion: PromotionOffer;
  isOpen: boolean;
  onClose: () => void;
}

export const PromotionEnquiryModal: React.FC<PromotionEnquiryModalProps> = ({
  promotion,
  isOpen,
  onClose,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [travelDates, setTravelDates] = useState('');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [requests, setRequests] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successReference, setSuccessReference] = useState<string | null>(null);

  const submission = useSubmission('enquiries');
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSuccessReference(null);
      setSubmitError(null);
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => closeBtnRef.current?.focus());

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setSubmitError('Please provide your full name.');
      return;
    }

    if (!trimmedPhone && !trimmedEmail) {
      setSubmitError('Please provide either a WhatsApp/phone number or email address so we can contact you.');
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const utms = parseUtmParams();
      const combinedNotes = [
        requests.trim() ? `Guest Notes: ${requests.trim()}` : '',
        travelDates.trim() ? `Expected Dates: ${travelDates.trim()}` : '',
        `Party: ${adults} Adults, ${children} Children`,
      ]
        .filter(Boolean)
        .join('\n');

      const payload = {
        name: trimmedName,
        email: trimmedEmail || 'enquiry-guest@outboundholidays.com',
        phone: trimmedPhone || undefined,
        message: combinedNotes || `Enquiry for promotional offer: ${promotion.headline}`,
        source: 'holiday-builder' as const,
        promotionId: promotion.id,
        promotionName: promotion.name,
        trip: {
          promotionId: promotion.id,
          promotionName: promotion.name,
          adults: Math.max(1, adults),
          children: Math.max(0, children),
          nights: 3,
          stayTierId: 'comfort-plus',
          travelDates: travelDates.trim() || undefined,
          stayPreferences: ['Promotional Offer Enquired'],
          intent: 'promotional-offer',
        },
        marketingConsent,
        pageUrl: window.location.pathname + window.location.search,
        ...utms,
      };

      const result = await submission.save(payload);

      if (result && result.reference) {
        setSuccessReference(result.reference);
        trackPromotionEvent(promotion.id, 'enquiry_submit');
      } else {
        setSubmitError(submission.error || 'Unable to submit enquiry right now. Please try via WhatsApp.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your enquiry.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppFollowupUrl = () => {
    const refText = successReference ? ` (Ref: ${successReference})` : '';
    const message = `Hello Outbound Holidays, I just submitted an enquiry for the "${promotion.headline}" offer${refText}. Please could you share availability and details?`;
    return `https://wa.me/263714701721?text=${encodeURIComponent(message)}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-enquiry-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#C9A66B]/30 max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0D2833] to-[#0B5E8E] text-white p-5 sm:p-6 relative">
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close enquiry form"
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#C9A66B]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C9A66B]/25 border border-[#C9A66B]/40 text-[#FAF5EB] text-xs font-semibold tracking-wider uppercase mb-2">
            <span>Special Promotional Offer</span>
          </div>

          <h2 id="promo-enquiry-title" className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
            Enquire About This Offer
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-1">
            {promotion.headline}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {successReference ? (
            /* Success State */
            <div className="py-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#0D2833]">Enquiry Received!</h3>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Thank you, <strong>{fullName}</strong>. Our local Victoria Falls specialists have received your enquiry for{' '}
                <strong>{promotion.headline}</strong> and will follow up promptly.
              </p>

              <div className="mt-5 p-4 bg-[#FAF5EB] rounded-xl border border-[#E5D6B3] max-w-sm mx-auto">
                <p className="text-xs uppercase tracking-wider text-[#8A6D3B] font-semibold">Your Enquiry Reference</p>
                <p className="text-xl font-mono font-bold text-[#0D2833] mt-1">{successReference}</p>
                <p className="text-xs text-gray-500 mt-1">Please quote this reference in any correspondence.</p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={getWhatsAppFollowupUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-medium hover:bg-[#20ba5a] transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp Now</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm">
                  {submitError}
                </div>
              )}

              {/* Offer Summary Pill */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-semibold text-gray-800">{promotion.badgeText || 'Exclusive Promotion'}</span>
                  {promotion.promotionalPriceUSD && (
                    <span className="ml-2 font-bold text-[#0B5E8E]">
                      ${promotion.promotionalPriceUSD} USD <span className="text-gray-500 font-normal">/ {promotion.priceBasis.replace(/_/g, ' ')}</span>
                    </span>
                  )}
                </div>
                {promotion.discountPercentage && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    Save {promotion.discountPercentage}%
                  </span>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tendai Moyo"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Contact Info (WhatsApp & Email) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    WhatsApp or Phone <span className="text-gray-400 font-normal lowercase">(preferred)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+263 714 701 721"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Dates & Party size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Travel Window
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={travelDates}
                      onChange={(e) => setTravelDates(e.target.value)}
                      placeholder="e.g. Dec 2026"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B5E8E] text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Adults
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={adults}
                      onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B5E8E] text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Children
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={children}
                    onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B5E8E] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Additional Requests */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Questions or Special Requests
                </label>
                <textarea
                  rows={2}
                  value={requests}
                  onChange={(e) => setRequests(e.target.value)}
                  placeholder="Tell us about your preferred dates, flights, or specific Victoria Falls activities you wish to include..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B5E8E] text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Marketing Opt-in */}
              <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#0B5E8E] focus:ring-[#0B5E8E]"
                />
                <span>
                  Receive exclusive Victoria Falls seasonal promotions, safari advice, and travel insights from Outbound Holidays.
                </span>
              </label>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0B5E8E] to-[#0D2833] text-white font-medium hover:from-[#094c73] hover:to-[#081a22] transition-all shadow-md disabled:opacity-60 focus:outline-hidden focus:ring-2 focus:ring-[#C9A66B]"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Enquiry...' : 'Submit Promotional Enquiry'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your information is protected and handled directly by Outbound Holidays Victoria Falls.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
