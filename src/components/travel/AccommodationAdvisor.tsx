import React, { useState } from 'react';
import { ALL_ACCOMMODATIONS, DetailedAccommodation } from '../../data/accommodationsData';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  Star, 
  MapPin, 
  Clock, 
  CalendarCheck, 
  MessageCircle, 
  Info,
  Check,
  RotateCcw,
  Sliders,
  Compass,
  Heart,
  Users,
  DollarSign,
  Home,
  CheckSquare,
  Square
} from 'lucide-react';

interface AccommodationAdvisorProps {
  currency: Currency;
  onSelectProperty: (property: DetailedAccommodation) => void;
  onIncludeInHoliday: (property: DetailedAccommodation) => void;
}

export interface AdvisorAnswers {
  firstVisit: 'first-time' | 'repeat' | 'unsure';
  travellerGroup: 'solo' | 'couple' | 'honeymoon' | 'family' | 'friends' | 'multi-gen' | 'business';
  budgetLevel: 'value' | 'comfortable' | 'premium' | 'luxury' | 'ultra-luxury';
  priorities: string[];
  style: 'hotel' | 'boutique-lodge' | 'guesthouse' | 'safari-lodge' | 'self-catering' | 'no-preference';
  timeSpent: 'sleeping' | 'balanced' | 'significant' | 'major-part';
}

export interface ScoredRecommendation {
  property: DetailedAccommodation;
  score: number;
  matchLabel: string;
  recommendationReason: string;
  whyItSuitsYou: string[];
  tradeOff: string;
}

const DEFAULT_ANSWERS: AdvisorAnswers = {
  firstVisit: 'first-time',
  travellerGroup: 'couple',
  budgetLevel: 'comfortable',
  priorities: ['walking-distance', 'boutique', 'romantic'],
  style: 'boutique-lodge',
  timeSpent: 'balanced',
};

const PRIORITY_OPTIONS = [
  { id: 'walking-distance', label: 'Walking distance to town' },
  { id: 'access-falls', label: 'Easy access to the Falls' },
  { id: 'luxury', label: '5-Star Luxury & Service' },
  { id: 'wildlife', label: 'Wildlife setting & Waterhole' },
  { id: 'family-friendly', label: 'Family-friendly facilities' },
  { id: 'privacy', label: 'Peace, quiet & privacy' },
  { id: 'river-views', label: 'Zambezi River views' },
  { id: 'swimming-pool', label: 'Swimming pool' },
  { id: 'restaurant', label: 'On-site dining' },
  { id: 'boutique', label: 'Boutique atmosphere' },
  { id: 'large-rooms', label: 'Large rooms or family space' },
  { id: 'self-catering', label: 'Self-catering flexibility' },
  { id: 'romantic', label: 'Romantic atmosphere' },
  { id: 'good-value', label: 'Good overall value' },
];

