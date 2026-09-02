import React, { useState, useEffect } from 'react';
import { WhatsAppEnquiryButton, WhatsAppSpecialistCTA, WhatsAppIcon } from '../common/WhatsAppButton';
import { getWhatsAppEnquiryUrl } from '../../utils/whatsapp';
import { motion } from 'motion/react';
import {
  Clock,
  Calendar,
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Utensils,
  Music,
  Bus,
  PhoneCall,
  CalendarCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ArrowLeft,
  Share2,
  Users,
  Heart,
  Check,
  Info,
  Coffee,
  Wine
} from 'lucide-react';
// Public image paths for experiences
const bomaDinnerImg = '/Experiences/Boma Dinner_/IMG_0364.JPG';
const bomaDinnerImg2 = '/Experiences/Boma Dinner_/IMG_0365.PNG';
const bomaDinnerImg3 = '/Experiences/Boma Dinner_/IMG_0366.PNG';
const bomaDinnerImg4 = '/Experiences/Boma Dinner_/Boma prepping on the fire.webp';
const bomaDinnerImg5 = '/Experiences/Boma Dinner_/IMG_0367.PNG';
const bomaDinnerImg6 = '/Experiences/Boma Dinner_/IMG_0368.PNG';
const bomaDinnerImg7 = '/Experiences/Boma Dinner_/IMG_0369.PNG';
const bomaDinnerImg8 = '/Experiences/Boma Dinner_/IMG_0370.PNG';
const cruiseImg = '/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
const guidedTourImg = '/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
const heli1Img = '/Experiences/Flight of Angels/Heli-1-1-scaled.jpg';
const chobeImg = '/Experiences/Chobe Day Trip_/Chobe-1-1-scaled.jpg';
import { GalleryLightbox } from './GalleryLightbox';

interface BomaExperiencePageProps {
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
  onSelectRelatedExperience?: (expTitle: string) => void;
}

