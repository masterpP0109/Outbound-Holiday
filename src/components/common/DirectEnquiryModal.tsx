import React, { useEffect, useRef } from 'react';
import { Mail, X } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppButton';
import {
  buildDirectEnquiryEmail,
  buildDirectEnquiryWhatsAppUrl,
  getEnquiryItemLabel,
  type DirectEnquiryContext,
} from '../../utils/enquiry';
import { trackEnquiryEvent } from '../../utils/analytics';
import { getWpConfig } from '../../runtime/api';

interface DirectEnquiryModalProps {
  context: DirectEnquiryContext | null;
  onClose: () => void;
  onNavigateContact: () => void;
}

export const DirectEnquiryModal: React.FC<DirectEnquiryModalProps> = ({
  context,
  onClose,
  onNavigateContact,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!context) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const timer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 10);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [context, onClose]);

  if (!context) return null;

  const sourcePage =
    context.sourceUrl ||
    (typeof window !== 'undefined' ? window.location.pathname : '/');
  const itemLabel = getEnquiryItemLabel(context);
  const whatsappUrl = buildDirectEnquiryWhatsAppUrl(context);
  const emailData = buildDirectEnquiryEmail(context);
  const isPreview = Boolean(getWpConfig()?.isPreview);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="direct-enquiry-heading"
        aria-describedby="direct-enquiry-desc"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white border border-gray-200/90 shadow-2xl p-6 sm:p-8 text-center"
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close enquiry dialog"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5E8E]"
        >
          <X className="w-4 h-4" />
        </button>

        {itemLabel && (
          <div className="inline-block max-w-full truncate rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] px-3.5 py-1 text-xs font-bold mb-3">
            {itemLabel}
          </div>
        )}

        <h2
          id="direct-enquiry-heading"
          className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E] leading-tight"
        >
          How would you like to enquire?
        </h2>

        <p
          id="direct-enquiry-desc"
          className="text-sm text-[#2F3A44]/85 leading-relaxed mt-2.5"
        >
          Our Victoria Falls team is here to help you plan and book your holiday.
        </p>

        <div className="mt-6 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEnquiryEvent('enquiry_whatsapp_selected', {
                category: context.category,
                sourcePage,
                ...(itemLabel ? { itemLabel } : {}),
              });
            }}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm sm:text-base px-5 py-3.5 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5E8E]"
          >
            <WhatsAppIcon className="w-5 h-5 shrink-0" />
            <span>Continue on WhatsApp</span>
          </a>

          {emailData ? (
            <a
              href={emailData.mailtoUrl}
              onClick={() => {
                trackEnquiryEvent('enquiry_email_selected', {
                  category: context.category,
                  sourcePage,
                  ...(itemLabel ? { itemLabel } : {}),
                });
              }}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-sm sm:text-base px-5 py-3.5 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E67E22]"
            >
              <Mail className="w-5 h-5 shrink-0" />
              <span>Send an Email</span>
            </a>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={onNavigateContact}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-sm sm:text-base px-5 py-3.5 shadow-sm transition-colors cursor-pointer"
              >
                <Mail className="w-5 h-5 shrink-0" />
                <span>Go to Contact Page</span>
              </button>
              {isPreview && (
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  Admin notice: Configure a valid enquiry email in Outbound CMS → About &amp; Contact to enable direct email links.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
