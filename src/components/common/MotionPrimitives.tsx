import React, { useEffect, useRef, useState } from 'react';

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * Lightweight, accessible viewport reveal wrapper.
 * - Starts visible if IntersectionObserver is unavailable or prefers-reduced-motion is active.
 * - Animates only transform + opacity once on first viewport entry.
 */
export const RevealSection: React.FC<RevealSectionProps> = ({
  children,
  className = '',
  delayMs = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      return;
    }

    const rect = el.getBoundingClientRect();
    // Elements already in or above the initial viewport stay visible immediately (zero LCP/FCP delay).
    if (rect.top < window.innerHeight * 0.92) {
      return;
    }

    setArmed(true);
    setVisible(false);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={armed && delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`${armed ? 'outbound-reveal' : ''} ${armed && visible ? 'is-visible' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
};

