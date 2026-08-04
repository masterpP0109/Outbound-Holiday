import React, { useState } from 'react';
import { Compass, Shield, Trees, Heart, Utensils, ArrowRight } from 'lucide-react';

import intentVicFallsIconicImg from '../../assets/images/intent_vic_falls_iconic_1785490034846.jpg';
import footerZambeziDuskImg from '../../assets/images/footer_zambezi_dusk_1785494130616.jpg';
import intentBomaImg from '../../assets/images/intent_boma_celebration_zim_1785489746202.jpg';
import intentGorgeHelicopterImg from '../../assets/images/intent_gorge_helicopter_zim_1785489759987.jpg';
import rhinoTrackingImg from '../../assets/images/rhino_tracking_drive_1785497819922.jpg';

interface ExperienceExplorerProps {
  onExploreExperiences: () => void;
  onSelectBoma?: () => void;
}

interface ActivityItem {
  title: string;
  desc: string;
  price: string;
  duration: string;
  advisorTip: string;
  whyWeRecommend?: string;
  imageUrl?: string;
}

interface CategoryData {
  id: string;
  label: string;
  icon: React.ReactNode;
  imageUrl: string;
  title: string;
  subtitle: string;
  items: ActivityItem[];
}

export const ExperienceExplorer: React.FC<ExperienceExplorerProps> = ({ onExploreExperiences, onSelectBoma }) => {
  const categories: CategoryData[] = [
    {
      id: 'first-visit',
      label: 'First Visit',
      icon: <Compass className="w-3.5 h-3.5" />,
      imageUrl: intentVicFallsIconicImg,
      title: 'Victoria Falls Essentials',
      subtitle: 'The iconic highlights recommended for anyone visiting for the first time.',
      items: [
        { 
          title: 'Guided Rainforest Tour of the Falls', 
          desc: 'Walk along the 16 viewpoints opposite Mosi-oa-Tunya.', 
          price: 'From US$55 pp',
          duration: '2.5 Hours',
          advisorTip: '⭐ Best first experience if you’ve never visited Victoria Falls.',
          whyWeRecommend: 'If it’s your first visit to Victoria Falls, this is where we suggest you start. It gives you the best introduction to the Falls, the rainforest, and the history behind one of the Seven Natural Wonders of the World.',
          imageUrl: intentVicFallsIconicImg
        },
        { 
          title: 'Upper Zambezi Sunset River Cruise', 
          desc: 'Watch hippos & elephants with complimentary sundowners.', 
          price: 'From US$85 pp',
          duration: '2 Hours',
          advisorTip: '❤️ Perfect for couples and photographers.',
          whyWeRecommend: 'One of our favourite ways to end the day. Relax on the Zambezi River, enjoy incredible sunsets, and often spot hippos, crocodiles, and elephants along the riverbanks.',
          imageUrl: footerZambeziDuskImg
        },
        { 
          title: 'The Boma - Dinner & Drum Show', 
          desc: 'Traditional feast, face painting, and energetic African drumming.', 
          price: 'From US$55 pp',
          duration: '3 Hours',
          advisorTip: '🥁 Festive cultural celebration & traditional feast for all ages.',
          whyWeRecommend: 'A festive, warm cultural celebration that brings everyone together for traditional dishes and interactive drumming.',
          imageUrl: intentBomaImg
        },
        { 
          title: 'Chobe Day Safari Trip (Botswana)', 
          desc: 'Game drive & river safari across the border in Chobe.', 
          price: 'From US$185 pp',
          duration: 'Full Day',
          advisorTip: '🐘 Highest chance of seeing elephants in one day.',
          whyWeRecommend: 'Ideal if you want to add a world-class elephant safari into a single day without moving hotels.',
          imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&q=80&w=600'
        },
      ],
    },
    {
      id: 'wildlife',
      label: 'Wildlife & Safari',
      icon: <Trees className="w-3.5 h-3.5" />,
      imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200',
      title: 'Big Game & River Safaris',
      subtitle: 'Discover Africa’s wildlife with local expert rangers and guided game tracks.',
      items: [
        { 
          title: 'Zambezi National Park Game Drive', 
          desc: '4x4 tracking of lion, leopard, buffalo, and elephant.', 
          price: 'From US$75 pp',
          duration: '3.5 Hours',
          advisorTip: '🌅 Peaceful riverbank wildlife tracking just 10 mins from hotels.',
          whyWeRecommend: 'Just minutes from town, this park offers peaceful game drives along the riverbanks without long transfer times.',
          imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=600'
        },
        { 
          title: 'Rhino Tracking Drive in Victoria Falls', 
          desc: 'Walk with endangered white rhinos accompanied by armed rangers.', 
          price: 'From US$120 pp',
          duration: '3 Hours',
          advisorTip: '🦏 Rare chance to track white rhinos safely on foot with armed rangers.',
          whyWeRecommend: 'A rare opportunity to support local conservation while tracking white rhinos safely on foot with expert park rangers.',
          imageUrl: rhinoTrackingImg
        },
        { 
          title: 'Chobe River Safari Cruise', 
          desc: 'Up-close views of swimming elephants and hippos.', 
          price: 'From US$185 pp',
          duration: 'Full Day',
          advisorTip: '🐊 Water-level wildlife encounters along the Chobe River.',
          whyWeRecommend: 'During the dry season, river safaris offer some of the most dramatic wildlife viewing in southern Africa.',
          imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600'
        },
        { 
          title: 'Hwange National Park Day Safari', 
          desc: 'Visit Zimbabwe’s largest national park for famous elephant herds.', 
          price: 'From US$220 pp',
          duration: 'Full Day',
          advisorTip: '🦁 Zimbabwe’s premier game reserve with legendary elephant herds.',
          whyWeRecommend: 'Hwange is legendary for its massive elephant herds. We match you with top-tier local guides for the best sightings.',
          imageUrl: 'https://images.unsplash.com/photo-1551009175-15bdf9dcb580?auto=format&fit=crop&q=80&w=600'
        },
      ],
    },
    {
      id: 'adventure',
      label: 'Adventure',
      icon: <Shield className="w-3.5 h-3.5" />,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200',
      title: 'Adrenaline & High Thrills',
      subtitle: 'Feel the roar of the Batoka Gorge with carefully selected, high-safety thrill experiences.',
      items: [
        { 
          title: 'White Water Rafting (Batoka Gorge)', 
          desc: 'Tackle the world’s most intense Grade 5 rapids on the Zambezi.', 
          price: 'From US$135 pp',
          duration: 'Full Day',
          advisorTip: '🌊 World-class Grade 5 rapids with master river captains.',
          whyWeRecommend: 'Renowned worldwide for thrilling Grade 5 rapids. We only partner with licensed river captains with perfect safety records.',
          imageUrl: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&q=80&w=600'
        },
        { 
          title: '13-min "Flight of Angels" Helicopter', 
          desc: 'Soar directly above the curtain of mist and gorge.', 
          price: 'From US$150 pp',
          duration: '15 Mins',
          advisorTip: '🚁 The ultimate panoramic view of the full 1,700m water curtain.',
          whyWeRecommend: 'The only way to comprehend the sheer scale of Mosi-oa-Tunya. Unmatched aerial photography opportunities.',
          imageUrl: intentGorgeHelicopterImg
        },
        { 
          title: 'Gorge Swing & Zip Line', 
          desc: 'Freefall 70m into the Batoka Gorge for an incredible adrenaline rush.', 
          price: 'From US$110 pp',
          duration: '2 Hours',
          advisorTip: '💥 Unforgettable canyon freefall for brave adrenaline lovers.',
          whyWeRecommend: 'An unforgettable leap over the canyon with high safety standards and stunning gorge views.',
          imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600'
        },
        { 
          title: 'Devil’s Pool / Livingstone Island', 
          desc: 'Swim right up to the lip of the Falls during low-water season.', 
          price: 'From US$125 pp',
          duration: 'Half Day',
          advisorTip: '🏊 Exclusive low-water seasonal swim right on the edge of the lip.',
          whyWeRecommend: 'A bucket-list experience available strictly during low-water months under strict expert supervision.',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600'
        },
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
        { 
          title: 'Luxury Pontoon Sundowner Cruise', 
          desc: 'Signature cocktails and gourmet tapas in total peace.', 
          price: 'From US$110 pp',
          duration: '2.5 Hours',
          advisorTip: '🥂 Boutique river lounge with gourmet tapas & quiet seating.',
          whyWeRecommend: 'A boutique, quieter alternative to larger riverboats, featuring plush seating and refined dining.',
          imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600'
        },
        { 
          title: 'Lookout Cafe High Tea & Lunch', 
          desc: 'Dine on the edge of the Batoka Gorge with panoramic views.', 
          price: 'From US$45 pp',
          duration: '2 Hours',
          advisorTip: '☕ Unmatched cliffside lunch views 120m above the rapids.',
          whyWeRecommend: 'Offers the best lunch view in Victoria Falls, overlooking the gorge and historic railway bridge.',
          imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600'
        },
        { 
          title: 'Riverside Spa & Wellness Treatment', 
          desc: 'Massages overlooking the Zambezi riverbanks.', 
          price: 'From US$80 pp',
          duration: '1.5 Hours',
          advisorTip: '🌿 Open-air soothing therapies accompanied by natural river sounds.',
          whyWeRecommend: 'Soothing open-air treatments accompanied by the natural sounds of river wildlife.',
          imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600'
        },
        { 
          title: 'Sunset Island High Tea', 
          desc: 'Private boat transfer to a secluded Zambezi island.', 
          price: 'From US$95 pp',
          duration: '3 Hours',
          advisorTip: '🏝️ Exclusive private island afternoon tea surrounded by wild river.',
          whyWeRecommend: 'An exclusive riverside afternoon experience surrounded by pristine river channel views.',
          imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600'
        },
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
        { 
          title: 'Gentle Guided Falls Canopy Tour', 
          desc: 'Fun cable-bridge forest network suitable for ages 6+.', 
          price: 'From US$70 pp',
          duration: '2 Hours',
          advisorTip: '🌿 Kid-safe forest rope walks & gentle slides for ages 6+.',
          whyWeRecommend: 'Travelling with kids? We recommend this morning forest canopy walk for safe, active family fun.',
          imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=600'
        },
        { 
          title: 'Victoria Falls Bridge History Tour', 
          desc: 'Step onto the historic 1905 bridge with theatrical guides.', 
          price: 'From US$65 pp',
          duration: '2 Hours',
          advisorTip: '🌉 Educational & theatrical history brought to life under the bridge.',
          whyWeRecommend: 'Fascinating engineering history brought to life by local guides in a safe, scenic environment.',
          imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600'
        },
        { 
          title: 'Elephant Sanctuary & Conservation', 
          desc: 'Learn about elephant rescue and rehabilitation efforts.', 
          price: 'From US$90 pp',
          duration: '2 Hours',
          advisorTip: '🐘 Heartwarming rescue sanctuary encounter that children adore.',
          whyWeRecommend: 'An engaging, gentle educational encounter teaching children about wildlife rescue.',
          imageUrl: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&q=80&w=600'
        },
        { 
          title: 'Traditional Village Culture Visit', 
          desc: 'Interactive drumming and story sessions with local villagers.', 
          price: 'From US$40 pp',
          duration: '2.5 Hours',
          advisorTip: '🤝 Authentic rural village cultural sharing & warm community welcome.',
          whyWeRecommend: 'A warm, authentic community interaction that broadens horizons for travellers of all ages.',
          imageUrl: 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&q=80&w=600'
        },
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
            How would you like to experience Victoria Falls?
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
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
          {/* Left: Changing Featured Category Cover Photo */}
          <div className="lg:col-span-5 relative rounded-xl overflow-hidden min-h-[360px] lg:min-h-[440px] h-full shadow-md group bg-gray-900">
            <img
              src={activeCategory.imageUrl}
              alt={activeCategory.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center sm:object-[center_25%] transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-flex items-center gap-1 bg-[#D97706] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-2 shadow-xs">
                ⭐ Outbound Recommends
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif mb-1">{activeCategory.title}</h3>
              <p className="text-xs text-gray-200 line-clamp-2">{activeCategory.subtitle}</p>
            </div>
          </div>

          {/* Right: Activity Cards with Photos */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-bold text-sm text-[#0D5C75] uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                Recommended Activities:
              </h4>

              <div className="space-y-3">
                {activeCategory.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-[#0D5C75] hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3.5"
                  >
                    {/* Activity Specific Thumbnail Photo */}
                    {item.imageUrl && (
                      <div className="w-full sm:w-32 md:w-36 h-36 sm:h-28 rounded-lg overflow-hidden shrink-0 relative bg-gray-100 group/img shadow-2xs">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5 w-full">
                      {/* Title & Price / Duration badges */}
                      <div className="flex flex-wrap items-start justify-between gap-1.5">
                        <h5 className="font-bold text-xs sm:text-sm text-[#1A2E35] flex-1 min-w-[180px]">
                          {item.title}
                        </h5>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-bold text-[#0D5C75] bg-[#0D5C75]/10 border border-[#0D5C75]/20 px-2.5 py-0.5 rounded-md whitespace-nowrap">
                            {item.price}
                          </span>
                          <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                            ⏱ {item.duration}
                          </span>
                        </div>
                      </div>

                      {/* Brief Description */}
                      <p className="text-[11px] text-gray-600 leading-normal">
                        {item.desc}
                      </p>

                      {/* Advisor Highlight Tag */}
                      {item.advisorTip && (
                        <div className="text-[11px] font-semibold text-[#854D0E] bg-[#FEF3C7]/80 px-2.5 py-1 rounded-md border border-[#FDE68A] inline-block mt-1">
                          {item.advisorTip}
                        </div>
                      )}

                      {/* Detailed Recommendation Reason */}
                      {item.whyWeRecommend && (
                        <div className="bg-[#FDFBF7] p-2.5 rounded-lg border-l-2 border-[#C9A66B] text-[11px] text-[#2F3A44] mt-2 shadow-2xs">
                          <span className="font-bold text-[#0D5C75] block text-[10px] uppercase tracking-wider mb-0.5">
                            💡 Local Advisor Insight
                          </span>
                          <span>{item.whyWeRecommend}</span>
                        </div>
                      )}

                      {/* Direct Boma Editorial Page Link */}
                      {item.title.includes('Boma') && onSelectBoma && (
                        <div className="pt-2">
                          <button
                            onClick={onSelectBoma}
                            className="bg-[#0D5C75] hover:bg-[#0A485C] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Read Boma Experience Guide</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onExploreExperiences}
                className="w-full bg-[#0D5C75] hover:bg-[#0A485C] text-white font-bold text-xs py-3.5 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
