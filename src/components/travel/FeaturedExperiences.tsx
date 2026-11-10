import { editorial } from "../../runtime/catalog";
import { PageLink } from '../common/PageLink';
import { experiencePath,sectionPath } from '../../routes';
import React from 'react';
import { getFeaturedExperiences,Experience } from '../../data/experiencesData';
import { ArrowRight,Sparkles } from 'lucide-react';

interface FeaturedExperiencesProps {
  onSelectExperience: (experience: Experience) => void;
  onExploreAll: () => void;
}

export const FeaturedExperiences: React.FC<FeaturedExperiencesProps> = ({
  onSelectExperience,
  onExploreAll,
}) => {
  const featured = getFeaturedExperiences();

  return (
    <section id="travel-experiences" className="py-10 sm:py-14 lg:py-16 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/FeaturedExperiences.text1")}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B5E8E] tracking-tight">
            {editorial("travel/FeaturedExperiences.text2")}</h2>
        </div>

        {/* 4 Featured Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectExperience(item)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={item.featuredImage}
                  alt={item.title}
                  width="100%"
                  height="208"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block"
                  onError={(e) => {
                    console.error('Image failed to load:', item.featuredImage);
                    (e.target as HTMLImageElement).src = '';
                  }}
                />
              </div>

              {/* Card Body & Action */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>

                <PageLink href={experiencePath(item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectExperience(item);
                  }}
                  className="w-full bg-[#0B5E8E] hover:bg-[#08486e] text-white text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs mt-auto"
                >
                  <span>{editorial("travel/FeaturedExperiences.text5")}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                </PageLink>
              </div>
            </div>
          ))}
        </div>

        {/* Section Bottom CTA */}
        <div className="mt-8 sm:mt-10 text-center">
          <PageLink href={sectionPath('experiences')}
            onClick={onExploreAll}
            className="inline-flex items-center gap-2 bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-base px-5 py-2.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>{editorial("travel/FeaturedExperiences.text6")}</span>
            <ArrowRight className="w-4 h-4" />
          </PageLink>
        </div>

      </div>
    </section>
  );
};
