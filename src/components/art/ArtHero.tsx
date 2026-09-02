import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Award, Globe2 } from 'lucide-react';

// Public image paths for experiences
const simunyeSpotlightImg = '/Experiences/Simunye_/Theatre10.jpg';
const simunyeShowImg = '/Experiences/Simunye_/Simunye-Spirit-Of-Africa-31.jpg';

interface ArtHeroProps {
  onExploreCollections: () => void;
  onMeetArtists: () => void;
}

export const ArtHero: React.FC<ArtHeroProps> = ({
  onExploreCollections,
  onMeetArtists,
}) => {
  return (
    <section className="relative bg-[#2F3A44] text-white overflow-hidden py-16 sm:py-24">
      {/* Decorative Accent Background Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25"
        style={{
          backgroundImage: `url(${simunyeShowImg})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2F3A44] via-[#2F3A44]/90 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column Text Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#C9A66B]/20 border border-[#C9A66B]/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#C9A66B] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>Curated Cultural Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight font-serif">
            Discover Authentic African Art, Craftsmanship & Soul
          </h1>

          <p className="text-gray-300 text-base sm:text-lg max-w-xl font-sans leading-relaxed">
            Connecting world collectors, art lovers, and interior designers directly with verified master artists across Zimbabwe, Nigeria, Ghana, South Africa, and Mali.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={onExploreCollections}
              className="w-full sm:w-auto bg-[#C9A66B] hover:bg-[#b8955a] text-[#2F3A44] font-extrabold text-sm px-7 py-3.5 rounded-md shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Shop Collections
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onMeetArtists}
              className="w-full sm:w-auto bg-transparent border-2 border-white/80 hover:bg-white text-white hover:text-[#2F3A44] font-bold text-sm px-7 py-3.5 rounded-md transition-all flex items-center justify-center gap-2"
            >
              Meet Featured Artists
            </button>
          </div>

          {/* Key Trust Guarantees */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-gray-300 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
              <span>Signed Certificate of Authenticity</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#C9A66B]" />
              <span>Worldwide Express Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C9A66B]" />
              <span>Direct Fair-Trade Artist Royalties</span>
            </div>
          </div>
        </div>

        {/* Right Column Featured Spotlight Frame */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C9A66B]/40 group">
            <img
              src={simunyeSpotlightImg}
              alt="Shona Stone Sculpture Spotlight"
              className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="bg-[#C9A66B] text-[#2F3A44] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-sm">
                Masterpiece Spotlight
              </span>
              <h3 className="font-serif text-xl font-bold">
                Shona Springstone Sculpture
              </h3>
              <p className="text-xs text-gray-300">
                By Dominic Benhura • Zimbabwe
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
