import React, { useState } from 'react';
import { VIC_FALLS_SPOTS, ACCOMMODATIONS } from '../../data/travelData';
import { MapPin, Info, Star, Compass, BedDouble, Lightbulb } from 'lucide-react';
import { useScrollReveal } from '../../hooks';

export const VicFallsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'spots' | 'hotels'>('spots');
  const [selectedSpotId, setSelectedSpotId] = useState(VIC_FALLS_SPOTS[0].id);
  const { ref, isVisible } = useScrollReveal(0.1);

  const selectedSpot = VIC_FALLS_SPOTS.find((s) => s.id === selectedSpotId) || VIC_FALLS_SPOTS[0];

  return (
    <section id="travel-guide" className="py-20 md:py-24 bg-[#FAFAFA]">
      <div
        ref={ref}
        className={`container-center ${isVisible ? 'animate-reveal visible' : 'animate-reveal'}`}
      >
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="section-label">Local Zimbabwean Knowledge</span>
          <h2 className="section-heading text-[#0B5E8E]">
            Victoria Falls Insider Guide & Stays
          </h2>
          <p className="text-[#2F3A44] text-base sm:text-lg mx-auto">
            Discover the iconic landmarks, hidden viewpoints, and handpicked accommodations across Mosi-oa-Tunya.
          </p>

          {/* Guide / Accommodations Switcher */}
          <div className="inline-flex p-1.5 bg-gray-200/80 rounded-2xl mt-6">
            <button
              onClick={() => setActiveTab('spots')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'spots'
                  ? 'bg-[#0B5E8E] text-white shadow-sm'
                  : 'text-[#2F3A44] hover:text-[#0B5E8E]'
              }`}
            >
              <Compass className="w-4 h-4" />
              Must-Visit Experiences
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'hotels'
                  ? 'bg-[#0B5E8E] text-white shadow-sm'
                  : 'text-[#2F3A44] hover:text-[#0B5E8E]'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              Handpicked Accommodations
            </button>
          </div>
        </div>

        {/* Tab 1: Spots & Experiences */}
        {activeTab === 'spots' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Spot Selector List */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">
                Select an Experience
              </h3>
              <div className="space-y-3">
                {VIC_FALLS_SPOTS.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedSpotId(spot.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                      selectedSpotId === spot.id
                        ? 'bg-white border-[#0B5E8E] shadow-card'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={spot.imageUrl}
                        alt={spot.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#3F6B3C] uppercase block mb-0.5">
                          {spot.category}
                        </span>
                        <h4 className="font-bold text-sm text-[#0B5E8E] truncate">
                          {spot.name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {spot.shortDesc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Spot Detailed Showcase */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 overflow-hidden">
              <div key={selectedSpot.id} className="relative h-72 sm:h-80 md:h-96 overflow-hidden">
                <img
                  src={selectedSpot.imageUrl}
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="bg-[#3F6B3C] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-2 inline-block">
                    {selectedSpot.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif mb-1">
                    {selectedSpot.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/90">
                    <MapPin className="w-3.5 h-3.5 text-[#E67E22]" />
                    <span>{selectedSpot.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <p className="text-sm sm:text-base text-[#2F3A44] leading-relaxed max-w-2xl">
                  {selectedSpot.fullDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="bg-[#0B5E8E]/5 p-5 rounded-2xl border border-[#0B5E8E]/10">
                    <span className="text-xs font-bold text-[#0B5E8E] block mb-1.5">
                      Ideal For
                    </span>
                    <p className="text-sm text-gray-700 font-semibold">
                      {selectedSpot.idealFor}
                    </p>
                  </div>

                  <div className="bg-[#C9A66B]/5 p-5 rounded-2xl border border-[#C9A66B]/15">
                    <span className="text-xs font-bold text-[#C9A66B] block mb-1.5">
                      Specialist Insider Tip
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedSpot.insiderTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Accommodations */}
        {activeTab === 'hotels' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ACCOMMODATIONS.map((acc) => (
              <div
                key={acc.id}
                className="card overflow-hidden flex flex-col h-full"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={acc.imageUrl}
                    alt={acc.name}
                    className="w-full h-full object-cover transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-[#0B5E8E] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    {acc.type}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/95 text-[#2F3A44] text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#E67E22] text-[#E67E22]" />
                    <span>{acc.rating}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-[#0B5E8E] mb-1 font-serif">
                    {acc.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#3F6B3C] mb-3">
                    {acc.priceRangeUSD}
                  </p>
                  <p className="text-sm text-[#2F3A44] mb-4 leading-relaxed flex-1">
                    {acc.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {acc.features.map((feat, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 text-[11px] font-medium px-3 py-1 rounded-lg"
                      >
                        {feat}
                      </span>
                    ))}
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
