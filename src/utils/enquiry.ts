import { getSnapshot } from '../runtime/catalog';
import type { Currency } from '../types';
import { formatCurrencyAmount } from './currency';
import { CONTACT_EMAIL, getWhatsAppUrl } from './whatsapp';

export { formatCurrencyAmount, CURRENCY_DISCLAIMER, CURRENCY_RATE_NOTE } from './currency';

export type EnquiryCategory =
  | 'accommodation'
  | 'room'
  | 'package'
  | 'experience'
  | 'general';

export type ChildAgeCategoryId = 'under-11' | '11-plus';

export interface ChildAgeCategoryOption {
  id: ChildAgeCategoryId;
  label: string;
  shortLabel: string;
}

export const CHILD_AGE_CATEGORIES: ChildAgeCategoryOption[] = [
  { id: 'under-11', label: 'Under 11', shortLabel: 'Under 11' },
  { id: '11-plus', label: '11 years or older', shortLabel: '11+' },
];

export interface ChildGuest {
  id: string;
  ageCategory: ChildAgeCategoryId;
}

export interface GuestSelection {
  adults: number;
  children: ChildGuest[];
}

export function getChildAgeLabel(id: ChildAgeCategoryId): string {
  return CHILD_AGE_CATEGORIES.find((c) => c.id === id)?.label || id;
}

export function formatGuestSummary(guests: GuestSelection): string {
  const adultsLabel = `${guests.adults} ${guests.adults === 1 ? 'Adult' : 'Adults'}`;
  if (guests.children.length === 0) return adultsLabel;
  const childrenLabel = `${guests.children.length} ${guests.children.length === 1 ? 'Child' : 'Children'}`;
  return `${adultsLabel} · ${childrenLabel}`;
}

export function formatChildBreakdown(children: ChildGuest[]): string[] {
  return children.map(
    (child, idx) => `Child ${idx + 1} — ${getChildAgeLabel(child.ageCategory)}`
  );
}

export function resizeChildrenList(
  current: ChildGuest[],
  nextCount: number
): ChildGuest[] {
  const clamped = Math.max(0, Math.min(10, nextCount));
  if (clamped === current.length) return current;
  if (clamped < current.length) return current.slice(0, clamped);
  const next = [...current];
  for (let i = current.length; i < clamped; i++) {
    next.push({
      id: `child-${i + 1}`,
      ageCategory: 'under-11',
    });
  }
  return next;
}

export interface EstimateResult {
  amount: number | null;
  label: string;
  isProvisional: boolean;
  disclaimer: string;
}

export function calculateActivityEstimate(params: {
  basePriceUSD: number | null | undefined;
  guests: GuestSelection;
  childRateUnder11USD?: number | null;
  childRate11PlusUSD?: number | null;
  extrasPerPersonUSD?: number;
  minimumAge?: number | null;
  currency?: Currency;
}): EstimateResult {
  const currency = params.currency || 'USD';
  const base = typeof params.basePriceUSD === 'number' && params.basePriceUSD > 0
    ? params.basePriceUSD
    : null;

  if (base === null) {
    return {
      amount: null,
      label: 'Price available on enquiry',
      isProvisional: true,
      disclaimer: 'Estimated price — subject to availability and confirmation',
    };
  }

  const extras = params.extrasPerPersonUSD || 0;
  let total = params.guests.adults * (base + extras);

  for (const child of params.guests.children) {
    if (child.ageCategory === 'under-11') {
      if (typeof params.childRateUnder11USD === 'number' && params.childRateUnder11USD >= 0) {
        total += params.childRateUnder11USD + extras;
      } else {
        return {
          amount: null,
          label: 'Price available on enquiry',
          isProvisional: true,
          disclaimer:
            'Child rate (Under 11) is confirmed by the activity operator upon enquiry.',
        };
      }
    } else {
      const rate11Plus =
        typeof params.childRate11PlusUSD === 'number' && params.childRate11PlusUSD >= 0
          ? params.childRate11PlusUSD
          : base;
      total += rate11Plus + extras;
    }
  }

  return {
    amount: Math.round(total),
    label: `${formatCurrencyAmount(total, currency)} ${currency}`,
    isProvisional: true,
    disclaimer: 'Estimated price — subject to availability and confirmation',
  };
}

