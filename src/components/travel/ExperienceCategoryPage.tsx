import React, { useEffect, useState } from 'react';
import { ALL_EXPERIENCES, Experience } from '../../data/experiencesData';
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Compass, 
  Sun, 
  Binoculars, 
  Zap, 
  Waves, 
  Utensils, 
  Map, 
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  Info,
  Star,
  Award,
  Heart
} from 'lucide-react';

// Image Assets from src/assets/Experiences/<Folder>
import fallsTour1 from '../../assets/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
import cruise1 from '../../assets/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
import bomaImg1 from '../../assets/Experiences/Boma Dinner_/IMG_0364.JPG';
import bungee1 from '../../assets/Experiences/Bungee Jump_/Bungee-1-scaled.jpg';
import gameDrive10 from '../../assets/Experiences/Game Drive/Game-drive-10-1-scaled.jpg';
import chobe1 from '../../assets/Experiences/Chobe Day Trip_/Chobe-1-1-scaled.jpg';
import spaImg1 from '../../assets/Experiences/Spa Treatments/IMG_0375.PNG';

export interface ExperienceCategoryPageProps {
  categoryId: string;
  onSelectExperience: (experience: Experience) => void;
  onSelectCategory: (catId: string) => void;
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
  onBackToLanding: () => void;
}

