import React, { useState, useEffect } from 'react';
import { TravelPackage } from '../../types';
import {
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Compass,
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
  Send,
  MessageSquare,
  Clock,
  MapPin,
  Heart,
  Award,
  Plus,
  Trash2,
  Phone,
  ChevronDown,
  ChevronUp,
  Info,
  SlidersHorizontal,
  Home,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import outboundLogo from '../../assets/logos/outbound-holidays-logo.webp';

interface HolidayBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPackage?: TravelPackage | null;
  preselectedActivity?: string | null;
}

interface ActivityItem {
  id: string;
  title: string;
  duration: string;
  priceUSD: number;
  imageUrl: string;
  badge: string;
  shortDesc: string;
  whyRecommend: string;
  idealFor: string[];
}

export const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: 'act-guided-falls',
    title: 'Guided Rainforest Walk of Victoria Falls',
    duration: '2.5 Hours',
    priceUSD: 40,
    imageUrl: 'https://images.unsplash.com/photo-1614527961817-21789c629fb4?auto=format&fit=crop&q=80&w=800',
    badge: 'First-Time Essential',
    shortDesc: 'Walk along the precipice of Mosi-oa-Tunya across 16 spectacular viewpoints with an expert guide.',
    whyRecommend: 'Essential for first-time visitors — local guides reveal secret rainbow spots and geological history.',
    idealFor: ['first-time', 'family', 'romantic', 'value'],
  },
  {
    id: 'act-sunset-cruise',
    title: 'Zambezi Sunset River Cruise',
    duration: '2.5 Hours',
    priceUSD: 75,
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    badge: 'Most Popular',
    shortDesc: 'Cruise the upper Zambezi while watching hippos, elephants, and golden sunset reflections with drinks & snacks.',
    whyRecommend: 'The quintessential Victoria Falls evening ritual — serene, photogenic, and incredibly relaxing.',
    idealFor: ['first-time', 'family', 'romantic', 'inspire'],
  },
  {
    id: 'act-boma-dinner',
    title: 'The BOMA - Dinner & Drum Show',
    duration: '3.0 Hours',
    priceUSD: 55,
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    badge: 'Cultural Feast',
    shortDesc: 'Traditional Zimbabwean feast, face painting, local game meats, and energetic interactive drumming.',
    whyRecommend: 'High energy night for families and groups — every guest gets their own djembe drum!',
    idealFor: ['family', 'first-time', 'celebration'],
  },
  {
    id: 'act-helicopter',
    title: '13-Min "Flight of Angels" Helicopter',
    duration: '15 Mins',
    priceUSD: 150,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
    badge: 'Bucket-List View',
    shortDesc: 'Soar directly over the roaring curtain of mist, Batoka Gorge, and Zambezi National Park from above.',
    whyRecommend: 'Offers the only vantage point to comprehend the full width and immense scale of Victoria Falls.',
    idealFor: ['romantic', 'celebration', 'adventure', 'first-time'],
  },
  {
    id: 'act-chobe-safari',
    title: 'Full-Day Chobe National Park Safari (Botswana)',
    duration: 'Full Day',
    priceUSD: 170,
    imageUrl: 'https://images.unsplash.com/photo-1547471080-77a8b3014d23?auto=format&fit=crop&q=80&w=800',
    badge: 'Wildlife Spectacular',
    shortDesc: 'Cross into Botswana for a morning Chobe River safari cruise and an afternoon 4x4 big game drive.',
    whyRecommend: 'Home to over 50,000 elephants — virtually guarantees up-close wild elephant and lion encounters.',
    idealFor: ['wildlife', 'family', 'adventure'],
  },
  {
    id: 'act-gorge-swing',
    title: 'Batoka Gorge Swing & Zipline',
    duration: '2.0 Hours',
    priceUSD: 95,
    imageUrl: 'https://images.unsplash.com/photo-1549472346-607ef3a33904?auto=format&fit=crop&q=80&w=800',
    badge: 'Thrill Seekers',
    shortDesc: 'Freefall 70 meters into the Batoka Gorge or slide across the canopy above the Zambezi rapids.',
    whyRecommend: 'Top rated adrenaline activity in Africa — tandem leaps available for brave couples & teenagers!',
    idealFor: ['adventure', 'celebration'],
  },
  {
    id: 'act-devils-pool',
    title: 'Devil’s Pool & Livingstone Island (Seasonal)',
    duration: '3.5 Hours',
    priceUSD: 160,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    badge: 'Extreme Bucket-List',
    shortDesc: 'Swim in a natural rock pool right on the precipice of Victoria Falls during dry low-water season.',
    whyRecommend: 'Available August to January. Safe guided experience offering the ultimate edge-of-the-world photo.',
    idealFor: ['adventure', 'celebration', 'romantic'],
  },
  {
    id: 'act-hwange-extension',
    title: 'Hwange National Park 2-Night Safari Extension',
    duration: '2 Days / 2 Nights',
    priceUSD: 480,
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    badge: 'Safari Kingdom',
    shortDesc: 'Extend your stay into Zimbabwe’s premier game reserve with open 4x4 night drives and walking safaris.',
    whyRecommend: 'Combine Victoria Falls with classic African wilderness — famous for massive elephant waterhole herds.',
    idealFor: ['wildlife', 'romantic', 'family'],
  },
];

