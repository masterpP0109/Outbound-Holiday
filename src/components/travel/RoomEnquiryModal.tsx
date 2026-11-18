import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { Currency } from '../../types';
import type { AccommodationOffer, DetailedAccommodation, RoomType } from '../../types/content';
import { submitForm } from '../../runtime/api';
import { trackEnquiryEvent } from '../../utils/analytics';
import { formatCurrencyAmount } from '../../utils/currency';
import {
  buildDirectEnquiryEmail,
  buildDirectEnquiryWhatsAppUrl,
  isValidEmail,
  isValidPhone,
  type DirectEnquiryContext,
} from '../../utils/enquiry';
import {
  calculateRoomStayQuote,
  formatBoardBasisLabel,
  formatPriceBasisLabel,
  formatVisitorMarketLabel,
  getPublishedRoomTypes,
  getRoomRatePlans,
  isOfferWithinDateWindow,
  isSingleEntireHomeProperty,
} from '../../utils/roomPricing';
import { WhatsAppIcon } from '../common/WhatsAppButton';
import { calculateNights } from './DateRangeCalendar';

export interface RoomEnquiryInitialState {
  property: DetailedAccommodation;
  room: RoomType | null;
  offer?: AccommodationOffer | null;
  ratePlanId?: string;
  ratePlanLabel?: string;
  visitorMarket?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  childrenCount?: number;
  mealPlanId?: string;
}

interface RoomEnquiryModalProps {
  target: RoomEnquiryInitialState | null;
  currency: Currency;
  onClose: () => void;
}

function getTodayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const RoomEnquiryModal: React.FC<RoomEnquiryModalProps> = ({
  target,
  currency,
  onClose,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const todayIso = useMemo(() => getTodayIso(), []);

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [childAges, setChildAges] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedMealPlanId, setSelectedMealPlanId] = useState('');
  const [selectedRatePlanId, setSelectedRatePlanId] = useState('');
  const [activeOffer, setActiveOffer] = useState<AccommodationOffer | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `room-enq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  useEffect(() => {
    if (!target) return;
    setCheckInDate(target.checkIn || '');
    setCheckOutDate(target.checkOut || '');
    setAdults(Math.max(1, target.adults ?? 2));
    const cCount = Math.max(0, target.childrenCount ?? 0);
    setChildrenCount(cCount);
    setChildAges(Array.from({ length: cCount }, () => ''));
    setSelectedRoomId(target.room?.id || target.room?.name || '');
    setSelectedMealPlanId(target.mealPlanId || '');
    setSelectedRatePlanId(target.ratePlanId || '');
    setActiveOffer(target.offer ?? null);
    setFormError(null);
    setSubmittedRef(null);
    setIdempotencyKey(
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `room-enq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    );

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
  }, [target, onClose]);

  const handleChildrenCountChange = (nextCount: number) => {
    const clamped = Math.max(0, Math.min(10, nextCount));
    setChildrenCount(clamped);
    setChildAges((prev) => {
      if (clamped === prev.length) return prev;
      if (clamped < prev.length) return prev.slice(0, clamped);
      return [...prev, ...Array.from({ length: clamped - prev.length }, () => '')];
    });
  };

  const nights = calculateNights(checkInDate, checkOutDate);

  const activeRoom = useMemo(() => {
    if (!target) return null;
    const allUnits = getPublishedRoomTypes(target.property);
    if (selectedRoomId) {
      return (
        allUnits.find((u) => u.id === selectedRoomId || u.name === selectedRoomId) || target.room
      );
    }
    return target.room;
  }, [target, selectedRoomId]);

  const availableRatePlans = useMemo(() => {
    if (!target || !activeRoom) return [];
    return getRoomRatePlans(activeRoom, target.property);
  }, [target, activeRoom]);

  const activeRatePlan = useMemo(
    () => availableRatePlans.find((rp) => rp.id === selectedRatePlanId),
    [availableRatePlans, selectedRatePlanId]
  );

  const quote = useMemo(() => {
    if (!target) return null;
    if (activeRoom) {
      return calculateRoomStayQuote({
        room: activeRoom,
        property: target.property,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: {
          adults,
          children: childAges.map((ageStr, idx) => {
            const num = Number(ageStr);
            return {
              id: `c-${idx}`,
              ageCategory: !Number.isNaN(num) && num >= 11 ? ('11-plus' as const) : ('under-11' as const),
            };
          }),
        },
        mealPlanId: selectedMealPlanId || undefined,
        ratePlanId: selectedRatePlanId || undefined,
        visitorMarket: activeRatePlan?.visitorMarket || target.visitorMarket,
        currency,
      });
    }
    const baseUsd =
      typeof target.property.priceFromUSD === 'number' && target.property.priceFromUSD > 0
        ? target.property.priceFromUSD
        : null;
    return {
      mode: baseUsd ? ('starting' as const) : ('enquiry' as const),
      label: baseUsd ? `From ${formatCurrencyAmount(baseUsd, currency)} / night` : 'Price on enquiry',
      disclaimer: 'Provisional guide rate — availability and final rates confirmed by our specialists.',
      minStayNotice: null,
      validityNotice: null,
    };
  }, [target, activeRoom, checkInDate, checkOutDate, adults, childAges, selectedMealPlanId, selectedRatePlanId, activeRatePlan, currency]);

  if (!target) return null;

  const { property } = target;
  const offer = activeOffer;
  const effectiveVisitorMarket = activeRatePlan
    ? formatVisitorMarketLabel(activeRatePlan.visitorMarket, activeRatePlan.customMarketLabel)
    : target.visitorMarket;
  const effectiveRatePlanLabel = activeRatePlan
    ? [
        activeRatePlan.internalRateName,
        formatVisitorMarketLabel(activeRatePlan.visitorMarket, activeRatePlan.customMarketLabel),
        formatBoardBasisLabel(activeRatePlan.boardBasis),
      ]
        .filter(Boolean)
        .join(' · ')
    : target.ratePlanLabel;
  const room = activeRoom;
  const availableUnits = getPublishedRoomTypes(property);
  const singleHome = isSingleEntireHomeProperty(property);
  const roomName = room?.name || 'Best available / Property stay enquiry';
  const mealPlans = room?.pricing?.mealPlanRates ?? [];
  const selectedMealPlanName =
    mealPlans.find((m) => m.id === selectedMealPlanId || m.name === selectedMealPlanId)?.name || '';

  const formattedDates =
    checkInDate && checkOutDate
      ? `${checkInDate} to ${checkOutDate}${nights > 0 ? ` (${nights} ${nights === 1 ? 'night' : 'nights'})` : ''}`
      : checkInDate
      ? `Check-in ${checkInDate}`
      : 'Flexible dates';

  const formattedChildAges = childAges.map((age, idx) =>
    age.trim() ? `Child ${idx + 1}: ${age.trim()} yrs` : `Child ${idx + 1}: Age TBC`
  );

  const guestSummary =
    childrenCount > 0
      ? `${adults} ${adults === 1 ? 'Adult' : 'Adults'}, ${childrenCount} ${
          childrenCount === 1 ? 'Child' : 'Children'
        }`
      : `${adults} ${adults === 1 ? 'Adult' : 'Adults'}`;

  const enableWhatsApp = property.enquirySettings?.enableWhatsApp !== false;
  const enableEmail = property.enquirySettings?.enableEmail !== false;

  const buildContext = (): DirectEnquiryContext => ({
    category: room ? 'room' : 'accommodation',
    propertyName: property.name,
    roomId: room?.id,
    roomType: roomName,
    mealPlan: selectedMealPlanName || undefined,
    ratePlanId: selectedRatePlanId || activeRatePlan?.id || undefined,
    ratePlan: effectiveRatePlanLabel || undefined,
    offerId: offer?.id,
    offerName: offer?.title,
    visitorMarket: effectiveVisitorMarket,
    dates: formattedDates,
    checkInDate: checkInDate || undefined,
    checkOutDate: checkOutDate || undefined,
    guests: guestSummary,
    childAges: formattedChildAges,
    customerName: customerName.trim() || undefined,
    customerEmail: email.trim() || undefined,
    customerPhone: whatsappNumber.trim() || undefined,
    estimatedPrice: quote?.label,
    notes: specialRequests.trim() || undefined,
    sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  const validateDates = (): string | null => {
    if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
      return 'Check-out date must be after check-in date.';
    }
    if (offer && !isOfferWithinDateWindow(offer, { checkIn: checkInDate || undefined, checkOut: checkOutDate || undefined })) {
      return `The offer "${offer.title}" is valid ${offer.validFrom || 'now'} to ${offer.validTo || 'further notice'} and does not cover the selected dates.`;
    }
    return null;
  };

  const validateContact = (requireEmail: boolean): string | null => {
    const dateErr = validateDates();
    if (dateErr) return dateErr;
    if (!customerName.trim()) {
      return 'Please enter your name.';
    }
    const cleanEmail = email.trim();
    const cleanPhone = whatsappNumber.trim();
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return 'Please enter a valid email address.';
    }
    if (requireEmail && !cleanEmail && !cleanPhone) {
      return 'Please enter your email address or WhatsApp number.';
    }
    if (!cleanEmail && cleanPhone && !isValidPhone(cleanPhone)) {
      return 'Please enter a valid WhatsApp number (at least 7 digits).';
    }
    return null;
  };

  const buildServerPayload = (channel: 'whatsapp' | 'email') => ({
    type: 'accommodation-enquiry',
    idempotencyKey,
    website: honeypot,
    fullName: customerName.trim(),
    email: email.trim(),
    phone: whatsappNumber.trim(),
    adultsCount: adults,
    kidsCount: childrenCount,
    nightsCount: Math.max(1, nights || 1),
    childAges: formattedChildAges,
    propertyName: property.name,
    accommodationId: property.slug || property.id,
    roomId: room?.id || '',
    roomType: roomName,
    mealPlanId: selectedMealPlanId || '',
    mealPlan: selectedMealPlanName,
    ratePlanId: selectedRatePlanId || activeRatePlan?.id || '',
    ratePlanName: effectiveRatePlanLabel || '',
    offerId: offer?.id || '',
    offerName: offer?.title || '',
    visitorMarket: effectiveVisitorMarket || '',
    checkInDate,
    checkOutDate,
    estimatedPriceLabel: quote?.label || 'Price on enquiry',
    preferredChannel: channel,
    sourcePageUrl: typeof window !== 'undefined' ? window.location.href : '',
    subject: room
      ? `Room Enquiry — ${property.name} — ${room.name}`
      : `Accommodation Enquiry — ${property.name}`,
    notes: specialRequests.trim(),
  });

  const handleSendWhatsApp = () => {
    setFormError(null);
    const dateErr = validateDates();
    if (dateErr) {
      setFormError(dateErr);
      return;
    }

    const ctx = buildContext();
    trackEnquiryEvent('enquiry_whatsapp_selected', {
      category: ctx.category,
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : property.slug,
      itemLabel: `${roomName} · ${property.name}`,
    });

    if (customerName.trim() && (isValidEmail(email) || isValidPhone(whatsappNumber))) {
      void submitForm('enquiries', buildServerPayload('whatsapp'), idempotencyKey).catch(() => {});
    }

    const url = buildDirectEnquiryWhatsAppUrl(ctx);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const err = validateContact(true);
    if (err) {
      setFormError(err);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitForm('enquiries', buildServerPayload('email'), idempotencyKey);
      trackEnquiryEvent('enquiry_email_selected', {
        category: room ? 'room' : 'accommodation',
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : property.slug,
        itemLabel: `${roomName} · ${property.name}`,
      });
      setSubmittedRef(res.reference || 'Enquiry Received');
    } catch {
      const mailData = buildDirectEnquiryEmail(buildContext());
      if (mailData) {
        window.location.href = mailData.mailtoUrl;
        setSubmittedRef('Email draft opened');
      } else {
        setFormError(
          'We could not submit your email enquiry right now. Please try Send via WhatsApp instead.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-enquiry-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl border border-gray-200 shadow-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden"
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 px-5 sm:px-7 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] px-3 py-0.5 text-[11px] font-bold mb-1 max-w-full truncate">
              {property.name}
            </span>
            <h2
              id="room-enquiry-modal-title"
              className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E] leading-tight break-words"
            >
              {room ? `Enquire About ${room.name}` : `Enquire About ${property.name}`}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close room enquiry form"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          {/* Selected Unit + Displayed Pricing Banner */}
          <div className="rounded-2xl bg-[#FAF9F6] border border-gray-200 p-4 space-y-1.5">
            {offer && (
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-[#E67E22]">
                <span>Special Offer: {offer.title}</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveOffer(null);
                    setFormError(null);
                  }}
                  className="text-[10px] underline font-semibold text-gray-500 hover:text-gray-800 normal-case cursor-pointer"
                >
                  Remove offer
                </button>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-[#0B5E8E] block">{roomName}</span>
                {effectiveRatePlanLabel && (
                  <span className="text-[11px] text-gray-600 block">
                    Rate Plan: {effectiveRatePlanLabel}
                  </span>
                )}
              </div>
              <span className="font-serif font-bold text-base text-[#0B5E8E]">
                {quote?.label || 'Price on enquiry'}
              </span>
            </div>
            {availableUnits.length > 1 && !singleHome && (
              <label className="block pt-1">
                <span className="text-[11px] font-bold text-gray-600 block mb-1">
                  Accommodation Unit Selection
                </span>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full min-h-[38px] px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs text-gray-900"
                >
                  <option value="">Best available / Please advise</option>
                  {availableUnits.map((u) => (
                    <option key={u.id || u.name} value={u.id || u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {quote?.minStayNotice && (
              <p className="text-[11px] text-amber-800">{quote.minStayNotice}</p>
            )}
            {quote?.validityNotice && (
              <p className="text-[11px] text-amber-800">{quote.validityNotice}</p>
            )}
            <p className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A66B] shrink-0 mt-0.5" />
              <span>
                {property.enquirySettings?.customEnquiryNote ||
                  'Enquiry only — not a confirmed booking. A local specialist will confirm availability and final rates.'}
              </span>
            </p>
          </div>

          {submittedRef ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-[#0B5E8E]">
                Enquiry Sent Successfully
              </h3>
              <p className="text-xs sm:text-sm text-gray-700">
                Reference: <strong>{submittedRef}</strong>
              </p>
              <p className="text-xs text-gray-600">
                Our Victoria Falls team has received your enquiry for{' '}
                <strong>{roomName}</strong> at <strong>{property.name}</strong> and will reply
                shortly with confirmed availability and rates.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendEmail} className="space-y-4 text-xs" noValidate>
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />

              <div>
                <label
                  htmlFor="room-enq-name"
                  className="block font-bold text-gray-700 mb-1"
                >
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="room-enq-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="room-enq-email"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="room-enq-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="room-enq-whatsapp"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    WhatsApp Number
                  </label>
                  <input
                    id="room-enq-whatsapp"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+263 77 123 4567"
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="room-enq-checkin"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    Check-in Date
                  </label>
                  <input
                    id="room-enq-checkin"
                    type="date"
                    min={todayIso}
                    value={checkInDate}
                    onChange={(e) => {
                      const nextIn = e.target.value;
                      setCheckInDate(nextIn);
                      if (checkOutDate && nextIn && checkOutDate <= nextIn) {
                        setCheckOutDate('');
                      }
                    }}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="room-enq-checkout"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    Check-out Date
                  </label>
                  <input
                    id="room-enq-checkout"
                    type="date"
                    min={checkInDate || todayIso}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="room-enq-adults"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    Number of Adults
                  </label>
                  <input
                    id="room-enq-adults"
                    type="number"
                    min={1}
                    max={20}
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="room-enq-children"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    Number of Children
                  </label>
                  <input
                    id="room-enq-children"
                    type="number"
                    min={0}
                    max={10}
                    value={childrenCount}
                    onChange={(e) => handleChildrenCountChange(Number(e.target.value) || 0)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                </div>
              </div>

              {childrenCount > 0 && (
                <div className="rounded-xl bg-[#FAF9F6] border border-gray-200 p-3.5 space-y-2">
                  <span className="block font-bold text-[#0B5E8E]">
                    Children&apos;s Ages (at time of travel)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {childAges.map((age, idx) => (
                      <label key={idx} className="block">
                        <span className="text-[11px] text-gray-600 block mb-0.5">
                          Child {idx + 1} Age
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={17}
                          placeholder="e.g. 7"
                          value={age}
                          onChange={(e) => {
                            const val = e.target.value;
                            setChildAges((prev) => prev.map((v, i) => (i === idx ? val : v)));
                          }}
                          className="w-full min-h-[38px] px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {availableRatePlans.length > 0 && (
                <div>
                  <label
                    htmlFor="room-enq-rateplan"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    Rate Plan / Visitor Market
                  </label>
                  <select
                    id="room-enq-rateplan"
                    value={selectedRatePlanId}
                    onChange={(e) => setSelectedRatePlanId(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="">Standard unit rate</option>
                    {availableRatePlans.map((rp) => {
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
                </div>
              )}

              {mealPlans.length > 0 && (
                <div>
                  <label
                    htmlFor="room-enq-mealplan"
                    className="block font-bold text-gray-700 mb-1"
                  >
                    Meal Plan Preference
                  </label>
                  <select
                    id="room-enq-mealplan"
                    value={selectedMealPlanId}
                    onChange={(e) => setSelectedMealPlanId(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="">Standard unit inclusion</option>
                    {mealPlans.map((mp) => (
                      <option key={mp.id} value={mp.id}>
                        {mp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="room-enq-notes"
                  className="block font-bold text-gray-700 mb-1"
                >
                  Optional Special Requests
                </label>
                <textarea
                  id="room-enq-notes"
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Bed preference, airport transfers, dietary needs, celebrations..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {enableWhatsApp && (
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm px-4 py-3 shadow-xs transition-colors cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 shrink-0" />
                    <span>Send via WhatsApp</span>
                  </button>
                )}

                {enableEmail && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-sm px-4 py-3 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>{submitting ? 'Sending...' : 'Send via Email'}</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
