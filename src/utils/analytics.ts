/**
 * Analytics Event Hook Layer
 * 
 * Provides a typed interface for tracking travel guide user interactions.
 * If a third-party analytics SDK (e.g. Google Analytics 4, Segment) is configured later,
 * hook into this function without modifying component implementation.
 */

export interface GuideEventPayload {
  articleSlug?: string;
  articleTitle?: string;
  sectionId?: string;
  ctaName?: string;
  faqQuestion?: string;
  relatedSlug?: string;
  sharePlatform?: string;
  [key: string]: any;
}

export type GuideEventType =
  | 'guide_viewed'
  | 'section_scrolled'
  | 'toc_clicked'
  | 'cta_clicked'
  | 'faq_toggled'
  | 'related_guide_clicked'
  | 'share_clicked'
  | 'practical_info_expanded';

export function trackGuideEvent(eventType: GuideEventType, payload?: GuideEventPayload): void {
  const timestamp = new Date().toISOString();
  const eventData = {
    event: eventType,
    timestamp,
    ...payload,
  };

  // Dispatch custom DOM event for decoupled analytics listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('outbound_guide_analytics', { detail: eventData })
    );
  }

  // Development logger
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics: ${eventType}]`, eventData);
  }
}
