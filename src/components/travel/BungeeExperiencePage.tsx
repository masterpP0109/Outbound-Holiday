import React, { useState, useEffect } from 'react';
import { WhatsAppEnquiryButton, WhatsAppSpecialistCTA, WhatsAppIcon } from '../common/WhatsAppButton';
import { 
  Clock, 
  MapPin, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  CalendarCheck, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Share2, 
  Users, 
  Check, 
  Info,
  XCircle,
  Zap,
  Award,
  Compass,
  FileCheck
} from 'lucide-react';
import { GalleryLightbox } from './GalleryLightbox';
import { Experience, ALL_EXPERIENCES, getExperienceById } from '../../data/experiencesData';
import { getWhatsAppEnquiryUrl } from '../../utils/whatsapp';

import bungeeImg from '../../assets/Experiences/Bungee Jump_/Bungee-1-scaled.jpg';
import bungeeImg2 from '../../assets/Experiences/Bungee Jump_/Bungee-8.jpg';
import bungeeImg3 from '../../assets/Experiences/Bungee Jump_/Bungee-9-scaled.jpg';
import bungeeImg4 from '../../assets/Experiences/Bungee Jump_/1-1.jpg';
import bungeeImg5 from '../../assets/Experiences/Bungee Jump_/2-8.jpg';

interface BungeeExperiencePageProps {
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
  onSelectRelatedExperience?: (exp: Experience) => void;
  onBackToDirectory?: () => void;
}