export const BomaExperiencePage: React.FC<BomaExperiencePageProps> = ({
  onOpenPlanHoliday,
  onNavigateHome,
  onSelectRelatedExperience
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [includeTransfers, setIncludeTransfers] = useState(true);
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0, 1]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = "The Boma - Dinner & Drum Show | Victoria Falls Experience Guide | Outbound Holidays";
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const faqs = [
    {
      q: "What time does The Boma start and end?",
      a: "The Boma evening begins at 6:45 PM with a ceremonial traditional welcome, hand washing, and village beer tasting. The interactive drumming show reaches its crescendo around 8:45 PM, followed by table acapella serenades and desserts. The evening concludes between 9:45 PM and 10:00 PM."
    },
    {
      q: "Is hotel transfer included in the experience?",
      a: "Round-trip hotel transfers are optional and can be easily bundled with your reservation. Our air-conditioned vehicles pick you up directly from your Victoria Falls hotel or safari lodge around 6:15 PM and return you safely after the show."
    },
    {
      q: "What food is served at the African buffet?",
      a: "The evening begins with a waiter-served starter platter including smoked crocodile tail, salted groundnuts with 'Nyimo' round nuts, and corn fritters. The main buffet features an open-fire braai with grilled game meats, beef, pork, chicken, and daily spit roast, plus traditional 'Umzingeli' hunter's potjie stews, Zambezi bream, Kapenta whitebait, peanut butter rice, and authentic sadza (isitshwala)."
    },
    {
      q: "Are vegetarian and vegan options available?",
      a: "Yes! The Boma caters generously to vegetarian and plant-based diners with dedicated cooking stations preparing daily chef's pasta, vegetable stir-fries, bush vegetables, fresh soups, oven-baked garlic bread, and an extensive fresh salad bar including three-bean salad, sweet potato salad, potato salad, and beetroot salad."
    },
    {
      q: "Is The Boma family-friendly for children?",
      a: "Extremely family-friendly! Children of all ages love the vibrant energy, face painting, interactive drumming session where every guest gets their own Djembe drum, and the fun 'mopane worm' tasting challenge (with an official certificate for those brave enough to try!)."
    },
    {
      q: "What should I wear to The Boma?",
      a: "Dress code is smart casual and comfortable. The dining area is thatched and partially open-air under the African night sky, so a light sweater or jacket is recommended during winter months (May to August)."
    },
    {
      q: "How long does the evening last?",
      a: "The full experience lasts approximately 3 hours (6:45 PM to 10:00 PM), allowing ample time to savour all four courses, enjoy the live traditional dancers, participate in the interactive drumming, and relax with tea, coffee, or dessert."
    },
    {
      q: "Should I book The Boma in advance?",
      a: "Yes, advance reservations are strongly recommended. As Victoria Falls' flagship cultural dining experience, seats sell out quickly—especially during high safari season (July through October) and festive holiday periods."
    }
  ];

  const relatedExperiences = [
    {
      title: "Upper Zambezi Sunset River Cruise",
      desc: "Glide past hippo pods and elephant herds with complimentary sundowners as the sun sets.",
      price: "From US$85 pp",
      duration: "2 Hours",
      image: cruiseImg
    },
    {
      title: "Guided Tour of Victoria Falls",
      desc: "Explore all 16 spectacular viewpoints along the rainforest opposite Mosi-oa-Tunya.",
      price: "From US$55 pp",
      duration: "2.5 Hours",
      image: guidedTourImg
    },
    {
      title: "Flight of Angels Helicopter Flight",
      desc: "Soar above the 1,700m wide sheet of falling water for an aerial view of Batoka Gorge.",
      price: "From US$150 pp",
      duration: "15 Mins",
      image: heli1Img
    },
    {
      title: "Chobe National Park Day Trip",
      desc: "Cross the Botswana border for a full-day river safari and 4x4 game drive amongst elephant herds.",
      price: "From US$185 pp",
      duration: "Full Day",
      image: chobeImg
    },
  ];

  return (
    <div>
      <div className="sticky top-[73px] z-40 bg-[#0D2833] text-white border-b border-[#C9A66B]/30 py-2.5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <button 
            onClick={onNavigateHome}
            className="hover:text-[#C9A66B] transition-colors flex items-center gap-1.5 font-semibold text-gray-300 cursor-pointer text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2 text-[#C9A66B] font-bold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span className="hidden sm:inline">Flagship Victoria Falls Evening Experience</span>
            <span className="sm:hidden">The Boma Show</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Full Width Magazine Hero */}
      <section className="relative bg-[#0D2833] text-white overflow-hidden py-16 sm:py-24 lg:py-28">
        {/* Background Photo */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bomaDinnerImg} 
            alt="The Boma Dinner & Drum Show entrance with traditional dancers welcoming guests"
             className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/70 to-[#0D2833]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            {/* Category Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/20 backdrop-blur-md border border-[#C9A66B]/50 text-[#E5C989] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>Victoria Falls Cultural Feast & Celebration</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              The Boma Dinner & Drum Show
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-200 font-light leading-relaxed max-w-2xl">
              Experience one of Victoria Falls' most celebrated evenings of traditional food, live music, vibrant dancing, and interactive drumming.
            </p>

            {/* Hero Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={getWhatsAppEnquiryUrl("The Boma Dinner & Drum Show")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                <span>Enquire About Availability</span>
              </a>

              <button
                onClick={onOpenPlanHoliday}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                <span>Build My Custom Holiday</span>
              </button>
            </div>

            {/* Quick Facts Strip */}
            <div className="pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
              <div className="flex items-center gap-2 text-gray-200">
                <Star className="w-4 h-4 text-[#E5C989] shrink-0" />
                <span className="font-medium">Recommended for First-Timers</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Clock className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">~3 Hours Duration</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Utensils className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">4-Course Feast Included</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Music className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">Live Performances & Drumming</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Bus className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">Hotel Transfers Available</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Layout Container with Sticky Sidebar on Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Story Content Column (8 Cols) */}
          <main className="lg:col-span-8 space-y-16">
            
            {/* 3. Why We Recommend It */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Local Specialist Perspective
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Why We Recommend The Boma
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-serif italic text-[#1A2E35]">
                "The Boma is far more than a restaurant—it is an immersive celebration of Zimbabwean warmth, rhythm, and hospitality that stays in your heart long after you leave Victoria Falls."
              </p>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                As local Victoria Falls travel specialists, we always tell our guests: if you want one evening that captures the vibrant spirit of Africa, this is it. From the moment you step under the thatched archway and receive your traditional chitenge wrap, you are embraced into an authentic cultural gathering.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <Sparkles className="w-4 h-4 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">Cultural Ceremonies</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Hand washing rituals, village beer tasting, face painting, and table serenades by acapella singers.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <Music className="w-4 h-4 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">Interactive Drumming</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Every guest is handed a authentic Djembe drum to participate in an exhilarating rhythm workshop.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <Utensils className="w-4 h-4 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">Open Fire Braai & Feast</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Flame-grilled game meats, tender potjie stews, smoked crocodile tail, fresh salads, and desserts.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <Users className="w-4 h-4 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">For All Generations</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Loved equally by couples, multi-generational families, solo adventurers, and safari groups.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Photo Story - Narrative Chapters */}
            <section className="space-y-12">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Visual Journey
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Your Evening at The Boma: Step by Step
                </h2>
                <p className="text-sm text-gray-600">
                  Follow the story of a typical festive evening under the thatched roof and African stars.
                </p>
              </div>

              {/* Story 1: Your Evening Begins */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 h-64 md:h-auto relative">
                  <img 
                    src={bomaDinnerImg}
                    alt="Warm traditional welcome at the entrance of The Boma"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    Part 1 • 6:45 PM
                  </div>
                </div>
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    Your Evening Begins
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    As you arrive at the Boma entrance, you are welcomed by energetic traditional dancers and draped in a vibrant traditional ceremonial chitenge. Your host leads you through a traditional ceremonial hand-washing ritual and offers a welcoming sip of local village beer.
                  </p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Traditional chitenge wrap & village beer welcome included</span>
                  </div>
                </div>
              </div>

              {/* Story 2: Traditional Performances */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3 order-2 md:order-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    Vibrant Traditional Performances
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Throughout your meal, traditional dance troupes perform high-energy cultural dances representing different regions of Zimbabwe. Dancers leap with shields and spears to hypnotic rhythms, while traditional singers perform rich harmonies.
                  </p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <Music className="w-3.5 h-3.5" />
                    <span>Live cultural dance shows performed between dinner courses</span>
                  </div>
                </div>
                <div className="md:col-span-6 h-64 md:h-auto relative order-1 md:order-2">
                  <img 
                    src={bomaDinnerImg2} 
                    alt="Energetic traditional dancers leaping during dinner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    Part 2 • Live Performance
                  </div>
                </div>
              </div>

              {/* Story 3: Open Fire Cooking & Spit Roast */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 h-64 md:h-auto relative">
                  <img 
                    src={bomaDinnerImg3} 
                    alt="Master chefs grilling game meats over open fire pits at The Boma"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    Part 3 • Open Fire Braai
                  </div>
                </div>
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    The Boma Braai & Cookhouse
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Watch master chefs in traditional red uniforms carve flame-roasted game meats right off the spit braai. The air is filled with rich woodsmoke aromas as tender beef, marinated chicken, pork fillet, and daily spit roast sizzle over glowing coals.
                  </p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Seared game meats, spit roast & traditional hunter's potjies</span>
                  </div>
                </div>
              </div>

              {/* Story 4: African Buffet Feast */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3 order-2 md:order-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    The African Feast
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Start with a chef's starter platter of smoked crocodile tail, salted groundnuts with Nyimo, and golden corn fritters. Move on to the buffet offering Zambezi bream, Kapenta, peanut butter rice, sadza (isitshwala), rich 'Umzingeli' hunter's stews, and a colorful salad bar.
                  </p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Full menu from official Boma culinary team</span>
                  </div>
                </div>
                <div className="md:col-span-6 h-64 md:h-auto relative order-1 md:order-2">
                  <img 
                    src={bomaDinnerImg4} 
                    alt="Fresh salad buffet and potjies stews at The Boma"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    Part 4 • Grand Buffet
                  </div>
                </div>
              </div>

              {/* Story 5: Interactive Drumming Show */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 h-64 md:h-auto relative">
                  <img 
                    src={bomaDinnerImg5} 
                    alt="Interactive drumming show with master drummers"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    Part 5 • 8:45 PM Finale
                  </div>
                </div>
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    Interactive Drumming Show
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    The highlight of the night! Every guest receives an authentic Djembe drum. Master drummers take the stage, guiding hundreds of guests together into a thunderous, joyful rhythm session where inhibitions vanish.
                  </p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <Music className="w-3.5 h-3.5" />
                    <span>Personal Djembe drum provided for every guest</span>
                  </div>
                </div>
              </div>

              {/* Story 6: Desserts & Acapella Epilogue */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3 order-2 md:order-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    Desserts & Table Serenades
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Conclude your evening at the dessert buffet featuring red velvet squares, fruit crumbles, cupcakes, and hot cups of Zimbabwe's famous Tanganda Tea, Rooibos Tea, or filter coffee while acapella singers serenade guests tableside.
                  </p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Tanganda tea, Rooibos tea & filter coffee included</span>
                  </div>
                </div>
                <div className="md:col-span-6 h-64 md:h-auto relative order-1 md:order-2">
                  <img 
                    src={bomaDinnerImg6} 
                    alt="Dessert table with red velvet cake and pastries"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    Part 6 • Desserts & Tea
                  </div>
                </div>
              </div>

            </section>

            {/* Boma Experience Gallery */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Visual Gallery
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  The Boma Photo Gallery
                </h2>
                <p className="text-sm text-gray-600">
                  Click any image to view full-size with prev/next navigation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  bomaDinnerImg,
                  bomaDinnerImg2,
                  bomaDinnerImg3,
                  bomaDinnerImg4,
                  bomaDinnerImg5,
                  bomaDinnerImg6,
                  bomaDinnerImg7,
                  bomaDinnerImg8,
                ].map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    className="h-48 rounded-2xl overflow-hidden border border-gray-200 shadow-xs cursor-pointer"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`The Boma gallery photo ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                ))}
              </div>
              {lightboxIndex !== null && (
                <GalleryLightbox
                  images={[
                    bomaDinnerImg,
                    bomaDinnerImg2,
                    bomaDinnerImg3,
                    bomaDinnerImg4,
                    bomaDinnerImg5,
                    bomaDinnerImg6,
                    bomaDinnerImg7,
                    bomaDinnerImg8,
                  ]}
                  initialIndex={lightboxIndex}
                  onClose={() => setLightboxIndex(null)}
                />
              )}
            </section>

            {/* 5. Evening Timeline Section */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Official Timeline
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Timeline of Events
                </h2>
                <p className="text-sm text-gray-600">
                  Official timing schedule for your festive evening at The Boma.
                </p>
              </div>

              {/* Timeline Flow */}
              <div className="relative pl-6 sm:pl-8 border-l-2 border-[#C9A66B]/40 space-y-8 my-6">
                
                {/* 6:45 PM */}
                <div className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#0B5E8E] border-4 border-white shadow-xs group-hover:scale-110 transition-transform" />
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/60 space-y-1">
                    <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
                      6:45 PM
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#0B5E8E]">
                      Traditional Welcome & Ceremonial Greeting
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Traditional dancers welcome you as you enter into The Boma. Guests receive a chitenge wrap, traditional hand washing, and a taste of local village beer.
                    </p>
                  </div>
                </div>

                {/* Starters */}
                <div className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#C9A66B] border-4 border-white shadow-xs group-hover:scale-110 transition-transform" />
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/60 space-y-1">
                    <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
                      7:15 PM
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#0B5E8E]">
                      Chef's Starters (Ivulamphimbo) Served Tableside
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Waiters serve a platter of chef's appetizers: Smoked crocodile tail (Ingwenya Yasekhunjini LukaZambezi), salted groundnuts & 'Nyimo', and corn fritters.
                    </p>
                  </div>
                </div>

                {/* 8:00 PM */}
                <div className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#0B5E8E] border-4 border-white shadow-xs group-hover:scale-110 transition-transform" />
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/60 space-y-1">
                    <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
                      8:00 PM
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#0B5E8E]">
                      African Buffet & Traditional Dance Performance
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Help yourself to the grand buffet, open fire braai, game meats, potjie stews, and salads. Captivating live traditional dance performances take place during dinner.
                    </p>
                  </div>
                </div>

                {/* 8:45 PM */}
                <div className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#E67E22] border-4 border-white shadow-xs group-hover:scale-110 transition-transform" />
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/60 space-y-1">
                    <span className="text-xs font-bold text-[#E67E22] uppercase tracking-wider block">
                      8:45 PM
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#0B5E8E]">
                      Interactive Drumming Show
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Let all your inhibitions loose! Every guest receives their own Djembe drum to participate in an interactive drumming session led by master drummers.
                    </p>
                  </div>
                </div>

                {/* Epilogue */}
                <div className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#0B5E8E] border-4 border-white shadow-xs group-hover:scale-110 transition-transform" />
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/60 space-y-1">
                    <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
                      Epilogue & Desserts
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#0B5E8E]">
                      Table Serenades, Desserts & Tea
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Acapella singers serenade guests tableside while you enjoy desserts and hot Tanganda or Rooibos tea.
                    </p>
                  </div>
                </div>

              </div>

              {/* Optional Throughout Evening Callout */}
              <div className="p-5 rounded-2xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-[#0B5E8E]">
                  <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                  <span>Optional Experiences Throughout the Evening:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-700">
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>Face painting with tribal designs</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>Eat a mopane worm (Get a certificate!)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>Hair braiding ($1–$10)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>Fortune Teller ($1)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>The Boma Man tableside cocktail ($4)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>Curio vending from $1</span>
                  </div>
                </div>
              </div>

            </section>

            {/* 6. What's Included */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Package Inclusions
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  What's Included in Your Ticket
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: "Buffet Dinner", desc: "4-course feast & braai" },
                  { title: "Dance Performances", desc: "Live traditional show" },
                  { title: "Interactive Drumming", desc: "Djembe drum included" },
                  { title: "Village Beer Tasting", desc: "Traditional greeting" },
                  { title: "Welcome Ceremony", desc: "Chitenge wrap & hand wash" },
                  { title: "Dessert Spread", desc: "Cakes, crumbles & fruits" },
                  { title: "Tea & Coffee", desc: "Tanganda & Rooibos tea" },
                  { title: "Hotel Transfers", desc: "Optional return transport" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 text-center space-y-1 hover:border-[#C9A66B]/50 transition-all">
                    <div className="w-8 h-8 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center mx-auto mb-2">
                      <Check className="w-4 h-4 text-[#0B5E8E]" />
                    </div>
                    <span className="font-bold text-xs text-[#0B5E8E] block">{item.title}</span>
                    <span className="text-[10px] text-gray-500 block">{item.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. Local Specialist Tip */}
            <section className="rounded-3xl bg-gradient-to-br from-[#0B5E8E] to-[#0D2833] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#C9A66B]/40">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C9A66B]/20 border border-[#C9A66B]/50 flex items-center justify-center text-[#E5C989] shrink-0 mt-1">
                  <Star className="w-6 h-6 text-[#E5C989]" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#E5C989]">
                    ⭐ Local Specialist Tip
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    Arrive Hungry & Embrace the Experience
                  </h3>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    The Boma is far more than a buffet—it is an entire evening of food, entertainment, and cultural connection. Take your time between courses, enjoy the dance performances, try a taste of game meat or a mopane worm, and don't miss the interactive drumming session towards the end of the evening!
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Good To Know */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Practical Information
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Good To Know
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Duration & Timings</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Approximately 3 Hours. Doors open at 6:45 PM; the show finishes around 10:00 PM.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Dress Code</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Smart casual and comfortable. Bring a light jacket during winter months (May to August).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Vegetarian & Dietary Options</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Generous choices including chef's daily pasta, stir-fries, bush vegetables, and extensive salad bar.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Family Friendly</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Great for kids of all ages. Interactive drumming, face painting, and kid-approved food items.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Transfers Available</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Door-to-door return transfers from all Victoria Falls hotels can be added to your reservation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Advance Booking Recommended</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    High demand during peak safari months. Early booking guarantees preferred seating.
                  </p>
                </div>
              </div>
            </section>

            {/* 9. Typical Investment */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Pricing & Rates
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Typical Investment
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-200 space-y-2 text-center sm:text-left">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Adult Rate</span>
                  <div className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E]">
                    From US$55 – $70 <span className="text-xs font-normal text-gray-500">pp</span>
                  </div>
                  <p className="text-xs text-gray-600">Includes 4-course buffet feast, welcome ceremony, dance performances, and interactive drumming show.</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-200 space-y-2 text-center sm:text-left">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Child Rate (Ages 3–11)</span>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0B5E8E]">
                    Available on Request
                  </div>
                  <p className="text-xs text-gray-600">Special discounted rates for children under 12. Toddlers under 3 join free of charge.</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 italic text-center sm:text-left">
                * Prices vary depending on hotel transfers, operator rates, and seasonal availability. Contact Outbound Holidays for a personalized quotation.
              </p>
            </section>

            {/* 10. Is This Experience Right For You? */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Traveller Match
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Is This Experience Right For You?
                </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#0D2833] text-white font-serif font-bold">
                    <tr>
                      <th className="p-4">Traveller Profile</th>
                      <th className="p-4">Recommendation</th>
                      <th className="p-4">Why It Matches</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-[#FAF9F6]">
                    <tr>
                      <td className="p-4 font-bold text-[#0B5E8E]">First-Time Visitors</td>
                      <td className="p-4 font-bold text-[#E67E22]">⭐⭐⭐⭐⭐ Must Do</td>
                      <td className="p-4 text-gray-600">The essential cultural celebration for any Victoria Falls itinerary.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#0B5E8E]">Families with Children</td>
                      <td className="p-4 font-bold text-[#E67E22]">⭐⭐⭐⭐⭐ Highly Recommended</td>
                      <td className="p-4 text-gray-600">Kids love face painting, drumming, and energetic dance shows.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#0B5E8E]">Couples & Honeymooners</td>
                      <td className="p-4 font-bold text-[#E67E22]">⭐⭐⭐⭐ Recommended</td>
                      <td className="p-4 text-gray-600">A lively, festive evening to break up quiet safari days.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#0B5E8E]">Food Lovers</td>
                      <td className="p-4 font-bold text-[#E67E22]">⭐⭐⭐⭐⭐ Must Try</td>
                      <td className="p-4 text-gray-600">Sample local game meats, potjie stews, sadza, bream, and desserts.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#0B5E8E]">Culture Enthusiasts</td>
                      <td className="p-4 font-bold text-[#E67E22]">⭐⭐⭐⭐⭐ Must Do</td>
                      <td className="p-4 text-gray-600">Authentic music, dance, drumming, and traditional greeting ceremonies.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 11. Frequently Asked Questions */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Common Questions
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndices.includes(idx);
                  return (
                    <div 
                      key={idx}
                      className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 bg-[#FAF9F6]"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-[#0B5E8E] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-[#C9A66B] shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-200/60 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 12. Related Experiences */}
            <section className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Combine Your Experience
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Related Victoria Falls Experiences
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedExperiences.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:border-[#0B5E8E] transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 overflow-hidden relative">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-[#0D2833]/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                          {item.duration}
                        </div>
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base text-[#0B5E8E] font-serif">
                            {item.title}
                          </h4>
                          <span className="text-xs font-bold text-[#E67E22] bg-[#E67E22]/10 px-2 py-0.5 rounded-md">
                            {item.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => {
                          if (onSelectRelatedExperience) {
                            onSelectRelatedExperience(item.title);
                          } else {
                            onOpenPlanHoliday();
                          }
                        }}
                        className="w-full bg-[#FAF9F6] hover:bg-[#0B5E8E] hover:text-white text-[#0B5E8E] font-bold text-xs py-2.5 rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Explore Experience</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>

          {/* Sticky Desktop Booking & Specialist Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div id="boma-booking-section" className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-lg space-y-5">
              
              <div className="pb-4 border-b border-gray-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block">
                  Reserve Your Seats
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-2xl font-bold text-[#0B5E8E]">
                    The Boma Dinner
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#E67E22]">US$55</span>
                    <span className="text-[10px] text-gray-400 block">/ person</span>
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Select Travel Date</label>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Number of Guests</label>
                  <select 
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-800 block">Hotel Return Transfer</span>
                    <span className="text-[10px] text-gray-500">Air-conditioned hotel pickup</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={includeTransfers}
                    onChange={(e) => setIncludeTransfers(e.target.checked)}
                    className="w-4 h-4 text-[#0B5E8E] rounded border-gray-300 focus:ring-[#0B5E8E]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <WhatsAppEnquiryButton 
                experienceName="The Boma Dinner & Drum Show"
                date={selectedDate}
                guests={guestCount}
                additionalNotes={includeTransfers ? "Hotel return transfer requested" : undefined}
                buttonText="Enquire & Reserve Seats"
                variant="whatsapp-green"
              />

              <WhatsAppSpecialistCTA topic="The Boma Dinner & Evening Experiences" />

              {/* Trust Badges */}
              <div className="pt-3 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0B5E8E] shrink-0" />
                  <span>Official Outbound Holidays Victoria Falls Partner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0B5E8E] shrink-0" />
                  <span>Instant Availability Check & Flexible Cancellation</span>
                </div>
              </div>

            </div>

            {/* Local Concierge Box */}
            <div className="bg-[#0D2833] text-white rounded-3xl p-6 space-y-3 border border-[#C9A66B]/30 shadow-md">
              <span className="text-[10px] font-bold text-[#E5C989] uppercase tracking-wider block">
                Local Concierge Office
              </span>
              <h4 className="font-serif font-bold text-base text-white">
                Planning a Full Victoria Falls Trip?
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Let our Victoria Falls team combine The Boma Dinner with your lodge bookings, sunset cruise, and safari game drives into one seamless itinerary.
              </p>
              <button
                onClick={onOpenPlanHoliday}
                className="w-full bg-[#C9A66B] hover:bg-[#b8955a] text-[#0D2833] font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Full Itinerary</span>
              </button>
            </div>
          </aside>

        </div>
      </div>

      {/* 13. Final CTA Banner */}
      <section className="bg-gradient-to-r from-[#0D2833] via-[#0B5E8E] to-[#0D2833] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-xs font-bold uppercase tracking-widest border border-[#C9A66B]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>Unforgettable African Celebration</span>
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Ready to Experience The Boma?
          </h2>

          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
            Let our local Victoria Falls specialists include this unforgettable cultural evening in your personalized holiday itinerary.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenPlanHoliday}
              className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <CalendarCheck className="w-5 h-5" />
              <span>Build My Holiday</span>
            </button>

            <button
              onClick={onOpenPlanHoliday}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-8 py-4 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-5 h-5 text-[#C9A66B]" />
              <span>Speak to a Local Specialist</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
