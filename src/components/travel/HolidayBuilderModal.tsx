import { editorialFormat } from "../../runtime/catalog";
import { useSubmission, SubmissionSafety } from '../common/SubmissionSafety';
import { ACTIVITIES_DATA, STAY_TIERS, ALL_EXPERIENCES } from '../../runtime/catalog';
import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { getWhatsAppUrl } from '../../utils/whatsapp';
import React,{ useState,useEffect } from 'react';
import { TravelPackage } from '../../types';
import {
X,
Check,
ArrowRight,
ArrowLeft,Sparkles,
ShieldCheck,
Send,
MessageSquare,Plus,ChevronDown,
ChevronUp
} from 'lucide-react';
import { DetailedAccommodation } from '../../data/accommodationsData';

// Public image paths for experiences
let fallsTour1: any;
registerContent(() => { fallsTour1 = editorialValue("travel/HolidayBuilderModal.fallsTour1", {}); });
let cruise1: any;
registerContent(() => { cruise1 = editorialValue("travel/HolidayBuilderModal.cruise1", {}); });




let bungee1: any;
registerContent(() => { bungee1 = editorialValue("travel/HolidayBuilderModal.bungee1", {}); });
let gameDrive10: any;
registerContent(() => { gameDrive10 = editorialValue("travel/HolidayBuilderModal.gameDrive10", {}); });
let outboundLogo: any;
registerContent(() => { outboundLogo = editorialValue("travel/HolidayBuilderModal.outboundLogo", {}); });

interface HolidayBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPackage?: TravelPackage | null;
  preselectedActivity?: string | null;
  preselectedAccommodation?: DetailedAccommodation | null;
}