export const BungeeExperiencePage: React.FC<BungeeExperiencePageProps> = ({
  onOpenPlanHoliday,
  onNavigateHome,
  onSelectRelatedExperience,
  onBackToDirectory
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [jumperCount, setJumperCount] = useState(1);
  const [includeTransfers, setIncludeTransfers] = useState(true);
  const [includeVideoPackage, setIncludeVideoPackage] = useState(false);
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0, 1, 2]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Victoria Falls Bridge Bungee Jump | Premium Editorial Experience | Outbound Holidays";
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

  const bungeePricePerPerson = 160;
  const transferCostPerPerson = includeTransfers ? 15 : 0;
  const videoPackageCost = includeVideoPackage ? 55 : 0;
  const totalEstimatedCost = (bungeePricePerPerson + transferCostPerPerson) * jumperCount + (includeVideoPackage ? videoPackageCost : 0);

  const steps = [
    {
      stepNumber: 1,
      time: "Phase 1",
      title: "The Historic Bridge Approach",
      description: "Walk out onto the famous 1905 steel Victoria Falls Railway Bridge spanning the Batoka Gorge. Positioned in the neutral 'No-Man's Land' between Zimbabwe and Zambia, you'll feel the rush of wind and catch your first glimpse of the roaring river 111 meters below.",
      highlight: "Free bridge pass provided at border control—no visa needed!",
      image: bungeeImg2
    },
    {
      stepNumber: 2,
      time: "Phase 2",
      title: "Safety Briefing & Precision Harnessing",
      description: "Meet your team of certified master riggers at the bridge jump station. You will be weighed, fitted with specialized padded ankle harnesses, and backed up with a heavy-duty climbing body harness for dual-redundant safety.",
      highlight: "Operated with a 100% safety record over 500,000+ jumps.",
      image: bungeeImg3
    },
    {
      stepNumber: 3,
      time: "Phase 3",
      title: "The Edge Walk & Gantry Launchpad",
      description: "Step onto the wooden jump gantry suspended directly over the abyss. With the spray of Mosi-oa-Tunya drifting past and the Zambezi rapids surging under your feet, the jump master guides you to the threshold.",
      highlight: "Breathtaking 360° panoramic view of Batoka Canyon.",
      image: bungeeImg4
    },
    {
      stepNumber: 4,
      time: "Phase 4",
      title: "5... 4... 3... 2... 1... BUNGEE!",
      description: "Leap forward into pure weightlessness! Experience 4 seconds of exhilarating freefall reaching terminal speeds over 120 km/h before the custom rubber bungee cord smoothly catches you in a series of gentle, soaring bounces.",
      highlight: "4 seconds of sheer vertical zero-gravity freefall.",
      image: bungeeImg5
    },
    {
      stepNumber: 5,
      time: "Phase 5",
      title: "Winch Recovery & Certificate of Bravery",
      description: "After the rebounds settle, a winch operator gently lowers a recovery line to hoist you smoothly back up to the bridge deck. Celebrate with fellow jumpers, receive your official Certificate of Bravery, and view your HD video footage.",
      highlight: "Official Certificate of Bravery & HD video memories.",
      image: bungeeImg
    }
  ];

  const faqs = [
    {
      q: "Is a visa required to go onto the Victoria Falls Bridge?",
      a: "No! Border control at both the Zimbabwean and Zambian posts issue a complimentary Bridge Pass so you can step onto the bridge without using up a visa entry or paying border entry fees."
    },
    {
      q: "How safe is the Victoria Falls Bungee Jump?",
      a: "It is operated under strict British & Australian bungee standards with dual-redundant harness systems, daily cord inspections, and a 100% safety record across more than 500,000 jumps since 1994."
    },
    {
      q: "Can non-jumping family and friends watch from the bridge?",
      a: "Absolutely! Spectating from the bridge walkways or enjoying a cold beverage at the Bridge Café is completely free and provides an incredible vantage point for photos and videos."
    },
    {
      q: "What are the age and weight requirements?",
      a: "Minimum age is 14 years. Minimum weight requirement is 40 kg (88 lbs) and maximum weight is 140 kg (308 lbs). Parents or legal guardians must sign consent for jumpers under 18."
    },
    {
      q: "What should I wear for the bungee jump?",
      a: "Wear comfortable clothing and closed-toe footwear like sneakers or running shoes. Loose objects, glasses, and pocket items must be secured or left in lockers at the jump office."
    }
  ];

  const relatedList = ['gorge-swing', 'white-water-rafting', 'flight-of-angels', 'upper-zambezi-sunset-cruise']
    .map(id => getExperienceById(id))
    .filter((e): e is Experience => e !== undefined);

  return (
    <div className="bg-[#FAF9F6] text-[#1A2E35] min-h-screen selection:bg-[#C9A66B]/30 selection:text-[#0B5E8E]">
      
      {/* 1. Sub-Header Navigation Bar */}
      <div className="sticky top-[73px] z-40 bg-[#0D2833] text-white border-b border-[#C9A66B]/30 py-2.5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={onNavigateHome}
              className="hover:text-[#C9A66B] transition-colors flex items-center gap-1.5 font-semibold text-gray-300 cursor-pointer text-[11px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            {onBackToDirectory && (
              <>
                <span className="text-gray-500">/</span>
                <button 
                  onClick={onBackToDirectory}
                  className="hover:text-[#C9A66B] transition-colors font-semibold text-gray-300 cursor-pointer text-[11px]"
                >
                  All Experiences
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-[#C9A66B] font-bold text-[11px] uppercase tracking-wider hidden sm:flex">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>World Iconic Adrenaline Bucket List</span>
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
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bungeeImg} 
            alt="Bungee jumper launching off the Victoria Falls Bridge above Batoka Gorge"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/70 to-[#0D2833]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            {/* Category Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/20 backdrop-blur-md border border-[#C9A66B]/50 text-[#E5C989] text-xs font-bold uppercase tracking-widest">
              <Award className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>One of the World's Great Bucket List Jumps</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Bungee Jump at Victoria Falls Bridge
            </h1>

            {/* Subtitle / Excerpt */}
            <p className="text-lg sm:text-xl text-gray-200 font-light leading-relaxed max-w-2xl">
              Plunge 111 meters into the dramatic Batoka Gorge with the thunderous spray of Victoria Falls framing the horizon behind you.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={getWhatsAppEnquiryUrl("Victoria Falls Bridge Bungee Jump")}
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
                <span>Add to Custom Itinerary</span>
              </button>
            </div>

            {/* Quick Fact Strip */}
            <div className="pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2 text-gray-200">
                <Clock className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">2 Hours Duration</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <MapPin className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">Victoria Falls Bridge (No-Man's Land)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Zap className="w-4 h-4 text-[#E5C989] shrink-0" />
                <span className="font-medium">111m / 364ft Drop</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <ShieldCheck className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">From US$160 per person</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Story Column (8 Cols) */}
          <main className="lg:col-span-8 space-y-16">
            
            {/* 3. Why We Recommend This Experience (Editorial Callout) */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Local Specialist Perspective
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Why We Recommend This Jump
                </h2>
              </div>

              {/* Singita Style Editorial Block */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0B5E8E]/10 to-[#0D2833]/5 border-l-4 border-[#C9A66B] space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-[#0B5E8E]">
                  <Star className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
                  <span>National Geographic Meets African Bush Camp Storytelling</span>
                </div>
                <p className="text-base sm:text-lg text-[#1A2E35] italic font-serif leading-relaxed">
                  "The Victoria Falls Bridge bungee isn't just a jump; it's a plunge into the natural border between Zimbabwe and Zambia with one of the Seven Natural Wonders of the World roaring right beside you. The sheer drop, the wind, and the mist create an adrenaline rush unmatched anywhere in Africa."
                </p>
              </div>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Spanning the canyon between two countries, the historic 1905 Victoria Falls Railway Bridge offers a leaping platform unlike any other on earth. As you stand on the jump gantry 111 meters above the churning white water of the Zambezi River, the roaring mist of Mosi-oa-Tunya forms giant rainbows across the basalt cliffs. It is equal parts awe-inspiring engineering, raw nature, and extreme bucket-list adventure.
              </p>
            </section>

            {/* 4. Experience Highlights */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Unrivalled Adventure Features
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Experience Highlights
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "111m Sheer Plunge",
                    desc: "Drop 111 meters (364 feet) directly over the swirling Zambezi River rapids."
                  },
                  {
                    title: "Historic 'No-Man's Land'",
                    desc: "Jump from the neutral international border bridge between Zimbabwe and Zambia."
                  },
                  {
                    title: "Spectacular Falls Mist Backdrop",
                    desc: "Leap with the thunderous roar and rising rainbow spray of Victoria Falls."
                  },
                  {
                    title: "100% Safety Track Record",
                    desc: "Operated by master riggers under strict Australian/British bungee safety standards."
                  },
                  {
                    title: "Dual Harness Redundancy",
                    desc: "Custom padded ankle harnesses paired with a climbing body harness backup system."
                  },
                  {
                    title: "HD Video & Photo Package",
                    desc: "Multiple camera angles capture your jump, freefall expressions, and winch recovery."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#0B5E8E]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#0B5E8E]">{item.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. What to Expect / The Experience Journey (Step-by-Step Timeline) */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  The Experience Journey
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  What To Expect Step by Step
                </h2>
                <p className="text-sm text-gray-600">
                  Here is how your bungee jump adventure unfolds on the Victoria Falls Bridge.
                </p>
              </div>

              {/* Timeline Items */}
              <div className="space-y-8">
                {steps.map((st) => (
                  <div key={st.stepNumber} className="bg-[#FAF9F6] rounded-2xl p-6 border border-gray-200/70 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 h-48 rounded-xl overflow-hidden relative">
                      <img 
                        src={st.image} 
                        alt={st.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-[#0D2833]/90 text-[#E5C989] text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                        Step {st.stepNumber} • {st.time}
                      </div>
                    </div>

                    <div className="md:col-span-8 space-y-2">
                      <h3 className="font-serif text-xl font-bold text-[#0B5E8E]">
                        {st.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {st.description}
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C9A66B] pt-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{st.highlight}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Visual Editorial Gallery */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Visual Gallery
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Bungee Experience Gallery
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  bungeeImg2,
                  bungeeImg3,
                  bungeeImg4
                ].map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    className="h-52 rounded-2xl overflow-hidden border border-gray-200 shadow-xs cursor-pointer"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Victoria Falls bungee gallery ${idx + 1}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
              {lightboxIndex !== null && (
                <GalleryLightbox
                  images={[bungeeImg2, bungeeImg3, bungeeImg4]}
                  initialIndex={lightboxIndex}
                  onClose={() => setLightboxIndex(null)}
                />
              )}
            </section>

            {/* 7. Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Included */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#0B5E8E] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0B5E8E]" />
                  <span>What's Included</span>
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>Full bungee safety briefing by master riggers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>Dual padded ankle harness & body backup harness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>Complimentary Victoria Falls Bridge border pass</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>Personal Certificate of Bravery upon completion</span>
                  </li>
                </ul>
              </section>

              {/* Excluded */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#0B5E8E] flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-gray-400" />
                  <span>What's Excluded / Optional</span>
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                    <span>National park / bridge access fee ($10 payable cash on site)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                    <span>Return hotel transfers (optional bundle for $15 pp)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                    <span>HD Video & Photo souvenir package ($55 optional)</span>
                  </li>
                </ul>
              </section>

            </div>

            {/* 8. Local Expert Tip Banner */}
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
                    Timing Your Jump for Rainbow Magic
                  </h3>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    Book your jump for late afternoon when the angle of the sun hits the rising spray of Victoria Falls, creating vibrant double rainbows directly inside the gorge as you dive toward the river!
                  </p>
                </div>
              </div>
            </section>

            {/* 9. Requirements & Good To Know */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Essential Jump Criteria
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Requirements & Good to Know
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Age Limits</span>
                  </span>
                  <p className="text-gray-600">Minimum age is 14 years. Jumpers under 18 require signed parental consent.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Weight Limits</span>
                  </span>
                  <p className="text-gray-600">Minimum weight is 40 kg (88 lbs); maximum weight is 140 kg (308 lbs).</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Passport Required</span>
                  </span>
                  <p className="text-gray-600">Bring your physical passport to clear the border control post for your free bridge pass.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Footwear & Clothing</span>
                  </span>
                  <p className="text-gray-600">Wear closed athletic shoes with laces. Loose jewelry or glasses must be removed.</p>
                </div>
              </div>
            </section>

            {/* 10. Frequently Asked Questions */}
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
                      className="rounded-2xl border border-gray-200 overflow-hidden bg-[#FAF9F6]"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full text-left p-4 font-bold text-sm text-[#0B5E8E] flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-[#C9A66B]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-200/60 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 11. Recommended Combinations */}
            {relatedList.length > 0 && (
              <section className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                    Recommended Combinations
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                    Pair Your Bungee Jump With
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedList.map((rel) => (
                    <div 
                      key={rel.id}
                      onClick={() => onSelectRelatedExperience && onSelectRelatedExperience(rel)}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="h-32 overflow-hidden relative">
                        <img 
                          src={rel.featuredImage} 
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-2 right-2 bg-[#0D2833]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                          {rel.fromPrice}
                        </div>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors line-clamp-1">
                          {rel.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-2">
                          {rel.shortDescription}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </main>

          {/* Sticky Booking Sidebar (4 Cols) */}
          <aside id="bungee-booking-section" className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-lg space-y-6">
              
              <div className="space-y-1 border-b border-gray-200 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Experience Investment</span>
                <div className="text-3xl font-bold font-serif text-[#0B5E8E]">
                  US$160 <span className="text-xs font-normal text-gray-500">per jumper</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>Duration: Approx 2 Hours</span>
                </div>
              </div>

              {/* Interactive Booking Calculator Form */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preferred Jump Date</label>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Number of Jumpers</label>
                  <select
                    value={jumperCount}
                    onChange={(e) => setJumperCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs bg-white"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Jumper' : 'Jumpers'}</option>
                    ))}
                  </select>
                </div>

                {/* Add-on Toggles */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-[#FAF9F6] border border-gray-200">
                    <span className="font-semibold text-gray-700">Include Return Hotel Transfer (+$15/pp)</span>
                    <input 
                      type="checkbox" 
                      checked={includeTransfers} 
                      onChange={(e) => setIncludeTransfers(e.target.checked)}
                      className="w-4 h-4 accent-[#0B5E8E] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-[#FAF9F6] border border-gray-200">
                    <span className="font-semibold text-gray-700">HD Video & Photo Package (+$55)</span>
                    <input 
                      type="checkbox" 
                      checked={includeVideoPackage} 
                      onChange={(e) => setIncludeVideoPackage(e.target.checked)}
                      className="w-4 h-4 accent-[#0B5E8E] cursor-pointer"
                    />
                  </label>
                </div>

                {/* Estimated Total Display */}
                <div className="p-3.5 rounded-xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 flex items-center justify-between">
                  <span className="font-bold text-gray-700">Estimated Total:</span>
                  <span className="font-serif font-bold text-lg text-[#0B5E8E]">US${totalEstimatedCost}</span>
                </div>

                <WhatsAppEnquiryButton 
                  experienceName="Victoria Falls Bridge Bungee Jump"
                  date={selectedDate}
                  guests={jumperCount}
                  buttonText="Enquire About Availability"
                  variant="whatsapp-green"
                />

                <WhatsAppSpecialistCTA topic="Victoria Falls Bungee Jump" />
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#0B5E8E]">
                  <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
                  <span>Outbound Guarantee</span>
                </div>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  Verified local Victoria Falls operator with 100% safety standards, certified master riggers, and full comprehensive insurance.
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>

    </div>
  );
};
