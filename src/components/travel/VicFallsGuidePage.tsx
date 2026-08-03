import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarCheck, 
  Compass, 
  Clock, 
  MapPin, 
  HelpCircle, 
  Users, 
  Heart, 
  Zap, 
  Crown, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  Calendar, 
  DollarSign, 
  Bed, 
  CheckCircle2, 
  Quote, 
  Lightbulb, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  Sun, 
  Plane, 
  FileText, 
  PhoneCall,
  ArrowRight,
  Utensils,
  Check,
  Award,
  Luggage,
  Map,
  Compass as CompassIcon,
  MessageSquare,
  ChevronUp
} from 'lucide-react';

import vicFallsIconicImg from '../../assets/images/intent_vic_falls_iconic_1785490034846.jpg';
import familyTourImg from '../../assets/images/zimbabwean_family_tour_1785488498015.jpg';
import coupleHoneymoonImg from '../../assets/images/zimbabwean_couple_honeymoon_1785488512769.jpg';
import gorgeHelicopterImg from '../../assets/images/intent_gorge_helicopter_zim_1785489759987.jpg';
import familyResortImg from '../../assets/images/intent_family_resort_zim_1785489699263.jpg';
import footerDuskImg from '../../assets/images/footer_zambezi_dusk_1785494130616.jpg';
import advisorGuideImg from '../../assets/images/planning_step2_advisor_1785494096633.jpg';
import rhinoTrackingImg from '../../assets/images/rhino_tracking_drive_1785497819922.jpg';
import bomaDinnerImg from '../../assets/images/intent_boma_celebration_zim_1785489746202.jpg';
import craftMarketImg from '../../assets/images/intent_craft_market_zim_1785489731195.jpg';
import romanticDinnerImg from '../../assets/images/intent_romantic_dinner_zim_1785489715667.jpg';
import familySafariImg from '../../assets/images/family_wildlife_safari_1785488525464.jpg';
import stepWelcomeImg from '../../assets/images/planning_step3_welcome_1785494109119.jpg';
import bestValueImg from '../../assets/images/intent_best_value_zim_1785489229297.jpg';

interface VicFallsGuidePageProps {
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
}

