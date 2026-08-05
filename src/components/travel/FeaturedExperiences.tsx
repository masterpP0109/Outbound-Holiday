import React from 'react';
import { getFeaturedExperiences, Experience } from '../../data/experiencesData';
import { Clock, ArrowRight, Sparkles, Star } from 'lucide-react';

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
    <section id="travel-experiences" className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>CAREFULLY SELECTED EXPERIENCES</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B5E8E] tracking-tight">
            Featured Victoria Falls Experiences
          </h2>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-light">
            Explore a small selection of memorable experiences our local team confidently recommends for first-time visitors, families, couples and safari travellers.
          </p>
        </div>

        {/* 4 Featured Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featured.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectExperience(item)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer transform hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                <img
                  src={item.featuredImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                {/* Price Badge */}
                <div className="absolute top-3 right-3 bg-[#0D2833]/85 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                  {item.fromPrice}
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 left-3 bg-white/90 text-[#0B5E8E] backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#C9A66B]" />
                  <span>{item.duration}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 font-normal">
                    {item.shortDescription}
                  </p>
                </div>

                {/* Why We Recommend It Badge */}
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-gray-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#C9A66B] uppercase tracking-wider">
                    <Star className="w-3 h-3 text-[#C9A66B] fill-[#C9A66B]" />
                    <span>Why We Recommend It</span>
                  </div>
                  <p className="text-[11px] text-gray-700 italic line-clamp-2 leading-tight">
                    "{item.whyWeRecommend}"
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectExperience(item);
                  }}
                  className="w-full mt-2 bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>View Experience</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Section Bottom CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <button
            onClick={onExploreAll}
            className="inline-flex items-center gap-2.5 bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Explore All Experiences</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
