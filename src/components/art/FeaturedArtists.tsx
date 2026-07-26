import React from 'react';
import { ARTISTS } from '../../data/artData';
import { MapPin, Award, ExternalLink, Sparkles } from 'lucide-react';

interface FeaturedArtistsProps {
  onSelectArtistFilter: (artistName: string) => void;
}

export const FeaturedArtists: React.FC<FeaturedArtistsProps> = ({
  onSelectArtistFilter,
}) => {
  return (
    <section id="art-artists" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-2">
            Master Craftsmanship
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B5E8E] font-serif mb-3">
            Featured African Artists
          </h2>
          <p className="text-[#2F3A44] text-base">
            Meet the visionary sculptors, textile masters, and painters preserving ancestral techniques while defining contemporary African art globally.
          </p>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {ARTISTS.map((artist) => (
            <div
              key={artist.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Artist Photo Header */}
                <div className="relative h-48 bg-gradient-to-b from-[#2F3A44] to-[#0B5E8E] overflow-hidden">
                  <img
                    src={artist.featuredWorkImage}
                    alt={artist.name}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Avatar Overlay */}
                  <div className="absolute -bottom-6 left-6">
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-16 h-16 rounded-full border-2 border-white object-cover shadow-md"
                    />
                  </div>

                  {/* Country Flag Tag */}
                  <div className="absolute top-4 right-4 bg-white/90 text-[#2F3A44] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E67E22]" />
                    <span>{artist.country}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 pt-9">
                  <h3 className="font-serif font-bold text-lg text-[#0B5E8E] mb-1">
                    {artist.name}
                  </h3>
                  <span className="text-xs font-semibold text-[#3F6B3C] block mb-3">
                    {artist.specialty}
                  </span>

                  <p className="text-xs text-[#2F3A44] leading-relaxed mb-4 line-clamp-3">
                    {artist.biography}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium mb-2">
                    <Award className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Exhibited at: {artist.exhibitions[0]}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 pt-0 mt-auto border-t border-gray-100">
                <button
                  onClick={() => onSelectArtistFilter(artist.name)}
                  className="w-full bg-[#0B5E8E]/10 hover:bg-[#0B5E8E] text-[#0B5E8E] hover:text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  View Profile & Artworks ({artist.totalArtworks})
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
