import { API_BASE_URL, getWpConfig } from '../runtime/api';
import type { PromotionOffer, PromotionEventPayload } from '../types/promotion';

const VISITOR_STORAGE_KEY = 'outbound_promo_vid';
const IMPRESSIONS_STORAGE_KEY = 'outbound_promo_impr';
const DISMISSED_SESSION_KEY = 'outbound_promo_dismissed_session';

export function getPromotionVisitorId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let vid = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(VISITOR_STORAGE_KEY, vid);
    }
    return vid;
  } catch {
    return 'temp_' + Date.now();
  }
}

export function parseUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
} {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      utmContent: params.get('utm_content') || undefined,
    };
  } catch {
    return {};
  }
}

export async function trackPromotionEvent(
  promotionId: number,
  eventType: PromotionEventPayload['eventType']
): Promise<void> {
  if (typeof window === 'undefined') return;
  const utms = parseUtmParams();
  const payload: PromotionEventPayload = {
    promotionId,
    eventType,
    visitorId: getPromotionVisitorId(),
    pageUrl: window.location.pathname + window.location.search,
    ...utms,
  };

  try {
    const cfg = getWpConfig();
    const endpoint = cfg?.restUrl
      ? `${cfg.restUrl.replace(/\/$/, '')}/promotions/event`
      : `${API_BASE_URL}/promotions/event`;

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cfg?.nonce ? { 'X-WP-Nonce': cfg.nonce } : {}),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Non-blocking telemetry
  }
}

export function canShowPromotionPopup(promotion: PromotionOffer, currentPath: string): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Session dismissal guard: don't show another pop-up during the same session after dismissal
  try {
    if (sessionStorage.getItem(DISMISSED_SESSION_KEY)) {
      return false;
    }
  } catch {
    // continue
  }

  // 2. Page targeting & suppression
  if (currentPath === '/newsletter-confirmed' || currentPath === '/contact') {
    return false; // suppress on dedicated enquiry/contact screens
  }

  if (promotion.display.targetPages && promotion.display.targetPages.length > 0) {
    const norm = currentPath.replace(/\/+$/, '') || '/';
    const matches = promotion.display.targetPages.some((p) => {
      const targetNorm = p.replace(/\/+$/, '') || '/';
      return targetNorm === norm;
    });
    if (!matches) return false;
  }

  return true;
}

export function recordPromotionPopupImpression(promotionId: number): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(IMPRESSIONS_STORAGE_KEY);
    const store: Record<string, { count: number; lastShown: number }> = raw ? JSON.parse(raw) : {};
    const curr = store[String(promotionId)] || { count: 0, lastShown: Date.now() };
    store[String(promotionId)] = { count: curr.count + 1, lastShown: Date.now() };
    localStorage.setItem(IMPRESSIONS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // continue
  }
}

export function recordSessionPromotionDismissal(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DISMISSED_SESSION_KEY, '1');
  } catch {
    // continue
  }
}

export async function fetchActivePromotions(): Promise<PromotionOffer[]> {
  if (typeof document !== 'undefined') {
    const el = document.getElementById('outbound-promotions');
    if (el && el.textContent) {
      try {
        const parsed = JSON.parse(el.textContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as PromotionOffer[];
        }
      } catch {
        // continue
      }
    }
  }

  const cfg = getWpConfig();
  const endpoint = cfg?.restUrl
    ? `${cfg.restUrl.replace(/\/$/, '')}/promotions/active`
    : `${API_BASE_URL}/promotions/active`;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) return [];
    return (await res.json()) as PromotionOffer[];
  } catch {
    return [];
  }
}