export function calculatePackageEstimate(params: {
  basePricePerAdultUSD: number | null | undefined;
  guests: GuestSelection;
  childRateUnder11USD?: number | null;
  childRate11PlusUSD?: number | null;
  currency?: Currency;
}): EstimateResult {
  const currency = params.currency || 'USD';
  const base =
    typeof params.basePricePerAdultUSD === 'number' && params.basePricePerAdultUSD > 0
      ? params.basePricePerAdultUSD
      : null;

  if (base === null) {
    return {
      amount: null,
      label: 'Price available on enquiry',
      isProvisional: true,
      disclaimer: 'Estimated price — subject to availability and confirmation',
    };
  }

  if (params.guests.children.length > 0) {
    const hasUnder11 = params.guests.children.some((c) => c.ageCategory === 'under-11');
    if (hasUnder11 && typeof params.childRateUnder11USD !== 'number') {
      return {
        amount: null,
        label: `From ${formatCurrencyAmount(params.guests.adults * base, currency)} ${currency} (Adults) + child rates on enquiry`,
        isProvisional: true,
        disclaimer: 'Estimated price — subject to availability and confirmation',
      };
    }
  }

  let total = params.guests.adults * base;
  for (const child of params.guests.children) {
    if (child.ageCategory === 'under-11' && typeof params.childRateUnder11USD === 'number') {
      total += params.childRateUnder11USD;
    } else if (child.ageCategory === '11-plus') {
      total +=
        typeof params.childRate11PlusUSD === 'number' ? params.childRate11PlusUSD : base;
    }
  }

  return {
    amount: Math.round(total),
    label: `From ${formatCurrencyAmount(total, currency)} ${currency}`,
    isProvisional: true,
    disclaimer: 'Estimated price — subject to availability and confirmation',
  };
}

export function calculateAccommodationEstimate(params: {
  nightlyRateUSD: number | null | undefined;
  nights: number;
  roomsCount: number;
  guests: GuestSelection;
  pricingBasis?: 'per_room' | 'per_unit' | 'per_person';
  childRateUnder11USD?: number | null;
  currency?: Currency;
}): EstimateResult {
  const currency = params.currency || 'USD';
  const rate =
    typeof params.nightlyRateUSD === 'number' && params.nightlyRateUSD > 0
      ? params.nightlyRateUSD
      : null;

  if (rate === null || params.nights <= 0) {
    return {
      amount: null,
      label: 'Price available on enquiry',
      isProvisional: true,
      disclaimer: 'Price available on enquiry — final rate confirmed by property.',
    };
  }

  const basis = params.pricingBasis || 'per_room';
  if (basis === 'per_person') {
    if (
      params.guests.children.some((c) => c.ageCategory === 'under-11') &&
      typeof params.childRateUnder11USD !== 'number'
    ) {
      return {
        amount: null,
        label: 'Price available on enquiry',
        isProvisional: true,
        disclaimer: 'Child rates are confirmed based on property policy and travel dates.',
      };
    }
    let nightly = params.guests.adults * rate;
    for (const child of params.guests.children) {
      nightly +=
        child.ageCategory === 'under-11' && typeof params.childRateUnder11USD === 'number'
          ? params.childRateUnder11USD
          : rate;
    }
    const total = Math.round(nightly * params.nights);
    return {
      amount: total,
      label: `From ${formatCurrencyAmount(total, currency)} ${currency} (${params.nights} ${params.nights === 1 ? 'night' : 'nights'})`,
      isProvisional: true,
      disclaimer: 'Estimated price — subject to availability and confirmation',
    };
  }

  const total = Math.round(rate * Math.max(1, params.roomsCount) * params.nights);
  return {
    amount: total,
    label: `From ${formatCurrencyAmount(total, currency)} ${currency} (${params.nights} ${params.nights === 1 ? 'night' : 'nights'})`,
    isProvisional: true,
    disclaimer: 'Estimated price — subject to availability and confirmation',
  };
}