export { ACTIVITIES_DATA, STAY_TIERS } from '../../runtime/catalog';
export const HolidayBuilderModal: React.FC<HolidayBuilderModalProps> = ({
  isOpen,
  onClose,
  preselectedPackage,
  preselectedActivity,
  preselectedAccommodation,
}) => {
  // Navigation & Step state
  const [step, setStep] = useState<number>(0); // 0 = Entry mode selection, 1 = Intent, 2 = Party, 3 = Timing, 4 = Stay, 5 = Activities, 6 = Logistics, 7 = Itinerary Review, 8 = Contact

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

  const submission = useSubmission('enquiries');
  const [marketingConsent,setMarketingConsent] = useState(false);
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
      } else if (preselectedAccommodation) {
        setStep(4);
        if (preselectedAccommodation.priceFromUSD > 400) {
          setStayTierId('premium-escape');
        } else if (preselectedAccommodation.priceFromUSD > 250) {
          setStayTierId('comfort-plus');
        } else {
          setStayTierId('smart-value');
        }
        setStayPreferences(prev => Array.from(new Set([...prev, `Preselected Property: ${preselectedAccommodation.name}`])));
      } else if (preselectedActivity) {
        setStep(5);
        const match = ACTIVITIES_DATA.find(
          (a) => a.title.toLowerCase().includes(preselectedActivity.toLowerCase()) || a.id === preselectedActivity
        );
        if (match) {
          setSelectedActivityIds((ids) => ids.includes(match.id) ? ids : [...ids, match.id]);
        }
      }
    }
  }, [isOpen, preselectedPackage, preselectedActivity, preselectedAccommodation]);

  if (!isOpen) return null;
  if(!STAY_TIERS.length)return <div className="fixed inset-0 z-50 bg-white grid place-content-center p-8 text-center gap-4"><h1>Holiday planning options are currently unavailable</h1><p>No published stay options are available. Please contact our specialists or try again later.</p><button onClick={onClose}>Close</button></div>;

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

  // Planning assumptions: two guests per room; room allocation must be confirmed.
  const totalGuests = adultsCount + kidsCount;
  const roomFactor = Math.ceil(totalGuests / 2);
  const accommodationCostMin = (preselectedAccommodation?.priceFromUSD ?? selectedStayTierObj.pricePerNightUSD) * nightsCount * roomFactor;

  const activitiesCost = selectedActivitiesList.reduce((acc, act) => {
    const adultTotal = act.priceUSD * adultsCount;
    const kidsTotal = act.priceUSD * 0.8 * kidsCount; // Estimate only: assumed 20% child discount; supplier age/rate rules vary.
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
        return editorial("travel/HolidayBuilderModal.text49");
      }
      if (tripIntent === 'romantic') {
        return editorial("travel/HolidayBuilderModal.text50");
      }
      if (tripIntent === 'first-time') {
        return editorial("travel/HolidayBuilderModal.text51");
      }
      if (tripIntent === 'adventure') {
        return editorial("travel/HolidayBuilderModal.text52");
      }
      return editorial("travel/HolidayBuilderModal.text53");
    }

    if (step === 2) {
      if (partyType === 'family' || kidsCount > 0) {
        return editorialFormat("travel/HolidayBuilderModal.copy1", [adultsCount,kidsCount,kidsCount > 1 ? 'ren' : '']);
      }
      if (partyType === 'couple') {
        return editorial("travel/HolidayBuilderModal.text54");
      }
      return editorialFormat("travel/HolidayBuilderModal.copy2", [adultsCount]);
    }

    if (step === 3) {
      if (nightsCount === 2) {
        return editorial("travel/HolidayBuilderModal.text55");
      }
      if (nightsCount === 3) {
        return editorial("travel/HolidayBuilderModal.text56");
      }
      if (nightsCount >= 4) {
        return editorialFormat("travel/HolidayBuilderModal.copy3", [nightsCount]);
      }
    }

    if (step === 4) {
      return `${selectedStayTierObj.name} selected. ${selectedStayTierObj.desc}`;
    }

    if (step === 5) {
      if (selectedActivityIds.length === 0) {
        return editorial("travel/HolidayBuilderModal.text57");
      }
      if (nightsCount <= 2 && selectedActivityIds.length > 3) {
        return editorialFormat("travel/HolidayBuilderModal.copy4", [selectedActivityIds.length]);
      }
      if (partyType === 'family' && selectedActivityIds.includes('act-gorge-swing')) {
        return editorial("travel/HolidayBuilderModal.text58");
      }
      if (!selectedActivityIds.includes('act-guided-falls')) {
        return editorial("travel/HolidayBuilderModal.text59");
      }
      return editorialFormat("travel/HolidayBuilderModal.copy5", [selectedActivityIds.length,selectedActivityIds.length > 1 ? 's' : '']);
    }

    return editorial("travel/HolidayBuilderModal.text60");
  };

  // WhatsApp Link Builder
  const buildWhatsAppLink = () => {
    const actNames = selectedActivitiesList.map((a) => a.title).join(', ');
    const message = `Hi Outbound Holidays! I built my custom Victoria Falls holiday on your website:\n\n` +
      `*Trip Style:* ${selectedStayTierObj.name}\n` +
      `*Party:* ${adultsCount} Adults, ${kidsCount} Kids (${partyType})\n` +
      `*Duration:* ${nightsCount} Nights / ${nightsCount + 1} Days\n` +
      `*Experiences (${selectedActivitiesList.length}):* ${actNames || 'To be selected'}\n` +
      `*Estimated Range:* $${estimatedMinUSD} - $${estimatedMaxUSD} USD\n\n` +
      editorialFormat("travel/HolidayBuilderModal.copy6", [travelSeason,fullName || 'Guest']);
    return getWhatsAppUrl(message);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved=await submission.save({name:fullName,email,phone,message:notes,source:'holiday-builder',marketingConsent,trip:{preferredContact:'email',displayedEstimate:{minimumUSD:estimatedMinUSD,maximumUSD:estimatedMaxUSD,currency:'USD',clientUnverified:true},itineraryDraft:[{day:editorial('travel/HolidayBuilderModal.text151'),title:editorial('travel/HolidayBuilderModal.text152'),description:editorial('travel/HolidayBuilderModal.text153')+selectedStayTierObj.name+editorial('travel/HolidayBuilderModal.text154')},{day:editorial('travel/HolidayBuilderModal.text155'),title:editorial('travel/HolidayBuilderModal.text156'),description:editorial('travel/HolidayBuilderModal.text157')},...(nightsCount>=3?[{day:editorial('travel/HolidayBuilderModal.text158'),title:editorial('travel/HolidayBuilderModal.text159'),description:editorial('travel/HolidayBuilderModal.text160')}]:[]),{day:editorial('travel/HolidayBuilderModal.text161'),title:editorial('travel/HolidayBuilderModal.text162'),description:editorial('travel/HolidayBuilderModal.text163')}],intent:tripIntent,partyType,adults:adultsCount,children:kidsCount,nights:nightsCount,travelDates:travelSeason,stayTierId,stayPreferences,activityIds:selectedActivityIds,experienceIds:preselectedActivity?[preselectedActivity]:[],transportType,accommodationId:preselectedAccommodation?.id,packageId:preselectedPackage?.id}});
    if(saved)setSubmitted(true);
  };

  // Dynamic Theme Background photo based on trip intent
  const getIntentHeroPhoto = () => {
    if (tripIntent === 'romantic')
      return cruise1;
    if (tripIntent === 'family')
      return gameDrive10;
    if (tripIntent === 'adventure')
      return bungee1;
    return fallsTour1;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col overflow-hidden animate-fade-in text-[#1A2E35]">
      {preselectedActivity&&<p className="bg-blue-50 px-4 py-2 text-sm">Requested experience: {ALL_EXPERIENCES.find(e=>e.id===preselectedActivity)?.title??preselectedActivity}. Your specialist will include this request in the quote; additional catalogue experiences are priced separately from the builder estimate.</p>}
      {/* 1. IMMERSIVE TOP NAVIGATION BAR */}
      <header className="bg-[#0D5C75] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0 shadow-md">
          <div className="flex items-center">
            <img src={outboundLogo} alt={editorial("travel/HolidayBuilderModal.text61")} className="h-12 sm:h-14 w-auto object-contain" />
          </div>

        {/* Step Indicator */}
        {step > 0 && !submitted && (
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>
              {editorial("travel/HolidayBuilderModal.text62")}{step} {editorial("travel/HolidayBuilderModal.text63")}{' '}
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
          <span>{editorial("travel/HolidayBuilderModal.text64")}</span>
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
                <span>{editorial("travel/HolidayBuilderModal.text65")}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold font-serif text-[#0D5C75] leading-tight">
                {editorial("travel/HolidayBuilderModal.text66")}</h1>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                {editorial("travel/HolidayBuilderModal.text67")}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => {
                    setStep(4); // Jump directly to Stay & Activities
                  }}
                  className="p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#0D5C75] hover:shadow-lg transition-all text-left group flex flex-col justify-between"
                >
                  <div>
                    <span className="w-10 h-10 rounded-xl bg-[#0D5C75]/10 text-[#0D5C75] flex items-center justify-center font-bold text-lg mb-3 group-hover:bg-[#0D5C75] group-hover:text-white transition-colors">
                      🎯
                    </span>
                    <h3 className="font-bold font-serif text-lg text-[#0D5C75] mb-1">
                      {editorial("travel/HolidayBuilderModal.text68")}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {editorial("travel/HolidayBuilderModal.text69")}</p>
                  </div>
                  <span className="text-xs font-bold text-[#0D5C75] mt-4 flex items-center gap-1">
                    <span>{editorial("travel/HolidayBuilderModal.text70")}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <button
                  onClick={() => {
                    setStep(1); // Full guided lifestyle questions
                  }}
                  className="p-6 rounded-2xl border-2 border-[#D97706] bg-[#D97706]/5 hover:bg-[#D97706]/10 hover:shadow-lg transition-all text-left group flex flex-col justify-between relative"
                >
                  <span className="absolute top-3 right-3 bg-[#D97706] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {editorial("travel/HolidayBuilderModal.text71")}</span>
                  <div>
                    <span className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center font-bold text-lg mb-3">
                      ✨
                    </span>
                    <h3 className="font-bold font-serif text-lg text-[#0D5C75] mb-1">
                      {editorial("travel/HolidayBuilderModal.text72")}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {editorial("travel/HolidayBuilderModal.text73")}</p>
                  </div>
                  <span className="text-xs font-bold text-[#D97706] mt-4 flex items-center gap-1">
                    <span>{editorial("travel/HolidayBuilderModal.text74")}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>

              <div className="pt-6 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                <span>{editorial("travel/HolidayBuilderModal.text75")}</span>
              </div>
            </div>
          )}

          {/* DYNAMIC CONVERSATIONAL ADVICE CALLOUT */}
          {step > 0 && !submitted && (
            <div className="bg-[#0D5C75]/10 border border-[#0D5C75]/20 p-4 rounded-xl flex items-start gap-3 animate-fade-in shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#0D5C75] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                {editorial("travel/HolidayBuilderModal.text76")}</div>
              <div className="text-xs">
                <span className="font-bold text-[#0D5C75] block mb-0.5">
                  {editorial("travel/HolidayBuilderModal.text77")}</span>
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
                  {editorial("travel/HolidayBuilderModal.text78")}</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  {editorial("travel/HolidayBuilderModal.text79")}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {editorial("travel/HolidayBuilderModal.text80")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {editorialValue("travel/HolidayBuilderModal.section1", {}).map((item) => (
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
                        <span>{editorial("travel/HolidayBuilderModal.text93")}</span>
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
                  {editorial("travel/HolidayBuilderModal.text94")}</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  {editorial("travel/HolidayBuilderModal.text95")}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {editorial("travel/HolidayBuilderModal.text96")}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(editorialValue("travel/HolidayBuilderModal.section2", {})).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPartyType(p.id);
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
                    <span className="font-bold text-sm text-[#0D5C75] block">{editorial("travel/HolidayBuilderModal.text101")}</span>
                    <span className="text-xs text-gray-500">{editorial("travel/HolidayBuilderModal.text102")}</span>
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
                    <span className="font-bold text-sm text-[#0D5C75] block">{editorial("travel/HolidayBuilderModal.text103")}</span>
                    <span className="text-xs text-gray-500">{editorial("travel/HolidayBuilderModal.text104")}</span>
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
                  {editorial("travel/HolidayBuilderModal.text105")}</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  {editorial("travel/HolidayBuilderModal.text106")}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {editorial("travel/HolidayBuilderModal.text107")}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D5C75] uppercase tracking-wider mb-2">
                  {editorial("travel/HolidayBuilderModal.text108")}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {editorialValue("travel/HolidayBuilderModal.section3", {}).map((opt) => (
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
                  {editorial("travel/HolidayBuilderModal.text113")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {editorialValue("travel/HolidayBuilderModal.section4", {}).map((season) => (
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
                  {editorial("travel/HolidayBuilderModal.text122")}</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  {editorial("travel/HolidayBuilderModal.text123")}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {editorial("travel/HolidayBuilderModal.text124")}</p>
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
                        ~${tier.pricePerNightUSD} {editorial("travel/HolidayBuilderModal.text125")}</div>
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
                  {editorial("travel/HolidayBuilderModal.text126")}</label>
                <div className="flex flex-wrap gap-2">
                  {editorialValue("travel/HolidayBuilderModal.section5", {}).map((pref) => {
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
                  {editorial("travel/HolidayBuilderModal.text127")}</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  {editorial("travel/HolidayBuilderModal.text128")}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {editorial("travel/HolidayBuilderModal.text129")}</p>
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
                              ${act.priceUSD} {editorial("travel/HolidayBuilderModal.text130")}</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {act.shortDesc}
                          </p>
                          <div className="p-2.5 bg-[#0D5C75]/5 rounded-lg border border-[#0D5C75]/10 text-[11px] text-[#0D5C75]">
                            <strong className="block font-bold mb-0.5">{editorial("travel/HolidayBuilderModal.text131")}</strong>
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
                              <span>{editorial("travel/HolidayBuilderModal.text132")}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>{editorial("travel/HolidayBuilderModal.text133")}</span>
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
                  {editorial("travel/HolidayBuilderModal.text134")}</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  {editorial("travel/HolidayBuilderModal.text135")}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {editorial("travel/HolidayBuilderModal.text136")}</p>
              </div>

              <div className="space-y-3">
                {editorialValue("travel/HolidayBuilderModal.section6", {}).map((opt) => (
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
                  {editorial("travel/HolidayBuilderModal.text145")}</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                  {editorial("travel/HolidayBuilderModal.text146")}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {editorial("travel/HolidayBuilderModal.text147")}</p>
              </div>

              {/* Day-By-Day Itinerary Visual Preview */}
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-[#0D5C75] uppercase tracking-wider pb-2 border-b border-gray-200">
                    {editorial("travel/HolidayBuilderModal.text148")}{nightsCount} {editorial("travel/HolidayBuilderModal.text149")}{nightsCount + 1} {editorial("travel/HolidayBuilderModal.text150")}</h3>

                  {/* Day 1 */}
                  <div className="flex gap-3 items-start">
                    <div className="w-16 text-center shrink-0">
                      <span className="bg-[#0D5C75] text-white text-xs font-bold px-2 py-1 rounded-md block">
                        {editorial("travel/HolidayBuilderModal.text151")}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-[#1A2E35]">{editorial("travel/HolidayBuilderModal.text152")}</h4>
                      <p className="text-gray-600">
                        {editorial("travel/HolidayBuilderModal.text153")}{selectedStayTierObj.name}{editorial("travel/HolidayBuilderModal.text154")}</p>
                    </div>
                  </div>

                  {/* Day 2 */}
                  <div className="flex gap-3 items-start pt-3 border-t border-gray-100">
                    <div className="w-16 text-center shrink-0">
                      <span className="bg-[#0D5C75] text-white text-xs font-bold px-2 py-1 rounded-md block">
                        {editorial("travel/HolidayBuilderModal.text155")}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-[#1A2E35]">{editorial("travel/HolidayBuilderModal.text156")}</h4>
                      <p className="text-gray-600">
                        {editorial("travel/HolidayBuilderModal.text157")}</p>
                    </div>
                  </div>

                  {/* Day 3+ */}
                  {nightsCount >= 3 && (
                    <div className="flex gap-3 items-start pt-3 border-t border-gray-100">
                      <div className="w-16 text-center shrink-0">
                        <span className="bg-[#0D5C75] text-white text-xs font-bold px-2 py-1 rounded-md block">
                          {editorial("travel/HolidayBuilderModal.text158")}</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-[#1A2E35]">{editorial("travel/HolidayBuilderModal.text159")}</h4>
                        <p className="text-gray-600">
                          {editorial("travel/HolidayBuilderModal.text160")}</p>
                      </div>
                    </div>
                  )}

                  {/* Departure Day */}
                  <div className="flex gap-3 items-start pt-3 border-t border-gray-100">
                    <div className="w-16 text-center shrink-0">
                      <span className="bg-[#D97706] text-white text-xs font-bold px-2 py-1 rounded-md block">
                        {editorial("travel/HolidayBuilderModal.text161")}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-bold text-[#1A2E35]">{editorial("travel/HolidayBuilderModal.text162")}</h4>
                      <p className="text-gray-600">
                        {editorial("travel/HolidayBuilderModal.text163")}</p>
                    </div>
                  </div>
                </div>

                {/* Transparent Price Breakdown */}
                <div className="bg-[#0D5C75]/10 p-5 rounded-2xl border border-[#0D5C75]/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#0D5C75]/20">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#0D5C75]">
                      {editorial("travel/HolidayBuilderModal.text164")}</span>
                    <span className="text-2xl font-extrabold text-[#0D5C75]">
                      ${estimatedMinUSD} – ${estimatedMaxUSD} {editorial("travel/HolidayBuilderModal.text165")}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-700">
                    <div>
                      <span className="text-gray-500 block text-[10px]">{editorial("travel/HolidayBuilderModal.text166")}{nightsCount} {editorial("travel/HolidayBuilderModal.text167")}</span>
                      <strong className="text-[#0D5C75]">~${accommodationCostMin} {editorial("travel/HolidayBuilderModal.text168")}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">
                        {editorial("travel/HolidayBuilderModal.text169")}{selectedActivitiesList.length} {editorial("travel/HolidayBuilderModal.text170")}</span>
                      <strong className="text-[#0D5C75]">~${activitiesCost} {editorial("travel/HolidayBuilderModal.text171")}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">{editorial("travel/HolidayBuilderModal.text172")}</span>
                      <strong className="text-[#0D5C75]">~${transferCost} {editorial("travel/HolidayBuilderModal.text173")}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 italic pt-1 border-t border-[#0D5C75]/10">
                    {editorial("travel/HolidayBuilderModal.text174")}{adultsCount} {editorial("travel/HolidayBuilderModal.text175")}{kidsCount} {editorial("travel/HolidayBuilderModal.text176")}{nightsCount} {editorial("travel/HolidayBuilderModal.text177")}{selectedActivitiesList.length} {editorial("travel/HolidayBuilderModal.text178")}</p>
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
                    {editorial("travel/HolidayBuilderModal.text179")}</h3>
<p className="font-semibold" role="status">Saved enquiry reference: {submission.result?.reference}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {editorial("travel/HolidayBuilderModal.text180")}<strong className="text-[#0D5C75]">{fullName || 'Valued Guest'}</strong>{editorial("travel/HolidayBuilderModal.text181")}</p>

                  <div className="p-4 bg-[#FDFBF7] rounded-xl border border-gray-200 text-left text-xs space-y-1.5">
                    <p><strong>{editorial("travel/HolidayBuilderModal.text182")}</strong> {adultsCount} {editorial("travel/HolidayBuilderModal.text183")}{kidsCount} {editorial("travel/HolidayBuilderModal.text184")}{partyType})</p>
                    <p><strong>{editorial("travel/HolidayBuilderModal.text185")}</strong> {nightsCount} {editorial("travel/HolidayBuilderModal.text186")}{selectedStayTierObj.name})</p>
                    <p><strong>{editorial("travel/HolidayBuilderModal.text187")}{selectedActivitiesList.length}):</strong> {selectedActivitiesList.map(a => a.title).join(', ')}</p>
                    <p><strong>{editorial("travel/HolidayBuilderModal.text188")}</strong> ${estimatedMinUSD} - ${estimatedMaxUSD} {editorial("travel/HolidayBuilderModal.text189")}</p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <a
                      href={buildWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{editorial("travel/HolidayBuilderModal.text190")}</span>
                    </a>

                    <button
                      onClick={onClose}
                      className="flex-1 bg-[#0D5C75] text-white font-bold text-xs py-3 px-4 rounded-xl hover:bg-[#0A485C]"
                    >
                      {editorial("travel/HolidayBuilderModal.text191")}</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
                      {editorial("travel/HolidayBuilderModal.text192")}</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75]">
                      {editorial("travel/HolidayBuilderModal.text193")}</h2>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                      {editorial("travel/HolidayBuilderModal.text194")}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {editorial("travel/HolidayBuilderModal.text195")}</label>
                      <input
                        type="text"
                        required
                        placeholder={editorial("travel/HolidayBuilderModal.text196")}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D5C75] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {editorial("travel/HolidayBuilderModal.text197")}</label>
                      <input
                        type="email"
                        required
                        placeholder={editorial("travel/HolidayBuilderModal.text198")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D5C75] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {editorial("travel/HolidayBuilderModal.text199")}</label>
                      <input
                        type="tel"
                        placeholder={editorial("travel/HolidayBuilderModal.text200")}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D5C75] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {editorial("travel/HolidayBuilderModal.text201")}</label>
                      <input
                        type="text"
                        placeholder={editorial("travel/HolidayBuilderModal.text202")}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D5C75] outline-none"
                      />
                    </div>
                  </div>

                  {/* Primary Handover Options */}
                  <div className="pt-4 space-y-3">
                    <button
                      type="submit" disabled={submission.pending || false} aria-busy={submission.pending}
                      className="w-full bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>{editorial("travel/HolidayBuilderModal.text203")}</span>
                    </button>

                    <a
                      href={buildWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{editorial("travel/HolidayBuilderModal.text204")}</span>
                    </a>
                  </div>
                <div className="w-full"><SubmissionSafety submission={submission} marketingConsent={marketingConsent} onConsent={setMarketingConsent} requireConsent={false} /></div></form>
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
                <span>{editorial("travel/HolidayBuilderModal.text205")}</span>
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
                {editorial("travel/HolidayBuilderModal.text206")}</span>
              <h3 className="font-serif font-bold text-lg text-[#0D5C75]">
                {editorial("travel/HolidayBuilderModal.text207")}</h3>
            </div>

            {/* Dynamic Hero Photo Card */}
            <div className="relative h-32 rounded-xl overflow-hidden shadow-xs">
              <img
                src={getIntentHeroPhoto()}
                alt={editorial("travel/HolidayBuilderModal.text208")}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-2 left-3 right-3 text-white text-xs font-bold">
                {nightsCount} {editorial("travel/HolidayBuilderModal.text209")}{selectedStayTierObj.name}
              </div>
            </div>

            {/* Progress status */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-[#0D5C75]">
                <span>{editorial("travel/HolidayBuilderModal.text210")}</span>
                <span>{progressPercent}{editorial("travel/HolidayBuilderModal.text211")}</span>
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
                  {editorial("travel/HolidayBuilderModal.text212")}</strong>
                <span className="text-gray-700">
                  {adultsCount} {editorial("travel/HolidayBuilderModal.text213")}{kidsCount} {editorial("travel/HolidayBuilderModal.text214")}{partyType})
                </span>
              </div>

              <div>
                <strong className="block text-[#0D5C75] text-[11px] uppercase tracking-wider mb-0.5">
                  {editorial("travel/HolidayBuilderModal.text215")}</strong>
                <span className="text-gray-700">{selectedStayTierObj.name}</span>
              </div>

              <div>
                <strong className="block text-[#0D5C75] text-[11px] uppercase tracking-wider mb-1">
                  {editorial("travel/HolidayBuilderModal.text216")}{selectedActivitiesList.length}):
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
                {editorial("travel/HolidayBuilderModal.text217")}</span>
              <span className="text-xl font-bold font-serif block">
                ${estimatedMinUSD} – ${estimatedMaxUSD} {editorial("travel/HolidayBuilderModal.text218")}</span>
              <span className="text-[10px] text-white/70 block">
                {editorial("travel/HolidayBuilderModal.text219")}{totalGuests} {editorial("travel/HolidayBuilderModal.text220")}{nightsCount} {editorial("travel/HolidayBuilderModal.text221")}</span>
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
                {editorial("travel/HolidayBuilderModal.text222")}{estimatedMinUSD} – ${estimatedMaxUSD} {editorial("travel/HolidayBuilderModal.text223")}</span>
            </div>
            <div className="flex items-center gap-1 text-[#D97706]">
              <span>{selectedActivitiesList.length} {editorial("travel/HolidayBuilderModal.text224")}</span>
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
                <strong>{editorial("travel/HolidayBuilderModal.text225")}</strong> {adultsCount} {editorial("travel/HolidayBuilderModal.text226")}{kidsCount} {editorial("travel/HolidayBuilderModal.text227")}</p>
              <p>
                <strong>{editorial("travel/HolidayBuilderModal.text228")}</strong> {selectedStayTierObj.name} ({nightsCount} {editorial("travel/HolidayBuilderModal.text229")}</p>
              <p>
                <strong>{editorial("travel/HolidayBuilderModal.text230")}</strong>{' '}
                {selectedActivitiesList.map((a) => a.title).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
