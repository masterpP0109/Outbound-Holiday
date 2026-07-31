import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Compass, Shield, Trees, Heart, Utensils } from 'lucide-react';

interface ExperienceExplorerProps {
  onExploreExperiences: () => void;
}

interface CategoryData {
  id: string;
  label: string;
  icon: React.ReactNode;
  imageUrl: string;
  title: string;
  subtitle: string;
  items: { title: string; desc: string; duration: string }[];
}

export const ExperienceExplorer: React.FC<ExperienceExplorerProps> = ({ onExploreExperiences }) => {
  const categories: CategoryData[] = [
    {
      id: 'first-visit',
      label: 'First Visit',
      icon: <Compass className="w-3.5 h-3.5" />,
      imageUrl: 'https://images.unsplash.com/photo-1549472346-607ef3a33904?auto=format&fit=crop&q=80&w=1200',
      title: 'Victoria Falls Essentials',
      subtitle: 'The iconic, non-negotiable highlights recommended for anyone visiting for the first time.',
      items: [
        { title: 'Guided Rainforest Tour of the Falls', desc: 'Walk along the 16 viewpoints opposite Mosi-oa-Tunya.', duration: '2.5 Hours' },
        { title: 'Upper Zambezi Sunset River Cruise', desc: 'Watch hippos & elephants with complimentary sundowners.', duration: '2 Hours' },
        { title: 'The Boma - Dinner & Drum Show', desc: 'Traditional feast, face painting, and energetic African drumming.', duration: '3 Hours' },
        { title: 'Chobe Day Safari Trip (Botswana)', desc: 'Game drive & river safari across the border in Chobe.', duration: 'Full Day' },
      ],
    },
    {
      id: 'wildlife',
      label: 'Wildlife & Safari',
      icon: <Trees className="w-3.5 h-3.5" />,
      imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200',
      title: 'Big Game & River Safaris',
      subtitle: 'Experience Zimbabwe & Botswana’s renowned elephant herds and safari landscapes.',
      items: [
        { title: 'Zambezi National Park Game Drive', desc: '4x4 tracking of lion, leopard, buffalo, and elephant.', duration: '3.5 Hours' },
        { title: 'Rhino Tracking Drive in Victoria Falls', desc: 'Walk with endangered white rhinos accompanied by armed rangers.', duration: '3 Hours' },
        { title: 'Chobe River Safari Cruise', desc: 'Up-close views of swimming elephants and hippos.', duration: 'Full Day' },
        { title: 'Hwange National Park Day Safari', desc: 'Visit Zimbabwe’s largest national park for famous elephant herds.', duration: 'Full Day' },
      ],
    },
    {
      id: 'adventure',
      label: 'Adventure',
      icon: <Shield className="w-3.5 h-3.5" />,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200',
      title: 'Adrenaline & High Thrills',
      subtitle: 'Feel the roar of the Zambezi gorge with world-famous thrill-seeking activities.',
      items: [
        { title: 'White Water Rafting (Batoka Gorge)', desc: 'Tackle the world’s most intense Grade 5 rapids on the Zambezi.', duration: 'Full Day' },
        { title: '13-min "Flight of Angels" Helicopter', desc: 'Soar directly above the curtain of mist and gorge.', duration: '15 Mins' },
        { title: 'Gorge Swing & Zip Line', desc: 'Freefall 70m into the Batoka Gorge for an incredible adrenaline rush.', duration: '2 Hours' },
        { title: 'Devil’s Pool / Livingston Island', desc: 'Swim right up to the lip of the Falls during low-water season.', duration: 'Half Day' },
      ],
    },
    {
      id: 'relaxation',
      label: 'Relaxation',
      icon: <Heart className="w-3.5 h-3.5" />,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      title: 'Serenity & Sunset Luxury',
      subtitle: 'Unwind along the tranquil banks of the Zambezi River with fine dining and gentle breezes.',
      items: [
        { title: 'Luxury Pontoon Sundowner Cruise', desc: 'Signature cocktails and gourmet tapas in total peace.', duration: '2.5 Hours' },
        { title: 'Lookout Cafe High Tea & Lunch', desc: 'Dine on the edge of the Batoka Gorge with panoramic views.', duration: '2 Hours' },
        { title: 'Riverside Spa & Wellness Treatment', desc: 'Massages overlooking the Zambezi riverbanks.', duration: '1.5 Hours' },
        { title: 'Sunset Island High Tea', desc: 'Private boat transfer to a secluded Zambezi island.', duration: '3 Hours' },
      ],
    },
    {
      id: 'family',
      label: 'Family Friendly',
      icon: <Utensils className="w-3.5 h-3.5" />,
      imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1200',
      title: 'Safe Family Discoveries',
      subtitle: 'Memorable, educational and kid-safe experiences designed for parents and children.',
      items: [
        { title: 'Gentle Guided Falls Canopy Tour', desc: 'Fun cable-bridge forest network suitable for ages 6+.', duration: '2 Hours' },
        { title: 'Victoria Falls Bridge History Tour', desc: 'Step onto the historic 1905 bridge with theatrical guides.', duration: '2 Hours' },
        { title: 'Elephant Sanctuary & Conservation', desc: 'Learn about elephant rescue and rehabilitation efforts.', duration: '2 Hours' },
        { title: 'Traditional Village Culture Visit', desc: 'Interactive drumming and story sessions with local villagers.', duration: '2.5 Hours' },
      ],
    },
  ];

  const [activeCatId, setActiveCatId] = useState('first-visit');
  const activeCategory = categories.find((c) => c.id === activeCatId) || categories[0];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
            Experience Explorer
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75] mb-2">
            What kind of experience are you looking for?
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Select a category to filter signature Victoria Falls activities curated by local specialists.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs transition-all ${
                  activeCatId === cat.id
                    ? 'bg-[#0D5C75] text-white shadow-sm ring-2 ring-[#0D5C75]/20'
                    : 'bg-gray-100 text-[#1A2E35] hover:bg-gray-200'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Experience Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
          {/* Left: Changing Featured Photo */}
          <div className="lg:col-span-6 relative rounded-xl overflow-hidden min-h-[300px] shadow-md group">
            <img
              src={activeCategory.imageUrl}
              alt={activeCategory.title}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block bg-[#D97706] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-2">
                Featured Highlight
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif mb-1">{activeCategory.title}</h3>
              <p className="text-xs text-gray-200 line-clamp-2">{activeCategory.subtitle}</p>
            </div>
          </div>

          {/* Right: Curated List of Activities */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-bold text-sm text-[#0D5C75] uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                Recommended Activities:
              </h4>

              <div className="space-y-3">
                {activeCategory.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs hover:border-[#0D5C75] transition-all flex items-start justify-between gap-3"
                  >
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-[#1A2E35] mb-0.5">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-gray-600 leading-normal">
                        {item.desc}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
                      {item.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onExploreExperiences}
                className="w-full bg-[#0D5C75] hover:bg-[#0A485C] text-white font-bold text-xs py-3 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Plan Around These Experiences</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