export const STAY_TIERS = [
  {
    id: 'smart-value',
    name: 'Smart Value',
    tagline: 'Clean, comfortable & well-reviewed lodges',
    pricePerNightUSD: 220,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    desc: 'Clean, charming boutique lodges that leave more of your budget available for bucket-list experiences.',
    highlights: ['Includes hot breakfast', 'Swimming pool & gardens', '10-min shuttle to Falls'],
  },
  {
    id: 'comfort-plus',
    name: 'Comfort Plus',
    tagline: 'Upgraded resort facilities & prime location',
    pricePerNightUSD: 380,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    desc: 'Spacious resort rooms or riverfront chalets with lush gardens, wildlife on property, and dining options.',
    highlights: ['River view or garden rooms', 'Spacious family suites', 'On-site spa & pool bar'],
  },
  {
    id: 'premium-escape',
    name: 'Premium Escape',
    tagline: '5-Star luxury riverfront suites',
    pricePerNightUSD: 750,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
    desc: 'Luxury river lodges with private plunge pools, gourmet fine dining, and direct Zambezi River frontage.',
    highlights: ['All-inclusive dining & drinks', 'Private plunge pool', 'Personal lodge concierge'],
  },
  {
    id: 'private-exclusive',
    name: 'Private & Exclusive',
    tagline: 'VIP river villas & private guides',
    pricePerNightUSD: 1250,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    desc: 'Private luxury villa, dedicated butler service, private 4x4 safari vehicle, and bespoke pontoon dining.',
    highlights: ['Private villa & pool', 'Private guide & safari 4x4', 'VIP airport helicopter transfers'],
  },
];

