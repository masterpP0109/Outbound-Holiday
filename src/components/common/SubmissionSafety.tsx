import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { submitForm } from '../../runtime/api';

export function useSubmission(path: 'enquiries' | 'newsletter') {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    reference?: string;
    customerName?: string;
    submittedAt?: string;
    status?: string;
    confirmationDelivery?: string;
  } | null>(null);
  const [website, setWebsite] = useState('');
  const [token, setToken] = useState('');
  const started = useRef(Date.now());
  const retry = useRef<{ payload: string; key: string } | undefined>(undefined);
  const locked = useRef(false);

  const save = async (payload: Record<string, unknown>) => {
    if (locked.current) return null;
    locked.current = true;
    setPending(true);
    setError('');
    setFields({});
    const signature = JSON.stringify(payload);
    if (retry.current?.payload !== signature) {
      retry.current = { payload: signature, key: crypto.randomUUID() };
    }
    try {
      const saved = await submitForm(
        path,
        {
          ...payload,
          website,
          startedAt: started.current,
          turnstileToken: token || undefined,
        },
        retry.current.key,
      );
      setResult(saved);
      return saved;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not save. Your inputs have been kept; please retry.',
      );
      setFields((e as any)?.fields ?? {});
      return null;
    } finally {
      locked.current = false;
      setPending(false);
    }
  };

  return {
    pending,
    error,
    fields,
    result,
    website,
    setWebsite,
    token,
    setToken,
    save,
  };
}

export function SubmissionSafety({
  submission,
  marketingConsent,
  onConsent,
  requireConsent = false,
  consentPromptError = false,
}: {
  submission: ReturnType<typeof useSubmission>;
  marketingConsent: boolean;
  onConsent: (value: boolean) => void;
  requireConsent?: boolean;
  consentPromptError?: boolean;
}) {
  const widget = useRef<HTMLDivElement>(null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const key = import.meta.env?.VITE_TURNSTILE_SITE_KEY;
  const setToken = submission.setToken;

  useEffect(() => {
    if (!key) return;
    let id: string | undefined;
    let cancelled = false;
    const render = () => {
      if (cancelled || !widget.current) return;
      const turnstile = (window as any).turnstile;
      if (turnstile) {
        id = turnstile.render(widget.current, {
          sitekey: key,
          action: 'submission',
          callback: setToken,
          'expired-callback': () => setToken(''),
        });
      }
    };
    let script = document.querySelector<HTMLScriptElement>(
      'script[data-outbound-turnstile]',
    );
    if (!script) {
      script = document.createElement('script');
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.dataset.outboundTurnstile = 'true';
      script.async = true;
      document.head.append(script);
    }
    if ((window as any).turnstile) render();
    else script.addEventListener('load', render);
    return () => {
      cancelled = true;
      script?.removeEventListener('load', render);
      if (id) (window as any).turnstile?.remove(id);
    };
  }, [key, setToken]);

  useEffect(() => {
    if (submission.error && widget.current) {
      (window as any).turnstile?.reset(widget.current);
    }
  }, [submission.error]);

  return (
    <div className="space-y-3 text-sm">
      <div aria-hidden="true" className="absolute -left-[10000px]">
        <label>
          Leave this field empty
          <input
            tabIndex={-1}
            autoComplete="off"
            value={submission.website}
            onChange={(e) => submission.setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div
        className={`rounded-2xl border p-3.5 sm:p-4 transition-all ${
          consentPromptError && !marketingConsent
            ? 'border-[#E67E22] bg-[#E67E22]/15 ring-2 ring-[#E67E22]/50'
            : marketingConsent
              ? 'border-[#C9A66B]/60 bg-black/15'
              : 'border-current/20 bg-black/10 hover:border-current/35'
        }`}
      >
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            aria-required={requireConsent}
            checked={marketingConsent}
            onChange={(e) => onConsent(e.target.checked)}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-md accent-[#E67E22] cursor-pointer shrink-0 mt-0.5"
          />
          <span className="text-sm sm:text-base font-medium leading-snug">
            I agree to receive Outbound Holidays travel updates by email. I can
            unsubscribe at any time.{' '}
            {requireConsent ? (
              <span className="font-semibold text-[#C9A66B]">(Required)</span>
            ) : (
              <span className="opacity-85">
                This is optional and separate from my enquiry.
              </span>
            )}
          </span>
        </label>

        <div className="mt-2.5 pl-8 sm:pl-9 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPolicyOpen((prev) => !prev)}
            aria-expanded={policyOpen}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#C9A66B] hover:underline cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              {policyOpen
                ? 'Hide Privacy & Updates Policy'
                : 'Read Privacy & Updates Policy'}
            </span>
            {policyOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {policyOpen && (
          <div className="mt-3 ml-0 sm:ml-9 rounded-xl bg-[#0D2833] text-white p-4 border border-white/15 space-y-2.5 text-xs sm:text-sm leading-relaxed shadow-lg">
            <p className="font-bold text-[#C9A66B] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Outbound Holidays Email &amp; Privacy Policy
            </p>
            <ul className="list-disc pl-5 space-y-1 text-white/90">
              <li>
                <strong>Curated Victoria Falls Updates:</strong> Receive seasonal
                water-level advisories, travel planning guides, and verified
                special offers.
              </li>
              <li>
                <strong>Zero Spam &amp; Strict Privacy:</strong> We never sell,
                rent, or share your email address or personal details with third
                parties.
              </li>
              <li>
                <strong>Instant One-Click Unsubscribe:</strong> Every email
                contains a direct unsubscribe link that removes you immediately.
              </li>
            </ul>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  onConsent(true);
                  setPolicyOpen(false);
                }}
                className="inline-flex items-center gap-1.5 bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Accept &amp; Agree to Policy</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {consentPromptError && !marketingConsent && (
        <p role="alert" className="text-xs sm:text-sm font-semibold text-[#FDBA74]">
          Please tick the box above (or click &ldquo;Accept &amp; Agree to Policy&rdquo;) to confirm your subscription.
        </p>
      )}

      {key && <div ref={widget} />}
      {submission.pending && <p role="status">Saving securely…</p>}
      {submission.error && (
        <div
          role="alert"
          className="rounded-lg bg-red-500/15 border border-red-300/40 px-3 py-2 text-xs leading-relaxed"
        >
          <p className="font-medium">{submission.error}</p>
          {Object.entries(submission.fields).map(([field, message]) => (
            <p key={field}>
              {field}: {message}
            </p>
          ))}
          <p className="opacity-90 mt-1">
            Your details are still here so you can try again.
          </p>
        </div>
      )}
    </div>
  );
}