export const AccommodationAdvisor: React.FC<AccommodationAdvisorProps> = ({
  currency,
  onSelectProperty,
  onIncludeInHoliday,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<AdvisorAnswers>(DEFAULT_ANSWERS);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const togglePriority = (priorityId: string) => {
    setAnswers(prev => {
      const exists = prev.priorities.includes(priorityId);
      const updated = exists 
        ? prev.priorities.filter(p => p !== priorityId)
        : [...prev.priorities, priorityId];
      return { ...prev, priorities: updated };
    });
  };

  const resetAdvisor = () => {
    setAnswers(DEFAULT_ANSWERS);
    setCurrentStep(1);
    setIsCompleted(false);
  };

  // RECOMMENDATION SCORING ENGINE
  const getRecommendations = (): ScoredRecommendation[] => {
    const scoredList = ALL_ACCOMMODATIONS.map(property => {
      let score = 70; // baseline
      const whySuits: string[] = [];

      // 1. First Visit Scoring
      if (answers.firstVisit === 'first-time') {
        if (property.filterTags.includes('walking-distance') || property.slug === 'victoria-falls-safari-lodge') {
          score += 10;
          whySuits.push('Ideal for first-time visitors seeking easy transfers and iconic scenery.');
        }
      }

      // 2. Traveller Group Scoring
      if (answers.travellerGroup === 'couple' || answers.travellerGroup === 'honeymoon') {
        if (property.filterTags.includes('romantic-escapes') || property.badge === 'Romantic' || property.badge === 'Boutique') {
          score += 15;
          whySuits.push('Offers an intimate, serene setting designed for couples and romantic escapes.');
        }
      } else if (answers.travellerGroup === 'family' || answers.travellerGroup === 'multi-gen') {
        if (property.filterTags.includes('family-friendly') || property.category === 'Self-Catering') {
          score += 15;
          whySuits.push('Features spacious family suites, pool facilities, and child-friendly dining options.');
        }
      } else if (answers.travellerGroup === 'solo') {
        if (property.filterTags.includes('best-value') || property.filterTags.includes('walking-distance')) {
          score += 10;
          whySuits.push('Centrally located and highly accessible for solo adventurers.');
        }
      }

      // 3. Budget Level Scoring
      if (answers.budgetLevel === 'value') {
        if (property.priceFromUSD <= 200) {
          score += 20;
          whySuits.push(`Excellent rate starting at ${formatPrice(property.priceFromUSD)} / night without sacrificing quality.`);
        } else if (property.priceFromUSD > 350) {
          score -= 15;
        }
      } else if (answers.budgetLevel === 'comfortable') {
        if (property.priceFromUSD >= 180 && property.priceFromUSD <= 320) {
          score += 20;
          whySuits.push('Comfortable price point offering high hospitality standards and great amenities.');
        }
      } else if (answers.budgetLevel === 'premium' || answers.budgetLevel === 'luxury' || answers.budgetLevel === 'ultra-luxury') {
        if (property.priceFromUSD >= 300) {
          score += 20;
          whySuits.push('5-Star luxury service, fine dining, and exclusive riverfront or bridge vistas.');
        }
      }

      // 4. Priorities Matching
      answers.priorities.forEach(priority => {
        if (priority === 'walking-distance' && property.filterTags.includes('walking-distance')) {
          score += 10;
          whySuits.push(`Prime walkability (${property.distanceFromFalls}) to town and rainforest entrance.`);
        }
        if (priority === 'wildlife' && (property.slug === 'victoria-falls-safari-lodge' || property.category === 'Safari Lodge')) {
          score += 12;
          whySuits.push('Direct wildlife waterhole views right from your balcony.');
        }
        if (priority === 'river-views' && (property.slug === 'palm-river-hotel' || property.location.includes('River'))) {
          score += 12;
          whySuits.push('Peaceful upper Zambezi riverfront setting with sunset vistas.');
        }
        if (priority === 'boutique' && (property.category === 'Boutique Hotel' || property.category === 'Guest Lodge')) {
          score += 8;
          whySuits.push('Personalized, boutique service in a tranquil environment.');
        }
      });

      // 5. Preferred Style
      if (answers.style === 'safari-lodge' && property.category === 'Safari Lodge') score += 15;
      if (answers.style === 'boutique-lodge' && (property.category === 'Boutique Hotel' || property.category === 'Guest Lodge')) score += 15;
      if (answers.style === 'self-catering' && property.category === 'Self-Catering') score += 20;
      if (answers.style === 'hotel' && property.category === 'Boutique Hotel') score += 10;

      // Clean up whySuits deduplication & limit to 4
      const uniqueReasons = Array.from(new Set(whySuits)).slice(0, 4);
      if (uniqueReasons.length < 3) {
        uniqueReasons.push(property.whyWeRecommend.split('.')[0] + '.');
        uniqueReasons.push(`Location: ${property.location}`);
      }

      // Generate Personalized Reason Sentence
      let recReason = `We recommend ${property.name} because you are travelling as a ${answers.travellerGroup} on your ${answers.firstVisit === 'first-time' ? 'first visit' : 'trip'}, and it aligns with your budget and preferred atmosphere.`;
      
      if (property.slug === 'batonka-guest-lodge') {
        recReason = `We recommend Batonka Guest Lodge because you are travelling as a ${answers.travellerGroup}, looking for a peaceful boutique atmosphere, and wanting convenient town access at a very reasonable rate.`;
      } else if (property.slug === 'victoria-falls-safari-lodge') {
        recReason = `We recommend Victoria Falls Safari Lodge because it provides an iconic wildlife waterhole experience, magnificent African sunset views, and great resort facilities ideal for ${answers.travellerGroup} travellers.`;
      } else if (property.slug === 'ilala-lodge-hotel') {
        recReason = `We recommend Ilala Lodge Hotel because it is the closest hotel to Victoria Falls, allowing you to walk to the rainforest entry in minutes while enjoying award-winning dining.`;
      } else if (property.slug === 'victoria-falls-hotel') {
        recReason = `We recommend The Victoria Falls Hotel for its legendary 5-star colonial heritage, private pathway to the Falls, and world-class high tea on Stanley Terrace.`;
      } else if (property.slug === 'pioneers-victoria-falls') {
        recReason = `We recommend Pioneers Victoria Falls for its eco-boutique serenity, peaceful gardens, and excellent value for discerning travellers.`;
      } else if (property.slug === 'palm-river-hotel') {
        recReason = `We recommend The Palm River Hotel for an exclusive 5-star riverfront retreat along the upper Zambezi, perfect for a romantic or high-end escape.`;
      } else if (property.slug === 'lokuthula-lodges') {
        recReason = `We recommend Lokuthula Lodges because your group will love the space, full self-catering flexibility, and resort swimming pools surrounded by bushveld.`;
      }

      // Honest Trade-off
      let tradeOffNote = `Consider this if: You value quiet hospitality over large resort amenities.`;
      if (property.slug === 'batonka-guest-lodge') {
        tradeOffNote = `Consider this if: You value quiet atmosphere and personal service, noting that it sits in a quiet residential area 2.5 km from town.`;
      } else if (property.slug === 'victoria-falls-safari-lodge') {
        tradeOffNote = `Consider this if: You love an active safari setting, keeping in mind it sits 4.5 km from town (served by free hourly hotel shuttles).`;
      } else if (property.slug === 'ilala-lodge-hotel') {
        tradeOffNote = `Consider this if: Walkability to the Falls is your top priority, noting that grounds are slightly more compact than suburban lodges.`;
      } else if (property.slug === 'victoria-falls-hotel') {
        tradeOffNote = `Consider this if: You want grand historical luxury, keeping in mind it represents a higher financial investment.`;
      } else if (property.slug === 'palm-river-hotel') {
        tradeOffNote = `Consider this if: You prefer a tranquil river setting 5 km upstream rather than staying in the middle of town.`;
      } else if (property.slug === 'pioneers-victoria-falls') {
        tradeOffNote = `Consider this if: You appreciate quiet garden privacy 3 km from town with short 5-minute transfers for activities.`;
      } else if (property.slug === 'lokuthula-lodges') {
        tradeOffNote = `Consider this if: Self-catering flexibility is key, as you will manage your own meals or dine at nearby resort venues.`;
      }

      const matchLabel = score >= 95 ? '98% Match • Top Choice' : score >= 85 ? '92% Match • Excellent Fit' : '86% Match • Strong Choice';

      return {
        property,
        score,
        matchLabel,
        recommendationReason: recReason,
        whyItSuitsYou: uniqueReasons,
        tradeOff: tradeOffNote
      };
    });

    // Sort by score descending and return top 3 to 4
    return scoredList.sort((a, b) => b.score - a.score).slice(0, 4);
  };

  const recommendations = getRecommendations();

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden my-8" id="accommodation-advisor">
      
      {/* Advisor Header */}
      <div className="bg-[#0D2833] text-white p-6 sm:p-8 relative overflow-hidden border-b border-[#C9A66B]/30">
        <div className="max-w-3xl mx-auto text-center space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B5E8E]/60 text-[#E5C989] text-xs font-bold uppercase tracking-widest border border-[#C9A66B]/40">
            <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>INTERACTIVE ACCOMMODATION ADVISOR</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Find the Right Place to Stay
          </h2>

          <p className="text-xs sm:text-sm text-gray-200 font-light max-w-xl mx-auto leading-relaxed">
            Answer a few simple questions and our local specialist system will recommend the properties that best match your travel style, priorities and budget.
          </p>
        </div>

        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C9A66B_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* QUESTION WIZARD OR RESULTS VIEW */}
      {!isCompleted ? (
        <div className="p-6 sm:p-10 max-w-3xl mx-auto space-y-8">
          
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Step {currentStep} of 6</span>
              <span className="text-[#0B5E8E]">{Math.round((currentStep / 6) * 100)}% Completed</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#0B5E8E] to-[#C9A66B] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: First Visit */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">QUESTION 1</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                  Is this your first visit to Victoria Falls?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'first-time', label: 'Yes, this is my first visit', sub: 'We will prioritize well-located stays with easy excursion access.' },
                  { id: 'repeat', label: 'No, I’ve visited before', sub: 'Looking for a fresh perspective, quiet river setting, or boutique luxury.' },
                  { id: 'unsure', label: 'I’m not sure yet', sub: 'Recommend overall versatile properties suitable for all travellers.' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers(prev => ({ ...prev, firstVisit: item.id as any }))}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      answers.firstVisit === item.id
                        ? 'bg-[#0B5E8E]/10 border-[#0B5E8E] ring-2 ring-[#0B5E8E]/20 text-[#0B5E8E]'
                        : 'bg-white border-gray-200 hover:border-[#0B5E8E]/50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm">{item.label}</span>
                      {answers.firstVisit === item.id && <CheckCircle2 className="w-4 h-4 text-[#0B5E8E] shrink-0" />}
                    </div>
                    <p className="text-[11px] text-gray-500 font-light leading-relaxed">{item.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Traveller Group */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">QUESTION 2</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                  Who are you travelling with?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {[
                  { id: 'solo', label: 'Solo Traveller', icon: Users },
                  { id: 'couple', label: 'Couple', icon: Heart },
                  { id: 'honeymoon', label: 'Honeymoon', icon: Sparkles },
                  { id: 'family', label: 'Family with kids', icon: Home },
                  { id: 'friends', label: 'Friends', icon: Users },
                  { id: 'multi-gen', label: 'Multi-generational group', icon: Users },
                  { id: 'business', label: 'Business / Corporate', icon: Compass },
                ].map(item => {
                  const Icon = item.icon;
                  const isSel = answers.travellerGroup === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAnswers(prev => ({ ...prev, travellerGroup: item.id as any }))}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSel
                          ? 'bg-[#0B5E8E]/10 border-[#0B5E8E] ring-2 ring-[#0B5E8E]/20 text-[#0B5E8E] font-bold'
                          : 'bg-white border-gray-200 hover:border-[#0B5E8E]/50 text-gray-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSel ? 'text-[#0B5E8E]' : 'text-gray-400'}`} />
                        <span className="text-xs sm:text-sm">{item.label}</span>
                      </div>
                      {isSel && <CheckCircle2 className="w-4 h-4 text-[#0B5E8E] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Budget Level */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">QUESTION 3</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                  What is your preferred budget level?
                </h3>
                <p className="text-xs text-gray-500 font-light">
                  Indicative room rate ranges per night. No exact commitment required.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'value', title: 'Best Value', range: '$100 – $200 / night', desc: 'Clean, comfortable & reliable stays offering great value without unnecessary extras.' },
                  { id: 'comfortable', title: 'Comfortable', range: '$200 – $300 / night', desc: 'Boutique lodges & 4-star hotels with pools, garden verandas & excellent service.' },
                  { id: 'premium', title: 'Premium', range: '$300 – $450 / night', desc: 'Prime location, superior dining, waterhole views & elevated comfort.' },
                  { id: 'luxury', title: 'Luxury', range: '$450 – $650 / night', desc: '5-Star riverfront luxury, private butler access & high-end safari experiences.' },
                  { id: 'ultra-luxury', title: 'Ultra-Luxury', range: '$650+ / night', desc: 'Exclusive private villas, private game reserves & bespoke 5-star service.' },
                ].map(item => {
                  const isSel = answers.budgetLevel === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAnswers(prev => ({ ...prev, budgetLevel: item.id as any }))}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        isSel
                          ? 'bg-[#0B5E8E]/10 border-[#0B5E8E] ring-2 ring-[#0B5E8E]/20 text-[#0B5E8E]'
                          : 'bg-white border-gray-200 hover:border-[#0B5E8E]/50 text-gray-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm sm:text-base">{item.title}</span>
                          <span className="text-xs font-bold text-[#C9A66B] bg-[#FAF9F6] px-2.5 py-0.5 rounded-full border border-gray-200">
                            {item.range}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-light">{item.desc}</p>
                      </div>
                      {isSel && <CheckCircle2 className="w-5 h-5 text-[#0B5E8E] shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: What Matters Most (Multi-select) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">QUESTION 4</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                  What matters most to you?
                </h3>
                <p className="text-xs text-gray-500 font-light">Select all priorities that apply to your trip.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRIORITY_OPTIONS.map(opt => {
                  const isChecked = answers.priorities.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => togglePriority(opt.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-[#0B5E8E]/10 border-[#0B5E8E] text-[#0B5E8E] font-bold'
                          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 font-medium'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{opt.label}</span>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#0B5E8E] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Accommodation Style */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">QUESTION 5</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                  Which accommodation style do you prefer?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { id: 'boutique-lodge', title: 'Boutique Lodge / Guest Lodge', desc: 'Intimate, personalized service in lush garden surroundings.' },
                  { id: 'safari-lodge', title: 'Safari Lodge', desc: 'Authentic wilderness feel overlooking bush or waterhole.' },
                  { id: 'hotel', title: 'Full Service Hotel', desc: 'Central location, extensive resort facilities & 24hr service.' },
                  { id: 'self-catering', title: 'Self-Catering Lodge', desc: 'Independent 2/3 bedroom thatched units with kitchens.' },
                  { id: 'no-preference', title: 'No Preference', desc: 'Let our algorithm recommend the highest matching stay.' },
                ].map(item => {
                  const isSel = answers.style === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAnswers(prev => ({ ...prev, style: item.id as any }))}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                        isSel
                          ? 'bg-[#0B5E8E]/10 border-[#0B5E8E] ring-2 ring-[#0B5E8E]/20 text-[#0B5E8E]'
                          : 'bg-white border-gray-200 hover:border-[#0B5E8E]/50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-sm">{item.title}</span>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-[#0B5E8E]" />}
                      </div>
                      <p className="text-[11px] text-gray-500 font-light leading-relaxed">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Time Spent at Property */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider">QUESTION 6</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                  How much time do you expect to spend at the property?
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'sleeping', title: 'Mainly sleeping between activities', desc: 'We will be out on safaris, tours and cruises most of the day.' },
                  { id: 'balanced', title: 'A balanced mix of exploring and relaxing', desc: 'Mornings out on excursions, afternoons relaxing by the pool or garden.' },
                  { id: 'significant', title: 'A significant part of the holiday', desc: 'We want high dining quality, river views, or waterhole lounge decks.' },
                  { id: 'major-part', title: 'The property itself is a major part of the experience', desc: 'Seeking destination luxury where the resort setting defines the stay.' },
                ].map(item => {
                  const isSel = answers.timeSpent === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAnswers(prev => ({ ...prev, timeSpent: item.id as any }))}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSel
                          ? 'bg-[#0B5E8E]/10 border-[#0B5E8E] ring-2 ring-[#0B5E8E]/20 text-[#0B5E8E]'
                          : 'bg-white border-gray-200 hover:border-[#0B5E8E]/50 text-gray-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-serif font-bold text-sm sm:text-base block">{item.title}</span>
                        <p className="text-xs text-gray-500 font-light">{item.desc}</p>
                      </div>
                      {isSel && <CheckCircle2 className="w-5 h-5 text-[#0B5E8E] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#0B5E8E] transition-colors cursor-pointer px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Question</span>
              </button>
            ) : <div />}

            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer border border-[#C9A66B]/30"
            >
              <span>{currentStep === 6 ? 'See Personalised Recommendations' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
            </button>
          </div>

        </div>
      ) : (
        /* RESULTS VIEW */
        <div className="p-6 sm:p-10 space-y-10 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9A66B] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                <span>MATCH RESULTS GENERATED</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                Recommended Places to Stay for You
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light">
                Curated based on: <span className="font-medium text-[#0B5E8E]">{answers.travellerGroup}</span> • <span className="font-medium text-[#0B5E8E]">{answers.budgetLevel} budget</span> • <span className="font-medium text-[#0B5E8E]">{answers.firstVisit === 'first-time' ? 'First Visit' : 'Return Trip'}</span>
              </p>
            </div>

            <button
              onClick={resetAdvisor}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#0B5E8E] bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Adjust Preferences</span>
            </button>
          </div>

          {/* Recommended Property Cards List */}
          <div className="space-y-8">
            {recommendations.map((rec, idx) => {
              const prop = rec.property;

              return (
                <div 
                  key={prop.id}
                  className="bg-[#FAF9F6] rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 p-6 sm:p-8 space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* Left: Image & Quick Stats (5 cols) */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-sm">
                        <img 
                          src={prop.heroImage} 
                          alt={prop.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-[#0D2833] text-[#E5C989] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-[#C9A66B]/40">
                          {rec.matchLabel}
                        </div>
                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-[#0B5E8E] text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                          From {formatPrice(prop.priceFromUSD)} / night
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600 px-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-[#C9A66B] fill-[#C9A66B]" />
                          <span className="font-bold text-gray-800">{prop.rating}</span> ({prop.reviewCount} reviews)
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-[#C9A66B]" />
                          <span>{prop.distanceFromFalls}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Personalised Match & Explanations (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#C9A66B]">
                          {prop.category}
                        </div>
                        <h4 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                          {prop.name}
                        </h4>
                      </div>

                      {/* Explicit Recommendation Box */}
                      <div className="bg-white p-4 rounded-2xl border border-gray-200/90 space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B5E8E]">
                          <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                          <span>Why We Recommend This Stay For You</span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed font-light">
                          {rec.recommendationReason}
                        </p>
                      </div>

                      {/* Why It Suits You Bullet Points */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-[#0B5E8E] uppercase tracking-wider block">
                          Key Reasons It Suits Your Trip:
                        </span>
                        <ul className="space-y-1.5">
                          {rec.whyItSuitsYou.map((reason, rIdx) => (
                            <li key={rIdx} className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-[#3F6B3C] shrink-0 mt-0.5" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Trade-Off Callout Box */}
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Honest Local Advice: </span>
                          <span>{rec.tradeOff}</span>
                        </div>
                      </div>

                      {/* Action CTAs */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => onSelectProperty(prop)}
                          className="bg-[#0B5E8E] hover:bg-[#08486e] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>View Property Details</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                        </button>

                        <button
                          onClick={() => onIncludeInHoliday(prop)}
                          className="bg-[#E67E22] hover:bg-[#d36e17] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Include This Stay in My Holiday</span>
                        </button>

                        <a
                          href={`https://wa.me/263714701721?text=${encodeURIComponent(
                            `Hello Outbound Holidays,\n\nI’m interested in ${prop.name} and would like to know about availability, current pricing and whether you think it is a good fit for my Victoria Falls holiday.\n\nThank you.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Enquiry</span>
                        </a>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
