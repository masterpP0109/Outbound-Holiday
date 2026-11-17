import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Bath,
  Bed,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Maximize2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import type { Currency } from '../../types';
import type { AccommodationOffer, DetailedAccommodation, RoomType } from '../../types/content';
import { formatCurrencyAmount } from '../../utils/currency';
import {
  calculateRoomStayQuote,
  formatBoardBasisLabel,
  formatPriceBasisLabel,
  formatVisitorMarketLabel,
  getOfferDisplayBadge,
  getPublishedPropertyOffers,
  getRoomBedSummary,
  getRoomCapacityLabel,
  getRoomDisplayAmenities,
  getRoomGalleryImages,
  getRoomPriceUnitLabel,
  getRoomRatePlans,
  getRoomStartingPriceUSD,
  getUnitAvailabilityBadge,
} from '../../utils/roomPricing';
import { DateRangeCalendar, type DateRangeValue } from './DateRangeCalendar';
import { GalleryLightbox } from './GalleryLightbox';
import { RoomAmenityIcon } from './RoomAmenityIcon';

interface RoomDetailModalProps {
  property: DetailedAccommodation;
  room: RoomType | null;
  currency: Currency;
  onClose: () => void;
  onEnquireRoom: (
    room: RoomType,
    prefill?: {
      offer?: AccommodationOffer | null;
      visitorMarket?: string;
      checkIn?: string;
      checkOut?: string;
      adults?: number;
      childrenCount?: number;
      mealPlanId?: string;
    }
  ) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  property,
  room,
  currency,
  onClose,
  onEnquireRoom,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ checkIn: '', checkOut: '' });
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [selectedMealPlanId, setSelectedMealPlanId] = useState('');
  const [selectedRatePlanId, setSelectedRatePlanId] = useState('');

  useEffect(() => {
    setActiveImageIdx(0);
    setLightboxOpen(false);
    setDateRange({ checkIn: '', checkOut: '' });
    setAdults(2);
    setChildrenCount(0);
    setSelectedMealPlanId(room?.pricing?.mealPlanRates?.[0]?.id || '');
    setSelectedRatePlanId('');
  }, [room]);

  useEffect(() => {
    if (!room) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !lightboxOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 10);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [room, lightboxOpen, onClose]);

  const gallery = useMemo(
    () => (room ? getRoomGalleryImages(room, property.heroImage) : []),
    [room, property.heroImage]
  );

  const quote = useMemo(() => {
    if (!room) return null;
    return calculateRoomStayQuote({
      room,
      property,
      checkIn: dateRange.checkIn,
      checkOut: dateRange.checkOut,
      guests: {
        adults,
        children: Array.from({ length: childrenCount }, (_, i) => ({
          id: `c-${i}`,
          ageCategory: 'under-11' as const,
        })),
      },
      mealPlanId: selectedMealPlanId || undefined,
      ratePlanId: selectedRatePlanId || undefined,
      currency,
    });
  }, [room, property, dateRange, adults, childrenCount, selectedMealPlanId, selectedRatePlanId, currency]);

  if (!room) return null;

  const startingPrice = getRoomStartingPriceUSD(room, property);
  const priceUnitLabel = getRoomPriceUnitLabel(room);
  const capacityLabel = getRoomCapacityLabel(room);
  const bedSummary = getRoomBedSummary(room);
  const amenities = getRoomDisplayAmenities(room);
  const ratePlans = getRoomRatePlans(room, property);
  const unitOffers = getPublishedPropertyOffers(property, room.id);
  const availBadge = getUnitAvailabilityBadge(room);
  const activeRatePlan = ratePlans.find((rp) => rp.id === selectedRatePlanId);
  const inclusions = Array.from(
    new Set([...(room.inclusions ?? []), ...(room.pricing?.inclusions ?? [])].filter(Boolean))
  );
  const exclusions = (room.pricing?.exclusions ?? []).filter(Boolean);
  const seasonalRates = (room.pricing?.seasonalRates ?? []).filter((sr) => sr.isActive !== false);
  const mealPlans = (room.pricing?.mealPlanRates ?? []).filter((mp) => mp.isActive !== false);
  const policies = room.policies;
  const occ = room.occupancyConfig;
  const accessFeatures = (room.accessibilityFeatures ?? []).filter(Boolean);
  const activeImg = gallery[activeImageIdx] || gallery[0];

  const hasPolicyNotes = Boolean(
    policies?.minStayNights ||
      room.pricing?.minStayNights ||
      policies?.checkInRestrictions ||
      policies?.cancellationPolicy ||
      policies?.extraPersonPolicy ||
      policies?.accessibilityInfo ||
      accessFeatures.length > 0 ||
      policies?.otherRestrictions ||
      occ?.childAgePolicy ||
      occ?.additionalGuestChargeNote ||
      occ?.interleadingInfo
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-detail-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-4xl bg-[#FAF9F6] rounded-t-3xl sm:rounded-3xl border border-gray-200 shadow-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden flex flex-col"
      >
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-5 sm:px-7 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A66B]">
                {property.name}
              </span>
              {room.wing && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {room.wing}
                </span>
              )}
              {room.unitCategory && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E]">
                  {room.unitCategory}
                </span>
              )}
              {room.isEntireProperty && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3F6B3C]/10 text-[#3F6B3C]">
                  Exclusive Use
                </span>
              )}
              {availBadge && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    availBadge.tone === 'rose'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {availBadge.label}
                </span>
              )}
              {room.featured && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E67E22]/15 text-[#E67E22]">
                  Featured
                </span>
              )}
            </div>
            <h2
              id="room-detail-modal-title"
              className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E] leading-snug break-words"
            >
              {room.name}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close room details"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Independent Room Gallery */}
          {gallery.length > 0 && (
            <div className="space-y-2.5">
              <div className="relative aspect-[16/9] sm:aspect-[16/8] w-full rounded-2xl overflow-hidden bg-gray-200 border border-gray-200 group">
                <img
                  src={activeImg.url}
                  alt={activeImg.alt || room.name}
                  onClick={() => setLightboxOpen(true)}
                  className="w-full h-full object-cover cursor-pointer"
                  loading="lazy"
                  decoding="async"
                />
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIdx((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
                      }
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIdx((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
                      }
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-3 right-3 bg-black/65 hover:bg-black/80 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>
                    {activeImageIdx + 1} / {gallery.length}
                  </span>
                </button>
                {activeImg.caption && (
                  <div className="absolute bottom-3 left-3 max-w-[70%] bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-md truncate">
                    {activeImg.caption}
                  </div>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {gallery.map((g, idx) => (
                    <button
                      key={`${g.url}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        idx === activeImageIdx
                          ? 'border-[#0B5E8E] shadow-xs'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={g.url} alt={g.alt || `${room.name} ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Specs & Description */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF9F6] border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-[#0B5E8E]">
                    <Users className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{capacityLabel}</span>
                  </span>
                  {bedSummary && (
                    <span className="inline-flex items-center gap-1.5 bg-[#FAF9F6] border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-[#0B5E8E]">
                      <Bed className="w-3.5 h-3.5 text-[#C9A66B]" />
                      <span>{bedSummary}</span>
                    </span>
                  )}
                  {typeof room.sizeSqm === 'number' && room.sizeSqm > 0 && (
                    <span className="inline-flex items-center gap-1.5 bg-[#FAF9F6] border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-[#0B5E8E]">
                      <span>{room.sizeSqm} m²</span>
                    </span>
                  )}
                  {typeof occ?.bathrooms === 'number' && occ.bathrooms > 0 && (
                    <span className="inline-flex items-center gap-1.5 bg-[#FAF9F6] border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-[#0B5E8E]">
                      <Bath className="w-3.5 h-3.5 text-[#C9A66B]" />
                      <span>
                        {occ.bathrooms} {occ.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                      </span>
                    </span>
                  )}
                </div>

                {room.shortDescription && (
                  <p className="text-sm font-medium text-[#0B5E8E]">{room.shortDescription}</p>
                )}
                {room.description && (
                  <p className="text-sm text-gray-700 font-light leading-relaxed whitespace-pre-line">
                    {room.description}
                  </p>
                )}

                {occ?.extraBedAvailable && (
                  <p className="text-xs text-gray-600 bg-[#FAF9F6] border border-gray-200 rounded-xl p-3">
                    <strong className="text-[#0B5E8E]">Extra Bed:</strong>{' '}
                    {occ.extraBedNotes || 'Extra bed available on request.'}
                  </p>
                )}
                {occ?.interleadingInfo && (
                  <p className="text-xs text-gray-600 bg-[#FAF9F6] border border-gray-200 rounded-xl p-3">
                    <strong className="text-[#0B5E8E]">Interleading Configuration:</strong>{' '}
                    {occ.interleadingInfo}
                  </p>
                )}
              </div>

              {/* Unit Amenities */}
              {amenities.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3">
                  <h3 className="font-serif text-lg font-bold text-[#0B5E8E]">
                    Unit Amenities &amp; Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {amenities.map((am) => (
                      <div
                        key={am.id}
                        className="flex items-center gap-2 bg-[#FAF9F6] border border-gray-200/80 rounded-xl px-3 py-2 text-xs font-medium text-gray-800"
                      >
                        <RoomAmenityIcon icon={am.icon} />
                        <span>{am.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              {(inclusions.length > 0 || exclusions.length > 0) && (
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4">
                  {inclusions.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-[#0B5E8E] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                        <span>Included With This Unit</span>
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-700">
                        {inclusions.map((inc, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#3F6B3C] shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exclusions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Not Included
                      </h4>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {exclusions.map((exc, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Policies & Notes */}
              {hasPolicyNotes && (
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-2.5 text-xs text-gray-700">
                  <h3 className="font-serif text-lg font-bold text-[#0B5E8E]">
                    Unit Policies &amp; Notes
                  </h3>
                  {(policies?.minStayNights || room.pricing?.minStayNights) && (
                    <p>
                      <strong>Minimum Stay:</strong>{' '}
                      {policies?.minStayNights || room.pricing?.minStayNights} nights
                    </p>
                  )}
                  {occ?.childAgePolicy && (
                    <p>
                      <strong>Child Age Policy:</strong> {occ.childAgePolicy}
                    </p>
                  )}
                  {occ?.additionalGuestChargeNote && (
                    <p>
                      <strong>Additional Guests:</strong> {occ.additionalGuestChargeNote}
                    </p>
                  )}
                  {policies?.checkInRestrictions && (
                    <p>
                      <strong>Check-in Restrictions:</strong> {policies.checkInRestrictions}
                    </p>
                  )}
                  {policies?.cancellationPolicy && (
                    <p>
                      <strong>Cancellation Conditions:</strong> {policies.cancellationPolicy}
                    </p>
                  )}
                  {policies?.extraPersonPolicy && (
                    <p>
                      <strong>Extra-Person Policy:</strong> {policies.extraPersonPolicy}
                    </p>
                  )}
                  {(policies?.accessibilityInfo || accessFeatures.length > 0) && (
                    <p>
                      <strong>Accessibility:</strong>{' '}
                      {[policies?.accessibilityInfo, ...accessFeatures].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {policies?.otherRestrictions && (
                    <p>
                      <strong>Notes:</strong> {policies.otherRestrictions}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Pricing & Interactive Stay Quote Checker */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/90 p-5 space-y-4 shadow-xs">
              <div className="border-b border-gray-100 pb-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Unit Rates
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      room.pricing?.rateStatus === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {room.pricing?.rateStatus === 'confirmed'
                      ? 'Published Rate'
                      : 'Provisional Guide Rate'}
                  </span>
                </div>

                {startingPrice !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-bold text-[#0B5E8E]">
                      From {formatCurrencyAmount(startingPrice, currency)}
                    </span>
                    <span className="text-xs text-gray-500">{priceUnitLabel}</span>
                  </div>
                ) : (
                  <div className="text-xl font-serif font-bold text-[#0B5E8E]">
                    Price on enquiry
                  </div>
                )}

                {typeof room.pricing?.weekendRateUSD === 'number' &&
                  room.pricing.weekendRateUSD > 0 && (
                    <p className="text-[11px] text-gray-600">
                      Weekend rate: {formatCurrencyAmount(room.pricing.weekendRateUSD, currency)} / night
                    </p>
                  )}
                {(room.pricing?.rateValidFrom || room.pricing?.rateValidTo) && (
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#C9A66B]" />
                    <span>
                      Rate validity: {room.pricing?.rateValidFrom || 'Now'} to{' '}
                      {room.pricing?.rateValidTo || 'Further notice'}
                    </span>
                  </p>
                )}
              </div>

              {/* Seasonal Rates Table if defined */}
              {seasonalRates.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B5E8E] block">
                    Seasonal Rates
                  </span>
                  <div className="space-y-1">
                    {seasonalRates.map((sr) => (
                      <div
                        key={sr.id}
                        className="flex items-center justify-between gap-2 text-[11px] bg-[#FAF9F6] px-2.5 py-1.5 rounded-lg border border-gray-200/70"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-800 block truncate">
                            {sr.label}
                          </span>
                          <span className="text-gray-500">
                            {sr.startDate} – {sr.endDate}
                          </span>
                        </div>
                        <span className="font-bold text-[#0B5E8E] shrink-0">
                          {formatCurrencyAmount(sr.nightlyRateUSD, currency)}/nt
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Check Dates & Estimate */}
              <div className="space-y-3 pt-1">
                <DateRangeCalendar
                  value={dateRange}
                  onChange={setDateRange}
                  label="Check Indicative Rate for Your Dates"
                />

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <label className="block">
                    <span className="font-bold text-gray-700 block mb-1">Adults</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={adults}
                      onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-gray-300 bg-white"
                    />
                  </label>
                  <label className="block">
                    <span className="font-bold text-gray-700 block mb-1">Children</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-gray-300 bg-white"
                    />
                  </label>
                </div>

                {mealPlans.length > 0 && (
                  <label className="block text-xs">
                    <span className="font-bold text-gray-700 block mb-1">Meal Plan Option</span>
                    <select
                      value={selectedMealPlanId}
                      onChange={(e) => setSelectedMealPlanId(e.target.value)}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-gray-300 bg-white"
                    >
                      <option value="">Room standard basis</option>
                      {mealPlans.map((mp) => (
                        <option key={mp.id} value={mp.id}>
                          {mp.name}
                          {mp.supplementPerPersonPerNightUSD > 0
                            ? ` (+${formatCurrencyAmount(mp.supplementPerPersonPerNightUSD, currency)} ${
                                mp.pricingType === 'per_unit_per_night' ? '/unit' : '/person'
                              }/nt)`
                            : ' (Included)'}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {ratePlans.length > 0 && (
                  <label className="block text-xs">
                    <span className="font-bold text-gray-700 block mb-1">
                      Rate Plan / Visitor Market
                    </span>
                    <select
                      value={selectedRatePlanId}
                      onChange={(e) => setSelectedRatePlanId(e.target.value)}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-gray-300 bg-white"
                    >
                      <option value="">Standard unit rate</option>
                      {ratePlans.map((rp) => {
                        const market = formatVisitorMarketLabel(rp.visitorMarket, rp.customMarketLabel);
                        const board = formatBoardBasisLabel(rp.boardBasis);
                        const basis = formatPriceBasisLabel(rp.priceBasis, rp.customBasisLabel);
                        const amt =
                          typeof rp.amountUSD === 'number' && rp.amountUSD > 0
                            ? `${formatCurrencyAmount(rp.amountUSD, currency)} ${basis}`
                            : 'Rate on enquiry';
                        return (
                          <option key={rp.id} value={rp.id}>
                            {[rp.internalRateName, market, board, amt].filter(Boolean).join(' · ')}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                )}

                {quote && (
                  <div className="rounded-xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-gray-700">
                        {quote.mode === 'quoted' ? 'Indicative Stay Estimate' : 'Rate Guide'}
                      </span>
                      <span className="font-serif font-bold text-base text-[#0B5E8E] text-right">
                        {quote.label}
                      </span>
                    </div>
                    {quote.minStayNotice && (
                      <p className="text-[11px] text-amber-800 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{quote.minStayNotice}</span>
                      </p>
                    )}
                    {quote.validityNotice && (
                      <p className="text-[11px] text-amber-800 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{quote.validityNotice}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-gray-500 flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#C9A66B]" />
                      <span>{quote.disclaimer}</span>
                    </p>
                  </div>
                )}
              </div>

              {unitOffers.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E67E22] block">
                    Eligible Special Offers
                  </span>
                  {unitOffers.map((off) => (
                    <div
                      key={off.id}
                      className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-[#0B5E8E]">{off.title}</strong>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E67E22] text-white shrink-0">
                          {getOfferDisplayBadge(off, currency)}
                        </span>
                      </div>
                      {off.description && <p className="text-gray-700">{off.description}</p>}
                      <button
                        type="button"
                        onClick={() =>
                          onEnquireRoom(room, {
                            offer: off,
                            visitorMarket: activeRatePlan?.visitorMarket,
                            checkIn: dateRange.checkIn,
                            checkOut: dateRange.checkOut,
                            adults,
                            childrenCount,
                            mealPlanId: selectedMealPlanId || undefined,
                          })
                        }
                        className="text-[11px] font-bold text-[#0B5E8E] hover:text-[#E67E22] underline cursor-pointer"
                      >
                        {off.ctaLabel || 'Enquire About This Offer'} &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  onEnquireRoom(room, {
                    visitorMarket: activeRatePlan?.visitorMarket,
                    checkIn: dateRange.checkIn,
                    checkOut: dateRange.checkOut,
                    adults,
                    childrenCount,
                    mealPlanId: selectedMealPlanId || undefined,
                  })
                }
                className="w-full min-h-[48px] bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {room.customCtaLabel ||
                    (room.isEntireProperty ? 'Enquire About This Stay' : 'Enquire About This Room')}
                </span>
              </button>

              <p className="text-[11px] text-center text-gray-500 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3F6B3C]" />
                <span>Direct concierge enquiry — no obligation</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && gallery.length > 0 && (
        <GalleryLightbox
          images={gallery.map((g) => g.url)}
          metadata={gallery.map((g) => ({ alt: g.alt, caption: g.caption }))}
          initialIndex={activeImageIdx}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};
