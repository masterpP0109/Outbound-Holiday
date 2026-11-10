import { editorial } from "../../runtime/catalog";
import { PageLink } from '../common/PageLink';
import { accommodationPath,sectionPath } from '../../routes';
import React from 'react';
import { DetailedAccommodation,FEATURED_HOMEPAGE_ACCOMMODATIONS } from '../../data/accommodationsData';
import { Currency } from '../../types';
import { ArrowRight,Compass } from 'lucide-react';

interface WhereToStaySectionProps {
  currency: Currency;
  onSelectProperty: (property: DetailedAccommodation) => void;
  onExploreAllProperties: () => void;
}

export const WhereToStaySection: React.FC<WhereToStaySectionProps> = ({
  onSelectProperty,
  onExploreAllProperties,
}) => {
  return (
    <section id="where-to-stay" className="py-10 sm:py-14 lg:py-16 bg-[#FAF9F6] border-b border-gray-200/80 relative overflow-hidden">
      
      {/* Decorative Subtle Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0B5E8E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C9A66B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8">
        
        {/* Section Heading & Local Advisory Introduction */}
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B5E8E]/10 border border-[#0B5E8E]/20 text-[#0B5E8E] text-xs font-bold uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/WhereToStaySection.text1")}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B5E8E] tracking-tight">
            {editorial("travel/WhereToStaySection.text2")}</h2>
        </div>

        {/* 4 Featured Accommodation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURED_HOMEPAGE_ACCOMMODATIONS.map((property) => (
            <div
              key={property.id}
              onClick={() => onSelectProperty(property)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={property.heroImage}
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Card Content & Action */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors line-clamp-2 leading-snug">
                  {property.name}
                </h3>

                <PageLink href={accommodationPath(property)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProperty(property);
                  }}
                  className="w-full bg-[#FAF9F6] hover:bg-[#0B5E8E] text-[#0B5E8E] hover:text-white border border-gray-200 hover:border-[#0B5E8E] text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-2xs mt-auto"
                >
                  <span>{editorial("travel/WhereToStaySection.text7")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </PageLink>
              </div>

            </div>
          ))}
        </div>

        {/* Explore More Places to Stay Centred CTA */}
        <div className="text-center pt-2">
          <PageLink href={sectionPath('accommodation')}
            onClick={onExploreAllProperties}
            className="inline-flex items-center justify-center gap-2 bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-xs sm:text-sm py-2.5 px-5 sm:py-4 sm:px-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>{editorial("travel/WhereToStaySection.text8")}</span>
            <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
          </PageLink>
        </div>

      </div>
    </section>
  );
};
