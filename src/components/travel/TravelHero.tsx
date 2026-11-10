import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface TravelHeroProps {
  onOpenPlanHoliday: () => void;
  onBrowsePackages?: () => void;
}

const FALLS_HERO_IMAGE =
  'https://br-icy-darkness-b4agzqde.storage.c-6.us-east-2.aws.neon.tech/experiences-imgs/experiences/Guided%20Tour%20Of%20the%20Falls/Tour-of-the-Falls-1-scaled-5695c66e57b3f90e.webp';
const FALLS_HERO_FALLBACK =
  '/convertedImages/Experiences/Guided Tour Of the Falls/Tour-of-the-Falls-1-scaled.webp';

export const TravelHero: React.FC<TravelHeroProps> = ({
  onOpenPlanHoliday,
}) => {
  const [imageSrc, setImageSrc] = useState(FALLS_HERO_IMAGE);

  return (
    <section className="w-full relative overflow-hidden bg-[#0B5E8E]">
      {/* Full-bleed Static Hero Container - justify-end pushes content down */}
      <div className="travel-hero relative w-full flex flex-col justify-end items-end text-white">
        {/* Single Static High-Resolution Victoria Falls Photograph */}
        <div className="absolute inset-0 z-0">
          <img
            src={imageSrc}
            width={1920}
            height={1244}
            alt="Majestic panoramic view of Victoria Falls with mist rising from the Zambezi gorge"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-[center_35%] block"
            onError={() => {
              if (imageSrc !== FALLS_HERO_FALLBACK) {
                setImageSrc(FALLS_HERO_FALLBACK);
              }
            }}
          />
        </div>

        {/* Subtle Dark Gradient Overlay for Maximum Text Legibility on the Right */}
        <div
          className="absolute inset-0 z-0 bg-gradient-to-l from-black/85 via-black/60 to-black/25 sm:from-black/85 sm:via-black/55 sm:to-black/20"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
          aria-hidden="true"
        />

        {/* Main Hero Content Area - Right Positioned, Pushed Down, and Enlarged on Smaller Screens */}
        <div className="travel-hero-content relative z-10 text-right flex flex-col items-end justify-end max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl w-full space-y-3 sm:space-y-4 lg:space-y-5">
          {/* Main Headline (H1) - Increased Size on Smaller Screens & Right Aligned */}
          <h1 className="travel-hero-title font-serif font-bold text-white tracking-tight drop-shadow-md text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] leading-[1.03] sm:leading-[1.06]">
            <span className="block">Victoria Falls</span>
            <span className="block">Holidays</span>
          </h1>

          {/* Supporting Tagline - Increased Size on Smaller Screens */}
          <p className="travel-hero-tagline text-xl xs:text-2xl sm:text-2xl lg:text-3xl xl:text-4xl text-white/95 font-light tracking-wide drop-shadow-sm max-w-2xl leading-snug sm:leading-relaxed">
            Planned by locals, tailored to you.
          </p>

          {/* Primary Call-to-Action - Matches Featured Experiences CTA */}
          <div className="pt-2 sm:pt-3 w-auto flex justify-end">
            <button
              type="button"
              onClick={onOpenPlanHoliday}
              className="travel-hero-cta group inline-flex items-center justify-center gap-2 bg-[#E67E22] hover:bg-[#d36e17] active:bg-[#c56814] text-white font-bold text-xs sm:text-base px-5 py-2.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#E67E22]"
              aria-label="Plan Your Trip with Outbound Holidays"
            >
              <span>Plan Your Trip</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transition-none" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