export const HolidayBuilderModal: React.FC<HolidayBuilderModalProps> = ({
  isOpen,
  onClose,
  preselectedPackage,
  preselectedActivity,
}) => {
  // Navigation & Step state
  const [step, setStep] = useState<number>(0); // 0 = Entry mode selection, 1 = Intent, 2 = Party, 3 = Timing, 4 = Stay, 5 = Activities, 6 = Logistics, 7 = Itinerary Review, 8 = Contact
  const [entryMode, setEntryMode] = useState<'guided' | 'knows-what-they-want'>('guided');

  // User Selections State
  const [tripIntent, setTripIntent] = useState<string>('first-time');
  const [partyType, setPartyType] = useState<'couple' | 'family' | 'friends' | 'solo'>('couple');
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [kidsCount, setKidsCount] = useState<number>(0);
  const [nightsCount, setNightsCount] = useState<number>(3);
  const [travelSeason, setTravelSeason] = useState<string>('flexible');
  const [stayTierId, setStayTierId] = useState<string>('comfort-plus');
  const [stayPreferences, setStayPreferences] = useState<string[]>(['Breakfast included', 'Swimming pool']);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([
    'act-guided-falls',
    'act-sunset-cruise',
  ]);
  const [transportType, setTransportType] = useState<string>('private-transfers');

  // Contact State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [mobileSummaryExpanded, setMobileSummaryExpanded] = useState<boolean>(false);

  // Load saved state or preload package on open
  useEffect(() => {
    if (isOpen) {
      if (preselectedPackage) {
        setStep(1);
        if (preselectedPackage.category === 'luxury') {
          setStayTierId('premium-escape');
        } else if (preselectedPackage.category === 'family') {
          setPartyType('family');
          setKidsCount(2);
          setStayTierId('comfort-plus');
        } else {
          setStayTierId('smart-value');
        }
        if (preselectedPackage.duration.includes('4 Days')) {
          setNightsCount(3);
        } else if (preselectedPackage.duration.includes('5 Days')) {
          setNightsCount(4);
        } else {
          setNightsCount(2);
        }
      } else if (preselectedActivity) {
        setStep(5);
        const match = ACTIVITIES_DATA.find(
          (a) => a.title.toLowerCase().includes(preselectedActivity.toLowerCase()) || a.id === preselectedActivity
        );
        if (match && !selectedActivityIds.includes(match.id)) {
          setSelectedActivityIds([...selectedActivityIds, match.id]);
        }
      }
    }
  }, [isOpen, preselectedPackage, preselectedActivity]);

  if (!isOpen) return null;

  // Toggle activity selection
  const toggleActivity = (actId: string) => {
    if (selectedActivityIds.includes(actId)) {
      setSelectedActivityIds(selectedActivityIds.filter((id) => id !== actId));
    } else {
      setSelectedActivityIds([...selectedActivityIds, actId]);
    }
  };

  // Toggle stay preference
  const toggleStayPref = (pref: string) => {
    if (stayPreferences.includes(pref)) {
      setStayPreferences(stayPreferences.filter((p) => p !== pref));
    } else {
      setStayPreferences([...stayPreferences, pref]);
    }
  };

  // Calculations
  const selectedStayTierObj = STAY_TIERS.find((s) => s.id === stayTierId) || STAY_TIERS[1];
  const selectedActivitiesList = ACTIVITIES_DATA.filter((a) => selectedActivityIds.includes(a.id));

  // Correct calculation without counting bugs!
  const totalGuests = adultsCount + kidsCount;
  const roomFactor = Math.ceil(totalGuests / 2);
  const accommodationCostMin = selectedStayTierObj.pricePerNightUSD * nightsCount * roomFactor;

  const activitiesCost = selectedActivitiesList.reduce((acc, act) => {
    const adultTotal = act.priceUSD * adultsCount;
    const kidsTotal = act.priceUSD * 0.8 * kidsCount; // 20% child discount on activities
    return acc + adultTotal + kidsTotal;
  }, 0);

  const transferCost = transportType === 'private-transfers' ? 120 : transportType === 'shared-shuttle' ? 60 : 0;

  const estimatedMinUSD = Math.round(accommodationCostMin + activitiesCost + transferCost);
  const estimatedMaxUSD = Math.round(estimatedMinUSD * 1.18); // 18% cushion range

  // Progress Percentage
  const progressPercent = Math.min(100, Math.round((step / 8) * 100));

  // Intelligent Advice Generator
  const getIntelligentAdvice = () => {
    if (step === 1) {
      if (tripIntent === 'family') {
        return "Perfect choice! We'll prioritize child-friendly accommodation, manageable activity times, and kid-safe safari experiences.";
      }
      if (tripIntent === 'romantic') {
        return "Wonderful choice! We'll focus on cozy riverfront lodge suites, romantic sunset cruises, and private candlelit moments.";
      }
      if (tripIntent === 'first-time') {
        return "Great decision! We'll make sure you experience the essential Victoria Falls highlights with zero stress and guided ease.";
      }
      if (tripIntent === 'adventure') {
        return "Thrilling choice! We'll highlight white water rafting, gorge swinging, and helicopter flights over Mosi-oa-Tunya.";
      }
      return "Excellent! We'll craft a well-balanced trip combining majestic nature, wildlife safaris, and local Zimbabwean culture.";
    }

    if (step === 2) {
      if (partyType === 'family' || kidsCount > 0) {
        return `Got it! Traveling with ${adultsCount} adults and ${kidsCount} child${
          kidsCount > 1 ? 'ren' : ''
        }. Kids under 12 receive special activity rates and tailored safari pacing.`;
      }
      if (partyType === 'couple') {
        return "Perfect for two! We'll curate intimate rooms and romantic sunset views over the Zambezi River.";
      }
      return `Great! Planning for a party of ${adultsCount} adults.`;
    }

    if (step === 3) {
      if (nightsCount === 2) {
        return "2 nights is a great weekend teaser! Note: If you choose a full-day Chobe safari, it will leave 1 day for Victoria Falls.";
      }
      if (nightsCount === 3) {
        return "3 nights is the sweet spot! Perfect duration to experience the Falls, a sunset river cruise, and a Chobe day safari without rushing.";
      }
      if (nightsCount >= 4) {
        return `${nightsCount} nights gives you wonderful breathing room! You'll have time for Vic Falls highlights plus a safari in Hwange or Chobe.`;
      }
    }

    if (step === 4) {
      return `${selectedStayTierObj.name} selected. ${selectedStayTierObj.desc}`;
    }

    if (step === 5) {
      if (selectedActivityIds.length === 0) {
        return "💡 Tip: We strongly recommend adding the Guided Rainforest Walk and Sunset Cruise as your core baseline!";
      }
      if (nightsCount <= 2 && selectedActivityIds.length > 3) {
        return `⚠️ Notice: You've selected ${selectedActivityIds.length} experiences for a 2-night trip. We recommend keeping 3 to 4 so your trip still feels relaxing!`;
      }
      if (partyType === 'family' && selectedActivityIds.includes('act-gorge-swing')) {
        return "💡 Tip: Teenagers love the Gorge Swing! Min age is 12 years with adult accompaniment.";
      }
      if (!selectedActivityIds.includes('act-guided-falls')) {
        return "💡 Recommendation: Don't miss the Guided Rainforest Walk! A local guide makes the history and hidden viewpoints come alive.";
      }
      return `Great activity choices! You have selected ${selectedActivityIds.length} experience${
        selectedActivityIds.length > 1 ? 's' : ''
      }.`;
    }

    return "Your holiday is taking shape beautifully. Review your custom day-by-day plan below.";
  };

  // WhatsApp Link Builder
  const buildWhatsAppLink = () => {
    const actNames = selectedActivitiesList.map((a) => a.title).join(', ');
    const message = `Hi Outbound Holidays! I built my custom Victoria Falls holiday on your website:%0A%0A` +
      `*Trip Style:* ${selectedStayTierObj.name}%0A` +
      `*Party:* ${adultsCount} Adults, ${kidsCount} Kids (${partyType})%0A` +
      `*Duration:* ${nightsCount} Nights / ${nightsCount + 1} Days%0A` +
      `*Experiences (${selectedActivitiesList.length}):* ${actNames || 'To be selected'}%0A` +
      `*Estimated Range:* $${estimatedMinUSD} - $${estimatedMaxUSD} USD%0A%0A` +
      `I'd like to check availability for my dates: ${travelSeason}. My name is ${fullName || 'Guest'}.`;
    return `https://wa.me/263771234567?text=${message}`;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Dynamic Theme Background photo based on trip intent
  const getIntentHeroPhoto = () => {
    if (tripIntent === 'romantic')
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800';
    if (tripIntent === 'family')
      return 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800';
    if (tripIntent === 'adventure')
      return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800';
    return 'https://images.unsplash.com/photo-1549472346-607ef3a33904?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col overflow-hidden animate-fade-in text-[#1A2E35]">
      {/* 1. IMMERSIVE TOP NAVIGATION BAR */}
      <header className="bg-[#0D5C75] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0 shadow-md">
          <div className="flex items-center">
            <img src={outboundLogo} alt="Outbound Holidays" className="h-12 sm:h-14 w-auto object-contain" />
          </div>

        {/* Step Indicator */}
        {step > 0 && !submitted && (
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>
              Step {step} of 8 •{' '}
              {step === 1
                ? 'Trip Vision'
                : step === 2
                ? 'Party Details'
                : step === 3
                ? 'Dates & Duration'
                : step === 4
                ? 'Accommodation Style'
                : step === 5
                ? 'Experiences'
                : step === 6
                ? 'Travel Logistics'
                : step === 7
                ? 'Day-by-Day Itinerary'
                : 'Save & Specialist Handover'}
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-white border border-white/20"
        >
          <span>Exit Builder</span>
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Top Progress Bar */}
      {step > 0 && !submitted && (
        <div className="bg-gray-200 h-1.5 w-full shrink-0">
          <div
            className="bg-[#D97706] h-1.5 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* 2. MAIN FULL-SCREEN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
        {/* LEFT / CENTER: MAIN QUESTION & CARDS AREA */}
        <div className="flex-1 p-4 sm:p-8 lg:p-10 max-w-4xl mx-auto w-full space-y-6 pb-28 lg:pb-12">
          {/* STEP 0: ENTRY MODE SELECTION */}
          {step === 0 && (
            <div className="text-center my-auto py-8 sm:py-12 space-y-8 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#D97706]/10 text-[#D97706] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Interactive Holiday Architect</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold font-serif text-[#0D5C75] leading-tight">
                Let’s shape your Victoria Falls holiday.
              </h1>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                Do you already know what you want to do, or would you like us to recommend a tailored itinerary for your travel style?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => {
                    setEntryMode('knows-what-they-want');
                    setStep(4); // Jump directly to Stay & Activities
                  }}
                  className="p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#0D5C75] hover:shadow-lg transition-all text-left group flex flex-col justify-between"
                >
                  <div>
                    <span className="w-10 h-10 rounded-xl bg-[#0D5C75]/10 text-[#0D5C75] flex items-center justify-center font-bold text-lg mb-3 group-hover:bg-[#0D5C75] group-hover:text-white transition-colors">
                      🎯
                    </span>
                    <h3 className="font-bold font-serif text-lg text-[#0D5C75] mb-1">
                      I Know What I Want
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Directly choose stay level, duration, and select specific activities & excursions.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#0D5C75] mt-4 flex items-center gap-1">
                    <span>Build Directly</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <button
                  onClick={() => {
                    setEntryMode('guided');
                    setStep(1); // Full guided lifestyle questions
                  }}
                  className="p-6 rounded-2xl border-2 border-[#D97706] bg-[#D97706]/5 hover:bg-[#D97706]/10 hover:shadow-lg transition-all text-left group flex flex-col justify-between relative"
                >
                  <span className="absolute top-3 right-3 bg-[#D97706] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Recommended
                  </span>
                  <div>
                    <span className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center font-bold text-lg mb-3">
                      ✨
                    </span>
                    <h3 className="font-bold font-serif text-lg text-[#0D5C75] mb-1">
                      Recommend Something for Me
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Answer a few quick lifestyle questions and let our expert system recommend a tailored trip.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#D97706] mt-4 flex items-center gap-1">
                    <span>Start Guided Builder</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>

              <div className="pt-6 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                <span>Takes about 2–3 minutes • Free & No obligation to book</span>
              </div>
            </div>
          )}

          {/* DYNAMIC CONVERSATIONAL ADVICE CALLOUT */}
          {step > 0 && !submitted && (
            <div className="bg-[#0D5C75]/10 border border-[#0D5C75]/20 p-4 rounded-xl flex items-start gap-3 animate-fade-in shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#0D5C75] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                FK
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#0D5C75] block mb-0.5">
                  Fungai (Victoria Falls Travel Specialist) says:
                </span>
                <p className="text-gray-700 font-medium leading-relaxed">
                  "{getIntelligentAdvice()}"
                </p>
              </div>
            </div>
          )}

          {/* STEP 1: TRIP VISION */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                  Question 1 of 6
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  What kind of trip are you imagining?
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Select the main vision for your Victoria Falls getaway.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'first-time',
                    title: 'Our first Victoria Falls trip',
                    desc: 'Iconic sights, guided rainforest walk, sunset cruise & zero stress.',
                    icon: '🌊',
                  },
                  {
                    id: 'family',
                    title: 'A family holiday',
                    desc: 'Child-safe activities, family lodges & manageable activity times.',
                    icon: '🐘',
                  },
                  {
                    id: 'romantic',
                    title: 'A romantic escape',
                    desc: 'Riverfront suites, sunset pontoon, helicopter flight & candlelit dining.',
                    icon: '🥂',
                  },
                  {
                    id: 'celebration',
                    title: 'Milestone celebration',
                    desc: 'Honeymoon, anniversary or birthday with VIP special touches.',
                    icon: '🎉',
                  },
                  {
                    id: 'adventure',
                    title: 'Thrill & adventure',
                    desc: 'Batoka gorge swing, Grade 5 white water rafting & Devil’s Pool.',
                    icon: '🚁',
                  },
                  {
                    id: 'inspire',
                    title: 'Inspire me!',
                    desc: 'Curate a well-balanced mix of nature, safaris, and local culture.',
                    icon: '✨',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTripIntent(item.id)}
                    className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      tripIntent === item.id
                        ? 'border-[#0D5C75] bg-[#0D5C75]/10 ring-2 ring-[#0D5C75] shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <span className="text-2xl block mb-2">{item.icon}</span>
                      <h3 className="font-bold text-sm text-[#0D5C75] mb-1 font-serif">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    {tripIntent === item.id && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#D97706]">
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: PARTY & TRAVELLERS */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                  Question 2 of 6
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  Who is travelling with you?
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Tell us who will be joining this trip.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'couple', label: 'Couple / Romance', icon: '💑' },
                  { id: 'family', label: 'Family with Kids', icon: '👨‍👩‍👧‍👦' },
                  { id: 'friends', label: 'Group of Friends', icon: '👯' },
                  { id: 'solo', label: 'Solo Traveller', icon: '🧳' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPartyType(p.id as any);
                      if (p.id === 'family' && kidsCount === 0) setKidsCount(2);
                      if (p.id === 'solo') {
                        setAdultsCount(1);
                        setKidsCount(0);
                      }
                    }}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      partyType === p.id
                        ? 'border-[#0D5C75] bg-[#0D5C75] text-white font-bold shadow-sm'
                        : 'border-gray-200 bg-white text-[#1A2E35] hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{p.icon}</span>
                    <span className="text-xs font-bold block">{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Adult & Child Counters */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-[#0D5C75] block">Adults</span>
                    <span className="text-xs text-gray-500">Ages 12+</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                      className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center font-bold text-lg hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-base w-6 text-center">{adultsCount}</span>
                    <button
                      onClick={() => setAdultsCount(adultsCount + 1)}
                      className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center font-bold text-lg hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6">
                  <div>
                    <span className="font-bold text-sm text-[#0D5C75] block">Children</span>
                    <span className="text-xs text-gray-500">Ages 0 to 11 (Special child rates!)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setKidsCount(Math.max(0, kidsCount - 1))}
                      className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center font-bold text-lg hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-base w-6 text-center">{kidsCount}</span>
                    <button
                      onClick={() => setKidsCount(kidsCount + 1)}
                      className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center font-bold text-lg hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DURATION & DATES */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                  Question 3 of 6
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  When & for how long are you planning to stay?
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Choose your ideal length of stay and target season.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D5C75] uppercase tracking-wider mb-2">
                  Number of Nights
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { nights: 2, label: '2 Nights (3 Days)', badge: 'Short Break' },
                    { nights: 3, label: '3 Nights (4 Days)', badge: 'Most Popular' },
                    { nights: 4, label: '4 Nights (5 Days)', badge: 'Recommended' },
                    { nights: 5, label: '5+ Nights', badge: 'Safari Combo' },
                  ].map((opt) => (
                    <button
                      key={opt.nights}
                      onClick={() => setNightsCount(opt.nights)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        nightsCount === opt.nights
                          ? 'border-[#0D5C75] bg-[#0D5C75] text-white shadow-sm'
                          : 'border-gray-200 bg-white text-[#1A2E35] hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase block text-[#D97706] mb-1">
                        {opt.badge}
                      </span>
                      <span className="font-bold text-sm block">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D5C75] uppercase tracking-wider mb-2">
                  Target Travel Season or Dates
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'flexible',
                      title: 'Flexible Dates',
                      desc: 'Open to recommendations for the best weather and prices.',
                    },
                    {
                      id: 'high-water',
                      title: 'High Water Season (Feb – Jun)',
                      desc: 'Thunderous roar & dramatic spray across the rainforest.',
                    },
                    {
                      id: 'peak-safari',
                      title: 'Peak Safari Season (Jul – Oct)',
                      desc: 'Clear skies & spectacular game viewing in Hwange & Chobe.',
                    },
                    {
                      id: 'low-water',
                      title: 'Low Water & Devil’s Pool (Nov – Jan)',
                      desc: 'Clear gorge views & Devil’s Pool swimming availability.',
                    },
                  ].map((season) => (
                    <button
                      key={season.id}
                      onClick={() => setTravelSeason(season.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        travelSeason === season.id
                          ? 'border-[#0D5C75] bg-[#0D5C75]/10 ring-2 ring-[#0D5C75]'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="font-bold text-xs text-[#0D5C75] block mb-0.5">
                        {season.title}
                      </span>
                      <span className="text-[11px] text-gray-500 leading-normal block">
                        {season.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ACCOMMODATION & STAY STYLE */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                  Question 4 of 6
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  What kind of stay feels right for you?
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Select your preferred accommodation style and key lodge amenities.
                </p>
              </div>

              {/* 4 Rich Visual Stay Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STAY_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setStayTierId(tier.id)}
                    className={`rounded-2xl border-2 overflow-hidden bg-white cursor-pointer transition-all ${
                      stayTierId === tier.id
                        ? 'border-[#0D5C75] ring-2 ring-[#0D5C75] shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="h-36 relative overflow-hidden">
                      <img
                        src={tier.imageUrl}
                        alt={tier.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <h3 className="font-bold font-serif text-base">{tier.name}</h3>
                        <p className="text-[11px] text-gray-200">{tier.tagline}</p>
                      </div>
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                        ~${tier.pricePerNightUSD} / night
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <p className="text-xs text-gray-600 leading-relaxed">{tier.desc}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tier.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* What matters most filter tags */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#0D5C75] uppercase tracking-wider mb-2">
                  What matters most in your accommodation?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Breakfast included',
                    'Close to town',
                    'Swimming pool',
                    'Family rooms',
                    'Quiet location',
                    'Riverfront setting',
                    'On-site spa',
                  ].map((pref) => {
                    const isSelected = stayPreferences.includes(pref);
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => toggleStayPref(pref)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#0D5C75] text-white shadow-2xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {pref}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: VISUAL ACTIVITY CARDS */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                  Question 5 of 6
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  What would you love to experience?
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Tap to add signature activities to your custom itinerary.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACTIVITIES_DATA.map((act) => {
                  const isSelected = selectedActivityIds.includes(act.id);
                  return (
                    <div
                      key={act.id}
                      className={`rounded-2xl border bg-white overflow-hidden shadow-xs transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0D5C75] ring-2 ring-[#0D5C75]/30'
                          : 'border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={act.imageUrl}
                            alt={act.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-3 left-3 bg-[#D97706] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                            {act.badge}
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                            <div>
                              <h3 className="font-bold font-serif text-sm leading-tight text-white">
                                {act.title}
                              </h3>
                              <span className="text-[11px] text-gray-200 block mt-0.5">
                                {act.duration}
                              </span>
                            </div>
                            <span className="font-bold text-sm text-[#D97706] bg-black/50 px-2 py-0.5 rounded-md border border-white/20 whitespace-nowrap">
                              ${act.priceUSD} / person
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {act.shortDesc}
                          </p>
                          <div className="p-2.5 bg-[#0D5C75]/5 rounded-lg border border-[#0D5C75]/10 text-[11px] text-[#0D5C75]">
                            <strong className="block font-bold mb-0.5">Why we recommend:</strong>
                            <span>{act.whyRecommend}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          type="button"
                          onClick={() => toggleActivity(act.id)}
                          className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#3F6B3C] text-white hover:bg-[#345831]'
                              : 'bg-[#0D5C75] text-white hover:bg-[#0A485C]'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>✓ Added to My Holiday</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Add to My Holiday</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: TRANSFERS & LOGISTICS */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                  Question 6 of 6
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  How would you like to travel around Victoria Falls?
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Seamless transfers between Victoria Falls Airport (VFA), lodges & activity points.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'private-transfers',
                    title: 'Private Airport Transfers & Air-Conditioned Chauffeur',
                    desc: 'Dedicated driver waiting for you at the airport arrivals with a sign. Comfort, privacy & zero waiting.',
                    badge: 'Most Popular',
                  },
                  {
                    id: 'shared-shuttle',
                    title: 'Shared Lodge Shuttle Service',
                    desc: 'Comfortable shared air-conditioned shuttles running between hotels, town center, and Falls rainforest.',
                    badge: 'Smart Value',
                  },
                  {
                    id: 'self-drive',
                    title: 'Self-Drive Vehicle Rental',
                    desc: 'Pick up a 4x4 or SUV rental vehicle at Victoria Falls airport for flexible self-guided exploring.',
                    badge: 'Independent',
                  },
                  {
                    id: 'undecided',
                    title: 'Undecided — Ask Specialist for Recommendation',
                    desc: 'We will suggest the best option based on your final accommodation location and party size.',
                    badge: 'Advice Needed',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTransportType(opt.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                      transportType === opt.id
                        ? 'border-[#0D5C75] bg-[#0D5C75]/10 ring-2 ring-[#0D5C75]'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm text-[#0D5C75] block mb-0.5">
                        {opt.title}
                      </span>
                      <p className="text-xs text-gray-600 leading-relaxed">{opt.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#D97706] bg-[#D97706]/10 px-2.5 py-1 rounded-full shrink-0">
                      {opt.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: DAY-BY-DAY SUGGESTED ITINERARY & REVIEW */}
          {step === 7 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                  Preview & Review
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  Your Victoria Falls Escape Plan
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Here is your custom day-by-day suggested schedule based on your choices.
                </p>
              </div>

              {/* Day-By-Day Itinerary Visual Preview */}
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-[#0D5C75] uppercase tracking-wider pb-2 border-b border-gray-200">
                    Suggested Day-by-Day Schedule ({nightsCount} Nights / {nightsCount + 1} Days)
                  </h3>

                  {/* Day 1 */}
                  <div className="flex gap-3 items-start">
                    <div className="w-16 text-center shrink-0">
                      <span className="bg-[#0D5C75] text-white text-xs font-bold px-2 py-1 rounded-md block">
                        DAY 1
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-[#1A2E35]">Arrival & Sunset River Cruise</h4>
                      <p className="text-gray-600">
                        Airport pickup → Lodge Check-in ({selectedStayTierObj.name}) → In the late afternoon, embark on the Zambezi Sunset River Cruise with drinks & tapas.
                      </p>
                    </div>
                  </div>

                  {/* Day 2 */}
                  <div className="flex gap-3 items-start pt-3 border-t border-gray-100">
                    <div className="w-16 text-center shrink-0">
                      <span className="bg-[#0D5C75] text-white text-xs font-bold px-2 py-1 rounded-md block">
                        DAY 2
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-[#1A2E35]">Mosi-oa-Tunya Falls & Cultural Evening</h4>
                      <p className="text-gray-600">
                        Morning Guided Rainforest Tour of Victoria Falls → Lunch at Lookout Café overlooking Batoka Gorge → Evening Boma Dinner & Drum Show experience.
                      </p>
                    </div>
                  </div>

                  {/* Day 3+ */}
                  {nightsCount >= 3 && (
                    <div className="flex gap-3 items-start pt-3 border-t border-gray-100">
                      <div className="w-16 text-center shrink-0">
                        <span className="bg-[#0D5C75] text-white text-xs font-bold px-2 py-1 rounded-md block">
                          DAY 3
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-[#1A2E35]">Safari Excursion or Free Leisure</h4>
                        <p className="text-gray-600">
                          Full-day Chobe Safari / Helicopter Flight of Angels OR relax at your lodge pool with craft market shopping.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Departure Day */}
                  <div className="flex gap-3 items-start pt-3 border-t border-gray-100">
                    <div className="w-16 text-center shrink-0">
                      <span className="bg-[#D97706] text-white text-xs font-bold px-2 py-1 rounded-md block">
                        FINAL
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-[#1A2E35]">Leisure Morning & Airport Transfer</h4>
                      <p className="text-gray-600">
                        Gourmet breakfast → Souvenir craft shopping → Private driver transfer to Victoria Falls Airport.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transparent Price Breakdown */}
                <div className="bg-[#0D5C75]/10 p-5 rounded-2xl border border-[#0D5C75]/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#0D5C75]/20">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#0D5C75]">
                      Estimated Budget Range
                    </span>
                    <span className="text-2xl font-extrabold text-[#0D5C75]">
                      ${estimatedMinUSD} – ${estimatedMaxUSD} USD
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-700">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Accommodation ({nightsCount} nights):</span>
                      <strong className="text-[#0D5C75]">~${accommodationCostMin} USD</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">
                        Activities ({selectedActivitiesList.length} experiences):
                      </span>
                      <strong className="text-[#0D5C75]">~${activitiesCost} USD</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Transfers & Fees:</span>
                      <strong className="text-[#0D5C75]">~${transferCost} USD</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 italic pt-1 border-t border-[#0D5C75]/10">
                    *Based on {adultsCount} adults, {kidsCount} children, {nightsCount} nights, and {selectedActivitiesList.length} selected experiences. This is a planning estimate; a local specialist will confirm exact live availability before payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: SAVE & HANDOVER */}
          {step === 8 && (
            <div className="space-y-6 animate-fade-in">
              {submitted ? (
                <div className="text-center py-8 space-y-4 max-w-lg mx-auto bg-white p-8 rounded-3xl border border-gray-200 shadow-lg">
                  <div className="w-16 h-16 bg-[#3F6B3C]/10 text-[#3F6B3C] rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-[#0D5C75]">
                    Your Victoria Falls Plan is Ready!
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Thank you, <strong className="text-[#0D5C75]">{fullName || 'Valued Guest'}</strong>. Our senior Victoria Falls travel concierge is reviewing your selections now and will send your itemized itinerary quote shortly.
                  </p>

                  <div className="p-4 bg-[#FDFBF7] rounded-xl border border-gray-200 text-left text-xs space-y-1.5">
                    <p><strong>Party:</strong> {adultsCount} Adults, {kidsCount} Kids ({partyType})</p>
                    <p><strong>Duration:</strong> {nightsCount} Nights ({selectedStayTierObj.name})</p>
                    <p><strong>Experiences ({selectedActivitiesList.length}):</strong> {selectedActivitiesList.map(a => a.title).join(', ')}</p>
                    <p><strong>Estimated Total Range:</strong> ${estimatedMinUSD} - ${estimatedMaxUSD} USD</p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <a
                      href={buildWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat on WhatsApp Now</span>
                    </a>

                    <button
                      onClick={onClose}
                      className="flex-1 bg-[#0D5C75] text-white font-bold text-xs py-3 px-4 rounded-xl hover:bg-[#0A485C]"
                    >
                      Return to Website
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                      Final Step
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                      Where should we send your custom itinerary?
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                      No obligation to book. Choose your preferred way to receive your plan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Farai Ndlovu"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D5C75] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D5C75] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        WhatsApp / Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+263 77 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D5C75] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Special Requests or Dietary Preferences
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Vegetarian meals, honeymoon surprise..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D5C75] outline-none"
                      />
                    </div>
                  </div>

                  {/* Primary Handover Options */}
                  <div className="pt-4 space-y-3">
                    <button
                      type="submit"
                      className="w-full bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Me My Custom Itinerary Quote</span>
                    </button>

                    <a
                      href={buildWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Directly to WhatsApp</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* BACK & NEXT NAVIGATION BUTTONS BAR */}
          {step > 0 && !submitted && (
            <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(Math.max(1, step - 1))}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(Math.min(8, step + 1))}
                className="px-8 py-3 rounded-xl bg-[#0D5C75] hover:bg-[#0A485C] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all"
              >
                <span>{step === 7 ? 'Continue to Send Plan' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT / DESKTOP: LIVE "MY HOLIDAY" SUMMARY PANEL */}
        {step > 0 && !submitted && (
          <aside className="hidden lg:block w-80 bg-white border-l border-gray-200 p-6 shrink-0 space-y-6 overflow-y-auto">
            <div>
              <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                Live Itinerary Builder
              </span>
              <h3 className="font-serif font-bold text-lg text-[#0D5C75]">
                My Victoria Falls Holiday
              </h3>
            </div>

            {/* Dynamic Hero Photo Card */}
            <div className="relative h-32 rounded-xl overflow-hidden shadow-xs">
              <img
                src={getIntentHeroPhoto()}
                alt="Victoria Falls Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-2 left-3 right-3 text-white text-xs font-bold">
                {nightsCount} Nights • {selectedStayTierObj.name}
              </div>
            </div>

            {/* Progress status */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-[#0D5C75]">
                <span>Progress:</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#D97706] h-1.5 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Live Selections */}
            <div className="space-y-3 text-xs">
              <div>
                <strong className="block text-[#0D5C75] text-[11px] uppercase tracking-wider mb-0.5">
                  Party:
                </strong>
                <span className="text-gray-700">
                  {adultsCount} Adults, {kidsCount} Kids ({partyType})
                </span>
              </div>

              <div>
                <strong className="block text-[#0D5C75] text-[11px] uppercase tracking-wider mb-0.5">
                  Accommodation Tier:
                </strong>
                <span className="text-gray-700">{selectedStayTierObj.name}</span>
              </div>

              <div>
                <strong className="block text-[#0D5C75] text-[11px] uppercase tracking-wider mb-1">
                  Selected Experiences ({selectedActivitiesList.length}):
                </strong>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedActivitiesList.map((act) => (
                    <li
                      key={act.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200 text-[11px]"
                    >
                      <span className="line-clamp-1 font-medium">{act.title}</span>
                      <button
                        onClick={() => toggleActivity(act.id)}
                        className="text-gray-400 hover:text-red-500 font-bold ml-1 text-sm"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Estimated Total Range Card */}
            <div className="p-4 bg-[#0D5C75] text-white rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/80 block">
                Estimated Budget Range
              </span>
              <span className="text-xl font-bold font-serif block">
                ${estimatedMinUSD} – ${estimatedMaxUSD} USD
              </span>
              <span className="text-[10px] text-white/70 block">
                Total for all {totalGuests} guests ({nightsCount} nights)
              </span>
            </div>
          </aside>
        )}
      </div>

      {/* MOBILE BOTTOM COLLAPSIBLE SUMMARY BAR */}
      {step > 0 && !submitted && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
          <button
            onClick={() => setMobileSummaryExpanded(!mobileSummaryExpanded)}
            className="w-full p-3 bg-[#0D5C75] text-white flex items-center justify-between text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span>
                My Holiday Range: ${estimatedMinUSD} – ${estimatedMaxUSD} USD
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#D97706]">
              <span>{selectedActivitiesList.length} Experiences</span>
              {mobileSummaryExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </div>
          </button>

          {mobileSummaryExpanded && (
            <div className="p-4 space-y-2 bg-gray-50 text-xs max-h-48 overflow-y-auto">
              <p>
                <strong>Party:</strong> {adultsCount} Adults, {kidsCount} Kids
              </p>
              <p>
                <strong>Stay:</strong> {selectedStayTierObj.name} ({nightsCount} Nights)
              </p>
              <p>
                <strong>Activities:</strong>{' '}
                {selectedActivitiesList.map((a) => a.title).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
