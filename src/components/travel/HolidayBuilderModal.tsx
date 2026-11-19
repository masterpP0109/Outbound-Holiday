import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Hotel,
  Mail,
  MessageSquare,
  Plane,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { EnquiryConfirmation } from '../common/EnquiryConfirmation';
import { SubmissionSafety, useSubmission } from '../common/SubmissionSafety';
import { resolveAssetUrl } from '../../runtime/api';
import {
  ACTIVITIES_DATA,
  ALL_ACCOMMODATIONS,
  ALL_EXPERIENCES,
  BUILDER_CONFIG,
  STAY_TIERS,
  editorial,
  editorialValue,
  registerContent,
} from '../../runtime/catalog';
import type { TravelPackage } from '../../types';
import type { DetailedAccommodation } from '../../data/accommodationsData';
import type { DetailedPackage } from '../../data/packagesData';
import { getPriceUnitLabel } from '../../utils/accommodation';
import { trackEnquiryEvent } from '../../utils/analytics';
import {
  formatTimeSlotDisplayLabel,
  resolveBuilderAccommodations,
  resolveBuilderTransfers,
  resolveMatchingActivityId,
} from '../../utils/holidayCalculator';
import {
  getPublishedPropertyOffers,
  getPublishedRoomTypes,
  getRoomStartingPriceUSD,
  isOfferWithinDateWindow,
} from '../../utils/roomPricing';
import {
  buildPlannerPlanWhatsAppUrl,
  buildPlannerSubmissionPayload,
  buildQuickHelpWhatsAppUrl,
  clearTripPlanDraft,
  computeNightsBetweenDates,
  createEmptyTripPlanDraft,
  formatShortIsoDay,
  getApplicableActivityTimeOptions,
  getDefaultTimeForActivity,
  getTripCalendarDays,
  hasMeaningfulDraftContent,
  isActivityDateOutsideTrip,
  loadTripPlanDraft,
  resolveTripPlanContext,
  saveTripPlanDraft,
  type BuilderSectionId,
  type ReplyMethod,
  type SelectedPlanActivity,
  type StayArrangement,
  type TimingMode,
  type TransferArrangement,
  type TripPlanDraft,
} from '../../utils/tripPlanBuilder';
import { DateRangeCalendar, formatCompactCalendarRangeSummary } from './DateRangeCalendar';
import type { PreselectedStayDetails } from './PlanHolidayModal';

let outboundLogo: string | undefined;
registerContent(() => {
  outboundLogo = editorialValue('travel/HolidayBuilderModal.outboundLogo', {});
});

export { ACTIVITIES_DATA, STAY_TIERS } from '../../runtime/catalog';

interface HolidayBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPackage?: TravelPackage | DetailedPackage | null;
  preselectedActivity?: string | null;
  preselectedAccommodation?: DetailedAccommodation | null;
  preselectedStayDetails?: PreselectedStayDetails | null;
  preselectedPromotion?: { id: number; name: string } | null;
}

const SECTION_ITEMS: Array<{
  id: BuilderSectionId;
  label: string;
  shortLabel: string;
}> = [
  { id: 'dates-guests', label: 'Dates & guests', shortLabel: 'Dates' },
  { id: 'stay', label: 'Stay', shortLabel: 'Stay' },
  { id: 'activities', label: 'Activities', shortLabel: 'Activities' },
  { id: 'transfers', label: 'Transfers', shortLabel: 'Transfers' },
  { id: 'review', label: 'Review', shortLabel: 'Review' },
];

const ACTIVITY_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'recommended', label: 'Recommended' },
  { id: 'river', label: 'Zambezi River' },
  { id: 'wildlife', label: 'Safari & Wildlife' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'first-visit', label: 'First Visit' },
  { id: 'culture', label: 'Dining & Culture' },
  { id: 'day-trips', label: 'Day Trips' },
];