export const VicFallsGuidePage: React.FC<VicFallsGuidePageProps> = ({
  onOpenPlanHoliday,
  onNavigateHome,
}) => {
  // Pager Page Index (0 to 9)
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<number>(3); // Default April
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const guidePages = [
    { id: 'welcome', label: 'Welcome to Victoria Falls', title: 'Why Visit Victoria Falls?' },
    { id: 'best-time', label: 'Best Time to Visit', title: 'Best Time to Visit & Seasons' },
    { id: 'monthly', label: 'Month-by-Month Guide', title: 'Victoria Falls Month-by-Month' },
    { id: 'weather', label: 'Weather & What to Pack', title: 'Weather & Packing Checklist' },
    { id: 'stay', label: 'Where Should You Stay?', title: 'Accommodation Guide & Lodges' },
    { id: 'experiences', label: 'Recommended Experiences', title: 'Must-Do Activities & Tours' },
    { id: 'itineraries', label: 'Curated Itineraries', title: 'Sample Holiday Itineraries' },
    { id: 'budget', label: 'Victoria Falls Budget Guide', title: 'Trip Costs & Budget Guide' },
    { id: 'travel-visas', label: 'Getting Here & Visas', title: 'Travel Routes & Visa Info' },
    { id: 'faqs', label: 'Frequently Asked Questions', title: 'Frequently Asked Questions' },
  ];

  const handlePageSelect = (index: number) => {
    setCurrentPage(index);
    const mainAnchor = document.getElementById('guide-pager-top');
    if (mainAnchor) {
      mainAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < guidePages.length - 1) {
      handlePageSelect(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      handlePageSelect(currentPage - 1);
    }
  };

  const monthsData = [
    {
      month: 'January',
      tagline: 'Warm, Green and Refreshingly Quiet',
      desc: 'Marks the heart of the rainy season. Afternoon thunderstorms are short-lived, leaving clear skies and fresh green landscapes. The waterfall begins building towards its peak flow.',
      weather: 'Warm to hot days (28-34°C), regular afternoon storms, humid.',
      bestFor: 'Couples, photographers, quiet relaxed holidays, returning visitors.',
      tip: 'Pack lightweight clothing with a light waterproof poncho. Morning activities are best before afternoon showers.',
      image: stepWelcomeImg
    },
    {
      month: 'February',
      tagline: 'The Falls Begin to Come Alive',
      desc: 'The Zambezi River carries significantly more water, making the Falls increasingly dramatic. Towering mist rises above the gorge with vivid rainbows throughout the day.',
      weather: 'Warm and humid, regular afternoon rain, lush greenery.',
      bestFor: 'Nature lovers, scenic helicopter flights, photography, honeymooners.',
      tip: 'Wonderful time for dramatic landscapes before peak season crowds arrive.',
      image: vicFallsIconicImg
    },
    {
      month: 'March',
      tagline: 'Nature at Full Power',
      desc: 'Victoria Falls lives up to its reputation. The thunderous roar echoes for miles and the rainforest pathways are drenched in cool mist and rainbows.',
      weather: 'Warm, high humidity, peak lush greenery, very high water flow.',
      bestFor: 'First-time visitors wanting extreme power, nature photographers.',
      tip: 'Expect to get wet! Waterproof protection for cameras and phones is mandatory.',
      image: vicFallsIconicImg
    },
    {
      month: 'April',
      tagline: 'One of Our Favourite Months (Peak Flow & Comfortable Weather)',
      desc: 'If we had to recommend one month purely for the spectacle, April is unbeatable. Maximum waterfall volume combined with pleasant, comfortable walking temperatures.',
      weather: 'Pleasant daytime temperatures (24-28°C), peak waterfall flow, frequent rainbows.',
      bestFor: 'Almost everyone: Families, couples, first-time visitors.',
      tip: 'A poncho is far more useful than an umbrella in the rainforest mist.',
      image: vicFallsIconicImg
    },
    {
      month: 'May',
      tagline: 'The Perfect Balance (Local Favorite)',
      desc: 'Many locals consider May to be the best overall month. The Falls remain spectacular while spray decreases enough to dramatically improve viewpoint visibility.',
      weather: 'Sunny days, cool pleasant mornings, comfortable afternoons.',
      bestFor: 'First-time visitors, families, safari combinations, luxury stays.',
      tip: 'Offers one of the best all-round combinations of weather and sightseeing.',
      image: familyTourImg
    },
    {
      month: 'June',
      tagline: 'Comfortable Days & Excellent Safari Conditions',
      desc: 'Crisp winter mornings and warm, sunny afternoons. Wildlife viewing in surrounding national parks improves rapidly as animals gather around water sources.',
      weather: 'Dry, cool mornings (10-14°C), warm sunny afternoons (22-26°C).',
      bestFor: 'Families, safari holidays, walking tours, clear photography.',
      tip: 'Bring a light fleece for early morning game drives and sunset cruises.',
      image: familySafariImg
    },
    {
      month: 'July',
      tagline: 'Peak Travel Season',
      desc: 'One of the busiest months for good reason. Fantastic dry weather, excellent game viewing in nearby Chobe and Hwange, and all activities fully operating.',
      weather: 'Dry, sunny, cool mornings, pleasant warm afternoons.',
      bestFor: 'Everyone, families, adventure travellers, safari lovers.',
      tip: 'Book accommodation several months in advance during school holidays.',
      image: rhinoTrackingImg
    },
    {
      month: 'August',
      tagline: 'Adventure Season Begins',
      desc: 'Spray reduces to reveal the colossal basalt cliff faces. White-water rafting on the Zambezi resumes under optimal, world-class river conditions.',
      weather: 'Warm, dry, low humidity, crystal clear visibility throughout Batoka Gorge.',
      bestFor: 'Adventure seekers, white-water rafting, scenic photography, safaris.',
      tip: 'Offers the ultimate balance between sightseeing, rafting and safaris.',
      image: gorgeHelicopterImg
    },
    {
      month: 'September',
      tagline: 'Wildlife Viewing at Its Absolute Best',
      desc: 'As the dry season peaks, vast herds of elephants and game congregate around permanent rivers and waterholes in Chobe and Hwange.',
      weather: 'Warm to hot, dry, excellent wildlife tracking conditions.',
      bestFor: 'Safaris, white-water rafting, gorge adventures, repeat visitors.',
      tip: 'Early morning game drives yield the highest predator activity.',
      image: familySafariImg
    },
    {
      month: 'October',
      tagline: 'Hot Days & Incredible Safari Encounters',
      desc: 'The hottest month of the year. Wildlife viewing reaches its absolute peak as animals concentrate along the Zambezi River banks.',
      weather: 'Very hot (30-36°C), dry, clear blue skies.',
      bestFor: 'Dedicated safari enthusiasts, adventure travellers, wildlife photographers.',
      tip: 'Schedule outdoor activities early morning and relax by the pool at midday.',
      image: rhinoTrackingImg
    },
    {
      month: 'November',
      tagline: 'The First Rains Arrive',
      desc: 'First summer rains transform the dry landscape almost overnight into vibrant green. Lower visitor numbers make it attractive for quiet getaways.',
      weather: 'Hot, humid, short dramatic afternoon thunderstorms.',
      bestFor: 'Birdwatchers, couples seeking quiet luxury, budget-conscious visitors.',
      tip: 'Enjoy lush landscapes and excellent value on accommodation.',
      image: footerDuskImg
    },
    {
      month: 'December',
      tagline: 'Festive Season Atmosphere',
      desc: 'Lively holiday atmosphere as international visitors arrive. The Zambezi River rises steadily and the countryside flourishes.',
      weather: 'Hot, green landscapes, welcome afternoon rainfall relief.',
      bestFor: 'Families, festive Christmas holidays, multi-country itineraries.',
      tip: 'Pre-book popular activities like the Boma Dinner & Sunset Cruises early.',
      image: bomaDinnerImg
    }
  ];

  const faqs = [
    {
      q: 'Is Victoria Falls safe for first-time visitors?',
      a: 'Yes, absolutely. Victoria Falls is widely recognized as one of Southern Africa’s safest tourist destinations. The town center is compact, friendly, and dedicated to welcoming international guests. Normal travel precautions apply as in any city.'
    },
    {
      q: 'Which side of Victoria Falls is better—Zimbabwe or Zambia?',
      a: 'For most first-time visitors, we strongly recommend staying on the Zimbabwean side in Victoria Falls town. Zimbabwe features 75% of the waterfall’s total width and 16 panoramic viewpoints that flow year-round. However, visiting both sides is easy via the Victoria Falls Bridge.'
    },
    {
      q: 'How many nights should I book for a complete trip?',
      a: 'We recommend 3 to 4 nights. This gives you enough time to explore the Rainforest, enjoy a Zambezi sunset river cruise, take a day safari to Chobe or Hwange, and experience a helicopter flight or cultural dinner without feeling rushed.'
    },
    {
      q: 'Do I need cash or can I use my bank card?',
      a: 'The US Dollar (USD) is the main accepted currency. Major hotels, restaurants, and activity providers accept Visa and Mastercard. However, carrying small cash notes ($5, $10, $20) is recommended for tips, local markets, and taxis.'
    },
    {
      q: 'Can children visit Victoria Falls?',
      a: 'Yes! Victoria Falls is a fantastic family destination. Many activities—including guided rainforest walks, sunset cruises, lion & rhino conservation tours, and cultural dinners—are suitable for all ages.'
    },
    {
      q: 'Will I see wildlife in town?',
      a: 'Yes, it is common to spot warthogs grazing in gardens, baboons along the roadside, and occasionally elephants or bushbucks near hotel lawns adjacent to Victoria Falls National Park.'
    }
  ];

  return (
    <div className="bg-[#FDFBF7] text-[#1A2E35] min-h-screen">
      
      {/* 1. Hero Header matching reference screenshot styling */}
      <div className="relative bg-[#092B38] text-white overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="absolute inset-0 z-0">
          <img 
            src={vicFallsIconicImg} 
            alt="Victoria Falls First Time Guide" 
            className="w-full h-full object-cover object-center opacity-30 blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#092B38] via-[#092B38]/80 to-transparent" />
        </div>

        <div className="max-w-[1280px] mx-auto relative z-10">
          {/* Top Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70 mb-5">
            <button onClick={onNavigateHome} className="hover:text-[#D97706] transition-colors cursor-pointer">Home</button>
            <span>/</span>
            <span className="text-[#D97706]">Victoria Falls Travel Guide</span>
          </div>

          <div className="max-w-3xl space-y-4">
            {/* Tag Badge */}
            <span className="inline-block bg-[#D97706]/20 border border-[#D97706]/40 text-[#F59E0B] text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-xs">
              THE OUTBOUND VICTORIA FALLS TRAVEL GUIDE
            </span>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight text-white leading-[1.1]">
              The Ultimate First-Time Visitor Guide to Victoria Falls
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-white/90 leading-relaxed font-normal pt-1">
              Everything you need to know before planning your trip—from when to visit and how long to stay to budgeting, activities and local advice.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onOpenPlanHoliday}
                className="bg-[#D97706] hover:bg-[#b86303] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Start Planning My Holiday →</span>
              </button>

              <button
                onClick={() => handlePageSelect(5)} // Go to experiences page
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors cursor-pointer"
              >
                Browse Experiences
              </button>
            </div>

            {/* Metadata bar */}
            <div className="pt-8 flex flex-wrap items-center gap-6 text-xs text-white/80 border-t border-white/15">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0D5C75] flex items-center justify-center text-white text-[10px] font-bold">
                  OH
                </div>
                <span>Written by <strong>Outbound Holidays</strong> • Local Victoria Falls Specialists</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Estimated reading time: <strong>12-15 minutes</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Last updated: <strong>May 2024</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Highlights Summary 4-Column Banner (Exact same styles as screenshot) */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xl">
          {/* Card 1 */}
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#0D5C75]/10 text-[#0D5C75] flex items-center justify-center shrink-0">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Best Stay</span>
              <span className="text-base font-extrabold text-[#1A2E35] font-serif block">3–4 Nights</span>
              <span className="text-xs text-gray-600 block mt-0.5">Ideal for first-time visitors</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Best Time to Visit</span>
              <span className="text-base font-extrabold text-[#1A2E35] font-serif block">May – August</span>
              <span className="text-xs text-gray-600 block mt-0.5">Best waterfall views & weather</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#0D5C75]/10 text-[#0D5C75] flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Top Experience</span>
              <span className="text-base font-extrabold text-[#1A2E35] font-serif block">Guided Tour of the Falls</span>
              <span className="text-xs text-gray-600 block mt-0.5">The perfect way to start your journey</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Ideal For</span>
              <span className="text-base font-extrabold text-[#1A2E35] font-serif block">Families, Couples & Adventure</span>
              <span className="text-xs text-gray-600 block mt-0.5">Something for every type of traveller</span>
            </div>
          </div>
        </div>
      </div>

      {/* Anchor point for Pager */}
      <div id="guide-pager-top" className="scroll-mt-6" />

      {/* 3. Main Pager Container Layout (2 Columns: Pager Navigation Sidebar + Interactive Animated Pager Stage) */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        
        {/* Top Pager Navigation Bar with Prev/Next buttons & Page Indicator */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-[#0D5C75] text-white text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider">
              PAGE {currentPage + 1} OF {guidePages.length}
            </span>
            <span className="text-sm font-bold font-serif text-[#1A2E35]">
              {guidePages[currentPage].title}
            </span>
          </div>

          {/* Pager Prev / Next Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              disabled={currentPage === 0}
              onClick={handlePrevPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-gray-800 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Quick Page dots */}
            <div className="hidden md:flex items-center gap-1 px-2">
              {guidePages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePageSelect(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    currentPage === idx ? 'bg-[#0D5C75] w-6' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  title={`Go to page ${idx + 1}`}
                />
              ))}
            </div>

            <button
              disabled={currentPage === guidePages.length - 1}
              onClick={handleNextPage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D5C75] hover:bg-[#0a485e] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Pager Navigation Menu & Quick Plan Card (matching screenshot) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            
            {/* IN THIS GUIDE List menu matching exact design */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-xs font-bold text-[#0D5C75] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#D97706]" />
                  IN THIS GUIDE
                </h3>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Interactive Pager
                </span>
              </div>

              <nav className="space-y-1.5">
                {guidePages.map((pg, idx) => (
                  <button
                    key={pg.id}
                    onClick={() => handlePageSelect(idx)}
                    className={`w-full text-left py-2.5 px-3 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                      currentPage === idx
                        ? 'bg-[#0D5C75] text-white font-bold shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center shrink-0 font-bold ${
                        currentPage === idx ? 'bg-white text-[#0D5C75]' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="truncate">{pg.label}</span>
                    </div>
                    {currentPage === idx && (
                      <ChevronRight className="w-4 h-4 shrink-0 text-amber-300" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Specialist Quick Plan Sidebar Card (matching screenshot) */}
            <div className="bg-gradient-to-br from-[#0D5C75]/5 to-[#0D5C75]/15 p-6 rounded-2xl border border-[#0D5C75]/20 text-[#1A2E35] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0D5C75] text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h4 className="font-bold font-serif text-base text-[#0D5C75]">
                Prefer a quick plan?
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                Our travel specialists can create a custom, personalised itinerary based on your exact travel dates, travel style, and budget.
              </p>
              <button
                onClick={onOpenPlanHoliday}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#b86303] pt-1 cursor-pointer"
              >
                <span>Talk to a Specialist →</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Animated Page View */}
          <div className="lg:col-span-8 min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                
                {/* PAGE 1: Welcome & Overview */}
                {currentPage === 0 && (
                  <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block">
                        WELCOME TO VICTORIA FALLS
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A2E35] leading-tight">
                        More than a waterfall. A complete holiday destination.
                      </h2>
                    </div>

                    {/* Text + Photo Side-by-Side Grid matching screenshot */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-7 space-y-4 text-sm text-gray-700 leading-relaxed">
                        <p>
                          Victoria Falls is one of Africa’s most spectacular natural wonders, but it’s so much more than that. It’s where adventure meets relaxation, where wildlife thrives, and where every sunset feels unforgettable.
                        </p>
                        <p>
                          This guide brings together everything we’ve learned from years of helping thousands of travellers plan their perfect Victoria Falls holiday.
                        </p>
                        <p>
                          At Outbound Holidays, we’re based in Victoria Falls, Zimbabwe. We know which experiences are worth your time, where to stay based on your travel style, and the little local details that make all the difference.
                        </p>
                      </div>
                      <div className="md:col-span-5">
                        <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200">
                          <img 
                            src={vicFallsIconicImg} 
                            alt="Victoria Falls Bridge & Waterfall View" 
                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quote Block matching exact screenshot */}
                    <div className="bg-[#FDFBF7] border-l-4 border-[#D97706] p-5 sm:p-6 rounded-r-2xl my-4">
                      <p className="text-sm sm:text-base italic text-[#1A2E35] font-serif font-medium leading-relaxed">
                        “From the roar of the Falls to the stillness of the Zambezi at sunset, Victoria Falls stays with you long after you leave.”
                      </p>
                      <span className="block text-xs font-bold text-[#0D5C75] mt-2">
                        — The Outbound Holidays Team
                      </span>
                    </div>

                    {/* Local Tip Box matching screenshot */}
                    <div className="bg-[#FEF3C7]/60 border border-[#FDE68A] p-4 sm:p-5 rounded-2xl flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-[#78350F] leading-relaxed">
                        <strong className="font-bold text-[#92400E] block uppercase tracking-wider text-[11px] mb-0.5">LOCAL TIP</strong>
                        Visit the rainforest in the early morning. The light is beautiful, the crowds are smaller, and you'll experience the Falls before the afternoon heat.
                      </div>
                    </div>

                    {/* Who Is Victoria Falls Perfect For? (4 Cards with Images matching screenshot) */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-extrabold font-serif text-[#1A2E35]">
                          Who is Victoria Falls perfect for?
                        </h3>
                        <p className="text-xs text-gray-600">
                          Whether you’re travelling with family, your partner or chasing adventure, Victoria Falls has something for you.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Families */}
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col justify-between group hover:border-[#0D5C75] transition-all">
                          <div className="h-40 overflow-hidden relative">
                            <img src={familyTourImg} alt="Families" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#0D5C75] flex items-center justify-center text-white text-xs">
                                <Users className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm font-serif">Families</span>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-xs text-gray-600 leading-relaxed">
                              Kid-friendly activities, wildlife encounters and memories that last a lifetime.
                            </p>
                          </div>
                        </div>

                        {/* Couples */}
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col justify-between group hover:border-[#0D5C75] transition-all">
                          <div className="h-40 overflow-hidden relative">
                            <img src={coupleHoneymoonImg} alt="Couples" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#D97706] flex items-center justify-center text-white text-xs">
                                <Heart className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm font-serif">Couples</span>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-xs text-gray-600 leading-relaxed">
                              Romantic sunsets, luxury lodges and unforgettable shared moments.
                            </p>
                          </div>
                        </div>

                        {/* Adventure Travellers */}
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col justify-between group hover:border-[#0D5C75] transition-all">
                          <div className="h-40 overflow-hidden relative">
                            <img src={gorgeHelicopterImg} alt="Adventure Travellers" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#0D5C75] flex items-center justify-center text-white text-xs">
                                <Zap className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm font-serif">Adventure Travellers</span>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-xs text-gray-600 leading-relaxed">
                              Rafting, bungee, ziplines, gorge activities and thrilling experiences.
                            </p>
                          </div>
                        </div>

                        {/* Luxury Travellers */}
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col justify-between group hover:border-[#0D5C75] transition-all">
                          <div className="h-40 overflow-hidden relative">
                            <img src={familyResortImg} alt="Luxury Travellers" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#D97706] flex items-center justify-center text-white text-xs">
                                <Crown className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm font-serif">Luxury Travellers</span>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-xs text-gray-600 leading-relaxed">
                              Premium accommodation, private experiences and world-class service.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Dark Green Continuation Cards matching screenshot */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="text-center max-w-xl mx-auto space-y-1">
                        <h4 className="text-xl font-bold font-serif text-[#1A2E35]">
                          Continue planning your trip
                        </h4>
                        <p className="text-xs text-gray-600">
                          Explore our in-depth sections to help you plan every detail.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div 
                          onClick={() => handlePageSelect(1)}
                          className="bg-[#1C3B2B] text-white p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:bg-[#152e21] transition-colors relative overflow-hidden group min-h-[190px] border border-emerald-900"
                        >
                          <div className="space-y-2 relative z-10">
                            <Calendar className="w-5 h-5 text-[#F59E0B]" />
                            <h5 className="font-bold font-serif text-base text-white">
                              Best Time to Visit Victoria Falls
                            </h5>
                            <p className="text-xs text-white/80 leading-relaxed">
                              Understand seasons, water levels & monthly highlights.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-[#F59E0B] flex items-center gap-1 pt-3 relative z-10 group-hover:translate-x-1 transition-transform">
                            Open Section →
                          </span>
                        </div>

                        <div 
                          onClick={() => handlePageSelect(4)}
                          className="bg-[#2A4B40] text-white p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:bg-[#203a31] transition-colors relative overflow-hidden group min-h-[190px] border border-emerald-900"
                        >
                          <div className="space-y-2 relative z-10">
                            <Clock className="w-5 h-5 text-[#F59E0B]" />
                            <h5 className="font-bold font-serif text-base text-white">
                              How Many Days Should You Stay?
                            </h5>
                            <p className="text-xs text-white/80 leading-relaxed">
                              Compare 2, 3, 4 & 5+ night itineraries for every traveller.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-[#F59E0B] flex items-center gap-1 pt-3 relative z-10 group-hover:translate-x-1 transition-transform">
                            Open Section →
                          </span>
                        </div>

                        <div 
                          onClick={() => handlePageSelect(7)}
                          className="bg-[#1E3A32] text-white p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:bg-[#162b25] transition-colors relative overflow-hidden group min-h-[190px] border border-emerald-900"
                        >
                          <div className="space-y-2 relative z-10">
                            <DollarSign className="w-5 h-5 text-[#F59E0B]" />
                            <h5 className="font-bold font-serif text-base text-white">
                              Victoria Falls Budget Guide
                            </h5>
                            <p className="text-xs text-white/80 leading-relaxed">
                              See realistic costs for activities, hotels & food.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-[#F59E0B] flex items-center gap-1 pt-3 relative z-10 group-hover:translate-x-1 transition-transform">
                            Open Section →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 2: Best Time to Visit */}
                {currentPage === 1 && (
                  <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#0D5C75] uppercase tracking-widest block">
                        SEASONAL TRAVEL GUIDE
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A2E35]">
                        When Is the Best Time to Visit Victoria Falls?
                      </h2>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        The answer depends on what kind of holiday you want. Unlike many destinations, Victoria Falls changes dramatically throughout the year as the Zambezi River volume rises and falls.
                      </p>
                    </div>

                    {/* 3 Season Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* High Water */}
                      <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-xs font-extrabold text-[#0D5C75] bg-blue-100 px-3 py-1 rounded-full inline-block">
                            Feb – May: High Water
                          </span>
                          <h4 className="font-bold font-serif text-lg text-[#1A2E35]">Nature at Full Power</h4>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            The Zambezi River is at its fullest. Roaring water and towering clouds of mist created the name <em>Mosi-oa-Tunya</em> (The Smoke That Thunders).
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1 pt-2">
                            <li>• Peak waterfall thunder & mist</li>
                            <li>• Rainforest pathways dripping in rainbows</li>
                            <li>• Spectacular helicopter aerial flights</li>
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-blue-200/60 text-[11px] font-bold text-[#0D5C75]">
                          Best for: First-time spectacle seekers & photographers
                        </div>
                      </div>

                      {/* Dry Season */}
                      <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-xs font-extrabold text-[#D97706] bg-amber-100 px-3 py-1 rounded-full inline-block">
                            Jun – Aug: Dry Season
                          </span>
                          <h4 className="font-bold font-serif text-lg text-[#1A2E35]">The Sweet Spot (Local Favorite)</h4>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            Pleasantly warm sunny days and cool mornings. Spray reduces to reveal clear, unobstructed views of the waterfall cliff face.
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1 pt-2">
                            <li>• Comfortable sightseeing weather</li>
                            <li>• Clear waterfall views without heavy rain</li>
                            <li>• Excellent game drives & Chobe day trips</li>
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-amber-200/60 text-[11px] font-bold text-[#D97706]">
                          Best for: All-round holiday balance & safaris
                        </div>
                      </div>

                      {/* Low Water */}
                      <div className="p-6 rounded-2xl bg-green-50/70 border border-green-200 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-xs font-extrabold text-[#2F6B3C] bg-green-100 px-3 py-1 rounded-full inline-block">
                            Sep – Jan: Low Water
                          </span>
                          <h4 className="font-bold font-serif text-lg text-[#1A2E35]">Adventure & Wildlife Peak</h4>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            Reduced spray allows you to appreciate the immense basalt geological formations. Animals gather around remaining water sources.
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1 pt-2">
                            <li>• World-class Grade 5 white-water rafting</li>
                            <li>• Devil’s Pool swim availability</li>
                            <li>• Maximum elephant & game concentration</li>
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-green-200/60 text-[11px] font-bold text-[#2F6B3C]">
                          Best for: Rafting, adventure & intense safari
                        </div>
                      </div>
                    </div>

                    {/* Local Recommendation Callout */}
                    <div className="bg-[#FEF3C7] border border-[#FDE68A] p-5 rounded-2xl flex items-start gap-4">
                      <Lightbulb className="w-6 h-6 text-[#D97706] shrink-0" />
                      <div className="space-y-1 text-xs sm:text-sm text-[#78350F]">
                        <strong className="font-bold text-[#92400E] block text-sm">OUTBOUND RECOMMENDATION</strong>
                        If you’re visiting Victoria Falls for the first time and your travel dates are flexible, <strong>May through August</strong> provides the single best combination of spectacular waterfall views, pleasant temperatures, and outstanding safari opportunities.
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 3: Month-by-Month Guide */}
                {currentPage === 2 && (
                  <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#0D5C75] uppercase tracking-widest block">
                        MONTHLY BREAKDOWN
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A2E35]">
                        Victoria Falls Month-by-Month Local Guide
                      </h2>
                      <p className="text-sm text-gray-700">
                        Select a month below to see weather, water levels, wildlife opportunities, and local advice for your exact travel time.
                      </p>
                    </div>

                    {/* Month Selector Pills */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {monthsData.map((m, idx) => (
                        <button
                          key={m.month}
                          onClick={() => setSelectedMonth(idx)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                            selectedMonth === idx
                              ? 'bg-[#0D5C75] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {m.month}
                        </button>
                      ))}
                    </div>

                    {/* Active Month Detail Card with Image */}
                    <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-2xl border border-[#0D5C75]/20 space-y-6">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                        <div>
                          <h4 className="text-3xl font-extrabold font-serif text-[#0D5C75]">
                            {monthsData[selectedMonth].month}
                          </h4>
                          <span className="bg-[#D97706]/10 text-[#D97706] text-xs font-bold px-3 py-1 rounded-full inline-block mt-1">
                            {monthsData[selectedMonth].tagline}
                          </span>
                        </div>

                        <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shadow-sm shrink-0 border border-gray-200">
                          <img 
                            src={monthsData[selectedMonth].image} 
                            alt={monthsData[selectedMonth].month} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">
                        {monthsData[selectedMonth].desc}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-1">
                          <span className="text-[11px] font-bold text-gray-500 uppercase block">Weather & Conditions</span>
                          <p className="text-xs font-medium text-gray-800">{monthsData[selectedMonth].weather}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-1">
                          <span className="text-[11px] font-bold text-gray-500 uppercase block">Best For</span>
                          <p className="text-xs font-medium text-gray-800">{monthsData[selectedMonth].bestFor}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                          <span className="text-[11px] font-bold text-[#D97706] uppercase block">Outbound Recommends</span>
                          <p className="text-xs text-gray-800">{monthsData[selectedMonth].tip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 4: Weather & What to Pack */}
                {currentPage === 3 && (
                  <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#0D5C75] uppercase tracking-widest block">
                        CLIMATE & PACKING
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A2E35]">
                        Victoria Falls Weather & Packing Guide
                      </h2>
                      <p className="text-sm text-gray-700">
                        Victoria Falls enjoys a warm subtropical climate year-round. Understanding temperatures and rainfall helps you pack comfortably.
                      </p>
                    </div>

                    {/* Temperatures Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-gray-700 border-collapse">
                        <thead className="bg-[#0D5C75] text-white uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Season & Months</th>
                            <th className="p-3">Daytime Temp</th>
                            <th className="p-3">Nighttime Temp</th>
                            <th className="p-3">Rainfall</th>
                            <th className="p-3">What to Expect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="p-3 font-bold">Summer (Nov–Feb)</td>
                            <td className="p-3">28–34°C</td>
                            <td className="p-3">18–22°C</td>
                            <td className="p-3 font-bold text-blue-600">High</td>
                            <td className="p-3">Lush green, warm days, short afternoon thunderstorms.</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-3 font-bold">Autumn (Mar–May)</td>
                            <td className="p-3">24–30°C</td>
                            <td className="p-3">14–18°C</td>
                            <td className="p-3 font-bold text-blue-500">Moderate</td>
                            <td className="p-3">Peak waterfall flow, pleasant temperatures, clear rainforest walks.</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-3 font-bold">Winter (Jun–Aug)</td>
                            <td className="p-3">22–27°C</td>
                            <td className="p-3">6–12°C</td>
                            <td className="p-3 font-bold text-gray-400">Very Low</td>
                            <td className="p-3">Crisp cool mornings, warm sunny afternoons, ideal safari weather.</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-3 font-bold">Spring (Sep–Oct)</td>
                            <td className="p-3">30–36°C</td>
                            <td className="p-3">15–20°C</td>
                            <td className="p-3 font-bold text-gray-400">Very Low</td>
                            <td className="p-3">Hot dry days, maximum wildlife concentration at waterholes.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Packing Checklist Grid with Images */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h3 className="font-serif font-bold text-xl text-[#1A2E35]">What Should You Pack?</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                          <span className="font-bold text-xs text-[#0D5C75] block">Year-Round Essentials</span>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>✓ Comfortable walking shoes</li>
                            <li>✓ Sun hat & sunglasses</li>
                            <li>✓ High SPF sunscreen</li>
                            <li>✓ Insect repellent</li>
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                          <span className="font-bold text-xs text-[#0D5C75] block">Rainy / High Water</span>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>✓ Lightweight waterproof poncho</li>
                            <li>✓ Dry bag for phone/camera</li>
                            <li>✓ Quick-drying light clothes</li>
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                          <span className="font-bold text-xs text-[#0D5C75] block">Winter Months (Jun–Aug)</span>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>✓ Light fleece or jacket</li>
                            <li>✓ Long trousers for game drives</li>
                            <li>✓ Layerable safari outfits</li>
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                          <span className="font-bold text-xs text-[#0D5C75] block">Spring Months (Sep–Oct)</span>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>✓ Breathable linen clothing</li>
                            <li>✓ Wide-brimmed sun hat</li>
                            <li>✓ Reusable water bottle</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 5: Where Should You Stay */}
                {currentPage === 4 && (
                  <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#0D5C75] uppercase tracking-widest block">
                        ACCOMMODATION & LODGES
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A2E35]">
                        Where Should You Stay in Victoria Falls?
                      </h2>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Choosing where to stay shapes your entire experience. The right accommodation matches your travel style, pace, and budget.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col justify-between bg-gray-50">
                        <img src={familyResortImg} alt="Resort" className="w-full h-48 object-cover" />
                        <div className="p-5 space-y-2">
                          <span className="font-bold font-serif text-lg text-[#0D5C75]">Boutique Lodges & Hotels</span>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Personalized service, tranquil tropical gardens, and convenient locations close to Victoria Falls town.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col justify-between bg-gray-50">
                        <img src={footerDuskImg} alt="Riverside Lodges" className="w-full h-48 object-cover" />
                        <div className="p-5 space-y-2">
                          <span className="font-bold font-serif text-lg text-[#0D5C75]">Luxury Riverside Lodges</span>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Situated along the Zambezi River. Enjoy sunset views, private decks, spa facilities, and fine dining.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0D5C75] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="font-serif font-bold text-lg">Need help choosing the right lodge?</h4>
                        <p className="text-xs text-white/80">We'll match your budget with hand-picked hotels in Victoria Falls.</p>
                      </div>
                      <button
                        onClick={onOpenPlanHoliday}
                        className="bg-[#D97706] hover:bg-[#b86303] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer"
                      >
                        Get Hotel Recommendations →
                      </button>
                    </div>
                  </div>
                )}

                {/* PAGE 6: Recommended Experiences */}
                {currentPage === 5 && (
                  <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#0D5C75] uppercase tracking-widest block">
                        CURATED ACTIVITIES
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A2E35]">
                        Our Recommended Experiences in Victoria Falls
                      </h2>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Choosing fewer experiences—but choosing the right ones—leads to a far better holiday. Here are our top hand-picked activities.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between gap-4">
                        <div className="flex gap-4 items-start">
                          <img src={vicFallsIconicImg} alt="Guided Tour" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                          <div className="space-y-1 text-xs">
                            <span className="bg-[#0D5C75]/10 text-[#0D5C75] font-bold px-2 py-0.5 rounded text-[10px]">From US$55 pp</span>
                            <h4 className="font-bold text-sm text-[#1A2E35]">Guided Rainforest Tour of the Falls</h4>
                            <p className="text-gray-600">Walk along 16 panoramic viewpoints with an expert local guide explaining geology, history & flora.</p>
                          </div>
                        </div>
                        <div className="bg-[#FEF3C7] text-[#78350F] p-2.5 rounded-lg text-[11px] font-semibold">
                          ⭐ Recommended first experience for every traveller.
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between gap-4">
                        <div className="flex gap-4 items-start">
                          <img src={footerDuskImg} alt="Sunset Cruise" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                          <div className="space-y-1 text-xs">
                            <span className="bg-[#0D5C75]/10 text-[#0D5C75] font-bold px-2 py-0.5 rounded text-[10px]">From US$85 pp</span>
                            <h4 className="font-bold text-sm text-[#1A2E35]">Upper Zambezi Sunset River Cruise</h4>
                            <p className="text-gray-600">Complimentary sundowner drinks, hippos, elephants, and breathtaking African sunsets on the river.</p>
                          </div>
                        </div>
                        <div className="bg-[#FEF3C7] text-[#78350F] p-2.5 rounded-lg text-[11px] font-semibold">
                          ❤️ Unmissable evening experience on the Zambezi.
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between gap-4">
                        <div className="flex gap-4 items-start">
                          <img src={gorgeHelicopterImg} alt="Helicopter Flight" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                          <div className="space-y-1 text-xs">
                            <span className="bg-[#0D5C75]/10 text-[#0D5C75] font-bold px-2 py-0.5 rounded text-[10px]">From US$150 pp</span>
                            <h4 className="font-bold text-sm text-[#1A2E35]">13-min "Flight of Angels" Helicopter</h4>
                            <p className="text-gray-600">Panoramic aerial views of the full 1,700m water curtain and dramatic Batoka Gorge.</p>
                          </div>
                        </div>
                        <div className="bg-[#FEF3C7] text-[#78350F] p-2.5 rounded-lg text-[11px] font-semibold">
                          🚁 The ultimate aerial view of the waterfall.
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between gap-4">
                        <div className="flex gap-4 items-start">
                          <img src={rhinoTrackingImg} alt="Rhino Tracking" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                          <div className="space-y-1 text-xs">
                            <span className="bg-[#0D5C75]/10 text-[#0D5C75] font-bold px-2 py-0.5 rounded text-[10px]">From US$120 pp</span>
                            <h4 className="font-bold text-sm text-[#1A2E35]">Rhino Tracking Drive in Victoria Falls</h4>
                            <p className="text-gray-600">Walk on foot with endangered white rhinos accompanied by armed national park rangers.</p>
                          </div>
                        </div>
                        <div className="bg-[#FEF3C7] text-[#78350F] p-2.5 rounded-lg text-[11px] font-semibold">
                          🦏 Thrilling rhino conservation encounter.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 7: Curated Itineraries */}
                {currentPage === 6 && (
                  <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#0D5C75] uppercase tracking-widest block">
                        SAMPLE ITINERARIES
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A2E35]">
                        Carefully Crafted Itineraries for Every Traveller
                      </h2>
                      <p className="text-sm text-gray-700">
                        Every holiday is personalized. Here are our most requested itinerary blueprints.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Classic 3 Nights */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0D5C75]/5 to-[#0D5C75]/15 border-2 border-[#0D5C75] space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="bg-[#0D5C75] text-white font-bold text-[10px] px-3 py-1 rounded-full">
                            ★ MOST RECOMMENDED
                          </span>
                          <span className="text-xs font-bold text-[#0D5C75]">3 Nights / 4 Days</span>
                        </div>
                        <h4 className="font-serif font-extrabold text-xl text-[#1A2E35]">
                          The Classic Victoria Falls Experience
                        </h4>
                        <p className="text-xs text-gray-700">
                          <strong>Investment:</strong> From US$1,200–$1,600 per couple.<br />
                          Includes boutique lodge stay, private airport transfers, Guided Falls Tour, Zambezi Sunset Cruise & The Boma Dinner.
                        </p>
                        <button
                          onClick={onOpenPlanHoliday}
                          className="w-full bg-[#0D5C75] hover:bg-[#0a485e] text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                        >
                          Select This 3-Night Plan →
                        </button>
                      </div>

                      {/* Complete 4 Nights */}
                      <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="bg-amber-100 text-[#D97706] font-bold text-[10px] px-3 py-1 rounded-full">
                            POPULAR CHOICE
                          </span>
                          <span className="text-xs font-bold text-gray-600">4 Nights / 5 Days</span>
                        </div>
                        <h4 className="font-serif font-extrabold text-xl text-[#1A2E35]">
                          The Complete Victoria Falls Holiday
                        </h4>
                        <p className="text-xs text-gray-700">
                          <strong>Investment:</strong> From US$1,800–$2,500 per couple.<br />
                          Includes Guided Falls Tour, Zambezi Sunset Cruise, Chobe National Park Safari day trip, and Helicopter flight.
                        </p>
                        <button
                          onClick={onOpenPlanHoliday}
                          className="w-full bg-[#D97706] hover:bg-[#b86303] text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                        >
                          Select This 4-Night Plan →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 8: Victoria Falls Budget Guide */}
                {currentPage === 7 && (
                  <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#0D5C75] uppercase tracking-widest block">
                        COSTS & ESTIMATES
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A2E35]">
                        Victoria Falls Budget Guide
                      </h2>
                      <p className="text-sm text-gray-700">
                        Understanding realistic costs upfront helps you budget with total confidence.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                        <span className="text-xs font-bold text-gray-500 uppercase block">Budget Traveller</span>
                        <span className="text-2xl font-extrabold font-serif text-[#0D5C75] block">$120–$180</span>
                        <span className="text-[11px] text-gray-500 block">per person per day</span>
                        <p className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                          Guesthouses, budget hotels, self-catering & essential guided tours.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                        <span className="text-xs font-bold text-[#D97706] uppercase block">Comfort Traveller</span>
                        <span className="text-2xl font-extrabold font-serif text-[#D97706] block">$220–$350</span>
                        <span className="text-[11px] text-gray-500 block">per person per day</span>
                        <p className="text-xs text-gray-700 pt-2 border-t border-amber-200">
                          Boutique lodges, comfortable hotels, several activities & restaurant dining.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                        <span className="text-xs font-bold text-gray-500 uppercase block">Luxury Traveller</span>
                        <span className="text-2xl font-extrabold font-serif text-[#0D5C75] block">$450+</span>
                        <span className="text-[11px] text-gray-500 block">per person per day</span>
                        <p className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                          Luxury safari lodges, premium cruises, private transfers & exclusive flights.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 9: Getting Here & Visas */}
                {currentPage === 8 && (
                  <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#0D5C75] uppercase tracking-widest block">
                        TRAVEL LOGISTICS
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A2E35]">
                        Getting to Victoria Falls & Visa Requirements
                      </h2>
                      <p className="text-sm text-gray-700">
                        Everything you need to know about flying into Victoria Falls International Airport (VFA) and passport entry rules.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                        <span className="font-bold font-serif text-lg text-[#0D5C75] flex items-center gap-2">
                          <Plane className="w-5 h-5 text-[#D97706]" /> Flying to Victoria Falls
                        </span>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Victoria Falls International Airport (VFA) is located just 20 minutes from town. Major direct regional flights connect from Johannesburg, Cape Town, Harare, Nairobi, and Addis Ababa.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                        <span className="font-bold font-serif text-lg text-[#0D5C75] flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#D97706]" /> Visa Categories & KAZA Univisa
                        </span>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Most travelers (US, UK, EU, Australia, Canada) obtain a <strong>Visa on Arrival</strong> (US$30 single / US$45 double entry). If visiting both Zimbabwe and Zambia, ask for the <strong>KAZA Univisa</strong> (US$50).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 10: FAQs */}
                {currentPage === 9 && (
                  <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#0D5C75] uppercase tracking-widest block">
                        QUESTIONS & ANSWERS
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A2E35]">
                        Frequently Asked Questions
                      </h2>
                      <p className="text-sm text-gray-700">
                        Quick answers to common first-time visitor questions.
                      </p>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="space-y-3">
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                          <button
                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                            className="w-full text-left p-4 font-bold text-sm text-[#1A2E35] flex justify-between items-center hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            {openFaqIndex === idx ? (
                              <ChevronUp className="w-4 h-4 text-[#0D5C75] shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                            )}
                          </button>
                          {openFaqIndex === idx && (
                            <div className="p-4 pt-0 text-xs text-gray-700 leading-relaxed bg-white border-t border-gray-100">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Final Bottom Call to Action Banner matching reference screenshot */}
                    <div className="bg-[#092B38] text-white p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-800 shadow-xl">
                      <div className="space-y-2 text-center sm:text-left">
                        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                          READY TO EXPERIENCE VICTORIA FALLS?
                        </span>
                        <h3 className="text-2xl font-bold font-serif text-white">
                          Let our local specialists craft your personalized itinerary.
                        </h3>
                        <p className="text-xs text-white/80">
                          Tell us your dates, budget and preferences and we will prepare a custom proposal.
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                          onClick={onOpenPlanHoliday}
                          className="bg-[#D97706] hover:bg-[#b86303] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all whitespace-nowrap cursor-pointer text-center"
                        >
                          Start My Holiday Plan →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Bottom Pager Controls (Next / Prev Page Buttons) */}
            <div className="mt-8 bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-4 shadow-sm">
              <button
                disabled={currentPage === 0}
                onClick={handlePrevPage}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-gray-800 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#0D5C75]" />
                <span>Previous Section</span>
              </button>

              <div className="text-xs text-gray-500 font-bold hidden sm:block">
                Section {currentPage + 1} of {guidePages.length}
              </div>

              <button
                disabled={currentPage === guidePages.length - 1}
                onClick={handleNextPage}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0D5C75] hover:bg-[#0a485e] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-white transition-all cursor-pointer shadow-md"
              >
                <span>Next Section: {guidePages[currentPage < guidePages.length - 1 ? currentPage + 1 : currentPage].label}</span>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
