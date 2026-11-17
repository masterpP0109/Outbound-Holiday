import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppButton';
import { ShareButton } from '../common/ShareButton';
import { GuestSelectionModal } from './GuestSelectionModal';
import {
  calculateNights,
  DateRangeCalendar,
  formatDisplayDate,
  type DateRangeValue,
} from './DateRangeCalendar';
import {
  CURRENCY_DISCLAIMER,
  buildDirectEnquiryWhatsAppUrl,
  calculateAccommodationEstimate,
  calculateActivityEstimate,
  calculatePackageEstimate,
  formatChildBreakdown,
  formatCurrencyAmount,
  formatGuestSummary,
  getConfiguredContactEmail,
  isValidEmail,
  isValidPhone,
  type DirectEnquiryContext,
  type GuestSelection,
} from '../../utils/enquiry';
import type { Currency } from '../../types';
import type { RoomType } from '../../types/content';
import { calculateRoomStayQuote, getRoomStartingPriceUSD } from '../../utils/roomPricing';
import { submitForm } from '../../runtime/api';
import { trackEnquiryEvent } from '../../utils/analytics';

export interface UnifiedExtraOption {
  id: string;
  label: string;
  pricePerPersonUSD?: number;
}

export interface UnifiedRoomOption {
  id?: string;
  name: string;
  occupancy?: string;
  maxGuests?: number;
  pricePerNightUSD?: number | null;
  room?: RoomType;
}

export interface UnifiedEnquiryPanelProps {
  mode: 'activity' | 'package' | 'accommodation';
  currency?: Currency;
  itemTitle: string;
  itemSlug: string;
  basePriceUSD?: number | null;
  priceLabelPrefix?: string;
  priceSuffix?: string;
  durationLabel?: string;
  fixedDurationNights?: number | null;
  childRateUnder11USD?: number | null;
  childRate11PlusUSD?: number | null;
  minimumAge?: number | null;
  ageNotice?: string | null;
  maxGuests?: number;
  extras?: UnifiedExtraOption[];
  roomOptions?: UnifiedRoomOption[];
  selectedRoomName?: string;
  onSelectedRoomChange?: (roomName: string) => void;
  pricingBasis?: 'per_room' | 'per_unit' | 'per_person';
  unavailableDates?: string[];
  trustTitle?: string;
  trustBody?: string;
  whatsappButtonLabel?: string;
  emailButtonLabel?: string;
  onBuildHoliday?: () => void;
  buildHolidayLabel?: string;
}

function getTodayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysIso(iso: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, '0');
  const nd = String(dt.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

export const UnifiedEnquiryPanel: React.FC<UnifiedEnquiryPanelProps> = ({
  mode,
  currency = 'USD',
  itemTitle,
  itemSlug,
  basePriceUSD,
  priceLabelPrefix = 'From',
  priceSuffix = 'per person',
  durationLabel,
  fixedDurationNights,
  childRateUnder11USD,
  childRate11PlusUSD,
  minimumAge,
  ageNotice,
  maxGuests = 20,
  extras = [],
  roomOptions = [],
  selectedRoomName,
  onSelectedRoomChange,
  pricingBasis = 'per_room',
  unavailableDates,
  trustTitle = 'Direct Local Victoria Falls Team',
  trustBody = 'Enquiries go directly to our Victoria Falls specialists. Submitting an enquiry does not constitute a confirmed booking.',
  whatsappButtonLabel = 'Enquire via WhatsApp',
  emailButtonLabel = 'Send Email Enquiry',
  onBuildHoliday,
  buildHolidayLabel = 'Build My Holiday',
}) => {
  const todayIso = useMemo(() => getTodayIso(), []);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guests, setGuests] = useState<GuestSelection>({
    adults: 2,
    children: [],
  });

  // Dates
  const [activityDate, setActivityDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [stayRange, setStayRange] = useState<DateRangeValue>({
    checkIn: '',
    checkOut: '',
  });

  // Accommodation room & count
  const [internalRoom, setInternalRoom] = useState(
    roomOptions[0]?.name || 'Best available / Please advise'
  );
  const activeRoom = selectedRoomName ?? internalRoom;
  const setActiveRoom = (val: string) => {
    setInternalRoom(val);
    onSelectedRoomChange?.(val);
  };
  const [roomsCount, setRoomsCount] = useState(1);

  // Extras
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);

  // Client details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [honeypot, setHoneypot] = useState('');

  // Submission state + stable idempotency key per enquiry session
  const [idempotencyKey] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `enq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const totalGuests = guests.adults + guests.children.length;
  const stayNights = calculateNights(stayRange.checkIn, stayRange.checkOut);
  const packageNights =
    arrivalDate && departureDate
      ? calculateNights(arrivalDate, departureDate)
      : fixedDurationNights || 3;

  const selectedRoomObj = roomOptions.find((r) => r.name === activeRoom);
  const effectiveMaxCapacity =
    mode === 'accommodation' && selectedRoomObj?.maxGuests
      ? selectedRoomObj.maxGuests * roomsCount
      : maxGuests;

  const capacityWarning =
    totalGuests > effectiveMaxCapacity
      ? `Selected group (${totalGuests} guests) exceeds the maximum capacity (${effectiveMaxCapacity}) for the current selection. Please add another room or contact us for family/group arrangements.`
      : null;

  const computedAgeNotice = useMemo(() => {
    if (ageNotice) return ageNotice;
    if (
      minimumAge &&
      guests.children.some((c) => c.ageCategory === 'under-11')
    ) {
      return `Please note: this activity has a minimum age requirement (${minimumAge}+). Under-11 participants may not be eligible.`;
    }
    return null;
  }, [ageNotice, minimumAge, guests.children]);

  const extrasPerPersonUSD = useMemo(
    () =>
      extras
        .filter((ex) => selectedExtraIds.includes(ex.id))
        .reduce((sum, ex) => sum + (ex.pricePerPersonUSD || 0), 0),
    [extras, selectedExtraIds]
  );

  const selectedExtraLabels = useMemo(
    () =>
      extras
        .filter((ex) => selectedExtraIds.includes(ex.id))
        .map((ex) => ex.label),
    [extras, selectedExtraIds]
  );

  const estimate = useMemo(() => {
    if (mode === 'activity') {
      return calculateActivityEstimate({
        basePriceUSD,
        guests,
        childRateUnder11USD,
        childRate11PlusUSD,
        extrasPerPersonUSD,
        minimumAge,
        currency,
      });
    }
    if (mode === 'package') {
      return calculatePackageEstimate({
        basePricePerAdultUSD: basePriceUSD,
        guests,
        childRateUnder11USD,
        childRate11PlusUSD,
        currency,
      });
    }
    if (selectedRoomObj?.room?.pricing) {
      const q = calculateRoomStayQuote({
        room: selectedRoomObj.room,
        checkIn: stayRange.checkIn,
        checkOut: stayRange.checkOut,
        guests,
        roomsCount,
        currency,
      });
      return {
        amount: q.totalUSD,
        label: q.label,
        isProvisional: true,
        disclaimer: q.minStayNotice
          ? `${q.minStayNotice} ${q.disclaimer}`
          : q.validityNotice
          ? `${q.validityNotice} ${q.disclaimer}`
          : q.disclaimer,
      };
    }
    if (selectedRoomObj?.room && !selectedRoomObj.room.pricing) {
      const roomStarting = getRoomStartingPriceUSD(selectedRoomObj.room);
      if (roomStarting === null && selectedRoomObj.pricePerNightUSD === null) {
        return {
          amount: null,
          label: 'Price available on enquiry',
          isProvisional: true,
          disclaimer: 'Price available on enquiry — final rate confirmed by property.',
        };
      }
    }
    return calculateAccommodationEstimate({
      nightlyRateUSD:
        selectedRoomObj?.pricePerNightUSD !== undefined
          ? selectedRoomObj.pricePerNightUSD
          : basePriceUSD,
      nights: stayNights,
      roomsCount,
      guests,
      pricingBasis,
      childRateUnder11USD,
      currency,
    });
  }, [
    mode,
    basePriceUSD,
    guests,
    childRateUnder11USD,
    childRate11PlusUSD,
    extrasPerPersonUSD,
    minimumAge,
    selectedRoomObj,
    stayRange.checkIn,
    stayRange.checkOut,
    stayNights,
    roomsCount,
    pricingBasis,
    currency,
  ]);

  const formattedDates = useMemo(() => {
    if (mode === 'activity') {
      return activityDate ? formatDisplayDate(activityDate) : 'Flexible';
    }
    if (mode === 'package') {
      if (arrivalDate && departureDate) {
        return `${formatDisplayDate(arrivalDate)} to ${formatDisplayDate(departureDate)}`;
      }
      if (arrivalDate) return `From ${formatDisplayDate(arrivalDate)}`;
      return 'Flexible';
    }
    if (stayRange.checkIn && stayRange.checkOut) {
      return `${formatDisplayDate(stayRange.checkIn)} to ${formatDisplayDate(stayRange.checkOut)} (${stayNights} ${stayNights === 1 ? 'night' : 'nights'})`;
    }
    return 'Flexible';
  }, [mode, activityDate, arrivalDate, departureDate, stayRange, stayNights]);

  const childBreakdown = formatChildBreakdown(guests.children);

  const buildContext = (): DirectEnquiryContext => ({
    category:
      mode === 'activity'
        ? 'experience'
        : mode === 'package'
        ? 'package'
        : activeRoom && activeRoom !== 'Best available / Please advise'
        ? 'room'
        : 'accommodation',
    propertyName: mode === 'accommodation' ? itemTitle : undefined,
    roomId: mode === 'accommodation' ? selectedRoomObj?.id : undefined,
    roomType: mode === 'accommodation' ? activeRoom : undefined,
    roomsCount: mode === 'accommodation' ? roomsCount : undefined,
    packageName: mode === 'package' ? itemTitle : undefined,
    activityName: mode === 'activity' ? itemTitle : undefined,
    dates: formattedDates,
    guests: formatGuestSummary(guests),
    childAges: childBreakdown,
    customerName: fullName.trim() || undefined,
    customerEmail: email.trim() || undefined,
    customerPhone: phone.trim() || undefined,
    country: country.trim() || undefined,
    extras: selectedExtraLabels,
    estimatedPrice: estimate.label,
    notes: specialRequests.trim() || undefined,
    sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  const validateForSubmission = (requireContact: boolean): string | null => {
    if (mode === 'package' && arrivalDate && departureDate && departureDate < arrivalDate) {
      return 'Departure date cannot be earlier than arrival date.';
    }
    if (mode === 'accommodation' && stayRange.checkIn && !stayRange.checkOut) {
      return 'Please select a check-out date or reset your stay dates.';
    }
    if (requireContact) {
      if (!fullName.trim()) {
        return 'Please enter your full name.';
      }
      const hasEmail = email.trim().length > 0;
      const hasPhone = phone.trim().length > 0;
      if (hasEmail && !isValidEmail(email)) {
        return 'Please enter a valid email address.';
      }
      if (!hasEmail && !hasPhone) {
        return 'Please provide an email address or a WhatsApp/phone number.';
      }
      if (!hasEmail && hasPhone && !isValidPhone(phone)) {
        return 'Please enter a valid WhatsApp or phone number (at least 7 digits).';
      }
    }
    return null;
  };

  const buildServerPayload = (channel: 'whatsapp' | 'email') => ({
    type:
      mode === 'activity'
        ? 'activity-enquiry'
        : mode === 'package'
        ? 'package-enquiry'
        : 'accommodation-enquiry',
    idempotencyKey,
    website: honeypot,
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    country: country.trim(),
    adultsCount: guests.adults,
    kidsCount: guests.children.length,
    nightsCount: mode === 'accommodation' ? Math.max(1, stayNights) : packageNights,
    childAges: childBreakdown,
    propertyName: mode === 'accommodation' ? itemTitle : '',
    accommodationId: mode === 'accommodation' ? itemSlug : '',
    roomId: mode === 'accommodation' ? (selectedRoomObj?.id || '') : '',
    roomType: mode === 'accommodation' ? activeRoom : '',
    roomsCount: mode === 'accommodation' ? roomsCount : 1,
    packageName: mode === 'package' ? itemTitle : '',
    activityName: mode === 'activity' ? itemTitle : '',
    checkInDate: mode === 'accommodation' ? stayRange.checkIn : arrivalDate,
    checkOutDate: mode === 'accommodation' ? stayRange.checkOut : departureDate,
    preferredDate: mode === 'activity' ? activityDate : '',
    selectedExtras: selectedExtraLabels,
    estimatedPriceLabel: estimate.label,
    preferredChannel: channel,
    sourcePageUrl: typeof window !== 'undefined' ? window.location.href : '',
    subject: `${mode === 'activity' ? 'Activity' : mode === 'package' ? 'Package' : 'Accommodation'} Enquiry — ${itemTitle}`,
    notes: specialRequests.trim(),
  });

  const handleWhatsAppClick = () => {
    setFormError(null);
    const err = validateForSubmission(false);
    if (err) {
      setFormError(err);
      return;
    }

    const ctx = buildContext();
    trackEnquiryEvent('enquiry_whatsapp_selected', {
      category: ctx.category,
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : itemSlug,
      itemLabel: itemTitle,
    });

    // If visitor provided name + contact, log idempotently in WP Enquiries without blocking WhatsApp
    if (fullName.trim() && (isValidEmail(email) || isValidPhone(phone))) {
      void submitForm('enquiries', buildServerPayload('whatsapp'), idempotencyKey).catch(
        () => {
          /* Do not block WhatsApp redirect if background logging fails */
        }
      );
    }

    const url = buildDirectEnquiryWhatsAppUrl(ctx);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittedRef(null);

    const err = validateForSubmission(true);
    if (err) {
      setFormError(err);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitForm(
        'enquiries',
        buildServerPayload('email'),
        idempotencyKey
      );
      trackEnquiryEvent('enquiry_email_selected', {
        category: buildContext().category,
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : itemSlug,
        itemLabel: itemTitle,
      });
      setSubmittedRef(res.reference || 'Logged');
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'We could not send your email enquiry right now. Please try WhatsApp or try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const configuredEmail = getConfiguredContactEmail();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-lg space-y-5">
      {/* Header Price & Duration */}
      <div className="space-y-1 border-b border-gray-200 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {priceLabelPrefix}
        </span>
        <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0B5E8E]">
          {typeof basePriceUSD === 'number' && basePriceUSD > 0 ? (
            <>
              {formatCurrencyAmount(basePriceUSD, currency)}{' '}
              <span className="text-xs font-normal text-gray-500">{priceSuffix}</span>
            </>
          ) : (
            <span className="text-xl sm:text-2xl">Price available on enquiry</span>
          )}
        </div>
        {typeof basePriceUSD === 'number' && basePriceUSD > 0 && currency !== 'USD' && (
          <p className="text-[11px] text-gray-500 leading-snug pt-0.5">
            {CURRENCY_DISCLAIMER}
          </p>
        )}
        {durationLabel && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
            <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{durationLabel}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs" noValidate>
        {/* Honeypot anti-spam */}
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

        {/* Dates Section */}
        {mode === 'activity' && (
          <div>
            <label
              htmlFor={`activity-date-${itemSlug}`}
              className="block font-bold text-gray-700 mb-1"
            >
              Preferred Activity Date
            </label>
            <input
              id={`activity-date-${itemSlug}`}
              type="date"
              min={todayIso}
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
            />
          </div>
        )}

        {mode === 'package' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={`pkg-arrival-${itemSlug}`}
                className="block font-bold text-gray-700 mb-1"
              >
                Preferred Arrival
              </label>
              <input
                id={`pkg-arrival-${itemSlug}`}
                type="date"
                min={todayIso}
                value={arrivalDate}
                onChange={(e) => {
                  const nextArr = e.target.value;
                  setArrivalDate(nextArr);
                  if (fixedDurationNights && nextArr) {
                    setDepartureDate(addDaysIso(nextArr, fixedDurationNights));
                  } else if (departureDate && nextArr && departureDate < nextArr) {
                    setDepartureDate('');
                  }
                }}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
              />
            </div>
            <div>
              <label
                htmlFor={`pkg-departure-${itemSlug}`}
                className="block font-bold text-gray-700 mb-1"
              >
                Preferred Departure
              </label>
              <input
                id={`pkg-departure-${itemSlug}`}
                type="date"
                min={arrivalDate || todayIso}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
              />
            </div>
          </div>
        )}

        {mode === 'accommodation' && (
          <DateRangeCalendar
            value={stayRange}
            onChange={setStayRange}
            unavailableDates={unavailableDates}
            label="Check-in & Check-out Dates"
          />
        )}

        {/* Room Type & Room Count for Accommodation */}
        {mode === 'accommodation' && roomOptions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor={`room-select-${itemSlug}`}
                className="block font-bold text-gray-700 mb-1"
              >
                Room / Unit Type
              </label>
              <select
                id={`room-select-${itemSlug}`}
                value={activeRoom}
                onChange={(e) => setActiveRoom(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs bg-white"
              >
                {roomOptions.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                    {r.occupancy ? ` (${r.occupancy})` : ''}
                  </option>
                ))}
                <option value="Best available / Please advise">
                  Best available / Please advise
                </option>
              </select>
            </div>
            <div>
              <label
                htmlFor={`rooms-count-${itemSlug}`}
                className="block font-bold text-gray-700 mb-1"
              >
                Rooms / Units
              </label>
              <select
                id={`rooms-count-${itemSlug}`}
                value={roomsCount}
                onChange={(e) => setRoomsCount(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs bg-white"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Room' : 'Rooms'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Guest Selection Modal Trigger */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">
            Guests &amp; Child Ages
          </label>
          <button
            type="button"
            onClick={() => setGuestModalOpen(true)}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-300 hover:border-[#0B5E8E] bg-white text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <Users className="w-4 h-4 text-[#0B5E8E] shrink-0" />
              <span>{formatGuestSummary(guests)}</span>
            </span>
            <span className="text-[11px] font-bold text-[#0B5E8E]">Edit</span>
          </button>
          {childBreakdown.length > 0 && (
            <p className="text-[11px] text-gray-500 mt-1">
              {childBreakdown.join(' · ')}
            </p>
          )}
        </div>

        {/* Optional Extras */}
        {extras.length > 0 && (
          <div className="space-y-2">
            <span className="block font-bold text-gray-700">Optional Extras</span>
            {extras.map((ex) => {
              const checked = selectedExtraIds.includes(ex.id);
              return (
                <label
                  key={ex.id}
                  className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-[#FAF9F6] border border-gray-200"
                >
                  <span className="font-semibold text-gray-700">
                    {ex.label}
                    {ex.pricePerPersonUSD ? ` (+${formatCurrencyAmount(ex.pricePerPersonUSD, currency)}/pp)` : ''}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setSelectedExtraIds((prev) =>
                        e.target.checked
                          ? [...prev, ex.id]
                          : prev.filter((id) => id !== ex.id)
                      );
                    }}
                    className="w-4 h-4 accent-[#0B5E8E] cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        )}

        {/* Capacity or Age Warnings */}
        {(capacityWarning || computedAgeNotice) && (
          <div className="space-y-2">
            {capacityWarning && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{capacityWarning}</span>
              </div>
            )}
            {computedAgeNotice && (
              <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-900">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#0B5E8E] mt-0.5" />
                <span>{computedAgeNotice}</span>
              </div>
            )}
          </div>
        )}

        {/* Estimated Total Box */}
        <div className="p-3.5 rounded-xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-gray-700">Estimated Total</span>
            <span className="font-serif font-bold text-base text-[#0B5E8E] text-right">
              {estimate.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-500">{estimate.disclaimer}</p>
        </div>

        {/* Client Details */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <p className="font-bold text-gray-800 text-xs uppercase tracking-wider">
            Your Details
          </p>
          <div>
            <label
              htmlFor={`full-name-${itemSlug}`}
              className="block font-semibold text-gray-700 mb-1"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id={`full-name-${itemSlug}`}
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Moyo"
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={`email-${itemSlug}`}
                className="block font-semibold text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id={`email-${itemSlug}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
              />
            </div>
            <div>
              <label
                htmlFor={`phone-${itemSlug}`}
                className="block font-semibold text-gray-700 mb-1"
              >
                WhatsApp / Phone
              </label>
              <input
                id={`phone-${itemSlug}`}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+263 77..."
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`country-${itemSlug}`}
              className="block font-semibold text-gray-700 mb-1"
            >
              Country of Residence (Optional)
            </label>
            <input
              id={`country-${itemSlug}`}
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Zimbabwe, South Africa, UK"
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
            />
          </div>

          <div>
            <label
              htmlFor={`notes-${itemSlug}`}
              className="block font-semibold text-gray-700 mb-1"
            >
              Special Requests (Optional)
            </label>
            <textarea
              id={`notes-${itemSlug}`}
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Dietary needs, transfers, room preferences..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-gray-700">Preferred Contact:</span>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={`pref-contact-${itemSlug}`}
                  checked={preferredChannel === 'whatsapp'}
                  onChange={() => setPreferredChannel('whatsapp')}
                  className="accent-[#25D366]"
                />
                <span>WhatsApp</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={`pref-contact-${itemSlug}`}
                  checked={preferredChannel === 'email'}
                  onChange={() => setPreferredChannel('email')}
                  className="accent-[#0B5E8E]"
                />
                <span>Email</span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Error / Success */}
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {submittedRef && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold">Enquiry received (Ref: {submittedRef})</p>
              <p className="mt-0.5">
                Our Victoria Falls team has received your enquiry and will respond shortly.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="w-full min-h-[48px] bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm py-3.5 px-5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 shrink-0" />
            <span>{whatsappButtonLabel}</span>
          </button>

          {configuredEmail ? (
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] bg-[#0B5E8E] hover:bg-[#08486e] disabled:opacity-60 text-white font-bold text-sm py-3.5 px-5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>{submitting ? 'Sending Enquiry...' : emailButtonLabel}</span>
            </button>
          ) : (
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
              Email enquiries are currently unavailable; please use WhatsApp above.
            </p>
          )}

          {onBuildHoliday && (
            <button
              type="button"
              onClick={onBuildHoliday}
              className="w-full min-h-[40px] text-xs font-bold text-[#0B5E8E] hover:underline py-2 cursor-pointer"
            >
              Or {buildHolidayLabel} (Optional Itinerary Builder)
            </button>
          )}
        </div>
      </form>

      {/* Trust & Non-Booking Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-[#0B5E8E]">
          <ShieldCheck className="w-4 h-4 text-[#C9A66B] shrink-0" />
          <span>{trustTitle}</span>
        </div>
        <p className="text-gray-600 leading-relaxed text-[11px]">{trustBody}</p>
      </div>

      <ShareButton
        title={itemTitle}
        label="Share This Page"
        className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#0B5E8E] border-2 border-[#C9A66B]/70 hover:bg-[#FAF9F6] hover:border-[#C9A66B] font-bold text-xs sm:text-sm px-4 py-2.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
      />

      <GuestSelectionModal
        isOpen={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        value={guests}
        onChange={setGuests}
        maxGuests={effectiveMaxCapacity}
        capacityWarning={capacityWarning}
        ageNotice={computedAgeNotice}
      />
    </div>
  );
};
