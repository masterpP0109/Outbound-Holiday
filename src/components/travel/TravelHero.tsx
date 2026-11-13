import React from 'react';
import { ArrowRight } from 'lucide-react';
import { resolveAssetUrl } from '../../runtime/api';
import { editorialOptional } from '../../runtime/catalog';

interface TravelHeroProps {
  onOpenPlanHoliday: () => void;
  onBrowsePackages?: () => void;
}

const FALLS_HERO_IMAGE = '/Experiences/Guided Tour of the Falls_/5-4.jpg';

export const TravelHero: React.FC<TravelHeroProps> = ({
  onOpenPlanHoliday,
  onBrowsePackages,
}) => {
  const eyebrow = editorialOptional('travel/TravelHero.eyebrow', '');
  const headlineLine1 = editorialOptional('travel/TravelHero.headlineLine1', 'Victoria Falls');
  const headlineLine2 = editorialOptional('travel/TravelHero.headlineLine2', 'Holidays');
  const subtitle = editorialOptional('travel/TravelHero.subtitle', 'Planned by locals, tailored to you.');
  const ctaLabel = editorialOptional('travel/TravelHero.ctaLabel', 'Plan Your Trip');
  const ctaDest = editorialOptional('travel/TravelHero.ctaDestination', 'modal');
  const heroImage = resolveAssetUrl(editorialOptional('travel/TravelHero.heroImage', FALLS_HERO_IMAGE));
  const heroAlt = editorialOptional(
    'travel/TravelHero.heroImageAlt',
    'Majestic panoramic view of Victoria Falls with mist rising from the Zambezi gorge'
  );

  const handleCtaClick = () => {
    if (ctaDest === 'packages' && onBrowsePackages) {
      onBrowsePackages();
      return;
    }
    if (ctaDest && ctaDest !== 'modal' && (ctaDest.startsWith('http') || ctaDest.startsWith('/'))) {
      window.location.href = ctaDest;
      return;
    }
    onOpenPlanHoliday();
  };

  return (
    <section className="w-full relative overflow-hidden bg-[#0B5E8E]">
      {/* Full-bleed Static Hero Container - justify-end pushes content down */}
      <div className="travel-hero relative w-full flex flex-col justify-end items-end text-white">
        {/* Single Static High-Resolution Victoria Falls Photograph */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            width={1920}
            height={1244}
            alt={heroAlt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-[center_62%] block"
          />
        </div>

        {/* Dark Gradient Overlay calibrated so the entire falls remain visible while maintaining text contrast */}
        <div
          className="absolute inset-0 z-0 bg-gradient-to-l from-black/75 via-black/45 to-black/10 sm:from-black/75 sm:via-black/40 sm:to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
          aria-hidden="true"
        />

        {/* Main Hero Content Area - Right Positioned, Pushed Down, and Enlarged on Smaller Screens */}
        <div className="travel-hero-content relative z-10 text-right flex flex-col items-end justify-end max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl w-full space-y-3 sm:space-y-4 lg:space-y-5">
          {eyebrow ? (
            <span className="inline-block rounded-full bg-white/15 backdrop-blur-xs border border-white/25 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#E5C989]">
              {eyebrow}
            </span>
          ) : null}

          {/* Main Headline (H1) - Increased Size on Smaller Screens & Right Aligned */}
          <h1 className="travel-hero-title outbound-hero-stagger-1 font-serif font-bold text-white tracking-tight drop-shadow-md text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] leading-[1.03] sm:leading-[1.06]">
            <span className="block">{headlineLine1}</span>
            {headlineLine2 ? <span className="block">{headlineLine2}</span> : null}
          </h1>

          {/* Supporting Tagline - Increased Size on Smaller Screens */}
          <p className="travel-hero-tagline outbound-hero-stagger-2 text-xl xs:text-2xl sm:text-2xl lg:text-3xl xl:text-4xl text-white/95 font-light tracking-wide drop-shadow-sm max-w-2xl leading-snug sm:leading-relaxed">
            {subtitle}
          </p>

          {/* Primary Call-to-Action - Matches Featured Experiences CTA */}
          <div className="outbound-hero-stagger-3 pt-2 sm:pt-3 w-auto flex justify-end">
            <button
              type="button"
              onClick={handleCtaClick}
              className="travel-hero-cta group inline-flex items-center justify-center gap-2 bg-[#E67E22] hover:bg-[#d36e17] active:bg-[#c56814] text-white font-bold text-xs sm:text-base px-5 py-2.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#E67E22]"
              aria-label="Plan Your Trip with Outbound Holidays"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transition-none" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
