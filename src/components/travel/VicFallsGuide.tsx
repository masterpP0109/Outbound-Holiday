import React, { useState } from 'react';
import { VIC_FALLS_SPOTS, ACCOMMODATIONS } from '../../data/travelData';
import { MapPin, Info, Star, Compass, BedDouble, Camera, Lightbulb } from 'lucide-react';

export const VicFallsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'spots' | 'hotels'>('spots');
  const [selectedSpotId, setSelectedSpotId] = useState(VIC_FALLS_SPOTS[0].id);

  const selectedSpot = VIC_FALLS_SPOTS.find((s) => s.id === selectedSpotId) || VIC_FALLS_SPOTS[0];

  return (
    <section id="travel-guide" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-2">
            Local Zimbabwean Knowledge
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B5E8E] mb-4">
            Victoria Falls Insider Guide & Stays
          </h2>
          <p className="text-[#2F3A44] text-base">
            Discover the iconic landmarks, hidden viewpoints, and handpicked accommodations across Mosi-oa-Tunya.
          </p>

          {/* Guide / Accommodations Switcher */}
          <div className="inline-flex p-1 bg-gray-200 rounded-lg mt-6">
            <button
              onClick={() => setActiveTab('spots')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'spots'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'text-[#2F3A44] hover:text-[#0B5E8E]'
              }`}
            >
              <Compass className="w-4 h-4" />
              Must-Visit Experiences
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'hotels'
                  ? 'bg-[#0B5E8E] text-white shadow-xs'
                  : 'text-[#2F3A44] hover:text-[#0B5E8E]'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              Handpicked Accommodations
            </button>
          </div>
        </div>

        {/* Tab 1: Spots & Experiences Interactive Showcase */}
        {activeTab === 'spots' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Spot Selector List */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                Select an Experience
              </h3>
              {VIC_FALLS_SPOTS.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => setSelectedSpotId(spot.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    selectedSpotId === spot.id
                      ? 'bg-white border-[#0B5E8E] shadow-md ring-2 ring-[#0B5E8E]/20'
                      : 'bg-white/80 border-gray-200 hover:border-gray-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={spot.imageUrl}
                      alt={spot.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-[#3F6B3C] uppercase block">
                        {spot.category}
                      </span>
                      <h4 className="font-bold text-sm text-[#0B5E8E]">
                        {spot.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {spot.shortDesc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Spot Detailed Showcase Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              <div className="relative h-72 sm:h-80 overflow-hidden">
                <img
                  src={selectedSpot.imageUrl}
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="bg-[#C9A66B] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-2 inline-block">
                    {selectedSpot.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold mb-1">
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
                  <div className="bg-[#0B5E8E]/5 p-4 rounded-xl border border-[#0B5E8E]/15">
                    <span className="text-xs font-bold text-[#0B5E8E] block mb-1 flex items-center gap-1">
                      <Camera className="w-4 h-4 text-[#0B5E8E]" />
                      Ideal For
                    </span>
                    <p className="text-xs text-gray-700 font-semibold">
                      {selectedSpot.idealFor}
                    </p>
                  </div>

                  <div className="bg-[#3F6B3C]/5 p-4 rounded-xl border border-[#3F6B3C]/15">
                    <span className="text-xs font-bold text-[#3F6B3C] block mb-1 flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 text-[#3F6B3C]" />
                      Specialist Insider Tip
                    </span>
                    <p className="text-xs text-gray-700">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ACCOMMODATIONS.map((acc) => (
              <div
                key={acc.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={acc.imageUrl}
                      alt={acc.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-[#0B5E8E] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                      {acc.type}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 text-[#2F3A44] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#E67E22] text-[#E67E22]" />
                      <span>{acc.rating}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#0B5E8E] mb-1">
                      {acc.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#3F6B3C] mb-3">
                      {acc.priceRangeUSD}
                    </p>
                    <p className="text-xs text-[#2F3A44] mb-4 leading-relaxed">
                      {acc.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {acc.features.map((feat, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {feat}
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