export const HolidayBuilderModal: React.FC<HolidayBuilderModalProps> = ({
  isOpen,
  onClose,
  preselectedPackage,
  preselectedActivity,
  preselectedAccommodation,
  preselectedStayDetails,
  preselectedPromotion,
}) => {
  const [viewMode, setViewMode] = useState<'entry' | 'quick-form' | 'planner'>('entry');
  const [activeSection, setActiveSection] = useState<BuilderSectionId>('dates-guests');
  const [editingFromReview, setEditingFromReview] = useState<boolean>(false);
  const [expandedReviewActivityId, setExpandedReviewActivityId] = useState<string | null>(null);
  const [planDraft, setPlanDraft] = useState<TripPlanDraft>(() => createEmptyTripPlanDraft());
  const [savedResumeDraft, setSavedResumeDraft] = useState<TripPlanDraft | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [mobileEstimateOpen, setMobileEstimateOpen] = useState<boolean>(false);

  // Activity filtering state
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [activityCategory, setActivityCategory] = useState<string>('all');

  // Quick Enquiry form state (first screen)
  const [quickName, setQuickName] = useState<string>('');
  const [quickReplyMethod, setQuickReplyMethod] = useState<ReplyMethod>('whatsapp');
  const [quickEmail, setQuickEmail] = useState<string>('');
  const [quickPhone, setQuickPhone] = useState<string>('');
  const [quickTimingMode, setQuickTimingMode] = useState<TimingMode>('undecided');
  const [quickArrival, setQuickArrival] = useState<string>('');
  const [quickDeparture, setQuickDeparture] = useState<string>('');
  const [quickApproxMonth, setQuickApproxMonth] = useState<string>('');
  const [quickNotes, setQuickNotes] = useState<string>('');
  const [quickValidationMsg, setQuickValidationMsg] = useState<string>('');
  const [quickSubmitted, setQuickSubmitted] = useState<boolean>(false);

  // Full Plan Contact / Quote state (in Review)
  const [fullName, setFullName] = useState<string>('');
  const [replyMethod, setReplyMethod] = useState<ReplyMethod>('email');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [marketingConsent, setMarketingConsent] = useState<boolean>(false);
  const [planValidationMsg, setPlanValidationMsg] = useState<string>('');
  const [planSubmitted, setPlanSubmitted] = useState<boolean>(false);
  const [showReviewEnquiryForm, setShowReviewEnquiryForm] = useState<boolean>(false);
  const [calendarOpenKey, setCalendarOpenKey] = useState<number>(0);

  const submission = useSubmission('enquiries');
  const modalRootRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const datesPanelRef = useRef<HTMLDivElement>(null);
  const guestsPanelRef = useRef<HTMLDivElement>(null);

  const enabledSections = useMemo(() => {
    const cfg = BUILDER_CONFIG?.enabledSections;
    return {
      datesGuests: cfg?.datesGuests !== false,
      stay: cfg?.stay !== false,
      activities: cfg?.activities !== false,
      transfers: cfg?.transfers !== false,
    };
  }, []);

  const visibleSectionItems = useMemo(
    () =>
      SECTION_ITEMS.filter((sec) => {
        if (sec.id === 'dates-guests') return enabledSections.datesGuests;
        if (sec.id === 'stay') return enabledSections.stay;
        if (sec.id === 'activities') return enabledSections.activities;
        if (sec.id === 'transfers') return enabledSections.transfers;
        return true;
      }),
    [enabledSections]
  );

  const entryCopy = useMemo(() => {
    const c = BUILDER_CONFIG?.entryCopy;
    return {
      heading: c?.heading || 'How would you like to plan your trip?',
      helpCardTitle: c?.helpCardTitle || 'Get help planning',
      helpCardDesc:
        c?.helpCardDesc ||
        'Tell us what you need and we’ll help plan your trip.',
      whatsappCtaLabel: c?.whatsappCtaLabel || 'Talk to a local specialist',
      quickEnquiryCtaLabel: c?.quickEnquiryCtaLabel || 'Quick enquiry',
      itineraryCardTitle: c?.itineraryCardTitle || 'Build my trip',
      itineraryCardDesc:
        c?.itineraryCardDesc ||
        'Pick a stay, activities, or transfers and see an estimate.',
      itineraryCtaLabel: c?.itineraryCtaLabel || 'Start planning',
    };
  }, []);

  const stayAccommodations = useMemo(
    () => (isOpen && viewMode === 'planner' ? resolveBuilderAccommodations(ALL_ACCOMMODATIONS) : []),
    [isOpen, viewMode]
  );
  const transferOptions = useMemo(
    () => (isOpen && viewMode === 'planner' ? resolveBuilderTransfers(BUILDER_CONFIG?.transferOptions) : []),
    [isOpen, viewMode]
  );
  const recommendedActivities = useMemo(() => {
    if (!isOpen || viewMode !== 'planner') return [];
    const byCfg = new Set(BUILDER_CONFIG?.suggestedActivityIds ?? []);
    const matches = ACTIVITIES_DATA.filter((a) => a.suggestedByDefault || byCfg.has(a.id));
    return matches.length > 0 ? matches : ACTIVITIES_DATA.slice(0, 4);
  }, [isOpen, viewMode]);

  // Initialize / hydrate clean state whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;

    prevFocusRef.current = document.activeElement as HTMLElement | null;
    setQuickSubmitted(false);
    setPlanSubmitted(false);
    setQuickValidationMsg('');
    setPlanValidationMsg('');
    setEditingFromReview(false);
    setShowReviewEnquiryForm(false);
    setCalendarOpenKey(0);
    setExpandedReviewActivityId(null);
    setMobileEstimateOpen(false);
    setShowSuggestions(false);

    trackEnquiryEvent('builder_opened', {
      category: preselectedAccommodation
        ? 'accommodation'
        : preselectedActivity
        ? 'experience'
        : preselectedPackage
        ? 'package'
        : 'holiday-builder',
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
      itemLabel:
        preselectedAccommodation?.name ||
        preselectedPackage?.title ||
        preselectedActivity ||
        undefined,
    });

    const hasExplicitPreselection = Boolean(
      preselectedAccommodation || preselectedActivity || preselectedPackage
    );

    if (hasExplicitPreselection) {
      const next = createEmptyTripPlanDraft();
      if (preselectedAccommodation) {
        next.stayArrangement = 'selected';
        next.accommodationId = preselectedAccommodation.id || preselectedAccommodation.slug;
        if (preselectedStayDetails) {
          if (preselectedStayDetails.roomId) next.roomId = preselectedStayDetails.roomId;
          if (preselectedStayDetails.ratePlanId) next.ratePlanId = preselectedStayDetails.ratePlanId;
          if (preselectedStayDetails.mealPlanId) next.mealPlanId = preselectedStayDetails.mealPlanId;
          if (preselectedStayDetails.offerId) next.offerId = preselectedStayDetails.offerId;
          if (preselectedStayDetails.arrivalDate && preselectedStayDetails.departureDate) {
            next.timingMode = 'exact-dates';
            next.arrivalDate = preselectedStayDetails.arrivalDate;
            next.departureDate = preselectedStayDetails.departureDate;
            next.nights = computeNightsBetweenDates(
              preselectedStayDetails.arrivalDate,
              preselectedStayDetails.departureDate
            );
          }
          if (typeof preselectedStayDetails.adults === 'number' && preselectedStayDetails.adults >= 1) {
            next.adults = preselectedStayDetails.adults;
          }
          if (Array.isArray(preselectedStayDetails.childAgesYears)) {
            next.childAgesYears = [...preselectedStayDetails.childAgesYears];
          }
        }
        setActiveSection('stay');
      } else if (preselectedPackage) {
        next.packageId = preselectedPackage.id;
        next.packageTitle = preselectedPackage.title;
        const nightMatch = /(\d+)\s*night/i.exec(preselectedPackage.duration || '');
        if (nightMatch) {
          next.nights = Number(nightMatch[1]);
        }
        setActiveSection('dates-guests');
      } else if (preselectedActivity) {
        const matchedId = resolveMatchingActivityId(ACTIVITIES_DATA, preselectedActivity) || preselectedActivity;
        const matchedAct = ACTIVITIES_DATA.find((a) => a.id === matchedId);
        if (matchedAct) {
          next.selectedActivities = [
            {
              id: matchedId,
              preferredDay: 'to-be-scheduled',
              preferredTime: getDefaultTimeForActivity(matchedAct),
            },
          ];
        }
        setActiveSection('activities');
      }
      setPlanDraft(next);
      setSavedResumeDraft(null);
      setViewMode('planner');
    } else {
      const existingDraft = loadTripPlanDraft();
      setPlanDraft(createEmptyTripPlanDraft());
      setSavedResumeDraft(existingDraft);
      setActiveSection('dates-guests');
      setViewMode('entry');
    }

    const timer = window.setTimeout(() => closeBtnRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(timer);
      prevFocusRef.current?.focus?.();
    };
  }, [
    isOpen,
    preselectedAccommodation,
    preselectedActivity,
    preselectedPackage,
    preselectedStayDetails,
  ]);

  // Keyboard Escape handler
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Persist ONLY non-PII trip selections locally whenever planner draft updates
  useEffect(() => {
    if (!isOpen || viewMode !== 'planner') return;
    saveTripPlanDraft(planDraft);
  }, [isOpen, viewMode, planDraft]);

  const ctx = useMemo(
    () =>
      resolveTripPlanContext({
        draft: isOpen && viewMode === 'planner' ? planDraft : createEmptyTripPlanDraft(),
        accommodations: isOpen && viewMode === 'planner' ? ALL_ACCOMMODATIONS : [],
        stayTiers: isOpen && viewMode === 'planner' ? STAY_TIERS : [],
        allActivities: isOpen && viewMode === 'planner' ? ACTIVITIES_DATA : [],
        transferOptions,
      }),
    [isOpen, viewMode, planDraft, transferOptions]
  );

  const filteredActivities = useMemo(() => {
    if (!isOpen || viewMode !== 'planner') return [];
    const q = activitySearch.trim().toLowerCase();
    return ACTIVITIES_DATA.filter((act) => {
      const isSelected = planDraft.selectedActivities.some((s) => s.id === act.id);
      if (activityCategory === 'selected' && !isSelected) return false;
      if (activityCategory === 'recommended') {
        const isRec =
          act.suggestedByDefault || (BUILDER_CONFIG?.suggestedActivityIds ?? []).includes(act.id);
        if (!isRec) return false;
      } else if (activityCategory !== 'all' && activityCategory !== 'selected') {
        const cats = act.categories ?? [];
        if (!cats.includes(activityCategory)) return false;
      }
      if (!q) return true;
      const haystack = `${act.title} ${act.shortDesc} ${act.badge} ${act.duration}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [isOpen, viewMode, activitySearch, activityCategory, planDraft.selectedActivities]);

  if (!isOpen) return null;

  const updateDraft = (updater: (prev: TripPlanDraft) => TripPlanDraft) => {
    setPlanDraft((prev) => updater(prev));
  };

  const navigateSection = (
    section: BuilderSectionId,
    fromReview = false,
    subTarget?: 'dates' | 'guests'
  ) => {
    setActiveSection(section);
    setEditingFromReview(fromReview);
    setExpandedReviewActivityId(null);
    setMobileEstimateOpen(false);
    setCalendarOpenKey(0);
    setPlanValidationMsg('');
    if (section !== 'review') {
      setShowReviewEnquiryForm(false);
    }
    if (section === 'dates-guests' && subTarget) {
      window.setTimeout(() => {
        const ref = subTarget === 'dates' ? datesPanelRef.current : guestsPanelRef.current;
        ref?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
    trackEnquiryEvent('builder_section_viewed', {
      category: 'holiday-builder',
      sourcePage: section,
      itemLabel: section,
    });
  };

  const hasValidPlanItem =
    planDraft.selectedActivities.length > 0 ||
    planDraft.stayArrangement !== 'none' ||
    planDraft.transferArrangement !== 'none' ||
    Boolean(preselectedPackage || preselectedAccommodation || preselectedActivity);

  const getRecommendedNext = (): {
    section: BuilderSectionId;
    label: string;
    nextOptional?: { section: BuilderSectionId; label: string };
    isReady: boolean;
  } => {
    const firstOptional =
      enabledSections.stay && planDraft.stayArrangement === 'none'
        ? ({ section: 'stay', label: 'Add a stay' } as const)
        : enabledSections.transfers && planDraft.transferArrangement === 'none'
        ? ({ section: 'transfers', label: 'Add a transfer' } as const)
        : enabledSections.activities && planDraft.selectedActivities.length === 0
        ? ({ section: 'activities', label: 'Add activities' } as const)
        : enabledSections.datesGuests && planDraft.timingMode === 'undecided'
        ? ({ section: 'dates-guests', label: 'Add dates' } as const)
        : undefined;

    if (hasValidPlanItem) {
      return {
        section: 'review',
        label: 'Your plan is ready to review',
        ...(firstOptional ? { nextOptional: firstOptional } : {}),
        isReady: true,
      };
    }
    const hasDatesOrGuests =
      planDraft.timingMode !== 'undecided' ||
      planDraft.adults !== null ||
      planDraft.childAgesYears.length > 0 ||
      planDraft.nights !== null;
    if (enabledSections.datesGuests && !hasDatesOrGuests) {
      return { section: 'dates-guests', label: 'Add dates and guests', isReady: false };
    }
    if (enabledSections.activities) {
      return { section: 'activities', label: 'Add activity', isReady: false };
    }
    if (enabledSections.stay) {
      return { section: 'stay', label: 'Add a stay', isReady: false };
    }
    if (enabledSections.transfers) {
      return { section: 'transfers', label: 'Add a transfer', isReady: false };
    }
    return { section: 'review', label: 'Review my trip', isReady: false };
  };

  const canReview =
    hasMeaningfulDraftContent(planDraft) ||
    Boolean(preselectedPackage || preselectedAccommodation || preselectedActivity);

  const recommendedNext = getRecommendedNext();

  const toggleActivityInPlan = (actId: string) => {
    const actObj = ACTIVITIES_DATA.find((a) => a.id === actId);
    updateDraft((prev) => {
      const exists = prev.selectedActivities.some((s) => s.id === actId);
      if (exists) {
        return {
          ...prev,
          selectedActivities: prev.selectedActivities.filter((s) => s.id !== actId),
        };
      }
      return {
        ...prev,
        selectedActivities: [
          ...prev.selectedActivities,
          {
            id: actId,
            preferredDay: 'to-be-scheduled',
            preferredTime: getDefaultTimeForActivity(actObj),
          },
        ],
      };
    });
  };

  const updateActivitySchedule = (
    actId: string,
    patch: Partial<Pick<SelectedPlanActivity, 'preferredDay' | 'preferredTime' | 'activityDate'>>
  ) => {
    updateDraft((prev) => ({
      ...prev,
      selectedActivities: prev.selectedActivities.map((s) =>
        s.id === actId ? { ...s, ...patch } : s
      ),
    }));
  };

  const explicitPreselectedLabel = preselectedAccommodation
    ? preselectedAccommodation.name
    : preselectedPackage
    ? preselectedPackage.title
    : preselectedActivity
    ? ACTIVITIES_DATA.find((a) => a.id === resolveMatchingActivityId(ACTIVITIES_DATA, preselectedActivity))?.title ||
      ALL_EXPERIENCES.find((e) => e.id === preselectedActivity || e.slug === preselectedActivity)?.title ||
      preselectedActivity
    : undefined;

  const quickTimingSummary =
    quickTimingMode === 'exact-dates' && (quickArrival || quickDeparture)
      ? `${quickArrival || '?'} to ${quickDeparture || '?'}`
      : quickTimingMode === 'approx-month' && quickApproxMonth.trim()
      ? quickApproxMonth.trim()
      : quickTimingMode === 'flexible'
      ? 'Flexible dates'
      : undefined;

  const quickWhatsAppUrl = buildQuickHelpWhatsAppUrl({
    name: quickName,
    email: quickEmail,
    phone: quickPhone,
    replyMethod: quickReplyMethod,
    timingLabel: quickTimingSummary,
    notes: quickNotes,
    explicitItemLabel: explicitPreselectedLabel,
  });

  const handleQuickFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickValidationMsg('');
    const cleanName = quickName.trim();
    const cleanEmail = quickEmail.trim();
    const cleanPhone = quickPhone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');

    if (cleanName.length < 2) {
      setQuickValidationMsg('Please enter your name (at least 2 characters).');
      return;
    }
    if (quickReplyMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setQuickValidationMsg('Please enter a valid email address for email replies.');
      return;
    }
    if (quickReplyMethod === 'whatsapp' && phoneDigits.length < 7) {
      setQuickValidationMsg('Please enter your WhatsApp number (at least 7 digits).');
      return;
    }

    const payload = buildPlannerSubmissionPayload({
      mode: 'quick',
      ctx,
      name: cleanName,
      email: quickReplyMethod === 'email' ? cleanEmail : '',
      phone: quickReplyMethod === 'whatsapp' ? cleanPhone : '',
      replyMethod: quickReplyMethod,
      notes: quickNotes,
      marketingConsent: false,
      quickTimingLabel: quickTimingSummary,
      preselectedPromotion,
      preselectedPackage,
      preselectedActivityId: preselectedActivity,
      preselectedActivityTitle: explicitPreselectedLabel,
    });

    const saved = await submission.save(payload);
    if (saved && saved.reference) {
      setQuickSubmitted(true);
      trackEnquiryEvent('builder_enquiry_saved', {
        category: 'quick-enquiry',
        sourcePage: 'entry',
        itemLabel: saved.reference,
      });
    }
  };

  const handleFullPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanValidationMsg('');
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');

    if (cleanName.length < 2) {
      setPlanValidationMsg('Please enter your name (at least 2 characters).');
      return;
    }
    if (replyMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setPlanValidationMsg('Please enter a valid email address so we can send your quote.');
      return;
    }
    if (replyMethod === 'whatsapp' && phoneDigits.length < 7) {
      setPlanValidationMsg('Please enter your WhatsApp number (at least 7 digits).');
      return;
    }

    const payload = buildPlannerSubmissionPayload({
      mode: 'guided',
      ctx,
      name: cleanName,
      email: replyMethod === 'email' ? cleanEmail : '',
      phone: replyMethod === 'whatsapp' ? cleanPhone : '',
      replyMethod,
      notes,
      marketingConsent,
      preselectedPromotion,
      preselectedPackage,
      preselectedActivityId: preselectedActivity,
      preselectedActivityTitle: explicitPreselectedLabel,
    });

    const saved = await submission.save(payload);
    if (saved && saved.reference) {
      setPlanSubmitted(true);
      clearTripPlanDraft();
      setSavedResumeDraft(null);
      trackEnquiryEvent('builder_enquiry_saved', {
        category: 'trip-planner',
        sourcePage: 'review',
        itemLabel: saved.reference,
      });
    }
  };

  const todayIso = new Date().toISOString().split('T')[0];

  // Rooms & rate plans helpers for active selected property
  const selectedProperty = ctx.property;
  const publishedRooms = selectedProperty ? getPublishedRoomTypes(selectedProperty) : [];
  const selectedRoomObj = publishedRooms.find((r) => (r.id || r.name) === planDraft.roomId) || null;
  const availableRatePlans = selectedRoomObj?.pricing?.ratePlans?.filter((rp) => rp.isActive !== false) || selectedProperty?.ratePlans?.filter((rp) => rp.isActive !== false) || [];
  const availableMealPlans = selectedRoomObj?.pricing?.mealPlanRates?.filter((m) => m.isActive !== false) || [];
  const availableOffers = selectedProperty
    ? getPublishedPropertyOffers(selectedProperty).filter((off) =>
        planDraft.timingMode !== 'exact-dates' ||
        isOfferWithinDateWindow(off, {
          checkIn: planDraft.arrivalDate || undefined,
          checkOut: planDraft.departureDate || undefined,
        })
      )
    : [];
  const selectedRatePlanObj = availableRatePlans.find((rp) => rp.id === planDraft.ratePlanId) || null;
  const selectedMealPlanObj = availableMealPlans.find((m) => m.id === planDraft.mealPlanId) || null;
  const selectedOfferObj = availableOffers.find((o) => o.id === planDraft.offerId) || null;

  const handleFieldFocusCapture = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target || !['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
    window.setTimeout(() => {
      target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 120);
  };

  const totalDaysForDropdown = planDraft.nights && planDraft.nights >= 1 ? Math.min(30, planDraft.nights) + 1 : 0;
  const tripCalendarDays = getTripCalendarDays(planDraft.arrivalDate, planDraft.departureDate);

  const renderActivityScheduleControls = (
    act: (typeof ACTIVITIES_DATA)[number],
    sel: SelectedPlanActivity,
    contextPrefix: string
  ) => {
    const timeCfg = getApplicableActivityTimeOptions(act);
    const outsideTrip = isActivityDateOutsideTrip(sel, planDraft.arrivalDate, planDraft.departureDate);

    return (
      <div className="pt-2.5 border-t border-gray-100 space-y-3">
        {outsideTrip && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold">
            Previously selected date ({formatShortIsoDay(sel.activityDate || sel.preferredDay)}) falls outside your updated trip dates. Please choose a new day below.
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1.5">
            {tripCalendarDays.length > 0 ? 'Activity day' : 'Activity date'}
          </label>

          {tripCalendarDays.length > 0 ? (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${contextPrefix} day for ${act.title}`}>
              <button
                type="button"
                onClick={() =>
                  updateActivitySchedule(act.id, {
                    preferredDay: 'to-be-scheduled',
                    activityDate: '',
                  })
                }
                className={`min-h-[34px] px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                  (!sel.activityDate && sel.preferredDay === 'to-be-scheduled')
                    ? 'border-[#0D5C75] bg-[#0D5C75] text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                To be scheduled
              </button>
              {tripCalendarDays.map((d) => {
                const isDayActive =
                  sel.activityDate === d.dateIso || (!sel.activityDate && sel.preferredDay === d.dayId);
                return (
                  <button
                    key={d.dayId}
                    type="button"
                    onClick={() =>
                      updateActivitySchedule(act.id, {
                        preferredDay: d.dayId,
                        activityDate: d.dateIso,
                      })
                    }
                    className={`min-h-[34px] px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                      isDayActive
                        ? 'border-[#0D5C75] bg-[#0D5C75] text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          ) : totalDaysForDropdown > 0 ? (
            <select
              aria-label={`Preferred day for ${act.title}`}
              value={sel.preferredDay}
              onChange={(e) =>
                updateActivitySchedule(act.id, { preferredDay: e.target.value, activityDate: '' })
              }
              className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white font-semibold"
            >
              <option value="to-be-scheduled">To be scheduled</option>
              {Array.from({ length: totalDaysForDropdown }, (_, i) => `day-${i + 1}`).map((dayId, idx) => (
                <option key={dayId} value={dayId}>
                  Day {idx + 1}
                </option>
              ))}
            </select>
          ) : (
            <DateRangeCalendar
              singleDateMode
              label=""
              placeholder="Choose an activity date"
              dialogTitle={`Choose a date for ${act.title}`}
              applyButtonLabel="Apply date"
              value={{ checkIn: sel.activityDate || '', checkOut: '' }}
              onChange={(next) =>
                updateActivitySchedule(act.id, {
                  activityDate: next.checkIn,
                  preferredDay: next.checkIn || 'to-be-scheduled',
                })
              }
            />
          )}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1.5">
            {timeCfg.label}
          </label>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${contextPrefix} time for ${act.title}`}>
            {timeCfg.options.map((opt) => {
              const active = sel.preferredTime === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateActivitySchedule(act.id, { preferredTime: opt.id })}
                  className={`min-h-[34px] px-3 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                    active
                      ? 'border-[#0D5C75] bg-[#0D5C75] text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={modalRootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="outbound-builder-title"
      onFocusCapture={handleFieldFocusCapture}
      className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col overflow-hidden text-[#1A2E35]"
    >
      {/* Top Header Bar */}
      <header className="bg-[#0D5C75] text-white px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-white/15 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={
              !outboundLogo || /outbound-holidays-logo/i.test(String(outboundLogo))
                ? resolveAssetUrl('/logo/outbound-holidays-logo-light.webp')
                : String(outboundLogo)
            }
            width={1170}
            height={352}
            alt={editorial('travel/HolidayBuilderModal.text61')}
            className="w-[108px] sm:w-[155px] h-auto object-contain"
          />
        </div>

        <span className="text-xs sm:text-sm font-bold tracking-wide text-white/95 hidden sm:block">
          {viewMode === 'entry'
            ? 'Plan your trip'
            : viewMode === 'quick-form'
            ? entryCopy.quickEnquiryCtaLabel
            : 'Your trip'}
        </span>

        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="min-h-[38px] sm:min-h-[40px] flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full text-xs font-bold transition-colors text-white border border-white/25 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
        >
          <span>Close</span>
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* FIRST SCREEN: COMPACT TWO-CHOICE OPENING SCREEN */}
      {viewMode === 'entry' && (
        <main className="flex-1 overflow-y-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-8">
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-6">
            <h1 id="outbound-builder-title" className="text-lg sm:text-3xl font-bold font-serif text-[#0D5C75] text-center">
              {entryCopy.heading}
            </h1>

            {/* Two compact side-by-side cards on desktop; stacked on mobile fitting cleanly above the fold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 items-stretch">
              {/* CARD 1: GET HELP PLANNING */}
              <section className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#0D5C75] p-3.5 sm:p-6 shadow-sm flex flex-col justify-between gap-2.5 sm:gap-4">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-xl font-serif font-bold text-[#0D5C75]">
                    {entryCopy.helpCardTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                    {entryCopy.helpCardDesc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 items-start">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickSubmitted(false);
                      setViewMode('quick-form');
                    }}
                    className="w-full min-h-[42px] sm:min-h-[48px] bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-[11px] sm:text-sm py-2 px-2.5 sm:px-4 rounded-xl shadow-xs flex items-center justify-center gap-1.5 text-center leading-tight cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>{entryCopy.quickEnquiryCtaLabel}</span>
                  </button>

                  <div className="text-center">
                    <a
                      href={quickWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEnquiryEvent('builder_whatsapp_opened', {
                          category: 'quick-entry',
                          sourcePage: 'first-screen',
                        })
                      }
                      className="w-full min-h-[42px] sm:min-h-[48px] bg-[#25D366] hover:bg-[#1fb857] text-white font-bold text-[11px] sm:text-sm py-2 px-2.5 sm:px-4 rounded-xl shadow-xs flex items-center justify-center gap-1.5 text-center leading-tight transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>{entryCopy.whatsappCtaLabel}</span>
                    </a>
                    <span className="block text-[10px] text-gray-500 mt-0.5">Opens WhatsApp</span>
                  </div>
                </div>
              </section>

              {/* CARD 2: BUILD MY TRIP */}
              <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-3.5 sm:p-6 shadow-xs flex flex-col justify-between gap-2.5 sm:gap-4">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-xl font-serif font-bold text-[#0D5C75]">
                    {entryCopy.itineraryCardTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                    {entryCopy.itineraryCardDesc}
                  </p>
                </div>

                <div className="space-y-1 sm:space-y-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const firstSec = visibleSectionItems[0]?.id || 'review';
                      setPlanDraft(createEmptyTripPlanDraft());
                      setActiveSection(firstSec);
                      setViewMode('planner');
                    }}
                    className="w-full min-h-[42px] sm:min-h-[48px] bg-white hover:bg-[#0D5C75]/5 text-[#0D5C75] border-2 border-[#0D5C75] font-bold text-xs sm:text-sm py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{entryCopy.itineraryCtaLabel}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>

                  {savedResumeDraft && (
                    <button
                      type="button"
                      onClick={() => {
                        setPlanDraft(savedResumeDraft);
                        setSavedResumeDraft(null);
                        setActiveSection('review');
                        setViewMode('planner');
                      }}
                      className="inline-block text-xs font-bold text-[#0B5E8E] hover:underline py-0.5 cursor-pointer"
                    >
                      Resume my plan
                    </button>
                  )}
                </div>
              </section>
            </div>

            <div className="hidden sm:flex text-center text-xs text-gray-500 items-center justify-center gap-2 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
              <span>Local Victoria Falls specialists · No payment required online</span>
            </div>
          </div>
        </main>
      )}

      {/* QUICK ENQUIRY FORM VIEW (OPENED ONLY WHEN VISITOR TAPS "Send a quick enquiry") */}
      {viewMode === 'quick-form' && (
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <div className="max-w-xl mx-auto space-y-4">
            <button
              type="button"
              onClick={() => setViewMode('entry')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5E8E] hover:underline py-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to planning options</span>
            </button>

            <section className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-7 shadow-sm space-y-4">
              <div className="space-y-1">
                <h1 id="outbound-builder-title" className="text-xl sm:text-2xl font-serif font-bold text-[#0D5C75]">
                  {entryCopy.quickEnquiryCtaLabel}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">{entryCopy.helpCardDesc}</p>
              </div>

              {quickSubmitted ? (
                <div className="p-4 rounded-2xl bg-[#3F6B3C]/10 border border-[#3F6B3C]/25 space-y-3 text-center">
                  <h2 className="font-serif font-bold text-lg text-[#0D5C75]">
                    Enquiry sent
                  </h2>
                  <p className="text-xs font-semibold text-[#2F5230]">
                    We’ll reply by {quickReplyMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}.
                  </p>
                  <EnquiryConfirmation result={submission.result} />
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setQuickSubmitted(false);
                        setViewMode('planner');
                      }}
                      className="text-xs font-bold text-[#0B5E8E] underline cursor-pointer"
                    >
                      Open the trip planner
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('entry')}
                      className="text-xs font-semibold text-gray-600 hover:underline cursor-pointer"
                    >
                      Back to planning options
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuickFormSubmit} className="space-y-3.5" noValidate>

                    <div>
                      <label htmlFor="quick-name" className="block text-xs font-bold text-gray-700 mb-1">
                        Your name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="quick-name"
                        type="text"
                        required
                        minLength={2}
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D5C75]"
                      />
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-gray-700 mb-1.5">
                        How should we reply?
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickReplyMethod('whatsapp')}
                          className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                            quickReplyMethod === 'whatsapp'
                              ? 'border-[#0D5C75] bg-[#0D5C75]/10 text-[#0D5C75] ring-1 ring-[#0D5C75]'
                              : 'border-gray-200 bg-gray-50 text-gray-700'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickReplyMethod('email')}
                          className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                            quickReplyMethod === 'email'
                              ? 'border-[#0D5C75] bg-[#0D5C75]/10 text-[#0D5C75] ring-1 ring-[#0D5C75]'
                              : 'border-gray-200 bg-gray-50 text-gray-700'
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </button>
                      </div>
                    </div>

                    {quickReplyMethod === 'whatsapp' ? (
                      <div>
                        <label htmlFor="quick-phone" className="block text-xs font-bold text-gray-700 mb-1">
                          WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="quick-phone"
                          type="tel"
                          required
                          value={quickPhone}
                          onChange={(e) => setQuickPhone(e.target.value)}
                          placeholder="+263 ... or +44 ..."
                          className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D5C75]"
                        />
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="quick-email" className="block text-xs font-bold text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="quick-email"
                          type="email"
                          required
                          value={quickEmail}
                          onChange={(e) => setQuickEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D5C75]"
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="quick-timing" className="block text-xs font-bold text-gray-700 mb-1">
                        Travel timing <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <select
                        id="quick-timing"
                        value={quickTimingMode}
                        onChange={(e) => setQuickTimingMode(e.target.value as TimingMode)}
                        className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5C75]"
                      >
                        <option value="undecided">Still undecided</option>
                        <option value="exact-dates">Exact dates</option>
                        <option value="approx-month">Approximate month</option>
                        <option value="flexible">My dates are flexible</option>
                      </select>

                      {quickTimingMode === 'exact-dates' && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <input
                            type="date"
                            aria-label="Quick arrival date"
                            min={todayIso}
                            value={quickArrival}
                            onChange={(e) => setQuickArrival(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                          />
                          <input
                            type="date"
                            aria-label="Quick departure date"
                            min={quickArrival || todayIso}
                            value={quickDeparture}
                            onChange={(e) => setQuickDeparture(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>
                      )}
                      {quickTimingMode === 'approx-month' && (
                        <input
                          type="text"
                          aria-label="Approximate travel month"
                          placeholder="e.g. December 2026"
                          value={quickApproxMonth}
                          onChange={(e) => setQuickApproxMonth(e.target.value)}
                          className="w-full p-2.5 mt-2 border border-gray-300 rounded-lg text-xs"
                        />
                      )}
                    </div>

                    <div>
                      <label htmlFor="quick-notes" className="block text-xs font-bold text-gray-700 mb-1">
                        What can we help with? <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        id="quick-notes"
                        rows={2}
                        value={quickNotes}
                        onChange={(e) => setQuickNotes(e.target.value)}
                        placeholder="e.g. Sunset cruise only, family lodge for December, or airport transfer help..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0D5C75]"
                      />
                    </div>

                    {quickValidationMsg && (
                      <p role="alert" className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        {quickValidationMsg}
                      </p>
                    )}

                    <SubmissionSafety
                      submission={submission}
                      marketingConsent={false}
                      onConsent={() => undefined}
                      requireConsent={false}
                    />

                    <button
                      type="submit"
                      disabled={submission.pending}
                      className="w-full min-h-[48px] bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submission.pending ? 'Sending enquiry...' : 'Send my enquiry'}</span>
                    </button>
                  </form>
                )}
            </section>
          </div>
        </main>
      )}

      {/* SECOND VIEW: UNIFIED NON-LINEAR TRIP PLANNER */}
      {viewMode === 'planner' && (
        <>
          {/* Non-linear Section Navigation Rail */}
          <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2.5 shrink-0">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <nav aria-label="Trip plan sections" className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {visibleSectionItems.map((sec) => {
                  const isActive = activeSection === sec.id;
                  const countBadge =
                    sec.id === 'activities' && planDraft.selectedActivities.length > 0
                      ? ` (${planDraft.selectedActivities.length})`
                      : '';
                  const isDone =
                    (sec.id === 'dates-guests' && (planDraft.timingMode !== 'undecided' || planDraft.adults !== null || planDraft.nights !== null)) ||
                    (sec.id === 'stay' && planDraft.stayArrangement !== 'none') ||
                    (sec.id === 'activities' && planDraft.selectedActivities.length > 0) ||
                    (sec.id === 'transfers' && planDraft.transferArrangement !== 'none');
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => navigateSection(sec.id, false)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#0D5C75] text-white shadow-2xs'
                          : isDone
                          ? 'bg-[#3F6B3C]/12 text-[#2F5230] border border-[#3F6B3C]/25 hover:bg-[#3F6B3C]/20'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{sec.label}{countBadge}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('entry')}
                  className="text-xs font-semibold text-gray-600 hover:text-[#0D5C75] px-2 py-1 cursor-pointer"
                >
                  Help options
                </button>
                {hasMeaningfulDraftContent(planDraft) && (
                  <button
                    type="button"
                    onClick={() => {
                      clearTripPlanDraft();
                      setPlanDraft(createEmptyTripPlanDraft());
                      setActiveSection('dates-guests');
                    }}
                    className="text-xs font-semibold text-red-600 hover:underline px-2 py-1 cursor-pointer"
                  >
                    Start a new plan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Workspace + Sticky Desktop Sidebar */}
          <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
            <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6 pb-36 lg:pb-12">
              {/* Top Guidance + Main Action + Named Optional Next Action (hidden on Review so ready plans focus on sending) */}
              {!planSubmitted && activeSection !== 'review' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="space-y-0.5 text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706] block">
                      {canReview ? 'Next step' : 'Where to start'}
                    </span>
                    <p className="font-semibold text-[#0D2833]">
                      {recommendedNext.label}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canReview && (
                      <button
                        type="button"
                        onClick={() => navigateSection('review', false)}
                        className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#E67E22] hover:bg-[#d36e17] text-white text-xs font-bold cursor-pointer"
                      >
                        Review my trip
                      </button>
                    )}
                    {canReview && recommendedNext.nextOptional && (
                      <button
                        type="button"
                        onClick={() =>
                          navigateSection(recommendedNext.nextOptional!.section, false)
                        }
                        className="min-h-[38px] px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                      >
                        {recommendedNext.nextOptional.label}
                      </button>
                    )}
                    {enabledSections.activities && (
                      <button
                        type="button"
                        onClick={() => setShowSuggestions((s) => !s)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[#0D5C75]/30 bg-[#0D5C75]/5 text-[#0D5C75] text-xs font-bold hover:bg-[#0D5C75]/10 cursor-pointer"
                      >
                        {showSuggestions ? 'Hide suggestions' : 'Show me suggestions'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Optional Discovery Suggestions Drawer (never auto-added until user clicks) */}
              {showSuggestions && !planSubmitted && (
                <section className="bg-[#FDF8EE] rounded-2xl border border-[#C9A66B]/40 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-serif font-bold text-[#0D5C75]">
                        Popular Victoria Falls ideas
                      </h3>
                      <p className="text-xs text-gray-600">
                        Preview highlights below — nothing is added until you tap Add to my plan.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendedActivities.map((act) => {
                      const added = planDraft.selectedActivities.some((s) => s.id === act.id);
                      return (
                        <div
                          key={act.id}
                          className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between gap-3"
                        >
                          <div className="text-xs space-y-0.5 min-w-0">
                            <p className="font-bold text-[#0D5C75] truncate">{act.title}</p>
                            <p className="text-gray-500">
                              {act.duration} · {act.priceUSD > 0 ? `US$${act.priceUSD}` : 'Price on request'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleActivityInPlan(act.id)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                              added
                                ? 'bg-[#3F6B3C] text-white'
                                : 'bg-[#0D5C75] text-white hover:bg-[#09475c]'
                            }`}
                          >
                            {added ? 'Added' : 'Add to my plan'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* SECTION 1: DATES & GUESTS */}
              {activeSection === 'dates-guests' && (
                <section className="space-y-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                      Dates &amp; guests
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                      When are you travelling?
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Enter what you know now — exact dates, a month, or flexible timing. Dates and guests flow automatically to Stays, Activities, and Transfers.
                    </p>
                  </div>

                  {/* Timing Choice */}
                  <div ref={datesPanelRef} id="dates-section-panel" className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'exact-dates', label: 'Choose dates' },
                        { id: 'approx-month', label: 'I know the month' },
                        { id: 'flexible', label: 'I’m flexible' },
                        { id: 'undecided', label: 'Not decided yet' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            updateDraft((prev) => ({ ...prev, timingMode: t.id as TimingMode }));
                            if (t.id === 'exact-dates') {
                              setCalendarOpenKey((k) => k + 1);
                            } else {
                              setCalendarOpenKey(0);
                            }
                          }}
                          className={`min-h-[40px] px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                            planDraft.timingMode === t.id
                              ? 'border-[#0D5C75] bg-[#0D5C75] text-white'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {planDraft.timingMode === 'exact-dates' && (
                      <div className="space-y-3 pt-1">
                        <DateRangeCalendar
                          label="Travel dates"
                          placeholder="Choose dates"
                          dialogTitle="Select arrival and departure dates"
                          applyButtonLabel="Apply dates"
                          openRequestKey={calendarOpenKey}
                          onApply={() => setCalendarOpenKey(0)}
                          value={{ checkIn: planDraft.arrivalDate, checkOut: planDraft.departureDate }}
                          onChange={(range) =>
                            updateDraft((prev) => ({
                              ...prev,
                              arrivalDate: range.checkIn,
                              departureDate: range.checkOut,
                              nights:
                                computeNightsBetweenDates(range.checkIn, range.checkOut) ??
                                (range.checkIn && !range.checkOut ? null : prev.nights),
                            }))
                          }
                        />
                        {planDraft.arrivalDate && planDraft.departureDate && (
                          <p className="text-xs font-semibold text-[#0D5C75] bg-[#0D5C75]/5 px-3 py-2 rounded-xl">
                            {formatCompactCalendarRangeSummary(planDraft.arrivalDate, planDraft.departureDate)}
                          </p>
                        )}
                      </div>
                    )}

                    {planDraft.timingMode === 'approx-month' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label htmlFor="plan-approx-month" className="block text-xs font-bold text-gray-700 mb-1">
                            Approximate month / season
                          </label>
                          <input
                            id="plan-approx-month"
                            type="text"
                            placeholder="e.g. December 2026"
                            value={planDraft.approxMonth}
                            onChange={(e) => updateDraft((prev) => ({ ...prev, approxMonth: e.target.value }))}
                            className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label htmlFor="plan-nights-approx" className="block text-xs font-bold text-gray-700 mb-1">
                            Length of stay (optional nights)
                          </label>
                          <input
                            id="plan-nights-approx"
                            type="number"
                            min={1}
                            max={30}
                            placeholder="e.g. 4"
                            value={planDraft.nights ?? ''}
                            onChange={(e) => {
                              const v = e.target.value ? Math.max(1, Math.min(30, Number(e.target.value))) : null;
                              updateDraft((prev) => ({ ...prev, nights: v }));
                            }}
                            className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {planDraft.timingMode === 'flexible' && (
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          How many nights? <span className="text-gray-400 font-normal">(optional for activity-only plans)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[2, 3, 4, 5, 7].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() =>
                                updateDraft((prev) => ({ ...prev, nights: prev.nights === n ? null : n }))
                              }
                              className={`px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                                planDraft.nights === n
                                  ? 'border-[#0D5C75] bg-[#0D5C75] text-white'
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {n} Nights
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Guests & Child Ages */}
                  <div ref={guestsPanelRef} id="guests-section-panel" className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                    <h3 className="text-base font-serif font-bold text-[#0D5C75]">
                      Who’s coming?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-[#0D5C75] block">Adults</span>
                          <span className="text-xs text-gray-500">Ages 18+ (or 12+ adult tier)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            aria-label="Decrease adults"
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                adults:
                                  prev.adults === null || prev.adults <= 1 ? null : prev.adults - 1,
                              }))
                            }
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-bold text-base w-8 text-center">
                            {planDraft.adults ?? '—'}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase adults"
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                adults: (prev.adults ?? 0) + 1,
                              }))
                            }
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6">
                        <div>
                          <span className="font-bold text-sm text-[#0D5C75] block">Children</span>
                          <span className="text-xs text-gray-500">Ages 0–17 at travel</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            aria-label="Decrease children"
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                childAgesYears: prev.childAgesYears.slice(0, -1),
                              }))
                            }
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-bold text-base w-8 text-center">
                            {planDraft.childAgesYears.length}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase children"
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                childAgesYears:
                                  prev.childAgesYears.length < 10
                                    ? [...prev.childAgesYears, 10]
                                    : prev.childAgesYears,
                              }))
                            }
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {planDraft.childAgesYears.length > 0 && (
                      <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-4 space-y-3">
                        <div className="text-xs">
                          <strong className="text-[#0D5C75] block">
                            Exact age of each child at travel
                          </strong>
                          <span className="text-gray-600">
                            Supplier rules vary between Under 11, age 11, and age 12+. We price each child using the exact published rule for their age.
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {planDraft.childAgesYears.map((ageVal, idx) => (
                            <div key={idx}>
                              <label htmlFor={`child-age-num-${idx}`} className="block text-[11px] font-bold text-gray-700 mb-1">
                                Child {idx + 1} age
                              </label>
                              <select
                                id={`child-age-num-${idx}`}
                                value={ageVal}
                                onChange={(e) => {
                                  const nextAge = Number(e.target.value);
                                  updateDraft((prev) => {
                                    const updated = [...prev.childAgesYears];
                                    updated[idx] = nextAge;
                                    return { ...prev, childAgesYears: updated };
                                  });
                                }}
                                className="w-full min-h-[40px] px-2.5 py-2 border border-gray-300 rounded-xl bg-white text-xs font-semibold"
                              >
                                {Array.from({ length: 18 }, (_, ageOpt) => (
                                  <option key={ageOpt} value={ageOpt}>
                                    {ageOpt} {ageOpt === 1 ? 'year' : 'years'}{ageOpt < 11 ? ' (Under 11)' : ' (11+)'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-100 space-y-1.5">
                      <label htmlFor="visitor-cat-select" className="block text-xs font-bold text-gray-700">
                        Where do you live?
                      </label>
                      <p className="text-[11px] text-gray-500">
                        This helps us show the right prices.
                      </p>
                      <select
                        id="visitor-cat-select"
                        value={planDraft.visitorCategory}
                        onChange={(e) =>
                          updateDraft((prev) => ({
                            ...prev,
                            visitorCategory: e.target.value as TripPlanDraft['visitorCategory'],
                          }))
                        }
                        className="w-full sm:max-w-xs min-h-[42px] px-3 py-2 border border-gray-300 rounded-xl bg-white text-xs font-semibold"
                      >
                        <option value="international">International Visitor</option>
                        <option value="sadc_resident">SADC Resident</option>
                        <option value="zimbabwe_resident">Zimbabwe Resident</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}

              {/* SECTION 2: STAY */}
              {activeSection === 'stay' && (
                <section className="space-y-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                      Accommodation
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                      Where would you like to stay?
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Add a specific hotel or room, ask our specialists to recommend options, or skip stay if you already have somewhere booked.
                    </p>
                  </div>

                  {/* Independent Arrangement Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'selected', label: 'Add a stay or room', desc: 'Pick a property, room & rate plan' },
                      { id: 'recommend', label: 'Recommend a stay', desc: 'Specialist picks based on your dates' },
                      { id: 'already-arranged', label: 'Skip stay', desc: 'Already booked · keep activities & transfers' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          updateDraft((prev) => ({
                            ...prev,
                            stayArrangement:
                              prev.stayArrangement === opt.id
                                ? 'none'
                                : (opt.id as StayArrangement),
                          }))
                        }
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          planDraft.stayArrangement === opt.id
                            ? 'border-[#0D5C75] bg-[#0D5C75]/8 ring-2 ring-[#0D5C75]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <span className="font-bold text-sm text-[#0D5C75] block">{opt.label}</span>
                        <span className="text-xs text-gray-500 mt-0.5 block">{opt.desc}</span>
                      </button>
                    ))}
                  </div>

                  {planDraft.stayArrangement === 'selected' && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                      {stayAccommodations.length === 0 && STAY_TIERS.length === 0 ? (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                          <p className="font-bold">Published properties are currently unavailable.</p>
                          <p>You can still complete your dates, activities, and transfers — or ask us to recommend a stay.</p>
                          <button
                            type="button"
                            onClick={() => updateDraft((prev) => ({ ...prev, stayArrangement: 'recommend' }))}
                            className="px-3 py-1.5 rounded-lg bg-[#0D5C75] text-white font-bold cursor-pointer"
                          >
                            Ask us to recommend a stay
                          </button>
                        </div>
                      ) : (
                        <>
                          {stayAccommodations.length > 0 && (
                            <div>
                              <label htmlFor="stay-prop-select" className="block text-xs font-bold text-[#0D5C75] mb-1">
                                Property
                              </label>
                              <select
                                id="stay-prop-select"
                                value={planDraft.accommodationId}
                                onChange={(e) => {
                                  const chosenId = e.target.value;
                                  const matchedProp = ALL_ACCOMMODATIONS.find(
                                    (a) => a.id === chosenId || a.slug === chosenId
                                  );
                                  const rooms = matchedProp ? getPublishedRoomTypes(matchedProp) : [];
                                  updateDraft((prev) => ({
                                    ...prev,
                                    accommodationId: chosenId,
                                    stayTierId: chosenId ? '' : prev.stayTierId,
                                    roomId: rooms[0] ? rooms[0].id || rooms[0].name : '',
                                    ratePlanId: '',
                                    mealPlanId: '',
                                    offerId: '',
                                  }));
                                }}
                                className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-xl bg-white text-xs font-semibold"
                              >
                                <option value="">Select a Where to Stay property (or pick a style tier below)</option>
                                {stayAccommodations.map((acc) => (
                                  <option key={acc.id} value={acc.id}>
                                    {acc.name} ({acc.category}) — US${acc.pricePerNightUSD} {getPriceUnitLabel(acc.property)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Room, Rate Plan, Meal Plan, Offer & Rooms Count when property chosen */}
                          {selectedProperty && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                              {publishedRooms.length > 0 && (
                                <div>
                                  <label htmlFor="stay-room-select" className="block text-xs font-bold text-gray-700 mb-1">
                                    Room / Unit
                                  </label>
                                  <select
                                    id="stay-room-select"
                                    value={planDraft.roomId}
                                    onChange={(e) =>
                                      updateDraft((prev) => ({
                                        ...prev,
                                        roomId: e.target.value,
                                        ratePlanId: '',
                                        mealPlanId: '',
                                      }))
                                    }
                                    className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-xl bg-white text-xs font-semibold"
                                  >
                                    {publishedRooms.map((r) => {
                                      const rId = r.id || r.name;
                                      const rRate = getRoomStartingPriceUSD(r, selectedProperty);
                                      return (
                                        <option key={rId} value={rId}>
                                          {r.name}
                                          {rRate ? ` (From US$${rRate})` : ''}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              )}

                              <div>
                                <label htmlFor="stay-rooms-count" className="block text-xs font-bold text-gray-700 mb-1">
                                  Number of rooms / units
                                </label>
                                <select
                                  id="stay-rooms-count"
                                  value={planDraft.requestedRooms ?? ''}
                                  onChange={(e) =>
                                    updateDraft((prev) => ({
                                      ...prev,
                                      requestedRooms: e.target.value ? Number(e.target.value) : null,
                                    }))
                                  }
                                  className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-xl bg-white text-xs font-semibold"
                                >
                                  <option value="">Select rooms...</option>
                                  {[1, 2, 3, 4, 5, 6].map((cnt) => (
                                    <option key={cnt} value={cnt}>
                                      {cnt} {cnt === 1 ? 'Room' : 'Rooms'}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {availableRatePlans.length > 0 && (
                                <div>
                                  <label htmlFor="stay-rateplan-select" className="block text-xs font-bold text-gray-700 mb-1">
                                    Rate plan
                                  </label>
                                  <select
                                    id="stay-rateplan-select"
                                    value={planDraft.ratePlanId}
                                    onChange={(e) =>
                                      updateDraft((prev) => ({ ...prev, ratePlanId: e.target.value }))
                                    }
                                    className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-xl bg-white text-xs font-semibold"
                                  >
                                    <option value="">Standard published room rate</option>
                                    {availableRatePlans.map((rp) => (
                                      <option key={rp.id} value={rp.id}>
                                        {rp.internalRateName}
                                        {typeof rp.amountUSD === 'number' && rp.amountUSD > 0 ? ` — US$${rp.amountUSD}` : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {availableMealPlans.length > 0 && (
                                <div>
                                  <label htmlFor="stay-mealplan-select" className="block text-xs font-bold text-gray-700 mb-1">
                                    Meal plan
                                  </label>
                                  <select
                                    id="stay-mealplan-select"
                                    value={planDraft.mealPlanId}
                                    onChange={(e) =>
                                      updateDraft((prev) => ({ ...prev, mealPlanId: e.target.value }))
                                    }
                                    className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-xl bg-white text-xs font-semibold"
                                  >
                                    <option value="">Standard included board</option>
                                    {availableMealPlans.map((m) => (
                                      <option key={m.id} value={m.id}>
                                        {m.name} (+US${m.supplementPerPersonPerNightUSD})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {availableOffers.length > 0 && (
                                <div className="sm:col-span-2">
                                  <label htmlFor="stay-offer-select" className="block text-xs font-bold text-gray-700 mb-1">
                                    Special offer
                                  </label>
                                  <select
                                    id="stay-offer-select"
                                    value={planDraft.offerId}
                                    onChange={(e) =>
                                      updateDraft((prev) => ({ ...prev, offerId: e.target.value }))
                                    }
                                    className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-xl bg-white text-xs font-semibold"
                                  >
                                    <option value="">No offer attached</option>
                                    {availableOffers.map((off) => (
                                      <option key={off.id} value={off.id}>
                                        {off.title}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              <label className="sm:col-span-2 flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={planDraft.familyRoomRequested}
                                  onChange={(e) =>
                                    updateDraft((prev) => ({
                                      ...prev,
                                      familyRoomRequested: e.target.checked,
                                      requestedRooms: e.target.checked && !prev.requestedRooms ? 1 : prev.requestedRooms,
                                    }))
                                  }
                                />
                                <span>Request family / interleading room configuration</span>
                              </label>
                            </div>
                          )}

                          {/* Stay Tiers when no specific property chosen */}
                          {!selectedProperty && STAY_TIERS.length > 0 && (
                            <div className="space-y-3 pt-2 border-t border-gray-100">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-bold text-gray-700">Or choose a general stay style</span>
                                <div className="flex items-center gap-2">
                                  <label htmlFor="tier-rooms-count" className="text-xs font-semibold text-gray-600">
                                    Rooms:
                                  </label>
                                  <select
                                    id="tier-rooms-count"
                                    value={planDraft.requestedRooms ?? ''}
                                    onChange={(e) =>
                                      updateDraft((prev) => ({
                                        ...prev,
                                        requestedRooms: e.target.value ? Number(e.target.value) : null,
                                      }))
                                    }
                                    className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold bg-white"
                                  >
                                    <option value="">Rooms...</option>
                                    {[1, 2, 3, 4, 5].map((cnt) => (
                                      <option key={cnt} value={cnt}>
                                        {cnt} {cnt === 1 ? 'Room' : 'Rooms'}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {STAY_TIERS.map((tier) => {
                                  const isPicked = planDraft.stayTierId === tier.id;
                                  return (
                                    <button
                                      key={tier.id}
                                      type="button"
                                      onClick={() =>
                                        updateDraft((prev) => ({
                                          ...prev,
                                          accommodationId: '',
                                          stayTierId: tier.id,
                                        }))
                                      }
                                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                                        isPicked
                                          ? 'border-[#0D5C75] bg-[#0D5C75]/8 ring-2 ring-[#0D5C75]'
                                          : 'border-gray-200 bg-white hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-sm text-[#0D5C75]">{tier.name}</span>
                                        <span className="text-xs font-bold text-[#D97706]">
                                          ~US${tier.pricePerNightUSD}/room/night
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">{tier.tagline}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* SECTION 3: ACTIVITIES */}
              {activeSection === 'activities' && (
                <section className="space-y-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                      Experiences
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                      What would you like to do?
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Search or filter experiences, pick your preferred day or time if known, or add a single cruise without adding a stay.
                    </p>
                  </div>

                  {/* Pinned selected bar visible regardless of category/search filter */}
                  {planDraft.selectedActivities.length > 0 && (
                    <div className="bg-[#3F6B3C]/8 border border-[#3F6B3C]/25 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <strong className="text-[#2F5230]">
                          Selected for your plan ({planDraft.selectedActivities.length})
                        </strong>
                        <button
                          type="button"
                          onClick={() => updateDraft((prev) => ({ ...prev, selectedActivities: [] }))}
                          className="text-red-600 font-bold hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ctx.activities.map((a) => (
                          <span
                            key={a.id}
                            className="inline-flex items-center gap-1.5 bg-white border border-[#3F6B3C]/30 rounded-full px-3 py-1 text-xs font-semibold text-[#0D2833]"
                          >
                            <span>{a.title}</span>
                            <button
                              type="button"
                              aria-label={`Remove ${a.title}`}
                              onClick={() => toggleActivityInPlan(a.id)}
                              className="text-gray-400 hover:text-red-600 font-bold cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search + Category Pills + Selected View */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="search"
                        aria-label="Search activities"
                        placeholder="Search activities (e.g. Sunset Cruise, Helicopter, Chobe)..."
                        value={activitySearch}
                        onChange={(e) => setActivitySearch(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D5C75]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {ACTIVITY_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActivityCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                            activityCategory === cat.id
                              ? 'bg-[#0D5C75] text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setActivityCategory('selected')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          activityCategory === 'selected'
                            ? 'bg-[#3F6B3C] text-white'
                            : 'bg-[#3F6B3C]/10 border border-[#3F6B3C]/30 text-[#2F5230]'
                        }`}
                      >
                        Selected ({planDraft.selectedActivities.length})
                      </button>
                    </div>
                  </div>

                  {filteredActivities.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs text-gray-600 space-y-2">
                      <p className="font-bold text-sm text-[#0D5C75]">No matching activities</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActivitySearch('');
                          setActivityCategory('all');
                        }}
                        className="text-xs font-bold text-[#0B5E8E] underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredActivities.map((act) => {
                        const sel = planDraft.selectedActivities.find((s) => s.id === act.id);
                        const isSelected = Boolean(sel);
                        const basisText =
                          act.priceBasis === 'on_request'
                            ? 'Price on request'
                            : act.priceUSD === 0 && act.rateStatus === 'confirmed'
                            ? 'Free ($0)'
                            : `US$${act.priceUSD} ${(act.priceBasis || 'per_adult').replace('_', ' ')}`;

                        return (
                          <div
                            key={act.id}
                            className={`rounded-2xl border bg-white overflow-hidden shadow-xs flex flex-col justify-between ${
                              isSelected ? 'border-[#0D5C75] ring-2 ring-[#0D5C75]/30' : 'border-gray-200'
                            }`}
                          >
                            <div>
                              <div className="relative h-36 overflow-hidden bg-gray-100">
                                <img
                                  src={act.imageUrl}
                                  alt={act.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                  <span className="bg-[#D97706] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {act.badge}
                                  </span>
                                  {act.suggestedByDefault && (
                                    <span className="bg-white text-[#0D5C75] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-end justify-between gap-2">
                                  <div>
                                    <h3 className="font-serif font-bold text-sm leading-tight">{act.title}</h3>
                                    <span className="text-[11px] text-gray-200">{act.duration}</span>
                                  </div>
                                  <span className="text-xs font-bold bg-black/60 px-2 py-0.5 rounded-md border border-white/20 shrink-0">
                                    {basisText}
                                  </span>
                                </div>
                              </div>

                              <div className="p-4 space-y-2 text-xs">
                                <p className="text-gray-600 leading-relaxed">{act.shortDesc}</p>
                                <p className="text-[11px] text-gray-500">
                                  {act.rateStatus === 'confirmed' ? 'Published guide rate' : 'Estimated'}
                                  {typeof act.childRateUnder11USD === 'number'
                                    ? ` · Child (<11): US$${act.childRateUnder11USD}`
                                    : act.priceBasis === 'per_adult' || act.priceBasis === 'per_person'
                                    ? ' · Child (<11) price on request'
                                    : ''}
                                </p>

                                {isSelected && sel && renderActivityScheduleControls(act, sel, 'catalog')}
                              </div>
                            </div>

                            <div className="p-4 pt-0">
                              <button
                                type="button"
                                onClick={() => toggleActivityInPlan(act.id)}
                                className={`w-full min-h-[42px] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                    : 'bg-[#0D5C75] text-white hover:bg-[#09475c]'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add activity</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* SECTION 4: TRANSFERS */}
              {activeSection === 'transfers' && (
                <section className="space-y-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                      Transfers &amp; Logistics
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                      Do you need a transfer?
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {transferOptions.length > 0
                        ? 'Choose from transfer routes below, ask us for a custom quote, or mark transport already arranged.'
                        : 'Tell us where you’re going and we’ll quote your transfer, or mark transport already arranged.'}
                    </p>
                  </div>

                  {transferOptions.length === 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: 'recommend', label: 'Get a transfer quote', desc: 'Tell us where you’re going and we’ll quote your transfer.' },
                          { id: 'already-arranged', label: 'Transport already arranged', desc: 'Excluded from your estimate' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                transferArrangement:
                                  prev.transferArrangement === opt.id
                                    ? 'none'
                                    : (opt.id as TransferArrangement),
                                transferId: '',
                              }))
                            }
                            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                              planDraft.transferArrangement === opt.id
                                ? 'border-[#0D5C75] bg-[#0D5C75]/8 ring-2 ring-[#0D5C75]'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <span className="font-bold text-sm text-[#0D5C75] block">{opt.label}</span>
                            <span className="text-xs text-gray-500 mt-0.5 block">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 bg-white rounded-xl border border-gray-200 px-4 py-3">
                        Tell us where you’re going and we’ll quote your transfer — tap <strong>Get a transfer quote</strong> above and share your flight or pickup time if you have it.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'selected', label: 'Select a transfer route', desc: 'Pick a route & rate below' },
                          { id: 'recommend', label: 'Get a transfer quote', desc: 'Tell us where you’re going' },
                          { id: 'already-arranged', label: 'Transport already arranged', desc: 'Excluded from estimate' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                transferArrangement:
                                  prev.transferArrangement === opt.id
                                    ? 'none'
                                    : (opt.id as TransferArrangement),
                              }))
                            }
                            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                              planDraft.transferArrangement === opt.id
                                ? 'border-[#0D5C75] bg-[#0D5C75]/8 ring-2 ring-[#0D5C75]'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <span className="font-bold text-sm text-[#0D5C75] block">{opt.label}</span>
                            <span className="text-xs text-gray-500 mt-0.5 block">{opt.desc}</span>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3">
                        {transferOptions.map((tr) => {
                          const isPicked =
                            planDraft.transferArrangement === 'selected' &&
                            planDraft.transferId === tr.id;
                          const priceLabel =
                            typeof tr.priceUSD === 'number' && tr.priceBasis !== 'on_request'
                              ? `US$${tr.priceUSD} ${(tr.priceBasis || 'per_vehicle').replaceAll('_', ' ')}`
                              : 'Price on request';
                          return (
                            <div
                              key={tr.id}
                              className={`bg-white rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isPicked ? 'border-[#0D5C75] ring-2 ring-[#0D5C75]/30' : 'border-gray-200'
                              }`}
                            >
                              <div className="space-y-1 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm text-[#0D5C75]">{tr.title}</span>
                                  <span className="bg-[#D97706]/10 text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {tr.badge}
                                  </span>
                                </div>
                                {tr.route && <p className="font-semibold text-gray-700">{tr.route}</p>}
                                <p className="text-gray-600">{tr.desc}</p>
                                <p className="font-bold text-[#0B5E8E]">
                                  {priceLabel} · {tr.rateStatus === 'confirmed' ? 'Published guide rate' : 'Estimated'}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  updateDraft((prev) => ({
                                    ...prev,
                                    transferArrangement: isPicked ? 'none' : 'selected',
                                    transferId: isPicked ? '' : tr.id,
                                  }))
                                }
                                className={`shrink-0 min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                                  isPicked
                                    ? 'bg-[#3F6B3C] text-white'
                                    : 'bg-[#0D5C75] text-white hover:bg-[#09475c]'
                                }`}
                              >
                                {isPicked ? 'Selected (Remove)' : 'Add this transfer'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {(planDraft.transferArrangement === 'selected' ||
                    planDraft.transferArrangement === 'recommend') && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-[#0D5C75]">
                          Flight &amp; transfer timing
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Reuse your trip arrival or departure date, or set a separate flight time and pickup time.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                          Transfer date
                        </span>
                        {(planDraft.arrivalDate || planDraft.departureDate) && (
                          <div className="flex flex-wrap gap-2">
                            {planDraft.arrivalDate && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateDraft((prev) => ({
                                    ...prev,
                                    transferDate: prev.arrivalDate,
                                  }))
                                }
                                className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                                  (planDraft.transferDate || planDraft.arrivalDate) ===
                                  planDraft.arrivalDate
                                    ? 'border-[#0D5C75] bg-[#0D5C75] text-white'
                                    : 'border-gray-200 bg-gray-50 text-gray-700'
                                }`}
                              >
                                Arrival ({formatShortIsoDay(planDraft.arrivalDate)})
                              </button>
                            )}
                            {planDraft.departureDate && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateDraft((prev) => ({
                                    ...prev,
                                    transferDate: prev.departureDate,
                                  }))
                                }
                                className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${
                                  planDraft.transferDate === planDraft.departureDate
                                    ? 'border-[#0D5C75] bg-[#0D5C75] text-white'
                                    : 'border-gray-200 bg-gray-50 text-gray-700'
                                }`}
                              >
                                Departure ({formatShortIsoDay(planDraft.departureDate)})
                              </button>
                            )}
                          </div>
                        )}
                        <input
                          id="plan-transfer-date"
                          type="date"
                          aria-label="Transfer date"
                          min={todayIso}
                          value={planDraft.transferDate || planDraft.arrivalDate}
                          onChange={(e) =>
                            updateDraft((prev) => ({
                              ...prev,
                              transferDate: e.target.value,
                            }))
                          }
                          className="w-full sm:w-64 min-h-[42px] px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="plan-flight-time"
                            className="block text-xs font-bold text-gray-700"
                          >
                            Flight arrival or departure time
                          </label>
                          <input
                            id="plan-flight-time"
                            type="time"
                            disabled={planDraft.flightTimeUnknown}
                            value={planDraft.flightTimeUnknown ? '' : planDraft.flightTime}
                            onChange={(e) =>
                              updateDraft((prev) => ({
                                ...prev,
                                flightTime: e.target.value,
                                flightTimeUnknown: false,
                              }))
                            }
                            className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:bg-gray-100"
                          />
                          <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer pt-0.5">
                            <input
                              type="checkbox"
                              checked={planDraft.flightTimeUnknown}
                              onChange={(e) =>
                                updateDraft((prev) => ({
                                  ...prev,
                                  flightTimeUnknown: e.target.checked,
                                  flightTime: e.target.checked ? '' : prev.flightTime,
                                }))
                              }
                              className="w-4 h-4 accent-[#0D5C75] rounded"
                            />
                            <span>I don’t know my flight time yet</span>
                          </label>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="plan-pickup-time"
                            className="block text-xs font-bold text-gray-700"
                          >
                            Preferred pickup time (optional)
                          </label>
                          <input
                            id="plan-pickup-time"
                            type="time"
                            value={planDraft.pickupTime}
                            onChange={(e) =>
                              updateDraft((prev) => ({
                                ...prev,
                                pickupTime: e.target.value,
                              }))
                            }
                            className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                          />
                          <p className="text-[11px] text-gray-500">
                            Recorded separately from your flight time for lodge or hotel pickups.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* SECTION 5: REVIEW & SEND */}
              {activeSection === 'review' && (
                <section className="space-y-6">
                  {planSubmitted ? (
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-md text-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-[#3F6B3C]/10 text-[#3F6B3C] flex items-center justify-center mx-auto">
                        <Check className="w-7 h-7" />
                      </div>
                      <h2 className="text-2xl font-serif font-bold text-[#0D5C75]">
                        Enquiry sent
                      </h2>
                      <p className="text-xs font-semibold text-[#2F5230]">
                        We’ll reply by {replyMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}.
                      </p>
                      <EnquiryConfirmation result={submission.result} />
                      {submission.result?.rateChanged && (
                        <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                          Note: Published guide rates updated during review — our specialist has received the latest breakdown.
                        </p>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                        <a
                          href={buildPlannerPlanWhatsAppUrl({ ctx, name: fullName, replyMethod, notes })}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackEnquiryEvent('builder_whatsapp_opened', {
                              category: 'post-submit',
                              sourcePage: 'review',
                            })
                          }
                          className="flex-1 bg-[#25D366] hover:bg-[#1fb857] text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Share my plan on WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={onClose}
                          className="flex-1 bg-[#0D5C75] text-white font-bold text-xs py-3 px-4 rounded-xl cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                          Your trip
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                          Review your trip
                        </h2>
                      </div>

                      {/* Editable section summary cards */}
                      <div className="space-y-3 text-xs">
                        {/* Dates & Guests Card */}
                        {enabledSections.datesGuests && (
                          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-[#0D5C75] flex items-center gap-1.5 text-sm">
                                <Calendar className="w-4 h-4" /> Dates &amp; guests
                              </span>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => navigateSection('dates-guests', true, 'dates')}
                                  className="text-[#0B5E8E] font-bold hover:underline cursor-pointer"
                                >
                                  Edit dates
                                </button>
                                <button
                                  type="button"
                                  onClick={() => navigateSection('dates-guests', true, 'guests')}
                                  className="text-[#0B5E8E] font-bold hover:underline cursor-pointer"
                                >
                                  Edit guests
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-800 font-medium">
                              {planDraft.timingMode === 'exact-dates' && planDraft.arrivalDate && planDraft.departureDate
                                ? `${planDraft.arrivalDate} to ${planDraft.departureDate}${ctx.draft.nights ? ` (${ctx.draft.nights} night${ctx.draft.nights === 1 ? '' : 's'})` : ''}`
                                : planDraft.timingMode === 'approx-month' && planDraft.approxMonth
                                ? `${planDraft.approxMonth}${ctx.draft.nights ? ` · ${ctx.draft.nights} night${ctx.draft.nights === 1 ? '' : 's'}` : ''}`
                                : planDraft.timingMode === 'flexible'
                                ? `Flexible dates${ctx.draft.nights ? ` (${ctx.draft.nights} night${ctx.draft.nights === 1 ? '' : 's'})` : ''}`
                                : 'Dates not chosen'}
                            </p>
                            <p className="text-gray-600">
                              {planDraft.adults !== null || planDraft.childAgesYears.length > 0
                                ? `${planDraft.adults ?? 0} Adult(s)${
                                    planDraft.childAgesYears.length > 0
                                      ? `, ${planDraft.childAgesYears.length} Child(ren) (${planDraft.childAgesYears
                                          .map((age, i) => `Child ${i + 1}: age ${age}${age < 11 ? ' <11' : ' 11+'}`)
                                          .join(', ')})`
                                      : ''
                                  } · ${
                                    planDraft.visitorCategory === 'zimbabwe_resident'
                                      ? 'Zimbabwe Resident'
                                      : planDraft.visitorCategory === 'sadc_resident'
                                      ? 'SADC Resident'
                                      : 'International Visitor'
                                  }`
                                : 'Guest counts not set yet'}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Stay Card */}
                          {enabledSections.stay && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-[#0D5C75] flex items-center gap-1.5 text-sm">
                                    <Hotel className="w-4 h-4" /> Stay
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => navigateSection('stay', true)}
                                    className="text-[#0B5E8E] font-bold hover:underline cursor-pointer"
                                  >
                                    {planDraft.stayArrangement === 'selected' ? 'Change room' : 'Change stay'}
                                  </button>
                                </div>
                                {planDraft.stayArrangement === 'already-arranged' ? (
                                  <p className="text-gray-700">Already arranged independently</p>
                                ) : planDraft.stayArrangement === 'recommend' ? (
                                  <p className="text-gray-700">Specialist recommendations requested</p>
                                ) : ctx.property ? (
                                  <div className="space-y-0.5 text-gray-700">
                                    <p className="font-bold text-[#0D2833]">{ctx.property.name}</p>
                                    {selectedRoomObj && <p>Room: {selectedRoomObj.name}</p>}
                                    {selectedRatePlanObj && <p>Rate plan: {selectedRatePlanObj.internalRateName}</p>}
                                    {selectedMealPlanObj && <p>Board: {selectedMealPlanObj.name}</p>}
                                    {selectedOfferObj && <p>Offer: {selectedOfferObj.title}</p>}
                                    <p>
                                      Rooms:{' '}
                                      {planDraft.requestedRooms
                                        ? `${planDraft.requestedRooms} ${planDraft.requestedRooms === 1 ? 'room' : 'rooms'}`
                                        : '1 room (default on quote)'}
                                      {planDraft.familyRoomRequested ? ' · Family/interleading requested' : ''}
                                    </p>
                                  </div>
                                ) : ctx.stayTier ? (
                                  <div className="space-y-0.5 text-gray-700">
                                    <p className="font-bold text-[#0D2833]">{ctx.stayTier.name}</p>
                                    <p>
                                      Rooms:{' '}
                                      {planDraft.requestedRooms
                                        ? `${planDraft.requestedRooms} ${planDraft.requestedRooms === 1 ? 'room' : 'rooms'}`
                                        : 'To be confirmed'}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-gray-600">No stay added (optional for day trips/cruises)</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Transfers Card */}
                          {enabledSections.transfers && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-[#0D5C75] flex items-center gap-1.5 text-sm">
                                    <Plane className="w-4 h-4" /> Transfers
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => navigateSection('transfers', true)}
                                    className="text-[#0B5E8E] font-bold hover:underline cursor-pointer"
                                  >
                                    Change transfer
                                  </button>
                                </div>
                                {planDraft.transferArrangement === 'already-arranged' ? (
                                  <p className="text-gray-700">Transport already arranged independently</p>
                                ) : planDraft.transferArrangement === 'recommend' ? (
                                  <div className="space-y-0.5 text-gray-700">
                                    <p>Transfer options &amp; pricing requested</p>
                                    {(planDraft.transferDate || planDraft.arrivalDate) && (
                                      <p className="text-gray-500">
                                        Date: {formatShortIsoDay(planDraft.transferDate || planDraft.arrivalDate)}
                                      </p>
                                    )}
                                    {(planDraft.flightTimeUnknown || planDraft.flightTime) && (
                                      <p className="text-gray-500">
                                        Flight time:{' '}
                                        {planDraft.flightTimeUnknown
                                          ? 'To be confirmed'
                                          : planDraft.flightTime}
                                      </p>
                                    )}
                                    {planDraft.pickupTime && (
                                      <p className="text-gray-500">Pickup time: {planDraft.pickupTime}</p>
                                    )}
                                  </div>
                                ) : ctx.transferOption ? (
                                  <div className="space-y-0.5 text-gray-700">
                                    <p className="font-bold text-[#0D2833]">{ctx.transferOption.title}</p>
                                    {ctx.transferOption.route && <p>{ctx.transferOption.route}</p>}
                                    <p className="text-[#0B5E8E] font-semibold">
                                      {typeof ctx.transferOption.priceUSD === 'number' &&
                                      ctx.transferOption.priceBasis !== 'on_request'
                                        ? `US$${ctx.transferOption.priceUSD} ${(ctx.transferOption.priceBasis || 'per_vehicle').replaceAll('_', ' ')}`
                                        : 'Price on request'}
                                    </p>
                                    {(planDraft.transferDate || planDraft.arrivalDate) && (
                                      <p className="text-gray-500">
                                        Date: {formatShortIsoDay(planDraft.transferDate || planDraft.arrivalDate)}
                                      </p>
                                    )}
                                    {(planDraft.flightTimeUnknown || planDraft.flightTime) && (
                                      <p className="text-gray-500">
                                        Flight time:{' '}
                                        {planDraft.flightTimeUnknown
                                          ? 'To be confirmed'
                                          : planDraft.flightTime}
                                      </p>
                                    )}
                                    {planDraft.pickupTime && (
                                      <p className="text-gray-500">Pickup time: {planDraft.pickupTime}</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-600">No transfer added yet</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Activities Card (Per-Row Day/Time Edit + Remove + Add Another) */}
                        {enabledSections.activities && (
                          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-[#0D5C75] flex items-center gap-1.5 text-sm">
                                <Compass className="w-4 h-4" /> Selected activities ({ctx.activities.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => navigateSection('activities', true)}
                                className="inline-flex items-center gap-1 text-[#0B5E8E] font-bold hover:underline cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add another activity</span>
                              </button>
                            </div>

                            {ctx.activities.length === 0 ? (
                              <p className="text-gray-600">No activities selected yet.</p>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {ctx.activities.map((act) => {
                                  const sel = planDraft.selectedActivities.find((s) => s.id === act.id);
                                  const isOutOfRange = sel
                                    ? isActivityDateOutsideTrip(sel, planDraft.arrivalDate, planDraft.departureDate)
                                    : false;
                                  const matchedTripDay = sel?.activityDate
                                    ? tripCalendarDays.find((d) => d.dateIso === sel.activityDate)
                                    : undefined;
                                  const dayLabel = isOutOfRange
                                    ? `New date needed (was ${formatShortIsoDay(sel?.activityDate || sel?.preferredDay || '')})`
                                    : matchedTripDay
                                    ? matchedTripDay.label
                                    : sel?.activityDate
                                    ? formatShortIsoDay(sel.activityDate)
                                    : sel?.preferredDay && sel.preferredDay !== 'to-be-scheduled'
                                    ? sel.preferredDay.replace(/^day-/i, 'Day ')
                                    : 'To be scheduled';
                                  const rawTime =
                                    sel?.preferredTime && sel.preferredTime !== 'to-be-arranged'
                                      ? sel.preferredTime
                                      : getDefaultTimeForActivity(act);
                                  const timeLabel = formatTimeSlotDisplayLabel(rawTime);
                                  const isEditingThis = expandedReviewActivityId === act.id;
                                  const actPriceLabel =
                                    act.priceBasis === 'on_request'
                                      ? 'Price on request'
                                      : act.priceUSD === 0 && act.rateStatus === 'confirmed'
                                      ? 'Free ($0)'
                                      : `US$${act.priceUSD} ${(act.priceBasis || 'per_adult').replace('_', ' ')}`;

                                  return (
                                    <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 space-y-2">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                          <p className="font-bold text-[#0D2833]">{act.title}</p>
                                          <p className="text-gray-600">
                                            {actPriceLabel} ·{' '}
                                            <span className={isOutOfRange ? 'font-bold text-amber-800' : ''}>
                                              {dayLabel}
                                            </span>{' '}
                                            · {timeLabel}
                                          </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setExpandedReviewActivityId((cur) =>
                                                cur === act.id ? null : act.id
                                              )
                                            }
                                            className={`font-bold hover:underline cursor-pointer ${
                                              isOutOfRange ? 'text-amber-700' : 'text-[#0B5E8E]'
                                            }`}
                                          >
                                            {isEditingThis
                                              ? 'Done timing'
                                              : isOutOfRange
                                              ? 'Choose a new day'
                                              : 'Change day or time'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => toggleActivityInPlan(act.id)}
                                            className="text-red-600 font-bold hover:underline cursor-pointer"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>

                                      {isEditingThis && sel && (
                                        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-200">
                                          {renderActivityScheduleControls(act, sel, 'review')}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Synchronized Itemized Estimate Breakdown */}
                      <div className="bg-white rounded-2xl border border-[#0D5C75]/30 p-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C75] block">
                              {ctx.itemized.subtotalUSD === null && ctx.itemized.needsGuestCount
                                ? 'Your trip'
                                : ctx.itemized.headlineLabel}
                            </span>
                            {ctx.itemized.hasProvisionalRates && (
                              <span className="text-[11px] text-gray-500">
                                Includes provisional rates confirmed on quotation
                              </span>
                            )}
                          </div>
                          <span className="text-xl sm:text-2xl font-serif font-extrabold text-[#0D5C75]">
                            {ctx.itemized.subtotalUSD !== null
                              ? `US$${ctx.itemized.subtotalUSD.toLocaleString('en-US')}`
                              : ctx.itemized.needsGuestCount
                              ? '—'
                              : 'Get a quote'}
                          </span>
                        </div>

                        {ctx.itemized.lines.length > 0 && (
                          <div className="divide-y divide-gray-100 text-xs">
                            {ctx.itemized.lines.map((line, i) => (
                              <div key={`${line.section}-${i}`} className="py-2 flex items-start justify-between gap-3">
                                <div>
                                  <span className="font-bold text-[#0D2833]">{line.title}</span>
                                  <span className="text-gray-500 block">{line.basis}</span>
                                </div>
                                <span className="font-bold text-[#0D5C75] whitespace-nowrap">
                                  {line.amountUSD !== null
                                    ? line.status === 'free'
                                      ? 'Free ($0)'
                                      : `US$${line.amountUSD.toLocaleString('en-US')}`
                                    : line.status === 'arranged'
                                    ? 'Arranged'
                                    : line.basis.includes('Add guests to see your total')
                                    ? '—'
                                    : 'Price on request'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {ctx.itemized.excludedItems.length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                            <strong>Excludes:</strong> {ctx.itemized.excludedItems.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Synchronized Schedule / Day-by-Day Outline */}
                      {ctx.itinerary.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
                          <h3 className="text-sm font-serif font-bold text-[#0D5C75]">
                            Your trip outline
                          </h3>
                          <div className="space-y-3">
                            {ctx.itinerary.map((dayItem, idx) => (
                              <div key={`${dayItem.day}-${idx}`} className="flex gap-3 items-start text-xs">
                                <span className="bg-[#0D5C75] text-white font-bold px-2.5 py-1 rounded-md shrink-0 whitespace-nowrap">
                                  {dayItem.day}
                                </span>
                                <div>
                                  <p className="font-bold text-[#1A2E35]">{dayItem.title}</p>
                                  <p className="text-gray-600">{dayItem.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. SEND THE PLAN: Two clear actions below summary; website form revealed only when requested */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                          <div className="text-center space-y-1">
                            <a
                              href={buildPlannerPlanWhatsAppUrl({
                                ctx,
                                name: showReviewEnquiryForm ? fullName : undefined,
                                replyMethod,
                                includeReplyMethod: showReviewEnquiryForm,
                                notes: showReviewEnquiryForm ? notes : undefined,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                trackEnquiryEvent('builder_whatsapp_opened', {
                                  category: 'review-share',
                                  sourcePage: 'review',
                                })
                              }
                              className="w-full min-h-[48px] bg-[#25D366] hover:bg-[#1fb857] text-white font-bold text-sm py-3 px-5 rounded-xl flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Share my plan on WhatsApp</span>
                            </a>
                            <span className="block text-[11px] text-gray-500">
                              WhatsApp opens with your trip details ready to send.
                            </span>
                          </div>

                          {!showReviewEnquiryForm && (
                            <button
                              type="button"
                              onClick={() => setShowReviewEnquiryForm(true)}
                              className="w-full min-h-[48px] bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-3 px-5 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                              <span>Send an enquiry</span>
                            </button>
                          )}
                        </div>

                        {showReviewEnquiryForm && (
                          <form onSubmit={handleFullPlanSubmit} className="pt-4 border-t border-gray-100 space-y-4" noValidate>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-base sm:text-lg font-serif font-bold text-[#0D5C75]">
                                Send an enquiry
                              </h3>
                              <button
                                type="button"
                                onClick={() => setShowReviewEnquiryForm(false)}
                                className="text-xs font-semibold text-gray-500 hover:underline cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              <div>
                                <label htmlFor="plan-name" className="block text-xs font-bold text-gray-700 mb-1">
                                  Your Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  id="plan-name"
                                  type="text"
                                  required
                                  minLength={2}
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  placeholder="e.g. Sarah Jenkins"
                                  className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                                />
                              </div>

                              <div>
                                <span className="block text-xs font-bold text-gray-700 mb-1">
                                  How should we reply?
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReplyMethod('whatsapp')}
                                    className={`min-h-[44px] px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                                      replyMethod === 'whatsapp'
                                        ? 'border-[#0D5C75] bg-[#0D5C75]/10 text-[#0D5C75] ring-1 ring-[#0D5C75]'
                                        : 'border-gray-200 bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReplyMethod('email')}
                                    className={`min-h-[44px] px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                                      replyMethod === 'email'
                                        ? 'border-[#0D5C75] bg-[#0D5C75]/10 text-[#0D5C75] ring-1 ring-[#0D5C75]'
                                        : 'border-gray-200 bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>Email</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {replyMethod === 'whatsapp' ? (
                              <div>
                                <label htmlFor="plan-phone" className="block text-xs font-bold text-gray-700 mb-1">
                                  WhatsApp number <span className="text-red-500">*</span>
                                </label>
                                <input
                                  id="plan-phone"
                                  type="tel"
                                  required
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="+263 ... or +44 ..."
                                  className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                                />
                              </div>
                            ) : (
                              <div>
                                <label htmlFor="plan-email" className="block text-xs font-bold text-gray-700 mb-1">
                                  Email address <span className="text-red-500">*</span>
                                </label>
                                <input
                                  id="plan-email"
                                  type="email"
                                  required
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="you@example.com"
                                  className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                                />
                              </div>
                            )}

                            <div>
                              <label htmlFor="plan-notes" className="block text-xs font-bold text-gray-700 mb-1">
                                Notes or questions <span className="text-gray-400 font-normal">(optional)</span>
                              </label>
                              <textarea
                                id="plan-notes"
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Dietary needs, flight details, or room requests..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                              />
                            </div>

                            {planValidationMsg && (
                              <p role="alert" className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                                {planValidationMsg}
                              </p>
                            )}

                            <SubmissionSafety
                              submission={submission}
                              marketingConsent={marketingConsent}
                              onConsent={setMarketingConsent}
                              requireConsent={false}
                            />

                            <button
                              type="submit"
                              disabled={submission.pending}
                              className="w-full min-h-[48px] bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm py-3 px-5 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-4 h-4" />
                              <span>{submission.pending ? 'Sending...' : 'Send my enquiry'}</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* Bottom Desktop Section Advance Controls (when inside an edit section) */}
              {!planSubmitted && activeSection !== 'review' && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      const idx = visibleSectionItems.findIndex((s) => s.id === activeSection);
                      if (idx > 0) navigateSection(visibleSectionItems[idx - 1].id, false);
                    }}
                    disabled={visibleSectionItems.findIndex((s) => s.id === activeSection) <= 0}
                    className="min-h-[42px] px-4 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {editingFromReview ? (
                    <button
                      type="button"
                      onClick={() => navigateSection('review', false)}
                      className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0D5C75] hover:bg-[#09475c] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save and review</span>
                    </button>
                  ) : canReview ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {recommendedNext.nextOptional && (
                        <button
                          type="button"
                          onClick={() =>
                            navigateSection(recommendedNext.nextOptional!.section, false)
                          }
                          className="min-h-[42px] px-4 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-[#0D5C75] hover:bg-gray-50 cursor-pointer"
                        >
                          {recommendedNext.nextOptional.label}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigateSection('review', false)}
                        className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#d36e17] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <span>Review my trip</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const idx = visibleSectionItems.findIndex((s) => s.id === activeSection);
                        const next = visibleSectionItems[Math.min(visibleSectionItems.length - 1, idx + 1)];
                        if (next) navigateSection(next.id, false);
                      }}
                      className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#d36e17] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <span>
                        Continue to{' '}
                        {visibleSectionItems[
                          Math.min(
                            visibleSectionItems.length - 1,
                            visibleSectionItems.findIndex((s) => s.id === activeSection) + 1
                          )
                        ]?.label || 'Review'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* DESKTOP STICKY TRIP PLAN SIDEBAR */}
            {!planSubmitted && (
              <aside className="hidden lg:block w-80 xl:w-96 border-l border-gray-200 bg-white p-6 space-y-5 overflow-y-auto shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
                    Live Summary
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#0D5C75]">Your trip</h3>
                </div>

                {/* Live estimate box */}
                <div className="p-4 rounded-2xl bg-[#0D5C75] text-white space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">
                    {ctx.itemized.headlineLabel}
                  </span>
                  <span className="text-xl font-serif font-extrabold block">
                    {ctx.itemized.subtotalUSD !== null
                      ? `US$${ctx.itemized.subtotalUSD.toLocaleString('en-US')}`
                      : ctx.itemized.needsGuestCount
                      ? 'Add guests to see your total'
                      : 'Get a quote'}
                  </span>
                  {ctx.itemized.excludedItems.length > 0 && (
                    <span className="text-[11px] text-amber-200 block">
                      Excludes: {ctx.itemized.excludedItems.join(', ')}
                    </span>
                  )}
                </div>

                {/* Compact selections overview */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100">
                    <div>
                      <span className="font-bold text-[#0D5C75] flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Dates &amp; guests
                      </span>
                      <span className="text-gray-600 block mt-0.5">
                        {planDraft.timingMode === 'exact-dates' && planDraft.arrivalDate && planDraft.departureDate
                          ? `${formatShortIsoDay(planDraft.arrivalDate)} – ${formatShortIsoDay(planDraft.departureDate)}`
                          : planDraft.timingMode === 'approx-month' && planDraft.approxMonth
                          ? planDraft.approxMonth
                          : planDraft.timingMode === 'flexible'
                          ? 'Flexible dates'
                          : 'Dates not chosen'}
                        {' · '}
                        {planDraft.adults !== null
                          ? `${planDraft.adults} Adult(s)${
                              planDraft.childAgesYears.length > 0
                                ? `, ${planDraft.childAgesYears.length} Child(ren)`
                                : ''
                            }`
                          : 'Guests not added'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateSection('dates-guests', activeSection === 'review')}
                      className="text-[#0B5E8E] font-bold hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  {ctx.itemized.lines.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {ctx.itemized.lines.map((l, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-bold text-[#0D2833] block truncate">{l.title}</span>
                            <span className="text-[11px] text-gray-500 block">{l.basis}</span>
                          </div>
                          <span className="font-bold text-[#0D5C75] shrink-0">
                            {l.amountUSD !== null ? (l.status === 'free' ? 'Free' : `$${l.amountUSD}`) : 'Quote'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Your plan is empty — add only what you need.</p>
                  )}
                </div>

                {activeSection !== 'review' && (
                  <button
                    type="button"
                    disabled={!canReview}
                    onClick={() => navigateSection('review', false)}
                    className="w-full min-h-[44px] bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer disabled:opacity-40"
                  >
                    Review my trip
                  </button>
                )}
              </aside>
            )}
          </div>

          {/* MOBILE COMPACT STICKY BOTTOM BAR ("View estimate" + next action) */}
          {!planSubmitted && (
            <div
              className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-8px_24px_rgba(13,40,51,0.12)]"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {mobileEstimateOpen && (
                <div className="p-3.5 bg-[#FAF9F6] border-b border-gray-200 max-h-64 overflow-y-auto text-xs space-y-2.5">
                  <div className="flex items-center justify-between font-bold text-[#0D5C75]">
                    <span>{ctx.itemized.headlineLabel}</span>
                    <span>
                      {ctx.itemized.subtotalUSD !== null
                        ? `US$${ctx.itemized.subtotalUSD.toLocaleString('en-US')}`
                        : ctx.itemized.needsGuestCount
                        ? 'Add guests to see your total'
                        : 'Get a quote'}
                    </span>
                  </div>
                  {ctx.itemized.lines.length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic">
                      No priced items added yet — add only what you need.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {ctx.itemized.lines.map((l, i) => {
                        const targetSec: BuilderSectionId =
                          l.section === 'Stay'
                            ? 'stay'
                            : l.section === 'Activities'
                            ? 'activities'
                            : 'transfers';
                        return (
                          <div
                            key={`${l.section}-${l.title}-${i}`}
                            className="p-2 rounded-xl bg-white border border-gray-200 flex items-start justify-between gap-2 text-[11px]"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <span className="font-bold text-[#0D2833] block truncate">{l.title}</span>
                              <span className="text-gray-500 block">{l.basis}</span>
                              <div className="flex items-center gap-3 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => navigateSection(targetSec, activeSection === 'review')}
                                  className="font-bold text-[#0B5E8E] hover:underline cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (l.section === 'Stay') {
                                      updateDraft((prev) => ({
                                        ...prev,
                                        stayArrangement: 'none',
                                        accommodationId: '',
                                        roomId: '',
                                        ratePlanId: '',
                                        mealPlanId: '',
                                        offerId: '',
                                        stayTierId: '',
                                        requestedRooms: null,
                                      }));
                                    } else if (l.section === 'Transfers') {
                                      updateDraft((prev) => ({
                                        ...prev,
                                        transferArrangement: 'none',
                                        transferId: '',
                                      }));
                                    } else {
                                      const matched = ctx.activities.find((a) => a.title === l.title);
                                      if (matched) toggleActivityInPlan(matched.id);
                                    }
                                  }}
                                  className="font-bold text-red-600 hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <span className="font-bold text-[#0D5C75] shrink-0">
                              {l.amountUSD !== null
                                ? l.status === 'free'
                                  ? 'Free'
                                  : `$${l.amountUSD}`
                                : 'Quote'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {ctx.itemized.excludedItems.length > 0 && (
                    <p className="text-[11px] text-amber-800">
                      Price on request: {ctx.itemized.excludedItems.join(', ')}
                    </p>
                  )}
                  {activeSection !== 'review' && (
                    <button
                      type="button"
                      disabled={!canReview}
                      onClick={() => navigateSection('review', false)}
                      className="w-full min-h-[40px] rounded-xl bg-[#0D5C75] text-white font-bold text-xs cursor-pointer disabled:opacity-40"
                    >
                      Review my trip
                    </button>
                  )}
                </div>
              )}

              <div className="px-3 py-2.5 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setMobileEstimateOpen((o) => !o)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[#0D5C75]/8 text-[#0D5C75] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    {ctx.itemized.subtotalUSD !== null
                      ? `US$${ctx.itemized.subtotalUSD.toLocaleString('en-US')}`
                      : 'View estimate'}
                  </span>
                  {mobileEstimateOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>

                {editingFromReview ? (
                  <button
                    type="button"
                    onClick={() => navigateSection('review', false)}
                    className="flex-1 min-h-[44px] px-4 rounded-xl bg-[#0D5C75] text-white text-xs font-bold cursor-pointer"
                  >
                    Save and review
                  </button>
                ) : activeSection !== 'review' ? (
                  <button
                    type="button"
                    onClick={() =>
                      canReview
                        ? navigateSection('review', false)
                        : navigateSection(recommendedNext.section, false)
                    }
                    className="flex-1 min-h-[44px] px-4 rounded-xl bg-[#E67E22] text-white text-xs font-bold cursor-pointer"
                  >
                    {canReview ? 'Review my trip' : recommendedNext.label}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-[#0D5C75] px-2">Review ready</span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