interface CategoryDetail {
  id: string;
  title: string;
  metaTitle: string;
  heroCopy: string;
  editorialIntro: string;
  image: string;
  icon: React.ElementType;
  highlights: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

const CATEGORY_DETAILS: Record<string, CategoryDetail> = {
  'first-visit': {
    id: 'first-visit',
    title: 'First Visit Essentials',
    metaTitle: 'First Time Visitor Experiences in Victoria Falls | Outbound Holidays',
    heroCopy: 'If this is your first time in Victoria Falls, start here. These are the experiences our local specialists recommend for understanding the destination, seeing its iconic sights and capturing signature moments.',
    editorialIntro: 'Victoria Falls is one of the Seven Natural Wonders of the World. For first-time visitors, structuring your itinerary around a guided rainforest tour, an iconic Zambezi sunset cruise, and a traditional cultural dinner guarantees you experience the true spirit of Mosi-oa-Tunya without feeling overwhelmed.',
    image: fallsTour1,
    icon: Sun,
    highlights: [
      { title: 'Rainforest Viewpoints', desc: 'Walk all 16 spectacular viewpoints along the Victoria Falls rainforest trail.' },
      { title: 'Zambezi Sunsets', desc: 'Experience golden hour on the upper river with wildlife and complimentary drinks.' },
      { title: 'Cultural Hospitality', desc: 'Enjoy authentic Zimbabwean dining and interactive djembe drumming.' },
      { title: 'Aerial Perspectives', desc: 'Optional Flight of Angels helicopter ride over the gorge and spray mist.' }
    ],
    faqs: [
      { q: 'What is the best time of day to visit Victoria Falls rainforest?', a: 'Morning hours offer softer light, spectacular rainbows across the gorge, and cooler temperatures for walking.' },
      { q: 'Should I wear a raincoat for the guided tour?', a: 'During high-water season (March to July), raincoats and waterproof phone bags are essential due to heavy spray.' },
      { q: 'Can I combine these first-visit essentials into a 3-day itinerary?', a: 'Yes! Our 3-day First Timer package combines all these essential experiences seamlessly.' }
    ]
  },
  'wildlife': {
    id: 'wildlife',
    title: 'Wildlife & Safari',
    metaTitle: 'Wildlife Safaris & Game Drives in Victoria Falls | Outbound Holidays',
    heroCopy: 'Victoria Falls is surrounded by some of Southern Africa’s most rewarding wildlife destinations. From river safaris and game drives to full-day national park adventures.',
    editorialIntro: 'Located at the meeting point of Zimbabwe, Botswana, Zambia, and Namibia, Victoria Falls offers effortless access to world-class game viewing. Track endangered black rhinos in Zambezi National Park or embark on a day safari to Chobe, guided by certified local trackers.',
    image: gameDrive10,
    icon: Binoculars,
    highlights: [
      { title: 'Big Five Opportunities', desc: 'Track elephant, lion, buffalo, leopard, and endangered rhinos.' },
      { title: 'Chobe Day Safaris', desc: 'Experience the world’s highest elephant density in nearby Botswana.' },
      { title: 'Zambezi River Safaris', desc: 'Up-close sightings of hippo pods, crocodiles, and diverse birdlife.' },
      { title: 'Rhino Tracking Safaris', desc: 'Guided walking safaris with armed rangers in private game reserves.' }
    ],
    faqs: [
      { q: 'Are wildlife sightings guaranteed on game drives?', a: 'While wild animals move freely in their natural habitats, certified trackers have an extremely high success rate locating herds.' },
      { q: 'Is Chobe National Park far from Victoria Falls?', a: 'Chobe is just 70 km away across the Kazungula border, making it a comfortable 1-day safari excursion.' },
      { q: 'What should I bring on a safari drive?', a: 'Bring neutral-colored clothing, sun protection, binoculars, camera, and your passport for border crossings.' }
    ]
  },
  'adventure': {
    id: 'adventure',
    title: 'Adventure',
    metaTitle: 'Adventure & Adrenaline Experiences in Victoria Falls | Outbound Holidays',
    heroCopy: 'Known as Africa’s adventure capital, Victoria Falls offers everything from bridge jumps and gorge swings to white-water rafting and high-speed river runs.',
    editorialIntro: 'The dramatic Batoka Gorge below Victoria Falls forms one of the world’s greatest natural adventure arenas. All extreme activities adhere to rigorous international safety standards, certified equipment inspections, and veteran jump masters.',
    image: bungee1,
    icon: Zap,
    highlights: [
      { title: '111m Bridge Bungee', desc: 'Jump into the Batoka Gorge from the historic Victoria Falls Bridge.' },
      { title: 'Class V Rafting', desc: 'Navigate world-famous rapids on the turbulent Zambezi River.' },
      { title: 'High-Wire Canopy', desc: 'Experience high-speed zip lines, flying fox, and tandem gorge swings.' },
      { title: 'Helicopter Flights', desc: 'Soar through the Batoka Gorge on the exhilarating Flight of Angels.' }
    ],
    faqs: [
      { q: 'What safety certifications do adventure operators hold?', a: 'All operators are audited by international adventure safety bodies and hold comprehensive medical liability insurance.' },
      { q: 'Is white-water rafting available year-round?', a: 'Low water season (August to January) offers the most intense rapids, while high water season runs from February to July.' },
      { q: 'Can I do a bridge jump if I have no prior experience?', a: 'Yes! Full safety briefings are provided by master jump directors prior to every jump.' }
    ]
  },
  'river': {
    id: 'river',
    title: 'River Experiences',
    metaTitle: 'Zambezi River Cruises & Sunset Safaris in Victoria Falls | Outbound Holidays',
    heroCopy: 'The Zambezi River offers a completely different side of Victoria Falls. Choose from relaxed sunset cruises, premium river journeys and unhurried moments on the water.',
    editorialIntro: 'Gliding along the upper Zambezi as the golden African sun sets behind palm-fringed islands is an essential Victoria Falls ritual. Whether on a luxury catamaran or a classic safari boat, river cruises combine tranquility with exceptional wildlife viewing.',
    image: cruise1,
    icon: Waves,
    highlights: [
      { title: 'Relaxed River Pace', desc: 'Navigate calm river channels surrounded by lush riverine forest.' },
      { title: 'Luxury Craft Options', desc: 'Gourmet tapas, open bar, and spacious observation decks.' },
      { title: 'Iconic Sunsets', desc: 'Unmatched golden-hour photographic light across the Zambezi.' },
      { title: 'Abundant River Wildlife', desc: 'Watch elephants swimming across islands and hippos surfacing.' }
    ],
    faqs: [
      { q: 'What is included in a luxury Zambezi sunset cruise?', a: 'Cruises include return hotel transfers, premium open bar, chef-prepared appetizers, and guided wildlife commentary.' },
      { q: 'How long do sunset cruises last?', a: 'Standard cruises last approximately 2 to 2.5 hours on the water during sunset.' },
      { q: 'Are children allowed on sunset river cruises?', a: 'Yes! River cruises are calm, safe, and enjoyable for guests of all ages.' }
    ]
  },
  'culture': {
    id: 'culture',
    title: 'Culture & Food',
    metaTitle: 'Cultural & Culinary Experiences in Victoria Falls | Outbound Holidays',
    heroCopy: 'Go beyond sightseeing and connect with Victoria Falls through local food, live performances, traditional hospitality and cultural storytelling.',
    editorialIntro: 'Zimbabwean hospitality is legendary for its warmth and vibrancy. From interactive djembe drumming and traditional Shangaan dancers to traditional village tours and craft markets, these experiences immerse you in local heritage.',
    image: bomaImg1,
    icon: Utensils,
    highlights: [
      { title: 'Traditional Feast', desc: 'Sample spit-roasted game meats, local sadza, and traditional delicacies.' },
      { title: 'Interactive Drumming', desc: 'Join in live djembe drumming performances guided by master drummers.' },
      { title: 'Artisanal Craft Markets', desc: 'Discover hand-carved wooden sculptures, stone art, and woven crafts.' },
      { title: 'Authentic Heritage', desc: 'Learn about local customs, folklore, and historical traditions.' }
    ],
    faqs: [
      { q: 'Is the Boma Dinner suitable for vegetarians?', a: 'Yes! The Boma features a massive buffet with extensive vegetarian, vegan, and gluten-free selections.' },
      { q: 'Are hotel transfers included for dinner shows?', a: 'Yes, return hotel transfers are included with all Boma and cultural dinner bookings.' }
    ]
  },
  'day-trips': {
    id: 'day-trips',
    title: 'Day Trips',
    metaTitle: 'Day Excursions from Victoria Falls | Chobe & Hwange | Outbound Holidays',
    heroCopy: 'Use Victoria Falls as your base for exploring nearby wildlife destinations, border towns and regional highlights that can be experienced in a single day.',
    editorialIntro: 'Thanks to its central geographic location, Victoria Falls serves as the perfect springboard for day trips into Botswana’s Chobe National Park or Zimbabwe’s massive Hwange National Park, returning to your lodge by evening.',
    image: chobe1,
    icon: Map,
    highlights: [
      { title: 'Chobe National Park', desc: 'Combine a river safari and land 4x4 drive in Botswana.' },
      { title: 'Hwange Game Drives', desc: 'Explore Zimbabwe’s premier elephant sanctuary on a day safari.' },
      { title: 'Cross-Border Efficiency', desc: 'Seamless border assistance handled by our professional transfer crew.' },
      { title: 'All-Inclusive Excursions', desc: 'Includes hotel pickup, park fees, guided safaris, and buffet lunch.' }
    ],
    faqs: [
      { q: 'Do I need a visa for the Chobe Day Trip to Botswana?', a: 'Many nationalities receive visa-free entry or a KAZA Univisa covering Zimbabwe and Zambia. Check passport requirements before travel.' },
      { q: 'What time does a Chobe Day Safari start and end?', a: 'Pickups begin around 07:00 AM with return transfers bringing you back to Victoria Falls by 17:30 PM.' }
    ]
  },
  'wellness': {
    id: 'wellness',
    title: 'Spa & Wellness',
    metaTitle: 'Luxury Safari Spa & Wellness in Victoria Falls | Outbound Holidays',
    heroCopy: 'Rejuvenate your senses after thrilling safari adventures with bespoke African botanical spa treatments, open-air bush massages, and tranquil hydrotherapy.',
    editorialIntro: 'Victoria Falls is the perfect sanctuary to unwind. Set within tranquil safari estate grounds overlooking wildlife waterholes and indigenous teak forests, our partnered wellness sanctuaries offer signature massages using marula and baobab oils.',
    image: spaImg1,
    icon: Heart,
    highlights: [
      { title: 'African Botanical Therapies', desc: 'Indulge in treatments infused with organic marula, baobab, and melon seed oils.' },
      { title: 'Bushveld View Pavilions', desc: 'Relax in open-air treatment suites overlooking tranquil wildlife watering holes.' },
      { title: 'Hydrotherapy Pools', desc: 'Enjoy restorative plunge pools, herbal sauna suites, and tranquil sun decks.' },
      { title: 'Couples Sanctuary', desc: 'Private double massage pavilions with outdoor soaking tubs for partners.' }
    ],
    faqs: [
      { q: 'Are hotel transfers included with spa bookings?', a: 'Yes, complimentary return road transfers from any Victoria Falls hotel or lodge are included with treatments over 60 minutes.' },
      { q: 'Can spa treatments be tailored for couples?', a: 'Yes, dedicated couples suites with dual massage beds and private baths are available upon request.' }
    ]
  }
};

export const ExperienceCategoryPage: React.FC<ExperienceCategoryPageProps> = ({
  categoryId,
  onSelectExperience,
  onSelectCategory,
  onOpenPlanHoliday,
  onNavigateHome,
  onBackToLanding
}) => {
  const detail = CATEGORY_DETAILS[categoryId] || CATEGORY_DETAILS['first-visit'];
  const CategoryIcon = detail.icon;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Filter central experience data source dynamically
  const categoryExperiences = ALL_EXPERIENCES.filter(exp => exp.categories.includes(categoryId as any));

  // Determine 3 related categories for navigation
  const allCategoryKeys = Object.keys(CATEGORY_DETAILS);
  const relatedCategoryKeys = allCategoryKeys.filter(k => k !== categoryId).slice(0, 3);

  useEffect(() => {
    document.title = detail.metaTitle;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [categoryId]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1A2E35]">
      
      {/* 1. CATEGORY HERO */}
      <section className="relative bg-[#0D2833] text-white py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#C9A66B]/30">
        <div className="absolute inset-0 z-0">
          <img 
            src={detail.image} 
            alt={detail.title} 
            className="w-full h-full object-cover object-center scale-105 filter brightness-90 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D2833]/95 via-[#0D2833]/85 to-[#0D2833]/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-transparent to-[#0D2833]/70" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center">
          
          {/* Breadcrumb Navigation */}
          <nav className="inline-flex items-center gap-2 text-xs text-white/80 font-medium bg-[#0D2833]/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            <button onClick={onNavigateHome} className="hover:text-white transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <button onClick={onBackToLanding} className="hover:text-white transition-colors cursor-pointer">
              Things to Do
            </button>
            <span>/</span>
            <span className="text-[#C9A66B] font-semibold">{detail.title}</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D2833]/80 backdrop-blur-md border border-[#C9A66B]/60 text-[#E5C989] text-xs font-bold uppercase tracking-widest shadow-lg mx-auto">
            <CategoryIcon className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>CATEGORY SELECTION ({categoryExperiences.length} ACTIVITIES)</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
            {detail.title} in Victoria Falls
          </h1>

          <p className="text-base sm:text-lg text-gray-100 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-xs">
            {detail.heroCopy}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('category-experiences-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#C9A66B]/40"
            >
              <span>Explore {detail.title}</span>
              <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
            </button>

            <button
              onClick={onOpenPlanHoliday}
              className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Plan My Holiday</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. EDITORIAL INTRODUCTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#C9A66B]" />
            <span>LOCAL ADVISOR GUIDANCE</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
            Why Choose {detail.title}?
          </h2>

          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-light max-w-2xl mx-auto">
            {detail.editorialIntro}
          </p>
        </div>
      </section>

      {/* 3. CATEGORY HIGHLIGHTS (4 Icon Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {detail.highlights.map((item, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-2 text-left hover:border-[#C9A66B]/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E]">
                <CheckCircle2 className="w-5 h-5 text-[#C9A66B]" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#0B5E8E]">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EXPERIENCE GRID */}
      <section id="category-experiences-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200/60 scroll-mt-28 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
              CURATED ACTIVITIES
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0B5E8E]">
              {detail.title} Experiences
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-xl border border-gray-200/60">
            Showing all {categoryExperiences.length} activities
          </span>
        </div>

        {categoryExperiences.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
            <HelpCircle className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-gray-600 text-sm">No experiences available in this category at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {categoryExperiences.map((exp) => (
              <div
                key={exp.id}
                onClick={() => onSelectExperience(exp)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1 h-full"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    <img
                      src={exp.featuredImage}
                      alt={exp.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {exp.badge && (
                      <div className="absolute top-3 left-3 bg-[#C9A66B] text-[#0D2833] px-2.5 py-1 rounded-md text-[10px] font-bold shadow-md">
                        {exp.badge}
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-[#0D2833]/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold border border-white/20 shadow-xs">
                      {exp.fromPrice}
                    </div>

                    <div className="absolute bottom-3 left-3 bg-white/95 text-[#0B5E8E] backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3 text-[#C9A66B]" />
                      <span>{exp.duration}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-serif font-bold text-lg text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 font-light">
                      {exp.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExperience(exp);
                    }}
                    className="w-full bg-[#FAF9F6] group-hover:bg-[#0B5E8E] text-[#0B5E8E] group-hover:text-white border border-gray-200 group-hover:border-[#0B5E8E] text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>View Experience Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. RELATED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200/60 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
            MORE WAYS TO EXPERIENCE VICTORIA FALLS
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0B5E8E]">
            Visitors exploring {detail.title} also enjoy:
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedCategoryKeys.map((relKey) => {
            const relCat = CATEGORY_DETAILS[relKey];
            const RelIcon = relCat.icon;
            const count = ALL_EXPERIENCES.filter(e => e.categories.includes(relKey as any)).length;

            return (
              <div
                key={relKey}
                onClick={() => onSelectCategory(relKey)}
                className="group relative h-56 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 flex flex-col justify-end p-5"
              >
                <img 
                  src={relCat.image} 
                  alt={relCat.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/60 to-transparent" />
                <div className="relative z-10 space-y-1 text-white">
                  <div className="flex items-center gap-1.5 text-[#E5C989] text-[11px] font-bold">
                    <RelIcon className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{count} Activities</span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#E5C989] transition-colors">
                    {relCat.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[#C9A66B] font-bold pt-1">
                    <span>Explore Category</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CATEGORY FAQ */}
      {detail.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200/60 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
              Frequently Asked Questions: {detail.title}
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-xs">
            {detail.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx}>
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    <span className="font-serif font-bold text-sm text-[#0B5E8E]">
                      {faq.q}
                    </span>
                    <div className={`p-1 rounded-full ${isOpen ? 'bg-[#0B5E8E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 font-light leading-relaxed border-t border-gray-50 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-[#0D2833] via-[#0B5E8E] to-[#0D2833] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-[#C9A66B]/40">
          
          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#E5C989]">
              <Sparkles className="w-4 h-4 text-[#C9A66B]" />
              <span>START PLANNING</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-white">
              Start Planning Your Victoria Falls Adventure
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed">
              Tell us about your interests, travel dates, pace and budget, and our local specialists will build a custom itinerary featuring {detail.title.toLowerCase()}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenPlanHoliday}
              className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Plan My Holiday</span>
            </button>

            <a
              href={`https://wa.me/263714701721?text=${encodeURIComponent(
                `Hello Outbound Holidays,\n\nI’m planning a Victoria Falls trip and am interested in ${detail.title}. Could you help me select the best activities for my dates?\n\nThank you.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C9A66B_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
      </section>

    </div>
  );
};
