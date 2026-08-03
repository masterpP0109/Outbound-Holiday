import React, { useState } from 'react';
import { VIC_FALLS_SPOTS, ACCOMMODATIONS } from '../../data/travelData';
import { MapPin, Info, Star, Compass, BedDouble, Camera, Lightbulb, Sparkles } from 'lucide-react';

interface VicFallsGuideProps {
  onOpenFullGuide?: () => void;
}

export const VicFallsGuide: React.FC<VicFallsGuideProps> = ({ onOpenFullGuide }) => {
  const [activeTab, setActiveTab] = useState<'spots' | 'hotels'>('spots');
  const [selectedSpotId, setSelectedSpotId] = useState(VIC_FALLS_SPOTS[0].id);

  const selectedSpot = VIC_FALLS_SPOTS.find((s) => s.id === selectedSpotId) || VIC_FALLS_SPOTS[0];

  return (
    <section id="travel-guide" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] border-t border-b border-gray-200/80">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block">
            Local Zimbabwean Knowledge
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E] leading-tight">
            Victoria Falls Insider Guide & Stays
          </h2>
          <p className="text-sm sm:text-base text-[#2F3A44] leading-relaxed">
            Discover the iconic landmarks, hidden viewpoints, and handpicked accommodations across Mosi-oa-Tunya.
          </p>

          {/* Featured Banner Link to Dedicated Guide Page */}
          {onOpenFullGuide && (
            <div className="pt-2">
              <button
                onClick={onOpenFullGuide}
                className="bg-[#D97706] hover:bg-[#b86303] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Read The Ultimate First-Time Visitor Guide Page →</span>
              </button>
            </div>
          )}

          {/* Guide / Accommodations Switcher Pills */}
          <div className="inline-flex p-1.5 bg-gray-200/80 rounded-2xl mt-6">
            <button
              onClick={() => setActiveTab('spots')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'spots'
                  ? 'bg-[#0B5E8E] text-white shadow-sm'
                  : 'text-[#2F3A44] hover:text-[#0B5E8E]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Must-Visit Experiences</span>
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'hotels'
                  ? 'bg-[#0B5E8E] text-white shadow-sm'
                  : 'text-[#2F3A44] hover:text-[#0B5E8E]'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>Handpicked Accommodations</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Editorial Split Layout for Spots & Experiences */}
        {activeTab === 'spots' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Spot Selector List (Left 5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold text-[#0B5E8E] uppercase tracking-wider mb-3 px-1">
                Select an Experience
              </h3>
              {VIC_FALLS_SPOTS.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => setSelectedSpotId(spot.id)}
                  className={`p-4 rounded-[18px] border transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 ${
                    selectedSpotId === spot.id
                      ? 'bg-white border-[#0B5E8E] shadow-[0_10px_30px_rgba(11,94,142,0.12)] ring-2 ring-[#0B5E8E]/20 transform translate-x-1'
                      : 'bg-white/80 border-gray-200/80 hover:border-gray-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={spot.imageUrl}
                      alt={spot.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-[#3F6B3C] uppercase block tracking-wider">
                        {spot.category}
                      </span>
                      <h4 className="font-bold font-serif text-sm text-[#0B5E8E] leading-snug">
                        {spot.name}
                      </h4>
                      <p className="text-xs text-[#2F3A44]/75 line-clamp-1 mt-0.5">
                        {spot.shortDesc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Spot Detailed Showcase Card (Right 7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-[24px] border border-gray-200/80 shadow-[0_16px_40px_rgba(47,58,68,0.08)] overflow-hidden">
              <div className="relative h-72 sm:h-96 overflow-hidden">
                <img
                  src={selectedSpot.imageUrl}
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="bg-[#C9A66B] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-1 inline-block shadow-sm">
                    {selectedSpot.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                    {selectedSpot.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/90">
                    <MapPin className="w-3.5 h-3.5 text-[#E67E22]" />
                    <span>{selectedSpot.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <p className="text-sm sm:text-base text-[#2F3A44] leading-relaxed">
                  {selectedSpot.fullDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="bg-[#3F6B3C]/10 p-4 sm:p-5 rounded-2xl border border-[#3F6B3C]/20">
                    <span className="text-xs font-bold text-[#3F6B3C] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#3F6B3C]" />
                      Ideal For
                    </span>
                    <p className="text-xs sm:text-sm text-[#2F3A44] font-semibold leading-relaxed">
                      {selectedSpot.idealFor}
                    </p>
                  </div>

                  {/* Specialist Insider Tip Callout - Golden Savannah Accent */}
                  <div className="bg-[#C9A66B]/10 p-4 sm:p-5 rounded-2xl border border-[#C9A66B]/30">
                    <span className="text-xs font-bold text-[#0B5E8E] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-[#C9A66B]" />
                      Specialist Insider Tip
                    </span>
                    <p className="text-xs sm:text-sm text-[#2F3A44] leading-relaxed">
                      {selectedSpot.insiderTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Accommodations Showcase */}
        {activeTab === 'hotels' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {ACCOMMODATIONS.map((acc) => (
              <div
                key={acc.id}
                className="bg-white rounded-[20px] border border-gray-200/80 overflow-hidden shadow-[0_16px_40px_rgba(47,58,68,0.06)] hover:shadow-[0_20px_50px_rgba(11,94,142,0.12)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={acc.imageUrl}
                      alt={acc.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-[#0B5E8E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {acc.type}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/95 text-[#2F3A44] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-[#E67E22] text-[#E67E22]" />
                      <span>{acc.rating}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold font-serif text-[#0B5E8E] mb-1">
                      {acc.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#3F6B3C] mb-3">
                      {acc.priceRangeUSD}
                    </p>
                    <p className="text-xs sm:text-sm text-[#2F3A44]/80 mb-4 leading-relaxed">
                      {acc.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {acc.features.map((feat, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-[#2F3A44] text-[11px] font-semibold px-2.5 py-1 rounded-md"
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