export interface DirectEnquiryContext {
  category: EnquiryCategory;
  propertyName?: string;
  roomId?: string;
  roomType?: string;
  roomsCount?: number;
  mealPlan?: string;
  ratePlanId?: string;
  ratePlan?: string;
  offerId?: string;
  offerName?: string;
  visitorMarket?: string;
  packageName?: string;
  activityName?: string;
  dates?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: string | number;
  childAges?: string[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  country?: string;
  extras?: string[];
  estimatedPrice?: string;
  sourceUrl?: string;
  notes?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 18;
}

export function getConfiguredContactEmail(): string | null {
  let email = (CONTACT_EMAIL || '').trim();
  if (!email) {
    try {
      email = (getSnapshot().site.contact.email || '').trim();
    } catch {
      email = '';
    }
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return null;
  }
  return email;
}

function appendOptionalDetails(lines: string[], ctx: DirectEnquiryContext): void {
  const details: string[] = [];
  if (ctx.customerName && ctx.customerName.trim()) {
    details.push(`Name: ${ctx.customerName.trim()}`);
  }
  if (ctx.customerEmail && ctx.customerEmail.trim()) {
    details.push(`Email: ${ctx.customerEmail.trim()}`);
  }
  if (ctx.customerPhone && ctx.customerPhone.trim()) {
    details.push(`WhatsApp/Phone: ${ctx.customerPhone.trim()}`);
  }
  if (ctx.country && ctx.country.trim()) {
    details.push(`Country: ${ctx.country.trim()}`);
  }
  if (ctx.dates && ctx.dates.trim()) {
    details.push(`Dates: ${ctx.dates.trim()}`);
  } else if (ctx.checkInDate || ctx.checkOutDate) {
    details.push(`Dates: ${ctx.checkInDate || 'TBC'} to ${ctx.checkOutDate || 'TBC'}`);
  }
  if (ctx.roomsCount && ctx.roomsCount > 1) {
    details.push(`Rooms / Units: ${ctx.roomsCount}`);
  }
  if (ctx.mealPlan && ctx.mealPlan.trim()) {
    details.push(`Meal Plan: ${ctx.mealPlan.trim()}`);
  }
  if (ctx.ratePlan && ctx.ratePlan.trim()) {
    details.push(`Rate Plan: ${ctx.ratePlan.trim()}`);
  }
  if (ctx.offerName && ctx.offerName.trim()) {
    details.push(`Special Offer: ${ctx.offerName.trim()}`);
  }
  if (ctx.visitorMarket && ctx.visitorMarket.trim()) {
    details.push(`Visitor Market: ${ctx.visitorMarket.trim()}`);
  }
  if (ctx.guests !== undefined && String(ctx.guests).trim() !== '') {
    details.push(`Guests: ${String(ctx.guests).trim()}`);
  }
  if (ctx.childAges && ctx.childAges.length > 0) {
    details.push(`Children Ages: ${ctx.childAges.join(', ')}`);
  }
  if (ctx.extras && ctx.extras.length > 0) {
    details.push(`Extras: ${ctx.extras.join(', ')}`);
  }
  if (ctx.estimatedPrice && ctx.estimatedPrice.trim()) {
    details.push(`Estimated Price: ${ctx.estimatedPrice.trim()}`);
  }
  if (ctx.notes && ctx.notes.trim()) {
    details.push(`Special Requests: ${ctx.notes.trim()}`);
  }
  if (ctx.sourceUrl && ctx.sourceUrl.trim()) {
    details.push(`Page: ${ctx.sourceUrl.trim()}`);
  }
  if (details.length > 0) {
    lines.push('', ...details);
  }
}

export function buildDirectEnquiryWhatsAppMessage(ctx: DirectEnquiryContext): string {
  const lines: string[] = [];

  if (ctx.category === 'room' && ctx.propertyName && ctx.roomType) {
    lines.push(
      `Hello Outbound Holidays, I would like to enquire about the ${ctx.roomType} at ${ctx.propertyName}. Could you please assist me with availability and pricing?`
    );
  } else if (
    (ctx.category === 'accommodation' || ctx.category === 'room') &&
    ctx.propertyName
  ) {
    const roomSuffix =
      ctx.roomType && ctx.roomType !== 'Best available / Please advise'
        ? ` (${ctx.roomType})`
        : '';
    lines.push(
      `Hello Outbound Holidays, I would like to enquire about staying at ${ctx.propertyName}${roomSuffix}. Could you please assist me with availability and pricing?`
    );
  } else if (ctx.category === 'package' && ctx.packageName) {
    lines.push(
      `Hello Outbound Holidays, I am interested in the ${ctx.packageName} package. Could you please assist me with availability and a quotation?`
    );
  } else if (ctx.category === 'experience' && ctx.activityName) {
    lines.push(
      `Hello Outbound Holidays, I would like more information and pricing for ${ctx.activityName} in Victoria Falls.`
    );
  } else {
    lines.push(
      'Hello Outbound Holidays, I would like help planning and booking a Victoria Falls holiday. Could you please assist me?'
    );
  }

  appendOptionalDetails(lines, ctx);
  return lines.join('\n');
}

export function buildDirectEnquiryWhatsAppUrl(ctx: DirectEnquiryContext): string {
  return getWhatsAppUrl(buildDirectEnquiryWhatsAppMessage(ctx));
}

export function buildDirectEnquiryEmail(
  ctx: DirectEnquiryContext
): { to: string; subject: string; body: string; mailtoUrl: string } | null {
  const to = getConfiguredContactEmail();
  if (!to) {
    console.warn(
      '[Outbound CMS] No valid enquiry email address is configured in WordPress CMS site.contact.email.'
    );
    return null;
  }

  let subject = 'Holiday Enquiry — Outbound Holidays';
  const bodyLines: string[] = ['Hello Outbound Holidays,', ''];

  if (ctx.category === 'room' && ctx.propertyName && ctx.roomType) {
    subject = `Room Enquiry — ${ctx.propertyName} — ${ctx.roomType}`;
    bodyLines.push(
      `I would like to enquire about the ${ctx.roomType} at ${ctx.propertyName}.`,
      '',
      'Could you please assist me with availability, room rates and booking arrangements?'
    );
  } else if (
    (ctx.category === 'accommodation' || ctx.category === 'room') &&
    ctx.propertyName
  ) {
    subject = `Accommodation Enquiry — ${ctx.propertyName}`;
    const roomLine =
      ctx.roomType && ctx.roomType !== 'Best available / Please advise'
        ? ` (Room preference: ${ctx.roomType})`
        : '';
    bodyLines.push(
      `I would like to enquire about staying at ${ctx.propertyName}${roomLine}.`,
      '',
      'Could you please assist me with availability, rates and booking arrangements?'
    );
  } else if (ctx.category === 'package' && ctx.packageName) {
    subject = `Package Enquiry — ${ctx.packageName}`;
    bodyLines.push(
      `I am interested in the ${ctx.packageName} package.`,
      '',
      'Could you please assist me with availability and a quotation?'
    );
  } else if (ctx.category === 'experience' && ctx.activityName) {
    subject = `Experience Enquiry — ${ctx.activityName}`;
    bodyLines.push(
      `I would like more information and pricing for ${ctx.activityName} in Victoria Falls.`
    );
  } else {
    bodyLines.push(
      'I would like help planning and booking a Victoria Falls holiday. Could you please assist me?'
    );
  }

  appendOptionalDetails(bodyLines, ctx);
  bodyLines.push('', 'Thank you.');

  const body = bodyLines.join('\n');
  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { to, subject, body, mailtoUrl };
}

export function getEnquiryItemLabel(ctx: DirectEnquiryContext): string | null {
  if (ctx.category === 'room' && ctx.propertyName && ctx.roomType) {
    return `${ctx.roomType} · ${ctx.propertyName}`;
  }
  if (ctx.propertyName) return ctx.propertyName;
  if (ctx.packageName) return ctx.packageName;
  if (ctx.activityName) return ctx.activityName;
  return null;
}
