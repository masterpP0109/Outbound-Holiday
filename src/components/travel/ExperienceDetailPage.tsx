import React, { useState, useEffect } from 'react';
import { Experience, getExperienceById } from '../../data/experiencesData';
import { BungeeExperiencePage } from './BungeeExperiencePage';
import { WhatsAppEnquiryButton, WhatsAppSpecialistCTA, WhatsAppIcon } from '../common/WhatsAppButton';
import { getWhatsAppEnquiryUrl } from '../../utils/whatsapp';
import { 
  Clock, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  CalendarCheck, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Share2, 
  Check, 
  Info,
  MapPin,
  XCircle,
  Users,
  Compass
} from 'lucide-react';

interface ExperienceDetailPageProps {
  experience: Experience;
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
  onSelectRelatedExperience: (exp: Experience) => void;
  onBackToDirectory?: () => void;
}

export const ExperienceDetailPage: React.FC<ExperienceDetailPageProps> = ({
  experience,
  onOpenPlanHoliday,
  onNavigateHome,
  onSelectRelatedExperience,
  onBackToDirectory
}) => {
  // If this is the Bungee Jump experience, route to dedicated flagship component
  if (experience.id === 'bungee-jump' || experience.slug === 'bungee-jump') {
    return (
      <BungeeExperiencePage
        onOpenPlanHoliday={onOpenPlanHoliday}
        onNavigateHome={onNavigateHome}
        onSelectRelatedExperience={onSelectRelatedExperience}
        onBackToDirectory={onBackToDirectory}
      />
    );
  }

  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [includeTransfers, setIncludeTransfers] = useState(true);
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0, 1]);

  useEffect(() => {
    document.title = `${experience.title} | Victoria Falls Experience Guide | Outbound Holidays`;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [experience.id]);

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

  const relatedList = experience.relatedIds
    .map(id => getExperienceById(id))
    .filter((e): e is Experience => e !== undefined);

  const transferPricePerPerson = includeTransfers ? 15 : 0;
  const estimatedTotal = (experience.priceAmount + transferPricePerPerson) * guestCount;

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
            <span>Victoria Falls Local Specialist Selection</span>
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

      {/* 2. Editorial Hero Section */}
      <section className="relative bg-[#0D2833] text-white overflow-hidden py-16 sm:py-24 lg:py-28">
        <div className="absolute inset-0 z-0">
          <img 
            src={experience.featuredImage} 
            alt={experience.title}
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/70 to-[#0D2833]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/20 backdrop-blur-md border border-[#C9A66B]/50 text-[#E5C989] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{experience.badge || "Victoria Falls Premium Travel Feature"}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              {experience.title}
            </h1>

            {/* Subtitle / Short Description */}
            <p className="text-lg sm:text-xl text-gray-200 font-light leading-relaxed max-w-2xl">
              {experience.subtitle || experience.shortDescription}
            </p>

            {/* Hero Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={getWhatsAppEnquiryUrl(experience.title)}
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
                <span>Include in Custom Holiday</span>
              </button>
            </div>

            {/* Quick Fact Strip */}
            <div className="pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2 text-gray-200">
                <Clock className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{experience.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <ShieldCheck className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{experience.fromPrice}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Star className="w-4 h-4 text-[#E5C989] shrink-0" />
                <span className="font-medium">Local Specialist Verified</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <MapPin className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{experience.location || "Victoria Falls Region"}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Story Content (8 Cols) */}
          <main className="lg:col-span-8 space-y-12">
            
            {/* Overview & Why We Recommend It */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Experience Overview
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  About {experience.title}
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                {experience.fullOverview}
              </p>

              {/* Specialist Quote Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[#0B5E8E]">
                  <Star className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
                  <span>Why We Recommend It</span>
                </div>
                <p className="text-sm sm:text-base text-gray-700 italic font-serif leading-relaxed">
                  "{experience.whyWeRecommend}"
                </p>
              </div>
            </section>

            {/* Highlights */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  Key Features
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  Experience Highlights
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {experience.highlights.map((h, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Step-by-Step Experience Journey (If steps provided) */}
            {experience.steps && experience.steps.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                    The Experience Journey
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                    What To Expect Step by Step
                  </h2>
                </div>

                <div className="space-y-6">
                  {experience.steps.map((st) => (
                    <div key={st.stepNumber} className="bg-[#FAF9F6] rounded-2xl p-5 border border-gray-200/70 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {st.image && (
                        <div className="md:col-span-4 h-40 rounded-xl overflow-hidden relative">
                          <img src={st.image} alt={st.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className={st.image ? "md:col-span-8 space-y-1.5" : "md:col-span-12 space-y-1.5"}>
                        <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
                          Step {st.stepNumber} {st.time ? `• ${st.time}` : ''}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#0B5E8E]">{st.title}</h3>
                        <p className="text-xs text-gray-700 leading-relaxed">{st.description}</p>
                        {st.highlight && (
                          <span className="inline-block text-[11px] font-semibold text-[#0B5E8E] bg-[#0B5E8E]/10 px-2.5 py-0.5 rounded-full mt-1">
                            {st.highlight}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Photo Gallery */}
            {experience.galleryImages.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                    Visual Gallery
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                    Experience Gallery
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {experience.galleryImages.map((imgUrl, idx) => (
                    <div key={idx} className="h-48 rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
                      <img 
                        src={imgUrl} 
                        alt={`${experience.title} gallery photo ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Whats Included */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#0B5E8E] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0B5E8E]" />
                  <span>What's Included</span>
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                  {experience.whatsIncluded.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Whats Excluded / Good to Know */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#0B5E8E] flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#C9A66B]" />
                  <span>Practical Information & Exclusions</span>
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                  {experience.whatsExcluded && experience.whatsExcluded.map((item, idx) => (
                    <li key={`ex-${idx}`} className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                      <span className="text-gray-500">{item}</span>
                    </li>
                  ))}
                  {experience.goodToKnow.map((item, idx) => (
                    <li key={`gk-${idx}`} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B5E8E] mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

            </div>

            {/* Local Expert Tip Callout */}
            {experience.localExpertTip && (
              <section className="rounded-3xl bg-gradient-to-br from-[#0B5E8E] to-[#0D2833] text-white p-6 sm:p-8 shadow-xl border border-[#C9A66B]/40">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#C9A66B]/20 border border-[#C9A66B]/50 flex items-center justify-center text-[#E5C989] shrink-0 mt-1">
                    <Star className="w-5 h-5 text-[#E5C989]" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#E5C989]">
                      ⭐ Local Specialist Tip
                    </span>
                    <p className="text-sm text-gray-200 leading-relaxed font-serif italic">
                      "{experience.localExpertTip}"
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* FAQs */}
            {experience.faqs.length > 0 && (
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
                  {experience.faqs.map((faq, idx) => {
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
            )}

            {/* Related Experiences */}
            {relatedList.length > 0 && (
              <section className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                    Recommended Combinations
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                    Related Experiences
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedList.map((rel) => (
                    <div 
                      key={rel.id}
                      onClick={() => onSelectRelatedExperience(rel)}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="h-36 overflow-hidden relative">
                        <img 
                          src={rel.featuredImage} 
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-2 right-2 bg-[#0D2833]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                          {rel.fromPrice}
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        <h4 className="font-serif font-bold text-sm text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug">
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
          <aside id="experience-booking-sidebar" className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-lg space-y-6">
              <div className="space-y-1 border-b border-gray-200 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Experience Rate</span>
                <div className="text-3xl font-bold font-serif text-[#0B5E8E]">
                  {experience.fromPrice} <span className="text-xs font-normal text-gray-500">per person</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>Duration: {experience.duration}</span>
                </div>
              </div>

              {/* Calculator Form */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preferred Date</label>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Number of Guests</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs bg-white"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-[#FAF9F6] border border-gray-200">
                  <span className="font-semibold text-gray-700">Include Return Hotel Transfer (+$15/pp)</span>
                  <input 
                    type="checkbox" 
                    checked={includeTransfers} 
                    onChange={(e) => setIncludeTransfers(e.target.checked)}
                    className="w-4 h-4 accent-[#0B5E8E] cursor-pointer"
                  />
                </label>

                <div className="p-3 rounded-xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 flex items-center justify-between">
                  <span className="font-bold text-gray-700">Estimated Price:</span>
                  <span className="font-serif font-bold text-base text-[#0B5E8E]">US${estimatedTotal}</span>
                </div>

                <WhatsAppEnquiryButton 
                  experienceName={experience.title}
                  date={selectedDate}
                  guests={guestCount}
                  additionalNotes={includeTransfers ? "Hotel return transfer requested" : undefined}
                  buttonText="Enquire About Availability"
                  variant="whatsapp-green"
                />

                <WhatsAppSpecialistCTA topic={experience.title} />
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#0B5E8E]">
                  <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
                  <span>Outbound Guarantee</span>
                </div>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  All experiences are operated by licensed, vetted Victoria Falls specialists with 100% safety track records and full insurance.
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>

    </div>
  );
};

