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
      {/* Full-bleed Static Hero Container */}
      <div className="travel-hero relative w-full flex flex-col justify-center items-start text-white">
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

        {/* Subtle Dark Gradient Overlay for Maximum Text Legibility */}
        <div
          className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20 sm:from-black/75 sm:via-black/45 sm:to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-0 bg-gradient-to-t from-black/50 via-transparent to-black/25"
          aria-hidden="true"
        />

        {/* Main Hero Content Area - Left Aligned */}
        <div className="travel-hero-content relative z-10 text-left flex flex-col items-start justify-center max-w-2xl lg:max-w-3xl w-full space-y-4 sm:space-y-6 lg:space-y-7">
          {/* Main Headline (H1) - Exact Copy */}
          <h1 className="travel-hero-title font-serif font-bold text-white tracking-tight drop-shadow-md text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.08] sm:leading-[1.12]">
            <span className="block">Victoria Falls</span>
            <span className="block sm:inline sm:ml-3">Holidays</span>
          </h1>

          {/* Supporting Tagline - Exact Copy */}
          <p className="travel-hero-tagline text-base sm:text-xl lg:text-2xl text-white/95 font-normal tracking-wide drop-shadow-sm max-w-xl leading-relaxed">
            Planned by locals, tailored to you.
          </p>

          {/* Primary Call-to-Action - Exact Copy */}
          <div className="pt-2 sm:pt-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenPlanHoliday}
              className="travel-hero-cta group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#0B5E8E] hover:bg-[#08486e] active:bg-[#063754] text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer min-h-[48px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0B5E8E] active:scale-[0.98]"
              aria-label="Plan Your Trip with Outbound Holidays"
            >
              <span>Plan Your Trip</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform motion-reduce:transition-none" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
