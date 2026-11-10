import { editorial } from "../../runtime/catalog";
import { PageLink } from '../common/PageLink';
import { packagePath,sectionPath } from '../../routes';
import React from 'react';
import { DetailedPackage,getHomepageFeaturedPackages } from '../../data/packagesData';
import { Currency } from '../../types';
import { ArrowRight,Sparkles } from 'lucide-react';

interface FeaturedPackagesProps {
  currency: Currency;
  onSelectPackage: (pkg: DetailedPackage) => void;
  onExploreAllPackages: () => void;
}

const PACKAGE_DISPLAY: Record<string, { title?: string; description: string }> = {
  'pkg-essential': {
    title: 'Victoria Falls Essentials',
    description: 'The ideal gateway package for first-time visitors seeking the iconic wonders of Mosi-oa-Tunya.',
  },
  'pkg-family': {
    title: 'Family Adventure',
    description: 'Unforgettable, safe and exhilarating experiences tailored for all ages.',
  },
  'pkg-romantic': {
    title: 'Romantic Escape',
    description: "An intimate, ultra-luxurious retreat crafted to celebrate life's most memorable moments.",
  },
  'pkg-hwange-combo': {
    title: 'Victoria Falls & Chobe Explorer',
    description: "Combine the majesty of Victoria Falls with Botswana's world-famous Chobe elephant kingdom.",
  },
  'Victoria Falls Essentials': {
    title: 'Victoria Falls Essentials',
    description: 'The ideal gateway package for first-time visitors seeking the iconic wonders of Mosi-oa-Tunya.',
  },
  'Family Adventure': {
    title: 'Family Adventure',
    description: 'Unforgettable, safe and exhilarating experiences tailored for all ages.',
  },
  'Romantic Escape': {
    title: 'Romantic Escape',
    description: "An intimate, ultra-luxurious retreat crafted to celebrate life's most memorable moments.",
  },
  'Victoria Falls & Chobe Explorer': {
    title: 'Victoria Falls & Chobe Explorer',
    description: "Combine the majesty of Victoria Falls with Botswana's world-famous Chobe elephant kingdom.",
  },
  'Vic Falls & Hwange Safari Combo': {
    title: 'Victoria Falls & Chobe Explorer',
    description: "Combine the majesty of Victoria Falls with Botswana's world-famous Chobe elephant kingdom.",
  },
};

export const FeaturedPackages: React.FC<FeaturedPackagesProps> = ({
  onSelectPackage,
  onExploreAllPackages,
}) => {
  const featured = getHomepageFeaturedPackages();

  return (
    <section id="travel-packages" className="py-10 sm:py-14 lg:py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/10 text-[#C9A66B] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/FeaturedPackages.text1")}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B5E8E] tracking-tight">
            {editorial("travel/FeaturedPackages.text2")}</h2>
        </div>

        {/* 4 Featured Package Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((pkg) => {
            const pkgInfo = PACKAGE_DISPLAY[pkg.id] || PACKAGE_DISPLAY[pkg.title];
            const title = pkgInfo?.title || pkg.title;

            return (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
              >
                {/* Hero Image Container */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={pkg.imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Card Body & Action */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#C9A66B] group-hover:text-[#0B5E8E] transition-colors leading-snug line-clamp-2">
                    {title}
                  </h3>

                  <PageLink href={packagePath(pkg)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPackage(pkg);
                    }}
                    className="w-full bg-[#0B5E8E] hover:bg-[#08486e] text-[#C9A66B] text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs mt-auto"
                  >
                    <span className="text-[#C9A66B]">View Holiday Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                  </PageLink>
                </div>
              </div>
            );
          })}
        </div>

        {/* Centered CTA: Find Your Holiday → */}
        <div className="mt-8 sm:mt-10 text-center">
          <PageLink href={sectionPath('packages')}
            onClick={onExploreAllPackages}
            className="inline-flex items-center gap-2 bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-base px-5 py-2.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>{editorial("travel/FeaturedPackages.text9")}</span>
          </PageLink>
        </div>

      </div>
    </section>
  );
};
