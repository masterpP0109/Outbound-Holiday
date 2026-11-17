import React, { useEffect, useState } from 'react';
import { Check, Copy, Mail, Share2, X } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppButton';

interface ShareButtonProps {
  title: string;
  canonicalPath?: string;
  label?: string;
  className?: string;
}

export function getCanonicalShareUrl(canonicalPath?: string): string {
  if (typeof window === 'undefined') {
    return canonicalPath ? `https://outboundholiday.com${canonicalPath}` : 'https://outboundholiday.com/';
  }
  const origin = window.location.origin || 'https://outboundholiday.com';
  if (canonicalPath) {
    return `${origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  }
  return `${origin}${window.location.pathname}`;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  canonicalPath,
  label = 'Share',
  className,
}) => {
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!fallbackOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFallbackOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fallbackOpen]);

  const shareUrl = getCanonicalShareUrl(canonicalPath);
  const shareText = `${title} — Outbound Holidays Victoria Falls`;

  const handleShareClick = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }
    setFallbackOpen(true);
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShareClick}
        aria-label={`Share ${title}`}
        className={
          className ||
          'inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#0B5E8E] border-2 border-[#C9A66B]/70 hover:bg-[#FAF9F6] hover:border-[#C9A66B] font-bold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer'
        }
      >
        <Share2 className="w-4 h-4 text-[#C9A66B] shrink-0" aria-hidden="true" />
        <span>{copied ? 'Link copied!' : label}</span>
      </button>

      {fallbackOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
          role="presentation"
          onClick={() => setFallbackOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm bg-white text-gray-900 rounded-t-3xl sm:rounded-3xl border border-gray-200 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3
                id="share-dialog-title"
                className="font-serif text-lg font-bold text-[#0B5E8E] truncate"
              >
                Share {title}
              </h3>
              <button
                type="button"
                onClick={() => setFallbackOpen(false)}
                aria-label="Close share options"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] px-3 py-2.5 flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] px-3 py-2.5 flex items-center justify-center gap-2"
              >
                <span>Facebook</span>
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`}
                className="min-h-[44px] rounded-xl bg-[#0B5E8E]/10 hover:bg-[#0B5E8E]/20 text-[#0B5E8E] px-3 py-2.5 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>Email</span>
              </a>

              <button
                type="button"
                onClick={handleCopy}
                className="min-h-[44px] rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
