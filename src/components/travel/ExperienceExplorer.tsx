import { editorialFormat } from "../../runtime/catalog";
import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import React,{ useState } from 'react';
import { Compass,Shield,Trees,Heart,Utensils,ArrowRight } from 'lucide-react';

// Public image paths for experiences
let guidedTourImg: any;
registerContent(() => { guidedTourImg = editorialValue("travel/ExperienceExplorer.guidedTourImg", {}); });
let standardCruiseImg: any;
registerContent(() => { standardCruiseImg = editorialValue("travel/ExperienceExplorer.standardCruiseImg", {}); });


let gameDriveImg: any;
registerContent(() => { gameDriveImg = editorialValue("travel/ExperienceExplorer.gameDriveImg", {}); });






let elephantImg: any;
registerContent(() => { elephantImg = editorialValue("travel/ExperienceExplorer.elephantImg", {}); });

let bungeeImg: any;
registerContent(() => { bungeeImg = editorialValue("travel/ExperienceExplorer.bungeeImg", {}); });

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
      label: editorial("travel/ExperienceExplorer.text1"),
      icon: <Compass className="w-3.5 h-3.5" />,
      imageUrl: guidedTourImg,
      title: editorial("travel/ExperienceExplorer.text2"),
      subtitle: editorialFormat("travel/ExperienceExplorer.copy1"),
      items: editorialValue("travel/ExperienceExplorer.section1", {}),
    },
    {
      id: 'wildlife',
      label: editorial("travel/ExperienceExplorer.text15"),
      icon: <Trees className="w-3.5 h-3.5" />,
      imageUrl: gameDriveImg,
      title: editorial("travel/ExperienceExplorer.text16"),
      subtitle: editorialFormat("travel/ExperienceExplorer.copy2"),
      items: editorialValue("travel/ExperienceExplorer.section2", {}),
    },
    {
      id: 'adventure',
      label: editorial("travel/ExperienceExplorer.text29"),
      icon: <Shield className="w-3.5 h-3.5" />,
      imageUrl: bungeeImg,
      title: editorial("travel/ExperienceExplorer.text30"),
      subtitle: editorialFormat("travel/ExperienceExplorer.copy3"),
      items: editorialValue("travel/ExperienceExplorer.section3", {}),
    },
    {
      id: 'relaxation',
      label: editorial("travel/ExperienceExplorer.text43"),
      icon: <Heart className="w-3.5 h-3.5" />,
      imageUrl: standardCruiseImg,
      title: editorial("travel/ExperienceExplorer.text44"),
      subtitle: editorialFormat("travel/ExperienceExplorer.copy4"),
      items: editorialValue("travel/ExperienceExplorer.section4", {}),
    },
    {
      id: 'family',
      label: editorial("travel/ExperienceExplorer.text57"),
      icon: <Utensils className="w-3.5 h-3.5" />,
      imageUrl: elephantImg,
      title: editorial("travel/ExperienceExplorer.text58"),
      subtitle: editorialFormat("travel/ExperienceExplorer.copy5"),
      items: editorialValue("travel/ExperienceExplorer.section5", {}),
    },
  ];

  const [activeCatId, setActiveCatId] = useState('first-visit');
  const activeCategory = categories.find((c) => c.id === activeCatId) || categories[0];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
            {editorial("travel/ExperienceExplorer.text71")}</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75] mb-2">
            {editorial("travel/ExperienceExplorer.text72")}</h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            {editorial("travel/ExperienceExplorer.text73")}</p>

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
                {editorial("travel/ExperienceExplorer.text74")}</span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif mb-1">{activeCategory.title}</h3>
              <p className="text-xs text-gray-200 line-clamp-2">{activeCategory.subtitle}</p>
            </div>
          </div>

          {/* Right: Activity Cards with Photos */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-bold text-sm text-[#0D5C75] uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                {editorial("travel/ExperienceExplorer.text75")}</h4>

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
                            {editorial("travel/ExperienceExplorer.text76")}</span>
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
                            <span>{editorial("travel/ExperienceExplorer.text77")}</span>
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
                <span>{editorial("travel/ExperienceExplorer.text78")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
